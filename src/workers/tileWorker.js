import { simplify } from "@turf/simplify";
import { flatten } from "@turf/flatten";
import { o2b, b2o } from "../utils/bufferManager.js";
import { groupPolygonsBySharedVertex, strictOuterCheck, countGeoJSONPoints } from "../utils/geomHelper.js";

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
        let fc = { type: 'FeatureCollection', features: group };
        fc = flatten(fc);
        fc.features.forEach((f, i) => {
            f.properties._index = `${unique}|${id}|${i}`;
            size += countGeoJSONPoints(f);
        });
        const unclipped = fc.features.filter(f => !f.properties.clipped);
        const clipped = fc.features.filter(f => f.properties.clipped);
        const clipped_clipped = [];
        const clipped_unclipped = [];

        const groups = groupPolygonsBySharedVertex(clipped);
        debugger;

        clipped.forEach(f => {
            if (strictOuterCheck(f.geometry.coordinates, unique, tileSize)) {
                clipped_clipped.push(f);
            } else {
                f.properties.clipped = false;
                clipped_unclipped.push(f);
            }
        });
        fc.features = [...unclipped, ...clipped_unclipped, ...clipped_clipped];
        outputMap.set(id, simplify(fc, { tolerance, mutate }));
    });







/*



    const simplified = simplify(incoming.collection, { tolerance, mutate });

    const groupedMap = new Map();
    simplified.features.forEach(f => {
        const k = f.id;
        const arr = groupedMap.get(k) || [];
        arr.push(f);
        groupedMap.set(k, arr);
    });

    let size = 0;
    groupedMap.forEach((group, id) => {
        let fc = { type: 'FeatureCollection', features: group };
        fc = flatten(fc);
        fc.features.forEach((f, i) => {
            f.properties._index = `${unique}|${id}|${i}`;
            size += countGeoJSONPoints(f);
        });
        const unclipped = fc.features.filter(f => !f.properties.clipped);
        const clipped = fc.features.filter(f => f.properties.clipped);
        const clipped_clipped = [];
        const clipped_unclipped = [];
        clipped.forEach(f => {
            if (strictOuterCheck(f.geometry.coordinates, unique, tileSize)) {
                clipped_clipped.push(f);
            } else {
                f.properties.clipped = false;
                clipped_unclipped.push(f);
            }
        });
        fc.features = [...unclipped, ...clipped_unclipped, ...clipped_clipped];
        groupedMap.set(id, fc);
    });

//*/

    const payload = Object.assign({}, Object.fromEntries(outputMap), { unique, type: 'simplified', size });

    _root.postMessage(o2b(payload));

};