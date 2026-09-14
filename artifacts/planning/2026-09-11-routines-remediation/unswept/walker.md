# The walker, and the routine-level entry that has no entry point

> Item 11c · a surface no record in either planning folder sweeps · measured at server `fe5f5f78`
> and corpus `e9d26007`, 23 server and 28 corpus commits past the completeness pass's `ee95e4cd` /
> `a4a5d88b`

The repository owns a mechanical worker. It connects a real client to a real server over an in-memory
transport, opens a session on a workflow, and then drives that workflow from its first activity to
its last: at each activity it reads the definition the server delivers, runs the steps in order,
answers every decision point it meets by asking a policy which option to take, accumulates the
variable effects, works out which exit the activity took, and reads the next destination out of the
workflow's graph. There is no language model in it, so the same corpus produces the same walk every
time. That worker is `tests/e2e/walker.ts`, 1,051 lines, and its `enumeratePaths` entry
(`tests/e2e/walker.ts:958`) is what the repository uses to answer a question no guard can answer from
a file: *is every decision option the corpus declares actually taken by something?*

The routines proposal promises that worker a second way in. At
[README:1198-1200](../../2026-09-03-routines/README.md): "The walker gains a routine-level entry: it
walks a routine's steps against a variable set seeded from its declared inputs, so every option of
every gate inside it is exercised once rather than only through whichever host activities a walk
happens to reach." The same promise stands at four further places — as a **Detected** guarantee in
the enforcement table (README:627), as the `W->>R: walk the steps, seeded from the declared inputs`
arrow in the check-a-routine-on-its-own diagram (README:719-720), as a stage 4 acceptance criterion
(README:877), and at stage 7, where a technique-parameter routine is graded by walking it per
reference site (README:923-924).

The completeness pass established that the entry has no entry point. This document establishes four
things it did not: what the walk actually needs from its subject and which of those a routine can
supply; how much of the walker is about reaching an activity rather than about exercising a gate;
what the criterion's subject population actually is, measured across every routine the plan creates;
and what the three ways out cost.

**The measurement that settles the priority: across stages 5, 6, 7 and 8 — every migration the plan
names — the routine-level entry has two gates to exercise, and they are both in one routine.** The
convergence loop stage 6 converges declares no checkpoint. The three `prism` per-unit passes stage 7
converges declare no checkpoint. The fan-out run stage 8 converges declares no checkpoint. The whole
subject of a second walker is `assumption-reconciliation`'s batch gate and its per-item gate: 2
gates, 6 options.

Two coupled facts sit underneath, and both run the other way — they are reasons the existing
machinery already does more of this job than the proposal credits it with, and reasons a migration
breaks something if nobody edits a pinned file.

---

## One: what the walk needs from its subject

A walk is not a reader of definitions. Every fact it uses arrives through a tool call against a live
server. There are eight call sites in the file, naming eight distinct tools:

| Line | Tool | What the walk takes from it |
|---|---|---|
| `walker.ts:690` | `start_session` | `session_index`, `planning_slug` |
| `walker.ts:699` | `get_workflow` | `variables[]` with defaults, `activities[]`, `graph`, `initialActivity` |
| `walker.ts:408` | `next_activity` | the transition, and the branch list a fan opens |
| `walker.ts:365` | `get_activity` | the `ActivityDef`, the unresolved-operation list, the bundled-step list |
| `walker.ts:540` | `get_technique` | nothing but the server-side record that the step's technique was fetched |
| `walker.ts:650` | `yield_checkpoint` | the gate's active state, or a replayed answer |
| `walker.ts:666` | `respond_checkpoint` | the chosen option's effect |
| `walker.ts:670` | `resume_checkpoint` | the resumption |

Seven of the eight are keyed on a `session_index`, and exactly one call issues one. That call takes a
workflow id: `arguments: { workflow_id: workflowId, agent_id: 'e2e-walker' }` at `walker.ts:692`.
Every downstream handler then reads the workflow from the session rather than from its own arguments
— `const workflow_id = state.workflowId;` appears at `src/tools/workflow-tools.ts:614`, `:969`,
`:1418`, `:2050` and `:2311`, once per tool. So the workflow id is not one argument among many. It is
the root of the whole tree of calls, and the session is the only thing that carries it forward.

**The refusal is at the first act, and it is measured rather than inferred.** Driving the harness
directly with a routine-shaped name:

```
start_session({ workflow_id: 'assumption-reconciliation' })
  → isError: true
  → "Workflow not found: assumption-reconciliation"
```

against the control `workflow_id: 'work-package'`, which returns the workflow block. The refusal
comes from `src/tools/resource-tools.ts:482`, `if (!wfPreLoad.success) throw wfPreLoad.error;`, where
`wfPreLoad` is the `loadWorkflow` at `:319` and the error is `WorkflowNotFoundError`
(`src/errors.ts:1-2`). Worth noting for anyone who reads the refusal as a cheap guard: it fires
*after* the session record is built — `state.sessionIndex` is live at `:474-479`, where the trace
store initialises the session — so the load failure is a late rejection of a session the server has
already created, not a name check at the door.

Past the session, everything reads an activity. `ActivityDef` at `walker.ts:86-94` requires `id` and
carries `steps`, `exits`, `operations`, `techniques`, `artifactPrefix` and `artifacts`. The exit
machinery is the largest consumer: `pickExit` (`:253-267`) needs both the activity's `exits` and the
workflow's `graph[act.id]`; `predicateExits` (`:304-306`) needs an exit carrying a `when` or an
`isDefault`; `destinationVisits` (`:276-284`) needs a destination; `advanceToUnvisited`
(`:315-329`) needs a bound exit leading somewhere unvisited. The walk ends when a destination is the
terminal sentinel (`:906`) and reports a status read from the session file on disk (`:916-920`).

---

## Two: which of those a routine can supply, and which it cannot

A routine declares inputs, outputs, internals and steps
([README:217-275](../../2026-09-03-routines/README.md)). It is forbidden to take a place in the graph
— "not a transition destination, never a workflow's first or last node, and it declares no outcome"
(README:746-748) — and forbidden to own an artifact prefix, because "prefixes are computed from an
activity's filename position and a routine has none" (README:755-756).

| What the walk needs | Where it comes from today | Can a routine supply it? |
|---|---|---|
| A workflow id for `start_session` | the caller | **No.** A routine is not a workflow, and the load refuses by name |
| An initial activity | `wf.initialActivity` (`walker.ts:711`) | **No.** A routine is never a workflow's first node |
| A graph binding exits to destinations | `wf.graph` (`walker.ts:707`) | **No.** A routine declares no exits and no outcome |
| A terminal destination to stop at | `TERMINAL_SENTINEL` (`walker.ts:906`) | **No.** Same reason |
| An initial variable bag | `wf.variables[].defaultValue` (`walker.ts:237-246`) | **Yes.** Declared inputs with defaults are the same shape |
| An ordered step list | `act.steps` (`walker.ts:586`) | **Yes.** This is what a routine is |
| Gates in document order, loop bodies included | `activityCheckpointSteps` (`walker.ts:592-602`) | **Yes**, unchanged — see below |
| Per-step technique fetches | `get_technique` with a `session_index` (`walker.ts:540-543`) | **No.** Session-scoped |
| Gate resolution through the server | `yield`/`respond`/`resume` (`walker.ts:650-671`) | **No.** Session-scoped |
| Gate resolution locally | `opts.localCheckpoints` (`walker.ts:233`, applied at `:818-820`) | **Yes.** Needs no server at all |
| An artifact prefix and declared artifacts | `act.artifactPrefix`, `act.artifacts` (`walker.ts:619-641`) | **No**, and by design |
| An activity id for the policy | `PolicyContext.activityId` (`walker.ts:97`) | **No.** A routine has no position |

Two rows deserve expanding, because they are the ones that decide the cost.

**The gate collector already works on a routine body.** `activityCheckpointSteps` recurses on any
step that carries a nested `steps` list — `if (s.steps) rec(s.steps);` at `walker.ts:597` — rather
than on the loop kind specifically. Driving it with a synthetic tree whose outer step carries
`kind: 'routine'` and a nested checkpoint returns that checkpoint. So the function that enumerates a
subject's gates needs no change for a routine, materialised or not.

**The step executor does not.** `executeActivitySteps`'s inner `walk` descends only on
`step.kind === 'loop'` (`walker.ts:568`); any other compound step falls through to `:578-584` and is
recorded as an executed leaf, its body never entered. So the two walker modes disagree about an
unrecognised compound kind: graph mode collects its nested gates, robot mode treats it as a leaf.
Neither says so.

**The policy cannot be reused as written.** `PolicyContext` requires `activityId` (`walker.ts:97`),
and the convergence simulation that stands in for an agent is a map keyed on activity id —
`simulate(ctx) { return simulation[ctx.activityId]; }` at `tests/e2e/policies.ts:57-59`, over four
entries at `:23-30`. One of those four is `'assumptions-review': { …, has_deferred_assumptions:
false }` (`policies.ts:25`) — and `has_deferred_assumptions` is one of the three outputs the
proposal's worked routine declares (README:231-233). The stand-in for the agent is keyed on a host
activity id that a routine-level walk does not have, for a variable the routine owns.

**The seed is available, though.** `Policy.initialVariables` (`walker.ts:104-105`) seeds the bag
before the walk begins, and `reviewModePolicy` already uses it (`policies.ts:99`). Turning a
routine's declared inputs and their defaults into that map is the same ten lines as
`defaultVariables` (`walker.ts:237-246`).

---

## Three: how much of the walker is about reaching an activity

Splitting the file's function bodies by what they need:

| Group | Lines | Functions |
|---|---|---|
| Works on a step tree and a variable bag, unchanged | **46** | `satisfyWhen` (`:332-341`), `interpolate` (`:348-353`), `evaluateWhen` (`:450-452`), `activityDecidedVariables` (`:455-470`), `activityCheckpointSteps` (`:592-602`) |
| Needs a session, a graph or an activity | **543** | `defaultVariables`, `pickExit`, `destinationVisits`, `pickTargets`, `pickNext`, `predicateExits`, `advanceToUnvisited`, `artifactNames`, `getActivity`, `transition`, `seedFanCollections`, `writeArtifactStubs`, `resolveCheckpoint`, `walk` (`:681-927`, 247 lines), `enumeratePaths` (`:958-1051`, 94 lines) |
| Shape carries over, parameters do not | **102** | `executeActivitySteps` (`:487-588`), which takes `client` and `sessionIndex` and calls `get_technique` and the gate cycle |

A further 219 lines are the fourteen interfaces, of which `WalkResult` (`:158-177`) has 13 fields and
`WalkStep` (`:126-156`) has 12. Nine of `WalkResult`'s 13 have no routine-side meaning — `workflowId`,
`sessionIndex`, `planningSlug`, `initialActivity`, `declaredActivities`, `orchestratorUnresolved`,
`path`, `finalStatus`, `gateRefetches` — and nine of `WalkStep`'s 12 likewise: `activityId`,
`artifacts`, `artifactsWritten`, `manifestStatus`, `orphanCheckpoints`, `unresolved`,
`declaredOperations`, `lazyGates`, `nextActivity`.

So the ratio is roughly twelve to one: for every line that exercises a gate against a bag, twelve
lines exist to get the walk to the activity holding it and to record what happened on the way. **That
is the size of what a routine-level entry does not need, and it is also the reason the entry is not
an option on the existing walk.** `walk()` is 247 lines with a single `while (current)` loop whose
every iteration transitions, fetches and routes; there is no seam in it where a subject with no graph
could enter.

---

## Four: the population the criterion is aimed at

The criterion promises that every option of every gate inside a shared run is exercised once. Measured
against every routine the plan actually creates:

| Stage | The routine it creates | Gates in its body | Options |
|---|---|---|---|
| 5 | `assumption-reconciliation` — announce, gate, record, interview per item | **2** | **6** |
| 6 | the convergence loop, and the challenge pass it iterates | **0** | 0 |
| 7 | the `prism` per-unit pass | **0** | 0 |
| 8 | the four-step fan-out dispatch run | **0** | 0 |

Stage 6's body is the `assumption-convergence` loop, seven copies of which sit in `work-package`; the
one at `corpus/work-package/activities/04-research.yaml:137-168` is three technique steps —
`reconcile-assumptions`, `challenge-assumptions`, `combine-assumption-challenges` — inside a
`doWhile` whose continuation test reads `has_resolvable_assumptions`. No checkpoint. Stage 7's three
`prism` per-unit passes declare no checkpoint between them: `grep -c "kind: checkpoint"` over the
thirteen `prism` activity files returns 1, and that one is `00-select-mode.yaml`, which is not a
per-unit pass. Stage 8 is the same: of the three activities left under `meta/activities/patterns/`,
`05-lead-researcher.yaml` — a named reference site — and `02-supervisor.yaml` — the occurrence the
sweep says stage 8 now needs — declare zero checkpoints between them, and the single checkpoint in
`03-plan-and-execute.yaml` is `plan-confirmed`, which precedes the dispatch run rather than sitting
inside it.

So the entire subject of the promised second walker is one routine's two gates. What those two gates
are, measured through the loader:

```
assumptions-review/residual-assumption-batch                   3 options   pinned 3
assumptions-review/assumption-decision#{current_assumption.id} 3 options   pinned 0
implement/implementation-assumption-interview                  3 options   pinned 3
implement/implementation-assumption-decision#{…}               3 options   pinned 0
implementation-analysis/analysis-assumption-interview          3 options   pinned 3
implementation-analysis/analysis-assumption-decision#{…}       3 options   pinned 0
research/research-assumption-interview                         3 options   pinned 3
research/research-assumption-decision#{…}                      3 options   pinned 0
                                                              ──────────
                                                              24 option keys, 12 pinned
```

Eight gates at four hosts today, twenty-four option keys. Twelve of them — the four batch gates — are
recorded in the corpus's uncovered-option file as options no walk reaches. The other twelve, the
per-item gates inside each host's `forEach`, are reached today.

**And the entry would genuinely buy those twelve.** Each batch gate carries a two-conjunct structured
condition — `is_review_mode != true` and `has_open_assumptions == true` — and the walker has no
machinery that satisfies a structured condition. `satisfyWhen` (`walker.ts:331-341`) parses a `when`
expression and sets a single comparison, leaving compound expressions alone by its own doc comment;
`advanceToUnvisited` (`:315-329`) skips a gate it cannot satisfy; graph mode evaluates a structured
`condition` at `:814` and never attempts to make it hold. That is why those twelve are pinned, and it
is a property of the walker rather than of the agent, whatever the file's stated reason says.

The proposal's worked conversion moves that condition out of the body: the routine's batch gate at
README:248-251 carries `message` and `options` and no condition, while the reference site at
README:291 carries `when: has_open_assumptions == true`. With the condition at the site, a
routine-level walk seeded with `gate_message` and `decision_space` meets an unconditional three-option
gate and can take all three. The loop behind it is gated on `needs_individual_interview == true`
(README:262), a single comparison that either `satisfyWhen` sets or the batch gate's
`interview-individually` option sets as its effect — and the walk makes one pass through a `forEach`
body regardless of whether its collection has anything in it (`walker.ts:568-577` tests only a
`while` loop's continuation), so the per-item gate is reached even though `open_assumptions` is a
name the routine's signature does not declare.

**So the criterion is satisfiable and its value is exactly 3 option keys' worth of coverage the
corpus does not have today, retiring 12 of the 113 pinned entries.** That is a real gain, and it is
the whole gain. It is also contingent on stage 2's unmade dismissibility decision: keep the site
condition inside the routine body and the three options stay unreachable for the same structural
reason they are unreachable now.

---

## Five: the three ways to satisfy it, costed

### A — a second entry point

Write a routine walker: load a routine, seed a bag from its declared inputs, walk its step tree, fork
at every un-taken option.

*What exists already.* The 46 lines in the first group above, unchanged — in particular
`activityCheckpointSteps`, which already descends a routine body. `evaluateCondition` and
`evaluateWhenExpression` come from `src/` (`walker.ts:19-20`), so the routine walker imports the same
dialect the server uses.

*What has to be written.* A seed builder (~10 lines, the shape of `defaultVariables` at `:237-246`); a
gate loop with local effect application (~15 lines, the shape of `:813-826`); an option fork with the
recorder-and-queue structure of `enumeratePaths` (`:1003-1047`, 45 lines) minus its transition half;
a result type, since 9 of `WalkResult`'s 13 fields and 9 of `WalkStep`'s 12 have no meaning here; and
a policy context that does not require an activity id. Call it 70 to 90 lines plus a test file.

*What is not budgeted anywhere.* A standalone routine load. Stage 3 gives `routines/` "its own
discovery pass and its own generated JSON schema" (README:846-848), but the materialisation it
specifies runs inside an activity load (the sequence diagram at README:672-686 begins
`L->>A: parse, validate, resolve step ids`). A routine that references another routine
(README:318) has to be whole before it can be walked, and nothing returns a whole routine on its own.

*The decision it forces.* A covered branch is keyed
`checkpoint:${activityId}:${checkpointId}=${optionId}` (`tests/e2e/coverage.ts:21-23`), and a
routine-level branch has no activity id. Whatever is put there, the key will not be in the
denominator, which is built only from loaded workflows' activities (`coverage.ts:66-97`). The
coverage test asserts `c.unexpected` is empty — "walk covered an option no definition declares",
`tests/e2e/option-coverage.test.ts:175` — so folding routine-level coverage into the existing
accounting fails that assertion on day one. Keeping it separate means the entry grades nothing the
ratchet records.

**Cost: ~80 lines of engine code, one unbudgeted loader entry, one new key namespace, and a decision
about how the two coverage populations relate. Buys 3 option keys.**

### B — a synthetic host activity wrapping the routine

Build a fixture workflow whose single activity's only step is a `kind: routine` reference, and walk it
with the walker that exists.

*What exists already.* All of it. `walk(harness, id, defaultPolicy, { mode: 'graph', localCheckpoints:
true })` is the working template at `tests/e2e/fan-walk.test.ts:36`: graph mode skips step execution
and technique fetches, and `localCheckpoints` applies each option's declared effect from the
definition instead of the server's yield-respond-resume cycle, which is what lets a no-agent walk
drive options it could not drive through the server (`walker.ts:226-233`). The routine's inputs seed
through `Policy.initialVariables` (`:104-105`), as `reviewModePolicy` already does.

*What has to be built.* Per routine: a `workflow.yaml` with an `initialActivity`, a graph binding one
exit to the terminal sentinel, and the routine's inputs as variables with defaults; one activity file
carrying an `artifactPrefix`, the `kind: routine` step and a `done` exit; and resolution for whatever
techniques the body binds — `review-assumptions::record` and `analyse-challenge::challenge` are
qualified references that resolve against their source workflow, so the fixture either borrows
`work-package` or stubs them. The measured precedent is the fan work's own fixture root:
`tests/fixtures/fan-corpus` is 79 files across 17 workflow trees and 480K, driven by a 185-line test.
The repository already carries 28 synthetic workflow trees and 68 fixture activity files under
`tests/`, and zero `routines/` directories.

*The decision it forces.* The same one. The synthetic host's id becomes the activity id in the branch
key, and that key is not in the corpus denominator either.

**Cost: zero engine lines, two to four fixture files per routine, one new key namespace, the same
decision. Buys the same 3 option keys, and additionally proves the materialisation end to end through
the real server rather than through a second implementation of the walk.**

### C — change the criterion

State what the existing machinery does, which is more than the proposal credits it with.

The coverage denominator is built by loading each workflow the way the server does —
`loadWorkflow(root, workflowId)` at `coverage.ts:70`, then `activityCheckpoints(activity)` at `:77`
over `loaded.value.activities`. Materialisation runs inside that load. **So the moment stage 3 lands,
a materialised routine's gates are in the denominator already, at every reference site, under their
prefixed identifiers, with no change to `coverage.ts` at all.** The existing walk then grades them
exactly as it grades any other gate: reached, or listed with a reason.

What that does not give is the word "once". Coverage stays per reference site — 24 keys for the
assumption run rather than 6 — and a routine whose reference sites no walk reaches stays ungraded.
Those are the two things the criterion promises and this does not.

*Edits.* Five sites: README:627 (the enforcement row's **Detected** level and its justification),
README:719-720 (the diagram arrow), README:877 (stage 4), README:923-924 (stage 7), README:1196-1200
(the section). Note that stage 7's wording — "walks such a routine per reference site instead" — is
already a description of what the coverage walk does, so stage 7's walker criterion is met by the
machinery that exists as soon as materialisation lands.

*What it gives up.* The row at README:625, "A shared run is checkable with no host workflow", stays
true for the contract derivation and stops being true for gate coverage. Say so rather than leaving
the reader to infer that one row covers both.

**Cost: five prose edits, zero code, zero fixtures. Buys nothing new, and stops the plan claiming a
level it cannot reach.**

### Recommendation

Take C now, because it costs nothing and the stated level is wrong today whatever else is decided.
Hold A entirely: 80 lines of second walker, an unbudgeted loader entry and a new key namespace to
grade 3 options in one routine is the wrong trade, and three of the four routines the plan creates
have no gate for it to grade. If the twelve pinned entries are judged worth buying, take B — it is
the same purchase with no engine code, and its fixture is the artefact stage 5 wants anyway for
proving materialisation through the server.

Whichever is taken, stage 4's own table needs correcting: the walker entry appears in stage 4's
acceptance criteria (README:877) and not in the stage table's "Lands" column (README:772), which
names only the contract boundary, the signature check and placement.

---

## Six: what the loader-derived denominator does to the pinned file

The uncovered-option file is not an inventory of coverage. It records the options **no walk reaches**,
each in a group carrying the reason, and it is allowed only to shrink: an unlisted uncovered option
fails, a listed option that becomes covered fails
(`tests/e2e/option-coverage.test.ts:203-212`). Measured at this tree it holds **113 keys in three
groups of 90, 16 and 7**, and **zero** of the 113 name a checkpoint the corpus no longer declares —
the file is clean right now.

Against a denominator of **283 declared options corpus-wide** (18 workflows through the loader), of
which **276** belong to the 15 workflows the roster walks, the seven-key difference is exactly group
three, "declared only by remediate-vuln". So 170 of 283 declared options are taken by some walk.

**Twelve of the 113 name gates stage 5 renames**, three options at each of
`research:research-assumption-interview`, `implementation-analysis:analysis-assumption-interview`,
`implement:implementation-assumption-interview` and `assumptions-review:residual-assumption-batch`.
Every identifier inside a materialised routine takes the reference step's identifier as a prefix,
separated by a full stop, and the proposal's own worked example spells the result:
`reconcile-assumptions.batch-gate` and, inside the loop,
`reconcile-assumptions.interview.decision#{current_assumption.id}` (README:539-542). So all twelve
keys change. Stage 5 therefore fails the walk twice over the same twelve options: as twelve stale
entries naming checkpoints no definition declares, and as twelve newly unreached keys under the
prefixed names.

**One of those two failures fires on the pull request that causes it, and the other does not.** The
stale computation is `const stale = SCOPE.length ? [] : allowed.filter((k) => !declaredSet.has(k));`
at `tests/e2e/option-coverage.test.ts:192` — deliberately inert on a scoped run, with its reasoning
stated at `:189-191`, because a scoped run cannot tell a renamed option from one merely outside its
scope. A stage 5 corpus change touches `work-package` activity files, which
`classifyChange` (`scripts/coverage-scope.ts:88`) resolves to a non-empty scope. So the run is
scoped, the stale check is inert, and the twelve orphans pass. The newly-unreached check at
`:187` and `:203-207` is not scoped away and does fail — which is the useful half.

**Three things have moved here since the completeness pass measured them, and all three make the
orphan harder to find.**

*The pinned file and the roster now live on the corpus branch.* They were `tests/e2e/option-coverage.json`
and `tests/e2e/walked-workflows.ts` in the engine tree; three commits on 2026-09-11 — `89fd934b`
"Remove this-corpus ledgers and walk artifacts from the engine tree", `8051f047` and `b21fd0d0` —
moved them to `walks/option-coverage.json` and `walks/roster.json` of the corpus. The test reads
`join(corpusRoot(), 'walks', 'option-coverage.json')` (`option-coverage.test.ts:84-86`) and the roster
arrives through `WF_WALKED`. **This is good news for stage 5**: the migration and the twelve entries
it orphans are now on the same branch, so one commit can rename the gates and rewrite the entries. It
was not possible before.

*The coverage job moved with them, and lost a trigger.* `.github/workflows/coverage.yml` no longer
exists in the engine tree; it is on the corpus branch, running `on: pull_request` and
`workflow_dispatch` — **no push trigger at all**. It walks the full roster when the engine's
`tests/e2e/walker.ts`, `policies.ts` or `coverage.ts` changed (`coverage.yml:78-87`), or when
`walks/roster.json` changed (`:89-93`). There is no clause for `walks/option-coverage.json`. The
completeness pass recorded that the orphans "surface on the next push to main"; at this tree there is
no push to surface them on. They surface on the next pull request that changes the roster or the
borrowed walker, or on a manual dispatch, and not before.

*The corpus stamp no longer fires on that job.* `expectStampFresh` returns immediately when
`WF_CORPUS_SUBJECT === 'checkout'` (`tests/stamp-freshness.ts:14`), and `coverage.yml:31` sets exactly
that. So the one assertion the completeness pass identified as still firing on a stage 5 corpus run
is now inert there too.

*And a routine file still moves coverage that nothing walks.* `classifyChange`
(`scripts/coverage-scope.ts:77-91`) recognises two path shapes: a `workflow.yaml`/`workflow.yml` at
`:84`, and a `*.ya?ml` under an `activities` segment at `:88`. A change to `<wf>/routines/<name>.yaml`
matches neither, the scope comes out empty, `coverage.yml:96` writes `scope=none`, and the walk step
is skipped by `if: … steps.scope.outputs.scope != 'none'` at `:99`. A change to a shared routine's gate
options is graded by nothing, while its steps are materialised into every referring activity in every
workflow that holds one. That reproduces exactly as the completeness pass found it, at new line
numbers.

**What stage 5 owes, stated as work rather than as a hazard.** One commit that renames the four gates
and rewrites the twelve entries in `walks/option-coverage.json` under their prefixed names, keeping
them in group one with the reason unchanged — the routine does not change why an agent-produced value
gates them. The reference step ids the new keys depend on are not fixed anywhere: the proposal writes
`reconcile-assumptions` at README:285 and `reconcile-research` / `reconcile-implementation` at
README:692-693, and stage 5's criteria name none of the four. That is one decision the disposition
record can settle in a line.

---

## Seven: the four-kind union in the walker's own types

`StepDef.kind` at `tests/e2e/walker.ts:68` is `'technique' | 'action' | 'checkpoint' | 'loop'`, with a
doc comment restating the four at `:67`. It is a hand-written copy of the union whose source is the
Zod discriminated union at `src/schema/activity.schema.ts:167-172`, and `walker.ts` never imports that
source — `StepDef` is structurally independent of `Step`.

Sweeping the tree for lines naming all four kinds together, excluding `node_modules`, `dist`,
`.worktrees` and the planning submodule, finds **20 lines across 10 files**: eight in
`schemas/README.md`, five in `site/` across three pages (`api/schemas.html:77`, `:91`, `:284`,
`specs/workflows.html:308`, `guide/definitions.html:167`), one each in `schemas/activity.schema.json:4`,
`scripts/generate-schemas.ts:29`, `src/resources/schema-resources.ts:7`,
`src/schema/activity.schema.ts:296` and `tests/validation.test.ts:509`, and two in `walker.ts` — the
doc comment and the type. That figure is a wider net than the folder's sixteen: it reaches `site/`
and a test comment, which the earlier passes scoped out. Take it as an independent count of the same
population rather than a correction to it.

Of the twenty, exactly one is a closed TypeScript union restating the source, and it is the one the
compiler never sees. `tsconfig.json` sets `"include": ["src/**/*"]` with `"rootDir": "./src"`, and
`tsc --noEmit --listFiles` puts **60 files in the program, all under `src/`, and zero under `tests/`**.
`npm run typecheck` is `tsc --noEmit` (`package.json:24`) and is the only typecheck step in
`.github/workflows/verify.yml`. Vitest transpiles through esbuild without checking types. So adding a
fifth member to the Zod union produces no error in `walker.ts`, and adding a fifth arm to
`walker.ts`'s own switch would not be caught as unreachable either.

**What the unenforced copy actually costs, measured.** The two walker modes descend an unrecognised
compound step differently. Feeding `activityCheckpointSteps` a tree whose outer step carries
`kind: 'routine'` and a nested checkpoint returns the nested checkpoint — graph mode finds it, because
`:597` recurses on the presence of `steps` rather than on the kind. `executeActivitySteps`'s `walk`
descends only at `:568` on `kind === 'loop'`, so robot mode records the outer step as an executed leaf
and never enters the body. One mode over-reaches, the other under-reaches, and nothing reports either.

The exposure is conditional, and saying so is the honest reading: a `kind: routine` step "exists
between parsing and materialisation and nowhere else" (README:430-431), so a walk against a
materialised corpus never meets one. The asymmetry bites where a fixture is authored raw, where
materialisation is being differentially tested (stage 3's criterion at README:859-862 runs both paths
over every activity), or at the next compound kind that is *not* materialised away.

**The smallest fix is a line, and it is not an exhaustiveness assertion.** Replace
`walker.ts:68`'s literal union with the schema's own type — `import type { Step } from
'../../src/schema/activity.schema.js'` and key `StepDef` on `Step['kind']`. The walker already imports
five modules from `src/` (`walker.ts:19-23`), so the dependency exists. That makes the copy follow the
source without needing `tests/` in the typecheck program at all. Widening `tsconfig.json`'s include to
cover `tests/` is the larger version of the same fix, and it is a separate decision with its own blast
radius — the repository has 100 test files and a `rootDir` of `./src` that a wider include would have
to give up.

Stage 3's own criterion at README:856 asks for "an exhaustiveness assertion over the step kinds
[that] fails to compile when a kind is added". Whatever that assertion is, it will live in `src/` and
be enforced, and this copy will still not be — so the criterion is satisfiable without this site being
fixed. Name it explicitly in the stage, or the one place a compiler could have caught the fifth kind
stays the one place it does not.

---

## Figures, and the ones that moved

Re-measured here, against the sweeps folder and the completeness pass:

| Figure | Recorded | Here | Why |
|---|---|---|---|
| `tests/e2e/walker.ts` | 1,045 lines | **1,051** | 23 server commits |
| Corpus workflows | 17 | **18** | `fan-conformance` |
| Coverage roster | 14 walked, 3 not | **15 walked, 3 not** | closes against 18 |
| Declared options | 285 by direct parse, 275/276 in stale comments | **283 corpus-wide, 276 over the walked roster** | through the loader, the denominator's own source |
| Pinned uncovered options | 113 in 3 groups | **113 in 3 groups of 90/16/7**, 0 of them orphaned today | reproduces |
| Pinned entries stage 5 renames | 12 | **12** | reproduces |
| Fixture trees / activity files | 23 / 59 | **28 / 68** under `tests/` | corpus and fixture movement |
| Four-kind enumeration sites | 11, then 15, then 16 | **20 lines in 10 files** | wider net, includes `site/` and a test comment |
| The pinned file's home | `tests/e2e/option-coverage.json` | **`walks/option-coverage.json`** on the corpus branch | `89fd934b`, `8051f047`, `b21fd0d0` |
| The coverage job's home | `.github/workflows/coverage.yml` in the engine tree | **the corpus branch**, `pull_request` and `workflow_dispatch` only | no push trigger, no expectation-file trigger |
| The stamp assertion on that job | fires | **inert** (`WF_CORPUS_SUBJECT: checkout`) | `tests/stamp-freshness.ts:14` |

One figure carried rather than re-measured: the coverage walk's wall clock, recorded at 1,269 seconds
with the roster in flight at once (`tests/e2e/option-coverage.test.ts:216`). Re-taking it costs
twenty-one minutes and nothing here turns on it. `tests/e2e/README.md:99` still says "~14 minutes, 14
workflows" against a roster of 15, which is a small stale statement on the walker's own documentation
surface — worth the same one-line edit as the rest.

---

## Commands that re-take these figures

```bash
cd /home/mike1/projects/dev/workflow-server
wc -l tests/e2e/walker.ts tests/e2e/coverage.ts tests/e2e/policies.ts
grep -n "client.callTool" tests/e2e/walker.ts
grep -n "kind?:" tests/e2e/walker.ts
npx tsc --noEmit --listFiles | grep -c "workflow-server/src/"
npx tsc --noEmit --listFiles | grep "workflow-server/tests/"
grep -n "include" tsconfig.json
grep -n "loadWorkflow\|activityCheckpoints\|optionKey" tests/e2e/coverage.ts
grep -n "SCOPE.length\|EXPECTED_PATH\|unexpected, " tests/e2e/option-coverage.test.ts
grep -n "classifyChange" -A 15 scripts/coverage-scope.ts
grep -n "WF_CORPUS_SUBJECT" tests/stamp-freshness.ts .worktrees/workflows/.github/workflows/coverage.yml
grep -c "kind: checkpoint" .worktrees/workflows/corpus/prism/activities/*.yaml
grep -c "kind: checkpoint" .worktrees/workflows/corpus/meta/activities/patterns/*.yaml
find tests -name workflow.yaml | wc -l
find tests -path "*/activities/*" -name "*.yaml" | wc -l
```

The option-coverage figures, the assumption-run table and the start_session refusal come from three
scripts run under `npx tsx`, each importing the repository's own modules so the numbers are the ones
the suite would see: `declaredOptions` and `declaredCheckpoints` from `tests/e2e/coverage.ts` over
`indexCorpus(corpusRoot()).workflows.keys()`; the same two filtered to the four assumption hosts and
compared against `walks/option-coverage.json`; and `createHarness()` from `tests/e2e/harness.ts`
calling `start_session` with `workflow_id: 'assumption-reconciliation'` against the control
`'work-package'`. They live in the session scratchpad rather than the repository, since none of them
is a check anything should run twice.

---

Measured against the [routines proposal](../../2026-09-03-routines/README.md) and the
[verified sweep outcome](../../2026-09-10-routines-sweeps/README.md), whose list of what nobody swept
names this surface. Companion to
[permutation-matrix.md](../permutation-matrix.md), which reaches the walker as a provocation site and
records G20 — the guarantee with no mechanism — from the other direction.
