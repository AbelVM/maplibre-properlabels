import { describe, it, expect, beforeAll, vi } from 'vitest';

beforeAll(() => {
  globalThis.postMessage = vi.fn();
  try { delete globalThis.onmessage; } catch (e) {}
});

describe('worker request_full behavior', () => {
  it('commits pending diff and responds to request_full with geojson_bin', async () => {
    await import('../src/worker.js');

    expect(typeof globalThis.__test_setPendingDiff).toBe('function');
    expect(typeof globalThis.__test_getCacheSize).toBe('function');

    // set a pending diff and commit it via diff_ack
    globalThis.__test_setPendingDiff({
      addList: [ { feature: { id: 'r1', geometry: { type: 'Point', coordinates: [1,1] }, properties: {} }, rawHash: 1, geomHash: 1 } ],
      updateList: [],
      removeList: []
    });

    globalThis.onmessage({ data: { type: 'diff_ack' } });

    // now request full; worker should post geojson_bin
    globalThis.postMessage.mockClear();
    globalThis.onmessage({ data: { type: 'request_full' } });
    expect(globalThis.postMessage).toHaveBeenCalled();
    const first = globalThis.postMessage.mock.calls[0][0];
    expect(first && first.type).toBe('geojson_bin');
  });
});
