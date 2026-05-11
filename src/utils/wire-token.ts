import { getOrCreateServerKey, hmacSign, hmacVerify } from './crypto.js';

/**
 * Wire-format token: HMAC-signed CBOR payload that travels over MCP.
 *
 * Designed for minimum on-wire size. All "interesting" session state lives
 * in SessionStore (server-side); this token carries only the fields needed
 * for verification, gating, and integrity attestation.
 */
export interface WireToken {
  /** Session id, 16 raw bytes (UUID binary form). */
  sid: Buffer;
  /** Monotonic advance counter (uint). */
  seq: number;
  /** Unix seconds at issue time (uint). */
  ts: number;
  /** Active checkpoint id; omitted when no checkpoint is active. */
  bcp?: string;
  /** Truncated SHA-256 of the SessionRecord and seq; 16 raw bytes. */
  sh: Buffer;
}

// --- Minimal fixed-schema CBOR codec ---
// Only the major types we need: 0 (uint), 2 (byte string), 3 (text string), 5 (map).
// Lengths/values are always represented in the smallest CBOR form.

function encodeHead(major: number, value: number): Buffer {
  const m = major << 5;
  if (value < 24) return Buffer.from([m | value]);
  if (value < 0x100) return Buffer.from([m | 24, value]);
  if (value < 0x10000) {
    const b = Buffer.alloc(3);
    b[0] = m | 25;
    b.writeUInt16BE(value, 1);
    return b;
  }
  if (value < 0x100000000) {
    const b = Buffer.alloc(5);
    b[0] = m | 26;
    b.writeUInt32BE(value, 1);
    return b;
  }
  const b = Buffer.alloc(9);
  b[0] = m | 27;
  b.writeBigUInt64BE(BigInt(value), 1);
  return b;
}

function encodeUint(value: number): Buffer {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`encodeUint: expected non-negative integer, got ${value}`);
  }
  return encodeHead(0, value);
}

function encodeBytes(bytes: Buffer): Buffer {
  return Buffer.concat([encodeHead(2, bytes.length), bytes]);
}

function encodeText(text: string): Buffer {
  const bytes = Buffer.from(text, 'utf8');
  return Buffer.concat([encodeHead(3, bytes.length), bytes]);
}

/** Encode a WireToken to its CBOR payload bytes (pre-signature). */
export function encodeCbor(t: WireToken): Buffer {
  if (t.sid.length !== 16) throw new Error(`encodeCbor: sid must be 16 bytes, got ${t.sid.length}`);
  if (t.sh.length !== 16) throw new Error(`encodeCbor: sh must be 16 bytes, got ${t.sh.length}`);

  const hasBcp = t.bcp !== undefined && t.bcp.length > 0;
  const entries: Buffer[] = [encodeHead(5, hasBcp ? 5 : 4)];

  entries.push(encodeUint(1), encodeBytes(t.sid));
  entries.push(encodeUint(2), encodeUint(t.seq));
  entries.push(encodeUint(3), encodeUint(t.ts));
  if (hasBcp) entries.push(encodeUint(4), encodeText(t.bcp!));
  entries.push(encodeUint(5), encodeBytes(t.sh));

  return Buffer.concat(entries);
}

interface Cursor { offset: number; }

function readHead(buf: Buffer, cur: Cursor): { major: number; value: number } {
  if (cur.offset >= buf.length) throw new Error('decodeCbor: unexpected end of input');
  const first = buf[cur.offset]!;
  const major = first >> 5;
  const info = first & 0x1f;
  cur.offset += 1;
  if (info < 24) return { major, value: info };
  if (info === 24) {
    if (cur.offset + 1 > buf.length) throw new Error('decodeCbor: truncated uint8');
    const v = buf[cur.offset]!;
    cur.offset += 1;
    return { major, value: v };
  }
  if (info === 25) {
    if (cur.offset + 2 > buf.length) throw new Error('decodeCbor: truncated uint16');
    const v = buf.readUInt16BE(cur.offset);
    cur.offset += 2;
    return { major, value: v };
  }
  if (info === 26) {
    if (cur.offset + 4 > buf.length) throw new Error('decodeCbor: truncated uint32');
    const v = buf.readUInt32BE(cur.offset);
    cur.offset += 4;
    return { major, value: v };
  }
  if (info === 27) {
    if (cur.offset + 8 > buf.length) throw new Error('decodeCbor: truncated uint64');
    const big = buf.readBigUInt64BE(cur.offset);
    cur.offset += 8;
    if (big > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error('decodeCbor: uint64 exceeds JS safe integer range');
    }
    return { major, value: Number(big) };
  }
  throw new Error(`decodeCbor: unsupported CBOR additional info ${info}`);
}

function readBytes(buf: Buffer, cur: Cursor, len: number): Buffer {
  if (cur.offset + len > buf.length) throw new Error('decodeCbor: truncated byte string');
  const out = buf.subarray(cur.offset, cur.offset + len);
  cur.offset += len;
  return Buffer.from(out);
}

function readText(buf: Buffer, cur: Cursor, len: number): string {
  if (cur.offset + len > buf.length) throw new Error('decodeCbor: truncated text string');
  const s = buf.subarray(cur.offset, cur.offset + len).toString('utf8');
  cur.offset += len;
  return s;
}

/** Decode a WireToken from CBOR bytes. Strict — rejects unknown keys and wrong types. */
export function decodeCbor(buf: Buffer): WireToken {
  const cur: Cursor = { offset: 0 };
  const head = readHead(buf, cur);
  if (head.major !== 5) throw new Error(`decodeCbor: expected map at root, got major ${head.major}`);
  const entryCount = head.value;
  if (entryCount < 4 || entryCount > 5) {
    throw new Error(`decodeCbor: expected 4 or 5 map entries, got ${entryCount}`);
  }

  let sid: Buffer | null = null;
  let seq: number | null = null;
  let ts: number | null = null;
  let bcp: string | undefined;
  let sh: Buffer | null = null;

  for (let i = 0; i < entryCount; i += 1) {
    const keyHead = readHead(buf, cur);
    if (keyHead.major !== 0) throw new Error(`decodeCbor: expected uint key, got major ${keyHead.major}`);
    const key = keyHead.value;
    const valHead = readHead(buf, cur);
    switch (key) {
      case 1: {
        if (valHead.major !== 2) throw new Error('decodeCbor: sid must be byte string');
        if (valHead.value !== 16) throw new Error(`decodeCbor: sid must be 16 bytes, got ${valHead.value}`);
        sid = readBytes(buf, cur, valHead.value);
        break;
      }
      case 2: {
        if (valHead.major !== 0) throw new Error('decodeCbor: seq must be uint');
        seq = valHead.value;
        break;
      }
      case 3: {
        if (valHead.major !== 0) throw new Error('decodeCbor: ts must be uint');
        ts = valHead.value;
        break;
      }
      case 4: {
        if (valHead.major !== 3) throw new Error('decodeCbor: bcp must be text string');
        bcp = readText(buf, cur, valHead.value);
        break;
      }
      case 5: {
        if (valHead.major !== 2) throw new Error('decodeCbor: sh must be byte string');
        if (valHead.value !== 16) throw new Error(`decodeCbor: sh must be 16 bytes, got ${valHead.value}`);
        sh = readBytes(buf, cur, valHead.value);
        break;
      }
      default:
        throw new Error(`decodeCbor: unknown map key ${key}`);
    }
  }

  if (cur.offset !== buf.length) {
    throw new Error(`decodeCbor: trailing bytes after payload (${buf.length - cur.offset} bytes)`);
  }
  if (sid === null) throw new Error('decodeCbor: missing required field sid');
  if (seq === null) throw new Error('decodeCbor: missing required field seq');
  if (ts === null) throw new Error('decodeCbor: missing required field ts');
  if (sh === null) throw new Error('decodeCbor: missing required field sh');

  return bcp !== undefined ? { sid, seq, ts, bcp, sh } : { sid, seq, ts, sh };
}

/** Encode a WireToken to its on-the-wire string: base64url(cbor) "." base64url(hmac). */
export async function encodeWireToken(t: WireToken): Promise<string> {
  const payload = encodeCbor(t);
  const key = await getOrCreateServerKey();
  const sigHex = hmacSign(payload.toString('base64url'), key);
  const sig = Buffer.from(sigHex, 'hex').toString('base64url');
  return `${payload.toString('base64url')}.${sig}`;
}

/** Decode and HMAC-verify a wire token string. Throws on any failure. */
export async function decodeWireToken(token: string): Promise<WireToken> {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) {
    throw new Error(
      'Invalid session token: the token is malformed (missing signature segment). ' +
      'A valid session token must contain a "." separator between the payload and HMAC signature. ' +
      'To resolve this, call start_session to obtain a fresh session token.'
    );
  }
  const payloadB64 = token.substring(0, dotIndex);
  const sigB64 = token.substring(dotIndex + 1);
  const sigBytes = Buffer.from(sigB64, 'base64url');
  if (sigBytes.length !== 32) {
    throw new Error(
      'Invalid session token: signature has unexpected length. ' +
      'Expected a 32-byte HMAC-SHA-256 (44-char base64url). ' +
      'To resolve this, call start_session to obtain a fresh session token.'
    );
  }
  const key = await getOrCreateServerKey();
  if (!hmacVerify(payloadB64, sigBytes.toString('hex'), key)) {
    throw new Error(
      'Invalid session token: HMAC signature verification failed. ' +
      'The token was either signed by a different server instance (e.g., the server was restarted and generated a new signing key), ' +
      'or the token has been tampered with, or you are using a stale token from a previous session. ' +
      'To resolve this, call start_session to obtain a fresh session token. ' +
      'If you are passing a checkpoint_handle (from yield_checkpoint), you must re-yield the checkpoint first to get a valid handle.'
    );
  }
  const payload = Buffer.from(payloadB64, 'base64url');
  return decodeCbor(payload);
}

/**
 * Decode a wire token WITHOUT verifying the HMAC signature.
 * Used by start_session's adoption path when the HMAC key has changed.
 * Returns null if the payload is structurally invalid.
 */
export function decodeWireTokenUnverified(token: string): WireToken | null {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return null;
  const payloadB64 = token.substring(0, dotIndex);
  try {
    const payload = Buffer.from(payloadB64, 'base64url');
    return decodeCbor(payload);
  } catch {
    return null;
  }
}
