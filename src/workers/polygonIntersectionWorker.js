/**
 * Worker for evaluating polygon intersection ranges in parallel.
 */
import { o2u8, u82o } from 'performance-helpers';

const getWorkerScope = () =>
  typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : {};

const _root = getWorkerScope();

const orientation = (a, b, c) => {
  const [ax, ay] = a;
  const [bx, by] = b;
  const [cx, cy] = c;
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
};

const onSegment = (a, b, c) => {
  const [ax, ay] = a;
  const [bx, by] = b;
  const [cx, cy] = c;
  return (
    Math.min(ax, bx) <= cx && cx <= Math.max(ax, bx) &&
    Math.min(ay, by) <= cy && cy <= Math.max(ay, by)
  );
};

const segmentsIntersect = (p1, p2, q1, q2) => {
  const o1 = orientation(p1, p2, q1);
  const o2 = orientation(p1, p2, q2);
  const o3 = orientation(q1, q2, p1);
  const o4 = orientation(q1, q2, p2);

  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, p2, q2)) return true;
  if (o3 === 0 && onSegment(q1, q2, p1)) return true;
  if (o4 === 0 && onSegment(q1, q2, p2)) return true;

  return o1 * o2 < 0 && o3 * o4 < 0;
};

const pointInRing = (point, ring) => {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const pointInPolygon = (point, coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return false;
  if (!pointInRing(point, coordinates[0])) return false;
  for (let i = 1; i < coordinates.length; i++) {
    if (pointInRing(point, coordinates[i])) return false;
  }
  return true;
};

const bboxIntersects = (a, b) =>
  a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];

const isValidIntersectionNode = (node) =>
  node &&
  Array.isArray(node.bbox) &&
  node.bbox.length === 4 &&
  Array.isArray(node.coordinates) &&
  node.coordinates.length > 0;

/**
 * Return true if two polygon nodes intersect by edge crossing or containment.
 * @param {Object} a
 * @param {Object} b
 * @returns {boolean}
 */
const polygonIntersectsPolygon = (a, b) => {
  if (!isValidIntersectionNode(a) || !isValidIntersectionNode(b)) return false;
  if (!bboxIntersects(a.bbox, b.bbox)) return false;

  for (const ringA of a.coordinates) {
    for (let ia = 0; ia + 1 < ringA.length; ia++) {
      const p1 = ringA[ia];
      const p2 = ringA[ia + 1];
      if (!Array.isArray(p1) || !Array.isArray(p2)) continue;
      for (const ringB of b.coordinates) {
        for (let ib = 0; ib + 1 < ringB.length; ib++) {
          const q1 = ringB[ib];
          const q2 = ringB[ib + 1];
          if (!Array.isArray(q1) || !Array.isArray(q2)) continue;
          if (segmentsIntersect(p1, p2, q1, q2)) return true;
        }
      }
    }
  }

  const sampleA = a.coordinates[0]?.[0];
  const sampleB = b.coordinates[0]?.[0];
  if (Array.isArray(sampleA) && pointInPolygon(sampleA, b.coordinates)) return true;
  if (Array.isArray(sampleB) && pointInPolygon(sampleB, a.coordinates)) return true;

  return false;
};

/**
 * @param {MessageEvent<ArrayBuffer|ArrayBufferView>} e
 */
_root.onmessage = (e) => {
  const buffer_input = e.data;
  const incoming =
    buffer_input instanceof ArrayBuffer || ArrayBuffer.isView(buffer_input)
      ? u82o(buffer_input)
      : buffer_input;

  const { type, nodes, start, end, correlationId } = incoming;
  if (type !== 'build-range' || !Array.isArray(nodes)) return;

  const neighbors = [];
  for (let i = start; i < end; i++) {
    const row = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      if (polygonIntersectsPolygon(nodes[i], nodes[j])) row.push(j);
    }
    neighbors.push({ index: i, neighbors: row });
  }

  const payload = { correlationId, neighbors };
  const buffer = o2u8(payload).buffer;
  _root.postMessage(buffer, [buffer]);
};
