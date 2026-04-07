let b, v;
function V() {
  return b !== void 0 ? b === !1 ? null : b : typeof TextEncoder < "u" ? (b = new TextEncoder(), b) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (b = { encode: (h) => new Uint8Array(Buffer.from(h)) }, b) : (b = !1, null);
}
function G() {
  return v !== void 0 ? v === !1 ? null : v : typeof TextDecoder < "u" ? (v = new TextDecoder(), v) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (v = { decode: (h) => Buffer.from(h).toString("utf8") }, v) : (v = !1, null);
}
const S = (h) => {
  if (h instanceof Uint8Array) return h;
  if (ArrayBuffer.isView(h)) return new Uint8Array(h.buffer, h.byteOffset, h.byteLength);
  if (h instanceof ArrayBuffer) return new Uint8Array(h);
  const e = JSON.stringify(h), n = V();
  if (n && typeof n.encode == "function") return n.encode(e);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, M = (h) => {
  let e;
  if (h instanceof Uint8Array) e = h;
  else if (ArrayBuffer.isView(h)) e = new Uint8Array(h.buffer, h.byteOffset, h.byteLength);
  else if (h instanceof ArrayBuffer) e = new Uint8Array(h);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(h))
    e = new Uint8Array(h);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  const n = G();
  if (n && typeof n.decode == "function") return JSON.parse(n.decode(e));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(e));
  throw new Error("No TextDecoder or Buffer available to decode object");
};
class A {
  /**
   * Create a PowerCache.
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
   * @param {boolean} [options.eagerCleanupOnRead=false] If true, `peek()` and `has()` will eagerly remove expired nodes when observed.
   */
  constructor({
    maxEntries: e = 1 / 0,
    maxWeight: n = 1 / 0,
    weightFn: t = () => 1,
    defaultTTL: r = 6e4,
    maxPoolSize: i = 1e3,
    rejectOversized: o = !1,
    onEvict: a = null,
    onExpire: s = null,
    initialPoolSize: l = 0,
    maxCleanupPerTick: c = 100,
    eagerCleanupOnRead: u = !1
  } = {}) {
    this.maxEntries = e, this.maxWeight = n, this.weightFn = t, this.defaultTTL = r, this.maxPoolSize = i, this.rejectOversized = !!o, this.onEvict = typeof a == "function" ? a : null, this.onExpire = typeof s == "function" ? s : null, this.maxCleanupPerTick = Number.isFinite(+c) ? Math.max(1, +c) : 100, this.eagerCleanupOnRead = !!u, this.map = /* @__PURE__ */ new Map(), this.head = null, this.tail = null, this.pool = [];
    for (let f = 0; f < Math.min(l || 0, this.maxPoolSize); f++)
      this.pool.push({ key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null });
    this.currentWeight = 0, this.hits = 0, this.misses = 0, this.evictions = 0, this.rejected = 0, this.expirations = 0, this._cleanupTimer = null, this._cleanupRunning = !1, this._cleanupParams = null, this._cleanupCursor = null, this._cleanupCursorValid = !1, this._inflightPromises = /* @__PURE__ */ new Map();
  }
  /**
   * Allocate a pool node or create a new one.
   *
   * This helper either reuses a node from the internal `pool` or creates a
   * fresh node object. The returned node is initialized with the provided
   * key/value/weight/expiresAt and has its `prev`/`next` pointers nulled.
   *
   * @private
   * @param {*} key
   * @param {*} value
   * @param {number} weight
   * @param {number} expiresAt
   * @returns {CacheNode}
   */
  _allocNode(e, n, t, r) {
    const i = this.pool.pop() || {
      key: null,
      value: null,
      weight: 0,
      expiresAt: 0,
      prev: null,
      next: null
    };
    return i.key = e, i.value = n, i.weight = t || 0, i.expiresAt = r || 0, i.prev = null, i.next = null, i;
  }
  /**
   * Reset and return a node to the pool for reuse.
   *
   * This helper clears the node fields and returns it to the node pool when
   * the pool has capacity. It is called for evicted or deleted nodes to
   * reduce allocation churn.
   *
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _freeNode(e) {
    e.key = null, e.value = null, e.weight = 0, e.expiresAt = 0, e.prev = null, e.next = null, this.pool.length < this.maxPoolSize && this.pool.push(e);
  }
  /**
   * Remove a node that has expired.
   *
   * Performs map deletion, linked-list unlink, invokes `onExpire`, returns the
   * node to the pool, and updates bookkeeping counters (`misses` and
   * `expirations`). This helper is called from several expiration paths and
   * centralizes the necessary cleanup steps.
   *
   * @private
   * @param {CacheNode} node
   * @param {number} now - Current timestamp (ms) used for comparisons
   * @param {boolean} [countMiss=false] - When true, increment the `misses` counter for user-facing lookups.
   */
  _removeExpiredNode(e, n, t = !1) {
    if (!e || !e.expiresAt || e.expiresAt > n) return !1;
    const r = e.key, i = e.value, o = e.next;
    this.map.delete(r), this.currentWeight -= e.weight || 0, this._cleanupCursor === e && (this._cleanupCursor = o), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e);
    try {
      this.onExpire && this.onExpire(r, i);
    } catch {
    }
    return this._freeNode(e), t && this.misses++, this.expirations++, !0;
  }
  /**
   * Fetch a node and validate expiry.
   * @private
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @param {boolean} [options.countMiss=false]
   * @returns {CacheNode|null}
   */
  _fetchValidNode(e, { ignoreExpiry: n = !1, countMiss: t = !1, allowExpired: r = !1 } = {}) {
    const i = this.map.get(e);
    return i ? !n && i.expiresAt && i.expiresAt <= Date.now() ? r ? i : (this._removeExpiredNode(i, Date.now(), t), null) : i : (t && this.misses++, null);
  }
  /**
   * Start a background refresh for an expired entry.
   *
   * If a refresh is already in flight for the key, this helper does nothing.
   * The refreshed value is written back to cache when the factory resolves.
   * Errors are swallowed so the stale value remains available.
   *
   * @private
   * @param {*} key
   * @param {Function} factory
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @returns {void}
   */
  _refreshStaleEntry(e, n, { ttl: t = void 0, weight: r = void 0 } = {}) {
    if (this._inflightPromises.has(e)) return;
    let i;
    try {
      i = Promise.resolve().then(() => n());
    } catch {
      return;
    }
    const o = i.then(
      (a) => {
        try {
          this.set(e, a, { ttl: t, weight: r });
        } catch {
        }
        return this._inflightPromises.delete(e), a;
      },
      (a) => {
        this._inflightPromises.delete(e);
      }
    );
    this._inflightPromises.set(e, o);
  }
  /**
   * Append a node to the tail (mark it most-recently used).
   * This updates the linked-list pointers appropriately and is used when
   * inserting new nodes or promoting a node to MRU.
   *
   * @private
   * @param {CacheNode} node - Node to append at the tail.
   * @returns {void}
   */
  _append(e) {
    if (!this.tail) {
      this.head = this.tail = e;
      return;
    }
    e.prev = this.tail, e.next = null, this.tail.next = e, this.tail = e;
  }
  /**
   * Remove a node from the linked list without freeing it. The node's
   * `prev`/`next` references are updated on neighbors and the node's links
   * are nulled. Does not modify `this.map` or bookkeeping counters; callers
   * are responsible for those actions.
   *
   * @private
   * @param {CacheNode} node - Node to unlink from the list.
   * @returns {void}
   */
  _remove(e) {
    const n = e.prev, t = e.next;
    n ? n.next = t : this.head = t, t ? t.prev = n : this.tail = n, e.prev = e.next = null;
  }
  /**
   * Move an existing node to the tail (mark as most-recently used).
   * Implemented as an unlink followed by an append. No-op when node is
   * already the tail.
   *
   * @private
   * @param {CacheNode} node - Node to promote to MRU position.
   * @returns {void}
   */
  _moveToTail(e) {
    this.tail !== e && (this._remove(e), this._append(e));
  }
  /**
   * Evict nodes from the head (least-recently used) until the cache
   * satisfies both `maxEntries` and `maxWeight` constraints. For each
   * evicted node `onEvict` is invoked if provided and the node is returned
   * to the node pool via `_freeNode`.
   *
   * @private
   * @returns {void}
   */
  _evictIfNeeded() {
    for (; this.map.size > this.maxEntries || this.currentWeight > this.maxWeight; ) {
      const e = this.head;
      if (!e) break;
      const n = e.next, t = e.key, r = e.value;
      this._cleanupCursor === e && (this._cleanupCursor = n), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e), this.map.delete(t), this.currentWeight -= e.weight || 0, this.evictions++;
      try {
        this.onEvict && this.onEvict(t, r, "evicted");
      } catch {
      }
      this._freeNode(e);
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
  set(e, n, { ttl: t = this.defaultTTL, weight: r = null } = {}) {
    const i = Date.now(), o = t == null || t === 1 / 0 ? 0 : i + t;
    let a;
    if (r != null)
      a = r;
    else {
      try {
        a = this.weightFn(n);
      } catch {
        a = 0;
      }
      a == null && (a = 0);
    }
    const s = Number.isFinite(+a) ? Math.max(0, +a) : 0;
    if (this.rejectOversized && Number.isFinite(this.maxWeight) && s > this.maxWeight) {
      this.rejected++;
      try {
        this.onEvict && this.onEvict(e, n, "rejected-oversized");
      } catch {
      }
      return !1;
    }
    if (this.map.has(e)) {
      const l = this.map.get(e);
      this.currentWeight -= l.weight || 0, l.value = n, l.weight = s, l.expiresAt = o, this.currentWeight += l.weight || 0, this._moveToTail(l);
    } else {
      const l = this._allocNode(e, n, s, o);
      this.map.set(e, l), this._append(l), this.currentWeight += l.weight || 0, this._evictIfNeeded();
    }
    return this;
  }
  /**
   * Retrieve a value and mark it as recently used.
   * @param {*} key
   * @returns {*|undefined} The stored value or `undefined` if missing/expired.
   */
  get(e) {
    const n = this._fetchValidNode(e, { countMiss: !0 });
    if (n)
      return this._moveToTail(n), this.hits++, n.value;
  }
  /**
   * Get a value without updating recency.
   * Returns `undefined` for missing or expired entries.
   * @param {*} key
   * @returns {*|undefined}
   */
  peek(e) {
    const n = this._fetchValidNode(e);
    return n ? n.value : void 0;
  }
  /**
   * Check membership without affecting recency.
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false] If true, consider expired entries as present.
   * @returns {boolean}
   */
  has(e, { ignoreExpiry: n = !1 } = {}) {
    return !!this._fetchValidNode(e, { ignoreExpiry: n });
  }
  /**
   * Atomically read-or-compute a value for `key`.
   * If the key is present and not expired the stored value is returned.
   * Otherwise `factory` is invoked to produce the value which is stored
   * in the cache and returned. `factory` may be a value (in which case it
   * is stored directly) or a function. If the function returns a Promise,
   * the Promise is returned and the resolved value is stored when it settles.
   *
   * Note: this method does not deduplicate concurrent async factories —
   * for async factories prefer `getOrSetAsync` or use
   * `PowerMemoizer` for inflight deduplication.
   *
   * @param {*} key
   * @param {Function|*} factory - Function that produces the value or a direct value.
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @param {boolean} [options.staleWhileRevalidate=false] If true, return an expired value immediately and refresh the cache in the background.
   * @returns {*|Promise<*>}
   */
  getOrSet(e, n, { ttl: t = void 0, weight: r = void 0, staleWhileRevalidate: i = !1 } = {}) {
    const o = Date.now(), a = this._fetchValidNode(e, {
      countMiss: !1,
      allowExpired: i
    });
    if (a)
      if (a.expiresAt && a.expiresAt <= o) {
        if (typeof n == "function")
          return this._moveToTail(a), this.hits++, this._refreshStaleEntry(e, n, { ttl: t, weight: r }), a.value;
        this._removeExpiredNode(a, o, !0);
      } else
        return this._moveToTail(a), this.hits++, a.value;
    else
      this.misses++;
    if (typeof n == "function") {
      const s = n();
      return s && typeof s.then == "function" ? s.then((l) => {
        try {
          this.set(e, l, { ttl: t, weight: r });
        } catch {
        }
        return l;
      }) : (this.set(e, s, { ttl: t, weight: r }), s);
    }
    return this.set(e, n, { ttl: t, weight: r }), n;
  }
  /**
   * Bulk set multiple entries. Accepts an iterable/array of [key, value] pairs.
   * Computes weight once per value and applies a single eviction pass at the end.
   * @param {Iterable<[*,*]>} entries
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @returns {this}
   */
  setMany(e, { ttl: n = void 0, weight: t = void 0 } = {}) {
    const r = Date.now(), i = n == null || n === 1 / 0 ? 0 : r + n;
    for (const o of e) {
      if (!o) continue;
      const [a, s] = o;
      let l;
      if (t != null) l = t;
      else {
        try {
          l = this.weightFn(s);
        } catch {
          l = 0;
        }
        l == null && (l = 0);
      }
      const c = Number.isFinite(+l) ? Math.max(0, +l) : 0;
      if (this.map.has(a)) {
        const u = this.map.get(a);
        this.currentWeight -= u.weight || 0, u.value = s, u.weight = c, u.expiresAt = i, this.currentWeight += u.weight || 0, this._moveToTail(u);
      } else {
        const u = this._allocNode(a, s, c, i);
        this.map.set(a, u), this._append(u), this.currentWeight += u.weight || 0;
      }
    }
    return this._evictIfNeeded(), this;
  }
  /**
   * Bulk get multiple keys. Returns a Map of found entries.
   * @param {Iterable<*>} keys
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @returns {Map}
   */
  getMany(e, { ignoreExpiry: n = !1 } = {}) {
    const t = /* @__PURE__ */ new Map();
    for (const r of e) {
      const i = this._fetchValidNode(r, { ignoreExpiry: n, countMiss: !0 });
      i && (this._moveToTail(i), this.hits++, t.set(r, i.value));
    }
    return t;
  }
  /**
   * Touch an entry: update its recency and optionally refresh TTL without
   * reading or modifying the stored value.
   * @param {*} key
   * @param {number} [ttl] - Optional per-call TTL in ms. Use `null`/`Infinity` to disable expiry.
   * @returns {boolean} True if the entry existed (and was not expired), false otherwise.
   */
  touch(e, n = void 0) {
    const t = this._fetchValidNode(e);
    if (!t) return !1;
    const r = Date.now();
    return n !== void 0 && (t.expiresAt = n == null || n === 1 / 0 ? 0 : r + n), this._moveToTail(t), !0;
  }
  /**
   * Async read-or-compute with inflight deduplication.
   * If a factory is already running for `key`, returns the same Promise.
   * Otherwise invokes `asyncFactory` and stores the resolved value in cache.
   * @param {*} key
   * @param {Function} asyncFactory - Function returning a Promise or value.
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @param {boolean} [options.staleWhileRevalidate=false] If true, return an expired value immediately and refresh the cache in the background.
   * @returns {Promise<*>}
   */
  getOrSetAsync(e, n, { ttl: t = void 0, weight: r = void 0, staleWhileRevalidate: i = !1 } = {}) {
    if (typeof n != "function")
      return Promise.resolve(this.getOrSet(e, n, { ttl: t, weight: r }));
    const o = Date.now(), a = this.map.get(e);
    if (a)
      if (a.expiresAt && a.expiresAt <= o) {
        if (i)
          return this._moveToTail(a), this.hits++, this._refreshStaleEntry(e, n, { ttl: t, weight: r }), Promise.resolve(a.value);
        this._removeExpiredNode(a, o, !1);
      } else
        return this._moveToTail(a), this.hits++, Promise.resolve(a.value);
    if (this._inflightPromises.has(e)) return this._inflightPromises.get(e);
    this.misses++;
    let s;
    try {
      s = Promise.resolve().then(() => n());
    } catch (c) {
      return Promise.reject(c);
    }
    const l = s.then(
      (c) => {
        try {
          this.set(e, c, { ttl: t, weight: r });
        } catch {
        }
        return this._inflightPromises.delete(e), c;
      },
      (c) => {
        throw this._inflightPromises.delete(e), c;
      }
    );
    return this._inflightPromises.set(e, l), l;
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
   * @param {WeakMap} [options.seen] Optional reusable `seen` WeakMap for callers that
   *        perform many deep-equality checks and want to avoid per-call allocations.
   * @returns {boolean}
   */
  hasEqual(e, n, { ignoreExpiry: t = !1, seen: r = void 0 } = {}) {
    const i = this._fetchValidNode(e, { ignoreExpiry: t });
    if (!i) return !1;
    const o = i.value;
    return o === n ? !0 : typeof o !== "object" || o === null || typeof n !== "object" || n === null ? o === n : k(o, n, r);
  }
  /**
   * Variant accepting an explicit `seen` WeakMap for reuse across many checks.
   * @param {*} key
   * @param {*} value
   * @param {WeakMap} seen
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @returns {boolean}
   */
  hasEqualWithSeen(e, n, t, { ignoreExpiry: r = !1 } = {}) {
    return this.hasEqual(e, n, { ignoreExpiry: r, seen: t });
  }
  /**
   * Delete an entry from the cache.
   * @param {*} key
   * @returns {boolean} true if the key was removed.
   */
  delete(e) {
    const n = this.map.get(e);
    if (!n) return !1;
    const t = n.next;
    this.map.delete(e), this.currentWeight -= n.weight || 0, this._cleanupCursor === n && (this._cleanupCursor = t), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(n);
    try {
      this.onEvict && this.onEvict(n.key, n.value, "deleted");
    } catch {
    }
    return this._freeNode(n), !0;
  }
  /**
   * Clear the cache and return nodes to the pool.
   * @returns {void}
   */
  clear() {
    for (let e = this.head; e; ) {
      const n = e.next;
      this._freeNode(e), e = n;
    }
    this.head = this.tail = null, this.map.clear(), this.currentWeight = 0, this._cleanupCursor = null, this._cleanupCursorValid = !1;
  }
  /**
   * Remove expired entries by scanning from least-recently used to most.
   * @returns {void}
   */
  cleanupExpired() {
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
  cleanupExpiredUpTo(e = 1 / 0) {
    const n = Date.now();
    let t = 0, r = this._cleanupCursor && this._cleanupCursorValid ? this._cleanupCursor : this.head;
    for (; r && t < e; ) {
      const i = r.next;
      if (r.expiresAt && r.expiresAt <= n) {
        const o = r.key, a = r.value;
        this.map.delete(o), this.currentWeight -= r.weight || 0, this._cleanupCursor === r && (this._cleanupCursor = i), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(r);
        try {
          this.onExpire && this.onExpire(o, a);
        } catch {
        }
        this._freeNode(r), this.expirations++;
      }
      r = i, t++;
    }
    return this._cleanupCursor = r || this.head, this._cleanupCursorValid = !!this._cleanupCursor, t;
  }
  /**
   * Start periodic, non-blocking cleanup.
   * Accepts either a numeric interval (ms) or an options object `{ interval, maxCleanupPerTick }`.
   * The loop is implemented with `setTimeout` and scans up to `maxCleanupPerTick` nodes per pass
   * to avoid long event-loop stalls.
   * Note: call `stopCleanup()` to stop the periodic timer (for example, on application shutdown)
   * to ensure the internal timer is cleared and resources can be reclaimed.
   * @param {number|Object} [intervalOrOptions]
   * @param {number} [intervalOrOptions.interval] Interval between cleanup passes in ms.
   * @param {number} [intervalOrOptions.maxCleanupPerTick] Max nodes to scan per pass.
   * @returns {void}
   */
  startCleanup(e = {}) {
    let n, t;
    typeof e == "number" ? (n = e, t = this.maxCleanupPerTick) : (n = Number.isFinite(+e.interval) ? +e.interval : Math.max(1e3, Math.min(this.defaultTTL || 6e4, 6e4)), t = Number.isFinite(+e.maxCleanupPerTick) ? Math.max(1, +e.maxCleanupPerTick) : this.maxCleanupPerTick), this.stopCleanup(), this._cleanupParams = { interval: n, maxCleanupPerTick: t }, this._cleanupTimer = setTimeout(() => this._cleanupTick(), n);
  }
  /**
   * Stop periodic cleanup.
   * @returns {void}
   */
  stopCleanup() {
    this._cleanupTimer && (clearTimeout(this._cleanupTimer), this._cleanupTimer = null), this._cleanupRunning = !1, this._cleanupParams = null;
  }
  /**
   * Synchronous disposal hook (TC39 Explicit Resource Management).
   * Stops any background cleanup and clears the cache.
   */
  [Symbol.dispose]() {
    try {
      this.stopCleanup();
    } catch {
    }
    try {
      this.clear();
    } catch {
    }
  }
  /**
   * Asynchronous disposal hook. Provided for symmetry with `using`/`await using`.
   * Cache cleanup is synchronous so this simply performs the same actions and
   * returns a resolved Promise for await compatibility.
   */
  async [Symbol.asyncDispose]() {
    try {
      this.stopCleanup();
    } catch {
    }
    try {
      this.clear();
    } catch {
    }
  }
  /**
   * Prototype tick used by the cleanup timer loop. Separated to avoid
   * allocating a per-call closure inside `startCleanup()`.
   * @private
   */
  _cleanupTick() {
    if (this._cleanupTimer != null) {
      if (this._cleanupRunning) {
        this._cleanupTimer = setTimeout(() => this._cleanupTick(), this._cleanupParams.interval);
        return;
      }
      this._cleanupRunning = !0;
      try {
        this.cleanupExpiredUpTo(this._cleanupParams.maxCleanupPerTick);
      } finally {
        this._cleanupRunning = !1;
      }
      this._cleanupTimer = setTimeout(() => this._cleanupTick(), this._cleanupParams.interval);
    }
  }
  /**
   * Current number of entries in cache.
   * @returns {number}
   */
  get size() {
    return this.map.size;
  }
  /**
   * Hit rate as a fraction (hits / (hits + misses)).
   * @returns {number}
   */
  get hitRate() {
    const e = (this.hits || 0) + (this.misses || 0);
    return e ? this.hits / e : 0;
  }
  /**
   * Return runtime statistics for the cache.
   * @returns {{size:number, weight:number, hits:number, misses:number, evictions:number, rejected:number, poolSize:number}}
   */
  stats() {
    return {
      size: this.size,
      weight: this.currentWeight,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expirations: this.expirations,
      rejected: this.rejected,
      poolSize: this.pool.length
    };
  }
  /**
   * Resize the cache limits and evict if necessary.
   * @param {Object} options
   * @param {number} [options.maxEntries]
   * @param {number} [options.maxWeight]
   */
  resize({ maxEntries: e, maxWeight: n } = {}) {
    Number.isFinite(+e) && (this.maxEntries = Math.max(0, +e)), Number.isFinite(+n) && (this.maxWeight = Math.max(0, +n)), this._evictIfNeeded();
  }
  /**
   * Iterate entries in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   * @returns {IterableIterator<[*,*]>}
   */
  *entries(e = "MRU") {
    if (e === "MRU")
      for (let n = this.tail; n; n = n.prev) yield [n.key, n.value];
    else
      for (let n = this.head; n; n = n.next) yield [n.key, n.value];
  }
  [Symbol.iterator]() {
    return this.entries("MRU");
  }
  /**
   * Iterate keys in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *keys(e = "MRU") {
    for (const [n] of this.entries(e)) yield n;
  }
  /**
   * Iterate values in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *values(e = "MRU") {
    for (const [, n] of this.entries(e)) yield n;
  }
}
function k(h, e, n = void 0) {
  if (h === e) return !0;
  if (h == null || e == null || typeof h !== "object" || typeof e !== "object") return h === e;
  n || (n = /* @__PURE__ */ new WeakMap());
  let i = n.get(h);
  if (i && i.has(e)) return !0;
  if (i || (i = /* @__PURE__ */ new WeakSet(), n.set(h, i)), i.add(e), Object.getPrototypeOf(h) !== Object.getPrototypeOf(e)) return !1;
  if (typeof Uint8Array < "u" && h instanceof Uint8Array) {
    if (!(e instanceof Uint8Array) || h.length !== e.length) return !1;
    for (let s = 0; s < h.length; s++) if (h[s] !== e[s]) return !1;
    return !0;
  }
  if (Array.isArray(h)) {
    if (!Array.isArray(e) || h.length !== e.length) return !1;
    for (let s = 0; s < h.length; s++) if (!k(h[s], e[s], n)) return !1;
    return !0;
  }
  if (ArrayBuffer.isView(h)) {
    if (!ArrayBuffer.isView(e) || h.byteLength !== e.byteLength) return !1;
    const s = new Uint8Array(h.buffer, h.byteOffset || 0, h.byteLength), l = new Uint8Array(e.buffer, e.byteOffset || 0, e.byteLength);
    for (let c = 0; c < s.length; c++) if (s[c] !== l[c]) return !1;
    return !0;
  }
  if (h instanceof ArrayBuffer) {
    if (!(e instanceof ArrayBuffer) || h.byteLength !== e.byteLength) return !1;
    const s = new Uint8Array(h), l = new Uint8Array(e);
    for (let c = 0; c < s.length; c++) if (s[c] !== l[c]) return !1;
    return !0;
  }
  if (h instanceof Date)
    return e instanceof Date ? h.getTime() === e.getTime() : !1;
  if (h instanceof RegExp)
    return e instanceof RegExp ? h.toString() === e.toString() : !1;
  if (h instanceof Map) {
    if (!(e instanceof Map) || h.size !== e.size) return !1;
    for (const [s, l] of h)
      if (!e.has(s) || !k(l, e.get(s), n)) return !1;
    return !0;
  }
  if (h instanceof Set) {
    if (!(e instanceof Set) || h.size !== e.size) return !1;
    let s = !0;
    for (const l of h)
      if (l !== null && typeof l == "object") {
        s = !1;
        break;
      }
    if (s) {
      for (const l of h) if (!e.has(l)) return !1;
      return !0;
    }
    for (const l of h) {
      let c = !1;
      for (const u of e)
        if (k(l, u, n)) {
          c = !0;
          break;
        }
      if (!c) return !1;
    }
    return !0;
  }
  const o = Object.keys(h), a = Object.keys(e);
  if (o.length !== a.length) return !1;
  for (let s = 0; s < o.length; s++) {
    const l = o[s];
    if (!Object.prototype.hasOwnProperty.call(e, l) || !k(h[l], e[l], n)) return !1;
  }
  return !0;
}
let E = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function")
  try {
    const h = Number(process.hrtime.bigint() / 1000000n);
    E = Date.now() - h;
  } catch {
    E = null;
  }
const _ = () => {
  const h = Date.now();
  if (typeof performance < "u" && typeof performance.now == "function" && typeof performance.timeOrigin == "number")
    try {
      const e = performance.timeOrigin + performance.now();
      return Math.abs(e - h) < 1e3 ? e : h;
    } catch {
    }
  if (E != null)
    try {
      const e = Number(process.hrtime.bigint() / 1000000n) + E;
      return Math.abs(e - h) < 1e3 ? e : h;
    } catch {
      return h;
    }
  return h;
};
class T {
  /**
   * @typedef {Object} PowerQueueOptions
   * @property {number} [initialCapacity]
   */
  /**
   * Create a PowerQueue.
   * @param {number} [initialCapacity=16] Initial capacity (rounded up to power-of-two).
   */
  constructor(e = 16) {
    const n = Math.max(2, Number(e) || 16);
    for (this._capacity = 1; this._capacity < n; ) this._capacity <<= 1;
    this._mask = this._capacity - 1, this._buffer = new Array(this._capacity), this._head = 0, this._tail = 0, this._size = 0;
  }
  /**
   * Enqueue an item at the tail.
   * @param {any} item Item to enqueue.
   * @returns {number} New queue length after push.
   */
  push(e) {
    return this._size === this._capacity && this._grow(), this._buffer[this._tail] = e, this._tail = this._tail + 1 & this._mask, this._size++, this._size;
  }
  /**
   * Dequeue and return the head item.
   * @returns {any|undefined} The dequeued item or `undefined` when empty.
   */
  shift() {
    if (this._size === 0) return;
    const e = this._buffer[this._head];
    return this._buffer[this._head] = void 0, this._head = this._head + 1 & this._mask, this._size--, e;
  }
  /**
   * Peek at the head item without removing it.
   * @returns {any|undefined} The head item or `undefined` when empty.
   */
  peek() {
    return this._size === 0 ? void 0 : this._buffer[this._head];
  }
  /**
   * Remove all items from the queue.
   * @returns {void}
   */
  clear() {
    if (this._size === 0) return;
    let e = this._head;
    for (let n = 0; n < this._size; n++)
      this._buffer[e] = void 0, e = e + 1 & this._mask;
    this._head = this._tail = 0, this._size = 0;
  }
  get length() {
    return this._size;
  }
  get capacity() {
    return this._capacity;
  }
  get isEmpty() {
    return this._size === 0;
  }
  /**
   * Iterator (non-destructive) yielding items in FIFO order.
   * Allows `for...of` and spread (`[...queue]`) without consuming the queue.
   */
  *[Symbol.iterator]() {
    let e = this._head;
    for (let n = 0; n < this._size; n++)
      yield this._buffer[e + n & this._mask];
  }
  /**
   * Return an iterator of values (alias of the default iterator).
   * @returns {Iterator<any>}
   */
  values() {
    return this[Symbol.iterator]();
  }
  /**
   * Return an iterator of keys (zero-based indexes from the head).
   * @returns {Iterator<number>}
   */
  *keys() {
    for (let e = 0; e < this._size; e++) yield e;
  }
  /**
   * Non-destructive entries iterator that yields [index, value] pairs where
   * index is the zero-based position in the queue (0 is the head).
   * @returns {Iterator<[number, any]>}
   */
  *entries() {
    for (let e = 0; e < this._size; e++)
      yield [e, this._buffer[this._head + e & this._mask]];
  }
  /**
   * Consuming drain iterator: yields items in FIFO order and removes them
   * from the queue as they are iterated.
   * Useful for streaming/processing and emptying the queue without manual loops.
   * @returns {Iterator<any>}
   */
  *drain() {
    for (; this._size > 0; )
      yield this.shift();
  }
  /**
   * Return a shallow array snapshot of the queue contents in FIFO order.
   * This is a convenience helper that does not consume the queue.
   * @returns {Array<any>}
   */
  toArray() {
    const e = new Array(this._size);
    for (let n = 0; n < this._size; n++)
      e[n] = this._buffer[this._head + n & this._mask];
    return e;
  }
  /**
   * Internal: double internal buffer capacity and reindex elements.
   *
   * This private helper allocates a new backing array with double the
   * previous capacity, copies items in logical order starting from `this._head`,
   * and resets internal indices so the queue remains contiguous.
   *
   * @private
   * @returns {void}
   */
  _grow() {
    const e = this._buffer, t = this._capacity << 1, r = new Array(t);
    for (let i = 0; i < this._size; i++)
      r[i] = e[this._head + i & this._mask];
    this._buffer = r, this._capacity = t, this._mask = t - 1, this._head = 0, this._tail = this._size & this._mask;
  }
  /**
   * Enqueue multiple items in one call. Optimized to resize buffer once and
   * copy items in contiguous blocks when possible.
   * @param {Array<any>} items
   * @returns {number} New queue length after all pushes.
   */
  pushMany(e) {
    if (!Array.isArray(e) || e.length === 0) return this._size;
    const n = this._size + e.length;
    for (; this._capacity < n; ) this._grow();
    const t = Math.min(e.length, this._capacity - this._tail);
    for (let i = 0; i < t; i++)
      this._buffer[this._tail + i] = e[i];
    this._tail = this._tail + t & this._mask;
    let r = t;
    for (; r < e.length; ) {
      const i = Math.min(e.length - r, this._capacity - this._tail);
      for (let o = 0; o < i; o++)
        this._buffer[this._tail + o] = e[r + o];
      this._tail = this._tail + i & this._mask, r += i;
    }
    return this._size = n, this._size;
  }
  /**
   * Prepend multiple items to the head of the queue.
   * The first element of `items` will become the next value returned by `shift()`.
   * @param {Array<any>} items
   * @returns {number} New queue length after all unshifts.
   */
  unshiftMany(e) {
    if (!Array.isArray(e) || e.length === 0) return this._size;
    const n = this._size + e.length;
    for (; this._capacity < n; ) this._grow();
    let t = this._head - e.length & this._mask;
    for (let r = 0; r < e.length; r++)
      this._buffer[t + r & this._mask] = e[r];
    return this._head = t, this._size = n, this._size;
  }
}
function $(h, e = "ERR_ITEM") {
  return !h || typeof h != "object" ? {
    error: !0,
    code: e,
    message: h ? String(h) : void 0,
    stack: void 0
  } : {
    error: !0,
    code: h.code || e,
    message: h.message,
    stack: h.stack
  };
}
function C(h) {
  return !h || !h.error ? String(h) : `${h.code || "ERR"}: ${h.message || ""}`;
}
class K {
  /**
   * Create a PowerLogger instance.
   * @param {number} [level=0] Initial debug level (0..3)
   * @param {Object} [options]
   * @param {'text'|'json'} [options.format='text'] Output format. When 'json', logger emits JSON.stringify({ level, msg, ts, format, name }).
   */
  constructor(e = 0, n = {}) {
    this._debugLevel = 0, this._counters = /* @__PURE__ */ Object.create(null), this._format = n && n.format || "text", this.name = n && n.name || null, this._formatter = n && typeof n.formatter == "function" ? n.formatter : null, this._output = n && typeof n.output == "function" ? n.output : null, this.setDebugLevel(e);
  }
  /**
   * Set the global debug level.
   * @param {number} level - Integer in range 0..3
   * @returns {void}
   */
  setDebugLevel(e) {
    let n = NaN;
    typeof e == "number" ? n = e : typeof e == "string" || typeof e == "boolean" ? n = Number(e) : (e instanceof Number || e instanceof String || e instanceof Boolean) && (n = Number(e.valueOf())), this._debugLevel = Number.isFinite(n) && n >= 0 ? Math.max(0, Math.min(3, Math.floor(n))) : 0;
  }
  /**
   * Get the current debug level.
   * @returns {number} The configured debug level (0..3)
   */
  getDebugLevel() {
    return this._debugLevel;
  }
  /**
   * Determine whether the current debug level is >= `level`.
   * @param {number} [level=1]
   * @returns {boolean}
   */
  isDebugLevel(e = 1) {
    return Number(this._debugLevel) >= Number(e || 1);
  }
  /**
   * Convenience: whether any debugging is enabled (level > 0).
   * @returns {boolean}
   */
  isDebug() {
    return this.isDebugLevel(1);
  }
  /**
   * Normalize log arguments by lazily evaluating function values.
   * @private
   * @param {any[]} args
   * @returns {any[]}
   */
  _resolveLogArgs(e) {
    return e.map((n) => {
      if (typeof n == "function")
        try {
          return n();
        } catch (t) {
          return t;
        }
      return n;
    });
  }
  /**
   * Internal helper to emit logs with unified JSON/text formatting.
   * @private
   * @param {number} threshold - minimum debug level required to emit
   * @param {string} consoleMethod - name of console method to call (error, warn, info, log, debug)
   * @param {string} levelLabel - textual level label for JSON mode
   * @param {any[]} args - original arguments array
   */
  _emit(e, n, t, r, i = {}) {
    if (!this.isDebugLevel(e)) return;
    const o = this._resolveLogArgs(r), a = i.msgArray ? o : o.length === 1 ? o[0] : o;
    let s = { level: t, msg: a, ts: _(), format: this._format };
    if (this.name && (s.name = this.name), this._formatter)
      try {
        const l = this._formatter(s);
        if (l != null) {
          if (typeof l == "string") {
            if (this._output) {
              try {
                this._output(l);
              } catch {
              }
              return;
            }
            console && typeof console[n] == "function" && console[n](l);
            return;
          }
          s = l;
        }
      } catch {
      }
    if (this._output) {
      try {
        this._output(s);
      } catch {
      }
      return;
    }
    if (!(!console || typeof console[n] != "function"))
      if (this._format === "json")
        try {
          const l = typeof s == "string" ? s : JSON.stringify(s);
          console[n](l);
        } catch {
          console[n](...Array.isArray(o) ? o : [o]);
        }
      else
        console[n](...o);
  }
  /**
   * Log an error-level message when debug level is >= 1.
   * Accepts values or functions (lazy evaluated).
   * @param {...any} args
   * @returns {void}
   */
  error(...e) {
    const n = e.map((t) => {
      try {
        if (t && t.error) return C(t);
        if (t instanceof Error || t && typeof t == "object")
          return C($(t));
      } catch {
      }
      return t;
    });
    this._emit(1, "error", "error", n);
  }
  /**
   * Log a warning-level message when debug level is >= 2.
   * @param {...any} args
   * @returns {void}
   */
  warn(...e) {
    this._emit(2, "warn", "warn", e);
  }
  /**
   * Log an info-level message when debug level is >= 3.
   * @param {...any} args
   * @returns {void}
   */
  info(...e) {
    this._emit(3, "info", "info", e);
  }
  /**
   * Log a verbose message when debug level is >= 3.
   * @param {...any} args
   * @returns {void}
   */
  log(...e) {
    this._emit(3, "log", "log", e);
  }
  /**
   * Log using `console.debug` when level >= 3 (alias for verbose debug output).
   * Supports JSON mode similar to other methods.
   */
  debug(...e) {
    this._emit(3, "debug", "debug", e);
  }
  /**
   * Display tabular data. Uses `console.table` when available.
   * In JSON mode emits `{ level: 'table', msg: args, ts }` where `msg` is an array of arguments.
   */
  table(...e) {
    if (!this.isDebugLevel(3) || !console) return;
    if (this._format === "json") {
      this._emit(3, "log", "table", e, { msgArray: !0 });
      return;
    }
    const n = this._resolveLogArgs(e);
    typeof console.table == "function" ? console.table(...n) : typeof console.log == "function" && console.log(...n);
  }
  /**
   * Increment an internal named counter (no-op when debug is disabled).
   * Useful for lightweight instrumentation in tests.
   * @param {string} name
   * @returns {void}
   */
  incrementCounter(e) {
    if (!this.isDebug()) return;
    const n = String(e || "");
    n && (this._counters[n] = (this._counters[n] || 0) + 1);
  }
  /**
   * Read counters as a plain object snapshot.
   * @returns {Record<string,number>}
   */
  getDebugCounters() {
    return Object.assign({}, this._counters);
  }
  /**
   * Reset all internal counters (test helper).
   * @returns {void}
   */
  resetDebugCounters() {
    this._counters = /* @__PURE__ */ Object.create(null);
  }
}
const H = /* @__PURE__ */ Symbol("PowerSubscriberSet.original");
class x {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.weak=false]
   * @param {number} [options.maxListeners=0]
   */
  constructor(e = {}) {
    const { weak: n = !1, maxListeners: t = 0 } = e || {};
    this._weak = !!n, this._maxListeners = Number.isFinite(Number(t)) ? Math.max(0, Math.floor(Number(t))) : 0, this._listeners = /* @__PURE__ */ new Set(), this._onceMap = /* @__PURE__ */ new WeakMap(), this._finalization = null, this._weak && typeof WeakRef < "u" && typeof FinalizationRegistry < "u" && (this._finalization = new FinalizationRegistry((r) => {
      this._listeners.delete(r.ref);
    }));
  }
  /** Number of currently live listeners. */
  get size() {
    return this._cleanup(), this._listeners.size;
  }
  /** Add a listener and return an unsubscribe function. */
  add(e) {
    if (typeof e != "function") {
      if (!this._weak || !e || typeof e.deref != "function")
        throw new TypeError("listener must be a function");
      if (this._maxListeners > 0 && this.size + 1 > this._maxListeners)
        throw new Error(
          `PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`
        );
      return this._listeners.add(e), () => this.delete(e);
    }
    if (this._maxListeners > 0 && this.size + 1 > this._maxListeners)
      throw new Error(
        `PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`
      );
    const n = this._makeEntry(e);
    return this._listeners.add(n), () => this.delete(e);
  }
  /** Add a once listener and return an unsubscribe function. */
  addOnce(e) {
    if (typeof e != "function") throw new TypeError("listener must be a function");
    const n = (...r) => {
      try {
        e(...r);
      } finally {
        this.delete(e);
      }
    };
    try {
      n[H] = e;
    } catch {
    }
    if (this._onceMap.set(e, n), this._maxListeners > 0 && this.size + 1 > this._maxListeners)
      throw new Error(
        `PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`
      );
    const t = this._makeEntry(n);
    return this._listeners.add(t), () => this.delete(e);
  }
  /** Delete a listener by original function or once-wrapper. */
  delete(e) {
    let n = e;
    const t = this._onceMap.get(e);
    t && (n = t, this._onceMap.delete(e));
    for (const r of this._listeners) {
      const i = this._deref(r);
      if (!i) {
        this._listeners.delete(r);
        continue;
      }
      if (i === n)
        return this._listeners.delete(r), this._finalization && typeof r.deref == "function" && this._finalization.unregister(r), !0;
    }
    return !1;
  }
  /** Iterate live listeners in insertion order and invoke a callback. */
  forEach(e) {
    for (const n of this._listeners) {
      const t = this._deref(n);
      if (!t) {
        this._listeners.delete(n);
        continue;
      }
      e(t);
    }
  }
  /** Clear all listeners. */
  clear() {
    this._listeners.clear(), this._onceMap = /* @__PURE__ */ new WeakMap();
  }
  /** Return a safe array copy of live listeners. */
  values() {
    this._cleanup();
    const e = [];
    for (const n of this._listeners) {
      const t = this._deref(n);
      t && e.push(t);
    }
    return e;
  }
  /** Iterate live listeners in insertion order. */
  [Symbol.iterator]() {
    return this.values()[Symbol.iterator]();
  }
  /** Remove dead weak refs from the set. */
  _cleanup() {
    if (!(!this._weak || typeof WeakRef > "u"))
      for (const e of this._listeners)
        e && typeof e.deref == "function" && !e.deref() && this._listeners.delete(e);
  }
  _makeEntry(e) {
    if (this._weak && typeof WeakRef < "u") {
      const n = new WeakRef(e);
      if (this._finalization)
        try {
          this._finalization.register(e, { ref: n }, n);
        } catch {
        }
      return n;
    }
    return e;
  }
  _deref(e) {
    return e && typeof e.deref == "function" ? e.deref() : e;
  }
}
function J(h) {
  if (h) {
    if (typeof h.cleanup == "function") {
      try {
        h.cleanup();
      } catch {
      }
      return;
    }
    if (typeof h._cleanup == "function") {
      try {
        h._cleanup();
      } catch {
      }
      return;
    }
    if (typeof h[Symbol.iterator] == "function" && typeof h.delete == "function")
      for (const e of h)
        (e && typeof e.deref == "function" ? e.deref() : e) || h.delete(e);
  }
}
class I {
  /**
   * @param {{maxListeners?: number, weak?: boolean}=} options
   */
  constructor(e = {}) {
    this._listeners = /* @__PURE__ */ new Map(), this._maxListeners = Number.isFinite(Number(e.maxListeners)) ? Math.max(0, Number(e.maxListeners)) : 0, this._weak = !!e.weak, this._fr = null, this._finalizationRefs = /* @__PURE__ */ new WeakMap();
  }
  _ensureFinalizationRegistry() {
    return !this._weak || typeof FinalizationRegistry > "u" ? null : this._fr ? this._fr : (this._fr = new FinalizationRegistry((e) => {
      try {
        const { event: n, ref: t } = e, r = this._listeners.get(n);
        r && typeof r.delete == "function" && r.delete(t.deref ? t.deref() : t);
      } catch {
      }
    }), this._fr);
  }
  /**
   * Cleanup dead weak refs from internal listener sets.
   * Useful in tests or environments where FinalizationRegistry/GC is unavailable.
   */
  cleanup() {
    if (this._weak)
      for (const [e, n] of this._listeners)
        J(n), n.size === 0 && this._listeners.delete(e);
  }
  _getBucket(e) {
    let n = this._listeners.get(e);
    if (!n) return null;
    if (n instanceof x) return n;
    if (n && typeof n[Symbol.iterator] == "function") {
      const t = new x({
        maxListeners: this._maxListeners,
        weak: this._weak
      });
      for (const r of n) {
        const i = r && typeof r.deref == "function" ? r.deref() : r;
        i && t.add(i);
      }
      return this._listeners.set(e, t), t;
    }
    return null;
  }
  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {(payload:any)=>void} fn
   * @returns {() => void} unsubscribe
   */
  _registerWeakListener(e, n) {
    const t = this._ensureFinalizationRegistry();
    if (!t || typeof WeakRef > "u") return null;
    const r = new WeakRef(e);
    try {
      t.register(e, { event: n, ref: r }, r), this._finalizationRefs.set(e, r);
    } catch {
      return null;
    }
    return r;
  }
  _unregisterWeakListener(e) {
    if (!this._fr || !this._finalizationRefs.has(e)) return;
    const n = this._finalizationRefs.get(e);
    try {
      this._fr.unregister(n);
    } catch {
    }
    this._finalizationRefs.delete(e);
  }
  on(e, n) {
    if (typeof n != "function") throw new TypeError("listener must be a function");
    let t = this._getBucket(e);
    t || (t = new x({ maxListeners: this._maxListeners, weak: this._weak }), this._listeners.set(e, t));
    const r = t.add(n);
    return this._registerWeakListener(n, e) ? () => {
      r(), this._unregisterWeakListener(n);
    } : r;
  }
  /**
   * Subscribe once to an event. Listener is removed after first invocation.
   * @param {string} event
   * @param {(payload:any)=>void} fn
   * @returns {() => void} unsubscribe
   */
  once(e, n) {
    if (typeof n != "function") throw new TypeError("listener must be a function");
    let t = this._getBucket(e);
    t || (t = new x({ maxListeners: this._maxListeners, weak: this._weak }), this._listeners.set(e, t));
    const r = t.addOnce(n);
    return this._registerWeakListener(n, e) ? () => {
      r(), this._unregisterWeakListener(n);
    } : r;
  }
  /**
   * Remove a specific listener for an event.
   * @param {string} event
   * @param {(payload:any)=>void} fn
   */
  off(e, n) {
    const t = this._getBucket(e);
    t && (t.delete(n), this._unregisterWeakListener(n), t.size === 0 && this._listeners.delete(e));
  }
  /**
   * Emit an event to all subscribers. Returns true if any listeners were notified.
   * Errors thrown by listeners are swallowed.
   * @param {string} event
   * @param {any} [payload]
   * @returns {boolean}
   */
  emit(e, n) {
    const t = this._listeners.get(e);
    if (!t || t.size === 0) return !1;
    if (t instanceof x) {
      let i = !1;
      return t.forEach((o) => {
        i = !0;
        try {
          o(n);
        } catch {
        }
      }), t.size === 0 && this._listeners.delete(e), i;
    }
    const r = t.size > 0;
    for (const i of t) {
      const o = i && typeof i.deref == "function" ? i.deref() : i;
      if (!o) {
        t.delete(i);
        continue;
      }
      try {
        o(n);
      } catch {
      }
    }
    return t.size === 0 && this._listeners.delete(e), r;
  }
  /**
   * Emit an event to all subscribers and await async listeners.
   * Supports bounded concurrency so long listener lists can be processed in
   * batches without flooding the event loop.
   * Errors thrown or rejected by listeners are swallowed.
   * @param {string} event
   * @param {any} [payload]
   * @param {Object} [options]
   * @param {number} [options.concurrency=Infinity]
   * @returns {Promise<boolean>}
   */
  async emitAsync(e, n, { concurrency: t = 1 / 0 } = {}) {
    const r = this.listeners(e);
    if (r.length === 0) return !1;
    const i = Number.isFinite(+t) && +t > 0 ? Math.max(1, Math.floor(+t)) : 1 / 0, o = async (l) => {
      try {
        await l(n);
      } catch {
      }
    };
    if (!Number.isFinite(i) || i >= r.length)
      return await Promise.all(r.map(o)), !0;
    let a = 0;
    const s = Array.from({ length: i }, async () => {
      for (; a < r.length; ) {
        const l = r[a++];
        l && await o(l);
      }
    });
    return await Promise.all(s), !0;
  }
  /**
   * Return array of listeners for an event (copy).
   * @param {string} event
   * @returns {Function[]}
   */
  listeners(e) {
    const n = this._listeners.get(e);
    return n ? n instanceof x ? n.values() : Array.from(n).map((t) => t && typeof t.deref == "function" ? t.deref() : t).filter(Boolean) : [];
  }
  /**
   * Clear listeners for an event or all events when called without args.
   * @param {string} [event]
   */
  clear(e) {
    if (e === void 0) {
      this._listeners.clear();
      return;
    }
    this._listeners.delete(e);
  }
}
let Q = class {
  constructor(e, n, t) {
    this._underlying = e, this._logger = n, this._pool = t, this.onmessage = null, this.onerror = null, this.onmessageerror = null;
  }
  postMessage(e, n) {
    let t = e, r = n;
    if (e !== null && typeof e == "object" && !ArrayBuffer.isView(e) && !(e instanceof ArrayBuffer))
      try {
        const o = this._pool._encodeForTransfer(e);
        if (!r || Array.isArray(r) && r.length === 0)
          r = [o.buffer];
        else {
          let a = !1;
          if (Array.isArray(r)) {
            for (let s of r)
              if (s === o.buffer) {
                a = !0;
                break;
              }
            a || (r = [...r, o.buffer]);
          } else if (r.length === 0)
            r = [o.buffer];
          else {
            const s = [];
            for (let l of r)
              s.push(l), l === o.buffer && (a = !0);
            a || s.push(o.buffer), r = s;
          }
        }
        t = o;
      } catch {
        r = n, t = e;
      }
    !r && (t instanceof Uint8Array || ArrayBuffer.isView(t)) && (r = [t.buffer]);
    try {
      r && r.length ? this._underlying.postMessage(t, r) : this._underlying.postMessage(t);
    } catch (o) {
      throw this._logger.error(o, "Failed to postMessage to underlying worker"), o;
    }
  }
  addEventListener(...e) {
    return this._underlying.addEventListener(...e);
  }
  removeEventListener(...e) {
    return this._underlying.removeEventListener(...e);
  }
  terminate() {
    typeof this._underlying.terminate == "function" && this._underlying.terminate();
  }
};
class Y extends Error {
  constructor(e = "PowerPool has been shut down") {
    super(e), this.name = "PowerPoolShutdownError";
  }
}
class R {
  /**
   * Create a PowerPool.
   *
   * @param {Function|string} workerSource - A Worker constructor, a worker factory, or a relative path string. If the provided function is not constructable, it is invoked directly; if a string path is provided, the pool attempts to resolve it via `new URL(path, import.meta.url)` before falling back to a plain `Worker(path)`.
   * @param {PowerPoolOptions=} options
   * @param {number} [options.size] - Initial number of workers to create.
   * @param {number} [options.minSize=1] - Minimum number of workers to keep alive.
   * @param {number} [options.maxSize] - Maximum number of workers allowed in the pool. The pool coerces this value to be at least `minSize`.
   * @param {Object} [options.workerOptions] - Options forwarded to the Worker constructor when using a string path.
   * @param {number} [options.maxTasksPerWorker=Infinity] - Soft capacity per worker before considering it busy.
   * @param {number} [options.idleTimeout=60000] - Milliseconds after which idle workers (beyond `minSize`) will be terminated.
   * @param {boolean} [options.taskQueue=true] - Whether to queue tasks when all workers are busy.
   * @param {'enqueue'|'drop-oldest'|'drop-newest'|'reject'} [options.queuePolicy='enqueue'] - Queue overflow behavior when the pool is saturated.
   * @param {boolean} [options.lazy=true] - If true, defer creating workers up to `size` until demand; only `minSize` workers are created at construction.
   */
  constructor(e, n = {}) {
    const t = typeof navigator < "u" && navigator.hardwareConcurrency || 2, {
      size: r = Math.min(t, 2),
      minSize: i = 2,
      maxSize: o = Math.max(r, t),
      workerOptions: a = {},
      maxTasksPerWorker: s = 1 / 0,
      idleTimeout: l = 6e4,
      taskQueue: c = !0,
      queuePolicy: u = "enqueue",
      lazy: f = !0
    } = n;
    this._workerSource = e, this._workerOptions = a, this._maxTasksPerWorker = s, this.minSize = Math.max(0, i), this.maxSize = Math.max(this.minSize, o), this.idleTimeout = Math.max(0, l), this.taskQueueEnabled = !!c, this._queuePolicy = ["enqueue", "drop-oldest", "drop-newest", "reject"].includes(u) ? u : "enqueue", this._createdAt = _(), this._totalWorkersCreated = 0, this._totalTasksCompleted = 0, this._taskDurationsWelfordCount = 0, this._taskDurationsWelfordMean = 0, this._taskDurationsWelfordM2 = 0, this._taskDurationsMin = Number.POSITIVE_INFINITY, this._taskDurationsMax = Number.NEGATIVE_INFINITY, this._ewmaLatency = null, this._autoScale = null, this._autoScaleInterval = null, this._lastAutoScaleAt = null, this._terminatedWorkerTaskCountsTotal = 0, this._terminatedWorkerTaskCountsCount = 0, this.workers = [], this.queue = new T();
    const p = {
      maxListeners: n && (n.listenerMaxListeners ?? n.maxListeners),
      weak: n && !!n.weakListeners
    };
    this._bus = new I(p), this._queueHighThreshold = Number.isFinite(Number(n && n.queueHighThreshold)) ? Math.max(0, Math.floor(Number(n.queueHighThreshold))) : 1 / 0, this._queueHighCrossed = !1, this._onmessage = null, this._onerror = null, this._onidle = null, this._onresize = null, this._nextIndex = 0, this._nextWorkerId = 0, this._activeTasks = 0, this._isIdle = !0;
    const g = n && typeof n.debugLevel == "number" ? n.debugLevel : 1;
    this._logger = new K(g, { name: "powerPool" }), this._pendingResponses = /* @__PURE__ */ new Map(), this._underlyingToWorkerObj = /* @__PURE__ */ new Map();
    const m = f ? Math.min(this.minSize, this.maxSize) : Math.min(Math.max(r, this.minSize), this.maxSize);
    for (let d = 0; d < m; d++) this._addWorkerInstance();
    if (this._reaperInterval = setInterval(
      () => this._reapIdleWorkers(),
      Math.max(1e3, Math.floor(this.idleTimeout / 2))
    ), this._encodeCache = /* @__PURE__ */ new Map(), this._encodeCacheLimit = Math.max(
      16,
      n && n.encodeCacheLimit ? n.encodeCacheLimit : 64
    ), this._encodeCacheByteLimit = Number.isFinite(n && Number(n.encodeCacheByteLimit)) ? Math.max(0, Number(n.encodeCacheByteLimit)) : 1 / 0, this._encodeCacheBytes = 0, n && n.autoScale) {
      const d = typeof n.autoScale == "object" ? n.autoScale : {}, y = Number.isFinite(Number(d.intervalMs)) ? Math.max(100, Math.floor(d.intervalMs)) : 1e3, w = Number.isFinite(Number(d.targetMs)) ? Math.max(1, Number(d.targetMs)) : 50, W = Number.isFinite(Number(d.alpha)) ? Math.max(0, Math.min(1, Number(d.alpha))) : 0.2, P = Number.isFinite(Number(d.cooldownMs)) ? Math.max(0, Math.floor(d.cooldownMs)) : 5e3, j = Number.isFinite(Number(d.hysteresis)) ? Math.max(0, Math.min(1, Number(d.hysteresis))) : 0.2, B = Number.isFinite(Number(d.stepUp)) ? Math.max(1, Math.floor(Number(d.stepUp))) : 1, F = Number.isFinite(Number(d.stepDown)) ? Math.max(1, Math.floor(Number(d.stepDown))) : 1, U = Number.isFinite(Number(d.backoffFactor)) ? Math.max(1, Number(d.backoffFactor)) : 1, D = Number.isFinite(Number(d.backoffMaxMultiplier)) ? Math.max(1, Number(d.backoffMaxMultiplier)) : 8, q = Number.isFinite(Number(d.backoffResetMs)) ? Math.max(0, Math.floor(Number(d.backoffResetMs))) : P * 4;
      this._autoScale = {
        enabled: !0,
        intervalMs: y,
        targetMs: w,
        alpha: W,
        cooldownMs: P,
        hysteresis: j,
        stepUp: B,
        stepDown: F,
        backoffFactor: U,
        backoffMaxMultiplier: D,
        backoffResetMs: q
      }, this._autoScaleBackoffMultiplier = 1;
      try {
        this._autoScaleInterval = setInterval(() => this._autoScaleTick(), y);
      } catch {
      }
    }
  }
  /* Node crypto dynamic import removed to avoid bundler externalization. */
  /**
   * Log debug information about swallowed errors when debug logging is enabled.
   * @private
   */
  _debugLog(e, n) {
    try {
      this && this._logger && typeof this._logger.debug == "function" && (e ? this._logger.debug(e, n || "swallowed error") : this._logger.debug(n || "swallowed error"));
    } catch {
    }
  }
  /** Ensure the reaper interval exists; recreate it if missing. @private */
  _ensureReaper() {
    try {
      this._reaperInterval || (this._reaperInterval = setInterval(
        () => this._reapIdleWorkers(),
        Math.max(1e3, Math.floor(this.idleTimeout / 2))
      ));
    } catch {
    }
  }
  /**
   * Clear lifecycle timer intervals used by the pool.
   * @private
   */
  _clearLifecycleIntervals() {
    try {
      this._reaperInterval && (clearInterval(this._reaperInterval), this._reaperInterval = null);
    } catch {
    }
    try {
      this._autoScaleInterval && (clearInterval(this._autoScaleInterval), this._autoScaleInterval = null);
    } catch {
    }
  }
  /**
   * Shutdown the pool: clear timers, reject pending responses, terminate workers,
   * and clear internal queues. This is a full stop that prevents background
   * timers from keeping the process alive.
   */
  shutdown() {
    this._clearLifecycleIntervals();
    try {
      for (const [e] of this._pendingResponses)
        try {
          this._cleanupPendingResponse(e, {
            rejectWith: new Y("pool:shutdown")
          });
        } catch (n) {
          this._debugLog && this._debugLog(n, "shutdown: cleanup pending response");
        }
    } catch (e) {
      this._debugLog && this._debugLog(e, "shutdown: iterate pending responses");
    }
    try {
      for (const e of this.workers)
        try {
          e.worker.terminate();
        } catch (n) {
          this._debugLog && this._debugLog(n, "shutdown: terminate worker");
        }
    } catch (e) {
      this._debugLog && this._debugLog(e, "shutdown: terminate workers loop");
    }
    try {
      this._underlyingToWorkerObj && this._underlyingToWorkerObj.clear();
    } catch {
    }
    try {
      const e = this.workers.map((n) => n && n.id).filter((n) => n != null);
      e && e.length && this._bus.emit("pool:scale", {
        action: "remove",
        terminated: e,
        count: e.length
      });
    } catch (e) {
      this._debugLog && this._debugLog(e, "shutdown: pool scale emit error");
    }
    this.workers = [], this.queue = new T(), this._activeTasks = 0;
  }
  /**
   * Encode a plain object to a Uint8Array, using a small cache to avoid
   * repeated encoding work for identical messages. Returns a Uint8Array.
   * @private
   * @param {Object} obj
   * @returns {Uint8Array}
   */
  _encodeForTransfer(e) {
    try {
      const n = JSON.stringify(e);
      if (typeof n == "string" && n.length > 2048)
        return S(e);
      const t = this._encodeCache.get(n);
      if (t) {
        try {
          this._encodeCache.delete(n), this._encodeCache.set(n, t);
        } catch {
        }
        return t;
      }
      const r = S(e), i = r && r.byteLength || 0, o = () => this._encodeCache.size >= this._encodeCacheLimit || this._encodeCacheByteLimit !== 1 / 0 && this._encodeCacheBytes + i > this._encodeCacheByteLimit;
      for (; o(); ) {
        const a = this._encodeCache.keys().next().value;
        if (!a) break;
        try {
          const s = this._encodeCache.get(a);
          s && s.byteLength && (this._encodeCacheBytes = Math.max(0, this._encodeCacheBytes - s.byteLength));
        } catch {
        }
        this._encodeCache.delete(a);
      }
      return this._encodeCache.set(n, r), r && r.byteLength && (this._encodeCacheBytes += r.byteLength), r;
    } catch {
      return S(e);
    }
  }
  /**
   * Prepare a transferable Uint8Array for the given object.
   * Returns a new Uint8Array when `clone` is true (safe to transfer), or
   * the cached Uint8Array when `clone` is false (do not transfer the returned buffer).
   * @param {Object} obj
   * @param {{clone?:boolean}=} options
   * @returns {Uint8Array}
   */
  prepareBuffer(e, n = {}) {
    const { clone: t = !0 } = n, r = this._encodeForTransfer(e);
    return t ? r.slice() : r;
  }
  /**
   * Prepare an array of transferable buffers for a batch of items.
   * Each item may be a plain object, a TypedArray/ArrayBuffer view, or
   * an object `{ message, transfer? }`. The returned array contains
   * normalized `{ message, transfer }` entries ready for `postMessageBatch`.
   * By default each buffer is a cloned Uint8Array safe to transfer; pass
   * `{ clone: false }` to return references to internal cached buffers
   * (do NOT transfer those buffers if `clone:false`).
   *
   * @param {Array<any|{message:any,transfer?:Transferable[]}>} items
   * @param {{clone?:boolean}=} options
   * @returns {{message:*,transfer:Transferable[]|undefined}[]}
   */
  prepareBuffers(e, n = {}) {
    if (!Array.isArray(e)) throw new Error("prepareBuffers expects an array");
    const { clone: t = !0, zeroCopy: r = !1 } = n, i = new Array(e.length);
    for (let o = 0; o < e.length; o++) {
      const a = e[o] && typeof e[o] == "object" && "message" in e[o] ? e[o] : { message: e[o] }, s = a.message, l = a.transfer;
      if (l) {
        i[o] = { message: s, transfer: l };
        continue;
      }
      if (s !== null && typeof s == "object" && !ArrayBuffer.isView(s) && !(s instanceof ArrayBuffer)) {
        if (r) {
          i[o] = { message: s, transfer: void 0 };
          continue;
        }
        try {
          const u = this._encodeForTransfer(s);
          if (t) {
            const f = u.slice();
            i[o] = { message: f, transfer: [f.buffer] };
          } else
            i[o] = { message: u, transfer: void 0 };
          continue;
        } catch {
          i[o] = { message: s, transfer: void 0 };
          continue;
        }
      }
      if (s instanceof ArrayBuffer || ArrayBuffer.isView(s)) {
        const u = s instanceof ArrayBuffer ? s : s.buffer;
        i[o] = { message: s, transfer: [u] };
        continue;
      }
      i[o] = { message: s, transfer: void 0 };
    }
    return i;
  }
  /**
   * Class-level helper to prepare a message and optional transfer list for posting to a worker.
   * Accepts `opts` with `zeroCopy` flag to control forwarding of raw buffers.
   * @private
   */
  _prepareForTransfer(e, n, t) {
    const r = t && !!t.zeroCopy;
    if (e !== null && typeof e == "object" && !ArrayBuffer.isView(e) && !(e instanceof ArrayBuffer)) {
      if (r) return { message: e, transfer: n };
      try {
        const a = this._encodeForTransfer(e).slice();
        let s = n;
        if (!s || Array.isArray(s) && s.length === 0)
          s = [a.buffer];
        else if (Array.isArray(s)) {
          let l = !1;
          for (const c of s)
            if (c === a.buffer) {
              l = !0;
              break;
            }
          l || (s = [...s, a.buffer]);
        } else if (s.length === 0)
          s = [a.buffer];
        else {
          const l = [];
          let c = !1;
          for (const u of s)
            l.push(u), u === a.buffer && (c = !0);
          c || l.push(a.buffer), s = l;
        }
        return { message: a, transfer: s };
      } catch {
        return { message: e, transfer: n };
      }
    }
    return e instanceof Uint8Array || ArrayBuffer.isView(e) || e instanceof ArrayBuffer ? { message: e, transfer: [e.buffer || e] } : { message: e, transfer: n };
  }
  /**
   * Decrement the global active task counter safely.
   * Ensures the counter never goes negative and centralizes error handling.
   * @private
   * @param {number} [n=1]
   */
  _decrementActiveTasks(e = 1) {
    try {
      const n = Number.isFinite(Number(e)) ? Math.max(0, Math.floor(Number(e))) : 1;
      this._activeTasks = Math.max(0, this._activeTasks - n);
    } catch {
      this._activeTasks = 0;
    }
  }
  /**
   * Resize the pool's maximum size at runtime.
   * If `n` is smaller than the current number of workers, extra workers
   * will be terminated (keeps at least `minSize`). If `n` is larger,
   * the pool may grow up to the new limit when demand increases.
   * @param {number} n - New maximum pool size.
   */
  resize(e) {
    let n = this.minSize, t = this.maxSize;
    if (e != null && typeof e == "object")
      Number.isFinite(e.minSize) && (n = Math.max(0, Math.floor(e.minSize))), Number.isFinite(e.maxSize) && (t = Math.max(n, Math.floor(e.maxSize)));
    else {
      const o = Number(e);
      if (!Number.isFinite(o)) return;
      t = Math.max(n, Math.floor(o));
    }
    this.minSize = Math.max(0, n), this.maxSize = Math.max(this.minSize, t);
    let r = 0;
    for (; this.workers.length < this.minSize && this.workers.length < this.maxSize; )
      this._addWorkerInstance(), r++;
    const i = [];
    for (; this.workers.length > this.maxSize; ) {
      const o = this.workers.pop();
      if (o) {
        this._decrementActiveTasks(o.tasks || 0);
        try {
          o.worker.terminate();
        } catch {
        }
        this._deleteWorkerUnderlyingMapping(o), this._terminatedWorkerTaskCountsTotal += o.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1, i.push(o.id);
      }
    }
    if (i.length || r) {
      const o = {
        data: {
          type: "pool:resize",
          terminated: i,
          added: r,
          minSize: this.minSize,
          maxSize: this.maxSize
        }
      };
      if (this._onresize)
        try {
          this._onresize(o);
        } catch (a) {
          this._logger.error(a, "Pool onresize handler error");
        }
      try {
        this._bus.emit("resize", o);
      } catch (a) {
        this._logger.error(a, "pool resize listener error");
      }
      try {
        this._bus.emit("pool:scale", {
          added: r,
          terminated: i,
          minSize: this.minSize,
          maxSize: this.maxSize
        });
      } catch (a) {
        this._logger.error(a, "pool scale resize listener error");
      }
    }
    this._updateIdleState();
  }
  /**
   * Create a new worker instance using the configured source.
   *
   * This helper normalizes the configured `workerSource` which may be a
   * callable factory (constructor) or a string path. When a string path is
   * provided it attempts to resolve a `baseUrl` at runtime in a bundler-safe
   * manner and constructs a `Worker` accordingly. Throws when `workerSource`
   * is neither a function nor a string.
   *
   * @private
   * @returns {Worker|any} The underlying worker instance or factory result.
   */
  _createWorkerInstance() {
    if (typeof this._workerSource == "function") {
      const e = this._workerSource;
      if (e.prototype === void 0)
        return e();
      try {
        return new e();
      } catch (n) {
        const t = String(n && n.message);
        if (n instanceof TypeError && /not a constructor|cannot be invoked without\s*'new'|Class constructor|not constructable/i.test(
          t
        ))
          return e();
        throw n;
      }
    }
    if (typeof this._workerSource == "string") {
      let e;
      try {
        e = new Function(
          "try { return import.meta && import.meta.url } catch (e) { return undefined }"
        )();
      } catch {
        e = void 0;
      }
      if (!e && typeof document < "u") {
        const n = document.currentScript;
        n && n.src && (e = n.src);
      }
      !e && typeof location < "u" && location.href && (e = location.href);
      try {
        if (e) return new Worker(new URL(this._workerSource, e), this._workerOptions);
      } catch {
      }
      return new Worker(this._workerSource, this._workerOptions);
    }
    throw new Error("Invalid workerSource: expected Worker factory or relative path string");
  }
  _deleteWorkerUnderlyingMapping(e) {
    try {
      const n = e && e.worker && e.worker._underlying;
      n && this._underlyingToWorkerObj && this._underlyingToWorkerObj.delete(n);
    } catch {
    }
  }
  /**
   * Add and wire a new worker instance into the pool.
   *
   * This helper wraps the underlying worker instance with a small adapter
   * that encodes outgoing plain-object messages to transferable `Uint8Array`
   * when possible and decodes incoming binary messages back to objects.
   * It also wires cross-platform event handlers (`message`, `error`,
   * `messageerror`) and returns the `WorkerObj` metadata entry used by the pool.
   *
   * @private
   * @param {number} [id] - Optional explicit id for the worker entry.
   * @returns {WorkerObj} The newly created worker entry.
   */
  _addWorkerInstance(e) {
    e == null && (e = this._nextWorkerId++);
    const n = this._createWorkerInstance(), t = new Q(n, this._logger, this), r = {
      id: e,
      worker: t,
      tasks: 0,
      lastActive: _(),
      latencyEwma: null,
      _startTimes: new T()
    };
    r.completedTasks = 0, this.workers.push(r), this._totalWorkersCreated++;
    try {
      this._bus.emit("pool:scale", {
        action: "add",
        id: r.id,
        minSize: this.minSize,
        maxSize: this.maxSize
      });
    } catch (s) {
      this._logger.error(s, "pool scale add listener error");
    }
    try {
      this._underlyingToWorkerObj.set(n, r);
    } catch {
    }
    t.onmessage = (s) => {
      const l = _();
      r.tasks = Math.max(0, r.tasks - 1), this._decrementActiveTasks(1), r.lastActive = l;
      try {
        const c = s && s.data;
        if (c && typeof c == "object" && c.correlationId != null) {
          const u = String(c.correlationId), f = Object.prototype.hasOwnProperty.call(c, "response") ? c.response : c;
          this._cleanupPendingResponse(u, { resolveWith: f });
        }
      } catch (c) {
        this._debugLog && this._debugLog(c, "worker.onmessage: resolve pending response");
      }
      try {
        const c = r._startTimes && r._startTimes.length ? r._startTimes.shift() : null;
        let u = null;
        try {
          const f = s && s.data;
          if (f && typeof f.duration == "number" && Number.isFinite(f.duration) ? u = Math.max(0, Number(f.duration)) : c != null && (u = Math.max(0, l - c)), u != null) {
            const p = this._autoScale && this._autoScale.alpha || 0.2;
            r.latencyEwma == null ? r.latencyEwma = u : r.latencyEwma = p * u + (1 - p) * r.latencyEwma, this._ewmaLatency == null ? this._ewmaLatency = u : this._ewmaLatency = p * u + (1 - p) * this._ewmaLatency, this._totalTasksCompleted = (this._totalTasksCompleted || 0) + 1, r.completedTasks = (r.completedTasks || 0) + 1;
            const g = 1, m = this._taskDurationsWelfordCount;
            this._taskDurationsWelfordCount = m + g;
            const d = u - this._taskDurationsWelfordMean;
            this._taskDurationsWelfordMean += d * g / this._taskDurationsWelfordCount;
            const y = u - this._taskDurationsWelfordMean;
            this._taskDurationsWelfordM2 += d * y, u < this._taskDurationsMin && (this._taskDurationsMin = u), u > this._taskDurationsMax && (this._taskDurationsMax = u);
          }
        } catch (f) {
          this._debugLog && this._debugLog(f, "worker.onmessage: latency tracking inner");
        }
      } catch (c) {
        this._debugLog && this._debugLog(c, "worker.onmessage: latency tracking outer");
      }
      if (!this._queuePaused && this.queue.length > 0 && r.tasks < this._maxTasksPerWorker) {
        const c = this.queue.shift();
        try {
          const u = _();
          c.transfer ? t.postMessage(c.message, c.transfer) : t.postMessage(c.message), r._startTimes.push(u), r.tasks++, this._activeTasks++;
        } catch (u) {
          this._debugLog && this._debugLog(u, "dispatch queued message to worker failed"), this._logger.error(u, "Failed to dispatch queued message to worker");
        }
        this._queueHighCrossed && this.queue.length <= this._queueHighThreshold && (this._queueHighCrossed = !1);
      }
      if (this._onmessage)
        try {
          this._onmessage(s);
        } catch (c) {
          this._logger.error(c, "Pool onmessage handler error");
        }
      try {
        this._bus.emit("message", s);
      } catch (c) {
        this._logger.error(c, "pool listener error");
      }
      this._updateIdleState();
    };
    const i = (s) => {
      let l = s && s.data !== void 0 ? s.data : s, c = l;
      if (l && (l instanceof ArrayBuffer || ArrayBuffer.isView(l)))
        try {
          c = M(l);
        } catch (f) {
          try {
            a(f);
          } catch {
          }
          c = l;
        }
      const u = { data: c, originalEvent: s };
      if (typeof t.onmessage == "function")
        try {
          t.onmessage(u);
        } catch (f) {
          this._logger.error(f, "worker wrapper onmessage error");
        }
    }, o = (s) => {
      if (typeof t.onerror == "function")
        try {
          t.onerror(s);
        } catch (l) {
          this._logger.error(l, "worker wrapper onerror error");
        }
      try {
        this._bus.emit("error", s);
      } catch (l) {
        this._logger.error(l, "pool error listener error");
      }
    }, a = (s) => {
      if (typeof t.onmessageerror == "function")
        try {
          t.onmessageerror(s);
        } catch (l) {
          this._logger.error(l, "worker wrapper onmessageerror error");
        }
      try {
        this._bus.emit("messageerror", s);
      } catch (l) {
        this._logger.error(l, "pool messageerror listener error");
      }
    };
    if (typeof n.addEventListener == "function") {
      try {
        n.addEventListener("message", i);
      } catch (s) {
        this._debugLog && this._debugLog(s, "attach addEventListener message");
      }
      try {
        n.addEventListener("error", o);
      } catch (s) {
        this._debugLog && this._debugLog(s, "attach addEventListener error");
      }
      try {
        n.addEventListener("messageerror", a);
      } catch (s) {
        this._debugLog && this._debugLog(s, "attach addEventListener messageerror");
      }
    } else if (typeof n.on == "function") {
      try {
        n.on("message", i);
      } catch (s) {
        this._debugLog && this._debugLog(s, "attach underlying.on message");
      }
      try {
        n.on("error", o);
      } catch (s) {
        this._debugLog && this._debugLog(s, "attach underlying.on error");
      }
      try {
        n.on("messageerror", a);
      } catch (s) {
        this._debugLog && this._debugLog(s, "attach underlying.on messageerror");
      }
    } else {
      try {
        n.onmessage = i;
      } catch (s) {
        this._debugLog && this._debugLog(s, "assign underlying.onmessage");
      }
      try {
        n.onerror = o;
      } catch (s) {
        this._debugLog && this._debugLog(s, "assign underlying.onerror");
      }
      try {
        n.onmessageerror = a;
      } catch (s) {
        this._debugLog && this._debugLog(s, "assign underlying.onmessageerror");
      }
    }
    return r;
  }
  /**
   * Return the least-loaded worker (smallest `tasks` count).
   *
   * When multiple workers share the same `tasks` count prefer the one with
   * the lower EWMA latency (`latencyEwma`). Returns `null` when no workers
   * are available.
   *
   * @private
   * @returns {WorkerObj|null}
   */
  _findLeastLoadedWorker() {
    if (!this.workers.length) return null;
    let e = null, n = 1 / 0, t = Number.POSITIVE_INFINITY;
    for (let r = 0; r < this.workers.length; r++) {
      const i = this.workers[r], o = i.latencyEwma != null ? i.latencyEwma : Number.POSITIVE_INFINITY;
      (i.tasks < n || i.tasks === n && o < t) && (e = i, n = i.tasks, t = o);
    }
    return e;
  }
  /**
   * Shared handler for underlying worker 'message' events.
   * Decodes binary payloads and forwards to the worker wrapper's `onmessage`.
   * @private
   */
  _handleUnderlyingMessage(e, n) {
    const t = this._underlyingToWorkerObj.get(e);
    if (!t) return;
    const r = t.worker;
    let i = n && n.data !== void 0 ? n.data : n, o = i;
    if (i && (i instanceof ArrayBuffer || ArrayBuffer.isView(i)))
      try {
        o = M(i);
      } catch (s) {
        try {
          this._handleUnderlyingMessageError(e, s);
        } catch {
        }
        o = i;
      }
    const a = { data: o, originalEvent: n };
    if (typeof r.onmessage == "function")
      try {
        r.onmessage(a);
      } catch (s) {
        this._logger.error(s, "worker wrapper onmessage error");
      }
  }
  /**
   * Shared handler for underlying worker 'error' events.
   * Forwards to wrapper `onerror` and pool-level listeners.
   * @private
   */
  _handleUnderlyingError(e, n) {
    const t = this._underlyingToWorkerObj.get(e);
    if (!t) return;
    const r = t.worker;
    if (typeof r.onerror == "function")
      try {
        r.onerror(n);
      } catch (i) {
        this._logger.error(i, "worker wrapper onerror error");
      }
    try {
      this._bus.emit("error", n);
    } catch (i) {
      this._logger.error(i, "pool error listener error");
    }
  }
  /**
   * Shared handler for underlying worker 'messageerror' events.
   * Forwards to wrapper `onmessageerror` and pool-level listeners.
   * @private
   */
  _handleUnderlyingMessageError(e, n) {
    const t = this._underlyingToWorkerObj.get(e);
    if (!t) return;
    const r = t.worker;
    if (typeof r.onmessageerror == "function")
      try {
        r.onmessageerror(n);
      } catch (i) {
        this._logger.error(i, "worker wrapper onmessageerror error");
      }
    try {
      this._bus.emit("messageerror", n);
    } catch (i) {
      this._logger.error(i, "pool messageerror listener error");
    }
  }
  /**
   * Post a message to a worker in the pool.
   * The pool will try to reuse an idle/least-loaded worker, grow the pool
   * (up to `maxSize`), or queue the task if configured.
   *
   * @param {*} message - The message to post to a worker.
   * @param {Transferable[]=} transfer - Optional transfer list. If omitted and
   * a plain JS object is supplied, the pool will internally encode the object
   * to a transferable `Uint8Array` (via `o2u8`) and pass its `ArrayBuffer` as
   * the transfer list to avoid structured-clone copies.
   * @param {PostMessageOptions=} options - Optional flags controlling behavior such as `awaitResponse`, `timeout`, `workerId`, and `zeroCopy`.
   * @returns {boolean|Promise<any>} When `options.awaitResponse` is truthy this returns a `Promise` that resolves with the worker response; otherwise returns `true` when the message was accepted (dispatched or queued) or `false` when it was rejected.
   */
  postMessage(e, n, t) {
    t = t || void 0;
    const r = t && t.workerId != null ? t.workerId : null, i = r != null ? this.workers.find((u) => u.id === r) : this._findLeastLoadedWorker(), o = !!(t && (t.awaitResponse || t.correlationId != null));
    let a, s;
    if (o) {
      if (a = t.correlationId != null ? String(t.correlationId) : this._generateCorrelationId(), !(e !== null && typeof e == "object" && !ArrayBuffer.isView(e) && !(e instanceof ArrayBuffer)))
        throw new Error("postMessage awaitResponse requires a plain-object message");
      e = Object.assign({}, e, { correlationId: a }), s = new Promise((f, p) => {
        const g = { resolve: f, reject: p, timer: null }, m = a != null ? String(a) : a;
        t && t.timeout && (g.timer = setTimeout(() => {
          try {
            this._cleanupPendingResponse(m, {
              rejectWith: new Error("postMessage response timeout")
            });
          } catch {
            try {
              p(new Error("postMessage response timeout"));
            } catch {
            }
          }
        }, t.timeout)), this._pendingResponses.set(m, g);
      }), a = a != null ? String(a) : a;
    }
    if (i && i.tasks < this._maxTasksPerWorker)
      try {
        const u = _(), f = this._prepareForTransfer(e, n, t);
        return f.transfer && f.transfer.length ? i.worker.postMessage(f.message, f.transfer) : i.worker.postMessage(f.message), i._startTimes && typeof i._startTimes.push == "function" && i._startTimes.push(u), i.tasks++, this._activeTasks++, i.lastActive = u, this._updateIdleState(), o ? s : !0;
      } catch (u) {
        if (o && a) {
          try {
            this._cleanupPendingResponse(a, { rejectWith: u });
          } catch {
          }
          return this._logger.error(u, "Failed to postMessage to worker"), s;
        }
        return this._logger.error(u, "Failed to postMessage to worker"), !1;
      }
    if (r != null && (!i || i.tasks >= this._maxTasksPerWorker)) {
      if (o && a) {
        try {
          this._cleanupPendingResponse(a, {
            rejectWith: new Error("targeted worker unavailable")
          });
        } catch {
        }
        return s;
      }
      return !1;
    }
    if (r == null && this.workers.length < this.maxSize) {
      const u = this._addWorkerInstance();
      try {
        const f = _(), p = this._prepareForTransfer(e, n, t);
        return p.transfer && p.transfer.length ? u.worker.postMessage(p.message, p.transfer) : u.worker.postMessage(p.message), u._startTimes && typeof u._startTimes.push == "function" && u._startTimes.push(f), u.tasks++, this._activeTasks++, u.lastActive = f, this._updateIdleState(), o ? s : !0;
      } catch (f) {
        if (o && a) {
          try {
            this._cleanupPendingResponse(a, { rejectWith: f });
          } catch {
          }
          return this._logger.error(f, "Failed to postMessage to new worker"), s;
        }
        return this._logger.error(f, "Failed to postMessage to new worker"), !1;
      }
    }
    if (this.taskQueueEnabled) {
      const u = this._prepareForTransfer(e, n, t), f = this._queuePolicy;
      if (f === "reject")
        return o && a ? (this._cleanupPendingResponse(a, {
          rejectWith: new Error("postMessage rejected by queue policy")
        }), s) : !1;
      if (f === "drop-newest" && this.queue.length > 0)
        return o && a ? (this._cleanupPendingResponse(a, {
          rejectWith: new Error("postMessage rejected by queue policy")
        }), s) : !1;
      if (f === "drop-oldest" && this.queue.length > 0) {
        const g = this.queue.shift();
        g && g.correlationId != null && this._cleanupPendingResponse(g.correlationId, {
          rejectWith: new Error("postMessage queued task dropped by policy")
        });
      }
      const p = {
        message: u.message,
        transfer: u.transfer
      };
      o && a && (p.correlationId = a), this.queue.push(p);
      try {
        if (Number.isFinite(this._queueHighThreshold) && this.queue.length > this._queueHighThreshold && !this._queueHighCrossed) {
          this._queueHighCrossed = !0;
          try {
            this._bus.emit("pool:queue:high", {
              length: this.queue.length,
              threshold: this._queueHighThreshold
            });
          } catch (g) {
            this._logger.error(g, "pool queue high listener error");
          }
        }
      } catch {
      }
      return this._updateIdleState(), o ? s : !0;
    }
    if (!this.workers.length) return o ? s : !1;
    const l = this._nextIndex % this.workers.length;
    this._nextIndex = (this._nextIndex + 1) % this.workers.length;
    const c = this.workers[l];
    try {
      const u = _(), f = this._prepareForTransfer(e, n);
      return f.transfer && f.transfer.length ? c.worker.postMessage(f.message, f.transfer) : c.worker.postMessage(f.message), c._startTimes && typeof c._startTimes.push == "function" && c._startTimes.push(u), c.tasks++, this._activeTasks++, c.lastActive = u, this._updateIdleState(), o ? s : !0;
    } catch (u) {
      if (o && a) {
        try {
          this._cleanupPendingResponse(a, { rejectWith: u });
        } catch {
        }
        return this._logger.error(u, "Failed to postMessage to fallback worker"), s;
      }
      return this._logger.error(u, "Failed to postMessage to fallback worker"), !1;
    }
  }
  /**
   * Generate a safe correlation id. Prefer `crypto.randomUUID()` when
   * available, otherwise fall back to a timestamp + random suffix.
   * @private
   * @returns {string}
   */
  _generateCorrelationId() {
    try {
      if (typeof globalThis < "u" && globalThis.crypto && typeof globalThis.crypto.randomUUID == "function")
        return globalThis.crypto.randomUUID();
    } catch {
    }
    try {
      if (typeof globalThis < "u" && globalThis.crypto && typeof globalThis.crypto.getRandomValues == "function") {
        const n = new Uint8Array(16);
        return globalThis.crypto.getRandomValues(n), Array.from(n).map((t) => t.toString(16).padStart(2, "0")).join("");
      }
    } catch {
    }
    const e = Math.floor(Math.random() * 4294967295).toString(16);
    return `cid-${Date.now().toString(36)}-${e}`;
  }
  /**
   * Centralized cleanup for a pending response entry.
   * Ensures the timer is cleared and the entry is resolved/rejected exactly once.
   * @private
   * @param {string|number} key
   * @param {{resolveWith?:any, rejectWith?:any}} opts
   */
  _cleanupPendingResponse(e, n = {}) {
    const t = e != null ? String(e) : e, r = this._pendingResponses.get(t);
    if (!r) return !1;
    try {
      if (r.timer)
        try {
          clearTimeout(r.timer);
        } catch {
        }
    } catch {
    }
    try {
      Object.prototype.hasOwnProperty.call(n, "resolveWith") ? r.resolve(n.resolveWith) : Object.prototype.hasOwnProperty.call(n, "rejectWith") && r.reject(n.rejectWith);
    } catch {
    } finally {
      try {
        this._pendingResponses.delete(t);
      } catch {
      }
    }
    return !0;
  }
  /**
   * Broadcasts a message to all workers in the pool.
   * @param {*} message
   * @param {Transferable[]=} transfer - Optional transfer list. If omitted and a
   * plain JS object is supplied, the pool will attempt to encode the object for
   * each worker into a transferable `Uint8Array` (via `o2u8`) so each worker
   * receives an independent transferable buffer to avoid structured-clone copies.
   * @returns {void}
   */
  broadcast(e, n) {
    const t = _();
    let r = null;
    const i = e !== null && typeof e == "object" && !ArrayBuffer.isView(e) && !(e instanceof ArrayBuffer);
    for (const o of this.workers)
      try {
        let a = e, s = n;
        if (!s && i)
          try {
            r == null && (r = this._encodeForTransfer(e));
            const l = r.slice();
            a = l, s = [l.buffer];
          } catch {
            a = e, s = void 0;
          }
        s && s.length ? o.worker.postMessage(a, s) : o.worker.postMessage(a), o._startTimes && typeof o._startTimes.push == "function" && o._startTimes.push(t), o.tasks++, this._activeTasks++, o.lastActive = t;
      } catch (a) {
        this._logger.error(a, "broadcast error");
      }
    this._updateIdleState();
  }
  /**
   * Stop all pending queued tasks and immediately post a message to the pool.
   * This clears the internal task queue first (cancelling pending tasks),
   * updates the pool idle state, then forwards the provided message using
   * `postMessage` so the message is dispatched to a live worker immediately
   * (or enqueued if no worker can accept it).
   *
   * @param {*} message - The message to post after clearing pending tasks.
   * @param {Transferable[]=} transfer - Optional transfer list. When omitted
   * and a plain object is supplied, the pool will attempt to encode the
   * object to a transferable `Uint8Array` for efficient transfer.
   * @param {Object=} options - Optional options forwarded to `postMessage`.
   * @returns {boolean|Promise<any>} The same return value as `postMessage`.
   */
  stopThePress(e, n, t) {
    const r = t && typeof t.recreateWorkers < "u" ? !!t.recreateWorkers : !0, i = t && typeof t == "object" ? Object.assign({}, t) : void 0;
    i && delete i.recreateWorkers;
    try {
      this.queue && typeof this.queue.clear == "function" && this.queue.clear();
    } catch (s) {
      this._logger.error(s, "stopThePress: failed to clear queue");
    }
    try {
      for (const [s] of this._pendingResponses)
        try {
          this._cleanupPendingResponse(s, {
            rejectWith: new Error("stopThePress: cancelled pending response")
          });
        } catch {
        }
    } catch (s) {
      this._logger.error(s, "stopThePress: failed to cancel pending responses");
    }
    const o = this.workers.length, a = this.workers.map((s) => s && s.id).filter((s) => s != null);
    try {
      for (let s = this.workers.length - 1; s >= 0; s--) {
        const l = this.workers[s];
        this._terminatedWorkerTaskCountsTotal += l.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1;
        try {
          l.worker.terminate();
        } catch {
        }
        this._deleteWorkerUnderlyingMapping(l);
      }
      this.workers.length = 0, this._activeTasks = 0;
    } catch (s) {
      this._logger.error(s, "stopThePress: failed while terminating workers");
    }
    if (r || this._clearLifecycleIntervals(), r) {
      const s = Math.max(this.minSize, Math.min(o, this.maxSize));
      for (let l = 0; l < s; l++) this._addWorkerInstance();
      try {
        this._ensureReaper();
      } catch {
      }
    }
    try {
      a && a.length && this._bus.emit("pool:scale", {
        action: "remove",
        terminated: a,
        count: o
      });
    } catch (s) {
      this._logger.error(s, "pool scale stopThePress listener error");
    }
    return this._updateIdleState(), this.postMessage(e, n, i);
  }
  /**
   * Post a batch of messages to the pool.
   * Each entry is an object: `{ message, transfer? }`.
   * Returns an array with the same length as `items` where each element is
   * either a boolean (accepted) or a Promise (when `options.awaitResponse` is used).
   * @param {{message:*,transfer?:Transferable[]}[]} items
   * @param {Object=} options - Optional options forwarded to each `postMessage` call.
   * @returns {(boolean|Promise<any>)[]}
   */
  postMessageBatch(e, n) {
    if (!Array.isArray(e))
      throw new Error("postMessageBatch expects an array of {message, transfer?}");
    const t = !!(n && (n.awaitResponse || n.correlationId != null)), r = n && typeof n.correlationIdFactory == "function" ? n.correlationIdFactory : null;
    if (t) {
      if (n && n.correlationId != null && e.length > 1 && !r)
        throw new Error(
          "postMessageBatch cannot use a fixed correlationId for multiple items; provide options.correlationIdFactory or omit correlationId"
        );
      const u = new Array(e.length);
      for (let f = 0; f < e.length; f++) {
        const p = e[f] || {}, g = Object.assign({}, n);
        r && (g.correlationId = String(r(f, p))), u[f] = this.postMessage(p.message, p.transfer, g);
      }
      return u;
    }
    const i = new Array(e.length), o = [], a = n && n.workerId != null ? n.workerId : null, s = this.prepareBuffers(e, {
      clone: !0,
      zeroCopy: n && !!n.zeroCopy
    });
    let l = null;
    if (a != null) {
      if (l = this.workers.find((u) => u.id === a), !l) return e.map(() => !1);
    } else
      l = this._findLeastLoadedWorker();
    let c = !1;
    for (let u = 0; u < e.length; u++) {
      const f = e[u] || {}, p = s[u] || { message: f.message, transfer: f.transfer };
      let g = !1;
      l && l.tasks >= this._maxTasksPerWorker && (l = null);
      let m = l;
      if (!m && a == null && (m = this._findLeastLoadedWorker()), m && m.tasks < this._maxTasksPerWorker)
        try {
          const d = _();
          p.transfer && p.transfer.length ? m.worker.postMessage(p.message, p.transfer) : m.worker.postMessage(p.message), m._startTimes && typeof m._startTimes.push == "function" && m._startTimes.push(d), m.tasks++, this._activeTasks++, m.lastActive = d, c = !0, i[u] = !0, g = !0, l = m.tasks < this._maxTasksPerWorker ? m : null;
        } catch {
          i[u] = !1, g = !0;
        }
      if (!g && a == null && this.workers.length < this.maxSize)
        try {
          const d = this._addWorkerInstance(), y = _();
          p.transfer && p.transfer.length ? d.worker.postMessage(p.message, p.transfer) : d.worker.postMessage(p.message), d._startTimes && typeof d._startTimes.push == "function" && d._startTimes.push(y), d.tasks++, this._activeTasks++, d.lastActive = y, c = !0, i[u] = !0, g = !0, l = d.tasks < this._maxTasksPerWorker ? d : null;
        } catch {
          i[u] = !1, g = !0;
        }
      if (!g) {
        if (a != null) {
          i[u] = !1;
          continue;
        }
        if (this.taskQueueEnabled) {
          const d = this._queuePolicy;
          d === "reject" || d === "drop-newest" && this.queue.length > 0 ? i[u] = !1 : (d === "drop-oldest" && this.queue.length > 0 && this.queue.shift(), o.push({ message: p.message, transfer: p.transfer }), i[u] = !0);
        } else if (!this.workers.length)
          i[u] = !1;
        else {
          const d = this._nextIndex % this.workers.length;
          this._nextIndex = (this._nextIndex + 1) % this.workers.length;
          const y = this.workers[d];
          try {
            const w = _();
            p.transfer && p.transfer.length ? y.worker.postMessage(p.message, p.transfer) : y.worker.postMessage(p.message), y._startTimes && typeof y._startTimes.push == "function" && y._startTimes.push(w), y.tasks++, this._activeTasks++, y.lastActive = w, c = !0, i[u] = !0;
          } catch (w) {
            i[u] = !1, this._logger.error(w, "Failed to postMessage to fallback worker");
          }
        }
      }
    }
    if (o.length)
      try {
        this.queue.pushMany(o), c = !0;
      } catch (u) {
        this._logger.error(u, "postMessageBatch: failed to enqueue prepared items");
      }
    return c && this._updateIdleState(), i;
  }
  /**
   * Stop the press and then post a batch of messages.
   *
   * Clears the internal task queue and terminates inflight workers (optionally recreating them),
   * rejects pending response Promises, then forwards the provided batch to `postMessageBatch`.
   *
   * This method mirrors the semantics of `stopThePress` for single messages but
   * operates on a batch. Use it when you need to atomically cancel pending work
   * and then seed the pool with a new set of tasks.
   *
   * @param {{message:*,transfer?:Transferable[]}[]} items - Array of items to send after clearing the pool.
   * @param {Object=} options - Optional options forwarded to `postMessageBatch`.
   *   Recognized options include:
   *     - `recreateWorkers` (boolean, default: true) — whether to recreate replacement workers after termination.
   *     - `awaitResponse` (boolean) — if true, returned slots will be Promises as in `postMessageBatch`.
   *     - `workerId` (number) — target a specific worker during dispatch attempts.
   * @returns {(boolean|Promise<any>)[]} Array with per-item results: `true|false` or `Promise` when awaiting responses.
   */
  stopThePressBatch(e, n) {
    const t = n && typeof n.recreateWorkers < "u" ? !!n.recreateWorkers : !0, r = n && typeof n == "object" ? Object.assign({}, n) : void 0;
    r && delete r.recreateWorkers;
    try {
      this.queue && typeof this.queue.clear == "function" && this.queue.clear();
    } catch (o) {
      this._logger.error(o, "stopThePressBatch: failed to clear queue");
    }
    try {
      for (const [o] of this._pendingResponses)
        try {
          this._cleanupPendingResponse(o, {
            rejectWith: new Error("stopThePressBatch: cancelled pending response")
          });
        } catch {
        }
    } catch (o) {
      this._logger.error(o, "stopThePressBatch: failed to cancel pending responses");
    }
    const i = this.workers.length;
    try {
      for (let o = this.workers.length - 1; o >= 0; o--) {
        const a = this.workers[o];
        this._terminatedWorkerTaskCountsTotal += a.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1;
        try {
          a.worker.terminate();
        } catch {
        }
        this._deleteWorkerUnderlyingMapping(a);
      }
      this.workers.length = 0, this._activeTasks = 0;
    } catch (o) {
      this._logger.error(o, "stopThePressBatch: failed while terminating workers");
    }
    if (t || this._clearLifecycleIntervals(), t) {
      const o = Math.max(this.minSize, Math.min(i, this.maxSize));
      for (let a = 0; a < o; a++) this._addWorkerInstance();
      try {
        this._ensureReaper();
      } catch {
      }
    }
    this._updateIdleState();
    try {
      return this.postMessageBatch(e, r);
    } catch (o) {
      try {
        this._logger.error(o, "stopThePressBatch: postMessageBatch failed");
      } catch {
      }
      try {
        return new Array(e ? e.length : 0).fill(!1);
      } catch {
        return [];
      }
    }
  }
  /**
   * Add one worker to the pool immediately.
   * @returns {WorkerObj} The newly created worker entry.
   */
  addWorker() {
    return this._addWorkerInstance();
  }
  /**
   * Remove the last worker from the pool and terminate it.
   * @returns {void}
   */
  removeWorker() {
    const e = this.workers.pop();
    if (e) {
      this._decrementActiveTasks(e.tasks || 0);
      try {
        e.worker.terminate();
      } catch {
      }
      this._deleteWorkerUnderlyingMapping(e), this._terminatedWorkerTaskCountsTotal += e.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1;
    }
  }
  /**
   * Internal: terminate workers that have been idle longer than `idleTimeout`.
   * Keeps at least `minSize` workers alive.
   *
   * This routine scans workers from newest to oldest and terminates those
   * which have had no tasks for longer than `idleTimeout`, updating
   * termination statistics used by `getStats()`.
   *
   * @private
   * @returns {void}
   */
  _reapIdleWorkers() {
    if (this.idleTimeout <= 0) return;
    const e = _();
    for (let n = this.workers.length - 1; n >= 0; n--) {
      const t = this.workers[n];
      if (this.workers.length <= this.minSize) break;
      if (t.tasks === 0 && e - (t.lastActive || 0) > this.idleTimeout) {
        try {
          t.worker.terminate();
        } catch {
        }
        try {
          const i = t.worker && t.worker._underlying;
          i && this._underlyingToWorkerObj && this._underlyingToWorkerObj.delete(i);
        } catch {
        }
        const r = this.workers.length - 1;
        n === r ? this.workers.pop() : this.workers[n] = this.workers.pop();
      }
    }
    this._updateIdleState();
  }
  /**
   * Autoscale tick: simple policy that grows/shrinks by one worker based on
   * pool-level EWMA latency and queue pressure. Runs only when `autoScale`
   * is configured on the pool.
   *
   * - scale up: when EWMA > targetMs OR queue length exceeds worker count
   * - scale down: when EWMA < targetMs * 0.5 AND queue is empty
   * @private
   */
  _autoScaleTick() {
    try {
      if (!this._autoScale || !this._autoScale.enabled) return;
      const e = _(), n = this._autoScale;
      this._lastAutoScaleAt && n.backoffResetMs && e - this._lastAutoScaleAt > n.backoffResetMs && (this._autoScaleBackoffMultiplier = 1);
      const t = Math.floor(
        (n.cooldownMs || 0) * (this._autoScaleBackoffMultiplier || 1)
      );
      if (this._lastAutoScaleAt && e - this._lastAutoScaleAt < t) return;
      const r = n.targetMs, i = n.hysteresis || 0.2, o = this._ewmaLatency, a = this.workers.length, s = r * (1 + i), l = o != null ? o > s : !1, c = this.queue.length > Math.ceil(a * (1 + i));
      if (l || c) {
        if (a < this.maxSize)
          try {
            const p = Math.min(this.maxSize - a, n.stepUp || 1);
            for (let g = 0; g < p; g++) this._addWorkerInstance();
            this._lastAutoScaleAt = e, this._autoScaleBackoffMultiplier = Math.min(
              n.backoffMaxMultiplier || 8,
              Math.max(1, (this._autoScaleBackoffMultiplier || 1) * (n.backoffFactor || 1))
            );
          } catch (p) {
            this._debugLog && this._debugLog(p, "autoScale: addWorker failed");
          }
        return;
      }
      const u = r * Math.max(0, 1 - i);
      if ((o != null ? o < u : !1) && this.queue.length === 0 && a > this.minSize)
        try {
          const p = Math.min(a - this.minSize, n.stepDown || 1);
          for (let g = 0; g < p; g++) {
            const m = this.workers.pop();
            if (m) {
              try {
                m.worker.terminate();
              } catch (d) {
                this._debugLog && this._debugLog(d, "autoScale: terminate worker");
              }
              this._deleteWorkerUnderlyingMapping(m);
            }
          }
          this._lastAutoScaleAt = e, this._autoScaleBackoffMultiplier = Math.min(
            n.backoffMaxMultiplier || 8,
            Math.max(1, (this._autoScaleBackoffMultiplier || 1) * (n.backoffFactor || 1))
          );
        } catch (p) {
          this._debugLog && this._debugLog(p, "autoScale: remove worker failed");
        }
    } catch (e) {
      this._debugLog && this._debugLog(e, "autoScaleTick outer");
    }
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
   * @private
   * @returns {void}
   */
  _emitIdle() {
    const e = { data: { type: "pool:idle", stats: this.getStats() } };
    if (this._isIdle = !0, this._onmessage)
      try {
        this._onmessage(e);
      } catch (n) {
        this._logger.error(n, "Pool onmessage handler error");
      }
    if (this._onidle)
      try {
        this._onidle(e);
      } catch (n) {
        this._logger.error(n, "Pool onidle handler error");
      }
    try {
      this._bus.emit("message", e);
    } catch (n) {
      this._logger.error(n, "pool listener error");
    }
    try {
      this._bus.emit("idle", e);
    } catch (n) {
      this._logger.error(n, "pool idle listener error");
    }
  }
  /**
   * Check current state and emit idle event if transitioning to idle.
   *
   * This function examines active task counts and queue length to detect a
   * transition from non-idle to idle and will call `_emitIdle()` exactly once
   * on such transitions.
   *
   * @private
   * @returns {void}
   */
  _updateIdleState() {
    const e = this.queue.length === 0, t = this._activeTasks === 0 && e;
    t && !this._isIdle ? this._emitIdle() : !t && this._isIdle && (this._isIdle = !1);
  }
  /**
   * Terminate the entire pool, clear queue and the reaper interval.
   */
  terminate() {
    try {
      this.shutdown();
    } catch {
    }
  }
  /**
   * Synchronous disposal hook (TC39 Explicit Resource Management).
   * Allows `using`-style disposal when supported: `pool[Symbol.dispose]()`.
   */
  [Symbol.dispose]() {
    this.terminate();
  }
  /**
   * Asynchronous disposal hook. Drains outstanding work and then terminates.
   * Use `await pool[Symbol.asyncDispose]()` in environments that support it.
   */
  async [Symbol.asyncDispose]() {
    try {
      await this.drain();
    } catch {
    }
    this.terminate();
  }
  /**
   * Return stats for debugging and telemetry.
   * @returns {{status:{id:number,tasks:number,lastActive:number}[],performance:Object,queueLength:number,activeTasks:number,workerCount:number,minSize:number,maxSize:number,isIdle:boolean}}
   */
  getStats() {
    const e = this.workers.map((w) => ({
      id: w.id,
      tasks: w.tasks,
      lastActive: w.lastActive
    })), n = _(), t = this._createdAt != null ? Math.max(0, n - this._createdAt) : 0, r = this._totalWorkersCreated || this.workers.length, i = this._totalTasksCompleted || 0, o = this._terminatedWorkerTaskCountsCount || 0, a = this._terminatedWorkerTaskCountsTotal || 0;
    let s = 0;
    for (const w of this.workers) s += w.completedTasks || 0;
    const l = this.workers.length || 0, c = o + l, u = c > 0 ? (a + s) / c : 0;
    let f = 0, p = 0, g = 0, m = 0, d = 0;
    const y = this._taskDurationsWelfordCount || 0;
    if (y > 0) {
      f = this._taskDurationsMin === Number.POSITIVE_INFINITY ? 0 : this._taskDurationsMin, p = this._taskDurationsMax === Number.NEGATIVE_INFINITY ? 0 : this._taskDurationsMax, g = this._taskDurationsWelfordMean;
      const w = y > 1 ? this._taskDurationsWelfordM2 / y : 0;
      m = Math.sqrt(w), d = 0;
    }
    return {
      status: e,
      performance: {
        poolLiveDuration: t,
        totalWorkersCreated: r,
        totalTasksPerformed: i,
        averageTasksPerWorkerUntilTermination: u,
        timePerTask: { max: p, min: f, average: g, stddev: m },
        percentSlowTasks: d
      },
      queueLength: this.queue.length,
      activeTasks: this._activeTasks,
      workerCount: this.workers.length,
      minSize: this.minSize,
      maxSize: this.maxSize,
      isIdle: this._activeTasks === 0 && this.queue.length === 0
    };
  }
  /**
   * Return a Promise that resolves when the pool becomes idle (queue empty and all workers have tasks === 0).
   * Resolves with the result of `getStats()` at the time of idle.
   * @returns {Promise<object>} Promise resolving to `getStats()`.
   */
  drain() {
    const e = this.queue.length === 0;
    return this._activeTasks === 0 && e ? Promise.resolve(this.getStats()) : new Promise((r) => {
      const i = () => {
        try {
          this.removeEventListener("idle", i);
        } catch {
        }
        r(this.getStats());
      };
      this.addEventListener("idle", i);
    });
  }
  /**
   * Add an event listener for pool events. Supported types: 'message', 'error', 'messageerror', 'idle'.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  addEventListener(e, n) {
    if (typeof n == "function" && (this._bus.on(e, n), e === "idle")) {
      const t = this.queue.length === 0;
      if (this._activeTasks === 0 && t) {
        const i = { data: { type: "pool:idle", stats: this.getStats() } };
        try {
          n(i);
        } catch (o) {
          this._logger.error(o, "pool idle listener error");
        }
      }
    }
  }
  /**
   * Remove a previously added event listener.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  removeEventListener(e, n) {
    !n || typeof n != "function" || this._bus.off(e, n);
  }
  /**
   * onresize handler called when the pool is resized and workers are terminated/added.
   * Receives an event object: `{ data: { type: 'pool:resize', terminated: Array<number>, added: number, minSize, maxSize } }`
   * @type {Function|null}
   */
  get onresize() {
    return this._onresize;
  }
  set onresize(e) {
    this._onresize = e;
  }
  /**
   * onmessage handler called when any worker posts a message.
   * @type {Function|null}
   */
  get onmessage() {
    return this._onmessage;
  }
  set onmessage(e) {
    this._onmessage = e;
  }
  /**
   * onerror handler called when a worker emits an error.
   * @type {Function|null}
   */
  get onerror() {
    return this._onerror;
  }
  set onerror(e) {
    this._onerror = e;
  }
  /**
   * onidle handler called when the pool becomes idle.
   * @type {Function|null}
   */
  get onidle() {
    return this._onidle;
  }
  set onidle(e) {
    if (this._onidle = e, typeof e == "function") {
      const n = this.queue.length === 0;
      if (this._activeTasks === 0 && n) {
        const r = { data: { type: "pool:idle", stats: this.getStats() } };
        try {
          e(r);
        } catch (i) {
          this._logger.error(i, "Pool onidle handler error");
        }
      }
    }
  }
  /**
   * Pause dequeueing from the internal task queue.
   * Queued tasks remain in the queue until `resumeQueue()` is called.
   * This is useful for controlled backpressure when downstream consumers
   * are temporarily unable to accept more work.
   */
  pauseQueue() {
    this._queuePaused = !0;
  }
  /**
   * Resume dequeueing from the internal task queue and attempt to dispatch
   * waiting tasks to available workers.
   */
  resumeQueue() {
    this._queuePaused && (this._queuePaused = !1, this._dispatchQueuedTasks());
  }
  /**
   * Alias for `pauseQueue()` to provide a simpler public API.
   */
  pause() {
    return this.pauseQueue();
  }
  /**
   * Alias for `resumeQueue()` to provide a simpler public API.
   */
  resume() {
    return this.resumeQueue();
  }
  /**
   * Whether queued dispatch is currently paused.
   * @returns {boolean}
   */
  get queuePaused() {
    return this._queuePaused;
  }
  /**
   * Dispatch queued tasks to available workers when the queue is not paused.
   * @private
   */
  _dispatchQueuedTasks() {
    if (this._queuePaused || !this.taskQueueEnabled || this.queue.length === 0) return;
    const e = _();
    let n = !1;
    for (const t of this.workers)
      for (; this.queue.length > 0 && t.tasks < this._maxTasksPerWorker; ) {
        const r = this.queue.shift();
        try {
          r.transfer && r.transfer.length ? t.worker.postMessage(r.message, r.transfer) : t.worker.postMessage(r.message), t._startTimes && typeof t._startTimes.push == "function" && t._startTimes.push(e), t.tasks++, this._activeTasks++, t.lastActive = e, n = !0;
        } catch (i) {
          this._debugLog && this._debugLog(i, "dispatch queued message to worker failed"), this._logger.error(i, "Failed to dispatch queued message to worker");
          break;
        }
      }
    this._queueHighCrossed && this.queue.length <= this._queueHighThreshold && (this._queueHighCrossed = !1), n && this._updateIdleState();
  }
}
class Z {
  constructor({
    map: e,
    source: n,
    sourceLayer: t,
    fid: r = "id",
    tileSize: i = 512,
    tolerance: o = 1e-5,
    cacheSize: a = 5e3,
    units: s = "meters",
    tilePoolSize: l = 6,
    gatherPoolSize: c = 4,
    tileWorkerSource: u = null,
    gatherWorkerSource: f = null
  }) {
    this.map = e, this.source = n, this.sourceLayer = t, this.fid = r, this.tileSize = i, this.tolerance = o, this.units = s, this._sourceLoaded = !1, this._pendingTiles = /* @__PURE__ */ new Set(), this._tileQueue = new T(32), this._tileDrainScheduled = !1, this._gatherScheduled = !1, this._diffScheduled = !1, this._diffAdd = /* @__PURE__ */ new Map(), this._diffRemove = /* @__PURE__ */ new Set(), this._bus = new I(), this.piecesCache = new A({
      maxEntries: a,
      maxWeight: a * 5e3,
      weightFn: (m) => m.size || 0
    }), this.labelsCache = new A({
      maxEntries: a,
      maxWeight: a * 5e3,
      weightFn: (m) => Array.isArray(m) ? m.length : 0
    });
    const p = u, g = f;
    this.tilePool = new R(p, {
      size: l,
      minSize: 1,
      maxSize: l,
      taskQueue: !0,
      lazy: !1
    }), this.gatherPool = new R(g, {
      size: c,
      minSize: 1,
      maxSize: c,
      taskQueue: !0,
      lazy: !1
    }), this.tilePool.addEventListener("message", (m) => this._onTileMessage(m)), this.tilePool.addEventListener("idle", () => {
      this._sourceLoaded && this._scheduleGather();
    }), this.gatherPool.addEventListener("message", (m) => this._onGatherMessage(m)), this.gatherPool.addEventListener("idle", () => this._scheduleDiffFlush()), this._bus.on("label", (m) => this._collectLabelDiff(m)), this._bus.on("commit", () => this._scheduleDiffFlush());
  }
  handleSourceData(e) {
    if (!e || e.sourceId !== this.source.id) return;
    e.isSourceLoaded && (this._sourceLoaded = !0);
    const n = e.tile?.tileID?.canonical;
    if (!n) return;
    const t = `${n.z}|${n.x}|${n.y}`;
    if (this.piecesCache.has(t) || this._pendingTiles.has(t)) return;
    let r = [];
    const i = this.source.type === "vector" ? { sourceLayer: this.sourceLayer } : {}, o = typeof e.tile?.querySourceFeatures == "function" ? e.tile.querySourceFeatures.bind(e.tile) : typeof this.map.querySourceFeatures == "function" ? this.map.querySourceFeatures.bind(this.map) : null;
    if (!o) return;
    const a = o(r, i);
    if (Array.isArray(a) && (r = a), !r.length) return;
    const s = this.tolerance * Math.pow(10, -0.301 * n.z + 5.19), l = {
      collection: {
        type: "FeatureCollection",
        features: r.map((c, u) => ({
          id: c.properties?.[this.fid] ?? c.id,
          geometry: c.geometry,
          properties: {
            ...c.properties,
            _index: `${t}|${u}`,
            _tile: t,
            _group: c.properties?.[this.fid]
          }
        }))
      },
      tolerance: s,
      unique: t,
      tileSize: this.tileSize
    };
    this._pendingTiles.add(t), this._tileQueue.push(l), this._scheduleTileDrain();
  }
  setGeoJsonSource(e) {
    this.gjSource = e;
  }
  dispose() {
    try {
      this.tilePool.shutdown();
    } catch {
    }
    try {
      this.gatherPool.shutdown();
    } catch {
    }
    this.piecesCache.clear(), this.labelsCache.clear(), this._tileQueue.clear(), this._diffQueue?.clear?.(), this._bus.clear();
  }
  _scheduleTileDrain() {
    this._tileDrainScheduled || (this._tileDrainScheduled = !0, queueMicrotask(() => {
      this._tileDrainScheduled = !1, this._drainTileQueue();
    }));
  }
  _drainTileQueue() {
    const e = [];
    let n;
    for (; (n = this._tileQueue.shift()) !== void 0; )
      e.push({ message: n });
    e.length > 0 && this.tilePool.postMessageBatch(e);
  }
  _onTileMessage(e) {
    const n = this._normalizeWorkerMessage(e.data);
    if (!n || n.type !== "simplified") return;
    const { unique: t, type: r, ...i } = n;
    this._pendingTiles.delete(t), this.piecesCache.set(t, i), this._sourceLoaded && this._scheduleGather();
  }
  _scheduleGather() {
    this._gatherScheduled || (this._gatherScheduled = !0, queueMicrotask(() => {
      this._gatherScheduled = !1, this._dispatchGather();
    }));
  }
  _dispatchGather() {
    const e = Array.from(this.piecesCache.entries("LRU"));
    if (!e.length) return;
    const n = Object.fromEntries(e);
    this.gatherPool.postMessage({
      pieces: n,
      tolerance: this.tolerance,
      unit: this.units,
      tileSize: this.tileSize
    });
  }
  _onGatherMessage(e) {
    const n = this._normalizeWorkerMessage(e.data);
    if (n) {
      if (n.type === "commit") {
        this._bus.emit("commit");
        return;
      }
      n.id != null && this._bus.emit("label", n);
    }
  }
  _collectLabelDiff(e) {
    const n = e.id, t = Array.isArray(e.features) ? e.features : [];
    if (this.labelsCache.hasEqual(n, t)) return;
    const r = this.labelsCache.get(n);
    r && r.forEach((i) => {
      i?.properties?._index && this._diffRemove.add(i.properties._index);
    }), t.forEach((i) => {
      i?.properties?._index && this._diffAdd.set(i.properties._index, i);
    }), this.labelsCache.set(n, t);
  }
  _scheduleDiffFlush() {
    this._diffScheduled || (this._diffScheduled = !0, queueMicrotask(() => {
      this._diffScheduled = !1, this._flushDiffs();
    }));
  }
  _flushDiffs() {
    if (!this.gjSource || this._diffAdd.size === 0 && this._diffRemove.size === 0) return;
    const e = [...this._diffAdd.values()], n = [...this._diffRemove];
    this._diffAdd.clear(), this._diffRemove.clear(), this.gjSource.updateData({ add: e, remove: n });
  }
  _normalizeWorkerMessage(e) {
    return e instanceof ArrayBuffer || ArrayBuffer.isView(e) ? M(e) : e;
  }
}
const O = `let v, T;
function F() {
  return v !== void 0 ? v === !1 ? null : v : typeof TextEncoder < "u" ? (v = new TextEncoder(), v) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (v = { encode: (i) => new Uint8Array(Buffer.from(i)) }, v) : (v = !1, null);
}
function U() {
  return T !== void 0 ? T === !1 ? null : T : typeof TextDecoder < "u" ? (T = new TextDecoder(), T) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (T = { decode: (i) => Buffer.from(i).toString("utf8") }, T) : (T = !1, null);
}
const L = (i) => {
  if (i instanceof Uint8Array) return i;
  if (ArrayBuffer.isView(i)) return new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  if (i instanceof ArrayBuffer) return new Uint8Array(i);
  const e = JSON.stringify(i), t = F();
  if (t && typeof t.encode == "function") return t.encode(e);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, W = (i) => {
  let e;
  if (i instanceof Uint8Array) e = i;
  else if (ArrayBuffer.isView(i)) e = new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  else if (i instanceof ArrayBuffer) e = new Uint8Array(i);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(i))
    e = new Uint8Array(i);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  const t = U();
  if (t && typeof t.decode == "function") return JSON.parse(t.decode(e));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(e));
  throw new Error("No TextDecoder or Buffer available to decode object");
};
class D {
  /**
   * Create a PowerCache.
   * @param {Object} [options]
   * @param {number} [options.maxEntries=Infinity] Maximum number of entries.
   * @param {number} [options.maxWeight=Infinity] Maximum total weight across entries.
   * @param {function(*):number} [options.weightFn] Function to compute weight for a value.
   * @param {number} [options.defaultTTL=60000] Default TTL (ms) for entries.
   * @param {number} [options.maxPoolSize=1000] Maximum node pool size for reuse.
   * @param {boolean} [options.rejectOversized=false] If true, inserting an item whose weight > \`maxWeight\` will be rejected.
   * @param {function(*, *, string):void} [options.onEvict] Callback invoked when an item is evicted/deleted/rejected. Called as \`(key, value, reason)\` where reason is \`'evicted'|'deleted'|'rejected-oversized'\`.
   * @param {function(*, *):void} [options.onExpire] Callback invoked when an item expires. Called as \`(key, value)\`.
   * @param {number} [options.initialPoolSize=0] Prefill the internal node pool with this many nodes (capped by \`maxPoolSize\`).
   * @param {number} [options.maxCleanupPerTick=100] Default max nodes scanned per cleanup tick when running \`startCleanup()\`.
   * @param {boolean} [options.eagerCleanupOnRead=false] If true, \`peek()\` and \`has()\` will eagerly remove expired nodes when observed.
   */
  constructor({
    maxEntries: e = 1 / 0,
    maxWeight: t = 1 / 0,
    weightFn: n = () => 1,
    defaultTTL: r = 6e4,
    maxPoolSize: l = 1e3,
    rejectOversized: u = !1,
    onEvict: o = null,
    onExpire: s = null,
    initialPoolSize: a = 0,
    maxCleanupPerTick: f = 100,
    eagerCleanupOnRead: h = !1
  } = {}) {
    this.maxEntries = e, this.maxWeight = t, this.weightFn = n, this.defaultTTL = r, this.maxPoolSize = l, this.rejectOversized = !!u, this.onEvict = typeof o == "function" ? o : null, this.onExpire = typeof s == "function" ? s : null, this.maxCleanupPerTick = Number.isFinite(+f) ? Math.max(1, +f) : 100, this.eagerCleanupOnRead = !!h, this.map = /* @__PURE__ */ new Map(), this.head = null, this.tail = null, this.pool = [];
    for (let m = 0; m < Math.min(a || 0, this.maxPoolSize); m++)
      this.pool.push({ key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null });
    this.currentWeight = 0, this.hits = 0, this.misses = 0, this.evictions = 0, this.rejected = 0, this.expirations = 0, this._cleanupTimer = null, this._cleanupRunning = !1, this._cleanupParams = null, this._cleanupCursor = null, this._cleanupCursorValid = !1, this._inflightPromises = /* @__PURE__ */ new Map();
  }
  /**
   * Allocate a pool node or create a new one.
   *
   * This helper either reuses a node from the internal \`pool\` or creates a
   * fresh node object. The returned node is initialized with the provided
   * key/value/weight/expiresAt and has its \`prev\`/\`next\` pointers nulled.
   *
   * @private
   * @param {*} key
   * @param {*} value
   * @param {number} weight
   * @param {number} expiresAt
   * @returns {CacheNode}
   */
  _allocNode(e, t, n, r) {
    const l = this.pool.pop() || {
      key: null,
      value: null,
      weight: 0,
      expiresAt: 0,
      prev: null,
      next: null
    };
    return l.key = e, l.value = t, l.weight = n || 0, l.expiresAt = r || 0, l.prev = null, l.next = null, l;
  }
  /**
   * Reset and return a node to the pool for reuse.
   *
   * This helper clears the node fields and returns it to the node pool when
   * the pool has capacity. It is called for evicted or deleted nodes to
   * reduce allocation churn.
   *
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _freeNode(e) {
    e.key = null, e.value = null, e.weight = 0, e.expiresAt = 0, e.prev = null, e.next = null, this.pool.length < this.maxPoolSize && this.pool.push(e);
  }
  /**
   * Remove a node that has expired.
   *
   * Performs map deletion, linked-list unlink, invokes \`onExpire\`, returns the
   * node to the pool, and updates bookkeeping counters (\`misses\` and
   * \`expirations\`). This helper is called from several expiration paths and
   * centralizes the necessary cleanup steps.
   *
   * @private
   * @param {CacheNode} node
   * @param {number} now - Current timestamp (ms) used for comparisons
   * @param {boolean} [countMiss=false] - When true, increment the \`misses\` counter for user-facing lookups.
   */
  _removeExpiredNode(e, t, n = !1) {
    if (!e || !e.expiresAt || e.expiresAt > t) return !1;
    const r = e.key, l = e.value, u = e.next;
    this.map.delete(r), this.currentWeight -= e.weight || 0, this._cleanupCursor === e && (this._cleanupCursor = u), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e);
    try {
      this.onExpire && this.onExpire(r, l);
    } catch {
    }
    return this._freeNode(e), n && this.misses++, this.expirations++, !0;
  }
  /**
   * Fetch a node and validate expiry.
   * @private
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @param {boolean} [options.countMiss=false]
   * @returns {CacheNode|null}
   */
  _fetchValidNode(e, { ignoreExpiry: t = !1, countMiss: n = !1, allowExpired: r = !1 } = {}) {
    const l = this.map.get(e);
    return l ? !t && l.expiresAt && l.expiresAt <= Date.now() ? r ? l : (this._removeExpiredNode(l, Date.now(), n), null) : l : (n && this.misses++, null);
  }
  /**
   * Start a background refresh for an expired entry.
   *
   * If a refresh is already in flight for the key, this helper does nothing.
   * The refreshed value is written back to cache when the factory resolves.
   * Errors are swallowed so the stale value remains available.
   *
   * @private
   * @param {*} key
   * @param {Function} factory
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @returns {void}
   */
  _refreshStaleEntry(e, t, { ttl: n = void 0, weight: r = void 0 } = {}) {
    if (this._inflightPromises.has(e)) return;
    let l;
    try {
      l = Promise.resolve().then(() => t());
    } catch {
      return;
    }
    const u = l.then(
      (o) => {
        try {
          this.set(e, o, { ttl: n, weight: r });
        } catch {
        }
        return this._inflightPromises.delete(e), o;
      },
      (o) => {
        this._inflightPromises.delete(e);
      }
    );
    this._inflightPromises.set(e, u);
  }
  /**
   * Append a node to the tail (mark it most-recently used).
   * This updates the linked-list pointers appropriately and is used when
   * inserting new nodes or promoting a node to MRU.
   *
   * @private
   * @param {CacheNode} node - Node to append at the tail.
   * @returns {void}
   */
  _append(e) {
    if (!this.tail) {
      this.head = this.tail = e;
      return;
    }
    e.prev = this.tail, e.next = null, this.tail.next = e, this.tail = e;
  }
  /**
   * Remove a node from the linked list without freeing it. The node's
   * \`prev\`/\`next\` references are updated on neighbors and the node's links
   * are nulled. Does not modify \`this.map\` or bookkeeping counters; callers
   * are responsible for those actions.
   *
   * @private
   * @param {CacheNode} node - Node to unlink from the list.
   * @returns {void}
   */
  _remove(e) {
    const t = e.prev, n = e.next;
    t ? t.next = n : this.head = n, n ? n.prev = t : this.tail = t, e.prev = e.next = null;
  }
  /**
   * Move an existing node to the tail (mark as most-recently used).
   * Implemented as an unlink followed by an append. No-op when node is
   * already the tail.
   *
   * @private
   * @param {CacheNode} node - Node to promote to MRU position.
   * @returns {void}
   */
  _moveToTail(e) {
    this.tail !== e && (this._remove(e), this._append(e));
  }
  /**
   * Evict nodes from the head (least-recently used) until the cache
   * satisfies both \`maxEntries\` and \`maxWeight\` constraints. For each
   * evicted node \`onEvict\` is invoked if provided and the node is returned
   * to the node pool via \`_freeNode\`.
   *
   * @private
   * @returns {void}
   */
  _evictIfNeeded() {
    for (; this.map.size > this.maxEntries || this.currentWeight > this.maxWeight; ) {
      const e = this.head;
      if (!e) break;
      const t = e.next, n = e.key, r = e.value;
      this._cleanupCursor === e && (this._cleanupCursor = t), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e), this.map.delete(n), this.currentWeight -= e.weight || 0, this.evictions++;
      try {
        this.onEvict && this.onEvict(n, r, "evicted");
      } catch {
      }
      this._freeNode(e);
    }
  }
  /**
   * Set a value in the cache (add or update).
   * Marks the entry as most-recently used.
   * If \`rejectOversized\` is enabled and the computed/explicit weight exceeds \`maxWeight\`,
   * the insertion will be rejected and \`set\` returns \`false\` (otherwise returns \`this\`).
   * @param {*} key - Cache key
   * @param {*} value - Value to store
   * @param {Object} [options]
   * @param {number} [options.ttl] - Time-to-live in ms. Use \`null\` or \`Infinity\` to disable expiration.
   * @param {number} [options.weight] - Optional explicit weight for the entry. If omitted, \`weightFn\` is used.
   * @returns {this|false} \`this\` on success, or \`false\` when insertion was rejected due to oversize.
   */
  set(e, t, { ttl: n = this.defaultTTL, weight: r = null } = {}) {
    const l = Date.now(), u = n == null || n === 1 / 0 ? 0 : l + n;
    let o;
    if (r != null)
      o = r;
    else {
      try {
        o = this.weightFn(t);
      } catch {
        o = 0;
      }
      o == null && (o = 0);
    }
    const s = Number.isFinite(+o) ? Math.max(0, +o) : 0;
    if (this.rejectOversized && Number.isFinite(this.maxWeight) && s > this.maxWeight) {
      this.rejected++;
      try {
        this.onEvict && this.onEvict(e, t, "rejected-oversized");
      } catch {
      }
      return !1;
    }
    if (this.map.has(e)) {
      const a = this.map.get(e);
      this.currentWeight -= a.weight || 0, a.value = t, a.weight = s, a.expiresAt = u, this.currentWeight += a.weight || 0, this._moveToTail(a);
    } else {
      const a = this._allocNode(e, t, s, u);
      this.map.set(e, a), this._append(a), this.currentWeight += a.weight || 0, this._evictIfNeeded();
    }
    return this;
  }
  /**
   * Retrieve a value and mark it as recently used.
   * @param {*} key
   * @returns {*|undefined} The stored value or \`undefined\` if missing/expired.
   */
  get(e) {
    const t = this._fetchValidNode(e, { countMiss: !0 });
    if (t)
      return this._moveToTail(t), this.hits++, t.value;
  }
  /**
   * Get a value without updating recency.
   * Returns \`undefined\` for missing or expired entries.
   * @param {*} key
   * @returns {*|undefined}
   */
  peek(e) {
    const t = this._fetchValidNode(e);
    return t ? t.value : void 0;
  }
  /**
   * Check membership without affecting recency.
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false] If true, consider expired entries as present.
   * @returns {boolean}
   */
  has(e, { ignoreExpiry: t = !1 } = {}) {
    return !!this._fetchValidNode(e, { ignoreExpiry: t });
  }
  /**
   * Atomically read-or-compute a value for \`key\`.
   * If the key is present and not expired the stored value is returned.
   * Otherwise \`factory\` is invoked to produce the value which is stored
   * in the cache and returned. \`factory\` may be a value (in which case it
   * is stored directly) or a function. If the function returns a Promise,
   * the Promise is returned and the resolved value is stored when it settles.
   *
   * Note: this method does not deduplicate concurrent async factories —
   * for async factories prefer \`getOrSetAsync\` or use
   * \`PowerMemoizer\` for inflight deduplication.
   *
   * @param {*} key
   * @param {Function|*} factory - Function that produces the value or a direct value.
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @param {boolean} [options.staleWhileRevalidate=false] If true, return an expired value immediately and refresh the cache in the background.
   * @returns {*|Promise<*>}
   */
  getOrSet(e, t, { ttl: n = void 0, weight: r = void 0, staleWhileRevalidate: l = !1 } = {}) {
    const u = Date.now(), o = this._fetchValidNode(e, {
      countMiss: !1,
      allowExpired: l
    });
    if (o)
      if (o.expiresAt && o.expiresAt <= u) {
        if (typeof t == "function")
          return this._moveToTail(o), this.hits++, this._refreshStaleEntry(e, t, { ttl: n, weight: r }), o.value;
        this._removeExpiredNode(o, u, !0);
      } else
        return this._moveToTail(o), this.hits++, o.value;
    else
      this.misses++;
    if (typeof t == "function") {
      const s = t();
      return s && typeof s.then == "function" ? s.then((a) => {
        try {
          this.set(e, a, { ttl: n, weight: r });
        } catch {
        }
        return a;
      }) : (this.set(e, s, { ttl: n, weight: r }), s);
    }
    return this.set(e, t, { ttl: n, weight: r }), t;
  }
  /**
   * Bulk set multiple entries. Accepts an iterable/array of [key, value] pairs.
   * Computes weight once per value and applies a single eviction pass at the end.
   * @param {Iterable<[*,*]>} entries
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @returns {this}
   */
  setMany(e, { ttl: t = void 0, weight: n = void 0 } = {}) {
    const r = Date.now(), l = t == null || t === 1 / 0 ? 0 : r + t;
    for (const u of e) {
      if (!u) continue;
      const [o, s] = u;
      let a;
      if (n != null) a = n;
      else {
        try {
          a = this.weightFn(s);
        } catch {
          a = 0;
        }
        a == null && (a = 0);
      }
      const f = Number.isFinite(+a) ? Math.max(0, +a) : 0;
      if (this.map.has(o)) {
        const h = this.map.get(o);
        this.currentWeight -= h.weight || 0, h.value = s, h.weight = f, h.expiresAt = l, this.currentWeight += h.weight || 0, this._moveToTail(h);
      } else {
        const h = this._allocNode(o, s, f, l);
        this.map.set(o, h), this._append(h), this.currentWeight += h.weight || 0;
      }
    }
    return this._evictIfNeeded(), this;
  }
  /**
   * Bulk get multiple keys. Returns a Map of found entries.
   * @param {Iterable<*>} keys
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @returns {Map}
   */
  getMany(e, { ignoreExpiry: t = !1 } = {}) {
    const n = /* @__PURE__ */ new Map();
    for (const r of e) {
      const l = this._fetchValidNode(r, { ignoreExpiry: t, countMiss: !0 });
      l && (this._moveToTail(l), this.hits++, n.set(r, l.value));
    }
    return n;
  }
  /**
   * Touch an entry: update its recency and optionally refresh TTL without
   * reading or modifying the stored value.
   * @param {*} key
   * @param {number} [ttl] - Optional per-call TTL in ms. Use \`null\`/\`Infinity\` to disable expiry.
   * @returns {boolean} True if the entry existed (and was not expired), false otherwise.
   */
  touch(e, t = void 0) {
    const n = this._fetchValidNode(e);
    if (!n) return !1;
    const r = Date.now();
    return t !== void 0 && (n.expiresAt = t == null || t === 1 / 0 ? 0 : r + t), this._moveToTail(n), !0;
  }
  /**
   * Async read-or-compute with inflight deduplication.
   * If a factory is already running for \`key\`, returns the same Promise.
   * Otherwise invokes \`asyncFactory\` and stores the resolved value in cache.
   * @param {*} key
   * @param {Function} asyncFactory - Function returning a Promise or value.
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @param {boolean} [options.staleWhileRevalidate=false] If true, return an expired value immediately and refresh the cache in the background.
   * @returns {Promise<*>}
   */
  getOrSetAsync(e, t, { ttl: n = void 0, weight: r = void 0, staleWhileRevalidate: l = !1 } = {}) {
    if (typeof t != "function")
      return Promise.resolve(this.getOrSet(e, t, { ttl: n, weight: r }));
    const u = Date.now(), o = this.map.get(e);
    if (o)
      if (o.expiresAt && o.expiresAt <= u) {
        if (l)
          return this._moveToTail(o), this.hits++, this._refreshStaleEntry(e, t, { ttl: n, weight: r }), Promise.resolve(o.value);
        this._removeExpiredNode(o, u, !1);
      } else
        return this._moveToTail(o), this.hits++, Promise.resolve(o.value);
    if (this._inflightPromises.has(e)) return this._inflightPromises.get(e);
    this.misses++;
    let s;
    try {
      s = Promise.resolve().then(() => t());
    } catch (f) {
      return Promise.reject(f);
    }
    const a = s.then(
      (f) => {
        try {
          this.set(e, f, { ttl: n, weight: r });
        } catch {
        }
        return this._inflightPromises.delete(e), f;
      },
      (f) => {
        throw this._inflightPromises.delete(e), f;
      }
    );
    return this._inflightPromises.set(e, a), a;
  }
  /**
   * Check membership without affecting recency and verify the stored value is deep-equal
   * to the provided \`value\`.
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
   * @param {WeakMap} [options.seen] Optional reusable \`seen\` WeakMap for callers that
   *        perform many deep-equality checks and want to avoid per-call allocations.
   * @returns {boolean}
   */
  hasEqual(e, t, { ignoreExpiry: n = !1, seen: r = void 0 } = {}) {
    const l = this._fetchValidNode(e, { ignoreExpiry: n });
    if (!l) return !1;
    const u = l.value;
    return u === t ? !0 : typeof u !== "object" || u === null || typeof t !== "object" || t === null ? u === t : M(u, t, r);
  }
  /**
   * Variant accepting an explicit \`seen\` WeakMap for reuse across many checks.
   * @param {*} key
   * @param {*} value
   * @param {WeakMap} seen
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @returns {boolean}
   */
  hasEqualWithSeen(e, t, n, { ignoreExpiry: r = !1 } = {}) {
    return this.hasEqual(e, t, { ignoreExpiry: r, seen: n });
  }
  /**
   * Delete an entry from the cache.
   * @param {*} key
   * @returns {boolean} true if the key was removed.
   */
  delete(e) {
    const t = this.map.get(e);
    if (!t) return !1;
    const n = t.next;
    this.map.delete(e), this.currentWeight -= t.weight || 0, this._cleanupCursor === t && (this._cleanupCursor = n), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(t);
    try {
      this.onEvict && this.onEvict(t.key, t.value, "deleted");
    } catch {
    }
    return this._freeNode(t), !0;
  }
  /**
   * Clear the cache and return nodes to the pool.
   * @returns {void}
   */
  clear() {
    for (let e = this.head; e; ) {
      const t = e.next;
      this._freeNode(e), e = t;
    }
    this.head = this.tail = null, this.map.clear(), this.currentWeight = 0, this._cleanupCursor = null, this._cleanupCursorValid = !1;
  }
  /**
   * Remove expired entries by scanning from least-recently used to most.
   * @returns {void}
   */
  cleanupExpired() {
    return this.cleanupExpiredUpTo();
  }
  /**
   * Cleanup expired entries, scanning up to \`maxScan\` nodes.
   * Scanning resumes from an internal cursor so repeated small passes will cover the list
   * without repeatedly scanning the head of a very large cache. When the end is reached the
   * cursor wraps to the head.
   * @param {number} [maxScan=Infinity] Maximum nodes to scan in this pass.
   * @returns {number} Number of nodes scanned
   */
  cleanupExpiredUpTo(e = 1 / 0) {
    const t = Date.now();
    let n = 0, r = this._cleanupCursor && this._cleanupCursorValid ? this._cleanupCursor : this.head;
    for (; r && n < e; ) {
      const l = r.next;
      if (r.expiresAt && r.expiresAt <= t) {
        const u = r.key, o = r.value;
        this.map.delete(u), this.currentWeight -= r.weight || 0, this._cleanupCursor === r && (this._cleanupCursor = l), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(r);
        try {
          this.onExpire && this.onExpire(u, o);
        } catch {
        }
        this._freeNode(r), this.expirations++;
      }
      r = l, n++;
    }
    return this._cleanupCursor = r || this.head, this._cleanupCursorValid = !!this._cleanupCursor, n;
  }
  /**
   * Start periodic, non-blocking cleanup.
   * Accepts either a numeric interval (ms) or an options object \`{ interval, maxCleanupPerTick }\`.
   * The loop is implemented with \`setTimeout\` and scans up to \`maxCleanupPerTick\` nodes per pass
   * to avoid long event-loop stalls.
   * Note: call \`stopCleanup()\` to stop the periodic timer (for example, on application shutdown)
   * to ensure the internal timer is cleared and resources can be reclaimed.
   * @param {number|Object} [intervalOrOptions]
   * @param {number} [intervalOrOptions.interval] Interval between cleanup passes in ms.
   * @param {number} [intervalOrOptions.maxCleanupPerTick] Max nodes to scan per pass.
   * @returns {void}
   */
  startCleanup(e = {}) {
    let t, n;
    typeof e == "number" ? (t = e, n = this.maxCleanupPerTick) : (t = Number.isFinite(+e.interval) ? +e.interval : Math.max(1e3, Math.min(this.defaultTTL || 6e4, 6e4)), n = Number.isFinite(+e.maxCleanupPerTick) ? Math.max(1, +e.maxCleanupPerTick) : this.maxCleanupPerTick), this.stopCleanup(), this._cleanupParams = { interval: t, maxCleanupPerTick: n }, this._cleanupTimer = setTimeout(() => this._cleanupTick(), t);
  }
  /**
   * Stop periodic cleanup.
   * @returns {void}
   */
  stopCleanup() {
    this._cleanupTimer && (clearTimeout(this._cleanupTimer), this._cleanupTimer = null), this._cleanupRunning = !1, this._cleanupParams = null;
  }
  /**
   * Synchronous disposal hook (TC39 Explicit Resource Management).
   * Stops any background cleanup and clears the cache.
   */
  [Symbol.dispose]() {
    try {
      this.stopCleanup();
    } catch {
    }
    try {
      this.clear();
    } catch {
    }
  }
  /**
   * Asynchronous disposal hook. Provided for symmetry with \`using\`/\`await using\`.
   * Cache cleanup is synchronous so this simply performs the same actions and
   * returns a resolved Promise for await compatibility.
   */
  async [Symbol.asyncDispose]() {
    try {
      this.stopCleanup();
    } catch {
    }
    try {
      this.clear();
    } catch {
    }
  }
  /**
   * Prototype tick used by the cleanup timer loop. Separated to avoid
   * allocating a per-call closure inside \`startCleanup()\`.
   * @private
   */
  _cleanupTick() {
    if (this._cleanupTimer != null) {
      if (this._cleanupRunning) {
        this._cleanupTimer = setTimeout(() => this._cleanupTick(), this._cleanupParams.interval);
        return;
      }
      this._cleanupRunning = !0;
      try {
        this.cleanupExpiredUpTo(this._cleanupParams.maxCleanupPerTick);
      } finally {
        this._cleanupRunning = !1;
      }
      this._cleanupTimer = setTimeout(() => this._cleanupTick(), this._cleanupParams.interval);
    }
  }
  /**
   * Current number of entries in cache.
   * @returns {number}
   */
  get size() {
    return this.map.size;
  }
  /**
   * Hit rate as a fraction (hits / (hits + misses)).
   * @returns {number}
   */
  get hitRate() {
    const e = (this.hits || 0) + (this.misses || 0);
    return e ? this.hits / e : 0;
  }
  /**
   * Return runtime statistics for the cache.
   * @returns {{size:number, weight:number, hits:number, misses:number, evictions:number, rejected:number, poolSize:number}}
   */
  stats() {
    return {
      size: this.size,
      weight: this.currentWeight,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expirations: this.expirations,
      rejected: this.rejected,
      poolSize: this.pool.length
    };
  }
  /**
   * Resize the cache limits and evict if necessary.
   * @param {Object} options
   * @param {number} [options.maxEntries]
   * @param {number} [options.maxWeight]
   */
  resize({ maxEntries: e, maxWeight: t } = {}) {
    Number.isFinite(+e) && (this.maxEntries = Math.max(0, +e)), Number.isFinite(+t) && (this.maxWeight = Math.max(0, +t)), this._evictIfNeeded();
  }
  /**
   * Iterate entries in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   * @returns {IterableIterator<[*,*]>}
   */
  *entries(e = "MRU") {
    if (e === "MRU")
      for (let t = this.tail; t; t = t.prev) yield [t.key, t.value];
    else
      for (let t = this.head; t; t = t.next) yield [t.key, t.value];
  }
  [Symbol.iterator]() {
    return this.entries("MRU");
  }
  /**
   * Iterate keys in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *keys(e = "MRU") {
    for (const [t] of this.entries(e)) yield t;
  }
  /**
   * Iterate values in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *values(e = "MRU") {
    for (const [, t] of this.entries(e)) yield t;
  }
}
function M(i, e, t = void 0) {
  if (i === e) return !0;
  if (i == null || e == null || typeof i !== "object" || typeof e !== "object") return i === e;
  t || (t = /* @__PURE__ */ new WeakMap());
  let l = t.get(i);
  if (l && l.has(e)) return !0;
  if (l || (l = /* @__PURE__ */ new WeakSet(), t.set(i, l)), l.add(e), Object.getPrototypeOf(i) !== Object.getPrototypeOf(e)) return !1;
  if (typeof Uint8Array < "u" && i instanceof Uint8Array) {
    if (!(e instanceof Uint8Array) || i.length !== e.length) return !1;
    for (let s = 0; s < i.length; s++) if (i[s] !== e[s]) return !1;
    return !0;
  }
  if (Array.isArray(i)) {
    if (!Array.isArray(e) || i.length !== e.length) return !1;
    for (let s = 0; s < i.length; s++) if (!M(i[s], e[s], t)) return !1;
    return !0;
  }
  if (ArrayBuffer.isView(i)) {
    if (!ArrayBuffer.isView(e) || i.byteLength !== e.byteLength) return !1;
    const s = new Uint8Array(i.buffer, i.byteOffset || 0, i.byteLength), a = new Uint8Array(e.buffer, e.byteOffset || 0, e.byteLength);
    for (let f = 0; f < s.length; f++) if (s[f] !== a[f]) return !1;
    return !0;
  }
  if (i instanceof ArrayBuffer) {
    if (!(e instanceof ArrayBuffer) || i.byteLength !== e.byteLength) return !1;
    const s = new Uint8Array(i), a = new Uint8Array(e);
    for (let f = 0; f < s.length; f++) if (s[f] !== a[f]) return !1;
    return !0;
  }
  if (i instanceof Date)
    return e instanceof Date ? i.getTime() === e.getTime() : !1;
  if (i instanceof RegExp)
    return e instanceof RegExp ? i.toString() === e.toString() : !1;
  if (i instanceof Map) {
    if (!(e instanceof Map) || i.size !== e.size) return !1;
    for (const [s, a] of i)
      if (!e.has(s) || !M(a, e.get(s), t)) return !1;
    return !0;
  }
  if (i instanceof Set) {
    if (!(e instanceof Set) || i.size !== e.size) return !1;
    let s = !0;
    for (const a of i)
      if (a !== null && typeof a == "object") {
        s = !1;
        break;
      }
    if (s) {
      for (const a of i) if (!e.has(a)) return !1;
      return !0;
    }
    for (const a of i) {
      let f = !1;
      for (const h of e)
        if (M(a, h, t)) {
          f = !0;
          break;
        }
      if (!f) return !1;
    }
    return !0;
  }
  const u = Object.keys(i), o = Object.keys(e);
  if (u.length !== o.length) return !1;
  for (let s = 0; s < u.length; s++) {
    const a = u[s];
    if (!Object.prototype.hasOwnProperty.call(e, a) || !M(i[a], e[a], t)) return !1;
  }
  return !0;
}
class x {
  /**
   * Create a PowerMemoizer.
   * @param {Function} [fn] - Optional function to memoize immediately.
   * @param {Object} [options]
   * @param {function(...*):string} [options.keyResolver] - Function that maps the wrapped call args to a cache key. Defaults to \`JSON.stringify\` on args.
   *   Note: \`JSON.stringify(args)\` is convenient but can be expensive for large or deeply-nested
   *   arguments. If the wrapped function is on a hot path, provide a custom \`keyResolver\`
   *   that cheaply and deterministically maps arguments to keys (for example, join simple
   *   scalar args with a separator or use a fast hashing function).
   * @param {Object} [options.cacheOptions] - Options forwarded to the underlying \`PowerCache\` constructor. Supported keys: \`maxEntries\` (number), \`maxWeight\` (number), \`weightFn\` (function(value):number), \`defaultTTL\` (number, ms), \`maxPoolSize\` (number), \`rejectOversized\` (boolean), \`onEvict\` (function(key, value, reason)), \`onExpire\` (function(key, value)), \`initialPoolSize\` (number), \`maxCleanupPerTick\` (number). See \`PowerCache\` constructor JSDoc for details.
   * @param {number} [options.ttl] - Default TTL (ms) used when constructing the memoized wrapper for \`fn\`.
   * @param {number} [options.weight] - Default weight used when constructing the memoized wrapper for \`fn\`.
   */
  constructor(e, t = {}) {
    const {
      keyResolver: n = (...o) => JSON.stringify(o),
      cacheOptions: r = {},
      ttl: l,
      weight: u
    } = t;
    if (this.keyResolver = typeof n == "function" ? n : (...o) => JSON.stringify(o), this.cache = new D(r), this._inflight = /* @__PURE__ */ new Map(), this._defaultMemoizeOptions = {}, l !== void 0 && (this._defaultMemoizeOptions.ttl = l), u !== void 0 && (this._defaultMemoizeOptions.weight = u), typeof e == "function") {
      const o = this._memoize(e, this._defaultMemoizeOptions);
      o.get = (...s) => this.get(...s), o.has = (...s) => this.has(...s), o.delete = (...s) => this.delete(...s), o.clear = () => this.clear(), o.stats = () => this.stats(), o.cache = this.cache, o.original = e;
      try {
        Object.setPrototypeOf(o, x.prototype), o.constructor = x;
      } catch {
      }
      return o;
    }
    this.run = () => {
      throw new TypeError(
        "No function supplied to PowerMemoizer; call memoize(fn) or construct with a function."
      );
    }, this._originalFn = null;
  }
  /**
   * Wrap a function with memoization.
   * @private
   * @param {Function} fn - Function to memoize. May return a Promise.
   * @param {Object} [options]
   * @param {number} [options.ttl] - Per-entry TTL in ms (overrides cache default)
   * @param {number} [options.weight] - Optional explicit weight for the entry
   * @returns {Function} Memoized function
   */
  _memoize(e, { ttl: t, weight: n } = {}) {
    if (typeof e != "function") throw new TypeError("fn must be a function");
    const r = this;
    return function(...u) {
      const o = r.keyResolver(...u);
      if (r.cache.has(o)) return r.cache.get(o);
      if (r._inflight.has(o)) return r._inflight.get(o);
      const s = e(...u);
      if (s && typeof s.then == "function") {
        const a = s.then(
          (f) => {
            try {
              r.cache.set(o, f, { ttl: t, weight: n });
            } catch {
            }
            return r._inflight.delete(o), f;
          },
          (f) => {
            throw r._inflight.delete(o), f;
          }
        );
        return r._inflight.set(o, a), a;
      }
      return r.cache.set(o, s, { ttl: t, weight: n }), s;
    };
  }
  /**
   * Public API to memoize an arbitrary function using this PowerMemoizer instance's cache.
   * Mirrors the behavior used by the constructor when a function is supplied —
   * returns a callable memoized function with helpers attached (\`get\`, \`has\`, \`delete\`, \`clear\`, \`stats\`, \`cache\`).
   * @param {Function} fn - Function to memoize
   * @param {Object} [options] - Optional per-wrapper options { ttl, weight }
   * @returns {Function} Memoized function
   */
  memoize(e, t = {}) {
    if (typeof e != "function") throw new TypeError("fn must be a function");
    const n = t && (Object.prototype.hasOwnProperty.call(t, "ttl") || Object.prototype.hasOwnProperty.call(t, "weight")) ? t : this._defaultMemoizeOptions, r = this._memoize(e, n);
    r.get = (...l) => this.get(...l), r.has = (...l) => this.has(...l), r.delete = (...l) => this.delete(...l), r.clear = () => this.clear(), r.stats = () => this.stats(), r.cache = this.cache, r.original = e;
    try {
      Object.setPrototypeOf(r, x.prototype), r.constructor = x;
    } catch {
    }
    return r;
  }
  /**
   * Retrieve a cached value for the given call args (if present).
   * @param  {...*} args
   * @returns {*|undefined}
   */
  get(...e) {
    return this.cache.get(this.keyResolver(...e));
  }
  /**
   * Check presence for the given call args.
   * @param  {...*} args
   * @returns {boolean}
   */
  has(...e) {
    return this.cache.has(this.keyResolver(...e));
  }
  /**
   * Delete the cached entry for the given call args.
   * Also clears any inflight Promise for the key.
   * @param  {...*} args
   * @returns {boolean}
   */
  delete(...e) {
    const t = this.keyResolver(...e);
    return this._inflight.has(t) && this._inflight.delete(t), this.cache.delete(t);
  }
  /**
   * Clear all cached entries and any inflight markers.
   * @returns {void}
   */
  clear() {
    this._inflight.clear(), this.cache.clear();
  }
  /**
   * Expose underlying cache stats.
   * @returns {Object}
   */
  stats() {
    return this.cache.stats();
  }
}
let N = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function")
  try {
    const i = Number(process.hrtime.bigint() / 1000000n);
    N = Date.now() - i;
  } catch {
    N = null;
  }
class I {
  constructor(e = [], t = (n, r) => n < r ? -1 : n > r ? 1 : 0) {
    if (this.data = e, this.length = this.data.length, this.compare = t, this.length > 0)
      for (let n = (this.length >> 1) - 1; n >= 0; n--) this._down(n);
  }
  push(e) {
    this.data.push(e), this._up(this.length++);
  }
  pop() {
    if (this.length === 0) return;
    const e = this.data[0], t = this.data.pop();
    return --this.length > 0 && (this.data[0] = t, this._down(0)), e;
  }
  peek() {
    return this.data[0];
  }
  _up(e) {
    const { data: t, compare: n } = this, r = t[e];
    for (; e > 0; ) {
      const l = e - 1 >> 1, u = t[l];
      if (n(r, u) >= 0) break;
      t[e] = u, e = l;
    }
    t[e] = r;
  }
  _down(e) {
    const { data: t, compare: n } = this, r = this.length >> 1, l = t[e];
    for (; e < r; ) {
      let u = (e << 1) + 1;
      const o = u + 1;
      if (o < this.length && n(t[o], t[u]) < 0 && (u = o), n(t[u], l) >= 0) break;
      t[e] = t[u], e = u;
    }
    t[e] = l;
  }
}
function V(i, e = 1, t = !1) {
  let n = 1 / 0, r = 1 / 0, l = -1 / 0, u = -1 / 0;
  for (const [p, d] of i[0])
    p < n && (n = p), d < r && (r = d), p > l && (l = p), d > u && (u = d);
  const o = l - n, s = u - r, a = Math.max(e, Math.min(o, s));
  if (a === e) {
    const p = [n, r];
    return p.distance = 0, p;
  }
  const f = new I([], (p, d) => d.max - p.max);
  let h = j(i);
  const m = new P(n + o / 2, r + s / 2, 0, i);
  m.d > h.d && (h = m);
  let y = 2;
  function g(p, d, w) {
    const _ = new P(p, d, w, i);
    y++, _.max > h.d + e && f.push(_), _.d > h.d && (h = _, t && console.log(\`found best \${Math.round(1e4 * _.d) / 1e4} after \${y} probes\`));
  }
  let c = a / 2;
  for (let p = n; p < l; p += a)
    for (let d = r; d < u; d += a)
      g(p + c, d + c, c);
  for (; f.length; ) {
    const { max: p, x: d, y: w, h: _ } = f.pop();
    if (p - h.d <= e) break;
    c = _ / 2, g(d - c, w - c, c), g(d + c, w - c, c), g(d - c, w + c, c), g(d + c, w + c, c);
  }
  t && console.log(\`num probes: \${y}
best distance: \${h.d}\`);
  const A = [h.x, h.y];
  return A.distance = h.d, A;
}
function P(i, e, t, n) {
  this.x = i, this.y = e, this.h = t, this.d = $(i, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function $(i, e, t) {
  let n = !1, r = 1 / 0;
  for (const l of t)
    for (let u = 0, o = l.length, s = o - 1; u < o; s = u++) {
      const a = l[u], f = l[s];
      a[1] > e != f[1] > e && i < (f[0] - a[0]) * (e - a[1]) / (f[1] - a[1]) + a[0] && (n = !n), r = Math.min(r, q(i, e, a, f));
    }
  return r === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(r);
}
function j(i) {
  let e = 0, t = 0, n = 0;
  const r = i[0];
  for (let u = 0, o = r.length, s = o - 1; u < o; s = u++) {
    const a = r[u], f = r[s], h = a[0] * f[1] - f[0] * a[1];
    t += (a[0] + f[0]) * h, n += (a[1] + f[1]) * h, e += h * 3;
  }
  const l = new P(t / e, n / e, 0, i);
  return e === 0 || l.d < 0 ? new P(r[0][0], r[0][1], 0, i) : l;
}
function q(i, e, t, n) {
  let r = t[0], l = t[1], u = n[0] - r, o = n[1] - l;
  if (u !== 0 || o !== 0) {
    const s = ((i - r) * u + (e - l) * o) / (u * u + o * o);
    s > 1 ? (r = n[0], l = n[1]) : s > 0 && (r += u * s, l += o * s);
  }
  return u = i - r, o = e - l, u * u + o * o;
}
var k = 63710088e-1;
function S(i, e, t = {}) {
  const n = { type: "Feature" };
  return (t.id === 0 || t.id) && (n.id = t.id), t.bbox && (n.bbox = t.bbox), n.properties = e || {}, n.geometry = i, n;
}
function G(i, e = {}) {
  const t = { type: "FeatureCollection" };
  return e.id && (t.id = e.id), e.bbox && (t.bbox = e.bbox), t.features = i, t;
}
function z(i, e) {
  var t, n, r, l, u, o, s, a, f, h, m = 0, y = i.type === "FeatureCollection", g = i.type === "Feature", c = y ? i.features.length : 1;
  for (t = 0; t < c; t++) {
    for (o = y ? (
      // @ts-expect-error: Known type conflict
      i.features[t].geometry
    ) : g ? (
      // @ts-expect-error: Known type conflict
      i.geometry
    ) : i, a = y ? (
      // @ts-expect-error: Known type conflict
      i.features[t].properties
    ) : g ? (
      // @ts-expect-error: Known type conflict
      i.properties
    ) : {}, f = y ? (
      // @ts-expect-error: Known type conflict
      i.features[t].bbox
    ) : g ? (
      // @ts-expect-error: Known type conflict
      i.bbox
    ) : void 0, h = y ? (
      // @ts-expect-error: Known type conflict
      i.features[t].id
    ) : g ? (
      // @ts-expect-error: Known type conflict
      i.id
    ) : void 0, s = o ? o.type === "GeometryCollection" : !1, u = s ? o.geometries.length : 1, r = 0; r < u; r++) {
      if (l = s ? o.geometries[r] : o, l === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            m,
            a,
            f,
            h
          ) === !1
        )
          return !1;
        continue;
      }
      switch (l.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            // @ts-expect-error: Known type conflict
            e(
              l,
              m,
              a,
              f,
              h
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (n = 0; n < l.geometries.length; n++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                l.geometries[n],
                m,
                a,
                f,
                h
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    m++;
  }
}
function X(i, e, t) {
  var n = t;
  return z(
    i,
    function(r, l, u, o, s) {
      l === 0 && t === void 0 ? n = r : n = e(
        // @ts-expect-error: Known type conflict
        n,
        r,
        l,
        u,
        o,
        s
      );
    }
  ), n;
}
function J(i, e) {
  z(i, function(t, n, r, l, u) {
    var o = t === null ? null : t.type;
    switch (o) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            S(t, r, { bbox: l, id: u }),
            n,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var s;
    switch (o) {
      case "MultiPoint":
        s = "Point";
        break;
      case "MultiLineString":
        s = "LineString";
        break;
      case "MultiPolygon":
        s = "Polygon";
        break;
    }
    for (
      var a = 0;
      // @ts-expect-error: Known type conflict
      a < t.coordinates.length;
      a++
    ) {
      var f = t.coordinates[a], h = {
        type: s,
        coordinates: f
      };
      if (
        // @ts-expect-error: Known type conflict
        e(S(h, r), n, a) === !1
      )
        return !1;
    }
  });
}
function Y(i) {
  return X(
    i,
    (e, t) => e + Q(t),
    0
  );
}
function Q(i) {
  let e = 0, t;
  switch (i.type) {
    case "Polygon":
      return O(i.coordinates);
    case "MultiPolygon":
      for (t = 0; t < i.coordinates.length; t++)
        e += O(i.coordinates[t]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function O(i) {
  let e = 0;
  if (i && i.length > 0) {
    e += Math.abs(B(i[0]));
    for (let t = 1; t < i.length; t++)
      e -= Math.abs(B(i[t]));
  }
  return e;
}
var K = k * k / 2, b = Math.PI / 180;
function B(i) {
  const e = i.length - 1;
  if (e <= 2) return 0;
  let t = 0, n = 0;
  for (; n < e; ) {
    const r = i[n], l = i[n + 1 === e ? 0 : n + 1], u = i[n + 2 >= e ? (n + 2) % e : n + 2], o = r[0] * b, s = l[1] * b, a = u[0] * b;
    t += (a - o) * Math.sin(s), n++;
  }
  return t * K;
}
function H(i) {
  if (!i) throw new Error("geojson is required");
  var e = [];
  return J(i, function(t) {
    e.push(t);
  }), G(e);
}
const E = /* @__PURE__ */ new WeakMap();
let Z = 0;
const C = (i) => (E.has(i) || E.set(i, String(Z++)), E.get(i)), ee = new x(
  (i, e, t) => {
    const [n, r, l] = e.split("|").map(Number), u = Math.pow(2, n) * t, o = 85.05112878, s = 1;
    return i[0].some((f) => {
      const h = Math.max(Math.min(f[1], o), -o), m = Math.sin(h * Math.PI / 180), y = (f[0] + 180) / 360, g = 0.5 - Math.log((1 + m) / (1 - m)) / (4 * Math.PI), c = y * u, A = g * u, p = Math.floor(c / t), d = Math.floor(A / t), w = Math.floor(c - p * t), _ = Math.floor(A - d * t);
      return d !== l || p !== r || w <= s || _ <= s || w >= t - s || _ >= t - s;
    });
  },
  {
    keyResolver: (i, e, t) => \`\${C(i)}|\${e}|\${t}\`
  }
), te = new x(
  (i, e = !1) => {
    const t = e ? /* @__PURE__ */ new Set() : null;
    let n = 0;
    const r = (s) => Array.isArray(s) && s.length >= 2 && typeof s[0] == "number" && typeof s[1] == "number", l = (s) => {
      e ? t.add(s.slice(0, 3).join(",")) : n++;
    };
    function u(s) {
      if (r(s)) {
        l(s);
        return;
      }
      if (Array.isArray(s)) for (const a of s) u(a);
    }
    function o(s) {
      if (s) {
        if (s.type === "FeatureCollection") {
          for (const a of s.features || []) o(a);
          return;
        }
        if (s.type === "Feature") {
          o(s.geometry);
          return;
        }
        if (s.type === "GeometryCollection") {
          for (const a of s.geometries || []) o(a);
          return;
        }
        s.coordinates !== void 0 && u(s.coordinates);
      }
    }
    return o(i), e ? t.size : n;
  },
  {
    keyResolver: (i, e = !1) => \`\${C(i)}|\${e ? "unique" : "__count"}\`
  }
), ie = (i, e) => {
  if (!i || i.geometry?.type !== "Polygon")
    throw new Error("Non-Polygon geometry");
  const t = i.geometry.coordinates, n = V(t, e);
  if (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1]))
    throw new Error("Invalid polylabel result");
  return {
    type: "Point",
    coordinates: [n[0], n[1]]
  };
};
new x(ie, {
  keyResolver: (i, e) => \`\${C(i)}|\${e === void 0 ? "__default" : String(e)}\`
});
const ne = (i, e) => {
  if (!i || typeof i != "object" || !i.geometry)
    return 0;
  if (e === "meters" || e === "m")
    return Y(i);
  const t = i.geometry.coordinates;
  if (!Array.isArray(t) || t.length === 0)
    return 0;
  const n = i.geometry.type === "Polygon" ? t[0] : t[0]?.[0];
  if (!Array.isArray(n))
    return 0;
  let r = 0;
  for (let l = 0; l < n.length; l++) {
    const [u, o] = n[l], [s, a] = n[(l + 1) % n.length];
    r += u * a - s * o;
  }
  return Math.abs(r) / 2;
};
new x(ne, {
  keyResolver: (i, e) => \`\${C(i)}|\${e === void 0 ? "__planar" : String(e)}\`
});
function re(i, e = {}) {
  const { unique: t = !1 } = e;
  if (i && typeof i == "object")
    return te(i, t);
  const n = t ? /* @__PURE__ */ new Set() : null;
  let r = 0;
  const l = (a) => Array.isArray(a) && a.length >= 2 && typeof a[0] == "number" && typeof a[1] == "number", u = (a) => {
    t ? n.add(a.slice(0, 3).join(",")) : r++;
  };
  function o(a) {
    if (l(a)) {
      u(a);
      return;
    }
    if (Array.isArray(a)) for (const f of a) o(f);
  }
  function s(a) {
    if (a) {
      if (a.type === "FeatureCollection") {
        for (const f of a.features || []) s(f);
        return;
      }
      if (a.type === "Feature") {
        s(a.geometry);
        return;
      }
      if (a.type === "GeometryCollection") {
        for (const f of a.geometries || []) s(f);
        return;
      }
      a.coordinates !== void 0 && o(a.coordinates);
    }
  }
  return s(i), t ? n.size : r;
}
const R = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
R.onmessage = (i) => {
  const e = i.data, t = W(e);
  t.tolerance;
  const n = t.unique, r = t.tileSize, l = /* @__PURE__ */ new Map();
  t.collection.features.forEach((h) => {
    const m = h.id, y = l.get(m) || [];
    y.push(h), l.set(m, y);
  });
  let u = 0;
  const o = /* @__PURE__ */ new Map();
  l.forEach((h, m) => {
    const y = H({ type: "FeatureCollection", features: h }), g = { type: "FeatureCollection", features: [] };
    g.features = y.features.filter((c) => c.geometry.type === "Polygon").map((c, A) => {
      const p = \`\${n}|\${m}|\${A}\`, d = ee(c.geometry.coordinates, c.properties._tile, r), w = Object.assign({}, c.properties, { _index: p, clipped: d }), _ = { type: "Feature", geometry: c.geometry, properties: w };
      return u += re(_), _;
    }), o.set(m, g);
  });
  const s = Object.fromEntries(o), a = Object.assign({}, s, { unique: n, type: "simplified", size: u }), f = L(a).buffer;
  R.postMessage(f, [f]);
};
`, N = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", O], { type: "text/javascript;charset=utf-8" });
function X(h) {
  let e;
  try {
    if (e = N && (self.URL || self.webkitURL).createObjectURL(N), !e) throw "";
    const n = new Worker(e, {
      type: "module",
      name: h?.name
    });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), n;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(O),
      {
        type: "module",
        name: h?.name
      }
    );
  }
}
const z = `let oe, le;
function st() {
  return oe !== void 0 ? oe === !1 ? null : oe : typeof TextEncoder < "u" ? (oe = new TextEncoder(), oe) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (oe = { encode: (i) => new Uint8Array(Buffer.from(i)) }, oe) : (oe = !1, null);
}
function ot() {
  return le !== void 0 ? le === !1 ? null : le : typeof TextDecoder < "u" ? (le = new TextDecoder(), le) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (le = { decode: (i) => Buffer.from(i).toString("utf8") }, le) : (le = !1, null);
}
const lt = (i) => {
  if (i instanceof Uint8Array) return i;
  if (ArrayBuffer.isView(i)) return new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  if (i instanceof ArrayBuffer) return new Uint8Array(i);
  const e = JSON.stringify(i), t = st();
  if (t && typeof t.encode == "function") return t.encode(e);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, ut = (i) => {
  let e;
  if (i instanceof Uint8Array) e = i;
  else if (ArrayBuffer.isView(i)) e = new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  else if (i instanceof ArrayBuffer) e = new Uint8Array(i);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(i))
    e = new Uint8Array(i);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  const t = ot();
  if (t && typeof t.decode == "function") return JSON.parse(t.decode(e));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(e));
  throw new Error("No TextDecoder or Buffer available to decode object");
};
class ht {
  /**
   * Create a PowerCache.
   * @param {Object} [options]
   * @param {number} [options.maxEntries=Infinity] Maximum number of entries.
   * @param {number} [options.maxWeight=Infinity] Maximum total weight across entries.
   * @param {function(*):number} [options.weightFn] Function to compute weight for a value.
   * @param {number} [options.defaultTTL=60000] Default TTL (ms) for entries.
   * @param {number} [options.maxPoolSize=1000] Maximum node pool size for reuse.
   * @param {boolean} [options.rejectOversized=false] If true, inserting an item whose weight > \`maxWeight\` will be rejected.
   * @param {function(*, *, string):void} [options.onEvict] Callback invoked when an item is evicted/deleted/rejected. Called as \`(key, value, reason)\` where reason is \`'evicted'|'deleted'|'rejected-oversized'\`.
   * @param {function(*, *):void} [options.onExpire] Callback invoked when an item expires. Called as \`(key, value)\`.
   * @param {number} [options.initialPoolSize=0] Prefill the internal node pool with this many nodes (capped by \`maxPoolSize\`).
   * @param {number} [options.maxCleanupPerTick=100] Default max nodes scanned per cleanup tick when running \`startCleanup()\`.
   * @param {boolean} [options.eagerCleanupOnRead=false] If true, \`peek()\` and \`has()\` will eagerly remove expired nodes when observed.
   */
  constructor({
    maxEntries: e = 1 / 0,
    maxWeight: t = 1 / 0,
    weightFn: n = () => 1,
    defaultTTL: r = 6e4,
    maxPoolSize: l = 1e3,
    rejectOversized: f = !1,
    onEvict: o = null,
    onExpire: a = null,
    initialPoolSize: h = 0,
    maxCleanupPerTick: E = 100,
    eagerCleanupOnRead: S = !1
  } = {}) {
    this.maxEntries = e, this.maxWeight = t, this.weightFn = n, this.defaultTTL = r, this.maxPoolSize = l, this.rejectOversized = !!f, this.onEvict = typeof o == "function" ? o : null, this.onExpire = typeof a == "function" ? a : null, this.maxCleanupPerTick = Number.isFinite(+E) ? Math.max(1, +E) : 100, this.eagerCleanupOnRead = !!S, this.map = /* @__PURE__ */ new Map(), this.head = null, this.tail = null, this.pool = [];
    for (let A = 0; A < Math.min(h || 0, this.maxPoolSize); A++)
      this.pool.push({ key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null });
    this.currentWeight = 0, this.hits = 0, this.misses = 0, this.evictions = 0, this.rejected = 0, this.expirations = 0, this._cleanupTimer = null, this._cleanupRunning = !1, this._cleanupParams = null, this._cleanupCursor = null, this._cleanupCursorValid = !1, this._inflightPromises = /* @__PURE__ */ new Map();
  }
  /**
   * Allocate a pool node or create a new one.
   *
   * This helper either reuses a node from the internal \`pool\` or creates a
   * fresh node object. The returned node is initialized with the provided
   * key/value/weight/expiresAt and has its \`prev\`/\`next\` pointers nulled.
   *
   * @private
   * @param {*} key
   * @param {*} value
   * @param {number} weight
   * @param {number} expiresAt
   * @returns {CacheNode}
   */
  _allocNode(e, t, n, r) {
    const l = this.pool.pop() || {
      key: null,
      value: null,
      weight: 0,
      expiresAt: 0,
      prev: null,
      next: null
    };
    return l.key = e, l.value = t, l.weight = n || 0, l.expiresAt = r || 0, l.prev = null, l.next = null, l;
  }
  /**
   * Reset and return a node to the pool for reuse.
   *
   * This helper clears the node fields and returns it to the node pool when
   * the pool has capacity. It is called for evicted or deleted nodes to
   * reduce allocation churn.
   *
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _freeNode(e) {
    e.key = null, e.value = null, e.weight = 0, e.expiresAt = 0, e.prev = null, e.next = null, this.pool.length < this.maxPoolSize && this.pool.push(e);
  }
  /**
   * Remove a node that has expired.
   *
   * Performs map deletion, linked-list unlink, invokes \`onExpire\`, returns the
   * node to the pool, and updates bookkeeping counters (\`misses\` and
   * \`expirations\`). This helper is called from several expiration paths and
   * centralizes the necessary cleanup steps.
   *
   * @private
   * @param {CacheNode} node
   * @param {number} now - Current timestamp (ms) used for comparisons
   * @param {boolean} [countMiss=false] - When true, increment the \`misses\` counter for user-facing lookups.
   */
  _removeExpiredNode(e, t, n = !1) {
    if (!e || !e.expiresAt || e.expiresAt > t) return !1;
    const r = e.key, l = e.value, f = e.next;
    this.map.delete(r), this.currentWeight -= e.weight || 0, this._cleanupCursor === e && (this._cleanupCursor = f), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e);
    try {
      this.onExpire && this.onExpire(r, l);
    } catch {
    }
    return this._freeNode(e), n && this.misses++, this.expirations++, !0;
  }
  /**
   * Fetch a node and validate expiry.
   * @private
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @param {boolean} [options.countMiss=false]
   * @returns {CacheNode|null}
   */
  _fetchValidNode(e, { ignoreExpiry: t = !1, countMiss: n = !1, allowExpired: r = !1 } = {}) {
    const l = this.map.get(e);
    return l ? !t && l.expiresAt && l.expiresAt <= Date.now() ? r ? l : (this._removeExpiredNode(l, Date.now(), n), null) : l : (n && this.misses++, null);
  }
  /**
   * Start a background refresh for an expired entry.
   *
   * If a refresh is already in flight for the key, this helper does nothing.
   * The refreshed value is written back to cache when the factory resolves.
   * Errors are swallowed so the stale value remains available.
   *
   * @private
   * @param {*} key
   * @param {Function} factory
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @returns {void}
   */
  _refreshStaleEntry(e, t, { ttl: n = void 0, weight: r = void 0 } = {}) {
    if (this._inflightPromises.has(e)) return;
    let l;
    try {
      l = Promise.resolve().then(() => t());
    } catch {
      return;
    }
    const f = l.then(
      (o) => {
        try {
          this.set(e, o, { ttl: n, weight: r });
        } catch {
        }
        return this._inflightPromises.delete(e), o;
      },
      (o) => {
        this._inflightPromises.delete(e);
      }
    );
    this._inflightPromises.set(e, f);
  }
  /**
   * Append a node to the tail (mark it most-recently used).
   * This updates the linked-list pointers appropriately and is used when
   * inserting new nodes or promoting a node to MRU.
   *
   * @private
   * @param {CacheNode} node - Node to append at the tail.
   * @returns {void}
   */
  _append(e) {
    if (!this.tail) {
      this.head = this.tail = e;
      return;
    }
    e.prev = this.tail, e.next = null, this.tail.next = e, this.tail = e;
  }
  /**
   * Remove a node from the linked list without freeing it. The node's
   * \`prev\`/\`next\` references are updated on neighbors and the node's links
   * are nulled. Does not modify \`this.map\` or bookkeeping counters; callers
   * are responsible for those actions.
   *
   * @private
   * @param {CacheNode} node - Node to unlink from the list.
   * @returns {void}
   */
  _remove(e) {
    const t = e.prev, n = e.next;
    t ? t.next = n : this.head = n, n ? n.prev = t : this.tail = t, e.prev = e.next = null;
  }
  /**
   * Move an existing node to the tail (mark as most-recently used).
   * Implemented as an unlink followed by an append. No-op when node is
   * already the tail.
   *
   * @private
   * @param {CacheNode} node - Node to promote to MRU position.
   * @returns {void}
   */
  _moveToTail(e) {
    this.tail !== e && (this._remove(e), this._append(e));
  }
  /**
   * Evict nodes from the head (least-recently used) until the cache
   * satisfies both \`maxEntries\` and \`maxWeight\` constraints. For each
   * evicted node \`onEvict\` is invoked if provided and the node is returned
   * to the node pool via \`_freeNode\`.
   *
   * @private
   * @returns {void}
   */
  _evictIfNeeded() {
    for (; this.map.size > this.maxEntries || this.currentWeight > this.maxWeight; ) {
      const e = this.head;
      if (!e) break;
      const t = e.next, n = e.key, r = e.value;
      this._cleanupCursor === e && (this._cleanupCursor = t), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e), this.map.delete(n), this.currentWeight -= e.weight || 0, this.evictions++;
      try {
        this.onEvict && this.onEvict(n, r, "evicted");
      } catch {
      }
      this._freeNode(e);
    }
  }
  /**
   * Set a value in the cache (add or update).
   * Marks the entry as most-recently used.
   * If \`rejectOversized\` is enabled and the computed/explicit weight exceeds \`maxWeight\`,
   * the insertion will be rejected and \`set\` returns \`false\` (otherwise returns \`this\`).
   * @param {*} key - Cache key
   * @param {*} value - Value to store
   * @param {Object} [options]
   * @param {number} [options.ttl] - Time-to-live in ms. Use \`null\` or \`Infinity\` to disable expiration.
   * @param {number} [options.weight] - Optional explicit weight for the entry. If omitted, \`weightFn\` is used.
   * @returns {this|false} \`this\` on success, or \`false\` when insertion was rejected due to oversize.
   */
  set(e, t, { ttl: n = this.defaultTTL, weight: r = null } = {}) {
    const l = Date.now(), f = n == null || n === 1 / 0 ? 0 : l + n;
    let o;
    if (r != null)
      o = r;
    else {
      try {
        o = this.weightFn(t);
      } catch {
        o = 0;
      }
      o == null && (o = 0);
    }
    const a = Number.isFinite(+o) ? Math.max(0, +o) : 0;
    if (this.rejectOversized && Number.isFinite(this.maxWeight) && a > this.maxWeight) {
      this.rejected++;
      try {
        this.onEvict && this.onEvict(e, t, "rejected-oversized");
      } catch {
      }
      return !1;
    }
    if (this.map.has(e)) {
      const h = this.map.get(e);
      this.currentWeight -= h.weight || 0, h.value = t, h.weight = a, h.expiresAt = f, this.currentWeight += h.weight || 0, this._moveToTail(h);
    } else {
      const h = this._allocNode(e, t, a, f);
      this.map.set(e, h), this._append(h), this.currentWeight += h.weight || 0, this._evictIfNeeded();
    }
    return this;
  }
  /**
   * Retrieve a value and mark it as recently used.
   * @param {*} key
   * @returns {*|undefined} The stored value or \`undefined\` if missing/expired.
   */
  get(e) {
    const t = this._fetchValidNode(e, { countMiss: !0 });
    if (t)
      return this._moveToTail(t), this.hits++, t.value;
  }
  /**
   * Get a value without updating recency.
   * Returns \`undefined\` for missing or expired entries.
   * @param {*} key
   * @returns {*|undefined}
   */
  peek(e) {
    const t = this._fetchValidNode(e);
    return t ? t.value : void 0;
  }
  /**
   * Check membership without affecting recency.
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false] If true, consider expired entries as present.
   * @returns {boolean}
   */
  has(e, { ignoreExpiry: t = !1 } = {}) {
    return !!this._fetchValidNode(e, { ignoreExpiry: t });
  }
  /**
   * Atomically read-or-compute a value for \`key\`.
   * If the key is present and not expired the stored value is returned.
   * Otherwise \`factory\` is invoked to produce the value which is stored
   * in the cache and returned. \`factory\` may be a value (in which case it
   * is stored directly) or a function. If the function returns a Promise,
   * the Promise is returned and the resolved value is stored when it settles.
   *
   * Note: this method does not deduplicate concurrent async factories —
   * for async factories prefer \`getOrSetAsync\` or use
   * \`PowerMemoizer\` for inflight deduplication.
   *
   * @param {*} key
   * @param {Function|*} factory - Function that produces the value or a direct value.
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @param {boolean} [options.staleWhileRevalidate=false] If true, return an expired value immediately and refresh the cache in the background.
   * @returns {*|Promise<*>}
   */
  getOrSet(e, t, { ttl: n = void 0, weight: r = void 0, staleWhileRevalidate: l = !1 } = {}) {
    const f = Date.now(), o = this._fetchValidNode(e, {
      countMiss: !1,
      allowExpired: l
    });
    if (o)
      if (o.expiresAt && o.expiresAt <= f) {
        if (typeof t == "function")
          return this._moveToTail(o), this.hits++, this._refreshStaleEntry(e, t, { ttl: n, weight: r }), o.value;
        this._removeExpiredNode(o, f, !0);
      } else
        return this._moveToTail(o), this.hits++, o.value;
    else
      this.misses++;
    if (typeof t == "function") {
      const a = t();
      return a && typeof a.then == "function" ? a.then((h) => {
        try {
          this.set(e, h, { ttl: n, weight: r });
        } catch {
        }
        return h;
      }) : (this.set(e, a, { ttl: n, weight: r }), a);
    }
    return this.set(e, t, { ttl: n, weight: r }), t;
  }
  /**
   * Bulk set multiple entries. Accepts an iterable/array of [key, value] pairs.
   * Computes weight once per value and applies a single eviction pass at the end.
   * @param {Iterable<[*,*]>} entries
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @returns {this}
   */
  setMany(e, { ttl: t = void 0, weight: n = void 0 } = {}) {
    const r = Date.now(), l = t == null || t === 1 / 0 ? 0 : r + t;
    for (const f of e) {
      if (!f) continue;
      const [o, a] = f;
      let h;
      if (n != null) h = n;
      else {
        try {
          h = this.weightFn(a);
        } catch {
          h = 0;
        }
        h == null && (h = 0);
      }
      const E = Number.isFinite(+h) ? Math.max(0, +h) : 0;
      if (this.map.has(o)) {
        const S = this.map.get(o);
        this.currentWeight -= S.weight || 0, S.value = a, S.weight = E, S.expiresAt = l, this.currentWeight += S.weight || 0, this._moveToTail(S);
      } else {
        const S = this._allocNode(o, a, E, l);
        this.map.set(o, S), this._append(S), this.currentWeight += S.weight || 0;
      }
    }
    return this._evictIfNeeded(), this;
  }
  /**
   * Bulk get multiple keys. Returns a Map of found entries.
   * @param {Iterable<*>} keys
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @returns {Map}
   */
  getMany(e, { ignoreExpiry: t = !1 } = {}) {
    const n = /* @__PURE__ */ new Map();
    for (const r of e) {
      const l = this._fetchValidNode(r, { ignoreExpiry: t, countMiss: !0 });
      l && (this._moveToTail(l), this.hits++, n.set(r, l.value));
    }
    return n;
  }
  /**
   * Touch an entry: update its recency and optionally refresh TTL without
   * reading or modifying the stored value.
   * @param {*} key
   * @param {number} [ttl] - Optional per-call TTL in ms. Use \`null\`/\`Infinity\` to disable expiry.
   * @returns {boolean} True if the entry existed (and was not expired), false otherwise.
   */
  touch(e, t = void 0) {
    const n = this._fetchValidNode(e);
    if (!n) return !1;
    const r = Date.now();
    return t !== void 0 && (n.expiresAt = t == null || t === 1 / 0 ? 0 : r + t), this._moveToTail(n), !0;
  }
  /**
   * Async read-or-compute with inflight deduplication.
   * If a factory is already running for \`key\`, returns the same Promise.
   * Otherwise invokes \`asyncFactory\` and stores the resolved value in cache.
   * @param {*} key
   * @param {Function} asyncFactory - Function returning a Promise or value.
   * @param {Object} [options]
   * @param {number} [options.ttl]
   * @param {number} [options.weight]
   * @param {boolean} [options.staleWhileRevalidate=false] If true, return an expired value immediately and refresh the cache in the background.
   * @returns {Promise<*>}
   */
  getOrSetAsync(e, t, { ttl: n = void 0, weight: r = void 0, staleWhileRevalidate: l = !1 } = {}) {
    if (typeof t != "function")
      return Promise.resolve(this.getOrSet(e, t, { ttl: n, weight: r }));
    const f = Date.now(), o = this.map.get(e);
    if (o)
      if (o.expiresAt && o.expiresAt <= f) {
        if (l)
          return this._moveToTail(o), this.hits++, this._refreshStaleEntry(e, t, { ttl: n, weight: r }), Promise.resolve(o.value);
        this._removeExpiredNode(o, f, !1);
      } else
        return this._moveToTail(o), this.hits++, Promise.resolve(o.value);
    if (this._inflightPromises.has(e)) return this._inflightPromises.get(e);
    this.misses++;
    let a;
    try {
      a = Promise.resolve().then(() => t());
    } catch (E) {
      return Promise.reject(E);
    }
    const h = a.then(
      (E) => {
        try {
          this.set(e, E, { ttl: n, weight: r });
        } catch {
        }
        return this._inflightPromises.delete(e), E;
      },
      (E) => {
        throw this._inflightPromises.delete(e), E;
      }
    );
    return this._inflightPromises.set(e, h), h;
  }
  /**
   * Check membership without affecting recency and verify the stored value is deep-equal
   * to the provided \`value\`.
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
   * @param {WeakMap} [options.seen] Optional reusable \`seen\` WeakMap for callers that
   *        perform many deep-equality checks and want to avoid per-call allocations.
   * @returns {boolean}
   */
  hasEqual(e, t, { ignoreExpiry: n = !1, seen: r = void 0 } = {}) {
    const l = this._fetchValidNode(e, { ignoreExpiry: n });
    if (!l) return !1;
    const f = l.value;
    return f === t ? !0 : typeof f !== "object" || f === null || typeof t !== "object" || t === null ? f === t : pe(f, t, r);
  }
  /**
   * Variant accepting an explicit \`seen\` WeakMap for reuse across many checks.
   * @param {*} key
   * @param {*} value
   * @param {WeakMap} seen
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false]
   * @returns {boolean}
   */
  hasEqualWithSeen(e, t, n, { ignoreExpiry: r = !1 } = {}) {
    return this.hasEqual(e, t, { ignoreExpiry: r, seen: n });
  }
  /**
   * Delete an entry from the cache.
   * @param {*} key
   * @returns {boolean} true if the key was removed.
   */
  delete(e) {
    const t = this.map.get(e);
    if (!t) return !1;
    const n = t.next;
    this.map.delete(e), this.currentWeight -= t.weight || 0, this._cleanupCursor === t && (this._cleanupCursor = n), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(t);
    try {
      this.onEvict && this.onEvict(t.key, t.value, "deleted");
    } catch {
    }
    return this._freeNode(t), !0;
  }
  /**
   * Clear the cache and return nodes to the pool.
   * @returns {void}
   */
  clear() {
    for (let e = this.head; e; ) {
      const t = e.next;
      this._freeNode(e), e = t;
    }
    this.head = this.tail = null, this.map.clear(), this.currentWeight = 0, this._cleanupCursor = null, this._cleanupCursorValid = !1;
  }
  /**
   * Remove expired entries by scanning from least-recently used to most.
   * @returns {void}
   */
  cleanupExpired() {
    return this.cleanupExpiredUpTo();
  }
  /**
   * Cleanup expired entries, scanning up to \`maxScan\` nodes.
   * Scanning resumes from an internal cursor so repeated small passes will cover the list
   * without repeatedly scanning the head of a very large cache. When the end is reached the
   * cursor wraps to the head.
   * @param {number} [maxScan=Infinity] Maximum nodes to scan in this pass.
   * @returns {number} Number of nodes scanned
   */
  cleanupExpiredUpTo(e = 1 / 0) {
    const t = Date.now();
    let n = 0, r = this._cleanupCursor && this._cleanupCursorValid ? this._cleanupCursor : this.head;
    for (; r && n < e; ) {
      const l = r.next;
      if (r.expiresAt && r.expiresAt <= t) {
        const f = r.key, o = r.value;
        this.map.delete(f), this.currentWeight -= r.weight || 0, this._cleanupCursor === r && (this._cleanupCursor = l), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(r);
        try {
          this.onExpire && this.onExpire(f, o);
        } catch {
        }
        this._freeNode(r), this.expirations++;
      }
      r = l, n++;
    }
    return this._cleanupCursor = r || this.head, this._cleanupCursorValid = !!this._cleanupCursor, n;
  }
  /**
   * Start periodic, non-blocking cleanup.
   * Accepts either a numeric interval (ms) or an options object \`{ interval, maxCleanupPerTick }\`.
   * The loop is implemented with \`setTimeout\` and scans up to \`maxCleanupPerTick\` nodes per pass
   * to avoid long event-loop stalls.
   * Note: call \`stopCleanup()\` to stop the periodic timer (for example, on application shutdown)
   * to ensure the internal timer is cleared and resources can be reclaimed.
   * @param {number|Object} [intervalOrOptions]
   * @param {number} [intervalOrOptions.interval] Interval between cleanup passes in ms.
   * @param {number} [intervalOrOptions.maxCleanupPerTick] Max nodes to scan per pass.
   * @returns {void}
   */
  startCleanup(e = {}) {
    let t, n;
    typeof e == "number" ? (t = e, n = this.maxCleanupPerTick) : (t = Number.isFinite(+e.interval) ? +e.interval : Math.max(1e3, Math.min(this.defaultTTL || 6e4, 6e4)), n = Number.isFinite(+e.maxCleanupPerTick) ? Math.max(1, +e.maxCleanupPerTick) : this.maxCleanupPerTick), this.stopCleanup(), this._cleanupParams = { interval: t, maxCleanupPerTick: n }, this._cleanupTimer = setTimeout(() => this._cleanupTick(), t);
  }
  /**
   * Stop periodic cleanup.
   * @returns {void}
   */
  stopCleanup() {
    this._cleanupTimer && (clearTimeout(this._cleanupTimer), this._cleanupTimer = null), this._cleanupRunning = !1, this._cleanupParams = null;
  }
  /**
   * Synchronous disposal hook (TC39 Explicit Resource Management).
   * Stops any background cleanup and clears the cache.
   */
  [Symbol.dispose]() {
    try {
      this.stopCleanup();
    } catch {
    }
    try {
      this.clear();
    } catch {
    }
  }
  /**
   * Asynchronous disposal hook. Provided for symmetry with \`using\`/\`await using\`.
   * Cache cleanup is synchronous so this simply performs the same actions and
   * returns a resolved Promise for await compatibility.
   */
  async [Symbol.asyncDispose]() {
    try {
      this.stopCleanup();
    } catch {
    }
    try {
      this.clear();
    } catch {
    }
  }
  /**
   * Prototype tick used by the cleanup timer loop. Separated to avoid
   * allocating a per-call closure inside \`startCleanup()\`.
   * @private
   */
  _cleanupTick() {
    if (this._cleanupTimer != null) {
      if (this._cleanupRunning) {
        this._cleanupTimer = setTimeout(() => this._cleanupTick(), this._cleanupParams.interval);
        return;
      }
      this._cleanupRunning = !0;
      try {
        this.cleanupExpiredUpTo(this._cleanupParams.maxCleanupPerTick);
      } finally {
        this._cleanupRunning = !1;
      }
      this._cleanupTimer = setTimeout(() => this._cleanupTick(), this._cleanupParams.interval);
    }
  }
  /**
   * Current number of entries in cache.
   * @returns {number}
   */
  get size() {
    return this.map.size;
  }
  /**
   * Hit rate as a fraction (hits / (hits + misses)).
   * @returns {number}
   */
  get hitRate() {
    const e = (this.hits || 0) + (this.misses || 0);
    return e ? this.hits / e : 0;
  }
  /**
   * Return runtime statistics for the cache.
   * @returns {{size:number, weight:number, hits:number, misses:number, evictions:number, rejected:number, poolSize:number}}
   */
  stats() {
    return {
      size: this.size,
      weight: this.currentWeight,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expirations: this.expirations,
      rejected: this.rejected,
      poolSize: this.pool.length
    };
  }
  /**
   * Resize the cache limits and evict if necessary.
   * @param {Object} options
   * @param {number} [options.maxEntries]
   * @param {number} [options.maxWeight]
   */
  resize({ maxEntries: e, maxWeight: t } = {}) {
    Number.isFinite(+e) && (this.maxEntries = Math.max(0, +e)), Number.isFinite(+t) && (this.maxWeight = Math.max(0, +t)), this._evictIfNeeded();
  }
  /**
   * Iterate entries in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   * @returns {IterableIterator<[*,*]>}
   */
  *entries(e = "MRU") {
    if (e === "MRU")
      for (let t = this.tail; t; t = t.prev) yield [t.key, t.value];
    else
      for (let t = this.head; t; t = t.next) yield [t.key, t.value];
  }
  [Symbol.iterator]() {
    return this.entries("MRU");
  }
  /**
   * Iterate keys in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *keys(e = "MRU") {
    for (const [t] of this.entries(e)) yield t;
  }
  /**
   * Iterate values in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *values(e = "MRU") {
    for (const [, t] of this.entries(e)) yield t;
  }
}
function pe(i, e, t = void 0) {
  if (i === e) return !0;
  if (i == null || e == null || typeof i !== "object" || typeof e !== "object") return i === e;
  t || (t = /* @__PURE__ */ new WeakMap());
  let l = t.get(i);
  if (l && l.has(e)) return !0;
  if (l || (l = /* @__PURE__ */ new WeakSet(), t.set(i, l)), l.add(e), Object.getPrototypeOf(i) !== Object.getPrototypeOf(e)) return !1;
  if (typeof Uint8Array < "u" && i instanceof Uint8Array) {
    if (!(e instanceof Uint8Array) || i.length !== e.length) return !1;
    for (let a = 0; a < i.length; a++) if (i[a] !== e[a]) return !1;
    return !0;
  }
  if (Array.isArray(i)) {
    if (!Array.isArray(e) || i.length !== e.length) return !1;
    for (let a = 0; a < i.length; a++) if (!pe(i[a], e[a], t)) return !1;
    return !0;
  }
  if (ArrayBuffer.isView(i)) {
    if (!ArrayBuffer.isView(e) || i.byteLength !== e.byteLength) return !1;
    const a = new Uint8Array(i.buffer, i.byteOffset || 0, i.byteLength), h = new Uint8Array(e.buffer, e.byteOffset || 0, e.byteLength);
    for (let E = 0; E < a.length; E++) if (a[E] !== h[E]) return !1;
    return !0;
  }
  if (i instanceof ArrayBuffer) {
    if (!(e instanceof ArrayBuffer) || i.byteLength !== e.byteLength) return !1;
    const a = new Uint8Array(i), h = new Uint8Array(e);
    for (let E = 0; E < a.length; E++) if (a[E] !== h[E]) return !1;
    return !0;
  }
  if (i instanceof Date)
    return e instanceof Date ? i.getTime() === e.getTime() : !1;
  if (i instanceof RegExp)
    return e instanceof RegExp ? i.toString() === e.toString() : !1;
  if (i instanceof Map) {
    if (!(e instanceof Map) || i.size !== e.size) return !1;
    for (const [a, h] of i)
      if (!e.has(a) || !pe(h, e.get(a), t)) return !1;
    return !0;
  }
  if (i instanceof Set) {
    if (!(e instanceof Set) || i.size !== e.size) return !1;
    let a = !0;
    for (const h of i)
      if (h !== null && typeof h == "object") {
        a = !1;
        break;
      }
    if (a) {
      for (const h of i) if (!e.has(h)) return !1;
      return !0;
    }
    for (const h of i) {
      let E = !1;
      for (const S of e)
        if (pe(h, S, t)) {
          E = !0;
          break;
        }
      if (!E) return !1;
    }
    return !0;
  }
  const f = Object.keys(i), o = Object.keys(e);
  if (f.length !== o.length) return !1;
  for (let a = 0; a < f.length; a++) {
    const h = f[a];
    if (!Object.prototype.hasOwnProperty.call(e, h) || !pe(i[h], e[h], t)) return !1;
  }
  return !0;
}
class re {
  /**
   * Create a PowerMemoizer.
   * @param {Function} [fn] - Optional function to memoize immediately.
   * @param {Object} [options]
   * @param {function(...*):string} [options.keyResolver] - Function that maps the wrapped call args to a cache key. Defaults to \`JSON.stringify\` on args.
   *   Note: \`JSON.stringify(args)\` is convenient but can be expensive for large or deeply-nested
   *   arguments. If the wrapped function is on a hot path, provide a custom \`keyResolver\`
   *   that cheaply and deterministically maps arguments to keys (for example, join simple
   *   scalar args with a separator or use a fast hashing function).
   * @param {Object} [options.cacheOptions] - Options forwarded to the underlying \`PowerCache\` constructor. Supported keys: \`maxEntries\` (number), \`maxWeight\` (number), \`weightFn\` (function(value):number), \`defaultTTL\` (number, ms), \`maxPoolSize\` (number), \`rejectOversized\` (boolean), \`onEvict\` (function(key, value, reason)), \`onExpire\` (function(key, value)), \`initialPoolSize\` (number), \`maxCleanupPerTick\` (number). See \`PowerCache\` constructor JSDoc for details.
   * @param {number} [options.ttl] - Default TTL (ms) used when constructing the memoized wrapper for \`fn\`.
   * @param {number} [options.weight] - Default weight used when constructing the memoized wrapper for \`fn\`.
   */
  constructor(e, t = {}) {
    const {
      keyResolver: n = (...o) => JSON.stringify(o),
      cacheOptions: r = {},
      ttl: l,
      weight: f
    } = t;
    if (this.keyResolver = typeof n == "function" ? n : (...o) => JSON.stringify(o), this.cache = new ht(r), this._inflight = /* @__PURE__ */ new Map(), this._defaultMemoizeOptions = {}, l !== void 0 && (this._defaultMemoizeOptions.ttl = l), f !== void 0 && (this._defaultMemoizeOptions.weight = f), typeof e == "function") {
      const o = this._memoize(e, this._defaultMemoizeOptions);
      o.get = (...a) => this.get(...a), o.has = (...a) => this.has(...a), o.delete = (...a) => this.delete(...a), o.clear = () => this.clear(), o.stats = () => this.stats(), o.cache = this.cache, o.original = e;
      try {
        Object.setPrototypeOf(o, re.prototype), o.constructor = re;
      } catch {
      }
      return o;
    }
    this.run = () => {
      throw new TypeError(
        "No function supplied to PowerMemoizer; call memoize(fn) or construct with a function."
      );
    }, this._originalFn = null;
  }
  /**
   * Wrap a function with memoization.
   * @private
   * @param {Function} fn - Function to memoize. May return a Promise.
   * @param {Object} [options]
   * @param {number} [options.ttl] - Per-entry TTL in ms (overrides cache default)
   * @param {number} [options.weight] - Optional explicit weight for the entry
   * @returns {Function} Memoized function
   */
  _memoize(e, { ttl: t, weight: n } = {}) {
    if (typeof e != "function") throw new TypeError("fn must be a function");
    const r = this;
    return function(...f) {
      const o = r.keyResolver(...f);
      if (r.cache.has(o)) return r.cache.get(o);
      if (r._inflight.has(o)) return r._inflight.get(o);
      const a = e(...f);
      if (a && typeof a.then == "function") {
        const h = a.then(
          (E) => {
            try {
              r.cache.set(o, E, { ttl: t, weight: n });
            } catch {
            }
            return r._inflight.delete(o), E;
          },
          (E) => {
            throw r._inflight.delete(o), E;
          }
        );
        return r._inflight.set(o, h), h;
      }
      return r.cache.set(o, a, { ttl: t, weight: n }), a;
    };
  }
  /**
   * Public API to memoize an arbitrary function using this PowerMemoizer instance's cache.
   * Mirrors the behavior used by the constructor when a function is supplied —
   * returns a callable memoized function with helpers attached (\`get\`, \`has\`, \`delete\`, \`clear\`, \`stats\`, \`cache\`).
   * @param {Function} fn - Function to memoize
   * @param {Object} [options] - Optional per-wrapper options { ttl, weight }
   * @returns {Function} Memoized function
   */
  memoize(e, t = {}) {
    if (typeof e != "function") throw new TypeError("fn must be a function");
    const n = t && (Object.prototype.hasOwnProperty.call(t, "ttl") || Object.prototype.hasOwnProperty.call(t, "weight")) ? t : this._defaultMemoizeOptions, r = this._memoize(e, n);
    r.get = (...l) => this.get(...l), r.has = (...l) => this.has(...l), r.delete = (...l) => this.delete(...l), r.clear = () => this.clear(), r.stats = () => this.stats(), r.cache = this.cache, r.original = e;
    try {
      Object.setPrototypeOf(r, re.prototype), r.constructor = re;
    } catch {
    }
    return r;
  }
  /**
   * Retrieve a cached value for the given call args (if present).
   * @param  {...*} args
   * @returns {*|undefined}
   */
  get(...e) {
    return this.cache.get(this.keyResolver(...e));
  }
  /**
   * Check presence for the given call args.
   * @param  {...*} args
   * @returns {boolean}
   */
  has(...e) {
    return this.cache.has(this.keyResolver(...e));
  }
  /**
   * Delete the cached entry for the given call args.
   * Also clears any inflight Promise for the key.
   * @param  {...*} args
   * @returns {boolean}
   */
  delete(...e) {
    const t = this.keyResolver(...e);
    return this._inflight.has(t) && this._inflight.delete(t), this.cache.delete(t);
  }
  /**
   * Clear all cached entries and any inflight markers.
   * @returns {void}
   */
  clear() {
    this._inflight.clear(), this.cache.clear();
  }
  /**
   * Expose underlying cache stats.
   * @returns {Object}
   */
  stats() {
    return this.cache.stats();
  }
}
let Ue = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function")
  try {
    const i = Number(process.hrtime.bigint() / 1000000n);
    Ue = Date.now() - i;
  } catch {
    Ue = null;
  }
class ft {
  constructor(e = [], t = (n, r) => n < r ? -1 : n > r ? 1 : 0) {
    if (this.data = e, this.length = this.data.length, this.compare = t, this.length > 0)
      for (let n = (this.length >> 1) - 1; n >= 0; n--) this._down(n);
  }
  push(e) {
    this.data.push(e), this._up(this.length++);
  }
  pop() {
    if (this.length === 0) return;
    const e = this.data[0], t = this.data.pop();
    return --this.length > 0 && (this.data[0] = t, this._down(0)), e;
  }
  peek() {
    return this.data[0];
  }
  _up(e) {
    const { data: t, compare: n } = this, r = t[e];
    for (; e > 0; ) {
      const l = e - 1 >> 1, f = t[l];
      if (n(r, f) >= 0) break;
      t[e] = f, e = l;
    }
    t[e] = r;
  }
  _down(e) {
    const { data: t, compare: n } = this, r = this.length >> 1, l = t[e];
    for (; e < r; ) {
      let f = (e << 1) + 1;
      const o = f + 1;
      if (o < this.length && n(t[o], t[f]) < 0 && (f = o), n(t[f], l) >= 0) break;
      t[e] = t[f], e = f;
    }
    t[e] = l;
  }
}
function at(i, e = 1, t = !1) {
  let n = 1 / 0, r = 1 / 0, l = -1 / 0, f = -1 / 0;
  for (const [B, _] of i[0])
    B < n && (n = B), _ < r && (r = _), B > l && (l = B), _ > f && (f = _);
  const o = l - n, a = f - r, h = Math.max(e, Math.min(o, a));
  if (h === e) {
    const B = [n, r];
    return B.distance = 0, B;
  }
  const E = new ft([], (B, _) => _.max - B.max);
  let S = pt(i);
  const A = new Ee(n + o / 2, r + a / 2, 0, i);
  A.d > S.d && (S = A);
  let N = 2;
  function O(B, _, j) {
    const W = new Ee(B, _, j, i);
    N++, W.max > S.d + e && E.push(W), W.d > S.d && (S = W, t && console.log(\`found best \${Math.round(1e4 * W.d) / 1e4} after \${N} probes\`));
  }
  let b = h / 2;
  for (let B = n; B < l; B += h)
    for (let _ = r; _ < f; _ += h)
      O(B + b, _ + b, b);
  for (; E.length; ) {
    const { max: B, x: _, y: j, h: W } = E.pop();
    if (B - S.d <= e) break;
    b = W / 2, O(_ - b, j - b, b), O(_ + b, j - b, b), O(_ - b, j + b, b), O(_ + b, j + b, b);
  }
  t && console.log(\`num probes: \${N}
best distance: \${S.d}\`);
  const k = [S.x, S.y];
  return k.distance = S.d, k;
}
function Ee(i, e, t, n) {
  this.x = i, this.y = e, this.h = t, this.d = ct(i, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function ct(i, e, t) {
  let n = !1, r = 1 / 0;
  for (const l of t)
    for (let f = 0, o = l.length, a = o - 1; f < o; a = f++) {
      const h = l[f], E = l[a];
      h[1] > e != E[1] > e && i < (E[0] - h[0]) * (e - h[1]) / (E[1] - h[1]) + h[0] && (n = !n), r = Math.min(r, gt(i, e, h, E));
    }
  return r === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(r);
}
function pt(i) {
  let e = 0, t = 0, n = 0;
  const r = i[0];
  for (let f = 0, o = r.length, a = o - 1; f < o; a = f++) {
    const h = r[f], E = r[a], S = h[0] * E[1] - E[0] * h[1];
    t += (h[0] + E[0]) * S, n += (h[1] + E[1]) * S, e += S * 3;
  }
  const l = new Ee(t / e, n / e, 0, i);
  return e === 0 || l.d < 0 ? new Ee(r[0][0], r[0][1], 0, i) : l;
}
function gt(i, e, t, n) {
  let r = t[0], l = t[1], f = n[0] - r, o = n[1] - l;
  if (f !== 0 || o !== 0) {
    const a = ((i - r) * f + (e - l) * o) / (f * f + o * o);
    a > 1 ? (r = n[0], l = n[1]) : a > 0 && (r += f * a, l += o * a);
  }
  return f = i - r, o = e - l, f * f + o * o;
}
var Ve = 63710088e-1;
function _e(i, e, t = {}) {
  const n = { type: "Feature" };
  return (t.id === 0 || t.id) && (n.id = t.id), t.bbox && (n.bbox = t.bbox), n.properties = e || {}, n.geometry = i, n;
}
function yt(i, e, t = {}) {
  for (const r of i) {
    if (r.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (r[r.length - 1].length !== r[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let l = 0; l < r[r.length - 1].length; l++)
      if (r[r.length - 1][l] !== r[0][l])
        throw new Error("First and last Position are not equivalent.");
  }
  return _e({
    type: "Polygon",
    coordinates: i
  }, e, t);
}
function dt(i, e = {}) {
  const t = { type: "FeatureCollection" };
  return e.id && (t.id = e.id), e.bbox && (t.bbox = e.bbox), t.features = i, t;
}
function mt(i, e, t = {}) {
  return _e({
    type: "MultiPolygon",
    coordinates: i
  }, e, t);
}
function De(i, e) {
  var t, n, r, l, f, o, a, h, E, S, A = 0, N = i.type === "FeatureCollection", O = i.type === "Feature", b = N ? i.features.length : 1;
  for (t = 0; t < b; t++) {
    for (o = N ? (
      // @ts-expect-error: Known type conflict
      i.features[t].geometry
    ) : O ? (
      // @ts-expect-error: Known type conflict
      i.geometry
    ) : i, h = N ? (
      // @ts-expect-error: Known type conflict
      i.features[t].properties
    ) : O ? (
      // @ts-expect-error: Known type conflict
      i.properties
    ) : {}, E = N ? (
      // @ts-expect-error: Known type conflict
      i.features[t].bbox
    ) : O ? (
      // @ts-expect-error: Known type conflict
      i.bbox
    ) : void 0, S = N ? (
      // @ts-expect-error: Known type conflict
      i.features[t].id
    ) : O ? (
      // @ts-expect-error: Known type conflict
      i.id
    ) : void 0, a = o ? o.type === "GeometryCollection" : !1, f = a ? o.geometries.length : 1, r = 0; r < f; r++) {
      if (l = a ? o.geometries[r] : o, l === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            A,
            h,
            E,
            S
          ) === !1
        )
          return !1;
        continue;
      }
      switch (l.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            // @ts-expect-error: Known type conflict
            e(
              l,
              A,
              h,
              E,
              S
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (n = 0; n < l.geometries.length; n++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                l.geometries[n],
                A,
                h,
                E,
                S
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    A++;
  }
}
function xt(i, e, t) {
  var n = t;
  return De(
    i,
    function(r, l, f, o, a) {
      l === 0 && t === void 0 ? n = r : n = e(
        // @ts-expect-error: Known type conflict
        n,
        r,
        l,
        f,
        o,
        a
      );
    }
  ), n;
}
function wt(i, e) {
  De(i, function(t, n, r, l, f) {
    var o = t === null ? null : t.type;
    switch (o) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            _e(t, r, { bbox: l, id: f }),
            n,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var a;
    switch (o) {
      case "MultiPoint":
        a = "Point";
        break;
      case "MultiLineString":
        a = "LineString";
        break;
      case "MultiPolygon":
        a = "Polygon";
        break;
    }
    for (
      var h = 0;
      // @ts-expect-error: Known type conflict
      h < t.coordinates.length;
      h++
    ) {
      var E = t.coordinates[h], S = {
        type: a,
        coordinates: E
      };
      if (
        // @ts-expect-error: Known type conflict
        e(_e(S, r), n, h) === !1
      )
        return !1;
    }
  });
}
function vt(i) {
  return xt(
    i,
    (e, t) => e + Et(t),
    0
  );
}
function Et(i) {
  let e = 0, t;
  switch (i.type) {
    case "Polygon":
      return $e(i.coordinates);
    case "MultiPolygon":
      for (t = 0; t < i.coordinates.length; t++)
        e += $e(i.coordinates[t]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function $e(i) {
  let e = 0;
  if (i && i.length > 0) {
    e += Math.abs(je(i[0]));
    for (let t = 1; t < i.length; t++)
      e -= Math.abs(je(i[t]));
  }
  return e;
}
var _t = Ve * Ve / 2, Ne = Math.PI / 180;
function je(i) {
  const e = i.length - 1;
  if (e <= 2) return 0;
  let t = 0, n = 0;
  for (; n < e; ) {
    const r = i[n], l = i[n + 1 === e ? 0 : n + 1], f = i[n + 2 >= e ? (n + 2) % e : n + 2], o = r[0] * Ne, a = l[1] * Ne, h = f[0] * Ne;
    t += (h - o) * Math.sin(a), n++;
  }
  return t * _t;
}
var St = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Oe = Math.ceil, H = Math.floor, $ = "[BigNumber Error] ", We = $ + "Number primitive has more than 15 significant digits: ", J = 1e14, R = 14, Ce = 9007199254740991, Ie = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], ue = 1e7, D = 1e9;
function Qe(i) {
  var e, t, n, r = _.prototype = { constructor: _, toString: null, valueOf: null }, l = new _(1), f = 20, o = 4, a = -7, h = 21, E = -1e7, S = 1e7, A = !1, N = 1, O = 0, b = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, k = "0123456789abcdefghijklmnopqrstuvwxyz", B = !0;
  function _(s, u) {
    var c, x, g, d, v, p, y, w, m = this;
    if (!(m instanceof _)) return new _(s, u);
    if (u == null) {
      if (s && s._isBigNumber === !0) {
        m.s = s.s, !s.c || s.e > S ? m.c = m.e = null : s.e < E ? m.c = [m.e = 0] : (m.e = s.e, m.c = s.c.slice());
        return;
      }
      if ((p = typeof s == "number") && s * 0 == 0) {
        if (m.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (d = 0, v = s; v >= 10; v /= 10, d++) ;
          d > S ? m.c = m.e = null : (m.e = d, m.c = [s]);
          return;
        }
        w = String(s);
      } else {
        if (!St.test(w = String(s))) return n(m, w, p);
        m.s = w.charCodeAt(0) == 45 ? (w = w.slice(1), -1) : 1;
      }
      (d = w.indexOf(".")) > -1 && (w = w.replace(".", "")), (v = w.search(/e/i)) > 0 ? (d < 0 && (d = v), d += +w.slice(v + 1), w = w.substring(0, v)) : d < 0 && (d = w.length);
    } else {
      if (F(u, 2, k.length, "Base"), u == 10 && B)
        return m = new _(s), X(m, f + m.e + 1, o);
      if (w = String(s), p = typeof s == "number") {
        if (s * 0 != 0) return n(m, w, p, u);
        if (m.s = 1 / s < 0 ? (w = w.slice(1), -1) : 1, _.DEBUG && w.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(We + s);
      } else
        m.s = w.charCodeAt(0) === 45 ? (w = w.slice(1), -1) : 1;
      for (c = k.slice(0, u), d = v = 0, y = w.length; v < y; v++)
        if (c.indexOf(x = w.charAt(v)) < 0) {
          if (x == ".") {
            if (v > d) {
              d = y;
              continue;
            }
          } else if (!g && (w == w.toUpperCase() && (w = w.toLowerCase()) || w == w.toLowerCase() && (w = w.toUpperCase()))) {
            g = !0, v = -1, d = 0;
            continue;
          }
          return n(m, String(s), p, u);
        }
      p = !1, w = t(w, u, 10, m.s), (d = w.indexOf(".")) > -1 ? w = w.replace(".", "") : d = w.length;
    }
    for (v = 0; w.charCodeAt(v) === 48; v++) ;
    for (y = w.length; w.charCodeAt(--y) === 48; ) ;
    if (w = w.slice(v, ++y)) {
      if (y -= v, p && _.DEBUG && y > 15 && (s > Ce || s !== H(s)))
        throw Error(We + m.s * s);
      if ((d = d - v - 1) > S)
        m.c = m.e = null;
      else if (d < E)
        m.c = [m.e = 0];
      else {
        if (m.e = d, m.c = [], v = (d + 1) % R, d < 0 && (v += R), v < y) {
          for (v && m.c.push(+w.slice(0, v)), y -= R; v < y; )
            m.c.push(+w.slice(v, v += R));
          v = R - (w = w.slice(v)).length;
        } else
          v -= y;
        for (; v--; w += "0") ;
        m.c.push(+w);
      }
    } else
      m.c = [m.e = 0];
  }
  _.clone = Qe, _.ROUND_UP = 0, _.ROUND_DOWN = 1, _.ROUND_CEIL = 2, _.ROUND_FLOOR = 3, _.ROUND_HALF_UP = 4, _.ROUND_HALF_DOWN = 5, _.ROUND_HALF_EVEN = 6, _.ROUND_HALF_CEIL = 7, _.ROUND_HALF_FLOOR = 8, _.EUCLID = 9, _.config = _.set = function(s) {
    var u, c;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(u = "DECIMAL_PLACES") && (c = s[u], F(c, 0, D, u), f = c), s.hasOwnProperty(u = "ROUNDING_MODE") && (c = s[u], F(c, 0, 8, u), o = c), s.hasOwnProperty(u = "EXPONENTIAL_AT") && (c = s[u], c && c.pop ? (F(c[0], -D, 0, u), F(c[1], 0, D, u), a = c[0], h = c[1]) : (F(c, -D, D, u), a = -(h = c < 0 ? -c : c))), s.hasOwnProperty(u = "RANGE"))
          if (c = s[u], c && c.pop)
            F(c[0], -D, -1, u), F(c[1], 1, D, u), E = c[0], S = c[1];
          else if (F(c, -D, D, u), c)
            E = -(S = c < 0 ? -c : c);
          else
            throw Error($ + u + " cannot be zero: " + c);
        if (s.hasOwnProperty(u = "CRYPTO"))
          if (c = s[u], c === !!c)
            if (c)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                A = c;
              else
                throw A = !c, Error($ + "crypto unavailable");
            else
              A = c;
          else
            throw Error($ + u + " not true or false: " + c);
        if (s.hasOwnProperty(u = "MODULO_MODE") && (c = s[u], F(c, 0, 9, u), N = c), s.hasOwnProperty(u = "POW_PRECISION") && (c = s[u], F(c, 0, D, u), O = c), s.hasOwnProperty(u = "FORMAT"))
          if (c = s[u], typeof c == "object") b = c;
          else throw Error($ + u + " not an object: " + c);
        if (s.hasOwnProperty(u = "ALPHABET"))
          if (c = s[u], typeof c == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(c))
            B = c.slice(0, 10) == "0123456789", k = c;
          else
            throw Error($ + u + " invalid: " + c);
      } else
        throw Error($ + "Object expected: " + s);
    return {
      DECIMAL_PLACES: f,
      ROUNDING_MODE: o,
      EXPONENTIAL_AT: [a, h],
      RANGE: [E, S],
      CRYPTO: A,
      MODULO_MODE: N,
      POW_PRECISION: O,
      FORMAT: b,
      ALPHABET: k
    };
  }, _.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!_.DEBUG) return !0;
    var u, c, x = s.c, g = s.e, d = s.s;
    e: if ({}.toString.call(x) == "[object Array]") {
      if ((d === 1 || d === -1) && g >= -D && g <= D && g === H(g)) {
        if (x[0] === 0) {
          if (g === 0 && x.length === 1) return !0;
          break e;
        }
        if (u = (g + 1) % R, u < 1 && (u += R), String(x[0]).length == u) {
          for (u = 0; u < x.length; u++)
            if (c = x[u], c < 0 || c >= J || c !== H(c)) break e;
          if (c !== 0) return !0;
        }
      }
    } else if (x === null && g === null && (d === null || d === 1 || d === -1))
      return !0;
    throw Error($ + "Invalid BigNumber: " + s);
  }, _.maximum = _.max = function() {
    return W(arguments, -1);
  }, _.minimum = _.min = function() {
    return W(arguments, 1);
  }, _.random = (function() {
    var s = 9007199254740992, u = Math.random() * s & 2097151 ? function() {
      return H(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(c) {
      var x, g, d, v, p, y = 0, w = [], m = new _(l);
      if (c == null ? c = f : F(c, 0, D), v = Oe(c / R), A)
        if (crypto.getRandomValues) {
          for (x = crypto.getRandomValues(new Uint32Array(v *= 2)); y < v; )
            p = x[y] * 131072 + (x[y + 1] >>> 11), p >= 9e15 ? (g = crypto.getRandomValues(new Uint32Array(2)), x[y] = g[0], x[y + 1] = g[1]) : (w.push(p % 1e14), y += 2);
          y = v / 2;
        } else if (crypto.randomBytes) {
          for (x = crypto.randomBytes(v *= 7); y < v; )
            p = (x[y] & 31) * 281474976710656 + x[y + 1] * 1099511627776 + x[y + 2] * 4294967296 + x[y + 3] * 16777216 + (x[y + 4] << 16) + (x[y + 5] << 8) + x[y + 6], p >= 9e15 ? crypto.randomBytes(7).copy(x, y) : (w.push(p % 1e14), y += 7);
          y = v / 7;
        } else
          throw A = !1, Error($ + "crypto unavailable");
      if (!A)
        for (; y < v; )
          p = u(), p < 9e15 && (w[y++] = p % 1e14);
      for (v = w[--y], c %= R, v && c && (p = Ie[R - c], w[y] = H(v / p) * p); w[y] === 0; w.pop(), y--) ;
      if (y < 0)
        w = [d = 0];
      else {
        for (d = -1; w[0] === 0; w.splice(0, 1), d -= R) ;
        for (y = 1, p = w[0]; p >= 10; p /= 10, y++) ;
        y < R && (d -= R - y);
      }
      return m.e = d, m.c = w, m;
    };
  })(), _.sum = function() {
    for (var s = 1, u = arguments, c = new _(u[0]); s < u.length; ) c = c.plus(u[s++]);
    return c;
  }, t = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function u(c, x, g, d) {
      for (var v, p = [0], y, w = 0, m = c.length; w < m; ) {
        for (y = p.length; y--; p[y] *= x) ;
        for (p[0] += d.indexOf(c.charAt(w++)), v = 0; v < p.length; v++)
          p[v] > g - 1 && (p[v + 1] == null && (p[v + 1] = 0), p[v + 1] += p[v] / g | 0, p[v] %= g);
      }
      return p.reverse();
    }
    return function(c, x, g, d, v) {
      var p, y, w, m, T, P, M, I, G = c.indexOf("."), q = f, C = o;
      for (G >= 0 && (m = O, O = 0, c = c.replace(".", ""), I = new _(x), P = I.pow(c.length - G), O = m, I.c = u(
        ne(Y(P.c), P.e, "0"),
        10,
        g,
        s
      ), I.e = I.c.length), M = u(c, x, g, v ? (p = k, s) : (p = s, k)), w = m = M.length; M[--m] == 0; M.pop()) ;
      if (!M[0]) return p.charAt(0);
      if (G < 0 ? --w : (P.c = M, P.e = w, P.s = d, P = e(P, I, q, C, g), M = P.c, T = P.r, w = P.e), y = w + q + 1, G = M[y], m = g / 2, T = T || y < 0 || M[y + 1] != null, T = C < 4 ? (G != null || T) && (C == 0 || C == (P.s < 0 ? 3 : 2)) : G > m || G == m && (C == 4 || T || C == 6 && M[y - 1] & 1 || C == (P.s < 0 ? 8 : 7)), y < 1 || !M[0])
        c = T ? ne(p.charAt(1), -q, p.charAt(0)) : p.charAt(0);
      else {
        if (M.length = y, T)
          for (--g; ++M[--y] > g; )
            M[y] = 0, y || (++w, M = [1].concat(M));
        for (m = M.length; !M[--m]; ) ;
        for (G = 0, c = ""; G <= m; c += p.charAt(M[G++])) ;
        c = ne(c, w, p.charAt(0));
      }
      return c;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(x, g, d) {
      var v, p, y, w, m = 0, T = x.length, P = g % ue, M = g / ue | 0;
      for (x = x.slice(); T--; )
        y = x[T] % ue, w = x[T] / ue | 0, v = M * y + w * P, p = P * y + v % ue * ue + m, m = (p / d | 0) + (v / ue | 0) + M * w, x[T] = p % d;
      return m && (x = [m].concat(x)), x;
    }
    function u(x, g, d, v) {
      var p, y;
      if (d != v)
        y = d > v ? 1 : -1;
      else
        for (p = y = 0; p < d; p++)
          if (x[p] != g[p]) {
            y = x[p] > g[p] ? 1 : -1;
            break;
          }
      return y;
    }
    function c(x, g, d, v) {
      for (var p = 0; d--; )
        x[d] -= p, p = x[d] < g[d] ? 1 : 0, x[d] = p * v + x[d] - g[d];
      for (; !x[0] && x.length > 1; x.splice(0, 1)) ;
    }
    return function(x, g, d, v, p) {
      var y, w, m, T, P, M, I, G, q, C, L, U, de, be, Re, Q, fe, K = x.s == g.s ? 1 : -1, V = x.c, z = g.c;
      if (!V || !V[0] || !z || !z[0])
        return new _(
          // Return NaN if either NaN, or both Infinity or 0.
          !x.s || !g.s || (V ? z && V[0] == z[0] : !z) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            V && V[0] == 0 || !z ? K * 0 : K / 0
          )
        );
      for (G = new _(K), q = G.c = [], w = x.e - g.e, K = d + w + 1, p || (p = J, w = Z(x.e / R) - Z(g.e / R), K = K / R | 0), m = 0; z[m] == (V[m] || 0); m++) ;
      if (z[m] > (V[m] || 0) && w--, K < 0)
        q.push(1), T = !0;
      else {
        for (be = V.length, Q = z.length, m = 0, K += 2, P = H(p / (z[0] + 1)), P > 1 && (z = s(z, P, p), V = s(V, P, p), Q = z.length, be = V.length), de = Q, C = V.slice(0, Q), L = C.length; L < Q; C[L++] = 0) ;
        fe = z.slice(), fe = [0].concat(fe), Re = z[0], z[1] >= p / 2 && Re++;
        do {
          if (P = 0, y = u(z, C, Q, L), y < 0) {
            if (U = C[0], Q != L && (U = U * p + (C[1] || 0)), P = H(U / Re), P > 1)
              for (P >= p && (P = p - 1), M = s(z, P, p), I = M.length, L = C.length; u(M, C, I, L) == 1; )
                P--, c(M, Q < I ? fe : z, I, p), I = M.length, y = 1;
            else
              P == 0 && (y = P = 1), M = z.slice(), I = M.length;
            if (I < L && (M = [0].concat(M)), c(C, M, L, p), L = C.length, y == -1)
              for (; u(z, C, Q, L) < 1; )
                P++, c(C, Q < L ? fe : z, L, p), L = C.length;
          } else y === 0 && (P++, C = [0]);
          q[m++] = P, C[0] ? C[L++] = V[de] || 0 : (C = [V[de]], L = 1);
        } while ((de++ < be || C[0] != null) && K--);
        T = C[0] != null, q[0] || q.splice(0, 1);
      }
      if (p == J) {
        for (m = 1, K = q[0]; K >= 10; K /= 10, m++) ;
        X(G, d + (G.e = m + w * R - 1) + 1, v, T);
      } else
        G.e = w, G.r = +T;
      return G;
    };
  })();
  function j(s, u, c, x) {
    var g, d, v, p, y;
    if (c == null ? c = o : F(c, 0, 8), !s.c) return s.toString();
    if (g = s.c[0], v = s.e, u == null)
      y = Y(s.c), y = x == 1 || x == 2 && (v <= a || v >= h) ? xe(y, v) : ne(y, v, "0");
    else if (s = X(new _(s), u, c), d = s.e, y = Y(s.c), p = y.length, x == 1 || x == 2 && (u <= d || d <= a)) {
      for (; p < u; y += "0", p++) ;
      y = xe(y, d);
    } else if (u -= v + (x === 2 && d > v), y = ne(y, d, "0"), d + 1 > p) {
      if (--u > 0) for (y += "."; u--; y += "0") ;
    } else if (u += d - p, u > 0)
      for (d + 1 == p && (y += "."); u--; y += "0") ;
    return s.s < 0 && g ? "-" + y : y;
  }
  function W(s, u) {
    for (var c, x, g = 1, d = new _(s[0]); g < s.length; g++)
      x = new _(s[g]), (!x.s || (c = he(d, x)) === u || c === 0 && d.s === u) && (d = x);
    return d;
  }
  function Me(s, u, c) {
    for (var x = 1, g = u.length; !u[--g]; u.pop()) ;
    for (g = u[0]; g >= 10; g /= 10, x++) ;
    return (c = x + c * R - 1) > S ? s.c = s.e = null : c < E ? s.c = [s.e = 0] : (s.e = c, s.c = u), s;
  }
  n = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, u = /^([^.]+)\\.$/, c = /^\\.([^.]+)$/, x = /^-?(Infinity|NaN)$/, g = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(d, v, p, y) {
      var w, m = p ? v : v.replace(g, "");
      if (x.test(m))
        d.s = isNaN(m) ? null : m < 0 ? -1 : 1;
      else {
        if (!p && (m = m.replace(s, function(T, P, M) {
          return w = (M = M.toLowerCase()) == "x" ? 16 : M == "b" ? 2 : 8, !y || y == w ? P : T;
        }), y && (w = y, m = m.replace(u, "$1").replace(c, "0.$1")), v != m))
          return new _(m, w);
        if (_.DEBUG)
          throw Error($ + "Not a" + (y ? " base " + y : "") + " number: " + v);
        d.s = null;
      }
      d.c = d.e = null;
    };
  })();
  function X(s, u, c, x) {
    var g, d, v, p, y, w, m, T = s.c, P = Ie;
    if (T) {
      e: {
        for (g = 1, p = T[0]; p >= 10; p /= 10, g++) ;
        if (d = u - g, d < 0)
          d += R, v = u, y = T[w = 0], m = H(y / P[g - v - 1] % 10);
        else if (w = Oe((d + 1) / R), w >= T.length)
          if (x) {
            for (; T.length <= w; T.push(0)) ;
            y = m = 0, g = 1, d %= R, v = d - R + 1;
          } else
            break e;
        else {
          for (y = p = T[w], g = 1; p >= 10; p /= 10, g++) ;
          d %= R, v = d - R + g, m = v < 0 ? 0 : H(y / P[g - v - 1] % 10);
        }
        if (x = x || u < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        T[w + 1] != null || (v < 0 ? y : y % P[g - v - 1]), x = c < 4 ? (m || x) && (c == 0 || c == (s.s < 0 ? 3 : 2)) : m > 5 || m == 5 && (c == 4 || x || c == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (d > 0 ? v > 0 ? y / P[g - v] : 0 : T[w - 1]) % 10 & 1 || c == (s.s < 0 ? 8 : 7)), u < 1 || !T[0])
          return T.length = 0, x ? (u -= s.e + 1, T[0] = P[(R - u % R) % R], s.e = -u || 0) : T[0] = s.e = 0, s;
        if (d == 0 ? (T.length = w, p = 1, w--) : (T.length = w + 1, p = P[R - d], T[w] = v > 0 ? H(y / P[g - v] % P[v]) * p : 0), x)
          for (; ; )
            if (w == 0) {
              for (d = 1, v = T[0]; v >= 10; v /= 10, d++) ;
              for (v = T[0] += p, p = 1; v >= 10; v /= 10, p++) ;
              d != p && (s.e++, T[0] == J && (T[0] = 1));
              break;
            } else {
              if (T[w] += p, T[w] != J) break;
              T[w--] = 0, p = 1;
            }
        for (d = T.length; T[--d] === 0; T.pop()) ;
      }
      s.e > S ? s.c = s.e = null : s.e < E && (s.c = [s.e = 0]);
    }
    return s;
  }
  function ie(s) {
    var u, c = s.e;
    return c === null ? s.toString() : (u = Y(s.c), u = c <= a || c >= h ? xe(u, c) : ne(u, c, "0"), s.s < 0 ? "-" + u : u);
  }
  return r.absoluteValue = r.abs = function() {
    var s = new _(this);
    return s.s < 0 && (s.s = 1), s;
  }, r.comparedTo = function(s, u) {
    return he(this, new _(s, u));
  }, r.decimalPlaces = r.dp = function(s, u) {
    var c, x, g, d = this;
    if (s != null)
      return F(s, 0, D), u == null ? u = o : F(u, 0, 8), X(new _(d), s + d.e + 1, u);
    if (!(c = d.c)) return null;
    if (x = ((g = c.length - 1) - Z(this.e / R)) * R, g = c[g]) for (; g % 10 == 0; g /= 10, x--) ;
    return x < 0 && (x = 0), x;
  }, r.dividedBy = r.div = function(s, u) {
    return e(this, new _(s, u), f, o);
  }, r.dividedToIntegerBy = r.idiv = function(s, u) {
    return e(this, new _(s, u), 0, 1);
  }, r.exponentiatedBy = r.pow = function(s, u) {
    var c, x, g, d, v, p, y, w, m, T = this;
    if (s = new _(s), s.c && !s.isInteger())
      throw Error($ + "Exponent not an integer: " + ie(s));
    if (u != null && (u = new _(u)), p = s.e > 14, !T.c || !T.c[0] || T.c[0] == 1 && !T.e && T.c.length == 1 || !s.c || !s.c[0])
      return m = new _(Math.pow(+ie(T), p ? s.s * (2 - me(s)) : +ie(s))), u ? m.mod(u) : m;
    if (y = s.s < 0, u) {
      if (u.c ? !u.c[0] : !u.s) return new _(NaN);
      x = !y && T.isInteger() && u.isInteger(), x && (T = T.mod(u));
    } else {
      if (s.e > 9 && (T.e > 0 || T.e < -1 || (T.e == 0 ? T.c[0] > 1 || p && T.c[1] >= 24e7 : T.c[0] < 8e13 || p && T.c[0] <= 9999975e7)))
        return d = T.s < 0 && me(s) ? -0 : 0, T.e > -1 && (d = 1 / d), new _(y ? 1 / d : d);
      O && (d = Oe(O / R + 2));
    }
    for (p ? (c = new _(0.5), y && (s.s = 1), w = me(s)) : (g = Math.abs(+ie(s)), w = g % 2), m = new _(l); ; ) {
      if (w) {
        if (m = m.times(T), !m.c) break;
        d ? m.c.length > d && (m.c.length = d) : x && (m = m.mod(u));
      }
      if (g) {
        if (g = H(g / 2), g === 0) break;
        w = g % 2;
      } else if (s = s.times(c), X(s, s.e + 1, 1), s.e > 14)
        w = me(s);
      else {
        if (g = +ie(s), g === 0) break;
        w = g % 2;
      }
      T = T.times(T), d ? T.c && T.c.length > d && (T.c.length = d) : x && (T = T.mod(u));
    }
    return x ? m : (y && (m = l.div(m)), u ? m.mod(u) : d ? X(m, O, o, v) : m);
  }, r.integerValue = function(s) {
    var u = new _(this);
    return s == null ? s = o : F(s, 0, 8), X(u, u.e + 1, s);
  }, r.isEqualTo = r.eq = function(s, u) {
    return he(this, new _(s, u)) === 0;
  }, r.isFinite = function() {
    return !!this.c;
  }, r.isGreaterThan = r.gt = function(s, u) {
    return he(this, new _(s, u)) > 0;
  }, r.isGreaterThanOrEqualTo = r.gte = function(s, u) {
    return (u = he(this, new _(s, u))) === 1 || u === 0;
  }, r.isInteger = function() {
    return !!this.c && Z(this.e / R) > this.c.length - 2;
  }, r.isLessThan = r.lt = function(s, u) {
    return he(this, new _(s, u)) < 0;
  }, r.isLessThanOrEqualTo = r.lte = function(s, u) {
    return (u = he(this, new _(s, u))) === -1 || u === 0;
  }, r.isNaN = function() {
    return !this.s;
  }, r.isNegative = function() {
    return this.s < 0;
  }, r.isPositive = function() {
    return this.s > 0;
  }, r.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, r.minus = function(s, u) {
    var c, x, g, d, v = this, p = v.s;
    if (s = new _(s, u), u = s.s, !p || !u) return new _(NaN);
    if (p != u)
      return s.s = -u, v.plus(s);
    var y = v.e / R, w = s.e / R, m = v.c, T = s.c;
    if (!y || !w) {
      if (!m || !T) return m ? (s.s = -u, s) : new _(T ? v : NaN);
      if (!m[0] || !T[0])
        return T[0] ? (s.s = -u, s) : new _(m[0] ? v : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          o == 3 ? -0 : 0
        ));
    }
    if (y = Z(y), w = Z(w), m = m.slice(), p = y - w) {
      for ((d = p < 0) ? (p = -p, g = m) : (w = y, g = T), g.reverse(), u = p; u--; g.push(0)) ;
      g.reverse();
    } else
      for (x = (d = (p = m.length) < (u = T.length)) ? p : u, p = u = 0; u < x; u++)
        if (m[u] != T[u]) {
          d = m[u] < T[u];
          break;
        }
    if (d && (g = m, m = T, T = g, s.s = -s.s), u = (x = T.length) - (c = m.length), u > 0) for (; u--; m[c++] = 0) ;
    for (u = J - 1; x > p; ) {
      if (m[--x] < T[x]) {
        for (c = x; c && !m[--c]; m[c] = u) ;
        --m[c], m[x] += J;
      }
      m[x] -= T[x];
    }
    for (; m[0] == 0; m.splice(0, 1), --w) ;
    return m[0] ? Me(s, m, w) : (s.s = o == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, r.modulo = r.mod = function(s, u) {
    var c, x, g = this;
    return s = new _(s, u), !g.c || !s.s || s.c && !s.c[0] ? new _(NaN) : !s.c || g.c && !g.c[0] ? new _(g) : (N == 9 ? (x = s.s, s.s = 1, c = e(g, s, 0, 3), s.s = x, c.s *= x) : c = e(g, s, 0, N), s = g.minus(c.times(s)), !s.c[0] && N == 1 && (s.s = g.s), s);
  }, r.multipliedBy = r.times = function(s, u) {
    var c, x, g, d, v, p, y, w, m, T, P, M, I, G, q, C = this, L = C.c, U = (s = new _(s, u)).c;
    if (!L || !U || !L[0] || !U[0])
      return !C.s || !s.s || L && !L[0] && !U || U && !U[0] && !L ? s.c = s.e = s.s = null : (s.s *= C.s, !L || !U ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (x = Z(C.e / R) + Z(s.e / R), s.s *= C.s, y = L.length, T = U.length, y < T && (I = L, L = U, U = I, g = y, y = T, T = g), g = y + T, I = []; g--; I.push(0)) ;
    for (G = J, q = ue, g = T; --g >= 0; ) {
      for (c = 0, P = U[g] % q, M = U[g] / q | 0, v = y, d = g + v; d > g; )
        w = L[--v] % q, m = L[v] / q | 0, p = M * w + m * P, w = P * w + p % q * q + I[d] + c, c = (w / G | 0) + (p / q | 0) + M * m, I[d--] = w % G;
      I[d] = c;
    }
    return c ? ++x : I.splice(0, 1), Me(s, I, x);
  }, r.negated = function() {
    var s = new _(this);
    return s.s = -s.s || null, s;
  }, r.plus = function(s, u) {
    var c, x = this, g = x.s;
    if (s = new _(s, u), u = s.s, !g || !u) return new _(NaN);
    if (g != u)
      return s.s = -u, x.minus(s);
    var d = x.e / R, v = s.e / R, p = x.c, y = s.c;
    if (!d || !v) {
      if (!p || !y) return new _(g / 0);
      if (!p[0] || !y[0]) return y[0] ? s : new _(p[0] ? x : g * 0);
    }
    if (d = Z(d), v = Z(v), p = p.slice(), g = d - v) {
      for (g > 0 ? (v = d, c = y) : (g = -g, c = p), c.reverse(); g--; c.push(0)) ;
      c.reverse();
    }
    for (g = p.length, u = y.length, g - u < 0 && (c = y, y = p, p = c, u = g), g = 0; u; )
      g = (p[--u] = p[u] + y[u] + g) / J | 0, p[u] = J === p[u] ? 0 : p[u] % J;
    return g && (p = [g].concat(p), ++v), Me(s, p, v);
  }, r.precision = r.sd = function(s, u) {
    var c, x, g, d = this;
    if (s != null && s !== !!s)
      return F(s, 1, D), u == null ? u = o : F(u, 0, 8), X(new _(d), s, u);
    if (!(c = d.c)) return null;
    if (g = c.length - 1, x = g * R + 1, g = c[g]) {
      for (; g % 10 == 0; g /= 10, x--) ;
      for (g = c[0]; g >= 10; g /= 10, x++) ;
    }
    return s && d.e + 1 > x && (x = d.e + 1), x;
  }, r.shiftedBy = function(s) {
    return F(s, -Ce, Ce), this.times("1e" + s);
  }, r.squareRoot = r.sqrt = function() {
    var s, u, c, x, g, d = this, v = d.c, p = d.s, y = d.e, w = f + 4, m = new _("0.5");
    if (p !== 1 || !v || !v[0])
      return new _(!p || p < 0 && (!v || v[0]) ? NaN : v ? d : 1 / 0);
    if (p = Math.sqrt(+ie(d)), p == 0 || p == 1 / 0 ? (u = Y(v), (u.length + y) % 2 == 0 && (u += "0"), p = Math.sqrt(+u), y = Z((y + 1) / 2) - (y < 0 || y % 2), p == 1 / 0 ? u = "5e" + y : (u = p.toExponential(), u = u.slice(0, u.indexOf("e") + 1) + y), c = new _(u)) : c = new _(p + ""), c.c[0]) {
      for (y = c.e, p = y + w, p < 3 && (p = 0); ; )
        if (g = c, c = m.times(g.plus(e(d, g, w, 1))), Y(g.c).slice(0, p) === (u = Y(c.c)).slice(0, p))
          if (c.e < y && --p, u = u.slice(p - 3, p + 1), u == "9999" || !x && u == "4999") {
            if (!x && (X(g, g.e + f + 2, 0), g.times(g).eq(d))) {
              c = g;
              break;
            }
            w += 4, p += 4, x = 1;
          } else {
            (!+u || !+u.slice(1) && u.charAt(0) == "5") && (X(c, c.e + f + 2, 1), s = !c.times(c).eq(d));
            break;
          }
    }
    return X(c, c.e + f + 1, o, s);
  }, r.toExponential = function(s, u) {
    return s != null && (F(s, 0, D), s++), j(this, s, u, 1);
  }, r.toFixed = function(s, u) {
    return s != null && (F(s, 0, D), s = s + this.e + 1), j(this, s, u);
  }, r.toFormat = function(s, u, c) {
    var x, g = this;
    if (c == null)
      s != null && u && typeof u == "object" ? (c = u, u = null) : s && typeof s == "object" ? (c = s, s = u = null) : c = b;
    else if (typeof c != "object")
      throw Error($ + "Argument not an object: " + c);
    if (x = g.toFixed(s, u), g.c) {
      var d, v = x.split("."), p = +c.groupSize, y = +c.secondaryGroupSize, w = c.groupSeparator || "", m = v[0], T = v[1], P = g.s < 0, M = P ? m.slice(1) : m, I = M.length;
      if (y && (d = p, p = y, y = d, I -= d), p > 0 && I > 0) {
        for (d = I % p || p, m = M.substr(0, d); d < I; d += p) m += w + M.substr(d, p);
        y > 0 && (m += w + M.slice(d)), P && (m = "-" + m);
      }
      x = T ? m + (c.decimalSeparator || "") + ((y = +c.fractionGroupSize) ? T.replace(
        new RegExp("\\\\d{" + y + "}\\\\B", "g"),
        "$&" + (c.fractionGroupSeparator || "")
      ) : T) : m;
    }
    return (c.prefix || "") + x + (c.suffix || "");
  }, r.toFraction = function(s) {
    var u, c, x, g, d, v, p, y, w, m, T, P, M = this, I = M.c;
    if (s != null && (p = new _(s), !p.isInteger() && (p.c || p.s !== 1) || p.lt(l)))
      throw Error($ + "Argument " + (p.isInteger() ? "out of range: " : "not an integer: ") + ie(p));
    if (!I) return new _(M);
    for (u = new _(l), w = c = new _(l), x = y = new _(l), P = Y(I), d = u.e = P.length - M.e - 1, u.c[0] = Ie[(v = d % R) < 0 ? R + v : v], s = !s || p.comparedTo(u) > 0 ? d > 0 ? u : w : p, v = S, S = 1 / 0, p = new _(P), y.c[0] = 0; m = e(p, u, 0, 1), g = c.plus(m.times(x)), g.comparedTo(s) != 1; )
      c = x, x = g, w = y.plus(m.times(g = w)), y = g, u = p.minus(m.times(g = u)), p = g;
    return g = e(s.minus(c), x, 0, 1), y = y.plus(g.times(w)), c = c.plus(g.times(x)), y.s = w.s = M.s, d = d * 2, T = e(w, x, d, o).minus(M).abs().comparedTo(
      e(y, c, d, o).minus(M).abs()
    ) < 1 ? [w, x] : [y, c], S = v, T;
  }, r.toNumber = function() {
    return +ie(this);
  }, r.toPrecision = function(s, u) {
    return s != null && F(s, 1, D), j(this, s, u, 2);
  }, r.toString = function(s) {
    var u, c = this, x = c.s, g = c.e;
    return g === null ? x ? (u = "Infinity", x < 0 && (u = "-" + u)) : u = "NaN" : (s == null ? u = g <= a || g >= h ? xe(Y(c.c), g) : ne(Y(c.c), g, "0") : s === 10 && B ? (c = X(new _(c), f + g + 1, o), u = ne(Y(c.c), c.e, "0")) : (F(s, 2, k.length, "Base"), u = t(ne(Y(c.c), g, "0"), 10, s, x, !0)), x < 0 && c.c[0] && (u = "-" + u)), u;
  }, r.valueOf = r.toJSON = function() {
    return ie(this);
  }, r._isBigNumber = !0, r[Symbol.toStringTag] = "BigNumber", r[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = r.valueOf, i != null && _.set(i), _;
}
function Z(i) {
  var e = i | 0;
  return i > 0 || i === e ? e : e - 1;
}
function Y(i) {
  for (var e, t, n = 1, r = i.length, l = i[0] + ""; n < r; ) {
    for (e = i[n++] + "", t = R - e.length; t--; e = "0" + e) ;
    l += e;
  }
  for (r = l.length; l.charCodeAt(--r) === 48; ) ;
  return l.slice(0, r + 1 || 1);
}
function he(i, e) {
  var t, n, r = i.c, l = e.c, f = i.s, o = e.s, a = i.e, h = e.e;
  if (!f || !o) return null;
  if (t = r && !r[0], n = l && !l[0], t || n) return t ? n ? 0 : -o : f;
  if (f != o) return f;
  if (t = f < 0, n = a == h, !r || !l) return n ? 0 : !r ^ t ? 1 : -1;
  if (!n) return a > h ^ t ? 1 : -1;
  for (o = (a = r.length) < (h = l.length) ? a : h, f = 0; f < o; f++) if (r[f] != l[f]) return r[f] > l[f] ^ t ? 1 : -1;
  return a == h ? 0 : a > h ^ t ? 1 : -1;
}
function F(i, e, t, n) {
  if (i < e || i > t || i !== H(i))
    throw Error($ + (n || "Argument") + (typeof i == "number" ? i < e || i > t ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(i));
}
function me(i) {
  var e = i.c.length - 1;
  return Z(i.e / R) == e && i.c[e] % 2 != 0;
}
function xe(i, e) {
  return (i.length > 1 ? i.charAt(0) + "." + i.slice(1) : i) + (e < 0 ? "e" : "e+") + e;
}
function ne(i, e, t) {
  var n, r;
  if (e < 0) {
    for (r = t + "."; ++e; r += t) ;
    i = r + i;
  } else if (n = i.length, ++e > n) {
    for (r = t, e -= n; --e; r += t) ;
    i += r;
  } else e < n && (i = i.slice(0, e) + "." + i.slice(e));
  return i;
}
var te = Qe(), Tt = class {
  key;
  left = null;
  right = null;
  constructor(i) {
    this.key = i;
  }
}, ae = class extends Tt {
  constructor(i) {
    super(i);
  }
}, At = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(i) {
    const e = this.root;
    if (e == null)
      return this.compare(i, i), -1;
    let t = null, n = null, r = null, l = null, f = e;
    const o = this.compare;
    let a;
    for (; ; )
      if (a = o(f.key, i), a > 0) {
        let h = f.left;
        if (h == null || (a = o(h.key, i), a > 0 && (f.left = h.right, h.right = f, f = h, h = f.left, h == null)))
          break;
        t == null ? n = f : t.left = f, t = f, f = h;
      } else if (a < 0) {
        let h = f.right;
        if (h == null || (a = o(h.key, i), a < 0 && (f.right = h.left, h.left = f, f = h, h = f.right, h == null)))
          break;
        r == null ? l = f : r.right = f, r = f, f = h;
      } else
        break;
    return r != null && (r.right = f.left, f.left = l), t != null && (t.left = f.right, f.right = n), this.root !== f && (this.root = f, this.splayCount++), a;
  }
  splayMin(i) {
    let e = i, t = e.left;
    for (; t != null; ) {
      const n = t;
      e.left = n.right, n.right = e, e = n, t = e.left;
    }
    return e;
  }
  splayMax(i) {
    let e = i, t = e.right;
    for (; t != null; ) {
      const n = t;
      e.right = n.left, n.left = e, e = n, t = e.right;
    }
    return e;
  }
  _delete(i) {
    if (this.root == null || this.splay(i) != 0) return null;
    let t = this.root;
    const n = t, r = t.left;
    if (this.size--, r == null)
      this.root = t.right;
    else {
      const l = t.right;
      t = this.splayMax(r), t.right = l, this.root = t;
    }
    return this.modificationCount++, n;
  }
  addNewRoot(i, e) {
    this.size++, this.modificationCount++;
    const t = this.root;
    if (t == null) {
      this.root = i;
      return;
    }
    e < 0 ? (i.left = t, i.right = t.right, t.right = null) : (i.right = t, i.left = t.left, t.left = null), this.root = i;
  }
  _first() {
    const i = this.root;
    return i == null ? null : (this.root = this.splayMin(i), this.root);
  }
  _last() {
    const i = this.root;
    return i == null ? null : (this.root = this.splayMax(i), this.root);
  }
  clear() {
    this.root = null, this.size = 0, this.modificationCount++;
  }
  has(i) {
    return this.validKey(i) && this.splay(i) == 0;
  }
  defaultCompare() {
    return (i, e) => i < e ? -1 : i > e ? 1 : 0;
  }
  wrap() {
    return {
      getRoot: () => this.root,
      setRoot: (i) => {
        this.root = i;
      },
      getSize: () => this.size,
      getModificationCount: () => this.modificationCount,
      getSplayCount: () => this.splayCount,
      setSplayCount: (i) => {
        this.splayCount = i;
      },
      splay: (i) => this.splay(i),
      has: (i) => this.has(i)
    };
  }
}, Se = class ge extends At {
  root = null;
  compare;
  validKey;
  constructor(e, t) {
    super(), this.compare = e ?? this.defaultCompare(), this.validKey = t ?? ((n) => n != null && n != null);
  }
  delete(e) {
    return this.validKey(e) ? this._delete(e) != null : !1;
  }
  deleteAll(e) {
    for (const t of e)
      this.delete(t);
  }
  forEach(e) {
    const t = this[Symbol.iterator]();
    let n;
    for (; n = t.next(), !n.done; )
      e(n.value, n.value, this);
  }
  add(e) {
    const t = this.splay(e);
    return t != 0 && this.addNewRoot(new ae(e), t), this;
  }
  addAndReturn(e) {
    const t = this.splay(e);
    return t != 0 && this.addNewRoot(new ae(e), t), this.root.key;
  }
  addAll(e) {
    for (const t of e)
      this.add(t);
  }
  isEmpty() {
    return this.root == null;
  }
  isNotEmpty() {
    return this.root != null;
  }
  single() {
    if (this.size == 0) throw "Bad state: No element";
    if (this.size > 1) throw "Bad state: Too many element";
    return this.root.key;
  }
  first() {
    if (this.size == 0) throw "Bad state: No element";
    return this._first().key;
  }
  last() {
    if (this.size == 0) throw "Bad state: No element";
    return this._last().key;
  }
  lastBefore(e) {
    if (e == null) throw "Invalid arguments(s)";
    if (this.root == null) return null;
    if (this.splay(e) < 0) return this.root.key;
    let n = this.root.left;
    if (n == null) return null;
    let r = n.right;
    for (; r != null; )
      n = r, r = n.right;
    return n.key;
  }
  firstAfter(e) {
    if (e == null) throw "Invalid arguments(s)";
    if (this.root == null) return null;
    if (this.splay(e) > 0) return this.root.key;
    let n = this.root.right;
    if (n == null) return null;
    let r = n.left;
    for (; r != null; )
      n = r, r = n.left;
    return n.key;
  }
  retainAll(e) {
    const t = new ge(this.compare, this.validKey), n = this.modificationCount;
    for (const r of e) {
      if (n != this.modificationCount)
        throw "Concurrent modification during iteration.";
      this.validKey(r) && this.splay(r) == 0 && t.add(this.root.key);
    }
    t.size != this.size && (this.root = t.root, this.size = t.size, this.modificationCount++);
  }
  lookup(e) {
    return !this.validKey(e) || this.splay(e) != 0 ? null : this.root.key;
  }
  intersection(e) {
    const t = new ge(this.compare, this.validKey);
    for (const n of this)
      e.has(n) && t.add(n);
    return t;
  }
  difference(e) {
    const t = new ge(this.compare, this.validKey);
    for (const n of this)
      e.has(n) || t.add(n);
    return t;
  }
  union(e) {
    const t = this.clone();
    return t.addAll(e), t;
  }
  clone() {
    const e = new ge(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function t(r, l) {
      let f, o;
      do {
        if (f = r.left, o = r.right, f != null) {
          const a = new ae(f.key);
          l.left = a, t(f, a);
        }
        if (o != null) {
          const a = new ae(o.key);
          l.right = a, r = o, l = a;
        }
      } while (o != null);
    }
    const n = new ae(e.key);
    return t(e, n), n;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new Mt(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new Pt(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, et = class {
  tree;
  path = new Array();
  modificationCount = null;
  splayCount;
  constructor(i) {
    this.tree = i, this.splayCount = i.getSplayCount();
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.moveNext() ? { done: !1, value: this.current() } : { done: !0, value: null };
  }
  current() {
    if (!this.path.length) return null;
    const i = this.path[this.path.length - 1];
    return this.getValue(i);
  }
  rebuildPath(i) {
    this.path.splice(0, this.path.length), this.tree.splay(i), this.path.push(this.tree.getRoot()), this.splayCount = this.tree.getSplayCount();
  }
  findLeftMostDescendent(i) {
    for (; i != null; )
      this.path.push(i), i = i.left;
  }
  moveNext() {
    if (this.modificationCount != this.tree.getModificationCount()) {
      if (this.modificationCount == null) {
        this.modificationCount = this.tree.getModificationCount();
        let t = this.tree.getRoot();
        for (; t != null; )
          this.path.push(t), t = t.left;
        return this.path.length > 0;
      }
      throw "Concurrent modification during iteration.";
    }
    if (!this.path.length) return !1;
    this.splayCount != this.tree.getSplayCount() && this.rebuildPath(this.path[this.path.length - 1].key);
    let i = this.path[this.path.length - 1], e = i.right;
    if (e != null) {
      for (; e != null; )
        this.path.push(e), e = e.left;
      return !0;
    }
    for (this.path.pop(); this.path.length && this.path[this.path.length - 1].right === i; )
      i = this.path.pop();
    return this.path.length > 0;
  }
}, Pt = class extends et {
  getValue(i) {
    return i.key;
  }
}, Mt = class extends et {
  getValue(i) {
    return [i.key, i.key];
  }
}, tt = (i) => () => i, Be = (i) => {
  const e = i ? (t, n) => n.minus(t).abs().isLessThanOrEqualTo(i) : tt(!1);
  return (t, n) => e(t, n) ? 0 : t.comparedTo(n);
};
function bt(i) {
  const e = i ? (t, n, r, l, f) => t.exponentiatedBy(2).isLessThanOrEqualTo(
    l.minus(n).exponentiatedBy(2).plus(f.minus(r).exponentiatedBy(2)).times(i)
  ) : tt(!1);
  return (t, n, r) => {
    const l = t.x, f = t.y, o = r.x, a = r.y, h = f.minus(a).times(n.x.minus(o)).minus(l.minus(o).times(n.y.minus(a)));
    return e(h, l, f, o, a) ? 0 : h.comparedTo(0);
  };
}
var Rt = (i) => i, Nt = (i) => {
  if (i) {
    const e = new Se(Be(i)), t = new Se(Be(i)), n = (l, f) => f.addAndReturn(l), r = (l) => ({
      x: n(l.x, e),
      y: n(l.y, t)
    });
    return r({ x: new te(0), y: new te(0) }), r;
  }
  return Rt;
}, Fe = (i) => ({
  set: (e) => {
    se = Fe(e);
  },
  reset: () => Fe(i),
  compare: Be(i),
  snap: Nt(i),
  orient: bt(i)
}), se = Fe(), ce = (i, e) => i.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(i.ur.x) && i.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(i.ur.y), Ge = (i, e) => {
  if (e.ur.x.isLessThan(i.ll.x) || i.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(i.ll.y) || i.ur.y.isLessThan(e.ll.y))
    return null;
  const t = i.ll.x.isLessThan(e.ll.x) ? e.ll.x : i.ll.x, n = i.ur.x.isLessThan(e.ur.x) ? i.ur.x : e.ur.x, r = i.ll.y.isLessThan(e.ll.y) ? e.ll.y : i.ll.y, l = i.ur.y.isLessThan(e.ur.y) ? i.ur.y : e.ur.y;
  return { ll: { x: t, y: r }, ur: { x: n, y: l } };
}, we = (i, e) => i.x.times(e.y).minus(i.y.times(e.x)), it = (i, e) => i.x.times(e.x).plus(i.y.times(e.y)), Te = (i) => it(i, i).sqrt(), Ot = (i, e, t) => {
  const n = { x: e.x.minus(i.x), y: e.y.minus(i.y) }, r = { x: t.x.minus(i.x), y: t.y.minus(i.y) };
  return we(r, n).div(Te(r)).div(Te(n));
}, Ct = (i, e, t) => {
  const n = { x: e.x.minus(i.x), y: e.y.minus(i.y) }, r = { x: t.x.minus(i.x), y: t.y.minus(i.y) };
  return it(r, n).div(Te(r)).div(Te(n));
}, Xe = (i, e, t) => e.y.isZero() ? null : { x: i.x.plus(e.x.div(e.y).times(t.minus(i.y))), y: t }, Ke = (i, e, t) => e.x.isZero() ? null : { x: t, y: i.y.plus(e.y.div(e.x).times(t.minus(i.x))) }, It = (i, e, t, n) => {
  if (e.x.isZero()) return Ke(t, n, i.x);
  if (n.x.isZero()) return Ke(i, e, t.x);
  if (e.y.isZero()) return Xe(t, n, i.y);
  if (n.y.isZero()) return Xe(i, e, t.y);
  const r = we(e, n);
  if (r.isZero()) return null;
  const l = { x: t.x.minus(i.x), y: t.y.minus(i.y) }, f = we(l, e).div(r), o = we(l, n).div(r), a = i.x.plus(o.times(e.x)), h = t.x.plus(f.times(n.x)), E = i.y.plus(o.times(e.y)), S = t.y.plus(f.times(n.y)), A = a.plus(h).div(2), N = E.plus(S).div(2);
  return { x: A, y: N };
}, ee = class nt {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, t) {
    const n = nt.comparePoints(e.point, t.point);
    return n !== 0 ? n : (e.point !== t.point && e.link(t), e.isLeft !== t.isLeft ? e.isLeft ? 1 : -1 : Ae.compare(e.segment, t.segment));
  }
  // for ordering points in sweep line order
  static comparePoints(e, t) {
    return e.x.isLessThan(t.x) ? -1 : e.x.isGreaterThan(t.x) ? 1 : e.y.isLessThan(t.y) ? -1 : e.y.isGreaterThan(t.y) ? 1 : 0;
  }
  // Warning: 'point' input will be modified and re-used (for performance)
  constructor(e, t) {
    e.events === void 0 ? e.events = [this] : e.events.push(this), this.point = e, this.isLeft = t;
  }
  link(e) {
    if (e.point === this.point)
      throw new Error("Tried to link already linked events");
    const t = e.point.events;
    for (let n = 0, r = t.length; n < r; n++) {
      const l = t[n];
      this.point.events.push(l), l.point = this.point;
    }
    this.checkForConsuming();
  }
  /* Do a pass over our linked events and check to see if any pair
   * of segments match, and should be consumed. */
  checkForConsuming() {
    const e = this.point.events.length;
    for (let t = 0; t < e; t++) {
      const n = this.point.events[t];
      if (n.segment.consumedBy === void 0)
        for (let r = t + 1; r < e; r++) {
          const l = this.point.events[r];
          l.consumedBy === void 0 && n.otherSE.point.events === l.otherSE.point.events && n.segment.consume(l.segment);
        }
    }
  }
  getAvailableLinkedEvents() {
    const e = [];
    for (let t = 0, n = this.point.events.length; t < n; t++) {
      const r = this.point.events[t];
      r !== this && !r.segment.ringOut && r.segment.isInResult() && e.push(r);
    }
    return e;
  }
  /**
   * Returns a comparator function for sorting linked events that will
   * favor the event that will give us the smallest left-side angle.
   * All ring construction starts as low as possible heading to the right,
   * so by always turning left as sharp as possible we'll get polygons
   * without uncessary loops & holes.
   *
   * The comparator function has a compute cache such that it avoids
   * re-computing already-computed values.
   */
  getLeftmostComparator(e) {
    const t = /* @__PURE__ */ new Map(), n = (r) => {
      const l = r.otherSE;
      t.set(r, {
        sine: Ot(this.point, e.point, l.point),
        cosine: Ct(this.point, e.point, l.point)
      });
    };
    return (r, l) => {
      t.has(r) || n(r), t.has(l) || n(l);
      const { sine: f, cosine: o } = t.get(r), { sine: a, cosine: h } = t.get(l);
      return f.isGreaterThanOrEqualTo(0) && a.isGreaterThanOrEqualTo(0) ? o.isLessThan(h) ? 1 : o.isGreaterThan(h) ? -1 : 0 : f.isLessThan(0) && a.isLessThan(0) ? o.isLessThan(h) ? -1 : o.isGreaterThan(h) ? 1 : 0 : a.isLessThan(f) ? -1 : a.isGreaterThan(f) ? 1 : 0;
    };
  }
}, Lt = class ze {
  events;
  poly;
  _isExteriorRing;
  _enclosingRing;
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory(e) {
    const t = [];
    for (let n = 0, r = e.length; n < r; n++) {
      const l = e[n];
      if (!l.isInResult() || l.ringOut) continue;
      let f = null, o = l.leftSE, a = l.rightSE;
      const h = [o], E = o.point, S = [];
      for (; f = o, o = a, h.push(o), o.point !== E; )
        for (; ; ) {
          const A = o.getAvailableLinkedEvents();
          if (A.length === 0) {
            const b = h[0].point, k = h[h.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${b.x}, \${b.y}]. Last matching segment found ends at [\${k.x}, \${k.y}].\`
            );
          }
          if (A.length === 1) {
            a = A[0].otherSE;
            break;
          }
          let N = null;
          for (let b = 0, k = S.length; b < k; b++)
            if (S[b].point === o.point) {
              N = b;
              break;
            }
          if (N !== null) {
            const b = S.splice(N)[0], k = h.splice(b.index);
            k.unshift(k[0].otherSE), t.push(new ze(k.reverse()));
            continue;
          }
          S.push({
            index: h.length,
            point: o.point
          });
          const O = o.getLeftmostComparator(f);
          a = A.sort(O)[0].otherSE;
          break;
        }
      t.push(new ze(h));
    }
    return t;
  }
  constructor(e) {
    this.events = e;
    for (let t = 0, n = e.length; t < n; t++)
      e[t].segment.ringOut = this;
    this.poly = null;
  }
  getGeom() {
    let e = this.events[0].point;
    const t = [e];
    for (let h = 1, E = this.events.length - 1; h < E; h++) {
      const S = this.events[h].point, A = this.events[h + 1].point;
      se.orient(S, e, A) !== 0 && (t.push(S), e = S);
    }
    if (t.length === 1) return null;
    const n = t[0], r = t[1];
    se.orient(n, e, r) === 0 && t.shift(), t.push(t[0]);
    const l = this.isExteriorRing() ? 1 : -1, f = this.isExteriorRing() ? 0 : t.length - 1, o = this.isExteriorRing() ? t.length : -1, a = [];
    for (let h = f; h != o; h += l)
      a.push([t[h].x.toNumber(), t[h].y.toNumber()]);
    return a;
  }
  isExteriorRing() {
    if (this._isExteriorRing === void 0) {
      const e = this.enclosingRing();
      this._isExteriorRing = e ? !e.isExteriorRing() : !0;
    }
    return this._isExteriorRing;
  }
  enclosingRing() {
    return this._enclosingRing === void 0 && (this._enclosingRing = this._calcEnclosingRing()), this._enclosingRing;
  }
  /* Returns the ring that encloses this one, if any */
  _calcEnclosingRing() {
    let e = this.events[0];
    for (let r = 1, l = this.events.length; r < l; r++) {
      const f = this.events[r];
      ee.compare(e, f) > 0 && (e = f);
    }
    let t = e.segment.prevInResult(), n = t ? t.prevInResult() : null;
    for (; ; ) {
      if (!t) return null;
      if (!n) return t.ringOut;
      if (n.ringOut !== t.ringOut)
        return n.ringOut?.enclosingRing() !== t.ringOut ? t.ringOut : t.ringOut?.enclosingRing();
      t = n.prevInResult(), n = t ? t.prevInResult() : null;
    }
  }
}, Ye = class {
  exteriorRing;
  interiorRings;
  constructor(i) {
    this.exteriorRing = i, i.poly = this, this.interiorRings = [];
  }
  addInterior(i) {
    this.interiorRings.push(i), i.poly = this;
  }
  getGeom() {
    const i = this.exteriorRing.getGeom();
    if (i === null) return null;
    const e = [i];
    for (let t = 0, n = this.interiorRings.length; t < n; t++) {
      const r = this.interiorRings[t].getGeom();
      r !== null && e.push(r);
    }
    return e;
  }
}, kt = class {
  rings;
  polys;
  constructor(i) {
    this.rings = i, this.polys = this._composePolys(i);
  }
  getGeom() {
    const i = [];
    for (let e = 0, t = this.polys.length; e < t; e++) {
      const n = this.polys[e].getGeom();
      n !== null && i.push(n);
    }
    return i;
  }
  _composePolys(i) {
    const e = [];
    for (let t = 0, n = i.length; t < n; t++) {
      const r = i[t];
      if (!r.poly)
        if (r.isExteriorRing()) e.push(new Ye(r));
        else {
          const l = r.enclosingRing();
          l?.poly || e.push(new Ye(l)), l?.poly?.addInterior(r);
        }
    }
    return e;
  }
}, Bt = class {
  queue;
  tree;
  segments;
  constructor(i, e = Ae.compare) {
    this.queue = i, this.tree = new Se(e), this.segments = [];
  }
  process(i) {
    const e = i.segment, t = [];
    if (i.consumedBy)
      return i.isLeft ? this.queue.delete(i.otherSE) : this.tree.delete(e), t;
    i.isLeft && this.tree.add(e);
    let n = e, r = e;
    do
      n = this.tree.lastBefore(n);
    while (n != null && n.consumedBy != null);
    do
      r = this.tree.firstAfter(r);
    while (r != null && r.consumedBy != null);
    if (i.isLeft) {
      let l = null;
      if (n) {
        const o = n.getIntersection(e);
        if (o !== null && (e.isAnEndpoint(o) || (l = o), !n.isAnEndpoint(o))) {
          const a = this._splitSafely(n, o);
          for (let h = 0, E = a.length; h < E; h++)
            t.push(a[h]);
        }
      }
      let f = null;
      if (r) {
        const o = r.getIntersection(e);
        if (o !== null && (e.isAnEndpoint(o) || (f = o), !r.isAnEndpoint(o))) {
          const a = this._splitSafely(r, o);
          for (let h = 0, E = a.length; h < E; h++)
            t.push(a[h]);
        }
      }
      if (l !== null || f !== null) {
        let o = null;
        l === null ? o = f : f === null ? o = l : o = ee.comparePoints(
          l,
          f
        ) <= 0 ? l : f, this.queue.delete(e.rightSE), t.push(e.rightSE);
        const a = e.split(o);
        for (let h = 0, E = a.length; h < E; h++)
          t.push(a[h]);
      }
      t.length > 0 ? (this.tree.delete(e), t.push(i)) : (this.segments.push(e), e.prev = n);
    } else {
      if (n && r) {
        const l = n.getIntersection(r);
        if (l !== null) {
          if (!n.isAnEndpoint(l)) {
            const f = this._splitSafely(n, l);
            for (let o = 0, a = f.length; o < a; o++)
              t.push(f[o]);
          }
          if (!r.isAnEndpoint(l)) {
            const f = this._splitSafely(r, l);
            for (let o = 0, a = f.length; o < a; o++)
              t.push(f[o]);
          }
        }
      }
      this.tree.delete(e);
    }
    return t;
  }
  /* Safely split a segment that is currently in the datastructures
   * IE - a segment other than the one that is currently being processed. */
  _splitSafely(i, e) {
    this.tree.delete(i);
    const t = i.rightSE;
    this.queue.delete(t);
    const n = i.split(e);
    return n.push(t), i.consumedBy === void 0 && this.tree.add(i), n;
  }
}, Ft = class {
  type;
  numMultiPolys;
  run(i, e, t) {
    ye.type = i;
    const n = [new Ze(e, !0)];
    for (let h = 0, E = t.length; h < E; h++)
      n.push(new Ze(t[h], !1));
    if (ye.numMultiPolys = n.length, ye.type === "difference") {
      const h = n[0];
      let E = 1;
      for (; E < n.length; )
        Ge(n[E].bbox, h.bbox) !== null ? E++ : n.splice(E, 1);
    }
    if (ye.type === "intersection")
      for (let h = 0, E = n.length; h < E; h++) {
        const S = n[h];
        for (let A = h + 1, N = n.length; A < N; A++)
          if (Ge(S.bbox, n[A].bbox) === null) return [];
      }
    const r = new Se(ee.compare);
    for (let h = 0, E = n.length; h < E; h++) {
      const S = n[h].getSweepEvents();
      for (let A = 0, N = S.length; A < N; A++)
        r.add(S[A]);
    }
    const l = new Bt(r);
    let f = null;
    for (r.size != 0 && (f = r.first(), r.delete(f)); f; ) {
      const h = l.process(f);
      for (let E = 0, S = h.length; E < S; E++) {
        const A = h[E];
        A.consumedBy === void 0 && r.add(A);
      }
      r.size != 0 ? (f = r.first(), r.delete(f)) : f = null;
    }
    se.reset();
    const o = Lt.factory(l.segments);
    return new kt(o).getGeom();
  }
}, ye = new Ft(), qe = ye, Gt = 0, Ae = class ve {
  id;
  leftSE;
  rightSE;
  rings;
  windings;
  ringOut;
  consumedBy;
  prev;
  _prevInResult;
  _beforeState;
  _afterState;
  _isInResult;
  /* This compare() function is for ordering segments in the sweep
   * line tree, and does so according to the following criteria:
   *
   * Consider the vertical line that lies an infinestimal step to the
   * right of the right-more of the two left endpoints of the input
   * segments. Imagine slowly moving a point up from negative infinity
   * in the increasing y direction. Which of the two segments will that
   * point intersect first? That segment comes 'before' the other one.
   *
   * If neither segment would be intersected by such a line, (if one
   * or more of the segments are vertical) then the line to be considered
   * is directly on the right-more of the two left inputs.
   */
  static compare(e, t) {
    const n = e.leftSE.point.x, r = t.leftSE.point.x, l = e.rightSE.point.x, f = t.rightSE.point.x;
    if (f.isLessThan(n)) return 1;
    if (l.isLessThan(r)) return -1;
    const o = e.leftSE.point.y, a = t.leftSE.point.y, h = e.rightSE.point.y, E = t.rightSE.point.y;
    if (n.isLessThan(r)) {
      if (a.isLessThan(o) && a.isLessThan(h)) return 1;
      if (a.isGreaterThan(o) && a.isGreaterThan(h)) return -1;
      const S = e.comparePoint(t.leftSE.point);
      if (S < 0) return 1;
      if (S > 0) return -1;
      const A = t.comparePoint(e.rightSE.point);
      return A !== 0 ? A : -1;
    }
    if (n.isGreaterThan(r)) {
      if (o.isLessThan(a) && o.isLessThan(E)) return -1;
      if (o.isGreaterThan(a) && o.isGreaterThan(E)) return 1;
      const S = t.comparePoint(e.leftSE.point);
      if (S !== 0) return S;
      const A = e.comparePoint(t.rightSE.point);
      return A < 0 ? 1 : A > 0 ? -1 : 1;
    }
    if (o.isLessThan(a)) return -1;
    if (o.isGreaterThan(a)) return 1;
    if (l.isLessThan(f)) {
      const S = t.comparePoint(e.rightSE.point);
      if (S !== 0) return S;
    }
    if (l.isGreaterThan(f)) {
      const S = e.comparePoint(t.rightSE.point);
      if (S < 0) return 1;
      if (S > 0) return -1;
    }
    if (!l.eq(f)) {
      const S = h.minus(o), A = l.minus(n), N = E.minus(a), O = f.minus(r);
      if (S.isGreaterThan(A) && N.isLessThan(O)) return 1;
      if (S.isLessThan(A) && N.isGreaterThan(O)) return -1;
    }
    return l.isGreaterThan(f) ? 1 : l.isLessThan(f) || h.isLessThan(E) ? -1 : h.isGreaterThan(E) ? 1 : e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, t, n, r) {
    this.id = ++Gt, this.leftSE = e, e.segment = this, e.otherSE = t, this.rightSE = t, t.segment = this, t.otherSE = e, this.rings = n, this.windings = r;
  }
  static fromRing(e, t, n) {
    let r, l, f;
    const o = ee.comparePoints(e, t);
    if (o < 0)
      r = e, l = t, f = 1;
    else if (o > 0)
      r = t, l = e, f = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const a = new ee(r, !0), h = new ee(l, !1);
    return new ve(a, h, [n], [f]);
  }
  /* When a segment is split, the rightSE is replaced with a new sweep event */
  replaceRightSE(e) {
    this.rightSE = e, this.rightSE.segment = this, this.rightSE.otherSE = this.leftSE, this.leftSE.otherSE = this.rightSE;
  }
  bbox() {
    const e = this.leftSE.point.y, t = this.rightSE.point.y;
    return {
      ll: { x: this.leftSE.point.x, y: e.isLessThan(t) ? e : t },
      ur: { x: this.rightSE.point.x, y: e.isGreaterThan(t) ? e : t }
    };
  }
  /* A vector from the left point to the right */
  vector() {
    return {
      x: this.rightSE.point.x.minus(this.leftSE.point.x),
      y: this.rightSE.point.y.minus(this.leftSE.point.y)
    };
  }
  isAnEndpoint(e) {
    return e.x.eq(this.leftSE.point.x) && e.y.eq(this.leftSE.point.y) || e.x.eq(this.rightSE.point.x) && e.y.eq(this.rightSE.point.y);
  }
  /* Compare this segment with a point.
   *
   * A point P is considered to be colinear to a segment if there
   * exists a distance D such that if we travel along the segment
   * from one * endpoint towards the other a distance D, we find
   * ourselves at point P.
   *
   * Return value indicates:
   *
   *   1: point lies above the segment (to the left of vertical)
   *   0: point is colinear to segment
   *  -1: point lies below the segment (to the right of vertical)
   */
  comparePoint(e) {
    return se.orient(this.leftSE.point, e, this.rightSE.point);
  }
  /**
   * Given another segment, returns the first non-trivial intersection
   * between the two segments (in terms of sweep line ordering), if it exists.
   *
   * A 'non-trivial' intersection is one that will cause one or both of the
   * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
   *
   *   * endpoint of segA with endpoint of segB --> trivial
   *   * endpoint of segA with point along segB --> non-trivial
   *   * endpoint of segB with point along segA --> non-trivial
   *   * point along segA with point along segB --> non-trivial
   *
   * If no non-trivial intersection exists, return null
   * Else, return null.
   */
  getIntersection(e) {
    const t = this.bbox(), n = e.bbox(), r = Ge(t, n);
    if (r === null) return null;
    const l = this.leftSE.point, f = this.rightSE.point, o = e.leftSE.point, a = e.rightSE.point, h = ce(t, o) && this.comparePoint(o) === 0, E = ce(n, l) && e.comparePoint(l) === 0, S = ce(t, a) && this.comparePoint(a) === 0, A = ce(n, f) && e.comparePoint(f) === 0;
    if (E && h)
      return A && !S ? f : !A && S ? a : null;
    if (E)
      return S && l.x.eq(a.x) && l.y.eq(a.y) ? null : l;
    if (h)
      return A && f.x.eq(o.x) && f.y.eq(o.y) ? null : o;
    if (A && S) return null;
    if (A) return f;
    if (S) return a;
    const N = It(l, this.vector(), o, e.vector());
    return N === null || !ce(r, N) ? null : se.snap(N);
  }
  /**
   * Split the given segment into multiple segments on the given points.
   *  * Each existing segment will retain its leftSE and a new rightSE will be
   *    generated for it.
   *  * A new segment will be generated which will adopt the original segment's
   *    rightSE, and a new leftSE will be generated for it.
   *  * If there are more than two points given to split on, new segments
   *    in the middle will be generated with new leftSE and rightSE's.
   *  * An array of the newly generated SweepEvents will be returned.
   *
   * Warning: input array of points is modified
   */
  split(e) {
    const t = [], n = e.events !== void 0, r = new ee(e, !0), l = new ee(e, !1), f = this.rightSE;
    this.replaceRightSE(l), t.push(l), t.push(r);
    const o = new ve(
      r,
      f,
      this.rings.slice(),
      this.windings.slice()
    );
    return ee.comparePoints(o.leftSE.point, o.rightSE.point) > 0 && o.swapEvents(), ee.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), n && (r.checkForConsuming(), l.checkForConsuming()), t;
  }
  /* Swap which event is left and right */
  swapEvents() {
    const e = this.rightSE;
    this.rightSE = this.leftSE, this.leftSE = e, this.leftSE.isLeft = !0, this.rightSE.isLeft = !1;
    for (let t = 0, n = this.windings.length; t < n; t++)
      this.windings[t] *= -1;
  }
  /* Consume another segment. We take their rings under our wing
   * and mark them as consumed. Use for perfectly overlapping segments */
  consume(e) {
    let t = this, n = e;
    for (; t.consumedBy; ) t = t.consumedBy;
    for (; n.consumedBy; ) n = n.consumedBy;
    const r = ve.compare(t, n);
    if (r !== 0) {
      if (r > 0) {
        const l = t;
        t = n, n = l;
      }
      if (t.prev === n) {
        const l = t;
        t = n, n = l;
      }
      for (let l = 0, f = n.rings.length; l < f; l++) {
        const o = n.rings[l], a = n.windings[l], h = t.rings.indexOf(o);
        h === -1 ? (t.rings.push(o), t.windings.push(a)) : t.windings[h] += a;
      }
      n.rings = null, n.windings = null, n.consumedBy = t, n.leftSE.consumedBy = t.leftSE, n.rightSE.consumedBy = t.rightSE;
    }
  }
  /* The first segment previous segment chain that is in the result */
  prevInResult() {
    return this._prevInResult !== void 0 ? this._prevInResult : (this.prev ? this.prev.isInResult() ? this._prevInResult = this.prev : this._prevInResult = this.prev.prevInResult() : this._prevInResult = null, this._prevInResult);
  }
  beforeState() {
    if (this._beforeState !== void 0) return this._beforeState;
    if (!this.prev)
      this._beforeState = {
        rings: [],
        windings: [],
        multiPolys: []
      };
    else {
      const e = this.prev.consumedBy || this.prev;
      this._beforeState = e.afterState();
    }
    return this._beforeState;
  }
  afterState() {
    if (this._afterState !== void 0) return this._afterState;
    const e = this.beforeState();
    this._afterState = {
      rings: e.rings.slice(0),
      windings: e.windings.slice(0),
      multiPolys: []
    };
    const t = this._afterState.rings, n = this._afterState.windings, r = this._afterState.multiPolys;
    for (let o = 0, a = this.rings.length; o < a; o++) {
      const h = this.rings[o], E = this.windings[o], S = t.indexOf(h);
      S === -1 ? (t.push(h), n.push(E)) : n[S] += E;
    }
    const l = [], f = [];
    for (let o = 0, a = t.length; o < a; o++) {
      if (n[o] === 0) continue;
      const h = t[o], E = h.poly;
      if (f.indexOf(E) === -1)
        if (h.isExterior) l.push(E);
        else {
          f.indexOf(E) === -1 && f.push(E);
          const S = l.indexOf(h.poly);
          S !== -1 && l.splice(S, 1);
        }
    }
    for (let o = 0, a = l.length; o < a; o++) {
      const h = l[o].multiPoly;
      r.indexOf(h) === -1 && r.push(h);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const e = this.beforeState().multiPolys, t = this.afterState().multiPolys;
    switch (qe.type) {
      case "union": {
        const n = e.length === 0, r = t.length === 0;
        this._isInResult = n !== r;
        break;
      }
      case "intersection": {
        let n, r;
        e.length < t.length ? (n = e.length, r = t.length) : (n = t.length, r = e.length), this._isInResult = r === qe.numMultiPolys && n < r;
        break;
      }
      case "xor": {
        const n = Math.abs(e.length - t.length);
        this._isInResult = n % 2 === 1;
        break;
      }
      case "difference": {
        const n = (r) => r.length === 1 && r[0].isSubject;
        this._isInResult = n(e) !== n(t);
        break;
      }
    }
    return this._isInResult;
  }
}, He = class {
  poly;
  isExterior;
  segments;
  bbox;
  constructor(i, e, t) {
    if (!Array.isArray(i) || i.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (this.poly = e, this.isExterior = t, this.segments = [], typeof i[0][0] != "number" || typeof i[0][1] != "number")
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const n = se.snap({ x: new te(i[0][0]), y: new te(i[0][1]) });
    this.bbox = {
      ll: { x: n.x, y: n.y },
      ur: { x: n.x, y: n.y }
    };
    let r = n;
    for (let l = 1, f = i.length; l < f; l++) {
      if (typeof i[l][0] != "number" || typeof i[l][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const o = se.snap({ x: new te(i[l][0]), y: new te(i[l][1]) });
      o.x.eq(r.x) && o.y.eq(r.y) || (this.segments.push(Ae.fromRing(r, o, this)), o.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = o.x), o.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = o.y), o.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = o.x), o.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = o.y), r = o);
    }
    (!n.x.eq(r.x) || !n.y.eq(r.y)) && this.segments.push(Ae.fromRing(r, n, this));
  }
  getSweepEvents() {
    const i = [];
    for (let e = 0, t = this.segments.length; e < t; e++) {
      const n = this.segments[e];
      i.push(n.leftSE), i.push(n.rightSE);
    }
    return i;
  }
}, zt = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(i, e) {
    if (!Array.isArray(i))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new He(i[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let t = 1, n = i.length; t < n; t++) {
      const r = new He(i[t], this, !1);
      r.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = r.bbox.ll.x), r.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = r.bbox.ll.y), r.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = r.bbox.ur.x), r.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = r.bbox.ur.y), this.interiorRings.push(r);
    }
    this.multiPoly = e;
  }
  getSweepEvents() {
    const i = this.exteriorRing.getSweepEvents();
    for (let e = 0, t = this.interiorRings.length; e < t; e++) {
      const n = this.interiorRings[e].getSweepEvents();
      for (let r = 0, l = n.length; r < l; r++)
        i.push(n[r]);
    }
    return i;
  }
}, Ze = class {
  isSubject;
  polys;
  bbox;
  constructor(i, e) {
    if (!Array.isArray(i))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    try {
      typeof i[0][0][0] == "number" && (i = [i]);
    } catch {
    }
    this.polys = [], this.bbox = {
      ll: { x: new te(Number.POSITIVE_INFINITY), y: new te(Number.POSITIVE_INFINITY) },
      ur: { x: new te(Number.NEGATIVE_INFINITY), y: new te(Number.NEGATIVE_INFINITY) }
    };
    for (let t = 0, n = i.length; t < n; t++) {
      const r = new zt(i[t], this);
      r.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = r.bbox.ll.x), r.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = r.bbox.ll.y), r.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = r.bbox.ur.x), r.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = r.bbox.ur.y), this.polys.push(r);
    }
    this.isSubject = e;
  }
  getSweepEvents() {
    const i = [];
    for (let e = 0, t = this.polys.length; e < t; e++) {
      const n = this.polys[e].getSweepEvents();
      for (let r = 0, l = n.length; r < l; r++)
        i.push(n[r]);
    }
    return i;
  }
}, qt = (i, ...e) => qe.run("union", i, e);
se.set;
function Dt(i, e = {}) {
  const t = [];
  if (De(i, (r) => {
    t.push(r.coordinates);
  }), t.length < 2)
    throw new Error("Must have at least 2 geometries");
  const n = qt(t[0], ...t.slice(1));
  return n.length === 0 ? null : n.length === 1 ? yt(n[0], e.properties) : mt(n, e.properties);
}
function Je(i) {
  if (!i) throw new Error("geojson is required");
  var e = [];
  return wt(i, function(t) {
    e.push(t);
  }), dt(e);
}
const Le = /* @__PURE__ */ new WeakMap();
let Ut = 0;
const Pe = (i) => (Le.has(i) || Le.set(i, String(Ut++)), Le.get(i));
new re(
  (i, e, t) => {
    const [n, r, l] = e.split("|").map(Number), f = Math.pow(2, n) * t, o = 85.05112878, a = 1;
    return i[0].some((E) => {
      const S = Math.max(Math.min(E[1], o), -o), A = Math.sin(S * Math.PI / 180), N = (E[0] + 180) / 360, O = 0.5 - Math.log((1 + A) / (1 - A)) / (4 * Math.PI), b = N * f, k = O * f, B = Math.floor(b / t), _ = Math.floor(k / t), j = Math.floor(b - B * t), W = Math.floor(k - _ * t);
      return _ !== l || B !== r || j <= a || W <= a || j >= t - a || W >= t - a;
    });
  },
  {
    keyResolver: (i, e, t) => \`\${Pe(i)}|\${e}|\${t}\`
  }
);
new re(
  (i, e = !1) => {
    const t = e ? /* @__PURE__ */ new Set() : null;
    let n = 0;
    const r = (a) => Array.isArray(a) && a.length >= 2 && typeof a[0] == "number" && typeof a[1] == "number", l = (a) => {
      e ? t.add(a.slice(0, 3).join(",")) : n++;
    };
    function f(a) {
      if (r(a)) {
        l(a);
        return;
      }
      if (Array.isArray(a)) for (const h of a) f(h);
    }
    function o(a) {
      if (a) {
        if (a.type === "FeatureCollection") {
          for (const h of a.features || []) o(h);
          return;
        }
        if (a.type === "Feature") {
          o(a.geometry);
          return;
        }
        if (a.type === "GeometryCollection") {
          for (const h of a.geometries || []) o(h);
          return;
        }
        a.coordinates !== void 0 && f(a.coordinates);
      }
    }
    return o(i), e ? t.size : n;
  },
  {
    keyResolver: (i, e = !1) => \`\${Pe(i)}|\${e ? "unique" : "__count"}\`
  }
);
const Vt = (i, e) => {
  if (!i || i.geometry?.type !== "Polygon")
    throw new Error("Non-Polygon geometry");
  const t = i.geometry.coordinates, n = at(t, e);
  if (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1]))
    throw new Error("Invalid polylabel result");
  return {
    type: "Point",
    coordinates: [n[0], n[1]]
  };
}, $t = new re(Vt, {
  keyResolver: (i, e) => \`\${Pe(i)}|\${e === void 0 ? "__default" : String(e)}\`
}), jt = (i) => {
  const e = i?.geometry?.coordinates;
  if (!Array.isArray(e) || !Array.isArray(e[0]))
    return { type: "Point", coordinates: [0, 0] };
  const t = e[0];
  let n = 0, r = 0, l = 0;
  for (let o = 0; o < t.length; o++) {
    const [a, h] = t[o], [E, S] = t[(o + 1) % t.length], A = a * S - E * h;
    n += (a + E) * A, r += (h + S) * A, l += A;
  }
  if (l === 0)
    return { type: "Point", coordinates: t[0] || [0, 0] };
  const f = 1 / (3 * l);
  return { type: "Point", coordinates: [n * f, r * f] };
}, Wt = (i, e) => {
  try {
    return $t(i, e);
  } catch {
    return jt(i);
  }
}, rt = (i, e) => {
  if (!i || typeof i != "object" || !i.geometry)
    return 0;
  if (e === "meters" || e === "m")
    return vt(i);
  const t = i.geometry.coordinates;
  if (!Array.isArray(t) || t.length === 0)
    return 0;
  const n = i.geometry.type === "Polygon" ? t[0] : t[0]?.[0];
  if (!Array.isArray(n))
    return 0;
  let r = 0;
  for (let l = 0; l < n.length; l++) {
    const [f, o] = n[l], [a, h] = n[(l + 1) % n.length];
    r += f * h - a * o;
  }
  return Math.abs(r) / 2;
}, Xt = new re(rt, {
  keyResolver: (i, e) => \`\${Pe(i)}|\${e === void 0 ? "__planar" : String(e)}\`
}), Kt = (i, e) => {
  try {
    return i && typeof i == "object" ? Xt(i, e) : rt(i, e);
  } catch (t) {
    return console.log("Error computing area for feature", i && i.id, t), 0;
  }
}, ke = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
ke.onmessage = (i) => {
  const e = i.data, t = ut(e), n = Object.values(t.pieces), r = t.tolerance || 1e-5, l = t.unit || "meters";
  t.tileSize;
  const f = /* @__PURE__ */ new Map();
  n.forEach((o) => {
    for (const [a, h] of Object.entries(o)) {
      const E = f.get(a) || [];
      E.push(h), f.set(a, E);
    }
  });
  for (const [o, a] of f.entries()) {
    if (o === "size") continue;
    let h = {
      type: "FeatureCollection",
      features: a.reduce((A, N) => [...A, ...N.features], []).filter((A) => A.geometry.type === "Polygon")
    };
    if (h.features.some((A) => A.geometry.type === "MultiPolygon") && (h = Je(h)), h.features.some((A) => A.properties.clipped) && h.features.length > 1) {
      let A = {
        type: "FeatureCollection",
        features: h.features.filter((O) => O.properties.clipped)
      };
      const N = h.features.filter((O) => !O.properties.clipped);
      if (A.features.length > 1) {
        const { clipped: O, ...b } = h.features[0].properties;
        b._index = A.features.map((k) => k.properties._index).sort().join("-"), A = Dt(A), A = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: A.geometry,
              properties: b
            }
          ]
        };
      }
      h = {
        type: "FeatureCollection",
        features: [...N, ...A.features]
      };
    }
    h.features.some((A) => A.geometry.type === "MultiPolygon") && (h = Je(h)), h.features = h.features.map((A, N) => {
      const O = \`\${o}-\${N}\`, b = A.geometry, k = A.properties;
      if (b && b.type === "Polygon") {
        const B = Kt(A, l);
        A.geometry = Wt(A, r), A.properties = { ...k, _area: B, _groupId: o };
      } else
        console.log(
          "Unexpected geometry type after union/simplify/flatten for id:" + o + " - type:" + (b && b.type)
        ), A.properties = { ...k, _area: 0, _groupId: o };
      return A.id = O, A;
    });
    const E = Math.max(
      ...h.features.map((A) => A.properties && A.properties._area || 0)
    );
    h.features = h.features.map((A) => (A.properties && A.properties._area != null && A.properties._area > 0 ? (A.properties._localSortKey = E / A.properties._area, A.properties._globalSortKey = 1 / A.properties._area) : (A.properties._localSortKey = 1 / 0, A.properties._globalSortKey = 1 / 0), A)), h.id = o;
    const S = lt(h).buffer;
    ke.postMessage(S, [S]);
  }
  ke.postMessage({ type: "commit" });
};
`, L = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", z], { type: "text/javascript;charset=utf-8" });
function ee(h) {
  let e;
  try {
    if (e = L && (self.URL || self.webkitURL).createObjectURL(L), !e) throw "";
    const n = new Worker(e, {
      type: "module",
      name: h?.name
    });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), n;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(z),
      {
        type: "module",
        name: h?.name
      }
    );
  }
}
class ne {
  constructor(e) {
    return this.map = e.map, this.source = e.source instanceof maplibregl.VectorTileSource ? e.source : this.map.getSource(e.source), this.sourceLayer = e.sourceLayer, this.fid = e.fid || "id", this.tileSize = this.source.tileSize || 512, this.tolerance = e.tolerance || 1e-5, this.cacheSize = e.cacheSize || 5e3, this.units = e.units || "meters", this.map.addSource(this.source.id + "-proper", {
      type: "geojson",
      maxzoom: this.source.maxzoom,
      promoteId: "_index",
      data: {}
    }), this.gjSource = this.map.getSource(this.source.id + "-proper"), this.manager = new Z({
      map: this.map,
      source: this.source,
      sourceLayer: this.sourceLayer,
      fid: this.fid,
      tileSize: this.tileSize,
      tolerance: this.tolerance,
      cacheSize: this.cacheSize,
      units: this.units,
      tileWorkerSource: X,
      gatherWorkerSource: ee
    }), this.manager.setGeoJsonSource(this.gjSource), this.map.on("sourcedata", (n) => this.manager.handleSourceData(n)), this.map.refreshTiles(this.source.id), this.gjSource;
  }
}
maplibregl.VectorTileSource.prototype.ProperLabels = function(h) {
  const e = Object.assign({}, h, {
    map: this._map,
    source: this
  });
  return this._proper || (this._proper = new ne(e)), this._proper;
};
export {
  ne as default
};
