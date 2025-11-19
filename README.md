# maplibre-proper-labels

Tiny `Maplibre GL JS` plugin for proper labelling of geometries bigger than the layer tile size.

<img width="1378" height="1027" alt="image" src="https://github.com/user-attachments/assets/7fa03b8f-af3a-4664-9889-a6dfd7dd98e2" />
(red labels are the "proper" ones 😅)

## Live example at

https://abelvm.github.io/maplibre-properlabels/example/

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

The available parameters are

| name | type |  description | optional | default |
|---|---|---|---|---|
| layer_name | string | Name of the vector layer to be labeled |   |   |
| label_style | json  | Maplibre Style for the labels |   |   |
| label_id | string | Unique property per feature | x | feature ID |

You can enable the `proper labels` by initializing them once the map is loaded

```javascript
map.on('load', () => {
    map.addProperLabels({
        'layer_name': 'countries-fill',
        'label_style': label_style
    });
});
```
