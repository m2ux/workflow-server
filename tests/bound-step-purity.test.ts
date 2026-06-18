import { describe, it, expect } from 'vitest';
import { collectStepPurityViolations } from '../scripts/check-bound-step-purity.js';

/**
 * AP-64 guard: no step in any workflow may carry a `name` or `description`. A step is a pure
 * binding — `id` + `technique` (when bound) + structural fields. WHAT/HOW live in the bound
 * operation's Capability/Protocol; a control step's meaning is its `actions`. This is a hard-zero
 * rule: a failure means a workflow change reintroduced a step name/description. Remove it.
 */
describe('bound-step purity (AP-64) guard', () => {
  it('no step carries name or description', () => {
    expect(collectStepPurityViolations().map((v) => `${v.site} — ${v.detail}`)).toEqual([]);
  });
});
