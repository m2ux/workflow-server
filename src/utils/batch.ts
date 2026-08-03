import type { SessionFile } from '../schema/session.schema.js';

/**
 * The batch bound (#407).
 *
 * One dispatched worker context walks a run of activities rather than exactly one, and the saving is
 * the context establishment it does not re-pay — the system prompt, project instructions and tool
 * schemas a fresh worker rebuilds before it reads a line of workflow content. What makes the run
 * safe is that it is bounded, and the bound lives here, at delivery, rather than in rule text a
 * worker may or may not read.
 *
 * A batch is not declared. It IS the run of activities one delivery scope takes delivery of, so the
 * server sees a batch with no orchestrator cooperation and a worker that omits a parameter does not
 * escape it. Both halves are read off the session history: `activity_dispatched.chars` is the size of
 * the whole `get_activity` response, eagerly bundled techniques and resources included, and the
 * content-fetch events cover what the worker went back for LAZILY on top of it. Bundled entries are
 * therefore not added again — their bytes are already inside the activity payload.
 *
 * Two limits, and the second is not redundant:
 *
 * - A CUMULATIVE character budget over everything already delivered to the scope, derived from the
 *   caller's declared `context_tokens` under a headroom fraction of its own. The eager-bundling
 *   fraction answers a different question — how much of one activity's window may go to inlined
 *   step techniques — and at that setting the arithmetic admits nine of the main workflow's fifteen
 *   activities into a single context.
 * - A hard cap on distinct activities. A character count is blind to the context establishment the
 *   server never delivers, the code the worker reads, the artifacts it drafts, and degradation
 *   across a long walk. Those are what overflow a context.
 *
 * The bound applies to a DISPATCHED worker context — a scope other than the session's own agent. A
 * scope equal to the session agent is the context that owns the whole walk by construction, which is
 * what `contextMode: 'persistent'` describes; its run is the session, not a batch.
 *
 * An activity the scope has ALREADY taken is always served: that is a worker resuming after a gate
 * asking for the payload it is holding, and refusing it would break the mechanism at every gate.
 */

/** Which limit a refused activity ran into. */
export type BatchLimit = 'activity_cap' | 'delivery_budget';

/** The two limits in force for one delivery, in the units they are measured in. */
export interface BatchBound {
  /** Distinct activities one worker context may take delivery of. */
  maxActivities: number;
  /** Cumulative delivered characters one worker context may accumulate. */
  budgetChars: number;
}

/** A refusal to extend a batch, carrying the arithmetic that produced it. */
export interface BatchRefusal {
  limit: BatchLimit;
  /** Distinct activities this scope has already taken. */
  activities: number;
  /** Characters already delivered to this scope. */
  chars: number;
  bound: BatchBound;
}

/**
 * Distinct activities `scope` has taken delivery of, in first-delivery order. This is the batch: the
 * run of activities one worker context has walked.
 */
export function batchActivities(state: SessionFile, scope: string): string[] {
  const seen: string[] = [];
  for (const event of state.history ?? []) {
    if (event.type !== 'activity_dispatched') continue;
    const data = event.data as { agentId?: string; chars?: number } | undefined;
    if (data?.agentId !== scope) continue;
    // A dispatch event with no size is a context announcing itself on a technique or resource fetch,
    // which delivered no activity payload — an out-of-band context does exactly that. Counting the
    // activity the session happened to be on would spend a slot on an activity never delivered, and
    // the refusal would then state a count the context cannot account for.
    if (typeof data.chars !== 'number') continue;
    const activity = event.activity;
    if (typeof activity !== 'string' || seen.includes(activity)) continue;
    seen.push(activity);
  }
  return seen;
}

/**
 * Characters delivered in full to `scope` across everything it has received. Content that collapsed
 * to an unchanged marker cost the receiving context effectively nothing, so it does not draw down the
 * budget.
 *
 * Counted once each, which takes care over what already contains what:
 *
 * - `activity_dispatched.chars` is the size of the whole `get_activity` response, so it already
 *   includes every technique and resource that response bundled eagerly. Those arrive with their own
 *   `technique_bundled` / `resource_fetched` events, recorded for delivery observability, and adding
 *   them would charge the same bytes twice — measured at +48% on one activity of the main workflow,
 *   which would have made a nominal budget bind at roughly two thirds of its stated size.
 * - `technique_fetched`, and a `resource_fetched` the response did not bundle, are what the worker
 *   went back for LAZILY. Those bytes are in no activity payload, so they count.
 * - `activity_redelivered` reports the same payload as the `activity_dispatched` event recorded by
 *   the same call, so counting both would charge one delivery twice.
 */
export function deliveredChars(state: SessionFile, scope: string): number {
  let total = 0;
  for (const event of state.history ?? []) {
    const data = event.data as { agentId?: string; chars?: number; delivery?: string; bundled?: boolean } | undefined;
    if (!data || data.agentId !== scope || typeof data.chars !== 'number') continue;
    if (data.delivery === 'unchanged') continue;
    switch (event.type) {
      case 'activity_dispatched':
        // The recorded size is what the response actually carried, so a resume that collapsed to
        // markers is already charged at its collapsed size.
        total += data.chars;
        break;
      case 'technique_fetched':
        total += data.chars;
        break;
      case 'resource_fetched':
        // `bundled` marks a body the activity response carried, already counted above.
        if (data.bundled !== true) total += data.chars;
        break;
      default:
        break;
    }
  }
  return total;
}

/**
 * The bound in force for a caller declaring `contextTokens`, under the server's batch policy.
 * `charsPerToken` is the same token→character factor eager bundling converts with.
 */
export function batchBound(
  contextTokens: number,
  policy: { headroomFraction: number; maxActivities: number; charsPerToken: number },
): BatchBound {
  return {
    // A cap below one still admits the activity a dispatch was made for: one activity to a worker is
    // batching switched off, which is what an operator setting zero means.
    maxActivities: Math.max(1, Math.floor(policy.maxActivities)),
    // Floored, so the budget reported to the caller and recorded on a refusal is the same integer the
    // comparison applies rather than one up to a character larger.
    budgetChars: Math.floor(contextTokens * policy.headroomFraction * policy.charsPerToken),
  };
}

/**
 * Why this scope may not take `activityId` as the next activity of its batch, if it may not.
 *
 * `undefined` means deliver. A scope that is the session's own agent, or that is arriving for an
 * activity it already holds, or whose batch is still inside both limits, all read as deliver.
 */
export function batchRefusal(
  state: SessionFile,
  scope: string,
  activityId: string,
  bound: BatchBound,
): BatchRefusal | undefined {
  if (scope === state.agentId) return undefined;
  const activities = batchActivities(state, scope);
  if (activities.includes(activityId)) return undefined;
  if (activities.length === 0) return undefined;

  const chars = deliveredChars(state, scope);
  const refusal = { activities: activities.length, chars, bound };
  if (activities.length >= bound.maxActivities) return { limit: 'activity_cap', ...refusal };
  if (chars > bound.budgetChars) return { limit: 'delivery_budget', ...refusal };
  return undefined;
}

/** What the refused caller is told, and what the recorded event carries as its reason. */
export function batchRefusalMessage(activityId: string, scope: string, refusal: BatchRefusal): string {
  const cause = refusal.limit === 'activity_cap'
    ? `it has already taken ${refusal.activities} activit${refusal.activities === 1 ? 'y' : 'ies'}, `
      + `which is the cap of ${refusal.bound.maxActivities} per worker context`
    : `${refusal.chars} characters have been delivered to it, over the batch budget of `
      + `${refusal.bound.budgetChars} characters for its declared context window`;
  return `Batch full: context '${scope}' cannot take '${activityId}' because ${cause}. `
    + 'Report this activity as needing its own dispatch and stop. The replacement must be a NEW '
    + `agent_id — the bound is keyed on the identity, so re-dispatching under '${scope}' is refused `
    + 'again, and a fresh context under a used identity would receive markers for content it does '
    + 'not hold. A new identity takes full delivery and re-crosses any answered gate silently.';
}

/**
 * Append one `batch_refused` event to a session draft (call inside an `advanceSession` mutator), so
 * the runs that hit each limit are countable and the starting settings can be revised from them.
 *
 * Once per scope, activity and limit. A caller that retries a refused activity is refused again, and
 * a tally that counted retries would report how insistent a worker was rather than how often a limit
 * bound — which is the figure the settings are revised from. Idempotent in the same shape as
 * `appendStepStartedIfAbsent`.
 */
export function recordBatchRefusal(
  draft: SessionFile,
  opts: { scope: string; activityId: string; refusal: BatchRefusal },
): void {
  const already = (draft.history ?? []).some((e) => {
    if (e.type !== 'batch_refused' || e.activity !== opts.activityId) return false;
    const data = e.data as { agentId?: string; limit?: string } | undefined;
    return data?.agentId === opts.scope && data.limit === opts.refusal.limit;
  });
  if (already) return;
  draft.history.push({
    timestamp: new Date().toISOString(),
    type: 'batch_refused',
    activity: opts.activityId,
    data: {
      agentId: opts.scope,
      limit: opts.refusal.limit,
      activities: opts.refusal.activities,
      chars: opts.refusal.chars,
      maxActivities: opts.refusal.bound.maxActivities,
      budgetChars: opts.refusal.bound.budgetChars,
    },
  });
}
