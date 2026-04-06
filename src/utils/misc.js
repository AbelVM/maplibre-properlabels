function deepEqual(a, b, seen = new WeakMap()) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    if (a.constructor !== b.constructor) return false;

    if (seen.has(a)) return seen.get(a) === b;
    seen.set(a, b);

    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) return false;
        for (let i = 0; i < a.length; i += 1) {
            if (!deepEqual(a[i], b[i], seen)) return false;
        }
        return true;
    }

    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();
    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
        if (a.byteLength !== b.byteLength) return false;
        const u8a = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        const u8b = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
        for (let i = 0; i < u8a.length; i += 1) {
            if (u8a[i] !== u8b[i]) return false;
        }
        return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!deepEqual(a[key], b[key], seen)) return false;
    }
    return true;
}

export { deepEqual };