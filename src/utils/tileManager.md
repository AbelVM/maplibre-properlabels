# TileManager Guide

`TileManager` is the runtime engine that powers feature collection, worker dispatch, and GeoJSON diff updates for the `maplibre-properlabels` plugin.

It is designed to be used by the plugin entrypoint (`src/index.js`) and is not typically instantiated directly by end users, but this guide documents the constructor, methods, and internal behavior for contributors and advanced integrators.

## Overview

`TileManager`:

- listens for `sourcedata` events from a MapLibre vector tile source
- queries features from the source tile or map
- creates compact payloads for tile workers
- caches piece results and schedules gather worker processing
- collects label diffs from gather results
- flushes add/remove changes into an auxiliary GeoJSON source

It achieves this with two inline worker pools:

- `tilePool` for per-tile geometry simplification and feature grouping
- `gatherPool` for final geometry union/flatten and label preparation

## Constructor

```js
new TileManager({
  map,
  source,
  sourceLayer,
  fid,
  tileSize,
  tolerance,
  cacheSize,
  units,
  tilePoolSize,
  gatherPoolSize,
  tileWorkerSource,
  gatherWorkerSource,
});
```

### Parameters

- `map` (`maplibregl.Map`): The MapLibre map instance.
- `source` (`maplibregl.VectorTileSource`): The source whose tiles will be processed.
- `sourceLayer` (`string`, optional): The vector tile layer to query inside the vector source.
- `fid` (`string`, optional): Feature identifier property name. Defaults to `id`.
- `tileSize` (`number`, optional): Tile pixel size. Defaults to `512` or the source tile size.
- `tolerance` (`number`, optional): Simplification tolerance used when converting tile geometry for worker processing.
- `cacheSize` (`number`, optional): Maximum size for piece and label caches.
- `units` (`string`, optional): Units for area calculations, such as `meters`.
- `tilePoolSize` (`number`, optional): Number of tile worker instances.
- `gatherPoolSize` (`number`, optional): Number of gather worker instances.
- `tileWorkerSource` (`Function`, optional): Worker module factory for tile work.
- `gatherWorkerSource` (`Function`, optional): Worker module factory for gather work.

### Behavior

The constructor initializes:

- caches for processed pieces and labels
- a queue that batches tile work payloads
- worker pools for both tile and gather processing
- event listeners for worker messages and idle conditions
- an event bus to coordinate label and commit workflows

## Important Methods

### `handleSourceData(event)`

Processes a MapLibre `sourcedata` event and, if the tile belongs to the managed source:

- validates tile identity
- queries source features for the current tile
- prepares a labeled payload for the tile worker
- schedules the payload into the tile queue

This is the main entry point for live tile updates.

### `setGeoJsonSource(gjSource)`

Associates the `TileManager` with the auxiliary GeoJSON source that receives label diffs.

Use this after constructing the manager and after the GeoJSON source has been created:

```js
manager.setGeoJsonSource(gjSource);
```

### `dispose()`

Shuts down both worker pools and clears caches.

Use this when the plugin is removed or the map is destroyed to avoid leaking workers and memory.

### `_scheduleTileDrain()`

Internal method that debounces tile queue flushing using `queueMicrotask`.

### `_drainTileQueue()`

Internal method that batches queued tile payloads and sends them to the tile worker pool.

### `_onTileMessage(event)`

Handles incoming payloads from tile workers.

- decodes worker responses
- stores processed pieces in the cache
- schedules gather work when the source is loaded

### `_scheduleGather()`

Debounces gather dispatch after tile processing completes.

### `_dispatchGather()`

Sends cached pieces into the gather worker pool for final geometry merging and label selection.

### `_onGatherMessage(event)`

Handles gather worker results.

- dispatches label update events
- commits the label processing flow when workers signal completion

### `_collectLabelDiff(collection)`

Collects label feature sets from the gather worker.

- compares with cached labels
- prepares `add` and `remove` diff operations
- keeps only changed data before flushing

### `_scheduleDiffFlush()`

Debounces diffs before applying them to the GeoJSON source.

### `_flushDiffs()`

Applies accumulated add/remove feature diffs to the auxiliary source via `gjSource.updateData({ add, remove })`.

### `_normalizeWorkerMessage(message)`

Decodes binary worker payloads into JSON messages; returns pre-parsed objects unchanged.

## Usage Example

In the plugin entrypoint we wire `TileManager` like this:

```js
import TileManager from './utils/tileManager.js';
import TileWorker from '../workers/tileWorker.js?worker&inline';
import GatherWorker from '../workers/gatherWorker.js?worker&inline';

const manager = new TileManager({
  map,
  source,
  sourceLayer: 'my-layer',
  fid: 'id',
  tolerance: 0.00001,
  cacheSize: 5000,
  units: 'meters',
  tileWorkerSource: TileWorker,
  gatherWorkerSource: GatherWorker,
});

manager.setGeoJsonSource(geojsonSource);
```

When the plugin receives `sourcedata`, it forwards it into the manager:

```js
map.on('sourcedata', (event) => manager.handleSourceData(event));
```

## Real-life Example

This pattern is useful when you need to compute label placement or other per-feature processing across vector tiles without blocking the main thread.

A real-life scenario:

1. User pans/zooms the map.
2. `sourcedata` events fire as new tiles are loaded.
3. `TileManager` queries features from each tile and sends trimmed payloads to tile workers.
4. Tile workers simplify and group features.
5. Gather workers merge overlapping polygons, compute a best label location, and emit stable feature diffs.
6. The plugin updates an auxiliary GeoJSON source used for label rendering.

## Notes

- `TileManager` expects a vector tile source and a properly configured auxiliary GeoJSON source.
- The worker sources are passed in as inline worker factories, which keeps the entire plugin bundlable by Vite.
- `dispose()` should be called when the map or plugin is destroyed.

## Contribution Tips

- If you change worker payload structure, update both `tileWorker.js` and `gatherWorker.js` accordingly.
- Keep the `tilePool` and `gatherPool` event flows synchronized: tile messages lead to gather scheduling, gather messages lead to diff flushing.
- Prefer small payloads and feature grouping to reduce worker cloning overhead.
