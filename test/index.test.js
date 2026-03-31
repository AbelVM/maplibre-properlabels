import { describe, it, expect, vi } from 'vitest';

// Provide a minimal `maplibregl` global so importing `src/index.js` doesn't throw
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
    }
  }
  return { default: MinionWorker };
}, { virtual: true });

describe('src/index.js module', () => {
  it('imports cleanly and registers ProperLabels on VectorTileSource.prototype', async () => {
    const mod = await import('../src/index.js');
    expect(typeof mod.default).toBe('function');
    expect(typeof maplibregl.VectorTileSource.prototype.ProperLabels).toBe('function');
  });
});
