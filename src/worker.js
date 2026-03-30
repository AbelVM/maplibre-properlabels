import { union } from "@turf/union";
import { combine } from "@turf/combine";
import { flatten } from "@turf/flatten";
import polylabel from 'polylabel';
import { simplify } from "@turf/simplify";
import { encodeFeaturesBinary, decodeFeaturesBinary, ArrayBufferPool } from './utils.js';

const _abPool = new ArrayBufferPool();

onmessage = e => {
    // Accept either object messages, transferable JSON, or our binary geometry format
    let incoming = e && e.data;

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
            // preserve received buffers for potential reuse when encoding the response
            incoming = { features: featuresFromBin, tolerance: incoming.tolerance, _receivedPropsBuf: propsBuf, _receivedCoordsBuf: coordsBuf, _receivedKeys: incomingKeys };
        } catch (err) {
            // fall through to treat incoming as-is
            incoming = incoming || {};
        }
    }

    const data = incoming || {};
    const features = data.features || [];
    const tolerance = data.tolerance || 0.00001;
    const mutate = true;

    // group features by id
    const grouped = features.reduce((acc, f) => {
        const k = f.id;
        (acc[k] = acc[k] || []).push(f);
        return acc;
    }, {});

    const geojson = {
        type: 'FeatureCollection',
        features: []
    };

    for (const [id, group] of Object.entries(grouped)) {
        const { clipped, ...props } = (group[0] && group[0].properties) || {};
        let feature;
        if (group.length === 1) {
            const geom = group[0].geometry;
            feature = simplify({ type: 'Feature', id: id, geometry: geom, properties: props }, { tolerance, mutate });
            try {
                geom.coordinates = polylabel(geom.coordinates, tolerance);
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
                        f.geometry.coordinates = polylabel(f.geometry.coordinates, tolerance);
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
        geojson.features.push(feature);
    }

    // encode and transfer the resulting GeoJSON using compact binary geometry transfer
    try {
        const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(geojson.features || [], { propsBuffer: incoming && incoming._receivedPropsBuf, coordsBuffer: incoming && incoming._receivedCoordsBuf, pool: _abPool });
        postMessage({ type: 'geojson_bin', meta, keys, propsBuf: propsBuffer.buffer, coords: coordsArray.buffer }, [propsBuffer.buffer, coordsArray.buffer]);
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
