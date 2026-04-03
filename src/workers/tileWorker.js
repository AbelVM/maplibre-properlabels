import { flatten } from "@turf/flatten";
import { o2b, b2o } from "../utils/bufferManager.js";
import { strictOuterCheck, countGeoJSONPoints } from "../utils/geomHelper.js";

const _root = (typeof self !== 'undefined') ? self : ((typeof globalThis !== 'undefined') ? globalThis : {});

_root.onmessage = e => {
    const buffer = e.data;
    const incoming = b2o(buffer);
    const tolerance = incoming.tolerance;
    const unique = incoming.unique;
    const tileSize = incoming.tileSize;
    const mutate = true;

    const groupedMap = new Map();
    incoming.collection.features.forEach(f => {
        const k = f.id;
        const arr = groupedMap.get(k) || [];
        arr.push(f);
        groupedMap.set(k, arr);
    });

    let size = 0;
    const outputMap = new Map();

    groupedMap.forEach((group, id) => {
        const fc_in = flatten({ type: 'FeatureCollection', features: group });
        const fc_out = { type: 'FeatureCollection', features: [] };
        fc_out.features = fc_in.features.filter(f => f.geometry.type === 'Polygon').map((f, i) => {
            const index = `${unique}|${id}|${i}`;
            const clipped = strictOuterCheck(f.geometry.coordinates, f.properties._tile, tileSize);
            const props = Object.assign({}, f.properties, { _index: index, clipped });
            const newF = { type: 'Feature', geometry: f.geometry, properties: props };
            size += countGeoJSONPoints(newF);
            return newF;
        });
        outputMap.set(id, fc_out);
    });


    const op = Object.fromEntries(outputMap);
    const payload = Object.assign({}, op, { unique, type: 'simplified', size });

    _root.postMessage(o2b(payload));

};