import { describe, it, expect, vi } from 'vitest';

// Ensure minimal maplibregl globals
globalThis.maplibregl = globalThis.maplibregl || {};
globalThis.maplibregl.addProtocol = globalThis.maplibregl.addProtocol || vi.fn();
globalThis.maplibregl.VectorTileSource =
  globalThis.maplibregl.VectorTileSource || function VectorTileSource() {};
globalThis.maplibregl.VectorTileSource.prototype =
  globalThis.maplibregl.VectorTileSource.prototype || {};

// Mock the inline worker imports used by the module.
function workerMockFactory() {
  class MinionWorker {
    constructor() {
      this.onmessage = null;
      this.postMessage = vi.fn();
      globalThis.__lastMinion = this;
    }
  }
  return { default: MinionWorker };
}
vi.mock('../src/workers/tileWorker.js?worker&inline', workerMockFactory, { virtual: true });
vi.mock('../src/workers/gatherWorker.js?worker&inline', workerMockFactory, { virtual: true });

describe('ProperLabels integration', () => {
  it('constructs and handles geojson payload', async () => {
    const mod = await import('../src/index.js');
    const ProperLabels = mod.default;

    // create a VectorTileSource-like source instance
    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's1';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;
    sourceInst.maxzoom = 14;

    // minimal gjsource with spies (will be registered via addSource)
    const gjsourceStub = { setData: vi.fn(), updateData: vi.fn() };

    // minimal map stub that stores added sources
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = gjsourceStub;
      }),
      getSource: (id) => {
        if (id === 's1') return sourceInst;
        return mapStub._sources[id];
      },
      setTransformRequest: vi.fn((fn) => {
        mapStub._transform = fn;
      }),
      on: vi.fn((ev, cb) => {
        mapStub._sourcedataCb = cb;
      }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };
    mapStub._map = mapStub;

    const ret = new ProperLabels({ map: mapStub, source: 's1', sourceLayer: 'layer', fid: 'id' });
    const gjsource = ret || (ret && ret.gjsource) || null;

    expect(typeof gjsource).toBe('object');
    expect(mapStub.addSource).toHaveBeenCalledWith('s1-proper', expect.any(Object));
    expect(mapStub.refreshTiles).toHaveBeenCalledWith('s1');
  });

  it('throws when sourceLayer is missing', async () => {
    const mod = await import('../src/index.js');
    const ProperLabels = mod.default;
    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's1';
    sourceInst.tileSize = 512;
    sourceInst.maxzoom = 14;

    const mapStub = {
      addSource: vi.fn(),
      getSource: (id) => (id === 's1' ? sourceInst : null),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };

    expect(() =>
      new ProperLabels({ map: mapStub, source: 's1', fid: 'id' })
    ).toThrow('ProperLabels requires a valid non-empty sourceLayer string.');
  });

  it('throws when sourceLayer is only whitespace', async () => {
    const mod = await import('../src/index.js');
    const ProperLabels = mod.default;
    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's1';
    sourceInst.tileSize = 512;
    sourceInst.maxzoom = 14;

    const mapStub = {
      addSource: vi.fn(),
      getSource: (id) => (id === 's1' ? sourceInst : null),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };

    expect(() =>
      new ProperLabels({ map: mapStub, source: 's1', sourceLayer: '   ', fid: 'id' })
    ).toThrow('ProperLabels requires a valid non-empty sourceLayer string.');
  });

  it('throws when the source is not registered on the map', async () => {
    const mod = await import('../src/index.js');
    const ProperLabels = mod.default;
    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'unregistered';
    sourceInst.tileSize = 512;
    sourceInst.maxzoom = 14;

    const mapStub = {
      addSource: vi.fn(),
      getSource: (id) => null,
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };

    expect(() =>
      new ProperLabels({ map: mapStub, source: sourceInst, sourceLayer: 'layer', fid: 'id' })
    ).toThrow('ProperLabels source unregistered must be a live source registered on the provided map.');
  });

  it('throws when fid is invalid', async () => {
    const mod = await import('../src/index.js');
    const ProperLabels = mod.default;
    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's1';
    sourceInst.tileSize = 512;
    sourceInst.maxzoom = 14;

    const mapStub = {
      addSource: vi.fn(),
      getSource: (id) => (id === 's1' ? sourceInst : null),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };

    expect(() =>
      new ProperLabels({ map: mapStub, source: 's1', sourceLayer: 'layer', fid: 123 })
    ).toThrow('ProperLabels expects fid to be a string.');
  });

  it('throws when units are invalid', async () => {
    const mod = await import('../src/index.js');
    const ProperLabels = mod.default;
    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's1';
    sourceInst.tileSize = 512;
    sourceInst.maxzoom = 14;

    const mapStub = {
      addSource: vi.fn(),
      getSource: (id) => (id === 's1' ? sourceInst : null),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };

    expect(() =>
      new ProperLabels({
        map: mapStub,
        source: 's1',
        sourceLayer: 'layer',
        fid: 'id',
        units: 'feet',
      })
    ).toThrow('ProperLabels expects units to be either "meters" or "m".');
  });

  it('throws when postDelay is invalid', async () => {
    const mod = await import('../src/index.js');
    const ProperLabels = mod.default;
    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's1';
    sourceInst.tileSize = 512;
    sourceInst.maxzoom = 14;

    const mapStub = {
      addSource: vi.fn(),
      getSource: (id) => (id === 's1' ? sourceInst : null),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };

    expect(() =>
      new ProperLabels({
        map: mapStub,
        source: 's1',
        sourceLayer: 'layer',
        fid: 'id',
        postDelay: -1,
      })
    ).toThrow('ProperLabels expects postDelay to be a non-negative number.');
  });
});

