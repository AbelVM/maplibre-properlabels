import { describe, it, expect, vi } from 'vitest';

// Minimal maplibregl global
globalThis.maplibregl = globalThis.maplibregl || {};
globalThis.maplibregl.addProtocol = globalThis.maplibregl.addProtocol || vi.fn();
globalThis.maplibregl.VectorTileSource =
  globalThis.maplibregl.VectorTileSource || function VectorTileSource() {};
globalThis.maplibregl.VectorTileSource.prototype =
  globalThis.maplibregl.VectorTileSource.prototype || {};

// Mock worker imports used by the module
vi.mock(
  '../src/workers/tileWorker.js?worker&inline',
  () => {
    class MinionWorker {
      constructor() {
        this.onmessage = null;
        this.postMessage = vi.fn();
      }
    }
    return { default: MinionWorker };
  },
  { virtual: true }
);
vi.mock(
  '../src/workers/gatherWorker.js?worker&inline',
  () => {
    class MinionWorker {
      constructor() {
        this.onmessage = null;
        this.postMessage = vi.fn();
      }
    }
    return { default: MinionWorker };
  },
  { virtual: true }
);

describe('Prototype ProperLabels idempotency', () => {
  it('returns same instance when called multiple times', async () => {
    const { default: ProperLabels } = await import('../src/index.js');
    const source = new maplibregl.VectorTileSource();
    source.id = 'proto-src';
    source.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    source.tileSize = 512;
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = {};
      }),
      getSource: vi.fn((id) => (id === 'proto-src' ? source : mapStub._sources[id])),
      setTransformRequest: vi.fn(),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };
    source._map = mapStub;

    const inst1 = source.ProperLabels({ sourceLayer: 'layer', fid: 'id' });
    const inst2 = source.ProperLabels({ sourceLayer: 'layer', fid: 'id' });
    expect(inst1).toBe(inst2);
  });

  it('recreates the plugin instance when new options differ', async () => {
    const { default: ProperLabels } = await import('../src/index.js');
    const source = new maplibregl.VectorTileSource();
    source.id = 'proto-src-2';
    source.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    source.tileSize = 512;
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = {};
      }),
      getSource: vi.fn((id) => (id === 'proto-src-2' ? source : mapStub._sources[id])),
      setTransformRequest: vi.fn(),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };
    source._map = mapStub;

    const inst1 = source.ProperLabels({ sourceLayer: 'layer', fid: 'id' });
    const inst2 = source.ProperLabels({ sourceLayer: 'layer', fid: 'uid' });
    expect(inst1).not.toBe(inst2);
  });

  it('throws a clear error when called on a source not attached to a map', async () => {
    await import('../src/index.js');
    const source = new maplibregl.VectorTileSource();
    source.id = 'proto-src-no-map';
    source.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    source.tileSize = 512;

    expect(() => source.ProperLabels()).toThrow(
      'ProperLabels plugin helper requires the VectorTileSource to be attached to a map.'
    );
  });
});
