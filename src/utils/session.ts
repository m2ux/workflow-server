import { z } from 'zod';

/**
 * Zod parameter spread for the `session_index` parameter shared by every
 * authenticated tool (Phase 4). The index is a 6-character RFC 4648 base32
 * string identifying the planning folder whose `session.json` is the
 * authoritative state for the session.
 *
 * Tools that previously accepted `session_token` now accept `session_index`;
 * passing the legacy `session_token` parameter is rejected by the strict
 * zod schema and surfaces a clear migration error (PR116-TC-60).
 */
export const sessionIndexParam = {
  session_index: z.string()
    .regex(/^[A-Z2-7]{6}$/, 'session_index must be a 6-character RFC 4648 base32 string (A-Z, 2-7)')
    .describe('REQUIRED. The 6-character session_index returned by start_session. The server resolves this index to a planning folder under .engineering/artifacts/planning/ and reads/writes session.json there. The index is stable across all tool calls in the session — there is no rotation discipline.'),
};

/**
 * Throws if the SessionFile has an active checkpoint. Call this in every
 * authenticated tool handler EXCEPT `respond_checkpoint` (the resolution
 * mechanism) and `present_checkpoint` (which loads the checkpoint definition
 * while a checkpoint is active).
 *
 * Reads `state.activeCheckpoint` per PD-11; the legacy token-decoded
 * `assertCheckpointsResolved(SessionPayload)` helper has been removed.
 */
export function assertNoActiveCheckpoint(state: { activeCheckpoint?: { checkpointId: string; activityId: string } | undefined; currentActivity?: string }): void {
  if (state.activeCheckpoint) {
    throw new Error(
      `Blocked: Active checkpoint '${state.activeCheckpoint.checkpointId}' on activity '${state.activeCheckpoint.activityId}'. ` +
      `All tools are gated until the checkpoint is resolved. ` +
      `The orchestrator must call respond_checkpoint to clear the gate before any other tool calls can proceed.`
    );
  }
}
