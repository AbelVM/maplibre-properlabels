/**
 * Tile worker: flatten incoming feature groups, filter polygons,
 * and emit a simplified worker payload back to the main thread.
 */
import { o2u8, u82o } from 'performance-helpers';
import { flatten, strictOuterCheck, countGeoJSONPoints } from '../utils/geomHelper.js';

const getWorkerScope = () =>
  typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : {};

const _root = getWorkerScope();

/**
 * @param {MessageEvent<ArrayBuffer|ArrayBufferView>} e
 */
_root.onmessage = (e) => {
  const buffer_input = e.data;
  const incoming =
    buffer_input instanceof ArrayBuffer || ArrayBuffer.isView(buffer_input)
      ? u82o(buffer_input)
      : buffer_input;
  const unique = incoming.unique;
  const correlationId = incoming.correlationId;
  const tileSize = incoming.tileSize;

  const groupedMap = new Map();
  incoming.collection.features.forEach((f) => {
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
    fc_out.features = fc_in.features
      .filter((f) => f && f.geometry && f.geometry.type === 'Polygon')
      .map((f, i) => {
        const index = `${unique}|${id}|${i}`;
        const clipped = strictOuterCheck(f.geometry.coordinates, f.properties?._tile, tileSize);
        const props = Object.assign({}, f.properties, { _index: index, clipped });
        const newF = { type: 'Feature', geometry: f.geometry, properties: props };
        size += countGeoJSONPoints(newF);
        return newF;
      });
    outputMap.set(id, fc_out);
  });

  const op = Object.fromEntries(outputMap);
  const payload = Object.assign({}, op, { unique, type: 'simplified', size });
  if (correlationId != null) {
    payload.correlationId = correlationId;
  }
  const buffer = o2u8(payload).buffer;
  _root.postMessage(buffer, [buffer]);
};
