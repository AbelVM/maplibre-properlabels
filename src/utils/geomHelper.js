/**
 * @module geomHelper
 * @description Geometry utilities used by worker pipelines and the main plugin.
 */
import polylabel from 'polylabel';
import { area } from '@turf/area';
import { PowerLogger, PowerMemoizer } from 'performance-helpers';
export { union } from '@turf/union';
export { flatten } from '@turf/flatten';
export { simplify } from '@turf/simplify';

const featureMemoId = new WeakMap();
let nextFeatureMemoId = 0;
const getFeatureMemoKey = (feature) => {
  if (!featureMemoId.has(feature)) {
    featureMemoId.set(feature, String(nextFeatureMemoId++));
  }
  return featureMemoId.get(feature);
};

export const strictOuterCheck = new PowerMemoizer(
  (coordinates, tile, tileSize) => {
    const [z, x, y] = tile.split('|').map(Number);
    const scale = Math.pow(2, z) * tileSize;
    const MAX_LAT = 85.05112878;
    const eps = 1;
    const isOuter = coordinates[0].some((p) => {
      const lat = Math.max(Math.min(p[1], MAX_LAT), -MAX_LAT);
      const sinLat = Math.sin((lat * Math.PI) / 180);
      const mx = (p[0] + 180) / 360;
      const my = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
      const worldX = mx * scale;
      const worldY = my * scale;
      const tX = Math.floor(worldX / tileSize);
      const tY = Math.floor(worldY / tileSize);
      const pX = Math.floor(worldX - tX * tileSize);
      const pY = Math.floor(worldY - tY * tileSize);
      return (
        tY !== y ||
        tX !== x ||
        pX <= eps ||
        pY <= eps ||
        pX >= tileSize - eps ||
        pY >= tileSize - eps
      );
    });
    return isOuter;
  },
  {
    keyResolver: (coordinates, tile, tileSize) =>
      `${getFeatureMemoKey(coordinates)}|${tile}|${tileSize}`,
  }
);

const countGeoJSON = new PowerMemoizer(
  (obj, unique = false) => {
    const seen = unique ? new Set() : null;
    let count = 0;

    const isCoord = (a) =>
      Array.isArray(a) && a.length >= 2 && typeof a[0] === 'number' && typeof a[1] === 'number';
    const add = (coord) => {
      if (unique) {
        seen.add(coord.slice(0, 3).join(','));
      } else {
        count++;
      }
    };

    function traverseCoords(coords) {
      if (isCoord(coords)) {
        add(coords);
        return;
      }
      if (Array.isArray(coords)) for (const c of coords) traverseCoords(c);
    }

    function walk(g) {
      if (!g) return;
      if (g.type === 'FeatureCollection') {
        for (const f of g.features || []) walk(f);
        return;
      }
      if (g.type === 'Feature') {
        walk(g.geometry);
        return;
      }
      if (g.type === 'GeometryCollection') {
        for (const geom of g.geometries || []) walk(geom);
        return;
      }
      if (g.coordinates !== undefined) traverseCoords(g.coordinates);
    }

    walk(obj);
    return unique ? seen.size : count;
  },
  {
    keyResolver: (obj, unique = false) =>
      `${getFeatureMemoKey(obj)}|${unique ? 'unique' : '__count'}`,
  }
);

/**
 * Compute a robust interior point for a polygon feature suitable for labeling.
 * Uses `polylabel` for an optimal pole-of-inaccessibility point and falls
 * back to a centroid-based location when needed.
 *
 * @param {Object} feature GeoJSON Feature with Polygon geometry
 * @param {number} [precision]
 * @returns {{type: 'Point', coordinates: [number, number]}}
 */
const computeSafePolylabel = (feature, precision) => {
  if (!feature || feature.geometry?.type !== 'Polygon') {
    throw new Error('Non-Polygon geometry');
  }

  const coords = feature.geometry.coordinates;
  const pt = polylabel(coords, precision);
  if (!Array.isArray(pt) || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) {
    throw new Error('Invalid polylabel result');
  }

  return {
    type: 'Point',
    coordinates: [pt[0], pt[1]],
  };
};

const safePolylabelMemo = new PowerMemoizer(computeSafePolylabel, {
  keyResolver: (feature, precision) =>
    `${getFeatureMemoKey(feature)}|${precision === undefined ? '__default' : String(precision)}`,
});

/**
 * Fallback centroid calculation for polygons when polylabel fails.
 * @param {Object} feature GeoJSON Feature
 * @returns {{type: 'Point', coordinates: [number, number]}}
 */
const pointOnPolygonFallback = (feature) => {
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || !Array.isArray(coords[0])) {
    return { type: 'Point', coordinates: [0, 0] };
  }

  const outer = coords[0];
  let x = 0;
  let y = 0;
  let total = 0;
  for (let i = 0; i < outer.length; i++) {
    const [x0, y0] = outer[i];
    const [x1, y1] = outer[(i + 1) % outer.length];
    const cross = x0 * y1 - x1 * y0;
    x += (x0 + x1) * cross;
    y += (y0 + y1) * cross;
    total += cross;
  }
  if (total === 0) {
    return { type: 'Point', coordinates: outer[0] || [0, 0] };
  }
  const factor = 1 / (3 * total);
  return { type: 'Point', coordinates: [x * factor, y * factor] };
};

export const safePolylabel = (feature, precision) => {
  try {
    return safePolylabelMemo(feature, precision);
  } catch (err) {
    return pointOnPolygonFallback(feature);
  }
};

/**
 * Compute polygon area, optionally using Turf for meter units.
 * @param {Object} feature GeoJSON Feature
 * @param {string} [units]
 * @returns {number}
 */
const computePolygonArea = (feature, units) => {
  if (!feature || typeof feature !== 'object' || !feature.geometry) {
    return 0;
  }

  if (units === 'meters' || units === 'm') {
    return area(feature);
  }

  const coords = feature.geometry.coordinates;
  if (!Array.isArray(coords) || coords.length === 0) {
    return 0;
  }

  const outer = feature.geometry.type === 'Polygon' ? coords[0] : coords[0]?.[0];
  if (!Array.isArray(outer)) {
    return 0;
  }

  let sum = 0;
  for (let i = 0; i < outer.length; i++) {
    const [x0, y0] = outer[i];
    const [x1, y1] = outer[(i + 1) % outer.length];
    sum += x0 * y1 - x1 * y0;
  }
  return Math.abs(sum) / 2;
};

const geomLogger = new PowerLogger(0, { name: 'properlabels-geom' });

export const setGeomWorkerDebugLevel = (level) => {
  const normalized = Number.isFinite(Number(level))
    ? Math.max(0, Math.min(3, Math.floor(Number(level))))
    : 0;
  geomLogger.setDebugLevel(normalized);
};

const polygonAreaMemo = new PowerMemoizer(computePolygonArea, {
  keyResolver: (feature, units) =>
    `${getFeatureMemoKey(feature)}|${units === undefined ? '__planar' : String(units)}`,
});

export const polygonArea = (feature, units) => {
  try {
    return feature && typeof feature === 'object'
      ? polygonAreaMemo(feature, units)
      : computePolygonArea(feature, units);
  } catch (err) {
    geomLogger.error('Error computing area for feature', feature && feature.id, err);
    return 0;
  }
};

/**
 * Count coordinate positions in any GeoJSON object.
 * @param {Object} obj GeoJSON Geometry, Feature, or FeatureCollection
 * @param {{unique?: boolean}} [opts] if `unique:true` deduplicates identical coordinates
 * @returns {number}
 */
export function countGeoJSONPoints(obj, opts = {}) {
  const { unique = false } = opts;
  if (!obj || typeof obj !== 'object') return 0;
  return countGeoJSON(obj, unique);
}
