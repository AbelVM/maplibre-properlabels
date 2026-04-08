import { describe, it, expect, vi, afterEach } from 'vitest';

const restoreMocks = () => {
  vi.resetModules();
  vi.doUnmock('polylabel');
  vi.doUnmock('@turf/area');
};

describe('geomHelper branch coverage', () => {
  afterEach(() => {
    restoreMocks();
  });

  it('counts empty feature collections and geometry collections', async () => {
    const { countGeoJSONPoints } = await import('../src/utils/geomHelper.js');
    expect(countGeoJSONPoints({ type: 'FeatureCollection' })).toBe(0);
    expect(countGeoJSONPoints({ type: 'GeometryCollection' })).toBe(0);
  });

  it('counts unique coordinates only once', async () => {
    const { countGeoJSONPoints } = await import('../src/utils/geomHelper.js');
    const feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] },
    };
    expect(countGeoJSONPoints(feature, { unique: true })).toBe(1);
    expect(countGeoJSONPoints({ type: 'FeatureCollection', features: [feature, feature] }, { unique: true })).toBe(1);
  });

  it('falls back to a default point when safePolylabel receives invalid polygon coordinates', async () => {
    vi.resetModules();
    vi.doMock('polylabel', () => ({ default: () => { throw new Error('boom'); } }));
    const { safePolylabel } = await import('../src/utils/geomHelper.js');
    expect(
      safePolylabel({ type: 'Feature', geometry: { type: 'Polygon', coordinates: null } })
    ).toEqual({ type: 'Point', coordinates: [0, 0] });
  });

  it('falls back to centroid for degenerate polygon geometry after polylabel throws', async () => {
    vi.resetModules();
    vi.doMock('polylabel', () => ({ default: () => { throw new Error('boom'); } }));
    const { safePolylabel } = await import('../src/utils/geomHelper.js');
    const degenerate = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [0, 0], [0, 0]]] },
    };
    expect(safePolylabel(degenerate)).toEqual({ type: 'Point', coordinates: [0, 0] });
  });

  it('returns zero for invalid planar polygon area input', async () => {
    const { polygonArea } = await import('../src/utils/geomHelper.js');
    expect(
      polygonArea({ geometry: { type: 'Polygon', coordinates: null } }, 'km')
    ).toBe(0);
    expect(
      polygonArea({ geometry: { type: 'Polygon', coordinates: [[]] } }, 'km')
    ).toBe(0);
  });

  it('returns zero when turf area throws during polygon area calculation', async () => {
    vi.resetModules();
    vi.doMock('@turf/area', () => ({ area: () => { throw new Error('boom'); } }));
    const { polygonArea } = await import('../src/utils/geomHelper.js');
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]],
      },
    };
    expect(polygonArea(feature, 'meters')).toBe(0);
  });

  it('returns a valid point for safePolylabel on a regular polygon', async () => {
    const { safePolylabel } = await import('../src/utils/geomHelper.js');
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
      },
    };
    const result = safePolylabel(feature);
    expect(result).toEqual({ type: 'Point', coordinates: expect.any(Array) });
    expect(result.coordinates.length).toBe(2);
  });

  it('computes planar area for non-meter units', async () => {
    const { polygonArea } = await import('../src/utils/geomHelper.js');
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
      },
    };
    expect(polygonArea(feature, 'km')).toBe(4);
  });

  it('returns zero for non-object inputs when counting GeoJSON points', async () => {
    const { countGeoJSONPoints } = await import('../src/utils/geomHelper.js');
    expect(countGeoJSONPoints(null)).toBe(0);
    expect(countGeoJSONPoints(42)).toBe(0);
  });

  it('returns the same feature when simplify threshold is not exceeded', async () => {
    const { simplifyFeatureIfExceeds } = await import('../src/utils/geomHelper.js');
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      },
    };
    expect(simplifyFeatureIfExceeds(feature, 10)).toBe(feature);
  });

  it('simplifies a feature when vertex count exceeds threshold', async () => {
    const { simplifyFeatureIfExceeds } = await import('../src/utils/geomHelper.js');
    const coords = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 19;
      coords.push([Math.cos(angle), Math.sin(angle)]);
    }
    coords.push(coords[0]);
    const polygon = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
    };
    const simplified = simplifyFeatureIfExceeds(polygon, 10, { tolerance: 0.5 });

    expect(simplified).toBeDefined();
    expect(simplified.type).toBe('Feature');
    expect(Array.isArray(simplified.geometry.coordinates)).toBe(true);
  });

  it('memoizes simplifyFeatureIfExceeds results for repeated calls', async () => {
    const { simplifyFeatureIfExceeds } = await import('../src/utils/geomHelper.js');
    const coords = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 19;
      coords.push([Math.cos(angle), Math.sin(angle)]);
    }
    coords.push(coords[0]);

    const polygon = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [coords],
      },
    };

    const first = simplifyFeatureIfExceeds(polygon, 10, { tolerance: 0.5 });
    const second = simplifyFeatureIfExceeds(polygon, 10, { tolerance: 0.5 });
    expect(second).toBe(first);
    expect(first.type).toBe('Feature');
  });

  it('builds connected components in parallel using lightspeedPolygonComponents', async () => {
    const { lightspeedPolygonComponents } = await import('../src/utils/geomHelper.js');
    const features = [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]] },
      },
    ];

    const components = await lightspeedPolygonComponents(features, { concurrency: 2 });
    expect(components).toHaveLength(2);
    expect(components[0]).toContain(features[0]);
    expect(components[0]).toContain(features[1]);
    expect(components[1]).toContain(features[2]);
  });

  it('falls back to synchronous adjacency when worker adjacency fails', async () => {
    vi.resetModules();
    const actualPerformanceHelpers = await vi.importActual('performance-helpers');
    class BrokenPowerPool extends actualPerformanceHelpers.PowerPool {
      postMessageBatch(items) {
        return items.map(() => Promise.reject(new Error('worker failure')));
      }
    }

    vi.doMock('performance-helpers', async () => ({
      ...actualPerformanceHelpers,
      PowerPool: BrokenPowerPool,
    }));

    const { lightspeedPolygonComponents } = await import('../src/utils/geomHelper.js');
    const features = [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]] },
      },
    ];

    const components = await lightspeedPolygonComponents(features, { concurrency: 2 });
    expect(components).toHaveLength(2);
  });

  it('returns empty components for no valid polygon inputs', async () => {
    const { lightspeedPolygonComponents } = await import('../src/utils/geomHelper.js');
    const components = await lightspeedPolygonComponents([
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } },
      { type: 'Feature', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } },
    ]);
    expect(components).toEqual([]);
  });

  it('accepts raw Polygon objects and skips invalid polygon geometries', async () => {
    const { lightspeedPolygonComponents } = await import('../src/utils/geomHelper.js');
    const rawPolygon = {
      type: 'Polygon',
      coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]],
    };
    const invalidFeature = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: null },
    };
    const components = await lightspeedPolygonComponents([rawPolygon, invalidFeature], { concurrency: 1 });
    expect(components).toEqual([[rawPolygon]]);
  });

  it('uses navigator.hardwareConcurrency when available', async () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'navigator', {
      value: { hardwareConcurrency: 8 },
      configurable: true,
      writable: true,
    });
    vi.resetModules();
    const { lightspeedPolygonComponents } = await import('../src/utils/geomHelper.js');
    const features = [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]] },
      },
    ];

    try {
      const components = await lightspeedPolygonComponents(features);
      expect(components).toHaveLength(2);
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, 'navigator', originalDescriptor);
      } else {
        delete globalThis.navigator;
      }
    }
  });

  it('normalizes invalid concurrency option to a minimum of one', async () => {
    const { lightspeedPolygonComponents } = await import('../src/utils/geomHelper.js');
    const features = [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[1, 1], [3, 1], [3, 3], [1, 3], [1, 1]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[4, 4], [5, 4], [5, 5], [4, 5], [4, 4]]] },
      },
    ];

    const components = await lightspeedPolygonComponents(features, { concurrency: -1 });
    expect(components).toHaveLength(2);
  });

  it('dispatches adjacency work through the worker branch when Worker is available', async () => {
    const originalWorkerDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'Worker');
    const originalTextDecoder = globalThis.TextDecoder;
    Object.defineProperty(globalThis, 'Worker', {
      value: class {
        constructor() {
          this._listeners = { message: new Set(), error: new Set(), messageerror: new Set() };
          this.onmessage = null;
          this.onerror = null;
          this.onmessageerror = null;
        }

        addEventListener(type, listener) {
          if (this._listeners[type]) this._listeners[type].add(listener);
        }

        removeEventListener(type, listener) {
          if (this._listeners[type]) this._listeners[type].delete(listener);
        }

        postMessage(message) {
          let data = message;
          if (message instanceof Uint8Array || ArrayBuffer.isView(message) || message instanceof ArrayBuffer) {
            const buffer = message instanceof Uint8Array ? message : new Uint8Array(message);
            data = JSON.parse(new (globalThis.TextDecoder || TextDecoder)().decode(buffer));
          }

          if (data && data.type === 'build-range') {
            const neighbors = [];
            for (let i = data.start; i < data.end; i += 1) {
              neighbors.push({ index: i, neighbors: [] });
            }
            this._emitMessage({ data: { correlationId: data.correlationId, neighbors } });
          }
        }

        terminate() {}

        _emitMessage(event) {
          if (typeof this.onmessage === 'function') {
            this.onmessage(event);
          }
          for (const listener of this._listeners.message) {
            listener(event);
          }
        }
      },
      configurable: true,
      writable: true,
    });
    vi.resetModules();

    const { lightspeedPolygonComponents } = await import('../src/utils/geomHelper.js');
    const features = [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]] },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]] },
      },
    ];

    try {
      const components = await lightspeedPolygonComponents(features, { concurrency: 2 });
      expect(components).toHaveLength(2);
    } finally {
      if (originalWorkerDescriptor) {
        Object.defineProperty(globalThis, 'Worker', originalWorkerDescriptor);
      } else {
        delete globalThis.Worker;
      }
      if (originalTextDecoder === undefined) {
        delete globalThis.TextDecoder;
      } else {
        globalThis.TextDecoder = originalTextDecoder;
      }
    }
  });
});
