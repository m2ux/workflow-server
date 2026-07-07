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
  /** Child's workflow id (e.g. "work-package"). */
  workflowId: string;
  /** Child's 6-char base32 session_index. */
  sessionIndex: string;
  /** ISO-8601 timestamp at dispatch. */
  triggeredAt: string;
  /** Where in the parent's flow the child was dispatched. */
  triggeredFrom: { activityId: string; stepIndex?: number };
  status: 'running' | 'completed' | 'aborted' | 'error';
  /** ISO-8601 timestamp when the child reached its terminal activity. */
  completedAt?: string;
  /** Context returned from the child on completion. */
  returnedContext?: Record<string, unknown>;
  /**
   * Full child SessionFile, embedded recursively. The single `session.json`
   * at the top of the planning folder carries every descendant's state.
   */
  state?: SessionFile;
}

/**
 * Active checkpoint state — replaces the `bcp` field embedded in the legacy
 * HMAC session token. When set, all authenticated tools (except
 * `respond_checkpoint`) are gated until the orchestrator resolves the
 * checkpoint via `respond_checkpoint`.
 */
export const ActiveCheckpointSchema = z.object({
  checkpointId: z.string().min(1),
  activityId: z.string().min(1),
  yieldedAt: z.string().datetime(),
});
export type ActiveCheckpoint = z.infer<typeof ActiveCheckpointSchema>;

/**
 * Base (non-recursive) shape of `SessionFile`. Used as the building block for
 * the recursive `SessionFileSchema` below; the only structural extension is
 * the addition of `parentSession`, declared via `z.lazy()` so the type can
 * refer back to itself for nested-workflow chains.
 */
const SessionFileBaseSchema = z.object({
  /** Schema-format version. Bump on breaking layout changes. */
  schemaVersion: z.literal(1),

  /** Six-character base32 session index derived from the planning folder path. */
  sessionIndex: z.string().regex(/^[A-Z2-7]{6}$/, 'sessionIndex must be a 6-character RFC 4648 base32 string'),

  /** Workflow identity. */
  workflowId: z.string().min(1),
  workflowVersion: z.string().regex(/^\d+\.\d+\.\d+$/),

  /** Agent identity (e.g. "orchestrator", "worker"). */
  agentId: z.string().min(1),

  /**
   * Monotonically-increasing per-session sequence number. Increments on every
   * authenticated tool call that mutates state.
   */
  seq: z.number().int().nonnegative(),

  /** Unix epoch seconds of the most recent state write. */
  ts: z.number().int().nonnegative(),

  /** ISO-8601 timestamp captured at session creation. */
  startedAt: z.string().datetime(),

  /** Current execution position. */
  currentActivity: z.string().default(''),
  currentTechnique: z.string().default(''),
  condition: z.string().default(''),

  /** Outstanding checkpoint, if one is active. */
  activeCheckpoint: ActiveCheckpointSchema.optional(),

  /** Workflow variables (arbitrary key/value bag). */
  variables: z.record(z.unknown()).default({}),

  /** Activity bookkeeping. */
  completedActivities: z.array(z.string()).default([]),
  skippedActivities: z.array(z.string()).default([]),

  /**
   * Map of "activityId-checkpointId" → resolution record. Mirrors the
   * `checkpointResponses` field on the existing workflow state schema.
   */
  checkpointResponses: z.record(CheckpointResponseSchema).default({}),

  /** Append-only event log for the session. */
  history: z.array(HistoryEntrySchema).default([]),

  /**
   * Session lifecycle status. `running` while the workflow has not reached
   * its terminal activity; `completed` after the terminal activity runs;
   * `aborted` if it was explicitly cancelled. Optional and defaults to
   * `running` so existing sessions parse without migration.
   */
  status: z.enum(['running', 'completed', 'aborted']).default('running'),

  /**
   * Child workflows dispatched from this session. Each entry's `state` field
   * is a full embedded `SessionFile` — the whole work-package tree lives
   * inside the top-level `session.json`. See `EmbeddedSessionRefSchema`.
   */
  triggeredWorkflows: z.array(z.lazy(() => EmbeddedSessionRefSchema)).default([]),

  /**
   * Absolute path of the planning folder that owns this session.json at the
   * time of the most recent `start_session`. Recorded for diagnostics and
   * agent-side bookkeeping (workflows can reference it without re-deriving
   * paths from their own context). On resume, if `start_session` is called
   * with a `planning_folder_path` that differs from the recorded value, the
   * server silently overwrites it with the new path — the folder is mobile,
   * the stored path tracks wherever it currently lives. Server resolution
   * itself is by stored `sessionIndex`, not by this path; the field exists
   * to expose the canonical location, not to drive lookups. Optional for
   * back-compat with older session files.
   */
  planningFolderPath: z.string().optional(),

  /**
   * Declared context model for payload delivery. `persistent` opts the
   * session into reference-not-repeat delivery: composed bundle content and
   * technique payloads already delivered to this session+agent are replaced
   * by short content-hash references on subsequent calls. Absent or `fresh`
   * means every call receives full content — the default, and the correct
   * mode for disposable-worker topologies where each call lands in a fresh
   * agent context that has not seen the earlier deliveries.
   */
  contextMode: z.enum(['persistent', 'fresh']).optional(),

  /**
   * Delivery ledger for reference-not-repeat payloads: agentId → content
   * key → hash of the content most recently delivered in full. Content keys
   * are namespaced by channel (`bundle:<technique-ref>`, `bundle:rules`,
   * `activity_rules`, `technique:<technique-id>`). Always recorded so a
   * per-call reference opt-in can follow full deliveries; consulted only
   * when reference delivery is active (session `contextMode: 'persistent'`
   * or a per-call opt-in).
   */
  deliveredContent: z.record(z.record(z.string())).optional(),
});

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
  currentActivity: string;
  currentTechnique: string;
  condition: string;
  activeCheckpoint?: ActiveCheckpoint;
  variables: Record<string, unknown>;
  completedActivities: string[];
  skippedActivities: string[];
  checkpointResponses: Record<string, CheckpointResponse>;
  history: HistoryEntry[];
  status: 'running' | 'completed' | 'aborted';
  triggeredWorkflows: EmbeddedSessionRef[];
  parentSession?: SessionFile;
  planningFolderPath?: string;
  contextMode?: 'persistent' | 'fresh';
  deliveredContent?: Record<string, Record<string, string>>;
}

/**
 * Recursive `SessionFile` schema. Both `parentSession` (upward link) and
 * `triggeredWorkflows[i].state` (downward children) reference this schema via
 * `z.lazy()`, so a single file captures the entire work-package tree.
 */
export const SessionFileSchema: z.ZodType<SessionFile> = SessionFileBaseSchema.extend({
  parentSession: z.lazy(() => SessionFileSchema).optional(),
}) as z.ZodType<SessionFile>;

/**
 * Schema for a child entry inside the parent's `triggeredWorkflows[]` array.
 * The `state` field embeds the child's full `SessionFile` recursively.
 */
export const EmbeddedSessionRefSchema: z.ZodType<EmbeddedSessionRef> = z.object({
  workflowId: z.string().min(1),
  sessionIndex: z.string().regex(/^[A-Z2-7]{6}$/),
  triggeredAt: z.string().datetime(),
  triggeredFrom: z.object({
    activityId: z.string(),
    stepIndex: z.number().int().min(1).optional(),
  }),
  status: z.enum(['running', 'completed', 'aborted', 'error']),
  completedAt: z.string().datetime().optional(),
  returnedContext: z.record(z.unknown()).optional(),
  state: z.lazy(() => SessionFileSchema).optional(),
}) as z.ZodType<EmbeddedSessionRef>;

/** Strict parse — throws on validation failure. */
export function validateSessionFile(data: unknown): SessionFile {
  return SessionFileSchema.parse(data);
}

/** Safe parse — returns a `SafeParseReturnType` with structured errors. */
export function safeValidateSessionFile(data: unknown): z.SafeParseReturnType<unknown, SessionFile> {
  return SessionFileSchema.safeParse(data);
}

/**
 * Soft warning threshold (in ancestors) for nested-workflow parent chains.
 * Past this depth, callers emit a `_meta.validation` warning; there is no hard
 * ceiling. Typical dispatch is 2-3 levels deep.
 */
export const PARENT_CHAIN_DEPTH_WARN_THRESHOLD = 5;

/**
 * Count the number of ancestor sessions reachable via `parentSession`. Returns
 * 0 when the session has no parent, 1 for a single parent, and so on. Walks
 * the chain iteratively with a generous safety cap to defend against cycles
 * introduced by hand-edited or malformed `session.json` files.
 */
export function parentChainDepth(state: SessionFile | undefined): number {
  if (!state) return 0;
  let depth = 0;
  let cursor: SessionFile | undefined = state.parentSession;
  // Safety cap defends against accidental cycles in hand-edited state. 1024
  // is two orders of magnitude past the soft-warn threshold; legitimate
  // chains will never approach it.
  const SAFETY_CAP = 1024;
  while (cursor && depth < SAFETY_CAP) {
    depth += 1;
    cursor = cursor.parentSession;
  }
  return depth;
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
  parentSession?: SessionFile;
  planningFolderPath?: string;
  contextMode?: 'persistent' | 'fresh';
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
    currentActivity: '',
    currentTechnique: '',
    condition: '',
    variables: seeded,
    completedActivities: [],
    skippedActivities: [],
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
  };
  if (args.parentSession) file.parentSession = args.parentSession;
  if (args.planningFolderPath) file.planningFolderPath = args.planningFolderPath;
  if (args.contextMode) file.contextMode = args.contextMode;
  return file;
}
