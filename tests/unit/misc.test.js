import { describe, expect, it } from 'vitest';
import { deepEqual } from '../../src/utils/misc.js';

describe('deepEqual', () => {
  it('returns true for identical primitives and null/undefined', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual('foo', 'foo')).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it('returns false for different primitives', () => {
    expect(deepEqual(1, '1')).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
  });

  it('deeply compares nested arrays and objects', () => {
    const a = [{ value: 1 }, { value: [2, 3] }];
    const b = [{ value: 1 }, { value: [2, 3] }];
    const c = [{ value: 1 }, { value: [2, 4] }];

    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });

  it('compares Date and RegExp values correctly', () => {
    expect(deepEqual(new Date('2025-01-01'), new Date('2025-01-01'))).toBe(true);
    expect(deepEqual(/abc/i, /abc/i)).toBe(true);
    expect(deepEqual(/abc/i, /abc/)).toBe(false);
  });

  it('compares typed arrays and array buffers', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 3]);
    const c = new Uint8Array([1, 2, 4]);

    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });

  it('handles cyclic references without blowing up', () => {
    const a = { self: null };
    const b = { self: null };
    a.self = a;
    b.self = b;

    expect(deepEqual(a, b)).toBe(true);
  });
});
