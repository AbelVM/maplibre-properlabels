import { describe, it, expect, vi } from 'vitest';
import { o2u8, u82o } from 'performance-helpers';

const polygonFeature = {
  id: 'feature-1',
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
  },
  properties: {
    id: 'feature-1',
    _tile: '0|0|0',
    _index: '0|0|0|0',
    _group: 'feature-1',
  },
};

const restoreGlobals = (orig) => {
  globalThis.postMessage = orig.postMessage;
  globalThis.onmessage = orig.onmessage;
  if ('self' in globalThis) globalThis.self = orig.self;
};

describe('worker binary decoding', () => {
  it('tileWorker decodes ArrayBuffer input and posts a simplified buffer response', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    await import('../src/workers/tileWorker.js');

    const payload = {
      collection: { type: 'FeatureCollection', features: [polygonFeature] },
      tolerance: 0.00001,
      unique: '0|0|0',
      correlationId: 'cid-tile-1',
      tileSize: 512,
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(1);
    const [sentBuffer] = globalThis.postMessage.mock.calls[0];
    expect(sentBuffer).toBeInstanceOf(ArrayBuffer);
    const decoded = u82o(sentBuffer);
    expect(decoded).toHaveProperty('type', 'simplified');
    expect(decoded).toHaveProperty('unique', '0|0|0');
    expect(decoded).toHaveProperty('correlationId', 'cid-tile-1');
    restoreGlobals(orig);
  });

  it('gatherWorker decodes ArrayBuffer input and posts collection and commit messages', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        tileA: {
          'feature-1': {
            type: 'FeatureCollection',
            features: [polygonFeature],
          },
          size: 1,
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      correlationId: 'cid-gather-1',
      tileSize: 512,
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);
    const [firstCall] = globalThis.postMessage.mock.calls[0];
    expect(firstCall).toBeInstanceOf(ArrayBuffer);
    const decoded = u82o(firstCall);
    expect(decoded).toHaveProperty('id', 'feature-1');
    expect(decoded).toHaveProperty('features');
    const commitCall = globalThis.postMessage.mock.calls[1][0];
    expect(commitCall).toMatchObject({ type: 'commit', correlationId: 'cid-gather-1' });
    expect(typeof commitCall.timestamp).toBe('number');
    restoreGlobals(orig);
  });

  it('tileWorker accepts plain object input without binary encoding', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    await import('../src/workers/tileWorker.js');

    const payload = {
      collection: { type: 'FeatureCollection', features: [polygonFeature] },
      tolerance: 0.00001,
      unique: '0|0|0',
      tileSize: 512,
    };

    await globalThis.onmessage?.({ data: payload });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(1);
    const [sentBuffer] = globalThis.postMessage.mock.calls[0];
    const decoded = u82o(sentBuffer);
    expect(decoded).toHaveProperty('type', 'simplified');
    restoreGlobals(orig);
  });

  it('uses globalThis when self is undefined for tileWorker import', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    delete globalThis.self;
    vi.resetModules();
    await import('../src/workers/tileWorker.js');
    restoreGlobals(orig);
  });

  it('uses globalThis when self is undefined for gatherWorker import', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    delete globalThis.self;
    vi.resetModules();
    await import('../src/workers/gatherWorker.js');
    restoreGlobals(orig);
  });

  it('triggers gatherWorker clipped union branch when multiple clipped features exist', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        groupA: {
          featureA: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
                },
                properties: { _tile: '0|0|0', _index: 'a-0', clipped: true },
              },
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
                },
                properties: { _tile: '0|0|0', _index: 'a-1', clipped: true },
              },
            ],
          },
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512,
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);
    restoreGlobals(orig);
  });

  it('hits the gatherWorker fallback branch when flatten returns a non-polygon feature', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    vi.doMock('../src/utils/geomHelper.js', async () => {
      const actual = await vi.importActual('../src/utils/geomHelper.js');
      return {
        ...actual,
        flatten: () => ({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: { _tile: '0|0|0', _index: 'p-0' },
            },
          ],
        }),
        union: actual.union,
        safePolylabel: actual.safePolylabel,
        polygonArea: actual.polygonArea,
        simplify: actual.simplify,
      };
    });
    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        groupA: {
          featureA: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 0]]]],
                },
                properties: { _tile: '0|0|0', _index: 'a-0', clipped: false },
              },
            ],
          },
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512,
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);
    restoreGlobals(orig);
    vi.doUnmock('../src/utils/geomHelper.js');
  });

  it('uses default tolerance, unit, and tileSize values in gatherWorker when missing', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        tileA: {
          featureA: {
            type: 'FeatureCollection',
            features: [polygonFeature],
          },
          size: 1,
        },
      },
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);
    restoreGlobals(orig);
  });

  it('processes a single clipped feature without performing a union', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        groupA: {
          featureA: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
                },
                properties: { _tile: '0|0|0', _index: 'a-0', clipped: true },
              },
            ],
          },
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512,
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);
    restoreGlobals(orig);
  });

  it('ignores the reserved size key when grouping pieces', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        size: 1,
        groupA: {
          featureA: {
            type: 'FeatureCollection',
            features: [polygonFeature],
          },
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512,
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);
    restoreGlobals(orig);
  });

  it('handles unexpected geometry after union by using fallback sort keys', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    vi.doMock('../src/utils/geomHelper.js', async () => {
      const actual = await vi.importActual('../src/utils/geomHelper.js');
      return {
        ...actual,
        union: () => ({ geometry: { type: 'Point', coordinates: [0, 0] } }),
      };
    });
    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        groupA: {
          featureA: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
                },
                properties: { _tile: '0|0|0', _index: 'a-0', clipped: true },
              },
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
                },
                properties: { _tile: '0|0|0', _index: 'a-1', clipped: true },
              },
            ],
          },
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512,
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);
    restoreGlobals(orig);
    vi.doUnmock('../src/utils/geomHelper.js');
  });

  it('handles simple polygon groups without MultiPolygon or clipped features', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    vi.resetModules();
    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        groupA: {
          featureA: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
                },
                properties: { _tile: '0|0|0', _index: 'a-0' },
              },
            ],
          },
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512,
    };

    const encoded = o2u8(payload).buffer;
    await globalThis.onmessage?.({ data: encoded });

    expect(globalThis.postMessage).toHaveBeenCalledTimes(2);
    restoreGlobals(orig);
  });

  it('uses adaptive component concurrency = 1 for small clipped groups', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
      navigator: globalThis.navigator,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    Object.defineProperty(globalThis, 'navigator', {
      value: { hardwareConcurrency: 12 },
      configurable: true,
      writable: true,
    });

    vi.resetModules();
    const lightspeedSpy = vi.fn(async (features) => [features]);
    vi.doMock('../src/utils/geomHelper.js', async () => {
      const actual = await vi.importActual('../src/utils/geomHelper.js');
      return {
        ...actual,
        lightspeedPolygonComponents: lightspeedSpy,
      };
    });

    await import('../src/workers/gatherWorker.js');

    const payload = {
      pieces: {
        groupA: {
          featureA: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
                properties: { _tile: '0|0|0', _index: 'a-0', clipped: true },
              },
              {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
                properties: { _tile: '0|0|0', _index: 'a-1', clipped: true },
              },
            ],
          },
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512,
      gatherPoolSize: 2,
    };

    await globalThis.onmessage?.({ data: o2u8(payload).buffer });

    expect(lightspeedSpy).toHaveBeenCalledTimes(1);
    expect(lightspeedSpy.mock.calls[0][1]).toEqual(
      expect.objectContaining({ concurrency: 1 })
    );

    if (orig.navigator === undefined) {
      delete globalThis.navigator;
    } else {
      Object.defineProperty(globalThis, 'navigator', {
        value: orig.navigator,
        configurable: true,
        writable: true,
      });
    }
    restoreGlobals(orig);
    vi.doUnmock('../src/utils/geomHelper.js');
  });

  it('uses adaptive component concurrency > 1 for larger clipped groups when budget allows', async () => {
    const orig = {
      postMessage: globalThis.postMessage,
      onmessage: globalThis.onmessage,
      self: globalThis.self,
      navigator: globalThis.navigator,
    };
    globalThis.postMessage = vi.fn();
    globalThis.onmessage = null;
    globalThis.self = globalThis;
    Object.defineProperty(globalThis, 'navigator', {
      value: { hardwareConcurrency: 12 },
      configurable: true,
      writable: true,
    });

    vi.resetModules();
    const lightspeedSpy = vi.fn(async (features) => [features]);
    vi.doMock('../src/utils/geomHelper.js', async () => {
      const actual = await vi.importActual('../src/utils/geomHelper.js');
      return {
        ...actual,
        lightspeedPolygonComponents: lightspeedSpy,
      };
    });

    await import('../src/workers/gatherWorker.js');

    const clippedFeatures = Array.from({ length: 10 }, (_, i) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
      properties: { _tile: '0|0|0', _index: `a-${i}`, clipped: true },
    }));

    const payload = {
      pieces: {
        groupA: {
          featureA: {
            type: 'FeatureCollection',
            features: clippedFeatures,
          },
        },
      },
      tolerance: 0.00001,
      unit: 'meters',
      tileSize: 512,
      gatherPoolSize: 1,
    };

    await globalThis.onmessage?.({ data: o2u8(payload).buffer });

    expect(lightspeedSpy).toHaveBeenCalledTimes(1);
    expect(lightspeedSpy.mock.calls[0][1]).toEqual(
      expect.objectContaining({ concurrency: 2 })
    );

    if (orig.navigator === undefined) {
      delete globalThis.navigator;
    } else {
      Object.defineProperty(globalThis, 'navigator', {
        value: orig.navigator,
        configurable: true,
        writable: true,
      });
    }
    restoreGlobals(orig);
    vi.doUnmock('../src/utils/geomHelper.js');
  });
});
