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
 *       consumes: no `{token}` read, no condition variable, no step-binding value or remap, no
 *       loop `over` collection, and no same-named declared input (the name-match chaining
 *       convention). A mention only in the
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
 * The corpus carries pre-existing violations. This guard reports ALL of them and exits 1; it no
 * longer holds a stored baseline of accepted ones (issue #327 R1/R5). "Did MY change cause this?"
 * is answered by `npm run check:delta`, which runs the guard against the merge-base tree as well
 * and reports only the difference — the before-state is the merge-base, so there is nothing to
 * store and nothing to drift. The retired `binding-fidelity-baseline.json` had accumulated 27
 * entries for already-fixed violations, and had silently absorbed two live defects that later cost
 * a three-hour run (#324 A1/A2).
 *
 *   npx tsx scripts/check-binding-fidelity.ts [--root <workflows-dir>] [--json]
 *   npm run check:delta            # only what this branch added, against the merge-base
 *
 * To check a dedicated worktree's workflows instead of the repo's own ../workflows, pass
 * `--root <path>` (or set WORKFLOWS_DIR) — issue #160 follow-up #1.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
// Convention building blocks shared with the server's provenance annotation (binding-provenance
// is their single source of truth), so guard and server cannot drift apart on what counts as an
// identifier, an optional input, or an ambient id.
import { AMBIENT_CONTEXT_IDS, IDENTIFIER_PATTERN, OPTIONAL_INPUT_RE } from '../src/utils/binding-provenance.js';
import { injectCheckpointFragmentBodies, resolveCheckpointFragment } from '../src/loaders/fragment-resolver.js';
import { fragmentsLookupSync } from './fragments-index.js';
import { assertScanned } from './workflows-root.js';
import { findingKey, report, requireRootOrExit, wantsJson, type Finding } from './guard-protocol.js';
import { spawnSync } from 'node:child_process';

// Resolve paths from this file's own URL (reliable under both tsx CLI and the vitest runner,
// where import.meta.dirname is not populated).
const DIR = fileURLToPath(new URL('.', import.meta.url));
// Corpus root defaults to the repo's own ../workflows; pass `--root <path>` or set WORKFLOWS_DIR
// to check a dedicated worktree's workflows instead (issue #160 follow-up #1). An unreachable or
// empty root throws rather than yielding an empty, reassuring result (#327 S2).
const ROOT = requireRootOrExit('binding-fidelity', join(DIR, '..', 'workflows'));
// The triage file records a verdict per known violation; it lives beside the guard, not beside the
// corpus, because it classifies findings rather than corpus content.
const TRIAGE = join(DIR, 'binding-fidelity-triage.json');
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
assertScanned(workflows.length, 'workflows with a techniques/ folder', ROOT);
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
// Metasyntactic tokens: notation for "some id", not a read of a bag value. `O` is the output-id
// metavariable the variable-binding spec uses when describing the landing rule generically.
const PLACEHOLDER = new Set(['path', 'token', 'placeholder', 'field', 'key', 'value', 'var', 'x', 'n', 'i', 'templated', 'output_id', 'declared_id', 'id', 'name', 'type', 'o', 'O']);
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
/**
 * Bag names read by an EXPRESSION rather than a `{token}` or a structured `variable:` key — a step's
 * `when` string and a `validate` action's `target`. Both are consumption sites, and neither was
 * visible to the read scan, so an output whose only consumer was a `when` gate or a validate gate
 * read as dead — the opposite of dead (#327 R3).
 */
const expressionConsumes: Array<{ rel: string; stepId: string; name: string }> = [];

/**
 * Namespaces naming the ENVIRONMENT rather than the variable bag: `gh.auth.status == 0` asks the
 * GitHub CLI, not the session. A probe head has no producer by construction, so resolution has to
 * know them by name — dotted-ness cannot discriminate, since `planning_folder_path.writable` is a
 * real bag name carrying a probed field.
 */
const ENV_PROBES = new Set(['gh', 'gpg', 'git', 'signing', 'workflows']);

/**
 * The bag names an expression READS — the left operand of each comparison, plus a bare clause read
 * for truthiness.
 *
 * Only the left side. A right operand is a value, and an unquoted one is indistinguishable from an
 * identifier by shape: `analysis_type == completion` would otherwise read `completion` as a bag name
 * that nothing can ever produce. #327 collected every identifier in the string, which was safe while
 * these names only MARKED consumption — a false name there costs nothing. Feeding them to
 * resolution makes the extractor load-bearing, so it parses clauses instead of harvesting words.
 */
export function expressionReads(expr: string): string[] {
  const out: string[] = [];
  for (const clause of expr.split(/&&|\|\|/)) {
    const compared = clause.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)*)\s*(?:==|!=|>=|<=|>|<)/);
    const bare = clause.match(/^\s*!?\s*([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)*)\s*$/);
    const ref = compared?.[1] ?? bare?.[1];
    if (!ref) continue;
    const head = ref.split('.')[0]!;
    if (!ENV_PROBES.has(head)) out.push(head);
  }
  return out;
}

function walkSteps(wf: string, rel: string, node: unknown, activityId: string, stepId = '?'): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((n) => walkSteps(wf, rel, n, activityId, stepId)); return; }
  const o = node as Record<string, unknown>;
  // A gate expression is reported at its enclosing step, not by line: the walk reads parsed YAML,
  // which carries no line numbers, and a `validate` target sits inside `actions[]` where the step id
  // is already out of scope.
  const here = typeof o.id === 'string' ? o.id : stepId;
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
  // A `validate` action's `target` and a step's `when` are expressions over bag names
  // (`fragment_references_issue != false`, `has_debt_markers == true`) — the one place the value is
  // enforced or the gate that consumes it.
  if (o.action === 'validate' && typeof o.target === 'string') {
    for (const name of expressionReads(o.target)) expressionConsumes.push({ rel, stepId: here, name });
  }
  if (typeof o.when === 'string') {
    for (const name of expressionReads(o.when)) expressionConsumes.push({ rel, stepId: here, name });
  }
  if (o.setVariable && typeof o.setVariable === 'object') Object.keys(o.setVariable).forEach((k) => produced(wf).add(k));
  const eff = o.effect as { setVariable?: object } | undefined;
  if (eff?.setVariable) Object.keys(eff.setVariable).forEach((k) => produced(wf).add(k));
  if (typeof o.variable === 'string') produced(wf).add(o.variable);
  // A `forEach` loop's `over` names the collection it iterates, which is the one place that
  // collection is read. Its producer has a consumer here, and a collection reaching the loop
  // through no other name is live. `over` reaches a field of a produced object as often as the
  // object itself (`implementation_plan.tasks`), so it resolves against its head like any read.
  if (typeof o.over === 'string') {
    expressionConsumes.push({ rel, stepId: here, name: o.over.split('.')[0]! });
  }
  for (const v of Object.values(o)) walkSteps(wf, rel, v, activityId, here);
}

type Read = { rel: string; line: number; full: string; head: string; kind: 'technique' | 'activity' };
const reads: Read[] = [];

/**
 * Blank the contents of fenced code blocks, keeping line count so finding sites stay accurate.
 *
 * A fence holds a literal — an artifact template (`### Issue {number}: {title}`), a YAML example, a
 * shell command. Its braces name the fields of the rendered thing, not values in the variable bag,
 * so scanning them produced findings that could never be fixed except by deleting the template.
 * INLINE code spans are deliberately left alone: house style backticks real designators
 * (`` `{failed_checks}` ``), so stripping those would blind the check to most genuine reads.
 */
function blankFences(content: string): string {
  const fence = /^\s*(```|~~~)/;
  let inFence = false;
  return content
    .split('\n')
    .map((line) => {
      if (fence.test(line)) { inFence = !inFence; return ''; }
      return inFence ? '' : line;
    })
    .join('\n');
}

function collectReads(rel: string, raw: string, kind: 'technique' | 'activity'): void {
  const content = blankFences(raw);
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

/**
 * Output ids a technique's OWN `#### artifact` bodies interpolate — the `{package_name}` in
 * `` `{package_name}-plan.md` ``. Those tokens resolve out of the bag when the server synthesizes the
 * activity artifact contract, which is the same consumer that exempts an artifact-CARRYING output
 * from dead-output. The value is therefore consumed, even though its only mention sits inside the
 * declaring file, where the dead-output check deliberately does not look for consumers.
 */
const artifactTemplateTokens = new Map<string, Set<string>>();

function collectArtifactTemplateTokens(rel: string, raw: string): void {
  const token = new RegExp(`\\{(${IDENTIFIER_PATTERN})(?:\\.[a-zA-Z0-9_]+)*\\}`, 'g');
  const names = new Set<string>();
  let inOutputs = false;
  let inArtifact = false;
  for (const line of raw.split('\n')) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) { inOutputs = h2[1]!.trim() === 'Outputs'; inArtifact = false; continue; }
    if (!inOutputs) continue;
    if (/^###\s/.test(line)) { inArtifact = false; continue; }
    const h4 = /^####\s+(\S+)\s*$/.exec(line);
    if (h4) { inArtifact = h4[1]!.trim() === 'artifact'; continue; }
    if (!inArtifact) continue;
    for (const m of line.matchAll(token)) names.add(m[1]!);
  }
  if (names.size) artifactTemplateTokens.set(rel, names);
}

// techniques
for (const wf of workflows) {
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e); const st = statSync(p);
      if (st.isDirectory()) { if (e !== 'resources') walk(p); }
      else if (e.endsWith('.md')) {
        const raw = readFileSync(p, 'utf-8');
        collectReads(relative(ROOT, p), raw, 'technique');
        collectArtifactTemplateTokens(relative(ROOT, p), raw);
      }
    }
  };
  walk(join(ROOT, wf, 'techniques'));
}
// activities + workflow vars
const fragmentsLookup = fragmentsLookupSync(ROOT);
const allWf = new Set([...workflows, ...readdirSync(ROOT).filter((d) => { const p = join(ROOT, d); return statSync(p).isDirectory() && existsSync(join(p, 'activities')); })]);
/**
 * Every activity file under a workflow's `activities/`, INCLUDING nested library subdirectories.
 * The server's own `loadActivitiesFromDir` is deliberately non-recursive (a subdirectory is a
 * borrowable library, not part of the lifecycle graph), and this guard used to mirror that — which
 * left `meta/activities/patterns/` completely unmeasured, so its step bindings and the outputs its
 * loop conditions consume were invisible in both directions (#327 S2).
 */
function activityFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...activityFiles(p));
    else if (entry.endsWith('.yaml')) out.push(p);
  }
  return out;
}

for (const wf of allWf) {
  collectWorkflowVars(wf);
  // workflow.yaml is a reader too: its `rules` and `description` prose interpolates declared ids
  // (`When {headless_mode} is true, a checkpoint declaring both resolves to its defaultOption`), and
  // that is the value's one authoritative consumer. Scanning only activities left those reads
  // invisible, so the id they name read as dead.
  const wfYaml = join(ROOT, wf, 'workflow.yaml');
  if (existsSync(wfYaml)) collectReads(relative(ROOT, wfYaml), readFileSync(wfYaml, 'utf-8'), 'activity');
  const adir = join(ROOT, wf, 'activities');
  if (!existsSync(adir)) continue;
  for (const path of activityFiles(adir)) {
    const rel = relative(ROOT, path); let raw = readFileSync(path, 'utf-8');
    // Materialize checkpoint fragment refs (#166 B10) before analysis, so fragment-declared
    // setVariable producers and message/condition reads attribute to the referencing activity —
    // the same view the server delivers. An unresolved ref is check:fragments' finding; the
    // file is then analyzed as authored.
    try {
      raw = injectCheckpointFragmentBodies(raw, (ref) => resolveCheckpointFragment(fragmentsLookup, wf, ref));
    } catch { /* check:fragments reports unresolved refs */ }
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
 *  binding input values (bare names and embedded tokens), loop `over` collections, and same-named
 *  declared inputs (the name-match chaining convention) — keyed by consuming file. Liveness for
 *  the dead-output check
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
  for (const v of expressionConsumes) add(v.name, v.rel);
  return consumed;
}

/**
 * Which workflows genuinely reach into a home workflow's operations, from the bind sites themselves:
 * `remediate-vuln` borrowing a `work-package` op can consume that op's outputs, and `meta` is the
 * universal library every workflow binds ad hoc.
 */
const crossWorkflowConsumers = ((): Map<string, Set<string>> => {
  const reach = new Map<string, Set<string>>();
  for (const s of steps) {
    const r = resolve(s.technique, s.wf, s.activityId);
    if (!r || r.homeWf === s.wf) continue;
    let into = reach.get(r.homeWf);
    if (!into) { into = new Set(); reach.set(r.homeWf, into); }
    into.add(s.wf);
  }
  return reach;
})();

/**
 * Which workflows a workflow DISPATCHES as a child: a step whose binding supplies a literal
 * `workflow_id` naming another workflow in the corpus. The child inherits the parent's variable bag,
 * so the parent's declared outputs are consumed inside the child — `prism-audit` composes
 * `analysis_focus` and `target_description`, and `prism` declares both as variables and reads them in
 * its analysis ops. That edge is a dispatch, not an op borrow, so bind-site resolution cannot see it.
 */
const dispatchedWorkflows = ((): Map<string, Set<string>> => {
  const out = new Map<string, Set<string>>();
  for (const s of steps) {
    const child = s.inputsMap.workflow_id;
    if (typeof child !== 'string' || !allWf.has(child) || child === s.wf) continue;
    let into = out.get(s.wf);
    if (!into) { into = new Set(); out.set(s.wf, into); }
    into.add(child);
  }
  return out;
})();

/**
 * Whether a consumer file can close a dead-output finding on a declaring file.
 *
 * Resolution used to be by bare name across the whole corpus, so an output in workflow A read as
 * consumed when an unrelated workflow B happened to read a name of the same spelling — and B has no
 * address for A's op, so it cannot bind it (#342). The masking presented as a STALE triage entry,
 * which reads like progress, and forced real debt out of the ledger.
 */
function consumerReaches(consumerRel: string, declaringRel: string): boolean {
  const consumerWf = consumerRel.split('/')[0]!;
  const declaringWf = declaringRel.split('/')[0]!;
  if (consumerWf === declaringWf) return true;
  if (declaringWf === META) return true;
  if (crossWorkflowConsumers.get(declaringWf)?.has(consumerWf)) return true;
  if (dispatchedWorkflows.get(declaringWf)?.has(consumerWf)) return true;
  // The BORROW direction. `midnight-system-review` binds `work-package::post-review-comment`, whose
  // declared `review_summary` input is what its own `render-review` output feeds — name-match
  // chaining across the borrow. Reach is symmetric on a bind: a borrowed op's file is a real
  // consumer of the borrowing workflow's values, and only the home direction was covered.
  return crossWorkflowConsumers.get(consumerWf)?.has(declaringWf) ?? false;
}

/** Dead-output findings that a consumer closed: `<declaring rel> <output id>` -> satisfying file. */
export const deadOutputSatisfier = new Map<string, string>();

/** Exported for the scoping test: the reach rule every closure must satisfy (#342). */
export { consumerReaches };

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
  // Findings key on the seam, not the step, so a bind site that DOES pass an input has to be able to
  // clear one an earlier site raised. A caller-supplied input is the convention for shared ops —
  // `write-artifact` takes `bare_filename` only where the caller overrides the producing technique's
  // declared artifact name — and one site passing it proves the value reaches the op by design, so
  // "has no producer" is a false claim about that seam. Collect the proofs and subtract them below.
  const callerSupplied = new Set<string>();
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
      const opId = r.homeWf === s.wf ? r.key : `${r.homeWf}::${r.key}`;
      const seam = `${s.wf}\u0000${opId}\u0000${inputId}`;
      if (inputId in s.inputsMap) { callerSupplied.add(seam); continue; }
      if (producersOf(s.wf).has(inputId)) continue;
      orphans.set(seam, {
        check: 'orphan-input', site: `${s.wf} :: ${opId}`,
        detail: `own input '${inputId}' has no producer in workflow '${s.wf}' (no step-binding entry, workflow variable, step output, or default)`,
      });
    }
  }
  for (const seam of callerSupplied) orphans.delete(seam);
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
  // (2b) read-resolution over gate expressions — the same scope a `{token}` resolves against.
  // #327 taught the guard to count a `when` and a `validate` target as CONSUMPTION, which stopped a
  // gated value reading as dead. It never checked the other direction, so a gate naming a value
  // nothing produces was accepted and could never fire (#341 R1, the #324 A2 class).
  for (const e of expressionConsumes) {
    if (PLACEHOLDER.has(e.name)) continue;
    const wf = e.rel.split('/')[0]!;
    if (scopeOf(wf).has(e.name)) continue;
    v.push({
      check: 'read-resolution', site: `${e.rel}[${e.stepId}]`,
      detail: `gate expression reads '${e.name}', which has no producer (declared id / workflow var / set-target)`,
    });
  }
  // (3) dead-output — consumer resolution scoped to the declaring workflow
  const consumed = collectConsumedSites();
  for (const site of declaredOutputSites) {
    if (site.hasArtifact) continue;
    if (artifactTemplateTokens.get(site.rel)?.has(site.id)) continue;
    const satisfier = [...(consumed.get(site.id) ?? [])].find((rel) => rel !== site.rel && consumerReaches(rel, site.rel));
    if (satisfier) { deadOutputSatisfier.set(`${site.rel}\u0000${site.id}`, satisfier); continue; }
    v.push({
      check: 'dead-output', site: site.rel,
      detail: `output '${site.id}' is declared but nothing outside its own file consumes it (no read, condition, binding value, remap, or same-named input)`,
    });
  }
  return v;
}

/* --------------------------------- triage --------------------------------- */
/**
 * The corpus debt this guard reports was triaged once, per finding, in
 * scripts/binding-fidelity-triage.json (issue #327 R3). Every entry carries a verdict and a named
 * rationale, so "harmless" and "live bug" are no longer the same silence:
 *
 *   harmless   — the finding is correct about the structure and correct BY DESIGN; suppressed.
 *   fix-later  — a real seam to close, accepted as debt for now; suppressed but counted.
 *   live-bug   — affects a run; REPORTED, so the guard stays red until it is fixed.
 *
 * A violation absent from the file is untriaged and reported. An entry that matches nothing is
 * stale and reported. There is no regenerate flag: the file is edited by a human making a judgement,
 * which is what the retired baseline never required.
 */
export type TriageVerdict = 'harmless' | 'fix-later' | 'live-bug';

export interface TriageEntry extends Violation {
  verdict: TriageVerdict;
  /** Key into the file's `rationales` map — the reason this verdict holds. */
  rationale: string;
}

export interface TriageFile {
  corpusSha: string;
  rationales: Record<string, string>;
  entries: TriageEntry[];
}

export function violationKey(x: Violation): string { return findingKey(x as Finding); }

export function loadTriage(): TriageFile {
  if (!existsSync(TRIAGE)) return { corpusSha: '', rationales: {}, entries: [] };
  return JSON.parse(readFileSync(TRIAGE, 'utf-8')) as TriageFile;
}

/**
 * How far the corpus has moved since these verdicts were made, or null where that cannot be
 * established. Report-only: see docs/development.md § Corpus-coupled baselines.
 */
export function triageStampNote(corpusSha: string, root: string = ROOT): string | null {
  if (!corpusSha) return null;
  const head = spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf-8' });
  if (head.status !== 0) return null;
  const current = head.stdout.trim();
  if (!current || current === corpusSha) return null;
  const behind = spawnSync(
    'git', ['-C', root, 'rev-list', '--count', `${corpusSha}..${current}`], { encoding: 'utf-8' },
  );
  const commits = behind.status === 0 ? behind.stdout.trim() : '';
  const distance = commits && commits !== '0' ? ` — ${commits} corpus commit(s) since` : '';
  return `triage verdicts were made against corpus ${corpusSha.slice(0, 12)}, `
    + `the checkout is at ${current.slice(0, 12)}${distance}`;
}

export interface TriagedResult {
  findings: Finding[];
  counts: Record<TriageVerdict | 'untriaged' | 'stale' | 'misplaced', number>;
  total: number;
}

export function applyTriage(violations: Violation[] = collectViolations()): TriagedResult {
  const triage = loadTriage();
  const byKey = new Map(triage.entries.map((e) => [violationKey(e), e]));
  const seen = new Set<string>();
  const findings: Finding[] = [];
  const counts = { harmless: 0, 'fix-later': 0, 'live-bug': 0, untriaged: 0, stale: 0, misplaced: 0 };
  // Where each key's findings actually sit, so an entry's own line can be checked against them.
  const linesByKey = new Map<string, Set<number>>();
  for (const v of violations) {
    const line = /:(\d+)$/.exec(v.site)?.[1];
    if (line === undefined) continue;
    const at = linesByKey.get(violationKey(v)) ?? new Set<number>();
    at.add(Number(line));
    linesByKey.set(violationKey(v), at);
  }
  for (const v of violations) {
    const key = violationKey(v);
    const entry = byKey.get(key);
    if (!entry) {
      counts.untriaged++;
      findings.push({ check: v.check, site: v.site, detail: `${v.detail} [untriaged — classify it in scripts/binding-fidelity-triage.json]` });
      continue;
    }
    seen.add(key);
    counts[entry.verdict]++;
    if (entry.verdict === 'live-bug') {
      const why = triage.rationales[entry.rationale] ?? entry.rationale;
      findings.push({ check: v.check, site: v.site, detail: `${v.detail} [live bug: ${why}]` });
    }
  }
  for (const [key, entry] of byKey) {
    if (seen.has(key)) continue;
    counts.stale++;
    // "No longer occurs" has two causes a reader must be able to tell apart: the seam was CLOSED, or
    // the guard stopped SEEING it. Naming what now satisfies the finding makes the second visible —
    // a satisfier in another workflow is the #342 masking shape, and deleting the entry there would
    // drop real debt out of the ledger.
    const outputId = entry.check === 'dead-output' ? /output '([^']+)'/.exec(entry.detail)?.[1] : undefined;
    const satisfier = outputId ? deadOutputSatisfier.get(`${entry.site}\u0000${outputId}`) : undefined;
    findings.push({
      check: 'stale-triage',
      site: entry.site,
      detail: satisfier
        ? `triaged '${entry.check}' finding no longer occurs — now satisfied by ${satisfier}; delete the entry only if that is a real closure`
        : `triaged '${entry.check}' finding no longer occurs — delete the entry from scripts/binding-fidelity-triage.json`,
    });
  }
  // The key drops a trailing line so a finding survives the file above it growing, which leaves the
  // line an entry cites compared against nothing. It is what a reader opens to re-affirm a verdict,
  // so it is held to the lines the finding is actually emitted at.
  for (const [key, entry] of byKey) {
    const cited = /:(\d+)$/.exec(entry.site)?.[1];
    if (cited === undefined || !seen.has(key)) continue;
    const at = linesByKey.get(key);
    if (!at || at.has(Number(cited))) continue;
    counts.misplaced++;
    const actual = [...at].sort((a, b) => a - b).join(', ');
    findings.push({
      check: 'misplaced-triage',
      site: entry.site,
      detail: `triaged '${entry.check}' finding sits at line ${actual}, not ${cited} — correct the site in scripts/binding-fidelity-triage.json`,
    });
  }
  return { findings, counts, total: violations.length };
}

/* --------------------------------- CLI runner --------------------------------- */
import { pathToFileURL } from 'node:url';
const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  // `--emit-untriaged` feeds the triage pass: it prints the violations that carry no verdict yet.
  // `--emit-all` prints every violation, which is what prunes entries whose finding no longer occurs.
  // Both only read — classification stays a human act.
  if (process.argv.includes('--emit-untriaged') || process.argv.includes('--emit-all')) {
    const all = collectViolations();
    if (process.argv.includes('--emit-all')) {
      process.stdout.write(JSON.stringify(all, null, 2) + '\n');
      process.exit(0);
    }
    const known = new Set(loadTriage().entries.map(violationKey));
    process.stdout.write(JSON.stringify(all.filter((v) => !known.has(violationKey(v))), null, 2) + '\n');
    process.exit(0);
  }
  const { findings, counts, total } = applyTriage();
  if (!wantsJson()) {
    process.stdout.write(`binding-fidelity: ${total} violation(s) — ${counts.harmless} harmless, `
      + `${counts['fix-later']} fix-later, ${counts['live-bug']} live bug(s), ${counts.untriaged} untriaged`
      + `${counts.stale ? `, ${counts.stale} stale triage entr(ies)` : ''}`
      + `${counts.misplaced ? `, ${counts.misplaced} misplaced triage cite(s)` : ''}\n`);
    const stamp = triageStampNote(loadTriage().corpusSha);
    if (stamp) process.stdout.write(`binding-fidelity: ${stamp}\n`);
  }
  report('binding-fidelity', findings, {
    okMessage: `no live or untriaged binding defects (${counts.harmless + counts['fix-later']} triaged as accepted debt)`,
    root: ROOT,
    remedy: 'fix each live bug, and classify each untriaged finding in scripts/binding-fidelity-triage.json',
  });
}
