import { describe, it, expect, vi, beforeAll } from 'vitest';

// ensure postMessage exists so worker can use it
let postSpy;
beforeAll(() => {
  postSpy = vi.fn();
  globalThis.postMessage = postSpy;
  // clear any existing onmessage handler so import sets it fresh
  try { delete globalThis.onmessage; } catch (e) {}
});

describe('src/worker.js behavior', () => {
  it('exports an onmessage handler and responds to request_full with geojson_bin', async () => {
    // import the worker module (sets global onmessage)
    await import('../src/worker.js');
    expect(typeof globalThis.onmessage).toBe('function');

    // send a request_full message and expect a postMessage response
    globalThis.onmessage({ data: { type: 'request_full' } });
    expect(postSpy).toHaveBeenCalled();
    const first = postSpy.mock.calls[0][0];
    expect(first && first.type).toBe('geojson_bin');
  });

  it('handles a minimal features_bin message without throwing', async () => {
    // Ensure the handler exists
    if (typeof globalThis.onmessage !== 'function') {
      await import('../src/worker.js');
    }
    const coords = new Float32Array(0).buffer;
    const propsBuf = new Uint8Array(0).buffer;
    const msg = { data: { type: 'features_bin', add: { coords, meta: [], propsBuf, keys: [] }, update: null, removeList: [] } };
    // Should not throw
    globalThis.onmessage(msg);
    expect(true).toBe(true);
  });
});
