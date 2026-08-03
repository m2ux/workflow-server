import type { SessionFile } from '../schema/session.schema.js';

/**
 * The batch bound (#407) — see `docs/dispatch_model.md` for the model and
 * `DEFAULT_BATCH_HEADROOM_FRACTION` in `src/config.ts` for the measurements behind the settings.
 *
 * A batch is not declared: it IS the run of activities one delivery scope takes delivery of, derived
 * from session history, so the server needs no cooperation to see one. Bounded by a cumulative
 * character budget and a cap on distinct activities.
 *
 * Two carve-outs are load-bearing. A scope equal to the session's own agent is exempt, owning the
 * whole walk by construction. And an activity the scope already holds is always served — that is a
 * worker resuming after a gate, and refusing it would end every batch at its first gate.
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
    // No size means no activity payload was delivered — a context announcing itself on a technique
    // or resource fetch. Counting it would spend a slot on an activity never delivered.
    if (typeof data.chars !== 'number') continue;
    const activity = event.activity;
    if (typeof activity !== 'string' || seen.includes(activity)) continue;
    seen.push(activity);
  }
  return seen;
}

/**
 * Characters delivered in full to `scope`, counted once each. Collapsed content cost the receiving
 * context nothing, so it does not draw down the budget.
 *
 * What already contains what is the whole difficulty. `activity_dispatched.chars` is the size of the
 * whole `get_activity` response, so every eagerly bundled technique and resource is inside it
 * already; their own events exist for observability and are not added again. What counts on top is
 * only what the worker went back for lazily. `activity_redelivered` reports the payload its
 * `activity_dispatched` event already carried.
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
    // One activity to a worker is batching switched off, which is what setting zero means.
    maxActivities: Math.max(1, Math.floor(policy.maxActivities)),
    // Floored so the reported and recorded budget is the integer the comparison applies.
    budgetChars: Math.floor(contextTokens * policy.headroomFraction * policy.charsPerToken),
  };
}

/**
 * The one home for the comparison, asked from both sides — whether to hand the next activity over,
 * and whether the worker should come back for one. Expressed twice, the two drift at the boundary.
 */
function withinBatchBound(activities: number, chars: number, bound: BatchBound): boolean {
  return activities < bound.maxActivities && chars <= bound.budgetChars;
}

/**
 * Whether `scope` may take a further activity, as of what it has been delivered. Answered before the
 * lazy fetches of the activity just taken draw down the same budget, so `true` can still become a
 * refusal at the next boundary.
 */
export function batchMayContinue(state: SessionFile, scope: string, bound: BatchBound): boolean {
  if (scope === state.agentId) return true;
  const activities = batchActivities(state, scope).length;
  // No activity taken yet is no batch to be past the end of — the reading the refusal takes too.
  if (activities === 0) return true;
  return withinBatchBound(activities, deliveredChars(state, scope), bound);
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
  if (withinBatchBound(activities.length, chars, bound)) return undefined;

  // Past the bound: which limit to name, since the recorded tally is read per limit.
  const refusal = { activities: activities.length, chars, bound };
  if (activities.length >= bound.maxActivities) return { limit: 'activity_cap', ...refusal };
  return { limit: 'delivery_budget', ...refusal };
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
 * the runs that hit each limit are countable and the settings can be revised from them.
 *
 * Once per scope, activity and limit: a retry is refused again, and counting retries would report how
 * insistent a worker was rather than how often a limit bound.
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
