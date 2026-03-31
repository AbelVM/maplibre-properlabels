// Shared utilities for encoding/decoding features into a compact binary transferable
// Format:
//  - meta: array of per-feature metadata (coords offsets/lengths, prop offsets/lengths, ring info)
//  - keys: array of property keys (deduplicated)
//  - propsBuffer: concatenated JSON-encoded property values (Uint8Array)
//  - coordsArray: Float32Array of coordinates [x,y,x,y,...]

// Simple ArrayBuffer pool for reuse. Rents arrays sized to the next power-of-two.
export class ArrayBufferPool {
    constructor() {
        this.map = new Map(); // size -> Array of ArrayBuffers
    }

    static _nextPow2(v) {
        if (v <= 0) return 0;
        v = v - 1 >>> 0;
        v |= v >> 1;
        v |= v >> 2;
        v |= v >> 4;
        v |= v >> 8;
        v |= v >> 16;
        return (v + 1) >>> 0;
    }

    rent(minSize) {
        const size = ArrayBufferPool._nextPow2(minSize || 1);
        const list = this.map.get(size);
        if (list && list.length) return list.pop();
        return new ArrayBuffer(size);
    }

    release(buffer) {
        if (!buffer || !buffer.byteLength) return;
        const size = ArrayBufferPool._nextPow2(buffer.byteLength);
        let list = this.map.get(size);
        if (!list) {
            list = [];
            this.map.set(size, list);
        }
        list.push(buffer);
    }
}

// Shared text encoder/decoder reused across modules to avoid repeated allocations
export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder();

// Shared key table to avoid per-encode key Map allocations. This lives per
// module instance (main thread or worker) and grows as new property keys are
// encountered to reduce repeated Map/Array allocations across encodes.
export const sharedKeyTable = { keys: [], index: new Map() };

// One-time warning flag for decoding invalid floats
let _decodeInvalidFloatWarned = false;
// Key-indexed properties encoder/decoder. encodeFeaturesBinary supports optional
// preallocated buffers or a pool via options: { propsBuffer, coordsBuffer, pool }.
export function encodeFeaturesBinary(features, options = {}) {
    const meta = [];
    const coordsList = [];
    const propChunks = [];
    // reuse shared encoder to reduce allocations
    const useShared = !!options.useSharedKeyTable;
    let keys;
    let keyIndex;
    if (useShared) {
        keys = sharedKeyTable.keys;
        keyIndex = sharedKeyTable.index;
    } else {
        keys = [];
        keyIndex = new Map();
    }
    let floatOffset = 0;
    let propByteOffset = 0;

    const pushPoint = (p) => {
        if (Array.isArray(p)) {
            const x = Number(p[0]);
            const y = Number(p[1]);
            coordsList.push(Number.isFinite(x) ? x : 0, Number.isFinite(y) ? y : 0);
        } else if (p && (typeof p.x === 'number' || typeof p.y === 'number')) {
            const x = Number(p.x);
            const y = Number(p.y);
            coordsList.push(Number.isFinite(x) ? x : 0, Number.isFinite(y) ? y : 0);
        } else {
            coordsList.push(0, 0);
        }
    };

    for (const feat of features) {
        const id = feat.id == null ? '' : String(feat.id);
        const geom = feat.geometry || {};
        const type = geom.type || 'Unknown';
        const entry = { id, type, coordsOffset: floatOffset, coordsLength: 0 };

        // geometry
        if (type === 'Point') {
            const c = geom.coordinates || [];
            pushPoint(c);
            entry.coordsLength = 2;
        } else if (type === 'LineString' || type === 'MultiPoint') {
            const coords = geom.coordinates || [];
            for (const p of coords) pushPoint(p);
            entry.coordsLength = (coords.length || 0) * 2;
        } else if (type === 'Polygon') {
            const rings = geom.coordinates || [];
            entry.ringLengths = [];
            for (const ring of rings) {
                entry.ringLengths.push(ring.length || 0);
                for (const p of ring) pushPoint(p);
            }
            entry.coordsLength = (entry.ringLengths.reduce((a, b) => a + b, 0)) * 2;
        } else if (type === 'MultiPolygon') {
            const polys = geom.coordinates || [];
            entry.polygonRingCounts = [];
            entry.ringLengths = [];
            for (const poly of polys) {
                entry.polygonRingCounts.push(poly.length || 0);
                for (const ring of poly) {
                    entry.ringLengths.push(ring.length || 0);
                    for (const p of ring) pushPoint(p);
                }
            }
            entry.coordsLength = (entry.ringLengths.reduce((a, b) => a + b, 0)) * 2;
        } else {
            entry.coordsLength = 0;
        }

        // properties -> key-indexed chunks
        const props = feat.properties || {};
        const propList = [];
        for (const k of Object.keys(props)) {
            let ki = keyIndex.get(k);
            if (ki === undefined) {
                ki = keys.length;
                keys.push(k);
                keyIndex.set(k, ki);
            }
            const valJson = JSON.stringify(props[k]);
            const enc = textEncoder.encode(valJson);
            propChunks.push(enc);
            propList.push([ki, propByteOffset, enc.length]);
            propByteOffset += enc.length;
        }

        entry.props = propList;
        floatOffset += entry.coordsLength;
        meta.push(entry);
    }

    // allocate or reuse properties buffer
    let propsUint8;
    if (options.propsBuffer) {
        if (options.propsBuffer instanceof Uint8Array) {
            propsUint8 = options.propsBuffer.subarray(0, propByteOffset);
        } else {
            propsUint8 = new Uint8Array(options.propsBuffer, 0, propByteOffset);
        }
        if (propsUint8.byteLength < propByteOffset) {
            propsUint8 = new Uint8Array(propByteOffset);
        }
    } else if (options.pool && propByteOffset > 0) {
        const buf = options.pool.rent(propByteOffset);
        propsUint8 = new Uint8Array(buf, 0, propByteOffset);
    } else {
        propsUint8 = new Uint8Array(propByteOffset);
    }

    // copy property chunks into buffer
    let ppos = 0;
    for (const chunk of propChunks) {
        propsUint8.set(chunk, ppos);
        ppos += chunk.length;
    }

    // allocate or reuse coords buffer
    const numFloats = coordsList.length;
    let coordsArray;
    if (options.coordsBuffer) {
        if (options.coordsBuffer instanceof ArrayBuffer) {
            coordsArray = new Float32Array(options.coordsBuffer, 0, numFloats);
        } else if (options.coordsBuffer instanceof Float32Array) {
            coordsArray = options.coordsBuffer.subarray(0, numFloats);
        } else {
            coordsArray = new Float32Array(numFloats);
        }
        if (coordsArray.length < numFloats) coordsArray = new Float32Array(numFloats);
    } else if (options.pool && numFloats > 0) {
        const buf = options.pool.rent(numFloats * 4);
        coordsArray = new Float32Array(buf, 0, numFloats);
    } else {
        coordsArray = new Float32Array(numFloats);
    }

    // fill coords
    if (coordsArray.length > 0) coordsArray.set(coordsList);

    return { meta, keys, propsBuffer: propsUint8, coordsArray };
}

export function decodeFeaturesBinary(meta, propsBuf, coordsBuf, keys) {
    const coords = coordsBuf instanceof Float32Array ? coordsBuf : new Float32Array(coordsBuf);
    const propsBytes = propsBuf instanceof Uint8Array ? propsBuf : (propsBuf ? new Uint8Array(propsBuf) : new Uint8Array(0));
    // reuse shared decoder to reduce allocations
    const features = [];
    for (let i = 0; i < (meta.length || 0); i++) {
        const m = meta[i] || {};
        const id = m.id;
        const props = {};
        if (Array.isArray(m.props) && m.props.length && keys && keys.length) {
            for (const p of m.props) {
                const [ki, off, len] = p;
                try {
                    const slice = propsBytes.subarray(off, off + len);
                    props[keys[ki]] = JSON.parse(textDecoder.decode(slice));
                } catch (err) {
                    // ignore property parse errors for robustness
                }
            }
        }

        const type = m.type || 'Unknown';
        let idx = m.coordsOffset || 0;
        const end = idx + (m.coordsLength || 0);
        let geometry = null;
        if (type === 'Point') {
            const rawX = coords[idx];
            const rawY = coords[idx + 1];
            const x = Number.isFinite(rawX) ? Math.max(-180, Math.min(180, rawX)) : 0;
            const y = Number.isFinite(rawY) ? Math.max(-90, Math.min(90, rawY)) : 0;
            if ((!Number.isFinite(rawX) || !Number.isFinite(rawY)) && !_decodeInvalidFloatWarned) {
                _decodeInvalidFloatWarned = true;
                try { console.warn('decodeFeaturesBinary: encountered non-finite coordinate, replacing with safe value', { index: i, id: id, rawX, rawY }); } catch (e) {}
            }
            geometry = { type: 'Point', coordinates: [x, y] };
        } else if (type === 'LineString' || type === 'MultiPoint') {
            const arr = [];
            for (; idx < end; idx += 2) {
                const rawX = coords[idx];
                const rawY = coords[idx + 1];
                const x = Number.isFinite(rawX) ? Math.max(-180, Math.min(180, rawX)) : 0;
                const y = Number.isFinite(rawY) ? Math.max(-90, Math.min(90, rawY)) : 0;
                if ((!Number.isFinite(rawX) || !Number.isFinite(rawY)) && !_decodeInvalidFloatWarned) {
                    _decodeInvalidFloatWarned = true;
                    try { console.warn('decodeFeaturesBinary: encountered non-finite coordinate in linestring/multipoint, replacing with safe value', { index: i, id: id, rawX, rawY }); } catch (e) {}
                }
                arr.push([x, y]);
            }
            geometry = { type, coordinates: arr };
        } else if (type === 'Polygon') {
            const rings = [];
            const ringLengths = m.ringLengths || [];
            for (const ringLen of ringLengths) {
                const ring = [];
                for (let k = 0; k < ringLen; k++) {
                    const rawX = coords[idx];
                    const rawY = coords[idx + 1];
                    const x = Number.isFinite(rawX) ? Math.max(-180, Math.min(180, rawX)) : 0;
                    const y = Number.isFinite(rawY) ? Math.max(-90, Math.min(90, rawY)) : 0;
                    if ((!Number.isFinite(rawX) || !Number.isFinite(rawY)) && !_decodeInvalidFloatWarned) {
                        _decodeInvalidFloatWarned = true;
                        try { console.warn('decodeFeaturesBinary: encountered non-finite coordinate in polygon, replacing with safe value', { index: i, id: id, rawX, rawY }); } catch (e) {}
                    }
                    ring.push([x, y]);
                    idx += 2;
                }
                rings.push(ring);
            }
            geometry = { type: 'Polygon', coordinates: rings };
        } else if (type === 'MultiPolygon') {
            const polys = [];
            const polygonRingCounts = m.polygonRingCounts || [];
            const ringLengths = m.ringLengths || [];
            let ringLenIndex = 0;
            for (const polyRingCount of polygonRingCounts) {
                const polyRings = [];
                for (let r = 0; r < polyRingCount; r++) {
                    const ringLen = ringLengths[ringLenIndex++] || 0;
                    const ring = [];
                    for (let k = 0; k < ringLen; k++) {
                        const rawX = coords[idx];
                        const rawY = coords[idx + 1];
                        const x = Number.isFinite(rawX) ? Math.max(-180, Math.min(180, rawX)) : 0;
                        const y = Number.isFinite(rawY) ? Math.max(-90, Math.min(90, rawY)) : 0;
                        if ((!Number.isFinite(rawX) || !Number.isFinite(rawY)) && !_decodeInvalidFloatWarned) {
                            _decodeInvalidFloatWarned = true;
                            try { console.warn('decodeFeaturesBinary: encountered non-finite coordinate in multipolygon, replacing with safe value', { index: i, id: id, rawX, rawY }); } catch (e) {}
                        }
                        ring.push([x, y]);
                        idx += 2;
                    }
                    polyRings.push(ring);
                }
                polys.push(polyRings);
            }
            geometry = { type: 'MultiPolygon', coordinates: polys };
        } else {
            if (idx < end) {
                const rawX = coords[idx];
                const rawY = coords[idx + 1];
                const x = Number.isFinite(rawX) ? Math.max(-180, Math.min(180, rawX)) : 0;
                const y = Number.isFinite(rawY) ? Math.max(-90, Math.min(90, rawY)) : 0;
                if ((!Number.isFinite(rawX) || !Number.isFinite(rawY)) && !_decodeInvalidFloatWarned) {
                    _decodeInvalidFloatWarned = true;
                    try { console.warn('decodeFeaturesBinary: encountered non-finite coordinate in fallback path, replacing with safe value', { index: i, id: id, rawX, rawY }); } catch (e) {}
                }
                geometry = { type: 'Point', coordinates: [x, y] };
            }
        }
        // ensure geometry is a valid GeoJSON geometry object (updateData requires non-null geometry)
        if (geometry == null) geometry = { type: 'Point', coordinates: [0, 0] };
        // ensure properties is an object
        const safeProps = (props && typeof props === 'object') ? props : {};
        features.push({ type: 'Feature', id, geometry, properties: safeProps });
    }
    return features;
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

export function computeGeometryHash(geom) {
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

export function geometryEquals(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.type !== b.type) return false;
    return _coordsEqual(a.coordinates, b.coordinates);
}

