import { describe, it, expect } from 'vitest';
import { collectAuthoredArtifacts } from '../scripts/check-artifact-description.js';

/**
 * AP-65 guard: activities do not declare `artifacts[]`. The artifact contract is synthesized by the
 * server from the `## Outputs` of the techniques an activity's steps bind (the technique outputs own
 * artifact identity, AP-43). Hard-zero: no activity `.yaml` may carry an `artifacts` block. If this
 * fails, delete the authored `artifacts[]` (and, if the producing technique doesn't declare the
 * artifact, add a `#### artifact` to that technique's output instead).
 */
describe('authored-artifacts guard (AP-65)', () => {
  it('no activity declares an artifacts[] block', () => {
    expect(collectAuthoredArtifacts().map((h) => `${h.where} (${h.count})`)).toEqual([]);
  });
});
