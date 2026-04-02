import { describe, it, expect, vi } from 'vitest';

// Ensure minimal maplibregl globals
globalThis.maplibregl = globalThis.maplibregl || {};
globalThis.maplibregl.addProtocol = globalThis.maplibregl.addProtocol || vi.fn();
globalThis.maplibregl.VectorTileSource = globalThis.maplibregl.VectorTileSource || function VectorTileSource() {};
globalThis.maplibregl.VectorTileSource.prototype = globalThis.maplibregl.VectorTileSource.prototype || {};

// Mock the worker import used by the module (vite-style query suffix)
vi.mock('../src/worker.js?worker&inline', () => {
  class MinionWorker {
    constructor() {
      this.onmessage = null;
      this.postMessage = vi.fn();
      globalThis.__lastMinion = this;
    }
  }
  return { default: MinionWorker };
}, { virtual: true });

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
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsourceStub; }),
      getSource: (id) => {
        if (id === 's1') return sourceInst;
        return mapStub._sources[id];
      },
      setTransformRequest: vi.fn(fn => { mapStub._transform = fn; }),
      on: vi.fn((ev, cb) => { mapStub._sourcedataCb = cb; }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => [])
    };
    mapStub._map = mapStub;

    const ret = new ProperLabels({ map: mapStub, source: 's1', sourceLayer: 'layer', fid: 'id' });
    // The constructor may return the geojson source object directly. Normalize.
    const gjsource = ret || (ret && ret.gjsource) || null;
    expect(typeof gjsource).toBe('object');

    // test transformRequest behavior (installed on mapStub)
    const tf = mapStub._transform('http://example.com/0/0/0.pbf', 'Tile');
    expect(tf && typeof tf.url === 'string').toBe(true);

    // simulate worker sending a json payload using the last created minion
    const minion = globalThis.__lastMinion;
    const obj = { type: 'FeatureCollection', features: [{ type: 'Feature', id: 1, geometry: { type: 'Point', coordinates: [1, 2] }, properties: {} }] };
    const enc = new TextEncoder().encode(JSON.stringify(obj));
    minion.onmessage({ data: { type: 'geojson', payload: enc.buffer } });
    expect(gjsource.updateData).toHaveBeenCalled();
  });

  it('handles geojson_diff: updateData success and failure', async () => {
    const mod = await import('../src/index.js');
    const ProperLabels = mod.default;

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's2';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsourceStub2 = { updateData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsourceStub2; }),
      getSource: (id) => {
        if (id === 's2') return sourceInst;
        return mapStub._sources[id];
      },
      setTransformRequest: vi.fn(fn => { mapStub._transform = fn; }),
      on: vi.fn((ev, cb) => { mapStub._sourcedataCb = cb; }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => [])
    };
    mapStub._map = mapStub;

    const ret = new ProperLabels({ map: mapStub, source: 's2', sourceLayer: 'layer', fid: 'id' });
    const gjsource2 = ret || (ret && ret.gjsource) || null;
    const minion2 = globalThis.__lastMinion;
    // successful updateData -> diff_ack
    gjsource2.updateData = vi.fn();
    minion2.postMessage = vi.fn();
    minion2.onmessage({ data: { type: 'geojson_diff', diff: { add: [], update: [], remove: [] } } });
    expect(minion2.postMessage).toHaveBeenCalledWith({ type: 'diff_ack' });

    // failing updateData -> request_full
    gjsource2.updateData = vi.fn(() => { throw new Error('fail'); });
    minion2.postMessage = vi.fn();
    minion2.onmessage({ data: { type: 'geojson_diff', diff: { add: [], update: [], remove: [] } } });
    expect(minion2.postMessage).toHaveBeenCalledWith({ type: 'request_full' });
  });
});
