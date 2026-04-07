/**
 * Gather worker: merge piece collections, simplify polygons, and compute
 * label-friendly points to return to the main thread.
 */
import { o2u8, u82o, PowerLogger } from 'performance-helpers';
import { safePolylabel, polygonArea, setGeomWorkerDebugLevel, union, flatten, simplify } from '../utils/geomHelper.js';

const getWorkerScope = () =>
  typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : {};

const _root = getWorkerScope();
const logger = new PowerLogger(0, { name: 'properlabels-gather' });

const normalizeCollection = (collection) => {
  const hasMultiPolygon = collection.features.some((f) => f.geometry.type === 'MultiPolygon');
  return hasMultiPolygon ? flatten(collection) : collection;
};

const collectPolygonFeatures = (group) => {
  const features = [];
  for (const cur of group) {
    const curFeatures = cur.features;
    for (let i = 0; i < curFeatures.length; i += 1) {
      const feature = curFeatures[i];
      if (feature.geometry.type === 'Polygon') {
        features.push(feature);
      }
    }
  }
  return features;
};

/**
 * @param {MessageEvent<ArrayBuffer|ArrayBufferView>} e
 */
_root.onmessage = (e) => {
  const buffer = e.data;
  const incoming =
    buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer) ? u82o(buffer) : buffer;
  const debugLevel = Number.isFinite(Number(incoming.debugLevel))
    ? Math.max(0, Math.min(3, Math.floor(Number(incoming.debugLevel))))
    : 0;
  setGeomWorkerDebugLevel(debugLevel);
  logger.setDebugLevel(debugLevel);
  const pieces = Object.values(incoming.pieces);
  const tolerance = incoming.tolerance || 0.00001;
  const units = incoming.unit || 'meters';
  const tileSize = incoming.tileSize || 512;
  const correlationId = incoming.correlationId;

  const groupedMap = new Map();
  pieces.forEach((f) => {
    for (const [key, value] of Object.entries(f)) {
      const arr = groupedMap.get(key);
      if (arr) {
        arr.push(value);
      } else {
        groupedMap.set(key, [value]);
      }
    }
  });

  for (const [id, group] of groupedMap.entries()) {
    if (id === 'size' || id === 'unique' || id === 'type') continue;
    const featureAcc = collectPolygonFeatures(group);
    let collection = normalizeCollection({
      type: 'FeatureCollection',
      features: featureAcc,
    });

    let clippedFeatures = [];
    let unclipped = [];
    if (collection.features.length > 1) {
      for (const feature of collection.features) {
        if (feature.properties.clipped) {
          clippedFeatures.push(feature);
        } else {
          unclipped.push(feature);
        }
      }
    }

    if (clippedFeatures.length > 0 && collection.features.length > 1) {
      if (clippedFeatures.length > 1) {
        const { clipped, ...cprops } = collection.features[0].properties;
        cprops._index = clippedFeatures
          .map((f) => f.properties._index)
          .sort()
          .join('-');
        const unioned = union({ type: 'FeatureCollection', features: clippedFeatures });
        clippedFeatures = [
          {
            type: 'Feature',
            geometry: unioned.geometry,
            properties: cprops,
          },
        ];
      }
      collection = {
        type: 'FeatureCollection',
        features: [...unclipped, ...clippedFeatures],
      };
    }

    collection = normalizeCollection(collection);
    collection.features = collection.features.map((f, i) => {
      const idx = `${id}-${i}`;
      const origGeom = f.geometry;
      const origProps = f.properties;
      if (origGeom && origGeom.type === 'Polygon') {
        const areaVal = polygonArea(f, units);
        f.geometry = safePolylabel(f, tolerance);
        f.properties = { ...origProps, _area: areaVal, _groupId: id };
      } else {
        logger.warn(
          'Unexpected geometry type after union/simplify/flatten for id:' +
            id +
            ' - type:' +
            (origGeom && origGeom.type)
        );
        f.properties = { ...origProps, _area: 0, _groupId: id };
      }
      f.id = idx;
      return f;
    });
    const biggest = Math.max(
      ...collection.features.map((f) => (f.properties && f.properties._area) || 0)
    );
    collection.features = collection.features.map((f) => {
      if (f.properties && f.properties._area != null && f.properties._area > 0) {
        f.properties._localSortKey = biggest / f.properties._area;
        f.properties._globalSortKey = 1 / f.properties._area;
      } else {
        f.properties._localSortKey = 1e9999;
        f.properties._globalSortKey = 1e9999;
      }
      return f;
    });

    collection.id = id;
    const buffer = o2u8(collection).buffer;
    _root.postMessage(buffer, [buffer]);
  }
  const commit = { type: 'commit' };
  if (correlationId != null) {
    commit.correlationId = correlationId;
  }
  _root.postMessage(commit);
};
