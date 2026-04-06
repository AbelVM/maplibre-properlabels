import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockManager = {
  createdManager: null,
};

vi.mock('../../src/managers/PowerTileManager.js', () => {
  return {
    default: class MockPowerTileManager {
      constructor() {
        this.listeners = new Map();
        this.gatherCache = new Map();
        this.options = {};
        mockManager.createdManager = this;
      }

      on(event, listener) {
        this.listeners.set(event, listener);
      }

      trigger(event, payload) {
        const listener = this.listeners.get(event);
        if (listener) listener(payload);
      }

      processTile(unique, payload, options) {
        this.lastProcessTile = { unique, payload, options };
        return Promise.resolve(true);
      }
    },
  };
});

vi.mock('../../src/workers/tileWorker.js?worker&inline', () => ({ default: class MockTileWorker {} }), { virtual: true });
vi.mock('../../src/workers/gatherWorker.js?worker&inline', () => ({ default: class MockGatherWorker {} }), { virtual: true });

const maplibregl = {
  VectorTileSource: class VectorTileSource {},
};

globalThis.maplibregl = maplibregl;

describe('ProperLabels', () => {
  let ProperLabels;

  beforeEach(async () => {
    mockManager.createdManager = null;
    const module = await import('../../src/index.js');
    ProperLabels = module.default;
  });

  it('attaches ProperLabels to VectorTileSource prototype', () => {
    expect(typeof maplibregl.VectorTileSource.prototype.ProperLabels).toBe('function');
  });

  it('registers a geojson source and returns the geojson source handle', async () => {
    const updateData = vi.fn();
    const map = {
      addSource: vi.fn(),
      getSource: vi.fn(() => ({
        id: 'test-source',
        tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
        tileSize: 512,
        maxzoom: 14,
        type: 'vector',
      })),
      on: vi.fn(),
      refreshTiles: vi.fn(),
    };

    const source = new maplibregl.VectorTileSource();
    source.id = 'test-source';
    source.tiles = ['https://example.com/{z}/{x}/{y}.pbf'];
    source.tileSize = 512;
    source.maxzoom = 14;
    source.type = 'vector';
    source._map = map;
    source.querySourceFeatures = vi.fn((target, options) => {
      target.push({
        id: 1,
        properties: { id: 'feature-1' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      });
    });

    const geojsonSource = { updateData };
    map.getSource = vi.fn((id) => (id === 'test-source-proper' ? geojsonSource : source));
    map.addSource = vi.fn();

    const properLabelsSource = source.ProperLabels({ sourceLayer: 'layer', fid: 'id' });

    expect(properLabelsSource).toBe(geojsonSource);
    expect(map.addSource).toHaveBeenCalledWith('test-source-proper', expect.objectContaining({ type: 'geojson' }));
    expect(map.refreshTiles).toHaveBeenCalledWith('test-source');
  });

  it('processes sourcedata events and submits a tile payload', async () => {
    const updateData = vi.fn();
    const map = {
      addSource: vi.fn(),
      getSource: vi.fn((id) => (id === 'test-source-proper' ? { updateData } : source)),
      on: vi.fn((event, callback) => {
        if (event === 'sourcedata') {
          map._sourcedataCallback = callback;
        }
      }),
      refreshTiles: vi.fn(),
    };

    const source = new maplibregl.VectorTileSource();
    source.id = 'test-source';
    source.tiles = ['https://example.com/{z}/{x}/{y}.pbf'];
    source.tileSize = 512;
    source.maxzoom = 14;
    source.type = 'vector';
    source._map = map;
    source.querySourceFeatures = vi.fn((target) => {
      target.push({
        id: 7,
        properties: { id: 'feature-7' },
        geometry: { type: 'Point', coordinates: [1, 2] },
      });
    });

    map.getSource = vi.fn((id) => (id === 'test-source-proper' ? { updateData } : source));
    map.addSource = vi.fn();

    source.ProperLabels({ sourceLayer: 'layer', fid: 'id' });

    expect(map._sourcedataCallback).toBeTypeOf('function');
    map._sourcedataCallback({
      sourceId: 'test-source',
      tile: {
        tileID: { canonical: { z: 1, x: 2, y: 3 } },
        querySourceFeatures: source.querySourceFeatures,
      },
    });

    expect(mockManager.createdManager.lastProcessTile).toBeDefined();
    expect(mockManager.createdManager.lastProcessTile.unique).toBe('1|2|3');
    expect(mockManager.createdManager.lastProcessTile.options.cacheKey).toBe('1|2|3');
    expect(mockManager.createdManager.lastProcessTile.options.awaitResponse).toBe(true);
  });
});
