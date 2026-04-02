import { union } from "@turf/union";
import { flatten } from "@turf/flatten";
import polylabel from 'polylabel';
import { pointOnFeature } from "@turf/point-on-feature";
import { simplify } from "@turf/simplify";
import { area } from "@turf/area";
import { o2b, b2o } from "./utils.js";

const _root = (typeof self !== 'undefined') ? self : ((typeof globalThis !== 'undefined') ? globalThis : {});

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

_root.onmessage = e => {
    const buffer = e.data;
    const incoming = b2o(buffer);
    const pieces = Object.values(incoming.pieces);
    const tolerance = incoming.tolerance || 0.00001;
    const units = incoming.unit || 'meters';
    const mutate = true;



    const groupedMap = new Map();
    pieces.forEach(f => {
        for (const [key, value] of Object.entries(f)) {
            const arr = groupedMap.get(key) || [];
            arr.push(value);
            groupedMap.set(key, arr);
        }
    });

    for (const [id, group] of groupedMap.entries()) {

        let collection = {
            type: 'FeatureCollection',
            features: group.reduce((acc, cur) => [...acc, ...cur.features], [])
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
                f.properties = { ...origProps, _area: 0,  _groupId: id };
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

        console.log(collection);
    }
};