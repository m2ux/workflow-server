/**
 * Binding-fidelity drift guard.
 *
 * Deterministic checks over every workflow's activities + techniques:
 *
 *   (1) arg-conformance — every `step.technique.inputs` key is a declared input, and every
 *       `step.technique.outputs` key a declared output, of the bound operation's composed
 *       signature (own ∪ group ∪ root). A key that is not in the signature is a stale/overfit
 *       deviation left behind by a rename or refactor.
 *
 *   (2) read-resolution — every `{token}` interpolation and structured-condition variable
 *       resolves to a producible bag name IN ITS OWN WORKFLOW'S SCOPE: an id declared by the
 *       workflow's techniques (or meta's, or an op the workflow's steps bind cross-workflow), a
 *       `{$local}` introduced in the same file, a `workflow.yaml` variable, an activity-produced
 *       var (set / setVariable / loop variable / binding remap target), or a known ambient.
 *       Resolution is per-workflow — an id declared only by an unrelated workflow does not
 *       satisfy a read here.
 *
 *   (3) dead-output — an output id declared in an op's own file that nothing OUTSIDE that file
 *       consumes: no `{token}` read, no condition variable, no step-binding value or remap, and
 *       no same-named declared input (the name-match chaining convention). A mention only in the
 *       declaring file's own protocol ("return `{x}`") is internal wiring, not a consumer.
 *       Outputs carrying an `#### artifact` block are exempt — the server consumes them when it
 *       synthesizes the activity artifact contract.
 *
 *   (4) orphan-input — a bound op's OWN declared input (contract-inherited entries are ambient
 *       session context and out of scope) with no producer in the binding workflow: no
 *       step-binding entry, workflow variable, step output or remap target, declared default,
 *       or "(optional)" marking. The executing agent must supply the value from its own working
 *       context. One finding per (binding workflow, op, input) — the same unsupplied input bound
 *       at N steps is one seam defect, and the baseline stays stable when steps move.
 *
 * Reference-resolution (every `step.technique` resolves through the loader) is covered by
 * scripts/check-all-refs.ts for `techniques[]` lists; step bindings are covered here by the
 * binding-resolution check.
 *
 * The current corpus carries pre-existing violations. Those are snapshotted in
 * scripts/binding-fidelity-baseline.json; the guard fails ONLY on violations absent from that
 * baseline (i.e. NEW drift introduced by a change). Regenerate the baseline after an
 * intentional, reviewed change with:
 *
 *   npx tsx scripts/check-binding-fidelity.ts --update-baseline
 *
 * Plain run (used by CI / the workflow-design validation step):
 *
 *   npx tsx scripts/check-binding-fidelity.ts
 *
 * To check a dedicated worktree's workflows instead of the repo's own ../workflows, pass
 * `--root <path>` (or set WORKFLOWS_DIR) — issue #160 follow-up #1:
 *
 *   npx tsx scripts/check-binding-fidelity.ts --root /path/to/worktree/workflows
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
// Convention building blocks shared with the server's provenance annotation (binding-provenance
// is their single source of truth), so guard and server cannot drift apart on what counts as an
// identifier, an optional input, or an ambient id.
import { AMBIENT_CONTEXT_IDS, IDENTIFIER_PATTERN, OPTIONAL_INPUT_RE } from '../src/utils/binding-provenance.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

// Resolve paths from this file's own URL (reliable under both tsx CLI and the vitest runner,
// where import.meta.dirname is not populated).
const DIR = fileURLToPath(new URL('.', import.meta.url));
// Corpus root defaults to the repo's own ../workflows; pass `--root <path>` or set WORKFLOWS_DIR
// to check a dedicated worktree's workflows instead (issue #160 follow-up #1). The baseline stays
// resolved against this script's own directory — it snapshots corpus content regardless of root.
const ROOT = resolveWorkflowsRoot(join(DIR, '..', 'workflows'));
const BASELINE = join(DIR, 'binding-fidelity-baseline.json');
const META = 'meta';

/* ----------------------------- signature parsing ----------------------------- */
type InputMeta = { hasDefault: boolean; optional: boolean };
type OutputMeta = { hasArtifact: boolean };
type DetailedSig = { inputs: Map<string, InputMeta>; outputs: Map<string, OutputMeta> };
type Sig = { inputs: Set<string>; outputs: Set<string> };
type OpEntry = { own: DetailedSig; composed: Sig };

function emptyDetailed(): DetailedSig { return { inputs: new Map(), outputs: new Map() }; }
function toSig(d: DetailedSig): Sig { return { inputs: new Set(d.inputs.keys()), outputs: new Set(d.outputs.keys()) }; }
function unionSig(a: Sig, b: Sig): Sig {
  return { inputs: new Set([...a.inputs, ...b.inputs]), outputs: new Set([...a.outputs, ...b.outputs]) };
}

/**
 * Parse a technique file's canonical `## Inputs` / `## Outputs` sections into per-entry detail:
 * input `#### default` blocks and leading "(optional)" description markers (both exempt an input
 * from the orphan-input check), and output `#### artifact` blocks (exempt from dead-output — the
 * server consumes artifact outputs when synthesizing the activity artifact contract).
 * Canonical headers only (the loader rejects singular variants) — a regression in header spelling
 * surfaces as an empty signature.
 */
function fileSigDetailed(p: string): DetailedSig {
  const det = emptyDetailed();
  let section: 'inputs' | 'outputs' | null = null;
  let entry: string | null = null;
  let awaitingProse = false;
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      const title = h2[1]!.trim();
      section = title === 'Inputs' ? 'inputs' : title === 'Outputs' ? 'outputs' : null;
      entry = null;
      continue;
    }
    if (!section) continue;
    const h3 = /^###\s+(\S+)\s*$/.exec(line);
    if (h3) {
      entry = h3[1]!.trim();
      awaitingProse = true;
      if (section === 'inputs') det.inputs.set(entry, { hasDefault: false, optional: false });
      else det.outputs.set(entry, { hasArtifact: false });
      continue;
    }
    if (!entry) continue;
    const h4 = /^####\s+(\S+)\s*$/.exec(line);
    if (h4) {
      awaitingProse = false;
      const sub = h4[1]!.trim();
      if (section === 'inputs' && sub === 'default') det.inputs.get(entry)!.hasDefault = true;
      if (section === 'outputs' && sub === 'artifact') det.outputs.get(entry)!.hasArtifact = true;
      continue;
    }
    if (awaitingProse && line.trim().length > 0) {
      awaitingProse = false;
      if (section === 'inputs' && OPTIONAL_INPUT_RE.test(line.trim())) det.inputs.get(entry)!.optional = true;
    }
  }
  return det;
}

type Reg = { ops: Map<string, OpEntry>; groups: Map<string, OpEntry> };
const registry = new Map<string, Reg>();
/** Ids declared by each workflow's own technique files (root, groups, ops — inputs and outputs). */
const declaredByWf = new Map<string, Set<string>>();
/** Own-file declared input ids across the corpus, with their declaration sites — consumption via
 *  name-match chaining (an output feeds a same-named input in ANOTHER file). */
const allDeclaredInputSites = new Map<string, Set<string>>();
/** Every own-file declared output, with its declaration site, for the dead-output check. */
const declaredOutputSites: Array<{ rel: string; id: string; hasArtifact: boolean }> = [];

function buildRegistry(wf: string): void {
  const tdir = join(ROOT, wf, 'techniques');
  if (!existsSync(tdir)) return;
  const reg: Reg = { ops: new Map(), groups: new Map() };
  const declared = new Set<string>();
  const note = (d: DetailedSig, rel: string) => {
    d.inputs.forEach((_, x) => {
      declared.add(x);
      let sites = allDeclaredInputSites.get(x);
      if (!sites) { sites = new Set(); allDeclaredInputSites.set(x, sites); }
      sites.add(rel);
    });
    d.outputs.forEach((meta, x) => { declared.add(x); declaredOutputSites.push({ rel, id: x, hasArtifact: meta.hasArtifact }); });
  };
  // The workflow-root techniques/TECHNIQUE.md declares Inputs/Outputs inherited by every op
  // (composeLoaded merges the root into each descendant). Include it in the declared set and in
  // every composed signature, else root-hoisted inputs (AP-52) read as unresolved / mis-flag
  // arg-conformance.
  const rootIdx = join(tdir, 'TECHNIQUE.md');
  const rootDet = existsSync(rootIdx) ? fileSigDetailed(rootIdx) : emptyDetailed();
  note(rootDet, relative(ROOT, rootIdx));
  const rootSig = toSig(rootDet);
  const withRoot = (s: Sig): Sig => unionSig(s, rootSig);
  for (const entry of readdirSync(tdir)) {
    const p = join(tdir, entry); const st = statSync(p);
    if (st.isFile() && entry.endsWith('.md') && entry !== 'TECHNIQUE.md') {
      const det = fileSigDetailed(p); note(det, relative(ROOT, p));
      reg.ops.set(entry.slice(0, -3), { own: det, composed: withRoot(toSig(det)) });
    } else if (st.isDirectory()) {
      const idx = join(p, 'TECHNIQUE.md');
      const gdet = existsSync(idx) ? fileSigDetailed(idx) : emptyDetailed();
      if (existsSync(idx)) note(gdet, relative(ROOT, idx));
      const gsig = toSig(gdet);
      reg.groups.set(entry, { own: gdet, composed: withRoot(gsig) });
      for (const f of readdirSync(p)) {
        if (f.endsWith('.md') && f !== 'TECHNIQUE.md') {
          const own = fileSigDetailed(join(p, f)); note(own, relative(ROOT, join(p, f)));
          reg.ops.set(`${entry}::${f.slice(0, -3)}`, { own, composed: withRoot(unionSig(toSig(own), gsig)) });
        }
      }
    }
  }
  registry.set(wf, reg);
  declaredByWf.set(wf, declared);
}

const workflows = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory() && existsSync(join(ROOT, d, 'techniques')));
for (const wf of workflows) buildRegistry(wf);

function resolve(ref: string, wf: string, activityId?: string): { entry: OpEntry; homeWf: string; key: string } | null {
  // Cross-workflow canonical prefix (mirrors the server's readTechnique `::` cross-workflow branch in
  // technique-loader.ts): `<workflow>::<technique>` or `<workflow>::<group>::<op>` resolves DIRECTLY
  // against that workflow's registry, with NO meta fallback. The leading segment is treated as a
  // workflow only when it names a real workflow in the registry; otherwise it is a same-workflow
  // `<group>::<op>` and falls through to the blocks below.
  if (ref.includes('::')) {
    const segs = ref.split('::');
    if (segs.length >= 2 && registry.has(segs[0]!)) {
      const r = registry.get(segs[0]!)!;
      const rest = segs.slice(1).join('::');
      if (r.ops.has(rest)) return { entry: r.ops.get(rest)!, homeWf: segs[0]!, key: rest };
      if (r.groups.has(rest)) return { entry: r.groups.get(rest)!, homeWf: segs[0]!, key: rest };
      return null;
    }
  }
  // Activity-group convention (mirrors the server's get_technique): a bare op resolves FIRST against
  // the group named after the current activity — `<activity-id>::<op>` — taking precedence over a
  // same-named standalone/group-base, so an op that shares its group's name (`research` ->
  // `research::research`) selects the op, not the group base.
  if (activityId && !ref.includes('::')) {
    for (const c of wf !== META ? [wf, META] : [META]) {
      const r = registry.get(c);
      if (r?.ops.has(`${activityId}::${ref}`)) return { entry: r.ops.get(`${activityId}::${ref}`)!, homeWf: c, key: `${activityId}::${ref}` };
    }
  }
  const slash = ref.indexOf('/');
  if (slash > 0 && !ref.includes('::')) {
    const home = ref.slice(0, slash);
    const r = registry.get(home); const rest = ref.slice(slash + 1);
    if (r) {
      if (r.ops.has(rest)) return { entry: r.ops.get(rest)!, homeWf: home, key: rest };
      if (r.groups.has(rest)) return { entry: r.groups.get(rest)!, homeWf: home, key: rest };
    }
  }
  for (const c of wf !== META ? [wf, META] : [META]) {
    const r = registry.get(c); if (!r) continue;
    if (r.ops.has(ref)) return { entry: r.ops.get(ref)!, homeWf: c, key: ref };
    if (!ref.includes('::') && r.groups.has(ref)) return { entry: r.groups.get(ref)!, homeWf: c, key: ref };
  }
  return null;
}

/* ----------------------------- corpus collection ----------------------------- */
const AMBIENT = new Set(AMBIENT_CONTEXT_IDS);
const PLACEHOLDER = new Set(['path', 'token', 'placeholder', 'field', 'key', 'value', 'var', 'x', 'n', 'i', 'templated', 'output_id', 'declared_id', 'id', 'name', 'type', 'o']);
/** Per-workflow produced names: workflow.yaml vars + activity set/loop/setVariable targets. */
const producedByWf = new Map<string, Set<string>>();
const fileLocals = new Map<string, Set<string>>();

function produced(wf: string): Set<string> {
  let s = producedByWf.get(wf);
  if (!s) { s = new Set(); producedByWf.set(wf, s); }
  return s;
}

function collectWorkflowVars(wf: string): void {
  const wt = join(ROOT, wf, 'workflow.yaml');
  if (!existsSync(wt)) return;
  try {
    const p = parseDefinition(readFileSync(wt, 'utf-8')) as { variables?: Array<{ name?: string }>; context?: Array<{ name?: string }> };
    for (const v of p?.variables ?? []) if (v?.name) produced(wf).add(v.name);
    for (const v of p?.context ?? []) if (v?.name) produced(wf).add(v.name);
  } catch { /* structural errors are validate-workflow-yaml's job */ }
}

type Step = {
  rel: string; wf: string; stepId: string; technique: string;
  inputsMap: Record<string, unknown>; outputsMap: Record<string, string>; activityId: string;
};
const steps: Step[] = [];
function walkSteps(wf: string, rel: string, node: unknown, activityId: string): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((n) => walkSteps(wf, rel, n, activityId)); return; }
  const o = node as Record<string, unknown>;
  // A step's technique binding is either a bare string (no deviations) or a structured object
  // `{ name, inputs?, outputs? }` — inputs are op-input deviations, outputs are op-output remaps.
  const t = o.technique;
  if (typeof t === 'string' || (t && typeof t === 'object' && typeof (t as { name?: unknown }).name === 'string')) {
    const tb = (typeof t === 'string' ? { name: t } : t) as { name: string; inputs?: Record<string, unknown>; outputs?: Record<string, string> };
    steps.push({
      rel, wf, stepId: typeof o.id === 'string' ? o.id : '?', technique: tb.name,
      inputsMap: tb.inputs ?? {}, outputsMap: tb.outputs ?? {}, activityId,
    });
  }
  if (o.action === 'set' && typeof o.target === 'string') produced(wf).add(o.target);
  if (o.setVariable && typeof o.setVariable === 'object') Object.keys(o.setVariable).forEach((k) => produced(wf).add(k));
  const eff = o.effect as { setVariable?: object } | undefined;
  if (eff?.setVariable) Object.keys(eff.setVariable).forEach((k) => produced(wf).add(k));
  if (typeof o.variable === 'string') produced(wf).add(o.variable);
  for (const v of Object.values(o)) walkSteps(wf, rel, v, activityId);
}

type Read = { rel: string; line: number; full: string; head: string; kind: 'technique' | 'activity' };
const reads: Read[] = [];
function collectReads(rel: string, content: string, kind: 'technique' | 'activity'): void {
  const locals = new Set<string>();
  const reIntro = new RegExp(`\\{\\$(${IDENTIFIER_PATTERN})\\}`, 'g'); let mi: RegExpExecArray | null;
  while ((mi = reIntro.exec(content))) locals.add(mi[1]!);
  fileLocals.set(rel, locals);
  const reToken = new RegExp(`\\{(\\$?)(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)\\}`, 'g');
  const reCondVar = new RegExp(`^\\s*variable:\\s*"?(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)"?`);
  content.split('\n').forEach((line, i) => {
    const re = new RegExp(reToken.source, 'g'); let m: RegExpExecArray | null;
    while ((m = re.exec(line))) { if (m[1] === '$') continue; reads.push({ rel, line: i + 1, full: m[2], head: m[2].split('.')[0], kind }); }
    if (kind === 'activity') {
      const cv = reCondVar.exec(line);
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
    if (!f.endsWith('.yaml')) continue;
    const rel = relative(ROOT, join(adir, f)); const raw = readFileSync(join(adir, f), 'utf-8');
    collectReads(rel, raw, 'activity');
    try {
      const dec = parseDefinition(raw);
      const activityId = dec && typeof dec === 'object' && typeof (dec as { id?: unknown }).id === 'string' ? (dec as { id: string }).id : '';
      walkSteps(wf, rel, dec, activityId);
    } catch { /* validate-workflow-yaml's job */ }
  }
}

/* ----------------------------- scope assembly ----------------------------- */
const BARE_NAME_RE = new RegExp(`^${IDENTIFIER_PATTERN}$`);
const VALUE_TOKEN_RE = new RegExp(`\\{(${IDENTIFIER_PATTERN})\\}`, 'g');

/**
 * The bag names a step actually produces: its binding's remap targets, plus the bound op's own
 * declared outputs except the remapped ones (a remapped output's value lands under the remap
 * target, not its own id).
 */
function stepProducedNames(s: Step): Set<string> {
  const out = new Set<string>(Object.values(s.outputsMap));
  const r = resolve(s.technique, s.wf, s.activityId);
  if (r) {
    const remapped = new Set(Object.keys(s.outputsMap));
    r.entry.own.outputs.forEach((_, id) => { if (!remapped.has(id)) out.add(id); });
  }
  return out;
}

/** Producer-only names available in a workflow: vars/set-targets, step outputs, remap targets,
 *  ambients. Declared INPUT ids are deliberately absent — an input is not its own producer. */
const producersCache = new Map<string, Set<string>>();
function producersOf(wf: string): Set<string> {
  const hit = producersCache.get(wf);
  if (hit) return hit;
  const s = new Set<string>([...(producedByWf.get(wf) ?? []), ...AMBIENT]);
  for (const st of steps) {
    if (st.wf !== wf) continue;
    stepProducedNames(st).forEach((n) => s.add(n));
  }
  producersCache.set(wf, s);
  return s;
}

/** Read-resolution scope of a workflow: everything its files may legitimately reference — its own
 *  declared ids, meta's (the shared layer), the composed signatures of ops its steps bind
 *  cross-workflow, its produced names, and ambients. */
const scopeCache = new Map<string, Set<string>>();
function scopeOf(wf: string): Set<string> {
  const hit = scopeCache.get(wf);
  if (hit) return hit;
  const s = new Set<string>([
    ...(declaredByWf.get(wf) ?? []),
    ...(wf !== META ? declaredByWf.get(META) ?? [] : []),
    ...producersOf(wf),
  ]);
  for (const st of steps) {
    if (st.wf !== wf) continue;
    const r = resolve(st.technique, st.wf, st.activityId);
    if (r && r.homeWf !== wf && r.homeWf !== META) {
      r.entry.composed.inputs.forEach((id) => s.add(id));
      r.entry.composed.outputs.forEach((id) => s.add(id));
    }
  }
  scopeCache.set(wf, s);
  return s;
}

/** Where each name is consumed: `{token}` reads and condition variables, binding remap keys,
 *  binding input values (bare names and embedded tokens), and same-named declared inputs (the
 *  name-match chaining convention) — keyed by consuming file. Liveness for the dead-output check
 *  is consumption OUTSIDE the declaring file: an output mentioned only by its own protocol prose
 *  ("return `{x}`") has no downstream consumer. */
function collectConsumedSites(): Map<string, Set<string>> {
  const consumed = new Map<string, Set<string>>();
  const add = (name: string, rel: string): void => {
    let sites = consumed.get(name);
    if (!sites) { sites = new Set(); consumed.set(name, sites); }
    sites.add(rel);
  };
  for (const r of reads) add(r.head, r.rel);
  for (const s of steps) {
    Object.keys(s.outputsMap).forEach((k) => add(k, s.rel));
    for (const v of Object.values(s.inputsMap)) {
      if (typeof v !== 'string') continue;
      for (const m of v.matchAll(VALUE_TOKEN_RE)) add(m[1]!, s.rel);
      if (BARE_NAME_RE.test(v)) add(v, s.rel);
    }
  }
  for (const [id, rels] of allDeclaredInputSites) rels.forEach((rel) => add(id, rel));
  return consumed;
}

/* --------------------------------- checks --------------------------------- */
export interface Violation {
  check: 'arg-conformance' | 'read-resolution' | 'binding-resolution' | 'dead-output' | 'orphan-input';
  site: string;
  detail: string;
}

export function collectViolations(): Violation[] {
  const v: Violation[] = [];
  // Orphan-input findings are one-per-root-cause: the same unsupplied op input bound at N steps is
  // ONE defect (on the op ↔ workflow seam), so entries key on (binding workflow, resolved op,
  // input) — the baseline stays stable when steps move between activities.
  const orphans = new Map<string, Violation>();
  // (1) binding-resolution + arg-conformance + orphan-input
  for (const s of steps) {
    const r = resolve(s.technique, s.wf, s.activityId);
    if (!r) {
      // A step's `technique:` ref must resolve to a real operation (workflow-local, meta, or
      // cross-workflow). check-all-refs only validates the activity/workflow `techniques[]` list, so
      // after the step-binding migration this is the only guard covering step.technique bindings.
      v.push({ check: 'binding-resolution', site: `${s.rel}[${s.stepId}]`, detail: `step technique '${s.technique}' does not resolve` });
      continue;
    }
    const sig = r.entry.composed;
    // The structured binding separates input deviations from output remaps: every `inputs` key must
    // be a declared INPUT of the op, every `outputs` key a declared OUTPUT. A key that doesn't match
    // its side is a stale/overfit binding left behind by a rename or refactor.
    for (const key of Object.keys(s.inputsMap)) if (!sig.inputs.has(key)) {
      v.push({ check: 'arg-conformance', site: `${s.rel}[${s.stepId}]`, detail: `${s.technique}: inputs key '${key}' is not a declared input of the op` });
    }
    for (const key of Object.keys(s.outputsMap)) if (!sig.outputs.has(key)) {
      v.push({ check: 'arg-conformance', site: `${s.rel}[${s.stepId}]`, detail: `${s.technique}: outputs key '${key}' is not a declared output of the op` });
    }
    // Orphan-input: the op's OWN inputs must be suppliable in the binding workflow. Inherited
    // (root/group) entries are ambient session context — B2 marks them; not checked per step.
    for (const [inputId, meta] of r.entry.own.inputs) {
      if (meta.hasDefault || meta.optional) continue;
      if (inputId in s.inputsMap) continue;
      if (producersOf(s.wf).has(inputId)) continue;
      const opId = r.homeWf === s.wf ? r.key : `${r.homeWf}::${r.key}`;
      orphans.set(`${s.wf} ${opId} ${inputId}`, {
        check: 'orphan-input', site: `${s.wf} :: ${opId}`,
        detail: `own input '${inputId}' has no producer in workflow '${s.wf}' (no step-binding entry, workflow variable, step output, or default)`,
      });
    }
  }
  v.push(...orphans.values());
  // (2) read-resolution — workflow-scoped
  for (const r of reads) {
    if (PLACEHOLDER.has(r.head)) continue;
    const locals = fileLocals.get(r.rel) ?? new Set<string>();
    if (locals.has(r.head)) continue;
    const wf = r.rel.split('/')[0]!;
    if (scopeOf(wf).has(r.head)) continue;
    v.push({ check: 'read-resolution', site: `${r.rel}:${r.line}`, detail: `{${r.full}} has no producer (declared id / $-local / workflow var / set-target)` });
  }
  // (3) dead-output
  const consumed = collectConsumedSites();
  for (const site of declaredOutputSites) {
    if (site.hasArtifact) continue;
    const consumers = consumed.get(site.id);
    if (consumers && [...consumers].some((rel) => rel !== site.rel)) continue;
    v.push({
      check: 'dead-output', site: site.rel,
      detail: `output '${site.id}' is declared but nothing outside its own file consumes it (no read, condition, binding value, remap, or same-named input)`,
    });
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
