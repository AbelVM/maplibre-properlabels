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
    // minimal map required by constructor (used only for addSource/getSource etc.)
    source._map = {
      addSource: vi.fn(),
      getSource: vi.fn(() => ({})),
      setTransformRequest: vi.fn(),
      on: vi.fn(),
      refreshTiles: vi.fn(),
      querySourceFeatures: vi.fn(() => []),
    };

    const inst1 = source.ProperLabels();
    const inst2 = source.ProperLabels();
    expect(inst1).toBe(inst2);
  });
});
