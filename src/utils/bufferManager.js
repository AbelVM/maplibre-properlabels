/* Lightweight buffer helpers optimized for frequent encode/decode paths.
 * - Reuse a module-level TextEncoder/TextDecoder to avoid per-call allocations.
 * - Accept ArrayBuffer / TypedArray inputs and prefer zero-copy when possible.
 * - Provide explicit Uint8Array helpers (`o2u8`/`u82o`) for transferable-friendly, zero-copy usage.
 * - Avoid importing the `buffer` polyfill; fall back to Node Buffer only if necessary.
 */
const hasTextEncoder = typeof TextEncoder !== 'undefined';
const hasTextDecoder = typeof TextDecoder !== 'undefined';
const encoder = hasTextEncoder ? new TextEncoder() : null;
const decoder = hasTextDecoder ? new TextDecoder() : null;

/**
 * Convert an object or buffer-like to a Uint8Array (UTF-8 JSON).
 * - If input is already a Uint8Array or ArrayBuffer view, returns a Uint8Array view.
 * - Otherwise JSON.stringify(obj) and encode to UTF-8.
 * @param {*} obj
 * @returns {Uint8Array}
 */
export const o2u8 = (obj) => {
	if (obj instanceof Uint8Array) return obj;
	if (ArrayBuffer.isView(obj)) return new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength);
	if (obj instanceof ArrayBuffer) return new Uint8Array(obj);
	const str = JSON.stringify(obj);
	if (encoder) return encoder.encode(str);
	if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') return new Uint8Array(Buffer.from(str));
	throw new Error('No TextEncoder available to encode object');
};

/**
 * Convert a Uint8Array/ArrayBuffer/Buffer to a JS object (JSON).
 * @param {ArrayBuffer|TypedArray|Buffer} buf
 * @returns {*}
 */
export const u82o = (buf) => {
	let u8;
	if (buf instanceof Uint8Array) u8 = buf;
	else if (ArrayBuffer.isView(buf)) u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
	else if (buf instanceof ArrayBuffer) u8 = new Uint8Array(buf);
	else if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer === 'function' && Buffer.isBuffer(buf)) u8 = new Uint8Array(buf);
	else throw new TypeError('Unsupported input to u82o, expected ArrayBuffer/TypedArray/Buffer');

	if (decoder) return JSON.parse(decoder.decode(u8));
	if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') return JSON.parse(Buffer.from(u8).toString('utf8'));
	return JSON.parse(new TextDecoder().decode(u8));
};

/**
 * Backwards-compatible: encode to ArrayBuffer (JSON UTF-8).
 * @param {*} obj
 * @returns {ArrayBuffer}
 */
export const o2b = (obj) => {
	const u8 = o2u8(obj);
	// prefer zero-copy when the view covers the full underlying buffer
	if (u8.byteOffset === 0 && u8.byteLength === u8.buffer.byteLength) return u8.buffer;
	return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
};

/**
 * Backwards-compatible: decode ArrayBuffer/TypedArray to object.
 * @param {ArrayBuffer|TypedArray|Buffer} buf
 * @returns {*}
 */
export const b2o = (buf) => u82o(buf);
    