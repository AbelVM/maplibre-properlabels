/**
 * @module geomHelper_intersectiongraph
 * @description Polygon intersection graph utilities used by the main plugin.
 */
import { PowerMemoizer, PowerPool, PowerQueue } from 'performance-helpers';
import PolygonIntersectionWorker from '../workers/polygonIntersectionWorker.js?worker&inline';

const featureMemoId = new WeakMap();
let sharedAdjacencyPool = null;
let nextFeatureMemoId = 0;
const getFeatureMemoKey = (feature) => {
  if (feature === undefined) return '__undefined';
  if (feature === null) return '__null';
  if (typeof feature !== 'object' && typeof feature !== 'function') return String(feature);
  if (!featureMemoId.has(feature)) {
    featureMemoId.set(feature, String(nextFeatureMemoId++));
  }
  return featureMemoId.get(feature);
};

const polygonIntersectionMemo = new PowerMemoizer(
  (a, b) => polygonIntersectsPolygon(a, b),
  {
    keyResolver: (a, b) => {
      const aKey = getFeatureMemoKey(a?.feature ?? a);
      const bKey = getFeatureMemoKey(b?.feature ?? b);
      return aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
    },
  }
);

const isValidPolygonCoordinates = (coordinates) =>
  Array.isArray(coordinates) &&
  coordinates.length > 0 &&
  coordinates.every(
    (ring) =>
      Array.isArray(ring) &&
      ring.length >= 3 &&
      ring.every(
        (point) =>
          Array.isArray(point) &&
          point.length >= 2 &&
          Number.isFinite(point[0]) &&
          Number.isFinite(point[1])
      )
  );

const isValidIntersectionNode = (node) =>
  node &&
  Array.isArray(node.bbox) &&
  node.bbox.length === 4 &&
  Array.isArray(node.coordinates) &&
  node.coordinates.length > 0;

export const validatePolygonFeature = (feature) => {
  const geometry = feature?.geometry || (feature?.type === 'Polygon' ? feature : null);
  return geometry && geometry.type === 'Polygon' && isValidPolygonCoordinates(geometry.coordinates)
    ? geometry
    : null;
};

/**
 * @typedef {Object} IntersectionNode
 * @property {Object} feature GeoJSON Feature object.
 * @property {Array<Array<number>>} coordinates Polygon coordinate rings.
 * @property {[number, number, number, number]} bbox Bounding box for the polygon.
 */

/**
 * Normalize an array of polygon GeoJSON features into internal graph nodes.
 * @param {Array<Object>} features
 * @returns {IntersectionNode[]}
 */
const nodesFromFeatures = (features) =>
  features
    .map((feature) => {
      const geometry = validatePolygonFeature(feature);
      const bbox = geometry ? getPolygonBbox(geometry.coordinates) : null;
      if (!geometry || !bbox) return null;
      return {
        feature,
        coordinates: geometry.coordinates,
        bbox,
      };
    })
    .filter(Boolean);

/**
 * Walk the adjacency graph and group connected nodes into components.
 * @param {IntersectionNode[]} nodes
 * @param {Array<number[]>} adjacency
 * @returns {Array<Array<Object>>} Connected components of input features.
 */
const buildComponentsFromAdjacency = (nodes, adjacency) => {
  const visited = new Array(nodes.length).fill(false);
  const components = [];
  const queue = new PowerQueue(Math.max(16, nodes.length));

  for (let i = 0; i < nodes.length; i++) {
    if (visited[i] || !isValidIntersectionNode(nodes[i])) {
      visited[i] = true;
      continue;
    }

    const component = [];
    queue.clear();
    queue.push(i);
    visited[i] = true;

    while (!queue.isEmpty) {
      const currentIndex = queue.shift();
      if (!isValidIntersectionNode(nodes[currentIndex])) continue;
      component.push(nodes[currentIndex].feature);
      for (const neighborIndex of adjacency[currentIndex] || []) {
        if (visited[neighborIndex]) continue;
        visited[neighborIndex] = true;
        queue.push(neighborIndex);
      }
    }

    if (component.length > 0) {
      components.push(component);
    }
  }

  return components;
};

/**
 * Build the adjacency list for graph nodes using memoized polygon intersection checks.
 * @param {IntersectionNode[]} nodes
 * @returns {Array<number[]>}
 */
export const buildAdjacencySync = (nodes) => {
  const adjacency = Array.from({ length: nodes.length }, () => []);

  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    if (!nodeA) continue;
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeB = nodes[j];
      if (!nodeB) continue;
      if (polygonIntersectionMemo(nodeA, nodeB)) {
        adjacency[i].push(j);
        adjacency[j].push(i);
      }
    }
  }

  return adjacency;
};

/**
 * Split the node index range into chunk boundaries for parallel processing.
 * @param {number} length Total number of nodes.
 * @param {number} chunks Number of chunks to produce.
 * @returns {Promise<Array<[number, number]>>}
 */
export const splitRanges = async (length, chunks) => {
  if (length <= 0 || chunks <= 0) return [];
  const chunkSize = Math.ceil(length / chunks);
  const ranges = [];
  for (let i = 0; i < chunks; i += 1) {
    const start = i * chunkSize;
    const end = Math.min(length, start + chunkSize);
    if (start < end) {
      ranges.push([start, end]);
    }
  }
  return ranges;
};

/**
 * Build adjacency rows in parallel using a shared worker pool.
 * @param {IntersectionNode[]} nodes
 * @param {number} concurrency Number of worker tasks to launch.
 * @returns {Promise<Array<number[]>>}
 */
const getSharedAdjacencyPool = (concurrency) => {
  const poolSize = Math.max(2, concurrency);
  if (!sharedAdjacencyPool) {
    sharedAdjacencyPool = new PowerPool(PolygonIntersectionWorker, {
      size: poolSize,
      minSize: 2,
      lazy: false,
      idleTimeout: 30_000,
    });
  } else if (poolSize > sharedAdjacencyPool.maxSize) {
    sharedAdjacencyPool.resize(poolSize);
  }
  return sharedAdjacencyPool;
};

export const buildAdjacencyParallel = async (nodes, concurrency) => {
  if (!nodes.length) return [];
  if (typeof Worker === 'undefined') {
    return buildAdjacencySync(nodes);
  }

  const pool = getSharedAdjacencyPool(concurrency);
  const ranges = await splitRanges(nodes.length, concurrency);
  const batchItems = ranges.map(([start, end]) => ({
    message: { type: 'build-range', nodes, start, end },
  }));
  let results;
  try {
    results = await Promise.all(
      pool.postMessageBatch(batchItems, {
        awaitResponse: true,
        timeout: 30_000,
        correlationIdFactory: (index) => String(index),
      })
    );
  } catch (err) {
    return buildAdjacencySync(nodes);
  }

  const adjacency = Array.from({ length: nodes.length }, () => []);

  for (const result of results) {
    if (!result || !Array.isArray(result.neighbors)) continue;
    for (const { index, neighbors: neighborList } of result.neighbors) {
      if (Number.isFinite(index) && Array.isArray(neighborList)) {
        adjacency[index] = neighborList;
      }
    }
  }

  return adjacency;
};

/**
 * Build graph components from polygon features by their intersection relation.
 * Uses a worker pool for parallel pairwise intersection evaluation.
 * @param {Array<Object>} features Array of GeoJSON polygon Features
 * @param {{concurrency?: number}} [options]
 * @returns {Promise<Array<Array<Object>>>}
 */
export async function lightspeedPolygonComponents(features, options = {}) {
  const nodes = Array.isArray(features) ? nodesFromFeatures(features) : [];
  if (nodes.length === 0) return [];

  const hw = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
    ? Math.max(1, Math.floor(navigator.hardwareConcurrency))
    : 2;
  const concurrency = Math.max(1, Math.min(nodes.length, Number.isFinite(options.concurrency) ? options.concurrency : hw));

  return buildComponentsFromAdjacency(nodes, await buildAdjacencyParallel(nodes, concurrency));
}

/**
 * Compute the axis-aligned bounding box for a single polygon ring.
 * @param {Array<Array<number>>} ring Polygon ring as an array of points.
 * @returns {[number, number, number, number]}
 */
const getRingBbox = (ring) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of ring) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const [x, y] = point;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
};

/**
 * Compute the axis-aligned bounding box for a polygon with one or more rings.
 * @param {Array<Array<Array<number>>>} coordinates Polygon coordinates.
 * @returns {[number, number, number, number]}
 */
const getPolygonBbox = (coordinates) => {
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  for (const ring of coordinates) {
    const [minX, minY, maxX, maxY] = getRingBbox(ring);
    if (minX < bbox[0]) bbox[0] = minX;
    if (minY < bbox[1]) bbox[1] = minY;
    if (maxX > bbox[2]) bbox[2] = maxX;
    if (maxY > bbox[3]) bbox[3] = maxY;
  }
  return Number.isFinite(bbox[0]) && Number.isFinite(bbox[1]) && Number.isFinite(bbox[2]) && Number.isFinite(bbox[3])
    ? bbox
    : null;
};

/**
 * Test whether two bounding boxes intersect.
 * @param {[number, number, number, number]} a
 * @param {[number, number, number, number]} b
 * @returns {boolean}
 */
const bboxIntersects = (a, b) =>
  a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];

/**
 * Compute orientation of the triplet (a, b, c).
 * @param {Array<number>} a
 * @param {Array<number>} b
 * @param {Array<number>} c
 * @returns {number}
 */
const orientation = (a, b, c) => {
  const [ax, ay] = a;
  const [bx, by] = b;
  const [cx, cy] = c;
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
};

/**
 * Return true when point c lies on the segment ab.
 * @param {Array<number>} a
 * @param {Array<number>} b
 * @param {Array<number>} c
 * @returns {boolean}
 */
const onSegment = (a, b, c) => {
  const [ax, ay] = a;
  const [bx, by] = b;
  const [cx, cy] = c;
  return (
    Math.min(ax, bx) <= cx && cx <= Math.max(ax, bx) &&
    Math.min(ay, by) <= cy && cy <= Math.max(ay, by)
  );
};

/**
 * Test whether two line segments intersect.
 * @param {Array<number>} p1
 * @param {Array<number>} p2
 * @param {Array<number>} q1
 * @param {Array<number>} q2
 * @returns {boolean}
 */
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

/**
 * Ray-cast test for whether a point lies inside a polygon ring.
 * @param {Array<number>} point
 * @param {Array<Array<number>>} ring
 * @returns {boolean}
 */
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

/**
 * Test whether a point is inside the polygon, accounting for holes.
 * @param {Array<number>} point
 * @param {Array<Array<Array<number>>>} coordinates
 * @returns {boolean}
 */
const pointInPolygon = (point, coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return false;
  if (!pointInRing(point, coordinates[0])) return false;
  for (let i = 1; i < coordinates.length; i++) {
    if (pointInRing(point, coordinates[i])) return false;
  }
  return true;
};

/**
 * Return true if two polygon nodes intersect by edge crossing or containment.
 * @param {Object} a
 * @param {Object} b
 * @returns {boolean}
 */
export const polygonIntersectsPolygon = (a, b) => {
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
