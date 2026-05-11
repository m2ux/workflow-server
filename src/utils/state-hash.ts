import { createHash } from 'node:crypto';

/**
 * Server-side session state, stored in SessionStore and bound to a sid.
 *
 * The token's `sh` field is a hash over this record + seq; the agent
 * cannot present a token whose `sh` disagrees with the live record, so
 * any drift between the record and the token is detected at verification.
 *
 * Dead fields from the legacy payload (skill, cond) are deliberately absent.
 */
export interface SessionRecord {
  wf: string;
  act: string;
  v: string;
  aid: string;
  psid?: string;
  pwf?: string;
  pact?: string;
  pv?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 16-byte (128-bit) truncated SHA-256 of the canonicalized record and seq.
 *
 * Canonical form: keys sorted lexicographically, each emitted as `${key}=${JSON.stringify(value)}`,
 * joined by `|`. The seq is appended as a separate update so that two records
 * differing only by seq still hash differently.
 *
 * 128 bits is sufficient for integrity verification under the HMAC envelope:
 * the HMAC is the unforgeability boundary, and `sh` only needs to be wide enough
 * that accidental collisions between server-side record snapshots are negligible.
 */
export function computeStateHash(record: SessionRecord, seq: number): Buffer {
  const keys = (Object.keys(record) as Array<keyof SessionRecord>).sort();
  const parts: string[] = [];
  for (const k of keys) {
    const v = record[k];
    if (v === undefined) continue;
    parts.push(`${k}=${JSON.stringify(v)}`);
  }
  const canonical = parts.join('|');
  return createHash('sha256')
    .update(canonical)
    .update('|seq=')
    .update(String(seq))
    .digest()
    .subarray(0, 16);
}
