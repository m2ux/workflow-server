import { describe, it, expect } from 'vitest';
import { collectFindings } from '../scripts/check-bootstrap-self-contained.js';

/**
 * Bootstrap self-containment guard: the text `discover` returns before a session exists must send the
 * reader nowhere they cannot go. With no `session_index` there is no `get_resource` and no
 * `get_activity`, so a relative corpus link or a dotted rule address in that text is an instruction
 * with no way to follow it. Everywhere else, citing the home rather than restating it is the right
 * economy; on this one surface it strands the reader. Hard-zero: inline the substance and keep the
 * name only as a label for after the operations bundle arrives.
 */
describe('bootstrap self-containment guard', () => {
  it('the pre-session bootstrap text sends the reader nowhere it cannot go', () => {
    expect(collectFindings().map((f) => `[${f.check}] ${f.site} — ${f.detail}`)).toEqual([]);
  });
});
