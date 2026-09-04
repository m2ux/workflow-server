/**
 * Workflow walker — Layer 1 of the E2E harness.
 *
 * Drives a workflow from its initial activity to a terminal activity through
 * the real MCP server, deterministically. At each activity it resolves the
 * applicable checkpoints (yield → respond → resume) by asking a Policy which
 * option to pick, accumulates the resulting variable effects, and names the exit
 * the activity took — the one a checkpoint option selected, else the first whose
 * `when` holds against that variable bag, else the default — then reads the
 * destination from the workflow's graph.
 *
 * The walker tracks variables locally only to CHOOSE an exit; the server remains
 * the source of truth and validates each transition. A divergence surfaces as a
 * thrown error — itself a useful consistency signal.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { evaluateCondition, type Condition } from '../../src/schema/condition.schema.js';
import { evaluateWhenExpression, parseWhen } from '../../src/schema/when-expression.js';
import { unboundPositiveReads, type GateUnansweredCounts } from '../../src/utils/gate-liveness.js';
import { TERMINAL_SENTINEL } from '../../src/loaders/workflow-loader.js';
import { parseToolResponse, parseWorkflowResponse, parseBundle, rawText, isError, type Harness } from './harness.js';

export interface CheckpointOption {
  id: string;
  label?: string;
  description?: string;
  effect?: {
    setVariable?: Record<string, unknown>;
    exit?: string;
  };
}

export interface CheckpointDef {
  id: string;
  name?: string;
  message?: string;
  condition?: Condition;
  options: CheckpointOption[];
  defaultOption?: string;
}

export interface ExitDef {
  id: string;
  label?: string;
  when?: string;
  isDefault?: boolean;
  immediate?: boolean;
}

/** Exit bindings as the workflow declares them: activity id → exit id → destination. */
export type Graph = Record<string, Record<string, string>>;

/** An exit the activity took, with the destination the workflow binds it to. */
export interface ExitChoice {
  exit: string;
  to: string;
}

export interface StepAction {
  action: string;
  target?: string;
  value?: unknown;
}

export interface StepDef {
  id: string;
  /** Unified step kind (technique | action | checkpoint | loop). Absent only on pre-migration data. */
  kind?: 'technique' | 'action' | 'checkpoint' | 'loop';
  /** Inline boolean gate, e.g. "is_monorepo == true". */
  when?: string;
  /** Structured gate (legacy). */
  condition?: Condition;
  actions?: StepAction[];
  // kind:checkpoint — the checkpoint definition inlined (so a checkpoint StepDef IS a CheckpointDef).
  message?: string;
  options?: CheckpointOption[];
  defaultOption?: string;
  autoAdvanceMs?: number;
  // kind:loop — compound body.
  loopType?: string;
  /** The continuation test of a while/doWhile loop. */
  continueWhile?: Condition;
  steps?: StepDef[];
}

export interface ActivityDef {
  id: string;
  steps?: StepDef[];
  exits?: ExitDef[];
  operations?: string[];
  techniques?: { primary?: string; supporting?: string[] };
  artifactPrefix?: string;
  artifacts?: Array<{ id?: string; name: string; location?: string }>;
}

export interface PolicyContext {
  activityId: string;
  checkpoint: CheckpointDef;
  variables: Record<string, unknown>;
}

export interface Policy {
  name: string;
  /** Variables seeded before the walk begins (e.g. is_review_mode for review mode). */
  initialVariables?: Record<string, unknown>;
  /** Return the option id to select for a checkpoint. */
  choose(ctx: PolicyContext): string;
  /**
   * Model the agent-determined variable outcomes of an activity's steps — the
   * convergence signals (loop-exit gates such as needs_comprehension,
   * elicitation_complete) that a real worker sets in step prose and that a
   * no-LLM walker cannot infer. Applied after the activity's checkpoints,
   * before selecting the next transition. Returns variables to merge.
   */
  simulate?(ctx: { activityId: string; variables: Record<string, unknown> }): Record<string, unknown> | undefined;
}

export interface CheckpointRecord {
  activityId: string;
  checkpointId: string;
  optionId: string;
  setVariable?: Record<string, unknown>;
  exit?: string;
}

export interface WalkStep {
  activityId: string;
  checkpoints: CheckpointRecord[];
  /** Declared artifact filenames for the activity (interpolated). */
  artifacts: string[];
  /** Artifact stub files the robot worker actually wrote to disk (3c mode). */
  artifactsWritten: string[];
  /** Step ids the robot worker executed in order (3c mode). */
  stepsExecuted: string[];
  /**
   * `<step>:<variable>` for each gate this activity evaluated with nothing in the bag to read. A walk
   * has no agent, so technique outputs stay unbound and some of these are structural. What the list
   * makes visible is the rest: a step skipped because its decision had not been taken yet (#469).
   */
  gatesReadUnbound: string[];
  /** next_activity manifest-validation status when leaving this activity (3c mode). */
  manifestStatus?: string;
  /** Checkpoints declared by the activity but referenced by no step/loop step (definition smell). */
  orphanCheckpoints: string[];
  /** Operation refs the activity bundle could not resolve (Layer 2 signal). */
  unresolved: string[];
  /** Number of operation refs the activity declares (from its definition). */
  declaredOperations: number;
  /**
   * The server's own reading of this activity's gated technique steps at delivery: how many stayed
   * lazy because this activity produces the variable (`pending`), because nothing on the path so far
   * has written it (`unbound`), or because the expression does not parse (`unparsed`).
   */
  lazyGates?: GateUnansweredCounts;
  nextActivity: string | null;
}

export interface WalkResult {
  workflowId: string;
  policy: string;
  sessionIndex: string;
  planningSlug: string;
  initialActivity: string;
  /** All activity ids the workflow declares (for coverage / reachability checks). */
  declaredActivities: string[];
  /** Unresolved orchestrator-side operation refs from the workflow bundle. */
  orchestratorUnresolved: string[];
  path: string[];
  steps: WalkStep[];
  variables: Record<string, unknown>;
  finalStatus: string;
  /** Activities the walk reached but the server could not load (e.g. borrowed cross-workflow
   *  activities whose full definition does not resolve). Empty on a clean walk. */
  loadErrors: string[];
  /** One row per gate crossed under `workerIdentity`, in walk order. Empty when the option is off. */
  gateRefetches: GateRefetch[];
}

/** What a resumed worker received when it re-requested its activity after a gate. */
export interface GateRefetch {
  activityId: string;
  checkpointId: string;
  agentId: string;
  /** The server's own fresh/resume discriminator for that arrival. */
  dispatch: string;
  chars: number;
}

export interface WalkOptions {
  /**
   * Dispatch each activity under its own worker identity, carried on every `get_activity` and
   * `get_technique` that activity makes, and re-request the activity under that same identity
   * after each gate. Off by default: the other walks drive the graph, not the delivery ledger,
   * and they authenticate as the session's own agent.
   */
  workerIdentity?: boolean;
  /** Max times any single activity may be entered before the walk aborts. */
  maxVisits?: number;
  /**
   * 'robot' (default, Layer 3c): execute each activity's steps in order, firing
   * checkpoints at the step that declares them, writing declared artifact stubs,
   * and submitting step manifests. 'graph' (Layer 1): resolve all activity
   * checkpoints in array order without step execution — lighter, faster.
   */
  mode?: 'graph' | 'robot';
  /** Absolute planning folder; required for 'robot' mode to write artifact stubs. */
  planningFolder?: string;
  /**
   * Workflow-agnostic drive: when the graph would stall or loop back, optimistically advance
   * to an as-yet-unvisited activity, satisfying its (simple) gate condition — standing in for the
   * convergence variables a real agent sets in step prose. Lets the walker exercise ANY workflow
   * to coverage without workflow-specific simulation, and records (rather than throws on) an
   * activity whose definition the server cannot load. Leave off for the hand-tuned policy walks.
   */
  autoAdvance?: boolean;
  /**
   * Enumeration hook (used by enumeratePaths): choose a checkpoint option or a transition target at
   * each decision point. `options` lists the candidate ids (checkpoint option ids, or transition
   * target activity ids). Return the chosen id, or undefined to fall back to the policy / pickNext.
   * For a chosen transition the walk satisfies that transition's (simple) gate condition so the
   * branch is actually taken — letting the enumerator drive every conditional branch, not just the
   * happy path.
   */
  decide?: (d: { kind: 'checkpoint' | 'transition'; activityId: string; id: string; options: string[]; suggested: string }) => string | undefined;
  /**
   * Resolve checkpoints LOCALLY — apply the chosen option's declared `effect` from the activity
   * definition instead of the server yield→respond→resume cycle. Used by path enumeration / branch
   * coverage: it makes each walk far cheaper (no per-checkpoint round-trips) and side-steps options
   * that a no-agent walk cannot drive through the server (e.g. an input-required checkpoint), so
   * branches behind them are still traversable. The happy-path walks keep server resolution.
   */
  localCheckpoints?: boolean;
}

/** Build the initial variable bag from the workflow's declared defaults. */
function defaultVariables(wf: Record<string, unknown>): Record<string, unknown> {
  const bag: Record<string, unknown> = {};
  const vars = (wf.variables as Array<Record<string, unknown>>) ?? [];
  for (const v of vars) {
    if (v && typeof v.name === 'string' && 'defaultValue' in v) {
      bag[v.name] = v.defaultValue;
    }
  }
  return bag;
}

/**
 * The exit the activity takes, paired with the destination the workflow binds it to. An exit a
 * checkpoint option selected wins; otherwise the first exit whose `when` holds; otherwise the
 * default. Null when the activity is terminal or its exit leads nowhere the graph names.
 */
export function pickExit(act: ActivityDef, graph: Graph, variables: Record<string, unknown>, selected?: string): ExitChoice | null {
  const exits = act.exits ?? [];
  const bound = graph[act.id] ?? {};
  const at = (id: string | undefined): ExitChoice | null => {
    if (id === undefined) return null;
    const to = bound[id];
    return to === undefined ? null : { exit: id, to };
  };
  if (selected !== undefined) return at(selected);
  for (const e of exits) {
    if (e.when === undefined) continue;
    if (evaluateWhenExpression(e.when, variables)) return at(e.id);
  }
  return at(exits.find((e) => e.isDefault)?.id);
}

/** Where the activity goes, or null when it is terminal. */
export function pickNext(act: ActivityDef, graph: Graph, variables: Record<string, unknown>, selected?: string): string | null {
  return pickExit(act, graph, variables, selected)?.to ?? null;
}

/**
 * The exits state alone can take: one carrying a predicate, and the default. An exit with neither
 * is reachable only by a checkpoint option naming it, so nothing that drives the graph from the
 * variable bag — the forward advance, the enumerator's fork over targets — may offer it. Handing it
 * to them lets a walk jump to an activity without passing the gate that decides to go there, which
 * silently drops the coverage of that gate's other options.
 */
function predicateExits(act: ActivityDef): ExitDef[] {
  return (act.exits ?? []).filter((e) => e.when !== undefined || e.isDefault);
}

/**
 * Workflow-agnostic forward advance: pick an exit leading to an as-yet-unvisited activity,
 * optimistically satisfying its `when` by mutating `variables`. This stands in for the agent-set
 * convergence variables a no-LLM walker cannot infer, so any workflow drives forward to coverage
 * without per-workflow simulation. Returns the chosen activity id, or null when no unvisited target
 * can be reached (compound gates that cannot be satisfied are skipped).
 */
function advanceToUnvisited(act: ActivityDef, graph: Graph, variables: Record<string, unknown>, visits: Map<string, number>): string | null {
  const bound = graph[act.id] ?? {};
  for (const e of predicateExits(act)) {
    const to = bound[e.id];
    if (to === undefined || (visits.get(to) ?? 0) > 0) continue;
    if (e.when === undefined) return to;
    const snapshot = { ...variables };
    satisfyWhen(e.when, variables);
    if (evaluateWhenExpression(e.when, variables)) return to;
    for (const k of Object.keys(variables)) delete variables[k];
    Object.assign(variables, snapshot);
  }
  return null;
}

/** Best-effort: set the bag so a single-comparison `when` holds (compound expressions are left alone). */
function satisfyWhen(when: string, variables: Record<string, unknown>): void {
  const parsed = parseWhen(when);
  if (!parsed.ok) return;
  const ast = parsed.ast;
  if (ast.kind === 'truthy') { variables[ast.path] = true; return; }
  if (ast.kind !== 'cmp') return;
  variables[ast.path] = ast.op === '!='
    ? (typeof ast.value === 'boolean' ? !ast.value : `__ne_${String(ast.value)}`)
    : ast.value; // ==, >=, <=, etc.: set to the compared value
}

/** Render an activity's declared artifact filenames (best-effort token interpolation). */
function artifactNames(act: ActivityDef, variables: Record<string, unknown>): string[] {
  return (act.artifacts ?? []).map(a => interpolate(a.name, variables));
}

function interpolate(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{([^}]+)\}/g, (_m, key: string) => {
    const v = variables[key.trim()];
    return v === undefined || v === null ? `{${key}}` : String(v);
  });
}

async function getActivity(
  client: Client,
  sessionIndex: string,
  worker?: { agentId: string; bundle?: 'reference' },
): Promise<{
  def: ActivityDef; unresolved: string[]; bundledSteps: string[]; chars: number;
  dispatch?: string; lazyGates?: GateUnansweredCounts;
}> {
  const res = await client.callTool({
    name: 'get_activity',
    arguments: {
      session_index: sessionIndex,
      context_tokens: 200_000,
      ...(worker ? { agent_id: worker.agentId } : {}),
      ...(worker?.bundle ? { bundle: worker.bundle } : {}),
    },
  });
  if (isError(res)) throw new Error(`get_activity failed: ${JSON.stringify(res.content)}`);
  const def = parseWorkflowResponse(res) as unknown as ActivityDef;
  const bundle = parseBundle(res);
  const unresolved = (bundle.unresolved as string[] | undefined) ?? [];
  const chars = rawText(res).length;
  const dispatch = (res._meta as Record<string, unknown> | undefined)?.['dispatch'] as string | undefined;
  // Hybrid bundling (#166 B11): step ids whose techniques arrived inline in this response —
  // the robot skips their per-step get_technique, as a real worker should.
  const bundledSteps = ((res._meta as { bundled_steps?: string[] } | undefined)?.bundled_steps) ?? [];
  // Why the server left each gated technique step lazy. Absent when every gate had an answer.
  const lazyGates = (res._meta as { lazy_gates?: GateUnansweredCounts } | undefined)?.lazy_gates;
  return { def, unresolved, bundledSteps, chars, dispatch, lazyGates };
}

async function transition(
  client: Client,
  sessionIndex: string,
  activityId: string,
  stepManifest?: Array<{ step_id: string; output: string }>,
): Promise<{ manifestStatus?: string }> {
  const args: Record<string, unknown> = { session_index: sessionIndex, activity_id: activityId };
  if (stepManifest && stepManifest.length) args.step_manifest = stepManifest;
  const res = await client.callTool({ name: 'next_activity', arguments: args });
  if (isError(res)) {
    const text = (res.content?.[0] as { text?: string })?.text ?? JSON.stringify(res.content);
    throw new Error(`next_activity(${activityId}) failed: ${text}`);
  }
  const validation = (res._meta as { validation?: { status?: string } } | undefined)?.validation;
  return { manifestStatus: validation?.status };
}

/** Evaluate a step's inline `when` expression via the shared reference dialect.
 * Unparseable expressions fail closed (skip the step). */
function evaluateWhen(expr: string, vars: Record<string, unknown>): boolean {
  return evaluateWhenExpression(expr, vars);
}

/** Variables the activity's own checkpoints and `set` actions bind, at any depth. */
function activityDecidedVariables(act: ActivityDef): Set<string> {
  const decided = new Set<string>();
  const collect = (steps: StepDef[] | undefined): void => {
    for (const step of steps ?? []) {
      if (step.kind === 'loop') { collect(step.steps); continue; }
      for (const option of step.options ?? []) {
        for (const name of Object.keys(option.effect?.setVariable ?? {})) decided.add(name);
      }
      for (const a of step.actions ?? []) {
        if (a.action === 'set' && a.target) decided.add(a.target.split('.')[0]!);
      }
    }
  };
  collect(act.steps);
  return decided;
}

interface StepExecution {
  cpRecords: CheckpointRecord[];
  manifest: Array<{ step_id: string; output: string }>;
  stepsExecuted: string[];
  /** `<step>:<variable>` for each gate read with nothing in the bag to read. */
  gatesReadUnbound: string[];
  selectedExit?: string;
}

/**
 * Robot worker (3c): execute an activity's steps in order. Gates on step
 * when/condition, fires the checkpoint a step declares (yield→respond→resume)
 * at that step, applies step `set` actions with explicit values, and builds the
 * step manifest. Mechanical only — no LLM — so it is reproducible.
 */
async function executeActivitySteps(
  client: Client,
  sessionIndex: string,
  activityId: string,
  act: ActivityDef,
  variables: Record<string, unknown>,
  policy: Policy,
  bundledSteps: string[] = [],
  worker?: { agentId: string; gateRefetches: GateRefetch[] },
): Promise<StepExecution> {
  const cpRecords: CheckpointRecord[] = [];
  const manifest: Array<{ step_id: string; output: string }> = [];
  const stepsExecuted: string[] = [];
  const gatesReadUnbound: string[] = [];
  const decidedLater = activityDecidedVariables(act);
  let selectedExit: string | undefined;

  const fireCheckpoint = async (cp: CheckpointDef): Promise<void> => {
    const optionId = policy.choose({ activityId, checkpoint: cp, variables });
    const effect = await resolveCheckpoint(client, sessionIndex, cp.id, optionId);
    if (effect.setVariable) Object.assign(variables, effect.setVariable);
    if (effect.exit) selectedExit = effect.exit;
    cpRecords.push({
      activityId, checkpointId: cp.id, optionId,
      setVariable: effect.setVariable, exit: effect.exit,
    });
    // A resumed worker re-requests its activity under the identity its dispatch bound, carrying
    // `bundle: "reference"` so content it still holds arrives as markers. Recording the delivery
    // per gate is what makes identity reuse across MANY gates observable rather than asserted once.
    if (worker) {
      const again = await getActivity(client, sessionIndex, { agentId: worker.agentId, bundle: 'reference' });
      worker.gateRefetches.push({
        activityId,
        checkpointId: cp.id,
        agentId: worker.agentId,
        dispatch: again.dispatch ?? 'unrecorded',
        chars: again.chars,
      });
    }
  };

  // Per-step technique fetch, mirroring the worker disclosure contract: a real
  // agent loads each technique step's composed content via get_technique
  // { step_id } before executing it, and the server records the fetch in the
  // session history (#166 B8) — next_activity's manifest validation warns on
  // manifested technique steps with no recorded fetch. Fetch once per step id
  // per activity visit; loop bodies are walked once, so this matches. Steps
  // whose techniques arrived inline via hybrid bundling (#166 B11) are seeded
  // as already delivered — get_activity recorded their technique_bundled events.
  const fetchedStepIds = new Set<string>(bundledSteps);
  const fetchTechnique = async (stepId: string): Promise<void> => {
    if (fetchedStepIds.has(stepId)) return;
    fetchedStepIds.add(stepId);
    const res = await client.callTool({
      name: 'get_technique',
      arguments: { session_index: sessionIndex, step_id: stepId, ...(worker ? { agent_id: worker.agentId } : {}) },
    });
    if (isError(res)) {
      const text = (res.content?.[0] as { text?: string })?.text ?? JSON.stringify(res.content);
      throw new Error(`get_technique(${activityId}/${stepId}) failed: ${text}`);
    }
  };

  // Walk steps in document order. A kind:checkpoint step IS the checkpoint, fired at its concrete
  // position (present-then-checkpoint is now literal adjacency). A kind:loop step's body is walked
  // once (a single deterministic pass), firing any checkpoints nested inside it. technique/action
  // steps record into the manifest and apply explicit `set` actions.
  const walk = async (steps: StepDef[] | undefined): Promise<void> => {
    for (const step of steps ?? []) {
      // A gate this activity itself decides later, read before that decision is taken, is false for
      // want of an answer — and once the step is skipped that is indistinguishable from a real "no".
      // Record it, because a step absent from stepsExecuted is otherwise silent about why (#469).
      // A `while` loop's continuation test decides its first pass, so it is one of these gates; a
      // `doWhile`'s is taken after a pass the walk has already made.
      const preGate = step.loopType === 'while' ? step.continueWhile : step.condition;
      for (const name of unboundPositiveReads(step.when, preGate as Condition | undefined, variables)) {
        if (decidedLater.has(name)) gatesReadUnbound.push(`${step.id ?? '?'}:${name}`);
      }
      if (step.condition && !evaluateCondition(step.condition, variables)) continue;
      if (step.when && !evaluateWhen(step.when, variables)) continue;
      if (step.kind === 'checkpoint') { await fireCheckpoint(step as unknown as CheckpointDef); continue; }
      if (step.kind === 'loop') {
        // A `while` takes its continuation test before the first pass, so a false test means no
        // pass. A `doWhile` is owed one pass whatever the test says — that is what makes it a
        // doWhile. Either way the walk makes a single deterministic pass; iterating is the
        // runner's job.
        if (step.loopType === 'while' && step.continueWhile
            && !evaluateCondition(step.continueWhile, variables)) continue;
        await walk(step.steps);
        continue;
      }
      if (step.kind === 'technique') await fetchTechnique(step.id);
      stepsExecuted.push(step.id);
      manifest.push({ step_id: step.id, output: 'done' });
      for (const a of step.actions ?? []) {
        if (a.action === 'set' && a.target && a.value !== undefined) variables[a.target] = a.value;
      }
    }
  };
  await walk(act.steps);
  return { cpRecords, manifest, stepsExecuted, gatesReadUnbound, selectedExit };
}

/** The activity's checkpoint definitions in document order: the inline kind:checkpoint steps,
 *  recursing into loop bodies. */
export function activityCheckpointSteps(act: ActivityDef): CheckpointDef[] {
  const out: CheckpointDef[] = [];
  const rec = (steps?: StepDef[]): void => {
    for (const s of steps ?? []) {
      if (s.kind === 'checkpoint') out.push(s as unknown as CheckpointDef);
      if (s.steps) rec(s.steps);
    }
  };
  rec(act.steps);
  return out;
}

/** In the unified model every checkpoint is an inline kind:checkpoint step, so an activity has no
 *  orphan (unreferenced) checkpoints by construction. Kept as the explicit [] invariant the e2e
 *  robot-execution test asserts — a non-empty result would signal a regression to out-of-line checkpoints. */
function findOrphanCheckpoints(_act: ActivityDef): string[] {
  return [];
}

/**
 * Write a stub for each planning-location artifact the activity declares, using
 * find-or-create keyed on the bare filename: if an instance (`<NN>-<bare>` or
 * `<bare>`) already exists in the planning folder, UPDATE it in place (preserving
 * its original number); otherwise CREATE `<prefix>-<bare>` with this activity's
 * prefix. Mirrors the manage-artifacts::write-artifact protocol, so a logical
 * artifact keeps exactly one numbered instance across the whole walk.
 */
function writeArtifactStubs(act: ActivityDef, variables: Record<string, unknown>, planningFolder: string, prefix?: string): string[] {
  const written: string[] = [];
  let existing: string[] = [];
  try { existing = readdirSync(planningFolder); } catch { /* folder not created yet */ }
  for (const art of act.artifacts ?? []) {
    if (art.location && art.location !== 'planning') continue; // only planning-folder artifacts here
    // Interpolate {var}; strip braces from any still-unresolved token so the filename is clean.
    const bare = interpolate(art.name, variables).replace(/\{([^}]+)\}/g, '$1');
    const bareRe = new RegExp(`^(\\d+-)?${bare.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
    // Find-or-create: reuse an existing instance (update in place), else create with this prefix.
    let name = existing.find(f => bareRe.test(f));
    if (!name) {
      const pfx = prefix ?? act.artifactPrefix;
      name = pfx && !/^\d/.test(bare) ? `${pfx}-${bare}` : bare;
    }
    try {
      writeFileSync(join(planningFolder, name), `<!-- robot-worker stub artifact for activity ${act.id} -->\n`);
      if (!written.includes(name)) written.push(name);
      if (!existing.includes(name)) existing.push(name);
    } catch { /* ignore write failures (e.g. missing subdir) */ }
  }
  return written;
}

/** Run one checkpoint's yield → respond → resume cycle, returning its effect. */
async function resolveCheckpoint(
  client: Client,
  sessionIndex: string,
  checkpointId: string,
  optionId: string,
): Promise<{ setVariable?: Record<string, unknown>; exit?: string }> {
  const y = await client.callTool({ name: 'yield_checkpoint', arguments: { session_index: sessionIndex, checkpoint_id: checkpointId } });
  if (isError(y)) throw new Error(`yield_checkpoint(${checkpointId}) failed`);
  const yieldBody = parseToolResponse(y);

  // Re-entering an activity replays its recorded checkpoint response: the server
  // returns status:'replayed' and deliberately does NOT set an active checkpoint
  // (the user is not prompted twice), so there is nothing to respond to. Apply
  // the replayed effect and continue without respond/resume.
  if (yieldBody.status === 'replayed') {
    const effect = (yieldBody.effect ?? {}) as Record<string, unknown>;
    return {
      setVariable: (effect.setVariable ?? effect.variablesSet) as Record<string, unknown> | undefined,
      exit: effect.exit as string | undefined,
    };
  }

  const r = await client.callTool({ name: 'respond_checkpoint', arguments: { session_index: sessionIndex, option_id: optionId } });
  if (isError(r)) throw new Error(`respond_checkpoint(${checkpointId}=${optionId}) failed`);
  const resp = parseToolResponse(r);

  const resume = await client.callTool({ name: 'resume_checkpoint', arguments: { session_index: sessionIndex } });
  if (isError(resume)) throw new Error(`resume_checkpoint(${checkpointId}) failed`);

  const effect = (resp.effect ?? {}) as Record<string, unknown>;
  return {
    setVariable: (effect.setVariable ?? effect.variablesSet) as Record<string, unknown> | undefined,
    exit: effect.exit as string | undefined,
  };
}

/** Walk a workflow end-to-end under the given policy. */
export async function walk(
  harness: Harness,
  workflowId: string,
  policy: Policy,
  opts: WalkOptions = {},
): Promise<WalkResult> {
  const { client } = harness;
  const maxVisits = opts.maxVisits ?? 4;

  const startRes = await client.callTool({
    name: 'start_session',
    arguments: { workflow_id: workflowId, agent_id: 'e2e-walker' },
  });
  if (isError(startRes)) throw new Error(`start_session(${workflowId}) failed`);
  const startBody = parseToolResponse(startRes);
  const sessionIndex = startBody.session_index as string;
  const planningSlug = startBody.planning_slug as string;

  const wfRes = await client.callTool({ name: 'get_workflow', arguments: { session_index: sessionIndex } });
  if (isError(wfRes)) throw new Error('get_workflow failed');
  const wf = parseWorkflowResponse(wfRes);
  const orchestratorUnresolved = (parseBundle(wfRes).unresolved as string[] | undefined) ?? [];
  const wfActivities = (wf.activities as Array<{ id: string; artifactPrefix?: string }> | undefined) ?? [];
  const declaredActivities = wfActivities.map(a => a.id);
  // The workflow's own graph: for each activity, where each of its exits leads. The walk reads the
  // shape from here and the outcome from the activity, which is the split the definitions make.
  const graph = (wf.graph as Graph | undefined) ?? {};
  const activityPrefixes = new Map(wfActivities.map(a => [a.id, a.artifactPrefix] as const));

  const variables: Record<string, unknown> = { ...defaultVariables(wf), ...(policy.initialVariables ?? {}) };
  const initialActivity = (wf.initialActivity
    ?? (wf.activities as Array<{ id: string }> | undefined)?.[0]?.id) as string;

  const mode = opts.mode ?? 'robot';
  const planningFolder = opts.planningFolder
    ?? join(harness.workspaceDir, '.engineering/artifacts/planning', planningSlug);

  const path: string[] = [];
  const steps: WalkStep[] = [];
  const loadErrors: string[] = [];
  const gateRefetches: GateRefetch[] = [];
  const visits = new Map<string, number>();

  let current: string | null = initialActivity;
  let pendingManifest: Array<{ step_id: string; output: string }> | undefined;
  while (current) {
    const v = (visits.get(current) ?? 0) + 1;
    visits.set(current, v);
    if (v > maxVisits) {
      throw new Error(`Loop guard tripped: "${current}" entered ${v}× under policy "${policy.name}" (path: ${path.join(' → ')})`);
    }

    // Transition in, carrying the manifest for the activity we just left (3c).
    const { manifestStatus } = await transition(client, sessionIndex, current, pendingManifest);
    pendingManifest = undefined;
    path.push(current);

    // One identity per dispatch, held for every call this activity's worker makes — including
    // every gate it pauses at. A second visit to the same activity is a new dispatch, so it mints
    // its own, which is what a retry is.
    const visitNo = (path.filter(p => p === current).length);
    const worker = opts.workerIdentity
      ? { agentId: `worker-${current}-${visitNo}`, gateRefetches }
      : undefined;

    let act: ActivityDef;
    let unresolved: string[];
    let bundledSteps: string[];
    let lazyGates: GateUnansweredCounts | undefined;
    try {
      ({ def: act, unresolved, bundledSteps, lazyGates } = await getActivity(client, sessionIndex, worker));
    } catch (e) {
      if (opts.autoAdvance) { loadErrors.push(`${current}: ${(e as Error).message}`); break; }
      throw e;
    }

    let cpRecords: CheckpointRecord[];
    let selectedExit: string | undefined;
    let stepsExecuted: string[] = [];
    let gatesReadUnbound: string[] = [];
    let artifactsWritten: string[] = [];

    if (mode === 'robot') {
      const exec = await executeActivitySteps(client, sessionIndex, current, act, variables, policy, bundledSteps, worker);
      cpRecords = exec.cpRecords;
      selectedExit = exec.selectedExit;
      stepsExecuted = exec.stepsExecuted;
      gatesReadUnbound = exec.gatesReadUnbound;
      pendingManifest = exec.manifest;
      artifactsWritten = writeArtifactStubs(act, variables, planningFolder, activityPrefixes.get(current));
    } else {
      cpRecords = [];
      for (const cp of activityCheckpointSteps(act)) {
        if (cp.condition && !evaluateCondition(cp.condition, variables)) continue;
        const suggested = policy.choose({ activityId: current, checkpoint: cp, variables });
        const optionId = opts.decide?.({ kind: 'checkpoint', activityId: current, id: cp.id, options: cp.options.map((o) => o.id), suggested })
          ?? suggested;
        const effect = opts.localCheckpoints
          ? (cp.options.find((o) => o.id === optionId)?.effect ?? {})
          : await resolveCheckpoint(client, sessionIndex, cp.id, optionId);
        if (effect.setVariable) Object.assign(variables, effect.setVariable);
        if (effect.exit) selectedExit = effect.exit;
        cpRecords.push({
          activityId: current, checkpointId: cp.id, optionId,
          setVariable: effect.setVariable, exit: effect.exit,
        });
      }
    }

    // Model agent-determined step outcomes (loop-exit / convergence signals)
    // before choosing the next transition.
    const simulated = policy.simulate?.({ activityId: current, variables });
    if (simulated) Object.assign(variables, simulated);

    let next = pickNext(act, graph, variables, selectedExit);
    if (selectedExit === undefined) {
      const bound = graph[act.id] ?? {};
      const targets = [...new Set(predicateExits(act).map((e) => bound[e.id]).filter((t): t is string => t !== undefined))];
      if (targets.length && opts.decide) {
        // The natural (happy) target — pickExit's choice, or the forward-advance target, or the
        // first bound exit — is the base-path suggestion; the enumerator forks the rest.
        let suggested = next;
        if (suggested === null || (visits.get(suggested) ?? 0) > 0) suggested = advanceToUnvisited(act, graph, { ...variables }, visits) ?? next;
        const chosen = opts.decide({ kind: 'transition', activityId: current, id: 'next', options: targets, suggested: suggested ?? targets[0]! }) ?? suggested ?? targets[0]!;
        const exit = predicateExits(act).find((e) => bound[e.id] === chosen);
        if (exit?.when) satisfyWhen(exit.when, variables);
        next = chosen;
      } else if (opts.autoAdvance && (next === null || (visits.get(next) ?? 0) > 0)) {
        const fwd = advanceToUnvisited(act, graph, variables, visits);
        if (fwd) next = fwd;
      }
    }
    steps.push({
      activityId: current,
      checkpoints: cpRecords,
      artifacts: artifactNames(act, variables),
      artifactsWritten,
      stepsExecuted,
      gatesReadUnbound,
      manifestStatus,
      orphanCheckpoints: findOrphanCheckpoints(act),
      unresolved,
      declaredOperations: (act.operations ?? []).length,
      lazyGates,
      nextActivity: next,
    });

    if (!next) break;
    // A transition to the terminal sentinel ends the workflow: next_activity
    // accepts it and flips status to `completed`, but there is no activity to
    // load — enter it to record completion, then stop without get_activity.
    if (next === TERMINAL_SENTINEL) {
      await transition(client, sessionIndex, next, pendingManifest);
      break;
    }
    current = next;
  }

  // The session-file `status` field is the authoritative terminal signal
  // (get_workflow_status only ever reports active/blocked). It flips to
  // "completed" when a transition lands on a terminal activity.
  const sessionPath = join(harness.workspaceDir, '.engineering/artifacts/planning', planningSlug, 'session.json');
  let finalStatus = 'unknown';
  try {
    finalStatus = (JSON.parse(readFileSync(sessionPath, 'utf8')).status as string) ?? 'unknown';
  } catch { /* leave as unknown */ }

  return {
    workflowId, policy: policy.name, sessionIndex, planningSlug, initialActivity,
    declaredActivities, orchestratorUnresolved,
    path, steps, variables, finalStatus, loadErrors, gateRefetches,
  };
}

export interface PathSet {
  workflowId: string;
  /** One WalkResult per distinct path discovered (deduped by activity sequence). */
  paths: WalkResult[];
  /** Branches whose walk threw (e.g. an unresolvable checkpoint/transition on that path). */
  errors: Array<{ prefix: string[]; message: string }>;
  /** Number of full walks run (≈ choice-prefixes explored). */
  walks: number;
  /**
   * Every decision-option branch a walk actually took (`<kind>:<activity>:<id>=<option>`).
   *
   * This is what the walks reached, not the workflow's declared decision space: a checkpoint no
   * walk reaches contributes nothing here. Measure against `declaredOptions` in coverage.ts for a
   * denominator that does not move with the walk.
   */
  coveredBranches: string[];
}

/**
 * Cover every decision-option branch through a workflow's decision graph — not just the happy path.
 *
 * Each path is one full walk under a scripted policy that fixes the checkpoint-option choices; the
 * enumerator systematically varies those choices (the workflow's real branch points) breadth-first,
 * forking at every un-taken option that no earlier walk exercised, and dedupes by the resulting
 * activity sequence. Forking only on un-exercised branches keeps the traversal linear in edges
 * rather than combinatorial in paths. `autoAdvance` drives any non-checkpoint forward gate, and
 * `maxVisits` bounds loops, so the tree is finite. Every discovered path is a WalkResult validated
 * like any other (zero unresolved refs, no loadErrors).
 */
export async function enumeratePaths(
  harness: Harness,
  workflowId: string,
  opts: {
    maxVisits?: number; maxWalks?: number;
    maxDryWalks?: number;
    /**
     * Per-activity agent-outcome variables, as a Policy's `simulate` supplies them.
     *
     * The enumerator varies *decisions*; it cannot invent a bag value. So an activity reached only
     * once a convergence signal is set — the loop-exit and completion flags a real worker writes in
     * step prose — is unreachable to it, and every checkpoint beyond that point counts as uncovered
     * for a reason that has nothing to do with the definitions. Passing the same simulation the
     * hand-tuned policy walks use lets coverage speak for the graph rather than for the enumerator.
     */
    simulate?: Record<string, Record<string, unknown>>;
  } = {},
): Promise<PathSet> {
  const maxVisits = opts.maxVisits ?? 6;
  const maxWalks = opts.maxWalks ?? 2000;
  // Early-stop once branch coverage plateaus: after this many consecutive walks that exercise NO
  // new decision-option (a coverage dry-streak), the reachable branch set is covered and further
  // walks only re-tread it. Bounds wall-clock on large borrowed-activity workflows (e.g. remediate-
  // vuln) without an arbitrary walk cap — it never stops while new branches are still being found.
  const maxDryWalks = opts.maxDryWalks ?? 30;
  const seenPaths = new Set<string>();
  const triedPrefixes = new Set<string>();
  const covered = new Set<string>();
  const paths: WalkResult[] = [];
  const errors: Array<{ prefix: string[]; message: string }> = [];
  const queue: string[][] = [[]];
  let walks = 0;
  let dryStreak = 0;

  while (queue.length) {
    if (walks >= maxWalks) break;
    if (dryStreak >= maxDryWalks) break; // coverage plateaued — remaining queue only re-treads covered branches
    const prefix = queue.shift()!;
    const pk = prefix.join(',');
    if (triedPrefixes.has(pk)) continue;
    triedPrefixes.add(pk);

    // Scripted decisions: serve the prefix in decision-encounter order (each decision is a
    // checkpoint option-set OR a transition target-set), then default to the first candidate.
    // Record each decision's candidates + the choice taken so we can fork on every un-taken branch.
    const recorder: Array<{ key: string; options: string[]; chosen: string }> = [];
    let idx = 0;
    const decide = (d: { kind: string; activityId: string; id: string; options: string[]; suggested: string }): string => {
      const key = `${d.kind}:${d.activityId}:${d.id}`;
      // Within the prefix, take the scripted choice; past it, take the natural (happy) suggestion
      // so the base path is the happy path and every fork is an explicit alternative branch.
      const chosen = idx < prefix.length && d.options.includes(prefix[idx]!) ? prefix[idx]! : d.suggested;
      recorder.push({ key, options: d.options, chosen });
      idx++;
      return chosen;
    };
    walks++;
    let r: WalkResult;
    try {
      const enumPolicy: Policy = {
        name: 'enum',
        choose: (ctx: PolicyContext) => (ctx.checkpoint.defaultOption && ctx.checkpoint.options.some((o) => o.id === ctx.checkpoint.defaultOption)
          ? ctx.checkpoint.defaultOption : ctx.checkpoint.options[0]!.id),
        ...(opts.simulate ? { simulate: (ctx) => opts.simulate![ctx.activityId] } : {}),
      };
      r = await walk(harness, workflowId, enumPolicy, { mode: 'graph', maxVisits, decide, localCheckpoints: true });
    } catch (e) {
      const message = (e as Error).message;
      // A loop-guard trip means the prefix drove a loop past maxVisits — expected during
      // enumeration (the loop edge is already covered at its bounded count), not a finding.
      // Record only genuine failures (e.g. an unresolvable checkpoint/transition on the branch).
      if (!/Loop guard tripped/.test(message)) errors.push({ prefix, message });
      dryStreak++; // a tripped/errored walk exercised no new branch
      continue;
    }
    const key = r.path.join(' > ');
    if (!seenPaths.has(key)) { seenPaths.add(key); paths.push(r); }
    const coveredBefore = covered.size;
    for (const rec of recorder) covered.add(`${rec.key}=${rec.chosen}`);
    dryStreak = covered.size > coveredBefore ? 0 : dryStreak + 1;

    // Fork: enqueue the prefix that takes each un-chosen option at each decision, skipping any
    // branch already exercised — so each branch is walked ~once (linear), not every combination.
    for (let i = 0; i < recorder.length; i++) {
      for (const opt of recorder[i]!.options) {
        if (opt === recorder[i]!.chosen) continue;
        if (covered.has(`${recorder[i]!.key}=${opt}`)) continue;
        queue.push([...recorder.slice(0, i).map((x) => x.chosen), opt]);
      }
    }
  }

  return { workflowId, paths, errors, walks, coveredBranches: [...covered].sort() };
}
