import { describe, it, beforeAll, expect, vi } from 'vitest';

beforeAll(() => {
  globalThis.postMessage = vi.fn();
  try { delete globalThis.onmessage; } catch (e) {}
});

describe('worker features (JSON) handling', () => {
  it('decodes transferable JSON payload and responds', async () => {
    await import('../src/worker.js');

    const payloadObj = { features: [{ id: 'j1', geometry: { type: 'Point', coordinates: [1, 2] }, properties: {} }], tolerance: 0.00001 };
    const enc = new TextEncoder().encode(JSON.stringify(payloadObj));

    globalThis.postMessage.mockClear();
    globalThis.onmessage({ data: { type: 'features', payload: enc.buffer } });

    expect(globalThis.postMessage).toHaveBeenCalled();
    const first = globalThis.postMessage.mock.calls[0][0];
    // worker may reply with a binary diff message or a full geojson response
    expect(first && (first.type === 'geojson_bin' || first.type === 'geojson' || first.type === 'geojson_diff_bin')).toBe(true);
  });
});
