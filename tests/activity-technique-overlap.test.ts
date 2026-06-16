import { describe, it, expect } from 'vitest';
import { collectActivityTechniqueOverlapViolations } from '../scripts/check-activity-technique-overlap.js';

/**
 * AP-69 guard: an activity's top-level `techniques[]` (cross-cutting strategy techniques that
 * support the agent across the activity) must not re-list a technique that one of the activity's
 * own steps already binds via `step.technique`. The step binding is the authoritative declaration;
 * duplicating it at the activity level is redundant. Hard-zero rule: a failure means a workflow
 * change reintroduced the overlap — remove it from the activity-level list.
 */
describe('activity/step technique overlap (AP-69) guard', () => {
  it('no activity-level technique duplicates a step binding', () => {
    expect(collectActivityTechniqueOverlapViolations().map((v) => `${v.site} — ${v.detail}`)).toEqual([]);
  });
});
