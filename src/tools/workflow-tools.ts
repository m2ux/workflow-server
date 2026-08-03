import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PathPresentationMap, ServerConfig } from '../config.js';
import {
  DEFAULT_BUNDLE_HEADROOM_FRACTION,
  DEFAULT_BUNDLE_CHARS_PER_TOKEN,
  DEFAULT_BATCH_HEADROOM_FRACTION,
  DEFAULT_BATCH_MAX_ACTIVITIES,
  presentPathToAgent,
} from '../config.js';
import { listWorkflows, listWorkflowsWithDiagnostics, loadWorkflow, loadWorkflowWithDiagnostics, getActivity, getCheckpoint, readActivityRaw, buildFragmentsLookup, TERMINAL_SENTINEL } from '../loaders/workflow-loader.js';
import { injectCheckpointFragmentBodies, resolveCheckpointFragment, scanCheckpointRefLines } from '../loaders/fragment-resolver.js';
import { resolveTechniques, formatTechniqueBundle, composeActivityTechnique, projectTechnique, projectTechniqueToYaml } from '../loaders/technique-loader.js';
import { CORE_ORCHESTRATOR_TECHNIQUES, CORE_WORKER_TECHNIQUES } from '../loaders/core-ops.js';
import { readResourceRaw } from '../loaders/resource-loader.js';
import { injectResolvedStepIds, techniqueName, flattenActivitySteps, type Activity, type Step } from '../schema/activity.schema.js';
import { buildProvenanceContext, decorateTechniqueProvenance } from '../utils/binding-provenance.js';
import { withAuditLog, logWarn } from '../logging.js';
import { applyVariableWrites } from '../utils/variable-seed.js';
import { stringifyForResponse } from '../utils/serialization.js';
import { contentHash, deliveredHash, dedupTechniqueBlocks, deliveryScope, recordDeliveries, unchangedMarker } from '../utils/delivery.js';
import { dispatchKind, hasDispatch, priorDeliveryScope, recordDispatch, recordRedelivery } from '../utils/dispatch.js';
import { batchActivities, batchBound, batchMayContinue, batchRefusal, batchRefusalMessage, deliveredChars, recordBatchRefusal } from '../utils/batch.js';
import { extractResourceIds, qualifyResourceId } from '../utils/resource-ref.js';
import { readdir } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';
import { DEFAULT_MAX_EAGER_RESOURCE_CHARS, loadResourceDelivery } from '../utils/resource-delivery.js';
import { appendStepStartedIfAbsent } from '../utils/step-events.js';
import {
  sessionIndexParam,
  contextTokensParam,
  agentIdParam,
  assertNoActiveCheckpoint,
  loadSessionForTool,
  advanceSession,
  saveSessionForTool,
  sessionView,
  navigatePath,
  describeSessionStoreError,
  SessionStoreError,
  buildSessionScope,
  listSessionSearchRoots,
} from '../utils/session/index.js';
import type { SessionFile } from '../schema/session.schema.js';
import { buildValidation, validateWorkflowVersion, validateActivityTransition, validateStepManifest, validateTechniqueFetches, validateTransitionCondition, validateActivityManifest } from '../utils/validation.js';
import type { StepManifestEntry, ActivityManifestEntry } from '../utils/validation.js';
import { createTraceToken, decodeTraceToken } from '../trace.js';
import type { TraceEvent, TraceTokenPayload } from '../trace.js';

const stepManifestSchema = z.array(z.object({
  step_id: z.string(),
  output: z.string(),
})).optional().describe('Completed steps from the previous activity: [{step_id, output}]. Use literal step ids (field is step_id, not id). Multi-output steps: JSON object keyed by output id. Omit entirely when no steps ran — not [].');

const activityManifestSchema = z.array(z.object({
  activity_id: z.string(),
  outcome: z.string(),
  transition_condition: z.string().optional(),
})).optional().describe('Orchestrator activity-completion manifest: [{activity_id, outcome, transition_condition?}].');

const usageSchema = z.record(z.unknown()).describe(
  'Harness-reported token usage for ONE activity (DELTA since the last figure recorded for this \n'
  + 'dispatch — not a cumulative session total). A dispatch carrying a run of activities records one \n'
  + 'call per activity as it completes, so cost keeps a figure per activity and a batch size can be \n'
  + 'calibrated from real runs. Include numeric token fields the harness reports (`input_tokens`, \n'
  + '`output_tokens`, `total_tokens`, `subagent_tokens`, cache/model fields). Recorded as an \n'
  + '`activity_usage` history event keyed to the activity that ran; inspect_session view:usage \n'
  + 'projects each row and plain-sums known token keys across rows. Workers cannot self-measure: \n'
  + 'omit the record_usage call entirely when the harness surfaces nothing rather than passing zeros.',
);

const artifactsProducedSchema = z.array(z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().optional(),
})).optional().describe(
  'Artifacts the completing activity produced: [{id, name, path?}]. Merged by id into the session declared-artifact accumulation; planning-folder reconciliation joins on id (warn-only).',
);

const variablesChangedSchema = z.record(z.unknown()).optional().describe(
  'Variable assignments the completing activity produced — relay the worker\'s `activity_complete` `variables_changed` map verbatim. ' +
  'The server writes them into the session variable bag and records one `variable_set` history event per name, so the bag a later ' +
  'get_workflow_status / inspect_session returns reflects worker outputs and survives a lost agent context. Declared types are ' +
  'validated warn-only: a mismatch is stored as written and surfaced in _meta.validation. Omit when the activity changed nothing.',
);

/**
 * Wrap a tool handler so any thrown `SessionStoreError` is re-thrown with a
 * user-facing message. Keeps the per-handler logic terse — handlers can
 * assume `loadSessionForTool` succeeded or surface a clear error.
 */
function withSessionStoreErrors<T extends Record<string, unknown>, R>(
  handler: (args: T) => Promise<R>,
): (args: T) => Promise<R> {
  return async (args: T) => {
    try {
      return await handler(args);
    } catch (err) {
      if (err instanceof SessionStoreError) {
        throw new Error(describeSessionStoreError(err));
      }
      throw err;
    }
  };
}

/**
 * Compose an activity's artifact contract from the `## Outputs` of the techniques its steps bind.
 * Activities no longer declare `artifacts[]`; the contract IS the union of the per-step techniques'
 * declared output artifacts — each output's `#### artifact` filename — deduped by filename in step
 * order. The technique `## Outputs` is the single source of truth for artifact identity (AP-43/65);
 * this synthesizes the activity-level view the worker reads, so it can never drift from the steps.
 */
type StepLike = { technique?: unknown; steps?: unknown[] };

export async function composeActivityArtifacts(
  activity: { steps?: Array<StepLike> } | undefined,
  workflowDir: string,
  workflowId: string,
  activityId?: string,
): Promise<Array<{ id: string; name: string; audience?: 'human' | 'agent' }>> {
  if (!activity) return [];
  const refs = new Set<string>();
  const collect = (steps?: Array<StepLike>): void => {
    for (const s of steps ?? []) {
      const n = techniqueName(s.technique as Parameters<typeof techniqueName>[0]);
      if (n) refs.add(n);
      if (Array.isArray(s.steps)) collect(s.steps as Array<StepLike>); // loop-kind nested body
    }
  };
  collect(activity.steps);
  if (refs.size === 0) return [];
  // Resolve like get_technique: a bare op may be activity-group shorthand (`<activityId>::<op>`), so
  // try the activity-named-group form too. resolveTechniques returns type 'not-found' for a candidate
  // that doesn't exist, so passing both forms is safe.
  const candidates = new Set<string>();
  for (const r of refs) {
    candidates.add(r);
    if (activityId && !r.includes('::')) candidates.add(`${activityId}::${r}`);
  }
  const resolved = await resolveTechniques([...candidates], workflowDir, workflowId);
  const artifacts: Array<{ id: string; name: string; audience?: 'human' | 'agent' }> = [];
  const seen = new Set<string>();
  for (const t of resolved) {
    if (t.type !== 'technique') continue;
    const outputs = (t.body as { outputs?: Array<{ id?: string; artifact?: { name?: string }; audience?: 'human' | 'agent' }> } | undefined)?.outputs ?? [];
    for (const o of outputs) {
      const name = o.artifact?.name;
      // Carry `audience` onto the contract entry so the worker knows an artifact's intended reader
      // (and thus its on-disk format) at write time; absent when the output declares none.
      if (name && !seen.has(name)) { seen.add(name); artifacts.push({ id: o.id ?? name, name, ...(o.audience ? { audience: o.audience } : {}) }); }
    }
  }
  return artifacts;
}


// ─── inspect_session projections ────────────────────────────────────────────
//
// Pure, session-I/O-free projections of a loaded `SessionFile`, ported verbatim
// from the reference implementation `scripts/inspect_session.py` (the normative
// output contract). Each view returns a compact structured slice — never the raw
// session file, which accretes unbounded `history` and `deliveredContent`. Keeping
// these pure lets the parity test drive them directly against the reference script.

/** The views `inspect_session` can project. `summary` is the default composite. */
export const INSPECT_SESSION_VIEWS = [
  'summary', 'identity', 'variables', 'checkpoints', 'activities', 'history', 'children', 'usage',
] as const;
export type InspectSessionView = (typeof INSPECT_SESSION_VIEWS)[number];

/**
 * History event types surfaced as `milestones` — the six the reference script
 * lists: activity entry/exit, checkpoint reach/response, and child
 * triggered/completed. All other events contribute only to the `byType` tally.
 */
const HISTORY_MILESTONE_TYPES = new Set([
  'activity_entered', 'activity_exited',
  'checkpoint_reached', 'checkpoint_response',
  'workflow_triggered', 'workflow_completed',
]);

/** Identity projection: the stable header fields identifying the session. */
export function projectIdentity(
  s: SessionFile,
  pathPresentation?: PathPresentationMap,
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    workflowId: s.workflowId,
    workflowVersion: s.workflowVersion,
    sessionIndex: s.sessionIndex,
    agentId: s.agentId,
    status: s.status,
    currentActivity: s.currentActivity,
    currentTechnique: s.currentTechnique,
    startedAt: s.startedAt,
    seq: s.seq,
  };
  if (s.repo) out['repo'] = s.repo;
  const presented = presentPathToAgent(s.planningFolderPath, pathPresentation);
  if (presented) out['planningFolderPath'] = presented;
  return out;
}

/** Checkpoint projection: each response reduced to option, timestamp, and any variables it set. */
export function projectCheckpoints(s: SessionFile): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [cid, resp] of Object.entries(s.checkpointResponses ?? {})) {
    out[cid] = {
      optionId: resp.optionId,
      respondedAt: resp.respondedAt,
      variablesSet: resp.effects?.variablesSet ?? {},
    };
  }
  return out;
}

/** Activity projection: completed / skipped lists plus the current activity. */
export function projectActivities(s: SessionFile): Record<string, unknown> {
  return {
    completed: s.completedActivities ?? [],
    skipped: s.skippedActivities ?? [],
    current: s.currentActivity,
  };
}

/**
 * History projection: total event count, a per-type tally, and the milestone
 * sub-sequence (each milestone carries only its non-empty type/activity/checkpoint
 * keys, matching the reference script's dict comprehension). When `agentId` is
 * set, only events whose `data.agentId` matches are included (events without
 * agentId are excluded from a filtered view).
 */
export function projectHistory(s: SessionFile, agentId?: string): Record<string, unknown> {
  const all = s.history ?? [];
  const events = agentId === undefined
    ? all
    : all.filter(e => e.data?.['agentId'] === agentId);
  const byType: Record<string, number> = {};
  const milestones: Array<Record<string, unknown>> = [];
  for (const e of events) {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
    if (HISTORY_MILESTONE_TYPES.has(e.type)) {
      const m: Record<string, unknown> = { type: e.type };
      if (e.activity) m['activity'] = e.activity;
      if (e.checkpoint) m['checkpoint'] = e.checkpoint;
      milestones.push(m);
    }
  }
  return { count: events.length, byType, milestones };
}

/**
 * Children digest: one line per `triggeredWorkflows` entry of the addressed
 * session. Positional `index`, the child's own identity, and the running
 * status/activity/completed trace read from its embedded `state`.
 */
export function projectChildren(s: SessionFile): Array<Record<string, unknown>> {
  return (s.triggeredWorkflows ?? []).map((c, i) => {
    const st = c.state;
    return {
      index: i,
      sessionIndex: c.sessionIndex,
      workflowId: c.workflowId,
      status: st?.status,
      currentActivity: st?.currentActivity,
      completed: st?.completedActivities ?? [],
    };
  });
}

/** Numeric token keys summed into the usage-view aggregate when present on a row. */
export const USAGE_TOKEN_KEYS = [
  'input_tokens',
  'output_tokens',
  'total_tokens',
  'subagent_tokens',
] as const;

/**
 * Usage projection (#324 B1, #346 DI-33, #365 S3): one entry per `activity_usage`
 * event in record order (one per activity a dispatch covered), plus a plain-sum
 * token aggregate over those rows. Rows are DELTA figures for one activity, so a
 * dispatch carrying a run of activities appears as several rows sharing an
 * `agentId`; the aggregate is the
 * arithmetic sum of known numeric token keys across the projected rows. When
 * `agentId` is set, only rows whose `data.agentId` matches are included
 * (unattributed rows — no agentId — are excluded from a filtered view).
 */
export function projectUsage(
  s: SessionFile,
  agentId?: string,
): { rows: Array<Record<string, unknown>>; totals: Record<string, number> } {
  const events = (s.history ?? []).filter(e => e.type === 'activity_usage');
  const filtered = agentId === undefined
    ? events
    : events.filter(e => e.data?.['agentId'] === agentId);
  const rows = filtered.map(e => {
    const row: Record<string, unknown> = {
      activity: e.activity,
      timestamp: e.timestamp,
      usage: e.data?.['usage'],
    };
    if (typeof e.data?.['agentId'] === 'string') {
      row['agentId'] = e.data['agentId'];
    }
    return row;
  });
  const totals: Record<string, number> = {};
  for (const row of rows) {
    const usage = row['usage'];
    if (!usage || typeof usage !== 'object') continue;
    const u = usage as Record<string, unknown>;
    for (const key of USAGE_TOKEN_KEYS) {
      const v = u[key];
      if (typeof v === 'number' && Number.isFinite(v)) {
        totals[key] = (totals[key] ?? 0) + v;
      }
    }
  }
  return { rows, totals };
}

/** Summary (default) view: the composite of all projections for the addressed session. */
export function projectSummary(
  s: SessionFile,
  pathPresentation?: PathPresentationMap,
): Record<string, unknown> {
  return {
    identity: projectIdentity(s, pathPresentation),
    activities: projectActivities(s),
    variables: s.variables ?? {},
    checkpoints: projectCheckpoints(s),
    history: projectHistory(s),
    children: projectChildren(s),
  };
}

/**
 * Dispatch a view against the addressed session. For `variables`, an optional
 * `variable` narrows the bag to a single key's value (matching the reference
 * script's `--variable KEY`); otherwise the whole bag is returned. Optional
 * `agentId` narrows `history` and `usage` to rows/events for that agent context.
 */
export function projectSessionView(
  s: SessionFile,
  view: InspectSessionView,
  variable?: string,
  pathPresentation?: PathPresentationMap,
  agentId?: string,
): unknown {
  switch (view) {
    case 'identity': return projectIdentity(s, pathPresentation);
    case 'variables': {
      const bag = s.variables ?? {};
      return variable ? bag[variable] : bag;
    }
    case 'checkpoints': return projectCheckpoints(s);
    case 'activities': return projectActivities(s);
    case 'history': return projectHistory(s, agentId);
    case 'children': return projectChildren(s);
    case 'usage': return projectUsage(s, agentId);
    case 'summary':
    default:
      return projectSummary(s, pathPresentation);
  }
}


export function registerWorkflowTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;
  const sessionScope = buildSessionScope(config);
  const planningRootDir = sessionScope.engineeringDir;
  /** Agent-facing path: rewrite container paths via host mount map when set. */
  const presentPlanningPath = (serverPath: string | undefined): string | undefined =>
    presentPathToAgent(serverPath, config.pathPresentation);

  async function sessionLoadOpts() {
    const searchRoots = await listSessionSearchRoots(sessionScope);
    return {
      planningRelativeDir: sessionScope.planningRelativeDir,
      searchRoots,
    };
  }

  server.tool('discover', 'Entry point — call before other tools. Returns server info and the bootstrap procedure. No session_index required. Always pass repo on start_session.', {},
    withAuditLog('discover', async () => {
      const bootstrapResult = await readResourceRaw(config.workflowDir, 'meta', 'bootstrap-protocol');
      const lines = [
        `server: ${config.serverName}`,
        `version: ${config.serverVersion}`,
        'repo_binding: required — pass repo: "owner/repo" on start_session, derived from git via version-control::resolve-host-repo (the origin remote of the outermost superproject that claims the workspace checkout). The user or workspace AGENTS.md is a fallback only where that derivation yields nothing: a workspace that is not a git repo, or a host with no origin remote.',
      ];
      if (bootstrapResult.success) {
        lines.push('', bootstrapResult.value.content);
      }
      return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
    }));

  server.tool('list_workflows', 'List available workflows (id, title, version, tags). On load failures returns `{workflows, load_errors}`. No session_index required.', {},
    withAuditLog('list_workflows', async () => {
      const { workflows, errors } = await listWorkflowsWithDiagnostics(config.workflowDir);
      // Additive shape: the payload stays a plain array unless something failed to load.
      const payload = errors.length > 0 ? { workflows, load_errors: errors } : workflows;
      return { content: [{ type: 'text' as const, text: stringifyForResponse(payload) }] };
    }));

  server.tool('get_workflow', 'Orchestrator tool: load the session workflow. Response is the orchestrator technique bundle, then `---`, then metadata including `initialActivity` (use for the first next_activity) and activity stubs. Also returns canonical `planning_folder_path` — do not recompose it.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('get_workflow', withSessionStoreErrors(async ({ session_index }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const workflow_id = state.workflowId;

      const result = await loadWorkflowWithDiagnostics(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const { workflow: wf, activityLoadErrors } = result.value;

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, wf),
      );

      // Bundle the workflow's orchestrator-level technique refs (`techniques.workflow`) and the core
      // orchestrator techniques. Deduplicate by ref so a workflow that explicitly lists a core
      // technique resolves it once.
      const wfTechRefs = (wf as { techniques?: { workflow?: string[] } }).techniques?.workflow ?? [];
      const orchestratorTechniques = Array.from(new Set([...wfTechRefs, ...CORE_ORCHESTRATOR_TECHNIQUES]));
      const resolvedOrchestrator = await resolveTechniques(orchestratorTechniques, config.workflowDir, workflow_id);
      const opsText = stringifyForResponse(formatTechniqueBundle(resolvedOrchestrator));

      // Reference-not-repeat for the orchestrator ops bundle: under persistent mode, once this
      // agent has received it in full, collapse the rebuilt bundle to a content-keyed
      // `workflow_bundle:<hash>` marker. Decided before advanceSession so the new ledger key
      // commits in the same mutator; fresh/default sessions pay nothing.
      let opsBlock = opsText;
      const workflowBundleDeliveries: Record<string, string> = {};
      if (state.contextMode === 'persistent') {
        const opsHash = contentHash(opsText);
        const opsKey = `workflow_bundle:${opsHash}`;
        if (deliveredHash(state, opsKey) === opsHash) {
          opsBlock = stringifyForResponse({
            ...unchangedMarker(opsHash),
            note: 'Orchestrator ops bundle unchanged from an earlier delivery this session — reuse it from your context.',
          });
        } else {
          workflowBundleDeliveries[opsKey] = opsHash;
        }
      }

      // Advance state and commit any new workflow-bundle ledger entry in one mutator.
      const next = advanceSession(state, (draft) => {
        recordDeliveries(draft, state.agentId, workflowBundleDeliveries);
      });
      await saveSessionForTool(loaded, next);

      // Pre-separator preamble holds the resolved-operations bundle. Tests and clients split on
      // the first '\n\n---\n\n' to recover the workflow section, so we keep that single separator.
      const preambleParts = [opsBlock].filter(s => s.length > 0);
      const preamble = preambleParts.length > 0 ? preambleParts.join('\n\n') + '\n\n---\n\n' : '';

      // get_workflow returns lightweight metadata for the orchestrator: the technique bundle (above
      // the separator) plus rules, variables, initialActivity, and activity stubs. Per-activity step
      // detail and the worker-facing rules.activity / techniques.activity are delivered via get_activity.
      const summaryData = {
        id: wf.id,
        version: wf.version,
        title: wf.title,
        description: wf.description,
        rules: ((): string[] | undefined => {
          const r = wf.rules as { workflow?: string[]; universal?: string[] } | undefined;
          const orch = [...(r?.workflow ?? []), ...(r?.universal ?? [])];
          return orch.length ? orch : undefined;
        })(),
        variables: wf.variables,
        initialActivity: wf.initialActivity,
        activities: wf.activities?.map((a: { id: string; name?: string; required?: boolean; artifactPrefix?: string | undefined }) => ({ id: a.id, name: a.name, required: a.required, artifactPrefix: a.artifactPrefix })) ?? [],
        // Activity files that failed to load and are missing from `activities` — surfaced here
        // instead of silently skipped, so a broken definition is visible at workflow load rather
        // than as a later "Activity not found". Omitted when every activity loaded.
        activity_load_errors: activityLoadErrors.length > 0 ? activityLoadErrors : undefined,
        session_index,
        // Canonical absolute planning folder for this session. Under Docker the
        // server stores a container path; agent-facing responses rewrite it to
        // the host bind (`HOST_PROJECTS_ROOT`) so IDE tools can open the folder.
        // The orchestrator binds `planning_folder_path` from here and never
        // recomposes it relative to CWD or a target worktree.
        planning_folder_path: presentPlanningPath(loaded.folderAbsPath) ?? loaded.folderAbsPath,
      };

      return {
        content: [{ type: 'text' as const, text: preamble + stringifyForResponse(summaryData) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  server.tool('next_activity', 'Orchestrator tool: transition to `activity_id` (does not return the activity body — the worker calls `get_activity`). First call: `initialActivity` from get_workflow; later: an id from the current activity\'s transitions. Optional manifests enable advisory validation.',
    {
      ...sessionIndexParam,
      activity_id: z.string().describe('Target activity id. First call: initialActivity from get_workflow; later: from current activity transitions.'),
      transition_condition: z.string().optional().describe('Optional. Transition condition text from the previous activity (advisory validation).'),
      step_manifest: stepManifestSchema,
      activity_manifest: activityManifestSchema,
      variables_changed: variablesChangedSchema,
      artifacts_produced: artifactsProducedSchema,
      agent_id: z.string().min(1).optional().describe(
        'Optional. Worker context that completed the exiting activity — scopes technique-fetch fidelity and step_completed attribution.',
      ),
    },
    withAuditLog('next_activity', withSessionStoreErrors(async ({ session_index, activity_id, transition_condition, step_manifest, activity_manifest, variables_changed, artifacts_produced, agent_id }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;

      const workflow_id = state.workflowId;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      if (state.activeCheckpoint) {
        throw new Error(
          `Cannot transition to '${activity_id}': Active checkpoint '${state.activeCheckpoint.checkpointId}' ` +
          `on activity '${state.activeCheckpoint.activityId}'. The orchestrator must resolve it by calling respond_checkpoint.`
        );
      }
      const isTerminal = activity_id === TERMINAL_SENTINEL;
      const activity = getActivity(result.value, activity_id);
      if (!activity && !isTerminal) throw new Error(`Activity not found: ${activity_id}`);

      const view = sessionView(state);
      const manifestWarnings: (string | null)[] = [];
      if (step_manifest && state.currentActivity) {
        const mw = validateStepManifest(step_manifest as StepManifestEntry[], result.value, state.currentActivity);
        manifestWarnings.push(...mw);
        // Fidelity observability (#166 B8): advisory cross-check of the
        // manifest against the technique_fetched events get_technique
        // recorded into the session history during this activity.
        manifestWarnings.push(...validateTechniqueFetches(step_manifest as StepManifestEntry[], result.value, state.currentActivity, state.history, agent_id));
      } else if (!step_manifest && state.currentActivity) {
        manifestWarnings.push(`No step_manifest provided for previous activity '${state.currentActivity}'. Include a manifest to enable step completion validation.`);
      }

      const condWarning = (transition_condition !== undefined && state.currentActivity)
        ? validateTransitionCondition(view, result.value, activity_id, transition_condition)
        : null;

      const activityManifestWarnings: string[] = [];
      if (activity_manifest) {
        if (activity_manifest.length === 0) {
          activityManifestWarnings.push('Empty activity_manifest provided. Omit the parameter if no activities have been completed.');
        } else {
          const amw = validateActivityManifest(activity_manifest as ActivityManifestEntry[], result.value);
          activityManifestWarnings.push(...amw);
        }
      }

      // Declared variable types, for warn-only validation of the worker's
      // variables_changed map — same contract as checkpoint setVariable.
      const declaredTypes = new Map((result.value.variables ?? []).map(v => [v.name, v.type]));
      const variableWarnings: string[] = [];

      const next = advanceSession(state, (draft) => {
        const now = new Date().toISOString();
        // Exit-prior: any non-empty previous activity is recorded as
        // completed once we transition off it.
        const exitingActivity = draft.currentActivity;
        if (exitingActivity) {
          draft.history.push({ timestamp: now, type: 'activity_exited', activity: exitingActivity });
          if (!draft.completedActivities.includes(exitingActivity)) {
            draft.completedActivities.push(exitingActivity);
          }
        }
        // Persist the completing activity's worker outputs into the bag. These
        // are attributed to the activity being exited, not the one entered —
        // they are its results. Without this the bag holds only seeded defaults
        // plus checkpoint writes, so a fresh orchestrator resuming from
        // get_workflow_status would read state that never advanced.
        if (variables_changed) {
          variableWarnings.push(...applyVariableWrites(draft, variables_changed, declaredTypes, {
            timestamp: now,
            ...(exitingActivity !== undefined ? { activity: exitingActivity } : {}),
            source: 'variables_changed',
          }));
        }
        // Hybrid step_completed (RE-8): one event per step_manifest entry with non-empty output.
        if (step_manifest && exitingActivity) {
          for (const entry of step_manifest as StepManifestEntry[]) {
            if (!entry.output || entry.output.length === 0) continue;
            draft.history.push({
              timestamp: now,
              type: 'step_completed',
              activity: exitingActivity,
              data: {
                stepId: entry.step_id,
                ...(agent_id !== undefined ? { agentId: agent_id } : {}),
              },
            });
          }
        }
        // Accumulate declared artifacts by id (S2).
        if (artifacts_produced && artifacts_produced.length > 0) {
          const byId = new Map((draft.declaredArtifacts ?? []).map(a => [a.id, a]));
          for (const a of artifacts_produced) {
            const prev = byId.get(a.id);
            byId.set(a.id, {
              id: a.id,
              name: a.name,
              ...(a.path !== undefined
                ? { path: a.path }
                : (prev?.path !== undefined ? { path: prev.path } : {})),
            });
          }
          draft.declaredArtifacts = [...byId.values()];
        }
        draft.currentActivity = activity_id;
        draft.condition = transition_condition ?? '';
        delete draft.activeCheckpoint;
        draft.history.push({ timestamp: now, type: 'activity_entered', activity: activity_id });
        // Terminal-state transition emits a workflow_completed event and flips
        // status. The activity id 'complete' is the canonical terminal marker
        // across the work-package, prism, and meta workflows; the TERMINAL_SENTINEL
        // is the contentless terminal reached via an explicit terminal transition.
        if (activity_id === 'complete' || isTerminal) {
          draft.history.push({ timestamp: now, type: 'workflow_completed' });
          draft.status = 'completed';
        }
      });
      await saveSessionForTool(loaded, next);

      if (variableWarnings.length > 0) {
        logWarn('next_activity: variables_changed type mismatch', { session_index, warnings: variableWarnings });
      }

      // S2: planning-folder vs accumulated declared artifact ids (warn-only).
      const artifactWarnings: string[] = [];
      const planningFolder = next.planningFolderPath ?? loaded.folderAbsPath;
      if (planningFolder) {
        const declared = next.declaredArtifacts ?? [];
        const declaredIds = new Set(declared.map(a => a.id));
        // Outside-folder declared paths → unknown (not missing).
        for (const a of declared) {
          if (!a.path) continue;
          const abs = a.path.startsWith('/') ? a.path : pathJoin(planningFolder, a.path);
          if (!abs.startsWith(planningFolder + '/') && abs !== planningFolder) {
            artifactWarnings.push(
              `Declared artifact id '${a.id}' (name '${a.name}') writes outside the planning folder — status unknown (not missing).`,
            );
          }
        }
        try {
          const entries = await readdir(planningFolder, { withFileTypes: true });
          const files = entries.filter(e => e.isFile() && e.name !== 'session.json' && e.name !== 'session.json.seal' && e.name !== 'README.md' && !e.name.startsWith('.')).map(e => e.name);
          // Join on id: basename stem, declared name/id, or id embedded after a numeric/date prefix.
          const coveredNames = new Set<string>();
          for (const a of declared) {
            for (const key of [a.name, a.id, `${a.id}.md`, a.name.endsWith('.md') ? a.name : `${a.name}.md`]) {
              coveredNames.add(key);
            }
          }
          const undeclared = files.filter(f => {
            const stem = f.replace(/\.md$/, '');
            if (coveredNames.has(f) || coveredNames.has(stem) || declaredIds.has(stem)) return false;
            for (const id of declaredIds) {
              if (f.includes(id)) return false;
            }
            return true;
          });
          if (undeclared.length > 0) {
            artifactWarnings.push(
              `Undeclared planning-folder file(s) (no matching declared artifact id): [${undeclared.join(', ')}]. ` +
              `Report them via next_activity artifacts_produced [{id, name}] or remove them — advisory only; transition succeeds.`,
            );
          }
        } catch {
          // Folder unreadable — skip folder diff; accumulation still stands.
        }
      }

      const validation = buildValidation(
        validateActivityTransition(view, result.value, activity_id),
        validateWorkflowVersion(view, result.value),
        condWarning,
        ...manifestWarnings,
        ...activityManifestWarnings,
        ...variableWarnings,
        ...artifactWarnings,
      );

      // If this child just reached its terminal activity, notify the parent
      // (if any) so the parent's `triggeredWorkflows[i].status` flips from
      // `running` to `completed`. Persistent-parent only — transient parents
      // were already discarded when the child captured them. Best-effort.
      if ((activity_id === 'complete' || isTerminal) && state.parentSession?.sessionIndex) {
        const parentIdx = state.parentSession.sessionIndex;
        try {
          const loadOpts = await sessionLoadOpts();
          const parentLoaded = await loadSessionForTool(planningRootDir, parentIdx, loadOpts);
          const completedAt = new Date().toISOString();
          const parentNext = advanceSession(parentLoaded.state, (draft) => {
            const ref = draft.triggeredWorkflows.find((t) => t.sessionIndex === state.sessionIndex);
            if (ref && ref.status === 'running') {
              ref.status = 'completed';
              ref.completedAt = completedAt;
              draft.history.push({
                timestamp: completedAt,
                type: 'workflow_returned',
                data: { sessionIndex: state.sessionIndex, workflowId: state.workflowId },
              });
            }
          });
          await saveSessionForTool(parentLoaded, parentNext);
        } catch {
          // Parent may have been a transient and discarded long ago, or its
          // folder may have moved. Don't fail the child's completion.
        }
      }

      const meta: Record<string, unknown> = { session_index, validation };

      if (config.traceStore) {
        const segment = config.traceStore.getSegmentAndAdvanceCursor(state.sessionIndex);
        if (segment.events.length > 0) {
          const firstEvent = segment.events[0];
          const lastEvent = segment.events[segment.events.length - 1];
          const payload: TraceTokenPayload = {
            sid: state.sessionIndex,
            act: activity_id,
            from: segment.fromIndex,
            to: segment.toIndex,
            n: segment.events.length,
            t0: firstEvent ? firstEvent.ts : 0,
            t1: lastEvent ? lastEvent.ts : 0,
            ts: Math.floor(Date.now() / 1000),
            events: segment.events,
          };
          meta['trace_token'] = await createTraceToken(payload);
        }
      }

      const responseData: Record<string, unknown> = {
        activity_id,
        name: activity ? activity.name : 'Workflow Complete',
        session_index,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseData, null, 2) }],
        _meta: meta,
      };
    }), traceOpts));

  server.tool('get_activity', 'Worker tool: load the current activity definition (from session state — no activity_id). `context_tokens` is REQUIRED for eager step-technique bundling, and bounds the whole eager bundle (step technique bodies plus any bundled resource bodies). ' +
    'Under persistent/`bundle: "reference"`, already-delivered content may collapse to unchanged markers — ONLY valid when THIS agent received the earlier payloads; technique-linked resource BODIES also arrive under a sibling `resources` map. ' +
    'Under full delivery, that map is not sent: the linked ids arrive under `resource_refs` and you fetch the ones you need with get_resource. `resources_note` states which shape this response used. ' +
    'Use `bundle: "full"` after summarization; a FRESH worker must not pass `bundle: "reference"` (it holds no prior delivery), but a RESUMED worker that passes its dispatch `agent_id` may. ' +
    'A dispatch carrying a run of activities walks them under ONE `agent_id`: `_meta.batch` reports how many that context has taken, what it has been delivered, and `may_continue` — false means report the next activity as needing its own dispatch and stop. ' +
    'Asking past the bound is refused with the payload undelivered.',
    {
      ...sessionIndexParam,
      ...contextTokensParam,
      ...agentIdParam,
      bundle: z.enum(['reference', 'full']).optional().describe('Optional. "reference" collapses content already delivered to THIS agent_id scope. "full" forces full delivery. Defaults from context_mode.'),
    },
    withAuditLog('get_activity', withSessionStoreErrors(async ({ session_index, context_tokens, agent_id, bundle }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);

      const activity_id = state.currentActivity;
      if (!activity_id) {
        throw new Error('No current activity in session state. Call next_activity first.');
      }

      // The batch bound (#407), applied where content is handed over rather than in rule text.
      //
      // Placed on the freshly loaded state, ahead of every composition await, for two reasons: a
      // refusal costs nothing because no payload is assembled, and the refusal event is written with
      // no await between the load and the save, so it cannot revert a concurrent write the way a save
      // against a pre-composition snapshot would.
      const scope = deliveryScope(state, agent_id);
      const bound = batchBound(context_tokens, {
        headroomFraction: config.batchHeadroomFraction ?? DEFAULT_BATCH_HEADROOM_FRACTION,
        maxActivities: config.batchMaxActivities ?? DEFAULT_BATCH_MAX_ACTIVITIES,
        charsPerToken: config.bundleCharsPerToken ?? DEFAULT_BUNDLE_CHARS_PER_TOKEN,
      });
      const refusal = batchRefusal(state, scope, activity_id, bound);
      if (refusal) {
        // Recorded before the throw, so the limit each run ran into is countable from the session
        // even though the call carries no payload away with it.
        const refused = advanceSession(state, (draft) => {
          recordBatchRefusal(draft, { scope, activityId: activity_id, refusal });
        });
        await saveSessionForTool(loaded, refused);
        throw new Error(batchRefusalMessage(activity_id, scope, refusal));
      }

      const workflow_id = state.workflowId;
      const rawResult = await readActivityRaw(config.workflowDir, workflow_id, activity_id);
      if (!rawResult.success) throw new Error(`Activity not found: ${activity_id}`);
      const { content: rawActivity, sourceWorkflowId } = rawResult.value;
      let activityBody = injectResolvedStepIds(rawActivity);

      // Materialize checkpoint fragment refs in the delivered YAML (#166 B10): the worker reads
      // full checkpoint bodies, never a reference. Bare refs resolve against the activity file's
      // SOURCE workflow (which differs from workflow_id for a borrowed activity). The textual
      // pre-scan keeps ref-free activities (the common case) off the resolution path entirely.
      const fragmentRefs = scanCheckpointRefLines(rawActivity);
      if (fragmentRefs.length > 0) {
        const fragmentsLookup = await buildFragmentsLookup(config.workflowDir, [sourceWorkflowId], fragmentRefs);
        activityBody = injectCheckpointFragmentBodies(activityBody, (ref) =>
          resolveCheckpointFragment(fragmentsLookup, sourceWorkflowId, ref));
      }

      const view = sessionView(state);
      const diagResult = await loadWorkflowWithDiagnostics(config.workflowDir, workflow_id);
      const result = diagResult.success
        ? { success: true as const, value: diagResult.value.workflow }
        : diagResult;
      const activitySourceWorkflow = diagResult.success
        ? diagResult.value.activitySourceWorkflow
        : new Map<string, string>();

      // Reference-not-repeat delivery: active via per-call opt-in or the session's declared
      // context mode. Full delivery stays the default — a freshly spawned worker lands in an
      // empty context and the repeated bundle is load-bearing. The ledger this reads and writes
      // is scoped to the calling AGENT CONTEXT (#353 §1.1), so a resumed worker that passes its
      // dispatch `agent_id` collapses only what THAT context already received.
      const referenceMode = (bundle ?? (state.contextMode === 'persistent' ? 'reference' : 'full')) === 'reference';
      // Hashes of content delivered in full by THIS call, recorded to the session's delivery
      // ledger. Recorded in every mode so a later per-call reference opt-in can refer back to
      // content that was delivered under the default full mode.
      const newDeliveries: Record<string, string> = {};

      // Bundle the techniques the activity references (delivered as full protocols), deduped with
      // the workflow-level techniques inherited by every activity (`techniques.activity`, injected
      // here so a common technique is declared once on the workflow) and the core worker techniques.
      const activity = result.success ? getActivity(result.value, activity_id) : undefined;
      const ownTechRefs = (activity as { techniques?: string[] } | undefined)?.techniques ?? [];
      const inheritedTechRefs = result.success ? ((result.value as { techniques?: { activity?: string[] } }).techniques?.activity ?? []) : [];
      const workerTechniques = Array.from(new Set([...inheritedTechRefs, ...ownTechRefs, ...CORE_WORKER_TECHNIQUES]));
      const resolvedWorker = await resolveTechniques(workerTechniques, config.workflowDir, workflow_id);
      const bundleData = formatTechniqueBundle(resolvedWorker);

      // Per-technique dedup: each composed technique in the bundle is hashed individually, so an
      // activity that introduces one new technique still receives that one in full while the
      // inherited rest collapse to markers.
      const bundleTechniques = bundleData['techniques'] as Record<string, unknown> | undefined;
      if (bundleTechniques) {
        for (const [key, body] of Object.entries(bundleTechniques)) {
          const hash = contentHash(stringifyForResponse(body));
          const ledgerKey = `bundle:${key}`;
          if (referenceMode && deliveredHash(state, ledgerKey, scope) === hash) {
            bundleTechniques[key] = unchangedMarker(hash);
          } else {
            newDeliveries[ledgerKey] = hash;
          }
        }
      }
      // The rules bundle varies with the activity's own techniques, and activities alternate
      // between rule sets across a walk — so rules entries are keyed by CONTENT (set semantics,
      // `bundle:rules:<hash>`): any rule set this session+agent has ever received collapses,
      // not just the most recently delivered one.
      if (bundleData['rules'] !== undefined) {
        const rulesHash = contentHash(stringifyForResponse(bundleData['rules']));
        const rulesKey = `bundle:rules:${rulesHash}`;
        if (referenceMode && deliveredHash(state, rulesKey, scope) === rulesHash) {
          bundleData['rules'] = unchangedMarker(rulesHash);
        } else {
          newDeliveries[rulesKey] = rulesHash;
        }
      }

      // Automatic, per-agent context-derived step-technique bundling (#189 C1c): every activity
      // eagerly inlines its small, ungated step-bound techniques — no per-activity opt-in. The
      // eager-delivery budget is a CUMULATIVE per-activity character budget derived from the
      // worker's declared `context_tokens` (availability headroom × a token→char factor, both
      // server config): ungated technique steps are inlined in DOCUMENT ORDER until adding the
      // next would overflow the budget; the remainder stay lazy via get_technique. A step gated
      // by `when`/`condition` (on itself or an enclosing loop) may never execute and stays lazy
      // regardless of size. A per-activity `bundleTechniques.maxChars` is retained as an explicit
      // per-technique size cap layered on top (skip any single technique larger than it);
      // `maxChars: 0` opts the activity out of eager bundling entirely. Each entry is the step's
      // full get_technique composition (activity-group resolution, ancestor contract, provenance
      // decoration) rendered as a discrete ▼ STEP block, so bundled and lazy delivery are
      // identical by construction. Bundled entries share the `technique:<resolvedId>` delivery-
      // ledger key with get_technique, so persistent-context refetches of bundled content collapse
      // to unchanged-references in either direction.
      const bundledStepTechniques: Record<string, unknown> = {};
      // `chars` is the FULL composed size on both paths and `delivery` says which path ran, so the
      // technique_bundled / resource_fetched events below report delivered and saved characters
      // (#353 §1.3).
      const bundledSteps: Array<{ stepId: string; techniqueId: string; chars: number; delivery: 'full' | 'unchanged' }> = [];
      const bundledResourceDeliveries: Array<{ resourceId: string; chars: number; delivery: 'full' | 'unchanged' }> = [];
      /** Linked resource ids this response does NOT deliver a body for — the worker fetches these. */
      const resourceRefIds: string[] = [];
      const linkedResourceIds = new Set<string>();
      const bundlingWarnings: string[] = [];
      const bundleConfig = (activity as Activity | undefined)?.bundleTechniques;
      // maxChars: 0 is the explicit opt-out sentinel; any other declared value is a per-technique
      // size cap. Absent config means no per-technique cap (only the cumulative budget applies).
      const optedOut = bundleConfig?.maxChars === 0;
      const perTechniqueCap = bundleConfig && bundleConfig.maxChars > 0 ? bundleConfig.maxChars : Infinity;
      // Cumulative eager-delivery budget in characters, derived from the caller's own window.
      // Headroom fraction and chars-per-token are server config with in-code fallbacks.
      const headroomFraction = config.bundleHeadroomFraction ?? DEFAULT_BUNDLE_HEADROOM_FRACTION;
      const charsPerToken = config.bundleCharsPerToken ?? DEFAULT_BUNDLE_CHARS_PER_TOKEN;
      const eagerBudgetChars = context_tokens * headroomFraction * charsPerToken;
      if (!optedOut && result.success && activity) {
        const eligible: Array<Step & { kind: 'technique' }> = [];
        const collectUngated = (steps: Step[] | undefined): void => {
          for (const s of steps ?? []) {
            if (s.when !== undefined || s.condition !== undefined) continue;
            if (s.kind === 'loop') { collectUngated(s.steps as Step[]); continue; }
            if (s.kind === 'technique' && s.id) eligible.push(s);
          }
        };
        collectUngated((activity as Activity).steps);

        // Running total of full-content characters already committed to the eager bundle. An
        // unchanged-reference marker costs effectively nothing, so it never draws down the budget;
        // only full-content entries do.
        let spentChars = 0;
        for (const step of eligible) {
          const ref = techniqueName(step.technique);
          if (!ref) continue;
          // Borrowed activities resolve their step techniques against the source workflow the
          // activity file was authored in (mirroring #166 B10 fragment scoping).
          const composedStep = await composeActivityTechnique(ref, config.workflowDir, sourceWorkflowId, activity_id);
          // An unresolvable ref is the binding guard's business; delivery skips it (the step's
          // own get_technique fetch will surface the error to the worker).
          if (!composedStep.success) continue;
          const { techniqueId } = composedStep.value;
          let technique = composedStep.value.technique;
          let provenanceWarnings: string[] = [];
          const ctx = await buildProvenanceContext({
            workflow: result.value,
            workflowDir: config.workflowDir,
            currentActivityId: activity_id,
            currentStepId: step.id!,
            activitySourceWorkflow,
          });
          if (ctx) {
            const binding = typeof step.technique === 'object' ? step.technique : undefined;
            const decorated = decorateTechniqueProvenance(technique, ctx, binding, techniqueId, step.id!);
            technique = decorated.technique;
            provenanceWarnings = decorated.warnings;
          }
          // Budget accounting measures the TECHNIQUE BODY only (including its resource link refs,
          // but NOT the resolved content of those resources). Resource bodies are eager-bundled
          // separately as a sibling `resources` map (deduped across steps) after the technique loop.
          const text = projectTechniqueToYaml(technique);
          // Per-technique size cap: an oversized single technique is skipped outright.
          if (text.length > perTechniqueCap) continue;
          const ledgerKey = `technique:${techniqueId}`;
          const hash = contentHash(text);
          const alreadyDelivered = referenceMode && (deliveredHash(state, ledgerKey, scope) === hash || newDeliveries[ledgerKey] === hash);
          // ▼ STEP arrival marker: each entry is a discrete, self-describing unit that substitutes
          // for the intentional get_technique { step_id } call inlining removes (#189 C1c(C)1).
          const stepMarker = `▼ STEP ${step.id!} · technique ${techniqueId}`;
          if (alreadyDelivered) {
            // A reference marker is near-zero cost — it does not draw down the eager budget.
            bundledStepTechniques[step.id!] = { marker: stepMarker, ...unchangedMarker(hash) };
          } else {
            // Full content draws down the cumulative budget. Inline ungated step techniques in
            // document order and STOP at the first one that would overflow the remaining budget
            // (stop-and-break) — the remainder stay lazy. This preserves the contiguous
            // document-order prefix the spec and docs promise, rather than skipping a large
            // technique to squeeze in a later smaller one.
            if (spentChars + text.length > eagerBudgetChars) break;
            spentChars += text.length;
            newDeliveries[ledgerKey] = hash;
            // The arrival marker leads the block; the composed technique fields follow at the same
            // level, so a bundled entry reads exactly like a get_technique fetch with a step header.
            // Under reference mode, collapse any shared contract/rules block already delivered (by a
            // sibling bundled step or an earlier fetch) to a marker while the core stays full.
            const projected = referenceMode
              ? dedupTechniqueBlocks(projectTechnique(technique), state, newDeliveries, scope)
              : projectTechnique(technique);
            bundledStepTechniques[step.id!] = { marker: stepMarker, ...projected };
          }
          // Collect linked resource ids from the full composed technique text even when this
          // delivery collapses to an unchanged-marker (markers omit link text). Only for steps
          // actually included in the bundle (after the budget break above).
          for (const rawId of extractResourceIds(text)) {
            linkedResourceIds.add(qualifyResourceId(rawId, sourceWorkflowId, workflow_id));
          }
          bundledSteps.push({
            stepId: step.id!, techniqueId,
            chars: text.length, delivery: alreadyDelivered ? 'unchanged' : 'full',
          });
          bundlingWarnings.push(...provenanceWarnings);
        }

        if (bundledSteps.length > 0) {
          // Eager resource delivery for the bundled steps. Two shapes, selected by delivery mode
          // (#323 T1) — the resource CONTRACT is stated once, in `resources_note`, so this note
          // only points at it:
          //   reference — bodies under a sibling `resources` map, deduped across steps and sharing
          //               get_resource's `resource:<id>` ledger, so a repeat delivery collapses;
          //   full      — ids only, under `resource_refs`. In a fresh worker context there is no
          //               repeat delivery for the map to collapse against, so every linked body
          //               ships in full in every activity that links it — measured at +24.5% on
          //               get_activity (#322). The ids are enough for the worker to fetch what it
          //               actually reads via get_resource.
          const bundledResources: Record<string, unknown> = {};
          const linkedIds = [...linkedResourceIds];
          if (referenceMode) {
            const maxResourceChars = DEFAULT_MAX_EAGER_RESOURCE_CHARS;
            // A whole-resource body already carries every section of itself, and the two ids
            // ledger separately, so a resource a technique cites both ways would deliver its
            // file AND its own sections. The file governs where it lands: bare ids run first,
            // and a section is skipped once its own file is in the bundle. Skipping it costs
            // the worker nothing — the body it would have shipped is already there, and
            // get_resource still serves the anchor alone. Order matters because an oversized
            // or budget-displaced file never lands, and its sections must still ship.
            const orderedIds = [...linkedIds]
              .sort((a, b) => Number(a.includes('#')) - Number(b.includes('#')));
            const deliveredWhole = new Set<string>();
            const coveredByItsFile = (rid: string) => {
              const anchorAt = rid.indexOf('#');
              return anchorAt > 0 && deliveredWhole.has(rid.slice(0, anchorAt));
            };
            for (let i = 0; i < orderedIds.length; i += 1) {
              const resourceId = orderedIds[i]!;
              if (coveredByItsFile(resourceId)) continue;
              const loaded = await loadResourceDelivery(
                config.workflowDir, workflow_id, resourceId, session_index,
              );
              if (!loaded.success) {
                // Warn and continue — unresolvable refs must not abort get_activity (SC-13).
                bundlingWarnings.push(
                  `Unresolvable resource ref '${resourceId}' linked from bundled step techniques: ${loaded.error.message}`,
                );
                continue;
              }
              const { hash, content, id, version } = loaded.value;
              const ledgerKey = `resource:${resourceId}`;
              if (deliveredHash(state, ledgerKey, scope) === hash || newDeliveries[ledgerKey] === hash) {
                // A reference marker is near-zero cost — like a collapsed technique it does not
                // draw down the eager budget, so it never displaces a body that still needs sending.
                bundledResources[resourceId] = {
                  resource_id: resourceId,
                  ...unchangedMarker(hash),
                };
                bundledResourceDeliveries.push({ resourceId, chars: content.length, delivery: 'unchanged' });
                // The marker means this context already holds the body, sections included.
                if (!resourceId.includes('#')) deliveredWhole.add(resourceId);
                continue;
              }
              // Secondary guard, retained from R2: a single oversized body never eager-bundles,
              // budget or not. Skipping one does not stop the loop — a later small resource still
              // bundles — but the id joins the ref list so nothing becomes unreachable.
              if (content.length > maxResourceChars) {
                resourceRefIds.push(resourceId);
                continue;
              }
              // #323 T2: resource bodies draw down the SAME cumulative `spentChars` counter as
              // techniques, so `context_tokens` actually bounds the eager bundle. Stop at the
              // first body that would overflow (mirroring the technique loop's stop-and-break);
              // it and every id after it stay fetchable via get_resource.
              if (spentChars + content.length > eagerBudgetChars) {
                resourceRefIds.push(...orderedIds.slice(i).filter((rid) => !coveredByItsFile(rid)));
                break;
              }
              spentChars += content.length;
              newDeliveries[ledgerKey] = hash;
              bundledResources[resourceId] = {
                resource_id: resourceId,
                ...(id ? { id } : {}),
                ...(version ? { version } : {}),
                content,
              };
              bundledResourceDeliveries.push({ resourceId, chars: content.length, delivery: 'full' });
              if (!resourceId.includes('#')) deliveredWhole.add(resourceId);
            }
          } else {
            // Full mode: ids only under resource_refs; still resolve each id so unresolvable
            // refs surface as validation warnings (SC-13) without failing the call.
            resourceRefIds.push(...linkedIds);
          }
          // Full-mode unresolvable resource check (SC-13): reference mode already warns
          // inside the load loop; full mode only pushes ids, so resolve here.
          if (!referenceMode) {
            for (const resourceId of linkedIds) {
              const loaded = await loadResourceDelivery(
                config.workflowDir, workflow_id, resourceId, session_index,
              );
              if (!loaded.success) {
                bundlingWarnings.push(
                  `Unresolvable resource ref '${resourceId}' linked from bundled step techniques: ${loaded.error.message}`,
                );
              }
            }
          }

          bundleData['step_techniques'] = bundledStepTechniques;
          bundleData['step_techniques_note'] =
            'Each step_techniques entry is a discrete ▼ STEP block whose composed technique is identical to a get_technique { step_id } fetch. Engage the inlined steps strictly in step order: on reaching each step, EMIT a one-line "▶ step <step_id>" begin-beat before executing it — that deliberate beat is the intentional act inlining moves off the get_technique call, and it is the stepwise observability trace for bundled steps (do NOT ping the server per bundled step; delivery-time technique_bundled events already record coverage). Resource bodies are NEVER nested inside a step_techniques entry — `resources_note` states how this response delivers the technique-linked resources. Technique steps absent from this map (gated, or past the derived eager-delivery budget / a per-activity size cap) still require get_technique { step_id } before execution.';
          if (bundledResourceDeliveries.length > 0) bundleData['resources'] = bundledResources;
          if (resourceRefIds.length > 0) bundleData['resource_refs'] = resourceRefIds;
          if (linkedIds.length > 0) {
            bundleData['resources_note'] = bundledResourceDeliveries.length > 0
              ? 'Bodies for technique-linked resources from eagerly bundled steps under `resources`, keyed by exact resource_id (including #section). Deduped across steps. Same delivery ledger as get_resource (resource:<id>). Reuse content or unchanged markers. Ids under `resource_refs` were NOT bundled (oversized, or past the eager-delivery budget) — call get_resource for those, or with full: true after summarization.'
              : 'Ids of the technique-linked resources for the eagerly bundled steps, under `resource_refs` (exact resource_id, including #section). No bodies are bundled in this mode — call get_resource for the ids you actually need to read.';
          }
        }
      }

      const validation = buildValidation(
        result.success ? validateWorkflowVersion(view, result.value) : null,
        ...bundlingWarnings,
      );

      const opsData = referenceMode
        ? {
            bundle_mode: 'reference',
            bundle_note: 'Entries marked { delivery: "unchanged", content_hash } are already in your context — reuse them. A marker may also replace a single inherited_inputs/inherited_outputs/rules block inside an otherwise-full step_techniques entry (that shared block came from a sibling technique). Re-fetch a technique with get_technique { step_id, full: true }, or get_activity { bundle: "full" } to re-deliver the whole bundle.',
            ...bundleData,
          }
        : bundleData;
      const opsSection = stringifyForResponse(opsData) + '\n\n---\n\n';

      // artifactPrefix is server-computed from the activity filename and is NOT in
      // the raw activity definition, so surface it in the header (and _meta) — the worker
      // needs it to name artifacts as {artifactPrefix}-{bare_filename}.
      const artifactPrefix = (activity as { artifactPrefix?: string } | undefined)?.artifactPrefix;
      const header = artifactPrefix
        ? `session_index: ${session_index}\nartifact_prefix: ${artifactPrefix}`
        : `session_index: ${session_index}`;

      // The activity's artifact contract is SYNTHESIZED from the `## Outputs` of the techniques its
      // steps bind (activities no longer declare `artifacts[]` — the technique outputs own artifact
      // identity, AP-43/65). Append the composed block to the activity body so the worker reads an
      // explicit contract that can never drift from the steps.
      const composedArtifacts = await composeActivityArtifacts(
        activity as Parameters<typeof composeActivityArtifacts>[0], config.workflowDir, workflow_id, activity_id,
      );
      const activityBodyWithArtifacts = composedArtifacts.length
        ? `${activityBody}\n${stringifyForResponse({ artifacts: composedArtifacts })}`
        : activityBody;

      // Payload-borne enforcement hints (#189 C7, R7): the enforcement model (schemas/README) lives
      // in docs that never ride the wire, so a payload-only reader still infers the SERVER executes
      // inert fields (guessing it applies `action: set`, unsure who owns auto-advance). Annotate, at
      // delivery time, only the constructs this activity actually contains — an activity without
      // them adds nothing. Delivery-side only; no schema change.
      const enforcementNotes: Record<string, string> = {};
      if (activity) {
        const flatSteps = flattenActivitySteps(activity);
        if (flatSteps.some((s) => (s.kind === 'technique' || s.kind === 'action') && (s.actions?.length ?? 0) > 0)) {
          enforcementNotes['actions'] =
            'Action verbs (a kind:action step, or an `actions:` list on a step) are AGENT-executed: you carry them out. The server records the step but applies no action verb and sets no session variable from one.';
        }
        if (flatSteps.some((s) => s.kind === 'checkpoint' && s.autoAdvanceMs !== undefined)) {
          enforcementNotes['auto_advance'] =
            "A checkpoint's auto-advance is SERVER-timed: the server enforces the full autoAdvanceMs timer when you call respond_checkpoint { auto_advance: true }, then applies its defaultOption. `blocking` is an advisory orchestrator directive (agent-honored), not a server gate.";
        }
      }
      const enforcementBlock = Object.keys(enforcementNotes).length
        ? `${stringifyForResponse({ enforcement_notes: enforcementNotes })}\n\n`
        : '';

      // Worker-facing rules inherited by EVERY activity, injected into every get_activity so a
      // worker dispatched for a single activity always receives them: the workflow's `rules.activity`
      // plus the dual-audience `rules.universal`. (`rules.workflow` are orchestrator-only.)
      const wfRules = result.success ? (result.value as { rules?: { activity?: string[]; universal?: string[] } }).rules : undefined;
      const inheritedRules = [...(wfRules?.activity ?? []), ...(wfRules?.universal ?? [])];
      let activityRulesBlock = '';
      if (inheritedRules.length) {
        const inheritedRulesHash = contentHash(stringifyForResponse(inheritedRules));
        const inheritedRulesKey = `activity_rules:${inheritedRulesHash}`;
        if (referenceMode && deliveredHash(state, inheritedRulesKey, scope) === inheritedRulesHash) {
          activityRulesBlock = `${stringifyForResponse({ activity_rules: unchangedMarker(inheritedRulesHash) })}\n\n`;
        } else {
          newDeliveries[inheritedRulesKey] = inheritedRulesHash;
          activityRulesBlock = `${stringifyForResponse({ activity_rules: inheritedRules })}\n\n`;
        }
      }

      // Assembled before the save so the dispatch event can record what this dispatch actually
      // cost — `chars` on an activity's fresh and resume events is the before/after measurement.
      const responseText = `${opsSection}${header}\n\n${activityRulesBlock}${enforcementBlock}${activityBodyWithArtifacts}`;

      // Persist against a FRESH load, not the snapshot captured before composition: the session
      // store is last-writer-wins over the whole file, and composition awaits dozens of FS reads —
      // saving the pre-composition snapshot would silently revert any concurrent write (sibling
      // worker save, orchestrator checkpoint resolution) that landed in that window.
      const reloadOpts = await sessionLoadOpts();
      const reloaded = await loadSessionForTool(planningRootDir, session_index, reloadOpts);
      // Dispatch accounting (#353 §1.3): get_activity is the call a dispatched worker makes to
      // receive its payload, so it is where a dispatch announces itself. Derived from the reloaded
      // history, which is what the save writes against.
      const dispatch = dispatchKind(reloaded.state, scope);
      // Delivery-identity accounting (#408): the activity is on its way to a context that has not
      // received it, so a scope that already took it is a second copy of the same payload in one
      // session — a replaced worker, or a resume that arrived under a fresh identity.
      const priorScope = hasDispatch(reloaded.state, scope, activity_id)
        ? undefined
        : priorDeliveryScope(reloaded.state, scope, activity_id);
      const next = advanceSession(reloaded.state, (draft) => {
        recordDeliveries(draft, scope, newDeliveries);
        recordDispatch(draft, { scope, kind: dispatch, activityId: activity_id, chars: responseText.length });
        if (priorScope !== undefined) {
          recordRedelivery(draft, { scope, priorScope, activityId: activity_id, chars: responseText.length });
        }
        // Fidelity observability for bundled deliveries (#166 B11): one technique_bundled
        // event per bundled step, on both delivery paths (full and unchanged-marker) — the
        // bundle counterpart of get_technique's technique_fetched. next_activity's manifest
        // validation accepts either event as coverage.
        const bundledAt = new Date().toISOString();
        for (const b of bundledSteps) {
          draft.history.push({
            timestamp: bundledAt,
            type: 'technique_bundled',
            activity: activity_id,
            data: { techniqueId: b.techniqueId, stepId: b.stepId, agentId: scope, chars: b.chars, delivery: b.delivery },
          });
          appendStepStartedIfAbsent(draft, {
            activity: activity_id, stepId: b.stepId, agentId: scope, timestamp: bundledAt,
          });
        }
        // Eager resource deliveries share get_resource's resource_fetched observability channel.
        for (const r of bundledResourceDeliveries) {
          draft.history.push({
            timestamp: bundledAt,
            type: 'resource_fetched',
            activity: activity_id,
            data: { resourceId: r.resourceId, agentId: scope, bundled: true, chars: r.chars, delivery: r.delivery },
          });
        }
      });
      await saveSessionForTool(reloaded, next);

      // Where this context stands against its bound, this delivery included. A worker reads
      // `may_continue` to decide whether to ask for the next activity, so the ordinary end of a batch
      // is the worker stopping and the refusal above is the backstop. `remaining_chars` is the
      // headroom the activity's own lazy fetches eat into after this answer was given.
      const batchTaken = batchActivities(next, scope);
      const batchChars = deliveredChars(next, scope);
      const unbounded = scope === next.agentId;
      const batch = {
        activities: batchTaken.length,
        max_activities: bound.maxActivities,
        delivered_chars: batchChars,
        budget_chars: bound.budgetChars,
        remaining_chars: unbounded ? null : Math.max(0, bound.budgetChars - batchChars),
        may_continue: batchMayContinue(next, scope, bound),
      };

      return {
        content: [{ type: 'text' as const, text: responseText }],
        _meta: {
          session_index, validation, artifact_prefix: artifactPrefix, artifacts: composedArtifacts, activity_rules: inheritedRules,
          dispatch, batch,
          ...(bundledSteps.length > 0 ? { bundled_steps: bundledSteps.map(b => b.stepId) } : {}),
          ...(bundledResourceDeliveries.length > 0 ? { bundled_resources: bundledResourceDeliveries.map(r => r.resourceId) } : {}),
          ...(resourceRefIds.length > 0 ? { resource_refs: resourceRefIds } : {}),
          ...(Object.keys(enforcementNotes).length > 0 ? { enforcement_notes: enforcementNotes } : {}),
        },
      };
    }), traceOpts));

  server.tool('yield_checkpoint', 'Worker tool: mark a checkpoint active and yield to the orchestrator (emit `<checkpoint_yield>` with the returned session_index).',
    {
      ...sessionIndexParam,
      checkpoint_id: z.string().describe('Checkpoint id being yielded.'),
    },
    withAuditLog('yield_checkpoint', withSessionStoreErrors(async ({ session_index, checkpoint_id }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;

      if (state.activeCheckpoint) {
        throw new Error(`Cannot yield checkpoint '${checkpoint_id}': Checkpoint '${state.activeCheckpoint.checkpointId}' is already active and awaiting orchestrator resolution.`);
      }

      const workflow_id = state.workflowId;
      const activity_id = state.currentActivity;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      const checkpoint = getCheckpoint(result.value, activity_id, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpoint_id} in activity ${activity_id}`);

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, result.value),
      );

      // Replay the recorded response if this checkpoint already has one from
      // a prior run of the same activity (e.g., a session being resumed).
      // The worker receives the stored option and reconstructed effect and
      // continues without yielding to the orchestrator — the user is not
      // prompted twice for the same decision. checkpointResponses is keyed
      // by `<activity-id>-<checkpoint-id>`.
      const responseKey = `${activity_id}-${checkpoint_id}`;
      const priorResponse = state.checkpointResponses?.[responseKey];
      if (priorResponse) {
        // Reconstitute the response-shape effect payload from the schema-shape
        // record (mirrors respond_checkpoint's reverse transform). The
        // variable bag has already been mutated on the original response, so
        // this payload is informational for the worker's own bookkeeping.
        const effects = priorResponse.effects;
        const effect: Record<string, unknown> = {};
        if (effects?.variablesSet) effect['setVariable'] = effects.variablesSet;
        if (effects?.transitionedTo) effect['transitionTo'] = effects.transitionedTo;
        if (effects?.activitiesSkipped) effect['skipActivities'] = effects.activitiesSkipped;

        const replayedAt = new Date().toISOString();
        const next = advanceSession(state, (draft) => {
          draft.history.push({
            timestamp: replayedAt,
            type: 'checkpoint_replayed',
            activity: activity_id,
            checkpoint: checkpoint_id,
            data: { optionId: priorResponse.optionId },
          });
        });
        await saveSessionForTool(loaded, next);

        const responsePayload: Record<string, unknown> = {
          status: 'replayed',
          checkpoint_id,
          session_index,
          resolved_option: priorResponse.optionId,
          message: `Checkpoint '${checkpoint_id}' already has a recorded response (option '${priorResponse.optionId}') from a prior run. The stored response has been replayed; apply any returned effect to your local state and continue execution WITHOUT yielding to the orchestrator.`,
        };
        if (Object.keys(effect).length > 0) responsePayload['effect'] = effect;

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(responsePayload, null, 2) }],
          _meta: { session_index, validation },
        };
      }

      const yieldedAt = new Date().toISOString();
      const next = advanceSession(state, (draft) => {
        draft.activeCheckpoint = {
          checkpointId: checkpoint_id,
          activityId: activity_id,
          yieldedAt,
        };
        draft.history.push({
          timestamp: yieldedAt,
          type: 'checkpoint_reached',
          activity: activity_id,
          checkpoint: checkpoint_id,
        });
      });
      await saveSessionForTool(loaded, next);

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'yielded',
          checkpoint_id,
          session_index,
          message: `Checkpoint '${checkpoint_id}' successfully yielded. Yield this session_index to the orchestrator using a <checkpoint_yield> block, then STOP execution and wait to be resumed.`
        }, null, 2) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  server.tool('record_usage', 'Orchestrator tool: record harness-reported token usage for ONE completed ACTIVITY (DELTA since the last figure for that dispatch). Call at every activity boundary — the first worker, a continue, a fresh worker after a timeout, a resume after a checkpoint yield, an out-of-band dispatch, and the terminal activity; a dispatch carrying a run of activities records one call per activity it covers. Optional `agent_id` attributes the row to a worker context.',
    {
      ...sessionIndexParam,
      activity: z.string().describe('Activity this figure is attributed to, whether or not the session is still on it. One call per activity a dispatch covers.'),
      usage: usageSchema.describe(
        'Harness-reported token DELTA for this ONE dispatch, as reported. Omit the call entirely when the harness '
        + 'surfaced nothing rather than passing zeros — the worker cannot self-measure, so absence must stay '
        + 'distinguishable from a measured zero.',
      ),
      agent_id: z.string().min(1).optional().describe(
        'Optional. Worker context that incurred this usage — the same identity used on get_activity for that dispatch. '
        + 'Stored as data.agentId on the activity_usage event so inspect_session can filter and attribute rows, and so '
        + 'the rows of one batched dispatch are readable as a group. '
        + 'Omit when attribution is unknown; the row remains valid as an unattributed bucket.',
      ),
    },
    withAuditLog('record_usage', withSessionStoreErrors(async ({ session_index, activity, usage, agent_id }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;

      const recordedAt = new Date().toISOString();
      const next = advanceSession(state, (draft) => {
        // One entry per activity, which is what projectUsage reports. Attribution is the
        // caller's `activity`: the dispatch ran it, whether or not the session is still
        // there by the time the figure arrives. A dispatch covering a run of activities
        // contributes one row apiece, which is the resolution a batch size is calibrated
        // from. Optional agent_id scopes the row to a worker.
        const data: Record<string, unknown> = { usage };
        if (agent_id !== undefined) data['agentId'] = agent_id;
        draft.history.push({
          timestamp: recordedAt, type: 'activity_usage', activity, data,
        });
      });
      await saveSessionForTool(loaded, next);

      const recorded = (next.history ?? []).filter(e => e.type === 'activity_usage').length;
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'recorded',
          activity,
          session_index,
          usage_events: recorded,
          message: `Usage recorded for '${activity}'. The session now carries ${recorded} usage event(s) — one per activity a dispatch covered, so a dispatch carrying a run of activities contributes several; inspect_session view usage projects the rows and view history counts the dispatches they belong to.`,
        }, null, 2) }],
        _meta: { session_index, validation: buildValidation() },
      };
    }), traceOpts));

  server.tool('resume_checkpoint', 'Worker tool: continue after the orchestrator resolves a checkpoint. Verifies no activeCheckpoint and returns variable updates to apply.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('resume_checkpoint', withSessionStoreErrors(async ({ session_index }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;

      if (state.activeCheckpoint) {
        throw new Error(`Cannot resume: Checkpoint '${state.activeCheckpoint.checkpointId}' is still active and has not been resolved by the orchestrator.`);
      }

      const validation = buildValidation();
      const next = advanceSession(state);
      await saveSessionForTool(loaded, next);

      // Note: The orchestrator passes variable effects directly in its prompt when resuming the worker.
      // This tool exists to verify the lock is cleared and advance the session sequence.
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({
          status: 'resumed',
          session_index,
          message: `Checkpoint cleared. You may proceed to the next step. Note any variable updates provided by the orchestrator.`
        }, null, 2) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  server.tool('present_checkpoint', 'Load the active checkpoint (message, options, effects, auto-advance) for presenting to the user. Reads state.activeCheckpoint.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('present_checkpoint', withSessionStoreErrors(async ({ session_index }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;

      const active = state.activeCheckpoint;
      if (!active) {
        throw new Error(
          `present_checkpoint: no active checkpoint on session '${session_index}'. The worker must yield a checkpoint via yield_checkpoint before the orchestrator can present it.`,
        );
      }

      const workflow_id = state.workflowId;
      const result = await loadWorkflow(config.workflowDir, workflow_id);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, active.activityId, active.checkpointId);
      if (!checkpoint) throw new Error(`Checkpoint not found: ${active.checkpointId} in activity ${active.activityId}`);

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, result.value),
      );

      return {
        content: [{ type: 'text' as const, text: stringifyForResponse({ ...checkpoint, session_index }) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  const MIN_RESPONSE_SECONDS = config.minCheckpointResponseSeconds ?? 3;

  server.tool('respond_checkpoint',
    'Clear the active-checkpoint gate. *MUST* present the checkpoint to the user first. ' +
    'Provide exactly one of `option_id`, `auto_advance`, or `condition_not_met`.',
    {
      ...sessionIndexParam,
      option_id: z.string().optional().describe('User-selected option id (must match a defined option).'),
      auto_advance: z.boolean().optional().describe('Use defaultOption after autoAdvanceMs with no user input. Only valid when the checkpoint has both.'),
      condition_not_met: z.boolean().optional().describe('Dismiss a conditional checkpoint whose condition was not met.'),
    },
    withAuditLog('respond_checkpoint', withSessionStoreErrors(async ({ session_index, option_id, auto_advance, condition_not_met }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;
      const active = state.activeCheckpoint;
      if (!active) {
        throw new Error(
          `respond_checkpoint: no active checkpoint on session '${session_index}'. The worker must yield a checkpoint via yield_checkpoint before the orchestrator can respond to it.`,
        );
      }
      const checkpoint_id = active.checkpointId;

      const modeCount = [option_id, auto_advance, condition_not_met].filter(v => v !== undefined).length;
      if (modeCount !== 1) {
        throw new Error('Exactly one of option_id, auto_advance, or condition_not_met must be provided.');
      }

      const result = await loadWorkflow(config.workflowDir, state.workflowId);
      if (!result.success) throw result.error;
      const checkpoint = getCheckpoint(result.value, active.activityId, checkpoint_id);
      if (!checkpoint) throw new Error(`Checkpoint definition not found: ${checkpoint_id} in activity ${active.activityId}`);

      const now = Math.floor(Date.now() / 1000);
      // Time since the checkpoint was yielded (recorded on activeCheckpoint).
      const yieldedAtSeconds = Math.floor(new Date(active.yieldedAt).getTime() / 1000);
      const elapsed = now - yieldedAtSeconds;
      let resolvedOptionId: string | undefined;
      let effect: Record<string, unknown> | undefined;

      if (option_id !== undefined) {
        if (elapsed < MIN_RESPONSE_SECONDS) {
          throw new Error(
            `Checkpoint response too fast (${elapsed}s < ${MIN_RESPONSE_SECONDS}s minimum). ` +
            `Present the checkpoint to the user before responding.`
          );
        }
        const option = checkpoint.options.find(o => o.id === option_id);
        if (!option) {
          const validIds = checkpoint.options.map(o => o.id);
          throw new Error(`Invalid option '${option_id}' for checkpoint '${checkpoint_id}'. Valid options: [${validIds.join(', ')}]`);
        }
        resolvedOptionId = option_id;
        effect = option.effect as Record<string, unknown> | undefined;
      } else if (auto_advance) {
        if (!checkpoint.defaultOption || !checkpoint.autoAdvanceMs) {
          throw new Error(
            `Cannot auto-advance checkpoint '${checkpoint_id}': missing defaultOption or autoAdvanceMs.`
          );
        }
        const requiredSeconds = Math.ceil(checkpoint.autoAdvanceMs / 1000);
        if (elapsed < requiredSeconds) {
          throw new Error(
            `Auto-advance timer not elapsed for checkpoint '${checkpoint_id}' ` +
            `(${elapsed}s < ${requiredSeconds}s). Wait for the full autoAdvanceMs (${checkpoint.autoAdvanceMs}ms) before auto-advancing.`
          );
        }
        const defaultOpt = checkpoint.options.find(o => o.id === checkpoint.defaultOption);
        if (!defaultOpt) {
          throw new Error(`Default option '${checkpoint.defaultOption}' not found in checkpoint '${checkpoint_id}'.`);
        }
        resolvedOptionId = checkpoint.defaultOption;
        effect = defaultOpt.effect as Record<string, unknown> | undefined;
      } else if (condition_not_met) {
        if (!checkpoint.condition) {
          throw new Error(
            `Cannot dismiss checkpoint '${checkpoint_id}': it has no condition field. ` +
            `Only conditional checkpoints can be dismissed with condition_not_met.`
          );
        }
      }

      // Declared variable types, for warn-only validation of setVariable
      // effects (#166 B7). Values are stored as written either way; a
      // mismatch is surfaced in _meta.validation and on the history event.
      const declaredTypes = new Map((result.value.variables ?? []).map(v => [v.name, v.type]));
      const typeWarnings: string[] = [];

      const next = advanceSession(state, (draft) => {
        delete draft.activeCheckpoint;
        const recordKey = `${active.activityId}-${checkpoint_id}`;
        const respondedAt = new Date(now * 1000).toISOString();
        // CheckpointResponseSchema requires `optionId` + `respondedAt`; for
        // `condition_not_met` dismissals we still record the resolution with
        // a sentinel option id so the on-disk schema stays valid.
        const recordedOptionId = resolvedOptionId ?? (condition_not_met ? '__condition_not_met__' : '__unknown__');
        // Unwrap the response effect into the schema-flat shape:
        // The encoded effect gives { setVariable: {...}, transitionTo: '...', skipActivities: [...] };
        // the schema stores variablesSet / transitionedTo / activitiesSkipped.
        const effectObj = effect as undefined | { setVariable?: Record<string, unknown>; transitionTo?: string; skipActivities?: string[] };
        const variablesSet = effectObj?.setVariable;
        const transitionedTo = effectObj?.transitionTo;
        const activitiesSkipped = effectObj?.skipActivities;
        const record: { optionId: string; respondedAt: string; effects?: { variablesSet?: Record<string, unknown>; transitionedTo?: string; activitiesSkipped?: string[] } } = {
          optionId: recordedOptionId,
          respondedAt,
        };
        if (variablesSet || transitionedTo || activitiesSkipped) {
          record.effects = {};
          if (variablesSet) record.effects.variablesSet = variablesSet;
          if (transitionedTo) record.effects.transitionedTo = transitionedTo;
          if (activitiesSkipped) record.effects.activitiesSkipped = activitiesSkipped;
        }
        draft.checkpointResponses = { ...(draft.checkpointResponses ?? {}), [recordKey]: record };
        draft.history.push({
          timestamp: respondedAt,
          type: 'checkpoint_response',
          activity: active.activityId,
          checkpoint: checkpoint_id,
          data: { optionId: recordedOptionId },
        });
        // Apply variable assignments to the rolled-up bag. Values are stored
        // as written; a declared-type mismatch is warn-only (#166 B7).
        // `{name}` template passthroughs are references resolved agent-side,
        // so their string type is exempt from validation.
        if (variablesSet) {
          typeWarnings.push(...applyVariableWrites(draft, variablesSet, declaredTypes, {
            timestamp: respondedAt,
            activity: active.activityId,
            source: 'setVariable',
          }));
        }
        // Apply explicitly-skipped activities to the bookkeeping array.
        if (activitiesSkipped) {
          for (const id of activitiesSkipped) {
            if (!draft.skippedActivities.includes(id)) {
              draft.skippedActivities.push(id);
              draft.history.push({
                timestamp: respondedAt,
                type: 'activity_skipped',
                activity: id,
              });
            }
          }
        }
      });
      await saveSessionForTool(loaded, next);

      if (typeWarnings.length > 0) {
        logWarn(`respond_checkpoint '${checkpoint_id}': setVariable type mismatch`, { session_index, warnings: typeWarnings });
      }

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, result.value),
        ...typeWarnings,
      );

      const responseData: Record<string, unknown> = {
        checkpoint_id,
        resolved: true,
        session_index,
      };
      if (resolvedOptionId !== undefined) responseData['resolved_option'] = resolvedOptionId;
      if (effect !== undefined) responseData['effect'] = effect;
      if (condition_not_met) responseData['dismissed'] = true;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseData, null, 2) }],
        _meta: { session_index, validation },
      };
    }), traceOpts));

  server.tool('get_trace', 'Retrieve the session execution trace. With `trace_tokens`, decode those segments; otherwise return the in-memory session trace (if tracing is enabled). Optional `agent_id` keeps only events whose `aid` matches.',
    {
      ...sessionIndexParam,
      trace_tokens: z.array(z.string()).optional().describe('Optional. Trace tokens from next_activity `_meta.trace_token`; omit for the full in-memory session trace.'),
      agent_id: z.string().min(1).optional().describe(
        'Optional. Keep only trace events whose aid equals this worker context.',
      ),
    },
    withAuditLog('get_trace', withSessionStoreErrors(async ({ session_index, trace_tokens, agent_id }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const next = advanceSession(state);
      await saveSessionForTool(loaded, next);

      if (trace_tokens && trace_tokens.length > 0) {
        const allEvents: TraceEvent[] = [];
        const errors: string[] = [];
        for (const tt of trace_tokens) {
          try {
            const payload = await decodeTraceToken(tt);
            allEvents.push(...payload.events);
          } catch (e) {
            errors.push(e instanceof Error ? e.message : String(e));
          }
        }
        const filteredTokenEvents = agent_id ? allEvents.filter(e => e.aid === agent_id) : allEvents;
        const result: Record<string, unknown> = { traceId: state.sessionIndex, source: 'tokens', event_count: filteredTokenEvents.length, events: filteredTokenEvents, session_index };
        if (errors.length > 0) result['token_errors'] = errors;
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
          _meta: { session_index, validation: buildValidation() },
        };
      }

      if (!config.traceStore) {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ traceId: state.sessionIndex, source: 'memory', tracing_enabled: false, event_count: 0, events: [], session_index }, null, 2) }],
          _meta: { session_index, validation: buildValidation() },
        };
      }

      const eventsRaw = config.traceStore.getEvents(state.sessionIndex);
      const events = agent_id ? eventsRaw.filter(e => e.aid === agent_id) : eventsRaw;
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ traceId: state.sessionIndex, source: 'memory', tracing_enabled: true, event_count: events.length, events, session_index }, null, 2) }],
        _meta: { session_index, validation: buildValidation() },
      };
    }), traceOpts ? { ...traceOpts, excludeFromTrace: true } : undefined));

  server.tool('health_check', 'Server health: status, name, version, workflow count, uptime. No session_index required.', {},
    withAuditLog('health_check', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      const payload: Record<string, unknown> = {
        status: 'healthy',
        server: config.serverName,
        version: config.serverVersion,
        workflows_available: workflows.length,
        uptime_seconds: Math.floor(process.uptime()),
        repo_binding: 'required_on_start_session',
      };
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
      };
    }));

  server.tool('get_workflow_status',
    'Session status (active/blocked/completed), current activity, completed activities, last checkpoint, and parent context if nested.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('get_workflow_status', withSessionStoreErrors(async ({ session_index }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;
      const clientWf = state.workflowId;
      const clientAct = state.currentActivity;
      const clientActive = state.activeCheckpoint;

      const wfResult = await loadWorkflow(config.workflowDir, clientWf || 'unknown');
      const workflow = wfResult.success ? wfResult.value : null;

      let status: string;
      if (clientActive) {
        status = 'blocked';
      } else {
        status = 'active';
      }

      const traceEvents = config.traceStore ? config.traceStore.getEvents(state.sessionIndex) : [];

      // Completed activities come from authoritative session state (the trace
      // store may be disabled). Fall back to trace-derived only if state is empty.
      let completedActivities: string[] = Array.isArray(state.completedActivities) ? [...state.completedActivities] : [];
      if (completedActivities.length === 0 && traceEvents.length > 0) {
        const activitySet = new Set<string>();
        for (const event of traceEvents) {
          if (event.name === 'next_activity' && event.act && event.s === 'ok' && !activitySet.has(event.act)) {
            activitySet.add(event.act);
            completedActivities.push(event.act);
          }
        }
      }

      const lastCheckpoint = traceEvents
        .filter(e => e.name === 'respond_checkpoint' && e.s === 'ok')
        .pop();

      const response: Record<string, unknown> = {
        status,
        current_activity: clientAct || 'none',
        completed_activities: completedActivities,
        // Rolled-up variable bag from session state, so workers/orchestrators can
        // read decisions and computed values on resume without re-deriving them.
        variables: state.variables ?? {},
        workflow: workflow ? {
          id: workflow.id,
          version: workflow.version,
          title: workflow.title,
        } : { id: clientWf },
      };

      if (state.parentSession) {
        response['parent'] = {
          session_index: state.parentSession.sessionIndex,
          workflow_id: state.parentSession.workflowId,
          activity: state.parentSession.currentActivity,
          version: state.parentSession.workflowVersion,
        };
      }

      if (lastCheckpoint) {
        response['last_checkpoint'] = {
          activity_id: lastCheckpoint.act,
          timestamp: lastCheckpoint.ts,
        };
      }

      // get_workflow_status reads but does not advance — keep the on-disk state stable.
      response['session_index'] = session_index;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta: { session_index, validation: buildValidation() },
      };
    }), traceOpts ? { ...traceOpts, excludeFromTrace: true } : undefined));

  server.tool('inspect_session',
    'Read-only compact projection of session state (never raw session.json). Not gated by active checkpoints.',
    {
      ...sessionIndexParam,
      view: z.enum(INSPECT_SESSION_VIEWS).default('summary')
        .describe('Projection: summary (default), identity, variables, checkpoints, activities, history, children, or usage (per-activity token rows and plain-sum totals from record_usage).'),
      child_index: z.number().int().nonnegative().optional()
        .describe('Optional. Project triggeredWorkflows[child_index].state instead of the parent session.'),
      variable: z.string().optional()
        .describe('Optional. With view=variables, return a single variable by name.'),
      agent_id: z.string().min(1).optional().describe(
        'Optional. Narrow history and usage projections to events/rows whose data.agentId matches this worker context.',
      ),
    },
    withAuditLog('inspect_session', withSessionStoreErrors(async ({ session_index, view, child_index, variable, agent_id }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      // Positional one-level descent into the addressed session's children, matching the
      // reference script's `--child N`. navigatePath throws SessionStoreError(NOT_FOUND) for an
      // out-of-range index, which withSessionStoreErrors renders as an actionable message.
      const addressed: SessionFile = child_index === undefined
        ? loaded.state
        : navigatePath(loaded.state, ['triggeredWorkflows', child_index, 'state']);

      const projection = projectSessionView(
        addressed,
        view,
        variable,
        config.pathPresentation,
        agent_id,
      );

      // Read-only: no advanceSession / saveSessionForTool — the on-disk state stays untouched.
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(projection, null, 2) }],
        _meta: { session_index, validation: buildValidation() },
      };
    }), traceOpts ? { ...traceOpts, excludeFromTrace: true } : undefined));
}
