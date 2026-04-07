import { describe, it, expect, vi } from 'vitest';

// Minimal maplibregl global
globalThis.maplibregl = globalThis.maplibregl || {};
globalThis.maplibregl.addProtocol = globalThis.maplibregl.addProtocol || vi.fn();
globalThis.maplibregl.VectorTileSource =
  globalThis.maplibregl.VectorTileSource || function VectorTileSource() {};
globalThis.maplibregl.VectorTileSource.prototype =
  globalThis.maplibregl.VectorTileSource.prototype || {};

// Mock worker so ProperLabels constructs cleanly and we can inspect the minion
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

describe('ProperLabels messaging', () => {
  it('handles geojson_bin messages and acknowledges with diff_ack', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's-gb1';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = gjsource;
      }),
      getSource: (id) => (id === 's-gb1' ? sourceInst : mapStub._sources[id]),
      setTransformRequest: vi.fn(),
      on: vi.fn((ev, cb) => {
        mapStub._sourcedataCb = cb;
      }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 's-gb1', sourceLayer: 'layer', fid: 'id' });
    const minion = globalThis.__lastMinion;

    // Simulate a binary response with empty buffers (decodeFeaturesBinary will return [])
    const coords = new Float32Array(0).buffer;
    const propsBuf = new Uint8Array(0).buffer;
    minion.onmessage({ data: { type: 'geojson_bin', meta: [], keys: [], propsBuf, coords } });

    expect(gjsource.updateData).toHaveBeenCalled();
    expect(minion.postMessage).toHaveBeenCalledWith({ type: 'diff_ack' });
  });

  // Note: posted-sourcedata behavior is complex and exercised elsewhere; skip here.
});
