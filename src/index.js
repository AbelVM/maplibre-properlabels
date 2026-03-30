import Protobuf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import tileToProtobuf from 'vt-pbf';
import MinionWorker from './worker.js?worker&inline';
import { encodeFeaturesBinary, decodeFeaturesBinary, ArrayBufferPool } from './utils.js';
export default class ProperLabels {

    constructor(options) {
        this.map = options.map;
        this.source = (options.source instanceof maplibregl.VectorTileSource) ? options.source : this.map.getSource(options.source);
        this.sourceLayer = options['sourceLayer'];
        this.fid = options.fid || 'id';
        this.tiles = this.source.tiles.map(u => u.split('{z}')[0]);
        this.tileSize = this.source.tileSize || 512;
        this.tolerance = options.tolerance || 0.00001; // ~ 1m on the Equator

        // worker (use transferable ArrayBuffer for messages)
        this.minion = new MinionWorker();
        this._abPool = new ArrayBufferPool();
        this.minion.onmessage = e => {
            const msg = e && e.data;
            if (!msg) return;
            if (msg.type === 'geojson_bin' && msg.coords) {
                try {
                    const coordsBuf = msg.coords instanceof Uint8Array ? msg.coords.buffer : msg.coords;
                    const propsBuf = msg.propsBuf !== undefined ? msg.propsBuf : null;
                    const features = decodeFeaturesBinary(msg.meta || [], propsBuf, coordsBuf, msg.keys || []);
                    this.gjsource.setData({ type: 'FeatureCollection', features });
                    // return buffers to pool for reuse
                    try { if (propsBuf) this._abPool.release(propsBuf instanceof ArrayBuffer ? propsBuf : propsBuf.buffer); } catch (e) {}
                    try { if (coordsBuf) this._abPool.release(coordsBuf instanceof ArrayBuffer ? coordsBuf : coordsBuf.buffer); } catch (e) {}
                } catch (err) {
                    console.warn('Failed to decode binary worker response', err);
                }
            } else if (msg.type === 'geojson' && msg.payload) {
                try {
                    const buf = msg.payload instanceof Uint8Array ? msg.payload.buffer : msg.payload;
                    const text = new TextDecoder().decode(buf);
                    const obj = JSON.parse(text);
                    this.gjsource.setData(obj);
                } catch (err) {
                    console.warn('Failed to decode worker response', err);
                }
            } else {
                // fallback for older messages
                try {
                    this.gjsource.setData(msg);
                } catch (err) {
                    console.warn('Failed to set worker data', err);
                }
            }
        };

        // GeoJSON source for processed features
        this.map.addSource(this.source.id + '-proper', {
            type: 'geojson',
            maxzoom: this.source.maxzoom,
            promoteId: this.fid,
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

        // Debounce posting heavy feature payloads to the worker
        this._pendingPost = null;
        this._postTimer = null;
        this._postDelay = options.postDelay || 100; // ms

        this.map.on('sourcedata', (e) => {
            if (e.sourceId === this.source.id && e.isSourceLoaded) {
                const
                    rawFeatures = this.map.querySourceFeatures(this.source.id, { sourceLayer: this.sourceLayer }),
                    z = e.tile.tileID.canonical.z,
                    t = this.tolerance * Math.pow(10, -0.301 * z + 5.19); // https://wiki.openstreetmap.org/wiki/Zoom_levels
                const data = {
                    features: rawFeatures.map(f => ({ id: f.id, geometry: f.geometry, properties: f.properties })),
                    tolerance: t
                };
                this._pendingPost = data;
                if (this._postTimer == null) {
                    this._postTimer = setTimeout(() => {
                        try {
                            if (this._pendingPost) {
                                    try {
                                    // encode geometries into a compact Float32Array + key-indexed properties buffer (use pool)
                                    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(this._pendingPost.features || [], { pool: this._abPool });
                                    // send binary message with transferred properties + coordinates buffers
                                    this.minion.postMessage({ type: 'features_bin', meta, keys, propsBuf: propsBuffer.buffer, tolerance: this._pendingPost.tolerance, coords: coordsArray.buffer }, [propsBuffer.buffer, coordsArray.buffer]);
                                } catch (err) {
                                    // fallback to previous transferable JSON encoding
                                    try {
                                        const encoder = new TextEncoder();
                                        const json = JSON.stringify(this._pendingPost);
                                        const encoded = encoder.encode(json);
                                        this.minion.postMessage({ type: 'features', payload: encoded.buffer }, [encoded.buffer]);
                                    } catch (err2) {
                                        this.minion.postMessage(this._pendingPost);
                                    }
                                }
                            }
                        } finally {
                            this._pendingPost = null;
                            this._postTimer = null;
                        }
                    }, this._postDelay);
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
        const
            payload = await fetch(url);
        if (!payload.ok) {
            console.warn(`Failed to fetch tile: ${payload.statusText}`);
            return { data: null };
        }
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
                            feature.properties['clipped'] = isOuter;
                            return feature;
                        }
                    }
                }), {})
            },
            pbf = tileToProtobuf(tile).buffer,
            response = { data: pbf };
        return response;
    }
}

maplibregl.VectorTileSource.prototype.ProperLabels = function (options) {
    if (!this._proper) {
        this._proper = new ProperLabels({
            map: this._map,
            source: this
        });
    }
    return this._proper;
}