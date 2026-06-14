/**
 * Binding-fidelity drift guard.
 *
 * Two high-signal, deterministic checks over every workflow's activities + techniques:
 *
 *   (1) arg-conformance — every `technique_args` key is a declared input of the bound
 *       operation's composed signature (own ∪ group). A key that is not an input is a
 *       stale/overfit deviation left behind by a rename or refactor.
 *
 *   (2) read-resolution — every `{token}` interpolation and structured-condition variable
 *       resolves to a producible bag name: a declared input/output id anywhere in the
 *       corpus, a `{$local}` introduced in the same file, a `workflow.toon` variable, an
 *       activity-produced var (set / setVariable / loop variable), or a known ambient.
 *       A read with no producer is a binding gap (typically a renamed/removed producer).
 *
 * Reference-resolution (every `step.technique` resolves through the loader) is covered by
 * scripts/check-all-refs.ts and is intentionally not duplicated here.
 *
 * The current corpus carries pre-existing violations in not-yet-migrated workflows. Those are
 * snapshotted in scripts/binding-fidelity-baseline.json; the guard fails ONLY on violations
 * absent from that baseline (i.e. NEW drift introduced by a change). Regenerate the baseline
 * after an intentional, reviewed change with:
 *
 *   npx tsx scripts/check-binding-fidelity.ts --update-baseline
 *
 * Plain run (used by CI / the workflow-design validation step):
 *
 *   npx tsx scripts/check-binding-fidelity.ts
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeToonRaw } from '../src/utils/toon.js';

// Resolve paths from this file's own URL (reliable under both tsx CLI and the vitest runner,
// where import.meta.dirname is not populated).
const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(DIR, '..', 'workflows');
const BASELINE = join(DIR, 'binding-fidelity-baseline.json');
const META = 'meta';

/* ----------------------------- signature parsing ----------------------------- */
type Sig = { inputs: Set<string>; outputs: Set<string> };
function sectionIds(content: string, headers: string[]): Set<string> {
  const ids = new Set<string>();
  let inSec = false;
  for (const line of content.split('\n')) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) { inSec = headers.includes(h2[1].trim()); continue; }
    if (inSec) { const h3 = /^###\s+(\S+)\s*$/.exec(line); if (h3) ids.add(h3[1].trim()); }
  }
  return ids;
}
function fileSig(p: string): Sig {
  const c = readFileSync(p, 'utf-8');
  // Canonical headers only (the loader rejects singular variants); `## Input`/`## Output` left
  // out deliberately so a regression in header spelling surfaces as an empty signature.
  return { inputs: sectionIds(c, ['Inputs']), outputs: sectionIds(c, ['Outputs']) };
}

type Reg = { ops: Map<string, Sig>; groups: Map<string, Sig> };
const registry = new Map<string, Reg>();
const DECLARED = new Set<string>(); // every declared input/output id across the corpus

function buildRegistry(wf: string): void {
  const tdir = join(ROOT, wf, 'techniques');
  if (!existsSync(tdir)) return;
  const reg: Reg = { ops: new Map(), groups: new Map() };
  const note = (s: Sig) => { s.inputs.forEach((x) => DECLARED.add(x)); s.outputs.forEach((x) => DECLARED.add(x)); };
  // The workflow-root techniques/TECHNIQUE.md declares Inputs/Outputs inherited by every op
  // (composeLoaded merges the root into each descendant). Include it in DECLARED and in every op
  // signature, else root-hoisted inputs (AP-52) read as unresolved / mis-flag arg-conformance.
  const rootIdx = join(tdir, 'TECHNIQUE.md');
  const rootSig: Sig = existsSync(rootIdx) ? fileSig(rootIdx) : { inputs: new Set(), outputs: new Set() };
  note(rootSig);
  const withRoot = (s: Sig): Sig => ({ inputs: new Set([...s.inputs, ...rootSig.inputs]), outputs: new Set([...s.outputs, ...rootSig.outputs]) });
  for (const entry of readdirSync(tdir)) {
    const p = join(tdir, entry); const st = statSync(p);
    if (st.isFile() && entry.endsWith('.md') && entry !== 'TECHNIQUE.md') {
      const s = fileSig(p); reg.ops.set(entry.slice(0, -3), withRoot(s)); note(s);
    } else if (st.isDirectory()) {
      const idx = join(p, 'TECHNIQUE.md');
      const g = existsSync(idx) ? fileSig(idx) : { inputs: new Set<string>(), outputs: new Set<string>() };
      reg.groups.set(entry, withRoot(g)); note(g);
      for (const f of readdirSync(p)) {
        if (f.endsWith('.md') && f !== 'TECHNIQUE.md') {
          const own = fileSig(join(p, f)); note(own);
          reg.ops.set(`${entry}::${f.slice(0, -3)}`, withRoot({
            inputs: new Set([...own.inputs, ...g.inputs]),
            outputs: new Set([...own.outputs, ...g.outputs]),
          }));
        }
      }
    }
  }
  registry.set(wf, reg);
}

const workflows = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory() && existsSync(join(ROOT, d, 'techniques')));
for (const wf of workflows) buildRegistry(wf);

function resolve(ref: string, wf: string, activityId?: string): Sig | null {
  // Activity-group convention (mirrors the server's get_technique): a bare op resolves FIRST against
  // the group named after the current activity — `<activity-id>::<op>` — taking precedence over a
  // same-named standalone/group-base, so an op that shares its group's name (`research` ->
  // `research::research`) selects the op, not the group base.
  if (activityId && !ref.includes('::')) {
    for (const c of wf !== META ? [wf, META] : [META]) {
      const r = registry.get(c);
      if (r?.ops.has(`${activityId}::${ref}`)) return r.ops.get(`${activityId}::${ref}`)!;
    }
  }
  const slash = ref.indexOf('/');
  if (slash > 0 && !ref.includes('::')) {
    const r = registry.get(ref.slice(0, slash)); const rest = ref.slice(slash + 1);
    if (r) { if (r.ops.has(rest)) return r.ops.get(rest)!; if (r.groups.has(rest)) return r.groups.get(rest)!; }
  }
  for (const c of wf !== META ? [wf, META] : [META]) {
    const r = registry.get(c); if (!r) continue;
    if (r.ops.has(ref)) return r.ops.get(ref)!;
    if (!ref.includes('::') && r.groups.has(ref)) return r.groups.get(ref)!;
  }
  return null;
}

/* ----------------------------- corpus collection ----------------------------- */
const AMBIENT = new Set(['target_symbol', 'impact_report', 'model_id']);
const PLACEHOLDER = new Set(['path', 'token', 'placeholder', 'field', 'key', 'value', 'var', 'x', 'n', 'i', 'templated', 'output_id', 'declared_id', 'id', 'name', 'type', 'o']);
const PRODUCED = new Set<string>(); // workflow.toon vars + activity set/loop/effect targets
const fileLocals = new Map<string, Set<string>>();

function collectWorkflowVars(wf: string): void {
  const wt = join(ROOT, wf, 'workflow.toon');
  if (!existsSync(wt)) return;
  try {
    const p = decodeToonRaw(readFileSync(wt, 'utf-8')) as { variables?: Array<{ name?: string }>; context?: Array<{ name?: string }> };
    for (const v of p?.variables ?? []) if (v?.name) PRODUCED.add(v.name);
    for (const v of p?.context ?? []) if (v?.name) PRODUCED.add(v.name);
  } catch { /* structural errors are validate-workflow-toon's job */ }
}

type Step = { rel: string; stepId: string; technique: string; args: string[]; activityId: string };
const steps: Step[] = [];
function walkSteps(rel: string, node: unknown, activityId: string): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((n) => walkSteps(rel, n, activityId)); return; }
  const o = node as Record<string, unknown>;
  if (typeof o.technique === 'string') {
    steps.push({ rel, stepId: typeof o.id === 'string' ? o.id : '?', technique: o.technique, args: Object.keys((o.technique_args as object) ?? {}), activityId });
  }
  if (o.action === 'set' && typeof o.target === 'string') PRODUCED.add(o.target);
  if (o.setVariable && typeof o.setVariable === 'object') Object.keys(o.setVariable).forEach((k) => PRODUCED.add(k));
  const eff = o.effect as { setVariable?: object } | undefined;
  if (eff?.setVariable) Object.keys(eff.setVariable).forEach((k) => PRODUCED.add(k));
  if (typeof o.variable === 'string') PRODUCED.add(o.variable);
  for (const v of Object.values(o)) walkSteps(rel, v, activityId);
}

type Read = { rel: string; line: number; full: string; head: string; kind: 'technique' | 'activity' };
const reads: Read[] = [];
function collectReads(rel: string, content: string, kind: 'technique' | 'activity'): void {
  const locals = new Set<string>();
  const reIntro = /\{\$([a-z_][a-z0-9_]*)\}/g; let mi: RegExpExecArray | null;
  while ((mi = reIntro.exec(content))) locals.add(mi[1]);
  fileLocals.set(rel, locals);
  content.split('\n').forEach((line, i) => {
    const re = /\{(\$?)([a-z_][a-z0-9_]*(?:\.[a-z0-9_]+)*)\}/g; let m: RegExpExecArray | null;
    while ((m = re.exec(line))) { if (m[1] === '$') continue; reads.push({ rel, line: i + 1, full: m[2], head: m[2].split('.')[0], kind }); }
    if (kind === 'activity') {
      const cv = /^\s*variable:\s*"?([a-z_][a-z0-9_.]*)"?/.exec(line);
      if (cv) reads.push({ rel, line: i + 1, full: cv[1], head: cv[1].split('.')[0], kind });
    }
  });
}

// techniques
for (const wf of workflows) {
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e); const st = statSync(p);
      if (st.isDirectory()) { if (e !== 'resources') walk(p); }
      else if (e.endsWith('.md')) collectReads(relative(ROOT, p), readFileSync(p, 'utf-8'), 'technique');
    }
  };
  walk(join(ROOT, wf, 'techniques'));
}
// activities + workflow vars
const allWf = new Set([...workflows, ...readdirSync(ROOT).filter((d) => { const p = join(ROOT, d); return statSync(p).isDirectory() && existsSync(join(p, 'activities')); })]);
for (const wf of allWf) {
  collectWorkflowVars(wf);
  const adir = join(ROOT, wf, 'activities');
  if (!existsSync(adir)) continue;
  for (const f of readdirSync(adir)) {
    if (!f.endsWith('.toon')) continue;
    const rel = relative(ROOT, join(adir, f)); const raw = readFileSync(join(adir, f), 'utf-8');
    collectReads(rel, raw, 'activity');
    try {
      const dec = decodeToonRaw(raw);
      const activityId = dec && typeof dec === 'object' && typeof (dec as { id?: unknown }).id === 'string' ? (dec as { id: string }).id : '';
      walkSteps(rel, dec, activityId);
    } catch { /* validate-workflow-toon's job */ }
  }
}

/* --------------------------------- checks --------------------------------- */
export interface Violation { check: 'arg-conformance' | 'read-resolution' | 'binding-resolution'; site: string; detail: string }

export function collectViolations(): Violation[] {
  const v: Violation[] = [];
  // (1) binding-resolution + arg-conformance
  for (const s of steps) {
    const wf = s.rel.split('/')[0];
    const sig = resolve(s.technique, wf, s.activityId);
    if (!sig) {
      // A step's `technique:` ref must resolve to a real operation (workflow-local, meta, or
      // cross-workflow). check-all-refs only validates techniques.primary/supporting, so after the
      // step-binding migration this is the only guard covering step.technique bindings.
      v.push({ check: 'binding-resolution', site: `${s.rel}[${s.stepId}]`, detail: `step technique '${s.technique}' does not resolve` });
      continue;
    }
    // A technique_args key is valid when it names a declared INPUT (a deviation: literal/rename/template)
    // OR a declared OUTPUT (a reserved output-remap entry — variable-binding.md §"Land outputs": an output
    // O lands under the remapped bag name when an entry for O is present). A key that is neither is a
    // stale/overfit deviation left behind by a rename or refactor.
    for (const key of s.args) if (!sig.inputs.has(key) && !sig.outputs.has(key)) {
      v.push({ check: 'arg-conformance', site: `${s.rel}[${s.stepId}]`, detail: `${s.technique}: arg '${key}' is neither a declared input (deviation) nor a declared output (remap)` });
    }
  }
  // (2) read-resolution
  for (const r of reads) {
    if (PLACEHOLDER.has(r.head)) continue;
    const locals = fileLocals.get(r.rel) ?? new Set<string>();
    if (DECLARED.has(r.head) || PRODUCED.has(r.head) || locals.has(r.head) || AMBIENT.has(r.head)) continue;
    v.push({ check: 'read-resolution', site: `${r.rel}:${r.line}`, detail: `{${r.full}} has no producer (declared id / $-local / workflow var / set-target)` });
  }
  return v;
}

function sig(x: Violation): string { return `${x.check}${x.site.replace(/:\d+$/, '')}${x.detail}`; }

/** Compare current violations to the committed baseline. Returns added (new drift) + fixed. */
export function diffBaseline(): { added: Violation[]; fixed: Violation[]; total: number; baselined: number } {
  const violations = collectViolations();
  const baseline: Violation[] = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf-8')) : [];
  const baseSet = new Set(baseline.map(sig));
  const curSet = new Set(violations.map(sig));
  return {
    added: violations.filter((x) => !baseSet.has(sig(x))),
    fixed: baseline.filter((x) => !curSet.has(sig(x))),
    total: violations.length,
    baselined: baseline.length,
  };
}

/* --------------------------------- CLI runner --------------------------------- */
import { pathToFileURL } from 'node:url';
const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (process.argv.includes('--update-baseline')) {
    const sorted = [...collectViolations()].sort((a, b) => sig(a).localeCompare(sig(b)));
    writeFileSync(BASELINE, JSON.stringify(sorted, null, 2) + '\n');
    process.stdout.write(`baseline updated: ${sorted.length} accepted pre-existing violation(s)\n`);
    process.exit(0);
  }
  const { added, fixed, total, baselined } = diffBaseline();
  process.stdout.write(`binding-fidelity: ${total} total, ${baselined} baselined, ${added.length} NEW, ${fixed.length} fixed\n`);
  if (fixed.length) process.stdout.write(`  ${fixed.length} baselined violation(s) no longer present — run --update-baseline to shrink the baseline\n`);
  if (added.length) {
    process.stdout.write(`\nNEW binding-fidelity violations (drift) — fix, or --update-baseline if intentional:\n`);
    for (const x of added.sort((a, b) => sig(a).localeCompare(sig(b)))) process.stdout.write(`  [${x.check}] ${x.site}\n     ${x.detail}\n`);
    process.exit(1);
  }
  process.stdout.write('OK — no new binding drift\n');
}
