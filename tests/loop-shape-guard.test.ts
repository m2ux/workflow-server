import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-loop-shape.js';

/**
 * A loop declares the fields its iteration type uses, and no others.
 *
 * An item loop is bounded by its collection and states no continuation test; a repeat-until loop is
 * bounded by its test and iterates no collection. The corpus satisfies both partitions, which is
 * what leaves the live tree unable to show that the checks still bite — so the synthetic roots below
 * carry each fault and the shape it is a fault against.
 */

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

/** A corpus root holding one activity whose single step is the given loop. */
function rootWithLoop(loop: string): string {
  const root = mkdtempSync(join(tmpdir(), 'loop-shape-'));
  roots.push(root);
  const dir = join(root, 'demo', 'activities');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, '01-demo.yaml'),
    ['id: demo', 'name: Demo', 'steps:', loop,
      '    steps:', '      - kind: action', '        id: do-something',
      'transitions: []', ''].join('\n'),
  );
  return root;
}

const checks = (loop: string): string[] => collectFindings(rootWithLoop(loop)).map((f) => f.check);

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
    expect(collectFindings(root).map((f) => f.site))
      .toEqual(['demo/activities/01-demo.yaml[inner-cycle]']);
  });
});
