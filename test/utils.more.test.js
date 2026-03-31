import { describe, it, expect } from 'vitest';
import { ArrayBufferPool, encodeFeaturesBinary, decodeFeaturesBinary } from '../src/utils.js';

describe('encode/decode more geometries', () => {
  it('handles LineString roundtrip', () => {
    const features = [{ id: 'ls', geometry: { type: 'LineString', coordinates: [[0,0],[1,1],[2,-2]] }, properties: { a: 1 } }];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, { pool: new ArrayBufferPool(), useSharedKeyTable: false });
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out[0].geometry.type).toBe('LineString');
    expect(out[0].geometry.coordinates).toEqual([[0,0],[1,1],[2,-2]]);
    expect(out[0].properties.a).toBe(1);
  });

  it('handles Polygon with ring lengths', () => {
    const features = [{ id: 'poly', geometry: { type: 'Polygon', coordinates: [[[0,0],[1,0],[1,1],[0,0]]] }, properties: {} }];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, { pool: new ArrayBufferPool(), useSharedKeyTable: false });
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out[0].geometry.type).toBe('Polygon');
    expect(out[0].geometry.coordinates[0]).toHaveLength(4);
  });

  it('handles MultiPolygon roundtrip', () => {
    const features = [{ id: 'mp', geometry: { type: 'MultiPolygon', coordinates: [[[[0,0],[1,0],[1,1],[0,0]]], [[[2,2],[3,2],[3,3],[2,2]]]] }, properties: { foo: 'bar' } }];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, { pool: new ArrayBufferPool(), useSharedKeyTable: false });
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out[0].geometry.type).toBe('MultiPolygon');
    expect(out[0].properties.foo).toBe('bar');
  });

  it('zero-length props buffer and ZERO_BUFFER behavior', () => {
    const p = new ArrayBufferPool();
    const buf = p.rent(0);
    expect(buf).toBe(ArrayBufferPool.ZERO_BUFFER);
    const features = [{ id: 'noprops', geometry: { type: 'Point', coordinates: [10, 20] } }];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, { pool: p, useSharedKeyTable: false });
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out[0].properties).toEqual({});
  });

  it('decodes non-finite coords to safe fallback', () => {
    const features = [{ id: 'bad', geometry: { type: 'Point', coordinates: [1000, 2000] }, properties: {} }];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, { pool: new ArrayBufferPool(), useSharedKeyTable: false });
    // simulate corrupted buffer
    coordsArray[0] = Infinity;
    coordsArray[1] = NaN;
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out[0].geometry.coordinates[0]).toBe(0);
    expect(out[0].geometry.coordinates[1]).toBe(0);
  });
});
