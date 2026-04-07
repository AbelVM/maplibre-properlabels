import { describe, it, expect, vi } from 'vitest';

// Minimal maplibregl global
globalThis.maplibregl = globalThis.maplibregl || {};
globalThis.maplibregl.addProtocol = globalThis.maplibregl.addProtocol || vi.fn();
globalThis.maplibregl.VectorTileSource =
  globalThis.maplibregl.VectorTileSource || function VectorTileSource() {};
globalThis.maplibregl.VectorTileSource.prototype =
  globalThis.maplibregl.VectorTileSource.prototype || {};

// Mock worker import used by module
vi.mock(
  '../src/worker.js?worker&inline',
  () => {
    class MinionWorker {
      constructor() {
        this.onmessage = null;
        this.postMessage = vi.fn();
        globalThis.__lastMinion = this;
      }
    }
    return { default: MinionWorker };
  },
  { virtual: true }
);

describe('ProperLabels when gjsource lacks updateData', () => {
  it('requests full payload when updateData is unavailable', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's-nd1';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    // gjsource without updateData
    const gjsource = {};
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = gjsource;
      }),
      getSource: (id) => (id === 's-nd1' ? sourceInst : mapStub._sources[id]),
      setTransformRequest: vi.fn(),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 's-nd1', sourceLayer: 'layer', fid: 'id' });
    const minion = globalThis.__lastMinion;

    minion.onmessage({ data: { type: 'geojson_diff', diff: { add: [], update: [], remove: [] } } });
    expect(minion.postMessage).toHaveBeenCalledWith({ type: 'request_full' });
  });
});
