import { union } from "@turf/union";
import { combine } from "@turf/combine";
import { flatten } from "@turf/flatten";
import polylabel from 'polylabel';
import { simplify } from "@turf/simplify";
import { encodeFeaturesBinary, decodeFeaturesBinary, ArrayBufferPool } from './utils.js';

const _abPool = new ArrayBufferPool();

// Feature cache: Map<id, { feature, geomHash, ts }>
const _cache = new Map();
let _cacheSize = 10000;
let _pendingDiff = null; // { addList, updateList, removeList }

// Geometry sanitization helpers to ensure coordinates are [lng, lat]
function isFiniteNumber(n) {
    return typeof n === 'number' && isFinite(n);
}

function isValidLngLatPair(pair) {
    if (!Array.isArray(pair) || pair.length < 2) return false;
    const lng = Number(pair[0]);
    const lat = Number(pair[1]);
    if (!isFiniteNumber(lng) || !isFiniteNumber(lat)) return false;
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function sanitizeCoordinates(coords) {
    if (!Array.isArray(coords)) return [0, 0];
    if (coords.length === 0) return coords;
    if (typeof coords[0] === 'number') {
        const x = Number(coords[0]);
        const y = Number(coords[1]);
        if (isValidLngLatPair([x, y])) return [x, y];
        if (isValidLngLatPair([y, x])) return [y, x];
        return [0, 0];
    }
    return coords.map(sanitizeCoordinates);
}

function sanitizeGeometry(geom) {
    if (!geom || !geom.type) return { type: 'Point', coordinates: [0, 0] };
    try {
        const t = geom.type;
        geom.coordinates = sanitizeCoordinates(geom.coordinates);
        // ensure Point/LineString/Polygon types remain valid minimal shapes
        if (t === 'Point') {
            if (!Array.isArray(geom.coordinates) || geom.coordinates.length < 2) geom.coordinates = [0, 0];
        }
        return { type: t, coordinates: geom.coordinates };
    } catch (err) {
        return { type: 'Point', coordinates: [0, 0] };
    }
}

// Safe polylabel wrapper with a centroid fallback for degenerate polygons
function _ringArea(ring) {
    let area = 0;
    for (let i = 0; i < ring.length; i++) {
        const j = (i + 1) % ring.length;
        const xi = Number(ring[i] && ring[i][0]) || 0;
        const yi = Number(ring[i] && ring[i][1]) || 0;
        const xj = Number(ring[j] && ring[j][0]) || 0;
        const yj = Number(ring[j] && ring[j][1]) || 0;
        area += xi * yj - xj * yi;
    }
    return area / 2;
}

function _ringCentroid(ring) {
    let cx = 0, cy = 0, areaTimes2 = 0;
    for (let i = 0; i < ring.length; i++) {
        const j = (i + 1) % ring.length;
        const xi = Number(ring[i] && ring[i][0]) || 0;
        const yi = Number(ring[i] && ring[i][1]) || 0;
        const xj = Number(ring[j] && ring[j][0]) || 0;
        const yj = Number(ring[j] && ring[j][1]) || 0;
        const cross = xi * yj - xj * yi;
        cx += (xi + xj) * cross;
        cy += (yi + yj) * cross;
        areaTimes2 += cross;
    }
    const area = areaTimes2 / 2;
    if (!Number.isFinite(area) || Math.abs(area) < 1e-12) {
        // degenerate: fallback to simple average
        let sx = 0, sy = 0, n = 0;
        for (const p of ring) {
            const x = Number(p && p[0]);
            const y = Number(p && p[1]);
            if (Number.isFinite(x) && Number.isFinite(y)) { sx += x; sy += y; n++; }
        }
        return n ? [sx / n, sy / n] : [0, 0];
    }
    const cxFinal = cx / (6 * area);
    const cyFinal = cy / (6 * area);
    return [cxFinal, cyFinal];
}

function _polygonCentroid(polygon) {
    if (!Array.isArray(polygon) || polygon.length === 0) return null;
    const outer = polygon[0];
    if (!Array.isArray(outer) || outer.length === 0) return null;
    return _ringCentroid(outer);
}

function _multiPolygonCentroid(multipolygon) {
    if (!Array.isArray(multipolygon) || multipolygon.length === 0) return null;
    let best = null;
    let bestArea = 0;
    for (const poly of multipolygon) {
        if (!Array.isArray(poly) || !Array.isArray(poly[0])) continue;
        const area = Math.abs(_ringArea(poly[0]));
        if (area > bestArea) {
            bestArea = area;
            best = poly[0];
        }
    }
    if (best) return _ringCentroid(best);
    return null;
}

function safePolylabel(coords, precision) {
    try {
        const pt = polylabel(coords, precision);
        if (Array.isArray(pt) && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) return [pt[0],pt[1]];
    } catch (e) {
        // continue to fallback
    }
    // fallback to centroid-like heuristics
    try {
        if (!Array.isArray(coords) || coords.length === 0) return [0, 0];
        // detect MultiPolygon (depth 3)
        if (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && Array.isArray(coords[0][0][0])) {
            const c = _multiPolygonCentroid(coords);
            if (c) return c;
        }
        // treat as Polygon
        const c = _polygonCentroid(coords);
        if (c) return c;
    } catch (err) {
        // ignore
    }
    return [0, 0];
}

// Geometry hashing utilities (FNV-1a over float64 bit representation)
const _hashBuf = new ArrayBuffer(8);
const _hashView = new DataView(_hashBuf);
function _fnv1aInit() { return 2166136261 >>> 0; }
function _fnv1aUpdateUint32(h, v) { h ^= v >>> 0; h = Math.imul(h, 16777619) >>> 0; return h; }
function _hashNumber(h, num) {
    const n = Number(num) || 0;
    _hashView.setFloat64(0, n, true);
    h = _fnv1aUpdateUint32(h, _hashView.getUint32(0, true));
    h = _fnv1aUpdateUint32(h, _hashView.getUint32(4, true));
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
        h = _hashNumber(h, c[0]);
        h = _hashNumber(h, c[1]);
        return h;
    }
    if (type === 'LineString' || type === 'MultiPoint') {
        const coords = geom.coordinates || [];
        for (const p of coords) {
            h = _hashNumber(h, p && p[0]);
            h = _hashNumber(h, p && p[1]);
        }
        return h;
    }
    if (type === 'Polygon') {
        const rings = geom.coordinates || [];
        h = _fnv1aUpdateUint32(h, rings.length);
        for (const ring of rings) {
            h = _fnv1aUpdateUint32(h, ring.length || 0);
            for (const p of ring) {
                h = _hashNumber(h, p && p[0]);
                h = _hashNumber(h, p && p[1]);
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
                    h = _hashNumber(h, p && p[0]);
                    h = _hashNumber(h, p && p[1]);
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
                h = _hashNumber(h, c[0]);
                h = _hashNumber(h, c[1]);
            } else {
                h = _hashNumber(h, c);
            }
        }
    } catch (e) {}
    return h;
}

onmessage = e => {
    // Accept either object messages, transferable JSON, or our binary geometry format
    let incoming = e && e.data;

    // diff ACK from main thread: apply pending diff to cache
    if (incoming && incoming.type === 'diff_ack') {
        try {
            if (_pendingDiff) {
                // apply adds
                for (const f of _pendingDiff.addList || []) {
                    if (f && f.id != null) {
                        try {
                            const gh = computeGeometryHash(f.geometry);
                            _cache.set(String(f.id), { feature: f, geomHash: gh, ts: Date.now() });
                        } catch (e) {
                            _cache.set(String(f.id), { feature: f, geomHash: 0, ts: Date.now() });
                        }
                    }
                }
                // apply updates (re-insert to mark recent)
                for (const f of _pendingDiff.updateList || []) {
                    if (f && f.id != null) {
                        try {
                            const gh = computeGeometryHash(f.geometry);
                            _cache.set(String(f.id), { feature: f, geomHash: gh, ts: Date.now() });
                        } catch (e) {
                            _cache.set(String(f.id), { feature: f, geomHash: 0, ts: Date.now() });
                        }
                    }
                }
                // apply removals
                for (const id of _pendingDiff.removeList || []) {
                    try { _cache.delete(String(id)); } catch (e) {}
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
            const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(allFeatures || [], { pool: _abPool });
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
            const text = new TextDecoder().decode(buf);
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
            incoming = { features: featuresFromBin, tolerance: e.data && e.data.tolerance, promoteId: e.data && e.data.promoteId, _receivedPropsBuf: propsBuf, _receivedCoordsBuf: coordsBuf, _receivedKeys: incomingKeys, cacheSize: e.data && e.data.cacheSize };
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

    const geojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (const [id, group] of groupedMap.entries()) {
        const { clipped, ...props } = (group[0] && group[0].properties) || {};
        let feature;
        if (group.length === 1) {
            const geom = group[0].geometry;
            feature = simplify({ type: 'Feature', id: id, geometry: geom, properties: props }, { tolerance, mutate });
            try {
                geom.coordinates = safePolylabel(geom.coordinates, tolerance);
                geom.type = 'Point';
            } catch (err) {
                // leave original geometry on failure
            }
        } else {
            let collection = {
                type: 'FeatureCollection',
                features: group.map(f => (simplify({ type: 'Feature', geometry: f.geometry }, { tolerance, mutate })))
            };
            try {
                if (group.some(f => f.properties && f.properties.clipped)) {
                    collection = union(collection);
                }
                collection = flatten(collection);
                collection.features.forEach(f => {
                    try {
                        f.geometry.coordinates = safePolylabel(f.geometry.coordinates, tolerance);
                        f.geometry.type = 'Point';
                    } catch (err) {
                        // ignore polylabel failures per feature
                    }
                    return f;
                });
                collection = combine(collection);
                feature = (collection && collection.features && collection.features[0]) ? collection.features[0] : { type: 'Feature', id: id, geometry: group[0].geometry, properties: props };
            } catch (err) {
                // union/flatten/combine can throw on invalid geometries; fall back to first geometry
                feature = { type: 'Feature', id: id, geometry: group[0].geometry, properties: props };
            }
            feature.id = id;
            feature.properties = props;
        }
        // sanitize geometry to ensure valid [lng, lat] ordering and numeric values
        try { feature.geometry = sanitizeGeometry(feature.geometry); } catch (e) {}
        geojson.features.push(feature);
    }

    // If a promoteId was provided by the sender, ensure each feature has that property set to its id
    const promoteId = data.promoteId;
    if (promoteId) {
        for (const f of geojson.features) {
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

        const newFeatures = geojson.features || [];

        if (_cache.size === 0) {
            // initial run: seed cache and return whole geojson
            for (const f of newFeatures) {
                if (f && f.id != null) {
                    try {
                        const gh = computeGeometryHash(f.geometry);
                        _cache.set(String(f.id), { feature: f, geomHash: gh, ts: Date.now() });
                    } catch (e) {
                        _cache.set(String(f.id), { feature: f, geomHash: 0, ts: Date.now() });
                    }
                    // enforce size as we seed
                    while (_cache.size > _cacheSize) {
                        const oldest = _cache.keys().next();
                        if (oldest.done) break;
                        _cache.delete(oldest.value);
                    }
                }
            }
            const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(newFeatures || [], { pool: _abPool });
            postMessage({ type: 'geojson_bin', meta, keys, propsBuf: propsBuffer.buffer, coords: coordsArray.buffer }, [propsBuffer.buffer, coordsArray.buffer]);
            return;
        }

        // subsequent runs: diff against cache
        const addList = [];
        const updateFullList = [];
        const updateIds = new Set();

            for (const f of newFeatures) {
            if (!f || f.id == null) continue;
            const id = String(f.id);
            const cached = _cache.get(id);
            if (!cached) {
                addList.push(f);
            } else {
                let geomHash = 0;
                try { geomHash = computeGeometryHash(f.geometry); } catch (e) { geomHash = 0; }
                if (geomHash !== (cached.geomHash || 0)) {
                    updateFullList.push(f);
                    updateIds.add(id);
                }
            }
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

        // set pending diff so we apply it on ack (store full features for commit)
        _pendingDiff = { addList, updateList: updateFullList, removeList };

        const diffObj = {};
        if (removeList.length) {
            // if we're evicting the entire cache, use removeAll for efficiency
            if (_cache.size > 0 && removeList.length >= _cache.size) {
                diffObj.removeAll = true;
            } else {
                diffObj.remove = removeList;
            }
        }
        if (addList.length) diffObj.add = addList;
        if (updateDiffs.length) diffObj.update = updateDiffs;

        postMessage({ type: 'geojson_diff', diff: diffObj });
        return;
    } catch (err) {
        // fallback: send JSON string as transferable
        try {
            const encoder = new TextEncoder();
            const json = JSON.stringify(geojson);
            const encoded = encoder.encode(json);
            postMessage({ type: 'geojson', payload: encoded.buffer }, [encoded.buffer]);
        } catch (err2) {
            postMessage(geojson);
        }
    }
};
