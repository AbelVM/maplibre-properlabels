# maplibre-proper-labels

Tiny `Maplibre GL JS` plugin for proper labelling of geometries bigger than the layer tile size.

<img width="1378" height="1027" alt="image" src="https://github.com/user-attachments/assets/7fa03b8f-af3a-4664-9889-a6dfd7dd98e2" />
(red labels are the "proper" ones 😅)

## Live example at

https://abelvm.github.io/maplibre-properlabels/example/

* **Black labels:** raw labelling the `fill` layer
* **Red labels:** the proper ones!

## Why

Any tiled-sourced vector layer in MapLibre lacks proper labelling, as

* Every geometry that extends through several tiles has several labels
* Even the tiniest Polygon gets a label, regardless of whether it is a feature itself or part of a multigeometry

So, this plugin tries to fix those issues while providing dynamic placement, so every feature within the viewport always has a label in sight.

This is inspired by https://github.com/maplibre/maplibre-tile-spec/issues/710 and my stubbornness

## How to use

### Build

Just grab the files in the `dist` folder, or run `npm run build` to regenerate those files

### Install

Use it as a module in your HTML

`<script type='module' src='../dist/maplibre-properlabels.js'></script>`

or with an import elsewhere

### Use

Initialize the plugin once the map is ready. The constructor accepts an options object:

| name | type | description | optional | default |
|---|---|---|---|---|
| map | Maplibre Map instance | The map instance | required | — |
| source | string | Vector tile source id, or a VectorTileSource object | required | — |
| sourceLayer | string | The inner layer name inside the vector tiles to label | required | — |
| fid | string | Property name to promote as feature id (promoteId) | optional | `id` |
| tolerance | number | Simplify / polylabel precision (degrees) | optional | `0.00001` |
| cacheSize | number | Worker-side cache capacity (entries) | optional | `10000` |
| postDelay | number | Debounce delay (ms) before posting features to worker | optional | `100` |

Example (see `example/index.html`):

```javascript
map.on('load', () => {
    const proper = new ProperLabels({
        map,
        source: 'demotiles',       // can also be a VectorTileSource object
        sourceLayer: 'countries',
        fid: 'fid',                // optional, property used as promoted id
        tolerance: 0.00001,
        cacheSize: 10000
    });

    // The plugin creates a GeoJSON source named `${sourceId}-proper`.
    // Use it when adding a label layer:
    map.addLayer({
        id: 'countries-labels-proper',
        type: 'symbol',
        source: 'demotiles-proper',
        layout: {
            'text-field': ['coalesce', ['get', 'name'], ['get', 'name_en'], ['get', 'NAME'], ''],
            'text-size': 12
        },
        paint: { 'text-color': '#ff0000' }
    });
});
```

## How does it work

1. On map movements the plugin queries the vector-tile source for all features in the viewport using `map.querySourceFeatures(sourceId, { sourceLayer })`.
2. Features are grouped by the promoted id (`fid`) so every logical feature (which may be split across tiles) is processed as a single group.
3. The main thread encodes the groups into a compact binary transferable (Float32 coordinate buffer + key-indexed properties buffer) and posts it to a worker. An `ArrayBufferPool` is used to reduce allocations.
4. The worker decodes the binary payload, runs geometry processing (simplify, union/flatten/combine for multi-part groups, and a safe `polylabel` fallback), and computes a short raw-group signature and geometry hashes to detect unchanged items.
5. The worker keeps a cache of processed features and emits incremental diffs (adds/updates/removes). Add/update feature lists are encoded as binary transferables and property diffs are compacted into a shared keys table + props buffer to minimize structured-clone cost.
6. The main thread decodes the binary diffs, reconstructs a canonical `GeoJSONSourceDiff` and applies it with `source.updateData(diff)`. A short handshake (`diff_ack`) lets the worker commit pending changes to its cache only after the main thread successfully applied the diff.

This design keeps the main thread lightweight by transferring buffers, applying incremental diffs, and avoiding expensive geometry work on the UI thread.
## Example legend

The live example includes a legend to help visual debugging:

- Blue polygons: not clipped (normal features)
- Green polygons: clipped (features that touch tile edges)
- Black labels: MapLibre native labels (from the vector tiles)
- Red labels: "proper" labels produced by this plugin (de-duplicated and placed)
- Red lines: tile boundaries (when `map.showTileBoundaries = true`)

## Local development

To run the example locally:

1. Install dependencies

```bash
npm install
```

2. Start the dev server (Vite serves the example at `/example`)

```bash
npm run dev
# open http://localhost:5173/example/
```

Or build the package and open `example/index.html` after `npm run build`.

## Performance & implementation notes

- The plugin offloads heavy geometry processing to a worker and uses compact binary transferables (Float32 coords + key-indexed properties) to minimize main-thread cost.
- Diffs between runs are encoded as binary transfer messages so `updateData` can be applied with minimal structured-clone overhead.
- Geometry hashing uses a lightweight Float32-based hash with a small deep-equality fallback to avoid unnecessary recomputation.
- For debugging, enable tile boundaries with `map.showTileBoundaries = true` and use the example legend to correlate labels and clipped geometry.

