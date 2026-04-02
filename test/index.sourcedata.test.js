import { describe, it, expect, vi } from 'vitest';

// Minimal maplibregl global
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

describe('ProperLabels sourcedata posting', () => {
  it('posts `features_bin` on sourcedata', async () => {
    // Instrument utils.encodeFeaturesBinary to see if it runs
    vi.mock('../src/utils.js', async () => {
      const actual = await vi.importActual('../src/utils.js');
      return {
        ...actual,
        encodeFeaturesBinary: (...args) => {
          return actual.encodeFeaturesBinary(...args);
        }
      };
    });
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'ps1';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsource; }),
      getSource: (id) => id === 'ps1' ? sourceInst : mapStub._sources[id],
      setTransformRequest: vi.fn(fn => { mapStub._transform = fn; }),
      on: vi.fn((ev, cb) => { mapStub._sourcedataCb = cb; }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => [ { id: 1, geometry: { type: 'Point', coordinates: [10, 20] }, properties: { a: 1 } } ])
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 'ps1', sourceLayer: 'layer', fid: 'id', postDelay: 1 });

    // ensure handler installed
    expect(typeof mapStub._sourcedataCb).toBe('function');

    // trigger sourcedata
    try { mapStub._sourcedataCb({ sourceId: 'ps1', isSourceLoaded: true, tile: { tileID: { canonical: { z: 12 } } } }); } catch (e) { console.error('CALL ERROR ps1', e); }
    // inspect immediate state
    await new Promise(r => setTimeout(r, 30));

    const minion = globalThis.__lastMinion;
    // debug info
    expect(minion.postMessage).toHaveBeenCalled();
    const msg = minion.postMessage.mock.calls[0][0];
    expect(msg && msg.type === 'features_bin').toBe(true);
  });

  it('skips sending when geometry unchanged', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'ps2';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const features = [ { id: 's1', geometry: { type: 'Point', coordinates: [1,2] }, properties: {} } ];
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsource; }),
      getSource: (id) => id === 'ps2' ? sourceInst : mapStub._sources[id],
      setTransformRequest: vi.fn(fn => { mapStub._transform = fn; }),
      on: vi.fn((ev, cb) => { mapStub._sourcedataCb = cb; }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => features)
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 'ps2', sourceLayer: 'layer', fid: 'id', postDelay: 1 });
    expect(typeof mapStub._sourcedataCb).toBe('function');

    // first post
    try { mapStub._sourcedataCb({ sourceId: 'ps2', isSourceLoaded: true, tile: { tileID: { canonical: { z: 12 } } } }); } catch (e) { console.error('CALL ERROR ps2', e); }
    // inspect immediate state
    await new Promise(r => setTimeout(r, 30));
    const minion = globalThis.__lastMinion;
    const callsAfterFirst = minion.postMessage.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(0);

    // clear and call again with identical features -> worker no longer
    // performs geometry-change short-circuiting, so it should post again.
    minion.postMessage.mockClear();
    mapStub._sourcedataCb({ sourceId: 'ps2', isSourceLoaded: true, tile: { tileID: { canonical: { z: 12 } } } });
    await new Promise(r => setTimeout(r, 30));
    expect(minion.postMessage).toHaveBeenCalled();
  });

  it('falls back to object payload when encode/JSON stringify fail', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'ps3';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const circ = {}; circ.self = circ; // circular property to force JSON.stringify to throw
    const features = [ { id: 99, geometry: { type: 'Point', coordinates: [5,6] }, properties: { circ } } ];
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsource; }),
      getSource: (id) => id === 'ps3' ? sourceInst : mapStub._sources[id],
      setTransformRequest: vi.fn(fn => { mapStub._transform = fn; }),
      on: vi.fn((ev, cb) => { mapStub._sourcedataCb = cb; }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => features)
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 'ps3', sourceLayer: 'layer', fid: 'id', postDelay: 1 });
    expect(typeof mapStub._sourcedataCb).toBe('function');

    try { mapStub._sourcedataCb({ sourceId: 'ps3', isSourceLoaded: true, tile: { tileID: { canonical: { z: 12 } } } }); } catch (e) { console.error('CALL ERROR ps3', e); }
    // inspect immediate state
    await new Promise(r => setTimeout(r, 30));

    const minion = globalThis.__lastMinion;
    expect(minion.postMessage).toHaveBeenCalled();
    const call = minion.postMessage.mock.calls[0][0];
    expect(call && Array.isArray(call.features)).toBe(true);
    expect(call.promoteId).toBe('id');
  });
});
