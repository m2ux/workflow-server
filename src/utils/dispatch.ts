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
 * The fresh/resume discriminator is DERIVED, not declared — a delivery call from a scope the server
 * has never met is a fresh spawn; a call from a scope it has met is that same context arriving again.
 * An out-of-band dispatch mints its own scope, so its first server call of any kind records it.
 *
 * The event also carries the delivered payload size, so `chars` on one activity's fresh and resume
 * events measures what reference delivery on the resume path saves.
 */
export type DispatchKind = 'fresh' | 'resume';

/**
 * Whether this delivery call is a dispatched context's first arrival (`fresh`) or a context the
 * server has already met arriving again (`resume`). Keyed on the scope alone, so the discriminator
 * names the two states the delivery ledger has: `fresh` is an empty ledger taking full delivery,
 * `resume` is prior deliveries to collapse. A context that walks on to a second activity is still
 * that same context, and a retry under a NEW scope reads as fresh, which is what it is.
 */
export function dispatchKind(state: SessionFile, scope: string): DispatchKind {
  return hasDispatch(state, scope) ? 'resume' : 'fresh';
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

/**
 * The scope that last took delivery of `activityId` under some OTHER identity, if any.
 *
 * A worker that pauses at a gate keeps its context, so a resume that arrives under a new identity is
 * a context the server has never met asking for content another context is already holding. That
 * reads as an ordinary first delivery from every angle except this one: the same activity, delivered
 * whole, twice, in one session.
 */
export function priorDeliveryScope(state: SessionFile, scope: string, activityId: string): string | undefined {
  const prior = (state.history ?? []).filter((e) =>
    e.type === 'activity_dispatched'
    && e.activity === activityId
    && typeof e.data?.['agentId'] === 'string'
    && e.data['agentId'] !== scope);
  return prior.length ? (prior[prior.length - 1]!.data!['agentId'] as string) : undefined;
}

/**
 * Append one `activity_redelivered` event to a session draft (call inside an `advanceSession`
 * mutator). `chars` is what the second delivery cost, so the waste is summable from the ledger.
 * A genuine worker replacement records the same event — both are worth seeing.
 */
export function recordRedelivery(
  draft: SessionFile,
  opts: { scope: string; priorScope: string; activityId: string; chars: number },
): void {
  draft.history.push({
    timestamp: new Date().toISOString(),
    type: 'activity_redelivered',
    activity: opts.activityId,
    data: { agentId: opts.scope, priorAgentId: opts.priorScope, chars: opts.chars },
  });
}
