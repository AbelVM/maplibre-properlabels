/**
 * @typedef {Object} CacheNode
 * @property {*} key
 * @property {*} value
 * @property {number} weight
 * @property {number} expiresAt
 * @property {CacheNode|null} prev
 * @property {CacheNode|null} next
 */
/**
 * cacheManager
 *
 * A memory-efficient LRU cache with these features:
 * - TTL (time-to-live) per entry
 * - Weighted eviction (`maxWeight`) and entry-count eviction (`maxEntries`)
 * - Reusable node pool to reduce allocation / GC churn
 * - Incremental, chunked cleanup with a persistent cursor to resume scans for very large caches
 * - Optional rejection of oversized entries and callbacks for evict/expire/delete events
 *
 * Use `onEvict` and `onExpire` to observe removals. The cache exposes iterators
 * and runtime controls (`resize`, `startCleanup`, `stopCleanup`).
 *
 * @example
 * // Create a cache with caps and a simple weight function
 * const cache = new cacheManager({
 *   maxEntries: 100,
 *   maxWeight: 1024 * 1024,
 *   weightFn: (v) => (v && v.byteLength) ? v.byteLength : 1,
 *   defaultTTL: 60_000,
 *   rejectOversized: true
 * });
 *
 * // Insert a value with explicit weight and TTL
 * cache.set('tile:0:0:0', { labels: [] }, { ttl: 5 * 60_000, weight: 1024 });
 *
 * // Retrieve and mark as used
 * const val = cache.get('tile:0:0:0');
 *
 * // Iterate MRU-first
 * for (const [key, value] of cache.entries('MRU')) { ... }
 *
 * // Start periodic cleanup every 10s scanning up to 200 nodes per tick
 * cache.startCleanup({ interval: 10000, maxCleanupPerTick: 200 });
 *
 * // Inspect stats
 * console.log(cache.stats());
 *
 * @class CacheManager
 */
export default class CacheManager {
  /**
   * Create a CacheManager.
   * @param {Object} [options]
   * @param {number} [options.maxEntries=Infinity] Maximum number of entries.
   * @param {number} [options.maxWeight=Infinity] Maximum total weight across entries.
   * @param {function(*):number} [options.weightFn] Function to compute weight for a value.
   * @param {number} [options.defaultTTL=60000] Default TTL (ms) for entries.
   * @param {number} [options.maxPoolSize=1000] Maximum node pool size for reuse.
   * @param {boolean} [options.rejectOversized=false] If true, inserting an item whose weight > `maxWeight` will be rejected.
   * @param {function(*, *, string):void} [options.onEvict] Callback invoked when an item is evicted/deleted/rejected. Called as `(key, value, reason)` where reason is `'evicted'|'deleted'|'rejected-oversized'`.
   * @param {function(*, *):void} [options.onExpire] Callback invoked when an item expires. Called as `(key, value)`.
   * @param {number} [options.initialPoolSize=0] Prefill the internal node pool with this many nodes (capped by `maxPoolSize`).
   * @param {number} [options.maxCleanupPerTick=100] Default max nodes scanned per cleanup tick when running `startCleanup()`.
   */
  constructor({ maxEntries = Infinity, maxWeight = Infinity, weightFn = () => 1, defaultTTL = 60000, maxPoolSize = 1000, rejectOversized = false, onEvict = null, onExpire = null, initialPoolSize = 0, maxCleanupPerTick = 100 } = {}) {
    this.maxEntries = maxEntries;
    this.maxWeight = maxWeight;
    this.weightFn = weightFn;
    this.defaultTTL = defaultTTL;
    this.maxPoolSize = maxPoolSize;
    this.rejectOversized = Boolean(rejectOversized);
    this.onEvict = typeof onEvict === 'function' ? onEvict : null;
    this.onExpire = typeof onExpire === 'function' ? onExpire : null;
    this.maxCleanupPerTick = Number.isFinite(+maxCleanupPerTick) ? Math.max(1, +maxCleanupPerTick) : 100;

    this.map = new Map();
    this.head = null;
    this.tail = null;
    this.pool = [];
    // prefill pool to reduce runtime allocations if requested
    for (let i = 0; i < Math.min(initialPoolSize || 0, this.maxPoolSize); i++) this.pool.push({ key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null });

    this.currentWeight = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.rejected = 0; // rejected oversized insert attempts

    this._cleanupTimer = null;
    this._cleanupRunning = false;
    this._cleanupParams = null;
    // Cursor used to resume incremental expiration scans to avoid re-scanning the list start
    this._cleanupCursor = null;
  }

  /**
   * Allocate a pool node or create a new one.
   * @private
   * @param {*} key
   * @param {*} value
   * @param {number} weight
   * @param {number} expiresAt
   * @returns {CacheNode}
   */
  _allocNode(key, value, weight, expiresAt) {
    const node = this.pool.pop() || { key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null };
    node.key = key;
    node.value = value;
    node.weight = weight || 0;
    node.expiresAt = expiresAt || 0;
    node.prev = null;
    node.next = null;
    return node;
  }

  /**
   * Reset and return a node to the pool for reuse.
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _freeNode(node) {
    node.key = null;
    node.value = null;
    node.weight = 0;
    node.expiresAt = 0;
    node.prev = null;
    node.next = null;
    if (this.pool.length < this.maxPoolSize) this.pool.push(node);
  }

  /**
   * Append a node to the tail (most-recently used).
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _append(node) {
    if (!this.tail) { this.head = this.tail = node; return; }
    node.prev = this.tail;
    node.next = null;
    this.tail.next = node;
    this.tail = node;
  }

  /**
   * Remove a node from the linked list.
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _remove(node) {
    const p = node.prev, n = node.next;
    if (p) p.next = n; else this.head = n;
    if (n) n.prev = p; else this.tail = p;
    node.prev = node.next = null;
  }

  /**
   * Move an existing node to the tail (mark as most-recently used).
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _moveToTail(node) {
    if (this.tail === node) return;
    this._remove(node);
    this._append(node);
  }

  /**
   * Pop and return the head (least-recently used) node.
   * @private
   * @returns {CacheNode|null}
   */
  _popHead() {
    const node = this.head;
    if (!node) return null;
    this._remove(node);
    return node;
  }

  /**
   * Evict nodes until both entry and weight limits are satisfied.
   * @private
   * @returns {void}
   */
  _evictIfNeeded() {
    while ((this.map.size > this.maxEntries) || (this.currentWeight > this.maxWeight)) {
      const node = this.head;
      if (!node) break;
      const next = node.next;
      const k = node.key;
      const v = node.value;
      // Advance cleanup cursor if it pointed to the node we're about to evict
      if (this._cleanupCursor === node) this._cleanupCursor = next || this.head;
      this._remove(node);
      this.map.delete(k);
      this.currentWeight -= node.weight || 0;
      this.evictions++;
      try { if (this.onEvict) this.onEvict(k, v, 'evicted'); } catch (err) {}
      this._freeNode(node);
    }
  }

  /**
   * Set a value in the cache (add or update).
   * Marks the entry as most-recently used.
   * If `rejectOversized` is enabled and the computed/explicit weight exceeds `maxWeight`,
   * the insertion will be rejected and `set` returns `false` (otherwise returns `this`).
   * @param {*} key - Cache key
   * @param {*} value - Value to store
   * @param {Object} [options]
   * @param {number} [options.ttl] - Time-to-live in ms. Use `null` or `Infinity` to disable expiration.
   * @param {number} [options.weight] - Optional explicit weight for the entry. If omitted, `weightFn` is used.
   * @returns {this|false} `this` on success, or `false` when insertion was rejected due to oversize.
   */
  set(key, value, { ttl = this.defaultTTL, weight = null } = {}) {
    const now = Date.now();
    const expiresAt = (ttl == null || ttl === Infinity) ? 0 : now + ttl;
    const wRaw = weight != null ? weight : (this.weightFn(value) || 0);
    const w = Number.isFinite(+wRaw) ? Math.max(0, +wRaw) : 0;
    // If item is heavier than maxWeight, optionally reject insertion
    if (this.rejectOversized && Number.isFinite(this.maxWeight) && w > this.maxWeight) {
      this.rejected++;
      try { if (this.onEvict) this.onEvict(key, value, 'rejected-oversized'); } catch (err) {}
      return this.rejectOversized ? false : this;
    }

    if (this.map.has(key)) {
      const node = this.map.get(key);
      this.currentWeight -= node.weight || 0;
      node.value = value;
      node.weight = w;
      node.expiresAt = expiresAt;
      this.currentWeight += node.weight || 0;
      this._moveToTail(node);
    } else {
      const node = this._allocNode(key, value, w, expiresAt);
      this.map.set(key, node);
      this._append(node);
      this.currentWeight += node.weight || 0;
      this._evictIfNeeded();
    }
    return this;
  }

  /**
   * Retrieve a value and mark it as recently used.
   * @param {*} key
   * @returns {*|undefined} The stored value or `undefined` if missing/expired.
   */
  get(key) {
    const node = this.map.get(key);
    const now = Date.now();
    if (!node) { this.misses++; return undefined; }
    if (node.expiresAt && node.expiresAt <= now) {
      const k = node.key;
      const v = node.value;
      const next = node.next;
      this.map.delete(k);
      this.currentWeight -= node.weight || 0;
      if (this._cleanupCursor === node) this._cleanupCursor = next || this.head;
      this._remove(node);
      try { if (this.onExpire) this.onExpire(k, v); } catch (err) {}
      this._freeNode(node);
      this.misses++;
      return undefined;
    }
    this._moveToTail(node);
    this.hits++;
    return node.value;
  }

  /**
   * Get a value without updating recency.
   * Returns `undefined` for missing or expired entries.
   * @param {*} key
   * @returns {*|undefined}
   */
  peek(key) {
    const node = this.map.get(key);
    if (!node) return undefined;
    if (node.expiresAt && node.expiresAt <= Date.now()) return undefined;
    return node.value;
  }

  /**
   * Check membership without affecting recency.
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false] If true, consider expired entries as present.
   * @returns {boolean}
   */
  has(key, { ignoreExpiry = false } = {}) {
    const node = this.map.get(key);
    if (!node) return false;
    if (!ignoreExpiry && node.expiresAt && node.expiresAt <= Date.now()) return false;
    return true;
  }

  /**
   * Check membership without affecting recency and verify the stored value is deep-equal
   * to the provided `value`.
   *
   * Optimizations:
   * - Fast reference equality short-circuit
   * - Fast primitive checks
   * - Special-cases for Arrays, TypedArrays/ArrayBuffer, Date, RegExp, Map and Set
   * - WeakMap/WeakSet-based cycle detection
   *
   * @param {*} key
   * @param {*} value
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false] If true, consider expired entries as present.
   * @returns {boolean}
   */
  hasEqual(key, value, { ignoreExpiry = false } = {}) {
    const node = this.map.get(key);
    if (!node) return false;
    if (!ignoreExpiry && node.expiresAt && node.expiresAt <= Date.now()) return false;
    const stored = node.value;
    // Fast reference equality
    if (stored === value) return true;

    // Fast primitive check
    const tStored = typeof stored;
    const tIncoming = typeof value;
    if (tStored !== 'object' || stored === null || tIncoming !== 'object' || value === null) {
      return stored === value;
    }

    // Use WeakMap -> WeakSet pair-tracking to handle cyclic structures
    const seen = new WeakMap();
    const equal = (a, b) => {
      if (a === b) return true;
      if (a == null || b == null) return a === b;
      const ta = typeof a, tb = typeof b;
      if (ta !== 'object' || tb !== 'object') return a === b;

      // Cycle detection
      const mapForA = seen.get(a);
      if (mapForA && mapForA.has(b)) return true;
      if (!mapForA) seen.set(a, new WeakSet());
      seen.get(a).add(b);

      // Prototypes must match
      if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

      // Uint8Array fast-path
      if (typeof Uint8Array !== 'undefined' && a instanceof Uint8Array) {
        if (!(b instanceof Uint8Array)) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
      }

      // Arrays
      if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (!equal(a[i], b[i])) return false;
        return true;
      }

      // TypedArray / DataView / other ArrayBuffer views
      if (ArrayBuffer.isView(a)) {
        if (!ArrayBuffer.isView(b) || a.byteLength !== b.byteLength) return false;
        const ua = new Uint8Array(a.buffer, a.byteOffset || 0, a.byteLength);
        const ub = new Uint8Array(b.buffer, b.byteOffset || 0, b.byteLength);
        for (let i = 0; i < ua.length; i++) if (ua[i] !== ub[i]) return false;
        return true;
      }

      // ArrayBuffer
      if (a instanceof ArrayBuffer) {
        if (!(b instanceof ArrayBuffer) || a.byteLength !== b.byteLength) return false;
        const ua = new Uint8Array(a), ub = new Uint8Array(b);
        for (let i = 0; i < ua.length; i++) if (ua[i] !== ub[i]) return false;
        return true;
      }

      // Date
      if (a instanceof Date) {
        if (!(b instanceof Date)) return false;
        return a.getTime() === b.getTime();
      }

      // RegExp
      if (a instanceof RegExp) {
        if (!(b instanceof RegExp)) return false;
        return a.toString() === b.toString();
      }

      // Map
      if (a instanceof Map) {
        if (!(b instanceof Map) || a.size !== b.size) return false;
        for (const [k, v] of a) {
          if (!b.has(k)) return false;
          if (!equal(v, b.get(k))) return false;
        }
        return true;
      }

      // Set
      if (a instanceof Set) {
        if (!(b instanceof Set) || a.size !== b.size) return false;
        // Fast path for primitive-only sets
        let allPrimitive = true;
        for (const item of a) { if (item !== null && typeof item === 'object') { allPrimitive = false; break; } }
        if (allPrimitive) {
          for (const item of a) if (!b.has(item)) return false;
          return true;
        }
        // Fallback O(n^2) deep-match for non-primitive items
        for (const itemA of a) {
          let found = false;
          for (const itemB of b) { if (equal(itemA, itemB)) { found = true; break; } }
          if (!found) return false;
        }
        return true;
      }

      // Plain objects (including POJOs)
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (let i = 0; i < keysA.length; i++) {
        const k = keysA[i];
        if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
        if (!equal(a[k], b[k])) return false;
      }
      return true;
    };

    return equal(stored, value);
  }

  /**
   * Delete an entry from the cache.
   * @param {*} key
   * @returns {boolean} true if the key was removed.
   */
  delete(key) {
    const node = this.map.get(key);
    if (!node) return false;
    const next = node.next;
    this.map.delete(key);
    this.currentWeight -= node.weight || 0;
    if (this._cleanupCursor === node) this._cleanupCursor = next || this.head;
    this._remove(node);
    try { if (this.onEvict) this.onEvict(node.key, node.value, 'deleted'); } catch (err) {}
    this._freeNode(node);
    return true;
  }

  /**
   * Clear the cache and return nodes to the pool.
   * @returns {void}
   */
  clear() {
    for (let node = this.head; node;) {
      const next = node.next;
      if (this.pool.length < this.maxPoolSize) this.pool.push(node);
      node = next;
    }
    this.head = this.tail = null;
    this.map.clear();
    this.currentWeight = 0;
    this._cleanupCursor = null;
  }

  /**
   * Remove expired entries by scanning from least-recently used to most.
   * @returns {void}
   */
  cleanupExpired() {
    // Backwards-compatible: allow optional scan limit
    return this.cleanupExpiredUpTo();
  }

  /**
   * Cleanup expired entries, scanning up to `maxScan` nodes.
   * Scanning resumes from an internal cursor so repeated small passes will cover the list
   * without repeatedly scanning the head of a very large cache. When the end is reached the
   * cursor wraps to the head.
   * @param {number} [maxScan=Infinity] Maximum nodes to scan in this pass.
   * @returns {number} Number of nodes scanned
   */
  cleanupExpiredUpTo(maxScan = Infinity) {
    const now = Date.now();
    let scanned = 0;
    // Resume from the previous cursor when possible to avoid re-scanning from head.
    let node = this._cleanupCursor && this.map.get(this._cleanupCursor.key) === this._cleanupCursor ? this._cleanupCursor : this.head;
    while (node && scanned < maxScan) {
      const next = node.next;
      if (node.expiresAt && node.expiresAt <= now) {
        const k = node.key;
        const v = node.value;
        this.map.delete(k);
        this.currentWeight -= node.weight || 0;
        // advance cursor if it pointed to this node
        if (this._cleanupCursor === node) this._cleanupCursor = next || this.head;
        this._remove(node);
        try { if (this.onExpire) this.onExpire(k, v); } catch (err) {}
        this._freeNode(node);
        this.evictions++;
      }
      node = next;
      scanned++;
    }
    // resume from where we left off; if we've reached the end, wrap to head
    this._cleanupCursor = node || this.head;
    return scanned;
  }

  /**
   * Start periodic, non-blocking cleanup.
   * Accepts either a numeric interval (ms) or an options object `{ interval, maxCleanupPerTick }`.
   * The loop is implemented with `setTimeout` and scans up to `maxCleanupPerTick` nodes per pass
   * to avoid long event-loop stalls.
   * @param {number|Object} [intervalOrOptions]
   * @param {number} [intervalOrOptions.interval] Interval between cleanup passes in ms.
   * @param {number} [intervalOrOptions.maxCleanupPerTick] Max nodes to scan per pass.
   * @returns {void}
   */
  startCleanup(intervalOrOptions = {}) {
    let interval, maxCleanupPerTick;
    if (typeof intervalOrOptions === 'number') {
      interval = intervalOrOptions;
      maxCleanupPerTick = this.maxCleanupPerTick;
    } else {
      interval = Number.isFinite(+intervalOrOptions.interval) ? +intervalOrOptions.interval : Math.max(1000, Math.min(this.defaultTTL || 60000, 60000));
      maxCleanupPerTick = Number.isFinite(+intervalOrOptions.maxCleanupPerTick) ? Math.max(1, +intervalOrOptions.maxCleanupPerTick) : this.maxCleanupPerTick;
    }
    this.stopCleanup();
    this._cleanupParams = { interval, maxCleanupPerTick };
    const tick = () => {
      if (this._cleanupTimer == null) return; // stopped
      if (this._cleanupRunning) {
        // schedule next run
        this._cleanupTimer = setTimeout(tick, this._cleanupParams.interval);
        return;
      }
      this._cleanupRunning = true;
      try {
        this.cleanupExpiredUpTo(this._cleanupParams.maxCleanupPerTick);
      } finally {
        this._cleanupRunning = false;
      }
      this._cleanupTimer = setTimeout(tick, this._cleanupParams.interval);
    };
    // start loop
    this._cleanupTimer = setTimeout(tick, interval);
  }

  /**
   * Stop periodic cleanup.
   * @returns {void}
   */
  stopCleanup() {
    if (this._cleanupTimer) { clearTimeout(this._cleanupTimer); this._cleanupTimer = null; }
    this._cleanupRunning = false;
    this._cleanupParams = null;
  }

  /**
   * Current number of entries in cache.
   * @returns {number}
   */
  get size() { return this.map.size; }

  /**
   * Return runtime statistics for the cache.
   * @returns {{size:number, weight:number, hits:number, misses:number, evictions:number, rejected:number, poolSize:number}}
   */
  stats() { return { size: this.size, weight: this.currentWeight, hits: this.hits, misses: this.misses, evictions: this.evictions, rejected: this.rejected, poolSize: this.pool.length }; }

  /**
   * Resize the cache limits and evict if necessary.
   * @param {Object} options
   * @param {number} [options.maxEntries]
   * @param {number} [options.maxWeight]
   */
  resize({ maxEntries, maxWeight } = {}) {
    if (Number.isFinite(+maxEntries)) this.maxEntries = Math.max(0, +maxEntries);
    if (Number.isFinite(+maxWeight)) this.maxWeight = Math.max(0, +maxWeight);
    this._evictIfNeeded();
  }

  /**
   * Iterate entries in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   * @returns {IterableIterator<[*,*]>}
   */
  *entries(order = 'MRU') {
    if (order === 'MRU') {
      for (let node = this.tail; node; node = node.prev) yield [node.key, node.value];
    } else {
      for (let node = this.head; node; node = node.next) yield [node.key, node.value];
    }
  }

  /**
   * Iterate keys in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *keys(order = 'MRU') {
    for (const [k] of this.entries(order)) yield k;
  }

  /**
   * Iterate values in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *values(order = 'MRU') {
    for (const [, v] of this.entries(order)) yield v;
  }
}