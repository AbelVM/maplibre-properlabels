import TileWorker from './workers/tileWorker.js?worker&inline';
import GatherWorker from './workers/gatherWorker.js?worker&inline';
import PoolManager from './utils/poolManager.js';
import CacheManager from './utils/cacheManager.js';
import { o2u8, u82o } from './utils/bufferManager.js';


export default class ProperLabels {

    constructor(options) {
        this.map = options.map;
        this.source = (options.source instanceof maplibregl.VectorTileSource) ? options.source : this.map.getSource(options.source);
        this.sourceLayer = options.sourceLayer;
        this.fid = options.fid || 'id';
        this.tiles = this.source.tiles.map(u => u.split('{z}')[0]);
        this.tileSize = this.source.tileSize || 512;
        this.tolerance = options.tolerance || 0.00001; // ~ 1m on the Equator
        this.cacheSize = options.cacheSize || 5000;
        this.units = options.units || 'meters';
        this.seed = false;
        this.map.addSource(this.source.id + '-proper', {
            type: 'geojson',
            maxzoom: this.source.maxzoom,
            promoteId: `_index`,
            data: {}
        });
        this.gjSource = this.map.getSource(this.source.id + '-proper');

        const tilePool = new PoolManager(TileWorker, { size: 6 });
        const gatherPool = new PoolManager(GatherWorker, { size: 4 });

        const piecesBucket = new CacheManager({
            maxEntries: this.cacheSize,
            maxWeight: this.cacheSize * 5000,
            weight: entry => entry.size || 0
        });
        tilePool.onmessage = e => {
            if (e.data instanceof ArrayBuffer) {
                const buffer = e.data;
                const incoming = u82o(buffer);
                if (incoming.type === 'simplified' && incoming.size > 0) {
                    const { unique, type, ...payload } = incoming;
                    piecesBucket.set(unique, payload);
                }
            }
        };

        const labelsBucket = new CacheManager({
            maxEntries: this.cacheSize,
            maxWeight: this.cacheSize * 5000,
            weight: entry => entry.features.length || 0
        });

        const diff = { add: new Map(), remove: new Set() };
        const applyDiff = () => {
            if (diff.add.size === 0 && diff.remove.size === 0) {
                console.log('No changes to apply, skipping update');
                if (this.scheduler) {
                    clearInterval(this.scheduler);
                    this.scheduler = null;
                }
                return;
            }
            console.log(`Applying diff with ${diff.add.size} additions and ${diff.remove.size} removals`);
            const toAdd = [...diff.add.values()];
            const toRemove = [...diff.remove];
            this.gjSource.updateData({ add: toAdd, remove: toRemove });
            diff.add.clear();
            diff.remove.clear();
        };


        gatherPool.onmessage = e => {
            if (e.data instanceof ArrayBuffer) {
                const buffer = e.data;
                const incoming = u82o(buffer);
                const { id, features } = incoming;
                if (labelsBucket.has(id) && !labelsBucket.hasEqual(id, features)) {
                    const existing = labelsBucket.get(id);
                    const existingIds = [...new Set(existing.map(f => f.properties._index))];
                    existingIds.forEach(id => diff.remove.add(id));
                    features.forEach(f => diff.add.set(f.properties._index, f));
                    labelsBucket.set(id, features);
                } else {
                    features.forEach(f => diff.add.set(f.properties._index, f));
                    labelsBucket.set(id, features);
                }
            } else {

            }
        };
        gatherPool.addEventListener('idle', applyDiff);


        this.map.on('sourcedata', (e) => {
            if (e.sourceId === this.source.id) {
                const { z, x, y } = e.tile.tileID.canonical;
                const unique = `${z}|${x}|${y}`;
                if (!piecesBucket.has(unique)) {
                    // Fit tolerance to map scale: https://wiki.openstreetmap.org/wiki/Zoom_levels
                    // 1 px ~ 1m at zoom 17, and 1m at equator is 0.00001 degrees so we can use 
                    // that as a reference for scaling the tolerance. The formula is derived from 
                    // the equation of a line in log-log space, where the x-axis is zoom level and 
                    // the y-axis is tolerance.
                    const t = this.tolerance * Math.pow(10, -0.301 * z + 5.19);
                    const tileFeatures = [];
                    const tileOptions = (this.source.type === 'vector') ? { sourceLayer: this.sourceLayer } : {};
                    e.tile.querySourceFeatures(tileFeatures, tileOptions);
                    const payload = {
                        collection: {
                            type: 'FeatureCollection',
                            features: tileFeatures.map((f, i) => ({
                                id: f.properties[this.fid] || f.id,
                                geometry: f.geometry,
                                properties: {
                                    ...f.properties,
                                    _index: `${unique}|${i}`,
                                    _tile: unique,
                                    _group: f.properties[this.fid]
                                }
                            }))
                        },
                        tolerance: t,
                        unique: unique,
                        tileSize: this.tileSize
                    };
                    const buffer = o2u8(payload).buffer;
                    tilePool.postMessage(buffer, [buffer]);
                }
                if (e.isSourceLoaded) {
                    tilePool.addEventListener('idle', e => {
                        const pieces = Object.fromEntries(piecesBucket.entries());
                        const payload = { pieces, tolerance: this.tolerance, unit: this.units, tileSize: this.tileSize };
                        const buffer = o2u8(payload).buffer;
                        gatherPool.postMessage(buffer, [buffer]);
                    });
                }
            }
        });
        this.map.refreshTiles(this.source.id);
        return this.gjSource;
    }
}

maplibregl.VectorTileSource.prototype.ProperLabels = function (options) {
    const opts = Object.assign({}, options, {
        map: this._map,
        source: this
    });
    if (!this._proper) {
        this._proper = new ProperLabels(opts);
    }
    return this._proper;
}