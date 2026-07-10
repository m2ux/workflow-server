import { z } from 'zod';

/**
 * Zod parameter spread for the `session_index` parameter shared by every
 * authenticated tool. The index is a 6-character RFC 4648 base32 string
 * identifying the planning folder whose `session.json` is the authoritative
 * state for the session.
 */
export const sessionIndexParam = {
  session_index: z.string()
    .regex(/^[A-Z2-7]{6}$/, 'session_index must be a 6-character RFC 4648 base32 string (A-Z, 2-7)')
    .describe('REQUIRED. The 6-character session_index returned by start_session. The server resolves this index to a planning folder under .engineering/artifacts/planning/ and reads/writes session.json there. The index is stable across all tool calls in the session — there is no rotation discipline.'),
};

/**
 * Zod parameter spread for the REQUIRED `context_tokens` parameter on
 * `get_activity`. The worker declares its OWN context window on the call that
 * delivers its activity payload; the server derives the eager step-technique
 * bundling budget from it (availability headroom × a token→char factor, both
 * server config). The budget is per-AGENT and per-CALL — never stored on the
 * session, never guessed, never defaulted: a shared session serves
 * differently-sized agents, so only the consuming agent knows its own window.
 * Omission is a validation error rejected at the MCP boundary.
 */
export const contextTokensParam = {
  context_tokens: z.number().int().positive()
    .describe('REQUIRED. The calling worker\'s total context window in tokens. The server derives the eager step-technique bundling budget from this value (availability headroom × a token→char factor, both server config) and inlines the activity\'s ungated step-bound techniques that fit, in document order, under that budget; the remainder stay lazy via get_technique. Per-agent and per-call — never stored on the session, never defaulted. Omitting it is a validation error.'),
};

/**
 * Throws if the SessionFile has an active checkpoint. Call this in every
 * authenticated tool handler EXCEPT `respond_checkpoint` (the resolution
 * mechanism) and `present_checkpoint` (which loads the checkpoint definition
 * while a checkpoint is active).
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
