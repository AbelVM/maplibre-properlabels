"use strict";let k,x;function H(){return k!==void 0?k===!1?null:k:typeof TextEncoder<"u"?(k=new TextEncoder,k):typeof Buffer<"u"&&typeof Buffer.from=="function"?(k={encode:u=>new Uint8Array(Buffer.from(u))},k):(k=!1,null)}function K(){return x!==void 0?x===!1?null:x:typeof TextDecoder<"u"?(x=new TextDecoder,x):typeof Buffer<"u"&&typeof Buffer.from=="function"?(x={decode:u=>Buffer.from(u).toString("utf8")},x):(x=!1,null)}const I=u=>{if(u instanceof Uint8Array)return u;if(ArrayBuffer.isView(u))return new Uint8Array(u.buffer,u.byteOffset,u.byteLength);if(u instanceof ArrayBuffer)return new Uint8Array(u);const e=JSON.stringify(u),n=H();if(n&&typeof n.encode=="function")return n.encode(e);throw new Error("No TextEncoder or Buffer available to encode object")},z=u=>{let e;if(u instanceof Uint8Array)e=u;else if(ArrayBuffer.isView(u))e=new Uint8Array(u.buffer,u.byteOffset,u.byteLength);else if(u instanceof ArrayBuffer)e=new Uint8Array(u);else if(typeof Buffer<"u"&&typeof Buffer.isBuffer=="function"&&Buffer.isBuffer(u))e=new Uint8Array(u);else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");const n=K();if(n&&typeof n.decode=="function")return JSON.parse(n.decode(e));if(typeof TextDecoder<"u")return JSON.parse(new TextDecoder().decode(e));throw new Error("No TextDecoder or Buffer available to decode object")};class R{constructor({maxEntries:e=1/0,maxWeight:n=1/0,weightFn:t=()=>1,defaultTTL:r=6e4,maxPoolSize:i=1e3,rejectOversized:o=!1,onEvict:a=null,onExpire:s=null,initialPoolSize:l=0,maxCleanupPerTick:c=100,eagerCleanupOnRead:h=!1}={}){this.maxEntries=e,this.maxWeight=n,this.weightFn=t,this.defaultTTL=r,this.maxPoolSize=i,this.rejectOversized=!!o,this.onEvict=typeof a=="function"?a:null,this.onExpire=typeof s=="function"?s:null,this.maxCleanupPerTick=Number.isFinite(+c)?Math.max(1,+c):100,this.eagerCleanupOnRead=!!h,this.map=new Map,this.head=null,this.tail=null,this.pool=[];for(let f=0;f<Math.min(l||0,this.maxPoolSize);f++)this.pool.push({key:null,value:null,weight:0,expiresAt:0,prev:null,next:null});this.currentWeight=0,this.hits=0,this.misses=0,this.evictions=0,this.rejected=0,this.expirations=0,this._cleanupTimer=null,this._cleanupRunning=!1,this._cleanupParams=null,this._cleanupCursor=null,this._cleanupCursorValid=!1,this._inflightPromises=new Map}_allocNode(e,n,t,r){const i=this.pool.pop()||{key:null,value:null,weight:0,expiresAt:0,prev:null,next:null};return i.key=e,i.value=n,i.weight=t||0,i.expiresAt=r||0,i.prev=null,i.next=null,i}_freeNode(e){e.key=null,e.value=null,e.weight=0,e.expiresAt=0,e.prev=null,e.next=null,this.pool.length<this.maxPoolSize&&this.pool.push(e)}_removeExpiredNode(e,n,t=!1){if(!e||!e.expiresAt||e.expiresAt>n)return!1;const r=e.key,i=e.value,o=e.next;this.map.delete(r),this.currentWeight-=e.weight||0,this._cleanupCursor===e&&(this._cleanupCursor=o),this._cleanupCursorValid=!!this._cleanupCursor,this._remove(e);try{this.onExpire&&this.onExpire(r,i)}catch{}return this._freeNode(e),t&&this.misses++,this.expirations++,!0}_fetchValidNode(e,{ignoreExpiry:n=!1,countMiss:t=!1,allowExpired:r=!1}={}){const i=this.map.get(e);return i?!n&&i.expiresAt&&i.expiresAt<=Date.now()?r?i:(this._removeExpiredNode(i,Date.now(),t),null):i:(t&&this.misses++,null)}_refreshStaleEntry(e,n,{ttl:t=void 0,weight:r=void 0}={}){if(this._inflightPromises.has(e))return;let i;try{i=Promise.resolve().then(()=>n())}catch{return}const o=i.then(a=>{try{this.set(e,a,{ttl:t,weight:r})}catch{}return this._inflightPromises.delete(e),a},a=>{this._inflightPromises.delete(e)});this._inflightPromises.set(e,o)}_append(e){if(!this.tail){this.head=this.tail=e;return}e.prev=this.tail,e.next=null,this.tail.next=e,this.tail=e}_remove(e){const n=e.prev,t=e.next;n?n.next=t:this.head=t,t?t.prev=n:this.tail=n,e.prev=e.next=null}_moveToTail(e){this.tail!==e&&(this._remove(e),this._append(e))}_evictIfNeeded(){for(;this.map.size>this.maxEntries||this.currentWeight>this.maxWeight;){const e=this.head;if(!e)break;const n=e.next,t=e.key,r=e.value;this._cleanupCursor===e&&(this._cleanupCursor=n),this._cleanupCursorValid=!!this._cleanupCursor,this._remove(e),this.map.delete(t),this.currentWeight-=e.weight||0,this.evictions++;try{this.onEvict&&this.onEvict(t,r,"evicted")}catch{}this._freeNode(e)}}set(e,n,{ttl:t=this.defaultTTL,weight:r=null}={}){const i=Date.now(),o=t==null||t===1/0?0:i+t;let a;if(r!=null)a=r;else{try{a=this.weightFn(n)}catch{a=0}a==null&&(a=0)}const s=Number.isFinite(+a)?Math.max(0,+a):0;if(this.rejectOversized&&Number.isFinite(this.maxWeight)&&s>this.maxWeight){this.rejected++;try{this.onEvict&&this.onEvict(e,n,"rejected-oversized")}catch{}return!1}if(this.map.has(e)){const l=this.map.get(e);this.currentWeight-=l.weight||0,l.value=n,l.weight=s,l.expiresAt=o,this.currentWeight+=l.weight||0,this._moveToTail(l)}else{const l=this._allocNode(e,n,s,o);this.map.set(e,l),this._append(l),this.currentWeight+=l.weight||0,this._evictIfNeeded()}return this}get(e){const n=this._fetchValidNode(e,{countMiss:!0});if(n)return this._moveToTail(n),this.hits++,n.value}peek(e){const n=this._fetchValidNode(e);return n?n.value:void 0}has(e,{ignoreExpiry:n=!1}={}){return!!this._fetchValidNode(e,{ignoreExpiry:n})}getOrSet(e,n,{ttl:t=void 0,weight:r=void 0,staleWhileRevalidate:i=!1}={}){const o=Date.now(),a=this._fetchValidNode(e,{countMiss:!1,allowExpired:i});if(a)if(a.expiresAt&&a.expiresAt<=o){if(typeof n=="function")return this._moveToTail(a),this.hits++,this._refreshStaleEntry(e,n,{ttl:t,weight:r}),a.value;this._removeExpiredNode(a,o,!0)}else return this._moveToTail(a),this.hits++,a.value;else this.misses++;if(typeof n=="function"){const s=n();return s&&typeof s.then=="function"?s.then(l=>{try{this.set(e,l,{ttl:t,weight:r})}catch{}return l}):(this.set(e,s,{ttl:t,weight:r}),s)}return this.set(e,n,{ttl:t,weight:r}),n}setMany(e,{ttl:n=void 0,weight:t=void 0}={}){const r=Date.now(),i=n==null||n===1/0?0:r+n;for(const o of e){if(!o)continue;const[a,s]=o;let l;if(t!=null)l=t;else{try{l=this.weightFn(s)}catch{l=0}l==null&&(l=0)}const c=Number.isFinite(+l)?Math.max(0,+l):0;if(this.map.has(a)){const h=this.map.get(a);this.currentWeight-=h.weight||0,h.value=s,h.weight=c,h.expiresAt=i,this.currentWeight+=h.weight||0,this._moveToTail(h)}else{const h=this._allocNode(a,s,c,i);this.map.set(a,h),this._append(h),this.currentWeight+=h.weight||0}}return this._evictIfNeeded(),this}getMany(e,{ignoreExpiry:n=!1}={}){const t=new Map;for(const r of e){const i=this._fetchValidNode(r,{ignoreExpiry:n,countMiss:!0});i&&(this._moveToTail(i),this.hits++,t.set(r,i.value))}return t}touch(e,n=void 0){const t=this._fetchValidNode(e);if(!t)return!1;const r=Date.now();return n!==void 0&&(t.expiresAt=n==null||n===1/0?0:r+n),this._moveToTail(t),!0}getOrSetAsync(e,n,{ttl:t=void 0,weight:r=void 0,staleWhileRevalidate:i=!1}={}){if(typeof n!="function")return Promise.resolve(this.getOrSet(e,n,{ttl:t,weight:r}));const o=Date.now(),a=this.map.get(e);if(a)if(a.expiresAt&&a.expiresAt<=o){if(i)return this._moveToTail(a),this.hits++,this._refreshStaleEntry(e,n,{ttl:t,weight:r}),Promise.resolve(a.value);this._removeExpiredNode(a,o,!1)}else return this._moveToTail(a),this.hits++,Promise.resolve(a.value);if(this._inflightPromises.has(e))return this._inflightPromises.get(e);this.misses++;let s;try{s=Promise.resolve().then(()=>n())}catch(c){return Promise.reject(c)}const l=s.then(c=>{try{this.set(e,c,{ttl:t,weight:r})}catch{}return this._inflightPromises.delete(e),c},c=>{throw this._inflightPromises.delete(e),c});return this._inflightPromises.set(e,l),l}hasEqual(e,n,{ignoreExpiry:t=!1,seen:r=void 0}={}){const i=this._fetchValidNode(e,{ignoreExpiry:t});if(!i)return!1;const o=i.value;return o===n?!0:typeof o!=="object"||o===null||typeof n!=="object"||n===null?o===n:S(o,n,r)}hasEqualWithSeen(e,n,t,{ignoreExpiry:r=!1}={}){return this.hasEqual(e,n,{ignoreExpiry:r,seen:t})}delete(e){const n=this.map.get(e);if(!n)return!1;const t=n.next;this.map.delete(e),this.currentWeight-=n.weight||0,this._cleanupCursor===n&&(this._cleanupCursor=t),this._cleanupCursorValid=!!this._cleanupCursor,this._remove(n);try{this.onEvict&&this.onEvict(n.key,n.value,"deleted")}catch{}return this._freeNode(n),!0}clear(){for(let e=this.head;e;){const n=e.next;this._freeNode(e),e=n}this.head=this.tail=null,this.map.clear(),this.currentWeight=0,this._cleanupCursor=null,this._cleanupCursorValid=!1}cleanupExpired(){return this.cleanupExpiredUpTo()}cleanupExpiredUpTo(e=1/0){const n=Date.now();let t=0,r=this._cleanupCursor&&this._cleanupCursorValid?this._cleanupCursor:this.head;for(;r&&t<e;){const i=r.next;if(r.expiresAt&&r.expiresAt<=n){const o=r.key,a=r.value;this.map.delete(o),this.currentWeight-=r.weight||0,this._cleanupCursor===r&&(this._cleanupCursor=i),this._cleanupCursorValid=!!this._cleanupCursor,this._remove(r);try{this.onExpire&&this.onExpire(o,a)}catch{}this._freeNode(r),this.expirations++}r=i,t++}return this._cleanupCursor=r||this.head,this._cleanupCursorValid=!!this._cleanupCursor,t}startCleanup(e={}){let n,t;typeof e=="number"?(n=e,t=this.maxCleanupPerTick):(n=Number.isFinite(+e.interval)?+e.interval:Math.max(1e3,Math.min(this.defaultTTL||6e4,6e4)),t=Number.isFinite(+e.maxCleanupPerTick)?Math.max(1,+e.maxCleanupPerTick):this.maxCleanupPerTick),this.stopCleanup(),this._cleanupParams={interval:n,maxCleanupPerTick:t},this._cleanupTimer=setTimeout(()=>this._cleanupTick(),n)}stopCleanup(){this._cleanupTimer&&(clearTimeout(this._cleanupTimer),this._cleanupTimer=null),this._cleanupRunning=!1,this._cleanupParams=null}[Symbol.dispose](){try{this.stopCleanup()}catch{}try{this.clear()}catch{}}async[Symbol.asyncDispose](){try{this.stopCleanup()}catch{}try{this.clear()}catch{}}_cleanupTick(){if(this._cleanupTimer!=null){if(this._cleanupRunning){this._cleanupTimer=setTimeout(()=>this._cleanupTick(),this._cleanupParams.interval);return}this._cleanupRunning=!0;try{this.cleanupExpiredUpTo(this._cleanupParams.maxCleanupPerTick)}finally{this._cleanupRunning=!1}this._cleanupTimer=setTimeout(()=>this._cleanupTick(),this._cleanupParams.interval)}}get size(){return this.map.size}get hitRate(){const e=(this.hits||0)+(this.misses||0);return e?this.hits/e:0}stats(){return{size:this.size,weight:this.currentWeight,hits:this.hits,misses:this.misses,evictions:this.evictions,expirations:this.expirations,rejected:this.rejected,poolSize:this.pool.length}}resize({maxEntries:e,maxWeight:n}={}){Number.isFinite(+e)&&(this.maxEntries=Math.max(0,+e)),Number.isFinite(+n)&&(this.maxWeight=Math.max(0,+n)),this._evictIfNeeded()}*entries(e="MRU"){if(e==="MRU")for(let n=this.tail;n;n=n.prev)yield[n.key,n.value];else for(let n=this.head;n;n=n.next)yield[n.key,n.value]}[Symbol.iterator](){return this.entries("MRU")}*keys(e="MRU"){for(const[n]of this.entries(e))yield n}*values(e="MRU"){for(const[,n]of this.entries(e))yield n}}function S(u,e,n=void 0){if(u===e)return!0;if(u==null||e==null||typeof u!=="object"||typeof e!=="object")return u===e;n||(n=new WeakMap);let i=n.get(u);if(i&&i.has(e))return!0;if(i||(i=new WeakSet,n.set(u,i)),i.add(e),Object.getPrototypeOf(u)!==Object.getPrototypeOf(e))return!1;if(typeof Uint8Array<"u"&&u instanceof Uint8Array){if(!(e instanceof Uint8Array)||u.length!==e.length)return!1;for(let s=0;s<u.length;s++)if(u[s]!==e[s])return!1;return!0}if(Array.isArray(u)){if(!Array.isArray(e)||u.length!==e.length)return!1;for(let s=0;s<u.length;s++)if(!S(u[s],e[s],n))return!1;return!0}if(ArrayBuffer.isView(u)){if(!ArrayBuffer.isView(e)||u.byteLength!==e.byteLength)return!1;const s=new Uint8Array(u.buffer,u.byteOffset||0,u.byteLength),l=new Uint8Array(e.buffer,e.byteOffset||0,e.byteLength);for(let c=0;c<s.length;c++)if(s[c]!==l[c])return!1;return!0}if(u instanceof ArrayBuffer){if(!(e instanceof ArrayBuffer)||u.byteLength!==e.byteLength)return!1;const s=new Uint8Array(u),l=new Uint8Array(e);for(let c=0;c<s.length;c++)if(s[c]!==l[c])return!1;return!0}if(u instanceof Date)return e instanceof Date?u.getTime()===e.getTime():!1;if(u instanceof RegExp)return e instanceof RegExp?u.toString()===e.toString():!1;if(u instanceof Map){if(!(e instanceof Map)||u.size!==e.size)return!1;for(const[s,l]of u)if(!e.has(s)||!S(l,e.get(s),n))return!1;return!0}if(u instanceof Set){if(!(e instanceof Set)||u.size!==e.size)return!1;let s=!0;for(const l of u)if(l!==null&&typeof l=="object"){s=!1;break}if(s){for(const l of u)if(!e.has(l))return!1;return!0}for(const l of u){let c=!1;for(const h of e)if(S(l,h,n)){c=!0;break}if(!c)return!1}return!0}const o=Object.keys(u),a=Object.keys(e);if(o.length!==a.length)return!1;for(let s=0;s<o.length;s++){const l=o[s];if(!Object.prototype.hasOwnProperty.call(e,l)||!S(u[l],e[l],n))return!1}return!0}let E=null;if(typeof process<"u"&&process.hrtime&&typeof process.hrtime.bigint=="function")try{const u=Number(process.hrtime.bigint()/1000000n);E=Date.now()-u}catch{E=null}const w=()=>{const u=Date.now();if(typeof performance<"u"&&typeof performance.now=="function"&&typeof performance.timeOrigin=="number")try{const e=performance.timeOrigin+performance.now();return Math.abs(e-u)<1e3?e:u}catch{}if(E!=null)try{const e=Number(process.hrtime.bigint()/1000000n)+E;return Math.abs(e-u)<1e3?e:u}catch{return u}return u};class A{constructor(e=16){const n=Math.max(2,Number(e)||16);for(this._capacity=1;this._capacity<n;)this._capacity<<=1;this._mask=this._capacity-1,this._buffer=new Array(this._capacity),this._head=0,this._tail=0,this._size=0}push(e){return this._size===this._capacity&&this._grow(),this._buffer[this._tail]=e,this._tail=this._tail+1&this._mask,this._size++,this._size}shift(){if(this._size===0)return;const e=this._buffer[this._head];return this._buffer[this._head]=void 0,this._head=this._head+1&this._mask,this._size--,e}peek(){return this._size===0?void 0:this._buffer[this._head]}clear(){if(this._size===0)return;let e=this._head;for(let n=0;n<this._size;n++)this._buffer[e]=void 0,e=e+1&this._mask;this._head=this._tail=0,this._size=0}get length(){return this._size}get capacity(){return this._capacity}get isEmpty(){return this._size===0}*[Symbol.iterator](){let e=this._head;for(let n=0;n<this._size;n++)yield this._buffer[e+n&this._mask]}values(){return this[Symbol.iterator]()}*keys(){for(let e=0;e<this._size;e++)yield e}*entries(){for(let e=0;e<this._size;e++)yield[e,this._buffer[this._head+e&this._mask]]}*drain(){for(;this._size>0;)yield this.shift()}toArray(){const e=new Array(this._size);for(let n=0;n<this._size;n++)e[n]=this._buffer[this._head+n&this._mask];return e}_grow(){const e=this._buffer,t=this._capacity<<1,r=new Array(t);for(let i=0;i<this._size;i++)r[i]=e[this._head+i&this._mask];this._buffer=r,this._capacity=t,this._mask=t-1,this._head=0,this._tail=this._size&this._mask}pushMany(e){if(!Array.isArray(e)||e.length===0)return this._size;const n=this._size+e.length;for(;this._capacity<n;)this._grow();const t=Math.min(e.length,this._capacity-this._tail);for(let i=0;i<t;i++)this._buffer[this._tail+i]=e[i];this._tail=this._tail+t&this._mask;let r=t;for(;r<e.length;){const i=Math.min(e.length-r,this._capacity-this._tail);for(let o=0;o<i;o++)this._buffer[this._tail+o]=e[r+o];this._tail=this._tail+i&this._mask,r+=i}return this._size=n,this._size}unshiftMany(e){if(!Array.isArray(e)||e.length===0)return this._size;const n=this._size+e.length;for(;this._capacity<n;)this._grow();let t=this._head-e.length&this._mask;for(let r=0;r<e.length;r++)this._buffer[t+r&this._mask]=e[r];return this._head=t,this._size=n,this._size}}function J(u,e="ERR_ITEM"){return!u||typeof u!="object"?{error:!0,code:e,message:u?String(u):void 0,stack:void 0}:{error:!0,code:u.code||e,message:u.message,stack:u.stack}}function O(u){return!u||!u.error?String(u):`${u.code||"ERR"}: ${u.message||""}`}const Y=()=>typeof globalThis<"u"&&globalThis&&globalThis.console?globalThis.console:typeof self<"u"&&self&&self.console?self.console:typeof window<"u"&&window&&window.console?window.console:typeof global<"u"&&global&&global.console?global.console:null,v=Y();class q{constructor(e=0,n={}){this._debugLevel=0,this._counters=Object.create(null),this._format=n&&n.format||"text",this.name=n&&n.name||null,this._formatter=n&&typeof n.formatter=="function"?n.formatter:null,this._output=n&&typeof n.output=="function"?n.output:null,this.setDebugLevel(e)}setDebugLevel(e){let n=NaN;typeof e=="number"?n=e:typeof e=="string"||typeof e=="boolean"?n=Number(e):(e instanceof Number||e instanceof String||e instanceof Boolean)&&(n=Number(e.valueOf())),this._debugLevel=Number.isFinite(n)&&n>=0?Math.max(0,Math.min(3,Math.floor(n))):0}getDebugLevel(){return this._debugLevel}isDebugLevel(e=1){return Number(this._debugLevel)>=Number(e||1)}isDebug(){return this.isDebugLevel(1)}_resolveLogArgs(e){return e.map(n=>{if(typeof n=="function")try{return n()}catch(t){return t}return n})}_emit(e,n,t,r,i={}){if(!this.isDebugLevel(e))return;const o=this._resolveLogArgs(r),a=i.msgArray?o:o.length===1?o[0]:o;let s={level:t,msg:a,ts:w(),format:this._format};if(this.name&&(s.name=this.name),this._formatter)try{const l=this._formatter(s);if(l!=null){if(typeof l=="string"){if(this._output){try{this._output(l)}catch{}return}v&&typeof v[n]=="function"&&v[n](l);return}s=l}}catch{}if(this._output){try{this._output(s)}catch{}return}if(!(!v||typeof v[n]!="function"))if(this._format==="json")try{const l=typeof s=="string"?s:JSON.stringify(s);v[n](l)}catch{v[n](...Array.isArray(o)?o:[o])}else v[n](...o)}error(...e){const n=e.map(t=>{try{if(t&&t.error)return O(t);if(t instanceof Error||t&&typeof t=="object")return O(J(t))}catch{}return t});this._emit(1,"error","error",n)}warn(...e){this._emit(2,"warn","warn",e)}info(...e){this._emit(3,"info","info",e)}log(...e){this._emit(3,"log","log",e)}debug(...e){this._emit(3,"debug","debug",e)}table(...e){if(!this.isDebugLevel(3)||!v)return;if(this._format==="json"){this._emit(3,"log","table",e,{msgArray:!0});return}const n=this._resolveLogArgs(e);typeof v.table=="function"?v.table(...n):typeof v.log=="function"&&v.log(...n)}incrementCounter(e){if(!this.isDebug())return;const n=String(e||"");n&&(this._counters[n]=(this._counters[n]||0)+1)}getDebugCounters(){return Object.assign({},this._counters)}resetDebugCounters(){this._counters=Object.create(null)}}const Z=Symbol("PowerSubscriberSet.original");class T{constructor(e={}){const{weak:n=!1,maxListeners:t=0}=e||{};this._weak=!!n,this._maxListeners=Number.isFinite(Number(t))?Math.max(0,Math.floor(Number(t))):0,this._listeners=new Set,this._onceMap=new WeakMap,this._finalization=null,this._weak&&typeof WeakRef<"u"&&typeof FinalizationRegistry<"u"&&(this._finalization=new FinalizationRegistry(r=>{this._listeners.delete(r.ref)}))}get size(){return this._cleanup(),this._listeners.size}add(e){if(typeof e!="function"){if(!this._weak||!e||typeof e.deref!="function")throw new TypeError("listener must be a function");if(this._maxListeners>0&&this.size+1>this._maxListeners)throw new Error(`PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`);return this._listeners.add(e),()=>this.delete(e)}if(this._maxListeners>0&&this.size+1>this._maxListeners)throw new Error(`PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`);const n=this._makeEntry(e);return this._listeners.add(n),()=>this.delete(e)}addOnce(e){if(typeof e!="function")throw new TypeError("listener must be a function");const n=(...r)=>{try{e(...r)}finally{this.delete(e)}};try{n[Z]=e}catch{}if(this._onceMap.set(e,n),this._maxListeners>0&&this.size+1>this._maxListeners)throw new Error(`PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`);const t=this._makeEntry(n);return this._listeners.add(t),()=>this.delete(e)}delete(e){let n=e;const t=this._onceMap.get(e);t&&(n=t,this._onceMap.delete(e));for(const r of this._listeners){const i=this._deref(r);if(!i){this._listeners.delete(r);continue}if(i===n)return this._listeners.delete(r),this._finalization&&typeof r.deref=="function"&&this._finalization.unregister(r),!0}return!1}forEach(e){for(const n of this._listeners){const t=this._deref(n);if(!t){this._listeners.delete(n);continue}e(t)}}clear(){this._listeners.clear(),this._onceMap=new WeakMap}values(){this._cleanup();const e=[];for(const n of this._listeners){const t=this._deref(n);t&&e.push(t)}return e}[Symbol.iterator](){return this.values()[Symbol.iterator]()}_cleanup(){if(!(!this._weak||typeof WeakRef>"u"))for(const e of this._listeners)e&&typeof e.deref=="function"&&!e.deref()&&this._listeners.delete(e)}_makeEntry(e){if(this._weak&&typeof WeakRef<"u"){const n=new WeakRef(e);if(this._finalization)try{this._finalization.register(e,{ref:n},n)}catch{}return n}return e}_deref(e){return e&&typeof e.deref=="function"?e.deref():e}}function X(u){if(u){if(typeof u.cleanup=="function"){try{u.cleanup()}catch{}return}if(typeof u._cleanup=="function"){try{u._cleanup()}catch{}return}if(typeof u[Symbol.iterator]=="function"&&typeof u.delete=="function")for(const e of u)(e&&typeof e.deref=="function"?e.deref():e)||u.delete(e)}}class U{constructor(e={}){this._listeners=new Map,this._maxListeners=Number.isFinite(Number(e.maxListeners))?Math.max(0,Number(e.maxListeners)):0,this._weak=!!e.weak,this._fr=null,this._finalizationRefs=new WeakMap}_ensureFinalizationRegistry(){return!this._weak||typeof FinalizationRegistry>"u"?null:this._fr?this._fr:(this._fr=new FinalizationRegistry(e=>{try{const{event:n,ref:t}=e,r=this._listeners.get(n);r&&typeof r.delete=="function"&&r.delete(t.deref?t.deref():t)}catch{}}),this._fr)}cleanup(){if(this._weak)for(const[e,n]of this._listeners)X(n),n.size===0&&this._listeners.delete(e)}_getBucket(e){let n=this._listeners.get(e);if(!n)return null;if(n instanceof T)return n;if(n&&typeof n[Symbol.iterator]=="function"){const t=new T({maxListeners:this._maxListeners,weak:this._weak});for(const r of n){const i=r&&typeof r.deref=="function"?r.deref():r;i&&t.add(i)}return this._listeners.set(e,t),t}return null}_registerWeakListener(e,n){const t=this._ensureFinalizationRegistry();if(!t||typeof WeakRef>"u")return null;const r=new WeakRef(e);try{t.register(e,{event:n,ref:r},r),this._finalizationRefs.set(e,r)}catch{return null}return r}_unregisterWeakListener(e){if(!this._fr||!this._finalizationRefs.has(e))return;const n=this._finalizationRefs.get(e);try{this._fr.unregister(n)}catch{}this._finalizationRefs.delete(e)}on(e,n){if(typeof n!="function")throw new TypeError("listener must be a function");let t=this._getBucket(e);t||(t=new T({maxListeners:this._maxListeners,weak:this._weak}),this._listeners.set(e,t));const r=t.add(n);return this._registerWeakListener(n,e)?()=>{r(),this._unregisterWeakListener(n)}:r}once(e,n){if(typeof n!="function")throw new TypeError("listener must be a function");let t=this._getBucket(e);t||(t=new T({maxListeners:this._maxListeners,weak:this._weak}),this._listeners.set(e,t));const r=t.addOnce(n);return this._registerWeakListener(n,e)?()=>{r(),this._unregisterWeakListener(n)}:r}off(e,n){const t=this._getBucket(e);t&&(t.delete(n),this._unregisterWeakListener(n),t.size===0&&this._listeners.delete(e))}emit(e,n){const t=this._listeners.get(e);if(!t||t.size===0)return!1;if(t instanceof T){let i=!1;return t.forEach(o=>{i=!0;try{o(n)}catch{}}),t.size===0&&this._listeners.delete(e),i}const r=t.size>0;for(const i of t){const o=i&&typeof i.deref=="function"?i.deref():i;if(!o){t.delete(i);continue}try{o(n)}catch{}}return t.size===0&&this._listeners.delete(e),r}async emitAsync(e,n,{concurrency:t=1/0}={}){const r=this.listeners(e);if(r.length===0)return!1;const i=Number.isFinite(+t)&&+t>0?Math.max(1,Math.floor(+t)):1/0,o=async l=>{try{await l(n)}catch{}};if(!Number.isFinite(i)||i>=r.length)return await Promise.all(r.map(o)),!0;let a=0;const s=Array.from({length:i},async()=>{for(;a<r.length;){const l=r[a++];l&&await o(l)}});return await Promise.all(s),!0}listeners(e){const n=this._listeners.get(e);return n?n instanceof T?n.values():Array.from(n).map(t=>t&&typeof t.deref=="function"?t.deref():t).filter(Boolean):[]}clear(e){if(e===void 0){this._listeners.clear();return}this._listeners.delete(e)}}let ee=class{constructor(e,n,t){this._underlying=e,this._logger=n,this._pool=t,this.onmessage=null,this.onerror=null,this.onmessageerror=null}postMessage(e,n){let t=e,r=n;if(e!==null&&typeof e=="object"&&!ArrayBuffer.isView(e)&&!(e instanceof ArrayBuffer))try{const o=this._pool._encodeForTransfer(e);if(!r||Array.isArray(r)&&r.length===0)r=[o.buffer];else{let a=!1;if(Array.isArray(r)){for(let s of r)if(s===o.buffer){a=!0;break}a||(r=[...r,o.buffer])}else if(r.length===0)r=[o.buffer];else{const s=[];for(let l of r)s.push(l),l===o.buffer&&(a=!0);a||s.push(o.buffer),r=s}}t=o}catch{r=n,t=e}if(!r&&(t instanceof Uint8Array||ArrayBuffer.isView(t))){const o=t.buffer;o&&o.byteLength>0?r=[o]:r=void 0}try{r&&r.length?this._underlying.postMessage(t,r):this._underlying.postMessage(t)}catch(o){throw this._logger.error(o,"Failed to postMessage to underlying worker"),o}}addEventListener(...e){return this._underlying.addEventListener(...e)}removeEventListener(...e){return this._underlying.removeEventListener(...e)}terminate(){typeof this._underlying.terminate=="function"&&this._underlying.terminate()}};class ne extends Error{constructor(e="PowerPool has been shut down"){super(e),this.name="PowerPoolShutdownError"}}class W{constructor(e,n={}){const t=typeof navigator<"u"&&navigator.hardwareConcurrency||2,{size:r=Math.min(t,2),minSize:i=2,maxSize:o=Math.max(r,t),workerOptions:a={},maxTasksPerWorker:s=1/0,idleTimeout:l=6e4,taskQueue:c=!0,queuePolicy:h="enqueue",lazy:f=!0}=n;this._workerSource=e,this._workerOptions=a,this._maxTasksPerWorker=s,this.minSize=Math.max(0,i),this.maxSize=Math.max(this.minSize,o),this.idleTimeout=Math.max(0,l),this.taskQueueEnabled=!!c,this._queuePolicy=["enqueue","drop-oldest","drop-newest","reject"].includes(h)?h:"enqueue",this._createdAt=w(),this._totalWorkersCreated=0,this._totalTasksCompleted=0,this._taskDurationsWelfordCount=0,this._taskDurationsWelfordMean=0,this._taskDurationsWelfordM2=0,this._taskDurationsMin=Number.POSITIVE_INFINITY,this._taskDurationsMax=Number.NEGATIVE_INFINITY,this._ewmaLatency=null,this._autoScale=null,this._autoScaleInterval=null,this._lastAutoScaleAt=null,this._terminatedWorkerTaskCountsTotal=0,this._terminatedWorkerTaskCountsCount=0,this.workers=[],this.queue=new A;const d={maxListeners:n&&(n.listenerMaxListeners??n.maxListeners),weak:n&&!!n.weakListeners};this._bus=new U(d),this._queueHighThreshold=Number.isFinite(Number(n&&n.queueHighThreshold))?Math.max(0,Math.floor(Number(n.queueHighThreshold))):1/0,this._queueHighCrossed=!1,this._onmessage=null,this._onerror=null,this._onidle=null,this._onresize=null,this._nextIndex=0,this._nextWorkerId=0,this._activeTasks=0,this._isIdle=!0;const m=n&&typeof n.debugLevel=="number"?n.debugLevel:1;this._logger=new q(m,{name:"powerPool"}),this._pendingResponses=new Map,this._underlyingToWorkerObj=new Map;const y=f?Math.min(this.minSize,this.maxSize):Math.min(Math.max(r,this.minSize),this.maxSize);for(let p=0;p<y;p++)this._addWorkerInstance();if(this._reaperInterval=setInterval(()=>this._reapIdleWorkers(),Math.max(1e3,Math.floor(this.idleTimeout/2))),this._encodeCache=new Map,this._encodeCacheLimit=Math.max(16,n&&n.encodeCacheLimit?n.encodeCacheLimit:64),this._encodeCacheByteLimit=Number.isFinite(n&&Number(n.encodeCacheByteLimit))?Math.max(0,Number(n.encodeCacheByteLimit)):1/0,this._encodeCacheBytes=0,n&&n.autoScale){const p=typeof n.autoScale=="object"?n.autoScale:{},g=Number.isFinite(Number(p.intervalMs))?Math.max(100,Math.floor(p.intervalMs)):1e3,_=Number.isFinite(Number(p.targetMs))?Math.max(1,Number(p.targetMs)):50,P=Number.isFinite(Number(p.alpha))?Math.max(0,Math.min(1,Number(p.alpha))):.2,M=Number.isFinite(Number(p.cooldownMs))?Math.max(0,Math.floor(p.cooldownMs)):5e3,L=Number.isFinite(Number(p.hysteresis))?Math.max(0,Math.min(1,Number(p.hysteresis))):.2,N=Number.isFinite(Number(p.stepUp))?Math.max(1,Math.floor(Number(p.stepUp))):1,b=Number.isFinite(Number(p.stepDown))?Math.max(1,Math.floor(Number(p.stepDown))):1,V=Number.isFinite(Number(p.backoffFactor))?Math.max(1,Number(p.backoffFactor)):1,$=Number.isFinite(Number(p.backoffMaxMultiplier))?Math.max(1,Number(p.backoffMaxMultiplier)):8,Q=Number.isFinite(Number(p.backoffResetMs))?Math.max(0,Math.floor(Number(p.backoffResetMs))):M*4;this._autoScale={enabled:!0,intervalMs:g,targetMs:_,alpha:P,cooldownMs:M,hysteresis:L,stepUp:N,stepDown:b,backoffFactor:V,backoffMaxMultiplier:$,backoffResetMs:Q},this._autoScaleBackoffMultiplier=1;try{this._autoScaleInterval=setInterval(()=>this._autoScaleTick(),g)}catch{}}}_debugLog(e,n){try{this&&this._logger&&typeof this._logger.debug=="function"&&(e?this._logger.debug(e,n||"swallowed error"):this._logger.debug(n||"swallowed error"))}catch{}}_ensureReaper(){try{this._reaperInterval||(this._reaperInterval=setInterval(()=>this._reapIdleWorkers(),Math.max(1e3,Math.floor(this.idleTimeout/2))))}catch{}}_clearLifecycleIntervals(){try{this._reaperInterval&&(clearInterval(this._reaperInterval),this._reaperInterval=null)}catch{}try{this._autoScaleInterval&&(clearInterval(this._autoScaleInterval),this._autoScaleInterval=null)}catch{}}shutdown(){this._clearLifecycleIntervals();try{for(const[e]of this._pendingResponses)try{this._cleanupPendingResponse(e,{rejectWith:new ne("pool:shutdown")})}catch(n){this._debugLog&&this._debugLog(n,"shutdown: cleanup pending response")}}catch(e){this._debugLog&&this._debugLog(e,"shutdown: iterate pending responses")}try{for(const e of this.workers)try{e.worker.terminate()}catch(n){this._debugLog&&this._debugLog(n,"shutdown: terminate worker")}}catch(e){this._debugLog&&this._debugLog(e,"shutdown: terminate workers loop")}try{this._underlyingToWorkerObj&&this._underlyingToWorkerObj.clear()}catch{}try{const e=this.workers.map(n=>n&&n.id).filter(n=>n!=null);e&&e.length&&this._bus.emit("pool:scale",{action:"remove",terminated:e,count:e.length})}catch(e){this._debugLog&&this._debugLog(e,"shutdown: pool scale emit error")}this.workers=[],this.queue=new A,this._activeTasks=0}_encodeForTransfer(e){try{const n=JSON.stringify(e);if(typeof n=="string"&&n.length>2048)return I(e);const t=this._encodeCache.get(n);if(t){try{this._encodeCache.delete(n),this._encodeCache.set(n,t)}catch{}return t}const r=I(e),i=r&&r.byteLength||0,o=()=>this._encodeCache.size>=this._encodeCacheLimit||this._encodeCacheByteLimit!==1/0&&this._encodeCacheBytes+i>this._encodeCacheByteLimit;for(;o();){const a=this._encodeCache.keys().next().value;if(!a)break;try{const s=this._encodeCache.get(a);s&&s.byteLength&&(this._encodeCacheBytes=Math.max(0,this._encodeCacheBytes-s.byteLength))}catch{}this._encodeCache.delete(a)}return this._encodeCache.set(n,r),r&&r.byteLength&&(this._encodeCacheBytes+=r.byteLength),r}catch{return I(e)}}prepareBuffer(e,n={}){const{clone:t=!0}=n,r=this._encodeForTransfer(e);return t?r.slice():r}prepareBuffers(e,n={}){if(!Array.isArray(e))throw new Error("prepareBuffers expects an array");const{clone:t=!0,zeroCopy:r=!1}=n,i=new Array(e.length);for(let o=0;o<e.length;o++){const a=e[o]&&typeof e[o]=="object"&&"message"in e[o]?e[o]:{message:e[o]},s=a.message,l=a.transfer;if(l){i[o]={message:s,transfer:l};continue}if(s!==null&&typeof s=="object"&&!ArrayBuffer.isView(s)&&!(s instanceof ArrayBuffer)){if(r){i[o]={message:s,transfer:void 0};continue}try{const h=this._encodeForTransfer(s);if(t){const f=h.slice();i[o]={message:f,transfer:[f.buffer]}}else i[o]={message:h,transfer:void 0};continue}catch{i[o]={message:s,transfer:void 0};continue}}if(s instanceof ArrayBuffer||ArrayBuffer.isView(s)){const h=s instanceof ArrayBuffer?s:s.buffer;i[o]={message:s,transfer:[h]};continue}i[o]={message:s,transfer:void 0}}return i}_prepareForTransfer(e,n,t){const r=t&&!!t.zeroCopy;if(e!==null&&typeof e=="object"&&!ArrayBuffer.isView(e)&&!(e instanceof ArrayBuffer)){if(r)return{message:e,transfer:n};try{const a=this._encodeForTransfer(e).slice();let s=n;if(!s||Array.isArray(s)&&s.length===0)s=[a.buffer];else if(Array.isArray(s)){let l=!1;for(const c of s)if(c===a.buffer){l=!0;break}l||(s=[...s,a.buffer])}else if(s.length===0)s=[a.buffer];else{const l=[];let c=!1;for(const h of s)l.push(h),h===a.buffer&&(c=!0);c||l.push(a.buffer),s=l}return{message:a,transfer:s}}catch{return{message:e,transfer:n}}}if(e instanceof Uint8Array||ArrayBuffer.isView(e)||e instanceof ArrayBuffer){const o=e instanceof ArrayBuffer?e:e.buffer;if(o&&o.byteLength===0)try{const a=e instanceof ArrayBuffer?e.slice(0):new Uint8Array(e);return{message:a,transfer:[a.buffer]}}catch{return{message:e,transfer:void 0}}return{message:e,transfer:[o]}}return{message:e,transfer:n}}_decrementActiveTasks(e=1){try{const n=Number.isFinite(Number(e))?Math.max(0,Math.floor(Number(e))):1;this._activeTasks=Math.max(0,this._activeTasks-n)}catch{this._activeTasks=0}}resize(e){let n=this.minSize,t=this.maxSize;if(e!=null&&typeof e=="object")Number.isFinite(e.minSize)&&(n=Math.max(0,Math.floor(e.minSize))),Number.isFinite(e.maxSize)&&(t=Math.max(n,Math.floor(e.maxSize)));else{const o=Number(e);if(!Number.isFinite(o))return;t=Math.max(n,Math.floor(o))}this.minSize=Math.max(0,n),this.maxSize=Math.max(this.minSize,t);let r=0;for(;this.workers.length<this.minSize&&this.workers.length<this.maxSize;)this._addWorkerInstance(),r++;const i=[];for(;this.workers.length>this.maxSize;){const o=this.workers.pop();if(o){this._decrementActiveTasks(o.tasks||0);try{o.worker.terminate()}catch{}this._deleteWorkerUnderlyingMapping(o),this._terminatedWorkerTaskCountsTotal+=o.completedTasks||0,this._terminatedWorkerTaskCountsCount+=1,i.push(o.id)}}if(i.length||r){const o={data:{type:"pool:resize",terminated:i,added:r,minSize:this.minSize,maxSize:this.maxSize}};if(this._onresize)try{this._onresize(o)}catch(a){this._logger.error(a,"Pool onresize handler error")}try{this._bus.emit("resize",o)}catch(a){this._logger.error(a,"pool resize listener error")}try{this._bus.emit("pool:scale",{added:r,terminated:i,minSize:this.minSize,maxSize:this.maxSize})}catch(a){this._logger.error(a,"pool scale resize listener error")}}this._updateIdleState()}_createWorkerInstance(){if(typeof this._workerSource=="function"){const e=this._workerSource;if(e.prototype===void 0)return e();try{return new e}catch(n){const t=String(n&&n.message);if(n instanceof TypeError&&/not a constructor|cannot be invoked without\s*'new'|Class constructor|not constructable/i.test(t))return e();throw n}}if(typeof this._workerSource=="string"){let e;try{e=new Function("try { return import.meta && import.meta.url } catch (e) { return undefined }")()}catch{e=void 0}if(!e&&typeof document<"u"){const n=document.currentScript;n&&n.src&&(e=n.src)}!e&&typeof location<"u"&&location.href&&(e=location.href);try{if(e)return new Worker(new URL(this._workerSource,e),this._workerOptions)}catch{}return new Worker(this._workerSource,this._workerOptions)}throw new Error("Invalid workerSource: expected Worker factory or relative path string")}_deleteWorkerUnderlyingMapping(e){try{const n=e&&e.worker&&e.worker._underlying;n&&this._underlyingToWorkerObj&&this._underlyingToWorkerObj.delete(n)}catch{}}_addWorkerInstance(e){e==null&&(e=this._nextWorkerId++);const n=this._createWorkerInstance(),t=new ee(n,this._logger,this),r={id:e,worker:t,tasks:0,lastActive:w(),latencyEwma:null,_startTimes:new A};r.completedTasks=0,this.workers.push(r),this._totalWorkersCreated++;try{this._bus.emit("pool:scale",{action:"add",id:r.id,minSize:this.minSize,maxSize:this.maxSize})}catch(s){this._logger.error(s,"pool scale add listener error")}try{this._underlyingToWorkerObj.set(n,r)}catch{}t.onmessage=s=>{const l=w();r.tasks=Math.max(0,r.tasks-1),this._decrementActiveTasks(1),r.lastActive=l;try{const c=s&&s.data;if(c&&typeof c=="object"&&c.correlationId!=null){const h=String(c.correlationId),f=Object.prototype.hasOwnProperty.call(c,"response")?c.response:c;this._cleanupPendingResponse(h,{resolveWith:f})}}catch(c){this._debugLog&&this._debugLog(c,"worker.onmessage: resolve pending response")}try{const c=r._startTimes&&r._startTimes.length?r._startTimes.shift():null;let h=null;try{const f=s&&s.data;if(f&&typeof f.duration=="number"&&Number.isFinite(f.duration)?h=Math.max(0,Number(f.duration)):c!=null&&(h=Math.max(0,l-c)),h!=null){const d=this._autoScale&&this._autoScale.alpha||.2;r.latencyEwma==null?r.latencyEwma=h:r.latencyEwma=d*h+(1-d)*r.latencyEwma,this._ewmaLatency==null?this._ewmaLatency=h:this._ewmaLatency=d*h+(1-d)*this._ewmaLatency,this._totalTasksCompleted=(this._totalTasksCompleted||0)+1,r.completedTasks=(r.completedTasks||0)+1;const m=1,y=this._taskDurationsWelfordCount;this._taskDurationsWelfordCount=y+m;const p=h-this._taskDurationsWelfordMean;this._taskDurationsWelfordMean+=p*m/this._taskDurationsWelfordCount;const g=h-this._taskDurationsWelfordMean;this._taskDurationsWelfordM2+=p*g,h<this._taskDurationsMin&&(this._taskDurationsMin=h),h>this._taskDurationsMax&&(this._taskDurationsMax=h)}}catch(f){this._debugLog&&this._debugLog(f,"worker.onmessage: latency tracking inner")}}catch(c){this._debugLog&&this._debugLog(c,"worker.onmessage: latency tracking outer")}if(!this._queuePaused&&this.queue.length>0&&r.tasks<this._maxTasksPerWorker){const c=this.queue.shift();try{const h=w();c.transfer?t.postMessage(c.message,c.transfer):t.postMessage(c.message),r._startTimes.push(h),r.tasks++,this._activeTasks++}catch(h){this._debugLog&&this._debugLog(h,"dispatch queued message to worker failed"),this._logger.error(h,"Failed to dispatch queued message to worker")}this._queueHighCrossed&&this.queue.length<=this._queueHighThreshold&&(this._queueHighCrossed=!1)}if(this._onmessage)try{this._onmessage(s)}catch(c){this._logger.error(c,"Pool onmessage handler error")}try{this._bus.emit("message",s)}catch(c){this._logger.error(c,"pool listener error")}this._updateIdleState()};const i=s=>{let l=s&&s.data!==void 0?s.data:s,c=l;if(l&&(l instanceof ArrayBuffer||ArrayBuffer.isView(l)))try{c=z(l)}catch(f){try{a(f)}catch{}c=l}const h={data:c,originalEvent:s};if(typeof t.onmessage=="function")try{t.onmessage(h)}catch(f){this._logger.error(f,"worker wrapper onmessage error")}},o=s=>{if(typeof t.onerror=="function")try{t.onerror(s)}catch(l){this._logger.error(l,"worker wrapper onerror error")}try{this._bus.emit("error",s)}catch(l){this._logger.error(l,"pool error listener error")}},a=s=>{if(typeof t.onmessageerror=="function")try{t.onmessageerror(s)}catch(l){this._logger.error(l,"worker wrapper onmessageerror error")}try{this._bus.emit("messageerror",s)}catch(l){this._logger.error(l,"pool messageerror listener error")}};if(typeof n.addEventListener=="function"){try{n.addEventListener("message",i)}catch(s){this._debugLog&&this._debugLog(s,"attach addEventListener message")}try{n.addEventListener("error",o)}catch(s){this._debugLog&&this._debugLog(s,"attach addEventListener error")}try{n.addEventListener("messageerror",a)}catch(s){this._debugLog&&this._debugLog(s,"attach addEventListener messageerror")}}else if(typeof n.on=="function"){try{n.on("message",i)}catch(s){this._debugLog&&this._debugLog(s,"attach underlying.on message")}try{n.on("error",o)}catch(s){this._debugLog&&this._debugLog(s,"attach underlying.on error")}try{n.on("messageerror",a)}catch(s){this._debugLog&&this._debugLog(s,"attach underlying.on messageerror")}}else{try{n.onmessage=i}catch(s){this._debugLog&&this._debugLog(s,"assign underlying.onmessage")}try{n.onerror=o}catch(s){this._debugLog&&this._debugLog(s,"assign underlying.onerror")}try{n.onmessageerror=a}catch(s){this._debugLog&&this._debugLog(s,"assign underlying.onmessageerror")}}return r}_findLeastLoadedWorker(){if(!this.workers.length)return null;let e=null,n=1/0,t=Number.POSITIVE_INFINITY;for(let r=0;r<this.workers.length;r++){const i=this.workers[r],o=i.latencyEwma!=null?i.latencyEwma:Number.POSITIVE_INFINITY;(i.tasks<n||i.tasks===n&&o<t)&&(e=i,n=i.tasks,t=o)}return e}_handleUnderlyingMessage(e,n){const t=this._underlyingToWorkerObj.get(e);if(!t)return;const r=t.worker;let i=n&&n.data!==void 0?n.data:n,o=i;if(i&&(i instanceof ArrayBuffer||ArrayBuffer.isView(i)))try{o=z(i)}catch(s){try{this._handleUnderlyingMessageError(e,s)}catch{}o=i}const a={data:o,originalEvent:n};if(typeof r.onmessage=="function")try{r.onmessage(a)}catch(s){this._logger.error(s,"worker wrapper onmessage error")}}_handleUnderlyingError(e,n){const t=this._underlyingToWorkerObj.get(e);if(!t)return;const r=t.worker;if(typeof r.onerror=="function")try{r.onerror(n)}catch(i){this._logger.error(i,"worker wrapper onerror error")}try{this._bus.emit("error",n)}catch(i){this._logger.error(i,"pool error listener error")}}_handleUnderlyingMessageError(e,n){const t=this._underlyingToWorkerObj.get(e);if(!t)return;const r=t.worker;if(typeof r.onmessageerror=="function")try{r.onmessageerror(n)}catch(i){this._logger.error(i,"worker wrapper onmessageerror error")}try{this._bus.emit("messageerror",n)}catch(i){this._logger.error(i,"pool messageerror listener error")}}postMessage(e,n,t){t=t||void 0;const r=t&&t.workerId!=null?t.workerId:null,i=r!=null?this.workers.find(h=>h.id===r):this._findLeastLoadedWorker(),o=!!(t&&(t.awaitResponse||t.correlationId!=null));let a,s;if(o){if(a=t.correlationId!=null?String(t.correlationId):this._generateCorrelationId(),!(e!==null&&typeof e=="object"&&!ArrayBuffer.isView(e)&&!(e instanceof ArrayBuffer)))throw new Error("postMessage awaitResponse requires a plain-object message");e=Object.assign({},e,{correlationId:a}),s=new Promise((f,d)=>{const m={resolve:f,reject:d,timer:null},y=a!=null?String(a):a;t&&t.timeout&&(m.timer=setTimeout(()=>{try{this._cleanupPendingResponse(y,{rejectWith:new Error("postMessage response timeout")})}catch{try{d(new Error("postMessage response timeout"))}catch{}}},t.timeout)),this._pendingResponses.set(y,m)}),a=a!=null?String(a):a}if(i&&i.tasks<this._maxTasksPerWorker)try{const h=w(),f=this._prepareForTransfer(e,n,t);return f.transfer&&f.transfer.length?i.worker.postMessage(f.message,f.transfer):i.worker.postMessage(f.message),i._startTimes&&typeof i._startTimes.push=="function"&&i._startTimes.push(h),i.tasks++,this._activeTasks++,i.lastActive=h,this._updateIdleState(),o?s:!0}catch(h){if(o&&a){try{this._cleanupPendingResponse(a,{rejectWith:h})}catch{}return this._logger.error(h,"Failed to postMessage to worker"),s}return this._logger.error(h,"Failed to postMessage to worker"),!1}if(r!=null&&(!i||i.tasks>=this._maxTasksPerWorker)){if(o&&a){try{this._cleanupPendingResponse(a,{rejectWith:new Error("targeted worker unavailable")})}catch{}return s}return!1}if(r==null&&this.workers.length<this.maxSize){const h=this._addWorkerInstance();try{const f=w(),d=this._prepareForTransfer(e,n,t);return d.transfer&&d.transfer.length?h.worker.postMessage(d.message,d.transfer):h.worker.postMessage(d.message),h._startTimes&&typeof h._startTimes.push=="function"&&h._startTimes.push(f),h.tasks++,this._activeTasks++,h.lastActive=f,this._updateIdleState(),o?s:!0}catch(f){if(o&&a){try{this._cleanupPendingResponse(a,{rejectWith:f})}catch{}return this._logger.error(f,"Failed to postMessage to new worker"),s}return this._logger.error(f,"Failed to postMessage to new worker"),!1}}if(this.taskQueueEnabled){const h=this._prepareForTransfer(e,n,t),f=this._queuePolicy;if(f==="reject")return o&&a?(this._cleanupPendingResponse(a,{rejectWith:new Error("postMessage rejected by queue policy")}),s):!1;if(f==="drop-newest"&&this.queue.length>0)return o&&a?(this._cleanupPendingResponse(a,{rejectWith:new Error("postMessage rejected by queue policy")}),s):!1;if(f==="drop-oldest"&&this.queue.length>0){const m=this.queue.shift();m&&m.correlationId!=null&&this._cleanupPendingResponse(m.correlationId,{rejectWith:new Error("postMessage queued task dropped by policy")})}const d={message:h.message,transfer:h.transfer};o&&a&&(d.correlationId=a),this.queue.push(d);try{if(Number.isFinite(this._queueHighThreshold)&&this.queue.length>this._queueHighThreshold&&!this._queueHighCrossed){this._queueHighCrossed=!0;try{this._bus.emit("pool:queue:high",{length:this.queue.length,threshold:this._queueHighThreshold})}catch(m){this._logger.error(m,"pool queue high listener error")}}}catch{}return this._updateIdleState(),o?s:!0}if(!this.workers.length)return o?s:!1;const l=this._nextIndex%this.workers.length;this._nextIndex=(this._nextIndex+1)%this.workers.length;const c=this.workers[l];try{const h=w(),f=this._prepareForTransfer(e,n);return f.transfer&&f.transfer.length?c.worker.postMessage(f.message,f.transfer):c.worker.postMessage(f.message),c._startTimes&&typeof c._startTimes.push=="function"&&c._startTimes.push(h),c.tasks++,this._activeTasks++,c.lastActive=h,this._updateIdleState(),o?s:!0}catch(h){if(o&&a){try{this._cleanupPendingResponse(a,{rejectWith:h})}catch{}return this._logger.error(h,"Failed to postMessage to fallback worker"),s}return this._logger.error(h,"Failed to postMessage to fallback worker"),!1}}_generateCorrelationId(){try{if(typeof globalThis<"u"&&globalThis.crypto&&typeof globalThis.crypto.randomUUID=="function")return globalThis.crypto.randomUUID()}catch{}try{if(typeof globalThis<"u"&&globalThis.crypto&&typeof globalThis.crypto.getRandomValues=="function"){const n=new Uint8Array(16);return globalThis.crypto.getRandomValues(n),Array.from(n).map(t=>t.toString(16).padStart(2,"0")).join("")}}catch{}const e=Math.floor(Math.random()*4294967295).toString(16);return`cid-${Date.now().toString(36)}-${e}`}_cleanupPendingResponse(e,n={}){const t=e!=null?String(e):e,r=this._pendingResponses.get(t);if(!r)return!1;try{if(r.timer)try{clearTimeout(r.timer)}catch{}}catch{}try{Object.prototype.hasOwnProperty.call(n,"resolveWith")?r.resolve(n.resolveWith):Object.prototype.hasOwnProperty.call(n,"rejectWith")&&r.reject(n.rejectWith)}catch{}finally{try{this._pendingResponses.delete(t)}catch{}}return!0}broadcast(e,n){const t=w();let r=null;const i=e!==null&&typeof e=="object"&&!ArrayBuffer.isView(e)&&!(e instanceof ArrayBuffer);for(const o of this.workers)try{let a=e,s=n;if(!s&&i)try{r==null&&(r=this._encodeForTransfer(e));const l=r.slice();a=l,s=[l.buffer]}catch{a=e,s=void 0}s&&s.length?o.worker.postMessage(a,s):o.worker.postMessage(a),o._startTimes&&typeof o._startTimes.push=="function"&&o._startTimes.push(t),o.tasks++,this._activeTasks++,o.lastActive=t}catch(a){this._logger.error(a,"broadcast error")}this._updateIdleState()}stopThePress(e,n,t){const r=t&&typeof t.recreateWorkers<"u"?!!t.recreateWorkers:!0,i=t&&typeof t=="object"?Object.assign({},t):void 0;i&&delete i.recreateWorkers;try{this.queue&&typeof this.queue.clear=="function"&&this.queue.clear()}catch(s){this._logger.error(s,"stopThePress: failed to clear queue")}try{for(const[s]of this._pendingResponses)try{this._cleanupPendingResponse(s,{rejectWith:new Error("stopThePress: cancelled pending response")})}catch{}}catch(s){this._logger.error(s,"stopThePress: failed to cancel pending responses")}const o=this.workers.length,a=this.workers.map(s=>s&&s.id).filter(s=>s!=null);try{for(let s=this.workers.length-1;s>=0;s--){const l=this.workers[s];this._terminatedWorkerTaskCountsTotal+=l.completedTasks||0,this._terminatedWorkerTaskCountsCount+=1;try{l.worker.terminate()}catch{}this._deleteWorkerUnderlyingMapping(l)}this.workers.length=0,this._activeTasks=0}catch(s){this._logger.error(s,"stopThePress: failed while terminating workers")}if(r||this._clearLifecycleIntervals(),r){const s=Math.max(this.minSize,Math.min(o,this.maxSize));for(let l=0;l<s;l++)this._addWorkerInstance();try{this._ensureReaper()}catch{}}try{a&&a.length&&this._bus.emit("pool:scale",{action:"remove",terminated:a,count:o})}catch(s){this._logger.error(s,"pool scale stopThePress listener error")}return this._updateIdleState(),this.postMessage(e,n,i)}postMessageBatch(e,n){if(!Array.isArray(e))throw new Error("postMessageBatch expects an array of {message, transfer?}");const t=!!(n&&(n.awaitResponse||n.correlationId!=null)),r=n&&typeof n.correlationIdFactory=="function"?n.correlationIdFactory:null;if(t){if(n&&n.correlationId!=null&&e.length>1&&!r)throw new Error("postMessageBatch cannot use a fixed correlationId for multiple items; provide options.correlationIdFactory or omit correlationId");const h=new Array(e.length);for(let f=0;f<e.length;f++){const d=e[f]||{},m=Object.assign({},n);r&&(m.correlationId=String(r(f,d))),h[f]=this.postMessage(d.message,d.transfer,m)}return h}const i=new Array(e.length),o=[],a=n&&n.workerId!=null?n.workerId:null,s=this.prepareBuffers(e,{clone:!0,zeroCopy:n&&!!n.zeroCopy});let l=null;if(a!=null){if(l=this.workers.find(h=>h.id===a),!l)return e.map(()=>!1)}else l=this._findLeastLoadedWorker();let c=!1;for(let h=0;h<e.length;h++){const f=e[h]||{},d=s[h]||{message:f.message,transfer:f.transfer};let m=!1;l&&l.tasks>=this._maxTasksPerWorker&&(l=null);let y=l;if(!y&&a==null&&(y=this._findLeastLoadedWorker()),y&&y.tasks<this._maxTasksPerWorker)try{const p=w();d.transfer&&d.transfer.length?y.worker.postMessage(d.message,d.transfer):y.worker.postMessage(d.message),y._startTimes&&typeof y._startTimes.push=="function"&&y._startTimes.push(p),y.tasks++,this._activeTasks++,y.lastActive=p,c=!0,i[h]=!0,m=!0,l=y.tasks<this._maxTasksPerWorker?y:null}catch{i[h]=!1,m=!0}if(!m&&a==null&&this.workers.length<this.maxSize)try{const p=this._addWorkerInstance(),g=w();d.transfer&&d.transfer.length?p.worker.postMessage(d.message,d.transfer):p.worker.postMessage(d.message),p._startTimes&&typeof p._startTimes.push=="function"&&p._startTimes.push(g),p.tasks++,this._activeTasks++,p.lastActive=g,c=!0,i[h]=!0,m=!0,l=p.tasks<this._maxTasksPerWorker?p:null}catch{i[h]=!1,m=!0}if(!m){if(a!=null){i[h]=!1;continue}if(this.taskQueueEnabled){const p=this._queuePolicy;p==="reject"||p==="drop-newest"&&this.queue.length>0?i[h]=!1:(p==="drop-oldest"&&this.queue.length>0&&this.queue.shift(),o.push({message:d.message,transfer:d.transfer}),i[h]=!0)}else if(!this.workers.length)i[h]=!1;else{const p=this._nextIndex%this.workers.length;this._nextIndex=(this._nextIndex+1)%this.workers.length;const g=this.workers[p];try{const _=w();d.transfer&&d.transfer.length?g.worker.postMessage(d.message,d.transfer):g.worker.postMessage(d.message),g._startTimes&&typeof g._startTimes.push=="function"&&g._startTimes.push(_),g.tasks++,this._activeTasks++,g.lastActive=_,c=!0,i[h]=!0}catch(_){i[h]=!1,this._logger.error(_,"Failed to postMessage to fallback worker")}}}}if(o.length)try{this.queue.pushMany(o),c=!0}catch(h){this._logger.error(h,"postMessageBatch: failed to enqueue prepared items")}return c&&this._updateIdleState(),i}stopThePressBatch(e,n){const t=n&&typeof n.recreateWorkers<"u"?!!n.recreateWorkers:!0,r=n&&typeof n=="object"?Object.assign({},n):void 0;r&&delete r.recreateWorkers;try{this.queue&&typeof this.queue.clear=="function"&&this.queue.clear()}catch(o){this._logger.error(o,"stopThePressBatch: failed to clear queue")}try{for(const[o]of this._pendingResponses)try{this._cleanupPendingResponse(o,{rejectWith:new Error("stopThePressBatch: cancelled pending response")})}catch{}}catch(o){this._logger.error(o,"stopThePressBatch: failed to cancel pending responses")}const i=this.workers.length;try{for(let o=this.workers.length-1;o>=0;o--){const a=this.workers[o];this._terminatedWorkerTaskCountsTotal+=a.completedTasks||0,this._terminatedWorkerTaskCountsCount+=1;try{a.worker.terminate()}catch{}this._deleteWorkerUnderlyingMapping(a)}this.workers.length=0,this._activeTasks=0}catch(o){this._logger.error(o,"stopThePressBatch: failed while terminating workers")}if(t||this._clearLifecycleIntervals(),t){const o=Math.max(this.minSize,Math.min(i,this.maxSize));for(let a=0;a<o;a++)this._addWorkerInstance();try{this._ensureReaper()}catch{}}this._updateIdleState();try{return this.postMessageBatch(e,r)}catch(o){try{this._logger.error(o,"stopThePressBatch: postMessageBatch failed")}catch{}try{return new Array(e?e.length:0).fill(!1)}catch{return[]}}}addWorker(){return this._addWorkerInstance()}removeWorker(){const e=this.workers.pop();if(e){this._decrementActiveTasks(e.tasks||0);try{e.worker.terminate()}catch{}this._deleteWorkerUnderlyingMapping(e),this._terminatedWorkerTaskCountsTotal+=e.completedTasks||0,this._terminatedWorkerTaskCountsCount+=1}}_reapIdleWorkers(){if(this.idleTimeout<=0)return;const e=w();for(let n=this.workers.length-1;n>=0;n--){const t=this.workers[n];if(this.workers.length<=this.minSize)break;if(t.tasks===0&&e-(t.lastActive||0)>this.idleTimeout){try{t.worker.terminate()}catch{}try{const i=t.worker&&t.worker._underlying;i&&this._underlyingToWorkerObj&&this._underlyingToWorkerObj.delete(i)}catch{}const r=this.workers.length-1;n===r?this.workers.pop():this.workers[n]=this.workers.pop()}}this._updateIdleState()}_autoScaleTick(){try{if(!this._autoScale||!this._autoScale.enabled)return;const e=w(),n=this._autoScale;this._lastAutoScaleAt&&n.backoffResetMs&&e-this._lastAutoScaleAt>n.backoffResetMs&&(this._autoScaleBackoffMultiplier=1);const t=Math.floor((n.cooldownMs||0)*(this._autoScaleBackoffMultiplier||1));if(this._lastAutoScaleAt&&e-this._lastAutoScaleAt<t)return;const r=n.targetMs,i=n.hysteresis||.2,o=this._ewmaLatency,a=this.workers.length,s=r*(1+i),l=o!=null?o>s:!1,c=this.queue.length>Math.ceil(a*(1+i));if(l||c){if(a<this.maxSize)try{const d=Math.min(this.maxSize-a,n.stepUp||1);for(let m=0;m<d;m++)this._addWorkerInstance();this._lastAutoScaleAt=e,this._autoScaleBackoffMultiplier=Math.min(n.backoffMaxMultiplier||8,Math.max(1,(this._autoScaleBackoffMultiplier||1)*(n.backoffFactor||1)))}catch(d){this._debugLog&&this._debugLog(d,"autoScale: addWorker failed")}return}const h=r*Math.max(0,1-i);if((o!=null?o<h:!1)&&this.queue.length===0&&a>this.minSize)try{const d=Math.min(a-this.minSize,n.stepDown||1);for(let m=0;m<d;m++){const y=this.workers.pop();if(y){try{y.worker.terminate()}catch(p){this._debugLog&&this._debugLog(p,"autoScale: terminate worker")}this._deleteWorkerUnderlyingMapping(y)}}this._lastAutoScaleAt=e,this._autoScaleBackoffMultiplier=Math.min(n.backoffMaxMultiplier||8,Math.max(1,(this._autoScaleBackoffMultiplier||1)*(n.backoffFactor||1)))}catch(d){this._debugLog&&this._debugLog(d,"autoScale: remove worker failed")}}catch(e){this._debugLog&&this._debugLog(e,"autoScaleTick outer")}}_emitIdle(){const e={data:{type:"pool:idle",stats:this.getStats()}};if(this._isIdle=!0,this._onmessage)try{this._onmessage(e)}catch(n){this._logger.error(n,"Pool onmessage handler error")}if(this._onidle)try{this._onidle(e)}catch(n){this._logger.error(n,"Pool onidle handler error")}try{this._bus.emit("message",e)}catch(n){this._logger.error(n,"pool listener error")}try{this._bus.emit("idle",e)}catch(n){this._logger.error(n,"pool idle listener error")}}_updateIdleState(){const e=this.queue.length===0,t=this._activeTasks===0&&e;t&&!this._isIdle?this._emitIdle():!t&&this._isIdle&&(this._isIdle=!1)}terminate(){try{this.shutdown()}catch{}}[Symbol.dispose](){this.terminate()}async[Symbol.asyncDispose](){try{await this.drain()}catch{}this.terminate()}getStats(){const e=this.workers.map(_=>({id:_.id,tasks:_.tasks,lastActive:_.lastActive})),n=w(),t=this._createdAt!=null?Math.max(0,n-this._createdAt):0,r=this._totalWorkersCreated||this.workers.length,i=this._totalTasksCompleted||0,o=this._terminatedWorkerTaskCountsCount||0,a=this._terminatedWorkerTaskCountsTotal||0;let s=0;for(const _ of this.workers)s+=_.completedTasks||0;const l=this.workers.length||0,c=o+l,h=c>0?(a+s)/c:0;let f=0,d=0,m=0,y=0,p=0;const g=this._taskDurationsWelfordCount||0;if(g>0){f=this._taskDurationsMin===Number.POSITIVE_INFINITY?0:this._taskDurationsMin,d=this._taskDurationsMax===Number.NEGATIVE_INFINITY?0:this._taskDurationsMax,m=this._taskDurationsWelfordMean;const _=g>1?this._taskDurationsWelfordM2/g:0;y=Math.sqrt(_),p=0}return{status:e,performance:{poolLiveDuration:t,totalWorkersCreated:r,totalTasksPerformed:i,averageTasksPerWorkerUntilTermination:h,timePerTask:{max:d,min:f,average:m,stddev:y},percentSlowTasks:p},queueLength:this.queue.length,activeTasks:this._activeTasks,workerCount:this.workers.length,minSize:this.minSize,maxSize:this.maxSize,isIdle:this._activeTasks===0&&this.queue.length===0}}drain(){const e=this.queue.length===0;return this._activeTasks===0&&e?Promise.resolve(this.getStats()):new Promise(r=>{const i=()=>{try{this.removeEventListener("idle",i)}catch{}r(this.getStats())};this.addEventListener("idle",i)})}addEventListener(e,n){if(typeof n=="function"&&(this._bus.on(e,n),e==="idle")){const t=this.queue.length===0;if(this._activeTasks===0&&t){const i={data:{type:"pool:idle",stats:this.getStats()}};try{n(i)}catch(o){this._logger.error(o,"pool idle listener error")}}}}removeEventListener(e,n){!n||typeof n!="function"||this._bus.off(e,n)}get onresize(){return this._onresize}set onresize(e){this._onresize=e}get onmessage(){return this._onmessage}set onmessage(e){this._onmessage=e}get onerror(){return this._onerror}set onerror(e){this._onerror=e}get onidle(){return this._onidle}set onidle(e){if(this._onidle=e,typeof e=="function"){const n=this.queue.length===0;if(this._activeTasks===0&&n){const r={data:{type:"pool:idle",stats:this.getStats()}};try{e(r)}catch(i){this._logger.error(i,"Pool onidle handler error")}}}}pauseQueue(){this._queuePaused=!0}resumeQueue(){this._queuePaused&&(this._queuePaused=!1,this._dispatchQueuedTasks())}pause(){return this.pauseQueue()}resume(){return this.resumeQueue()}get queuePaused(){return this._queuePaused}_dispatchQueuedTasks(){if(this._queuePaused||!this.taskQueueEnabled||this.queue.length===0)return;const e=w();let n=!1;for(const t of this.workers)for(;this.queue.length>0&&t.tasks<this._maxTasksPerWorker;){const r=this.queue.shift();try{r.transfer&&r.transfer.length?t.worker.postMessage(r.message,r.transfer):t.worker.postMessage(r.message),t._startTimes&&typeof t._startTimes.push=="function"&&t._startTimes.push(e),t.tasks++,this._activeTasks++,t.lastActive=e,n=!0}catch(i){this._debugLog&&this._debugLog(i,"dispatch queued message to worker failed"),this._logger.error(i,"Failed to dispatch queued message to worker");break}}this._queueHighCrossed&&this.queue.length<=this._queueHighThreshold&&(this._queueHighCrossed=!1),n&&this._updateIdleState()}}class F{constructor(e,n={}){if(typeof e!="function")throw new TypeError("PowerScheduler requires a flush function");this._flushFn=e,this._scheduling=n.scheduling==="macrotask"?"macrotask":"microtask",this._scheduled=!1,this._timer=null}get scheduled(){return this._scheduled}schedule(){if(!this._scheduled){if(this._scheduled=!0,this._scheduling==="macrotask"){this._timer=setTimeout(()=>this._run(),0);return}queueMicrotask(()=>this._run())}}flush(){this._scheduled&&(this._timer&&(clearTimeout(this._timer),this._timer=null),this._run())}cancel(){this._scheduled&&(this._scheduled=!1,this._timer&&(clearTimeout(this._timer),this._timer=null))}_run(){if(this._scheduled){this._scheduled=!1,this._timer=null;try{this._flushFn()}catch(e){console.error(e)}}}}class te{constructor({map:e,source:n,sourceLayer:t,fid:r="id",tileSize:i=512,tolerance:o=1e-6,cacheSize:a=5e3,units:s="meters",postDelay:l=0,debugLevel:c=null,debuglevel:h=null,tilePoolSize:f=6,gatherPoolSize:d=4,gatherTimeout:m=6e4,mapFallbackCooldown:y=150,tileTimeout:p=null,tileMaxRetries:g=1,tileWorkerSource:_=null,gatherWorkerSource:P=null}){this.map=e,this.source=n,this.sourceLayer=t,this.fid=r,this.tileSize=i,this.tolerance=o,this.units=s,this.gatherPoolSize=Math.max(1,Number.isFinite(Number(d))?Math.floor(Number(d)):1),this.postDelay=Number.isFinite(Number(l))?Math.max(0,Number(l)):0;const M=c??h;this.debugLevel=Number.isFinite(Number(M))?Math.max(0,Math.min(3,Math.floor(Number(M)))):0,this.gatherTimeout=Number.isFinite(Number(m))?Math.max(0,Number(m)):3e4,this.tileTimeout=Number.isFinite(Number(p))?Math.max(0,Number(p)):this.gatherTimeout,this.tileMaxRetries=Number.isFinite(Number(g))?Math.max(0,Math.floor(Number(g))):1,this.mapFallbackCooldown=Number.isFinite(Number(y))?Math.max(0,Number(y)):150,this._lastMapFallbackAt=0,this._lastMapFallbackUnique=null,this._sourceLoaded=!1,this._pendingTiles=new Set,this._tilePendingMeta=new Map,this._tileCorrelationSeq=0,this._tileTimeoutHandle=null,this._tileQueue=new A(32),this._tileDrainScheduled=!1,this._tileDrainTimeout=null,this._tileScheduler=new F(()=>{this._tileDrainScheduled=!1,this._drainTileQueue()}),this._gatherRound=0,this._diffScheduler=new F(()=>this._runDiffFlush()),this._gatherScheduled=!1,this._diffScheduled=!1,this._diffFlushInProgress=!1,this._diffFlushQueued=!1,this._diffFlushQueuedGatherRound=0,this._currentFlushGatherRound=0,this._diffFlushQueuedTimestamp=0,this._currentFlushTimestamp=0,this._diffRetryHandle=null,this._diffRetryCount=0,this._lastGatherRound=0,this._lastGatherTimestamp=0,this._pendingGatherRounds=new Map,this._diffAdd=new Map,this._diffRemove=new Set,this._bus=new U,this._disposed=!1,this._changedGroups=new Set,this._tileGroups=new Map,this._groupToTiles=new Map,this.piecesCache=new R({maxEntries:a,maxWeight:a*5e3,weightFn:b=>b.size||0,onEvict:b=>{this._tileFingerprints?.delete(b),this._removeTileGroups(b)}}),this._tileFingerprints=new R({maxEntries:a,maxWeight:a,weightFn:()=>1,onEvict:b=>{this.piecesCache?.delete(b)}}),this.labelsCache=new R({maxEntries:a,maxWeight:a*5e3,weightFn:b=>Array.isArray(b)?b.length:0});const L=_,N=P;this.tilePool=new W(L,{size:f,minSize:1,maxSize:f,taskQueue:!0,lazy:!1,debugLevel:this.debugLevel}),this.gatherPool=new W(N,{size:d,minSize:1,maxSize:d,taskQueue:!0,lazy:!1,debugLevel:this.debugLevel}),this.tilePool.addEventListener("message",b=>this._onTileMessage(b)),this.tilePool.addEventListener("error",()=>this._expirePendingTiles(!0)),this.tilePool.addEventListener("messageerror",()=>this._expirePendingTiles(!0)),this.tilePool.addEventListener("idle",()=>{this._sourceLoaded&&this._changedGroups.size>0&&this._scheduleGather()}),this.gatherPool.addEventListener("message",b=>this._onGatherMessage(b)),this.gatherPool.addEventListener("idle",()=>this._scheduleDiffFlush()),this._bus.on("label",b=>this._collectLabelDiff(b)),this._bus.on("commit",b=>this._scheduleDiffFlush(b)),this._activeZoom=null,this._onZoomEnd=()=>this._purgeStaleTiles(),this.map.on("zoomend",this._onZoomEnd)}handleSourceData(e){if(this._disposed||!e||e.sourceId!==this.source.id)return;if(typeof e.isSourceLoaded=="boolean"){const g=this._sourceLoaded;this._sourceLoaded=e.isSourceLoaded,!g&&this._sourceLoaded&&this._changedGroups.size>0&&this._scheduleGather()}const n=e.tile?.tileID?.canonical;if(!n)return;const t=`${n.z}|${n.x}|${n.y}`;let r=[];const i=this.source.type==="vector"?{sourceLayer:this.sourceLayer}:{},o=typeof e.tile?.querySourceFeatures=="function"?g=>{const _=[];return e.tile.querySourceFeatures(_,g),_}:null,a=typeof this.map.querySourceFeatures=="function"?g=>this.map.querySourceFeatures(this.source.id,g):null,s=!o&&!!a;let l=t;if(s){l=`map|z${n.z}`;const g=Date.now();if(this._lastMapFallbackUnique===l&&g-this._lastMapFallbackAt<this.mapFallbackCooldown)return;this._lastMapFallbackUnique=l,this._lastMapFallbackAt=g}const c=o?o(i):a?a(i):null;if(!Array.isArray(c)||(r=c,!r.length))return;const h=this._computeTileFingerprint(r),f=this._tileFingerprints.get(l),d=f!=null&&f===h,m=this.piecesCache.has(l);if(this._pendingTiles.has(l)&&d||m&&d)return;m&&this.piecesCache.delete(l),this._tileFingerprints.set(l,h);const y=Math.max(this.tolerance,Math.pow(10,-.301*n.z+2.56)/this.tileSize),p={collection:{type:"FeatureCollection",features:r.map((g,_)=>({id:g.properties?.[this.fid]??g.id,geometry:g.geometry,properties:{...g.properties,_index:`${l}|${_}`,_tile:l,_group:g.properties?.[this.fid]}}))},tolerance:y,unique:l,tileSize:this.tileSize,debugLevel:this.debugLevel};p.correlationId=`${l}:${++this._tileCorrelationSeq}`,this._pendingTiles.add(l),this._tilePendingMeta.set(l,{correlationId:p.correlationId,payload:p,retries:0,deadline:Date.now()+Math.max(1,this.tileTimeout)}),this._tileQueue.push(p),this._schedulePendingTileTimeoutCheck(),this._scheduleTileDrain()}_computeTileFingerprint(e){return this._computeTileFingerprintBody(e)}_computeTileFingerprintBody(e){let n=2166136261;const t=r=>{const i=String(r);for(let o=0;o<i.length;o+=1)n^=i.charCodeAt(o),n=n*16777619>>>0};for(const r of e){const i=r.properties?.[this.fid]??r.id,o=r.geometry;let a=0;if(o&&o.coordinates&&(a=this._countCoordinates(o.coordinates)),t(i),t(o?.type||"none"),t(a),r.properties&&typeof r.properties=="object")for(const s of Object.keys(r.properties))t(s),t(":"),t(this._serializePropertyValue(r.properties[s])),t("|")}return n.toString(16).padStart(8,"0")}_countCoordinates(e){if(!Array.isArray(e))return 0;let n=0;if(Array.isArray(e[0])&&Array.isArray(e[0][0])){for(const t of e)n+=this._countCoordinates(t);return n}return e.length}_getTileZoom(e){if(typeof e!="string")return null;if(e.startsWith("map|z")){const r=Number(e.slice(5));return Number.isFinite(r)?r:null}const n=e.indexOf("|");if(n<0)return null;const t=Number(e.slice(0,n));return Number.isFinite(t)?t:null}_purgeStaleTiles(){if(this._disposed)return;const e=Math.floor(this.map.getZoom());if(this._activeZoom!==e){this._activeZoom=e;for(const[,n]of this.labelsCache.entries("LRU"))if(Array.isArray(n))for(const t of n){const r=t?.properties?._tile;if(!r)continue;const i=this._getTileZoom(r);if(i!==null&&i!==e){const o=t?.properties?._index;o&&this._diffRemove.add(o)}}}}_removeTileGroups(e){const n=this._tileGroups.get(e);if(n){for(const t of n){const r=this._groupToTiles.get(t);r&&(r.delete(e),r.size===0&&this._groupToTiles.delete(t))}this._tileGroups.delete(e)}}_serializePropertyValue(e){return e==null||typeof e=="string"||typeof e=="number"||typeof e=="boolean"?String(e):Array.isArray(e)?`array:${e.length}`:typeof e=="object"?`object:${Object.keys(e).length}`:String(e)}setGeoJsonSource(e){this.gjSource=e}dispose(){this._disposed=!0,this._onZoomEnd&&this.map&&(this.map.off("zoomend",this._onZoomEnd),this._onZoomEnd=null),this._tileScheduler.cancel(),this._diffScheduler.cancel(),this._tileDrainTimeout&&(clearTimeout(this._tileDrainTimeout),this._tileDrainTimeout=null),this._tileTimeoutHandle&&(clearTimeout(this._tileTimeoutHandle),this._tileTimeoutHandle=null),this._diffRetryHandle&&(clearTimeout(this._diffRetryHandle),this._diffRetryHandle=null);for(const e of this._pendingGatherRounds.values())clearTimeout(e);this._pendingGatherRounds.clear(),this._tileDrainScheduled=!1,this._gatherScheduled=!1,this._diffScheduled=!1;try{this.tilePool.shutdown()}catch{}try{this.gatherPool.shutdown()}catch{}this.piecesCache.clear(),this.labelsCache.clear(),this._tileFingerprints.clear(),this._pendingTiles.clear(),this._tilePendingMeta.clear(),this._tileQueue.clear(),this._changedGroups.clear(),this._tileGroups.clear(),this._groupToTiles.clear(),this._bus.clear(),this.gjSource=null}_schedulePendingTileTimeoutCheck(){if(this._tileTimeoutHandle||this._tilePendingMeta.size===0||this.tileTimeout<=0)return;const e=Math.max(25,Math.min(1e3,Math.floor(this.tileTimeout/2)||250));this._tileTimeoutHandle=setTimeout(()=>{this._tileTimeoutHandle=null,this._expirePendingTiles(!1)},e)}_expirePendingTiles(e=!1){if(this._disposed||this._tilePendingMeta.size===0)return;const n=Date.now();let t=!1;for(const[r,i]of this._tilePendingMeta.entries())!e&&i.deadline>n||(i.retries<this.tileMaxRetries?(i.retries+=1,i.deadline=n+Math.max(1,this.tileTimeout),i.correlationId=`${r}:${++this._tileCorrelationSeq}`,i.payload={...i.payload,correlationId:i.correlationId},this._tileQueue.push(i.payload),t=!0):(this._tilePendingMeta.delete(r),this._pendingTiles.delete(r)));t&&this._scheduleTileDrain(),this._tilePendingMeta.size>0&&this._schedulePendingTileTimeoutCheck()}_scheduleTileDrain(){if(!(this._tileDrainScheduled||this._tileDrainTimeout)){if(this._tileDrainScheduled=!0,this.postDelay>0){this._tileDrainTimeout=setTimeout(()=>{this._tileDrainTimeout=null,this._tileDrainScheduled=!1,this._drainTileQueue()},this.postDelay);return}this._tileScheduler.schedule()}}_drainTileQueue(){const e=[];let n;for(;(n=this._tileQueue.shift())!==void 0;)e.push({message:n});e.length>0&&this.tilePool.postMessageBatch(e,{zeroCopy:!0})}_onTileMessage(e){const n=e.data;if(!n||n.type!=="simplified")return;const{unique:t,correlationId:r,...i}=n,o=this._tilePendingMeta.get(t);if(o){if(r!=null&&o.correlationId!==r)return;this._tilePendingMeta.delete(t),this._pendingTiles.delete(t)}else if(this._pendingTiles.has(t))this._pendingTiles.delete(t);else if(r!=null)return;this._tilePendingMeta.size===0&&this._tileTimeoutHandle&&(clearTimeout(this._tileTimeoutHandle),this._tileTimeoutHandle=null),this._removeTileGroups(t),this.piecesCache.set(t,i),this._tileGroups.set(t,new Set);for(const a of Object.keys(i)){const s=this._groupToTiles.get(a)||new Set;s.add(t),this._groupToTiles.set(a,s),this._tileGroups.get(t).add(a),this._changedGroups.add(a)}this._sourceLoaded&&this._pendingTiles.size===0&&this._scheduleGather()}_scheduleGather(){this._gatherScheduled||(this._gatherScheduled=!0,queueMicrotask(()=>{this._gatherScheduled=!1,this._dispatchGather()}))}_dispatchGather(){if(this._disposed)return;let e;if(this._changedGroups.size>0){const t=new Set;for(const r of this._changedGroups){const i=this._groupToTiles.get(r);if(i)for(const o of i)t.add(o)}if(t.size===0){this._changedGroups.clear();return}e={};for(const r of t){const i=this.piecesCache.get(r);i&&(e[r]=i)}this._changedGroups.clear()}else{const t=Array.from(this.piecesCache.entries("LRU"));if(!t.length)return;e=Object.fromEntries(t)}if(!e||!Object.keys(e).length)return;const n=++this._gatherRound;this._scheduleGatherTimeout(n),this.gatherPool.postMessage({pieces:e,tolerance:this.tolerance,unit:this.units,tileSize:this.tileSize,gatherPoolSize:this.gatherPoolSize,debugLevel:this.debugLevel,gatherRound:n},void 0,{zeroCopy:!0})}_scheduleGatherTimeout(e){if(this.gatherTimeout<=0)return;const n=setTimeout(()=>{this._pendingGatherRounds.has(e)&&(this._pendingGatherRounds.delete(e),this._scheduleDiffFlush({gatherRound:e,timestamp:Date.now()}))},this.gatherTimeout);this._pendingGatherRounds.set(e,n)}_clearGatherTimeout(e){const n=this._pendingGatherRounds.get(e);n&&(clearTimeout(n),this._pendingGatherRounds.delete(e))}_onGatherMessage(e){const n=e.data;if(n){if(n.type==="commit"){const t=Number.isFinite(Number(n.gatherRound))?Number(n.gatherRound):0,r=Number.isFinite(Number(n.timestamp))?Number(n.timestamp):Date.now();t&&this._clearGatherTimeout(t),this._bus.emit("commit",{gatherRound:t,timestamp:r});return}n.id!=null&&this._bus.emit("label",n)}}_keepNonContained=e=>{const n=e.map(r=>r.split("-")),t=(r,i)=>{let o=0;for(const a of i)if(a===r[o]&&(o+=1),o===r.length)return!0;return r.length===0};return n.filter((r,i)=>!n.some((o,a)=>a!==i&&o.length>=r.length&&t(r,o))).map(r=>r.join("-"))};_filterRedundantDiffAdds(e){if(!Array.isArray(e)||e.length===0)return[];const n=new Map;let t=!1,r=!1;for(const a of e){const s=a?.properties?._index;if(s){if(!r&&String(s).includes("-")&&(r=!0),!t){const l=a?.properties?._members;Array.isArray(l)&&l.length>1&&(t=!0)}n.set(s,a)}}if(n.size===0)return[];if(n.size===1)return[n.values().next().value];if(t){const a=new Set;for(const s of n.values()){const l=s?.properties?._index,c=s?.properties?._members;if(!(!l||!Array.isArray(c)||c.length<=1))for(const h of c)h!==l&&n.has(h)&&a.add(h)}if(a.size>0){const s=[];for(const l of n.values())a.has(l?.properties?._index)||s.push(l);return s}}if(!r)return[...n.values()];const i=new Set(this._keepNonContained([...n.keys()].sort())),o=[];for(const[a,s]of n.entries())i.has(a)&&o.push(s);return o}_collectLabelDiff(e){const n=Number.isFinite(Number(e.gatherRound))?Number(e.gatherRound):0,t=Number.isFinite(Number(e.timestamp))?Number(e.timestamp):0;if(n&&n<this._lastGatherRound)return;n&&n>this._lastGatherRound&&(this._lastGatherRound=n,this._lastGatherTimestamp=0),t&&t>this._lastGatherTimestamp&&(this._lastGatherTimestamp=t);const r=e.id;let i=Array.isArray(e.features)?e.features.slice():[];if(i.length>1&&i.sort((a,s)=>{const l=a?.properties?._index,c=s?.properties?._index;return l===c?0:l==null?-1:c==null?1:String(l).localeCompare(String(c))}),this.labelsCache.hasEqual(r,i))return;const o=this.labelsCache.get(r);o&&o.forEach(a=>{a?.properties?._index&&this._diffRemove.add(a.properties._index)}),i.forEach(a=>{a?.properties?._index&&this._diffAdd.set(a.properties._index,a)}),this.labelsCache.set(r,i),this._scheduleDiffFlush({gatherRound:n,timestamp:t})}_scheduleDiffFlush({gatherRound:e=0,timestamp:n=0}={}){if(e&&e>this._lastGatherRound&&(this._lastGatherRound=e,this._lastGatherTimestamp=0),n&&n>this._lastGatherTimestamp&&(this._lastGatherTimestamp=n),!(!this._diffFlushInProgress&&!this._diffScheduled&&this._diffAdd.size===0&&this._diffRemove.size===0)&&!(!this._diffFlushInProgress&&!this._diffScheduled&&e&&e<this._lastGatherRound)){if(this._diffFlushInProgress){if(e&&e<=this._currentFlushGatherRound||n&&n<=this._currentFlushTimestamp)return;this._diffFlushQueued=!0,e&&e>this._diffFlushQueuedGatherRound&&(this._diffFlushQueuedGatherRound=e),n&&n>this._diffFlushQueuedTimestamp&&(this._diffFlushQueuedTimestamp=n);return}if(this._diffScheduled){e&&e>this._diffFlushQueuedGatherRound&&(this._diffFlushQueuedGatherRound=e),n&&n>this._diffFlushQueuedTimestamp&&(this._diffFlushQueuedTimestamp=n);return}this._diffScheduled=!0,this._diffScheduler.schedule()}}async _runDiffFlush(){if(!this._diffScheduled||(this._diffScheduled=!1,this._diffFlushInProgress))return;this._diffFlushInProgress=!0;const e=Math.max(this._lastGatherRound,this._diffFlushQueuedGatherRound),n=Math.max(this._lastGatherTimestamp,this._diffFlushQueuedTimestamp,Date.now());this._currentFlushGatherRound=e,this._currentFlushTimestamp=n;const t=this._diffFlushQueuedGatherRound,r=this._diffFlushQueuedTimestamp;this._diffFlushQueuedGatherRound=0,this._diffFlushQueuedTimestamp=0;let i=!0;try{i=await this._flushDiffs()}finally{this._diffFlushInProgress=!1,this._currentFlushGatherRound=0,this._currentFlushTimestamp=0,i||this._scheduleDiffRetry(),this._diffFlushQueued&&(this._diffFlushQueued=!1,this._scheduleDiffFlush({gatherRound:t,timestamp:r}))}}_scheduleDiffRetry(){if(this._disposed||this._diffRetryHandle||this._diffAdd.size===0&&this._diffRemove.size===0)return;const e=Math.min(1e3,Math.max(25,25*Math.pow(2,this._diffRetryCount)));this._diffRetryCount+=1,this._diffRetryHandle=setTimeout(()=>{this._diffRetryHandle=null,this._scheduleDiffFlush({gatherRound:this._lastGatherRound,timestamp:Date.now()})},e)}async _flushDiffs(){if(this._disposed||!this.gjSource||this._diffAdd.size===0&&this._diffRemove.size===0)return!0;const e=this._diffAdd.size>0?[...this._diffAdd.entries()]:[];let n=[];if(e.length===1)n=[e[0][1]];else if(e.length>1){const i=e.map(([,o])=>o);n=this._filterRedundantDiffAdds(i)}const t=this._diffRemove.size>0?[...this._diffRemove]:[];let r=null;if(t.length>0)if(n.length===0)r=t;else{const i=new Set;for(const o of n){const a=o?.properties?._index;a&&i.add(a)}r=[];for(const o of t)i.has(o)||r.push(o)}try{await this.gjSource.updateData({add:n,remove:r||[]})}catch{return!1}for(const[i,o]of e)i&&this._diffAdd.get(i)===o&&this._diffAdd.delete(i);for(const i of t)this._diffRemove.delete(i);return this._diffRetryCount=0,this._diffRetryHandle&&(clearTimeout(this._diffRetryHandle),this._diffRetryHandle=null),!0}}const D=`let v, M;
function oe() {
  return v !== void 0 ? v === !1 ? null : v : typeof TextEncoder < "u" ? (v = new TextEncoder(), v) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (v = { encode: (t) => new Uint8Array(Buffer.from(t)) }, v) : (v = !1, null);
}
function ue() {
  return M !== void 0 ? M === !1 ? null : M : typeof TextDecoder < "u" ? (M = new TextDecoder(), M) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (M = { decode: (t) => Buffer.from(t).toString("utf8") }, M) : (M = !1, null);
}
const ae = (t) => {
  if (t instanceof Uint8Array) return t;
  if (ArrayBuffer.isView(t)) return new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
  if (t instanceof ArrayBuffer) return new Uint8Array(t);
  const e = JSON.stringify(t), r = oe();
  if (r && typeof r.encode == "function") return r.encode(e);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, fe = (t) => {
  let e;
  if (t instanceof Uint8Array) e = t;
  else if (ArrayBuffer.isView(t)) e = new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
  else if (t instanceof ArrayBuffer) e = new Uint8Array(t);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(t))
    e = new Uint8Array(t);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  const r = ue();
  if (r && typeof r.decode == "function") return JSON.parse(r.decode(e));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(e));
  throw new Error("No TextDecoder or Buffer available to decode object");
};
class le {
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
    maxWeight: r = 1 / 0,
    weightFn: n = () => 1,
    defaultTTL: i = 6e4,
    maxPoolSize: s = 1e3,
    rejectOversized: o = !1,
    onEvict: u = null,
    onExpire: a = null,
    initialPoolSize: f = 0,
    maxCleanupPerTick: l = 100,
    eagerCleanupOnRead: c = !1
  } = {}) {
    this.maxEntries = e, this.maxWeight = r, this.weightFn = n, this.defaultTTL = i, this.maxPoolSize = s, this.rejectOversized = !!o, this.onEvict = typeof u == "function" ? u : null, this.onExpire = typeof a == "function" ? a : null, this.maxCleanupPerTick = Number.isFinite(+l) ? Math.max(1, +l) : 100, this.eagerCleanupOnRead = !!c, this.map = /* @__PURE__ */ new Map(), this.head = null, this.tail = null, this.pool = [];
    for (let g = 0; g < Math.min(f || 0, this.maxPoolSize); g++)
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
  _allocNode(e, r, n, i) {
    const s = this.pool.pop() || {
      key: null,
      value: null,
      weight: 0,
      expiresAt: 0,
      prev: null,
      next: null
    };
    return s.key = e, s.value = r, s.weight = n || 0, s.expiresAt = i || 0, s.prev = null, s.next = null, s;
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
  _removeExpiredNode(e, r, n = !1) {
    if (!e || !e.expiresAt || e.expiresAt > r) return !1;
    const i = e.key, s = e.value, o = e.next;
    this.map.delete(i), this.currentWeight -= e.weight || 0, this._cleanupCursor === e && (this._cleanupCursor = o), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e);
    try {
      this.onExpire && this.onExpire(i, s);
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
  _fetchValidNode(e, { ignoreExpiry: r = !1, countMiss: n = !1, allowExpired: i = !1 } = {}) {
    const s = this.map.get(e);
    return s ? !r && s.expiresAt && s.expiresAt <= Date.now() ? i ? s : (this._removeExpiredNode(s, Date.now(), n), null) : s : (n && this.misses++, null);
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
  _refreshStaleEntry(e, r, { ttl: n = void 0, weight: i = void 0 } = {}) {
    if (this._inflightPromises.has(e)) return;
    let s;
    try {
      s = Promise.resolve().then(() => r());
    } catch {
      return;
    }
    const o = s.then(
      (u) => {
        try {
          this.set(e, u, { ttl: n, weight: i });
        } catch {
        }
        return this._inflightPromises.delete(e), u;
      },
      (u) => {
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
   * \`prev\`/\`next\` references are updated on neighbors and the node's links
   * are nulled. Does not modify \`this.map\` or bookkeeping counters; callers
   * are responsible for those actions.
   *
   * @private
   * @param {CacheNode} node - Node to unlink from the list.
   * @returns {void}
   */
  _remove(e) {
    const r = e.prev, n = e.next;
    r ? r.next = n : this.head = n, n ? n.prev = r : this.tail = r, e.prev = e.next = null;
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
      const r = e.next, n = e.key, i = e.value;
      this._cleanupCursor === e && (this._cleanupCursor = r), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e), this.map.delete(n), this.currentWeight -= e.weight || 0, this.evictions++;
      try {
        this.onEvict && this.onEvict(n, i, "evicted");
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
  set(e, r, { ttl: n = this.defaultTTL, weight: i = null } = {}) {
    const s = Date.now(), o = n == null || n === 1 / 0 ? 0 : s + n;
    let u;
    if (i != null)
      u = i;
    else {
      try {
        u = this.weightFn(r);
      } catch {
        u = 0;
      }
      u == null && (u = 0);
    }
    const a = Number.isFinite(+u) ? Math.max(0, +u) : 0;
    if (this.rejectOversized && Number.isFinite(this.maxWeight) && a > this.maxWeight) {
      this.rejected++;
      try {
        this.onEvict && this.onEvict(e, r, "rejected-oversized");
      } catch {
      }
      return !1;
    }
    if (this.map.has(e)) {
      const f = this.map.get(e);
      this.currentWeight -= f.weight || 0, f.value = r, f.weight = a, f.expiresAt = o, this.currentWeight += f.weight || 0, this._moveToTail(f);
    } else {
      const f = this._allocNode(e, r, a, o);
      this.map.set(e, f), this._append(f), this.currentWeight += f.weight || 0, this._evictIfNeeded();
    }
    return this;
  }
  /**
   * Retrieve a value and mark it as recently used.
   * @param {*} key
   * @returns {*|undefined} The stored value or \`undefined\` if missing/expired.
   */
  get(e) {
    const r = this._fetchValidNode(e, { countMiss: !0 });
    if (r)
      return this._moveToTail(r), this.hits++, r.value;
  }
  /**
   * Get a value without updating recency.
   * Returns \`undefined\` for missing or expired entries.
   * @param {*} key
   * @returns {*|undefined}
   */
  peek(e) {
    const r = this._fetchValidNode(e);
    return r ? r.value : void 0;
  }
  /**
   * Check membership without affecting recency.
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false] If true, consider expired entries as present.
   * @returns {boolean}
   */
  has(e, { ignoreExpiry: r = !1 } = {}) {
    return !!this._fetchValidNode(e, { ignoreExpiry: r });
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
  getOrSet(e, r, { ttl: n = void 0, weight: i = void 0, staleWhileRevalidate: s = !1 } = {}) {
    const o = Date.now(), u = this._fetchValidNode(e, {
      countMiss: !1,
      allowExpired: s
    });
    if (u)
      if (u.expiresAt && u.expiresAt <= o) {
        if (typeof r == "function")
          return this._moveToTail(u), this.hits++, this._refreshStaleEntry(e, r, { ttl: n, weight: i }), u.value;
        this._removeExpiredNode(u, o, !0);
      } else
        return this._moveToTail(u), this.hits++, u.value;
    else
      this.misses++;
    if (typeof r == "function") {
      const a = r();
      return a && typeof a.then == "function" ? a.then((f) => {
        try {
          this.set(e, f, { ttl: n, weight: i });
        } catch {
        }
        return f;
      }) : (this.set(e, a, { ttl: n, weight: i }), a);
    }
    return this.set(e, r, { ttl: n, weight: i }), r;
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
  setMany(e, { ttl: r = void 0, weight: n = void 0 } = {}) {
    const i = Date.now(), s = r == null || r === 1 / 0 ? 0 : i + r;
    for (const o of e) {
      if (!o) continue;
      const [u, a] = o;
      let f;
      if (n != null) f = n;
      else {
        try {
          f = this.weightFn(a);
        } catch {
          f = 0;
        }
        f == null && (f = 0);
      }
      const l = Number.isFinite(+f) ? Math.max(0, +f) : 0;
      if (this.map.has(u)) {
        const c = this.map.get(u);
        this.currentWeight -= c.weight || 0, c.value = a, c.weight = l, c.expiresAt = s, this.currentWeight += c.weight || 0, this._moveToTail(c);
      } else {
        const c = this._allocNode(u, a, l, s);
        this.map.set(u, c), this._append(c), this.currentWeight += c.weight || 0;
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
  getMany(e, { ignoreExpiry: r = !1 } = {}) {
    const n = /* @__PURE__ */ new Map();
    for (const i of e) {
      const s = this._fetchValidNode(i, { ignoreExpiry: r, countMiss: !0 });
      s && (this._moveToTail(s), this.hits++, n.set(i, s.value));
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
  touch(e, r = void 0) {
    const n = this._fetchValidNode(e);
    if (!n) return !1;
    const i = Date.now();
    return r !== void 0 && (n.expiresAt = r == null || r === 1 / 0 ? 0 : i + r), this._moveToTail(n), !0;
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
  getOrSetAsync(e, r, { ttl: n = void 0, weight: i = void 0, staleWhileRevalidate: s = !1 } = {}) {
    if (typeof r != "function")
      return Promise.resolve(this.getOrSet(e, r, { ttl: n, weight: i }));
    const o = Date.now(), u = this.map.get(e);
    if (u)
      if (u.expiresAt && u.expiresAt <= o) {
        if (s)
          return this._moveToTail(u), this.hits++, this._refreshStaleEntry(e, r, { ttl: n, weight: i }), Promise.resolve(u.value);
        this._removeExpiredNode(u, o, !1);
      } else
        return this._moveToTail(u), this.hits++, Promise.resolve(u.value);
    if (this._inflightPromises.has(e)) return this._inflightPromises.get(e);
    this.misses++;
    let a;
    try {
      a = Promise.resolve().then(() => r());
    } catch (l) {
      return Promise.reject(l);
    }
    const f = a.then(
      (l) => {
        try {
          this.set(e, l, { ttl: n, weight: i });
        } catch {
        }
        return this._inflightPromises.delete(e), l;
      },
      (l) => {
        throw this._inflightPromises.delete(e), l;
      }
    );
    return this._inflightPromises.set(e, f), f;
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
  hasEqual(e, r, { ignoreExpiry: n = !1, seen: i = void 0 } = {}) {
    const s = this._fetchValidNode(e, { ignoreExpiry: n });
    if (!s) return !1;
    const o = s.value;
    return o === r ? !0 : typeof o !== "object" || o === null || typeof r !== "object" || r === null ? o === r : P(o, r, i);
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
  hasEqualWithSeen(e, r, n, { ignoreExpiry: i = !1 } = {}) {
    return this.hasEqual(e, r, { ignoreExpiry: i, seen: n });
  }
  /**
   * Delete an entry from the cache.
   * @param {*} key
   * @returns {boolean} true if the key was removed.
   */
  delete(e) {
    const r = this.map.get(e);
    if (!r) return !1;
    const n = r.next;
    this.map.delete(e), this.currentWeight -= r.weight || 0, this._cleanupCursor === r && (this._cleanupCursor = n), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(r);
    try {
      this.onEvict && this.onEvict(r.key, r.value, "deleted");
    } catch {
    }
    return this._freeNode(r), !0;
  }
  /**
   * Clear the cache and return nodes to the pool.
   * @returns {void}
   */
  clear() {
    for (let e = this.head; e; ) {
      const r = e.next;
      this._freeNode(e), e = r;
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
    const r = Date.now();
    let n = 0, i = this._cleanupCursor && this._cleanupCursorValid ? this._cleanupCursor : this.head;
    for (; i && n < e; ) {
      const s = i.next;
      if (i.expiresAt && i.expiresAt <= r) {
        const o = i.key, u = i.value;
        this.map.delete(o), this.currentWeight -= i.weight || 0, this._cleanupCursor === i && (this._cleanupCursor = s), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(i);
        try {
          this.onExpire && this.onExpire(o, u);
        } catch {
        }
        this._freeNode(i), this.expirations++;
      }
      i = s, n++;
    }
    return this._cleanupCursor = i || this.head, this._cleanupCursorValid = !!this._cleanupCursor, n;
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
    let r, n;
    typeof e == "number" ? (r = e, n = this.maxCleanupPerTick) : (r = Number.isFinite(+e.interval) ? +e.interval : Math.max(1e3, Math.min(this.defaultTTL || 6e4, 6e4)), n = Number.isFinite(+e.maxCleanupPerTick) ? Math.max(1, +e.maxCleanupPerTick) : this.maxCleanupPerTick), this.stopCleanup(), this._cleanupParams = { interval: r, maxCleanupPerTick: n }, this._cleanupTimer = setTimeout(() => this._cleanupTick(), r);
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
  resize({ maxEntries: e, maxWeight: r } = {}) {
    Number.isFinite(+e) && (this.maxEntries = Math.max(0, +e)), Number.isFinite(+r) && (this.maxWeight = Math.max(0, +r)), this._evictIfNeeded();
  }
  /**
   * Iterate entries in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   * @returns {IterableIterator<[*,*]>}
   */
  *entries(e = "MRU") {
    if (e === "MRU")
      for (let r = this.tail; r; r = r.prev) yield [r.key, r.value];
    else
      for (let r = this.head; r; r = r.next) yield [r.key, r.value];
  }
  [Symbol.iterator]() {
    return this.entries("MRU");
  }
  /**
   * Iterate keys in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *keys(e = "MRU") {
    for (const [r] of this.entries(e)) yield r;
  }
  /**
   * Iterate values in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *values(e = "MRU") {
    for (const [, r] of this.entries(e)) yield r;
  }
}
function P(t, e, r = void 0) {
  if (t === e) return !0;
  if (t == null || e == null || typeof t !== "object" || typeof e !== "object") return t === e;
  r || (r = /* @__PURE__ */ new WeakMap());
  let s = r.get(t);
  if (s && s.has(e)) return !0;
  if (s || (s = /* @__PURE__ */ new WeakSet(), r.set(t, s)), s.add(e), Object.getPrototypeOf(t) !== Object.getPrototypeOf(e)) return !1;
  if (typeof Uint8Array < "u" && t instanceof Uint8Array) {
    if (!(e instanceof Uint8Array) || t.length !== e.length) return !1;
    for (let a = 0; a < t.length; a++) if (t[a] !== e[a]) return !1;
    return !0;
  }
  if (Array.isArray(t)) {
    if (!Array.isArray(e) || t.length !== e.length) return !1;
    for (let a = 0; a < t.length; a++) if (!P(t[a], e[a], r)) return !1;
    return !0;
  }
  if (ArrayBuffer.isView(t)) {
    if (!ArrayBuffer.isView(e) || t.byteLength !== e.byteLength) return !1;
    const a = new Uint8Array(t.buffer, t.byteOffset || 0, t.byteLength), f = new Uint8Array(e.buffer, e.byteOffset || 0, e.byteLength);
    for (let l = 0; l < a.length; l++) if (a[l] !== f[l]) return !1;
    return !0;
  }
  if (t instanceof ArrayBuffer) {
    if (!(e instanceof ArrayBuffer) || t.byteLength !== e.byteLength) return !1;
    const a = new Uint8Array(t), f = new Uint8Array(e);
    for (let l = 0; l < a.length; l++) if (a[l] !== f[l]) return !1;
    return !0;
  }
  if (t instanceof Date)
    return e instanceof Date ? t.getTime() === e.getTime() : !1;
  if (t instanceof RegExp)
    return e instanceof RegExp ? t.toString() === e.toString() : !1;
  if (t instanceof Map) {
    if (!(e instanceof Map) || t.size !== e.size) return !1;
    for (const [a, f] of t)
      if (!e.has(a) || !P(f, e.get(a), r)) return !1;
    return !0;
  }
  if (t instanceof Set) {
    if (!(e instanceof Set) || t.size !== e.size) return !1;
    let a = !0;
    for (const f of t)
      if (f !== null && typeof f == "object") {
        a = !1;
        break;
      }
    if (a) {
      for (const f of t) if (!e.has(f)) return !1;
      return !0;
    }
    for (const f of t) {
      let l = !1;
      for (const c of e)
        if (P(f, c, r)) {
          l = !0;
          break;
        }
      if (!l) return !1;
    }
    return !0;
  }
  const o = Object.keys(t), u = Object.keys(e);
  if (o.length !== u.length) return !1;
  for (let a = 0; a < o.length; a++) {
    const f = o[a];
    if (!Object.prototype.hasOwnProperty.call(e, f) || !P(t[f], e[f], r)) return !1;
  }
  return !0;
}
class A {
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
  constructor(e, r = {}) {
    const {
      keyResolver: n = (...u) => JSON.stringify(u),
      cacheOptions: i = {},
      ttl: s,
      weight: o
    } = r;
    if (this.keyResolver = typeof n == "function" ? n : (...u) => JSON.stringify(u), this.cache = new le(i), this._inflight = /* @__PURE__ */ new Map(), this._defaultMemoizeOptions = {}, s !== void 0 && (this._defaultMemoizeOptions.ttl = s), o !== void 0 && (this._defaultMemoizeOptions.weight = o), typeof e == "function") {
      const u = this._memoize(e, this._defaultMemoizeOptions);
      u.get = (...a) => this.get(...a), u.has = (...a) => this.has(...a), u.delete = (...a) => this.delete(...a), u.clear = () => this.clear(), u.stats = () => this.stats(), u.cache = this.cache, u.original = e;
      try {
        Object.setPrototypeOf(u, A.prototype), u.constructor = A;
      } catch {
      }
      return u;
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
  _memoize(e, { ttl: r, weight: n } = {}) {
    if (typeof e != "function") throw new TypeError("fn must be a function");
    const i = this;
    return function(...o) {
      const u = i.keyResolver(...o);
      if (i.cache.has(u)) return i.cache.get(u);
      if (i._inflight.has(u)) return i._inflight.get(u);
      const a = e(...o);
      if (a && typeof a.then == "function") {
        const f = a.then(
          (l) => {
            try {
              i.cache.set(u, l, { ttl: r, weight: n });
            } catch {
            }
            return i._inflight.delete(u), l;
          },
          (l) => {
            throw i._inflight.delete(u), l;
          }
        );
        return i._inflight.set(u, f), f;
      }
      return i.cache.set(u, a, { ttl: r, weight: n }), a;
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
  memoize(e, r = {}) {
    if (typeof e != "function") throw new TypeError("fn must be a function");
    const n = r && (Object.prototype.hasOwnProperty.call(r, "ttl") || Object.prototype.hasOwnProperty.call(r, "weight")) ? r : this._defaultMemoizeOptions, i = this._memoize(e, n);
    i.get = (...s) => this.get(...s), i.has = (...s) => this.has(...s), i.delete = (...s) => this.delete(...s), i.clear = () => this.clear(), i.stats = () => this.stats(), i.cache = this.cache, i.original = e;
    try {
      Object.setPrototypeOf(i, A.prototype), i.constructor = A;
    } catch {
    }
    return i;
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
    const r = this.keyResolver(...e);
    return this._inflight.has(r) && this._inflight.delete(r), this.cache.delete(r);
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
let S = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function")
  try {
    const t = Number(process.hrtime.bigint() / 1000000n);
    S = Date.now() - t;
  } catch {
    S = null;
  }
const ce = () => {
  const t = Date.now();
  if (typeof performance < "u" && typeof performance.now == "function" && typeof performance.timeOrigin == "number")
    try {
      const e = performance.timeOrigin + performance.now();
      return Math.abs(e - t) < 1e3 ? e : t;
    } catch {
    }
  if (S != null)
    try {
      const e = Number(process.hrtime.bigint() / 1000000n) + S;
      return Math.abs(e - t) < 1e3 ? e : t;
    } catch {
      return t;
    }
  return t;
};
function he(t, e = "ERR_ITEM") {
  return !t || typeof t != "object" ? {
    error: !0,
    code: e,
    message: t ? String(t) : void 0,
    stack: void 0
  } : {
    error: !0,
    code: t.code || e,
    message: t.message,
    stack: t.stack
  };
}
function $(t) {
  return !t || !t.error ? String(t) : \`\${t.code || "ERR"}: \${t.message || ""}\`;
}
const ye = () => typeof globalThis < "u" && globalThis && globalThis.console ? globalThis.console : typeof self < "u" && self && self.console ? self.console : typeof window < "u" && window && window.console ? window.console : typeof global < "u" && global && global.console ? global.console : null, b = ye();
class de {
  /**
   * Create a PowerLogger instance.
   * @param {number} [level=0] Initial debug level (0..3)
   * @param {Object} [options]
   * @param {'text'|'json'} [options.format='text'] Output format. When 'json', logger emits JSON.stringify({ level, msg, ts, format, name }).
   */
  constructor(e = 0, r = {}) {
    this._debugLevel = 0, this._counters = /* @__PURE__ */ Object.create(null), this._format = r && r.format || "text", this.name = r && r.name || null, this._formatter = r && typeof r.formatter == "function" ? r.formatter : null, this._output = r && typeof r.output == "function" ? r.output : null, this.setDebugLevel(e);
  }
  /**
   * Set the global debug level.
   * @param {number} level - Integer in range 0..3
   * @returns {void}
   */
  setDebugLevel(e) {
    let r = NaN;
    typeof e == "number" ? r = e : typeof e == "string" || typeof e == "boolean" ? r = Number(e) : (e instanceof Number || e instanceof String || e instanceof Boolean) && (r = Number(e.valueOf())), this._debugLevel = Number.isFinite(r) && r >= 0 ? Math.max(0, Math.min(3, Math.floor(r))) : 0;
  }
  /**
   * Get the current debug level.
   * @returns {number} The configured debug level (0..3)
   */
  getDebugLevel() {
    return this._debugLevel;
  }
  /**
   * Determine whether the current debug level is >= \`level\`.
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
    return e.map((r) => {
      if (typeof r == "function")
        try {
          return r();
        } catch (n) {
          return n;
        }
      return r;
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
  _emit(e, r, n, i, s = {}) {
    if (!this.isDebugLevel(e)) return;
    const o = this._resolveLogArgs(i), u = s.msgArray ? o : o.length === 1 ? o[0] : o;
    let a = { level: n, msg: u, ts: ce(), format: this._format };
    if (this.name && (a.name = this.name), this._formatter)
      try {
        const f = this._formatter(a);
        if (f != null) {
          if (typeof f == "string") {
            if (this._output) {
              try {
                this._output(f);
              } catch {
              }
              return;
            }
            b && typeof b[r] == "function" && b[r](f);
            return;
          }
          a = f;
        }
      } catch {
      }
    if (this._output) {
      try {
        this._output(a);
      } catch {
      }
      return;
    }
    if (!(!b || typeof b[r] != "function"))
      if (this._format === "json")
        try {
          const f = typeof a == "string" ? a : JSON.stringify(a);
          b[r](f);
        } catch {
          b[r](...Array.isArray(o) ? o : [o]);
        }
      else
        b[r](...o);
  }
  /**
   * Log an error-level message when debug level is >= 1.
   * Accepts values or functions (lazy evaluated).
   * @param {...any} args
   * @returns {void}
   */
  error(...e) {
    const r = e.map((n) => {
      try {
        if (n && n.error) return $(n);
        if (n instanceof Error || n && typeof n == "object")
          return $(he(n));
      } catch {
      }
      return n;
    });
    this._emit(1, "error", "error", r);
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
   * Log using \`console.debug\` when level >= 3 (alias for verbose debug output).
   * Supports JSON mode similar to other methods.
   */
  debug(...e) {
    this._emit(3, "debug", "debug", e);
  }
  /**
   * Display tabular data. Uses \`console.table\` when available.
   * In JSON mode emits \`{ level: 'table', msg: args, ts }\` where \`msg\` is an array of arguments.
   */
  table(...e) {
    if (!this.isDebugLevel(3) || !b) return;
    if (this._format === "json") {
      this._emit(3, "log", "table", e, { msgArray: !0 });
      return;
    }
    const r = this._resolveLogArgs(e);
    typeof b.table == "function" ? b.table(...r) : typeof b.log == "function" && b.log(...r);
  }
  /**
   * Increment an internal named counter (no-op when debug is disabled).
   * Useful for lightweight instrumentation in tests.
   * @param {string} name
   * @returns {void}
   */
  incrementCounter(e) {
    if (!this.isDebug()) return;
    const r = String(e || "");
    r && (this._counters[r] = (this._counters[r] || 0) + 1);
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
class pe {
  constructor(e = [], r = (n, i) => n < i ? -1 : n > i ? 1 : 0) {
    if (this.data = e, this.length = this.data.length, this.compare = r, this.length > 0)
      for (let n = (this.length >> 1) - 1; n >= 0; n--) this._down(n);
  }
  push(e) {
    this.data.push(e), this._up(this.length++);
  }
  pop() {
    if (this.length === 0) return;
    const e = this.data[0], r = this.data.pop();
    return --this.length > 0 && (this.data[0] = r, this._down(0)), e;
  }
  peek() {
    return this.data[0];
  }
  _up(e) {
    const { data: r, compare: n } = this, i = r[e];
    for (; e > 0; ) {
      const s = e - 1 >> 1, o = r[s];
      if (n(i, o) >= 0) break;
      r[e] = o, e = s;
    }
    r[e] = i;
  }
  _down(e) {
    const { data: r, compare: n } = this, i = this.length >> 1, s = r[e];
    for (; e < i; ) {
      let o = (e << 1) + 1;
      const u = o + 1;
      if (u < this.length && n(r[u], r[o]) < 0 && (o = u), n(r[o], s) >= 0) break;
      r[e] = r[o], e = o;
    }
    r[e] = s;
  }
}
function me(t, e = 1, r = !1) {
  let n = 1 / 0, i = 1 / 0, s = -1 / 0, o = -1 / 0;
  for (const [p, m] of t[0])
    p < n && (n = p), m < i && (i = m), p > s && (s = p), m > o && (o = m);
  const u = s - n, a = o - i, f = Math.max(e, Math.min(u, a));
  if (f === e) {
    const p = [n, i];
    return p.distance = 0, p;
  }
  const l = new pe([], (p, m) => m.max - p.max);
  let c = we(t);
  const g = new O(n + u / 2, i + a / 2, 0, t);
  g.d > c.d && (c = g);
  let y = 2;
  function h(p, m, x) {
    const _ = new O(p, m, x, t);
    y++, _.max > c.d + e && l.push(_), _.d > c.d && (c = _, r && console.log(\`found best \${Math.round(1e4 * _.d) / 1e4} after \${y} probes\`));
  }
  let d = f / 2;
  for (let p = n; p < s; p += f)
    for (let m = i; m < o; m += f)
      h(p + d, m + d, d);
  for (; l.length; ) {
    const { max: p, x: m, y: x, h: _ } = l.pop();
    if (p - c.d <= e) break;
    d = _ / 2, h(m - d, x - d, d), h(m + d, x - d, d), h(m - d, x + d, d), h(m + d, x + d, d);
  }
  r && console.log(\`num probes: \${y}
best distance: \${c.d}\`);
  const w = [c.x, c.y];
  return w.distance = c.d, w;
}
function O(t, e, r, n) {
  this.x = t, this.y = e, this.h = r, this.d = ge(t, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function ge(t, e, r) {
  let n = !1, i = 1 / 0;
  for (const s of r)
    for (let o = 0, u = s.length, a = u - 1; o < u; a = o++) {
      const f = s[o], l = s[a];
      f[1] > e != l[1] > e && t < (l[0] - f[0]) * (e - f[1]) / (l[1] - f[1]) + f[0] && (n = !n), i = Math.min(i, be(t, e, f, l));
    }
  return i === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(i);
}
function we(t) {
  let e = 0, r = 0, n = 0;
  const i = t[0];
  for (let o = 0, u = i.length, a = u - 1; o < u; a = o++) {
    const f = i[o], l = i[a], c = f[0] * l[1] - l[0] * f[1];
    r += (f[0] + l[0]) * c, n += (f[1] + l[1]) * c, e += c * 3;
  }
  const s = new O(r / e, n / e, 0, t);
  return e === 0 || s.d < 0 ? new O(i[0][0], i[0][1], 0, t) : s;
}
function be(t, e, r, n) {
  let i = r[0], s = r[1], o = n[0] - i, u = n[1] - s;
  if (o !== 0 || u !== 0) {
    const a = ((t - i) * o + (e - s) * u) / (o * o + u * u);
    a > 1 ? (i = n[0], s = n[1]) : a > 0 && (i += o * a, s += u * a);
  }
  return o = t - i, u = e - s, o * o + u * u;
}
var W = 63710088e-1;
function B(t, e, r = {}) {
  const n = { type: "Feature" };
  return (r.id === 0 || r.id) && (n.id = r.id), r.bbox && (n.bbox = r.bbox), n.properties = e || {}, n.geometry = t, n;
}
function G(t, e, r = {}) {
  if (t.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return B({
    type: "LineString",
    coordinates: t
  }, e, r);
}
function _e(t, e = {}) {
  const r = { type: "FeatureCollection" };
  return e.id && (r.id = e.id), e.bbox && (r.bbox = e.bbox), r.features = t, r;
}
function xe(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function U(t, e) {
  var r, n, i, s, o, u, a, f, l, c, g = 0, y = t.type === "FeatureCollection", h = t.type === "Feature", d = y ? t.features.length : 1;
  for (r = 0; r < d; r++) {
    for (u = y ? (
      // @ts-expect-error: Known type conflict
      t.features[r].geometry
    ) : h ? (
      // @ts-expect-error: Known type conflict
      t.geometry
    ) : t, f = y ? (
      // @ts-expect-error: Known type conflict
      t.features[r].properties
    ) : h ? (
      // @ts-expect-error: Known type conflict
      t.properties
    ) : {}, l = y ? (
      // @ts-expect-error: Known type conflict
      t.features[r].bbox
    ) : h ? (
      // @ts-expect-error: Known type conflict
      t.bbox
    ) : void 0, c = y ? (
      // @ts-expect-error: Known type conflict
      t.features[r].id
    ) : h ? (
      // @ts-expect-error: Known type conflict
      t.id
    ) : void 0, a = u ? u.type === "GeometryCollection" : !1, o = a ? u.geometries.length : 1, i = 0; i < o; i++) {
      if (s = a ? u.geometries[i] : u, s === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            g,
            f,
            l,
            c
          ) === !1
        )
          return !1;
        continue;
      }
      switch (s.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            // @ts-expect-error: Known type conflict
            e(
              s,
              g,
              f,
              l,
              c
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (n = 0; n < s.geometries.length; n++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                s.geometries[n],
                g,
                f,
                l,
                c
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    g++;
  }
}
function Ae(t, e, r) {
  var n = r;
  return U(
    t,
    function(i, s, o, u, a) {
      n = e(
        // @ts-expect-error: Known type conflict
        n,
        i,
        s,
        o,
        u,
        a
      );
    }
  ), n;
}
function ve(t, e) {
  U(t, function(r, n, i, s, o) {
    var u = r === null ? null : r.type;
    switch (u) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            B(r, i, { bbox: s, id: o }),
            n,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var a;
    switch (u) {
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
      var f = 0;
      // @ts-expect-error: Known type conflict
      f < r.coordinates.length;
      f++
    ) {
      var l = r.coordinates[f], c = {
        type: a,
        coordinates: l
      };
      if (
        // @ts-expect-error: Known type conflict
        e(B(c, i), n, f) === !1
      )
        return !1;
    }
  });
}
function Me(t) {
  return Ae(
    t,
    (e, r) => e + Pe(r),
    0
  );
}
function Pe(t) {
  let e = 0, r;
  switch (t.type) {
    case "Polygon":
      return J(t.coordinates);
    case "MultiPolygon":
      for (r = 0; r < t.coordinates.length; r++)
        e += J(t.coordinates[r]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function J(t) {
  let e = 0;
  if (t && t.length > 0) {
    e += Math.abs(q(t[0]));
    for (let r = 1; r < t.length; r++)
      e -= Math.abs(q(t[r]));
  }
  return e;
}
var Te = W * W / 2, L = Math.PI / 180;
function q(t) {
  const e = t.length - 1;
  if (e <= 2) return 0;
  let r = 0, n = 0;
  for (; n < e; ) {
    const i = t[n], s = t[n + 1 === e ? 0 : n + 1], o = t[n + 2 >= e ? (n + 2) % e : n + 2], u = i[0] * L, a = s[1] * L, f = o[0] * L;
    r += (f - u) * Math.sin(a), n++;
  }
  return r * Te;
}
function Ee(t) {
  if (!t)
    throw new Error("coord is required");
  if (!Array.isArray(t)) {
    if (t.type === "Feature" && t.geometry !== null && t.geometry.type === "Point")
      return [...t.geometry.coordinates];
    if (t.type === "Point")
      return [...t.coordinates];
  }
  if (Array.isArray(t) && t.length >= 2 && !Array.isArray(t[0]) && !Array.isArray(t[1]))
    return [...t];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function T(t) {
  if (Array.isArray(t))
    return t;
  if (t.type === "Feature") {
    if (t.geometry !== null)
      return t.geometry.coordinates;
  } else if (t.coordinates)
    return t.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function Ce(t, e) {
  return t.type === "FeatureCollection" ? "FeatureCollection" : t.type === "GeometryCollection" ? "GeometryCollection" : t.type === "Feature" && t.geometry !== null ? t.geometry.type : t.type;
}
function X(t, e, r = {}) {
  const n = Ee(t), i = T(e);
  for (let s = 0; s < i.length - 1; s++) {
    let o = !1;
    if (r.ignoreEndVertices && (s === 0 && (o = "start"), s === i.length - 2 && (o = "end"), s === 0 && s + 1 === i.length - 1 && (o = "both")), Ne(
      i[s],
      i[s + 1],
      n,
      o,
      typeof r.epsilon > "u" ? null : r.epsilon
    ))
      return !0;
  }
  return !1;
}
function Ne(t, e, r, n, i) {
  const s = r[0], o = r[1], u = t[0], a = t[1], f = e[0], l = e[1], c = r[0] - u, g = r[1] - a, y = f - u, h = l - a, d = c * h - g * y;
  if (i !== null) {
    if (Math.abs(d) > i)
      return !1;
  } else if (d !== 0)
    return !1;
  if (Math.abs(y) === Math.abs(h) && Math.abs(y) === 0)
    return n ? !1 : r[0] === t[0] && r[1] === t[1];
  if (n) {
    if (n === "start")
      return Math.abs(y) >= Math.abs(h) ? y > 0 ? u < s && s <= f : f <= s && s < u : h > 0 ? a < o && o <= l : l <= o && o < a;
    if (n === "end")
      return Math.abs(y) >= Math.abs(h) ? y > 0 ? u <= s && s < f : f < s && s <= u : h > 0 ? a <= o && o < l : l < o && o <= a;
    if (n === "both")
      return Math.abs(y) >= Math.abs(h) ? y > 0 ? u < s && s < f : f < s && s < u : h > 0 ? a < o && o < l : l < o && o < a;
  } else return Math.abs(y) >= Math.abs(h) ? y > 0 ? u <= s && s <= f : f <= s && s <= u : h > 0 ? a <= o && o <= l : l <= o && o <= a;
  return !1;
}
function Se(t, e = {}) {
  var r = typeof e == "object" ? e.mutate : e;
  if (!t) throw new Error("geojson is required");
  var n = Ce(t), i = [];
  switch (n) {
    case "LineString":
      i = D(t, n);
      break;
    case "MultiLineString":
    case "Polygon":
      T(t).forEach(function(o) {
        i.push(D(o, n));
      });
      break;
    case "MultiPolygon":
      T(t).forEach(function(o) {
        var u = [];
        o.forEach(function(a) {
          u.push(D(a, n));
        }), i.push(u);
      });
      break;
    case "Point":
      return t;
    case "MultiPoint":
      var s = {};
      T(t).forEach(function(o) {
        var u = o.join("-");
        Object.prototype.hasOwnProperty.call(s, u) || (i.push(o), s[u] = !0);
      });
      break;
    default:
      throw new Error(n + " geometry not supported");
  }
  return t.coordinates ? r === !0 ? (t.coordinates = i, t) : { type: n, coordinates: i } : r === !0 ? (t.geometry.coordinates = i, t) : B({ type: n, coordinates: i }, t.properties, {
    bbox: t.bbox,
    id: t.id
  });
}
function D(t, e) {
  const r = T(t);
  if (r.length === 2 && !j(r[0], r[1])) return r;
  const n = [];
  let i = 0, s = 1, o = 2;
  for (n.push(r[i]); o < r.length; )
    X(r[s], G([r[i], r[o]])) ? s = o : (n.push(r[s]), i = s, s++, o = s), o++;
  if (n.push(r[s]), e === "Polygon" || e === "MultiPolygon") {
    if (X(
      n[0],
      G([n[1], n[n.length - 2]])
    ) && (n.shift(), n.pop(), n.push(n[0])), n.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!j(n[0], n[n.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return n;
}
function j(t, e) {
  return t[0] === e[0] && t[1] === e[1];
}
function Oe(t) {
  if (!t)
    throw new Error("geojson is required");
  switch (t.type) {
    case "Feature":
      return re(t);
    case "FeatureCollection":
      return Be(t);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return V(t);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function re(t) {
  const e = { type: "Feature" };
  return Object.keys(t).forEach((r) => {
    switch (r) {
      case "type":
      case "properties":
      case "geometry":
        return;
      default:
        e[r] = t[r];
    }
  }), e.properties = ne(t.properties), t.geometry == null ? e.geometry = null : e.geometry = V(t.geometry), e;
}
function ne(t) {
  const e = {};
  return t && Object.keys(t).forEach((r) => {
    const n = t[r];
    typeof n == "object" ? n === null ? e[r] = null : Array.isArray(n) ? e[r] = n.map((i) => i) : e[r] = ne(n) : e[r] = n;
  }), e;
}
function Be(t) {
  const e = { type: "FeatureCollection" };
  return Object.keys(t).forEach((r) => {
    switch (r) {
      case "type":
      case "features":
        return;
      default:
        e[r] = t[r];
    }
  }), e.features = t.features.map((r) => re(r)), e;
}
function V(t) {
  const e = { type: t.type };
  return t.bbox && (e.bbox = t.bbox), t.type === "GeometryCollection" ? (e.geometries = t.geometries.map((r) => V(r)), e) : (e.coordinates = ie(t.coordinates), e);
}
function ie(t) {
  const e = t;
  return typeof e[0] != "object" ? e.slice() : e.map((r) => ie(r));
}
function ke(t, e) {
  var r = t[0] - e[0], n = t[1] - e[1];
  return r * r + n * n;
}
function Le(t, e, r) {
  var n = e[0], i = e[1], s = r[0] - n, o = r[1] - i;
  if (s !== 0 || o !== 0) {
    var u = ((t[0] - n) * s + (t[1] - i) * o) / (s * s + o * o);
    u > 1 ? (n = r[0], i = r[1]) : u > 0 && (n += s * u, i += o * u);
  }
  return s = t[0] - n, o = t[1] - i, s * s + o * o;
}
function De(t, e) {
  for (var r = t[0], n = [r], i, s = 1, o = t.length; s < o; s++)
    i = t[s], ke(i, r) > e && (n.push(i), r = i);
  return r !== i && n.push(i), n;
}
function I(t, e, r, n, i) {
  for (var s = n, o, u = e + 1; u < r; u++) {
    var a = Le(t[u], t[e], t[r]);
    a > s && (o = u, s = a);
  }
  s > n && (o - e > 1 && I(t, e, o, n, i), i.push(t[o]), r - o > 1 && I(t, o, r, n, i));
}
function Fe(t, e) {
  var r = t.length - 1, n = [t[0]];
  return I(t, 0, r, e, n), n.push(t[r]), n;
}
function k(t, e, r) {
  if (t.length <= 2) return t;
  var n = e !== void 0 ? e * e : 1;
  return t = r ? t : De(t, n), t = Fe(t, n), t;
}
function Re(t, e = {}) {
  var r, n, i;
  if (e = e ?? {}, !xe(e)) throw new Error("options is invalid");
  const s = (r = e.tolerance) != null ? r : 1, o = (n = e.highQuality) != null ? n : !1, u = (i = e.mutate) != null ? i : !1;
  if (!t) throw new Error("geojson is required");
  if (s && s < 0) throw new Error("invalid tolerance");
  return u !== !0 && (t = Oe(t)), U(t, function(a) {
    Ie(a, s, o);
  }), t;
}
function Ie(t, e, r) {
  const n = t.type;
  if (n === "Point" || n === "MultiPoint") return t;
  if (Se(t, { mutate: !0 }), n !== "GeometryCollection")
    switch (n) {
      case "LineString":
        t.coordinates = k(
          t.coordinates,
          e,
          r
        );
        break;
      case "MultiLineString":
        t.coordinates = t.coordinates.map(
          (i) => k(i, e, r)
        );
        break;
      case "Polygon":
        t.coordinates = Y(
          t.coordinates,
          e,
          r
        );
        break;
      case "MultiPolygon":
        t.coordinates = t.coordinates.map(
          (i) => Y(i, e, r)
        );
    }
  return t;
}
function Y(t, e, r) {
  return t.map(function(n) {
    if (n.length < 4)
      throw new Error("invalid polygon");
    let i = e, s = k(n, i, r);
    for (; !Q(s) && i >= Number.EPSILON; )
      i -= i * 0.01, s = k(n, i, r);
    return Q(s) ? ((s[s.length - 1][0] !== s[0][0] || s[s.length - 1][1] !== s[0][1]) && s.push(s[0]), s) : n;
  });
}
function Q(t) {
  return t.length < 3 ? !1 : !(t.length === 3 && t[2][0] === t[0][0] && t[2][1] === t[0][1]);
}
function Ue(t) {
  if (!t) throw new Error("geojson is required");
  var e = [];
  return ve(t, function(r) {
    e.push(r);
  }), _e(e);
}
const Ve = \`let y, l;
function T() {
  return y !== void 0 ? y === !1 ? null : y : typeof TextEncoder < "u" ? (y = new TextEncoder(), y) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (y = { encode: (e) => new Uint8Array(Buffer.from(e)) }, y) : (y = !1, null);
}
function U() {
  return l !== void 0 ? l === !1 ? null : l : typeof TextDecoder < "u" ? (l = new TextDecoder(), l) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (l = { decode: (e) => Buffer.from(e).toString("utf8") }, l) : (l = !1, null);
}
const E = (e) => {
  if (e instanceof Uint8Array) return e;
  if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  const r = JSON.stringify(e), t = T();
  if (t && typeof t.encode == "function") return t.encode(r);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, D = (e) => {
  let r;
  if (e instanceof Uint8Array) r = e;
  else if (ArrayBuffer.isView(e)) r = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  else if (e instanceof ArrayBuffer) r = new Uint8Array(e);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(e))
    r = new Uint8Array(e);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  const t = U();
  if (t && typeof t.decode == "function") return JSON.parse(t.decode(r));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(r));
  throw new Error("No TextDecoder or Buffer available to decode object");
};
let x = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function")
  try {
    const e = Number(process.hrtime.bigint() / 1000000n);
    x = Date.now() - e;
  } catch {
    x = null;
  }
const I = () => typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {}, B = I(), p = (e, r, t) => {
  const [n, o] = e, [f, i] = r, [s, c] = t;
  return (f - n) * (c - o) - (i - o) * (s - n);
}, g = (e, r, t) => {
  const [n, o] = e, [f, i] = r, [s, c] = t;
  return Math.min(n, f) <= s && s <= Math.max(n, f) && Math.min(o, i) <= c && c <= Math.max(o, i);
}, N = (e, r, t, n) => {
  const o = p(e, r, t), f = p(e, r, n), i = p(t, n, e), s = p(t, n, r);
  return o === 0 && g(e, r, t) || f === 0 && g(e, r, n) || i === 0 && g(t, n, e) || s === 0 && g(t, n, r) ? !0 : o * f < 0 && i * s < 0;
}, w = (e, r) => {
  const [t, n] = e;
  let o = !1;
  for (let f = 0, i = r.length - 1; f < r.length; i = f++) {
    const [s, c] = r[f], [d, a] = r[i];
    c > n != a > n && t < (d - s) * (n - c) / (a - c) + s && (o = !o);
  }
  return o;
}, m = (e, r) => {
  if (!Array.isArray(r) || r.length === 0 || !w(e, r[0])) return !1;
  for (let t = 1; t < r.length; t++)
    if (w(e, r[t])) return !1;
  return !0;
}, O = (e, r) => e[0] <= r[2] && e[2] >= r[0] && e[1] <= r[3] && e[3] >= r[1], b = (e) => e && Array.isArray(e.bbox) && e.bbox.length === 4 && Array.isArray(e.coordinates) && e.coordinates.length > 0, S = (e, r) => {
  if (!b(e) || !b(r) || !O(e.bbox, r.bbox)) return !1;
  for (const o of e.coordinates)
    for (let f = 0; f + 1 < o.length; f++) {
      const i = o[f], s = o[f + 1];
      if (!(!Array.isArray(i) || !Array.isArray(s)))
        for (const c of r.coordinates)
          for (let d = 0; d + 1 < c.length; d++) {
            const a = c[d], u = c[d + 1];
            if (!(!Array.isArray(a) || !Array.isArray(u)) && N(i, s, a, u))
              return !0;
          }
    }
  const t = e.coordinates[0]?.[0], n = r.coordinates[0]?.[0];
  return !!(Array.isArray(t) && m(t, r.coordinates) || Array.isArray(n) && m(n, e.coordinates));
};
B.onmessage = (e) => {
  const r = e.data, t = r instanceof ArrayBuffer || ArrayBuffer.isView(r) ? D(r) : r, { type: n, nodes: o, start: f, end: i, correlationId: s } = t;
  if (n !== "build-range" || !Array.isArray(o)) return;
  const c = [];
  for (let u = f; u < i; u++) {
    const h = [];
    for (let A = 0; A < o.length; A++)
      u !== A && S(o[u], o[A]) && h.push(A);
    c.push({ index: u, neighbors: h });
  }
  const a = E({ correlationId: s, neighbors: c }).buffer;
  B.postMessage(a, [a]);
};
\`;
typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", Ve], { type: "text/javascript;charset=utf-8" });
const F = /* @__PURE__ */ new WeakMap();
let ze = 0;
const K = (t) => t === void 0 ? "__undefined" : t === null ? "__null" : typeof t != "object" && typeof t != "function" ? String(t) : (F.has(t) || F.set(t, String(ze++)), F.get(t));
new A(
  (t, e) => Ge(t, e),
  {
    keyResolver: (t, e) => {
      const r = K(t?.feature ?? t), n = K(e?.feature ?? e);
      return r < n ? \`\${r}|\${n}\` : \`\${n}|\${r}\`;
    }
  }
);
const H = (t) => t && Array.isArray(t.bbox) && t.bbox.length === 4 && Array.isArray(t.coordinates) && t.coordinates.length > 0, $e = (t, e) => t[0] <= e[2] && t[2] >= e[0] && t[1] <= e[3] && t[3] >= e[1], C = (t, e, r) => {
  const [n, i] = t, [s, o] = e, [u, a] = r;
  return (s - n) * (a - i) - (o - i) * (u - n);
}, N = (t, e, r) => {
  const [n, i] = t, [s, o] = e, [u, a] = r;
  return Math.min(n, s) <= u && u <= Math.max(n, s) && Math.min(i, o) <= a && a <= Math.max(i, o);
}, We = (t, e, r, n) => {
  const i = C(t, e, r), s = C(t, e, n), o = C(r, n, t), u = C(r, n, e);
  return i === 0 && N(t, e, r) || s === 0 && N(t, e, n) || o === 0 && N(r, n, t) || u === 0 && N(r, n, e) ? !0 : i * s < 0 && o * u < 0;
}, Z = (t, e) => {
  const [r, n] = t;
  let i = !1;
  for (let s = 0, o = e.length - 1; s < e.length; o = s++) {
    const [u, a] = e[s], [f, l] = e[o];
    a > n != l > n && r < (f - u) * (n - a) / (l - a) + u && (i = !i);
  }
  return i;
}, ee = (t, e) => {
  if (!Array.isArray(e) || e.length === 0 || !Z(t, e[0])) return !1;
  for (let r = 1; r < e.length; r++)
    if (Z(t, e[r])) return !1;
  return !0;
}, Ge = (t, e) => {
  if (!H(t) || !H(e) || !$e(t.bbox, e.bbox)) return !1;
  for (const i of t.coordinates)
    for (let s = 0; s + 1 < i.length; s++) {
      const o = i[s], u = i[s + 1];
      if (!(!Array.isArray(o) || !Array.isArray(u)))
        for (const a of e.coordinates)
          for (let f = 0; f + 1 < a.length; f++) {
            const l = a[f], c = a[f + 1];
            if (!(!Array.isArray(l) || !Array.isArray(c)) && We(o, u, l, c))
              return !0;
          }
    }
  const r = t.coordinates[0]?.[0], n = e.coordinates[0]?.[0];
  return !!(Array.isArray(r) && ee(r, e.coordinates) || Array.isArray(n) && ee(n, t.coordinates));
}, R = /* @__PURE__ */ new WeakMap();
let Je = 0;
const E = (t) => (R.has(t) || R.set(t, String(Je++)), R.get(t)), qe = new A(
  (t, e, r) => {
    const [n, i, s] = e.split("|").map(Number), o = Math.pow(2, n) * r, u = 85.05112878, a = 1;
    return t[0].some((l) => {
      const c = Math.max(Math.min(l[1], u), -u), g = Math.sin(c * Math.PI / 180), y = (l[0] + 180) / 360, h = 0.5 - Math.log((1 + g) / (1 - g)) / (4 * Math.PI), d = y * o, w = h * o, p = Math.floor(d / r), m = Math.floor(w / r), x = Math.floor(d - p * r), _ = Math.floor(w - m * r);
      return m !== s || p !== i || x <= a || _ <= a || x >= r - a || _ >= r - a;
    });
  },
  {
    keyResolver: (t, e, r) => \`\${E(t)}|\${e}|\${r}\`
  }
), Xe = new A(
  (t, e = !1) => {
    const r = e ? /* @__PURE__ */ new Set() : null;
    let n = 0;
    const i = (a) => Array.isArray(a) && a.length >= 2 && typeof a[0] == "number" && typeof a[1] == "number", s = (a) => {
      e ? r.add(a.slice(0, 3).join(",")) : n++;
    };
    function o(a) {
      if (i(a)) {
        s(a);
        return;
      }
      if (Array.isArray(a)) for (const f of a) o(f);
    }
    function u(a) {
      if (a) {
        if (a.type === "FeatureCollection") {
          for (const f of a.features || []) u(f);
          return;
        }
        if (a.type === "Feature") {
          u(a.geometry);
          return;
        }
        if (a.type === "GeometryCollection") {
          for (const f of a.geometries || []) u(f);
          return;
        }
        a.coordinates !== void 0 && o(a.coordinates);
      }
    }
    return u(t), e ? r.size : n;
  },
  {
    keyResolver: (t, e = !1) => \`\${E(t)}|\${e ? "unique" : "__count"}\`
  }
), je = (t, e) => {
  if (!t || t.geometry?.type !== "Polygon")
    throw new Error("Non-Polygon geometry");
  const r = t.geometry.coordinates, n = me(r, e);
  if (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1]))
    throw new Error("Invalid polylabel result");
  return {
    type: "Point",
    coordinates: [n[0], n[1]]
  };
};
new A(je, {
  keyResolver: (t, e) => \`\${E(t)}|\${e === void 0 ? "__default" : String(e)}\`
});
const Ye = (t, e) => {
  if (!t || typeof t != "object" || !t.geometry)
    return 0;
  if (e === "meters" || e === "m")
    return Me(t);
  const r = t.geometry.coordinates;
  if (!Array.isArray(r) || r.length === 0)
    return 0;
  const n = t.geometry.type === "Polygon" ? r[0] : r[0]?.[0];
  if (!Array.isArray(n))
    return 0;
  let i = 0;
  for (let s = 0; s < n.length; s++) {
    const [o, u] = n[s], [a, f] = n[(s + 1) % n.length];
    i += o * f - a * u;
  }
  return Math.abs(i) / 2;
}, Qe = new de(0, { name: "properlabels-geom" });
new A(Ye, {
  keyResolver: (t, e) => \`\${E(t)}|\${e === void 0 ? "__planar" : String(e)}\`
});
const Ke = (t, e, r = {}) => {
  if (!t || typeof t != "object" || t.type !== "Feature" || !t.geometry || !Number.isFinite(e) || e < 0 || se(t.geometry, { unique: !1 }) <= e) return t;
  const { tolerance: i = 1e-6, highQuality: s = !1 } = r;
  try {
    return Re(t, { tolerance: i, highQuality: s, mutate: !0 });
  } catch (o) {
    return Qe.error("Error simplifying feature", o), t;
  }
};
new A(
  (t, e, r = {}) => Ke(t, e, r),
  {
    keyResolver: (t, e, r = {}) => {
      const n = Number(r.tolerance) || 1e-6, i = !!r.highQuality;
      return \`\${E(t)}|\${e}|\${n}|\${i}\`;
    }
  }
);
function se(t, e = {}) {
  const { unique: r = !1 } = e;
  return !t || typeof t != "object" ? 0 : Xe(t, r);
}
const He = () => typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {}, te = He();
te.onmessage = (t) => {
  const e = t.data, r = e instanceof ArrayBuffer || ArrayBuffer.isView(e) ? fe(e) : e, n = r.unique, i = r.correlationId, s = r.tileSize, o = /* @__PURE__ */ new Map();
  r.collection.features.forEach((g) => {
    const y = g.id;
    let h = o.get(y);
    h || (h = [], o.set(y, h)), h.push(g);
  });
  let u = 0;
  const a = /* @__PURE__ */ new Map();
  o.forEach((g, y) => {
    const h = Ue({ type: "FeatureCollection", features: g }), d = { type: "FeatureCollection", features: [] };
    d.features = h.features.filter((w) => w && w.geometry && w.geometry.type === "Polygon").map((w, p) => {
      const m = \`\${n}|\${y}|\${p}\`, x = qe(w.geometry.coordinates, w.properties?._tile, s), _ = Object.assign({}, w.properties, { _index: m, clipped: x }), z = { type: "Feature", geometry: w.geometry, properties: _ };
      return u += se(z), z;
    }), a.set(y, d);
  });
  const f = Object.fromEntries(a), l = Object.assign({}, f, { unique: n, type: "simplified", size: u });
  i != null && (l.correlationId = i);
  const c = ae(l).buffer;
  te.postMessage(c, [c]);
};
`,j=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",D],{type:"text/javascript;charset=utf-8"});function re(u){let e;try{if(e=j&&(self.URL||self.webkitURL).createObjectURL(j),!e)throw"";const n=new Worker(e,{type:"module",name:u?.name});return n.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(e)}),n}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(D),{type:"module",name:u?.name})}}const G=`let ue, he;
function Dt() {
  return ue !== void 0 ? ue === !1 ? null : ue : typeof TextEncoder < "u" ? (ue = new TextEncoder(), ue) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (ue = { encode: (r) => new Uint8Array(Buffer.from(r)) }, ue) : (ue = !1, null);
}
function Ut() {
  return he !== void 0 ? he === !1 ? null : he : typeof TextDecoder < "u" ? (he = new TextDecoder(), he) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (he = { decode: (r) => Buffer.from(r).toString("utf8") }, he) : (he = !1, null);
}
const Ie = (r) => {
  if (r instanceof Uint8Array) return r;
  if (ArrayBuffer.isView(r)) return new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
  if (r instanceof ArrayBuffer) return new Uint8Array(r);
  const e = JSON.stringify(r), t = Dt();
  if (t && typeof t.encode == "function") return t.encode(e);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, Qe = (r) => {
  let e;
  if (r instanceof Uint8Array) e = r;
  else if (ArrayBuffer.isView(r)) e = new Uint8Array(r.buffer, r.byteOffset, r.byteLength);
  else if (r instanceof ArrayBuffer) e = new Uint8Array(r);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(r))
    e = new Uint8Array(r);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  const t = Ut();
  if (t && typeof t.decode == "function") return JSON.parse(t.decode(e));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(e));
  throw new Error("No TextDecoder or Buffer available to decode object");
};
class jt {
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
    weightFn: i = () => 1,
    defaultTTL: n = 6e4,
    maxPoolSize: s = 1e3,
    rejectOversized: o = !1,
    onEvict: a = null,
    onExpire: l = null,
    initialPoolSize: u = 0,
    maxCleanupPerTick: g = 100,
    eagerCleanupOnRead: d = !1
  } = {}) {
    this.maxEntries = e, this.maxWeight = t, this.weightFn = i, this.defaultTTL = n, this.maxPoolSize = s, this.rejectOversized = !!o, this.onEvict = typeof a == "function" ? a : null, this.onExpire = typeof l == "function" ? l : null, this.maxCleanupPerTick = Number.isFinite(+g) ? Math.max(1, +g) : 100, this.eagerCleanupOnRead = !!d, this.map = /* @__PURE__ */ new Map(), this.head = null, this.tail = null, this.pool = [];
    for (let v = 0; v < Math.min(u || 0, this.maxPoolSize); v++)
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
  _allocNode(e, t, i, n) {
    const s = this.pool.pop() || {
      key: null,
      value: null,
      weight: 0,
      expiresAt: 0,
      prev: null,
      next: null
    };
    return s.key = e, s.value = t, s.weight = i || 0, s.expiresAt = n || 0, s.prev = null, s.next = null, s;
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
  _removeExpiredNode(e, t, i = !1) {
    if (!e || !e.expiresAt || e.expiresAt > t) return !1;
    const n = e.key, s = e.value, o = e.next;
    this.map.delete(n), this.currentWeight -= e.weight || 0, this._cleanupCursor === e && (this._cleanupCursor = o), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e);
    try {
      this.onExpire && this.onExpire(n, s);
    } catch {
    }
    return this._freeNode(e), i && this.misses++, this.expirations++, !0;
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
  _fetchValidNode(e, { ignoreExpiry: t = !1, countMiss: i = !1, allowExpired: n = !1 } = {}) {
    const s = this.map.get(e);
    return s ? !t && s.expiresAt && s.expiresAt <= Date.now() ? n ? s : (this._removeExpiredNode(s, Date.now(), i), null) : s : (i && this.misses++, null);
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
  _refreshStaleEntry(e, t, { ttl: i = void 0, weight: n = void 0 } = {}) {
    if (this._inflightPromises.has(e)) return;
    let s;
    try {
      s = Promise.resolve().then(() => t());
    } catch {
      return;
    }
    const o = s.then(
      (a) => {
        try {
          this.set(e, a, { ttl: i, weight: n });
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
   * \`prev\`/\`next\` references are updated on neighbors and the node's links
   * are nulled. Does not modify \`this.map\` or bookkeeping counters; callers
   * are responsible for those actions.
   *
   * @private
   * @param {CacheNode} node - Node to unlink from the list.
   * @returns {void}
   */
  _remove(e) {
    const t = e.prev, i = e.next;
    t ? t.next = i : this.head = i, i ? i.prev = t : this.tail = t, e.prev = e.next = null;
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
      const t = e.next, i = e.key, n = e.value;
      this._cleanupCursor === e && (this._cleanupCursor = t), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e), this.map.delete(i), this.currentWeight -= e.weight || 0, this.evictions++;
      try {
        this.onEvict && this.onEvict(i, n, "evicted");
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
  set(e, t, { ttl: i = this.defaultTTL, weight: n = null } = {}) {
    const s = Date.now(), o = i == null || i === 1 / 0 ? 0 : s + i;
    let a;
    if (n != null)
      a = n;
    else {
      try {
        a = this.weightFn(t);
      } catch {
        a = 0;
      }
      a == null && (a = 0);
    }
    const l = Number.isFinite(+a) ? Math.max(0, +a) : 0;
    if (this.rejectOversized && Number.isFinite(this.maxWeight) && l > this.maxWeight) {
      this.rejected++;
      try {
        this.onEvict && this.onEvict(e, t, "rejected-oversized");
      } catch {
      }
      return !1;
    }
    if (this.map.has(e)) {
      const u = this.map.get(e);
      this.currentWeight -= u.weight || 0, u.value = t, u.weight = l, u.expiresAt = o, this.currentWeight += u.weight || 0, this._moveToTail(u);
    } else {
      const u = this._allocNode(e, t, l, o);
      this.map.set(e, u), this._append(u), this.currentWeight += u.weight || 0, this._evictIfNeeded();
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
  getOrSet(e, t, { ttl: i = void 0, weight: n = void 0, staleWhileRevalidate: s = !1 } = {}) {
    const o = Date.now(), a = this._fetchValidNode(e, {
      countMiss: !1,
      allowExpired: s
    });
    if (a)
      if (a.expiresAt && a.expiresAt <= o) {
        if (typeof t == "function")
          return this._moveToTail(a), this.hits++, this._refreshStaleEntry(e, t, { ttl: i, weight: n }), a.value;
        this._removeExpiredNode(a, o, !0);
      } else
        return this._moveToTail(a), this.hits++, a.value;
    else
      this.misses++;
    if (typeof t == "function") {
      const l = t();
      return l && typeof l.then == "function" ? l.then((u) => {
        try {
          this.set(e, u, { ttl: i, weight: n });
        } catch {
        }
        return u;
      }) : (this.set(e, l, { ttl: i, weight: n }), l);
    }
    return this.set(e, t, { ttl: i, weight: n }), t;
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
  setMany(e, { ttl: t = void 0, weight: i = void 0 } = {}) {
    const n = Date.now(), s = t == null || t === 1 / 0 ? 0 : n + t;
    for (const o of e) {
      if (!o) continue;
      const [a, l] = o;
      let u;
      if (i != null) u = i;
      else {
        try {
          u = this.weightFn(l);
        } catch {
          u = 0;
        }
        u == null && (u = 0);
      }
      const g = Number.isFinite(+u) ? Math.max(0, +u) : 0;
      if (this.map.has(a)) {
        const d = this.map.get(a);
        this.currentWeight -= d.weight || 0, d.value = l, d.weight = g, d.expiresAt = s, this.currentWeight += d.weight || 0, this._moveToTail(d);
      } else {
        const d = this._allocNode(a, l, g, s);
        this.map.set(a, d), this._append(d), this.currentWeight += d.weight || 0;
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
    const i = /* @__PURE__ */ new Map();
    for (const n of e) {
      const s = this._fetchValidNode(n, { ignoreExpiry: t, countMiss: !0 });
      s && (this._moveToTail(s), this.hits++, i.set(n, s.value));
    }
    return i;
  }
  /**
   * Touch an entry: update its recency and optionally refresh TTL without
   * reading or modifying the stored value.
   * @param {*} key
   * @param {number} [ttl] - Optional per-call TTL in ms. Use \`null\`/\`Infinity\` to disable expiry.
   * @returns {boolean} True if the entry existed (and was not expired), false otherwise.
   */
  touch(e, t = void 0) {
    const i = this._fetchValidNode(e);
    if (!i) return !1;
    const n = Date.now();
    return t !== void 0 && (i.expiresAt = t == null || t === 1 / 0 ? 0 : n + t), this._moveToTail(i), !0;
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
  getOrSetAsync(e, t, { ttl: i = void 0, weight: n = void 0, staleWhileRevalidate: s = !1 } = {}) {
    if (typeof t != "function")
      return Promise.resolve(this.getOrSet(e, t, { ttl: i, weight: n }));
    const o = Date.now(), a = this.map.get(e);
    if (a)
      if (a.expiresAt && a.expiresAt <= o) {
        if (s)
          return this._moveToTail(a), this.hits++, this._refreshStaleEntry(e, t, { ttl: i, weight: n }), Promise.resolve(a.value);
        this._removeExpiredNode(a, o, !1);
      } else
        return this._moveToTail(a), this.hits++, Promise.resolve(a.value);
    if (this._inflightPromises.has(e)) return this._inflightPromises.get(e);
    this.misses++;
    let l;
    try {
      l = Promise.resolve().then(() => t());
    } catch (g) {
      return Promise.reject(g);
    }
    const u = l.then(
      (g) => {
        try {
          this.set(e, g, { ttl: i, weight: n });
        } catch {
        }
        return this._inflightPromises.delete(e), g;
      },
      (g) => {
        throw this._inflightPromises.delete(e), g;
      }
    );
    return this._inflightPromises.set(e, u), u;
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
  hasEqual(e, t, { ignoreExpiry: i = !1, seen: n = void 0 } = {}) {
    const s = this._fetchValidNode(e, { ignoreExpiry: i });
    if (!s) return !1;
    const o = s.value;
    return o === t ? !0 : typeof o !== "object" || o === null || typeof t !== "object" || t === null ? o === t : xe(o, t, n);
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
  hasEqualWithSeen(e, t, i, { ignoreExpiry: n = !1 } = {}) {
    return this.hasEqual(e, t, { ignoreExpiry: n, seen: i });
  }
  /**
   * Delete an entry from the cache.
   * @param {*} key
   * @returns {boolean} true if the key was removed.
   */
  delete(e) {
    const t = this.map.get(e);
    if (!t) return !1;
    const i = t.next;
    this.map.delete(e), this.currentWeight -= t.weight || 0, this._cleanupCursor === t && (this._cleanupCursor = i), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(t);
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
    let i = 0, n = this._cleanupCursor && this._cleanupCursorValid ? this._cleanupCursor : this.head;
    for (; n && i < e; ) {
      const s = n.next;
      if (n.expiresAt && n.expiresAt <= t) {
        const o = n.key, a = n.value;
        this.map.delete(o), this.currentWeight -= n.weight || 0, this._cleanupCursor === n && (this._cleanupCursor = s), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(n);
        try {
          this.onExpire && this.onExpire(o, a);
        } catch {
        }
        this._freeNode(n), this.expirations++;
      }
      n = s, i++;
    }
    return this._cleanupCursor = n || this.head, this._cleanupCursorValid = !!this._cleanupCursor, i;
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
    let t, i;
    typeof e == "number" ? (t = e, i = this.maxCleanupPerTick) : (t = Number.isFinite(+e.interval) ? +e.interval : Math.max(1e3, Math.min(this.defaultTTL || 6e4, 6e4)), i = Number.isFinite(+e.maxCleanupPerTick) ? Math.max(1, +e.maxCleanupPerTick) : this.maxCleanupPerTick), this.stopCleanup(), this._cleanupParams = { interval: t, maxCleanupPerTick: i }, this._cleanupTimer = setTimeout(() => this._cleanupTick(), t);
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
function xe(r, e, t = void 0) {
  if (r === e) return !0;
  if (r == null || e == null || typeof r !== "object" || typeof e !== "object") return r === e;
  t || (t = /* @__PURE__ */ new WeakMap());
  let s = t.get(r);
  if (s && s.has(e)) return !0;
  if (s || (s = /* @__PURE__ */ new WeakSet(), t.set(r, s)), s.add(e), Object.getPrototypeOf(r) !== Object.getPrototypeOf(e)) return !1;
  if (typeof Uint8Array < "u" && r instanceof Uint8Array) {
    if (!(e instanceof Uint8Array) || r.length !== e.length) return !1;
    for (let l = 0; l < r.length; l++) if (r[l] !== e[l]) return !1;
    return !0;
  }
  if (Array.isArray(r)) {
    if (!Array.isArray(e) || r.length !== e.length) return !1;
    for (let l = 0; l < r.length; l++) if (!xe(r[l], e[l], t)) return !1;
    return !0;
  }
  if (ArrayBuffer.isView(r)) {
    if (!ArrayBuffer.isView(e) || r.byteLength !== e.byteLength) return !1;
    const l = new Uint8Array(r.buffer, r.byteOffset || 0, r.byteLength), u = new Uint8Array(e.buffer, e.byteOffset || 0, e.byteLength);
    for (let g = 0; g < l.length; g++) if (l[g] !== u[g]) return !1;
    return !0;
  }
  if (r instanceof ArrayBuffer) {
    if (!(e instanceof ArrayBuffer) || r.byteLength !== e.byteLength) return !1;
    const l = new Uint8Array(r), u = new Uint8Array(e);
    for (let g = 0; g < l.length; g++) if (l[g] !== u[g]) return !1;
    return !0;
  }
  if (r instanceof Date)
    return e instanceof Date ? r.getTime() === e.getTime() : !1;
  if (r instanceof RegExp)
    return e instanceof RegExp ? r.toString() === e.toString() : !1;
  if (r instanceof Map) {
    if (!(e instanceof Map) || r.size !== e.size) return !1;
    for (const [l, u] of r)
      if (!e.has(l) || !xe(u, e.get(l), t)) return !1;
    return !0;
  }
  if (r instanceof Set) {
    if (!(e instanceof Set) || r.size !== e.size) return !1;
    let l = !0;
    for (const u of r)
      if (u !== null && typeof u == "object") {
        l = !1;
        break;
      }
    if (l) {
      for (const u of r) if (!e.has(u)) return !1;
      return !0;
    }
    for (const u of r) {
      let g = !1;
      for (const d of e)
        if (xe(u, d, t)) {
          g = !0;
          break;
        }
      if (!g) return !1;
    }
    return !0;
  }
  const o = Object.keys(r), a = Object.keys(e);
  if (o.length !== a.length) return !1;
  for (let l = 0; l < o.length; l++) {
    const u = o[l];
    if (!Object.prototype.hasOwnProperty.call(e, u) || !xe(r[u], e[u], t)) return !1;
  }
  return !0;
}
class ie {
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
      keyResolver: i = (...a) => JSON.stringify(a),
      cacheOptions: n = {},
      ttl: s,
      weight: o
    } = t;
    if (this.keyResolver = typeof i == "function" ? i : (...a) => JSON.stringify(a), this.cache = new jt(n), this._inflight = /* @__PURE__ */ new Map(), this._defaultMemoizeOptions = {}, s !== void 0 && (this._defaultMemoizeOptions.ttl = s), o !== void 0 && (this._defaultMemoizeOptions.weight = o), typeof e == "function") {
      const a = this._memoize(e, this._defaultMemoizeOptions);
      a.get = (...l) => this.get(...l), a.has = (...l) => this.has(...l), a.delete = (...l) => this.delete(...l), a.clear = () => this.clear(), a.stats = () => this.stats(), a.cache = this.cache, a.original = e;
      try {
        Object.setPrototypeOf(a, ie.prototype), a.constructor = ie;
      } catch {
      }
      return a;
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
  _memoize(e, { ttl: t, weight: i } = {}) {
    if (typeof e != "function") throw new TypeError("fn must be a function");
    const n = this;
    return function(...o) {
      const a = n.keyResolver(...o);
      if (n.cache.has(a)) return n.cache.get(a);
      if (n._inflight.has(a)) return n._inflight.get(a);
      const l = e(...o);
      if (l && typeof l.then == "function") {
        const u = l.then(
          (g) => {
            try {
              n.cache.set(a, g, { ttl: t, weight: i });
            } catch {
            }
            return n._inflight.delete(a), g;
          },
          (g) => {
            throw n._inflight.delete(a), g;
          }
        );
        return n._inflight.set(a, u), u;
      }
      return n.cache.set(a, l, { ttl: t, weight: i }), l;
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
    const i = t && (Object.prototype.hasOwnProperty.call(t, "ttl") || Object.prototype.hasOwnProperty.call(t, "weight")) ? t : this._defaultMemoizeOptions, n = this._memoize(e, i);
    n.get = (...s) => this.get(...s), n.has = (...s) => this.has(...s), n.delete = (...s) => this.delete(...s), n.clear = () => this.clear(), n.stats = () => this.stats(), n.cache = this.cache, n.original = e;
    try {
      Object.setPrototypeOf(n, ie.prototype), n.constructor = ie;
    } catch {
    }
    return n;
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
let Re = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function")
  try {
    const r = Number(process.hrtime.bigint() / 1000000n);
    Re = Date.now() - r;
  } catch {
    Re = null;
  }
const Y = () => {
  const r = Date.now();
  if (typeof performance < "u" && typeof performance.now == "function" && typeof performance.timeOrigin == "number")
    try {
      const e = performance.timeOrigin + performance.now();
      return Math.abs(e - r) < 1e3 ? e : r;
    } catch {
    }
  if (Re != null)
    try {
      const e = Number(process.hrtime.bigint() / 1000000n) + Re;
      return Math.abs(e - r) < 1e3 ? e : r;
    } catch {
      return r;
    }
  return r;
};
class Le {
  /**
   * @typedef {Object} PowerQueueOptions
   * @property {number} [initialCapacity]
   */
  /**
   * Create a PowerQueue.
   * @param {number} [initialCapacity=16] Initial capacity (rounded up to power-of-two).
   */
  constructor(e = 16) {
    const t = Math.max(2, Number(e) || 16);
    for (this._capacity = 1; this._capacity < t; ) this._capacity <<= 1;
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
   * @returns {any|undefined} The dequeued item or \`undefined\` when empty.
   */
  shift() {
    if (this._size === 0) return;
    const e = this._buffer[this._head];
    return this._buffer[this._head] = void 0, this._head = this._head + 1 & this._mask, this._size--, e;
  }
  /**
   * Peek at the head item without removing it.
   * @returns {any|undefined} The head item or \`undefined\` when empty.
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
    for (let t = 0; t < this._size; t++)
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
   * Allows \`for...of\` and spread (\`[...queue]\`) without consuming the queue.
   */
  *[Symbol.iterator]() {
    let e = this._head;
    for (let t = 0; t < this._size; t++)
      yield this._buffer[e + t & this._mask];
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
    for (let t = 0; t < this._size; t++)
      e[t] = this._buffer[this._head + t & this._mask];
    return e;
  }
  /**
   * Internal: double internal buffer capacity and reindex elements.
   *
   * This private helper allocates a new backing array with double the
   * previous capacity, copies items in logical order starting from \`this._head\`,
   * and resets internal indices so the queue remains contiguous.
   *
   * @private
   * @returns {void}
   */
  _grow() {
    const e = this._buffer, i = this._capacity << 1, n = new Array(i);
    for (let s = 0; s < this._size; s++)
      n[s] = e[this._head + s & this._mask];
    this._buffer = n, this._capacity = i, this._mask = i - 1, this._head = 0, this._tail = this._size & this._mask;
  }
  /**
   * Enqueue multiple items in one call. Optimized to resize buffer once and
   * copy items in contiguous blocks when possible.
   * @param {Array<any>} items
   * @returns {number} New queue length after all pushes.
   */
  pushMany(e) {
    if (!Array.isArray(e) || e.length === 0) return this._size;
    const t = this._size + e.length;
    for (; this._capacity < t; ) this._grow();
    const i = Math.min(e.length, this._capacity - this._tail);
    for (let s = 0; s < i; s++)
      this._buffer[this._tail + s] = e[s];
    this._tail = this._tail + i & this._mask;
    let n = i;
    for (; n < e.length; ) {
      const s = Math.min(e.length - n, this._capacity - this._tail);
      for (let o = 0; o < s; o++)
        this._buffer[this._tail + o] = e[n + o];
      this._tail = this._tail + s & this._mask, n += s;
    }
    return this._size = t, this._size;
  }
  /**
   * Prepend multiple items to the head of the queue.
   * The first element of \`items\` will become the next value returned by \`shift()\`.
   * @param {Array<any>} items
   * @returns {number} New queue length after all unshifts.
   */
  unshiftMany(e) {
    if (!Array.isArray(e) || e.length === 0) return this._size;
    const t = this._size + e.length;
    for (; this._capacity < t; ) this._grow();
    let i = this._head - e.length & this._mask;
    for (let n = 0; n < e.length; n++)
      this._buffer[i + n & this._mask] = e[n];
    return this._head = i, this._size = t, this._size;
  }
}
function Gt(r, e = "ERR_ITEM") {
  return !r || typeof r != "object" ? {
    error: !0,
    code: e,
    message: r ? String(r) : void 0,
    stack: void 0
  } : {
    error: !0,
    code: r.code || e,
    message: r.message,
    stack: r.stack
  };
}
function at(r) {
  return !r || !r.error ? String(r) : \`\${r.code || "ERR"}: \${r.message || ""}\`;
}
const Vt = () => typeof globalThis < "u" && globalThis && globalThis.console ? globalThis.console : typeof self < "u" && self && self.console ? self.console : typeof window < "u" && window && window.console ? window.console : typeof global < "u" && global && global.console ? global.console : null, Q = Vt();
class nt {
  /**
   * Create a PowerLogger instance.
   * @param {number} [level=0] Initial debug level (0..3)
   * @param {Object} [options]
   * @param {'text'|'json'} [options.format='text'] Output format. When 'json', logger emits JSON.stringify({ level, msg, ts, format, name }).
   */
  constructor(e = 0, t = {}) {
    this._debugLevel = 0, this._counters = /* @__PURE__ */ Object.create(null), this._format = t && t.format || "text", this.name = t && t.name || null, this._formatter = t && typeof t.formatter == "function" ? t.formatter : null, this._output = t && typeof t.output == "function" ? t.output : null, this.setDebugLevel(e);
  }
  /**
   * Set the global debug level.
   * @param {number} level - Integer in range 0..3
   * @returns {void}
   */
  setDebugLevel(e) {
    let t = NaN;
    typeof e == "number" ? t = e : typeof e == "string" || typeof e == "boolean" ? t = Number(e) : (e instanceof Number || e instanceof String || e instanceof Boolean) && (t = Number(e.valueOf())), this._debugLevel = Number.isFinite(t) && t >= 0 ? Math.max(0, Math.min(3, Math.floor(t))) : 0;
  }
  /**
   * Get the current debug level.
   * @returns {number} The configured debug level (0..3)
   */
  getDebugLevel() {
    return this._debugLevel;
  }
  /**
   * Determine whether the current debug level is >= \`level\`.
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
    return e.map((t) => {
      if (typeof t == "function")
        try {
          return t();
        } catch (i) {
          return i;
        }
      return t;
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
  _emit(e, t, i, n, s = {}) {
    if (!this.isDebugLevel(e)) return;
    const o = this._resolveLogArgs(n), a = s.msgArray ? o : o.length === 1 ? o[0] : o;
    let l = { level: i, msg: a, ts: Y(), format: this._format };
    if (this.name && (l.name = this.name), this._formatter)
      try {
        const u = this._formatter(l);
        if (u != null) {
          if (typeof u == "string") {
            if (this._output) {
              try {
                this._output(u);
              } catch {
              }
              return;
            }
            Q && typeof Q[t] == "function" && Q[t](u);
            return;
          }
          l = u;
        }
      } catch {
      }
    if (this._output) {
      try {
        this._output(l);
      } catch {
      }
      return;
    }
    if (!(!Q || typeof Q[t] != "function"))
      if (this._format === "json")
        try {
          const u = typeof l == "string" ? l : JSON.stringify(l);
          Q[t](u);
        } catch {
          Q[t](...Array.isArray(o) ? o : [o]);
        }
      else
        Q[t](...o);
  }
  /**
   * Log an error-level message when debug level is >= 1.
   * Accepts values or functions (lazy evaluated).
   * @param {...any} args
   * @returns {void}
   */
  error(...e) {
    const t = e.map((i) => {
      try {
        if (i && i.error) return at(i);
        if (i instanceof Error || i && typeof i == "object")
          return at(Gt(i));
      } catch {
      }
      return i;
    });
    this._emit(1, "error", "error", t);
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
   * Log using \`console.debug\` when level >= 3 (alias for verbose debug output).
   * Supports JSON mode similar to other methods.
   */
  debug(...e) {
    this._emit(3, "debug", "debug", e);
  }
  /**
   * Display tabular data. Uses \`console.table\` when available.
   * In JSON mode emits \`{ level: 'table', msg: args, ts }\` where \`msg\` is an array of arguments.
   */
  table(...e) {
    if (!this.isDebugLevel(3) || !Q) return;
    if (this._format === "json") {
      this._emit(3, "log", "table", e, { msgArray: !0 });
      return;
    }
    const t = this._resolveLogArgs(e);
    typeof Q.table == "function" ? Q.table(...t) : typeof Q.log == "function" && Q.log(...t);
  }
  /**
   * Increment an internal named counter (no-op when debug is disabled).
   * Useful for lightweight instrumentation in tests.
   * @param {string} name
   * @returns {void}
   */
  incrementCounter(e) {
    if (!this.isDebug()) return;
    const t = String(e || "");
    t && (this._counters[t] = (this._counters[t] || 0) + 1);
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
const $t = /* @__PURE__ */ Symbol("PowerSubscriberSet.original");
class de {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.weak=false]
   * @param {number} [options.maxListeners=0]
   */
  constructor(e = {}) {
    const { weak: t = !1, maxListeners: i = 0 } = e || {};
    this._weak = !!t, this._maxListeners = Number.isFinite(Number(i)) ? Math.max(0, Math.floor(Number(i))) : 0, this._listeners = /* @__PURE__ */ new Set(), this._onceMap = /* @__PURE__ */ new WeakMap(), this._finalization = null, this._weak && typeof WeakRef < "u" && typeof FinalizationRegistry < "u" && (this._finalization = new FinalizationRegistry((n) => {
      this._listeners.delete(n.ref);
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
          \`PowerSubscriberSet: adding listener exceeds maxListeners (\${this._maxListeners})\`
        );
      return this._listeners.add(e), () => this.delete(e);
    }
    if (this._maxListeners > 0 && this.size + 1 > this._maxListeners)
      throw new Error(
        \`PowerSubscriberSet: adding listener exceeds maxListeners (\${this._maxListeners})\`
      );
    const t = this._makeEntry(e);
    return this._listeners.add(t), () => this.delete(e);
  }
  /** Add a once listener and return an unsubscribe function. */
  addOnce(e) {
    if (typeof e != "function") throw new TypeError("listener must be a function");
    const t = (...n) => {
      try {
        e(...n);
      } finally {
        this.delete(e);
      }
    };
    try {
      t[$t] = e;
    } catch {
    }
    if (this._onceMap.set(e, t), this._maxListeners > 0 && this.size + 1 > this._maxListeners)
      throw new Error(
        \`PowerSubscriberSet: adding listener exceeds maxListeners (\${this._maxListeners})\`
      );
    const i = this._makeEntry(t);
    return this._listeners.add(i), () => this.delete(e);
  }
  /** Delete a listener by original function or once-wrapper. */
  delete(e) {
    let t = e;
    const i = this._onceMap.get(e);
    i && (t = i, this._onceMap.delete(e));
    for (const n of this._listeners) {
      const s = this._deref(n);
      if (!s) {
        this._listeners.delete(n);
        continue;
      }
      if (s === t)
        return this._listeners.delete(n), this._finalization && typeof n.deref == "function" && this._finalization.unregister(n), !0;
    }
    return !1;
  }
  /** Iterate live listeners in insertion order and invoke a callback. */
  forEach(e) {
    for (const t of this._listeners) {
      const i = this._deref(t);
      if (!i) {
        this._listeners.delete(t);
        continue;
      }
      e(i);
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
    for (const t of this._listeners) {
      const i = this._deref(t);
      i && e.push(i);
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
      const t = new WeakRef(e);
      if (this._finalization)
        try {
          this._finalization.register(e, { ref: t }, t);
        } catch {
        }
      return t;
    }
    return e;
  }
  _deref(e) {
    return e && typeof e.deref == "function" ? e.deref() : e;
  }
}
function Ht(r) {
  if (r) {
    if (typeof r.cleanup == "function") {
      try {
        r.cleanup();
      } catch {
      }
      return;
    }
    if (typeof r._cleanup == "function") {
      try {
        r._cleanup();
      } catch {
      }
      return;
    }
    if (typeof r[Symbol.iterator] == "function" && typeof r.delete == "function")
      for (const e of r)
        (e && typeof e.deref == "function" ? e.deref() : e) || r.delete(e);
  }
}
class Yt {
  /**
   * @param {{maxListeners?: number, weak?: boolean}=} options
   */
  constructor(e = {}) {
    this._listeners = /* @__PURE__ */ new Map(), this._maxListeners = Number.isFinite(Number(e.maxListeners)) ? Math.max(0, Number(e.maxListeners)) : 0, this._weak = !!e.weak, this._fr = null, this._finalizationRefs = /* @__PURE__ */ new WeakMap();
  }
  _ensureFinalizationRegistry() {
    return !this._weak || typeof FinalizationRegistry > "u" ? null : this._fr ? this._fr : (this._fr = new FinalizationRegistry((e) => {
      try {
        const { event: t, ref: i } = e, n = this._listeners.get(t);
        n && typeof n.delete == "function" && n.delete(i.deref ? i.deref() : i);
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
      for (const [e, t] of this._listeners)
        Ht(t), t.size === 0 && this._listeners.delete(e);
  }
  _getBucket(e) {
    let t = this._listeners.get(e);
    if (!t) return null;
    if (t instanceof de) return t;
    if (t && typeof t[Symbol.iterator] == "function") {
      const i = new de({
        maxListeners: this._maxListeners,
        weak: this._weak
      });
      for (const n of t) {
        const s = n && typeof n.deref == "function" ? n.deref() : n;
        s && i.add(s);
      }
      return this._listeners.set(e, i), i;
    }
    return null;
  }
  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {(payload:any)=>void} fn
   * @returns {() => void} unsubscribe
   */
  _registerWeakListener(e, t) {
    const i = this._ensureFinalizationRegistry();
    if (!i || typeof WeakRef > "u") return null;
    const n = new WeakRef(e);
    try {
      i.register(e, { event: t, ref: n }, n), this._finalizationRefs.set(e, n);
    } catch {
      return null;
    }
    return n;
  }
  _unregisterWeakListener(e) {
    if (!this._fr || !this._finalizationRefs.has(e)) return;
    const t = this._finalizationRefs.get(e);
    try {
      this._fr.unregister(t);
    } catch {
    }
    this._finalizationRefs.delete(e);
  }
  on(e, t) {
    if (typeof t != "function") throw new TypeError("listener must be a function");
    let i = this._getBucket(e);
    i || (i = new de({ maxListeners: this._maxListeners, weak: this._weak }), this._listeners.set(e, i));
    const n = i.add(t);
    return this._registerWeakListener(t, e) ? () => {
      n(), this._unregisterWeakListener(t);
    } : n;
  }
  /**
   * Subscribe once to an event. Listener is removed after first invocation.
   * @param {string} event
   * @param {(payload:any)=>void} fn
   * @returns {() => void} unsubscribe
   */
  once(e, t) {
    if (typeof t != "function") throw new TypeError("listener must be a function");
    let i = this._getBucket(e);
    i || (i = new de({ maxListeners: this._maxListeners, weak: this._weak }), this._listeners.set(e, i));
    const n = i.addOnce(t);
    return this._registerWeakListener(t, e) ? () => {
      n(), this._unregisterWeakListener(t);
    } : n;
  }
  /**
   * Remove a specific listener for an event.
   * @param {string} event
   * @param {(payload:any)=>void} fn
   */
  off(e, t) {
    const i = this._getBucket(e);
    i && (i.delete(t), this._unregisterWeakListener(t), i.size === 0 && this._listeners.delete(e));
  }
  /**
   * Emit an event to all subscribers. Returns true if any listeners were notified.
   * Errors thrown by listeners are swallowed.
   * @param {string} event
   * @param {any} [payload]
   * @returns {boolean}
   */
  emit(e, t) {
    const i = this._listeners.get(e);
    if (!i || i.size === 0) return !1;
    if (i instanceof de) {
      let s = !1;
      return i.forEach((o) => {
        s = !0;
        try {
          o(t);
        } catch {
        }
      }), i.size === 0 && this._listeners.delete(e), s;
    }
    const n = i.size > 0;
    for (const s of i) {
      const o = s && typeof s.deref == "function" ? s.deref() : s;
      if (!o) {
        i.delete(s);
        continue;
      }
      try {
        o(t);
      } catch {
      }
    }
    return i.size === 0 && this._listeners.delete(e), n;
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
  async emitAsync(e, t, { concurrency: i = 1 / 0 } = {}) {
    const n = this.listeners(e);
    if (n.length === 0) return !1;
    const s = Number.isFinite(+i) && +i > 0 ? Math.max(1, Math.floor(+i)) : 1 / 0, o = async (u) => {
      try {
        await u(t);
      } catch {
      }
    };
    if (!Number.isFinite(s) || s >= n.length)
      return await Promise.all(n.map(o)), !0;
    let a = 0;
    const l = Array.from({ length: s }, async () => {
      for (; a < n.length; ) {
        const u = n[a++];
        u && await o(u);
      }
    });
    return await Promise.all(l), !0;
  }
  /**
   * Return array of listeners for an event (copy).
   * @param {string} event
   * @returns {Function[]}
   */
  listeners(e) {
    const t = this._listeners.get(e);
    return t ? t instanceof de ? t.values() : Array.from(t).map((i) => i && typeof i.deref == "function" ? i.deref() : i).filter(Boolean) : [];
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
let Xt = class {
  constructor(e, t, i) {
    this._underlying = e, this._logger = t, this._pool = i, this.onmessage = null, this.onerror = null, this.onmessageerror = null;
  }
  postMessage(e, t) {
    let i = e, n = t;
    if (e !== null && typeof e == "object" && !ArrayBuffer.isView(e) && !(e instanceof ArrayBuffer))
      try {
        const o = this._pool._encodeForTransfer(e);
        if (!n || Array.isArray(n) && n.length === 0)
          n = [o.buffer];
        else {
          let a = !1;
          if (Array.isArray(n)) {
            for (let l of n)
              if (l === o.buffer) {
                a = !0;
                break;
              }
            a || (n = [...n, o.buffer]);
          } else if (n.length === 0)
            n = [o.buffer];
          else {
            const l = [];
            for (let u of n)
              l.push(u), u === o.buffer && (a = !0);
            a || l.push(o.buffer), n = l;
          }
        }
        i = o;
      } catch {
        n = t, i = e;
      }
    if (!n && (i instanceof Uint8Array || ArrayBuffer.isView(i))) {
      const o = i.buffer;
      o && o.byteLength > 0 ? n = [o] : n = void 0;
    }
    try {
      n && n.length ? this._underlying.postMessage(i, n) : this._underlying.postMessage(i);
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
class Kt extends Error {
  constructor(e = "PowerPool has been shut down") {
    super(e), this.name = "PowerPoolShutdownError";
  }
}
class Qt {
  /**
   * Create a PowerPool.
   *
   * @param {Function|string} workerSource - A Worker constructor, a worker factory, or a relative path string. If the provided function is not constructable, it is invoked directly; if a string path is provided, the pool attempts to resolve it via \`new URL(path, import.meta.url)\` before falling back to a plain \`Worker(path)\`.
   * @param {PowerPoolOptions=} options
   * @param {number} [options.size] - Initial number of workers to create.
   * @param {number} [options.minSize=1] - Minimum number of workers to keep alive.
   * @param {number} [options.maxSize] - Maximum number of workers allowed in the pool. The pool coerces this value to be at least \`minSize\`.
   * @param {Object} [options.workerOptions] - Options forwarded to the Worker constructor when using a string path.
   * @param {number} [options.maxTasksPerWorker=Infinity] - Soft capacity per worker before considering it busy.
   * @param {number} [options.idleTimeout=60000] - Milliseconds after which idle workers (beyond \`minSize\`) will be terminated.
   * @param {boolean} [options.taskQueue=true] - Whether to queue tasks when all workers are busy.
   * @param {'enqueue'|'drop-oldest'|'drop-newest'|'reject'} [options.queuePolicy='enqueue'] - Queue overflow behavior when the pool is saturated.
   * @param {boolean} [options.lazy=true] - If true, defer creating workers up to \`size\` until demand; only \`minSize\` workers are created at construction.
   */
  constructor(e, t = {}) {
    const i = typeof navigator < "u" && navigator.hardwareConcurrency || 2, {
      size: n = Math.min(i, 2),
      minSize: s = 2,
      maxSize: o = Math.max(n, i),
      workerOptions: a = {},
      maxTasksPerWorker: l = 1 / 0,
      idleTimeout: u = 6e4,
      taskQueue: g = !0,
      queuePolicy: d = "enqueue",
      lazy: v = !0
    } = t;
    this._workerSource = e, this._workerOptions = a, this._maxTasksPerWorker = l, this.minSize = Math.max(0, s), this.maxSize = Math.max(this.minSize, o), this.idleTimeout = Math.max(0, u), this.taskQueueEnabled = !!g, this._queuePolicy = ["enqueue", "drop-oldest", "drop-newest", "reject"].includes(d) ? d : "enqueue", this._createdAt = Y(), this._totalWorkersCreated = 0, this._totalTasksCompleted = 0, this._taskDurationsWelfordCount = 0, this._taskDurationsWelfordMean = 0, this._taskDurationsWelfordM2 = 0, this._taskDurationsMin = Number.POSITIVE_INFINITY, this._taskDurationsMax = Number.NEGATIVE_INFINITY, this._ewmaLatency = null, this._autoScale = null, this._autoScaleInterval = null, this._lastAutoScaleAt = null, this._terminatedWorkerTaskCountsTotal = 0, this._terminatedWorkerTaskCountsCount = 0, this.workers = [], this.queue = new Le();
    const S = {
      maxListeners: t && (t.listenerMaxListeners ?? t.maxListeners),
      weak: t && !!t.weakListeners
    };
    this._bus = new Yt(S), this._queueHighThreshold = Number.isFinite(Number(t && t.queueHighThreshold)) ? Math.max(0, Math.floor(Number(t.queueHighThreshold))) : 1 / 0, this._queueHighCrossed = !1, this._onmessage = null, this._onerror = null, this._onidle = null, this._onresize = null, this._nextIndex = 0, this._nextWorkerId = 0, this._activeTasks = 0, this._isIdle = !0;
    const P = t && typeof t.debugLevel == "number" ? t.debugLevel : 1;
    this._logger = new nt(P, { name: "powerPool" }), this._pendingResponses = /* @__PURE__ */ new Map(), this._underlyingToWorkerObj = /* @__PURE__ */ new Map();
    const A = v ? Math.min(this.minSize, this.maxSize) : Math.min(Math.max(n, this.minSize), this.maxSize);
    for (let E = 0; E < A; E++) this._addWorkerInstance();
    if (this._reaperInterval = setInterval(
      () => this._reapIdleWorkers(),
      Math.max(1e3, Math.floor(this.idleTimeout / 2))
    ), this._encodeCache = /* @__PURE__ */ new Map(), this._encodeCacheLimit = Math.max(
      16,
      t && t.encodeCacheLimit ? t.encodeCacheLimit : 64
    ), this._encodeCacheByteLimit = Number.isFinite(t && Number(t.encodeCacheByteLimit)) ? Math.max(0, Number(t.encodeCacheByteLimit)) : 1 / 0, this._encodeCacheBytes = 0, t && t.autoScale) {
      const E = typeof t.autoScale == "object" ? t.autoScale : {}, N = Number.isFinite(Number(E.intervalMs)) ? Math.max(100, Math.floor(E.intervalMs)) : 1e3, M = Number.isFinite(Number(E.targetMs)) ? Math.max(1, Number(E.targetMs)) : 50, j = Number.isFinite(Number(E.alpha)) ? Math.max(0, Math.min(1, Number(E.alpha))) : 0.2, G = Number.isFinite(Number(E.cooldownMs)) ? Math.max(0, Math.floor(E.cooldownMs)) : 5e3, W = Number.isFinite(Number(E.hysteresis)) ? Math.max(0, Math.min(1, Number(E.hysteresis))) : 0.2, R = Number.isFinite(Number(E.stepUp)) ? Math.max(1, Math.floor(Number(E.stepUp))) : 1, q = Number.isFinite(Number(E.stepDown)) ? Math.max(1, Math.floor(Number(E.stepDown))) : 1, h = Number.isFinite(Number(E.backoffFactor)) ? Math.max(1, Number(E.backoffFactor)) : 1, c = Number.isFinite(Number(E.backoffMaxMultiplier)) ? Math.max(1, Number(E.backoffMaxMultiplier)) : 8, f = Number.isFinite(Number(E.backoffResetMs)) ? Math.max(0, Math.floor(Number(E.backoffResetMs))) : G * 4;
      this._autoScale = {
        enabled: !0,
        intervalMs: N,
        targetMs: M,
        alpha: j,
        cooldownMs: G,
        hysteresis: W,
        stepUp: R,
        stepDown: q,
        backoffFactor: h,
        backoffMaxMultiplier: c,
        backoffResetMs: f
      }, this._autoScaleBackoffMultiplier = 1;
      try {
        this._autoScaleInterval = setInterval(() => this._autoScaleTick(), N);
      } catch {
      }
    }
  }
  /* Node crypto dynamic import removed to avoid bundler externalization. */
  /**
   * Log debug information about swallowed errors when debug logging is enabled.
   * @private
   */
  _debugLog(e, t) {
    try {
      this && this._logger && typeof this._logger.debug == "function" && (e ? this._logger.debug(e, t || "swallowed error") : this._logger.debug(t || "swallowed error"));
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
            rejectWith: new Kt("pool:shutdown")
          });
        } catch (t) {
          this._debugLog && this._debugLog(t, "shutdown: cleanup pending response");
        }
    } catch (e) {
      this._debugLog && this._debugLog(e, "shutdown: iterate pending responses");
    }
    try {
      for (const e of this.workers)
        try {
          e.worker.terminate();
        } catch (t) {
          this._debugLog && this._debugLog(t, "shutdown: terminate worker");
        }
    } catch (e) {
      this._debugLog && this._debugLog(e, "shutdown: terminate workers loop");
    }
    try {
      this._underlyingToWorkerObj && this._underlyingToWorkerObj.clear();
    } catch {
    }
    try {
      const e = this.workers.map((t) => t && t.id).filter((t) => t != null);
      e && e.length && this._bus.emit("pool:scale", {
        action: "remove",
        terminated: e,
        count: e.length
      });
    } catch (e) {
      this._debugLog && this._debugLog(e, "shutdown: pool scale emit error");
    }
    this.workers = [], this.queue = new Le(), this._activeTasks = 0;
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
      const t = JSON.stringify(e);
      if (typeof t == "string" && t.length > 2048)
        return Ie(e);
      const i = this._encodeCache.get(t);
      if (i) {
        try {
          this._encodeCache.delete(t), this._encodeCache.set(t, i);
        } catch {
        }
        return i;
      }
      const n = Ie(e), s = n && n.byteLength || 0, o = () => this._encodeCache.size >= this._encodeCacheLimit || this._encodeCacheByteLimit !== 1 / 0 && this._encodeCacheBytes + s > this._encodeCacheByteLimit;
      for (; o(); ) {
        const a = this._encodeCache.keys().next().value;
        if (!a) break;
        try {
          const l = this._encodeCache.get(a);
          l && l.byteLength && (this._encodeCacheBytes = Math.max(0, this._encodeCacheBytes - l.byteLength));
        } catch {
        }
        this._encodeCache.delete(a);
      }
      return this._encodeCache.set(t, n), n && n.byteLength && (this._encodeCacheBytes += n.byteLength), n;
    } catch {
      return Ie(e);
    }
  }
  /**
   * Prepare a transferable Uint8Array for the given object.
   * Returns a new Uint8Array when \`clone\` is true (safe to transfer), or
   * the cached Uint8Array when \`clone\` is false (do not transfer the returned buffer).
   * @param {Object} obj
   * @param {{clone?:boolean}=} options
   * @returns {Uint8Array}
   */
  prepareBuffer(e, t = {}) {
    const { clone: i = !0 } = t, n = this._encodeForTransfer(e);
    return i ? n.slice() : n;
  }
  /**
   * Prepare an array of transferable buffers for a batch of items.
   * Each item may be a plain object, a TypedArray/ArrayBuffer view, or
   * an object \`{ message, transfer? }\`. The returned array contains
   * normalized \`{ message, transfer }\` entries ready for \`postMessageBatch\`.
   * By default each buffer is a cloned Uint8Array safe to transfer; pass
   * \`{ clone: false }\` to return references to internal cached buffers
   * (do NOT transfer those buffers if \`clone:false\`).
   *
   * @param {Array<any|{message:any,transfer?:Transferable[]}>} items
   * @param {{clone?:boolean}=} options
   * @returns {{message:*,transfer:Transferable[]|undefined}[]}
   */
  prepareBuffers(e, t = {}) {
    if (!Array.isArray(e)) throw new Error("prepareBuffers expects an array");
    const { clone: i = !0, zeroCopy: n = !1 } = t, s = new Array(e.length);
    for (let o = 0; o < e.length; o++) {
      const a = e[o] && typeof e[o] == "object" && "message" in e[o] ? e[o] : { message: e[o] }, l = a.message, u = a.transfer;
      if (u) {
        s[o] = { message: l, transfer: u };
        continue;
      }
      if (l !== null && typeof l == "object" && !ArrayBuffer.isView(l) && !(l instanceof ArrayBuffer)) {
        if (n) {
          s[o] = { message: l, transfer: void 0 };
          continue;
        }
        try {
          const d = this._encodeForTransfer(l);
          if (i) {
            const v = d.slice();
            s[o] = { message: v, transfer: [v.buffer] };
          } else
            s[o] = { message: d, transfer: void 0 };
          continue;
        } catch {
          s[o] = { message: l, transfer: void 0 };
          continue;
        }
      }
      if (l instanceof ArrayBuffer || ArrayBuffer.isView(l)) {
        const d = l instanceof ArrayBuffer ? l : l.buffer;
        s[o] = { message: l, transfer: [d] };
        continue;
      }
      s[o] = { message: l, transfer: void 0 };
    }
    return s;
  }
  /**
   * Class-level helper to prepare a message and optional transfer list for posting to a worker.
   * Accepts \`opts\` with \`zeroCopy\` flag to control forwarding of raw buffers.
   * @private
   */
  _prepareForTransfer(e, t, i) {
    const n = i && !!i.zeroCopy;
    if (e !== null && typeof e == "object" && !ArrayBuffer.isView(e) && !(e instanceof ArrayBuffer)) {
      if (n) return { message: e, transfer: t };
      try {
        const a = this._encodeForTransfer(e).slice();
        let l = t;
        if (!l || Array.isArray(l) && l.length === 0)
          l = [a.buffer];
        else if (Array.isArray(l)) {
          let u = !1;
          for (const g of l)
            if (g === a.buffer) {
              u = !0;
              break;
            }
          u || (l = [...l, a.buffer]);
        } else if (l.length === 0)
          l = [a.buffer];
        else {
          const u = [];
          let g = !1;
          for (const d of l)
            u.push(d), d === a.buffer && (g = !0);
          g || u.push(a.buffer), l = u;
        }
        return { message: a, transfer: l };
      } catch {
        return { message: e, transfer: t };
      }
    }
    if (e instanceof Uint8Array || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) {
      const o = e instanceof ArrayBuffer ? e : e.buffer;
      if (o && o.byteLength === 0)
        try {
          const a = e instanceof ArrayBuffer ? e.slice(0) : new Uint8Array(e);
          return { message: a, transfer: [a.buffer] };
        } catch {
          return { message: e, transfer: void 0 };
        }
      return { message: e, transfer: [o] };
    }
    return { message: e, transfer: t };
  }
  /**
   * Decrement the global active task counter safely.
   * Ensures the counter never goes negative and centralizes error handling.
   * @private
   * @param {number} [n=1]
   */
  _decrementActiveTasks(e = 1) {
    try {
      const t = Number.isFinite(Number(e)) ? Math.max(0, Math.floor(Number(e))) : 1;
      this._activeTasks = Math.max(0, this._activeTasks - t);
    } catch {
      this._activeTasks = 0;
    }
  }
  /**
   * Resize the pool's maximum size at runtime.
   * If \`n\` is smaller than the current number of workers, extra workers
   * will be terminated (keeps at least \`minSize\`). If \`n\` is larger,
   * the pool may grow up to the new limit when demand increases.
   * @param {number} n - New maximum pool size.
   */
  resize(e) {
    let t = this.minSize, i = this.maxSize;
    if (e != null && typeof e == "object")
      Number.isFinite(e.minSize) && (t = Math.max(0, Math.floor(e.minSize))), Number.isFinite(e.maxSize) && (i = Math.max(t, Math.floor(e.maxSize)));
    else {
      const o = Number(e);
      if (!Number.isFinite(o)) return;
      i = Math.max(t, Math.floor(o));
    }
    this.minSize = Math.max(0, t), this.maxSize = Math.max(this.minSize, i);
    let n = 0;
    for (; this.workers.length < this.minSize && this.workers.length < this.maxSize; )
      this._addWorkerInstance(), n++;
    const s = [];
    for (; this.workers.length > this.maxSize; ) {
      const o = this.workers.pop();
      if (o) {
        this._decrementActiveTasks(o.tasks || 0);
        try {
          o.worker.terminate();
        } catch {
        }
        this._deleteWorkerUnderlyingMapping(o), this._terminatedWorkerTaskCountsTotal += o.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1, s.push(o.id);
      }
    }
    if (s.length || n) {
      const o = {
        data: {
          type: "pool:resize",
          terminated: s,
          added: n,
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
          added: n,
          terminated: s,
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
   * This helper normalizes the configured \`workerSource\` which may be a
   * callable factory (constructor) or a string path. When a string path is
   * provided it attempts to resolve a \`baseUrl\` at runtime in a bundler-safe
   * manner and constructs a \`Worker\` accordingly. Throws when \`workerSource\`
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
      } catch (t) {
        const i = String(t && t.message);
        if (t instanceof TypeError && /not a constructor|cannot be invoked without\\s*'new'|Class constructor|not constructable/i.test(
          i
        ))
          return e();
        throw t;
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
        const t = document.currentScript;
        t && t.src && (e = t.src);
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
      const t = e && e.worker && e.worker._underlying;
      t && this._underlyingToWorkerObj && this._underlyingToWorkerObj.delete(t);
    } catch {
    }
  }
  /**
   * Add and wire a new worker instance into the pool.
   *
   * This helper wraps the underlying worker instance with a small adapter
   * that encodes outgoing plain-object messages to transferable \`Uint8Array\`
   * when possible and decodes incoming binary messages back to objects.
   * It also wires cross-platform event handlers (\`message\`, \`error\`,
   * \`messageerror\`) and returns the \`WorkerObj\` metadata entry used by the pool.
   *
   * @private
   * @param {number} [id] - Optional explicit id for the worker entry.
   * @returns {WorkerObj} The newly created worker entry.
   */
  _addWorkerInstance(e) {
    e == null && (e = this._nextWorkerId++);
    const t = this._createWorkerInstance(), i = new Xt(t, this._logger, this), n = {
      id: e,
      worker: i,
      tasks: 0,
      lastActive: Y(),
      latencyEwma: null,
      _startTimes: new Le()
    };
    n.completedTasks = 0, this.workers.push(n), this._totalWorkersCreated++;
    try {
      this._bus.emit("pool:scale", {
        action: "add",
        id: n.id,
        minSize: this.minSize,
        maxSize: this.maxSize
      });
    } catch (l) {
      this._logger.error(l, "pool scale add listener error");
    }
    try {
      this._underlyingToWorkerObj.set(t, n);
    } catch {
    }
    i.onmessage = (l) => {
      const u = Y();
      n.tasks = Math.max(0, n.tasks - 1), this._decrementActiveTasks(1), n.lastActive = u;
      try {
        const g = l && l.data;
        if (g && typeof g == "object" && g.correlationId != null) {
          const d = String(g.correlationId), v = Object.prototype.hasOwnProperty.call(g, "response") ? g.response : g;
          this._cleanupPendingResponse(d, { resolveWith: v });
        }
      } catch (g) {
        this._debugLog && this._debugLog(g, "worker.onmessage: resolve pending response");
      }
      try {
        const g = n._startTimes && n._startTimes.length ? n._startTimes.shift() : null;
        let d = null;
        try {
          const v = l && l.data;
          if (v && typeof v.duration == "number" && Number.isFinite(v.duration) ? d = Math.max(0, Number(v.duration)) : g != null && (d = Math.max(0, u - g)), d != null) {
            const S = this._autoScale && this._autoScale.alpha || 0.2;
            n.latencyEwma == null ? n.latencyEwma = d : n.latencyEwma = S * d + (1 - S) * n.latencyEwma, this._ewmaLatency == null ? this._ewmaLatency = d : this._ewmaLatency = S * d + (1 - S) * this._ewmaLatency, this._totalTasksCompleted = (this._totalTasksCompleted || 0) + 1, n.completedTasks = (n.completedTasks || 0) + 1;
            const P = 1, A = this._taskDurationsWelfordCount;
            this._taskDurationsWelfordCount = A + P;
            const E = d - this._taskDurationsWelfordMean;
            this._taskDurationsWelfordMean += E * P / this._taskDurationsWelfordCount;
            const N = d - this._taskDurationsWelfordMean;
            this._taskDurationsWelfordM2 += E * N, d < this._taskDurationsMin && (this._taskDurationsMin = d), d > this._taskDurationsMax && (this._taskDurationsMax = d);
          }
        } catch (v) {
          this._debugLog && this._debugLog(v, "worker.onmessage: latency tracking inner");
        }
      } catch (g) {
        this._debugLog && this._debugLog(g, "worker.onmessage: latency tracking outer");
      }
      if (!this._queuePaused && this.queue.length > 0 && n.tasks < this._maxTasksPerWorker) {
        const g = this.queue.shift();
        try {
          const d = Y();
          g.transfer ? i.postMessage(g.message, g.transfer) : i.postMessage(g.message), n._startTimes.push(d), n.tasks++, this._activeTasks++;
        } catch (d) {
          this._debugLog && this._debugLog(d, "dispatch queued message to worker failed"), this._logger.error(d, "Failed to dispatch queued message to worker");
        }
        this._queueHighCrossed && this.queue.length <= this._queueHighThreshold && (this._queueHighCrossed = !1);
      }
      if (this._onmessage)
        try {
          this._onmessage(l);
        } catch (g) {
          this._logger.error(g, "Pool onmessage handler error");
        }
      try {
        this._bus.emit("message", l);
      } catch (g) {
        this._logger.error(g, "pool listener error");
      }
      this._updateIdleState();
    };
    const s = (l) => {
      let u = l && l.data !== void 0 ? l.data : l, g = u;
      if (u && (u instanceof ArrayBuffer || ArrayBuffer.isView(u)))
        try {
          g = Qe(u);
        } catch (v) {
          try {
            a(v);
          } catch {
          }
          g = u;
        }
      const d = { data: g, originalEvent: l };
      if (typeof i.onmessage == "function")
        try {
          i.onmessage(d);
        } catch (v) {
          this._logger.error(v, "worker wrapper onmessage error");
        }
    }, o = (l) => {
      if (typeof i.onerror == "function")
        try {
          i.onerror(l);
        } catch (u) {
          this._logger.error(u, "worker wrapper onerror error");
        }
      try {
        this._bus.emit("error", l);
      } catch (u) {
        this._logger.error(u, "pool error listener error");
      }
    }, a = (l) => {
      if (typeof i.onmessageerror == "function")
        try {
          i.onmessageerror(l);
        } catch (u) {
          this._logger.error(u, "worker wrapper onmessageerror error");
        }
      try {
        this._bus.emit("messageerror", l);
      } catch (u) {
        this._logger.error(u, "pool messageerror listener error");
      }
    };
    if (typeof t.addEventListener == "function") {
      try {
        t.addEventListener("message", s);
      } catch (l) {
        this._debugLog && this._debugLog(l, "attach addEventListener message");
      }
      try {
        t.addEventListener("error", o);
      } catch (l) {
        this._debugLog && this._debugLog(l, "attach addEventListener error");
      }
      try {
        t.addEventListener("messageerror", a);
      } catch (l) {
        this._debugLog && this._debugLog(l, "attach addEventListener messageerror");
      }
    } else if (typeof t.on == "function") {
      try {
        t.on("message", s);
      } catch (l) {
        this._debugLog && this._debugLog(l, "attach underlying.on message");
      }
      try {
        t.on("error", o);
      } catch (l) {
        this._debugLog && this._debugLog(l, "attach underlying.on error");
      }
      try {
        t.on("messageerror", a);
      } catch (l) {
        this._debugLog && this._debugLog(l, "attach underlying.on messageerror");
      }
    } else {
      try {
        t.onmessage = s;
      } catch (l) {
        this._debugLog && this._debugLog(l, "assign underlying.onmessage");
      }
      try {
        t.onerror = o;
      } catch (l) {
        this._debugLog && this._debugLog(l, "assign underlying.onerror");
      }
      try {
        t.onmessageerror = a;
      } catch (l) {
        this._debugLog && this._debugLog(l, "assign underlying.onmessageerror");
      }
    }
    return n;
  }
  /**
   * Return the least-loaded worker (smallest \`tasks\` count).
   *
   * When multiple workers share the same \`tasks\` count prefer the one with
   * the lower EWMA latency (\`latencyEwma\`). Returns \`null\` when no workers
   * are available.
   *
   * @private
   * @returns {WorkerObj|null}
   */
  _findLeastLoadedWorker() {
    if (!this.workers.length) return null;
    let e = null, t = 1 / 0, i = Number.POSITIVE_INFINITY;
    for (let n = 0; n < this.workers.length; n++) {
      const s = this.workers[n], o = s.latencyEwma != null ? s.latencyEwma : Number.POSITIVE_INFINITY;
      (s.tasks < t || s.tasks === t && o < i) && (e = s, t = s.tasks, i = o);
    }
    return e;
  }
  /**
   * Shared handler for underlying worker 'message' events.
   * Decodes binary payloads and forwards to the worker wrapper's \`onmessage\`.
   * @private
   */
  _handleUnderlyingMessage(e, t) {
    const i = this._underlyingToWorkerObj.get(e);
    if (!i) return;
    const n = i.worker;
    let s = t && t.data !== void 0 ? t.data : t, o = s;
    if (s && (s instanceof ArrayBuffer || ArrayBuffer.isView(s)))
      try {
        o = Qe(s);
      } catch (l) {
        try {
          this._handleUnderlyingMessageError(e, l);
        } catch {
        }
        o = s;
      }
    const a = { data: o, originalEvent: t };
    if (typeof n.onmessage == "function")
      try {
        n.onmessage(a);
      } catch (l) {
        this._logger.error(l, "worker wrapper onmessage error");
      }
  }
  /**
   * Shared handler for underlying worker 'error' events.
   * Forwards to wrapper \`onerror\` and pool-level listeners.
   * @private
   */
  _handleUnderlyingError(e, t) {
    const i = this._underlyingToWorkerObj.get(e);
    if (!i) return;
    const n = i.worker;
    if (typeof n.onerror == "function")
      try {
        n.onerror(t);
      } catch (s) {
        this._logger.error(s, "worker wrapper onerror error");
      }
    try {
      this._bus.emit("error", t);
    } catch (s) {
      this._logger.error(s, "pool error listener error");
    }
  }
  /**
   * Shared handler for underlying worker 'messageerror' events.
   * Forwards to wrapper \`onmessageerror\` and pool-level listeners.
   * @private
   */
  _handleUnderlyingMessageError(e, t) {
    const i = this._underlyingToWorkerObj.get(e);
    if (!i) return;
    const n = i.worker;
    if (typeof n.onmessageerror == "function")
      try {
        n.onmessageerror(t);
      } catch (s) {
        this._logger.error(s, "worker wrapper onmessageerror error");
      }
    try {
      this._bus.emit("messageerror", t);
    } catch (s) {
      this._logger.error(s, "pool messageerror listener error");
    }
  }
  /**
   * Post a message to a worker in the pool.
   * The pool will try to reuse an idle/least-loaded worker, grow the pool
   * (up to \`maxSize\`), or queue the task if configured.
   *
   * @param {*} message - The message to post to a worker.
   * @param {Transferable[]=} transfer - Optional transfer list. If omitted and
   * a plain JS object is supplied, the pool will internally encode the object
   * to a transferable \`Uint8Array\` (via \`o2u8\`) and pass its \`ArrayBuffer\` as
   * the transfer list to avoid structured-clone copies.
   * @param {PostMessageOptions=} options - Optional flags controlling behavior such as \`awaitResponse\`, \`timeout\`, \`workerId\`, and \`zeroCopy\`.
   * @returns {boolean|Promise<any>} When \`options.awaitResponse\` is truthy this returns a \`Promise\` that resolves with the worker response; otherwise returns \`true\` when the message was accepted (dispatched or queued) or \`false\` when it was rejected.
   */
  postMessage(e, t, i) {
    i = i || void 0;
    const n = i && i.workerId != null ? i.workerId : null, s = n != null ? this.workers.find((d) => d.id === n) : this._findLeastLoadedWorker(), o = !!(i && (i.awaitResponse || i.correlationId != null));
    let a, l;
    if (o) {
      if (a = i.correlationId != null ? String(i.correlationId) : this._generateCorrelationId(), !(e !== null && typeof e == "object" && !ArrayBuffer.isView(e) && !(e instanceof ArrayBuffer)))
        throw new Error("postMessage awaitResponse requires a plain-object message");
      e = Object.assign({}, e, { correlationId: a }), l = new Promise((v, S) => {
        const P = { resolve: v, reject: S, timer: null }, A = a != null ? String(a) : a;
        i && i.timeout && (P.timer = setTimeout(() => {
          try {
            this._cleanupPendingResponse(A, {
              rejectWith: new Error("postMessage response timeout")
            });
          } catch {
            try {
              S(new Error("postMessage response timeout"));
            } catch {
            }
          }
        }, i.timeout)), this._pendingResponses.set(A, P);
      }), a = a != null ? String(a) : a;
    }
    if (s && s.tasks < this._maxTasksPerWorker)
      try {
        const d = Y(), v = this._prepareForTransfer(e, t, i);
        return v.transfer && v.transfer.length ? s.worker.postMessage(v.message, v.transfer) : s.worker.postMessage(v.message), s._startTimes && typeof s._startTimes.push == "function" && s._startTimes.push(d), s.tasks++, this._activeTasks++, s.lastActive = d, this._updateIdleState(), o ? l : !0;
      } catch (d) {
        if (o && a) {
          try {
            this._cleanupPendingResponse(a, { rejectWith: d });
          } catch {
          }
          return this._logger.error(d, "Failed to postMessage to worker"), l;
        }
        return this._logger.error(d, "Failed to postMessage to worker"), !1;
      }
    if (n != null && (!s || s.tasks >= this._maxTasksPerWorker)) {
      if (o && a) {
        try {
          this._cleanupPendingResponse(a, {
            rejectWith: new Error("targeted worker unavailable")
          });
        } catch {
        }
        return l;
      }
      return !1;
    }
    if (n == null && this.workers.length < this.maxSize) {
      const d = this._addWorkerInstance();
      try {
        const v = Y(), S = this._prepareForTransfer(e, t, i);
        return S.transfer && S.transfer.length ? d.worker.postMessage(S.message, S.transfer) : d.worker.postMessage(S.message), d._startTimes && typeof d._startTimes.push == "function" && d._startTimes.push(v), d.tasks++, this._activeTasks++, d.lastActive = v, this._updateIdleState(), o ? l : !0;
      } catch (v) {
        if (o && a) {
          try {
            this._cleanupPendingResponse(a, { rejectWith: v });
          } catch {
          }
          return this._logger.error(v, "Failed to postMessage to new worker"), l;
        }
        return this._logger.error(v, "Failed to postMessage to new worker"), !1;
      }
    }
    if (this.taskQueueEnabled) {
      const d = this._prepareForTransfer(e, t, i), v = this._queuePolicy;
      if (v === "reject")
        return o && a ? (this._cleanupPendingResponse(a, {
          rejectWith: new Error("postMessage rejected by queue policy")
        }), l) : !1;
      if (v === "drop-newest" && this.queue.length > 0)
        return o && a ? (this._cleanupPendingResponse(a, {
          rejectWith: new Error("postMessage rejected by queue policy")
        }), l) : !1;
      if (v === "drop-oldest" && this.queue.length > 0) {
        const P = this.queue.shift();
        P && P.correlationId != null && this._cleanupPendingResponse(P.correlationId, {
          rejectWith: new Error("postMessage queued task dropped by policy")
        });
      }
      const S = {
        message: d.message,
        transfer: d.transfer
      };
      o && a && (S.correlationId = a), this.queue.push(S);
      try {
        if (Number.isFinite(this._queueHighThreshold) && this.queue.length > this._queueHighThreshold && !this._queueHighCrossed) {
          this._queueHighCrossed = !0;
          try {
            this._bus.emit("pool:queue:high", {
              length: this.queue.length,
              threshold: this._queueHighThreshold
            });
          } catch (P) {
            this._logger.error(P, "pool queue high listener error");
          }
        }
      } catch {
      }
      return this._updateIdleState(), o ? l : !0;
    }
    if (!this.workers.length) return o ? l : !1;
    const u = this._nextIndex % this.workers.length;
    this._nextIndex = (this._nextIndex + 1) % this.workers.length;
    const g = this.workers[u];
    try {
      const d = Y(), v = this._prepareForTransfer(e, t);
      return v.transfer && v.transfer.length ? g.worker.postMessage(v.message, v.transfer) : g.worker.postMessage(v.message), g._startTimes && typeof g._startTimes.push == "function" && g._startTimes.push(d), g.tasks++, this._activeTasks++, g.lastActive = d, this._updateIdleState(), o ? l : !0;
    } catch (d) {
      if (o && a) {
        try {
          this._cleanupPendingResponse(a, { rejectWith: d });
        } catch {
        }
        return this._logger.error(d, "Failed to postMessage to fallback worker"), l;
      }
      return this._logger.error(d, "Failed to postMessage to fallback worker"), !1;
    }
  }
  /**
   * Generate a safe correlation id. Prefer \`crypto.randomUUID()\` when
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
        const t = new Uint8Array(16);
        return globalThis.crypto.getRandomValues(t), Array.from(t).map((i) => i.toString(16).padStart(2, "0")).join("");
      }
    } catch {
    }
    const e = Math.floor(Math.random() * 4294967295).toString(16);
    return \`cid-\${Date.now().toString(36)}-\${e}\`;
  }
  /**
   * Centralized cleanup for a pending response entry.
   * Ensures the timer is cleared and the entry is resolved/rejected exactly once.
   * @private
   * @param {string|number} key
   * @param {{resolveWith?:any, rejectWith?:any}} opts
   */
  _cleanupPendingResponse(e, t = {}) {
    const i = e != null ? String(e) : e, n = this._pendingResponses.get(i);
    if (!n) return !1;
    try {
      if (n.timer)
        try {
          clearTimeout(n.timer);
        } catch {
        }
    } catch {
    }
    try {
      Object.prototype.hasOwnProperty.call(t, "resolveWith") ? n.resolve(t.resolveWith) : Object.prototype.hasOwnProperty.call(t, "rejectWith") && n.reject(t.rejectWith);
    } catch {
    } finally {
      try {
        this._pendingResponses.delete(i);
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
   * each worker into a transferable \`Uint8Array\` (via \`o2u8\`) so each worker
   * receives an independent transferable buffer to avoid structured-clone copies.
   * @returns {void}
   */
  broadcast(e, t) {
    const i = Y();
    let n = null;
    const s = e !== null && typeof e == "object" && !ArrayBuffer.isView(e) && !(e instanceof ArrayBuffer);
    for (const o of this.workers)
      try {
        let a = e, l = t;
        if (!l && s)
          try {
            n == null && (n = this._encodeForTransfer(e));
            const u = n.slice();
            a = u, l = [u.buffer];
          } catch {
            a = e, l = void 0;
          }
        l && l.length ? o.worker.postMessage(a, l) : o.worker.postMessage(a), o._startTimes && typeof o._startTimes.push == "function" && o._startTimes.push(i), o.tasks++, this._activeTasks++, o.lastActive = i;
      } catch (a) {
        this._logger.error(a, "broadcast error");
      }
    this._updateIdleState();
  }
  /**
   * Stop all pending queued tasks and immediately post a message to the pool.
   * This clears the internal task queue first (cancelling pending tasks),
   * updates the pool idle state, then forwards the provided message using
   * \`postMessage\` so the message is dispatched to a live worker immediately
   * (or enqueued if no worker can accept it).
   *
   * @param {*} message - The message to post after clearing pending tasks.
   * @param {Transferable[]=} transfer - Optional transfer list. When omitted
   * and a plain object is supplied, the pool will attempt to encode the
   * object to a transferable \`Uint8Array\` for efficient transfer.
   * @param {Object=} options - Optional options forwarded to \`postMessage\`.
   * @returns {boolean|Promise<any>} The same return value as \`postMessage\`.
   */
  stopThePress(e, t, i) {
    const n = i && typeof i.recreateWorkers < "u" ? !!i.recreateWorkers : !0, s = i && typeof i == "object" ? Object.assign({}, i) : void 0;
    s && delete s.recreateWorkers;
    try {
      this.queue && typeof this.queue.clear == "function" && this.queue.clear();
    } catch (l) {
      this._logger.error(l, "stopThePress: failed to clear queue");
    }
    try {
      for (const [l] of this._pendingResponses)
        try {
          this._cleanupPendingResponse(l, {
            rejectWith: new Error("stopThePress: cancelled pending response")
          });
        } catch {
        }
    } catch (l) {
      this._logger.error(l, "stopThePress: failed to cancel pending responses");
    }
    const o = this.workers.length, a = this.workers.map((l) => l && l.id).filter((l) => l != null);
    try {
      for (let l = this.workers.length - 1; l >= 0; l--) {
        const u = this.workers[l];
        this._terminatedWorkerTaskCountsTotal += u.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1;
        try {
          u.worker.terminate();
        } catch {
        }
        this._deleteWorkerUnderlyingMapping(u);
      }
      this.workers.length = 0, this._activeTasks = 0;
    } catch (l) {
      this._logger.error(l, "stopThePress: failed while terminating workers");
    }
    if (n || this._clearLifecycleIntervals(), n) {
      const l = Math.max(this.minSize, Math.min(o, this.maxSize));
      for (let u = 0; u < l; u++) this._addWorkerInstance();
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
    } catch (l) {
      this._logger.error(l, "pool scale stopThePress listener error");
    }
    return this._updateIdleState(), this.postMessage(e, t, s);
  }
  /**
   * Post a batch of messages to the pool.
   * Each entry is an object: \`{ message, transfer? }\`.
   * Returns an array with the same length as \`items\` where each element is
   * either a boolean (accepted) or a Promise (when \`options.awaitResponse\` is used).
   * @param {{message:*,transfer?:Transferable[]}[]} items
   * @param {Object=} options - Optional options forwarded to each \`postMessage\` call.
   * @returns {(boolean|Promise<any>)[]}
   */
  postMessageBatch(e, t) {
    if (!Array.isArray(e))
      throw new Error("postMessageBatch expects an array of {message, transfer?}");
    const i = !!(t && (t.awaitResponse || t.correlationId != null)), n = t && typeof t.correlationIdFactory == "function" ? t.correlationIdFactory : null;
    if (i) {
      if (t && t.correlationId != null && e.length > 1 && !n)
        throw new Error(
          "postMessageBatch cannot use a fixed correlationId for multiple items; provide options.correlationIdFactory or omit correlationId"
        );
      const d = new Array(e.length);
      for (let v = 0; v < e.length; v++) {
        const S = e[v] || {}, P = Object.assign({}, t);
        n && (P.correlationId = String(n(v, S))), d[v] = this.postMessage(S.message, S.transfer, P);
      }
      return d;
    }
    const s = new Array(e.length), o = [], a = t && t.workerId != null ? t.workerId : null, l = this.prepareBuffers(e, {
      clone: !0,
      zeroCopy: t && !!t.zeroCopy
    });
    let u = null;
    if (a != null) {
      if (u = this.workers.find((d) => d.id === a), !u) return e.map(() => !1);
    } else
      u = this._findLeastLoadedWorker();
    let g = !1;
    for (let d = 0; d < e.length; d++) {
      const v = e[d] || {}, S = l[d] || { message: v.message, transfer: v.transfer };
      let P = !1;
      u && u.tasks >= this._maxTasksPerWorker && (u = null);
      let A = u;
      if (!A && a == null && (A = this._findLeastLoadedWorker()), A && A.tasks < this._maxTasksPerWorker)
        try {
          const E = Y();
          S.transfer && S.transfer.length ? A.worker.postMessage(S.message, S.transfer) : A.worker.postMessage(S.message), A._startTimes && typeof A._startTimes.push == "function" && A._startTimes.push(E), A.tasks++, this._activeTasks++, A.lastActive = E, g = !0, s[d] = !0, P = !0, u = A.tasks < this._maxTasksPerWorker ? A : null;
        } catch {
          s[d] = !1, P = !0;
        }
      if (!P && a == null && this.workers.length < this.maxSize)
        try {
          const E = this._addWorkerInstance(), N = Y();
          S.transfer && S.transfer.length ? E.worker.postMessage(S.message, S.transfer) : E.worker.postMessage(S.message), E._startTimes && typeof E._startTimes.push == "function" && E._startTimes.push(N), E.tasks++, this._activeTasks++, E.lastActive = N, g = !0, s[d] = !0, P = !0, u = E.tasks < this._maxTasksPerWorker ? E : null;
        } catch {
          s[d] = !1, P = !0;
        }
      if (!P) {
        if (a != null) {
          s[d] = !1;
          continue;
        }
        if (this.taskQueueEnabled) {
          const E = this._queuePolicy;
          E === "reject" || E === "drop-newest" && this.queue.length > 0 ? s[d] = !1 : (E === "drop-oldest" && this.queue.length > 0 && this.queue.shift(), o.push({ message: S.message, transfer: S.transfer }), s[d] = !0);
        } else if (!this.workers.length)
          s[d] = !1;
        else {
          const E = this._nextIndex % this.workers.length;
          this._nextIndex = (this._nextIndex + 1) % this.workers.length;
          const N = this.workers[E];
          try {
            const M = Y();
            S.transfer && S.transfer.length ? N.worker.postMessage(S.message, S.transfer) : N.worker.postMessage(S.message), N._startTimes && typeof N._startTimes.push == "function" && N._startTimes.push(M), N.tasks++, this._activeTasks++, N.lastActive = M, g = !0, s[d] = !0;
          } catch (M) {
            s[d] = !1, this._logger.error(M, "Failed to postMessage to fallback worker");
          }
        }
      }
    }
    if (o.length)
      try {
        this.queue.pushMany(o), g = !0;
      } catch (d) {
        this._logger.error(d, "postMessageBatch: failed to enqueue prepared items");
      }
    return g && this._updateIdleState(), s;
  }
  /**
   * Stop the press and then post a batch of messages.
   *
   * Clears the internal task queue and terminates inflight workers (optionally recreating them),
   * rejects pending response Promises, then forwards the provided batch to \`postMessageBatch\`.
   *
   * This method mirrors the semantics of \`stopThePress\` for single messages but
   * operates on a batch. Use it when you need to atomically cancel pending work
   * and then seed the pool with a new set of tasks.
   *
   * @param {{message:*,transfer?:Transferable[]}[]} items - Array of items to send after clearing the pool.
   * @param {Object=} options - Optional options forwarded to \`postMessageBatch\`.
   *   Recognized options include:
   *     - \`recreateWorkers\` (boolean, default: true) — whether to recreate replacement workers after termination.
   *     - \`awaitResponse\` (boolean) — if true, returned slots will be Promises as in \`postMessageBatch\`.
   *     - \`workerId\` (number) — target a specific worker during dispatch attempts.
   * @returns {(boolean|Promise<any>)[]} Array with per-item results: \`true|false\` or \`Promise\` when awaiting responses.
   */
  stopThePressBatch(e, t) {
    const i = t && typeof t.recreateWorkers < "u" ? !!t.recreateWorkers : !0, n = t && typeof t == "object" ? Object.assign({}, t) : void 0;
    n && delete n.recreateWorkers;
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
    const s = this.workers.length;
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
    if (i || this._clearLifecycleIntervals(), i) {
      const o = Math.max(this.minSize, Math.min(s, this.maxSize));
      for (let a = 0; a < o; a++) this._addWorkerInstance();
      try {
        this._ensureReaper();
      } catch {
      }
    }
    this._updateIdleState();
    try {
      return this.postMessageBatch(e, n);
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
   * Internal: terminate workers that have been idle longer than \`idleTimeout\`.
   * Keeps at least \`minSize\` workers alive.
   *
   * This routine scans workers from newest to oldest and terminates those
   * which have had no tasks for longer than \`idleTimeout\`, updating
   * termination statistics used by \`getStats()\`.
   *
   * @private
   * @returns {void}
   */
  _reapIdleWorkers() {
    if (this.idleTimeout <= 0) return;
    const e = Y();
    for (let t = this.workers.length - 1; t >= 0; t--) {
      const i = this.workers[t];
      if (this.workers.length <= this.minSize) break;
      if (i.tasks === 0 && e - (i.lastActive || 0) > this.idleTimeout) {
        try {
          i.worker.terminate();
        } catch {
        }
        try {
          const s = i.worker && i.worker._underlying;
          s && this._underlyingToWorkerObj && this._underlyingToWorkerObj.delete(s);
        } catch {
        }
        const n = this.workers.length - 1;
        t === n ? this.workers.pop() : this.workers[t] = this.workers.pop();
      }
    }
    this._updateIdleState();
  }
  /**
   * Autoscale tick: simple policy that grows/shrinks by one worker based on
   * pool-level EWMA latency and queue pressure. Runs only when \`autoScale\`
   * is configured on the pool.
   *
   * - scale up: when EWMA > targetMs OR queue length exceeds worker count
   * - scale down: when EWMA < targetMs * 0.5 AND queue is empty
   * @private
   */
  _autoScaleTick() {
    try {
      if (!this._autoScale || !this._autoScale.enabled) return;
      const e = Y(), t = this._autoScale;
      this._lastAutoScaleAt && t.backoffResetMs && e - this._lastAutoScaleAt > t.backoffResetMs && (this._autoScaleBackoffMultiplier = 1);
      const i = Math.floor(
        (t.cooldownMs || 0) * (this._autoScaleBackoffMultiplier || 1)
      );
      if (this._lastAutoScaleAt && e - this._lastAutoScaleAt < i) return;
      const n = t.targetMs, s = t.hysteresis || 0.2, o = this._ewmaLatency, a = this.workers.length, l = n * (1 + s), u = o != null ? o > l : !1, g = this.queue.length > Math.ceil(a * (1 + s));
      if (u || g) {
        if (a < this.maxSize)
          try {
            const S = Math.min(this.maxSize - a, t.stepUp || 1);
            for (let P = 0; P < S; P++) this._addWorkerInstance();
            this._lastAutoScaleAt = e, this._autoScaleBackoffMultiplier = Math.min(
              t.backoffMaxMultiplier || 8,
              Math.max(1, (this._autoScaleBackoffMultiplier || 1) * (t.backoffFactor || 1))
            );
          } catch (S) {
            this._debugLog && this._debugLog(S, "autoScale: addWorker failed");
          }
        return;
      }
      const d = n * Math.max(0, 1 - s);
      if ((o != null ? o < d : !1) && this.queue.length === 0 && a > this.minSize)
        try {
          const S = Math.min(a - this.minSize, t.stepDown || 1);
          for (let P = 0; P < S; P++) {
            const A = this.workers.pop();
            if (A) {
              try {
                A.worker.terminate();
              } catch (E) {
                this._debugLog && this._debugLog(E, "autoScale: terminate worker");
              }
              this._deleteWorkerUnderlyingMapping(A);
            }
          }
          this._lastAutoScaleAt = e, this._autoScaleBackoffMultiplier = Math.min(
            t.backoffMaxMultiplier || 8,
            Math.max(1, (this._autoScaleBackoffMultiplier || 1) * (t.backoffFactor || 1))
          );
        } catch (S) {
          this._debugLog && this._debugLog(S, "autoScale: remove worker failed");
        }
    } catch (e) {
      this._debugLog && this._debugLog(e, "autoScaleTick outer");
    }
  }
  /**
   * Emit the pool-idle synthetic message to \`onmessage\` and listeners.
   *
   * The emitted event object has the shape: \`{ data: { type: 'pool:idle', stats } }\` where
   * \`stats\` is an array with the per-worker snapshot: \`{ id, tasks, lastActive }\`.
   *
   * Emission semantics:
   * - The event is emitted only when the pool transitions from non-idle to idle
   *   (i.e. the task queue is empty and every worker has \`tasks === 0\`).
   * - The synthetic event is delivered to \`pool.onmessage\`, any \`'message'\` listeners,
   *   as well as to \`pool.onidle\` and \`addEventListener('idle', cb)\` listeners.
   * - The event \`data.type\` is \`'pool:idle'\` and can be used to distinguish it
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
      } catch (t) {
        this._logger.error(t, "Pool onmessage handler error");
      }
    if (this._onidle)
      try {
        this._onidle(e);
      } catch (t) {
        this._logger.error(t, "Pool onidle handler error");
      }
    try {
      this._bus.emit("message", e);
    } catch (t) {
      this._logger.error(t, "pool listener error");
    }
    try {
      this._bus.emit("idle", e);
    } catch (t) {
      this._logger.error(t, "pool idle listener error");
    }
  }
  /**
   * Check current state and emit idle event if transitioning to idle.
   *
   * This function examines active task counts and queue length to detect a
   * transition from non-idle to idle and will call \`_emitIdle()\` exactly once
   * on such transitions.
   *
   * @private
   * @returns {void}
   */
  _updateIdleState() {
    const e = this.queue.length === 0, i = this._activeTasks === 0 && e;
    i && !this._isIdle ? this._emitIdle() : !i && this._isIdle && (this._isIdle = !1);
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
   * Allows \`using\`-style disposal when supported: \`pool[Symbol.dispose]()\`.
   */
  [Symbol.dispose]() {
    this.terminate();
  }
  /**
   * Asynchronous disposal hook. Drains outstanding work and then terminates.
   * Use \`await pool[Symbol.asyncDispose]()\` in environments that support it.
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
    const e = this.workers.map((M) => ({
      id: M.id,
      tasks: M.tasks,
      lastActive: M.lastActive
    })), t = Y(), i = this._createdAt != null ? Math.max(0, t - this._createdAt) : 0, n = this._totalWorkersCreated || this.workers.length, s = this._totalTasksCompleted || 0, o = this._terminatedWorkerTaskCountsCount || 0, a = this._terminatedWorkerTaskCountsTotal || 0;
    let l = 0;
    for (const M of this.workers) l += M.completedTasks || 0;
    const u = this.workers.length || 0, g = o + u, d = g > 0 ? (a + l) / g : 0;
    let v = 0, S = 0, P = 0, A = 0, E = 0;
    const N = this._taskDurationsWelfordCount || 0;
    if (N > 0) {
      v = this._taskDurationsMin === Number.POSITIVE_INFINITY ? 0 : this._taskDurationsMin, S = this._taskDurationsMax === Number.NEGATIVE_INFINITY ? 0 : this._taskDurationsMax, P = this._taskDurationsWelfordMean;
      const M = N > 1 ? this._taskDurationsWelfordM2 / N : 0;
      A = Math.sqrt(M), E = 0;
    }
    return {
      status: e,
      performance: {
        poolLiveDuration: i,
        totalWorkersCreated: n,
        totalTasksPerformed: s,
        averageTasksPerWorkerUntilTermination: d,
        timePerTask: { max: S, min: v, average: P, stddev: A },
        percentSlowTasks: E
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
   * Resolves with the result of \`getStats()\` at the time of idle.
   * @returns {Promise<object>} Promise resolving to \`getStats()\`.
   */
  drain() {
    const e = this.queue.length === 0;
    return this._activeTasks === 0 && e ? Promise.resolve(this.getStats()) : new Promise((n) => {
      const s = () => {
        try {
          this.removeEventListener("idle", s);
        } catch {
        }
        n(this.getStats());
      };
      this.addEventListener("idle", s);
    });
  }
  /**
   * Add an event listener for pool events. Supported types: 'message', 'error', 'messageerror', 'idle'.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  addEventListener(e, t) {
    if (typeof t == "function" && (this._bus.on(e, t), e === "idle")) {
      const i = this.queue.length === 0;
      if (this._activeTasks === 0 && i) {
        const s = { data: { type: "pool:idle", stats: this.getStats() } };
        try {
          t(s);
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
  removeEventListener(e, t) {
    !t || typeof t != "function" || this._bus.off(e, t);
  }
  /**
   * onresize handler called when the pool is resized and workers are terminated/added.
   * Receives an event object: \`{ data: { type: 'pool:resize', terminated: Array<number>, added: number, minSize, maxSize } }\`
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
      const t = this.queue.length === 0;
      if (this._activeTasks === 0 && t) {
        const n = { data: { type: "pool:idle", stats: this.getStats() } };
        try {
          e(n);
        } catch (s) {
          this._logger.error(s, "Pool onidle handler error");
        }
      }
    }
  }
  /**
   * Pause dequeueing from the internal task queue.
   * Queued tasks remain in the queue until \`resumeQueue()\` is called.
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
   * Alias for \`pauseQueue()\` to provide a simpler public API.
   */
  pause() {
    return this.pauseQueue();
  }
  /**
   * Alias for \`resumeQueue()\` to provide a simpler public API.
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
    const e = Y();
    let t = !1;
    for (const i of this.workers)
      for (; this.queue.length > 0 && i.tasks < this._maxTasksPerWorker; ) {
        const n = this.queue.shift();
        try {
          n.transfer && n.transfer.length ? i.worker.postMessage(n.message, n.transfer) : i.worker.postMessage(n.message), i._startTimes && typeof i._startTimes.push == "function" && i._startTimes.push(e), i.tasks++, this._activeTasks++, i.lastActive = e, t = !0;
        } catch (s) {
          this._debugLog && this._debugLog(s, "dispatch queued message to worker failed"), this._logger.error(s, "Failed to dispatch queued message to worker");
          break;
        }
      }
    this._queueHighCrossed && this.queue.length <= this._queueHighThreshold && (this._queueHighCrossed = !1), t && this._updateIdleState();
  }
}
class Jt {
  constructor(e = [], t = (i, n) => i < n ? -1 : i > n ? 1 : 0) {
    if (this.data = e, this.length = this.data.length, this.compare = t, this.length > 0)
      for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
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
    const { data: t, compare: i } = this, n = t[e];
    for (; e > 0; ) {
      const s = e - 1 >> 1, o = t[s];
      if (i(n, o) >= 0) break;
      t[e] = o, e = s;
    }
    t[e] = n;
  }
  _down(e) {
    const { data: t, compare: i } = this, n = this.length >> 1, s = t[e];
    for (; e < n; ) {
      let o = (e << 1) + 1;
      const a = o + 1;
      if (a < this.length && i(t[a], t[o]) < 0 && (o = a), i(t[o], s) >= 0) break;
      t[e] = t[o], e = o;
    }
    t[e] = s;
  }
}
function Zt(r, e = 1, t = !1) {
  let i = 1 / 0, n = 1 / 0, s = -1 / 0, o = -1 / 0;
  for (const [N, M] of r[0])
    N < i && (i = N), M < n && (n = M), N > s && (s = N), M > o && (o = M);
  const a = s - i, l = o - n, u = Math.max(e, Math.min(a, l));
  if (u === e) {
    const N = [i, n];
    return N.distance = 0, N;
  }
  const g = new Jt([], (N, M) => M.max - N.max);
  let d = tr(r);
  const v = new Oe(i + a / 2, n + l / 2, 0, r);
  v.d > d.d && (d = v);
  let S = 2;
  function P(N, M, j) {
    const G = new Oe(N, M, j, r);
    S++, G.max > d.d + e && g.push(G), G.d > d.d && (d = G, t && console.log(\`found best \${Math.round(1e4 * G.d) / 1e4} after \${S} probes\`));
  }
  let A = u / 2;
  for (let N = i; N < s; N += u)
    for (let M = n; M < o; M += u)
      P(N + A, M + A, A);
  for (; g.length; ) {
    const { max: N, x: M, y: j, h: G } = g.pop();
    if (N - d.d <= e) break;
    A = G / 2, P(M - A, j - A, A), P(M + A, j - A, A), P(M - A, j + A, A), P(M + A, j + A, A);
  }
  t && console.log(\`num probes: \${S}
best distance: \${d.d}\`);
  const E = [d.x, d.y];
  return E.distance = d.d, E;
}
function Oe(r, e, t, i) {
  this.x = r, this.y = e, this.h = t, this.d = er(r, e, i), this.max = this.d + this.h * Math.SQRT2;
}
function er(r, e, t) {
  let i = !1, n = 1 / 0;
  for (const s of t)
    for (let o = 0, a = s.length, l = a - 1; o < a; l = o++) {
      const u = s[o], g = s[l];
      u[1] > e != g[1] > e && r < (g[0] - u[0]) * (e - u[1]) / (g[1] - u[1]) + u[0] && (i = !i), n = Math.min(n, rr(r, e, u, g));
    }
  return n === 0 ? 0 : (i ? 1 : -1) * Math.sqrt(n);
}
function tr(r) {
  let e = 0, t = 0, i = 0;
  const n = r[0];
  for (let o = 0, a = n.length, l = a - 1; o < a; l = o++) {
    const u = n[o], g = n[l], d = u[0] * g[1] - g[0] * u[1];
    t += (u[0] + g[0]) * d, i += (u[1] + g[1]) * d, e += d * 3;
  }
  const s = new Oe(t / e, i / e, 0, r);
  return e === 0 || s.d < 0 ? new Oe(n[0][0], n[0][1], 0, r) : s;
}
function rr(r, e, t, i) {
  let n = t[0], s = t[1], o = i[0] - n, a = i[1] - s;
  if (o !== 0 || a !== 0) {
    const l = ((r - n) * o + (e - s) * a) / (o * o + a * a);
    l > 1 ? (n = i[0], s = i[1]) : l > 0 && (n += o * l, s += a * l);
  }
  return o = r - n, a = e - s, o * o + a * a;
}
var lt = 63710088e-1;
function pe(r, e, t = {}) {
  const i = { type: "Feature" };
  return (t.id === 0 || t.id) && (i.id = t.id), t.bbox && (i.bbox = t.bbox), i.properties = e || {}, i.geometry = r, i;
}
function ir(r, e, t = {}) {
  for (const n of r) {
    if (n.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (n[n.length - 1].length !== n[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let s = 0; s < n[n.length - 1].length; s++)
      if (n[n.length - 1][s] !== n[0][s])
        throw new Error("First and last Position are not equivalent.");
  }
  return pe({
    type: "Polygon",
    coordinates: r
  }, e, t);
}
function ut(r, e, t = {}) {
  if (r.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return pe({
    type: "LineString",
    coordinates: r
  }, e, t);
}
function nr(r, e = {}) {
  const t = { type: "FeatureCollection" };
  return e.id && (t.id = e.id), e.bbox && (t.bbox = e.bbox), t.features = r, t;
}
function sr(r, e, t = {}) {
  return pe({
    type: "MultiPolygon",
    coordinates: r
  }, e, t);
}
function or(r) {
  return r !== null && typeof r == "object" && !Array.isArray(r);
}
function De(r, e) {
  var t, i, n, s, o, a, l, u, g, d, v = 0, S = r.type === "FeatureCollection", P = r.type === "Feature", A = S ? r.features.length : 1;
  for (t = 0; t < A; t++) {
    for (a = S ? (
      // @ts-expect-error: Known type conflict
      r.features[t].geometry
    ) : P ? (
      // @ts-expect-error: Known type conflict
      r.geometry
    ) : r, u = S ? (
      // @ts-expect-error: Known type conflict
      r.features[t].properties
    ) : P ? (
      // @ts-expect-error: Known type conflict
      r.properties
    ) : {}, g = S ? (
      // @ts-expect-error: Known type conflict
      r.features[t].bbox
    ) : P ? (
      // @ts-expect-error: Known type conflict
      r.bbox
    ) : void 0, d = S ? (
      // @ts-expect-error: Known type conflict
      r.features[t].id
    ) : P ? (
      // @ts-expect-error: Known type conflict
      r.id
    ) : void 0, l = a ? a.type === "GeometryCollection" : !1, o = l ? a.geometries.length : 1, n = 0; n < o; n++) {
      if (s = l ? a.geometries[n] : a, s === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            v,
            u,
            g,
            d
          ) === !1
        )
          return !1;
        continue;
      }
      switch (s.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            // @ts-expect-error: Known type conflict
            e(
              s,
              v,
              u,
              g,
              d
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (i = 0; i < s.geometries.length; i++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                s.geometries[i],
                v,
                u,
                g,
                d
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    v++;
  }
}
function ar(r, e, t) {
  var i = t;
  return De(
    r,
    function(n, s, o, a, l) {
      i = e(
        // @ts-expect-error: Known type conflict
        i,
        n,
        s,
        o,
        a,
        l
      );
    }
  ), i;
}
function lr(r, e) {
  De(r, function(t, i, n, s, o) {
    var a = t === null ? null : t.type;
    switch (a) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            pe(t, n, { bbox: s, id: o }),
            i,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var l;
    switch (a) {
      case "MultiPoint":
        l = "Point";
        break;
      case "MultiLineString":
        l = "LineString";
        break;
      case "MultiPolygon":
        l = "Polygon";
        break;
    }
    for (
      var u = 0;
      // @ts-expect-error: Known type conflict
      u < t.coordinates.length;
      u++
    ) {
      var g = t.coordinates[u], d = {
        type: l,
        coordinates: g
      };
      if (
        // @ts-expect-error: Known type conflict
        e(pe(d, n), i, u) === !1
      )
        return !1;
    }
  });
}
function ur(r) {
  return ar(
    r,
    (e, t) => e + hr(t),
    0
  );
}
function hr(r) {
  let e = 0, t;
  switch (r.type) {
    case "Polygon":
      return ht(r.coordinates);
    case "MultiPolygon":
      for (t = 0; t < r.coordinates.length; t++)
        e += ht(r.coordinates[t]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function ht(r) {
  let e = 0;
  if (r && r.length > 0) {
    e += Math.abs(ct(r[0]));
    for (let t = 1; t < r.length; t++)
      e -= Math.abs(ct(r[t]));
  }
  return e;
}
var cr = lt * lt / 2, Ge = Math.PI / 180;
function ct(r) {
  const e = r.length - 1;
  if (e <= 2) return 0;
  let t = 0, i = 0;
  for (; i < e; ) {
    const n = r[i], s = r[i + 1 === e ? 0 : i + 1], o = r[i + 2 >= e ? (i + 2) % e : i + 2], a = n[0] * Ge, l = s[1] * Ge, u = o[0] * Ge;
    t += (u - a) * Math.sin(l), i++;
  }
  return t * cr;
}
function fr(r) {
  if (!r)
    throw new Error("coord is required");
  if (!Array.isArray(r)) {
    if (r.type === "Feature" && r.geometry !== null && r.geometry.type === "Point")
      return [...r.geometry.coordinates];
    if (r.type === "Point")
      return [...r.coordinates];
  }
  if (Array.isArray(r) && r.length >= 2 && !Array.isArray(r[0]) && !Array.isArray(r[1]))
    return [...r];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function ve(r) {
  if (Array.isArray(r))
    return r;
  if (r.type === "Feature") {
    if (r.geometry !== null)
      return r.geometry.coordinates;
  } else if (r.coordinates)
    return r.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function dr(r, e) {
  return r.type === "FeatureCollection" ? "FeatureCollection" : r.type === "GeometryCollection" ? "GeometryCollection" : r.type === "Feature" && r.geometry !== null ? r.geometry.type : r.type;
}
function ft(r, e, t = {}) {
  const i = fr(r), n = ve(e);
  for (let s = 0; s < n.length - 1; s++) {
    let o = !1;
    if (t.ignoreEndVertices && (s === 0 && (o = "start"), s === n.length - 2 && (o = "end"), s === 0 && s + 1 === n.length - 1 && (o = "both")), gr(
      n[s],
      n[s + 1],
      i,
      o,
      typeof t.epsilon > "u" ? null : t.epsilon
    ))
      return !0;
  }
  return !1;
}
function gr(r, e, t, i, n) {
  const s = t[0], o = t[1], a = r[0], l = r[1], u = e[0], g = e[1], d = t[0] - a, v = t[1] - l, S = u - a, P = g - l, A = d * P - v * S;
  if (n !== null) {
    if (Math.abs(A) > n)
      return !1;
  } else if (A !== 0)
    return !1;
  if (Math.abs(S) === Math.abs(P) && Math.abs(S) === 0)
    return i ? !1 : t[0] === r[0] && t[1] === r[1];
  if (i) {
    if (i === "start")
      return Math.abs(S) >= Math.abs(P) ? S > 0 ? a < s && s <= u : u <= s && s < a : P > 0 ? l < o && o <= g : g <= o && o < l;
    if (i === "end")
      return Math.abs(S) >= Math.abs(P) ? S > 0 ? a <= s && s < u : u < s && s <= a : P > 0 ? l <= o && o < g : g < o && o <= l;
    if (i === "both")
      return Math.abs(S) >= Math.abs(P) ? S > 0 ? a < s && s < u : u < s && s < a : P > 0 ? l < o && o < g : g < o && o < l;
  } else return Math.abs(S) >= Math.abs(P) ? S > 0 ? a <= s && s <= u : u <= s && s <= a : P > 0 ? l <= o && o <= g : g <= o && o <= l;
  return !1;
}
function pr(r, e = {}) {
  var t = typeof e == "object" ? e.mutate : e;
  if (!r) throw new Error("geojson is required");
  var i = dr(r), n = [];
  switch (i) {
    case "LineString":
      n = Ve(r, i);
      break;
    case "MultiLineString":
    case "Polygon":
      ve(r).forEach(function(o) {
        n.push(Ve(o, i));
      });
      break;
    case "MultiPolygon":
      ve(r).forEach(function(o) {
        var a = [];
        o.forEach(function(l) {
          a.push(Ve(l, i));
        }), n.push(a);
      });
      break;
    case "Point":
      return r;
    case "MultiPoint":
      var s = {};
      ve(r).forEach(function(o) {
        var a = o.join("-");
        Object.prototype.hasOwnProperty.call(s, a) || (n.push(o), s[a] = !0);
      });
      break;
    default:
      throw new Error(i + " geometry not supported");
  }
  return r.coordinates ? t === !0 ? (r.coordinates = n, r) : { type: i, coordinates: n } : t === !0 ? (r.geometry.coordinates = n, r) : pe({ type: i, coordinates: n }, r.properties, {
    bbox: r.bbox,
    id: r.id
  });
}
function Ve(r, e) {
  const t = ve(r);
  if (t.length === 2 && !dt(t[0], t[1])) return t;
  const i = [];
  let n = 0, s = 1, o = 2;
  for (i.push(t[n]); o < t.length; )
    ft(t[s], ut([t[n], t[o]])) ? s = o : (i.push(t[s]), n = s, s++, o = s), o++;
  if (i.push(t[s]), e === "Polygon" || e === "MultiPolygon") {
    if (ft(
      i[0],
      ut([i[1], i[i.length - 2]])
    ) && (i.shift(), i.pop(), i.push(i[0])), i.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!dt(i[0], i[i.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return i;
}
function dt(r, e) {
  return r[0] === e[0] && r[1] === e[1];
}
function yr(r) {
  if (!r)
    throw new Error("geojson is required");
  switch (r.type) {
    case "Feature":
      return Lt(r);
    case "FeatureCollection":
      return mr(r);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return st(r);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function Lt(r) {
  const e = { type: "Feature" };
  return Object.keys(r).forEach((t) => {
    switch (t) {
      case "type":
      case "properties":
      case "geometry":
        return;
      default:
        e[t] = r[t];
    }
  }), e.properties = Nt(r.properties), r.geometry == null ? e.geometry = null : e.geometry = st(r.geometry), e;
}
function Nt(r) {
  const e = {};
  return r && Object.keys(r).forEach((t) => {
    const i = r[t];
    typeof i == "object" ? i === null ? e[t] = null : Array.isArray(i) ? e[t] = i.map((n) => n) : e[t] = Nt(i) : e[t] = i;
  }), e;
}
function mr(r) {
  const e = { type: "FeatureCollection" };
  return Object.keys(r).forEach((t) => {
    switch (t) {
      case "type":
      case "features":
        return;
      default:
        e[t] = r[t];
    }
  }), e.features = r.features.map((t) => Lt(t)), e;
}
function st(r) {
  const e = { type: r.type };
  return r.bbox && (e.bbox = r.bbox), r.type === "GeometryCollection" ? (e.geometries = r.geometries.map((t) => st(t)), e) : (e.coordinates = Ct(r.coordinates), e);
}
function Ct(r) {
  const e = r;
  return typeof e[0] != "object" ? e.slice() : e.map((t) => Ct(t));
}
function _r(r, e) {
  var t = r[0] - e[0], i = r[1] - e[1];
  return t * t + i * i;
}
function wr(r, e, t) {
  var i = e[0], n = e[1], s = t[0] - i, o = t[1] - n;
  if (s !== 0 || o !== 0) {
    var a = ((r[0] - i) * s + (r[1] - n) * o) / (s * s + o * o);
    a > 1 ? (i = t[0], n = t[1]) : a > 0 && (i += s * a, n += o * a);
  }
  return s = r[0] - i, o = r[1] - n, s * s + o * o;
}
function xr(r, e) {
  for (var t = r[0], i = [t], n, s = 1, o = r.length; s < o; s++)
    n = r[s], _r(n, t) > e && (i.push(n), t = n);
  return t !== n && i.push(n), i;
}
function Je(r, e, t, i, n) {
  for (var s = i, o, a = e + 1; a < t; a++) {
    var l = wr(r[a], r[e], r[t]);
    l > s && (o = a, s = l);
  }
  s > i && (o - e > 1 && Je(r, e, o, i, n), n.push(r[o]), t - o > 1 && Je(r, o, t, i, n));
}
function br(r, e) {
  var t = r.length - 1, i = [r[0]];
  return Je(r, 0, t, e, i), i.push(r[t]), i;
}
function Be(r, e, t) {
  if (r.length <= 2) return r;
  var i = e !== void 0 ? e * e : 1;
  return r = t ? r : xr(r, i), r = br(r, i), r;
}
function kr(r, e = {}) {
  var t, i, n;
  if (e = e ?? {}, !or(e)) throw new Error("options is invalid");
  const s = (t = e.tolerance) != null ? t : 1, o = (i = e.highQuality) != null ? i : !1, a = (n = e.mutate) != null ? n : !1;
  if (!r) throw new Error("geojson is required");
  if (s && s < 0) throw new Error("invalid tolerance");
  return a !== !0 && (r = yr(r)), De(r, function(l) {
    vr(l, s, o);
  }), r;
}
function vr(r, e, t) {
  const i = r.type;
  if (i === "Point" || i === "MultiPoint") return r;
  if (pr(r, { mutate: !0 }), i !== "GeometryCollection")
    switch (i) {
      case "LineString":
        r.coordinates = Be(
          r.coordinates,
          e,
          t
        );
        break;
      case "MultiLineString":
        r.coordinates = r.coordinates.map(
          (n) => Be(n, e, t)
        );
        break;
      case "Polygon":
        r.coordinates = gt(
          r.coordinates,
          e,
          t
        );
        break;
      case "MultiPolygon":
        r.coordinates = r.coordinates.map(
          (n) => gt(n, e, t)
        );
    }
  return r;
}
function gt(r, e, t) {
  return r.map(function(i) {
    if (i.length < 4)
      throw new Error("invalid polygon");
    let n = e, s = Be(i, n, t);
    for (; !pt(s) && n >= Number.EPSILON; )
      n -= n * 0.01, s = Be(i, n, t);
    return pt(s) ? ((s[s.length - 1][0] !== s[0][0] || s[s.length - 1][1] !== s[0][1]) && s.push(s[0]), s) : i;
  });
}
function pt(r) {
  return r.length < 3 ? !1 : !(r.length === 3 && r[2][0] === r[0][0] && r[2][1] === r[0][1]);
}
var Mr = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, $e = Math.ceil, ee = Math.floor, K = "[BigNumber Error] ", yt = K + "Number primitive has more than 15 significant digits: ", re = 1e14, C = 14, He = 9007199254740991, Ye = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], ce = 1e7, $ = 1e9;
function Rt(r) {
  var e, t, i, n = M.prototype = { constructor: M, toString: null, valueOf: null }, s = new M(1), o = 20, a = 4, l = -7, u = 21, g = -1e7, d = 1e7, v = !1, S = 1, P = 0, A = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, E = "0123456789abcdefghijklmnopqrstuvwxyz", N = !0;
  function M(h, c) {
    var f, w, y, m, k, p, _, b, x = this;
    if (!(x instanceof M)) return new M(h, c);
    if (c == null) {
      if (h && h._isBigNumber === !0) {
        x.s = h.s, !h.c || h.e > d ? x.c = x.e = null : h.e < g ? x.c = [x.e = 0] : (x.e = h.e, x.c = h.c.slice());
        return;
      }
      if ((p = typeof h == "number") && h * 0 == 0) {
        if (x.s = 1 / h < 0 ? (h = -h, -1) : 1, h === ~~h) {
          for (m = 0, k = h; k >= 10; k /= 10, m++) ;
          m > d ? x.c = x.e = null : (x.e = m, x.c = [h]);
          return;
        }
        b = String(h);
      } else {
        if (!Mr.test(b = String(h))) return i(x, b, p);
        x.s = b.charCodeAt(0) == 45 ? (b = b.slice(1), -1) : 1;
      }
      (m = b.indexOf(".")) > -1 && (b = b.replace(".", "")), (k = b.search(/e/i)) > 0 ? (m < 0 && (m = k), m += +b.slice(k + 1), b = b.substring(0, k)) : m < 0 && (m = b.length);
    } else {
      if (F(c, 2, E.length, "Base"), c == 10 && N)
        return x = new M(h), R(x, o + x.e + 1, a);
      if (b = String(h), p = typeof h == "number") {
        if (h * 0 != 0) return i(x, b, p, c);
        if (x.s = 1 / h < 0 ? (b = b.slice(1), -1) : 1, M.DEBUG && b.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(yt + h);
      } else
        x.s = b.charCodeAt(0) === 45 ? (b = b.slice(1), -1) : 1;
      for (f = E.slice(0, c), m = k = 0, _ = b.length; k < _; k++)
        if (f.indexOf(w = b.charAt(k)) < 0) {
          if (w == ".") {
            if (k > m) {
              m = _;
              continue;
            }
          } else if (!y && (b == b.toUpperCase() && (b = b.toLowerCase()) || b == b.toLowerCase() && (b = b.toUpperCase()))) {
            y = !0, k = -1, m = 0;
            continue;
          }
          return i(x, String(h), p, c);
        }
      p = !1, b = t(b, c, 10, x.s), (m = b.indexOf(".")) > -1 ? b = b.replace(".", "") : m = b.length;
    }
    for (k = 0; b.charCodeAt(k) === 48; k++) ;
    for (_ = b.length; b.charCodeAt(--_) === 48; ) ;
    if (b = b.slice(k, ++_)) {
      if (_ -= k, p && M.DEBUG && _ > 15 && (h > He || h !== ee(h)))
        throw Error(yt + x.s * h);
      if ((m = m - k - 1) > d)
        x.c = x.e = null;
      else if (m < g)
        x.c = [x.e = 0];
      else {
        if (x.e = m, x.c = [], k = (m + 1) % C, m < 0 && (k += C), k < _) {
          for (k && x.c.push(+b.slice(0, k)), _ -= C; k < _; )
            x.c.push(+b.slice(k, k += C));
          k = C - (b = b.slice(k)).length;
        } else
          k -= _;
        for (; k--; b += "0") ;
        x.c.push(+b);
      }
    } else
      x.c = [x.e = 0];
  }
  M.clone = Rt, M.ROUND_UP = 0, M.ROUND_DOWN = 1, M.ROUND_CEIL = 2, M.ROUND_FLOOR = 3, M.ROUND_HALF_UP = 4, M.ROUND_HALF_DOWN = 5, M.ROUND_HALF_EVEN = 6, M.ROUND_HALF_CEIL = 7, M.ROUND_HALF_FLOOR = 8, M.EUCLID = 9, M.config = M.set = function(h) {
    var c, f;
    if (h != null)
      if (typeof h == "object") {
        if (h.hasOwnProperty(c = "DECIMAL_PLACES") && (f = h[c], F(f, 0, $, c), o = f), h.hasOwnProperty(c = "ROUNDING_MODE") && (f = h[c], F(f, 0, 8, c), a = f), h.hasOwnProperty(c = "EXPONENTIAL_AT") && (f = h[c], f && f.pop ? (F(f[0], -$, 0, c), F(f[1], 0, $, c), l = f[0], u = f[1]) : (F(f, -$, $, c), l = -(u = f < 0 ? -f : f))), h.hasOwnProperty(c = "RANGE"))
          if (f = h[c], f && f.pop)
            F(f[0], -$, -1, c), F(f[1], 1, $, c), g = f[0], d = f[1];
          else if (F(f, -$, $, c), f)
            g = -(d = f < 0 ? -f : f);
          else
            throw Error(K + c + " cannot be zero: " + f);
        if (h.hasOwnProperty(c = "CRYPTO"))
          if (f = h[c], f === !!f)
            if (f)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                v = f;
              else
                throw v = !f, Error(K + "crypto unavailable");
            else
              v = f;
          else
            throw Error(K + c + " not true or false: " + f);
        if (h.hasOwnProperty(c = "MODULO_MODE") && (f = h[c], F(f, 0, 9, c), S = f), h.hasOwnProperty(c = "POW_PRECISION") && (f = h[c], F(f, 0, $, c), P = f), h.hasOwnProperty(c = "FORMAT"))
          if (f = h[c], typeof f == "object") A = f;
          else throw Error(K + c + " not an object: " + f);
        if (h.hasOwnProperty(c = "ALPHABET"))
          if (f = h[c], typeof f == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(f))
            N = f.slice(0, 10) == "0123456789", E = f;
          else
            throw Error(K + c + " invalid: " + f);
      } else
        throw Error(K + "Object expected: " + h);
    return {
      DECIMAL_PLACES: o,
      ROUNDING_MODE: a,
      EXPONENTIAL_AT: [l, u],
      RANGE: [g, d],
      CRYPTO: v,
      MODULO_MODE: S,
      POW_PRECISION: P,
      FORMAT: A,
      ALPHABET: E
    };
  }, M.isBigNumber = function(h) {
    if (!h || h._isBigNumber !== !0) return !1;
    if (!M.DEBUG) return !0;
    var c, f, w = h.c, y = h.e, m = h.s;
    e: if ({}.toString.call(w) == "[object Array]") {
      if ((m === 1 || m === -1) && y >= -$ && y <= $ && y === ee(y)) {
        if (w[0] === 0) {
          if (y === 0 && w.length === 1) return !0;
          break e;
        }
        if (c = (y + 1) % C, c < 1 && (c += C), String(w[0]).length == c) {
          for (c = 0; c < w.length; c++)
            if (f = w[c], f < 0 || f >= re || f !== ee(f)) break e;
          if (f !== 0) return !0;
        }
      }
    } else if (w === null && y === null && (m === null || m === 1 || m === -1))
      return !0;
    throw Error(K + "Invalid BigNumber: " + h);
  }, M.maximum = M.max = function() {
    return G(arguments, -1);
  }, M.minimum = M.min = function() {
    return G(arguments, 1);
  }, M.random = (function() {
    var h = 9007199254740992, c = Math.random() * h & 2097151 ? function() {
      return ee(Math.random() * h);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(f) {
      var w, y, m, k, p, _ = 0, b = [], x = new M(s);
      if (f == null ? f = o : F(f, 0, $), k = $e(f / C), v)
        if (crypto.getRandomValues) {
          for (w = crypto.getRandomValues(new Uint32Array(k *= 2)); _ < k; )
            p = w[_] * 131072 + (w[_ + 1] >>> 11), p >= 9e15 ? (y = crypto.getRandomValues(new Uint32Array(2)), w[_] = y[0], w[_ + 1] = y[1]) : (b.push(p % 1e14), _ += 2);
          _ = k / 2;
        } else if (crypto.randomBytes) {
          for (w = crypto.randomBytes(k *= 7); _ < k; )
            p = (w[_] & 31) * 281474976710656 + w[_ + 1] * 1099511627776 + w[_ + 2] * 4294967296 + w[_ + 3] * 16777216 + (w[_ + 4] << 16) + (w[_ + 5] << 8) + w[_ + 6], p >= 9e15 ? crypto.randomBytes(7).copy(w, _) : (b.push(p % 1e14), _ += 7);
          _ = k / 7;
        } else
          throw v = !1, Error(K + "crypto unavailable");
      if (!v)
        for (; _ < k; )
          p = c(), p < 9e15 && (b[_++] = p % 1e14);
      for (k = b[--_], f %= C, k && f && (p = Ye[C - f], b[_] = ee(k / p) * p); b[_] === 0; b.pop(), _--) ;
      if (_ < 0)
        b = [m = 0];
      else {
        for (m = -1; b[0] === 0; b.splice(0, 1), m -= C) ;
        for (_ = 1, p = b[0]; p >= 10; p /= 10, _++) ;
        _ < C && (m -= C - _);
      }
      return x.e = m, x.c = b, x;
    };
  })(), M.sum = function() {
    for (var h = 1, c = arguments, f = new M(c[0]); h < c.length; ) f = f.plus(c[h++]);
    return f;
  }, t = /* @__PURE__ */ (function() {
    var h = "0123456789";
    function c(f, w, y, m) {
      for (var k, p = [0], _, b = 0, x = f.length; b < x; ) {
        for (_ = p.length; _--; p[_] *= w) ;
        for (p[0] += m.indexOf(f.charAt(b++)), k = 0; k < p.length; k++)
          p[k] > y - 1 && (p[k + 1] == null && (p[k + 1] = 0), p[k + 1] += p[k] / y | 0, p[k] %= y);
      }
      return p.reverse();
    }
    return function(f, w, y, m, k) {
      var p, _, b, x, T, I, L, B, D = f.indexOf("."), V = o, O = a;
      for (D >= 0 && (x = P, P = 0, f = f.replace(".", ""), B = new M(w), I = B.pow(f.length - D), P = x, B.c = c(
        ae(Z(I.c), I.e, "0"),
        10,
        y,
        h
      ), B.e = B.c.length), L = c(f, w, y, k ? (p = E, h) : (p = h, E)), b = x = L.length; L[--x] == 0; L.pop()) ;
      if (!L[0]) return p.charAt(0);
      if (D < 0 ? --b : (I.c = L, I.e = b, I.s = m, I = e(I, B, V, O, y), L = I.c, T = I.r, b = I.e), _ = b + V + 1, D = L[_], x = y / 2, T = T || _ < 0 || L[_ + 1] != null, T = O < 4 ? (D != null || T) && (O == 0 || O == (I.s < 0 ? 3 : 2)) : D > x || D == x && (O == 4 || T || O == 6 && L[_ - 1] & 1 || O == (I.s < 0 ? 8 : 7)), _ < 1 || !L[0])
        f = T ? ae(p.charAt(1), -V, p.charAt(0)) : p.charAt(0);
      else {
        if (L.length = _, T)
          for (--y; ++L[--_] > y; )
            L[_] = 0, _ || (++b, L = [1].concat(L));
        for (x = L.length; !L[--x]; ) ;
        for (D = 0, f = ""; D <= x; f += p.charAt(L[D++])) ;
        f = ae(f, b, p.charAt(0));
      }
      return f;
    };
  })(), e = /* @__PURE__ */ (function() {
    function h(w, y, m) {
      var k, p, _, b, x = 0, T = w.length, I = y % ce, L = y / ce | 0;
      for (w = w.slice(); T--; )
        _ = w[T] % ce, b = w[T] / ce | 0, k = L * _ + b * I, p = I * _ + k % ce * ce + x, x = (p / m | 0) + (k / ce | 0) + L * b, w[T] = p % m;
      return x && (w = [x].concat(w)), w;
    }
    function c(w, y, m, k) {
      var p, _;
      if (m != k)
        _ = m > k ? 1 : -1;
      else
        for (p = _ = 0; p < m; p++)
          if (w[p] != y[p]) {
            _ = w[p] > y[p] ? 1 : -1;
            break;
          }
      return _;
    }
    function f(w, y, m, k) {
      for (var p = 0; m--; )
        w[m] -= p, p = w[m] < y[m] ? 1 : 0, w[m] = p * k + w[m] - y[m];
      for (; !w[0] && w.length > 1; w.splice(0, 1)) ;
    }
    return function(w, y, m, k, p) {
      var _, b, x, T, I, L, B, D, V, O, z, H, Se, Ue, je, ne, ye, J = w.s == y.s ? 1 : -1, X = w.c, U = y.c;
      if (!X || !X[0] || !U || !U[0])
        return new M(
          // Return NaN if either NaN, or both Infinity or 0.
          !w.s || !y.s || (X ? U && X[0] == U[0] : !U) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            X && X[0] == 0 || !U ? J * 0 : J / 0
          )
        );
      for (D = new M(J), V = D.c = [], b = w.e - y.e, J = m + b + 1, p || (p = re, b = te(w.e / C) - te(y.e / C), J = J / C | 0), x = 0; U[x] == (X[x] || 0); x++) ;
      if (U[x] > (X[x] || 0) && b--, J < 0)
        V.push(1), T = !0;
      else {
        for (Ue = X.length, ne = U.length, x = 0, J += 2, I = ee(p / (U[0] + 1)), I > 1 && (U = h(U, I, p), X = h(X, I, p), ne = U.length, Ue = X.length), Se = ne, O = X.slice(0, ne), z = O.length; z < ne; O[z++] = 0) ;
        ye = U.slice(), ye = [0].concat(ye), je = U[0], U[1] >= p / 2 && je++;
        do {
          if (I = 0, _ = c(U, O, ne, z), _ < 0) {
            if (H = O[0], ne != z && (H = H * p + (O[1] || 0)), I = ee(H / je), I > 1)
              for (I >= p && (I = p - 1), L = h(U, I, p), B = L.length, z = O.length; c(L, O, B, z) == 1; )
                I--, f(L, ne < B ? ye : U, B, p), B = L.length, _ = 1;
            else
              I == 0 && (_ = I = 1), L = U.slice(), B = L.length;
            if (B < z && (L = [0].concat(L)), f(O, L, z, p), z = O.length, _ == -1)
              for (; c(U, O, ne, z) < 1; )
                I++, f(O, ne < z ? ye : U, z, p), z = O.length;
          } else _ === 0 && (I++, O = [0]);
          V[x++] = I, O[0] ? O[z++] = X[Se] || 0 : (O = [X[Se]], z = 1);
        } while ((Se++ < Ue || O[0] != null) && J--);
        T = O[0] != null, V[0] || V.splice(0, 1);
      }
      if (p == re) {
        for (x = 1, J = V[0]; J >= 10; J /= 10, x++) ;
        R(D, m + (D.e = x + b * C - 1) + 1, k, T);
      } else
        D.e = b, D.r = +T;
      return D;
    };
  })();
  function j(h, c, f, w) {
    var y, m, k, p, _;
    if (f == null ? f = a : F(f, 0, 8), !h.c) return h.toString();
    if (y = h.c[0], k = h.e, c == null)
      _ = Z(h.c), _ = w == 1 || w == 2 && (k <= l || k >= u) ? Ee(_, k) : ae(_, k, "0");
    else if (h = R(new M(h), c, f), m = h.e, _ = Z(h.c), p = _.length, w == 1 || w == 2 && (c <= m || m <= l)) {
      for (; p < c; _ += "0", p++) ;
      _ = Ee(_, m);
    } else if (c -= k + (w === 2 && m > k), _ = ae(_, m, "0"), m + 1 > p) {
      if (--c > 0) for (_ += "."; c--; _ += "0") ;
    } else if (c += m - p, c > 0)
      for (m + 1 == p && (_ += "."); c--; _ += "0") ;
    return h.s < 0 && y ? "-" + _ : _;
  }
  function G(h, c) {
    for (var f, w, y = 1, m = new M(h[0]); y < h.length; y++)
      w = new M(h[y]), (!w.s || (f = fe(m, w)) === c || f === 0 && m.s === c) && (m = w);
    return m;
  }
  function W(h, c, f) {
    for (var w = 1, y = c.length; !c[--y]; c.pop()) ;
    for (y = c[0]; y >= 10; y /= 10, w++) ;
    return (f = w + f * C - 1) > d ? h.c = h.e = null : f < g ? h.c = [h.e = 0] : (h.e = f, h.c = c), h;
  }
  i = /* @__PURE__ */ (function() {
    var h = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, c = /^([^.]+)\\.$/, f = /^\\.([^.]+)$/, w = /^-?(Infinity|NaN)$/, y = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(m, k, p, _) {
      var b, x = p ? k : k.replace(y, "");
      if (w.test(x))
        m.s = isNaN(x) ? null : x < 0 ? -1 : 1;
      else {
        if (!p && (x = x.replace(h, function(T, I, L) {
          return b = (L = L.toLowerCase()) == "x" ? 16 : L == "b" ? 2 : 8, !_ || _ == b ? I : T;
        }), _ && (b = _, x = x.replace(c, "$1").replace(f, "0.$1")), k != x))
          return new M(x, b);
        if (M.DEBUG)
          throw Error(K + "Not a" + (_ ? " base " + _ : "") + " number: " + k);
        m.s = null;
      }
      m.c = m.e = null;
    };
  })();
  function R(h, c, f, w) {
    var y, m, k, p, _, b, x, T = h.c, I = Ye;
    if (T) {
      e: {
        for (y = 1, p = T[0]; p >= 10; p /= 10, y++) ;
        if (m = c - y, m < 0)
          m += C, k = c, _ = T[b = 0], x = ee(_ / I[y - k - 1] % 10);
        else if (b = $e((m + 1) / C), b >= T.length)
          if (w) {
            for (; T.length <= b; T.push(0)) ;
            _ = x = 0, y = 1, m %= C, k = m - C + 1;
          } else
            break e;
        else {
          for (_ = p = T[b], y = 1; p >= 10; p /= 10, y++) ;
          m %= C, k = m - C + y, x = k < 0 ? 0 : ee(_ / I[y - k - 1] % 10);
        }
        if (w = w || c < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        T[b + 1] != null || (k < 0 ? _ : _ % I[y - k - 1]), w = f < 4 ? (x || w) && (f == 0 || f == (h.s < 0 ? 3 : 2)) : x > 5 || x == 5 && (f == 4 || w || f == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (m > 0 ? k > 0 ? _ / I[y - k] : 0 : T[b - 1]) % 10 & 1 || f == (h.s < 0 ? 8 : 7)), c < 1 || !T[0])
          return T.length = 0, w ? (c -= h.e + 1, T[0] = I[(C - c % C) % C], h.e = -c || 0) : T[0] = h.e = 0, h;
        if (m == 0 ? (T.length = b, p = 1, b--) : (T.length = b + 1, p = I[C - m], T[b] = k > 0 ? ee(_ / I[y - k] % I[k]) * p : 0), w)
          for (; ; )
            if (b == 0) {
              for (m = 1, k = T[0]; k >= 10; k /= 10, m++) ;
              for (k = T[0] += p, p = 1; k >= 10; k /= 10, p++) ;
              m != p && (h.e++, T[0] == re && (T[0] = 1));
              break;
            } else {
              if (T[b] += p, T[b] != re) break;
              T[b--] = 0, p = 1;
            }
        for (m = T.length; T[--m] === 0; T.pop()) ;
      }
      h.e > d ? h.c = h.e = null : h.e < g && (h.c = [h.e = 0]);
    }
    return h;
  }
  function q(h) {
    var c, f = h.e;
    return f === null ? h.toString() : (c = Z(h.c), c = f <= l || f >= u ? Ee(c, f) : ae(c, f, "0"), h.s < 0 ? "-" + c : c);
  }
  return n.absoluteValue = n.abs = function() {
    var h = new M(this);
    return h.s < 0 && (h.s = 1), h;
  }, n.comparedTo = function(h, c) {
    return fe(this, new M(h, c));
  }, n.decimalPlaces = n.dp = function(h, c) {
    var f, w, y, m = this;
    if (h != null)
      return F(h, 0, $), c == null ? c = a : F(c, 0, 8), R(new M(m), h + m.e + 1, c);
    if (!(f = m.c)) return null;
    if (w = ((y = f.length - 1) - te(this.e / C)) * C, y = f[y]) for (; y % 10 == 0; y /= 10, w--) ;
    return w < 0 && (w = 0), w;
  }, n.dividedBy = n.div = function(h, c) {
    return e(this, new M(h, c), o, a);
  }, n.dividedToIntegerBy = n.idiv = function(h, c) {
    return e(this, new M(h, c), 0, 1);
  }, n.exponentiatedBy = n.pow = function(h, c) {
    var f, w, y, m, k, p, _, b, x, T = this;
    if (h = new M(h), h.c && !h.isInteger())
      throw Error(K + "Exponent not an integer: " + q(h));
    if (c != null && (c = new M(c)), p = h.e > 14, !T.c || !T.c[0] || T.c[0] == 1 && !T.e && T.c.length == 1 || !h.c || !h.c[0])
      return x = new M(Math.pow(+q(T), p ? h.s * (2 - Te(h)) : +q(h))), c ? x.mod(c) : x;
    if (_ = h.s < 0, c) {
      if (c.c ? !c.c[0] : !c.s) return new M(NaN);
      w = !_ && T.isInteger() && c.isInteger(), w && (T = T.mod(c));
    } else {
      if (h.e > 9 && (T.e > 0 || T.e < -1 || (T.e == 0 ? T.c[0] > 1 || p && T.c[1] >= 24e7 : T.c[0] < 8e13 || p && T.c[0] <= 9999975e7)))
        return m = T.s < 0 && Te(h) ? -0 : 0, T.e > -1 && (m = 1 / m), new M(_ ? 1 / m : m);
      P && (m = $e(P / C + 2));
    }
    for (p ? (f = new M(0.5), _ && (h.s = 1), b = Te(h)) : (y = Math.abs(+q(h)), b = y % 2), x = new M(s); ; ) {
      if (b) {
        if (x = x.times(T), !x.c) break;
        m ? x.c.length > m && (x.c.length = m) : w && (x = x.mod(c));
      }
      if (y) {
        if (y = ee(y / 2), y === 0) break;
        b = y % 2;
      } else if (h = h.times(f), R(h, h.e + 1, 1), h.e > 14)
        b = Te(h);
      else {
        if (y = +q(h), y === 0) break;
        b = y % 2;
      }
      T = T.times(T), m ? T.c && T.c.length > m && (T.c.length = m) : w && (T = T.mod(c));
    }
    return w ? x : (_ && (x = s.div(x)), c ? x.mod(c) : m ? R(x, P, a, k) : x);
  }, n.integerValue = function(h) {
    var c = new M(this);
    return h == null ? h = a : F(h, 0, 8), R(c, c.e + 1, h);
  }, n.isEqualTo = n.eq = function(h, c) {
    return fe(this, new M(h, c)) === 0;
  }, n.isFinite = function() {
    return !!this.c;
  }, n.isGreaterThan = n.gt = function(h, c) {
    return fe(this, new M(h, c)) > 0;
  }, n.isGreaterThanOrEqualTo = n.gte = function(h, c) {
    return (c = fe(this, new M(h, c))) === 1 || c === 0;
  }, n.isInteger = function() {
    return !!this.c && te(this.e / C) > this.c.length - 2;
  }, n.isLessThan = n.lt = function(h, c) {
    return fe(this, new M(h, c)) < 0;
  }, n.isLessThanOrEqualTo = n.lte = function(h, c) {
    return (c = fe(this, new M(h, c))) === -1 || c === 0;
  }, n.isNaN = function() {
    return !this.s;
  }, n.isNegative = function() {
    return this.s < 0;
  }, n.isPositive = function() {
    return this.s > 0;
  }, n.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, n.minus = function(h, c) {
    var f, w, y, m, k = this, p = k.s;
    if (h = new M(h, c), c = h.s, !p || !c) return new M(NaN);
    if (p != c)
      return h.s = -c, k.plus(h);
    var _ = k.e / C, b = h.e / C, x = k.c, T = h.c;
    if (!_ || !b) {
      if (!x || !T) return x ? (h.s = -c, h) : new M(T ? k : NaN);
      if (!x[0] || !T[0])
        return T[0] ? (h.s = -c, h) : new M(x[0] ? k : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          a == 3 ? -0 : 0
        ));
    }
    if (_ = te(_), b = te(b), x = x.slice(), p = _ - b) {
      for ((m = p < 0) ? (p = -p, y = x) : (b = _, y = T), y.reverse(), c = p; c--; y.push(0)) ;
      y.reverse();
    } else
      for (w = (m = (p = x.length) < (c = T.length)) ? p : c, p = c = 0; c < w; c++)
        if (x[c] != T[c]) {
          m = x[c] < T[c];
          break;
        }
    if (m && (y = x, x = T, T = y, h.s = -h.s), c = (w = T.length) - (f = x.length), c > 0) for (; c--; x[f++] = 0) ;
    for (c = re - 1; w > p; ) {
      if (x[--w] < T[w]) {
        for (f = w; f && !x[--f]; x[f] = c) ;
        --x[f], x[w] += re;
      }
      x[w] -= T[w];
    }
    for (; x[0] == 0; x.splice(0, 1), --b) ;
    return x[0] ? W(h, x, b) : (h.s = a == 3 ? -1 : 1, h.c = [h.e = 0], h);
  }, n.modulo = n.mod = function(h, c) {
    var f, w, y = this;
    return h = new M(h, c), !y.c || !h.s || h.c && !h.c[0] ? new M(NaN) : !h.c || y.c && !y.c[0] ? new M(y) : (S == 9 ? (w = h.s, h.s = 1, f = e(y, h, 0, 3), h.s = w, f.s *= w) : f = e(y, h, 0, S), h = y.minus(f.times(h)), !h.c[0] && S == 1 && (h.s = y.s), h);
  }, n.multipliedBy = n.times = function(h, c) {
    var f, w, y, m, k, p, _, b, x, T, I, L, B, D, V, O = this, z = O.c, H = (h = new M(h, c)).c;
    if (!z || !H || !z[0] || !H[0])
      return !O.s || !h.s || z && !z[0] && !H || H && !H[0] && !z ? h.c = h.e = h.s = null : (h.s *= O.s, !z || !H ? h.c = h.e = null : (h.c = [0], h.e = 0)), h;
    for (w = te(O.e / C) + te(h.e / C), h.s *= O.s, _ = z.length, T = H.length, _ < T && (B = z, z = H, H = B, y = _, _ = T, T = y), y = _ + T, B = []; y--; B.push(0)) ;
    for (D = re, V = ce, y = T; --y >= 0; ) {
      for (f = 0, I = H[y] % V, L = H[y] / V | 0, k = _, m = y + k; m > y; )
        b = z[--k] % V, x = z[k] / V | 0, p = L * b + x * I, b = I * b + p % V * V + B[m] + f, f = (b / D | 0) + (p / V | 0) + L * x, B[m--] = b % D;
      B[m] = f;
    }
    return f ? ++w : B.splice(0, 1), W(h, B, w);
  }, n.negated = function() {
    var h = new M(this);
    return h.s = -h.s || null, h;
  }, n.plus = function(h, c) {
    var f, w = this, y = w.s;
    if (h = new M(h, c), c = h.s, !y || !c) return new M(NaN);
    if (y != c)
      return h.s = -c, w.minus(h);
    var m = w.e / C, k = h.e / C, p = w.c, _ = h.c;
    if (!m || !k) {
      if (!p || !_) return new M(y / 0);
      if (!p[0] || !_[0]) return _[0] ? h : new M(p[0] ? w : y * 0);
    }
    if (m = te(m), k = te(k), p = p.slice(), y = m - k) {
      for (y > 0 ? (k = m, f = _) : (y = -y, f = p), f.reverse(); y--; f.push(0)) ;
      f.reverse();
    }
    for (y = p.length, c = _.length, y - c < 0 && (f = _, _ = p, p = f, c = y), y = 0; c; )
      y = (p[--c] = p[c] + _[c] + y) / re | 0, p[c] = re === p[c] ? 0 : p[c] % re;
    return y && (p = [y].concat(p), ++k), W(h, p, k);
  }, n.precision = n.sd = function(h, c) {
    var f, w, y, m = this;
    if (h != null && h !== !!h)
      return F(h, 1, $), c == null ? c = a : F(c, 0, 8), R(new M(m), h, c);
    if (!(f = m.c)) return null;
    if (y = f.length - 1, w = y * C + 1, y = f[y]) {
      for (; y % 10 == 0; y /= 10, w--) ;
      for (y = f[0]; y >= 10; y /= 10, w++) ;
    }
    return h && m.e + 1 > w && (w = m.e + 1), w;
  }, n.shiftedBy = function(h) {
    return F(h, -He, He), this.times("1e" + h);
  }, n.squareRoot = n.sqrt = function() {
    var h, c, f, w, y, m = this, k = m.c, p = m.s, _ = m.e, b = o + 4, x = new M("0.5");
    if (p !== 1 || !k || !k[0])
      return new M(!p || p < 0 && (!k || k[0]) ? NaN : k ? m : 1 / 0);
    if (p = Math.sqrt(+q(m)), p == 0 || p == 1 / 0 ? (c = Z(k), (c.length + _) % 2 == 0 && (c += "0"), p = Math.sqrt(+c), _ = te((_ + 1) / 2) - (_ < 0 || _ % 2), p == 1 / 0 ? c = "5e" + _ : (c = p.toExponential(), c = c.slice(0, c.indexOf("e") + 1) + _), f = new M(c)) : f = new M(p + ""), f.c[0]) {
      for (_ = f.e, p = _ + b, p < 3 && (p = 0); ; )
        if (y = f, f = x.times(y.plus(e(m, y, b, 1))), Z(y.c).slice(0, p) === (c = Z(f.c)).slice(0, p))
          if (f.e < _ && --p, c = c.slice(p - 3, p + 1), c == "9999" || !w && c == "4999") {
            if (!w && (R(y, y.e + o + 2, 0), y.times(y).eq(m))) {
              f = y;
              break;
            }
            b += 4, p += 4, w = 1;
          } else {
            (!+c || !+c.slice(1) && c.charAt(0) == "5") && (R(f, f.e + o + 2, 1), h = !f.times(f).eq(m));
            break;
          }
    }
    return R(f, f.e + o + 1, a, h);
  }, n.toExponential = function(h, c) {
    return h != null && (F(h, 0, $), h++), j(this, h, c, 1);
  }, n.toFixed = function(h, c) {
    return h != null && (F(h, 0, $), h = h + this.e + 1), j(this, h, c);
  }, n.toFormat = function(h, c, f) {
    var w, y = this;
    if (f == null)
      h != null && c && typeof c == "object" ? (f = c, c = null) : h && typeof h == "object" ? (f = h, h = c = null) : f = A;
    else if (typeof f != "object")
      throw Error(K + "Argument not an object: " + f);
    if (w = y.toFixed(h, c), y.c) {
      var m, k = w.split("."), p = +f.groupSize, _ = +f.secondaryGroupSize, b = f.groupSeparator || "", x = k[0], T = k[1], I = y.s < 0, L = I ? x.slice(1) : x, B = L.length;
      if (_ && (m = p, p = _, _ = m, B -= m), p > 0 && B > 0) {
        for (m = B % p || p, x = L.substr(0, m); m < B; m += p) x += b + L.substr(m, p);
        _ > 0 && (x += b + L.slice(m)), I && (x = "-" + x);
      }
      w = T ? x + (f.decimalSeparator || "") + ((_ = +f.fractionGroupSize) ? T.replace(
        new RegExp("\\\\d{" + _ + "}\\\\B", "g"),
        "$&" + (f.fractionGroupSeparator || "")
      ) : T) : x;
    }
    return (f.prefix || "") + w + (f.suffix || "");
  }, n.toFraction = function(h) {
    var c, f, w, y, m, k, p, _, b, x, T, I, L = this, B = L.c;
    if (h != null && (p = new M(h), !p.isInteger() && (p.c || p.s !== 1) || p.lt(s)))
      throw Error(K + "Argument " + (p.isInteger() ? "out of range: " : "not an integer: ") + q(p));
    if (!B) return new M(L);
    for (c = new M(s), b = f = new M(s), w = _ = new M(s), I = Z(B), m = c.e = I.length - L.e - 1, c.c[0] = Ye[(k = m % C) < 0 ? C + k : k], h = !h || p.comparedTo(c) > 0 ? m > 0 ? c : b : p, k = d, d = 1 / 0, p = new M(I), _.c[0] = 0; x = e(p, c, 0, 1), y = f.plus(x.times(w)), y.comparedTo(h) != 1; )
      f = w, w = y, b = _.plus(x.times(y = b)), _ = y, c = p.minus(x.times(y = c)), p = y;
    return y = e(h.minus(f), w, 0, 1), _ = _.plus(y.times(b)), f = f.plus(y.times(w)), _.s = b.s = L.s, m = m * 2, T = e(b, w, m, a).minus(L).abs().comparedTo(
      e(_, f, m, a).minus(L).abs()
    ) < 1 ? [b, w] : [_, f], d = k, T;
  }, n.toNumber = function() {
    return +q(this);
  }, n.toPrecision = function(h, c) {
    return h != null && F(h, 1, $), j(this, h, c, 2);
  }, n.toString = function(h) {
    var c, f = this, w = f.s, y = f.e;
    return y === null ? w ? (c = "Infinity", w < 0 && (c = "-" + c)) : c = "NaN" : (h == null ? c = y <= l || y >= u ? Ee(Z(f.c), y) : ae(Z(f.c), y, "0") : h === 10 && N ? (f = R(new M(f), o + y + 1, a), c = ae(Z(f.c), f.e, "0")) : (F(h, 2, E.length, "Base"), c = t(ae(Z(f.c), y, "0"), 10, h, w, !0)), w < 0 && f.c[0] && (c = "-" + c)), c;
  }, n.valueOf = n.toJSON = function() {
    return q(this);
  }, n._isBigNumber = !0, n[Symbol.toStringTag] = "BigNumber", n[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = n.valueOf, r != null && M.set(r), M;
}
function te(r) {
  var e = r | 0;
  return r > 0 || r === e ? e : e - 1;
}
function Z(r) {
  for (var e, t, i = 1, n = r.length, s = r[0] + ""; i < n; ) {
    for (e = r[i++] + "", t = C - e.length; t--; e = "0" + e) ;
    s += e;
  }
  for (n = s.length; s.charCodeAt(--n) === 48; ) ;
  return s.slice(0, n + 1 || 1);
}
function fe(r, e) {
  var t, i, n = r.c, s = e.c, o = r.s, a = e.s, l = r.e, u = e.e;
  if (!o || !a) return null;
  if (t = n && !n[0], i = s && !s[0], t || i) return t ? i ? 0 : -a : o;
  if (o != a) return o;
  if (t = o < 0, i = l == u, !n || !s) return i ? 0 : !n ^ t ? 1 : -1;
  if (!i) return l > u ^ t ? 1 : -1;
  for (a = (l = n.length) < (u = s.length) ? l : u, o = 0; o < a; o++) if (n[o] != s[o]) return n[o] > s[o] ^ t ? 1 : -1;
  return l == u ? 0 : l > u ^ t ? 1 : -1;
}
function F(r, e, t, i) {
  if (r < e || r > t || r !== ee(r))
    throw Error(K + (i || "Argument") + (typeof r == "number" ? r < e || r > t ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(r));
}
function Te(r) {
  var e = r.c.length - 1;
  return te(r.e / C) == e && r.c[e] % 2 != 0;
}
function Ee(r, e) {
  return (r.length > 1 ? r.charAt(0) + "." + r.slice(1) : r) + (e < 0 ? "e" : "e+") + e;
}
function ae(r, e, t) {
  var i, n;
  if (e < 0) {
    for (n = t + "."; ++e; n += t) ;
    r = n + r;
  } else if (i = r.length, ++e > i) {
    for (n = t, e -= i; --e; n += t) ;
    r += n;
  } else e < i && (r = r.slice(0, e) + "." + r.slice(e));
  return r;
}
var oe = Rt(), Sr = class {
  key;
  left = null;
  right = null;
  constructor(r) {
    this.key = r;
  }
}, me = class extends Sr {
  constructor(r) {
    super(r);
  }
}, Tr = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(r) {
    const e = this.root;
    if (e == null)
      return this.compare(r, r), -1;
    let t = null, i = null, n = null, s = null, o = e;
    const a = this.compare;
    let l;
    for (; ; )
      if (l = a(o.key, r), l > 0) {
        let u = o.left;
        if (u == null || (l = a(u.key, r), l > 0 && (o.left = u.right, u.right = o, o = u, u = o.left, u == null)))
          break;
        t == null ? i = o : t.left = o, t = o, o = u;
      } else if (l < 0) {
        let u = o.right;
        if (u == null || (l = a(u.key, r), l < 0 && (o.right = u.left, u.left = o, o = u, u = o.right, u == null)))
          break;
        n == null ? s = o : n.right = o, n = o, o = u;
      } else
        break;
    return n != null && (n.right = o.left, o.left = s), t != null && (t.left = o.right, o.right = i), this.root !== o && (this.root = o, this.splayCount++), l;
  }
  splayMin(r) {
    let e = r, t = e.left;
    for (; t != null; ) {
      const i = t;
      e.left = i.right, i.right = e, e = i, t = e.left;
    }
    return e;
  }
  splayMax(r) {
    let e = r, t = e.right;
    for (; t != null; ) {
      const i = t;
      e.right = i.left, i.left = e, e = i, t = e.right;
    }
    return e;
  }
  _delete(r) {
    if (this.root == null || this.splay(r) != 0) return null;
    let t = this.root;
    const i = t, n = t.left;
    if (this.size--, n == null)
      this.root = t.right;
    else {
      const s = t.right;
      t = this.splayMax(n), t.right = s, this.root = t;
    }
    return this.modificationCount++, i;
  }
  addNewRoot(r, e) {
    this.size++, this.modificationCount++;
    const t = this.root;
    if (t == null) {
      this.root = r;
      return;
    }
    e < 0 ? (r.left = t, r.right = t.right, t.right = null) : (r.right = t, r.left = t.left, t.left = null), this.root = r;
  }
  _first() {
    const r = this.root;
    return r == null ? null : (this.root = this.splayMin(r), this.root);
  }
  _last() {
    const r = this.root;
    return r == null ? null : (this.root = this.splayMax(r), this.root);
  }
  clear() {
    this.root = null, this.size = 0, this.modificationCount++;
  }
  has(r) {
    return this.validKey(r) && this.splay(r) == 0;
  }
  defaultCompare() {
    return (r, e) => r < e ? -1 : r > e ? 1 : 0;
  }
  wrap() {
    return {
      getRoot: () => this.root,
      setRoot: (r) => {
        this.root = r;
      },
      getSize: () => this.size,
      getModificationCount: () => this.modificationCount,
      getSplayCount: () => this.splayCount,
      setSplayCount: (r) => {
        this.splayCount = r;
      },
      splay: (r) => this.splay(r),
      has: (r) => this.has(r)
    };
  }
}, ze = class be extends Tr {
  root = null;
  compare;
  validKey;
  constructor(e, t) {
    super(), this.compare = e ?? this.defaultCompare(), this.validKey = t ?? ((i) => i != null && i != null);
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
    let i;
    for (; i = t.next(), !i.done; )
      e(i.value, i.value, this);
  }
  add(e) {
    const t = this.splay(e);
    return t != 0 && this.addNewRoot(new me(e), t), this;
  }
  addAndReturn(e) {
    const t = this.splay(e);
    return t != 0 && this.addNewRoot(new me(e), t), this.root.key;
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
    let i = this.root.left;
    if (i == null) return null;
    let n = i.right;
    for (; n != null; )
      i = n, n = i.right;
    return i.key;
  }
  firstAfter(e) {
    if (e == null) throw "Invalid arguments(s)";
    if (this.root == null) return null;
    if (this.splay(e) > 0) return this.root.key;
    let i = this.root.right;
    if (i == null) return null;
    let n = i.left;
    for (; n != null; )
      i = n, n = i.left;
    return i.key;
  }
  retainAll(e) {
    const t = new be(this.compare, this.validKey), i = this.modificationCount;
    for (const n of e) {
      if (i != this.modificationCount)
        throw "Concurrent modification during iteration.";
      this.validKey(n) && this.splay(n) == 0 && t.add(this.root.key);
    }
    t.size != this.size && (this.root = t.root, this.size = t.size, this.modificationCount++);
  }
  lookup(e) {
    return !this.validKey(e) || this.splay(e) != 0 ? null : this.root.key;
  }
  intersection(e) {
    const t = new be(this.compare, this.validKey);
    for (const i of this)
      e.has(i) && t.add(i);
    return t;
  }
  difference(e) {
    const t = new be(this.compare, this.validKey);
    for (const i of this)
      e.has(i) || t.add(i);
    return t;
  }
  union(e) {
    const t = this.clone();
    return t.addAll(e), t;
  }
  clone() {
    const e = new be(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function t(n, s) {
      let o, a;
      do {
        if (o = n.left, a = n.right, o != null) {
          const l = new me(o.key);
          s.left = l, t(o, l);
        }
        if (a != null) {
          const l = new me(a.key);
          s.right = l, n = a, s = l;
        }
      } while (a != null);
    }
    const i = new me(e.key);
    return t(e, i), i;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new Ar(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new Er(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, Ot = class {
  tree;
  path = new Array();
  modificationCount = null;
  splayCount;
  constructor(r) {
    this.tree = r, this.splayCount = r.getSplayCount();
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.moveNext() ? { done: !1, value: this.current() } : { done: !0, value: null };
  }
  current() {
    if (!this.path.length) return null;
    const r = this.path[this.path.length - 1];
    return this.getValue(r);
  }
  rebuildPath(r) {
    this.path.splice(0, this.path.length), this.tree.splay(r), this.path.push(this.tree.getRoot()), this.splayCount = this.tree.getSplayCount();
  }
  findLeftMostDescendent(r) {
    for (; r != null; )
      this.path.push(r), r = r.left;
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
    let r = this.path[this.path.length - 1], e = r.right;
    if (e != null) {
      for (; e != null; )
        this.path.push(e), e = e.left;
      return !0;
    }
    for (this.path.pop(); this.path.length && this.path[this.path.length - 1].right === r; )
      r = this.path.pop();
    return this.path.length > 0;
  }
}, Er = class extends Ot {
  getValue(r) {
    return r.key;
  }
}, Ar = class extends Ot {
  getValue(r) {
    return [r.key, r.key];
  }
}, Bt = (r) => () => r, Ze = (r) => {
  const e = r ? (t, i) => i.minus(t).abs().isLessThanOrEqualTo(r) : Bt(!1);
  return (t, i) => e(t, i) ? 0 : t.comparedTo(i);
};
function Pr(r) {
  const e = r ? (t, i, n, s, o) => t.exponentiatedBy(2).isLessThanOrEqualTo(
    s.minus(i).exponentiatedBy(2).plus(o.minus(n).exponentiatedBy(2)).times(r)
  ) : Bt(!1);
  return (t, i, n) => {
    const s = t.x, o = t.y, a = n.x, l = n.y, u = o.minus(l).times(i.x.minus(a)).minus(s.minus(a).times(i.y.minus(l)));
    return e(u, s, o, a, l) ? 0 : u.comparedTo(0);
  };
}
var Ir = (r) => r, Lr = (r) => {
  if (r) {
    const e = new ze(Ze(r)), t = new ze(Ze(r)), i = (s, o) => o.addAndReturn(s), n = (s) => ({
      x: i(s.x, e),
      y: i(s.y, t)
    });
    return n({ x: new oe(0), y: new oe(0) }), n;
  }
  return Ir;
}, et = (r) => ({
  set: (e) => {
    le = et(e);
  },
  reset: () => et(r),
  compare: Ze(r),
  snap: Lr(r),
  orient: Pr(r)
}), le = et(), _e = (r, e) => r.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(r.ur.x) && r.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(r.ur.y), tt = (r, e) => {
  if (e.ur.x.isLessThan(r.ll.x) || r.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(r.ll.y) || r.ur.y.isLessThan(e.ll.y))
    return null;
  const t = r.ll.x.isLessThan(e.ll.x) ? e.ll.x : r.ll.x, i = r.ur.x.isLessThan(e.ur.x) ? r.ur.x : e.ur.x, n = r.ll.y.isLessThan(e.ll.y) ? e.ll.y : r.ll.y, s = r.ur.y.isLessThan(e.ur.y) ? r.ur.y : e.ur.y;
  return { ll: { x: t, y: n }, ur: { x: i, y: s } };
}, Ne = (r, e) => r.x.times(e.y).minus(r.y.times(e.x)), zt = (r, e) => r.x.times(e.x).plus(r.y.times(e.y)), We = (r) => zt(r, r).sqrt(), Nr = (r, e, t) => {
  const i = { x: e.x.minus(r.x), y: e.y.minus(r.y) }, n = { x: t.x.minus(r.x), y: t.y.minus(r.y) };
  return Ne(n, i).div(We(n)).div(We(i));
}, Cr = (r, e, t) => {
  const i = { x: e.x.minus(r.x), y: e.y.minus(r.y) }, n = { x: t.x.minus(r.x), y: t.y.minus(r.y) };
  return zt(n, i).div(We(n)).div(We(i));
}, mt = (r, e, t) => e.y.isZero() ? null : { x: r.x.plus(e.x.div(e.y).times(t.minus(r.y))), y: t }, _t = (r, e, t) => e.x.isZero() ? null : { x: t, y: r.y.plus(e.y.div(e.x).times(t.minus(r.x))) }, Rr = (r, e, t, i) => {
  if (e.x.isZero()) return _t(t, i, r.x);
  if (i.x.isZero()) return _t(r, e, t.x);
  if (e.y.isZero()) return mt(t, i, r.y);
  if (i.y.isZero()) return mt(r, e, t.y);
  const n = Ne(e, i);
  if (n.isZero()) return null;
  const s = { x: t.x.minus(r.x), y: t.y.minus(r.y) }, o = Ne(s, e).div(n), a = Ne(s, i).div(n), l = r.x.plus(a.times(e.x)), u = t.x.plus(o.times(i.x)), g = r.y.plus(a.times(e.y)), d = t.y.plus(o.times(i.y)), v = l.plus(u).div(2), S = g.plus(d).div(2);
  return { x: v, y: S };
}, se = class Wt {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, t) {
    const i = Wt.comparePoints(e.point, t.point);
    return i !== 0 ? i : (e.point !== t.point && e.link(t), e.isLeft !== t.isLeft ? e.isLeft ? 1 : -1 : Fe.compare(e.segment, t.segment));
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
    for (let i = 0, n = t.length; i < n; i++) {
      const s = t[i];
      this.point.events.push(s), s.point = this.point;
    }
    this.checkForConsuming();
  }
  /* Do a pass over our linked events and check to see if any pair
   * of segments match, and should be consumed. */
  checkForConsuming() {
    const e = this.point.events.length;
    for (let t = 0; t < e; t++) {
      const i = this.point.events[t];
      if (i.segment.consumedBy === void 0)
        for (let n = t + 1; n < e; n++) {
          const s = this.point.events[n];
          s.consumedBy === void 0 && i.otherSE.point.events === s.otherSE.point.events && i.segment.consume(s.segment);
        }
    }
  }
  getAvailableLinkedEvents() {
    const e = [];
    for (let t = 0, i = this.point.events.length; t < i; t++) {
      const n = this.point.events[t];
      n !== this && !n.segment.ringOut && n.segment.isInResult() && e.push(n);
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
    const t = /* @__PURE__ */ new Map(), i = (n) => {
      const s = n.otherSE;
      t.set(n, {
        sine: Nr(this.point, e.point, s.point),
        cosine: Cr(this.point, e.point, s.point)
      });
    };
    return (n, s) => {
      t.has(n) || i(n), t.has(s) || i(s);
      const { sine: o, cosine: a } = t.get(n), { sine: l, cosine: u } = t.get(s);
      return o.isGreaterThanOrEqualTo(0) && l.isGreaterThanOrEqualTo(0) ? a.isLessThan(u) ? 1 : a.isGreaterThan(u) ? -1 : 0 : o.isLessThan(0) && l.isLessThan(0) ? a.isLessThan(u) ? -1 : a.isGreaterThan(u) ? 1 : 0 : l.isLessThan(o) ? -1 : l.isGreaterThan(o) ? 1 : 0;
    };
  }
}, Or = class rt {
  events;
  poly;
  _isExteriorRing;
  _enclosingRing;
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory(e) {
    const t = [];
    for (let i = 0, n = e.length; i < n; i++) {
      const s = e[i];
      if (!s.isInResult() || s.ringOut) continue;
      let o = null, a = s.leftSE, l = s.rightSE;
      const u = [a], g = a.point, d = [];
      for (; o = a, a = l, u.push(a), a.point !== g; )
        for (; ; ) {
          const v = a.getAvailableLinkedEvents();
          if (v.length === 0) {
            const A = u[0].point, E = u[u.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${A.x}, \${A.y}]. Last matching segment found ends at [\${E.x}, \${E.y}].\`
            );
          }
          if (v.length === 1) {
            l = v[0].otherSE;
            break;
          }
          let S = null;
          for (let A = 0, E = d.length; A < E; A++)
            if (d[A].point === a.point) {
              S = A;
              break;
            }
          if (S !== null) {
            const A = d.splice(S)[0], E = u.splice(A.index);
            E.unshift(E[0].otherSE), t.push(new rt(E.reverse()));
            continue;
          }
          d.push({
            index: u.length,
            point: a.point
          });
          const P = a.getLeftmostComparator(o);
          l = v.sort(P)[0].otherSE;
          break;
        }
      t.push(new rt(u));
    }
    return t;
  }
  constructor(e) {
    this.events = e;
    for (let t = 0, i = e.length; t < i; t++)
      e[t].segment.ringOut = this;
    this.poly = null;
  }
  getGeom() {
    let e = this.events[0].point;
    const t = [e];
    for (let u = 1, g = this.events.length - 1; u < g; u++) {
      const d = this.events[u].point, v = this.events[u + 1].point;
      le.orient(d, e, v) !== 0 && (t.push(d), e = d);
    }
    if (t.length === 1) return null;
    const i = t[0], n = t[1];
    le.orient(i, e, n) === 0 && t.shift(), t.push(t[0]);
    const s = this.isExteriorRing() ? 1 : -1, o = this.isExteriorRing() ? 0 : t.length - 1, a = this.isExteriorRing() ? t.length : -1, l = [];
    for (let u = o; u != a; u += s)
      l.push([t[u].x.toNumber(), t[u].y.toNumber()]);
    return l;
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
    for (let n = 1, s = this.events.length; n < s; n++) {
      const o = this.events[n];
      se.compare(e, o) > 0 && (e = o);
    }
    let t = e.segment.prevInResult(), i = t ? t.prevInResult() : null;
    for (; ; ) {
      if (!t) return null;
      if (!i) return t.ringOut;
      if (i.ringOut !== t.ringOut)
        return i.ringOut?.enclosingRing() !== t.ringOut ? t.ringOut : t.ringOut?.enclosingRing();
      t = i.prevInResult(), i = t ? t.prevInResult() : null;
    }
  }
}, wt = class {
  exteriorRing;
  interiorRings;
  constructor(r) {
    this.exteriorRing = r, r.poly = this, this.interiorRings = [];
  }
  addInterior(r) {
    this.interiorRings.push(r), r.poly = this;
  }
  getGeom() {
    const r = this.exteriorRing.getGeom();
    if (r === null) return null;
    const e = [r];
    for (let t = 0, i = this.interiorRings.length; t < i; t++) {
      const n = this.interiorRings[t].getGeom();
      n !== null && e.push(n);
    }
    return e;
  }
}, Br = class {
  rings;
  polys;
  constructor(r) {
    this.rings = r, this.polys = this._composePolys(r);
  }
  getGeom() {
    const r = [];
    for (let e = 0, t = this.polys.length; e < t; e++) {
      const i = this.polys[e].getGeom();
      i !== null && r.push(i);
    }
    return r;
  }
  _composePolys(r) {
    const e = [];
    for (let t = 0, i = r.length; t < i; t++) {
      const n = r[t];
      if (!n.poly)
        if (n.isExteriorRing()) e.push(new wt(n));
        else {
          const s = n.enclosingRing();
          s?.poly || e.push(new wt(s)), s?.poly?.addInterior(n);
        }
    }
    return e;
  }
}, zr = class {
  queue;
  tree;
  segments;
  constructor(r, e = Fe.compare) {
    this.queue = r, this.tree = new ze(e), this.segments = [];
  }
  process(r) {
    const e = r.segment, t = [];
    if (r.consumedBy)
      return r.isLeft ? this.queue.delete(r.otherSE) : this.tree.delete(e), t;
    r.isLeft && this.tree.add(e);
    let i = e, n = e;
    do
      i = this.tree.lastBefore(i);
    while (i != null && i.consumedBy != null);
    do
      n = this.tree.firstAfter(n);
    while (n != null && n.consumedBy != null);
    if (r.isLeft) {
      let s = null;
      if (i) {
        const a = i.getIntersection(e);
        if (a !== null && (e.isAnEndpoint(a) || (s = a), !i.isAnEndpoint(a))) {
          const l = this._splitSafely(i, a);
          for (let u = 0, g = l.length; u < g; u++)
            t.push(l[u]);
        }
      }
      let o = null;
      if (n) {
        const a = n.getIntersection(e);
        if (a !== null && (e.isAnEndpoint(a) || (o = a), !n.isAnEndpoint(a))) {
          const l = this._splitSafely(n, a);
          for (let u = 0, g = l.length; u < g; u++)
            t.push(l[u]);
        }
      }
      if (s !== null || o !== null) {
        let a = null;
        s === null ? a = o : o === null ? a = s : a = se.comparePoints(
          s,
          o
        ) <= 0 ? s : o, this.queue.delete(e.rightSE), t.push(e.rightSE);
        const l = e.split(a);
        for (let u = 0, g = l.length; u < g; u++)
          t.push(l[u]);
      }
      t.length > 0 ? (this.tree.delete(e), t.push(r)) : (this.segments.push(e), e.prev = i);
    } else {
      if (i && n) {
        const s = i.getIntersection(n);
        if (s !== null) {
          if (!i.isAnEndpoint(s)) {
            const o = this._splitSafely(i, s);
            for (let a = 0, l = o.length; a < l; a++)
              t.push(o[a]);
          }
          if (!n.isAnEndpoint(s)) {
            const o = this._splitSafely(n, s);
            for (let a = 0, l = o.length; a < l; a++)
              t.push(o[a]);
          }
        }
      }
      this.tree.delete(e);
    }
    return t;
  }
  /* Safely split a segment that is currently in the datastructures
   * IE - a segment other than the one that is currently being processed. */
  _splitSafely(r, e) {
    this.tree.delete(r);
    const t = r.rightSE;
    this.queue.delete(t);
    const i = r.split(e);
    return i.push(t), r.consumedBy === void 0 && this.tree.add(r), i;
  }
}, Wr = class {
  type;
  numMultiPolys;
  run(r, e, t) {
    ke.type = r;
    const i = [new bt(e, !0)];
    for (let u = 0, g = t.length; u < g; u++)
      i.push(new bt(t[u], !1));
    if (ke.numMultiPolys = i.length, ke.type === "difference") {
      const u = i[0];
      let g = 1;
      for (; g < i.length; )
        tt(i[g].bbox, u.bbox) !== null ? g++ : i.splice(g, 1);
    }
    if (ke.type === "intersection")
      for (let u = 0, g = i.length; u < g; u++) {
        const d = i[u];
        for (let v = u + 1, S = i.length; v < S; v++)
          if (tt(d.bbox, i[v].bbox) === null) return [];
      }
    const n = new ze(se.compare);
    for (let u = 0, g = i.length; u < g; u++) {
      const d = i[u].getSweepEvents();
      for (let v = 0, S = d.length; v < S; v++)
        n.add(d[v]);
    }
    const s = new zr(n);
    let o = null;
    for (n.size != 0 && (o = n.first(), n.delete(o)); o; ) {
      const u = s.process(o);
      for (let g = 0, d = u.length; g < d; g++) {
        const v = u[g];
        v.consumedBy === void 0 && n.add(v);
      }
      n.size != 0 ? (o = n.first(), n.delete(o)) : o = null;
    }
    le.reset();
    const a = Or.factory(s.segments);
    return new Br(a).getGeom();
  }
}, ke = new Wr(), it = ke, Fr = 0, Fe = class Ce {
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
    const i = e.leftSE.point.x, n = t.leftSE.point.x, s = e.rightSE.point.x, o = t.rightSE.point.x;
    if (o.isLessThan(i)) return 1;
    if (s.isLessThan(n)) return -1;
    const a = e.leftSE.point.y, l = t.leftSE.point.y, u = e.rightSE.point.y, g = t.rightSE.point.y;
    if (i.isLessThan(n)) {
      if (l.isLessThan(a) && l.isLessThan(u)) return 1;
      if (l.isGreaterThan(a) && l.isGreaterThan(u)) return -1;
      const d = e.comparePoint(t.leftSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
      const v = t.comparePoint(e.rightSE.point);
      return v !== 0 ? v : -1;
    }
    if (i.isGreaterThan(n)) {
      if (a.isLessThan(l) && a.isLessThan(g)) return -1;
      if (a.isGreaterThan(l) && a.isGreaterThan(g)) return 1;
      const d = t.comparePoint(e.leftSE.point);
      if (d !== 0) return d;
      const v = e.comparePoint(t.rightSE.point);
      return v < 0 ? 1 : v > 0 ? -1 : 1;
    }
    if (a.isLessThan(l)) return -1;
    if (a.isGreaterThan(l)) return 1;
    if (s.isLessThan(o)) {
      const d = t.comparePoint(e.rightSE.point);
      if (d !== 0) return d;
    }
    if (s.isGreaterThan(o)) {
      const d = e.comparePoint(t.rightSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
    }
    if (!s.eq(o)) {
      const d = u.minus(a), v = s.minus(i), S = g.minus(l), P = o.minus(n);
      if (d.isGreaterThan(v) && S.isLessThan(P)) return 1;
      if (d.isLessThan(v) && S.isGreaterThan(P)) return -1;
    }
    return s.isGreaterThan(o) ? 1 : s.isLessThan(o) || u.isLessThan(g) ? -1 : u.isGreaterThan(g) ? 1 : e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, t, i, n) {
    this.id = ++Fr, this.leftSE = e, e.segment = this, e.otherSE = t, this.rightSE = t, t.segment = this, t.otherSE = e, this.rings = i, this.windings = n;
  }
  static fromRing(e, t, i) {
    let n, s, o;
    const a = se.comparePoints(e, t);
    if (a < 0)
      n = e, s = t, o = 1;
    else if (a > 0)
      n = t, s = e, o = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const l = new se(n, !0), u = new se(s, !1);
    return new Ce(l, u, [i], [o]);
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
    return le.orient(this.leftSE.point, e, this.rightSE.point);
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
    const t = this.bbox(), i = e.bbox(), n = tt(t, i);
    if (n === null) return null;
    const s = this.leftSE.point, o = this.rightSE.point, a = e.leftSE.point, l = e.rightSE.point, u = _e(t, a) && this.comparePoint(a) === 0, g = _e(i, s) && e.comparePoint(s) === 0, d = _e(t, l) && this.comparePoint(l) === 0, v = _e(i, o) && e.comparePoint(o) === 0;
    if (g && u)
      return v && !d ? o : !v && d ? l : null;
    if (g)
      return d && s.x.eq(l.x) && s.y.eq(l.y) ? null : s;
    if (u)
      return v && o.x.eq(a.x) && o.y.eq(a.y) ? null : a;
    if (v && d) return null;
    if (v) return o;
    if (d) return l;
    const S = Rr(s, this.vector(), a, e.vector());
    return S === null || !_e(n, S) ? null : le.snap(S);
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
    const t = [], i = e.events !== void 0, n = new se(e, !0), s = new se(e, !1), o = this.rightSE;
    this.replaceRightSE(s), t.push(s), t.push(n);
    const a = new Ce(
      n,
      o,
      this.rings.slice(),
      this.windings.slice()
    );
    return se.comparePoints(a.leftSE.point, a.rightSE.point) > 0 && a.swapEvents(), se.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), i && (n.checkForConsuming(), s.checkForConsuming()), t;
  }
  /* Swap which event is left and right */
  swapEvents() {
    const e = this.rightSE;
    this.rightSE = this.leftSE, this.leftSE = e, this.leftSE.isLeft = !0, this.rightSE.isLeft = !1;
    for (let t = 0, i = this.windings.length; t < i; t++)
      this.windings[t] *= -1;
  }
  /* Consume another segment. We take their rings under our wing
   * and mark them as consumed. Use for perfectly overlapping segments */
  consume(e) {
    let t = this, i = e;
    for (; t.consumedBy; ) t = t.consumedBy;
    for (; i.consumedBy; ) i = i.consumedBy;
    const n = Ce.compare(t, i);
    if (n !== 0) {
      if (n > 0) {
        const s = t;
        t = i, i = s;
      }
      if (t.prev === i) {
        const s = t;
        t = i, i = s;
      }
      for (let s = 0, o = i.rings.length; s < o; s++) {
        const a = i.rings[s], l = i.windings[s], u = t.rings.indexOf(a);
        u === -1 ? (t.rings.push(a), t.windings.push(l)) : t.windings[u] += l;
      }
      i.rings = null, i.windings = null, i.consumedBy = t, i.leftSE.consumedBy = t.leftSE, i.rightSE.consumedBy = t.rightSE;
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
    const t = this._afterState.rings, i = this._afterState.windings, n = this._afterState.multiPolys;
    for (let a = 0, l = this.rings.length; a < l; a++) {
      const u = this.rings[a], g = this.windings[a], d = t.indexOf(u);
      d === -1 ? (t.push(u), i.push(g)) : i[d] += g;
    }
    const s = [], o = [];
    for (let a = 0, l = t.length; a < l; a++) {
      if (i[a] === 0) continue;
      const u = t[a], g = u.poly;
      if (o.indexOf(g) === -1)
        if (u.isExterior) s.push(g);
        else {
          o.indexOf(g) === -1 && o.push(g);
          const d = s.indexOf(u.poly);
          d !== -1 && s.splice(d, 1);
        }
    }
    for (let a = 0, l = s.length; a < l; a++) {
      const u = s[a].multiPoly;
      n.indexOf(u) === -1 && n.push(u);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const e = this.beforeState().multiPolys, t = this.afterState().multiPolys;
    switch (it.type) {
      case "union": {
        const i = e.length === 0, n = t.length === 0;
        this._isInResult = i !== n;
        break;
      }
      case "intersection": {
        let i, n;
        e.length < t.length ? (i = e.length, n = t.length) : (i = t.length, n = e.length), this._isInResult = n === it.numMultiPolys && i < n;
        break;
      }
      case "xor": {
        const i = Math.abs(e.length - t.length);
        this._isInResult = i % 2 === 1;
        break;
      }
      case "difference": {
        const i = (n) => n.length === 1 && n[0].isSubject;
        this._isInResult = i(e) !== i(t);
        break;
      }
    }
    return this._isInResult;
  }
}, xt = class {
  poly;
  isExterior;
  segments;
  bbox;
  constructor(r, e, t) {
    if (!Array.isArray(r) || r.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (this.poly = e, this.isExterior = t, this.segments = [], typeof r[0][0] != "number" || typeof r[0][1] != "number")
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const i = le.snap({ x: new oe(r[0][0]), y: new oe(r[0][1]) });
    this.bbox = {
      ll: { x: i.x, y: i.y },
      ur: { x: i.x, y: i.y }
    };
    let n = i;
    for (let s = 1, o = r.length; s < o; s++) {
      if (typeof r[s][0] != "number" || typeof r[s][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const a = le.snap({ x: new oe(r[s][0]), y: new oe(r[s][1]) });
      a.x.eq(n.x) && a.y.eq(n.y) || (this.segments.push(Fe.fromRing(n, a, this)), a.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = a.x), a.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = a.y), a.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = a.x), a.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = a.y), n = a);
    }
    (!i.x.eq(n.x) || !i.y.eq(n.y)) && this.segments.push(Fe.fromRing(n, i, this));
  }
  getSweepEvents() {
    const r = [];
    for (let e = 0, t = this.segments.length; e < t; e++) {
      const i = this.segments[e];
      r.push(i.leftSE), r.push(i.rightSE);
    }
    return r;
  }
}, qr = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(r, e) {
    if (!Array.isArray(r))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new xt(r[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let t = 1, i = r.length; t < i; t++) {
      const n = new xt(r[t], this, !1);
      n.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = n.bbox.ll.x), n.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = n.bbox.ll.y), n.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = n.bbox.ur.x), n.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = n.bbox.ur.y), this.interiorRings.push(n);
    }
    this.multiPoly = e;
  }
  getSweepEvents() {
    const r = this.exteriorRing.getSweepEvents();
    for (let e = 0, t = this.interiorRings.length; e < t; e++) {
      const i = this.interiorRings[e].getSweepEvents();
      for (let n = 0, s = i.length; n < s; n++)
        r.push(i[n]);
    }
    return r;
  }
}, bt = class {
  isSubject;
  polys;
  bbox;
  constructor(r, e) {
    if (!Array.isArray(r))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    try {
      typeof r[0][0][0] == "number" && (r = [r]);
    } catch {
    }
    this.polys = [], this.bbox = {
      ll: { x: new oe(Number.POSITIVE_INFINITY), y: new oe(Number.POSITIVE_INFINITY) },
      ur: { x: new oe(Number.NEGATIVE_INFINITY), y: new oe(Number.NEGATIVE_INFINITY) }
    };
    for (let t = 0, i = r.length; t < i; t++) {
      const n = new qr(r[t], this);
      n.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = n.bbox.ll.x), n.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = n.bbox.ll.y), n.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = n.bbox.ur.x), n.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = n.bbox.ur.y), this.polys.push(n);
    }
    this.isSubject = e;
  }
  getSweepEvents() {
    const r = [];
    for (let e = 0, t = this.polys.length; e < t; e++) {
      const i = this.polys[e].getSweepEvents();
      for (let n = 0, s = i.length; n < s; n++)
        r.push(i[n]);
    }
    return r;
  }
}, Dr = (r, ...e) => it.run("union", r, e);
le.set;
function kt(r, e = {}) {
  const t = [];
  if (De(r, (n) => {
    t.push(n.coordinates);
  }), t.length < 2)
    throw new Error("Must have at least 2 geometries");
  const i = Dr(t[0], ...t.slice(1));
  return i.length === 0 ? null : i.length === 1 ? ir(i[0], e.properties) : sr(i, e.properties);
}
function Ur(r) {
  if (!r) throw new Error("geojson is required");
  var e = [];
  return lr(r, function(t) {
    e.push(t);
  }), nr(e);
}
const Ft = \`let y, l;
function T() {
  return y !== void 0 ? y === !1 ? null : y : typeof TextEncoder < "u" ? (y = new TextEncoder(), y) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (y = { encode: (e) => new Uint8Array(Buffer.from(e)) }, y) : (y = !1, null);
}
function U() {
  return l !== void 0 ? l === !1 ? null : l : typeof TextDecoder < "u" ? (l = new TextDecoder(), l) : typeof Buffer < "u" && typeof Buffer.from == "function" ? (l = { decode: (e) => Buffer.from(e).toString("utf8") }, l) : (l = !1, null);
}
const E = (e) => {
  if (e instanceof Uint8Array) return e;
  if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  const r = JSON.stringify(e), t = T();
  if (t && typeof t.encode == "function") return t.encode(r);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, D = (e) => {
  let r;
  if (e instanceof Uint8Array) r = e;
  else if (ArrayBuffer.isView(e)) r = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  else if (e instanceof ArrayBuffer) r = new Uint8Array(e);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(e))
    r = new Uint8Array(e);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  const t = U();
  if (t && typeof t.decode == "function") return JSON.parse(t.decode(r));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(r));
  throw new Error("No TextDecoder or Buffer available to decode object");
};
let x = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function")
  try {
    const e = Number(process.hrtime.bigint() / 1000000n);
    x = Date.now() - e;
  } catch {
    x = null;
  }
const I = () => typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {}, B = I(), p = (e, r, t) => {
  const [n, o] = e, [f, i] = r, [s, c] = t;
  return (f - n) * (c - o) - (i - o) * (s - n);
}, g = (e, r, t) => {
  const [n, o] = e, [f, i] = r, [s, c] = t;
  return Math.min(n, f) <= s && s <= Math.max(n, f) && Math.min(o, i) <= c && c <= Math.max(o, i);
}, N = (e, r, t, n) => {
  const o = p(e, r, t), f = p(e, r, n), i = p(t, n, e), s = p(t, n, r);
  return o === 0 && g(e, r, t) || f === 0 && g(e, r, n) || i === 0 && g(t, n, e) || s === 0 && g(t, n, r) ? !0 : o * f < 0 && i * s < 0;
}, w = (e, r) => {
  const [t, n] = e;
  let o = !1;
  for (let f = 0, i = r.length - 1; f < r.length; i = f++) {
    const [s, c] = r[f], [d, a] = r[i];
    c > n != a > n && t < (d - s) * (n - c) / (a - c) + s && (o = !o);
  }
  return o;
}, m = (e, r) => {
  if (!Array.isArray(r) || r.length === 0 || !w(e, r[0])) return !1;
  for (let t = 1; t < r.length; t++)
    if (w(e, r[t])) return !1;
  return !0;
}, O = (e, r) => e[0] <= r[2] && e[2] >= r[0] && e[1] <= r[3] && e[3] >= r[1], b = (e) => e && Array.isArray(e.bbox) && e.bbox.length === 4 && Array.isArray(e.coordinates) && e.coordinates.length > 0, S = (e, r) => {
  if (!b(e) || !b(r) || !O(e.bbox, r.bbox)) return !1;
  for (const o of e.coordinates)
    for (let f = 0; f + 1 < o.length; f++) {
      const i = o[f], s = o[f + 1];
      if (!(!Array.isArray(i) || !Array.isArray(s)))
        for (const c of r.coordinates)
          for (let d = 0; d + 1 < c.length; d++) {
            const a = c[d], u = c[d + 1];
            if (!(!Array.isArray(a) || !Array.isArray(u)) && N(i, s, a, u))
              return !0;
          }
    }
  const t = e.coordinates[0]?.[0], n = r.coordinates[0]?.[0];
  return !!(Array.isArray(t) && m(t, r.coordinates) || Array.isArray(n) && m(n, e.coordinates));
};
B.onmessage = (e) => {
  const r = e.data, t = r instanceof ArrayBuffer || ArrayBuffer.isView(r) ? D(r) : r, { type: n, nodes: o, start: f, end: i, correlationId: s } = t;
  if (n !== "build-range" || !Array.isArray(o)) return;
  const c = [];
  for (let u = f; u < i; u++) {
    const h = [];
    for (let A = 0; A < o.length; A++)
      u !== A && S(o[u], o[A]) && h.push(A);
    c.push({ index: u, neighbors: h });
  }
  const a = E({ correlationId: s, neighbors: c }).buffer;
  B.postMessage(a, [a]);
};
\`, vt = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", Ft], { type: "text/javascript;charset=utf-8" });
function jr(r) {
  let e;
  try {
    if (e = vt && (self.URL || self.webkitURL).createObjectURL(vt), !e) throw "";
    const t = new Worker(e, {
      type: "module",
      name: r?.name
    });
    return t.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), t;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Ft),
      {
        type: "module",
        name: r?.name
      }
    );
  }
}
const Xe = /* @__PURE__ */ new WeakMap();
let we = null, Gr = 0;
const Mt = (r) => r === void 0 ? "__undefined" : r === null ? "__null" : typeof r != "object" && typeof r != "function" ? String(r) : (Xe.has(r) || Xe.set(r, String(Gr++)), Xe.get(r)), Vr = new ie(
  (r, e) => ni(r, e),
  {
    keyResolver: (r, e) => {
      const t = Mt(r?.feature ?? r), i = Mt(e?.feature ?? e);
      return t < i ? \`\${t}|\${i}\` : \`\${i}|\${t}\`;
    }
  }
), $r = (r) => Array.isArray(r) && r.length > 0 && r.every(
  (e) => Array.isArray(e) && e.length >= 3 && e.every(
    (t) => Array.isArray(t) && t.length >= 2 && Number.isFinite(t[0]) && Number.isFinite(t[1])
  )
), qe = (r) => r && Array.isArray(r.bbox) && r.bbox.length === 4 && Array.isArray(r.coordinates) && r.coordinates.length > 0, Hr = (r) => {
  const e = r?.geometry || (r?.type === "Polygon" ? r : null);
  return e && e.type === "Polygon" && $r(e.coordinates) ? e : null;
}, Yr = (r) => r.map((e) => {
  const t = Hr(e), i = t ? ti(t.coordinates) : null;
  return !t || !i ? null : {
    feature: e,
    coordinates: t.coordinates,
    bbox: i
  };
}).filter(Boolean), Xr = (r, e) => {
  const t = new Array(r.length).fill(!1), i = [], n = new Le(Math.max(16, r.length));
  for (let s = 0; s < r.length; s++) {
    if (t[s] || !qe(r[s])) {
      t[s] = !0;
      continue;
    }
    const o = [];
    for (n.clear(), n.push(s), t[s] = !0; !n.isEmpty; ) {
      const a = n.shift();
      if (qe(r[a])) {
        o.push(r[a].feature);
        for (const l of e[a] || [])
          t[l] || (t[l] = !0, n.push(l));
      }
    }
    o.length > 0 && i.push(o);
  }
  return i;
}, St = (r) => {
  const e = Array.from({ length: r.length }, () => []);
  for (let t = 0; t < r.length; t++) {
    const i = r[t];
    if (i)
      for (let n = t + 1; n < r.length; n++) {
        const s = r[n];
        s && Vr(i, s) && (e[t].push(n), e[n].push(t));
      }
  }
  return e;
}, Kr = async (r, e) => {
  if (r <= 0 || e <= 0) return [];
  const t = Math.ceil(r / e), i = [];
  for (let n = 0; n < e; n += 1) {
    const s = n * t, o = Math.min(r, s + t);
    s < o && i.push([s, o]);
  }
  return i;
}, Qr = (r) => {
  const e = Math.max(2, r);
  return we ? e > we.maxSize && we.resize(e) : we = new Qt(jr, {
    size: e,
    minSize: 2,
    lazy: !1,
    idleTimeout: 3e4
  }), we;
}, Jr = async (r, e) => {
  if (!r.length) return [];
  if (typeof Worker > "u")
    return St(r);
  const t = Qr(e), n = (await Kr(r.length, e)).map(([a, l]) => ({
    message: { type: "build-range", nodes: r, start: a, end: l }
  }));
  let s;
  try {
    s = await Promise.all(
      t.postMessageBatch(n, {
        awaitResponse: !0,
        timeout: 3e4,
        correlationIdFactory: (a) => String(a)
      })
    );
  } catch {
    return St(r);
  }
  const o = Array.from({ length: r.length }, () => []);
  for (const a of s)
    if (!(!a || !Array.isArray(a.neighbors)))
      for (const { index: l, neighbors: u } of a.neighbors)
        Number.isFinite(l) && Array.isArray(u) && (o[l] = u);
  return o;
};
async function Zr(r, e = {}) {
  const t = Array.isArray(r) ? Yr(r) : [];
  if (t.length === 0) return [];
  const i = typeof navigator < "u" && navigator.hardwareConcurrency ? Math.max(1, Math.floor(navigator.hardwareConcurrency)) : 2, n = Math.max(1, Math.min(t.length, Number.isFinite(e.concurrency) ? e.concurrency : i));
  return Xr(t, await Jr(t, n));
}
const ei = (r) => {
  let e = 1 / 0, t = 1 / 0, i = -1 / 0, n = -1 / 0;
  for (const s of r) {
    if (!Array.isArray(s) || s.length < 2) continue;
    const [o, a] = s;
    o < e && (e = o), a < t && (t = a), o > i && (i = o), a > n && (n = a);
  }
  return [e, t, i, n];
}, ti = (r) => {
  const e = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  for (const t of r) {
    const [i, n, s, o] = ei(t);
    i < e[0] && (e[0] = i), n < e[1] && (e[1] = n), s > e[2] && (e[2] = s), o > e[3] && (e[3] = o);
  }
  return Number.isFinite(e[0]) && Number.isFinite(e[1]) && Number.isFinite(e[2]) && Number.isFinite(e[3]) ? e : null;
}, ri = (r, e) => r[0] <= e[2] && r[2] >= e[0] && r[1] <= e[3] && r[3] >= e[1], Ae = (r, e, t) => {
  const [i, n] = r, [s, o] = e, [a, l] = t;
  return (s - i) * (l - n) - (o - n) * (a - i);
}, Pe = (r, e, t) => {
  const [i, n] = r, [s, o] = e, [a, l] = t;
  return Math.min(i, s) <= a && a <= Math.max(i, s) && Math.min(n, o) <= l && l <= Math.max(n, o);
}, ii = (r, e, t, i) => {
  const n = Ae(r, e, t), s = Ae(r, e, i), o = Ae(t, i, r), a = Ae(t, i, e);
  return n === 0 && Pe(r, e, t) || s === 0 && Pe(r, e, i) || o === 0 && Pe(t, i, r) || a === 0 && Pe(t, i, e) ? !0 : n * s < 0 && o * a < 0;
}, Tt = (r, e) => {
  const [t, i] = r;
  let n = !1;
  for (let s = 0, o = e.length - 1; s < e.length; o = s++) {
    const [a, l] = e[s], [u, g] = e[o];
    l > i != g > i && t < (u - a) * (i - l) / (g - l) + a && (n = !n);
  }
  return n;
}, Et = (r, e) => {
  if (!Array.isArray(e) || e.length === 0 || !Tt(r, e[0])) return !1;
  for (let t = 1; t < e.length; t++)
    if (Tt(r, e[t])) return !1;
  return !0;
}, ni = (r, e) => {
  if (!qe(r) || !qe(e) || !ri(r.bbox, e.bbox)) return !1;
  for (const n of r.coordinates)
    for (let s = 0; s + 1 < n.length; s++) {
      const o = n[s], a = n[s + 1];
      if (!(!Array.isArray(o) || !Array.isArray(a)))
        for (const l of e.coordinates)
          for (let u = 0; u + 1 < l.length; u++) {
            const g = l[u], d = l[u + 1];
            if (!(!Array.isArray(g) || !Array.isArray(d)) && ii(o, a, g, d))
              return !0;
          }
    }
  const t = r.coordinates[0]?.[0], i = e.coordinates[0]?.[0];
  return !!(Array.isArray(t) && Et(t, e.coordinates) || Array.isArray(i) && Et(i, r.coordinates));
}, Ke = /* @__PURE__ */ new WeakMap();
let si = 0;
const Me = (r) => (Ke.has(r) || Ke.set(r, String(si++)), Ke.get(r));
new ie(
  (r, e, t) => {
    const [i, n, s] = e.split("|").map(Number), o = Math.pow(2, i) * t, a = 85.05112878, l = 1;
    return r[0].some((g) => {
      const d = Math.max(Math.min(g[1], a), -a), v = Math.sin(d * Math.PI / 180), S = (g[0] + 180) / 360, P = 0.5 - Math.log((1 + v) / (1 - v)) / (4 * Math.PI), A = S * o, E = P * o, N = Math.floor(A / t), M = Math.floor(E / t), j = Math.floor(A - N * t), G = Math.floor(E - M * t);
      return M !== s || N !== n || j <= l || G <= l || j >= t - l || G >= t - l;
    });
  },
  {
    keyResolver: (r, e, t) => \`\${Me(r)}|\${e}|\${t}\`
  }
);
const oi = new ie(
  (r, e = !1) => {
    const t = e ? /* @__PURE__ */ new Set() : null;
    let i = 0;
    const n = (l) => Array.isArray(l) && l.length >= 2 && typeof l[0] == "number" && typeof l[1] == "number", s = (l) => {
      e ? t.add(l.slice(0, 3).join(",")) : i++;
    };
    function o(l) {
      if (n(l)) {
        s(l);
        return;
      }
      if (Array.isArray(l)) for (const u of l) o(u);
    }
    function a(l) {
      if (l) {
        if (l.type === "FeatureCollection") {
          for (const u of l.features || []) a(u);
          return;
        }
        if (l.type === "Feature") {
          a(l.geometry);
          return;
        }
        if (l.type === "GeometryCollection") {
          for (const u of l.geometries || []) a(u);
          return;
        }
        l.coordinates !== void 0 && o(l.coordinates);
      }
    }
    return a(r), e ? t.size : i;
  },
  {
    keyResolver: (r, e = !1) => \`\${Me(r)}|\${e ? "unique" : "__count"}\`
  }
), ai = (r, e) => {
  if (!r || r.geometry?.type !== "Polygon")
    throw new Error("Non-Polygon geometry");
  const t = r.geometry.coordinates, i = Zt(t, e);
  if (!Array.isArray(i) || !Number.isFinite(i[0]) || !Number.isFinite(i[1]))
    throw new Error("Invalid polylabel result");
  return {
    type: "Point",
    coordinates: [i[0], i[1]]
  };
}, li = new ie(ai, {
  keyResolver: (r, e) => \`\${Me(r)}|\${e === void 0 ? "__default" : String(e)}\`
}), ui = (r) => {
  const e = r?.geometry?.coordinates;
  if (!Array.isArray(e) || !Array.isArray(e[0]))
    return { type: "Point", coordinates: [0, 0] };
  const t = e[0];
  let i = 0, n = 0, s = 0;
  for (let a = 0; a < t.length; a++) {
    const [l, u] = t[a], [g, d] = t[(a + 1) % t.length], v = l * d - g * u;
    i += (l + g) * v, n += (u + d) * v, s += v;
  }
  if (s === 0)
    return { type: "Point", coordinates: t[0] || [0, 0] };
  const o = 1 / (3 * s);
  return { type: "Point", coordinates: [i * o, n * o] };
}, hi = (r, e) => {
  try {
    return li(r, e);
  } catch {
    return ui(r);
  }
}, qt = (r, e) => {
  if (!r || typeof r != "object" || !r.geometry)
    return 0;
  if (e === "meters" || e === "m")
    return ur(r);
  const t = r.geometry.coordinates;
  if (!Array.isArray(t) || t.length === 0)
    return 0;
  const i = r.geometry.type === "Polygon" ? t[0] : t[0]?.[0];
  if (!Array.isArray(i))
    return 0;
  let n = 0;
  for (let s = 0; s < i.length; s++) {
    const [o, a] = i[s], [l, u] = i[(s + 1) % i.length];
    n += o * u - l * a;
  }
  return Math.abs(n) / 2;
}, ot = new nt(0, { name: "properlabels-geom" }), ci = (r) => {
  const e = Number.isFinite(Number(r)) ? Math.max(0, Math.min(3, Math.floor(Number(r)))) : 0;
  ot.setDebugLevel(e);
}, fi = new ie(qt, {
  keyResolver: (r, e) => \`\${Me(r)}|\${e === void 0 ? "__planar" : String(e)}\`
}), di = (r, e) => {
  try {
    return r && typeof r == "object" ? fi(r, e) : qt(r, e);
  } catch (t) {
    return ot.error("Error computing area for feature", r && r.id, t), 0;
  }
}, gi = (r, e, t = {}) => {
  if (!r || typeof r != "object" || r.type !== "Feature" || !r.geometry || !Number.isFinite(e) || e < 0 || yi(r.geometry, { unique: !1 }) <= e) return r;
  const { tolerance: n = 1e-6, highQuality: s = !1 } = t;
  try {
    return kr(r, { tolerance: n, highQuality: s, mutate: !0 });
  } catch (o) {
    return ot.error("Error simplifying feature", o), r;
  }
}, pi = new ie(
  (r, e, t = {}) => gi(r, e, t),
  {
    keyResolver: (r, e, t = {}) => {
      const i = Number(t.tolerance) || 1e-6, n = !!t.highQuality;
      return \`\${Me(r)}|\${e}|\${i}|\${n}\`;
    }
  }
);
function yi(r, e = {}) {
  const { unique: t = !1 } = e;
  return !r || typeof r != "object" ? 0 : oi(r, t);
}
const mi = (r, e) => {
  if (!Array.isArray(r) || r.length < 4) return null;
  const t = r[0], i = Math.round(t[0] * e) / e, n = Math.round(t[1] * e) / e, s = [[i, n]];
  for (let a = 1; a < r.length - 1; a += 1) {
    const l = r[a], u = Math.round(l[0] * e) / e, g = Math.round(l[1] * e) / e, d = s[s.length - 1];
    (u !== d[0] || g !== d[1]) && s.push([u, g]);
  }
  if (s.length < 3) return null;
  const o = s[s.length - 1];
  return o[0] === i && o[1] === n && s.pop(), s.length < 3 ? null : (s.push([i, n]), s);
}, _i = (r, e) => {
  if (!r || r.geometry?.type !== "Polygon") return r;
  const t = Math.max(e, 1e-10), i = Math.max(0, Math.min(10, Math.round(-Math.log10(t)))), n = Math.pow(10, i), s = r.geometry.coordinates;
  if (!Array.isArray(s)) return null;
  const o = [];
  for (let a = 0; a < s.length; a += 1) {
    const l = mi(s[a], n);
    if (l) o.push(l);
    else if (a === 0) return null;
  }
  return o.length === 0 ? null : { ...r, geometry: { type: "Polygon", coordinates: o } };
}, wi = () => typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {}, xi = wi(), ge = new nt(0, { name: "properlabels-gather" }), At = typeof self < "u" && typeof self.postMessage == "function" ? self : typeof globalThis < "u" && typeof globalThis.postMessage == "function" ? globalThis : null, Pt = (r, e) => {
  if (!At) return !1;
  try {
    return At.postMessage(r, e), !0;
  } catch {
    return !1;
  }
}, bi = (r) => r.features.some(
  (t) => t && t.geometry && t.geometry.type === "MultiPolygon"
) ? Ur(r) : r, ki = (r) => {
  const e = [];
  for (const t of r) {
    const i = Array.isArray(t && t.features) ? t.features : [];
    for (let n = 0; n < i.length; n += 1) {
      const s = i[n];
      s && s.geometry && s.geometry.type === "Polygon" && e.push(s);
    }
  }
  return e;
}, It = (r) => {
  if (typeof r != "string") return 0;
  const e = r.indexOf("|"), t = e >= 0 ? r.slice(0, e) : r;
  return Number.isFinite(Number(t)) ? Number(t) : 0;
}, vi = () => typeof navigator < "u" && Number.isFinite(Number(navigator.hardwareConcurrency)) ? Math.max(1, Math.floor(Number(navigator.hardwareConcurrency))) : 2, Mi = (r, e) => {
  if (!Number.isFinite(Number(r)) || r <= 1) return 1;
  const t = Math.max(1, Number.isFinite(Number(e)) ? Math.floor(Number(e)) : 1), i = vi(), n = Math.max(1, Math.floor(i / t));
  let s = n;
  return r <= 6 ? s = 1 : r <= 20 && (s = Math.min(2, n)), Math.max(1, Math.min(r, s));
};
xi.onmessage = async (r) => {
  let e = null, t = null;
  const i = (n) => {
    const s = { type: "commit", timestamp: Date.now() };
    t && t.gatherRound != null && (s.gatherRound = t.gatherRound), e != null && (s.correlationId = e), n && (s.error = !0, s.errorMessage = String(n && n.message ? n.message : n)), Pt(s) || ge.error(new Error("Unable to post gather commit response"), "Failed to send gather commit response");
  };
  try {
    const n = r.data;
    t = n instanceof ArrayBuffer || ArrayBuffer.isView(n) ? Qe(n) : n;
    const s = Number.isFinite(Number(t.debugLevel)) ? Math.max(0, Math.min(3, Math.floor(Number(t.debugLevel)))) : 0;
    ci(s), ge.setDebugLevel(s);
    const o = t.pieces && typeof t.pieces == "object" ? t.pieces : {}, a = t.tolerance, l = t.unit, u = t.tileSize, g = t.gatherPoolSize;
    e = t.correlationId;
    const d = /* @__PURE__ */ new Map();
    for (const v of Object.keys(o)) {
      const S = o[v];
      if (!(!S || typeof S != "object"))
        for (const P of Object.keys(S)) {
          const A = S[P], E = d.get(P);
          E ? E.push(A) : d.set(P, [A]);
        }
    }
    for (const [v, S] of d.entries()) {
      if (v === "size" || v === "unique" || v === "type") continue;
      let A = {
        type: "FeatureCollection",
        features: ki(S)
      }, E = [], N = [];
      if (A.features.length > 1)
        for (const W of A.features)
          W.properties.clipped ? E.push(W) : N.push(W);
      const M = [];
      if (E.length > 0) {
        const W = Mi(E.length, g), R = await Zr(E, {
          concurrency: W
        });
        for (const q of R) {
          if (q.length === 0) continue;
          if (q.length === 1) {
            N.push(q[0]);
            continue;
          }
          const h = q.map((w) => w.properties._index).sort(), c = {
            ...q[0].properties,
            _index: h.join("-"),
            _members: h
          };
          let f;
          try {
            f = kt({ type: "FeatureCollection", features: q });
          } catch (w) {
            ge.warn(
              \`Union failed for group \${v} (\${q.length} members): \${w && w.message}. Treating members individually.\`
            );
            const y = q.map((m) => {
              const k = It(m.properties?._index), p = Math.max(a, Math.pow(10, -0.301 * k + 2.56) / u);
              return _i(m, p);
            }).filter(Boolean);
            if (y.length === 0) continue;
            if (y.length === 1) {
              N.push(y[0]);
              continue;
            }
            f = kt({ type: "FeatureCollection", features: y });
          }
          !f || !f.geometry || M.push({
            type: "Feature",
            geometry: f.geometry,
            properties: c
          });
        }
      }
      if (M.length > 0)
        for (let W = 0; W < M.length; W += 1)
          N.push(M[W]);
      A = {
        type: "FeatureCollection",
        features: N
      }, A = bi(A);
      let j = 0;
      for (let W = 0; W < A.features.length; W += 1) {
        const R = A.features[W], q = \`\${v}-\${W}\`, h = R.geometry, c = R.properties, f = It(c?._index), w = Math.max(a, Math.pow(10, -0.301 * f + 2.56) / u);
        if (h && h.type === "Polygon") {
          const y = pi(R, 256, { tolerance: w }), m = di(y, l);
          R.geometry = hi(y, { tolerance: w }), R.properties = { ...c, _area: m, _groupId: v }, m > j && (j = m);
        } else
          ge.warn(
            "Unexpected geometry type after union/simplify/flatten for id:" + v + " - type:" + (h && h.type)
          ), R.properties = { ...c, _area: 0, _groupId: v };
        R.id = q;
      }
      for (let W = 0; W < A.features.length; W += 1) {
        const R = A.features[W];
        R.properties && R.properties._area != null && R.properties._area > 0 ? (R.properties._localSortKey = j / R.properties._area, R.properties._globalSortKey = 1 / R.properties._area) : (R.properties._localSortKey = 1 / 0, R.properties._globalSortKey = 1 / 0);
      }
      A.id = v, A.timestamp = Date.now(), t.gatherRound != null && (A.gatherRound = t.gatherRound);
      const G = Ie(A).buffer;
      try {
        Pt(G, [G]);
      } catch (W) {
        ge.error(W, "Failed to send gather result to main thread");
      }
    }
    i();
  } catch (n) {
    ge.error(n, "gather worker failed"), i(n);
  }
};
`,B=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",G],{type:"text/javascript;charset=utf-8"});function ie(u){let e;try{if(e=B&&(self.URL||self.webkitURL).createObjectURL(B),!e)throw"";const n=new Worker(e,{type:"module",name:u?.name});return n.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(e)}),n}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(G),{type:"module",name:u?.name})}}class C{constructor(e){if(!e||typeof e!="object")throw new Error("ProperLabels requires an options object.");if(!e.map||typeof e.map!="object")throw new Error("ProperLabels requires a valid MapLibre map instance.");if(e.source==null)throw new Error("ProperLabels requires a source id or VectorTileSource instance.");if(typeof e.sourceLayer!="string"||!e.sourceLayer.trim())throw new Error("ProperLabels requires a valid non-empty sourceLayer string.");if(e.fid!=null&&typeof e.fid!="string")throw new Error("ProperLabels expects fid to be a string.");if(e.units!=null&&e.units!=="meters"&&e.units!=="m")throw new Error('ProperLabels expects units to be either "meters" or "m".');if(e.postDelay!=null){const r=Number(e.postDelay);if(!Number.isFinite(r)||r<0)throw new Error("ProperLabels expects postDelay to be a non-negative number.")}this.map=e.map;const n=e.source instanceof maplibregl.VectorTileSource?e.source:this.map.getSource(e.source);if(!n)throw new Error(`ProperLabels could not resolve source ${String(e.source)}. Provide a valid source id or a VectorTileSource instance attached to the map.`);if(!(n instanceof maplibregl.VectorTileSource))throw new Error("ProperLabels source must be a MapLibre VectorTileSource.");const t=this.map.getSource(n.id);if(!t||t!==n)throw new Error(`ProperLabels source ${String(n.id)} must be a live source registered on the provided map.`);return this.source=n,this.sourceLayer=e.sourceLayer.trim(),this.fid=e.fid||"id",this.tileSize=this.source.tileSize||512,this.tolerance=e.tolerance||1e-5,this.cacheSize=e.cacheSize||5e3,this.units=e.units||"meters",this.postDelay=e.postDelay!=null?Number(e.postDelay):0,this.debugLevel=Number.isFinite(Number(e.debugLevel))?Math.max(0,Math.min(3,Math.floor(Number(e.debugLevel)))):0,this.keepSource=e.keepSource===!0,this.gatherTimeout=Number.isFinite(Number(e.gatherTimeout))?Math.max(0,Number(e.gatherTimeout)):6e4,this._logger=new q(this.debugLevel,{name:"properlabels"}),this.map.addSource(this.source.id+"-proper",{type:"geojson",maxzoom:this.source.maxzoom,promoteId:"_index",data:{}}),this.gjSource=this.map.getSource(this.source.id+"-proper"),this.gjSource.dispose=()=>this.dispose(),this.manager=new te({map:this.map,source:this.source,sourceLayer:this.sourceLayer,fid:this.fid,tileSize:this.tileSize,tolerance:this.tolerance,cacheSize:this.cacheSize,units:this.units,postDelay:this.postDelay,debugLevel:this.debugLevel,gatherTimeout:this.gatherTimeout,tileWorkerSource:re,gatherWorkerSource:ie}),this.manager.setGeoJsonSource(this.gjSource),this._onSourceData=r=>this.manager.handleSourceData(r),this.map.on("sourcedata",this._onSourceData),this.map.refreshTiles(this.source.id),this.gjSource}dispose(){if(this.manager&&this.manager.dispose(),this.map&&typeof this.map.off=="function"&&this._onSourceData&&this.map.off("sourcedata",this._onSourceData),!this.keepSource&&this.map&&typeof this.map.getSource=="function"&&typeof this.map.removeSource=="function"){const e=`${this.source.id}-proper`;if(this.map.getSource(e))try{this.map.removeSource(e)}catch{}}}}const se=u=>{const e={};for(const n of Object.keys(u||{}))n==="map"||n==="source"||(e[n]=u[n]);return e},oe=(u={},e={})=>{const n=Object.keys(u).sort(),t=Object.keys(e).sort();if(n.length!==t.length)return!1;for(let r=0;r<n.length;r+=1){const i=n[r];if(t[r]!==i||u[i]!==e[i])return!1}return!0};maplibregl.VectorTileSource.prototype.ProperLabels=function(u){const e=u?.map||this._map;if(!e||typeof e!="object")throw new Error("ProperLabels plugin helper requires the VectorTileSource to be attached to a map. Use `source._map = map` or call `new ProperLabels({ map, source })` directly.");const n=Object.assign({},u,{map:e,source:this}),t=se(n);if(this._proper){const r=this._proper._properLabelsOptions||{};return oe(r,t)||(this._proper.dispose(),this._proper=new C(n),this._proper._properLabelsOptions=t),this._proper}return this._proper=new C(n),this._proper._properLabelsOptions=t,this._proper};module.exports=C;
