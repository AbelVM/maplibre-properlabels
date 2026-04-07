import { describe, it, expect } from 'vitest';
import {
  ArrayBufferPool,
  encodeFeaturesBinary,
  decodeFeaturesBinary,
  sharedKeyTable,
  resetSharedKeyTable,
  computeGeometryHash,
  geometryEquals,
} from '../src/utils.js';

describe('encode/decode branch coverage targets', () => {
  it('pushPoint accepts object {x,y}', () => {
    const features = [
      { id: 'o', geometry: { type: 'Point', coordinates: { x: 5, y: -10 } }, properties: { a: 1 } },
    ];
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, {
      pool: new ArrayBufferPool(),
      useSharedKeyTable: false,
    });
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out[0].geometry.coordinates[0]).toBeCloseTo(5);
    expect(out[0].geometry.coordinates[1]).toBeCloseTo(-10);
    expect(out[0].properties.a).toBe(1);
  });

  it('propsBuffer smaller than needed triggers allocation and decodes correctly', () => {
    const features = [
      {
        id: 'p',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: { big: 'abcdefghijklmnopqrstuvwxyz' },
      },
    ];
    const small = new Uint8Array(2);
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, {
      propsBuffer: small,
    });
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out[0].properties.big).toBe('abcdefghijklmnopqrstuvwxyz');
  });

  it('coordsBuffer provided but too small falls back to new Float32Array', () => {
    const features = [
      {
        id: 'ls',
        geometry: {
          type: 'LineString',
          coordinates: [
            [1, 1],
            [2, 2],
            [3, 3],
          ],
        },
        properties: {},
      },
    ];
    const smallCoords = new Float32Array(1);
    const { meta, keys, propsBuffer, coordsArray } = encodeFeaturesBinary(features, {
      coordsBuffer: smallCoords,
    });
    const out = decodeFeaturesBinary(meta, propsBuffer, coordsArray, keys);
    expect(out[0].geometry.type).toBe('LineString');
    expect(out[0].geometry.coordinates.length).toBe(3);
  });

  it('useSharedKeyTable populates sharedKeyTable and reset clears it', () => {
    resetSharedKeyTable();
    expect(sharedKeyTable.keys.length).toBe(0);
    const features = [
      { id: 1, geometry: { type: 'Point', coordinates: [0, 0] }, properties: { x: 1, y: 2 } },
    ];
    encodeFeaturesBinary(features, { useSharedKeyTable: true });
    expect(sharedKeyTable.keys.length).toBeGreaterThan(0);
    resetSharedKeyTable();
    expect(sharedKeyTable.keys.length).toBe(0);
  });

  it('decode unknown type falls back to Point when coords available', () => {
    const meta = [{ id: 'u', type: 'Unknown', coordsOffset: 0, coordsLength: 2, props: [] }];
    const coords = new Float32Array([7.5, -20.25]);
    const props = new Uint8Array(0);
    const out = decodeFeaturesBinary(meta, props, coords, []);
    expect(out[0].geometry.type).toBe('Point');
    expect(out[0].geometry.coordinates[0]).toBeCloseTo(7.5);
  });

  it('decode ignores invalid JSON property bytes', () => {
    const meta = [
      { id: 'inv', type: 'Point', coordsOffset: 0, coordsLength: 2, props: [[0, 0, 3]] },
    ];
    const coords = new Float32Array([0, 0]);
    const badProps = new Uint8Array([0xff, 0xff, 0xff]);
    const out = decodeFeaturesBinary(meta, badProps, coords, ['k']);
    expect(out[0].properties).toEqual({});
  });
});

describe('hashing and equality helpers', () => {
  it('computeGeometryHash differs by geometry type and coordinates', () => {
    const a = computeGeometryHash({
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    });
    const b = computeGeometryHash({
      type: 'LineString',
      coordinates: [
        [0, 0],
        [2, 2],
      ],
    });
    expect(a).not.toBe(b);
    const p = computeGeometryHash({ type: 'Point', coordinates: [0, 0] });
    expect(typeof p).toBe('number');
  });

  it('geometryEquals handles nulls, mismatched types and numeric epsilon', () => {
    expect(geometryEquals(null, null)).toBe(true);
    expect(geometryEquals(null, { type: 'Point', coordinates: [0, 0] })).toBe(false);
    expect(
      geometryEquals(
        { type: 'Point', coordinates: [0, 0] },
        { type: 'Point', coordinates: [0.0000001, 0] }
      )
    ).toBe(true);
  });
});
