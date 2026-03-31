import Protobuf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import tileToProtobuf from 'vt-pbf';
import MinionWorker from './worker.js?worker&inline';
import { encodeFeaturesBinary, decodeFeaturesBinary, ArrayBufferPool, textEncoder, textDecoder } from './utils.js';
export default class ProperLabels {

    constructor(options) {
        this.map = options.map;
        this.source = (options.source instanceof maplibregl.VectorTileSource) ? options.source : this.map.getSource(options.source);
        this.sourceLayer = options['sourceLayer'];
        this.fid = options.fid || 'id';
        this.tiles = this.source.tiles.map(u => u.split('{z}')[0]);
        this.tileSize = this.source.tileSize || 512;
        this.tolerance = options.tolerance || 0.00001; // ~ 1m on the Equator
        this.cacheSize = options.cacheSize || 10000;

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
                    try { if (propsBuf) this._abPool.release(propsBuf instanceof ArrayBuffer ? propsBuf : propsBuf.buffer); } catch (e) { }
                    try { if (coordsBuf) this._abPool.release(coordsBuf instanceof ArrayBuffer ? coordsBuf : coordsBuf.buffer); } catch (e) { }
                    // if we requested a full payload previously, acknowledge the worker so it can commit cache
                    try { this.minion.postMessage({ type: 'diff_ack' }); } catch (e) { }
                } catch (err) {
                    console.warn('Failed to decode binary worker response', err);
                }
            } else if (msg.type === 'geojson_diff') {
                try {
                    const diff = msg && msg.diff ? msg.diff : {};

                    // apply diff via updateData if available
                    if (this.gjsource && typeof this.gjsource.updateData === 'function') {
                        try {
                            this.gjsource.updateData(diff);
                            // successfully applied diff: acknowledge so worker can commit
                            try { this.minion.postMessage({ type: 'diff_ack' }); } catch (e) { }
                        } catch (e) {
                            // updateData failed: request full payload from worker (do not ack yet)
                            try { this.minion.postMessage({ type: 'request_full' }); } catch (ee) { }
                            return;
                        }
                    } else {
                        // no updateData support: request a full rebuild from worker (do not ack)
                        try { this.minion.postMessage({ type: 'request_full' }); } catch (ee) { }
                        return;
                    }
                } catch (err) {
                    console.warn('Failed to process geojson diff from worker', err);
                }
            } else if (msg.type === 'geojson_diff_bin') {
                try {
                    // decode binary add/update payloads then reconstruct canonical diff
                    const removeList = msg.removeList || [];
                    const removeAll = !!msg.removeAll;

                    let addFeatures = [];
                    if (msg.add && msg.add.coords) {
                        try {
                            const addPropsBuf = msg.add.propsBuf !== undefined ? msg.add.propsBuf : null;
                            const addCoordsBuf = msg.add.coords;
                            addFeatures = decodeFeaturesBinary(msg.add.meta || [], addPropsBuf, addCoordsBuf, msg.add.keys || []);
                            try { if (addPropsBuf) this._abPool.release(addPropsBuf instanceof ArrayBuffer ? addPropsBuf : addPropsBuf.buffer); } catch (e) { }
                            try { if (addCoordsBuf) this._abPool.release(addCoordsBuf instanceof ArrayBuffer ? addCoordsBuf : addCoordsBuf.buffer); } catch (e) { }
                        } catch (err) {
                            console.warn('Failed to decode add-list from worker', err);
                            try { this.minion.postMessage({ type: 'request_full' }); } catch (e) { }
                            return;
                        }
                    }

                    let updateFeatures = [];
                    if (msg.update && msg.update.coords) {
                        try {
                            const updPropsBuf = msg.update.propsBuf !== undefined ? msg.update.propsBuf : null;
                            const updCoordsBuf = msg.update.coords;
                            updateFeatures = decodeFeaturesBinary(msg.update.meta || [], updPropsBuf, updCoordsBuf, msg.update.keys || []);
                            try { if (updPropsBuf) this._abPool.release(updPropsBuf instanceof ArrayBuffer ? updPropsBuf : updPropsBuf.buffer); } catch (e) { }
                            try { if (updCoordsBuf) this._abPool.release(updCoordsBuf instanceof ArrayBuffer ? updCoordsBuf : updCoordsBuf.buffer); } catch (e) { }
                        } catch (err) {
                            console.warn('Failed to decode update-list from worker', err);
                            try { this.minion.postMessage({ type: 'request_full' }); } catch (e) { }
                            return;
                        }
                    }

                    // Reconstruct update diffs: decode compacted diffs when present,
                    // then attach newGeometry from decoded updateFeatures.
                    let updateDiffsRaw = [];
                    if (msg.updateDiffs && Array.isArray(msg.updateDiffs)) {
                        updateDiffsRaw = msg.updateDiffs;
                    } else if (msg.updateDiffsMeta && Array.isArray(msg.updateDiffsMeta)) {
                        // decode compacted property diffs using keys + props buffer
                        try {
                            const upKeys = msg.updateKeys || [];
                            const upPropsBuf = msg.updatePropsBuf !== undefined ? msg.updatePropsBuf : null;
                            const upPropsBytes = upPropsBuf ? (upPropsBuf instanceof Uint8Array ? upPropsBuf : new Uint8Array(upPropsBuf)) : new Uint8Array(0);
                            const decoder = textDecoder;
                            for (const meta of msg.updateDiffsMeta) {
                                const d = { id: meta.id };
                                if (meta.removeAllProperties) d.removeAllProperties = true;
                                if (Array.isArray(meta.removeProperties) && meta.removeProperties.length) {
                                    d.removeProperties = meta.removeProperties.map(i => upKeys[i]);
                                }
                                if (Array.isArray(meta.addOrUpdate) && meta.addOrUpdate.length) {
                                    const arr = [];
                                    for (const tup of meta.addOrUpdate) {
                                        const [ki, off, len] = tup;
                                        const key = upKeys[ki];
                                        try {
                                            const slice = upPropsBytes.subarray(off, off + len);
                                            const val = JSON.parse(decoder.decode(slice));
                                            arr.push({ key, value: val });
                                        } catch (err) {
                                            // ignore parse errors per-property
                                        }
                                    }
                                    if (arr.length) d.addOrUpdateProperties = arr;
                                }
                                updateDiffsRaw.push(d);
                            }
                            // release props buffer back to pool
                            try { if (upPropsBuf) this._abPool.release(upPropsBuf instanceof ArrayBuffer ? upPropsBuf : upPropsBuf.buffer); } catch (e) { }
                        } catch (err) {
                            console.warn('Failed to decode compacted update diffs', err);
                        }
                    }
                    const updateMap = new Map((updateFeatures || []).map(f => [String(f.id), f]));
                    const updateDiffsFinal = updateDiffsRaw.map(d => {
                        const out = { id: d.id };
                        const nf = updateMap.get(String(d.id));
                        if (nf && nf.geometry) out.newGeometry = nf.geometry;
                        if (d.removeAllProperties) out.removeAllProperties = true;
                        if (d.removeProperties) out.removeProperties = d.removeProperties;
                        if (d.addOrUpdateProperties) out.addOrUpdateProperties = d.addOrUpdateProperties;
                        return out;
                    }).filter(x => x != null);

                    const diffObj = {};
                    if (removeAll) diffObj.removeAll = true; else if (removeList.length) diffObj.remove = removeList;
                    if (addFeatures.length) diffObj.add = addFeatures;
                    if (updateDiffsFinal.length) diffObj.update = updateDiffsFinal;

                    if (this.gjsource && typeof this.gjsource.updateData === 'function') {
                        try {
                            this.gjsource.updateData(diffObj);
                            try { this.minion.postMessage({ type: 'diff_ack' }); } catch (e) { }
                        } catch (err) {
                            try { this.minion.postMessage({ type: 'request_full' }); } catch (e) { }
                            return;
                        }
                    } else {
                        try { this.minion.postMessage({ type: 'request_full' }); } catch (e) { }
                        return;
                    }
                } catch (err) {
                    console.warn('Failed to process binary geojson diff from worker', err);
                }
            } else if (msg.type === 'geojson' && msg.payload) {
                try {
                    const buf = msg.payload instanceof Uint8Array ? msg.payload.buffer : msg.payload;
                    const text = textDecoder.decode(buf);
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
                                    // send binary message with transferred properties + coordinates buffers (include cacheSize and promoteId)
                                    this.minion.postMessage({ type: 'features_bin', meta, keys, propsBuf: propsBuffer.buffer, tolerance: this._pendingPost.tolerance, coords: coordsArray.buffer, cacheSize: this.cacheSize, promoteId: this.fid }, [propsBuffer.buffer, coordsArray.buffer]);
                                } catch (err) {
                                    // fallback to previous transferable JSON encoding
                                    try {
                                        // attach promoteId so worker can populate promoted id property
                                        const payload = Object.assign({}, this._pendingPost, { promoteId: this.fid });
                                        const json = JSON.stringify(payload);
                                        const encoded = textEncoder.encode(json);
                                        this.minion.postMessage({ type: 'features', payload: encoded.buffer }, [encoded.buffer]);
                                    } catch (err2) {
                                        const payload = Object.assign({}, this._pendingPost, { promoteId: this.fid });
                                        this.minion.postMessage(payload);
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
    if (!this._proper) {
        this._proper = new ProperLabels({
            map: this._map,
            source: this
        });
    }
    return this._proper;
}