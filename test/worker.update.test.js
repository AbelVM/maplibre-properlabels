import { describe, it, beforeAll, expect, vi } from 'vitest';
import { encodeFeaturesBinary } from '../src/utils.js';

beforeAll(() => {
  globalThis.postMessage = vi.fn();
  try {
    delete globalThis.onmessage;
  } catch (e) {}
});

describe('worker update flow', () => {
  it('commits pending diff and responds with a diff when a feature updates', async () => {
    await import('../src/worker.js');

    // seed cache via pending diff + diff_ack
    globalThis.__test_setPendingDiff({
      addList: [
        {
          feature: { id: 'u1', geometry: { type: 'Point', coordinates: [1, 1] }, properties: {} },
          rawHash: 1,
          geomHash: 1,
        },
      ],
      updateList: [],
      removeList: [],
    });
    globalThis.onmessage({ data: { type: 'diff_ack' } });

    // now send an updated features_bin for the same id with changed coordinates
    const updated = [
      { id: 'u1', geometry: { type: 'Point', coordinates: [2, 3] }, properties: {} },
    ];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(updated);

    globalThis.postMessage.mockClear();
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
    const first = globalThis.postMessage.mock.calls[0][0];
    // worker may send a binary diff or a JSON diff fallback
    expect(first && (first.type === 'geojson_diff_bin' || first.type === 'geojson_diff')).toBe(
      true
    );
  });
});
