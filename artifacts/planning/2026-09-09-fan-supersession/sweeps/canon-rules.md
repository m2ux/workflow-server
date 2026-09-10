# Rules the fan makes redundant — candidates before refutation

**Coverage.** **Design read.** `.engineering/artifacts/planning/2026-09-09-parallel-activities/README.md` in full for the sections that bear on rules: the executive summary and forms (1-530), the transition rule and barrier (1042-1140), the dispatch and cost sections (1190-1470), the whole enforcement chapter (1700-1900: parse S1-S5, load L1-L16, refusals T1-T9, guards G1-G11, unrepresentables D1-D10, actor contracts N1-N8, fannability conditions, what no check reaches), the system-fit chapter (2036-2210: gather at the join, artifacts, progress table, versioning), future features, decisions and residual risks. `delivery-plan.md` in full — seven stages, acceptance criteria, the two-key stale-restatement sweep, guard obligations, and the four-tier migration surface whose tier four is the retirement list.

**Canon read in full.** `workflows/workflow-design/resources/design-principles.md` (all 35 principles), `schema-construct-inventory.md` (all four construct tables, checkpoint effects, action types), `convention-conformance.md`, `applicable-constructs.md`, `pattern-analysis.md`. `anti-patterns.md` (1977 lines) read by heading index plus every entry matching fan-out / parallel / concurrency / dispatch / forEach / graph / destination / terminal, and in full for AP-24 no-contradictory-rules, AP-39 hoist-universal-techniques, AP-108, AP-110 duplicate-shared-capability, AP-120, AP-124 alternate-ops-as-protocol-sequence, AP-128 unproduced-value-read, AP-129 stale-restatement-after-change, AP-133 overlapping-rule-scopes, AP-137 unowned-harness-capability, AP-138 output-without-destination, AP-140/141, AP-146 instruction-narrates-an-actor, AP-147 rule-binds-beyond-its-operation.

**Definition rule sections read in full.** `meta/techniques/scatter-gather.md`, `orchestrator-conduct.md`, `worker-conduct.md`, `variable-binding.md`, `agent-conduct.md` (headings plus `checkpoint-discipline`); `harness-compat/` — `spawn-agent.md`, `spawn-concurrent.md`, `TECHNIQUE.md`, `claude-code.md`, `generic.md`, and `cursor.md`/`cline.md` grepped for depth and nesting; `orchestration-patterns/TECHNIQUE.md` and `dispatch-workers.md`; `workflow-engine/` — `continue-batch.md`, `dispatch-activity.md`, `activity-worker.md`, `handle-sub-workflow.md`, `evaluate-transition.md`, plus rule-heading indexes for `finalize-activity.md`, `commit-and-persist.md`, `yield-checkpoint.md`. Also `meta/activities/patterns/README.md`, `02-supervisor.yaml`, `04-isolated-fan-out.yaml`, `meta/workflow.yaml`, the drive-loop activity `03-dispatch-client-workflow.yaml` (step kinds and gates), `work-package/techniques/analyse-challenge/challenge.md`, `substrate-node-security-audit/techniques/dispatch-sub-agents/TECHNIQUE.md`.

**Measured, not assumed.** `scatter-gather` declarations: 26 activity YAML files, 0 `workflow.yaml` files. Citations of scatter-gather rule anchors: 3 (`spawn-concurrent.md:40`, `orchestration-patterns/TECHNIQUE.md:54` and `:62`). `spawn-concurrent` mentions: 14 across 8 files. `dispatch_concurrency` / `isolation_mode` bindings: 5 pattern-activity sites plus `cicd-pipeline-security-audit/activities/03-primary-scan.yaml:29`. Harness files carrying a depth rule: 0 of 4 (two Capability lines advertise a "depth policy" their Rules do not hold). The double-advance behaviour was checked against live code, not inferred: `src/tools/workflow-tools.ts:770` takes `exitingActivity = draft.currentActivity` and `:842` assigns `draft.currentActivity = activity_id`, with the completed-set push between them.

**Deliberately not covered.** The 31 prose restatements of "a destination is one activity" that the plan's first stale key already enumerates — those are descriptions, not rules, and the plan's file counts are its own. Domain-workflow rule sets beyond the two I sampled (`substrate-node-security-audit`, `work-package::challenge`), since the plan puts their migration out of scope. Guard-script internals: I confirmed no `check-refs` script exists under that name and did not establish exactly how `check-all-refs.ts` resolves a `::rule-name` anchor, so the blast-radius claim for the three scatter-gather citations is stated as citations to repoint rather than as a proven guard failure. One name collision worth knowing: `src/utils/fan-out.ts` already owns the term "fan-out" for a container-inheritance delivery measurement, unrelated to this construct.

Every candidate here was put to an agent instructed to refute it from the repository. The verified outcome is in [../verification/canon-rules.md](../verification/canon-rules.md), and that is the document to act on.

## REMOVE — workflows/meta/techniques/scatter-gather.md — `## Rules` → `one-gather-contract-two-scatter-modes`, plus the Parallel arms of Protocol steps 1 and 2

**What it does today.** Declares that sequential-loop accumulation and parallel fan-out are the same primitive over one gather contract, differing only in dispatch mechanism, and that "sequential mode is the `concurrency = 1` case of parallel mode". The Protocol's parallel arm tells the reader to build one instance prompt per work unit and dispatch them all through `spawn-concurrent`.

**Why the fan takes it.** The rule exists to keep two paths interchangeable, and one of them cannot run anywhere it is declared. All 26 declarations are activity-level; none is workflow-level, so every one is delivered into `get_activity` and read by a worker that `depth-1-only` says holds no dispatch primitive. The fan gives concurrency a home in the graph, and at graph grain the two are no longer one primitive: an instance fan's alternative is an in-activity `forEach` — a different construct, in a different file, with an inverted cost profile ("an instance fan's premium is the activity's whole payload N−1 times over"), and the schema refuses a fan of one (`minItems: 2`; `maxInstances` min 2), so "the `concurrency = 1` case" is unrepresentable. The specification also makes the graph fan a *third* mode over the same gather contract, so the rule's own name and count are wrong the moment stage 4 lands.

**Evidence.** scatter-gather.md:12-17 (Protocol, both mode arms) and :22-24 (the rule). `grep -rln '^  - scatter-gather$' --include=*.yaml` → 26 files; `grep -rn 'scatter-gather' --include=workflow.yaml` → 0 hits, so no orchestrator-bucket declaration exists. Design README:385 ("a scatter-gather operation with a parallel mode … every one inside an activity executed by a dispatched worker that holds no agent-dispatch tool"), :1294 ("unreachable from every one of its call sites"), :1459 (the per-unit arithmetic), :2068 ("the graph fan is a third scatter mode over it beside the two the scatter-gather technique already names"). delivery-plan.md:20 lists `scatter-gather.md` in stage 4; :306 retires the paired parallel selection on `dispatch-workers`.

**Blast radius.** Three rule citations to repoint: `harness-compat/spawn-concurrent.md:40` and `orchestration-patterns/TECHNIQUE.md:62` cite `parallelism-is-optimisation`; `orchestration-patterns/TECHNIQUE.md:54` cites `isolation-then-combine`. 26 activity YAML files declare the technique (unchanged if the sequential contract survives). `anti-patterns.md:490` (AP-33 do-not-flag) and `:560` (AP-39 coverage example) name it by name. `work-package/techniques/analyse-challenge/challenge.md:27` applies it and cites `depth-1-only` for "the mode available to this context". The `refs`/anchor guard resolves the three `::rule-name` citations.

**If left alone.** Two authored ways to say "run this N times concurrently" — one in the graph that executes, one in a strategy technique delivered to 26 activities that cannot — and a rule whose stated purpose is keeping them substitutable. An author who reads the rule first authors the mode that never runs, which is the exact failure the design opens on.

## REMOVE — workflows/meta/techniques/scatter-gather.md — `## Rules` → `parallelism-is-optimisation`

**What it does today.** "Sequential mode is always valid for correctness; parallel mode is an optimisation that adds concurrency and isolation. Where genuine parallel fan-out is not needed, sequential mode (the `concurrency = 1` case) is the correct default." It is the load-bearing sentence the other two `parallelism-is-optimisation` rules cite.

**Why the fan takes it.** Its first clause becomes false for the case the fan exists to serve. The batch budget counts characters delivered and never characters generated, so an in-context loop of N units piles all N passes into one unbounded context; the specification's own words are that "a fan converts unbounded growth in one context into N bounded ones. That is isolate-then-combine buying correctness rather than latency." Sequential is then not "always valid for correctness" — it is the arm that loses correctness at width. And the fallback the rule names has no graph-grain referent: a fan admits at least two branches, so there is no `concurrency = 1` case to default to.

**Evidence.** scatter-gather.md:38-40. Design README:1465 (the unbounded-growth argument, stated as the counterweight to the token number), :58 ("That is correctness and latency, not efficiency"), :1461 (a declared ceiling of one is refused, "because a destination whose ceiling is one is a plain edge spelled a second way"). Schema: `DestinationSchema` array `.min(2)` and `maxInstances` `.min(2)` (README:563-616).

**Blast radius.** `harness-compat/spawn-concurrent.md:40` and `orchestration-patterns/TECHNIQUE.md:62` each restate it by citation and lose their cited home when it goes. No YAML binds it directly.

**If left alone.** The canon keeps a correctness claim the fan's own rationale contradicts, in the one rule two other files defer to — so the contradiction propagates to three homes rather than being fixed in one.

## REMOVE — workflows/meta/techniques/orchestration-patterns/dispatch-workers.md — the whole operation, and the `dispatch_concurrency` input it and `orchestration-patterns/TECHNIQUE.md:16-18` declare

**What it does today.** Dispatches an ordered set of worker briefs and returns harness results in input order. Protocol step 2 spawns one `spawn-agent` per brief when `dispatch_concurrency` is 1; step 3 spawns one `spawn-concurrent` batch when it is greater.

**Why the fan takes it.** The graph fan is now the construct that opens several workers, and this operation cannot open even one from where it is bound. The delivery plan retires only the parallel selection and asks the operation to "state its in-activity sequential contract positively" — but the sequential branch applies `spawn-agent`, and `depth-1-only` states flatly that "a spawned agent therefore has no dispatch primitive". The specification agrees and is more decisive than the plan: "every one of its binding sites is a client activity executed by a dispatched worker, so **neither** of its concurrency branches is executable there." Retiring half leaves the surviving half reading as the sanctioned path.

**Evidence.** dispatch-workers.md:16-18 (the input), :29-30 (both branches). harness-compat/spawn-agent.md:44-46 (no dispatch primitive for a spawned agent). Design README:1202 ("neither of its concurrency branches is executable there") against delivery-plan.md:306 ("the parallel selection on the dispatch-workers operation is retired and the operation states its in-activity sequential contract positively"). Note the distinction that makes this safe: `scatter-gather`'s *sequential* mode invokes a per-unit operation in a `forEach` and spawns nothing, so it survives; this operation spawns in both arms.

**Blast radius.** Four pattern activities bind it — `meta/activities/patterns/01-orchestrator-workers.yaml`, `02-supervisor.yaml:47-50` (with `dispatch_concurrency: 1`), `04-isolated-fan-out.yaml`, `05-lead-researcher.yaml`. `orchestration-patterns/TECHNIQUE.md` declares `dispatch_concurrency` and two rules over it (`parallelism-is-optimisation`, and `prefer-activity-composition`'s pipeline). `cicd-pipeline-security-audit/activities/03-primary-scan.yaml:29` binds `dispatch_concurrency: scanners_assigned` — the shadow width variable the adoption commit deletes. Canon: `design-principles.md:87`, `schema-construct-inventory.md:38,39,41,42`, `anti-patterns.md:1439`, `meta/activities/patterns/README.md`.

**If left alone.** An operation no binding site in the corpus can execute stays in the shared layer with its contract stated in positive present tense, so it reads as current capability. Every canon row that prescribes it keeps sending authors to it, and the fan becomes the second way to say the same thing.

## DEPRECATE — workflows/meta/techniques/workflow-engine/continue-batch.md — `## Rules` → `one-advance-per-activity`

**What it does today.** Two claims in one entry. An ownership claim: this operation advances the pointer so it owns getting a worker onto the activity it advanced to, and the only paths that reach `dispatch-activity` are those where no advance has happened yet. And a hazard claim justifying it: "a second advance onto an activity already current records that activity as exited and complete before a worker has walked a step of it, and every later reader of the session … believes it."

**Why the fan takes it.** Partly, and the specification overstates it. The frontier refusal T3 closes a second retirement of a *branch* — "a call naming an activity it does not hold is refused" — and that is real. It does not close the hazard this rule names. The refusal fires on a call that *names* its exiting activity, but `from_activity` is optional ("Omit while one activity is in flight") and neither caller passes it: `continue-batch` step 1 calls `next_activity { session_index, activity_id, step_manifest, agent_id }` and `dispatch-activity` step 2 calls `next_activity { session_index, activity_id, step_manifest }`. On a one-entry frontier the five-step resolver takes "the sole entry", so a second advance onto the activity already current retires that same activity — exit event, completed set, session exit — and re-enters it. Today's code does exactly this, and the resolver preserves it by design ("behaviour is identical to today").

**Evidence.** continue-batch.md:68-72 (the rule), :46 (the call, no `from_activity`); dispatch-activity.md:51 (the call, no `from_activity`). Design README:1076 (the subsumption claim), :1052 (`from_activity` "Omit while one activity is in flight"), :1058 step 1 ("Unnamed with at most one entry: the sole entry"), :1071 ("step 5 always fires, so behaviour is identical to today"), :1791 (T3, "Subsumes the second-advance hazard `one-advance-per-activity` names"). Live code: `src/tools/workflow-tools.ts:770` `const exitingActivity = draft.currentActivity;` then the `completedActivities.push`, then `:842` `draft.currentActivity = activity_id` — no comparison between the two.

**Blast radius.** delivery-plan.md:65 schedules "the one-advance rule" for amendment in stage 6. `continue-batch.md:72` cites `dispatch-activity#delivery-keys-on-agent-context`; `dispatch-activity.md`'s `dispatch-topology` states the same batch topology and is the natural home for the surviving ownership half. `activity-worker.md`'s `batch-ends-where-the-server-says` and `one-activity-at-a-time-in-a-batch` are the worker-side siblings.

**If left alone.** Either the corpus keeps a prohibition whose hazard is genuinely closed (if `from_activity` becomes required on every transition, in which case the entry should go and `dispatch-topology` absorbs the ownership half), or — as the design stands — the hazard clause is deleted on a subsumption that does not hold for the single-entry walk, and the silent false-completion it names comes back with nothing left saying not to do it.

## DEPRECATE — workflows/meta/techniques/harness-compat/spawn-agent.md — `## Rules` → `depth-1-only`, second paragraph, and the first paragraph's citation of the harness technique files

**What it does today.** Settles agent-tree depth at one level and states that spawned agents inherit no dispatch primitive. Then draws three consequences: `concurrency = 1` is a spawned agent's scatter contract, "any scatter-gather it runs is the sequential case, and running one is conformance, not deviation"; "Parallel scatter is available only where the dispatch primitive is — at the orchestrator"; and "Hoist a pass there when its fan-out is worth an orchestrator-owned step; otherwise author it sequential and size the work accordingly." The first paragraph closes by citing where the underlying fact lives: "Harness-specific nesting limits are documented in the harness technique files."

**Why the fan takes it.** This is the rule the fan answers, and the specification says so: "That rule already ends by instructing an author to hoist a pass to the orchestrator when its fan-out is worth an orchestrator-owned step, and offers no construct for doing so. This is that construct." So the hoist instruction is fulfilled, but not in the shape it describes — the construct is a graph destination the orchestrator executes on the activity's behalf, not an orchestrator-owned step. The `concurrency = 1` scatter-contract sentence becomes vacuous once `scatter-gather` has no parallel mode to be the sequential case of. Separately, and independently of the fan: the cited home is empty. No `## Rules` entry in `claude-code.md`, `cursor.md`, `cline.md` or `generic.md` states any depth or nesting limit; only the Capability lines of `claude-code.md:8` and `cursor.md:8` advertise a "standing wait/depth policy", and both files' Rules hold `spawn`/`resume`/`concurrent` and nothing else.

**Evidence.** spawn-agent.md:42-46. `grep -n 'depth|nest'` across `harness-compat/`: hits only `spawn-agent.md:44` and `cursor.md:8`; `claude-code.md`, `cline.md`, `generic.md` and `TECHNIQUE.md` carry no depth rule. Design README:1357 ("This is that construct"), :1202 ("`depth-1-only` … states the reason and sanctions this placement by name"). The rule appears on no stage file list in delivery-plan.md and is absent from the amendment list at README:2207 ("the amended dispatch, orchestrator-conduct, worker, batch-continuation, persist and planning-readme rules, the variable-binding and scatter-gather techniques").

**Blast radius.** Cited by name from `orchestration-patterns/TECHNIQUE.md:70` (`no-nested-orchestrators`), `workflow-engine/handle-sub-workflow.md:40` (`solo-walk-the-child`), `work-package/techniques/analyse-challenge/challenge.md:27`, `schema-construct-inventory.md:44`, and `meta/activities/patterns/README.md` catalog row. `orchestrator-conduct.md:18` (`one-level-of-indirection`) states the same depth fact and claims "the depth itself is settled here".

**If left alone.** The one rule an author reaches when asking "may I run these concurrently?" keeps answering with a hoist to an orchestrator-owned step, which is not what the fan is, and keeps a scatter-contract sentence about a mode that no longer exists. And its pointer to harness nesting limits keeps citing four files that document none — `cited-home-owns-claim` in the canon's own vocabulary, and it survives the fan either way.

## REMOVE — workflows/workflow-design/resources/design-principles.md — §18 Prefer Shared Capability, final sentence

**What it does today.** "For mid-phase multi-agent fan-out and consolidate, prefer the meta `orchestration-patterns` ops and borrowable `activities/patterns/` before local spawn-concurrent / merge recipes." It is the canon's routing answer for an author who wants concurrency.

**Why the fan takes it.** It routes to an operation whose parallel branch is unreachable at every one of its fifteen bindings, and — once `dispatch-workers` goes whole — to an operation with no executable branch at all. Fan-out is owned by the graph after this lands; the sentence's two destinations become the in-worker half only.

**Evidence.** design-principles.md:87. delivery-plan.md:198 names this site as the first of two canon sites amended under the second stale-restatement key: "the shared-capability principle's sentence preferring the orchestration operations and the borrowable pattern activities for mid-phase multi-agent fan-out … Each is amended to name the layer it now covers." Design README:385 and :1294 give the unreachability.

**Blast radius.** `anti-patterns.md:1443` (AP-110 Fix) cites §18 as its remediation order; `design-principles.md:157` (§34, open–closed) cites §18; `schema-construct-inventory.md:38` prescribes the same chain the sentence prefers.

**If left alone.** The canon's own routing prose sends an author to the retired vocabulary, and a definition audited against §18 is told to prefer the path that cannot execute over the graph destination that can.

## REMOVE — workflows/workflow-design/resources/design-principles.md — §26 Atomic Techniques; Compose at Activities, the parenthetical pattern enumeration

**What it does today.** Sanctions activity→activity composition "including the meta pattern library under `meta/activities/patterns/` (orchestrator-workers, supervisor, plan-and-execute, isolated-fan-out, lead-researcher)" — a five-name copy of the directory's contents inside the canon.

**Why the fan takes it.** Four of the five lose their fan-out halves to the graph fan and the supervisor loses its reason to exist entirely ("Served but pointless. The construct it wants is a plain graph edge, executed by the ordinary dispatch operation"). The enumeration then names constructs whose advertised shape the graph owns. It is also a file that must change only to keep agreeing with another file's contents — §34's own test for coupling to content it does not own.

**Evidence.** design-principles.md:119 (the enumeration), :159 (§34's test: "name every file a later extension of this contract would force an edit to. A file that must change only to keep agreeing … is coupled to content it does not own"). delivery-plan.md:260 (supervisor verdict), :306 (four pattern activities' fan-out halves retired, plan-and-execute kept). The plan's second stale key at :198 names only §18, the inventory row and the patterns README — this canon site is not on the list.

**Blast radius.** `schema-construct-inventory.md:37` restates the same directory claim; `meta/activities/patterns/README.md` holds the authoritative catalog map; `anti-patterns.md:1439` links the directory. Removing the parenthetical leaves the directory index as the single home.

**If left alone.** A third canon site keeps enumerating the pattern library after the library changes shape, and the plan's own sweep does not reach it — the exact defect `stale-restatement-after-change` describes, whose test is "occurrence count against the tree, not against the change's file list".

## REMOVE — workflows/workflow-design/resources/schema-construct-inventory.md — the "supervisor / fixed specialist lanes" row

**What it does today.** Maps the informal pattern to a formal construct: borrow `meta/patterns/02-supervisor.yaml`, or bind `classify-request` → compose → dispatch → gather → synthesise and seed `{lane_roster}`.

**Why the fan takes it.** The construct it prescribes is a five-step pipeline that dispatches one worker with `dispatch_concurrency: 1` over a one-element collection. Once a destination can name activities, that is a plain graph edge walked by the ordinary dispatch operation — a construct the inventory already carries in its Graph row. The specification's verdict is unambiguous: "Served but pointless."

**Evidence.** schema-construct-inventory.md:39. `meta/activities/patterns/02-supervisor.yaml:47-50` binds `dispatch-workers` with `dispatch_concurrency: 1`; its `work_units` and `worker_briefs` declarations both say "one-element ordered array". delivery-plan.md:260. Stage 6 acceptance at delivery-plan.md:181 already requires that "no row claims a layer another row now owns".

**Blast radius.** `meta/activities/patterns/02-supervisor.yaml` and its README catalog row and pattern note; `orchestration-patterns::classify-request` loses its only binding site and needs its own verdict; `design-principles.md:119` names `supervisor` in the §26 enumeration.

**If left alone.** The inventory offers two formal constructs for one informal pattern — a graph edge and a one-element scatter pipeline — and the one it names is the unexecutable one. That is `duplicate-shared-capability` written into the canon's own mapping table.

## REMOVE — workflows/workflow-design/resources/schema-construct-inventory.md — the "orchestrator-workers / fan-out then consolidate (mid-phase)" row, and by the same argument the "subagent-isolation" and "lead-researcher" rows

**What it does today.** Prescribes the decompose → compose-briefs → dispatch → gather → synthesise chain as consecutive activity steps, or borrowing the corresponding pattern activity; and closes with "Session-level orchestrator/worker remains `workflow-engine::dispatch-activity` — do not invent a second session orchestrator." The isolation row prescribes borrowing `04-isolated-fan-out.yaml` and seeding `isolation_mode`; the lead-researcher row prescribes two fans plus a `while` loop.

**Why the fan takes it.** The concurrent half of each chain now lives in the graph. The specification's migration table serves the orchestrator-workers shape as "Three graph nodes: source, fan, meeting point", with "the pattern's home moves from a borrowable activity file to an inventory row"; the isolation row's context isolation is "exactly what a fan gives" while worktree isolation is not served at all; the lead-researcher shape becomes a fan plus a graph cycle. The closing prohibition — do not invent a second session orchestrator — was the fence between the two layers, and the fan puts fan-out on the session layer, so the fence has nothing left to separate.

**Evidence.** schema-construct-inventory.md:38, :41, :42. delivery-plan.md:198 names this file's within-activity fan-out row as the second canon site of the second stale key, "prescribing the decompose, compose, dispatch, gather and synthesise chain as consecutive activity steps … amended to name the layer it now covers — work units inside one worker for the operations, the graph instance fan for one activity over N work units." delivery-plan.md:259, :261, :262 (per-pattern verdicts); README:2197 (worktree isolation not served).

**Blast radius.** delivery-plan.md:22 lists `schema-construct-inventory.md` in stage 6. The four pattern activities the rows point at; `orchestration-patterns/TECHNIQUE.md`'s `prefer-activity-composition` states the same pipeline as a rule; `design-principles.md:87` and `:119`; `meta/activities/patterns/README.md`. The same file's Graph row ("naming the destination activity, or `__terminal__`") is one of the two statements this file contributes to the plan's first stale key.

**If left alone.** The universal obligation at the top of this file is that "every piece of prose must be checked against this inventory — if a formal construct exists, it must be used." Leaving the rows unamended makes the in-activity chain the mandated construct for a shape the graph now owns, so conformance to the inventory and conformance to the design point opposite ways.

## REMOVE — workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md — `## Rules` → `parallelism-is-optimisation`

**What it does today.** "Honor [scatter-gather]::parallelism-is-optimisation (a `{dispatch_concurrency}` of 1 remains correct)."

**Why the fan takes it.** Its entire subject is the `dispatch_concurrency` input declared eleven lines above it. Remove the input with the operation that reads it and the rule constrains nothing; its cited home is being removed in the same change.

**Evidence.** orchestration-patterns/TECHNIQUE.md:16-18 (the input) and :60-62 (the rule). scatter-gather.md:38-40 (the cited home). delivery-plan.md:306.

**Blast radius.** Contained. Removing it leaves `isolation-mode-write-boundary`, `workers-see-briefs-only`, `no-nested-orchestrators` and `prefer-activity-composition` in this bucket, each with its own verdict below.

**If left alone.** A container rule merged into every operation of the group, constraining an input no operation declares — `rule-binds-beyond-its-operation` with the subject gone rather than merely misplaced.

## REMOVE — workflows/meta/techniques/harness-compat/spawn-concurrent.md — `## Rules` → `parallelism-is-optimisation` (the operation itself is KEEP)

**What it does today.** "Honor [scatter-gather]::parallelism-is-optimisation — sequential fallback via [spawn-agent] remains valid."

**Why the fan takes it.** `spawn-concurrent` gains its first executable caller in `dispatch-fan`, and for that caller the one-turn batch is not an optimisation — it is where the joining property comes from. The specification rests the barrier's cost-free wait on exactly this: "a turn does not resume until every tool result returns, so joining the envelopes is a fact of the turn: nothing polls, nothing times out, nothing is scheduled," with `foreground-always` making the blocking-equivalent wait "a contract rather than an option". A rule telling the operation's only live caller that a sequential fallback remains valid points at the one thing that forfeits the wall clock the fan exists to buy, and its cited home is going.

**Evidence.** spawn-concurrent.md:38-40. Design README:1214 (the wait costs nothing; `foreground-always` as contract), :1210 (`dispatch-fan` "spawns the batch"), :1206 ("The orchestrator emits several agent dispatches in one turn"). `generic.md:26` holds the harness-level fallback ("Otherwise fall back to sequential [spawn-agent] calls"), which is where a genuine harness shortfall belongs.

**Blast radius.** This is the operation's only rule; removing it empties the section. `harness-compat/TECHNIQUE.md:20` and `claude-code.md:24-27` / `cursor.md:20-22` / `cline.md:23-25` / `generic.md:23-27` hold the `concurrent` slices. `dispatch-fan.md` (new in stage 6) becomes the caller.

**If left alone.** The operation that makes a fan happen carries a rule saying the concurrency is optional, delivered to the orchestrator that reads it — and the fan's stated purchase is wall clock alone, so an orchestrator taking the licence spends the cost and buys nothing.

## REMOVE — workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md — `## Rules` → `isolation-then-combine`

**What it does today.** "Honor [scatter-gather]::isolation-then-combine for parallel fan-out." A one-line pointer, qualified to the parallel path.

**Why the fan takes it.** The qualifier names the retired path, and at graph grain the invariant it points at stops being something an actor honours at all: "Each branch's whole reported map lands under a key derived from its activity id, server-side, inside the transition call … A caller never supplies the key, so the namespace is the only route a branch's values have into the bag" — the specification rates it **Unrepresentable**, up from Convention. A pointer whose trigger is the retired mode and whose target has become structural carries nothing.

**Evidence.** orchestration-patterns/TECHNIQUE.md:52-54. Design README:1301-1302 (both rows move Convention → Unrepresentable), :515 ("This is the corpus's own `isolation-then-combine` rule raised from work units inside one activity to activities inside one graph"). A third copy of the same invariant sits at `work-package/techniques/analyse-challenge/challenge.md:42-44`.

**Blast radius.** Contained in this file. The home rule in `scatter-gather.md:30-32` survives — see the KEEP below. The local copy in `challenge.md` is a separate `single-rule-authority` question the fan does not settle.

**If left alone.** Three homes for one invariant, one of them qualified to a mode that no longer exists, at the moment the invariant becomes unrepresentable at the layer that matters. Whichever home an author reads, the qualifier tells them it applies only where they cannot go.

## KEEP — workflows/meta/techniques/scatter-gather.md — `## Rules` → `isolation-then-combine`, `accumulate-never-overwrite`, `order-is-preserved`, and the one gather contract

**What it does today.** Keeps per-unit outputs isolated in an ordered keyed collection merged only through a delegated combine step, appends rather than overwrites, and preserves work-unit order so the combine is deterministic.

**Why the fan takes it.** It does not. The fan *raises* this rule rather than replacing it — the specification calls the branch container "the corpus's own `isolation-then-combine` rule raised from work units inside one activity to activities inside one graph" and cites the rule by dotted address from the server source comment that implements the wrap. What still needs it at its original grain is the sequential in-activity loop: a `forEach` body writing a per-iteration scalar into the parent bag, where no guard sees the clobber and the rule is the only thing standing against it. Order preservation likewise still has work: at graph grain it is structural (the slot is the collection's own position), inside a loop it is not. The rule survives — but its wording must stop saying "Parallel instance outputs" and "race and clobber across instances", which name the retired path, and stage 4 already adds the graph-fan application beside it.

**Evidence.** scatter-gather.md:26-36. Design README:515, :1171 (source comment: "Corpus rule: meta/techniques/scatter-gather.md#isolation-then-combine"), :1301-1302, :2078 ("It is the corpus's own isolate-then-combine discipline reaching one more surface"). delivery-plan.md:51 (stage 4 adds "the graph-fan application of isolate-then-combine … and the rule that a meeting point gathers the container rather than naming a slot"). `anti-patterns.md:490` keeps the do-not-flag arm for "cross-iteration accumulator / scatter-gather gather over a `forEach`", which is the sequential grain.

**Blast radius.** 26 activity declarations keep the technique for its sequential mode. `orchestration-patterns/TECHNIQUE.md:54` and `challenge.md:42` are restatements to reconcile. `N7` adds `a-join-gathers-the-container-not-an-index` to this same rule set.

**If left alone.** Nothing breaks, but the wording keeps describing the path being removed, so a reader takes the rule as scoped to parallel dispatch and stops applying it to the loop grain where it is still the only protection.

## KEEP — workflows/meta/techniques/orchestrator-conduct.md — `## Rules` → `one-level-of-indirection`

**What it does today.** "An orchestrator dispatches workers; a worker dispatches none of its own. One level, so every agent touching a run is one the orchestrator placed there and the run's own constraints reach all of them. A workflow whose isolation depends on that says so in its isolation rules; the depth itself is settled here."

**Why the fan takes it.** It does not, and this is the rule most likely to be mistaken for superseded. A fan widens the *breadth* of one level and touches its depth not at all: the orchestrator opens N branch workers in one turn and each dispatches none. The specification is built on the rule rather than against it — the fan is bound at `03-dispatch-client-workflow.yaml` "and only there: it is the one activity in the corpus whose steps the top-level agent executes inline", and `L14` refuses a fanned activity binding `handle-sub-workflow` precisely to keep a branch from opening a level of its own. What does change is the delegation route beside it: `no-domain-work` names `dispatch-activity` as the single route and `automatic-transitions` names `finalize-activity` / `dispatch-activity`, and the fan adds `dispatch-fan` to both.

**Evidence.** orchestrator-conduct.md:12-18, :28-30. Design README:1202 (single bind site), :1739 (L14, child-workflow dispatch refused), :2207 (orchestrator-conduct listed among amended rules), :1318 (D3: "At most one fan is open … no branch can open a fan of its own"). delivery-plan.md:65 ("the delegation routes").

**Blast radius.** Two homes now claim to settle depth — this rule ("the depth itself is settled here") and `spawn-agent::depth-1-only` — with `orchestration-patterns::no-nested-orchestrators` deferring to the second and `schema-construct-inventory.md:44` and `patterns/README.md` restating it. That overlap predates the fan and `overlapping-rule-scopes` / `single-rule-authority` reach it.

**If left alone.** The rule itself is fine. The risk is the opposite of removal: reading the fan as a depth change and weakening a rule that is load-bearing for `L14`, `D3` and the single bind site.

## DEPRECATE — workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md — `## Rules` → `isolation-mode-write-boundary` (worktree arm), and the `isolation_mode` input it governs

**What it does today.** "Under `context` isolation, workers must not write sibling workspaces. Under `worktree` isolation, workers must create/use their worktree before mutating files."

**Why the fan takes it.** The fan takes the arm that works and cannot honour the arm that does not. Context isolation "is served natively — every branch is a fresh context under its own identity", so the first arm becomes automatic. The second is exactly what a fan cannot do: "worktree isolation is not served at all: the rule that a worker creates or uses its own worktree before mutating files is precisely what branches sharing one session tree cannot honour." Its only binding is `04-isolated-fan-out.yaml`, whose dispatch half is retired, so after tier four the `worktree` arm has no executable caller and `isolation_mode` no consumer.

**Evidence.** orchestration-patterns/TECHNIQUE.md:20-22 (the input), :56-58 (the rule). `meta/activities/patterns/04-isolated-fan-out.yaml:9,44,64` — the only binding, seeding and outcome. Design README:2197 (worktree isolation not served), :1338 ("the working tree is not namespaced. A fan's branches share one tree and one git index"), :1875 (fannability condition 5, L14). delivery-plan.md:261 ("Worktree isolation is not served — the branches share one working tree").

**Blast radius.** `04-isolated-fan-out.yaml` and its README pattern note; `compose-worker-briefs` takes `isolation_mode` as a deviation input at that activity's step; `schema-construct-inventory.md:41` prescribes seeding it.

**If left alone.** A two-armed rule whose first arm the fan makes free and whose second arm the fan makes impossible, with the impossible arm the only reason the `isolation_mode` input exists — so the input survives as an authored control over behaviour no construct can deliver.

## DEPRECATE — workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md — `## Rules` → `workers-see-briefs-only`, and (by dependency) `prefer-activity-composition`

**What it does today.** `workers-see-briefs-only`: "Worker prompts carry the assigned brief, output contract, and tools — not the parent's full reasoning or sibling briefs." `prefer-activity-composition`: multi-op pipelines (decompose → dispatch → gather → synthesise) are bound as activity steps or borrowed pattern activities under `meta/activities/patterns/`.

**Why the fan takes it.** Both describe a channel and a shape the fan replaces. The fan's per-unit work reaches a branch as state, not as prose in a stub, and the specification refuses the prompt channel on principle: "The composed prompt is unavailable because it is the wrong channel. Prior-activity context reaches a worker as state, not as prose in its stub, and a fact a worker needs that no variable carries is a missing declaration rather than a licence to inline." The brief-composition operation is "**displaced** at this layer rather than served … it survives for fan-out inside one worker" — but that survival depends on an in-worker dispatch that `depth-1-only` denies. `prefer-activity-composition`'s pipeline becomes three graph nodes, with "the pattern's home moves from a borrowable activity file to an inventory row".

**Evidence.** orchestration-patterns/TECHNIQUE.md:64-66, :72-74. Design README:1135 (the prompt is the wrong channel), :1137 (the parameter is a server-computed projection on the load response), :2074 (compose-worker-briefs displaced), :230 ("I want to learn nothing about the fan's width"). delivery-plan.md:259 ("the brief-composition step is displaced, the brief travelling as the projection; and the pattern's home moves from a borrowable activity file to an inventory row").

**Blast radius.** `compose-worker-briefs.md` and its four pattern-activity bindings; the three domain brief-composition techniques that follow the same shape (`cicd-pipeline-security-audit/techniques/dispatch-scanners/compose-scanner-briefs.md`, `compose-merge-brief.md`, `compose-verification-brief.md`, `substrate-node-security-audit/techniques/dispatch-sub-agents/compose-roster-briefs.md`); `schema-construct-inventory.md:38,39,41,42`.

**If left alone.** Two sanctioned ways for work to reach a worker — as a composed brief in a prompt, and as a projected variable on the load response — with a rule governing the one the fan's own channel rule forbids. The pipeline rule keeps naming the activity-steps shape as the composition home after the graph takes it.

## REMOVE — workflows/meta/activities/patterns/README.md — "These activities cover **in-activity fan-out / consolidate** only", "Fan-out primitives remain [`scatter-gather`] and [`harness-compat`]", and the `duplicate-shared-capability` anti-pattern trap

**What it does today.** Fences the pattern library off from session-level dispatch, names the two techniques that own fan-out primitives, and warns against re-teaching `Task` / spawn-concurrent recipes locally instead of binding those ops.

**Why the fan takes it.** After the fan the fan-out primitive is a graph destination, so the second claim is wrong, and the trap directs an author to bind ops being retired. The delivery plan's own phrasing concedes the first claim is currently false — it says the README's in-activity-only claim "becomes accurate in the same edit" — which means the file asserts a scope the library does not have today and will have for a different reason tomorrow.

**Evidence.** `meta/activities/patterns/README.md` (the three claims, in the header block and under "Anti-pattern traps"). delivery-plan.md:198 ("The pattern directory's README claim that its activities cover in-activity fan-out only becomes accurate in the same edit"), :306 ("the pattern directory's README describes only what remains"). The catalog row "hierarchical-agents | *(composition)* `dispatch_child` + borrow a pattern activity in the child | depth-1; no nested Task orchestrators" is unaffected and stays.

**Blast radius.** Linked from `design-principles.md:87` and `:119`, `anti-patterns.md:1439`, `schema-construct-inventory.md:37`. The catalog map and the five per-pattern notes need the same edit as the activities themselves; the pattern notes' "set `dispatch_concurrency` > 1 for parallel fan-out" and "parallel dispatch" lines go with `dispatch_concurrency`.

**If left alone.** The directory index keeps naming `scatter-gather` and `harness-compat` as where fan-out lives after the graph takes it, and keeps a trap sending an author to bind retired ops — a canon-adjacent home restating superseded behaviour, which reads as current fact.

## DEPRECATE — workflows/workflow-design/resources/anti-patterns.md — AP-110 `duplicate-shared-capability`, Detect arm two and the fan-out Do-not-flag carve-out

**What it does today.** Detect arm two: "Also flag local re-teaching of concurrent `Task` / spawn-concurrent / dispatch-then-merge pipelines when `orchestration-patterns` or a borrowable `meta/activities/patterns/` activity already covers the shape." Do-not-flag: "session-level `dispatch-activity` (graph orchestrator/worker — different layer from mid-phase fan-out)."

**Why the fan takes it.** The Detect arm's remedy points at the retired home: after the fan, the shape is covered by a graph destination, not by an operation or a borrowable activity, so a reader applying it repoints local novelty onto a path that cannot run. The carve-out is the clearer case. It exists only to hold two dispatch layers apart so an auditor does not flag the session-level one for duplicating the mid-phase one — and the fan collapses that boundary, putting fan-out on the session layer with one home. That is precisely the shape §35 addresses: a carve-out that existed to police an overlap, removable with the overlap.

**Evidence.** anti-patterns.md:1439 (Detect), :1441 (Do-not-flag), :1443 (Fix, citing §18 and §26). design-principles.md:161-163 (§35: "Retire one and the warning has nothing left to say, along with the validation and carve-outs that existed only to police the overlap"). Design README:1307 ("Fan-out is owned somewhere | Convention → **Refused at load** … the routing fact and the routing file are the same place").

**Blast radius.** AP-110's Fix cites §18 (being edited) and §26 (enumeration being cut). `patterns/README.md` names AP-110 as a trap; `anti-patterns.md:1615` (AP-125 example) quotes "`concurrency` … parallel fan-out via [spawn-concurrent]" as its illustration and goes stale with the input. `AP-137 unowned-harness-capability` is the neighbouring entry an author reaches instead once no operation owns concurrent dispatch.

**If left alone.** The catalogue keeps a prohibition whose only job was separating two homes for one capability, after one of them is retired — and its Detect keeps naming the retired home as the owner, so applying the entry moves an author away from the construct that works.

## KEEP — workflows/workflow-design/resources/anti-patterns.md — AP-138 `output-without-destination`

**What it does today.** For each `### <id>` under a technique's `## Outputs`, requires the auditor to name where the value lands: an `#### artifact` on the entry; a step binding, output remap, gate, `validate` target, or same-named input reachable from a workflow that can bind the op; or a `{id}` interpolation in the binding activity's message or checkpoint text. An entry with none is flagged.

**Why the fan takes it.** It does not — and that is the problem. It survives intact and starts firing on correct instance fans. A fanned activity's outputs land in the branch container, and the design's positive rule is that the meeting point hands the container **whole** to the ordered gather and "does not author an index at all". So for every output of an instance-fanned activity's techniques there is no step binding, no same-named input and no interpolation naming it: the destination is a container the auditor's list does not recognise. The mechanised twin is handled — stage 4's acceptance requires zero `activity-variables` findings on a correct fan of each form — but this entry is the human audit test and its Do-not-flag list has no arm for a value gathered through a branch container.

**Evidence.** anti-patterns.md:1817 (Detect), :1819 (Do-not-flag: three arms, none covering a branch container), :1821 (Fix, which would tell the author to delete a live declaration). Design README:513 ("A join therefore gathers the container and does not author an index at all"), :1345, :1862 (N7 `a-join-gathers-the-container-not-an-index`), :1825 (G3 carries the mechanised member-grain check). delivery-plan.md:148 ("One correct fan of each form, with a gather-bound meeting point, produces **zero** findings") — for the guard, with no matching catalogue edit named in any stage.

**Blast radius.** Its stated inverse `technique-outputs-declared` and its sibling `declared-input-never-read` (whose Do-not-flag defers to this entry) share the model. Every fanned activity's technique files are the exposed surface — the first adopter's per-submodule scan activity in `cicd-pipeline-security-audit/` at stage 7.

**If left alone.** The catalogue entry an auditor applies to the first fanned activity tells them every one of its declared outputs is dead weight and should be deleted along with the variable that shadowed it. The Fix is destructive and the finding is false, and no stage's guard obligations reach it because the check that mechanises the same concern was taught the construct and the entry was not.

## KEEP — workflows/workflow-design/resources/anti-patterns.md — AP-128 `unproduced-value-read`

**What it does today.** Traces every reader of a variable whose sole producer sits behind a gate and flags a reader reachable on a path where the producer is skipped and the variable declares no `defaultValue`.

**Why the fan takes it.** It does not, and it will fire on a correct fan for a reason the entry cannot see. A fanned activity declares the fan's parameter among the names it needs its workflow to supply, and nothing in the workflow writes it: it arrives as a server-computed projection on the load response, and the design refuses to declare it on the workflow file on purpose, "because that list is the set the guard treats as workflow-owned — skipped by the unwritten-read check and seeded into the availability lattice — so declaring it there would silently satisfy a read of the parameter anywhere in the workflow". An auditor applying AP-128 finds a read with no producer on any path. The delivery plan concedes the mechanised twin in the same words — "the fanned activity's own declared input for the parameter has no producer and reads as an orphan input" — and fixes it by teaching `binding-fidelity` two producibles, with no corresponding catalogue arm named in any stage.

**Evidence.** anti-patterns.md:1697 (Detect), :1699 (Do-not-flag: `defaultValue` seeded at session creation, readers gated as their producer, checkpoint effects — none covering a server projection). Design README:381 (why the parameter is not a workflow variable), :1137 (the projection is the third member of the set that already includes the artifact prefix and the routing block), :1332 (G8). delivery-plan.md:47-49 (the two producibles), :152 ("The fan's parameter read by a non-branch activity is reported once, with the fan-specific detail string; the branch's own read of it is **not**").

**Blast radius.** Shares its model with `unowned-harness-capability` and `output-without-destination`; the guard side is `check-binding-fidelity.ts` and `check-activity-variables.ts`. Exposed at the first fanned activity, and at both live token-templated artifact declarations whose names interpolate the parameter.

**If left alone.** A correct fan produces a hand-audit finding on the one declaration the design is most emphatic about — and the entry's Fix ("add the complementary producer arm", "do not substitute a `defaultValue`") would push an author toward declaring the parameter on the workflow file, which is the exact move the design says silently satisfies a read of it anywhere in the workflow.

## DEPRECATE — workflows/meta/techniques/variable-binding.md — `## Rules` → `outputs-by-name-and-path`

**What it does today.** "Downstream `when`/`condition`/`transition` reference an operation's output by its declared name or a dotted path into it (`validation_results.validation_passed`) — never via a redundant flattened flag or a prose glue step that only re-expresses a field. A nested-object output lands whole and resolves by path directly."

**Why the fan takes it.** For a fanned activity the declared name stops landing. The branch's whole reported map is wrapped under a key derived from its activity id, server-side, so the bare member is written by nothing and a read of it is reported: "once the write side is re-keyed, the bare member is written by nothing", and "a read that omits the index" is a second finding. So an author who follows this rule as written, on an activity the graph fans, authors exactly what the guard flags. The rule remains correct for every un-fanned activity, which makes it two prescriptions over one field with nothing ordering them.

**Evidence.** variable-binding.md:33-35. Design README:1302 ("The bare name no longer lands"), :1823 (G1), :1826 (G4), :472 (the derivation: hyphens to underscores, `_outputs` appended), :515 ("there is no implicit way to read a member because the bare name no longer lands"). delivery-plan.md:20 and :51 list `variable-binding.md` in stage 4 for "the branch-scoped indexed landing, the derivation rule and the projection's place in the input precedence" — an addition, which leaves the unqualified rule standing beside it.

**Blast radius.** `variable-binding` is declared at `techniques.activity` across the corpus, so this rule reaches every activity; the sibling `outputs-mutate-state-only-via-sanctioned-path` and `signature-is-the-contract` are unaffected. `anti-patterns.md:1763` (AP-133 `overlapping-rule-scopes`) is the entry that catches the unordered pair.

**If left alone.** A universally-inherited rule prescribing the read form, true for one class of activity and false for the other, with neither entry declaring itself the exception — `overlapping-rule-scopes` by its own Detect: "name a single input in the intersection and read the entries alone — if the correct behaviour cannot be determined, the overlap is unresolved."

## KEEP — workflows/meta/techniques/agent-conduct.md — `## Rules` → `checkpoint-discipline`

**What it does today.** "Resolving a checkpoint is the meta-orchestrator's … A worker reaching a gate pauses there via [yield-checkpoint]; a workflow orchestrator passes the yield it receives upward unchanged."

**Why the fan takes it.** It does not go, but its reach now includes an actor that cannot act on it. `agent-conduct` is bundled to every agent, branch workers included, and a branch worker reaching a gate is refused — at load if the definition declares one (L9), at the tool boundary if it does not (T5: "a session holds one outstanding decision at a time … so a gate here stops your sibling branches"). The instruction "pauses there via yield-checkpoint" is, for that reader, a call that will be rejected. The catalogue's own test applies: for a surface reaching more than one actor, "the question is not which actor reads it but whether every actor it reaches has the standing to act on it; flag a clause only some of them can."

**Evidence.** agent-conduct.md:32-34. Design README:1734 (L9 with both message arms), :1793 (T5, and "Not redundant with L9: the tool admits a decision no definition mentions"), :1871 (fannability condition 1: "a gate is a deadlock rather than a delay"), :523 ("the orchestrator could not answer it anyway, since the turn does not resume until every branch has returned"). anti-patterns.md:1911 (AP-146 Detect). delivery-plan.md:65 ("the worker's gate rule" amended in stage 6); delivery-plan.md:211 names AP-146's check as the guard obligation for stage 6's new rules.

**Blast radius.** `workflow-engine/yield-checkpoint.md` holds the operation and two rules; `activity-worker.md`'s `follow-bundled-rules` pulls `agent-conduct` in; `present-checkpoint-to-user.md` and `respond-checkpoint.md` hold the orchestrator half; `orchestrator-conduct::no-ad-hoc-interaction` is the orchestrator-side sibling.

**If left alone.** A branch worker follows a universally-bundled instruction into a refusal, and the refusal message has to do the teaching the rule should have done. The design's own residual-risk table names the harder version of this — "a branch that cannot proceed without a decision has no conforming way to say so" — which is a reason to state the fan clause here rather than leave the reader to discover it.

## KEEP — workflows/workflow-design/resources/schema-construct-inventory.md — the "Repeat for each item / do until done" loop-step row, and workflows/workflow-design/resources/anti-patterns.md — AP-10 `loop-not-prose`

**What it does today.** Maps per-item repetition to a `kind: loop` step with `loopType` / `variable` / `over` / `condition` / `maxIterations` and a nested body, and flags per-item work written as prose instead.

**Why the fan takes it.** It does not, and the resemblance is close enough to matter. An instance fan borrows the loop's exact vocabulary — the collection and the item name — but the design draws the line hard: "it is not a loop step wearing a graph's clothes … a loop step *contains* its body as a list of steps, and a destination *names* an activity the graph already contains and already routes. There is no continuation test, no early exit, no nesting, no body." The cost arithmetic points the same way and favours the loop: "one worker looping N times pays a single delivery, because a loop body's technique is bundled once and reused every pass — so an instance fan's premium is the activity's whole payload N−1 times over … Per unit of work an instance fan is therefore the more expensive of the two forms by a wide margin." The loop is the cheaper construct and the only one with a continuation test, so it keeps every case where the units are small, ordered, or dependent.

**Evidence.** schema-construct-inventory.md:47 (loop row), :48 (exit + graph row). anti-patterns.md:198-206 (AP-10, including the do-not-flag arm for per-item work inside a technique Protocol). Design README:387 (not a loop step wearing a graph's clothes), :1459 (the per-unit arithmetic), :1394-1412 (the two-column cost diagram). delivery-plan.md carries no loop-row edit in any stage — correctly.

**Blast radius.** `check-loop-shape.ts` guards the construct; `scatter-gather`'s sequential mode is the strategy technique over it; `AP-38 no-duplicate-technique-steps` arm (b) routes unrolled iteration to a `forEach`. None of these changes.

**If left alone.** Nothing. It is listed because it is the construct most likely to be read as superseded — the fan takes its vocabulary and none of its job — and because the inventory's Graph row directly above it is being amended for the destination union, so an editor working that table will be one row away from a construct that must not move.

