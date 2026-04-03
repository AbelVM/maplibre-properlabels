import polylabel from 'polylabel';
import { area } from "@turf/area";

/**
 * Utilities for working with GeoJSON polygon geometries used by the worker.
 *
 * Functions:
 * - `lazyOuterCheck(acc, [layerId, layer])` — wraps layer.feature to mark clipped features lazily.
 * - `strictOuterCheck(coordinates, tile, tileSize)` — strict check using Web-Mercator math.
 * - `safePolylabel(feature, precision)` — robust polylabel with turf fallback.
 * - `polygonArea(feature, units)` — area calculation (meters via turf or planar via shoelace).
 */

/**
 * Lazily check whether features touch the tile edge and mark them as clipped.
 *
 * This returns a new accumulator object with the same keys as `acc` but where
 * each `layer.feature(index)` call will mark `feature.properties.clipped = true`
 * when any vertex is within `eps` of the layer extent edges. The check is
 * intentionally cheap (pixel-coordinate based) and intended for a quick
 * heuristic rather than an exact geometric test.
 *
 * @param {Object} acc - Accumulator / layer map being built.
 * @param {Array} entry - Tuple of [layerId, layer]. `layer` must expose `feature(index)` and `extent`.
 * @returns {Object} New accumulator with wrapped layer that sets `feature.properties.clipped`.
 */
export const lazyOuterCheck = (acc, [layerId, layer]) => {
    const eps = 1;
    return {
        ...acc,
        [layerId]: {
            ...layer,
            feature: (index) => {
                const feature = layer.feature(index);
                const coordinates = feature.loadGeometry();
                const isOuter = coordinates.flat(Infinity).some(c =>
                    c.x >= layer.extent - eps || c.y >= layer.extent - eps ||
                    c.x <= eps || c.y <= eps
                );
                feature.properties['clipped'] = isOuter;
                return feature;
            }
        }
    };
};

/**
 * Strictly determine whether a polygon's first ring has points outside the given tile.
 *
 * This converts longitude/latitude coordinates into Web-Mercator pixel coordinates
 * at the given zoom and tile size, then checks whether any point falls outside the
 * target tile or lies on/near the tile edge.
 *
 * NOTE: this function mutates the input `coordinates[0]` lat values to clamp them
 * to Web-Mercator limits. `tile` should be a string of the form `"z|x|y"`.
 *
 * @param {Array<Array<number[]>>} coordinates - Polygon coordinates (array of rings, ring is array of [lon, lat]).
 * @param {string} tile - Tile identifier in the form `"z|x|y"`.
 * @param {number} tileSize - Tile pixel size (e.g. 256 or 512).
 * @returns {boolean} True when the polygon appears to touch or cross the tile boundary.
 */
export const strictOuterCheck = (coordinates, tile, tileSize) => {
    const [z, x, y] = tile.split('|');
    const scale = Math.pow(2, z) * tileSize;
    const MAX_LAT = 85.05112878;
    const eps = 1;
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
        //return tY != y || tX != x;// || 
        return pX <= eps || pY <= eps || pX >= tileSize - eps || pY >= tileSize - eps;
    });
    if (!isOuter ) {
        console.log('not outer');
    }
    return isOuter;
}

/**
 * Compute a robust interior point for a polygon feature suitable for labeling.
 *
 * Attempts to use `polylabel` for an optimal pole-of-inaccessibility point,
 * and falls back to `pointOnFeature` (from Turf) if polylabel fails or
 * returns invalid coordinates. Returns a GeoJSON Point geometry.
 *
 * @param {Object} feature - GeoJSON Feature (Polygon or MultiPolygon).
 * @param {number} [precision] - Precision passed to `polylabel` (optional).
 * @returns {{type: 'Point', coordinates: [number, number]}} GeoJSON Point geometry.
 */
export const safePolylabel = (feature, precision) => {
    try {
        if (feature.geometry.type!=='Polygon') {
            throw new Error('Non-Polygon geometry'); 
        }
        const coords = feature && feature.geometry && feature.geometry.coordinates;
        let pt = polylabel(coords, precision);
        if (!Array.isArray(pt) || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) {
            throw new Error('Invalid polylabel result');
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

/**
 * Compute polygon area using the shoelace formula for a single ring.
 * @private
 * @param {Array<number[]>} points - Array of [x, y] coordinates for a ring.
 * @returns {number} Positive area value for the ring.
 */
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

/**
 * Compute the area of a polygon Feature.
 *
 * When `units === 'meters'` this defers to `@turf/area` for geodesic area in square meters.
 * Otherwise it computes the planar area in coordinate units using the shoelace formula
 * on the outer ring and subtracting holes.
 *
 * @param {Object} feature - GeoJSON Feature with `geometry` of type 'Polygon'.
 * @param {string} [units] - If set to `'meters'` uses turf area; otherwise returns planar area.
 * @returns {number} Area in the requested units (0 on invalid input or errors).
 */
export const polygonArea = (feature, units) => {
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

/**
 * Count coordinate positions in any GeoJSON object.
 * @param {Object} obj GeoJSON Geometry, Feature, or FeatureCollection
 * @param {{unique?: boolean}} [opts] if `unique:true` deduplicates identical coordinates
 * @returns {number}
 */
export function countGeoJSONPoints(obj, opts = {}) {
  const { unique = false } = opts;
  const seen = unique ? new Set() : null;
  let count = 0;

  const isCoord = a => Array.isArray(a) && a.length >= 2 && typeof a[0] === 'number' && typeof a[1] === 'number';
  const add = coord => {
    if (unique) {
      seen.add(coord.slice(0, 3).join(',')); // include up to 3 values (x,y,z) if present
    } else {
      count++;
    }
  };

  function traverseCoords(coords) {
    if (isCoord(coords)) { add(coords); return; }
    if (Array.isArray(coords)) for (const c of coords) traverseCoords(c);
  }

  function walk(g) {
    if (!g) return;
    if (g.type === 'FeatureCollection') {
      for (const f of g.features || []) walk(f);
      return;
    }
    if (g.type === 'Feature') { walk(g.geometry); return; }
    if (g.type === 'GeometryCollection') {
      for (const geom of g.geometries || []) walk(geom);
      return;
    }
    if (g.coordinates !== undefined) traverseCoords(g.coordinates);
  }

  walk(obj);
  return unique ? seen.size : count;
}