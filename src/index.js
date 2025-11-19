import { pointOnFeature } from "@turf/point-on-feature";
/*
    Options:
    - layer_name: name of the layer to be labeled (vector, tiled)
    - label_style: style for the label
    - label_id: unique property per feature (optional, default feature ID)
*/
function initlabels(o) {
    const
        map = this,
        default_style = {
            "id": `${o.layer_name}_labels`,
            "type": "symbol",
            "paint": {
                "text-color": "rgba(8, 37, 77, 1)",
                "text-halo-blur": {
                    "stops": [
                        [
                            2,
                            0.2
                        ],
                        [
                            6,
                            0
                        ]
                    ]
                },
                "text-halo-color": "rgba(255, 255, 255, 1)",
                "text-halo-width": {
                    "stops": [
                        [
                            2,
                            1
                        ],
                        [
                            6,
                            1.6
                        ]
                    ]
                }
            },
            "filter": [
                "all"
            ],
            "layout": {
                "text-font": [
                    "Open Sans Semibold"
                ],
                "text-size": {
                    "stops": [
                        [
                            2,
                            10
                        ],
                        [
                            4,
                            12
                        ],
                        [
                            6,
                            16
                        ]
                    ]
                },
                "text-field": '{text}',
                "visibility": "visible",
                "text-max-width": 10,
                "text-transform": {
                    "stops": [
                        [
                            0,
                            "uppercase"
                        ],
                        [
                            2,
                            "none"
                        ]
                    ]
                }
            },
            "source": `${o.layer_name}_labels_source`,
            "maxzoom": 24,
            "minzoom": 2
        },
        style = Object.assign(default_style, o.label_style),
        anchors = {
            "type": "FeatureCollection", "features": []
        },
        refresh = () => {
            const
                features_raw = map.queryRenderedFeatures({ layers: [o.layer_name] }),
                features_grouped = Object.groupBy(
                    features_raw,
                    f => (!!o.label_id) ? f.properties[o.label_id] : f.id
                );
            anchors.features.length = 0;
            for (const [id, parts] of Object.entries(features_grouped)) {
                const
                    feature_collection = {
                        "type": "FeatureCollection",
                        "features": parts.map(f => {
                            return {
                                "type": "Feature",
                                "properties": f.properties,
                                "geometry": f.geometry
                            }
                        })
                    },
                    point = pointOnFeature(feature_collection);
                point.properties = parts[0].properties;
                anchors.features.push(point);
            }
            map.getSource(`${o.layer_name}_labels_source`).setData(anchors);
        };

    map.addSource(`${o.layer_name}_labels_source`, {
        'type': 'geojson',
        'data': anchors
    });
    map.addLayer(style);
    map.on('move', refresh);
    refresh();

};

maplibregl.Map.prototype.addProperLabels = initlabels;