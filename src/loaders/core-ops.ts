/**
 * Core operations bundled into get_workflow and get_activity responses.
 *
 * The orchestrator and worker roles each have a baseline set of operations they
 * always need (engine glue: dispatching activities, walking transitions,
 * yielding checkpoints, persisting state). These were previously delivered via
 * role-based skills loaded by get_skill / get_skills. Under the operation-focused
 * model, get_workflow returns the union of (workflow.skill_operations + core
 * orchestrator ops), and get_activity returns the union of
 * (activity.skill_operations + core worker ops).
 *
 * Operations live in the meta workflow's capability skills (workflow-engine,
 * agent-conduct, state-management, version-control). The lists below name the
 * specific operation refs that constitute the runtime baseline.
 */

/**
 * Operations every orchestrator needs at the workflow level. Returned by
 * get_workflow alongside the workflow's declared skill_operations.
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
  // Cross-cutting orchestrator rules
  'agent-conduct::orchestrator-discipline',
  'agent-conduct::checkpoint-discipline',
  'agent-conduct::operational-discipline',
  // Session token mechanics
  'session-protocol::token-passes-on-each-call',
  'session-protocol::use-most-recent-token',
  'session-protocol::checkpoint-handle-distinct-from-session',
  // State persistence
  'state-management::persist',
  'state-management::persist-after-every-activity',
];

/**
 * Operations every activity worker needs at the activity level. Returned by
 * get_activity alongside the activity's declared skill_operations.
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
  // Session token mechanics
  'session-protocol::token-passes-on-each-call',
  'session-protocol::use-most-recent-token',
  'session-protocol::resume-checkpoint-uses-handle',
];
