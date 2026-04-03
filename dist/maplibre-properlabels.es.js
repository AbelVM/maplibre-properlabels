const A = `function x(e, r, t = {}) {
  const o = { type: "Feature" };
  return (t.id === 0 || t.id) && (o.id = t.id), t.bbox && (o.bbox = t.bbox), o.properties = r || {}, o.geometry = e, o;
}
function C(e, r = {}) {
  const t = { type: "FeatureCollection" };
  return r.id && (t.id = r.id), r.bbox && (t.bbox = r.bbox), t.features = e, t;
}
function P(e, r) {
  var t, o, c, a, y, s, f, n, i, u, p = 0, d = e.type === "FeatureCollection", l = e.type === "Feature", h = d ? e.features.length : 1;
  for (t = 0; t < h; t++) {
    for (s = d ? (
      // @ts-expect-error: Known type conflict
      e.features[t].geometry
    ) : l ? (
      // @ts-expect-error: Known type conflict
      e.geometry
    ) : e, n = d ? (
      // @ts-expect-error: Known type conflict
      e.features[t].properties
    ) : l ? (
      // @ts-expect-error: Known type conflict
      e.properties
    ) : {}, i = d ? (
      // @ts-expect-error: Known type conflict
      e.features[t].bbox
    ) : l ? (
      // @ts-expect-error: Known type conflict
      e.bbox
    ) : void 0, u = d ? (
      // @ts-expect-error: Known type conflict
      e.features[t].id
    ) : l ? (
      // @ts-expect-error: Known type conflict
      e.id
    ) : void 0, f = s ? s.type === "GeometryCollection" : !1, y = f ? s.geometries.length : 1, c = 0; c < y; c++) {
      if (a = f ? s.geometries[c] : s, a === null) {
        if (
          // @ts-expect-error: Known type conflict
          r(
            // @ts-expect-error: Known type conflict
            null,
            p,
            n,
            i,
            u
          ) === !1
        )
          return !1;
        continue;
      }
      switch (a.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            // @ts-expect-error: Known type conflict
            r(
              a,
              p,
              n,
              i,
              u
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (o = 0; o < a.geometries.length; o++)
            if (
              // @ts-expect-error: Known type conflict
              r(
                a.geometries[o],
                p,
                n,
                i,
                u
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    p++;
  }
}
function T(e, r) {
  P(e, function(t, o, c, a, y) {
    var s = t === null ? null : t.type;
    switch (s) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          r(
            x(t, c, { bbox: a, id: y }),
            o,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var f;
    switch (s) {
      case "MultiPoint":
        f = "Point";
        break;
      case "MultiLineString":
        f = "LineString";
        break;
      case "MultiPolygon":
        f = "Polygon";
        break;
    }
    for (
      var n = 0;
      // @ts-expect-error: Known type conflict
      n < t.coordinates.length;
      n++
    ) {
      var i = t.coordinates[n], u = {
        type: f,
        coordinates: i
      };
      if (
        // @ts-expect-error: Known type conflict
        r(x(u, c), o, n) === !1
      )
        return !1;
    }
  });
}
function E(e) {
  if (!e) throw new Error("geojson is required");
  var r = [];
  return T(e, function(t) {
    r.push(t);
  }), C(r);
}
const L = typeof TextEncoder < "u", v = typeof TextDecoder < "u", A = L ? new TextEncoder() : null, B = v ? new TextDecoder() : null, U = (e) => {
  if (e instanceof Uint8Array) return e;
  if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  if (e instanceof ArrayBuffer) return new Uint8Array(e);
  const r = JSON.stringify(e);
  if (A) return A.encode(r);
  if (typeof Buffer < "u" && typeof Buffer.from == "function") return new Uint8Array(Buffer.from(r));
  throw new Error("No TextEncoder available to encode object");
}, F = (e) => {
  let r;
  if (e instanceof Uint8Array) r = e;
  else if (ArrayBuffer.isView(e)) r = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  else if (e instanceof ArrayBuffer) r = new Uint8Array(e);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(e)) r = new Uint8Array(e);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  return B ? JSON.parse(B.decode(r)) : typeof Buffer < "u" && typeof Buffer.from == "function" ? JSON.parse(Buffer.from(r).toString("utf8")) : JSON.parse(new TextDecoder().decode(r));
}, S = (e) => {
  const r = U(e);
  return r.byteOffset === 0 && r.byteLength === r.buffer.byteLength ? r.buffer : r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength);
}, G = (e) => F(e), N = (e, r, t) => {
  const [o, c, a] = r.split("|").map(Number), y = Math.pow(2, o) * t, s = 85.05112878, f = 1;
  if (!e[0]?.some)
    debugger;
  return e[0].some((i) => {
    const u = Math.max(Math.min(i[1], s), -s), p = Math.sin(u * Math.PI / 180), d = (i[0] + 180) / 360, l = 0.5 - Math.log((1 + p) / (1 - p)) / (4 * Math.PI), h = d * y, b = l * y, g = Math.floor(h / t), w = Math.floor(b / t), m = Math.floor(h - g * t), M = Math.floor(b - w * t);
    return w != a || g != c || m <= f || M <= f || m >= t - f || M >= t - f;
  });
};
function k(e, r = {}) {
  const { unique: t = !1 } = r, o = t ? /* @__PURE__ */ new Set() : null;
  let c = 0;
  const a = (n) => Array.isArray(n) && n.length >= 2 && typeof n[0] == "number" && typeof n[1] == "number", y = (n) => {
    t ? o.add(n.slice(0, 3).join(",")) : c++;
  };
  function s(n) {
    if (a(n)) {
      y(n);
      return;
    }
    if (Array.isArray(n)) for (const i of n) s(i);
  }
  function f(n) {
    if (n) {
      if (n.type === "FeatureCollection") {
        for (const i of n.features || []) f(i);
        return;
      }
      if (n.type === "Feature") {
        f(n.geometry);
        return;
      }
      if (n.type === "GeometryCollection") {
        for (const i of n.geometries || []) f(i);
        return;
      }
      n.coordinates !== void 0 && s(n.coordinates);
    }
  }
  return f(e), t ? o.size : c;
}
const O = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
O.onmessage = (e) => {
  const r = e.data, t = G(r);
  t.tolerance;
  const o = t.unique, c = t.tileSize, a = /* @__PURE__ */ new Map();
  t.collection.features.forEach((i) => {
    const u = i.id, p = a.get(u) || [];
    p.push(i), a.set(u, p);
  });
  let y = 0;
  const s = /* @__PURE__ */ new Map();
  a.forEach((i, u) => {
    const p = E({ type: "FeatureCollection", features: i }), d = { type: "FeatureCollection", features: [] };
    d.features = p.features.filter((l) => l.geometry.type === "Polygon").map((l, h) => {
      const b = \`\${o}|\${u}|\${h}\`, g = N(l.geometry.coordinates, l.properties._tile, c), w = Object.assign({}, l.properties, { _index: b, clipped: g }), m = { type: "Feature", geometry: l.geometry, properties: w };
      return y += k(m), m;
    }), s.set(u, d);
  });
  const f = Object.fromEntries(s), n = Object.assign({}, f, { unique: o, type: "simplified", size: y });
  O.postMessage(S(n));
};
`, b = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", A], { type: "text/javascript;charset=utf-8" });
function O(a) {
  let n;
  try {
    if (n = b && (self.URL || self.webkitURL).createObjectURL(b), !n) throw "";
    const e = new Worker(n, {
      type: "module",
      name: a?.name
    });
    return e.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(n);
    }), e;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(A),
      {
        type: "module",
        name: a?.name
      }
    );
  }
}
const P = `var et = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Oe = Math.ceil, H = Math.floor, V = "[BigNumber Error] ", Be = V + "Number primitive has more than 15 significant digits: ", J = 1e14, P = 14, Re = 9007199254740991, _e = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], se = 1e7, U = 1e9;
function Ze(i) {
  var e, t, n, r = T.prototype = { constructor: T, toString: null, valueOf: null }, u = new T(1), a = 20, f = 4, E = -7, p = 21, b = -1e7, v = 1e7, O = !1, L = 1, I = 0, M = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, q = "0123456789abcdefghijklmnopqrstuvwxyz", F = !0;
  function T(s, o) {
    var l, m, c, y, w, h, g, x, d = this;
    if (!(d instanceof T)) return new T(s, o);
    if (o == null) {
      if (s && s._isBigNumber === !0) {
        d.s = s.s, !s.c || s.e > v ? d.c = d.e = null : s.e < b ? d.c = [d.e = 0] : (d.e = s.e, d.c = s.c.slice());
        return;
      }
      if ((h = typeof s == "number") && s * 0 == 0) {
        if (d.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (y = 0, w = s; w >= 10; w /= 10, y++) ;
          y > v ? d.c = d.e = null : (d.e = y, d.c = [s]);
          return;
        }
        x = String(s);
      } else {
        if (!et.test(x = String(s))) return n(d, x, h);
        d.s = x.charCodeAt(0) == 45 ? (x = x.slice(1), -1) : 1;
      }
      (y = x.indexOf(".")) > -1 && (x = x.replace(".", "")), (w = x.search(/e/i)) > 0 ? (y < 0 && (y = w), y += +x.slice(w + 1), x = x.substring(0, w)) : y < 0 && (y = x.length);
    } else {
      if (B(o, 2, q.length, "Base"), o == 10 && F)
        return d = new T(s), K(d, a + d.e + 1, f);
      if (x = String(s), h = typeof s == "number") {
        if (s * 0 != 0) return n(d, x, h, o);
        if (d.s = 1 / s < 0 ? (x = x.slice(1), -1) : 1, T.DEBUG && x.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(Be + s);
      } else
        d.s = x.charCodeAt(0) === 45 ? (x = x.slice(1), -1) : 1;
      for (l = q.slice(0, o), y = w = 0, g = x.length; w < g; w++)
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
      if (g -= w, h && T.DEBUG && g > 15 && (s > Re || s !== H(s)))
        throw Error(Be + d.s * s);
      if ((y = y - w - 1) > v)
        d.c = d.e = null;
      else if (y < b)
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
  T.clone = Ze, T.ROUND_UP = 0, T.ROUND_DOWN = 1, T.ROUND_CEIL = 2, T.ROUND_FLOOR = 3, T.ROUND_HALF_UP = 4, T.ROUND_HALF_DOWN = 5, T.ROUND_HALF_EVEN = 6, T.ROUND_HALF_CEIL = 7, T.ROUND_HALF_FLOOR = 8, T.EUCLID = 9, T.config = T.set = function(s) {
    var o, l;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(o = "DECIMAL_PLACES") && (l = s[o], B(l, 0, U, o), a = l), s.hasOwnProperty(o = "ROUNDING_MODE") && (l = s[o], B(l, 0, 8, o), f = l), s.hasOwnProperty(o = "EXPONENTIAL_AT") && (l = s[o], l && l.pop ? (B(l[0], -U, 0, o), B(l[1], 0, U, o), E = l[0], p = l[1]) : (B(l, -U, U, o), E = -(p = l < 0 ? -l : l))), s.hasOwnProperty(o = "RANGE"))
          if (l = s[o], l && l.pop)
            B(l[0], -U, -1, o), B(l[1], 1, U, o), b = l[0], v = l[1];
          else if (B(l, -U, U, o), l)
            b = -(v = l < 0 ? -l : l);
          else
            throw Error(V + o + " cannot be zero: " + l);
        if (s.hasOwnProperty(o = "CRYPTO"))
          if (l = s[o], l === !!l)
            if (l)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                O = l;
              else
                throw O = !l, Error(V + "crypto unavailable");
            else
              O = l;
          else
            throw Error(V + o + " not true or false: " + l);
        if (s.hasOwnProperty(o = "MODULO_MODE") && (l = s[o], B(l, 0, 9, o), L = l), s.hasOwnProperty(o = "POW_PRECISION") && (l = s[o], B(l, 0, U, o), I = l), s.hasOwnProperty(o = "FORMAT"))
          if (l = s[o], typeof l == "object") M = l;
          else throw Error(V + o + " not an object: " + l);
        if (s.hasOwnProperty(o = "ALPHABET"))
          if (l = s[o], typeof l == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(l))
            F = l.slice(0, 10) == "0123456789", q = l;
          else
            throw Error(V + o + " invalid: " + l);
      } else
        throw Error(V + "Object expected: " + s);
    return {
      DECIMAL_PLACES: a,
      ROUNDING_MODE: f,
      EXPONENTIAL_AT: [E, p],
      RANGE: [b, v],
      CRYPTO: O,
      MODULO_MODE: L,
      POW_PRECISION: I,
      FORMAT: M,
      ALPHABET: q
    };
  }, T.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!T.DEBUG) return !0;
    var o, l, m = s.c, c = s.e, y = s.s;
    e: if ({}.toString.call(m) == "[object Array]") {
      if ((y === 1 || y === -1) && c >= -U && c <= U && c === H(c)) {
        if (m[0] === 0) {
          if (c === 0 && m.length === 1) return !0;
          break e;
        }
        if (o = (c + 1) % P, o < 1 && (o += P), String(m[0]).length == o) {
          for (o = 0; o < m.length; o++)
            if (l = m[o], l < 0 || l >= J || l !== H(l)) break e;
          if (l !== 0) return !0;
        }
      }
    } else if (m === null && c === null && (y === null || y === 1 || y === -1))
      return !0;
    throw Error(V + "Invalid BigNumber: " + s);
  }, T.maximum = T.max = function() {
    return Q(arguments, -1);
  }, T.minimum = T.min = function() {
    return Q(arguments, 1);
  }, T.random = (function() {
    var s = 9007199254740992, o = Math.random() * s & 2097151 ? function() {
      return H(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(l) {
      var m, c, y, w, h, g = 0, x = [], d = new T(u);
      if (l == null ? l = a : B(l, 0, U), w = Oe(l / P), O)
        if (crypto.getRandomValues) {
          for (m = crypto.getRandomValues(new Uint32Array(w *= 2)); g < w; )
            h = m[g] * 131072 + (m[g + 1] >>> 11), h >= 9e15 ? (c = crypto.getRandomValues(new Uint32Array(2)), m[g] = c[0], m[g + 1] = c[1]) : (x.push(h % 1e14), g += 2);
          g = w / 2;
        } else if (crypto.randomBytes) {
          for (m = crypto.randomBytes(w *= 7); g < w; )
            h = (m[g] & 31) * 281474976710656 + m[g + 1] * 1099511627776 + m[g + 2] * 4294967296 + m[g + 3] * 16777216 + (m[g + 4] << 16) + (m[g + 5] << 8) + m[g + 6], h >= 9e15 ? crypto.randomBytes(7).copy(m, g) : (x.push(h % 1e14), g += 7);
          g = w / 7;
        } else
          throw O = !1, Error(V + "crypto unavailable");
      if (!O)
        for (; g < w; )
          h = o(), h < 9e15 && (x[g++] = h % 1e14);
      for (w = x[--g], l %= P, w && l && (h = _e[P - l], x[g] = H(w / h) * h); x[g] === 0; x.pop(), g--) ;
      if (g < 0)
        x = [y = 0];
      else {
        for (y = -1; x[0] === 0; x.splice(0, 1), y -= P) ;
        for (g = 1, h = x[0]; h >= 10; h /= 10, g++) ;
        g < P && (y -= P - g);
      }
      return d.e = y, d.c = x, d;
    };
  })(), T.sum = function() {
    for (var s = 1, o = arguments, l = new T(o[0]); s < o.length; ) l = l.plus(o[s++]);
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
      var h, g, x, d, S, R, _, N, k = l.indexOf("."), D = a, A = f;
      for (k >= 0 && (d = I, I = 0, l = l.replace(".", ""), N = new T(m), R = N.pow(l.length - k), I = d, N.c = o(
        ne(Y(R.c), R.e, "0"),
        10,
        c,
        s
      ), N.e = N.c.length), _ = o(l, m, c, w ? (h = q, s) : (h = s, q)), x = d = _.length; _[--d] == 0; _.pop()) ;
      if (!_[0]) return h.charAt(0);
      if (k < 0 ? --x : (R.c = _, R.e = x, R.s = y, R = e(R, N, D, A, c), _ = R.c, S = R.r, x = R.e), g = x + D + 1, k = _[g], d = c / 2, S = S || g < 0 || _[g + 1] != null, S = A < 4 ? (k != null || S) && (A == 0 || A == (R.s < 0 ? 3 : 2)) : k > d || k == d && (A == 4 || S || A == 6 && _[g - 1] & 1 || A == (R.s < 0 ? 8 : 7)), g < 1 || !_[0])
        l = S ? ne(h.charAt(1), -D, h.charAt(0)) : h.charAt(0);
      else {
        if (_.length = g, S)
          for (--c; ++_[--g] > c; )
            _[g] = 0, g || (++x, _ = [1].concat(_));
        for (d = _.length; !_[--d]; ) ;
        for (k = 0, l = ""; k <= d; l += h.charAt(_[k++])) ;
        l = ne(l, x, h.charAt(0));
      }
      return l;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(m, c, y) {
      var w, h, g, x, d = 0, S = m.length, R = c % se, _ = c / se | 0;
      for (m = m.slice(); S--; )
        g = m[S] % se, x = m[S] / se | 0, w = _ * g + x * R, h = R * g + w % se * se + d, d = (h / y | 0) + (w / se | 0) + _ * x, m[S] = h % y;
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
      var g, x, d, S, R, _, N, k, D, A, C, z, ce, Te, be, j, le, X = m.s == c.s ? 1 : -1, $ = m.c, G = c.c;
      if (!$ || !$[0] || !G || !G[0])
        return new T(
          // Return NaN if either NaN, or both Infinity or 0.
          !m.s || !c.s || ($ ? G && $[0] == G[0] : !G) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            $ && $[0] == 0 || !G ? X * 0 : X / 0
          )
        );
      for (k = new T(X), D = k.c = [], x = m.e - c.e, X = y + x + 1, h || (h = J, x = Z(m.e / P) - Z(c.e / P), X = X / P | 0), d = 0; G[d] == ($[d] || 0); d++) ;
      if (G[d] > ($[d] || 0) && x--, X < 0)
        D.push(1), S = !0;
      else {
        for (Te = $.length, j = G.length, d = 0, X += 2, R = H(h / (G[0] + 1)), R > 1 && (G = s(G, R, h), $ = s($, R, h), j = G.length, Te = $.length), ce = j, A = $.slice(0, j), C = A.length; C < j; A[C++] = 0) ;
        le = G.slice(), le = [0].concat(le), be = G[0], G[1] >= h / 2 && be++;
        do {
          if (R = 0, g = o(G, A, j, C), g < 0) {
            if (z = A[0], j != C && (z = z * h + (A[1] || 0)), R = H(z / be), R > 1)
              for (R >= h && (R = h - 1), _ = s(G, R, h), N = _.length, C = A.length; o(_, A, N, C) == 1; )
                R--, l(_, j < N ? le : G, N, h), N = _.length, g = 1;
            else
              R == 0 && (g = R = 1), _ = G.slice(), N = _.length;
            if (N < C && (_ = [0].concat(_)), l(A, _, C, h), C = A.length, g == -1)
              for (; o(G, A, j, C) < 1; )
                R++, l(A, j < C ? le : G, C, h), C = A.length;
          } else g === 0 && (R++, A = [0]);
          D[d++] = R, A[0] ? A[C++] = $[ce] || 0 : (A = [$[ce]], C = 1);
        } while ((ce++ < Te || A[0] != null) && X--);
        S = A[0] != null, D[0] || D.splice(0, 1);
      }
      if (h == J) {
        for (d = 1, X = D[0]; X >= 10; X /= 10, d++) ;
        K(k, y + (k.e = d + x * P - 1) + 1, w, S);
      } else
        k.e = x, k.r = +S;
      return k;
    };
  })();
  function W(s, o, l, m) {
    var c, y, w, h, g;
    if (l == null ? l = f : B(l, 0, 8), !s.c) return s.toString();
    if (c = s.c[0], w = s.e, o == null)
      g = Y(s.c), g = m == 1 || m == 2 && (w <= E || w >= p) ? ge(g, w) : ne(g, w, "0");
    else if (s = K(new T(s), o, l), y = s.e, g = Y(s.c), h = g.length, m == 1 || m == 2 && (o <= y || y <= E)) {
      for (; h < o; g += "0", h++) ;
      g = ge(g, y);
    } else if (o -= w + (m === 2 && y > w), g = ne(g, y, "0"), y + 1 > h) {
      if (--o > 0) for (g += "."; o--; g += "0") ;
    } else if (o += y - h, o > 0)
      for (y + 1 == h && (g += "."); o--; g += "0") ;
    return s.s < 0 && c ? "-" + g : g;
  }
  function Q(s, o) {
    for (var l, m, c = 1, y = new T(s[0]); c < s.length; c++)
      m = new T(s[c]), (!m.s || (l = oe(y, m)) === o || l === 0 && y.s === o) && (y = m);
    return y;
  }
  function Se(s, o, l) {
    for (var m = 1, c = o.length; !o[--c]; o.pop()) ;
    for (c = o[0]; c >= 10; c /= 10, m++) ;
    return (l = m + l * P - 1) > v ? s.c = s.e = null : l < b ? s.c = [s.e = 0] : (s.e = l, s.c = o), s;
  }
  n = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, o = /^([^.]+)\\.$/, l = /^\\.([^.]+)$/, m = /^-?(Infinity|NaN)$/, c = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(y, w, h, g) {
      var x, d = h ? w : w.replace(c, "");
      if (m.test(d))
        y.s = isNaN(d) ? null : d < 0 ? -1 : 1;
      else {
        if (!h && (d = d.replace(s, function(S, R, _) {
          return x = (_ = _.toLowerCase()) == "x" ? 16 : _ == "b" ? 2 : 8, !g || g == x ? R : S;
        }), g && (x = g, d = d.replace(o, "$1").replace(l, "0.$1")), w != d))
          return new T(d, x);
        if (T.DEBUG)
          throw Error(V + "Not a" + (g ? " base " + g : "") + " number: " + w);
        y.s = null;
      }
      y.c = y.e = null;
    };
  })();
  function K(s, o, l, m) {
    var c, y, w, h, g, x, d, S = s.c, R = _e;
    if (S) {
      e: {
        for (c = 1, h = S[0]; h >= 10; h /= 10, c++) ;
        if (y = o - c, y < 0)
          y += P, w = o, g = S[x = 0], d = H(g / R[c - w - 1] % 10);
        else if (x = Oe((y + 1) / P), x >= S.length)
          if (m) {
            for (; S.length <= x; S.push(0)) ;
            g = d = 0, c = 1, y %= P, w = y - P + 1;
          } else
            break e;
        else {
          for (g = h = S[x], c = 1; h >= 10; h /= 10, c++) ;
          y %= P, w = y - P + c, d = w < 0 ? 0 : H(g / R[c - w - 1] % 10);
        }
        if (m = m || o < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        S[x + 1] != null || (w < 0 ? g : g % R[c - w - 1]), m = l < 4 ? (d || m) && (l == 0 || l == (s.s < 0 ? 3 : 2)) : d > 5 || d == 5 && (l == 4 || m || l == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? w > 0 ? g / R[c - w] : 0 : S[x - 1]) % 10 & 1 || l == (s.s < 0 ? 8 : 7)), o < 1 || !S[0])
          return S.length = 0, m ? (o -= s.e + 1, S[0] = R[(P - o % P) % P], s.e = -o || 0) : S[0] = s.e = 0, s;
        if (y == 0 ? (S.length = x, h = 1, x--) : (S.length = x + 1, h = R[P - y], S[x] = w > 0 ? H(g / R[c - w] % R[w]) * h : 0), m)
          for (; ; )
            if (x == 0) {
              for (y = 1, w = S[0]; w >= 10; w /= 10, y++) ;
              for (w = S[0] += h, h = 1; w >= 10; w /= 10, h++) ;
              y != h && (s.e++, S[0] == J && (S[0] = 1));
              break;
            } else {
              if (S[x] += h, S[x] != J) break;
              S[x--] = 0, h = 1;
            }
        for (y = S.length; S[--y] === 0; S.pop()) ;
      }
      s.e > v ? s.c = s.e = null : s.e < b && (s.c = [s.e = 0]);
    }
    return s;
  }
  function ie(s) {
    var o, l = s.e;
    return l === null ? s.toString() : (o = Y(s.c), o = l <= E || l >= p ? ge(o, l) : ne(o, l, "0"), s.s < 0 ? "-" + o : o);
  }
  return r.absoluteValue = r.abs = function() {
    var s = new T(this);
    return s.s < 0 && (s.s = 1), s;
  }, r.comparedTo = function(s, o) {
    return oe(this, new T(s, o));
  }, r.decimalPlaces = r.dp = function(s, o) {
    var l, m, c, y = this;
    if (s != null)
      return B(s, 0, U), o == null ? o = f : B(o, 0, 8), K(new T(y), s + y.e + 1, o);
    if (!(l = y.c)) return null;
    if (m = ((c = l.length - 1) - Z(this.e / P)) * P, c = l[c]) for (; c % 10 == 0; c /= 10, m--) ;
    return m < 0 && (m = 0), m;
  }, r.dividedBy = r.div = function(s, o) {
    return e(this, new T(s, o), a, f);
  }, r.dividedToIntegerBy = r.idiv = function(s, o) {
    return e(this, new T(s, o), 0, 1);
  }, r.exponentiatedBy = r.pow = function(s, o) {
    var l, m, c, y, w, h, g, x, d, S = this;
    if (s = new T(s), s.c && !s.isInteger())
      throw Error(V + "Exponent not an integer: " + ie(s));
    if (o != null && (o = new T(o)), h = s.e > 14, !S.c || !S.c[0] || S.c[0] == 1 && !S.e && S.c.length == 1 || !s.c || !s.c[0])
      return d = new T(Math.pow(+ie(S), h ? s.s * (2 - pe(s)) : +ie(s))), o ? d.mod(o) : d;
    if (g = s.s < 0, o) {
      if (o.c ? !o.c[0] : !o.s) return new T(NaN);
      m = !g && S.isInteger() && o.isInteger(), m && (S = S.mod(o));
    } else {
      if (s.e > 9 && (S.e > 0 || S.e < -1 || (S.e == 0 ? S.c[0] > 1 || h && S.c[1] >= 24e7 : S.c[0] < 8e13 || h && S.c[0] <= 9999975e7)))
        return y = S.s < 0 && pe(s) ? -0 : 0, S.e > -1 && (y = 1 / y), new T(g ? 1 / y : y);
      I && (y = Oe(I / P + 2));
    }
    for (h ? (l = new T(0.5), g && (s.s = 1), x = pe(s)) : (c = Math.abs(+ie(s)), x = c % 2), d = new T(u); ; ) {
      if (x) {
        if (d = d.times(S), !d.c) break;
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
      S = S.times(S), y ? S.c && S.c.length > y && (S.c.length = y) : m && (S = S.mod(o));
    }
    return m ? d : (g && (d = u.div(d)), o ? d.mod(o) : y ? K(d, I, f, w) : d);
  }, r.integerValue = function(s) {
    var o = new T(this);
    return s == null ? s = f : B(s, 0, 8), K(o, o.e + 1, s);
  }, r.isEqualTo = r.eq = function(s, o) {
    return oe(this, new T(s, o)) === 0;
  }, r.isFinite = function() {
    return !!this.c;
  }, r.isGreaterThan = r.gt = function(s, o) {
    return oe(this, new T(s, o)) > 0;
  }, r.isGreaterThanOrEqualTo = r.gte = function(s, o) {
    return (o = oe(this, new T(s, o))) === 1 || o === 0;
  }, r.isInteger = function() {
    return !!this.c && Z(this.e / P) > this.c.length - 2;
  }, r.isLessThan = r.lt = function(s, o) {
    return oe(this, new T(s, o)) < 0;
  }, r.isLessThanOrEqualTo = r.lte = function(s, o) {
    return (o = oe(this, new T(s, o))) === -1 || o === 0;
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
    if (s = new T(s, o), o = s.s, !h || !o) return new T(NaN);
    if (h != o)
      return s.s = -o, w.plus(s);
    var g = w.e / P, x = s.e / P, d = w.c, S = s.c;
    if (!g || !x) {
      if (!d || !S) return d ? (s.s = -o, s) : new T(S ? w : NaN);
      if (!d[0] || !S[0])
        return S[0] ? (s.s = -o, s) : new T(d[0] ? w : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          f == 3 ? -0 : 0
        ));
    }
    if (g = Z(g), x = Z(x), d = d.slice(), h = g - x) {
      for ((y = h < 0) ? (h = -h, c = d) : (x = g, c = S), c.reverse(), o = h; o--; c.push(0)) ;
      c.reverse();
    } else
      for (m = (y = (h = d.length) < (o = S.length)) ? h : o, h = o = 0; o < m; o++)
        if (d[o] != S[o]) {
          y = d[o] < S[o];
          break;
        }
    if (y && (c = d, d = S, S = c, s.s = -s.s), o = (m = S.length) - (l = d.length), o > 0) for (; o--; d[l++] = 0) ;
    for (o = J - 1; m > h; ) {
      if (d[--m] < S[m]) {
        for (l = m; l && !d[--l]; d[l] = o) ;
        --d[l], d[m] += J;
      }
      d[m] -= S[m];
    }
    for (; d[0] == 0; d.splice(0, 1), --x) ;
    return d[0] ? Se(s, d, x) : (s.s = f == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, r.modulo = r.mod = function(s, o) {
    var l, m, c = this;
    return s = new T(s, o), !c.c || !s.s || s.c && !s.c[0] ? new T(NaN) : !s.c || c.c && !c.c[0] ? new T(c) : (L == 9 ? (m = s.s, s.s = 1, l = e(c, s, 0, 3), s.s = m, l.s *= m) : l = e(c, s, 0, L), s = c.minus(l.times(s)), !s.c[0] && L == 1 && (s.s = c.s), s);
  }, r.multipliedBy = r.times = function(s, o) {
    var l, m, c, y, w, h, g, x, d, S, R, _, N, k, D, A = this, C = A.c, z = (s = new T(s, o)).c;
    if (!C || !z || !C[0] || !z[0])
      return !A.s || !s.s || C && !C[0] && !z || z && !z[0] && !C ? s.c = s.e = s.s = null : (s.s *= A.s, !C || !z ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (m = Z(A.e / P) + Z(s.e / P), s.s *= A.s, g = C.length, S = z.length, g < S && (N = C, C = z, z = N, c = g, g = S, S = c), c = g + S, N = []; c--; N.push(0)) ;
    for (k = J, D = se, c = S; --c >= 0; ) {
      for (l = 0, R = z[c] % D, _ = z[c] / D | 0, w = g, y = c + w; y > c; )
        x = C[--w] % D, d = C[w] / D | 0, h = _ * x + d * R, x = R * x + h % D * D + N[y] + l, l = (x / k | 0) + (h / D | 0) + _ * d, N[y--] = x % k;
      N[y] = l;
    }
    return l ? ++m : N.splice(0, 1), Se(s, N, m);
  }, r.negated = function() {
    var s = new T(this);
    return s.s = -s.s || null, s;
  }, r.plus = function(s, o) {
    var l, m = this, c = m.s;
    if (s = new T(s, o), o = s.s, !c || !o) return new T(NaN);
    if (c != o)
      return s.s = -o, m.minus(s);
    var y = m.e / P, w = s.e / P, h = m.c, g = s.c;
    if (!y || !w) {
      if (!h || !g) return new T(c / 0);
      if (!h[0] || !g[0]) return g[0] ? s : new T(h[0] ? m : c * 0);
    }
    if (y = Z(y), w = Z(w), h = h.slice(), c = y - w) {
      for (c > 0 ? (w = y, l = g) : (c = -c, l = h), l.reverse(); c--; l.push(0)) ;
      l.reverse();
    }
    for (c = h.length, o = g.length, c - o < 0 && (l = g, g = h, h = l, o = c), c = 0; o; )
      c = (h[--o] = h[o] + g[o] + c) / J | 0, h[o] = J === h[o] ? 0 : h[o] % J;
    return c && (h = [c].concat(h), ++w), Se(s, h, w);
  }, r.precision = r.sd = function(s, o) {
    var l, m, c, y = this;
    if (s != null && s !== !!s)
      return B(s, 1, U), o == null ? o = f : B(o, 0, 8), K(new T(y), s, o);
    if (!(l = y.c)) return null;
    if (c = l.length - 1, m = c * P + 1, c = l[c]) {
      for (; c % 10 == 0; c /= 10, m--) ;
      for (c = l[0]; c >= 10; c /= 10, m++) ;
    }
    return s && y.e + 1 > m && (m = y.e + 1), m;
  }, r.shiftedBy = function(s) {
    return B(s, -Re, Re), this.times("1e" + s);
  }, r.squareRoot = r.sqrt = function() {
    var s, o, l, m, c, y = this, w = y.c, h = y.s, g = y.e, x = a + 4, d = new T("0.5");
    if (h !== 1 || !w || !w[0])
      return new T(!h || h < 0 && (!w || w[0]) ? NaN : w ? y : 1 / 0);
    if (h = Math.sqrt(+ie(y)), h == 0 || h == 1 / 0 ? (o = Y(w), (o.length + g) % 2 == 0 && (o += "0"), h = Math.sqrt(+o), g = Z((g + 1) / 2) - (g < 0 || g % 2), h == 1 / 0 ? o = "5e" + g : (o = h.toExponential(), o = o.slice(0, o.indexOf("e") + 1) + g), l = new T(o)) : l = new T(h + ""), l.c[0]) {
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
    return s != null && (B(s, 0, U), s++), W(this, s, o, 1);
  }, r.toFixed = function(s, o) {
    return s != null && (B(s, 0, U), s = s + this.e + 1), W(this, s, o);
  }, r.toFormat = function(s, o, l) {
    var m, c = this;
    if (l == null)
      s != null && o && typeof o == "object" ? (l = o, o = null) : s && typeof s == "object" ? (l = s, s = o = null) : l = M;
    else if (typeof l != "object")
      throw Error(V + "Argument not an object: " + l);
    if (m = c.toFixed(s, o), c.c) {
      var y, w = m.split("."), h = +l.groupSize, g = +l.secondaryGroupSize, x = l.groupSeparator || "", d = w[0], S = w[1], R = c.s < 0, _ = R ? d.slice(1) : d, N = _.length;
      if (g && (y = h, h = g, g = y, N -= y), h > 0 && N > 0) {
        for (y = N % h || h, d = _.substr(0, y); y < N; y += h) d += x + _.substr(y, h);
        g > 0 && (d += x + _.slice(y)), R && (d = "-" + d);
      }
      m = S ? d + (l.decimalSeparator || "") + ((g = +l.fractionGroupSize) ? S.replace(
        new RegExp("\\\\d{" + g + "}\\\\B", "g"),
        "$&" + (l.fractionGroupSeparator || "")
      ) : S) : d;
    }
    return (l.prefix || "") + m + (l.suffix || "");
  }, r.toFraction = function(s) {
    var o, l, m, c, y, w, h, g, x, d, S, R, _ = this, N = _.c;
    if (s != null && (h = new T(s), !h.isInteger() && (h.c || h.s !== 1) || h.lt(u)))
      throw Error(V + "Argument " + (h.isInteger() ? "out of range: " : "not an integer: ") + ie(h));
    if (!N) return new T(_);
    for (o = new T(u), x = l = new T(u), m = g = new T(u), R = Y(N), y = o.e = R.length - _.e - 1, o.c[0] = _e[(w = y % P) < 0 ? P + w : w], s = !s || h.comparedTo(o) > 0 ? y > 0 ? o : x : h, w = v, v = 1 / 0, h = new T(R), g.c[0] = 0; d = e(h, o, 0, 1), c = l.plus(d.times(m)), c.comparedTo(s) != 1; )
      l = m, m = c, x = g.plus(d.times(c = x)), g = c, o = h.minus(d.times(c = o)), h = c;
    return c = e(s.minus(l), m, 0, 1), g = g.plus(c.times(x)), l = l.plus(c.times(m)), g.s = x.s = _.s, y = y * 2, S = e(x, m, y, f).minus(_).abs().comparedTo(
      e(g, l, y, f).minus(_).abs()
    ) < 1 ? [x, m] : [g, l], v = w, S;
  }, r.toNumber = function() {
    return +ie(this);
  }, r.toPrecision = function(s, o) {
    return s != null && B(s, 1, U), W(this, s, o, 2);
  }, r.toString = function(s) {
    var o, l = this, m = l.s, c = l.e;
    return c === null ? m ? (o = "Infinity", m < 0 && (o = "-" + o)) : o = "NaN" : (s == null ? o = c <= E || c >= p ? ge(Y(l.c), c) : ne(Y(l.c), c, "0") : s === 10 && F ? (l = K(new T(l), a + c + 1, f), o = ne(Y(l.c), l.e, "0")) : (B(s, 2, q.length, "Base"), o = t(ne(Y(l.c), c, "0"), 10, s, m, !0)), m < 0 && l.c[0] && (o = "-" + o)), o;
  }, r.valueOf = r.toJSON = function() {
    return ie(this);
  }, r._isBigNumber = !0, r[Symbol.toStringTag] = "BigNumber", r[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = r.valueOf, i != null && T.set(i), T;
}
function Z(i) {
  var e = i | 0;
  return i > 0 || i === e ? e : e - 1;
}
function Y(i) {
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
function B(i, e, t, n) {
  if (i < e || i > t || i !== H(i))
    throw Error(V + (n || "Argument") + (typeof i == "number" ? i < e || i > t ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(i));
}
function pe(i) {
  var e = i.c.length - 1;
  return Z(i.e / P) == e && i.c[e] % 2 != 0;
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
var te = Ze(), tt = class {
  key;
  left = null;
  right = null;
  constructor(i) {
    this.key = i;
  }
}, ue = class extends tt {
  constructor(i) {
    super(i);
  }
}, it = class {
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
}, me = class he extends it {
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
    return new rt(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new nt(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, Je = class {
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
}, nt = class extends Je {
  getValue(i) {
    return i.key;
  }
}, rt = class extends Je {
  getValue(i) {
    return [i.key, i.key];
  }
}, We = (i) => () => i, Le = (i) => {
  const e = i ? (t, n) => n.minus(t).abs().isLessThanOrEqualTo(i) : We(!1);
  return (t, n) => e(t, n) ? 0 : t.comparedTo(n);
};
function st(i) {
  const e = i ? (t, n, r, u, a) => t.exponentiatedBy(2).isLessThanOrEqualTo(
    u.minus(n).exponentiatedBy(2).plus(a.minus(r).exponentiatedBy(2)).times(i)
  ) : We(!1);
  return (t, n, r) => {
    const u = t.x, a = t.y, f = r.x, E = r.y, p = a.minus(E).times(n.x.minus(f)).minus(u.minus(f).times(n.y.minus(E)));
    return e(p, u, a, f, E) ? 0 : p.comparedTo(0);
  };
}
var ot = (i) => i, lt = (i) => {
  if (i) {
    const e = new me(Le(i)), t = new me(Le(i)), n = (u, a) => a.addAndReturn(u), r = (u) => ({
      x: n(u.x, e),
      y: n(u.y, t)
    });
    return r({ x: new te(0), y: new te(0) }), r;
  }
  return ot;
}, Me = (i) => ({
  set: (e) => {
    re = Me(e);
  },
  reset: () => Me(i),
  compare: Le(i),
  snap: lt(i),
  orient: st(i)
}), re = Me(), fe = (i, e) => i.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(i.ur.x) && i.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(i.ur.y), Ae = (i, e) => {
  if (e.ur.x.isLessThan(i.ll.x) || i.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(i.ll.y) || i.ur.y.isLessThan(e.ll.y))
    return null;
  const t = i.ll.x.isLessThan(e.ll.x) ? e.ll.x : i.ll.x, n = i.ur.x.isLessThan(e.ur.x) ? i.ur.x : e.ur.x, r = i.ll.y.isLessThan(e.ll.y) ? e.ll.y : i.ll.y, u = i.ur.y.isLessThan(e.ur.y) ? i.ur.y : e.ur.y;
  return { ll: { x: t, y: r }, ur: { x: n, y: u } };
}, ye = (i, e) => i.x.times(e.y).minus(i.y.times(e.x)), Qe = (i, e) => i.x.times(e.x).plus(i.y.times(e.y)), xe = (i) => Qe(i, i).sqrt(), ut = (i, e, t) => {
  const n = { x: e.x.minus(i.x), y: e.y.minus(i.y) }, r = { x: t.x.minus(i.x), y: t.y.minus(i.y) };
  return ye(r, n).div(xe(r)).div(xe(n));
}, ft = (i, e, t) => {
  const n = { x: e.x.minus(i.x), y: e.y.minus(i.y) }, r = { x: t.x.minus(i.x), y: t.y.minus(i.y) };
  return Qe(r, n).div(xe(r)).div(xe(n));
}, ke = (i, e, t) => e.y.isZero() ? null : { x: i.x.plus(e.x.div(e.y).times(t.minus(i.y))), y: t }, Ge = (i, e, t) => e.x.isZero() ? null : { x: t, y: i.y.plus(e.y.div(e.x).times(t.minus(i.x))) }, ht = (i, e, t, n) => {
  if (e.x.isZero()) return Ge(t, n, i.x);
  if (n.x.isZero()) return Ge(i, e, t.x);
  if (e.y.isZero()) return ke(t, n, i.y);
  if (n.y.isZero()) return ke(i, e, t.y);
  const r = ye(e, n);
  if (r.isZero()) return null;
  const u = { x: t.x.minus(i.x), y: t.y.minus(i.y) }, a = ye(u, e).div(r), f = ye(u, n).div(r), E = i.x.plus(f.times(e.x)), p = t.x.plus(a.times(n.x)), b = i.y.plus(f.times(e.y)), v = t.y.plus(a.times(n.y)), O = E.plus(p).div(2), L = b.plus(v).div(2);
  return { x: O, y: L };
}, ee = class je {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, t) {
    const n = je.comparePoints(e.point, t.point);
    return n !== 0 ? n : (e.point !== t.point && e.link(t), e.isLeft !== t.isLeft ? e.isLeft ? 1 : -1 : we.compare(e.segment, t.segment));
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
        sine: ut(this.point, e.point, u.point),
        cosine: ft(this.point, e.point, u.point)
      });
    };
    return (r, u) => {
      t.has(r) || n(r), t.has(u) || n(u);
      const { sine: a, cosine: f } = t.get(r), { sine: E, cosine: p } = t.get(u);
      return a.isGreaterThanOrEqualTo(0) && E.isGreaterThanOrEqualTo(0) ? f.isLessThan(p) ? 1 : f.isGreaterThan(p) ? -1 : 0 : a.isLessThan(0) && E.isLessThan(0) ? f.isLessThan(p) ? -1 : f.isGreaterThan(p) ? 1 : 0 : E.isLessThan(a) ? -1 : E.isGreaterThan(a) ? 1 : 0;
    };
  }
}, at = class Ie {
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
      const p = [f], b = f.point, v = [];
      for (; a = f, f = E, p.push(f), f.point !== b; )
        for (; ; ) {
          const O = f.getAvailableLinkedEvents();
          if (O.length === 0) {
            const M = p[0].point, q = p[p.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${M.x}, \${M.y}]. Last matching segment found ends at [\${q.x}, \${q.y}].\`
            );
          }
          if (O.length === 1) {
            E = O[0].otherSE;
            break;
          }
          let L = null;
          for (let M = 0, q = v.length; M < q; M++)
            if (v[M].point === f.point) {
              L = M;
              break;
            }
          if (L !== null) {
            const M = v.splice(L)[0], q = p.splice(M.index);
            q.unshift(q[0].otherSE), t.push(new Ie(q.reverse()));
            continue;
          }
          v.push({
            index: p.length,
            point: f.point
          });
          const I = f.getLeftmostComparator(a);
          E = O.sort(I)[0].otherSE;
          break;
        }
      t.push(new Ie(p));
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
    for (let p = 1, b = this.events.length - 1; p < b; p++) {
      const v = this.events[p].point, O = this.events[p + 1].point;
      re.orient(v, e, O) !== 0 && (t.push(v), e = v);
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
}, qe = class {
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
}, ct = class {
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
        if (r.isExteriorRing()) e.push(new qe(r));
        else {
          const u = r.enclosingRing();
          u?.poly || e.push(new qe(u)), u?.poly?.addInterior(r);
        }
    }
    return e;
  }
}, pt = class {
  queue;
  tree;
  segments;
  constructor(i, e = we.compare) {
    this.queue = i, this.tree = new me(e), this.segments = [];
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
          for (let p = 0, b = E.length; p < b; p++)
            t.push(E[p]);
        }
      }
      let a = null;
      if (r) {
        const f = r.getIntersection(e);
        if (f !== null && (e.isAnEndpoint(f) || (a = f), !r.isAnEndpoint(f))) {
          const E = this._splitSafely(r, f);
          for (let p = 0, b = E.length; p < b; p++)
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
        for (let p = 0, b = E.length; p < b; p++)
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
}, gt = class {
  type;
  numMultiPolys;
  run(i, e, t) {
    ae.type = i;
    const n = [new De(e, !0)];
    for (let p = 0, b = t.length; p < b; p++)
      n.push(new De(t[p], !1));
    if (ae.numMultiPolys = n.length, ae.type === "difference") {
      const p = n[0];
      let b = 1;
      for (; b < n.length; )
        Ae(n[b].bbox, p.bbox) !== null ? b++ : n.splice(b, 1);
    }
    if (ae.type === "intersection")
      for (let p = 0, b = n.length; p < b; p++) {
        const v = n[p];
        for (let O = p + 1, L = n.length; O < L; O++)
          if (Ae(v.bbox, n[O].bbox) === null) return [];
      }
    const r = new me(ee.compare);
    for (let p = 0, b = n.length; p < b; p++) {
      const v = n[p].getSweepEvents();
      for (let O = 0, L = v.length; O < L; O++)
        r.add(v[O]);
    }
    const u = new pt(r);
    let a = null;
    for (r.size != 0 && (a = r.first(), r.delete(a)); a; ) {
      const p = u.process(a);
      for (let b = 0, v = p.length; b < v; b++) {
        const O = p[b];
        O.consumedBy === void 0 && r.add(O);
      }
      r.size != 0 ? (a = r.first(), r.delete(a)) : a = null;
    }
    re.reset();
    const f = at.factory(u.segments);
    return new ct(f).getGeom();
  }
}, ae = new gt(), Ne = ae, yt = 0, we = class de {
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
    const f = e.leftSE.point.y, E = t.leftSE.point.y, p = e.rightSE.point.y, b = t.rightSE.point.y;
    if (n.isLessThan(r)) {
      if (E.isLessThan(f) && E.isLessThan(p)) return 1;
      if (E.isGreaterThan(f) && E.isGreaterThan(p)) return -1;
      const v = e.comparePoint(t.leftSE.point);
      if (v < 0) return 1;
      if (v > 0) return -1;
      const O = t.comparePoint(e.rightSE.point);
      return O !== 0 ? O : -1;
    }
    if (n.isGreaterThan(r)) {
      if (f.isLessThan(E) && f.isLessThan(b)) return -1;
      if (f.isGreaterThan(E) && f.isGreaterThan(b)) return 1;
      const v = t.comparePoint(e.leftSE.point);
      if (v !== 0) return v;
      const O = e.comparePoint(t.rightSE.point);
      return O < 0 ? 1 : O > 0 ? -1 : 1;
    }
    if (f.isLessThan(E)) return -1;
    if (f.isGreaterThan(E)) return 1;
    if (u.isLessThan(a)) {
      const v = t.comparePoint(e.rightSE.point);
      if (v !== 0) return v;
    }
    if (u.isGreaterThan(a)) {
      const v = e.comparePoint(t.rightSE.point);
      if (v < 0) return 1;
      if (v > 0) return -1;
    }
    if (!u.eq(a)) {
      const v = p.minus(f), O = u.minus(n), L = b.minus(E), I = a.minus(r);
      if (v.isGreaterThan(O) && L.isLessThan(I)) return 1;
      if (v.isLessThan(O) && L.isGreaterThan(I)) return -1;
    }
    return u.isGreaterThan(a) ? 1 : u.isLessThan(a) || p.isLessThan(b) ? -1 : p.isGreaterThan(b) ? 1 : e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, t, n, r) {
    this.id = ++yt, this.leftSE = e, e.segment = this, e.otherSE = t, this.rightSE = t, t.segment = this, t.otherSE = e, this.rings = n, this.windings = r;
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
    return new de(E, p, [n], [a]);
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
    const t = this.bbox(), n = e.bbox(), r = Ae(t, n);
    if (r === null) return null;
    const u = this.leftSE.point, a = this.rightSE.point, f = e.leftSE.point, E = e.rightSE.point, p = fe(t, f) && this.comparePoint(f) === 0, b = fe(n, u) && e.comparePoint(u) === 0, v = fe(t, E) && this.comparePoint(E) === 0, O = fe(n, a) && e.comparePoint(a) === 0;
    if (b && p)
      return O && !v ? a : !O && v ? E : null;
    if (b)
      return v && u.x.eq(E.x) && u.y.eq(E.y) ? null : u;
    if (p)
      return O && a.x.eq(f.x) && a.y.eq(f.y) ? null : f;
    if (O && v) return null;
    if (O) return a;
    if (v) return E;
    const L = ht(u, this.vector(), f, e.vector());
    return L === null || !fe(r, L) ? null : re.snap(L);
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
    const f = new de(
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
    const r = de.compare(t, n);
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
      const p = this.rings[f], b = this.windings[f], v = t.indexOf(p);
      v === -1 ? (t.push(p), n.push(b)) : n[v] += b;
    }
    const u = [], a = [];
    for (let f = 0, E = t.length; f < E; f++) {
      if (n[f] === 0) continue;
      const p = t[f], b = p.poly;
      if (a.indexOf(b) === -1)
        if (p.isExterior) u.push(b);
        else {
          a.indexOf(b) === -1 && a.push(b);
          const v = u.indexOf(p.poly);
          v !== -1 && u.splice(v, 1);
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
    switch (Ne.type) {
      case "union": {
        const n = e.length === 0, r = t.length === 0;
        this._isInResult = n !== r;
        break;
      }
      case "intersection": {
        let n, r;
        e.length < t.length ? (n = e.length, r = t.length) : (n = t.length, r = e.length), this._isInResult = r === Ne.numMultiPolys && n < r;
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
}, Fe = class {
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
      f.x.eq(r.x) && f.y.eq(r.y) || (this.segments.push(we.fromRing(r, f, this)), f.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = f.x), f.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = f.y), f.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = f.x), f.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = f.y), r = f);
    }
    (!n.x.eq(r.x) || !n.y.eq(r.y)) && this.segments.push(we.fromRing(r, n, this));
  }
  getSweepEvents() {
    const i = [];
    for (let e = 0, t = this.segments.length; e < t; e++) {
      const n = this.segments[e];
      i.push(n.leftSE), i.push(n.rightSE);
    }
    return i;
  }
}, dt = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(i, e) {
    if (!Array.isArray(i))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new Fe(i[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let t = 1, n = i.length; t < n; t++) {
      const r = new Fe(i[t], this, !1);
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
}, De = class {
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
      const r = new dt(i[t], this);
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
}, mt = (i, ...e) => Ne.run("union", i, e);
re.set;
var Ue = 63710088e-1;
function Ee(i, e, t = {}) {
  const n = { type: "Feature" };
  return (t.id === 0 || t.id) && (n.id = t.id), t.bbox && (n.bbox = t.bbox), n.properties = e || {}, n.geometry = i, n;
}
function xt(i, e, t = {}) {
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
  return Ee({
    type: "Polygon",
    coordinates: i
  }, e, t);
}
function wt(i, e = {}) {
  const t = { type: "FeatureCollection" };
  return e.id && (t.id = e.id), e.bbox && (t.bbox = e.bbox), t.features = i, t;
}
function Et(i, e, t = {}) {
  return Ee({
    type: "MultiPolygon",
    coordinates: i
  }, e, t);
}
function Ce(i, e) {
  var t, n, r, u, a, f, E, p, b, v, O = 0, L = i.type === "FeatureCollection", I = i.type === "Feature", M = L ? i.features.length : 1;
  for (t = 0; t < M; t++) {
    for (f = L ? (
      // @ts-expect-error: Known type conflict
      i.features[t].geometry
    ) : I ? (
      // @ts-expect-error: Known type conflict
      i.geometry
    ) : i, p = L ? (
      // @ts-expect-error: Known type conflict
      i.features[t].properties
    ) : I ? (
      // @ts-expect-error: Known type conflict
      i.properties
    ) : {}, b = L ? (
      // @ts-expect-error: Known type conflict
      i.features[t].bbox
    ) : I ? (
      // @ts-expect-error: Known type conflict
      i.bbox
    ) : void 0, v = L ? (
      // @ts-expect-error: Known type conflict
      i.features[t].id
    ) : I ? (
      // @ts-expect-error: Known type conflict
      i.id
    ) : void 0, E = f ? f.type === "GeometryCollection" : !1, a = E ? f.geometries.length : 1, r = 0; r < a; r++) {
      if (u = E ? f.geometries[r] : f, u === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            O,
            p,
            b,
            v
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
              O,
              p,
              b,
              v
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
                O,
                p,
                b,
                v
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    O++;
  }
}
function vt(i, e, t) {
  var n = t;
  return Ce(
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
function St(i, e) {
  Ce(i, function(t, n, r, u, a) {
    var f = t === null ? null : t.type;
    switch (f) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            Ee(t, r, { bbox: u, id: a }),
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
      var b = t.coordinates[p], v = {
        type: E,
        coordinates: b
      };
      if (
        // @ts-expect-error: Known type conflict
        e(Ee(v, r), n, p) === !1
      )
        return !1;
    }
  });
}
function Tt(i, e = {}) {
  const t = [];
  if (Ce(i, (r) => {
    t.push(r.coordinates);
  }), t.length < 2)
    throw new Error("Must have at least 2 geometries");
  const n = mt(t[0], ...t.slice(1));
  return n.length === 0 ? null : n.length === 1 ? xt(n[0], e.properties) : Et(n, e.properties);
}
function ze(i) {
  if (!i) throw new Error("geojson is required");
  var e = [];
  return St(i, function(t) {
    e.push(t);
  }), wt(e);
}
const bt = typeof TextEncoder < "u", Ot = typeof TextDecoder < "u", $e = bt ? new TextEncoder() : null, Ve = Ot ? new TextDecoder() : null, Rt = (i) => {
  if (i instanceof Uint8Array) return i;
  if (ArrayBuffer.isView(i)) return new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  if (i instanceof ArrayBuffer) return new Uint8Array(i);
  const e = JSON.stringify(i);
  if ($e) return $e.encode(e);
  if (typeof Buffer < "u" && typeof Buffer.from == "function") return new Uint8Array(Buffer.from(e));
  throw new Error("No TextEncoder available to encode object");
}, _t = (i) => {
  let e;
  if (i instanceof Uint8Array) e = i;
  else if (ArrayBuffer.isView(i)) e = new Uint8Array(i.buffer, i.byteOffset, i.byteLength);
  else if (i instanceof ArrayBuffer) e = new Uint8Array(i);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(i)) e = new Uint8Array(i);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  return Ve ? JSON.parse(Ve.decode(e)) : typeof Buffer < "u" && typeof Buffer.from == "function" ? JSON.parse(Buffer.from(e).toString("utf8")) : JSON.parse(new TextDecoder().decode(e));
}, Pt = (i) => {
  const e = Rt(i);
  return e.byteOffset === 0 && e.byteLength === e.buffer.byteLength ? e.buffer : e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
}, Lt = (i) => _t(i);
class Mt {
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
function At(i, e = 1, t = !1) {
  let n = 1 / 0, r = 1 / 0, u = -1 / 0, a = -1 / 0;
  for (const [F, T] of i[0])
    F < n && (n = F), T < r && (r = T), F > u && (u = F), T > a && (a = T);
  const f = u - n, E = a - r, p = Math.max(e, Math.min(f, E));
  if (p === e) {
    const F = [n, r];
    return F.distance = 0, F;
  }
  const b = new Mt([], (F, T) => T.max - F.max);
  let v = Nt(i);
  const O = new ve(n + f / 2, r + E / 2, 0, i);
  O.d > v.d && (v = O);
  let L = 2;
  function I(F, T, W) {
    const Q = new ve(F, T, W, i);
    L++, Q.max > v.d + e && b.push(Q), Q.d > v.d && (v = Q, t && console.log(\`found best \${Math.round(1e4 * Q.d) / 1e4} after \${L} probes\`));
  }
  let M = p / 2;
  for (let F = n; F < u; F += p)
    for (let T = r; T < a; T += p)
      I(F + M, T + M, M);
  for (; b.length; ) {
    const { max: F, x: T, y: W, h: Q } = b.pop();
    if (F - v.d <= e) break;
    M = Q / 2, I(T - M, W - M, M), I(T + M, W - M, M), I(T - M, W + M, M), I(T + M, W + M, M);
  }
  t && console.log(\`num probes: \${L}
best distance: \${v.d}\`);
  const q = [v.x, v.y];
  return q.distance = v.d, q;
}
function ve(i, e, t, n) {
  this.x = i, this.y = e, this.h = t, this.d = It(i, e, n), this.max = this.d + this.h * Math.SQRT2;
}
function It(i, e, t) {
  let n = !1, r = 1 / 0;
  for (const u of t)
    for (let a = 0, f = u.length, E = f - 1; a < f; E = a++) {
      const p = u[a], b = u[E];
      p[1] > e != b[1] > e && i < (b[0] - p[0]) * (e - p[1]) / (b[1] - p[1]) + p[0] && (n = !n), r = Math.min(r, Ct(i, e, p, b));
    }
  return r === 0 ? 0 : (n ? 1 : -1) * Math.sqrt(r);
}
function Nt(i) {
  let e = 0, t = 0, n = 0;
  const r = i[0];
  for (let a = 0, f = r.length, E = f - 1; a < f; E = a++) {
    const p = r[a], b = r[E], v = p[0] * b[1] - b[0] * p[1];
    t += (p[0] + b[0]) * v, n += (p[1] + b[1]) * v, e += v * 3;
  }
  const u = new ve(t / e, n / e, 0, i);
  return e === 0 || u.d < 0 ? new ve(r[0][0], r[0][1], 0, i) : u;
}
function Ct(i, e, t, n) {
  let r = t[0], u = t[1], a = n[0] - r, f = n[1] - u;
  if (a !== 0 || f !== 0) {
    const E = ((i - r) * a + (e - u) * f) / (a * a + f * f);
    E > 1 ? (r = n[0], u = n[1]) : E > 0 && (r += a * E, u += f * E);
  }
  return a = i - r, f = e - u, a * a + f * f;
}
function Bt(i) {
  return vt(
    i,
    (e, t) => e + kt(t),
    0
  );
}
function kt(i) {
  let e = 0, t;
  switch (i.type) {
    case "Polygon":
      return Ke(i.coordinates);
    case "MultiPolygon":
      for (t = 0; t < i.coordinates.length; t++)
        e += Ke(i.coordinates[t]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function Ke(i) {
  let e = 0;
  if (i && i.length > 0) {
    e += Math.abs(Xe(i[0]));
    for (let t = 1; t < i.length; t++)
      e -= Math.abs(Xe(i[t]));
  }
  return e;
}
var Gt = Ue * Ue / 2, Pe = Math.PI / 180;
function Xe(i) {
  const e = i.length - 1;
  if (e <= 2) return 0;
  let t = 0, n = 0;
  for (; n < e; ) {
    const r = i[n], u = i[n + 1 === e ? 0 : n + 1], a = i[n + 2 >= e ? (n + 2) % e : n + 2], f = r[0] * Pe, E = u[1] * Pe, p = a[0] * Pe;
    t += (p - f) * Math.sin(E), n++;
  }
  return t * Gt;
}
const qt = (i, e) => {
  try {
    if (i.geometry.type !== "Polygon")
      throw new Error("Non-Polygon geometry");
    const t = i && i.geometry && i.geometry.coordinates;
    let n = At(t, e);
    if (!Array.isArray(n) || !Number.isFinite(n[0]) || !Number.isFinite(n[1]))
      throw new Error("Invalid polylabel result");
    return {
      type: "Point",
      coordinates: [n[0], n[1]]
    };
  } catch {
    return console.log("Invalid feature geometry", i && i.id), pointOnFeature(i).geometry;
  }
}, Ye = (i) => {
  if (!i) return 0;
  let e = 0;
  for (let t = 0; t < i.length; t++) {
    const n = (t + 1) % i.length;
    e += i[t][0] * i[n][1], e -= i[n][0] * i[t][1];
  }
  return Math.abs(e) / 2;
}, Ft = (i, e) => {
  try {
    if (e === "meters")
      return Bt(i);
    {
      const t = i && i.geometry;
      if (!t || t.type !== "Polygon") return 0;
      const n = t && t.coordinates;
      let r = Ye(n[0]);
      for (let u = 1; u < n.length; u++)
        r -= Ye(n[u]);
      return r;
    }
  } catch (t) {
    return console.log("Error computing area for feature", i && i.id, t), 0;
  }
}, He = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
He.onmessage = (i) => {
  const e = i.data, t = Lt(e), n = Object.values(t.pieces), r = t.tolerance || 1e-5, u = t.unit || "meters";
  t.tileSize;
  const a = /* @__PURE__ */ new Map();
  n.forEach((f) => {
    for (const [E, p] of Object.entries(f)) {
      const b = a.get(E) || [];
      b.push(p), a.set(E, b);
    }
  });
  for (const [f, E] of a.entries()) {
    if (f === "size") continue;
    let p = {
      type: "FeatureCollection",
      features: E.reduce((v, O) => [...v, ...O.features], []).filter((v) => v.geometry.type === "Polygon")
    };
    if (p.features.some((v) => v.geometry.type === "MultiPolygon") && (p = ze(p)), p.features.some((v) => v.properties.clipped) && p.features.length > 1) {
      let v = {
        type: "FeatureCollection",
        features: p.features.filter((L) => L.properties.clipped)
      };
      const O = p.features.filter((L) => !L.properties.clipped);
      if (v.features.length > 1) {
        const { clipped: L, ...I } = p.features[0].properties;
        I._index = v.features.map((M) => M.properties._index).sort().join("-"), v = Tt(v), v = {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: v.geometry,
            properties: I
          }]
        };
      }
      p = {
        type: "FeatureCollection",
        features: [...O, ...v.features]
      };
    }
    p.features.some((v) => v.geometry.type === "MultiPolygon") && (p = ze(p)), p.features = p.features.map((v, O) => {
      const L = \`\${f}-\${O}\`, I = v.geometry, M = v.properties;
      if (I && I.type === "Polygon") {
        const q = Ft(v, u);
        v.geometry = qt(v, r), v.properties = { ...M, _area: q, _groupId: f };
      } else
        console.log("Unexpected geometry type after union/simplify/flatten for id:" + f + " - type:" + (I && I.type)), v.properties = { ...M, _area: 0, _groupId: f };
      return v.id = L, v;
    });
    const b = Math.max(...p.features.map((v) => v.properties && v.properties._area || 0));
    p.features = p.features.map((v) => (v.properties && v.properties._area != null && v.properties._area > 0 ? (v.properties._localSortKey = b / v.properties._area, v.properties._globalSortKey = 1 / v.properties._area) : (v.properties._localSortKey = 1 / 0, v.properties._globalSortKey = 1 / 0), v)), p.id = f, He.postMessage(Pt(p));
  }
};
`, v = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", P], { type: "text/javascript;charset=utf-8" });
function I(a) {
  let n;
  try {
    if (n = v && (self.URL || self.webkitURL).createObjectURL(v), !n) throw "";
    const e = new Worker(n, {
      type: "module",
      name: a?.name
    });
    return e.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(n);
    }), e;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(P),
      {
        type: "module",
        name: a?.name
      }
    );
  }
}
class E {
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
  constructor(n, e = {}) {
    const t = typeof navigator < "u" && navigator.hardwareConcurrency || 2, {
      size: r = Math.min(t, 2),
      minSize: s = 1,
      maxSize: l = Math.max(r, t),
      workerOptions: c = {},
      maxTasksPerWorker: f = 1 / 0,
      idleTimeout: u = 6e4,
      taskQueue: i = !0
    } = e;
    this._workerSource = n, this._workerOptions = c, this._maxTasksPerWorker = f, this.minSize = Math.max(0, s), this.maxSize = Math.max(this.minSize, l), this.idleTimeout = Math.max(0, u), this.taskQueueEnabled = !!i, this.workers = [], this.queue = [], this._listeners = { message: /* @__PURE__ */ new Set(), error: /* @__PURE__ */ new Set(), messageerror: /* @__PURE__ */ new Set(), idle: /* @__PURE__ */ new Set() }, this._onmessage = null, this._onerror = null, this._onidle = null, this._nextIndex = 0, this._isIdle = !0;
    const o = Math.min(Math.max(r, this.minSize), this.maxSize);
    for (let y = 0; y < o; y++) this._addWorkerInstance(y);
    this._reaperInterval = setInterval(() => this._reapIdleWorkers(), Math.max(1e3, Math.floor(this.idleTimeout / 2)));
  }
  /**
   * Create a new worker instance using the configured source.
   * @private
   * @returns {Worker|any}
   */
  _createWorkerInstance() {
    if (typeof this._workerSource == "function") return new this._workerSource();
    if (typeof this._workerSource == "string") return new Worker(new URL(this._workerSource, import.meta.url), this._workerOptions);
    throw new Error("Invalid workerSource: expected Worker factory or relative path string");
  }
  /**
   * Add and wire a new worker instance into the pool.
   * @private
   * @param {number} id
   * @returns {WorkerObj}
   */
  _addWorkerInstance(n) {
    const e = this._createWorkerInstance(), t = { id: n, worker: e, tasks: 0, lastActive: Date.now() };
    return this.workers.push(t), e.onmessage = (r) => {
      if (t.tasks = Math.max(0, t.tasks - 1), t.lastActive = Date.now(), this.queue.length > 0 && t.tasks < this._maxTasksPerWorker) {
        const s = this.queue.shift();
        try {
          s.transfer ? e.postMessage(s.message, s.transfer) : e.postMessage(s.message), t.tasks++;
        } catch (l) {
          console.error("Failed to dispatch queued message to worker", l);
        }
      }
      if (this._onmessage)
        try {
          this._onmessage(r);
        } catch (s) {
          console.error("Pool onmessage handler error", s);
        }
      for (const s of this._listeners.message)
        try {
          s(r);
        } catch (l) {
          console.error("pool listener error", l);
        }
      this._updateIdleState();
    }, e.onerror = (r) => {
      if (this._onerror)
        try {
          this._onerror(r);
        } catch (s) {
          console.error("Pool onerror handler error", s);
        }
      for (const s of this._listeners.error)
        try {
          s(r);
        } catch (l) {
          console.error("pool error listener error", l);
        }
    }, e.onmessageerror = (r) => {
      for (const s of this._listeners.messageerror)
        try {
          s(r);
        } catch (l) {
          console.error("pool messageerror listener error", l);
        }
    }, t;
  }
  /**
   * Return the least-loaded worker (smallest `tasks` count).
   * @private
   * @returns {WorkerObj|null}
   */
  _findLeastLoadedWorker() {
    if (!this.workers.length) return null;
    let n = this.workers[0];
    for (let e = 1; e < this.workers.length; e++)
      this.workers[e].tasks < n.tasks && (n = this.workers[e]);
    return n;
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
  postMessage(n, e) {
    const t = this._findLeastLoadedWorker();
    if (t && t.tasks < this._maxTasksPerWorker)
      try {
        return e ? t.worker.postMessage(n, e) : t.worker.postMessage(n), t.tasks++, t.lastActive = Date.now(), this._updateIdleState(), !0;
      } catch (s) {
        return console.error("Failed to postMessage to worker", s), !1;
      }
    if (this.workers.length < this.maxSize) {
      const s = this.workers.length, l = this._addWorkerInstance(s);
      try {
        return e ? l.worker.postMessage(n, e) : l.worker.postMessage(n), l.tasks++, l.lastActive = Date.now(), this._updateIdleState(), !0;
      } catch (c) {
        return console.error("Failed to postMessage to new worker", c), !1;
      }
    }
    if (this.taskQueueEnabled)
      return this.queue.push({ message: n, transfer: e }), this._updateIdleState(), !0;
    const r = this.workers[this._nextIndex % this.workers.length];
    this._nextIndex++;
    try {
      return e ? r.worker.postMessage(n, e) : r.worker.postMessage(n), r.tasks++, r.lastActive = Date.now(), this._updateIdleState(), !0;
    } catch (s) {
      return console.error("Failed to postMessage to fallback worker", s), !1;
    }
  }
  /**
   * Broadcasts a message to all workers in the pool.
   * @param {*} message
   * @param {Transferable[]=} transfer
   */
  broadcast(n, e) {
    for (const t of this.workers)
      try {
        e ? t.worker.postMessage(n, e) : t.worker.postMessage(n), t.tasks++, t.lastActive = Date.now();
      } catch (r) {
        console.error("broadcast error", r);
      }
    this._updateIdleState();
  }
  /**
   * Add one worker to the pool immediately.
   * @returns {WorkerObj}
   */
  addWorker() {
    return this._addWorkerInstance(this.workers.length);
  }
  /**
   * Remove the last worker from the pool and terminate it.
   */
  removeWorker() {
    const n = this.workers.pop();
    if (n)
      try {
        n.worker.terminate();
      } catch {
      }
  }
  /**
   * Internal: terminate workers that have been idle longer than `idleTimeout`.
   * Keeps at least `minSize` workers alive.
   * @private
   */
  _reapIdleWorkers() {
    if (this.idleTimeout <= 0) return;
    const n = Date.now();
    for (let e = this.workers.length - 1; e >= 0; e--) {
      const t = this.workers[e];
      if (this.workers.length <= this.minSize) break;
      if (t.tasks === 0 && n - (t.lastActive || 0) > this.idleTimeout) {
        try {
          t.worker.terminate();
        } catch {
        }
        this.workers.splice(e, 1);
      }
    }
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
    const n = { data: { type: "pool:idle", stats: this.getStats() } };
    if (this._isIdle = !0, this._onmessage)
      try {
        this._onmessage(n);
      } catch (e) {
        console.error("Pool onmessage handler error", e);
      }
    if (this._onidle)
      try {
        this._onidle(n);
      } catch (e) {
        console.error("Pool onidle handler error", e);
      }
    for (const e of this._listeners.message)
      try {
        e(n);
      } catch (t) {
        console.error("pool listener error", t);
      }
    for (const e of this._listeners.idle)
      try {
        e(n);
      } catch (t) {
        console.error("pool idle listener error", t);
      }
  }
  /**
   * Check current state and emit idle event if transitioning to idle.
   * @private
   */
  _updateIdleState() {
    const e = this.workers.length > 0 && this.workers.every((s) => s.tasks === 0), t = this.queue.length === 0, r = e && t;
    r && !this._isIdle ? this._emitIdle() : !r && this._isIdle && (this._isIdle = !1);
  }
  /**
   * Terminate the entire pool, clear queue and the reaper interval.
   */
  terminate() {
    this._reaperInterval && (clearInterval(this._reaperInterval), this._reaperInterval = null);
    for (const n of this.workers)
      try {
        n.worker.terminate();
      } catch {
      }
    this.workers = [], this.queue = [];
  }
  /**
   * Return stats for debugging.
   * @returns {{id:number,tasks:number,lastActive:number}[]}
   */
  getStats() {
    return this.workers.map((n) => ({ id: n.id, tasks: n.tasks, lastActive: n.lastActive }));
  }
  /**
   * Add an event listener for pool events. Supported types: 'message', 'error', 'messageerror', 'idle'.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  addEventListener(n, e) {
    if (n in this._listeners && (this._listeners[n].add(e), n === "idle" && this._isIdle)) {
      const t = { data: { type: "pool:idle", stats: this.getStats() } };
      try {
        e(t);
      } catch (r) {
        console.error("pool idle listener error", r);
      }
    }
  }
  /**
   * Remove a previously added event listener.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  removeEventListener(n, e) {
    n in this._listeners && this._listeners[n].delete(e);
  }
  /**
   * onmessage handler called when any worker posts a message.
   * @type {Function|null}
   */
  get onmessage() {
    return this._onmessage;
  }
  set onmessage(n) {
    this._onmessage = n;
  }
  /**
   * onerror handler called when a worker emits an error.
   * @type {Function|null}
   */
  get onerror() {
    return this._onerror;
  }
  set onerror(n) {
    this._onerror = n;
  }
  /**
   * onidle handler called when the pool becomes idle.
   * @type {Function|null}
   */
  get onidle() {
    return this._onidle;
  }
  set onidle(n) {
    if (this._onidle = n, typeof n == "function" && this._isIdle) {
      const e = { data: { type: "pool:idle", stats: this.getStats() } };
      try {
        n(e);
      } catch (t) {
        console.error("Pool onidle handler error", t);
      }
    }
  }
}
class S {
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
  constructor({ maxEntries: n = 1 / 0, maxWeight: e = 1 / 0, weightFn: t = () => 1, defaultTTL: r = 6e4, maxPoolSize: s = 1e3, rejectOversized: l = !1, onEvict: c = null, onExpire: f = null, initialPoolSize: u = 0, maxCleanupPerTick: i = 100 } = {}) {
    this.maxEntries = n, this.maxWeight = e, this.weightFn = t, this.defaultTTL = r, this.maxPoolSize = s, this.rejectOversized = !!l, this.onEvict = typeof c == "function" ? c : null, this.onExpire = typeof f == "function" ? f : null, this.maxCleanupPerTick = Number.isFinite(+i) ? Math.max(1, +i) : 100, this.map = /* @__PURE__ */ new Map(), this.head = null, this.tail = null, this.pool = [];
    for (let o = 0; o < Math.min(u || 0, this.maxPoolSize); o++) this.pool.push({ key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null });
    this.currentWeight = 0, this.hits = 0, this.misses = 0, this.evictions = 0, this.rejected = 0, this._cleanupTimer = null, this._cleanupRunning = !1, this._cleanupParams = null, this._cleanupCursor = null;
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
  _allocNode(n, e, t, r) {
    const s = this.pool.pop() || { key: null, value: null, weight: 0, expiresAt: 0, prev: null, next: null };
    return s.key = n, s.value = e, s.weight = t || 0, s.expiresAt = r || 0, s.prev = null, s.next = null, s;
  }
  /**
   * Reset and return a node to the pool for reuse.
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _freeNode(n) {
    n.key = null, n.value = null, n.weight = 0, n.expiresAt = 0, n.prev = null, n.next = null, this.pool.length < this.maxPoolSize && this.pool.push(n);
  }
  /**
   * Append a node to the tail (most-recently used).
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _append(n) {
    if (!this.tail) {
      this.head = this.tail = n;
      return;
    }
    n.prev = this.tail, n.next = null, this.tail.next = n, this.tail = n;
  }
  /**
   * Remove a node from the linked list.
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _remove(n) {
    const e = n.prev, t = n.next;
    e ? e.next = t : this.head = t, t ? t.prev = e : this.tail = e, n.prev = n.next = null;
  }
  /**
   * Move an existing node to the tail (mark as most-recently used).
   * @private
   * @param {CacheNode} node
   * @returns {void}
   */
  _moveToTail(n) {
    this.tail !== n && (this._remove(n), this._append(n));
  }
  /**
   * Pop and return the head (least-recently used) node.
   * @private
   * @returns {CacheNode|null}
   */
  _popHead() {
    const n = this.head;
    return n ? (this._remove(n), n) : null;
  }
  /**
   * Evict nodes until both entry and weight limits are satisfied.
   * @private
   * @returns {void}
   */
  _evictIfNeeded() {
    for (; this.map.size > this.maxEntries || this.currentWeight > this.maxWeight; ) {
      const n = this.head;
      if (!n) break;
      const e = n.next, t = n.key, r = n.value;
      this._cleanupCursor === n && (this._cleanupCursor = e || this.head), this._remove(n), this.map.delete(t), this.currentWeight -= n.weight || 0, this.evictions++;
      try {
        this.onEvict && this.onEvict(t, r, "evicted");
      } catch {
      }
      this._freeNode(n);
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
  set(n, e, { ttl: t = this.defaultTTL, weight: r = null } = {}) {
    const s = Date.now(), l = t == null || t === 1 / 0 ? 0 : s + t, c = r ?? (this.weightFn(e) || 0), f = Number.isFinite(+c) ? Math.max(0, +c) : 0;
    if (this.rejectOversized && Number.isFinite(this.maxWeight) && f > this.maxWeight) {
      this.rejected++;
      try {
        this.onEvict && this.onEvict(n, e, "rejected-oversized");
      } catch {
      }
      return this.rejectOversized ? !1 : this;
    }
    if (this.map.has(n)) {
      const u = this.map.get(n);
      this.currentWeight -= u.weight || 0, u.value = e, u.weight = f, u.expiresAt = l, this.currentWeight += u.weight || 0, this._moveToTail(u);
    } else {
      const u = this._allocNode(n, e, f, l);
      this.map.set(n, u), this._append(u), this.currentWeight += u.weight || 0, this._evictIfNeeded();
    }
    return this;
  }
  /**
   * Retrieve a value and mark it as recently used.
   * @param {*} key
   * @returns {*|undefined} The stored value or `undefined` if missing/expired.
   */
  get(n) {
    const e = this.map.get(n), t = Date.now();
    if (!e) {
      this.misses++;
      return;
    }
    if (e.expiresAt && e.expiresAt <= t) {
      const r = e.key, s = e.value, l = e.next;
      this.map.delete(r), this.currentWeight -= e.weight || 0, this._cleanupCursor === e && (this._cleanupCursor = l || this.head), this._remove(e);
      try {
        this.onExpire && this.onExpire(r, s);
      } catch {
      }
      this._freeNode(e), this.misses++;
      return;
    }
    return this._moveToTail(e), this.hits++, e.value;
  }
  /**
   * Get a value without updating recency.
   * Returns `undefined` for missing or expired entries.
   * @param {*} key
   * @returns {*|undefined}
   */
  peek(n) {
    const e = this.map.get(n);
    if (e && !(e.expiresAt && e.expiresAt <= Date.now()))
      return e.value;
  }
  /**
   * Check membership without affecting recency.
   * @param {*} key
   * @param {Object} [options]
   * @param {boolean} [options.ignoreExpiry=false] If true, consider expired entries as present.
   * @returns {boolean}
   */
  has(n, { ignoreExpiry: e = !1 } = {}) {
    const t = this.map.get(n);
    return !(!t || !e && t.expiresAt && t.expiresAt <= Date.now());
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
  hasEqual(n, e, { ignoreExpiry: t = !1 } = {}) {
    const r = this.map.get(n);
    if (!r || !t && r.expiresAt && r.expiresAt <= Date.now()) return !1;
    const s = r.value;
    if (s === e) return !0;
    if (typeof s !== "object" || s === null || typeof e !== "object" || e === null)
      return s === e;
    const f = /* @__PURE__ */ new WeakMap(), u = (i, o) => {
      if (i === o) return !0;
      if (i == null || o == null || typeof i !== "object" || typeof o !== "object") return i === o;
      const m = f.get(i);
      if (m && m.has(o)) return !0;
      if (m || f.set(i, /* @__PURE__ */ new WeakSet()), f.get(i).add(o), Object.getPrototypeOf(i) !== Object.getPrototypeOf(o)) return !1;
      if (typeof Uint8Array < "u" && i instanceof Uint8Array) {
        if (!(o instanceof Uint8Array) || i.length !== o.length) return !1;
        for (let h = 0; h < i.length; h++) if (i[h] !== o[h]) return !1;
        return !0;
      }
      if (Array.isArray(i)) {
        if (!Array.isArray(o) || i.length !== o.length) return !1;
        for (let h = 0; h < i.length; h++) if (!u(i[h], o[h])) return !1;
        return !0;
      }
      if (ArrayBuffer.isView(i)) {
        if (!ArrayBuffer.isView(o) || i.byteLength !== o.byteLength) return !1;
        const h = new Uint8Array(i.buffer, i.byteOffset || 0, i.byteLength), p = new Uint8Array(o.buffer, o.byteOffset || 0, o.byteLength);
        for (let d = 0; d < h.length; d++) if (h[d] !== p[d]) return !1;
        return !0;
      }
      if (i instanceof ArrayBuffer) {
        if (!(o instanceof ArrayBuffer) || i.byteLength !== o.byteLength) return !1;
        const h = new Uint8Array(i), p = new Uint8Array(o);
        for (let d = 0; d < h.length; d++) if (h[d] !== p[d]) return !1;
        return !0;
      }
      if (i instanceof Date)
        return o instanceof Date ? i.getTime() === o.getTime() : !1;
      if (i instanceof RegExp)
        return o instanceof RegExp ? i.toString() === o.toString() : !1;
      if (i instanceof Map) {
        if (!(o instanceof Map) || i.size !== o.size) return !1;
        for (const [h, p] of i)
          if (!o.has(h) || !u(p, o.get(h))) return !1;
        return !0;
      }
      if (i instanceof Set) {
        if (!(o instanceof Set) || i.size !== o.size) return !1;
        let h = !0;
        for (const p of i)
          if (p !== null && typeof p == "object") {
            h = !1;
            break;
          }
        if (h) {
          for (const p of i) if (!o.has(p)) return !1;
          return !0;
        }
        for (const p of i) {
          let d = !1;
          for (const L of o)
            if (u(p, L)) {
              d = !0;
              break;
            }
          if (!d) return !1;
        }
        return !0;
      }
      const w = Object.keys(i), g = Object.keys(o);
      if (w.length !== g.length) return !1;
      for (let h = 0; h < w.length; h++) {
        const p = w[h];
        if (!Object.prototype.hasOwnProperty.call(o, p) || !u(i[p], o[p])) return !1;
      }
      return !0;
    };
    return u(s, e);
  }
  /**
   * Delete an entry from the cache.
   * @param {*} key
   * @returns {boolean} true if the key was removed.
   */
  delete(n) {
    const e = this.map.get(n);
    if (!e) return !1;
    const t = e.next;
    this.map.delete(n), this.currentWeight -= e.weight || 0, this._cleanupCursor === e && (this._cleanupCursor = t || this.head), this._remove(e);
    try {
      this.onEvict && this.onEvict(e.key, e.value, "deleted");
    } catch {
    }
    return this._freeNode(e), !0;
  }
  /**
   * Clear the cache and return nodes to the pool.
   * @returns {void}
   */
  clear() {
    for (let n = this.head; n; ) {
      const e = n.next;
      this.pool.length < this.maxPoolSize && this.pool.push(n), n = e;
    }
    this.head = this.tail = null, this.map.clear(), this.currentWeight = 0, this._cleanupCursor = null;
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
  cleanupExpiredUpTo(n = 1 / 0) {
    const e = Date.now();
    let t = 0, r = this._cleanupCursor && this.map.get(this._cleanupCursor.key) === this._cleanupCursor ? this._cleanupCursor : this.head;
    for (; r && t < n; ) {
      const s = r.next;
      if (r.expiresAt && r.expiresAt <= e) {
        const l = r.key, c = r.value;
        this.map.delete(l), this.currentWeight -= r.weight || 0, this._cleanupCursor === r && (this._cleanupCursor = s || this.head), this._remove(r);
        try {
          this.onExpire && this.onExpire(l, c);
        } catch {
        }
        this._freeNode(r), this.evictions++;
      }
      r = s, t++;
    }
    return this._cleanupCursor = r || this.head, t;
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
  startCleanup(n = {}) {
    let e, t;
    typeof n == "number" ? (e = n, t = this.maxCleanupPerTick) : (e = Number.isFinite(+n.interval) ? +n.interval : Math.max(1e3, Math.min(this.defaultTTL || 6e4, 6e4)), t = Number.isFinite(+n.maxCleanupPerTick) ? Math.max(1, +n.maxCleanupPerTick) : this.maxCleanupPerTick), this.stopCleanup(), this._cleanupParams = { interval: e, maxCleanupPerTick: t };
    const r = () => {
      if (this._cleanupTimer != null) {
        if (this._cleanupRunning) {
          this._cleanupTimer = setTimeout(r, this._cleanupParams.interval);
          return;
        }
        this._cleanupRunning = !0;
        try {
          this.cleanupExpiredUpTo(this._cleanupParams.maxCleanupPerTick);
        } finally {
          this._cleanupRunning = !1;
        }
        this._cleanupTimer = setTimeout(r, this._cleanupParams.interval);
      }
    };
    this._cleanupTimer = setTimeout(r, e);
  }
  /**
   * Stop periodic cleanup.
   * @returns {void}
   */
  stopCleanup() {
    this._cleanupTimer && (clearTimeout(this._cleanupTimer), this._cleanupTimer = null), this._cleanupRunning = !1, this._cleanupParams = null;
  }
  /**
   * Current number of entries in cache.
   * @returns {number}
   */
  get size() {
    return this.map.size;
  }
  /**
   * Return runtime statistics for the cache.
   * @returns {{size:number, weight:number, hits:number, misses:number, evictions:number, rejected:number, poolSize:number}}
   */
  stats() {
    return { size: this.size, weight: this.currentWeight, hits: this.hits, misses: this.misses, evictions: this.evictions, rejected: this.rejected, poolSize: this.pool.length };
  }
  /**
   * Resize the cache limits and evict if necessary.
   * @param {Object} options
   * @param {number} [options.maxEntries]
   * @param {number} [options.maxWeight]
   */
  resize({ maxEntries: n, maxWeight: e } = {}) {
    Number.isFinite(+n) && (this.maxEntries = Math.max(0, +n)), Number.isFinite(+e) && (this.maxWeight = Math.max(0, +e)), this._evictIfNeeded();
  }
  /**
   * Iterate entries in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   * @returns {IterableIterator<[*,*]>}
   */
  *entries(n = "MRU") {
    if (n === "MRU")
      for (let e = this.tail; e; e = e.prev) yield [e.key, e.value];
    else
      for (let e = this.head; e; e = e.next) yield [e.key, e.value];
  }
  /**
   * Iterate keys in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *keys(n = "MRU") {
    for (const [e] of this.entries(n)) yield e;
  }
  /**
   * Iterate values in LRU or MRU order.
   * @param {'LRU'|'MRU'} [order='MRU']
   */
  *values(n = "MRU") {
    for (const [, e] of this.entries(n)) yield e;
  }
}
const M = typeof TextEncoder < "u", N = typeof TextDecoder < "u", _ = M ? new TextEncoder() : null, T = N ? new TextDecoder() : null, B = (a) => {
  if (a instanceof Uint8Array) return a;
  if (ArrayBuffer.isView(a)) return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  if (a instanceof ArrayBuffer) return new Uint8Array(a);
  const n = JSON.stringify(a);
  if (_) return _.encode(n);
  if (typeof Buffer < "u" && typeof Buffer.from == "function") return new Uint8Array(Buffer.from(n));
  throw new Error("No TextEncoder available to encode object");
}, C = (a) => {
  let n;
  if (a instanceof Uint8Array) n = a;
  else if (ArrayBuffer.isView(a)) n = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  else if (a instanceof ArrayBuffer) n = new Uint8Array(a);
  else if (typeof Buffer < "u" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(a)) n = new Uint8Array(a);
  else throw new TypeError("Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer");
  return T ? JSON.parse(T.decode(n)) : typeof Buffer < "u" && typeof Buffer.from == "function" ? JSON.parse(Buffer.from(n).toString("utf8")) : JSON.parse(new TextDecoder().decode(n));
}, k = (a) => {
  const n = B(a);
  return n.byteOffset === 0 && n.byteLength === n.buffer.byteLength ? n.buffer : n.buffer.slice(n.byteOffset, n.byteOffset + n.byteLength);
}, R = (a) => C(a);
class U {
  constructor(n) {
    this.map = n.map, this.source = n.source instanceof maplibregl.VectorTileSource ? n.source : this.map.getSource(n.source), this.sourceLayer = n.sourceLayer, this.fid = n.fid || "id", this.tiles = this.source.tiles.map((l) => l.split("{z}")[0]), this.tileSize = this.source.tileSize || 512, this.tolerance = n.tolerance || 1e-5, this.cacheSize = n.cacheSize || 5e3, this.units = n.units || "meters", this.seed = !1, this.map.addSource(this.source.id + "-proper", {
      type: "geojson",
      maxzoom: this.source.maxzoom,
      promoteId: "_index",
      data: {}
    }), this.gjSource = this.map.getSource(this.source.id + "-proper");
    const e = new E(O, { size: 6 }), t = new E(I, { size: 4 }), r = new S({
      maxEntries: this.cacheSize,
      maxWeight: this.cacheSize * 5e3,
      weight: (l) => l.size || 0
    });
    e.onmessage = (l) => {
      if (l.data instanceof ArrayBuffer) {
        const c = l.data, f = R(c);
        if (f.type === "simplified" && f.size > 0) {
          const { unique: u, type: i, ...o } = f;
          r.set(u, o);
        }
      }
    };
    const s = new S({
      maxEntries: this.cacheSize,
      maxWeight: this.cacheSize * 5e3,
      weight: (l) => l.features.length || 0
    });
    return t.onmessage = (l) => {
      if (l.data instanceof ArrayBuffer) {
        const c = l.data, f = R(c), { id: u, features: i } = f, o = {};
        if (s.has(u) && !s.hasEqual(u, i)) {
          const y = s.get(u), x = [...new Set(y.map((m) => m.properties._index))];
          o.remove = x, o.add = i, s.set(u, i);
        } else
          s.set(u, i), o.add = i;
        (o.add.length > 0 || o.remove.length > 0) && this.gjSource.updateData(o);
      }
    }, this.map.on("sourcedata", (l) => {
      if (l.sourceId === this.source.id) {
        const { z: c, x: f, y: u } = l.tile.tileID.canonical, i = `${c}|${f}|${u}`;
        if (!r.has(i)) {
          const o = this.tolerance * Math.pow(10, -0.301 * c + 5.19), y = [], x = this.source.type === "vector" ? { sourceLayer: this.sourceLayer } : {};
          l.tile.querySourceFeatures(y, x);
          const m = {
            collection: {
              type: "FeatureCollection",
              features: y.map((g, h) => ({
                id: g.properties[this.fid] || g.id,
                geometry: g.geometry,
                properties: { ...g.properties, _index: `${i}|${h}`, _tile: i, _group: g.properties[this.fid] }
              }))
            },
            tolerance: o,
            unique: i,
            tileSize: this.tileSize
          }, w = k(m);
          e.postMessage(w);
        }
        l.isSourceLoaded && e.addEventListener("idle", (o) => {
          const y = Object.fromEntries(r.entries());
          Object.values(y).map((g) => g[68]).filter((g) => !!g).reduce((g, h) => [...g, ...h.features], []);
          const m = { pieces: y, tolerance: this.tolerance, unit: this.units, tileSize: this.tileSize }, w = k(m);
          t.postMessage(w);
        });
      }
    }), this.map.refreshTiles(this.source.id), this.gjSource;
  }
}
maplibregl.VectorTileSource.prototype.ProperLabels = function(a) {
  const n = Object.assign({}, a, {
    map: this._map,
    source: this
  });
  return this._proper || (this._proper = new U(n)), this._proper;
};
export {
  U as default
};
