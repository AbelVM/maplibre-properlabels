/**
 * Lightweight web worker pool manager.
 *
 * A small, dependency-free pool that supports:
 * - reusing idle workers,
 * - growing the pool up to `maxSize`,
 * - optional task queuing when the pool is saturated,
 * - and terminating idle workers after `idleTimeout`.
 *
 * Additionally, the pool emits a synthetic `pool:idle` message when the
 * pool transitions to fully idle (no active tasks and an empty queue).
 * This allows consumers to react when all asynchronous work has completed.
 *
 * @module poolManager
 */

/**
 * @typedef {Object} WorkerObj
 * @property {number} id - Numeric id for the worker entry.
 * @property {Worker} worker - The underlying Worker instance or worker-like object.
 * @property {number} tasks - Number of active tasks currently assigned.
 * @property {number} lastActive - Timestamp (ms) of last activity on this worker.
 */

/**
 * Manager for a pool of web workers.
 *
 * @example
 * import MinionWorker from './worker.js?worker&inline'
 * const pool = new PoolManager(MinionWorker, { size: 4, idleTimeout: 30000 });
 * pool.onmessage = (e) => { console.log(e.data); };
 * pool.postMessage({ payload: {} });
 */
export default class PoolManager {
  /**
   * Create a PoolManager.
   *
   * @param {Function|string} workerSource - A Worker constructor/factory (callable) or a relative path string to pass to `new Worker(new URL(path, import.meta.url))`.
   * @param {Object} [options]
   * @param {number} [options.size] - Initial number of workers to create.
   * @param {number} [options.minSize=1] - Minimum number of workers to keep alive.
   * @param {number} [options.maxSize] - Maximum number of workers allowed in the pool.
   * @param {Object} [options.workerOptions] - Options forwarded to the Worker constructor when using a string path.
   * @param {number} [options.maxTasksPerWorker=Infinity] - Soft capacity per worker before considering it busy.
   * @param {number} [options.idleTimeout=60000] - Milliseconds after which idle workers (beyond `minSize`) will be terminated.
   * @param {boolean} [options.taskQueue=true] - Whether to queue tasks when all workers are busy.
   */
  constructor(workerSource, options = {}) {
    const hwConcurrency = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 2;
    const {
      size = Math.min(hwConcurrency, 2),
      minSize = 1,
      maxSize = Math.max(size, hwConcurrency),
      workerOptions = {},
      maxTasksPerWorker = Infinity,
      idleTimeout = 60_000,
      taskQueue = true
    } = options;

    this._workerSource = workerSource;
    this._workerOptions = workerOptions;
    this._maxTasksPerWorker = maxTasksPerWorker;
    this.minSize = Math.max(0, minSize);
    this.maxSize = Math.max(this.minSize, maxSize);
    this.idleTimeout = Math.max(0, idleTimeout);
    this.taskQueueEnabled = Boolean(taskQueue);

    /** @type {WorkerObj[]} */
    this.workers = [];
    this.queue = [];
    this._listeners = { message: new Set(), error: new Set(), messageerror: new Set(), idle: new Set() };
    this._onmessage = null;
    this._onerror = null;
    this._onidle = null;
    this._nextIndex = 0;
    /** whether the pool is considered idle (no active tasks and empty queue) */
    this._isIdle = true;

    const initial = Math.min(Math.max(size, this.minSize), this.maxSize);
    for (let i = 0; i < initial; i++) this._addWorkerInstance(i);

    // reaper checks periodically and terminates idle workers
    this._reaperInterval = setInterval(() => this._reapIdleWorkers(), Math.max(1000, Math.floor(this.idleTimeout / 2)));
  }

  /**
   * Create a new worker instance using the configured source.
   * @private
   * @returns {Worker|any}
   */
  _createWorkerInstance() {
    if (typeof this._workerSource === 'function') return new this._workerSource();
    if (typeof this._workerSource === 'string') return new Worker(new URL(this._workerSource, import.meta.url), this._workerOptions);
    throw new Error('Invalid workerSource: expected Worker factory or relative path string');
  }

  /**
   * Add and wire a new worker instance into the pool.
   * @private
   * @param {number} id
   * @returns {WorkerObj}
   */
  _addWorkerInstance(id) {
    const worker = this._createWorkerInstance();
    const workerObj = { id, worker, tasks: 0, lastActive: Date.now() };
    this.workers.push(workerObj);

    worker.onmessage = (e) => {
      workerObj.tasks = Math.max(0, workerObj.tasks - 1);
      workerObj.lastActive = Date.now();

      // dispatch queued task if any
      if (this.queue.length > 0 && workerObj.tasks < this._maxTasksPerWorker) {
        const item = this.queue.shift();
        try {
          if (item.transfer) worker.postMessage(item.message, item.transfer);
          else worker.postMessage(item.message);
          workerObj.tasks++;
        } catch (err) {
          console.error('Failed to dispatch queued message to worker', err);
        }
      }

      if (this._onmessage) {
        try { this._onmessage(e); } catch (err) { console.error('Pool onmessage handler error', err); }
      }
      for (const cb of this._listeners.message) {
        try { cb(e); } catch (err) { console.error('pool listener error', err); }
      }

      // update idle state after processing a message (and possibly dispatching queued tasks)
      this._updateIdleState();
    };

    worker.onerror = (e) => {
      if (this._onerror) {
        try { this._onerror(e); } catch (err) { console.error('Pool onerror handler error', err); }
      }
      for (const cb of this._listeners.error) {
        try { cb(e); } catch (err) { console.error('pool error listener error', err); }
      }
    };

    worker.onmessageerror = (e) => {
      for (const cb of this._listeners.messageerror) {
        try { cb(e); } catch (err) { console.error('pool messageerror listener error', err); }
      }
    };

    return workerObj;
  }

  /**
   * Return the least-loaded worker (smallest `tasks` count).
   * @private
   * @returns {WorkerObj|null}
   */
  _findLeastLoadedWorker() {
    if (!this.workers.length) return null;
    let best = this.workers[0];
    for (let i = 1; i < this.workers.length; i++) {
      if (this.workers[i].tasks < best.tasks) best = this.workers[i];
    }
    return best;
  }

  /**
   * Post a message to a worker in the pool.
   * The pool will try to reuse an idle/least-loaded worker, grow the pool
   * (up to `maxSize`), or queue the task if configured.
   *
   * @param {*} message - The message to post to a worker.
   * @param {Transferable[]=} transfer - Optional transfer list.
   * @returns {boolean} True if the message was accepted (dispatched or queued).
   */
  postMessage(message, transfer) {
    // prefer an existing idle/least-loaded worker
    const least = this._findLeastLoadedWorker();

    if (least && least.tasks < this._maxTasksPerWorker) {
      try {
        if (transfer) least.worker.postMessage(message, transfer);
        else least.worker.postMessage(message);
        least.tasks++;
        least.lastActive = Date.now();
        // mark pool as non-idle and update state
        this._updateIdleState();
        return true;
      } catch (err) {
        console.error('Failed to postMessage to worker', err);
        return false;
      }
    }

    // if we can grow the pool, create a new worker and use it
    if (this.workers.length < this.maxSize) {
      const newIdx = this.workers.length;
      const obj = this._addWorkerInstance(newIdx);
      try {
        if (transfer) obj.worker.postMessage(message, transfer);
        else obj.worker.postMessage(message);
        obj.tasks++;
        obj.lastActive = Date.now();
        // new worker means pool not idle
        this._updateIdleState();
        return true;
      } catch (err) {
        console.error('Failed to postMessage to new worker', err);
        return false;
      }
    }

    // pool full and all workers at capacity
    if (this.taskQueueEnabled) {
      this.queue.push({ message, transfer });
      // queued task means pool not idle
      this._updateIdleState();
      return true;
    }

    // fallback: round-robin dispatch
    const fallback = this.workers[this._nextIndex % this.workers.length];
    this._nextIndex++;
    try {
      if (transfer) fallback.worker.postMessage(message, transfer);
      else fallback.worker.postMessage(message);
      fallback.tasks++;
      fallback.lastActive = Date.now();
      this._updateIdleState();
      return true;
    } catch (err) {
      console.error('Failed to postMessage to fallback worker', err);
      return false;
    }
  }

  /**
   * Broadcasts a message to all workers in the pool.
   * @param {*} message
   * @param {Transferable[]=} transfer
   */
  broadcast(message, transfer) {
    for (const w of this.workers) {
      try {
        if (transfer) w.worker.postMessage(message, transfer);
        else w.worker.postMessage(message);
        w.tasks++;
        w.lastActive = Date.now();
      } catch (err) {
        console.error('broadcast error', err);
      }
    }
    this._updateIdleState();
  }

  /**
   * Add one worker to the pool immediately.
   * @returns {WorkerObj}
   */
  addWorker() { return this._addWorkerInstance(this.workers.length); }

  /**
   * Remove the last worker from the pool and terminate it.
   */
  removeWorker() {
    const w = this.workers.pop();
    if (w) {
      try { w.worker.terminate(); } catch (err) { /* ignore */ }
    }
  }

  /**
   * Internal: terminate workers that have been idle longer than `idleTimeout`.
   * Keeps at least `minSize` workers alive.
   * @private
   */
  _reapIdleWorkers() {
    if (this.idleTimeout <= 0) return;
    const now = Date.now();
    // keep at least minSize workers
    for (let i = this.workers.length - 1; i >= 0; i--) {
      const w = this.workers[i];
      if (this.workers.length <= this.minSize) break;
      if (w.tasks === 0 && (now - (w.lastActive || 0) > this.idleTimeout)) {
        try {
          w.worker.terminate();
        } catch (err) { /* ignore */ }
        this.workers.splice(i, 1);
      }
    }
    // re-evaluate idle state after pruning
    this._updateIdleState();
  }

  /**
   * Emit the pool-idle synthetic message to `onmessage` and listeners.
    *
    * The emitted event object has the shape: `{ data: { type: 'pool:idle', stats } }` where
    * `stats` is an array with the per-worker snapshot: `{ id, tasks, lastActive }`.
    *
    * Emission semantics:
    * - The event is emitted only when the pool transitions from non-idle to idle
    *   (i.e. the task queue is empty and every worker has `tasks === 0`).
    * - The synthetic event is delivered to `pool.onmessage`, any `'message'` listeners,
    *   as well as to `pool.onidle` and `addEventListener('idle', cb)` listeners.
    * - The event `data.type` is `'pool:idle'` and can be used to distinguish it
    *   from normal worker messages.
    *
    * Example:
    * ```js
    * pool.addEventListener('idle', (e) => {
    *   // e.data.type === 'pool:idle'
    *   console.log('Pool idle, stats=', e.data.stats);
    * });
    * ```
    *
    * @private
   */
  _emitIdle() {
    const ev = { data: { type: 'pool:idle', stats: this.getStats() } };
    this._isIdle = true;
    if (this._onmessage) {
      try { this._onmessage(ev); } catch (err) { console.error('Pool onmessage handler error', err); }
    }
    if (this._onidle) {
      try { this._onidle(ev); } catch (err) { console.error('Pool onidle handler error', err); }
    }
    for (const cb of this._listeners.message) {
      try { cb(ev); } catch (err) { console.error('pool listener error', err); }
    }
    for (const cb of this._listeners.idle) {
      try { cb(ev); } catch (err) { console.error('pool idle listener error', err); }
    }
  }

  /**
   * Check current state and emit idle event if transitioning to idle.
   * @private
   */
  _updateIdleState() {
    const hasWorkers = this.workers.length > 0;
    const allWorkersIdle = hasWorkers && this.workers.every(w => w.tasks === 0);
    const queueEmpty = this.queue.length === 0;
    const allIdle = allWorkersIdle && queueEmpty;

    if (allIdle && !this._isIdle) {
      // emit idle notification
      this._emitIdle();
    } else if (!allIdle && this._isIdle) {
      // mark non-idle
      this._isIdle = false;
    }
  }

  /**
   * Terminate the entire pool, clear queue and the reaper interval.
   */
  terminate() {
    if (this._reaperInterval) {
      clearInterval(this._reaperInterval);
      this._reaperInterval = null;
    }
    for (const w of this.workers) {
      try { w.worker.terminate(); } catch (err) { /* ignore */ }
    }
    this.workers = [];
    this.queue = [];
  }

  /**
   * Return stats for debugging.
   * @returns {{id:number,tasks:number,lastActive:number}[]}
   */
  getStats() {
    return this.workers.map(w => ({ id: w.id, tasks: w.tasks, lastActive: w.lastActive }));
  }

  /**
   * Add an event listener for pool events. Supported types: 'message', 'error', 'messageerror', 'idle'.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  addEventListener(type, cb) {
    if (!(type in this._listeners)) return;
    this._listeners[type].add(cb);
    // If registering an 'idle' listener while the pool is already idle,
    // invoke it immediately with the same event shape produced on transitions.
    if (type === 'idle' && this._isIdle) {
      const ev = { data: { type: 'pool:idle', stats: this.getStats() } };
      try { cb(ev); } catch (err) { console.error('pool idle listener error', err); }
    }
  }

  /**
   * Remove a previously added event listener.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  removeEventListener(type, cb) {
    if (type in this._listeners) this._listeners[type].delete(cb);
  }

  /**
   * onmessage handler called when any worker posts a message.
   * @type {Function|null}
   */
  get onmessage() { return this._onmessage; }
  set onmessage(cb) { this._onmessage = cb; }

  /**
   * onerror handler called when a worker emits an error.
   * @type {Function|null}
   */
  get onerror() { return this._onerror; }
  set onerror(cb) { this._onerror = cb; }

  /**
   * onidle handler called when the pool becomes idle.
   * @type {Function|null}
   */
  get onidle() { return this._onidle; }
  set onidle(cb) {
    this._onidle = cb;
    if (typeof cb === 'function' && this._isIdle) {
      const ev = { data: { type: 'pool:idle', stats: this.getStats() } };
      try { cb(ev); } catch (err) { console.error('Pool onidle handler error', err); }
    }
  }
}

export function createPool(workerSource, options = {}) {
  return new PoolManager(workerSource, options);
}
