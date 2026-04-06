const q = `var b, m, T = (e) => {
  if (e instanceof Uint8Array) return e;
  if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  const n = JSON.stringify(e), t = b !== void 0 ? b === !1 ? null : b : typeof TextEncoder < "u" ? b = new TextEncoder() : typeof Buffer < "u" && typeof Buffer.from == "function" ? b = { encode: (o) => new Uint8Array(Buffer.from(o)) } : (b = !1, null);
  if (t && typeof t.encode == "function") return t.encode(n);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, E = (e) => {
  let n;
  if (e instanceof Uint8Array) n = e;
  else if (ArrayBuffer.isView(e)) n = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  else if (e instanceof ArrayBuffer) n = new Uint8Array(e);
  else {
    if (typeof Buffer > "u" || typeof Buffer.isBuffer != "function" || !Buffer.isBuffer(e)) throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
    n = new Uint8Array(e);
  }
  const t = m !== void 0 ? m === !1 ? null : m : typeof TextDecoder < "u" ? m = new TextDecoder() : typeof Buffer < "u" && typeof Buffer.from == "function" ? m = { decode: (o) => Buffer.from(o).toString("utf8") } : (m = !1, null);
  if (t && typeof t.decode == "function") return JSON.parse(t.decode(n));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(n));
  throw new Error("No TextDecoder or Buffer available to decode object");
}, C = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function") try {
  const e = Number(process.hrtime.bigint() / 1000000n);
  C = Date.now() - e;
} catch {
  C = null;
}
function v(e, n, t = {}) {
  const o = { type: "Feature" };
  return (t.id === 0 || t.id) && (o.id = t.id), t.bbox && (o.bbox = t.bbox), o.properties = n || {}, o.geometry = e, o;
}
function O(e, n = {}) {
  const t = { type: "FeatureCollection" };
  return n.id && (t.id = n.id), n.bbox && (t.bbox = n.bbox), t.features = e, t;
}
function U(e, n) {
  var t, o, a, c, y, s, i, u, r, f, l = 0, p = e.type === "FeatureCollection", h = e.type === "Feature", d = p ? e.features.length : 1;
  for (t = 0; t < d; t++) {
    for (s = p ? (
      // @ts-expect-error: Known type conflict
      e.features[t].geometry
    ) : h ? (
      // @ts-expect-error: Known type conflict
      e.geometry
    ) : e, u = p ? (
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
    ) : void 0, f = p ? (
      // @ts-expect-error: Known type conflict
      e.features[t].id
    ) : h ? (
      // @ts-expect-error: Known type conflict
      e.id
    ) : void 0, i = s ? s.type === "GeometryCollection" : !1, y = i ? s.geometries.length : 1, a = 0; a < y; a++) {
      if (c = i ? s.geometries[a] : s, c === null) {
        if (
          // @ts-expect-error: Known type conflict
          n(
            // @ts-expect-error: Known type conflict
            null,
            l,
            u,
            r,
            f
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
              u,
              r,
              f
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (o = 0; o < c.geometries.length; o++)
            if (
              // @ts-expect-error: Known type conflict
              n(
                c.geometries[o],
                l,
                u,
                r,
                f
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
function _(e, n) {
  U(e, function(t, o, a, c, y) {
    var s = t === null ? null : t.type;
    switch (s) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          n(
            v(t, a, { bbox: c, id: y }),
            o,
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
      var u = 0;
      // @ts-expect-error: Known type conflict
      u < t.coordinates.length;
      u++
    ) {
      var r = t.coordinates[u], f = {
        type: i,
        coordinates: r
      };
      if (
        // @ts-expect-error: Known type conflict
        n(v(f, a), o, u) === !1
      )
        return !1;
    }
  });
}
function k(e) {
  if (!e) throw new Error("geojson is required");
  var n = [];
  return _(e, function(t) {
    n.push(t);
  }), O(n);
}
const A = /* @__PURE__ */ new WeakMap(), F = (e, n, t) => {
  const [o, a, c] = n.split("|").map(Number), y = Math.pow(2, o) * t, s = 85.05112878, i = 1;
  return e[0].some((r) => {
    const f = Math.max(Math.min(r[1], s), -s), l = Math.sin(f * Math.PI / 180), p = (r[0] + 180) / 360, h = 0.5 - Math.log((1 + l) / (1 - l)) / (4 * Math.PI), d = p * y, g = h * y, M = Math.floor(d / t), B = Math.floor(g / t), x = Math.floor(d - M * t), w = Math.floor(g - B * t);
    return B != c || M != a || x <= i || w <= i || x >= t - i || w >= t - i;
  });
};
function L(e, n = {}) {
  const { unique: t = !1 } = n;
  if (e && typeof e == "object") {
    let r = A.get(e);
    const f = t ? "unique" : "__count";
    if (r && r.has(f))
      return r.get(f);
  }
  const o = t ? /* @__PURE__ */ new Set() : null;
  let a = 0;
  const c = (r) => Array.isArray(r) && r.length >= 2 && typeof r[0] == "number" && typeof r[1] == "number", y = (r) => {
    t ? o.add(r.slice(0, 3).join(",")) : a++;
  };
  function s(r) {
    if (c(r)) {
      y(r);
      return;
    }
    if (Array.isArray(r)) for (const f of r) s(f);
  }
  function i(r) {
    if (r) {
      if (r.type === "FeatureCollection") {
        for (const f of r.features || []) i(f);
        return;
      }
      if (r.type === "Feature") {
        i(r.geometry);
        return;
      }
      if (r.type === "GeometryCollection") {
        for (const f of r.geometries || []) i(f);
        return;
      }
      r.coordinates !== void 0 && s(r.coordinates);
    }
  }
  i(e);
  const u = t ? o.size : a;
  if (e && typeof e == "object") {
    let r = A.get(e);
    const f = t ? "unique" : "__count";
    r || (r = /* @__PURE__ */ new Map(), A.set(e, r)), r.set(f, u);
  }
  return u;
}
const P = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
P.onmessage = (e) => {
  const n = e.data, t = E(n);
  t.tolerance;
  const o = t.unique, a = t.tileSize, c = /* @__PURE__ */ new Map();
  t.collection.features.forEach((f) => {
    const l = f.id, p = c.get(l) || [];
    p.push(f), c.set(l, p);
  });
  let y = 0;
  const s = /* @__PURE__ */ new Map();
  c.forEach((f, l) => {
    const p = k({ type: "FeatureCollection", features: f }), h = { type: "FeatureCollection", features: [] };
    h.features = p.features.filter((d) => d.geometry.type === "Polygon").map((d, g) => {
      const M = \`\${o}|\${l}|\${g}\`, B = F(d.geometry.coordinates, d.properties._tile, a), x = Object.assign({}, d.properties, { _index: M, clipped: B }), w = { type: "Feature", geometry: d.geometry, properties: x };
      return y += L(w), w;
    }), s.set(l, h);
  });
  const i = Object.fromEntries(s), u = Object.assign({}, i, { unique: o, type: "simplified", size: y }), r = T(u).buffer;
  P.postMessage(r, [r]);
};
`, A = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", q], { type: "text/javascript;charset=utf-8" });
function j(e) {
  let t;
  try {
    if (t = A && (self.URL || self.webkitURL).createObjectURL(A), !t) throw "";
    const n = new Worker(t, {
      type: "module",
      name: e?.name
    });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), n;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(q),
      {
        type: "module",
        name: e?.name
      }
    );
  }
}
const U = `var rt = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Pe = Math.ceil, Y = Math.floor, V = "[BigNumber Error] ", De = V + "Number primitive has more than 15 significant digits: ", W = 1e14, P = 14, Oe = 9007199254740991, Ae = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], se = 1e7, U = 1e9;
function Qe(i) {
  var e, t, n, r = S.prototype = { constructor: S, toString: null, valueOf: null }, u = new S(1), a = 20, f = 4, E = -7, p = 21, _ = -1e7, T = 1e7, b = !1, A = 1, N = 0, O = {
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
        d.s = s.s, !s.c || s.e > T ? d.c = d.e = null : s.e < _ ? d.c = [d.e = 0] : (d.e = s.e, d.c = s.c.slice());
        return;
      }
      if ((h = typeof s == "number") && s * 0 == 0) {
        if (d.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (y = 0, w = s; w >= 10; w /= 10, y++) ;
          y > T ? d.c = d.e = null : (d.e = y, d.c = [s]);
          return;
        }
        x = String(s);
      } else {
        if (!rt.test(x = String(s))) return n(d, x, h);
        d.s = x.charCodeAt(0) == 45 ? (x = x.slice(1), -1) : 1;
      }
      (y = x.indexOf(".")) > -1 && (x = x.replace(".", "")), (w = x.search(/e/i)) > 0 ? (y < 0 && (y = w), y += +x.slice(w + 1), x = x.substring(0, w)) : y < 0 && (y = x.length);
    } else {
      if (G(o, 2, B.length, "Base"), o == 10 && k)
        return d = new S(s), j(d, a + d.e + 1, f);
      if (x = String(s), h = typeof s == "number") {
        if (s * 0 != 0) return n(d, x, h, o);
        if (d.s = 1 / s < 0 ? (x = x.slice(1), -1) : 1, S.DEBUG && x.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(De + s);
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
      if (g -= w, h && S.DEBUG && g > 15 && (s > Oe || s !== Y(s)))
        throw Error(De + d.s * s);
      if ((y = y - w - 1) > T)
        d.c = d.e = null;
      else if (y < _)
        d.c = [d.e = 0];
      else {
        if (d.e = y, d.c = [], w = (y + 1) % P, y < 0 && (w += P), w < g) {
          for (w && d.c.push(+x.slice(0, w)), g -= P; w < g; )
            d.c.push(+x.slice(w, w += P));
          w = P - (x = x.slice(w)).length;
        } else
          w -= g;
        for (; w--; x += "0") ;
        d.c.push(+x);
      }
    } else
      d.c = [d.e = 0];
  }
  S.clone = Qe, S.ROUND_UP = 0, S.ROUND_DOWN = 1, S.ROUND_CEIL = 2, S.ROUND_FLOOR = 3, S.ROUND_HALF_UP = 4, S.ROUND_HALF_DOWN = 5, S.ROUND_HALF_EVEN = 6, S.ROUND_HALF_CEIL = 7, S.ROUND_HALF_FLOOR = 8, S.EUCLID = 9, S.config = S.set = function(s) {
    var o, l;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(o = "DECIMAL_PLACES") && (l = s[o], G(l, 0, U, o), a = l), s.hasOwnProperty(o = "ROUNDING_MODE") && (l = s[o], G(l, 0, 8, o), f = l), s.hasOwnProperty(o = "EXPONENTIAL_AT") && (l = s[o], l && l.pop ? (G(l[0], -U, 0, o), G(l[1], 0, U, o), E = l[0], p = l[1]) : (G(l, -U, U, o), E = -(p = l < 0 ? -l : l))), s.hasOwnProperty(o = "RANGE"))
          if (l = s[o], l && l.pop)
            G(l[0], -U, -1, o), G(l[1], 1, U, o), _ = l[0], T = l[1];
          else if (G(l, -U, U, o), l)
            _ = -(T = l < 0 ? -l : l);
          else
            throw Error(V + o + " cannot be zero: " + l);
        if (s.hasOwnProperty(o = "CRYPTO"))
          if (l = s[o], l === !!l)
            if (l)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                b = l;
              else
                throw b = !l, Error(V + "crypto unavailable");
            else
              b = l;
          else
            throw Error(V + o + " not true or false: " + l);
        if (s.hasOwnProperty(o = "MODULO_MODE") && (l = s[o], G(l, 0, 9, o), A = l), s.hasOwnProperty(o = "POW_PRECISION") && (l = s[o], G(l, 0, U, o), N = l), s.hasOwnProperty(o = "FORMAT"))
          if (l = s[o], typeof l == "object") O = l;
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
      RANGE: [_, T],
      CRYPTO: b,
      MODULO_MODE: A,
      POW_PRECISION: N,
      FORMAT: O,
      ALPHABET: B
    };
  }, S.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!S.DEBUG) return !0;
    var o, l, m = s.c, c = s.e, y = s.s;
    e: if ({}.toString.call(m) == "[object Array]") {
      if ((y === 1 || y === -1) && c >= -U && c <= U && c === Y(c)) {
        if (m[0] === 0) {
          if (c === 0 && m.length === 1) return !0;
          break e;
        }
        if (o = (c + 1) % P, o < 1 && (o += P), String(m[0]).length == o) {
          for (o = 0; o < m.length; o++)
            if (l = m[o], l < 0 || l >= W || l !== Y(l)) break e;
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
      return Y(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(l) {
      var m, c, y, w, h, g = 0, x = [], d = new S(u);
      if (l == null ? l = a : G(l, 0, U), w = Pe(l / P), b)
        if (crypto.getRandomValues) {
          for (m = crypto.getRandomValues(new Uint32Array(w *= 2)); g < w; )
            h = m[g] * 131072 + (m[g + 1] >>> 11), h >= 9e15 ? (c = crypto.getRandomValues(new Uint32Array(2)), m[g] = c[0], m[g + 1] = c[1]) : (x.push(h % 1e14), g += 2);
          g = w / 2;
        } else if (crypto.randomBytes) {
          for (m = crypto.randomBytes(w *= 7); g < w; )
            h = (m[g] & 31) * 281474976710656 + m[g + 1] * 1099511627776 + m[g + 2] * 4294967296 + m[g + 3] * 16777216 + (m[g + 4] << 16) + (m[g + 5] << 8) + m[g + 6], h >= 9e15 ? crypto.randomBytes(7).copy(m, g) : (x.push(h % 1e14), g += 7);
          g = w / 7;
        } else
          throw b = !1, Error(V + "crypto unavailable");
      if (!b)
        for (; g < w; )
          h = o(), h < 9e15 && (x[g++] = h % 1e14);
      for (w = x[--g], l %= P, w && l && (h = Ae[P - l], x[g] = Y(w / h) * h); x[g] === 0; x.pop(), g--) ;
      if (g < 0)
        x = [y = 0];
      else {
        for (y = -1; x[0] === 0; x.splice(0, 1), y -= P) ;
        for (g = 1, h = x[0]; h >= 10; h /= 10, g++) ;
        g < P && (y -= P - g);
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
        ne(X(R.c), R.e, "0"),
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
      var g, x, d, v, R, M, I, q, D, L, C, z, ge, Re, Me, Q, fe, K = m.s == c.s ? 1 : -1, $ = m.c, F = c.c;
      if (!$ || !$[0] || !F || !F[0])
        return new S(
          // Return NaN if either NaN, or both Infinity or 0.
          !m.s || !c.s || ($ ? F && $[0] == F[0] : !F) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            $ && $[0] == 0 || !F ? K * 0 : K / 0
          )
        );
      for (q = new S(K), D = q.c = [], x = m.e - c.e, K = y + x + 1, h || (h = W, x = H(m.e / P) - H(c.e / P), K = K / P | 0), d = 0; F[d] == ($[d] || 0); d++) ;
      if (F[d] > ($[d] || 0) && x--, K < 0)
        D.push(1), v = !0;
      else {
        for (Re = $.length, Q = F.length, d = 0, K += 2, R = Y(h / (F[0] + 1)), R > 1 && (F = s(F, R, h), $ = s($, R, h), Q = F.length, Re = $.length), ge = Q, L = $.slice(0, Q), C = L.length; C < Q; L[C++] = 0) ;
        fe = F.slice(), fe = [0].concat(fe), Me = F[0], F[1] >= h / 2 && Me++;
        do {
          if (R = 0, g = o(F, L, Q, C), g < 0) {
            if (z = L[0], Q != C && (z = z * h + (L[1] || 0)), R = Y(z / Me), R > 1)
              for (R >= h && (R = h - 1), M = s(F, R, h), I = M.length, C = L.length; o(M, L, I, C) == 1; )
                R--, l(M, Q < I ? fe : F, I, h), I = M.length, g = 1;
            else
              R == 0 && (g = R = 1), M = F.slice(), I = M.length;
            if (I < C && (M = [0].concat(M)), l(L, M, C, h), C = L.length, g == -1)
              for (; o(F, L, Q, C) < 1; )
                R++, l(L, Q < C ? fe : F, C, h), C = L.length;
          } else g === 0 && (R++, L = [0]);
          D[d++] = R, L[0] ? L[C++] = $[ge] || 0 : (L = [$[ge]], C = 1);
        } while ((ge++ < Re || L[0] != null) && K--);
        v = L[0] != null, D[0] || D.splice(0, 1);
      }
      if (h == W) {
        for (d = 1, K = D[0]; K >= 10; K /= 10, d++) ;
        j(q, y + (q.e = d + x * P - 1) + 1, w, v);
      } else
        q.e = x, q.r = +v;
      return q;
    };
  })();
  function Z(s, o, l, m) {
    var c, y, w, h, g;
    if (l == null ? l = f : G(l, 0, 8), !s.c) return s.toString();
    if (c = s.c[0], w = s.e, o == null)
      g = X(s.c), g = m == 1 || m == 2 && (w <= E || w >= p) ? de(g, w) : ne(g, w, "0");
    else if (s = j(new S(s), o, l), y = s.e, g = X(s.c), h = g.length, m == 1 || m == 2 && (o <= y || y <= E)) {
      for (; h < o; g += "0", h++) ;
      g = de(g, y);
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
  function _e(s, o, l) {
    for (var m = 1, c = o.length; !o[--c]; o.pop()) ;
    for (c = o[0]; c >= 10; c /= 10, m++) ;
    return (l = m + l * P - 1) > T ? s.c = s.e = null : l < _ ? s.c = [s.e = 0] : (s.e = l, s.c = o), s;
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
  function j(s, o, l, m) {
    var c, y, w, h, g, x, d, v = s.c, R = Ae;
    if (v) {
      e: {
        for (c = 1, h = v[0]; h >= 10; h /= 10, c++) ;
        if (y = o - c, y < 0)
          y += P, w = o, g = v[x = 0], d = Y(g / R[c - w - 1] % 10);
        else if (x = Pe((y + 1) / P), x >= v.length)
          if (m) {
            for (; v.length <= x; v.push(0)) ;
            g = d = 0, c = 1, y %= P, w = y - P + 1;
          } else
            break e;
        else {
          for (g = h = v[x], c = 1; h >= 10; h /= 10, c++) ;
          y %= P, w = y - P + c, d = w < 0 ? 0 : Y(g / R[c - w - 1] % 10);
        }
        if (m = m || o < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        v[x + 1] != null || (w < 0 ? g : g % R[c - w - 1]), m = l < 4 ? (d || m) && (l == 0 || l == (s.s < 0 ? 3 : 2)) : d > 5 || d == 5 && (l == 4 || m || l == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? w > 0 ? g / R[c - w] : 0 : v[x - 1]) % 10 & 1 || l == (s.s < 0 ? 8 : 7)), o < 1 || !v[0])
          return v.length = 0, m ? (o -= s.e + 1, v[0] = R[(P - o % P) % P], s.e = -o || 0) : v[0] = s.e = 0, s;
        if (y == 0 ? (v.length = x, h = 1, x--) : (v.length = x + 1, h = R[P - y], v[x] = w > 0 ? Y(g / R[c - w] % R[w]) * h : 0), m)
          for (; ; )
            if (x == 0) {
              for (y = 1, w = v[0]; w >= 10; w /= 10, y++) ;
              for (w = v[0] += h, h = 1; w >= 10; w /= 10, h++) ;
              y != h && (s.e++, v[0] == W && (v[0] = 1));
              break;
            } else {
              if (v[x] += h, v[x] != W) break;
              v[x--] = 0, h = 1;
            }
        for (y = v.length; v[--y] === 0; v.pop()) ;
      }
      s.e > T ? s.c = s.e = null : s.e < _ && (s.c = [s.e = 0]);
    }
    return s;
  }
  function ie(s) {
    var o, l = s.e;
    return l === null ? s.toString() : (o = X(s.c), o = l <= E || l >= p ? de(o, l) : ne(o, l, "0"), s.s < 0 ? "-" + o : o);
  }
  return r.absoluteValue = r.abs = function() {
    var s = new S(this);
    return s.s < 0 && (s.s = 1), s;
  }, r.comparedTo = function(s, o) {
    return oe(this, new S(s, o));
  }, r.decimalPlaces = r.dp = function(s, o) {
    var l, m, c, y = this;
    if (s != null)
      return G(s, 0, U), o == null ? o = f : G(o, 0, 8), j(new S(y), s + y.e + 1, o);
    if (!(l = y.c)) return null;
    if (m = ((c = l.length - 1) - H(this.e / P)) * P, c = l[c]) for (; c % 10 == 0; c /= 10, m--) ;
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
      return d = new S(Math.pow(+ie(v), h ? s.s * (2 - ye(s)) : +ie(s))), o ? d.mod(o) : d;
    if (g = s.s < 0, o) {
      if (o.c ? !o.c[0] : !o.s) return new S(NaN);
      m = !g && v.isInteger() && o.isInteger(), m && (v = v.mod(o));
    } else {
      if (s.e > 9 && (v.e > 0 || v.e < -1 || (v.e == 0 ? v.c[0] > 1 || h && v.c[1] >= 24e7 : v.c[0] < 8e13 || h && v.c[0] <= 9999975e7)))
        return y = v.s < 0 && ye(s) ? -0 : 0, v.e > -1 && (y = 1 / y), new S(g ? 1 / y : y);
      N && (y = Pe(N / P + 2));
    }
    for (h ? (l = new S(0.5), g && (s.s = 1), x = ye(s)) : (c = Math.abs(+ie(s)), x = c % 2), d = new S(u); ; ) {
      if (x) {
        if (d = d.times(v), !d.c) break;
        y ? d.c.length > y && (d.c.length = y) : m && (d = d.mod(o));
      }
      if (c) {
        if (c = Y(c / 2), c === 0) break;
        x = c % 2;
      } else if (s = s.times(l), j(s, s.e + 1, 1), s.e > 14)
        x = ye(s);
      else {
        if (c = +ie(s), c === 0) break;
        x = c % 2;
      }
      v = v.times(v), y ? v.c && v.c.length > y && (v.c.length = y) : m && (v = v.mod(o));
    }
    return m ? d : (g && (d = u.div(d)), o ? d.mod(o) : y ? j(d, N, f, w) : d);
  }, r.integerValue = function(s) {
    var o = new S(this);
    return s == null ? s = f : G(s, 0, 8), j(o, o.e + 1, s);
  }, r.isEqualTo = r.eq = function(s, o) {
    return oe(this, new S(s, o)) === 0;
  }, r.isFinite = function() {
    return !!this.c;
  }, r.isGreaterThan = r.gt = function(s, o) {
    return oe(this, new S(s, o)) > 0;
  }, r.isGreaterThanOrEqualTo = r.gte = function(s, o) {
    return (o = oe(this, new S(s, o))) === 1 || o === 0;
  }, r.isInteger = function() {
    return !!this.c && H(this.e / P) > this.c.length - 2;
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
    var g = w.e / P, x = s.e / P, d = w.c, v = s.c;
    if (!g || !x) {
      if (!d || !v) return d ? (s.s = -o, s) : new S(v ? w : NaN);
      if (!d[0] || !v[0])
        return v[0] ? (s.s = -o, s) : new S(d[0] ? w : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          f == 3 ? -0 : 0
        ));
    }
    if (g = H(g), x = H(x), d = d.slice(), h = g - x) {
      for ((y = h < 0) ? (h = -h, c = d) : (x = g, c = v), c.reverse(), o = h; o--; c.push(0)) ;
      c.reverse();
    } else
      for (m = (y = (h = d.length) < (o = v.length)) ? h : o, h = o = 0; o < m; o++)
        if (d[o] != v[o]) {
          y = d[o] < v[o];
          break;
        }
    if (y && (c = d, d = v, v = c, s.s = -s.s), o = (m = v.length) - (l = d.length), o > 0) for (; o--; d[l++] = 0) ;
    for (o = W - 1; m > h; ) {
      if (d[--m] < v[m]) {
        for (l = m; l && !d[--l]; d[l] = o) ;
        --d[l], d[m] += W;
      }
      d[m] -= v[m];
    }
    for (; d[0] == 0; d.splice(0, 1), --x) ;
    return d[0] ? _e(s, d, x) : (s.s = f == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, r.modulo = r.mod = function(s, o) {
    var l, m, c = this;
    return s = new S(s, o), !c.c || !s.s || s.c && !s.c[0] ? new S(NaN) : !s.c || c.c && !c.c[0] ? new S(c) : (A == 9 ? (m = s.s, s.s = 1, l = e(c, s, 0, 3), s.s = m, l.s *= m) : l = e(c, s, 0, A), s = c.minus(l.times(s)), !s.c[0] && A == 1 && (s.s = c.s), s);
  }, r.multipliedBy = r.times = function(s, o) {
    var l, m, c, y, w, h, g, x, d, v, R, M, I, q, D, L = this, C = L.c, z = (s = new S(s, o)).c;
    if (!C || !z || !C[0] || !z[0])
      return !L.s || !s.s || C && !C[0] && !z || z && !z[0] && !C ? s.c = s.e = s.s = null : (s.s *= L.s, !C || !z ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (m = H(L.e / P) + H(s.e / P), s.s *= L.s, g = C.length, v = z.length, g < v && (I = C, C = z, z = I, c = g, g = v, v = c), c = g + v, I = []; c--; I.push(0)) ;
    for (q = W, D = se, c = v; --c >= 0; ) {
      for (l = 0, R = z[c] % D, M = z[c] / D | 0, w = g, y = c + w; y > c; )
        x = C[--w] % D, d = C[w] / D | 0, h = M * x + d * R, x = R * x + h % D * D + I[y] + l, l = (x / q | 0) + (h / D | 0) + M * d, I[y--] = x % q;
      I[y] = l;
    }
    return l ? ++m : I.splice(0, 1), _e(s, I, m);
  }, r.negated = function() {
    var s = new S(this);
    return s.s = -s.s || null, s;
  }, r.plus = function(s, o) {
    var l, m = this, c = m.s;
    if (s = new S(s, o), o = s.s, !c || !o) return new S(NaN);
    if (c != o)
      return s.s = -o, m.minus(s);
    var y = m.e / P, w = s.e / P, h = m.c, g = s.c;
    if (!y || !w) {
      if (!h || !g) return new S(c / 0);
      if (!h[0] || !g[0]) return g[0] ? s : new S(h[0] ? m : c * 0);
    }
    if (y = H(y), w = H(w), h = h.slice(), c = y - w) {
      for (c > 0 ? (w = y, l = g) : (c = -c, l = h), l.reverse(); c--; l.push(0)) ;
      l.reverse();
    }
    for (c = h.length, o = g.length, c - o < 0 && (l = g, g = h, h = l, o = c), c = 0; o; )
      c = (h[--o] = h[o] + g[o] + c) / W | 0, h[o] = W === h[o] ? 0 : h[o] % W;
    return c && (h = [c].concat(h), ++w), _e(s, h, w);
  }, r.precision = r.sd = function(s, o) {
    var l, m, c, y = this;
    if (s != null && s !== !!s)
      return G(s, 1, U), o == null ? o = f : G(o, 0, 8), j(new S(y), s, o);
    if (!(l = y.c)) return null;
    if (c = l.length - 1, m = c * P + 1, c = l[c]) {
      for (; c % 10 == 0; c /= 10, m--) ;
      for (c = l[0]; c >= 10; c /= 10, m++) ;
    }
    return s && y.e + 1 > m && (m = y.e + 1), m;
  }, r.shiftedBy = function(s) {
    return G(s, -Oe, Oe), this.times("1e" + s);
  }, r.squareRoot = r.sqrt = function() {
    var s, o, l, m, c, y = this, w = y.c, h = y.s, g = y.e, x = a + 4, d = new S("0.5");
    if (h !== 1 || !w || !w[0])
      return new S(!h || h < 0 && (!w || w[0]) ? NaN : w ? y : 1 / 0);
    if (h = Math.sqrt(+ie(y)), h == 0 || h == 1 / 0 ? (o = X(w), (o.length + g) % 2 == 0 && (o += "0"), h = Math.sqrt(+o), g = H((g + 1) / 2) - (g < 0 || g % 2), h == 1 / 0 ? o = "5e" + g : (o = h.toExponential(), o = o.slice(0, o.indexOf("e") + 1) + g), l = new S(o)) : l = new S(h + ""), l.c[0]) {
      for (g = l.e, h = g + x, h < 3 && (h = 0); ; )
        if (c = l, l = d.times(c.plus(e(y, c, x, 1))), X(c.c).slice(0, h) === (o = X(l.c)).slice(0, h))
          if (l.e < g && --h, o = o.slice(h - 3, h + 1), o == "9999" || !m && o == "4999") {
            if (!m && (j(c, c.e + a + 2, 0), c.times(c).eq(y))) {
              l = c;
              break;
            }
            x += 4, h += 4, m = 1;
          } else {
            (!+o || !+o.slice(1) && o.charAt(0) == "5") && (j(l, l.e + a + 2, 1), s = !l.times(l).eq(y));
            break;
          }
    }
    return j(l, l.e + a + 1, f, s);
  }, r.toExponential = function(s, o) {
    return s != null && (G(s, 0, U), s++), Z(this, s, o, 1);
  }, r.toFixed = function(s, o) {
    return s != null && (G(s, 0, U), s = s + this.e + 1), Z(this, s, o);
  }, r.toFormat = function(s, o, l) {
    var m, c = this;
    if (l == null)
      s != null && o && typeof o == "object" ? (l = o, o = null) : s && typeof s == "object" ? (l = s, s = o = null) : l = O;
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
    for (o = new S(u), x = l = new S(u), m = g = new S(u), R = X(I), y = o.e = R.length - M.e - 1, o.c[0] = Ae[(w = y % P) < 0 ? P + w : w], s = !s || h.comparedTo(o) > 0 ? y > 0 ? o : x : h, w = T, T = 1 / 0, h = new S(R), g.c[0] = 0; d = e(h, o, 0, 1), c = l.plus(d.times(m)), c.comparedTo(s) != 1; )
      l = m, m = c, x = g.plus(d.times(c = x)), g = c, o = h.minus(d.times(c = o)), h = c;
    return c = e(s.minus(l), m, 0, 1), g = g.plus(c.times(x)), l = l.plus(c.times(m)), g.s = x.s = M.s, y = y * 2, v = e(x, m, y, f).minus(M).abs().comparedTo(
      e(g, l, y, f).minus(M).abs()
    ) < 1 ? [x, m] : [g, l], T = w, v;
  }, r.toNumber = function() {
    return +ie(this);
  }, r.toPrecision = function(s, o) {
    return s != null && G(s, 1, U), Z(this, s, o, 2);
  }, r.toString = function(s) {
    var o, l = this, m = l.s, c = l.e;
    return c === null ? m ? (o = "Infinity", m < 0 && (o = "-" + o)) : o = "NaN" : (s == null ? o = c <= E || c >= p ? de(X(l.c), c) : ne(X(l.c), c, "0") : s === 10 && k ? (l = j(new S(l), a + c + 1, f), o = ne(X(l.c), l.e, "0")) : (G(s, 2, B.length, "Base"), o = t(ne(X(l.c), c, "0"), 10, s, m, !0)), m < 0 && l.c[0] && (o = "-" + o)), o;
  }, r.valueOf = r.toJSON = function() {
    return ie(this);
  }, r._isBigNumber = !0, r[Symbol.toStringTag] = "BigNumber", r[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = r.valueOf, i != null && S.set(i), S;
}
function H(i) {
  var e = i | 0;
  return i > 0 || i === e ? e : e - 1;
}
function X(i) {
  for (var e, t, n = 1, r = i.length, u = i[0] + ""; n < r; ) {
    for (e = i[n++] + "", t = P - e.length; t--; e = "0" + e) ;
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
  if (i < e || i > t || i !== Y(i))
    throw Error(V + (n || "Argument") + (typeof i == "number" ? i < e || i > t ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(i));
}
function ye(i) {
  var e = i.c.length - 1;
  return H(i.e / P) == e && i.c[e] % 2 != 0;
}
function de(i, e) {
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
var te = Qe(), st = class {
  key;
  left = null;
  right = null;
  constructor(i) {
    this.key = i;
  }
}, he = class extends st {
  constructor(i) {
    super(i);
  }
}, ot = class {
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
}, Ee = class ce extends ot {
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
    return t != 0 && this.addNewRoot(new he(e), t), this;
  }
  addAndReturn(e) {
    const t = this.splay(e);
    return t != 0 && this.addNewRoot(new he(e), t), this.root.key;
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
    const t = new ce(this.compare, this.validKey), n = this.modificationCount;
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
    const t = new ce(this.compare, this.validKey);
    for (const n of this)
      e.has(n) && t.add(n);
    return t;
  }
  difference(e) {
    const t = new ce(this.compare, this.validKey);
    for (const n of this)
      e.has(n) || t.add(n);
    return t;
  }
  union(e) {
    const t = this.clone();
    return t.addAll(e), t;
  }
  clone() {
    const e = new ce(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function t(r, u) {
      let a, f;
      do {
        if (a = r.left, f = r.right, a != null) {
          const E = new he(a.key);
          u.left = E, t(a, E);
        }
        if (f != null) {
          const E = new he(f.key);
          u.right = E, r = f, u = E;
        }
      } while (f != null);
    }
    const n = new he(e.key);
    return t(e, n), n;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new ut(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new lt(this.wrap());
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
}, lt = class extends et {
  getValue(i) {
    return i.key;
  }
}, ut = class extends et {
  getValue(i) {
    return [i.key, i.key];
  }
}, tt = (i) => () => i, Ce = (i) => {
  const e = i ? (t, n) => n.minus(t).abs().isLessThanOrEqualTo(i) : tt(!1);
  return (t, n) => e(t, n) ? 0 : t.comparedTo(n);
};
function ft(i) {
  const e = i ? (t, n, r, u, a) => t.exponentiatedBy(2).isLessThanOrEqualTo(
    u.minus(n).exponentiatedBy(2).plus(a.minus(r).exponentiatedBy(2)).times(i)
  ) : tt(!1);
  return (t, n, r) => {
    const u = t.x, a = t.y, f = r.x, E = r.y, p = a.minus(E).times(n.x.minus(f)).minus(u.minus(f).times(n.y.minus(E)));
    return e(p, u, a, f, E) ? 0 : p.comparedTo(0);
  };
}
var ht = (i) => i, at = (i) => {
  if (i) {
    const e = new Ee(Ce(i)), t = new Ee(Ce(i)), n = (u, a) => a.addAndReturn(u), r = (u) => ({
      x: n(u.x, e),
      y: n(u.y, t)
    });
    return r({ x: new te(0), y: new te(0) }), r;
  }
  return ht;
}, Be = (i) => ({
  set: (e) => {
    re = Be(e);
  },
  reset: () => Be(i),
  compare: Ce(i),
  snap: at(i),
  orient: ft(i)
}), re = Be(), ae = (i, e) => i.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(i.ur.x) && i.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(i.ur.y), ke = (i, e) => {
  if (e.ur.x.isLessThan(i.ll.x) || i.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(i.ll.y) || i.ur.y.isLessThan(e.ll.y))
    return null;
  const t = i.ll.x.isLessThan(e.ll.x) ? e.ll.x : i.ll.x, n = i.ur.x.isLessThan(e.ur.x) ? i.ur.x : e.ur.x, r = i.ll.y.isLessThan(e.ll.y) ? e.ll.y : i.ll.y, u = i.ur.y.isLessThan(e.ur.y) ? i.ur.y : e.ur.y;
  return { ll: { x: t, y: r }, ur: { x: n, y: u } };
}, xe = (i, e) => i.x.times(e.y).minus(i.y.times(e.x)), it = (i, e) => i.x.times(e.x).plus(i.y.times(e.y)), ve = (i) => it(i, i).sqrt(), ct = (i, e, t) => {
  const n = { x: e.x.minus(i.x), y: e.y.minus(i.y) }, r = { x: t.x.minus(i.x), y: t.y.minus(i.y) };
  return xe(r, n).div(ve(r)).div(ve(n));
}, pt = (i, e, t) => {
  const n = { x: e.x.minus(i.x), y: e.y.minus(i.y) }, r = { x: t.x.minus(i.x), y: t.y.minus(i.y) };
  return it(r, n).div(ve(r)).div(ve(n));
}, Ue = (i, e, t) => e.y.isZero() ? null : { x: i.x.plus(e.x.div(e.y).times(t.minus(i.y))), y: t }, ze = (i, e, t) => e.x.isZero() ? null : { x: t, y: i.y.plus(e.y.div(e.x).times(t.minus(i.x))) }, gt = (i, e, t, n) => {
  if (e.x.isZero()) return ze(t, n, i.x);
  if (n.x.isZero()) return ze(i, e, t.x);
  if (e.y.isZero()) return Ue(t, n, i.y);
  if (n.y.isZero()) return Ue(i, e, t.y);
  const r = xe(e, n);
  if (r.isZero()) return null;
  const u = { x: t.x.minus(i.x), y: t.y.minus(i.y) }, a = xe(u, e).div(r), f = xe(u, n).div(r), E = i.x.plus(f.times(e.x)), p = t.x.plus(a.times(n.x)), _ = i.y.plus(f.times(e.y)), T = t.y.plus(a.times(n.y)), b = E.plus(p).div(2), A = _.plus(T).div(2);
  return { x: b, y: A };
}, ee = class nt {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, t) {
    const n = nt.comparePoints(e.point, t.point);
    return n !== 0 ? n : (e.point !== t.point && e.link(t), e.isLeft !== t.isLeft ? e.isLeft ? 1 : -1 : Se.compare(e.segment, t.segment));
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
        sine: ct(this.point, e.point, u.point),
        cosine: pt(this.point, e.point, u.point)
      });
    };
    return (r, u) => {
      t.has(r) || n(r), t.has(u) || n(u);
      const { sine: a, cosine: f } = t.get(r), { sine: E, cosine: p } = t.get(u);
      return a.isGreaterThanOrEqualTo(0) && E.isGreaterThanOrEqualTo(0) ? f.isLessThan(p) ? 1 : f.isGreaterThan(p) ? -1 : 0 : a.isLessThan(0) && E.isLessThan(0) ? f.isLessThan(p) ? -1 : f.isGreaterThan(p) ? 1 : 0 : E.isLessThan(a) ? -1 : E.isGreaterThan(a) ? 1 : 0;
    };
  }
}, yt = class Ge {
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
      const p = [f], _ = f.point, T = [];
      for (; a = f, f = E, p.push(f), f.point !== _; )
        for (; ; ) {
          const b = f.getAvailableLinkedEvents();
          if (b.length === 0) {
            const O = p[0].point, B = p[p.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${O.x}, \${O.y}]. Last matching segment found ends at [\${B.x}, \${B.y}].\`
            );
          }
          if (b.length === 1) {
            E = b[0].otherSE;
            break;
          }
          let A = null;
          for (let O = 0, B = T.length; O < B; O++)
            if (T[O].point === f.point) {
              A = O;
              break;
            }
          if (A !== null) {
            const O = T.splice(A)[0], B = p.splice(O.index);
            B.unshift(B[0].otherSE), t.push(new Ge(B.reverse()));
            continue;
          }
          T.push({
            index: p.length,
            point: f.point
          });
          const N = f.getLeftmostComparator(a);
          E = b.sort(N)[0].otherSE;
          break;
        }
      t.push(new Ge(p));
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
      const T = this.events[p].point, b = this.events[p + 1].point;
      re.orient(T, e, b) !== 0 && (t.push(T), e = T);
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
}, $e = class {
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
}, dt = class {
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
        if (r.isExteriorRing()) e.push(new $e(r));
        else {
          const u = r.enclosingRing();
          u?.poly || e.push(new $e(u)), u?.poly?.addInterior(r);
        }
    }
    return e;
  }
}, mt = class {
  queue;
  tree;
  segments;
  constructor(i, e = Se.compare) {
    this.queue = i, this.tree = new Ee(e), this.segments = [];
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
}, xt = class {
  type;
  numMultiPolys;
  run(i, e, t) {
    pe.type = i;
    const n = [new je(e, !0)];
    for (let p = 0, _ = t.length; p < _; p++)
      n.push(new je(t[p], !1));
    if (pe.numMultiPolys = n.length, pe.type === "difference") {
      const p = n[0];
      let _ = 1;
      for (; _ < n.length; )
        ke(n[_].bbox, p.bbox) !== null ? _++ : n.splice(_, 1);
    }
    if (pe.type === "intersection")
      for (let p = 0, _ = n.length; p < _; p++) {
        const T = n[p];
        for (let b = p + 1, A = n.length; b < A; b++)
          if (ke(T.bbox, n[b].bbox) === null) return [];
      }
    const r = new Ee(ee.compare);
    for (let p = 0, _ = n.length; p < _; p++) {
      const T = n[p].getSweepEvents();
      for (let b = 0, A = T.length; b < A; b++)
        r.add(T[b]);
    }
    const u = new mt(r);
    let a = null;
    for (r.size != 0 && (a = r.first(), r.delete(a)); a; ) {
      const p = u.process(a);
      for (let _ = 0, T = p.length; _ < T; _++) {
        const b = p[_];
        b.consumedBy === void 0 && r.add(b);
      }
      r.size != 0 ? (a = r.first(), r.delete(a)) : a = null;
    }
    re.reset();
    const f = yt.factory(u.segments);
    return new dt(f).getGeom();
  }
}, pe = new xt(), qe = pe, wt = 0, Se = class we {
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
      const T = e.comparePoint(t.leftSE.point);
      if (T < 0) return 1;
      if (T > 0) return -1;
      const b = t.comparePoint(e.rightSE.point);
      return b !== 0 ? b : -1;
    }
    if (n.isGreaterThan(r)) {
      if (f.isLessThan(E) && f.isLessThan(_)) return -1;
      if (f.isGreaterThan(E) && f.isGreaterThan(_)) return 1;
      const T = t.comparePoint(e.leftSE.point);
      if (T !== 0) return T;
      const b = e.comparePoint(t.rightSE.point);
      return b < 0 ? 1 : b > 0 ? -1 : 1;
    }
    if (f.isLessThan(E)) return -1;
    if (f.isGreaterThan(E)) return 1;
    if (u.isLessThan(a)) {
      const T = t.comparePoint(e.rightSE.point);
      if (T !== 0) return T;
    }
    if (u.isGreaterThan(a)) {
      const T = e.comparePoint(t.rightSE.point);
      if (T < 0) return 1;
      if (T > 0) return -1;
    }
    if (!u.eq(a)) {
      const T = p.minus(f), b = u.minus(n), A = _.minus(E), N = a.minus(r);
      if (T.isGreaterThan(b) && A.isLessThan(N)) return 1;
      if (T.isLessThan(b) && A.isGreaterThan(N)) return -1;
    }
    return u.isGreaterThan(a) ? 1 : u.isLessThan(a) || p.isLessThan(_) ? -1 : p.isGreaterThan(_) ? 1 : e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, t, n, r) {
    this.id = ++wt, this.leftSE = e, e.segment = this, e.otherSE = t, this.rightSE = t, t.segment = this, t.otherSE = e, this.rings = n, this.windings = r;
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
    return new we(E, p, [n], [a]);
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
    const t = this.bbox(), n = e.bbox(), r = ke(t, n);
    if (r === null) return null;
    const u = this.leftSE.point, a = this.rightSE.point, f = e.leftSE.point, E = e.rightSE.point, p = ae(t, f) && this.comparePoint(f) === 0, _ = ae(n, u) && e.comparePoint(u) === 0, T = ae(t, E) && this.comparePoint(E) === 0, b = ae(n, a) && e.comparePoint(a) === 0;
    if (_ && p)
      return b && !T ? a : !b && T ? E : null;
    if (_)
      return T && u.x.eq(E.x) && u.y.eq(E.y) ? null : u;
    if (p)
      return b && a.x.eq(f.x) && a.y.eq(f.y) ? null : f;
    if (b && T) return null;
    if (b) return a;
    if (T) return E;
    const A = gt(u, this.vector(), f, e.vector());
    return A === null || !ae(r, A) ? null : re.snap(A);
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
    const f = new we(
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
    const r = we.compare(t, n);
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
      const p = this.rings[f], _ = this.windings[f], T = t.indexOf(p);
      T === -1 ? (t.push(p), n.push(_)) : n[T] += _;
    }
    const u = [], a = [];
    for (let f = 0, E = t.length; f < E; f++) {
      if (n[f] === 0) continue;
      const p = t[f], _ = p.poly;
      if (a.indexOf(_) === -1)
        if (p.isExterior) u.push(_);
        else {
          a.indexOf(_) === -1 && a.push(_);
          const T = u.indexOf(p.poly);
          T !== -1 && u.splice(T, 1);
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
}, Ve = class {
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
      f.x.eq(r.x) && f.y.eq(r.y) || (this.segments.push(Se.fromRing(r, f, this)), f.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = f.x), f.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = f.y), f.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = f.x), f.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = f.y), r = f);
    }
    (!n.x.eq(r.x) || !n.y.eq(r.y)) && this.segments.push(Se.fromRing(r, n, this));
  }
  getSweepEvents() {
    const i = [];
    for (let e = 0, t = this.segments.length; e < t; e++) {
      const n = this.segments[e];
      i.push(n.leftSE), i.push(n.rightSE);
    }
    return i;
  }
}, Et = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(i, e) {
    if (!Array.isArray(i))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new Ve(i[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let t = 1, n = i.length; t < n; t++) {
      const r = new Ve(i[t], this, !1);
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
}, je = class {
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
      const r = new Et(i[t], this);
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
}, vt = (i, ...e) => qe.run("union", i, e);
re.set;
var Ke = 63710088e-1;
function be(i, e, t = {}) {
  const n = { type: "Feature" };
  return (t.id === 0 || t.id) && (n.id = t.id), t.bbox && (n.bbox = t.bbox), n.properties = e || {}, n.geometry = i, n;
}
function St(i, e, t = {}) {
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
  return be({
    type: "Polygon",
    coordinates: i
  }, e, t);
}
function bt(i, e = {}) {
  const t = { type: "FeatureCollection" };
  return e.id && (t.id = e.id), e.bbox && (t.bbox = e.bbox), t.features = i, t;
}
function Tt(i, e, t = {}) {
  return be({
    type: "MultiPolygon",
    coordinates: i
  }, e, t);
}
function Fe(i, e) {
  var t, n, r, u, a, f, E, p, _, T, b = 0, A = i.type === "FeatureCollection", N = i.type === "Feature", O = A ? i.features.length : 1;
  for (t = 0; t < O; t++) {
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
    ) : void 0, T = A ? (
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
            b,
            p,
            _,
            T
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
              b,
              p,
              _,
              T
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
                b,
                p,
                _,
                T
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    b++;
  }
}
function _t(i, e, t) {
  var n = t;
  return Fe(
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
function Rt(i, e) {
  Fe(i, function(t, n, r, u, a) {
    var f = t === null ? null : t.type;
    switch (f) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            be(t, r, { bbox: u, id: a }),
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
      var _ = t.coordinates[p], T = {
        type: E,
        coordinates: _
      };
      if (
        // @ts-expect-error: Known type conflict
        e(be(T, r), n, p) === !1
      )
        return !1;
    }
  });
}
function Mt(i, e = {}) {
  const t = [];
  if (Fe(i, (r) => {
    t.push(r.coordinates);
  }), t.length < 2)
    throw new Error("Must have at least 2 geometries");
  const n = vt(t[0], ...t.slice(1));
  return n.length === 0 ? null : n.length === 1 ? St(n[0], e.properties) : Tt(n, e.properties);
}
function Xe(i) {
  if (!i) throw new Error("geojson is required");
  var e = [];
  return Rt(i, function(t) {
    e.push(t);
  }), bt(e);
}
class Pt {
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
function Ot(i, e = 1, t = !1) {
  let n = 1 / 0, r = 1 / 0, u = -1 / 0, a = -1 / 0;
  for (const [k, S] of i[0])
    k < n && (n = k), S < r && (r = S), k > u && (u = k), S > a && (a = S);
  const f = u - n, E = a - r, p = Math.max(e, Math.min(f, E));
  if (p === e) {
    const k = [n, r];
    return k.distance = 0, k;
  }
  const _ = new Pt([], (k, S) => S.max - k.max);
  let T = Lt(i);
  const b = new Te(n + f / 2, r + E / 2, 0, i);
  b.d > T.d && (T = b);
  let A = 2;
  function N(k, S, Z) {
    const J = new Te(k, S, Z, i);
    A++, J.max > T.d + e && _.push(J), J.d > T.d && (T = J, t && console.log(\`found best \${Math.round(1e4 * J.d) / 1e4} after \${A} probes\`));
  }
  let O = p / 2;
  for (let k = n; k < u; k += p)
    for (let S = r; S < a; S += p)
      N(k + O, S + O, O);
  for (; _.length; ) {
    const { max: k, x: S, y: Z, h: J } = _.pop();
    if (k - T.d <= e) break;
    O = J / 2, N(S - O, Z - O, O), N(S + O, Z - O, O), N(S - O, Z + O, O), N(S + O, Z + O, O);
  }
  t && console.log(\`num probes: \${A}
best distance: \${T.d}\`);
  const B = [T.x, T.y];
  return B.distance = T.d, B;
}
function Te(i, e, t, n) {
  this.x = i, this.y = e, this.h = t, this.d = At(i, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function At(i, e, t) {
  let n = !1, r = 1 / 0;
  for (const u of t)
    for (let a = 0, f = u.length, E = f - 1; a < f; E = a++) {
      const p = u[a], _ = u[E];
      p[1] > e != _[1] > e && i < (_[0] - p[0]) * (e - p[1]) / (_[1] - p[1]) + p[0] && (n = !n), r = Math.min(r, It(i, e, p, _));
    }
  return r === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(r);
}
function Lt(i) {
  let e = 0, t = 0, n = 0;
  const r = i[0];
  for (let a = 0, f = r.length, E = f - 1; a < f; E = a++) {
    const p = r[a], _ = r[E], T = p[0] * _[1] - _[0] * p[1];
    t += (p[0] + _[0]) * T, n += (p[1] + _[1]) * T, e += T * 3;
  }
  const u = new Te(t / e, n / e, 0, i);
  return e === 0 || u.d < 0 ? new Te(r[0][0], r[0][1], 0, i) : u;
}
function It(i, e, t, n) {
  let r = t[0], u = t[1], a = n[0] - r, f = n[1] - u;
  if (a !== 0 || f !== 0) {
    const E = ((i - r) * a + (e - u) * f) / (a * a + f * f);
    E > 1 ? (r = n[0], u = n[1]) : E > 0 && (r += a * E, u += f * E);
  }
  return a = i - r, f = e - u, a * a + f * f;
}
function Ye(i) {
  return _t(
    i,
    (e, t) => e + Nt(t),
    0
  );
}
function Nt(i) {
  let e = 0, t;
  switch (i.type) {
    case "Polygon":
      return He(i.coordinates);
    case "MultiPolygon":
      for (t = 0; t < i.coordinates.length; t++)
        e += He(i.coordinates[t]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function He(i) {
  let e = 0;
  if (i && i.length > 0) {
    e += Math.abs(We(i[0]));
    for (let t = 1; t < i.length; t++)
      e -= Math.abs(We(i[t]));
  }
  return e;
}
var Ct = Ke * Ke / 2, Le = Math.PI / 180;
function We(i) {
  const e = i.length - 1;
  if (e <= 2) return 0;
  let t = 0, n = 0;
  for (; n < e; ) {
    const r = i[n], u = i[n + 1 === e ? 0 : n + 1], a = i[n + 2 >= e ? (n + 2) % e : n + 2], f = r[0] * Le, E = u[1] * Le, p = a[0] * Le;
    t += (p - f) * Math.sin(E), n++;
  }
  return t * Ct;
}
const Ie = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ new WeakMap(), Bt = (i, e) => {
  try {
    if (i.geometry.type !== "Polygon")
      throw new Error("Non-Polygon geometry");
    if (i && typeof i == "object") {
      let u = Ie.get(i);
      const a = e === void 0 ? "__default" : String(e);
      if (u && u.has(a))
        return u.get(a);
    }
    const t = i && i.geometry && i.geometry.coordinates;
    let n = Ot(t, e);
    if (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1]))
      throw new Error("Invalid polylabel result");
    const r = {
      type: "Point",
      coordinates: [n[0], n[1]]
    };
    if (i && typeof i == "object") {
      let u = Ie.get(i);
      u || (u = /* @__PURE__ */ new Map(), Ie.set(i, u)), u.set(e === void 0 ? "__default" : String(e), r);
    }
    return r;
  } catch {
    return console.log("Invalid feature geometry", i && i.id), pointOnFeature(i).geometry;
  }
}, me = (i) => {
  if (!i) return 0;
  let e = 0;
  for (let t = 0; t < i.length; t++) {
    const n = (t + 1) % i.length;
    e += i[t][0] * i[n][1], e -= i[n][0] * i[t][1];
  }
  return Math.abs(e) / 2;
}, kt = (i, e) => {
  try {
    if (i && typeof i == "object") {
      let t = Ze.get(i);
      const n = e === "meters" ? "meters" : e || "__planar";
      if (t && t.has(n))
        return t.get(n);
      let r;
      if (e === "meters")
        r = Ye(i);
      else {
        const u = i && i.geometry;
        if (!u || u.type !== "Polygon")
          r = 0;
        else {
          const a = u && u.coordinates;
          let f = me(a[0]);
          for (let E = 1; E < a.length; E++)
            f -= me(a[E]);
          r = f;
        }
      }
      return t || (t = /* @__PURE__ */ new Map(), Ze.set(i, t)), t.set(n, r), r;
    } else {
      if (e === "meters")
        return Ye(i);
      {
        const t = i && i.geometry;
        if (!t || t.type !== "Polygon") return 0;
        const n = t && t.coordinates;
        let r = me(n[0]);
        for (let u = 1; u < n.length; u++)
          r -= me(n[u]);
        return r;
      }
    }
  } catch (t) {
    return console.log("Error computing area for feature", i && i.id, t), 0;
  }
};
var le, ue, Gt = (i) => {
  if (i instanceof Uint8Array) return i;
  if (ArrayBuffer.isView(i)) return new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  if (i instanceof ArrayBuffer) return new Uint8Array(i);
  const e = JSON.stringify(i), t = le !== void 0 ? le === !1 ? null : le : typeof TextEncoder < "u" ? le = new TextEncoder() : typeof Buffer < "u" && typeof Buffer.from == "function" ? le = { encode: (n) => new Uint8Array(Buffer.from(n)) } : (le = !1, null);
  if (t && typeof t.encode == "function") return t.encode(e);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, qt = (i) => {
  let e;
  if (i instanceof Uint8Array) e = i;
  else if (ArrayBuffer.isView(i)) e = new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  else if (i instanceof ArrayBuffer) e = new Uint8Array(i);
  else {
    if (typeof Buffer > "u" || typeof Buffer.isBuffer != "function" || !Buffer.isBuffer(i)) throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
    e = new Uint8Array(i);
  }
  const t = ue !== void 0 ? ue === !1 ? null : ue : typeof TextDecoder < "u" ? ue = new TextDecoder() : typeof Buffer < "u" && typeof Buffer.from == "function" ? ue = { decode: (n) => Buffer.from(n).toString("utf8") } : (ue = !1, null);
  if (t && typeof t.decode == "function") return JSON.parse(t.decode(e));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(e));
  throw new Error("No TextDecoder or Buffer available to decode object");
}, Je = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function") try {
  const i = Number(process.hrtime.bigint() / 1000000n);
  Je = Date.now() - i;
} catch {
  Je = null;
}
const Ne = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
Ne.onmessage = (i) => {
  const e = i.data, t = qt(e), n = Object.values(t.pieces), r = t.tolerance || 1e-5, u = t.unit || "meters";
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
      features: E.reduce((b, A) => [...b, ...A.features], []).filter((b) => b.geometry.type === "Polygon")
    };
    if (p.features.some((b) => b.geometry.type === "MultiPolygon") && (p = Xe(p)), p.features.some((b) => b.properties.clipped) && p.features.length > 1) {
      let b = {
        type: "FeatureCollection",
        features: p.features.filter((N) => N.properties.clipped)
      };
      const A = p.features.filter((N) => !N.properties.clipped);
      if (b.features.length > 1) {
        const { clipped: N, ...O } = p.features[0].properties;
        O._index = b.features.map((B) => B.properties._index).sort().join("-"), b = Mt(b), b = {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: b.geometry,
            properties: O
          }]
        };
      }
      p = {
        type: "FeatureCollection",
        features: [...A, ...b.features]
      };
    }
    p.features.some((b) => b.geometry.type === "MultiPolygon") && (p = Xe(p)), p.features = p.features.map((b, A) => {
      const N = \`\${f}-\${A}\`, O = b.geometry, B = b.properties;
      if (O && O.type === "Polygon") {
        const k = kt(b, u);
        b.geometry = Bt(b, r), b.properties = { ...B, _area: k, _groupId: f };
      } else
        console.log("Unexpected geometry type after union/simplify/flatten for id:" + f + " - type:" + (O && O.type)), b.properties = { ...B, _area: 0, _groupId: f };
      return b.id = N, b;
    });
    const _ = Math.max(...p.features.map((b) => b.properties && b.properties._area || 0));
    p.features = p.features.map((b) => (b.properties && b.properties._area != null && b.properties._area > 0 ? (b.properties._localSortKey = _ / b.properties._area, b.properties._globalSortKey = 1 / b.properties._area) : (b.properties._localSortKey = 1 / 0, b.properties._globalSortKey = 1 / 0), b)), p.id = f;
    const T = Gt(p).buffer;
    Ne.postMessage(T, [T]);
  }
  Ne.postMessage({ type: "commit" });
};
`, R = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", U], { type: "text/javascript;charset=utf-8" });
function F(e) {
  let t;
  try {
    if (t = R && (self.URL || self.webkitURL).createObjectURL(R), !t) throw "";
    const n = new Worker(t, {
      type: "module",
      name: e?.name
    });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), n;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(U),
      {
        type: "module",
        name: e?.name
      }
    );
  }
}
var w, b, E = (e) => {
  if (e instanceof Uint8Array) return e;
  if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  const t = JSON.stringify(e), n = w !== void 0 ? w === !1 ? null : w : typeof TextEncoder < "u" ? w = new TextEncoder() : typeof Buffer < "u" && typeof Buffer.from == "function" ? w = { encode: (r) => new Uint8Array(Buffer.from(r)) } : (w = !1, null);
  if (n && typeof n.encode == "function") return n.encode(t);
  throw new Error("No TextEncoder or Buffer available to encode object");
}, P = (e) => {
  let t;
  if (e instanceof Uint8Array) t = e;
  else if (ArrayBuffer.isView(e)) t = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  else if (e instanceof ArrayBuffer) t = new Uint8Array(e);
  else {
    if (typeof Buffer > "u" || typeof Buffer.isBuffer != "function" || !Buffer.isBuffer(e)) throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
    t = new Uint8Array(e);
  }
  const n = b !== void 0 ? b === !1 ? null : b : typeof TextDecoder < "u" ? b = new TextDecoder() : typeof Buffer < "u" && typeof Buffer.from == "function" ? b = { decode: (r) => Buffer.from(r).toString("utf8") } : (b = !1, null);
  if (n && typeof n.decode == "function") return JSON.parse(n.decode(t));
  if (typeof TextDecoder < "u") return JSON.parse(new TextDecoder().decode(t));
  throw new Error("No TextDecoder or Buffer available to decode object");
}, I = class {
  constructor({ maxEntries: e = 1 / 0, maxWeight: t = 1 / 0, weightFn: n = () => 1, defaultTTL: r = 6e4, maxPoolSize: s = 1e3, rejectOversized: i = !1, onEvict: a = null, onExpire: o = null, initialPoolSize: h = 0, maxCleanupPerTick: u = 100, eagerCleanupOnRead: l = !1 } = {}) {
    this.maxEntries = e, this.maxWeight = t, this.weightFn = n, this.defaultTTL = r, this.maxPoolSize = s, this.rejectOversized = !!i, this.onEvict = typeof a == "function" ? a : null, this.onExpire = typeof o == "function" ? o : null, this.maxCleanupPerTick = Number.isFinite(+u) ? Math.max(1, +u) : 100, this.eagerCleanupOnRead = !!l, this.map = /* @__PURE__ */ new Map(), this.head = null, this.tail = null, this.pool = [];
    for (let c = 0; c < Math.min(h || 0, this.maxPoolSize); c++) this.pool.push({ key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null });
    this.currentWeight = 0, this.hits = 0, this.misses = 0, this.evictions = 0, this.rejected = 0, this.expirations = 0, this._cleanupTimer = null, this._cleanupRunning = !1, this._cleanupParams = null, this._cleanupCursor = null, this._cleanupCursorValid = !1, this._inflightPromises = /* @__PURE__ */ new Map();
  }
  _allocNode(e, t, n, r) {
    const s = this.pool.pop() || { key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null };
    return s.key = e, s.value = t, s.weight = n || 0, s.expiresAt = r || 0, s.prev = null, s.next = null, s;
  }
  _freeNode(e) {
    e.key = null, e.value = null, e.weight = 0, e.expiresAt = 0, e.prev = null, e.next = null, this.pool.length < this.maxPoolSize && this.pool.push(e);
  }
  _removeExpiredNode(e, t, n = !1) {
    if (!e || !e.expiresAt || e.expiresAt > t) return !1;
    const r = e.key, s = e.value, i = e.next;
    this.map.delete(r), this.currentWeight -= e.weight || 0, this._cleanupCursor === e && (this._cleanupCursor = i), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(e);
    try {
      this.onExpire && this.onExpire(r, s);
    } catch {
    }
    return this._freeNode(e), n && this.misses++, this.expirations++, !0;
  }
  _fetchValidNode(e, { ignoreExpiry: t = !1, countMiss: n = !1, allowExpired: r = !1 } = {}) {
    const s = this.map.get(e);
    return s ? !t && s.expiresAt && s.expiresAt <= Date.now() ? r ? s : (this._removeExpiredNode(s, Date.now(), n), null) : s : (n && this.misses++, null);
  }
  _refreshStaleEntry(e, t, { ttl: n, weight: r } = {}) {
    if (this._inflightPromises.has(e)) return;
    let s;
    try {
      s = Promise.resolve().then(() => t());
    } catch {
      return;
    }
    const i = s.then((a) => {
      try {
        this.set(e, a, { ttl: n, weight: r });
      } catch {
      }
      return this._inflightPromises.delete(e), a;
    }, (a) => {
      this._inflightPromises.delete(e);
    });
    this._inflightPromises.set(e, i);
  }
  _append(e) {
    this.tail ? (e.prev = this.tail, e.next = null, this.tail.next = e, this.tail = e) : this.head = this.tail = e;
  }
  _remove(e) {
    const t = e.prev, n = e.next;
    t ? t.next = n : this.head = n, n ? n.prev = t : this.tail = t, e.prev = e.next = null;
  }
  _moveToTail(e) {
    this.tail !== e && (this._remove(e), this._append(e));
  }
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
  set(e, t, { ttl: n = this.defaultTTL, weight: r = null } = {}) {
    const s = n == null || n === 1 / 0 ? 0 : Date.now() + n;
    let i;
    if (r != null) i = r;
    else {
      try {
        i = this.weightFn(t);
      } catch {
        i = 0;
      }
      i == null && (i = 0);
    }
    const a = Number.isFinite(+i) ? Math.max(0, +i) : 0;
    if (this.rejectOversized && Number.isFinite(this.maxWeight) && a > this.maxWeight) {
      this.rejected++;
      try {
        this.onEvict && this.onEvict(e, t, "rejected-oversized");
      } catch {
      }
      return !1;
    }
    if (this.map.has(e)) {
      const o = this.map.get(e);
      this.currentWeight -= o.weight || 0, o.value = t, o.weight = a, o.expiresAt = s, this.currentWeight += o.weight || 0, this._moveToTail(o);
    } else {
      const o = this._allocNode(e, t, a, s);
      this.map.set(e, o), this._append(o), this.currentWeight += o.weight || 0, this._evictIfNeeded();
    }
    return this;
  }
  get(e) {
    const t = this._fetchValidNode(e, { countMiss: !0 });
    if (t) return this._moveToTail(t), this.hits++, t.value;
  }
  peek(e) {
    const t = this._fetchValidNode(e);
    return t ? t.value : void 0;
  }
  has(e, { ignoreExpiry: t = !1 } = {}) {
    return !!this._fetchValidNode(e, { ignoreExpiry: t });
  }
  getOrSet(e, t, { ttl: n, weight: r, staleWhileRevalidate: s = !1 } = {}) {
    const i = Date.now(), a = this._fetchValidNode(e, { countMiss: !1, allowExpired: s });
    if (a) {
      if (!(a.expiresAt && a.expiresAt <= i)) return this._moveToTail(a), this.hits++, a.value;
      if (typeof t == "function") return this._moveToTail(a), this.hits++, this._refreshStaleEntry(e, t, { ttl: n, weight: r }), a.value;
      this._removeExpiredNode(a, i, !0);
    } else this.misses++;
    if (typeof t == "function") {
      const o = t();
      return o && typeof o.then == "function" ? o.then((h) => {
        try {
          this.set(e, h, { ttl: n, weight: r });
        } catch {
        }
        return h;
      }) : (this.set(e, o, { ttl: n, weight: r }), o);
    }
    return this.set(e, t, { ttl: n, weight: r }), t;
  }
  setMany(e, { ttl: t, weight: n } = {}) {
    const r = t == null || t === 1 / 0 ? 0 : Date.now() + t;
    for (const s of e) {
      if (!s) continue;
      const [i, a] = s;
      let o;
      if (n != null) o = n;
      else {
        try {
          o = this.weightFn(a);
        } catch {
          o = 0;
        }
        o == null && (o = 0);
      }
      const h = Number.isFinite(+o) ? Math.max(0, +o) : 0;
      if (this.map.has(i)) {
        const u = this.map.get(i);
        this.currentWeight -= u.weight || 0, u.value = a, u.weight = h, u.expiresAt = r, this.currentWeight += u.weight || 0, this._moveToTail(u);
      } else {
        const u = this._allocNode(i, a, h, r);
        this.map.set(i, u), this._append(u), this.currentWeight += u.weight || 0;
      }
    }
    return this._evictIfNeeded(), this;
  }
  getMany(e, { ignoreExpiry: t = !1 } = {}) {
    const n = /* @__PURE__ */ new Map();
    for (const r of e) {
      const s = this._fetchValidNode(r, { ignoreExpiry: t, countMiss: !0 });
      s && (this._moveToTail(s), this.hits++, n.set(r, s.value));
    }
    return n;
  }
  touch(e, t = void 0) {
    const n = this._fetchValidNode(e);
    if (!n) return !1;
    const r = Date.now();
    return t !== void 0 && (n.expiresAt = t == null || t === 1 / 0 ? 0 : r + t), this._moveToTail(n), !0;
  }
  getOrSetAsync(e, t, { ttl: n, weight: r, staleWhileRevalidate: s = !1 } = {}) {
    if (typeof t != "function") return Promise.resolve(this.getOrSet(e, t, { ttl: n, weight: r }));
    const i = Date.now(), a = this.map.get(e);
    if (a) {
      if (!(a.expiresAt && a.expiresAt <= i)) return this._moveToTail(a), this.hits++, Promise.resolve(a.value);
      if (s) return this._moveToTail(a), this.hits++, this._refreshStaleEntry(e, t, { ttl: n, weight: r }), Promise.resolve(a.value);
      this._removeExpiredNode(a, i, !1);
    }
    if (this._inflightPromises.has(e)) return this._inflightPromises.get(e);
    let o;
    this.misses++;
    try {
      o = Promise.resolve().then(() => t());
    } catch (u) {
      return Promise.reject(u);
    }
    const h = o.then((u) => {
      try {
        this.set(e, u, { ttl: n, weight: r });
      } catch {
      }
      return this._inflightPromises.delete(e), u;
    }, (u) => {
      throw this._inflightPromises.delete(e), u;
    });
    return this._inflightPromises.set(e, h), h;
  }
  hasEqual(e, t, { ignoreExpiry: n = !1, seen: r } = {}) {
    const s = this._fetchValidNode(e, { ignoreExpiry: n });
    if (!s) return !1;
    const i = s.value;
    return i === t || (typeof i != "object" || i === null || typeof t != "object" || t === null ? i === t : k(i, t, r));
  }
  hasEqualWithSeen(e, t, n, { ignoreExpiry: r = !1 } = {}) {
    return this.hasEqual(e, t, { ignoreExpiry: r, seen: n });
  }
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
  clear() {
    for (let e = this.head; e; ) {
      const t = e.next;
      this._freeNode(e), e = t;
    }
    this.head = this.tail = null, this.map.clear(), this.currentWeight = 0, this._cleanupCursor = null, this._cleanupCursorValid = !1;
  }
  cleanupExpired() {
    return this.cleanupExpiredUpTo();
  }
  cleanupExpiredUpTo(e = 1 / 0) {
    const t = Date.now();
    let n = 0, r = this._cleanupCursor && this._cleanupCursorValid ? this._cleanupCursor : this.head;
    for (; r && n < e; ) {
      const s = r.next;
      if (r.expiresAt && r.expiresAt <= t) {
        const i = r.key, a = r.value;
        this.map.delete(i), this.currentWeight -= r.weight || 0, this._cleanupCursor === r && (this._cleanupCursor = s), this._cleanupCursorValid = !!this._cleanupCursor, this._remove(r);
        try {
          this.onExpire && this.onExpire(i, a);
        } catch {
        }
        this._freeNode(r), this.expirations++;
      }
      r = s, n++;
    }
    return this._cleanupCursor = r || this.head, this._cleanupCursorValid = !!this._cleanupCursor, n;
  }
  startCleanup(e = {}) {
    let t, n;
    typeof e == "number" ? (t = e, n = this.maxCleanupPerTick) : (t = Number.isFinite(+e.interval) ? +e.interval : Math.max(1e3, Math.min(this.defaultTTL || 6e4, 6e4)), n = Number.isFinite(+e.maxCleanupPerTick) ? Math.max(1, +e.maxCleanupPerTick) : this.maxCleanupPerTick), this.stopCleanup(), this._cleanupParams = { interval: t, maxCleanupPerTick: n }, this._cleanupTimer = setTimeout(() => this._cleanupTick(), t);
  }
  stopCleanup() {
    this._cleanupTimer && (clearTimeout(this._cleanupTimer), this._cleanupTimer = null), this._cleanupRunning = !1, this._cleanupParams = null;
  }
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
  _cleanupTick() {
    if (this._cleanupTimer != null) if (this._cleanupRunning) this._cleanupTimer = setTimeout(() => this._cleanupTick(), this._cleanupParams.interval);
    else {
      this._cleanupRunning = !0;
      try {
        this.cleanupExpiredUpTo(this._cleanupParams.maxCleanupPerTick);
      } finally {
        this._cleanupRunning = !1;
      }
      this._cleanupTimer = setTimeout(() => this._cleanupTick(), this._cleanupParams.interval);
    }
  }
  get size() {
    return this.map.size;
  }
  get hitRate() {
    const e = (this.hits || 0) + (this.misses || 0);
    return e ? this.hits / e : 0;
  }
  stats() {
    return { size: this.size, weight: this.currentWeight, hits: this.hits, misses: this.misses, evictions: this.evictions, expirations: this.expirations, rejected: this.rejected, poolSize: this.pool.length };
  }
  resize({ maxEntries: e, maxWeight: t } = {}) {
    Number.isFinite(+e) && (this.maxEntries = Math.max(0, +e)), Number.isFinite(+t) && (this.maxWeight = Math.max(0, +t)), this._evictIfNeeded();
  }
  *entries(e = "MRU") {
    if (e === "MRU") for (let t = this.tail; t; t = t.prev) yield [t.key, t.value];
    else for (let t = this.head; t; t = t.next) yield [t.key, t.value];
  }
  [Symbol.iterator]() {
    return this.entries("MRU");
  }
  *keys(e = "MRU") {
    for (const [t] of this.entries(e)) yield t;
  }
  *values(e = "MRU") {
    for (const [, t] of this.entries(e)) yield t;
  }
};
function k(e, t, n = void 0) {
  if (e === t) return !0;
  if (e == null || t == null || typeof e != "object" || typeof t != "object") return e === t;
  n || (n = /* @__PURE__ */ new WeakMap());
  let r = n.get(e);
  if (r && r.has(t)) return !0;
  if (r || (r = /* @__PURE__ */ new WeakSet(), n.set(e, r)), r.add(t), Object.getPrototypeOf(e) !== Object.getPrototypeOf(t)) return !1;
  if (typeof Uint8Array < "u" && e instanceof Uint8Array) {
    if (!(t instanceof Uint8Array) || e.length !== t.length) return !1;
    for (let a = 0; a < e.length; a++) if (e[a] !== t[a]) return !1;
    return !0;
  }
  if (Array.isArray(e)) {
    if (!Array.isArray(t) || e.length !== t.length) return !1;
    for (let a = 0; a < e.length; a++) if (!k(e[a], t[a], n)) return !1;
    return !0;
  }
  if (ArrayBuffer.isView(e)) {
    if (!ArrayBuffer.isView(t) || e.byteLength !== t.byteLength) return !1;
    const a = new Uint8Array(e.buffer, e.byteOffset || 0, e.byteLength), o = new Uint8Array(t.buffer, t.byteOffset || 0, t.byteLength);
    for (let h = 0; h < a.length; h++) if (a[h] !== o[h]) return !1;
    return !0;
  }
  if (e instanceof ArrayBuffer) {
    if (!(t instanceof ArrayBuffer) || e.byteLength !== t.byteLength) return !1;
    const a = new Uint8Array(e), o = new Uint8Array(t);
    for (let h = 0; h < a.length; h++) if (a[h] !== o[h]) return !1;
    return !0;
  }
  if (e instanceof Date) return t instanceof Date && e.getTime() === t.getTime();
  if (e instanceof RegExp) return t instanceof RegExp && e.toString() === t.toString();
  if (e instanceof Map) {
    if (!(t instanceof Map) || e.size !== t.size) return !1;
    for (const [a, o] of e)
      if (!t.has(a) || !k(o, t.get(a), n)) return !1;
    return !0;
  }
  if (e instanceof Set) {
    if (!(t instanceof Set) || e.size !== t.size) return !1;
    let a = !0;
    for (const o of e) if (o !== null && typeof o == "object") {
      a = !1;
      break;
    }
    if (a) {
      for (const o of e) if (!t.has(o)) return !1;
      return !0;
    }
    for (const o of e) {
      let h = !1;
      for (const u of t) if (k(o, u, n)) {
        h = !0;
        break;
      }
      if (!h) return !1;
    }
    return !0;
  }
  const s = Object.keys(e), i = Object.keys(t);
  if (s.length !== i.length) return !1;
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    if (!Object.prototype.hasOwnProperty.call(t, o) || !k(e[o], t[o], n)) return !1;
  }
  return !0;
}
var S = null;
if (typeof process < "u" && process.hrtime && typeof process.hrtime.bigint == "function") try {
  const e = Number(process.hrtime.bigint() / 1000000n);
  S = Date.now() - e;
} catch {
  S = null;
}
var m = () => {
  const e = Date.now();
  if (typeof performance < "u" && typeof performance.now == "function" && typeof performance.timeOrigin == "number") try {
    const t = performance.timeOrigin + performance.now();
    return Math.abs(t - e) < 1e3 ? t : e;
  } catch {
  }
  if (S != null) try {
    const t = Number(process.hrtime.bigint() / 1000000n) + S;
    return Math.abs(t - e) < 1e3 ? t : e;
  } catch {
    return e;
  }
  return e;
}, T = class {
  constructor(e = 16) {
    const t = Math.max(2, Number(e) || 16);
    for (this._capacity = 1; this._capacity < t; ) this._capacity <<= 1;
    this._mask = this._capacity - 1, this._buffer = new Array(this._capacity), this._head = 0, this._tail = 0, this._size = 0;
  }
  push(e) {
    return this._size === this._capacity && this._grow(), this._buffer[this._tail] = e, this._tail = this._tail + 1 & this._mask, this._size++, this._size;
  }
  shift() {
    if (this._size === 0) return;
    const e = this._buffer[this._head];
    return this._buffer[this._head] = void 0, this._head = this._head + 1 & this._mask, this._size--, e;
  }
  peek() {
    return this._size === 0 ? void 0 : this._buffer[this._head];
  }
  clear() {
    if (this._size === 0) return;
    let e = this._head;
    for (let t = 0; t < this._size; t++) this._buffer[e] = void 0, e = e + 1 & this._mask;
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
  *[Symbol.iterator]() {
    let e = this._head;
    for (let t = 0; t < this._size; t++) yield this._buffer[e + t & this._mask];
  }
  values() {
    return this[Symbol.iterator]();
  }
  *keys() {
    for (let e = 0; e < this._size; e++) yield e;
  }
  *entries() {
    for (let e = 0; e < this._size; e++) yield [e, this._buffer[this._head + e & this._mask]];
  }
  *drain() {
    for (; this._size > 0; ) yield this.shift();
  }
  toArray() {
    const e = new Array(this._size);
    for (let t = 0; t < this._size; t++) e[t] = this._buffer[this._head + t & this._mask];
    return e;
  }
  _grow() {
    const e = this._buffer, t = this._capacity << 1, n = new Array(t);
    for (let r = 0; r < this._size; r++) n[r] = e[this._head + r & this._mask];
    this._buffer = n, this._capacity = t, this._mask = t - 1, this._head = 0, this._tail = this._size & this._mask;
  }
  pushMany(e) {
    if (!Array.isArray(e) || e.length === 0) return this._size;
    const t = this._size + e.length;
    for (; this._capacity < t; ) this._grow();
    const n = Math.min(e.length, this._capacity - this._tail);
    for (let s = 0; s < n; s++) this._buffer[this._tail + s] = e[s];
    this._tail = this._tail + n & this._mask;
    let r = n;
    for (; r < e.length; ) {
      const s = Math.min(e.length - r, this._capacity - this._tail);
      for (let i = 0; i < s; i++) this._buffer[this._tail + i] = e[r + i];
      this._tail = this._tail + s & this._mask, r += s;
    }
    return this._size = t, this._size;
  }
  unshiftMany(e) {
    if (!Array.isArray(e) || e.length === 0) return this._size;
    const t = this._size + e.length;
    for (; this._capacity < t; ) this._grow();
    let n = this._head - e.length & this._mask;
    for (let r = 0; r < e.length; r++) this._buffer[n + r & this._mask] = e[r];
    return this._head = n, this._size = t, this._size;
  }
};
function N(e) {
  return e && e.error ? `${e.code || "ERR"}: ${e.message || ""}` : String(e);
}
var z = class {
  constructor(e = 0, t = {}) {
    this._debugLevel = 0, this._counters = /* @__PURE__ */ Object.create(null), this._format = t && t.format || "text", this.name = t && t.name || null, this._formatter = t && typeof t.formatter == "function" ? t.formatter : null, this._output = t && typeof t.output == "function" ? t.output : null, this.setDebugLevel(e);
  }
  setDebugLevel(e) {
    let t = NaN;
    typeof e == "number" ? t = e : typeof e == "string" || typeof e == "boolean" ? t = Number(e) : (e instanceof Number || e instanceof String || e instanceof Boolean) && (t = Number(e.valueOf())), this._debugLevel = Number.isFinite(t) && t >= 0 ? Math.max(0, Math.min(3, Math.floor(t))) : 0;
  }
  getDebugLevel() {
    return this._debugLevel;
  }
  isDebugLevel(e = 1) {
    return Number(this._debugLevel) >= Number(e || 1);
  }
  isDebug() {
    return this.isDebugLevel(1);
  }
  _resolveLogArgs(e) {
    return e.map((t) => {
      if (typeof t == "function") try {
        return t();
      } catch (n) {
        return n;
      }
      return t;
    });
  }
  _emit(e, t, n, r, s = {}) {
    if (!this.isDebugLevel(e)) return;
    const i = this._resolveLogArgs(r);
    let a = { level: n, msg: s.msgArray ? i : i.length === 1 ? i[0] : i, ts: m(), format: this._format };
    if (this.name && (a.name = this.name), this._formatter) try {
      const o = this._formatter(a);
      if (o != null) {
        if (typeof o == "string") {
          if (this._output) {
            try {
              this._output(o);
            } catch {
            }
            return;
          }
          return void (console && console[t]);
        }
        a = o;
      }
    } catch {
    }
    if (this._output) try {
      this._output(a);
    } catch {
    }
    else if (console && typeof console[t] == "function" && this._format === "json") try {
      typeof a == "string" || JSON.stringify(a);
    } catch {
    }
  }
  error(...e) {
    const t = e.map((n) => {
      try {
        if (n && n.error) return N(n);
        if (n instanceof Error || n && typeof n == "object") return N((function(r, s = "ERR_ITEM") {
          return r && typeof r == "object" ? { error: !0, code: r.code || s, message: r.message, stack: r.stack } : { error: !0, code: s, message: r ? String(r) : void 0, stack: void 0 };
        })(n));
      } catch {
      }
      return n;
    });
    this._emit(1, "error", "error", t);
  }
  warn(...e) {
    this._emit(2, "warn", "warn", e);
  }
  info(...e) {
    this._emit(3, "info", "info", e);
  }
  log(...e) {
    this._emit(3, "log", "log", e);
  }
  debug(...e) {
    this._emit(3, "debug", "debug", e);
  }
  table(...e) {
    if (!(!this.isDebugLevel(3) || !console)) {
      if (this._format === "json") return void this._emit(3, "log", "table", e, { msgArray: !0 });
      this._resolveLogArgs(e);
    }
  }
  incrementCounter(e) {
    if (!this.isDebug()) return;
    const t = String(e || "");
    t && (this._counters[t] = (this._counters[t] || 0) + 1);
  }
  getDebugCounters() {
    return Object.assign({}, this._counters);
  }
  resetDebugCounters() {
    this._counters = /* @__PURE__ */ Object.create(null);
  }
}, D = /* @__PURE__ */ Symbol("PowerSubscriberSet.original"), x = class {
  constructor(e = {}) {
    const { weak: t = !1, maxListeners: n = 0 } = e || {};
    this._weak = !!t, this._maxListeners = Number.isFinite(Number(n)) ? Math.max(0, Math.floor(Number(n))) : 0, this._listeners = /* @__PURE__ */ new Set(), this._onceMap = /* @__PURE__ */ new WeakMap(), this._finalization = null, this._weak && typeof WeakRef < "u" && typeof FinalizationRegistry < "u" && (this._finalization = new FinalizationRegistry((r) => {
      this._listeners.delete(r.ref);
    }));
  }
  get size() {
    return this._cleanup(), this._listeners.size;
  }
  add(e) {
    if (typeof e != "function") {
      if (!this._weak || !e || typeof e.deref != "function") throw new TypeError("listener must be a function");
      if (this._maxListeners > 0 && this.size + 1 > this._maxListeners) throw new Error(`PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`);
      return this._listeners.add(e), () => this.delete(e);
    }
    if (this._maxListeners > 0 && this.size + 1 > this._maxListeners) throw new Error(`PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`);
    const t = this._makeEntry(e);
    return this._listeners.add(t), () => this.delete(e);
  }
  addOnce(e) {
    if (typeof e != "function") throw new TypeError("listener must be a function");
    const t = (...r) => {
      try {
        e(...r);
      } finally {
        this.delete(e);
      }
    };
    try {
      t[D] = e;
    } catch {
    }
    if (this._onceMap.set(e, t), this._maxListeners > 0 && this.size + 1 > this._maxListeners) throw new Error(`PowerSubscriberSet: adding listener exceeds maxListeners (${this._maxListeners})`);
    const n = this._makeEntry(t);
    return this._listeners.add(n), () => this.delete(e);
  }
  delete(e) {
    let t = e;
    const n = this._onceMap.get(e);
    n && (t = n, this._onceMap.delete(e));
    for (const r of this._listeners) {
      const s = this._deref(r);
      if (s) {
        if (s === t) return this._listeners.delete(r), this._finalization && typeof r.deref == "function" && this._finalization.unregister(r), !0;
      } else this._listeners.delete(r);
    }
    return !1;
  }
  forEach(e) {
    for (const t of this._listeners) {
      const n = this._deref(t);
      n ? e(n) : this._listeners.delete(t);
    }
  }
  clear() {
    this._listeners.clear(), this._onceMap = /* @__PURE__ */ new WeakMap();
  }
  values() {
    this._cleanup();
    const e = [];
    for (const t of this._listeners) {
      const n = this._deref(t);
      n && e.push(n);
    }
    return e;
  }
  [Symbol.iterator]() {
    return this.values()[Symbol.iterator]();
  }
  _cleanup() {
    if (this._weak && typeof WeakRef < "u") for (const e of this._listeners) e && typeof e.deref == "function" && !e.deref() && this._listeners.delete(e);
  }
  _makeEntry(e) {
    if (this._weak && typeof WeakRef < "u") {
      const t = new WeakRef(e);
      if (this._finalization) try {
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
};
function G(e) {
  if (e) if (typeof e.cleanup != "function") if (typeof e._cleanup != "function") {
    if (typeof e[Symbol.iterator] == "function" && typeof e.delete == "function") for (const t of e) (t && typeof t.deref == "function" ? t.deref() : t) || e.delete(t);
  } else try {
    e._cleanup();
  } catch {
  }
  else try {
    e.cleanup();
  } catch {
  }
}
var W = class {
  constructor(e = {}) {
    this._listeners = /* @__PURE__ */ new Map(), this._maxListeners = Number.isFinite(Number(e.maxListeners)) ? Math.max(0, Number(e.maxListeners)) : 0, this._weak = !!e.weak, this._fr = null, this._finalizationRefs = /* @__PURE__ */ new WeakMap();
  }
  _ensureFinalizationRegistry() {
    return this._weak && typeof FinalizationRegistry < "u" ? (this._fr || (this._fr = new FinalizationRegistry((e) => {
      try {
        const { event: t, ref: n } = e, r = this._listeners.get(t);
        r && typeof r.delete == "function" && r.delete(n.deref ? n.deref() : n);
      } catch {
      }
    })), this._fr) : null;
  }
  cleanup() {
    if (this._weak) for (const [e, t] of this._listeners) G(t), t.size === 0 && this._listeners.delete(e);
  }
  _getBucket(e) {
    let t = this._listeners.get(e);
    if (!t) return null;
    if (t instanceof x) return t;
    if (t && typeof t[Symbol.iterator] == "function") {
      const n = new x({ maxListeners: this._maxListeners, weak: this._weak });
      for (const r of t) {
        const s = r && typeof r.deref == "function" ? r.deref() : r;
        s && n.add(s);
      }
      return this._listeners.set(e, n), n;
    }
    return null;
  }
  _registerWeakListener(e, t) {
    const n = this._ensureFinalizationRegistry();
    if (!n || typeof WeakRef > "u") return null;
    const r = new WeakRef(e);
    try {
      n.register(e, { event: t, ref: r }, r), this._finalizationRefs.set(e, r);
    } catch {
      return null;
    }
    return r;
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
    let n = this._getBucket(e);
    n || (n = new x({ maxListeners: this._maxListeners, weak: this._weak }), this._listeners.set(e, n));
    const r = n.add(t);
    return this._registerWeakListener(t, e) ? () => {
      r(), this._unregisterWeakListener(t);
    } : r;
  }
  once(e, t) {
    if (typeof t != "function") throw new TypeError("listener must be a function");
    let n = this._getBucket(e);
    n || (n = new x({ maxListeners: this._maxListeners, weak: this._weak }), this._listeners.set(e, n));
    const r = n.addOnce(t);
    return this._registerWeakListener(t, e) ? () => {
      r(), this._unregisterWeakListener(t);
    } : r;
  }
  off(e, t) {
    const n = this._getBucket(e);
    n && (n.delete(t), this._unregisterWeakListener(t), n.size === 0 && this._listeners.delete(e));
  }
  emit(e, t) {
    const n = this._listeners.get(e);
    if (!n || n.size === 0) return !1;
    if (n instanceof x) {
      let s = !1;
      return n.forEach((i) => {
        s = !0;
        try {
          i(t);
        } catch {
        }
      }), n.size === 0 && this._listeners.delete(e), s;
    }
    const r = n.size > 0;
    for (const s of n) {
      const i = s && typeof s.deref == "function" ? s.deref() : s;
      if (i) try {
        i(t);
      } catch {
      }
      else n.delete(s);
    }
    return n.size === 0 && this._listeners.delete(e), r;
  }
  async emitAsync(e, t, { concurrency: n = 1 / 0 } = {}) {
    const r = this.listeners(e);
    if (r.length === 0) return !1;
    const s = Number.isFinite(+n) && +n > 0 ? Math.max(1, Math.floor(+n)) : 1 / 0, i = async (h) => {
      try {
        await h(t);
      } catch {
      }
    };
    if (!Number.isFinite(s) || s >= r.length) return await Promise.all(r.map(i)), !0;
    let a = 0;
    const o = Array.from({ length: s }, async () => {
      for (; a < r.length; ) {
        const h = r[a++];
        h && await i(h);
      }
    });
    return await Promise.all(o), !0;
  }
  listeners(e) {
    const t = this._listeners.get(e);
    return t ? t instanceof x ? t.values() : Array.from(t).map((n) => n && typeof n.deref == "function" ? n.deref() : n).filter(Boolean) : [];
  }
  clear(e) {
    e !== void 0 ? this._listeners.delete(e) : this._listeners.clear();
  }
}, K = class {
  constructor(e, t, n) {
    this._underlying = e, this._logger = t, this._pool = n, this.onmessage = null, this.onerror = null, this.onmessageerror = null;
  }
  postMessage(e, t) {
    let n = e, r = t;
    if (!(e === null || typeof e != "object" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer)) try {
      const s = this._pool._encodeForTransfer(e);
      if (!r || Array.isArray(r) && r.length === 0) r = [s.buffer];
      else {
        let i = !1;
        if (Array.isArray(r)) {
          for (let a of r) if (a === s.buffer) {
            i = !0;
            break;
          }
          i || (r = [...r, s.buffer]);
        } else if (r.length === 0) r = [s.buffer];
        else {
          const a = [];
          for (let o of r) a.push(o), o === s.buffer && (i = !0);
          i || a.push(s.buffer), r = a;
        }
      }
      n = s;
    } catch {
      r = t, n = e;
    }
    !r && (n instanceof Uint8Array || ArrayBuffer.isView(n)) && (r = [n.buffer]);
    try {
      r && r.length ? this._underlying.postMessage(n, r) : this._underlying.postMessage(n);
    } catch (s) {
      throw this._logger.error(s, "Failed to postMessage to underlying worker"), s;
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
}, V = class extends Error {
  constructor(e = "PowerPool has been shut down") {
    super(e), this.name = "PowerPoolShutdownError";
  }
}, C = class {
  constructor(e, t = {}) {
    const n = typeof navigator < "u" && navigator.hardwareConcurrency || 2, { size: r = Math.min(n, 2), minSize: s = 2, maxSize: i = Math.max(r, n), workerOptions: a = {}, maxTasksPerWorker: o = 1 / 0, idleTimeout: h = 6e4, taskQueue: u = !0, queuePolicy: l = "enqueue", lazy: c = !0 } = t;
    this._workerSource = e, this._workerOptions = a, this._maxTasksPerWorker = o, this.minSize = Math.max(0, s), this.maxSize = Math.max(this.minSize, i), this.idleTimeout = Math.max(0, h), this.taskQueueEnabled = !!u, this._queuePolicy = ["enqueue", "drop-oldest", "drop-newest", "reject"].includes(l) ? l : "enqueue", this._createdAt = m(), this._totalWorkersCreated = 0, this._totalTasksCompleted = 0, this._taskDurationsWelfordCount = 0, this._taskDurationsWelfordMean = 0, this._taskDurationsWelfordM2 = 0, this._taskDurationsMin = Number.POSITIVE_INFINITY, this._taskDurationsMax = Number.NEGATIVE_INFINITY, this._ewmaLatency = null, this._autoScale = null, this._autoScaleInterval = null, this._lastAutoScaleAt = null, this._terminatedWorkerTaskCountsTotal = 0, this._terminatedWorkerTaskCountsCount = 0, this.workers = [], this.queue = new T(), this._bus = new W({ maxListeners: t && (t.listenerMaxListeners ?? t.maxListeners), weak: t && !!t.weakListeners }), this._queueHighThreshold = Number.isFinite(Number(t && t.queueHighThreshold)) ? Math.max(0, Math.floor(Number(t.queueHighThreshold))) : 1 / 0, this._queueHighCrossed = !1, this._onmessage = null, this._onerror = null, this._onidle = null, this._onresize = null, this._nextIndex = 0, this._nextWorkerId = 0, this._activeTasks = 0, this._isIdle = !0, this._logger = new z(t && typeof t.debugLevel == "number" ? t.debugLevel : 1, { name: "powerPool" }), this._pendingResponses = /* @__PURE__ */ new Map(), this._underlyingToWorkerObj = /* @__PURE__ */ new Map();
    const p = c ? Math.min(this.minSize, this.maxSize) : Math.min(Math.max(r, this.minSize), this.maxSize);
    for (let f = 0; f < p; f++) this._addWorkerInstance();
    if (this._reaperInterval = setInterval(() => this._reapIdleWorkers(), Math.max(1e3, Math.floor(this.idleTimeout / 2))), this._encodeCache = /* @__PURE__ */ new Map(), this._encodeCacheLimit = Math.max(16, t && t.encodeCacheLimit ? t.encodeCacheLimit : 64), this._encodeCacheByteLimit = Number.isFinite(t && Number(t.encodeCacheByteLimit)) ? Math.max(0, Number(t.encodeCacheByteLimit)) : 1 / 0, this._encodeCacheBytes = 0, t && t.autoScale) {
      const f = typeof t.autoScale == "object" ? t.autoScale : {}, g = Number.isFinite(Number(f.intervalMs)) ? Math.max(100, Math.floor(f.intervalMs)) : 1e3, d = Number.isFinite(Number(f.targetMs)) ? Math.max(1, Number(f.targetMs)) : 50, y = Number.isFinite(Number(f.alpha)) ? Math.max(0, Math.min(1, Number(f.alpha))) : 0.2, _ = Number.isFinite(Number(f.cooldownMs)) ? Math.max(0, Math.floor(f.cooldownMs)) : 5e3;
      this._autoScale = { enabled: !0, intervalMs: g, targetMs: d, alpha: y, cooldownMs: _, hysteresis: Number.isFinite(Number(f.hysteresis)) ? Math.max(0, Math.min(1, Number(f.hysteresis))) : 0.2, stepUp: Number.isFinite(Number(f.stepUp)) ? Math.max(1, Math.floor(Number(f.stepUp))) : 1, stepDown: Number.isFinite(Number(f.stepDown)) ? Math.max(1, Math.floor(Number(f.stepDown))) : 1, backoffFactor: Number.isFinite(Number(f.backoffFactor)) ? Math.max(1, Number(f.backoffFactor)) : 1, backoffMaxMultiplier: Number.isFinite(Number(f.backoffMaxMultiplier)) ? Math.max(1, Number(f.backoffMaxMultiplier)) : 8, backoffResetMs: Number.isFinite(Number(f.backoffResetMs)) ? Math.max(0, Math.floor(Number(f.backoffResetMs))) : 4 * _ }, this._autoScaleBackoffMultiplier = 1;
      try {
        this._autoScaleInterval = setInterval(() => this._autoScaleTick(), g);
      } catch {
      }
    }
  }
  _debugLog(e, t) {
    try {
      this && this._logger && typeof this._logger.debug == "function" && (e ? this._logger.debug(e, t || "swallowed error") : this._logger.debug(t || "swallowed error"));
    } catch {
    }
  }
  _ensureReaper() {
    try {
      this._reaperInterval || (this._reaperInterval = setInterval(() => this._reapIdleWorkers(), Math.max(1e3, Math.floor(this.idleTimeout / 2))));
    } catch {
    }
  }
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
  shutdown() {
    this._clearLifecycleIntervals();
    try {
      for (const [e] of this._pendingResponses) try {
        this._cleanupPendingResponse(e, { rejectWith: new V("pool:shutdown") });
      } catch (t) {
        this._debugLog && this._debugLog(t, "shutdown: cleanup pending response");
      }
    } catch (e) {
      this._debugLog && this._debugLog(e, "shutdown: iterate pending responses");
    }
    try {
      for (const e of this.workers) try {
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
      e && e.length && this._bus.emit("pool:scale", { action: "remove", terminated: e, count: e.length });
    } catch (e) {
      this._debugLog && this._debugLog(e, "shutdown: pool scale emit error");
    }
    this.workers = [], this.queue = new T(), this._activeTasks = 0;
  }
  _encodeForTransfer(e) {
    try {
      const t = JSON.stringify(e);
      if (typeof t == "string" && t.length > 2048) return E(e);
      const n = this._encodeCache.get(t);
      if (n) {
        try {
          this._encodeCache.delete(t), this._encodeCache.set(t, n);
        } catch {
        }
        return n;
      }
      const r = E(e), s = r && r.byteLength || 0, i = () => this._encodeCache.size >= this._encodeCacheLimit || this._encodeCacheByteLimit !== 1 / 0 && this._encodeCacheBytes + s > this._encodeCacheByteLimit;
      for (; i(); ) {
        const a = this._encodeCache.keys().next().value;
        if (!a) break;
        try {
          const o = this._encodeCache.get(a);
          o && o.byteLength && (this._encodeCacheBytes = Math.max(0, this._encodeCacheBytes - o.byteLength));
        } catch {
        }
        this._encodeCache.delete(a);
      }
      return this._encodeCache.set(t, r), r && r.byteLength && (this._encodeCacheBytes += r.byteLength), r;
    } catch {
      return E(e);
    }
  }
  prepareBuffer(e, t = {}) {
    const { clone: n = !0 } = t, r = this._encodeForTransfer(e);
    return n ? r.slice() : r;
  }
  prepareBuffers(e, t = {}) {
    if (!Array.isArray(e)) throw new Error("prepareBuffers expects an array");
    const { clone: n = !0, zeroCopy: r = !1 } = t, s = new Array(e.length);
    for (let i = 0; i < e.length; i++) {
      const a = e[i] && typeof e[i] == "object" && "message" in e[i] ? e[i] : { message: e[i] }, o = a.message, h = a.transfer;
      if (h) s[i] = { message: o, transfer: h };
      else {
        if (!(o === null || typeof o != "object" || ArrayBuffer.isView(o) || o instanceof ArrayBuffer)) {
          if (r) {
            s[i] = { message: o, transfer: void 0 };
            continue;
          }
          try {
            const u = this._encodeForTransfer(o);
            if (n) {
              const l = u.slice();
              s[i] = { message: l, transfer: [l.buffer] };
            } else s[i] = { message: u, transfer: void 0 };
            continue;
          } catch {
            s[i] = { message: o, transfer: void 0 };
            continue;
          }
        }
        o instanceof ArrayBuffer || ArrayBuffer.isView(o) ? s[i] = { message: o, transfer: [o instanceof ArrayBuffer ? o : o.buffer] } : s[i] = { message: o, transfer: void 0 };
      }
    }
    return s;
  }
  _prepareForTransfer(e, t, n) {
    const r = n && !!n.zeroCopy;
    if (!(e === null || typeof e != "object" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer)) {
      if (r) return { message: e, transfer: t };
      try {
        const s = this._encodeForTransfer(e).slice();
        let i = t;
        if (!i || Array.isArray(i) && i.length === 0) i = [s.buffer];
        else if (Array.isArray(i)) {
          let a = !1;
          for (const o of i) if (o === s.buffer) {
            a = !0;
            break;
          }
          a || (i = [...i, s.buffer]);
        } else if (i.length === 0) i = [s.buffer];
        else {
          const a = [];
          let o = !1;
          for (const h of i) a.push(h), h === s.buffer && (o = !0);
          o || a.push(s.buffer), i = a;
        }
        return { message: s, transfer: i };
      } catch {
        return { message: e, transfer: t };
      }
    }
    return e instanceof Uint8Array || ArrayBuffer.isView(e) || e instanceof ArrayBuffer ? { message: e, transfer: [e.buffer || e] } : { message: e, transfer: t };
  }
  _decrementActiveTasks(e = 1) {
    try {
      const t = Number.isFinite(Number(e)) ? Math.max(0, Math.floor(Number(e))) : 1;
      this._activeTasks = Math.max(0, this._activeTasks - t);
    } catch {
      this._activeTasks = 0;
    }
  }
  resize(e) {
    let t = this.minSize, n = this.maxSize;
    if (e != null && typeof e == "object") Number.isFinite(e.minSize) && (t = Math.max(0, Math.floor(e.minSize))), Number.isFinite(e.maxSize) && (n = Math.max(t, Math.floor(e.maxSize)));
    else {
      const i = Number(e);
      if (!Number.isFinite(i)) return;
      n = Math.max(t, Math.floor(i));
    }
    this.minSize = Math.max(0, t), this.maxSize = Math.max(this.minSize, n);
    let r = 0;
    for (; this.workers.length < this.minSize && this.workers.length < this.maxSize; ) this._addWorkerInstance(), r++;
    const s = [];
    for (; this.workers.length > this.maxSize; ) {
      const i = this.workers.pop();
      if (i) {
        this._decrementActiveTasks(i.tasks || 0);
        try {
          i.worker.terminate();
        } catch {
        }
        this._deleteWorkerUnderlyingMapping(i), this._terminatedWorkerTaskCountsTotal += i.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1, s.push(i.id);
      }
    }
    if (s.length || r) {
      const i = { data: { type: "pool:resize", terminated: s, added: r, minSize: this.minSize, maxSize: this.maxSize } };
      if (this._onresize) try {
        this._onresize(i);
      } catch (a) {
        this._logger.error(a, "Pool onresize handler error");
      }
      try {
        this._bus.emit("resize", i);
      } catch (a) {
        this._logger.error(a, "pool resize listener error");
      }
      try {
        this._bus.emit("pool:scale", { added: r, terminated: s, minSize: this.minSize, maxSize: this.maxSize });
      } catch (a) {
        this._logger.error(a, "pool scale resize listener error");
      }
    }
    this._updateIdleState();
  }
  _createWorkerInstance() {
    if (typeof this._workerSource == "function") {
      const e = this._workerSource;
      if (e.prototype === void 0) return e();
      try {
        return new e();
      } catch (t) {
        const n = String(t && t.message);
        if (t instanceof TypeError && /not a constructor|cannot be invoked without\s*'new'|Class constructor|not constructable/i.test(n)) return e();
        throw t;
      }
    }
    if (typeof this._workerSource == "string") {
      let e;
      try {
        e = new Function("try { return import.meta && import.meta.url } catch (e) { return undefined }")();
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
  _addWorkerInstance(e) {
    e == null && (e = this._nextWorkerId++);
    const t = this._createWorkerInstance(), n = new K(t, this._logger, this), r = { id: e, worker: n, tasks: 0, lastActive: m(), latencyEwma: null, _startTimes: new T(), completedTasks: 0 };
    this.workers.push(r), this._totalWorkersCreated++;
    try {
      this._bus.emit("pool:scale", { action: "add", id: r.id, minSize: this.minSize, maxSize: this.maxSize });
    } catch (o) {
      this._logger.error(o, "pool scale add listener error");
    }
    try {
      this._underlyingToWorkerObj.set(t, r);
    } catch {
    }
    n.onmessage = (o) => {
      const h = m();
      r.tasks = Math.max(0, r.tasks - 1), this._decrementActiveTasks(1), r.lastActive = h;
      try {
        const u = o && o.data;
        if (u && typeof u == "object" && u.correlationId != null) {
          const l = String(u.correlationId), c = Object.prototype.hasOwnProperty.call(u, "response") ? u.response : u;
          this._cleanupPendingResponse(l, { resolveWith: c });
        }
      } catch (u) {
        this._debugLog && this._debugLog(u, "worker.onmessage: resolve pending response");
      }
      try {
        const u = r._startTimes && r._startTimes.length ? r._startTimes.shift() : null;
        let l = null;
        try {
          const c = o && o.data;
          if (c && typeof c.duration == "number" && Number.isFinite(c.duration) ? l = Math.max(0, Number(c.duration)) : u != null && (l = Math.max(0, h - u)), l != null) {
            const p = this._autoScale && this._autoScale.alpha || 0.2;
            r.latencyEwma == null ? r.latencyEwma = l : r.latencyEwma = p * l + (1 - p) * r.latencyEwma, this._ewmaLatency == null ? this._ewmaLatency = l : this._ewmaLatency = p * l + (1 - p) * this._ewmaLatency, this._totalTasksCompleted = (this._totalTasksCompleted || 0) + 1, r.completedTasks = (r.completedTasks || 0) + 1;
            const f = 1;
            this._taskDurationsWelfordCount = this._taskDurationsWelfordCount + f;
            const g = l - this._taskDurationsWelfordMean;
            this._taskDurationsWelfordMean += g * f / this._taskDurationsWelfordCount;
            const d = l - this._taskDurationsWelfordMean;
            this._taskDurationsWelfordM2 += g * d, l < this._taskDurationsMin && (this._taskDurationsMin = l), l > this._taskDurationsMax && (this._taskDurationsMax = l);
          }
        } catch (c) {
          this._debugLog && this._debugLog(c, "worker.onmessage: latency tracking inner");
        }
      } catch (u) {
        this._debugLog && this._debugLog(u, "worker.onmessage: latency tracking outer");
      }
      if (!this._queuePaused && this.queue.length > 0 && r.tasks < this._maxTasksPerWorker) {
        const u = this.queue.shift();
        try {
          const l = m();
          u.transfer ? n.postMessage(u.message, u.transfer) : n.postMessage(u.message), r._startTimes.push(l), r.tasks++, this._activeTasks++;
        } catch (l) {
          this._debugLog && this._debugLog(l, "dispatch queued message to worker failed"), this._logger.error(l, "Failed to dispatch queued message to worker");
        }
        this._queueHighCrossed && this.queue.length <= this._queueHighThreshold && (this._queueHighCrossed = !1);
      }
      if (this._onmessage) try {
        this._onmessage(o);
      } catch (u) {
        this._logger.error(u, "Pool onmessage handler error");
      }
      try {
        this._bus.emit("message", o);
      } catch (u) {
        this._logger.error(u, "pool listener error");
      }
      this._updateIdleState();
    };
    const s = (o) => {
      let h = o && o.data !== void 0 ? o.data : o, u = h;
      if (h && (h instanceof ArrayBuffer || ArrayBuffer.isView(h))) try {
        u = P(h);
      } catch (c) {
        try {
          a(c);
        } catch {
        }
        u = h;
      }
      const l = { data: u, originalEvent: o };
      if (typeof n.onmessage == "function") try {
        n.onmessage(l);
      } catch (c) {
        this._logger.error(c, "worker wrapper onmessage error");
      }
    }, i = (o) => {
      if (typeof n.onerror == "function") try {
        n.onerror(o);
      } catch (h) {
        this._logger.error(h, "worker wrapper onerror error");
      }
      try {
        this._bus.emit("error", o);
      } catch (h) {
        this._logger.error(h, "pool error listener error");
      }
    }, a = (o) => {
      if (typeof n.onmessageerror == "function") try {
        n.onmessageerror(o);
      } catch (h) {
        this._logger.error(h, "worker wrapper onmessageerror error");
      }
      try {
        this._bus.emit("messageerror", o);
      } catch (h) {
        this._logger.error(h, "pool messageerror listener error");
      }
    };
    if (typeof t.addEventListener == "function") {
      try {
        t.addEventListener("message", s);
      } catch (o) {
        this._debugLog && this._debugLog(o, "attach addEventListener message");
      }
      try {
        t.addEventListener("error", i);
      } catch (o) {
        this._debugLog && this._debugLog(o, "attach addEventListener error");
      }
      try {
        t.addEventListener("messageerror", a);
      } catch (o) {
        this._debugLog && this._debugLog(o, "attach addEventListener messageerror");
      }
    } else if (typeof t.on == "function") {
      try {
        t.on("message", s);
      } catch (o) {
        this._debugLog && this._debugLog(o, "attach underlying.on message");
      }
      try {
        t.on("error", i);
      } catch (o) {
        this._debugLog && this._debugLog(o, "attach underlying.on error");
      }
      try {
        t.on("messageerror", a);
      } catch (o) {
        this._debugLog && this._debugLog(o, "attach underlying.on messageerror");
      }
    } else {
      try {
        t.onmessage = s;
      } catch (o) {
        this._debugLog && this._debugLog(o, "assign underlying.onmessage");
      }
      try {
        t.onerror = i;
      } catch (o) {
        this._debugLog && this._debugLog(o, "assign underlying.onerror");
      }
      try {
        t.onmessageerror = a;
      } catch (o) {
        this._debugLog && this._debugLog(o, "assign underlying.onmessageerror");
      }
    }
    return r;
  }
  _findLeastLoadedWorker() {
    if (!this.workers.length) return null;
    let e = null, t = 1 / 0, n = Number.POSITIVE_INFINITY;
    for (let r = 0; r < this.workers.length; r++) {
      const s = this.workers[r], i = s.latencyEwma != null ? s.latencyEwma : Number.POSITIVE_INFINITY;
      (s.tasks < t || s.tasks === t && i < n) && (e = s, t = s.tasks, n = i);
    }
    return e;
  }
  _handleUnderlyingMessage(e, t) {
    const n = this._underlyingToWorkerObj.get(e);
    if (!n) return;
    const r = n.worker;
    let s = t && t.data !== void 0 ? t.data : t, i = s;
    if (s && (s instanceof ArrayBuffer || ArrayBuffer.isView(s))) try {
      i = P(s);
    } catch (o) {
      try {
        this._handleUnderlyingMessageError(e, o);
      } catch {
      }
      i = s;
    }
    const a = { data: i, originalEvent: t };
    if (typeof r.onmessage == "function") try {
      r.onmessage(a);
    } catch (o) {
      this._logger.error(o, "worker wrapper onmessage error");
    }
  }
  _handleUnderlyingError(e, t) {
    const n = this._underlyingToWorkerObj.get(e);
    if (!n) return;
    const r = n.worker;
    if (typeof r.onerror == "function") try {
      r.onerror(t);
    } catch (s) {
      this._logger.error(s, "worker wrapper onerror error");
    }
    try {
      this._bus.emit("error", t);
    } catch (s) {
      this._logger.error(s, "pool error listener error");
    }
  }
  _handleUnderlyingMessageError(e, t) {
    const n = this._underlyingToWorkerObj.get(e);
    if (!n) return;
    const r = n.worker;
    if (typeof r.onmessageerror == "function") try {
      r.onmessageerror(t);
    } catch (s) {
      this._logger.error(s, "worker wrapper onmessageerror error");
    }
    try {
      this._bus.emit("messageerror", t);
    } catch (s) {
      this._logger.error(s, "pool messageerror listener error");
    }
  }
  postMessage(e, t, n) {
    const r = (n = n || void 0) && n.workerId != null ? n.workerId : null, s = r != null ? this.workers.find((l) => l.id === r) : this._findLeastLoadedWorker(), i = !!(n && (n.awaitResponse || n.correlationId != null));
    let a, o;
    if (i) {
      if (a = n.correlationId != null ? String(n.correlationId) : this._generateCorrelationId(), e === null || typeof e != "object" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer) throw new Error("postMessage awaitResponse requires a plain-object message");
      e = Object.assign({}, e, { correlationId: a }), o = new Promise((l, c) => {
        const p = { resolve: l, reject: c, timer: null }, f = a != null ? String(a) : a;
        n && n.timeout && (p.timer = setTimeout(() => {
          try {
            this._cleanupPendingResponse(f, { rejectWith: /* @__PURE__ */ new Error("postMessage response timeout") });
          } catch {
            try {
              c(/* @__PURE__ */ new Error("postMessage response timeout"));
            } catch {
            }
          }
        }, n.timeout)), this._pendingResponses.set(f, p);
      }), a = a != null ? String(a) : a;
    }
    if (s && s.tasks < this._maxTasksPerWorker) try {
      const l = m(), c = this._prepareForTransfer(e, t, n);
      return c.transfer && c.transfer.length ? s.worker.postMessage(c.message, c.transfer) : s.worker.postMessage(c.message), s._startTimes && typeof s._startTimes.push == "function" && s._startTimes.push(l), s.tasks++, this._activeTasks++, s.lastActive = l, this._updateIdleState(), !i || o;
    } catch (l) {
      if (i && a) {
        try {
          this._cleanupPendingResponse(a, { rejectWith: l });
        } catch {
        }
        return this._logger.error(l, "Failed to postMessage to worker"), o;
      }
      return this._logger.error(l, "Failed to postMessage to worker"), !1;
    }
    if (r != null && (!s || s.tasks >= this._maxTasksPerWorker)) {
      if (i && a) {
        try {
          this._cleanupPendingResponse(a, { rejectWith: /* @__PURE__ */ new Error("targeted worker unavailable") });
        } catch {
        }
        return o;
      }
      return !1;
    }
    if (r == null && this.workers.length < this.maxSize) {
      const l = this._addWorkerInstance();
      try {
        const c = m(), p = this._prepareForTransfer(e, t, n);
        return p.transfer && p.transfer.length ? l.worker.postMessage(p.message, p.transfer) : l.worker.postMessage(p.message), l._startTimes && typeof l._startTimes.push == "function" && l._startTimes.push(c), l.tasks++, this._activeTasks++, l.lastActive = c, this._updateIdleState(), !i || o;
      } catch (c) {
        if (i && a) {
          try {
            this._cleanupPendingResponse(a, { rejectWith: c });
          } catch {
          }
          return this._logger.error(c, "Failed to postMessage to new worker"), o;
        }
        return this._logger.error(c, "Failed to postMessage to new worker"), !1;
      }
    }
    if (this.taskQueueEnabled) {
      const l = this._prepareForTransfer(e, t, n), c = this._queuePolicy;
      if (c === "reject") return !(!i || !a) && (this._cleanupPendingResponse(a, { rejectWith: /* @__PURE__ */ new Error("postMessage rejected by queue policy") }), o);
      if (c === "drop-newest" && this.queue.length > 0) return !(!i || !a) && (this._cleanupPendingResponse(a, { rejectWith: /* @__PURE__ */ new Error("postMessage rejected by queue policy") }), o);
      if (c === "drop-oldest" && this.queue.length > 0) {
        const f = this.queue.shift();
        f && f.correlationId != null && this._cleanupPendingResponse(f.correlationId, { rejectWith: /* @__PURE__ */ new Error("postMessage queued task dropped by policy") });
      }
      const p = { message: l.message, transfer: l.transfer };
      i && a && (p.correlationId = a), this.queue.push(p);
      try {
        if (Number.isFinite(this._queueHighThreshold) && this.queue.length > this._queueHighThreshold && !this._queueHighCrossed) {
          this._queueHighCrossed = !0;
          try {
            this._bus.emit("pool:queue:high", { length: this.queue.length, threshold: this._queueHighThreshold });
          } catch (f) {
            this._logger.error(f, "pool queue high listener error");
          }
        }
      } catch {
      }
      return this._updateIdleState(), !i || o;
    }
    if (!this.workers.length) return !!i && o;
    const h = this._nextIndex % this.workers.length;
    this._nextIndex = (this._nextIndex + 1) % this.workers.length;
    const u = this.workers[h];
    try {
      const l = m(), c = this._prepareForTransfer(e, t);
      return c.transfer && c.transfer.length ? u.worker.postMessage(c.message, c.transfer) : u.worker.postMessage(c.message), u._startTimes && typeof u._startTimes.push == "function" && u._startTimes.push(l), u.tasks++, this._activeTasks++, u.lastActive = l, this._updateIdleState(), !i || o;
    } catch (l) {
      if (i && a) {
        try {
          this._cleanupPendingResponse(a, { rejectWith: l });
        } catch {
        }
        return this._logger.error(l, "Failed to postMessage to fallback worker"), o;
      }
      return this._logger.error(l, "Failed to postMessage to fallback worker"), !1;
    }
  }
  _generateCorrelationId() {
    try {
      if (typeof globalThis < "u" && globalThis.crypto && typeof globalThis.crypto.randomUUID == "function") return globalThis.crypto.randomUUID();
    } catch {
    }
    try {
      if (typeof globalThis < "u" && globalThis.crypto && typeof globalThis.crypto.getRandomValues == "function") {
        const t = new Uint8Array(16);
        return globalThis.crypto.getRandomValues(t), Array.from(t).map((n) => n.toString(16).padStart(2, "0")).join("");
      }
    } catch {
    }
    const e = Math.floor(4294967295 * Math.random()).toString(16);
    return `cid-${Date.now().toString(36)}-${e}`;
  }
  _cleanupPendingResponse(e, t = {}) {
    const n = e != null ? String(e) : e, r = this._pendingResponses.get(n);
    if (!r) return !1;
    try {
      if (r.timer) try {
        clearTimeout(r.timer);
      } catch {
      }
    } catch {
    }
    try {
      Object.prototype.hasOwnProperty.call(t, "resolveWith") ? r.resolve(t.resolveWith) : Object.prototype.hasOwnProperty.call(t, "rejectWith") && r.reject(t.rejectWith);
    } catch {
    } finally {
      try {
        this._pendingResponses.delete(n);
      } catch {
      }
    }
    return !0;
  }
  broadcast(e, t) {
    const n = m();
    let r = null;
    const s = !(e === null || typeof e != "object" || ArrayBuffer.isView(e) || e instanceof ArrayBuffer);
    for (const i of this.workers) try {
      let a = e, o = t;
      if (!o && s) try {
        r == null && (r = this._encodeForTransfer(e));
        const h = r.slice();
        a = h, o = [h.buffer];
      } catch {
        a = e, o = void 0;
      }
      o && o.length ? i.worker.postMessage(a, o) : i.worker.postMessage(a), i._startTimes && typeof i._startTimes.push == "function" && i._startTimes.push(n), i.tasks++, this._activeTasks++, i.lastActive = n;
    } catch (a) {
      this._logger.error(a, "broadcast error");
    }
    this._updateIdleState();
  }
  stopThePress(e, t, n) {
    const r = !n || n.recreateWorkers === void 0 || !!n.recreateWorkers, s = n && typeof n == "object" ? Object.assign({}, n) : void 0;
    s && delete s.recreateWorkers;
    try {
      this.queue && typeof this.queue.clear == "function" && this.queue.clear();
    } catch (o) {
      this._logger.error(o, "stopThePress: failed to clear queue");
    }
    try {
      for (const [o] of this._pendingResponses) try {
        this._cleanupPendingResponse(o, { rejectWith: /* @__PURE__ */ new Error("stopThePress: cancelled pending response") });
      } catch {
      }
    } catch (o) {
      this._logger.error(o, "stopThePress: failed to cancel pending responses");
    }
    const i = this.workers.length, a = this.workers.map((o) => o && o.id).filter((o) => o != null);
    try {
      for (let o = this.workers.length - 1; o >= 0; o--) {
        const h = this.workers[o];
        this._terminatedWorkerTaskCountsTotal += h.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1;
        try {
          h.worker.terminate();
        } catch {
        }
        this._deleteWorkerUnderlyingMapping(h);
      }
      this.workers.length = 0, this._activeTasks = 0;
    } catch (o) {
      this._logger.error(o, "stopThePress: failed while terminating workers");
    }
    if (r || this._clearLifecycleIntervals(), r) {
      const o = Math.max(this.minSize, Math.min(i, this.maxSize));
      for (let h = 0; h < o; h++) this._addWorkerInstance();
      try {
        this._ensureReaper();
      } catch {
      }
    }
    try {
      a && a.length && this._bus.emit("pool:scale", { action: "remove", terminated: a, count: i });
    } catch (o) {
      this._logger.error(o, "pool scale stopThePress listener error");
    }
    return this._updateIdleState(), this.postMessage(e, t, s);
  }
  postMessageBatch(e, t) {
    if (!Array.isArray(e)) throw new Error("postMessageBatch expects an array of {message, transfer?}");
    const n = !!(t && (t.awaitResponse || t.correlationId != null)), r = t && typeof t.correlationIdFactory == "function" ? t.correlationIdFactory : null;
    if (n) {
      if (t && t.correlationId != null && e.length > 1 && !r) throw new Error("postMessageBatch cannot use a fixed correlationId for multiple items; provide options.correlationIdFactory or omit correlationId");
      const l = new Array(e.length);
      for (let c = 0; c < e.length; c++) {
        const p = e[c] || {}, f = Object.assign({}, t);
        r && (f.correlationId = String(r(c, p))), l[c] = this.postMessage(p.message, p.transfer, f);
      }
      return l;
    }
    const s = new Array(e.length), i = [], a = t && t.workerId != null ? t.workerId : null, o = this.prepareBuffers(e, { clone: !0, zeroCopy: t && !!t.zeroCopy });
    let h = null;
    if (a != null) {
      if (h = this.workers.find((l) => l.id === a), !h) return e.map(() => !1);
    } else h = this._findLeastLoadedWorker();
    let u = !1;
    for (let l = 0; l < e.length; l++) {
      const c = e[l] || {}, p = o[l] || { message: c.message, transfer: c.transfer };
      let f = !1;
      h && h.tasks >= this._maxTasksPerWorker && (h = null);
      let g = h;
      if (g || a != null || (g = this._findLeastLoadedWorker()), g && g.tasks < this._maxTasksPerWorker) try {
        const d = m();
        p.transfer && p.transfer.length ? g.worker.postMessage(p.message, p.transfer) : g.worker.postMessage(p.message), g._startTimes && typeof g._startTimes.push == "function" && g._startTimes.push(d), g.tasks++, this._activeTasks++, g.lastActive = d, u = !0, s[l] = !0, f = !0, h = g.tasks < this._maxTasksPerWorker ? g : null;
      } catch {
        s[l] = !1, f = !0;
      }
      if (!f && a == null && this.workers.length < this.maxSize) try {
        const d = this._addWorkerInstance(), y = m();
        p.transfer && p.transfer.length ? d.worker.postMessage(p.message, p.transfer) : d.worker.postMessage(p.message), d._startTimes && typeof d._startTimes.push == "function" && d._startTimes.push(y), d.tasks++, this._activeTasks++, d.lastActive = y, u = !0, s[l] = !0, f = !0, h = d.tasks < this._maxTasksPerWorker ? d : null;
      } catch {
        s[l] = !1, f = !0;
      }
      if (!f) {
        if (a != null) {
          s[l] = !1;
          continue;
        }
        if (this.taskQueueEnabled) {
          const d = this._queuePolicy;
          d === "reject" || d === "drop-newest" && this.queue.length > 0 ? s[l] = !1 : (d === "drop-oldest" && this.queue.length > 0 && this.queue.shift(), i.push({ message: p.message, transfer: p.transfer }), s[l] = !0);
        } else if (this.workers.length) {
          const d = this._nextIndex % this.workers.length;
          this._nextIndex = (this._nextIndex + 1) % this.workers.length;
          const y = this.workers[d];
          try {
            const _ = m();
            p.transfer && p.transfer.length ? y.worker.postMessage(p.message, p.transfer) : y.worker.postMessage(p.message), y._startTimes && typeof y._startTimes.push == "function" && y._startTimes.push(_), y.tasks++, this._activeTasks++, y.lastActive = _, u = !0, s[l] = !0;
          } catch (_) {
            s[l] = !1, this._logger.error(_, "Failed to postMessage to fallback worker");
          }
        } else s[l] = !1;
      }
    }
    if (i.length) try {
      this.queue.pushMany(i), u = !0;
    } catch (l) {
      this._logger.error(l, "postMessageBatch: failed to enqueue prepared items");
    }
    return u && this._updateIdleState(), s;
  }
  stopThePressBatch(e, t) {
    const n = !t || t.recreateWorkers === void 0 || !!t.recreateWorkers, r = t && typeof t == "object" ? Object.assign({}, t) : void 0;
    r && delete r.recreateWorkers;
    try {
      this.queue && typeof this.queue.clear == "function" && this.queue.clear();
    } catch (i) {
      this._logger.error(i, "stopThePressBatch: failed to clear queue");
    }
    try {
      for (const [i] of this._pendingResponses) try {
        this._cleanupPendingResponse(i, { rejectWith: /* @__PURE__ */ new Error("stopThePressBatch: cancelled pending response") });
      } catch {
      }
    } catch (i) {
      this._logger.error(i, "stopThePressBatch: failed to cancel pending responses");
    }
    const s = this.workers.length;
    try {
      for (let i = this.workers.length - 1; i >= 0; i--) {
        const a = this.workers[i];
        this._terminatedWorkerTaskCountsTotal += a.completedTasks || 0, this._terminatedWorkerTaskCountsCount += 1;
        try {
          a.worker.terminate();
        } catch {
        }
        this._deleteWorkerUnderlyingMapping(a);
      }
      this.workers.length = 0, this._activeTasks = 0;
    } catch (i) {
      this._logger.error(i, "stopThePressBatch: failed while terminating workers");
    }
    if (n || this._clearLifecycleIntervals(), n) {
      const i = Math.max(this.minSize, Math.min(s, this.maxSize));
      for (let a = 0; a < i; a++) this._addWorkerInstance();
      try {
        this._ensureReaper();
      } catch {
      }
    }
    this._updateIdleState();
    try {
      return this.postMessageBatch(e, r);
    } catch (i) {
      try {
        this._logger.error(i, "stopThePressBatch: postMessageBatch failed");
      } catch {
      }
      try {
        return new Array(e ? e.length : 0).fill(!1);
      } catch {
        return [];
      }
    }
  }
  addWorker() {
    return this._addWorkerInstance();
  }
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
  _reapIdleWorkers() {
    if (this.idleTimeout <= 0) return;
    const e = m();
    for (let t = this.workers.length - 1; t >= 0; t--) {
      const n = this.workers[t];
      if (this.workers.length <= this.minSize) break;
      if (n.tasks === 0 && e - (n.lastActive || 0) > this.idleTimeout) {
        try {
          n.worker.terminate();
        } catch {
        }
        try {
          const r = n.worker && n.worker._underlying;
          r && this._underlyingToWorkerObj && this._underlyingToWorkerObj.delete(r);
        } catch {
        }
        t === this.workers.length - 1 ? this.workers.pop() : this.workers[t] = this.workers.pop();
      }
    }
    this._updateIdleState();
  }
  _autoScaleTick() {
    try {
      if (!this._autoScale || !this._autoScale.enabled) return;
      const e = m(), t = this._autoScale;
      this._lastAutoScaleAt && t.backoffResetMs && e - this._lastAutoScaleAt > t.backoffResetMs && (this._autoScaleBackoffMultiplier = 1);
      const n = Math.floor((t.cooldownMs || 0) * (this._autoScaleBackoffMultiplier || 1));
      if (this._lastAutoScaleAt && e - this._lastAutoScaleAt < n) return;
      const r = t.targetMs, s = t.hysteresis || 0.2, i = this._ewmaLatency, a = this.workers.length, o = i != null && i > r * (1 + s), h = this.queue.length > Math.ceil(a * (1 + s));
      if (o || h) {
        if (a < this.maxSize) try {
          const l = Math.min(this.maxSize - a, t.stepUp || 1);
          for (let c = 0; c < l; c++) this._addWorkerInstance();
          this._lastAutoScaleAt = e, this._autoScaleBackoffMultiplier = Math.min(t.backoffMaxMultiplier || 8, Math.max(1, (this._autoScaleBackoffMultiplier || 1) * (t.backoffFactor || 1)));
        } catch (l) {
          this._debugLog && this._debugLog(l, "autoScale: addWorker failed");
        }
        return;
      }
      const u = r * Math.max(0, 1 - s);
      if (i != null && i < u && this.queue.length === 0 && a > this.minSize) try {
        const l = Math.min(a - this.minSize, t.stepDown || 1);
        for (let c = 0; c < l; c++) {
          const p = this.workers.pop();
          if (p) {
            try {
              p.worker.terminate();
            } catch (f) {
              this._debugLog && this._debugLog(f, "autoScale: terminate worker");
            }
            this._deleteWorkerUnderlyingMapping(p);
          }
        }
        this._lastAutoScaleAt = e, this._autoScaleBackoffMultiplier = Math.min(t.backoffMaxMultiplier || 8, Math.max(1, (this._autoScaleBackoffMultiplier || 1) * (t.backoffFactor || 1)));
      } catch (l) {
        this._debugLog && this._debugLog(l, "autoScale: remove worker failed");
      }
    } catch (e) {
      this._debugLog && this._debugLog(e, "autoScaleTick outer");
    }
  }
  _emitIdle() {
    const e = { data: { type: "pool:idle", stats: this.getStats() } };
    if (this._isIdle = !0, this._onmessage) try {
      this._onmessage(e);
    } catch (t) {
      this._logger.error(t, "Pool onmessage handler error");
    }
    if (this._onidle) try {
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
  _updateIdleState() {
    const e = this.queue.length === 0, t = this._activeTasks === 0 && e;
    t && !this._isIdle ? this._emitIdle() : !t && this._isIdle && (this._isIdle = !1);
  }
  terminate() {
    try {
      this.shutdown();
    } catch {
    }
  }
  [Symbol.dispose]() {
    this.terminate();
  }
  async [Symbol.asyncDispose]() {
    try {
      await this.drain();
    } catch {
    }
    this.terminate();
  }
  getStats() {
    const e = this.workers.map((y) => ({ id: y.id, tasks: y.tasks, lastActive: y.lastActive })), t = m(), n = this._createdAt != null ? Math.max(0, t - this._createdAt) : 0, r = this._totalWorkersCreated || this.workers.length, s = this._totalTasksCompleted || 0, i = this._terminatedWorkerTaskCountsCount || 0, a = this._terminatedWorkerTaskCountsTotal || 0;
    let o = 0;
    for (const y of this.workers) o += y.completedTasks || 0;
    const h = i + (this.workers.length || 0), u = h > 0 ? (a + o) / h : 0;
    let l = 0, c = 0, p = 0, f = 0, g = 0;
    const d = this._taskDurationsWelfordCount || 0;
    if (d > 0) {
      l = this._taskDurationsMin === Number.POSITIVE_INFINITY ? 0 : this._taskDurationsMin, c = this._taskDurationsMax === Number.NEGATIVE_INFINITY ? 0 : this._taskDurationsMax, p = this._taskDurationsWelfordMean;
      const y = d > 1 ? this._taskDurationsWelfordM2 / d : 0;
      f = Math.sqrt(y), g = 0;
    }
    return { status: e, performance: { poolLiveDuration: n, totalWorkersCreated: r, totalTasksPerformed: s, averageTasksPerWorkerUntilTermination: u, timePerTask: { max: c, min: l, average: p, stddev: f }, percentSlowTasks: g }, queueLength: this.queue.length, activeTasks: this._activeTasks, workerCount: this.workers.length, minSize: this.minSize, maxSize: this.maxSize, isIdle: this._activeTasks === 0 && this.queue.length === 0 };
  }
  drain() {
    const e = this.queue.length === 0;
    return this._activeTasks === 0 && e ? Promise.resolve(this.getStats()) : new Promise((t) => {
      const n = () => {
        try {
          this.removeEventListener("idle", n);
        } catch {
        }
        t(this.getStats());
      };
      this.addEventListener("idle", n);
    });
  }
  addEventListener(e, t) {
    if (typeof t == "function" && (this._bus.on(e, t), e === "idle")) {
      const n = this.queue.length === 0;
      if (this._activeTasks === 0 && n) {
        const r = { data: { type: "pool:idle", stats: this.getStats() } };
        try {
          t(r);
        } catch (s) {
          this._logger.error(s, "pool idle listener error");
        }
      }
    }
  }
  removeEventListener(e, t) {
    t && typeof t == "function" && this._bus.off(e, t);
  }
  get onresize() {
    return this._onresize;
  }
  set onresize(e) {
    this._onresize = e;
  }
  get onmessage() {
    return this._onmessage;
  }
  set onmessage(e) {
    this._onmessage = e;
  }
  get onerror() {
    return this._onerror;
  }
  set onerror(e) {
    this._onerror = e;
  }
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
        } catch (r) {
          this._logger.error(r, "Pool onidle handler error");
        }
      }
    }
  }
  pauseQueue() {
    this._queuePaused = !0;
  }
  resumeQueue() {
    this._queuePaused && (this._queuePaused = !1, this._dispatchQueuedTasks());
  }
  pause() {
    return this.pauseQueue();
  }
  resume() {
    return this.resumeQueue();
  }
  get queuePaused() {
    return this._queuePaused;
  }
  _dispatchQueuedTasks() {
    if (this._queuePaused || !this.taskQueueEnabled || this.queue.length === 0) return;
    const e = m();
    let t = !1;
    for (const n of this.workers) for (; this.queue.length > 0 && n.tasks < this._maxTasksPerWorker; ) {
      const r = this.queue.shift();
      try {
        r.transfer && r.transfer.length ? n.worker.postMessage(r.message, r.transfer) : n.worker.postMessage(r.message), n._startTimes && typeof n._startTimes.push == "function" && n._startTimes.push(e), n.tasks++, this._activeTasks++, n.lastActive = e, t = !0;
      } catch (s) {
        this._debugLog && this._debugLog(s, "dispatch queued message to worker failed"), this._logger.error(s, "Failed to dispatch queued message to worker");
        break;
      }
    }
    this._queueHighCrossed && this.queue.length <= this._queueHighThreshold && (this._queueHighCrossed = !1), t && this._updateIdleState();
  }
}, $ = class {
  constructor(e, t = {}) {
    if (typeof e != "function") throw new TypeError("PowerScheduler requires a flush function");
    this._flushFn = e, this._scheduling = t.scheduling === "macrotask" ? "macrotask" : "microtask", this._scheduled = !1, this._timer = null;
  }
  get scheduled() {
    return this._scheduled;
  }
  schedule() {
    this._scheduled || (this._scheduled = !0, this._scheduling !== "macrotask" ? queueMicrotask(() => this._run()) : this._timer = setTimeout(() => this._run(), 0));
  }
  flush() {
    this._scheduled && (this._timer && (clearTimeout(this._timer), this._timer = null), this._run());
  }
  cancel() {
    this._scheduled && (this._scheduled = !1, this._timer && (clearTimeout(this._timer), this._timer = null));
  }
  _run() {
    if (this._scheduled) {
      this._scheduled = !1, this._timer = null;
      try {
        this._flushFn();
      } catch {
      }
    }
  }
}, M = /* @__PURE__ */ new WeakMap(), H = class {
  constructor() {
    this._settled = !1, this._status = "pending", this.promise = new Promise((e, t) => {
      M.set(this, { resolve: (n) => {
        this._settled || (this._settled = !0, this._status = "fulfilled", e(n));
      }, reject: (n) => {
        this._settled || (this._settled = !0, this._status = "rejected", t(n));
      } });
    });
  }
  resolve(e) {
    const t = M.get(this);
    t && typeof t.resolve == "function" && t.resolve(e);
  }
  reject(e) {
    const t = M.get(this);
    t && typeof t.reject == "function" && t.reject(e);
  }
  get settled() {
    return this._settled;
  }
  get status() {
    return this._status;
  }
  get fulfilled() {
    return this._status === "fulfilled";
  }
  get rejected() {
    return this._status === "rejected";
  }
}, B = class {
  constructor(e, t = {}) {
    if (typeof e != "function") throw new TypeError("handler must be a function");
    const { maxSize: n = 1 / 0, scheduling: r = "microtask" } = t;
    this._handler = e, this._maxSize = Number(n) || 1 / 0, this._queue = new T(16), this._pending = null, this._scheduler = new $(() => this._runBatch(), { scheduling: r === "macrotask" ? "macrotask" : "microtask" });
  }
  add(e) {
    if (this._queue.push(e), !this._pending) {
      let t, n;
      this._pending = { promise: new Promise((r, s) => {
        t = r, n = s;
      }), resolve: t, reject: n };
    }
    if (this._queue.length >= this._maxSize) {
      const t = this._pending.promise;
      return this._scheduler.cancel(), this._runBatch(), t;
    }
    return this._scheduler.scheduled || this._scheduler.schedule(), this._pending.promise;
  }
  flush() {
    if (this._queue.length === 0 && !this._scheduler.scheduled) return Promise.resolve();
    if (!this._pending) {
      let e, t;
      this._pending = { promise: new Promise((n, r) => {
        e = n, t = r;
      }), resolve: e, reject: t };
    }
    return this._scheduler.scheduled || this._scheduler.schedule(), this._pending.promise;
  }
  async _runBatch() {
    const e = this._queue.toArray();
    if (e.length === 0) return void (this._pending && (this._pending.resolve(), this._pending = null));
    this._queue.clear();
    const t = this._pending;
    t && (this._pending = null);
    try {
      await this._handler(e), t && t.resolve();
    } catch (n) {
      if (!t) throw n;
      t.reject(n);
    }
  }
  get size() {
    return this._queue.length;
  }
  clear() {
    this._queue.clear(), this._pending && (this._pending.reject(/* @__PURE__ */ new Error("PowerBatch cleared before flush")), this._pending = null), this._scheduler.cancel();
  }
};
const Q = { maxSize: 16, scheduling: "microtask" }, Y = { maxSize: 8, scheduling: "microtask" }, O = { defaultTTL: 6e4, maxEntries: 1e3 };
function v(e) {
  return e == null ? "" : String(e);
}
class J {
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
    tileWorkerSource: t,
    gatherWorkerSource: n = null,
    tilePoolOptions: r = {},
    gatherPoolOptions: s = {},
    tileCacheOptions: i = {},
    gatherCacheOptions: a = {},
    tileBatchOptions: o = {},
    gatherBatchOptions: h = {},
    tileResponseMatcher: u = null,
    gatherResponseMatcher: l = null,
    tileToGather: c = null,
    logger: p = null
  } = {}) {
    if (!t)
      throw new Error("PowerTileManager requires tileWorkerSource");
    this._logger = p || new z(1, { name: "PowerTileManager" }), this._bus = new W({ weak: !1 }), this._requestCounter = 0, this.tilePool = new C(t, r), this.tilePool.addEventListener("message", (f) => this._handleTilePoolMessage(f)), this.tilePool.addEventListener(
      "error",
      (f) => this._emit("error", { path: "tile", error: f })
    ), this.tilePool.addEventListener("idle", () => this._emit("idle", { path: "tile" })), this.gatherPool = n ? new C(n, s) : null, this.gatherPool && (this.gatherPool.addEventListener("message", (f) => this._handleGatherPoolMessage(f)), this.gatherPool.addEventListener(
      "error",
      (f) => this._emit("error", { path: "gather", error: f })
    ), this.gatherPool.addEventListener("idle", () => this._emit("idle", { path: "gather" }))), this.tileCache = new I(Object.assign({}, O, i)), this.gatherCache = this.gatherPool ? new I(Object.assign({}, O, a)) : null, this._tileResponseMatcher = typeof u == "function" ? u : this._defaultTileResponseMatcher, this._gatherResponseMatcher = typeof l == "function" ? l : this._defaultGatherResponseMatcher, this._tileToGather = typeof c == "function" ? c : null, this._pendingTileRequests = /* @__PURE__ */ new Map(), this._pendingGatherRequests = /* @__PURE__ */ new Map(), this._tileBatch = new B(
      (f) => this._dispatchTileBatch(f),
      Object.assign({}, Q, o)
    ), this._gatherBatch = this.gatherPool ? new B(
      (f) => this._dispatchGatherBatch(f),
      Object.assign({}, Y, h)
    ) : null;
  }
  on(t, n) {
    return this._bus.on(t, n);
  }
  off(t, n) {
    this._bus.off(t, n);
  }
  _emit(t, n) {
    try {
      this._bus.emit(t, n);
    } catch (r) {
      this._logger.error(r, `PowerTileManager emit(${t}) failed`);
    }
  }
  _generateRequestId() {
    return `ptm-${Date.now().toString(36)}-${++this._requestCounter}-${Math.floor(Math.random() * 4294967295).toString(16)}`;
  }
  _normalizeMessage(t) {
    if (t instanceof ArrayBuffer || ArrayBuffer.isView(t))
      try {
        return P(t);
      } catch {
        return t;
      }
    return t;
  }
  _defaultTileResponseMatcher(t) {
    if (!t || typeof t != "object") return null;
    const n = t.requestId || t.tileKey || t._tileManager && t._tileManager.requestId;
    return n != null ? { key: v(n), result: t } : null;
  }
  _defaultGatherResponseMatcher(t) {
    if (!t || typeof t != "object") return null;
    const n = t.requestId || t.pieceKey || t._tileManager && t._tileManager.requestId;
    return n != null ? { key: v(n), result: t } : null;
  }
  async _dispatchTileBatch(t) {
    const n = t.map((s) => ({ message: Object.assign({}, s.message || {}, {
      requestId: s.requestId,
      tileKey: s.key,
      _tileManager: {
        requestId: s.requestId,
        tileKey: s.key,
        cacheKey: s.cacheKey,
        gather: s.gather
      }
    }), transfer: s.transfer })), r = this.tilePool.postMessageBatch(n, { zeroCopy: !0 });
    for (let s = 0; s < t.length; s += 1) {
      const i = t[s];
      if (!r[s]) {
        i.reject(new Error("Tile request was rejected by the tile pool")), this._pendingTileRequests.delete(i.requestId);
        continue;
      }
      i.awaitResponse || i.resolve(!0);
    }
    return !0;
  }
  async _dispatchGatherBatch(t) {
    const n = t.map((s) => ({ message: Object.assign({}, s.message || {}, {
      requestId: s.requestId,
      pieceKey: s.key,
      _tileManager: {
        requestId: s.requestId,
        pieceKey: s.key,
        cacheKey: s.cacheKey
      }
    }), transfer: s.transfer })), r = this.gatherPool.postMessageBatch(n, { zeroCopy: !0 });
    for (let s = 0; s < t.length; s += 1) {
      const i = t[s];
      if (!r[s]) {
        i.reject(new Error("Gather request was rejected by the gather pool")), this._pendingGatherRequests.delete(i.requestId);
        continue;
      }
      i.awaitResponse || i.resolve(!0);
    }
    return !0;
  }
  _createRequest(t, n) {
    const r = t.requestId || this._generateRequestId(), s = new H();
    return { request: Object.assign({}, t, {
      requestId: r,
      cacheKey: n ?? t.key,
      resolve: s.resolve,
      reject: s.reject,
      createdAt: Date.now()
    }), promise: s.promise };
  }
  async processTile(t, n, { transfer: r, cacheKey: s, awaitResponse: i = !1, timeout: a = 15e3, gather: o = !0 } = {}) {
    const h = s != null ? String(s) : String(t);
    if (h && this.tileCache.has(h))
      return Promise.resolve(this.tileCache.get(h));
    const u = {
      key: String(t),
      message: n,
      transfer: r,
      awaitResponse: !!i,
      gather: !!o,
      cacheKey: h
    }, { request: l, promise: c } = this._createRequest(u, h);
    return this._pendingTileRequests.set(l.requestId, l), a && Number.isFinite(a) && a > 0 && (l.timeoutId = setTimeout(() => {
      this._pendingTileRequests.has(l.requestId) && (this._pendingTileRequests.delete(l.requestId), l.reject(new Error("Tile request timeout")));
    }, a)), h ? this.tileCache.getOrSetAsync(
      h,
      async () => (await this._tileBatch.add(l), c),
      { ttl: this.tileCache.defaultTTL }
    ) : (await this._tileBatch.add(l), c);
  }
  async enqueueGatherPiece(t, n, { transfer: r, cacheKey: s, awaitResponse: i = !1, timeout: a = 15e3 } = {}) {
    if (!this.gatherPool)
      throw new Error("Gather worker pool is not configured");
    const o = s != null ? String(s) : String(t);
    if (o && this.gatherCache && this.gatherCache.has(o))
      return Promise.resolve(this.gatherCache.get(o));
    const h = {
      key: String(t),
      message: n,
      transfer: r,
      awaitResponse: !!i,
      cacheKey: o
    }, { request: u, promise: l } = this._createRequest(h, o);
    return this._pendingGatherRequests.set(u.requestId, u), a && Number.isFinite(a) && a > 0 && (u.timeoutId = setTimeout(() => {
      this._pendingGatherRequests.has(u.requestId) && (this._pendingGatherRequests.delete(u.requestId), u.reject(new Error("Gather request timeout")));
    }, a)), o && this.gatherCache ? this.gatherCache.getOrSetAsync(
      o,
      async () => (await this._gatherBatch.add(u), l),
      { ttl: this.gatherCache.defaultTTL }
    ) : (await this._gatherBatch.add(u), l);
  }
  _handleTilePoolMessage(t) {
    const n = this._normalizeMessage(t && t.data), r = this._tileResponseMatcher(n), s = r && r.key ? v(r.key) : null, i = r && Object.prototype.hasOwnProperty.call(r, "result") ? r.result : n, a = s ? this._pendingTileRequests.get(s) : null;
    if (a && (clearTimeout(a.timeoutId), this._pendingTileRequests.delete(s), a.resolve(i), a.cacheKey && this.tileCache.has(a.cacheKey) === !1 && this.tileCache.set(a.cacheKey, i)), this._emit("tile:result", {
      result: i,
      requestId: s,
      cacheKey: a && a.cacheKey,
      raw: n
    }), this._tileToGather && this.gatherPool)
      try {
        const o = this._tileToGather(i);
        o && o.message != null && this.enqueueGatherPiece(
          v(
            o.pieceKey || o.requestId || s || `piece-${Date.now().toString(36)}`
          ),
          o.message,
          {
            transfer: o.transfer,
            cacheKey: o.cacheKey,
            awaitResponse: !!o.awaitResponse,
            timeout: o.timeout
          }
        ).catch((h) => {
          this._emit("gather:error", { error: h, source: "tileToGather" });
        });
      } catch (o) {
        this._logger.error(o, "tileToGather mapper failed");
      }
  }
  _handleGatherPoolMessage(t) {
    const n = this._normalizeMessage(t && t.data), r = this._gatherResponseMatcher(n), s = r && r.key ? v(r.key) : null, i = r && Object.prototype.hasOwnProperty.call(r, "result") ? r.result : n, a = s ? this._pendingGatherRequests.get(s) : null;
    a && (clearTimeout(a.timeoutId), this._pendingGatherRequests.delete(s), a.resolve(i), createDeferred, a.cacheKey && this.gatherCache && this.gatherCache.has(a.cacheKey) === !1 && this.gatherCache.set(a.cacheKey, i)), this._emit("gather:result", {
      result: i,
      requestId: s,
      cacheKey: a && a.cacheKey,
      raw: n
    });
  }
  async drain() {
    const t = [this.tilePool.drain()];
    return this.gatherPool && t.push(this.gatherPool.drain()), Promise.all(t).then((n) => ({
      tilePool: n[0],
      gatherPool: n[1] || null
    }));
  }
  shutdown() {
    try {
      this.tilePool && this.tilePool.terminate(), this.gatherPool && this.gatherPool.terminate(), this._tileBatch && this._tileBatch.clear(), this._gatherBatch && this._gatherBatch.clear(), this._pendingTileRequests.clear(), this._pendingGatherRequests.clear(), this._bus.clear();
    } catch (t) {
      this._logger.error(t, "PowerTileManager shutdown failed");
    }
  }
}
function L(e, t, n = /* @__PURE__ */ new WeakMap()) {
  if (e === t) return !0;
  if (e == null || t == null || typeof e != "object" || typeof t != "object" || e.constructor !== t.constructor) return !1;
  if (n.has(e)) return n.get(e) === t;
  if (n.set(e, t), Array.isArray(e)) {
    if (!Array.isArray(t) || e.length !== t.length) return !1;
    for (let i = 0; i < e.length; i += 1)
      if (!L(e[i], t[i], n)) return !1;
    return !0;
  }
  if (e instanceof Date && t instanceof Date) return e.getTime() === t.getTime();
  if (e instanceof RegExp && t instanceof RegExp) return e.toString() === t.toString();
  if (ArrayBuffer.isView(e) && ArrayBuffer.isView(t)) {
    if (e.byteLength !== t.byteLength) return !1;
    const i = new Uint8Array(e.buffer, e.byteOffset, e.byteLength), a = new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
    for (let o = 0; o < i.length; o += 1)
      if (i[o] !== a[o]) return !1;
    return !0;
  }
  const r = Object.keys(e), s = Object.keys(t);
  if (r.length !== s.length) return !1;
  for (const i of r)
    if (!Object.prototype.hasOwnProperty.call(t, i) || !L(e[i], t[i], n)) return !1;
  return !0;
}
class Z {
  constructor(t) {
    this.map = t.map, this.source = t.source instanceof maplibregl.VectorTileSource ? t.source : this.map.getSource(t.source), this.sourceLayer = t.sourceLayer, this.fid = t.fid || "id", this.tiles = this.source.tiles.map((i) => i.split("{z}")[0]), this.tileSize = this.source.tileSize || 512, this.tolerance = t.tolerance || 1e-5, this.cacheSize = t.cacheSize || 5e3, this.units = t.units || "meters", this.seed = !1, this.map.addSource(this.source.id + "-proper", {
      type: "geojson",
      maxzoom: this.source.maxzoom,
      promoteId: "_index",
      data: {}
    }), this.gjSource = this.map.getSource(this.source.id + "-proper");
    const n = new J({
      tileWorkerSource: j,
      gatherWorkerSource: F,
      tilePoolOptions: {
        size: 6,
        minSize: 2,
        maxSize: 6,
        idleTimeout: 3e4,
        taskQueue: !0,
        queuePolicy: "enqueue"
      },
      gatherPoolOptions: {
        size: 4,
        minSize: 2,
        maxSize: 4,
        idleTimeout: 3e4,
        taskQueue: !0
      },
      tileCacheOptions: {
        maxEntries: this.cacheSize,
        defaultTTL: 6e4
      },
      gatherCacheOptions: {
        maxEntries: this.cacheSize,
        defaultTTL: 6e4
      },
      tileToGather: (i) => {
        if (!i || i.type !== "simplified" || !i.unique) return null;
        const { unique: a, type: o, ...h } = i;
        return {
          pieceKey: a,
          cacheKey: `gather:${a}`,
          message: {
            pieces: {
              [a]: h
            },
            tolerance: this.tolerance,
            unit: this.units,
            tileSize: this.tileSize
          },
          awaitResponse: !0
        };
      }
    }), r = { add: /* @__PURE__ */ new Map(), remove: /* @__PURE__ */ new Set() }, s = () => {
      if (r.add.size === 0 && r.remove.size === 0) {
        console.log("No changes to apply, skipping update");
        return;
      }
      console.log(`Applying diff with ${r.add.size} additions and ${r.remove.size} removals`);
      const i = [...r.add.values()], a = [...r.remove];
      this.gjSource.updateData({ add: i, remove: a }), r.add.clear(), r.remove.clear();
    };
    return n.on("gather:result", ({ result: i }) => {
      const a = i && i.id, o = i && i.features;
      if (!a || !Array.isArray(o)) return;
      const h = `gather:${a}`, u = n.gatherCache && n.gatherCache.has(h) ? n.gatherCache.get(h) : void 0;
      u && !L(u, o) ? ([...new Set(u.map((c) => c.properties._index))].forEach((c) => r.remove.add(c)), o.forEach((c) => r.add.set(c.properties._index, c)), n.gatherCache.set(h, o)) : u || (o.forEach((l) => r.add.set(l.properties._index, l)), n.gatherCache.set(h, o));
    }), n.on("idle", (i) => {
      i && i.path === "gather" && s();
    }), this.map.on("sourcedata", (i) => {
      if (i.sourceId === this.source.id) {
        const { z: a, x: o, y: h } = i.tile.tileID.canonical, u = `${a}|${o}|${h}`, l = this.tolerance * Math.pow(10, -0.301 * a + 5.19), c = [], p = this.source.type === "vector" ? { sourceLayer: this.sourceLayer } : {};
        i.tile.querySourceFeatures(c, p);
        const f = {
          collection: {
            type: "FeatureCollection",
            features: c.map((g, d) => ({
              id: g.properties[this.fid] || g.id,
              geometry: g.geometry,
              properties: {
                ...g.properties,
                _index: `${u}|${d}`,
                _tile: u,
                _group: g.properties[this.fid]
              }
            }))
          },
          tolerance: l,
          unique: u,
          tileSize: this.tileSize
        };
        n.processTile(u, f, {
          cacheKey: u,
          awaitResponse: !0,
          timeout: 15e3
        }).catch((g) => {
          console.error("PowerTileManager tile processing failed", g);
        });
      }
    }), this.map.refreshTiles(this.source.id), this.gjSource;
  }
}
maplibregl.VectorTileSource.prototype.ProperLabels = function(e) {
  const t = Object.assign({}, e, {
    map: this._map,
    source: this
  });
  return this._proper || (this._proper = new Z(t)), this._proper;
};
export {
  Z as default
};
