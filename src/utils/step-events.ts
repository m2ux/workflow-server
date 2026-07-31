import type { SessionFile } from '../schema/session.schema.js';

/**
 * Hybrid step_started (RE-8): earliest server-known start for a step-bound
 * technique delivery. Idempotent per (activity, stepId, agentId).
 */
export function appendStepStartedIfAbsent(
  draft: SessionFile,
  opts: { activity: string; stepId: string; agentId: string; timestamp: string },
): void {
  const { activity, stepId, agentId, timestamp } = opts;
  const already = (draft.history ?? []).some(e =>
    e.type === 'step_started'
    && e.activity === activity
    && e.data?.['stepId'] === stepId
    && e.data?.['agentId'] === agentId,
  );
  if (already) return;
  draft.history.push({
    timestamp,
    type: 'step_started',
    activity,
    data: { stepId, agentId },
  });
}
