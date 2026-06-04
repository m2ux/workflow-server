/**
 * Core operations bundled into get_workflow and get_activity responses.
 *
 * The orchestrator and worker roles each have a baseline set of operations they
 * always need (session/token mechanics, state persistence, engine traversal,
 * checkpoint flow). Under the operation-focused model, get_workflow returns the
 * union of (workflow.operations + core orchestrator ops), and get_activity
 * returns the union of (activity.operations + core worker ops).
 *
 * Operations live in the meta workflow's capability techniques (workflow-engine,
 * agent-conduct). The lists below name the specific operation refs that
 * constitute the runtime baseline.
 */

/**
 * Operations every orchestrator needs at the workflow level. Returned by
 * get_workflow alongside the workflow's declared operations.
 */
export const CORE_ORCHESTRATOR_TECHNIQUES: readonly string[] = [
  // Engine traversal
  'workflow-engine::dispatch-activity',
  'workflow-engine::evaluate-transition',
  'workflow-engine::commit-and-persist',
  'workflow-engine::handle-sub-workflow',
  // compose-prompt is invoked inline by dispatch-activity's body; inline refs are
  // not re-resolved, so it must be bundled explicitly to reach the orchestrator.
  'workflow-engine::compose-prompt',
  // Checkpoint flow at orchestrator level
  'workflow-engine::present-checkpoint-to-user',
  'workflow-engine::respond-checkpoint',
  // State persistence: commit-and-persist invokes these inline (same inline-ref
  // caveat), so bundle them so the orchestrator gets the submodule/regular-file
  // commit protocols. (The former 'persist'/'bubble-checkpoint-up' refs were
  // stale — no such op files.)
  'version-control::commit-submodule',
  'version-control::commit-regular-files',
  // Sub-agent dispatch primitives — dispatch-activity invokes spawn-agent in
  // its body, so the orchestrator must receive the harness-specific prose for
  // these to actually dispatch instead of improvising / inlining.
  'harness-compat::spawn-agent',
  'harness-compat::continue-agent',
  // Cross-cutting orchestrator rules (group-prefix refs → all `<group>-*` rules)
  'agent-conduct::orchestrator',
  'agent-conduct::checkpoint-discipline',
  'agent-conduct::operational-discipline',
];

/**
 * Operations every activity worker needs at the activity level. Returned by
 * get_activity alongside the activity's declared operations.
 */
export const CORE_WORKER_TECHNIQUES: readonly string[] = [
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
