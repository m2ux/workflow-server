/**
 * Live-corpus measurement of the two number conversions (#528 W4).
 *
 * The string dialect (`when`) coerces ordering operands with Number() when the
 * value is not already a number. The tree dialect (`condition`) accepts only a
 * number or a finite numeric string. This walk enumerates every live ordering
 * leaf and records the bag values on which those conversions disagree.
 *
 * Run from the repo root:
 *   npx tsx .engineering/artifacts/planning/2026-09-12-number-conversion-disagreement/measure.ts
 *
 * Writes inventory.json next to this file. --root / WORKFLOWS_DIR select the corpus.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type Condition } from '../../../../src/schema/condition.schema.js';
import { parseWhen, type CmpOp, type WhenAst } from '../../../../src/schema/when-expression.js';
import { parseDefinition } from '../../../../src/utils/serialization.js';
import {
  corpusWorkflows,
  defaultCorpusDest,
  resolveWorkflowsRoot,
} from '../../../../guards/workflows-root.js';

const DIR = dirname(fileURLToPath(import.meta.url));

/** The engine checkout that holds `src/` and `guards/`, walking up from this file. */
function engineRoot(from: string): string {
  let dir = from;
  for (;;) {
    if (existsSync(join(dir, 'src/schema/when-expression.ts'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`engine checkout not found above ${from}`);
    }
    dir = parent;
  }
}

const REPO = engineRoot(DIR);
const ORDERING = new Set<CmpOp>(['>', '<', '>=', '<=']);

const PROBES: ReadonlyArray<{ name: string; value: unknown; json: boolean }> = [
  { name: 'true', value: true, json: true },
  { name: 'false', value: false, json: true },
  { name: 'null', value: null, json: true },
  { name: 'empty-array', value: [], json: true },
  { name: 'array-5', value: [5], json: true },
  { name: 'empty-object', value: {}, json: true },
  { name: 'empty-string', value: '', json: true },
  { name: 'numeric-string-0', value: '0', json: true },
  { name: 'numeric-string-1', value: '1', json: true },
  { name: 'non-numeric-string', value: 'abc', json: true },
  { name: 'zero', value: 0, json: true },
  { name: 'one', value: 1, json: true },
  { name: 'undefined', value: undefined, json: false },
];

type DeclaredType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'undeclared';

interface TypeDecl {
  type: DeclaredType;
  defaultValue: unknown;
  home: string;
}

interface OrderingLeaf {
  workflow: string;
  grouping: string;
  file: string;
  site: string;
  position: string;
  dialect: 'when' | 'condition';
  expression: string;
  path: string;
  op: CmpOp;
  rhs: unknown;
  declaredType: DeclaredType;
  defaultValue: unknown;
  typeHome: string | null;
  disagreeingJsonProbes: string[];
  typeLegalDisagreeingProbes: string[];
  defaultDisagrees: boolean;
}

interface PredicateSite {
  workflow: string;
  grouping: string;
  file: string;
  site: string;
  position: string;
  dialect: 'when' | 'condition';
  expression: string;
  stepKind: string | null;
  dualDialect: boolean;
}

function isCondition(value: unknown): value is Condition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const t = (value as { type?: unknown }).type;
  return t === 'simple' || t === 'and' || t === 'or' || t === 'not';
}

function toNumberStrict(v: unknown): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function cmp(a: number, b: number, op: CmpOp): boolean {
  switch (op) {
    case '>':
      return a > b;
    case '<':
      return a < b;
    case '>=':
      return a >= b;
    case '<=':
      return a <= b;
    default:
      return false;
  }
}

/** String-dialect ordering: Number() on either side that is not already a number. */
function whenOrdering(actual: unknown, op: CmpOp, rhs: unknown): boolean {
  const a = typeof actual === 'number' ? actual : Number(actual);
  const b = typeof rhs === 'number' ? rhs : Number(rhs);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return cmp(a, b, op);
}

/** Tree-dialect ordering: number or finite numeric string only. */
function conditionOrdering(actual: unknown, op: CmpOp, rhs: unknown): boolean {
  const a = toNumberStrict(actual);
  const b = toNumberStrict(rhs);
  return a !== undefined && b !== undefined && cmp(a, b, op);
}

function leafDisagrees(actual: unknown, op: CmpOp, rhs: unknown): boolean {
  return whenOrdering(actual, op, rhs) !== conditionOrdering(actual, op, rhs);
}

function typeLegalNames(type: DeclaredType): string[] {
  switch (type) {
    case 'number':
      return ['zero', 'one'];
    case 'string':
      return ['empty-string', 'numeric-string-0', 'numeric-string-1', 'non-numeric-string'];
    case 'boolean':
      return ['true', 'false'];
    case 'array':
      return ['empty-array', 'array-5'];
    case 'object':
      return ['empty-object'];
    case 'undeclared':
      return PROBES.filter((p) => p.json).map((p) => p.name);
  }
}

function collectWhenLeaves(ast: WhenAst, out: Array<{ path: string; op: CmpOp; rhs: unknown }>): void {
  switch (ast.kind) {
    case 'cmp':
      if (ORDERING.has(ast.op)) out.push({ path: ast.path, op: ast.op, rhs: ast.value });
      return;
    case 'not':
      collectWhenLeaves(ast.expr, out);
      return;
    case 'and':
    case 'or':
      collectWhenLeaves(ast.left, out);
      collectWhenLeaves(ast.right, out);
      return;
    default:
      return;
  }
}

function collectConditionLeaves(cond: Condition, out: Array<{ path: string; op: CmpOp; rhs: unknown }>): void {
  switch (cond.type) {
    case 'simple':
      if (ORDERING.has(cond.operator as CmpOp)) {
        out.push({ path: cond.variable, op: cond.operator as CmpOp, rhs: cond.value });
      }
      return;
    case 'not':
      collectConditionLeaves(cond.condition, out);
      return;
    case 'and':
    case 'or':
      for (const c of cond.conditions) collectConditionLeaves(c, out);
      return;
  }
}

function renderCondition(path: string, op: CmpOp, rhs: unknown): string {
  return `simple ${path} ${op} ${JSON.stringify(rhs)}`;
}

interface WalkCtx {
  stepKind: string | null;
  positionHint: 'step' | 'exit' | 'action';
}

function classifyPosition(ctx: WalkCtx, field: 'when' | 'condition'): string {
  if (ctx.positionHint === 'exit') return 'exits[].when';
  if (ctx.positionHint === 'action') return 'actions[].condition';
  if (ctx.stepKind === 'checkpoint' && field === 'condition') return 'checkpoint.condition';
  if (field === 'when') return 'step.when';
  return 'step.condition';
}

function siteId(node: Record<string, unknown>, fallback: string): string {
  if (typeof node.id === 'string' && node.id) return node.id;
  return fallback;
}

function* yamlFiles(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* yamlFiles(p);
    else if (name.endsWith('.yaml') || name.endsWith('.yml')) yield p;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function ingestDecl(into: Map<string, TypeDecl>, name: unknown, type: unknown, defaultValue: unknown, home: string): void {
  if (typeof name !== 'string' || !name) return;
  const t: DeclaredType =
    type === 'string' || type === 'number' || type === 'boolean' || type === 'array' || type === 'object'
      ? type
      : 'undeclared';
  const existing = into.get(name);
  if (!existing) {
    into.set(name, { type: t, defaultValue, home });
    return;
  }
  if (existing.type === 'undeclared' && t !== 'undeclared') {
    into.set(name, { type: t, defaultValue: defaultValue ?? existing.defaultValue, home });
  }
}

function ingestVariableList(into: Map<string, TypeDecl>, list: unknown, home: string): void {
  if (!Array.isArray(list)) return;
  for (const item of list) {
    if (typeof item === 'string') {
      ingestDecl(into, item, undefined, undefined, home);
      continue;
    }
    const rec = asRecord(item);
    if (!rec) continue;
    ingestDecl(into, rec.name, rec.type, rec.defaultValue, home);
  }
}

function ingestVariables(into: Map<string, TypeDecl>, node: unknown, home: string): void {
  const rec = asRecord(node);
  if (!rec) return;
  if (Array.isArray(rec.variables)) {
    ingestVariableList(into, rec.variables, home);
    return;
  }
  const vars = asRecord(rec.variables);
  if (!vars) return;
  ingestVariableList(into, vars.reads, home);
  ingestVariableList(into, vars.writes, home);
}

function groupingOf(rel: string): string {
  if (rel.startsWith('corpus/specimens/')) return 'specimen';
  if (rel.startsWith('corpus/')) return 'product';
  return 'other';
}

function walkPredicates(
  node: unknown,
  ctx: WalkCtx,
  file: string,
  visit: (site: PredicateSite & { node: Record<string, unknown> }) => void,
  seen: WeakSet<object> = new WeakSet(),
): void {
  if (Array.isArray(node)) {
    if (seen.has(node)) return;
    seen.add(node);
    for (const item of node) walkPredicates(item, ctx, file, visit, seen);
    return;
  }
  const rec = asRecord(node);
  if (!rec) return;
  if (seen.has(rec)) return;
  seen.add(rec);

  const next: WalkCtx = {
    stepKind: typeof rec.kind === 'string' ? rec.kind : ctx.stepKind,
    positionHint: ctx.positionHint,
  };

  const hasWhen = typeof rec.when === 'string' && rec.when.trim().length > 0;
  const hasCondition = isCondition(rec.condition);
  if (hasWhen) {
    visit({
      workflow: '',
      grouping: '',
      file,
      site: siteId(rec, ctx.positionHint),
      position: classifyPosition(next, 'when'),
      dialect: 'when',
      expression: rec.when as string,
      stepKind: next.stepKind,
      dualDialect: hasCondition,
      node: rec,
    });
  }
  if (hasCondition) {
    visit({
      workflow: '',
      grouping: '',
      file,
      site: siteId(rec, ctx.positionHint),
      position: classifyPosition(next, 'condition'),
      dialect: 'condition',
      expression: JSON.stringify(rec.condition),
      stepKind: next.stepKind,
      dualDialect: hasWhen,
      node: rec,
    });
  }

  for (const [key, value] of Object.entries(rec)) {
    if (key === 'when' || key === 'condition') continue;
    if (key === 'exits') walkPredicates(value, { ...next, positionHint: 'exit' }, file, visit, seen);
    else if (key === 'actions') walkPredicates(value, { ...next, positionHint: 'action' }, file, visit, seen);
    else walkPredicates(value, next, file, visit, seen);
  }
}

function rootOf(path: string): string {
  return path.split('.')[0] ?? path;
}

const ROOT = resolveWorkflowsRoot(defaultCorpusDest(REPO));

function measure(): {
  corpusRoot: string;
  generatedAt: string;
  declarationCounts: Record<string, number>;
  predicateCounts: Record<string, number>;
  leaves: OrderingLeaf[];
  dualDialectSites: Array<{ file: string; site: string; positionWhen: string; positionCondition: string }>;
} {
  const workflows = corpusWorkflows(ROOT);
  const typesByWorkflow = new Map<string, Map<string, TypeDecl>>();
  const allDecls = new Map<string, TypeDecl>();
  const sites: PredicateSite[] = [];
  const dual: Array<{ file: string; site: string; positionWhen: string; positionCondition: string }> = [];

  for (const wf of workflows) {
    const types = new Map<string, TypeDecl>();
    ingestVariables(types, parseDefinition(readFileSync(wf.manifest, 'utf-8')), `${wf.id}/workflow.yaml`);
    for (const file of yamlFiles(join(wf.dir, 'activities'))) {
      try {
        ingestVariables(types, parseDefinition(readFileSync(file, 'utf-8')), relative(ROOT, file));
      } catch {
        /* malformed YAML is another guard's job */
      }
    }
    typesByWorkflow.set(wf.id, types);
    for (const [name, decl] of types) {
      if (!allDecls.has(name)) allDecls.set(name, decl);
    }
  }

  for (const wf of workflows) {
    const grouping = groupingOf(wf.rel);
    for (const file of yamlFiles(join(wf.dir, 'activities'))) {
      const rel = relative(ROOT, file);
      let doc: unknown;
      try {
        doc = parseDefinition(readFileSync(file, 'utf-8'));
      } catch {
        continue;
      }
      walkPredicates(doc, { stepKind: null, positionHint: 'step' }, rel, (site) => {
        sites.push({ ...site, workflow: wf.id, grouping });
      });
    }
  }

  const seenDual = new Set<string>();
  for (const site of sites) {
    if (!site.dualDialect) continue;
    const key = `${site.file}\0${site.site}`;
    if (seenDual.has(key)) continue;
    seenDual.add(key);
    const pair = sites.filter((s) => s.file === site.file && s.site === site.site);
    const whenSite = pair.find((s) => s.dialect === 'when');
    const condSite = pair.find((s) => s.dialect === 'condition');
    if (whenSite && condSite) {
      dual.push({
        file: site.file,
        site: site.site,
        positionWhen: whenSite.position,
        positionCondition: condSite.position,
      });
    }
  }

  const leaves: OrderingLeaf[] = [];
  for (const site of sites) {
    const types = typesByWorkflow.get(site.workflow) ?? new Map();
    const extracted: Array<{ path: string; op: CmpOp; rhs: unknown }> = [];
    if (site.dialect === 'when') {
      const parsed = parseWhen(site.expression);
      if (!parsed.ok) continue;
      collectWhenLeaves(parsed.ast, extracted);
    } else {
      const cond = JSON.parse(site.expression) as Condition;
      collectConditionLeaves(cond, extracted);
    }
    for (const leaf of extracted) {
      const decl = types.get(rootOf(leaf.path));
      const declaredType = decl?.type ?? 'undeclared';
      const disagreeingJsonProbes = PROBES.filter((p) => p.json && leafDisagrees(p.value, leaf.op, leaf.rhs)).map(
        (p) => p.name,
      );
      const typeLegalDisagreeingProbes = typeLegalNames(declaredType).filter((name) => {
        const probe = PROBES.find((p) => p.name === name);
        return probe ? leafDisagrees(probe.value, leaf.op, leaf.rhs) : false;
      });
      const defaultDisagrees = decl ? leafDisagrees(decl.defaultValue, leaf.op, leaf.rhs) : false;
      leaves.push({
        workflow: site.workflow,
        grouping: site.grouping,
        file: site.file,
        site: site.site,
        position: site.position,
        dialect: site.dialect,
        expression: site.dialect === 'when' ? site.expression : renderCondition(leaf.path, leaf.op, leaf.rhs),
        path: leaf.path,
        op: leaf.op,
        rhs: leaf.rhs,
        declaredType,
        defaultValue: decl?.defaultValue,
        typeHome: decl?.home ?? null,
        disagreeingJsonProbes,
        typeLegalDisagreeingProbes,
        defaultDisagrees,
      });
    }
  }

  const declCounts: Record<string, number> = { total: 0, string: 0, number: 0, boolean: 0, array: 0, object: 0, undeclared: 0 };
  for (const types of typesByWorkflow.values()) {
    for (const decl of types.values()) {
      declCounts.total += 1;
      declCounts[decl.type] = (declCounts[decl.type] ?? 0) + 1;
    }
  }

  const predicateCounts = {
    whenSites: sites.filter((s) => s.dialect === 'when').length,
    conditionSites: sites.filter((s) => s.dialect === 'condition').length,
    orderingLeaves: leaves.length,
    orderingLeavesWithJsonDisagreement: leaves.filter((l) => l.disagreeingJsonProbes.length > 0).length,
    orderingLeavesWithTypeLegalDisagreement: leaves.filter((l) => l.typeLegalDisagreeingProbes.length > 0).length,
    orderingLeavesWithDefaultDisagreement: leaves.filter((l) => l.defaultDisagrees).length,
    dualDialectSites: dual.length,
    productOrderingLeaves: leaves.filter((l) => l.grouping === 'product').length,
    specimenOrderingLeaves: leaves.filter((l) => l.grouping === 'specimen').length,
  };

  return {
    corpusRoot: ROOT,
    generatedAt: new Date().toISOString().slice(0, 10),
    declarationCounts: declCounts,
    predicateCounts,
    leaves,
    dualDialectSites: dual,
  };
}

const result = measure();
const outPath = join(DIR, 'inventory.json');
writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);

const changing = result.leaves.filter((l) => l.disagreeingJsonProbes.length > 0);
const typeLegal = result.leaves.filter((l) => l.typeLegalDisagreeingProbes.length > 0);

process.stdout.write(
  [
    `corpus: ${result.corpusRoot}`,
    `declarations: ${JSON.stringify(result.declarationCounts)}`,
    `predicates: ${JSON.stringify(result.predicateCounts)}`,
    `ordering leaves whose answer changes on a JSON probe: ${changing.length}`,
    `ordering leaves whose answer changes on a type-legal JSON value: ${typeLegal.length}`,
    `wrote ${outPath}`,
    '',
  ].join('\n'),
);

for (const leaf of result.leaves) {
  const flip = leaf.disagreeingJsonProbes.length ? leaf.disagreeingJsonProbes.join(',') : 'none';
  const typed = leaf.typeLegalDisagreeingProbes.length ? leaf.typeLegalDisagreeingProbes.join(',') : 'none';
  process.stdout.write(
    `${leaf.grouping}\t${leaf.dialect}\t${leaf.position}\t${leaf.declaredType}\t${leaf.path} ${leaf.op} ${JSON.stringify(leaf.rhs)}\tjson:${flip}\ttyped:${typed}\t${leaf.file}[${leaf.site}]\n`,
  );
}
