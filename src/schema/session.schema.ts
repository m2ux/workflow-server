import { z } from 'zod';
import {
  CheckpointResponseSchema,
  HistoryEntrySchema,
  NestedTriggeredWorkflowRefSchema,
  type NestedTriggeredWorkflowRef,
  type HistoryEntry,
  type CheckpointResponse,
} from './state.schema.js';

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
  currentSkill: z.string().default(''),
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
   * Child workflows dispatched from this session. Each entry can carry its
   * own nested workflow state via the existing `NestedTriggeredWorkflowRef`
   * recursion.
   */
  triggeredWorkflows: z.array(NestedTriggeredWorkflowRefSchema).default([]),
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
  currentSkill: string;
  condition: string;
  activeCheckpoint?: ActiveCheckpoint;
  variables: Record<string, unknown>;
  completedActivities: string[];
  skippedActivities: string[];
  checkpointResponses: Record<string, CheckpointResponse>;
  history: HistoryEntry[];
  triggeredWorkflows: NestedTriggeredWorkflowRef[];
  parentSession?: SessionFile;
}

/**
 * Recursive `SessionFile` schema. The `parentSession` branch references this
 * schema itself via `z.lazy()` so the same shape captures the whole
 * nested-dispatch chain (A → B → C → D) without flattening.
 */
export const SessionFileSchema: z.ZodType<SessionFile> = SessionFileBaseSchema.extend({
  parentSession: z.lazy(() => SessionFileSchema).optional(),
}) as z.ZodType<SessionFile>;

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
  parentSession?: SessionFile;
}): SessionFile {
  const now = new Date();
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
    currentSkill: '',
    condition: '',
    variables: {},
    completedActivities: [],
    skippedActivities: [],
    checkpointResponses: {},
    history: [],
    triggeredWorkflows: [],
  };
  if (args.parentSession) file.parentSession = args.parentSession;
  return file;
}
