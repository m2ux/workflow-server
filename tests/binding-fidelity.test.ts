import { describe, it, expect } from 'vitest';
import { diffBaseline } from '../scripts/check-binding-fidelity.js';

/**
 * Drift guard: the workflow corpus must introduce no binding-fidelity violations beyond the
 * committed baseline (scripts/binding-fidelity-baseline.json). A failure here means a workflow
 * change added a stale `step.technique.inputs`/`outputs` key or a {read} with no producer. Fix it, or — if the
 * change is intentional and reviewed — run `npx tsx scripts/check-binding-fidelity.ts
 * --update-baseline` to re-snapshot.
 */
describe('binding-fidelity drift guard', () => {
  const { added } = diffBaseline();

  it('introduces no NEW binding-fidelity violations beyond the baseline', () => {
    expect(added.map((v) => `[${v.check}] ${v.site} — ${v.detail}`)).toEqual([]);
  });
});
