/**
 * @typedef {Object} ProperLabelsOptions
 * @property {maplibregl.Map} map MapLibre map instance.
 * @property {string|maplibregl.VectorTileSource} source Source ID or vector tile source instance.
 * @property {string} sourceLayer Name of the source layer to query.
 * @property {string} [fid] Feature identifier property name, defaults to `id`.
 * @property {number} [tileSize] Tile size in pixels, defaults to source tileSize or 512.
 * @property {number} [tolerance] Geometry simplification tolerance.
 * @property {number} [cacheSize] Maximum number of tile entries to cache.
 * @property {string} [units] Units used for area calculations.
 * @property {number} [postDelay] Debounce delay in milliseconds for source events.
 * @property {number} [debugLevel] Debug verbosity level for PowerLogger output (0..3).
 */

import { PowerLogger } from 'performance-helpers';
import TileManager from './utils/tileManager.js';
import TileWorker from './workers/tileWorker.js?worker&inline';
import GatherWorker from './workers/gatherWorker.js?worker&inline';

/**
 * ProperLabels is the plugin entry point. It creates a worker-backed label
 * pipeline, attaches an auxiliary GeoJSON source, and hooks into source data
 * events so label geometry is computed incrementally.
 * @class
 */
export default class ProperLabels {
  /**
   * @param {ProperLabelsOptions} options Plugin configuration options.
   * @returns {maplibregl.GeoJSONSource} The auxiliary GeoJSON source used for
   *   proper label feature updates.
   */
  constructor(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('ProperLabels requires an options object.');
    }
    if (!options.map || typeof options.map !== 'object') {
      throw new Error('ProperLabels requires a valid MapLibre map instance.');
    }
    if (options.source == null) {
      throw new Error('ProperLabels requires a source id or VectorTileSource instance.');
    }

    if (typeof options.sourceLayer !== 'string' || !options.sourceLayer.trim()) {
      throw new Error('ProperLabels requires a valid non-empty sourceLayer string.');
    }
    if (options.fid != null && typeof options.fid !== 'string') {
      throw new Error('ProperLabels expects fid to be a string.');
    }
    if (options.units != null && options.units !== 'meters' && options.units !== 'm') {
      throw new Error('ProperLabels expects units to be either "meters" or "m".');
    }
    if (options.postDelay != null) {
      const postDelay = Number(options.postDelay);
      if (!Number.isFinite(postDelay) || postDelay < 0) {
        throw new Error('ProperLabels expects postDelay to be a non-negative number.');
      }
    }

    this.map = options.map;
    const sourceCandidate =
      options.source instanceof maplibregl.VectorTileSource
        ? options.source
        : this.map.getSource(options.source);

    if (!sourceCandidate) {
      throw new Error(
        `ProperLabels could not resolve source ${String(options.source)}. ` +
          'Provide a valid source id or a VectorTileSource instance attached to the map.'
      );
    }
    if (!(sourceCandidate instanceof maplibregl.VectorTileSource)) {
      throw new Error('ProperLabels source must be a MapLibre VectorTileSource.');
    }

    const resolvedSource = this.map.getSource(sourceCandidate.id);
    if (!resolvedSource || resolvedSource !== sourceCandidate) {
      throw new Error(
        `ProperLabels source ${String(sourceCandidate.id)} must be a live source registered on the provided map.`
      );
    }

    this.source = sourceCandidate;

    this.sourceLayer = options.sourceLayer.trim();
    this.fid = options.fid || 'id';
    this.tileSize = this.source.tileSize || 512;
    this.tolerance = options.tolerance || 0.00001;
    this.cacheSize = options.cacheSize || 5000;
    this.units = options.units || 'meters';
    this.postDelay = options.postDelay != null ? Number(options.postDelay) : 0;
    this.debugLevel = Number.isFinite(Number(options.debugLevel))
      ? Math.max(0, Math.min(3, Math.floor(Number(options.debugLevel))))
      : 0;
    this.keepSource = options.keepSource === true;

    this._logger = new PowerLogger(this.debugLevel, { name: 'properlabels' });

    this.map.addSource(this.source.id + '-proper', {
      type: 'geojson',
      maxzoom: this.source.maxzoom,
      promoteId: '_index',
      data: {},
    });
    this.gjSource = this.map.getSource(this.source.id + '-proper');
    this.gjSource.dispose = () => this.dispose();

    this.manager = new TileManager({
      map: this.map,
      source: this.source,
      sourceLayer: this.sourceLayer,
      fid: this.fid,
      tileSize: this.tileSize,
      tolerance: this.tolerance,
      cacheSize: this.cacheSize,
      units: this.units,
      postDelay: this.postDelay,
      debugLevel: this.debugLevel,
      tileWorkerSource: TileWorker,
      gatherWorkerSource: GatherWorker,
    });
    this.manager.setGeoJsonSource(this.gjSource);

    this._onSourceData = (event) => this.manager.handleSourceData(event);
    this.map.on('sourcedata', this._onSourceData);

    this.map.refreshTiles(this.source.id);
    return this.gjSource;
  }

  /**
   * Tear down the plugin and stop listening for source updates.
   * @returns {void}
   */
  dispose() {
    if (this.manager) {
      this.manager.dispose();
    }
    if (this.map && typeof this.map.off === 'function' && this._onSourceData) {
      this.map.off('sourcedata', this._onSourceData);
    }

    if (!this.keepSource && this.map && typeof this.map.getSource === 'function' && typeof this.map.removeSource === 'function') {
      const properSourceId = `${this.source.id}-proper`;
      if (this.map.getSource(properSourceId)) {
        try {
          this.map.removeSource(properSourceId);
        } catch (err) {
          /* ignore removal failures */
        }
      }
    }
  }
}
/**
 * Attach the ProperLabels plugin to a VectorTileSource instance.
 * The helper stores the plugin instance on the source and reuses it across calls.
 * Repeated calls with the same source and equivalent options return the same instance.
 * If options differ, the previous instance is disposed and a new one is created.
 * @this {maplibregl.VectorTileSource}
 * @param {ProperLabelsOptions} options
 * @returns {ProperLabels}
 */
const normalizeProperLabelsOptions = (options) => {
  const normalized = {};
  for (const key of Object.keys(options || {})) {
    if (key === 'map' || key === 'source') continue;
    normalized[key] = options[key];
  }
  return normalized;
};

const areProperLabelsOptionsEqual = (a = {}, b = {}) => {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i += 1) {
    const key = aKeys[i];
    if (bKeys[i] !== key) return false;
    if (a[key] !== b[key]) return false;
  }
  return true;
};

maplibregl.VectorTileSource.prototype.ProperLabels = function (options) {
  const sourceMap = options?.map || this._map;
  if (!sourceMap || typeof sourceMap !== 'object') {
    throw new Error(
      'ProperLabels plugin helper requires the VectorTileSource to be attached to a map. ' +
        'Use `source._map = map` or call `new ProperLabels({ map, source })` directly.'
    );
  }
  const opts = Object.assign({}, options, {
    map: sourceMap,
    source: this,
  });
  const normalizedOpts = normalizeProperLabelsOptions(opts);

  if (this._proper) {
    const previousOpts = this._proper._properLabelsOptions || {};
    if (!areProperLabelsOptionsEqual(previousOpts, normalizedOpts)) {
      this._proper.dispose();
      this._proper = new ProperLabels(opts);
      this._proper._properLabelsOptions = normalizedOpts;
    }
    return this._proper;
  }

  this._proper = new ProperLabels(opts);
  this._proper._properLabelsOptions = normalizedOpts;
  return this._proper;
};
