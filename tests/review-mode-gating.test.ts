import { describe, it, expect } from 'vitest';
import { ACCEPTED_HEADLESS_AUTO_ADVANCE, collectFindings, collectReviewGatingViolations } from '../scripts/check-review-mode-gating.js';

/**
 * Review-mode gate: a workflow with a review mode must have no checkpoint that is reachable while
 * `is_review_mode == true`, is not mode-aware, and auto-advances to a consequential default — unless
 * that instance is listed in `ACCEPTED_HEADLESS_AUTO_ADVANCE` with the reason it is safe.
 *
 * The reasoned list replaces the retired baseline JSON. It is hand-written, has no regenerate
 * command, and a stale entry fails the guard, so an accepted instance cannot quietly become a real
 * defect the way two baselined entries did (they auto-created GitHub/Jira issues in a headless run).
 */
describe('review-mode-gating gate', () => {
  it('has no unaccepted review-reachable mutating default, and no stale acceptance', () => {
    expect(collectFindings().map((v) => `[${v.check}] ${v.site} — ${v.detail}`)).toEqual([]);
  });

  it('gives every acceptance a non-empty reason', () => {
    const reasonless = Object.entries(ACCEPTED_HEADLESS_AUTO_ADVANCE)
      .filter(([, reason]) => reason.trim().length === 0)
      .map(([key]) => key);
    expect(reasonless).toEqual([]);
  });

  it('accepts only instances the guard actually reports', () => {
    const reported = new Set(collectReviewGatingViolations().map((v) => v.key));
    const notReported = Object.keys(ACCEPTED_HEADLESS_AUTO_ADVANCE).filter((k) => !reported.has(k));
    expect(notReported).toEqual([]);
  });
});
