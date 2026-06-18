import { describe, it, expect } from 'vitest';
import { diffBaseline } from '../scripts/check-identifier-qualification.js';

/**
 * Identifier-qualification drift guard (AP-60 sub-rule 3): the corpus must introduce no NEW bare
 * single-word data ids beyond the committed baseline (scripts/identifier-qualification-baseline.json).
 * A failure means a workflow variable or technique top-level `###` I/O id was added as a bare single
 * word. Qualify it (a >=2-word noun phrase, head noun last), or — if it is genuinely AP-60-exempt
 * (plural item-noun / external-tool-or-param mirror / `_type`-`_mode`-`kind` discriminator) — add it
 * to EXEMPT in the guard. The baseline is the pre-existing work-list to qualify down over time;
 * after qualifying or exempting, run `npx tsx scripts/check-identifier-qualification.ts --update-baseline`.
 */
describe('identifier-qualification drift guard', () => {
  const { added } = diffBaseline();

  it('introduces no NEW bare single-word data ids beyond the baseline', () => {
    expect(added).toEqual([]);
  });
});
