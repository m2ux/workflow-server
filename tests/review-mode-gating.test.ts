import { describe, it, expect } from 'vitest';
import { diffBaseline } from '../scripts/check-review-mode-gating.js';

/**
 * Review-mode friction guard: a workflow with a review mode must introduce no NEW checkpoint that
 * is reachable while is_review_mode == true, is not mode-aware, and auto-advances to a consequential
 * (effect-bearing) default — the spurious "silently take the create action" prompt the work-package
 * review-mode optimisation removed. Beyond the committed baseline
 * (scripts/review-mode-gating-baseline.json) the set must be empty. If a change is intentional and
 * reviewed, re-snapshot with `npx tsx scripts/check-review-mode-gating.ts --update-baseline`.
 */
describe('review-mode-gating drift guard', () => {
  const { added } = diffBaseline();

  it('introduces no NEW review-reachable create-default checkpoints beyond the baseline', () => {
    expect(added.map((v) => `${v.key} — ${v.detail}`)).toEqual([]);
  });
});
