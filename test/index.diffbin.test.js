import { describe, it, expect, vi } from 'vitest';
import { encodeFeaturesBinary } from '../src/utils.js';

// Minimal maplibregl global
globalThis.maplibregl = globalThis.maplibregl || {};
globalThis.maplibregl.addProtocol = globalThis.maplibregl.addProtocol || vi.fn();
globalThis.maplibregl.VectorTileSource = globalThis.maplibregl.VectorTileSource || function VectorTileSource() {};
globalThis.maplibregl.VectorTileSource.prototype = globalThis.maplibregl.VectorTileSource.prototype || {};

// Mock worker so ProperLabels constructs cleanly
vi.mock('../src/worker.js?worker&inline', () => {
  class MinionWorker { constructor() { this.onmessage = null; this.postMessage = vi.fn(); globalThis.__lastMinion = this; } }
  return { default: MinionWorker };
}, { virtual: true });

describe('ProperLabels geojson_diff_bin handling', () => {
  it('decodes add and compacted update diffs and applies updateData + ack', async () => {
    const { default: ProperLabels } = await import('../src/index.js');

    const sourceInst = new maplibregl.VectorTileSource();
    sourceInst.id = 's-db1';
    sourceInst.tiles = ['http://example.com/{z}/{x}/{y}.pbf'];
    sourceInst.tileSize = 512;

    const gjsource = { updateData: vi.fn() };
    const mapStub = {
      _sources: {},
      addSource: vi.fn((id, opts) => { mapStub._sources[id] = gjsource; }),
      getSource: (id) => id === 's-db1' ? sourceInst : mapStub._sources[id],
      setTransformRequest: vi.fn(),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => [])
    };
    mapStub._map = mapStub;

    const pl = new ProperLabels({ map: mapStub, source: 's-db1', sourceLayer: 'layer', fid: 'id' });
    const minion = globalThis.__lastMinion;

    // prepare add feature binary
    const addFeatures = [{ id: 'u1', geometry: { type: 'Point', coordinates: [5, 6] }, properties: {} }];
    const { meta: addMeta, keys: addKeys, propsBuffer: addPropsBuf, coordsArray: addCoords } = encodeFeaturesBinary(addFeatures);

    // prepare compacted update diffs: one key and one JSON value
    const upKeys = ['k1'];
    const upEnc = new TextEncoder().encode(JSON.stringify('updated'));

    const updateDiffsMeta = [{ id: 'u1', addOrUpdate: [[0, 0, upEnc.length]] }];

    const msg = {
      type: 'geojson_diff_bin',
      add: { meta: addMeta, keys: addKeys, propsBuf: addPropsBuf ? addPropsBuf.buffer : null, coords: addCoords.buffer },
      updateDiffsMeta,
      updateKeys: upKeys,
      updatePropsBuf: upEnc.buffer
    };

    minion.onmessage({ data: msg });

    expect(gjsource.updateData).toHaveBeenCalled();
    expect(minion.postMessage).toHaveBeenCalledWith({ type: 'diff_ack' });
  });
});
