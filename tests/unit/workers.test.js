import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { o2u8, u82o } from '../../externals/performance-helpers.es.js';

describe('Worker logic', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('postMessage', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.onmessage;
  });

  it('tileWorker posts simplified tile output as an ArrayBuffer', async () => {
    await import('../../src/workers/tileWorker.js');

    const payload = {
      tolerance: 0.00001,
      unique: 'tile-1',
      tileSize: 512,
      collection: {
        type: 'FeatureCollection',
        features: [
          {
            id: 'feature-a',
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 0.001],
                  [0.001, 0.001],
                  [0.001, 0],
                  [0, 0]
                ]
              ]
            },
            properties: {
              _tile: 'tile-1',
              _index: 'tile-1|0',
              id: 'feature-a'
            }
          }
        ]
      }
    };

    globalThis.onmessage({ data: o2u8(payload).buffer });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(1);
    const [message] = globalThis.postMessage.mock.calls[0];
    const result = u82o(message instanceof ArrayBuffer ? message : message.buffer || message);

    expect(result).toBeTypeOf('object');
    expect(result).toHaveProperty('type', 'simplified');
    expect(result).toHaveProperty('unique', 'tile-1');
    expect(result).toHaveProperty('size');
    expect(typeof result.size).toBe('number');
  });

  it('gatherWorker flattens and labels polygon pieces then commits', async () => {
    await import('../../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        group1: {
          group1: {
            features: [
              {
                id: 'feature-1',
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [0, 0],
                      [0, 0.001],
                      [0.001, 0.001],
                      [0.001, 0],
                      [0, 0]
                    ]
                  ]
                },
                properties: {
                  _index: 'group1|0',
                  _tile: 'tile-1',
                  clipped: false
                }
              }
            ]
          }
        }
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512
    };

    globalThis.onmessage({ data: o2u8(payload).buffer });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);

    const [firstCall] = globalThis.postMessage.mock.calls[0];
    const firstResult = u82o(firstCall instanceof ArrayBuffer ? firstCall : firstCall.buffer || firstCall);

    expect(firstResult).toBeTypeOf('object');
    expect(firstResult).toHaveProperty('id', 'group1');
    expect(firstResult).toHaveProperty('features');
    expect(firstResult.features[0].geometry).toHaveProperty('type', 'Point');
    expect(firstResult.features[0].properties).toHaveProperty('_area');
    expect(firstResult.features[0].properties).toHaveProperty('_groupId', 'group1');

    const [secondCall] = globalThis.postMessage.mock.calls[1];
    expect(secondCall).toEqual({ type: 'commit' });
  });
});
