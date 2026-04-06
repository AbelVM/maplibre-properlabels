import { PowerPool, PowerCache, PowerBatch, PowerEventBus, PowerLogger, PowerDefer, o2u8, u82o } from '../../externals/performance-helpers.es.js';

const DEFAULT_TILE_BATCH_OPTIONS = { maxSize: 16, scheduling: 'microtask' };
const DEFAULT_GATHER_BATCH_OPTIONS = { maxSize: 8, scheduling: 'microtask' };
const DEFAULT_CACHE_OPTIONS = { defaultTTL: 60_000, maxEntries: 1000 };

function safeString(value) {
  return value == null ? '' : String(value);
}

export class PowerTileManager {
  /**
   * @param {Object} [options]
   * @param {*} options.tileWorkerSource - A worker source for per-tile processing (constructor, factory, or path string).
   * @param {*} [options.gatherWorkerSource] - A worker source for gather processing.
   * @param {Object} [options.tilePoolOptions] - Options forwarded to the tile worker pool.
   * @param {Object} [options.gatherPoolOptions] - Options forwarded to the gather worker pool.
   * @param {Object} [options.tileCacheOptions] - Options forwarded to the underlying tile cache.
   * @param {Object} [options.gatherCacheOptions] - Options forwarded to the underlying gather cache.
   * @param {Object} [options.tileBatchOptions] - Options forwarded to the internal tile batcher.
   * @param {Object} [options.gatherBatchOptions] - Options forwarded to the internal gather batcher.
   * @param {function(any):{key?:string,result:any}|null} [options.tileResponseMatcher] - Optional matcher for tile worker responses.
   * @param {function(any):{key?:string,result:any}|null} [options.gatherResponseMatcher] - Optional matcher for gather worker responses.
   * @param {function(any):{pieceKey?:string,message:any,transfer?:Transferable[],cacheKey?:string,awaitResponse?:boolean}|null} [options.tileToGather] - Optional mapper that converts tile responses into gather inputs.
   * @param {PowerLogger} [options.logger] - Optional custom logger.
   */
  constructor({
    tileWorkerSource,
    gatherWorkerSource = null,
    tilePoolOptions = {},
    gatherPoolOptions = {},
    tileCacheOptions = {},
    gatherCacheOptions = {},
    tileBatchOptions = {},
    gatherBatchOptions = {},
    tileResponseMatcher = null,
    gatherResponseMatcher = null,
    tileToGather = null,
    logger = null,
  } = {}) {
    if (!tileWorkerSource) {
      throw new Error('PowerTileManager requires tileWorkerSource');
    }

    this._logger = logger || new PowerLogger(1, { name: 'PowerTileManager' });
    this._bus = new PowerEventBus({ weak: false });
    this._requestCounter = 0;

    this.tilePool = new PowerPool(tileWorkerSource, tilePoolOptions);
    this.tilePool.addEventListener('message', (ev) => this._handleTilePoolMessage(ev));
    this.tilePool.addEventListener('error', (err) =>
      this._emit('error', { path: 'tile', error: err })
    );
    this.tilePool.addEventListener('idle', () => this._emit('idle', { path: 'tile' }));

    this.gatherPool = gatherWorkerSource
      ? new PowerPool(gatherWorkerSource, gatherPoolOptions)
      : null;
    if (this.gatherPool) {
      this.gatherPool.addEventListener('message', (ev) => this._handleGatherPoolMessage(ev));
      this.gatherPool.addEventListener('error', (err) =>
        this._emit('error', { path: 'gather', error: err })
      );
      this.gatherPool.addEventListener('idle', () => this._emit('idle', { path: 'gather' }));
    }

    this.tileCache = new PowerCache(Object.assign({}, DEFAULT_CACHE_OPTIONS, tileCacheOptions));
    this.gatherCache = this.gatherPool
      ? new PowerCache(Object.assign({}, DEFAULT_CACHE_OPTIONS, gatherCacheOptions))
      : null;

    this._tileResponseMatcher =
      typeof tileResponseMatcher === 'function'
        ? tileResponseMatcher
        : this._defaultTileResponseMatcher;
    this._gatherResponseMatcher =
      typeof gatherResponseMatcher === 'function'
        ? gatherResponseMatcher
        : this._defaultGatherResponseMatcher;
    this._tileToGather = typeof tileToGather === 'function' ? tileToGather : null;

    this._pendingTileRequests = new Map();
    this._pendingGatherRequests = new Map();

    this._tileBatch = new PowerBatch(
      (items) => this._dispatchTileBatch(items),
      Object.assign({}, DEFAULT_TILE_BATCH_OPTIONS, tileBatchOptions)
    );
    this._gatherBatch = this.gatherPool
      ? new PowerBatch(
        (items) => this._dispatchGatherBatch(items),
        Object.assign({}, DEFAULT_GATHER_BATCH_OPTIONS, gatherBatchOptions)
      )
      : null;
  }

  on(event, listener) {
    return this._bus.on(event, listener);
  }

  off(event, listener) {
    this._bus.off(event, listener);
  }

  _emit(event, payload) {
    try {
      this._bus.emit(event, payload);
    } catch (err) {
      this._logger.error(err, `PowerTileManager emit(${event}) failed`);
    }
  }

  _generateRequestId() {
    return `ptm-${Date.now().toString(36)}-${++this._requestCounter}-${Math.floor(Math.random() * 0xffffffff).toString(16)}`;
  }

  _normalizeMessage(data) {
    if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      try {
        return u82o(data);
      } catch (err) {
        return data;
      }
    }
    return data;
  }

  _defaultTileResponseMatcher(message) {
    if (!message || typeof message !== 'object') return null;
    const requestId =
      message.requestId ||
      message.tileKey ||
      (message._tileManager && message._tileManager.requestId);
    if (requestId != null) {
      return { key: safeString(requestId), result: message };
    }
    return null;
  }

  _defaultGatherResponseMatcher(message) {
    if (!message || typeof message !== 'object') return null;
    const requestId =
      message.requestId ||
      message.pieceKey ||
      (message._tileManager && message._tileManager.requestId);
    if (requestId != null) {
      return { key: safeString(requestId), result: message };
    }
    return null;
  }

  async _dispatchTileBatch(items) {
    const prepared = items.map((item) => {
      const envelope = Object.assign({}, item.message || {}, {
        requestId: item.requestId,
        tileKey: item.key,
        _tileManager: {
          requestId: item.requestId,
          tileKey: item.key,
          cacheKey: item.cacheKey,
          gather: item.gather,
        },
      });
      return { message: envelope, transfer: item.transfer };
    });

    const results = this.tilePool.postMessageBatch(prepared, { zeroCopy: true });
    for (let idx = 0; idx < items.length; idx += 1) {
      const item = items[idx];
      const accepted = results[idx];
      if (!accepted) {
        item.reject(new Error('Tile request was rejected by the tile pool'));
        this._pendingTileRequests.delete(item.requestId);
        continue;
      }
      if (!item.awaitResponse) {
        item.resolve(true);
      }
    }

    return true;
  }

  async _dispatchGatherBatch(items) {
    const prepared = items.map((item) => {
      const envelope = Object.assign({}, item.message || {}, {
        requestId: item.requestId,
        pieceKey: item.key,
        _tileManager: {
          requestId: item.requestId,
          pieceKey: item.key,
          cacheKey: item.cacheKey,
        },
      });
      return { message: envelope, transfer: item.transfer };
    });

    const results = this.gatherPool.postMessageBatch(prepared, { zeroCopy: true });
    for (let idx = 0; idx < items.length; idx += 1) {
      const item = items[idx];
      const accepted = results[idx];
      if (!accepted) {
        item.reject(new Error('Gather request was rejected by the gather pool'));
        this._pendingGatherRequests.delete(item.requestId);
        continue;
      }
      if (!item.awaitResponse) {
        item.resolve(true);
      }
    }

    return true;
  }

  _createRequest(item, cacheKey) {
    const requestId = item.requestId || this._generateRequestId();
    const deferred = new PowerDefer();
    const request = Object.assign({}, item, {
      requestId,
      cacheKey: cacheKey != null ? cacheKey : item.key,
      resolve: deferred.resolve,
      reject: deferred.reject,
      createdAt: Date.now(),
    });
    return { request, promise: deferred.promise };
  }

  async processTile(
    key,
    message,
    { transfer, cacheKey, awaitResponse = false, timeout = 15000, gather = true } = {}
  ) {
    const resolvedCacheKey = cacheKey != null ? String(cacheKey) : String(key);
    if (resolvedCacheKey && this.tileCache.has(resolvedCacheKey)) {
      return Promise.resolve(this.tileCache.get(resolvedCacheKey));
    }

    const item = {
      key: String(key),
      message,
      transfer,
      awaitResponse: Boolean(awaitResponse),
      gather: Boolean(gather),
      cacheKey: resolvedCacheKey,
    };
    const { request, promise } = this._createRequest(item, resolvedCacheKey);
    this._pendingTileRequests.set(request.requestId, request);

    if (timeout && Number.isFinite(timeout) && timeout > 0) {
      request.timeoutId = setTimeout(() => {
        if (this._pendingTileRequests.has(request.requestId)) {
          this._pendingTileRequests.delete(request.requestId);
          request.reject(new Error('Tile request timeout'));
        }
      }, timeout);
    }

    if (resolvedCacheKey) {
      const cachePromise = this.tileCache.getOrSetAsync(
        resolvedCacheKey,
        async () => {
          await this._tileBatch.add(request);
          return promise;
        },
        { ttl: this.tileCache.defaultTTL }
      );
      return cachePromise;
    }

    await this._tileBatch.add(request);
    return promise;
  }

  async enqueueGatherPiece(
    key,
    message,
    { transfer, cacheKey, awaitResponse = false, timeout = 15000 } = {}
  ) {
    if (!this.gatherPool) {
      throw new Error('Gather worker pool is not configured');
    }

    const resolvedCacheKey = cacheKey != null ? String(cacheKey) : String(key);
    if (resolvedCacheKey && this.gatherCache && this.gatherCache.has(resolvedCacheKey)) {
      return Promise.resolve(this.gatherCache.get(resolvedCacheKey));
    }

    const item = {
      key: String(key),
      message,
      transfer,
      awaitResponse: Boolean(awaitResponse),
      cacheKey: resolvedCacheKey,
    };
    const { request, promise } = this._createRequest(item, resolvedCacheKey);
    this._pendingGatherRequests.set(request.requestId, request);

    if (timeout && Number.isFinite(timeout) && timeout > 0) {
      request.timeoutId = setTimeout(() => {
        if (this._pendingGatherRequests.has(request.requestId)) {
          this._pendingGatherRequests.delete(request.requestId);
          request.reject(new Error('Gather request timeout'));
        }
      }, timeout);
    }

    if (resolvedCacheKey && this.gatherCache) {
      const cachePromise = this.gatherCache.getOrSetAsync(
        resolvedCacheKey,
        async () => {
          await this._gatherBatch.add(request);
          return promise;
        },
        { ttl: this.gatherCache.defaultTTL }
      );
      return cachePromise;
    }

    await this._gatherBatch.add(request);
    return promise;
  }

  _handleTilePoolMessage(ev) {
    const data = this._normalizeMessage(ev && ev.data);
    const match = this._tileResponseMatcher(data);
    const key = match && match.key ? safeString(match.key) : null;
    const result =
      match && Object.prototype.hasOwnProperty.call(match, 'result') ? match.result : data;
    const pending = key ? this._pendingTileRequests.get(key) : null;

    if (pending) {
      clearTimeout(pending.timeoutId);
      this._pendingTileRequests.delete(key);
      pending.resolve(result);
      if (pending.cacheKey && this.tileCache.has(pending.cacheKey) === false) {
        this.tileCache.set(pending.cacheKey, result);
      }
    }

    this._emit('tile:result', {
      result,
      requestId: key,
      cacheKey: pending && pending.cacheKey,
      raw: data,
    });

    if (this._tileToGather && this.gatherPool) {
      try {
        const gatherInput = this._tileToGather(result);
        if (gatherInput && gatherInput.message != null) {
          this.enqueueGatherPiece(
            safeString(
              gatherInput.pieceKey ||
              gatherInput.requestId ||
              key ||
              `piece-${Date.now().toString(36)}`
            ),
            gatherInput.message,
            {
              transfer: gatherInput.transfer,
              cacheKey: gatherInput.cacheKey,
              awaitResponse: Boolean(gatherInput.awaitResponse),
              timeout: gatherInput.timeout,
            }
          ).catch((err) => {
            this._emit('gather:error', { error: err, source: 'tileToGather' });
          });
        }
      } catch (err) {
        this._logger.error(err, 'tileToGather mapper failed');
      }
    }
  }

  _handleGatherPoolMessage(ev) {
    const data = this._normalizeMessage(ev && ev.data);
    const match = this._gatherResponseMatcher(data);
    const key = match && match.key ? safeString(match.key) : null;
    const result =
      match && Object.prototype.hasOwnProperty.call(match, 'result') ? match.result : data;
    const pending = key ? this._pendingGatherRequests.get(key) : null;

    if (pending) {
      clearTimeout(pending.timeoutId);
      this._pendingGatherRequests.delete(key);
      pending.resolve(result);
      if (
        pending.cacheKey &&
        this.gatherCache &&
        this.gatherCache.has(pending.cacheKey) === false
      ) {
        this.gatherCache.set(pending.cacheKey, result);
      }
    }

    this._emit('gather:result', {
      result,
      requestId: key,
      cacheKey: pending && pending.cacheKey,
      raw: data,
    });
  }

  async drain() {
    const waits = [this.tilePool.drain()];
    if (this.gatherPool) waits.push(this.gatherPool.drain());
    return Promise.all(waits).then((results) => ({
      tilePool: results[0],
      gatherPool: results[1] || null,
    }));
  }

  shutdown() {
    try {
      if (this.tilePool) this.tilePool.terminate();
      if (this.gatherPool) this.gatherPool.terminate();
      if (this._tileBatch) this._tileBatch.clear();
      if (this._gatherBatch) this._gatherBatch.clear();
      this._pendingTileRequests.clear();
      this._pendingGatherRequests.clear();
      this._bus.clear();
    } catch (err) {
      this._logger.error(err, 'PowerTileManager shutdown failed');
    }
  }
}

export { o2u8, u82o };
export default PowerTileManager;
