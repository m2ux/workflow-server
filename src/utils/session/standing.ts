/**
 * The sessions standing on this instance: every session the process has advanced that has not
 * finished.
 *
 * One sidecar serves every session that walks against its corpus bind, and that bind moves for all
 * of them at once. Who is on the bind is knowable only inside the process that answered their
 * calls, so an operator about to move it reads the register through `GET /ready` and sees what the
 * move would displace. The register lives in memory and goes with the process: a restarted
 * instance has nobody standing on it, which is true of a bind that has just moved.
 */

/** A session this instance has advanced and not seen finish. */
export interface StandingSession {
  /** The index the session is addressed by. */
  session_index: string;
  /** The workflow it walks. */
  workflow_id: string;
  /** Absolute path of its planning folder, when the record names one. */
  planning_folder?: string;
  /** When this instance first advanced it, ISO 8601. */
  since: string;
  /** When this instance last advanced it, ISO 8601. */
  last_seen: string;
}

const standing = new Map<string, StandingSession>();

/** The fields a session record carries that say who is standing and whether they still are. */
interface SessionRecord {
  sessionIndex?: unknown;
  workflowId?: unknown;
  planningFolderPath?: unknown;
  status?: unknown;
}

/**
 * Register the session a write records, or release it when that write ends its walk.
 *
 * Called from the one place session records are persisted, so standing follows the record rather
 * than the tool call that produced it: a session advances by writing, and a session that never
 * writes again is a walk that stopped where it stood.
 */
export function noteSessionWrite(state: unknown, now: Date = new Date()): void {
  if (typeof state !== 'object' || state === null) return;
  const record = state as SessionRecord;
  const index = typeof record.sessionIndex === 'string' ? record.sessionIndex : undefined;
  if (index === undefined || index.length === 0) return;
  if (record.status !== undefined && record.status !== 'running') {
    standing.delete(index);
    return;
  }
  const stamp = now.toISOString();
  const held = standing.get(index);
  standing.set(index, {
    session_index: index,
    workflow_id: typeof record.workflowId === 'string' ? record.workflowId : '',
    ...(typeof record.planningFolderPath === 'string'
      ? { planning_folder: record.planningFolderPath }
      : {}),
    since: held?.since ?? stamp,
    last_seen: stamp,
  });
}

/** The sessions standing on this instance, oldest first. */
export function standingSessions(): StandingSession[] {
  return [...standing.values()].sort((a, b) => a.since.localeCompare(b.since));
}

/** Empty the register. For a test that wants an instance nobody is standing on. */
export function clearStandingSessions(): void {
  standing.clear();
}
