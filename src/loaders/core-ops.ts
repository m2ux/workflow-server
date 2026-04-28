/**
 * Core operations bundled into get_workflow and get_activity responses.
 *
 * The orchestrator and worker roles each have a baseline set of operations they
 * always need (session/token mechanics, state persistence, engine traversal,
 * checkpoint flow). Under the operation-focused model, get_workflow returns the
 * union of (workflow.operations + core orchestrator ops), and get_activity
 * returns the union of (activity.operations + core worker ops).
 *
 * Operations live in the meta workflow's capability skills (workflow-engine,
 * agent-conduct). The lists below name the specific operation refs that
 * constitute the runtime baseline.
 */

/**
 * Operations every orchestrator needs at the workflow level. Returned by
 * get_workflow alongside the workflow's declared operations.
 */
export const CORE_ORCHESTRATOR_OPS: readonly string[] = [
  // Engine traversal
  'workflow-engine::dispatch-activity',
  'workflow-engine::evaluate-transition',
  'workflow-engine::commit-and-persist',
  'workflow-engine::handle-sub-workflow',
  // Checkpoint flow at orchestrator level
  'workflow-engine::present-checkpoint-to-user',
  'workflow-engine::respond-checkpoint',
  'workflow-engine::bubble-checkpoint-up',
  // State persistence
  'workflow-engine::persist',
  // Sub-agent dispatch primitives — dispatch-activity invokes spawn-agent in
  // its body, so the orchestrator must receive the harness-specific prose for
  // these to actually dispatch instead of improvising / inlining.
  'harness-compat::spawn-agent',
  'harness-compat::continue-agent',
  // Cross-cutting orchestrator rules
  'agent-conduct::orchestrator-discipline',
  'agent-conduct::checkpoint-discipline',
  'agent-conduct::operational-discipline',
];

/**
 * Operations every activity worker needs at the activity level. Returned by
 * get_activity alongside the activity's declared operations.
 */
export const CORE_WORKER_OPS: readonly string[] = [
  // Step execution surface
  'workflow-engine::yield-checkpoint',
  'workflow-engine::resume-from-checkpoint',
  'workflow-engine::finalize-activity',
  // Cross-cutting worker rules
  'agent-conduct::checkpoint-discipline',
  'agent-conduct::operational-discipline',
  'agent-conduct::file-sensitivity',
  'agent-conduct::code-commentary',
];
