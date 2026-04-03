(function(x,v){typeof exports=="object"&&typeof module<"u"?module.exports=v():typeof define=="function"&&define.amd?define(v):(x=typeof globalThis<"u"?globalThis:x||self,x.ProperLabels=v())})(this,(function(){"use strict";var x=typeof document<"u"?document.currentScript:null;const v=`function B(e, n, t = {}) {
  const f = { type: "Feature" };
  return (t.id === 0 || t.id) && (f.id = t.id), t.bbox && (f.bbox = t.bbox), f.properties = n || {}, f.geometry = e, f;
}
function T(e, n = {}) {
  const t = { type: "FeatureCollection" };
  return n.id && (t.id = n.id), n.bbox && (t.bbox = n.bbox), t.features = e, t;
}
function O(e, n) {
  var t, f, u, c, y, s, i, a, r, o, l = 0, p = e.type === "FeatureCollection", h = e.type === "Feature", d = p ? e.features.length : 1;
  for (t = 0; t < d; t++) {
    for (s = p ? (
      // @ts-expect-error: Known type conflict
      e.features[t].geometry
    ) : h ? (
      // @ts-expect-error: Known type conflict
      e.geometry
    ) : e, a = p ? (
      // @ts-expect-error: Known type conflict
      e.features[t].properties
    ) : h ? (
      // @ts-expect-error: Known type conflict
      e.properties
    ) : {}, r = p ? (
      // @ts-expect-error: Known type conflict
      e.features[t].bbox
    ) : h ? (
      // @ts-expect-error: Known type conflict
      e.bbox
    ) : void 0, o = p ? (
      // @ts-expect-error: Known type conflict
      e.features[t].id
    ) : h ? (
      // @ts-expect-error: Known type conflict
      e.id
    ) : void 0, i = s ? s.type === "GeometryCollection" : !1, y = i ? s.geometries.length : 1, u = 0; u < y; u++) {
      if (c = i ? s.geometries[u] : s, c === null) {
        if (
          // @ts-expect-error: Known type conflict
          n(
            // @ts-expect-error: Known type conflict
            null,
            l,
            a,
            r,
            o
          ) === !1
        )
          return !1;
        continue;
      }
      switch (c.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            // @ts-expect-error: Known type conflict
            n(
              c,
              l,
              a,
              r,
              o
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (f = 0; f < c.geometries.length; f++)
            if (
              // @ts-expect-error: Known type conflict
              n(
                c.geometries[f],
                l,
                a,
                r,
                o
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    l++;
  }
}
function E(e, n) {
  O(e, function(t, f, u, c, y) {
    var s = t === null ? null : t.type;
    switch (s) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          n(
            B(t, u, { bbox: c, id: y }),
            f,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var i;
    switch (s) {
      case "MultiPoint":
        i = "Point";
        break;
      case "MultiLineString":
        i = "LineString";
        break;
      case "MultiPolygon":
        i = "Polygon";
        break;
    }
    for (
      var a = 0;
      // @ts-expect-error: Known type conflict
      a < t.coordinates.length;
      a++
    ) {
      var r = t.coordinates[a], o = {
        type: i,
        coordinates: r
      };
      if (
        // @ts-expect-error: Known type conflict
        n(B(o, u), f, a) === !1
      )
        return !1;
    }
  });
}
function v(e) {
  if (!e) throw new Error("geojson is required");
  var n = [];
  return E(e, function(t) {
    n.push(t);
  }), T(n);
}
const _ = typeof TextEncoder < "u", U = typeof TextDecoder < "u", C = _ ? new TextEncoder() : null, b = U ? new TextDecoder() : null, k = (e) => {
  if (e instanceof Uint8Array) return e;
  if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  const n = JSON.stringify(e);
  if (C) return C.encode(n);
  if (typeof Buffer < "u" && typeof Buffer.from == "function") return new Uint8Array(Buffer.from(n));
  throw new Error("No TextEncoder available to encode object");
}, F = (e) => {
  let n;
  if (e instanceof Uint8Array) n = e;
  else if (ArrayBuffer.isView(e)) n = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  else if (e instanceof ArrayBuffer) n = new Uint8Array(e);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(e)) n = new Uint8Array(e);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  return b ? JSON.parse(b.decode(n)) : typeof Buffer < "u" && typeof Buffer.from == "function" ? JSON.parse(Buffer.from(n).toString("utf8")) : JSON.parse(new TextDecoder().decode(n));
}, A = /* @__PURE__ */ new WeakMap(), L = (e, n, t) => {
  const [f, u, c] = n.split("|").map(Number), y = Math.pow(2, f) * t, s = 85.05112878, i = 1;
  return e[0].some((r) => {
    const o = Math.max(Math.min(r[1], s), -s), l = Math.sin(o * Math.PI / 180), p = (r[0] + 180) / 360, h = 0.5 - Math.log((1 + l) / (1 - l)) / (4 * Math.PI), d = p * y, w = h * y, g = Math.floor(d / t), M = Math.floor(w / t), x = Math.floor(d - g * t), m = Math.floor(w - M * t);
    return M != c || g != u || x <= i || m <= i || x >= t - i || m >= t - i;
  });
};
function S(e, n = {}) {
  const { unique: t = !1 } = n;
  if (e && typeof e == "object") {
    let r = A.get(e);
    const o = t ? "unique" : "__count";
    if (r && r.has(o))
      return r.get(o);
  }
  const f = t ? /* @__PURE__ */ new Set() : null;
  let u = 0;
  const c = (r) => Array.isArray(r) && r.length >= 2 && typeof r[0] == "number" && typeof r[1] == "number", y = (r) => {
    t ? f.add(r.slice(0, 3).join(",")) : u++;
  };
  function s(r) {
    if (c(r)) {
      y(r);
      return;
    }
    if (Array.isArray(r)) for (const o of r) s(o);
  }
  function i(r) {
    if (r) {
      if (r.type === "FeatureCollection") {
        for (const o of r.features || []) i(o);
        return;
      }
      if (r.type === "Feature") {
        i(r.geometry);
        return;
      }
      if (r.type === "GeometryCollection") {
        for (const o of r.geometries || []) i(o);
        return;
      }
      r.coordinates !== void 0 && s(r.coordinates);
    }
  }
  i(e);
  const a = t ? f.size : u;
  if (e && typeof e == "object") {
    let r = A.get(e);
    const o = t ? "unique" : "__count";
    r || (r = /* @__PURE__ */ new Map(), A.set(e, r)), r.set(o, a);
  }
  return a;
}
const P = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
P.onmessage = (e) => {
  const n = e.data, t = F(n);
  t.tolerance;
  const f = t.unique, u = t.tileSize, c = /* @__PURE__ */ new Map();
  t.collection.features.forEach((o) => {
    const l = o.id, p = c.get(l) || [];
    p.push(o), c.set(l, p);
  });
  let y = 0;
  const s = /* @__PURE__ */ new Map();
  c.forEach((o, l) => {
    const p = v({ type: "FeatureCollection", features: o }), h = { type: "FeatureCollection", features: [] };
    h.features = p.features.filter((d) => d.geometry.type === "Polygon").map((d, w) => {
      const g = \`\${f}|\${l}|\${w}\`, M = L(d.geometry.coordinates, d.properties._tile, u), x = Object.assign({}, d.properties, { _index: g, clipped: M }), m = { type: "Feature", geometry: d.geometry, properties: x };
      return y += S(m), m;
    }), s.set(l, h);
  });
  const i = Object.fromEntries(s), a = Object.assign({}, i, { unique: f, type: "simplified", size: y }), r = k(a).buffer;
  P.postMessage(r, [r]);
};
`,E=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",v],{type:"text/javascript;charset=utf-8"});function L(u){let n;try{if(n=E&&(self.URL||self.webkitURL).createObjectURL(E),!n)throw"";const e=new Worker(n,{type:"module",name:u?.name});return e.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(n)}),e}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(v),{type:"module",name:u?.name})}}const _=`var nt = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Re = Math.ceil, H = Math.floor, V = "[BigNumber Error] ", qe = V + "Number primitive has more than 15 significant digits: ", Z = 1e14, O = 14, Me = 9007199254740991, Oe = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], se = 1e7, U = 1e9;
function Je(i) {
  var e, t, n, r = S.prototype = { constructor: S, toString: null, valueOf: null }, u = new S(1), a = 20, f = 4, E = -7, p = 21, _ = -1e7, b = 1e7, T = !1, A = 1, N = 0, P = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, B = "0123456789abcdefghijklmnopqrstuvwxyz", k = !0;
  function S(s, o) {
    var l, m, c, y, w, h, g, x, d = this;
    if (!(d instanceof S)) return new S(s, o);
    if (o == null) {
      if (s && s._isBigNumber === !0) {
        d.s = s.s, !s.c || s.e > b ? d.c = d.e = null : s.e < _ ? d.c = [d.e = 0] : (d.e = s.e, d.c = s.c.slice());
        return;
      }
      if ((h = typeof s == "number") && s * 0 == 0) {
        if (d.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (y = 0, w = s; w >= 10; w /= 10, y++) ;
          y > b ? d.c = d.e = null : (d.e = y, d.c = [s]);
          return;
        }
        x = String(s);
      } else {
        if (!nt.test(x = String(s))) return n(d, x, h);
        d.s = x.charCodeAt(0) == 45 ? (x = x.slice(1), -1) : 1;
      }
      (y = x.indexOf(".")) > -1 && (x = x.replace(".", "")), (w = x.search(/e/i)) > 0 ? (y < 0 && (y = w), y += +x.slice(w + 1), x = x.substring(0, w)) : y < 0 && (y = x.length);
    } else {
      if (G(o, 2, B.length, "Base"), o == 10 && k)
        return d = new S(s), K(d, a + d.e + 1, f);
      if (x = String(s), h = typeof s == "number") {
        if (s * 0 != 0) return n(d, x, h, o);
        if (d.s = 1 / s < 0 ? (x = x.slice(1), -1) : 1, S.DEBUG && x.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(qe + s);
      } else
        d.s = x.charCodeAt(0) === 45 ? (x = x.slice(1), -1) : 1;
      for (l = B.slice(0, o), y = w = 0, g = x.length; w < g; w++)
        if (l.indexOf(m = x.charAt(w)) < 0) {
          if (m == ".") {
            if (w > y) {
              y = g;
              continue;
            }
          } else if (!c && (x == x.toUpperCase() && (x = x.toLowerCase()) || x == x.toLowerCase() && (x = x.toUpperCase()))) {
            c = !0, w = -1, y = 0;
            continue;
          }
          return n(d, String(s), h, o);
        }
      h = !1, x = t(x, o, 10, d.s), (y = x.indexOf(".")) > -1 ? x = x.replace(".", "") : y = x.length;
    }
    for (w = 0; x.charCodeAt(w) === 48; w++) ;
    for (g = x.length; x.charCodeAt(--g) === 48; ) ;
    if (x = x.slice(w, ++g)) {
      if (g -= w, h && S.DEBUG && g > 15 && (s > Me || s !== H(s)))
        throw Error(qe + d.s * s);
      if ((y = y - w - 1) > b)
        d.c = d.e = null;
      else if (y < _)
        d.c = [d.e = 0];
      else {
        if (d.e = y, d.c = [], w = (y + 1) % O, y < 0 && (w += O), w < g) {
          for (w && d.c.push(+x.slice(0, w)), g -= O; w < g; )
            d.c.push(+x.slice(w, w += O));
          w = O - (x = x.slice(w)).length;
        } else
          w -= g;
        for (; w--; x += "0") ;
        d.c.push(+x);
      }
    } else
      d.c = [d.e = 0];
  }
  S.clone = Je, S.ROUND_UP = 0, S.ROUND_DOWN = 1, S.ROUND_CEIL = 2, S.ROUND_FLOOR = 3, S.ROUND_HALF_UP = 4, S.ROUND_HALF_DOWN = 5, S.ROUND_HALF_EVEN = 6, S.ROUND_HALF_CEIL = 7, S.ROUND_HALF_FLOOR = 8, S.EUCLID = 9, S.config = S.set = function(s) {
    var o, l;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(o = "DECIMAL_PLACES") && (l = s[o], G(l, 0, U, o), a = l), s.hasOwnProperty(o = "ROUNDING_MODE") && (l = s[o], G(l, 0, 8, o), f = l), s.hasOwnProperty(o = "EXPONENTIAL_AT") && (l = s[o], l && l.pop ? (G(l[0], -U, 0, o), G(l[1], 0, U, o), E = l[0], p = l[1]) : (G(l, -U, U, o), E = -(p = l < 0 ? -l : l))), s.hasOwnProperty(o = "RANGE"))
          if (l = s[o], l && l.pop)
            G(l[0], -U, -1, o), G(l[1], 1, U, o), _ = l[0], b = l[1];
          else if (G(l, -U, U, o), l)
            _ = -(b = l < 0 ? -l : l);
          else
            throw Error(V + o + " cannot be zero: " + l);
        if (s.hasOwnProperty(o = "CRYPTO"))
          if (l = s[o], l === !!l)
            if (l)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                T = l;
              else
                throw T = !l, Error(V + "crypto unavailable");
            else
              T = l;
          else
            throw Error(V + o + " not true or false: " + l);
        if (s.hasOwnProperty(o = "MODULO_MODE") && (l = s[o], G(l, 0, 9, o), A = l), s.hasOwnProperty(o = "POW_PRECISION") && (l = s[o], G(l, 0, U, o), N = l), s.hasOwnProperty(o = "FORMAT"))
          if (l = s[o], typeof l == "object") P = l;
          else throw Error(V + o + " not an object: " + l);
        if (s.hasOwnProperty(o = "ALPHABET"))
          if (l = s[o], typeof l == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(l))
            k = l.slice(0, 10) == "0123456789", B = l;
          else
            throw Error(V + o + " invalid: " + l);
      } else
        throw Error(V + "Object expected: " + s);
    return {
      DECIMAL_PLACES: a,
      ROUNDING_MODE: f,
      EXPONENTIAL_AT: [E, p],
      RANGE: [_, b],
      CRYPTO: T,
      MODULO_MODE: A,
      POW_PRECISION: N,
      FORMAT: P,
      ALPHABET: B
    };
  }, S.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!S.DEBUG) return !0;
    var o, l, m = s.c, c = s.e, y = s.s;
    e: if ({}.toString.call(m) == "[object Array]") {
      if ((y === 1 || y === -1) && c >= -U && c <= U && c === H(c)) {
        if (m[0] === 0) {
          if (c === 0 && m.length === 1) return !0;
          break e;
        }
        if (o = (c + 1) % O, o < 1 && (o += O), String(m[0]).length == o) {
          for (o = 0; o < m.length; o++)
            if (l = m[o], l < 0 || l >= Z || l !== H(l)) break e;
          if (l !== 0) return !0;
        }
      }
    } else if (m === null && c === null && (y === null || y === 1 || y === -1))
      return !0;
    throw Error(V + "Invalid BigNumber: " + s);
  }, S.maximum = S.max = function() {
    return J(arguments, -1);
  }, S.minimum = S.min = function() {
    return J(arguments, 1);
  }, S.random = (function() {
    var s = 9007199254740992, o = Math.random() * s & 2097151 ? function() {
      return H(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(l) {
      var m, c, y, w, h, g = 0, x = [], d = new S(u);
      if (l == null ? l = a : G(l, 0, U), w = Re(l / O), T)
        if (crypto.getRandomValues) {
          for (m = crypto.getRandomValues(new Uint32Array(w *= 2)); g < w; )
            h = m[g] * 131072 + (m[g + 1] >>> 11), h >= 9e15 ? (c = crypto.getRandomValues(new Uint32Array(2)), m[g] = c[0], m[g + 1] = c[1]) : (x.push(h % 1e14), g += 2);
          g = w / 2;
        } else if (crypto.randomBytes) {
          for (m = crypto.randomBytes(w *= 7); g < w; )
            h = (m[g] & 31) * 281474976710656 + m[g + 1] * 1099511627776 + m[g + 2] * 4294967296 + m[g + 3] * 16777216 + (m[g + 4] << 16) + (m[g + 5] << 8) + m[g + 6], h >= 9e15 ? crypto.randomBytes(7).copy(m, g) : (x.push(h % 1e14), g += 7);
          g = w / 7;
        } else
          throw T = !1, Error(V + "crypto unavailable");
      if (!T)
        for (; g < w; )
          h = o(), h < 9e15 && (x[g++] = h % 1e14);
      for (w = x[--g], l %= O, w && l && (h = Oe[O - l], x[g] = H(w / h) * h); x[g] === 0; x.pop(), g--) ;
      if (g < 0)
        x = [y = 0];
      else {
        for (y = -1; x[0] === 0; x.splice(0, 1), y -= O) ;
        for (g = 1, h = x[0]; h >= 10; h /= 10, g++) ;
        g < O && (y -= O - g);
      }
      return d.e = y, d.c = x, d;
    };
  })(), S.sum = function() {
    for (var s = 1, o = arguments, l = new S(o[0]); s < o.length; ) l = l.plus(o[s++]);
    return l;
  }, t = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function o(l, m, c, y) {
      for (var w, h = [0], g, x = 0, d = l.length; x < d; ) {
        for (g = h.length; g--; h[g] *= m) ;
        for (h[0] += y.indexOf(l.charAt(x++)), w = 0; w < h.length; w++)
          h[w] > c - 1 && (h[w + 1] == null && (h[w + 1] = 0), h[w + 1] += h[w] / c | 0, h[w] %= c);
      }
      return h.reverse();
    }
    return function(l, m, c, y, w) {
      var h, g, x, d, v, R, M, I, q = l.indexOf("."), D = a, L = f;
      for (q >= 0 && (d = N, N = 0, l = l.replace(".", ""), I = new S(m), R = I.pow(l.length - q), N = d, I.c = o(
        ne(Y(R.c), R.e, "0"),
        10,
        c,
        s
      ), I.e = I.c.length), M = o(l, m, c, w ? (h = B, s) : (h = s, B)), x = d = M.length; M[--d] == 0; M.pop()) ;
      if (!M[0]) return h.charAt(0);
      if (q < 0 ? --x : (R.c = M, R.e = x, R.s = y, R = e(R, I, D, L, c), M = R.c, v = R.r, x = R.e), g = x + D + 1, q = M[g], d = c / 2, v = v || g < 0 || M[g + 1] != null, v = L < 4 ? (q != null || v) && (L == 0 || L == (R.s < 0 ? 3 : 2)) : q > d || q == d && (L == 4 || v || L == 6 && M[g - 1] & 1 || L == (R.s < 0 ? 8 : 7)), g < 1 || !M[0])
        l = v ? ne(h.charAt(1), -D, h.charAt(0)) : h.charAt(0);
      else {
        if (M.length = g, v)
          for (--c; ++M[--g] > c; )
            M[g] = 0, g || (++x, M = [1].concat(M));
        for (d = M.length; !M[--d]; ) ;
        for (q = 0, l = ""; q <= d; l += h.charAt(M[q++])) ;
        l = ne(l, x, h.charAt(0));
      }
      return l;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(m, c, y) {
      var w, h, g, x, d = 0, v = m.length, R = c % se, M = c / se | 0;
      for (m = m.slice(); v--; )
        g = m[v] % se, x = m[v] / se | 0, w = M * g + x * R, h = R * g + w % se * se + d, d = (h / y | 0) + (w / se | 0) + M * x, m[v] = h % y;
      return d && (m = [d].concat(m)), m;
    }
    function o(m, c, y, w) {
      var h, g;
      if (y != w)
        g = y > w ? 1 : -1;
      else
        for (h = g = 0; h < y; h++)
          if (m[h] != c[h]) {
            g = m[h] > c[h] ? 1 : -1;
            break;
          }
      return g;
    }
    function l(m, c, y, w) {
      for (var h = 0; y--; )
        m[y] -= h, h = m[y] < c[y] ? 1 : 0, m[y] = h * w + m[y] - c[y];
      for (; !m[0] && m.length > 1; m.splice(0, 1)) ;
    }
    return function(m, c, y, w, h) {
      var g, x, d, v, R, M, I, q, D, L, C, z, ce, be, _e, Q, le, X = m.s == c.s ? 1 : -1, $ = m.c, F = c.c;
      if (!$ || !$[0] || !F || !F[0])
        return new S(
          // Return NaN if either NaN, or both Infinity or 0.
          !m.s || !c.s || ($ ? F && $[0] == F[0] : !F) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            $ && $[0] == 0 || !F ? X * 0 : X / 0
          )
        );
      for (q = new S(X), D = q.c = [], x = m.e - c.e, X = y + x + 1, h || (h = Z, x = W(m.e / O) - W(c.e / O), X = X / O | 0), d = 0; F[d] == ($[d] || 0); d++) ;
      if (F[d] > ($[d] || 0) && x--, X < 0)
        D.push(1), v = !0;
      else {
        for (be = $.length, Q = F.length, d = 0, X += 2, R = H(h / (F[0] + 1)), R > 1 && (F = s(F, R, h), $ = s($, R, h), Q = F.length, be = $.length), ce = Q, L = $.slice(0, Q), C = L.length; C < Q; L[C++] = 0) ;
        le = F.slice(), le = [0].concat(le), _e = F[0], F[1] >= h / 2 && _e++;
        do {
          if (R = 0, g = o(F, L, Q, C), g < 0) {
            if (z = L[0], Q != C && (z = z * h + (L[1] || 0)), R = H(z / _e), R > 1)
              for (R >= h && (R = h - 1), M = s(F, R, h), I = M.length, C = L.length; o(M, L, I, C) == 1; )
                R--, l(M, Q < I ? le : F, I, h), I = M.length, g = 1;
            else
              R == 0 && (g = R = 1), M = F.slice(), I = M.length;
            if (I < C && (M = [0].concat(M)), l(L, M, C, h), C = L.length, g == -1)
              for (; o(F, L, Q, C) < 1; )
                R++, l(L, Q < C ? le : F, C, h), C = L.length;
          } else g === 0 && (R++, L = [0]);
          D[d++] = R, L[0] ? L[C++] = $[ce] || 0 : (L = [$[ce]], C = 1);
        } while ((ce++ < be || L[0] != null) && X--);
        v = L[0] != null, D[0] || D.splice(0, 1);
      }
      if (h == Z) {
        for (d = 1, X = D[0]; X >= 10; X /= 10, d++) ;
        K(q, y + (q.e = d + x * O - 1) + 1, w, v);
      } else
        q.e = x, q.r = +v;
      return q;
    };
  })();
  function j(s, o, l, m) {
    var c, y, w, h, g;
    if (l == null ? l = f : G(l, 0, 8), !s.c) return s.toString();
    if (c = s.c[0], w = s.e, o == null)
      g = Y(s.c), g = m == 1 || m == 2 && (w <= E || w >= p) ? ge(g, w) : ne(g, w, "0");
    else if (s = K(new S(s), o, l), y = s.e, g = Y(s.c), h = g.length, m == 1 || m == 2 && (o <= y || y <= E)) {
      for (; h < o; g += "0", h++) ;
      g = ge(g, y);
    } else if (o -= w + (m === 2 && y > w), g = ne(g, y, "0"), y + 1 > h) {
      if (--o > 0) for (g += "."; o--; g += "0") ;
    } else if (o += y - h, o > 0)
      for (y + 1 == h && (g += "."); o--; g += "0") ;
    return s.s < 0 && c ? "-" + g : g;
  }
  function J(s, o) {
    for (var l, m, c = 1, y = new S(s[0]); c < s.length; c++)
      m = new S(s[c]), (!m.s || (l = oe(y, m)) === o || l === 0 && y.s === o) && (y = m);
    return y;
  }
  function Te(s, o, l) {
    for (var m = 1, c = o.length; !o[--c]; o.pop()) ;
    for (c = o[0]; c >= 10; c /= 10, m++) ;
    return (l = m + l * O - 1) > b ? s.c = s.e = null : l < _ ? s.c = [s.e = 0] : (s.e = l, s.c = o), s;
  }
  n = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, o = /^([^.]+)\\.$/, l = /^\\.([^.]+)$/, m = /^-?(Infinity|NaN)$/, c = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(y, w, h, g) {
      var x, d = h ? w : w.replace(c, "");
      if (m.test(d))
        y.s = isNaN(d) ? null : d < 0 ? -1 : 1;
      else {
        if (!h && (d = d.replace(s, function(v, R, M) {
          return x = (M = M.toLowerCase()) == "x" ? 16 : M == "b" ? 2 : 8, !g || g == x ? R : v;
        }), g && (x = g, d = d.replace(o, "$1").replace(l, "0.$1")), w != d))
          return new S(d, x);
        if (S.DEBUG)
          throw Error(V + "Not a" + (g ? " base " + g : "") + " number: " + w);
        y.s = null;
      }
      y.c = y.e = null;
    };
  })();
  function K(s, o, l, m) {
    var c, y, w, h, g, x, d, v = s.c, R = Oe;
    if (v) {
      e: {
        for (c = 1, h = v[0]; h >= 10; h /= 10, c++) ;
        if (y = o - c, y < 0)
          y += O, w = o, g = v[x = 0], d = H(g / R[c - w - 1] % 10);
        else if (x = Re((y + 1) / O), x >= v.length)
          if (m) {
            for (; v.length <= x; v.push(0)) ;
            g = d = 0, c = 1, y %= O, w = y - O + 1;
          } else
            break e;
        else {
          for (g = h = v[x], c = 1; h >= 10; h /= 10, c++) ;
          y %= O, w = y - O + c, d = w < 0 ? 0 : H(g / R[c - w - 1] % 10);
        }
        if (m = m || o < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        v[x + 1] != null || (w < 0 ? g : g % R[c - w - 1]), m = l < 4 ? (d || m) && (l == 0 || l == (s.s < 0 ? 3 : 2)) : d > 5 || d == 5 && (l == 4 || m || l == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? w > 0 ? g / R[c - w] : 0 : v[x - 1]) % 10 & 1 || l == (s.s < 0 ? 8 : 7)), o < 1 || !v[0])
          return v.length = 0, m ? (o -= s.e + 1, v[0] = R[(O - o % O) % O], s.e = -o || 0) : v[0] = s.e = 0, s;
        if (y == 0 ? (v.length = x, h = 1, x--) : (v.length = x + 1, h = R[O - y], v[x] = w > 0 ? H(g / R[c - w] % R[w]) * h : 0), m)
          for (; ; )
            if (x == 0) {
              for (y = 1, w = v[0]; w >= 10; w /= 10, y++) ;
              for (w = v[0] += h, h = 1; w >= 10; w /= 10, h++) ;
              y != h && (s.e++, v[0] == Z && (v[0] = 1));
              break;
            } else {
              if (v[x] += h, v[x] != Z) break;
              v[x--] = 0, h = 1;
            }
        for (y = v.length; v[--y] === 0; v.pop()) ;
      }
      s.e > b ? s.c = s.e = null : s.e < _ && (s.c = [s.e = 0]);
    }
    return s;
  }
  function ie(s) {
    var o, l = s.e;
    return l === null ? s.toString() : (o = Y(s.c), o = l <= E || l >= p ? ge(o, l) : ne(o, l, "0"), s.s < 0 ? "-" + o : o);
  }
  return r.absoluteValue = r.abs = function() {
    var s = new S(this);
    return s.s < 0 && (s.s = 1), s;
  }, r.comparedTo = function(s, o) {
    return oe(this, new S(s, o));
  }, r.decimalPlaces = r.dp = function(s, o) {
    var l, m, c, y = this;
    if (s != null)
      return G(s, 0, U), o == null ? o = f : G(o, 0, 8), K(new S(y), s + y.e + 1, o);
    if (!(l = y.c)) return null;
    if (m = ((c = l.length - 1) - W(this.e / O)) * O, c = l[c]) for (; c % 10 == 0; c /= 10, m--) ;
    return m < 0 && (m = 0), m;
  }, r.dividedBy = r.div = function(s, o) {
    return e(this, new S(s, o), a, f);
  }, r.dividedToIntegerBy = r.idiv = function(s, o) {
    return e(this, new S(s, o), 0, 1);
  }, r.exponentiatedBy = r.pow = function(s, o) {
    var l, m, c, y, w, h, g, x, d, v = this;
    if (s = new S(s), s.c && !s.isInteger())
      throw Error(V + "Exponent not an integer: " + ie(s));
    if (o != null && (o = new S(o)), h = s.e > 14, !v.c || !v.c[0] || v.c[0] == 1 && !v.e && v.c.length == 1 || !s.c || !s.c[0])
      return d = new S(Math.pow(+ie(v), h ? s.s * (2 - pe(s)) : +ie(s))), o ? d.mod(o) : d;
    if (g = s.s < 0, o) {
      if (o.c ? !o.c[0] : !o.s) return new S(NaN);
      m = !g && v.isInteger() && o.isInteger(), m && (v = v.mod(o));
    } else {
      if (s.e > 9 && (v.e > 0 || v.e < -1 || (v.e == 0 ? v.c[0] > 1 || h && v.c[1] >= 24e7 : v.c[0] < 8e13 || h && v.c[0] <= 9999975e7)))
        return y = v.s < 0 && pe(s) ? -0 : 0, v.e > -1 && (y = 1 / y), new S(g ? 1 / y : y);
      N && (y = Re(N / O + 2));
    }
    for (h ? (l = new S(0.5), g && (s.s = 1), x = pe(s)) : (c = Math.abs(+ie(s)), x = c % 2), d = new S(u); ; ) {
      if (x) {
        if (d = d.times(v), !d.c) break;
        y ? d.c.length > y && (d.c.length = y) : m && (d = d.mod(o));
      }
      if (c) {
        if (c = H(c / 2), c === 0) break;
        x = c % 2;
      } else if (s = s.times(l), K(s, s.e + 1, 1), s.e > 14)
        x = pe(s);
      else {
        if (c = +ie(s), c === 0) break;
        x = c % 2;
      }
      v = v.times(v), y ? v.c && v.c.length > y && (v.c.length = y) : m && (v = v.mod(o));
    }
    return m ? d : (g && (d = u.div(d)), o ? d.mod(o) : y ? K(d, N, f, w) : d);
  }, r.integerValue = function(s) {
    var o = new S(this);
    return s == null ? s = f : G(s, 0, 8), K(o, o.e + 1, s);
  }, r.isEqualTo = r.eq = function(s, o) {
    return oe(this, new S(s, o)) === 0;
  }, r.isFinite = function() {
    return !!this.c;
  }, r.isGreaterThan = r.gt = function(s, o) {
    return oe(this, new S(s, o)) > 0;
  }, r.isGreaterThanOrEqualTo = r.gte = function(s, o) {
    return (o = oe(this, new S(s, o))) === 1 || o === 0;
  }, r.isInteger = function() {
    return !!this.c && W(this.e / O) > this.c.length - 2;
  }, r.isLessThan = r.lt = function(s, o) {
    return oe(this, new S(s, o)) < 0;
  }, r.isLessThanOrEqualTo = r.lte = function(s, o) {
    return (o = oe(this, new S(s, o))) === -1 || o === 0;
  }, r.isNaN = function() {
    return !this.s;
  }, r.isNegative = function() {
    return this.s < 0;
  }, r.isPositive = function() {
    return this.s > 0;
  }, r.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, r.minus = function(s, o) {
    var l, m, c, y, w = this, h = w.s;
    if (s = new S(s, o), o = s.s, !h || !o) return new S(NaN);
    if (h != o)
      return s.s = -o, w.plus(s);
    var g = w.e / O, x = s.e / O, d = w.c, v = s.c;
    if (!g || !x) {
      if (!d || !v) return d ? (s.s = -o, s) : new S(v ? w : NaN);
      if (!d[0] || !v[0])
        return v[0] ? (s.s = -o, s) : new S(d[0] ? w : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          f == 3 ? -0 : 0
        ));
    }
    if (g = W(g), x = W(x), d = d.slice(), h = g - x) {
      for ((y = h < 0) ? (h = -h, c = d) : (x = g, c = v), c.reverse(), o = h; o--; c.push(0)) ;
      c.reverse();
    } else
      for (m = (y = (h = d.length) < (o = v.length)) ? h : o, h = o = 0; o < m; o++)
        if (d[o] != v[o]) {
          y = d[o] < v[o];
          break;
        }
    if (y && (c = d, d = v, v = c, s.s = -s.s), o = (m = v.length) - (l = d.length), o > 0) for (; o--; d[l++] = 0) ;
    for (o = Z - 1; m > h; ) {
      if (d[--m] < v[m]) {
        for (l = m; l && !d[--l]; d[l] = o) ;
        --d[l], d[m] += Z;
      }
      d[m] -= v[m];
    }
    for (; d[0] == 0; d.splice(0, 1), --x) ;
    return d[0] ? Te(s, d, x) : (s.s = f == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, r.modulo = r.mod = function(s, o) {
    var l, m, c = this;
    return s = new S(s, o), !c.c || !s.s || s.c && !s.c[0] ? new S(NaN) : !s.c || c.c && !c.c[0] ? new S(c) : (A == 9 ? (m = s.s, s.s = 1, l = e(c, s, 0, 3), s.s = m, l.s *= m) : l = e(c, s, 0, A), s = c.minus(l.times(s)), !s.c[0] && A == 1 && (s.s = c.s), s);
  }, r.multipliedBy = r.times = function(s, o) {
    var l, m, c, y, w, h, g, x, d, v, R, M, I, q, D, L = this, C = L.c, z = (s = new S(s, o)).c;
    if (!C || !z || !C[0] || !z[0])
      return !L.s || !s.s || C && !C[0] && !z || z && !z[0] && !C ? s.c = s.e = s.s = null : (s.s *= L.s, !C || !z ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (m = W(L.e / O) + W(s.e / O), s.s *= L.s, g = C.length, v = z.length, g < v && (I = C, C = z, z = I, c = g, g = v, v = c), c = g + v, I = []; c--; I.push(0)) ;
    for (q = Z, D = se, c = v; --c >= 0; ) {
      for (l = 0, R = z[c] % D, M = z[c] / D | 0, w = g, y = c + w; y > c; )
        x = C[--w] % D, d = C[w] / D | 0, h = M * x + d * R, x = R * x + h % D * D + I[y] + l, l = (x / q | 0) + (h / D | 0) + M * d, I[y--] = x % q;
      I[y] = l;
    }
    return l ? ++m : I.splice(0, 1), Te(s, I, m);
  }, r.negated = function() {
    var s = new S(this);
    return s.s = -s.s || null, s;
  }, r.plus = function(s, o) {
    var l, m = this, c = m.s;
    if (s = new S(s, o), o = s.s, !c || !o) return new S(NaN);
    if (c != o)
      return s.s = -o, m.minus(s);
    var y = m.e / O, w = s.e / O, h = m.c, g = s.c;
    if (!y || !w) {
      if (!h || !g) return new S(c / 0);
      if (!h[0] || !g[0]) return g[0] ? s : new S(h[0] ? m : c * 0);
    }
    if (y = W(y), w = W(w), h = h.slice(), c = y - w) {
      for (c > 0 ? (w = y, l = g) : (c = -c, l = h), l.reverse(); c--; l.push(0)) ;
      l.reverse();
    }
    for (c = h.length, o = g.length, c - o < 0 && (l = g, g = h, h = l, o = c), c = 0; o; )
      c = (h[--o] = h[o] + g[o] + c) / Z | 0, h[o] = Z === h[o] ? 0 : h[o] % Z;
    return c && (h = [c].concat(h), ++w), Te(s, h, w);
  }, r.precision = r.sd = function(s, o) {
    var l, m, c, y = this;
    if (s != null && s !== !!s)
      return G(s, 1, U), o == null ? o = f : G(o, 0, 8), K(new S(y), s, o);
    if (!(l = y.c)) return null;
    if (c = l.length - 1, m = c * O + 1, c = l[c]) {
      for (; c % 10 == 0; c /= 10, m--) ;
      for (c = l[0]; c >= 10; c /= 10, m++) ;
    }
    return s && y.e + 1 > m && (m = y.e + 1), m;
  }, r.shiftedBy = function(s) {
    return G(s, -Me, Me), this.times("1e" + s);
  }, r.squareRoot = r.sqrt = function() {
    var s, o, l, m, c, y = this, w = y.c, h = y.s, g = y.e, x = a + 4, d = new S("0.5");
    if (h !== 1 || !w || !w[0])
      return new S(!h || h < 0 && (!w || w[0]) ? NaN : w ? y : 1 / 0);
    if (h = Math.sqrt(+ie(y)), h == 0 || h == 1 / 0 ? (o = Y(w), (o.length + g) % 2 == 0 && (o += "0"), h = Math.sqrt(+o), g = W((g + 1) / 2) - (g < 0 || g % 2), h == 1 / 0 ? o = "5e" + g : (o = h.toExponential(), o = o.slice(0, o.indexOf("e") + 1) + g), l = new S(o)) : l = new S(h + ""), l.c[0]) {
      for (g = l.e, h = g + x, h < 3 && (h = 0); ; )
        if (c = l, l = d.times(c.plus(e(y, c, x, 1))), Y(c.c).slice(0, h) === (o = Y(l.c)).slice(0, h))
          if (l.e < g && --h, o = o.slice(h - 3, h + 1), o == "9999" || !m && o == "4999") {
            if (!m && (K(c, c.e + a + 2, 0), c.times(c).eq(y))) {
              l = c;
              break;
            }
            x += 4, h += 4, m = 1;
          } else {
            (!+o || !+o.slice(1) && o.charAt(0) == "5") && (K(l, l.e + a + 2, 1), s = !l.times(l).eq(y));
            break;
          }
    }
    return K(l, l.e + a + 1, f, s);
  }, r.toExponential = function(s, o) {
    return s != null && (G(s, 0, U), s++), j(this, s, o, 1);
  }, r.toFixed = function(s, o) {
    return s != null && (G(s, 0, U), s = s + this.e + 1), j(this, s, o);
  }, r.toFormat = function(s, o, l) {
    var m, c = this;
    if (l == null)
      s != null && o && typeof o == "object" ? (l = o, o = null) : s && typeof s == "object" ? (l = s, s = o = null) : l = P;
    else if (typeof l != "object")
      throw Error(V + "Argument not an object: " + l);
    if (m = c.toFixed(s, o), c.c) {
      var y, w = m.split("."), h = +l.groupSize, g = +l.secondaryGroupSize, x = l.groupSeparator || "", d = w[0], v = w[1], R = c.s < 0, M = R ? d.slice(1) : d, I = M.length;
      if (g && (y = h, h = g, g = y, I -= y), h > 0 && I > 0) {
        for (y = I % h || h, d = M.substr(0, y); y < I; y += h) d += x + M.substr(y, h);
        g > 0 && (d += x + M.slice(y)), R && (d = "-" + d);
      }
      m = v ? d + (l.decimalSeparator || "") + ((g = +l.fractionGroupSize) ? v.replace(
        new RegExp("\\\\d{" + g + "}\\\\B", "g"),
        "$&" + (l.fractionGroupSeparator || "")
      ) : v) : d;
    }
    return (l.prefix || "") + m + (l.suffix || "");
  }, r.toFraction = function(s) {
    var o, l, m, c, y, w, h, g, x, d, v, R, M = this, I = M.c;
    if (s != null && (h = new S(s), !h.isInteger() && (h.c || h.s !== 1) || h.lt(u)))
      throw Error(V + "Argument " + (h.isInteger() ? "out of range: " : "not an integer: ") + ie(h));
    if (!I) return new S(M);
    for (o = new S(u), x = l = new S(u), m = g = new S(u), R = Y(I), y = o.e = R.length - M.e - 1, o.c[0] = Oe[(w = y % O) < 0 ? O + w : w], s = !s || h.comparedTo(o) > 0 ? y > 0 ? o : x : h, w = b, b = 1 / 0, h = new S(R), g.c[0] = 0; d = e(h, o, 0, 1), c = l.plus(d.times(m)), c.comparedTo(s) != 1; )
      l = m, m = c, x = g.plus(d.times(c = x)), g = c, o = h.minus(d.times(c = o)), h = c;
    return c = e(s.minus(l), m, 0, 1), g = g.plus(c.times(x)), l = l.plus(c.times(m)), g.s = x.s = M.s, y = y * 2, v = e(x, m, y, f).minus(M).abs().comparedTo(
      e(g, l, y, f).minus(M).abs()
    ) < 1 ? [x, m] : [g, l], b = w, v;
  }, r.toNumber = function() {
    return +ie(this);
  }, r.toPrecision = function(s, o) {
    return s != null && G(s, 1, U), j(this, s, o, 2);
  }, r.toString = function(s) {
    var o, l = this, m = l.s, c = l.e;
    return c === null ? m ? (o = "Infinity", m < 0 && (o = "-" + o)) : o = "NaN" : (s == null ? o = c <= E || c >= p ? ge(Y(l.c), c) : ne(Y(l.c), c, "0") : s === 10 && k ? (l = K(new S(l), a + c + 1, f), o = ne(Y(l.c), l.e, "0")) : (G(s, 2, B.length, "Base"), o = t(ne(Y(l.c), c, "0"), 10, s, m, !0)), m < 0 && l.c[0] && (o = "-" + o)), o;
  }, r.valueOf = r.toJSON = function() {
    return ie(this);
  }, r._isBigNumber = !0, r[Symbol.toStringTag] = "BigNumber", r[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = r.valueOf, i != null && S.set(i), S;
}
function W(i) {
  var e = i | 0;
  return i > 0 || i === e ? e : e - 1;
}
function Y(i) {
  for (var e, t, n = 1, r = i.length, u = i[0] + ""; n < r; ) {
    for (e = i[n++] + "", t = O - e.length; t--; e = "0" + e) ;
    u += e;
  }
  for (r = u.length; u.charCodeAt(--r) === 48; ) ;
  return u.slice(0, r + 1 || 1);
}
function oe(i, e) {
  var t, n, r = i.c, u = e.c, a = i.s, f = e.s, E = i.e, p = e.e;
  if (!a || !f) return null;
  if (t = r && !r[0], n = u && !u[0], t || n) return t ? n ? 0 : -f : a;
  if (a != f) return a;
  if (t = a < 0, n = E == p, !r || !u) return n ? 0 : !r ^ t ? 1 : -1;
  if (!n) return E > p ^ t ? 1 : -1;
  for (f = (E = r.length) < (p = u.length) ? E : p, a = 0; a < f; a++) if (r[a] != u[a]) return r[a] > u[a] ^ t ? 1 : -1;
  return E == p ? 0 : E > p ^ t ? 1 : -1;
}
function G(i, e, t, n) {
  if (i < e || i > t || i !== H(i))
    throw Error(V + (n || "Argument") + (typeof i == "number" ? i < e || i > t ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(i));
}
function pe(i) {
  var e = i.c.length - 1;
  return W(i.e / O) == e && i.c[e] % 2 != 0;
}
function ge(i, e) {
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
var te = Je(), rt = class {
  key;
  left = null;
  right = null;
  constructor(i) {
    this.key = i;
  }
}, ue = class extends rt {
  constructor(i) {
    super(i);
  }
}, st = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(i) {
    const e = this.root;
    if (e == null)
      return this.compare(i, i), -1;
    let t = null, n = null, r = null, u = null, a = e;
    const f = this.compare;
    let E;
    for (; ; )
      if (E = f(a.key, i), E > 0) {
        let p = a.left;
        if (p == null || (E = f(p.key, i), E > 0 && (a.left = p.right, p.right = a, a = p, p = a.left, p == null)))
          break;
        t == null ? n = a : t.left = a, t = a, a = p;
      } else if (E < 0) {
        let p = a.right;
        if (p == null || (E = f(p.key, i), E < 0 && (a.right = p.left, p.left = a, a = p, p = a.right, p == null)))
          break;
        r == null ? u = a : r.right = a, r = a, a = p;
      } else
        break;
    return r != null && (r.right = a.left, a.left = u), t != null && (t.left = a.right, a.right = n), this.root !== a && (this.root = a, this.splayCount++), E;
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
      const u = t.right;
      t = this.splayMax(r), t.right = u, this.root = t;
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
}, xe = class he extends st {
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
    return t != 0 && this.addNewRoot(new ue(e), t), this;
  }
  addAndReturn(e) {
    const t = this.splay(e);
    return t != 0 && this.addNewRoot(new ue(e), t), this.root.key;
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
    const t = new he(this.compare, this.validKey), n = this.modificationCount;
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
    const t = new he(this.compare, this.validKey);
    for (const n of this)
      e.has(n) && t.add(n);
    return t;
  }
  difference(e) {
    const t = new he(this.compare, this.validKey);
    for (const n of this)
      e.has(n) || t.add(n);
    return t;
  }
  union(e) {
    const t = this.clone();
    return t.addAll(e), t;
  }
  clone() {
    const e = new he(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function t(r, u) {
      let a, f;
      do {
        if (a = r.left, f = r.right, a != null) {
          const E = new ue(a.key);
          u.left = E, t(a, E);
        }
        if (f != null) {
          const E = new ue(f.key);
          u.right = E, r = f, u = E;
        }
      } while (f != null);
    }
    const n = new ue(e.key);
    return t(e, n), n;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new lt(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new ot(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, Qe = class {
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
}, ot = class extends Qe {
  getValue(i) {
    return i.key;
  }
}, lt = class extends Qe {
  getValue(i) {
    return [i.key, i.key];
  }
}, et = (i) => () => i, Ie = (i) => {
  const e = i ? (t, n) => n.minus(t).abs().isLessThanOrEqualTo(i) : et(!1);
  return (t, n) => e(t, n) ? 0 : t.comparedTo(n);
};
function ut(i) {
  const e = i ? (t, n, r, u, a) => t.exponentiatedBy(2).isLessThanOrEqualTo(
    u.minus(n).exponentiatedBy(2).plus(a.minus(r).exponentiatedBy(2)).times(i)
  ) : et(!1);
  return (t, n, r) => {
    const u = t.x, a = t.y, f = r.x, E = r.y, p = a.minus(E).times(n.x.minus(f)).minus(u.minus(f).times(n.y.minus(E)));
    return e(p, u, a, f, E) ? 0 : p.comparedTo(0);
  };
}
var ft = (i) => i, ht = (i) => {
  if (i) {
    const e = new xe(Ie(i)), t = new xe(Ie(i)), n = (u, a) => a.addAndReturn(u), r = (u) => ({
      x: n(u.x, e),
      y: n(u.y, t)
    });
    return r({ x: new te(0), y: new te(0) }), r;
  }
  return ft;
}, Ne = (i) => ({
  set: (e) => {
    re = Ne(e);
  },
  reset: () => Ne(i),
  compare: Ie(i),
  snap: ht(i),
  orient: ut(i)
}), re = Ne(), fe = (i, e) => i.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(i.ur.x) && i.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(i.ur.y), Ce = (i, e) => {
  if (e.ur.x.isLessThan(i.ll.x) || i.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(i.ll.y) || i.ur.y.isLessThan(e.ll.y))
    return null;
  const t = i.ll.x.isLessThan(e.ll.x) ? e.ll.x : i.ll.x, n = i.ur.x.isLessThan(e.ur.x) ? i.ur.x : e.ur.x, r = i.ll.y.isLessThan(e.ll.y) ? e.ll.y : i.ll.y, u = i.ur.y.isLessThan(e.ur.y) ? i.ur.y : e.ur.y;
  return { ll: { x: t, y: r }, ur: { x: n, y: u } };
}, de = (i, e) => i.x.times(e.y).minus(i.y.times(e.x)), tt = (i, e) => i.x.times(e.x).plus(i.y.times(e.y)), we = (i) => tt(i, i).sqrt(), at = (i, e, t) => {
  const n = { x: e.x.minus(i.x), y: e.y.minus(i.y) }, r = { x: t.x.minus(i.x), y: t.y.minus(i.y) };
  return de(r, n).div(we(r)).div(we(n));
}, ct = (i, e, t) => {
  const n = { x: e.x.minus(i.x), y: e.y.minus(i.y) }, r = { x: t.x.minus(i.x), y: t.y.minus(i.y) };
  return tt(r, n).div(we(r)).div(we(n));
}, Fe = (i, e, t) => e.y.isZero() ? null : { x: i.x.plus(e.x.div(e.y).times(t.minus(i.y))), y: t }, De = (i, e, t) => e.x.isZero() ? null : { x: t, y: i.y.plus(e.y.div(e.x).times(t.minus(i.x))) }, pt = (i, e, t, n) => {
  if (e.x.isZero()) return De(t, n, i.x);
  if (n.x.isZero()) return De(i, e, t.x);
  if (e.y.isZero()) return Fe(t, n, i.y);
  if (n.y.isZero()) return Fe(i, e, t.y);
  const r = de(e, n);
  if (r.isZero()) return null;
  const u = { x: t.x.minus(i.x), y: t.y.minus(i.y) }, a = de(u, e).div(r), f = de(u, n).div(r), E = i.x.plus(f.times(e.x)), p = t.x.plus(a.times(n.x)), _ = i.y.plus(f.times(e.y)), b = t.y.plus(a.times(n.y)), T = E.plus(p).div(2), A = _.plus(b).div(2);
  return { x: T, y: A };
}, ee = class it {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, t) {
    const n = it.comparePoints(e.point, t.point);
    return n !== 0 ? n : (e.point !== t.point && e.link(t), e.isLeft !== t.isLeft ? e.isLeft ? 1 : -1 : Ee.compare(e.segment, t.segment));
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
      const u = t[n];
      this.point.events.push(u), u.point = this.point;
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
          const u = this.point.events[r];
          u.consumedBy === void 0 && n.otherSE.point.events === u.otherSE.point.events && n.segment.consume(u.segment);
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
      const u = r.otherSE;
      t.set(r, {
        sine: at(this.point, e.point, u.point),
        cosine: ct(this.point, e.point, u.point)
      });
    };
    return (r, u) => {
      t.has(r) || n(r), t.has(u) || n(u);
      const { sine: a, cosine: f } = t.get(r), { sine: E, cosine: p } = t.get(u);
      return a.isGreaterThanOrEqualTo(0) && E.isGreaterThanOrEqualTo(0) ? f.isLessThan(p) ? 1 : f.isGreaterThan(p) ? -1 : 0 : a.isLessThan(0) && E.isLessThan(0) ? f.isLessThan(p) ? -1 : f.isGreaterThan(p) ? 1 : 0 : E.isLessThan(a) ? -1 : E.isGreaterThan(a) ? 1 : 0;
    };
  }
}, gt = class Be {
  events;
  poly;
  _isExteriorRing;
  _enclosingRing;
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory(e) {
    const t = [];
    for (let n = 0, r = e.length; n < r; n++) {
      const u = e[n];
      if (!u.isInResult() || u.ringOut) continue;
      let a = null, f = u.leftSE, E = u.rightSE;
      const p = [f], _ = f.point, b = [];
      for (; a = f, f = E, p.push(f), f.point !== _; )
        for (; ; ) {
          const T = f.getAvailableLinkedEvents();
          if (T.length === 0) {
            const P = p[0].point, B = p[p.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${P.x}, \${P.y}]. Last matching segment found ends at [\${B.x}, \${B.y}].\`
            );
          }
          if (T.length === 1) {
            E = T[0].otherSE;
            break;
          }
          let A = null;
          for (let P = 0, B = b.length; P < B; P++)
            if (b[P].point === f.point) {
              A = P;
              break;
            }
          if (A !== null) {
            const P = b.splice(A)[0], B = p.splice(P.index);
            B.unshift(B[0].otherSE), t.push(new Be(B.reverse()));
            continue;
          }
          b.push({
            index: p.length,
            point: f.point
          });
          const N = f.getLeftmostComparator(a);
          E = T.sort(N)[0].otherSE;
          break;
        }
      t.push(new Be(p));
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
    for (let p = 1, _ = this.events.length - 1; p < _; p++) {
      const b = this.events[p].point, T = this.events[p + 1].point;
      re.orient(b, e, T) !== 0 && (t.push(b), e = b);
    }
    if (t.length === 1) return null;
    const n = t[0], r = t[1];
    re.orient(n, e, r) === 0 && t.shift(), t.push(t[0]);
    const u = this.isExteriorRing() ? 1 : -1, a = this.isExteriorRing() ? 0 : t.length - 1, f = this.isExteriorRing() ? t.length : -1, E = [];
    for (let p = a; p != f; p += u)
      E.push([t[p].x.toNumber(), t[p].y.toNumber()]);
    return E;
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
    for (let r = 1, u = this.events.length; r < u; r++) {
      const a = this.events[r];
      ee.compare(e, a) > 0 && (e = a);
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
}, Ue = class {
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
}, yt = class {
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
        if (r.isExteriorRing()) e.push(new Ue(r));
        else {
          const u = r.enclosingRing();
          u?.poly || e.push(new Ue(u)), u?.poly?.addInterior(r);
        }
    }
    return e;
  }
}, dt = class {
  queue;
  tree;
  segments;
  constructor(i, e = Ee.compare) {
    this.queue = i, this.tree = new xe(e), this.segments = [];
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
      let u = null;
      if (n) {
        const f = n.getIntersection(e);
        if (f !== null && (e.isAnEndpoint(f) || (u = f), !n.isAnEndpoint(f))) {
          const E = this._splitSafely(n, f);
          for (let p = 0, _ = E.length; p < _; p++)
            t.push(E[p]);
        }
      }
      let a = null;
      if (r) {
        const f = r.getIntersection(e);
        if (f !== null && (e.isAnEndpoint(f) || (a = f), !r.isAnEndpoint(f))) {
          const E = this._splitSafely(r, f);
          for (let p = 0, _ = E.length; p < _; p++)
            t.push(E[p]);
        }
      }
      if (u !== null || a !== null) {
        let f = null;
        u === null ? f = a : a === null ? f = u : f = ee.comparePoints(
          u,
          a
        ) <= 0 ? u : a, this.queue.delete(e.rightSE), t.push(e.rightSE);
        const E = e.split(f);
        for (let p = 0, _ = E.length; p < _; p++)
          t.push(E[p]);
      }
      t.length > 0 ? (this.tree.delete(e), t.push(i)) : (this.segments.push(e), e.prev = n);
    } else {
      if (n && r) {
        const u = n.getIntersection(r);
        if (u !== null) {
          if (!n.isAnEndpoint(u)) {
            const a = this._splitSafely(n, u);
            for (let f = 0, E = a.length; f < E; f++)
              t.push(a[f]);
          }
          if (!r.isAnEndpoint(u)) {
            const a = this._splitSafely(r, u);
            for (let f = 0, E = a.length; f < E; f++)
              t.push(a[f]);
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
}, mt = class {
  type;
  numMultiPolys;
  run(i, e, t) {
    ae.type = i;
    const n = [new $e(e, !0)];
    for (let p = 0, _ = t.length; p < _; p++)
      n.push(new $e(t[p], !1));
    if (ae.numMultiPolys = n.length, ae.type === "difference") {
      const p = n[0];
      let _ = 1;
      for (; _ < n.length; )
        Ce(n[_].bbox, p.bbox) !== null ? _++ : n.splice(_, 1);
    }
    if (ae.type === "intersection")
      for (let p = 0, _ = n.length; p < _; p++) {
        const b = n[p];
        for (let T = p + 1, A = n.length; T < A; T++)
          if (Ce(b.bbox, n[T].bbox) === null) return [];
      }
    const r = new xe(ee.compare);
    for (let p = 0, _ = n.length; p < _; p++) {
      const b = n[p].getSweepEvents();
      for (let T = 0, A = b.length; T < A; T++)
        r.add(b[T]);
    }
    const u = new dt(r);
    let a = null;
    for (r.size != 0 && (a = r.first(), r.delete(a)); a; ) {
      const p = u.process(a);
      for (let _ = 0, b = p.length; _ < b; _++) {
        const T = p[_];
        T.consumedBy === void 0 && r.add(T);
      }
      r.size != 0 ? (a = r.first(), r.delete(a)) : a = null;
    }
    re.reset();
    const f = gt.factory(u.segments);
    return new yt(f).getGeom();
  }
}, ae = new mt(), ke = ae, xt = 0, Ee = class me {
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
    const n = e.leftSE.point.x, r = t.leftSE.point.x, u = e.rightSE.point.x, a = t.rightSE.point.x;
    if (a.isLessThan(n)) return 1;
    if (u.isLessThan(r)) return -1;
    const f = e.leftSE.point.y, E = t.leftSE.point.y, p = e.rightSE.point.y, _ = t.rightSE.point.y;
    if (n.isLessThan(r)) {
      if (E.isLessThan(f) && E.isLessThan(p)) return 1;
      if (E.isGreaterThan(f) && E.isGreaterThan(p)) return -1;
      const b = e.comparePoint(t.leftSE.point);
      if (b < 0) return 1;
      if (b > 0) return -1;
      const T = t.comparePoint(e.rightSE.point);
      return T !== 0 ? T : -1;
    }
    if (n.isGreaterThan(r)) {
      if (f.isLessThan(E) && f.isLessThan(_)) return -1;
      if (f.isGreaterThan(E) && f.isGreaterThan(_)) return 1;
      const b = t.comparePoint(e.leftSE.point);
      if (b !== 0) return b;
      const T = e.comparePoint(t.rightSE.point);
      return T < 0 ? 1 : T > 0 ? -1 : 1;
    }
    if (f.isLessThan(E)) return -1;
    if (f.isGreaterThan(E)) return 1;
    if (u.isLessThan(a)) {
      const b = t.comparePoint(e.rightSE.point);
      if (b !== 0) return b;
    }
    if (u.isGreaterThan(a)) {
      const b = e.comparePoint(t.rightSE.point);
      if (b < 0) return 1;
      if (b > 0) return -1;
    }
    if (!u.eq(a)) {
      const b = p.minus(f), T = u.minus(n), A = _.minus(E), N = a.minus(r);
      if (b.isGreaterThan(T) && A.isLessThan(N)) return 1;
      if (b.isLessThan(T) && A.isGreaterThan(N)) return -1;
    }
    return u.isGreaterThan(a) ? 1 : u.isLessThan(a) || p.isLessThan(_) ? -1 : p.isGreaterThan(_) ? 1 : e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, t, n, r) {
    this.id = ++xt, this.leftSE = e, e.segment = this, e.otherSE = t, this.rightSE = t, t.segment = this, t.otherSE = e, this.rings = n, this.windings = r;
  }
  static fromRing(e, t, n) {
    let r, u, a;
    const f = ee.comparePoints(e, t);
    if (f < 0)
      r = e, u = t, a = 1;
    else if (f > 0)
      r = t, u = e, a = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const E = new ee(r, !0), p = new ee(u, !1);
    return new me(E, p, [n], [a]);
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
    return re.orient(this.leftSE.point, e, this.rightSE.point);
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
    const t = this.bbox(), n = e.bbox(), r = Ce(t, n);
    if (r === null) return null;
    const u = this.leftSE.point, a = this.rightSE.point, f = e.leftSE.point, E = e.rightSE.point, p = fe(t, f) && this.comparePoint(f) === 0, _ = fe(n, u) && e.comparePoint(u) === 0, b = fe(t, E) && this.comparePoint(E) === 0, T = fe(n, a) && e.comparePoint(a) === 0;
    if (_ && p)
      return T && !b ? a : !T && b ? E : null;
    if (_)
      return b && u.x.eq(E.x) && u.y.eq(E.y) ? null : u;
    if (p)
      return T && a.x.eq(f.x) && a.y.eq(f.y) ? null : f;
    if (T && b) return null;
    if (T) return a;
    if (b) return E;
    const A = pt(u, this.vector(), f, e.vector());
    return A === null || !fe(r, A) ? null : re.snap(A);
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
    const t = [], n = e.events !== void 0, r = new ee(e, !0), u = new ee(e, !1), a = this.rightSE;
    this.replaceRightSE(u), t.push(u), t.push(r);
    const f = new me(
      r,
      a,
      this.rings.slice(),
      this.windings.slice()
    );
    return ee.comparePoints(f.leftSE.point, f.rightSE.point) > 0 && f.swapEvents(), ee.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), n && (r.checkForConsuming(), u.checkForConsuming()), t;
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
    const r = me.compare(t, n);
    if (r !== 0) {
      if (r > 0) {
        const u = t;
        t = n, n = u;
      }
      if (t.prev === n) {
        const u = t;
        t = n, n = u;
      }
      for (let u = 0, a = n.rings.length; u < a; u++) {
        const f = n.rings[u], E = n.windings[u], p = t.rings.indexOf(f);
        p === -1 ? (t.rings.push(f), t.windings.push(E)) : t.windings[p] += E;
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
    for (let f = 0, E = this.rings.length; f < E; f++) {
      const p = this.rings[f], _ = this.windings[f], b = t.indexOf(p);
      b === -1 ? (t.push(p), n.push(_)) : n[b] += _;
    }
    const u = [], a = [];
    for (let f = 0, E = t.length; f < E; f++) {
      if (n[f] === 0) continue;
      const p = t[f], _ = p.poly;
      if (a.indexOf(_) === -1)
        if (p.isExterior) u.push(_);
        else {
          a.indexOf(_) === -1 && a.push(_);
          const b = u.indexOf(p.poly);
          b !== -1 && u.splice(b, 1);
        }
    }
    for (let f = 0, E = u.length; f < E; f++) {
      const p = u[f].multiPoly;
      r.indexOf(p) === -1 && r.push(p);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const e = this.beforeState().multiPolys, t = this.afterState().multiPolys;
    switch (ke.type) {
      case "union": {
        const n = e.length === 0, r = t.length === 0;
        this._isInResult = n !== r;
        break;
      }
      case "intersection": {
        let n, r;
        e.length < t.length ? (n = e.length, r = t.length) : (n = t.length, r = e.length), this._isInResult = r === ke.numMultiPolys && n < r;
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
}, ze = class {
  poly;
  isExterior;
  segments;
  bbox;
  constructor(i, e, t) {
    if (!Array.isArray(i) || i.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (this.poly = e, this.isExterior = t, this.segments = [], typeof i[0][0] != "number" || typeof i[0][1] != "number")
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const n = re.snap({ x: new te(i[0][0]), y: new te(i[0][1]) });
    this.bbox = {
      ll: { x: n.x, y: n.y },
      ur: { x: n.x, y: n.y }
    };
    let r = n;
    for (let u = 1, a = i.length; u < a; u++) {
      if (typeof i[u][0] != "number" || typeof i[u][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const f = re.snap({ x: new te(i[u][0]), y: new te(i[u][1]) });
      f.x.eq(r.x) && f.y.eq(r.y) || (this.segments.push(Ee.fromRing(r, f, this)), f.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = f.x), f.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = f.y), f.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = f.x), f.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = f.y), r = f);
    }
    (!n.x.eq(r.x) || !n.y.eq(r.y)) && this.segments.push(Ee.fromRing(r, n, this));
  }
  getSweepEvents() {
    const i = [];
    for (let e = 0, t = this.segments.length; e < t; e++) {
      const n = this.segments[e];
      i.push(n.leftSE), i.push(n.rightSE);
    }
    return i;
  }
}, wt = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(i, e) {
    if (!Array.isArray(i))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new ze(i[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let t = 1, n = i.length; t < n; t++) {
      const r = new ze(i[t], this, !1);
      r.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = r.bbox.ll.x), r.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = r.bbox.ll.y), r.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = r.bbox.ur.x), r.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = r.bbox.ur.y), this.interiorRings.push(r);
    }
    this.multiPoly = e;
  }
  getSweepEvents() {
    const i = this.exteriorRing.getSweepEvents();
    for (let e = 0, t = this.interiorRings.length; e < t; e++) {
      const n = this.interiorRings[e].getSweepEvents();
      for (let r = 0, u = n.length; r < u; r++)
        i.push(n[r]);
    }
    return i;
  }
}, $e = class {
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
      const r = new wt(i[t], this);
      r.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = r.bbox.ll.x), r.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = r.bbox.ll.y), r.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = r.bbox.ur.x), r.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = r.bbox.ur.y), this.polys.push(r);
    }
    this.isSubject = e;
  }
  getSweepEvents() {
    const i = [];
    for (let e = 0, t = this.polys.length; e < t; e++) {
      const n = this.polys[e].getSweepEvents();
      for (let r = 0, u = n.length; r < u; r++)
        i.push(n[r]);
    }
    return i;
  }
}, Et = (i, ...e) => ke.run("union", i, e);
re.set;
var Ve = 63710088e-1;
function ve(i, e, t = {}) {
  const n = { type: "Feature" };
  return (t.id === 0 || t.id) && (n.id = t.id), t.bbox && (n.bbox = t.bbox), n.properties = e || {}, n.geometry = i, n;
}
function vt(i, e, t = {}) {
  for (const r of i) {
    if (r.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (r[r.length - 1].length !== r[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let u = 0; u < r[r.length - 1].length; u++)
      if (r[r.length - 1][u] !== r[0][u])
        throw new Error("First and last Position are not equivalent.");
  }
  return ve({
    type: "Polygon",
    coordinates: i
  }, e, t);
}
function St(i, e = {}) {
  const t = { type: "FeatureCollection" };
  return e.id && (t.id = e.id), e.bbox && (t.bbox = e.bbox), t.features = i, t;
}
function Tt(i, e, t = {}) {
  return ve({
    type: "MultiPolygon",
    coordinates: i
  }, e, t);
}
function Ge(i, e) {
  var t, n, r, u, a, f, E, p, _, b, T = 0, A = i.type === "FeatureCollection", N = i.type === "Feature", P = A ? i.features.length : 1;
  for (t = 0; t < P; t++) {
    for (f = A ? (
      // @ts-expect-error: Known type conflict
      i.features[t].geometry
    ) : N ? (
      // @ts-expect-error: Known type conflict
      i.geometry
    ) : i, p = A ? (
      // @ts-expect-error: Known type conflict
      i.features[t].properties
    ) : N ? (
      // @ts-expect-error: Known type conflict
      i.properties
    ) : {}, _ = A ? (
      // @ts-expect-error: Known type conflict
      i.features[t].bbox
    ) : N ? (
      // @ts-expect-error: Known type conflict
      i.bbox
    ) : void 0, b = A ? (
      // @ts-expect-error: Known type conflict
      i.features[t].id
    ) : N ? (
      // @ts-expect-error: Known type conflict
      i.id
    ) : void 0, E = f ? f.type === "GeometryCollection" : !1, a = E ? f.geometries.length : 1, r = 0; r < a; r++) {
      if (u = E ? f.geometries[r] : f, u === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            T,
            p,
            _,
            b
          ) === !1
        )
          return !1;
        continue;
      }
      switch (u.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            // @ts-expect-error: Known type conflict
            e(
              u,
              T,
              p,
              _,
              b
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (n = 0; n < u.geometries.length; n++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                u.geometries[n],
                T,
                p,
                _,
                b
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    T++;
  }
}
function bt(i, e, t) {
  var n = t;
  return Ge(
    i,
    function(r, u, a, f, E) {
      n = e(
        // @ts-expect-error: Known type conflict
        n,
        r,
        u,
        a,
        f,
        E
      );
    }
  ), n;
}
function _t(i, e) {
  Ge(i, function(t, n, r, u, a) {
    var f = t === null ? null : t.type;
    switch (f) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            ve(t, r, { bbox: u, id: a }),
            n,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var E;
    switch (f) {
      case "MultiPoint":
        E = "Point";
        break;
      case "MultiLineString":
        E = "LineString";
        break;
      case "MultiPolygon":
        E = "Polygon";
        break;
    }
    for (
      var p = 0;
      // @ts-expect-error: Known type conflict
      p < t.coordinates.length;
      p++
    ) {
      var _ = t.coordinates[p], b = {
        type: E,
        coordinates: _
      };
      if (
        // @ts-expect-error: Known type conflict
        e(ve(b, r), n, p) === !1
      )
        return !1;
    }
  });
}
function Rt(i, e = {}) {
  const t = [];
  if (Ge(i, (r) => {
    t.push(r.coordinates);
  }), t.length < 2)
    throw new Error("Must have at least 2 geometries");
  const n = Et(t[0], ...t.slice(1));
  return n.length === 0 ? null : n.length === 1 ? vt(n[0], e.properties) : Tt(n, e.properties);
}
function Ke(i) {
  if (!i) throw new Error("geojson is required");
  var e = [];
  return _t(i, function(t) {
    e.push(t);
  }), St(e);
}
const Mt = typeof TextEncoder < "u", Ot = typeof TextDecoder < "u", Xe = Mt ? new TextEncoder() : null, Ye = Ot ? new TextDecoder() : null, Pt = (i) => {
  if (i instanceof Uint8Array) return i;
  if (ArrayBuffer.isView(i)) return new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  if (i instanceof ArrayBuffer) return new Uint8Array(i);
  const e = JSON.stringify(i);
  if (Xe) return Xe.encode(e);
  if (typeof Buffer < "u" && typeof Buffer.from == "function") return new Uint8Array(Buffer.from(e));
  throw new Error("No TextEncoder available to encode object");
}, At = (i) => {
  let e;
  if (i instanceof Uint8Array) e = i;
  else if (ArrayBuffer.isView(i)) e = new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  else if (i instanceof ArrayBuffer) e = new Uint8Array(i);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(i)) e = new Uint8Array(i);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  return Ye ? JSON.parse(Ye.decode(e)) : typeof Buffer < "u" && typeof Buffer.from == "function" ? JSON.parse(Buffer.from(e).toString("utf8")) : JSON.parse(new TextDecoder().decode(e));
};
class Lt {
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
      const u = e - 1 >> 1, a = t[u];
      if (n(r, a) >= 0) break;
      t[e] = a, e = u;
    }
    t[e] = r;
  }
  _down(e) {
    const { data: t, compare: n } = this, r = this.length >> 1, u = t[e];
    for (; e < r; ) {
      let a = (e << 1) + 1;
      const f = a + 1;
      if (f < this.length && n(t[f], t[a]) < 0 && (a = f), n(t[a], u) >= 0) break;
      t[e] = t[a], e = a;
    }
    t[e] = u;
  }
}
function It(i, e = 1, t = !1) {
  let n = 1 / 0, r = 1 / 0, u = -1 / 0, a = -1 / 0;
  for (const [k, S] of i[0])
    k < n && (n = k), S < r && (r = S), k > u && (u = k), S > a && (a = S);
  const f = u - n, E = a - r, p = Math.max(e, Math.min(f, E));
  if (p === e) {
    const k = [n, r];
    return k.distance = 0, k;
  }
  const _ = new Lt([], (k, S) => S.max - k.max);
  let b = Ct(i);
  const T = new Se(n + f / 2, r + E / 2, 0, i);
  T.d > b.d && (b = T);
  let A = 2;
  function N(k, S, j) {
    const J = new Se(k, S, j, i);
    A++, J.max > b.d + e && _.push(J), J.d > b.d && (b = J, t && console.log(\`found best \${Math.round(1e4 * J.d) / 1e4} after \${A} probes\`));
  }
  let P = p / 2;
  for (let k = n; k < u; k += p)
    for (let S = r; S < a; S += p)
      N(k + P, S + P, P);
  for (; _.length; ) {
    const { max: k, x: S, y: j, h: J } = _.pop();
    if (k - b.d <= e) break;
    P = J / 2, N(S - P, j - P, P), N(S + P, j - P, P), N(S - P, j + P, P), N(S + P, j + P, P);
  }
  t && console.log(\`num probes: \${A}
best distance: \${b.d}\`);
  const B = [b.x, b.y];
  return B.distance = b.d, B;
}
function Se(i, e, t, n) {
  this.x = i, this.y = e, this.h = t, this.d = Nt(i, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function Nt(i, e, t) {
  let n = !1, r = 1 / 0;
  for (const u of t)
    for (let a = 0, f = u.length, E = f - 1; a < f; E = a++) {
      const p = u[a], _ = u[E];
      p[1] > e != _[1] > e && i < (_[0] - p[0]) * (e - p[1]) / (_[1] - p[1]) + p[0] && (n = !n), r = Math.min(r, Bt(i, e, p, _));
    }
  return r === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(r);
}
function Ct(i) {
  let e = 0, t = 0, n = 0;
  const r = i[0];
  for (let a = 0, f = r.length, E = f - 1; a < f; E = a++) {
    const p = r[a], _ = r[E], b = p[0] * _[1] - _[0] * p[1];
    t += (p[0] + _[0]) * b, n += (p[1] + _[1]) * b, e += b * 3;
  }
  const u = new Se(t / e, n / e, 0, i);
  return e === 0 || u.d < 0 ? new Se(r[0][0], r[0][1], 0, i) : u;
}
function Bt(i, e, t, n) {
  let r = t[0], u = t[1], a = n[0] - r, f = n[1] - u;
  if (a !== 0 || f !== 0) {
    const E = ((i - r) * a + (e - u) * f) / (a * a + f * f);
    E > 1 ? (r = n[0], u = n[1]) : E > 0 && (r += a * E, u += f * E);
  }
  return a = i - r, f = e - u, a * a + f * f;
}
function He(i) {
  return bt(
    i,
    (e, t) => e + kt(t),
    0
  );
}
function kt(i) {
  let e = 0, t;
  switch (i.type) {
    case "Polygon":
      return We(i.coordinates);
    case "MultiPolygon":
      for (t = 0; t < i.coordinates.length; t++)
        e += We(i.coordinates[t]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function We(i) {
  let e = 0;
  if (i && i.length > 0) {
    e += Math.abs(Ze(i[0]));
    for (let t = 1; t < i.length; t++)
      e -= Math.abs(Ze(i[t]));
  }
  return e;
}
var Gt = Ve * Ve / 2, Pe = Math.PI / 180;
function Ze(i) {
  const e = i.length - 1;
  if (e <= 2) return 0;
  let t = 0, n = 0;
  for (; n < e; ) {
    const r = i[n], u = i[n + 1 === e ? 0 : n + 1], a = i[n + 2 >= e ? (n + 2) % e : n + 2], f = r[0] * Pe, E = u[1] * Pe, p = a[0] * Pe;
    t += (p - f) * Math.sin(E), n++;
  }
  return t * Gt;
}
const Ae = /* @__PURE__ */ new WeakMap(), je = /* @__PURE__ */ new WeakMap(), qt = (i, e) => {
  try {
    if (i.geometry.type !== "Polygon")
      throw new Error("Non-Polygon geometry");
    if (i && typeof i == "object") {
      let u = Ae.get(i);
      const a = e === void 0 ? "__default" : String(e);
      if (u && u.has(a))
        return u.get(a);
    }
    const t = i && i.geometry && i.geometry.coordinates;
    let n = It(t, e);
    if (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1]))
      throw new Error("Invalid polylabel result");
    const r = {
      type: "Point",
      coordinates: [n[0], n[1]]
    };
    if (i && typeof i == "object") {
      let u = Ae.get(i);
      u || (u = /* @__PURE__ */ new Map(), Ae.set(i, u)), u.set(e === void 0 ? "__default" : String(e), r);
    }
    return r;
  } catch {
    return console.log("Invalid feature geometry", i && i.id), pointOnFeature(i).geometry;
  }
}, ye = (i) => {
  if (!i) return 0;
  let e = 0;
  for (let t = 0; t < i.length; t++) {
    const n = (t + 1) % i.length;
    e += i[t][0] * i[n][1], e -= i[n][0] * i[t][1];
  }
  return Math.abs(e) / 2;
}, Ft = (i, e) => {
  try {
    if (i && typeof i == "object") {
      let t = je.get(i);
      const n = e === "meters" ? "meters" : e || "__planar";
      if (t && t.has(n))
        return t.get(n);
      let r;
      if (e === "meters")
        r = He(i);
      else {
        const u = i && i.geometry;
        if (!u || u.type !== "Polygon")
          r = 0;
        else {
          const a = u && u.coordinates;
          let f = ye(a[0]);
          for (let E = 1; E < a.length; E++)
            f -= ye(a[E]);
          r = f;
        }
      }
      return t || (t = /* @__PURE__ */ new Map(), je.set(i, t)), t.set(n, r), r;
    } else {
      if (e === "meters")
        return He(i);
      {
        const t = i && i.geometry;
        if (!t || t.type !== "Polygon") return 0;
        const n = t && t.coordinates;
        let r = ye(n[0]);
        for (let u = 1; u < n.length; u++)
          r -= ye(n[u]);
        return r;
      }
    }
  } catch (t) {
    return console.log("Error computing area for feature", i && i.id, t), 0;
  }
}, Le = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
Le.onmessage = (i) => {
  const e = i.data, t = At(e), n = Object.values(t.pieces), r = t.tolerance || 1e-5, u = t.unit || "meters";
  t.tileSize;
  const a = /* @__PURE__ */ new Map();
  n.forEach((f) => {
    for (const [E, p] of Object.entries(f)) {
      const _ = a.get(E) || [];
      _.push(p), a.set(E, _);
    }
  });
  for (const [f, E] of a.entries()) {
    if (f === "size") continue;
    let p = {
      type: "FeatureCollection",
      features: E.reduce((T, A) => [...T, ...A.features], []).filter((T) => T.geometry.type === "Polygon")
    };
    if (p.features.some((T) => T.geometry.type === "MultiPolygon") && (p = Ke(p)), p.features.some((T) => T.properties.clipped) && p.features.length > 1) {
      let T = {
        type: "FeatureCollection",
        features: p.features.filter((N) => N.properties.clipped)
      };
      const A = p.features.filter((N) => !N.properties.clipped);
      if (T.features.length > 1) {
        const { clipped: N, ...P } = p.features[0].properties;
        P._index = T.features.map((B) => B.properties._index).sort().join("-"), T = Rt(T), T = {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: T.geometry,
            properties: P
          }]
        };
      }
      p = {
        type: "FeatureCollection",
        features: [...A, ...T.features]
      };
    }
    p.features.some((T) => T.geometry.type === "MultiPolygon") && (p = Ke(p)), p.features = p.features.map((T, A) => {
      const N = \`\${f}-\${A}\`, P = T.geometry, B = T.properties;
      if (P && P.type === "Polygon") {
        const k = Ft(T, u);
        T.geometry = qt(T, r), T.properties = { ...B, _area: k, _groupId: f };
      } else
        console.log("Unexpected geometry type after union/simplify/flatten for id:" + f + " - type:" + (P && P.type)), T.properties = { ...B, _area: 0, _groupId: f };
      return T.id = N, T;
    });
    const _ = Math.max(...p.features.map((T) => T.properties && T.properties._area || 0));
    p.features = p.features.map((T) => (T.properties && T.properties._area != null && T.properties._area > 0 ? (T.properties._localSortKey = _ / T.properties._area, T.properties._globalSortKey = 1 / T.properties._area) : (T.properties._localSortKey = 1 / 0, T.properties._globalSortKey = 1 / 0), T)), p.id = f;
    const b = Pt(p).buffer;
    Le.postMessage(b, [b]);
  }
  Le.postMessage({ type: "commit" });
};
`,S=typeof self<"u"&&self.Blob&&new Blob(["URL.revokeObjectURL(import.meta.url);",_],{type:"text/javascript;charset=utf-8"});function O(u){let n;try{if(n=S&&(self.URL||self.webkitURL).createObjectURL(S),!n)throw"";const e=new Worker(n,{type:"module",name:u?.name});return e.addEventListener("error",()=>{(self.URL||self.webkitURL).revokeObjectURL(n)}),e}catch{return new Worker("data:text/javascript;charset=utf-8,"+encodeURIComponent(_),{type:"module",name:u?.name})}}class T{constructor(n,e={}){const t=typeof navigator<"u"&&navigator.hardwareConcurrency||2,{size:r=Math.min(t,2),minSize:i=1,maxSize:l=Math.max(r,t),workerOptions:p={},maxTasksPerWorker:a=1/0,idleTimeout:h=6e4,taskQueue:s=!0}=e;this._workerSource=n,this._workerOptions=p,this._maxTasksPerWorker=a,this.minSize=Math.max(0,i),this.maxSize=Math.max(this.minSize,l),this.idleTimeout=Math.max(0,h),this.taskQueueEnabled=!!s,this.workers=[],this.queue=[],this._listeners={message:new Set,error:new Set,messageerror:new Set,idle:new Set},this._onmessage=null,this._onerror=null,this._onidle=null,this._nextIndex=0,this._isIdle=!0;const o=Math.min(Math.max(r,this.minSize),this.maxSize);for(let g=0;g<o;g++)this._addWorkerInstance(g);this._reaperInterval=setInterval(()=>this._reapIdleWorkers(),Math.max(1e3,Math.floor(this.idleTimeout/2)))}_createWorkerInstance(){if(typeof this._workerSource=="function")return new this._workerSource;if(typeof this._workerSource=="string")return new Worker(new URL(this._workerSource,typeof document>"u"&&typeof location>"u"?require("url").pathToFileURL(__filename).href:typeof document>"u"?location.href:x&&x.tagName.toUpperCase()==="SCRIPT"&&x.src||new URL("maplibre-properlabels.js",document.baseURI).href),this._workerOptions);throw new Error("Invalid workerSource: expected Worker factory or relative path string")}_addWorkerInstance(n){const e=this._createWorkerInstance(),t={id:n,worker:e,tasks:0,lastActive:Date.now()};return this.workers.push(t),e.onmessage=r=>{if(t.tasks=Math.max(0,t.tasks-1),t.lastActive=Date.now(),this.queue.length>0&&t.tasks<this._maxTasksPerWorker){const i=this.queue.shift();try{i.transfer?e.postMessage(i.message,i.transfer):e.postMessage(i.message),t.tasks++}catch(l){console.error("Failed to dispatch queued message to worker",l)}}if(this._onmessage)try{this._onmessage(r)}catch(i){console.error("Pool onmessage handler error",i)}for(const i of this._listeners.message)try{i(r)}catch(l){console.error("pool listener error",l)}this._updateIdleState()},e.onerror=r=>{if(this._onerror)try{this._onerror(r)}catch(i){console.error("Pool onerror handler error",i)}for(const i of this._listeners.error)try{i(r)}catch(l){console.error("pool error listener error",l)}},e.onmessageerror=r=>{for(const i of this._listeners.messageerror)try{i(r)}catch(l){console.error("pool messageerror listener error",l)}},t}_findLeastLoadedWorker(){if(!this.workers.length)return null;let n=this.workers[0];for(let e=1;e<this.workers.length;e++)this.workers[e].tasks<n.tasks&&(n=this.workers[e]);return n}postMessage(n,e){const t=this._findLeastLoadedWorker();if(t&&t.tasks<this._maxTasksPerWorker)try{return e?t.worker.postMessage(n,e):t.worker.postMessage(n),t.tasks++,t.lastActive=Date.now(),this._updateIdleState(),!0}catch(i){return console.error("Failed to postMessage to worker",i),!1}if(this.workers.length<this.maxSize){const i=this.workers.length,l=this._addWorkerInstance(i);try{return e?l.worker.postMessage(n,e):l.worker.postMessage(n),l.tasks++,l.lastActive=Date.now(),this._updateIdleState(),!0}catch(p){return console.error("Failed to postMessage to new worker",p),!1}}if(this.taskQueueEnabled)return this.queue.push({message:n,transfer:e}),this._updateIdleState(),!0;const r=this.workers[this._nextIndex%this.workers.length];this._nextIndex++;try{return e?r.worker.postMessage(n,e):r.worker.postMessage(n),r.tasks++,r.lastActive=Date.now(),this._updateIdleState(),!0}catch(i){return console.error("Failed to postMessage to fallback worker",i),!1}}broadcast(n,e){for(const t of this.workers)try{e?t.worker.postMessage(n,e):t.worker.postMessage(n),t.tasks++,t.lastActive=Date.now()}catch(r){console.error("broadcast error",r)}this._updateIdleState()}addWorker(){return this._addWorkerInstance(this.workers.length)}removeWorker(){const n=this.workers.pop();if(n)try{n.worker.terminate()}catch{}}_reapIdleWorkers(){if(this.idleTimeout<=0)return;const n=Date.now();for(let e=this.workers.length-1;e>=0;e--){const t=this.workers[e];if(this.workers.length<=this.minSize)break;if(t.tasks===0&&n-(t.lastActive||0)>this.idleTimeout){try{t.worker.terminate()}catch{}this.workers.splice(e,1)}}this._updateIdleState()}_emitIdle(){const n={data:{type:"pool:idle",stats:this.getStats()}};if(this._isIdle=!0,this._onmessage)try{this._onmessage(n)}catch(e){console.error("Pool onmessage handler error",e)}if(this._onidle)try{this._onidle(n)}catch(e){console.error("Pool onidle handler error",e)}for(const e of this._listeners.message)try{e(n)}catch(t){console.error("pool listener error",t)}for(const e of this._listeners.idle)try{e(n)}catch(t){console.error("pool idle listener error",t)}}_updateIdleState(){const e=this.workers.length>0&&this.workers.every(i=>i.tasks===0),t=this.queue.length===0,r=e&&t;r&&!this._isIdle?this._emitIdle():!r&&this._isIdle&&(this._isIdle=!1)}terminate(){this._reaperInterval&&(clearInterval(this._reaperInterval),this._reaperInterval=null);for(const n of this.workers)try{n.worker.terminate()}catch{}this.workers=[],this.queue=[]}getStats(){return this.workers.map(n=>({id:n.id,tasks:n.tasks,lastActive:n.lastActive}))}addEventListener(n,e){if(n in this._listeners&&(this._listeners[n].add(e),n==="idle")){const r=this.workers.length>0&&this.workers.every(l=>l.tasks===0),i=this.queue.length===0;if(r&&i){const l={data:{type:"pool:idle",stats:this.getStats()}};try{e(l)}catch(p){console.error("pool idle listener error",p)}}}}removeEventListener(n,e){n in this._listeners&&this._listeners[n].delete(e)}get onmessage(){return this._onmessage}set onmessage(n){this._onmessage=n}get onerror(){return this._onerror}set onerror(n){this._onerror=n}get onidle(){return this._onidle}set onidle(n){if(this._onidle=n,typeof n=="function"){const t=this.workers.length>0&&this.workers.every(i=>i.tasks===0),r=this.queue.length===0;if(t&&r){const i={data:{type:"pool:idle",stats:this.getStats()}};try{n(i)}catch(l){console.error("Pool onidle handler error",l)}}}}}class k{constructor({maxEntries:n=1/0,maxWeight:e=1/0,weightFn:t=()=>1,defaultTTL:r=6e4,maxPoolSize:i=1e3,rejectOversized:l=!1,onEvict:p=null,onExpire:a=null,initialPoolSize:h=0,maxCleanupPerTick:s=100}={}){this.maxEntries=n,this.maxWeight=e,this.weightFn=t,this.defaultTTL=r,this.maxPoolSize=i,this.rejectOversized=!!l,this.onEvict=typeof p=="function"?p:null,this.onExpire=typeof a=="function"?a:null,this.maxCleanupPerTick=Number.isFinite(+s)?Math.max(1,+s):100,this.map=new Map,this.head=null,this.tail=null,this.pool=[];for(let o=0;o<Math.min(h||0,this.maxPoolSize);o++)this.pool.push({key:null,value:null,weight:0,expiresAt:0,prev:null,next:null});this.currentWeight=0,this.hits=0,this.misses=0,this.evictions=0,this.rejected=0,this._cleanupTimer=null,this._cleanupRunning=!1,this._cleanupParams=null,this._cleanupCursor=null}_allocNode(n,e,t,r){const i=this.pool.pop()||{key:null,value:null,weight:0,expiresAt:0,prev:null,next:null};return i.key=n,i.value=e,i.weight=t||0,i.expiresAt=r||0,i.prev=null,i.next=null,i}_freeNode(n){n.key=null,n.value=null,n.weight=0,n.expiresAt=0,n.prev=null,n.next=null,this.pool.length<this.maxPoolSize&&this.pool.push(n)}_append(n){if(!this.tail){this.head=this.tail=n;return}n.prev=this.tail,n.next=null,this.tail.next=n,this.tail=n}_remove(n){const e=n.prev,t=n.next;e?e.next=t:this.head=t,t?t.prev=e:this.tail=e,n.prev=n.next=null}_moveToTail(n){this.tail!==n&&(this._remove(n),this._append(n))}_popHead(){const n=this.head;return n?(this._remove(n),n):null}_evictIfNeeded(){for(;this.map.size>this.maxEntries||this.currentWeight>this.maxWeight;){const n=this.head;if(!n)break;const e=n.next,t=n.key,r=n.value;this._cleanupCursor===n&&(this._cleanupCursor=e||this.head),this._remove(n),this.map.delete(t),this.currentWeight-=n.weight||0,this.evictions++;try{this.onEvict&&this.onEvict(t,r,"evicted")}catch{}this._freeNode(n)}}set(n,e,{ttl:t=this.defaultTTL,weight:r=null}={}){const i=Date.now(),l=t==null||t===1/0?0:i+t,p=r??(this.weightFn(e)||0),a=Number.isFinite(+p)?Math.max(0,+p):0;if(this.rejectOversized&&Number.isFinite(this.maxWeight)&&a>this.maxWeight){this.rejected++;try{this.onEvict&&this.onEvict(n,e,"rejected-oversized")}catch{}return this.rejectOversized?!1:this}if(this.map.has(n)){const h=this.map.get(n);this.currentWeight-=h.weight||0,h.value=e,h.weight=a,h.expiresAt=l,this.currentWeight+=h.weight||0,this._moveToTail(h)}else{const h=this._allocNode(n,e,a,l);this.map.set(n,h),this._append(h),this.currentWeight+=h.weight||0,this._evictIfNeeded()}return this}get(n){const e=this.map.get(n),t=Date.now();if(!e){this.misses++;return}if(e.expiresAt&&e.expiresAt<=t){const r=e.key,i=e.value,l=e.next;this.map.delete(r),this.currentWeight-=e.weight||0,this._cleanupCursor===e&&(this._cleanupCursor=l||this.head),this._remove(e);try{this.onExpire&&this.onExpire(r,i)}catch{}this._freeNode(e),this.misses++;return}return this._moveToTail(e),this.hits++,e.value}peek(n){const e=this.map.get(n);if(e&&!(e.expiresAt&&e.expiresAt<=Date.now()))return e.value}has(n,{ignoreExpiry:e=!1}={}){const t=this.map.get(n);return!(!t||!e&&t.expiresAt&&t.expiresAt<=Date.now())}hasEqual(n,e,{ignoreExpiry:t=!1}={}){const r=this.map.get(n);if(!r||!t&&r.expiresAt&&r.expiresAt<=Date.now())return!1;const i=r.value;if(i===e)return!0;if(typeof i!=="object"||i===null||typeof e!=="object"||e===null)return i===e;const a=new WeakMap,h=(s,o)=>{if(s===o)return!0;if(s==null||o==null||typeof s!=="object"||typeof o!=="object")return s===o;const w=a.get(s);if(w&&w.has(o))return!0;if(w||a.set(s,new WeakSet),a.get(s).add(o),Object.getPrototypeOf(s)!==Object.getPrototypeOf(o))return!1;if(typeof Uint8Array<"u"&&s instanceof Uint8Array){if(!(o instanceof Uint8Array)||s.length!==o.length)return!1;for(let c=0;c<s.length;c++)if(s[c]!==o[c])return!1;return!0}if(Array.isArray(s)){if(!Array.isArray(o)||s.length!==o.length)return!1;for(let c=0;c<s.length;c++)if(!h(s[c],o[c]))return!1;return!0}if(ArrayBuffer.isView(s)){if(!ArrayBuffer.isView(o)||s.byteLength!==o.byteLength)return!1;const c=new Uint8Array(s.buffer,s.byteOffset||0,s.byteLength),f=new Uint8Array(o.buffer,o.byteOffset||0,o.byteLength);for(let y=0;y<c.length;y++)if(c[y]!==f[y])return!1;return!0}if(s instanceof ArrayBuffer){if(!(o instanceof ArrayBuffer)||s.byteLength!==o.byteLength)return!1;const c=new Uint8Array(s),f=new Uint8Array(o);for(let y=0;y<c.length;y++)if(c[y]!==f[y])return!1;return!0}if(s instanceof Date)return o instanceof Date?s.getTime()===o.getTime():!1;if(s instanceof RegExp)return o instanceof RegExp?s.toString()===o.toString():!1;if(s instanceof Map){if(!(o instanceof Map)||s.size!==o.size)return!1;for(const[c,f]of s)if(!o.has(c)||!h(f,o.get(c)))return!1;return!0}if(s instanceof Set){if(!(o instanceof Set)||s.size!==o.size)return!1;let c=!0;for(const f of s)if(f!==null&&typeof f=="object"){c=!1;break}if(c){for(const f of s)if(!o.has(f))return!1;return!0}for(const f of s){let y=!1;for(const C of o)if(h(f,C)){y=!0;break}if(!y)return!1}return!0}const d=Object.keys(s),b=Object.keys(o);if(d.length!==b.length)return!1;for(let c=0;c<d.length;c++){const f=d[c];if(!Object.prototype.hasOwnProperty.call(o,f)||!h(s[f],o[f]))return!1}return!0};return h(i,e)}delete(n){const e=this.map.get(n);if(!e)return!1;const t=e.next;this.map.delete(n),this.currentWeight-=e.weight||0,this._cleanupCursor===e&&(this._cleanupCursor=t||this.head),this._remove(e);try{this.onEvict&&this.onEvict(e.key,e.value,"deleted")}catch{}return this._freeNode(e),!0}clear(){for(let n=this.head;n;){const e=n.next;this.pool.length<this.maxPoolSize&&this.pool.push(n),n=e}this.head=this.tail=null,this.map.clear(),this.currentWeight=0,this._cleanupCursor=null}cleanupExpired(){return this.cleanupExpiredUpTo()}cleanupExpiredUpTo(n=1/0){const e=Date.now();let t=0,r=this._cleanupCursor&&this.map.get(this._cleanupCursor.key)===this._cleanupCursor?this._cleanupCursor:this.head;for(;r&&t<n;){const i=r.next;if(r.expiresAt&&r.expiresAt<=e){const l=r.key,p=r.value;this.map.delete(l),this.currentWeight-=r.weight||0,this._cleanupCursor===r&&(this._cleanupCursor=i||this.head),this._remove(r);try{this.onExpire&&this.onExpire(l,p)}catch{}this._freeNode(r),this.evictions++}r=i,t++}return this._cleanupCursor=r||this.head,t}startCleanup(n={}){let e,t;typeof n=="number"?(e=n,t=this.maxCleanupPerTick):(e=Number.isFinite(+n.interval)?+n.interval:Math.max(1e3,Math.min(this.defaultTTL||6e4,6e4)),t=Number.isFinite(+n.maxCleanupPerTick)?Math.max(1,+n.maxCleanupPerTick):this.maxCleanupPerTick),this.stopCleanup(),this._cleanupParams={interval:e,maxCleanupPerTick:t};const r=()=>{if(this._cleanupTimer!=null){if(this._cleanupRunning){this._cleanupTimer=setTimeout(r,this._cleanupParams.interval);return}this._cleanupRunning=!0;try{this.cleanupExpiredUpTo(this._cleanupParams.maxCleanupPerTick)}finally{this._cleanupRunning=!1}this._cleanupTimer=setTimeout(r,this._cleanupParams.interval)}};this._cleanupTimer=setTimeout(r,e)}stopCleanup(){this._cleanupTimer&&(clearTimeout(this._cleanupTimer),this._cleanupTimer=null),this._cleanupRunning=!1,this._cleanupParams=null}get size(){return this.map.size}stats(){return{size:this.size,weight:this.currentWeight,hits:this.hits,misses:this.misses,evictions:this.evictions,rejected:this.rejected,poolSize:this.pool.length}}resize({maxEntries:n,maxWeight:e}={}){Number.isFinite(+n)&&(this.maxEntries=Math.max(0,+n)),Number.isFinite(+e)&&(this.maxWeight=Math.max(0,+e)),this._evictIfNeeded()}*entries(n="MRU"){if(n==="MRU")for(let e=this.tail;e;e=e.prev)yield[e.key,e.value];else for(let e=this.head;e;e=e.next)yield[e.key,e.value]}*keys(n="MRU"){for(const[e]of this.entries(n))yield e}*values(n="MRU"){for(const[,e]of this.entries(n))yield e}}const N=typeof TextEncoder<"u",B=typeof TextDecoder<"u",R=N?new TextEncoder:null,A=B?new TextDecoder:null,P=u=>{if(u instanceof Uint8Array)return u;if(ArrayBuffer.isView(u))return new Uint8Array(u.buffer,u.byteOffset,u.byteLength);if(u instanceof ArrayBuffer)return new Uint8Array(u);const n=JSON.stringify(u);if(R)return R.encode(n);if(typeof Buffer<"u"&&typeof Buffer.from=="function")return new Uint8Array(Buffer.from(n));throw new Error("No TextEncoder available to encode object")},M=u=>{let n;if(u instanceof Uint8Array)n=u;else if(ArrayBuffer.isView(u))n=new Uint8Array(u.buffer,u.byteOffset,u.byteLength);else if(u instanceof ArrayBuffer)n=new Uint8Array(u);else if(typeof Buffer<"u"&&typeof Buffer.isBuffer=="function"&&Buffer.isBuffer(u))n=new Uint8Array(u);else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");return A?JSON.parse(A.decode(n)):typeof Buffer<"u"&&typeof Buffer.from=="function"?JSON.parse(Buffer.from(n).toString("utf8")):JSON.parse(new TextDecoder().decode(n))};class I{constructor(n){this.map=n.map,this.source=n.source instanceof maplibregl.VectorTileSource?n.source:this.map.getSource(n.source),this.sourceLayer=n.sourceLayer,this.fid=n.fid||"id",this.tiles=this.source.tiles.map(a=>a.split("{z}")[0]),this.tileSize=this.source.tileSize||512,this.tolerance=n.tolerance||1e-5,this.cacheSize=n.cacheSize||5e3,this.units=n.units||"meters",this.seed=!1,this.map.addSource(this.source.id+"-proper",{type:"geojson",maxzoom:this.source.maxzoom,promoteId:"_index",data:{}}),this.gjSource=this.map.getSource(this.source.id+"-proper");const e=new T(L,{size:6}),t=new T(O,{size:4}),r=new k({maxEntries:this.cacheSize,maxWeight:this.cacheSize*5e3,weight:a=>a.size||0});e.onmessage=a=>{if(a.data instanceof ArrayBuffer){const h=a.data,s=M(h);if(s.type==="simplified"&&s.size>0){const{unique:o,type:g,...m}=s;r.set(o,m)}}};const i=new k({maxEntries:this.cacheSize,maxWeight:this.cacheSize*5e3,weight:a=>a.features.length||0}),l={add:new Map,remove:new Set},p=()=>{if(l.add.size===0&&l.remove.size===0){console.log("No changes to apply, skipping update"),this.scheduler&&(clearInterval(this.scheduler),this.scheduler=null);return}console.log(`Applying diff with ${l.add.size} additions and ${l.remove.size} removals`);const a=[...l.add.values()],h=[...l.remove];this.gjSource.updateData({add:a,remove:h}),l.add.clear(),l.remove.clear()};return t.onmessage=a=>{if(a.data instanceof ArrayBuffer){const h=a.data,s=M(h),{id:o,features:g}=s;if(i.has(o)&&!i.hasEqual(o,g)){const m=i.get(o);[...new Set(m.map(d=>d.properties._index))].forEach(d=>l.remove.add(d)),g.forEach(d=>l.add.set(d.properties._index,d)),i.set(o,g)}else g.forEach(m=>l.add.set(m.properties._index,m)),i.set(o,g)}},t.addEventListener("idle",p),this.map.on("sourcedata",a=>{if(a.sourceId===this.source.id){const{z:h,x:s,y:o}=a.tile.tileID.canonical,g=`${h}|${s}|${o}`;if(!r.has(g)){const m=this.tolerance*Math.pow(10,-.301*h+5.19),w=[],d=this.source.type==="vector"?{sourceLayer:this.sourceLayer}:{};a.tile.querySourceFeatures(w,d);const b={collection:{type:"FeatureCollection",features:w.map((f,y)=>({id:f.properties[this.fid]||f.id,geometry:f.geometry,properties:{...f.properties,_index:`${g}|${y}`,_tile:g,_group:f.properties[this.fid]}}))},tolerance:m,unique:g,tileSize:this.tileSize},c=P(b).buffer;e.postMessage(c,[c])}a.isSourceLoaded&&e.addEventListener("idle",m=>{const d={pieces:Object.fromEntries(r.entries()),tolerance:this.tolerance,unit:this.units,tileSize:this.tileSize},b=P(d).buffer;t.postMessage(b,[b])})}}),this.map.refreshTiles(this.source.id),this.gjSource}}return maplibregl.VectorTileSource.prototype.ProperLabels=function(u){const n=Object.assign({},u,{map:this._map,source:this});return this._proper||(this._proper=new I(n)),this._proper},I}));
