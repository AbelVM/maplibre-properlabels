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
 * @property {number} [gatherTimeout] Timeout in milliseconds for gather worker responses.
 * @property {number} [mapFallbackCooldown] Minimum milliseconds between fallback map-wide queries.
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
    tolerance = 0.000001,
    cacheSize = 5000,
    units = 'meters',
    postDelay = 0,
    debugLevel = null,
    debuglevel = null,
    tilePoolSize = 6,
    gatherPoolSize = 4,
    gatherTimeout = 60000,
    mapFallbackCooldown = 150,
    tileTimeout = null,
    tileMaxRetries = 1,
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
    this.gatherPoolSize = Math.max(1, Number.isFinite(Number(gatherPoolSize)) ? Math.floor(Number(gatherPoolSize)) : 1);
    this.postDelay = Number.isFinite(Number(postDelay)) ? Math.max(0, Number(postDelay)) : 0;
    const rawDebugLevel = debugLevel != null ? debugLevel : debuglevel;
    this.debugLevel = Number.isFinite(Number(rawDebugLevel))
      ? Math.max(0, Math.min(3, Math.floor(Number(rawDebugLevel))))
      : 0;
    this.gatherTimeout = Number.isFinite(Number(gatherTimeout))
      ? Math.max(0, Number(gatherTimeout))
      : 30000;
    this.tileTimeout = Number.isFinite(Number(tileTimeout))
      ? Math.max(0, Number(tileTimeout))
      : this.gatherTimeout;
    this.tileMaxRetries = Number.isFinite(Number(tileMaxRetries))
      ? Math.max(0, Math.floor(Number(tileMaxRetries)))
      : 1;
    this.mapFallbackCooldown = Number.isFinite(Number(mapFallbackCooldown))
      ? Math.max(0, Number(mapFallbackCooldown))
      : 150;
    this._lastMapFallbackAt = 0;
    this._lastMapFallbackUnique = null;
    this._sourceLoaded = false;
    this._pendingTiles = new Set();
    this._tilePendingMeta = new Map();
    this._tileCorrelationSeq = 0;
    this._tileTimeoutHandle = null;
    this._tileQueue = new PowerQueue(32);
    this._tileDrainScheduled = false;
    this._tileDrainTimeout = null;
    this._tileScheduler = new PowerScheduler(() => {
      this._tileDrainScheduled = false;
      this._drainTileQueue();
    });
    this._gatherRound = 0;
    this._diffScheduler = new PowerScheduler(() => this._runDiffFlush());
    this._gatherScheduled = false;
    this._diffScheduled = false;
    this._diffFlushInProgress = false;
    this._diffFlushQueued = false;
    this._diffFlushQueuedGatherRound = 0;
    this._currentFlushGatherRound = 0;
    this._diffFlushQueuedTimestamp = 0;
    this._currentFlushTimestamp = 0;
    this._diffRetryHandle = null;
    this._diffRetryCount = 0;
    this._lastGatherRound = 0;
    this._lastGatherTimestamp = 0;
    this._pendingGatherRounds = new Map();
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
      debugLevel: this.debugLevel,
    });

    this.gatherPool = new PowerPool(gatherSource, {
      size: gatherPoolSize,
      minSize: 1,
      maxSize: gatherPoolSize,
      taskQueue: true,
      lazy: false,
      debugLevel: this.debugLevel,
    });

    this.tilePool.addEventListener('message', (e) => this._onTileMessage(e));
    this.tilePool.addEventListener('error', () => this._expirePendingTiles(true));
    this.tilePool.addEventListener('messageerror', () => this._expirePendingTiles(true));
    this.tilePool.addEventListener('idle', () => {
      if (this._sourceLoaded && this._changedGroups.size > 0) this._scheduleGather();
    });

    this.gatherPool.addEventListener('message', (e) => this._onGatherMessage(e));
    this.gatherPool.addEventListener('idle', () => this._scheduleDiffFlush());

    this._bus.on('label', (collection) => this._collectLabelDiff(collection));
    this._bus.on('commit', (commit) => this._scheduleDiffFlush(commit));
  }

  /**
   * Handle MapLibre `sourcedata` events and enqueue tile features for worker processing.
   * @param {Object} event MapLibre source data event
   * @returns {void}
   */
  handleSourceData(event) {
    if (this._disposed || !event || event.sourceId !== this.source.id) return;
    if (typeof event.isSourceLoaded === 'boolean') {
      const wasSourceLoaded = this._sourceLoaded;
      this._sourceLoaded = event.isSourceLoaded;
      if (!wasSourceLoaded && this._sourceLoaded && this._changedGroups.size > 0) {
        this._scheduleGather();
      }
    }

    const canonical = event.tile?.tileID?.canonical;
    if (!canonical) return;

    const tileUnique = `${canonical.z}|${canonical.x}|${canonical.y}`;
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

    const usingMapFallback = !queryTileFeatures && Boolean(queryMapFeatures);
    let unique = tileUnique;
    if (usingMapFallback) {
      unique = `map|z${canonical.z}`;
      const now = Date.now();
      if (
        this._lastMapFallbackUnique === unique &&
        now - this._lastMapFallbackAt < this.mapFallbackCooldown
      ) {
        return;
      }
      this._lastMapFallbackUnique = unique;
      this._lastMapFallbackAt = now;
    }

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

    // https://wiki.openstreetmap.org/wiki/Zoom_levels    
    // Adjust simplification tolerance based on zoom level to balance detail and performance. 
    const tolerance = Math.max(this.tolerance, Math.pow(10, -0.301 * canonical.z + 2.56) / this.tileSize);

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

    payload.correlationId = `${unique}:${++this._tileCorrelationSeq}`;

    this._pendingTiles.add(unique);
    this._tilePendingMeta.set(unique, {
      correlationId: payload.correlationId,
      payload,
      retries: 0,
      deadline: Date.now() + Math.max(1, this.tileTimeout),
    });
    this._tileQueue.push(payload);
    this._schedulePendingTileTimeoutCheck();
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
    this._diffScheduler.cancel();
    if (this._tileDrainTimeout) {
      clearTimeout(this._tileDrainTimeout);
      this._tileDrainTimeout = null;
    }
    if (this._tileTimeoutHandle) {
      clearTimeout(this._tileTimeoutHandle);
      this._tileTimeoutHandle = null;
    }
    if (this._diffRetryHandle) {
      clearTimeout(this._diffRetryHandle);
      this._diffRetryHandle = null;
    }
    for (const timeoutId of this._pendingGatherRounds.values()) {
      clearTimeout(timeoutId);
    }
    this._pendingGatherRounds.clear();
    this._tileDrainScheduled = false;
    this._gatherScheduled = false;
    this._diffScheduled = false;
    try {
      this.tilePool.shutdown();
    } catch {
      /* ignore */
    }
    try {
      this.gatherPool.shutdown();
    } catch {
      /* ignore */
    }
    this.piecesCache.clear();
    this.labelsCache.clear();
    this._tileFingerprints.clear();
    this._pendingTiles.clear();
    this._tilePendingMeta.clear();
    this._tileQueue.clear();
    this._changedGroups.clear();
    this._tileGroups.clear();
    this._groupToTiles.clear();
    this._bus.clear();
    this.gjSource = null;
  }

  _schedulePendingTileTimeoutCheck() {
    if (this._tileTimeoutHandle || this._tilePendingMeta.size === 0 || this.tileTimeout <= 0) return;
    const delay = Math.max(25, Math.min(1000, Math.floor(this.tileTimeout / 2) || 250));
    this._tileTimeoutHandle = setTimeout(() => {
      this._tileTimeoutHandle = null;
      this._expirePendingTiles(false);
    }, delay);
  }

  _expirePendingTiles(force = false) {
    if (this._disposed || this._tilePendingMeta.size === 0) return;
    const now = Date.now();
    let requeue = false;

    for (const [unique, pending] of this._tilePendingMeta.entries()) {
      if (!force && pending.deadline > now) continue;
      if (pending.retries < this.tileMaxRetries) {
        pending.retries += 1;
        pending.deadline = now + Math.max(1, this.tileTimeout);
        pending.correlationId = `${unique}:${++this._tileCorrelationSeq}`;
        pending.payload = {
          ...pending.payload,
          correlationId: pending.correlationId,
        };
        this._tileQueue.push(pending.payload);
        requeue = true;
      } else {
        this._tilePendingMeta.delete(unique);
        this._pendingTiles.delete(unique);
      }
    }

    if (requeue) {
      this._scheduleTileDrain();
    }
    if (this._tilePendingMeta.size > 0) {
      this._schedulePendingTileTimeoutCheck();
    }
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

    const { unique, correlationId, ...payload } = incoming;
    const pending = this._tilePendingMeta.get(unique);
    if (pending) {
      if (correlationId != null && pending.correlationId !== correlationId) {
        return;
      }
      this._tilePendingMeta.delete(unique);
      this._pendingTiles.delete(unique);
    } else if (this._pendingTiles.has(unique)) {
      this._pendingTiles.delete(unique);
    } else if (correlationId != null) {
      // Ignore stale retried responses after pending state was already cleared.
      return;
    }

    if (this._tilePendingMeta.size === 0 && this._tileTimeoutHandle) {
      clearTimeout(this._tileTimeoutHandle);
      this._tileTimeoutHandle = null;
    }

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

    const gatherRound = ++this._gatherRound;
    this._scheduleGatherTimeout(gatherRound);
    this.gatherPool.postMessage(
      {
        pieces,
        tolerance: this.tolerance,
        unit: this.units,
        tileSize: this.tileSize,
        gatherPoolSize: this.gatherPoolSize,
        debugLevel: this.debugLevel,
        gatherRound,
      },
      undefined,
      { zeroCopy: true }
    );
  }

  _scheduleGatherTimeout(gatherRound) {
    if (this.gatherTimeout <= 0) return;
    const timeoutId = setTimeout(() => {
      if (!this._pendingGatherRounds.has(gatherRound)) return;
      this._pendingGatherRounds.delete(gatherRound);
      this._scheduleDiffFlush({ gatherRound, timestamp: Date.now() });
    }, this.gatherTimeout);
    this._pendingGatherRounds.set(gatherRound, timeoutId);
  }

  _clearGatherTimeout(gatherRound) {
    const timeoutId = this._pendingGatherRounds.get(gatherRound);
    if (!timeoutId) return;
    clearTimeout(timeoutId);
    this._pendingGatherRounds.delete(gatherRound);
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
      const gatherRound = Number.isFinite(Number(incoming.gatherRound)) ? Number(incoming.gatherRound) : 0;
      const timestamp = Number.isFinite(Number(incoming.timestamp)) ? Number(incoming.timestamp) : Date.now();
      if (gatherRound) this._clearGatherTimeout(gatherRound);
      this._bus.emit('commit', { gatherRound, timestamp });
      return;
    }
    if (incoming.id != null) {
      this._bus.emit('label', incoming);
    }
  }

  _keepNonContained = (items) => {
    const seqs = items.map((item) => item.split('-'));
    const isSubsequence = (sub, full) => {
      let idx = 0;
      for (const value of full) {
        if (value === sub[idx]) idx += 1;
        if (idx === sub.length) return true;
      }
      return sub.length === 0;
    };
    return seqs
      .filter(
        (seq, i) =>
          !seqs.some((other, j) => j !== i && other.length >= seq.length && isSubsequence(seq, other))
      )
      .map((seq) => seq.join('-'));
  };

  _filterRedundantDiffAdds(items) {
    if (!Array.isArray(items) || items.length === 0) return [];

    const byIndex = new Map();
    let hasMemberParents = false;
    let hasCompoundIndexes = false;

    for (const feature of items) {
      const index = feature?.properties?._index;
      if (index) {
        if (!hasCompoundIndexes && String(index).includes('-')) {
          hasCompoundIndexes = true;
        }
        if (!hasMemberParents) {
          const members = feature?.properties?._members;
          if (Array.isArray(members) && members.length > 1) {
            hasMemberParents = true;
          }
        }
        byIndex.set(index, feature);
      }
    }

    if (byIndex.size === 0) return [];
    if (byIndex.size === 1) return [byIndex.values().next().value];

    if (hasMemberParents) {
      const suppressed = new Set();
      for (const feature of byIndex.values()) {
        const parentIndex = feature?.properties?._index;
        const members = feature?.properties?._members;
        if (!parentIndex || !Array.isArray(members) || members.length <= 1) continue;
        for (const member of members) {
          if (member !== parentIndex && byIndex.has(member)) {
            suppressed.add(member);
          }
        }
      }

      if (suppressed.size > 0) {
        const filtered = [];
        for (const feature of byIndex.values()) {
          if (!suppressed.has(feature?.properties?._index)) {
            filtered.push(feature);
          }
        }
        return filtered;
      }
    }

    // Fast path: simple feature indexes do not participate in legacy token-containment logic.
    if (!hasCompoundIndexes) {
      return [...byIndex.values()];
    }

    const filteredIndexes = new Set(this._keepNonContained([...byIndex.keys()].sort()));
    const filtered = [];
    for (const [index, feature] of byIndex.entries()) {
      if (filteredIndexes.has(index)) {
        filtered.push(feature);
      }
    }
    return filtered;
  }

  /**
   * Collect label feature diffs and prepare update sets for the GeoJSON source.
   * @private
   * @param {Object} collection Label collection message payload
   * @returns {void}
   */
  _collectLabelDiff(collection) {
    const gatherRound = Number.isFinite(Number(collection.gatherRound)) ? Number(collection.gatherRound) : 0;
    const timestamp = Number.isFinite(Number(collection.timestamp)) ? Number(collection.timestamp) : 0;
    if (gatherRound && gatherRound < this._lastGatherRound) return;
    if (gatherRound && gatherRound > this._lastGatherRound) {
      this._lastGatherRound = gatherRound;
      this._lastGatherTimestamp = 0;
    }
    if (timestamp && timestamp > this._lastGatherTimestamp) {
      this._lastGatherTimestamp = timestamp;
    }

    const id = collection.id;

    let features = Array.isArray(collection.features) ? collection.features.slice() : [];
    if (features.length > 1) {
      features.sort((a, b) => {
        const aIndex = a?.properties?._index;
        const bIndex = b?.properties?._index;
        if (aIndex === bIndex) return 0;
        if (aIndex == null) return -1;
        if (bIndex == null) return 1;
        return String(aIndex).localeCompare(String(bIndex));
      });
    }
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
    this._scheduleDiffFlush({ gatherRound, timestamp });
  }

  /**
   * Schedule a diff flush after label diffs have been collected.
   * @private
   * @returns {void}
   */
  _scheduleDiffFlush({ gatherRound = 0, timestamp = 0 } = {}) {
    if (gatherRound && gatherRound > this._lastGatherRound) {
      this._lastGatherRound = gatherRound;
      this._lastGatherTimestamp = 0;
    }
    if (timestamp && timestamp > this._lastGatherTimestamp) {
      this._lastGatherTimestamp = timestamp;
    }

    if (
      !this._diffFlushInProgress &&
      !this._diffScheduled &&
      this._diffAdd.size === 0 &&
      this._diffRemove.size === 0
    ) {
      return;
    }

    if (!this._diffFlushInProgress && !this._diffScheduled && gatherRound && gatherRound < this._lastGatherRound) {
      return;
    }

    if (this._diffFlushInProgress) {
      if (gatherRound && gatherRound <= this._currentFlushGatherRound) {
        return;
      }
      if (timestamp && timestamp <= this._currentFlushTimestamp) {
        return;
      }
      this._diffFlushQueued = true;
      if (gatherRound && gatherRound > this._diffFlushQueuedGatherRound) {
        this._diffFlushQueuedGatherRound = gatherRound;
      }
      if (timestamp && timestamp > this._diffFlushQueuedTimestamp) {
        this._diffFlushQueuedTimestamp = timestamp;
      }
      return;
    }

    if (this._diffScheduled) {
      if (gatherRound && gatherRound > this._diffFlushQueuedGatherRound) {
        this._diffFlushQueuedGatherRound = gatherRound;
      }
      if (timestamp && timestamp > this._diffFlushQueuedTimestamp) {
        this._diffFlushQueuedTimestamp = timestamp;
      }
      return;
    }

    this._diffScheduled = true;
    this._diffScheduler.schedule();
  }

  async _runDiffFlush() {
    if (!this._diffScheduled) return;
    this._diffScheduled = false;
    if (this._diffFlushInProgress) return;
    this._diffFlushInProgress = true;
    const flushGatherRound = Math.max(this._lastGatherRound, this._diffFlushQueuedGatherRound);
    const flushTimestamp = Math.max(this._lastGatherTimestamp, this._diffFlushQueuedTimestamp, Date.now());
    this._currentFlushGatherRound = flushGatherRound;
    this._currentFlushTimestamp = flushTimestamp;
    const queuedGatherRound = this._diffFlushQueuedGatherRound;
    const queuedTimestamp = this._diffFlushQueuedTimestamp;
    this._diffFlushQueuedGatherRound = 0;
    this._diffFlushQueuedTimestamp = 0;
    let flushed = true;
    try {
      flushed = await this._flushDiffs();
    } finally {
      this._diffFlushInProgress = false;
      this._currentFlushGatherRound = 0;
      this._currentFlushTimestamp = 0;
      if (!flushed) {
        this._scheduleDiffRetry();
      }
      if (this._diffFlushQueued) {
        this._diffFlushQueued = false;
        this._scheduleDiffFlush({ gatherRound: queuedGatherRound, timestamp: queuedTimestamp });
      }
    }
  }

  _scheduleDiffRetry() {
    if (this._disposed || this._diffRetryHandle || (this._diffAdd.size === 0 && this._diffRemove.size === 0)) return;
    const delay = Math.min(1000, Math.max(25, 25 * Math.pow(2, this._diffRetryCount)));
    this._diffRetryCount += 1;
    this._diffRetryHandle = setTimeout(() => {
      this._diffRetryHandle = null;
      this._scheduleDiffFlush({ gatherRound: this._lastGatherRound, timestamp: Date.now() });
    }, delay);
  }

  /**
   * Flush accumulated add/remove feature diffs to the GeoJSON source.
   * @private
   * @returns {void}
   */
  async _flushDiffs() {
    if (this._disposed || !this.gjSource || (this._diffAdd.size === 0 && this._diffRemove.size === 0)) return true;
    const addEntries = this._diffAdd.size > 0 ? [...this._diffAdd.entries()] : [];
    let add = [];
    if (addEntries.length === 1) {
      add = [addEntries[0][1]];
    } else if (addEntries.length > 1) {
      const addRaw = addEntries.map(([, feature]) => feature);
      add = this._filterRedundantDiffAdds(addRaw);
    }
    const removeSnapshot = this._diffRemove.size > 0 ? [...this._diffRemove] : [];
    let remove = null;

    if (removeSnapshot.length > 0) {
      if (add.length === 0) {
        remove = removeSnapshot;
      } else {
        const addIndexes = new Set();
        for (const feature of add) {
          const index = feature?.properties?._index;
          if (index) addIndexes.add(index);
        }

        remove = [];
        for (const index of removeSnapshot) {
          if (!addIndexes.has(index)) {
            remove.push(index);
          }
        }
      }
    }

    try {
      await this.gjSource.updateData({ add, remove: remove || [] });
    } catch {
      return false;
    }

    for (const [index, feature] of addEntries) {
      if (!index) continue;
      if (this._diffAdd.get(index) === feature) {
        this._diffAdd.delete(index);
      }
    }
    for (const index of removeSnapshot) {
      this._diffRemove.delete(index);
    }
    this._diffRetryCount = 0;
    if (this._diffRetryHandle) {
      clearTimeout(this._diffRetryHandle);
      this._diffRetryHandle = null;
    }
    return true;
  }

}
