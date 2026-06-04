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
import { readFileSync } from 'node:fs';
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

export interface ActivityDef {
  id: string;
  steps?: Array<{ id: string; checkpoint?: string }>;
  checkpoints?: CheckpointDef[];
  transitions?: TransitionDef[];
  operations?: string[];
  techniques?: { primary?: string; supporting?: string[] };
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
  artifacts: string[];
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

async function transition(client: Client, sessionIndex: string, activityId: string): Promise<void> {
  const res = await client.callTool({
    name: 'next_activity',
    arguments: { session_index: sessionIndex, activity_id: activityId },
  });
  if (isError(res)) {
    const text = (res.content?.[0] as { text?: string })?.text ?? JSON.stringify(res.content);
    throw new Error(`next_activity(${activityId}) failed: ${text}`);
  }
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
  const declaredActivities = ((wf.activities as Array<{ id: string }> | undefined) ?? []).map(a => a.id);

  const variables: Record<string, unknown> = { ...defaultVariables(wf), ...(policy.initialVariables ?? {}) };
  const initialActivity = (wf.initialActivity
    ?? (wf.activities as Array<{ id: string }> | undefined)?.[0]?.id) as string;

  const path: string[] = [];
  const steps: WalkStep[] = [];
  const visits = new Map<string, number>();

  let current: string | null = initialActivity;
  while (current) {
    const v = (visits.get(current) ?? 0) + 1;
    visits.set(current, v);
    if (v > maxVisits) {
      throw new Error(`Loop guard tripped: "${current}" entered ${v}× under policy "${policy.name}" (path: ${path.join(' → ')})`);
    }

    await transition(client, sessionIndex, current);
    path.push(current);

    const { def: act, unresolved } = await getActivity(client, sessionIndex);

    const cpRecords: CheckpointRecord[] = [];
    let transitionOverride: string | undefined;
    for (const cp of act.checkpoints ?? []) {
      if (cp.condition && !evaluateCondition(cp.condition, variables)) continue;
      const optionId = policy.choose({ activityId: current, checkpoint: cp, variables });
      const effect = await resolveCheckpoint(client, sessionIndex, cp.id, optionId);
      if (effect.setVariable) Object.assign(variables, effect.setVariable);
      if (effect.transitionTo) transitionOverride = effect.transitionTo;
      cpRecords.push({
        activityId: current,
        checkpointId: cp.id,
        optionId,
        setVariable: effect.setVariable,
        transitionTo: effect.transitionTo,
        skipActivities: effect.skipActivities,
      });
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
    workflowId, policy: policy.name, sessionIndex, initialActivity,
    declaredActivities, orchestratorUnresolved,
    path, steps, variables, finalStatus,
  };
}
