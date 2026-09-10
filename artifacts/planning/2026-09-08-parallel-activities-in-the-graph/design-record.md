# Design record
Three independent designs, two judge panels. The specification is synthesised from the winner with the runners-up grafted in; this file is what did not make the cut and why.

## Derived fan: one union in the graph, a history-derived frontier, one namespacing wrap

### schema change

ONE UNION IN ONE FILE. The fan's agreement rules go in the function that already owns graph-versus-activity agreement.

(1) src/schema/workflow.schema.ts replaces lines 45-52:

  /**
   * Exit bindings: activity id -> exit id -> destination. A destination names one activity, or
   * lists several - a list runs its activities together, one worker to each, and the run enters
   * the single activity all of their exits name once the last of them returns, so the barrier is
   * read off the bindings the graph already carries. A destination of TERMINAL_SENTINEL ends the
   * run without landing on an activity. Every exit every activity in the workflow declares is
   * bound here; an unbound exit, an unknown exit and an unknown destination each fail the load,
   * so the graph and the activities cannot drift apart.
   */
  export const DestinationSchema = z.union(
    [z.string(), z.array(z.string()).min(2)],
    { errorMap: () => ({ message: 'a destination names one activity, or lists at least two that run together' }) },
  );
  export type Destination = z.infer<typeof DestinationSchema>;
  export const GraphSchema = z.record(z.record(DestinationSchema));
  export type Graph = z.infer<typeof GraphSchema>;

The errorMap is load-bearing: formatZodIssues (src/loaders/workflow-loader.ts:42) renders one line per issue, and an invalid_union issue without it renders only 'Invalid input'. With it a one-element list, a nested list or a number all render 'graph.plan-prepare.done: a destination names one activity, or lists at least two that run together'. The minimum-two rule stays in the schema (Encode Constraints as Structure) rather than being restated in the loader, which would give it a second home.

(2) The graph describe (line 67) gains one sentence in third position: 'An exit whose destination lists several activities runs them together - each carries its own worker and lands its outputs under its own branch key, and the run enters the single activity all of their exits name once the last of them returns.'

(3) Four derivations move into the same file, beside GraphSchema, because everything decidable from a destination alone is the schema's own business (Single Responsibility, SOLID at the Definition Layer). TERMINAL_SENTINEL moves here from src/loaders/workflow-loader.ts:584 so the derivations can reject a terminal branch without the loader importing back into the variables module; its four import sites (src/utils/validation.ts:6, src/tools/workflow-tools.ts:11, tests/workflow-loader.test.ts:12, tests/e2e/walker.ts:22) are repointed rather than re-exported, per the repo's no-compatibility-layer rule.

  export const TERMINAL_SENTINEL = '__terminal__';
  export const isFan = (d: Destination): d is string[] => Array.isArray(d);
  export const destinationTargets = (d: Destination): string[] => (Array.isArray(d) ? d : [d]);
  export interface FanGroup { from: string; exit: string; branches: string[]; join: string | undefined }
  export function fanGroups(workflow: Workflow): FanGroup[]
  export function fanMemberIndex(workflow: Workflow): Map<string, FanGroup>
  export const branchKey = (activityId: string): string => activityId.split('-').join('_') + '_outputs';

fanGroups reads the graph object alone: for each list-valued destination it collects the branches and computes join as the single activity every branch's own bindings agree on, or undefined when they disagree. It performs no activity lookup, so the loader keeps sole ownership of agreement with the activities and the join has exactly one derivation - the loader validates against it, activityGraph models it, and the next_activity handler routes on it (One Authoritative Home).

(4) GENERATED JSON. schemas/workflow.schema.json:384-393, produced by npm run build:schemas (scripts/generate-schemas.ts:25, never hand-edited), becomes:

  "graph": { "type": "object", "additionalProperties": { "type": "object", "additionalProperties": {
    "anyOf": [ { "type": "string" }, { "type": "array", "items": { "type": "string" }, "minItems": 2 } ] } },
    "description": "The workflow's shape: ..." }

items is non-empty, so tests/generated-schemas.test.ts:44-49 stays green. paramRows (scripts/generate-site-data.ts:498-517) never recurses into additionalProperties, so site/api/schemas.html:277 renders only the widened graph description via npm run build:site.

(5) LOAD-TIME CHECKS. All of them join validateExitBindings (src/loaders/workflow-loader.ts:520-572) as a third loop after the per-activity loop that populates `declared`, inside the same errors array, so a malformed fan is one load failure alongside the others rather than a second mechanism. That function is called at :366 after fragment materialization, so a checkpoint reached by ref is visible, and a non-empty return fails the load at :367 - the file's own reason at :514-515 is that a session cannot be walked through a graph with a hole in it. Every check is decidable from the graph object plus the materialized activities the function already holds. The existing destination-existence check at :565 is the only edit to standing code: it iterates destinationTargets(destination) instead of testing the raw value, keeping its message per target.

  a. unknown branch - 'Workflow graph sends plan-prepare.done to research, which this workflow does not contain.'
  b. duplicate branch - 'Workflow graph fans plan-prepare.done to research twice; a branch is dispatched once, so name each activity of a fan once.'
  c. terminal branch - 'Workflow graph fans plan-prepare.done to __terminal__. A branch returns to the activity its own exits name, so a branch that ends the run leaves the fan with nothing to converge on.'
  d. branch is the source - 'Workflow graph fans plan-prepare.done to plan-prepare, its own source. A fan is dispatched from the activity that names its branches, so the source is not one of them.'
  e. branch binds no exit - 'Workflow graph fans plan-prepare.done to research, which binds no exit. Every branch returns to the destination its own exits name, so a branch with no destination leaves the fan unable to converge.'
  f. convergence - 'Workflow graph fans plan-prepare.done to [research, codebase-comprehension, implementation-analysis], whose exits name different destinations: research -> assumptions-review; codebase-comprehension -> plan-review. The branches of a fan rejoin at one activity, and that activity is what the run enters when the last branch returns; bind every exit of every branch to the same destination.'
  g. self-loop in a branch - 'Workflow graph fans plan-prepare.done to research, whose exit insufficient returns to research. A branch runs once and returns to the join, so a retry belongs inside the branch as a loop step rather than as an exit back onto it.' (Stating f without a self-exclusion clause is what buys this: the runtime then has no re-enter-self case to answer, and one advance per activity stays intact.)
  h. nested fan - 'Workflow graph fans plan-prepare.done to research, whose exit done fans in turn. A branch runs in one worker and returns to the join, so its exits name one destination each.'
  i. gate in a branch - 'Workflow graph fans plan-prepare.done to research, which declares checkpoint research-convergence. A session holds one active checkpoint and every tool is gated while it is held, so a gate inside a fan stops its sibling branches; the decision belongs to the activity before the fan or to the activity it converges on.' Uses activityCheckpoints(activity), already imported and used at :544, which walks flattenActivitySteps so loop bodies count.
  j. branch key legality and uniqueness - 'Workflow graph fans plan-prepare.done to 2nd-pass, whose branch key 2nd_pass_outputs is not a legal variable name. A branch lands its outputs under a key derived from its activity id, so an activity that runs in a fan carries an id of lowercase letters, digits and hyphens beginning with a letter.' Checked against VariableNameSchema (src/schema/variable.schema.ts:6-9); a second message covers two members whose keys collide.

Corpus impact of the widening: zero. The pinned corpus at 5f92dc06 carries 207 graph edges, none list-valued, so every workflow parses byte-identically, and checks a-j are vacuous until a fan is authored.

### dispatch mechanism

THE FAN EXECUTES INSIDE ONE ITERATION OF THE EXISTING DRIVE LOOP, THROUGH ONE NEW OPERATION, WITH NO N-NESS IN ANY WHEN GATE.

The binding constraint is the when dialect (src/schema/activity.schema.ts:74-75): equality, comparison, bare truthiness, not, and, or, parentheses. No list test, no length, no indexing. So the loop keeps carrying one in-flight thing, and N-ness lives inside one step.

BIND SITE. workflows/meta/activities/03-dispatch-client-workflow.yaml, and only there. It is the one activity whose steps the top-level agent executes inline (workflows/meta/activities/README.md:45), which is why it can already bind dispatch-activity, whose step 4 spawns. Every binding site of orchestration-patterns::dispatch-workers is a client activity run by a dispatched worker, and spawn-agent.md:44-46 depth-1-only states that a spawned agent has no dispatch primitive and that parallel scatter is available only at the orchestrator, closing with the sentence that sanctions this design in advance: hoist a pass there when its fan-out is worth an orchestrator-owned step.

DRIVE-LOOP EDITS, in document order inside the loop body:

  1. continue-batched-worker (:42-52) - unchanged. Its gate needs worker_result.next_activity_id truthy, and a fan origin's envelope carries next_activity_ids instead, so it is false without being re-authored.
  2. NEW dispatch-fan, kind: technique, when: current_branches != null, binding workflow-engine::dispatch-fan with branch_activities: current_branches, session_index: client_session_index, agent_technique: workflow-engine::activity-worker, state: variables, planning_folder_path: planning_folder_path. Placed here so the fan and its join both run in one iteration.
  3. NEW close-fan, kind: action, when: join_activity != null, four ordered sets: current_activity = '{join_activity}', current_branches = null, join_activity = null, worker_result = null. release-spent-worker (:103-109) is the precedent for a control set to null. Clearing worker_result is what stops the origin's stale envelope being read as this iteration's by the steps below.
  4. dispatch-activity (:53-62) - gate becomes '!worker_agent_id && current_activity != null'. Required: during a fan iteration current_activity is null until close-fan runs, and a null activity must not be dispatched.
  5. The checkpoint trio, commit-activity-artifacts and release-spent-worker - unchanged. dispatch-fan writes no worker_result, and close-fan nulls it, so all of them are inert on a fan iteration with nothing re-authored; dispatch-fan owns commit, accounting and identity release for its branches.
  6. advance-activity (:96-102) - one step, two conditional set actions (action.condition is already read at src/utils/activity-variables.ts:459): set current_activity = '{worker_result.next_activity_id}' when worker_result.next_activity_ids == null, and set current_branches = '{worker_result.next_activity_ids}' when it != null. Neither is a projection of the other (not AP-112 no-derived-state-shadow): they are the two shapes exit_destinations[exit] can take, and exactly one is ever populated because finalize-activity copies whichever shape it read.
  7. continueWhile (:35-39) becomes the compound 'current_activity != null || current_branches != null', keeping the existing null exit (:117-119) and record-client-completion (:110-116) intact.

current_branches and join_activity need no variable declaration, because current_activity has none either - they are engine scratch names, invisible to check-activity-variables for the same reason (a production no declaration mentions lands in produces only, and undeclared-crossing needs a consumer in another activity).

NEW OPERATION workflows/meta/techniques/workflow-engine/dispatch-fan.md.

Capability: Dispatch every branch of a graph fan in one turn, one worker to a branch, and return the destination they converge on.

Inputs: branch_activities (the activity ids the exit fans to, in graph order); session_index; agent_technique (default workflow-engine::activity-worker); state; planning_folder_path (optional).

Outputs: branch_results (each branch's envelope, in input order); join_activity (the destination the barrier named); trace_tokens (the tokens this dispatch accumulated, one per next_activity call that returned one).

Protocol:
  1. Progress in-progress: apply sync-progress-status once per branch for the dispatch moment in Progress Status call sites, then ONE version-control::commit-regular-files naming the planning README alone, with a message stating which activities are entering progress. The branches spawn in one turn, so one commit publishes every mark, and dispatch-mark-reaches-the-remote fixes the window as before. Skip when planning_folder_path is unset.
  2. Mint one identity per branch, distinct from each other and from the session's own agent id.
  3. For each branch in input order call next_activity { session_index, activity_id: branch, dispatch_agent_id: that branch's identity }. On the FIRST of these calls also pass the exiting activity's exit, step_manifest, variables_changed, artifacts_produced and agent_id - the origin retires exactly once, and the first branch enter is the call that retires it. Capture _meta.trace_token on each and append it to trace_tokens, and capture _meta.fan.branch_key for each branch.
  4. Compose one stub per branch via compose-prompt with agent_technique, holds_prior_deliveries: false, and state plus that branch's activity_id and its identity as agent_id.
  5. Apply harness-compat::spawn-concurrent with all stubs as one batch.
  6. For each returned envelope in input order: reject a non-envelope per reject-partial-worker-result; apply commit-and-persist for that branch; call next_activity { session_index, activity_id: join, exit, step_manifest, variables_changed, artifacts_produced, agent_id: that branch's identity }; record usage. _meta.barrier reports the branches still outstanding, and names the destination on the last return - that is join_activity.
  7. Return branch_results and join_activity.

  Recovery bullets: a branch that returns no envelope, or one not accepted, is re-dispatched alone under a NEW identity via spawn-agent, and a single-form next_activity { activity_id: that branch, dispatch_agent_id: new identity } rebinds the live branch to it without retiring it. One replacement per branch; a second failure applies sync-progress-status for the blocked moment on that branch's rows and stops, leaving the branch in flight so a later resume derives the same barrier. The liveness test that chooses between a replacement and continue-agent is made PER BRANCH against the returned batch: in a concurrent turn every branch has returned something by the time the turn resumes, and an agent stays addressable by id after returning (harness-compat/claude-code.md:19).

Rules: one-identity-per-branch (the ledger and the batch bound are both keyed on the identity, and a scope equal to the session's own agent is exempt from the bound at src/utils/batch.ts:154, so a branch under it would be unbounded). branch-takes-one-activity (a branch's only destination is the join, which is not a branch's to enter, so batch_may_continue on a branch envelope is ignored and every branch identity is released at the barrier). branch-is-gate-free (a fan branch reaches no gate; the load rejects a declared one and yield_checkpoint refuses an undeclared one). fan-persists-per-branch-then-once (engineering artifacts commit per branch at its return; the source tree commits once at the barrier, attributed to the fan's origin, because three branch workers share one working tree and git status cannot tell their changes apart). The operation CITES and does not restate account-every-activity, delivery-keys-on-agent-context, reject-partial-worker-result, resolve-trace-at-close-out, no-domain-work and depth-1-only.

CHANGED OPERATIONS. finalize-activity.md gains output next_activity_ids beside next_activity_id (:58-61): the branch activities when the exit taken fans, absent otherwise, exactly one of the two populated. evaluate-transition.md:18 states that a destination may list the activities an exit fans to, and step 4 reports the list as next_activity_ids. dispatch-activity.md dispatch-topology (:88-90) names the fan route, delivery-keys-on-agent-context (:100-102) states that a fan's branches are N fresh contexts each taking full delivery, and step 3's mint (:54) notes that a fan mints before the enter so the enter can bind branch to identity. orchestrator-conduct.md no-domain-work (:12-14) names dispatch-fan as a delegation route beside dispatch-activity, and one-level-of-indirection (:16-18) states the invariant positively so width is not read as depth.

DELIVERY. src/loaders/core-ops.ts CORE_ORCHESTRATOR_TECHNIQUES gains workflow-engine::dispatch-fan and harness-compat::spawn-concurrent, and meta/workflow.yaml techniques.workflow (:12-18) gains dispatch-fan. The comment at core-ops.ts:47-65 is the mechanism: a technique named inside another technique's Protocol has no other delivery path, so an orchestrator without the entry reaches the step with nothing to apply and improvises the invocation.

THE BARRIER, AND WHY THE WAIT IS FREE. The wait is the turn boundary. harness-compat/claude-code.md:26-27 concurrent: emit multiple Agent calls in a single response turn, the harness executes them in parallel, and wait until every agent yields or completes before treating the batch as finished; TECHNIQUE.md:23-30 foreground-always makes the blocking-equivalent wait a contract; spawn-concurrent.md:34 collects results in input order. The turn does not resume until every tool result returns, so joining N envelopes costs nothing and needs no scheduler. Single entry into the destination is the server's: next_activity refuses to enter any activity while a branch of an open fan has not returned, and the refusal is derived from fanGroups plus the session's own activity_entered and activity_exited events - so it survives a crashed orchestrator, which re-derives the same barrier from session.json rather than remembering to wait (Encode Constraints as Structure).

### namespacing

THE BRANCH KEY IS DERIVED FROM THE ACTIVITY ID, AND THE SERVER DOES THE WRAPPING.

DERIVATION. branchKey(id) = the id with every hyphen replaced by an underscore, plus the suffix _outputs. research -> research_outputs; codebase-comprehension -> codebase_comprehension_outputs; implementation-analysis -> implementation_analysis_outputs.

Derived rather than declared per branch in the graph, for three structural reasons. A graph-declared key is a second name for the branch that has to be kept in agreement with the activity id, and two fans could spell one activity's key differently (One Authoritative Home). It is unknowable to a worker, since worker-control-plane-ban (activity-worker.md:62-64) bars get_workflow, so a declared key would have to travel as per-dispatch data the envelope contract does not carry. And a derived key cannot be mistyped, so the agreement between a fan and its destination's declared reads is mechanical (Encode Constraints as Structure).

The suffix makes the derivation total. VariableNameSchema (src/schema/variable.schema.ts:6-9) requires QUALIFIED_DATA_ID_PATTERN (src/schema/identifiers.ts:16) - snake_case with at least two words - or a listed exemption. codebase_comprehension passes bare; research does not, and would need an EXEMPT_DATA_IDS entry for every single-word fanned activity id. With the suffix, every kebab id of one word or many yields a legal name and no exemption list grows. Hyphens are excluded because the bag-name grammar in variable-binding.md:18 excludes them and snake-case-symbols requires snake for any symbol binding to session state.

WHERE THE WRAP HAPPENS. In the server, inside the branch-return next_activity call, immediately before applyVariableWrites (src/tools/workflow-tools.ts:804-810). The worker reports bare names, exactly as finalize-activity.md:72 already specifies. The handler already loads the workflow at :720, so it derives the fan from fanMemberIndex, wraps that branch's whole variables_changed map into one object, and lands it under the key.

Not the worker: an operation's Outputs state what a value IS, never which graph position produced it (Separate Contract from Procedure, and generic-not-overfit at variable-binding.md:43). A worker that namespaced its own outputs would rename every landed output by call site, and deriveActivityContract (src/utils/activity-variables.ts:430-440) reads writes off the composed signature and the step remap target and knows nothing about graph position, so the derived contract of every fanned activity would disagree with its declaration.

Not the orchestrator: it can see the fan, since get_workflow returns graph verbatim (workflow-tools.ts:663), but then no-bare-writes is a habit rather than a structure. applyVariableWrites skips both the declared-type and the value-set check when declarations.get(name) misses (src/utils/variable-seed.ts:76-92), so an unwrapped relay lands ten shared names flat and two branches clobber each other in total silence.

THE MECHANISM. applyVariableWrites takes one new optional field on its ctx: under?: string. With it set, the per-name validation loop runs unchanged against the declarations the caller supplied - which for a branch return is the branch activity's OWN variables.writes, read straight off getActivity(workflow, branchActivity) - and the commit becomes one flat assignment of the whole map under the key, with each variable_set event carrying data.name as key.member so the event stream says where the value landed. The flat assignment at variable-seed.ts:93 is exactly the whole-object landing a dotted read needs (variable-binding.md:20-21). Every member's declared type and value set therefore keeps its warn-only check, including context_scope's three-value set.

Two other write paths out of an activity are not wrappable: yield_checkpoint applies variables_changed at bare names (workflow-tools.ts:1739-1744) and respond_checkpoint applies a setVariable effect at bare names (:2071-2077), both keyed on the single activeCheckpoint.activityId. The gate-free-branch rule closes both, so next_activity is the only path a branch has and it is wrapped - Prefer Removing the Thing That Needs a Prohibition rather than a second wrapping rule for the checkpoint channel.

Inside a branch, names stay bare: a later step reads an earlier step's output as an internalRead (activity-variables.ts:374-380). This is the corpus's own isolation-then-combine rule (workflows/meta/techniques/scatter-gather.md:30-32 - per-instance outputs are never auto-bound into the parent bag by scalar name, and combination happens exclusively in the combine phase) raised to graph grain: a fanned activity is the work unit, its branch key is the isolated slot, and the destination's gather step is the delegated combine. scatter-gather.md gains the graph fan as a third scatter mode over the same combine contract; one-gather-contract-two-scatter-modes says the combine is mode-independent, and it is.

DOWNSTREAM READ FORM. Two forms, both already in the schema. In a when, condition, message or template: {research_outputs.open_assumptions} - the structured-condition evaluator walks the dotted path into the landed object (variable-binding.md:21). In a step binding input: the bare dotted rename research_outputs.open_assumptions, which is a rename reference because the bag-name grammar at variable-binding.md:18 admits dotted paths and the value resolves in the bag. No new deviation form.

THE GATHER STEP, as authored on the destination:

  - kind: technique
    id: gather-branch-assumptions
    technique:
      name: review-assumptions::reconcile
      inputs:
        research_assumptions: research_outputs.open_assumptions
        analysis_assumptions: implementation_analysis_outputs.open_assumptions

with the destination declaring variables.reads of research_outputs and implementation_analysis_outputs and variables.writes of the combined name the operation produces. There is no merge policy anywhere: the destination either names every branch key it needs or it does not run.

RE-VISIT RULE, stated positively: a branch key holds the outputs of the most recent visit to its activity, because applyVariableWrites assigns and never merges. A destination that needs an earlier visit's values gathers them into a name of its own at that visit.

GUARD CHANGES, precisely.

  1. src/utils/activity-variables.ts:543, activityGraph - Object.values(bindings) becomes Object.values(bindings).flatMap(destinationTargets) before the Set. Without this, graph.has(array) is false at :608 so no branch head is ever reachable, and predecessors.get(array) is undefined so ?.push no-ops at :597, sources.length === 0 short-circuits at :633, and incoming(branchHead) stays at universe - the definite-assignment check is not wrong for a branch, it is disabled, silently, in a guard the registry calls hard zero (scripts/check-activity-variables.ts:25).
  2. unreachableReads (:574-671) takes one new optional arg, fans: Array<{ branches: string[]; join: string }>. Two edits inside. The predecessor index (:595-598) drops every branch-to-join edge that belongs to a fan. The meet (:632-637) computes arrivals instead of predecessors: each fan contributing to this node is ONE arrival whose set is the UNION of its live branches' outgoing, each remaining plain predecessor is its own arrival, and the arrivals intersect - control still comes by exactly one arrival. The candidate seed moves from outgoing(sources[0]) to arrivals[0], or a union arrival's extra names are never candidates. Dropping the branch edges is what stops the intersection wiping the union straight back out. Termination is unaffected: outgoing is monotone non-increasing, a union and an intersection of non-increasing sets are non-increasing, so the fixed point over the same powerset lattice still exists. The existing intersection is right for the 9 alternative routes converging on prism::generate-report and wrong for a barrier, where all branches ran.
  3. mergeActivityVariables (:112-149) takes fanned: ReadonlyMap<string, string> (member id -> key) from its caller at src/loaders/workflow-loader.ts:350, and for a fanned activity contributes ONE declaration { name: key, type: 'object', description: 'Outputs of the research activity, landed as one object because the graph fans it: every value it reports lands under this key, and a later activity reads research_outputs.<output>.' } INSTEAD of that activity's own write declarations. Instead, not as well: contributing both would let a destination read a bare member name and have the guard bless a name that never lands. Contribution stays per workflow, which is required - the same activity keeps contributing flat in a workflow whose graph does not fan it.
  4. deriveActivityContract (:352-484) takes branchKey?: string; when set it adds the key to writes (nothing derives a container write from a step) and leaves produces, producedSoFar and internalReads bare, so intra-activity reads and the member grain both survive.
  5. Line 422 - if (!bound.includes('{')) read(bound) becomes read(bagName(bound)), and a new DerivedContract.pathReads collects the full dotted reference from the same site and from tokenReads. Today a bare dotted rename is dropped from reads entirely: read() narrows on namespace.has of the whole string. Pre-existing, and load-bearing once every gather is dotted.
  6. src/utils/binding-provenance.ts:275-276 - TOKEN_RE and EXACT_TOKEN_RE admit a dotted tail and resolve on the head, the grammar activity-variables.ts:213-218 already uses. Otherwise resolveInputSource (:304-310) reports a gather binding as a resolved template with no head provenance, so a nonexistent branch key is silent on the provenance side too.
  7. scripts/check-activity-variables.ts - for a fanned record F with key K: declaredWrites gains [K, the synthesized declaration] so writersOf and the reachability writes map carry it; the write-side undeclared-use and unused-declaration families compare F's YAML writes against derived.produces (bare) while every other family uses derived.writes; unread-write over F's members is replaced by member-grain families. Three new families: ungathered-branch-output (F produces a member no activity gathers as K.member, exemptions for artifactWrites, engineInputs and workflow prose applied to the qualified form); fan-member-not-produced (an activity reads K.member and F produces no member - the mistyped gather, invisible today because a name no declaration mentions is invisible on both sides, as the guard says at :150-156); fan-shadowed-write (F produces a name declared elsewhere in the workflow, whose value now lands under K and never reaches that declaration).
  8. scripts/check-review-mode-gating.ts:87 and :139-145 - its own Graph alias takes the widened destination, or imports it, and reviewSuccessors flattens before pushing. It parses raw YAML at :190, so it is the one graph reader the loader's fan checks cannot protect: unflattened, activities.get(array) is undefined at :156 and every checkpoint inside a fan branch stops being audited for a consequential review-mode auto-advance.

### enforcement

One row per invariant: WHAT - WHERE - WHAT IT REPORTS.

1. A fan destination names at least two activities. Zod DestinationSchema union with min(2) and an errorMap; load failure. Reports 'graph.plan-prepare.done: a destination names one activity, or lists at least two that run together'.
2. Every branch is an activity this workflow contains. validateExitBindings, widened existing check at workflow-loader.ts:565, per target; load failure with the existing wording.
3. No branch is named twice. validateExitBindings; load failure naming the fan and the repeated branch.
4. No branch is TERMINAL_SENTINEL. validateExitBindings; load failure stating that a branch that ends the run leaves nothing to converge on.
5. No branch is the fan's own source. validateExitBindings; load failure.
6. Every exit of every branch names one and the same activity - the derived join. validateExitBindings, against fanGroups; load failure rendering each branch's disagreeing destination.
7. No branch binds zero exits. validateExitBindings; load failure stating the fan has no destination to converge on.
8. No branch's own destination is itself a list. validateExitBindings; load failure (nested fans are a stated non-goal, and without this check 6's comparison is ambiguous).
9. No branch routes an exit back onto itself. validateExitBindings; load failure telling the author to make the retry a loop step. This is what leaves the runtime with no re-enter-self case, so one-advance-per-activity needs no amendment.
10. No branch declares a checkpoint step. validateExitBindings via activityCheckpoints, after fragment materialization; load failure naming the checkpoint. A session holds one activeCheckpoint (src/schema/session.schema.ts:105) and assertNoActiveCheckpoint (src/utils/session/params.ts:62-70) gates every authenticated tool except respond and present, so one gating branch blocks its siblings' get_activity, get_technique and get_resource - and with progressive-step-technique-load most branches fetch lazily mid-activity. The orchestrator cannot resolve it either: spawn-concurrent is one turn, and the turn does not resume until every branch's tool result returns. Zero gates is therefore the honest rule, and having it at load leaves no operator arbitration to design (Prefer Removing the Thing That Needs a Prohibition).
11. Every branch key is a legal variable name, and unique in the workflow. validateExitBindings against VariableNameSchema; load failure telling the author to rename the activity.
12. No undeclared gate from inside a fan. yield_checkpoint refuses when openActivities(state) is non-empty, before it reads the checkpoint definition. Reports that the activities are running together as a fan, that the session holds one active checkpoint gating every tool, and that the branch should complete and report through an exit it declares. This is the dynamic half check 10 cannot see: yield_checkpoint admits a decision no definition mentions when the call carries message and two options (workflow-tools.ts:1663-1679).
13. The destination is entered once, after the last branch returns. next_activity refuses an enter of anything but an open fan's branches or its join while a branch is in flight. Reports 'Cannot enter implement: the fan at plan-prepare.done still has [codebase-comprehension, implementation-analysis] in flight. The run enters assumptions-review once every branch has returned, and nothing else until then.' Derived from fanGroups plus activity_entered and activity_exited, so a resumed orchestrator re-derives it.
14. A branch is entered only from its fan's origin. next_activity refusal naming the fan, its origin and where the session actually is.
15. Each branch carries its own identity, distinct from its siblings and from the session's own agent id. next_activity refusal on dispatch_agent_id. Reports that the delivery ledger and the batch bound are both keyed on the identity, so two branches under one identity receive markers for content neither holds - and that a branch under the session's own agent is exempt from the bound (src/utils/batch.ts:154).
16. A call that reports or claims a branch names its scope. next_activity refuses when a fan is open and the caller's scope holds no open branch, listing the in-flight activities; get_activity refuses the same way, telling the caller to pass the agent_id the branch was dispatched to. This closes the hazard get_technique already warns about at src/tools/resource-tools.ts:653-661 - a step id resolving against a session pointer any context can move.
17. A branch's outputs land under its branch key. next_activity wraps before applyVariableWrites, derived from the graph. Structural because it is the only path: the gate ban removes the two checkpoint write channels, so no bare branch write is expressible.
18. Every member of a branch's map matches its declared type and value set. applyVariableWrites with ctx.under, validating against the branch activity's own variables.writes; warn-only, through _meta.validation, as every variable write is today.
19. Every branch key some fan writes is declared by its destination and read there. check-activity-variables unwritten-read and unused-declaration, over the synthesized container declaration; hard zero.
20. Every member a gather names is one its branch produces. check-activity-variables fan-member-not-produced; hard zero.
21. Every member a branch produces is gathered by someone. check-activity-variables ungathered-branch-output; hard zero.
22. A branch does not produce a name declared elsewhere in the workflow. check-activity-variables fan-shadowed-write; hard zero.
23. No two branches of one fan write one artifact bare filename. check-activity-variables fan-artifact-collision, from the composed signatures readSignature already reads (activity-variables.ts:310-320); token-free filenames only. Reports that write-artifact is keyed on the bare filename with a find-or-update and a re-scan mint guard (write-artifact.md:36-41), so two concurrent branches both re-scan, both create, and the run thereafter updates the lowest-numbered instance. This one is NOT structural: it needs composed technique signatures, which the loader does not compose. A fan authored and run without the guard can mint duplicate artifact instances.
24. A read at the join is satisfied on every arrival. unreachableReads with the fan-aware meet; hard zero. Unchanged, this reports a false entry finding for every branch-scoped read at the join, which an author would fix by moving declarations.
25. Activities reachable only through a fan are walked. activityGraph flatten, plus check-review-mode-gating's own flatten; hard zero and the review-mode audit respectively.
26. The in-progress mark for every branch reaches the remote before the spawn. dispatch-fan Protocol step 1, one commit for all branches; the progress_published event recorded by next_activity is the only lasting evidence. NOT structural, and no more so than for any single dispatch today.
27. Every branch carries exactly one usage entry. dispatch-fan Protocol step 6 citing account-every-activity; visible afterwards as activities_without_usage (workflow-tools.ts:475), which lists a branch that reported nothing. NOT structural.
28. One source-tree commit at the barrier, per-branch commits confined to engineering artifacts. dispatch-fan rule fan-persists-per-branch-then-once. NOT structural: commit-and-persist derives its paths from git status over one working tree (commit-and-persist.md step 4), which cannot tell two branches' changes apart. A fan whose branches are read-only on the source tree makes the question moot, which is what the analysis activities a fan is for should be.

### staged plan

STAGE 0 - PREREQUISITE, NOT MINE. Issue 655: serialise the read-modify-write of session.json per session (compare-and-swap on seq with retry, or a per-session write lock). What this design needs from it, in one line: the concurrent history appends N branch contexts make - activity_dispatched, technique_bundled, step_started, resource_fetched - must all survive, because the fan's frontier, the batch bound and the delivery ledger are every one of them derived from those events, and get_activity's own comment at workflow-tools.ts:1513-1516 says the reload-then-save only narrows the window. Acceptance: two concurrent get_activity calls under different agent_ids leave both dispatch events in history. Stages 1, 2 and 4 may merge before this lands; stage 3 may merge but stage 6 must not run a fan until it has.

STAGE 1 - THE UNION AND THE LOAD RULES. src/schema/workflow.schema.ts (union, describe, the four derivations, TERMINAL_SENTINEL moved with its four import sites repointed); the widened destination check and the eleven fan rules in validateExitBindings; ExitBinding.to widened with exitDestinations flattening; the compiler-caught narrowings at src/utils/validation.ts:48 and :250, workflow-tools.ts:1451, :1928, :2106 and the template at :2110 that the compiler does NOT catch; the parameter descriptions at workflow-tools.ts:698-699; npm run build:schemas and npm run build:site committed. Acceptance: the generated JSON carries the anyOf with minItems 2; check:all green on the pinned corpus with zero new findings, because all 207 edges are strings; tests/workflow-loader.test.ts gains one case per rule in the existing validateExitBindings block (:329-397), including a well-formed fan accepted; no rendered message anywhere interpolates a destination directly.

STAGE 2 - ANALYSIS CORRECTNESS. activityGraph flatten; the fan-aware arrivals meet in unreachableReads with its own unit tests over a synthetic fan fixture; mergeActivityVariables container substitution; deriveActivityContract branchKey and pathReads; the line-422 dotted-rename fix; binding-provenance dotted tails; check-review-mode-gating flatten; the four new guard families. Independently mergeable: with no fan in the corpus every change is a no-op there, which is the acceptance criterion - check:activity-variables stays hard zero and check:review-mode-gating unchanged, with the new behaviour proved by unit tests rather than by corpus movement. Also acceptance: a fixture fan where the join reads a branch key produces zero findings, and one where it reads a nonexistent member produces exactly one fan-member-not-produced.

STAGE 3 - RUNTIME. heldActivity and openActivities in src/utils/dispatch.ts; the dispatch_agent_id parameter; the four next_activity outcomes and the barrier refusal; the currentActivity rule (a fan member's enter records its identity on the event and leaves the cursor empty, so the cursor is empty for the duration of a fan and the join's ordinary dispatch retires nothing); ctx.under on applyVariableWrites; scope resolution in get_activity, get_technique, get_resource and dispatch_child; the yield_checkpoint refusal; in_flight on get_workflow_status. Independently mergeable: no definition can produce a fan yet. Acceptance: a session fixture with no agentId on any activity_entered behaves byte-identically (heldActivity undefined, every path falling through to currentActivity); one handler test per outcome and per refusal message; a fan fixture proves the branch key lands as one object and that a dotted read resolves through it.

STAGE 4 - DEFINITIONS AND CANON. dispatch-fan.md; the six drive-loop edits; next_activity_ids on finalize-activity and evaluate-transition; core-ops.ts and meta/workflow.yaml delivery entries; the amendments to dispatch-activity, orchestrator-conduct, activity-worker, continue-batch (the barrier-met answer performs no advance, so the join is reached through dispatch-activity as the second of the two paths already named at :72, and a single-form call naming a live branch rebinds rather than advances), variable-binding (the branch-scoped landing and the derivation), scatter-gather (the graph fan as the third scatter mode over one combine contract), planning-readme (the fan's dispatch and convergence moments, and that mark_progress_na is one value per persist so no two branches may set it), commit-and-persist, write-artifact's mint-attempt guard stated as an invariant rather than as a race it handles, schema-construct-inventory's Graph row plus a fan row voiced so it does not collide with the within-activity fan-out row at :38, schemas/README.md:283 and :660-689, docs/dispatch-model.md with the measured premium (232,954 characters standalone against 159,093 batched for three activities, plus three context establishments where :62 puts the establishment saving at two to four times the collapsing saving), and activities/README.md:45. Acceptance: check:refs, check:audience, check:fragments and validate-workflow-yaml green; version bumps on every edited definition; a grep finds no surviving description of a single-destination graph.

STAGE 5 - TEST TOOLING. tests/e2e/walker.ts Graph alias, pickExit and pickNext, advanceToUnvisited and the enumerator's target set and visits bookkeeping; scripts/smoke/smoke-orchestrator.ts:241 and :375-391. A fan is one transition decision over a set: enter each branch under its own agent_id, return each, enter the join once. Must merge BEFORE any corpus fan, or the walk sends an array as activity_id, the tool's z.string() rejects, and expect(walkErrors).toEqual([]) fails the coverage job. Acceptance: a fixture-workflow fan walks end to end under WF_OPTION_COVERAGE=1.

STAGE 6 - CORPUS ADOPTION, and it is not a one-line graph edit. Landing plan-prepare.done as [research, codebase-comprehension, implementation-analysis] converging on assumptions-review requires, in the workflows submodule: removing the four gate sites and their record bindings from 04-research.yaml (research-convergence at :106, context-scope-declaration at :190, the assumption-interview ref at :222 and research-assumption-decision at :242) and the two from 05-implementation-analysis.yaml (:124, :143), whose assumption interview assumptions-review already runs over the same open_assumptions; removing comprehension-sufficient from 15-codebase-comprehension.yaml (:127-157) and giving its deep-dive loop a non-gate continuation; collapsing codebase-comprehension's four exits (needs-elicitation, research-needed, skip-optional-activities, comprehension-complete, at workflow.yaml:219-223) and research's own routing so every exit of every branch names assumptions-review, since today the chain is codebase-comprehension then research then implementation-analysis then plan-prepare; and resolving the assumptions-log.md collision between research and implementation-analysis, which the new fan-artifact-collision family reports. This is a definition redesign with its own review, and it is where the fan first runs, so it must follow stage 0. Commit shape: one commit in the workflows submodule plus the pointer bump in the server repo, in the same PR; option-coverage.json re-recorded with npm run baseline:stamp in the same commit, since expectStampFresh fails otherwise; DRY_WALKS re-measured from 50 against the widened fork tree, because a short streak is reported as unreached options rather than as a too-small budget. Note that a workflows-branch sweep runs main tooling and stays red until the paired server PR merges, so verify locally and re-run it afterwards. Acceptance: the workflow loads; the walker drives the fan; check:all green with the pointer bumped; one recorded run shows three branch usage entries and a join entry, and the barrier refusal appearing in no log.

### not adding

NO NEW SESSION FIELD. No frontier array, no per-branch cursor, no barrier record. The in-flight set is DERIVED from the event log - activity_entered carrying data.agentId, minus activity_exited - which is the derivation src/utils/batch.ts:9-10 already states as its model: a batch is not declared, it IS the run of activities one delivery scope takes delivery of, derived from session history, so the server needs no cooperation to see one. HistoryEntry.data is z.record(z.unknown()).optional() (src/schema/state.schema.ts:89), so carrying agentId on activity_entered and agentId plus exit on activity_exited costs zero schema. The property this buys is worth more than the tidiness of a stored frontier: on every existing session no activity_entered carries an agentId, so heldActivity returns undefined, every reader falls through to currentActivity, and not one non-fan path changes behaviour. No migration, no dual-read window, no scalar kept beside a list.

NO NEW EVENT TYPE. activity_entered and activity_exited already mean what a branch enter and a branch return mean. A branch_opened event would be a second spelling of the first.

NO ARRAY-SHAPED activity_id, AND NO NEW TOOL. next_activity gains exactly one optional scalar, dispatch_agent_id, and the fan is entered by N ordinary calls whose fan membership the server derives from the graph it already loads at workflow-tools.ts:720. A union of string and array-of-objects on activity_id would put two call shapes on one parameter, and the array form would still need the same per-branch identity the scalar carries. N sequential calls also cost nothing: the orchestrator is one context issuing one call at a time, so record_usage and next_activity never collide - only the branch workers' delivery calls do, which is stage 0's business.

NO JOIN NODE, NO JOIN KEYWORD, NO SENTINEL EXIT TARGET, NO PER-BRANCH METADATA OBJECT. A fan is a list of activity ids and nothing else, and the barrier is read off the bindings the graph already carries. A branch declaring { activity, key } would be the second home for a key the id already determines.

NO MERGE POLICY AND NO CONFLICT GUARD. Two branches cannot collide, because each lands one object under its own key and applyVariableWrites assigns rather than merges. Nothing needs policing, so nothing polices it.

NO members FIELD ON VariableDefinition. The member declarations a branch's map is validated against are read straight off getActivity(workflow, branchActivity).variables.writes at the moment of the wrap, so the workflow-level variable schema is untouched and the runtime keeps every type and value-set warning it has today.

NO CHANGE TO src/utils/batch.ts. A branch worker never advances itself - worker-control-plane-ban bars it from next_activity - and its envelope goes to dispatch-fan, which ignores batch_may_continue and releases the identity at the barrier. Teaching batchState to answer false for a branch scope would change a value nothing acts on.

NO NEW src MODULE. The destination's derivations sit beside GraphSchema in src/schema/workflow.schema.ts (with TERMINAL_SENTINEL moved there, which is what breaks the loader-versus-activity-variables cycle without a fourth file); the two history derivations sit in src/utils/dispatch.ts, which already owns dispatchKind, hasDispatch and priorDeliveryScope - the same class of scope-keyed reading.

NO 37TH GUARD ENTRY IN scripts/guards.ts. The fan-shape rules are load failures, not findings: a graph with a malformed fan cannot be walked at all, which is why validateExitBindings fails the load rather than warning (workflow-loader.ts:513-516). A guard for them would be a second home and would let a session start on a graph the guard would have rejected. The four new families land inside check-activity-variables, whose registry claim - every read has a writer on every path - survives the change unedited.

NO WIDTH CAP ON A FAN. The per-scope batch bound does not limit width (each branch takes one activity, so activities.length is 1 and neither limit binds), but width is a cost rather than a corruption, and spawn-concurrent already degrades to sequential dispatch under parallelism-is-optimisation. A cap would be a number in the schema with no derivation behind it. The premium is documented in docs/dispatch-model.md instead.

NO NESTED FANS, NO FAN INTO A TERMINAL, NO SELF-LOOPING BRANCH, NO GATE IN A BRANCH. Each is a load failure rather than a runtime case, and each removes a whole runtime path: no inner-join ambiguity, no barrier that cannot release, no re-enter-self advance, no arbitration of one activeCheckpoint slot.

NO DEGRADED CONVERGENCE. Two returned branches out of three cannot proceed: the destination's gather either names every branch key it needs or it does not run, which is exactly the property isolation-then-combine buys. A fan that could proceed short a branch would need a merge policy to say what a missing branch means.

### residual risks

- A first-envelope-wins race on a replaced branch. A branch re-dispatched under a new identity leaves the failed identity still holding the activity by the history derivation, so if the abandoned worker returns after the replacement, whichever envelope arrives first retires the branch and the second is refused as holding no open branch. The wanted behaviour, but it means one branch's work can be discarded silently and only the trace shows which.
- Trace segments are per session, not per scope. getSegmentAndAdvanceCursor (src/trace.ts:108-114) partitions one interleaved multi-branch event stream at whatever point each branch return happens to fall, so a fan's four segments do not correspond to its four activities. The act stamp is fixed (a branch return stamps the retiring branch, not the join), but the segment contents are not separable.
- Three concurrent branch contexts share one working tree. commit-and-persist derives its paths from git status, so a per-branch source-side commit would sweep in a sibling's in-flight edits. The design confines per-branch commits to engineering artifacts and makes one source commit at the barrier, but nothing enforces that a fan's branches are read-only on the source tree, and no guard can see it.
- The artifact-filename collision check is guard-only and text-only. It compares token-free bare filenames from composed signatures; a templated name (strategic-review-{n}.md) is an intentional series and out of scope, so two branches whose templates can interpolate to the same name are not caught. A fan run without check:activity-variables can mint duplicate numbered instances that write-artifact then resolves to the lowest-numbered file for the rest of the run.
- A branch with no conforming way to say it is blocked. finalize-activity defines two envelopes and reject-partial-worker-result accepts only those two; with gates banned in a fan, a branch that genuinely needs a decision can only take a blocked or abort exit its activity declares, or return a non-envelope and route to the replacement path. This is a pre-existing gap the design makes load-bearing rather than one it creates.
- Fan cost is paid in full and is only documented. Every branch is a fresh delivery scope, so nothing collapses to a marker, and the join re-pays full delivery of everything the branches held: four fresh contexts for three activities plus a join. Against the measured 159,093 characters for three batched activities, the fan pays 232,954 plus three extra harness establishments, which dispatch-model.md:62 rates at two to four times the collapsing saving. Nothing bounds an author from fanning ten activities.
- The dotted-rename read fix changes a shared code path. Taking the head of a bare non-template binding value at activity-variables.ts:422 makes a literal containing a dot resolve on its head; read() is namespace-gated so nothing should surface, but the corpus has literal input values and the change is not fan-scoped. It needs a full check:activity-variables run to confirm zero movement.
- The synthesized container declaration changes what get_workflow renders. A fanned activity's member declarations disappear from the workflow's rendered variable set and one object-typed key appears, so an orchestrator reading the variable list no longer sees the branch's own names. Correct, and honest about where values land, but it is a visible payload change for any reader that enumerated them.
- Ambiguity refusals depend on the orchestrator passing agent_id. Every branch return and every branch enter must name its scope, and a call that omits it during an open fan is refused rather than mis-served - which is right, but it converts an orchestrator omission into a hard stop mid-fan, with the branches already spawned and their envelopes already spent.
- The corpus has no fan-ready activity today. All three candidate branches carry gates or multi-destination exits, so the capability ships dormant until stage 6's definition redesign lands, and until then the only evidence the runtime works is fixtures. A capability with no corpus instance is one whose first real use finds the remaining rough edges.

## Fan destination with a frontier cursor

### schema change

**New module `/home/mike1/projects/dev/workflow-server/src/schema/graph.ts`.** It exists because the join is *derived* and must be derived in exactly one place: `validateExitBindings` checks against it, `activityGraph` models it, and `next_activity` enforces it. It cannot live in `src/utils/activity-variables.ts` because `src/loaders/workflow-loader.ts:11` already imports `mergeActivityVariables` from there, and it needs `TERMINAL_SENTINEL`, which lives at `workflow-loader.ts:584` — a cycle either way. A schema-layer module is imported by both and imports neither (One Authoritative Home; SOLID at the Definition Layer, single responsibility).

```ts
import { z } from 'zod';

/**
 * Canonical terminal sentinel. A transition whose target is this id ends the workflow without
 * resolving to a real activity: `next_activity` accepts it, flips the session status to
 * `completed`, and the workflow stops. Use it for a terminal reached via an explicit transition
 * (a default end-of-flow link or an `abort` checkpoint option) where there is no terminal
 * activity to land on. A workflow that ends simply by having no outgoing transition
 * (terminal-by-omission) needs no sentinel. The `complete` and `end-workflow` real terminal
 * activities remain valid.
 */
export const TERMINAL_SENTINEL = '__terminal__';

/**
 * Where one exit leads. An activity id sends the run there. A list of activity ids runs those
 * activities together and enters the one activity their own exits all name, once, after the last
 * of them returns — so the barrier is the bindings the branches already carry, and the graph holds
 * no join of its own. `__terminal__` ends the run without landing on an activity.
 */
export const DestinationSchema = z.union(
  [
    z.string(),
    z.array(z.string()).min(2, 'a fan runs at least two activities together; an exit that leads to one activity names that activity'),
  ],
  { errorMap: () => ({ message: 'a destination is an activity id, a list of at least two activity ids the exit fans to, or __terminal__' }) },
);
export type Destination = z.infer<typeof DestinationSchema>;

export const GraphSchema = z.record(z.record(DestinationSchema));
export type Graph = z.infer<typeof GraphSchema>;

/** The activities one destination names — one for a plain destination, several for a fan. */
export function destinationTargets(destination: Destination): string[] {
  return typeof destination === 'string' ? [destination] : destination;
}

/** Every activity an exit map can reach, deduped and flattened. */
export function successorsOf(bindings: Record<string, Destination> | undefined): string[] {
  return [...new Set(Object.values(bindings ?? {}).flatMap(destinationTargets))];
}

export interface FanGroup {
  /** The activity whose exit fans. */
  from: string;
  /** That exit. */
  exit: string;
  /** The activities it runs together, in graph order. */
  branches: string[];
  /**
   * The activity every branch's own exits name — the derived barrier. Null where the branches
   * name different activities, name more than one each, or name none; the load rejects a null
   * join, so every reader downstream takes it as a string.
   */
  join: string | null;
}

/**
 * Every fan the graph declares, with the destination its branches converge on. A branch's onward
 * destinations, less the branch itself so an in-branch retry loop does not count, must be one
 * activity, and every branch's must be the same one. That activity is the destination.
 */
export function fanGroups(graph: Graph): FanGroup[] {
  const groups: FanGroup[] = [];
  for (const [from, bindings] of Object.entries(graph)) {
    for (const [exit, destination] of Object.entries(bindings)) {
      if (typeof destination === 'string') continue;
      const joins = new Set<string>();
      let derivable = destination.length > 0;
      for (const branch of destination) {
        const onward = new Set<string>();
        for (const dest of Object.values(graph[branch] ?? {})) {
          for (const target of destinationTargets(dest)) if (target !== branch) onward.add(target);
        }
        if (onward.size !== 1) { derivable = false; continue; }
        joins.add([...onward][0]!);
      }
      groups.push({ from, exit, branches: destination, join: derivable && joins.size === 1 ? [...joins][0]! : null });
    }
  }
  return groups;
}

/** The bag key a fan branch's outputs land under: its id in snake case, plus `_outputs`. */
export function branchKey(activityId: string): string {
  return `${activityId.replace(/-/g, '_')}_outputs`;
}
```

**`src/schema/workflow.schema.ts`.** Lines 45-52 lose their local `GraphSchema`/`Graph` and import from `./graph.js`; the four sites that imported `type Graph` or `TERMINAL_SENTINEL` from elsewhere repoint (`src/utils/validation.ts:6`, `src/tools/workflow-tools.ts:11`, `tests/workflow-loader.test.ts:12`, `tests/e2e/walker.ts:22`) rather than being served a re-export, per the repo's no-compatibility-layer rule. The `graph` field description at line 67 becomes:

```ts
  graph: GraphSchema.optional().describe('The workflow\'s shape: for each activity, where each of its exits leads. This is the single home for the routing — an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say. A destination naming one activity sends the run there. A destination naming several runs those activities together and enters the one activity their own exits all name, once, after the last of them returns — the barrier is the branches\' own bindings, so the graph carries no join of its own, and each branch\'s outputs land under a key of its own that a later activity gathers by name. `__terminal__` ends the run. Omitted only by a workflow whose activities declare no exits.'),
```

**Generated JSON shape.** Probed against the real generator (`zodToJsonSchema` with the `root` ref strategy `scripts/generate-schemas.ts:25` passes for the workflow schema), the `graph` property in `schemas/workflow.schema.json` (today lines 384-393) becomes:

```json
"graph": {
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "additionalProperties": {
      "anyOf": [
        { "type": "string" },
        { "type": "array", "items": { "type": "string" }, "minItems": 2 }
      ]
    }
  },
  "description": "<the describe text above>"
}
```

`items` is non-empty, so the empty-subschema assertion in `tests/generated-schemas.test.ts` stays green. Regenerate with `npm run build:schemas` and commit; never hand-edit. `site/api/schemas.html` picks the new description up through `npm run build:site` (`tests/site.test.ts` fails on a stale file otherwise).

**Parse-time messages** (rendered by `formatZodIssues`, `workflow-loader.ts:42`, as `graph.<activity>.<exit>: <message>`), verified empirically:

| authored | message |
|---|---|
| `done: [research]` | `a fan runs at least two activities together; an exit that leads to one activity names that activity` |
| `done: 3` | `a destination is an activity id, a list of at least two activity ids the exit fans to, or __terminal__` |
| `done: [research, 7]` | same union message |

**Load-time checks.** All of them join `validateExitBindings` (`src/loaders/workflow-loader.ts:520-572`), called at `:366` after fragment materialization and the variable merge, whose non-empty return fails the load at `:367`. The fan's rules go there and only there — a graph with a malformed fan cannot be walked, which is the file's own stated reason for failing rather than warning (`:513-516`), and a separate guard would let a session start on a graph the guard would reject.

*Change to the existing destination loop (`:561-568`).* `for (const target of destinationTargets(destination))` replaces the bare test, so the existing message applies per member:

> `Workflow graph sends 'plan-prepare.done' to 'reserch', which this workflow does not contain.`

Completeness (`:528-535`) needs no change: `bound[exit.id] !== undefined` holds for a list as it does for a string.

*New third loop*, over `fanGroups(graph)`. Per branch, report the **first** applicable defect so an author gets one message per branch rather than four; branches already reported unknown by the loop above are skipped. Then, only if every branch passed, report the convergence verdict.

1. **Duplicate branch** — `new Set(branches).size !== branches.length`:
   > `Workflow graph fans 'plan-prepare.done' to 'research' twice; a branch listed once is dispatched once.`
2. **Terminal branch** — `branch === TERMINAL_SENTINEL`:
   > `Workflow graph fans 'plan-prepare.done' to '__terminal__'; a branch that ends the run never returns, so the fan has no last branch to release its destination.`
3. **Self branch** — `branch === from`:
   > `Workflow graph fans 'plan-prepare.done' to 'plan-prepare' itself; a fan runs activities other than the one it leaves.`
4. **Branch binds no exit** — `Object.keys(graph[branch] ?? {}).length === 0`:
   > `Branch 'research' of the fan at 'plan-prepare.done' binds no exit, so the fan has no destination to converge on.`
5. **Nested fan** — some destination of `graph[branch]` is an array:
   > `Branch 'research' of the fan at 'plan-prepare.done' fans 'research.done' in turn; a branch of a fan names one destination.`
6. **Branch declares a gate** — `activityCheckpoints(activity).length > 0` (already imported and used at `:544`; it walks `flattenActivitySteps`, so a loop-body gate counts, and it runs after materialization so a `ref` fragment is resolved):
   > `Branch 'research' of the fan at 'plan-prepare.done' declares checkpoint 'research-convergence'. A session holds one active checkpoint and one gate blocks every other tool call, so a branch of a fan reaches no gate — move the gate to the activity the fan converges on.`
7. **Branch declares a starting value** — some entry of `activity.variables.writes` carries `defaultValue`:
   > `Branch 'research' of the fan at 'plan-prepare.done' declares a starting value for 'has_open_assumptions'. A branch's outputs land under 'research_outputs', so the starting value would seed a name nothing writes — declare it on the workflow file, or drop the starting value.`
8. **Branch names more than one destination** — `onward.size > 1` and not already caught by (5):
   > `Branch 'research' of the fan at 'plan-prepare.done' sends its exits to 'assumptions-review' and 'plan-prepare'; a branch binds every exit to the one activity the fan converges on, apart from an exit that retries the branch itself.`
9. **Convergence** — every branch passed but `join === null` because the singletons differ:
   > `Branch 'research' of the fan at 'plan-prepare.done' converges on 'assumptions-review' and branch 'codebase-comprehension' converges on 'implementation-analysis'; every branch of a fan binds its exits to the one activity they converge on, which is the destination the run enters once the last branch returns.`

Rules 6 and 7 are Encode Constraints as Structure applied to two hazards that would otherwise need runtime prohibitions; with them at the load, Prefer Removing the Thing That Needs a Prohibition holds — there is no gate-arbitration policy and no dead-seed cleanup anywhere in the runner.

**No width cap.** Deliberately: a number with no measurement behind it is speculative configuration, and the graph author sees the whole fan in one place. The cost is stated in `docs/dispatch-model.md` instead.

**`session.exit` needs no change.** It is written at `workflow-tools.ts:842` and read nowhere in `src/`; its stated meaning — "the exit the last completed activity took" — stays true when the last completed activity is the last branch to retire.

### dispatch mechanism

**The barrier, and why the wait costs nothing.** It is realised twice, and both halves are load-bearing.

*(i) The harness turn boundary.* `harness-compat/claude-code.md:26-27`, rule `concurrent`: "Emit multiple `Agent` calls in a single response turn; the harness executes them in parallel. / Wait until every agent yields or completes before treating the batch as finished." A turn does not resume until every tool result returns, so the join of N envelopes is a fact of the turn rather than a scheduler this design writes. `spawn-concurrent.md:34` collects them "in input order" and `harness-compat/TECHNIQUE.md`'s `foreground-always` makes the blocking-equivalent wait a contract. Nothing polls, nothing times out, nothing is scheduled: the wait costs one turn that was already blocked.

*(ii) A server refusal*, because (i) is orchestrator discipline and discipline is not enforcement (Encode Constraints as Structure). `next_activity` refuses to enter any activity that a live frontier entry names as its `joinTo`, and the message names the branches still outstanding. The barrier is then derived from the exit bindings the graph already carries, and "the run enters the shared destination once, after the last branch returns" is a property of the store — a crashed and resumed orchestrator re-derives the same barrier from `session.json`.

---

**The session record: a frontier replaces the cursor.** `src/schema/session.schema.ts:99` (`currentActivity: z.string().default('')`, type at `:208`) becomes:

```ts
  /**
   * The activities in flight. One entry on an ordinary walk; several while an exit's fan is open,
   * one per branch. An entry carries the context it was dispatched to, so every delivery tool
   * answers for the activity ITS caller is executing rather than whichever activity moved a shared
   * cursor last. `joinTo` is the activity the branches of this fan converge on, read from the graph
   * at the enter; an ordinary entry carries none, and that absence is what says the entry is not a
   * branch. Empty between the last branch retiring and the destination being entered, and after
   * the run completes.
   */
  frontier: z.array(z.object({
    activity: z.string().min(1),
    /** The worker context this entry was dispatched to. Absent until a dispatch binds one. */
    agentId: z.string().min(1).optional(),
    enteredAt: z.string().datetime(),
    /** The activity every branch of this entry's fan converges on. Present only on a branch. */
    joinTo: z.string().min(1).optional(),
  })).default([]),
```

`currentActivity` is removed, not kept alongside: a scalar beside the list is the derived shadow the catalog names (`no-derived-state-shadow`), and every load-bearing reader wants "the activity this caller is in", which is the frontier. `activeCheckpoint` stays a single object, unchanged. `TOP_LEVEL_KEY_PRIORITY` (`src/utils/session/store.ts:105-126`) takes `frontier` where `currentActivity` sat; `src/utils/session/migration.ts:182,243` converts a recorded `currentActivity` into a one-entry frontier. The `currentActivity` on `WorkflowStateBaseSchema` (`src/schema/state.schema.ts:163`) and its refinement at `:183-186` are a different record, referenced nowhere outside that file, and are untouched.

**One resolver, one home** — added to `src/utils/session/resolver.ts` beside `sessionView`:

```ts
/**
 * The frontier entry a call belongs to: the sole entry when there is exactly one — every ordinary
 * walk, so a session with no fan open never reaches the identity match — and otherwise the entry
 * whose `agentId` is the calling context. Undefined where several entries are open and the call
 * names none of them: the caller refuses rather than guessing, because a guess serves one branch
 * another branch's activity.
 */
export function frontierEntry(state: SessionFile, agentId: string | undefined): FrontierEntry | undefined {
  if (state.frontier.length === 1) return state.frontier[0];
  if (!agentId) return undefined;
  return state.frontier.find((entry) => entry.agentId === agentId);
}
```

`sessionView` (`resolver.ts:96-102`) takes the calling scope and sets `act` from that entry. Every `state.currentActivity` read becomes one `frontierEntry(...)` call: `workflow-tools.ts:735,736,741,742,743,746,769,841,1027,1652,2197`, `resource-tools.ts:401,566,573,610,617,654,656,668,674,683,685,691,703,707,716,730,737,772,781,783,793,913,922`, `logging.ts:104`. `validateTechniqueFetches` (`src/utils/validation.ts:178-231`) needs no change — it already filters deliveries by `agentId` and scopes to that branch's own `activity_entered`.

The ambiguity refusal, on any delivery tool:
> `This session has 3 activities in flight (research, codebase-comprehension, implementation-analysis). Pass the agent_id your dispatch bound, so the server answers for the activity your context is executing.`

---

**`next_activity`: one new optional parameter, three outcomes.** `activity_id` stays `z.string()`. Added:

```ts
      dispatch_agent_id: z.string().min(1).optional().describe(
        'Optional. Identity of the worker context this activity is being dispatched TO — distinct from `agent_id`, which names the context that completed the activity being exited. Required for each branch of a fan, so the server can answer each branch worker for its own activity; naming a branch already in flight rebinds it to a replacement worker.',
      ),
```

The handler (`workflow-tools.ts:695-1005`) resolves in this order, and the discriminator is server state rather than a parameter shape:

1. **Resolve the caller's entry** — `frontierEntry(state, agent_id)`.
2. **Bind** — `activity_id` names a live entry that is *not* the caller's own. Bind `dispatch_agent_id` to that entry, push `activity_entered`, retire nothing, apply no `variables_changed`. This is how branches 2..N of a fan get their identities, and how a replacement worker for one failed branch gets its own — the *same* code path, so the recovery case is not a special case. Refuse when `dispatch_agent_id` is absent.
3. **Branch return** — the caller's entry carries `joinTo === activity_id`. Retire that one entry (`activity_exited`, `completedActivities`), validate `step_manifest` and the reported exit against the **branch** activity, apply that branch's `variables_changed` under its branch key attributed to the branch activity, emit one `step_completed` per manifest entry attributed to the branch, and **enter nothing**. Answer `_meta.barrier`.
4. **Advance** — anything else. Retire the caller's entry if it has one (so a self-loop still retires and re-enters as it does today), then: if the caller's activity binds any fan and `exit` names it, materialise the whole fan — one frontier entry per branch, `joinTo` from `fanGroups`, `dispatch_agent_id` bound to the *first* branch; otherwise create one entry for `activity_id`. Refuse when a live entry names `activity_id` as its `joinTo`.

The join is entered by outcome 4 with an empty frontier and nothing to retire — which is exactly the sanctioned "activity after the orchestrator released a spent batch's identity" path in `continue-batch.md:72`, so `one-advance-per-activity` holds without amendment: the barrier-met answer performs no advance, and the only advance onto the destination is `dispatch-activity`'s own.

Two refusals and one requirement:

> `Cannot enter 'assumptions-review': 1 branch of the fan that leads there has not returned (codebase-comprehension). The run enters 'assumptions-review' once, after the last branch retires.`

> `Cannot bind 'codebase-comprehension': it is in flight and this call carries no dispatch_agent_id. Name the identity the branch's worker was spawned under.`

> `Activity 'plan-prepare' binds exit 'done' to a fan, so 'exit' is required on this transition to say which destination it takes.`

`_meta.barrier` rides outcomes 2, 3 and 4-with-a-fan, one shape: `{ destination: 'assumptions-review', pending: ['codebase-comprehension'], met: false }`. On a branch return the trace payload's `act` (`:983`) takes the retiring branch activity, not `activity_id` — otherwise all three branch segments carry the destination's id.

**Three more server changes, each against a named failure.** `yield_checkpoint` (`:1642-1649`) refuses a caller whose entry carries `joinTo`; the load rule cannot see an ad-hoc gate, which `:1663-1679` admits on `message` plus two `options` with no definition mentioning it. Its message: *"Cannot yield checkpoint 'x': activity 'research' is a branch of a fan, and a session holds one active checkpoint that gates every other tool call, so a branch reaches no gate. Finish this activity and report it, or take an exit it declares for an outcome it cannot settle alone."* `batchState` (`src/utils/batch.ts:149-160`) answers `mayContinue: false` for a scope bound to an entry carrying `joinTo` — documented beside the three existing carve-outs at `:9-16` — because a branch's only exit target is the destination, which it may not enter, so `true` is an answer no caller may act on and `continue-batch` would spend a continuation reaching a refusal. `batchRefusal`'s "activity this scope already holds" carve-out at `:176` keeps a branch resuming on its own payload unaffected. `get_activity`'s `exit_destinations` header and `_meta` map (`:1450-1456`, `:1616`) render a fan-bound exit as the branch set the exit runs together; `present_checkpoint`'s `consequence.next_activity` (`:1928`), `respond_checkpoint`'s `exit` payload (`:2106`) and its `immediate` message template (`:2110`, which the compiler cannot catch — an array stringifies to `'research,codebase-comprehension,implementation-analysis'`) do the same.

---

**New operation `workflows/meta/techniques/workflow-engine/dispatch-fan.md`.** A capability of its own, not a mode on `dispatch-activity`: a mode would make one operation carry two procedures a caller selects exactly one of (`alternate-ops-as-protocol-sequence`), force its Rules into "when the destination is a list, do X instead" (Prefer Removing the Thing That Needs a Prohibition), and pluralise outputs the drive loop reads through `when` gates the dialect cannot make list-aware (`src/schema/activity.schema.ts:74-75` admits `==, !=, >, <, >=, <=`, bare truthiness, `!`, `&&`, `||`, parentheses — no list test, no length, no indexing). Atomic Techniques; Compose at Activities, and Modular Over Inline for keeping it out of the activity YAML.

> **Capability** — Run the activities one exit fans to as concurrent workers in a single turn, and hand back the destination they converge on.
>
> **Inputs**
> - `branch_activities` — The activities this fan runs together, in graph order: `next_activity_ids` from the envelope of the activity that fanned.
> - `session_index` — `session_index` of the session whose fan is being dispatched.
> - `agent_technique` — Canonical agent technique for each branch worker — default `workflow-engine::activity-worker`.
> - `state` — Current variable state for stub substitution.
> - `planning_folder_path` — *(optional)* Path to the planning folder whose `README.md` Progress surface is updated. Unset until the folder exists.
>
> **Outputs**
> - `branch_results` — The envelope each branch returned, unchanged, in `branch_activities` order.
> - `join_activity` — The activity the branches converge on, as the barrier named it when the last branch retired.
> - `trace_tokens` — The opaque HMAC-signed trace tokens this fan accumulated, one per `next_activity` call that returned `_meta.trace_token`.
>
> **Protocol**
> 1. **Progress, once.** Apply [sync-progress-status] for the dispatch moment once per `{branch_activities}` entry, then apply [version-control::commit-regular-files] ONCE naming the planning folder `README.md` alone, with a message stating which activities are entering progress. Every branch spawns in one turn, so one commit publishes every mark inside the window [dispatch-mark-reaches-the-remote] fixes. Skip when `{planning_folder_path}` is unset.
> 2. **Mint identities.** Mint one identity per branch, distinct from each other and from the session's own agent id, per [delivery-keys-on-agent-context] and [one-identity-per-branch].
> 3. **Enter the branches.** For the FIRST branch, `next_activity { session_index, activity_id: <that branch>, exit: <the exit that fanned>, agent_id: <the identity that completed the activity that fanned>, dispatch_agent_id: <that branch's identity>, step_manifest, variables_changed, artifacts_produced }` — the fanning activity's whole report travels on this one call, which opens every branch. For each remaining branch, `next_activity { session_index, activity_id: <that branch>, dispatch_agent_id: <that branch's identity> }`, which binds an identity to a branch already open and reports nothing. Capture `_meta.trace_token` from each and accumulate it per [dispatch-activity] step 2.
> 4. **Compose one stub per branch.** Apply [compose-prompt] per branch with `{agent_technique}`, `holds_prior_deliveries: false`, and `{state}` as substitutions, binding `activity_id` to that branch and `agent_id` to its minted identity.
> 5. **Spawn the batch.** Apply [harness-compat]::[spawn-concurrent] with the composed prompts as `agents`; await every envelope and collect them in input order as `{branch_results}`.
> 6. **Retire the branches.** For each branch in input order: apply [commit-and-persist] for that branch, then `next_activity { session_index, activity_id: <that branch's reported next_activity_id>, exit: <that branch's activity_exit>, agent_id: <that branch's identity>, step_manifest, variables_changed, artifacts_produced }`, then account for that branch per [account-every-activity]. Read `_meta.barrier` on each: it names the branches still outstanding, and on the last it reports the destination as met.
> 7. **Hand back the destination.** Return the destination `_meta.barrier` reported as `{join_activity}`, and `{branch_results}` unchanged.
>
> **Rules**
> - `one-identity-per-branch` — Each branch is a fresh context under an identity of its own, distinct from every sibling's and from the session's own agent id; the bound is keyed on the identity, and a scope equal to the session's agent is exempt from it (`src/utils/batch.ts:154`), so a shared or session-equal identity puts the whole fan outside the bound. Each branch therefore takes full delivery, per [delivery-keys-on-agent-context].
> - `a-branch-takes-one-activity` — A branch carries exactly one activity. Its only exit target is the destination, which the barrier owns, so the server answers `may_continue: false` for a branch context ([batch-is-bounded-by-the-server]) and the batch ends there as an ordinary outcome. The destination is a fresh dispatch through [dispatch-activity], which is the second of the two paths [one-advance-per-activity] already names.
> - `replace-one-branch` — A branch whose result is not an accepted envelope ([reject-partial-worker-result]) is replaced alone: mint a new identity, `next_activity { activity_id: <that branch>, dispatch_agent_id: <the new identity> }` to rebind it, [compose-prompt] with `holds_prior_deliveries: false`, and [spawn-agent] — one agent, so not [spawn-concurrent]. The returned siblings are untouched: their work is committed and their outputs landed on their own returns, so a failure costs one branch. One replacement per branch; then surface blocked, applying [sync-progress-status] for the blocked moment on that branch's rows, and advance nothing. The frontier keeps the live entry, so a later resume re-derives the same barrier.
> - `liveness-is-tested-per-branch` — Every branch has returned something by the time a concurrent turn resumes, so the [dispatch-activity] recovery ladder's "harness still reports the worker live" test is made per branch against the returned batch, not against a single awaited agent. On claude-code the [continue-agent] rung survives, agents staying addressable by id or name after returning (`claude-code.md:19`).
> - `no-gate-in-a-branch` — A branch reaches no gate. The load rejects a fan whose branches declare one, and `yield_checkpoint` refuses a branch context, so a fan needs no gate arbitration and no waiting policy.
> - `one-source-commit-at-the-barrier` — Engineering artifacts are committed per branch in input order; the source tree is committed once at the barrier, attributed to the activity that fanned. [commit-and-persist] derives its paths from the working tree, which N concurrent branches leave indistinguishable by author, so a per-branch source commit would sweep in a sibling's in-flight edits. A fan whose branches are read-only on the source tree makes that commit empty.
>
> Cites, and does not restate: `account-every-activity`, `delivery-keys-on-agent-context`, `reject-partial-worker-result`, `batch-is-bounded-by-the-server`, the trace-accumulate rule and `resolve-trace-at-close-out` (Cite Resource Policy; Do Not Restate It, and `canon-layer-cites-not-restates`).

**Bind site — the one activity in the corpus whose executor holds the primitive.** `spawn-agent.md:44-46` (`depth-1-only`): "A spawned agent therefore has no dispatch primitive… Parallel scatter is available only where the dispatch primitive is — at the orchestrator. Hoist a pass there when its fan-out is worth an orchestrator-owned step." `workflows/meta/activities/README.md:45` says `03-dispatch-client-workflow` "Drives the client workflow end to end inline", so its steps run in the top-level agent the bootstrap protocol addresses — the one holding `Agent`, which is why it already binds `dispatch-activity`, whose step 4 spawns. `orchestration-patterns::dispatch-workers` is not used: all seven of its binding sites are client activities executed by dispatched workers, and neither of its branches is executable there.

**`workflows/meta/activities/03-dispatch-client-workflow.yaml`.** Loop body reordered so the fan owns its iteration; `dispatch-fan` writes no `worker_result`, and `close-fan` clears the one the previous iteration left, so every gate keyed on `worker_result.result_type` is false on a fan iteration without a clause being re-authored:

```yaml
    continueWhile:
      type: or
      conditions:
        - { type: simple, variable: current_activity, operator: "!=", value: null }
        - { type: simple, variable: current_branches, operator: "!=", value: null }
    steps:
      - kind: technique
        id: dispatch-fan
        when: current_branches != null
        technique:
          name: workflow-engine::dispatch-fan
          inputs:
            branch_activities: current_branches
            session_index: client_session_index
            agent_technique: workflow-engine::activity-worker
            state: variables
      - kind: action
        id: close-fan
        when: current_branches != null
        actions:
          - { action: set, target: current_activity, value: "{join_activity}" }
          - { action: set, target: current_branches, value: null }
          - { action: set, target: join_activity, value: null }
          - { action: set, target: worker_result, value: null }
      # continue-batched-worker unchanged
      - kind: technique
        id: dispatch-activity
        when: "!worker_agent_id && current_activity != null"
        # …unchanged body
      # checkpoint trio and commit-activity-artifacts unchanged
      - kind: action
        id: advance-activity
        when: worker_result.result_type == "activity_complete"
        actions:
          - action: set
            target: current_activity
            value: "{worker_result.next_activity_id}"
            condition: { type: simple, variable: worker_result.next_activity_ids, operator: notExists }
          - action: set
            target: current_branches
            value: "{worker_result.next_activity_ids}"
            condition: { type: simple, variable: worker_result.next_activity_ids, operator: exists }
      # release-spent-worker unchanged — a fan destination leaves next_activity_id null, so the
      # identity is released and the fan iteration opens with no worker held
```

`current_branches` and `join_activity` join the activity's `variables.writes`. The `set` action's `condition` is the existing structured form (`deriveActivityContract` reads it at `activity-variables.ts:458-459`; `exists`/`notExists` are in `ComparisonOperatorSchema`, `src/schema/condition.schema.ts:3-5`). The two sets are not a derived shadow of one another: they are the two shapes `exit_destinations[exit]` takes, exactly one is ever populated, and nothing can write both.

**Envelope and routing.** `evaluate-transition.md` — the `exit_destinations` input (`:16-18`) states that a destination may name several activities the exit fans to; protocol step 4 (`:43`) reports the destination under the exit taken as `next_activity_id` when it names one activity and as a new `next_activity_ids` output when it names several. `finalize-activity.md` gains `next_activity_ids` beside `next_activity_id` (`:58-61`), folded by protocol step 2 (`:73`) from whichever shape it read, with exactly one populated. `dispatch-activity.md`'s `dispatch-topology` (`:88-90`) names the fan route alongside the batched walk; `delivery-keys-on-agent-context` (`:100-102`) states that a fan's branches are N fresh contexts each taking full delivery; step 3's mint (`:54`) notes that a fan mints before the enter so the enter can bind a branch to an identity. `orchestrator-conduct.md`'s `no-domain-work` (`:12-14`) names `dispatch-fan` as a delegation route beside `dispatch-activity`; `one-level-of-indirection` (`:16-18`) states the invariant positively — every agent touching a run is one the orchestrator placed there, whatever the width of a dispatch. `activity-worker.md`'s `batch-ends-where-the-server-says` (`:90-92`) states that a branch context is answered `may_continue: false` and finishes with one activity, and a new rule states that a branch reaches no gate and what to do instead. `continue-batch.md`'s `one-advance-per-activity` (`:68-72`) states that a barrier-met answer performs no advance and that a call naming a branch already in flight rebinds its identity rather than advancing onto it.

**Delivery, without which the bind is inert.** `src/loaders/core-ops.ts:47-65` explains the mechanism: a technique named inside another technique's Protocol has no other delivery path. `harness-compat::spawn-concurrent` joins `CORE_ORCHESTRATOR_TECHNIQUES` beside `spawn-agent`/`continue-agent` (`resolve-harness-operation` and all four harness files are already there, and `claude-code.md:24-27` already carries the `concurrent` Rules section). `workflow-engine::dispatch-fan` joins `meta/workflow.yaml`'s `techniques.workflow` beside `dispatch-activity`, `resume-worker` and `continue-batch`.

**Cost, for `docs/dispatch-model.md`.** Three activities standalone cost 232,954 characters against 159,093 batched (`:79`), a delivered-content premium of 73,861; on top of that a fan pays three harness context establishments instead of one, and `:62` puts the establishment saving at two to four times the collapsing saving. A fan of three is four fresh contexts — three branches plus the destination, which re-pays full delivery of everything the branches collectively held. The per-scope bound does not limit width: `batchActivities` counts one activity per branch scope, so the cap of three never binds and each branch spends a fresh budget. Width is bounded at the graph, by an author who can see the whole fan.

**What this design needs from #655**, in one line: every mutating handler's read-modify-write of `session.json` must be serialised per session — a compare-and-swap on `seq` with retry, or a per-session write lock — so that concurrent `activity_dispatched`, `technique_bundled` and `step_started` appends from N branch contexts all survive rather than the last writer winning.

### namespacing

**The derivation rule.** `branch_key(activity_id) = activity_id.replace(/-/g, '_') + '_outputs'`. `research` → `research_outputs`; `codebase-comprehension` → `codebase_comprehension_outputs`; `implementation-analysis` → `implementation_analysis_outputs`. It lives once, in `src/schema/graph.ts` as `branchKey`.

*Derived, not declared in the graph.* Three structural reasons. A graph-declared key would be a second name for the branch that has to be kept in agreement with the activity id, and two fans could spell one activity's key differently (One Authoritative Home, `canonical-fact-home`). It would be unknowable to a worker — `worker-control-plane-ban` (`activity-worker.md:62-64`) bars `get_workflow` — so it would have to be relayed as per-dispatch data the envelope contract does not carry, and the server, the orchestrator and the guard would each need the graph in hand to spell it. And it would be forgeable: a derived key cannot be mistyped in the graph, so the agreement between a fan and its destination's declared reads is mechanical rather than authored (Encode Constraints as Structure).

*Why the `_outputs` suffix rather than the bare snake id.* `VariableNameSchema` (`src/schema/variable.schema.ts:6-9`) requires `QUALIFIED_DATA_ID_PATTERN` (`src/schema/identifiers.ts:16`, `^[a-z][a-z0-9]*(_[a-z0-9]+)+$`) — a snake_case noun phrase of at least two words — or a listed bare-word exemption. `codebase_comprehension` passes alone; `research` is one word and would need an `EXEMPT_DATA_IDS` entry for every single-word activity id in the corpus. A uniform suffix makes the derivation total over every kebab id with no exemption list to grow, and `_outputs` is the plural item-noun collection shape the catalog already sanctions (`collection-id-shape`; `results`, `outcomes`, `items`, `branches` are already exempt bare words). Hyphens are excluded because the bag-name grammar excludes them (`variable-binding.md:18`) and `snake-case-symbols` requires snake for anything that binds to session state.

**Where the namespacing happens: the server, inside the single branch-return `next_activity`, immediately before `applyVariableWrites`.** The worker returns bare names, unchanged — exactly what `finalize-activity.md:72` already specifies. The orchestrator relays that map on the call that retires the branch. The server resolves the caller's frontier entry, reads `branchKey(entry.activity)`, and hands `applyVariableWrites` the whole map under that one key.

*Not the worker.* An operation's Outputs are a bind contract stating what a value IS, never which caller or graph position produced it (Separate Contract from Procedure; `contract-not-procedure`). A worker that namespaced its own outputs would rename every landed output by call-site, which `binding-carries-only-deviations` and `generic-not-overfit` forbid (`variable-binding.md:31,43`), and would desynchronise the guard, whose `deriveActivityContract` reads writes off the composed operation signature and knows nothing about graph position.

*Not the orchestrator.* It can see the fan — `get_workflow` returns `graph` verbatim (`workflow-tools.ts:663`) — so it could wrap on relay. But then "no branch writes a bare name" is a habit rather than a structure, and a relay that forgets to wrap lands bare names in total silence: `applyVariableWrites` skips both the declared-type and the value-set check when `declarations.get(name)` misses (`src/utils/variable-seed.ts:76-92`), so an unwrapped `assumptions_log` from two branches simply clobbers, warning-free. Deriving the wrap server-side from the graph makes the namespace the only route a branch's value has into the bag.

*The other two write paths are closed rather than namespaced.* `yield_checkpoint` applies `variables_changed` at bare names (`workflow-tools.ts:1739-1744`) and `respond_checkpoint` applies a checkpoint option's `setVariable` at bare names (`:2071-2077`), both keyed on the single `activeCheckpoint.activityId`. The no-gate-in-a-branch rule removes both, so `next_activity` is the only path a branch has and it is wrapped — Prefer Removing the Thing That Needs a Prohibition, rather than a second wrapping rule for the checkpoint channel.

**How it lands.** One `applyVariableWrites` change (`src/utils/variable-seed.ts:68-108`): `ctx` gains `namespace?: string`. With it set, every member is still validated against `declarations.get(name)` exactly as now — the merged declaration set already holds each member's type and value set under its bare name, so nothing has to be retained anywhere — and the whole map lands as one assignment, `draft.variables[ctx.namespace] = values`, with one `variable_set` event for the namespace carrying the object (the same single-event-for-a-map shape `variables_seeded` already uses at `session.schema.ts:327-331`). The flat assignment at `:93` is exactly right for a key holding a nested object; nothing else in that module moves. Without this change, widening the graph would silently *remove* validation a fan member has today — `context_scope`'s three-value set stops being checked the moment its activity is fanned.

**The downstream read form.** `{research_outputs.assumptions_log}`. `variable-binding.md:20-21` already lands nested-object outputs whole so a dotted-path read resolves against the landed object, and step 6 has a later `when`/`condition`/`transition` read `{O}` or `{O}.field.subfield` with the structured-condition evaluator walking the path. A flat key literally named `research.scope` would never be found by that walker; one object per branch key is what the walker already supports. Inside a branch, names stay bare — a branch's own later steps read its earlier outputs as `internalReads` (`activity-variables.ts:374-380`), never through the key.

**The gather step.** The destination declares `variables.reads: [research_outputs, codebase_comprehension_outputs, implementation_analysis_outputs]` and binds a step whose inputs are dotted projections into them, producing the combined value under its own declared output name. This is not a new binding form: the `{var}` template with dotted projection is already one of the three sanctioned input-deviation forms (`variable-binding.md:31`, `inputs: { scope: '-p {current_task.crate}' }`). Nothing else about the gather is new either — it is `scatter-gather.md`'s combine phase raised to graph grain, and the design is an application of that file's `isolation-then-combine` (`:30-32`): "Per-instance outputs are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber across instances. Combination happens exclusively in the combine phase." A fanned activity is the work unit, its branch key is the isolated slot, and the destination's gather step is the delegated combine. `isolation-then-combine` and `one-gather-contract-two-scatter-modes` (`:22-24`) each pick up the graph fan as a third scatter mode over the same combine contract.

**The `activity-variables` guard change, precisely.** Two homes: `src/utils/activity-variables.ts` (the module the server and the guards share so they cannot drift, per its own header) and `scripts/check-activity-variables.ts`. `mergeActivityVariables` is **not** touched: a fan member's write declarations describe the *members* of its branch object and stay the workflow's declaration of those values' types; only the address is namespaced, and the address is a graph fact the graph owns. Leaving the merge alone is also what keeps `namespace` populated, so `derived.writes` still matches `declaredWrites` and neither `undeclared-use` nor `unused-declaration` fires on a correct fan.

1. **`ActivityGraph` becomes edge-grouped** (`:532`): `Map<string, string[][]>`, one inner array per bound exit — length 1 for a plain edge, greater for a fan. The flat form throws away the grouping the barrier semantics need, and a second parallel structure carrying it could disagree with the first. `activityGraph` (`:540-546`) builds it from the graph's destinations; a shared `successors(graph, id)` flattens and dedupes for the three places that only want reachability: the BFS at `:608`, Tarjan's at `:691`, and the self-loop test at `:708`. A fan is not a cycle, so Tarjan groups nothing new.
2. **The meet becomes intersection over *arrivals*** (`:627-644`). The existing intersection over predecessors is right for alternative merge — 9 edges converge on `prism::generate-report` by routes exactly one of which carried control — and wrong for a barrier, where all branches ran, so the destination's entry state is their **union**. An *arrival* is one way control can reach a node: a completed fan is one arrival contributing the union of its branches' `outgoing`; an ordinary predecessor is its own arrival. Control still comes by exactly one arrival, so arrivals intersect. Three ways to apply this and have it do nothing: a fan's branch→destination edges must be **removed** from the plain predecessor index (`:595-598`) or the three branches appear both as one union arrival and as three intersecting ones, and the intersection wipes the union straight back out; the candidate seed at `:635` must move from `outgoing(sources[0])` to `arrivals[0]` or a union arrival's extra names are never candidates; and a branch head's own predecessor is ordinary — the fan source's post-state is where each branch starts. Termination is unaffected: `outgoing` is monotone non-increasing, a union of non-increasing sets is non-increasing, an intersection of them is too, so the fixed point over the powerset lattice ordered by ⊇ still exists. The lattice does not change *because* branch writes are namespaced: a branch contributes one flat bag name whatever object landed under it, and `bagName` (`:216-218`) resolves a downstream dotted read to it. Had branches written bare shared names, the destination would have needed a per-name provenance lattice instead of a set of names.
3. **`DerivedContract` gains `pathReads: Set<string>`** — the full dotted reference for every read whose reference had a tail. `read()` (`:374-380`) takes the reference rather than the pre-split head: `const head = bagName(reference); if (reference !== head) pathReads.add(reference); …` and `tokenReads`/`whenReads`/`conditionReads` return references rather than heads. Four lines, and it is what lets the guard see member grain at all: today the tail is discarded before any check runs.
4. **`writersOf` re-keys** (`check-activity-variables.ts:188-195`): for an activity the graph fans, each declared write `N` registers as a writer of `branchKey(id)` and of `branchKey(id) + '.' + N` — and **not** of `N`. That satisfies the destination's `unwritten-read` of the container, and it is the read-side enforcement of "no branch writes a bare name": any activity still declaring a bare read of `assumptions_log` is reported, because nothing writes that name any more.
5. **`readersOf` reads both grains** (`:199-206`): a record's `pathReads` register alongside its heads, so a destination reading `research_outputs.assumptions_log` is a reader of that member.
6. **`unread-write` reports at member grain** (`:216-223`): for a fan member, a declared write `N` is read when `readersOf` holds `branchKey(id)` (a destination that gathers the object whole) or `branchKey(id) + '.' + N`. Otherwise: *"writes 'research_outputs.assumptions_log', which nothing in this workflow gathers"*. This is the part most likely to be skipped and it is the whole value of the write-side check for a fanned activity — with only a container measured, the interior of the namespace goes unchecked, a hole exactly the size of a branch.
7. **The reachability `writes` map** (`:243`) contributes `branchKey(id)` for a fan member in place of its bare names — the container is what lands at the destination. A destination declaring a bare read of `assumptions_log` then reports as an `entry` unreachable-read, which is the finding telling the author to gather.
8. **A mistyped branch key is caught without touching `binding-provenance`.** The destination must declare its reads; a typo in the *binding* leaves the declared key unconsulted, and `unused-declaration` (`:170-177`) reports *"declares a read of 'research_outputs' that no step, gate, loop or transition consults"*. `TOKEN_RE`/`EXACT_TOKEN_RE` in `src/utils/binding-provenance.ts:275-276` still do not admit a dotted tail — a pre-existing gap that already applies to `{current_task.crate}` and is orthogonal to this design.
9. **One new finding family**: two activities in one fan whose composed technique signatures resolve the same `#### artifact` bare filename. It lives in the guard rather than the loader because the loader does not compose technique signatures and this guard already does (`activity-variables.ts:310-320`). `scripts/guards.ts` needs no 37th entry; the `activity-variables` entry's `proves` line (`:43`) is restated only if what it proves narrows.

No change to `VariableNameSchema` or `QUALIFIED_DATA_ID_PATTERN`: the branch key is a legal qualified snake name, and no dot ever reaches a declaration name. `scripts/check-review-mode-gating.ts` must flatten list destinations at `:135-147` — it parses raw YAML at `:190` so the loader's fan rules do not protect it, and `activities.get(<array>)` at `:156` would silently drop everything reachable only through a fan, which for a fan sitting between the initial activity and the rest of the graph is most of the workflow.

### enforcement

| Invariant | Where it is checked | What it reports |
|---|---|---|
| A destination is an activity id, or a list of at least two | `DestinationSchema` in `src/schema/graph.ts`, parsed at `workflow-loader.ts:299` | Load failure. `graph.plan-prepare.done: a fan runs at least two activities together; an exit that leads to one activity names that activity` for a one-element list; the union `errorMap` message for a non-string or a non-string member |
| Every branch of a fan is an activity this workflow contains | widened destination loop, `validateExitBindings` (`workflow-loader.ts:561-568`) | Load failure, per member: `Workflow graph sends 'plan-prepare.done' to 'reserch', which this workflow does not contain.` |
| No duplicate branch; no branch is `__terminal__`; no branch is the activity it leaves | fan loop in `validateExitBindings` | Load failure, one message per branch, each naming the fan by `<from>.<exit>` |
| Every branch binds at least one exit | fan loop in `validateExitBindings` | Load failure: `Branch 'research' of the fan at 'plan-prepare.done' binds no exit, so the fan has no destination to converge on.` |
| No branch fans in turn | fan loop in `validateExitBindings` | Load failure naming the inner binding. Nested fans are a stated non-goal, and without this the convergence comparison is ambiguous |
| Every branch's exits converge on one activity, the same one for every branch | `fanGroups(graph).join === null` → fan loop in `validateExitBindings` | Load failure naming the two disagreeing readings. This is the derived barrier; downstream readers take `join` as a string on the load's authority |
| No branch declares a checkpoint | `activityCheckpoints(activity)` in the fan loop (already imported and used at `workflow-loader.ts:544`; walks flattened steps, runs after fragment materialization) | Load failure naming the branch and the checkpoint, and pointing the fix at the destination |
| No ad-hoc gate is yielded from a branch | `yield_checkpoint`, `workflow-tools.ts:1642-1649`, on the caller's frontier entry carrying `joinTo` | Refusal stating that a session holds one active checkpoint gating every other tool call, and naming the two remedies. Not redundant with the load rule: `:1663-1679` admits a decision no definition mentions |
| No branch declares a starting value for one of its writes | fan loop in `validateExitBindings`, over `activity.variables.writes` | Load failure: the starting value would seed a top-level name the branch never writes |
| The destination is entered once, after the last branch retires | `next_activity` barrier refusal, over live frontier entries' `joinTo` | Refusal: `Cannot enter 'assumptions-review': 1 branch of the fan that leads there has not returned (codebase-comprehension). The run enters 'assumptions-review' once, after the last branch retires.` Derived from persisted state, so a resumed orchestrator re-derives it |
| A transition off an activity that binds a fan says which exit it took | `next_activity`, when the caller's activity has any fan-bound exit and `exit` is absent | Refusal: `Activity 'plan-prepare' binds exit 'done' to a fan, so 'exit' is required on this transition to say which destination it takes.` |
| Entering a branch retires the activity that fanned exactly once | `next_activity` outcome 4 materialises the whole fan on the first call; outcome 2 (bind) retires nothing | Structural. Prevents the corruption `continue-batch.md:70` names — an activity recorded exited and complete before a worker walked a step of it |
| Each branch is a distinct context, none of them the session's own agent | `dispatch-fan`'s `one-identity-per-branch`; observable through `_meta.batch` | Rule, with the reason: `src/utils/batch.ts:154` exempts a scope equal to `state.agentId`, so a session-equal identity puts the whole fan outside the bound |
| A branch takes exactly one activity | `batchState` (`src/utils/batch.ts:149-160`) answers `mayContinue: false` for a scope bound to an entry carrying `joinTo` | `batch_may_continue: false` on the envelope, folded by `finalize-activity` as it already is, so `continue-batched-worker`'s gate is false without being re-authored. The answer stays the server's per `batch-is-bounded-by-the-server` |
| Every delivery call is answered for its own caller's activity | `frontierEntry` in `src/utils/session/resolver.ts`, consulted by `get_activity`, `get_technique`, `get_resource`, `yield_checkpoint`, `next_activity`, `dispatch_child` | An ambiguous call — several entries open, none named — is refused naming the entries. A session with one entry never reaches the identity match, so an ordinary walk is unchanged |
| A branch's outputs reach the bag only under its derived key | `next_activity` wraps before `applyVariableWrites`; the branch key is `branchKey()`'s only spelling | Structural. The wrap is the only route a branch's value has, so a bare landing is unreachable rather than merely discouraged |
| A member's declared type and value set still hold | `applyVariableWrites` with `ctx.namespace` set, against the merged declarations by bare name | Warn-only, same wording as today: `variables_changed 'context_scope': value "everything" is outside the declared value set […]; stored as written.` |
| Nothing reads a branch output by its bare name | `writersOf` in `check-activity-variables.ts:188-195` registers only the namespaced form | `unwritten-read`: reads a name no activity writes and the workflow file does not own |
| Every member a branch produces is gathered, and every member a destination gathers is produced | `unread-write` / `unwritten-read` at member grain, off `pathReads` | `writes 'research_outputs.assumptions_log', which nothing in this workflow gathers` |
| A gather key the graph never fans, or a mistyped one | `unused-declaration` on the destination's declared read | `declares a read of 'research_outputs' that no step, gate, loop or transition consults` |
| A destination's read is satisfied on every arrival | `unreachableReads` with the fan-arrival meet | `unreachable-read` of kind `entry`. Left as a predecessor intersection, every branch-scoped write drops out at the destination and a correct fan produces false findings an author would "fix" by moving declarations |
| A checkpoint reachable only through a fan is still audited for review-mode auto-advance | `reachableInReview` in `scripts/check-review-mode-gating.ts:135-160`, flattening list destinations | Without the flatten, `activities.get(<array>)` is `undefined` and the whole subtree beyond the fan drops out of the reachability set — a silent under-report of the class the guard exists for |
| Two branches do not write one artifact | new finding family in `check-activity-variables.ts`, over composed `persistedProductions` | Guard finding naming both activities and the filename. It lives in the guard because the loader does not compose technique signatures |
| Every activity of a fan carries one usage entry | unchanged `account-every-activity`, cited by `dispatch-fan` step 6 | A branch with no entry appears in `activities_without_usage` (`workflow-tools.ts:475`), which is the wanted reading — an activity whose harness reported nothing, never one that cost zero |

### staged plan

**Stage 0 — prerequisite, #655: serialise the session store.** Not designed here and not designed around. What this design needs from it, in one line: every mutating handler's read-modify-write of `session.json` must be serialised per session — a compare-and-swap on `seq` with retry, or a per-session write lock — so that concurrent `activity_dispatched`, `technique_bundled`, `step_started` and `resource_fetched` appends from N branch contexts all survive rather than the last writer winning. Stages 1, 2, 5 and 6 can land before it; **stage 3 must not ship enabled without it**, because the batch bound and the fresh-versus-resume reading derive entirely from those events (`src/utils/batch.ts:72-123`, `src/utils/dispatch.ts:30-32`), and the reload-then-save at `workflow-tools.ts:1517-1561` narrows that window without closing it — its own comment at `:1513-1516` says why.

**Stage 1 — the graph capability.** New `src/schema/graph.ts` (`TERMINAL_SENTINEL`, `DestinationSchema`, `GraphSchema`, `destinationTargets`, `successorsOf`, `fanGroups`, `branchKey`); `workflow.schema.ts` imports it and takes the new `.describe()`; the four `TERMINAL_SENTINEL`/`type Graph` import sites repoint; `ExitBinding.to` widens to `string | string[]` and `exitDestinations` flattens (`workflow-loader.ts:477-508`); the destination loop iterates members; the ten fan rules join `validateExitBindings`; `schemas/workflow.schema.json` regenerated with `npm run build:schemas`; `site/api/schemas.html` rebuilt with `npm run build:site`.
*Acceptance:* the pinned corpus loads byte-identically — 17 workflows, 109 activities, 207 graph edges, 0 of them lists — because a union accepts every existing string and the fan rules are vacuous without a fan; `npm run check:all` green; `tests/workflow-loader.test.ts` gains one case per rule (well-formed fan accepted; divergent branches; branch with no exits; `__terminal__` branch; duplicate branch; source as its own branch; nested fan; gating branch; branch with a starting value; one-element list) plus `getExitBindings` carrying the set and `exitDestinations` returning every branch head; the regenerated JSON schema shows the probed `anyOf`; `tests/site.test.ts` green.

**Stage 2 — the frontier.** `frontier` replaces `currentActivity` on `SessionFile`; `frontierEntry` added to `src/utils/session/resolver.ts`; `sessionView` takes the calling scope; every reader repointed (23 sites in `resource-tools.ts`, 11 in `workflow-tools.ts`, one in `logging.ts`); `TOP_LEVEL_KEY_PRIORITY` and `src/utils/session/migration.ts` updated. **No fan behaviour yet** — a solo walk holds exactly one entry, so `frontierEntry` never reaches the identity match and every path behaves as today. Independent of stage 1; either order.
*Acceptance:* the whole existing suite green with no test rewritten for behaviour (only for the field name); `get_workflow_status.current_activity` and `inspect_session` render identically for a solo walk; a session file recorded before the change migrates to a one-entry frontier and resumes; a file with an empty frontier makes `get_activity` refuse with the existing "No current activity" reading rather than serving something arbitrary.

**Stage 3 — the runner.** `dispatch_agent_id` on `next_activity`; the four-outcome resolution (bind / branch return / advance-with-fan-materialisation / terminal); the barrier refusal; the `exit`-required refusal; `_meta.barrier`; the trace `act` fix on a branch return; the `yield_checkpoint` branch refusal; the `batchState` branch carve-out; `_meta.batch` and `exit_destinations` reading the frontier. Depends on stages 1 and 2, and on stage 0 before it is enabled on a real run.
*Acceptance:* a fixture workflow whose graph carries one gate-free fan drives end to end in an integration test — three branch workers each served their own activity by `get_activity` and `get_technique`, three returns, the barrier refusing the destination until the third, the destination entered once; `completedActivities` holds the activity that fanned plus three branches and nothing else, each `activity_exited` at its own return; a barrier-refusal test; a `yield_checkpoint`-from-a-branch refusal test; a replacement test where one branch returns no envelope, is rebound to a new identity, and the fan completes; a `batch_may_continue: false` assertion on every branch envelope.

**Stage 4 — namespacing.** `ctx.namespace` on `applyVariableWrites`; the server-side wrap in the branch-return path.
*Acceptance:* a branch's `variables_changed` lands as one object under its derived key with one `variable_set` event; a member whose value disagrees with its declaration warns with today's wording; a destination step binding `{research_outputs.assumptions_log}` resolves against the landed object; nothing lands at a bare name from a branch, asserted by a test that relays two branches both reporting the same bare name and reads both values back.

**Stage 5 — the walk and the guards.** `ActivityGraph` edge-grouped; `successors`; the split predecessor index and the arrival meet; `pathReads`; `writersOf`/`readersOf` re-keying; the member-grain `unread-write`/`unwritten-read` text; the reachability `writes` contribution; the artifact-collision family; `check-review-mode-gating` flatten; `tests/e2e/walker.ts` and `scripts/smoke/smoke-orchestrator.ts` made fan-aware (`pickExit`/`pickNext` yield the branch set, the walk enters each branch then the destination once, `visits` keyed on activity ids); `tests/e2e/option-coverage.json` re-recorded with `npm run baseline:stamp` in the same commit and `DRY_WALKS` re-measured.
*Acceptance:* `check:activity-variables` reports zero on the corpus (which still has no fan, so this stage proves no regression) and reports exactly the seeded defects on a fixture — an ungathered member, a gathered member no branch produces, a bare read of a branch output, two branches writing one artifact; `tests/activity-variables.test.ts` gains a case proving a destination's read of a name only one branch writes is *not* reported (the union arrival) while a bare read of the same name is; `npm run test:coverage-walk` green with the stamp fresh.

**Stage 6 — canon and definitions.** `dispatch-fan.md`; the drive-loop YAML; `evaluate-transition.md`, `finalize-activity.md`, `dispatch-activity.md`, `activity-worker.md`, `continue-batch.md`, `orchestrator-conduct.md`, `commit-and-persist.md`, `planning-readme.md`'s call-site table, `variable-binding.md`, `scatter-gather.md`; `schema-construct-inventory.md`'s Workflow-Level Constructs Graph row and the Activity-Level exit row at `:48`, worded so the informal pattern does not collide with the within-activity fan-out row at `:38` — "these three activities are independent, run them together", not "fan out then consolidate"; `schemas/README.md:283` and its "Exits and the graph" section at `:660-689`; `docs/dispatch-model.md`; `workflows/meta/activities/README.md:45`; `core-ops.ts` and `meta/workflow.yaml` delivery entries. Depends on stage 3 (the tool must accept what the operation calls) and on the new file existing before the bind, for the refs guard.
*Acceptance:* `check:all` green including `refs`, `audience`, `artifact-guides`, `fragments` and `workflow-yaml`; the drive loop's new steps bind resolvable operations and declare `current_branches` and `join_activity`; every surviving description of a singular destination is gone (grep `graph.<activity>.<exit>`, "destination activity", "the activity the workflow graph binds"), since a stale claim reads as current fact.

**Stage 7 — corpus adoption, its own commit in `workflows/`.** The work-package fan. This is a definitions change with real removals, not a wiring change: `04-research.yaml` has four gate sites (`:106`, `:190`, the `assumption-interview` ref at `:222`, the per-assumption decision at `:242`), `05-implementation-analysis.yaml` has two (`:124`, `:143`), `15-codebase-comprehension.yaml` has one (`:127-157`), and no fan branch may gate. The assumption interview and its `review-assumptions::record` bindings are duplicated in `07-assumptions-review.yaml`, which already runs that interview over the same `open_assumptions`, so the branch-side copies are a removal rather than a workaround. The graph also reorders: today `codebase-comprehension → research → implementation-analysis → plan-prepare` (`workflow.yaml:184-189`), and the fan puts the three after `plan-prepare`. The destination gains its gather step and its three declared reads.
*Acceptance:* `work-package` loads with the fan and every fan rule satisfied; `check:all` green in the corpus; `option-coverage.json` re-recorded and `DRY_WALKS` re-cleared; one live run of the fan on a real work package. Sequenced after the server PR merges — a workflows-branch sweep runs main's tooling, so it is red until then; verify locally and re-run the sweep by hand afterwards.

### not adding

**No join node, no join keyword, no sentinel exit target.** The barrier is derived by `fanGroups` from the exit bindings the branches already carry, and the load rejects a fan whose branches disagree. A declared join would be a second home for a fact the branches already state, and the load-time convergence rule is what makes the derivation safe to assume everywhere downstream.

**No merge policy, no conflict guard, no per-name provenance.** Namespacing removes the collision by construction, so there is nothing to arbitrate and nothing to police. This is also what keeps the reachability change to a meet operator instead of a rewrite: a branch contributes one flat bag name, so the lattice stays a set of names.

**No nested fans.** Rejected at the load. Without the rule the convergence comparison is ambiguous — a branch's effective destination would be either its inner fan's branches or its inner destination — and a nested fan multiplies concurrent contexts against a bound that already does not limit width.

**No per-branch metadata in the graph.** A fan is a list of activity ids and nothing else. Every fact a branch needs — its identity, its destination, its output key — is derived: the identity at dispatch, the destination from the branches' own bindings, the key from the activity id.

**No declared branch key.** Derived from the activity id, for the three reasons under `namespacing`. A `fan_outputs.research`-shaped single container was also rejected: two branches writing sibling members of one bag entry is a merge into a shared entry, and `applyVariableWrites` writes an entry whole, so it would need either a merge policy or a server-side assembly that is a merge policy under another name.

**No new MCP tool, and `activity_id` is not unioned.** The three outcomes of `next_activity` are discriminated by the frontier — server state — plus one new optional `dispatch_agent_id`. A union on `activity_id` would make a one-element array either a forbidden fan of one or a rebind, and a reader cannot tell which; a separate tool would be a second control-plane entry point for one operation.

**No per-entry `activeCheckpoint`.** The tempting server change, and it buys nothing. The binding constraint is not the single slot but the turn boundary: `spawn-concurrent` is one turn, and the turn does not resume until every branch's tool result returns, so a mid-branch yield cannot be presented until every sibling has already finished or failed. A richer slot would still deadlock, and it would also have to thread through `present_checkpoint`, `respond_checkpoint`, `resume_checkpoint`, `checkpointResponses` keying and `assertNoActiveCheckpoint`. Forbidding the gate at the load is smaller and total.

**No change to `mergeActivityVariables`.** A fan member's write declarations describe the members of its branch object and remain the workflow's declaration of those values' types; only the address is namespaced, and the address is the graph's. Synthesizing a container declaration would move the type and value set into a retained side-table, change the seeded bag and the `get_workflow` payload, and require `deriveActivityContract` to re-key its write side — none of which any check needs, because the merged set already indexes every member by its bare name.

**No change to `applyVariableWrites`'s flat assignment.** `draft.variables[name] = value` (`src/utils/variable-seed.ts:93`) is exactly the whole-object landing a dotted read requires. Only the optional `ctx.namespace` is added, and only so member validation survives.

**No 37th guard registry entry.** The fan's shape rules are load failures, for the reason `validateExitBindings` gives at `workflow-loader.ts:513-516`: a session cannot be walked through a graph with a hole in it. A guard would put the rule in a second home and let a session start on a graph the guard would have rejected.

**No fan width cap.** A server-side number with no measurement behind it is speculative configuration. The cost is stated once in `docs/dispatch-model.md` beside the batching figures it is derived from, and the author sees the whole fan in one place.

**No `dispatch_agent_id` on `dispatch-activity` or `continue-batch`.** The sole-entry fallback in `frontierEntry` answers every solo call correctly, so the ordinary walk's definitions and its wire traffic are unchanged. Only a fan needs identity-keyed resolution, and only a fan pays for it.

**No `fanId` on a frontier entry.** At most one fan is open at a time, because a branch may not fan, so `joinTo` alone distinguishes a branch and every branch of the open fan shares it.

**No `binding-provenance` dotted-token change.** The gap at `src/utils/binding-provenance.ts:275-276` is pre-existing — `{current_task.crate}` already exercises it — and a mistyped gather key is caught by `unused-declaration` on the destination's own declared read, so the fan does not make it load-bearing.

**No change to `orchestration-patterns::dispatch-workers`.** `dispatch-fan` does not route through it. Its `dispatch_concurrency` selection remains unexecutable at all seven of its activity binding sites — a pre-existing defect this design neither fixes nor worsens, and fixing it would mean hoisting seven binding sites to the orchestrator, which is a separate piece of work.

**No degraded join.** Proceeding on two of three branch keys would hand the gather step a value no branch produced. Under namespacing the gather either has every key or it does not run; there is no partial combine and no default to fall back on, which is precisely the property `isolation-then-combine` buys. A fan that could proceed degraded would need a merge policy to say what a missing branch means.

**No `session.exit` change.** It is written at `workflow-tools.ts:842` and read nowhere in `src/`, and its stated meaning stays true when the last completed activity is the last branch to retire.

**No arity check moved out of the schema.** `.min(2)` stays on the array branch of the union, because the probe shows zod surfaces the array's own message for a one-element list rather than an opaque union error — so Encode Constraints as Structure and a readable message are both available and neither has to be traded.

### residual risks

- A branch that cannot proceed without a decision has no conforming way to say so. `finalize-activity` defines exactly two envelopes, `reject-partial-worker-result` accepts only those two, and `dispatch-activity.md:61` refers to a blocked signal that no envelope carries. The best available report is an `activity_complete` taking a blocked or abort exit the activity declares; failing that the branch returns a non-envelope and routes to `replace-one-branch`, then to the fan surfacing blocked. This design makes a pre-existing gap load-bearing rather than creating it, and the no-gate-in-a-branch rule is what makes it reachable.
- `get_workflow`'s rendered variable set names a fan member's outputs by their bare declared names while the bag addresses them under the branch key. The graph in the same payload shows the fan and `variable-binding.md` states the derivation, but an orchestrator reading the variable list alone sees names the bag does not hold at the top level. The alternative — synthesizing container declarations in `mergeActivityVariables` — costs a retained member side-table and a re-keyed write derivation, which is why it was not taken.
- Two fans that both include one activity share its branch key, and the second visit replaces the object whole because `applyVariableWrites` assigns rather than merges. A destination of the first fan that reads the key on a path where the second has since run reads the second pass. `unreachableReads`' `re-entry` family reports the routing case; a non-routing stale read is not detected. The rule stated positively is that a branch key holds the outputs of the most recent visit to its activity, and a destination needing an earlier visit's values gathers them into a name of its own at that visit.
- Trace segments are per session, not per delivery scope (`src/trace.ts:108-114`). A fan of three produces four segments that partition an interleaved multi-branch event stream at arbitrary points, so a resolved trace attributes correctly by `act` but does not separate the branches' interleaving. The `act` mislabelling is fixed; the partitioning is not.
- The cost premium is real and unbounded by the server. Three activities standalone cost 232,954 characters against 159,093 batched (`docs/dispatch-model.md:79`), and three context establishments where `:62` puts the establishment saving at two to four times the collapsing saving — so a fan of three is roughly four fresh contexts for three activities plus a destination that re-pays full delivery of everything the branches held. `batchActivities` counts one activity per branch scope, so neither the cap nor the per-scope budget ever binds a fan. Width is bounded only by an author's judgement at the graph.
- N branch workers write one source working tree, and `commit-and-persist` derives its paths from `git status --porcelain` over that tree, so concurrent changes are indistinguishable by author. `one-source-commit-at-the-barrier` answers it by making one source-side commit attributed to the activity that fanned, which is correct only while the fan's branches are read-only on the source tree — the analysis activities a fan is for. A fan of source-mutating activities has no answer under this design.
- `DRY_WALKS` (`tests/e2e/option-coverage.test.ts:57`, currently 50) is a coverage-plateau bound measured against the graph's fork tree, and the file says outright it must be re-measured whenever the graph grows. A fan multiplies branch orderings the enumerator can produce, so 50 may no longer clear — and a short streak is reported as unreached options, that is, as a definitions defect, when the cause is the walk budget.
- The frontier migration touches every live session. A session recorded before stage 2 converts to a one-entry frontier; a hand-edited or older file with no `frontier` resolves to an empty one, and `get_activity` refuses until the next enter. `src/utils/session/migration.ts` covers the recorded case; a file whose `currentActivity` was empty while the run was mid-activity cannot be reconstructed and needs a re-enter.
- The barrier is enforced on `next_activity` and the gate on `yield_checkpoint`, but nothing stops a branch worker from calling `get_resource` or `get_technique` after its own return. Delivery scoping keys those on the call's `agent_id` and the frontier entry is gone, so they are answered against whatever the frontier then holds — harmless for content, but a stray call from a retired branch during a fan of three could be answered for a sibling under the sole-entry fallback once two have retired.
- `orchestration-patterns::dispatch-workers` keeps a parallel branch that cannot run at any of its seven binding sites. A reader who finds that operation before finding `dispatch-fan` will conclude parallel dispatch is already available at activity grain and author against a branch that never executes.

## Fan destination with a derived barrier and a single-cursor frontier

### schema change

## The zod change

One new module, `/home/mike1/projects/dev/workflow-server/src/schema/graph.ts`, homes the destination's shape and every derivation over it. It is imported by `src/loaders/workflow-loader.ts` and `src/utils/activity-variables.ts` and imports neither — `TERMINAL_SENTINEL` currently lives in the loader (`workflow-loader.ts:584`) while the loader already imports from `activity-variables.ts:11`, so a derivation placed in either would cycle. Single responsibility, per **SOLID at the Definition Layer** and **One Authoritative Home**.

```ts
// src/schema/graph.ts
import { z } from 'zod';

/**
 * Canonical terminal sentinel. A destination of this id ends the workflow without resolving to a
 * real activity: `next_activity` accepts it, flips the session status to `completed`, and the
 * workflow stops. A workflow that ends by having no outgoing transition needs no sentinel.
 */
export const TERMINAL_SENTINEL = '__terminal__';

/**
 * Where one exit leads: an activity id, `__terminal__`, or the activities of a fan. A fan names at
 * least two, so a destination that names one activity has exactly one spelling.
 */
export const DestinationSchema = z.union([z.string(), z.array(z.string()).min(2)]);
export type Destination = z.infer<typeof DestinationSchema>;

/**
 * Exit bindings: activity id -> exit id -> destination. Every exit every activity in the workflow
 * declares is bound here; an unbound exit, an unknown exit and an unknown destination each fail the
 * load, so the graph and the activities cannot drift apart.
 *
 * A destination naming several activities is a fan: they run together, each landing its outputs
 * under its own branch key, and the run enters the single destination all of their exits name once
 * the last of them returns. That destination is the fan's barrier, derived from the branches' own
 * bindings, so no activity, exit or keyword declares it — and a fan whose branches name more than
 * one destination between them fails the load.
 */
export const GraphSchema = z.record(z.record(DestinationSchema));
export type Graph = z.infer<typeof GraphSchema>;

/** The activities one binding can send the run to. */
export function destinationTargets(destination: Destination): string[] {
  return Array.isArray(destination) ? destination : [destination];
}

/** Whether a destination fans. */
export function isFan(destination: Destination): destination is string[] {
  return Array.isArray(destination);
}

/** The fans a graph declares, each with the destination its branches converge on. */
export function fanGroups(graph: Graph | undefined):
  Array<{ from: string; exit: string; branches: string[]; join: string }> { /* see below */ }

/** Whether some exit of some activity fans to this activity. */
export function isFanBranch(graph: Graph | undefined, activityId: string): boolean { /* … */ }

/**
 * The bag key a fan branch's outputs land under: the activity id in snake case with `_outputs`
 * appended. Derived from the id alone, so the server, the guards and a reader of the graph spell it
 * the same way and a worker is never told it.
 */
export function branchKey(activityId: string): string {
  return `${activityId.replaceAll('-', '_')}_outputs`;
}
```

`fanGroups` reads the join from the branches' own bindings — the load has already proved they agree (check **F7** below), so it takes the first branch's single destination. It is the *only* derivation of the barrier: the loader validates against it and the reachability walk models it, and two derivations could disagree about a graph the loader accepted.

`src/schema/workflow.schema.ts` line 51 stops declaring the type and re-exports it, so the schema generator still reaches it:

```ts
export { GraphSchema, type Graph, TERMINAL_SENTINEL } from './graph.js';
```

## The `.describe()` text

Line 67, replacing the current one sentence about a singular destination (repo voice: positive present, no account of what it replaced):

```ts
  graph: GraphSchema.optional().describe('The workflow\'s shape: for each activity, where each of its exits leads. This is the single home for the routing — an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say. A destination naming one activity sends the run there, and `__terminal__` ends the run. A destination naming several activities runs them together; the run enters the one destination all of their own exits name, once the last of them returns, so the barrier is the bindings the graph already carries and nothing declares it separately. Omitted only by a workflow whose activities declare no exits.'),
```

## The generated JSON shape

`schemas/*.schema.json` are generated by `npm run build:schemas` (`scripts/generate-schemas.ts`) and are never hand-edited. Probed against the actual generator (`zodToJsonSchema` with the `root` ref strategy the workflow schema is generated under, `scripts/generate-schemas.ts:25`), `schemas/workflow.schema.json:384-393` becomes:

```json
"graph": {
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "additionalProperties": {
      "anyOf": [
        { "type": "string" },
        { "type": "array", "items": { "type": "string" }, "minItems": 2 }
      ]
    }
  },
  "description": "The workflow's shape: …"
}
```

`items` is a non-empty subschema, so `tests/generated-schemas.test.ts:44-49` (which fails on an empty subschema at an `items` key) stays green. `site/api/schemas.html:277` picks the new description up through `npm run build:site`; `paramRows` (`scripts/generate-site-data.ts:498-517`) never recurses into `additionalProperties`, so the nested destination type is not rendered there and needs no site work beyond the regeneration.

Corpus impact at load: nothing. A union accepts every existing string, no other load rule keys off the destination's JavaScript type, and the pinned corpus at `5f92dc06` carries no list-valued edge — the schema currently rejects one and `validate-workflow-yaml` (`scripts/guards.ts:267-274`) is green — so `.min(2)` cannot break an existing edge and the fan-shape checks below are vacuous until a fan is authored.

## Load-time checks

All of them join `validateExitBindings` (`src/loaders/workflow-loader.ts:520-572`), called from `loadWorkflowWithDiagnostics:366` after fragment materialization (`:333`) and the variable merge (`:350`), failing the load at `:367`. They go there and only there, for the reason the function's own comment gives (`:513-516`): "a session cannot be walked through a graph with a hole in it." `getExitBindings`, `activityGraph` and `fanGroups` may then *assume* a well-formed fan, which is what keeps the derived join out of two homes. Every check is decidable from the graph object plus the materialized activities the function already holds — no technique composition, no I/O.

Two existing lines widen first. `ExitBinding.to` (`:481`) becomes `string | string[]`; `exitDestinations` (`:507`) becomes `.flatMap(destinationTargets)` so it keeps returning `string[]` (its callers read it as the allow-list of activities reachable from here, which for a fan is every branch head). And `:565` iterates targets:

```ts
      for (const target of destinationTargets(destination)) {
        if (target !== TERMINAL_SENTINEL && !knownActivityIds.has(target)) {
          errors.push(`Workflow graph sends '${activityId}.${exitId}' to '${target}', which this workflow does not contain.`);
        }
      }
```

Without that widening a fan fails closed but incomprehensibly — a `Set<string>.has` on an array is a compile error, and a template literal renders the whole list as one unknown id.

Then a third loop over `fanGroups`-shaped candidates. Each message names the fan by `<source>.<exit>` and the offending branch, so the author's fix site is in the message. Encoding these as load failures rather than guard findings is **Encode Constraints as Structure**; F10 in particular is **Prefer Removing the Thing That Needs a Prohibition** — with the rule at load there is no runtime prohibition to police.

| # | Rule | Message |
|---|---|---|
| F1 | A fan names at least two activities | carried by the schema, so it surfaces as `graph.plan-prepare.done: Array must contain at least 2 element(s)` — per **Maximize Schema Expressiveness**, a one-member list is a plain destination spelled a second way |
| F2 | Every member is an activity this workflow contains | `Workflow graph sends 'plan-prepare.done' to 'reserch', which this workflow does not contain.` |
| F3 | No member listed twice | `Workflow graph fans 'plan-prepare.done' to 'research' twice; a fan runs each of its activities once.` |
| F4 | No member is `__terminal__` | `Workflow graph fans 'plan-prepare.done' to '__terminal__'. Every branch of a fan returns to one destination, and an activity that ends the run never returns.` |
| F5 | No member is the activity the exit leaves | `Workflow graph fans 'plan-prepare.done' to 'plan-prepare', the activity the exit leaves.` |
| F6 | Every member declares at least one exit | `Activity 'research' is a fan branch of 'plan-prepare.done' and declares no exit, so the fan has no destination to converge on. Give it an exit bound to the destination its siblings name.` |
| F7a | No member's exit fans again | `Activity 'research' is a fan branch of 'plan-prepare.done', and its exit 'done' fans to 'deep-dive, survey'. A branch does not fan again — every exit of a branch binds to the activity the fan converges on.` |
| F7b | All of a member's exits bind to one destination | `Activity 'research' is a fan branch of 'plan-prepare.done' and sends its exits to 'assumptions-review, plan-prepare'. Every exit of a branch binds to the one activity the whole fan converges on, which is what the barrier is derived from.` |
| F7c | Every member's single destination is the same one | `The fan at 'plan-prepare.done' converges nowhere: 'research' and 'codebase-comprehension' send their exits to 'assumptions-review', and 'implementation-analysis' sends its to 'plan-prepare'. Bind every branch's exits to one shared destination.` |
| F8 | The converged destination is an activity | `The fan at 'plan-prepare.done' converges on '__terminal__'. A fan converges on an activity, because the destination is entered once after the last branch returns and there is nothing to enter at the end of the run.` |
| F9 | The converged destination is not itself a member | `The fan at 'plan-prepare.done' converges on 'research', which is one of its own branches.` |
| F10 | No member declares a checkpoint step | `Activity 'research' is a fan branch of 'plan-prepare.done' and declares checkpoint 'research-convergence'. A session holds one outstanding decision at a time, so only one activity may be in flight when a gate is reached. Move the gate to the activity the fan converges on, or take this activity out of the fan.` |

F7b–F7c together *are* the barrier derivation: `join = the one activity every branch's every exit binds to`, and there is no self-loop carve-out. A branch that wants to retry itself expresses it as a loop step inside the activity; admitting a self-loop would cost a third `next_activity` outcome and a `one-advance-per-activity` carve-out for no case the corpus has. **Upgrade trigger:** a branch that genuinely must re-enter itself between exits.

F7a plus F7b together make nested fans unrepresentable, which is what lets the runner hold the frontier as a bare list (see `dispatch_mechanism`).

F10 uses `activityCheckpoints(activity)`, already imported and used at `:544`. It walks `flattenActivitySteps` (`src/schema/activity.schema.ts:322-332`), so a gate inside a loop body counts, and it runs after `materializeActivityFragments` (`:333`), so a `ref`-form gate counts.

## Inventory row

`workflows/workflow-design/resources/schema-construct-inventory.md`, **Workflow-Level Constructs**, immediately after the Graph row (`:65`) and before the Checkpoint fragment row (`:66`) — a property of Graph reads next to it. Voiced so it cannot be confused with the orchestration-patterns row at `:38`, which is *within-activity* fan-out over work units:

```
| "These three activities are independent — run them together" | **Graph fan** | `graph.<activity>.<exit>` naming two or more activities instead of one. They run together; each lands its outputs under its own branch key (`<activity_id>_outputs`, snaked), and the run enters the single destination all of their own exits name, once the last of them returns — the barrier is those bindings, so nothing declares it. Branches converging on more than one destination, a branch that declares a checkpoint, a branch that fans again, and a fan converging on `__terminal__` each fail the load. A downstream activity that needs a combined value binds a step that gathers the branch keys. |
```

The Graph row's own third cell extends to "naming the destination activity or the activities of a fan", and the Activity-Level exit row (`:48`) picks up the same. Outside the corpus the same fact has two authored homes to update: `schemas/README.md:283` (the `graph` field-table row) and `schemas/README.md:660-689` ("Exits and the graph", whose worked JSON example gains a fan).

### dispatch mechanism

## The representation: one field

`src/schema/session.schema.ts` — `currentActivity: z.string().default('')` (`:99`, type at `:208`) becomes:

```ts
  /**
   * The activities in flight. One entry on an ordinary walk; one per branch while a graph fan runs.
   * A destination the graph fans is entered once, after the last of its branches returns, so this
   * holds either a single activity or the branches of exactly one fan — every exit of a branch binds
   * to the fan's destination, so a branch cannot open a fan of its own.
   */
  frontier: z.array(z.string()).default([]),
```

Nothing else. `joinTo` is a copy of a graph fact the handler already loads (`workflow-tools.ts:720`); `enteredAt` is a copy of the `activity_entered` history event; a per-entry `agentId` is what forces a re-bind call outcome for a replacement worker. All three are cut. The session-level `exit` (`:102`) stays: its stated meaning is the exit the last completed activity took, and three sequential branch returns leave it holding the last one's, which is that. `activeCheckpoint` (`:105`) stays singular and untouched — F10 plus the runtime refusal below are what make that safe.

`sessionView` (`src/utils/session/resolver.ts:96-102`) takes an optional activity and resolves `act` from the frontier; that keeps the by-scope rule in one home rather than repeated across four handlers. `src/schema/state.schema.ts:184,208` refine `currentActivity != null` on `WorkflowStateSchema`, which nothing in `src/` outside that file constructs — check it, do not carry the refinement onto the frontier.

## `next_activity`: one rule, three behaviours

Two parameter changes (`workflow-tools.ts:698`):

```ts
      activity_id: z.union([z.string(), z.array(z.string()).min(2)]).describe(
        'Where the run goes next: an activity id, `__terminal__`, or — where the graph fans the exit taken — the whole list of activities to run together, exactly as the graph names them. Returning a branch of a running fan, this is the activity the fan converges on: the server enters it once, when the last branch returns.',
      ),
      from_activity: z.string().optional().describe(
        'The activity this call is exiting — the one `exit`, `step_manifest`, `variables_changed` and `artifacts_produced` belong to. Omit while one activity is in flight; required while a fan is running, so the call names which branch returned.',
      ),
```

The handler's mutator (`:765-864`) becomes one rule:

1. **Resolve the retiring entry.** `from_activity` given and in `state.frontier` → that one. `from_activity` given and absent from the frontier → throw. Omitted and `frontier.length <= 1` → the sole entry, or none on the first call. Omitted and `frontier.length > 1` → throw.
2. **Retire it.** `activity_exited`, `completedActivities`, `exit`, `variables_changed` (namespaced — see `namespacing`), `step_completed`, `activity_outcome`, all attributed to the retiring activity exactly as `exitingActivity` does today (`:769-825`).
3. `draft.frontier` = the frontier without that entry.
4. **Enter `activity_id` if and only if `draft.frontier` is now empty.** A list pushes every member and emits one `activity_entered` each; a string pushes one and runs the terminal check (`:860-863`).
5. Otherwise enter nothing and report `_meta.barrier = { pending: draft.frontier }`.

On an ordinary walk the frontier holds one entry, so step 4 always fires and behaviour is identical to today. On a fan enter the origin is the sole entry, so it retires and the list is pushed. On a branch return with siblings live the frontier stays non-empty and nothing is entered. On the last branch return the frontier empties and the join is entered. **There is no separate barrier-met call and no separate join-enter call**, so early entry is not refused — it is unrepresentable. That is what makes "the runner enters the shared destination once, after the last branch returns" a property of the store rather than of an orchestrator remembering to wait, and it is the whole of fixed decision 1's runtime realisation.

It also makes the retiring-entry check subsume `one-advance-per-activity`'s hazard (`continue-batch.md:70`): a second advance off an activity already retired names an activity the frontier no longer holds, and is refused.

Refusal messages:

```
Cannot exit 'research': the session is not on it. In flight: codebase-comprehension, implementation-analysis. Pass from_activity naming the branch this call is returning.
Cannot advance: 3 activities are in flight (research, codebase-comprehension, implementation-analysis). Pass from_activity naming the branch this call is returning; the destination is entered once, when the last one does.
```

Other sites in the handler that follow: `validateStepManifest` / `validateTechniqueFetches` / the no-manifest warning (`:735-744`) take the resolved retiring activity instead of `state.currentActivity`; `validateReportedExit` (`src/utils/validation.ts:239-254`) satisfies a reported exit when `activity_id` is among `destinationTargets(binding.to)` and compares set-wise on a fan enter; `validateActivityTransition` (`:45-51`) flattens; `_meta.batch` (`:959-973`) resolves the exiting activity the same way; and the trace payload's `act` (`:983`) stamps the **retiring** activity, not `activity_id` — otherwise all three branch segments carry the join's id.

## `get_activity`: the worker names its activity

`get_activity` gains the parameter `get_technique` already has (`resource-tools.ts:654-661`), so this is **Convention Over Invention**, not invention:

```ts
      activity_id: z.string().optional().describe('Optional. The activity you were dispatched for. Omit while one activity is in flight; required while several are, and refused when the session is not on the activity you name.'),
```

Resolution replaces `const activity_id = state.currentActivity` (`:1027`): the named entry when it is in the frontier, the sole entry when nothing is named, a refusal otherwise.

```
get_activity: this session is on 'codebase-comprehension', not the 'research' you were dispatched for. Report the mismatch to your orchestrator rather than retrying without activity_id.
get_activity: 3 activities are in flight (research, codebase-comprehension, implementation-analysis). Pass activity_id naming the one you were dispatched for.
No activity in flight. Call next_activity first.
```

`get_technique`'s existing guard becomes the same membership test with the same voice, and `state.currentActivity` at `resource-tools.ts:668-716` becomes the resolved activity. This changes `verify-dispatched-activity` (`activity-worker.md:82-84`): the half that compared the returned id against the bound id moves to the server, which refuses rather than relying on a worker-side comparison — **Encode Constraints as Structure**, and a *stronger* check than the worker's, because the worker could skip it. The half that guards against reading an earlier response this context still holds survives and stays a rule.

## Two shared guards, not a per-tool rule

`yield_checkpoint` (`workflow-tools.ts:1642-1679`) and `dispatch_child` (`resource-tools.ts:566,610`) each write one activity id into the record and cannot be answered while several are in flight. One helper beside `assertNoActiveCheckpoint` (`src/utils/session/params.ts:62-70`):

```
Cannot yield checkpoint 'research-convergence': 3 activities are in flight (research, codebase-comprehension, implementation-analysis), and a session holds one outstanding decision at a time. Finish this activity without the gate, or report the outcome one of its own exits provides.
```

This is not redundant with F10. F10 keys on *declared* checkpoint steps; `yield_checkpoint` also admits a gate no definition mentions, when the call carries `message` and at least two `options` (`:1663-1679`), which no static check can see. Different populations, both needed. And the refusal is what keeps `assertNoActiveCheckpoint` (`params.ts:62-70`) from gating every sibling's `get_activity`, `get_technique` and `get_resource` — the failure that makes a mid-branch gate a deadlock rather than a delay, since `progressive-step-technique-load` (`activity-worker.md:86-88`) has most branches fetching lazily mid-activity.

`present_checkpoint` / `respond_checkpoint` / `resume_checkpoint` key on `activeCheckpoint.activityId`, not the cursor, and are unreachable during a fan. No change. `get_resource`'s provenance annotation (`resource-tools.ts:401`) omits its activity context while several are in flight — it is an annotation, not a contract. **Upgrade trigger:** a fan branch that must trigger a child workflow, or read a provenance-annotated resource.

Reporting readers render the whole list: `get_workflow_status`'s `current_activity` (`:2231`) becomes `current_activities: string[]` (the repo forbids compatibility layers, so the singular field goes), and `projectIdentity` (`:207`), `projectActivities` (`:260`), `inspect_session` (`:334`), `logging.ts:104` and `:2247` follow.

## `workflow-engine::dispatch-fan`

A new operation, not a mode on `dispatch-activity`. `dispatch-activity` is atomic over one activity — enter one, mint one, compose one, spawn one, await one, account for one, read one routing (`dispatch-activity.md:48-62`). A fan mode makes one technique carry two procedures a caller selects exactly one of (`alternate-ops-as-protocol-sequence`), forces its Rules to say "when the destination is a list, do X instead" (the shape **Prefer Removing the Thing That Needs a Prohibition** says to split), and pluralises `worker_result` / `worker_agent_id` for consumers whose `when` gates cannot test a list. **Atomic Techniques; Compose at Activities** and **SOLID at the Definition Layer**'s single-responsibility clause both point to two capabilities composed at the activity. Inlining the procedure into the activity YAML is `no-inline-content` and **Modular Over Inline**.

The contract, authorable as `workflows/meta/techniques/workflow-engine/dispatch-fan.md`:

> ## Capability
>
> Run a fan of independent activities in one turn and hand back the destination they converge on.
>
> ## Inputs
>
> ### branch_activities
> The activities to run together, in the order the graph names them.
>
> ### exiting_result
> The `activity_complete` envelope of the activity whose exit fans — its exit, step manifest, variable writes and artifacts travel on the fan-enter call.
>
> ### session_index
> `session_index` of the session whose activities are being dispatched.
>
> ### agent_technique
> Canonical agent technique for each branch worker — default workflow-engine::activity-worker.
>
> ### state
> Current variable state for stub substitution (`session_index`, `workflow_id`, `activity_id`, `agent_id`, …).
>
> ### planning_folder_path
> *(optional)* Path to the planning folder whose `README.md` Progress surface is updated. Unset until the folder exists.
>
> ## Outputs
>
> ### branch_results
> The envelope each branch returned, passed through unchanged, in `{branch_activities}` order.
>
> ### join_activity
> The activity the fan converges on, as the last branch's `next_activity` entered it.
>
> ### trace_tokens
> The opaque HMAC-signed trace tokens this fan accumulated, one per `next_activity` call that returned `_meta.trace_token`.
>
> ## Protocol
>
> 1. **Progress in-progress:** Apply sync-progress-status once per branch with `{planning_folder_path}` for the dispatch moment in Progress Status call sites (`activity_id` = that branch). Each Apply selects only its own branch's rows, so the passes touch disjoint cells (`preserve-unrelated-rows`). Publish all of them with ONE version-control::commit-regular-files naming the planning folder `README.md` alone, per one-mark-commit-per-fan.
>    > When `{planning_folder_path}` is unset, skip this phase.
> 2. Call `next_activity { session_index, activity_id: branch_activities, from_activity, exit, step_manifest, variables_changed, artifacts_produced }` from `{exiting_result}` — the fan enter, carrying the whole list exactly as the graph names it. Capture `_meta.trace_token` and accumulate it per dispatch-activity's accumulate half.
> 3. Mint one `agent_id` per branch, each distinct from the others and from the session's own, per delivery-keys-on-agent-context and one-identity-per-branch. Apply compose-prompt once per branch with `{agent_technique}`, `holds_prior_deliveries: false`, and `{state}` — that branch's `activity_id` and its minted `agent_id`.
> 4. Apply harness-compat::spawn-concurrent with the composed prompts as `agents`; await `results`, one envelope per branch in input order.
>    > - For a branch whose envelope is not an accepted result, take the replacement ladder for that branch alone, per liveness-is-tested-per-branch.
>    > - One replacement per branch; beyond that, apply sync-progress-status for the blocked moment for that branch's rows and surface it, per one-replacement-then-blocked.
> 5. **Persist once:** Apply commit-and-persist naming every branch, before any branch's transition, per persist-the-fan-before-any-branch-returns.
> 6. For each branch in `{branch_activities}` order: call `next_activity { session_index, activity_id: <the destination that branch's exit names>, from_activity: <that branch>, exit, step_manifest, variables_changed, artifacts_produced, agent_id }`; accumulate `_meta.trace_token`; account for that branch per account-every-activity. The response reports `_meta.barrier` — the branches still in flight, or the destination it entered.
> 7. Return `{join_activity}` from the last branch's response.
>
> ## Rules
>
> ### one-identity-per-branch
> Each branch takes its own `agent_id`, distinct from every sibling's and from the session's own. A shared identity collapses one branch's delivery into a marker a sibling that never received the bytes cannot read, and an identity equal to the session's own is exempt from the batch bound (`src/utils/batch.ts:154`).
>
> ### a-branch-takes-one-activity
> A branch worker carries exactly the activity it was dispatched for. The destination its exit names belongs to the fan and is entered once, after the last branch returns, so a branch's reported `next_activity_id` and `batch_may_continue` are not this operation's to act on. Its reported exit is: that is what the branch resolved against its own activity's exits.
>
> ### liveness-is-tested-per-branch
> Every branch has returned something by the time the turn resumes, so the replacement ladder is taken per branch against the returned batch rather than against one awaited agent. Where the harness keeps a returned agent addressable, a branch still owing an envelope is continued under its own identity.
>
> ### one-replacement-then-blocked
> A branch gets one replacement. Beyond that the fan surfaces blocked and advances nothing: that branch is still in flight, so the destination is not enterable, and a later resume derives the same fan from the session record.
>
> ### one-mark-commit-per-fan
> The in-progress marks for every branch reach the remote in one commit, made before the turn that spawns them. All branches spawn in the same turn, so there is one window and one reader; a commit per branch pushes against a remote the previous push just moved and publishes nothing more (`dispatch-mark-reaches-the-remote`).
>
> ### persist-the-fan-before-any-branch-returns
> The fan's artifacts and status are committed and pushed once, naming every branch, before the first branch's transition — so `commit-after-activity` holds for all of them. The branches write one working tree in one turn, so changes there are indistinguishable by author and a per-branch commit attributes one branch's in-flight edits to another.
>
> ### say-what-a-fan-is-doing
> `say-what-a-dispatch-is-doing` governs at fan grain: before the turn that spawns them, name every branch about to run, say that the fan reaches no gate, and quote roughly how long. A fan produces nothing readable while it runs and returns all at once.

It cites `account-every-activity`, `delivery-keys-on-agent-context`, `reject-partial-worker-result`, `batch-is-bounded-by-the-server`, the trace-accumulate rule and `resolve-trace-at-close-out` rather than restating any of them (`canon-layer-cites-not-restates`). It names no activity and no stage, so it is stage-agnostic (**Keep Orchestration in Structure**, `technique-stage-agnostic`) and serves any fan in any workflow.

## Where the barrier sits, and why the wait costs nothing

Two places, and both are needed.

**The turn boundary**, inside step 4. `harness-compat/claude-code.md:26-27` rule `concurrent`: "Emit multiple `Agent` calls in a single response turn; the harness executes them in parallel" / "Wait until every agent yields or completes before treating the batch as finished." The turn does not resume until every tool result returns, so the wait is free — it is the harness's own scheduling, not a scheduler this design writes. `spawn-concurrent.md:34` collects the results "in input order" and `harness-compat/TECHNIQUE.md`'s `foreground-always` makes the blocking-equivalent wait a contract rather than an option.

**The store**, in `next_activity` step 4 above. Orchestrator discipline is not enforcement (**Encode Constraints as Structure**), and the frontier makes the barrier a predicate on one field: the join is entered by exactly the call that empties the frontier. A crashed and resumed orchestrator re-derives the same barrier from `session.json` with no extra state.

## Bind sites

`workflows/meta/activities/03-dispatch-client-workflow.yaml` is the one activity in the corpus whose executor holds the dispatch primitive: `activities/README.md:45` — it "Drives the client workflow end to end inline", executed by the top-level agent the bootstrap protocol addresses, which is why it can already bind `dispatch-activity` (whose step 4 spawns). `spawn-agent.md:44-46` `depth-1-only` sanctions this design in advance: "Parallel scatter is available only where the dispatch primitive is — at the orchestrator. Hoist a pass there when its fan-out is worth an orchestrator-owned step." That is why `orchestration-patterns::dispatch-workers` is left alone: all seven of its binding sites are activities executed by dispatched workers, which hold no primitive, so neither of its branches is executable there.

The `when` dialect (`src/schema/activity.schema.ts:74-75`) admits `== != > < >= <=`, bare-identifier truthiness, unary `!`, `&&`, `||` and parentheses — no list test, no length, no indexing. So N-ness lives inside one step of one iteration and never reaches a gate. Three new steps, two gate edits, one `continueWhile` edit; the checkpoint trio, `commit-activity-artifacts` and `release-spent-worker` are untouched.

```yaml
    continueWhile:
      type: or
      conditions:
        - type: simple
          variable: current_activity
          operator: "!="
          value: null
        - type: simple
          variable: current_branches
          operator: "!="
          value: null
```

(`type: or` with `conditions[].min(2)` is `ConditionSchema` as declared at `src/schema/condition.schema.ts:24-28` and evaluated at `:35`.)

Loop body, in document order:

1. `continue-batched-worker` — unchanged. On a fan iteration `worker_agent_id` is null, so the gate is false.
2. `dispatch-activity` — `when: "!worker_agent_id && current_activity != null"` (one clause added).
3. **`dispatch-fan`** — NEW, `kind: technique`, `when: current_branches != null`:
   ```yaml
      - kind: technique
        id: dispatch-fan
        when: current_branches != null
        technique:
          name: workflow-engine::dispatch-fan
          inputs:
            branch_activities: current_branches
            exiting_result: worker_result
            session_index: client_session_index
            agent_technique: workflow-engine::activity-worker
            state: variables
          outputs:
            join_activity: current_activity
   ```
   The output remap is `binding-carries-only-deviations`'s sanctioned form, so no `set` copies one bag name onto another.
4. **`close-fan`** — NEW, `kind: action`, `when: current_branches != null`: `set current_branches = null`, `set worker_result = null`. The fan iteration has no worker result, and nulling it is what leaves steps 5–11 false without re-authoring any of their gates. Precedent in this same file: `release-spent-worker` already nulls `worker_agent_id` for exactly this reason (`:103-109`).
5–7. `present-yielded-checkpoint` / `respond-yielded-checkpoint` / `resume-yielded-worker` — unchanged.
8. `commit-activity-artifacts` — unchanged.
9. `advance-activity` — `when: worker_result.result_type == "activity_complete" && !worker_result.next_activity_ids` (one clause added; dotted bare truthiness is already in use at `:44`).
10. `release-spent-worker` — unchanged.
11. **`advance-to-fan`** — NEW, `kind: action`, `when: worker_result.result_type == "activity_complete" && worker_result.next_activity_ids`: `set current_branches = "{worker_result.next_activity_ids}"`, `set current_activity = null`.

Steps 9 and 11 are disjoint by construction and each fully determines both variables, so no path leaves either undefined (`unproduced-value-read`). They are not a derived shadow of one another (`no-derived-state-shadow`): neither is a projection of the other, they are the two shapes `exit_destinations[exit]` takes under fixed decision 1, and exactly one is ever populated because `finalize-activity` copies whichever it read. `current_branches` is produced and consumed inside this one activity, so it needs no declaration for the same reason `current_activity` needs none today — `undeclared-crossing` (`scripts/check-activity-variables.ts:157-169`) reports only a name some *other* activity consults. `record-client-completion` and the `null` exit both gate on `current_activity == null` and are unchanged.

## Envelope and routing changes

`finalize-activity.md` gains one output beside `next_activity_id`:

> #### next_activity_ids
> The activities the exit taken fans to, where the graph names several. Exactly one of this and `next_activity_id` is present on every successful `activity_complete`: the destination is either one activity or a fan, and the envelope reports whichever this context read.

and `next_activity_id`'s "Required on every successful `activity_complete`" narrows to that same sentence. Protocol step 2 folds whichever shape it read. Two disjoint fields, because the drive loop's gates cannot test a list.

`evaluate-transition.md` — the `exit_destinations` input (`:16-18`) states that a destination may name several activities; protocol step 4 (`:43`) reads the destination under the exit taken and reports `next_activity_id` when it is one activity, `next_activity_ids` when it is a fan; the Outputs section gains `next_activity_ids`. This operation is the single home for reading where an exit sends the run, so the one-or-many shape is read here and nowhere else.

`src/loaders/core-ops.ts` — add `harness-compat::spawn-concurrent` and `workflow-engine::dispatch-fan` to `CORE_ORCHESTRATOR_TECHNIQUES` (`:23-71`). The comment at `:47-65` states the mechanism: "A technique named inside another technique's Protocol has no other delivery path — `get_technique` resolves only step-bound or first-declared techniques, and no tool loads a technique by id — so an orchestrator without these entries reaches the dispatch step with nothing to apply and improvises the invocation." `resolve-harness-operation` and all four harness files are already listed and `claude-code.md:24-27` already carries the `concurrent` Rules section; only the generic operation is missing. Also add `workflow-engine::dispatch-fan` to `workflows/meta/workflow.yaml` `techniques.workflow` (`:13-19`).

Rule amendments, so no surviving description of a singular topology reads as current fact: `orchestrator-conduct.md` `no-domain-work` (`:12-14`) names `dispatch-fan` as a delegation route beside `dispatch-activity`, and `one-level-of-indirection` (`:16-18`) states the invariant positively — every agent touching a run is one the orchestrator placed there, whatever the width of a dispatch (width is not depth; the three branches are siblings at depth 1 and none dispatches anything). `dispatch-activity.md` `dispatch-topology` (`:88-90`) names the fan route. `activity-worker.md` gains one rule: a branch of a fan reaches no gate — `yield_checkpoint` is refused for it, and the remedy is to complete the activity or take a declared blocked exit. `continue-batch.md` `one-advance-per-activity` (`:68-72`) states that a call naming an activity the frontier no longer holds is refused, so the second-advance hazard is answered at the tool. `commit-and-persist.md` `commit-after-activity` (`:36-41`) states that a fan persists once, at convergence, naming every branch, before the first branch's transition. `planning-readme.md`'s Progress Status call sites (`:165-179`) gains the fan's two moments and states that `mark_progress_na` is one value per persist, so no two branches may set it. `docs/dispatch-model.md` gains a fan section: the frontier as the cursor, the two barrier points, and the measured premium — a fan of three costs 232,954 characters standalone against 159,093 batched (`:79`), plus three context establishments where `:62` puts the establishment saving at two-to-four times the collapsing saving, and the per-scope bound does not limit a fan's width because each branch scope takes exactly one activity (`src/utils/batch.ts:149-160`).

No change to `src/utils/batch.ts`. A branch cannot be continued because `dispatch-fan` writes neither `worker_result` nor `worker_agent_id`, so `continue-batched-worker`'s gate is structurally false, and the frontier's retiring-entry check is the backstop if it were ever authored otherwise. **Upgrade trigger:** a fan branch that must legitimately take a second activity.

### namespacing

## The branch key: derived

```
branch_key(activity_id) = activity_id with every hyphen replaced by an underscore, then '_outputs'
```

`research` → `research_outputs`; `codebase-comprehension` → `codebase_comprehension_outputs`; `implementation-analysis` → `implementation_analysis_outputs`. Homed in `src/schema/graph.ts` as `branchKey(activityId)`, beside `fanGroups`.

**Derived, not declared in the graph**, for three structural reasons. A graph-declared key is a second name for the branch that has to be kept in agreement with the activity id, and two fans could spell one activity's key differently (`canonical-fact-home`, **One Authoritative Home**). It is unknowable to a worker — `worker-control-plane-ban` bars `get_workflow` (`activity-worker.md:62-64`) — so a declared key would travel as per-dispatch data the envelope contract does not carry, and every consumer would need the graph in hand to spell it. And it is unforgeable: a derived key cannot be mistyped in the graph, so the load-time agreement between a fan and its destination's declared reads is mechanical rather than authored (**Encode Constraints as Structure**).

**The `_outputs` suffix**, rather than the bare snaked id, makes the derivation total. `VariableNameSchema` (`src/schema/variable.schema.ts:6-9`) requires `QUALIFIED_DATA_ID_PATTERN = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/` (`src/schema/identifiers.ts:16`) — a qualified snake noun phrase of at least two words — or a listed bare-word exemption (`:30-46`). `codebase_comprehension` and `implementation_analysis` pass alone; `research` does not, and would need an `EXEMPT_DATA_IDS` entry for every single-word activity id in the corpus. One uniform suffix removes that exemption list. `_outputs` is the plural item-noun collection shape `collection-id-shape` sanctions — the members are the activity's outputs, a fixed declared set rather than a dynamic key space, so the singular-mapping-name form does not apply. Hyphens are excluded because the bag-name grammar excludes them (`variable-binding.md:18`) and `snake-case-symbols` requires snake for any symbol binding to session state.

A branch key is a property of the activity, not of the fan, so two fans containing one activity write the same key and the second landing replaces the first's object whole — `applyVariableWrites` assigns (`src/utils/variable-seed.ts:93`), it never merges, which is the only behaviour consistent with there being no merge policy. Stated positively: *a branch key holds the outputs of the most recent visit to its activity; a destination that needs an earlier visit's values gathers them into a name of its own at that visit.* That is the shape `unreachableReads` already models as its `re-entry` finding kind (`src/utils/activity-variables.ts:653-669`).

## Where the namespacing happens: the server, in `next_activity`

Immediately before `applyVariableWrites` (`workflow-tools.ts:804-810`), keyed on the retiring activity the frontier resolved:

```ts
        // A fan branch's outputs land whole under the branch's own key, so two branches cannot
        // collide by construction. The key is derived from the graph this handler already loaded —
        // never supplied by a caller — which is what makes the namespace the only route a branch's
        // values have into the bag. Corpus rule: meta/techniques/scatter-gather.md#isolation-then-combine.
        const writes = isFanBranch(result.value.graph, exitingActivity)
          ? { [branchKey(exitingActivity)]: variables_changed }
          : variables_changed;
```

`applyVariableWrites` needs no change to store it: `draft.variables[name] = value` (`variable-seed.ts:93`) is a flat assignment of whatever value it is given, which is precisely the whole-object landing a dotted read requires.

**Not the worker.** An operation's Outputs are a bind contract stating what the value *is*, never which caller or graph position produced it (**Separate Contract from Procedure**, **Maximize Schema Expressiveness**'s "I/O contracts stay portable", `contract-not-procedure`). A worker that namespaced its own outputs would rename every landed output by call site, which `binding-carries-only-deviations` and `generic-not-overfit` forbid, and would desynchronise the guard: `deriveActivityContract` reads writes off the composed operation signature and the step-binding remap target (`activity-variables.ts:430-440`) and knows nothing about graph position. The worker also cannot know it — `worker-control-plane-ban`.

**Not the orchestrator.** It *can* see the fan (`get_workflow` returns `graph: wf.graph` verbatim, `workflow-tools.ts:663`), so it could wrap on relay. But then "no branch writes a bare name" is a habit, and a relay that forgets to wrap lands bare names in total silence: `applyVariableWrites` skips both the declared-type and the value-set check when `declarations.get(name)` misses (`variable-seed.ts:76-92`), so an unwrapped `assumptions_log` from two branches simply clobbers, warning-free.

The wrap is per (workflow, activity): `research` is un-fanned in the current work-package graph, so its writes stay flat there. Same rule as `mergeActivityVariables`'s per-workflow contribution — inclusion is the registration (`activity-variables.ts:14-17`).

The two *other* write paths out of an activity are not wrappable and are closed rather than namespaced. `yield_checkpoint` applies `variables_changed` at bare names (`workflow-tools.ts:1739-1744`) and `respond_checkpoint` applies a checkpoint option's `setVariable` at bare names (`:2071-2077`), both keyed on the single `activeCheckpoint.activityId`. Load check **F10** and the `yield_checkpoint` refusal close both, so `next_activity`'s `variables_changed` is the only path a branch has and it is wrapped. **Prefer Removing the Thing That Needs a Prohibition**, rather than a second wrapping rule for the checkpoint channel.

Inside a branch, names stay bare: a branch's later steps read its earlier outputs as `internalReads` (`activity-variables.ts:374-380`), never through the key.

## The downstream read, and the gather step

A destination reads `{research_outputs.open_assumptions}` — the dotted form `variable-binding.md:18,20-21` already defines: nested-object outputs land whole, and the structured-condition evaluator and the template interpolator walk the dotted path. A flat key literally named `research_outputs.open_assumptions` would never be found by that walker, which is why the branch's whole map lands as one object under one key.

The gather is an ordinary technique step in the destination activity, using the two deviation forms `binding-carries-only-deviations` already sanctions — the dotted-projection template and the output remap. No new construct:

```yaml
      - kind: technique
        id: gather-branch-assumptions
        technique:
          name: review-assumptions::reconcile
          inputs:
            research_assumptions: "{research_outputs.open_assumptions}"
            comprehension_questions: "{codebase_comprehension_outputs.open_questions}"
            analysis_assumptions: "{implementation_analysis_outputs.open_assumptions}"
          outputs:
            reconciled_assumptions: open_assumptions
```

The destination declares the three branch keys under `variables.reads`, which is what puts them in the guard's namespace. There is no *implicit* way to read a branch member — the bare name no longer lands — so "a destination that needs a combined value declares a step that gathers it" is structural rather than a rule. That is fixed decision 2's payoff, and it is `isolation-then-combine` (`workflows/meta/techniques/scatter-gather.md:30-32`) raised to graph grain: "Per-instance outputs are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber across instances. Combination happens exclusively in the combine phase." A fanned activity is the work unit, its branch key is the isolated slot, the destination's gather step is the delegated combine. `scatter-gather.md` gains that application, and `one-gather-contract-two-scatter-modes` (`:22-24`) gains the graph fan as a third scatter mode over the same combine contract — otherwise the rule reads as covering only in-activity `spawn-concurrent` and the graph fan looks like `duplicate-shared-capability`.

## The `activity-variables` guard change

The read side already resolves correctly: `TOKEN_RE` (`activity-variables.ts:213`) is dotted and `bagName()` (`:216-218`) takes the head, so `{research_outputs.open_assumptions}` reads as `research_outputs` wherever it appears — step binding, message, technique prose, `when`, structured condition. What breaks is the *write* side and *member* grain. Three changes in `src/utils/activity-variables.ts`, one in the guard script, one in provenance.

**1. One grammar, one home.** `tokenReads`, `whenReads` and `conditionReads` return the *full* reference instead of pre-splitting it, and `read()` does the split:

```ts
  const references = new Set<string>();
  const read = (reference: string): void => {
    const name = bagName(reference);
    if (!isBagRead(name)) return;
    mentions.add(name);
    if (reference !== name) references.add(reference);
    if (!namespace.has(name)) return;
    consumes.add(name);
    if (producedSoFar.has(name)) internalReads.add(name);
    else reads.add(name);
  };
```

`isBagRead` filtering moves from the three collectors into `read`, where the single grammar belongs. Callers that already pass a bare name (`read(bound)` at `:422`, `routingRead`, `passContext` at `:481`) are unaffected. `DerivedContract` gains `references: Set<string>`.

**2. Re-key a fan member's productions.** `deriveActivityContract` takes an optional `branchKey`; when set, every bare production is recorded as a *member* of that key and the key is the write:

```ts
  const branchMembers = new Set<string>();
  const write = (name: string): void => {
    produces.add(name);
    producedSoFar.add(name);
    if (branchKey !== undefined) {
      branchMembers.add(name);
      if (namespace.has(branchKey)) writes.add(branchKey);
      return;
    }
    if (namespace.has(name)) writes.add(name);
  };
```

`landed()` (`:432-440`) takes `branchKey` in place of the bag name for `artifactWrites` and `persistedProductions`, so the artifact-write exemption at `check-activity-variables.ts:217` keeps applying and an artifact-valued branch output does not become an `unread-write`. `DerivedContract` gains `branchMembers: Set<string>`.

**3. Traversal and the meet.** `ActivityGraph` (`:532`) becomes edge-grouped — one `string[]` per bound exit, length 1 for an ordinary edge and greater for a fan — because the flat form throws away the grouping the join semantics need, and a parallel structure carrying the grouping could disagree with the first. `activityGraph` (`:543`) builds that from `destinationTargets`; the three successor reads (`:608` BFS, `:691` Tarjan, `:708` the self-loop test) take a shared `successors()` that flattens and dedupes. The predecessor index (`:595-598`) splits into `plainPredecessors` — the old index minus every branch→join edge belonging to a fan — and `fanArrivals`, join → the array of branch sets. The meet (`:627-644`) becomes intersection over **arrivals**, where a completed fan is *one* arrival contributing the **union** of its branches' `outgoing`:

```ts
      // A fan is ONE arrival: the barrier releases only when every branch has returned, so what is
      // available is the union of what the branches leave. Control still arrives by exactly one
      // arrival, so the arrivals meet by intersection.
      const arrivals: Array<Set<string>> = [];
      for (const branches of fanArrivals.get(id) ?? []) {
        const union = new Set<string>();
        let live = false;
        for (const b of branches) {
          if (!reachable.has(b)) continue;
          live = true;
          for (const name of outgoing(b)) union.add(name);
        }
        if (live) arrivals.push(union);
      }
      for (const from of plainPredecessors.get(id) ?? []) {
        if (reachable.has(from)) arrivals.push(outgoing(from));
      }
      if (arrivals.length === 0) continue;
      const next = new Set<string>();
      for (const name of arrivals[0]!) {
        if (arrivals.every((a) => a.has(name))) next.add(name);
      }
```

Three ways to apply this and have it do nothing. A branch must be **removed** from `plainPredecessors[join]`, or the branches appear both as one union arrival and as three intersecting ones and the intersection wipes the union straight back out. The candidate seed must move from `outgoing(sources[0])` (`:635`, the first *predecessor*) to `arrivals[0]`, or a union arrival's extra names are never candidates. And a branch head's own predecessor is ordinary — `plainPredecessors[research] = [plan-prepare]`, the fan source's post-state is where each branch starts.

Termination is unaffected: the analysis descends from `universe` to a fixed point over the powerset lattice ordered by superset (`:614-620`), `outgoing(b)` is non-increasing across iterations, and both union and intersection of non-increasing sets are non-increasing. The change is the meet operator, not the lattice. And the lattice does not need to change *because* branch writes are namespaced: `bagName` resolves a downstream `{research_outputs.x}` to one flat name, so a branch contributes exactly one bag name. Had branches written bare shared names the join would need a per-name provenance lattice instead of a set of names.

**4. The guard script** (`scripts/check-activity-variables.ts`). Compute `fanMembers: Map<string, string>` (activity id → branch key) from `fanGroups(workflow.graph)`; pass `branchKey` into `deriveActivityContract` for a member; add every branch key to `declaredAnywhere` (`:110-113`) so `undeclared-crossing` does not fire on it; and re-key a member's `declaredWrites` (`:125`) to the single synthesized `{ name: branchKey(id), type: 'object' }`, retaining the authored declarations as that key's members. The read side needs no namespace work: `research_outputs` is already in `namespace` because the destination declares a read of it (`:102-105`), and `writersOf` (`:184-191`) picks it up from the re-keyed `declaredWrites`. Without the re-key, one correct fan definition draws three simultaneous false families — `unused-declaration` on the destination's read and on every branch write, `unwritten-read` on the branch key, `unread-write` on every branch output — while staying silent on the case that matters.

Two member-grain reports, under **existing family names** so no new ledger and no new registry entry:

- `unwritten-read`, member grain, from `references`: for a reference whose head is a branch key, the first tail segment must be one of that member's `branchMembers`. `reads 'research_outputs.open_assumtions', which 'research' does not produce; it lands assumptions_log, open_assumptions, research_document`. This is the one check that catches a gather naming a member no branch produces — `unproduced-value-read` with no other detector — and it is why the members are retained at all.
- `unread-write`, member grain: a member no destination's `references` names. `writes 'research_outputs.challenge_findings', which nothing in this workflow gathers`.

And one new family, `fan-artifact-collision`, computed from the `artifact.name` templates the composed signatures already carry (`activity-variables.ts:310-312` already `tokenReads` them): `The fan at 'plan-prepare.done' has 'research' and 'implementation-analysis' both writing artifact 'assumptions-log.md'. Two activities running together resolve one filename to one file, so one branch's writes land in the other's document.` It lives in the guard rather than the loader because it needs composed technique signatures, which the loader does not compose and must not start composing on the per-call load path. That is the home split: **shape rules decidable from the graph object go in the loader; rules needing composed signatures go in the guard.** Templates that are not literally distinguishable fail closed.

**5. Provenance.** `src/utils/binding-provenance.ts:275-276` builds `TOKEN_RE` and `EXACT_TOKEN_RE` from `IDENTIFIER_PATTERN` with no dotted tail, so `{research_outputs.open_assumptions}` matches neither and `resolveInputSource` (`:304-310`) falls to the generic template branch, reporting `unresolved: false` with no head provenance. Admit the dotted tail and resolve on the head, matching the grammar at `activity-variables.ts:213-218`. This is pre-existing — `variable-binding.md:31` already sanctions dotted projections and `workflows/work-package/activities/08-implement.yaml:102` already uses `-p {current_task.crate}` — but every gather is dotted, so it becomes load-bearing, and two modules holding two spellings of one grammar is the coupling **SOLID at the Definition Layer** names.

**Not changed:** `applyVariableWrites` gains no member-grain validation. With one container declared, only `type: object` is checked and each member's declared type and value set stops being validated at runtime — including `context_scope`'s three-value set (`04-research.yaml:35-39`). Carrying members into the schema would put a new authorable field on `VariableDefinition`, which would generate into `workflow.schema.json` and become a second home able to disagree with the derivation, to preserve a warn-only runtime check the guard already covers statically at hard zero. **Upgrade trigger:** a wrong-typed branch member reaching a destination undetected in practice.

One correction to a stated ground fact, carried forward: the brief names `computeUnavailableReads`. No such symbol exists in `src/`, `scripts/` or `tests/`. The function is `unreachableReads` (`activity-variables.ts:574`), fed by `activityGraph` (`:540`), sole caller `scripts/check-activity-variables.ts:232`. It is also not one forward walk: a forward reachability BFS from `initialActivity` (`:602-609`) decides scope, then a backward definite-assignment fixed point over a predecessor index (`:595-598`, `:627-644`) decides availability. The traversal fix lands on the first, the union semantics on the meet inside the second.

### enforcement

One row per invariant. Home column: **schema** = carried by the zod type, surfaced as a parse error; **loader** = `validateExitBindings`, fails the load; **guard** = `check-activity-variables`, a hard-zero finding in the existing registry entry (`scripts/guards.ts:38-44`); **tool** = a server refusal at the MCP boundary; **derived** = made unrepresentable, so nothing needs to be checked.

| # | Invariant | Home | Keys on | Reports |
|---|---|---|---|---|
| 1 | A fan names at least two activities | schema | `z.array(z.string()).min(2)` on `DestinationSchema` | `graph.plan-prepare.done: Array must contain at least 2 element(s)` |
| 2 | Every fan member is an activity this workflow contains | loader | `knownActivityIds` per target from `destinationTargets` | `Workflow graph sends 'plan-prepare.done' to 'reserch', which this workflow does not contain.` |
| 3 | No member listed twice | loader | `new Set(targets).size` | `Workflow graph fans 'plan-prepare.done' to 'research' twice; a fan runs each of its activities once.` |
| 4 | No member is `__terminal__` | loader | `TERMINAL_SENTINEL` | `…fans 'plan-prepare.done' to '__terminal__'. Every branch of a fan returns to one destination, and an activity that ends the run never returns.` |
| 5 | No member is the activity the exit leaves | loader | `target === activityId` | `Workflow graph fans 'plan-prepare.done' to 'plan-prepare', the activity the exit leaves.` |
| 6 | Every member declares at least one exit | loader | the member's own bindings, empty | `Activity 'research' is a fan branch of 'plan-prepare.done' and declares no exit, so the fan has no destination to converge on.` |
| 7 | No member fans again (no nested fans) | loader | `isFan` on a member's own destination | `…its exit 'done' fans to 'deep-dive, survey'. A branch does not fan again — every exit of a branch binds to the activity the fan converges on.` |
| 8 | All of a member's exits bind to one destination | loader | size of the member's flattened destination set | `…sends its exits to 'assumptions-review, plan-prepare'. Every exit of a branch binds to the one activity the whole fan converges on, which is what the barrier is derived from.` |
| 9 | Every member's single destination is the same one — **the barrier derivation** | loader | equality across members' singletons | `The fan at 'plan-prepare.done' converges nowhere: 'research' and 'codebase-comprehension' send their exits to 'assumptions-review', and 'implementation-analysis' sends its to 'plan-prepare'.` |
| 10 | The converged destination is an activity | loader | `join !== TERMINAL_SENTINEL` | `…converges on '__terminal__'. A fan converges on an activity, because the destination is entered once after the last branch returns.` |
| 11 | The converged destination is not itself a member | loader | `branches.includes(join)` | `The fan at 'plan-prepare.done' converges on 'research', which is one of its own branches.` |
| 12 | No member declares a checkpoint step | loader | `activityCheckpoints(activity)`, post-materialization, over flattened steps | `Activity 'research' … declares checkpoint 'research-convergence'. A session holds one outstanding decision at a time … Move the gate to the activity the fan converges on, or take this activity out of the fan.` |
| 13 | No two members of one fan write one artifact filename | guard | `artifact.name` templates on the composed signatures, pairwise | `fan-artifact-collision`: `The fan at 'plan-prepare.done' has 'research' and 'implementation-analysis' both writing artifact 'assumptions-log.md'…` |
| 14 | A destination's dotted read of a branch key names a member some branch produces | guard | `derived.references` head against `fanMembers`, tail against `branchMembers` | `unwritten-read`: `reads 'research_outputs.open_assumtions', which 'research' does not produce; it lands assumptions_log, open_assumptions, research_document` |
| 15 | Every branch member is gathered somewhere | guard | `branchMembers` against every record's `references` | `unread-write`: `writes 'research_outputs.challenge_findings', which nothing in this workflow gathers` |
| 16 | A branch's reads are checked, and the join's availability is the union of its branches' | guard | edge-grouped `ActivityGraph`, `fanArrivals` + `plainPredecessors`, arrival-intersection meet | `unreachable-read` kinds `entry` / `re-entry` — and, unfixed, **nothing at all**: `graph.has(array)` is false so no branch head is `reachable`, and `predecessors.get(array)` is undefined so `sources.length === 0` short-circuits and `incoming(branch)` stays at `universe`. Silent in a hard-zero guard with no ledger to diff. |
| 17 | A checkpoint inside a fan branch is audited for a review-mode consequential auto-advance | guard (`review-mode-gating`) | `reviewSuccessors` flattening list destinations, `check-review-mode-gating.ts:135-147` | Unfixed, silent under-report: `activities.get(array)` at `:156` is undefined, so the whole branch subtree drops out of `reachableInReview`. It parses raw YAML at `:190`, so the loader's fan checks do not protect it — import the destination type from `src/schema/graph.js` rather than re-declaring it at `:87`. |
| 18 | Only one activity is in flight when a gate is reached — including an undeclared ad-hoc gate | tool (`yield_checkpoint`) | `state.frontier.length > 1` | `Cannot yield checkpoint 'research-convergence': 3 activities are in flight … Finish this activity without the gate, or report the outcome one of its own exits provides.` Not redundant with #12: `yield_checkpoint` admits a gate no definition mentions when the call carries `message` and two `options` (`workflow-tools.ts:1663-1679`). |
| 19 | A tool that writes one activity id into the record is unambiguous | tool (`dispatch_child`) | the same `frontier.length > 1` helper | `Cannot dispatch a child workflow: 3 activities are in flight …` |
| 20 | A worker is served the activity it was dispatched for | tool (`get_activity`, `get_technique`) | `activity_id` against `state.frontier` | `get_activity: this session is on 'codebase-comprehension', not the 'research' you were dispatched for. Report the mismatch to your orchestrator rather than retrying without activity_id.` / `3 activities are in flight …; pass activity_id naming the one you were dispatched for.` |
| 21 | A call exits an activity the session is actually on | tool (`next_activity`) | `from_activity` against `state.frontier` | `Cannot exit 'research': the session is not on it. In flight: codebase-comprehension, implementation-analysis.` Also subsumes `one-advance-per-activity`'s second-advance hazard. |
| 22 | A branch return does not enter the destination while siblings are live — **the barrier** | derived | `draft.frontier.length === 0` after retiring | Nothing to report: entry is the same call that empties the frontier, so there is no second call that could enter early. `_meta.barrier = { pending: [...] }` is a reading, not a refusal. |
| 23 | Ambiguity is impossible while a fan is running | tool | `frontier.length > 1` with no explicit id | rows 18–21; one predicate, four messages |
| 24 | No branch writes a bare shared name | derived | server-side wrap keyed on `isFanBranch(graph, exitingActivity)` before `applyVariableWrites` | Nothing to report: `next_activity`'s `variables_changed` is a branch's only write path once #12 and #18 close the checkpoint channel, and that path is wrapped from the graph the handler already loaded. |
| 25 | At most one fan is open at a time, so the frontier needs no fan identity | derived | rows 7 + 8 + 9 | Nothing to report: a branch's exits all bind to a single non-list destination, so no branch can open a fan. |
| 26 | A branch cannot take a second activity | derived | `dispatch-fan` writes neither `worker_result` nor `worker_agent_id`, so `continue-batched-worker`'s `when` gate is false | Nothing to report; row 21 is the backstop if the gate were ever re-authored. |
| 27 | Load-time fan rules have exactly one home | — | no 37th `scripts/guards.ts` entry | A malformed fan cannot be walked at all, which is why `validateExitBindings` fails the load rather than warning (`workflow-loader.ts:513-516`). A guard for the same rules would let a session start on a graph the guard rejects. `workflow-yaml` (`guards.ts:267-274`) already fails the corpus on any load error, and `refs`, `audience`, `artifact-guides`, `stealth-isolation`, `session-contract` and `activity-variables` all load and inherit it. |
| 28 | Every fan-shape rule has a case proving it rejects | tests | `tests/workflow-loader.test.ts:329-397`, one case per row 2–12 plus `exitDestinations` flattening and `getExitBindings` carrying the set | The barrier is derived, so the only evidence it is derived correctly is a case per failure mode. |
| 29 | The walker can drive a fan, so branch checkpoints stay measurable | tests | `tests/e2e/walker.ts:53,254-273,293-306,727-744` | Unfixed: `pickNext` returns the array, `transition` sends it as `activity_id`, the tool's `z.string()` rejects, the walk throws, and `expect(walkErrors).toEqual([])` (`option-coverage.test.ts:168`) fails. Also `visits.get(array)` always misses, so the loop guard at `:661-663` stops tripping. |

**Deliberately unpoliced:** fan width. A cap is a policy number with no principled value that would need a config home, and the real bound is the harness's context, documented in `docs/dispatch-model.md`. The per-scope batch bound does not limit width — each branch scope takes exactly one activity, so `activities.length === 1` and the default cap of 3 never binds (`src/utils/batch.ts:149-160`). **Upgrade trigger:** a measured run that exhausts the orchestrator's context on a wide fan.

### staged plan

**Stage 0 — prerequisite, not this design's (issue #655).** Serialise every mutating handler's read-modify-write of `session.json` per session. What this design needs from it, in one line: **concurrent appends to `history` from N branch contexts must all survive, rather than the last writer winning** — a compare-and-swap on `seq` with retry, or a per-session write lock. The reload-then-save at `workflow-tools.ts:1517-1561` narrows the window but does not close it, and the events at stake are exactly the ones `batchActivities` / `deliveredChars` (`src/utils/batch.ts:72-123`) and `dispatchKind` (`src/utils/dispatch.ts:30-32`) derive the whole batch bound from. Must land before Stage 4. Stages 1–3 are safe without it — no fan executes.

**Stage 1 — the schema and the load gate.** New `src/schema/graph.ts` (`TERMINAL_SENTINEL`, `DestinationSchema`, `GraphSchema`, `destinationTargets`, `isFan`, `fanGroups`, `isFanBranch`, `branchKey`, `successors`); `workflow.schema.ts` re-exports and carries the new `.describe()` and doc comment; `npm run build:schemas`; `ExitBinding.to` widened and `exitDestinations` flattened; `validateExitBindings` gains enforcement rows 2–12; the four `TERMINAL_SENTINEL` import sites repoint (`src/utils/validation.ts:6`, `src/tools/workflow-tools.ts:11`, `tests/workflow-loader.test.ts:12`, `tests/e2e/walker.ts:22`) rather than being re-exported; `tests/workflow-loader.test.ts` gains row 28; the inventory row, `schemas/README.md:283,660-689`, and `npm run build:site`.

*Acceptance:* `npm run check:all` green with **zero** corpus diff — a union accepts every existing string and the corpus carries no list-valued edge, so every workflow loads byte-identically. `schemas/workflow.schema.json` shows the probed `anyOf` shape and `tests/generated-schemas.test.ts` is green. `tests/site.test.ts` green. One fixture fan loads; each of rows 2–12 fails the load with its stated message. Nothing can yet *execute* a fan and no corpus workflow declares one, so the capability is authorable and inert.

**Stage 2 — every graph reader made fan-aware.** `activityGraph` edge-grouped and the arrival meet in `unreachableReads` (row 16, and the shared `successors()` at `:608`, `:691`, `:708`); `check-review-mode-gating.ts:87,135-147` (row 17), importing the destination type; `tests/e2e/walker.ts` (row 29) and `scripts/smoke/smoke-orchestrator.ts:241,375-391`, which shares its `Graph` type; `src/utils/validation.ts:45-51,243-253`; the `workflow-tools.ts` payload and prose sites — `exit_destinations` (`:1451`, `:1616`), `present_checkpoint`'s `consequence.next_activity` (`:1928`), `respond_checkpoint`'s `exit` payload and the `immediate` template at `:2110` that the compiler cannot catch, and the `activity_id`/`exit` parameter descriptions at `:698-699`; `evaluate-transition.md` and `finalize-activity.md`'s `next_activity_ids`.

*Acceptance:* no corpus diff; `check:all` green. Fixture tests: a fan walks end to end in `walker.ts`; a deliberate unwritten read inside a fixture fan branch is reported as `unreachable-read` kind `entry` (proving row 16's traversal fix); a name only one branch writes and the destination reads is **not** reported (proving the union meet); `${binding.to}` no longer renders a comma-joined list as one activity id.

**Stage 3 — the static half of namespacing.** `branchKey` consumers in `activity-variables.ts` (the single-grammar `read()`, `references`, `branchMembers`, the `branchKey` re-key in `write()` and `landed()`); the guard's `fanMembers` derivation, `declaredWrites` re-key, namespace/`declaredAnywhere` handling, and enforcement rows 13–15; `binding-provenance.ts:275-276`; `variable-binding.md` protocol step 5 plus the derivation rule; `scatter-gather.md` `isolation-then-combine` and `one-gather-contract-two-scatter-modes`.

*Acceptance:* corpus guard output byte-identical (no fan exists, so every re-key is inert). Fixture tests: one correct fan definition with a gather produces **zero** findings, where the same definition on Stage 2 produced three false families; a gather naming a member no branch produces is reported (row 14); an ungathered branch member is reported (row 15); two branches writing one artifact filename are reported (row 13); a gather binding is annotated with head provenance rather than as an unresolved template.

**Stage 4 — the frontier. Requires Stage 0.** `session.schema.ts` `currentActivity` → `frontier`; `sessionView` resolution; `next_activity`'s `activity_id` union, `from_activity`, the resolve-retire-enter-iff-empty rule, the branch-key wrap, `_meta.barrier`, and the trace `act` fix at `:983`; `get_activity`'s `activity_id` and membership refusal; `get_technique`'s guard converted to membership and its `state.currentActivity` reads at `:668-716`; the `frontier.length > 1` helper on `yield_checkpoint` and `dispatch_child`; `get_workflow_status.current_activities`; `projectIdentity`, `projectActivities`, `inspect_session`, `logging.ts:104`, `:2247`, `get_resource`'s provenance omission; `src/schema/state.schema.ts:184,208` checked (nothing in `src/` outside that file constructs `WorkflowStateSchema`).

*Acceptance:* the whole existing unit and e2e suite green with a frontier of length 1 — every ordinary session takes the identical path. Enforcement rows 18–24 each have a test: `yield_checkpoint` from a branch refuses with the stated message; `next_activity` with an absent `from_activity` while three are in flight refuses; a branch return with siblings live enters nothing and returns `_meta.barrier.pending`; the last branch return enters the join; a two-branch fixture fan executes end to end against real sessions in the walker; a branch's `variables_changed` lands under its branch key and a sibling's under its own, with no shared bare name in the bag.

**Stage 5 — the definitions that make a fan execute.** `dispatch-fan.md`; the three new drive-loop steps, two gate edits and the `continueWhile` edit in `03-dispatch-client-workflow.yaml`; `core-ops.ts` (`spawn-concurrent`, `dispatch-fan`); `meta/workflow.yaml` `techniques.workflow`; the rule amendments to `orchestrator-conduct.md`, `dispatch-activity.md`, `activity-worker.md`, `continue-batch.md`, `commit-and-persist.md`, `planning-readme.md`, `activities/README.md:45`; `docs/dispatch-model.md`.

*Acceptance:* `check:all` green including `check:refs` resolving every new anchor and `check:audience` placing every new rule; `scripts/validate-workflow-yaml.ts` loads the amended meta workflow; a live smoke run drives a two-branch fixture fan through `dispatch-fan` — the three new steps fire in the right order, the checkpoint trio and `commit-activity-artifacts` stay silent on the fan iteration, and `current_activity` arrives at the join through the output remap.

**Stage 6 — corpus adoption. One commit, spanning the submodule pin and the server-side baselines.** Remove the four gate sites and the duplicate assumptions-log writer from `04-research.yaml` (`:106`, `:190`, `:222`, `:242`, with the three `review-assumptions::record` bindings at `:135,226,245`, the assumption-convergence loop at `:137-167`, and the assumption write declarations — `07-assumptions-review.yaml:71-105,111-112,128-130,139-141` already runs that interview over the same `open_assumptions`, so this is a removal, not a workaround); the two gate sites and the second assumptions-log writer from `05-implementation-analysis.yaml` (`:124`, `:143`, `:82,129,148`, `:83-114`); `comprehension-sufficient` from `15-codebase-comprehension.yaml:127-157` with a non-gate continuation for the deep-dive loop, or leave that activity out of the fan; the fan and the reordering in `work-package/workflow.yaml:174-223`; the gather step in `07-assumptions-review.yaml`. Re-record `tests/e2e/option-coverage.json` with `npm run baseline:stamp` in the same commit, and re-measure `DRY_WALKS` (`option-coverage.test.ts:57`, currently 50 — the comment at `:48-56` states outright that it "has to be re-measured whenever the graph grows").

*Acceptance:* `check:all` green on both the corpus branch and the server; the coverage walk green with no `stale`, `nowUncovered` or `nowCovered` entries and `expectStampFresh` passing; one live run through the fan in which the three branches spawn in one turn, each lands its outputs under its own branch key, `assumptions-review` gathers all three, and the Progress marks for all three publish in one commit before the spawn and resolve in one persist at convergence.

Stages 1–3 and 5 are independently mergeable in that order without executing anything; Stage 4 is gated on #655; Stage 6 is gated on 1–5. Stage 6 is the only commit that touches the corpus submodule, and it must move the corpus pin, `option-coverage.json` and the stamp together — a workflows-branch sweep is red until the paired server change merges, so verify it locally and re-run the sweep by hand afterwards.

### not adding

**No new node type, join keyword or sentinel exit target.** The barrier is derived from the exit bindings the graph already carries (enforcement rows 8–9), and `fanGroups` is its single derivation. A `join:` keyword would be a second home able to disagree with the bindings.

**No per-branch metadata in the graph.** A fan destination is a list of activity ids and nothing else — no per-branch object, no declared branch key, no per-branch options. Everything else about a branch is derived from its id (`branchKey`) or from its own bindings (the join). `canonical-fact-home`.

**No merge policy, no conflict guard, no partial combine, no degraded proceed.** Fixed decision 2 makes them unnecessary: two branches cannot collide, so there is nothing to arbitrate. Proceeding with two of three branch keys would hand the gather a value no branch produced (`unproduced-value-read`), and describing what a missing branch means *is* a merge policy under another name.

**No nested fans** (row 7) and **no in-branch self-loop retry**. The convergence rule is one sentence with no exclusion clause — every exit of every branch binds to the same single destination — instead of "the branch's destinations minus itself". A self-loop would cost a third `next_activity` outcome, a re-bind path, and a `one-advance-per-activity` carve-out, for a case the corpus does not have; a retry is expressible as a loop step inside the activity. Nested fans would need a per-branch reachability closure and would make row 9's comparison ambiguous.

**No `agentId`, `joinTo` or `enteredAt` on the frontier.** `frontier: string[]` — one field replacing one field. `joinTo` copies a graph fact the handler already loads; `enteredAt` copies the `activity_entered` history event; and an `agentId` key is what forces a re-bind call outcome for a replacement worker. Keying resolution on the *activity* instead makes failure recovery need **zero** server support: a replacement worker names the same activity, which is still in the frontier.

**No per-branch identity binding in the fan-enter parameter.** `activity_id` is `z.union([z.string(), z.array(z.string()).min(2)])` — the tool parameter mirrors the graph destination exactly. A per-branch `{activity_id, agent_id}` object would also force branch identities to be minted *before* the enter, reordering `dispatch-activity.md:52-54`; nothing needs that.

**No separate barrier-met call and no separate join-enter call.** One rule — retire the named entry, enter `activity_id` iff the frontier is now empty — covers a sequential advance, a fan enter, a mid-fan branch return and the last branch return with no special cases, and makes early entry unrepresentable rather than refused (row 22). It also subsumes `one-advance-per-activity`'s hazard as row 21.

**No `src/utils/batch.ts` change.** A branch cannot be continued because `dispatch-fan` writes neither `worker_result` nor `worker_agent_id`, so `continue-batched-worker`'s `when` gate is structurally false (row 26), and row 21 is the backstop. Adding a `joinTo`-keyed `mayContinue: false` would need the field the frontier deliberately does not carry.

**No fan width cap.** A policy number with no principled value and no config home; the real bound is the harness's context, measured in `docs/dispatch-model.md`.

**No `properties`/`members` field on `VariableDefinition`, and no member-grain validation in `applyVariableWrites`.** The members are carried internally by the merge for the guard's use. Making them authorable would generate a new field into `workflow.schema.json` and create a second home able to disagree with the derivation, to preserve a warn-only runtime check the guard already covers statically at hard zero.

**No 37th guard registry entry** (row 27). Fan-shape rules are load failures, not findings; a guard for the same rules would let a session start on a graph the guard rejects. Rows 13–15 are findings of the *existing* `activity-variables` entry, and rows 14–15 reuse the existing `unwritten-read` / `unread-write` family names so no new ledger is created.

**No change to `orchestration-patterns::dispatch-workers`.** All seven of its binding sites are activities executed by dispatched workers, and `spawn-agent.md:44-46` `depth-1-only` states that a spawned agent has no dispatch primitive, so neither of its branches is executable there. The fan binds where the primitive is, which `depth-1-only` names by hand: "Hoist a pass there when its fan-out is worth an orchestrator-owned step."

**No fan mode on `dispatch-activity`.** `alternate-ops-as-protocol-sequence`; and its outputs would have to pluralise for consumers whose `when` gates cannot test a list.

**No child session per branch.** A child session has its own `activeCheckpoint` slot, but also its own workflow id, graph and planning folder — strictly more mechanism, and it breaks fixed decision 1, under which branches rejoin a destination in the *same* graph.

**No per-branch source-tree commit.** One persist at convergence naming every branch. `commit-and-persist` derives its `paths` from `git status --porcelain` over one working tree (`:26`), and three branches writing that tree in one turn leave changes indistinguishable by author, so a per-branch commit would sweep a sibling's in-flight edits into the wrong activity's commit. There is no reader between the branches — they all finish in the same turn — so a commit per branch publishes nothing more and pushes against a remote the previous push just moved.

**No `verify-dispatched-activity` rewrite into a self-check.** Its comparison half moves to the server as row 20, which is stronger because a worker cannot skip it. **Prefer Removing the Thing That Needs a Prohibition**: the half that survives is the one about not reading an earlier response this context still holds.

Every ceiling above carries its upgrade trigger in `schema_change`, `dispatch_mechanism`, `namespacing` or `enforcement`: a branch that must re-enter itself; a fan branch that must trigger a child or take a second activity; a wrong-typed branch member reaching a destination undetected; a measured run that exhausts the orchestrator's context on a wide fan.

### residual risks

- The `unreachableReads` arrival meet is a new operator in a hard-zero guard with no ledger to diff, so a bug in it is silent. Three specific ways to apply the fix and have it do nothing — leaving branches in `plainPredecessors[join]`, seeding candidates from the first predecessor rather than `arrivals[0]`, and treating a branch head's own predecessor as special — are each caught only by a fixture test, not by a baseline.
- `check-review-mode-gating.ts` parses raw YAML (`:190`) under its own `type Graph` (`:87`), so the loader's fan checks cannot protect it. Importing the destination type from `src/schema/graph.js` is the mitigation, but nothing checks that it stays imported; if it drifts back to a local declaration, checkpoints inside fan branches silently stop being audited for a consequential review-mode auto-advance — the class the guard exists for.
- A branch that genuinely cannot proceed without a decision has no conforming way to say so. `finalize-activity` defines exactly two envelopes, `reject-partial-worker-result` accepts only those two, and `dispatch-activity.md:61` refers to a blocked signal that no envelope carries. The best available report is an `activity_complete` on a blocked or abort exit the activity declares; failing that the branch returns a non-envelope, takes its one replacement, and the fan surfaces blocked. Enforcement rows 12 and 18 make this rare rather than impossible.
- Artifact-filename disjointness (row 13) is only decidable where the templates are literal. Two `artifact.name` templates differing solely by an interpolated token fail closed, which may reject a pair that would in fact resolve distinctly at write time. `write-artifact`'s mint-attempt guard narrows a stale-listing window and does not serialise two concurrent writers, so the load-time rule is the only real protection.
- One persist at convergence coarsens `commit-after-activity`'s per-activity grain for a fan: a reader watching the remote sees three Progress rows flip together and gets one commit message naming three activities. `mark_progress_na` is one value per persist, so two branches that each need N/A cannot both express it — stated as a rule in `planning-readme.md`, not enforced.
- Trace segments are per session, not per delivery scope, so a fan's segments partition an interleaved multi-branch event stream at arbitrary points. Stamping `act` with the retiring branch fixes the mislabelling; ordering fidelity within a fan is not recoverable from the segment boundaries.
- `DRY_WALKS` (currently 50) may no longer clear the coverage plateau after Stage 6, because a fan multiplies the branch orderings `enumeratePaths` can produce. A short streak is reported as unreached options — a definitions defect — when the cause is the walk budget.
- A fan of three pays roughly 232,954 delivered characters against 159,093 for the same three walked by one worker, plus three context establishments where `docs/dispatch-model.md:62` puts the establishment saving at two-to-four times the collapsing saving — so the true premium is on the order of 150,000-300,000 characters, and the join re-pays full delivery of everything the branches collectively held. Width is deliberately unpoliced, so a wide fan's cost is visible only in the run.
- If #655 is fixed with a per-session write lock rather than a compare-and-swap, N branch contexts serialise their `get_activity` / `get_technique` / `get_resource` calls — each of which awaits dozens of FS reads plus canonicalise, seal and atomic write — so a fan's wall-clock advantage shrinks toward the batched walk's, which is the only thing the delivery premium buys.
- `get_resource` omits its provenance activity context while several activities are in flight, and `dispatch_child` is refused outright. Both are lazy choices with named triggers rather than designed capabilities; a fan branch that needs either will hit a refusal or a thinner annotation before anyone notices the gap.
- Enforcement rows 14 and 15 read dotted references out of `derived.references`, which is assembled from the sites `deriveActivityContract` walks. A gather expressed somewhere that walk does not reach — prose in a resource the destination loads, say — is invisible to both, exactly as `check-activity-variables.ts:150-156` already says of a name no declaration mentions.
- Removing the four assumption gates from `04-research.yaml` and two from `05-implementation-analysis.yaml` relies on `07-assumptions-review.yaml` already running that interview over the same `open_assumptions`. If the two interviews turn out to differ in substance rather than only in placement, Stage 6 loses a decision the run currently makes, and the fan would have to shed a branch instead.

## Judge 1

**Verdict:** Build Design 3's runtime and contract on Design 1's schema placement and variable-declaration model, with Design 2's identity binding and its starting-value load rule.

Design 3 wins on the question that decides the capability: where the barrier lives. Its single `next_activity` rule — retire the entry the call names, enter `activity_id` iff the frontier is then empty — makes single entry into the shared destination a property of the store rather than a refusal an implementer can get wrong, and there is no second call that could enter early. That is Encode Constraints as Structure taken to its limit and Prefer Removing the Thing That Needs a Prohibition applied to its own enforcement: the rule that would need policing has nothing left to say. Design 2 realises the same invariant correctly as a refusal, one rule more than needed. Design 1 realises it as a refusal over a derivation that cannot see a fan whose branches were never entered, and its own claim to survive a crashed orchestrator fails for that state — a silent degradation to one branch, with the destination's gather interpolating keys nothing wrote and no load failure, refusal, guard finding or runtime warning anywhere. That is the single Critical finding in the set, and it is not a detail of Design 1 but the direct consequence of its headline choice to add no session field.

Design 3 also carries the only complete `dispatch-fan` I/O contract, the only written inventory row, the only structural rather than textual backing for a branch taking one activity, and the only correction of a stated ground fact with a citation. Its two real defects are both grafts away: a `get_activity` membership test that is vacuous exactly when a fan runs (take Design 2's one `agentId?` field, with a sole-entry fallback so no ordinary walk changes), and a namespacing wrap that leaves the branch key undeclared and therefore wholly unvalidated while claiming otherwise (take Design 1's merge substitution plus `ctx.under`, and Design 2's starting-value load rule).

On the two fixed decisions all three conform. The widened primitive with `.min(2)` is the most specific construct the schema can offer once a new node type, a join keyword and a sentinel exit target are foreclosed, and all three put the arity in the schema rather than the loader — the right answer to Maximize Schema Expressiveness under the constraint. None reintroduces a merge policy, an explicit join or a bare shared write, and all three correctly ground the namespacing in `scatter-gather.md`'s `isolation-then-combine` raised to graph grain. Three findings are shared by all three and belong in the specification regardless of which design is built: `branch_results` is declared with no reader in every one of them; the seven gate removals in the adoption stage have no named check that the decisions survive, though `check:activity-variables` over each removed gate's `setVariable` targets is exactly that check; and 29 sites across 19 files describe the graph as one destination per exit, of which each design leaves eight or nine standing and seven across six files are missed by all three — including `docs/api-reference.md:50`, which states `exit_destinations`' return shape and is Match the Harness Surface's business specifically.

**Ranking:** Design 3 — the only design whose barrier is unrepresentable rather than refused: one `next_activity` rule (retire the named entry, enter `activity_id` iff the frontier is then empty) covers sequential advance, fan enter, mid-fan return and last return with no special cases, so no second call could enter early and there is no refusal message to get wrong; it also carries the only complete `dispatch-fan` I/O contract (`exiting_result` declared and bound), the smallest session change (one field replacing one field), the only written inventory row, and the only structural rather than textual backing for a branch taking one activity. | Design 2 — realises the same barrier correctly as a server refusal over live frontier entries, and is the only design that binds a branch worker to its dispatched activity by identity (so `verify-dispatched-activity`'s comparison half is genuinely strengthened) and the only one that catches a fan branch's starting value at load; it pays with a four-field frontier entry carrying two fields that copy facts the graph and the history already hold, and by putting the fan's write model in the guard script while the server's declaration set disagrees. | Design 1 — the smallest schema placement (union beside `GraphSchema`, `TERMINAL_SENTINEL` moved to where it belongs) and by far the most auditable enforcement table, honest NOT-structural marks included; but its headline choice, deriving the in-flight set from `activity_entered` minus `activity_exited` with no new session field, leaves the barrier unable to see a fan whose branches were never entered, so the one mechanism the design exists to provide degrades silently.

### Findings

```json
[
 {
  "design": "Design 1",
  "severity": "Critical",
  "entry": "structure-backed-constraints; Encode Constraints as Structure (Principle 9)",
  "evidence": "Design 1 enters branches with N separate `next_activity` calls (`dispatch-fan` Protocol step 3) and derives the in-flight set as `activity_entered` minus `activity_exited` under \"NO NEW SESSION FIELD\". Nothing in the session ever records that a fan of three was opened. It borrows the model at `src/utils/batch.ts:6-8` (\"a batch is not declared: it IS the run of activities one delivery scope takes delivery of, derived from session history\") \u2014 but a batch records what did happen, whereas a barrier is a claim about what must still happen. Entry: the orchestrator enters branch 1, then its second and third `next_activity` calls fail, or the context dies before them, or it is resumed. History holds one `activity_entered` for `research` and nothing for `codebase-comprehension` or `implementation-analysis`. Once branch 1 returns, entered-minus-exited over the fan's branch set is empty, so enforcement row 13's refusal (\"refuses an enter of anything but an open fan's branches or its join while a branch is in flight\") permits the join. The fan degrades to one branch and the destination's gather interpolates two branch keys nothing ever wrote. Nothing detects it: the graph is statically well-formed, `unreachableReads` with the union-arrival meet reports every branch's writes as available at the join, `applyVariableWrites` has no write to warn about, and no guard reads runtime history. Design 1's own claim that the barrier \"survives a crashed orchestrator, which re-derives the same barrier from session.json\" is false for exactly this state. Designs 2 and 3 are both immune: D2's outcome 4 materialises every branch as a frontier entry on the first call, D3's `activity_id: [a,b,c]` enters the whole fan in one call.",
  "fix": "Record the fan's expected branch set once, at the enter. Either materialise all N entries in a single call (Design 3's `activity_id` union with `.min(2)`, or Design 2's outcome-4 materialisation), or keep the frontier derived and carry the fan's branch list on the first branch's `activity_entered` event data \u2014 `HistoryEntry.data` is `z.record(z.unknown()).optional()` (`src/schema/state.schema.ts:89`), so it costs no schema and keeps Design 1's zero-migration property. The frontier may stay derived; the expected set cannot."
 },
 {
  "design": "All three",
  "severity": "High",
  "entry": "output-without-destination; signature-is-the-contract (variable-binding.md:20); declared-input-never-read (mirror)",
  "evidence": "Two halves of one defect \u2014 `dispatch-fan`'s contract matches neither what the drive loop binds nor what its own Protocol spends. (a) `branch_results` has no reader in any of the three. The fan bind consumes only the destination \u2014 D1/D2 via `set current_activity = \"{join_activity}\"`, D3 via the `join_activity: current_activity` remap \u2014 and no step, gate, `set`, message or `{token}` interpolation names `branch_results`; `close-fan` nulls `worker_result`, so the existing `commit-activity-artifacts` (`03-dispatch-client-workflow.yaml:89-95`) and `advance-activity` (`:96-102`) cannot read it either. AP-138's test: \"name the reader; if the answer is the worker's own report, the entry is not a bind contract.\" Compare `dispatch-activity.md:34-40`, whose `worker_result` and `worker_agent_id` are both read by drive-loop `when` gates, and whose `trace_tokens` is exempt because `resolve-trace-at-close-out` (`dispatch-activity.md:78-80`) names the close-out path as consumer. (b) D1 and D2 only: both Protocol step 3s pass \"the exiting activity's exit, step_manifest, variables_changed, artifacts_produced and agent_id\" on the first branch's `next_activity`. Not one is a declared Input, and neither design's bind site passes them. `variable-binding.md:20`: \"every `{name}` an operation's protocol reads is a declared input (or carries a `default`) \u2026 An incomplete signature is a binding gap, not an implicit convention.\" Because they are undeclared, `check:binding-fidelity` (`scripts/guards.ts:30-36`, proves \"args conform, reads have producers, outputs have consumers\") has nothing to check and the operation improvises off whatever `worker_result` the bag holds. Design 3 is correct: it declares `exiting_result` and binds `exiting_result: worker_result`.",
  "fix": "Adopt Design 3's `exiting_result` input and its bind. Delete `branch_results` \u2014 the Protocol already consumes each envelope internally at persist, transition and account, so the value has no reader outside and AP-138's Fix is to delete. Then name `binding-fidelity` in the staged plan's acceptance criteria: it is the guard that mechanises both halves and no design mentions it."
 },
 {
  "design": "All three",
  "severity": "High",
  "entry": "Non-Destructive Updates (Principle 10)",
  "evidence": "The corpus-adoption stage in all three removes seven gate sites \u2014 four from `04-research.yaml` (`:106`, `:190`, the `assumption-interview` ref at `:222`, the per-assumption decision at `:242`), two from `05-implementation-analysis.yaml` (`:124`, `:143`), one from `15-codebase-comprehension.yaml` (`:127-157`) \u2014 and all three name `07-assumptions-review.yaml` as the surviving home. Principle 10 requires more: \"A restructuring that removes a gate, re-routes an exit, relocates an operation, or collapses a rule into another home names the outcome, option, input or audience that still has to hold, and the check confirming it \u2014 content approval is not evidence that behaviour survived.\" None names a check. The two guards a reader reaches for cannot answer: `check:review-mode-gating` proves \"no review-reachable checkpoint auto-advances into unapproved mutating work\" (`scripts/guards.ts:75-82`), so removing gates shrinks its finding set and it goes greener as decisions are lost; `check:decision-order` is silent on a gate that is gone. Design 3 states the risk in its residuals (\"If the two interviews turn out to differ in substance rather than only in placement, Stage 6 loses a decision the run currently makes, and the fan would have to shed a branch instead\") without naming the test; Designs 1 and 2 assert the equivalence and move on.",
  "fix": "The check exists and is mechanical. Each removed checkpoint's `options[].effect.setVariable` targets are variables; after removal, any downstream reader of one whose only writer was the removed gate is reported by `check:activity-variables` as `unwritten-read` or `unreachable-read` at hard zero (`scripts/guards.ts:37-44`). Make that the stated acceptance criterion, add `check:variable-model` (\"defaults, gates and setVariable effects are coherent with the seeded variable model\") beside it, and pair both with a decision-inventory diff in the PR body: one row per removed gate naming the decision it made, the surviving gate that makes it, and the variable that carries it."
 },
 {
  "design": "Design 3",
  "severity": "High",
  "entry": "Encode Constraints as Structure (Principle 9); stale-restatement-after-change",
  "evidence": "Design 3 resolves `get_activity` by the `activity_id` the worker names, refusing only when that id is absent from the frontier, and claims this moves `verify-dispatched-activity`'s comparison half to the server \"which is stronger because a worker cannot skip it\" (`activity-worker.md:82-84`). During a fan every branch is in the frontier, so the membership test admits `research`, `codebase-comprehension` and `implementation-analysis` to any caller \u2014 the check is vacuous exactly when a fan is running, which is the only time it is needed. Entry: a branch worker whose composed stub carried a transposed or stale `activity_id` \u2014 the precise failure `verify-dispatched-activity` exists to catch \u2014 is served the sibling's body, executes it, and reports a `step_manifest` for it. Design 3 records no per-branch identity (\"No `agentId`, `joinTo` or `enteredAt` on the frontier\"), so nothing downstream can tell which context walked which activity. `validateTechniqueFetches` (`src/utils/validation.ts:178-231`) does filter deliveries on `data.agentId !== agentId` and scopes back to the last `activity_entered` for the named activity, so the impersonation is internally consistent and passes. Design 2's `frontierEntry(state, agentId)` is genuinely stronger: a worker asking with its own identity is served its own activity and cannot be served a sibling's at all. So Design 3 removes a worker-side check, replaces it with a server-side check that does not hold under a fan, and leaves prose asserting a strengthening that is not there.",
  "fix": "Graft `agentId?` onto Design 3's frontier entry and resolve by identity with a sole-entry fallback (`frontier.length === 1` returns that entry, so every ordinary walk never reaches the identity match and nothing about a solo session changes). Take the one field, not Design 2's whole four-field object: `joinTo` copies a graph fact the handler already loads at `workflow-tools.ts:720` and `enteredAt` copies the `activity_entered` event, both of which Design 3 is right to cut."
 },
 {
  "design": "Design 3",
  "severity": "High",
  "entry": "One Authoritative Home (Principle 6); no-derived-state-shadow",
  "evidence": "Design 3 re-keys `declaredWrites` in `scripts/check-activity-variables.ts` only and explicitly declines to touch `mergeActivityVariables`, stating \"With one container declared, only `type: object` is checked and each member's declared type and value set stops being validated at runtime.\" That is wrong about its own design in the direction that matters. `mergeActivityVariables` (`src/utils/activity-variables.ts:112-149`) is what builds the server's declaration set from each activity's `variables.writes`, and the loader calls it at `workflow-loader.ts:350`. Left alone, the set holds the members' bare names and never holds `research_outputs` at all. So `declarations.get('research_outputs')` misses in `applyVariableWrites` (`src/utils/variable-seed.ts:75-92`), which skips the type check and the value-set check together \u2014 not \"only `type: object` is checked\" but nothing whatsoever, which is precisely the silent undeclared write the brief names as the hazard. Second consequence: every member stays a top-level declaration, so a member carrying a `defaultValue` seeds a top-level name that nothing ever writes under a fan \u2014 a shadow of the branch-key member, in the bag from session creation, and `check:variable-model` (`scripts/guards.ts:211-218`) is the registered guard for exactly that coherence and is never run against the change.",
  "fix": "Take Design 1's `mergeActivityVariables` container substitution, so `research_outputs` enters the server's declaration set as `type: object` and the branch key stops being an undeclared write; take Design 1's `ctx.under` on `applyVariableWrites`, validating each member against `getActivity(workflow, branchActivity).variables.writes` read at the moment of the wrap, which is the only mechanism in the three that keeps per-member type and value-set warnings while the address is namespaced; and take Design 2's load rule 7 (a fan branch declaring a `defaultValue` fails the load, because the starting value would seed a name nothing writes). Those three together are the only combination with one home for the address, one home for the member types, and no dead seed."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "One Authoritative Home (Principle 6); SOLID at the Definition Layer (Principle 34, dependency inversion)",
  "evidence": "Design 2's item 4 re-keys `writersOf` inside `scripts/check-activity-variables.ts:188-195` so a fanned activity registers as a writer of `branchKey(id)` and `branchKey(id) + '.' + N` and not of `N`, while deliberately leaving `mergeActivityVariables` untouched \u2014 so the server's merged declaration set still declares `N` at top level. `src/utils/activity-variables.ts` exists, in its own header's terms, so the server and the guards cannot drift; Design 2 puts the fan's whole write-side model in the guard script instead, and the two modules then answer \"where does `assumptions_log` live\" differently. Design 2 names half the consequence as a residual (\"`get_workflow`'s rendered variable set names a fan member's outputs by their bare declared names while the bag addresses them under the branch key\") and accepts it for a real gain: leaving the merge alone keeps per-member `applyVariableWrites` validation working for free, `context_scope`'s three-value set included. The gain is genuine; the placement is not the way to get it. Principle 34's own test applies \u2014 \"name every file a later extension of this contract would force an edit to\" \u2014 and here every future reader of the variable set is reading the wrong home.",
  "fix": "Substitute the container in the shared module (Design 1's and Design 3's placement) and keep member types by reading them off the branch activity's own `variables.writes` at the wrap (Design 1's `ctx.under`). That preserves Design 2's advantage \u2014 every member keeps its declared type and value set at runtime \u2014 without two modules holding two answers, and it makes `get_workflow`'s rendered set honest about where values land."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "Non-Destructive Updates (Principle 10); Encode Constraints as Structure (Principle 9)",
  "evidence": "Design 1's guard change 3 contributes \"ONE declaration { name: key, type: 'object', \u2026 } INSTEAD of that activity's own write declarations,\" explicitly instead rather than as well. Two things go quiet. First, `mergeActivityVariables`'s contradiction path (`src/utils/activity-variables.ts:126-138`) is the one home that reports two activities declaring one name with disagreeing `type` or `defaultValue`. Under Design 1, in a workflow that fans both `research` and `implementation-analysis`, neither contributes `open_assumptions`, so a disagreement between the two branches goes unreported in that workflow while still failing the load in every workflow that does not fan them \u2014 the same two files loading or not depending on the graph. Design 1's new `fan-shadowed-write` family catches only the case where a third site declares the name, not two fanned branches disagreeing with each other. Second, a member carrying a `defaultValue` stops seeding, with no message anywhere; Design 1 lists the rendered-variable-set change as a residual but not this one, and names `check:variable-model` in no stage.",
  "fix": "Keep the contradiction check by cross-checking the members in a per-activity side index the merge still walks, or \u2014 smaller and sufficient \u2014 take Design 2's load rule 7 so a fan branch's write carrying a `defaultValue` fails the load and the author is told, and add a sibling load rule reporting two branches of one fan whose member declarations disagree on `type` or `values`. Both are decidable from the graph plus the materialized activities `validateExitBindings` already holds."
 },
 {
  "design": "Design 1 and Design 2",
  "severity": "Medium",
  "entry": "stale-restatement-after-change",
  "evidence": "`validateReportedExit` (`src/utils/validation.ts:239-254`) compares `binding.to !== activityId` and returns `Exit 'X' of 'Y' is bound to 'Z' but 'W' was requested.` On a fan enter, `binding.to` is the array and `activityId` is one branch, so the comparison is always unequal and the message renders the destination list comma-joined as though it were an activity id. It is advisory, not a refusal \u2014 `workflow-tools.ts:748-750` collects it as `exitWarning`, and the `exit` parameter description at `:699` says \"an exit bound to an activity other than `activity_id` warns\" \u2014 so the fan proceeds with a spurious `_meta.validation` entry on every single fan enter, which is how an orchestrator learns to stop reading that channel. Design 1 names the site (`validation.ts:250`). Design 3 names it and states the fix: satisfy a reported exit when `activity_id` is among `destinationTargets(binding.to)`, comparing set-wise on a fan enter. Design 2 names neither \u2014 its stage-2 site list enumerates `state.currentActivity` readers and `validateReportedExit` reads `view.act`, and its \"three more server changes\" cover `yield_checkpoint`, `batchState`, `exit_destinations`, `present_checkpoint` and `respond_checkpoint`, so this function appears in no list in the plan.",
  "fix": "Widen the comparison to `destinationTargets(binding.to).includes(activityId)`, and on a fan enter compare the reported destination set-wise against the branch set. Add it to Design 2's stage-1 manifest, where `ExitBinding.to` is already being widened \u2014 the two edits are the same change to the same fact."
 },
 {
  "design": "All three",
  "severity": "Medium",
  "entry": "no-partial-implementation; Encode Constraints as Structure (Principle 9)",
  "evidence": "Every design has a merged state in which `validateExitBindings` accepts a fan, `check:all` is green, and `next_activity` cannot execute one: Design 1 merges stages 1, 2 and 4 before stage 3; Design 2 lands stages 1, 2, 5 and 6 before the runner; Design 3 lands stages 1-3 and 5 before stage 4. Nothing in that window refuses to start a session on a workflow carrying a fan. AP-03's do-not-flag covers \"an explicitly scoped partial deliverable the user approved (remaining items stay open in the manifest)\", and all three declare the state \u2014 Design 1 says \"authorable and inert\", Design 3 the same \u2014 so the entry does not fire on the plan as a plan. What is missing is the structural expression of the ceiling: an author who reads the accepted schema, or sees a green guard run, has no way to learn the runner is absent, and the first discovery is a session that loads and then cannot advance.",
  "fix": "For the duration of the window, have `validateExitBindings` reject any list destination outright with a message naming the runner stage \u2014 one line, deleted by the stage that lands the runner. That turns the ceiling into a load failure rather than a stage note, and makes each intermediate stage's \"zero corpus movement\" acceptance criterion provable rather than argued, since the corpus cannot then carry a fan at all."
 },
 {
  "design": "Design 1",
  "severity": "Medium",
  "entry": "structure-backed-constraints; Prefer Removing the Thing That Needs a Prohibition (Principle 35)",
  "evidence": "Two unbacked rules, both avoidable. (a) `fan-persists-per-branch-then-once` reads \"engineering artifacts commit per branch at its return; the source tree commits once at the barrier, attributed to the fan's origin.\" `commit-and-persist` derives its paths from `git status` over one working tree, which cannot attribute a change to a branch \u2014 Design 1's own residual risk says exactly this. The rule therefore asks an actor to perform a partition the operation it Applies does not expose, with nothing checking it. Design 2's `one-source-commit-at-the-barrier` and Design 3's `persist-the-fan-before-any-branch-returns` are equally unbacked but ask for one commit, which is performable. (b) `branch-takes-one-activity` states that \"`batch_may_continue` on a branch envelope is ignored\", and Design 1 declines to change `src/utils/batch.ts` because it \"would change a value nothing acts on.\" But `batchState` (`src/utils/batch.ts:149-160`) admits a scope with `activities.length === 0` outright and admits one inside both limits, so a branch scope holding one activity is answered `mayContinue: true`; `finalize-activity` folds that into the envelope, and `continue-batched-worker`'s gate (`03-dispatch-client-workflow.yaml:44`) tests `worker_agent_id && \u2026 batch_may_continue && next_activity_id`. Design 1's actual protection is that `dispatch-fan` writes no `worker_agent_id` \u2014 Design 3's protection too \u2014 but Design 1 states the rule as the protection and never states the gate.",
  "fix": "For (a), take Design 3's shape: one persist at convergence naming every branch, before the first branch's transition, with the invariant that makes it correct stated positively (a fan's branches are read-only on the source tree) rather than a partition nobody can perform. For (b), take Design 3's answer \u2014 state that `continue-batched-worker`'s gate is false because `dispatch-fan` writes neither `worker_result` nor `worker_agent_id`, and delete the rule (Principle 35). If a belt is wanted beside that brace, Design 2's `batchState` carve-out makes the server's answer agree with the contract."
 },
 {
  "design": "All three",
  "severity": "Medium",
  "entry": "stale-restatement-after-change; Match the Harness Surface (Principle 21)",
  "evidence": "A mechanical sweep for the load-bearing phrasings (`destination activity`, `where each of its exits leads`, `activity id each`, `exit id \u2192 destination`, `naming the destination`, `the activity the workflow graph binds`) plus the sites a reader must recognise gives 29 places across 19 files describing the graph as one destination per exit: 11 in server source (`src/schema/workflow.schema.ts:46`, `:67`; `src/loaders/workflow-loader.ts:481`; `src/tools/workflow-tools.ts:661`, `:698`, `:699`, `:1013`, `:1928`, `:2106`, `:2110`; `src/utils/validation.ts:250`), 2 generated (`schemas/workflow.schema.json:392`, `site/api/schemas.html:277`), 7 in repo docs (`schemas/README.md:31`, `:283`, `:660-689`; `docs/api-reference.md:50`; `docs/workflow-fidelity.md:106`, `:118`, `:232`; `docs/state-management-model.md:74-92`), 2 in corpus canon (`schema-construct-inventory.md:48`, `:65`), 4 in technique prose (`evaluate-transition.md:16-18,30,43`; `finalize-activity.md:58-60,73`; `dispatch-activity.md:60,88-90`; `workflow-orchestrator.md:42-43`), 1 corpus README (`meta/activities/README.md:39`), and 3 in tooling (`walker.ts:52-53,637`; `check-review-mode-gating.ts:87`; `smoke-orchestrator.ts:29,241`). Each design leaves roughly eight or nine standing. Seven sites across six files are missed by all three: `docs/api-reference.md:50` (\"`exit_destinations` names the activity each declared exit leads to\"), `docs/workflow-fidelity.md:106`, `:118` and `:232`, `docs/state-management-model.md:74-92`, `schemas/README.md:31`, `src/tools/workflow-tools.ts:661` and `:1013`, and `workflow-orchestrator.md:42-43`. AP-129's own test governs: \"occurrence count against the tree, not against the change's file list.\" The `docs/` misses are Principle 21's business specifically \u2014 `exit_destinations`' return shape changes and `docs/api-reference.md:50` states it. Sweep coverage also differs: Design 2 names three concrete grep keys in acceptance, Design 1 names one, Design 3 names none.",
  "fix": "Adopt Design 2's grep-key acceptance criterion, extend it with the missed-site list above, and record the occurrence count in the change's file manifest as AP-129's Fix requires. Also add `check:anchors` (`resource-anchors`, proves \"every relative .md#anchor link resolves to a rendered heading\") to every acceptance set: `dispatch-fan` as drafted cites roughly a dozen anchors across five files, several new (`#one-identity-per-branch`, `#account-every-activity`, `#dispatch-mark-reaches-the-remote`), and no design names that guard."
 },
 {
  "design": "Design 3",
  "severity": "Low",
  "entry": "no-duplicated-guidance; canon-layer-cites-not-restates",
  "evidence": "Design 3's `say-what-a-fan-is-doing` opens by citing the home (\"`say-what-a-dispatch-is-doing` governs at fan grain\") and then restates its content: \"quote roughly how long\" and \"A fan produces nothing readable while it runs and returns all at once\" are near-copies of `dispatch-activity.md:84` and `:86`. AP-74's Detect is \"identical or near-identical behavioural instructions appear in multiple techniques\"; its Fix is \"keep one authoritative location; replace duplicates with references to it.\" The fan-specific delta is real and worth having \u2014 name every branch about to run, and say that no gate will arrive \u2014 and Designs 1 and 2 add no narration rule at all, which leaves the longest silent wait in the system unowned. So the defect is only the surplus.",
  "fix": "Keep the two clauses that are the fan's own (every branch named; no gate to expect) and cut the rest, citing `say-what-a-dispatch-is-doing` for the remainder. Then graft the trimmed rule onto whichever design wins, because a three-branch fan with no user narration is a worse outcome than a slightly duplicated rule."
 },
 {
  "design": "Design 1",
  "severity": "Low",
  "entry": "binding-carries-only-deviations (variable-binding.md:31)",
  "evidence": "Design 1's drive-loop bind passes `planning_folder_path: planning_folder_path`. `variable-binding.md:31`: \"`inputs` lists ONLY inputs whose value differs from same-name binding or a declared `default` \u2014 an input equal to its default, or already in the bag under its own id, is omitted.\" `03-dispatch-client-workflow.yaml:11` already carries `planning_folder_path` in `variables.reads`, so the implicit same-name bind covers it, and the sibling `dispatch-activity` bind in the same file (`:56-62`) correctly omits it. Designs 2 and 3 both omit it. All three pass `agent_technique: workflow-engine::activity-worker` although the operation declares it as the default, but that has standing precedent at `:61`, so it is pre-existing rather than introduced.",
  "fix": "Drop the `planning_folder_path` line from the bind. The value reaches the operation by the same route it reaches `dispatch-activity`."
 },
 {
  "design": "All three",
  "severity": "Low",
  "entry": "pass-orchestration-in-technique; Atomic Techniques; Compose at Activities (Principle 26)",
  "evidence": "`dispatch-fan`'s Protocol Applies five sibling and cross-group operations \u2014 `sync-progress-status`, `version-control::commit-regular-files`, `compose-prompt`, `harness-compat::spawn-concurrent`, `commit-and-persist`. Principle 26 states flatly that \"Technique\u2192technique work calls remain forbidden \u2014 techniques stay atomic over tools and resources,\" and the construct inventory's row at `schema-construct-inventory.md:36` routes \"Apply technique B from inside technique A\" to activity steps. The answer is that `dispatch-activity.md:48-62` already does precisely this \u2014 `sync-progress-status`, `commit-regular-files`, `compose-prompt`, `spawn-agent`, `continue-agent` \u2014 and the engine group is where the run's own machinery lives, so `dispatch-fan` conforms to the sibling it mirrors under Convention Over Invention. No design says so, and the inventory row is where a reader would look, so a canon audit opens the entry and finds the rebuttal nowhere in the tree.",
  "fix": "One clause on the new inventory row, or one line in `dispatch-fan`'s Capability, naming `dispatch-activity` as the shape being mirrored and the engine layer as where the run's machinery composes. The same clause pre-empts `duplicate-shared-capability` against `scatter-gather`'s parallel mode, whose scatter is over work units to instances of one operation rather than over distinct activities to activity workers \u2014 and whose carve-out (\"session-level `dispatch-activity` \u2014 different layer from mid-phase fan-out\", AP-110) already extends here."
 },
 {
  "design": "Design 3",
  "severity": "Low",
  "entry": "validate-message-economy; Maximize Schema Expressiveness (Principle 5)",
  "evidence": "Design 3 supplies no message on the array branch and no union `errorMap`, accepting whatever zod renders: \"carried by the schema, so it surfaces as `graph.plan-prepare.done: Array must contain at least 2 element(s)`.\" That is the first message an author authoring their first fan meets, and it names a zod internal rather than the rule. Design 1 supplies an `errorMap` and verifies what `formatZodIssues` (`src/loaders/workflow-loader.ts:42`) renders for a one-element list, a nested list and a number \u2014 noting that an `invalid_union` issue without one renders only \"Invalid input\". Design 2 supplies both an array-branch message and a union `errorMap` and reports the rendered text for three authored shapes. This is the one row in Design 3's otherwise most carefully voiced load table that is left unvoiced.",
  "fix": "Take Design 1's `errorMap` text \u2014 \"a destination names one activity, or lists at least two that run together\" \u2014 which states the rule rather than the array arity, together with Design 2's verification that the array branch's own message surfaces for a one-element list, so the structural constraint and the readable message are both had without trading either."
 }
]
```

### Grafted onto the winner

- Design 3's `exiting_result` input, declared and bound as `exiting_result: worker_result` — the only complete `dispatch-fan` contract in the set, and what turns the five values D1 and D2 spend from bag improvisation into a checked bind.
- Design 3's single `next_activity` rule — resolve the retiring entry, retire it, enter `activity_id` iff the frontier is then empty — with `activity_id: z.union([z.string(), z.array(z.string()).min(2)])` for the fan enter. It makes early entry unrepresentable rather than refused, makes a half-entered fan impossible, and subsumes `one-advance-per-activity`'s second-advance hazard without a carve-out. Design 2's objection to the union (a one-element array being ambiguous between a fan of one and a rebind) does not reach Design 3's declaration, where `.min(2)` makes it a parse error.
- Design 3's inventory row, written out and voiced against the within-activity fan-out row at `schema-construct-inventory.md:38` ("these three activities are independent — run them together", not "fan out then consolidate"), plus its naming of the Activity-Level exit row at `:48`. It is the only design that writes the row rather than describing the requirement.
- Design 3's `outputs: { join_activity: current_activity }` remap in place of D1's and D2's `set current_activity = "{join_activity}"` — `binding-carries-only-deviations`' sanctioned form, and one fewer control action.
- Design 3's correction of the brief's `computeUnavailableReads` to `unreachableReads` (`src/utils/activity-variables.ts:574`), and its separation of the forward reachability BFS at `:602-609` from the backward definite-assignment fixed point at `:627-644` — the fan change lands on both, differently, and Design 3 is the only design that describes the analysis it is editing as two phases.
- Design 3's backing for a branch taking one activity: `dispatch-fan` writes neither `worker_result` nor `worker_agent_id`, so `continue-batched-worker`'s gate at `03-dispatch-client-workflow.yaml:44` is structurally false and there is nothing left to prohibit (Principle 35). Cheaper than Design 2's `batchState` carve-out and honest where Design 1's text-only rule is not.
- Design 2's `agentId?` on the frontier entry with identity-keyed resolution and a sole-entry fallback, so a branch worker is served its own activity by identity and `verify-dispatched-activity`'s comparison half is genuinely strengthened rather than made vacuous. Take the one field only — `joinTo` copies a graph fact the handler already loads at `workflow-tools.ts:720`, `enteredAt` copies the `activity_entered` event.
- Design 2's load rule 7: a fan branch declaring a `defaultValue` on one of its writes fails the load, because the starting value would seed a top-level name nothing writes. It is the only rule in the three that tells the author instead of dropping the seed silently, and it closes the dead-seed half of Design 3's namespacing gap.
- Design 2's `batchState` carve-out (`mayContinue: false` for a scope bound to a branch) as the belt to Design 3's gate-is-false brace, if the cheaper answer is judged too thin — it makes the server's answer agree with the contract rather than relying on no caller acting on `true`.
- Design 1's `mergeActivityVariables` container substitution, so the branch key enters the server's declaration set as `type: object` and stops being an undeclared write — the fix for Design 3's High finding.
- Design 1's `ctx.under` on `applyVariableWrites`, validating each member against `getActivity(workflow, branchActivity).variables.writes` read at the moment of the wrap. The only mechanism among the three that keeps per-member type and value-set warnings — `context_scope`'s three-value set included — while the address is namespaced, and the only way to have Design 2's runtime advantage without Design 2's split home.
- Design 1's union `errorMap` and its verification of what `formatZodIssues` (`src/loaders/workflow-loader.ts:42`) actually renders for a one-element list, a nested list and a number.
- Design 1's schema placement — the union beside `GraphSchema` in `src/schema/workflow.schema.ts`, `TERMINAL_SENTINEL` moved there from `workflow-loader.ts:584` and its four import sites repointed — in preference to a new `src/schema/graph.ts`. The constant is a schema fact currently misfiled in the loader, and moving it breaks the loader-versus-activity-variables cycle without a fourth file.
- Design 1's enforcement-table shape: one row per invariant with WHERE and WHAT IT REPORTS, and the NOT-structural rows marked as such (its rows 23, 26, 27, 28). It is the most auditable of the three, and the honest marks are what a specification needs to carry forward.
- Design 1's `fan-artifact-collision` reasoning about `write-artifact`'s find-or-update plus re-scan mint guard — the concrete failure two document-writing branches produce, and the one hazard the load cannot see because the loader does not compose technique signatures.
- Missing from all three and needed: (a) a load-time rejection of any list destination during the window between the schema stage and the runner stage, so the ceiling is a load failure rather than a stage note; (b) `check:binding-fidelity`, `check:variable-model` and `check:anchors` named in acceptance criteria — the three registered guards that mechanise the undeclared-input, dead-seed and new-anchor findings respectively, none of which any design mentions; (c) a decision-inventory diff as the stated acceptance criterion for the seven gate removals, backed by `check:activity-variables`' hard-zero `unwritten-read` over each removed gate's `setVariable` targets.

## Judge 2

**Verdict:** **Build Design 3's runtime, Design 2's namespacing, and Design 1's enforcement discipline — then hold corpus adoption.**\n\n**Cost, measured.** Files touched: Design 1 ≈ 44 (11 `src/`, 2 `schemas/` incl. one generated, 1 generated `site/`, 3 `scripts/`, 5 `tests/`, 1 `docs/`, ~21 corpus). Design 2 ≈ 51 (17 `src/`). Design 3 ≈ 47, or ~49 once `src/utils/session/store.ts`, `src/utils/session/migration.ts` and `src/tools/workflow-tools.ts:730,995-999` are added back. The earlier priced alternative — a fifth step kind at ~15 files plus a retraction of `no-domain-work` — is **three times cheaper on files, and all three of these designs also amend `no-domain-work`**, so none is cheaper on either axis than the option already judged expensive. Design 1's \"ONE UNION IN ONE FILE / NO NEW src MODULE\" framing is presentation: it still touches eleven `src/` files and moves `TERMINAL_SENTINEL` with four import repoints that a different placement makes unnecessary.\n\n**Does it work?** All three walk the worked example correctly at the schema and dispatch layers, and all three correctly identify the four silent breakages a naive widening would cause (`activityGraph`'s `graph.has(array)` at `src/utils/activity-variables.ts:543,610`; the predecessor intersection at `:634-639`; `check-review-mode-gating.ts:156`; `walker.ts:271`). On the failure cases: *one branch fails* — Design 3 needs zero server support, Designs 1 and 2 need a rebind outcome; *one yields a gate* — all three ban it at load and refuse `yield_checkpoint`, correctly, since `assertNoActiveCheckpoint` (`src/utils/session/params.ts:68`) gates `get_activity`, `get_technique`, `get_resource` and `get_workflow`, so one gating branch stops its siblings; *the batch bound refuses one* — vacuous in all three, because `src/utils/batch.ts:154,176-177` exempts a scope with no activity yet; *replacement worker* — Design 3 free, others one call; *two write one artifact* — caught by no design at load, guard-only and literal-names-only in all three, and the worked example trips it (`review-assumptions::record` → `assumptions-log.md`, bound by four activities). Design 3 is the only one where entering the join early is unrepresentable rather than refused, which is the strongest available realisation of the owner's first fixed decision.\n\n**What it buys, honestly.** The corrected figures at `docs/dispatch-model.md:86` — 261,971 characters standalone against 222,505 batched — put the delivery premium at 39,466 characters, a floor, plus two extra harness establishments the docs rate at two-to-four times the collapsing saving: ~118,000-197,000 characters total, ≈30,000-49,000 tokens. The join is *not* an extra fan cost (three activities is exactly `DEFAULT_BATCH_MAX_ACTIVITIES`, so the destination is a fresh dispatch either way). Against that, the fan buys roughly a 3× wall-clock reduction on the analysis stretch, free at the turn boundary. **It is token-negative and latency-positive: a latency purchase, not an efficiency one.** No design says this, all three quote figures that do not exist in the tree, and one design's own residual risk (a per-session write lock serialising the branches' delivery calls) would erode the only benefit — which makes \"compare-and-swap on `seq`, not a lock\" the one-line prerequisite rather than a footnote.\n\n**Speculation.** One call site, and it does not survive its own admission checks: seven checkpoint steps across the three candidate branches, four exits to four destinations on `codebase-comprehension`, an artifact rule that forbids concurrent appends to the assumptions log, and an inverted data dependency (`plan-prepare` reads two names `research` and `implementation-analysis` write) that no design notices. Namespacing also removes a fanned activity from five shared write sets that seven activities currently contribute to.\n\n**Simplest sufficient stage one — ~22 files, not ~47.** Cut, each with a named upgrade trigger: the new `src/schema/graph.ts` (put the pure derivations in `workflow.schema.ts`, `fanGroups` in the loader); the arrival-union meet in `unreachableReads` (declare the branch keys on the workflow file — `owned` ⇒ `availableAtEntry` ⇒ `policy`, `scripts/check-activity-variables.ts:94,228,244`); `pathReads`, `references` and all three member-grain families; the `binding-provenance` dotted-tail fix and the line-422 read fix (both pre-existing, both their own commits); `dispatch_agent_id` and the bind outcome; the `src/utils/batch.ts` carve-out; four of the load rules. Keep: the union with `.min(2)`, eight load rules, the `activityGraph` flatten, the `check-review-mode-gating` flatten, the walker and smoke changes, Design 3's frontier and single rule, Design 2's validated wrap, `dispatch-fan.md` with the drive-loop bind, and `fan-artifact-collision` — the one new check that is safety floor rather than hygiene. Merge it dormant; the first fan waits for a site that exists.

**Ranking:** **Design 3 — Fan destination with a derived barrier and a single-cursor frontier.** The only one that makes early entry into the join *unrepresentable* rather than refused: one rule (retire the named entry; enter `activity_id` iff the frontier is now empty) covers a sequential advance, a fan enter, a mid-fan branch return and the last branch return with no special cases, and it subsumes `one-advance-per-activity`'s second-advance hazard with the same predicate. `frontier: string[]` is one field replacing one field; keying resolution on the activity id rather than a minted identity costs zero server support for the replacement-worker case and reuses the `activity_id` parameter `get_technique` already has (`src/tools/resource-tools.ts:654-661`). Its namespacing is a safety-floor regression and must be replaced with Design 2's, and its site list is incomplete — but its runtime is the smallest thing that fully works. | **Design 2 — Fan destination with a frontier cursor.** Correct exactly where Design 3 is wrong (member-grain validation survives) and where Design 1 is wrong (`mergeActivityVariables` left alone, so a fanned activity's seeded defaults still reach the bag), and its site enumeration is the only accurate one of the three. But it is the most expensive at ~51 files: an object-valued frontier carrying three fields that are copies of facts already in the graph or the history, four `next_activity` outcomes where two suffice, one extra control-plane round trip per branch to bind an identity the server never needs, and a `src/utils/batch.ts` carve-out nothing acts on. | **Design 1 — Derived fan: one union, a history-derived frontier, one namespacing wrap.** The best enforcement table (28 rows, four of them honestly labelled NOT structural) and the best namespacing *mechanism* (validate members against the branch activity's own `variables.writes`, not the merged set). But it keeps `currentActivity` as a second home for the run position beside a history-derived open set — the derived-state shadow it cites against a rival idea; it empties that cursor during a fan without repointing `src/tools/workflow-tools.ts:735-748`, silently disabling three advisory validations for exactly the activities where a fresh worker per branch makes fidelity checking most valuable; its `mergeActivityVariables` substitution silently drops a fanned activity's seeded defaults; and its three new hard-zero guard families will fire ~35 times on the very fan they are for. "ONE UNION IN ONE FILE" is presentation, not cost: the change is ~44 files and moves `TERMINAL_SENTINEL` with four import repoints that a different placement makes unnecessary.

### Findings

```json
[
 {
  "design": "all three",
  "severity": "Critical",
  "entry": "fabricated-cost-figures",
  "evidence": "All three price the fan against \"232,954 characters standalone against 159,093 batched\" cited to `docs/dispatch-model.md:79`, and an establishment ratio cited to `:62`. Neither citation nor either figure exists in the tree. `docs/dispatch-model.md:79` is a blank line inside the batch-limits table (`:76-78`); `:62` is inside a JavaScript `Task({...})` code block. The real measurement is at `docs/dispatch-model.md:86`: \"The benchmark's three activities cost 222,505 characters batched \u2026 Standalone, the same three cost 261,971, so batching saves 15%.\" `159,093` appears nowhere in `docs/`, `src/`, `scripts/` or `tests/` \u2014 the 159,000 at `:86` is a *declared-token* threshold below which the character budget takes over, not a character count, and it has been transposed into one. The honest premium is 261,971 \u2212 222,505 = **39,466 characters (+17.7%)**, and `docs/dispatch-model.md:84` calls even that a floor because `bench:batch` never fetches lazily. Every design's \"the net is negative but the capability is sound\" paragraph is therefore computed from numbers roughly 47% wrong in the expensive direction. `workflows/ponytail/resources/honesty-boundary.md` forbids exactly this: \"any specific per-repo figure is fabricated. Do not state one.\"",
  "fix": "Delete every character figure from all three submissions. Re-run `npm run bench:batch` against the pinned corpus before any cost paragraph is written, and cite `docs/dispatch-model.md:86` by its live numbers. State the premium as a range with its basis (eager-only floor) and name the two extra harness establishments separately, since `docs/dispatch-model.md:68` rates those at \"two to four times what the delivered content collapsing saves\" \u2014 which on the corrected 39,466 is ~79k-158k char-equivalents, making the total fan premium ~118k-197k characters \u2248 30k-49k tokens at `DEFAULT_BUNDLE_CHARS_PER_TOKEN = 4` (`src/config.ts:156`)."
 },
 {
  "design": "Design 3",
  "severity": "Critical",
  "entry": "unvalidated-branch-write",
  "evidence": "Design 3 wraps before the call \u2014 `const writes = isFanBranch(graph, exitingActivity) ? { [branchKey(exitingActivity)]: variables_changed } : variables_changed;` \u2014 and then states under **Not changed**: \"With one container declared, only `type: object` is checked.\" Nothing is checked. `mergeActivityVariables` contributes only `activity.variables?.writes` (`src/utils/activity-variables.ts:141`) plus the workflow file's own declarations (`:139`); `variables.reads` contribute no declaration at all, so the destination declaring `variables.reads: [research_outputs]` puts nothing into `result.value.variables`. `applyVariableWrites` then reaches `declarations.get('research_outputs')` \u2192 `undefined` \u2192 the declared-type branch (`src/utils/variable-seed.ts:80`) and the value-set branch (`:86`) are both skipped, and `draft.variables[name] = value` lands at `:93`. `variables_changed` is `z.record(z.unknown())` (`src/tools/workflow-tools.ts:85`) \u2014 the one agent-supplied record the server does not type \u2014 so Design 3 removes the only check on it for precisely the activities a fan runs. Concretely: `research` declares `context_scope` with `values: [repo-only, web-retrieval, mixed]` (`workflows/work-package/activities/04-research.yaml:32-39`); fanned under Design 3, a branch reporting `context_scope: \"everything\"` lands silently. `workflows/ponytail/resources/the-ladder.md:45` puts input validation at trust boundaries on the safety floor, which \"is never simplified away.\"",
  "fix": "Graft Design 2's mechanism: `applyVariableWrites` takes `ctx.namespace?: string`; the per-name loop runs unchanged against the declarations, then the commit becomes one assignment of the whole map under the key with one `variable_set` event. Take Design 1's refinement of the declaration source \u2014 validate against `getActivity(workflow, branchActivity).variables.writes` rather than the merged set \u2014 so validation does not depend on the merge and survives whatever the merge later does."
 },
 {
  "design": "Design 1",
  "severity": "High",
  "entry": "two-homes-for-the-run-position",
  "evidence": "Design 1's **Not adding** claims \"NO NEW SESSION FIELD\u2026 every reader falls through to `currentActivity`\", while its dispatch section states \"a fan member's enter records its identity on the event and leaves the cursor empty, so the cursor is empty for the duration of a fan.\" Both representations are then live: `currentActivity` (`src/schema/session.schema.ts:99`, 24 read sites in `src/tools/resource-tools.ts`, 15 in `src/tools/workflow-tools.ts`, 88 mentions repo-wide) and `openActivities`/`heldActivity` derived from `activity_entered` minus `activity_exited`. On an ordinary walk the derived set is a complete shadow of the scalar \u2014 enter Y, exit X, so `openActivities = {Y} = {currentActivity}` at every point \u2014 and nothing enforces that they agree. This is `no-derived-state-shadow`, the entry Design 1 itself invokes to reject a rival construct. Designs 2 and 3 both replace the field, which is the repo's own no-compatibility-layer rule applied to state.",
  "fix": "Replace `currentActivity` rather than shadowing it. Design 3's `frontier: string[]` is the minimum that expresses both cases with one home; `TOP_LEVEL_KEY_PRIORITY` (`src/utils/session/store.ts:121`) and `src/utils/session/migration.ts:182,243` are the two sites that make the substitution complete."
 },
 {
  "design": "Design 1",
  "severity": "High",
  "entry": "silent-validation-loss-during-a-fan",
  "evidence": "`src/tools/workflow-tools.ts:735-748` gates four things on `state.currentActivity` being truthy: `validateStepManifest` (`:736`), `validateTechniqueFetches` (`:741`), the \"No step_manifest provided\" advisory (`:743`), and `validateReportedExit` (`:746-747`). Design 1's runtime empties the cursor for the duration of a fan and its Stage 3 site list names only \"scope resolution in get_activity, get_technique, get_resource and dispatch_child\" \u2014 these four are not enumerated anywhere in the submission. With the cursor empty, every one of them short-circuits on every branch return: no manifest validation, no technique-fetch fidelity cross-check, no missing-manifest warning, and no exit check, for exactly the calls where three fresh contexts each report a manifest the server has never cross-checked. None of it fails; all of it goes quiet. Design 1's own claim that \"not one non-fan path changes behaviour\" is true and irrelevant \u2014 the loss is entirely on the fan path.",
  "fix": "Enumerate the four sites and repoint them at the resolved retiring activity, as Design 2 does (its Stage 2 lists `:735,736,741,742,743,746`) and as Design 3's `from_activity` resolution does structurally. Add a handler test asserting a branch return with a bad manifest still warns."
 },
 {
  "design": "Design 1",
  "severity": "High",
  "entry": "dropped-seed-defaults",
  "evidence": "Design 1's guard change 3 has `mergeActivityVariables` contribute, for a fanned activity, \"ONE declaration `{ name: key, type: 'object', description: \u2026 }` **INSTEAD** of that activity's own write declarations.\" The merged set is what seeds the bag and what `unreachableReads` treats as available at entry: `scripts/check-activity-variables.ts:229-231` adds every merged declaration carrying a `defaultValue` to `availableAtEntry`, with the comment at `:226-227` saying so explicitly. `research` declares three defaults that no other activity declares in the same shape \u2014 `context_scope: repo-only` and `context_scope_uncertain: false` (`workflows/work-package/activities/04-research.yaml:32-43`), the latter read by research's own step gate `when: context_scope_uncertain != true` at `:186` before any step of research writes it. Fanned under Design 1, the container carries no `defaultValue`, the seed disappears, and that gate reads `undefined`. Nothing reports it: research declares `context_scope_uncertain` under `writes`, not `reads`, so the guard's `reads` map never sees it and no `unreachable-read` fires. A silent runtime behaviour change inside a branch, produced by a change made for the guard's benefit.",
  "fix": "Do not substitute in the merge. Designs 2 and 3 both leave `mergeActivityVariables` alone and are right to; the container only needs to exist where a check consults it, and the guard's `namespace` already admits it from the destination's declared read (`scripts/check-activity-variables.ts:102-105`). If `get_workflow` should render the container, add it beside the members rather than in place of them."
 },
 {
  "design": "all three",
  "severity": "High",
  "entry": "member-family-fires-on-internal-writes",
  "evidence": "All three add a member-grain \"nothing gathers this\" family (Design 1's `ungathered-branch-output`, Design 2's member-grain `unread-write`, Design 3's member-grain `unread-write`), and all three define the reader test as *some other activity's* reference to `key.member`. Today the equivalent check exempts a self-consumed write: `readersOf` (`scripts/check-activity-variables.ts:199-206`) registers `record.derived.consumes` for **every** record including the writer, so an activity that writes a working value and reads it back within its own steps is not reported at `:216-223`. None of the three carries that forward. `research` declares **15** writes (`workflows/work-package/activities/04-research.yaml`): `assumption_outcome, assumption_review_presentation, assumptions_log, challenge_findings, context_scope, context_scope_uncertain, current_assumption, has_deferred_assumptions, has_open_assumptions, has_reconcilable_research, has_resolvable_assumptions, needs_individual_interview, needs_research, open_assumptions, research_candidates`. Most are intra-activity working values \u2014 `current_assumption` is a loop item, `context_scope_uncertain` gates one step. `implementation-analysis` declares a comparable set, `codebase-comprehension` likewise. A destination gathers three or four names. So on the worked-example fan the new family reports on the order of **35 defects in a hard-zero guard for a correct definition**, and the corpus cannot go green until an author either invents gathers for loop items or the exemption is added.",
  "fix": "Make the branch's own `derived.consumes` a reader of its own member, mirroring `:199-206`. Then measure the family against a fixture fan before trusting it \u2014 and consider deferring the whole member grain out of stage one (see `arrival-meet-deferrable`), since a mistyped *key* is already caught by `unused-declaration` (`:170-177`) and only a mistyped *member* is not."
 },
 {
  "design": "Designs 1 and 2",
  "severity": "High",
  "entry": "identity-keyed-resolution-where-activity-keyed-suffices",
  "evidence": "Both add `dispatch_agent_id` to `next_activity`, a whole new call outcome (Design 2's outcome 2, \"Bind\"), one extra control-plane round trip per branch, a per-entry `agentId` on the frontier (Design 2), and a reordering of `dispatch-activity.md` step 3 so identities are minted *before* the enter. The server does not need the identity in advance for anything it derives. The batch bound and the delivery ledger key on `activity_dispatched.data.agentId` (`src/utils/batch.ts:72-86`, `98-123`), and that event is emitted \"when the dispatched context first reaches it\" (`src/utils/dispatch.ts:14-16`) \u2014 i.e. from the worker's own `get_activity` call, which already carries `agent_id`. `validateTechniqueFetches` filters on the same. Design 3 keys resolution on the activity id the caller names, which needs no minting, no bind outcome, no rebind path (the replacement worker names the same activity, still in the frontier), and reuses the parameter `get_technique` already has (`src/tools/resource-tools.ts:654-661`) \u2014 Convention Over Invention. It is also a *stronger* check than the worker-side `verify-dispatched-activity` comparison it replaces, because a worker can skip a self-check and cannot skip a refusal.",
  "fix": "Drop `dispatch_agent_id`, the bind outcome and the per-entry `agentId`. Take Design 3's `from_activity` on `next_activity` and `activity_id` on `get_activity`, both refusing a name the frontier does not hold."
 },
 {
  "design": "all three",
  "severity": "High",
  "entry": "no-day-one-call-site",
  "evidence": "The corpus has zero fan-ready sites, and the worked example is not adoptable for four independent reasons, only two of which any design names. (1) **Gates**: `research` declares 4 checkpoint steps (`04-research.yaml:105,190,222,241`), `implementation-analysis` 2 (`:124,143`), `codebase-comprehension` 1 (`15-codebase-comprehension.yaml:127`) \u2014 every candidate branch fails the gate-free rule. (2) **Convergence**: `codebase-comprehension` binds four exits to four different destinations (`work-package/workflow.yaml:219-223`), `research.done \u2192 implementation-analysis`, `implementation-analysis.done \u2192 plan-prepare` \u2014 none of the three converges anywhere, let alone on one activity. (3) **The artifact rule, not just the filename**: `review-assumptions::record` writes `assumptions-log.md` (`work-package/techniques/review-assumptions/record.md:24`) and is bound by 04, 05, 07 and 08; `work-package/techniques/review-assumptions/TECHNIQUE.md:28,42` makes that log \"the record of truth\" that \"grows as the work progresses\" under a rule named `assumptions-log-is-the-record`. Two concurrent branches appending to one growing record violate a corpus rule, which no filename check expresses. (4) **The data flow inverts, and no design notices**: `plan-prepare` declares reads of `assumption_outcome` and `has_resolvable_assumptions` (`06-plan-prepare.yaml:6,10`), both of which `research` and `implementation-analysis` write. Fanning them *after* `plan-prepare` puts the plan before its inputs \u2014 and once namespaced they stop writing those bare names at all, so every downstream reader has to be repointed. Measured across `work-package/activities/`: `has_resolvable_assumptions` is written by 7 activities and read by 6; `assumption_outcome` written by 4, read by 5; `assumptions_log`, `open_assumptions`, `has_open_assumptions` written by 7 each. Decision 2 removes a fanned activity from every one of those write sets.",
  "fix": "Ship the capability dormant and hold corpus adoption until a real pair exists: two or more analysis activities that are gate-free, artifact-disjoint, single-destination, and downstream of the values they consume. Replace the worked example in the specification with one that satisfies its own load rules, or state plainly that no current corpus shape does. Under `workflows/ponytail/resources/the-ladder.md:28`, rung 1, a construct whose only call site fails its own admission checks has not yet earned existence \u2014 but the owner has decided to build it, so the honest form of that finding is: build it, do not adopt it yet, and do not let stage 6 gate the merge."
 },
 {
  "design": "all three",
  "severity": "High",
  "entry": "unstated-benefit",
  "evidence": "Every design prices the fan and none prices what it buys. All three close with a cost paragraph and \"the capability is sound\", leaving the net question unanswerable from the submissions. The only thing a fan buys is wall clock: three long reasoning passes run inside one turn instead of three sequential dispatches, and the wait is free at the turn boundary (`workflows/meta/techniques/harness-compat/claude-code.md:24-27`). Against a batched walk the fan trades roughly 30k-49k tokens (corrected figures, above) for roughly a 3\u00d7 reduction on that stretch. Two corrections make the trade better than any design claims. First, **the join is charged twice**: `DEFAULT_BATCH_MAX_ACTIVITIES = 3` (`src/config.ts:165`) and `batchRefusal` refuses a fourth distinct activity per scope (`src/utils/batch.ts:181`), so a batched walk of three activities is exactly at the cap and the destination is a fresh dispatch in *both* topologies \u2014 yet all three add \"plus the join re-pays full delivery\" to the fan side only. Second, **the batch bound cannot refuse a branch**, so the failure case all three write rules for is vacuous: `batchState` exempts a scope with `activities.length === 0` (`src/utils/batch.ts:154`) and `batchRefusal` returns `undefined` for it (`:176-177`), so a fresh branch identity is always admitted its first activity.",
  "fix": "State the trade as what it is \u2014 a latency purchase, not an efficiency one \u2014 with the token cost as a range and the wall-clock gain as its counterpart. Remove the join from the fan's cost side. Cut the batch-bound branch rules to one sentence noting the exemption at `src/utils/batch.ts:154` is the reason a branch is never refused, and that the real hazard is a shared identity reaching a `bundle: reference` delivery it does not hold."
 },
 {
  "design": "all three",
  "severity": "Medium",
  "entry": "manufactured-module-cycle",
  "evidence": "Designs 2 and 3 each open a new `src/schema/graph.ts` and Design 1 moves `TERMINAL_SENTINEL` out of `src/loaders/workflow-loader.ts:584` and repoints four import sites (`src/utils/validation.ts:6`, `src/tools/workflow-tools.ts:11`, `tests/workflow-loader.test.ts:12`, `tests/e2e/walker.ts:22`). All three justify it by a cycle: the loader imports `mergeActivityVariables` from `src/utils/activity-variables.ts:11`, and a derivation needing `TERMINAL_SENTINEL` cannot sit in either. The cycle is created by the placement choice, not by the requirement. `destinationTargets`, `isFan` and `branchKey` need nothing but the array test and can live in `src/schema/workflow.schema.ts`, which imports no loader and no util. Only `fanGroups`' terminal-branch and terminal-join rules need the sentinel, and `fanGroups`' only consumer that needs the *join* is the loader itself \u2014 which already owns the sentinel and already owns the validation. `activity-variables.ts` needs `destinationTargets` alone for the `activityGraph` flatten at `:543`, which is cycle-free from `workflow.schema.ts`.",
  "fix": "Put `destinationTargets` / `isFan` / `branchKey` beside `GraphSchema` in `src/schema/workflow.schema.ts` and `fanGroups` in `src/loaders/workflow-loader.ts` next to `validateExitBindings`. No new module, no sentinel move, four import sites untouched. This also composes with `arrival-meet-deferrable`: with the arrival meet deferred, `activity-variables.ts` never needs the join at all."
 },
 {
  "design": "all three",
  "severity": "Medium",
  "entry": "arrival-meet-deferrable",
  "evidence": "All three rewrite the meet in `unreachableReads` from intersection-over-predecessors (`src/utils/activity-variables.ts:634-639`, seeded from `outgoing(sources[0])` at `:637`) to intersection-over-arrivals with a fan contributing the union of its branches. All three are right that the current meet reports false `entry` findings at a join \u2014 a branch key only one branch writes drops out of the intersection \u2014 and all three are right about the three ways to apply the fix and have it do nothing. But all three also concede it is a new operator in a hard-zero guard with no ledger to diff, so a bug in it is silent, and Design 3 lists that first among its own residual risks. There is a cheaper stage-one route none of them found: `availableAtEntry` is seeded from `owned` \u2014 every name the workflow *file* declares, `defaultValue` or not (`scripts/check-activity-variables.ts:94`, `:228`) \u2014 and `owned` is also passed as `policy` (`:244`), which exempts a name from the `re-entry` family. Declaring the branch keys on the workflow file therefore puts them in `incoming` for every node from the first iteration, and the intersection never drops them.",
  "fix": "Stage one: declare the fan's branch keys on the workflow file's own `variables` as `type: object`, and keep the meet as it is. Ship only the `activityGraph` flatten at `:543` (one line; without it `graph.has(array)` is false at `:610`, no branch head is reachable, and the definite-assignment check is not wrong for a branch but *disabled* for it \u2014 which all three correctly identify as the silent case). Upgrade trigger for the arrival meet: a second fan in the corpus, or a branch key read anywhere but its own destination."
 },
 {
  "design": "all three",
  "severity": "Medium",
  "entry": "redundant-load-rules",
  "evidence": "Two of the ten-to-twelve fan rules are subsumed by others. **Branch-is-the-source** (Design 1 rule d, Design 2 rule 3, Design 3 F5): if `plan-prepare` is a branch of its own fan, then `plan-prepare`'s exits must all name the join, but `plan-prepare.done` names the fan \u2014 a list \u2014 so the nested-fan rule rejects it first. **Join-is-a-branch** (Design 3 F9): if the join were a branch, that branch's exits must name the join, i.e. itself, which the self-loop rule already rejects. Design 1's rule j (branch-key legality) is near-vacuous: `branchKey` of any kebab activity id with the `_outputs` suffix satisfies `QUALIFIED_DATA_ID_PATTERN` (`src/schema/identifiers.ts:16`), and key uniqueness follows from the duplicate-branch rule since keys derive injectively from distinct ids. Design 2's rule 7 (no `defaultValue` on a branch write) is only needed if the merge substitutes \u2014 which it should not (see `dropped-seed-defaults`); left in, it rejects `research` outright, since `research` declares three (`04-research.yaml:20,32,40`), making Design 2's own primary worked-example branch un-fannable without editing them away, a cost Design 2 does not price.",
  "fix": "Ship eight rules: unknown branch (widen the existing loop at `src/loaders/workflow-loader.ts:565` over `destinationTargets`), duplicate branch, terminal branch, branch binds no exit, nested fan, self-looping branch, convergence, join-is-not-terminal, plus the gate ban. Drop branch-is-source, join-is-a-branch, branch-key legality and the `defaultValue` rule, and say in the specification which rule subsumes each."
 },
 {
  "design": "Design 3",
  "severity": "Medium",
  "entry": "incomplete-site-list",
  "evidence": "Design 3 replaces `currentActivity` with `frontier` but its Stage 4 list omits `TOP_LEVEL_KEY_PRIORITY` (`src/utils/session/store.ts:113-121`, which names `currentActivity` between `planningFolderPath` and `currentTechnique` and feeds `canonicaliseJson`, hence the seal) and `src/utils/session/migration.ts:182,243`, which constructs the field from a legacy `payload['act']`. Both are compile-visible, but the stage plan under-counts by two files and the migration path for a session recorded before the change is undesigned \u2014 Design 2 covers both. Design 3 also unions `activity_id` on the tool without repointing `getActivity(result.value, activity_id)` at `src/tools/workflow-tools.ts:730-731`, where an array yields `undefined` and throws `Activity not found: research,codebase-comprehension,implementation-analysis`, nor `responseData.activity_id` and `name: activity ? activity.name : 'Workflow Complete'` at `:995-999`, which render an array and a wrong name on a fan enter. Finally, its own schema comment says the frontier is \"Empty \u2026 after the run completes\" while its rule \"a string pushes one and runs the terminal check\" pushes `__terminal__` into it.",
  "fix": "Add `store.ts`, `migration.ts` and `workflow-tools.ts:730,995-999` to Stage 4, and resolve the terminal case: retire, do not push, and let `status: 'completed'` be the record. Reconsider the `activity_id` union \u2014 Design 2's objection to two call shapes on one parameter has force even with `.min(2)` closing the one-element case; a separate optional `branch_activities` would keep `activity_id: z.string()` intact, at the price of one parameter."
 },
 {
  "design": "Design 2",
  "severity": "Medium",
  "entry": "carve-out-nothing-acts-on",
  "evidence": "Design 2 changes `batchState` (`src/utils/batch.ts:149-160`) to answer `mayContinue: false` for a scope bound to an entry carrying `joinTo`, documented beside the three existing carve-outs at `:9-16`. Nothing acts on the answer. Design 2's own `a-branch-takes-one-activity` rule says the branch's envelope goes to `dispatch-fan`, which ignores `batch_may_continue`; Design 1 and Design 3 both note the same and change nothing (\"NO CHANGE TO src/utils/batch.ts\"). The carve-out also cannot fire where it would matter: `batchState` exempts a scope with no activity yet (`:154`), and a branch scope has exactly one, so the reading is already `true`-then-irrelevant. Design 2 adds a fourth documented carve-out to a file whose comment header calls three of them load-bearing, for a value no caller reads.",
  "fix": "Cut it. If `dispatch-fan` ever needs to say a branch may not continue, the rule is where it belongs \u2014 `dispatch-fan`'s `a-branch-takes-one-activity` \u2014 and the frontier refusal is the backstop, which is exactly Design 3's reasoning."
 },
 {
  "design": "Designs 1 and 3",
  "severity": "Medium",
  "entry": "unrelated-fix-bundled",
  "evidence": "Both fold two pre-existing, non-fan defects into the fan change. (1) `src/utils/binding-provenance.ts:275-276` builds `TOKEN_RE`/`EXACT_TOKEN_RE` from `IDENTIFIER_PATTERN` with no dotted tail. Design 1 calls it \"load-bearing once every gather is dotted\"; Design 3 says the same. Design 2 is right that it is orthogonal \u2014 `workflows/work-package/activities/08-implement.yaml:102` already exercises it with `-p {current_task.crate}`, and a mistyped gather key is caught by `unused-declaration` (`scripts/check-activity-variables.ts:170-177`) on the destination's own declared read, so the fan does not make it load-bearing. (2) Design 1's item 5 changes `read(bound)` to `read(bagName(bound))` at `src/utils/activity-variables.ts:422` and admits in its own residual risks that this \"changes a shared code path\" for every literal input value in the corpus and \"needs a full check:activity-variables run to confirm zero movement.\" A change that can move a hard-zero guard's output across 17 workflows does not belong in the same PR as a new construct with zero call sites.",
  "fix": "Land both as their own commits with their own acceptance criterion (\"`check:activity-variables` output byte-identical\"), before or after the fan, never inside it. This is `workflows/ponytail/resources/the-ladder.md:36` \u2014 deletion and separation over accretion \u2014 applied to change scope rather than to code."
 },
 {
  "design": "all three",
  "severity": "Low",
  "entry": "artifact-collision-check-is-the-only-floor-item",
  "evidence": "All three place the two-branches-one-artifact check in `check-activity-variables` rather than the loader, correctly, because the loader does not compose technique signatures and `activity-variables` already does (`src/utils/activity-variables.ts:310-320`). All three also label it non-structural and text-only. What none of them says is that it is the *only* new check on the safety floor rather than in the over-engineering bracket: `write-artifact`'s find-or-update on a bare filename with a re-scan mint guard means two concurrent branches both re-scan, both create, and the run thereafter resolves the lowest-numbered instance \u2014 data loss, which `workflows/ponytail/resources/the-ladder.md:46` puts on the floor. Every other new guard family in all three designs is a definition-hygiene check that could be deferred; this one cannot.",
  "fix": "Keep exactly one new guard family, `fan-artifact-collision`, and mark it floor in the specification so a later trim does not take it with the rest. Note that it is decidable only for literal names, and that the corpus's own `assumptions-log-is-the-record` rule (`work-package/techniques/review-assumptions/TECHNIQUE.md:42`) is the stronger constraint no filename check expresses."
 },
 {
  "design": "all three",
  "severity": "Low",
  "entry": "rebaseline-cost-unpriced",
  "evidence": "Every design's stage 6 says to re-record `tests/e2e/option-coverage.json` with `npm run baseline:stamp` and re-measure `DRY_WALKS`. None prices it. `tests/e2e/option-coverage.test.ts:40-56` states the measurement: 50 dry walks \"covers 154 of 275 declared options across 14 workflows in 1144 seconds\", the plateau \"is a property of the graph, so it has to be re-measured whenever the graph grows\", and on `workflow-design` 36 was the lowest value that cleared where 30 did not. A fan multiplies branch orderings the enumerator produces, so each re-measure attempt is a ~19-minute full-set walk, and a too-small budget is reported as *unreached options* \u2014 i.e. as a definitions defect \u2014 not as a budget shortfall.",
  "fix": "Price stage 6 with the walk time and state the failure signature so a red coverage job is not misdiagnosed as a bad definition. Land the walker and smoke changes (`tests/e2e/walker.ts:53,254-273,293-306,637-663`, `scripts/smoke/smoke-orchestrator.ts:241`) strictly before any corpus fan \u2014 all three say so, and all three are right: unflattened, `pickNext` returns the array, `transition` sends it as `activity_id`, `z.string()` rejects it, and `expect(walkErrors).toEqual([])` fails."
 },
 {
  "design": "all three",
  "severity": "Low",
  "entry": "three-graph-type-declarations",
  "evidence": "The destination type is declared three times: `src/schema/workflow.schema.ts:51-52`, `scripts/check-review-mode-gating.ts:87` (`type Graph = Record<string, Record<string, string>>`, parsing raw YAML at `:190` so the loader's rules cannot protect it), and `tests/e2e/walker.ts:53` (imported by `scripts/smoke/smoke-orchestrator.ts:29`). All three designs correctly identify all three and correctly identify the consequence at `check-review-mode-gating.ts:156` \u2014 `activities.get(<array>)` is `undefined`, so every checkpoint reachable only through a fan silently drops out of the review-mode audit, which is the class that guard exists for. None proposes consolidating; Design 3 alone notes that nothing prevents the import drifting back to a local declaration.",
  "fix": "Have both scripts import `Destination` from the schema module rather than re-declaring it, and add the import to the guard's own acceptance criterion. One shared type is the in-repo-helper rung (`workflows/ponytail/resources/the-ladder.md:29`) applied to a duplication the fan makes consequential."
 }
]
```

### Grafted onto the winner

- **Design 2's `applyVariableWrites` namespacing, with Design 1's declaration source.** `ctx.namespace?: string`; the per-name validation loop at `src/utils/variable-seed.ts:75-92` runs unchanged, then one assignment of the whole map under the key with one `variable_set` event carrying the members. Read the declarations from `getActivity(workflow, branchActivity).variables.writes` (Design 1) rather than the merged set (Design 2), so validation does not depend on what the merge does and each member keeps its declared type and value set — `context_scope`'s three-value set at `workflows/work-package/activities/04-research.yaml:32-39` is the concrete test. This is the single most important graft: without it Design 3 removes the only check on the one agent-supplied record the server does not type.
- **Design 1's enforcement table format, including its honest NOT-structural labels.** Twenty-eight rows of what / where / what it reports, with four rows (artifact collision, progress mark reaching the remote, one usage entry per branch, one source commit at the barrier) explicitly marked as *not* structural. That is what makes an enforcement claim reviewable instead of aspirational, and it is the shape the specification's enforcement section should take whichever runtime wins.
- **Design 1's `write-artifact` reasoning for the collision check.** The find-or-update keyed on a bare filename plus a re-scan mint guard means two concurrent branches both re-scan, both create, and the run thereafter updates the lowest-numbered instance. That sentence is why the check is safety floor rather than hygiene, and it should survive verbatim into the specification.
- **Design 3's per-session-write-lock latency observation.** If issue #655 is fixed with a per-session write lock rather than a compare-and-swap on `seq`, N branch contexts serialise their `get_activity` / `get_technique` / `get_resource` calls behind it — each one an ~85,000-character composition (`docs/dispatch-model.md:86`) plus canonicalise, seal and atomic write — so the fan's wall-clock advantage shrinks toward the batched walk's. Since wall clock is the *only* thing a fan buys, this belongs in the one-line prerequisite statement, not in a residual-risks list: the design needs #655 fixed as a **compare-and-swap on `seq` with retry**, not as a lock.
- **Design 2's site enumeration, wholesale.** It is the only accurate one of the three — 23 `currentActivity` reads in `src/tools/resource-tools.ts`, 11 in `src/tools/workflow-tools.ts`, one in `src/logging.ts`, plus `TOP_LEVEL_KEY_PRIORITY` and `src/utils/session/migration.ts` (measured: 24 / 15 / 1, 88 mentions repo-wide). Use it as the checklist for whichever frontier lands, and add the four validation gates at `src/tools/workflow-tools.ts:735-748` that all three under-specify.
- **Design 2's probe of the one-element-list message, against Design 1's `errorMap`.** The two contradict: Design 1 says an `invalid_union` issue without an `errorMap` renders only `Invalid input`, so the arity rule needs one; Design 2 reports probing zod and getting the array branch's own `.min(2)` message through `formatZodIssues` (`src/loaders/workflow-loader.ts:42`). Resolve it empirically before writing the schema — if Design 2 is right, the `errorMap` is a `delete` finding, because it *suppresses* the more specific message it was added to supply.
- **Design 1's residual-risk pair that survives every design.** The first-envelope-wins race on a replaced branch (whichever envelope arrives first retires the branch; the second is refused, so one branch's work is discarded and only the trace says which), and trace segments being per session rather than per delivery scope (`src/trace.ts:108-114`), so a fan's segments partition an interleaved multi-branch stream at arbitrary points. All three fix the `act` stamp; none can separate the segments. Both belong in the specification's known-limits section.
- **Design 3's `no-batch-change` / `no-agentId-on-the-frontier` reasoning.** Keying resolution on the activity id makes failure recovery need zero server support and closes three call outcomes, one tool parameter and one carve-out at a stroke. Its four "upgrade trigger" annotations — a branch that must re-enter itself, a branch that must trigger a child or take a second activity, a wrong-typed branch member reaching a destination undetected, a measured run that exhausts the orchestrator's context — are the right form for a deliberate ceiling and should be carried into the specification as the ponytail marker convention prescribes.
