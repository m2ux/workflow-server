import { describe, it, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import {
  encodeCbor,
  decodeCbor,
  encodeWireToken,
  decodeWireToken,
  decodeWireTokenUnverified,
  type WireToken,
} from '../src/utils/wire-token.js';

function mkToken(overrides: Partial<WireToken> = {}): WireToken {
  const base: WireToken = {
    sid: randomBytes(16),
    seq: 0,
    ts: 1700000000,
    sh: randomBytes(16),
  };
  return { ...base, ...overrides };
}

describe('wire-token CBOR codec', () => {
  it('round-trips a minimal token without bcp', () => {
    const t = mkToken();
    const encoded = encodeCbor(t);
    const decoded = decodeCbor(encoded);
    expect(decoded.sid).toEqual(t.sid);
    expect(decoded.seq).toBe(t.seq);
    expect(decoded.ts).toBe(t.ts);
    expect(decoded.bcp).toBeUndefined();
    expect(decoded.sh).toEqual(t.sh);
  });

  it('round-trips a token with bcp', () => {
    const t = mkToken({ bcp: 'file-index-table', seq: 47 });
    const encoded = encodeCbor(t);
    const decoded = decodeCbor(encoded);
    expect(decoded.bcp).toBe('file-index-table');
    expect(decoded.seq).toBe(47);
  });

  it('encodes 5-entry map when bcp present, 4-entry when absent', () => {
    const withBcp = encodeCbor(mkToken({ bcp: 'cp-1' }));
    const withoutBcp = encodeCbor(mkToken());
    expect(withBcp[0]).toBe(0xa5);
    expect(withoutBcp[0]).toBe(0xa4);
  });

  it('omits empty-string bcp from encoded form', () => {
    const t = mkToken({ bcp: '' });
    const encoded = encodeCbor(t);
    expect(encoded[0]).toBe(0xa4);
    expect(decodeCbor(encoded).bcp).toBeUndefined();
  });

  it('rejects sid that is not exactly 16 bytes', () => {
    expect(() => encodeCbor(mkToken({ sid: randomBytes(15) }))).toThrow(/sid must be 16 bytes/);
    expect(() => encodeCbor(mkToken({ sid: randomBytes(17) }))).toThrow(/sid must be 16 bytes/);
  });

  it('rejects sh that is not exactly 16 bytes', () => {
    expect(() => encodeCbor(mkToken({ sh: randomBytes(15) }))).toThrow(/sh must be 16 bytes/);
  });

  it('encodes seq using the smallest CBOR uint form', () => {
    // seq=0 → 1 byte (head 0x02 + value 0x00 inline)
    const small = encodeCbor(mkToken({ seq: 0 }));
    // seq=300 → uint16
    const medium = encodeCbor(mkToken({ seq: 300 }));
    // seq=70000 → uint32
    const large = encodeCbor(mkToken({ seq: 70000 }));
    expect(small.length).toBeLessThan(medium.length);
    expect(medium.length).toBeLessThan(large.length);
  });

  it('decodes uint values across all CBOR length classes', () => {
    for (const seq of [0, 23, 24, 255, 256, 65535, 65536, 1000000]) {
      const decoded = decodeCbor(encodeCbor(mkToken({ seq })));
      expect(decoded.seq).toBe(seq);
    }
  });

  it('rejects trailing bytes after the map', () => {
    const valid = encodeCbor(mkToken());
    const withTrailer = Buffer.concat([valid, Buffer.from([0x00])]);
    expect(() => decodeCbor(withTrailer)).toThrow(/trailing bytes/);
  });

  it('rejects truncated input', () => {
    const valid = encodeCbor(mkToken());
    expect(() => decodeCbor(valid.subarray(0, valid.length - 1))).toThrow();
  });

  it('rejects unknown map keys', () => {
    // Hand-craft a payload: 5-entry map with key 99 instead of key 4.
    const sid = randomBytes(16);
    const sh = randomBytes(16);
    const bad = Buffer.concat([
      Buffer.from([0xa5]),               // map(5)
      Buffer.from([0x01, 0x50]), sid,    // key 1 → sid
      Buffer.from([0x02, 0x00]),         // key 2 → seq 0
      Buffer.from([0x03, 0x1a, 0x00, 0x00, 0x00, 0x00]), // key 3 → ts 0
      Buffer.from([0x18, 99, 0x60]),     // key 99 → empty text
      Buffer.from([0x05, 0x50]), sh,     // key 5 → sh
    ]);
    expect(() => decodeCbor(bad)).toThrow(/unknown map key/);
  });

  it('encoded payload is significantly smaller than the legacy JSON form', () => {
    // Worst-case: bcp present, large seq, full ts.
    const t = mkToken({ bcp: 'file-index-table', seq: 999, ts: 1778255009 });
    const encoded = encodeCbor(t);
    // Legacy payload at this fill: ~280 bytes JSON. CBOR should be well under 80.
    expect(encoded.length).toBeLessThan(80);
  });
});

describe('encodeWireToken / decodeWireToken (HMAC envelope)', () => {
  it('round-trips a signed token', async () => {
    const t = mkToken({ bcp: 'cp-1', seq: 5 });
    const wire = await encodeWireToken(t);
    expect(wire).toContain('.');
    const decoded = await decodeWireToken(wire);
    expect(decoded.sid).toEqual(t.sid);
    expect(decoded.seq).toBe(5);
    expect(decoded.bcp).toBe('cp-1');
    expect(decoded.sh).toEqual(t.sh);
  });

  it('signature is base64url-encoded (43 chars, no = padding)', async () => {
    const wire = await encodeWireToken(mkToken());
    const sig = wire.split('.')[1]!;
    expect(sig.length).toBe(43);
    expect(sig).not.toContain('=');
    expect(sig).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('wire form is materially shorter than the legacy ~480-char target', async () => {
    const wire = await encodeWireToken(mkToken({ bcp: 'file-index-table', seq: 47 }));
    expect(wire.length).toBeLessThan(200);
  });

  it('rejects a token missing the dot separator', async () => {
    await expect(decodeWireToken('no-separator')).rejects.toThrow(/missing signature segment/);
  });

  it('rejects a token whose signature has wrong length', async () => {
    const wire = await encodeWireToken(mkToken());
    const [payload] = wire.split('.');
    await expect(decodeWireToken(`${payload}.shortsig`)).rejects.toThrow(/unexpected length/);
  });

  it('rejects a token with a tampered payload (HMAC fails)', async () => {
    const wire = await encodeWireToken(mkToken({ seq: 1 }));
    const [payloadB64, sig] = wire.split('.');
    // Flip a byte in the middle of the payload.
    const bytes = Buffer.from(payloadB64!, 'base64url');
    bytes[Math.floor(bytes.length / 2)] ^= 0x01;
    const tampered = `${bytes.toString('base64url')}.${sig}`;
    await expect(decodeWireToken(tampered)).rejects.toThrow(/HMAC signature verification failed/);
  });

  it('rejects a token with a forged signature', async () => {
    const wire = await encodeWireToken(mkToken());
    const [payloadB64] = wire.split('.');
    const forged = Buffer.alloc(32).toString('base64url');
    await expect(decodeWireToken(`${payloadB64}.${forged}`)).rejects.toThrow(/HMAC signature verification failed/);
  });
});

describe('decodeWireTokenUnverified', () => {
  it('decodes without checking the signature', async () => {
    const t = mkToken({ seq: 9 });
    const wire = await encodeWireToken(t);
    const decoded = decodeWireTokenUnverified(wire);
    expect(decoded).not.toBeNull();
    expect(decoded!.seq).toBe(9);
  });

  it('still returns the payload when the signature is bad', async () => {
    const wire = await encodeWireToken(mkToken({ seq: 9 }));
    const [payloadB64] = wire.split('.');
    const decoded = decodeWireTokenUnverified(`${payloadB64}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`);
    expect(decoded).not.toBeNull();
    expect(decoded!.seq).toBe(9);
  });

  it('returns null on garbage input', () => {
    expect(decodeWireTokenUnverified('no-dot')).toBeNull();
    expect(decodeWireTokenUnverified('!!!.@@@')).toBeNull();
  });
});
