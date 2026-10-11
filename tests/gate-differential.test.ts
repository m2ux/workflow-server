import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { conditionReads, variableDomains, type Domain } from '../guards/condition-sites.js';
import { citePath, corpusNamespaces, definitionsUnder } from '../guards/workflows-root.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { evaluateCondition, type Condition, type ComparisonOperator } from '../src/schema/condition.schema.js';
import {
  assertWhenAuthoring,
  evaluateWhenExpression,
  expressionPaths,
  parseWhen,
  type WhenAst,
} from '../src/schema/when-expression.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * Each converted gate against the structured condition it replaced, on the assignments of the
 * variables that site reads.
 *
 * A closed declaration contributes every value it names, and absence when nothing seeds the
 * variable. An open declaration has no finite set, so it contributes a sample: absence when
 * unseeded, null, false, zero, the empty string, every literal either form compares the variable
 * to, a value on each side of a numeric bound, and one further value of the declared type. The
 * product is evaluated whole. A disagreement is a failure.
 *
 * Where the step already carried a `when`, the converted gate is that expression conjoined with
 * the condition, and the comparison is against that conjunction.
 *
 * The corpus block reads the definitions branch this engine pairs with. A step that still carries
 * a structured condition, or a `when` that disagrees with the condition it replaced, fails.
 */

/** An unset variable. Distinct from null, which is a present value. */
const ABSENT = Symbol('absent');

interface Comparison {
  variable: string;
  op: ComparisonOperator | string;
  value?: unknown;
}

interface Gate {
  key: string;
  condition: Condition;
  priorWhen: string | null;
  when: string;
  domains: Map<string, Domain>;
}

const OPEN: Domain = { seeded: false, values: null };

function push(values: unknown[], value: unknown): void {
  if (!values.some((held) => Object.is(held, value))) values.push(value);
}

/** A value the comparison does not already name, so equality has a miss as well as a hit. */
function contrast(value: unknown): unknown {
  if (typeof value === 'number') return value === 0 ? 1 : 0;
  if (typeof value === 'boolean') return !value;
  if (typeof value === 'string') return value === 'other' ? 'other-x' : 'other';
  return 'x';
}

/** A value on the other side of a comparison from the literal it names. */
function witnesses(op: string, value: unknown): unknown[] {
  if (op === '>' || op === '>=' || op === '<' || op === '<=') {
    const bound = typeof value === 'number' ? value : 0;
    return [bound + 1, bound - 1];
  }
  if (op === '==' || op === '!=') return [contrast(value)];
  return ['x'];
}

function comparisonsOf(condition: Condition, out: Comparison[] = []): Comparison[] {
  if (condition.type === 'simple') {
    out.push({ variable: condition.variable, op: condition.operator, value: condition.value });
    return out;
  }
  if (condition.type === 'not') return comparisonsOf(condition.condition, out);
  for (const member of condition.conditions) comparisonsOf(member, out);
  return out;
}

function comparisonsInWhen(expr: string, out: Comparison[]): void {
  const parsed = parseWhen(expr);
  if (!parsed.ok) return;
  const walk = (ast: WhenAst): void => {
    switch (ast.kind) {
      case 'cmp':
        out.push({ variable: ast.path, op: ast.op, value: ast.value });
        return;
      case 'not':
        walk(ast.expr);
        return;
      case 'and':
      case 'or':
        walk(ast.left);
        walk(ast.right);
        return;
      default:
        return;
    }
  };
  walk(parsed.ast);
}

function readsOf(gate: Pick<Gate, 'condition' | 'priorWhen' | 'when'>): string[] {
  const names = conditionReads(gate.condition);
  for (const expr of [gate.priorWhen, gate.when]) {
    if (!expr) continue;
    for (const path of expressionPaths(expr)) if (!names.includes(path)) names.push(path);
  }
  return names;
}

/**
 * The values one variable takes.
 *
 * A closed declaration contributes its value set. An open one contributes the sample: the
 * boundary values where presence and truthiness come apart, the literals either form names, and
 * a witness on each side of a numeric bound. Absence joins either, when the declaration does not
 * seed the variable.
 */
function valuesOf(domain: Domain, comparisons: Comparison[]): unknown[] {
  const values: unknown[] = [];
  if (!domain.seeded) values.push(ABSENT);
  if (domain.values !== null) {
    for (const value of domain.values) push(values, value);
  } else {
    for (const value of [null, false, 0, '']) push(values, value);
    for (const comparison of comparisons) {
      if (comparison.value !== undefined) push(values, comparison.value);
      for (const witness of witnesses(comparison.op, comparison.value)) push(values, witness);
    }
    push(values, further(domain.type, values));
  }
  return values;
}

function further(type: string | undefined, taken: unknown[]): unknown {
  if (type === 'number') {
    let n = 1;
    while (taken.some((value) => Object.is(value, n))) n += 1;
    return n;
  }
  if (type === 'boolean') return taken.some((value) => Object.is(value, true)) ? false : true;
  if (type === 'array') return ['sample'];
  if (type === 'object') return { sample: true };
  let text = 'other';
  while (taken.some((value) => Object.is(value, text))) text += '-x';
  return text;
}

function assign(path: string, value: unknown, bag: Record<string, unknown>): void {
  if (value === ABSENT) return;
  const parts = path.split('.');
  let cursor = bag;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (cursor[part] === null || typeof cursor[part] !== 'object') cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]!] = value;
}

/** The first assignment on which the converted gate and the structured condition disagree. */
function firstDisagreement(gate: Gate): string | null {
  const authored = assertWhenAuthoring(gate.when);
  if (!authored.ok) return `${gate.key}: ${authored.error}`;

  const comparisons = comparisonsOf(gate.condition);
  if (gate.priorWhen) comparisonsInWhen(gate.priorWhen, comparisons);
  comparisonsInWhen(gate.when, comparisons);

  const names = readsOf(gate);
  const perName = names.map((name) => ({
    name,
    values: valuesOf(gate.domains.get(name) ?? OPEN, comparisons.filter((item) => item.variable === name)),
  }));
  if (perName.some(({ values }) => values.length === 0)) return `${gate.key}: a variable has no values`;
  const total = perName.reduce((product, { values }) => product * values.length, 1);
  if (total > 5_000_000) return `${gate.key}: product of ${total}`;

  for (let n = 0; n < total; n++) {
    const bag: Record<string, unknown> = {};
    const shown: Record<string, unknown> = {};
    let rest = n;
    for (const { name, values } of perName) {
      const value = values[rest % values.length]!;
      assign(name, value, bag);
      shown[name] = value === ABSENT ? '<absent>' : value;
      rest = Math.floor(rest / values.length);
    }
    const structured = evaluateCondition(gate.condition, bag);
    const previous = gate.priorWhen ? evaluateWhenExpression(gate.priorWhen, bag) : true;
    const inline = evaluateWhenExpression(gate.when, bag);
    if (inline !== (structured && previous)) {
      return `${gate.key} at ${JSON.stringify(shown)}: condition ${structured && previous}, when ${inline}`;
    }
  }
  return null;
}

describe('the differential comparison', () => {
  it('reports a disagreement on a declared value the two forms do not share', () => {
    const failure = firstDisagreement({
      key: 'enum',
      condition: { type: 'simple', variable: 'operation_type', operator: '==', value: 'audit' },
      priorWhen: null,
      when: 'operation_type == "review"',
      domains: new Map([['operation_type', { seeded: false, values: ['audit', 'review'], type: 'string' }]]),
    });
    expect(failure).toContain('"audit"');
  });

  it('reports a disagreement on the far side of a numeric bound', () => {
    const failure = firstDisagreement({
      key: 'bound',
      condition: { type: 'simple', variable: 'lint_findings_count', operator: '>', value: 5 },
      priorWhen: null,
      when: 'lint_findings_count > 6',
      domains: new Map([['lint_findings_count', { seeded: true, values: null, type: 'number' }]]),
    });
    expect(failure).toContain('6');
  });

  it('reports a disagreement when a prior when is left out of the conjunction', () => {
    const domains = new Map<string, Domain>([
      ['source_readable', { seeded: false, values: [true, false], type: 'boolean' }],
      ['needs_revision', { seeded: false, values: [true, false], type: 'boolean' }],
    ]);
    const condition: Condition = { type: 'simple', variable: 'needs_revision', operator: '==', value: true };
    expect(firstDisagreement({
      key: 'conjoined',
      condition,
      priorWhen: 'source_readable == true',
      when: 'source_readable == true && needs_revision == true',
      domains,
    })).toBeNull();
    expect(firstDisagreement({
      key: 'dropped-prior',
      condition,
      priorWhen: 'source_readable == true',
      when: 'needs_revision == true',
      domains,
    })).not.toBeNull();
  });
});

interface Recorded {
  key: string;
  condition: Condition;
  priorWhen: string | null;
}

const RECORDED = JSON.parse(
  readFileSync(new URL('./fixtures/converted-gates.json', import.meta.url), 'utf8'),
) as Recorded[];

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

function namespaceOf(file: string, namespaces: ReturnType<typeof corpusNamespaces>): string {
  const home = file.includes('/routines/')
    ? file.slice(0, file.indexOf('/routines/'))
    : file.slice(0, file.indexOf('/activities/'));
  return namespaces.find((ns) => ns.path === home)?.ref
    ?? namespaces.find((ns) => ns.ref === home)?.ref
    ?? home;
}

const LIVE = liveCorpusRoot();

describe.skipIf(LIVE === null)('each converted gate on the paired corpus', () => {
  const root = LIVE!;

  it('agrees with its structured original on every assignment of the variables it reads — AC12', () => {
    const index = indexCorpus(root);
    const namespaces = corpusNamespaces(root, index);
    const files = new Map<string, string>();
    for (const { dir } of namespaces) {
      for (const home of ['activities', 'routines'] as const) {
        const stepsDir = join(dir, home);
        if (!existsSync(stepsDir) || !statSync(stepsDir).isDirectory()) continue;
        for (const { path } of definitionsUnder(stepsDir)) files.set(citePath(root, path, index), path);
      }
    }
    const parsed = new Map<string, { steps?: StepNode[] }>();
    const domains = new Map<string, Map<string, Domain>>();
    const failures: string[] = [];
    let closed = 0;

    expect(RECORDED.length).toBe(74);
    for (const recorded of RECORDED) {
      const file = recorded.key.split('::')[0]!;
      const stepPath = recorded.key.split('::').slice(2).join('::');
      const absolute = files.get(file);
      if (!absolute) {
        failures.push(`no file ${file}`);
        continue;
      }
      if (!parsed.has(absolute)) parsed.set(absolute, parse(readFileSync(absolute, 'utf8')) as { steps?: StepNode[] });
      const step = findStep(parsed.get(absolute)!.steps, stepPath.split('/'));
      if (!step) {
        failures.push(`no step ${recorded.key}`);
        continue;
      }
      if (step.condition !== undefined) {
        failures.push(`condition remains ${recorded.key}`);
        continue;
      }
      if (step.when === undefined) {
        failures.push(`no when ${recorded.key}`);
        continue;
      }

      const namespace = namespaceOf(file, namespaces);
      if (!domains.has(namespace)) domains.set(namespace, variableDomains(root, namespace, index));
      const model = domains.get(namespace)!;
      for (const name of conditionReads(recorded.condition)) {
        if (model.get(name)?.values !== null && model.get(name)?.values !== undefined) closed += 1;
      }

      const failure = firstDisagreement({
        key: recorded.key,
        condition: recorded.condition,
        priorWhen: recorded.priorWhen,
        when: step.when,
        domains: model,
      });
      if (failure) failures.push(failure);
    }

    expect(closed).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});
