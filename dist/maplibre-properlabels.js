var E = 63710088e-1, se = {
  centimeters: E * 100,
  centimetres: E * 100,
  degrees: 360 / (2 * Math.PI),
  feet: E * 3.28084,
  inches: E * 39.37,
  kilometers: E / 1e3,
  kilometres: E / 1e3,
  meters: E,
  metres: E,
  miles: E / 1609.344,
  millimeters: E * 1e3,
  millimetres: E * 1e3,
  nauticalmiles: E / 1852,
  radians: 1,
  yards: E * 1.0936
};
function j(e, t, r = {}) {
  const n = { type: "Feature" };
  return (r.id === 0 || r.id) && (n.id = r.id), r.bbox && (n.bbox = r.bbox), n.properties = t || {}, n.geometry = e, n;
}
function N(e, t, r = {}) {
  if (!e)
    throw new Error("coordinates is required");
  if (!Array.isArray(e))
    throw new Error("coordinates must be an Array");
  if (e.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!W(e[0]) || !W(e[1]))
    throw new Error("coordinates must contain numbers");
  return j({
    type: "Point",
    coordinates: e
  }, t, r);
}
function Q(e, t = {}) {
  const r = { type: "FeatureCollection" };
  return t.id && (r.id = t.id), t.bbox && (r.bbox = t.bbox), r.features = e, r;
}
function le(e, t = "kilometers") {
  const r = se[t];
  if (!r)
    throw new Error(t + " units is invalid");
  return e * r;
}
function $(e) {
  return e % 360 * Math.PI / 180;
}
function W(e) {
  return !isNaN(e) && e !== null && !Array.isArray(e);
}
function z(e, t, r) {
  if (e !== null)
    for (var n, p, o, f, c, s, l, y = 0, i = 0, a, u = e.type, b = u === "FeatureCollection", d = u === "Feature", m = b ? e.features.length : 1, h = 0; h < m; h++) {
      l = b ? e.features[h].geometry : d ? e.geometry : e, a = l ? l.type === "GeometryCollection" : !1, c = a ? l.geometries.length : 1;
      for (var w = 0; w < c; w++) {
        var g = 0, v = 0;
        if (f = a ? l.geometries[w] : l, f !== null) {
          s = f.coordinates;
          var P = f.type;
          switch (y = 0, P) {
            case null:
              break;
            case "Point":
              if (t(
                s,
                i,
                h,
                g,
                v
              ) === !1)
                return !1;
              i++, g++;
              break;
            case "LineString":
            case "MultiPoint":
              for (n = 0; n < s.length; n++) {
                if (t(
                  s[n],
                  i,
                  h,
                  g,
                  v
                ) === !1)
                  return !1;
                i++, P === "MultiPoint" && g++;
              }
              P === "LineString" && g++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (n = 0; n < s.length; n++) {
                for (p = 0; p < s[n].length - y; p++) {
                  if (t(
                    s[n][p],
                    i,
                    h,
                    g,
                    v
                  ) === !1)
                    return !1;
                  i++;
                }
                P === "MultiLineString" && g++, P === "Polygon" && v++;
              }
              P === "Polygon" && g++;
              break;
            case "MultiPolygon":
              for (n = 0; n < s.length; n++) {
                for (v = 0, p = 0; p < s[n].length; p++) {
                  for (o = 0; o < s[n][p].length - y; o++) {
                    if (t(
                      s[n][p][o],
                      i,
                      h,
                      g,
                      v
                    ) === !1)
                      return !1;
                    i++;
                  }
                  v++;
                }
                g++;
              }
              break;
            case "GeometryCollection":
              for (n = 0; n < f.geometries.length; n++)
                if (z(f.geometries[n], t) === !1)
                  return !1;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }
}
function ee(e, t) {
  if (e.type === "Feature")
    t(e, 0);
  else if (e.type === "FeatureCollection")
    for (var r = 0; r < e.features.length && t(e.features[r], r) !== !1; r++)
      ;
}
function ue(e) {
  const t = [];
  return e.type === "FeatureCollection" ? ee(e, function(r) {
    z(r, function(n) {
      t.push(N(n, r.properties));
    });
  }) : e.type === "Feature" ? z(e, function(r) {
    t.push(N(r, e.properties));
  }) : z(e, function(r) {
    t.push(N(r));
  }), Q(t);
}
function fe(e, t = {}) {
  if (e.bbox != null && t.recompute !== !0)
    return e.bbox;
  const r = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return z(e, (n) => {
    r[0] > n[0] && (r[0] = n[0]), r[1] > n[1] && (r[1] = n[1]), r[2] < n[0] && (r[2] = n[0]), r[3] < n[1] && (r[3] = n[1]);
  }), r;
}
function ce(e, t = {}) {
  const r = fe(e), n = (r[0] + r[2]) / 2, p = (r[1] + r[3]) / 2;
  return N([n, p], t.properties, t);
}
function pe(e) {
  if (!e)
    throw new Error("geojson is required");
  switch (e.type) {
    case "Feature":
      return te(e);
    case "FeatureCollection":
      return ye(e);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return V(e);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function te(e) {
  const t = { type: "Feature" };
  return Object.keys(e).forEach((r) => {
    switch (r) {
      case "type":
      case "properties":
      case "geometry":
        return;
      default:
        t[r] = e[r];
    }
  }), t.properties = re(e.properties), e.geometry == null ? t.geometry = null : t.geometry = V(e.geometry), t;
}
function re(e) {
  const t = {};
  return e && Object.keys(e).forEach((r) => {
    const n = e[r];
    typeof n == "object" ? n === null ? t[r] = null : Array.isArray(n) ? t[r] = n.map((p) => p) : t[r] = re(n) : t[r] = n;
  }), t;
}
function ye(e) {
  const t = { type: "FeatureCollection" };
  return Object.keys(e).forEach((r) => {
    switch (r) {
      case "type":
      case "features":
        return;
      default:
        t[r] = e[r];
    }
  }), t.features = e.features.map((r) => te(r)), t;
}
function V(e) {
  const t = { type: e.type };
  return e.bbox && (t.bbox = e.bbox), e.type === "GeometryCollection" ? (t.geometries = e.geometries.map((r) => V(r)), t) : (t.coordinates = ne(e.coordinates), t);
}
function ne(e) {
  const t = e;
  return typeof t[0] != "object" ? t.slice() : t.map((r) => ne(r));
}
function U(e) {
  if (!e)
    throw new Error("coord is required");
  if (!Array.isArray(e)) {
    if (e.type === "Feature" && e.geometry !== null && e.geometry.type === "Point")
      return [...e.geometry.coordinates];
    if (e.type === "Point")
      return [...e.coordinates];
  }
  if (Array.isArray(e) && e.length >= 2 && !Array.isArray(e[0]) && !Array.isArray(e[1]))
    return [...e];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function he(e) {
  return e.type === "Feature" ? e.geometry : e;
}
function de(e, t, r = {}) {
  var n = U(e), p = U(t), o = $(p[1] - n[1]), f = $(p[0] - n[0]), c = $(n[1]), s = $(p[1]), l = Math.pow(Math.sin(o / 2), 2) + Math.pow(Math.sin(f / 2), 2) * Math.cos(c) * Math.cos(s);
  return le(
    2 * Math.atan2(Math.sqrt(l), Math.sqrt(1 - l)),
    r.units
  );
}
var be = Object.defineProperty, me = Object.defineProperties, we = Object.getOwnPropertyDescriptors, x = Object.getOwnPropertySymbols, ve = Object.prototype.hasOwnProperty, ge = Object.prototype.propertyIsEnumerable, H = (e, t, r) => t in e ? be(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, K = (e, t) => {
  for (var r in t || (t = {}))
    ve.call(t, r) && H(e, r, t[r]);
  if (x)
    for (var r of x(t))
      ge.call(t, r) && H(e, r, t[r]);
  return e;
}, T = (e, t) => me(e, we(t));
function Pe(e, t, r = {}) {
  if (!e) throw new Error("targetPoint is required");
  if (!t) throw new Error("points is required");
  let n = 1 / 0, p = 0;
  ee(t, (f, c) => {
    const s = de(e, f, r);
    s < n && (p = c, n = s);
  });
  const o = pe(t.features[p]);
  return T(K({}, o), {
    properties: T(K({}, o.properties), {
      featureIndex: p,
      distanceToPoint: n
    })
  });
}
const D = 11102230246251565e-32, C = 134217729, _e = (3 + 8 * D) * D;
function J(e, t, r, n, p) {
  let o, f, c, s, l = t[0], y = n[0], i = 0, a = 0;
  y > l == y > -l ? (o = l, l = t[++i]) : (o = y, y = n[++a]);
  let u = 0;
  if (i < e && a < r)
    for (y > l == y > -l ? (f = l + o, c = o - (f - l), l = t[++i]) : (f = y + o, c = o - (f - y), y = n[++a]), o = f, c !== 0 && (p[u++] = c); i < e && a < r; )
      y > l == y > -l ? (f = o + l, s = f - o, c = o - (f - s) + (l - s), l = t[++i]) : (f = o + y, s = f - o, c = o - (f - s) + (y - s), y = n[++a]), o = f, c !== 0 && (p[u++] = c);
  for (; i < e; )
    f = o + l, s = f - o, c = o - (f - s) + (l - s), l = t[++i], o = f, c !== 0 && (p[u++] = c);
  for (; a < r; )
    f = o + y, s = f - o, c = o - (f - s) + (y - s), y = n[++a], o = f, c !== 0 && (p[u++] = c);
  return (o !== 0 || u === 0) && (p[u++] = o), u;
}
function Me(e, t) {
  let r = t[0];
  for (let n = 1; n < e; n++) r += t[n];
  return r;
}
function R(e) {
  return new Float64Array(e);
}
const Ce = (3 + 16 * D) * D, Oe = (2 + 12 * D) * D, Ee = (9 + 64 * D) * D * D, k = R(4), X = R(8), Y = R(12), Z = R(16), O = R(4);
function Se(e, t, r, n, p, o, f) {
  let c, s, l, y, i, a, u, b, d, m, h, w, g, v, P, _, S, M;
  const F = e - p, A = r - p, q = t - o, L = n - o;
  v = F * L, a = C * F, u = a - (a - F), b = F - u, a = C * L, d = a - (a - L), m = L - d, P = b * m - (v - u * d - b * d - u * m), _ = q * A, a = C * q, u = a - (a - q), b = q - u, a = C * A, d = a - (a - A), m = A - d, S = b * m - (_ - u * d - b * d - u * m), h = P - S, i = P - h, k[0] = P - (h + i) + (i - S), w = v + h, i = w - v, g = v - (w - i) + (h - i), h = g - _, i = g - h, k[1] = g - (h + i) + (i - _), M = w + h, i = M - w, k[2] = w - (M - i) + (h - i), k[3] = M;
  let G = Me(4, k), B = Oe * f;
  if (G >= B || -G >= B || (i = e - F, c = e - (F + i) + (i - p), i = r - A, l = r - (A + i) + (i - p), i = t - q, s = t - (q + i) + (i - o), i = n - L, y = n - (L + i) + (i - o), c === 0 && s === 0 && l === 0 && y === 0) || (B = Ee * f + _e * Math.abs(G), G += F * y + L * c - (q * l + A * s), G >= B || -G >= B)) return G;
  v = c * L, a = C * c, u = a - (a - c), b = c - u, a = C * L, d = a - (a - L), m = L - d, P = b * m - (v - u * d - b * d - u * m), _ = s * A, a = C * s, u = a - (a - s), b = s - u, a = C * A, d = a - (a - A), m = A - d, S = b * m - (_ - u * d - b * d - u * m), h = P - S, i = P - h, O[0] = P - (h + i) + (i - S), w = v + h, i = w - v, g = v - (w - i) + (h - i), h = g - _, i = g - h, O[1] = g - (h + i) + (i - _), M = w + h, i = M - w, O[2] = w - (M - i) + (h - i), O[3] = M;
  const ie = J(4, k, 4, O, X);
  v = F * y, a = C * F, u = a - (a - F), b = F - u, a = C * y, d = a - (a - y), m = y - d, P = b * m - (v - u * d - b * d - u * m), _ = q * l, a = C * q, u = a - (a - q), b = q - u, a = C * l, d = a - (a - l), m = l - d, S = b * m - (_ - u * d - b * d - u * m), h = P - S, i = P - h, O[0] = P - (h + i) + (i - S), w = v + h, i = w - v, g = v - (w - i) + (h - i), h = g - _, i = g - h, O[1] = g - (h + i) + (i - _), M = w + h, i = M - w, O[2] = w - (M - i) + (h - i), O[3] = M;
  const oe = J(ie, X, 4, O, Y);
  v = c * y, a = C * c, u = a - (a - c), b = c - u, a = C * y, d = a - (a - y), m = y - d, P = b * m - (v - u * d - b * d - u * m), _ = s * l, a = C * s, u = a - (a - s), b = s - u, a = C * l, d = a - (a - l), m = l - d, S = b * m - (_ - u * d - b * d - u * m), h = P - S, i = P - h, O[0] = P - (h + i) + (i - S), w = v + h, i = w - v, g = v - (w - i) + (h - i), h = g - _, i = g - h, O[1] = g - (h + i) + (i - _), M = w + h, i = M - w, O[2] = w - (M - i) + (h - i), O[3] = M;
  const ae = J(oe, Y, 4, O, Z);
  return Z[ae - 1];
}
function Fe(e, t, r, n, p, o) {
  const f = (t - o) * (r - p), c = (e - p) * (n - o), s = f - c, l = Math.abs(f + c);
  return Math.abs(s) >= Ce * l ? s : -Se(e, t, r, n, p, o, l);
}
function Ae(e, t) {
  var r, n, p = 0, o, f, c, s, l, y, i, a = e[0], u = e[1], b = t.length;
  for (r = 0; r < b; r++) {
    n = 0;
    var d = t[r], m = d.length - 1;
    if (y = d[0], y[0] !== d[m][0] && y[1] !== d[m][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (f = y[0] - a, c = y[1] - u, n; n < m; n++) {
      if (i = d[n + 1], s = i[0] - a, l = i[1] - u, c === 0 && l === 0) {
        if (s <= 0 && f >= 0 || f <= 0 && s >= 0)
          return 0;
      } else if (l >= 0 && c <= 0 || l <= 0 && c >= 0) {
        if (o = Fe(f, s, c, l, 0, 0), o === 0)
          return 0;
        (o > 0 && l > 0 && c <= 0 || o < 0 && l <= 0 && c > 0) && p++;
      }
      y = i, c = l, f = s;
    }
  }
  return p % 2 !== 0;
}
function qe(e, t, r = {}) {
  if (!e)
    throw new Error("point is required");
  if (!t)
    throw new Error("polygon is required");
  const n = U(e), p = he(t), o = p.type, f = t.bbox;
  let c = p.coordinates;
  if (f && Le(n, f) === !1)
    return !1;
  o === "Polygon" && (c = [c]);
  let s = !1;
  for (var l = 0; l < c.length; ++l) {
    const y = Ae(n, c[l]);
    if (y === 0) return !r.ignoreBoundary;
    y && (s = !0);
  }
  return s;
}
function Le(e, t) {
  return t[0] <= e[0] && t[1] <= e[1] && t[2] >= e[0] && t[3] >= e[1];
}
function Ge(e) {
  const t = De(e), r = ce(t);
  let n = !1, p = 0;
  for (; !n && p < t.features.length; ) {
    const o = t.features[p].geometry;
    let f, c, s, l, y, i, a = !1;
    if (o.type === "Point")
      r.geometry.coordinates[0] === o.coordinates[0] && r.geometry.coordinates[1] === o.coordinates[1] && (n = !0);
    else if (o.type === "MultiPoint") {
      let u = !1, b = 0;
      for (; !u && b < o.coordinates.length; )
        r.geometry.coordinates[0] === o.coordinates[b][0] && r.geometry.coordinates[1] === o.coordinates[b][1] && (n = !0, u = !0), b++;
    } else if (o.type === "LineString") {
      let u = 0;
      for (; !a && u < o.coordinates.length - 1; )
        f = r.geometry.coordinates[0], c = r.geometry.coordinates[1], s = o.coordinates[u][0], l = o.coordinates[u][1], y = o.coordinates[u + 1][0], i = o.coordinates[u + 1][1], I(f, c, s, l, y, i) && (a = !0, n = !0), u++;
    } else if (o.type === "MultiLineString") {
      let u = 0;
      for (; u < o.coordinates.length; ) {
        a = !1;
        let b = 0;
        const d = o.coordinates[u];
        for (; !a && b < d.length - 1; )
          f = r.geometry.coordinates[0], c = r.geometry.coordinates[1], s = d[b][0], l = d[b][1], y = d[b + 1][0], i = d[b + 1][1], I(f, c, s, l, y, i) && (a = !0, n = !0), b++;
        u++;
      }
    } else (o.type === "Polygon" || o.type === "MultiPolygon") && qe(r, o) && (n = !0);
    p++;
  }
  if (n)
    return r;
  {
    const o = Q([]);
    for (let f = 0; f < t.features.length; f++)
      o.features = o.features.concat(
        ue(t.features[f]).features
      );
    return N(Pe(r, o).geometry.coordinates);
  }
}
function De(e) {
  return e.type !== "FeatureCollection" ? e.type !== "Feature" ? Q([j(e)]) : Q([e]) : e;
}
function I(e, t, r, n, p, o) {
  const f = Math.sqrt((p - r) * (p - r) + (o - n) * (o - n)), c = Math.sqrt((e - r) * (e - r) + (t - n) * (t - n)), s = Math.sqrt((p - e) * (p - e) + (o - t) * (o - t));
  return f === c + s;
}
function ke(e) {
  const t = this, r = {
    id: `${e.layer_name}_labels`,
    type: "symbol",
    paint: {
      "text-color": "rgba(8, 37, 77, 1)",
      "text-halo-blur": {
        stops: [
          [
            2,
            0.2
          ],
          [
            6,
            0
          ]
        ]
      },
      "text-halo-color": "rgba(255, 255, 255, 1)",
      "text-halo-width": {
        stops: [
          [
            2,
            1
          ],
          [
            6,
            1.6
          ]
        ]
      }
    },
    filter: [
      "all"
    ],
    layout: {
      "text-font": [
        "Open Sans Semibold"
      ],
      "text-size": {
        stops: [
          [
            2,
            10
          ],
          [
            4,
            12
          ],
          [
            6,
            16
          ]
        ]
      },
      "text-field": "{text}",
      visibility: "visible",
      "text-max-width": 10,
      "text-transform": {
        stops: [
          [
            0,
            "uppercase"
          ],
          [
            2,
            "none"
          ]
        ]
      }
    },
    source: `${e.layer_name}_labels_source`,
    maxzoom: 24,
    minzoom: 2
  }, n = Object.assign(r, e.label_style), p = {
    type: "FeatureCollection",
    features: []
  }, o = () => {
    const f = t.queryRenderedFeatures({ layers: [e.layer_name] }), c = Object.groupBy(
      f,
      (s) => e.label_id ? s.properties[e.label_id] : s.id
    );
    p.features.length = 0;
    for (const [s, l] of Object.entries(c)) {
      const y = {
        type: "FeatureCollection",
        features: l.map((a) => ({
          type: "Feature",
          properties: a.properties,
          geometry: a.geometry
        }))
      }, i = Ge(y);
      i.properties = l[0].properties, p.features.push(i);
    }
    t.getSource(`${e.layer_name}_labels_source`).setData(p);
  };
  t.addSource(`${e.layer_name}_labels_source`, {
    type: "geojson",
    data: p
  }), t.addLayer(n), t.on("move", o), o();
}
maplibregl.Map.prototype.addProperLabels = ke;
