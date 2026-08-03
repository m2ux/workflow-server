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
    .describe('REQUIRED. Stable 6-character session_index from start_session; pass on every authenticated call.'),
};


/**
 * Zod parameter spread for the REQUIRED `context_tokens` parameter on
 * `get_activity`. The worker declares its OWN context window on the call that
 * delivers its activity payload, and the server derives two budgets from it,
 * each with a headroom fraction of its own (× a token→char factor, all server
 * config): the eager step-technique bundling budget for THIS activity, and the
 * cumulative batch budget over every activity this context has taken. The
 * figure is per-AGENT and per-CALL — never stored on the session, never
 * guessed, never defaulted: a shared session serves differently-sized agents,
 * so only the consuming agent knows its own window. Omission is a validation
 * error rejected at the MCP boundary.
 */
export const contextTokensParam = {
  context_tokens: z.number().int().positive()
    .describe('REQUIRED. Caller\'s context window in tokens; sets the eager step-technique bundling budget for this activity and the cumulative batch budget across the run this context is walking. Per-call, never defaulted — omitting it is a validation error.'),
};


/**
 * Zod parameter spread for the optional `agent_id` on the three delivery tools
 * (`get_activity`, `get_technique`, `get_resource`).
 *
 * A dispatched worker authenticates against the ORCHESTRATOR's `session_index`,
 * so the call itself has to say which context it is for the delivery ledger to
 * tell one worker from another. `agent_id` is that identity: the orchestrator
 * mints one per dispatch and reuses it verbatim for as long as that worker lives
 * — resuming it after a gate, and advancing it to the next activity of its batch.
 * So a fresh spawn reads an empty ledger (full delivery) and that same context
 * reads its own (unchanged-references). It scopes the ledger only — it never
 * rebinds `session.agentId`. Omitted, the scope is the session's own agent id
 * (see `deliveryScope` in src/utils/delivery.ts).
 */
export const agentIdParam = {
  agent_id: z.string().min(1).optional().describe(
    'Optional. Identity of the AGENT CONTEXT making this call — mint one per dispatched worker and reuse it verbatim for that worker\'s whole life, resuming it after a gate and advancing it to the next activity of its batch. '
    + 'Scopes the delivery ledger (and the dispatch record) to that context: a fresh id gets full delivery, a reused id gets unchanged-references for what that context already received. '
    + 'Omit for solo walks. Never rebinds the session agent.'),
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
