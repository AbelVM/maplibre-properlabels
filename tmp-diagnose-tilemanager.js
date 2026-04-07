import TileManager from './src/utils/tileManager.js';
class FakeWorker {
  constructor() {
    this.postMessage = (...args) => { console.log('BATCH', args); };
    this.addEventListener = () => {};
    this.removeEventListener = () => {};
  }
}
const manager = new TileManager({ map: {}, source: { id:'test-source', type:'vector', tileSize:512, maxzoom:14 }, sourceLayer:'layer-1', fid:'id', tileSize:512, tolerance:0.00001, cacheSize:10, units:'meters', tilePoolSize:1, gatherPoolSize:1, tileWorkerSource:FakeWorker, gatherWorkerSource:FakeWorker });
manager.tilePool.postMessageBatch = (...args) => { console.log('BATCH', args); };
const event = { sourceId:'test-source', isSourceLoaded:true, tile:{ tileID:{canonical:{z:0,x:0,y:0}}, querySourceFeatures:(features, opts)=>{ console.log('QSF features', features, 'opts', opts); return [{ id:'feature-1', type:'Feature', geometry:{ type:'Polygon', coordinates:[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}, properties:{id:'feature-1'}}]; }}};
manager.handleSourceData(event);
setTimeout(() => console.log('timeout done'), 50);
