import { union } from "@turf/union";
import { combine } from "@turf/combine";
import { flatten } from "@turf/flatten";
import polylabel from 'polylabel';
import { pointOnFeature } from "@turf/point-on-feature";
import { simplify } from "@turf/simplify";
import { encodeFeaturesBinary, decodeFeaturesBinary, ArrayBufferPool, textEncoder, textDecoder } from './utils.js';

const _abPool = new ArrayBufferPool();

// Feature cache: Map<id, { feature, geomHash, ts }>
const _cache = new Map();
let _cacheSize = 10000;
let _pendingDiff = null; // { addList, updateList, removeList }


const safePolylabel = (feature, precision) => {
    try {
        const coords = feature && feature.geometry && feature.geometry.coordinates;
        let pt = polylabel(coords, precision);
        if (!Array.isArray(pt) || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) {
            pt = pointOnFeature(feature).geometry.coordinates;
        }
        return {
            type: 'Point',
            coordinates: [pt[0], pt[1]]
        }
    } catch (err) {
        console.log('Invalid feature geometry', feature && feature.id)
        return pointOnFeature(feature).geometry;
    }
}


const shoeLace = points => {
    if (!points) return 0;
    let a = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        a += points[i][0] * points[j][1];
        a -= points[j][0] * points[i][1];
    }
    return Math.abs(a) / 2;
}

const polygonArea = (feature, units) => {
    try {
        if (units === 'meters') {
            return area(feature);
        } else {
            const geometry = feature && feature.geometry;
            if (!geometry || geometry.type !== 'Polygon') return 0;
            const coordinates = geometry && geometry.coordinates
            let area = shoeLace(coordinates[0]);
            for (let i = 1; i < coordinates.length; i++) {
                area -= shoeLace(coordinates[i]);
            }
            return area;
        }
    } catch (err) {
        console.log('Error computing area for feature', feature && feature.id, err);
        return 0;
    }
}

// Geometry hashing utilities (FNV-1a over Float32 representation for speed)
const _hashBuf = new ArrayBuffer(8);
const _hashView = new DataView(_hashBuf);
const _hashBuf32 = new ArrayBuffer(4);
const _hashView32 = new DataView(_hashBuf32);
function _fnv1aInit() { return 2166136261 >>> 0; }
function _fnv1aUpdateUint32(h, v) { h ^= v >>> 0; h = Math.imul(h, 16777619) >>> 0; return h; }
function _hashNumber(h, num) {
    const n = Number(num) || 0;
    _hashView.setFloat64(0, n, true);
    h = _fnv1aUpdateUint32(h, _hashView.getUint32(0, true));
    h = _fnv1aUpdateUint32(h, _hashView.getUint32(4, true));
    return h;
}

// Faster 32-bit float hashing used for geometry coordinates
function _hashNumber32(h, num) {
    const n = Number(num) || 0;
    _hashView32.setFloat32(0, n, true);
    h = _fnv1aUpdateUint32(h, _hashView32.getUint32(0, true));
    return h;
}
function _hashString(h, s) {
    if (!s) return h;
    for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);
        h = _fnv1aUpdateUint32(h, code & 0xFFFF);
    }
    return h;
}

function computeGeometryHash(geom) {
    if (!geom) return 0;
    let h = _fnv1aInit();
    h = _hashString(h, geom.type || '');
    const type = geom.type;
    if (type === 'Point') {
        const c = geom.coordinates || [];
        h = _hashNumber32(h, c[0]);
        h = _hashNumber32(h, c[1]);
        return h;
    }
    if (type === 'LineString' || type === 'MultiPoint') {
        const coords = geom.coordinates || [];
        for (const p of coords) {
            h = _hashNumber32(h, p && p[0]);
            h = _hashNumber32(h, p && p[1]);
        }
        return h;
    }
    if (type === 'Polygon') {
        const rings = geom.coordinates || [];
        h = _fnv1aUpdateUint32(h, rings.length);
        for (const ring of rings) {
            h = _fnv1aUpdateUint32(h, ring.length || 0);
            for (const p of ring) {
                h = _hashNumber32(h, p && p[0]);
                h = _hashNumber32(h, p && p[1]);
            }
        }
        return h;
    }
    if (type === 'MultiPolygon') {
        const polys = geom.coordinates || [];
        h = _fnv1aUpdateUint32(h, polys.length);
        for (const poly of polys) {
            h = _fnv1aUpdateUint32(h, poly.length || 0);
            for (const ring of poly) {
                h = _fnv1aUpdateUint32(h, ring.length || 0);
                for (const p of ring) {
                    h = _hashNumber32(h, p && p[0]);
                    h = _hashNumber32(h, p && p[1]);
                }
            }
        }
        return h;
    }
    // fallback: serialize minimal coords
    try {
        const coords = geom.coordinates || [];
        for (const c of coords) {
            if (Array.isArray(c)) {
                h = _hashNumber32(h, c[0]);
                h = _hashNumber32(h, c[1]);
            } else {
                h = _hashNumber32(h, c);
            }
        }
    } catch (e) { }
    return h;
}

// Deep-equality for geometries with a small numeric epsilon to avoid false
// positives from float32 truncation. Used as a fallback when hashes differ.
function _coordsEqual(a, b, eps = 1e-6) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= eps;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!_coordsEqual(a[i], b[i], eps)) return false;
        }
        return true;
    }
    return false;
}

function geometryEquals(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.type !== b.type) return false;
    return _coordsEqual(a.coordinates, b.coordinates);
}

function computeGroupRawHash(group) {
    let h = _fnv1aInit();
    h = _fnv1aUpdateUint32(h, group.length || 0);
    for (const f of group) {
        // include feature id as part of raw signature
        h = _hashString(h, f && f.id != null ? String(f.id) : '');
        if (f && f.geometry) {
            const useHash = (f.__inGeomHash !== undefined) ? f.__inGeomHash : computeGeometryHash(f.geometry);
            h = _fnv1aUpdateUint32(h, useHash);
        }
        if (f && f.properties) {
            // iterate property keys in insertion order to avoid per-feature sort allocations
            for (const k of Object.keys(f.properties)) {
                h = _hashString(h, k);
                const v = f.properties[k];
                if (v == null) {
                    h = _fnv1aUpdateUint32(h, 0);
                } else if (typeof v === 'number') {
                    h = _hashNumber(h, v);
                } else {
                    h = _hashString(h, String(v));
                }
            }
        }
    }
    return h;
}

const _root = (typeof self !== 'undefined') ? self : ((typeof globalThis !== 'undefined') ? globalThis : {});

// Test hooks: allow tests to set pending diff and read cache size.
try {
    _root.__test_setPendingDiff = (v) => { _pendingDiff = v; };
    _root.__test_getCacheSize = () => (_cache && typeof _cache.size === 'number') ? _cache.size : 0;
} catch (e) { }

_root.onmessage = e => {
    // Accept either object messages, transferable JSON, or our binary geometry format
    let incoming = e && e.data;

    // diff ACK from main thread: apply pending diff to cache
    if (incoming && incoming.type === 'diff_ack') {
        try {
            if (_pendingDiff) {
                // apply adds (entries may be { feature, rawHash, geomHash } or plain Feature for older shape)
                for (const entry of _pendingDiff.addList || []) {
                    const f = entry && (entry.feature || entry);
                    if (f && f.id != null) {
                        try {
                            const geomHash = entry && entry.geomHash !== undefined ? entry.geomHash : computeGeometryHash(f.geometry);
                            const rawHash = entry && entry.rawHash !== undefined ? entry.rawHash : geomHash;
                            _cache.set(String(f.id), { feature: f, geomHash, rawHash, ts: Date.now() });
                        } catch (e) {
                            _cache.set(String(f.id), { feature: f, geomHash: 0, rawHash: 0, ts: Date.now() });
                        }
                    }
                }
                // apply updates (entries may be objects or plain Feature)
                for (const entry of _pendingDiff.updateList || []) {
                    const f = entry && (entry.feature || entry);
                    if (f && f.id != null) {
                        try {
                            const geomHash = entry && entry.geomHash !== undefined ? entry.geomHash : computeGeometryHash(f.geometry);
                            const rawHash = entry && entry.rawHash !== undefined ? entry.rawHash : geomHash;
                            _cache.set(String(f.id), { feature: f, geomHash, rawHash, ts: Date.now() });
                        } catch (e) {
                            _cache.set(String(f.id), { feature: f, geomHash: 0, rawHash: 0, ts: Date.now() });
                        }
                    }
                }
                // apply removals
                for (const id of _pendingDiff.removeList || []) {
                    try { _cache.delete(String(id)); } catch (e) { }
                }
                // enforce cache size
                while (_cache.size > _cacheSize) {
                    const oldest = _cache.keys().next();
                    if (oldest.done) break;
                    _cache.delete(oldest.value);
                }
                _pendingDiff = null;
            }
        } catch (err) {
            // ignore
        }
        return;
    }

    // request full cached GeoJSON from worker (main fallback)
    if (incoming && incoming.type === 'request_full') {
        try {
            const allFeatures = Array.from(_cache.values()).map(v => v.feature);
            const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(allFeatures || [], { pool: _abPool, useSharedKeyTable: true });
            postMessage({ type: 'geojson_bin', meta, keys, propsBuf: propsBuffer.buffer, coords: coordsArray.buffer }, [propsBuffer.buffer, coordsArray.buffer]);
        } catch (err) {
            // ignore
        }
        return;
    }

    // handle transferable JSON payloads ('features')
    if (incoming && incoming.type === 'features' && incoming.payload) {
        try {
            const buf = incoming.payload instanceof Uint8Array ? incoming.payload.buffer : incoming.payload;
            const text = textDecoder.decode(buf);
            incoming = JSON.parse(text);
        } catch (err) {
            incoming = {};
        }
    }

    // handle binary geometry payloads ('features_bin') with transferred Float32Array buffer and optional properties buffer (propsBuf)
    if (incoming && incoming.type === 'features_bin' && incoming.coords) {
        try {
            const meta = incoming.meta || [];
            const propsBuf = incoming.propsBuf !== undefined ? incoming.propsBuf : null;
            const coordsBuf = incoming.coords;
            const incomingKeys = incoming.keys || [];
            const featuresFromBin = decodeFeaturesBinary(meta, propsBuf, coordsBuf, incomingKeys);
            // preserve received buffers for potential reuse when encoding the response; include cache hint
            const receivedHashes = e.data && e.data.hashes ? e.data.hashes : null;
            if (receivedHashes && Array.isArray(featuresFromBin)) {
                for (const f of featuresFromBin) {
                    try {
                        const idStr = String(f && f.id != null ? f.id : '');
                        const h = receivedHashes[idStr];
                        if (h !== undefined) f.__inGeomHash = h;
                    } catch (e2) { }
                }
            }
            incoming = { features: featuresFromBin, tolerance: e.data && e.data.tolerance, promoteId: e.data && e.data.promoteId, _receivedPropsBuf: propsBuf, _receivedCoordsBuf: coordsBuf, _receivedKeys: incomingKeys, _receivedHashes: receivedHashes, cacheSize: e.data && e.data.cacheSize };
        } catch (err) {
            // fall through to treat incoming as-is
            incoming = incoming || {};
        }
    }

    const data = incoming || {};
    const features = data.features || [];
    const tolerance = data.tolerance || 0.00001;
    const mutate = true;

    // group features by id (preserve original id types using a Map)
    const groupedMap = new Map();
    for (const f of features) {
        const k = f.id;
        const arr = groupedMap.get(k) || [];
        arr.push(f);
        groupedMap.set(k, arr);
    }

    const geojson = { type: 'FeatureCollection', features: [] };

    // We'll avoid heavy processing when the raw group inputs haven't changed by
    // computing a raw-group hash and reusing cached processed features.
    const addList = [];
    const updateFullList = [];
    const updateIds = new Set();
    const newFeatures = [];
    const pendingCacheEntries = new Map(); // idStr -> { feature, rawHash, geomHash }

    for (const [id, group] of groupedMap.entries()) {
        const idStr = String(id);
        const rawHash = computeGroupRawHash(group);
        const cached = _cache.get(idStr);

        if (cached && cached.rawHash === rawHash) {
            // reuse processed feature from cache
            newFeatures.push(cached.feature);
            continue;
        }

        const { clipped, ...props } = (group[0] && group[0].properties) || {};
        let collection;
        if (group.length === 1) {
            const geom = group[0].geometry;
            let single = { type: 'Feature', id: id, geometry: geom, properties: props };
            if (geom.type === 'MultiPolygon') {
                collection = flatten(single);
            } else {
                collection = { type: 'FeatureCollection', features: [single] };
            }
            collection = simplify(collection, { tolerance, mutate });
        } else {
            collection = { type: 'FeatureCollection', features: group.map(f => ({ type: 'Feature', id: id, geometry: f.geometry, properties: props })) };
            if (collection.features.some(f => f.geometry.type === 'MultiPolygon')) {
                collection = flatten(collection);
            }
            collection = simplify(collection, { tolerance, mutate });
            if (group.some(f => f.properties && f.properties.clipped)) {
                collection = union(collection);
            }
            if (collection.type === 'Feature') {
                if (collection.geometry.type === 'MultiPolygon') {
                    collection = flatten(collection);
                } else {
                    collection = { type: 'FeatureCollection', features: [collection] };
                }
            } else {
                if (collection.features.some(f => f.geometry.type === 'MultiPolygon')) {
                    collection = flatten(collection);
                }
            }
        }


        collection.features = collection.features.map((f, i) => {
            const idx = `${id}-${i}`;
            const origGeom = f.geometry;
            if (origGeom && origGeom.type === 'Polygon') {
                const areaVal = polygonArea(f, units);
                f.geometry = safePolylabel(f, tolerance);
                f.properties = { ...props, _area: areaVal, _index: idx, _groupId: id };
            } else {
                console.log('Unexpected geometry type after union/simplify/flatten for id:' + id + ' - type:' + (origGeom && origGeom.type));
                f.properties = { ...props, _area: 0, _index: idx, _groupId: id };
            }
            f.id = idx;
            return f;
        });
        const finalCollection = {
            type: 'FeatureCollection',
            features: collection.features.map(f => {
                if (f.properties && f.properties._area != null && f.properties._area > 0) {
                    f.properties._localSortKey = biggest / f.properties._area;
                    f.properties._globalSortKey = 1 / f.properties._area;
                } else {
                    f.properties._localSortKey = 1e+9999;
                    f.properties._globalSortKey = 1e+9999;
                }
                return f; 
            })
        }



        collection = combine(collection);

        const feature = { type: 'Feature', id: id, geometry: collection.features[0].geometry, properties: props }

        const geomHashNew = computeGeometryHash(feature.geometry);

        if (!cached) {
            addList.push(feature);
        } else if (geomHashNew !== (cached.geomHash || 0)) {
            // If hashes differ, perform a deep-equality check using float epsilon
            // to avoid false positives caused by float32 truncation.
            try {
                if (!geometryEquals(feature.geometry, cached.feature.geometry)) {
                    updateFullList.push(feature);
                    updateIds.add(idStr);
                }
            } catch (e) {
                updateFullList.push(feature);
                updateIds.add(idStr);
            }
        }

        pendingCacheEntries.set(idStr, { feature, rawHash, geomHash: geomHashNew });
        newFeatures.push(feature);
    }

    // If a promoteId was provided by the sender, ensure each feature has that property set to its id
    const promoteId = data.promoteId;
    if (promoteId) {
        for (const f of newFeatures) {
            if (!f.properties) f.properties = {};
            if (f.id != null && (f.properties[promoteId] === undefined || f.properties[promoteId] === null)) {
                f.properties[promoteId] = f.id;
            }
        }
    }

    // compute diffs vs cache and either send full geojson (initial) or a diff
    try {
        // update cacheSize from incoming hint if provided
        if (incoming && typeof incoming.cacheSize === 'number' && incoming.cacheSize > 0) {
            _cacheSize = incoming.cacheSize;
        }

        const finalFeatures = (newFeatures && newFeatures.length) ? newFeatures : (geojson.features || []);

        if (_cache.size === 0) {
            // initial run: seed cache using pendingCacheEntries when available
            for (const [idStr, entry] of pendingCacheEntries.entries()) {
                try {
                    _cache.set(idStr, { feature: entry.feature, geomHash: entry.geomHash, rawHash: entry.rawHash, ts: Date.now() });
                } catch (e) {
                    _cache.set(idStr, { feature: entry.feature, geomHash: entry.geomHash || 0, rawHash: entry.rawHash || 0, ts: Date.now() });
                }
            }
            const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(finalFeatures || [], { pool: _abPool });
            postMessage({ type: 'geojson_bin', meta, keys, propsBuf: propsBuffer.buffer, coords: coordsArray.buffer }, [propsBuffer.buffer, coordsArray.buffer]);
            return;
        }

        // compute evictions needed after adding
        const addCount = addList.length;
        let evictCount = Math.max(0, (_cache.size + addCount) - _cacheSize);
        const removeList = [];
        if (evictCount > 0) {
            for (const k of _cache.keys()) {
                if (removeList.length >= evictCount) break;
                if (updateIds.has(k)) continue; // keep updated ones
                const cached = _cache.get(k);
                removeList.push(cached && cached.feature && cached.feature.id != null ? cached.feature.id : k);
            }
            if (removeList.length < evictCount) {
                for (const k of _cache.keys()) {
                    if (removeList.length >= evictCount) break;
                    if (removeList.includes(k)) continue;
                    const cached = _cache.get(k);
                    removeList.push(cached && cached.feature && cached.feature.id != null ? cached.feature.id : k);
                }
            }
        }

        // if nothing changed and no eviction, skip responding
        if (addList.length === 0 && updateFullList.length === 0 && removeList.length === 0) {
            return;
        }

        // build update diffs in MapLibre expected format (include property removals)
        const updateDiffs = updateFullList.map(f => {
            const diff = { id: f.id };
            if (f.geometry) diff.newGeometry = f.geometry;

            const cached = _cache.get(String(f.id));
            const oldProps = (cached && cached.feature && cached.feature.properties) ? cached.feature.properties : {};
            const newProps = f.properties || {};

            const oldKeys = Object.keys(oldProps);
            const newKeys = Object.keys(newProps);

            // decide if all properties are removed
            if (newKeys.length === 0 && oldKeys.length > 0) {
                diff.removeAllProperties = true;
            } else {
                // properties removed explicitly
                const removed = oldKeys.filter(k => !(k in newProps));
                if (removed.length) diff.removeProperties = removed;
            }

            // properties added or updated
            const addOrUpdate = newKeys.filter(k => {
                // treat objects as changed if references differ
                return newProps[k] !== oldProps[k];
            }).map(k => ({ key: k, value: newProps[k] }));
            if (addOrUpdate.length) diff.addOrUpdateProperties = addOrUpdate;

            return diff;
        });

        // prepare pending diff entries including rawHash and geomHash so the
        // main-thread ack can commit cache entries without recomputing hashes.
        const addEntries = addList.map(f => {
            const e = pendingCacheEntries.get(String(f.id));
            if (e) return { feature: e.feature, rawHash: e.rawHash, geomHash: e.geomHash };
            try { const gh = computeGeometryHash(f.geometry); return { feature: f, rawHash: gh, geomHash: gh }; } catch (err) { return { feature: f, rawHash: 0, geomHash: 0 }; }
        });
        const updateEntries = updateFullList.map(f => {
            const e = pendingCacheEntries.get(String(f.id));
            if (e) return { feature: e.feature, rawHash: e.rawHash, geomHash: e.geomHash };
            try { const gh = computeGeometryHash(f.geometry); return { feature: f, rawHash: gh, geomHash: gh }; } catch (err) { return { feature: f, rawHash: 0, geomHash: 0 }; }
        });

        // set pending diff so we apply it on ack (store entries with hashes)
        _pendingDiff = { addList: addEntries, updateList: updateEntries, removeList };

        // Build a binary-transferable diff message. We encode add/update feature
        // lists using the compact binary format (meta/keys/propsBuf/coords) and
        // send property diffs (updateDiffs) as a small JSON array.
        try {
            const msg = { type: 'geojson_diff_bin' };
            // removals
            if (removeList.length) {
                if (_cache.size > 0 && removeList.length >= _cache.size) {
                    msg.removeAll = true;
                } else {
                    msg.removeList = removeList;
                }
            }

            const transfer = [];

            // encode adds
            // encode adds
            if (addList.length) {
                const { meta: addMeta, keys: addKeys, propsBuffer: addPropsBuf, coordsArray: addCoords } = encodeFeaturesBinary(addList || [], { pool: _abPool, useSharedKeyTable: true });
                msg.add = { meta: addMeta, keys: addKeys, propsBuf: addPropsBuf.buffer, coords: addCoords.buffer };
                if (addPropsBuf && addPropsBuf.buffer) transfer.push(addPropsBuf.buffer);
                if (addCoords && addCoords.buffer) transfer.push(addCoords.buffer);
            }

            // encode updates (full-feature updates)
            if (updateFullList.length) {
                const { meta: updMeta, keys: updKeys, propsBuffer: updPropsBuf, coordsArray: updCoords } = encodeFeaturesBinary(updateFullList || [], { pool: _abPool, useSharedKeyTable: true });
                msg.update = { meta: updMeta, keys: updKeys, propsBuf: updPropsBuf.buffer, coords: updCoords.buffer };
                if (updPropsBuf && updPropsBuf.buffer) transfer.push(updPropsBuf.buffer);
                if (updCoords && updCoords.buffer) transfer.push(updCoords.buffer);
            }

            if (updateDiffs.length) {
                // compact property diffs: build a shared keys table and a
                // concatenated props buffer with offsets to avoid cloning large
                // JS objects for property updates.
                const upKeys = [];
                const upKeyIndex = new Map();
                const upChunks = [];
                let upOffset = 0;
                // transient cache for serialized primitive values in update diffs
                const upSerializeCache = new Map();
                const updateMeta = updateDiffs.map(d => {
                    const entry = { id: d.id };
                    if (d.removeAllProperties) entry.removeAllProperties = true;
                    if (Array.isArray(d.removeProperties) && d.removeProperties.length) {
                        entry.removeProperties = d.removeProperties.map(k => {
                            let ki = upKeyIndex.get(k);
                            if (ki === undefined) { ki = upKeys.length; upKeys.push(k); upKeyIndex.set(k, ki); }
                            return ki;
                        });
                    }
                    if (Array.isArray(d.addOrUpdateProperties) && d.addOrUpdateProperties.length) {
                        entry.addOrUpdate = d.addOrUpdateProperties.map(p => {
                            const k = p.key;
                            let ki = upKeyIndex.get(k);
                            if (ki === undefined) { ki = upKeys.length; upKeys.push(k); upKeyIndex.set(k, ki); }
                            const v = p.value;
                            let enc;
                            if (v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
                                const cacheKey = typeof v + '|' + String(v);
                                enc = upSerializeCache.get(cacheKey);
                                if (!enc) {
                                    const valJson = JSON.stringify(v);
                                    enc = textEncoder.encode(valJson);
                                    upSerializeCache.set(cacheKey, enc);
                                }
                            } else {
                                const valJson = JSON.stringify(v);
                                enc = textEncoder.encode(valJson);
                            }
                            upChunks.push(enc);
                            const off = upOffset;
                            const len = enc.length;
                            upOffset += len;
                            return [ki, off, len];
                        });
                    }
                    return entry;
                });
                let upPropsBuf = null;
                if (upOffset > 0) {
                    const buf = _abPool.rent(upOffset);
                    upPropsBuf = new Uint8Array(buf, 0, upOffset);
                    let ppos = 0;
                    for (const c of upChunks) {
                        upPropsBuf.set(c, ppos);
                        ppos += c.length;
                    }
                } else {
                    upPropsBuf = new Uint8Array(0);
                }
                msg.updateDiffsMeta = updateMeta;
                msg.updateKeys = upKeys;
                if (upPropsBuf && upPropsBuf.buffer && upPropsBuf.byteLength) {
                    msg.updatePropsBuf = upPropsBuf.buffer;
                    transfer.push(upPropsBuf.buffer);
                }
            }

            postMessage(msg, transfer);
            return;
        } catch (err) {
            // if binary encoding fails, fallback to JS diff
            try {
                const diffObj = {};
                if (removeList.length) {
                    if (_cache.size > 0 && removeList.length >= _cache.size) diffObj.removeAll = true; else diffObj.remove = removeList;
                }
                if (addList.length) diffObj.add = addList;
                if (updateDiffs.length) diffObj.update = updateDiffs;
                postMessage({ type: 'geojson_diff', diff: diffObj });
                return;
            } catch (err2) {
                // give up and send JSON fallback
            }
        }
        return;
    } catch (err) {
        // fallback: send JSON string as transferable
        try {
            const json = JSON.stringify(geojson);
            const encoded = textEncoder.encode(json);
            postMessage({ type: 'geojson', payload: encoded.buffer }, [encoded.buffer]);
        } catch (err2) {
            postMessage(geojson);
        }
    }
};