import type { SessionFile } from '../schema/session.schema.js';

/**
 * Dispatch accounting (#353 §1.3).
 *
 * Two events measure a dispatch from opposite ends. `activity_usage` carries what one dispatch COST
 * in tokens — the orchestrator supplies it via `record_usage` as each dispatch finishes (a worker
 * cannot self-measure), one DELTA row per dispatch. `activity_dispatched` records that a dispatch
 * HAPPENED, emitted by the server when the dispatched context first reaches it: it needs no
 * orchestrator cooperation, and it counts dispatches rather than exits, so resumed workers,
 * out-of-band workers and abandoned sessions all appear.
 *
 * The fresh/resume discriminator is DERIVED, not declared — a delivery call whose scope has no prior
 * `activity_dispatched` for the activity is a fresh spawn; a repeat is that same context arriving
 * again. An out-of-band dispatch mints its own scope, so its first server call of any kind records it.
 *
 * The event also carries the delivered payload size, so `chars` on one activity's fresh and resume
 * events measures what reference delivery on the resume path saves.
 */
export type DispatchKind = 'fresh' | 'resume';

/**
 * Whether this delivery call is a dispatched context's first arrival (`fresh`) or the same context
 * arriving again (`resume`). Keyed on (scope, activity), so a retry under a NEW scope reads as fresh,
 * which is what it is — a new context that holds none of the earlier deliveries.
 */
export function dispatchKind(state: SessionFile, scope: string, activityId?: string): DispatchKind {
  return hasDispatch(state, scope, activityId) ? 'resume' : 'fresh';
}

/** Whether `scope` already has an `activity_dispatched` event (for `activityId`, or for anything). */
export function hasDispatch(state: SessionFile, scope: string, activityId?: string): boolean {
  return (state.history ?? []).some((e) =>
    e.type === 'activity_dispatched'
    && e.data?.['agentId'] === scope
    && (activityId === undefined || e.activity === activityId));
}

/**
 * Append one `activity_dispatched` event to a session draft (call inside an `advanceSession`
 * mutator). `chars` is the size of the payload this dispatch was delivered.
 */
export function recordDispatch(
  draft: SessionFile,
  opts: { scope: string; kind: DispatchKind; activityId?: string | undefined; chars?: number | undefined },
): void {
  draft.history.push({
    timestamp: new Date().toISOString(),
    type: 'activity_dispatched',
    ...(opts.activityId ? { activity: opts.activityId } : {}),
    data: {
      agentId: opts.scope,
      dispatch: opts.kind,
      ...(opts.chars === undefined ? {} : { chars: opts.chars }),
    },
  });
}
