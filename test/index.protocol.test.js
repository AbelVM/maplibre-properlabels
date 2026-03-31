import { describe, it, expect, vi } from 'vitest';

// Minimal maplibregl global
globalThis.maplibregl = globalThis.maplibregl || {};
globalThis.maplibregl.addProtocol = globalThis.maplibregl.addProtocol || vi.fn();
globalThis.maplibregl.VectorTileSource = globalThis.maplibregl.VectorTileSource || function VectorTileSource() {};
globalThis.maplibregl.VectorTileSource.prototype = globalThis.maplibregl.VectorTileSource.prototype || {};

// Mock worker so ProperLabels constructs cleanly
vi.mock('../src/worker.js?worker&inline', () => {
  class MinionWorker {
    constructor() { this.onmessage = null; this.postMessage = vi.fn(); globalThis.__lastMinion = this; }
  }
  return { default: MinionWorker };
}, { virtual: true });

// Note: tiling-library mocks are created inside the specific test

describe('ProperLabels._protocol', () => {
  it('returns null data for malformed URLs', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's-p1';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsource; }),
      getSource: (id) => id === 's-p1' ? sourceInst : mapStub._sources[id],
      setTransformRequest: vi.fn(),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => [])
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 's-p1', sourceLayer: 'layer', fid: 'id' });
    // the constructor registers the protocol via maplibregl.addProtocol; capture it
    const protoFn = globalThis.maplibregl.addProtocol.mock.calls[0][1];
    const res = await protoFn({ url: 'proper://short' });
    expect(res && res.data).toBeNull();
  });

  it('returns a buffer for non-200 fetch responses', async () => {
    globalThis.fetch = vi.fn(async () => ({ status: 404, arrayBuffer: async () => new ArrayBuffer(0) }));
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's-p2';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsource; }),
      getSource: (id) => id === 's-p2' ? sourceInst : mapStub._sources[id],
      setTransformRequest: vi.fn(),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => [])
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 's-p2', sourceLayer: 'layer', fid: 'id' });
    const protoFn = globalThis.maplibregl.addProtocol.mock.calls[0][1];
    const reqUrl = 'proper://http://example.com/0/0/0.pbf';
    const res = await protoFn({ url: reqUrl });
    expect(res && res.data).toBeTruthy();
    expect(typeof res.data.byteLength === 'number').toBe(true);
  });

  it('returns a buffer when fetch returns 200 (mocked tile conversion)', async () => {
    // Mock modules that are only needed for the 200-response tile conversion
    vi.mock('pbf', () => ({ default: class ProtobufMock {} }));
    vi.mock('@mapbox/vector-tile', () => {
      class VectorTileMock {
        constructor(data) {
          this.layers = {
            layer: {
              extent: 4096,
              feature: (index) => ({
                id: index,
                properties: {},
                loadGeometry: () => [[{ x: 10, y: 10 }, { x: 20, y: 20 }]]
              })
            }
          };
        }
      }
      return { VectorTile: VectorTileMock };
    });
    vi.mock('vt-pbf', () => ({ default: (tile) => ({ buffer: new ArrayBuffer(16) }) }));

    globalThis.fetch = vi.fn(async () => ({ status: 200, arrayBuffer: async () => new ArrayBuffer(8) }));
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's-p200';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsource; }),
      getSource: (id) => id === 's-p200' ? sourceInst : mapStub._sources[id],
      setTransformRequest: vi.fn(),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => [])
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 's-p200', sourceLayer: 'layer', fid: 'id' });
    const protoFn = globalThis.maplibregl.addProtocol.mock.calls[0][1];
    const res = await protoFn({ url: 'proper://http://example.com/0/0/0.pbf' });
    expect(res && res.data && typeof res.data.byteLength === 'number').toBe(true);
  });
});
