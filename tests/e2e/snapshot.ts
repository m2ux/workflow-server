/**
 * Normalize a walk into a stable, diffable manifest. This is the unit of the
 * baseline: committed on the technique branch and compared — both as a
 * regression guard here and retroactively against a legacy (main) run — to
 * classify what the migration changed. The non-deterministic sessionIndex and
 * the full variable bag (derivable from checkpoint effects) are deliberately
 * excluded so diffs are meaningful.
 */
import type { WalkResult } from './walker.js';

export interface StepSnapshot {
  activity: string;
  checkpoints: Array<{ id: string; option: string; setVariable?: Record<string, unknown> }>;
  artifacts: string[];
  unresolved: string[];
  next: string | null;
}

export interface WalkSnapshot {
  workflowId: string;
  policy: string;
  initialActivity: string;
  finalStatus: string;
  path: string[];
  orchestratorUnresolved: string[];
  steps: StepSnapshot[];
}

export function snapshotWalk(w: WalkResult): WalkSnapshot {
  return {
    workflowId: w.workflowId,
    policy: w.policy,
    initialActivity: w.initialActivity,
    finalStatus: w.finalStatus,
    path: w.path,
    orchestratorUnresolved: [...w.orchestratorUnresolved].sort(),
    steps: w.steps.map(s => ({
      activity: s.activityId,
      checkpoints: s.checkpoints.map(c => ({ id: c.checkpointId, option: c.optionId, setVariable: c.setVariable })),
      artifacts: s.artifacts,
      unresolved: [...s.unresolved].sort(),
      next: s.nextActivity,
    })),
  };
}
