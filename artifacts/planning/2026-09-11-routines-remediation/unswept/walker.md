# The walker, and the routine-level entry that has no entry point

> Item 11c · sweep of a surface no record in either planning folder reaches · measured at server
> `792f2cc5` and corpus `a4a5d88b`, one server commit past the completeness pass's `ee95e4cd`

The repository owns a mechanical worker. It connects a real MCP client to a real server over an
in-memory transport, opens a session on a workflow, and then drives that workflow from its first
activity to its last: at each activity it reads the definition the server delivers, executes the
steps in order, answers every decision point it meets by asking a policy which option to take,
accumulates the variable effects, works out which exit the activity took, and reads the next
destination out of the workflow's graph. It has no language model in it, so the same corpus produces
the same walk every time. That is the end-to-end walker, `tests/e2e/walker.ts`, 1,045 lines, and its
`enumeratePaths` entry is what the repository uses to answer a question no guard can answer from a
file: *is every decision option the corpus declares actually taken by something?*

The routines proposal promises that worker a second way in. README:1196-1200: "The walker gains a
routine-level entry: it walks a routine's steps against a variable set seeded from its declared
inputs, so every option of every gate inside it is exercised once rather than only through whichever
host activities a walk happens to reach." The same promise stands at four further places: as a
**Detected** guarantee in the enforcement table (README:627), as the `W->>R: walk the steps, seeded
from the declared inputs` arrow in the check-a-routine-on-its-own diagram (README:719-720), as a stage
4 acceptance criterion (README:877), and again at stage 7, where a technique-parameter routine is
graded by walking it per reference site (README:923-924).

**The entry has no entry point, and the criterion is aimed at a population of two gates.** The walk
takes a workflow id, and its first act is opening a session on it; a routine is not a workflow, so
the session is refused before the second act runs. That much the completeness pass established. What
this document adds is measured: what the walk actually needs from its subject, how much of the walk
is about getting to an activity rather than about exercising a gate, which of the three ways to
satisfy the criterion costs least, and — the reason this matters more than a single stage item — that
the mechanism the repository already has measures a routine's gates the moment materialisation lands,
because the coverage denominator is drawn through the real loader. The migration that renames those
gates changes that file in two directions at once, and the check that would notice is switched off on
exactly the run that causes it.

---

## One: what the walk needs from its subject

A walk is not a reader of definitions. Every fact it uses arrives through a tool call against a live
session, and the session is the thing a routine cannot have.

| The walk needs | Where it reads it | Can a routine supply it? |
|---|---|---|
| A workflow id a session can open | `walker.ts:689-693`, `start_session { workflow_id, agent_id }` | **No.** `resolveWorkflowPath` (`src/loaders/workflow-loader.ts:118-132`) accepts `<root>/<id>/workflow.yaml` or `<root>/<id>.yaml`; a routine lives at `<workflow>/routines/<name>.yaml` |
| A session index | `walker.ts:695`, minted by `start_session` | **No** — follows from the above, and seven of the walk's eight tool-call sites pass it (`:367`, `:402`, `:541`, `:649`, `:665`, `:669`, `:698`) |
| A declared variable set with defaults | `walker.ts:709` via `defaultVariables` (`:236-245`), reading `wf.variables` | **Partly.** A routine declares inputs, outputs and internals rather than workflow variables, and the seed the design names is the inputs alone |
| An initial activity | `walker.ts:710`, `wf.initialActivity` | **No.** Required by `WorkflowSchema` (`src/schema/workflow.schema.ts:174`); a routine is "never a workflow's first or last node" (README:746-748) |
| A graph binding each exit to a destination | `walker.ts:706`, `wf.graph`; read by `pickExit` (`:252-266`), `destinationVisits` (`:275-283`), `predicateExits` (`:303-305`) | **No.** A routine "is not a transition destination" and declares no outcome (README:746-748) |
| Exits on the activity | `walker.ts:253`, `act.exits` | **No.** A routine declares none |
| An artifact prefix and a planning folder | `walker.ts:707` and `:713-714`; used by `writeArtifactStubs` (`:618-640`) | **No.** "A routine has no position and therefore no prefix" (README:646); the planning slug comes back from `start_session` |
| A terminal sentinel to stop at | `walker.ts:900`, `TERMINAL_SENTINEL` | **No** — it is a graph destination |
| A session file to read the final status from | `walker.ts:910-913`, `session.json#status` | **No** — no session |
| Steps, with their gates, checkpoints and loop bodies | `walker.ts:553-585` (robot) and `:806-821` (graph) | **Yes.** This is the whole of what a routine has |

One row is worth reading twice. `walk()` spans `walker.ts:680-921` — 242 lines. The part that
exercises decision options is `:806-821`: **sixteen lines**, which collect the activity's checkpoint
steps, skip any whose `condition` is false against the bag, ask the policy or the enumerator for an
option, apply that option's effect, and record what was taken. The other 226 lines are session
plumbing, graph reading, transition bookkeeping, fan branch queues, artifact stubs and manifests —
all of it about *getting to* an activity.

And under `enumeratePaths`, even those sixteen lines are already definition-driven. It walks in
`mode: 'graph'` with `localCheckpoints: true` (`walker.ts:1017`), which means each option's effect is
read from the definition (`:812-814`) rather than through the `yield → respond → resume` cycle. So
the machinery that answers "was this option taken" needs no server at all; the machinery that answers
"did the walk arrive here" is the entire rest of the file.

That is the shape of the problem. A routine supplies the sixteen lines' worth of subject and none of
the 226 lines' worth.

---

## Two: where the attempt stops, measured

I ran it rather than reasoning about it. A throwaway script created the standard harness and called
`start_session` twice, once with a real workflow id and once with the id of the proposal's own worked
routine:

```
=== start_session(work-package) isError=false
  session_index: ZWI3QL | planning_slug: transition-6741e7f5-…
  get_workflow isError=false

=== start_session(assumption-reconciliation) isError=true
  session_index: undefined
   [{"type":"text","text":"Workflow not found: assumption-reconciliation"}]
```

The refusal comes from `src/tools/resource-tools.ts:395`, `if (!wfPreLoad.success) throw
wfPreLoad.error`, raising `WorkflowNotFoundError` (`src/errors.ts:1-2`). Two details of that line are
worth carrying:

- **The load is attempted early and the failure is surfaced late.** `loadWorkflow` runs at
  `resource-tools.ts:242`, and its failure is tolerated there — the version is recorded as `''` and
  the handler continues. The session folder is created and `writeSessionFile` runs at `:365`. Only
  then does `:395` throw. So an attempt to walk a routine through this entry point leaves a sealed
  session folder on disk and returns an error.
- **The walker's own error message would be wrong about it.** `walker.ts:693` reports
  `start_session(<id>) failed` with no server text, so the "not a workflow" cause is discarded at the
  boundary.

For completeness on the layer below: `get_workflow` reads the session's workflow id and loads it the
same way (`resource-tools.ts:651` via `loadWorkflowWithDiagnostics`), and `next_activity` resolves the
activity a call retires against the session frontier, refusing a name that is not in flight
(`src/tools/workflow-tools.ts:718-737`). There is no tool that delivers a routine body: the corpus
has no `routines/` directory at all, and `get_technique` serves composed technique content keyed on a
`step_id` inside the current activity (`walker.ts:539-541`).

**So the routine-level entry is a second walker.** Not a flag on this one, not a policy, not a mode
beside `'graph'` and `'robot'`. And the eleven places that import the walker say what a second entry
point has to avoid breaking: eight under `tests/e2e` (`all-workflows-walk`, `step-execution-walk`,
`worker-identity-walk`, `snapshot.test`, `snapshot.ts`, `option-coverage`, `fan-walk`, `policies`) and
**three under `scripts/`** — `scripts/run-3c.ts:15`, `scripts/smoke/smoke-orchestrator.ts:29` and
`scripts/run-token-benchmark.ts:397`, the last by dynamic import of the `.ts` file by path. The
walker is not test-only furniture; the token benchmark and the smoke orchestrator drive it.

---

## Three: what the criterion is actually about

Costing three ways to satisfy a criterion means first knowing what it buys. The criterion concerns
gates *inside* routines, so its population is the checkpoints that move into a routine across the
plan's nine stages. Measured through the real loader over all 18 corpus workflows
at `a4a5d88b`:

| The routine the plan names | Its gates | Option ids |
|---|---|---|
| Stage 5 · the assumption run (`assumption-reconciliation`, README:216-275) | 2 — the batch gate and the per-item decision | 3 + 3 = **6** |
| Stage 6 · `converge-assumptions` and `challenge-concerns` (re-derivation.md:110-206) | **0** — the bodies are technique, loop and routine steps only | 0 |
| Stage 7 · the three `prism` per-unit passes | **0** — `adversarial-pass`, `synthesis-pass` and `behavioral-synthesis-pass` are 2 steps each, one loop, no checkpoint | 0 |
| Stage 8 · the four-technique fan-out run | **0** — `grep -c "kind: checkpoint"` returns 0 at all five occurrences | 0 |

**Two gate definitions and six option ids.** That is the entire constituency of an acceptance
criterion carried by two stages, and stage 7's version of it — "the walker's routine-level entry …
walks such a routine per reference site instead" (README:923-924) — grades a routine that declares no
options at all.

Materialised, those two gates appear once per reference site. The assumption run has four hosts, so
the loader presents eight checkpoints and **24 option keys** today:

```
batch | research:research-assumption-interview                          | options 3 | pinned 3 | cond structured
item  | research:research-assumption-decision#{current_assumption.id}   | options 3 | pinned 0 | cond none
batch | implementation-analysis:analysis-assumption-interview           | options 3 | pinned 3 | cond structured
item  | implementation-analysis:analysis-assumption-decision#{…}        | options 3 | pinned 0 | cond none
batch | assumptions-review:residual-assumption-batch                    | options 3 | pinned 3 | cond structured
item  | assumptions-review:assumption-decision#{current_assumption.id}  | options 3 | pinned 0 | cond structured
batch | implement:implementation-assumption-interview                   | options 3 | pinned 3 | cond structured
item  | implement:implementation-assumption-decision#{…}                | options 3 | pinned 0 | cond none
```

Half of them are covered today. The four per-item gates contribute **zero** of the 113 pinned
unreachable options; the four batch gates contribute **twelve**, which is the same twelve
`verification/docs-and-site.md` PD4 found the renames orphan. Both figures reproduce exactly.

**And the premise the criterion argues from does not hold for this run.** "Only through whichever
host activities a walk happens to reach" describes a risk: a gate whose hosts no walk enters is
unmeasured. Measured, all eight of these checkpoints are declared by `work-package`, which is on the
walked roster and is its most expensive member (`tests/e2e/walked-workflows.ts:20-35`). Corpus-wide,
**5 of 112** distinct activity-and-checkpoint pairs sit in no walked workflow, and all five are
`remediate-vuln`'s `start` activity — the seven options the expectation file already pins with the
cost as the stated reason (`tests/e2e/option-coverage.json:120-129`). None of the five is a candidate
for any routine.

So the guarantee the entry point would newly provide is: *a gate inside a routine whose every host
activity is unreached by every walk*. The corpus contains no such gate, and the plan creates none.

---

## Four: the three ways to satisfy it, costed

### A — a definition-level enumerator, no session (recommended)

Not a walker. A recursive function over a loaded routine that finds every checkpoint step at any
depth, applies each option's declared effect to a bag, and records `<routine>:<gate>=<option>`. Every
piece of it exists to copy:

| Piece | The existing code it mirrors | Lines |
|---|---|---|
| Find every checkpoint at any depth | `activityCheckpointSteps`, `walker.ts:591-601` | 11 |
| Fire each one locally, forking over options | the graph-mode block, `walker.ts:806-821` | 16 |
| Key the result comparably | `optionKey`, `tests/e2e/coverage.ts:21-23` | 3 |
| Load the subject without a host workflow | `declaredCheckpoints`, `tests/e2e/coverage.ts:66-97` | 32 |

**Cost: roughly 40-60 lines in a new module, one test, no fixture, no session, no server.** It also
needs a routine loader callable without a workflow load — which stage 4 owes anyway, because the
guard-side promise in the same diagram ("A shared run is checkable with no host workflow",
README:625) needs exactly the same thing. Cost shared, not new.

One thing it does *not* get for free is the seed. `satisfyWhen` (`walker.ts:331-340`) can make a
single-comparison `when` string hold by mutating the bag, and there is no counterpart for a
structured `condition` — which is the dialect **69 of 112** corpus checkpoints use. For the two gates
actually at stake this does not bite: in the proposal's own worked body neither gate carries a
condition (README:247-275), the gate moves to the reference site as `when: has_open_assumptions ==
true` (README:291), and a recursion that ignores enclosing gates reaches both from an empty bag. So
"seeded from its declared inputs" does no work for either of the six options — worth saying plainly,
because it is the phrase the criterion is written around.

### B — a synthetic host activity in a fixture corpus

The harness already serves a fixture corpus in place of the real one: `createHarness({ workflowDir })`
(`tests/e2e/harness.ts:29`, `:41`), which `tests/e2e/fan-walk.test.ts:21` uses against
`tests/fixtures/fan-corpus`. A wrapper tree is a workflow.yaml naming an initial activity, one
activity carrying one `kind: routine` step, and a `routines/` copy of the routine under test.

The measured floor for a tree is small: `tests/fixtures/variable-model/bare-fixture` is **14 lines**
across two files, and `ActivitySchema` requires only `id`, `version` and `name`
(`src/schema/activity.schema.ts:279-281`). The measured precedent for what a construct costs here is
the graph fan: **15 trees and 70 files**, of which the YAML alone is 989 lines (item 11a's 1,141
counts every file in the root), driven by a 185-line test.

**Cost: ~20-30 YAML lines plus a test per routine under test, and a copy of the routine that drifts
from the corpus one.** Two further costs are specific rather than generic:

- **A walk over a wrapper produces keys nothing can compare.** The branch key the enumerator records
  is `<kind>:<activityId>:<id>=<option>` (`walker.ts:1000`), and `activityId` is the host. Walking a
  synthetic host keys the result on the synthetic host's id, which appears in no declared denominator,
  so the assertion has to be local to that test and contributes nothing to the corpus figure.
- **An unresolved reference fails silently rather than loudly.** Item 11a measured it and I re-took
  it: `loadWorkflow` on `tests/fixtures/fragments/beta-fixture` returns success with **zero**
  activities. Materialisation drops the host activity and the workflow loads clean. A wrapper whose
  routine reference does not resolve therefore walks an empty workflow and reports coverage of
  nothing.

### B′ — a wrapper inside the real corpus (refused by the construct's own rule)

Putting the wrapper in `workflows/` instead avoids the copy, and the construct forbids it. **A
routine's home is computed from its referrers** — "the workflow that owns the activity files
referring to it. One owner, and the routine lives there; two or more, and it lives in the shared
home" (README:560-569), with a referrer being an activity file or another routine, closed
transitively. A test wrapper is an activity file referring to the routine, so a wrapper in a second
workflow gives every routine it wraps a second owner and **relocates it to `meta`**. Stage 4 then
enforces that placement with a guard (README:872-873). A test cannot wrap a routine in the corpus
without moving the routine.

Three further costs land on top: `tests/e2e/coverage-roster.test.ts:22-35` requires every corpus
workflow to be on `WALKED` or `NOT_WALKED` with a reason, so a synthetic workflow needs a roster
entry; `tests/e2e/all-workflows-walk.test.ts:55` enters every corpus workflow; and the 40-guard suite
validates it like any other definition.

### C — change the criterion

State the guarantee as the mechanism actually provides it: *every option of every gate a routine
declares is taken at every reference site the walk reaches, counted against a denominator drawn from
the definitions through the real loader, with the unreached ones listed by reason.* That is
`tests/e2e/option-coverage.test.ts` as it stands, and section five shows it already counts a
materialised routine's gates without a line of change.

**Cost: zero code.** The loss is the case in section three that the corpus does not contain.

**Recommendation: C for stage 4, with A only if the guard work of stage 4 lands the standalone
routine loader anyway** — in which case A is 40-60 lines and answers the one question C cannot, and
stage 7's version of the criterion should simply be deleted, because a routine with no options cannot
be graded on option coverage.

---

## Five: the denominator already counts a routine's gates, and the pinned file moves twice

This is the coupled fact that matters most, because it fires whether or not anybody builds a second
walker.

The option-coverage test compares two sides. The numerator is what the walks took, recorded as
`checkpoint:<activity>:<checkpoint>=<option>` (`walker.ts:1000`, `:1030`). The denominator comes from
the definitions **through the real loader** — `declaredCheckpoints` calls `loadWorkflow` per workflow
and reads `activityCheckpoints` off each loaded activity (`tests/e2e/coverage.ts:66-97`), for the
reason its own header states at `:9-14`: a checkpoint may arrive by fragment `ref`, which raw YAML
shows as a step with no options at all.

Materialisation runs inside that load. So **a materialised routine's gates arrive in the denominator
on the day stage 5 lands**, keyed on the host activity and the prefixed gate id — `research` plus
`reconcile-assumptions.batch-gate` under the full-stop prefix rule (README:539-542). Nothing needs
changing for that to happen, and the two sides keep agreeing, because the numerator reads the same
materialised delivery.

That is the good news. Here is what it does to the file.

### The keys rename, and the check that notices is off on the run that renames them

`tests/e2e/option-coverage.json` holds **113** option keys in three reasoned groups of 90, 16 and 7 —
the options no walk reaches, each group carrying why (`tests/e2e/README.md:100-112`). Twelve of the
113 name the four batch gates stage 5 moves into a routine; all twelve keys change. The test computes
the listed options no definition declares and fails with "delete the entries"
(`option-coverage.test.ts:182`, `:187-191`) — but that computation is `SCOPE.length ? [] : …` on
`:182` itself, suppressed on a scoped run by design, with its reasoning at `:179-181`.

One refinement to PD4 on this point, measured from the job rather than from the test.
`.github/workflows/coverage.yml:80-83` walks **everything** when the diff touches `src`,
`tests/e2e/walker.ts`, `tests/e2e/policies.ts`, `tests/e2e/coverage.ts`,
`tests/e2e/option-coverage.json` or `tests/e2e/walked-workflows.ts`. So the suppression bites on a
corpus-only change — a submodule-pointer bump with no server edit. Stage 3 lands materialisation in
`src`; stage 5 is described as the corpus migration. **Land them in one pull request and the check
fires; land the corpus move on its own and it does not.** That is a sequencing instruction, not a
defect to fix in the test.

### And the twelve options stop being unreachable, for a reason that is about the walker

The twelve are pinned under group one — "gated on a value only the agent or the environment produces".
Mechanically, the cause is narrower than that: the batch gate carries a **structured condition**, and
graph mode honours `condition` and nothing else. `research-assumption-interview` as the loader
presents it:

```
cond {"type":"and","conditions":[
  {"type":"simple","variable":"is_review_mode","operator":"!=","value":true},
  {"type":"simple","variable":"has_open_assumptions","operator":"==","value":true}]}
```

`has_open_assumptions` is declared with `defaultValue: false`
(`workflows/work-package/activities/04-research.yaml:51-54`, and at six further hosts), so
`evaluateCondition` at `walker.ts:808` is false, the gate is skipped, and its three options go
unreached. The per-item
decision beside it carries no condition, so it fires even though its enclosing loop's `when` is
false — because graph mode collects checkpoints through the loop body (`walker.ts:593-598`) without
consulting the loop's gate. That is the whole of why 12 are pinned and 12 are not.

Now sort all 113 by the dialect of the gate they sit behind:

| Gate dialect | Checkpoints | Options | Pinned as unreachable |
|---|---|---|---|
| structured `condition` | 69 | 178 | **109** |
| `when` string | 2 | 4 | **0** |
| ungated | 41 | 101 | 4 |

The four ungated ones are `remediate-vuln`'s `start`, in the unwalked workflow. The two `when`-gated
checkpoints are `intake-and-analyze:sources-confirmed` and `intake-and-analyze:analysis-confirmed`,
both reading `source_readable == true` — a value as agent-produced as `has_open_assumptions`, and all
four of their options are covered. **A checkpoint step's `when` is invisible to the coverage walk**:
`CheckpointDef` (`walker.ts:36-43`) has no `when` field, and the graph-mode loop reads only
`cp.condition`. The schema states the same asymmetry from the other end — "On a checkpoint step, only
`condition` (not `when`) enables condition_not_met dismissal"
(`src/schema/activity.schema.ts:75`).

The proposal's worked reference site puts the gate in `when` (README:291) and its routine body carries
no condition (README:247-275). So after stage 5 the materialised batch gate is either ungated or
`when`-gated, and in either case the coverage walk fires it. **The twelve pinned options become
covered** — under new keys, by a walk that reaches them no more truthfully than it does today.

Which assertion catches which is worth being exact about, because they differ:

- `nowCovered` (`:198-202`) compares listed keys against the declared set and the uncovered set. A
  *renamed* key is in neither, so it does not fire.
- `stale` (`:182`, `:187-191`) is the only assertion that catches a renamed key, and it is the one
  scoping suppresses.
- `nowUncovered` (`:193-197`) stays empty, because the new prefixed keys are covered.
- `unexpected` (`:165`) stays empty, because both sides read the same materialised load.

Result on a corpus-only run: green, with twelve dead entries in the file and no record that the
options behind them changed status. The one assertion that does fire is the corpus stamp (`:98-104`
via `tests/stamp-freshness.ts:11-17`), and `npm run baseline:stamp` satisfies it without touching an
entry.

**What stage 5 owes, concretely:** delete the twelve entries rather than renaming them, and state in
the commit that the options behind them are now reachable because the gate moved from `condition` to
the reference site's `when` — which is the same decision stage 2 owes on dismissibility (plan defect
9 of the [sweeps folder](../../2026-09-10-routines-sweeps/README.md)), seen from the coverage side.

### And a routine-keyed numerator has nowhere to land

If a routine-level entry is built after all, note what its output does to this comparator. Keys are
compared only when they start with `checkpoint:` (`tests/e2e/coverage.ts:125`).

- Emit `checkpoint:<routine>:<gate>=<option>` and it lands in `unexpected`, which
  `option-coverage.test.ts:165` asserts is empty — "walk covered an option no definition declares".
- Emit `routine:<routine>:<gate>=<option>` and `:125` filters it out silently; it contributes
  nothing and nothing says so.

So a routine-level numerator needs routine-keyed entries added to the denominator as well — meaning
`declaredCheckpoints` walks `routines/` too — or its own test with its own assertion, which is option
A above. There is no third arrangement in which it feeds the existing figure.

---

## Six: the one four-kind enumeration a compiler could enforce, in a file no compiler reads

Cluster C of the sweep folder carries "sixteen closed four-kind step enumerations" — statements that a
step is one of `technique`, `action`, `checkpoint` or `loop`, each of which a fifth kind falsifies.
Fifteen are prose, JSON descriptions or generated strings. The sixteenth is a TypeScript union:

```
  /** Unified step kind (technique | action | checkpoint | loop). Absent only on pre-migration data. */
  kind?: 'technique' | 'action' | 'checkpoint' | 'loop';
```

`tests/e2e/walker.ts:67-68`. A closed union with a doc comment restating it, in the walker's own
types. It is the only one of the sixteen a type checker could catch, and the type checker never sees
it:

- `tsconfig.json:22` sets `"include": ["src/**/*"]`.
- `npm run typecheck` (`package.json:24`) is a bare `tsc --noEmit`, and CI runs that and nothing else
  (`.github/workflows/verify.yml:49`, `docker-publish.yml:48`, `deploy-docs.yml:46`).
- Measured: `tsc --noEmit --listFiles` emits **57** files under `/src/` and **0** under `/tests/`.
- `vitest.config.ts` declares no `typecheck` block, so the runner does not compile types either.

The canonical enumeration in `src` is a Zod discriminated union with four members
(`src/schema/activity.schema.ts:167-172`), and that one is compiled. The walker's is a claim about the
same set that nothing checks, in a file three `scripts/` tools import.

What happens when an unhandled kind arrives is not a type error but a behaviour, and it differs by
mode. Three collectors in one file find nested steps by two different rules:

| Collector | How it recurses | A `kind: routine` step carrying `steps` |
|---|---|---|
| `executeActivitySteps`'s `walk` (`:553-584`) | `step.kind === 'loop'` (`:567`) | body never entered; the step falls past the three kind tests to `:577-582` and is **executed as a leaf**, pushed to `stepsExecuted` and to the step manifest |
| `activityCheckpointSteps` (`:591-601`) | `if (s.steps) rec(s.steps)` (`:596`) | body **is** walked, and gates inside it fire |
| `activityDecidedVariables` (`:454-469`) | `step.kind === 'loop'` (`:458`) | body's set-actions and option effects are **not** collected, so the unbound-gate bookkeeping at `:561-563` misreads |

None of the three logs anything. And the response is cast rather than parsed —
`parseWorkflowResponse(res) as unknown as ActivityDef` (`walker.ts:377`) — so the union is not even a
runtime filter. This is the same hazard the proposal records for the server's own walks at
README:437: "A compound kind it does not know is walked as a leaf, **silently**." The walker is one
of the walks that does it, and no record in either folder reaches this file.

Post-materialisation none of it fires, because no `kind: routine` step survives the load. It fires in
the interval where materialisation is partial or absent: stage 3's own landing, a fixture tree whose
reference does not resolve (section four, B), and the fragment path's documented behaviour of
dropping the host activity and loading clean.

**What stage 3 owes:** add the fifth member to `walker.ts:68` and its doc comment at `:67` — a
two-line edit to the enumeration set's sixteenth site — and decide whether `tests/**` joins the
typecheck program, because that is the only change that would make this union enforce itself. The
cheaper half of that decision is a second tsconfig for `tests` and `scripts` run by the same CI step;
`scripts/` is outside the program too, which the keep list already notes for `breakCondition`.

---

## What this changes in the plan

1. **Stage 4's walker criterion (README:877) cannot be satisfied by the mechanism it names.** Replace
   it with the coverage statement in section four option C, or budget the definition-level enumerator
   of option A and say which. As written it is a second walker, and no stage budgets one.
2. **Stage 7's walker criterion (README:923-924) grades a routine with no options.** Measured: the
   three `prism` per-unit passes declare zero checkpoints. Delete the criterion.
3. **Stage 5 owes twelve deletions from `tests/e2e/option-coverage.json`, not twelve renames** — and
   the reason is a behaviour change (the gate moving from a structured `condition` to the reference
   site's `when`), which is stage 2's disposition seen from the coverage side.
4. **Stage 5 lands in the same pull request as a `src` change, or the orphan check is inert.** The
   escape-hatch path list at `.github/workflows/coverage.yml:80` is the mechanism; nothing else in
   the plan makes it fire.
5. **Stage 3's enumeration edit includes `tests/e2e/walker.ts:67-68`**, the sixteenth site and the
   only one of the sixteen a compiler could enforce. Whether it ever does is a separate decision —
   `tests/**` and `scripts/**` both sit outside the typecheck program.
6. **The enforcement table's "Detected" row (README:627) overstates what the entry adds.** Corpus-wide
   only 5 of 112 checkpoints sit in no walked workflow, all five in `remediate-vuln`'s `start`, and
   none of them is a routine candidate. The row should say what it detects that the loader-drawn
   denominator does not.

---

## Re-taking these figures

```
cd <server-checkout>
wc -l tests/e2e/walker.ts                                     # 1045
grep -n "session_index" tests/e2e/walker.ts                   # 8 lines; 7 are tool arguments
grep -rn "walker.js" tests/ scripts/ --include=*.ts           # 11 importers, 3 under scripts/
node_modules/.bin/tsc --noEmit --listFiles | grep -c "/tests/" # 0
node_modules/.bin/tsc --noEmit --listFiles | grep -c "/src/"   # 57
grep -rn "'technique' | 'action' | 'checkpoint' | 'loop'" tests/ src/ scripts/   # one hit: walker.ts:68
grep -c "kind: checkpoint" workflows/meta/activities/patterns/02-supervisor.yaml \
  workflows/meta/activities/patterns/05-lead-researcher.yaml \
  workflows/cicd-pipeline-security-audit/activities/03-primary-scan.yaml \
  workflows/substrate-node-security-audit/activities/02-reconnaissance.yaml \
  workflows/substrate-node-security-audit/activities/03-primary-audit.yaml   # 0 at all five
find tests/fixtures/fan-corpus -type f -print | wc -l         # 70, across 15 trees
find tests/fixtures/variable-model/bare-fixture -type f -print0 | xargs -0 wc -l   # 14 total
python3 -c "import json;d=json.load(open('tests/e2e/option-coverage.json'));print([len(g['options']) for g in d['groups']], sum(len(g['options']) for g in d['groups']))"
                                                              # [90, 16, 7] 113
```

The loader-drawn figures came from throwaway `tsx` scripts at the repository root, deleted after use.
Each imported `declaredCheckpoints` / `declaredOptions` from `tests/e2e/coverage.js` and
`loadWorkflow` / `flattenActivitySteps` from `src/`, iterated every directory under the corpus root
holding a `workflow.yaml` (18 of them), and printed:

- **283** declared option keys and **112** distinct activity-and-checkpoint pairs. The 283 reproduces
  the completeness pass's re-measurement of 285-now-283. The 112 is a third grain beside the 113 the
  folder states and the 115 a raw parse of `kind: checkpoint` nodes gives: it counts one entry per
  (activity, checkpoint) pair as the loader presents it, deduped across borrowing workflows and
  excluding the pattern-library activities the loader skips.
- The gate-dialect split — 69 structured, 2 `when`, 41 ungated — and the pinned tally against each
  (109 / 0 / 4).
- The eight assumption-run checkpoints with their option counts, pinned counts and condition dialect,
  and the workflows declaring each host intersected with `WALKED`.
- **5 of 112** checkpoints declared by no walked workflow, all five in `remediate-vuln`.

The `start_session` probe in section two was likewise a throwaway: `createHarness()` from
`tests/e2e/harness.js`, then `start_session` with `{ workflow_id, agent_id: 'e2e-walker' }` for
`work-package` and for `assumption-reconciliation`, printing `isError` and the response content. The
fragment-fixture load probe is `loadWorkflow(resolve('tests/fixtures/fragments'), tree)` for the three
trees; `beta-fixture` returns success with `activities 0`.

Measured against the [routines proposal](../../2026-09-03-routines/README.md) and the
[sweeps folder](../../2026-09-10-routines-sweeps/README.md), whose completeness pass opened this
surface. Companion to [the fixture corpora](fixtures.md), item 11a, which measures the trees option B
would live in.
