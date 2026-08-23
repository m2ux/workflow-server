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
 * (workflow-engine, agent-conduct). The lists below name the core technique refs
 * that constitute the runtime baseline.
 *
 * **What these lists no longer have to carry.** An entry existed here whenever a
 * technique was named inside another technique's protocol, because a reference
 * found during resolution reached the agent as prose it could not follow. Both
 * bundle doors now deliver the bodies those references name, on the same
 * operations-bundle channel these entries ride, so an entry whose only reason was
 * standing in for an inline reference is redundant where the closure reaches it.
 *
 * Retirement is per door and verified rather than assumed: for each list, the
 * reduced list's closure was measured and every retired entry still arrives as a
 * folded body, with no body lost against the full list. The orchestrator list goes
 * from 20 entries to 12 and still delivers 21 bodies; the worker list goes from 8
 * to 5 and still delivers 6. What stays is stated at each residue comment, because
 * an entry that stays is a door still owed something.
 */

/**
 * Technique refs every orchestrator needs at the workflow level. Returned by
 * get_workflow alongside the workflow's declared technique refs.
 */
export const CORE_ORCHESTRATOR_TECHNIQUES: readonly string[] = [
  // Engine traversal. These are the entries the orchestrator reaches first, so no
  // other entry's closure reaches them and each has to be named.
  'workflow-engine::dispatch-activity',
  'workflow-engine::commit-and-persist',
  'workflow-engine::handle-sub-workflow',
  // Checkpoint flow at orchestrator level — reached from the orchestrator's own
  // protocol rather than from another entry, so likewise named.
  'workflow-engine::present-checkpoint-to-user',
  'workflow-engine::respond-checkpoint',
  // RESIDUE: the four harness files stay, and the door they are owed by is the one
  // that cannot follow their reference. `resolve-harness-operation` names its callee
  // through the kind → file map rather than through a link, so the callee is chosen
  // by a value and no link-keyed traversal reaches it. All four ship because nothing
  // binds `{harness_kind}` server-side; the orchestrator selects its own through the
  // map, which stays the single authoritative table. These retire when a delivery
  // path follows a value-named callee, not before.
  'harness-compat::claude-code',
  'harness-compat::cursor',
  'harness-compat::cline',
  'harness-compat::generic',
  // Cross-cutting orchestrator rules (group-prefix refs → all `<group>-*` rules).
  // A rule reference names no body, so folded delivery never stands in for one.
  'agent-conduct::orchestrator',
  'agent-conduct::checkpoint-discipline',
  'agent-conduct::operational-discipline',
];

/**
 * Technique refs every activity worker needs at the activity level. Returned by
 * get_activity alongside the activity's declared technique refs.
 */
export const CORE_WORKER_TECHNIQUES: readonly string[] = [
  // The role itself. Every worker stub says to apply it, and only the meta workflow declares it in
  // `techniques.activity` — so for a client workflow it was named and never delivered, with no tool
  // able to fetch it by id. A worker that cannot read its own role reads none of the rules it owes.
  // It is also the root the worker's own closure is walked from, so nothing else reaches it.
  'workflow-engine::activity-worker',
  // RESIDUE: cross-cutting worker rules. A rule reference names no body, so folded
  // delivery never stands in for one and these stay however wide the closure grows.
  'agent-conduct::checkpoint-discipline',
  'agent-conduct::operational-discipline',
  'agent-conduct::file-sensitivity',
  'agent-conduct::code-commentary',
];
