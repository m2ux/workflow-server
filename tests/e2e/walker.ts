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
  checkpoint?: string;
  /** Inline boolean gate, e.g. "is_monorepo == true". */
  when?: string;
  /** Structured gate (legacy). */
  condition?: Condition;
  actions?: StepAction[];
}

export interface ActivityDef {
  id: string;
  steps?: StepDef[];
  checkpoints?: CheckpointDef[];
  transitions?: TransitionDef[];
  operations?: string[];
  techniques?: { primary?: string; supporting?: string[] };
  artifactPrefix?: string;
  artifacts?: Array<{ id?: string; name: string; location?: string }>;
  loops?: Array<{ id?: string; steps?: StepDef[] }>;
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

  for (const step of act.steps ?? []) {
    if (step.condition && !evaluateCondition(step.condition, variables)) continue;
    if (step.when && !evaluateWhen(step.when, variables)) continue;
    stepsExecuted.push(step.id);
    manifest.push({ step_id: step.id, output: 'done' });

    if (step.checkpoint) {
      const cp = (act.checkpoints ?? []).find(c => c.id === step.checkpoint);
      if (cp && (!cp.condition || evaluateCondition(cp.condition, variables))) {
        const optionId = policy.choose({ activityId, checkpoint: cp, variables });
        const effect = await resolveCheckpoint(client, sessionIndex, cp.id, optionId);
        if (effect.setVariable) Object.assign(variables, effect.setVariable);
        if (effect.transitionTo) transitionOverride = effect.transitionTo;
        cpRecords.push({
          activityId, checkpointId: cp.id, optionId,
          setVariable: effect.setVariable, transitionTo: effect.transitionTo, skipActivities: effect.skipActivities,
        });
      }
    }

    for (const a of step.actions ?? []) {
      if (a.action === 'set' && a.target && a.value !== undefined) variables[a.target] = a.value;
    }
  }
  return { cpRecords, manifest, stepsExecuted, transitionOverride };
}

/** Checkpoints the activity declares but no step (or loop step) references. */
function findOrphanCheckpoints(act: ActivityDef): string[] {
  const referenced = new Set<string>();
  for (const s of act.steps ?? []) if (s.checkpoint) referenced.add(s.checkpoint);
  for (const loop of act.loops ?? []) for (const s of loop.steps ?? []) if (s.checkpoint) referenced.add(s.checkpoint);
  return (act.checkpoints ?? []).map(c => c.id).filter(id => !referenced.has(id));
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

  const wfRes = await client.callTool({ name: 'get_workflow', arguments: { session_index: sessionIndex, summary: true } });
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

    const { def: act, unresolved } = await getActivity(client, sessionIndex);

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
      for (const cp of act.checkpoints ?? []) {
        if (cp.condition && !evaluateCondition(cp.condition, variables)) continue;
        const optionId = policy.choose({ activityId: current, checkpoint: cp, variables });
        const effect = await resolveCheckpoint(client, sessionIndex, cp.id, optionId);
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

    const next = pickNext(act, variables, transitionOverride);
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
    path, steps, variables, finalStatus,
  };
}
