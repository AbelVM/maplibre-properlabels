import { PowerCache, PowerEventBus, PowerPool, PowerQueue, u82o } from 'performance-helpers';

export default class TileManager {
  constructor({
    map,
    source,
    sourceLayer,
    fid = 'id',
    tileSize = 512,
    tolerance = 0.00001,
    cacheSize = 5000,
    units = 'meters',
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

    this._sourceLoaded = false;
    this._pendingTiles = new Set();
    this._tileQueue = new PowerQueue(32);
    this._tileDrainScheduled = false;
    this._gatherScheduled = false;
    this._diffScheduled = false;
    this._diffAdd = new Map();
    this._diffRemove = new Set();
    this._bus = new PowerEventBus();

    this.piecesCache = new PowerCache({
      maxEntries: cacheSize,
      maxWeight: cacheSize * 5000,
      weightFn: (entry) => entry.size || 0,
    });

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

  handleSourceData(event) {
    if (!event || event.sourceId !== this.source.id) return;
    if (event.isSourceLoaded) this._sourceLoaded = true;

    const canonical = event.tile?.tileID?.canonical;
    if (!canonical) return;

    const unique = `${canonical.z}|${canonical.x}|${canonical.y}`;
    if (this.piecesCache.has(unique) || this._pendingTiles.has(unique)) return;

    let tileFeatures = [];
    const tileOptions = this.source.type === 'vector' ? { sourceLayer: this.sourceLayer } : {};
    const queryFeatures =
      typeof event.tile?.querySourceFeatures === 'function'
        ? event.tile.querySourceFeatures.bind(event.tile)
        : typeof this.map.querySourceFeatures === 'function'
          ? this.map.querySourceFeatures.bind(this.map)
          : null;

    if (!queryFeatures) return;
    const queryResult = queryFeatures(tileFeatures, tileOptions);
    if (Array.isArray(queryResult)) tileFeatures = queryResult;
    if (!tileFeatures.length) return;

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
    };

    this._pendingTiles.add(unique);
    this._tileQueue.push(payload);
    this._scheduleTileDrain();
  }

  setGeoJsonSource(gjSource) {
    this.gjSource = gjSource;
  }

  dispose() {
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
    this._tileQueue.clear();
    this._diffQueue?.clear?.();
    this._bus.clear();
  }

  _scheduleTileDrain() {
    if (this._tileDrainScheduled) return;
    this._tileDrainScheduled = true;
    queueMicrotask(() => {
      this._tileDrainScheduled = false;
      this._drainTileQueue();
    });
  }

  _drainTileQueue() {
    const items = [];
    let task;
    while ((task = this._tileQueue.shift()) !== undefined) {
      items.push({ message: task });
    }
    if (items.length > 0) {
      this.tilePool.postMessageBatch(items);
    }
  }

  _onTileMessage(event) {
    const incoming = this._normalizeWorkerMessage(event.data);
    if (!incoming || incoming.type !== 'simplified') return;

    const { unique, type, ...payload } = incoming;
    this._pendingTiles.delete(unique);
    this.piecesCache.set(unique, payload);
    if (this._sourceLoaded) this._scheduleGather();
  }

  _scheduleGather() {
    if (this._gatherScheduled) return;
    this._gatherScheduled = true;
    queueMicrotask(() => {
      this._gatherScheduled = false;
      this._dispatchGather();
    });
  }

  _dispatchGather() {
    const entries = Array.from(this.piecesCache.entries('LRU'));
    if (!entries.length) return;
    const pieces = Object.fromEntries(entries);
    this.gatherPool.postMessage({
      pieces,
      tolerance: this.tolerance,
      unit: this.units,
      tileSize: this.tileSize,
    });
  }

  _onGatherMessage(event) {
    const incoming = this._normalizeWorkerMessage(event.data);
    if (!incoming) return;
    if (incoming.type === 'commit') {
      this._bus.emit('commit');
      return;
    }
    if (incoming.id != null) {
      this._bus.emit('label', incoming);
    }
  }

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

  _scheduleDiffFlush() {
    if (this._diffScheduled) return;
    this._diffScheduled = true;
    queueMicrotask(() => {
      this._diffScheduled = false;
      this._flushDiffs();
    });
  }

  _flushDiffs() {
    if (!this.gjSource || (this._diffAdd.size === 0 && this._diffRemove.size === 0)) return;
    const add = [...this._diffAdd.values()];
    const remove = [...this._diffRemove];
    this._diffAdd.clear();
    this._diffRemove.clear();
    this.gjSource.updateData({ add, remove });
  }

  _normalizeWorkerMessage(message) {
    if (message instanceof ArrayBuffer || ArrayBuffer.isView(message)) {
      return u82o(message);
    }
    return message;
  }
}
