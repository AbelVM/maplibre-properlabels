import TileWorker from './workers/tileWorker.js?worker&inline';
import GatherWorker from './workers/gatherWorker.js?worker&inline';
import PowerTileManager from './managers/PowerTileManager.js';
import { deepEqual } from './utils/misc.js';

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


        const tileManager = new PowerTileManager({
            tileWorkerSource: TileWorker,
            gatherWorkerSource: GatherWorker,
            tilePoolOptions: {
                size: 6,
                minSize: 2,
                maxSize: 6,
                idleTimeout: 30000,
                taskQueue: true,
                queuePolicy: 'enqueue',
            },
            gatherPoolOptions: {
                size: 4,
                minSize: 2,
                maxSize: 4,
                idleTimeout: 30000,
                taskQueue: true,
            },
            tileCacheOptions: {
                maxEntries: this.cacheSize,
                defaultTTL: 60000,
            },
            gatherCacheOptions: {
                maxEntries: this.cacheSize,
                defaultTTL: 60000,
            },
            tileToGather: (tileResult) => {
                if (!tileResult || tileResult.type !== 'simplified' || !tileResult.unique) return null;
                const { unique, type, ...payload } = tileResult;
                return {
                    pieceKey: unique,
                    cacheKey: `gather:${unique}`,
                    message: {
                        pieces: {
                            [unique]: payload,
                        },
                        tolerance: this.tolerance,
                        unit: this.units,
                        tileSize: this.tileSize,
                    },
                    awaitResponse: true,
                };
            },
        });

        const diff = { add: new Map(), remove: new Set() };
        const applyDiff = () => {
            if (diff.add.size === 0 && diff.remove.size === 0) {
                console.log('No changes to apply, skipping update');
                return;
            }
            console.log(`Applying diff with ${diff.add.size} additions and ${diff.remove.size} removals`);
            const toAdd = [...diff.add.values()];
            const toRemove = [...diff.remove];
            this.gjSource.updateData({ add: toAdd, remove: toRemove });
            diff.add.clear();
            diff.remove.clear();
        };

        tileManager.on('gather:result', ({ result }) => {
            const id = result && result.id;
            const features = result && result.features;
            if (!id || !Array.isArray(features)) return;

            const cacheKey = `gather:${id}`;
            const cached = tileManager.gatherCache && tileManager.gatherCache.has(cacheKey)
                ? tileManager.gatherCache.get(cacheKey)
                : undefined;

            if (cached && !deepEqual(cached, features)) {
                const existingIds = [...new Set(cached.map(f => f.properties._index))];
                existingIds.forEach((uid) => diff.remove.add(uid));
                features.forEach((f) => diff.add.set(f.properties._index, f));
                tileManager.gatherCache.set(cacheKey, features);
            } else if (!cached) {
                features.forEach((f) => diff.add.set(f.properties._index, f));
                tileManager.gatherCache.set(cacheKey, features);
            }
        });

        tileManager.on('idle', (event) => {
            if (event && event.path === 'gather') {
                applyDiff();
            }
        });

        this.map.on('sourcedata', (e) => {
            if (e.sourceId === this.source.id) {
                const { z, x, y } = e.tile.tileID.canonical;
                const unique = `${z}|${x}|${y}`;
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
                    unique,
                    tileSize: this.tileSize
                };

                tileManager.processTile(unique, payload, {
                    cacheKey: unique,
                    awaitResponse: true,
                    timeout: 15000,
                }).catch((err) => {
                    console.error('PowerTileManager tile processing failed', err);
                });
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