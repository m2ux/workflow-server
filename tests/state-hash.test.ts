import { describe, it, expect } from 'vitest';
import { computeStateHash, type SessionRecord } from '../src/utils/state-hash.js';

function mkRecord(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    wf: 'work-package',
    act: 'plan-prepare',
    v: '3.7.0',
    aid: 'orchestrator',
    createdAt: 1700000000,
    updatedAt: 1700000010,
    ...overrides,
  };
}

describe('computeStateHash', () => {
  it('returns a 16-byte buffer', () => {
    const h = computeStateHash(mkRecord(), 0);
    expect(Buffer.isBuffer(h)).toBe(true);
    expect(h.length).toBe(16);
  });

  it('is deterministic for the same input', () => {
    const r = mkRecord();
    const h1 = computeStateHash(r, 5);
    const h2 = computeStateHash(r, 5);
    expect(h1).toEqual(h2);
  });

  it('changes when any record field changes', () => {
    const base = computeStateHash(mkRecord(), 0);
    expect(computeStateHash(mkRecord({ wf: 'other' }), 0)).not.toEqual(base);
    expect(computeStateHash(mkRecord({ act: 'other' }), 0)).not.toEqual(base);
    expect(computeStateHash(mkRecord({ v: '4.0.0' }), 0)).not.toEqual(base);
    expect(computeStateHash(mkRecord({ aid: 'worker-1' }), 0)).not.toEqual(base);
    expect(computeStateHash(mkRecord({ updatedAt: 1700000099 }), 0)).not.toEqual(base);
  });

  it('changes when seq changes even if record is identical', () => {
    const r = mkRecord();
    const h0 = computeStateHash(r, 0);
    const h1 = computeStateHash(r, 1);
    expect(h0).not.toEqual(h1);
  });

  it('distinguishes "field absent" from "field empty"', () => {
    const noParent = computeStateHash(mkRecord(), 0);
    const withParent = computeStateHash(mkRecord({ psid: '' }), 0);
    expect(noParent).not.toEqual(withParent);
  });

  it('distinguishes different parent contexts', () => {
    const a = computeStateHash(mkRecord({ psid: 'A', pwf: 'meta', pact: 'x', pv: '1' }), 0);
    const b = computeStateHash(mkRecord({ psid: 'B', pwf: 'meta', pact: 'x', pv: '1' }), 0);
    expect(a).not.toEqual(b);
  });

  it('is order-independent on record-key construction (canonicalization)', () => {
    // Construct two records with same data, different property insertion order.
    const r1: SessionRecord = {
      wf: 'x', act: 'y', v: '1', aid: 'o',
      createdAt: 1, updatedAt: 2,
      psid: 'p', pwf: 'w', pact: 'a', pv: 'v',
    };
    const r2: SessionRecord = {
      pv: 'v', pact: 'a', pwf: 'w', psid: 'p',
      updatedAt: 2, createdAt: 1,
      aid: 'o', v: '1', act: 'y', wf: 'x',
    };
    expect(computeStateHash(r1, 0)).toEqual(computeStateHash(r2, 0));
  });

  it('handles JSON-special characters in values without collision', () => {
    const a = computeStateHash(mkRecord({ wf: 'a|b' }), 0);
    const b = computeStateHash(mkRecord({ wf: 'a', act: 'b|plan-prepare' }), 0);
    expect(a).not.toEqual(b);
  });
});
