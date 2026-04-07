import { describe, it, expect, beforeAll, vi } from 'vitest';

beforeAll(() => {
  // ensure postMessage exists so worker can use it
  globalThis.postMessage = vi.fn();
  try {
    delete globalThis.onmessage;
  } catch (e) {}
});

describe('worker test hooks', () => {
  it('applies pending diff on diff_ack using test hooks', async () => {
    await import('../src/worker.js');
    expect(typeof globalThis.onmessage).toBe('function');
    expect(typeof globalThis.__test_setPendingDiff).toBe('function');
    expect(typeof globalThis.__test_getCacheSize).toBe('function');

    const before = globalThis.__test_getCacheSize();
    globalThis.__test_setPendingDiff({
      addList: [
        {
          feature: { id: 'a', geometry: { type: 'Point', coordinates: [1, 2] }, properties: {} },
          rawHash: 1,
          geomHash: 2,
        },
      ],
      updateList: [],
      removeList: [],
    });

    globalThis.onmessage({ data: { type: 'diff_ack' } });
    const after = globalThis.__test_getCacheSize();
    expect(after).toBeGreaterThanOrEqual(before + 1);
  });
});
