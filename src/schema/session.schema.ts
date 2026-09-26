import { z } from 'zod';
import {
  CheckpointResponseSchema,
  HistoryEntrySchema,
  type HistoryEntry,
  type CheckpointResponse,
} from './state.schema.js';

/**
 * Reference + optional embedded state of a child workflow dispatched from
 * this session. The shape is recursive — `state` is a full `SessionFile`
 * itself, so the whole work-package tree lives inside the top-level file.
 *
 * Lightweight fields (workflowId, sessionIndex, status, ...) act as
 * navigation metadata when the embedded `state` is absent or summarised.
 */
export interface EmbeddedSessionRef {
  workflowId: string;
  sessionIndex: string;
  triggeredAt: string;
  triggeredFrom: { activityId: string; stepIndex?: number };
  status: 'running' | 'completed' | 'aborted' | 'error';
  completedAt?: string;
  state?: SessionFile;
}

export const ActiveCheckpointSchema = z.object({
  checkpointId: z.string().min(1).describe('Nonempty identifier of the outstanding checkpoint.'),
  activityId: z.string().min(1).describe('Nonempty identifier of the activity containing the checkpoint.'),
  yieldedAt: z.string().datetime().describe('ISO 8601 timestamp when the checkpoint became outstanding.'),

  adhoc: z.object({
    message: z.string().min(1).describe('Nonempty question or decision prompt.'),
    options: z.array(z.object({
      id: z.string().min(1).describe('Nonempty option identifier.'),
      label: z.string().min(1).describe('Nonempty label for the choice.'),
      description: z.string().optional().describe('Explanation of the choice.'),
    }).describe('Named choice for the ad hoc decision.')).min(2).describe('At least two choices for the ad hoc decision.'),
  }).optional().describe('Decision details for a checkpoint absent from the activity definition.'),
}).describe('Outstanding checkpoint and any ad hoc decision details.');
export type ActiveCheckpoint = z.infer<typeof ActiveCheckpointSchema>;

/**
 * Base shape of `SessionFile`. Recursion runs downward only: a launched
 * workflow's state is embedded under `triggeredWorkflows[i].state`, declared
 * via `z.lazy()` so the type can refer back to itself.
 */
const SessionFileBaseSchema = z.object({
  schemaVersion: z.literal(1).describe('Session file format version.'),

  sessionIndex: z.string().regex(/^[A-Z2-7]{6}$/, 'sessionIndex must be a 6-character RFC 4648 base32 string').describe('Six-character RFC 4648 base32 session identifier.'),

  workflowId: z.string().min(1).describe('Nonempty workflow identifier.'),
  workflowVersion: z.string().regex(/^\d+\.\d+\.\d+$/).describe('Workflow version in numeric `major.minor.patch` form.'),

  agentId: z.string().min(1).describe('Nonempty identifier of the agent associated with this session.'),

  seq: z.number().int().nonnegative().describe('Nonnegative integer revision number for the session state.'),

  ts: z.number().int().nonnegative().describe('Time of the latest state revision, in Unix epoch seconds.'),

  startedAt: z.string().datetime().describe('ISO 8601 timestamp when the session began.'),

  frontier: z.array(z.string().describe('Activity identifier, optionally qualified by an instance number.')).default([]).describe('Activities currently in progress, with parallel instances named `<activityId>#<instance>`.'),
  currentTechnique: z.string().default('').describe('Current technique reference, or an empty string when none is selected.'),

  exit: z.string().default('').describe('Most recent activity exit, or an empty string when none is recorded.'),

  activeCheckpoint: ActiveCheckpointSchema.optional(),

  variables: z.record(z.unknown().describe('Current value of the named variable.')).default({}).describe('Current values keyed by variable name.'),

  completedActivities: z.array(z.string().describe('Identifier of a completed activity.')).default([]).describe('Identifiers of completed activities.'),

  checkpointResponses: z.record(CheckpointResponseSchema).default({}).describe('Checkpoint decisions keyed by `activityId-checkpointId`.'),

  history: z.array(HistoryEntrySchema).default([]).describe('Chronological record of session progress.'),

  status: z.enum(['running', 'completed', 'aborted']).default('running').describe('Session status, defaulting to `running`.'),

  triggeredWorkflows: z.array(z.lazy(() => EmbeddedSessionRefSchema).describe('Child workflow reference with optional nested state.')).default([]).describe('Child workflows and their optional nested session state.'),

  planningFolderPath: z.string().optional().describe('Absolute path of the planning folder containing the session file.'),

  repo: z.string().min(1).optional().describe('Target repository in `owner/repo` form.'),

  contextMode: z.enum(['persistent', 'fresh']).optional().describe('Context lifetime: `persistent` across calls, or `fresh` for each call by default.'),

  executionPath: z.enum(['agent', 'runner']).optional().describe('Execution mode: `agent` by default, or `runner`.'),

  deliveredContent: z.record(z.record(z.string().describe('Fingerprint of the content associated with this key.')).describe('Content keys mapped to fingerprints for one agent.')).optional().describe('Content fingerprints grouped by agent identifier and content key.'),

  declaredArtifacts: z.array(z.object({
    id: z.string().min(1).describe('Nonempty artifact identifier.'),
    name: z.string().min(1).describe('Nonempty artifact filename.'),
    path: z.string().optional().describe('Location of the artifact file.'),
  }).describe('Artifact identifier, filename, and optional path.')).optional().describe('Artifacts declared during the session.'),
}).describe('Session identity, progress, variables, decisions, and child sessions.');

export const EXECUTION_PATHS = ['agent', 'runner'] as const;
export type ExecutionPath = (typeof EXECUTION_PATHS)[number];

/** Path that drove the session. A file that never recorded one is agent-driven. */
export function resolveExecutionPath(state: { executionPath?: ExecutionPath }): ExecutionPath {
  return state.executionPath ?? 'agent';
}

/**
 * Static type of the recursive `SessionFileSchema`. Declared up front so the
 * lazy schema below can refer to itself via `z.ZodType<SessionFile>`.
 */
export interface SessionFile {
  schemaVersion: 1;
  sessionIndex: string;
  workflowId: string;
  workflowVersion: string;
  agentId: string;
  seq: number;
  ts: number;
  startedAt: string;
  frontier: string[];
  currentTechnique: string;
  exit: string;
  activeCheckpoint?: ActiveCheckpoint;
  variables: Record<string, unknown>;
  completedActivities: string[];
  checkpointResponses: Record<string, CheckpointResponse>;
  history: HistoryEntry[];
  status: 'running' | 'completed' | 'aborted';
  triggeredWorkflows: EmbeddedSessionRef[];
  planningFolderPath?: string;
  repo?: string;
  contextMode?: 'persistent' | 'fresh';
  executionPath?: ExecutionPath;
  deliveredContent?: Record<string, Record<string, string>>;
  declaredArtifacts?: Array<{ id: string; name: string; path?: string }>;
}

/**
 * Recursive `SessionFile` schema. `triggeredWorkflows[i].state` references this
 * schema via `z.lazy()`, so a single file captures the entire work-package
 * tree. A session's place in that tree is its position in the file; nothing is
 * stored about the session above it.
 */
export const SessionFileSchema: z.ZodType<SessionFile> = SessionFileBaseSchema as z.ZodType<SessionFile>;

/**
 * Schema for a child entry inside the parent's `triggeredWorkflows[]` array.
 * The `state` field embeds the child's full `SessionFile` recursively.
 */
export const EmbeddedSessionRefSchema: z.ZodType<EmbeddedSessionRef> = z.object({
  workflowId: z.string().min(1).describe('Nonempty identifier of the child workflow.'),
  sessionIndex: z.string().regex(/^[A-Z2-7]{6}$/).describe('Six-character RFC 4648 base32 identifier of the child session.'),
  triggeredAt: z.string().datetime().describe('ISO 8601 timestamp when the child workflow began.'),
  triggeredFrom: z.object({
    activityId: z.string().describe('Identifier of the parent activity.'),
    stepIndex: z.number().int().min(1).optional().describe('One-based index of the parent step.'),
  }).describe('Activity and optional step where the child workflow began.'),
  status: z.enum(['running', 'completed', 'aborted', 'error']).describe('Current status of the child workflow.'),
  completedAt: z.string().datetime().optional().describe('ISO 8601 timestamp when the child workflow completed.'),
  state: z.lazy(() => SessionFileSchema).optional().describe('Full nested state of the child session.'),
}).describe('Child workflow identity, status, and optional nested session state.') as z.ZodType<EmbeddedSessionRef>;

/** Strict parse — throws on validation failure. */
export function validateSessionFile(data: unknown): SessionFile {
  return SessionFileSchema.parse(data);
}

/** Safe parse — returns a `SafeParseReturnType` with structured errors. */
export function safeValidateSessionFile(data: unknown): z.SafeParseReturnType<unknown, SessionFile> {
  return SessionFileSchema.safeParse(data);
}

/**
 * Create a minimal valid `SessionFile` for a freshly-created session. Callers
 * (e.g. `start_session`) layer in defaults and persist via the session store.
 */
export function createInitialSessionFile(args: {
  sessionIndex: string;
  workflowId: string;
  workflowVersion: string;
  agentId: string;
  planningFolderPath?: string;
  /** Target owner/repo bound on this session (session.json SSOT). */
  repo?: string;
  contextMode?: 'persistent' | 'fresh';
  executionPath?: ExecutionPath;
  variables?: Record<string, unknown>;
}): SessionFile {
  const now = new Date();
  const seeded = args.variables ?? {};
  const file: SessionFile = {
    schemaVersion: 1,
    sessionIndex: args.sessionIndex,
    workflowId: args.workflowId,
    workflowVersion: args.workflowVersion,
    agentId: args.agentId,
    seq: 0,
    ts: Math.floor(now.getTime() / 1000),
    startedAt: now.toISOString(),
    frontier: [],
    currentTechnique: '',
    exit: '',
    variables: seeded,
    completedActivities: [],
    checkpointResponses: {},
    // Defaults seeded from the workflow's variable declarations (#166 B7) are
    // recorded as ONE variables_seeded event carrying the whole map — they are
    // initial state, not checkpoint writes, so no per-name variable_set events.
    history: [
      { timestamp: now.toISOString(), type: 'workflow_started' },
      ...(Object.keys(seeded).length > 0
        ? [{ timestamp: now.toISOString(), type: 'variables_seeded' as const, data: { variables: seeded } }]
        : []),
    ],
    status: 'running',
    triggeredWorkflows: [],
    executionPath: args.executionPath ?? 'agent',
  };
  if (args.planningFolderPath) file.planningFolderPath = args.planningFolderPath;
  if (args.repo) file.repo = args.repo;
  if (args.contextMode) file.contextMode = args.contextMode;
  return file;
}

/**
 * Bind `owner/repo` onto a session. Idempotent when the session already has
 * the same repo; rejects a conflicting rebind. Empty/undefined input is a no-op.
 */
export function bindSessionRepo(
  state: SessionFile,
  repoRaw: string | undefined,
  normalize: (raw: string) => string,
): SessionFile {
  const trimmed = repoRaw?.trim();
  if (!trimmed) return state;
  const repo = normalize(trimmed);
  if (state.repo) {
    if (state.repo !== repo) {
      throw new Error(
        `session already bound to repo '${state.repo}'; cannot rebind to '${repo}'`,
      );
    }
    return state;
  }
  return { ...state, repo };
}
