# PowerTileManager

`PowerTileManager` is a small manager built on top of `performance-helpers` helpers to support MapLibre-style on-the-fly tile processing with two paths:

- a **per-tile path** for tile-level preprocessing
- a **gather path** for post-processing / combining results after tile work

This guide shows how to wire the existing `tileWorker.js` and `gatherWorker.js` flows from the `maplibre-properlabels` example into a single manager.

## Example

```javascript
import PowerTileManager from './manager/PowerTileManager.js';
import tileWorkerPath from '../maplibre-properlabels/src/workers/tileWorker.js?worker';
import gatherWorkerPath from '../maplibre-properlabels/src/workers/gatherWorker.js?worker';

const manager = new PowerTileManager({
  tileWorkerSource: tileWorkerPath,
  gatherWorkerSource: gatherWorkerPath,
  tilePoolOptions: {
    size: 4,
    minSize: 2,
    maxSize: 8,
    idleTimeout: 30000,
    taskQueue: true,
    queuePolicy: 'enqueue',
  },
  gatherPoolOptions: {
    size: 2,
    minSize: 1,
    maxSize: 4,
    idleTimeout: 30000,
  },
  tileCacheOptions: {
    maxEntries: 2000,
    defaultTTL: 30_000,
  },
  gatherCacheOptions: {
    maxEntries: 500,
    defaultTTL: 30_000,
  },
  tileToGather: (tileResult) => {
    // Convert a tile worker result into a gather worker input.
    // In the maplibre-properlabels example, each processed tile output
    // can be grouped and reduced by the gather worker.
    if (!tileResult || !tileResult.unique || !tileResult.type) return null;
    return {
      pieceKey: `${tileResult.unique}:${tileResult.type}`,
      message: {
        type: 'gather-piece',
        pieces: tileResult,
      },
      transfer: tileResult.transfer,
      awaitResponse: true,
      cacheKey: `${tileResult.unique}:gather`,
    };
  },
});

manager.on('tile:result', ({ result, requestId, cacheKey }) => {
  console.log('Tile result', requestId, cacheKey, result);
});

manager.on('gather:result', ({ result, requestId, cacheKey }) => {
  console.log('Gather result', requestId, cacheKey, result);
});

manager.on('error', ({ path, error }) => {
  console.error(`PowerTileManager ${path} error`, error);
});

manager.on('idle', ({ path }) => {
  console.log(`Pool idle: ${path}`);
});

async function processTileFrame(tileKey, payload, transfer) {
  const result = await manager.processTile(tileKey, payload, {
    transfer,
    cacheKey: `tile:${tileKey}`,
    awaitResponse: true,
    timeout: 20000,
    gather: true,
  });

  // result is the decoded tile worker output
  return result;
}

async function shutdown() {
  await manager.drain();
  manager.shutdown();
}
```

## Notes

- `processTile()` handles per-tile requests and caches results using `PowerCache`.
- `tileToGather` is a mapper that converts tile worker outputs into gather worker inputs.
- `PowerBatch` is used internally to coalesce tile and gather submissions before dispatching them into the pools.
- `drain()` waits for both tile and gather pools to become idle, then `shutdown()` cleans up worker resources.

## When to use

Use `PowerTileManager` when you need a high-throughput tile-processing pipeline with:

- worker-backed tile decoding or geometry simplification
- incremental gather/reduce steps across tile outputs
- cacheable tile/gather results
- backpressure-safe batching and pool management
