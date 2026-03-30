const Q = 23283064365386963e-26, vn = 12, nn = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8"), K = 0, U = 1, D = 2, q = 5;
class bn {
  /**
   * @param {Uint8Array | ArrayBuffer} [buf]
   */
  constructor(n = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(n) ? n : new Uint8Array(n), this.dataView = new DataView(this.buf.buffer), this.pos = 0, this.type = 0, this.length = this.buf.length;
  }
  // === READING =================================================================
  /**
   * @template T
   * @param {(tag: number, result: T, pbf: Pbf) => void} readField
   * @param {T} result
   * @param {number} [end]
   */
  readFields(n, t, o = this.length) {
    for (; this.pos < o; ) {
      const r = this.readVarint(), l = r >> 3, a = this.pos;
      this.type = r & 7, n(l, t, this), this.pos === a && this.skip(r);
    }
    return t;
  }
  /**
   * @template T
   * @param {(tag: number, result: T, pbf: Pbf) => void} readField
   * @param {T} result
   */
  readMessage(n, t) {
    return this.readFields(n, t, this.readVarint() + this.pos);
  }
  readFixed32() {
    const n = this.dataView.getUint32(this.pos, !0);
    return this.pos += 4, n;
  }
  readSFixed32() {
    const n = this.dataView.getInt32(this.pos, !0);
    return this.pos += 4, n;
  }
  // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
  readFixed64() {
    const n = this.dataView.getUint32(this.pos, !0) + this.dataView.getUint32(this.pos + 4, !0) * 4294967296;
    return this.pos += 8, n;
  }
  readSFixed64() {
    const n = this.dataView.getUint32(this.pos, !0) + this.dataView.getInt32(this.pos + 4, !0) * 4294967296;
    return this.pos += 8, n;
  }
  readFloat() {
    const n = this.dataView.getFloat32(this.pos, !0);
    return this.pos += 4, n;
  }
  readDouble() {
    const n = this.dataView.getFloat64(this.pos, !0);
    return this.pos += 8, n;
  }
  /**
   * @param {boolean} [isSigned]
   */
  readVarint(n) {
    const t = this.buf;
    let o, r;
    return r = t[this.pos++], o = r & 127, r < 128 || (r = t[this.pos++], o |= (r & 127) << 7, r < 128) || (r = t[this.pos++], o |= (r & 127) << 14, r < 128) || (r = t[this.pos++], o |= (r & 127) << 21, r < 128) ? o : (r = t[this.pos], o |= (r & 15) << 28, En(o, n, this));
  }
  readVarint64() {
    return this.readVarint(!0);
  }
  readSVarint() {
    const n = this.readVarint();
    return n % 2 === 1 ? (n + 1) / -2 : n / 2;
  }
  readBoolean() {
    return !!this.readVarint();
  }
  readString() {
    const n = this.readVarint() + this.pos, t = this.pos;
    return this.pos = n, n - t >= vn && nn ? nn.decode(this.buf.subarray(t, n)) : On(this.buf, t, n);
  }
  readBytes() {
    const n = this.readVarint() + this.pos, t = this.buf.subarray(this.pos, n);
    return this.pos = n, t;
  }
  // verbose for performance reasons; doesn't affect gzipped size
  /**
   * @param {number[]} [arr]
   * @param {boolean} [isSigned]
   */
  readPackedVarint(n = [], t) {
    const o = this.readPackedEnd();
    for (; this.pos < o; ) n.push(this.readVarint(t));
    return n;
  }
  /** @param {number[]} [arr] */
  readPackedSVarint(n = []) {
    const t = this.readPackedEnd();
    for (; this.pos < t; ) n.push(this.readSVarint());
    return n;
  }
  /** @param {boolean[]} [arr] */
  readPackedBoolean(n = []) {
    const t = this.readPackedEnd();
    for (; this.pos < t; ) n.push(this.readBoolean());
    return n;
  }
  /** @param {number[]} [arr] */
  readPackedFloat(n = []) {
    const t = this.readPackedEnd();
    for (; this.pos < t; ) n.push(this.readFloat());
    return n;
  }
  /** @param {number[]} [arr] */
  readPackedDouble(n = []) {
    const t = this.readPackedEnd();
    for (; this.pos < t; ) n.push(this.readDouble());
    return n;
  }
  /** @param {number[]} [arr] */
  readPackedFixed32(n = []) {
    const t = this.readPackedEnd();
    for (; this.pos < t; ) n.push(this.readFixed32());
    return n;
  }
  /** @param {number[]} [arr] */
  readPackedSFixed32(n = []) {
    const t = this.readPackedEnd();
    for (; this.pos < t; ) n.push(this.readSFixed32());
    return n;
  }
  /** @param {number[]} [arr] */
  readPackedFixed64(n = []) {
    const t = this.readPackedEnd();
    for (; this.pos < t; ) n.push(this.readFixed64());
    return n;
  }
  /** @param {number[]} [arr] */
  readPackedSFixed64(n = []) {
    const t = this.readPackedEnd();
    for (; this.pos < t; ) n.push(this.readSFixed64());
    return n;
  }
  readPackedEnd() {
    return this.type === D ? this.readVarint() + this.pos : this.pos + 1;
  }
  /** @param {number} val */
  skip(n) {
    const t = n & 7;
    if (t === K) for (; this.buf[this.pos++] > 127; )
      ;
    else if (t === D) this.pos = this.readVarint() + this.pos;
    else if (t === q) this.pos += 4;
    else if (t === U) this.pos += 8;
    else throw new Error(`Unimplemented type: ${t}`);
  }
  // === WRITING =================================================================
  /**
   * @param {number} tag
   * @param {number} type
   */
  writeTag(n, t) {
    this.writeVarint(n << 3 | t);
  }
  /** @param {number} min */
  realloc(n) {
    let t = this.length || 16;
    for (; t < this.pos + n; ) t *= 2;
    if (t !== this.length) {
      const o = new Uint8Array(t);
      o.set(this.buf), this.buf = o, this.dataView = new DataView(o.buffer), this.length = t;
    }
  }
  finish() {
    return this.length = this.pos, this.pos = 0, this.buf.subarray(0, this.length);
  }
  /** @param {number} val */
  writeFixed32(n) {
    this.realloc(4), this.dataView.setInt32(this.pos, n, !0), this.pos += 4;
  }
  /** @param {number} val */
  writeSFixed32(n) {
    this.realloc(4), this.dataView.setInt32(this.pos, n, !0), this.pos += 4;
  }
  /** @param {number} val */
  writeFixed64(n) {
    this.realloc(8), this.dataView.setInt32(this.pos, n & -1, !0), this.dataView.setInt32(this.pos + 4, Math.floor(n * Q), !0), this.pos += 8;
  }
  /** @param {number} val */
  writeSFixed64(n) {
    this.realloc(8), this.dataView.setInt32(this.pos, n & -1, !0), this.dataView.setInt32(this.pos + 4, Math.floor(n * Q), !0), this.pos += 8;
  }
  /** @param {number} val */
  writeVarint(n) {
    if (n = +n || 0, n > 268435455 || n < 0) {
      Sn(n, this);
      return;
    }
    this.realloc(4), this.buf[this.pos++] = n & 127 | (n > 127 ? 128 : 0), !(n <= 127) && (this.buf[this.pos++] = (n >>>= 7) & 127 | (n > 127 ? 128 : 0), !(n <= 127) && (this.buf[this.pos++] = (n >>>= 7) & 127 | (n > 127 ? 128 : 0), !(n <= 127) && (this.buf[this.pos++] = n >>> 7 & 127)));
  }
  /** @param {number} val */
  writeSVarint(n) {
    this.writeVarint(n < 0 ? -n * 2 - 1 : n * 2);
  }
  /** @param {boolean} val */
  writeBoolean(n) {
    this.writeVarint(+n);
  }
  /** @param {string} str */
  writeString(n) {
    n = String(n), this.realloc(n.length * 4), this.pos++;
    const t = this.pos;
    this.pos = Cn(this.buf, n, this.pos);
    const o = this.pos - t;
    o >= 128 && tn(t, o, this), this.pos = t - 1, this.writeVarint(o), this.pos += o;
  }
  /** @param {number} val */
  writeFloat(n) {
    this.realloc(4), this.dataView.setFloat32(this.pos, n, !0), this.pos += 4;
  }
  /** @param {number} val */
  writeDouble(n) {
    this.realloc(8), this.dataView.setFloat64(this.pos, n, !0), this.pos += 8;
  }
  /** @param {Uint8Array} buffer */
  writeBytes(n) {
    const t = n.length;
    this.writeVarint(t), this.realloc(t);
    for (let o = 0; o < t; o++) this.buf[this.pos++] = n[o];
  }
  /**
   * @template T
   * @param {(obj: T, pbf: Pbf) => void} fn
   * @param {T} obj
   */
  writeRawMessage(n, t) {
    this.pos++;
    const o = this.pos;
    n(t, this);
    const r = this.pos - o;
    r >= 128 && tn(o, r, this), this.pos = o - 1, this.writeVarint(r), this.pos += r;
  }
  /**
   * @template T
   * @param {number} tag
   * @param {(obj: T, pbf: Pbf) => void} fn
   * @param {T} obj
   */
  writeMessage(n, t, o) {
    this.writeTag(n, D), this.writeRawMessage(t, o);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedVarint(n, t) {
    t.length && this.writeMessage(n, _n, t);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSVarint(n, t) {
    t.length && this.writeMessage(n, Mn, t);
  }
  /**
   * @param {number} tag
   * @param {boolean[]} arr
   */
  writePackedBoolean(n, t) {
    t.length && this.writeMessage(n, kn, t);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFloat(n, t) {
    t.length && this.writeMessage(n, Tn, t);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedDouble(n, t) {
    t.length && this.writeMessage(n, Ln, t);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFixed32(n, t) {
    t.length && this.writeMessage(n, Vn, t);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSFixed32(n, t) {
    t.length && this.writeMessage(n, An, t);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFixed64(n, t) {
    t.length && this.writeMessage(n, Bn, t);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSFixed64(n, t) {
    t.length && this.writeMessage(n, Rn, t);
  }
  /**
   * @param {number} tag
   * @param {Uint8Array} buffer
   */
  writeBytesField(n, t) {
    this.writeTag(n, D), this.writeBytes(t);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFixed32Field(n, t) {
    this.writeTag(n, q), this.writeFixed32(t);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSFixed32Field(n, t) {
    this.writeTag(n, q), this.writeSFixed32(t);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFixed64Field(n, t) {
    this.writeTag(n, U), this.writeFixed64(t);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSFixed64Field(n, t) {
    this.writeTag(n, U), this.writeSFixed64(t);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeVarintField(n, t) {
    this.writeTag(n, K), this.writeVarint(t);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSVarintField(n, t) {
    this.writeTag(n, K), this.writeSVarint(t);
  }
  /**
   * @param {number} tag
   * @param {string} str
   */
  writeStringField(n, t) {
    this.writeTag(n, D), this.writeString(t);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFloatField(n, t) {
    this.writeTag(n, q), this.writeFloat(t);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeDoubleField(n, t) {
    this.writeTag(n, U), this.writeDouble(t);
  }
  /**
   * @param {number} tag
   * @param {boolean} val
   */
  writeBooleanField(n, t) {
    this.writeVarintField(n, +t);
  }
}
function En(i, n, t) {
  const o = t.buf;
  let r, l;
  if (l = o[t.pos++], r = (l & 112) >> 4, l < 128 || (l = o[t.pos++], r |= (l & 127) << 3, l < 128) || (l = o[t.pos++], r |= (l & 127) << 10, l < 128) || (l = o[t.pos++], r |= (l & 127) << 17, l < 128) || (l = o[t.pos++], r |= (l & 127) << 24, l < 128) || (l = o[t.pos++], r |= (l & 1) << 31, l < 128)) return I(i, r, n);
  throw new Error("Expected varint not more than 10 bytes");
}
function I(i, n, t) {
  return t ? n * 4294967296 + (i >>> 0) : (n >>> 0) * 4294967296 + (i >>> 0);
}
function Sn(i, n) {
  let t, o;
  if (i >= 0 ? (t = i % 4294967296 | 0, o = i / 4294967296 | 0) : (t = ~(-i % 4294967296), o = ~(-i / 4294967296), t ^ 4294967295 ? t = t + 1 | 0 : (t = 0, o = o + 1 | 0)), i >= 18446744073709552e3 || i < -18446744073709552e3)
    throw new Error("Given varint doesn't fit into 10 bytes");
  n.realloc(10), Pn(t, o, n), Fn(o, n);
}
function Pn(i, n, t) {
  t.buf[t.pos++] = i & 127 | 128, i >>>= 7, t.buf[t.pos++] = i & 127 | 128, i >>>= 7, t.buf[t.pos++] = i & 127 | 128, i >>>= 7, t.buf[t.pos++] = i & 127 | 128, i >>>= 7, t.buf[t.pos] = i & 127;
}
function Fn(i, n) {
  const t = (i & 7) << 4;
  n.buf[n.pos++] |= t | ((i >>>= 3) ? 128 : 0), i && (n.buf[n.pos++] = i & 127 | ((i >>>= 7) ? 128 : 0), i && (n.buf[n.pos++] = i & 127 | ((i >>>= 7) ? 128 : 0), i && (n.buf[n.pos++] = i & 127 | ((i >>>= 7) ? 128 : 0), i && (n.buf[n.pos++] = i & 127 | ((i >>>= 7) ? 128 : 0), i && (n.buf[n.pos++] = i & 127)))));
}
function tn(i, n, t) {
  const o = n <= 16383 ? 1 : n <= 2097151 ? 2 : n <= 268435455 ? 3 : Math.floor(Math.log(n) / (Math.LN2 * 7));
  t.realloc(o);
  for (let r = t.pos - 1; r >= i; r--) t.buf[r + o] = t.buf[r];
}
function _n(i, n) {
  for (let t = 0; t < i.length; t++) n.writeVarint(i[t]);
}
function Mn(i, n) {
  for (let t = 0; t < i.length; t++) n.writeSVarint(i[t]);
}
function Tn(i, n) {
  for (let t = 0; t < i.length; t++) n.writeFloat(i[t]);
}
function Ln(i, n) {
  for (let t = 0; t < i.length; t++) n.writeDouble(i[t]);
}
function kn(i, n) {
  for (let t = 0; t < i.length; t++) n.writeBoolean(i[t]);
}
function Vn(i, n) {
  for (let t = 0; t < i.length; t++) n.writeFixed32(i[t]);
}
function An(i, n) {
  for (let t = 0; t < i.length; t++) n.writeSFixed32(i[t]);
}
function Bn(i, n) {
  for (let t = 0; t < i.length; t++) n.writeFixed64(i[t]);
}
function Rn(i, n) {
  for (let t = 0; t < i.length; t++) n.writeSFixed64(i[t]);
}
function On(i, n, t) {
  let o = "", r = n;
  for (; r < t; ) {
    const l = i[r];
    let a = null, c = l > 239 ? 4 : l > 223 ? 3 : l > 191 ? 2 : 1;
    if (r + c > t) break;
    let p, d, y;
    c === 1 ? l < 128 && (a = l) : c === 2 ? (p = i[r + 1], (p & 192) === 128 && (a = (l & 31) << 6 | p & 63, a <= 127 && (a = null))) : c === 3 ? (p = i[r + 1], d = i[r + 2], (p & 192) === 128 && (d & 192) === 128 && (a = (l & 15) << 12 | (p & 63) << 6 | d & 63, (a <= 2047 || a >= 55296 && a <= 57343) && (a = null))) : c === 4 && (p = i[r + 1], d = i[r + 2], y = i[r + 3], (p & 192) === 128 && (d & 192) === 128 && (y & 192) === 128 && (a = (l & 15) << 18 | (p & 63) << 12 | (d & 63) << 6 | y & 63, (a <= 65535 || a >= 1114112) && (a = null))), a === null ? (a = 65533, c = 1) : a > 65535 && (a -= 65536, o += String.fromCharCode(a >>> 10 & 1023 | 55296), a = 56320 | a & 1023), o += String.fromCharCode(a), r += c;
  }
  return o;
}
function Cn(i, n, t) {
  for (let o = 0, r, l; o < n.length; o++) {
    if (r = n.charCodeAt(o), r > 55295 && r < 57344)
      if (l)
        if (r < 56320) {
          i[t++] = 239, i[t++] = 191, i[t++] = 189, l = r;
          continue;
        } else
          r = l - 55296 << 10 | r - 56320 | 65536, l = null;
      else {
        r > 56319 || o + 1 === n.length ? (i[t++] = 239, i[t++] = 191, i[t++] = 189) : l = r;
        continue;
      }
    else l && (i[t++] = 239, i[t++] = 191, i[t++] = 189, l = null);
    r < 128 ? i[t++] = r : (r < 2048 ? i[t++] = r >> 6 | 192 : (r < 65536 ? i[t++] = r >> 12 | 224 : (i[t++] = r >> 18 | 240, i[t++] = r >> 12 & 63 | 128), i[t++] = r >> 6 & 63 | 128), i[t++] = r & 63 | 128);
  }
  return t;
}
function R(i, n) {
  this.x = i, this.y = n;
}
R.prototype = {
  /**
   * Clone this point, returning a new point that can be modified
   * without affecting the old one.
   * @return {Point} the clone
   */
  clone() {
    return new R(this.x, this.y);
  },
  /**
   * Add this point's x & y coordinates to another point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  add(i) {
    return this.clone()._add(i);
  },
  /**
   * Subtract this point's x & y coordinates to from point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  sub(i) {
    return this.clone()._sub(i);
  },
  /**
   * Multiply this point's x & y coordinates by point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  multByPoint(i) {
    return this.clone()._multByPoint(i);
  },
  /**
   * Divide this point's x & y coordinates by point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  divByPoint(i) {
    return this.clone()._divByPoint(i);
  },
  /**
   * Multiply this point's x & y coordinates by a factor,
   * yielding a new point.
   * @param {number} k factor
   * @return {Point} output point
   */
  mult(i) {
    return this.clone()._mult(i);
  },
  /**
   * Divide this point's x & y coordinates by a factor,
   * yielding a new point.
   * @param {number} k factor
   * @return {Point} output point
   */
  div(i) {
    return this.clone()._div(i);
  },
  /**
   * Rotate this point around the 0, 0 origin by an angle a,
   * given in radians
   * @param {number} a angle to rotate around, in radians
   * @return {Point} output point
   */
  rotate(i) {
    return this.clone()._rotate(i);
  },
  /**
   * Rotate this point around p point by an angle a,
   * given in radians
   * @param {number} a angle to rotate around, in radians
   * @param {Point} p Point to rotate around
   * @return {Point} output point
   */
  rotateAround(i, n) {
    return this.clone()._rotateAround(i, n);
  },
  /**
   * Multiply this point by a 4x1 transformation matrix
   * @param {[number, number, number, number]} m transformation matrix
   * @return {Point} output point
   */
  matMult(i) {
    return this.clone()._matMult(i);
  },
  /**
   * Calculate this point but as a unit vector from 0, 0, meaning
   * that the distance from the resulting point to the 0, 0
   * coordinate will be equal to 1 and the angle from the resulting
   * point to the 0, 0 coordinate will be the same as before.
   * @return {Point} unit vector point
   */
  unit() {
    return this.clone()._unit();
  },
  /**
   * Compute a perpendicular point, where the new y coordinate
   * is the old x coordinate and the new x coordinate is the old y
   * coordinate multiplied by -1
   * @return {Point} perpendicular point
   */
  perp() {
    return this.clone()._perp();
  },
  /**
   * Return a version of this point with the x & y coordinates
   * rounded to integers.
   * @return {Point} rounded point
   */
  round() {
    return this.clone()._round();
  },
  /**
   * Return the magnitude of this point: this is the Euclidean
   * distance from the 0, 0 coordinate to this point's x and y
   * coordinates.
   * @return {number} magnitude
   */
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  /**
   * Judge whether this point is equal to another point, returning
   * true or false.
   * @param {Point} other the other point
   * @return {boolean} whether the points are equal
   */
  equals(i) {
    return this.x === i.x && this.y === i.y;
  },
  /**
   * Calculate the distance from this point to another point
   * @param {Point} p the other point
   * @return {number} distance
   */
  dist(i) {
    return Math.sqrt(this.distSqr(i));
  },
  /**
   * Calculate the distance from this point to another point,
   * without the square root step. Useful if you're comparing
   * relative distances.
   * @param {Point} p the other point
   * @return {number} distance
   */
  distSqr(i) {
    const n = i.x - this.x, t = i.y - this.y;
    return n * n + t * t;
  },
  /**
   * Get the angle from the 0, 0 coordinate to this point, in radians
   * coordinates.
   * @return {number} angle
   */
  angle() {
    return Math.atan2(this.y, this.x);
  },
  /**
   * Get the angle from this point to another point, in radians
   * @param {Point} b the other point
   * @return {number} angle
   */
  angleTo(i) {
    return Math.atan2(this.y - i.y, this.x - i.x);
  },
  /**
   * Get the angle between this point and another point, in radians
   * @param {Point} b the other point
   * @return {number} angle
   */
  angleWith(i) {
    return this.angleWithSep(i.x, i.y);
  },
  /**
   * Find the angle of the two vectors, solving the formula for
   * the cross product a x b = |a||b|sin(θ) for θ.
   * @param {number} x the x-coordinate
   * @param {number} y the y-coordinate
   * @return {number} the angle in radians
   */
  angleWithSep(i, n) {
    return Math.atan2(
      this.x * n - this.y * i,
      this.x * i + this.y * n
    );
  },
  /** @param {[number, number, number, number]} m */
  _matMult(i) {
    const n = i[0] * this.x + i[1] * this.y, t = i[2] * this.x + i[3] * this.y;
    return this.x = n, this.y = t, this;
  },
  /** @param {Point} p */
  _add(i) {
    return this.x += i.x, this.y += i.y, this;
  },
  /** @param {Point} p */
  _sub(i) {
    return this.x -= i.x, this.y -= i.y, this;
  },
  /** @param {number} k */
  _mult(i) {
    return this.x *= i, this.y *= i, this;
  },
  /** @param {number} k */
  _div(i) {
    return this.x /= i, this.y /= i, this;
  },
  /** @param {Point} p */
  _multByPoint(i) {
    return this.x *= i.x, this.y *= i.y, this;
  },
  /** @param {Point} p */
  _divByPoint(i) {
    return this.x /= i.x, this.y /= i.y, this;
  },
  _unit() {
    return this._div(this.mag()), this;
  },
  _perp() {
    const i = this.y;
    return this.y = this.x, this.x = -i, this;
  },
  /** @param {number} angle */
  _rotate(i) {
    const n = Math.cos(i), t = Math.sin(i), o = n * this.x - t * this.y, r = t * this.x + n * this.y;
    return this.x = o, this.y = r, this;
  },
  /**
   * @param {number} angle
   * @param {Point} p
   */
  _rotateAround(i, n) {
    const t = Math.cos(i), o = Math.sin(i), r = n.x + t * (this.x - n.x) - o * (this.y - n.y), l = n.y + o * (this.x - n.x) + t * (this.y - n.y);
    return this.x = r, this.y = l, this;
  },
  _round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  },
  constructor: R
};
R.convert = function(i) {
  if (i instanceof R)
    return (
      /** @type {Point} */
      i
    );
  if (Array.isArray(i))
    return new R(+i[0], +i[1]);
  if (i.x !== void 0 && i.y !== void 0)
    return new R(+i.x, +i.y);
  throw new Error("Expected [x, y] or {x, y} point format");
};
class pn {
  /**
   * @param {Pbf} pbf
   * @param {number} end
   * @param {number} extent
   * @param {string[]} keys
   * @param {(number | string | boolean)[]} values
   */
  constructor(n, t, o, r, l) {
    this.properties = {}, this.extent = o, this.type = 0, this.id = void 0, this._pbf = n, this._geometry = -1, this._keys = r, this._values = l, n.readFields(In, this, t);
  }
  loadGeometry() {
    const n = this._pbf;
    n.pos = this._geometry;
    const t = n.readVarint() + n.pos, o = [];
    let r, l = 1, a = 0, c = 0, p = 0;
    for (; n.pos < t; ) {
      if (a <= 0) {
        const d = n.readVarint();
        l = d & 7, a = d >> 3;
      }
      if (a--, l === 1 || l === 2)
        c += n.readSVarint(), p += n.readSVarint(), l === 1 && (r && o.push(r), r = []), r && r.push(new R(c, p));
      else if (l === 7)
        r && r.push(r[0].clone());
      else
        throw new Error(`unknown command ${l}`);
    }
    return r && o.push(r), o;
  }
  bbox() {
    const n = this._pbf;
    n.pos = this._geometry;
    const t = n.readVarint() + n.pos;
    let o = 1, r = 0, l = 0, a = 0, c = 1 / 0, p = -1 / 0, d = 1 / 0, y = -1 / 0;
    for (; n.pos < t; ) {
      if (r <= 0) {
        const w = n.readVarint();
        o = w & 7, r = w >> 3;
      }
      if (r--, o === 1 || o === 2)
        l += n.readSVarint(), a += n.readSVarint(), l < c && (c = l), l > p && (p = l), a < d && (d = a), a > y && (y = a);
      else if (o !== 7)
        throw new Error(`unknown command ${o}`);
    }
    return [c, d, p, y];
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @return {Feature}
   */
  toGeoJSON(n, t, o) {
    const r = this.extent * Math.pow(2, o), l = this.extent * n, a = this.extent * t, c = this.loadGeometry();
    function p(u) {
      return [
        (u.x + l) * 360 / r - 180,
        360 / Math.PI * Math.atan(Math.exp((1 - (u.y + a) * 2 / r) * Math.PI)) - 90
      ];
    }
    function d(u) {
      return u.map(p);
    }
    let y;
    if (this.type === 1) {
      const u = [];
      for (const g of c)
        u.push(g[0]);
      const f = d(u);
      y = u.length === 1 ? { type: "Point", coordinates: f[0] } : { type: "MultiPoint", coordinates: f };
    } else if (this.type === 2) {
      const u = c.map(d);
      y = u.length === 1 ? { type: "LineString", coordinates: u[0] } : { type: "MultiLineString", coordinates: u };
    } else if (this.type === 3) {
      const u = Dn(c), f = [];
      for (const g of u)
        f.push(g.map(d));
      y = f.length === 1 ? { type: "Polygon", coordinates: f[0] } : { type: "MultiPolygon", coordinates: f };
    } else
      throw new Error("unknown feature type");
    const w = {
      type: "Feature",
      geometry: y,
      properties: this.properties
    };
    return this.id != null && (w.id = this.id), w;
  }
}
pn.types = ["Unknown", "Point", "LineString", "Polygon"];
function In(i, n, t) {
  i === 1 ? n.id = t.readVarint() : i === 2 ? Nn(t, n) : i === 3 ? n.type = /** @type {0 | 1 | 2 | 3} */
  t.readVarint() : i === 4 && (n._geometry = t.pos);
}
function Nn(i, n) {
  const t = i.readVarint() + i.pos;
  for (; i.pos < t; ) {
    const o = n._keys[i.readVarint()], r = n._values[i.readVarint()];
    n.properties[o] = r;
  }
}
function Dn(i) {
  const n = i.length;
  if (n <= 1) return [i];
  const t = [];
  let o, r;
  for (let l = 0; l < n; l++) {
    const a = Gn(i[l]);
    a !== 0 && (r === void 0 && (r = a < 0), r === a < 0 ? (o && t.push(o), o = [i[l]]) : o && o.push(i[l]));
  }
  return o && t.push(o), t;
}
function Gn(i) {
  let n = 0;
  for (let t = 0, o = i.length, r = o - 1, l, a; t < o; r = t++)
    l = i[t], a = i[r], n += (a.x - l.x) * (l.y + a.y);
  return n;
}
class Un {
  /**
   * @param {Pbf} pbf
   * @param {number} [end]
   */
  constructor(n, t) {
    this.version = 1, this.name = "", this.extent = 4096, this.length = 0, this._pbf = n, this._keys = [], this._values = [], this._features = [], n.readFields(qn, this, t), this.length = this._features.length;
  }
  /** return feature `i` from this layer as a `VectorTileFeature`
   * @param {number} i
   */
  feature(n) {
    if (n < 0 || n >= this._features.length) throw new Error("feature index out of bounds");
    this._pbf.pos = this._features[n];
    const t = this._pbf.readVarint() + this._pbf.pos;
    return new pn(this._pbf, t, this.extent, this._keys, this._values);
  }
}
function qn(i, n, t) {
  i === 15 ? n.version = t.readVarint() : i === 1 ? n.name = t.readString() : i === 5 ? n.extent = t.readVarint() : i === 2 ? n._features.push(t.pos) : i === 3 ? n._keys.push(t.readString()) : i === 4 && n._values.push(jn(t));
}
function jn(i) {
  let n = null;
  const t = i.readVarint() + i.pos;
  for (; i.pos < t; ) {
    const o = i.readVarint() >> 3;
    n = o === 1 ? i.readString() : o === 2 ? i.readFloat() : o === 3 ? i.readDouble() : o === 4 ? i.readVarint64() : o === 5 ? i.readVarint() : o === 6 ? i.readSVarint() : o === 7 ? i.readBoolean() : null;
  }
  if (n == null)
    throw new Error("unknown feature value");
  return n;
}
class zn {
  /**
   * @param {Pbf} pbf
   * @param {number} [end]
   */
  constructor(n, t) {
    this.layers = n.readFields($n, {}, t);
  }
}
function $n(i, n, t) {
  if (i === 3) {
    const o = new Un(t, t.readVarint() + t.pos);
    o.length && (n[o.name] = o);
  }
}
function Kn(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
var N = { exports: {} }, j = {};
var en;
function Wn() {
  return en || (en = 1, j.read = function(i, n, t, o, r) {
    var l, a, c = r * 8 - o - 1, p = (1 << c) - 1, d = p >> 1, y = -7, w = t ? r - 1 : 0, u = t ? -1 : 1, f = i[n + w];
    for (w += u, l = f & (1 << -y) - 1, f >>= -y, y += c; y > 0; l = l * 256 + i[n + w], w += u, y -= 8)
      ;
    for (a = l & (1 << -y) - 1, l >>= -y, y += o; y > 0; a = a * 256 + i[n + w], w += u, y -= 8)
      ;
    if (l === 0)
      l = 1 - d;
    else {
      if (l === p)
        return a ? NaN : (f ? -1 : 1) * (1 / 0);
      a = a + Math.pow(2, o), l = l - d;
    }
    return (f ? -1 : 1) * a * Math.pow(2, l - o);
  }, j.write = function(i, n, t, o, r, l) {
    var a, c, p, d = l * 8 - r - 1, y = (1 << d) - 1, w = y >> 1, u = r === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, f = o ? 0 : l - 1, g = o ? 1 : -1, x = n < 0 || n === 0 && 1 / n < 0 ? 1 : 0;
    for (n = Math.abs(n), isNaN(n) || n === 1 / 0 ? (c = isNaN(n) ? 1 : 0, a = y) : (a = Math.floor(Math.log(n) / Math.LN2), n * (p = Math.pow(2, -a)) < 1 && (a--, p *= 2), a + w >= 1 ? n += u / p : n += u * Math.pow(2, 1 - w), n * p >= 2 && (a++, p /= 2), a + w >= y ? (c = 0, a = y) : a + w >= 1 ? (c = (n * p - 1) * Math.pow(2, r), a = a + w) : (c = n * Math.pow(2, w - 1) * Math.pow(2, r), a = 0)); r >= 8; i[t + f] = c & 255, f += g, c /= 256, r -= 8)
      ;
    for (a = a << r | c, d += r; d > 0; i[t + f] = a & 255, f += g, a /= 256, d -= 8)
      ;
    i[t + f - g] |= x * 128;
  }), j;
}
var W, rn;
function Jn() {
  if (rn) return W;
  rn = 1, W = n;
  var i = Wn();
  function n(e) {
    this.buf = ArrayBuffer.isView && ArrayBuffer.isView(e) ? e : new Uint8Array(e || 0), this.pos = 0, this.type = 0, this.length = this.buf.length;
  }
  n.Varint = 0, n.Fixed64 = 1, n.Bytes = 2, n.Fixed32 = 5;
  var t = 65536 * 65536, o = 1 / t, r = 12, l = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8");
  n.prototype = {
    destroy: function() {
      this.buf = null;
    },
    // === READING =================================================================
    readFields: function(e, s, h) {
      for (h = h || this.length; this.pos < h; ) {
        var v = this.readVarint(), m = v >> 3, E = this.pos;
        this.type = v & 7, e(m, s, this), this.pos === E && this.skip(v);
      }
      return s;
    },
    readMessage: function(e, s) {
      return this.readFields(e, s, this.readVarint() + this.pos);
    },
    readFixed32: function() {
      var e = S(this.buf, this.pos);
      return this.pos += 4, e;
    },
    readSFixed32: function() {
      var e = L(this.buf, this.pos);
      return this.pos += 4, e;
    },
    // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
    readFixed64: function() {
      var e = S(this.buf, this.pos) + S(this.buf, this.pos + 4) * t;
      return this.pos += 8, e;
    },
    readSFixed64: function() {
      var e = S(this.buf, this.pos) + L(this.buf, this.pos + 4) * t;
      return this.pos += 8, e;
    },
    readFloat: function() {
      var e = i.read(this.buf, this.pos, !0, 23, 4);
      return this.pos += 4, e;
    },
    readDouble: function() {
      var e = i.read(this.buf, this.pos, !0, 52, 8);
      return this.pos += 8, e;
    },
    readVarint: function(e) {
      var s = this.buf, h, v;
      return v = s[this.pos++], h = v & 127, v < 128 || (v = s[this.pos++], h |= (v & 127) << 7, v < 128) || (v = s[this.pos++], h |= (v & 127) << 14, v < 128) || (v = s[this.pos++], h |= (v & 127) << 21, v < 128) ? h : (v = s[this.pos], h |= (v & 15) << 28, a(h, e, this));
    },
    readVarint64: function() {
      return this.readVarint(!0);
    },
    readSVarint: function() {
      var e = this.readVarint();
      return e % 2 === 1 ? (e + 1) / -2 : e / 2;
    },
    readBoolean: function() {
      return !!this.readVarint();
    },
    readString: function() {
      var e = this.readVarint() + this.pos, s = this.pos;
      return this.pos = e, e - s >= r && l ? wn(this.buf, s, e) : A(this.buf, s, e);
    },
    readBytes: function() {
      var e = this.readVarint() + this.pos, s = this.buf.subarray(this.pos, e);
      return this.pos = e, s;
    },
    // verbose for performance reasons; doesn't affect gzipped size
    readPackedVarint: function(e, s) {
      if (this.type !== n.Bytes) return e.push(this.readVarint(s));
      var h = c(this);
      for (e = e || []; this.pos < h; ) e.push(this.readVarint(s));
      return e;
    },
    readPackedSVarint: function(e) {
      if (this.type !== n.Bytes) return e.push(this.readSVarint());
      var s = c(this);
      for (e = e || []; this.pos < s; ) e.push(this.readSVarint());
      return e;
    },
    readPackedBoolean: function(e) {
      if (this.type !== n.Bytes) return e.push(this.readBoolean());
      var s = c(this);
      for (e = e || []; this.pos < s; ) e.push(this.readBoolean());
      return e;
    },
    readPackedFloat: function(e) {
      if (this.type !== n.Bytes) return e.push(this.readFloat());
      var s = c(this);
      for (e = e || []; this.pos < s; ) e.push(this.readFloat());
      return e;
    },
    readPackedDouble: function(e) {
      if (this.type !== n.Bytes) return e.push(this.readDouble());
      var s = c(this);
      for (e = e || []; this.pos < s; ) e.push(this.readDouble());
      return e;
    },
    readPackedFixed32: function(e) {
      if (this.type !== n.Bytes) return e.push(this.readFixed32());
      var s = c(this);
      for (e = e || []; this.pos < s; ) e.push(this.readFixed32());
      return e;
    },
    readPackedSFixed32: function(e) {
      if (this.type !== n.Bytes) return e.push(this.readSFixed32());
      var s = c(this);
      for (e = e || []; this.pos < s; ) e.push(this.readSFixed32());
      return e;
    },
    readPackedFixed64: function(e) {
      if (this.type !== n.Bytes) return e.push(this.readFixed64());
      var s = c(this);
      for (e = e || []; this.pos < s; ) e.push(this.readFixed64());
      return e;
    },
    readPackedSFixed64: function(e) {
      if (this.type !== n.Bytes) return e.push(this.readSFixed64());
      var s = c(this);
      for (e = e || []; this.pos < s; ) e.push(this.readSFixed64());
      return e;
    },
    skip: function(e) {
      var s = e & 7;
      if (s === n.Varint) for (; this.buf[this.pos++] > 127; )
        ;
      else if (s === n.Bytes) this.pos = this.readVarint() + this.pos;
      else if (s === n.Fixed32) this.pos += 4;
      else if (s === n.Fixed64) this.pos += 8;
      else throw new Error("Unimplemented type: " + s);
    },
    // === WRITING =================================================================
    writeTag: function(e, s) {
      this.writeVarint(e << 3 | s);
    },
    realloc: function(e) {
      for (var s = this.length || 16; s < this.pos + e; ) s *= 2;
      if (s !== this.length) {
        var h = new Uint8Array(s);
        h.set(this.buf), this.buf = h, this.length = s;
      }
    },
    finish: function() {
      return this.length = this.pos, this.pos = 0, this.buf.subarray(0, this.length);
    },
    writeFixed32: function(e) {
      this.realloc(4), P(this.buf, e, this.pos), this.pos += 4;
    },
    writeSFixed32: function(e) {
      this.realloc(4), P(this.buf, e, this.pos), this.pos += 4;
    },
    writeFixed64: function(e) {
      this.realloc(8), P(this.buf, e & -1, this.pos), P(this.buf, Math.floor(e * o), this.pos + 4), this.pos += 8;
    },
    writeSFixed64: function(e) {
      this.realloc(8), P(this.buf, e & -1, this.pos), P(this.buf, Math.floor(e * o), this.pos + 4), this.pos += 8;
    },
    writeVarint: function(e) {
      if (e = +e || 0, e > 268435455 || e < 0) {
        d(e, this);
        return;
      }
      this.realloc(4), this.buf[this.pos++] = e & 127 | (e > 127 ? 128 : 0), !(e <= 127) && (this.buf[this.pos++] = (e >>>= 7) & 127 | (e > 127 ? 128 : 0), !(e <= 127) && (this.buf[this.pos++] = (e >>>= 7) & 127 | (e > 127 ? 128 : 0), !(e <= 127) && (this.buf[this.pos++] = e >>> 7 & 127)));
    },
    writeSVarint: function(e) {
      this.writeVarint(e < 0 ? -e * 2 - 1 : e * 2);
    },
    writeBoolean: function(e) {
      this.writeVarint(!!e);
    },
    writeString: function(e) {
      e = String(e), this.realloc(e.length * 4), this.pos++;
      var s = this.pos;
      this.pos = mn(this.buf, e, this.pos);
      var h = this.pos - s;
      h >= 128 && u(s, h, this), this.pos = s - 1, this.writeVarint(h), this.pos += h;
    },
    writeFloat: function(e) {
      this.realloc(4), i.write(this.buf, e, this.pos, !0, 23, 4), this.pos += 4;
    },
    writeDouble: function(e) {
      this.realloc(8), i.write(this.buf, e, this.pos, !0, 52, 8), this.pos += 8;
    },
    writeBytes: function(e) {
      var s = e.length;
      this.writeVarint(s), this.realloc(s);
      for (var h = 0; h < s; h++) this.buf[this.pos++] = e[h];
    },
    writeRawMessage: function(e, s) {
      this.pos++;
      var h = this.pos;
      e(s, this);
      var v = this.pos - h;
      v >= 128 && u(h, v, this), this.pos = h - 1, this.writeVarint(v), this.pos += v;
    },
    writeMessage: function(e, s, h) {
      this.writeTag(e, n.Bytes), this.writeRawMessage(s, h);
    },
    writePackedVarint: function(e, s) {
      s.length && this.writeMessage(e, f, s);
    },
    writePackedSVarint: function(e, s) {
      s.length && this.writeMessage(e, g, s);
    },
    writePackedBoolean: function(e, s) {
      s.length && this.writeMessage(e, M, s);
    },
    writePackedFloat: function(e, s) {
      s.length && this.writeMessage(e, x, s);
    },
    writePackedDouble: function(e, s) {
      s.length && this.writeMessage(e, F, s);
    },
    writePackedFixed32: function(e, s) {
      s.length && this.writeMessage(e, T, s);
    },
    writePackedSFixed32: function(e, s) {
      s.length && this.writeMessage(e, b, s);
    },
    writePackedFixed64: function(e, s) {
      s.length && this.writeMessage(e, _, s);
    },
    writePackedSFixed64: function(e, s) {
      s.length && this.writeMessage(e, V, s);
    },
    writeBytesField: function(e, s) {
      this.writeTag(e, n.Bytes), this.writeBytes(s);
    },
    writeFixed32Field: function(e, s) {
      this.writeTag(e, n.Fixed32), this.writeFixed32(s);
    },
    writeSFixed32Field: function(e, s) {
      this.writeTag(e, n.Fixed32), this.writeSFixed32(s);
    },
    writeFixed64Field: function(e, s) {
      this.writeTag(e, n.Fixed64), this.writeFixed64(s);
    },
    writeSFixed64Field: function(e, s) {
      this.writeTag(e, n.Fixed64), this.writeSFixed64(s);
    },
    writeVarintField: function(e, s) {
      this.writeTag(e, n.Varint), this.writeVarint(s);
    },
    writeSVarintField: function(e, s) {
      this.writeTag(e, n.Varint), this.writeSVarint(s);
    },
    writeStringField: function(e, s) {
      this.writeTag(e, n.Bytes), this.writeString(s);
    },
    writeFloatField: function(e, s) {
      this.writeTag(e, n.Fixed32), this.writeFloat(s);
    },
    writeDoubleField: function(e, s) {
      this.writeTag(e, n.Fixed64), this.writeDouble(s);
    },
    writeBooleanField: function(e, s) {
      this.writeVarintField(e, !!s);
    }
  };
  function a(e, s, h) {
    var v = h.buf, m, E;
    if (E = v[h.pos++], m = (E & 112) >> 4, E < 128 || (E = v[h.pos++], m |= (E & 127) << 3, E < 128) || (E = v[h.pos++], m |= (E & 127) << 10, E < 128) || (E = v[h.pos++], m |= (E & 127) << 17, E < 128) || (E = v[h.pos++], m |= (E & 127) << 24, E < 128) || (E = v[h.pos++], m |= (E & 1) << 31, E < 128)) return p(e, m, s);
    throw new Error("Expected varint not more than 10 bytes");
  }
  function c(e) {
    return e.type === n.Bytes ? e.readVarint() + e.pos : e.pos + 1;
  }
  function p(e, s, h) {
    return h ? s * 4294967296 + (e >>> 0) : (s >>> 0) * 4294967296 + (e >>> 0);
  }
  function d(e, s) {
    var h, v;
    if (e >= 0 ? (h = e % 4294967296 | 0, v = e / 4294967296 | 0) : (h = ~(-e % 4294967296), v = ~(-e / 4294967296), h ^ 4294967295 ? h = h + 1 | 0 : (h = 0, v = v + 1 | 0)), e >= 18446744073709552e3 || e < -18446744073709552e3)
      throw new Error("Given varint doesn't fit into 10 bytes");
    s.realloc(10), y(h, v, s), w(v, s);
  }
  function y(e, s, h) {
    h.buf[h.pos++] = e & 127 | 128, e >>>= 7, h.buf[h.pos++] = e & 127 | 128, e >>>= 7, h.buf[h.pos++] = e & 127 | 128, e >>>= 7, h.buf[h.pos++] = e & 127 | 128, e >>>= 7, h.buf[h.pos] = e & 127;
  }
  function w(e, s) {
    var h = (e & 7) << 4;
    s.buf[s.pos++] |= h | ((e >>>= 3) ? 128 : 0), e && (s.buf[s.pos++] = e & 127 | ((e >>>= 7) ? 128 : 0), e && (s.buf[s.pos++] = e & 127 | ((e >>>= 7) ? 128 : 0), e && (s.buf[s.pos++] = e & 127 | ((e >>>= 7) ? 128 : 0), e && (s.buf[s.pos++] = e & 127 | ((e >>>= 7) ? 128 : 0), e && (s.buf[s.pos++] = e & 127)))));
  }
  function u(e, s, h) {
    var v = s <= 16383 ? 1 : s <= 2097151 ? 2 : s <= 268435455 ? 3 : Math.floor(Math.log(s) / (Math.LN2 * 7));
    h.realloc(v);
    for (var m = h.pos - 1; m >= e; m--) h.buf[m + v] = h.buf[m];
  }
  function f(e, s) {
    for (var h = 0; h < e.length; h++) s.writeVarint(e[h]);
  }
  function g(e, s) {
    for (var h = 0; h < e.length; h++) s.writeSVarint(e[h]);
  }
  function x(e, s) {
    for (var h = 0; h < e.length; h++) s.writeFloat(e[h]);
  }
  function F(e, s) {
    for (var h = 0; h < e.length; h++) s.writeDouble(e[h]);
  }
  function M(e, s) {
    for (var h = 0; h < e.length; h++) s.writeBoolean(e[h]);
  }
  function T(e, s) {
    for (var h = 0; h < e.length; h++) s.writeFixed32(e[h]);
  }
  function b(e, s) {
    for (var h = 0; h < e.length; h++) s.writeSFixed32(e[h]);
  }
  function _(e, s) {
    for (var h = 0; h < e.length; h++) s.writeFixed64(e[h]);
  }
  function V(e, s) {
    for (var h = 0; h < e.length; h++) s.writeSFixed64(e[h]);
  }
  function S(e, s) {
    return (e[s] | e[s + 1] << 8 | e[s + 2] << 16) + e[s + 3] * 16777216;
  }
  function P(e, s, h) {
    e[h] = s, e[h + 1] = s >>> 8, e[h + 2] = s >>> 16, e[h + 3] = s >>> 24;
  }
  function L(e, s) {
    return (e[s] | e[s + 1] << 8 | e[s + 2] << 16) + (e[s + 3] << 24);
  }
  function A(e, s, h) {
    for (var v = "", m = s; m < h; ) {
      var E = e[m], k = null, O = E > 239 ? 4 : E > 223 ? 3 : E > 191 ? 2 : 1;
      if (m + O > h) break;
      var B, C, $;
      O === 1 ? E < 128 && (k = E) : O === 2 ? (B = e[m + 1], (B & 192) === 128 && (k = (E & 31) << 6 | B & 63, k <= 127 && (k = null))) : O === 3 ? (B = e[m + 1], C = e[m + 2], (B & 192) === 128 && (C & 192) === 128 && (k = (E & 15) << 12 | (B & 63) << 6 | C & 63, (k <= 2047 || k >= 55296 && k <= 57343) && (k = null))) : O === 4 && (B = e[m + 1], C = e[m + 2], $ = e[m + 3], (B & 192) === 128 && (C & 192) === 128 && ($ & 192) === 128 && (k = (E & 15) << 18 | (B & 63) << 12 | (C & 63) << 6 | $ & 63, (k <= 65535 || k >= 1114112) && (k = null))), k === null ? (k = 65533, O = 1) : k > 65535 && (k -= 65536, v += String.fromCharCode(k >>> 10 & 1023 | 55296), k = 56320 | k & 1023), v += String.fromCharCode(k), m += O;
    }
    return v;
  }
  function wn(e, s, h) {
    return l.decode(e.subarray(s, h));
  }
  function mn(e, s, h) {
    for (var v = 0, m, E; v < s.length; v++) {
      if (m = s.charCodeAt(v), m > 55295 && m < 57344)
        if (E)
          if (m < 56320) {
            e[h++] = 239, e[h++] = 191, e[h++] = 189, E = m;
            continue;
          } else
            m = E - 55296 << 10 | m - 56320 | 65536, E = null;
        else {
          m > 56319 || v + 1 === s.length ? (e[h++] = 239, e[h++] = 191, e[h++] = 189) : E = m;
          continue;
        }
      else E && (e[h++] = 239, e[h++] = 191, e[h++] = 189, E = null);
      m < 128 ? e[h++] = m : (m < 2048 ? e[h++] = m >> 6 | 192 : (m < 65536 ? e[h++] = m >> 12 | 224 : (e[h++] = m >> 18 | 240, e[h++] = m >> 12 & 63 | 128), e[h++] = m >> 6 & 63 | 128), e[h++] = m & 63 | 128);
    }
    return h;
  }
  return W;
}
var J, sn;
function dn() {
  if (sn) return J;
  sn = 1, J = i;
  function i(n, t) {
    this.x = n, this.y = t;
  }
  return i.prototype = {
    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function() {
      return new i(this.x, this.y);
    },
    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add: function(n) {
      return this.clone()._add(n);
    },
    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub: function(n) {
      return this.clone()._sub(n);
    },
    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint: function(n) {
      return this.clone()._multByPoint(n);
    },
    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint: function(n) {
      return this.clone()._divByPoint(n);
    },
    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult: function(n) {
      return this.clone()._mult(n);
    },
    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div: function(n) {
      return this.clone()._div(n);
    },
    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate: function(n) {
      return this.clone()._rotate(n);
    },
    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround: function(n, t) {
      return this.clone()._rotateAround(n, t);
    },
    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function(n) {
      return this.clone()._matMult(n);
    },
    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit: function() {
      return this.clone()._unit();
    },
    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp: function() {
      return this.clone()._perp();
    },
    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round: function() {
      return this.clone()._round();
    },
    /**
     * Return the magitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag: function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals: function(n) {
      return this.x === n.x && this.y === n.y;
    },
    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function(n) {
      return Math.sqrt(this.distSqr(n));
    },
    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function(n) {
      var t = n.x - this.x, o = n.y - this.y;
      return t * t + o * o;
    },
    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle: function() {
      return Math.atan2(this.y, this.x);
    },
    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo: function(n) {
      return Math.atan2(this.y - n.y, this.x - n.x);
    },
    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function(n) {
      return this.angleWithSep(n.x, n.y);
    },
    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function(n, t) {
      return Math.atan2(
        this.x * t - this.y * n,
        this.x * n + this.y * t
      );
    },
    _matMult: function(n) {
      var t = n[0] * this.x + n[1] * this.y, o = n[2] * this.x + n[3] * this.y;
      return this.x = t, this.y = o, this;
    },
    _add: function(n) {
      return this.x += n.x, this.y += n.y, this;
    },
    _sub: function(n) {
      return this.x -= n.x, this.y -= n.y, this;
    },
    _mult: function(n) {
      return this.x *= n, this.y *= n, this;
    },
    _div: function(n) {
      return this.x /= n, this.y /= n, this;
    },
    _multByPoint: function(n) {
      return this.x *= n.x, this.y *= n.y, this;
    },
    _divByPoint: function(n) {
      return this.x /= n.x, this.y /= n.y, this;
    },
    _unit: function() {
      return this._div(this.mag()), this;
    },
    _perp: function() {
      var n = this.y;
      return this.y = this.x, this.x = -n, this;
    },
    _rotate: function(n) {
      var t = Math.cos(n), o = Math.sin(n), r = t * this.x - o * this.y, l = o * this.x + t * this.y;
      return this.x = r, this.y = l, this;
    },
    _rotateAround: function(n, t) {
      var o = Math.cos(n), r = Math.sin(n), l = t.x + o * (this.x - t.x) - r * (this.y - t.y), a = t.y + r * (this.x - t.x) + o * (this.y - t.y);
      return this.x = l, this.y = a, this;
    },
    _round: function() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
    }
  }, i.convert = function(n) {
    return n instanceof i ? n : Array.isArray(n) ? new i(n[0], n[1]) : n;
  }, J;
}
var G = {}, H, on;
function gn() {
  if (on) return H;
  on = 1;
  var i = dn();
  H = n;
  function n(a, c, p, d, y) {
    this.properties = {}, this.extent = p, this.type = 0, this._pbf = a, this._geometry = -1, this._keys = d, this._values = y, a.readFields(t, this, c);
  }
  function t(a, c, p) {
    a == 1 ? c.id = p.readVarint() : a == 2 ? o(p, c) : a == 3 ? c.type = p.readVarint() : a == 4 && (c._geometry = p.pos);
  }
  function o(a, c) {
    for (var p = a.readVarint() + a.pos; a.pos < p; ) {
      var d = c._keys[a.readVarint()], y = c._values[a.readVarint()];
      c.properties[d] = y;
    }
  }
  n.types = ["Unknown", "Point", "LineString", "Polygon"], n.prototype.loadGeometry = function() {
    var a = this._pbf;
    a.pos = this._geometry;
    for (var c = a.readVarint() + a.pos, p = 1, d = 0, y = 0, w = 0, u = [], f; a.pos < c; ) {
      if (d <= 0) {
        var g = a.readVarint();
        p = g & 7, d = g >> 3;
      }
      if (d--, p === 1 || p === 2)
        y += a.readSVarint(), w += a.readSVarint(), p === 1 && (f && u.push(f), f = []), f.push(new i(y, w));
      else if (p === 7)
        f && f.push(f[0].clone());
      else
        throw new Error("unknown command " + p);
    }
    return f && u.push(f), u;
  }, n.prototype.bbox = function() {
    var a = this._pbf;
    a.pos = this._geometry;
    for (var c = a.readVarint() + a.pos, p = 1, d = 0, y = 0, w = 0, u = 1 / 0, f = -1 / 0, g = 1 / 0, x = -1 / 0; a.pos < c; ) {
      if (d <= 0) {
        var F = a.readVarint();
        p = F & 7, d = F >> 3;
      }
      if (d--, p === 1 || p === 2)
        y += a.readSVarint(), w += a.readSVarint(), y < u && (u = y), y > f && (f = y), w < g && (g = w), w > x && (x = w);
      else if (p !== 7)
        throw new Error("unknown command " + p);
    }
    return [u, g, f, x];
  }, n.prototype.toGeoJSON = function(a, c, p) {
    var d = this.extent * Math.pow(2, p), y = this.extent * a, w = this.extent * c, u = this.loadGeometry(), f = n.types[this.type], g, x;
    function F(b) {
      for (var _ = 0; _ < b.length; _++) {
        var V = b[_], S = 180 - (V.y + w) * 360 / d;
        b[_] = [
          (V.x + y) * 360 / d - 180,
          360 / Math.PI * Math.atan(Math.exp(S * Math.PI / 180)) - 90
        ];
      }
    }
    switch (this.type) {
      case 1:
        var M = [];
        for (g = 0; g < u.length; g++)
          M[g] = u[g][0];
        u = M, F(u);
        break;
      case 2:
        for (g = 0; g < u.length; g++)
          F(u[g]);
        break;
      case 3:
        for (u = r(u), g = 0; g < u.length; g++)
          for (x = 0; x < u[g].length; x++)
            F(u[g][x]);
        break;
    }
    u.length === 1 ? u = u[0] : f = "Multi" + f;
    var T = {
      type: "Feature",
      geometry: {
        type: f,
        coordinates: u
      },
      properties: this.properties
    };
    return "id" in this && (T.id = this.id), T;
  };
  function r(a) {
    var c = a.length;
    if (c <= 1) return [a];
    for (var p = [], d, y, w = 0; w < c; w++) {
      var u = l(a[w]);
      u !== 0 && (y === void 0 && (y = u < 0), y === u < 0 ? (d && p.push(d), d = [a[w]]) : d.push(a[w]));
    }
    return d && p.push(d), p;
  }
  function l(a) {
    for (var c = 0, p = 0, d = a.length, y = d - 1, w, u; p < d; y = p++)
      w = a[p], u = a[y], c += (u.x - w.x) * (w.y + u.y);
    return c;
  }
  return H;
}
var X, an;
function yn() {
  if (an) return X;
  an = 1;
  var i = gn();
  X = n;
  function n(r, l) {
    this.version = 1, this.name = null, this.extent = 4096, this.length = 0, this._pbf = r, this._keys = [], this._values = [], this._features = [], r.readFields(t, this, l), this.length = this._features.length;
  }
  function t(r, l, a) {
    r === 15 ? l.version = a.readVarint() : r === 1 ? l.name = a.readString() : r === 5 ? l.extent = a.readVarint() : r === 2 ? l._features.push(a.pos) : r === 3 ? l._keys.push(a.readString()) : r === 4 && l._values.push(o(a));
  }
  function o(r) {
    for (var l = null, a = r.readVarint() + r.pos; r.pos < a; ) {
      var c = r.readVarint() >> 3;
      l = c === 1 ? r.readString() : c === 2 ? r.readFloat() : c === 3 ? r.readDouble() : c === 4 ? r.readVarint64() : c === 5 ? r.readVarint() : c === 6 ? r.readSVarint() : c === 7 ? r.readBoolean() : null;
    }
    return l;
  }
  return n.prototype.feature = function(r) {
    if (r < 0 || r >= this._features.length) throw new Error("feature index out of bounds");
    this._pbf.pos = this._features[r];
    var l = this._pbf.readVarint() + this._pbf.pos;
    return new i(this._pbf, l, this.extent, this._keys, this._values);
  }, X;
}
var Y, ln;
function Hn() {
  if (ln) return Y;
  ln = 1;
  var i = yn();
  Y = n;
  function n(o, r) {
    this.layers = o.readFields(t, {}, r);
  }
  function t(o, r, l) {
    if (o === 3) {
      var a = new i(l, l.readVarint() + l.pos);
      a.length && (r[a.name] = a);
    }
  }
  return Y;
}
var hn;
function Xn() {
  return hn || (hn = 1, G.VectorTile = Hn(), G.VectorTileFeature = gn(), G.VectorTileLayer = yn()), G;
}
var Z, un;
function Yn() {
  if (un) return Z;
  un = 1;
  var i = dn(), n = Xn().VectorTileFeature;
  Z = t;
  function t(r, l) {
    this.options = l || {}, this.features = r, this.length = r.length;
  }
  t.prototype.feature = function(r) {
    return new o(this.features[r], this.options.extent);
  };
  function o(r, l) {
    this.id = typeof r.id == "number" ? r.id : void 0, this.type = r.type, this.rawGeometry = r.type === 1 ? [r.geometry] : r.geometry, this.properties = r.tags, this.extent = l || 4096;
  }
  return o.prototype.loadGeometry = function() {
    var r = this.rawGeometry;
    this.geometry = [];
    for (var l = 0; l < r.length; l++) {
      for (var a = r[l], c = [], p = 0; p < a.length; p++)
        c.push(new i(a[p][0], a[p][1]));
      this.geometry.push(c);
    }
    return this.geometry;
  }, o.prototype.bbox = function() {
    this.geometry || this.loadGeometry();
    for (var r = this.geometry, l = 1 / 0, a = -1 / 0, c = 1 / 0, p = -1 / 0, d = 0; d < r.length; d++)
      for (var y = r[d], w = 0; w < y.length; w++) {
        var u = y[w];
        l = Math.min(l, u.x), a = Math.max(a, u.x), c = Math.min(c, u.y), p = Math.max(p, u.y);
      }
    return [l, c, a, p];
  }, o.prototype.toGeoJSON = n.prototype.toGeoJSON, Z;
}
var fn;
function Zn() {
  if (fn) return N.exports;
  fn = 1;
  var i = Jn(), n = Yn();
  N.exports = t, N.exports.fromVectorTileJs = t, N.exports.fromGeojsonVt = o, N.exports.GeoJSONWrapper = n;
  function t(u) {
    var f = new i();
    return r(u, f), f.finish();
  }
  function o(u, f) {
    f = f || {};
    var g = {};
    for (var x in u)
      g[x] = new n(u[x].features, f), g[x].name = x, g[x].version = f.version, g[x].extent = f.extent;
    return t({ layers: g });
  }
  function r(u, f) {
    for (var g in u.layers)
      f.writeMessage(3, l, u.layers[g]);
  }
  function l(u, f) {
    f.writeVarintField(15, u.version || 1), f.writeStringField(1, u.name || ""), f.writeVarintField(5, u.extent || 4096);
    var g, x = {
      keys: [],
      values: [],
      keycache: {},
      valuecache: {}
    };
    for (g = 0; g < u.length; g++)
      x.feature = u.feature(g), f.writeMessage(2, a, x);
    var F = x.keys;
    for (g = 0; g < F.length; g++)
      f.writeStringField(3, F[g]);
    var M = x.values;
    for (g = 0; g < M.length; g++)
      f.writeMessage(4, w, M[g]);
  }
  function a(u, f) {
    var g = u.feature;
    g.id !== void 0 && f.writeVarintField(1, g.id), f.writeMessage(2, c, u), f.writeVarintField(3, g.type), f.writeMessage(4, y, g);
  }
  function c(u, f) {
    var g = u.feature, x = u.keys, F = u.values, M = u.keycache, T = u.valuecache;
    for (var b in g.properties) {
      var _ = g.properties[b], V = M[b];
      if (_ !== null) {
        typeof V > "u" && (x.push(b), V = x.length - 1, M[b] = V), f.writeVarint(V);
        var S = typeof _;
        S !== "string" && S !== "boolean" && S !== "number" && (_ = JSON.stringify(_));
        var P = S + ":" + _, L = T[P];
        typeof L > "u" && (F.push(_), L = F.length - 1, T[P] = L), f.writeVarint(L);
      }
    }
  }
  function p(u, f) {
    return (f << 3) + (u & 7);
  }
  function d(u) {
    return u << 1 ^ u >> 31;
  }
  function y(u, f) {
    for (var g = u.loadGeometry(), x = u.type, F = 0, M = 0, T = g.length, b = 0; b < T; b++) {
      var _ = g[b], V = 1;
      x === 1 && (V = _.length), f.writeVarint(p(1, V));
      for (var S = x === 3 ? _.length - 1 : _.length, P = 0; P < S; P++) {
        P === 1 && x !== 1 && f.writeVarint(p(2, S - 1));
        var L = _[P].x - F, A = _[P].y - M;
        f.writeVarint(d(L)), f.writeVarint(d(A)), F += L, M += A;
      }
      x === 3 && f.writeVarint(p(7, 1));
    }
  }
  function w(u, f) {
    var g = typeof u;
    g === "string" ? f.writeStringField(1, u) : g === "boolean" ? f.writeBooleanField(7, u) : g === "number" && (u % 1 !== 0 ? f.writeDoubleField(3, u) : u < 0 ? f.writeSVarintField(6, u) : f.writeVarintField(5, u));
  }
  return N.exports;
}
var Qn = Zn();
const nt = /* @__PURE__ */ Kn(Qn), xn = `var ut = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, Oe = Math.ceil, W = Math.floor, J = "[BigNumber Error] ", De = J + "Number primitive has more than 15 significant digits: ", j = 1e14, C = 14, Ae = 9007199254740991, Re = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], oe = 1e7, K = 1e9;
function je(n) {
  var e, t, r, i = v.prototype = { constructor: v, toString: null, valueOf: null }, l = new v(1), u = 20, c = 4, d = -7, a = 21, P = -1e7, S = 1e7, M = !1, L = 1, O = 0, T = {
    prefix: "",
    groupSize: 3,
    secondaryGroupSize: 0,
    groupSeparator: ",",
    decimalSeparator: ".",
    fractionGroupSize: 0,
    fractionGroupSeparator: " ",
    // non-breaking space
    suffix: ""
  }, k = "0123456789abcdefghijklmnopqrstuvwxyz", N = !0;
  function v(s, o) {
    var f, x, p, y, E, h, g, w, m = this;
    if (!(m instanceof v)) return new v(s, o);
    if (o == null) {
      if (s && s._isBigNumber === !0) {
        m.s = s.s, !s.c || s.e > S ? m.c = m.e = null : s.e < P ? m.c = [m.e = 0] : (m.e = s.e, m.c = s.c.slice());
        return;
      }
      if ((h = typeof s == "number") && s * 0 == 0) {
        if (m.s = 1 / s < 0 ? (s = -s, -1) : 1, s === ~~s) {
          for (y = 0, E = s; E >= 10; E /= 10, y++) ;
          y > S ? m.c = m.e = null : (m.e = y, m.c = [s]);
          return;
        }
        w = String(s);
      } else {
        if (!ut.test(w = String(s))) return r(m, w, h);
        m.s = w.charCodeAt(0) == 45 ? (w = w.slice(1), -1) : 1;
      }
      (y = w.indexOf(".")) > -1 && (w = w.replace(".", "")), (E = w.search(/e/i)) > 0 ? (y < 0 && (y = E), y += +w.slice(E + 1), w = w.substring(0, E)) : y < 0 && (y = w.length);
    } else {
      if (D(o, 2, k.length, "Base"), o == 10 && N)
        return m = new v(s), G(m, u + m.e + 1, c);
      if (w = String(s), h = typeof s == "number") {
        if (s * 0 != 0) return r(m, w, h, o);
        if (m.s = 1 / s < 0 ? (w = w.slice(1), -1) : 1, v.DEBUG && w.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(De + s);
      } else
        m.s = w.charCodeAt(0) === 45 ? (w = w.slice(1), -1) : 1;
      for (f = k.slice(0, o), y = E = 0, g = w.length; E < g; E++)
        if (f.indexOf(x = w.charAt(E)) < 0) {
          if (x == ".") {
            if (E > y) {
              y = g;
              continue;
            }
          } else if (!p && (w == w.toUpperCase() && (w = w.toLowerCase()) || w == w.toLowerCase() && (w = w.toUpperCase()))) {
            p = !0, E = -1, y = 0;
            continue;
          }
          return r(m, String(s), h, o);
        }
      h = !1, w = t(w, o, 10, m.s), (y = w.indexOf(".")) > -1 ? w = w.replace(".", "") : y = w.length;
    }
    for (E = 0; w.charCodeAt(E) === 48; E++) ;
    for (g = w.length; w.charCodeAt(--g) === 48; ) ;
    if (w = w.slice(E, ++g)) {
      if (g -= E, h && v.DEBUG && g > 15 && (s > Ae || s !== W(s)))
        throw Error(De + m.s * s);
      if ((y = y - E - 1) > S)
        m.c = m.e = null;
      else if (y < P)
        m.c = [m.e = 0];
      else {
        if (m.e = y, m.c = [], E = (y + 1) % C, y < 0 && (E += C), E < g) {
          for (E && m.c.push(+w.slice(0, E)), g -= C; E < g; )
            m.c.push(+w.slice(E, E += C));
          E = C - (w = w.slice(E)).length;
        } else
          E -= g;
        for (; E--; w += "0") ;
        m.c.push(+w);
      }
    } else
      m.c = [m.e = 0];
  }
  v.clone = je, v.ROUND_UP = 0, v.ROUND_DOWN = 1, v.ROUND_CEIL = 2, v.ROUND_FLOOR = 3, v.ROUND_HALF_UP = 4, v.ROUND_HALF_DOWN = 5, v.ROUND_HALF_EVEN = 6, v.ROUND_HALF_CEIL = 7, v.ROUND_HALF_FLOOR = 8, v.EUCLID = 9, v.config = v.set = function(s) {
    var o, f;
    if (s != null)
      if (typeof s == "object") {
        if (s.hasOwnProperty(o = "DECIMAL_PLACES") && (f = s[o], D(f, 0, K, o), u = f), s.hasOwnProperty(o = "ROUNDING_MODE") && (f = s[o], D(f, 0, 8, o), c = f), s.hasOwnProperty(o = "EXPONENTIAL_AT") && (f = s[o], f && f.pop ? (D(f[0], -K, 0, o), D(f[1], 0, K, o), d = f[0], a = f[1]) : (D(f, -K, K, o), d = -(a = f < 0 ? -f : f))), s.hasOwnProperty(o = "RANGE"))
          if (f = s[o], f && f.pop)
            D(f[0], -K, -1, o), D(f[1], 1, K, o), P = f[0], S = f[1];
          else if (D(f, -K, K, o), f)
            P = -(S = f < 0 ? -f : f);
          else
            throw Error(J + o + " cannot be zero: " + f);
        if (s.hasOwnProperty(o = "CRYPTO"))
          if (f = s[o], f === !!f)
            if (f)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                M = f;
              else
                throw M = !f, Error(J + "crypto unavailable");
            else
              M = f;
          else
            throw Error(J + o + " not true or false: " + f);
        if (s.hasOwnProperty(o = "MODULO_MODE") && (f = s[o], D(f, 0, 9, o), L = f), s.hasOwnProperty(o = "POW_PRECISION") && (f = s[o], D(f, 0, K, o), O = f), s.hasOwnProperty(o = "FORMAT"))
          if (f = s[o], typeof f == "object") T = f;
          else throw Error(J + o + " not an object: " + f);
        if (s.hasOwnProperty(o = "ALPHABET"))
          if (f = s[o], typeof f == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(f))
            N = f.slice(0, 10) == "0123456789", k = f;
          else
            throw Error(J + o + " invalid: " + f);
      } else
        throw Error(J + "Object expected: " + s);
    return {
      DECIMAL_PLACES: u,
      ROUNDING_MODE: c,
      EXPONENTIAL_AT: [d, a],
      RANGE: [P, S],
      CRYPTO: M,
      MODULO_MODE: L,
      POW_PRECISION: O,
      FORMAT: T,
      ALPHABET: k
    };
  }, v.isBigNumber = function(s) {
    if (!s || s._isBigNumber !== !0) return !1;
    if (!v.DEBUG) return !0;
    var o, f, x = s.c, p = s.e, y = s.s;
    e: if ({}.toString.call(x) == "[object Array]") {
      if ((y === 1 || y === -1) && p >= -K && p <= K && p === W(p)) {
        if (x[0] === 0) {
          if (p === 0 && x.length === 1) return !0;
          break e;
        }
        if (o = (p + 1) % C, o < 1 && (o += C), String(x[0]).length == o) {
          for (o = 0; o < x.length; o++)
            if (f = x[o], f < 0 || f >= j || f !== W(f)) break e;
          if (f !== 0) return !0;
        }
      }
    } else if (x === null && p === null && (y === null || y === 1 || y === -1))
      return !0;
    throw Error(J + "Invalid BigNumber: " + s);
  }, v.maximum = v.max = function() {
    return $(arguments, -1);
  }, v.minimum = v.min = function() {
    return $(arguments, 1);
  }, v.random = (function() {
    var s = 9007199254740992, o = Math.random() * s & 2097151 ? function() {
      return W(Math.random() * s);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(f) {
      var x, p, y, E, h, g = 0, w = [], m = new v(l);
      if (f == null ? f = u : D(f, 0, K), E = Oe(f / C), M)
        if (crypto.getRandomValues) {
          for (x = crypto.getRandomValues(new Uint32Array(E *= 2)); g < E; )
            h = x[g] * 131072 + (x[g + 1] >>> 11), h >= 9e15 ? (p = crypto.getRandomValues(new Uint32Array(2)), x[g] = p[0], x[g + 1] = p[1]) : (w.push(h % 1e14), g += 2);
          g = E / 2;
        } else if (crypto.randomBytes) {
          for (x = crypto.randomBytes(E *= 7); g < E; )
            h = (x[g] & 31) * 281474976710656 + x[g + 1] * 1099511627776 + x[g + 2] * 4294967296 + x[g + 3] * 16777216 + (x[g + 4] << 16) + (x[g + 5] << 8) + x[g + 6], h >= 9e15 ? crypto.randomBytes(7).copy(x, g) : (w.push(h % 1e14), g += 7);
          g = E / 7;
        } else
          throw M = !1, Error(J + "crypto unavailable");
      if (!M)
        for (; g < E; )
          h = o(), h < 9e15 && (w[g++] = h % 1e14);
      for (E = w[--g], f %= C, E && f && (h = Re[C - f], w[g] = W(E / h) * h); w[g] === 0; w.pop(), g--) ;
      if (g < 0)
        w = [y = 0];
      else {
        for (y = -1; w[0] === 0; w.splice(0, 1), y -= C) ;
        for (g = 1, h = w[0]; h >= 10; h /= 10, g++) ;
        g < C && (y -= C - g);
      }
      return m.e = y, m.c = w, m;
    };
  })(), v.sum = function() {
    for (var s = 1, o = arguments, f = new v(o[0]); s < o.length; ) f = f.plus(o[s++]);
    return f;
  }, t = /* @__PURE__ */ (function() {
    var s = "0123456789";
    function o(f, x, p, y) {
      for (var E, h = [0], g, w = 0, m = f.length; w < m; ) {
        for (g = h.length; g--; h[g] *= x) ;
        for (h[0] += y.indexOf(f.charAt(w++)), E = 0; E < h.length; E++)
          h[E] > p - 1 && (h[E + 1] == null && (h[E + 1] = 0), h[E + 1] += h[E] / p | 0, h[E] %= p);
      }
      return h.reverse();
    }
    return function(f, x, p, y, E) {
      var h, g, w, m, b, A, R, B, U = f.indexOf("."), V = u, I = c;
      for (U >= 0 && (m = O, O = 0, f = f.replace(".", ""), B = new v(x), A = B.pow(f.length - U), O = m, B.c = o(
        ie(Z(A.c), A.e, "0"),
        10,
        p,
        s
      ), B.e = B.c.length), R = o(f, x, p, E ? (h = k, s) : (h = s, k)), w = m = R.length; R[--m] == 0; R.pop()) ;
      if (!R[0]) return h.charAt(0);
      if (U < 0 ? --w : (A.c = R, A.e = w, A.s = y, A = e(A, B, V, I, p), R = A.c, b = A.r, w = A.e), g = w + V + 1, U = R[g], m = p / 2, b = b || g < 0 || R[g + 1] != null, b = I < 4 ? (U != null || b) && (I == 0 || I == (A.s < 0 ? 3 : 2)) : U > m || U == m && (I == 4 || b || I == 6 && R[g - 1] & 1 || I == (A.s < 0 ? 8 : 7)), g < 1 || !R[0])
        f = b ? ie(h.charAt(1), -V, h.charAt(0)) : h.charAt(0);
      else {
        if (R.length = g, b)
          for (--p; ++R[--g] > p; )
            R[g] = 0, g || (++w, R = [1].concat(R));
        for (m = R.length; !R[--m]; ) ;
        for (U = 0, f = ""; U <= m; f += h.charAt(R[U++])) ;
        f = ie(f, w, h.charAt(0));
      }
      return f;
    };
  })(), e = /* @__PURE__ */ (function() {
    function s(x, p, y) {
      var E, h, g, w, m = 0, b = x.length, A = p % oe, R = p / oe | 0;
      for (x = x.slice(); b--; )
        g = x[b] % oe, w = x[b] / oe | 0, E = R * g + w * A, h = A * g + E % oe * oe + m, m = (h / y | 0) + (E / oe | 0) + R * w, x[b] = h % y;
      return m && (x = [m].concat(x)), x;
    }
    function o(x, p, y, E) {
      var h, g;
      if (y != E)
        g = y > E ? 1 : -1;
      else
        for (h = g = 0; h < y; h++)
          if (x[h] != p[h]) {
            g = x[h] > p[h] ? 1 : -1;
            break;
          }
      return g;
    }
    function f(x, p, y, E) {
      for (var h = 0; y--; )
        x[y] -= h, h = x[y] < p[y] ? 1 : 0, x[y] = h * E + x[y] - p[y];
      for (; !x[0] && x.length > 1; x.splice(0, 1)) ;
    }
    return function(x, p, y, E, h) {
      var g, w, m, b, A, R, B, U, V, I, q, X, ye, Me, Te, ee, fe, H = x.s == p.s ? 1 : -1, Y = x.c, z = p.c;
      if (!Y || !Y[0] || !z || !z[0])
        return new v(
          // Return NaN if either NaN, or both Infinity or 0.
          !x.s || !p.s || (Y ? z && Y[0] == z[0] : !z) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            Y && Y[0] == 0 || !z ? H * 0 : H / 0
          )
        );
      for (U = new v(H), V = U.c = [], w = x.e - p.e, H = y + w + 1, h || (h = j, w = Q(x.e / C) - Q(p.e / C), H = H / C | 0), m = 0; z[m] == (Y[m] || 0); m++) ;
      if (z[m] > (Y[m] || 0) && w--, H < 0)
        V.push(1), b = !0;
      else {
        for (Me = Y.length, ee = z.length, m = 0, H += 2, A = W(h / (z[0] + 1)), A > 1 && (z = s(z, A, h), Y = s(Y, A, h), ee = z.length, Me = Y.length), ye = ee, I = Y.slice(0, ee), q = I.length; q < ee; I[q++] = 0) ;
        fe = z.slice(), fe = [0].concat(fe), Te = z[0], z[1] >= h / 2 && Te++;
        do {
          if (A = 0, g = o(z, I, ee, q), g < 0) {
            if (X = I[0], ee != q && (X = X * h + (I[1] || 0)), A = W(X / Te), A > 1)
              for (A >= h && (A = h - 1), R = s(z, A, h), B = R.length, q = I.length; o(R, I, B, q) == 1; )
                A--, f(R, ee < B ? fe : z, B, h), B = R.length, g = 1;
            else
              A == 0 && (g = A = 1), R = z.slice(), B = R.length;
            if (B < q && (R = [0].concat(R)), f(I, R, q, h), q = I.length, g == -1)
              for (; o(z, I, ee, q) < 1; )
                A++, f(I, ee < q ? fe : z, q, h), q = I.length;
          } else g === 0 && (A++, I = [0]);
          V[m++] = A, I[0] ? I[q++] = Y[ye] || 0 : (I = [Y[ye]], q = 1);
        } while ((ye++ < Me || I[0] != null) && H--);
        b = I[0] != null, V[0] || V.splice(0, 1);
      }
      if (h == j) {
        for (m = 1, H = V[0]; H >= 10; H /= 10, m++) ;
        G(U, y + (U.e = m + w * C - 1) + 1, E, b);
      } else
        U.e = w, U.r = +b;
      return U;
    };
  })();
  function _(s, o, f, x) {
    var p, y, E, h, g;
    if (f == null ? f = c : D(f, 0, 8), !s.c) return s.toString();
    if (p = s.c[0], E = s.e, o == null)
      g = Z(s.c), g = x == 1 || x == 2 && (E <= d || E >= a) ? me(g, E) : ie(g, E, "0");
    else if (s = G(new v(s), o, f), y = s.e, g = Z(s.c), h = g.length, x == 1 || x == 2 && (o <= y || y <= d)) {
      for (; h < o; g += "0", h++) ;
      g = me(g, y);
    } else if (o -= E + (x === 2 && y > E), g = ie(g, y, "0"), y + 1 > h) {
      if (--o > 0) for (g += "."; o--; g += "0") ;
    } else if (o += y - h, o > 0)
      for (y + 1 == h && (g += "."); o--; g += "0") ;
    return s.s < 0 && p ? "-" + g : g;
  }
  function $(s, o) {
    for (var f, x, p = 1, y = new v(s[0]); p < s.length; p++)
      x = new v(s[p]), (!x.s || (f = le(y, x)) === o || f === 0 && y.s === o) && (y = x);
    return y;
  }
  function re(s, o, f) {
    for (var x = 1, p = o.length; !o[--p]; o.pop()) ;
    for (p = o[0]; p >= 10; p /= 10, x++) ;
    return (f = x + f * C - 1) > S ? s.c = s.e = null : f < P ? s.c = [s.e = 0] : (s.e = f, s.c = o), s;
  }
  r = /* @__PURE__ */ (function() {
    var s = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, o = /^([^.]+)\\.$/, f = /^\\.([^.]+)$/, x = /^-?(Infinity|NaN)$/, p = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(y, E, h, g) {
      var w, m = h ? E : E.replace(p, "");
      if (x.test(m))
        y.s = isNaN(m) ? null : m < 0 ? -1 : 1;
      else {
        if (!h && (m = m.replace(s, function(b, A, R) {
          return w = (R = R.toLowerCase()) == "x" ? 16 : R == "b" ? 2 : 8, !g || g == w ? A : b;
        }), g && (w = g, m = m.replace(o, "$1").replace(f, "0.$1")), E != m))
          return new v(m, w);
        if (v.DEBUG)
          throw Error(J + "Not a" + (g ? " base " + g : "") + " number: " + E);
        y.s = null;
      }
      y.c = y.e = null;
    };
  })();
  function G(s, o, f, x) {
    var p, y, E, h, g, w, m, b = s.c, A = Re;
    if (b) {
      e: {
        for (p = 1, h = b[0]; h >= 10; h /= 10, p++) ;
        if (y = o - p, y < 0)
          y += C, E = o, g = b[w = 0], m = W(g / A[p - E - 1] % 10);
        else if (w = Oe((y + 1) / C), w >= b.length)
          if (x) {
            for (; b.length <= w; b.push(0)) ;
            g = m = 0, p = 1, y %= C, E = y - C + 1;
          } else
            break e;
        else {
          for (g = h = b[w], p = 1; h >= 10; h /= 10, p++) ;
          y %= C, E = y - C + p, m = E < 0 ? 0 : W(g / A[p - E - 1] % 10);
        }
        if (x = x || o < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        b[w + 1] != null || (E < 0 ? g : g % A[p - E - 1]), x = f < 4 ? (m || x) && (f == 0 || f == (s.s < 0 ? 3 : 2)) : m > 5 || m == 5 && (f == 4 || x || f == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (y > 0 ? E > 0 ? g / A[p - E] : 0 : b[w - 1]) % 10 & 1 || f == (s.s < 0 ? 8 : 7)), o < 1 || !b[0])
          return b.length = 0, x ? (o -= s.e + 1, b[0] = A[(C - o % C) % C], s.e = -o || 0) : b[0] = s.e = 0, s;
        if (y == 0 ? (b.length = w, h = 1, w--) : (b.length = w + 1, h = A[C - y], b[w] = E > 0 ? W(g / A[p - E] % A[E]) * h : 0), x)
          for (; ; )
            if (w == 0) {
              for (y = 1, E = b[0]; E >= 10; E /= 10, y++) ;
              for (E = b[0] += h, h = 1; E >= 10; E /= 10, h++) ;
              y != h && (s.e++, b[0] == j && (b[0] = 1));
              break;
            } else {
              if (b[w] += h, b[w] != j) break;
              b[w--] = 0, h = 1;
            }
        for (y = b.length; b[--y] === 0; b.pop()) ;
      }
      s.e > S ? s.c = s.e = null : s.e < P && (s.c = [s.e = 0]);
    }
    return s;
  }
  function F(s) {
    var o, f = s.e;
    return f === null ? s.toString() : (o = Z(s.c), o = f <= d || f >= a ? me(o, f) : ie(o, f, "0"), s.s < 0 ? "-" + o : o);
  }
  return i.absoluteValue = i.abs = function() {
    var s = new v(this);
    return s.s < 0 && (s.s = 1), s;
  }, i.comparedTo = function(s, o) {
    return le(this, new v(s, o));
  }, i.decimalPlaces = i.dp = function(s, o) {
    var f, x, p, y = this;
    if (s != null)
      return D(s, 0, K), o == null ? o = c : D(o, 0, 8), G(new v(y), s + y.e + 1, o);
    if (!(f = y.c)) return null;
    if (x = ((p = f.length - 1) - Q(this.e / C)) * C, p = f[p]) for (; p % 10 == 0; p /= 10, x--) ;
    return x < 0 && (x = 0), x;
  }, i.dividedBy = i.div = function(s, o) {
    return e(this, new v(s, o), u, c);
  }, i.dividedToIntegerBy = i.idiv = function(s, o) {
    return e(this, new v(s, o), 0, 1);
  }, i.exponentiatedBy = i.pow = function(s, o) {
    var f, x, p, y, E, h, g, w, m, b = this;
    if (s = new v(s), s.c && !s.isInteger())
      throw Error(J + "Exponent not an integer: " + F(s));
    if (o != null && (o = new v(o)), h = s.e > 14, !b.c || !b.c[0] || b.c[0] == 1 && !b.e && b.c.length == 1 || !s.c || !s.c[0])
      return m = new v(Math.pow(+F(b), h ? s.s * (2 - de(s)) : +F(s))), o ? m.mod(o) : m;
    if (g = s.s < 0, o) {
      if (o.c ? !o.c[0] : !o.s) return new v(NaN);
      x = !g && b.isInteger() && o.isInteger(), x && (b = b.mod(o));
    } else {
      if (s.e > 9 && (b.e > 0 || b.e < -1 || (b.e == 0 ? b.c[0] > 1 || h && b.c[1] >= 24e7 : b.c[0] < 8e13 || h && b.c[0] <= 9999975e7)))
        return y = b.s < 0 && de(s) ? -0 : 0, b.e > -1 && (y = 1 / y), new v(g ? 1 / y : y);
      O && (y = Oe(O / C + 2));
    }
    for (h ? (f = new v(0.5), g && (s.s = 1), w = de(s)) : (p = Math.abs(+F(s)), w = p % 2), m = new v(l); ; ) {
      if (w) {
        if (m = m.times(b), !m.c) break;
        y ? m.c.length > y && (m.c.length = y) : x && (m = m.mod(o));
      }
      if (p) {
        if (p = W(p / 2), p === 0) break;
        w = p % 2;
      } else if (s = s.times(f), G(s, s.e + 1, 1), s.e > 14)
        w = de(s);
      else {
        if (p = +F(s), p === 0) break;
        w = p % 2;
      }
      b = b.times(b), y ? b.c && b.c.length > y && (b.c.length = y) : x && (b = b.mod(o));
    }
    return x ? m : (g && (m = l.div(m)), o ? m.mod(o) : y ? G(m, O, c, E) : m);
  }, i.integerValue = function(s) {
    var o = new v(this);
    return s == null ? s = c : D(s, 0, 8), G(o, o.e + 1, s);
  }, i.isEqualTo = i.eq = function(s, o) {
    return le(this, new v(s, o)) === 0;
  }, i.isFinite = function() {
    return !!this.c;
  }, i.isGreaterThan = i.gt = function(s, o) {
    return le(this, new v(s, o)) > 0;
  }, i.isGreaterThanOrEqualTo = i.gte = function(s, o) {
    return (o = le(this, new v(s, o))) === 1 || o === 0;
  }, i.isInteger = function() {
    return !!this.c && Q(this.e / C) > this.c.length - 2;
  }, i.isLessThan = i.lt = function(s, o) {
    return le(this, new v(s, o)) < 0;
  }, i.isLessThanOrEqualTo = i.lte = function(s, o) {
    return (o = le(this, new v(s, o))) === -1 || o === 0;
  }, i.isNaN = function() {
    return !this.s;
  }, i.isNegative = function() {
    return this.s < 0;
  }, i.isPositive = function() {
    return this.s > 0;
  }, i.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, i.minus = function(s, o) {
    var f, x, p, y, E = this, h = E.s;
    if (s = new v(s, o), o = s.s, !h || !o) return new v(NaN);
    if (h != o)
      return s.s = -o, E.plus(s);
    var g = E.e / C, w = s.e / C, m = E.c, b = s.c;
    if (!g || !w) {
      if (!m || !b) return m ? (s.s = -o, s) : new v(b ? E : NaN);
      if (!m[0] || !b[0])
        return b[0] ? (s.s = -o, s) : new v(m[0] ? E : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          c == 3 ? -0 : 0
        ));
    }
    if (g = Q(g), w = Q(w), m = m.slice(), h = g - w) {
      for ((y = h < 0) ? (h = -h, p = m) : (w = g, p = b), p.reverse(), o = h; o--; p.push(0)) ;
      p.reverse();
    } else
      for (x = (y = (h = m.length) < (o = b.length)) ? h : o, h = o = 0; o < x; o++)
        if (m[o] != b[o]) {
          y = m[o] < b[o];
          break;
        }
    if (y && (p = m, m = b, b = p, s.s = -s.s), o = (x = b.length) - (f = m.length), o > 0) for (; o--; m[f++] = 0) ;
    for (o = j - 1; x > h; ) {
      if (m[--x] < b[x]) {
        for (f = x; f && !m[--f]; m[f] = o) ;
        --m[f], m[x] += j;
      }
      m[x] -= b[x];
    }
    for (; m[0] == 0; m.splice(0, 1), --w) ;
    return m[0] ? re(s, m, w) : (s.s = c == 3 ? -1 : 1, s.c = [s.e = 0], s);
  }, i.modulo = i.mod = function(s, o) {
    var f, x, p = this;
    return s = new v(s, o), !p.c || !s.s || s.c && !s.c[0] ? new v(NaN) : !s.c || p.c && !p.c[0] ? new v(p) : (L == 9 ? (x = s.s, s.s = 1, f = e(p, s, 0, 3), s.s = x, f.s *= x) : f = e(p, s, 0, L), s = p.minus(f.times(s)), !s.c[0] && L == 1 && (s.s = p.s), s);
  }, i.multipliedBy = i.times = function(s, o) {
    var f, x, p, y, E, h, g, w, m, b, A, R, B, U, V, I = this, q = I.c, X = (s = new v(s, o)).c;
    if (!q || !X || !q[0] || !X[0])
      return !I.s || !s.s || q && !q[0] && !X || X && !X[0] && !q ? s.c = s.e = s.s = null : (s.s *= I.s, !q || !X ? s.c = s.e = null : (s.c = [0], s.e = 0)), s;
    for (x = Q(I.e / C) + Q(s.e / C), s.s *= I.s, g = q.length, b = X.length, g < b && (B = q, q = X, X = B, p = g, g = b, b = p), p = g + b, B = []; p--; B.push(0)) ;
    for (U = j, V = oe, p = b; --p >= 0; ) {
      for (f = 0, A = X[p] % V, R = X[p] / V | 0, E = g, y = p + E; y > p; )
        w = q[--E] % V, m = q[E] / V | 0, h = R * w + m * A, w = A * w + h % V * V + B[y] + f, f = (w / U | 0) + (h / V | 0) + R * m, B[y--] = w % U;
      B[y] = f;
    }
    return f ? ++x : B.splice(0, 1), re(s, B, x);
  }, i.negated = function() {
    var s = new v(this);
    return s.s = -s.s || null, s;
  }, i.plus = function(s, o) {
    var f, x = this, p = x.s;
    if (s = new v(s, o), o = s.s, !p || !o) return new v(NaN);
    if (p != o)
      return s.s = -o, x.minus(s);
    var y = x.e / C, E = s.e / C, h = x.c, g = s.c;
    if (!y || !E) {
      if (!h || !g) return new v(p / 0);
      if (!h[0] || !g[0]) return g[0] ? s : new v(h[0] ? x : p * 0);
    }
    if (y = Q(y), E = Q(E), h = h.slice(), p = y - E) {
      for (p > 0 ? (E = y, f = g) : (p = -p, f = h), f.reverse(); p--; f.push(0)) ;
      f.reverse();
    }
    for (p = h.length, o = g.length, p - o < 0 && (f = g, g = h, h = f, o = p), p = 0; o; )
      p = (h[--o] = h[o] + g[o] + p) / j | 0, h[o] = j === h[o] ? 0 : h[o] % j;
    return p && (h = [p].concat(h), ++E), re(s, h, E);
  }, i.precision = i.sd = function(s, o) {
    var f, x, p, y = this;
    if (s != null && s !== !!s)
      return D(s, 1, K), o == null ? o = c : D(o, 0, 8), G(new v(y), s, o);
    if (!(f = y.c)) return null;
    if (p = f.length - 1, x = p * C + 1, p = f[p]) {
      for (; p % 10 == 0; p /= 10, x--) ;
      for (p = f[0]; p >= 10; p /= 10, x++) ;
    }
    return s && y.e + 1 > x && (x = y.e + 1), x;
  }, i.shiftedBy = function(s) {
    return D(s, -Ae, Ae), this.times("1e" + s);
  }, i.squareRoot = i.sqrt = function() {
    var s, o, f, x, p, y = this, E = y.c, h = y.s, g = y.e, w = u + 4, m = new v("0.5");
    if (h !== 1 || !E || !E[0])
      return new v(!h || h < 0 && (!E || E[0]) ? NaN : E ? y : 1 / 0);
    if (h = Math.sqrt(+F(y)), h == 0 || h == 1 / 0 ? (o = Z(E), (o.length + g) % 2 == 0 && (o += "0"), h = Math.sqrt(+o), g = Q((g + 1) / 2) - (g < 0 || g % 2), h == 1 / 0 ? o = "5e" + g : (o = h.toExponential(), o = o.slice(0, o.indexOf("e") + 1) + g), f = new v(o)) : f = new v(h + ""), f.c[0]) {
      for (g = f.e, h = g + w, h < 3 && (h = 0); ; )
        if (p = f, f = m.times(p.plus(e(y, p, w, 1))), Z(p.c).slice(0, h) === (o = Z(f.c)).slice(0, h))
          if (f.e < g && --h, o = o.slice(h - 3, h + 1), o == "9999" || !x && o == "4999") {
            if (!x && (G(p, p.e + u + 2, 0), p.times(p).eq(y))) {
              f = p;
              break;
            }
            w += 4, h += 4, x = 1;
          } else {
            (!+o || !+o.slice(1) && o.charAt(0) == "5") && (G(f, f.e + u + 2, 1), s = !f.times(f).eq(y));
            break;
          }
    }
    return G(f, f.e + u + 1, c, s);
  }, i.toExponential = function(s, o) {
    return s != null && (D(s, 0, K), s++), _(this, s, o, 1);
  }, i.toFixed = function(s, o) {
    return s != null && (D(s, 0, K), s = s + this.e + 1), _(this, s, o);
  }, i.toFormat = function(s, o, f) {
    var x, p = this;
    if (f == null)
      s != null && o && typeof o == "object" ? (f = o, o = null) : s && typeof s == "object" ? (f = s, s = o = null) : f = T;
    else if (typeof f != "object")
      throw Error(J + "Argument not an object: " + f);
    if (x = p.toFixed(s, o), p.c) {
      var y, E = x.split("."), h = +f.groupSize, g = +f.secondaryGroupSize, w = f.groupSeparator || "", m = E[0], b = E[1], A = p.s < 0, R = A ? m.slice(1) : m, B = R.length;
      if (g && (y = h, h = g, g = y, B -= y), h > 0 && B > 0) {
        for (y = B % h || h, m = R.substr(0, y); y < B; y += h) m += w + R.substr(y, h);
        g > 0 && (m += w + R.slice(y)), A && (m = "-" + m);
      }
      x = b ? m + (f.decimalSeparator || "") + ((g = +f.fractionGroupSize) ? b.replace(
        new RegExp("\\\\d{" + g + "}\\\\B", "g"),
        "$&" + (f.fractionGroupSeparator || "")
      ) : b) : m;
    }
    return (f.prefix || "") + x + (f.suffix || "");
  }, i.toFraction = function(s) {
    var o, f, x, p, y, E, h, g, w, m, b, A, R = this, B = R.c;
    if (s != null && (h = new v(s), !h.isInteger() && (h.c || h.s !== 1) || h.lt(l)))
      throw Error(J + "Argument " + (h.isInteger() ? "out of range: " : "not an integer: ") + F(h));
    if (!B) return new v(R);
    for (o = new v(l), w = f = new v(l), x = g = new v(l), A = Z(B), y = o.e = A.length - R.e - 1, o.c[0] = Re[(E = y % C) < 0 ? C + E : E], s = !s || h.comparedTo(o) > 0 ? y > 0 ? o : w : h, E = S, S = 1 / 0, h = new v(A), g.c[0] = 0; m = e(h, o, 0, 1), p = f.plus(m.times(x)), p.comparedTo(s) != 1; )
      f = x, x = p, w = g.plus(m.times(p = w)), g = p, o = h.minus(m.times(p = o)), h = p;
    return p = e(s.minus(f), x, 0, 1), g = g.plus(p.times(w)), f = f.plus(p.times(x)), g.s = w.s = R.s, y = y * 2, b = e(w, x, y, c).minus(R).abs().comparedTo(
      e(g, f, y, c).minus(R).abs()
    ) < 1 ? [w, x] : [g, f], S = E, b;
  }, i.toNumber = function() {
    return +F(this);
  }, i.toPrecision = function(s, o) {
    return s != null && D(s, 1, K), _(this, s, o, 2);
  }, i.toString = function(s) {
    var o, f = this, x = f.s, p = f.e;
    return p === null ? x ? (o = "Infinity", x < 0 && (o = "-" + o)) : o = "NaN" : (s == null ? o = p <= d || p >= a ? me(Z(f.c), p) : ie(Z(f.c), p, "0") : s === 10 && N ? (f = G(new v(f), u + p + 1, c), o = ie(Z(f.c), f.e, "0")) : (D(s, 2, k.length, "Base"), o = t(ie(Z(f.c), p, "0"), 10, s, x, !0)), x < 0 && f.c[0] && (o = "-" + o)), o;
  }, i.valueOf = i.toJSON = function() {
    return F(this);
  }, i._isBigNumber = !0, i[Symbol.toStringTag] = "BigNumber", i[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = i.valueOf, n != null && v.set(n), v;
}
function Q(n) {
  var e = n | 0;
  return n > 0 || n === e ? e : e - 1;
}
function Z(n) {
  for (var e, t, r = 1, i = n.length, l = n[0] + ""; r < i; ) {
    for (e = n[r++] + "", t = C - e.length; t--; e = "0" + e) ;
    l += e;
  }
  for (i = l.length; l.charCodeAt(--i) === 48; ) ;
  return l.slice(0, i + 1 || 1);
}
function le(n, e) {
  var t, r, i = n.c, l = e.c, u = n.s, c = e.s, d = n.e, a = e.e;
  if (!u || !c) return null;
  if (t = i && !i[0], r = l && !l[0], t || r) return t ? r ? 0 : -c : u;
  if (u != c) return u;
  if (t = u < 0, r = d == a, !i || !l) return r ? 0 : !i ^ t ? 1 : -1;
  if (!r) return d > a ^ t ? 1 : -1;
  for (c = (d = i.length) < (a = l.length) ? d : a, u = 0; u < c; u++) if (i[u] != l[u]) return i[u] > l[u] ^ t ? 1 : -1;
  return d == a ? 0 : d > a ^ t ? 1 : -1;
}
function D(n, e, t, r) {
  if (n < e || n > t || n !== W(n))
    throw Error(J + (r || "Argument") + (typeof n == "number" ? n < e || n > t ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(n));
}
function de(n) {
  var e = n.c.length - 1;
  return Q(n.e / C) == e && n.c[e] % 2 != 0;
}
function me(n, e) {
  return (n.length > 1 ? n.charAt(0) + "." + n.slice(1) : n) + (e < 0 ? "e" : "e+") + e;
}
function ie(n, e, t) {
  var r, i;
  if (e < 0) {
    for (i = t + "."; ++e; i += t) ;
    n = i + n;
  } else if (r = n.length, ++e > r) {
    for (i = t, e -= r; --e; i += t) ;
    n += i;
  } else e < r && (n = n.slice(0, e) + "." + n.slice(e));
  return n;
}
var ne = je(), ft = class {
  key;
  left = null;
  right = null;
  constructor(n) {
    this.key = n;
  }
}, ce = class extends ft {
  constructor(n) {
    super(n);
  }
}, ct = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(n) {
    const e = this.root;
    if (e == null)
      return this.compare(n, n), -1;
    let t = null, r = null, i = null, l = null, u = e;
    const c = this.compare;
    let d;
    for (; ; )
      if (d = c(u.key, n), d > 0) {
        let a = u.left;
        if (a == null || (d = c(a.key, n), d > 0 && (u.left = a.right, a.right = u, u = a, a = u.left, a == null)))
          break;
        t == null ? r = u : t.left = u, t = u, u = a;
      } else if (d < 0) {
        let a = u.right;
        if (a == null || (d = c(a.key, n), d < 0 && (u.right = a.left, a.left = u, u = a, a = u.right, a == null)))
          break;
        i == null ? l = u : i.right = u, i = u, u = a;
      } else
        break;
    return i != null && (i.right = u.left, u.left = l), t != null && (t.left = u.right, u.right = r), this.root !== u && (this.root = u, this.splayCount++), d;
  }
  splayMin(n) {
    let e = n, t = e.left;
    for (; t != null; ) {
      const r = t;
      e.left = r.right, r.right = e, e = r, t = e.left;
    }
    return e;
  }
  splayMax(n) {
    let e = n, t = e.right;
    for (; t != null; ) {
      const r = t;
      e.right = r.left, r.left = e, e = r, t = e.right;
    }
    return e;
  }
  _delete(n) {
    if (this.root == null || this.splay(n) != 0) return null;
    let t = this.root;
    const r = t, i = t.left;
    if (this.size--, i == null)
      this.root = t.right;
    else {
      const l = t.right;
      t = this.splayMax(i), t.right = l, this.root = t;
    }
    return this.modificationCount++, r;
  }
  addNewRoot(n, e) {
    this.size++, this.modificationCount++;
    const t = this.root;
    if (t == null) {
      this.root = n;
      return;
    }
    e < 0 ? (n.left = t, n.right = t.right, t.right = null) : (n.right = t, n.left = t.left, t.left = null), this.root = n;
  }
  _first() {
    const n = this.root;
    return n == null ? null : (this.root = this.splayMin(n), this.root);
  }
  _last() {
    const n = this.root;
    return n == null ? null : (this.root = this.splayMax(n), this.root);
  }
  clear() {
    this.root = null, this.size = 0, this.modificationCount++;
  }
  has(n) {
    return this.validKey(n) && this.splay(n) == 0;
  }
  defaultCompare() {
    return (n, e) => n < e ? -1 : n > e ? 1 : 0;
  }
  wrap() {
    return {
      getRoot: () => this.root,
      setRoot: (n) => {
        this.root = n;
      },
      getSize: () => this.size,
      getModificationCount: () => this.modificationCount,
      getSplayCount: () => this.splayCount,
      setSplayCount: (n) => {
        this.splayCount = n;
      },
      splay: (n) => this.splay(n),
      has: (n) => this.has(n)
    };
  }
}, Ee = class he extends ct {
  root = null;
  compare;
  validKey;
  constructor(e, t) {
    super(), this.compare = e ?? this.defaultCompare(), this.validKey = t ?? ((r) => r != null && r != null);
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
    let r;
    for (; r = t.next(), !r.done; )
      e(r.value, r.value, this);
  }
  add(e) {
    const t = this.splay(e);
    return t != 0 && this.addNewRoot(new ce(e), t), this;
  }
  addAndReturn(e) {
    const t = this.splay(e);
    return t != 0 && this.addNewRoot(new ce(e), t), this.root.key;
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
    let r = this.root.left;
    if (r == null) return null;
    let i = r.right;
    for (; i != null; )
      r = i, i = r.right;
    return r.key;
  }
  firstAfter(e) {
    if (e == null) throw "Invalid arguments(s)";
    if (this.root == null) return null;
    if (this.splay(e) > 0) return this.root.key;
    let r = this.root.right;
    if (r == null) return null;
    let i = r.left;
    for (; i != null; )
      r = i, i = r.left;
    return r.key;
  }
  retainAll(e) {
    const t = new he(this.compare, this.validKey), r = this.modificationCount;
    for (const i of e) {
      if (r != this.modificationCount)
        throw "Concurrent modification during iteration.";
      this.validKey(i) && this.splay(i) == 0 && t.add(this.root.key);
    }
    t.size != this.size && (this.root = t.root, this.size = t.size, this.modificationCount++);
  }
  lookup(e) {
    return !this.validKey(e) || this.splay(e) != 0 ? null : this.root.key;
  }
  intersection(e) {
    const t = new he(this.compare, this.validKey);
    for (const r of this)
      e.has(r) && t.add(r);
    return t;
  }
  difference(e) {
    const t = new he(this.compare, this.validKey);
    for (const r of this)
      e.has(r) || t.add(r);
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
    function t(i, l) {
      let u, c;
      do {
        if (u = i.left, c = i.right, u != null) {
          const d = new ce(u.key);
          l.left = d, t(u, d);
        }
        if (c != null) {
          const d = new ce(c.key);
          l.right = d, i = c, l = d;
        }
      } while (c != null);
    }
    const r = new ce(e.key);
    return t(e, r), r;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new ht(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new at(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, et = class {
  tree;
  path = new Array();
  modificationCount = null;
  splayCount;
  constructor(n) {
    this.tree = n, this.splayCount = n.getSplayCount();
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.moveNext() ? { done: !1, value: this.current() } : { done: !0, value: null };
  }
  current() {
    if (!this.path.length) return null;
    const n = this.path[this.path.length - 1];
    return this.getValue(n);
  }
  rebuildPath(n) {
    this.path.splice(0, this.path.length), this.tree.splay(n), this.path.push(this.tree.getRoot()), this.splayCount = this.tree.getSplayCount();
  }
  findLeftMostDescendent(n) {
    for (; n != null; )
      this.path.push(n), n = n.left;
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
    let n = this.path[this.path.length - 1], e = n.right;
    if (e != null) {
      for (; e != null; )
        this.path.push(e), e = e.left;
      return !0;
    }
    for (this.path.pop(); this.path.length && this.path[this.path.length - 1].right === n; )
      n = this.path.pop();
    return this.path.length > 0;
  }
}, at = class extends et {
  getValue(n) {
    return n.key;
  }
}, ht = class extends et {
  getValue(n) {
    return [n.key, n.key];
  }
}, tt = (n) => () => n, _e = (n) => {
  const e = n ? (t, r) => r.minus(t).abs().isLessThanOrEqualTo(n) : tt(!1);
  return (t, r) => e(t, r) ? 0 : t.comparedTo(r);
};
function pt(n) {
  const e = n ? (t, r, i, l, u) => t.exponentiatedBy(2).isLessThanOrEqualTo(
    l.minus(r).exponentiatedBy(2).plus(u.minus(i).exponentiatedBy(2)).times(n)
  ) : tt(!1);
  return (t, r, i) => {
    const l = t.x, u = t.y, c = i.x, d = i.y, a = u.minus(d).times(r.x.minus(c)).minus(l.minus(c).times(r.y.minus(d)));
    return e(a, l, u, c, d) ? 0 : a.comparedTo(0);
  };
}
var gt = (n) => n, yt = (n) => {
  if (n) {
    const e = new Ee(_e(n)), t = new Ee(_e(n)), r = (l, u) => u.addAndReturn(l), i = (l) => ({
      x: r(l.x, e),
      y: r(l.y, t)
    });
    return i({ x: new ne(0), y: new ne(0) }), i;
  }
  return gt;
}, Ne = (n) => ({
  set: (e) => {
    se = Ne(e);
  },
  reset: () => Ne(n),
  compare: _e(n),
  snap: yt(n),
  orient: pt(n)
}), se = Ne(), ae = (n, e) => n.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(n.ur.x) && n.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(n.ur.y), Ie = (n, e) => {
  if (e.ur.x.isLessThan(n.ll.x) || n.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(n.ll.y) || n.ur.y.isLessThan(e.ll.y))
    return null;
  const t = n.ll.x.isLessThan(e.ll.x) ? e.ll.x : n.ll.x, r = n.ur.x.isLessThan(e.ur.x) ? n.ur.x : e.ur.x, i = n.ll.y.isLessThan(e.ll.y) ? e.ll.y : n.ll.y, l = n.ur.y.isLessThan(e.ur.y) ? n.ur.y : e.ur.y;
  return { ll: { x: t, y: i }, ur: { x: r, y: l } };
}, xe = (n, e) => n.x.times(e.y).minus(n.y.times(e.x)), nt = (n, e) => n.x.times(e.x).plus(n.y.times(e.y)), ve = (n) => nt(n, n).sqrt(), dt = (n, e, t) => {
  const r = { x: e.x.minus(n.x), y: e.y.minus(n.y) }, i = { x: t.x.minus(n.x), y: t.y.minus(n.y) };
  return xe(i, r).div(ve(i)).div(ve(r));
}, mt = (n, e, t) => {
  const r = { x: e.x.minus(n.x), y: e.y.minus(n.y) }, i = { x: t.x.minus(n.x), y: t.y.minus(n.y) };
  return nt(i, r).div(ve(i)).div(ve(r));
}, Ue = (n, e, t) => e.y.isZero() ? null : { x: n.x.plus(e.x.div(e.y).times(t.minus(n.y))), y: t }, ze = (n, e, t) => e.x.isZero() ? null : { x: t, y: n.y.plus(e.y.div(e.x).times(t.minus(n.x))) }, xt = (n, e, t, r) => {
  if (e.x.isZero()) return ze(t, r, n.x);
  if (r.x.isZero()) return ze(n, e, t.x);
  if (e.y.isZero()) return Ue(t, r, n.y);
  if (r.y.isZero()) return Ue(n, e, t.y);
  const i = xe(e, r);
  if (i.isZero()) return null;
  const l = { x: t.x.minus(n.x), y: t.y.minus(n.y) }, u = xe(l, e).div(i), c = xe(l, r).div(i), d = n.x.plus(c.times(e.x)), a = t.x.plus(u.times(r.x)), P = n.y.plus(c.times(e.y)), S = t.y.plus(u.times(r.y)), M = d.plus(a).div(2), L = P.plus(S).div(2);
  return { x: M, y: L };
}, te = class rt {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, t) {
    const r = rt.comparePoints(e.point, t.point);
    return r !== 0 ? r : (e.point !== t.point && e.link(t), e.isLeft !== t.isLeft ? e.isLeft ? 1 : -1 : Se.compare(e.segment, t.segment));
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
    for (let r = 0, i = t.length; r < i; r++) {
      const l = t[r];
      this.point.events.push(l), l.point = this.point;
    }
    this.checkForConsuming();
  }
  /* Do a pass over our linked events and check to see if any pair
   * of segments match, and should be consumed. */
  checkForConsuming() {
    const e = this.point.events.length;
    for (let t = 0; t < e; t++) {
      const r = this.point.events[t];
      if (r.segment.consumedBy === void 0)
        for (let i = t + 1; i < e; i++) {
          const l = this.point.events[i];
          l.consumedBy === void 0 && r.otherSE.point.events === l.otherSE.point.events && r.segment.consume(l.segment);
        }
    }
  }
  getAvailableLinkedEvents() {
    const e = [];
    for (let t = 0, r = this.point.events.length; t < r; t++) {
      const i = this.point.events[t];
      i !== this && !i.segment.ringOut && i.segment.isInResult() && e.push(i);
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
    const t = /* @__PURE__ */ new Map(), r = (i) => {
      const l = i.otherSE;
      t.set(i, {
        sine: dt(this.point, e.point, l.point),
        cosine: mt(this.point, e.point, l.point)
      });
    };
    return (i, l) => {
      t.has(i) || r(i), t.has(l) || r(l);
      const { sine: u, cosine: c } = t.get(i), { sine: d, cosine: a } = t.get(l);
      return u.isGreaterThanOrEqualTo(0) && d.isGreaterThanOrEqualTo(0) ? c.isLessThan(a) ? 1 : c.isGreaterThan(a) ? -1 : 0 : u.isLessThan(0) && d.isLessThan(0) ? c.isLessThan(a) ? -1 : c.isGreaterThan(a) ? 1 : 0 : d.isLessThan(u) ? -1 : d.isGreaterThan(u) ? 1 : 0;
    };
  }
}, wt = class ke {
  events;
  poly;
  _isExteriorRing;
  _enclosingRing;
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory(e) {
    const t = [];
    for (let r = 0, i = e.length; r < i; r++) {
      const l = e[r];
      if (!l.isInResult() || l.ringOut) continue;
      let u = null, c = l.leftSE, d = l.rightSE;
      const a = [c], P = c.point, S = [];
      for (; u = c, c = d, a.push(c), c.point !== P; )
        for (; ; ) {
          const M = c.getAvailableLinkedEvents();
          if (M.length === 0) {
            const T = a[0].point, k = a[a.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${T.x}, \${T.y}]. Last matching segment found ends at [\${k.x}, \${k.y}].\`
            );
          }
          if (M.length === 1) {
            d = M[0].otherSE;
            break;
          }
          let L = null;
          for (let T = 0, k = S.length; T < k; T++)
            if (S[T].point === c.point) {
              L = T;
              break;
            }
          if (L !== null) {
            const T = S.splice(L)[0], k = a.splice(T.index);
            k.unshift(k[0].otherSE), t.push(new ke(k.reverse()));
            continue;
          }
          S.push({
            index: a.length,
            point: c.point
          });
          const O = c.getLeftmostComparator(u);
          d = M.sort(O)[0].otherSE;
          break;
        }
      t.push(new ke(a));
    }
    return t;
  }
  constructor(e) {
    this.events = e;
    for (let t = 0, r = e.length; t < r; t++)
      e[t].segment.ringOut = this;
    this.poly = null;
  }
  getGeom() {
    let e = this.events[0].point;
    const t = [e];
    for (let a = 1, P = this.events.length - 1; a < P; a++) {
      const S = this.events[a].point, M = this.events[a + 1].point;
      se.orient(S, e, M) !== 0 && (t.push(S), e = S);
    }
    if (t.length === 1) return null;
    const r = t[0], i = t[1];
    se.orient(r, e, i) === 0 && t.shift(), t.push(t[0]);
    const l = this.isExteriorRing() ? 1 : -1, u = this.isExteriorRing() ? 0 : t.length - 1, c = this.isExteriorRing() ? t.length : -1, d = [];
    for (let a = u; a != c; a += l)
      d.push([t[a].x.toNumber(), t[a].y.toNumber()]);
    return d;
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
    for (let i = 1, l = this.events.length; i < l; i++) {
      const u = this.events[i];
      te.compare(e, u) > 0 && (e = u);
    }
    let t = e.segment.prevInResult(), r = t ? t.prevInResult() : null;
    for (; ; ) {
      if (!t) return null;
      if (!r) return t.ringOut;
      if (r.ringOut !== t.ringOut)
        return r.ringOut?.enclosingRing() !== t.ringOut ? t.ringOut : t.ringOut?.enclosingRing();
      t = r.prevInResult(), r = t ? t.prevInResult() : null;
    }
  }
}, $e = class {
  exteriorRing;
  interiorRings;
  constructor(n) {
    this.exteriorRing = n, n.poly = this, this.interiorRings = [];
  }
  addInterior(n) {
    this.interiorRings.push(n), n.poly = this;
  }
  getGeom() {
    const n = this.exteriorRing.getGeom();
    if (n === null) return null;
    const e = [n];
    for (let t = 0, r = this.interiorRings.length; t < r; t++) {
      const i = this.interiorRings[t].getGeom();
      i !== null && e.push(i);
    }
    return e;
  }
}, Et = class {
  rings;
  polys;
  constructor(n) {
    this.rings = n, this.polys = this._composePolys(n);
  }
  getGeom() {
    const n = [];
    for (let e = 0, t = this.polys.length; e < t; e++) {
      const r = this.polys[e].getGeom();
      r !== null && n.push(r);
    }
    return n;
  }
  _composePolys(n) {
    const e = [];
    for (let t = 0, r = n.length; t < r; t++) {
      const i = n[t];
      if (!i.poly)
        if (i.isExteriorRing()) e.push(new $e(i));
        else {
          const l = i.enclosingRing();
          l?.poly || e.push(new $e(l)), l?.poly?.addInterior(i);
        }
    }
    return e;
  }
}, vt = class {
  queue;
  tree;
  segments;
  constructor(n, e = Se.compare) {
    this.queue = n, this.tree = new Ee(e), this.segments = [];
  }
  process(n) {
    const e = n.segment, t = [];
    if (n.consumedBy)
      return n.isLeft ? this.queue.delete(n.otherSE) : this.tree.delete(e), t;
    n.isLeft && this.tree.add(e);
    let r = e, i = e;
    do
      r = this.tree.lastBefore(r);
    while (r != null && r.consumedBy != null);
    do
      i = this.tree.firstAfter(i);
    while (i != null && i.consumedBy != null);
    if (n.isLeft) {
      let l = null;
      if (r) {
        const c = r.getIntersection(e);
        if (c !== null && (e.isAnEndpoint(c) || (l = c), !r.isAnEndpoint(c))) {
          const d = this._splitSafely(r, c);
          for (let a = 0, P = d.length; a < P; a++)
            t.push(d[a]);
        }
      }
      let u = null;
      if (i) {
        const c = i.getIntersection(e);
        if (c !== null && (e.isAnEndpoint(c) || (u = c), !i.isAnEndpoint(c))) {
          const d = this._splitSafely(i, c);
          for (let a = 0, P = d.length; a < P; a++)
            t.push(d[a]);
        }
      }
      if (l !== null || u !== null) {
        let c = null;
        l === null ? c = u : u === null ? c = l : c = te.comparePoints(
          l,
          u
        ) <= 0 ? l : u, this.queue.delete(e.rightSE), t.push(e.rightSE);
        const d = e.split(c);
        for (let a = 0, P = d.length; a < P; a++)
          t.push(d[a]);
      }
      t.length > 0 ? (this.tree.delete(e), t.push(n)) : (this.segments.push(e), e.prev = r);
    } else {
      if (r && i) {
        const l = r.getIntersection(i);
        if (l !== null) {
          if (!r.isAnEndpoint(l)) {
            const u = this._splitSafely(r, l);
            for (let c = 0, d = u.length; c < d; c++)
              t.push(u[c]);
          }
          if (!i.isAnEndpoint(l)) {
            const u = this._splitSafely(i, l);
            for (let c = 0, d = u.length; c < d; c++)
              t.push(u[c]);
          }
        }
      }
      this.tree.delete(e);
    }
    return t;
  }
  /* Safely split a segment that is currently in the datastructures
   * IE - a segment other than the one that is currently being processed. */
  _splitSafely(n, e) {
    this.tree.delete(n);
    const t = n.rightSE;
    this.queue.delete(t);
    const r = n.split(e);
    return r.push(t), n.consumedBy === void 0 && this.tree.add(n), r;
  }
}, St = class {
  type;
  numMultiPolys;
  run(n, e, t) {
    pe.type = n;
    const r = [new Ke(e, !0)];
    for (let a = 0, P = t.length; a < P; a++)
      r.push(new Ke(t[a], !1));
    if (pe.numMultiPolys = r.length, pe.type === "difference") {
      const a = r[0];
      let P = 1;
      for (; P < r.length; )
        Ie(r[P].bbox, a.bbox) !== null ? P++ : r.splice(P, 1);
    }
    if (pe.type === "intersection")
      for (let a = 0, P = r.length; a < P; a++) {
        const S = r[a];
        for (let M = a + 1, L = r.length; M < L; M++)
          if (Ie(S.bbox, r[M].bbox) === null) return [];
      }
    const i = new Ee(te.compare);
    for (let a = 0, P = r.length; a < P; a++) {
      const S = r[a].getSweepEvents();
      for (let M = 0, L = S.length; M < L; M++)
        i.add(S[M]);
    }
    const l = new vt(i);
    let u = null;
    for (i.size != 0 && (u = i.first(), i.delete(u)); u; ) {
      const a = l.process(u);
      for (let P = 0, S = a.length; P < S; P++) {
        const M = a[P];
        M.consumedBy === void 0 && i.add(M);
      }
      i.size != 0 ? (u = i.first(), i.delete(u)) : u = null;
    }
    se.reset();
    const c = wt.factory(l.segments);
    return new Et(c).getGeom();
  }
}, pe = new St(), Be = pe, bt = 0, Se = class we {
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
    const r = e.leftSE.point.x, i = t.leftSE.point.x, l = e.rightSE.point.x, u = t.rightSE.point.x;
    if (u.isLessThan(r)) return 1;
    if (l.isLessThan(i)) return -1;
    const c = e.leftSE.point.y, d = t.leftSE.point.y, a = e.rightSE.point.y, P = t.rightSE.point.y;
    if (r.isLessThan(i)) {
      if (d.isLessThan(c) && d.isLessThan(a)) return 1;
      if (d.isGreaterThan(c) && d.isGreaterThan(a)) return -1;
      const S = e.comparePoint(t.leftSE.point);
      if (S < 0) return 1;
      if (S > 0) return -1;
      const M = t.comparePoint(e.rightSE.point);
      return M !== 0 ? M : -1;
    }
    if (r.isGreaterThan(i)) {
      if (c.isLessThan(d) && c.isLessThan(P)) return -1;
      if (c.isGreaterThan(d) && c.isGreaterThan(P)) return 1;
      const S = t.comparePoint(e.leftSE.point);
      if (S !== 0) return S;
      const M = e.comparePoint(t.rightSE.point);
      return M < 0 ? 1 : M > 0 ? -1 : 1;
    }
    if (c.isLessThan(d)) return -1;
    if (c.isGreaterThan(d)) return 1;
    if (l.isLessThan(u)) {
      const S = t.comparePoint(e.rightSE.point);
      if (S !== 0) return S;
    }
    if (l.isGreaterThan(u)) {
      const S = e.comparePoint(t.rightSE.point);
      if (S < 0) return 1;
      if (S > 0) return -1;
    }
    if (!l.eq(u)) {
      const S = a.minus(c), M = l.minus(r), L = P.minus(d), O = u.minus(i);
      if (S.isGreaterThan(M) && L.isLessThan(O)) return 1;
      if (S.isLessThan(M) && L.isGreaterThan(O)) return -1;
    }
    return l.isGreaterThan(u) ? 1 : l.isLessThan(u) || a.isLessThan(P) ? -1 : a.isGreaterThan(P) ? 1 : e.id < t.id ? -1 : e.id > t.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, t, r, i) {
    this.id = ++bt, this.leftSE = e, e.segment = this, e.otherSE = t, this.rightSE = t, t.segment = this, t.otherSE = e, this.rings = r, this.windings = i;
  }
  static fromRing(e, t, r) {
    let i, l, u;
    const c = te.comparePoints(e, t);
    if (c < 0)
      i = e, l = t, u = 1;
    else if (c > 0)
      i = t, l = e, u = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const d = new te(i, !0), a = new te(l, !1);
    return new we(d, a, [r], [u]);
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
    const t = this.bbox(), r = e.bbox(), i = Ie(t, r);
    if (i === null) return null;
    const l = this.leftSE.point, u = this.rightSE.point, c = e.leftSE.point, d = e.rightSE.point, a = ae(t, c) && this.comparePoint(c) === 0, P = ae(r, l) && e.comparePoint(l) === 0, S = ae(t, d) && this.comparePoint(d) === 0, M = ae(r, u) && e.comparePoint(u) === 0;
    if (P && a)
      return M && !S ? u : !M && S ? d : null;
    if (P)
      return S && l.x.eq(d.x) && l.y.eq(d.y) ? null : l;
    if (a)
      return M && u.x.eq(c.x) && u.y.eq(c.y) ? null : c;
    if (M && S) return null;
    if (M) return u;
    if (S) return d;
    const L = xt(l, this.vector(), c, e.vector());
    return L === null || !ae(i, L) ? null : se.snap(L);
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
    const t = [], r = e.events !== void 0, i = new te(e, !0), l = new te(e, !1), u = this.rightSE;
    this.replaceRightSE(l), t.push(l), t.push(i);
    const c = new we(
      i,
      u,
      this.rings.slice(),
      this.windings.slice()
    );
    return te.comparePoints(c.leftSE.point, c.rightSE.point) > 0 && c.swapEvents(), te.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), r && (i.checkForConsuming(), l.checkForConsuming()), t;
  }
  /* Swap which event is left and right */
  swapEvents() {
    const e = this.rightSE;
    this.rightSE = this.leftSE, this.leftSE = e, this.leftSE.isLeft = !0, this.rightSE.isLeft = !1;
    for (let t = 0, r = this.windings.length; t < r; t++)
      this.windings[t] *= -1;
  }
  /* Consume another segment. We take their rings under our wing
   * and mark them as consumed. Use for perfectly overlapping segments */
  consume(e) {
    let t = this, r = e;
    for (; t.consumedBy; ) t = t.consumedBy;
    for (; r.consumedBy; ) r = r.consumedBy;
    const i = we.compare(t, r);
    if (i !== 0) {
      if (i > 0) {
        const l = t;
        t = r, r = l;
      }
      if (t.prev === r) {
        const l = t;
        t = r, r = l;
      }
      for (let l = 0, u = r.rings.length; l < u; l++) {
        const c = r.rings[l], d = r.windings[l], a = t.rings.indexOf(c);
        a === -1 ? (t.rings.push(c), t.windings.push(d)) : t.windings[a] += d;
      }
      r.rings = null, r.windings = null, r.consumedBy = t, r.leftSE.consumedBy = t.leftSE, r.rightSE.consumedBy = t.rightSE;
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
    const t = this._afterState.rings, r = this._afterState.windings, i = this._afterState.multiPolys;
    for (let c = 0, d = this.rings.length; c < d; c++) {
      const a = this.rings[c], P = this.windings[c], S = t.indexOf(a);
      S === -1 ? (t.push(a), r.push(P)) : r[S] += P;
    }
    const l = [], u = [];
    for (let c = 0, d = t.length; c < d; c++) {
      if (r[c] === 0) continue;
      const a = t[c], P = a.poly;
      if (u.indexOf(P) === -1)
        if (a.isExterior) l.push(P);
        else {
          u.indexOf(P) === -1 && u.push(P);
          const S = l.indexOf(a.poly);
          S !== -1 && l.splice(S, 1);
        }
    }
    for (let c = 0, d = l.length; c < d; c++) {
      const a = l[c].multiPoly;
      i.indexOf(a) === -1 && i.push(a);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const e = this.beforeState().multiPolys, t = this.afterState().multiPolys;
    switch (Be.type) {
      case "union": {
        const r = e.length === 0, i = t.length === 0;
        this._isInResult = r !== i;
        break;
      }
      case "intersection": {
        let r, i;
        e.length < t.length ? (r = e.length, i = t.length) : (r = t.length, i = e.length), this._isInResult = i === Be.numMultiPolys && r < i;
        break;
      }
      case "xor": {
        const r = Math.abs(e.length - t.length);
        this._isInResult = r % 2 === 1;
        break;
      }
      case "difference": {
        const r = (i) => i.length === 1 && i[0].isSubject;
        this._isInResult = r(e) !== r(t);
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
  constructor(n, e, t) {
    if (!Array.isArray(n) || n.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (this.poly = e, this.isExterior = t, this.segments = [], typeof n[0][0] != "number" || typeof n[0][1] != "number")
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const r = se.snap({ x: new ne(n[0][0]), y: new ne(n[0][1]) });
    this.bbox = {
      ll: { x: r.x, y: r.y },
      ur: { x: r.x, y: r.y }
    };
    let i = r;
    for (let l = 1, u = n.length; l < u; l++) {
      if (typeof n[l][0] != "number" || typeof n[l][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const c = se.snap({ x: new ne(n[l][0]), y: new ne(n[l][1]) });
      c.x.eq(i.x) && c.y.eq(i.y) || (this.segments.push(Se.fromRing(i, c, this)), c.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = c.x), c.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = c.y), c.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = c.x), c.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = c.y), i = c);
    }
    (!r.x.eq(i.x) || !r.y.eq(i.y)) && this.segments.push(Se.fromRing(i, r, this));
  }
  getSweepEvents() {
    const n = [];
    for (let e = 0, t = this.segments.length; e < t; e++) {
      const r = this.segments[e];
      n.push(r.leftSE), n.push(r.rightSE);
    }
    return n;
  }
}, Pt = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(n, e) {
    if (!Array.isArray(n))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new Ve(n[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let t = 1, r = n.length; t < r; t++) {
      const i = new Ve(n[t], this, !1);
      i.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = i.bbox.ll.x), i.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = i.bbox.ll.y), i.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = i.bbox.ur.x), i.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = i.bbox.ur.y), this.interiorRings.push(i);
    }
    this.multiPoly = e;
  }
  getSweepEvents() {
    const n = this.exteriorRing.getSweepEvents();
    for (let e = 0, t = this.interiorRings.length; e < t; e++) {
      const r = this.interiorRings[e].getSweepEvents();
      for (let i = 0, l = r.length; i < l; i++)
        n.push(r[i]);
    }
    return n;
  }
}, Ke = class {
  isSubject;
  polys;
  bbox;
  constructor(n, e) {
    if (!Array.isArray(n))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    try {
      typeof n[0][0][0] == "number" && (n = [n]);
    } catch {
    }
    this.polys = [], this.bbox = {
      ll: { x: new ne(Number.POSITIVE_INFINITY), y: new ne(Number.POSITIVE_INFINITY) },
      ur: { x: new ne(Number.NEGATIVE_INFINITY), y: new ne(Number.NEGATIVE_INFINITY) }
    };
    for (let t = 0, r = n.length; t < r; t++) {
      const i = new Pt(n[t], this);
      i.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = i.bbox.ll.x), i.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = i.bbox.ll.y), i.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = i.bbox.ur.x), i.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = i.bbox.ur.y), this.polys.push(i);
    }
    this.isSubject = e;
  }
  getSweepEvents() {
    const n = [];
    for (let e = 0, t = this.polys.length; e < t; e++) {
      const r = this.polys[e].getSweepEvents();
      for (let i = 0, l = r.length; i < l; i++)
        n.push(r[i]);
    }
    return n;
  }
}, Lt = (n, ...e) => Be.run("union", n, e);
se.set;
function ue(n, e, t = {}) {
  const r = { type: "Feature" };
  return (t.id === 0 || t.id) && (r.id = t.id), t.bbox && (r.bbox = t.bbox), r.properties = e || {}, r.geometry = n, r;
}
function Mt(n, e, t = {}) {
  for (const i of n) {
    if (i.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (i[i.length - 1].length !== i[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let l = 0; l < i[i.length - 1].length; l++)
      if (i[i.length - 1][l] !== i[0][l])
        throw new Error("First and last Position are not equivalent.");
  }
  return ue({
    type: "Polygon",
    coordinates: n
  }, e, t);
}
function Xe(n, e, t = {}) {
  if (n.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return ue({
    type: "LineString",
    coordinates: n
  }, e, t);
}
function it(n, e = {}) {
  const t = { type: "FeatureCollection" };
  return e.id && (t.id = e.id), e.bbox && (t.bbox = e.bbox), t.features = n, t;
}
function Tt(n, e, t = {}) {
  return ue({
    type: "MultiPolygon",
    coordinates: n
  }, e, t);
}
function Ot(n) {
  return n !== null && typeof n == "object" && !Array.isArray(n);
}
function At(n, e) {
  if (n.type === "Feature")
    e(n, 0);
  else if (n.type === "FeatureCollection")
    for (var t = 0; t < n.features.length && e(n.features[t], t) !== !1; t++)
      ;
}
function Fe(n, e) {
  var t, r, i, l, u, c, d, a, P, S, M = 0, L = n.type === "FeatureCollection", O = n.type === "Feature", T = L ? n.features.length : 1;
  for (t = 0; t < T; t++) {
    for (c = L ? (
      // @ts-expect-error: Known type conflict
      n.features[t].geometry
    ) : O ? (
      // @ts-expect-error: Known type conflict
      n.geometry
    ) : n, a = L ? (
      // @ts-expect-error: Known type conflict
      n.features[t].properties
    ) : O ? (
      // @ts-expect-error: Known type conflict
      n.properties
    ) : {}, P = L ? (
      // @ts-expect-error: Known type conflict
      n.features[t].bbox
    ) : O ? (
      // @ts-expect-error: Known type conflict
      n.bbox
    ) : void 0, S = L ? (
      // @ts-expect-error: Known type conflict
      n.features[t].id
    ) : O ? (
      // @ts-expect-error: Known type conflict
      n.id
    ) : void 0, d = c ? c.type === "GeometryCollection" : !1, u = d ? c.geometries.length : 1, i = 0; i < u; i++) {
      if (l = d ? c.geometries[i] : c, l === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            M,
            a,
            P,
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
              M,
              a,
              P,
              S
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (r = 0; r < l.geometries.length; r++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                l.geometries[r],
                M,
                a,
                P,
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
    M++;
  }
}
function Rt(n, e) {
  Fe(n, function(t, r, i, l, u) {
    var c = t === null ? null : t.type;
    switch (c) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            ue(t, i, { bbox: l, id: u }),
            r,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var d;
    switch (c) {
      case "MultiPoint":
        d = "Point";
        break;
      case "MultiLineString":
        d = "LineString";
        break;
      case "MultiPolygon":
        d = "Polygon";
        break;
    }
    for (
      var a = 0;
      // @ts-expect-error: Known type conflict
      a < t.coordinates.length;
      a++
    ) {
      var P = t.coordinates[a], S = {
        type: d,
        coordinates: P
      };
      if (
        // @ts-expect-error: Known type conflict
        e(ue(S, i), r, a) === !1
      )
        return !1;
    }
  });
}
function Ct(n, e = {}) {
  const t = [];
  if (Fe(n, (i) => {
    t.push(i.coordinates);
  }), t.length < 2)
    throw new Error("Must have at least 2 geometries");
  const r = Lt(t[0], ...t.slice(1));
  return r.length === 0 ? null : r.length === 1 ? Mt(r[0], e.properties) : Tt(r, e.properties);
}
function _t(n) {
  var e = {
    MultiPoint: {
      coordinates: [],
      properties: []
    },
    MultiLineString: {
      coordinates: [],
      properties: []
    },
    MultiPolygon: {
      coordinates: [],
      properties: []
    }
  };
  return At(n, (t) => {
    var r;
    switch ((r = t.geometry) == null ? void 0 : r.type) {
      case "Point":
        e.MultiPoint.coordinates.push(t.geometry.coordinates), e.MultiPoint.properties.push(t.properties);
        break;
      case "MultiPoint":
        e.MultiPoint.coordinates.push(...t.geometry.coordinates), e.MultiPoint.properties.push(t.properties);
        break;
      case "LineString":
        e.MultiLineString.coordinates.push(t.geometry.coordinates), e.MultiLineString.properties.push(t.properties);
        break;
      case "MultiLineString":
        e.MultiLineString.coordinates.push(
          ...t.geometry.coordinates
        ), e.MultiLineString.properties.push(t.properties);
        break;
      case "Polygon":
        e.MultiPolygon.coordinates.push(t.geometry.coordinates), e.MultiPolygon.properties.push(t.properties);
        break;
      case "MultiPolygon":
        e.MultiPolygon.coordinates.push(...t.geometry.coordinates), e.MultiPolygon.properties.push(t.properties);
        break;
    }
  }), it(
    Object.keys(e).filter(function(t) {
      return e[t].coordinates.length;
    }).sort().map(function(t) {
      var r = { type: t, coordinates: e[t].coordinates }, i = { collectedProperties: e[t].properties };
      return ue(r, i);
    })
  );
}
function Nt(n) {
  if (!n) throw new Error("geojson is required");
  var e = [];
  return Rt(n, function(t) {
    e.push(t);
  }), it(e);
}
class It {
  constructor(e = [], t = (r, i) => r < i ? -1 : r > i ? 1 : 0) {
    if (this.data = e, this.length = this.data.length, this.compare = t, this.length > 0)
      for (let r = (this.length >> 1) - 1; r >= 0; r--) this._down(r);
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
    const { data: t, compare: r } = this, i = t[e];
    for (; e > 0; ) {
      const l = e - 1 >> 1, u = t[l];
      if (r(i, u) >= 0) break;
      t[e] = u, e = l;
    }
    t[e] = i;
  }
  _down(e) {
    const { data: t, compare: r } = this, i = this.length >> 1, l = t[e];
    for (; e < i; ) {
      let u = (e << 1) + 1;
      const c = u + 1;
      if (c < this.length && r(t[c], t[u]) < 0 && (u = c), r(t[u], l) >= 0) break;
      t[e] = t[u], e = u;
    }
    t[e] = l;
  }
}
function Ye(n, e = 1, t = !1) {
  let r = 1 / 0, i = 1 / 0, l = -1 / 0, u = -1 / 0;
  for (const [N, v] of n[0])
    N < r && (r = N), v < i && (i = v), N > l && (l = N), v > u && (u = v);
  const c = l - r, d = u - i, a = Math.max(e, Math.min(c, d));
  if (a === e) {
    const N = [r, i];
    return N.distance = 0, N;
  }
  const P = new It([], (N, v) => v.max - N.max);
  let S = Bt(n);
  const M = new be(r + c / 2, i + d / 2, 0, n);
  M.d > S.d && (S = M);
  let L = 2;
  function O(N, v, _) {
    const $ = new be(N, v, _, n);
    L++, $.max > S.d + e && P.push($), $.d > S.d && (S = $, t && console.log(\`found best \${Math.round(1e4 * $.d) / 1e4} after \${L} probes\`));
  }
  let T = a / 2;
  for (let N = r; N < l; N += a)
    for (let v = i; v < u; v += a)
      O(N + T, v + T, T);
  for (; P.length; ) {
    const { max: N, x: v, y: _, h: $ } = P.pop();
    if (N - S.d <= e) break;
    T = $ / 2, O(v - T, _ - T, T), O(v + T, _ - T, T), O(v - T, _ + T, T), O(v + T, _ + T, T);
  }
  t && console.log(\`num probes: \${L}
best distance: \${S.d}\`);
  const k = [S.x, S.y];
  return k.distance = S.d, k;
}
function be(n, e, t, r) {
  this.x = n, this.y = e, this.h = t, this.d = kt(n, e, r), this.max = this.d + this.h * Math.SQRT2;
}
function kt(n, e, t) {
  let r = !1, i = 1 / 0;
  for (const l of t)
    for (let u = 0, c = l.length, d = c - 1; u < c; d = u++) {
      const a = l[u], P = l[d];
      a[1] > e != P[1] > e && n < (P[0] - a[0]) * (e - a[1]) / (P[1] - a[1]) + a[0] && (r = !r), i = Math.min(i, Gt(n, e, a, P));
    }
  return i === 0 ? 0 : (r ? 1 : -1) * Math.sqrt(i);
}
function Bt(n) {
  let e = 0, t = 0, r = 0;
  const i = n[0];
  for (let u = 0, c = i.length, d = c - 1; u < c; d = u++) {
    const a = i[u], P = i[d], S = a[0] * P[1] - P[0] * a[1];
    t += (a[0] + P[0]) * S, r += (a[1] + P[1]) * S, e += S * 3;
  }
  const l = new be(t / e, r / e, 0, n);
  return e === 0 || l.d < 0 ? new be(i[0][0], i[0][1], 0, n) : l;
}
function Gt(n, e, t, r) {
  let i = t[0], l = t[1], u = r[0] - i, c = r[1] - l;
  if (u !== 0 || c !== 0) {
    const d = ((n - i) * u + (e - l) * c) / (u * u + c * c);
    d > 1 ? (i = r[0], l = r[1]) : d > 0 && (i += u * d, l += c * d);
  }
  return u = n - i, c = e - l, u * u + c * c;
}
function Ft(n) {
  if (!n)
    throw new Error("coord is required");
  if (!Array.isArray(n)) {
    if (n.type === "Feature" && n.geometry !== null && n.geometry.type === "Point")
      return [...n.geometry.coordinates];
    if (n.type === "Point")
      return [...n.coordinates];
  }
  if (Array.isArray(n) && n.length >= 2 && !Array.isArray(n[0]) && !Array.isArray(n[1]))
    return [...n];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function ge(n) {
  if (Array.isArray(n))
    return n;
  if (n.type === "Feature") {
    if (n.geometry !== null)
      return n.geometry.coordinates;
  } else if (n.coordinates)
    return n.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function qt(n, e) {
  return n.type === "FeatureCollection" ? "FeatureCollection" : n.type === "GeometryCollection" ? "GeometryCollection" : n.type === "Feature" && n.geometry !== null ? n.geometry.type : n.type;
}
function Je(n, e, t = {}) {
  const r = Ft(n), i = ge(e);
  for (let l = 0; l < i.length - 1; l++) {
    let u = !1;
    if (t.ignoreEndVertices && (l === 0 && (u = "start"), l === i.length - 2 && (u = "end"), l === 0 && l + 1 === i.length - 1 && (u = "both")), Dt(
      i[l],
      i[l + 1],
      r,
      u,
      typeof t.epsilon > "u" ? null : t.epsilon
    ))
      return !0;
  }
  return !1;
}
function Dt(n, e, t, r, i) {
  const l = t[0], u = t[1], c = n[0], d = n[1], a = e[0], P = e[1], S = t[0] - c, M = t[1] - d, L = a - c, O = P - d, T = S * O - M * L;
  if (i !== null) {
    if (Math.abs(T) > i)
      return !1;
  } else if (T !== 0)
    return !1;
  if (Math.abs(L) === Math.abs(O) && Math.abs(L) === 0)
    return r ? !1 : t[0] === n[0] && t[1] === n[1];
  if (r) {
    if (r === "start")
      return Math.abs(L) >= Math.abs(O) ? L > 0 ? c < l && l <= a : a <= l && l < c : O > 0 ? d < u && u <= P : P <= u && u < d;
    if (r === "end")
      return Math.abs(L) >= Math.abs(O) ? L > 0 ? c <= l && l < a : a < l && l <= c : O > 0 ? d <= u && u < P : P < u && u <= d;
    if (r === "both")
      return Math.abs(L) >= Math.abs(O) ? L > 0 ? c < l && l < a : a < l && l < c : O > 0 ? d < u && u < P : P < u && u < d;
  } else return Math.abs(L) >= Math.abs(O) ? L > 0 ? c <= l && l <= a : a <= l && l <= c : O > 0 ? d <= u && u <= P : P <= u && u <= d;
  return !1;
}
function Ut(n, e = {}) {
  var t = typeof e == "object" ? e.mutate : e;
  if (!n) throw new Error("geojson is required");
  var r = qt(n), i = [];
  switch (r) {
    case "LineString":
      i = Ce(n, r);
      break;
    case "MultiLineString":
    case "Polygon":
      ge(n).forEach(function(u) {
        i.push(Ce(u, r));
      });
      break;
    case "MultiPolygon":
      ge(n).forEach(function(u) {
        var c = [];
        u.forEach(function(d) {
          c.push(Ce(d, r));
        }), i.push(c);
      });
      break;
    case "Point":
      return n;
    case "MultiPoint":
      var l = {};
      ge(n).forEach(function(u) {
        var c = u.join("-");
        Object.prototype.hasOwnProperty.call(l, c) || (i.push(u), l[c] = !0);
      });
      break;
    default:
      throw new Error(r + " geometry not supported");
  }
  return n.coordinates ? t === !0 ? (n.coordinates = i, n) : { type: r, coordinates: i } : t === !0 ? (n.geometry.coordinates = i, n) : ue({ type: r, coordinates: i }, n.properties, {
    bbox: n.bbox,
    id: n.id
  });
}
function Ce(n, e) {
  const t = ge(n);
  if (t.length === 2 && !He(t[0], t[1])) return t;
  const r = [];
  let i = 0, l = 1, u = 2;
  for (r.push(t[i]); u < t.length; )
    Je(t[l], Xe([t[i], t[u]])) ? l = u : (r.push(t[l]), i = l, l++, u = l), u++;
  if (r.push(t[l]), e === "Polygon" || e === "MultiPolygon") {
    if (Je(
      r[0],
      Xe([r[1], r[r.length - 2]])
    ) && (r.shift(), r.pop(), r.push(r[0])), r.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!He(r[0], r[r.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return r;
}
function He(n, e) {
  return n[0] === e[0] && n[1] === e[1];
}
function zt(n) {
  if (!n)
    throw new Error("geojson is required");
  switch (n.type) {
    case "Feature":
      return st(n);
    case "FeatureCollection":
      return $t(n);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return qe(n);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function st(n) {
  const e = { type: "Feature" };
  return Object.keys(n).forEach((t) => {
    switch (t) {
      case "type":
      case "properties":
      case "geometry":
        return;
      default:
        e[t] = n[t];
    }
  }), e.properties = ot(n.properties), n.geometry == null ? e.geometry = null : e.geometry = qe(n.geometry), e;
}
function ot(n) {
  const e = {};
  return n && Object.keys(n).forEach((t) => {
    const r = n[t];
    typeof r == "object" ? r === null ? e[t] = null : Array.isArray(r) ? e[t] = r.map((i) => i) : e[t] = ot(r) : e[t] = r;
  }), e;
}
function $t(n) {
  const e = { type: "FeatureCollection" };
  return Object.keys(n).forEach((t) => {
    switch (t) {
      case "type":
      case "features":
        return;
      default:
        e[t] = n[t];
    }
  }), e.features = n.features.map((t) => st(t)), e;
}
function qe(n) {
  const e = { type: n.type };
  return n.bbox && (e.bbox = n.bbox), n.type === "GeometryCollection" ? (e.geometries = n.geometries.map((t) => qe(t)), e) : (e.coordinates = lt(n.coordinates), e);
}
function lt(n) {
  const e = n;
  return typeof e[0] != "object" ? e.slice() : e.map((t) => lt(t));
}
function Vt(n, e) {
  var t = n[0] - e[0], r = n[1] - e[1];
  return t * t + r * r;
}
function Kt(n, e, t) {
  var r = e[0], i = e[1], l = t[0] - r, u = t[1] - i;
  if (l !== 0 || u !== 0) {
    var c = ((n[0] - r) * l + (n[1] - i) * u) / (l * l + u * u);
    c > 1 ? (r = t[0], i = t[1]) : c > 0 && (r += l * c, i += u * c);
  }
  return l = n[0] - r, u = n[1] - i, l * l + u * u;
}
function Xt(n, e) {
  for (var t = n[0], r = [t], i, l = 1, u = n.length; l < u; l++)
    i = n[l], Vt(i, t) > e && (r.push(i), t = i);
  return t !== i && r.push(i), r;
}
function Ge(n, e, t, r, i) {
  for (var l = r, u, c = e + 1; c < t; c++) {
    var d = Kt(n[c], n[e], n[t]);
    d > l && (u = c, l = d);
  }
  l > r && (u - e > 1 && Ge(n, e, u, r, i), i.push(n[u]), t - u > 1 && Ge(n, u, t, r, i));
}
function Yt(n, e) {
  var t = n.length - 1, r = [n[0]];
  return Ge(n, 0, t, e, r), r.push(n[t]), r;
}
function Pe(n, e, t) {
  if (n.length <= 2) return n;
  var r = e !== void 0 ? e * e : 1;
  return n = t ? n : Xt(n, r), n = Yt(n, r), n;
}
function Ze(n, e = {}) {
  var t, r, i;
  if (e = e ?? {}, !Ot(e)) throw new Error("options is invalid");
  const l = (t = e.tolerance) != null ? t : 1, u = (r = e.highQuality) != null ? r : !1, c = (i = e.mutate) != null ? i : !1;
  if (!n) throw new Error("geojson is required");
  if (l && l < 0) throw new Error("invalid tolerance");
  return c !== !0 && (n = zt(n)), Fe(n, function(d) {
    Jt(d, l, u);
  }), n;
}
function Jt(n, e, t) {
  const r = n.type;
  if (r === "Point" || r === "MultiPoint") return n;
  if (Ut(n, { mutate: !0 }), r !== "GeometryCollection")
    switch (r) {
      case "LineString":
        n.coordinates = Pe(
          n.coordinates,
          e,
          t
        );
        break;
      case "MultiLineString":
        n.coordinates = n.coordinates.map(
          (i) => Pe(i, e, t)
        );
        break;
      case "Polygon":
        n.coordinates = We(
          n.coordinates,
          e,
          t
        );
        break;
      case "MultiPolygon":
        n.coordinates = n.coordinates.map(
          (i) => We(i, e, t)
        );
    }
  return n;
}
function We(n, e, t) {
  return n.map(function(r) {
    if (r.length < 4)
      throw new Error("invalid polygon");
    let i = e, l = Pe(r, i, t);
    for (; !Qe(l) && i >= Number.EPSILON; )
      i -= i * 0.01, l = Pe(r, i, t);
    return Qe(l) ? ((l[l.length - 1][0] !== l[0][0] || l[l.length - 1][1] !== l[0][1]) && l.push(l[0]), l) : r;
  });
}
function Qe(n) {
  return n.length < 3 ? !1 : !(n.length === 3 && n[2][0] === n[0][0] && n[2][1] === n[0][1]);
}
class Le {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  static _nextPow2(e) {
    return e <= 0 ? 0 : (e = e - 1 >>> 0, e |= e >> 1, e |= e >> 2, e |= e >> 4, e |= e >> 8, e |= e >> 16, e + 1 >>> 0);
  }
  rent(e) {
    const t = Le._nextPow2(e || 1), r = this.map.get(t);
    return r && r.length ? r.pop() : new ArrayBuffer(t);
  }
  release(e) {
    if (!e || !e.byteLength) return;
    const t = Le._nextPow2(e.byteLength);
    let r = this.map.get(t);
    r || (r = [], this.map.set(t, r)), r.push(e);
  }
}
function Ht(n, e = {}) {
  const t = [], r = [], i = [], l = new TextEncoder(), u = [], c = /* @__PURE__ */ new Map();
  let d = 0, a = 0;
  const P = (T) => {
    Array.isArray(T) ? r.push(T[0] || 0, T[1] || 0) : T && typeof T.x == "number" && typeof T.y == "number" ? r.push(T.x, T.y) : r.push(0, 0);
  };
  for (const T of n) {
    const k = T.id == null ? "" : String(T.id), N = T.geometry || {}, v = N.type || "Unknown", _ = { id: k, type: v, coordsOffset: d, coordsLength: 0 };
    if (v === "Point") {
      const G = N.coordinates || [];
      P(G), _.coordsLength = 2;
    } else if (v === "LineString" || v === "MultiPoint") {
      const G = N.coordinates || [];
      for (const F of G) P(F);
      _.coordsLength = (G.length || 0) * 2;
    } else if (v === "Polygon") {
      const G = N.coordinates || [];
      _.ringLengths = [];
      for (const F of G) {
        _.ringLengths.push(F.length || 0);
        for (const s of F) P(s);
      }
      _.coordsLength = _.ringLengths.reduce((F, s) => F + s, 0) * 2;
    } else if (v === "MultiPolygon") {
      const G = N.coordinates || [];
      _.polygonRingCounts = [], _.ringLengths = [];
      for (const F of G) {
        _.polygonRingCounts.push(F.length || 0);
        for (const s of F) {
          _.ringLengths.push(s.length || 0);
          for (const o of s) P(o);
        }
      }
      _.coordsLength = _.ringLengths.reduce((F, s) => F + s, 0) * 2;
    } else
      _.coordsLength = 0;
    const $ = T.properties || {}, re = [];
    for (const G of Object.keys($)) {
      let F = c.get(G);
      F === void 0 && (F = u.length, u.push(G), c.set(G, F));
      const s = JSON.stringify($[G]), o = l.encode(s);
      i.push(o), re.push([F, a, o.length]), a += o.length;
    }
    _.props = re, d += _.coordsLength, t.push(_);
  }
  let S;
  if (e.propsBuffer)
    e.propsBuffer instanceof Uint8Array ? S = e.propsBuffer.subarray(0, a) : S = new Uint8Array(e.propsBuffer, 0, a), S.byteLength < a && (S = new Uint8Array(a));
  else if (e.pool) {
    const T = e.pool.rent(a || 1);
    S = new Uint8Array(T, 0, a);
  } else
    S = new Uint8Array(a);
  let M = 0;
  for (const T of i)
    S.set(T, M), M += T.length;
  const L = r.length;
  let O;
  if (e.coordsBuffer)
    e.coordsBuffer instanceof ArrayBuffer ? O = new Float32Array(e.coordsBuffer, 0, L) : e.coordsBuffer instanceof Float32Array ? O = e.coordsBuffer.subarray(0, L) : O = new Float32Array(L), O.length < L && (O = new Float32Array(L));
  else if (e.pool) {
    const T = e.pool.rent(L * 4 || 4);
    O = new Float32Array(T, 0, L);
  } else
    O = new Float32Array(L);
  return O.length > 0 && O.set(r), { meta: t, keys: u, propsBuffer: S, coordsArray: O };
}
function Zt(n, e, t, r) {
  const i = t instanceof Float32Array ? t : new Float32Array(t), l = e instanceof Uint8Array ? e : e ? new Uint8Array(e) : new Uint8Array(0), u = new TextDecoder(), c = [];
  for (let d = 0; d < (n.length || 0); d++) {
    const a = n[d] || {}, P = a.id, S = {};
    if (Array.isArray(a.props) && a.props.length && r && r.length)
      for (const k of a.props) {
        const [N, v, _] = k;
        try {
          const $ = l.subarray(v, v + _);
          S[r[N]] = JSON.parse(u.decode($));
        } catch {
        }
      }
    const M = a.type || "Unknown";
    let L = a.coordsOffset || 0;
    const O = L + (a.coordsLength || 0);
    let T = null;
    if (M === "Point")
      T = { type: "Point", coordinates: [i[L] || 0, i[L + 1] || 0] };
    else if (M === "LineString" || M === "MultiPoint") {
      const k = [];
      for (; L < O; L += 2) k.push([i[L], i[L + 1]]);
      T = { type: M, coordinates: k };
    } else if (M === "Polygon") {
      const k = [], N = a.ringLengths || [];
      for (const v of N) {
        const _ = [];
        for (let $ = 0; $ < v; $++)
          _.push([i[L], i[L + 1]]), L += 2;
        k.push(_);
      }
      T = { type: "Polygon", coordinates: k };
    } else if (M === "MultiPolygon") {
      const k = [], N = a.polygonRingCounts || [], v = a.ringLengths || [];
      let _ = 0;
      for (const $ of N) {
        const re = [];
        for (let G = 0; G < $; G++) {
          const F = v[_++] || 0, s = [];
          for (let o = 0; o < F; o++)
            s.push([i[L], i[L + 1]]), L += 2;
          re.push(s);
        }
        k.push(re);
      }
      T = { type: "MultiPolygon", coordinates: k };
    } else
      L < O && (T = { type: "Point", coordinates: [i[L], i[L + 1]] });
    c.push({ id: P, geometry: T, properties: S });
  }
  return c;
}
const Wt = new Le();
onmessage = (n) => {
  let e = n && n.data;
  if (e && e.type === "features" && e.payload)
    try {
      const d = e.payload instanceof Uint8Array ? e.payload.buffer : e.payload, a = new TextDecoder().decode(d);
      e = JSON.parse(a);
    } catch {
      e = {};
    }
  if (e && e.type === "features_bin" && e.coords)
    try {
      const d = e.meta || [], a = e.propsBuf !== void 0 ? e.propsBuf : null, P = e.coords, S = e.keys || [];
      e = { features: Zt(d, a, P, S), tolerance: e.tolerance, _receivedPropsBuf: a, _receivedCoordsBuf: P, _receivedKeys: S };
    } catch {
      e = e || {};
    }
  const t = e || {}, r = t.features || [], i = t.tolerance || 1e-5, l = !0, u = r.reduce((d, a) => {
    const P = a.id;
    return (d[P] = d[P] || []).push(a), d;
  }, {}), c = {
    type: "FeatureCollection",
    features: []
  };
  for (const [d, a] of Object.entries(u)) {
    const { clipped: P, ...S } = a[0] && a[0].properties || {};
    let M;
    if (a.length === 1) {
      const L = a[0].geometry;
      M = Ze({ type: "Feature", id: d, geometry: L, properties: S }, { tolerance: i, mutate: l });
      try {
        L.coordinates = Ye(L.coordinates, i), L.type = "Point";
      } catch {
      }
    } else {
      let L = {
        type: "FeatureCollection",
        features: a.map((O) => Ze({ type: "Feature", geometry: O.geometry }, { tolerance: i, mutate: l }))
      };
      try {
        a.some((O) => O.properties && O.properties.clipped) && (L = Ct(L)), L = Nt(L), L.features.forEach((O) => {
          try {
            O.geometry.coordinates = Ye(O.geometry.coordinates, i), O.geometry.type = "Point";
          } catch {
          }
          return O;
        }), L = _t(L), M = L && L.features && L.features[0] ? L.features[0] : { type: "Feature", id: d, geometry: a[0].geometry, properties: S };
      } catch {
        M = { type: "Feature", id: d, geometry: a[0].geometry, properties: S };
      }
      M.id = d, M.properties = S;
    }
    c.features.push(M);
  }
  try {
    const { meta: d, keys: a, propsBuffer: P, coordsArray: S } = Ht(c.features || [], { propsBuffer: e && e._receivedPropsBuf, coordsBuffer: e && e._receivedCoordsBuf, pool: Wt });
    postMessage({ type: "geojson_bin", meta: d, keys: a, propsBuf: P.buffer, coords: S.buffer }, [P.buffer, S.buffer]);
  } catch {
    try {
      const a = new TextEncoder(), P = JSON.stringify(c), S = a.encode(P);
      postMessage({ type: "geojson", payload: S.buffer }, [S.buffer]);
    } catch {
      postMessage(c);
    }
  }
};
`, cn = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", xn], { type: "text/javascript;charset=utf-8" });
function tt(i) {
  let n;
  try {
    if (n = cn && (self.URL || self.webkitURL).createObjectURL(cn), !n) throw "";
    const t = new Worker(n, {
      type: "module",
      name: i?.name
    });
    return t.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(n);
    }), t;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(xn),
      {
        type: "module",
        name: i?.name
      }
    );
  }
}
class z {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  static _nextPow2(n) {
    return n <= 0 ? 0 : (n = n - 1 >>> 0, n |= n >> 1, n |= n >> 2, n |= n >> 4, n |= n >> 8, n |= n >> 16, n + 1 >>> 0);
  }
  rent(n) {
    const t = z._nextPow2(n || 1), o = this.map.get(t);
    return o && o.length ? o.pop() : new ArrayBuffer(t);
  }
  release(n) {
    if (!n || !n.byteLength) return;
    const t = z._nextPow2(n.byteLength);
    let o = this.map.get(t);
    o || (o = [], this.map.set(t, o)), o.push(n);
  }
}
function et(i, n = {}) {
  const t = [], o = [], r = [], l = new TextEncoder(), a = [], c = /* @__PURE__ */ new Map();
  let p = 0, d = 0;
  const y = (x) => {
    Array.isArray(x) ? o.push(x[0] || 0, x[1] || 0) : x && typeof x.x == "number" && typeof x.y == "number" ? o.push(x.x, x.y) : o.push(0, 0);
  };
  for (const x of i) {
    const F = x.id == null ? "" : String(x.id), M = x.geometry || {}, T = M.type || "Unknown", b = { id: F, type: T, coordsOffset: p, coordsLength: 0 };
    if (T === "Point") {
      const S = M.coordinates || [];
      y(S), b.coordsLength = 2;
    } else if (T === "LineString" || T === "MultiPoint") {
      const S = M.coordinates || [];
      for (const P of S) y(P);
      b.coordsLength = (S.length || 0) * 2;
    } else if (T === "Polygon") {
      const S = M.coordinates || [];
      b.ringLengths = [];
      for (const P of S) {
        b.ringLengths.push(P.length || 0);
        for (const L of P) y(L);
      }
      b.coordsLength = b.ringLengths.reduce((P, L) => P + L, 0) * 2;
    } else if (T === "MultiPolygon") {
      const S = M.coordinates || [];
      b.polygonRingCounts = [], b.ringLengths = [];
      for (const P of S) {
        b.polygonRingCounts.push(P.length || 0);
        for (const L of P) {
          b.ringLengths.push(L.length || 0);
          for (const A of L) y(A);
        }
      }
      b.coordsLength = b.ringLengths.reduce((P, L) => P + L, 0) * 2;
    } else
      b.coordsLength = 0;
    const _ = x.properties || {}, V = [];
    for (const S of Object.keys(_)) {
      let P = c.get(S);
      P === void 0 && (P = a.length, a.push(S), c.set(S, P));
      const L = JSON.stringify(_[S]), A = l.encode(L);
      r.push(A), V.push([P, d, A.length]), d += A.length;
    }
    b.props = V, p += b.coordsLength, t.push(b);
  }
  let w;
  if (n.propsBuffer)
    n.propsBuffer instanceof Uint8Array ? w = n.propsBuffer.subarray(0, d) : w = new Uint8Array(n.propsBuffer, 0, d), w.byteLength < d && (w = new Uint8Array(d));
  else if (n.pool) {
    const x = n.pool.rent(d || 1);
    w = new Uint8Array(x, 0, d);
  } else
    w = new Uint8Array(d);
  let u = 0;
  for (const x of r)
    w.set(x, u), u += x.length;
  const f = o.length;
  let g;
  if (n.coordsBuffer)
    n.coordsBuffer instanceof ArrayBuffer ? g = new Float32Array(n.coordsBuffer, 0, f) : n.coordsBuffer instanceof Float32Array ? g = n.coordsBuffer.subarray(0, f) : g = new Float32Array(f), g.length < f && (g = new Float32Array(f));
  else if (n.pool) {
    const x = n.pool.rent(f * 4 || 4);
    g = new Float32Array(x, 0, f);
  } else
    g = new Float32Array(f);
  return g.length > 0 && g.set(o), { meta: t, keys: a, propsBuffer: w, coordsArray: g };
}
function it(i, n, t, o) {
  const r = t instanceof Float32Array ? t : new Float32Array(t), l = n instanceof Uint8Array ? n : n ? new Uint8Array(n) : new Uint8Array(0), a = new TextDecoder(), c = [];
  for (let p = 0; p < (i.length || 0); p++) {
    const d = i[p] || {}, y = d.id, w = {};
    if (Array.isArray(d.props) && d.props.length && o && o.length)
      for (const F of d.props) {
        const [M, T, b] = F;
        try {
          const _ = l.subarray(T, T + b);
          w[o[M]] = JSON.parse(a.decode(_));
        } catch {
        }
      }
    const u = d.type || "Unknown";
    let f = d.coordsOffset || 0;
    const g = f + (d.coordsLength || 0);
    let x = null;
    if (u === "Point")
      x = { type: "Point", coordinates: [r[f] || 0, r[f + 1] || 0] };
    else if (u === "LineString" || u === "MultiPoint") {
      const F = [];
      for (; f < g; f += 2) F.push([r[f], r[f + 1]]);
      x = { type: u, coordinates: F };
    } else if (u === "Polygon") {
      const F = [], M = d.ringLengths || [];
      for (const T of M) {
        const b = [];
        for (let _ = 0; _ < T; _++)
          b.push([r[f], r[f + 1]]), f += 2;
        F.push(b);
      }
      x = { type: "Polygon", coordinates: F };
    } else if (u === "MultiPolygon") {
      const F = [], M = d.polygonRingCounts || [], T = d.ringLengths || [];
      let b = 0;
      for (const _ of M) {
        const V = [];
        for (let S = 0; S < _; S++) {
          const P = T[b++] || 0, L = [];
          for (let A = 0; A < P; A++)
            L.push([r[f], r[f + 1]]), f += 2;
          V.push(L);
        }
        F.push(V);
      }
      x = { type: "MultiPolygon", coordinates: F };
    } else
      f < g && (x = { type: "Point", coordinates: [r[f], r[f + 1]] });
    c.push({ id: y, geometry: x, properties: w });
  }
  return c;
}
class rt {
  constructor(n) {
    return this.map = n.map, this.source = n.source instanceof maplibregl.VectorTileSource ? n.source : this.map.getSource(n.source), this.sourceLayer = n.sourceLayer, this.fid = n.fid || "id", this.tiles = this.source.tiles.map((t) => t.split("{z}")[0]), this.tileSize = this.source.tileSize || 512, this.tolerance = n.tolerance || 1e-5, this.minion = new tt(), this._abPool = new z(), this.minion.onmessage = (t) => {
      const o = t && t.data;
      if (o)
        if (o.type === "geojson_bin" && o.coords)
          try {
            const r = o.coords instanceof Uint8Array ? o.coords.buffer : o.coords, l = o.propsBuf !== void 0 ? o.propsBuf : null, a = it(o.meta || [], l, r, o.keys || []);
            this.gjsource.setData({ type: "FeatureCollection", features: a });
            try {
              l && this._abPool.release(l instanceof ArrayBuffer ? l : l.buffer);
            } catch {
            }
            try {
              r && this._abPool.release(r instanceof ArrayBuffer ? r : r.buffer);
            } catch {
            }
          } catch (r) {
            console.warn("Failed to decode binary worker response", r);
          }
        else if (o.type === "geojson" && o.payload)
          try {
            const r = o.payload instanceof Uint8Array ? o.payload.buffer : o.payload, l = new TextDecoder().decode(r), a = JSON.parse(l);
            this.gjsource.setData(a);
          } catch (r) {
            console.warn("Failed to decode worker response", r);
          }
        else
          try {
            this.gjsource.setData(o);
          } catch (r) {
            console.warn("Failed to set worker data", r);
          }
    }, this.map.addSource(this.source.id + "-proper", {
      type: "geojson",
      maxzoom: this.source.maxzoom,
      promoteId: this.fid,
      data: {}
    }), this.gjsource = this.map.getSource(this.source.id + "-proper"), maplibregl.addProtocol("proper", this._protocol), this.map.setTransformRequest((t, o) => this.tiles.some((l) => t.startsWith(l)) && o === "Tile" ? { url: "proper://" + t } : { url: t }), this._pendingPost = null, this._postTimer = null, this._postDelay = n.postDelay || 100, this.map.on("sourcedata", (t) => {
      if (t.sourceId === this.source.id && t.isSourceLoaded) {
        const o = this.map.querySourceFeatures(this.source.id, { sourceLayer: this.sourceLayer }), r = t.tile.tileID.canonical.z, l = this.tolerance * Math.pow(10, -0.301 * r + 5.19), a = {
          features: o.map((c) => ({ id: c.id, geometry: c.geometry, properties: c.properties })),
          tolerance: l
        };
        this._pendingPost = a, this._postTimer == null && (this._postTimer = setTimeout(() => {
          try {
            if (this._pendingPost)
              try {
                const { meta: c, keys: p, propsBuffer: d, coordsArray: y } = et(this._pendingPost.features || [], { pool: this._abPool });
                this.minion.postMessage({ type: "features_bin", meta: c, keys: p, propsBuf: d.buffer, tolerance: this._pendingPost.tolerance, coords: y.buffer }, [d.buffer, y.buffer]);
              } catch {
                try {
                  const p = new TextEncoder(), d = JSON.stringify(this._pendingPost), y = p.encode(d);
                  this.minion.postMessage({ type: "features", payload: y.buffer }, [y.buffer]);
                } catch {
                  this.minion.postMessage(this._pendingPost);
                }
              }
          } finally {
            this._pendingPost = null, this._postTimer = null;
          }
        }, this._postDelay));
      }
    }), this.map.refreshTiles(this.source.id), this.gjsource;
  }
  _protocol = async (n) => {
    const o = n.url.replace("proper://", ""), r = n.url.split(/\/|\./i);
    if (r === null || r.length < 4)
      return console.warn(`Malformed URL: ${n.url}`), { data: null };
    const l = await fetch(o);
    if (!l.ok)
      return console.warn(`Failed to fetch tile: ${l.statusText}`), { data: null };
    const a = r.length, [c, p, d] = r.slice(a - 4, a - 1).map((x) => x * 1), y = await l.arrayBuffer(), w = new zn(new bn(y)), u = {
      layers: Object.entries(w.layers).reduce((x, [F, M]) => ({
        ...x,
        [F]: {
          ...M,
          feature: (T) => {
            const b = M.feature(T), V = b.loadGeometry().flat(1 / 0).some(
              (S) => S.x >= M.extent - 1 || S.y >= M.extent - 1 || S.x <= 1 || S.y <= 1
            );
            return b.properties.clipped = V, b;
          }
        }
      }), {})
    };
    return { data: nt(u).buffer };
  };
}
maplibregl.VectorTileSource.prototype.ProperLabels = function(i) {
  return this._proper || (this._proper = new rt({
    map: this._map,
    source: this
  })), this._proper;
};
export {
  rt as default
};
