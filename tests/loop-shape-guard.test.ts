import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { declareFixtureWorkflows } from './corpus-fixture.js';
import { collectFindings } from '../guards/check-loop-shape.js';

/**
 * A loop declares the fields its iteration type uses, and a gate in its body asks once per round.
 *
 * An item loop is bounded by its collection and states no continuation test; a repeat-until loop is
 * bounded by its test and iterates no collection. A checkpoint in either body carries a
 * discriminator, so each round records an answer of its own rather than replaying the first. The
 * corpus satisfies all three, which is what leaves the live tree unable to show that the checks
 * still bite — so the synthetic roots below carry each fault and the shape it is a fault against.
 */

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

const ACTION_BODY = ['      - kind: action', '        id: do-something'].join('\n');

/** A corpus root holding one activity whose single step is the given loop, over the given body. */
function rootWithLoop(loop: string, body: string = ACTION_BODY): string {
  const root = mkdtempSync(join(tmpdir(), 'loop-shape-'));
  roots.push(root);
  const dir = join(root, 'demo', 'activities');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, '01-demo.yaml'),
    ['id: demo', 'name: Demo', 'steps:', loop, '    steps:', body,
      'transitions: []', ''].join('\n'),
  );
  return declareFixtureWorkflows(root);
}

/** A checkpoint body under the given id, with the two options a gate needs. */
const gateBody = (id: string): string => [
  '      - kind: checkpoint', `        id: ${id}`,
  '        message: Decide.', '        options:',
  '          - id: go', '            label: Go',
  '          - id: stop', '            label: Stop',
].join('\n');

const checks = (loop: string, body?: string): string[] =>
  collectFindings(rootWithLoop(loop, body)).map((f) => f.check);

const ITEM_LOOP = ['  - kind: loop', '    id: item-cycle', '    loopType: forEach',
  '    variable: current_item', '    over: work_items'].join('\n');
const REPEAT_LOOP = ['  - kind: loop', '    id: fix-cycle', '    loopType: doWhile',
  '    continueWhile:', '      type: simple', '      variable: needs_fixes',
  '      operator: "=="', '      value: true'].join('\n');

describe('loop shape', () => {
  it('accepts an item loop bounded by its collection', () => {
    expect(checks(ITEM_LOOP)).toEqual([]);
  });

  it('accepts a repeat-until loop bounded by its continuation test', () => {
    expect(checks(REPEAT_LOOP)).toEqual([]);
    expect(checks(REPEAT_LOOP.replace('doWhile', 'while'))).toEqual([]);
  });

  it('refuses an item loop that names no collection or no item', () => {
    expect(checks(ITEM_LOOP.replace('    over: work_items', '')))
      .toEqual(['item-loop-without-collection']);
    expect(checks(ITEM_LOOP.replace('    variable: current_item\n', '')))
      .toEqual(['item-loop-without-collection']);
  });

  it('refuses an item loop that also states a continuation test', () => {
    // Two stopping rules where the collection already gives one — the overload the split retires.
    const both = [ITEM_LOOP, '    continueWhile:', '      type: simple',
      '      variable: needs_fixes', '      operator: "=="', '      value: true'].join('\n');
    expect(checks(both)).toEqual(['item-loop-with-continuation']);
  });

  it('refuses a repeat-until loop with no continuation test', () => {
    // Also the unbounded case: nothing in the definition says when this loop stops.
    const bare = ['  - kind: loop', '    id: fix-cycle', '    loopType: doWhile'].join('\n');
    expect(checks(bare)).toEqual(['repeat-loop-without-continuation']);
    expect(checks(bare.replace('doWhile', 'while'))).toEqual(['repeat-loop-without-continuation']);
  });

  it('refuses a repeat-until loop that iterates a collection', () => {
    const withOver = [REPEAT_LOOP, '    over: work_items'].join('\n');
    expect(checks(withOver)).toEqual(['repeat-loop-with-collection']);
    const withVariable = [REPEAT_LOOP, '    variable: current_item'].join('\n');
    expect(checks(withVariable)).toEqual(['repeat-loop-with-collection']);
  });

  const BREAK = ['    breakCondition:', '      type: simple',
    '      variable: has_uncertain_symbols', '      operator: "=="', '      value: true'].join('\n');

  it('accepts an item loop that stops part way through its collection', () => {
    // The walk can end before the collection does, which only an item loop has a way to say. No
    // corpus loop declares the field, so this fixture is where its acceptance is pinned.
    expect(checks([ITEM_LOOP, BREAK].join('\n'))).toEqual([]);
  });

  it('refuses a repeat-until loop that also declares an early exit', () => {
    // Its continuation test is taken every pass, so an exit beside it is the same decision made
    // twice at two different moments.
    expect(checks([REPEAT_LOOP, BREAK].join('\n'))).toEqual(['repeat-loop-with-break']);
    expect(checks([REPEAT_LOOP.replace('doWhile', 'while'), BREAK].join('\n')))
      .toEqual(['repeat-loop-with-break']);
  });

  it('reaches a loop nested inside another loop body', () => {
    const root = mkdtempSync(join(tmpdir(), 'loop-shape-nested-'));
    roots.push(root);
    const dir = join(root, 'demo', 'activities');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, '01-demo.yaml'), [
      'id: demo', 'name: Demo', 'steps:', ITEM_LOOP, '    steps:',
      '      - kind: loop', '        id: inner-cycle', '        loopType: while',
      '        steps:', '          - kind: action', '            id: do-something',
      'transitions: []', '',
    ].join('\n'));
    expect(collectFindings(declareFixtureWorkflows(root)).map((f) => f.site))
      .toEqual(['demo/activities/01-demo.yaml[inner-cycle]']);
  });

  /**
   * The answer key is `<activity>-<checkpoint>`, so an id that reads the same every round holds one
   * answer for the whole loop and the rounds after the first replay it. These pin the shape that
   * separates them (#1432).
   */
  describe('a gate in the body', () => {
    it('refuses an id that reads the same every round', () => {
      expect(checks(ITEM_LOOP, gateBody('approve'))).toEqual(['gate-inside-loop']);
      expect(checks(REPEAT_LOOP, gateBody('approve'))).toEqual(['gate-inside-loop']);
    });

    it('accepts an id carrying an expression read against the bag', () => {
      expect(checks(ITEM_LOOP, gateBody('approve#{current_item}'))).toEqual([]);
      expect(checks(REPEAT_LOOP, gateBody('approve#{fix_round}'))).toEqual([]);
    });

    it('refuses a literal discriminator, which reads the same every round', () => {
      expect(checks(ITEM_LOOP, gateBody('approve#1'))).toEqual(['gate-inside-loop']);
    });

    it('names the gate it found, under the loop that holds it', () => {
      const findings = collectFindings(rootWithLoop(ITEM_LOOP, gateBody('approve')));
      expect(findings.map((f) => f.site)).toEqual(['demo/activities/01-demo.yaml[item-cycle].approve']);
    });

    it('leaves a gate outside any loop alone', () => {
      const root = mkdtempSync(join(tmpdir(), 'loop-shape-top-gate-'));
      roots.push(root);
      const dir = join(root, 'demo', 'activities');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, '01-demo.yaml'), [
        'id: demo', 'name: Demo', 'steps:',
        gateBody('approve').replace(/^ {6}/gm, '  '),
        'transitions: []', '',
      ].join('\n'));
      expect(collectFindings(declareFixtureWorkflows(root))).toEqual([]);
    });

    /**
     * A gate in a nested body belongs to the inner loop's round, and the inner loop's own pass
     * reports it — so it is reported once, against the loop whose round it needs to name.
     */
    it('reports a gate in a nested body once, against the inner loop', () => {
      const root = mkdtempSync(join(tmpdir(), 'loop-shape-nested-gate-'));
      roots.push(root);
      const dir = join(root, 'demo', 'activities');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, '01-demo.yaml'), [
        'id: demo', 'name: Demo', 'steps:', ITEM_LOOP, '    steps:',
        '      - kind: loop', '        id: inner-cycle', '        loopType: doWhile',
        '        continueWhile:', '          type: simple', '          variable: needs_fixes',
        '          operator: "=="', '          value: true',
        '        steps:', gateBody('approve').replace(/^ {6}/gm, '          '),
        'transitions: []', '',
      ].join('\n'));
      const findings = collectFindings(declareFixtureWorkflows(root));
      expect(findings.map((f) => f.check)).toEqual(['gate-inside-loop']);
      expect(findings[0]!.site).toBe('demo/activities/01-demo.yaml[inner-cycle].approve');
    });
  });

  /**
   * A routine body holds loops, and an unbounded `while` in a shared body propagates to every
   * reference site rather than to one — so the guard walks `routines/` beside `activities/` (#704).
   */
  it('reaches a loop in a routine body', () => {
    const root = mkdtempSync(join(tmpdir(), 'loop-shape-routine-'));
    roots.push(root);
    mkdirSync(join(root, 'demo', 'routines'), { recursive: true });
    writeFileSync(join(root, 'demo', 'routines', 'shared-run.yaml'), [
      'id: shared-run', 'version: 1.0.0', 'name: Shared Run', 'steps:',
      // A repeat-until loop with no continuation test: unbounded, and shared.
      '  - kind: loop', '    id: spin', '    loopType: while',
      '    steps:', '      - kind: action', '        id: do-something', '',
    ].join('\n'));
    const findings = collectFindings(declareFixtureWorkflows(root));
    expect(findings.map((f) => f.check)).toEqual(['repeat-loop-without-continuation']);
    expect(findings[0]!.site).toBe('demo/routines/shared-run.yaml[spin]');
  });
});
