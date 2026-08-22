/**
 * Normalize a walk into a stable, diffable manifest. This is the unit of the
 * baseline: committed on the technique branch and compared — both as a
 * regression guard here and retroactively against a legacy (main) run — to
 * classify what the migration changed. The non-deterministic sessionIndex and
 * the full variable bag (derivable from checkpoint effects) are deliberately
 * excluded so diffs are meaningful.
 *
 * `gatesReadUnbound` is the exception to that exclusion, and it is here because
 * omitting it hid a defect: a step skipped for want of a decision looks exactly
 * like a step correctly gated out, since both are simply absent from
 * `stepsExecuted`. Recording which variable each skipped gate had nothing to
 * read puts the reason in the artifact (#469).
 *
 * `lazyGates` is the server's own reading of the same question, taken at delivery
 * against the real bag rather than reconstructed here: how many gated technique
 * steps it left lazy because this activity produces the variable (`pending`),
 * because nothing on the path so far has written it (`unbound`), or because the
 * expression does not parse (`unparsed`). The two are worth having side by side —
 * one is what the walk could see, the other what the server saw (#472).
 */
import type { WalkResult } from './walker.js';

export interface StepSnapshot {
  activity: string;
  checkpoints: Array<{ id: string; option: string; setVariable?: Record<string, unknown> }>;
  artifacts: string[];
  artifactsWritten: string[];
  stepsExecuted: string[];
  gatesReadUnbound: string[];
  lazyGates?: { pending: number; unbound: number; unparsed: number };
  manifestStatus?: string;
  orphanCheckpoints: string[];
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
      artifactsWritten: s.artifactsWritten,
      stepsExecuted: s.stepsExecuted,
      gatesReadUnbound: [...new Set(s.gatesReadUnbound)].sort(),
      lazyGates: s.lazyGates,
      manifestStatus: s.manifestStatus,
      orphanCheckpoints: [...s.orphanCheckpoints].sort(),
      unresolved: [...s.unresolved].sort(),
      next: s.nextActivity,
    })),
  };
}
