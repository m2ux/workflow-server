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
 *   (5) entry-field-undeclared — a loop iterates a component holding a list and a read off its item
 *       names a field that component declares for an entry. This is (4) one level further down:
 *       (4) settles a read into a value against the members its producer declares and stops at the
 *       list, where the entry inside it is what the read is actually about. The item name is
 *       introduced by the loop and appears in no operation's signature, so resolution runs
 *       item → the collection the loop iterates → the producing output → the component, and
 *       compares against the fields that component declares. Only a component declaring entry
 *       fields is measured, for the reason (4) only measures an output declaring components.
 *
 * Reference-resolution (every `step.technique` resolves through the loader) is covered by
 * guards/check-all-refs.ts for `techniques[]` lists; step bindings are covered here by the
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
 *   npx tsx guards/check-binding-fidelity.ts [--root <workflows-dir>] [--json]
 *   npm run check:delta            # only what this branch added, against the merge-base
 *
 * To check a dedicated worktree's workflows instead of the repo's own ../workflows, pass
 * `--root <path>` (or set WORKFLOWS_DIR) — issue #160 follow-up #1.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { branchKey } from '../src/schema/workflow.schema.js';
// Convention building blocks shared with the server's provenance annotation (binding-provenance
// is their single source of truth), so guard and server cannot drift apart on what counts as an
// identifier, an optional input, or an ambient id.
import { AMBIENT_CONTEXT_IDS, IDENTIFIER_PATTERN, OPTIONAL_INPUT_RE } from '../src/utils/binding-provenance.js';
import { assertScanned, citePath, corpusNamespaces, definitionsUnder, ledgerPath, resolveWorkflowsRoot, namespaceSubdir, defaultCorpusDest } from './workflows-root.js';
import { indexCorpus, namespaceRefFromCitePath, type CorpusIndex } from '../src/loaders/corpus-index.js';
// The reference rule itself, shared with the server, so guard and loader read a `::` path the same way.
import { isBareName, parseTechniqueRef, TechniqueRefError, type TechniqueRef } from '../src/loaders/technique-ref.js';
import { findingKey, report, requireRootOrExit, wantsJson, type Finding } from './guard-protocol.js';
import { spawnSync } from 'node:child_process';

// Resolve paths from this file's own URL (reliable under both tsx CLI and the vitest runner,
// where import.meta.dirname is not populated).
const DIR = fileURLToPath(new URL('.', import.meta.url));
// Corpus root defaults to the repo's own ../workflows; pass `--root <path>` or set WORKFLOWS_DIR
// to check a dedicated worktree's workflows instead (issue #160 follow-up #1). An unreachable or
// empty root throws rather than yielding an empty, reassuring result (#327 S2). Path arithmetic is
// eager so `loadTriage` can see whether the ledger file is present; the walk itself waits until
// `ensureIndexed`, so importing this module does not require a live corpus.
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));
const ROOT = resolveWorkflowsRoot(DEFAULT_ROOT);
let INDEX: CorpusIndex = { workflows: new Map(), namespaces: new Map(), namespacesByName: new Map(), ambiguous: [], shadowed: [] };
const TRIAGE = ledgerPath(ROOT, 'binding-fidelity-triage.json');
const cite = (file: string): string => citePath(ROOT, file, INDEX);
const META = 'meta';
let indexed = false;

/* ----------------------------- signature parsing ----------------------------- */
type InputMeta = { hasDefault: boolean; optional: boolean };
/**
 * `components` names the `####` sub-sections an output declares. An output declaring none is one
 * whose shape the contract does not state, so a reader reaching into it is reaching past what was
 * declared rather than contradicting it.
 */
type OutputMeta = {
  hasArtifact: boolean;
  components: Set<string>;
  /** Component id → the fields one ENTRY of it declares, for a component holding a list. */
  entryFields: Map<string, Set<string>>;
  /** The fields one entry declares where the OUTPUT is itself a list — its `#### entry` block. */
  ownEntryFields: Set<string>;
};
type DetailedSig = { inputs: Map<string, InputMeta>; outputs: Map<string, OutputMeta> };
type Sig = { inputs: Set<string>; outputs: Set<string> };
type OpEntry = { own: DetailedSig; composed: Sig };

/**
 * `####` sub-sections of an output that are entry metadata rather than members of the value: the
 * filename it persists under and the reader it is written for. Mirrors the markdown loader's
 * reserved set, so a read into an output is measured against the same notion of a component the
 * loader builds.
 */
const RESERVED_OUTPUT_SUBSECTIONS: ReadonlySet<string> = new Set(['artifact', 'audience', 'entry']);

/**
 * The reserved sub-section an output that IS a list declares its entry's fields under. Its presence
 * is how an output says it is a list, which is what keeps `####` meaning one thing everywhere else.
 */
const ENTRY_SUBSECTION = 'entry';

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
  /** The `####` component the `#####` fields below it belong to. */
  let component: string | null = null;
  let awaitingProse = false;
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      const title = h2[1]!.trim();
      section = title === 'Inputs' ? 'inputs' : title === 'Outputs' ? 'outputs' : null;
      entry = null;
      component = null;
      continue;
    }
    if (!section) continue;
    const h3 = /^###\s+(\S+)\s*$/.exec(line);
    if (h3) {
      entry = h3[1]!.trim();
      component = null;
      awaitingProse = true;
      if (section === 'inputs') det.inputs.set(entry, { hasDefault: false, optional: false });
      else det.outputs.set(entry, { hasArtifact: false, components: new Set(), entryFields: new Map(), ownEntryFields: new Set() });
      continue;
    }
    if (!entry) continue;
    const h4 = /^####\s+(\S+)\s*$/.exec(line);
    if (h4) {
      awaitingProse = false;
      const sub = h4[1]!.trim();
      component = null;
      if (section === 'inputs' && sub === 'default') det.inputs.get(entry)!.hasDefault = true;
      if (section === 'outputs' && RESERVED_OUTPUT_SUBSECTIONS.has(sub)) {
        if (sub === 'artifact') det.outputs.get(entry)!.hasArtifact = true;
        // `entry` holds no prose of its own; the `#####` lines below it are what it declares, and
        // `component` carries it so those lines land in the output's own entry set.
        component = sub === ENTRY_SUBSECTION ? ENTRY_SUBSECTION : null;
        continue;
      }
      // Entry metadata names a file the technique writes or the reader it is for, rather than a
      // member of the value, so neither is a path a reader can address into. The reserved set is
      // the loader's, so guard and loader cannot disagree on what a component is.
      if (section === 'outputs') {
        component = sub;
        det.outputs.get(entry)!.components.add(sub);
      }
      continue;
    }
    // A component holding a list names the fields one entry of it carries one level further down.
    const h5 = /^#####\s+(\S+)\s*$/.exec(line);
    if (h5 && section === 'outputs' && component !== null) {
      const meta = det.outputs.get(entry)!;
      if (component === ENTRY_SUBSECTION) {
        meta.ownEntryFields.add(h5[1]!.trim());
      } else {
        if (!meta.entryFields.has(component)) meta.entryFields.set(component, new Set());
        meta.entryFields.get(component)!.add(h5[1]!.trim());
      }
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
  const tdir = namespaceSubdir(INDEX, wf, 'techniques');
  if (!tdir || !existsSync(tdir)) return;
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
  note(rootDet, cite(rootIdx));
  const rootSig = toSig(rootDet);
  const withRoot = (s: Sig): Sig => unionSig(s, rootSig);
  for (const entry of readdirSync(tdir)) {
    const p = join(tdir, entry); const st = statSync(p);
    if (st.isFile() && entry.endsWith('.md') && entry !== 'TECHNIQUE.md') {
      const det = fileSigDetailed(p); note(det, cite(p));
      reg.ops.set(entry.slice(0, -3), { own: det, composed: withRoot(toSig(det)) });
    } else if (st.isDirectory()) {
      const idx = join(p, 'TECHNIQUE.md');
      const gdet = existsSync(idx) ? fileSigDetailed(idx) : emptyDetailed();
      if (existsSync(idx)) note(gdet, cite(idx));
      const gsig = toSig(gdet);
      reg.groups.set(entry, { own: gdet, composed: withRoot(gsig) });
      for (const f of readdirSync(p)) {
        if (f.endsWith('.md') && f !== 'TECHNIQUE.md') {
          const own = fileSigDetailed(join(p, f)); note(own, cite(join(p, f)));
          reg.ops.set(`${entry}::${f.slice(0, -3)}`, { own, composed: withRoot(unionSig(toSig(own), gsig)) });
        }
      }
    }
  }
  registry.set(wf, reg);
  declaredByWf.set(wf, declared);
}

let workflows: string[] = [];

/**
 * Which operation a step's `technique:` names, over this guard's own signature registry.
 *
 * The reference is read by the server's rule (`parseTechniqueRef`), so guard and server cannot
 * disagree about whether a leading segment names a workflow or a group. Only the lookup is the
 * guard's own: the registry holds parsed signatures rather than technique files.
 */
function resolve(ref: string, wf: string, activityId?: string): { entry: OpEntry; homeWf: string; key: string } | null {
  let parsed: TechniqueRef;
  try {
    parsed = parseTechniqueRef(ref, INDEX);
  } catch {
    return null; // the rule refuses it; the binding-resolution finding carries its refusal
  }
  // Activity-group convention (mirrors the server's get_technique): a bare op resolves FIRST against
  // the group named after the current activity — `<activity-id>::<op>` — taking precedence over a
  // same-named standalone/group-base, so an op that shares its group's name (`research` ->
  // `research::research`) selects the op, not the group base.
  if (activityId && isBareName(ref)) {
    const key = `${activityId}::${ref}`;
    for (const c of wf !== META ? [wf, META] : [META]) {
      const entry = registry.get(c)?.ops.get(key);
      if (entry) return { entry, homeWf: c, key };
    }
  }
  // A namespace prefix resolves in that namespace and nowhere else; a bare reference resolves
  // against the binding workflow and then meta. A group base answers only a single-segment
  // reference — a deeper path names a file inside one.
  const key = parsed.segments.join('::');
  const candidates = parsed.namespace ? [namespaceRef(parsed.namespace)] : wf !== META ? [wf, META] : [META];
  for (const c of candidates) {
    const r = registry.get(c); if (!r) continue;
    const entry = r.ops.get(key) ?? (parsed.segments.length === 1 ? r.groups.get(key) : undefined);
    if (entry) return { entry, homeWf: c, key };
  }
  return null;
}

/** Why a reference resolves to nothing: the rule refuses it, or the corpus holds no such operation. */
function unresolvedDetail(ref: string): string {
  try {
    parseTechniqueRef(ref, INDEX);
  } catch (error) {
    if (error instanceof TechniqueRefError) return error.message;
    throw error;
  }
  return `step technique '${ref}' does not resolve`;
}

/* ----------------------------- corpus collection ----------------------------- */
const AMBIENT = new Set(AMBIENT_CONTEXT_IDS);
// Metasyntactic tokens: notation for "some id", not a read of a bag value. `O` is the output-id
// metavariable the variable-binding spec uses when describing the landing rule generically.
const PLACEHOLDER = new Set(['path', 'token', 'placeholder', 'field', 'key', 'value', 'var', 'x', 'n', 'i', 'templated', 'output_id', 'declared_id', 'id', 'name', 'type', 'o', 'O']);
/** Per-workflow produced names: workflow.yaml vars + activity set/loop/setVariable targets. */
const producedByWf = new Map<string, Set<string>>();
const fileLocals = new Map<string, Set<string>>();
/**
 * Per routine file, the inputs whose argument is an operation reference (#739).
 *
 * Such a parameter stands where an operation reference belongs and a reference site replaces it when
 * the definitions load, so the declaration spells a name no technique answers to. Resolving it here
 * would be resolving a placeholder; what the operation a site supplies is bound to is a question the
 * routines guard asks once per reference site, where there is an operation to ask about.
 */
const fileOperationParameters = new Map<string, Set<string>>();

function produced(wf: string): Set<string> {
  let s = producedByWf.get(wf);
  if (!s) { s = new Set(); producedByWf.set(wf, s); }
  return s;
}

/**
 * The two things a fan produces that no other producer in this model accounts for. Keyed per
 * workflow, and for the parameter per ACTIVITY as well, because the parameter belongs to the
 * activity the fan runs and to no other — this is the one place the guard reads routing, and what
 * it reads it for.
 *
 * The fan's per-instance parameter is deliberately not a workflow variable: declaring it there
 * would make it workflow-owned, which `activity-variables` skips and seeds, so a read of it
 * anywhere would resolve silently. So it arrives here instead.
 *
 * The branch container is producible at MEMBER grain, never at a head: producible at head grain it
 * would satisfy a member read that names nothing, which is why the two land together.
 */
const fanParameterByActivity = new Map<string, Map<string, string>>();
const fanContainerMembers = new Map<string, Set<string>>();

function collectWorkflowVars(wf: string): void {
  const wt = namespaceSubdir(INDEX, wf, 'workflow.yaml');
  if (!wt || !existsSync(wt)) return;
  try {
    const p = parseDefinition(readFileSync(wt, 'utf-8')) as {
      variables?: Array<{ name?: string }>;
      context?: Array<{ name?: string }>;
      graph?: Record<string, Record<string, unknown>>;
    };
    for (const v of p?.variables ?? []) if (v?.name) produced(wf).add(v.name);
    for (const v of p?.context ?? []) if (v?.name) produced(wf).add(v.name);

    const parameters = new Map<string, string>();
    const containers = new Set<string>();
    for (const bindings of Object.values(p?.graph ?? {})) {
      for (const destination of Object.values(bindings ?? {})) {
        const members = Array.isArray(destination) ? destination : [destination];
        if (typeof destination === 'string') continue;
        for (const member of members) {
          if (typeof member === 'string') { containers.add(branchKey(member)); continue; }
          const fan = member as { activity?: string; variable?: string };
          if (!fan.activity) continue;
          containers.add(branchKey(fan.activity));
          if (fan.variable) parameters.set(fan.activity, fan.variable);
        }
      }
    }
    if (parameters.size > 0) fanParameterByActivity.set(wf, parameters);
    if (containers.size > 0) fanContainerMembers.set(wf, containers);
  } catch { /* structural errors are validate-workflow-yaml's job */ }
}

/** The fan parameter one activity of one workflow is handed, where the graph fans it. */
function fanParameterFor(wf: string, activityId: string): string | undefined {
  return fanParameterByActivity.get(wf)?.get(activityId);
}

/**
 * Which activities bind each technique file, so an output declared there can be read against the
 * routing of the activity that produces it. Keyed on both spellings a resolved op can have on disk
 * — a standalone file, and a group's own contract.
 */
const bindersOf = new Map<string, Set<string>>();

function techniqueRels(homeWf: string, key: string): string[] {
  const path = key.replace('::', '/');
  return [`${homeWf}/techniques/${path}.md`, `${homeWf}/techniques/${path}/TECHNIQUE.md`];
}

/**
 * Whether an output declared in this file lands in a branch container something reads.
 *
 * A branch's reported values do not enter the bag under their own names: the fan lands the whole
 * map in a slot of its own, under a key derived from the branch's activity id. So no consumer
 * anywhere names the output — the activity the fan converges on reads the container. Without this
 * every value a fanned activity produces reads as dead, and the remedy the guard would be pushing
 * for is an artifact on each branch, which is the collision the fan rules exist to prevent.
 */
function landsInAReadContainer(rel: string, consumed: Map<string, Set<string>>): boolean {
  for (const binder of bindersOf.get(rel) ?? []) {
    const [wf, activityId] = binder.split('::') as [string, string];
    const key = branchKey(activityId);
    if (!fanContainerMembers.get(wf)?.has(key)) continue;
    if ((consumed.get(key)?.size ?? 0) > 0) return true;
  }
  return false;
}

/**
 * Whether a read of a branch container in this workflow addresses something the container holds.
 *
 * Two forms do. The container ALONE is the gather the activity a fan converges on performs: it
 * hands the container whole to the ordered gather with the fan's own collection as the expected
 * ids, so the correspondence comes from the container's order rather than from an authored index
 * (`scatter-gather::a-join-gathers-the-container-not-an-index`). And a member read carries the slot
 * it means: a slot holds its unit's id beside the result, so a member is
 * `<key>.<instance>.result.<member>`.
 *
 * What is left is a head plus a tail with no index — `<key>.<member>`. That addresses nothing under
 * a uniform index, and it is the form a member read decays into when its author forgets the slot,
 * so it stays reported.
 */
function readsContainerMember(wf: string, reference: string): boolean {
  const segments = reference.split('.');
  const key = segments[0]!;
  if (!fanContainerMembers.get(wf)?.has(key)) return false;
  if (segments.length === 1) return true;
  return /^\d+$/.test(segments[1] ?? '') && segments.length > 2;
}

type Step = {
  rel: string; wf: string; stepId: string; technique: string;
  inputsMap: Record<string, unknown>; outputsMap: Record<string, string>; activityId: string;
};
const steps: Step[] = [];

/**
 * A read that addresses INTO a value — `change_report.changed_symbols` rather than `change_report`.
 *
 * The head is what the resolution rules answer for; the tail is a claim about the value's shape,
 * which the producing operation states in its output's `####` components. Kept whole here because
 * every other scan splits the head off and discards the rest, which is why a tail naming a member
 * no contract declares reads exactly like a member that is there.
 */
const pathConsumes: Array<{ rel: string; wf: string; activityId: string; path: string }> = [];
/**
 * What each `forEach` loop's item variable stands for: the collection it iterates, as written.
 *
 * A read off the item — `{process.summary}` under a loop over `{query_report.processes}` — is a
 * claim about one ENTRY of that collection. Resolving it needs the loop, because the item name is
 * introduced by the loop and names nothing the producing operation declares.
 */
const loopItems: Array<{
  rel: string; wf: string; activityId: string; item: string; over: string;
  /** The item's fields THIS loop reads, taken from its own steps rather than from the file. */
  fields: Set<string>;
}> = [];
/**
 * Bag names read by an EXPRESSION rather than a `{token}` or a structured `variable:` key — a step's
 * `when` string and a `validate` action's `target`. Both are consumption sites, and neither was
 * visible to the read scan, so an output whose only consumer was a `when` gate or a validate gate
 * read as dead — the opposite of dead (#327 R3).
 */
const expressionConsumes: Array<{ rel: string; wf: string; stepId: string; name: string }> = [];

/**
 * Arguments a `kind: routine` step binds, as written: `{token}` for a reference to a host variable
 * and a bare name for a rename, alongside literals like an operation reference. Read the same way a
 * technique step's input deviations are, and for the same question — whether anything consumes a
 * declared output. Held apart from `expressionConsumes` because these are not expressions: a literal
 * argument names no bag variable, and asking a resolution rule about one reports a missing producer
 * for a value the site never meant as a read.
 */
const routineArguments: Array<{ rel: string; value: string }> = [];

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
  // A `kind: routine` step binds the run the way a technique step binds an operation: `with` values
  // name what the host hands it — braced for a reference, bare for a rename — and `outputs` values
  // name the host variables its productions land under. The walk reads authored files and never the
  // materialised body, so a value whose only consumer is a routine argument reads as dead without
  // this, and a variable only a run writes reads as unproduced.
  if (typeof o.routine === 'string') {
    for (const value of Object.values((o.with ?? {}) as Record<string, unknown>)) {
      if (typeof value === 'string') routineArguments.push({ rel, value });
    }
    for (const target of Object.values((o.outputs ?? {}) as Record<string, unknown>)) {
      if (typeof target === 'string') produced(wf).add(target);
    }
  }
  if (o.action === 'set' && typeof o.target === 'string') produced(wf).add(o.target);
  // A `validate` action's `target` and a step's `when` are expressions over bag names
  // (`fragment_references_issue != false`, `has_debt_markers == true`) — the one place the value is
  // enforced or the gate that consumes it.
  if (o.action === 'validate' && typeof o.target === 'string') {
    for (const name of expressionReads(o.target)) expressionConsumes.push({ rel, wf, stepId: here, name });
  }
  if (typeof o.when === 'string') {
    for (const name of expressionReads(o.when)) expressionConsumes.push({ rel, wf, stepId: here, name });
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
    expressionConsumes.push({ rel, wf, stepId: here, name: o.over.split('.')[0]! });
    if (o.over.includes('.')) pathConsumes.push({ rel, wf, activityId, path: o.over });
    // What the item variable stands for, and which of its fields this loop reads. A read off the
    // item is a claim about one ENTRY of the collection, which is a different claim from one about
    // the collection itself — so the two are kept apart and the item is resolved back through here.
    //
    // The fields come from the loop's OWN subtree rather than from the file's reads, because the
    // item name is introduced by this loop and means nothing outside it: two loops in one file
    // reusing a name would otherwise have each one's reads measured against both collections.
    if (typeof o.variable === 'string') {
      const item = o.variable;
      const fields = new Set<string>();
      // The whole loop, not just its steps: a break condition or a continuation test reads the item
      // as surely as a step does, and they sit beside `steps` rather than inside it. `over` and
      // `variable` carry the bare name without a dot, so neither matches.
      for (const [, field] of JSON.stringify(o).matchAll(
        new RegExp(`\\{${item}\\.([A-Za-z0-9_]+)`, 'g'),
      )) fields.add(field!);
      loopItems.push({ rel, wf, activityId, item, over: o.over, fields });
    }
  }
  for (const v of Object.values(o)) walkSteps(wf, rel, v, activityId, here);
}

type Read = { rel: string; wf: string; line: number; full: string; head: string; kind: 'technique' | 'activity' };
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

function collectReads(wf: string, rel: string, raw: string, kind: 'technique' | 'activity'): void {
  const content = blankFences(raw);
  const locals = new Set<string>();
  const reIntro = new RegExp(`\\{\\$(${IDENTIFIER_PATTERN})\\}`, 'g'); let mi: RegExpExecArray | null;
  while ((mi = reIntro.exec(content))) locals.add(mi[1]!);
  fileLocals.set(rel, locals);
  const reToken = new RegExp(`\\{(\\$?)(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)\\}`, 'g');
  const reCondVar = new RegExp(`^\\s*variable:\\s*"?(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)"?`);
  content.split('\n').forEach((line, i) => {
    const re = new RegExp(reToken.source, 'g'); let m: RegExpExecArray | null;
    while ((m = re.exec(line))) { if (m[1] === '$') continue; reads.push({ rel, wf, line: i + 1, full: m[2]!, head: m[2]!.split('.')[0]!, kind }); }
    if (kind === 'activity') {
      const cv = reCondVar.exec(line);
      if (cv) reads.push({ rel, wf, line: i + 1, full: cv[1]!, head: cv[1]!.split('.')[0]!, kind });
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

/**
 * A workflow's `routines/` read on the same terms as its activities (#704 E03).
 *
 * A routine holds the step bindings the activities referring to it used to hold, so a technique
 * whose only consumer is a routine's output remap reads as a dead output while these files go
 * unscanned — a finding against a technique that is used, on a guard carrying a triage ledger.
 *
 * A routine's declared names are its file's own scope, which is what the local set already models:
 * seeded with them, a parameter the body reads resolves inside the file instead of demanding a
 * producer the workflow never declares. Scanning the files without that seeding reports every
 * routine input as unproduced, which is why both halves are one change.
 */
function scanRoutines(wf: string): void {
  const dir = namespaceSubdir(INDEX, wf, 'routines');
  if (!dir || !existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.yaml')) continue;
    const rel = cite(join(dir, entry));
    const raw = readFileSync(join(dir, entry), 'utf-8');
    collectReads(wf, rel, raw, 'activity');
    let parsed: unknown;
    try { parsed = parseDefinition(raw); } catch { continue; /* check:routines reports a malformed file */ }
    if (!parsed || typeof parsed !== 'object') continue;
    const routine = parsed as Record<string, unknown>;
    const locals = fileLocals.get(rel) ?? new Set<string>();
    const parameters = fileOperationParameters.get(rel) ?? new Set<string>();
    for (const list of ['inputs', 'outputs', 'internals']) {
      for (const item of Array.isArray(routine[list]) ? routine[list] as unknown[] : []) {
        const declaration = item as { id?: unknown; kind?: unknown };
        if (typeof declaration?.id !== 'string') continue;
        locals.add(declaration.id);
        if (list === 'inputs' && declaration.kind === 'technique') parameters.add(declaration.id);
      }
    }
    fileLocals.set(rel, locals);
    fileOperationParameters.set(rel, parameters);
    walkSteps(wf, rel, parsed, typeof routine['id'] === 'string' ? routine['id'] : '');
  }
}

/**
 * Every activity file under a workflow's `activities/`, library subdirectories included.
 *
 * The server's own `loadActivitiesFromDir` is deliberately non-recursive — a subdirectory is a
 * borrowable library rather than part of the lifecycle graph — and a guard mirroring that leaves
 * `meta/activities/patterns/` unmeasured, its step bindings and the outputs its loop conditions
 * consume invisible in both directions (#327 S2).
 */
function activityFiles(dir: string): string[] {
  return definitionsUnder(dir).map(({ path }) => path);
}

/**
 * Namespace path → the reference that reaches it.
 *
 * Everything this guard keys on is the string a citation carries and `namespaceRefFromCitePath`
 * reads back off one — the directory name, or the path where two directories claim that name. A
 * parsed reference always carries the path, so a reference is put through this on the way in. The
 * two strings are one for a namespace at the corpus root, which is most of them.
 */
let namespaceRefByPath = new Map<string, string>();

const namespaceRef = (path: string): string => namespaceRefByPath.get(path) ?? path;

/**
 * The namespaces whose declarations are in every workflow's reach.
 *
 * A namespace that declares no workflow is a library: nothing starts it, and every operation it
 * holds is there to be applied from somewhere else. Its declared ids are therefore readable from any
 * workflow that applies one, and its outputs are consumed from outside by design — which is exactly
 * the standing `meta` has, and the reason `meta` was named here before there was a second one.
 *
 * This does not widen what an unqualified reference resolves to. `meta` alone is the fallback for a
 * bare name, so a step binding `analyze` reaches meta's and not a library's.
 */
let sharedNamespaces = new Set<string>([META]);

const isShared = (wf: string): boolean => sharedNamespaces.has(wf);

let allWf = new Set<string>();
let crossWorkflowConsumers = new Map<string, Set<string>>();
let dispatchedWorkflows = new Map<string, Set<string>>();

function ensureIndexed(): void {
  if (indexed) return;
  indexed = true;
  INDEX = indexCorpus(ROOT);
  namespaceRefByPath = new Map(corpusNamespaces(ROOT, INDEX).map(({ path, ref }) => [path, ref]));
  sharedNamespaces = new Set([META, ...corpusNamespaces(ROOT, INDEX).filter((n) => !n.manifest).map(({ ref }) => ref)]);
  workflows = corpusNamespaces(ROOT, INDEX).filter(({ dir }) => existsSync(join(dir, 'techniques'))).map(({ ref }) => ref);
  assertScanned(workflows.length, 'namespaces with a techniques/ folder', ROOT);
  for (const wf of workflows) buildRegistry(wf);

  for (const wf of workflows) {
    const walk = (dir: string): void => {
      for (const e of readdirSync(dir)) {
        const p = join(dir, e); const st = statSync(p);
        if (st.isDirectory()) { if (e !== 'resources') walk(p); }
        else if (e.endsWith('.md')) {
          const raw = readFileSync(p, 'utf-8');
          collectReads(wf, cite(p), raw, 'technique');
          collectArtifactTemplateTokens(cite(p), raw);
        }
      }
    };
    const techniques = namespaceSubdir(INDEX, wf, 'techniques');
    if (techniques) walk(techniques);
  }

  // Activities are a workflow's own, so the second half enumerates only namespaces holding a
  // definition — a library has no graph for an activity to take a place in.
  allWf = new Set([
    ...workflows,
    ...corpusNamespaces(ROOT, INDEX)
      .filter(({ manifest, dir }) => manifest !== undefined && existsSync(join(dir, 'activities')))
      .map(({ ref }) => ref),
  ]);
  // The graph half of a namespace: its variables, the prose in its definition, its activities and
  // its routines. A namespace carries a definition here only where the corpus can start it, so a
  // library's techniques are measured above while nothing reads a graph no name reaches.
  const graphed = new Set(corpusNamespaces(ROOT, INDEX).filter((n) => n.manifest !== undefined).map(({ ref }) => ref));
  // A run is read because a `routines/` directory holds it, and for no other reason. A library
  // declares runs and may declare neither activities nor techniques, so every membership the sweep
  // below tests for is one a library can fail while still holding the runs where its own operations
  // are composed — and an unscanned run reports every output it consumes as one nothing consumes.
  for (const { ref, dir } of corpusNamespaces(ROOT, INDEX)) {
    if (existsSync(join(dir, 'routines'))) scanRoutines(ref);
  }
  for (const wf of allWf) {
    if (!graphed.has(wf)) continue;
    collectWorkflowVars(wf);
    // workflow.yaml is a reader too: its `rules` and `description` prose interpolates declared ids
    // (`When {headless_mode} is true, a checkpoint declaring both resolves to its defaultOption`), and
    // that is the value's one authoritative consumer. Scanning only activities left those reads
    // invisible, so the id they name read as dead.
    const wfYaml = namespaceSubdir(INDEX, wf, 'workflow.yaml');
    if (wfYaml && existsSync(wfYaml)) collectReads(wf, cite(wfYaml), readFileSync(wfYaml, 'utf-8'), 'activity');
    const adir = namespaceSubdir(INDEX, wf, 'activities');
    if (!adir || !existsSync(adir)) continue;
    for (const path of activityFiles(adir)) {
      const rel = cite(path); const raw = readFileSync(path, 'utf-8');
      collectReads(wf, rel, raw, 'activity');
      try {
        const dec = parseDefinition(raw);
        const activityId = dec && typeof dec === 'object' && typeof (dec as { id?: unknown }).id === 'string' ? (dec as { id: string }).id : '';
        walkSteps(wf, rel, dec, activityId);
      } catch { /* validate-workflow-yaml's job */ }
    }
  }

  const reach = new Map<string, Set<string>>();
  for (const s of steps) {
    const r = resolve(s.technique, s.wf, s.activityId);
    if (!r || r.homeWf === s.wf) continue;
    let into = reach.get(r.homeWf);
    if (!into) { into = new Set(); reach.set(r.homeWf, into); }
    into.add(s.wf);
  }
  crossWorkflowConsumers = reach;

  const dispatched = new Map<string, Set<string>>();
  for (const s of steps) {
    const child = s.inputsMap.workflow_id;
    if (typeof child !== 'string' || !allWf.has(child) || child === s.wf) continue;
    let into = dispatched.get(s.wf);
    if (!into) { into = new Set(); dispatched.set(s.wf, into); }
    into.add(child);
  }
  dispatchedWorkflows = dispatched;
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
 *  declared ids, every shared library's, the composed signatures of ops its steps bind
 *  cross-workflow, its produced names, and ambients. */
const scopeCache = new Map<string, Set<string>>();
function scopeOf(wf: string): Set<string> {
  const hit = scopeCache.get(wf);
  if (hit) return hit;
  const s = new Set<string>([
    ...(declaredByWf.get(wf) ?? []),
    ...[...sharedNamespaces].filter((shared) => shared !== wf).flatMap((shared) => [...(declaredByWf.get(shared) ?? [])]),
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
  for (const { rel, value } of routineArguments) {
    for (const m of value.matchAll(VALUE_TOKEN_RE)) add(m[1]!, rel);
    if (BARE_NAME_RE.test(value)) add(value, rel);
  }
  for (const [id, rels] of allDeclaredInputSites) rels.forEach((rel) => add(id, rel));
  for (const v of expressionConsumes) add(v.name, v.rel);
  return consumed;
}

/**
 * Whether a consumer file can close a dead-output finding on a declaring file.
 *
 * Resolution used to be by bare name across the whole corpus, so an output in workflow A read as
 * consumed when an unrelated workflow B happened to read a name of the same spelling — and B has no
 * address for A's op, so it cannot bind it (#342). The masking presented as a STALE triage entry,
 * which reads like progress, and forced real debt out of the ledger.
 */
function consumerReaches(consumerRel: string, declaringRel: string): boolean {
  const consumerWf = namespaceRefFromCitePath(consumerRel);
  const declaringWf = namespaceRefFromCitePath(declaringRel);
  if (!consumerWf || !declaringWf) return false;
  if (consumerWf === declaringWf) return true;
  if (isShared(declaringWf)) return true;
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
  check: 'arg-conformance' | 'read-resolution' | 'binding-resolution' | 'dead-output' | 'orphan-input'
  | 'output-path-undeclared';
  site: string;
  detail: string;
}

export function collectViolations(): Violation[] {
  ensureIndexed();
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
    // The step binds an operation its routine takes as an argument, so the technique position holds
    // a parameter until a reference site fills it. There is nothing here to resolve, and nothing to
    // hold a binding against either — both are per-site questions the routines guard asks.
    if (fileOperationParameters.get(s.rel)?.has(s.technique)) continue;
    const r = resolve(s.technique, s.wf, s.activityId);
    if (!r) {
      // A step's `technique:` ref must resolve to a real operation (workflow-local, meta, or
      // cross-workflow). check-all-refs only validates the activity/workflow `techniques[]` list, so
      // after the step-binding migration this is the only guard covering step.technique bindings.
      v.push({ check: 'binding-resolution', site: `${s.rel}[${s.stepId}]`, detail: unresolvedDetail(s.technique) });
      continue;
    }
    for (const cand of techniqueRels(r.homeWf, r.key)) {
      let binders = bindersOf.get(cand);
      if (!binders) { binders = new Set(); bindersOf.set(cand, binders); }
      binders.add(`${s.wf}::${s.activityId}`);
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
      // The fan supplies its parameter on the branch's own delivery, to the activity it runs and
      // to no other. Without this the fanned activity's declared input for it reads as an orphan.
      if (fanParameterFor(s.wf, s.activityId) === inputId) continue;
      // A branch container is produced by the fan, server-side, at the moment the fan opens — so no
      // step, variable or default in the YAML this guard reads declares it. The activity a fan
      // converges on takes it as an input by name, which is the sanctioned gather.
      if (fanContainerMembers.get(s.wf)?.has(inputId)) continue;
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
    const wf = r.wf;
    if (scopeOf(wf).has(r.head)) continue;
    // A branch container is producible at member grain: a read that omits the slot index addresses
    // nothing, so it is not satisfied here and stays reported.
    if (readsContainerMember(wf, r.full)) continue;
    // The fan's parameter reaches the file through the branch's own delivery. `collectReads` scans
    // a whole technique file with only fenced blocks blanked, so an artifact name templated on the
    // parameter inside an `#### artifact` body is collected as a read needing a producer.
    if (fanParameterByActivity.get(wf) !== undefined
      && [...fanParameterByActivity.get(wf)!.values()].includes(r.head)) continue;
    v.push({ check: 'read-resolution', site: `${r.rel}:${r.line}`, detail: `{${r.full}} has no producer (declared id / $-local / workflow var / set-target)` });
  }
  // (2b) read-resolution over gate expressions — the same scope a `{token}` resolves against.
  // #327 taught the guard to count a `when` and a `validate` target as CONSUMPTION, which stopped a
  // gated value reading as dead. It never checked the other direction, so a gate naming a value
  // nothing produces was accepted and could never fire (#341 R1, the #324 A2 class).
  for (const e of expressionConsumes) {
    if (PLACEHOLDER.has(e.name)) continue;
    // A file's own declared names satisfy a gate in it, on the terms they satisfy a `{token}` read
    // above: a routine's signature IS the scope its body reads, so a gate naming a declared input
    // resolves inside the file and never against the workflow the run is spliced into.
    if (fileLocals.get(e.rel)?.has(e.name)) continue;
    const wf = e.wf;
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
    if (landsInAReadContainer(site.rel, consumed)) continue;
    const satisfier = [...(consumed.get(site.id) ?? [])].find((rel) => rel !== site.rel && consumerReaches(rel, site.rel));
    if (satisfier) { deadOutputSatisfier.set(`${site.rel}\u0000${site.id}`, satisfier); continue; }
    v.push({
      check: 'dead-output', site: site.rel,
      detail: `output '${site.id}' is declared but nothing outside its own file consumes it (no read, condition, binding value, remap, or same-named input)`,
    });
  }
  // (4) output-path-undeclared — a read addressing into a value names a member its producer declares
  v.push(...collectPathViolations());
  // (5) entry-field-undeclared — a read off a loop item names a field its component declares
  v.push(...collectEntryFieldViolations());
  return v;
}

/**
 * Which operation output lands under each bag name, by the name the value is read under.
 *
 * A step's `outputs` map remaps a declared output onto another name; an output the map leaves alone
 * lands under its own id. Both are producers, and a reader addressing into either is making a claim
 * about that operation's declared shape.
 */
function producersByBagName(): Map<string, Array<{ ref: string; wf: string; activityId: string; outputId: string }>> {
  const byName = new Map<string, Array<{ ref: string; wf: string; activityId: string; outputId: string }>>();
  const add = (name: string, entry: { ref: string; wf: string; activityId: string; outputId: string }): void => {
    byName.set(name, [...(byName.get(name) ?? []), entry]);
  };
  for (const s of steps) {
    const resolved = resolve(s.technique, s.wf, s.activityId);
    if (!resolved) continue;
    const remapped = new Set(Object.keys(s.outputsMap));
    for (const [outputId, bagName] of Object.entries(s.outputsMap)) {
      add(bagName, { ref: s.technique, wf: s.wf, activityId: s.activityId, outputId });
    }
    for (const outputId of resolved.entry.own.outputs.keys()) {
      if (!remapped.has(outputId)) add(outputId, { ref: s.technique, wf: s.wf, activityId: s.activityId, outputId });
    }
  }
  return byName;
}

/**
 * A path whose head is a produced value and whose first tail segment names no declared component.
 *
 * Only an output that declares components is measured. One declaring none states nothing about its
 * shape, so a reader addressing into it is reaching past the contract rather than contradicting it,
 * and reporting that would be reporting every under-declared output in the corpus.
 *
 * An index segment is a position rather than a member, so a path stepping through one addresses the
 * element and the declaration describes the collection — a different claim, and not this one.
 */
function collectPathViolations(): Violation[] {
  const v: Violation[] = [];
  const producers = producersByBagName();
  const seen = new Set<string>();
  const sites = [
    ...pathConsumes,
    // A `{token}` addressing into a value is the same claim a loop's `over` makes, written in a
    // binding or in prose. The text scan already keeps these whole.
    ...reads.filter((r) => r.full.includes('.')).map((r) => ({ rel: r.rel, wf: r.wf, activityId: '', path: r.full })),
  ];
  for (const { rel, wf, activityId, path } of sites) {
    const [head, member] = path.split('.');
    if (!head || !member || /^\d+$/.test(member)) continue;
    const key = `${rel} ${path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const producer of producers.get(head) ?? []) {
      if (producer.wf !== wf && producer.activityId !== activityId) continue;
      const resolved = resolve(producer.ref, producer.wf, producer.activityId);
      const declared = resolved?.entry.own.outputs.get(producer.outputId)?.components;
      if (!declared || declared.size === 0) continue;
      if (declared.has(member)) continue;
      v.push({
        check: 'output-path-undeclared', site: `${rel}[${activityId}]`,
        detail: `reads '${path}', and '${producer.ref}' declares no '${member}' on its '${producer.outputId}' output `
          + `— it states ${[...declared].map((c) => `'${c}'`).join(', ')}`,
      });
      break;
    }
  }
  return v;
}

/**
 * A read off a loop's item whose first segment names no field the iterated component declares.
 *
 * `collectPathViolations` settles a read into a value against the members its producer declares, and
 * stops there. Where the member is a list, the entry inside it is one level further down: a loop
 * introduces an item name the producing operation never mentions, and a read off that item is a
 * claim about one entry of the collection. Resolution runs the same route as the level above —
 * item → the collection the loop iterates → the producing operation's output → the component — and
 * applies the same comparison to the fields that component declares for an entry.
 *
 * Only a component that declares entry fields is measured, for the reason the level above declares
 * components: one stating nothing about its entries is reached past rather than contradicted.
 */
function collectEntryFieldViolations(): Violation[] {
  const v: Violation[] = [];
  const producers = producersByBagName();
  const seen = new Set<string>();

  for (const loop of loopItems) {
    if (loop.fields.size === 0) continue;
    // Two shapes reach an entry. `query_report.processes` names a value and the part of it that
    // holds the list, so the declaration sits on the part. A bare `stale_members` names a value
    // that IS the list, so it sits on the output's own `entry` block. The head is what resolves to
    // a producer either way; the tail decides which declaration answers.
    const [collectionHead, component] = loop.over.split('.');
    if (!collectionHead) continue;
    const held = component === undefined ? 'the list it is' : `its '${component}' component`;

    const fieldsByProducer = (producers.get(collectionHead) ?? [])
      .filter((producer) => producer.wf === loop.wf || producer.activityId === loop.activityId)
      .map((producer) => {
        const output = resolve(producer.ref, producer.wf, producer.activityId)
          ?.entry.own.outputs.get(producer.outputId);
        return {
          producer,
          fields: component === undefined ? output?.ownEntryFields : output?.entryFields.get(component),
        };
      })
      .filter((candidate): candidate is { producer: typeof candidate.producer; fields: Set<string> } =>
        candidate.fields !== undefined && candidate.fields.size > 0);
    if (fieldsByProducer.length === 0) continue;

    for (const field of loop.fields) {
      if (/^\d+$/.test(field)) continue;
      const key = `${loop.rel} ${loop.over} ${loop.item}.${field}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // Every producer landing under this name is consulted, the way the level above consults them:
      // where two operations land one bag name and disagree about an entry's fields, a read
      // satisfied by one and not the other is a disagreement worth reporting, not one to resolve by
      // taking whichever was walked first.
      for (const { producer, fields } of fieldsByProducer) {
        if (fields.has(field)) continue;
        v.push({
          check: 'entry-field-undeclared', site: `${loop.rel}[${loop.activityId}]`,
          detail: `iterates '${loop.over}' as '${loop.item}' and reads '${loop.item}.${field}', and `
            + `'${producer.ref}' declares no '${field}' on one entry of ${held} — it states `
            + `${[...fields].map((f) => `'${f}'`).join(', ')}`,
        });
        break;
      }
    }
  }
  return v;
}

/* --------------------------------- triage --------------------------------- */
/**
 * The corpus debt this guard reports was triaged once, per finding, in
 * ledgers/binding-fidelity-triage.json (issue #327 R3). Every entry carries a verdict and a named
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
      findings.push({ check: v.check, site: v.site, detail: `${v.detail} [untriaged — classify it in ledgers/binding-fidelity-triage.json]` });
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
        : `triaged '${entry.check}' finding no longer occurs — delete the entry from ledgers/binding-fidelity-triage.json`,
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
      detail: `triaged '${entry.check}' finding sits at line ${actual}, not ${cited} — correct the site in ledgers/binding-fidelity-triage.json`,
    });
  }
  return { findings, counts, total: violations.length };
}

/* --------------------------------- CLI runner --------------------------------- */
import { pathToFileURL } from 'node:url';
const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  requireRootOrExit('binding-fidelity', DEFAULT_ROOT);
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
    remedy: 'fix each live bug, and classify each untriaged finding in ledgers/binding-fidelity-triage.json',
  });
}
