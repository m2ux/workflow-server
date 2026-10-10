import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { conditionSites } from '../guards/condition-sites.js';
import { citePath, corpusNamespaces, definitionsUnder } from '../guards/workflows-root.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { evaluateCondition, type Condition } from '../src/schema/condition.schema.js';
import { assertWhenAuthoring, evaluateWhenExpression } from '../src/schema/when-expression.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * Each converted step gate, evaluated rather than diffed.
 *
 * The fixture holds the structured condition the survey converted and the `when` now on that step.
 * Agreement is over a lattice that includes the values where the two dialects come apart: absent,
 * null, false, zero and an empty string. A step that already carried `when` keeps it, conjoined,
 * which is when the step was reached.
 *
 * The corpus block reads the definitions branch this engine pairs with. It fails while that branch
 * still carries the structured gates, and it is not loosened to pass there.
 */

interface Fixture {
  key: string;
  condition: Condition;
  priorWhen: string | null;
  when: string;
}

const FIXTURES = JSON.parse(
  readFileSync(new URL('./fixtures/converted-gates.json', import.meta.url), 'utf8'),
) as Fixture[];

const LATTICE: unknown[] = [undefined, null, false, true, 0, 1, -1, '', 'x', 'other'];

function readsOf(condition: Condition, out: string[] = []): string[] {
  if (condition.type === 'simple') {
    if (!out.includes(condition.variable)) out.push(condition.variable);
    return out;
  }
  if (condition.type === 'not') return readsOf(condition.condition, out);
  for (const member of condition.conditions) readsOf(member, out);
  return out;
}

function assign(path: string, value: unknown, bag: Record<string, unknown>): void {
  if (value === undefined) return;
  const parts = path.split('.');
  let cursor = bag;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (cursor[part] === null || typeof cursor[part] !== 'object') cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]!] = value;
}

interface StepNode {
  id?: string;
  when?: string;
  condition?: unknown;
  steps?: StepNode[];
}

function findStep(steps: StepNode[] | undefined, path: string[]): StepNode | null {
  const [head, ...rest] = path;
  const step = (steps ?? []).find((item, index) => (item.id ?? String(index)) === head);
  if (!step) return null;
  return rest.length === 0 ? step : findStep(step.steps, rest);
}

function markdownHomes(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith('.md') && (path.includes('/techniques/') || path.includes('/resources/'))) {
        out.push(path);
      }
    }
  };
  walk(root);
  return out;
}

describe('converted step gates', () => {
  it('holds on the same assignments as the structured condition it replaces — AC2', () => {
    expect(FIXTURES.length).toBe(74);
    const failures: string[] = [];
    for (const fixture of FIXTURES) {
      const authored = assertWhenAuthoring(fixture.when);
      if (!authored.ok) {
        failures.push(`${fixture.key}: ${authored.error}`);
        continue;
      }
      const names = readsOf(fixture.condition);
      const total = LATTICE.length ** names.length;
      if (total > 200_000) {
        failures.push(`${fixture.key}: lattice of ${total}`);
        continue;
      }
      for (let n = 0; n < total; n++) {
        const bag: Record<string, unknown> = {};
        let rest = n;
        for (const name of names) {
          assign(name, LATTICE[rest % LATTICE.length], bag);
          rest = Math.floor(rest / LATTICE.length);
        }
        const structured = evaluateCondition(fixture.condition, bag);
        const previous = fixture.priorWhen ? evaluateWhenExpression(fixture.priorWhen, bag) : true;
        if (evaluateWhenExpression(fixture.when, bag) !== (structured && previous)) {
          failures.push(`${fixture.key} at ${JSON.stringify(bag)}`);
          break;
        }
      }
    }
    expect(failures).toEqual([]);
  });
});

const LIVE = liveCorpusRoot();

describe.skipIf(LIVE === null)('converted gates on the paired corpus', () => {
  const root = LIVE!;

  it('puts that when on the same step and leaves no step condition — AC2, AC3', () => {
    const index = indexCorpus(root);
    const files = new Map<string, string>();
    for (const { dir } of corpusNamespaces(root, index)) {
      for (const home of ['activities', 'routines'] as const) {
        const stepsDir = join(dir, home);
        if (!existsSync(stepsDir) || !statSync(stepsDir).isDirectory()) continue;
        for (const { path } of definitionsUnder(stepsDir)) files.set(citePath(root, path, index), path);
      }
    }
    const parsed = new Map<string, { steps?: StepNode[] }>();
    const mismatches: string[] = [];
    for (const fixture of FIXTURES) {
      const file = fixture.key.split('::')[0]!;
      const stepPath = fixture.key.split('::').slice(2).join('::');
      const absolute = files.get(file);
      if (!absolute) {
        mismatches.push(`no file ${file}`);
        continue;
      }
      if (!parsed.has(absolute)) parsed.set(absolute, parse(readFileSync(absolute, 'utf8')) as { steps?: StepNode[] });
      const step = findStep(parsed.get(absolute)!.steps, stepPath.split('/'));
      if (!step) mismatches.push(`no step ${fixture.key}`);
      else if (step.condition !== undefined) mismatches.push(`condition remains ${fixture.key}`);
      else if (step.when !== fixture.when) mismatches.push(`${fixture.key}: ${step.when}`);
    }
    expect(mismatches).toEqual([]);
    expect(conditionSites(root)).toEqual([]);
  });

  it('describes no checkpoint dismissal and no field that confers it — AC4', () => {
    const banned = /condition_not_met|dismissible|unmet condition/;
    const hits: string[] = [];
    for (const path of markdownHomes(root)) {
      const body = readFileSync(path, 'utf8');
      if (banned.test(body)) hits.push(path.slice(root.length + 1));
    }
    expect(hits).toEqual([]);
  });
});
