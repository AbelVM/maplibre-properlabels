/**
 * @module geomHelper
 * @description Geometry utilities used by worker pipelines and the main plugin.
 */
import polylabel from 'polylabel';
import { area } from '@turf/area';
import { simplify } from '@turf/simplify';
import { PowerLogger, PowerMemoizer } from 'performance-helpers';
export { union } from '@turf/union';
export { flatten } from '@turf/flatten';
export { lightspeedPolygonComponents } from './geomHelper_intersectiongraph.js';

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
 * Simplify a GeoJSON Feature only when its geometry exceeds the given vertex threshold.
 * @param {Object} feature GeoJSON Feature
 * @param {number} threshold Maximum number of coordinate positions before simplification is applied
 * @param {{tolerance?: number, highQuality?: boolean}} [opts]
 * @returns {Object}
 */
const _simplifyFeatureIfExceeds = (feature, threshold, opts = {}) => {
  if (
    !feature ||
    typeof feature !== 'object' ||
    feature.type !== 'Feature' ||
    !feature.geometry ||
    !Number.isFinite(threshold) ||
    threshold < 0
  ) {
    return feature;
  }

  const vertexCount = countGeoJSONPoints(feature.geometry, { unique: false });
  if (vertexCount <= threshold) return feature;

  const { tolerance = 1e-6, highQuality = false } = opts;
  try {
    return simplify(feature, { tolerance, highQuality, mutate: true });
  } catch (err) {
    geomLogger.error('Error simplifying feature', err);
    return feature;
  }
};

export const simplifyFeatureIfExceeds = new PowerMemoizer(
  (feature, threshold, opts = {}) => _simplifyFeatureIfExceeds(feature, threshold, opts),
  {
    keyResolver: (feature, threshold, opts = {}) => {
      const tolerance = Number(opts.tolerance) || 1e-6;
      const highQuality = Boolean(opts.highQuality);
      return `${getFeatureMemoKey(feature)}|${threshold}|${tolerance}|${highQuality}`;
    },
  }
);

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

/**
 * Snap and clean a single polygon ring to a coordinate grid derived from tolerance.
 * Consecutive duplicate vertices (after snapping) are removed, and the ring is
 * re-closed. Returns null when fewer than 3 unique vertices remain.
 * @param {Array<Array<number>>} ring
 * @param {number} factor  pre-computed 10^precision multiplier
 * @returns {Array<Array<number>>|null}
 */
const cleanRing = (ring, factor) => {
  if (!Array.isArray(ring) || ring.length < 4) return null;

  // Snap each coordinate to the grid and remove consecutive duplicates in one pass.
  const first = ring[0];
  const x0 = Math.round(first[0] * factor) / factor;
  const y0 = Math.round(first[1] * factor) / factor;
  const out = [[x0, y0]];

  for (let i = 1; i < ring.length - 1; i += 1) {
    const p = ring[i];
    const x = Math.round(p[0] * factor) / factor;
    const y = Math.round(p[1] * factor) / factor;
    const prev = out[out.length - 1];
    if (x !== prev[0] || y !== prev[1]) {
      out.push([x, y]);
    }
  }

  // Need at least 3 distinct vertices before closing.
  if (out.length < 3) return null;

  // Remove the last vertex if it duplicates the first after snapping, then re-close.
  const last = out[out.length - 1];
  if (last[0] === x0 && last[1] === y0) out.pop();
  if (out.length < 3) return null;

  out.push([x0, y0]);
  return out;
};

/**
 * Snap all coordinates of a Polygon feature to a grid derived from `tolerance`,
 * collapsing vertices closer than tolerance and removing degenerate rings.
 *
 * This is a pre-processing step before calling `@turf/union` to avoid the
 * `polygon-clipping` "Unable to complete output ring" error caused by
 * nearly-coincident or self-touching vertices from tile-edge clipping.
 *
 * @param {Object} feature GeoJSON Polygon Feature
 * @param {number} tolerance Simplification tolerance (e.g. 1e-5). Used to derive snap precision.
 * @returns {Object|null} Cleaned feature, or null if no valid rings remain.
 */
export const snapPolygonFeature = (feature, tolerance) => {
  if (!feature || feature.geometry?.type !== 'Polygon') return feature;
  const safeTol = Math.max(tolerance, 1e-10);
  const precision = Math.max(0, Math.min(10, Math.round(-Math.log10(safeTol))));
  const factor = Math.pow(10, precision);

  const coords = feature.geometry.coordinates;
  if (!Array.isArray(coords)) return null;

  const cleanedRings = [];
  for (let r = 0; r < coords.length; r += 1) {
    const cleaned = cleanRing(coords[r], factor);
    if (cleaned) cleanedRings.push(cleaned);
    // If the outer ring is degenerate the whole feature is invalid.
    else if (r === 0) return null;
  }

  if (cleanedRings.length === 0) return null;
  return { ...feature, geometry: { type: 'Polygon', coordinates: cleanedRings } };
};
