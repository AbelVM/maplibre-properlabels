import { describe, it, expect } from 'vitest';
import { ArrayBufferPool, encodeFeaturesBinary, decodeFeaturesBinary, computeGeometryHash } from '../src/utils.js';

describe('ArrayBufferPool', () => {
  it('nextPow2 works', () => {
    expect(ArrayBufferPool._nextPow2(0)).toBe(0);
    expect(ArrayBufferPool._nextPow2(1)).toBe(1);
    expect(ArrayBufferPool._nextPow2(2)).toBe(2);
    expect(ArrayBufferPool._nextPow2(3)).toBe(4);
    expect(ArrayBufferPool._nextPow2(5)).toBe(8);
  });

  it('rent and release behave sensibly', () => {
    const p = new ArrayBufferPool();
    const buf = p.rent(10);
    expect(buf).toBeInstanceOf(ArrayBuffer);
    expect(buf.byteLength).toBeGreaterThanOrEqual(10);
    p.release(buf);
  });
});

describe('encode/decode roundtrip', () => {
  it('encodes and decodes a simple point feature', () => {
    const features = [
      { id: 1, geometry: { type: 'Point', coordinates: [1, 2] }, properties: { foo: 'bar', n: 5 } }
    ];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, { pool: new ArrayBufferPool(), useSharedKeyTable: false });
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out).toHaveLength(1);
    const f = out[0];
    expect(f.geometry.type).toBe('Point');
    expect(f.geometry.coordinates[0]).toBeCloseTo(1);
    expect(f.geometry.coordinates[1]).toBeCloseTo(2);
    expect(f.properties.foo).toBe('bar');
    expect(f.properties.n).toBe(5);
  });
});

describe('computeGeometryHash', () => {
  it('is deterministic and sensitive to coordinates', () => {
    const a = computeGeometryHash({ type: 'Point', coordinates: [1, 2] });
    const b = computeGeometryHash({ type: 'Point', coordinates: [1, 2] });
    expect(a).toBe(b);
    const c = computeGeometryHash({ type: 'Point', coordinates: [2, 1] });
    expect(a).not.toBe(c);
  });
});
