import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TileManager from '../src/utils/tileManager.js';

class FakeWorker {
  constructor() {
    this.listeners = { message: [], error: [], messageerror: [], idle: [] };
    this.onmessage = null;
    this.onerror = null;
    this.onmessageerror = null;
    this.terminate = vi.fn();
    this.postMessage = vi.fn((message, transfer) => {
      // Worker processing is driven by the test, not automatically.
    });
  }

  addEventListener(type, callback) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((cb) => cb !== callback);
  }

  dispatchMessage(data) {
    const event = { data };
    if (typeof this.onmessage === 'function') {
      this.onmessage(event);
    }
    (this.listeners.message || []).forEach((cb) => cb(event));
  }
}

const polygonFeature = {
  id: 'feature-1',
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
  },
  properties: { id: 'feature-1' },
};

const makeSources = ({ postDelay = 0, gatherTimeout = 60000, tileTimeout = null, tileMaxRetries = 1 } = {}) => {
  const tileWorkerSource = FakeWorker;
  const gatherWorkerSource = FakeWorker;
  const manager = new TileManager({
    map: {},
    source: { id: 'test-source', type: 'vector', tileSize: 512, maxzoom: 14 },
    sourceLayer: 'layer-1',
    fid: 'id',
    tileSize: 512,
    tolerance: 0.00001,
    cacheSize: 10,
    units: 'meters',
    postDelay,
    gatherTimeout,
    tileTimeout,
    tileMaxRetries,
    tilePoolSize: 1,
    gatherPoolSize: 1,
    tileWorkerSource,
    gatherWorkerSource,
  });
  return manager;
};

const makeSourceDataEvent = () => ({
  sourceId: 'test-source',
  isSourceLoaded: true,
  tile: {
    tileID: { canonical: { z: 0, x: 0, y: 0 } },
    querySourceFeatures: vi.fn((features, opts) => {
      features.push(polygonFeature);
      return undefined;
    }),
  },
});

describe('TileManager worker flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts debuglevel alias when constructing the manager', () => {
    const manager = new TileManager({
      map: {},
      source: { id: 'test-source', type: 'vector', tileSize: 512, maxzoom: 14 },
      sourceLayer: 'layer-1',
      fid: 'id',
      tileSize: 512,
      tolerance: 0.00001,
      cacheSize: 10,
      units: 'meters',
      postDelay: 0,
      debuglevel: 2,
      tilePoolSize: 1,
      gatherPoolSize: 1,
      tileWorkerSource: FakeWorker,
      gatherWorkerSource: FakeWorker,
    });

    expect(manager.debugLevel).toBe(2);
  });

  it('enqueues tile work and posts a batch to the tile pool', async () => {
    const manager = makeSources();
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = makeSourceDataEvent();

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(Array.isArray(event.tile.querySourceFeatures.mock.calls[0][0])).toBe(true);
    expect(event.tile.querySourceFeatures.mock.calls[0][1]).toEqual({ sourceLayer: 'layer-1' });
    expect(spy).toHaveBeenCalledTimes(1);
    const batch = spy.mock.calls[0][0];
    expect(Array.isArray(batch)).toBe(true);
    expect(batch[0].message).toEqual(expect.objectContaining({ unique: '0|0|0' }));
    expect(spy.mock.calls[0][1]).toEqual(expect.objectContaining({ zeroCopy: true }));
  });

  it('ignores tiles when querySourceFeatures is unavailable', async () => {
    const manager = makeSources();
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = {
      sourceId: 'test-source',
      isSourceLoaded: true,
      tile: {
        tileID: { canonical: { z: 0, x: 0, y: 0 } },
      },
    };

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(spy).not.toHaveBeenCalled();
  });

  it('stores simplified tile output and dispatches gather payload after tile reply', async () => {
    const manager = makeSources();
    manager._sourceLoaded = true;
    const gatherSpy = vi.spyOn(manager.gatherPool, 'postMessage');

    manager._onTileMessage({ data: { type: 'simplified', unique: '0|0|0', size: 10 } });
    await Promise.resolve();

    expect(manager.piecesCache.has('0|0|0')).toBe(true);
    expect(gatherSpy).toHaveBeenCalledTimes(1);
    expect(gatherSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({ pieces: expect.any(Object), tolerance: manager.tolerance })
    );
  });

  it('collects label diffs from gather results and flushes them to the GeoJSON source', async () => {
    const manager = makeSources();
    const updateData = vi.fn();
    manager.setGeoJsonSource({ updateData });

    manager._onGatherMessage({ data: { id: 'group-1', features: [{ properties: { _index: '0|0|0|0' } }] } });
    manager._onGatherMessage({ data: { type: 'commit' } });
    await Promise.resolve();

    expect(updateData).toHaveBeenCalledTimes(1);
    expect(updateData.mock.calls[0][0]).toEqual(
      expect.objectContaining({ add: expect.any(Array), remove: [] })
    );
    expect(updateData.mock.calls[0][0].add[0].properties._index).toBe('0|0|0|0');
  });

  it('sorts label diff features by _index before comparing with cache', () => {
    const manager = makeSources();
    const existing = [
      { properties: { _index: '0|0|0|0' } },
      { properties: { _index: '0|0|0|1' } },
    ];
    manager.labelsCache.set('group-1', existing);
    manager._collectLabelDiff({ id: 'group-1', features: [existing[1], existing[0]] });

    expect(manager.labelsCache.hasEqual('group-1', existing)).toBe(true);
  });

  it('dispatches gather work with PowerPool zeroCopy only', () => {
    const manager = makeSources();
    manager.piecesCache.set('0|0|0', { size: 10 });
    const spy = vi.spyOn(manager.gatherPool, 'postMessage').mockReturnValue(true);

    manager._dispatchGather();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][2]).toEqual(
      expect.objectContaining({ zeroCopy: true })
    );
    expect(spy.mock.calls[0][2]).not.toHaveProperty('awaitResponse');
    expect(spy.mock.calls[0][0]).toEqual(
      expect.objectContaining({ gatherPoolSize: 1 })
    );
  });

  it('uses map.querySourceFeatures when tile.querySourceFeatures is unavailable', async () => {
    const manager = makeSources();
    manager.map = {
      querySourceFeatures: vi.fn(() => [polygonFeature]),
    };
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = {
      sourceId: 'test-source',
      isSourceLoaded: true,
      tile: {
        tileID: { canonical: { z: 0, x: 0, y: 0 } },
      },
    };

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(manager.map.querySourceFeatures).toHaveBeenCalledWith('test-source', {
      sourceLayer: 'layer-1',
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('throttles map.querySourceFeatures fallback to reduce sourcedata churn', async () => {
    vi.useFakeTimers();
    const manager = makeSources();
    manager.map = {
      querySourceFeatures: vi.fn(() => [polygonFeature]),
    };
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = {
      sourceId: 'test-source',
      isSourceLoaded: true,
      tile: {
        tileID: { canonical: { z: 0, x: 0, y: 0 } },
      },
    };

    manager.handleSourceData(event);
    await Promise.resolve();
    expect(manager.map.querySourceFeatures).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);

    manager.handleSourceData(event);
    await Promise.resolve();
    expect(manager.map.querySourceFeatures).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(manager.mapFallbackCooldown + 1);
    manager.handleSourceData(event);
    await Promise.resolve();
    expect(manager.map.querySourceFeatures).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('delays source tile drainage when postDelay is configured', async () => {
    const manager = makeSources({ postDelay: 20 });
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = makeSourceDataEvent();

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(spy).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('accepts tile.querySourceFeatures implementations that mutate the passed array', async () => {
    const manager = makeSources();
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = makeSourceDataEvent();
    event.tile.querySourceFeatures = vi.fn((features, opts) => {
      features.push(polygonFeature);
      return undefined;
    });

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(event.tile.querySourceFeatures).toHaveBeenCalledTimes(1);
    expect(event.tile.querySourceFeatures.mock.calls[0][1]).toEqual({ sourceLayer: 'layer-1' });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns early when handleSourceData receives a tile without canonical metadata', () => {
    const manager = makeSources();
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = {
      sourceId: 'test-source',
      isSourceLoaded: true,
      tile: {
        tileID: {},
        querySourceFeatures: vi.fn(() => [polygonFeature]),
      },
    };

    manager.handleSourceData(event);
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns early when a duplicate tile is already cached or pending', async () => {
    const manager = makeSources();
    const event = makeSourceDataEvent();
    const fingerprint = manager._computeTileFingerprint([polygonFeature]);
    manager.piecesCache.set('0|0|0', { size: 1 });
    manager._tileFingerprints.set('0|0|0', fingerprint);
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(spy).not.toHaveBeenCalled();
  });

  it('reprocesses a cached tile when source features change', async () => {
    const manager = makeSources();
    manager.piecesCache.set('0|0|0', { size: 1 });
    manager._tileFingerprints.set('0|0|0', 'old-fingerprint');
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = makeSourceDataEvent();
    event.tile.querySourceFeatures = vi.fn((features, opts) => {
      features.push({
        id: 'feature-2',
        type: 'Feature',
        geometry: polygonFeature.geometry,
        properties: { id: 'feature-2' },
      });
      return undefined;
    });

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('dispatches only the tiles relevant to changed groups', () => {
    const manager = makeSources();
    manager._sourceLoaded = true;
    manager.piecesCache.set('0|0|1', {
      'feature-2': { type: 'FeatureCollection', features: [] },
      size: 1,
    });
    manager._tileGroups.set('0|0|1', new Set(['feature-2']));
    manager._groupToTiles.set('feature-2', new Set(['0|0|1']));
    manager._changedGroups.clear();

    manager._onTileMessage({
      data: {
        type: 'simplified',
        unique: '0|0|0',
        'feature-1': { type: 'FeatureCollection', features: [] },
        size: 1,
      },
    });

    const spy = vi.spyOn(manager.gatherPool, 'postMessage');
    manager._dispatchGather();

    expect(spy).toHaveBeenCalledTimes(1);
    const pieces = spy.mock.calls[0][0].pieces;
    expect(Object.keys(pieces)).toEqual(['0|0|0']);
  });

  it('produces stable fingerprints for identical features and changes when props differ', () => {
    const manager = makeSources();
    const features = [
      { id: 'a', type: 'Feature', geometry: polygonFeature.geometry, properties: { foo: 'bar' } },
    ];
    const fingerprint1 = manager._computeTileFingerprint(features);
    const fingerprint2 = manager._computeTileFingerprint(features.map((f) => ({ ...f })));
    expect(fingerprint1).toBe(fingerprint2);

    const changed = manager._computeTileFingerprint([
      { id: 'a', type: 'Feature', geometry: polygonFeature.geometry, properties: { foo: 'baz' } },
    ]);
    expect(changed).not.toBe(fingerprint1);
  });

  it('memoizes fingerprint computation for repeated feature payloads', () => {
    const manager = makeSources();
    const spy = vi.spyOn(manager, '_computeTileFingerprintBody');
    const features = [polygonFeature];

    const fingerprint1 = manager._computeTileFingerprint(features);
    const fingerprint2 = manager._computeTileFingerprint(features);

    expect(fingerprint1).toBe(fingerprint2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('reprocesses a cached tile when the fingerprint is missing', async () => {
    const manager = makeSources();
    manager.piecesCache.set('0|0|0', { size: 1 });
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = makeSourceDataEvent();

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(manager.piecesCache.has('0|0|0')).toBe(false);
  });

  it('returns early when querySourceFeatures returns a non-array result', async () => {
    const manager = makeSources();
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = {
      sourceId: 'test-source',
      isSourceLoaded: true,
      tile: {
        tileID: { canonical: { z: 0, x: 0, y: 0 } },
        querySourceFeatures: vi.fn(() => ({ features: [] })),
      },
    };

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(spy).not.toHaveBeenCalled();
    expect(event.tile.querySourceFeatures).toHaveBeenCalled();
  });

  it('creates payload entries when feature properties are missing and id is used instead', async () => {
    const manager = makeSources();
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = {
      sourceId: 'test-source',
      isSourceLoaded: true,
      tile: {
        tileID: { canonical: { z: 0, x: 0, y: 0 } },
        querySourceFeatures: vi.fn((features, opts) => {
          features.push({ id: 'no-properties', type: 'Feature', geometry: polygonFeature.geometry });
          return undefined;
        }),
      },
    };

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0][0].message.collection.features[0].id).toBe('no-properties');
  });

  it('schedules gather when tilePool becomes idle with pending changed groups', () => {
    const manager = makeSources();
    manager._sourceLoaded = true;
    manager._changedGroups.add('feature-1');
    const gatherSpy = vi.spyOn(manager, '_scheduleGather');

    manager.tilePool._bus.emit('idle', { data: { type: 'pool:idle' } });

    expect(gatherSpy).toHaveBeenCalledTimes(1);
  });

  it('does not schedule gather when tilePool becomes idle without changed groups', () => {
    const manager = makeSources();
    manager._sourceLoaded = true;
    const gatherSpy = vi.spyOn(manager, '_scheduleGather');

    manager.tilePool._bus.emit('idle', { data: { type: 'pool:idle' } });

    expect(gatherSpy).not.toHaveBeenCalled();
  });

  it('does not schedule gather when tilePool becomes idle and source is not loaded', () => {
    const manager = makeSources();
    manager._sourceLoaded = false;
    const gatherSpy = vi.spyOn(manager, '_scheduleGather');

    manager.tilePool._bus.emit('idle', { data: { type: 'pool:idle' } });

    expect(gatherSpy).not.toHaveBeenCalled();
  });

  it('tracks source loaded transitions and resets _sourceLoaded to false', () => {
    const manager = makeSources();
    const gatherSpy = vi.spyOn(manager, '_scheduleGather');

    manager._sourceLoaded = true;
    manager.handleSourceData({ sourceId: 'test-source', isSourceLoaded: false, tile: null });
    expect(manager._sourceLoaded).toBe(false);

    manager._changedGroups.add('feature-1');
    manager.handleSourceData({ sourceId: 'test-source', isSourceLoaded: true, tile: null });
    expect(manager._sourceLoaded).toBe(true);
    expect(gatherSpy).toHaveBeenCalledTimes(1);
  });

  it('does not schedule gather on load transition when no changed groups exist', () => {
    const manager = makeSources();
    const gatherSpy = vi.spyOn(manager, '_scheduleGather');

    manager._sourceLoaded = false;
    manager.handleSourceData({ sourceId: 'test-source', isSourceLoaded: true, tile: null });

    expect(manager._sourceLoaded).toBe(true);
    expect(gatherSpy).not.toHaveBeenCalled();
  });

  it('uses cache weight function false branches for piecesCache and labelsCache', () => {
    const manager = makeSources();

    manager.piecesCache.set('zero', { size: 0 });
    manager.labelsCache.set('empty', {});

    expect(manager.piecesCache.has('zero')).toBe(true);
    expect(manager.labelsCache.get('empty')).toEqual({});
  });

  it('returns early when handleSourceData receives an invalid source event', () => {
    const manager = makeSources();
    const spy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = {
      sourceId: 'wrong-source',
      isSourceLoaded: true,
      tile: {
        tileID: { canonical: { z: 0, x: 0, y: 0 } },
        querySourceFeatures: vi.fn(() => [polygonFeature]),
      },
    };

    manager.handleSourceData(event);
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not reschedule tile drain if already scheduled', () => {
    const manager = makeSources();
    manager._tileDrainScheduled = true;
    manager._scheduleTileDrain();

    expect(manager._tileDrainScheduled).toBe(true);
  });

  it('ignores tile messages that are not simplified', () => {
    const manager = makeSources();
    manager._pendingTiles.add('0|0|0');
    manager._onTileMessage({ data: { type: 'other', unique: '0|0|0' } });

    expect(manager._pendingTiles.has('0|0|0')).toBe(true);
    expect(manager.piecesCache.has('0|0|0')).toBe(false);
  });

  it('does not reschedule gather if already scheduled', () => {
    const manager = makeSources();
    manager._gatherScheduled = true;
    manager._scheduleGather();

    expect(manager._gatherScheduled).toBe(true);
  });

  it('ignores gather messages with no incoming payload', () => {
    const manager = makeSources();
    const busSpy = vi.spyOn(manager._bus, 'emit');

    manager._onGatherMessage({ data: null });
    expect(busSpy).not.toHaveBeenCalled();
  });

  it('handles label diff collections with invalid feature arrays', () => {
    const manager = makeSources();
    manager._collectLabelDiff({ id: 'group-bad', features: 'not-array' });
    expect(manager.labelsCache.get('group-bad')).toEqual([]);
  });

  it('does not add remove diffs for label features without _index', () => {
    const manager = makeSources();
    manager.labelsCache.set('group-2', [{ properties: {} }]);

    manager._collectLabelDiff({ id: 'group-2', features: [{ properties: {} }] });
    expect(manager._diffRemove.size).toBe(0);
  });

  it('does not flush diffs when gjSource is missing', () => {
    const manager = makeSources();
    manager._diffAdd.set('key', { properties: { _index: 'key' } });

    manager._flushDiffs();
    expect(manager._diffAdd.size).toBe(1);
  });

  it('does not schedule a diff flush when there are no pending diffs', () => {
    const manager = makeSources();
    const runSpy = vi.spyOn(manager, '_runDiffFlush');

    manager._scheduleDiffFlush();

    expect(manager._diffScheduled).toBe(false);
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('clears caches, cancels scheduled work, and shuts down pools when dispose is called', () => {
    const manager = makeSources();
    const shutdownTile = vi.spyOn(manager.tilePool, 'shutdown');
    const shutdownGather = vi.spyOn(manager.gatherPool, 'shutdown');
    const cancelScheduler = vi.spyOn(manager._tileScheduler, 'cancel');

    manager._tileDrainScheduled = true;
    manager._gatherScheduled = true;
    manager._diffScheduled = true;
    manager._pendingTiles.add('0|0|0');

    manager.dispose();

    expect(cancelScheduler).toHaveBeenCalled();
    expect(shutdownTile).toHaveBeenCalled();
    expect(shutdownGather).toHaveBeenCalled();
    expect(manager.piecesCache.size).toBe(0);
    expect(manager.labelsCache.size).toBe(0);
    expect(manager._tileDrainScheduled).toBe(false);
    expect(manager._gatherScheduled).toBe(false);
    expect(manager._diffScheduled).toBe(false);
    expect(manager._pendingTiles.size).toBe(0);
    expect(manager.gjSource).toBeNull();
  });

  it('retries and eventually drops timed-out pending tiles', async () => {
    vi.useFakeTimers();
    const manager = makeSources({ gatherTimeout: 20, tileTimeout: 20, tileMaxRetries: 1 });
    const postSpy = vi.spyOn(manager.tilePool, 'postMessageBatch');
    const event = makeSourceDataEvent();

    manager.handleSourceData(event);
    await Promise.resolve();

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(manager._pendingTiles.has('0|0|0')).toBe(true);

    vi.advanceTimersByTime(25);
    await Promise.resolve();
    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(manager._pendingTiles.has('0|0|0')).toBe(true);

    vi.advanceTimersByTime(25);
    await Promise.resolve();
    expect(manager._pendingTiles.has('0|0|0')).toBe(false);
    expect(manager._tilePendingMeta.has('0|0|0')).toBe(false);
  });

  it('preserves pending diffs when updateData rejects and clears them after a later success', async () => {
    const manager = makeSources();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const updateData = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce(undefined);
    manager.setGeoJsonSource({ updateData });

    manager._diffAdd.set('0|0|0|0', { properties: { _index: '0|0|0|0' } });

    const first = await manager._flushDiffs();
    expect(first).toBe(false);
    expect(manager._diffAdd.has('0|0|0|0')).toBe(true);

    const second = await manager._flushDiffs();
    expect(second).toBe(true);
    expect(manager._diffAdd.has('0|0|0|0')).toBe(false);
    expect(updateData).toHaveBeenCalledTimes(2);
  });

  it('suppresses child add entries when union parent includes _members', async () => {
    const manager = makeSources();
    const updateData = vi.fn().mockResolvedValue(undefined);
    manager.setGeoJsonSource({ updateData });

    manager._diffAdd.set('child-1', { properties: { _index: 'child-1' } });
    manager._diffAdd.set('child-2', { properties: { _index: 'child-2' } });
    manager._diffAdd.set('parent', {
      properties: {
        _index: 'parent',
        _members: ['child-1', 'child-2'],
      },
    });

    const flushed = await manager._flushDiffs();
    expect(flushed).toBe(true);

    const addIndexes = updateData.mock.calls[0][0].add.map((f) => f.properties._index).sort();
    expect(addIndexes).toEqual(['parent']);
    expect(manager._diffAdd.size).toBe(0);
  });

  it('bypasses legacy containment filtering for simple indexes', async () => {
    const manager = makeSources();
    const updateData = vi.fn().mockResolvedValue(undefined);
    manager.setGeoJsonSource({ updateData });
    const containmentSpy = vi.spyOn(manager, '_keepNonContained');
    const callsBefore = updateData.mock.calls.length;

    manager._diffAdd.set('alpha', { properties: { _index: 'alpha' } });
    manager._diffAdd.set('beta', { properties: { _index: 'beta' } });

    const flushed = await manager._flushDiffs();
    expect(flushed).toBe(true);
    expect(containmentSpy).not.toHaveBeenCalled();
    expect(updateData.mock.calls.length).toBeGreaterThan(callsBefore);

    const lastCall = updateData.mock.calls[updateData.mock.calls.length - 1][0];
    const addIndexes = lastCall.add.map((f) => f.properties._index).sort();
    expect(addIndexes).toEqual(['alpha', 'beta']);
  });

  it('coalesces remove entries replaced by add entries in the same flush', async () => {
    const manager = makeSources();
    const updateData = vi.fn().mockResolvedValue(undefined);
    manager.setGeoJsonSource({ updateData });

    manager._diffAdd.set('same', { properties: { _index: 'same' } });
    manager._diffAdd.set('keep', { properties: { _index: 'keep' } });
    manager._diffRemove.add('same');
    manager._diffRemove.add('drop-only');

    const flushed = await manager._flushDiffs();
    expect(flushed).toBe(true);
    expect(updateData.mock.calls.length).toBeGreaterThan(0);

    const lastCall = updateData.mock.calls[updateData.mock.calls.length - 1][0];
    expect(lastCall.remove).toEqual(['drop-only']);
    expect(manager._diffRemove.size).toBe(0);
    expect(manager._diffAdd.size).toBe(0);
  });

  it('retains multiple label candidates for a group before diff filtering', async () => {
    const manager = makeSources();
    const updateData = vi.fn().mockResolvedValue(undefined);
    manager.setGeoJsonSource({ updateData });

    manager._collectLabelDiff({
      id: 'country-1',
      features: [
        { properties: { _index: 'a', _groupId: 'country-1', _area: 10 } },
        { properties: { _index: 'a-b-c', _groupId: 'country-1', _area: 12, _members: ['a', 'b', 'c'] } },
        { properties: { _index: 'd', _groupId: 'country-1', _area: 100 } },
      ],
    });

    const flushed = await manager._flushDiffs();
    expect(flushed).toBe(true);
    expect(updateData.mock.calls.length).toBeGreaterThan(0);

    const lastCall = updateData.mock.calls[updateData.mock.calls.length - 1][0];
    const addIndexes = lastCall.add.map((feature) => feature.properties._index).sort();
    expect(addIndexes).toEqual(['a-b-c', 'd']);
    expect(manager.labelsCache.get('country-1')).toHaveLength(3);
  });

  it('keeps remove diffs queued while updateData is in-flight', async () => {
    const manager = makeSources();
    const updateData = vi.fn().mockImplementation(async (payload) => {
      expect(payload.remove).toEqual(['old-remove']);
      manager._diffRemove.add('new-remove');
    });
    manager.setGeoJsonSource({ updateData });

    manager._diffRemove.add('old-remove');
    await manager._flushDiffs();

    expect(manager._diffRemove.has('old-remove')).toBe(false);
    expect(manager._diffRemove.has('new-remove')).toBe(true);
  });

  it('keeps newer add diffs queued while updateData is in-flight', async () => {
    const manager = makeSources();
    const oldFeature = { properties: { _index: 'same' } };
    const newFeature = { properties: { _index: 'same' } };
    const updateData = vi.fn().mockImplementation(async (payload) => {
      expect(payload.add).toEqual([oldFeature]);
      manager._diffAdd.set('same', newFeature);
    });
    manager.setGeoJsonSource({ updateData });

    manager._diffAdd.set('same', oldFeature);
    await manager._flushDiffs();
    await manager._flushDiffs();

    const flushedNewFeature = updateData.mock.calls.some(([payload]) =>
      Array.isArray(payload?.add) && payload.add.some((feature) => feature === newFeature)
    );
    expect(flushedNewFeature).toBe(true);
  });
});
