import { union } from "@turf/union";
import { flatten } from "@turf/flatten";
import { simplify } from "@turf/simplify";
import { o2b, b2o } from "../utils/bufferManager.js";
import { safePolylabel, polygonArea } from "../utils/geomHelper.js";
import { strictOuterCheck, countGeoJSONPoints } from "../utils/geomHelper.js";

const _root = (typeof self !== 'undefined') ? self : ((typeof globalThis !== 'undefined') ? globalThis : {});

function debugStrictPoints(coords, tile, tileSize) {
    const [z, x, y] = String(tile).split('|').map(Number);
    const scale = Math.pow(2, z) * tileSize;
    const MAX_LAT = 85.05112878;
    if (!coords || !coords[0]) return [];
    return coords[0].map((pt, idx) => {
        const lon = pt[0], latOrig = pt[1];
        const lat = Math.max(Math.min(latOrig, MAX_LAT), -MAX_LAT);
        const sinLat = Math.sin(lat * Math.PI / 180);
        const mx = (lon + 180) / 360;
        const my = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
        const worldX = mx * scale;
        const worldY = my * scale;
        const tX = Math.floor(worldX / tileSize);
        const tY = Math.floor(worldY / tileSize);
        const pX = Math.floor(worldX - tX * tileSize);
        const pY = Math.floor(worldY - tY * tileSize);
        return {
            idx, lon: +lon.toFixed(6), latOrig: +latOrig.toFixed(6), lat: +lat.toFixed(6),
            worldX: +worldX.toFixed(6), worldY: +worldY.toFixed(6),
            tX, tY, pX, pY
        };
    });
}

_root.onmessage = e => {
    const buffer = e.data;
    const incoming = b2o(buffer);
    const pieces = Object.values(incoming.pieces);
    const tolerance = incoming.tolerance || 0.00001;
    const units = incoming.unit || 'meters';
    const tileSize = incoming.tileSize || 512;

    const groupedMap = new Map();
    pieces.forEach(f => {
        for (const [key, value] of Object.entries(f)) {
            const arr = groupedMap.get(key) || [];
            arr.push(value);
            groupedMap.set(key, arr);
        }
    });

    for (const [id, group] of groupedMap.entries()) {

        if (id === 'size') continue;


        let collection = {
            type: 'FeatureCollection',
            features: group.reduce((acc, cur) => [...acc, ...cur.features], []).filter(f => f.geometry.type === 'Polygon')
        };

        if (collection.features.some(f => f.geometry.type === 'MultiPolygon')) {
            collection = flatten(collection);
        }

        if (collection.features.some(f => f.properties.clipped) && collection.features.length > 1) {
            let clippedFeatures = {
                type: 'FeatureCollection',
                features: collection.features.filter(f => f.properties.clipped)
            };
            const unclipped = collection.features.filter(f => !f.properties.clipped);

            if (clippedFeatures.features.length > 1) {
                const { clipped, ...cprops } = collection.features[0].properties;
                cprops._index = clippedFeatures.features.map(f => f.properties._index).sort().join('-');
                clippedFeatures = union(clippedFeatures);
                clippedFeatures = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: clippedFeatures.geometry,
                        properties: cprops
                    }]
                };
            }
            collection = {
                type: 'FeatureCollection',
                features: [...unclipped, ...clippedFeatures.features]
            };
        }

        if (collection.features.some(f => f.geometry.type === 'MultiPolygon')) {
            collection = flatten(collection);
        }

        collection.features = collection.features.map((f, i) => {
            const idx = `${id}-${i}`;
            const origGeom = f.geometry;
            const origProps = f.properties;
            if (origGeom && origGeom.type === 'Polygon') {
                const areaVal = polygonArea(f, units);
                f.geometry = safePolylabel(f, tolerance);
                f.properties = { ...origProps, _area: areaVal, _groupId: id };
            } else {
                console.log('Unexpected geometry type after union/simplify/flatten for id:' + id + ' - type:' + (origGeom && origGeom.type));
                f.properties = { ...origProps, _area: 0, _groupId: id };
            }
            f.id = idx;
            return f;
        });

        const biggest = Math.max(...collection.features.map(f => f.properties && f.properties._area || 0));
        collection.features = collection.features.map(f => {
            if (f.properties && f.properties._area != null && f.properties._area > 0) {
                f.properties._localSortKey = biggest / f.properties._area;
                f.properties._globalSortKey = 1 / f.properties._area;
            } else {
                f.properties._localSortKey = 1e+9999;
                f.properties._globalSortKey = 1e+9999;
            }
            return f;
        });

        collection.id = id;
        _root.postMessage(o2b(collection));

    }
};