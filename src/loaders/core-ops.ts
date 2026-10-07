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

/**
 * Technique refs every activity worker needs at the activity level. Returned by
 * get_activity alongside the activity's declared technique refs.
 */
export const CORE_WORKER_TECHNIQUES: readonly string[] = [
  // The role itself. Every worker stub says to apply it, and only the meta workflow declares it in
  // `techniques.activity` — so for a client workflow it was named and never delivered, with no tool
  // able to fetch it by id. A worker that cannot read its own role reads none of the rules it owes.
  'workflow-engine::activity-worker',
  // The envelope the role returns. `activity-worker` applies it by name from this bundle, and an
  // inline ref is not re-resolved, so it needs its own entry to arrive at all. Only the context
  // that executed the steps can say which bag keys they landed, which is why the reading lives
  // here rather than in `finalize-activity`.
  'workflow-engine::compose-steps-complete',
  // Step execution surface. The checkpoint pair is in WORKER_CHECKPOINT_TECHNIQUES, added by
  // `get_activity` where the activity holds a gate. `finalize-activity` is absent: it folds the
  // exit reading into the envelope and belongs to the `finish-activity` routine, on the side that
  // holds the graph. An activity binding it as a step takes it through step bundling.
  //
  // The language every step is read in: what a gate expression means, and how many times a loop
  // body runs. A worker evaluates both — the server evaluates no gate — so the semantics ride with
  // the role that applies them. `loop-control` is in LOOP_ONLY_RULES, held back from a run whose
  // activities hold no loop.
  'workflow-engine::step-control',
  // How a step's bound technique meets the variable bag: the input precedence, and whether a
  // string names a variable or is one. Engine mechanics rather than a workflow's choice, on the
  // same terms as conduct below.
  'variable-binding',
  // Conduct: the boundaries every agent is held to, then the worker's specialisation of them.
  // `orchestrator-conduct` is absent — a worker cannot dispatch, advance an activity or resolve a
  // gate, so those boundaries reach an agent with no way to honour or breach them.
  'agent-conduct',
  'worker-conduct',
];

/**
 * The checkpoint techniques, delivered where a gate is reachable.
 *
 * Two lists rather than one, because the two roles meet a gate from opposite sides: a worker
 * pauses at one, an orchestrator puts it in front of the user and resolves it. Both are held out
 * of the core lists above and added by the delivery that can see whether the run declares a
 * checkpoint at all — and both stay fetchable by id, which is what makes leaving them out safe:
 * a worker may raise a decision its activity never declared, and then asks for the protocol.
 */
export const WORKER_CHECKPOINT_TECHNIQUES: readonly string[] = [
  'workflow-engine::yield-checkpoint',
  'workflow-engine::resume-from-checkpoint',
];

/**
 * Rules that govern an activity only where the graph runs it as a branch of a fan, by the ref the
 * bundle resolves them under.
 *
 * A rule arrives with the whole file it is declared in, so a technique that is otherwise wanted
 * carries these to every activity — including the ones whose exits fan onto nothing, where the
 * rule describes a position in the graph the activity never occupies. Named here, they are held
 * back from those.
 */
export const FAN_ONLY_RULES: readonly string[] = [
  'variable-binding::a-branch-lands-under-its-own-derived-key',
];

/**
 * Rules that govern an activity only where one of its steps is a loop, by the ref the bundle
 * resolves them under.
 *
 * Held back on the same terms as `FAN_ONLY_RULES`: the gate and condition rules beside this one in
 * `step-control` are owed to every worker, and the loop half describes a step kind most activities
 * never hold. The cut is read over the whole run, as the gate and fan readings are, so the rules
 * list a worker receives does not differ between the activities of one walk.
 *
 * Worker-side alone, because `step-control` reaches the worker list and no other. An orchestrator
 * evaluates the `when` on an activity's exits with no delivered definition of that dialect; #868
 * settles which construct carries it there, the whole technique being too large for the fixed
 * block an orchestrator reads before its first decision.
 */
export const LOOP_ONLY_RULES: readonly string[] = [
  'workflow-engine::step-control::loop-control',
];

/**
 * Every technique a session's role contracts can name.
 *
 * The union of both roles' sets, because one session serves both and a `get_technique` call does
 * not say which it speaks for. This is the set a by-id fetch admits: derived from the definitions
 * the run is already walking, so an id names a technique of its own contract or nothing at all —
 * nothing here reaches a file neither role would have been sent.
 */
export function contractOperations(refs: {
  workflowTechniques?: readonly string[] | undefined;
  activityTechniques?: readonly string[] | undefined;
  activityOwnTechniques?: readonly string[] | undefined;
}): Set<string> {
  return new Set([
    ...CORE_WORKER_TECHNIQUES,
    ...WORKER_CHECKPOINT_TECHNIQUES,
    ...(refs.workflowTechniques ?? []),
    ...(refs.activityTechniques ?? []),
    ...(refs.activityOwnTechniques ?? []),
  ]);
}
