import { describe, it, expect } from 'vitest';
import { collectSelfProvisionedInputViolations } from '../scripts/check-self-provisioned-input.js';

/**
 * AP-68 guard: no step may provision its own technique input. A step's bound technique resolves its
 * `inputs` at invocation; the step's own `set` actions are side-effects of the same step, with no
 * ordering guarantee between them. A technique input that interpolates a variable the same step
 * `set`s is therefore a self-reference / ordering hazard — the derivation belongs upstream of the
 * consumer. This is a hard-zero rule: a failure means a workflow change reintroduced the shape.
 */
describe('self-provisioned input (AP-68) guard', () => {
  it('no step interpolates its own set target into its technique inputs', () => {
    expect(collectSelfProvisionedInputViolations().map((v) => `${v.site} — ${v.detail}`)).toEqual([]);
  });
});
