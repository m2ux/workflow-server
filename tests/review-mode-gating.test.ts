import { describe, it, expect } from 'vitest';
import { ACCEPTED_HEADLESS_AUTO_ADVANCE } from '../scripts/check-review-mode-gating.js';

/**
 * The corpus is held at zero by the `review-mode-gating` guard, which also reports an acceptance
 * matching no checkpoint. What the guard does not read is whether an acceptance states why it is
 * safe, so that is what this asserts.
 */
describe('review-mode-gating acceptances', () => {
  it('gives every acceptance a non-empty reason', () => {
    const reasonless = Object.entries(ACCEPTED_HEADLESS_AUTO_ADVANCE)
      .filter(([, reason]) => reason.trim().length === 0)
      .map(([key]) => key);
    expect(reasonless).toEqual([]);
  });
});
