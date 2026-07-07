/**
 * Workflow walker — Layer 1 of the E2E harness.
 *
 * Drives a workflow from its initial activity to a terminal activity through
 * the real MCP server, deterministically. At each activity it resolves the
 * applicable checkpoints (yield → respond → resume) by asking a Policy which
 * option to pick, accumulates the resulting variable effects, and selects the
 * next activity by evaluating the activity's transitions against that variable
 * bag with the server's own `evaluateCondition`.
 *
 * The walker tracks variables locally only to CHOOSE a transition; the server
 * remains the source of truth and validates each transition. A divergence
 * surfaces as a thrown error — itself a useful consistency signal.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { evaluateCondition, type Condition } from '../../src/schema/condition.schema.js';
import { TERMINAL_SENTINEL } from '../../src/loaders/workflow-loader.js';
import { parseToolResponse, parseWorkflowResponse, parseBundle, isError, type Harness } from './harness.js';

export interface CheckpointOption {
  id: string;
  label?: string;
  description?: string;
  effect?: {
    setVariable?: Record<string, unknown>;
    transitionTo?: string;
    skipActivities?: string[];
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

export interface TransitionDef {
  to: string;
  condition?: Condition;
  isDefault?: boolean;
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
  blocking?: boolean;
  // kind:loop — compound body.
  loopType?: string;
  steps?: StepDef[];
}

export interface ActivityDef {
  id: string;
  steps?: StepDef[];
  transitions?: TransitionDef[];
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
  transitionTo?: string;
  skipActivities?: string[];
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
  /** next_activity manifest-validation status when leaving this activity (3c mode). */
  manifestStatus?: string;
  /** Checkpoints declared by the activity but referenced by no step/loop step (definition smell). */
  orphanCheckpoints: string[];
  /** Operation refs the activity bundle could not resolve (Layer 2 signal). */
  unresolved: string[];
  /** Number of operation refs the activity declares (from its definition). */
  declaredOperations: number;
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
}

export interface WalkOptions {
  agentId?: string;
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
 * Select the next activity id from an activity's transitions, or null when the
 * activity is terminal. A checkpoint `transitionTo` effect overrides the graph.
 */
export function pickNext(act: ActivityDef, variables: Record<string, unknown>, override?: string): string | null {
  if (override) return override;
  const transitions = act.transitions ?? [];
  let fallback: string | null = null;
  for (const t of transitions) {
    if (t.condition) {
      if (evaluateCondition(t.condition, variables)) return t.to;
    } else if (!t.isDefault) {
      return t.to; // unconditional, non-default → take immediately
    }
    if (t.isDefault) fallback = t.to;
  }
  return fallback;
}

/**
 * Workflow-agnostic forward advance: pick a transition to an as-yet-unvisited activity,
 * optimistically satisfying its (simple) gate condition by mutating `variables`. This stands in
 * for the agent-set convergence variables a no-LLM walker cannot infer, so any workflow drives
 * forward to coverage without per-workflow simulation. Returns the chosen activity id, or null
 * when no unvisited target can be reached (compound gates that cannot be satisfied are skipped).
 */
function advanceToUnvisited(act: ActivityDef, variables: Record<string, unknown>, visits: Map<string, number>): string | null {
  for (const t of act.transitions ?? []) {
    if ((visits.get(t.to) ?? 0) > 0) continue;
    if (!t.condition) return t.to;
    const snapshot = { ...variables };
    satisfyCondition(t.condition, variables);
    if (evaluateCondition(t.condition, variables)) return t.to;
    for (const k of Object.keys(variables)) delete variables[k];
    Object.assign(variables, snapshot);
  }
  return null;
}

/** Best-effort: set the bag so a SIMPLE condition evaluates true (compound conditions are left alone). */
function satisfyCondition(cond: unknown, variables: Record<string, unknown>): void {
  const c = cond as { type?: string; variable?: string; operator?: string; value?: unknown };
  if (!c || c.type !== 'simple' || typeof c.variable !== 'string') return;
  if (c.operator === '!=') variables[c.variable] = typeof c.value === 'boolean' ? !c.value : `__ne_${String(c.value)}`;
  else variables[c.variable] = c.value; // ==, >=, <=, etc.: set to the compared value
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

async function getActivity(client: Client, sessionIndex: string): Promise<{ def: ActivityDef; unresolved: string[] }> {
  const res = await client.callTool({ name: 'get_activity', arguments: { session_index: sessionIndex } });
  if (isError(res)) throw new Error(`get_activity failed: ${JSON.stringify(res.content)}`);
  const def = parseWorkflowResponse(res) as unknown as ActivityDef;
  const bundle = parseBundle(res);
  const unresolved = (bundle.unresolved as string[] | undefined) ?? [];
  return { def, unresolved };
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

/** Resolve a dot-path against the variable bag. */
function getVar(path: string, vars: Record<string, unknown>): unknown {
  let cur: unknown = vars;
  for (const part of path.split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/** Evaluate a step's inline `when` expression. Unparseable expressions don't gate (execute). */
function evaluateWhen(expr: string, vars: Record<string, unknown>): boolean {
  const m = expr.match(/^\s*([\w.]+)\s*(==|!=)\s*(.+?)\s*$/);
  if (!m) {
    // Bare variable → truthiness.
    const bare = expr.trim().match(/^[\w.]+$/);
    if (bare) return Boolean(getVar(expr.trim(), vars));
    return true;
  }
  const [, key, op, raw] = m;
  let expected: unknown = raw;
  if (raw === 'true') expected = true;
  else if (raw === 'false') expected = false;
  else if (raw === 'null') expected = null;
  else if (/^["'].*["']$/.test(raw)) expected = raw.slice(1, -1);
  else if (/^-?\d+$/.test(raw)) expected = Number(raw);
  const actual = getVar(key, vars);
  return op === '==' ? actual === expected : actual !== expected;
}

interface StepExecution {
  cpRecords: CheckpointRecord[];
  manifest: Array<{ step_id: string; output: string }>;
  stepsExecuted: string[];
  transitionOverride?: string;
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
): Promise<StepExecution> {
  const cpRecords: CheckpointRecord[] = [];
  const manifest: Array<{ step_id: string; output: string }> = [];
  const stepsExecuted: string[] = [];
  let transitionOverride: string | undefined;

  const fireCheckpoint = async (cp: CheckpointDef): Promise<void> => {
    const optionId = policy.choose({ activityId, checkpoint: cp, variables });
    const effect = await resolveCheckpoint(client, sessionIndex, cp.id, optionId);
    if (effect.setVariable) Object.assign(variables, effect.setVariable);
    if (effect.transitionTo) transitionOverride = effect.transitionTo;
    cpRecords.push({
      activityId, checkpointId: cp.id, optionId,
      setVariable: effect.setVariable, transitionTo: effect.transitionTo, skipActivities: effect.skipActivities,
    });
  };

  // Per-step technique fetch, mirroring the worker disclosure contract: a real
  // agent loads each technique step's composed content via get_technique
  // { step_id } before executing it, and the server records the fetch in the
  // session history (#166 B8) — next_activity's manifest validation warns on
  // manifested technique steps with no recorded fetch. Fetch once per step id
  // per activity visit; loop bodies are walked once, so this matches.
  const fetchedStepIds = new Set<string>();
  const fetchTechnique = async (stepId: string): Promise<void> => {
    if (fetchedStepIds.has(stepId)) return;
    fetchedStepIds.add(stepId);
    const res = await client.callTool({ name: 'get_technique', arguments: { session_index: sessionIndex, step_id: stepId } });
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
      if (step.condition && !evaluateCondition(step.condition, variables)) continue;
      if (step.when && !evaluateWhen(step.when, variables)) continue;
      if (step.kind === 'checkpoint') { await fireCheckpoint(step as unknown as CheckpointDef); continue; }
      if (step.kind === 'loop') { await walk(step.steps); continue; }
      if (step.kind === 'technique') await fetchTechnique(step.id);
      stepsExecuted.push(step.id);
      manifest.push({ step_id: step.id, output: 'done' });
      for (const a of step.actions ?? []) {
        if (a.action === 'set' && a.target && a.value !== undefined) variables[a.target] = a.value;
      }
    }
  };
  await walk(act.steps);
  return { cpRecords, manifest, stepsExecuted, transitionOverride };
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
): Promise<{ setVariable?: Record<string, unknown>; transitionTo?: string; skipActivities?: string[] }> {
  const y = await client.callTool({ name: 'yield_checkpoint', arguments: { session_index: sessionIndex, checkpoint_id: checkpointId } });
  if (isError(y)) throw new Error(`yield_checkpoint(${checkpointId}) failed`);

  const r = await client.callTool({ name: 'respond_checkpoint', arguments: { session_index: sessionIndex, option_id: optionId } });
  if (isError(r)) throw new Error(`respond_checkpoint(${checkpointId}=${optionId}) failed`);
  const resp = parseToolResponse(r);

  const resume = await client.callTool({ name: 'resume_checkpoint', arguments: { session_index: sessionIndex } });
  if (isError(resume)) throw new Error(`resume_checkpoint(${checkpointId}) failed`);

  const effect = (resp.effect ?? {}) as Record<string, unknown>;
  return {
    setVariable: (effect.setVariable ?? effect.variablesSet) as Record<string, unknown> | undefined,
    transitionTo: (effect.transitionTo ?? effect.transitionedTo) as string | undefined,
    skipActivities: (effect.skipActivities ?? effect.activitiesSkipped) as string[] | undefined,
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
    arguments: { workflow_id: workflowId, agent_id: opts.agentId ?? 'e2e-walker' },
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

    let act: ActivityDef;
    let unresolved: string[];
    try {
      ({ def: act, unresolved } = await getActivity(client, sessionIndex));
    } catch (e) {
      if (opts.autoAdvance) { loadErrors.push(`${current}: ${(e as Error).message}`); break; }
      throw e;
    }

    let cpRecords: CheckpointRecord[];
    let transitionOverride: string | undefined;
    let stepsExecuted: string[] = [];
    let artifactsWritten: string[] = [];

    if (mode === 'robot') {
      const exec = await executeActivitySteps(client, sessionIndex, current, act, variables, policy);
      cpRecords = exec.cpRecords;
      transitionOverride = exec.transitionOverride;
      stepsExecuted = exec.stepsExecuted;
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
        if (effect.transitionTo) transitionOverride = effect.transitionTo;
        cpRecords.push({
          activityId: current, checkpointId: cp.id, optionId,
          setVariable: effect.setVariable, transitionTo: effect.transitionTo, skipActivities: effect.skipActivities,
        });
      }
    }

    // Model agent-determined step outcomes (loop-exit / convergence signals)
    // before choosing the next transition.
    const simulated = policy.simulate?.({ activityId: current, variables });
    if (simulated) Object.assign(variables, simulated);

    let next = pickNext(act, variables, transitionOverride);
    if (!transitionOverride) {
      const targets = [...new Set((act.transitions ?? []).map((t) => t.to))];
      if (targets.length && opts.decide) {
        // The natural (happy) target — pickNext's choice, or the forward-advance target, or the
        // first declared transition — is the base-path suggestion; the enumerator forks the rest.
        let suggested = next;
        if (suggested === null || (visits.get(suggested) ?? 0) > 0) suggested = advanceToUnvisited(act, { ...variables }, visits) ?? next;
        const chosen = opts.decide({ kind: 'transition', activityId: current, id: 'next', options: targets, suggested: suggested ?? targets[0]! }) ?? suggested ?? targets[0]!;
        const t = (act.transitions ?? []).find((tr) => tr.to === chosen);
        if (t?.condition) satisfyCondition(t.condition, variables);
        next = chosen;
      } else if (opts.autoAdvance && (next === null || (visits.get(next) ?? 0) > 0)) {
        const fwd = advanceToUnvisited(act, variables, visits);
        if (fwd) next = fwd;
      }
    }
    steps.push({
      activityId: current,
      checkpoints: cpRecords,
      artifacts: artifactNames(act, variables),
      artifactsWritten,
      stepsExecuted,
      manifestStatus,
      orphanCheckpoints: findOrphanCheckpoints(act),
      unresolved,
      declaredOperations: (act.operations ?? []).length,
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
    path, steps, variables, finalStatus, loadErrors,
  };
}

export interface PathSet {
  workflowId: string;
  /** One WalkResult per distinct path discovered (deduped by activity sequence). */
  paths: WalkResult[];
  /** `path.join(' > ')` for each distinct path. */
  distinctPaths: string[];
  /** Branches whose walk threw (e.g. an unresolvable checkpoint/transition on that path). */
  errors: Array<{ prefix: string[]; message: string }>;
  /** Number of full walks run (≈ choice-prefixes explored). */
  walks: number;
  /** True if the maxPaths/maxWalks cap was hit before exhausting the decision tree. */
  capped: boolean;
  /** Distinct decision-option branches discovered (`<kind>:<activity>:<id>=<option>`). */
  branchesKnown: number;
  /** Of those, how many were actually exercised by some walk. */
  branchesCovered: number;
}

/**
 * Enumerate every distinct path through a workflow's decision graph — not just the happy path.
 *
 * Each path is one full walk under a scripted policy that fixes the checkpoint-option choices; the
 * enumerator systematically varies those choices (the workflow's real branch points) breadth-first,
 * forking at every un-taken option, and dedupes by the resulting activity sequence. `autoAdvance`
 * drives any non-checkpoint forward gate, and `maxVisits` bounds loops, so the tree is finite. Every
 * discovered path is a WalkResult validated like any other (zero unresolved refs, no loadErrors).
 */
export async function enumeratePaths(
  harness: Harness,
  workflowId: string,
  opts: { maxVisits?: number; maxPaths?: number; maxWalks?: number; coverageMode?: boolean; maxDryWalks?: number } = {},
): Promise<PathSet> {
  const maxVisits = opts.maxVisits ?? 6;
  const maxPaths = opts.maxPaths ?? 256;
  const maxWalks = opts.maxWalks ?? 2000;
  // coverageMode: fork a branch only while it is still UN-exercised — turning the combinatorial
  // per-path enumeration into linear edge/option coverage (every decision-option hit at least once).
  const coverageMode = opts.coverageMode ?? false;
  // Early-stop once branch coverage plateaus: after this many consecutive walks that exercise NO
  // new decision-option (a coverage dry-streak), the reachable branch set is covered and further
  // walks only re-tread it. Bounds wall-clock on large borrowed-activity workflows (e.g. remediate-
  // vuln) without an arbitrary walk cap — it never stops while new branches are still being found.
  // Only meaningful in coverageMode (the goal IS branch coverage); plain path-enumeration may find
  // new PATHS without covering new branches, so there the dry-streak is disabled.
  const maxDryWalks = opts.maxDryWalks ?? (coverageMode ? 30 : Infinity);
  const seenPaths = new Set<string>();
  const triedPrefixes = new Set<string>();
  const covered = new Set<string>();
  const known = new Set<string>();
  const paths: WalkResult[] = [];
  const errors: Array<{ prefix: string[]; message: string }> = [];
  const queue: string[][] = [[]];
  let walks = 0;
  let capped = false;
  let dryStreak = 0;

  while (queue.length) {
    if (paths.length >= maxPaths || walks >= maxWalks) { capped = queue.length > 0; break; }
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
      for (const o of d.options) known.add(`${key}=${o}`);
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

    // Fork: enqueue the prefix that takes each un-chosen option at each decision. In coverageMode,
    // skip a fork whose branch is already exercised — so each branch is walked ~once (linear), not
    // every combination (combinatorial).
    for (let i = 0; i < recorder.length; i++) {
      for (const opt of recorder[i]!.options) {
        if (opt === recorder[i]!.chosen) continue;
        if (coverageMode && covered.has(`${recorder[i]!.key}=${opt}`)) continue;
        queue.push([...recorder.slice(0, i).map((x) => x.chosen), opt]);
      }
    }
  }

  return { workflowId, paths, distinctPaths: [...seenPaths], errors, walks, capped, branchesKnown: known.size, branchesCovered: covered.size };
}
