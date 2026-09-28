import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { declareFixtureWorkflows } from './corpus-fixture.js';
import { collectWhenExpressionViolations } from '../guards/check-when-expression.js';

/**
 * Every `when` gate answers to the same dialect, wherever it is authored: a step gate or an exit
 * selection, in an activity or in a routine body. The live corpus writes each form correctly, so the
 * synthetic roots below carry the faults the guard exists to catch.
 */

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

const MIXED = 'a == true && b == true || c == true';
const GROUPED = '(a == true && b == true) || c == true';

/** A corpus root holding one definition file, under `demo/<subdir>/`. */
function rootWith(subdir: 'activities' | 'routines', file: string, lines: string[]): string {
  const root = mkdtempSync(join(tmpdir(), 'when-guard-'));
  roots.push(root);
  const dir = join(root, 'demo', subdir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, file), [...lines, ''].join('\n'));
  return declareFixtureWorkflows(root);
}

const activityWithExit = (when: string): string => rootWith('activities', '01-demo.yaml', [
  'id: demo', 'version: 1.0.0', 'name: Demo',
  'steps:', '  - kind: action', '    id: do-something',
  'exits:', '  - id: done', `    when: "${when}"`, '  - id: other', '    isDefault: true',
]);

const routineWithStep = (when: string): string => rootWith('routines', 'demo-run.yaml', [
  'id: demo-run', 'version: 1.0.0', 'name: Demo run',
  'steps:', '  - kind: action', '    id: do-something', `    when: "${when}"`,
]);

const sites = (root: string): string[] => collectWhenExpressionViolations(root).map((v) => v.site);

describe('when-expression guard', () => {
  it('rejects an exit gate mixing && and || without parentheses', () => {
    expect(sites(activityWithExit(MIXED))).toEqual([join('demo', 'activities', '01-demo.yaml') + '[exit done]']);
  });

  it('accepts an exit gate that groups mixed operators', () => {
    expect(sites(activityWithExit(GROUPED))).toEqual([]);
  });

  it('rejects a routine step gate mixing && and || without parentheses', () => {
    expect(sites(routineWithStep(MIXED))).toEqual([join('demo', 'routines', 'demo-run.yaml') + '[do-something]']);
  });

  it('accepts a routine step gate that groups mixed operators', () => {
    expect(sites(routineWithStep(GROUPED))).toEqual([]);
  });
});
