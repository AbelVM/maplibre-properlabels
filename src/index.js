import Protobuf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import tileToProtobuf from 'vt-pbf';
import TileWorker from './tileWorker.js?worker&inline';
import GatherWorker from './gatherWorker.js?worker&inline';
import PoolManager from './poolManager.js';
import { o2b, b2o } from './utils.js';

//window.Buffer = Buffer;

export default class ProperLabels {

    constructor(options) {
        this.map = options.map;
        this.source = (options.source instanceof maplibregl.VectorTileSource) ? options.source : this.map.getSource(options.source);
        this.sourceLayer = options.sourceLayer;
        this.fid = options.fid || 'id';
        this.tiles = this.source.tiles.map(u => u.split('{z}')[0]);
        this.tileSize = this.source.tileSize || 512;
        this.tolerance = options.tolerance || 0.00001; // ~ 1m on the Equator
        this.cacheSize = options.cacheSize || 10000;
        this.units = options.units || 'meters';
        this.seed = false;
        // this.minion = new MinionWorker();
        // this.minion.onmessage = e => {
        //     this.gjsource.updateData(e.data.diff);
        // };
        this.map.addSource(this.source.id + '-proper', {
            type: 'geojson',
            maxzoom: this.source.maxzoom,
            promoteId: `_index`,
            data: {}
        });
        this.gjsource = this.map.getSource(this.source.id + '-proper');

        maplibregl.addProtocol('proper', this._protocol);
        this.map.setTransformRequest((url, resourceType) => {
            const isTile = this.tiles.some(t => url.startsWith(t));
            if (isTile && resourceType === 'Tile') {
                return { url: 'proper://' + url };
            }
            return { url: url };
        });

        const tilePool = new PoolManager(TileWorker, { size: 6 });
        const gatherPool = new PoolManager(GatherWorker, { size: 4 });

        const piecesBucket = new Map();
        tilePool.onmessage = e => {
            if (e.data instanceof ArrayBuffer) {
                const buffer = e.data;
                const incoming = b2o(buffer);
                if (incoming.type !== 'simplified') return 0;
                const {unique, type, ...payload} = incoming;
                piecesBucket.set(unique, payload);
            }
        };

        const labelsBucket = new Map();
        gatherPool.onmessage = e => {
            if (e.data instanceof ArrayBuffer) {
                const buffer = e.data;
                const incoming = b2o(buffer);
                
            }
        };


        this.map.on('sourcedata', (e) => {
            if (e.sourceId === this.source.id) {
                const { z, x, y } = e.tile.tileID.canonical;
                const unique = `${z}|${x}|${y}`;
                if (!piecesBucket.has(unique)) {
                    // Fit tolerance to map scale: https://wiki.openstreetmap.org/wiki/Zoom_levels
                    const t = this.tolerance * Math.pow(10, -0.301 * z + 5.19);
                    const tileFeatures = [];
                    const tileoptions = (this.source.type === 'vector') ? { sourceLayer: this.sourceLayer } : {};
                    e.tile.querySourceFeatures(tileFeatures, tileoptions);
                    const payload = {
                        collection: {
                            type: 'FeatureCollection',
                            features: tileFeatures.map((f, i) => ({
                                id: f.properties[this.fid] || f.id,
                                geometry: f.geometry,
                                properties: {...f.properties, _index: `${unique}|${i}`, _tile: unique}
                            }))
                        },
                        tolerance: t,
                        unique: unique,
                        tilesize: this.tileSize
                    };
                    const buffer = o2b(payload);
                    tilePool.postMessage(buffer);
                }
                if (e.isSourceLoaded) {
                    tilePool.addEventListener('idle', e => {
                        const pieces = Object.fromEntries(piecesBucket);
                        const payload = {pieces, tolerance: this.tolerance, unit: this.units};
                        const buffer = o2b(payload);
                        gatherPool.postMessage(buffer);
                    });
                }
            }
        });
        this.map.refreshTiles(this.source.id);
        return this.gjsource;
    }

    _protocol = async request => {
        const
            eps = 1,
            url = request.url.replace('proper://', ''),
            s = request.url.split(/\/|\./i);
        if (s === null || s.length < 4) {
            console.warn(`Malformed URL: ${request.url}`);
            return { data: null };
        }

        const payload = await fetch(url);
        let pbf;
        if (payload.status === 200) {
            const
                l = s.length,
                [z, x, y] = s.slice(l - 4, l - 1).map(k => k * 1),
                data = await payload.arrayBuffer(),
                vectortile = new VectorTile(new Protobuf(data)),
                tile = {
                    layers: Object.entries(vectortile.layers).reduce((acc, [layerId, layer]) => ({
                        ...acc,
                        [layerId]: {
                            ...layer,
                            feature: (index) => {
                                const feature = layer.feature(index);
                                const coordinates = feature.loadGeometry();
                                const isOuter = coordinates.flat(Infinity).some(c =>
                                    c.x >= layer.extent - eps || c.y >= layer.extent - eps ||
                                    c.x <= eps || c.y <= eps
                                );
                                // Clipped candidates per feature, single or multi
                                feature.properties['clipped'] = isOuter;
                                return feature;
                            }
                        }
                    }), {})
                };
            pbf = tileToProtobuf(tile).buffer;
        } else {
            pbf = tileToProtobuf({}).buffer;
        }
        return { data: pbf };
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