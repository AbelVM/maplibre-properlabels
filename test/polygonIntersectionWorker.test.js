import { describe, it, expect, vi, afterEach } from 'vitest';
import { o2u8, u82o } from 'performance-helpers';

const restoreGlobals = (orig) => {
  if (!orig) return;
  if (typeof orig.postMessage === 'undefined') delete globalThis.postMessage;
  else globalThis.postMessage = orig.postMessage;
  if (typeof orig.onmessage === 'undefined') delete globalThis.onmessage;
  else globalThis.onmessage = orig.onmessage;
  if (typeof orig.self === 'undefined') delete globalThis.self;
  else globalThis.self = orig.self;
};

describe('polygonIntersectionWorker', () => {
  let orig;

  afterEach(() => {
    restoreGlobals(orig);
    vi.resetModules();
  });

  const initWorker = async () => {
    orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    await import('../src/workers/polygonIntersectionWorker.js');
  };

  it('ignores messages that are not build-range requests', async () => {
    await initWorker();
    const payload = { type: 'no-op', nodes: [] };
    await globalThis.onmessage?.({ data: o2u8(payload).buffer });
    expect(globalThis.postMessage).not.toHaveBeenCalled();
  });

  it('returns no neighbors for disjoint polygons', async () => {
    await initWorker();
    const nodes = [
      {
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        bbox: [0, 0, 1, 1],
      },
      {
        coordinates: [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]],
        bbox: [2, 2, 3, 3],
      },
    ];
    const payload = { type: 'build-range', nodes, start: 0, end: 1, correlationId: 'disjoint' };
    await globalThis.onmessage?.({ data: o2u8(payload).buffer });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(1);
    const [buffer] = globalThis.postMessage.mock.calls[0];
    const decoded = u82o(buffer);
    expect(decoded).toEqual({ correlationId: 'disjoint', neighbors: [{ index: 0, neighbors: [] }] });
  });

  it('detects edge intersection between adjacent polygons', async () => {
    await initWorker();
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
    const payload = { type: 'build-range', nodes, start: 0, end: 2, correlationId: 'edge' };
    await globalThis.onmessage?.({ data: o2u8(payload).buffer });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(1);
    const [buffer] = globalThis.postMessage.mock.calls[0];
    const decoded = u82o(buffer);
    expect(decoded.correlationId).toBe('edge');
    expect(decoded.neighbors).toContainEqual({ index: 0, neighbors: [1] });
    expect(decoded.neighbors).toContainEqual({ index: 1, neighbors: [0] });
  });

  it('detects containment when one polygon lies inside another', async () => {
    await initWorker();
    const nodes = [
      {
        coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]],
        bbox: [0, 0, 4, 4],
      },
      {
        coordinates: [[[1, 1], [2, 1], [2, 2], [1, 2], [1, 1]]],
        bbox: [1, 1, 2, 2],
      },
    ];
    const payload = { type: 'build-range', nodes, start: 0, end: 2, correlationId: 'containment' };
    await globalThis.onmessage?.({ data: o2u8(payload).buffer });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(1);
    const [buffer] = globalThis.postMessage.mock.calls[0];
    const decoded = u82o(buffer);
    expect(decoded.neighbors).toContainEqual({ index: 0, neighbors: [1] });
    expect(decoded.neighbors).toContainEqual({ index: 1, neighbors: [0] });
  });
});
