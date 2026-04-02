import { Buffer } from "buffer/";

const _root = (typeof self !== 'undefined') ? self : ((typeof globalThis !== 'undefined') ? globalThis : {});

_root.Buffer = Buffer;

export const o2b = o => Buffer.from(JSON.stringify(o)).buffer;
export const b2o = b => JSON.parse(new TextDecoder().decode(b));
    