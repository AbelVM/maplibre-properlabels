import { describe, it, expect, vi, afterEach } from 'vitest';

const restoreWorker = (original) => {
  if (original === undefined) {
    delete globalThis.Worker;
  } else {
    globalThis.Worker = original;
  }
};

describe('geomHelper_intersectiongraph helper coverage', () => {
  let originalWorker;

  afterEach(() => {
    restoreWorker(originalWorker);
    vi.resetModules();
  });

  it('returns false when bboxes do not intersect', async () => {
    const { polygonIntersectsPolygon } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const a = {
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      bbox: [0, 0, 1, 1],
    };
    const b = {
      coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]],
      bbox: [2, 2, 3, 3],
    };

    expect(polygonIntersectsPolygon(a, b)).toBe(false);
  });

  it('returns true for polygons with overlapping edges', async () => {
    const { polygonIntersectsPolygon } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const inside = {
      coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
      bbox: [0, 0, 2, 2],
    };
    const overlapping = {
      coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]],
      bbox: [1, 1, 3, 3],
    };

    expect(polygonIntersectsPolygon(inside, overlapping)).toBe(true);
  });

  it('returns true when one polygon contains another', async () => {
    const { polygonIntersectsPolygon } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const outer = {
      coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]],
      bbox: [0, 0, 4, 4],
    };
    const inner = {
      coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]],
      bbox: [1, 1, 2, 2],
    };

    expect(polygonIntersectsPolygon(outer, inner)).toBe(true);
    expect(polygonIntersectsPolygon(inner, outer)).toBe(true);
  });

  it('splits index ranges into the expected chunks', async () => {
    const { splitRanges } = await import('../src/utils/geomHelper_intersectiongraph.js');
    expect(await splitRanges(7, 3)).toEqual([[0, 3], [3, 6], [6, 7]]);
    expect(await splitRanges(0, 3)).toEqual([]);
  });

  it('builds adjacency sync across memoized polygon intersections', async () => {
    const { buildAdjacencySync } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const nodes = [
      {
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
        bbox: [0, 0, 2, 2],
        feature: { id: 1 },
      },
      {
        coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]],
        bbox: [1, 1, 3, 3],
        feature: { id: 2 },
      },
      {
        coordinates: [[[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]],
        bbox: [4, 4, 5, 5],
        feature: { id: 3 },
      },
    ];

    expect(buildAdjacencySync(nodes)).toEqual([[1], [0], []]);
  });

  it('handles adjacency sync when nodes do not include feature metadata', async () => {
    const { buildAdjacencySync } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const nodes = [
      {
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
        bbox: [0, 0, 2, 2],
      },
      {
        coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]],
        bbox: [1, 1, 3, 3],
      },
    ];

    expect(buildAdjacencySync(nodes)).toEqual([[1], [0]]);
  });

  it('ignores undefined nodes during adjacency sync', async () => {
    const { buildAdjacencySync } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const nodes = [
      {
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
        bbox: [0, 0, 2, 2],
      },
      undefined,
      {
        coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]],
        bbox: [1, 1, 3, 3],
      },
    ];

    expect(buildAdjacencySync(nodes)).toEqual([[2], [], [0]]);
  });

  it('builds adjacency in parallel when Worker is available', async () => {
    originalWorker = globalThis.Worker;
    globalThis.Worker = class {
      constructor() {
        this.onmessage = null;
        this.onerror = null;
        this.onmessageerror = null;
      }

      addEventListener(type, listener) {
        if (type === 'message') this.onmessage = listener;
      }

      removeEventListener(type, listener) {
        if (type === 'message' && this.onmessage === listener) this.onmessage = null;
      }

      postMessage(message) {
        let payload = message;
        if (payload instanceof Uint8Array || ArrayBuffer.isView(payload) || payload instanceof ArrayBuffer) {
          const u8 = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
          payload = JSON.parse(new TextDecoder().decode(u8));
        }

        const neighbors = [];
        for (let i = payload.start; i < payload.end; i += 1) {
          neighbors.push({ index: i, neighbors: [] });
        }

        const response = { correlationId: payload.correlationId, neighbors };
        if (typeof this.onmessage === 'function') {
          setTimeout(() => this.onmessage({ data: response }), 0);
        }
      }

      terminate() {}
    };

    vi.resetModules();
    const { buildAdjacencyParallel } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const nodes = [
      { coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], bbox: [0, 0, 1, 1], feature: { id: 1 } },
      { coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]], bbox: [2, 2, 3, 3], feature: { id: 2 } },
    ];

    const adjacency = await buildAdjacencyParallel(nodes, 2);
    expect(adjacency).toEqual([[], []]);
  });

  it('ignores undefined nodes during parallel adjacency', async () => {
    originalWorker = globalThis.Worker;
    globalThis.Worker = class {
      constructor() {
        this.onmessage = null;
        this.onerror = null;
        this.onmessageerror = null;
      }

      addEventListener(type, listener) {
        if (type === 'message') this.onmessage = listener;
      }

      removeEventListener(type, listener) {
        if (type === 'message' && this.onmessage === listener) this.onmessage = null;
      }

      postMessage(message) {
        let payload = message;
        if (payload instanceof Uint8Array || ArrayBuffer.isView(payload) || payload instanceof ArrayBuffer) {
          const u8 = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
          payload = JSON.parse(new TextDecoder().decode(u8));
        }

        const neighbors = [];
        for (let i = payload.start; i < payload.end; i += 1) {
          const row = [];
          const nodeA = payload.nodes[i];
          for (let j = 0; j < payload.nodes.length; j += 1) {
            if (i === j) continue;
            const nodeB = payload.nodes[j];
            if (!nodeA || !nodeB) continue;
            if (
              nodeA.bbox[0] <= nodeB.bbox[2] &&
              nodeA.bbox[2] >= nodeB.bbox[0] &&
              nodeA.bbox[1] <= nodeB.bbox[3] &&
              nodeA.bbox[3] >= nodeB.bbox[1]
            ) {
              row.push(j);
            }
          }
          neighbors.push({ index: i, neighbors: row });
        }

        const response = { correlationId: payload.correlationId, neighbors };
        if (typeof this.onmessage === 'function') {
          setTimeout(() => this.onmessage({ data: response }), 0);
        }
      }

      terminate() {}
    };

    vi.resetModules();
    const { buildAdjacencyParallel } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const nodes = [
      { coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]], bbox: [0, 0, 2, 2], feature: { id: 1 } },
      undefined,
      { coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]], bbox: [1, 1, 3, 3], feature: { id: 2 } },
    ];

    const adjacency = await buildAdjacencyParallel(nodes, 2);
    expect(adjacency).toEqual([[2], [], [0]]);
  });

  it('reuses the PowerPool instance across parallel adjacency calls', async () => {
    originalWorker = globalThis.Worker;
    globalThis.Worker = class {
      constructor() {
        this.onmessage = null;
        this.onerror = null;
        this.onmessageerror = null;
      }

      addEventListener(type, listener) {
        if (type === 'message') this.onmessage = listener;
      }

      removeEventListener(type, listener) {
        if (type === 'message' && this.onmessage === listener) this.onmessage = null;
      }

      postMessage(message) {
        let payload = message;
        if (payload instanceof Uint8Array || ArrayBuffer.isView(payload) || payload instanceof ArrayBuffer) {
          const u8 = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
          payload = JSON.parse(new TextDecoder().decode(u8));
        }

        const neighbors = [];
        for (let i = payload.start; i < payload.end; i += 1) {
          neighbors.push({ index: i, neighbors: [] });
        }

        const response = { correlationId: payload.correlationId, neighbors };
        if (typeof this.onmessage === 'function') {
          setTimeout(() => this.onmessage({ data: response }), 0);
        }
      }

      terminate() {}
    };

    const actualPerf = await vi.importActual('performance-helpers');
    class MockPowerPool {
      static instances = [];
      constructor(workerSource, opts) {
        this.workerSource = workerSource;
        this.opts = opts;
        this.maxSize = opts.maxSize || opts.size;
        this.minSize = opts.minSize;
        this.workers = [];
        MockPowerPool.instances.push(this);
      }
      resize(n) {
        if (typeof n === 'number') {
          this.maxSize = Math.max(this.minSize, n);
        } else if (n && typeof n.maxSize === 'number') {
          this.maxSize = Math.max(this.minSize, n.maxSize);
        }
      }
      prepareBuffers(items) {
        return items;
      }
      postMessageBatch(items) {
        return items.map((item) =>
          Promise.resolve({ neighbors: [{ index: item.message.start, neighbors: [] }] })
        );
      }
      terminate() {}
    }

    vi.doMock('performance-helpers', async () => ({
      ...actualPerf,
      PowerPool: MockPowerPool,
    }));

    vi.resetModules();
    const { buildAdjacencyParallel } = await import('../src/utils/geomHelper_intersectiongraph.js');
    const nodes = [
      { coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], bbox: [0, 0, 1, 1], feature: { id: 1 } },
      { coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]], bbox: [2, 2, 3, 3], feature: { id: 2 } },
      { coordinates: [[[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]], bbox: [4, 4, 5, 5], feature: { id: 3 } },
    ];

    const first = await buildAdjacencyParallel(nodes, 2);
    const second = await buildAdjacencyParallel(nodes, 3);

    expect(MockPowerPool.instances.length).toBe(1);
    expect(first).toEqual([[ ], [ ], [ ]]);
    expect(second).toEqual([[ ], [ ], [ ]]);
  });
});
