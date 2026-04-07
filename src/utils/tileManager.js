import { PowerCache, PowerEventBus, PowerMemoizer, PowerPool, PowerQueue, PowerScheduler } from 'performance-helpers';

const featureMemoId = new WeakMap();
let nextFeatureMemoId = 0;
const getFeatureMemoKey = (feature) => {
  if (!featureMemoId.has(feature)) {
    featureMemoId.set(feature, String(nextFeatureMemoId++));
  }
  return featureMemoId.get(feature);
};

/**
 * @typedef {Object} TileManagerOptions
 * @property {maplibregl.Map} map MapLibre map instance.
 * @property {maplibregl.VectorTileSource} source Vector tile source instance.
 * @property {string} [sourceLayer] Source layer name for vector queries.
 * @property {string} [fid] Feature identifier property name.
 * @property {number} [tileSize] Tile size in pixels.
 * @property {number} [tolerance] Simplification tolerance base value.
 * @property {number} [cacheSize] Maximum cache size for tile pieces and labels.
 * @property {string} [units] Units for area calculations, e.g. 'meters'.
 * @property {number} [debugLevel] Debug verbosity level for PowerLogger output (0..3).
 * @property {number} [gatherPoolSize] Number of gather worker threads.
 * @property {Function} [tileWorkerSource] Inline worker factory for tile processing.
 * @property {Function} [gatherWorkerSource] Inline worker factory for gather processing.
 */

/**
 * TileManager collects source features, distributes work to inline workers,
 * and applies diff updates back to the GeoJSON source.
 * @class
 */
export default class TileManager {
  /**
   * @param {TileManagerOptions} options
   */
  constructor({
    map,
    source,
    sourceLayer,
    fid = 'id',
    tileSize = 512,
    tolerance = 0.00001,
    cacheSize = 5000,
    units = 'meters',
    postDelay = 0,
    debugLevel = 0,
    tilePoolSize = 6,
    gatherPoolSize = 4,
    tileWorkerSource = null,
    gatherWorkerSource = null,
  }) {
    this.map = map;
    this.source = source;
    this.sourceLayer = sourceLayer;
    this.fid = fid;
    this.tileSize = tileSize;
    this.tolerance = tolerance;
    this.units = units;
    this.postDelay = Number.isFinite(Number(postDelay)) ? Math.max(0, Number(postDelay)) : 0;
    this.debugLevel = Number.isFinite(Number(debugLevel))
      ? Math.max(0, Math.min(3, Math.floor(Number(debugLevel))))
      : 0;

    this._sourceLoaded = false;
    this._pendingTiles = new Set();
    this._tileQueue = new PowerQueue(32);
    this._tileDrainScheduled = false;
    this._tileDrainTimeout = null;
    this._tileScheduler = new PowerScheduler(() => {
      this._tileDrainScheduled = false;
      this._drainTileQueue();
    });
    this._gatherScheduled = false;
    this._diffScheduled = false;
    this._diffAdd = new Map();
    this._diffRemove = new Set();
    this._bus = new PowerEventBus();
    this._disposed = false;
    this._changedGroups = new Set();
    this._tileGroups = new Map();
    this._groupToTiles = new Map();

    this.piecesCache = new PowerCache({
      maxEntries: cacheSize,
      maxWeight: cacheSize * 5000,
      weightFn: (entry) => entry.size || 0,
      onEvict: (key) => {
        this._tileFingerprints?.delete(key);
        this._removeTileGroups(key);
      },
    });

    this._tileFingerprints = new PowerCache({
      maxEntries: cacheSize,
      maxWeight: cacheSize,
      weightFn: () => 1,
      onEvict: (key) => {
        this.piecesCache?.delete(key);
      },
    });

    this._computeTileFingerprintMemo = new PowerMemoizer(
      (features) => this._computeTileFingerprintBody(features),
      {
        cacheOptions: { maxEntries: cacheSize },
        keyResolver: (features) =>
          Array.isArray(features)
            ? features.map((feature) => getFeatureMemoKey(feature)).join('|')
            : String(features),
      }
    );

    this.labelsCache = new PowerCache({
      maxEntries: cacheSize,
      maxWeight: cacheSize * 5000,
      weightFn: (entry) => (Array.isArray(entry) ? entry.length : 0),
    });

    const tileSource = tileWorkerSource;
    const gatherSource = gatherWorkerSource;

    this.tilePool = new PowerPool(tileSource, {
      size: tilePoolSize,
      minSize: 1,
      maxSize: tilePoolSize,
      taskQueue: true,
      lazy: false,
    });

    this.gatherPool = new PowerPool(gatherSource, {
      size: gatherPoolSize,
      minSize: 1,
      maxSize: gatherPoolSize,
      taskQueue: true,
      lazy: false,
    });

    this.tilePool.addEventListener('message', (e) => this._onTileMessage(e));
    this.tilePool.addEventListener('idle', () => {
      if (this._sourceLoaded) this._scheduleGather();
    });

    this.gatherPool.addEventListener('message', (e) => this._onGatherMessage(e));
    this.gatherPool.addEventListener('idle', () => this._scheduleDiffFlush());

    this._bus.on('label', (collection) => this._collectLabelDiff(collection));
    this._bus.on('commit', () => this._scheduleDiffFlush());
  }

  /**
   * Handle MapLibre `sourcedata` events and enqueue tile features for worker processing.
   * @param {Object} event MapLibre source data event
   * @returns {void}
   */
  handleSourceData(event) {
    if (this._disposed || !event || event.sourceId !== this.source.id) return;
    if (event.isSourceLoaded) this._sourceLoaded = true;

    const canonical = event.tile?.tileID?.canonical;
    if (!canonical) return;

    const unique = `${canonical.z}|${canonical.x}|${canonical.y}`;
    let tileFeatures = [];
    const tileOptions = this.source.type === 'vector' ? { sourceLayer: this.sourceLayer } : {};
    const queryTileFeatures =
      typeof event.tile?.querySourceFeatures === 'function'
        ? (opts) => {
            const features = [];
            event.tile.querySourceFeatures(features, opts);
            return features;
          }
        : null;
    const queryMapFeatures =
      typeof this.map.querySourceFeatures === 'function'
        ? (opts) => this.map.querySourceFeatures(this.source.id, opts)
        : null;

    const queryResult = queryTileFeatures
      ? queryTileFeatures(tileOptions)
      : queryMapFeatures
        ? queryMapFeatures(tileOptions)
        : null;
    if (!Array.isArray(queryResult)) return;
    tileFeatures = queryResult;
    if (!tileFeatures.length) return;

    const fingerprint = this._computeTileFingerprint(tileFeatures);
    const existingFingerprint = this._tileFingerprints.get(unique);
    const unchanged = existingFingerprint != null && existingFingerprint === fingerprint;
    const hasCachedTile = this.piecesCache.has(unique);

    if (this._pendingTiles.has(unique) && unchanged) return;
    if (hasCachedTile && unchanged) return;

    if (hasCachedTile) {
      // If a cached payload exists but we cannot confirm it is unchanged,
      // invalidate it explicitly rather than reusing potentially stale results.
      this.piecesCache.delete(unique);
    }

    this._tileFingerprints.set(unique, fingerprint);

    const tolerance = this.tolerance * Math.pow(10, -0.301 * canonical.z + 5.19);
    const payload = {
      collection: {
        type: 'FeatureCollection',
        features: tileFeatures.map((feature, index) => ({
          id: feature.properties?.[this.fid] ?? feature.id,
          geometry: feature.geometry,
          properties: {
            ...feature.properties,
            _index: `${unique}|${index}`,
            _tile: unique,
            _group: feature.properties?.[this.fid],
          },
        })),
      },
      tolerance,
      unique,
      tileSize: this.tileSize,
      debugLevel: this.debugLevel,
    };

    this._pendingTiles.add(unique);
    this._tileQueue.push(payload);
    this._scheduleTileDrain();
  }

  /**
   * Compute a lightweight fingerprint for a tile's feature payload.
   * @private
   * @param {Array<Object>} features
   * @returns {string}
   */
  _computeTileFingerprint(features) {
    return this._computeTileFingerprintMemo(features);
  }

  _computeTileFingerprintBody(features) {
    let hash = 2166136261;
    const update = (value) => {
      const str = String(value);
      for (let i = 0; i < str.length; i += 1) {
        hash ^= str.charCodeAt(i);
        hash = (hash * 16777619) >>> 0;
      }
    };

    for (const feature of features) {
      const id = feature.properties?.[this.fid] ?? feature.id;
      const geom = feature.geometry;
      let coordCount = 0;
      if (geom && geom.coordinates) {
        coordCount = this._countCoordinates(geom.coordinates);
      }
      update(id);
      update(geom?.type || 'none');
      update(coordCount);
      if (feature.properties && typeof feature.properties === 'object') {
        const keys = Object.keys(feature.properties).sort();
        for (const key of keys) {
          update(key);
          update(':');
          update(this._serializePropertyValue(feature.properties[key]));
          update('|');
        }
      }
    }
    return hash.toString(16).padStart(8, '0');
  }

  _countCoordinates(coords) {
    if (!Array.isArray(coords)) return 0;
    let count = 0;
    if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
      for (const chunk of coords) {
        count += this._countCoordinates(chunk);
      }
      return count;
    }
    return coords.length;
  }

  _removeTileGroups(unique) {
    const groups = this._tileGroups.get(unique);
    if (!groups) return;
    for (const groupId of groups) {
      const tileSet = this._groupToTiles.get(groupId);
      if (!tileSet) continue;
      tileSet.delete(unique);
      if (tileSet.size === 0) {
        this._groupToTiles.delete(groupId);
      }
    }
    this._tileGroups.delete(unique);
  }

  _serializePropertyValue(value) {
    if (value === null || value === undefined) return String(value);
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) return `array:${value.length}`;
    if (typeof value === 'object') return `object:${Object.keys(value).length}`;
    return String(value);
  }

  /**
   * Link the manager to the auxiliary GeoJSON source that receives diff updates.
   * @param {maplibregl.GeoJSONSource} gjSource
   * @returns {void}
   */
  setGeoJsonSource(gjSource) {
    this.gjSource = gjSource;
  }

  /**
   * Shutdown worker pools and clear all caches.
   * @returns {void}
   */
  dispose() {
    this._disposed = true;
    this._tileScheduler.cancel();
    if (this._tileDrainTimeout) {
      clearTimeout(this._tileDrainTimeout);
      this._tileDrainTimeout = null;
    }
    this._tileDrainScheduled = false;
    this._gatherScheduled = false;
    this._diffScheduled = false;
    try {
      this.tilePool.shutdown();
    } catch (e) {
      /* ignore */
    }
    try {
      this.gatherPool.shutdown();
    } catch (e) {
      /* ignore */
    }
    this.piecesCache.clear();
    this.labelsCache.clear();
    this._tileFingerprints.clear();
    this._pendingTiles.clear();
    this._tileQueue.clear();
    this._changedGroups.clear();
    this._tileGroups.clear();
    this._groupToTiles.clear();
    this._bus.clear();
    this.gjSource = null;
  }

  /**
   * Schedule a microtask to flush the pending tile queue.
   * @private
   * @returns {void}
   */
  _scheduleTileDrain() {
    if (this._tileDrainScheduled || this._tileDrainTimeout) return;
    this._tileDrainScheduled = true;
    if (this.postDelay > 0) {
      this._tileDrainTimeout = setTimeout(() => {
        this._tileDrainTimeout = null;
        this._tileDrainScheduled = false;
        this._drainTileQueue();
      }, this.postDelay);
      return;
    }
    this._tileScheduler.schedule();
  }

  /**
   * Drain the tile queue and post batched messages to the tile worker pool.
   * @private
   * @returns {void}
   */
  _drainTileQueue() {
    const items = [];
    let task;
    while ((task = this._tileQueue.shift()) !== undefined) {
      items.push({ message: task });
    }
    if (items.length > 0) {
      this.tilePool.postMessageBatch(items, { zeroCopy: true });
    }
  }

  /**
   * Handle replies from tile workers and enqueue processed pieces for gathering.
   * @private
   * @param {MessageEvent} event Worker message event
   * @returns {void}
   */
  _onTileMessage(event) {
    const incoming = event.data;
    if (!incoming || incoming.type !== 'simplified') return;

    const { unique, type, ...payload } = incoming;
    this._pendingTiles.delete(unique);
    this._removeTileGroups(unique);
    this.piecesCache.set(unique, payload);
    this._tileGroups.set(unique, new Set());

    for (const groupId of Object.keys(payload)) {
      const tileSet = this._groupToTiles.get(groupId) || new Set();
      tileSet.add(unique);
      this._groupToTiles.set(groupId, tileSet);
      this._tileGroups.get(unique).add(groupId);
      this._changedGroups.add(groupId);
    }

    if (this._sourceLoaded) this._scheduleGather();
  }

  /**
   * Schedule a gather cycle after tile processing completes.
   * @private
   * @returns {void}
   */
  _scheduleGather() {
    if (this._gatherScheduled) return;
    this._gatherScheduled = true;
    queueMicrotask(() => {
      this._gatherScheduled = false;
      this._dispatchGather();
    });
  }

  /**
   * Dispatch the gathered piece payloads to the gather worker pool.
   * @private
   * @returns {void}
   */
  _dispatchGather() {
    if (this._disposed) return;

    let pieces;
    if (this._changedGroups.size > 0) {
      const relevantTiles = new Set();
      for (const groupId of this._changedGroups) {
        const tileSet = this._groupToTiles.get(groupId);
        if (tileSet) {
          for (const unique of tileSet) relevantTiles.add(unique);
        }
      }

      if (relevantTiles.size === 0) {
        this._changedGroups.clear();
        return;
      }

      pieces = {};
      for (const unique of relevantTiles) {
        const payload = this.piecesCache.get(unique);
        if (payload) {
          pieces[unique] = payload;
        }
      }

      this._changedGroups.clear();
    } else {
      const entries = Array.from(this.piecesCache.entries('LRU'));
      if (!entries.length) return;
      pieces = Object.fromEntries(entries);
    }

    if (!pieces || !Object.keys(pieces).length) return;

    const gatherResult = this.gatherPool.postMessage(
      {
        pieces,
        tolerance: this.tolerance,
        unit: this.units,
        tileSize: this.tileSize,
        debugLevel: this.debugLevel,
      },
      undefined,
      { zeroCopy: true, awaitResponse: true }
    );
    if (gatherResult && typeof gatherResult.then === 'function') {
      gatherResult.catch(() => {});
    }
  }

  /**
   * Handle worker events from the gather pool and route label diffs or commit signals.
   * @private
   * @param {MessageEvent} event Worker message event
   * @returns {void}
   */
  _onGatherMessage(event) {
    const incoming = event.data;
    if (!incoming) return;
    if (incoming.type === 'commit') {
      this._bus.emit('commit');
      return;
    }
    if (incoming.id != null) {
      this._bus.emit('label', incoming);
    }
  }

  /**
   * Collect label feature diffs and prepare update sets for the GeoJSON source.
   * @private
   * @param {Object} collection Label collection message payload
   * @returns {void}
   */
  _collectLabelDiff(collection) {
    const id = collection.id;
    const features = Array.isArray(collection.features) ? collection.features : [];
    if (this.labelsCache.hasEqual(id, features)) return;

    const existing = this.labelsCache.get(id);
    if (existing) {
      existing.forEach((feature) => {
        if (feature?.properties?._index) this._diffRemove.add(feature.properties._index);
      });
    }

    features.forEach((feature) => {
      if (feature?.properties?._index) {
        this._diffAdd.set(feature.properties._index, feature);
      }
    });

    this.labelsCache.set(id, features);
  }

  /**
   * Schedule a diff flush after label diffs have been collected.
   * @private
   * @returns {void}
   */
  _scheduleDiffFlush() {
    if (this._diffScheduled) return;
    this._diffScheduled = true;
    queueMicrotask(() => {
      this._diffScheduled = false;
      this._flushDiffs();
    });
  }

  /**
   * Flush accumulated add/remove feature diffs to the GeoJSON source.
   * @private
   * @returns {void}
   */
  _flushDiffs() {
    if (this._disposed || !this.gjSource || (this._diffAdd.size === 0 && this._diffRemove.size === 0)) return;
    const add = [...this._diffAdd.values()];
    const remove = [...this._diffRemove];
    this._diffAdd.clear();
    this._diffRemove.clear();
    this.gjSource.updateData({ add, remove });
  }

}
