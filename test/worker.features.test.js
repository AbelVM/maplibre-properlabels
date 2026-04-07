import { describe, it, expect, beforeAll, vi } from 'vitest';
import { encodeFeaturesBinary } from '../src/utils.js';

beforeAll(() => {
  globalThis.postMessage = vi.fn();
  try {
    delete globalThis.onmessage;
  } catch (e) {}
});

describe('worker features_bin handling', () => {
  it('responds with geojson_bin when cache is empty', async () => {
    await import('../src/worker.js');

    const features = [
      { id: 'x', geometry: { type: 'Point', coordinates: [10, 20] }, properties: { a: 1 } },
    ];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features);

    globalThis.onmessage({
      data: {
        type: 'features_bin',
        meta,
        keys,
        propsBuf: propsBuffer.buffer,
        coords: coordsArray.buffer,
      },
    });

    expect(globalThis.postMessage).toHaveBeenCalled();
    const msg = globalThis.postMessage.mock.calls[0][0];
    // worker now replies with a diff-style binary message
    expect(msg && msg.type).toBe('geojson_diff_bin');
  });
});
