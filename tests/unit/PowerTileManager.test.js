import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../externals/performance-helpers.es.js', () => {
  class FakePool {
    constructor(source, options) {
      this.source = source;
      this.options = options;
      this.listeners = { message: [], error: [], idle: [] };
      this.callCount = 0;
    }

    addEventListener(event, listener) {
      this.listeners[event].push(listener);
    }

    postMessageBatch(prepared) {
      this.callCount += 1;
      this.prepared = prepared;
      return prepared.map(() => true);
    }

    drain() {
      return Promise.resolve('drained');
    }

    terminate() {
      this.terminated = true;
    }
  }

  class FakeCache {
    constructor(options = {}) {
      this.store = new Map();
      this.defaultTTL = options.defaultTTL || 0;
      this.maxEntries = options.maxEntries || Infinity;
    }

    has(key) {
      return this.store.has(key);
    }

    get(key) {
      return this.store.get(key);
    }

    set(key, value) {
      this.store.set(key, value);
      return true;
    }

    getOrSetAsync(key, factory) {
      if (this.store.has(key)) {
        return Promise.resolve(this.store.get(key));
      }
      return Promise.resolve(factory()).then((value) => {
        this.store.set(key, value);
        return value;
      });
    }
  }

  class FakeBatch {
    constructor(handler, options) {
      this.handler = handler;
      this.options = options;
      this.add = vi.fn(async (item) => this.handler([item]));
      this.clear = vi.fn();
    }
  }

  class FakeBus {
    constructor() {
      this.listeners = new Map();
    }

    on(event, listener) {
      const handlers = this.listeners.get(event) || [];
      handlers.push(listener);
      this.listeners.set(event, handlers);
      return () => this.off(event, listener);
    }

    off(event, listener) {
      const handlers = this.listeners.get(event) || [];
      this.listeners.set(event, handlers.filter((item) => item !== listener));
    }

    emit(event, payload) {
      const handlers = this.listeners.get(event) || [];
      handlers.forEach((listener) => listener(payload));
    }

    clear() {
      this.listeners.clear();
    }
  }

  class FakeLogger {
    constructor() {
      this.errors = [];
    }

    error(err) {
      this.errors.push(err);
    }
  }

  class FakeDefer {
    constructor() {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  }

  return {
    PowerPool: FakePool,
    PowerCache: FakeCache,
    PowerBatch: FakeBatch,
    PowerEventBus: FakeBus,
    PowerLogger: FakeLogger,
    PowerDefer: FakeDefer,
    o2u8: (value) => value,
    u82o: (value) => value,
  };
});

describe('PowerTileManager', () => {
  let PowerTileManager;

  beforeEach(async () => {
    vi.resetModules();
    ({ default: PowerTileManager } = await import('../../src/managers/PowerTileManager.js'));
  });

  it('dispatches tile requests and resolves when the tile worker returns a response', async () => {
    const manager = new PowerTileManager({
      tileWorkerSource: () => ({}),
      gatherWorkerSource: () => ({}),
      tileCacheOptions: { defaultTTL: 1000, maxEntries: 10 },
      gatherCacheOptions: { defaultTTL: 1000, maxEntries: 10 },
    });

    const responsePromise = manager.processTile('tile-1', { foo: 'bar' }, { cacheKey: 'tile-1', awaitResponse: true, timeout: 1000 });
    const requestId = [...manager._pendingTileRequests.keys()][0];

    expect(manager._pendingTileRequests.has(requestId)).toBe(true);

    manager.tilePool.listeners.message[0]({ data: { requestId } });

    await expect(responsePromise).resolves.toEqual({ requestId });
    expect(manager.tileCache.get('tile-1')).toEqual({ requestId });
    expect(manager.tilePool.prepared[0].message.tileKey).toBe('tile-1');
  });

  it('uses cache for repeated tile requests with the same cache key', async () => {
    const manager = new PowerTileManager({
      tileWorkerSource: () => ({}),
      gatherWorkerSource: () => ({}),
      tileCacheOptions: { defaultTTL: 1000, maxEntries: 10 },
      gatherCacheOptions: { defaultTTL: 1000, maxEntries: 10 },
    });

    const responsePromise = manager.processTile('tile-2', { foo: 'bar' }, { cacheKey: 'tile-2', awaitResponse: true, timeout: 1000 });
    const requestId = [...manager._pendingTileRequests.keys()][0];
    manager.tilePool.listeners.message[0]({ data: { requestId } });
    await expect(responsePromise).resolves.toEqual({ requestId });

    const callCountAfterFirst = manager.tilePool.callCount;
    const secondResponse = await manager.processTile('tile-2', { foo: 'bar' }, { cacheKey: 'tile-2', awaitResponse: true, timeout: 1000 });
    expect(secondResponse).toEqual({ requestId });
    expect(manager.tilePool.callCount).toBe(callCountAfterFirst);
  });

  it('dispatches gather pieces and resolves when the gather worker returns a response', async () => {
    const manager = new PowerTileManager({
      tileWorkerSource: () => ({}),
      gatherWorkerSource: () => ({}),
      tileCacheOptions: { defaultTTL: 1000, maxEntries: 10 },
      gatherCacheOptions: { defaultTTL: 1000, maxEntries: 10 },
    });

    const gathered = manager.enqueueGatherPiece('piece-1', { bar: 'baz' }, { cacheKey: 'gather-1', awaitResponse: true, timeout: 1000 });
    const requestId = [...manager._pendingGatherRequests.keys()][0];

    expect(manager.gatherPool.prepared[0].message.bar).toBe('baz');
    manager.gatherPool.listeners.message[0]({ data: { requestId } });

    await expect(gathered).resolves.toEqual({ requestId });
    expect(manager.gatherCache.get('gather-1')).toEqual({ requestId });
  });

  it('maps tile responses into gather pieces when tileToGather is configured', async () => {
    const manager = new PowerTileManager({
      tileWorkerSource: () => ({}),
      gatherWorkerSource: () => ({}),
      tileCacheOptions: { defaultTTL: 1000, maxEntries: 10 },
      gatherCacheOptions: { defaultTTL: 1000, maxEntries: 10 },
      tileToGather: (tileResult) => ({
        pieceKey: 'piece-99',
        cacheKey: 'gather-99',
        message: { transformed: true },
        awaitResponse: true,
      }),
    });

    const tileResponse = manager.processTile('tile-3', { foo: 'bar' }, { cacheKey: 'tile-3', awaitResponse: true, timeout: 1000 });
    const requestId = [...manager._pendingTileRequests.keys()][0];
    manager.tilePool.listeners.message[0]({ data: { requestId } });

    await expect(tileResponse).resolves.toEqual({ requestId });
    expect(manager.gatherPool.prepared[0].message.transformed).toBe(true);
  });
});
