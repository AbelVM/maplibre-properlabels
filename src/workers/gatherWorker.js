/**
 * Gather worker: merge piece collections, simplify polygons, and compute
 * label-friendly points to return to the main thread.
 */
import { o2u8, u82o, PowerLogger } from 'performance-helpers';
import { safePolylabel, polygonArea, setGeomWorkerDebugLevel, lightspeedPolygonComponents, union, flatten, simplifyFeatureIfExceeds } from '../utils/geomHelper.js';

const getWorkerScope = () =>
  typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : {};

const _root = getWorkerScope();
const logger = new PowerLogger(0, { name: 'properlabels-gather' });

const postToMainThread = (message, transfer) => {
  try {
    if (_root && typeof _root.postMessage === 'function') {
      _root.postMessage(message, transfer);
      return true;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof self !== 'undefined' && self && typeof self.postMessage === 'function') {
      self.postMessage(message, transfer);
      return true;
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof globalThis !== 'undefined' && globalThis && typeof globalThis.postMessage === 'function') {
      globalThis.postMessage(message, transfer);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
};

const normalizeCollection = (collection) => {
  const hasMultiPolygon = collection.features.some(
    (f) => f && f.geometry && f.geometry.type === 'MultiPolygon'
  );
  return hasMultiPolygon ? flatten(collection) : collection;
};

const collectPolygonFeatures = (group) => {
  const features = [];
  for (const cur of group) {
    const curFeatures = Array.isArray(cur && cur.features) ? cur.features : [];
    for (let i = 0; i < curFeatures.length; i += 1) {
      const feature = curFeatures[i];
      if (feature && feature.geometry && feature.geometry.type === 'Polygon') {
        features.push(feature);
      }
    }
  }
  return features;
};

const getZoomFromIndex = (indexValue) => {
  if (typeof indexValue !== 'string') return 0;
  const sep = indexValue.indexOf('|');
  const token = sep >= 0 ? indexValue.slice(0, sep) : indexValue;
  return Number.isFinite(Number(token)) ? Number(token) : 0;
};

const resolveHardwareConcurrency = () => {
  if (typeof navigator !== 'undefined' && Number.isFinite(Number(navigator.hardwareConcurrency))) {
    return Math.max(1, Math.floor(Number(navigator.hardwareConcurrency)));
  }
  return 2;
};

const computeComponentConcurrency = (clippedCount, gatherPoolSize) => {
  if (!Number.isFinite(Number(clippedCount)) || clippedCount <= 1) return 1;
  const workers = Math.max(1, Number.isFinite(Number(gatherPoolSize)) ? Math.floor(Number(gatherPoolSize)) : 1);
  const hw = resolveHardwareConcurrency();
  const perWorkerBudget = Math.max(1, Math.floor(hw / workers));

  let target = perWorkerBudget;
  if (clippedCount <= 6) {
    target = 1;
  } else if (clippedCount <= 20) {
    target = Math.min(2, perWorkerBudget);
  }

  return Math.max(1, Math.min(clippedCount, target));
};

/**
 * @param {MessageEvent<ArrayBuffer|ArrayBufferView>} e
 */
_root.onmessage = async (e) => {
  let correlationId = null;
  let incoming = null;
  const flushCommit = (error) => {
    const commit = { type: 'commit', timestamp: Date.now() };
    if (incoming && incoming.gatherRound != null) {
      commit.gatherRound = incoming.gatherRound;
    }
    if (correlationId != null) {
      commit.correlationId = correlationId;
    }
    if (error) {
      commit.error = true;
      commit.errorMessage = String(error && error.message ? error.message : error);
    }
    if (!postToMainThread(commit)) {
      logger.error(new Error('Unable to post gather commit response'), 'Failed to send gather commit response');
    }
  };

  try {
    const raw = e.data;
    incoming =
      raw instanceof ArrayBuffer || ArrayBuffer.isView(raw) ? u82o(raw) : raw;
    const debugLevel = Number.isFinite(Number(incoming.debugLevel))
      ? Math.max(0, Math.min(3, Math.floor(Number(incoming.debugLevel))))
      : 0;
    setGeomWorkerDebugLevel(debugLevel);
    logger.setDebugLevel(debugLevel);
    const piecesObject = incoming.pieces && typeof incoming.pieces === 'object' ? incoming.pieces : {};
    const tolerance = incoming.tolerance;
    const units = incoming.unit;
    const tileSize = incoming.tileSize;
    const gatherPoolSize = incoming.gatherPoolSize;
    correlationId = incoming.correlationId;

    const groupedMap = new Map();
    for (const pieceKey of Object.keys(piecesObject)) {
      const piece = piecesObject[pieceKey];
      if (!piece || typeof piece !== 'object') continue;
      for (const key of Object.keys(piece)) {
        const value = piece[key];
        const arr = groupedMap.get(key);
        if (arr) {
          arr.push(value);
        } else {
          groupedMap.set(key, [value]);
        }
      }
    }

    for (const [id, group] of groupedMap.entries()) {
      if (id === 'size' || id === 'unique' || id === 'type') continue;
      const featureAcc = collectPolygonFeatures(group);

      // flatten
      let collection = normalizeCollection({
        type: 'FeatureCollection',
        features: featureAcc,
      });

      // clipped / unclipped split
      let clippedFeatures = [];
      let unclippedFeatures = [];
      if (collection.features.length > 1) {
        for (const feature of collection.features) {
          if (feature.properties.clipped) {
            clippedFeatures.push(feature);
          } else {
            unclippedFeatures.push(feature);
          }
        }
      }

      // union clipped features
      const unioned = [];
      if (clippedFeatures.length > 0) {
        const componentConcurrency = computeComponentConcurrency(clippedFeatures.length, gatherPoolSize);
        const components = await lightspeedPolygonComponents(clippedFeatures, {
          concurrency: componentConcurrency,
        });
        for (const component of components) {
          if (component.length === 0) continue;
          if (component.length === 1) {
            unclippedFeatures.push(component[0]);
            continue;
          }
          const memberIndexes = component.map((f) => f.properties._index).sort();
          const cprops = {
            ...component[0].properties,
            _index: memberIndexes.join('-'),
            _members: memberIndexes,
          };
          const unioned_component = union({ type: 'FeatureCollection', features: component });
          unioned.push({
            type: 'Feature',
            geometry: unioned_component.geometry,
            properties: cprops,
          });
        }
      }

      if (unioned.length > 0) {
        for (let i = 0; i < unioned.length; i += 1) {
          unclippedFeatures.push(unioned[i]);
        }
      }

      collection = {
        type: 'FeatureCollection',
        features: unclippedFeatures,
      };

      collection = normalizeCollection(collection);
      let biggest = 0;
      for (let i = 0; i < collection.features.length; i += 1) {
        const f = collection.features[i];
        const idx = `${id}-${i}`;
        const origGeom = f.geometry;
        const origProps = f.properties;
        const z = getZoomFromIndex(origProps?._index);
        // https://wiki.openstreetmap.org/wiki/Zoom_levels    
        // Adjust simplification tolerance based on zoom level to balance detail and performance. 
        const t = Math.max(tolerance, Math.pow(10, -0.301 * z + 2.56) / tileSize);
        if (origGeom && origGeom.type === 'Polygon') {
          const simplified = simplifyFeatureIfExceeds(f, 256, { tolerance: t });
          const areaVal = polygonArea(simplified, units);
          f.geometry = safePolylabel(simplified, { tolerance: t });
          f.properties = { ...origProps, _area: areaVal, _groupId: id };
          if (areaVal > biggest) biggest = areaVal;
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
      }

      for (let i = 0; i < collection.features.length; i += 1) {
        const f = collection.features[i];
        if (f.properties && f.properties._area != null && f.properties._area > 0) {
          f.properties._localSortKey = biggest / f.properties._area;
          f.properties._globalSortKey = 1 / f.properties._area;
        } else {
          f.properties._localSortKey = 1e9999;
          f.properties._globalSortKey = 1e9999;
        }
      }

      collection.id = id;
      collection.timestamp = Date.now();
      if (incoming.gatherRound != null) {
        collection.gatherRound = incoming.gatherRound;
      }
      const outBuffer = o2u8(collection).buffer;
      try {
        postToMainThread(outBuffer, [outBuffer]);
      } catch (err) {
        logger.error(err, 'Failed to send gather result to main thread');
      }
    }

    flushCommit();
  } catch (err) {
    logger.error(err, 'gather worker failed');
    flushCommit(err);
  }
};
