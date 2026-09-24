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
 * The fan's own operations, delivered to an orchestrator whose workflow graph actually fans an exit
 * rather than to every orchestrator. None is core: a workflow with no fanning exit can never reach
 * any of them, and together they cost several thousand characters of what an orchestrator receives
 * before its first decision. `get_workflow` adds them where the graph in the same response shows a
 * fan, so the procedure and the routing that needs it arrive together.
 *
 * The three `fan::` operations are the steps the activity loop takes on a fanning exit — open every
 * branch, spawn them together, retire them in order. Their shared rules ride in on the group
 * contract each of them sits beneath.
 *
 * `spawn-concurrent` is here because `spawn-branches` applies it mid-Protocol, and a technique named
 * inside another technique's Protocol has no other delivery path — `get_technique` resolves only
 * step-bound or first-declared techniques, and no tool loads a technique by id. Without it the
 * orchestrator reaches the spawn step holding the instruction to emit the batch in one turn and
 * nothing that says what a batch is.
 */
export const FAN_DISPATCH_TECHNIQUES: readonly string[] = [
  'fan::enter-fan',
  'fan::spawn-branches',
  'fan::retire-branch',
  'harness-compat::spawn-concurrent',
];

/**
 * Technique refs every orchestrator needs at the workflow level. Returned by `get_workflow`
 * alongside the workflow's declared technique refs.
 *
 * The order is the reading order: the operations every dispatch applies lead, then the ones a run
 * applies at its own boundaries, then the ones a particular run may never reach at all.
 */
export const CORE_ORCHESTRATOR_TECHNIQUES: readonly string[] = [
  // Every dispatch. compose-prompt and spawn-agent are invoked inline by dispatch-activity's body,
  // and an inline ref is not re-resolved, so each needs its own entry to reach the orchestrator at
  // all; without them it reaches the dispatch step with nothing to apply and improvises.
  'workflow-engine::dispatch-activity',
  'workflow-engine::compose-prompt',
  'harness-compat::spawn-agent',
  'harness-compat::continue-agent',
  // The kind → file map spawn-agent and continue-agent apply mid-Protocol. All four harness files
  // ship because nothing binds `{harness_kind}` server-side; the orchestrator selects its own
  // through the map, which stays the single authoritative table.
  'harness-compat::resolve-harness-operation',
  'harness-compat::claude-code',
  // Every activity boundary.
  'workflow-engine::evaluate-transition',
  'workflow-engine::commit-and-persist',
  // The Progress Status writer both dispatch-activity and commit-and-persist name (#324 B2).
  'workflow-engine::sync-progress-status',
  // State persistence: commit-and-persist invokes these inline (same inline-ref caveat), so bundle
  // them so the orchestrator gets the worktree, regular-file, and submodule commit protocols.
  'git::identify-path-type',
  'git::commit-regular-files',
  'git::commit-worktree',
  'git::commit-submodule',
  // Conduct: the boundaries every agent is held to, then the orchestrator's specialisation of
  // them. `worker-conduct` is absent — an orchestrator produces no domain artifacts, so its
  // writing rules are not an orchestrator's to honour. The bodies are a capability line apiece;
  // what binds is their rules.
  'agent-conduct',
  'orchestrator-conduct',
  // What a particular run may never reach: a child workflow it never launches, and the three
  // harness files that are not the one it runs under.
  'workflow-engine::handle-sub-workflow',
  'harness-compat::cursor',
  'harness-compat::cline',
  'harness-compat::generic',
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
  // Step execution surface. The checkpoint pair is in WORKER_CHECKPOINT_TECHNIQUES, added by
  // `get_activity` where the activity holds a gate.
  'workflow-engine::finalize-activity',
  // The language every step is read in: what a gate expression means, and how many times a loop
  // body runs. A worker evaluates both — the server evaluates no gate — so the semantics ride with
  // the role that applies them. `loop-control` is in LOOP_ONLY_RULES, held back from a run whose
  // activities hold no loop.
  'workflow-engine::step-control',
  // How a step's bound operation meets the variable bag: the input precedence, and whether a
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
 * The checkpoint operations, delivered where a gate is reachable.
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

export const ORCHESTRATOR_CHECKPOINT_TECHNIQUES: readonly string[] = [
  'workflow-engine::present-checkpoint-to-user',
  'workflow-engine::respond-checkpoint',
];

/**
 * Rules that govern an activity only where the graph runs it as a branch of a fan, by the ref the
 * bundle resolves them under.
 *
 * A rule arrives with the whole file it is declared in, so an operation that is otherwise wanted
 * carries these to every activity — including the ones whose exits fan onto nothing, where the
 * rule describes a position in the graph the activity never occupies. Named here, they are held
 * back from those, on the same terms `FAN_DISPATCH_TECHNIQUES` is held back from a workflow whose
 * graph fans nothing.
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
 * Every operation a session's role contracts can name.
 *
 * The union of both roles' sets, because one session serves both and a `get_technique` call does
 * not say which it speaks for. This is the set a by-id fetch admits: derived from the definitions
 * the run is already walking, so an id names an operation of its own contract or nothing at all —
 * nothing here reaches a file neither role would have been sent.
 */
export function contractOperations(refs: {
  workflowTechniques?: readonly string[] | undefined;
  activityTechniques?: readonly string[] | undefined;
  activityOwnTechniques?: readonly string[] | undefined;
}): Set<string> {
  return new Set([
    ...CORE_ORCHESTRATOR_TECHNIQUES,
    ...CORE_WORKER_TECHNIQUES,
    ...WORKER_CHECKPOINT_TECHNIQUES,
    ...ORCHESTRATOR_CHECKPOINT_TECHNIQUES,
    ...FAN_DISPATCH_TECHNIQUES,
    ...(refs.workflowTechniques ?? []),
    ...(refs.activityTechniques ?? []),
    ...(refs.activityOwnTechniques ?? []),
  ]);
}
