import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-set-action-values.js';
import { corpusRoot } from './corpus-root.js';

/**
 * A `set` action writes somewhere, and braces what it reads.
 *
 * Two ways one looks right and does nothing. With no `target` it writes nowhere. And a `value` naming
 * another variable has to be braced, because an unbraced one is the literal string — the two spellings
 * are a character apart and read identically. `value: initialActivity` passed for a reference to the
 * workflow's first activity until the word itself reached the server as an activity id.
 *
 * Hard-zero, and the real corpus already satisfies it. Since that leaves the live tree unable to show
 * the checks still work, the synthetic roots below carry each fault and each near-miss.
 */

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

/** A corpus root holding one activity whose single step carries `actions`. */
function rootWith(actions: string): string {
  const root = mkdtempSync(join(tmpdir(), 'set-values-'));
  roots.push(root);
  const dir = join(root, 'demo', 'activities');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, '01-demo.yaml'),
    ['id: demo', 'name: Demo', 'steps:', '  - kind: action', '    id: write-something',
      '    actions:', actions, 'transitions: []', ''].join('\n'),
  );
  return root;
}

const checks = (actions: string): string[] => collectFindings(rootWith(actions)).map((f) => f.check);

describe('set action values', () => {
  it('every set action in the corpus names where it writes, and braces what it reads', () => {
    expect(collectFindings(corpusRoot()).map((f) => `[${f.check}] ${f.site} — ${f.detail}`)).toEqual([]);
  });

  it('refuses a set action with nowhere to write', () => {
    // The shape three of these wore in the corpus: plainly a target and a value, writing neither.
    expect(checks('      - action: set\n        message: reconnaissance_complete=true'))
      .toEqual(['set-without-target']);
    expect(checks('      - action: set\n        value: true')).toEqual(['set-without-target']);
    expect(checks('      - action: set\n        target: ""\n        value: true'))
      .toEqual(['set-without-target']);
  });

  it('refuses a value shaped like a variable but written bare', () => {
    // The fault itself, in the spelling it had, and in the corpus's own snake_case.
    expect(checks('      - action: set\n        target: current_activity\n        value: initialActivity'))
      .toEqual(['unbraced-reference']);
    expect(checks('      - action: set\n        target: a\n        value: client_session_index'))
      .toEqual(['unbraced-reference']);
    // A dotted projection reads as a name too.
    expect(checks('      - action: set\n        target: a\n        value: worker_result.next_activity_id'))
      .toEqual(['unbraced-reference']);
  });

  it('leaves alone the forms a set action legitimately takes', () => {
    // Braced references, every literal kind the corpus actually uses, and no value at all — which is
    // the agent-derived form and the majority of them.
    const fine = [
      '      - action: set\n        target: a\n        value: "{worker_result.next_activity_id}"',
      '      - action: set\n        target: a\n        value: "{output_path}/{current_group.subdir}"',
      '      - action: set\n        target: a\n        value: true',
      '      - action: set\n        target: a\n        value: false',
      '      - action: set\n        target: a\n        value: null',
      '      - action: set\n        target: a\n        value: 3',
      '      - action: set\n        target: a\n        value: "[]"',
      // Hyphenated, which is how this corpus writes a literal — an activity id is a value, not a name.
      '      - action: set\n        target: a\n        value: plan-prepare',
      '      - action: set\n        target: a\n        description: The agent supplies it.',
    ];
    for (const actions of fine) expect(checks(actions), actions).toEqual([]);
  });

  it('reads set actions wherever they nest, and ignores other action kinds', () => {
    // A validate action carries a message and no target, which is correct for its kind.
    expect(checks('      - action: validate\n        target: x\n        message: Needs x'))
      .toEqual([]);
    expect(checks('      - action: set\n        target: a\n        value: bare_name\n'
      + '      - action: validate\n        target: x\n        message: Needs x'))
      .toEqual(['unbraced-reference']);
    // Inside a loop body, which is where the client dispatch loop keeps its own pointer write.
    const root = mkdtempSync(join(tmpdir(), 'set-values-nested-'));
    roots.push(root);
    const dir = join(root, 'demo', 'activities');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, '01-demo.yaml'), [
      'id: demo', 'name: Demo', 'steps:',
      '  - kind: loop', '    id: walk', '    loopType: while', '    maxIterations: 5',
      '    steps:', '      - kind: action', '        id: advance',
      '        actions:', '          - action: set',
      '            target: current_activity', '            value: nested_bare_name',
      'transitions: []', '',
    ].join('\n'));
    expect(collectFindings(root).map((f) => f.check)).toEqual(['unbraced-reference']);
  });

  it('refuses to call an empty corpus clean', () => {
    // Nothing scanned and nothing wrong look identical in a hard-zero guard.
    expect(() => collectFindings(mkdtempSync(join(tmpdir(), 'set-values-empty-')))).toThrow();
  });
});
