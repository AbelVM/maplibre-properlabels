import { describe, it, expect, vi, afterEach } from 'vitest';

// Minimal maplibregl global
globalThis.maplibregl = globalThis.maplibregl || {};
globalThis.maplibregl.addProtocol = globalThis.maplibregl.addProtocol || vi.fn();
globalThis.maplibregl.VectorTileSource =
  globalThis.maplibregl.VectorTileSource || function VectorTileSource() {};
globalThis.maplibregl.VectorTileSource.prototype =
  globalThis.maplibregl.VectorTileSource.prototype || {};

// Mock the worker imports used by the module (vite-style query suffix)
vi.mock(
  '../src/workers/tileWorker.js?worker&inline',
  () => {
    class MinionWorker {
      constructor() {
        this.onmessage = null;
        this.postMessage = vi.fn();
        globalThis.__tileWorkers = globalThis.__tileWorkers || [];
        globalThis.__tileWorkers.push(this);
        globalThis.__lastTileWorker = this;
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

afterEach(() => {
  globalThis.__tileWorkers = [];
  globalThis.__lastTileWorker = null;
});

const decodeWorkerPayload = (payload) => {
  if (payload instanceof ArrayBuffer) {
    return JSON.parse(new TextDecoder().decode(new Uint8Array(payload)));
  }
  if (ArrayBuffer.isView(payload)) {
    return JSON.parse(
      new TextDecoder().decode(
        new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength)
      )
    );
  }
  return payload;
};

describe('ProperLabels sourcedata posting', () => {
  it('posts `features_bin` on sourcedata', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'ps1';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = gjsource;
      }),
      getSource: (id) => (id === 'ps1' ? sourceInst : mapStub._sources[id]),
      setTransformRequest: vi.fn((fn) => {
        mapStub._transform = fn;
      }),
      on: vi.fn((ev, cb) => {
        mapStub._sourcedataCb = cb;
      }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => [
        { id: 1, geometry: { type: 'Point', coordinates: [10, 20] }, properties: { a: 1 } },
      ]),
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({
      map: mapStub,
      source: 'ps1',
      sourceLayer: 'layer',
      fid: 'id',
      postDelay: 1,
    });

    // ensure handler installed
    expect(typeof mapStub._sourcedataCb).toBe('function');

    // trigger sourcedata
    try {
      mapStub._sourcedataCb({
        sourceId: 'ps1',
        isSourceLoaded: true,
        tile: { tileID: { canonical: { z: 12 } } },
      });
    } catch (e) {
      console.error('CALL ERROR ps1', e);
    }
    // inspect immediate state
    await new Promise((r) => setTimeout(r, 30));

    const minion = (globalThis.__tileWorkers || []).find(
      (worker) => worker.postMessage.mock.calls.length > 0
    );
    expect(minion).toBeTruthy();
    const payload = decodeWorkerPayload(minion.postMessage.mock.calls[0][0]);
    expect(payload && payload.collection && payload.unique).toBeTruthy();
  });

  it('skips sending when geometry unchanged', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'ps2';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const features = [
      { id: 's1', geometry: { type: 'Point', coordinates: [1, 2] }, properties: {} },
    ];
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = gjsource;
      }),
      getSource: (id) => (id === 'ps2' ? sourceInst : mapStub._sources[id]),
      setTransformRequest: vi.fn((fn) => {
        mapStub._transform = fn;
      }),
      on: vi.fn((ev, cb) => {
        mapStub._sourcedataCb = cb;
      }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => features),
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({
      map: mapStub,
      source: 'ps2',
      sourceLayer: 'layer',
      fid: 'id',
      postDelay: 1,
    });
    expect(typeof mapStub._sourcedataCb).toBe('function');

    // first post
    try {
      mapStub._sourcedataCb({
        sourceId: 'ps2',
        isSourceLoaded: true,
        tile: { tileID: { canonical: { z: 12 } } },
      });
    } catch (e) {
      console.error('CALL ERROR ps2', e);
    }
    // inspect immediate state
    await new Promise((r) => setTimeout(r, 30));
    const minion = (globalThis.__tileWorkers || []).find(
      (worker) => worker.postMessage.mock.calls.length > 0
    );
    expect(minion).toBeTruthy();
    const callsAfterFirst = minion.postMessage.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(0);

    // identical tile events should reuse the cached piece result and avoid duplicate worker dispatch.
    minion.postMessage.mockClear();
    mapStub._sourcedataCb({
      sourceId: 'ps2',
      isSourceLoaded: true,
      tile: { tileID: { canonical: { z: 12 } } },
    });
    await new Promise((r) => setTimeout(r, 30));
    expect(minion.postMessage).not.toHaveBeenCalled();
  });

  it('falls back to object payload when encode/JSON stringify fail', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'ps3';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const circ = {};
    circ.self = circ; // circular property to force JSON.stringify to throw
    const features = [
      { id: 99, geometry: { type: 'Point', coordinates: [5, 6] }, properties: { circ } },
    ];
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = gjsource;
      }),
      getSource: (id) => (id === 'ps3' ? sourceInst : mapStub._sources[id]),
      setTransformRequest: vi.fn((fn) => {
        mapStub._transform = fn;
      }),
      on: vi.fn((ev, cb) => {
        mapStub._sourcedataCb = cb;
      }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => features),
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({
      map: mapStub,
      source: 'ps3',
      sourceLayer: 'layer',
      fid: 'id',
      postDelay: 1,
    });
    expect(typeof mapStub._sourcedataCb).toBe('function');

    try {
      mapStub._sourcedataCb({
        sourceId: 'ps3',
        isSourceLoaded: true,
        tile: { tileID: { canonical: { z: 12 } } },
      });
    } catch (e) {
      console.error('CALL ERROR ps3', e);
    }
    // inspect immediate state
    await new Promise((r) => setTimeout(r, 30));

    const minion = (globalThis.__tileWorkers || []).find(
      (worker) => worker.postMessage.mock.calls.length > 0
    );
    expect(minion).toBeTruthy();
    const payload = decodeWorkerPayload(minion.postMessage.mock.calls[0][0]);
    expect(Array.isArray(payload.collection.features)).toBe(true);
    expect(
      payload.collection.features[0].properties && payload.collection.features[0].properties.circ
    ).toBeTruthy();
  });

  it('removes the sourcedata listener when disposed', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'ps4';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = gjsource;
      }),
      getSource: (id) =>
        id === 'ps4'
          ? sourceInst
          : id === 'ps4-proper'
          ? gjsource
          : mapStub._sources[id],
      removeSource: vi.fn((id) => {
        delete mapStub._sources[id];
      }),
      setTransformRequest: vi.fn((fn) => {
        mapStub._transform = fn;
      }),
      on: vi.fn((ev, cb) => {
        mapStub._sourcedataCb = cb;
      }),
      off: vi.fn((ev, cb) => {
        if (mapStub._sourcedataCb === cb) {
          mapStub._sourcedataCb = null;
        }
      }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({
      map: mapStub,
      source: 'ps4',
      sourceLayer: 'layer',
      fid: 'id',
    });

    expect(mapStub.off).toHaveBeenCalledTimes(0);
    expect(typeof mapStub._sourcedataCb).toBe('function');

    pl.dispose();

    expect(mapStub.off).toHaveBeenCalledWith('sourcedata', expect.any(Function));
    expect(mapStub._sourcedataCb).toBeNull();
    expect(mapStub.removeSource).toHaveBeenCalledWith('ps4-proper');
  });

  it('preserves the auxiliary source when keepSource is true', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 'ps5';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { setData: vi.fn(), updateData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => {
        mapStub._sources[id] = gjsource;
      }),
      getSource: (id) =>
        id === 'ps5'
          ? sourceInst
          : id === 'ps5-proper'
          ? gjsource
          : mapStub._sources[id],
      removeSource: vi.fn((id) => {
        delete mapStub._sources[id];
      }),
      setTransformRequest: vi.fn((fn) => {
        mapStub._transform = fn;
      }),
      on: vi.fn((ev, cb) => {
        mapStub._sourcedataCb = cb;
      }),
      off: vi.fn((ev, cb) => {
        if (mapStub._sourcedataCb === cb) {
          mapStub._sourcedataCb = null;
        }
      }),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({
      map: mapStub,
      source: 'ps5',
      sourceLayer: 'layer',
      fid: 'id',
      keepSource: true,
    });

    pl.dispose();

    expect(mapStub.removeSource).not.toHaveBeenCalled();
    expect(mapStub.getSource('ps5-proper')).toBe(gjsource);
  });
});
