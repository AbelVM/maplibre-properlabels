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

// Key-indexed properties encoder/decoder. encodeFeaturesBinary supports optional
// preallocated buffers or a pool via options: { propsBuffer, coordsBuffer, pool }.
export function encodeFeaturesBinary(features, options = {}) {
    const meta = [];
    const coordsList = [];
    const propChunks = [];
    const encoder = new TextEncoder();
    const keys = [];
    const keyIndex = new Map();
    let floatOffset = 0;
    let propByteOffset = 0;

    const pushPoint = (p) => {
        if (Array.isArray(p)) { coordsList.push(p[0] || 0, p[1] || 0); }
        else if (p && typeof p.x === 'number' && typeof p.y === 'number') { coordsList.push(p.x, p.y); }
        else { coordsList.push(0, 0); }
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
            const enc = encoder.encode(valJson);
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
    } else if (options.pool) {
        const buf = options.pool.rent(propByteOffset || 1);
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
    } else if (options.pool) {
        const buf = options.pool.rent(numFloats * 4 || 4);
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
    const decoder = new TextDecoder();
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
                    props[keys[ki]] = JSON.parse(decoder.decode(slice));
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
            geometry = { type: 'Point', coordinates: [coords[idx] || 0, coords[idx + 1] || 0] };
        } else if (type === 'LineString' || type === 'MultiPoint') {
            const arr = [];
            for (; idx < end; idx += 2) arr.push([coords[idx], coords[idx + 1]]);
            geometry = { type, coordinates: arr };
        } else if (type === 'Polygon') {
            const rings = [];
            const ringLengths = m.ringLengths || [];
            for (const ringLen of ringLengths) {
                const ring = [];
                for (let k = 0; k < ringLen; k++) {
                    ring.push([coords[idx], coords[idx + 1]]);
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
                        ring.push([coords[idx], coords[idx + 1]]);
                        idx += 2;
                    }
                    polyRings.push(ring);
                }
                polys.push(polyRings);
            }
            geometry = { type: 'MultiPolygon', coordinates: polys };
        } else {
            if (idx < end) geometry = { type: 'Point', coordinates: [coords[idx], coords[idx + 1]] };
        }
        features.push({ id, geometry, properties: props });
    }
    return features;
}

