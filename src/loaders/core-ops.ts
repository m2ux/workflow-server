/**
 * Core technique refs bundled into get_workflow and get_activity responses.
 *
 * The orchestrator and worker roles each have a baseline set of techniques they
 * always need (session/token mechanics, state persistence, engine traversal,
 * checkpoint flow). get_workflow returns the union of the workflow's declared
 * technique refs and the core orchestrator techniques; get_activity returns the
 * union of the activity's declared technique refs and the core worker techniques.
 *
 * These techniques live in the meta workflow's capability techniques
 * (workflow-engine, agent-conduct, orchestrator-conduct, worker-conduct). The lists
 * below name the core technique refs that constitute the runtime baseline.
 *
 * Conduct is the engine's baseline rather than a workflow's choice, so both lists
 * name it and no workflow declares it. `agent-conduct` binds every agent and is in
 * both; each role's own file specialises it and is in that role's list alone.
 */

/**
 * Technique refs every orchestrator needs at the workflow level. Returned by
 * get_workflow alongside the workflow's declared technique refs.
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
  // Progress Status writer (#324 B2). Both dispatch-activity and
  // commit-and-persist say "Apply sync-progress-status", but get_technique
  // resolves only step-bound or first-declared techniques and orchestrators are
  // barred from get_activity — so without this entry the named op has no
  // delivery path and every Progress write is hand-rolled from the resource.
  'workflow-engine::sync-progress-status',
  // Sub-agent dispatch primitives — dispatch-activity invokes spawn-agent in
  // its body, so the orchestrator must receive the harness-specific prose for
  // these to actually dispatch instead of improvising / inlining.
  'harness-compat::spawn-agent',
  'harness-compat::continue-agent',
  // The two hops spawn-agent/continue-agent Apply mid-Protocol: the kind → file
  // map, then the resolved harness file's `spawn`/`resume`/`concurrent` Rules
  // section. A technique named inside another technique's Protocol has no other
  // delivery path — get_technique resolves only step-bound or first-declared
  // techniques, and no tool loads a technique by id — so an orchestrator without
  // these entries reaches the dispatch step with nothing to apply and improvises
  // the invocation. All four harness files ship because nothing binds
  // `{harness_kind}` server-side; the orchestrator selects its own through the
  // map, which stays the single authoritative table.
  'harness-compat::resolve-harness-operation',
  'harness-compat::claude-code',
  'harness-compat::cursor',
  'harness-compat::cline',
  'harness-compat::generic',
  // Conduct: the boundaries every agent is held to, then the orchestrator's specialisation of
  // them. `worker-conduct` is absent — an orchestrator produces no domain artifacts, so its
  // writing rules are not an orchestrator's to honour.
  'agent-conduct',
  'orchestrator-conduct',
];

/**
 * Technique refs every activity worker needs at the activity level. Returned by
 * get_activity alongside the activity's declared technique refs.
 */
export const CORE_WORKER_TECHNIQUES: readonly string[] = [
  // The role itself. Every worker stub says to apply it, and only the meta workflow declares it in
  // `techniques.activity` — so for a client workflow it was named and never delivered, with no tool
  // able to fetch it by id. A worker that cannot read its own role reads none of the rules it owes.
  'workflow-engine::activity-worker',
  // Step execution surface
  'workflow-engine::yield-checkpoint',
  'workflow-engine::resume-from-checkpoint',
  'workflow-engine::finalize-activity',
  // Conduct: the boundaries every agent is held to, then the worker's specialisation of them.
  // `orchestrator-conduct` is absent — a worker cannot dispatch, advance an activity or resolve a
  // gate, so those boundaries reach an agent with no way to honour or breach them.
  'agent-conduct',
  'worker-conduct',
];
