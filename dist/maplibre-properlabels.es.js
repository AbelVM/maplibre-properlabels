const Mn = 23283064365386963e-26, pt = 12, kn = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8"), dn = 0, hn = 1, rn = 2, fn = 5;
class yt {
  /**
   * @param {Uint8Array | ArrayBuffer} [buf]
   */
  constructor(t = new Uint8Array(16)) {
    this.buf = ArrayBuffer.isView(t) ? t : new Uint8Array(t), this.dataView = new DataView(this.buf.buffer), this.pos = 0, this.type = 0, this.length = this.buf.length;
  }
  // === READING =================================================================
  /**
   * @template T
   * @param {(tag: number, result: T, pbf: Pbf) => void} readField
   * @param {T} result
   * @param {number} [end]
   */
  readFields(t, r, a = this.length) {
    for (; this.pos < a; ) {
      const f = this.readVarint(), y = f >> 3, p = this.pos;
      this.type = f & 7, t(y, r, this), this.pos === p && this.skip(f);
    }
    return r;
  }
  /**
   * @template T
   * @param {(tag: number, result: T, pbf: Pbf) => void} readField
   * @param {T} result
   */
  readMessage(t, r) {
    return this.readFields(t, r, this.readVarint() + this.pos);
  }
  readFixed32() {
    const t = this.dataView.getUint32(this.pos, !0);
    return this.pos += 4, t;
  }
  readSFixed32() {
    const t = this.dataView.getInt32(this.pos, !0);
    return this.pos += 4, t;
  }
  // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
  readFixed64() {
    const t = this.dataView.getUint32(this.pos, !0) + this.dataView.getUint32(this.pos + 4, !0) * 4294967296;
    return this.pos += 8, t;
  }
  readSFixed64() {
    const t = this.dataView.getUint32(this.pos, !0) + this.dataView.getInt32(this.pos + 4, !0) * 4294967296;
    return this.pos += 8, t;
  }
  readFloat() {
    const t = this.dataView.getFloat32(this.pos, !0);
    return this.pos += 4, t;
  }
  readDouble() {
    const t = this.dataView.getFloat64(this.pos, !0);
    return this.pos += 8, t;
  }
  /**
   * @param {boolean} [isSigned]
   */
  readVarint(t) {
    const r = this.buf;
    let a, f;
    return f = r[this.pos++], a = f & 127, f < 128 || (f = r[this.pos++], a |= (f & 127) << 7, f < 128) || (f = r[this.pos++], a |= (f & 127) << 14, f < 128) || (f = r[this.pos++], a |= (f & 127) << 21, f < 128) ? a : (f = r[this.pos], a |= (f & 15) << 28, gt(a, t, this));
  }
  readVarint64() {
    return this.readVarint(!0);
  }
  readSVarint() {
    const t = this.readVarint();
    return t % 2 === 1 ? (t + 1) / -2 : t / 2;
  }
  readBoolean() {
    return !!this.readVarint();
  }
  readString() {
    const t = this.readVarint() + this.pos, r = this.pos;
    return this.pos = t, t - r >= pt && kn ? kn.decode(this.buf.subarray(r, t)) : At(this.buf, r, t);
  }
  readBytes() {
    const t = this.readVarint() + this.pos, r = this.buf.subarray(this.pos, t);
    return this.pos = t, r;
  }
  // verbose for performance reasons; doesn't affect gzipped size
  /**
   * @param {number[]} [arr]
   * @param {boolean} [isSigned]
   */
  readPackedVarint(t = [], r) {
    const a = this.readPackedEnd();
    for (; this.pos < a; ) t.push(this.readVarint(r));
    return t;
  }
  /** @param {number[]} [arr] */
  readPackedSVarint(t = []) {
    const r = this.readPackedEnd();
    for (; this.pos < r; ) t.push(this.readSVarint());
    return t;
  }
  /** @param {boolean[]} [arr] */
  readPackedBoolean(t = []) {
    const r = this.readPackedEnd();
    for (; this.pos < r; ) t.push(this.readBoolean());
    return t;
  }
  /** @param {number[]} [arr] */
  readPackedFloat(t = []) {
    const r = this.readPackedEnd();
    for (; this.pos < r; ) t.push(this.readFloat());
    return t;
  }
  /** @param {number[]} [arr] */
  readPackedDouble(t = []) {
    const r = this.readPackedEnd();
    for (; this.pos < r; ) t.push(this.readDouble());
    return t;
  }
  /** @param {number[]} [arr] */
  readPackedFixed32(t = []) {
    const r = this.readPackedEnd();
    for (; this.pos < r; ) t.push(this.readFixed32());
    return t;
  }
  /** @param {number[]} [arr] */
  readPackedSFixed32(t = []) {
    const r = this.readPackedEnd();
    for (; this.pos < r; ) t.push(this.readSFixed32());
    return t;
  }
  /** @param {number[]} [arr] */
  readPackedFixed64(t = []) {
    const r = this.readPackedEnd();
    for (; this.pos < r; ) t.push(this.readFixed64());
    return t;
  }
  /** @param {number[]} [arr] */
  readPackedSFixed64(t = []) {
    const r = this.readPackedEnd();
    for (; this.pos < r; ) t.push(this.readSFixed64());
    return t;
  }
  readPackedEnd() {
    return this.type === rn ? this.readVarint() + this.pos : this.pos + 1;
  }
  /** @param {number} val */
  skip(t) {
    const r = t & 7;
    if (r === dn) for (; this.buf[this.pos++] > 127; )
      ;
    else if (r === rn) this.pos = this.readVarint() + this.pos;
    else if (r === fn) this.pos += 4;
    else if (r === hn) this.pos += 8;
    else throw new Error(`Unimplemented type: ${r}`);
  }
  // === WRITING =================================================================
  /**
   * @param {number} tag
   * @param {number} type
   */
  writeTag(t, r) {
    this.writeVarint(t << 3 | r);
  }
  /** @param {number} min */
  realloc(t) {
    let r = this.length || 16;
    for (; r < this.pos + t; ) r *= 2;
    if (r !== this.length) {
      const a = new Uint8Array(r);
      a.set(this.buf), this.buf = a, this.dataView = new DataView(a.buffer), this.length = r;
    }
  }
  finish() {
    return this.length = this.pos, this.pos = 0, this.buf.subarray(0, this.length);
  }
  /** @param {number} val */
  writeFixed32(t) {
    this.realloc(4), this.dataView.setInt32(this.pos, t, !0), this.pos += 4;
  }
  /** @param {number} val */
  writeSFixed32(t) {
    this.realloc(4), this.dataView.setInt32(this.pos, t, !0), this.pos += 4;
  }
  /** @param {number} val */
  writeFixed64(t) {
    this.realloc(8), this.dataView.setInt32(this.pos, t & -1, !0), this.dataView.setInt32(this.pos + 4, Math.floor(t * Mn), !0), this.pos += 8;
  }
  /** @param {number} val */
  writeSFixed64(t) {
    this.realloc(8), this.dataView.setInt32(this.pos, t & -1, !0), this.dataView.setInt32(this.pos + 4, Math.floor(t * Mn), !0), this.pos += 8;
  }
  /** @param {number} val */
  writeVarint(t) {
    if (t = +t || 0, t > 268435455 || t < 0) {
      dt(t, this);
      return;
    }
    this.realloc(4), this.buf[this.pos++] = t & 127 | (t > 127 ? 128 : 0), !(t <= 127) && (this.buf[this.pos++] = (t >>>= 7) & 127 | (t > 127 ? 128 : 0), !(t <= 127) && (this.buf[this.pos++] = (t >>>= 7) & 127 | (t > 127 ? 128 : 0), !(t <= 127) && (this.buf[this.pos++] = t >>> 7 & 127)));
  }
  /** @param {number} val */
  writeSVarint(t) {
    this.writeVarint(t < 0 ? -t * 2 - 1 : t * 2);
  }
  /** @param {boolean} val */
  writeBoolean(t) {
    this.writeVarint(+t);
  }
  /** @param {string} str */
  writeString(t) {
    t = String(t), this.realloc(t.length * 4), this.pos++;
    const r = this.pos;
    this.pos = Tt(this.buf, t, this.pos);
    const a = this.pos - r;
    a >= 128 && Ln(r, a, this), this.pos = r - 1, this.writeVarint(a), this.pos += a;
  }
  /** @param {number} val */
  writeFloat(t) {
    this.realloc(4), this.dataView.setFloat32(this.pos, t, !0), this.pos += 4;
  }
  /** @param {number} val */
  writeDouble(t) {
    this.realloc(8), this.dataView.setFloat64(this.pos, t, !0), this.pos += 8;
  }
  /** @param {Uint8Array} buffer */
  writeBytes(t) {
    const r = t.length;
    this.writeVarint(r), this.realloc(r);
    for (let a = 0; a < r; a++) this.buf[this.pos++] = t[a];
  }
  /**
   * @template T
   * @param {(obj: T, pbf: Pbf) => void} fn
   * @param {T} obj
   */
  writeRawMessage(t, r) {
    this.pos++;
    const a = this.pos;
    t(r, this);
    const f = this.pos - a;
    f >= 128 && Ln(a, f, this), this.pos = a - 1, this.writeVarint(f), this.pos += f;
  }
  /**
   * @template T
   * @param {number} tag
   * @param {(obj: T, pbf: Pbf) => void} fn
   * @param {T} obj
   */
  writeMessage(t, r, a) {
    this.writeTag(t, rn), this.writeRawMessage(r, a);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedVarint(t, r) {
    r.length && this.writeMessage(t, mt, r);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSVarint(t, r) {
    r.length && this.writeMessage(t, Et, r);
  }
  /**
   * @param {number} tag
   * @param {boolean[]} arr
   */
  writePackedBoolean(t, r) {
    r.length && this.writeMessage(t, vt, r);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFloat(t, r) {
    r.length && this.writeMessage(t, bt, r);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedDouble(t, r) {
    r.length && this.writeMessage(t, Bt, r);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFixed32(t, r) {
    r.length && this.writeMessage(t, It, r);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSFixed32(t, r) {
    r.length && this.writeMessage(t, St, r);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedFixed64(t, r) {
    r.length && this.writeMessage(t, Ft, r);
  }
  /**
   * @param {number} tag
   * @param {number[]} arr
   */
  writePackedSFixed64(t, r) {
    r.length && this.writeMessage(t, _t, r);
  }
  /**
   * @param {number} tag
   * @param {Uint8Array} buffer
   */
  writeBytesField(t, r) {
    this.writeTag(t, rn), this.writeBytes(r);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFixed32Field(t, r) {
    this.writeTag(t, fn), this.writeFixed32(r);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSFixed32Field(t, r) {
    this.writeTag(t, fn), this.writeSFixed32(r);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFixed64Field(t, r) {
    this.writeTag(t, hn), this.writeFixed64(r);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSFixed64Field(t, r) {
    this.writeTag(t, hn), this.writeSFixed64(r);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeVarintField(t, r) {
    this.writeTag(t, dn), this.writeVarint(r);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeSVarintField(t, r) {
    this.writeTag(t, dn), this.writeSVarint(r);
  }
  /**
   * @param {number} tag
   * @param {string} str
   */
  writeStringField(t, r) {
    this.writeTag(t, rn), this.writeString(r);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeFloatField(t, r) {
    this.writeTag(t, fn), this.writeFloat(r);
  }
  /**
   * @param {number} tag
   * @param {number} val
   */
  writeDoubleField(t, r) {
    this.writeTag(t, hn), this.writeDouble(r);
  }
  /**
   * @param {number} tag
   * @param {boolean} val
   */
  writeBooleanField(t, r) {
    this.writeVarintField(t, +r);
  }
}
function gt(s, t, r) {
  const a = r.buf;
  let f, y;
  if (y = a[r.pos++], f = (y & 112) >> 4, y < 128 || (y = a[r.pos++], f |= (y & 127) << 3, y < 128) || (y = a[r.pos++], f |= (y & 127) << 10, y < 128) || (y = a[r.pos++], f |= (y & 127) << 17, y < 128) || (y = a[r.pos++], f |= (y & 127) << 24, y < 128) || (y = a[r.pos++], f |= (y & 1) << 31, y < 128)) return nn(s, f, t);
  throw new Error("Expected varint not more than 10 bytes");
}
function nn(s, t, r) {
  return r ? t * 4294967296 + (s >>> 0) : (t >>> 0) * 4294967296 + (s >>> 0);
}
function dt(s, t) {
  let r, a;
  if (s >= 0 ? (r = s % 4294967296 | 0, a = s / 4294967296 | 0) : (r = ~(-s % 4294967296), a = ~(-s / 4294967296), r ^ 4294967295 ? r = r + 1 | 0 : (r = 0, a = a + 1 | 0)), s >= 18446744073709552e3 || s < -18446744073709552e3)
    throw new Error("Given varint doesn't fit into 10 bytes");
  t.realloc(10), wt(r, a, t), xt(a, t);
}
function wt(s, t, r) {
  r.buf[r.pos++] = s & 127 | 128, s >>>= 7, r.buf[r.pos++] = s & 127 | 128, s >>>= 7, r.buf[r.pos++] = s & 127 | 128, s >>>= 7, r.buf[r.pos++] = s & 127 | 128, s >>>= 7, r.buf[r.pos] = s & 127;
}
function xt(s, t) {
  const r = (s & 7) << 4;
  t.buf[t.pos++] |= r | ((s >>>= 3) ? 128 : 0), s && (t.buf[t.pos++] = s & 127 | ((s >>>= 7) ? 128 : 0), s && (t.buf[t.pos++] = s & 127 | ((s >>>= 7) ? 128 : 0), s && (t.buf[t.pos++] = s & 127 | ((s >>>= 7) ? 128 : 0), s && (t.buf[t.pos++] = s & 127 | ((s >>>= 7) ? 128 : 0), s && (t.buf[t.pos++] = s & 127)))));
}
function Ln(s, t, r) {
  const a = t <= 16383 ? 1 : t <= 2097151 ? 2 : t <= 268435455 ? 3 : Math.floor(Math.log(t) / (Math.LN2 * 7));
  r.realloc(a);
  for (let f = r.pos - 1; f >= s; f--) r.buf[f + a] = r.buf[f];
}
function mt(s, t) {
  for (let r = 0; r < s.length; r++) t.writeVarint(s[r]);
}
function Et(s, t) {
  for (let r = 0; r < s.length; r++) t.writeSVarint(s[r]);
}
function bt(s, t) {
  for (let r = 0; r < s.length; r++) t.writeFloat(s[r]);
}
function Bt(s, t) {
  for (let r = 0; r < s.length; r++) t.writeDouble(s[r]);
}
function vt(s, t) {
  for (let r = 0; r < s.length; r++) t.writeBoolean(s[r]);
}
function It(s, t) {
  for (let r = 0; r < s.length; r++) t.writeFixed32(s[r]);
}
function St(s, t) {
  for (let r = 0; r < s.length; r++) t.writeSFixed32(s[r]);
}
function Ft(s, t) {
  for (let r = 0; r < s.length; r++) t.writeFixed64(s[r]);
}
function _t(s, t) {
  for (let r = 0; r < s.length; r++) t.writeSFixed64(s[r]);
}
function At(s, t, r) {
  let a = "", f = t;
  for (; f < r; ) {
    const y = s[f];
    let p = null, h = y > 239 ? 4 : y > 223 ? 3 : y > 191 ? 2 : 1;
    if (f + h > r) break;
    let b, B, v;
    h === 1 ? y < 128 && (p = y) : h === 2 ? (b = s[f + 1], (b & 192) === 128 && (p = (y & 31) << 6 | b & 63, p <= 127 && (p = null))) : h === 3 ? (b = s[f + 1], B = s[f + 2], (b & 192) === 128 && (B & 192) === 128 && (p = (y & 15) << 12 | (b & 63) << 6 | B & 63, (p <= 2047 || p >= 55296 && p <= 57343) && (p = null))) : h === 4 && (b = s[f + 1], B = s[f + 2], v = s[f + 3], (b & 192) === 128 && (B & 192) === 128 && (v & 192) === 128 && (p = (y & 15) << 18 | (b & 63) << 12 | (B & 63) << 6 | v & 63, (p <= 65535 || p >= 1114112) && (p = null))), p === null ? (p = 65533, h = 1) : p > 65535 && (p -= 65536, a += String.fromCharCode(p >>> 10 & 1023 | 55296), p = 56320 | p & 1023), a += String.fromCharCode(p), f += h;
  }
  return a;
}
function Tt(s, t, r) {
  for (let a = 0, f, y; a < t.length; a++) {
    if (f = t.charCodeAt(a), f > 55295 && f < 57344)
      if (y)
        if (f < 56320) {
          s[r++] = 239, s[r++] = 191, s[r++] = 189, y = f;
          continue;
        } else
          f = y - 55296 << 10 | f - 56320 | 65536, y = null;
      else {
        f > 56319 || a + 1 === t.length ? (s[r++] = 239, s[r++] = 191, s[r++] = 189) : y = f;
        continue;
      }
    else y && (s[r++] = 239, s[r++] = 191, s[r++] = 189, y = null);
    f < 128 ? s[r++] = f : (f < 2048 ? s[r++] = f >> 6 | 192 : (f < 65536 ? s[r++] = f >> 12 | 224 : (s[r++] = f >> 18 | 240, s[r++] = f >> 12 & 63 | 128), s[r++] = f >> 6 & 63 | 128), s[r++] = f & 63 | 128);
  }
  return r;
}
function H(s, t) {
  this.x = s, this.y = t;
}
H.prototype = {
  /**
   * Clone this point, returning a new point that can be modified
   * without affecting the old one.
   * @return {Point} the clone
   */
  clone() {
    return new H(this.x, this.y);
  },
  /**
   * Add this point's x & y coordinates to another point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  add(s) {
    return this.clone()._add(s);
  },
  /**
   * Subtract this point's x & y coordinates to from point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  sub(s) {
    return this.clone()._sub(s);
  },
  /**
   * Multiply this point's x & y coordinates by point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  multByPoint(s) {
    return this.clone()._multByPoint(s);
  },
  /**
   * Divide this point's x & y coordinates by point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  divByPoint(s) {
    return this.clone()._divByPoint(s);
  },
  /**
   * Multiply this point's x & y coordinates by a factor,
   * yielding a new point.
   * @param {number} k factor
   * @return {Point} output point
   */
  mult(s) {
    return this.clone()._mult(s);
  },
  /**
   * Divide this point's x & y coordinates by a factor,
   * yielding a new point.
   * @param {number} k factor
   * @return {Point} output point
   */
  div(s) {
    return this.clone()._div(s);
  },
  /**
   * Rotate this point around the 0, 0 origin by an angle a,
   * given in radians
   * @param {number} a angle to rotate around, in radians
   * @return {Point} output point
   */
  rotate(s) {
    return this.clone()._rotate(s);
  },
  /**
   * Rotate this point around p point by an angle a,
   * given in radians
   * @param {number} a angle to rotate around, in radians
   * @param {Point} p Point to rotate around
   * @return {Point} output point
   */
  rotateAround(s, t) {
    return this.clone()._rotateAround(s, t);
  },
  /**
   * Multiply this point by a 4x1 transformation matrix
   * @param {[number, number, number, number]} m transformation matrix
   * @return {Point} output point
   */
  matMult(s) {
    return this.clone()._matMult(s);
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
  equals(s) {
    return this.x === s.x && this.y === s.y;
  },
  /**
   * Calculate the distance from this point to another point
   * @param {Point} p the other point
   * @return {number} distance
   */
  dist(s) {
    return Math.sqrt(this.distSqr(s));
  },
  /**
   * Calculate the distance from this point to another point,
   * without the square root step. Useful if you're comparing
   * relative distances.
   * @param {Point} p the other point
   * @return {number} distance
   */
  distSqr(s) {
    const t = s.x - this.x, r = s.y - this.y;
    return t * t + r * r;
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
  angleTo(s) {
    return Math.atan2(this.y - s.y, this.x - s.x);
  },
  /**
   * Get the angle between this point and another point, in radians
   * @param {Point} b the other point
   * @return {number} angle
   */
  angleWith(s) {
    return this.angleWithSep(s.x, s.y);
  },
  /**
   * Find the angle of the two vectors, solving the formula for
   * the cross product a x b = |a||b|sin(θ) for θ.
   * @param {number} x the x-coordinate
   * @param {number} y the y-coordinate
   * @return {number} the angle in radians
   */
  angleWithSep(s, t) {
    return Math.atan2(
      this.x * t - this.y * s,
      this.x * s + this.y * t
    );
  },
  /** @param {[number, number, number, number]} m */
  _matMult(s) {
    const t = s[0] * this.x + s[1] * this.y, r = s[2] * this.x + s[3] * this.y;
    return this.x = t, this.y = r, this;
  },
  /** @param {Point} p */
  _add(s) {
    return this.x += s.x, this.y += s.y, this;
  },
  /** @param {Point} p */
  _sub(s) {
    return this.x -= s.x, this.y -= s.y, this;
  },
  /** @param {number} k */
  _mult(s) {
    return this.x *= s, this.y *= s, this;
  },
  /** @param {number} k */
  _div(s) {
    return this.x /= s, this.y /= s, this;
  },
  /** @param {Point} p */
  _multByPoint(s) {
    return this.x *= s.x, this.y *= s.y, this;
  },
  /** @param {Point} p */
  _divByPoint(s) {
    return this.x /= s.x, this.y /= s.y, this;
  },
  _unit() {
    return this._div(this.mag()), this;
  },
  _perp() {
    const s = this.y;
    return this.y = this.x, this.x = -s, this;
  },
  /** @param {number} angle */
  _rotate(s) {
    const t = Math.cos(s), r = Math.sin(s), a = t * this.x - r * this.y, f = r * this.x + t * this.y;
    return this.x = a, this.y = f, this;
  },
  /**
   * @param {number} angle
   * @param {Point} p
   */
  _rotateAround(s, t) {
    const r = Math.cos(s), a = Math.sin(s), f = t.x + r * (this.x - t.x) - a * (this.y - t.y), y = t.y + a * (this.x - t.x) + r * (this.y - t.y);
    return this.x = f, this.y = y, this;
  },
  _round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  },
  constructor: H
};
H.convert = function(s) {
  if (s instanceof H)
    return (
      /** @type {Point} */
      s
    );
  if (Array.isArray(s))
    return new H(+s[0], +s[1]);
  if (s.x !== void 0 && s.y !== void 0)
    return new H(+s.x, +s.y);
  throw new Error("Expected [x, y] or {x, y} point format");
};
class Zn {
  /**
   * @param {Pbf} pbf
   * @param {number} end
   * @param {number} extent
   * @param {string[]} keys
   * @param {(number | string | boolean)[]} values
   */
  constructor(t, r, a, f, y) {
    this.properties = {}, this.extent = a, this.type = 0, this.id = void 0, this._pbf = t, this._geometry = -1, this._keys = f, this._values = y, t.readFields(Pt, this, r);
  }
  loadGeometry() {
    const t = this._pbf;
    t.pos = this._geometry;
    const r = t.readVarint() + t.pos, a = [];
    let f, y = 1, p = 0, h = 0, b = 0;
    for (; t.pos < r; ) {
      if (p <= 0) {
        const B = t.readVarint();
        y = B & 7, p = B >> 3;
      }
      if (p--, y === 1 || y === 2)
        h += t.readSVarint(), b += t.readSVarint(), y === 1 && (f && a.push(f), f = []), f && f.push(new H(h, b));
      else if (y === 7)
        f && f.push(f[0].clone());
      else
        throw new Error(`unknown command ${y}`);
    }
    return f && a.push(f), a;
  }
  bbox() {
    const t = this._pbf;
    t.pos = this._geometry;
    const r = t.readVarint() + t.pos;
    let a = 1, f = 0, y = 0, p = 0, h = 1 / 0, b = -1 / 0, B = 1 / 0, v = -1 / 0;
    for (; t.pos < r; ) {
      if (f <= 0) {
        const S = t.readVarint();
        a = S & 7, f = S >> 3;
      }
      if (f--, a === 1 || a === 2)
        y += t.readSVarint(), p += t.readSVarint(), y < h && (h = y), y > b && (b = y), p < B && (B = p), p > v && (v = p);
      else if (a !== 7)
        throw new Error(`unknown command ${a}`);
    }
    return [h, B, b, v];
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @return {Feature}
   */
  toGeoJSON(t, r, a) {
    const f = this.extent * Math.pow(2, a), y = this.extent * t, p = this.extent * r, h = this.loadGeometry();
    function b(x) {
      return [
        (x.x + y) * 360 / f - 180,
        360 / Math.PI * Math.atan(Math.exp((1 - (x.y + p) * 2 / f) * Math.PI)) - 90
      ];
    }
    function B(x) {
      return x.map(b);
    }
    let v;
    if (this.type === 1) {
      const x = [];
      for (const E of h)
        x.push(E[0]);
      const w = B(x);
      v = x.length === 1 ? { type: "Point", coordinates: w[0] } : { type: "MultiPoint", coordinates: w };
    } else if (this.type === 2) {
      const x = h.map(B);
      v = x.length === 1 ? { type: "LineString", coordinates: x[0] } : { type: "MultiLineString", coordinates: x };
    } else if (this.type === 3) {
      const x = Mt(h), w = [];
      for (const E of x)
        w.push(E.map(B));
      v = w.length === 1 ? { type: "Polygon", coordinates: w[0] } : { type: "MultiPolygon", coordinates: w };
    } else
      throw new Error("unknown feature type");
    const S = {
      type: "Feature",
      geometry: v,
      properties: this.properties
    };
    return this.id != null && (S.id = this.id), S;
  }
}
Zn.types = ["Unknown", "Point", "LineString", "Polygon"];
function Pt(s, t, r) {
  s === 1 ? t.id = r.readVarint() : s === 2 ? Rt(r, t) : s === 3 ? t.type = /** @type {0 | 1 | 2 | 3} */
  r.readVarint() : s === 4 && (t._geometry = r.pos);
}
function Rt(s, t) {
  const r = s.readVarint() + s.pos;
  for (; s.pos < r; ) {
    const a = t._keys[s.readVarint()], f = t._values[s.readVarint()];
    t.properties[a] = f;
  }
}
function Mt(s) {
  const t = s.length;
  if (t <= 1) return [s];
  const r = [];
  let a, f;
  for (let y = 0; y < t; y++) {
    const p = kt(s[y]);
    p !== 0 && (f === void 0 && (f = p < 0), f === p < 0 ? (a && r.push(a), a = [s[y]]) : a && a.push(s[y]));
  }
  return a && r.push(a), r;
}
function kt(s) {
  let t = 0;
  for (let r = 0, a = s.length, f = a - 1, y, p; r < a; f = r++)
    y = s[r], p = s[f], t += (p.x - y.x) * (y.y + p.y);
  return t;
}
class Lt {
  /**
   * @param {Pbf} pbf
   * @param {number} [end]
   */
  constructor(t, r) {
    this.version = 1, this.name = "", this.extent = 4096, this.length = 0, this._pbf = t, this._keys = [], this._values = [], this._features = [], t.readFields(Ut, this, r), this.length = this._features.length;
  }
  /** return feature `i` from this layer as a `VectorTileFeature`
   * @param {number} i
   */
  feature(t) {
    if (t < 0 || t >= this._features.length) throw new Error("feature index out of bounds");
    this._pbf.pos = this._features[t];
    const r = this._pbf.readVarint() + this._pbf.pos;
    return new Zn(this._pbf, r, this.extent, this._keys, this._values);
  }
}
function Ut(s, t, r) {
  s === 15 ? t.version = r.readVarint() : s === 1 ? t.name = r.readString() : s === 5 ? t.extent = r.readVarint() : s === 2 ? t._features.push(r.pos) : s === 3 ? t._keys.push(r.readString()) : s === 4 && t._values.push(Ct(r));
}
function Ct(s) {
  let t = null;
  const r = s.readVarint() + s.pos;
  for (; s.pos < r; ) {
    const a = s.readVarint() >> 3;
    t = a === 1 ? s.readString() : a === 2 ? s.readFloat() : a === 3 ? s.readDouble() : a === 4 ? s.readVarint64() : a === 5 ? s.readVarint() : a === 6 ? s.readSVarint() : a === 7 ? s.readBoolean() : null;
  }
  if (t == null)
    throw new Error("unknown feature value");
  return t;
}
class Ot {
  /**
   * @param {Pbf} pbf
   * @param {number} [end]
   */
  constructor(t, r) {
    this.layers = t.readFields(Nt, {}, r);
  }
}
function Nt(s, t, r) {
  if (s === 3) {
    const a = new Lt(r, r.readVarint() + r.pos);
    a.length && (t[a.name] = a);
  }
}
function Vt(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var tn = { exports: {} }, an = {};
var Un;
function Qn() {
  return Un || (Un = 1, an.read = function(s, t, r, a, f) {
    var y, p, h = f * 8 - a - 1, b = (1 << h) - 1, B = b >> 1, v = -7, S = r ? f - 1 : 0, x = r ? -1 : 1, w = s[t + S];
    for (S += x, y = w & (1 << -v) - 1, w >>= -v, v += h; v > 0; y = y * 256 + s[t + S], S += x, v -= 8)
      ;
    for (p = y & (1 << -v) - 1, y >>= -v, v += a; v > 0; p = p * 256 + s[t + S], S += x, v -= 8)
      ;
    if (y === 0)
      y = 1 - B;
    else {
      if (y === b)
        return p ? NaN : (w ? -1 : 1) * (1 / 0);
      p = p + Math.pow(2, a), y = y - B;
    }
    return (w ? -1 : 1) * p * Math.pow(2, y - a);
  }, an.write = function(s, t, r, a, f, y) {
    var p, h, b, B = y * 8 - f - 1, v = (1 << B) - 1, S = v >> 1, x = f === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, w = a ? 0 : y - 1, E = a ? 1 : -1, I = t < 0 || t === 0 && 1 / t < 0 ? 1 : 0;
    for (t = Math.abs(t), isNaN(t) || t === 1 / 0 ? (h = isNaN(t) ? 1 : 0, p = v) : (p = Math.floor(Math.log(t) / Math.LN2), t * (b = Math.pow(2, -p)) < 1 && (p--, b *= 2), p + S >= 1 ? t += x / b : t += x * Math.pow(2, 1 - S), t * b >= 2 && (p++, b /= 2), p + S >= v ? (h = 0, p = v) : p + S >= 1 ? (h = (t * b - 1) * Math.pow(2, f), p = p + S) : (h = t * Math.pow(2, S - 1) * Math.pow(2, f), p = 0)); f >= 8; s[r + w] = h & 255, w += E, h /= 256, f -= 8)
      ;
    for (p = p << f | h, B += f; B > 0; s[r + w] = p & 255, w += E, p /= 256, B -= 8)
      ;
    s[r + w - E] |= I * 128;
  }), an;
}
var wn, Cn;
function Dt() {
  if (Cn) return wn;
  Cn = 1, wn = t;
  var s = Qn();
  function t(o) {
    this.buf = ArrayBuffer.isView && ArrayBuffer.isView(o) ? o : new Uint8Array(o || 0), this.pos = 0, this.type = 0, this.length = this.buf.length;
  }
  t.Varint = 0, t.Fixed64 = 1, t.Bytes = 2, t.Fixed32 = 5;
  var r = 65536 * 65536, a = 1 / r, f = 12, y = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8");
  t.prototype = {
    destroy: function() {
      this.buf = null;
    },
    // === READING =================================================================
    readFields: function(o, l, d) {
      for (d = d || this.length; this.pos < d; ) {
        var F = this.readVarint(), _ = F >> 3, T = this.pos;
        this.type = F & 7, o(_, l, this), this.pos === T && this.skip(F);
      }
      return l;
    },
    readMessage: function(o, l) {
      return this.readFields(o, l, this.readVarint() + this.pos);
    },
    readFixed32: function() {
      var o = j(this.buf, this.pos);
      return this.pos += 4, o;
    },
    readSFixed32: function() {
      var o = z(this.buf, this.pos);
      return this.pos += 4, o;
    },
    // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
    readFixed64: function() {
      var o = j(this.buf, this.pos) + j(this.buf, this.pos + 4) * r;
      return this.pos += 8, o;
    },
    readSFixed64: function() {
      var o = j(this.buf, this.pos) + z(this.buf, this.pos + 4) * r;
      return this.pos += 8, o;
    },
    readFloat: function() {
      var o = s.read(this.buf, this.pos, !0, 23, 4);
      return this.pos += 4, o;
    },
    readDouble: function() {
      var o = s.read(this.buf, this.pos, !0, 52, 8);
      return this.pos += 8, o;
    },
    readVarint: function(o) {
      var l = this.buf, d, F;
      return F = l[this.pos++], d = F & 127, F < 128 || (F = l[this.pos++], d |= (F & 127) << 7, F < 128) || (F = l[this.pos++], d |= (F & 127) << 14, F < 128) || (F = l[this.pos++], d |= (F & 127) << 21, F < 128) ? d : (F = l[this.pos], d |= (F & 15) << 28, p(d, o, this));
    },
    readVarint64: function() {
      return this.readVarint(!0);
    },
    readSVarint: function() {
      var o = this.readVarint();
      return o % 2 === 1 ? (o + 1) / -2 : o / 2;
    },
    readBoolean: function() {
      return !!this.readVarint();
    },
    readString: function() {
      var o = this.readVarint() + this.pos, l = this.pos;
      return this.pos = o, o - l >= f && y ? ln(this.buf, l, o) : X(this.buf, l, o);
    },
    readBytes: function() {
      var o = this.readVarint() + this.pos, l = this.buf.subarray(this.pos, o);
      return this.pos = o, l;
    },
    // verbose for performance reasons; doesn't affect gzipped size
    readPackedVarint: function(o, l) {
      if (this.type !== t.Bytes) return o.push(this.readVarint(l));
      var d = h(this);
      for (o = o || []; this.pos < d; ) o.push(this.readVarint(l));
      return o;
    },
    readPackedSVarint: function(o) {
      if (this.type !== t.Bytes) return o.push(this.readSVarint());
      var l = h(this);
      for (o = o || []; this.pos < l; ) o.push(this.readSVarint());
      return o;
    },
    readPackedBoolean: function(o) {
      if (this.type !== t.Bytes) return o.push(this.readBoolean());
      var l = h(this);
      for (o = o || []; this.pos < l; ) o.push(this.readBoolean());
      return o;
    },
    readPackedFloat: function(o) {
      if (this.type !== t.Bytes) return o.push(this.readFloat());
      var l = h(this);
      for (o = o || []; this.pos < l; ) o.push(this.readFloat());
      return o;
    },
    readPackedDouble: function(o) {
      if (this.type !== t.Bytes) return o.push(this.readDouble());
      var l = h(this);
      for (o = o || []; this.pos < l; ) o.push(this.readDouble());
      return o;
    },
    readPackedFixed32: function(o) {
      if (this.type !== t.Bytes) return o.push(this.readFixed32());
      var l = h(this);
      for (o = o || []; this.pos < l; ) o.push(this.readFixed32());
      return o;
    },
    readPackedSFixed32: function(o) {
      if (this.type !== t.Bytes) return o.push(this.readSFixed32());
      var l = h(this);
      for (o = o || []; this.pos < l; ) o.push(this.readSFixed32());
      return o;
    },
    readPackedFixed64: function(o) {
      if (this.type !== t.Bytes) return o.push(this.readFixed64());
      var l = h(this);
      for (o = o || []; this.pos < l; ) o.push(this.readFixed64());
      return o;
    },
    readPackedSFixed64: function(o) {
      if (this.type !== t.Bytes) return o.push(this.readSFixed64());
      var l = h(this);
      for (o = o || []; this.pos < l; ) o.push(this.readSFixed64());
      return o;
    },
    skip: function(o) {
      var l = o & 7;
      if (l === t.Varint) for (; this.buf[this.pos++] > 127; )
        ;
      else if (l === t.Bytes) this.pos = this.readVarint() + this.pos;
      else if (l === t.Fixed32) this.pos += 4;
      else if (l === t.Fixed64) this.pos += 8;
      else throw new Error("Unimplemented type: " + l);
    },
    // === WRITING =================================================================
    writeTag: function(o, l) {
      this.writeVarint(o << 3 | l);
    },
    realloc: function(o) {
      for (var l = this.length || 16; l < this.pos + o; ) l *= 2;
      if (l !== this.length) {
        var d = new Uint8Array(l);
        d.set(this.buf), this.buf = d, this.length = l;
      }
    },
    finish: function() {
      return this.length = this.pos, this.pos = 0, this.buf.subarray(0, this.length);
    },
    writeFixed32: function(o) {
      this.realloc(4), q(this.buf, o, this.pos), this.pos += 4;
    },
    writeSFixed32: function(o) {
      this.realloc(4), q(this.buf, o, this.pos), this.pos += 4;
    },
    writeFixed64: function(o) {
      this.realloc(8), q(this.buf, o & -1, this.pos), q(this.buf, Math.floor(o * a), this.pos + 4), this.pos += 8;
    },
    writeSFixed64: function(o) {
      this.realloc(8), q(this.buf, o & -1, this.pos), q(this.buf, Math.floor(o * a), this.pos + 4), this.pos += 8;
    },
    writeVarint: function(o) {
      if (o = +o || 0, o > 268435455 || o < 0) {
        B(o, this);
        return;
      }
      this.realloc(4), this.buf[this.pos++] = o & 127 | (o > 127 ? 128 : 0), !(o <= 127) && (this.buf[this.pos++] = (o >>>= 7) & 127 | (o > 127 ? 128 : 0), !(o <= 127) && (this.buf[this.pos++] = (o >>>= 7) & 127 | (o > 127 ? 128 : 0), !(o <= 127) && (this.buf[this.pos++] = o >>> 7 & 127)));
    },
    writeSVarint: function(o) {
      this.writeVarint(o < 0 ? -o * 2 - 1 : o * 2);
    },
    writeBoolean: function(o) {
      this.writeVarint(!!o);
    },
    writeString: function(o) {
      o = String(o), this.realloc(o.length * 4), this.pos++;
      var l = this.pos;
      this.pos = cn(this.buf, o, this.pos);
      var d = this.pos - l;
      d >= 128 && x(l, d, this), this.pos = l - 1, this.writeVarint(d), this.pos += d;
    },
    writeFloat: function(o) {
      this.realloc(4), s.write(this.buf, o, this.pos, !0, 23, 4), this.pos += 4;
    },
    writeDouble: function(o) {
      this.realloc(8), s.write(this.buf, o, this.pos, !0, 52, 8), this.pos += 8;
    },
    writeBytes: function(o) {
      var l = o.length;
      this.writeVarint(l), this.realloc(l);
      for (var d = 0; d < l; d++) this.buf[this.pos++] = o[d];
    },
    writeRawMessage: function(o, l) {
      this.pos++;
      var d = this.pos;
      o(l, this);
      var F = this.pos - d;
      F >= 128 && x(d, F, this), this.pos = d - 1, this.writeVarint(F), this.pos += F;
    },
    writeMessage: function(o, l, d) {
      this.writeTag(o, t.Bytes), this.writeRawMessage(l, d);
    },
    writePackedVarint: function(o, l) {
      l.length && this.writeMessage(o, w, l);
    },
    writePackedSVarint: function(o, l) {
      l.length && this.writeMessage(o, E, l);
    },
    writePackedBoolean: function(o, l) {
      l.length && this.writeMessage(o, k, l);
    },
    writePackedFloat: function(o, l) {
      l.length && this.writeMessage(o, I, l);
    },
    writePackedDouble: function(o, l) {
      l.length && this.writeMessage(o, A, l);
    },
    writePackedFixed32: function(o, l) {
      l.length && this.writeMessage(o, M, l);
    },
    writePackedSFixed32: function(o, l) {
      l.length && this.writeMessage(o, L, l);
    },
    writePackedFixed64: function(o, l) {
      l.length && this.writeMessage(o, U, l);
    },
    writePackedSFixed64: function(o, l) {
      l.length && this.writeMessage(o, P, l);
    },
    writeBytesField: function(o, l) {
      this.writeTag(o, t.Bytes), this.writeBytes(l);
    },
    writeFixed32Field: function(o, l) {
      this.writeTag(o, t.Fixed32), this.writeFixed32(l);
    },
    writeSFixed32Field: function(o, l) {
      this.writeTag(o, t.Fixed32), this.writeSFixed32(l);
    },
    writeFixed64Field: function(o, l) {
      this.writeTag(o, t.Fixed64), this.writeFixed64(l);
    },
    writeSFixed64Field: function(o, l) {
      this.writeTag(o, t.Fixed64), this.writeSFixed64(l);
    },
    writeVarintField: function(o, l) {
      this.writeTag(o, t.Varint), this.writeVarint(l);
    },
    writeSVarintField: function(o, l) {
      this.writeTag(o, t.Varint), this.writeSVarint(l);
    },
    writeStringField: function(o, l) {
      this.writeTag(o, t.Bytes), this.writeString(l);
    },
    writeFloatField: function(o, l) {
      this.writeTag(o, t.Fixed32), this.writeFloat(l);
    },
    writeDoubleField: function(o, l) {
      this.writeTag(o, t.Fixed64), this.writeDouble(l);
    },
    writeBooleanField: function(o, l) {
      this.writeVarintField(o, !!l);
    }
  };
  function p(o, l, d) {
    var F = d.buf, _, T;
    if (T = F[d.pos++], _ = (T & 112) >> 4, T < 128 || (T = F[d.pos++], _ |= (T & 127) << 3, T < 128) || (T = F[d.pos++], _ |= (T & 127) << 10, T < 128) || (T = F[d.pos++], _ |= (T & 127) << 17, T < 128) || (T = F[d.pos++], _ |= (T & 127) << 24, T < 128) || (T = F[d.pos++], _ |= (T & 1) << 31, T < 128)) return b(o, _, l);
    throw new Error("Expected varint not more than 10 bytes");
  }
  function h(o) {
    return o.type === t.Bytes ? o.readVarint() + o.pos : o.pos + 1;
  }
  function b(o, l, d) {
    return d ? l * 4294967296 + (o >>> 0) : (l >>> 0) * 4294967296 + (o >>> 0);
  }
  function B(o, l) {
    var d, F;
    if (o >= 0 ? (d = o % 4294967296 | 0, F = o / 4294967296 | 0) : (d = ~(-o % 4294967296), F = ~(-o / 4294967296), d ^ 4294967295 ? d = d + 1 | 0 : (d = 0, F = F + 1 | 0)), o >= 18446744073709552e3 || o < -18446744073709552e3)
      throw new Error("Given varint doesn't fit into 10 bytes");
    l.realloc(10), v(d, F, l), S(F, l);
  }
  function v(o, l, d) {
    d.buf[d.pos++] = o & 127 | 128, o >>>= 7, d.buf[d.pos++] = o & 127 | 128, o >>>= 7, d.buf[d.pos++] = o & 127 | 128, o >>>= 7, d.buf[d.pos++] = o & 127 | 128, o >>>= 7, d.buf[d.pos] = o & 127;
  }
  function S(o, l) {
    var d = (o & 7) << 4;
    l.buf[l.pos++] |= d | ((o >>>= 3) ? 128 : 0), o && (l.buf[l.pos++] = o & 127 | ((o >>>= 7) ? 128 : 0), o && (l.buf[l.pos++] = o & 127 | ((o >>>= 7) ? 128 : 0), o && (l.buf[l.pos++] = o & 127 | ((o >>>= 7) ? 128 : 0), o && (l.buf[l.pos++] = o & 127 | ((o >>>= 7) ? 128 : 0), o && (l.buf[l.pos++] = o & 127)))));
  }
  function x(o, l, d) {
    var F = l <= 16383 ? 1 : l <= 2097151 ? 2 : l <= 268435455 ? 3 : Math.floor(Math.log(l) / (Math.LN2 * 7));
    d.realloc(F);
    for (var _ = d.pos - 1; _ >= o; _--) d.buf[_ + F] = d.buf[_];
  }
  function w(o, l) {
    for (var d = 0; d < o.length; d++) l.writeVarint(o[d]);
  }
  function E(o, l) {
    for (var d = 0; d < o.length; d++) l.writeSVarint(o[d]);
  }
  function I(o, l) {
    for (var d = 0; d < o.length; d++) l.writeFloat(o[d]);
  }
  function A(o, l) {
    for (var d = 0; d < o.length; d++) l.writeDouble(o[d]);
  }
  function k(o, l) {
    for (var d = 0; d < o.length; d++) l.writeBoolean(o[d]);
  }
  function M(o, l) {
    for (var d = 0; d < o.length; d++) l.writeFixed32(o[d]);
  }
  function L(o, l) {
    for (var d = 0; d < o.length; d++) l.writeSFixed32(o[d]);
  }
  function U(o, l) {
    for (var d = 0; d < o.length; d++) l.writeFixed64(o[d]);
  }
  function P(o, l) {
    for (var d = 0; d < o.length; d++) l.writeSFixed64(o[d]);
  }
  function j(o, l) {
    return (o[l] | o[l + 1] << 8 | o[l + 2] << 16) + o[l + 3] * 16777216;
  }
  function q(o, l, d) {
    o[d] = l, o[d + 1] = l >>> 8, o[d + 2] = l >>> 16, o[d + 3] = l >>> 24;
  }
  function z(o, l) {
    return (o[l] | o[l + 1] << 8 | o[l + 2] << 16) + (o[l + 3] << 24);
  }
  function X(o, l, d) {
    for (var F = "", _ = l; _ < d; ) {
      var T = o[_], V = null, Y = T > 239 ? 4 : T > 223 ? 3 : T > 191 ? 2 : 1;
      if (_ + Y > d) break;
      var W, O, $;
      Y === 1 ? T < 128 && (V = T) : Y === 2 ? (W = o[_ + 1], (W & 192) === 128 && (V = (T & 31) << 6 | W & 63, V <= 127 && (V = null))) : Y === 3 ? (W = o[_ + 1], O = o[_ + 2], (W & 192) === 128 && (O & 192) === 128 && (V = (T & 15) << 12 | (W & 63) << 6 | O & 63, (V <= 2047 || V >= 55296 && V <= 57343) && (V = null))) : Y === 4 && (W = o[_ + 1], O = o[_ + 2], $ = o[_ + 3], (W & 192) === 128 && (O & 192) === 128 && ($ & 192) === 128 && (V = (T & 15) << 18 | (W & 63) << 12 | (O & 63) << 6 | $ & 63, (V <= 65535 || V >= 1114112) && (V = null))), V === null ? (V = 65533, Y = 1) : V > 65535 && (V -= 65536, F += String.fromCharCode(V >>> 10 & 1023 | 55296), V = 56320 | V & 1023), F += String.fromCharCode(V), _ += Y;
    }
    return F;
  }
  function ln(o, l, d) {
    return y.decode(o.subarray(l, d));
  }
  function cn(o, l, d) {
    for (var F = 0, _, T; F < l.length; F++) {
      if (_ = l.charCodeAt(F), _ > 55295 && _ < 57344)
        if (T)
          if (_ < 56320) {
            o[d++] = 239, o[d++] = 191, o[d++] = 189, T = _;
            continue;
          } else
            _ = T - 55296 << 10 | _ - 56320 | 65536, T = null;
        else {
          _ > 56319 || F + 1 === l.length ? (o[d++] = 239, o[d++] = 191, o[d++] = 189) : T = _;
          continue;
        }
      else T && (o[d++] = 239, o[d++] = 191, o[d++] = 189, T = null);
      _ < 128 ? o[d++] = _ : (_ < 2048 ? o[d++] = _ >> 6 | 192 : (_ < 65536 ? o[d++] = _ >> 12 | 224 : (o[d++] = _ >> 18 | 240, o[d++] = _ >> 12 & 63 | 128), o[d++] = _ >> 6 & 63 | 128), o[d++] = _ & 63 | 128);
    }
    return d;
  }
  return wn;
}
var xn, On;
function nt() {
  if (On) return xn;
  On = 1, xn = s;
  function s(t, r) {
    this.x = t, this.y = r;
  }
  return s.prototype = {
    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function() {
      return new s(this.x, this.y);
    },
    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add: function(t) {
      return this.clone()._add(t);
    },
    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub: function(t) {
      return this.clone()._sub(t);
    },
    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint: function(t) {
      return this.clone()._multByPoint(t);
    },
    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint: function(t) {
      return this.clone()._divByPoint(t);
    },
    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult: function(t) {
      return this.clone()._mult(t);
    },
    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div: function(t) {
      return this.clone()._div(t);
    },
    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate: function(t) {
      return this.clone()._rotate(t);
    },
    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround: function(t, r) {
      return this.clone()._rotateAround(t, r);
    },
    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function(t) {
      return this.clone()._matMult(t);
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
    equals: function(t) {
      return this.x === t.x && this.y === t.y;
    },
    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function(t) {
      return Math.sqrt(this.distSqr(t));
    },
    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function(t) {
      var r = t.x - this.x, a = t.y - this.y;
      return r * r + a * a;
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
    angleTo: function(t) {
      return Math.atan2(this.y - t.y, this.x - t.x);
    },
    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function(t) {
      return this.angleWithSep(t.x, t.y);
    },
    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function(t, r) {
      return Math.atan2(
        this.x * r - this.y * t,
        this.x * t + this.y * r
      );
    },
    _matMult: function(t) {
      var r = t[0] * this.x + t[1] * this.y, a = t[2] * this.x + t[3] * this.y;
      return this.x = r, this.y = a, this;
    },
    _add: function(t) {
      return this.x += t.x, this.y += t.y, this;
    },
    _sub: function(t) {
      return this.x -= t.x, this.y -= t.y, this;
    },
    _mult: function(t) {
      return this.x *= t, this.y *= t, this;
    },
    _div: function(t) {
      return this.x /= t, this.y /= t, this;
    },
    _multByPoint: function(t) {
      return this.x *= t.x, this.y *= t.y, this;
    },
    _divByPoint: function(t) {
      return this.x /= t.x, this.y /= t.y, this;
    },
    _unit: function() {
      return this._div(this.mag()), this;
    },
    _perp: function() {
      var t = this.y;
      return this.y = this.x, this.x = -t, this;
    },
    _rotate: function(t) {
      var r = Math.cos(t), a = Math.sin(t), f = r * this.x - a * this.y, y = a * this.x + r * this.y;
      return this.x = f, this.y = y, this;
    },
    _rotateAround: function(t, r) {
      var a = Math.cos(t), f = Math.sin(t), y = r.x + a * (this.x - r.x) - f * (this.y - r.y), p = r.y + f * (this.x - r.x) + a * (this.y - r.y);
      return this.x = y, this.y = p, this;
    },
    _round: function() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
    }
  }, s.convert = function(t) {
    return t instanceof s ? t : Array.isArray(t) ? new s(t[0], t[1]) : t;
  }, xn;
}
var on = {}, mn, Nn;
function tt() {
  if (Nn) return mn;
  Nn = 1;
  var s = nt();
  mn = t;
  function t(p, h, b, B, v) {
    this.properties = {}, this.extent = b, this.type = 0, this._pbf = p, this._geometry = -1, this._keys = B, this._values = v, p.readFields(r, this, h);
  }
  function r(p, h, b) {
    p == 1 ? h.id = b.readVarint() : p == 2 ? a(b, h) : p == 3 ? h.type = b.readVarint() : p == 4 && (h._geometry = b.pos);
  }
  function a(p, h) {
    for (var b = p.readVarint() + p.pos; p.pos < b; ) {
      var B = h._keys[p.readVarint()], v = h._values[p.readVarint()];
      h.properties[B] = v;
    }
  }
  t.types = ["Unknown", "Point", "LineString", "Polygon"], t.prototype.loadGeometry = function() {
    var p = this._pbf;
    p.pos = this._geometry;
    for (var h = p.readVarint() + p.pos, b = 1, B = 0, v = 0, S = 0, x = [], w; p.pos < h; ) {
      if (B <= 0) {
        var E = p.readVarint();
        b = E & 7, B = E >> 3;
      }
      if (B--, b === 1 || b === 2)
        v += p.readSVarint(), S += p.readSVarint(), b === 1 && (w && x.push(w), w = []), w.push(new s(v, S));
      else if (b === 7)
        w && w.push(w[0].clone());
      else
        throw new Error("unknown command " + b);
    }
    return w && x.push(w), x;
  }, t.prototype.bbox = function() {
    var p = this._pbf;
    p.pos = this._geometry;
    for (var h = p.readVarint() + p.pos, b = 1, B = 0, v = 0, S = 0, x = 1 / 0, w = -1 / 0, E = 1 / 0, I = -1 / 0; p.pos < h; ) {
      if (B <= 0) {
        var A = p.readVarint();
        b = A & 7, B = A >> 3;
      }
      if (B--, b === 1 || b === 2)
        v += p.readSVarint(), S += p.readSVarint(), v < x && (x = v), v > w && (w = v), S < E && (E = S), S > I && (I = S);
      else if (b !== 7)
        throw new Error("unknown command " + b);
    }
    return [x, E, w, I];
  }, t.prototype.toGeoJSON = function(p, h, b) {
    var B = this.extent * Math.pow(2, b), v = this.extent * p, S = this.extent * h, x = this.loadGeometry(), w = t.types[this.type], E, I;
    function A(L) {
      for (var U = 0; U < L.length; U++) {
        var P = L[U], j = 180 - (P.y + S) * 360 / B;
        L[U] = [
          (P.x + v) * 360 / B - 180,
          360 / Math.PI * Math.atan(Math.exp(j * Math.PI / 180)) - 90
        ];
      }
    }
    switch (this.type) {
      case 1:
        var k = [];
        for (E = 0; E < x.length; E++)
          k[E] = x[E][0];
        x = k, A(x);
        break;
      case 2:
        for (E = 0; E < x.length; E++)
          A(x[E]);
        break;
      case 3:
        for (x = f(x), E = 0; E < x.length; E++)
          for (I = 0; I < x[E].length; I++)
            A(x[E][I]);
        break;
    }
    x.length === 1 ? x = x[0] : w = "Multi" + w;
    var M = {
      type: "Feature",
      geometry: {
        type: w,
        coordinates: x
      },
      properties: this.properties
    };
    return "id" in this && (M.id = this.id), M;
  };
  function f(p) {
    var h = p.length;
    if (h <= 1) return [p];
    for (var b = [], B, v, S = 0; S < h; S++) {
      var x = y(p[S]);
      x !== 0 && (v === void 0 && (v = x < 0), v === x < 0 ? (B && b.push(B), B = [p[S]]) : B.push(p[S]));
    }
    return B && b.push(B), b;
  }
  function y(p) {
    for (var h = 0, b = 0, B = p.length, v = B - 1, S, x; b < B; v = b++)
      S = p[b], x = p[v], h += (x.x - S.x) * (S.y + x.y);
    return h;
  }
  return mn;
}
var En, Vn;
function et() {
  if (Vn) return En;
  Vn = 1;
  var s = tt();
  En = t;
  function t(f, y) {
    this.version = 1, this.name = null, this.extent = 4096, this.length = 0, this._pbf = f, this._keys = [], this._values = [], this._features = [], f.readFields(r, this, y), this.length = this._features.length;
  }
  function r(f, y, p) {
    f === 15 ? y.version = p.readVarint() : f === 1 ? y.name = p.readString() : f === 5 ? y.extent = p.readVarint() : f === 2 ? y._features.push(p.pos) : f === 3 ? y._keys.push(p.readString()) : f === 4 && y._values.push(a(p));
  }
  function a(f) {
    for (var y = null, p = f.readVarint() + f.pos; f.pos < p; ) {
      var h = f.readVarint() >> 3;
      y = h === 1 ? f.readString() : h === 2 ? f.readFloat() : h === 3 ? f.readDouble() : h === 4 ? f.readVarint64() : h === 5 ? f.readVarint() : h === 6 ? f.readSVarint() : h === 7 ? f.readBoolean() : null;
    }
    return y;
  }
  return t.prototype.feature = function(f) {
    if (f < 0 || f >= this._features.length) throw new Error("feature index out of bounds");
    this._pbf.pos = this._features[f];
    var y = this._pbf.readVarint() + this._pbf.pos;
    return new s(this._pbf, y, this.extent, this._keys, this._values);
  }, En;
}
var bn, Dn;
function Gt() {
  if (Dn) return bn;
  Dn = 1;
  var s = et();
  bn = t;
  function t(a, f) {
    this.layers = a.readFields(r, {}, f);
  }
  function r(a, f, y) {
    if (a === 3) {
      var p = new s(y, y.readVarint() + y.pos);
      p.length && (f[p.name] = p);
    }
  }
  return bn;
}
var Gn;
function qt() {
  return Gn || (Gn = 1, on.VectorTile = Gt(), on.VectorTileFeature = tt(), on.VectorTileLayer = et()), on;
}
var Bn, qn;
function $t() {
  if (qn) return Bn;
  qn = 1;
  var s = nt(), t = qt().VectorTileFeature;
  Bn = r;
  function r(f, y) {
    this.options = y || {}, this.features = f, this.length = f.length;
  }
  r.prototype.feature = function(f) {
    return new a(this.features[f], this.options.extent);
  };
  function a(f, y) {
    this.id = typeof f.id == "number" ? f.id : void 0, this.type = f.type, this.rawGeometry = f.type === 1 ? [f.geometry] : f.geometry, this.properties = f.tags, this.extent = y || 4096;
  }
  return a.prototype.loadGeometry = function() {
    var f = this.rawGeometry;
    this.geometry = [];
    for (var y = 0; y < f.length; y++) {
      for (var p = f[y], h = [], b = 0; b < p.length; b++)
        h.push(new s(p[b][0], p[b][1]));
      this.geometry.push(h);
    }
    return this.geometry;
  }, a.prototype.bbox = function() {
    this.geometry || this.loadGeometry();
    for (var f = this.geometry, y = 1 / 0, p = -1 / 0, h = 1 / 0, b = -1 / 0, B = 0; B < f.length; B++)
      for (var v = f[B], S = 0; S < v.length; S++) {
        var x = v[S];
        y = Math.min(y, x.x), p = Math.max(p, x.x), h = Math.min(h, x.y), b = Math.max(b, x.y);
      }
    return [y, h, p, b];
  }, a.prototype.toGeoJSON = t.prototype.toGeoJSON, Bn;
}
var $n;
function jt() {
  if ($n) return tn.exports;
  $n = 1;
  var s = Dt(), t = $t();
  tn.exports = r, tn.exports.fromVectorTileJs = r, tn.exports.fromGeojsonVt = a, tn.exports.GeoJSONWrapper = t;
  function r(x) {
    var w = new s();
    return f(x, w), w.finish();
  }
  function a(x, w) {
    w = w || {};
    var E = {};
    for (var I in x)
      E[I] = new t(x[I].features, w), E[I].name = I, E[I].version = w.version, E[I].extent = w.extent;
    return r({ layers: E });
  }
  function f(x, w) {
    for (var E in x.layers)
      w.writeMessage(3, y, x.layers[E]);
  }
  function y(x, w) {
    w.writeVarintField(15, x.version || 1), w.writeStringField(1, x.name || ""), w.writeVarintField(5, x.extent || 4096);
    var E, I = {
      keys: [],
      values: [],
      keycache: {},
      valuecache: {}
    };
    for (E = 0; E < x.length; E++)
      I.feature = x.feature(E), w.writeMessage(2, p, I);
    var A = I.keys;
    for (E = 0; E < A.length; E++)
      w.writeStringField(3, A[E]);
    var k = I.values;
    for (E = 0; E < k.length; E++)
      w.writeMessage(4, S, k[E]);
  }
  function p(x, w) {
    var E = x.feature;
    E.id !== void 0 && w.writeVarintField(1, E.id), w.writeMessage(2, h, x), w.writeVarintField(3, E.type), w.writeMessage(4, v, E);
  }
  function h(x, w) {
    var E = x.feature, I = x.keys, A = x.values, k = x.keycache, M = x.valuecache;
    for (var L in E.properties) {
      var U = E.properties[L], P = k[L];
      if (U !== null) {
        typeof P > "u" && (I.push(L), P = I.length - 1, k[L] = P), w.writeVarint(P);
        var j = typeof U;
        j !== "string" && j !== "boolean" && j !== "number" && (U = JSON.stringify(U));
        var q = j + ":" + U, z = M[q];
        typeof z > "u" && (A.push(U), z = A.length - 1, M[q] = z), w.writeVarint(z);
      }
    }
  }
  function b(x, w) {
    return (w << 3) + (x & 7);
  }
  function B(x) {
    return x << 1 ^ x >> 31;
  }
  function v(x, w) {
    for (var E = x.loadGeometry(), I = x.type, A = 0, k = 0, M = E.length, L = 0; L < M; L++) {
      var U = E[L], P = 1;
      I === 1 && (P = U.length), w.writeVarint(b(1, P));
      for (var j = I === 3 ? U.length - 1 : U.length, q = 0; q < j; q++) {
        q === 1 && I !== 1 && w.writeVarint(b(2, j - 1));
        var z = U[q].x - A, X = U[q].y - k;
        w.writeVarint(B(z)), w.writeVarint(B(X)), A += z, k += X;
      }
      I === 3 && w.writeVarint(b(7, 1));
    }
  }
  function S(x, w) {
    var E = typeof x;
    E === "string" ? w.writeStringField(1, x) : E === "boolean" ? w.writeBooleanField(7, x) : E === "number" && (x % 1 !== 0 ? w.writeDoubleField(3, x) : x < 0 ? w.writeSVarintField(6, x) : w.writeVarintField(5, x));
  }
  return tn.exports;
}
var zt = jt();
const jn = /* @__PURE__ */ Vt(zt), rt = `function W(i, c, a = {}) {
  const h = { type: "Feature" };
  return (a.id === 0 || a.id) && (h.id = a.id), a.bbox && (h.bbox = a.bbox), h.properties = c || {}, h.geometry = i, h;
}
function lr(i, c, a = {}) {
  if (i.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return W({
    type: "LineString",
    coordinates: i
  }, c, a);
}
function Xr(i, c = {}) {
  const a = { type: "FeatureCollection" };
  return c.id && (a.id = c.id), c.bbox && (a.bbox = c.bbox), a.features = i, a;
}
function Wr(i) {
  return i !== null && typeof i == "object" && !Array.isArray(i);
}
function Vr(i) {
  if (!i)
    throw new Error("coord is required");
  if (!Array.isArray(i)) {
    if (i.type === "Feature" && i.geometry !== null && i.geometry.type === "Point")
      return [...i.geometry.coordinates];
    if (i.type === "Point")
      return [...i.coordinates];
  }
  if (Array.isArray(i) && i.length >= 2 && !Array.isArray(i[0]) && !Array.isArray(i[1]))
    return [...i];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function Y(i) {
  if (Array.isArray(i))
    return i;
  if (i.type === "Feature") {
    if (i.geometry !== null)
      return i.geometry.coordinates;
  } else if (i.coordinates)
    return i.coordinates;
  throw new Error(
    "coords must be GeoJSON Feature, Geometry Object or an Array"
  );
}
function Hr(i, c) {
  return i.type === "FeatureCollection" ? "FeatureCollection" : i.type === "GeometryCollection" ? "GeometryCollection" : i.type === "Feature" && i.geometry !== null ? i.geometry.type : i.type;
}
function pr(i, c, a = {}) {
  const h = Vr(i), y = Y(c);
  for (let l = 0; l < y.length - 1; l++) {
    let p = !1;
    if (a.ignoreEndVertices && (l === 0 && (p = "start"), l === y.length - 2 && (p = "end"), l === 0 && l + 1 === y.length - 1 && (p = "both")), zr(
      y[l],
      y[l + 1],
      h,
      p,
      typeof a.epsilon > "u" ? null : a.epsilon
    ))
      return !0;
  }
  return !1;
}
function zr(i, c, a, h, y) {
  const l = a[0], p = a[1], u = i[0], x = i[1], I = c[0], E = c[1], m = a[0] - u, F = a[1] - x, w = I - u, d = E - x, B = m * d - F * w;
  if (y !== null) {
    if (Math.abs(B) > y)
      return !1;
  } else if (B !== 0)
    return !1;
  if (Math.abs(w) === Math.abs(d) && Math.abs(w) === 0)
    return h ? !1 : a[0] === i[0] && a[1] === i[1];
  if (h) {
    if (h === "start")
      return Math.abs(w) >= Math.abs(d) ? w > 0 ? u < l && l <= I : I <= l && l < u : d > 0 ? x < p && p <= E : E <= p && p < x;
    if (h === "end")
      return Math.abs(w) >= Math.abs(d) ? w > 0 ? u <= l && l < I : I < l && l <= u : d > 0 ? x <= p && p < E : E < p && p <= x;
    if (h === "both")
      return Math.abs(w) >= Math.abs(d) ? w > 0 ? u < l && l < I : I < l && l < u : d > 0 ? x < p && p < E : E < p && p < x;
  } else return Math.abs(w) >= Math.abs(d) ? w > 0 ? u <= l && l <= I : I <= l && l <= u : d > 0 ? x <= p && p <= E : E <= p && p <= x;
  return !1;
}
function Kr(i, c = {}) {
  var a = typeof c == "object" ? c.mutate : c;
  if (!i) throw new Error("geojson is required");
  var h = Hr(i), y = [];
  switch (h) {
    case "LineString":
      y = Z(i, h);
      break;
    case "MultiLineString":
    case "Polygon":
      Y(i).forEach(function(p) {
        y.push(Z(p, h));
      });
      break;
    case "MultiPolygon":
      Y(i).forEach(function(p) {
        var u = [];
        p.forEach(function(x) {
          u.push(Z(x, h));
        }), y.push(u);
      });
      break;
    case "Point":
      return i;
    case "MultiPoint":
      var l = {};
      Y(i).forEach(function(p) {
        var u = p.join("-");
        Object.prototype.hasOwnProperty.call(l, u) || (y.push(p), l[u] = !0);
      });
      break;
    default:
      throw new Error(h + " geometry not supported");
  }
  return i.coordinates ? a === !0 ? (i.coordinates = y, i) : { type: h, coordinates: y } : a === !0 ? (i.geometry.coordinates = y, i) : W({ type: h, coordinates: y }, i.properties, {
    bbox: i.bbox,
    id: i.id
  });
}
function Z(i, c) {
  const a = Y(i);
  if (a.length === 2 && !yr(a[0], a[1])) return a;
  const h = [];
  let y = 0, l = 1, p = 2;
  for (h.push(a[y]); p < a.length; )
    pr(a[l], lr([a[y], a[p]])) ? l = p : (h.push(a[l]), y = l, l++, p = l), p++;
  if (h.push(a[l]), c === "Polygon" || c === "MultiPolygon") {
    if (pr(
      h[0],
      lr([h[1], h[h.length - 2]])
    ) && (h.shift(), h.pop(), h.push(h[0])), h.length < 4)
      throw new Error("invalid polygon, fewer than 4 points");
    if (!yr(h[0], h[h.length - 1]))
      throw new Error("invalid polygon, first and last points not equal");
  }
  return h;
}
function yr(i, c) {
  return i[0] === c[0] && i[1] === c[1];
}
function Zr(i) {
  if (!i)
    throw new Error("geojson is required");
  switch (i.type) {
    case "Feature":
      return gr(i);
    case "FeatureCollection":
      return Qr(i);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return v(i);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function gr(i) {
  const c = { type: "Feature" };
  return Object.keys(i).forEach((a) => {
    switch (a) {
      case "type":
      case "properties":
      case "geometry":
        return;
      default:
        c[a] = i[a];
    }
  }), c.properties = Ir(i.properties), i.geometry == null ? c.geometry = null : c.geometry = v(i.geometry), c;
}
function Ir(i) {
  const c = {};
  return i && Object.keys(i).forEach((a) => {
    const h = i[a];
    typeof h == "object" ? h === null ? c[a] = null : Array.isArray(h) ? c[a] = h.map((y) => y) : c[a] = Ir(h) : c[a] = h;
  }), c;
}
function Qr(i) {
  const c = { type: "FeatureCollection" };
  return Object.keys(i).forEach((a) => {
    switch (a) {
      case "type":
      case "features":
        return;
      default:
        c[a] = i[a];
    }
  }), c.features = i.features.map((a) => gr(a)), c;
}
function v(i) {
  const c = { type: i.type };
  return i.bbox && (c.bbox = i.bbox), i.type === "GeometryCollection" ? (c.geometries = i.geometries.map((a) => v(a)), c) : (c.coordinates = Fr(i.coordinates), c);
}
function Fr(i) {
  const c = i;
  return typeof c[0] != "object" ? c.slice() : c.map((a) => Fr(a));
}
function Ar(i, c) {
  var a, h, y, l, p, u, x, I, E, m, F = 0, w = i.type === "FeatureCollection", d = i.type === "Feature", B = w ? i.features.length : 1;
  for (a = 0; a < B; a++) {
    for (u = w ? (
      // @ts-expect-error: Known type conflict
      i.features[a].geometry
    ) : d ? (
      // @ts-expect-error: Known type conflict
      i.geometry
    ) : i, I = w ? (
      // @ts-expect-error: Known type conflict
      i.features[a].properties
    ) : d ? (
      // @ts-expect-error: Known type conflict
      i.properties
    ) : {}, E = w ? (
      // @ts-expect-error: Known type conflict
      i.features[a].bbox
    ) : d ? (
      // @ts-expect-error: Known type conflict
      i.bbox
    ) : void 0, m = w ? (
      // @ts-expect-error: Known type conflict
      i.features[a].id
    ) : d ? (
      // @ts-expect-error: Known type conflict
      i.id
    ) : void 0, x = u ? u.type === "GeometryCollection" : !1, p = x ? u.geometries.length : 1, y = 0; y < p; y++) {
      if (l = x ? u.geometries[y] : u, l === null) {
        if (
          // @ts-expect-error: Known type conflict
          c(
            // @ts-expect-error: Known type conflict
            null,
            F,
            I,
            E,
            m
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
            c(
              l,
              F,
              I,
              E,
              m
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (h = 0; h < l.geometries.length; h++)
            if (
              // @ts-expect-error: Known type conflict
              c(
                l.geometries[h],
                F,
                I,
                E,
                m
              ) === !1
            )
              return !1;
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    F++;
  }
}
function jr(i, c) {
  Ar(i, function(a, h, y, l, p) {
    var u = a === null ? null : a.type;
    switch (u) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          c(
            W(a, y, { bbox: l, id: p }),
            h,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var x;
    switch (u) {
      case "MultiPoint":
        x = "Point";
        break;
      case "MultiLineString":
        x = "LineString";
        break;
      case "MultiPolygon":
        x = "Polygon";
        break;
    }
    for (
      var I = 0;
      // @ts-expect-error: Known type conflict
      I < a.coordinates.length;
      I++
    ) {
      var E = a.coordinates[I], m = {
        type: x,
        coordinates: E
      };
      if (
        // @ts-expect-error: Known type conflict
        c(W(m, y), h, I) === !1
      )
        return !1;
    }
  });
}
function vr(i, c) {
  var a = i[0] - c[0], h = i[1] - c[1];
  return a * a + h * h;
}
function rt(i, c, a) {
  var h = c[0], y = c[1], l = a[0] - h, p = a[1] - y;
  if (l !== 0 || p !== 0) {
    var u = ((i[0] - h) * l + (i[1] - y) * p) / (l * l + p * p);
    u > 1 ? (h = a[0], y = a[1]) : u > 0 && (h += l * u, y += p * u);
  }
  return l = i[0] - h, p = i[1] - y, l * l + p * p;
}
function tt(i, c) {
  for (var a = i[0], h = [a], y, l = 1, p = i.length; l < p; l++)
    y = i[l], vr(y, a) > c && (h.push(y), a = y);
  return a !== y && h.push(y), h;
}
function j(i, c, a, h, y) {
  for (var l = h, p, u = c + 1; u < a; u++) {
    var x = rt(i[u], i[c], i[a]);
    x > l && (p = u, l = x);
  }
  l > h && (p - c > 1 && j(i, c, p, h, y), y.push(i[p]), a - p > 1 && j(i, p, a, h, y));
}
function et(i, c) {
  var a = i.length - 1, h = [i[0]];
  return j(i, 0, a, c, h), h.push(i[a]), h;
}
function V(i, c, a) {
  if (i.length <= 2) return i;
  var h = c !== void 0 ? c * c : 1;
  return i = a ? i : tt(i, h), i = et(i, h), i;
}
function nt(i, c = {}) {
  var a, h, y;
  if (c = c ?? {}, !Wr(c)) throw new Error("options is invalid");
  const l = (a = c.tolerance) != null ? a : 1, p = (h = c.highQuality) != null ? h : !1, u = (y = c.mutate) != null ? y : !1;
  if (!i) throw new Error("geojson is required");
  if (l && l < 0) throw new Error("invalid tolerance");
  return u !== !0 && (i = Zr(i)), Ar(i, function(x) {
    it(x, l, p);
  }), i;
}
function it(i, c, a) {
  const h = i.type;
  if (h === "Point" || h === "MultiPoint") return i;
  if (Kr(i, { mutate: !0 }), h !== "GeometryCollection")
    switch (h) {
      case "LineString":
        i.coordinates = V(
          i.coordinates,
          c,
          a
        );
        break;
      case "MultiLineString":
        i.coordinates = i.coordinates.map(
          (y) => V(y, c, a)
        );
        break;
      case "Polygon":
        i.coordinates = wr(
          i.coordinates,
          c,
          a
        );
        break;
      case "MultiPolygon":
        i.coordinates = i.coordinates.map(
          (y) => wr(y, c, a)
        );
    }
  return i;
}
function wr(i, c, a) {
  return i.map(function(h) {
    if (h.length < 4)
      throw new Error("invalid polygon");
    let y = c, l = V(h, y, a);
    for (; !dr(l) && y >= Number.EPSILON; )
      y -= y * 0.01, l = V(h, y, a);
    return dr(l) ? ((l[l.length - 1][0] !== l[0][0] || l[l.length - 1][1] !== l[0][1]) && l.push(l[0]), l) : h;
  });
}
function dr(i) {
  return i.length < 3 ? !1 : !(i.length === 3 && i[2][0] === i[0][0] && i[2][1] === i[0][1]);
}
function ot(i) {
  if (!i) throw new Error("geojson is required");
  var c = [];
  return jr(i, function(a) {
    c.push(a);
  }), Xr(c);
}
var Q = {}, q = {}, xr;
function ut() {
  if (xr) return q;
  xr = 1, q.byteLength = u, q.toByteArray = I, q.fromByteArray = F;
  for (var i = [], c = [], a = typeof Uint8Array < "u" ? Uint8Array : Array, h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", y = 0, l = h.length; y < l; ++y)
    i[y] = h[y], c[h.charCodeAt(y)] = y;
  c[45] = 62, c[95] = 63;
  function p(w) {
    var d = w.length;
    if (d % 4 > 0)
      throw new Error("Invalid string. Length must be a multiple of 4");
    var B = w.indexOf("=");
    B === -1 && (B = d);
    var C = B === d ? 0 : 4 - B % 4;
    return [B, C];
  }
  function u(w) {
    var d = p(w), B = d[0], C = d[1];
    return (B + C) * 3 / 4 - C;
  }
  function x(w, d, B) {
    return (d + B) * 3 / 4 - B;
  }
  function I(w) {
    var d, B = p(w), C = B[0], A = B[1], M = new a(x(w, C, A)), L = 0, D = A > 0 ? C - 4 : C, R;
    for (R = 0; R < D; R += 4)
      d = c[w.charCodeAt(R)] << 18 | c[w.charCodeAt(R + 1)] << 12 | c[w.charCodeAt(R + 2)] << 6 | c[w.charCodeAt(R + 3)], M[L++] = d >> 16 & 255, M[L++] = d >> 8 & 255, M[L++] = d & 255;
    return A === 2 && (d = c[w.charCodeAt(R)] << 2 | c[w.charCodeAt(R + 1)] >> 4, M[L++] = d & 255), A === 1 && (d = c[w.charCodeAt(R)] << 10 | c[w.charCodeAt(R + 1)] << 4 | c[w.charCodeAt(R + 2)] >> 2, M[L++] = d >> 8 & 255, M[L++] = d & 255), M;
  }
  function E(w) {
    return i[w >> 18 & 63] + i[w >> 12 & 63] + i[w >> 6 & 63] + i[w & 63];
  }
  function m(w, d, B) {
    for (var C, A = [], M = d; M < B; M += 3)
      C = (w[M] << 16 & 16711680) + (w[M + 1] << 8 & 65280) + (w[M + 2] & 255), A.push(E(C));
    return A.join("");
  }
  function F(w) {
    for (var d, B = w.length, C = B % 3, A = [], M = 16383, L = 0, D = B - C; L < D; L += M)
      A.push(m(w, L, L + M > D ? D : L + M));
    return C === 1 ? (d = w[B - 1], A.push(
      i[d >> 2] + i[d << 4 & 63] + "=="
    )) : C === 2 && (d = (w[B - 2] << 8) + w[B - 1], A.push(
      i[d >> 10] + i[d >> 4 & 63] + i[d << 2 & 63] + "="
    )), A.join("");
  }
  return q;
}
var X = {};
var Er;
function ft() {
  return Er || (Er = 1, X.read = function(i, c, a, h, y) {
    var l, p, u = y * 8 - h - 1, x = (1 << u) - 1, I = x >> 1, E = -7, m = a ? y - 1 : 0, F = a ? -1 : 1, w = i[c + m];
    for (m += F, l = w & (1 << -E) - 1, w >>= -E, E += u; E > 0; l = l * 256 + i[c + m], m += F, E -= 8)
      ;
    for (p = l & (1 << -E) - 1, l >>= -E, E += h; E > 0; p = p * 256 + i[c + m], m += F, E -= 8)
      ;
    if (l === 0)
      l = 1 - I;
    else {
      if (l === x)
        return p ? NaN : (w ? -1 : 1) * (1 / 0);
      p = p + Math.pow(2, h), l = l - I;
    }
    return (w ? -1 : 1) * p * Math.pow(2, l - h);
  }, X.write = function(i, c, a, h, y, l) {
    var p, u, x, I = l * 8 - y - 1, E = (1 << I) - 1, m = E >> 1, F = y === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, w = h ? 0 : l - 1, d = h ? 1 : -1, B = c < 0 || c === 0 && 1 / c < 0 ? 1 : 0;
    for (c = Math.abs(c), isNaN(c) || c === 1 / 0 ? (u = isNaN(c) ? 1 : 0, p = E) : (p = Math.floor(Math.log(c) / Math.LN2), c * (x = Math.pow(2, -p)) < 1 && (p--, x *= 2), p + m >= 1 ? c += F / x : c += F * Math.pow(2, 1 - m), c * x >= 2 && (p++, x /= 2), p + m >= E ? (u = 0, p = E) : p + m >= 1 ? (u = (c * x - 1) * Math.pow(2, y), p = p + m) : (u = c * Math.pow(2, m - 1) * Math.pow(2, y), p = 0)); y >= 8; i[a + w] = u & 255, w += d, u /= 256, y -= 8)
      ;
    for (p = p << y | u, I += y; I > 0; i[a + w] = p & 255, w += d, p /= 256, I -= 8)
      ;
    i[a + w - d] |= B * 128;
  }), X;
}
var Br;
function ct() {
  return Br || (Br = 1, (function(i) {
    const c = ut(), a = ft(), h = typeof Symbol == "function" && typeof Symbol.for == "function" ? /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom") : null;
    i.Buffer = u, i.SlowBuffer = M, i.INSPECT_MAX_BYTES = 50;
    const y = 2147483647;
    i.kMaxLength = y, u.TYPED_ARRAY_SUPPORT = l(), !u.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
      "This browser lacks typed array (Uint8Array) support which is required by \`buffer\` v5.x. Use \`buffer\` v4.x if you require old browser support."
    );
    function l() {
      try {
        const e = new Uint8Array(1), r = { foo: function() {
          return 42;
        } };
        return Object.setPrototypeOf(r, Uint8Array.prototype), Object.setPrototypeOf(e, r), e.foo() === 42;
      } catch {
        return !1;
      }
    }
    Object.defineProperty(u.prototype, "parent", {
      enumerable: !0,
      get: function() {
        if (u.isBuffer(this))
          return this.buffer;
      }
    }), Object.defineProperty(u.prototype, "offset", {
      enumerable: !0,
      get: function() {
        if (u.isBuffer(this))
          return this.byteOffset;
      }
    });
    function p(e) {
      if (e > y)
        throw new RangeError('The value "' + e + '" is invalid for option "size"');
      const r = new Uint8Array(e);
      return Object.setPrototypeOf(r, u.prototype), r;
    }
    function u(e, r, t) {
      if (typeof e == "number") {
        if (typeof r == "string")
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        return m(e);
      }
      return x(e, r, t);
    }
    u.poolSize = 8192;
    function x(e, r, t) {
      if (typeof e == "string")
        return F(e, r);
      if (ArrayBuffer.isView(e))
        return d(e);
      if (e == null)
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e
        );
      if (k(e, ArrayBuffer) || e && k(e.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (k(e, SharedArrayBuffer) || e && k(e.buffer, SharedArrayBuffer)))
        return B(e, r, t);
      if (typeof e == "number")
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      const n = e.valueOf && e.valueOf();
      if (n != null && n !== e)
        return u.from(n, r, t);
      const o = C(e);
      if (o) return o;
      if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof e[Symbol.toPrimitive] == "function")
        return u.from(e[Symbol.toPrimitive]("string"), r, t);
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e
      );
    }
    u.from = function(e, r, t) {
      return x(e, r, t);
    }, Object.setPrototypeOf(u.prototype, Uint8Array.prototype), Object.setPrototypeOf(u, Uint8Array);
    function I(e) {
      if (typeof e != "number")
        throw new TypeError('"size" argument must be of type number');
      if (e < 0)
        throw new RangeError('The value "' + e + '" is invalid for option "size"');
    }
    function E(e, r, t) {
      return I(e), e <= 0 ? p(e) : r !== void 0 ? typeof t == "string" ? p(e).fill(r, t) : p(e).fill(r) : p(e);
    }
    u.alloc = function(e, r, t) {
      return E(e, r, t);
    };
    function m(e) {
      return I(e), p(e < 0 ? 0 : A(e) | 0);
    }
    u.allocUnsafe = function(e) {
      return m(e);
    }, u.allocUnsafeSlow = function(e) {
      return m(e);
    };
    function F(e, r) {
      if ((typeof r != "string" || r === "") && (r = "utf8"), !u.isEncoding(r))
        throw new TypeError("Unknown encoding: " + r);
      const t = L(e, r) | 0;
      let n = p(t);
      const o = n.write(e, r);
      return o !== t && (n = n.slice(0, o)), n;
    }
    function w(e) {
      const r = e.length < 0 ? 0 : A(e.length) | 0, t = p(r);
      for (let n = 0; n < r; n += 1)
        t[n] = e[n] & 255;
      return t;
    }
    function d(e) {
      if (k(e, Uint8Array)) {
        const r = new Uint8Array(e);
        return B(r.buffer, r.byteOffset, r.byteLength);
      }
      return w(e);
    }
    function B(e, r, t) {
      if (r < 0 || e.byteLength < r)
        throw new RangeError('"offset" is outside of buffer bounds');
      if (e.byteLength < r + (t || 0))
        throw new RangeError('"length" is outside of buffer bounds');
      let n;
      return r === void 0 && t === void 0 ? n = new Uint8Array(e) : t === void 0 ? n = new Uint8Array(e, r) : n = new Uint8Array(e, r, t), Object.setPrototypeOf(n, u.prototype), n;
    }
    function C(e) {
      if (u.isBuffer(e)) {
        const r = A(e.length) | 0, t = p(r);
        return t.length === 0 || e.copy(t, 0, 0, r), t;
      }
      if (e.length !== void 0)
        return typeof e.length != "number" || K(e.length) ? p(0) : w(e);
      if (e.type === "Buffer" && Array.isArray(e.data))
        return w(e.data);
    }
    function A(e) {
      if (e >= y)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + y.toString(16) + " bytes");
      return e | 0;
    }
    function M(e) {
      return +e != e && (e = 0), u.alloc(+e);
    }
    u.isBuffer = function(r) {
      return r != null && r._isBuffer === !0 && r !== u.prototype;
    }, u.compare = function(r, t) {
      if (k(r, Uint8Array) && (r = u.from(r, r.offset, r.byteLength)), k(t, Uint8Array) && (t = u.from(t, t.offset, t.byteLength)), !u.isBuffer(r) || !u.isBuffer(t))
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      if (r === t) return 0;
      let n = r.length, o = t.length;
      for (let f = 0, s = Math.min(n, o); f < s; ++f)
        if (r[f] !== t[f]) {
          n = r[f], o = t[f];
          break;
        }
      return n < o ? -1 : o < n ? 1 : 0;
    }, u.isEncoding = function(r) {
      switch (String(r).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return !0;
        default:
          return !1;
      }
    }, u.concat = function(r, t) {
      if (!Array.isArray(r))
        throw new TypeError('"list" argument must be an Array of Buffers');
      if (r.length === 0)
        return u.alloc(0);
      let n;
      if (t === void 0)
        for (t = 0, n = 0; n < r.length; ++n)
          t += r[n].length;
      const o = u.allocUnsafe(t);
      let f = 0;
      for (n = 0; n < r.length; ++n) {
        let s = r[n];
        if (k(s, Uint8Array))
          f + s.length > o.length ? (u.isBuffer(s) || (s = u.from(s)), s.copy(o, f)) : Uint8Array.prototype.set.call(
            o,
            s,
            f
          );
        else if (u.isBuffer(s))
          s.copy(o, f);
        else
          throw new TypeError('"list" argument must be an Array of Buffers');
        f += s.length;
      }
      return o;
    };
    function L(e, r) {
      if (u.isBuffer(e))
        return e.length;
      if (ArrayBuffer.isView(e) || k(e, ArrayBuffer))
        return e.byteLength;
      if (typeof e != "string")
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e
        );
      const t = e.length, n = arguments.length > 2 && arguments[2] === !0;
      if (!n && t === 0) return 0;
      let o = !1;
      for (; ; )
        switch (r) {
          case "ascii":
          case "latin1":
          case "binary":
            return t;
          case "utf8":
          case "utf-8":
            return z(e).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return t * 2;
          case "hex":
            return t >>> 1;
          case "base64":
            return hr(e).length;
          default:
            if (o)
              return n ? -1 : z(e).length;
            r = ("" + r).toLowerCase(), o = !0;
        }
    }
    u.byteLength = L;
    function D(e, r, t) {
      let n = !1;
      if ((r === void 0 || r < 0) && (r = 0), r > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, r >>>= 0, t <= r))
        return "";
      for (e || (e = "utf8"); ; )
        switch (e) {
          case "hex":
            return kr(this, r, t);
          case "utf8":
          case "utf-8":
            return er(this, r, t);
          case "ascii":
            return Lr(this, r, t);
          case "latin1":
          case "binary":
            return _r(this, r, t);
          case "base64":
            return Rr(this, r, t);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return Nr(this, r, t);
          default:
            if (n) throw new TypeError("Unknown encoding: " + e);
            e = (e + "").toLowerCase(), n = !0;
        }
    }
    u.prototype._isBuffer = !0;
    function R(e, r, t) {
      const n = e[r];
      e[r] = e[t], e[t] = n;
    }
    u.prototype.swap16 = function() {
      const r = this.length;
      if (r % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      for (let t = 0; t < r; t += 2)
        R(this, t, t + 1);
      return this;
    }, u.prototype.swap32 = function() {
      const r = this.length;
      if (r % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      for (let t = 0; t < r; t += 4)
        R(this, t, t + 3), R(this, t + 1, t + 2);
      return this;
    }, u.prototype.swap64 = function() {
      const r = this.length;
      if (r % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let t = 0; t < r; t += 8)
        R(this, t, t + 7), R(this, t + 1, t + 6), R(this, t + 2, t + 5), R(this, t + 3, t + 4);
      return this;
    }, u.prototype.toString = function() {
      const r = this.length;
      return r === 0 ? "" : arguments.length === 0 ? er(this, 0, r) : D.apply(this, arguments);
    }, u.prototype.toLocaleString = u.prototype.toString, u.prototype.equals = function(r) {
      if (!u.isBuffer(r)) throw new TypeError("Argument must be a Buffer");
      return this === r ? !0 : u.compare(this, r) === 0;
    }, u.prototype.inspect = function() {
      let r = "";
      const t = i.INSPECT_MAX_BYTES;
      return r = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (r += " ... "), "<Buffer " + r + ">";
    }, h && (u.prototype[h] = u.prototype.inspect), u.prototype.compare = function(r, t, n, o, f) {
      if (k(r, Uint8Array) && (r = u.from(r, r.offset, r.byteLength)), !u.isBuffer(r))
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof r
        );
      if (t === void 0 && (t = 0), n === void 0 && (n = r ? r.length : 0), o === void 0 && (o = 0), f === void 0 && (f = this.length), t < 0 || n > r.length || o < 0 || f > this.length)
        throw new RangeError("out of range index");
      if (o >= f && t >= n)
        return 0;
      if (o >= f)
        return -1;
      if (t >= n)
        return 1;
      if (t >>>= 0, n >>>= 0, o >>>= 0, f >>>= 0, this === r) return 0;
      let s = f - o, g = n - t;
      const P = Math.min(s, g), U = this.slice(o, f), T = r.slice(t, n);
      for (let b = 0; b < P; ++b)
        if (U[b] !== T[b]) {
          s = U[b], g = T[b];
          break;
        }
      return s < g ? -1 : g < s ? 1 : 0;
    };
    function rr(e, r, t, n, o) {
      if (e.length === 0) return -1;
      if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, K(t) && (t = o ? 0 : e.length - 1), t < 0 && (t = e.length + t), t >= e.length) {
        if (o) return -1;
        t = e.length - 1;
      } else if (t < 0)
        if (o) t = 0;
        else return -1;
      if (typeof r == "string" && (r = u.from(r, n)), u.isBuffer(r))
        return r.length === 0 ? -1 : tr(e, r, t, n, o);
      if (typeof r == "number")
        return r = r & 255, typeof Uint8Array.prototype.indexOf == "function" ? o ? Uint8Array.prototype.indexOf.call(e, r, t) : Uint8Array.prototype.lastIndexOf.call(e, r, t) : tr(e, [r], t, n, o);
      throw new TypeError("val must be string, number or Buffer");
    }
    function tr(e, r, t, n, o) {
      let f = 1, s = e.length, g = r.length;
      if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
        if (e.length < 2 || r.length < 2)
          return -1;
        f = 2, s /= 2, g /= 2, t /= 2;
      }
      function P(T, b) {
        return f === 1 ? T[b] : T.readUInt16BE(b * f);
      }
      let U;
      if (o) {
        let T = -1;
        for (U = t; U < s; U++)
          if (P(e, U) === P(r, T === -1 ? 0 : U - T)) {
            if (T === -1 && (T = U), U - T + 1 === g) return T * f;
          } else
            T !== -1 && (U -= U - T), T = -1;
      } else
        for (t + g > s && (t = s - g), U = t; U >= 0; U--) {
          let T = !0;
          for (let b = 0; b < g; b++)
            if (P(e, U + b) !== P(r, b)) {
              T = !1;
              break;
            }
          if (T) return U;
        }
      return -1;
    }
    u.prototype.includes = function(r, t, n) {
      return this.indexOf(r, t, n) !== -1;
    }, u.prototype.indexOf = function(r, t, n) {
      return rr(this, r, t, n, !0);
    }, u.prototype.lastIndexOf = function(r, t, n) {
      return rr(this, r, t, n, !1);
    };
    function Ur(e, r, t, n) {
      t = Number(t) || 0;
      const o = e.length - t;
      n ? (n = Number(n), n > o && (n = o)) : n = o;
      const f = r.length;
      n > f / 2 && (n = f / 2);
      let s;
      for (s = 0; s < n; ++s) {
        const g = parseInt(r.substr(s * 2, 2), 16);
        if (K(g)) return s;
        e[t + s] = g;
      }
      return s;
    }
    function Cr(e, r, t, n) {
      return J(z(r, e.length - t), e, t, n);
    }
    function Mr(e, r, t, n) {
      return J(Gr(r), e, t, n);
    }
    function Pr(e, r, t, n) {
      return J(hr(r), e, t, n);
    }
    function Tr(e, r, t, n) {
      return J(qr(r, e.length - t), e, t, n);
    }
    u.prototype.write = function(r, t, n, o) {
      if (t === void 0)
        o = "utf8", n = this.length, t = 0;
      else if (n === void 0 && typeof t == "string")
        o = t, n = this.length, t = 0;
      else if (isFinite(t))
        t = t >>> 0, isFinite(n) ? (n = n >>> 0, o === void 0 && (o = "utf8")) : (o = n, n = void 0);
      else
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      const f = this.length - t;
      if ((n === void 0 || n > f) && (n = f), r.length > 0 && (n < 0 || t < 0) || t > this.length)
        throw new RangeError("Attempt to write outside buffer bounds");
      o || (o = "utf8");
      let s = !1;
      for (; ; )
        switch (o) {
          case "hex":
            return Ur(this, r, t, n);
          case "utf8":
          case "utf-8":
            return Cr(this, r, t, n);
          case "ascii":
          case "latin1":
          case "binary":
            return Mr(this, r, t, n);
          case "base64":
            return Pr(this, r, t, n);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return Tr(this, r, t, n);
          default:
            if (s) throw new TypeError("Unknown encoding: " + o);
            o = ("" + o).toLowerCase(), s = !0;
        }
    }, u.prototype.toJSON = function() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function Rr(e, r, t) {
      return r === 0 && t === e.length ? c.fromByteArray(e) : c.fromByteArray(e.slice(r, t));
    }
    function er(e, r, t) {
      t = Math.min(e.length, t);
      const n = [];
      let o = r;
      for (; o < t; ) {
        const f = e[o];
        let s = null, g = f > 239 ? 4 : f > 223 ? 3 : f > 191 ? 2 : 1;
        if (o + g <= t) {
          let P, U, T, b;
          switch (g) {
            case 1:
              f < 128 && (s = f);
              break;
            case 2:
              P = e[o + 1], (P & 192) === 128 && (b = (f & 31) << 6 | P & 63, b > 127 && (s = b));
              break;
            case 3:
              P = e[o + 1], U = e[o + 2], (P & 192) === 128 && (U & 192) === 128 && (b = (f & 15) << 12 | (P & 63) << 6 | U & 63, b > 2047 && (b < 55296 || b > 57343) && (s = b));
              break;
            case 4:
              P = e[o + 1], U = e[o + 2], T = e[o + 3], (P & 192) === 128 && (U & 192) === 128 && (T & 192) === 128 && (b = (f & 15) << 18 | (P & 63) << 12 | (U & 63) << 6 | T & 63, b > 65535 && b < 1114112 && (s = b));
          }
        }
        s === null ? (s = 65533, g = 1) : s > 65535 && (s -= 65536, n.push(s >>> 10 & 1023 | 55296), s = 56320 | s & 1023), n.push(s), o += g;
      }
      return Sr(n);
    }
    const nr = 4096;
    function Sr(e) {
      const r = e.length;
      if (r <= nr)
        return String.fromCharCode.apply(String, e);
      let t = "", n = 0;
      for (; n < r; )
        t += String.fromCharCode.apply(
          String,
          e.slice(n, n += nr)
        );
      return t;
    }
    function Lr(e, r, t) {
      let n = "";
      t = Math.min(e.length, t);
      for (let o = r; o < t; ++o)
        n += String.fromCharCode(e[o] & 127);
      return n;
    }
    function _r(e, r, t) {
      let n = "";
      t = Math.min(e.length, t);
      for (let o = r; o < t; ++o)
        n += String.fromCharCode(e[o]);
      return n;
    }
    function kr(e, r, t) {
      const n = e.length;
      (!r || r < 0) && (r = 0), (!t || t < 0 || t > n) && (t = n);
      let o = "";
      for (let f = r; f < t; ++f)
        o += Yr[e[f]];
      return o;
    }
    function Nr(e, r, t) {
      const n = e.slice(r, t);
      let o = "";
      for (let f = 0; f < n.length - 1; f += 2)
        o += String.fromCharCode(n[f] + n[f + 1] * 256);
      return o;
    }
    u.prototype.slice = function(r, t) {
      const n = this.length;
      r = ~~r, t = t === void 0 ? n : ~~t, r < 0 ? (r += n, r < 0 && (r = 0)) : r > n && (r = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < r && (t = r);
      const o = this.subarray(r, t);
      return Object.setPrototypeOf(o, u.prototype), o;
    };
    function S(e, r, t) {
      if (e % 1 !== 0 || e < 0) throw new RangeError("offset is not uint");
      if (e + r > t) throw new RangeError("Trying to access beyond buffer length");
    }
    u.prototype.readUintLE = u.prototype.readUIntLE = function(r, t, n) {
      r = r >>> 0, t = t >>> 0, n || S(r, t, this.length);
      let o = this[r], f = 1, s = 0;
      for (; ++s < t && (f *= 256); )
        o += this[r + s] * f;
      return o;
    }, u.prototype.readUintBE = u.prototype.readUIntBE = function(r, t, n) {
      r = r >>> 0, t = t >>> 0, n || S(r, t, this.length);
      let o = this[r + --t], f = 1;
      for (; t > 0 && (f *= 256); )
        o += this[r + --t] * f;
      return o;
    }, u.prototype.readUint8 = u.prototype.readUInt8 = function(r, t) {
      return r = r >>> 0, t || S(r, 1, this.length), this[r];
    }, u.prototype.readUint16LE = u.prototype.readUInt16LE = function(r, t) {
      return r = r >>> 0, t || S(r, 2, this.length), this[r] | this[r + 1] << 8;
    }, u.prototype.readUint16BE = u.prototype.readUInt16BE = function(r, t) {
      return r = r >>> 0, t || S(r, 2, this.length), this[r] << 8 | this[r + 1];
    }, u.prototype.readUint32LE = u.prototype.readUInt32LE = function(r, t) {
      return r = r >>> 0, t || S(r, 4, this.length), (this[r] | this[r + 1] << 8 | this[r + 2] << 16) + this[r + 3] * 16777216;
    }, u.prototype.readUint32BE = u.prototype.readUInt32BE = function(r, t) {
      return r = r >>> 0, t || S(r, 4, this.length), this[r] * 16777216 + (this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3]);
    }, u.prototype.readBigUInt64LE = N(function(r) {
      r = r >>> 0, $(r, "offset");
      const t = this[r], n = this[r + 7];
      (t === void 0 || n === void 0) && G(r, this.length - 8);
      const o = t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24, f = this[++r] + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + n * 2 ** 24;
      return BigInt(o) + (BigInt(f) << BigInt(32));
    }), u.prototype.readBigUInt64BE = N(function(r) {
      r = r >>> 0, $(r, "offset");
      const t = this[r], n = this[r + 7];
      (t === void 0 || n === void 0) && G(r, this.length - 8);
      const o = t * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r], f = this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + n;
      return (BigInt(o) << BigInt(32)) + BigInt(f);
    }), u.prototype.readIntLE = function(r, t, n) {
      r = r >>> 0, t = t >>> 0, n || S(r, t, this.length);
      let o = this[r], f = 1, s = 0;
      for (; ++s < t && (f *= 256); )
        o += this[r + s] * f;
      return f *= 128, o >= f && (o -= Math.pow(2, 8 * t)), o;
    }, u.prototype.readIntBE = function(r, t, n) {
      r = r >>> 0, t = t >>> 0, n || S(r, t, this.length);
      let o = t, f = 1, s = this[r + --o];
      for (; o > 0 && (f *= 256); )
        s += this[r + --o] * f;
      return f *= 128, s >= f && (s -= Math.pow(2, 8 * t)), s;
    }, u.prototype.readInt8 = function(r, t) {
      return r = r >>> 0, t || S(r, 1, this.length), this[r] & 128 ? (255 - this[r] + 1) * -1 : this[r];
    }, u.prototype.readInt16LE = function(r, t) {
      r = r >>> 0, t || S(r, 2, this.length);
      const n = this[r] | this[r + 1] << 8;
      return n & 32768 ? n | 4294901760 : n;
    }, u.prototype.readInt16BE = function(r, t) {
      r = r >>> 0, t || S(r, 2, this.length);
      const n = this[r + 1] | this[r] << 8;
      return n & 32768 ? n | 4294901760 : n;
    }, u.prototype.readInt32LE = function(r, t) {
      return r = r >>> 0, t || S(r, 4, this.length), this[r] | this[r + 1] << 8 | this[r + 2] << 16 | this[r + 3] << 24;
    }, u.prototype.readInt32BE = function(r, t) {
      return r = r >>> 0, t || S(r, 4, this.length), this[r] << 24 | this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3];
    }, u.prototype.readBigInt64LE = N(function(r) {
      r = r >>> 0, $(r, "offset");
      const t = this[r], n = this[r + 7];
      (t === void 0 || n === void 0) && G(r, this.length - 8);
      const o = this[r + 4] + this[r + 5] * 2 ** 8 + this[r + 6] * 2 ** 16 + (n << 24);
      return (BigInt(o) << BigInt(32)) + BigInt(t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24);
    }), u.prototype.readBigInt64BE = N(function(r) {
      r = r >>> 0, $(r, "offset");
      const t = this[r], n = this[r + 7];
      (t === void 0 || n === void 0) && G(r, this.length - 8);
      const o = (t << 24) + // Overflow
      this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r];
      return (BigInt(o) << BigInt(32)) + BigInt(this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + n);
    }), u.prototype.readFloatLE = function(r, t) {
      return r = r >>> 0, t || S(r, 4, this.length), a.read(this, r, !0, 23, 4);
    }, u.prototype.readFloatBE = function(r, t) {
      return r = r >>> 0, t || S(r, 4, this.length), a.read(this, r, !1, 23, 4);
    }, u.prototype.readDoubleLE = function(r, t) {
      return r = r >>> 0, t || S(r, 8, this.length), a.read(this, r, !0, 52, 8);
    }, u.prototype.readDoubleBE = function(r, t) {
      return r = r >>> 0, t || S(r, 8, this.length), a.read(this, r, !1, 52, 8);
    };
    function _(e, r, t, n, o, f) {
      if (!u.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (r > o || r < f) throw new RangeError('"value" argument is out of bounds');
      if (t + n > e.length) throw new RangeError("Index out of range");
    }
    u.prototype.writeUintLE = u.prototype.writeUIntLE = function(r, t, n, o) {
      if (r = +r, t = t >>> 0, n = n >>> 0, !o) {
        const g = Math.pow(2, 8 * n) - 1;
        _(this, r, t, n, g, 0);
      }
      let f = 1, s = 0;
      for (this[t] = r & 255; ++s < n && (f *= 256); )
        this[t + s] = r / f & 255;
      return t + n;
    }, u.prototype.writeUintBE = u.prototype.writeUIntBE = function(r, t, n, o) {
      if (r = +r, t = t >>> 0, n = n >>> 0, !o) {
        const g = Math.pow(2, 8 * n) - 1;
        _(this, r, t, n, g, 0);
      }
      let f = n - 1, s = 1;
      for (this[t + f] = r & 255; --f >= 0 && (s *= 256); )
        this[t + f] = r / s & 255;
      return t + n;
    }, u.prototype.writeUint8 = u.prototype.writeUInt8 = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 1, 255, 0), this[t] = r & 255, t + 1;
    }, u.prototype.writeUint16LE = u.prototype.writeUInt16LE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 2, 65535, 0), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
    }, u.prototype.writeUint16BE = u.prototype.writeUInt16BE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 2, 65535, 0), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
    }, u.prototype.writeUint32LE = u.prototype.writeUInt32LE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 4, 4294967295, 0), this[t + 3] = r >>> 24, this[t + 2] = r >>> 16, this[t + 1] = r >>> 8, this[t] = r & 255, t + 4;
    }, u.prototype.writeUint32BE = u.prototype.writeUInt32BE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 4, 4294967295, 0), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
    };
    function ir(e, r, t, n, o) {
      sr(r, n, o, e, t, 7);
      let f = Number(r & BigInt(4294967295));
      e[t++] = f, f = f >> 8, e[t++] = f, f = f >> 8, e[t++] = f, f = f >> 8, e[t++] = f;
      let s = Number(r >> BigInt(32) & BigInt(4294967295));
      return e[t++] = s, s = s >> 8, e[t++] = s, s = s >> 8, e[t++] = s, s = s >> 8, e[t++] = s, t;
    }
    function or(e, r, t, n, o) {
      sr(r, n, o, e, t, 7);
      let f = Number(r & BigInt(4294967295));
      e[t + 7] = f, f = f >> 8, e[t + 6] = f, f = f >> 8, e[t + 5] = f, f = f >> 8, e[t + 4] = f;
      let s = Number(r >> BigInt(32) & BigInt(4294967295));
      return e[t + 3] = s, s = s >> 8, e[t + 2] = s, s = s >> 8, e[t + 1] = s, s = s >> 8, e[t] = s, t + 8;
    }
    u.prototype.writeBigUInt64LE = N(function(r, t = 0) {
      return ir(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
    }), u.prototype.writeBigUInt64BE = N(function(r, t = 0) {
      return or(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
    }), u.prototype.writeIntLE = function(r, t, n, o) {
      if (r = +r, t = t >>> 0, !o) {
        const P = Math.pow(2, 8 * n - 1);
        _(this, r, t, n, P - 1, -P);
      }
      let f = 0, s = 1, g = 0;
      for (this[t] = r & 255; ++f < n && (s *= 256); )
        r < 0 && g === 0 && this[t + f - 1] !== 0 && (g = 1), this[t + f] = (r / s >> 0) - g & 255;
      return t + n;
    }, u.prototype.writeIntBE = function(r, t, n, o) {
      if (r = +r, t = t >>> 0, !o) {
        const P = Math.pow(2, 8 * n - 1);
        _(this, r, t, n, P - 1, -P);
      }
      let f = n - 1, s = 1, g = 0;
      for (this[t + f] = r & 255; --f >= 0 && (s *= 256); )
        r < 0 && g === 0 && this[t + f + 1] !== 0 && (g = 1), this[t + f] = (r / s >> 0) - g & 255;
      return t + n;
    }, u.prototype.writeInt8 = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 1, 127, -128), r < 0 && (r = 255 + r + 1), this[t] = r & 255, t + 1;
    }, u.prototype.writeInt16LE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 2, 32767, -32768), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
    }, u.prototype.writeInt16BE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 2, 32767, -32768), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
    }, u.prototype.writeInt32LE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 4, 2147483647, -2147483648), this[t] = r & 255, this[t + 1] = r >>> 8, this[t + 2] = r >>> 16, this[t + 3] = r >>> 24, t + 4;
    }, u.prototype.writeInt32BE = function(r, t, n) {
      return r = +r, t = t >>> 0, n || _(this, r, t, 4, 2147483647, -2147483648), r < 0 && (r = 4294967295 + r + 1), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
    }, u.prototype.writeBigInt64LE = N(function(r, t = 0) {
      return ir(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }), u.prototype.writeBigInt64BE = N(function(r, t = 0) {
      return or(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function ur(e, r, t, n, o, f) {
      if (t + n > e.length) throw new RangeError("Index out of range");
      if (t < 0) throw new RangeError("Index out of range");
    }
    function fr(e, r, t, n, o) {
      return r = +r, t = t >>> 0, o || ur(e, r, t, 4), a.write(e, r, t, n, 23, 4), t + 4;
    }
    u.prototype.writeFloatLE = function(r, t, n) {
      return fr(this, r, t, !0, n);
    }, u.prototype.writeFloatBE = function(r, t, n) {
      return fr(this, r, t, !1, n);
    };
    function cr(e, r, t, n, o) {
      return r = +r, t = t >>> 0, o || ur(e, r, t, 8), a.write(e, r, t, n, 52, 8), t + 8;
    }
    u.prototype.writeDoubleLE = function(r, t, n) {
      return cr(this, r, t, !0, n);
    }, u.prototype.writeDoubleBE = function(r, t, n) {
      return cr(this, r, t, !1, n);
    }, u.prototype.copy = function(r, t, n, o) {
      if (!u.isBuffer(r)) throw new TypeError("argument should be a Buffer");
      if (n || (n = 0), !o && o !== 0 && (o = this.length), t >= r.length && (t = r.length), t || (t = 0), o > 0 && o < n && (o = n), o === n || r.length === 0 || this.length === 0) return 0;
      if (t < 0)
        throw new RangeError("targetStart out of bounds");
      if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
      if (o < 0) throw new RangeError("sourceEnd out of bounds");
      o > this.length && (o = this.length), r.length - t < o - n && (o = r.length - t + n);
      const f = o - n;
      return this === r && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, o) : Uint8Array.prototype.set.call(
        r,
        this.subarray(n, o),
        t
      ), f;
    }, u.prototype.fill = function(r, t, n, o) {
      if (typeof r == "string") {
        if (typeof t == "string" ? (o = t, t = 0, n = this.length) : typeof n == "string" && (o = n, n = this.length), o !== void 0 && typeof o != "string")
          throw new TypeError("encoding must be a string");
        if (typeof o == "string" && !u.isEncoding(o))
          throw new TypeError("Unknown encoding: " + o);
        if (r.length === 1) {
          const s = r.charCodeAt(0);
          (o === "utf8" && s < 128 || o === "latin1") && (r = s);
        }
      } else typeof r == "number" ? r = r & 255 : typeof r == "boolean" && (r = Number(r));
      if (t < 0 || this.length < t || this.length < n)
        throw new RangeError("Out of range index");
      if (n <= t)
        return this;
      t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, r || (r = 0);
      let f;
      if (typeof r == "number")
        for (f = t; f < n; ++f)
          this[f] = r;
      else {
        const s = u.isBuffer(r) ? r : u.from(r, o), g = s.length;
        if (g === 0)
          throw new TypeError('The value "' + r + '" is invalid for argument "value"');
        for (f = 0; f < n - t; ++f)
          this[f + t] = s[f % g];
      }
      return this;
    };
    const O = {};
    function H(e, r, t) {
      O[e] = class extends t {
        constructor() {
          super(), Object.defineProperty(this, "message", {
            value: r.apply(this, arguments),
            writable: !0,
            configurable: !0
          }), this.name = \`\${this.name} [\${e}]\`, this.stack, delete this.name;
        }
        get code() {
          return e;
        }
        set code(o) {
          Object.defineProperty(this, "code", {
            configurable: !0,
            enumerable: !0,
            value: o,
            writable: !0
          });
        }
        toString() {
          return \`\${this.name} [\${e}]: \${this.message}\`;
        }
      };
    }
    H(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(e) {
        return e ? \`\${e} is outside of buffer bounds\` : "Attempt to access memory outside buffer bounds";
      },
      RangeError
    ), H(
      "ERR_INVALID_ARG_TYPE",
      function(e, r) {
        return \`The "\${e}" argument must be of type number. Received type \${typeof r}\`;
      },
      TypeError
    ), H(
      "ERR_OUT_OF_RANGE",
      function(e, r, t) {
        let n = \`The value of "\${e}" is out of range.\`, o = t;
        return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? o = ar(String(t)) : typeof t == "bigint" && (o = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (o = ar(o)), o += "n"), n += \` It must be \${r}. Received \${o}\`, n;
      },
      RangeError
    );
    function ar(e) {
      let r = "", t = e.length;
      const n = e[0] === "-" ? 1 : 0;
      for (; t >= n + 4; t -= 3)
        r = \`_\${e.slice(t - 3, t)}\${r}\`;
      return \`\${e.slice(0, t)}\${r}\`;
    }
    function Dr(e, r, t) {
      $(r, "offset"), (e[r] === void 0 || e[r + t] === void 0) && G(r, e.length - (t + 1));
    }
    function sr(e, r, t, n, o, f) {
      if (e > t || e < r) {
        const s = typeof r == "bigint" ? "n" : "";
        let g;
        throw r === 0 || r === BigInt(0) ? g = \`>= 0\${s} and < 2\${s} ** \${(f + 1) * 8}\${s}\` : g = \`>= -(2\${s} ** \${(f + 1) * 8 - 1}\${s}) and < 2 ** \${(f + 1) * 8 - 1}\${s}\`, new O.ERR_OUT_OF_RANGE("value", g, e);
      }
      Dr(n, o, f);
    }
    function $(e, r) {
      if (typeof e != "number")
        throw new O.ERR_INVALID_ARG_TYPE(r, "number", e);
    }
    function G(e, r, t) {
      throw Math.floor(e) !== e ? ($(e, t), new O.ERR_OUT_OF_RANGE("offset", "an integer", e)) : r < 0 ? new O.ERR_BUFFER_OUT_OF_BOUNDS() : new O.ERR_OUT_OF_RANGE(
        "offset",
        \`>= 0 and <= \${r}\`,
        e
      );
    }
    const Or = /[^+/0-9A-Za-z-_]/g;
    function $r(e) {
      if (e = e.split("=")[0], e = e.trim().replace(Or, ""), e.length < 2) return "";
      for (; e.length % 4 !== 0; )
        e = e + "=";
      return e;
    }
    function z(e, r) {
      r = r || 1 / 0;
      let t;
      const n = e.length;
      let o = null;
      const f = [];
      for (let s = 0; s < n; ++s) {
        if (t = e.charCodeAt(s), t > 55295 && t < 57344) {
          if (!o) {
            if (t > 56319) {
              (r -= 3) > -1 && f.push(239, 191, 189);
              continue;
            } else if (s + 1 === n) {
              (r -= 3) > -1 && f.push(239, 191, 189);
              continue;
            }
            o = t;
            continue;
          }
          if (t < 56320) {
            (r -= 3) > -1 && f.push(239, 191, 189), o = t;
            continue;
          }
          t = (o - 55296 << 10 | t - 56320) + 65536;
        } else o && (r -= 3) > -1 && f.push(239, 191, 189);
        if (o = null, t < 128) {
          if ((r -= 1) < 0) break;
          f.push(t);
        } else if (t < 2048) {
          if ((r -= 2) < 0) break;
          f.push(
            t >> 6 | 192,
            t & 63 | 128
          );
        } else if (t < 65536) {
          if ((r -= 3) < 0) break;
          f.push(
            t >> 12 | 224,
            t >> 6 & 63 | 128,
            t & 63 | 128
          );
        } else if (t < 1114112) {
          if ((r -= 4) < 0) break;
          f.push(
            t >> 18 | 240,
            t >> 12 & 63 | 128,
            t >> 6 & 63 | 128,
            t & 63 | 128
          );
        } else
          throw new Error("Invalid code point");
      }
      return f;
    }
    function Gr(e) {
      const r = [];
      for (let t = 0; t < e.length; ++t)
        r.push(e.charCodeAt(t) & 255);
      return r;
    }
    function qr(e, r) {
      let t, n, o;
      const f = [];
      for (let s = 0; s < e.length && !((r -= 2) < 0); ++s)
        t = e.charCodeAt(s), n = t >> 8, o = t % 256, f.push(o), f.push(n);
      return f;
    }
    function hr(e) {
      return c.toByteArray($r(e));
    }
    function J(e, r, t, n) {
      let o;
      for (o = 0; o < n && !(o + t >= r.length || o >= e.length); ++o)
        r[o + t] = e[o];
      return o;
    }
    function k(e, r) {
      return e instanceof r || e != null && e.constructor != null && e.constructor.name != null && e.constructor.name === r.name;
    }
    function K(e) {
      return e !== e;
    }
    const Yr = (function() {
      const e = "0123456789abcdef", r = new Array(256);
      for (let t = 0; t < 16; ++t) {
        const n = t * 16;
        for (let o = 0; o < 16; ++o)
          r[n + o] = e[t] + e[o];
      }
      return r;
    })();
    function N(e) {
      return typeof BigInt > "u" ? Jr : e;
    }
    function Jr() {
      throw new Error("BigInt not supported");
    }
  })(Q)), Q;
}
var br = ct();
const at = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
at.Buffer = br.Buffer;
const st = (i) => br.Buffer.from(JSON.stringify(i)).buffer, ht = (i) => JSON.parse(new TextDecoder().decode(i)), mr = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {}, lt = (i, c, a) => {
  const [h, y, l] = c.split("|"), p = Math.pow(2, h) * a, u = 85.05112878, x = 1e-6;
  return i[0].some((E) => {
    E[1] = Math.max(Math.min(E[1], u), -u);
    const m = Math.sin(E[1] * Math.PI / 180), F = (E[0] + 180) / 360, w = 0.5 - Math.log((1 + m) / (1 - m)) / (4 * Math.PI), d = F * p, B = w * p, C = Math.floor(d / a), A = Math.floor(B / a), M = Math.floor(d - C * a), L = Math.floor(B - A * a);
    return A != l || C != y || M <= x || L <= x;
  });
};
mr.onmessage = (i) => {
  const c = i.data, a = ht(c), h = a.tolerance, y = a.unique, l = a.tilesize, u = nt(a.collection, { tolerance: h, mutate: !0 }), x = /* @__PURE__ */ new Map();
  u.features.forEach((E) => {
    const m = E.id, F = x.get(m) || [];
    F.push(E), x.set(m, F);
  }), x.forEach((E, m) => {
    let F = { type: "FeatureCollection", features: E };
    F = ot(F), F.features.forEach((A, M) => {
      A.properties._index = \`\${y}|\${m}|\${M}\`;
    });
    const w = F.features.filter((A) => !A.properties.clipped), d = F.features.filter((A) => A.properties.clipped), B = [], C = [];
    d.forEach((A) => {
      lt(A.geometry.coordinates, y, l) ? B.push(A) : (A.properties.clipped = !1, C.push(A));
    }), F.features = [...w, ...C, ...B], x.set(m, F);
  });
  const I = Object.assign({}, Object.fromEntries(x), { unique: y, type: "simplified" });
  mr.postMessage(st(I));
};
`, zn = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", rt], { type: "text/javascript;charset=utf-8" });
function Wt(s) {
  let t;
  try {
    if (t = zn && (self.URL || self.webkitURL).createObjectURL(zn), !t) throw "";
    const r = new Worker(t, {
      type: "module",
      name: s?.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(rt),
      {
        type: "module",
        name: s?.name
      }
    );
  }
}
const it = `var Qe = /^-?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?$/i, te = Math.ceil, gt = Math.floor, ht = "[BigNumber Error] ", ye = ht + "Number primitive has more than 15 significant digits: ", wt = 1e14, V = 14, ee = 9007199254740991, re = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13], At = 1e7, lt = 1e9;
function ke(n) {
  var e, r, o, s = v.prototype = { constructor: v, toString: null, valueOf: null }, c = new v(1), h = 20, l = 4, w = -7, g = 21, R = -1e7, d = 1e7, F = !1, A = 1, L = 0, C = {
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
  function v(f, p) {
    var y, I, x, S, P, m, B, T, b = this;
    if (!(b instanceof v)) return new v(f, p);
    if (p == null) {
      if (f && f._isBigNumber === !0) {
        b.s = f.s, !f.c || f.e > d ? b.c = b.e = null : f.e < R ? b.c = [b.e = 0] : (b.e = f.e, b.c = f.c.slice());
        return;
      }
      if ((m = typeof f == "number") && f * 0 == 0) {
        if (b.s = 1 / f < 0 ? (f = -f, -1) : 1, f === ~~f) {
          for (S = 0, P = f; P >= 10; P /= 10, S++) ;
          S > d ? b.c = b.e = null : (b.e = S, b.c = [f]);
          return;
        }
        T = String(f);
      } else {
        if (!Qe.test(T = String(f))) return o(b, T, m);
        b.s = T.charCodeAt(0) == 45 ? (T = T.slice(1), -1) : 1;
      }
      (S = T.indexOf(".")) > -1 && (T = T.replace(".", "")), (P = T.search(/e/i)) > 0 ? (S < 0 && (S = P), S += +T.slice(P + 1), T = T.substring(0, P)) : S < 0 && (S = T.length);
    } else {
      if (tt(p, 2, k.length, "Base"), p == 10 && N)
        return b = new v(f), K(b, h + b.e + 1, l);
      if (T = String(f), m = typeof f == "number") {
        if (f * 0 != 0) return o(b, T, m, p);
        if (b.s = 1 / f < 0 ? (T = T.slice(1), -1) : 1, v.DEBUG && T.replace(/^0\\.0*|\\./, "").length > 15)
          throw Error(ye + f);
      } else
        b.s = T.charCodeAt(0) === 45 ? (T = T.slice(1), -1) : 1;
      for (y = k.slice(0, p), S = P = 0, B = T.length; P < B; P++)
        if (y.indexOf(I = T.charAt(P)) < 0) {
          if (I == ".") {
            if (P > S) {
              S = B;
              continue;
            }
          } else if (!x && (T == T.toUpperCase() && (T = T.toLowerCase()) || T == T.toLowerCase() && (T = T.toUpperCase()))) {
            x = !0, P = -1, S = 0;
            continue;
          }
          return o(b, String(f), m, p);
        }
      m = !1, T = r(T, p, 10, b.s), (S = T.indexOf(".")) > -1 ? T = T.replace(".", "") : S = T.length;
    }
    for (P = 0; T.charCodeAt(P) === 48; P++) ;
    for (B = T.length; T.charCodeAt(--B) === 48; ) ;
    if (T = T.slice(P, ++B)) {
      if (B -= P, m && v.DEBUG && B > 15 && (f > ee || f !== gt(f)))
        throw Error(ye + b.s * f);
      if ((S = S - P - 1) > d)
        b.c = b.e = null;
      else if (S < R)
        b.c = [b.e = 0];
      else {
        if (b.e = S, b.c = [], P = (S + 1) % V, S < 0 && (P += V), P < B) {
          for (P && b.c.push(+T.slice(0, P)), B -= V; P < B; )
            b.c.push(+T.slice(P, P += V));
          P = V - (T = T.slice(P)).length;
        } else
          P -= B;
        for (; P--; T += "0") ;
        b.c.push(+T);
      }
    } else
      b.c = [b.e = 0];
  }
  v.clone = ke, v.ROUND_UP = 0, v.ROUND_DOWN = 1, v.ROUND_CEIL = 2, v.ROUND_FLOOR = 3, v.ROUND_HALF_UP = 4, v.ROUND_HALF_DOWN = 5, v.ROUND_HALF_EVEN = 6, v.ROUND_HALF_CEIL = 7, v.ROUND_HALF_FLOOR = 8, v.EUCLID = 9, v.config = v.set = function(f) {
    var p, y;
    if (f != null)
      if (typeof f == "object") {
        if (f.hasOwnProperty(p = "DECIMAL_PLACES") && (y = f[p], tt(y, 0, lt, p), h = y), f.hasOwnProperty(p = "ROUNDING_MODE") && (y = f[p], tt(y, 0, 8, p), l = y), f.hasOwnProperty(p = "EXPONENTIAL_AT") && (y = f[p], y && y.pop ? (tt(y[0], -lt, 0, p), tt(y[1], 0, lt, p), w = y[0], g = y[1]) : (tt(y, -lt, lt, p), w = -(g = y < 0 ? -y : y))), f.hasOwnProperty(p = "RANGE"))
          if (y = f[p], y && y.pop)
            tt(y[0], -lt, -1, p), tt(y[1], 1, lt, p), R = y[0], d = y[1];
          else if (tt(y, -lt, lt, p), y)
            R = -(d = y < 0 ? -y : y);
          else
            throw Error(ht + p + " cannot be zero: " + y);
        if (f.hasOwnProperty(p = "CRYPTO"))
          if (y = f[p], y === !!y)
            if (y)
              if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                F = y;
              else
                throw F = !y, Error(ht + "crypto unavailable");
            else
              F = y;
          else
            throw Error(ht + p + " not true or false: " + y);
        if (f.hasOwnProperty(p = "MODULO_MODE") && (y = f[p], tt(y, 0, 9, p), A = y), f.hasOwnProperty(p = "POW_PRECISION") && (y = f[p], tt(y, 0, lt, p), L = y), f.hasOwnProperty(p = "FORMAT"))
          if (y = f[p], typeof y == "object") C = y;
          else throw Error(ht + p + " not an object: " + y);
        if (f.hasOwnProperty(p = "ALPHABET"))
          if (y = f[p], typeof y == "string" && !/^.?$|[+\\-.\\s]|(.).*\\1/.test(y))
            N = y.slice(0, 10) == "0123456789", k = y;
          else
            throw Error(ht + p + " invalid: " + y);
      } else
        throw Error(ht + "Object expected: " + f);
    return {
      DECIMAL_PLACES: h,
      ROUNDING_MODE: l,
      EXPONENTIAL_AT: [w, g],
      RANGE: [R, d],
      CRYPTO: F,
      MODULO_MODE: A,
      POW_PRECISION: L,
      FORMAT: C,
      ALPHABET: k
    };
  }, v.isBigNumber = function(f) {
    if (!f || f._isBigNumber !== !0) return !1;
    if (!v.DEBUG) return !0;
    var p, y, I = f.c, x = f.e, S = f.s;
    t: if ({}.toString.call(I) == "[object Array]") {
      if ((S === 1 || S === -1) && x >= -lt && x <= lt && x === gt(x)) {
        if (I[0] === 0) {
          if (x === 0 && I.length === 1) return !0;
          break t;
        }
        if (p = (x + 1) % V, p < 1 && (p += V), String(I[0]).length == p) {
          for (p = 0; p < I.length; p++)
            if (y = I[p], y < 0 || y >= wt || y !== gt(y)) break t;
          if (y !== 0) return !0;
        }
      }
    } else if (I === null && x === null && (S === null || S === 1 || S === -1))
      return !0;
    throw Error(ht + "Invalid BigNumber: " + f);
  }, v.maximum = v.max = function() {
    return $(arguments, -1);
  }, v.minimum = v.min = function() {
    return $(arguments, 1);
  }, v.random = (function() {
    var f = 9007199254740992, p = Math.random() * f & 2097151 ? function() {
      return gt(Math.random() * f);
    } : function() {
      return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
    };
    return function(y) {
      var I, x, S, P, m, B = 0, T = [], b = new v(c);
      if (y == null ? y = h : tt(y, 0, lt), P = te(y / V), F)
        if (crypto.getRandomValues) {
          for (I = crypto.getRandomValues(new Uint32Array(P *= 2)); B < P; )
            m = I[B] * 131072 + (I[B + 1] >>> 11), m >= 9e15 ? (x = crypto.getRandomValues(new Uint32Array(2)), I[B] = x[0], I[B + 1] = x[1]) : (T.push(m % 1e14), B += 2);
          B = P / 2;
        } else if (crypto.randomBytes) {
          for (I = crypto.randomBytes(P *= 7); B < P; )
            m = (I[B] & 31) * 281474976710656 + I[B + 1] * 1099511627776 + I[B + 2] * 4294967296 + I[B + 3] * 16777216 + (I[B + 4] << 16) + (I[B + 5] << 8) + I[B + 6], m >= 9e15 ? crypto.randomBytes(7).copy(I, B) : (T.push(m % 1e14), B += 7);
          B = P / 7;
        } else
          throw F = !1, Error(ht + "crypto unavailable");
      if (!F)
        for (; B < P; )
          m = p(), m < 9e15 && (T[B++] = m % 1e14);
      for (P = T[--B], y %= V, P && y && (m = re[V - y], T[B] = gt(P / m) * m); T[B] === 0; T.pop(), B--) ;
      if (B < 0)
        T = [S = 0];
      else {
        for (S = -1; T[0] === 0; T.splice(0, 1), S -= V) ;
        for (B = 1, m = T[0]; m >= 10; m /= 10, B++) ;
        B < V && (S -= V - B);
      }
      return b.e = S, b.c = T, b;
    };
  })(), v.sum = function() {
    for (var f = 1, p = arguments, y = new v(p[0]); f < p.length; ) y = y.plus(p[f++]);
    return y;
  }, r = /* @__PURE__ */ (function() {
    var f = "0123456789";
    function p(y, I, x, S) {
      for (var P, m = [0], B, T = 0, b = y.length; T < b; ) {
        for (B = m.length; B--; m[B] *= I) ;
        for (m[0] += S.indexOf(y.charAt(T++)), P = 0; P < m.length; P++)
          m[P] > x - 1 && (m[P + 1] == null && (m[P + 1] = 0), m[P + 1] += m[P] / x | 0, m[P] %= x);
      }
      return m.reverse();
    }
    return function(y, I, x, S, P) {
      var m, B, T, b, O, G, U, z, Z = y.indexOf("."), et = h, X = l;
      for (Z >= 0 && (b = L, L = 0, y = y.replace(".", ""), z = new v(I), G = z.pow(y.length - Z), L = b, z.c = p(
        St(pt(G.c), G.e, "0"),
        10,
        x,
        f
      ), z.e = z.c.length), U = p(y, I, x, P ? (m = k, f) : (m = f, k)), T = b = U.length; U[--b] == 0; U.pop()) ;
      if (!U[0]) return m.charAt(0);
      if (Z < 0 ? --T : (G.c = U, G.e = T, G.s = S, G = e(G, z, et, X, x), U = G.c, O = G.r, T = G.e), B = T + et + 1, Z = U[B], b = x / 2, O = O || B < 0 || U[B + 1] != null, O = X < 4 ? (Z != null || O) && (X == 0 || X == (G.s < 0 ? 3 : 2)) : Z > b || Z == b && (X == 4 || O || X == 6 && U[B - 1] & 1 || X == (G.s < 0 ? 8 : 7)), B < 1 || !U[0])
        y = O ? St(m.charAt(1), -et, m.charAt(0)) : m.charAt(0);
      else {
        if (U.length = B, O)
          for (--x; ++U[--B] > x; )
            U[B] = 0, B || (++T, U = [1].concat(U));
        for (b = U.length; !U[--b]; ) ;
        for (Z = 0, y = ""; Z <= b; y += m.charAt(U[Z++])) ;
        y = St(y, T, m.charAt(0));
      }
      return y;
    };
  })(), e = /* @__PURE__ */ (function() {
    function f(I, x, S) {
      var P, m, B, T, b = 0, O = I.length, G = x % At, U = x / At | 0;
      for (I = I.slice(); O--; )
        B = I[O] % At, T = I[O] / At | 0, P = U * B + T * G, m = G * B + P % At * At + b, b = (m / S | 0) + (P / At | 0) + U * T, I[O] = m % S;
      return b && (I = [b].concat(I)), I;
    }
    function p(I, x, S, P) {
      var m, B;
      if (S != P)
        B = S > P ? 1 : -1;
      else
        for (m = B = 0; m < S; m++)
          if (I[m] != x[m]) {
            B = I[m] > x[m] ? 1 : -1;
            break;
          }
      return B;
    }
    function y(I, x, S, P) {
      for (var m = 0; S--; )
        I[S] -= m, m = I[S] < x[S] ? 1 : 0, I[S] = m * P + I[S] - x[S];
      for (; !I[0] && I.length > 1; I.splice(0, 1)) ;
    }
    return function(I, x, S, P, m) {
      var B, T, b, O, G, U, z, Z, et, X, W, ot, dt, Tt, Pt, at, bt, st = I.s == x.s ? 1 : -1, nt = I.c, Q = x.c;
      if (!nt || !nt[0] || !Q || !Q[0])
        return new v(
          // Return NaN if either NaN, or both Infinity or 0.
          !I.s || !x.s || (nt ? Q && nt[0] == Q[0] : !Q) ? NaN : (
            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            nt && nt[0] == 0 || !Q ? st * 0 : st / 0
          )
        );
      for (Z = new v(st), et = Z.c = [], T = I.e - x.e, st = S + T + 1, m || (m = wt, T = yt(I.e / V) - yt(x.e / V), st = st / V | 0), b = 0; Q[b] == (nt[b] || 0); b++) ;
      if (Q[b] > (nt[b] || 0) && T--, st < 0)
        et.push(1), O = !0;
      else {
        for (Tt = nt.length, at = Q.length, b = 0, st += 2, G = gt(m / (Q[0] + 1)), G > 1 && (Q = f(Q, G, m), nt = f(nt, G, m), at = Q.length, Tt = nt.length), dt = at, X = nt.slice(0, at), W = X.length; W < at; X[W++] = 0) ;
        bt = Q.slice(), bt = [0].concat(bt), Pt = Q[0], Q[1] >= m / 2 && Pt++;
        do {
          if (G = 0, B = p(Q, X, at, W), B < 0) {
            if (ot = X[0], at != W && (ot = ot * m + (X[1] || 0)), G = gt(ot / Pt), G > 1)
              for (G >= m && (G = m - 1), U = f(Q, G, m), z = U.length, W = X.length; p(U, X, z, W) == 1; )
                G--, y(U, at < z ? bt : Q, z, m), z = U.length, B = 1;
            else
              G == 0 && (B = G = 1), U = Q.slice(), z = U.length;
            if (z < W && (U = [0].concat(U)), y(X, U, W, m), W = X.length, B == -1)
              for (; p(Q, X, at, W) < 1; )
                G++, y(X, at < W ? bt : Q, W, m), W = X.length;
          } else B === 0 && (G++, X = [0]);
          et[b++] = G, X[0] ? X[W++] = nt[dt] || 0 : (X = [nt[dt]], W = 1);
        } while ((dt++ < Tt || X[0] != null) && st--);
        O = X[0] != null, et[0] || et.splice(0, 1);
      }
      if (m == wt) {
        for (b = 1, st = et[0]; st >= 10; st /= 10, b++) ;
        K(Z, S + (Z.e = b + T * V - 1) + 1, P, O);
      } else
        Z.e = T, Z.r = +O;
      return Z;
    };
  })();
  function D(f, p, y, I) {
    var x, S, P, m, B;
    if (y == null ? y = l : tt(y, 0, 8), !f.c) return f.toString();
    if (x = f.c[0], P = f.e, p == null)
      B = pt(f.c), B = I == 1 || I == 2 && (P <= w || P >= g) ? zt(B, P) : St(B, P, "0");
    else if (f = K(new v(f), p, y), S = f.e, B = pt(f.c), m = B.length, I == 1 || I == 2 && (p <= S || S <= w)) {
      for (; m < p; B += "0", m++) ;
      B = zt(B, S);
    } else if (p -= P + (I === 2 && S > P), B = St(B, S, "0"), S + 1 > m) {
      if (--p > 0) for (B += "."; p--; B += "0") ;
    } else if (p += S - m, p > 0)
      for (S + 1 == m && (B += "."); p--; B += "0") ;
    return f.s < 0 && x ? "-" + B : B;
  }
  function $(f, p) {
    for (var y, I, x = 1, S = new v(f[0]); x < f.length; x++)
      I = new v(f[x]), (!I.s || (y = Rt(S, I)) === p || y === 0 && S.s === p) && (S = I);
    return S;
  }
  function q(f, p, y) {
    for (var I = 1, x = p.length; !p[--x]; p.pop()) ;
    for (x = p[0]; x >= 10; x /= 10, I++) ;
    return (y = I + y * V - 1) > d ? f.c = f.e = null : y < R ? f.c = [f.e = 0] : (f.e = y, f.c = p), f;
  }
  o = /* @__PURE__ */ (function() {
    var f = /^(-?)0([xbo])(?=\\w[\\w.]*$)/i, p = /^([^.]+)\\.$/, y = /^\\.([^.]+)$/, I = /^-?(Infinity|NaN)$/, x = /^\\s*\\+(?=[\\w.])|^\\s+|\\s+$/g;
    return function(S, P, m, B) {
      var T, b = m ? P : P.replace(x, "");
      if (I.test(b))
        S.s = isNaN(b) ? null : b < 0 ? -1 : 1;
      else {
        if (!m && (b = b.replace(f, function(O, G, U) {
          return T = (U = U.toLowerCase()) == "x" ? 16 : U == "b" ? 2 : 8, !B || B == T ? G : O;
        }), B && (T = B, b = b.replace(p, "$1").replace(y, "0.$1")), P != b))
          return new v(b, T);
        if (v.DEBUG)
          throw Error(ht + "Not a" + (B ? " base " + B : "") + " number: " + P);
        S.s = null;
      }
      S.c = S.e = null;
    };
  })();
  function K(f, p, y, I) {
    var x, S, P, m, B, T, b, O = f.c, G = re;
    if (O) {
      t: {
        for (x = 1, m = O[0]; m >= 10; m /= 10, x++) ;
        if (S = p - x, S < 0)
          S += V, P = p, B = O[T = 0], b = gt(B / G[x - P - 1] % 10);
        else if (T = te((S + 1) / V), T >= O.length)
          if (I) {
            for (; O.length <= T; O.push(0)) ;
            B = b = 0, x = 1, S %= V, P = S - V + 1;
          } else
            break t;
        else {
          for (B = m = O[T], x = 1; m >= 10; m /= 10, x++) ;
          S %= V, P = S - V + x, b = P < 0 ? 0 : gt(B / G[x - P - 1] % 10);
        }
        if (I = I || p < 0 || // Are there any non-zero digits after the rounding digit?
        // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
        // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
        O[T + 1] != null || (P < 0 ? B : B % G[x - P - 1]), I = y < 4 ? (b || I) && (y == 0 || y == (f.s < 0 ? 3 : 2)) : b > 5 || b == 5 && (y == 4 || I || y == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (S > 0 ? P > 0 ? B / G[x - P] : 0 : O[T - 1]) % 10 & 1 || y == (f.s < 0 ? 8 : 7)), p < 1 || !O[0])
          return O.length = 0, I ? (p -= f.e + 1, O[0] = G[(V - p % V) % V], f.e = -p || 0) : O[0] = f.e = 0, f;
        if (S == 0 ? (O.length = T, m = 1, T--) : (O.length = T + 1, m = G[V - S], O[T] = P > 0 ? gt(B / G[x - P] % G[P]) * m : 0), I)
          for (; ; )
            if (T == 0) {
              for (S = 1, P = O[0]; P >= 10; P /= 10, S++) ;
              for (P = O[0] += m, m = 1; P >= 10; P /= 10, m++) ;
              S != m && (f.e++, O[0] == wt && (O[0] = 1));
              break;
            } else {
              if (O[T] += m, O[T] != wt) break;
              O[T--] = 0, m = 1;
            }
        for (S = O.length; O[--S] === 0; O.pop()) ;
      }
      f.e > d ? f.c = f.e = null : f.e < R && (f.c = [f.e = 0]);
    }
    return f;
  }
  function J(f) {
    var p, y = f.e;
    return y === null ? f.toString() : (p = pt(f.c), p = y <= w || y >= g ? zt(p, y) : St(p, y, "0"), f.s < 0 ? "-" + p : p);
  }
  return s.absoluteValue = s.abs = function() {
    var f = new v(this);
    return f.s < 0 && (f.s = 1), f;
  }, s.comparedTo = function(f, p) {
    return Rt(this, new v(f, p));
  }, s.decimalPlaces = s.dp = function(f, p) {
    var y, I, x, S = this;
    if (f != null)
      return tt(f, 0, lt), p == null ? p = l : tt(p, 0, 8), K(new v(S), f + S.e + 1, p);
    if (!(y = S.c)) return null;
    if (I = ((x = y.length - 1) - yt(this.e / V)) * V, x = y[x]) for (; x % 10 == 0; x /= 10, I--) ;
    return I < 0 && (I = 0), I;
  }, s.dividedBy = s.div = function(f, p) {
    return e(this, new v(f, p), h, l);
  }, s.dividedToIntegerBy = s.idiv = function(f, p) {
    return e(this, new v(f, p), 0, 1);
  }, s.exponentiatedBy = s.pow = function(f, p) {
    var y, I, x, S, P, m, B, T, b, O = this;
    if (f = new v(f), f.c && !f.isInteger())
      throw Error(ht + "Exponent not an integer: " + J(f));
    if (p != null && (p = new v(p)), m = f.e > 14, !O.c || !O.c[0] || O.c[0] == 1 && !O.e && O.c.length == 1 || !f.c || !f.c[0])
      return b = new v(Math.pow(+J(O), m ? f.s * (2 - $t(f)) : +J(f))), p ? b.mod(p) : b;
    if (B = f.s < 0, p) {
      if (p.c ? !p.c[0] : !p.s) return new v(NaN);
      I = !B && O.isInteger() && p.isInteger(), I && (O = O.mod(p));
    } else {
      if (f.e > 9 && (O.e > 0 || O.e < -1 || (O.e == 0 ? O.c[0] > 1 || m && O.c[1] >= 24e7 : O.c[0] < 8e13 || m && O.c[0] <= 9999975e7)))
        return S = O.s < 0 && $t(f) ? -0 : 0, O.e > -1 && (S = 1 / S), new v(B ? 1 / S : S);
      L && (S = te(L / V + 2));
    }
    for (m ? (y = new v(0.5), B && (f.s = 1), T = $t(f)) : (x = Math.abs(+J(f)), T = x % 2), b = new v(c); ; ) {
      if (T) {
        if (b = b.times(O), !b.c) break;
        S ? b.c.length > S && (b.c.length = S) : I && (b = b.mod(p));
      }
      if (x) {
        if (x = gt(x / 2), x === 0) break;
        T = x % 2;
      } else if (f = f.times(y), K(f, f.e + 1, 1), f.e > 14)
        T = $t(f);
      else {
        if (x = +J(f), x === 0) break;
        T = x % 2;
      }
      O = O.times(O), S ? O.c && O.c.length > S && (O.c.length = S) : I && (O = O.mod(p));
    }
    return I ? b : (B && (b = c.div(b)), p ? b.mod(p) : S ? K(b, L, l, P) : b);
  }, s.integerValue = function(f) {
    var p = new v(this);
    return f == null ? f = l : tt(f, 0, 8), K(p, p.e + 1, f);
  }, s.isEqualTo = s.eq = function(f, p) {
    return Rt(this, new v(f, p)) === 0;
  }, s.isFinite = function() {
    return !!this.c;
  }, s.isGreaterThan = s.gt = function(f, p) {
    return Rt(this, new v(f, p)) > 0;
  }, s.isGreaterThanOrEqualTo = s.gte = function(f, p) {
    return (p = Rt(this, new v(f, p))) === 1 || p === 0;
  }, s.isInteger = function() {
    return !!this.c && yt(this.e / V) > this.c.length - 2;
  }, s.isLessThan = s.lt = function(f, p) {
    return Rt(this, new v(f, p)) < 0;
  }, s.isLessThanOrEqualTo = s.lte = function(f, p) {
    return (p = Rt(this, new v(f, p))) === -1 || p === 0;
  }, s.isNaN = function() {
    return !this.s;
  }, s.isNegative = function() {
    return this.s < 0;
  }, s.isPositive = function() {
    return this.s > 0;
  }, s.isZero = function() {
    return !!this.c && this.c[0] == 0;
  }, s.minus = function(f, p) {
    var y, I, x, S, P = this, m = P.s;
    if (f = new v(f, p), p = f.s, !m || !p) return new v(NaN);
    if (m != p)
      return f.s = -p, P.plus(f);
    var B = P.e / V, T = f.e / V, b = P.c, O = f.c;
    if (!B || !T) {
      if (!b || !O) return b ? (f.s = -p, f) : new v(O ? P : NaN);
      if (!b[0] || !O[0])
        return O[0] ? (f.s = -p, f) : new v(b[0] ? P : (
          // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
          l == 3 ? -0 : 0
        ));
    }
    if (B = yt(B), T = yt(T), b = b.slice(), m = B - T) {
      for ((S = m < 0) ? (m = -m, x = b) : (T = B, x = O), x.reverse(), p = m; p--; x.push(0)) ;
      x.reverse();
    } else
      for (I = (S = (m = b.length) < (p = O.length)) ? m : p, m = p = 0; p < I; p++)
        if (b[p] != O[p]) {
          S = b[p] < O[p];
          break;
        }
    if (S && (x = b, b = O, O = x, f.s = -f.s), p = (I = O.length) - (y = b.length), p > 0) for (; p--; b[y++] = 0) ;
    for (p = wt - 1; I > m; ) {
      if (b[--I] < O[I]) {
        for (y = I; y && !b[--y]; b[y] = p) ;
        --b[y], b[I] += wt;
      }
      b[I] -= O[I];
    }
    for (; b[0] == 0; b.splice(0, 1), --T) ;
    return b[0] ? q(f, b, T) : (f.s = l == 3 ? -1 : 1, f.c = [f.e = 0], f);
  }, s.modulo = s.mod = function(f, p) {
    var y, I, x = this;
    return f = new v(f, p), !x.c || !f.s || f.c && !f.c[0] ? new v(NaN) : !f.c || x.c && !x.c[0] ? new v(x) : (A == 9 ? (I = f.s, f.s = 1, y = e(x, f, 0, 3), f.s = I, y.s *= I) : y = e(x, f, 0, A), f = x.minus(y.times(f)), !f.c[0] && A == 1 && (f.s = x.s), f);
  }, s.multipliedBy = s.times = function(f, p) {
    var y, I, x, S, P, m, B, T, b, O, G, U, z, Z, et, X = this, W = X.c, ot = (f = new v(f, p)).c;
    if (!W || !ot || !W[0] || !ot[0])
      return !X.s || !f.s || W && !W[0] && !ot || ot && !ot[0] && !W ? f.c = f.e = f.s = null : (f.s *= X.s, !W || !ot ? f.c = f.e = null : (f.c = [0], f.e = 0)), f;
    for (I = yt(X.e / V) + yt(f.e / V), f.s *= X.s, B = W.length, O = ot.length, B < O && (z = W, W = ot, ot = z, x = B, B = O, O = x), x = B + O, z = []; x--; z.push(0)) ;
    for (Z = wt, et = At, x = O; --x >= 0; ) {
      for (y = 0, G = ot[x] % et, U = ot[x] / et | 0, P = B, S = x + P; S > x; )
        T = W[--P] % et, b = W[P] / et | 0, m = U * T + b * G, T = G * T + m % et * et + z[S] + y, y = (T / Z | 0) + (m / et | 0) + U * b, z[S--] = T % Z;
      z[S] = y;
    }
    return y ? ++I : z.splice(0, 1), q(f, z, I);
  }, s.negated = function() {
    var f = new v(this);
    return f.s = -f.s || null, f;
  }, s.plus = function(f, p) {
    var y, I = this, x = I.s;
    if (f = new v(f, p), p = f.s, !x || !p) return new v(NaN);
    if (x != p)
      return f.s = -p, I.minus(f);
    var S = I.e / V, P = f.e / V, m = I.c, B = f.c;
    if (!S || !P) {
      if (!m || !B) return new v(x / 0);
      if (!m[0] || !B[0]) return B[0] ? f : new v(m[0] ? I : x * 0);
    }
    if (S = yt(S), P = yt(P), m = m.slice(), x = S - P) {
      for (x > 0 ? (P = S, y = B) : (x = -x, y = m), y.reverse(); x--; y.push(0)) ;
      y.reverse();
    }
    for (x = m.length, p = B.length, x - p < 0 && (y = B, B = m, m = y, p = x), x = 0; p; )
      x = (m[--p] = m[p] + B[p] + x) / wt | 0, m[p] = wt === m[p] ? 0 : m[p] % wt;
    return x && (m = [x].concat(m), ++P), q(f, m, P);
  }, s.precision = s.sd = function(f, p) {
    var y, I, x, S = this;
    if (f != null && f !== !!f)
      return tt(f, 1, lt), p == null ? p = l : tt(p, 0, 8), K(new v(S), f, p);
    if (!(y = S.c)) return null;
    if (x = y.length - 1, I = x * V + 1, x = y[x]) {
      for (; x % 10 == 0; x /= 10, I--) ;
      for (x = y[0]; x >= 10; x /= 10, I++) ;
    }
    return f && S.e + 1 > I && (I = S.e + 1), I;
  }, s.shiftedBy = function(f) {
    return tt(f, -ee, ee), this.times("1e" + f);
  }, s.squareRoot = s.sqrt = function() {
    var f, p, y, I, x, S = this, P = S.c, m = S.s, B = S.e, T = h + 4, b = new v("0.5");
    if (m !== 1 || !P || !P[0])
      return new v(!m || m < 0 && (!P || P[0]) ? NaN : P ? S : 1 / 0);
    if (m = Math.sqrt(+J(S)), m == 0 || m == 1 / 0 ? (p = pt(P), (p.length + B) % 2 == 0 && (p += "0"), m = Math.sqrt(+p), B = yt((B + 1) / 2) - (B < 0 || B % 2), m == 1 / 0 ? p = "5e" + B : (p = m.toExponential(), p = p.slice(0, p.indexOf("e") + 1) + B), y = new v(p)) : y = new v(m + ""), y.c[0]) {
      for (B = y.e, m = B + T, m < 3 && (m = 0); ; )
        if (x = y, y = b.times(x.plus(e(S, x, T, 1))), pt(x.c).slice(0, m) === (p = pt(y.c)).slice(0, m))
          if (y.e < B && --m, p = p.slice(m - 3, m + 1), p == "9999" || !I && p == "4999") {
            if (!I && (K(x, x.e + h + 2, 0), x.times(x).eq(S))) {
              y = x;
              break;
            }
            T += 4, m += 4, I = 1;
          } else {
            (!+p || !+p.slice(1) && p.charAt(0) == "5") && (K(y, y.e + h + 2, 1), f = !y.times(y).eq(S));
            break;
          }
    }
    return K(y, y.e + h + 1, l, f);
  }, s.toExponential = function(f, p) {
    return f != null && (tt(f, 0, lt), f++), D(this, f, p, 1);
  }, s.toFixed = function(f, p) {
    return f != null && (tt(f, 0, lt), f = f + this.e + 1), D(this, f, p);
  }, s.toFormat = function(f, p, y) {
    var I, x = this;
    if (y == null)
      f != null && p && typeof p == "object" ? (y = p, p = null) : f && typeof f == "object" ? (y = f, f = p = null) : y = C;
    else if (typeof y != "object")
      throw Error(ht + "Argument not an object: " + y);
    if (I = x.toFixed(f, p), x.c) {
      var S, P = I.split("."), m = +y.groupSize, B = +y.secondaryGroupSize, T = y.groupSeparator || "", b = P[0], O = P[1], G = x.s < 0, U = G ? b.slice(1) : b, z = U.length;
      if (B && (S = m, m = B, B = S, z -= S), m > 0 && z > 0) {
        for (S = z % m || m, b = U.substr(0, S); S < z; S += m) b += T + U.substr(S, m);
        B > 0 && (b += T + U.slice(S)), G && (b = "-" + b);
      }
      I = O ? b + (y.decimalSeparator || "") + ((B = +y.fractionGroupSize) ? O.replace(
        new RegExp("\\\\d{" + B + "}\\\\B", "g"),
        "$&" + (y.fractionGroupSeparator || "")
      ) : O) : b;
    }
    return (y.prefix || "") + I + (y.suffix || "");
  }, s.toFraction = function(f) {
    var p, y, I, x, S, P, m, B, T, b, O, G, U = this, z = U.c;
    if (f != null && (m = new v(f), !m.isInteger() && (m.c || m.s !== 1) || m.lt(c)))
      throw Error(ht + "Argument " + (m.isInteger() ? "out of range: " : "not an integer: ") + J(m));
    if (!z) return new v(U);
    for (p = new v(c), T = y = new v(c), I = B = new v(c), G = pt(z), S = p.e = G.length - U.e - 1, p.c[0] = re[(P = S % V) < 0 ? V + P : P], f = !f || m.comparedTo(p) > 0 ? S > 0 ? p : T : m, P = d, d = 1 / 0, m = new v(G), B.c[0] = 0; b = e(m, p, 0, 1), x = y.plus(b.times(I)), x.comparedTo(f) != 1; )
      y = I, I = x, T = B.plus(b.times(x = T)), B = x, p = m.minus(b.times(x = p)), m = x;
    return x = e(f.minus(y), I, 0, 1), B = B.plus(x.times(T)), y = y.plus(x.times(I)), B.s = T.s = U.s, S = S * 2, O = e(T, I, S, l).minus(U).abs().comparedTo(
      e(B, y, S, l).minus(U).abs()
    ) < 1 ? [T, I] : [B, y], d = P, O;
  }, s.toNumber = function() {
    return +J(this);
  }, s.toPrecision = function(f, p) {
    return f != null && tt(f, 1, lt), D(this, f, p, 2);
  }, s.toString = function(f) {
    var p, y = this, I = y.s, x = y.e;
    return x === null ? I ? (p = "Infinity", I < 0 && (p = "-" + p)) : p = "NaN" : (f == null ? p = x <= w || x >= g ? zt(pt(y.c), x) : St(pt(y.c), x, "0") : f === 10 && N ? (y = K(new v(y), h + x + 1, l), p = St(pt(y.c), y.e, "0")) : (tt(f, 2, k.length, "Base"), p = r(St(pt(y.c), x, "0"), 10, f, I, !0)), I < 0 && y.c[0] && (p = "-" + p)), p;
  }, s.valueOf = s.toJSON = function() {
    return J(this);
  }, s._isBigNumber = !0, s[Symbol.toStringTag] = "BigNumber", s[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = s.valueOf, n != null && v.set(n), v;
}
function yt(n) {
  var e = n | 0;
  return n > 0 || n === e ? e : e - 1;
}
function pt(n) {
  for (var e, r, o = 1, s = n.length, c = n[0] + ""; o < s; ) {
    for (e = n[o++] + "", r = V - e.length; r--; e = "0" + e) ;
    c += e;
  }
  for (s = c.length; c.charCodeAt(--s) === 48; ) ;
  return c.slice(0, s + 1 || 1);
}
function Rt(n, e) {
  var r, o, s = n.c, c = e.c, h = n.s, l = e.s, w = n.e, g = e.e;
  if (!h || !l) return null;
  if (r = s && !s[0], o = c && !c[0], r || o) return r ? o ? 0 : -l : h;
  if (h != l) return h;
  if (r = h < 0, o = w == g, !s || !c) return o ? 0 : !s ^ r ? 1 : -1;
  if (!o) return w > g ^ r ? 1 : -1;
  for (l = (w = s.length) < (g = c.length) ? w : g, h = 0; h < l; h++) if (s[h] != c[h]) return s[h] > c[h] ^ r ? 1 : -1;
  return w == g ? 0 : w > g ^ r ? 1 : -1;
}
function tt(n, e, r, o) {
  if (n < e || n > r || n !== gt(n))
    throw Error(ht + (o || "Argument") + (typeof n == "number" ? n < e || n > r ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(n));
}
function $t(n) {
  var e = n.c.length - 1;
  return yt(n.e / V) == e && n.c[e] % 2 != 0;
}
function zt(n, e) {
  return (n.length > 1 ? n.charAt(0) + "." + n.slice(1) : n) + (e < 0 ? "e" : "e+") + e;
}
function St(n, e, r) {
  var o, s;
  if (e < 0) {
    for (s = r + "."; ++e; s += r) ;
    n = s + n;
  } else if (o = n.length, ++e > o) {
    for (s = r, e -= o; --e; s += r) ;
    n += s;
  } else e < o && (n = n.slice(0, e) + "." + n.slice(e));
  return n;
}
var Et = ke(), je = class {
  key;
  left = null;
  right = null;
  constructor(n) {
    this.key = n;
  }
}, Mt = class extends je {
  constructor(n) {
    super(n);
  }
}, tr = class {
  size = 0;
  modificationCount = 0;
  splayCount = 0;
  splay(n) {
    const e = this.root;
    if (e == null)
      return this.compare(n, n), -1;
    let r = null, o = null, s = null, c = null, h = e;
    const l = this.compare;
    let w;
    for (; ; )
      if (w = l(h.key, n), w > 0) {
        let g = h.left;
        if (g == null || (w = l(g.key, n), w > 0 && (h.left = g.right, g.right = h, h = g, g = h.left, g == null)))
          break;
        r == null ? o = h : r.left = h, r = h, h = g;
      } else if (w < 0) {
        let g = h.right;
        if (g == null || (w = l(g.key, n), w < 0 && (h.right = g.left, g.left = h, h = g, g = h.right, g == null)))
          break;
        s == null ? c = h : s.right = h, s = h, h = g;
      } else
        break;
    return s != null && (s.right = h.left, h.left = c), r != null && (r.left = h.right, h.right = o), this.root !== h && (this.root = h, this.splayCount++), w;
  }
  splayMin(n) {
    let e = n, r = e.left;
    for (; r != null; ) {
      const o = r;
      e.left = o.right, o.right = e, e = o, r = e.left;
    }
    return e;
  }
  splayMax(n) {
    let e = n, r = e.right;
    for (; r != null; ) {
      const o = r;
      e.right = o.left, o.left = e, e = o, r = e.right;
    }
    return e;
  }
  _delete(n) {
    if (this.root == null || this.splay(n) != 0) return null;
    let r = this.root;
    const o = r, s = r.left;
    if (this.size--, s == null)
      this.root = r.right;
    else {
      const c = r.right;
      r = this.splayMax(s), r.right = c, this.root = r;
    }
    return this.modificationCount++, o;
  }
  addNewRoot(n, e) {
    this.size++, this.modificationCount++;
    const r = this.root;
    if (r == null) {
      this.root = n;
      return;
    }
    e < 0 ? (n.left = r, n.right = r.right, r.right = null) : (n.right = r, n.left = r.left, r.left = null), this.root = n;
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
}, Wt = class Ot extends tr {
  root = null;
  compare;
  validKey;
  constructor(e, r) {
    super(), this.compare = e ?? this.defaultCompare(), this.validKey = r ?? ((o) => o != null && o != null);
  }
  delete(e) {
    return this.validKey(e) ? this._delete(e) != null : !1;
  }
  deleteAll(e) {
    for (const r of e)
      this.delete(r);
  }
  forEach(e) {
    const r = this[Symbol.iterator]();
    let o;
    for (; o = r.next(), !o.done; )
      e(o.value, o.value, this);
  }
  add(e) {
    const r = this.splay(e);
    return r != 0 && this.addNewRoot(new Mt(e), r), this;
  }
  addAndReturn(e) {
    const r = this.splay(e);
    return r != 0 && this.addNewRoot(new Mt(e), r), this.root.key;
  }
  addAll(e) {
    for (const r of e)
      this.add(r);
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
    let o = this.root.left;
    if (o == null) return null;
    let s = o.right;
    for (; s != null; )
      o = s, s = o.right;
    return o.key;
  }
  firstAfter(e) {
    if (e == null) throw "Invalid arguments(s)";
    if (this.root == null) return null;
    if (this.splay(e) > 0) return this.root.key;
    let o = this.root.right;
    if (o == null) return null;
    let s = o.left;
    for (; s != null; )
      o = s, s = o.left;
    return o.key;
  }
  retainAll(e) {
    const r = new Ot(this.compare, this.validKey), o = this.modificationCount;
    for (const s of e) {
      if (o != this.modificationCount)
        throw "Concurrent modification during iteration.";
      this.validKey(s) && this.splay(s) == 0 && r.add(this.root.key);
    }
    r.size != this.size && (this.root = r.root, this.size = r.size, this.modificationCount++);
  }
  lookup(e) {
    return !this.validKey(e) || this.splay(e) != 0 ? null : this.root.key;
  }
  intersection(e) {
    const r = new Ot(this.compare, this.validKey);
    for (const o of this)
      e.has(o) && r.add(o);
    return r;
  }
  difference(e) {
    const r = new Ot(this.compare, this.validKey);
    for (const o of this)
      e.has(o) || r.add(o);
    return r;
  }
  union(e) {
    const r = this.clone();
    return r.addAll(e), r;
  }
  clone() {
    const e = new Ot(this.compare, this.validKey);
    return e.size = this.size, e.root = this.copyNode(this.root), e;
  }
  copyNode(e) {
    if (e == null) return null;
    function r(s, c) {
      let h, l;
      do {
        if (h = s.left, l = s.right, h != null) {
          const w = new Mt(h.key);
          c.left = w, r(h, w);
        }
        if (l != null) {
          const w = new Mt(l.key);
          c.right = w, s = l, c = w;
        }
      } while (l != null);
    }
    const o = new Mt(e.key);
    return r(e, o), o;
  }
  toSet() {
    return this.clone();
  }
  entries() {
    return new rr(this.wrap());
  }
  keys() {
    return this[Symbol.iterator]();
  }
  values() {
    return this[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return new er(this.wrap());
  }
  [Symbol.toStringTag] = "[object Set]";
}, Ge = class {
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
        let r = this.tree.getRoot();
        for (; r != null; )
          this.path.push(r), r = r.left;
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
}, er = class extends Ge {
  getValue(n) {
    return n.key;
  }
}, rr = class extends Ge {
  getValue(n) {
    return [n.key, n.key];
  }
}, De = (n) => () => n, se = (n) => {
  const e = n ? (r, o) => o.minus(r).abs().isLessThanOrEqualTo(n) : De(!1);
  return (r, o) => e(r, o) ? 0 : r.comparedTo(o);
};
function ir(n) {
  const e = n ? (r, o, s, c, h) => r.exponentiatedBy(2).isLessThanOrEqualTo(
    c.minus(o).exponentiatedBy(2).plus(h.minus(s).exponentiatedBy(2)).times(n)
  ) : De(!1);
  return (r, o, s) => {
    const c = r.x, h = r.y, l = s.x, w = s.y, g = h.minus(w).times(o.x.minus(l)).minus(c.minus(l).times(o.y.minus(w)));
    return e(g, c, h, l, w) ? 0 : g.comparedTo(0);
  };
}
var nr = (n) => n, or = (n) => {
  if (n) {
    const e = new Wt(se(n)), r = new Wt(se(n)), o = (c, h) => h.addAndReturn(c), s = (c) => ({
      x: o(c.x, e),
      y: o(c.y, r)
    });
    return s({ x: new Et(0), y: new Et(0) }), s;
  }
  return nr;
}, le = (n) => ({
  set: (e) => {
    It = le(e);
  },
  reset: () => le(n),
  compare: se(n),
  snap: or(n),
  orient: ir(n)
}), It = le(), Ct = (n, e) => n.ll.x.isLessThanOrEqualTo(e.x) && e.x.isLessThanOrEqualTo(n.ur.x) && n.ll.y.isLessThanOrEqualTo(e.y) && e.y.isLessThanOrEqualTo(n.ur.y), ue = (n, e) => {
  if (e.ur.x.isLessThan(n.ll.x) || n.ur.x.isLessThan(e.ll.x) || e.ur.y.isLessThan(n.ll.y) || n.ur.y.isLessThan(e.ll.y))
    return null;
  const r = n.ll.x.isLessThan(e.ll.x) ? e.ll.x : n.ll.x, o = n.ur.x.isLessThan(e.ur.x) ? n.ur.x : e.ur.x, s = n.ll.y.isLessThan(e.ll.y) ? e.ll.y : n.ll.y, c = n.ur.y.isLessThan(e.ur.y) ? n.ur.y : e.ur.y;
  return { ll: { x: r, y: s }, ur: { x: o, y: c } };
}, Xt = (n, e) => n.x.times(e.y).minus(n.y.times(e.x)), qe = (n, e) => n.x.times(e.x).plus(n.y.times(e.y)), Ht = (n) => qe(n, n).sqrt(), sr = (n, e, r) => {
  const o = { x: e.x.minus(n.x), y: e.y.minus(n.y) }, s = { x: r.x.minus(n.x), y: r.y.minus(n.y) };
  return Xt(s, o).div(Ht(s)).div(Ht(o));
}, lr = (n, e, r) => {
  const o = { x: e.x.minus(n.x), y: e.y.minus(n.y) }, s = { x: r.x.minus(n.x), y: r.y.minus(n.y) };
  return qe(s, o).div(Ht(s)).div(Ht(o));
}, de = (n, e, r) => e.y.isZero() ? null : { x: n.x.plus(e.x.div(e.y).times(r.minus(n.y))), y: r }, we = (n, e, r) => e.x.isZero() ? null : { x: r, y: n.y.plus(e.y.div(e.x).times(r.minus(n.x))) }, ur = (n, e, r, o) => {
  if (e.x.isZero()) return we(r, o, n.x);
  if (o.x.isZero()) return we(n, e, r.x);
  if (e.y.isZero()) return de(r, o, n.y);
  if (o.y.isZero()) return de(n, e, r.y);
  const s = Xt(e, o);
  if (s.isZero()) return null;
  const c = { x: r.x.minus(n.x), y: r.y.minus(n.y) }, h = Xt(c, e).div(s), l = Xt(c, o).div(s), w = n.x.plus(l.times(e.x)), g = r.x.plus(h.times(o.x)), R = n.y.plus(l.times(e.y)), d = r.y.plus(h.times(o.y)), F = w.plus(g).div(2), A = R.plus(d).div(2);
  return { x: F, y: A };
}, xt = class $e {
  point;
  isLeft;
  segment;
  otherSE;
  consumedBy;
  // for ordering sweep events in the sweep event queue
  static compare(e, r) {
    const o = $e.comparePoints(e.point, r.point);
    return o !== 0 ? o : (e.point !== r.point && e.link(r), e.isLeft !== r.isLeft ? e.isLeft ? 1 : -1 : Jt.compare(e.segment, r.segment));
  }
  // for ordering points in sweep line order
  static comparePoints(e, r) {
    return e.x.isLessThan(r.x) ? -1 : e.x.isGreaterThan(r.x) ? 1 : e.y.isLessThan(r.y) ? -1 : e.y.isGreaterThan(r.y) ? 1 : 0;
  }
  // Warning: 'point' input will be modified and re-used (for performance)
  constructor(e, r) {
    e.events === void 0 ? e.events = [this] : e.events.push(this), this.point = e, this.isLeft = r;
  }
  link(e) {
    if (e.point === this.point)
      throw new Error("Tried to link already linked events");
    const r = e.point.events;
    for (let o = 0, s = r.length; o < s; o++) {
      const c = r[o];
      this.point.events.push(c), c.point = this.point;
    }
    this.checkForConsuming();
  }
  /* Do a pass over our linked events and check to see if any pair
   * of segments match, and should be consumed. */
  checkForConsuming() {
    const e = this.point.events.length;
    for (let r = 0; r < e; r++) {
      const o = this.point.events[r];
      if (o.segment.consumedBy === void 0)
        for (let s = r + 1; s < e; s++) {
          const c = this.point.events[s];
          c.consumedBy === void 0 && o.otherSE.point.events === c.otherSE.point.events && o.segment.consume(c.segment);
        }
    }
  }
  getAvailableLinkedEvents() {
    const e = [];
    for (let r = 0, o = this.point.events.length; r < o; r++) {
      const s = this.point.events[r];
      s !== this && !s.segment.ringOut && s.segment.isInResult() && e.push(s);
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
    const r = /* @__PURE__ */ new Map(), o = (s) => {
      const c = s.otherSE;
      r.set(s, {
        sine: sr(this.point, e.point, c.point),
        cosine: lr(this.point, e.point, c.point)
      });
    };
    return (s, c) => {
      r.has(s) || o(s), r.has(c) || o(c);
      const { sine: h, cosine: l } = r.get(s), { sine: w, cosine: g } = r.get(c);
      return h.isGreaterThanOrEqualTo(0) && w.isGreaterThanOrEqualTo(0) ? l.isLessThan(g) ? 1 : l.isGreaterThan(g) ? -1 : 0 : h.isLessThan(0) && w.isLessThan(0) ? l.isLessThan(g) ? -1 : l.isGreaterThan(g) ? 1 : 0 : w.isLessThan(h) ? -1 : w.isGreaterThan(h) ? 1 : 0;
    };
  }
}, fr = class fe {
  events;
  poly;
  _isExteriorRing;
  _enclosingRing;
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory(e) {
    const r = [];
    for (let o = 0, s = e.length; o < s; o++) {
      const c = e[o];
      if (!c.isInResult() || c.ringOut) continue;
      let h = null, l = c.leftSE, w = c.rightSE;
      const g = [l], R = l.point, d = [];
      for (; h = l, l = w, g.push(l), l.point !== R; )
        for (; ; ) {
          const F = l.getAvailableLinkedEvents();
          if (F.length === 0) {
            const C = g[0].point, k = g[g.length - 1].point;
            throw new Error(
              \`Unable to complete output ring starting at [\${C.x}, \${C.y}]. Last matching segment found ends at [\${k.x}, \${k.y}].\`
            );
          }
          if (F.length === 1) {
            w = F[0].otherSE;
            break;
          }
          let A = null;
          for (let C = 0, k = d.length; C < k; C++)
            if (d[C].point === l.point) {
              A = C;
              break;
            }
          if (A !== null) {
            const C = d.splice(A)[0], k = g.splice(C.index);
            k.unshift(k[0].otherSE), r.push(new fe(k.reverse()));
            continue;
          }
          d.push({
            index: g.length,
            point: l.point
          });
          const L = l.getLeftmostComparator(h);
          w = F.sort(L)[0].otherSE;
          break;
        }
      r.push(new fe(g));
    }
    return r;
  }
  constructor(e) {
    this.events = e;
    for (let r = 0, o = e.length; r < o; r++)
      e[r].segment.ringOut = this;
    this.poly = null;
  }
  getGeom() {
    let e = this.events[0].point;
    const r = [e];
    for (let g = 1, R = this.events.length - 1; g < R; g++) {
      const d = this.events[g].point, F = this.events[g + 1].point;
      It.orient(d, e, F) !== 0 && (r.push(d), e = d);
    }
    if (r.length === 1) return null;
    const o = r[0], s = r[1];
    It.orient(o, e, s) === 0 && r.shift(), r.push(r[0]);
    const c = this.isExteriorRing() ? 1 : -1, h = this.isExteriorRing() ? 0 : r.length - 1, l = this.isExteriorRing() ? r.length : -1, w = [];
    for (let g = h; g != l; g += c)
      w.push([r[g].x.toNumber(), r[g].y.toNumber()]);
    return w;
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
    for (let s = 1, c = this.events.length; s < c; s++) {
      const h = this.events[s];
      xt.compare(e, h) > 0 && (e = h);
    }
    let r = e.segment.prevInResult(), o = r ? r.prevInResult() : null;
    for (; ; ) {
      if (!r) return null;
      if (!o) return r.ringOut;
      if (o.ringOut !== r.ringOut)
        return o.ringOut?.enclosingRing() !== r.ringOut ? r.ringOut : r.ringOut?.enclosingRing();
      r = o.prevInResult(), o = r ? r.prevInResult() : null;
    }
  }
}, me = class {
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
    for (let r = 0, o = this.interiorRings.length; r < o; r++) {
      const s = this.interiorRings[r].getGeom();
      s !== null && e.push(s);
    }
    return e;
  }
}, cr = class {
  rings;
  polys;
  constructor(n) {
    this.rings = n, this.polys = this._composePolys(n);
  }
  getGeom() {
    const n = [];
    for (let e = 0, r = this.polys.length; e < r; e++) {
      const o = this.polys[e].getGeom();
      o !== null && n.push(o);
    }
    return n;
  }
  _composePolys(n) {
    const e = [];
    for (let r = 0, o = n.length; r < o; r++) {
      const s = n[r];
      if (!s.poly)
        if (s.isExteriorRing()) e.push(new me(s));
        else {
          const c = s.enclosingRing();
          c?.poly || e.push(new me(c)), c?.poly?.addInterior(s);
        }
    }
    return e;
  }
}, hr = class {
  queue;
  tree;
  segments;
  constructor(n, e = Jt.compare) {
    this.queue = n, this.tree = new Wt(e), this.segments = [];
  }
  process(n) {
    const e = n.segment, r = [];
    if (n.consumedBy)
      return n.isLeft ? this.queue.delete(n.otherSE) : this.tree.delete(e), r;
    n.isLeft && this.tree.add(e);
    let o = e, s = e;
    do
      o = this.tree.lastBefore(o);
    while (o != null && o.consumedBy != null);
    do
      s = this.tree.firstAfter(s);
    while (s != null && s.consumedBy != null);
    if (n.isLeft) {
      let c = null;
      if (o) {
        const l = o.getIntersection(e);
        if (l !== null && (e.isAnEndpoint(l) || (c = l), !o.isAnEndpoint(l))) {
          const w = this._splitSafely(o, l);
          for (let g = 0, R = w.length; g < R; g++)
            r.push(w[g]);
        }
      }
      let h = null;
      if (s) {
        const l = s.getIntersection(e);
        if (l !== null && (e.isAnEndpoint(l) || (h = l), !s.isAnEndpoint(l))) {
          const w = this._splitSafely(s, l);
          for (let g = 0, R = w.length; g < R; g++)
            r.push(w[g]);
        }
      }
      if (c !== null || h !== null) {
        let l = null;
        c === null ? l = h : h === null ? l = c : l = xt.comparePoints(
          c,
          h
        ) <= 0 ? c : h, this.queue.delete(e.rightSE), r.push(e.rightSE);
        const w = e.split(l);
        for (let g = 0, R = w.length; g < R; g++)
          r.push(w[g]);
      }
      r.length > 0 ? (this.tree.delete(e), r.push(n)) : (this.segments.push(e), e.prev = o);
    } else {
      if (o && s) {
        const c = o.getIntersection(s);
        if (c !== null) {
          if (!o.isAnEndpoint(c)) {
            const h = this._splitSafely(o, c);
            for (let l = 0, w = h.length; l < w; l++)
              r.push(h[l]);
          }
          if (!s.isAnEndpoint(c)) {
            const h = this._splitSafely(s, c);
            for (let l = 0, w = h.length; l < w; l++)
              r.push(h[l]);
          }
        }
      }
      this.tree.delete(e);
    }
    return r;
  }
  /* Safely split a segment that is currently in the datastructures
   * IE - a segment other than the one that is currently being processed. */
  _splitSafely(n, e) {
    this.tree.delete(n);
    const r = n.rightSE;
    this.queue.delete(r);
    const o = n.split(e);
    return o.push(r), n.consumedBy === void 0 && this.tree.add(n), o;
  }
}, ar = class {
  type;
  numMultiPolys;
  run(n, e, r) {
    Nt.type = n;
    const o = [new Ee(e, !0)];
    for (let g = 0, R = r.length; g < R; g++)
      o.push(new Ee(r[g], !1));
    if (Nt.numMultiPolys = o.length, Nt.type === "difference") {
      const g = o[0];
      let R = 1;
      for (; R < o.length; )
        ue(o[R].bbox, g.bbox) !== null ? R++ : o.splice(R, 1);
    }
    if (Nt.type === "intersection")
      for (let g = 0, R = o.length; g < R; g++) {
        const d = o[g];
        for (let F = g + 1, A = o.length; F < A; F++)
          if (ue(d.bbox, o[F].bbox) === null) return [];
      }
    const s = new Wt(xt.compare);
    for (let g = 0, R = o.length; g < R; g++) {
      const d = o[g].getSweepEvents();
      for (let F = 0, A = d.length; F < A; F++)
        s.add(d[F]);
    }
    const c = new hr(s);
    let h = null;
    for (s.size != 0 && (h = s.first(), s.delete(h)); h; ) {
      const g = c.process(h);
      for (let R = 0, d = g.length; R < d; R++) {
        const F = g[R];
        F.consumedBy === void 0 && s.add(F);
      }
      s.size != 0 ? (h = s.first(), s.delete(h)) : h = null;
    }
    It.reset();
    const l = fr.factory(c.segments);
    return new cr(l).getGeom();
  }
}, Nt = new ar(), ce = Nt, pr = 0, Jt = class Kt {
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
  static compare(e, r) {
    const o = e.leftSE.point.x, s = r.leftSE.point.x, c = e.rightSE.point.x, h = r.rightSE.point.x;
    if (h.isLessThan(o)) return 1;
    if (c.isLessThan(s)) return -1;
    const l = e.leftSE.point.y, w = r.leftSE.point.y, g = e.rightSE.point.y, R = r.rightSE.point.y;
    if (o.isLessThan(s)) {
      if (w.isLessThan(l) && w.isLessThan(g)) return 1;
      if (w.isGreaterThan(l) && w.isGreaterThan(g)) return -1;
      const d = e.comparePoint(r.leftSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
      const F = r.comparePoint(e.rightSE.point);
      return F !== 0 ? F : -1;
    }
    if (o.isGreaterThan(s)) {
      if (l.isLessThan(w) && l.isLessThan(R)) return -1;
      if (l.isGreaterThan(w) && l.isGreaterThan(R)) return 1;
      const d = r.comparePoint(e.leftSE.point);
      if (d !== 0) return d;
      const F = e.comparePoint(r.rightSE.point);
      return F < 0 ? 1 : F > 0 ? -1 : 1;
    }
    if (l.isLessThan(w)) return -1;
    if (l.isGreaterThan(w)) return 1;
    if (c.isLessThan(h)) {
      const d = r.comparePoint(e.rightSE.point);
      if (d !== 0) return d;
    }
    if (c.isGreaterThan(h)) {
      const d = e.comparePoint(r.rightSE.point);
      if (d < 0) return 1;
      if (d > 0) return -1;
    }
    if (!c.eq(h)) {
      const d = g.minus(l), F = c.minus(o), A = R.minus(w), L = h.minus(s);
      if (d.isGreaterThan(F) && A.isLessThan(L)) return 1;
      if (d.isLessThan(F) && A.isGreaterThan(L)) return -1;
    }
    return c.isGreaterThan(h) ? 1 : c.isLessThan(h) || g.isLessThan(R) ? -1 : g.isGreaterThan(R) ? 1 : e.id < r.id ? -1 : e.id > r.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(e, r, o, s) {
    this.id = ++pr, this.leftSE = e, e.segment = this, e.otherSE = r, this.rightSE = r, r.segment = this, r.otherSE = e, this.rings = o, this.windings = s;
  }
  static fromRing(e, r, o) {
    let s, c, h;
    const l = xt.comparePoints(e, r);
    if (l < 0)
      s = e, c = r, h = 1;
    else if (l > 0)
      s = r, c = e, h = -1;
    else
      throw new Error(
        \`Tried to create degenerate segment at [\${e.x}, \${e.y}]\`
      );
    const w = new xt(s, !0), g = new xt(c, !1);
    return new Kt(w, g, [o], [h]);
  }
  /* When a segment is split, the rightSE is replaced with a new sweep event */
  replaceRightSE(e) {
    this.rightSE = e, this.rightSE.segment = this, this.rightSE.otherSE = this.leftSE, this.leftSE.otherSE = this.rightSE;
  }
  bbox() {
    const e = this.leftSE.point.y, r = this.rightSE.point.y;
    return {
      ll: { x: this.leftSE.point.x, y: e.isLessThan(r) ? e : r },
      ur: { x: this.rightSE.point.x, y: e.isGreaterThan(r) ? e : r }
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
    return It.orient(this.leftSE.point, e, this.rightSE.point);
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
    const r = this.bbox(), o = e.bbox(), s = ue(r, o);
    if (s === null) return null;
    const c = this.leftSE.point, h = this.rightSE.point, l = e.leftSE.point, w = e.rightSE.point, g = Ct(r, l) && this.comparePoint(l) === 0, R = Ct(o, c) && e.comparePoint(c) === 0, d = Ct(r, w) && this.comparePoint(w) === 0, F = Ct(o, h) && e.comparePoint(h) === 0;
    if (R && g)
      return F && !d ? h : !F && d ? w : null;
    if (R)
      return d && c.x.eq(w.x) && c.y.eq(w.y) ? null : c;
    if (g)
      return F && h.x.eq(l.x) && h.y.eq(l.y) ? null : l;
    if (F && d) return null;
    if (F) return h;
    if (d) return w;
    const A = ur(c, this.vector(), l, e.vector());
    return A === null || !Ct(s, A) ? null : It.snap(A);
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
    const r = [], o = e.events !== void 0, s = new xt(e, !0), c = new xt(e, !1), h = this.rightSE;
    this.replaceRightSE(c), r.push(c), r.push(s);
    const l = new Kt(
      s,
      h,
      this.rings.slice(),
      this.windings.slice()
    );
    return xt.comparePoints(l.leftSE.point, l.rightSE.point) > 0 && l.swapEvents(), xt.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), o && (s.checkForConsuming(), c.checkForConsuming()), r;
  }
  /* Swap which event is left and right */
  swapEvents() {
    const e = this.rightSE;
    this.rightSE = this.leftSE, this.leftSE = e, this.leftSE.isLeft = !0, this.rightSE.isLeft = !1;
    for (let r = 0, o = this.windings.length; r < o; r++)
      this.windings[r] *= -1;
  }
  /* Consume another segment. We take their rings under our wing
   * and mark them as consumed. Use for perfectly overlapping segments */
  consume(e) {
    let r = this, o = e;
    for (; r.consumedBy; ) r = r.consumedBy;
    for (; o.consumedBy; ) o = o.consumedBy;
    const s = Kt.compare(r, o);
    if (s !== 0) {
      if (s > 0) {
        const c = r;
        r = o, o = c;
      }
      if (r.prev === o) {
        const c = r;
        r = o, o = c;
      }
      for (let c = 0, h = o.rings.length; c < h; c++) {
        const l = o.rings[c], w = o.windings[c], g = r.rings.indexOf(l);
        g === -1 ? (r.rings.push(l), r.windings.push(w)) : r.windings[g] += w;
      }
      o.rings = null, o.windings = null, o.consumedBy = r, o.leftSE.consumedBy = r.leftSE, o.rightSE.consumedBy = r.rightSE;
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
    const r = this._afterState.rings, o = this._afterState.windings, s = this._afterState.multiPolys;
    for (let l = 0, w = this.rings.length; l < w; l++) {
      const g = this.rings[l], R = this.windings[l], d = r.indexOf(g);
      d === -1 ? (r.push(g), o.push(R)) : o[d] += R;
    }
    const c = [], h = [];
    for (let l = 0, w = r.length; l < w; l++) {
      if (o[l] === 0) continue;
      const g = r[l], R = g.poly;
      if (h.indexOf(R) === -1)
        if (g.isExterior) c.push(R);
        else {
          h.indexOf(R) === -1 && h.push(R);
          const d = c.indexOf(g.poly);
          d !== -1 && c.splice(d, 1);
        }
    }
    for (let l = 0, w = c.length; l < w; l++) {
      const g = c[l].multiPoly;
      s.indexOf(g) === -1 && s.push(g);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const e = this.beforeState().multiPolys, r = this.afterState().multiPolys;
    switch (ce.type) {
      case "union": {
        const o = e.length === 0, s = r.length === 0;
        this._isInResult = o !== s;
        break;
      }
      case "intersection": {
        let o, s;
        e.length < r.length ? (o = e.length, s = r.length) : (o = r.length, s = e.length), this._isInResult = s === ce.numMultiPolys && o < s;
        break;
      }
      case "xor": {
        const o = Math.abs(e.length - r.length);
        this._isInResult = o % 2 === 1;
        break;
      }
      case "difference": {
        const o = (s) => s.length === 1 && s[0].isSubject;
        this._isInResult = o(e) !== o(r);
        break;
      }
    }
    return this._isInResult;
  }
}, xe = class {
  poly;
  isExterior;
  segments;
  bbox;
  constructor(n, e, r) {
    if (!Array.isArray(n) || n.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (this.poly = e, this.isExterior = r, this.segments = [], typeof n[0][0] != "number" || typeof n[0][1] != "number")
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const o = It.snap({ x: new Et(n[0][0]), y: new Et(n[0][1]) });
    this.bbox = {
      ll: { x: o.x, y: o.y },
      ur: { x: o.x, y: o.y }
    };
    let s = o;
    for (let c = 1, h = n.length; c < h; c++) {
      if (typeof n[c][0] != "number" || typeof n[c][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      const l = It.snap({ x: new Et(n[c][0]), y: new Et(n[c][1]) });
      l.x.eq(s.x) && l.y.eq(s.y) || (this.segments.push(Jt.fromRing(s, l, this)), l.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = l.x), l.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = l.y), l.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = l.x), l.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = l.y), s = l);
    }
    (!o.x.eq(s.x) || !o.y.eq(s.y)) && this.segments.push(Jt.fromRing(s, o, this));
  }
  getSweepEvents() {
    const n = [];
    for (let e = 0, r = this.segments.length; e < r; e++) {
      const o = this.segments[e];
      n.push(o.leftSE), n.push(o.rightSE);
    }
    return n;
  }
}, gr = class {
  multiPoly;
  exteriorRing;
  interiorRings;
  bbox;
  constructor(n, e) {
    if (!Array.isArray(n))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new xe(n[0], this, !0), this.bbox = {
      ll: { x: this.exteriorRing.bbox.ll.x, y: this.exteriorRing.bbox.ll.y },
      ur: { x: this.exteriorRing.bbox.ur.x, y: this.exteriorRing.bbox.ur.y }
    }, this.interiorRings = [];
    for (let r = 1, o = n.length; r < o; r++) {
      const s = new xe(n[r], this, !1);
      s.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = s.bbox.ll.x), s.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = s.bbox.ll.y), s.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = s.bbox.ur.x), s.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = s.bbox.ur.y), this.interiorRings.push(s);
    }
    this.multiPoly = e;
  }
  getSweepEvents() {
    const n = this.exteriorRing.getSweepEvents();
    for (let e = 0, r = this.interiorRings.length; e < r; e++) {
      const o = this.interiorRings[e].getSweepEvents();
      for (let s = 0, c = o.length; s < c; s++)
        n.push(o[s]);
    }
    return n;
  }
}, Ee = class {
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
      ll: { x: new Et(Number.POSITIVE_INFINITY), y: new Et(Number.POSITIVE_INFINITY) },
      ur: { x: new Et(Number.NEGATIVE_INFINITY), y: new Et(Number.NEGATIVE_INFINITY) }
    };
    for (let r = 0, o = n.length; r < o; r++) {
      const s = new gr(n[r], this);
      s.bbox.ll.x.isLessThan(this.bbox.ll.x) && (this.bbox.ll.x = s.bbox.ll.x), s.bbox.ll.y.isLessThan(this.bbox.ll.y) && (this.bbox.ll.y = s.bbox.ll.y), s.bbox.ur.x.isGreaterThan(this.bbox.ur.x) && (this.bbox.ur.x = s.bbox.ur.x), s.bbox.ur.y.isGreaterThan(this.bbox.ur.y) && (this.bbox.ur.y = s.bbox.ur.y), this.polys.push(s);
    }
    this.isSubject = e;
  }
  getSweepEvents() {
    const n = [];
    for (let e = 0, r = this.polys.length; e < r; e++) {
      const o = this.polys[e].getSweepEvents();
      for (let s = 0, c = o.length; s < c; s++)
        n.push(o[s]);
    }
    return n;
  }
}, yr = (n, ...e) => ce.run("union", n, e);
It.set;
var ct = 63710088e-1, dr = {
  centimeters: ct * 100,
  centimetres: ct * 100,
  degrees: 360 / (2 * Math.PI),
  feet: ct * 3.28084,
  inches: ct * 39.37,
  kilometers: ct / 1e3,
  kilometres: ct / 1e3,
  meters: ct,
  metres: ct,
  miles: ct / 1609.344,
  millimeters: ct * 1e3,
  millimetres: ct * 1e3,
  nauticalmiles: ct / 1852,
  radians: 1,
  yards: ct * 1.0936
};
function Ft(n, e, r = {}) {
  const o = { type: "Feature" };
  return (r.id === 0 || r.id) && (o.id = r.id), r.bbox && (o.bbox = r.bbox), o.properties = e || {}, o.geometry = n, o;
}
function Ut(n, e, r = {}) {
  if (!n)
    throw new Error("coordinates is required");
  if (!Array.isArray(n))
    throw new Error("coordinates must be an Array");
  if (n.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!Se(n[0]) || !Se(n[1]))
    throw new Error("coordinates must contain numbers");
  return Ft({
    type: "Point",
    coordinates: n
  }, e, r);
}
function wr(n, e, r = {}) {
  for (const s of n) {
    if (s.length < 4)
      throw new Error(
        "Each LinearRing of a Polygon must have 4 or more Positions."
      );
    if (s[s.length - 1].length !== s[0].length)
      throw new Error("First and last Position are not equivalent.");
    for (let c = 0; c < s[s.length - 1].length; c++)
      if (s[s.length - 1][c] !== s[0][c])
        throw new Error("First and last Position are not equivalent.");
  }
  return Ft({
    type: "Polygon",
    coordinates: n
  }, e, r);
}
function Gt(n, e = {}) {
  const r = { type: "FeatureCollection" };
  return e.id && (r.id = e.id), e.bbox && (r.bbox = e.bbox), r.features = n, r;
}
function mr(n, e, r = {}) {
  return Ft({
    type: "MultiPolygon",
    coordinates: n
  }, e, r);
}
function xr(n, e = "kilometers") {
  const r = dr[e];
  if (!r)
    throw new Error(e + " units is invalid");
  return n * r;
}
function Vt(n) {
  return n % 360 * Math.PI / 180;
}
function Se(n) {
  return !isNaN(n) && n !== null && !Array.isArray(n);
}
function kt(n, e, r) {
  if (n !== null)
    for (var o, s, c, h, l, w, g, R = 0, d = 0, F, A = n.type, L = A === "FeatureCollection", C = A === "Feature", k = L ? n.features.length : 1, N = 0; N < k; N++) {
      g = L ? (
        // @ts-expect-error: Known type conflict
        n.features[N].geometry
      ) : C ? (
        // @ts-expect-error: Known type conflict
        n.geometry
      ) : n, F = g ? g.type === "GeometryCollection" : !1, l = F ? g.geometries.length : 1;
      for (var v = 0; v < l; v++) {
        var D = 0, $ = 0;
        if (h = F ? g.geometries[v] : g, h !== null) {
          w = h.coordinates;
          var q = h.type;
          switch (R = 0, q) {
            case null:
              break;
            case "Point":
              if (
                // @ts-expect-error: Known type conflict
                e(
                  w,
                  d,
                  N,
                  D,
                  $
                ) === !1
              )
                return !1;
              d++, D++;
              break;
            case "LineString":
            case "MultiPoint":
              for (o = 0; o < w.length; o++) {
                if (
                  // @ts-expect-error: Known type conflict
                  e(
                    w[o],
                    d,
                    N,
                    D,
                    $
                  ) === !1
                )
                  return !1;
                d++, q === "MultiPoint" && D++;
              }
              q === "LineString" && D++;
              break;
            case "Polygon":
            case "MultiLineString":
              for (o = 0; o < w.length; o++) {
                for (s = 0; s < w[o].length - R; s++) {
                  if (
                    // @ts-expect-error: Known type conflict
                    e(
                      w[o][s],
                      d,
                      N,
                      D,
                      $
                    ) === !1
                  )
                    return !1;
                  d++;
                }
                q === "MultiLineString" && D++, q === "Polygon" && $++;
              }
              q === "Polygon" && D++;
              break;
            case "MultiPolygon":
              for (o = 0; o < w.length; o++) {
                for ($ = 0, s = 0; s < w[o].length; s++) {
                  for (c = 0; c < w[o][s].length - R; c++) {
                    if (
                      // @ts-expect-error: Known type conflict
                      e(
                        w[o][s][c],
                        d,
                        N,
                        D,
                        $
                      ) === !1
                    )
                      return !1;
                    d++;
                  }
                  $++;
                }
                D++;
              }
              break;
            case "GeometryCollection":
              for (o = 0; o < h.geometries.length; o++)
                if (
                  // @ts-expect-error: Known type conflict
                  kt(h.geometries[o], e) === !1
                )
                  return !1;
              break;
            default:
              throw new Error("Unknown Geometry Type");
          }
        }
      }
    }
}
function ze(n, e) {
  if (n.type === "Feature")
    e(n, 0);
  else if (n.type === "FeatureCollection")
    for (var r = 0; r < n.features.length && e(n.features[r], r) !== !1; r++)
      ;
}
function ae(n, e) {
  var r, o, s, c, h, l, w, g, R, d, F = 0, A = n.type === "FeatureCollection", L = n.type === "Feature", C = A ? n.features.length : 1;
  for (r = 0; r < C; r++) {
    for (l = A ? (
      // @ts-expect-error: Known type conflict
      n.features[r].geometry
    ) : L ? (
      // @ts-expect-error: Known type conflict
      n.geometry
    ) : n, g = A ? (
      // @ts-expect-error: Known type conflict
      n.features[r].properties
    ) : L ? (
      // @ts-expect-error: Known type conflict
      n.properties
    ) : {}, R = A ? (
      // @ts-expect-error: Known type conflict
      n.features[r].bbox
    ) : L ? (
      // @ts-expect-error: Known type conflict
      n.bbox
    ) : void 0, d = A ? (
      // @ts-expect-error: Known type conflict
      n.features[r].id
    ) : L ? (
      // @ts-expect-error: Known type conflict
      n.id
    ) : void 0, w = l ? l.type === "GeometryCollection" : !1, h = w ? l.geometries.length : 1, s = 0; s < h; s++) {
      if (c = w ? l.geometries[s] : l, c === null) {
        if (
          // @ts-expect-error: Known type conflict
          e(
            // @ts-expect-error: Known type conflict
            null,
            F,
            g,
            R,
            d
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
            e(
              c,
              F,
              g,
              R,
              d
            ) === !1
          )
            return !1;
          break;
        }
        case "GeometryCollection": {
          for (o = 0; o < c.geometries.length; o++)
            if (
              // @ts-expect-error: Known type conflict
              e(
                c.geometries[o],
                F,
                g,
                R,
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
    F++;
  }
}
function Er(n, e, r) {
  var o = r;
  return ae(
    n,
    function(s, c, h, l, w) {
      o = e(
        // @ts-expect-error: Known type conflict
        o,
        s,
        c,
        h,
        l,
        w
      );
    }
  ), o;
}
function Sr(n, e) {
  ae(n, function(r, o, s, c, h) {
    var l = r === null ? null : r.type;
    switch (l) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        return (
          // @ts-expect-error: Known type conflict
          e(
            Ft(r, s, { bbox: c, id: h }),
            o,
            0
          ) === !1 ? !1 : void 0
        );
    }
    var w;
    switch (l) {
      case "MultiPoint":
        w = "Point";
        break;
      case "MultiLineString":
        w = "LineString";
        break;
      case "MultiPolygon":
        w = "Polygon";
        break;
    }
    for (
      var g = 0;
      // @ts-expect-error: Known type conflict
      g < r.coordinates.length;
      g++
    ) {
      var R = r.coordinates[g], d = {
        type: w,
        coordinates: R
      };
      if (
        // @ts-expect-error: Known type conflict
        e(Ft(d, s), o, g) === !1
      )
        return !1;
    }
  });
}
function Br(n, e = {}) {
  const r = [];
  if (ae(n, (s) => {
    r.push(s.coordinates);
  }), r.length < 2)
    throw new Error("Must have at least 2 geometries");
  const o = yr(r[0], ...r.slice(1));
  return o.length === 0 ? null : o.length === 1 ? wr(o[0], e.properties) : mr(o, e.properties);
}
function Be(n) {
  if (!n) throw new Error("geojson is required");
  var e = [];
  return Sr(n, function(r) {
    e.push(r);
  }), Gt(e);
}
class Ir {
  constructor(e = [], r = (o, s) => o < s ? -1 : o > s ? 1 : 0) {
    if (this.data = e, this.length = this.data.length, this.compare = r, this.length > 0)
      for (let o = (this.length >> 1) - 1; o >= 0; o--) this._down(o);
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
    const { data: r, compare: o } = this, s = r[e];
    for (; e > 0; ) {
      const c = e - 1 >> 1, h = r[c];
      if (o(s, h) >= 0) break;
      r[e] = h, e = c;
    }
    r[e] = s;
  }
  _down(e) {
    const { data: r, compare: o } = this, s = this.length >> 1, c = r[e];
    for (; e < s; ) {
      let h = (e << 1) + 1;
      const l = h + 1;
      if (l < this.length && o(r[l], r[h]) < 0 && (h = l), o(r[h], c) >= 0) break;
      r[e] = r[h], e = h;
    }
    r[e] = c;
  }
}
function br(n, e = 1, r = !1) {
  let o = 1 / 0, s = 1 / 0, c = -1 / 0, h = -1 / 0;
  for (const [N, v] of n[0])
    N < o && (o = N), v < s && (s = v), N > c && (c = N), v > h && (h = v);
  const l = c - o, w = h - s, g = Math.max(e, Math.min(l, w));
  if (g === e) {
    const N = [o, s];
    return N.distance = 0, N;
  }
  const R = new Ir([], (N, v) => v.max - N.max);
  let d = Ar(n);
  const F = new Zt(o + l / 2, s + w / 2, 0, n);
  F.d > d.d && (d = F);
  let A = 2;
  function L(N, v, D) {
    const $ = new Zt(N, v, D, n);
    A++, $.max > d.d + e && R.push($), $.d > d.d && (d = $, r && console.log(\`found best \${Math.round(1e4 * $.d) / 1e4} after \${A} probes\`));
  }
  let C = g / 2;
  for (let N = o; N < c; N += g)
    for (let v = s; v < h; v += g)
      L(N + C, v + C, C);
  for (; R.length; ) {
    const { max: N, x: v, y: D, h: $ } = R.pop();
    if (N - d.d <= e) break;
    C = $ / 2, L(v - C, D - C, C), L(v + C, D - C, C), L(v - C, D + C, C), L(v + C, D + C, C);
  }
  r && console.log(\`num probes: \${A}
best distance: \${d.d}\`);
  const k = [d.x, d.y];
  return k.distance = d.d, k;
}
function Zt(n, e, r, o) {
  this.x = n, this.y = e, this.h = r, this.d = vr(n, e, o), this.max = this.d + this.h * Math.SQRT2;
}
function vr(n, e, r) {
  let o = !1, s = 1 / 0;
  for (const c of r)
    for (let h = 0, l = c.length, w = l - 1; h < l; w = h++) {
      const g = c[h], R = c[w];
      g[1] > e != R[1] > e && n < (R[0] - g[0]) * (e - g[1]) / (R[1] - g[1]) + g[0] && (o = !o), s = Math.min(s, Tr(n, e, g, R));
    }
  return s === 0 ? 0 : (o ? 1 : -1) * Math.sqrt(s);
}
function Ar(n) {
  let e = 0, r = 0, o = 0;
  const s = n[0];
  for (let h = 0, l = s.length, w = l - 1; h < l; w = h++) {
    const g = s[h], R = s[w], d = g[0] * R[1] - R[0] * g[1];
    r += (g[0] + R[0]) * d, o += (g[1] + R[1]) * d, e += d * 3;
  }
  const c = new Zt(r / e, o / e, 0, n);
  return e === 0 || c.d < 0 ? new Zt(s[0][0], s[0][1], 0, n) : c;
}
function Tr(n, e, r, o) {
  let s = r[0], c = r[1], h = o[0] - s, l = o[1] - c;
  if (h !== 0 || l !== 0) {
    const w = ((n - s) * h + (e - c) * l) / (h * h + l * l);
    w > 1 ? (s = o[0], c = o[1]) : w > 0 && (s += h * w, c += l * w);
  }
  return h = n - s, l = e - c, h * h + l * l;
}
function Rr(n) {
  const e = [];
  return n.type === "FeatureCollection" ? ze(n, function(r) {
    kt(r, function(o) {
      e.push(Ut(o, r.properties));
    });
  }) : n.type === "Feature" ? kt(n, function(r) {
    e.push(Ut(r, n.properties));
  }) : kt(n, function(r) {
    e.push(Ut(r));
  }), Gt(e);
}
function Pr(n, e = {}) {
  if (n.bbox != null && e.recompute !== !0)
    return n.bbox;
  const r = [1 / 0, 1 / 0, -1 / 0, -1 / 0];
  return kt(n, (o) => {
    r[0] > o[0] && (r[0] = o[0]), r[1] > o[1] && (r[1] = o[1]), r[2] < o[0] && (r[2] = o[0]), r[3] < o[1] && (r[3] = o[1]);
  }), r;
}
function _r(n, e = {}) {
  const r = Pr(n), o = (r[0] + r[2]) / 2, s = (r[1] + r[3]) / 2;
  return Ut([o, s], e.properties, e);
}
function Fr(n) {
  if (!n)
    throw new Error("geojson is required");
  switch (n.type) {
    case "Feature":
      return Ve(n);
    case "FeatureCollection":
      return Mr(n);
    case "Point":
    case "LineString":
    case "Polygon":
    case "MultiPoint":
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
      return pe(n);
    default:
      throw new Error("unknown GeoJSON type");
  }
}
function Ve(n) {
  const e = { type: "Feature" };
  return Object.keys(n).forEach((r) => {
    switch (r) {
      case "type":
      case "properties":
      case "geometry":
        return;
      default:
        e[r] = n[r];
    }
  }), e.properties = Ye(n.properties), n.geometry == null ? e.geometry = null : e.geometry = pe(n.geometry), e;
}
function Ye(n) {
  const e = {};
  return n && Object.keys(n).forEach((r) => {
    const o = n[r];
    typeof o == "object" ? o === null ? e[r] = null : Array.isArray(o) ? e[r] = o.map((s) => s) : e[r] = Ye(o) : e[r] = o;
  }), e;
}
function Mr(n) {
  const e = { type: "FeatureCollection" };
  return Object.keys(n).forEach((r) => {
    switch (r) {
      case "type":
      case "features":
        return;
      default:
        e[r] = n[r];
    }
  }), e.features = n.features.map((r) => Ve(r)), e;
}
function pe(n) {
  const e = { type: n.type };
  return n.bbox && (e.bbox = n.bbox), n.type === "GeometryCollection" ? (e.geometries = n.geometries.map((r) => pe(r)), e) : (e.coordinates = Xe(n.coordinates), e);
}
function Xe(n) {
  const e = n;
  return typeof e[0] != "object" ? e.slice() : e.map((r) => Xe(r));
}
function he(n) {
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
function Cr(n) {
  return n.type === "Feature" ? n.geometry : n;
}
function Lr(n, e, r = {}) {
  var o = he(n), s = he(e), c = Vt(s[1] - o[1]), h = Vt(s[0] - o[0]), l = Vt(o[1]), w = Vt(s[1]), g = Math.pow(Math.sin(c / 2), 2) + Math.pow(Math.sin(h / 2), 2) * Math.cos(l) * Math.cos(w);
  return xr(
    2 * Math.atan2(Math.sqrt(g), Math.sqrt(1 - g)),
    r.units
  );
}
var Or = Object.defineProperty, Nr = Object.defineProperties, Ur = Object.getOwnPropertyDescriptors, Ie = Object.getOwnPropertySymbols, kr = Object.prototype.hasOwnProperty, Gr = Object.prototype.propertyIsEnumerable, be = (n, e, r) => e in n ? Or(n, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : n[e] = r, ve = (n, e) => {
  for (var r in e || (e = {}))
    kr.call(e, r) && be(n, r, e[r]);
  if (Ie)
    for (var r of Ie(e))
      Gr.call(e, r) && be(n, r, e[r]);
  return n;
}, Ae = (n, e) => Nr(n, Ur(e));
function Dr(n, e, r = {}) {
  if (!n) throw new Error("targetPoint is required");
  if (!e) throw new Error("points is required");
  let o = 1 / 0, s = 0;
  ze(e, (h, l) => {
    const w = Lr(n, h, r);
    w < o && (s = l, o = w);
  });
  const c = Fr(e.features[s]);
  return Ae(ve({}, c), {
    properties: Ae(ve({}, c.properties), {
      featureIndex: s,
      distanceToPoint: o
    })
  });
}
const Bt = 11102230246251565e-32, ut = 134217729, qr = (3 + 8 * Bt) * Bt;
function ie(n, e, r, o, s) {
  let c, h, l, w, g = e[0], R = o[0], d = 0, F = 0;
  R > g == R > -g ? (c = g, g = e[++d]) : (c = R, R = o[++F]);
  let A = 0;
  if (d < n && F < r)
    for (R > g == R > -g ? (h = g + c, l = c - (h - g), g = e[++d]) : (h = R + c, l = c - (h - R), R = o[++F]), c = h, l !== 0 && (s[A++] = l); d < n && F < r; )
      R > g == R > -g ? (h = c + g, w = h - c, l = c - (h - w) + (g - w), g = e[++d]) : (h = c + R, w = h - c, l = c - (h - w) + (R - w), R = o[++F]), c = h, l !== 0 && (s[A++] = l);
  for (; d < n; )
    h = c + g, w = h - c, l = c - (h - w) + (g - w), g = e[++d], c = h, l !== 0 && (s[A++] = l);
  for (; F < r; )
    h = c + R, w = h - c, l = c - (h - w) + (R - w), R = o[++F], c = h, l !== 0 && (s[A++] = l);
  return (c !== 0 || A === 0) && (s[A++] = c), A;
}
function $r(n, e) {
  let r = e[0];
  for (let o = 1; o < n; o++) r += e[o];
  return r;
}
function Dt(n) {
  return new Float64Array(n);
}
const zr = (3 + 16 * Bt) * Bt, Vr = (2 + 12 * Bt) * Bt, Yr = (9 + 64 * Bt) * Bt * Bt, _t = Dt(4), Te = Dt(8), Re = Dt(12), Pe = Dt(16), ft = Dt(4);
function Xr(n, e, r, o, s, c, h) {
  let l, w, g, R, d, F, A, L, C, k, N, v, D, $, q, K, J, f;
  const p = n - s, y = r - s, I = e - c, x = o - c;
  $ = p * x, F = ut * p, A = F - (F - p), L = p - A, F = ut * x, C = F - (F - x), k = x - C, q = L * k - ($ - A * C - L * C - A * k), K = I * y, F = ut * I, A = F - (F - I), L = I - A, F = ut * y, C = F - (F - y), k = y - C, J = L * k - (K - A * C - L * C - A * k), N = q - J, d = q - N, _t[0] = q - (N + d) + (d - J), v = $ + N, d = v - $, D = $ - (v - d) + (N - d), N = D - K, d = D - N, _t[1] = D - (N + d) + (d - K), f = v + N, d = f - v, _t[2] = v - (f - d) + (N - d), _t[3] = f;
  let S = $r(4, _t), P = Vr * h;
  if (S >= P || -S >= P || (d = n - p, l = n - (p + d) + (d - s), d = r - y, g = r - (y + d) + (d - s), d = e - I, w = e - (I + d) + (d - c), d = o - x, R = o - (x + d) + (d - c), l === 0 && w === 0 && g === 0 && R === 0) || (P = Yr * h + qr * Math.abs(S), S += p * R + x * l - (I * g + y * w), S >= P || -S >= P)) return S;
  $ = l * x, F = ut * l, A = F - (F - l), L = l - A, F = ut * x, C = F - (F - x), k = x - C, q = L * k - ($ - A * C - L * C - A * k), K = w * y, F = ut * w, A = F - (F - w), L = w - A, F = ut * y, C = F - (F - y), k = y - C, J = L * k - (K - A * C - L * C - A * k), N = q - J, d = q - N, ft[0] = q - (N + d) + (d - J), v = $ + N, d = v - $, D = $ - (v - d) + (N - d), N = D - K, d = D - N, ft[1] = D - (N + d) + (d - K), f = v + N, d = f - v, ft[2] = v - (f - d) + (N - d), ft[3] = f;
  const m = ie(4, _t, 4, ft, Te);
  $ = p * R, F = ut * p, A = F - (F - p), L = p - A, F = ut * R, C = F - (F - R), k = R - C, q = L * k - ($ - A * C - L * C - A * k), K = I * g, F = ut * I, A = F - (F - I), L = I - A, F = ut * g, C = F - (F - g), k = g - C, J = L * k - (K - A * C - L * C - A * k), N = q - J, d = q - N, ft[0] = q - (N + d) + (d - J), v = $ + N, d = v - $, D = $ - (v - d) + (N - d), N = D - K, d = D - N, ft[1] = D - (N + d) + (d - K), f = v + N, d = f - v, ft[2] = v - (f - d) + (N - d), ft[3] = f;
  const B = ie(m, Te, 4, ft, Re);
  $ = l * R, F = ut * l, A = F - (F - l), L = l - A, F = ut * R, C = F - (F - R), k = R - C, q = L * k - ($ - A * C - L * C - A * k), K = w * g, F = ut * w, A = F - (F - w), L = w - A, F = ut * g, C = F - (F - g), k = g - C, J = L * k - (K - A * C - L * C - A * k), N = q - J, d = q - N, ft[0] = q - (N + d) + (d - J), v = $ + N, d = v - $, D = $ - (v - d) + (N - d), N = D - K, d = D - N, ft[1] = D - (N + d) + (d - K), f = v + N, d = f - v, ft[2] = v - (f - d) + (N - d), ft[3] = f;
  const T = ie(B, Re, 4, ft, Pe);
  return Pe[T - 1];
}
function Kr(n, e, r, o, s, c) {
  const h = (e - c) * (r - s), l = (n - s) * (o - c), w = h - l, g = Math.abs(h + l);
  return Math.abs(w) >= zr * g ? w : -Xr(n, e, r, o, s, c, g);
}
function Wr(n, e) {
  var r, o, s = 0, c, h, l, w, g, R, d, F = n[0], A = n[1], L = e.length;
  for (r = 0; r < L; r++) {
    o = 0;
    var C = e[r], k = C.length - 1;
    if (R = C[0], R[0] !== C[k][0] && R[1] !== C[k][1])
      throw new Error("First and last coordinates in a ring must be the same");
    for (h = R[0] - F, l = R[1] - A, o; o < k; o++) {
      if (d = C[o + 1], w = d[0] - F, g = d[1] - A, l === 0 && g === 0) {
        if (w <= 0 && h >= 0 || h <= 0 && w >= 0)
          return 0;
      } else if (g >= 0 && l <= 0 || g <= 0 && l >= 0) {
        if (c = Kr(h, w, l, g, 0, 0), c === 0)
          return 0;
        (c > 0 && g > 0 && l <= 0 || c < 0 && g <= 0 && l > 0) && s++;
      }
      R = d, l = g, h = w;
    }
  }
  return s % 2 !== 0;
}
function Hr(n, e, r = {}) {
  if (!n)
    throw new Error("point is required");
  if (!e)
    throw new Error("polygon is required");
  const o = he(n), s = Cr(e), c = s.type, h = e.bbox;
  let l = s.coordinates;
  if (h && Jr(o, h) === !1)
    return !1;
  c === "Polygon" && (l = [l]);
  let w = !1;
  for (var g = 0; g < l.length; ++g) {
    const R = Wr(o, l[g]);
    if (R === 0) return !r.ignoreBoundary;
    R && (w = !0);
  }
  return w;
}
function Jr(n, e) {
  return e[0] <= n[0] && e[1] <= n[1] && e[2] >= n[0] && e[3] >= n[1];
}
function _e(n) {
  const e = Zr(n), r = _r(e);
  let o = !1, s = 0;
  for (; !o && s < e.features.length; ) {
    const c = e.features[s].geometry;
    let h, l, w, g, R, d, F = !1;
    if (c.type === "Point")
      r.geometry.coordinates[0] === c.coordinates[0] && r.geometry.coordinates[1] === c.coordinates[1] && (o = !0);
    else if (c.type === "MultiPoint") {
      let A = !1, L = 0;
      for (; !A && L < c.coordinates.length; )
        r.geometry.coordinates[0] === c.coordinates[L][0] && r.geometry.coordinates[1] === c.coordinates[L][1] && (o = !0, A = !0), L++;
    } else if (c.type === "LineString") {
      let A = 0;
      for (; !F && A < c.coordinates.length - 1; )
        h = r.geometry.coordinates[0], l = r.geometry.coordinates[1], w = c.coordinates[A][0], g = c.coordinates[A][1], R = c.coordinates[A + 1][0], d = c.coordinates[A + 1][1], Fe(h, l, w, g, R, d) && (F = !0, o = !0), A++;
    } else if (c.type === "MultiLineString") {
      let A = 0;
      for (; A < c.coordinates.length; ) {
        F = !1;
        let L = 0;
        const C = c.coordinates[A];
        for (; !F && L < C.length - 1; )
          h = r.geometry.coordinates[0], l = r.geometry.coordinates[1], w = C[L][0], g = C[L][1], R = C[L + 1][0], d = C[L + 1][1], Fe(h, l, w, g, R, d) && (F = !0, o = !0), L++;
        A++;
      }
    } else (c.type === "Polygon" || c.type === "MultiPolygon") && Hr(r, c) && (o = !0);
    s++;
  }
  if (o)
    return r;
  {
    const c = Gt([]);
    for (let h = 0; h < e.features.length; h++)
      c.features = c.features.concat(
        Rr(e.features[h]).features
      );
    return Ut(Dr(r, c).geometry.coordinates);
  }
}
function Zr(n) {
  return n.type !== "FeatureCollection" ? n.type !== "Feature" ? Gt([Ft(n)]) : Gt([n]) : n;
}
function Fe(n, e, r, o, s, c) {
  const h = Math.sqrt((s - r) * (s - r) + (c - o) * (c - o)), l = Math.sqrt((n - r) * (n - r) + (e - o) * (e - o)), w = Math.sqrt((s - n) * (s - n) + (c - e) * (c - e));
  return h === l + w;
}
function Qr(n) {
  return Er(
    n,
    (e, r) => e + jr(r),
    0
  );
}
function jr(n) {
  let e = 0, r;
  switch (n.type) {
    case "Polygon":
      return Me(n.coordinates);
    case "MultiPolygon":
      for (r = 0; r < n.coordinates.length; r++)
        e += Me(n.coordinates[r]);
      return e;
    case "Point":
    case "MultiPoint":
    case "LineString":
    case "MultiLineString":
      return 0;
  }
  return 0;
}
function Me(n) {
  let e = 0;
  if (n && n.length > 0) {
    e += Math.abs(Ce(n[0]));
    for (let r = 1; r < n.length; r++)
      e -= Math.abs(Ce(n[r]));
  }
  return e;
}
var ti = ct * ct / 2, ne = Math.PI / 180;
function Ce(n) {
  const e = n.length - 1;
  if (e <= 2) return 0;
  let r = 0, o = 0;
  for (; o < e; ) {
    const s = n[o], c = n[o + 1 === e ? 0 : o + 1], h = n[o + 2 >= e ? (o + 2) % e : o + 2], l = s[0] * ne, w = c[1] * ne, g = h[0] * ne;
    r += (g - l) * Math.sin(w), o++;
  }
  return r * ti;
}
var oe = {}, Lt = {}, Le;
function ei() {
  if (Le) return Lt;
  Le = 1, Lt.byteLength = l, Lt.toByteArray = g, Lt.fromByteArray = F;
  for (var n = [], e = [], r = typeof Uint8Array < "u" ? Uint8Array : Array, o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", s = 0, c = o.length; s < c; ++s)
    n[s] = o[s], e[o.charCodeAt(s)] = s;
  e[45] = 62, e[95] = 63;
  function h(A) {
    var L = A.length;
    if (L % 4 > 0)
      throw new Error("Invalid string. Length must be a multiple of 4");
    var C = A.indexOf("=");
    C === -1 && (C = L);
    var k = C === L ? 0 : 4 - C % 4;
    return [C, k];
  }
  function l(A) {
    var L = h(A), C = L[0], k = L[1];
    return (C + k) * 3 / 4 - k;
  }
  function w(A, L, C) {
    return (L + C) * 3 / 4 - C;
  }
  function g(A) {
    var L, C = h(A), k = C[0], N = C[1], v = new r(w(A, k, N)), D = 0, $ = N > 0 ? k - 4 : k, q;
    for (q = 0; q < $; q += 4)
      L = e[A.charCodeAt(q)] << 18 | e[A.charCodeAt(q + 1)] << 12 | e[A.charCodeAt(q + 2)] << 6 | e[A.charCodeAt(q + 3)], v[D++] = L >> 16 & 255, v[D++] = L >> 8 & 255, v[D++] = L & 255;
    return N === 2 && (L = e[A.charCodeAt(q)] << 2 | e[A.charCodeAt(q + 1)] >> 4, v[D++] = L & 255), N === 1 && (L = e[A.charCodeAt(q)] << 10 | e[A.charCodeAt(q + 1)] << 4 | e[A.charCodeAt(q + 2)] >> 2, v[D++] = L >> 8 & 255, v[D++] = L & 255), v;
  }
  function R(A) {
    return n[A >> 18 & 63] + n[A >> 12 & 63] + n[A >> 6 & 63] + n[A & 63];
  }
  function d(A, L, C) {
    for (var k, N = [], v = L; v < C; v += 3)
      k = (A[v] << 16 & 16711680) + (A[v + 1] << 8 & 65280) + (A[v + 2] & 255), N.push(R(k));
    return N.join("");
  }
  function F(A) {
    for (var L, C = A.length, k = C % 3, N = [], v = 16383, D = 0, $ = C - k; D < $; D += v)
      N.push(d(A, D, D + v > $ ? $ : D + v));
    return k === 1 ? (L = A[C - 1], N.push(
      n[L >> 2] + n[L << 4 & 63] + "=="
    )) : k === 2 && (L = (A[C - 2] << 8) + A[C - 1], N.push(
      n[L >> 10] + n[L >> 4 & 63] + n[L << 2 & 63] + "="
    )), N.join("");
  }
  return Lt;
}
var Yt = {};
var Oe;
function ri() {
  return Oe || (Oe = 1, Yt.read = function(n, e, r, o, s) {
    var c, h, l = s * 8 - o - 1, w = (1 << l) - 1, g = w >> 1, R = -7, d = r ? s - 1 : 0, F = r ? -1 : 1, A = n[e + d];
    for (d += F, c = A & (1 << -R) - 1, A >>= -R, R += l; R > 0; c = c * 256 + n[e + d], d += F, R -= 8)
      ;
    for (h = c & (1 << -R) - 1, c >>= -R, R += o; R > 0; h = h * 256 + n[e + d], d += F, R -= 8)
      ;
    if (c === 0)
      c = 1 - g;
    else {
      if (c === w)
        return h ? NaN : (A ? -1 : 1) * (1 / 0);
      h = h + Math.pow(2, o), c = c - g;
    }
    return (A ? -1 : 1) * h * Math.pow(2, c - o);
  }, Yt.write = function(n, e, r, o, s, c) {
    var h, l, w, g = c * 8 - s - 1, R = (1 << g) - 1, d = R >> 1, F = s === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, A = o ? 0 : c - 1, L = o ? 1 : -1, C = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
    for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (l = isNaN(e) ? 1 : 0, h = R) : (h = Math.floor(Math.log(e) / Math.LN2), e * (w = Math.pow(2, -h)) < 1 && (h--, w *= 2), h + d >= 1 ? e += F / w : e += F * Math.pow(2, 1 - d), e * w >= 2 && (h++, w /= 2), h + d >= R ? (l = 0, h = R) : h + d >= 1 ? (l = (e * w - 1) * Math.pow(2, s), h = h + d) : (l = e * Math.pow(2, d - 1) * Math.pow(2, s), h = 0)); s >= 8; n[r + A] = l & 255, A += L, l /= 256, s -= 8)
      ;
    for (h = h << s | l, g += s; g > 0; n[r + A] = h & 255, A += L, h /= 256, g -= 8)
      ;
    n[r + A - L] |= C * 128;
  }), Yt;
}
var Ne;
function ii() {
  return Ne || (Ne = 1, (function(n) {
    const e = ei(), r = ri(), o = typeof Symbol == "function" && typeof Symbol.for == "function" ? /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom") : null;
    n.Buffer = l, n.SlowBuffer = v, n.INSPECT_MAX_BYTES = 50;
    const s = 2147483647;
    n.kMaxLength = s, l.TYPED_ARRAY_SUPPORT = c(), !l.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
      "This browser lacks typed array (Uint8Array) support which is required by \`buffer\` v5.x. Use \`buffer\` v4.x if you require old browser support."
    );
    function c() {
      try {
        const u = new Uint8Array(1), t = { foo: function() {
          return 42;
        } };
        return Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(u, t), u.foo() === 42;
      } catch {
        return !1;
      }
    }
    Object.defineProperty(l.prototype, "parent", {
      enumerable: !0,
      get: function() {
        if (l.isBuffer(this))
          return this.buffer;
      }
    }), Object.defineProperty(l.prototype, "offset", {
      enumerable: !0,
      get: function() {
        if (l.isBuffer(this))
          return this.byteOffset;
      }
    });
    function h(u) {
      if (u > s)
        throw new RangeError('The value "' + u + '" is invalid for option "size"');
      const t = new Uint8Array(u);
      return Object.setPrototypeOf(t, l.prototype), t;
    }
    function l(u, t, i) {
      if (typeof u == "number") {
        if (typeof t == "string")
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        return d(u);
      }
      return w(u, t, i);
    }
    l.poolSize = 8192;
    function w(u, t, i) {
      if (typeof u == "string")
        return F(u, t);
      if (ArrayBuffer.isView(u))
        return L(u);
      if (u == null)
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof u
        );
      if (mt(u, ArrayBuffer) || u && mt(u.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (mt(u, SharedArrayBuffer) || u && mt(u.buffer, SharedArrayBuffer)))
        return C(u, t, i);
      if (typeof u == "number")
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      const a = u.valueOf && u.valueOf();
      if (a != null && a !== u)
        return l.from(a, t, i);
      const E = k(u);
      if (E) return E;
      if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof u[Symbol.toPrimitive] == "function")
        return l.from(u[Symbol.toPrimitive]("string"), t, i);
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof u
      );
    }
    l.from = function(u, t, i) {
      return w(u, t, i);
    }, Object.setPrototypeOf(l.prototype, Uint8Array.prototype), Object.setPrototypeOf(l, Uint8Array);
    function g(u) {
      if (typeof u != "number")
        throw new TypeError('"size" argument must be of type number');
      if (u < 0)
        throw new RangeError('The value "' + u + '" is invalid for option "size"');
    }
    function R(u, t, i) {
      return g(u), u <= 0 ? h(u) : t !== void 0 ? typeof i == "string" ? h(u).fill(t, i) : h(u).fill(t) : h(u);
    }
    l.alloc = function(u, t, i) {
      return R(u, t, i);
    };
    function d(u) {
      return g(u), h(u < 0 ? 0 : N(u) | 0);
    }
    l.allocUnsafe = function(u) {
      return d(u);
    }, l.allocUnsafeSlow = function(u) {
      return d(u);
    };
    function F(u, t) {
      if ((typeof t != "string" || t === "") && (t = "utf8"), !l.isEncoding(t))
        throw new TypeError("Unknown encoding: " + t);
      const i = D(u, t) | 0;
      let a = h(i);
      const E = a.write(u, t);
      return E !== i && (a = a.slice(0, E)), a;
    }
    function A(u) {
      const t = u.length < 0 ? 0 : N(u.length) | 0, i = h(t);
      for (let a = 0; a < t; a += 1)
        i[a] = u[a] & 255;
      return i;
    }
    function L(u) {
      if (mt(u, Uint8Array)) {
        const t = new Uint8Array(u);
        return C(t.buffer, t.byteOffset, t.byteLength);
      }
      return A(u);
    }
    function C(u, t, i) {
      if (t < 0 || u.byteLength < t)
        throw new RangeError('"offset" is outside of buffer bounds');
      if (u.byteLength < t + (i || 0))
        throw new RangeError('"length" is outside of buffer bounds');
      let a;
      return t === void 0 && i === void 0 ? a = new Uint8Array(u) : i === void 0 ? a = new Uint8Array(u, t) : a = new Uint8Array(u, t, i), Object.setPrototypeOf(a, l.prototype), a;
    }
    function k(u) {
      if (l.isBuffer(u)) {
        const t = N(u.length) | 0, i = h(t);
        return i.length === 0 || u.copy(i, 0, 0, t), i;
      }
      if (u.length !== void 0)
        return typeof u.length != "number" || jt(u.length) ? h(0) : A(u);
      if (u.type === "Buffer" && Array.isArray(u.data))
        return A(u.data);
    }
    function N(u) {
      if (u >= s)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + s.toString(16) + " bytes");
      return u | 0;
    }
    function v(u) {
      return +u != u && (u = 0), l.alloc(+u);
    }
    l.isBuffer = function(t) {
      return t != null && t._isBuffer === !0 && t !== l.prototype;
    }, l.compare = function(t, i) {
      if (mt(t, Uint8Array) && (t = l.from(t, t.offset, t.byteLength)), mt(i, Uint8Array) && (i = l.from(i, i.offset, i.byteLength)), !l.isBuffer(t) || !l.isBuffer(i))
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      if (t === i) return 0;
      let a = t.length, E = i.length;
      for (let _ = 0, M = Math.min(a, E); _ < M; ++_)
        if (t[_] !== i[_]) {
          a = t[_], E = i[_];
          break;
        }
      return a < E ? -1 : E < a ? 1 : 0;
    }, l.isEncoding = function(t) {
      switch (String(t).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return !0;
        default:
          return !1;
      }
    }, l.concat = function(t, i) {
      if (!Array.isArray(t))
        throw new TypeError('"list" argument must be an Array of Buffers');
      if (t.length === 0)
        return l.alloc(0);
      let a;
      if (i === void 0)
        for (i = 0, a = 0; a < t.length; ++a)
          i += t[a].length;
      const E = l.allocUnsafe(i);
      let _ = 0;
      for (a = 0; a < t.length; ++a) {
        let M = t[a];
        if (mt(M, Uint8Array))
          _ + M.length > E.length ? (l.isBuffer(M) || (M = l.from(M)), M.copy(E, _)) : Uint8Array.prototype.set.call(
            E,
            M,
            _
          );
        else if (l.isBuffer(M))
          M.copy(E, _);
        else
          throw new TypeError('"list" argument must be an Array of Buffers');
        _ += M.length;
      }
      return E;
    };
    function D(u, t) {
      if (l.isBuffer(u))
        return u.length;
      if (ArrayBuffer.isView(u) || mt(u, ArrayBuffer))
        return u.byteLength;
      if (typeof u != "string")
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof u
        );
      const i = u.length, a = arguments.length > 2 && arguments[2] === !0;
      if (!a && i === 0) return 0;
      let E = !1;
      for (; ; )
        switch (t) {
          case "ascii":
          case "latin1":
          case "binary":
            return i;
          case "utf8":
          case "utf-8":
            return Qt(u).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return i * 2;
          case "hex":
            return i >>> 1;
          case "base64":
            return ge(u).length;
          default:
            if (E)
              return a ? -1 : Qt(u).length;
            t = ("" + t).toLowerCase(), E = !0;
        }
    }
    l.byteLength = D;
    function $(u, t, i) {
      let a = !1;
      if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((i === void 0 || i > this.length) && (i = this.length), i <= 0) || (i >>>= 0, t >>>= 0, i <= t))
        return "";
      for (u || (u = "utf8"); ; )
        switch (u) {
          case "hex":
            return O(this, t, i);
          case "utf8":
          case "utf-8":
            return P(this, t, i);
          case "ascii":
            return T(this, t, i);
          case "latin1":
          case "binary":
            return b(this, t, i);
          case "base64":
            return S(this, t, i);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return G(this, t, i);
          default:
            if (a) throw new TypeError("Unknown encoding: " + u);
            u = (u + "").toLowerCase(), a = !0;
        }
    }
    l.prototype._isBuffer = !0;
    function q(u, t, i) {
      const a = u[t];
      u[t] = u[i], u[i] = a;
    }
    l.prototype.swap16 = function() {
      const t = this.length;
      if (t % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      for (let i = 0; i < t; i += 2)
        q(this, i, i + 1);
      return this;
    }, l.prototype.swap32 = function() {
      const t = this.length;
      if (t % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      for (let i = 0; i < t; i += 4)
        q(this, i, i + 3), q(this, i + 1, i + 2);
      return this;
    }, l.prototype.swap64 = function() {
      const t = this.length;
      if (t % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let i = 0; i < t; i += 8)
        q(this, i, i + 7), q(this, i + 1, i + 6), q(this, i + 2, i + 5), q(this, i + 3, i + 4);
      return this;
    }, l.prototype.toString = function() {
      const t = this.length;
      return t === 0 ? "" : arguments.length === 0 ? P(this, 0, t) : $.apply(this, arguments);
    }, l.prototype.toLocaleString = l.prototype.toString, l.prototype.equals = function(t) {
      if (!l.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
      return this === t ? !0 : l.compare(this, t) === 0;
    }, l.prototype.inspect = function() {
      let t = "";
      const i = n.INSPECT_MAX_BYTES;
      return t = this.toString("hex", 0, i).replace(/(.{2})/g, "$1 ").trim(), this.length > i && (t += " ... "), "<Buffer " + t + ">";
    }, o && (l.prototype[o] = l.prototype.inspect), l.prototype.compare = function(t, i, a, E, _) {
      if (mt(t, Uint8Array) && (t = l.from(t, t.offset, t.byteLength)), !l.isBuffer(t))
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof t
        );
      if (i === void 0 && (i = 0), a === void 0 && (a = t ? t.length : 0), E === void 0 && (E = 0), _ === void 0 && (_ = this.length), i < 0 || a > t.length || E < 0 || _ > this.length)
        throw new RangeError("out of range index");
      if (E >= _ && i >= a)
        return 0;
      if (E >= _)
        return -1;
      if (i >= a)
        return 1;
      if (i >>>= 0, a >>>= 0, E >>>= 0, _ >>>= 0, this === t) return 0;
      let M = _ - E, Y = a - i;
      const rt = Math.min(M, Y), j = this.slice(E, _), it = t.slice(i, a);
      for (let H = 0; H < rt; ++H)
        if (j[H] !== it[H]) {
          M = j[H], Y = it[H];
          break;
        }
      return M < Y ? -1 : Y < M ? 1 : 0;
    };
    function K(u, t, i, a, E) {
      if (u.length === 0) return -1;
      if (typeof i == "string" ? (a = i, i = 0) : i > 2147483647 ? i = 2147483647 : i < -2147483648 && (i = -2147483648), i = +i, jt(i) && (i = E ? 0 : u.length - 1), i < 0 && (i = u.length + i), i >= u.length) {
        if (E) return -1;
        i = u.length - 1;
      } else if (i < 0)
        if (E) i = 0;
        else return -1;
      if (typeof t == "string" && (t = l.from(t, a)), l.isBuffer(t))
        return t.length === 0 ? -1 : J(u, t, i, a, E);
      if (typeof t == "number")
        return t = t & 255, typeof Uint8Array.prototype.indexOf == "function" ? E ? Uint8Array.prototype.indexOf.call(u, t, i) : Uint8Array.prototype.lastIndexOf.call(u, t, i) : J(u, [t], i, a, E);
      throw new TypeError("val must be string, number or Buffer");
    }
    function J(u, t, i, a, E) {
      let _ = 1, M = u.length, Y = t.length;
      if (a !== void 0 && (a = String(a).toLowerCase(), a === "ucs2" || a === "ucs-2" || a === "utf16le" || a === "utf-16le")) {
        if (u.length < 2 || t.length < 2)
          return -1;
        _ = 2, M /= 2, Y /= 2, i /= 2;
      }
      function rt(it, H) {
        return _ === 1 ? it[H] : it.readUInt16BE(H * _);
      }
      let j;
      if (E) {
        let it = -1;
        for (j = i; j < M; j++)
          if (rt(u, j) === rt(t, it === -1 ? 0 : j - it)) {
            if (it === -1 && (it = j), j - it + 1 === Y) return it * _;
          } else
            it !== -1 && (j -= j - it), it = -1;
      } else
        for (i + Y > M && (i = M - Y), j = i; j >= 0; j--) {
          let it = !0;
          for (let H = 0; H < Y; H++)
            if (rt(u, j + H) !== rt(t, H)) {
              it = !1;
              break;
            }
          if (it) return j;
        }
      return -1;
    }
    l.prototype.includes = function(t, i, a) {
      return this.indexOf(t, i, a) !== -1;
    }, l.prototype.indexOf = function(t, i, a) {
      return K(this, t, i, a, !0);
    }, l.prototype.lastIndexOf = function(t, i, a) {
      return K(this, t, i, a, !1);
    };
    function f(u, t, i, a) {
      i = Number(i) || 0;
      const E = u.length - i;
      a ? (a = Number(a), a > E && (a = E)) : a = E;
      const _ = t.length;
      a > _ / 2 && (a = _ / 2);
      let M;
      for (M = 0; M < a; ++M) {
        const Y = parseInt(t.substr(M * 2, 2), 16);
        if (jt(Y)) return M;
        u[i + M] = Y;
      }
      return M;
    }
    function p(u, t, i, a) {
      return qt(Qt(t, u.length - i), u, i, a);
    }
    function y(u, t, i, a) {
      return qt(We(t), u, i, a);
    }
    function I(u, t, i, a) {
      return qt(ge(t), u, i, a);
    }
    function x(u, t, i, a) {
      return qt(He(t, u.length - i), u, i, a);
    }
    l.prototype.write = function(t, i, a, E) {
      if (i === void 0)
        E = "utf8", a = this.length, i = 0;
      else if (a === void 0 && typeof i == "string")
        E = i, a = this.length, i = 0;
      else if (isFinite(i))
        i = i >>> 0, isFinite(a) ? (a = a >>> 0, E === void 0 && (E = "utf8")) : (E = a, a = void 0);
      else
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      const _ = this.length - i;
      if ((a === void 0 || a > _) && (a = _), t.length > 0 && (a < 0 || i < 0) || i > this.length)
        throw new RangeError("Attempt to write outside buffer bounds");
      E || (E = "utf8");
      let M = !1;
      for (; ; )
        switch (E) {
          case "hex":
            return f(this, t, i, a);
          case "utf8":
          case "utf-8":
            return p(this, t, i, a);
          case "ascii":
          case "latin1":
          case "binary":
            return y(this, t, i, a);
          case "base64":
            return I(this, t, i, a);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return x(this, t, i, a);
          default:
            if (M) throw new TypeError("Unknown encoding: " + E);
            E = ("" + E).toLowerCase(), M = !0;
        }
    }, l.prototype.toJSON = function() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function S(u, t, i) {
      return t === 0 && i === u.length ? e.fromByteArray(u) : e.fromByteArray(u.slice(t, i));
    }
    function P(u, t, i) {
      i = Math.min(u.length, i);
      const a = [];
      let E = t;
      for (; E < i; ) {
        const _ = u[E];
        let M = null, Y = _ > 239 ? 4 : _ > 223 ? 3 : _ > 191 ? 2 : 1;
        if (E + Y <= i) {
          let rt, j, it, H;
          switch (Y) {
            case 1:
              _ < 128 && (M = _);
              break;
            case 2:
              rt = u[E + 1], (rt & 192) === 128 && (H = (_ & 31) << 6 | rt & 63, H > 127 && (M = H));
              break;
            case 3:
              rt = u[E + 1], j = u[E + 2], (rt & 192) === 128 && (j & 192) === 128 && (H = (_ & 15) << 12 | (rt & 63) << 6 | j & 63, H > 2047 && (H < 55296 || H > 57343) && (M = H));
              break;
            case 4:
              rt = u[E + 1], j = u[E + 2], it = u[E + 3], (rt & 192) === 128 && (j & 192) === 128 && (it & 192) === 128 && (H = (_ & 15) << 18 | (rt & 63) << 12 | (j & 63) << 6 | it & 63, H > 65535 && H < 1114112 && (M = H));
          }
        }
        M === null ? (M = 65533, Y = 1) : M > 65535 && (M -= 65536, a.push(M >>> 10 & 1023 | 55296), M = 56320 | M & 1023), a.push(M), E += Y;
      }
      return B(a);
    }
    const m = 4096;
    function B(u) {
      const t = u.length;
      if (t <= m)
        return String.fromCharCode.apply(String, u);
      let i = "", a = 0;
      for (; a < t; )
        i += String.fromCharCode.apply(
          String,
          u.slice(a, a += m)
        );
      return i;
    }
    function T(u, t, i) {
      let a = "";
      i = Math.min(u.length, i);
      for (let E = t; E < i; ++E)
        a += String.fromCharCode(u[E] & 127);
      return a;
    }
    function b(u, t, i) {
      let a = "";
      i = Math.min(u.length, i);
      for (let E = t; E < i; ++E)
        a += String.fromCharCode(u[E]);
      return a;
    }
    function O(u, t, i) {
      const a = u.length;
      (!t || t < 0) && (t = 0), (!i || i < 0 || i > a) && (i = a);
      let E = "";
      for (let _ = t; _ < i; ++_)
        E += Je[u[_]];
      return E;
    }
    function G(u, t, i) {
      const a = u.slice(t, i);
      let E = "";
      for (let _ = 0; _ < a.length - 1; _ += 2)
        E += String.fromCharCode(a[_] + a[_ + 1] * 256);
      return E;
    }
    l.prototype.slice = function(t, i) {
      const a = this.length;
      t = ~~t, i = i === void 0 ? a : ~~i, t < 0 ? (t += a, t < 0 && (t = 0)) : t > a && (t = a), i < 0 ? (i += a, i < 0 && (i = 0)) : i > a && (i = a), i < t && (i = t);
      const E = this.subarray(t, i);
      return Object.setPrototypeOf(E, l.prototype), E;
    };
    function U(u, t, i) {
      if (u % 1 !== 0 || u < 0) throw new RangeError("offset is not uint");
      if (u + t > i) throw new RangeError("Trying to access beyond buffer length");
    }
    l.prototype.readUintLE = l.prototype.readUIntLE = function(t, i, a) {
      t = t >>> 0, i = i >>> 0, a || U(t, i, this.length);
      let E = this[t], _ = 1, M = 0;
      for (; ++M < i && (_ *= 256); )
        E += this[t + M] * _;
      return E;
    }, l.prototype.readUintBE = l.prototype.readUIntBE = function(t, i, a) {
      t = t >>> 0, i = i >>> 0, a || U(t, i, this.length);
      let E = this[t + --i], _ = 1;
      for (; i > 0 && (_ *= 256); )
        E += this[t + --i] * _;
      return E;
    }, l.prototype.readUint8 = l.prototype.readUInt8 = function(t, i) {
      return t = t >>> 0, i || U(t, 1, this.length), this[t];
    }, l.prototype.readUint16LE = l.prototype.readUInt16LE = function(t, i) {
      return t = t >>> 0, i || U(t, 2, this.length), this[t] | this[t + 1] << 8;
    }, l.prototype.readUint16BE = l.prototype.readUInt16BE = function(t, i) {
      return t = t >>> 0, i || U(t, 2, this.length), this[t] << 8 | this[t + 1];
    }, l.prototype.readUint32LE = l.prototype.readUInt32LE = function(t, i) {
      return t = t >>> 0, i || U(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + this[t + 3] * 16777216;
    }, l.prototype.readUint32BE = l.prototype.readUInt32BE = function(t, i) {
      return t = t >>> 0, i || U(t, 4, this.length), this[t] * 16777216 + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
    }, l.prototype.readBigUInt64LE = vt(function(t) {
      t = t >>> 0, st(t, "offset");
      const i = this[t], a = this[t + 7];
      (i === void 0 || a === void 0) && nt(t, this.length - 8);
      const E = i + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + this[++t] * 2 ** 24, _ = this[++t] + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + a * 2 ** 24;
      return BigInt(E) + (BigInt(_) << BigInt(32));
    }), l.prototype.readBigUInt64BE = vt(function(t) {
      t = t >>> 0, st(t, "offset");
      const i = this[t], a = this[t + 7];
      (i === void 0 || a === void 0) && nt(t, this.length - 8);
      const E = i * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + this[++t], _ = this[++t] * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + a;
      return (BigInt(E) << BigInt(32)) + BigInt(_);
    }), l.prototype.readIntLE = function(t, i, a) {
      t = t >>> 0, i = i >>> 0, a || U(t, i, this.length);
      let E = this[t], _ = 1, M = 0;
      for (; ++M < i && (_ *= 256); )
        E += this[t + M] * _;
      return _ *= 128, E >= _ && (E -= Math.pow(2, 8 * i)), E;
    }, l.prototype.readIntBE = function(t, i, a) {
      t = t >>> 0, i = i >>> 0, a || U(t, i, this.length);
      let E = i, _ = 1, M = this[t + --E];
      for (; E > 0 && (_ *= 256); )
        M += this[t + --E] * _;
      return _ *= 128, M >= _ && (M -= Math.pow(2, 8 * i)), M;
    }, l.prototype.readInt8 = function(t, i) {
      return t = t >>> 0, i || U(t, 1, this.length), this[t] & 128 ? (255 - this[t] + 1) * -1 : this[t];
    }, l.prototype.readInt16LE = function(t, i) {
      t = t >>> 0, i || U(t, 2, this.length);
      const a = this[t] | this[t + 1] << 8;
      return a & 32768 ? a | 4294901760 : a;
    }, l.prototype.readInt16BE = function(t, i) {
      t = t >>> 0, i || U(t, 2, this.length);
      const a = this[t + 1] | this[t] << 8;
      return a & 32768 ? a | 4294901760 : a;
    }, l.prototype.readInt32LE = function(t, i) {
      return t = t >>> 0, i || U(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
    }, l.prototype.readInt32BE = function(t, i) {
      return t = t >>> 0, i || U(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
    }, l.prototype.readBigInt64LE = vt(function(t) {
      t = t >>> 0, st(t, "offset");
      const i = this[t], a = this[t + 7];
      (i === void 0 || a === void 0) && nt(t, this.length - 8);
      const E = this[t + 4] + this[t + 5] * 2 ** 8 + this[t + 6] * 2 ** 16 + (a << 24);
      return (BigInt(E) << BigInt(32)) + BigInt(i + this[++t] * 2 ** 8 + this[++t] * 2 ** 16 + this[++t] * 2 ** 24);
    }), l.prototype.readBigInt64BE = vt(function(t) {
      t = t >>> 0, st(t, "offset");
      const i = this[t], a = this[t + 7];
      (i === void 0 || a === void 0) && nt(t, this.length - 8);
      const E = (i << 24) + // Overflow
      this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + this[++t];
      return (BigInt(E) << BigInt(32)) + BigInt(this[++t] * 2 ** 24 + this[++t] * 2 ** 16 + this[++t] * 2 ** 8 + a);
    }), l.prototype.readFloatLE = function(t, i) {
      return t = t >>> 0, i || U(t, 4, this.length), r.read(this, t, !0, 23, 4);
    }, l.prototype.readFloatBE = function(t, i) {
      return t = t >>> 0, i || U(t, 4, this.length), r.read(this, t, !1, 23, 4);
    }, l.prototype.readDoubleLE = function(t, i) {
      return t = t >>> 0, i || U(t, 8, this.length), r.read(this, t, !0, 52, 8);
    }, l.prototype.readDoubleBE = function(t, i) {
      return t = t >>> 0, i || U(t, 8, this.length), r.read(this, t, !1, 52, 8);
    };
    function z(u, t, i, a, E, _) {
      if (!l.isBuffer(u)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (t > E || t < _) throw new RangeError('"value" argument is out of bounds');
      if (i + a > u.length) throw new RangeError("Index out of range");
    }
    l.prototype.writeUintLE = l.prototype.writeUIntLE = function(t, i, a, E) {
      if (t = +t, i = i >>> 0, a = a >>> 0, !E) {
        const Y = Math.pow(2, 8 * a) - 1;
        z(this, t, i, a, Y, 0);
      }
      let _ = 1, M = 0;
      for (this[i] = t & 255; ++M < a && (_ *= 256); )
        this[i + M] = t / _ & 255;
      return i + a;
    }, l.prototype.writeUintBE = l.prototype.writeUIntBE = function(t, i, a, E) {
      if (t = +t, i = i >>> 0, a = a >>> 0, !E) {
        const Y = Math.pow(2, 8 * a) - 1;
        z(this, t, i, a, Y, 0);
      }
      let _ = a - 1, M = 1;
      for (this[i + _] = t & 255; --_ >= 0 && (M *= 256); )
        this[i + _] = t / M & 255;
      return i + a;
    }, l.prototype.writeUint8 = l.prototype.writeUInt8 = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 1, 255, 0), this[i] = t & 255, i + 1;
    }, l.prototype.writeUint16LE = l.prototype.writeUInt16LE = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 2, 65535, 0), this[i] = t & 255, this[i + 1] = t >>> 8, i + 2;
    }, l.prototype.writeUint16BE = l.prototype.writeUInt16BE = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 2, 65535, 0), this[i] = t >>> 8, this[i + 1] = t & 255, i + 2;
    }, l.prototype.writeUint32LE = l.prototype.writeUInt32LE = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 4, 4294967295, 0), this[i + 3] = t >>> 24, this[i + 2] = t >>> 16, this[i + 1] = t >>> 8, this[i] = t & 255, i + 4;
    }, l.prototype.writeUint32BE = l.prototype.writeUInt32BE = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 4, 4294967295, 0), this[i] = t >>> 24, this[i + 1] = t >>> 16, this[i + 2] = t >>> 8, this[i + 3] = t & 255, i + 4;
    };
    function Z(u, t, i, a, E) {
      bt(t, a, E, u, i, 7);
      let _ = Number(t & BigInt(4294967295));
      u[i++] = _, _ = _ >> 8, u[i++] = _, _ = _ >> 8, u[i++] = _, _ = _ >> 8, u[i++] = _;
      let M = Number(t >> BigInt(32) & BigInt(4294967295));
      return u[i++] = M, M = M >> 8, u[i++] = M, M = M >> 8, u[i++] = M, M = M >> 8, u[i++] = M, i;
    }
    function et(u, t, i, a, E) {
      bt(t, a, E, u, i, 7);
      let _ = Number(t & BigInt(4294967295));
      u[i + 7] = _, _ = _ >> 8, u[i + 6] = _, _ = _ >> 8, u[i + 5] = _, _ = _ >> 8, u[i + 4] = _;
      let M = Number(t >> BigInt(32) & BigInt(4294967295));
      return u[i + 3] = M, M = M >> 8, u[i + 2] = M, M = M >> 8, u[i + 1] = M, M = M >> 8, u[i] = M, i + 8;
    }
    l.prototype.writeBigUInt64LE = vt(function(t, i = 0) {
      return Z(this, t, i, BigInt(0), BigInt("0xffffffffffffffff"));
    }), l.prototype.writeBigUInt64BE = vt(function(t, i = 0) {
      return et(this, t, i, BigInt(0), BigInt("0xffffffffffffffff"));
    }), l.prototype.writeIntLE = function(t, i, a, E) {
      if (t = +t, i = i >>> 0, !E) {
        const rt = Math.pow(2, 8 * a - 1);
        z(this, t, i, a, rt - 1, -rt);
      }
      let _ = 0, M = 1, Y = 0;
      for (this[i] = t & 255; ++_ < a && (M *= 256); )
        t < 0 && Y === 0 && this[i + _ - 1] !== 0 && (Y = 1), this[i + _] = (t / M >> 0) - Y & 255;
      return i + a;
    }, l.prototype.writeIntBE = function(t, i, a, E) {
      if (t = +t, i = i >>> 0, !E) {
        const rt = Math.pow(2, 8 * a - 1);
        z(this, t, i, a, rt - 1, -rt);
      }
      let _ = a - 1, M = 1, Y = 0;
      for (this[i + _] = t & 255; --_ >= 0 && (M *= 256); )
        t < 0 && Y === 0 && this[i + _ + 1] !== 0 && (Y = 1), this[i + _] = (t / M >> 0) - Y & 255;
      return i + a;
    }, l.prototype.writeInt8 = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 1, 127, -128), t < 0 && (t = 255 + t + 1), this[i] = t & 255, i + 1;
    }, l.prototype.writeInt16LE = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 2, 32767, -32768), this[i] = t & 255, this[i + 1] = t >>> 8, i + 2;
    }, l.prototype.writeInt16BE = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 2, 32767, -32768), this[i] = t >>> 8, this[i + 1] = t & 255, i + 2;
    }, l.prototype.writeInt32LE = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 4, 2147483647, -2147483648), this[i] = t & 255, this[i + 1] = t >>> 8, this[i + 2] = t >>> 16, this[i + 3] = t >>> 24, i + 4;
    }, l.prototype.writeInt32BE = function(t, i, a) {
      return t = +t, i = i >>> 0, a || z(this, t, i, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), this[i] = t >>> 24, this[i + 1] = t >>> 16, this[i + 2] = t >>> 8, this[i + 3] = t & 255, i + 4;
    }, l.prototype.writeBigInt64LE = vt(function(t, i = 0) {
      return Z(this, t, i, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }), l.prototype.writeBigInt64BE = vt(function(t, i = 0) {
      return et(this, t, i, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function X(u, t, i, a, E, _) {
      if (i + a > u.length) throw new RangeError("Index out of range");
      if (i < 0) throw new RangeError("Index out of range");
    }
    function W(u, t, i, a, E) {
      return t = +t, i = i >>> 0, E || X(u, t, i, 4), r.write(u, t, i, a, 23, 4), i + 4;
    }
    l.prototype.writeFloatLE = function(t, i, a) {
      return W(this, t, i, !0, a);
    }, l.prototype.writeFloatBE = function(t, i, a) {
      return W(this, t, i, !1, a);
    };
    function ot(u, t, i, a, E) {
      return t = +t, i = i >>> 0, E || X(u, t, i, 8), r.write(u, t, i, a, 52, 8), i + 8;
    }
    l.prototype.writeDoubleLE = function(t, i, a) {
      return ot(this, t, i, !0, a);
    }, l.prototype.writeDoubleBE = function(t, i, a) {
      return ot(this, t, i, !1, a);
    }, l.prototype.copy = function(t, i, a, E) {
      if (!l.isBuffer(t)) throw new TypeError("argument should be a Buffer");
      if (a || (a = 0), !E && E !== 0 && (E = this.length), i >= t.length && (i = t.length), i || (i = 0), E > 0 && E < a && (E = a), E === a || t.length === 0 || this.length === 0) return 0;
      if (i < 0)
        throw new RangeError("targetStart out of bounds");
      if (a < 0 || a >= this.length) throw new RangeError("Index out of range");
      if (E < 0) throw new RangeError("sourceEnd out of bounds");
      E > this.length && (E = this.length), t.length - i < E - a && (E = t.length - i + a);
      const _ = E - a;
      return this === t && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(i, a, E) : Uint8Array.prototype.set.call(
        t,
        this.subarray(a, E),
        i
      ), _;
    }, l.prototype.fill = function(t, i, a, E) {
      if (typeof t == "string") {
        if (typeof i == "string" ? (E = i, i = 0, a = this.length) : typeof a == "string" && (E = a, a = this.length), E !== void 0 && typeof E != "string")
          throw new TypeError("encoding must be a string");
        if (typeof E == "string" && !l.isEncoding(E))
          throw new TypeError("Unknown encoding: " + E);
        if (t.length === 1) {
          const M = t.charCodeAt(0);
          (E === "utf8" && M < 128 || E === "latin1") && (t = M);
        }
      } else typeof t == "number" ? t = t & 255 : typeof t == "boolean" && (t = Number(t));
      if (i < 0 || this.length < i || this.length < a)
        throw new RangeError("Out of range index");
      if (a <= i)
        return this;
      i = i >>> 0, a = a === void 0 ? this.length : a >>> 0, t || (t = 0);
      let _;
      if (typeof t == "number")
        for (_ = i; _ < a; ++_)
          this[_] = t;
      else {
        const M = l.isBuffer(t) ? t : l.from(t, E), Y = M.length;
        if (Y === 0)
          throw new TypeError('The value "' + t + '" is invalid for argument "value"');
        for (_ = 0; _ < a - i; ++_)
          this[_ + i] = M[_ % Y];
      }
      return this;
    };
    const dt = {};
    function Tt(u, t, i) {
      dt[u] = class extends i {
        constructor() {
          super(), Object.defineProperty(this, "message", {
            value: t.apply(this, arguments),
            writable: !0,
            configurable: !0
          }), this.name = \`\${this.name} [\${u}]\`, this.stack, delete this.name;
        }
        get code() {
          return u;
        }
        set code(E) {
          Object.defineProperty(this, "code", {
            configurable: !0,
            enumerable: !0,
            value: E,
            writable: !0
          });
        }
        toString() {
          return \`\${this.name} [\${u}]: \${this.message}\`;
        }
      };
    }
    Tt(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(u) {
        return u ? \`\${u} is outside of buffer bounds\` : "Attempt to access memory outside buffer bounds";
      },
      RangeError
    ), Tt(
      "ERR_INVALID_ARG_TYPE",
      function(u, t) {
        return \`The "\${u}" argument must be of type number. Received type \${typeof t}\`;
      },
      TypeError
    ), Tt(
      "ERR_OUT_OF_RANGE",
      function(u, t, i) {
        let a = \`The value of "\${u}" is out of range.\`, E = i;
        return Number.isInteger(i) && Math.abs(i) > 2 ** 32 ? E = Pt(String(i)) : typeof i == "bigint" && (E = String(i), (i > BigInt(2) ** BigInt(32) || i < -(BigInt(2) ** BigInt(32))) && (E = Pt(E)), E += "n"), a += \` It must be \${t}. Received \${E}\`, a;
      },
      RangeError
    );
    function Pt(u) {
      let t = "", i = u.length;
      const a = u[0] === "-" ? 1 : 0;
      for (; i >= a + 4; i -= 3)
        t = \`_\${u.slice(i - 3, i)}\${t}\`;
      return \`\${u.slice(0, i)}\${t}\`;
    }
    function at(u, t, i) {
      st(t, "offset"), (u[t] === void 0 || u[t + i] === void 0) && nt(t, u.length - (i + 1));
    }
    function bt(u, t, i, a, E, _) {
      if (u > i || u < t) {
        const M = typeof t == "bigint" ? "n" : "";
        let Y;
        throw t === 0 || t === BigInt(0) ? Y = \`>= 0\${M} and < 2\${M} ** \${(_ + 1) * 8}\${M}\` : Y = \`>= -(2\${M} ** \${(_ + 1) * 8 - 1}\${M}) and < 2 ** \${(_ + 1) * 8 - 1}\${M}\`, new dt.ERR_OUT_OF_RANGE("value", Y, u);
      }
      at(a, E, _);
    }
    function st(u, t) {
      if (typeof u != "number")
        throw new dt.ERR_INVALID_ARG_TYPE(t, "number", u);
    }
    function nt(u, t, i) {
      throw Math.floor(u) !== u ? (st(u, i), new dt.ERR_OUT_OF_RANGE("offset", "an integer", u)) : t < 0 ? new dt.ERR_BUFFER_OUT_OF_BOUNDS() : new dt.ERR_OUT_OF_RANGE(
        "offset",
        \`>= 0 and <= \${t}\`,
        u
      );
    }
    const Q = /[^+/0-9A-Za-z-_]/g;
    function Ke(u) {
      if (u = u.split("=")[0], u = u.trim().replace(Q, ""), u.length < 2) return "";
      for (; u.length % 4 !== 0; )
        u = u + "=";
      return u;
    }
    function Qt(u, t) {
      t = t || 1 / 0;
      let i;
      const a = u.length;
      let E = null;
      const _ = [];
      for (let M = 0; M < a; ++M) {
        if (i = u.charCodeAt(M), i > 55295 && i < 57344) {
          if (!E) {
            if (i > 56319) {
              (t -= 3) > -1 && _.push(239, 191, 189);
              continue;
            } else if (M + 1 === a) {
              (t -= 3) > -1 && _.push(239, 191, 189);
              continue;
            }
            E = i;
            continue;
          }
          if (i < 56320) {
            (t -= 3) > -1 && _.push(239, 191, 189), E = i;
            continue;
          }
          i = (E - 55296 << 10 | i - 56320) + 65536;
        } else E && (t -= 3) > -1 && _.push(239, 191, 189);
        if (E = null, i < 128) {
          if ((t -= 1) < 0) break;
          _.push(i);
        } else if (i < 2048) {
          if ((t -= 2) < 0) break;
          _.push(
            i >> 6 | 192,
            i & 63 | 128
          );
        } else if (i < 65536) {
          if ((t -= 3) < 0) break;
          _.push(
            i >> 12 | 224,
            i >> 6 & 63 | 128,
            i & 63 | 128
          );
        } else if (i < 1114112) {
          if ((t -= 4) < 0) break;
          _.push(
            i >> 18 | 240,
            i >> 12 & 63 | 128,
            i >> 6 & 63 | 128,
            i & 63 | 128
          );
        } else
          throw new Error("Invalid code point");
      }
      return _;
    }
    function We(u) {
      const t = [];
      for (let i = 0; i < u.length; ++i)
        t.push(u.charCodeAt(i) & 255);
      return t;
    }
    function He(u, t) {
      let i, a, E;
      const _ = [];
      for (let M = 0; M < u.length && !((t -= 2) < 0); ++M)
        i = u.charCodeAt(M), a = i >> 8, E = i % 256, _.push(E), _.push(a);
      return _;
    }
    function ge(u) {
      return e.toByteArray(Ke(u));
    }
    function qt(u, t, i, a) {
      let E;
      for (E = 0; E < a && !(E + i >= t.length || E >= u.length); ++E)
        t[E + i] = u[E];
      return E;
    }
    function mt(u, t) {
      return u instanceof t || u != null && u.constructor != null && u.constructor.name != null && u.constructor.name === t.name;
    }
    function jt(u) {
      return u !== u;
    }
    const Je = (function() {
      const u = "0123456789abcdef", t = new Array(256);
      for (let i = 0; i < 16; ++i) {
        const a = i * 16;
        for (let E = 0; E < 16; ++E)
          t[a + E] = u[i] + u[E];
      }
      return t;
    })();
    function vt(u) {
      return typeof BigInt > "u" ? Ze : u;
    }
    function Ze() {
      throw new Error("BigInt not supported");
    }
  })(oe)), oe;
}
var ni = ii();
const oi = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
oi.Buffer = ni.Buffer;
const si = (n) => JSON.parse(new TextDecoder().decode(n)), li = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {}, ui = (n, e) => {
  try {
    const r = n && n.geometry && n.geometry.coordinates;
    let o = br(r, e);
    return (!Array.isArray(o) || !Number.isFinite(o[0]) || !Number.isFinite(o[1])) && (o = _e(n).geometry.coordinates), {
      type: "Point",
      coordinates: [o[0], o[1]]
    };
  } catch {
    return console.log("Invalid feature geometry", n && n.id), _e(n).geometry;
  }
}, Ue = (n) => {
  if (!n) return 0;
  let e = 0;
  for (let r = 0; r < n.length; r++) {
    const o = (r + 1) % n.length;
    e += n[r][0] * n[o][1], e -= n[o][0] * n[r][1];
  }
  return Math.abs(e) / 2;
}, fi = (n, e) => {
  try {
    if (e === "meters")
      return Qr(n);
    {
      const r = n && n.geometry;
      if (!r || r.type !== "Polygon") return 0;
      const o = r && r.coordinates;
      let s = Ue(o[0]);
      for (let c = 1; c < o.length; c++)
        s -= Ue(o[c]);
      return s;
    }
  } catch (r) {
    return console.log("Error computing area for feature", n && n.id, r), 0;
  }
};
li.onmessage = (n) => {
  const e = n.data, r = si(e), o = Object.values(r.pieces), s = r.tolerance || 1e-5, c = r.unit || "meters", h = /* @__PURE__ */ new Map();
  o.forEach((l) => {
    for (const [w, g] of Object.entries(l)) {
      const R = h.get(w) || [];
      R.push(g), h.set(w, R);
    }
  });
  for (const [l, w] of h.entries()) {
    let g = {
      type: "FeatureCollection",
      features: w.reduce((d, F) => [...d, ...F.features], [])
    };
    if (g.features.some((d) => d.geometry.type === "MultiPolygon") && (g = Be(g)), g.features.some((d) => d.properties.clipped) && g.features.length > 1) {
      let d = {
        type: "FeatureCollection",
        features: g.features.filter((A) => A.properties.clipped)
      };
      const F = g.features.filter((A) => !A.properties.clipped);
      if (d.features.length > 1) {
        const { clipped: A, ...L } = g.features[0].properties;
        L._index = d.features.map((C) => C.properties._index).sort().join("-"), d = Br(d), d = {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: d.geometry,
            properties: L
          }]
        };
      }
      g = {
        type: "FeatureCollection",
        features: [...F, ...d.features]
      };
    }
    g.features.some((d) => d.geometry.type === "MultiPolygon") && (g = Be(g)), g.features = g.features.map((d, F) => {
      const A = \`\${l}-\${F}\`, L = d.geometry, C = d.properties;
      if (L && L.type === "Polygon") {
        const k = fi(d, c);
        d.geometry = ui(d, s), d.properties = { ...C, _area: k, _groupId: l };
      } else
        console.log("Unexpected geometry type after union/simplify/flatten for id:" + l + " - type:" + (L && L.type)), d.properties = { ...C, _area: 0, _groupId: l };
      return d.id = A, d;
    });
    const R = Math.max(...g.features.map((d) => d.properties && d.properties._area || 0));
    g.features = g.features.map((d) => (d.properties && d.properties._area != null && d.properties._area > 0 ? (d.properties._localSortKey = R / d.properties._area, d.properties._globalSortKey = 1 / d.properties._area) : (d.properties._localSortKey = 1 / 0, d.properties._globalSortKey = 1 / 0), d)), console.log(g);
  }
};
`, Wn = typeof self < "u" && self.Blob && new Blob(["URL.revokeObjectURL(import.meta.url);", it], { type: "text/javascript;charset=utf-8" });
function Kt(s) {
  let t;
  try {
    if (t = Wn && (self.URL || self.webkitURL).createObjectURL(Wn), !t) throw "";
    const r = new Worker(t, {
      type: "module",
      name: s?.name
    });
    return r.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), r;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(it),
      {
        type: "module",
        name: s?.name
      }
    );
  }
}
class Kn {
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
  constructor(t, r = {}) {
    const a = typeof navigator < "u" && navigator.hardwareConcurrency || 2, {
      size: f = Math.min(a, 2),
      minSize: y = 1,
      maxSize: p = Math.max(f, a),
      workerOptions: h = {},
      maxTasksPerWorker: b = 1 / 0,
      idleTimeout: B = 6e4,
      taskQueue: v = !0
    } = r;
    this._workerSource = t, this._workerOptions = h, this._maxTasksPerWorker = b, this.minSize = Math.max(0, y), this.maxSize = Math.max(this.minSize, p), this.idleTimeout = Math.max(0, B), this.taskQueueEnabled = !!v, this.workers = [], this.queue = [], this._listeners = { message: /* @__PURE__ */ new Set(), error: /* @__PURE__ */ new Set(), messageerror: /* @__PURE__ */ new Set(), idle: /* @__PURE__ */ new Set() }, this._onmessage = null, this._onerror = null, this._onidle = null, this._nextIndex = 0, this._isIdle = !0;
    const S = Math.min(Math.max(f, this.minSize), this.maxSize);
    for (let x = 0; x < S; x++) this._addWorkerInstance(x);
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
  _addWorkerInstance(t) {
    const r = this._createWorkerInstance(), a = { id: t, worker: r, tasks: 0, lastActive: Date.now() };
    return this.workers.push(a), r.onmessage = (f) => {
      if (a.tasks = Math.max(0, a.tasks - 1), a.lastActive = Date.now(), this.queue.length > 0 && a.tasks < this._maxTasksPerWorker) {
        const y = this.queue.shift();
        try {
          y.transfer ? r.postMessage(y.message, y.transfer) : r.postMessage(y.message), a.tasks++;
        } catch (p) {
          console.error("Failed to dispatch queued message to worker", p);
        }
      }
      if (this._onmessage)
        try {
          this._onmessage(f);
        } catch (y) {
          console.error("Pool onmessage handler error", y);
        }
      for (const y of this._listeners.message)
        try {
          y(f);
        } catch (p) {
          console.error("pool listener error", p);
        }
      this._updateIdleState();
    }, r.onerror = (f) => {
      if (this._onerror)
        try {
          this._onerror(f);
        } catch (y) {
          console.error("Pool onerror handler error", y);
        }
      for (const y of this._listeners.error)
        try {
          y(f);
        } catch (p) {
          console.error("pool error listener error", p);
        }
    }, r.onmessageerror = (f) => {
      for (const y of this._listeners.messageerror)
        try {
          y(f);
        } catch (p) {
          console.error("pool messageerror listener error", p);
        }
    }, a;
  }
  /**
   * Return the least-loaded worker (smallest `tasks` count).
   * @private
   * @returns {WorkerObj|null}
   */
  _findLeastLoadedWorker() {
    if (!this.workers.length) return null;
    let t = this.workers[0];
    for (let r = 1; r < this.workers.length; r++)
      this.workers[r].tasks < t.tasks && (t = this.workers[r]);
    return t;
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
  postMessage(t, r) {
    const a = this._findLeastLoadedWorker();
    if (a && a.tasks < this._maxTasksPerWorker)
      try {
        return r ? a.worker.postMessage(t, r) : a.worker.postMessage(t), a.tasks++, a.lastActive = Date.now(), this._updateIdleState(), !0;
      } catch (y) {
        return console.error("Failed to postMessage to worker", y), !1;
      }
    if (this.workers.length < this.maxSize) {
      const y = this.workers.length, p = this._addWorkerInstance(y);
      try {
        return r ? p.worker.postMessage(t, r) : p.worker.postMessage(t), p.tasks++, p.lastActive = Date.now(), this._updateIdleState(), !0;
      } catch (h) {
        return console.error("Failed to postMessage to new worker", h), !1;
      }
    }
    if (this.taskQueueEnabled)
      return this.queue.push({ message: t, transfer: r }), this._updateIdleState(), !0;
    const f = this.workers[this._nextIndex % this.workers.length];
    this._nextIndex++;
    try {
      return r ? f.worker.postMessage(t, r) : f.worker.postMessage(t), f.tasks++, f.lastActive = Date.now(), this._updateIdleState(), !0;
    } catch (y) {
      return console.error("Failed to postMessage to fallback worker", y), !1;
    }
  }
  /**
   * Broadcasts a message to all workers in the pool.
   * @param {*} message
   * @param {Transferable[]=} transfer
   */
  broadcast(t, r) {
    for (const a of this.workers)
      try {
        r ? a.worker.postMessage(t, r) : a.worker.postMessage(t), a.tasks++, a.lastActive = Date.now();
      } catch (f) {
        console.error("broadcast error", f);
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
    const t = this.workers.pop();
    if (t)
      try {
        t.worker.terminate();
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
    const t = Date.now();
    for (let r = this.workers.length - 1; r >= 0; r--) {
      const a = this.workers[r];
      if (this.workers.length <= this.minSize) break;
      if (a.tasks === 0 && t - (a.lastActive || 0) > this.idleTimeout) {
        try {
          a.worker.terminate();
        } catch {
        }
        this.workers.splice(r, 1);
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
    const t = { data: { type: "pool:idle", stats: this.getStats() } };
    if (this._isIdle = !0, this._onmessage)
      try {
        this._onmessage(t);
      } catch (r) {
        console.error("Pool onmessage handler error", r);
      }
    if (this._onidle)
      try {
        this._onidle(t);
      } catch (r) {
        console.error("Pool onidle handler error", r);
      }
    for (const r of this._listeners.message)
      try {
        r(t);
      } catch (a) {
        console.error("pool listener error", a);
      }
    for (const r of this._listeners.idle)
      try {
        r(t);
      } catch (a) {
        console.error("pool idle listener error", a);
      }
  }
  /**
   * Check current state and emit idle event if transitioning to idle.
   * @private
   */
  _updateIdleState() {
    const r = this.workers.length > 0 && this.workers.every((y) => y.tasks === 0), a = this.queue.length === 0, f = r && a;
    f && !this._isIdle ? this._emitIdle() : !f && this._isIdle && (this._isIdle = !1);
  }
  /**
   * Terminate the entire pool, clear queue and the reaper interval.
   */
  terminate() {
    this._reaperInterval && (clearInterval(this._reaperInterval), this._reaperInterval = null);
    for (const t of this.workers)
      try {
        t.worker.terminate();
      } catch {
      }
    this.workers = [], this.queue = [];
  }
  /**
   * Return stats for debugging.
   * @returns {{id:number,tasks:number,lastActive:number}[]}
   */
  getStats() {
    return this.workers.map((t) => ({ id: t.id, tasks: t.tasks, lastActive: t.lastActive }));
  }
  /**
   * Add an event listener for pool events. Supported types: 'message', 'error', 'messageerror', 'idle'.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  addEventListener(t, r) {
    if (t in this._listeners && (this._listeners[t].add(r), t === "idle" && this._isIdle)) {
      const a = { data: { type: "pool:idle", stats: this.getStats() } };
      try {
        r(a);
      } catch (f) {
        console.error("pool idle listener error", f);
      }
    }
  }
  /**
   * Remove a previously added event listener.
   * @param {'message'|'error'|'messageerror'|'idle'} type
   * @param {Function} cb
   */
  removeEventListener(t, r) {
    t in this._listeners && this._listeners[t].delete(r);
  }
  /**
   * onmessage handler called when any worker posts a message.
   * @type {Function|null}
   */
  get onmessage() {
    return this._onmessage;
  }
  set onmessage(t) {
    this._onmessage = t;
  }
  /**
   * onerror handler called when a worker emits an error.
   * @type {Function|null}
   */
  get onerror() {
    return this._onerror;
  }
  set onerror(t) {
    this._onerror = t;
  }
  /**
   * onidle handler called when the pool becomes idle.
   * @type {Function|null}
   */
  get onidle() {
    return this._onidle;
  }
  set onidle(t) {
    if (this._onidle = t, typeof t == "function" && this._isIdle) {
      const r = { data: { type: "pool:idle", stats: this.getStats() } };
      try {
        t(r);
      } catch (a) {
        console.error("Pool onidle handler error", a);
      }
    }
  }
}
var vn = {}, sn = {}, Yn;
function Yt() {
  if (Yn) return sn;
  Yn = 1, sn.byteLength = h, sn.toByteArray = B, sn.fromByteArray = x;
  for (var s = [], t = [], r = typeof Uint8Array < "u" ? Uint8Array : Array, a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", f = 0, y = a.length; f < y; ++f)
    s[f] = a[f], t[a.charCodeAt(f)] = f;
  t[45] = 62, t[95] = 63;
  function p(w) {
    var E = w.length;
    if (E % 4 > 0)
      throw new Error("Invalid string. Length must be a multiple of 4");
    var I = w.indexOf("=");
    I === -1 && (I = E);
    var A = I === E ? 0 : 4 - I % 4;
    return [I, A];
  }
  function h(w) {
    var E = p(w), I = E[0], A = E[1];
    return (I + A) * 3 / 4 - A;
  }
  function b(w, E, I) {
    return (E + I) * 3 / 4 - I;
  }
  function B(w) {
    var E, I = p(w), A = I[0], k = I[1], M = new r(b(w, A, k)), L = 0, U = k > 0 ? A - 4 : A, P;
    for (P = 0; P < U; P += 4)
      E = t[w.charCodeAt(P)] << 18 | t[w.charCodeAt(P + 1)] << 12 | t[w.charCodeAt(P + 2)] << 6 | t[w.charCodeAt(P + 3)], M[L++] = E >> 16 & 255, M[L++] = E >> 8 & 255, M[L++] = E & 255;
    return k === 2 && (E = t[w.charCodeAt(P)] << 2 | t[w.charCodeAt(P + 1)] >> 4, M[L++] = E & 255), k === 1 && (E = t[w.charCodeAt(P)] << 10 | t[w.charCodeAt(P + 1)] << 4 | t[w.charCodeAt(P + 2)] >> 2, M[L++] = E >> 8 & 255, M[L++] = E & 255), M;
  }
  function v(w) {
    return s[w >> 18 & 63] + s[w >> 12 & 63] + s[w >> 6 & 63] + s[w & 63];
  }
  function S(w, E, I) {
    for (var A, k = [], M = E; M < I; M += 3)
      A = (w[M] << 16 & 16711680) + (w[M + 1] << 8 & 65280) + (w[M + 2] & 255), k.push(v(A));
    return k.join("");
  }
  function x(w) {
    for (var E, I = w.length, A = I % 3, k = [], M = 16383, L = 0, U = I - A; L < U; L += M)
      k.push(S(w, L, L + M > U ? U : L + M));
    return A === 1 ? (E = w[I - 1], k.push(
      s[E >> 2] + s[E << 4 & 63] + "=="
    )) : A === 2 && (E = (w[I - 2] << 8) + w[I - 1], k.push(
      s[E >> 10] + s[E >> 4 & 63] + s[E << 2 & 63] + "="
    )), k.join("");
  }
  return sn;
}
var Jn;
function Jt() {
  return Jn || (Jn = 1, (function(s) {
    const t = Yt(), r = Qn(), a = typeof Symbol == "function" && typeof Symbol.for == "function" ? /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom") : null;
    s.Buffer = h, s.SlowBuffer = M, s.INSPECT_MAX_BYTES = 50;
    const f = 2147483647;
    s.kMaxLength = f, h.TYPED_ARRAY_SUPPORT = y(), !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
      "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
    );
    function y() {
      try {
        const i = new Uint8Array(1), n = { foo: function() {
          return 42;
        } };
        return Object.setPrototypeOf(n, Uint8Array.prototype), Object.setPrototypeOf(i, n), i.foo() === 42;
      } catch {
        return !1;
      }
    }
    Object.defineProperty(h.prototype, "parent", {
      enumerable: !0,
      get: function() {
        if (h.isBuffer(this))
          return this.buffer;
      }
    }), Object.defineProperty(h.prototype, "offset", {
      enumerable: !0,
      get: function() {
        if (h.isBuffer(this))
          return this.byteOffset;
      }
    });
    function p(i) {
      if (i > f)
        throw new RangeError('The value "' + i + '" is invalid for option "size"');
      const n = new Uint8Array(i);
      return Object.setPrototypeOf(n, h.prototype), n;
    }
    function h(i, n, e) {
      if (typeof i == "number") {
        if (typeof n == "string")
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        return S(i);
      }
      return b(i, n, e);
    }
    h.poolSize = 8192;
    function b(i, n, e) {
      if (typeof i == "string")
        return x(i, n);
      if (ArrayBuffer.isView(i))
        return E(i);
      if (i == null)
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i
        );
      if (K(i, ArrayBuffer) || i && K(i.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (K(i, SharedArrayBuffer) || i && K(i.buffer, SharedArrayBuffer)))
        return I(i, n, e);
      if (typeof i == "number")
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      const u = i.valueOf && i.valueOf();
      if (u != null && u !== i)
        return h.from(u, n, e);
      const c = A(i);
      if (c) return c;
      if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof i[Symbol.toPrimitive] == "function")
        return h.from(i[Symbol.toPrimitive]("string"), n, e);
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof i
      );
    }
    h.from = function(i, n, e) {
      return b(i, n, e);
    }, Object.setPrototypeOf(h.prototype, Uint8Array.prototype), Object.setPrototypeOf(h, Uint8Array);
    function B(i) {
      if (typeof i != "number")
        throw new TypeError('"size" argument must be of type number');
      if (i < 0)
        throw new RangeError('The value "' + i + '" is invalid for option "size"');
    }
    function v(i, n, e) {
      return B(i), i <= 0 ? p(i) : n !== void 0 ? typeof e == "string" ? p(i).fill(n, e) : p(i).fill(n) : p(i);
    }
    h.alloc = function(i, n, e) {
      return v(i, n, e);
    };
    function S(i) {
      return B(i), p(i < 0 ? 0 : k(i) | 0);
    }
    h.allocUnsafe = function(i) {
      return S(i);
    }, h.allocUnsafeSlow = function(i) {
      return S(i);
    };
    function x(i, n) {
      if ((typeof n != "string" || n === "") && (n = "utf8"), !h.isEncoding(n))
        throw new TypeError("Unknown encoding: " + n);
      const e = L(i, n) | 0;
      let u = p(e);
      const c = u.write(i, n);
      return c !== e && (u = u.slice(0, c)), u;
    }
    function w(i) {
      const n = i.length < 0 ? 0 : k(i.length) | 0, e = p(n);
      for (let u = 0; u < n; u += 1)
        e[u] = i[u] & 255;
      return e;
    }
    function E(i) {
      if (K(i, Uint8Array)) {
        const n = new Uint8Array(i);
        return I(n.buffer, n.byteOffset, n.byteLength);
      }
      return w(i);
    }
    function I(i, n, e) {
      if (n < 0 || i.byteLength < n)
        throw new RangeError('"offset" is outside of buffer bounds');
      if (i.byteLength < n + (e || 0))
        throw new RangeError('"length" is outside of buffer bounds');
      let u;
      return n === void 0 && e === void 0 ? u = new Uint8Array(i) : e === void 0 ? u = new Uint8Array(i, n) : u = new Uint8Array(i, n, e), Object.setPrototypeOf(u, h.prototype), u;
    }
    function A(i) {
      if (h.isBuffer(i)) {
        const n = k(i.length) | 0, e = p(n);
        return e.length === 0 || i.copy(e, 0, 0, n), e;
      }
      if (i.length !== void 0)
        return typeof i.length != "number" || gn(i.length) ? p(0) : w(i);
      if (i.type === "Buffer" && Array.isArray(i.data))
        return w(i.data);
    }
    function k(i) {
      if (i >= f)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + f.toString(16) + " bytes");
      return i | 0;
    }
    function M(i) {
      return +i != i && (i = 0), h.alloc(+i);
    }
    h.isBuffer = function(n) {
      return n != null && n._isBuffer === !0 && n !== h.prototype;
    }, h.compare = function(n, e) {
      if (K(n, Uint8Array) && (n = h.from(n, n.offset, n.byteLength)), K(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), !h.isBuffer(n) || !h.isBuffer(e))
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      if (n === e) return 0;
      let u = n.length, c = e.length;
      for (let g = 0, m = Math.min(u, c); g < m; ++g)
        if (n[g] !== e[g]) {
          u = n[g], c = e[g];
          break;
        }
      return u < c ? -1 : c < u ? 1 : 0;
    }, h.isEncoding = function(n) {
      switch (String(n).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return !0;
        default:
          return !1;
      }
    }, h.concat = function(n, e) {
      if (!Array.isArray(n))
        throw new TypeError('"list" argument must be an Array of Buffers');
      if (n.length === 0)
        return h.alloc(0);
      let u;
      if (e === void 0)
        for (e = 0, u = 0; u < n.length; ++u)
          e += n[u].length;
      const c = h.allocUnsafe(e);
      let g = 0;
      for (u = 0; u < n.length; ++u) {
        let m = n[u];
        if (K(m, Uint8Array))
          g + m.length > c.length ? (h.isBuffer(m) || (m = h.from(m)), m.copy(c, g)) : Uint8Array.prototype.set.call(
            c,
            m,
            g
          );
        else if (h.isBuffer(m))
          m.copy(c, g);
        else
          throw new TypeError('"list" argument must be an Array of Buffers');
        g += m.length;
      }
      return c;
    };
    function L(i, n) {
      if (h.isBuffer(i))
        return i.length;
      if (ArrayBuffer.isView(i) || K(i, ArrayBuffer))
        return i.byteLength;
      if (typeof i != "string")
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof i
        );
      const e = i.length, u = arguments.length > 2 && arguments[2] === !0;
      if (!u && e === 0) return 0;
      let c = !1;
      for (; ; )
        switch (n) {
          case "ascii":
          case "latin1":
          case "binary":
            return e;
          case "utf8":
          case "utf-8":
            return yn(i).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return e * 2;
          case "hex":
            return e >>> 1;
          case "base64":
            return Rn(i).length;
          default:
            if (c)
              return u ? -1 : yn(i).length;
            n = ("" + n).toLowerCase(), c = !0;
        }
    }
    h.byteLength = L;
    function U(i, n, e) {
      let u = !1;
      if ((n === void 0 || n < 0) && (n = 0), n > this.length || ((e === void 0 || e > this.length) && (e = this.length), e <= 0) || (e >>>= 0, n >>>= 0, e <= n))
        return "";
      for (i || (i = "utf8"); ; )
        switch (i) {
          case "hex":
            return Y(this, n, e);
          case "utf8":
          case "utf-8":
            return d(this, n, e);
          case "ascii":
            return T(this, n, e);
          case "latin1":
          case "binary":
            return V(this, n, e);
          case "base64":
            return l(this, n, e);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return W(this, n, e);
          default:
            if (u) throw new TypeError("Unknown encoding: " + i);
            i = (i + "").toLowerCase(), u = !0;
        }
    }
    h.prototype._isBuffer = !0;
    function P(i, n, e) {
      const u = i[n];
      i[n] = i[e], i[e] = u;
    }
    h.prototype.swap16 = function() {
      const n = this.length;
      if (n % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      for (let e = 0; e < n; e += 2)
        P(this, e, e + 1);
      return this;
    }, h.prototype.swap32 = function() {
      const n = this.length;
      if (n % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      for (let e = 0; e < n; e += 4)
        P(this, e, e + 3), P(this, e + 1, e + 2);
      return this;
    }, h.prototype.swap64 = function() {
      const n = this.length;
      if (n % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let e = 0; e < n; e += 8)
        P(this, e, e + 7), P(this, e + 1, e + 6), P(this, e + 2, e + 5), P(this, e + 3, e + 4);
      return this;
    }, h.prototype.toString = function() {
      const n = this.length;
      return n === 0 ? "" : arguments.length === 0 ? d(this, 0, n) : U.apply(this, arguments);
    }, h.prototype.toLocaleString = h.prototype.toString, h.prototype.equals = function(n) {
      if (!h.isBuffer(n)) throw new TypeError("Argument must be a Buffer");
      return this === n ? !0 : h.compare(this, n) === 0;
    }, h.prototype.inspect = function() {
      let n = "";
      const e = s.INSPECT_MAX_BYTES;
      return n = this.toString("hex", 0, e).replace(/(.{2})/g, "$1 ").trim(), this.length > e && (n += " ... "), "<Buffer " + n + ">";
    }, a && (h.prototype[a] = h.prototype.inspect), h.prototype.compare = function(n, e, u, c, g) {
      if (K(n, Uint8Array) && (n = h.from(n, n.offset, n.byteLength)), !h.isBuffer(n))
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof n
        );
      if (e === void 0 && (e = 0), u === void 0 && (u = n ? n.length : 0), c === void 0 && (c = 0), g === void 0 && (g = this.length), e < 0 || u > n.length || c < 0 || g > this.length)
        throw new RangeError("out of range index");
      if (c >= g && e >= u)
        return 0;
      if (c >= g)
        return -1;
      if (e >= u)
        return 1;
      if (e >>>= 0, u >>>= 0, c >>>= 0, g >>>= 0, this === n) return 0;
      let m = g - c, R = u - e;
      const D = Math.min(m, R), N = this.slice(c, g), G = n.slice(e, u);
      for (let C = 0; C < D; ++C)
        if (N[C] !== G[C]) {
          m = N[C], R = G[C];
          break;
        }
      return m < R ? -1 : R < m ? 1 : 0;
    };
    function j(i, n, e, u, c) {
      if (i.length === 0) return -1;
      if (typeof e == "string" ? (u = e, e = 0) : e > 2147483647 ? e = 2147483647 : e < -2147483648 && (e = -2147483648), e = +e, gn(e) && (e = c ? 0 : i.length - 1), e < 0 && (e = i.length + e), e >= i.length) {
        if (c) return -1;
        e = i.length - 1;
      } else if (e < 0)
        if (c) e = 0;
        else return -1;
      if (typeof n == "string" && (n = h.from(n, u)), h.isBuffer(n))
        return n.length === 0 ? -1 : q(i, n, e, u, c);
      if (typeof n == "number")
        return n = n & 255, typeof Uint8Array.prototype.indexOf == "function" ? c ? Uint8Array.prototype.indexOf.call(i, n, e) : Uint8Array.prototype.lastIndexOf.call(i, n, e) : q(i, [n], e, u, c);
      throw new TypeError("val must be string, number or Buffer");
    }
    function q(i, n, e, u, c) {
      let g = 1, m = i.length, R = n.length;
      if (u !== void 0 && (u = String(u).toLowerCase(), u === "ucs2" || u === "ucs-2" || u === "utf16le" || u === "utf-16le")) {
        if (i.length < 2 || n.length < 2)
          return -1;
        g = 2, m /= 2, R /= 2, e /= 2;
      }
      function D(G, C) {
        return g === 1 ? G[C] : G.readUInt16BE(C * g);
      }
      let N;
      if (c) {
        let G = -1;
        for (N = e; N < m; N++)
          if (D(i, N) === D(n, G === -1 ? 0 : N - G)) {
            if (G === -1 && (G = N), N - G + 1 === R) return G * g;
          } else
            G !== -1 && (N -= N - G), G = -1;
      } else
        for (e + R > m && (e = m - R), N = e; N >= 0; N--) {
          let G = !0;
          for (let C = 0; C < R; C++)
            if (D(i, N + C) !== D(n, C)) {
              G = !1;
              break;
            }
          if (G) return N;
        }
      return -1;
    }
    h.prototype.includes = function(n, e, u) {
      return this.indexOf(n, e, u) !== -1;
    }, h.prototype.indexOf = function(n, e, u) {
      return j(this, n, e, u, !0);
    }, h.prototype.lastIndexOf = function(n, e, u) {
      return j(this, n, e, u, !1);
    };
    function z(i, n, e, u) {
      e = Number(e) || 0;
      const c = i.length - e;
      u ? (u = Number(u), u > c && (u = c)) : u = c;
      const g = n.length;
      u > g / 2 && (u = g / 2);
      let m;
      for (m = 0; m < u; ++m) {
        const R = parseInt(n.substr(m * 2, 2), 16);
        if (gn(R)) return m;
        i[e + m] = R;
      }
      return m;
    }
    function X(i, n, e, u) {
      return un(yn(n, i.length - e), i, e, u);
    }
    function ln(i, n, e, u) {
      return un(ft(n), i, e, u);
    }
    function cn(i, n, e, u) {
      return un(Rn(n), i, e, u);
    }
    function o(i, n, e, u) {
      return un(at(n, i.length - e), i, e, u);
    }
    h.prototype.write = function(n, e, u, c) {
      if (e === void 0)
        c = "utf8", u = this.length, e = 0;
      else if (u === void 0 && typeof e == "string")
        c = e, u = this.length, e = 0;
      else if (isFinite(e))
        e = e >>> 0, isFinite(u) ? (u = u >>> 0, c === void 0 && (c = "utf8")) : (c = u, u = void 0);
      else
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      const g = this.length - e;
      if ((u === void 0 || u > g) && (u = g), n.length > 0 && (u < 0 || e < 0) || e > this.length)
        throw new RangeError("Attempt to write outside buffer bounds");
      c || (c = "utf8");
      let m = !1;
      for (; ; )
        switch (c) {
          case "hex":
            return z(this, n, e, u);
          case "utf8":
          case "utf-8":
            return X(this, n, e, u);
          case "ascii":
          case "latin1":
          case "binary":
            return ln(this, n, e, u);
          case "base64":
            return cn(this, n, e, u);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return o(this, n, e, u);
          default:
            if (m) throw new TypeError("Unknown encoding: " + c);
            c = ("" + c).toLowerCase(), m = !0;
        }
    }, h.prototype.toJSON = function() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function l(i, n, e) {
      return n === 0 && e === i.length ? t.fromByteArray(i) : t.fromByteArray(i.slice(n, e));
    }
    function d(i, n, e) {
      e = Math.min(i.length, e);
      const u = [];
      let c = n;
      for (; c < e; ) {
        const g = i[c];
        let m = null, R = g > 239 ? 4 : g > 223 ? 3 : g > 191 ? 2 : 1;
        if (c + R <= e) {
          let D, N, G, C;
          switch (R) {
            case 1:
              g < 128 && (m = g);
              break;
            case 2:
              D = i[c + 1], (D & 192) === 128 && (C = (g & 31) << 6 | D & 63, C > 127 && (m = C));
              break;
            case 3:
              D = i[c + 1], N = i[c + 2], (D & 192) === 128 && (N & 192) === 128 && (C = (g & 15) << 12 | (D & 63) << 6 | N & 63, C > 2047 && (C < 55296 || C > 57343) && (m = C));
              break;
            case 4:
              D = i[c + 1], N = i[c + 2], G = i[c + 3], (D & 192) === 128 && (N & 192) === 128 && (G & 192) === 128 && (C = (g & 15) << 18 | (D & 63) << 12 | (N & 63) << 6 | G & 63, C > 65535 && C < 1114112 && (m = C));
          }
        }
        m === null ? (m = 65533, R = 1) : m > 65535 && (m -= 65536, u.push(m >>> 10 & 1023 | 55296), m = 56320 | m & 1023), u.push(m), c += R;
      }
      return _(u);
    }
    const F = 4096;
    function _(i) {
      const n = i.length;
      if (n <= F)
        return String.fromCharCode.apply(String, i);
      let e = "", u = 0;
      for (; u < n; )
        e += String.fromCharCode.apply(
          String,
          i.slice(u, u += F)
        );
      return e;
    }
    function T(i, n, e) {
      let u = "";
      e = Math.min(i.length, e);
      for (let c = n; c < e; ++c)
        u += String.fromCharCode(i[c] & 127);
      return u;
    }
    function V(i, n, e) {
      let u = "";
      e = Math.min(i.length, e);
      for (let c = n; c < e; ++c)
        u += String.fromCharCode(i[c]);
      return u;
    }
    function Y(i, n, e) {
      const u = i.length;
      (!n || n < 0) && (n = 0), (!e || e < 0 || e > u) && (e = u);
      let c = "";
      for (let g = n; g < e; ++g)
        c += lt[i[g]];
      return c;
    }
    function W(i, n, e) {
      const u = i.slice(n, e);
      let c = "";
      for (let g = 0; g < u.length - 1; g += 2)
        c += String.fromCharCode(u[g] + u[g + 1] * 256);
      return c;
    }
    h.prototype.slice = function(n, e) {
      const u = this.length;
      n = ~~n, e = e === void 0 ? u : ~~e, n < 0 ? (n += u, n < 0 && (n = 0)) : n > u && (n = u), e < 0 ? (e += u, e < 0 && (e = 0)) : e > u && (e = u), e < n && (e = n);
      const c = this.subarray(n, e);
      return Object.setPrototypeOf(c, h.prototype), c;
    };
    function O(i, n, e) {
      if (i % 1 !== 0 || i < 0) throw new RangeError("offset is not uint");
      if (i + n > e) throw new RangeError("Trying to access beyond buffer length");
    }
    h.prototype.readUintLE = h.prototype.readUIntLE = function(n, e, u) {
      n = n >>> 0, e = e >>> 0, u || O(n, e, this.length);
      let c = this[n], g = 1, m = 0;
      for (; ++m < e && (g *= 256); )
        c += this[n + m] * g;
      return c;
    }, h.prototype.readUintBE = h.prototype.readUIntBE = function(n, e, u) {
      n = n >>> 0, e = e >>> 0, u || O(n, e, this.length);
      let c = this[n + --e], g = 1;
      for (; e > 0 && (g *= 256); )
        c += this[n + --e] * g;
      return c;
    }, h.prototype.readUint8 = h.prototype.readUInt8 = function(n, e) {
      return n = n >>> 0, e || O(n, 1, this.length), this[n];
    }, h.prototype.readUint16LE = h.prototype.readUInt16LE = function(n, e) {
      return n = n >>> 0, e || O(n, 2, this.length), this[n] | this[n + 1] << 8;
    }, h.prototype.readUint16BE = h.prototype.readUInt16BE = function(n, e) {
      return n = n >>> 0, e || O(n, 2, this.length), this[n] << 8 | this[n + 1];
    }, h.prototype.readUint32LE = h.prototype.readUInt32LE = function(n, e) {
      return n = n >>> 0, e || O(n, 4, this.length), (this[n] | this[n + 1] << 8 | this[n + 2] << 16) + this[n + 3] * 16777216;
    }, h.prototype.readUint32BE = h.prototype.readUInt32BE = function(n, e) {
      return n = n >>> 0, e || O(n, 4, this.length), this[n] * 16777216 + (this[n + 1] << 16 | this[n + 2] << 8 | this[n + 3]);
    }, h.prototype.readBigUInt64LE = J(function(n) {
      n = n >>> 0, Q(n, "offset");
      const e = this[n], u = this[n + 7];
      (e === void 0 || u === void 0) && en(n, this.length - 8);
      const c = e + this[++n] * 2 ** 8 + this[++n] * 2 ** 16 + this[++n] * 2 ** 24, g = this[++n] + this[++n] * 2 ** 8 + this[++n] * 2 ** 16 + u * 2 ** 24;
      return BigInt(c) + (BigInt(g) << BigInt(32));
    }), h.prototype.readBigUInt64BE = J(function(n) {
      n = n >>> 0, Q(n, "offset");
      const e = this[n], u = this[n + 7];
      (e === void 0 || u === void 0) && en(n, this.length - 8);
      const c = e * 2 ** 24 + this[++n] * 2 ** 16 + this[++n] * 2 ** 8 + this[++n], g = this[++n] * 2 ** 24 + this[++n] * 2 ** 16 + this[++n] * 2 ** 8 + u;
      return (BigInt(c) << BigInt(32)) + BigInt(g);
    }), h.prototype.readIntLE = function(n, e, u) {
      n = n >>> 0, e = e >>> 0, u || O(n, e, this.length);
      let c = this[n], g = 1, m = 0;
      for (; ++m < e && (g *= 256); )
        c += this[n + m] * g;
      return g *= 128, c >= g && (c -= Math.pow(2, 8 * e)), c;
    }, h.prototype.readIntBE = function(n, e, u) {
      n = n >>> 0, e = e >>> 0, u || O(n, e, this.length);
      let c = e, g = 1, m = this[n + --c];
      for (; c > 0 && (g *= 256); )
        m += this[n + --c] * g;
      return g *= 128, m >= g && (m -= Math.pow(2, 8 * e)), m;
    }, h.prototype.readInt8 = function(n, e) {
      return n = n >>> 0, e || O(n, 1, this.length), this[n] & 128 ? (255 - this[n] + 1) * -1 : this[n];
    }, h.prototype.readInt16LE = function(n, e) {
      n = n >>> 0, e || O(n, 2, this.length);
      const u = this[n] | this[n + 1] << 8;
      return u & 32768 ? u | 4294901760 : u;
    }, h.prototype.readInt16BE = function(n, e) {
      n = n >>> 0, e || O(n, 2, this.length);
      const u = this[n + 1] | this[n] << 8;
      return u & 32768 ? u | 4294901760 : u;
    }, h.prototype.readInt32LE = function(n, e) {
      return n = n >>> 0, e || O(n, 4, this.length), this[n] | this[n + 1] << 8 | this[n + 2] << 16 | this[n + 3] << 24;
    }, h.prototype.readInt32BE = function(n, e) {
      return n = n >>> 0, e || O(n, 4, this.length), this[n] << 24 | this[n + 1] << 16 | this[n + 2] << 8 | this[n + 3];
    }, h.prototype.readBigInt64LE = J(function(n) {
      n = n >>> 0, Q(n, "offset");
      const e = this[n], u = this[n + 7];
      (e === void 0 || u === void 0) && en(n, this.length - 8);
      const c = this[n + 4] + this[n + 5] * 2 ** 8 + this[n + 6] * 2 ** 16 + (u << 24);
      return (BigInt(c) << BigInt(32)) + BigInt(e + this[++n] * 2 ** 8 + this[++n] * 2 ** 16 + this[++n] * 2 ** 24);
    }), h.prototype.readBigInt64BE = J(function(n) {
      n = n >>> 0, Q(n, "offset");
      const e = this[n], u = this[n + 7];
      (e === void 0 || u === void 0) && en(n, this.length - 8);
      const c = (e << 24) + // Overflow
      this[++n] * 2 ** 16 + this[++n] * 2 ** 8 + this[++n];
      return (BigInt(c) << BigInt(32)) + BigInt(this[++n] * 2 ** 24 + this[++n] * 2 ** 16 + this[++n] * 2 ** 8 + u);
    }), h.prototype.readFloatLE = function(n, e) {
      return n = n >>> 0, e || O(n, 4, this.length), r.read(this, n, !0, 23, 4);
    }, h.prototype.readFloatBE = function(n, e) {
      return n = n >>> 0, e || O(n, 4, this.length), r.read(this, n, !1, 23, 4);
    }, h.prototype.readDoubleLE = function(n, e) {
      return n = n >>> 0, e || O(n, 8, this.length), r.read(this, n, !0, 52, 8);
    }, h.prototype.readDoubleBE = function(n, e) {
      return n = n >>> 0, e || O(n, 8, this.length), r.read(this, n, !1, 52, 8);
    };
    function $(i, n, e, u, c, g) {
      if (!h.isBuffer(i)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (n > c || n < g) throw new RangeError('"value" argument is out of bounds');
      if (e + u > i.length) throw new RangeError("Index out of range");
    }
    h.prototype.writeUintLE = h.prototype.writeUIntLE = function(n, e, u, c) {
      if (n = +n, e = e >>> 0, u = u >>> 0, !c) {
        const R = Math.pow(2, 8 * u) - 1;
        $(this, n, e, u, R, 0);
      }
      let g = 1, m = 0;
      for (this[e] = n & 255; ++m < u && (g *= 256); )
        this[e + m] = n / g & 255;
      return e + u;
    }, h.prototype.writeUintBE = h.prototype.writeUIntBE = function(n, e, u, c) {
      if (n = +n, e = e >>> 0, u = u >>> 0, !c) {
        const R = Math.pow(2, 8 * u) - 1;
        $(this, n, e, u, R, 0);
      }
      let g = u - 1, m = 1;
      for (this[e + g] = n & 255; --g >= 0 && (m *= 256); )
        this[e + g] = n / m & 255;
      return e + u;
    }, h.prototype.writeUint8 = h.prototype.writeUInt8 = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 1, 255, 0), this[e] = n & 255, e + 1;
    }, h.prototype.writeUint16LE = h.prototype.writeUInt16LE = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 2, 65535, 0), this[e] = n & 255, this[e + 1] = n >>> 8, e + 2;
    }, h.prototype.writeUint16BE = h.prototype.writeUInt16BE = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 2, 65535, 0), this[e] = n >>> 8, this[e + 1] = n & 255, e + 2;
    }, h.prototype.writeUint32LE = h.prototype.writeUInt32LE = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 4, 4294967295, 0), this[e + 3] = n >>> 24, this[e + 2] = n >>> 16, this[e + 1] = n >>> 8, this[e] = n & 255, e + 4;
    }, h.prototype.writeUint32BE = h.prototype.writeUInt32BE = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 4, 4294967295, 0), this[e] = n >>> 24, this[e + 1] = n >>> 16, this[e + 2] = n >>> 8, this[e + 3] = n & 255, e + 4;
    };
    function In(i, n, e, u, c) {
      Pn(n, u, c, i, e, 7);
      let g = Number(n & BigInt(4294967295));
      i[e++] = g, g = g >> 8, i[e++] = g, g = g >> 8, i[e++] = g, g = g >> 8, i[e++] = g;
      let m = Number(n >> BigInt(32) & BigInt(4294967295));
      return i[e++] = m, m = m >> 8, i[e++] = m, m = m >> 8, i[e++] = m, m = m >> 8, i[e++] = m, e;
    }
    function Sn(i, n, e, u, c) {
      Pn(n, u, c, i, e, 7);
      let g = Number(n & BigInt(4294967295));
      i[e + 7] = g, g = g >> 8, i[e + 6] = g, g = g >> 8, i[e + 5] = g, g = g >> 8, i[e + 4] = g;
      let m = Number(n >> BigInt(32) & BigInt(4294967295));
      return i[e + 3] = m, m = m >> 8, i[e + 2] = m, m = m >> 8, i[e + 1] = m, m = m >> 8, i[e] = m, e + 8;
    }
    h.prototype.writeBigUInt64LE = J(function(n, e = 0) {
      return In(this, n, e, BigInt(0), BigInt("0xffffffffffffffff"));
    }), h.prototype.writeBigUInt64BE = J(function(n, e = 0) {
      return Sn(this, n, e, BigInt(0), BigInt("0xffffffffffffffff"));
    }), h.prototype.writeIntLE = function(n, e, u, c) {
      if (n = +n, e = e >>> 0, !c) {
        const D = Math.pow(2, 8 * u - 1);
        $(this, n, e, u, D - 1, -D);
      }
      let g = 0, m = 1, R = 0;
      for (this[e] = n & 255; ++g < u && (m *= 256); )
        n < 0 && R === 0 && this[e + g - 1] !== 0 && (R = 1), this[e + g] = (n / m >> 0) - R & 255;
      return e + u;
    }, h.prototype.writeIntBE = function(n, e, u, c) {
      if (n = +n, e = e >>> 0, !c) {
        const D = Math.pow(2, 8 * u - 1);
        $(this, n, e, u, D - 1, -D);
      }
      let g = u - 1, m = 1, R = 0;
      for (this[e + g] = n & 255; --g >= 0 && (m *= 256); )
        n < 0 && R === 0 && this[e + g + 1] !== 0 && (R = 1), this[e + g] = (n / m >> 0) - R & 255;
      return e + u;
    }, h.prototype.writeInt8 = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 1, 127, -128), n < 0 && (n = 255 + n + 1), this[e] = n & 255, e + 1;
    }, h.prototype.writeInt16LE = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 2, 32767, -32768), this[e] = n & 255, this[e + 1] = n >>> 8, e + 2;
    }, h.prototype.writeInt16BE = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 2, 32767, -32768), this[e] = n >>> 8, this[e + 1] = n & 255, e + 2;
    }, h.prototype.writeInt32LE = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 4, 2147483647, -2147483648), this[e] = n & 255, this[e + 1] = n >>> 8, this[e + 2] = n >>> 16, this[e + 3] = n >>> 24, e + 4;
    }, h.prototype.writeInt32BE = function(n, e, u) {
      return n = +n, e = e >>> 0, u || $(this, n, e, 4, 2147483647, -2147483648), n < 0 && (n = 4294967295 + n + 1), this[e] = n >>> 24, this[e + 1] = n >>> 16, this[e + 2] = n >>> 8, this[e + 3] = n & 255, e + 4;
    }, h.prototype.writeBigInt64LE = J(function(n, e = 0) {
      return In(this, n, e, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }), h.prototype.writeBigInt64BE = J(function(n, e = 0) {
      return Sn(this, n, e, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function Fn(i, n, e, u, c, g) {
      if (e + u > i.length) throw new RangeError("Index out of range");
      if (e < 0) throw new RangeError("Index out of range");
    }
    function _n(i, n, e, u, c) {
      return n = +n, e = e >>> 0, c || Fn(i, n, e, 4), r.write(i, n, e, u, 23, 4), e + 4;
    }
    h.prototype.writeFloatLE = function(n, e, u) {
      return _n(this, n, e, !0, u);
    }, h.prototype.writeFloatBE = function(n, e, u) {
      return _n(this, n, e, !1, u);
    };
    function An(i, n, e, u, c) {
      return n = +n, e = e >>> 0, c || Fn(i, n, e, 8), r.write(i, n, e, u, 52, 8), e + 8;
    }
    h.prototype.writeDoubleLE = function(n, e, u) {
      return An(this, n, e, !0, u);
    }, h.prototype.writeDoubleBE = function(n, e, u) {
      return An(this, n, e, !1, u);
    }, h.prototype.copy = function(n, e, u, c) {
      if (!h.isBuffer(n)) throw new TypeError("argument should be a Buffer");
      if (u || (u = 0), !c && c !== 0 && (c = this.length), e >= n.length && (e = n.length), e || (e = 0), c > 0 && c < u && (c = u), c === u || n.length === 0 || this.length === 0) return 0;
      if (e < 0)
        throw new RangeError("targetStart out of bounds");
      if (u < 0 || u >= this.length) throw new RangeError("Index out of range");
      if (c < 0) throw new RangeError("sourceEnd out of bounds");
      c > this.length && (c = this.length), n.length - e < c - u && (c = n.length - e + u);
      const g = c - u;
      return this === n && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(e, u, c) : Uint8Array.prototype.set.call(
        n,
        this.subarray(u, c),
        e
      ), g;
    }, h.prototype.fill = function(n, e, u, c) {
      if (typeof n == "string") {
        if (typeof e == "string" ? (c = e, e = 0, u = this.length) : typeof u == "string" && (c = u, u = this.length), c !== void 0 && typeof c != "string")
          throw new TypeError("encoding must be a string");
        if (typeof c == "string" && !h.isEncoding(c))
          throw new TypeError("Unknown encoding: " + c);
        if (n.length === 1) {
          const m = n.charCodeAt(0);
          (c === "utf8" && m < 128 || c === "latin1") && (n = m);
        }
      } else typeof n == "number" ? n = n & 255 : typeof n == "boolean" && (n = Number(n));
      if (e < 0 || this.length < e || this.length < u)
        throw new RangeError("Out of range index");
      if (u <= e)
        return this;
      e = e >>> 0, u = u === void 0 ? this.length : u >>> 0, n || (n = 0);
      let g;
      if (typeof n == "number")
        for (g = e; g < u; ++g)
          this[g] = n;
      else {
        const m = h.isBuffer(n) ? n : h.from(n, c), R = m.length;
        if (R === 0)
          throw new TypeError('The value "' + n + '" is invalid for argument "value"');
        for (g = 0; g < u - e; ++g)
          this[g + e] = m[g % R];
      }
      return this;
    };
    const Z = {};
    function pn(i, n, e) {
      Z[i] = class extends e {
        constructor() {
          super(), Object.defineProperty(this, "message", {
            value: n.apply(this, arguments),
            writable: !0,
            configurable: !0
          }), this.name = `${this.name} [${i}]`, this.stack, delete this.name;
        }
        get code() {
          return i;
        }
        set code(c) {
          Object.defineProperty(this, "code", {
            configurable: !0,
            enumerable: !0,
            value: c,
            writable: !0
          });
        }
        toString() {
          return `${this.name} [${i}]: ${this.message}`;
        }
      };
    }
    pn(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(i) {
        return i ? `${i} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
      },
      RangeError
    ), pn(
      "ERR_INVALID_ARG_TYPE",
      function(i, n) {
        return `The "${i}" argument must be of type number. Received type ${typeof n}`;
      },
      TypeError
    ), pn(
      "ERR_OUT_OF_RANGE",
      function(i, n, e) {
        let u = `The value of "${i}" is out of range.`, c = e;
        return Number.isInteger(e) && Math.abs(e) > 2 ** 32 ? c = Tn(String(e)) : typeof e == "bigint" && (c = String(e), (e > BigInt(2) ** BigInt(32) || e < -(BigInt(2) ** BigInt(32))) && (c = Tn(c)), c += "n"), u += ` It must be ${n}. Received ${c}`, u;
      },
      RangeError
    );
    function Tn(i) {
      let n = "", e = i.length;
      const u = i[0] === "-" ? 1 : 0;
      for (; e >= u + 4; e -= 3)
        n = `_${i.slice(e - 3, e)}${n}`;
      return `${i.slice(0, e)}${n}`;
    }
    function st(i, n, e) {
      Q(n, "offset"), (i[n] === void 0 || i[n + e] === void 0) && en(n, i.length - (e + 1));
    }
    function Pn(i, n, e, u, c, g) {
      if (i > e || i < n) {
        const m = typeof n == "bigint" ? "n" : "";
        let R;
        throw n === 0 || n === BigInt(0) ? R = `>= 0${m} and < 2${m} ** ${(g + 1) * 8}${m}` : R = `>= -(2${m} ** ${(g + 1) * 8 - 1}${m}) and < 2 ** ${(g + 1) * 8 - 1}${m}`, new Z.ERR_OUT_OF_RANGE("value", R, i);
      }
      st(u, c, g);
    }
    function Q(i, n) {
      if (typeof i != "number")
        throw new Z.ERR_INVALID_ARG_TYPE(n, "number", i);
    }
    function en(i, n, e) {
      throw Math.floor(i) !== i ? (Q(i, e), new Z.ERR_OUT_OF_RANGE("offset", "an integer", i)) : n < 0 ? new Z.ERR_BUFFER_OUT_OF_BOUNDS() : new Z.ERR_OUT_OF_RANGE(
        "offset",
        `>= 0 and <= ${n}`,
        i
      );
    }
    const ut = /[^+/0-9A-Za-z-_]/g;
    function ht(i) {
      if (i = i.split("=")[0], i = i.trim().replace(ut, ""), i.length < 2) return "";
      for (; i.length % 4 !== 0; )
        i = i + "=";
      return i;
    }
    function yn(i, n) {
      n = n || 1 / 0;
      let e;
      const u = i.length;
      let c = null;
      const g = [];
      for (let m = 0; m < u; ++m) {
        if (e = i.charCodeAt(m), e > 55295 && e < 57344) {
          if (!c) {
            if (e > 56319) {
              (n -= 3) > -1 && g.push(239, 191, 189);
              continue;
            } else if (m + 1 === u) {
              (n -= 3) > -1 && g.push(239, 191, 189);
              continue;
            }
            c = e;
            continue;
          }
          if (e < 56320) {
            (n -= 3) > -1 && g.push(239, 191, 189), c = e;
            continue;
          }
          e = (c - 55296 << 10 | e - 56320) + 65536;
        } else c && (n -= 3) > -1 && g.push(239, 191, 189);
        if (c = null, e < 128) {
          if ((n -= 1) < 0) break;
          g.push(e);
        } else if (e < 2048) {
          if ((n -= 2) < 0) break;
          g.push(
            e >> 6 | 192,
            e & 63 | 128
          );
        } else if (e < 65536) {
          if ((n -= 3) < 0) break;
          g.push(
            e >> 12 | 224,
            e >> 6 & 63 | 128,
            e & 63 | 128
          );
        } else if (e < 1114112) {
          if ((n -= 4) < 0) break;
          g.push(
            e >> 18 | 240,
            e >> 12 & 63 | 128,
            e >> 6 & 63 | 128,
            e & 63 | 128
          );
        } else
          throw new Error("Invalid code point");
      }
      return g;
    }
    function ft(i) {
      const n = [];
      for (let e = 0; e < i.length; ++e)
        n.push(i.charCodeAt(e) & 255);
      return n;
    }
    function at(i, n) {
      let e, u, c;
      const g = [];
      for (let m = 0; m < i.length && !((n -= 2) < 0); ++m)
        e = i.charCodeAt(m), u = e >> 8, c = e % 256, g.push(c), g.push(u);
      return g;
    }
    function Rn(i) {
      return t.toByteArray(ht(i));
    }
    function un(i, n, e, u) {
      let c;
      for (c = 0; c < u && !(c + e >= n.length || c >= i.length); ++c)
        n[c + e] = i[c];
      return c;
    }
    function K(i, n) {
      return i instanceof n || i != null && i.constructor != null && i.constructor.name != null && i.constructor.name === n.name;
    }
    function gn(i) {
      return i !== i;
    }
    const lt = (function() {
      const i = "0123456789abcdef", n = new Array(256);
      for (let e = 0; e < 16; ++e) {
        const u = e * 16;
        for (let c = 0; c < 16; ++c)
          n[u + c] = i[e] + i[c];
      }
      return n;
    })();
    function J(i) {
      return typeof BigInt > "u" ? ct : i;
    }
    function ct() {
      throw new Error("BigInt not supported");
    }
  })(vn)), vn;
}
var ot = Jt();
const Ht = typeof self < "u" ? self : typeof globalThis < "u" ? globalThis : {};
Ht.Buffer = ot.Buffer;
const Hn = (s) => ot.Buffer.from(JSON.stringify(s)).buffer, Xn = (s) => JSON.parse(new TextDecoder().decode(s));
class Xt {
  constructor(t) {
    this.map = t.map, this.source = t.source instanceof maplibregl.VectorTileSource ? t.source : this.map.getSource(t.source), this.sourceLayer = t.sourceLayer, this.fid = t.fid || "id", this.tiles = this.source.tiles.map((y) => y.split("{z}")[0]), this.tileSize = this.source.tileSize || 512, this.tolerance = t.tolerance || 1e-5, this.cacheSize = t.cacheSize || 1e4, this.units = t.units || "meters", this.seed = !1, this.map.addSource(this.source.id + "-proper", {
      type: "geojson",
      maxzoom: this.source.maxzoom,
      promoteId: "_index",
      data: {}
    }), this.gjsource = this.map.getSource(this.source.id + "-proper"), maplibregl.addProtocol("proper", this._protocol), this.map.setTransformRequest((y, p) => this.tiles.some((b) => y.startsWith(b)) && p === "Tile" ? { url: "proper://" + y } : { url: y });
    const r = new Kn(Wt, { size: 6 }), a = new Kn(Kt, { size: 4 }), f = /* @__PURE__ */ new Map();
    return r.onmessage = (y) => {
      if (y.data instanceof ArrayBuffer) {
        const p = y.data, h = Xn(p);
        if (h.type !== "simplified") return 0;
        const { unique: b, type: B, ...v } = h;
        f.set(b, v);
      }
    }, r.onmessage = (y) => {
      if (y.data instanceof ArrayBuffer) {
        const p = y.data, h = Xn(p);
        if (h.type !== "simplified") return 0;
        const { unique: b, type: B, ...v } = h;
        f.set(b, v);
      }
    }, this.map.on("sourcedata", (y) => {
      if (y.sourceId === this.source.id) {
        const { z: p, x: h, y: b } = y.tile.tileID.canonical, B = `${p}|${h}|${b}`;
        if (!f.has(B)) {
          const v = this.tolerance * Math.pow(10, -0.301 * p + 5.19), S = [], x = this.source.type === "vector" ? { sourceLayer: this.sourceLayer } : {};
          y.tile.querySourceFeatures(S, x);
          const w = {
            collection: {
              type: "FeatureCollection",
              features: S.map((I, A) => ({
                id: I.properties[this.fid] || I.id,
                geometry: I.geometry,
                properties: { ...I.properties, _index: `${B}|${A}`, _tile: B }
              }))
            },
            tolerance: v,
            unique: B,
            tilesize: this.tileSize
          }, E = Hn(w);
          r.postMessage(E);
        }
        y.isSourceLoaded && r.addEventListener("idle", (v) => {
          const x = { pieces: Object.fromEntries(f), tolerance: this.tolerance, unit: this.units }, w = Hn(x);
          a.postMessage(w);
        });
      }
    }), this.map.refreshTiles(this.source.id), this.gjsource;
  }
  _protocol = async (t) => {
    const a = t.url.replace("proper://", ""), f = t.url.split(/\/|\./i);
    if (f === null || f.length < 4)
      return console.warn(`Malformed URL: ${t.url}`), { data: null };
    const y = await fetch(a);
    let p;
    if (y.status === 200) {
      const h = f.length, [b, B, v] = f.slice(h - 4, h - 1).map((E) => E * 1), S = await y.arrayBuffer(), x = new Ot(new yt(S)), w = {
        layers: Object.entries(x.layers).reduce((E, [I, A]) => ({
          ...E,
          [I]: {
            ...A,
            feature: (k) => {
              const M = A.feature(k), U = M.loadGeometry().flat(1 / 0).some(
                (P) => P.x >= A.extent - 1 || P.y >= A.extent - 1 || P.x <= 1 || P.y <= 1
              );
              return M.properties.clipped = U, M;
            }
          }
        }), {})
      };
      p = jn(w).buffer;
    } else
      p = jn({}).buffer;
    return { data: p };
  };
}
maplibregl.VectorTileSource.prototype.ProperLabels = function(s) {
  const t = Object.assign({}, s, {
    map: this._map,
    source: this
  });
  return this._proper || (this._proper = new Xt(t)), this._proper;
};
export {
  Xt as default
};
