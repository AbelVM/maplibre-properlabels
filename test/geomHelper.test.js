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
});
