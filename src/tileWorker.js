import { simplify } from "@turf/simplify";
import { flatten } from "@turf/flatten";
import { o2b, b2o } from "./utils.js";

const _root = (typeof self !== 'undefined') ? self : ((typeof globalThis !== 'undefined') ? globalThis : {});

const strictOuterCheck = (coordinates, tile, tileSize) => {
    const [z, x, y] = tile.split('|');
    const scale = Math.pow(2, z) * tileSize;
    const MAX_LAT = 85.05112878;
    const eps = 1e-6;    
    const isOuter = coordinates[0].some(p => {
        p[1] = Math.max(Math.min(p[1], MAX_LAT), -MAX_LAT);
        const sinLat = Math.sin(p[1] * Math.PI / 180);
        const mx = ((p[0] + 180) / 360);
        const my = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI));
        const worldX = mx * scale;
        const worldY = my * scale;
        const tX = Math.floor(worldX / tileSize);
        const tY = Math.floor(worldY / tileSize);
        const pX = Math.floor(worldX - tX * tileSize);
        const pY = Math.floor(worldY - tY * tileSize);
        return tY != y || tX != x || pX <= eps || pY <= eps;
    });
    return isOuter;
}

_root.onmessage = e => {
    const buffer = e.data;
    const incoming = b2o(buffer);
    const tolerance = incoming.tolerance;
    const unique = incoming.unique;
    const tilesize = incoming.tilesize;
    const mutate = true;
    const simplified = simplify(incoming.collection, { tolerance, mutate });

    const groupedMap = new Map();
    simplified.features.forEach(f => {
        const k = f.id;
        const arr = groupedMap.get(k) || [];
        arr.push(f);
        groupedMap.set(k, arr);
    });

    groupedMap.forEach((group, id) => {
        let fc = { type: 'FeatureCollection', features: group };
        fc = flatten(fc);
        fc.features.forEach((f, i) => {
            f.properties._index = `${unique}|${id}|${i}`;
        });
        const unclipped = fc.features.filter(f => !f.properties.clipped);
        const clipped = fc.features.filter(f => f.properties.clipped);
        const clipped_clipped = [];
        const clipped_unclipped = [];
        clipped.forEach(f => {
            if (strictOuterCheck(f.geometry.coordinates, unique, tilesize)) {
                clipped_clipped.push(f);
            } else {
                f.properties.clipped = false;
                clipped_unclipped.push(f);
            }
        });
        fc.features = [...unclipped, ...clipped_unclipped, ...clipped_clipped];
        groupedMap.set(id, fc);
    });

    const payload = Object.assign({}, Object.fromEntries(groupedMap), { unique, type: 'simplified' });

    _root.postMessage(o2b(payload));

};