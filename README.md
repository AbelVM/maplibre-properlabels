# maplibre-proper-labels

Tiny `Maplibre GL JS` plugin for proper labelling of geometries bigger than the layer tile size.

## Why

Any tiled sourced layer in maplibre lacks of proper labelling, as

* every geometry present in several tiles has several labels
* even the tiniest Polygon get a label, regardless is a feature itself or part of a multigeometry

So, this plugin tries to fix those issues, while providing dynamic placing, so every feature within the viewport always have a label on sight.

This is inspired by https://github.com/maplibre/maplibre-tile-spec/issues/710 and my stubbornness

## How to use

### Build

Just grab the files in the `dist` folder, or run `npm run build` to regenerate those files

### Install

Use it as a module in your HTML

`<script type='module' src='../dist/maplibre-properlabels.js'></script>`

or with an import elsewhere

### Use

The available parameters are

| name | type |  description | optional | default |
|---|---|---|---|---|
| layer_name | string | Name of the vector layer to be labeled |   |   |
| label_style | json  | Maplibre Style for the labels |   |   |
| label_id | string | Unique property per feature | x | feature ID |

You can enable the `proper labels` by init them once the map is loaded

```javascript
map.on('load', () => {
    map.addProperLabels({
        'layer_name': 'countries-fill',
        'label_style': label_style
    });
});
```