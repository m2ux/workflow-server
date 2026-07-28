import { describe, it, expect } from 'vitest';
import { collectFindings } from '../scripts/check-identifier-qualification.js';

/**
 * Identifier-qualification gate (AP-60 sub-rule 3), markdown surface: every technique top-level `###`
 * I/O id is a qualified noun phrase. Hard zero — the corpus is fully qualified, so the retired
 * baseline is gone (#327 R5).
 *
 * A bare id is unbindable as well as unclear: `VariableNameSchema` rejects the same spelling on the
 * producing side, so an unqualified input can never be seeded by name. Qualify it (>=2 words, head
 * noun last), or — if it is genuinely exempt (plural item-noun / external-tool-or-param mirror /
 * `_type`-`_mode`-`kind` discriminator) — add it to EXEMPT_DATA_IDS in src/schema/identifiers.ts with
 * its reason, which the schema shares.
 */
describe('identifier-qualification gate', () => {
  it('declares no bare single-word data id', () => {
    expect(collectFindings().map((f) => f.detail)).toEqual([]);
  });
});
