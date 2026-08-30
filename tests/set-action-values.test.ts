import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-set-action-values.js';

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

/** A corpus root holding one activity whose `steps:` block is given verbatim, at a chosen depth. */
function rootWithSteps(steps: string, subdir = ''): string {
  const root = mkdtempSync(join(tmpdir(), 'set-values-steps-'));
  roots.push(root);
  const dir = join(root, 'demo', 'activities', ...(subdir ? [subdir] : []));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, '01-demo.yaml'), ['id: demo', 'name: Demo', 'steps:', steps, 'transitions: []', ''].join('\n'));
  return root;
}

const stepChecks = (steps: string, subdir = ''): string[] =>
  collectFindings(rootWithSteps(steps, subdir)).map((f) => f.check);

describe('set action values', () => {
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
      // A bare enum word. Checkpoints write these to the same variables, so refusing them here would
      // make the identical assignment legal in one place and a finding in the other.
      '      - action: set\n        target: pipeline_mode\n        value: single',
      '      - action: set\n        target: a\n        value: create',
      '      - action: set\n        target: a\n        value: completion',
      // A filename, whose extension would otherwise read as a dotted projection of a bag name.
      '      - action: set\n        target: a\n        value: overview.md',
      '      - action: set\n        target: a\n        value: plan.json',
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

  it('marks a bag name by its shape, so padding and casing cannot hide one', () => {
    // Trimmed before it is read, or a space either side would carry a reference straight through.
    expect(checks('      - action: set\n        target: a\n        value: " worker_result "'))
      .toEqual(['unbraced-reference']);
    // Any one of the three marks is enough: an underscore, a capital, or a dotted projection.
    expect(checks('      - action: set\n        target: a\n        value: someActivity'))
      .toEqual(['unbraced-reference']);
    expect(checks('      - action: set\n        target: a\n        value: a.b')).toEqual(['unbraced-reference']);
  });

  it('reads a checkpoint effect too, which writes the bag under the same convention', () => {
    // `setVariable` is the one engine-applied effect, and a bare name means the same wrong thing there.
    const checkpoint = (value: string): string => [
      '  - kind: checkpoint',
      '    id: choose',
      '    checkpoint:',
      '      options:',
      '        - label: Pick',
      '          effect:',
      '            setVariable:',
      `              pipeline_mode: ${value}`,
    ].join('\n');
    expect(stepChecks(checkpoint('client_session_index'))).toEqual(['unbraced-reference']);
    // And the enum word the corpus writes there 49 times over stays legitimate.
    expect(stepChecks(checkpoint('single'))).toEqual([]);
    expect(stepChecks(checkpoint('"{worker_result.next_activity_id}"'))).toEqual([]);
  });

  it('reads a definition nested below the activities directory', () => {
    // Five real definitions sit a level down, and a flat read leaves them unscanned while the
    // scanned-count floor still passes on the rest.
    const nested = '  - kind: action\n    id: w\n    actions:\n      - action: set\n'
      + '        target: a\n        value: client_session_index';
    expect(stepChecks(nested, 'patterns')).toEqual(['unbraced-reference']);
  });

  it('reads set actions wherever they nest, and ignores other action kinds', () => {
    // A validate action carries a message and no target, which is correct for its kind. Its value is
    // name-shaped on purpose: without that, the kind filter is pinned by nothing but today's corpus.
    expect(checks('      - action: validate\n        target: x\n        message: Needs x'))
      .toEqual([]);
    expect(checks('      - action: log\n        value: worker_result')).toEqual([]);
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

  it('flags a value the target variable does not admit', () => {
    const root = mkdtempSync(join(tmpdir(), 'set-values-set-'));
    roots.push(root);
    const dir = join(root, 'demo', 'activities');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(root, 'demo', 'workflow.yaml'), [
      'id: demo', 'version: 1.0.0', 'title: Demo', 'variables:',
      '  - name: operation_type', '    type: string',
      '    values:', '      - create', '      - review', '',
    ].join('\n'));
    const activity = (value: string): string => [
      'id: demo', 'name: Demo', 'steps:',
      '  - kind: action', '    id: choose', '    actions:',
      '      - action: set', '        target: operation_type', `        value: ${value}`, '',
    ].join('\n');

    writeFileSync(join(dir, '01-demo.yaml'), activity('audit'));
    expect(collectFindings(root).map((f) => f.check)).toEqual(['value-outside-declared-set']);

    // A member passes, and a braced reference is resolved agent-side so the set cannot judge it.
    writeFileSync(join(dir, '01-demo.yaml'), activity('review'));
    expect(collectFindings(root)).toEqual([]);
    writeFileSync(join(dir, '01-demo.yaml'), activity('"{chosen_operation}"'));
    expect(collectFindings(root)).toEqual([]);
  });

  it('refuses to call an empty corpus clean', () => {
    // Nothing scanned and nothing wrong look identical in a hard-zero guard.
    expect(() => collectFindings(mkdtempSync(join(tmpdir(), 'set-values-empty-')))).toThrow();
  });
});
