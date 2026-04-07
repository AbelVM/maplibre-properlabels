import TileManager from './utils/tileManager.js';
import TileWorker from './workers/tileWorker.js?worker&inline';
import GatherWorker from './workers/gatherWorker.js?worker&inline';

export default class ProperLabels {
  constructor(options) {
    this.map = options.map;
    this.source =
      options.source instanceof maplibregl.VectorTileSource
        ? options.source
        : this.map.getSource(options.source);

    this.sourceLayer = options.sourceLayer;
    this.fid = options.fid || 'id';
    this.tileSize = this.source.tileSize || 512;
    this.tolerance = options.tolerance || 0.00001;
    this.cacheSize = options.cacheSize || 5000;
    this.units = options.units || 'meters';

    this.map.addSource(this.source.id + '-proper', {
      type: 'geojson',
      maxzoom: this.source.maxzoom,
      promoteId: '_index',
      data: {},
    });
    this.gjSource = this.map.getSource(this.source.id + '-proper');

    this.manager = new TileManager({
      map: this.map,
      source: this.source,
      sourceLayer: this.sourceLayer,
      fid: this.fid,
      tileSize: this.tileSize,
      tolerance: this.tolerance,
      cacheSize: this.cacheSize,
      units: this.units,
      tileWorkerSource: TileWorker,
      gatherWorkerSource: GatherWorker,
    });
    this.manager.setGeoJsonSource(this.gjSource);

    this.map.on('sourcedata', (event) => this.manager.handleSourceData(event));

    this.map.refreshTiles(this.source.id);
    return this.gjSource;
  }
}

maplibregl.VectorTileSource.prototype.ProperLabels = function (options) {
  const opts = Object.assign({}, options, {
    map: this._map,
    source: this,
  });
  if (!this._proper) {
    this._proper = new ProperLabels(opts);
  }
  return this._proper;
};
