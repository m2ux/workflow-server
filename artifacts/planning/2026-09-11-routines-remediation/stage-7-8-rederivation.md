# Stages 7 and 8, re-derived from the corpus

> Item 1 of the routines remediation · 2026-09-11 · server `792f2cc5`, corpus `a4a5d88b`
> Subject: the [routines proposal](../2026-09-03-routines/README.md) stages 7 and 8, measured against
> the [verified sweep outcome](../2026-09-10-routines-sweeps/README.md) plan defects 1 and 2

The two stages at the end of the routines plan each take a family of repeated steps and make it one
parameterised body. Stage 7 takes three analysis passes in the `prism` workflow and needs a new kind
of routine input, one whose argument is a technique reference. Stage 8 takes a four-step dispatch run
in the borrowable pattern library and needs nothing new at all. Both were costed against a corpus
that has since changed, and the change is the arrival of a competing construct: a graph destination
that names one activity together with the collection to run it over, and opens one worker per element
of that collection.

**The two stages come out of this in opposite directions, and the reason is a discriminator the
corpus already states rather than anything about routines.** Stage 8's constituency was four
occurrences of one run; the graph took two of them by deletion, and the two it took are exactly the
two whose work is one activity per unit. The three occurrences that survive are the ones whose work
is several units inside one worker, which is the grain the graph does not serve — so stage 8 keeps a
real constituency, and it is the smallest of any stage in the plan, sitting behind a load rule that
cannot be satisfied where its reference sites live. Stage 7's three activities look like exactly what
the graph just replaced, and five independent measurements say they are not: their collection carries
no element ids, their chain admits only one fan before a join activity that does not exist, two of
the three read across iterations what the fan would land in separate slots, their declared iteration
bound is twenty-five times the server's fan ceiling, and their modal collection has one element.

So the answer to the question this re-derivation was set is: **the graph owns nothing that either
stage still names.** What is wrong with both stages is that they are graded by criteria naming
things that do not exist — two deleted files, a variable at zero sites, a rule at zero sites, and a
drift baseline that never covered stage 7 at all.

---

## The tree this is derived against

| | Revision | Note |
|---|---|---|
| Server tooling | `792f2cc5` | `ee95e4cd`, the revision the task names, is an ancestor; one commit ahead ("Own agent skills and settings at workspace level"), touching no source |
| Corpus submodule | `a4a5d88b` | 28 commits past the sweeps' baseline `2b8b7215`, and the same revision the completeness pass measured |

The construct is still unbuilt, which is what makes both stages re-derivable rather than
remediable. `StepSchema` is a discriminated union of four members
(`src/schema/activity.schema.ts:167-172`), and `find . workflows -maxdepth 3 -type d -name routines`
returns nothing.

Figures below are re-taken here. Where a figure differs from one the sweeps or verifications state,
the difference is named and attributed.

---

## Part one — confirming the four readings

### The two deleted reference sites

Stage 8's second criterion reads: "Four reference sites: `01-orchestrator-workers`,
`04-isolated-fan-out`, `05-lead-researcher` and the follow-up loop inside it"
(`2026-09-03-routines/README.md:936-937`). Two of the four files are gone.

`git log --diff-filter=D` over the two paths gives the deletions as
`67ac93f0cbcf64498a2a45d0c8ca3c63c49d8795` ("Retire the pattern activity the graph fan replaces") for
`meta/activities/patterns/01-orchestrator-workers.yaml` and
`b5471e453a1c0542bae68cb9cc554433ec0b9464` ("Retire the isolation pattern nothing could reach") for
`04-isolated-fan-out.yaml`. This settles the disagreement the completeness pass records: the
attribution of the first deletion to `f6cb1dc2` in `verification/canon-rules.md:56-58` is wrong, and
`verification/corpus-vocabulary.md:39-42` has the right commit.

**The deletion commits are themselves the record of why, and they name the discriminator both stages
turn on.** `67ac93f0`'s body says the orchestrator-workers pattern "was decompose, compose briefs,
dispatch, gather, synthesise — and nothing else. That is what a destination naming one activity and
the collection to run it over now does, with each unit in a worker of its own." It then says what the
survivors keep: "The lead researcher's follow-up loop re-dispatches after a synthesis, which a fan
cannot do because it opens once; a single round of questions each deserving their own context is a fan
over the questions." `b5471e45`'s body reasons the same way and adds a fact that bears directly on
stage 8's feasibility: "the directory is not part of meta's activity set — the loader reads it
non-recursively, so the id resolves nowhere."

Three activity files and a README sit in `meta/activities/patterns/` today: `02-supervisor.yaml`,
`03-plan-and-execute.yaml` and `05-lead-researcher.yaml`. Stage 8's criterion also
demands a disposition for "the completeness `validate` at `04-isolated-fan-out`", which is a step in
a file with no content left to dispose of. At `b5471e45^` that step was
`kind: action` / `id: require-complete` / `action: validate` at lines 53-58 of the deleted file, and
it is the step that interrupted that site's run.

### The fifth occurrence at a file the design never names

`meta/activities/patterns/02-supervisor.yaml` carries the run, and the word "supervisor" appears
nowhere in the routines proposal or its twelve companion records. Its step sequence at `:39-62` is
`classify-request` → `compose-worker-briefs` → `dispatch-workers` → `gather-results` → an
`announce-escalation` action → `synthesise-results`. That is the four operations of the run in order,
with one intervening step, which is the same shape `04-isolated-fan-out` had.

The census instrument does see the file. It is one of the two owners of the only surviving cross-file
fan-out window, which is the three-step head of the run.

### Five occurrences across four files, or three occurrences in two

Two verifications state different counts, and both are right about different trees.

`verification/design-itself.md:119-128` resolved every step binding in all five pattern files **at the
sweeps' pinned corpus** and counted five occurrences of the four-technique run across four files, two
of them interrupted by an action step. That corrects the proposal's "four occurrences of one run"
(`README.md:776`) and the sweep's "three occurrences plus one variant" in the same measurement.
`verification/corpus-vocabulary.md` CV18 measured **the working tree** and reports three occurrences
in two files.

Re-taken at `a4a5d88b`, the working-tree figure is the one that governs a plan, and it reproduces:
**three occurrences of the four-technique run, in two files, one of them interrupted.** The "two
interrupted" half of the pinned figure does not survive, because one of the two interrupted
occurrences was `04-isolated-fan-out`.

The instrument, run over the tree:

    python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py --root workflows

reports `activity files parsed: 132` and `maximal shared windows: 24 (top level 19, inside a loop
body 5)`. That is the completeness pass's corrected figure to the digit, against stage 1's criterion
of 26. Exactly one of the 24 windows is a fan-out window:

      3 steps, 2 activities
        meta/activities/patterns/02-supervisor.yaml
        meta/activities/patterns/05-lead-researcher.yaml
          T:orchestration-patterns::compose-worker-briefs()
          T:orchestration-patterns::dispatch-workers()
          T:orchestration-patterns::gather-results(expected_ids)

The four-step window that existed at the pin is gone, which confirms `verification/canon-rules.md`
P1. The window stops at `gather-results` because the run at `02-supervisor` is interrupted after
that step, and the census matches on consecutive positions.

### The prism trio is still one iteration over a collection, reached as a single destination

All three activities are unchanged in shape. Each has exactly one top-level step, that step is a
`forEach` loop, and that loop's body has exactly one step:

    grep -c '^  - kind:'     → 1 at each of the three
    grep -c '^      - kind:' → 1 at each of the three

Each file is 41 lines. The graph reaches each as a plain string destination and each exits to a plain
string destination: `structural-pass.full-prism → adversarial-pass` at
`prism/workflow.yaml:52`, `adversarial-pass.done → synthesis-pass` at `:56`,
`synthesis-pass.done → generate-report` at `:58`, and
`structural-pass.behavioral → behavioral-synthesis-pass` at `:53` with
`behavioral-synthesis-pass.done → generate-report` at `:60`. No fan anywhere in the file.

---

## Part two — stage 8, every surviving occurrence

The run is four operations, all from the `orchestration-patterns` group:
`compose-worker-briefs` → `dispatch-workers` → `gather-results` → `synthesise-results`. Grepping each
name separately over the corpus gives three files carrying `compose-worker-briefs` bindings and three
carrying `synthesise-results` bindings, which is the population below and nothing else. Eleven
`dispatch-workers` bindings exist in five files; the eight outside these two files sit in runs built
from different compose and successor operations, which CV18 established by reading each in its
sequence and which the census confirms by producing separate windows for them.

### Site A — `meta/activities/patterns/02-supervisor.yaml:42-62`

| Lines | Step | Binding |
|---|---|---|
| 42-44 | `compose-brief` | `orchestration-patterns::compose-worker-briefs` |
| 45-47 | `dispatch` | `orchestration-patterns::dispatch-workers` |
| 48-53 | `gather` | `orchestration-patterns::gather-results`, `inputs: { expected_ids: worker_briefs }` |
| **54-59** | **`announce-escalation`** | **`kind: action`, `when: lane_id == 'escalate'`, one `message` action interpolating `{classification_rationale}`** |
| 60-62 | `synthesise` | `orchestration-patterns::synthesise-results` |

Preceded by `classify` at `:39-41` binding `classify-request`, which is not a member of the run. The
activity has six top-level steps in total, so the run is five of the six positions and the sixth is
the classifier.

**What this site binds differently:** `expected_ids: worker_briefs`, where both other occurrences
bind `work_units`. That is the whole of the binding difference, and it is one input.

**What interrupts it:** a gated announcement. Both names it touches — `lane_id` and
`classification_rationale` — are produced by `classify-request` at this site and exist at no other
occurrence.

### Site B — `meta/activities/patterns/05-lead-researcher.yaml:41-55`

| Lines | Step | Binding |
|---|---|---|
| 41-43 | `compose-briefs` | `orchestration-patterns::compose-worker-briefs` |
| 44-46 | `dispatch` | `orchestration-patterns::dispatch-workers` |
| 47-52 | `gather` | `orchestration-patterns::gather-results`, `inputs: { expected_ids: work_units }` |
| 53-55 | `synthesise` | `orchestration-patterns::synthesise-results` |

Contiguous, with nothing between. Preceded by `plan-questions` at `:38-40` binding
`plan-research-questions` and followed by `assess-gaps` at `:56-58` binding `assess-research-gaps`;
neither is a member of the run.

**What this site binds differently:** nothing. This is the baseline.

### Site C — `meta/activities/patterns/05-lead-researcher.yaml:70-84`

| Lines | Step | Binding |
|---|---|---|
| 70-72 | `compose-followup-briefs` | `orchestration-patterns::compose-worker-briefs` |
| 73-75 | `dispatch-followup` | `orchestration-patterns::dispatch-workers` |
| 76-81 | `gather-followup` | `orchestration-patterns::gather-results`, `inputs: { expected_ids: work_units }` |
| 82-84 | `synthesise-followup` | `orchestration-patterns::synthesise-results` |

Contiguous, inside the body of the `gap-followup` loop declared at `:59-68` —
`loopType: while`, `maxIterations: 3`, continuing while `has_research_gaps == true`. The body's fifth
step, `reassess-gaps` at `:85-87`, is the continuation test's producer and is not a member of the run.

**What this site binds differently:** the four step identifiers carry a `-followup` suffix, and
nothing else. Its position inside a `while` loop is the one structural difference between it and
site B, and under a routine that position belongs to the referring step rather than to the body.

### What the three occurrences cost the corpus today

| Measure | Figure | Source |
|---|---|---|
| Occurrences of the four-technique run | 3, in 2 files | the grep population above |
| Cross-file census windows the run produces | 1, of 24 maximal windows | `repeated-runs.py --root workflows` |
| Occurrences no guard can see | 1 — site C, an intra-file repetition | census keys on two or more activity *files* |
| Byte-identical write declarations across the two files | 6, forming 3 identical pairs: `dispatched_results`, `gathered_results`, `combined_synthesis` | reading both `variables.writes` blocks |
| Write declarations that differ | 2 pairs — `work_units` and `worker_briefs` carry domain-specific descriptions | same |
| Checkpoints at either file | 0 and 0 | `grep -c 'kind: checkpoint'` |
| Workflows whose graph includes either file | 0 | `grep -rn 'patterns/' --include=workflow.yaml workflows` returns nothing |
| Activity files validated by the guard suite | 129 of 132; the 3 unvalidated are these two plus `03-plan-and-execute.yaml` | `npx tsx scripts/validate-activities.ts` |

The byte-identical-declaration figure reproduces CV19's "six" exactly. The validated figure has moved
from CV19's 125-of-128: the corpus has gained four activity files since that reading, and the
unvalidated three are the same three.

---

## Part three — stage 7, the three per-unit passes

The whole content of each of the three is one loop step whose body is one technique step. The files
are byte-for-byte comparable, so the differences are exact rather than described.

`diff 02-adversarial-pass.yaml 03-synthesis-pass.yaml` reports seven changed lines in five hunks:
the activity `id`, the activity `name`, the `description`, the loop `id`, the loop `name`, the body
step `id` and the bound operation. Thirty-four lines are identical, `version: 2.4.0` included. Every
field the proposal claims agrees does agree: `loopType: forEach`, `variable: current_unit`,
`over: analysis_units`, `maxIterations: 100`, `target_content: "{current_unit.target}"`,
`prior_artifact_paths: all_artifact_paths`, the `set` action on `all_artifact_paths` with the same
description, the entry gate `when: current_unit.pipeline_mode == 'full-prism'`, and
`exits: [{ id: done, isDefault: true }]`.

`diff 02-adversarial-pass.yaml 05-behavioral-synthesis-pass.yaml` reports the same seven positions
plus four more: `version` (`1.4.0` against `2.4.0`), the reads list swapping `all_artifact_paths` for
`behavioral_output_paths`, the `prior_artifact_paths` binding swapping the same way, and the entry
gate reading `current_unit.pipeline_mode == 'behavioral'`.

| | `02-adversarial-pass` | `03-synthesis-pass` | `05-behavioral-synthesis-pass` |
|---|---|---|---|
| Operation bound | `full-prism::adversarial` | `full-prism::synthesis` | `behavioral-pipeline::synthesis` |
| `prior_artifact_paths` bound to | `all_artifact_paths` | `all_artifact_paths` | `behavioral_output_paths` |
| Entry gate on the body step | `pipeline_mode == 'full-prism'` | `pipeline_mode == 'full-prism'` | `pipeline_mode == 'behavioral'` |
| Reads | `all_artifact_paths`, `analysis_units` | same | `analysis_units`, `behavioral_output_paths` |
| Writes | `all_artifact_paths`, `current_unit` | same | same |
| Reads the accumulator it writes | yes | yes | no |

So the differences are three parameters — an operation, a prior-paths collection, a mode literal —
and the proposal's reading of the family (`higher-order-routines.md:106-116`) reproduces exactly.

### What the graph does with each

Each is a single plain destination, entered once, exited once, and the three sit in one chain:

    structural-pass --full-prism--> adversarial-pass --done--> synthesis-pass --done--> generate-report
    structural-pass --behavioral--> behavioral-synthesis-pass --done--> generate-report

`all_artifact_paths` is the workflow-spanning accumulator the chain is built around. Eleven `prism`
activities declare a write to it and `prism-evaluate/activities/02-execute-analysis.yaml` declares a
twelfth; `prism/activities/04-deliver-result.yaml:7` and `06-generate-report.yaml:7` read it. At
`02-adversarial-pass` and `03-synthesis-pass` the same name appears on both sides of one loop body —
read at `:33` as the operation's `prior_artifact_paths` input and written at `:36` by the `set`
action — so iteration N reads what iterations 1 through N−1 put there.

---

## Part four — the discriminators, applied

The corpus states four tests for choosing between running units inside one worker and running an
activity per unit. Each is canon rather than an import, and each is applied to all six sites below.

### One — a unit inside one worker, or an activity per unit

`meta/techniques/scatter-gather.md` protocol step 1 names the two modes and what each costs. In a
worker: "Iterate the work units in a `forEach` loop; invoke the per-unit operation once per unit …
The whole scatter runs in the calling context, and one delivery of the loop body's technique serves
every pass." In the graph: "Bind the exit that reaches the per-unit activity to a destination naming
that activity together with the collection to run it over. The run opens one worker per element."
Its rule `one-gather-contract-over-two-scatter-modes` adds that the two are the same primitive and
"the scatter mode selects only where the work units run."

`meta/activities/patterns/README.md:9` gives the author-facing form: "Reach for a pattern activity
when the units are cheap enough to sit in one worker's context, and for the graph fan when each unit
is worth a whole delivery of its own."

**For stage 8's three sites this test is already settled by the operation they bind.** The rule
`one-worker-at-a-time` on `meta/techniques/orchestration-patterns/dispatch-workers.md` reads: "Briefs
are dispatched one after another, in the calling worker's own turn. Running work units together is
the graph's business." That rule landed in corpus commit `a904da93` ("Work a pattern's units one at a
time and leave the batch to the graph"), which is an ancestor of the sweeps' own baseline. So the run
stage 8 converts is not a fan and never competes with one: it is the in-worker mode by the definition
of its middle step. The graph is not a rival home for these three occurrences. It is the reason the
other two occurrences no longer exist.

**For stage 7's three sites the test says in-worker too, and the construct inventory says so twice.**
`workflow-design/resources/schema-construct-inventory.md:38` routes "orchestrator-workers / fan-out
then consolidate" to the graph and then states the alternative in the same cell: "Work units inside
ONE worker are the other grain: a `forEach` loop step over the same collection, which pays one
delivery rather than N."

### Two — does anything accumulate across iterations

Under a graph fan nothing can. `scatter-gather.md` rule `isolation-then-combine` states it: "Under a
graph fan the isolation is structural rather than honoured: each branch's whole reported map lands in
a slot of its own under a key derived from its activity id, server-side, so the bare name does not
land at all." The mechanism is `openFanBranches` at `src/tools/workflow-tools.ts:876`, which pushes
one container per fanned member keyed by `branchKey(member.activity)` with one slot per element, and
`branchLanding` at `:919-924`, which routes a retiring branch's reported map into its own slot.
`fan-conformance/README.md:143` states the consequence for a reader: "No meeting point names a slot.
Each reads its containers whole."

- **Stage 8, sites A, B and C:** nothing accumulates within the run. The three shared outputs
  (`dispatched_results`, `gathered_results`, `combined_synthesis`) are each written once per pass of
  the run. At site C the `while` loop rewrites them each round, and what carries between rounds is
  `has_research_gaps`, which belongs to the loop rather than to the run. **The test is neutral here.**
- **Stage 7, `02-adversarial-pass` and `03-synthesis-pass`:** they accumulate, and they read the
  accumulation. `prior_artifact_paths: all_artifact_paths` at `:33` against
  `set target: all_artifact_paths` at `:36`, in one body. Under a fan every instance reads the bag as
  it stood when the fan opened, so the second pass would not see the first pass's artifact path. **The
  test refuses the fan outright for two of the three.**
- **Stage 7, `05-behavioral-synthesis-pass`:** it writes `all_artifact_paths` without reading it, so
  its iterations are independent in their inputs. But the name it writes is a bare name the downstream
  activities read, and under a fan that name does not land at all — it becomes
  `behavioral_synthesis_pass_outputs`, slot by slot. `06-generate-report.yaml:7` and
  `04-deliver-result.yaml:7` read `all_artifact_paths`. **Converting it requires a new join activity
  that reads the container whole and re-derives the name, which the graph does not have.**

### Three — is a gate reachable

A branch of a fan cannot hold a checkpoint. `fanErrors` rule L9 at
`src/loaders/workflow-loader.ts:793-805` fails the load for any fanned activity declaring one, and
`meta/techniques/workflow-engine/dispatch-fan.md` rule `a-branch-reaches-no-gate` states the reason:
"A session holds one outstanding decision at a time and every other tool call is gated while it is
held, so one branch's gate would stop its siblings mid-activity."

`grep -c 'kind: checkpoint'` returns **0** at all five files the two stages touch:
`02-supervisor.yaml`, `05-lead-researcher.yaml`, `02-adversarial-pass.yaml`, `03-synthesis-pass.yaml`
and `05-behavioral-synthesis-pass.yaml`. This re-takes the completeness pass's class-(b) check and
the verdict holds: **stages 7 and 8 move no gate at all.**

Two consequences, and they point opposite ways. The fan's gate refusal costs nothing at any of the
six sites, so it is not what keeps them out of the graph. And the dismissibility hazard that
dominates stage 5 — plan defect 9, where a shared body either gives three hosts a gate they lack or
takes one away from the fourth — does not arise for either of these stages. **Whatever else is
contested here, no decision about a person's choices is.** `03-plan-and-execute.yaml` declares the
one checkpoint in the pattern library, and it is the one pattern activity neither stage names.

### Four — the arithmetic of delivery

`src/config.ts:174-182` states the bound and the reason: "Each branch is a whole further delivery of
an activity and a further harness establishment, which is what the bound is against," with
`DEFAULT_FAN_MAX_BRANCHES = 4` and an environment override admitting 2 to 100
(`src/config.ts:625`). `openFanBranches` refuses a wider destination at the fan-enter
(`src/tools/workflow-tools.ts:858-869`), and refuses an empty collection at `:831-835`.

**Stage 8.** The arithmetic is unusual, and it is the finding that decides the stage. Both files sit
in a directory `loadActivitiesFromDir` never walks — it reads one directory with `readdir` and no
recursion (`src/loaders/workflow-loader.ts:72-107`) — and no workflow reaches them by the explicit
borrow either, since no `workflow.yaml` in the corpus carries a `patterns/` entry. So the delivered
cost of the three occurrences is **zero bytes at zero live sites**, and converting them saves zero.
The authored sizes are 2,342 bytes for `02-supervisor.yaml` and 3,018 for `05-lead-researcher.yaml`,
with the run's four operations adding 5,017 bytes of technique markdown between them
(`compose-worker-briefs` 1,156, `dispatch-workers` 1,433, `gather-results` 1,442,
`synthesise-results` 986). Nothing in the repository delivers any of it.

**Stage 7.** Five figures, and each one refuses the fan on its own:

1. **Element ids.** A fan requires each element to be "a slug string or an object carrying a string
   `id`" (`src/tools/workflow-tools.ts:836-848`), because an element's id names its container slot, its
   manifest row and its artifact filename. `analysis_units` elements carry
   `{ target, target_type, pipeline_mode, lens_name, lenses, role, risk, rationale, unit_output_subdir }`
   (`prism/techniques/plan-analysis.md:143`) and no `id`. A fan over that collection fails at the
   fan-enter.
2. **Two fans cannot chain.** Rule L5 at `src/loaders/workflow-loader.ts:776-783` fails the load when a
   branch's exit fans: "A branch runs in one worker and returns to the join, so each of its exits names
   one destination." `adversarial-pass.done` leads straight to `synthesis-pass`
   (`prism/workflow.yaml:55-56`), so fanning the first forbids fanning the second. Converting both
   requires a join activity between them that does not exist.
3. **The declared iteration bound.** Each loop declares `maxIterations: 100`. The server's default fan
   ceiling is 4, twenty-five times narrower, and its widest admissible override is 100.
4. **The modal width is one.** `plan-analysis.md:144-145` produces a single-element `analysis_units`
   array for query, file and module scopes, one element per module only for codebase and document-set
   scopes. A fan of one element pays a whole further delivery to save nothing.
5. **The collection is heterogeneous by construction.** Each body step carries a `when` gate on
   `current_unit.pipeline_mode`, and `plan-analysis.md:170` rule `budget-drives-depth` says why: "For
   multi-unit scopes, the budget determines per-unit depth." A loop skips the elements the gate
   excludes at no cost. A fan opens a branch for every element and pays for each.

---

## Part five — the verdicts

### Stage 8 — the fan-out routine

**Which sites remain:** three occurrences in two files —
`meta/activities/patterns/02-supervisor.yaml:42-62` (interrupted at `:54-59`),
`meta/activities/patterns/05-lead-researcher.yaml:41-55`, and
`meta/activities/patterns/05-lead-researcher.yaml:70-84` (inside a `while` loop body). Of the four
sites the criterion names, one survives and one is the same file's second occurrence; the other two
are deleted, and a third occurrence the criterion never names has to be added.

**Does the stage still have a constituency?** Yes, and the graph cannot take it. Three occurrences of
a run whose middle step is sequential in-worker dispatch by its own canonical rule, in two files the
construct inventory routes to the borrowable pattern rather than to the graph (`:39` for supervisor,
`:42` for lead-researcher, the latter stating the reason: "a fan opens once and cannot re-dispatch
after a synthesis"). One of the three occurrences is invisible to every guard in the suite and to the
guard stage 1 would add, which is the one thing only a routine fixes here.

**Is a routine the right home?** For the shape, yes. For a stage, no — three things say the stage
cannot be delivered or graded as written, and the third is a blocker no stage budgets:

- **The delivery arithmetic is zero on both sides.** No workflow includes either file; 129 of 132
  activity files validate and the three that do not are these. A migration here changes what no
  session receives.
- **The drift it removes is one window of 24.** Plus one intra-file repetition that has to be checked
  by hand, because the census keeps only windows appearing in two or more activity files.
- **Stage 4's load rule cannot be satisfied where these reference sites live.** Its criterion is "A
  routine with no reference site anywhere fails the load" (`README.md:878`). The load is per-workflow
  and `loadActivitiesFromDir` is non-recursive, so loading `meta` never opens
  `meta/activities/patterns/`. A routine referenced only from these two files has no reference site
  from the loader's point of view, and fails the load of every workflow in the corpus. This is the same
  fact `b5471e45` gave as a reason to delete a file: "the loader reads it non-recursively, so the id
  resolves nowhere."

**Recommendation: retire stage 8 as a stage, and carry its three occurrences as a named conversion
candidate under stage 3's construct, gated on the loader question.** Compare it against its
neighbours: stage 5 removes a 57-line `fragments` block, eight reference steps, a 238-line resolver
and seven guard rules; stage 6 removes 192 lines in six byte-identical blocks. Stage 8 removes one
census window and one hand-checked repetition, in files nothing loads, and it needs a loader change
first. It is not a stage; it is a follow-on conversion whose value arrives the day a workflow borrows
one of the two pattern activities, and which should be listed where that day is noticed. The
alternative — keeping it as the plan's last stage — is defensible only if the owner wants the library
converted for the library's own sake, and the criterion then has to be rewritten as below.

**What its acceptance criterion should say instead** of naming four files two of which do not exist:

- [ ] The routine is referenced at the three occurrences of the four-technique dispatch run measured
      at the landing revision: `meta/activities/patterns/02-supervisor.yaml`, and
      `meta/activities/patterns/05-lead-researcher.yaml` twice, once at the top level and once in the
      body of its `gap-followup` loop. The site list is the output of
      `measure/repeated-runs.py` plus a by-hand pass for intra-file repetition, taken at that
      revision, not a literal carried from this record.
- [ ] The interruption at `02-supervisor` is disposed of in one of three named ways, and the record
      says which: the routine body is the three-step head the census sees and `synthesise-results`
      stays a host step at all three sites; or the routine body is the four steps and the
      `announce-escalation` action moves after `synthesise`; or the gated action enters the routine
      body, which gives the two `05-lead-researcher` occurrences an escalation announcement they do
      not have — the same class of behaviour change stage 2 exists to record, and it needs a
      disposition there rather than here.
- [ ] `expected_ids` is a routine input. It is the one binding that differs between the occurrences:
      `worker_briefs` at `02-supervisor`, `work_units` at both `05-lead-researcher` sites.
- [ ] The three byte-identical write declarations the two files share — `dispatched_results`,
      `gathered_results`, `combined_synthesis` — become routine outputs, and the two that differ —
      `work_units` and `worker_briefs` — stay with their activities, because their descriptions are
      domain-specific at each file.
- [ ] The census's one fan-out window is gone, named as the three-step
      `compose-worker-briefs` → `dispatch-workers` → `gather-results` window over
      `02-supervisor.yaml` and `05-lead-researcher.yaml`, and the count of maximal windows falls by
      exactly one from whatever it is at the landing revision. The intra-file occurrence at
      `05-lead-researcher` is verified by reading the file, and the criterion says so rather than
      asking a guard to see what it cannot.
- [ ] A routine whose only referrers sit in `meta/activities/patterns/` loads. Either the loader
      discovers that directory or stage 4's no-reference-site rule is scoped to exclude it, and the
      record says which.

**Two criteria to delete outright.** "The routine declares no concurrency and no dispatch mode.
`dispatch_concurrency` reaches `dispatch-workers` as an ordinary binding, and
`parallelism-is-optimisation` holds" (`README.md:939-940`) names two things at zero sites:
`grep -rc 'dispatch_concurrency' workflows` returns nothing, and `parallelism-is-optimisation`
appears nowhere in the corpus or in `src/`. Both live only in planning folders. The obligation the
criterion was reaching for is now stated by the operation itself, in `dispatch-workers`'s rule
`one-worker-at-a-time`, so there is nothing for the routine to declare and nothing to hold it to.

### Stage 7 — the technique parameter

**Which sites remain:** all three, unchanged in shape by 28 commits of corpus movement —
`prism/activities/02-adversarial-pass.yaml`, `03-synthesis-pass.yaml` and
`05-behavioral-synthesis-pass.yaml`, each 41 lines, each one `forEach` over `analysis_units` binding
one operation.

**Does the stage still have a constituency?** Yes, and this is the stage the plan defect register
raised the question against. The answer is that the graph construct cannot serve any of the three:
the collection carries no element ids, the chain admits only one fan before a join activity that does
not exist, two of the three read across iterations what a fan would isolate into separate slots, the
declared iteration bound is twenty-five times the server's fan ceiling, and the modal collection has
one element. **Stage 7's constituency is not structurally identical to what the fan replaced. It
resembles it and differs on five measurable points, every one of which the canon or the loader states
in advance.**

**Is a routine the right home?** For the shape, yes — it is the tightest three-site family in the
plan, differing in three values that are parameters. Two things about the stage need fixing, and one
is a defect the proposal's own register predicted landing here:

- **A routine binding a technique by parameter reads names its signature cannot declare, and the
  spread across the three arguments is wide.** `readSignature` at
  `src/utils/activity-variables.ts:348-389` collects `{token}` interpolations from a technique's
  protocol blocks, its rules and its artifact filename templates, strips those naming the operation's
  own declared inputs and outputs, and returns the rest as prose-sourced reads. Measured over the
  three arguments, the markdown token sets are:

  | Argument | Tokens in markdown | Declares `## Inputs` |
  |---|---|---|
  | `full-prism::adversarial` | `adversarial_analysis`, `claimed_symbol`, `output_path`, `prior_artifact_paths`, `target_content` | no |
  | `full-prism::synthesis` | `definitive_synthesis`, `output_path`, `prior_artifact_paths`, `target_content` | no |
  | `behavioral-pipeline::synthesis` | `behavioral_synthesis`, `changes_content`, `costs_content`, `errors_content`, `output_path`, `promises_content`, `prior_artifact_paths`, `synthesis_input` | yes, one input |

  Twelve distinct names across the three, and two of them — `output_path` and
  `prior_artifact_paths` — common to all three. Two of the three arguments
  declare no inputs at all, so every name their protocols interpolate is prose-sourced. These tokens
  live in technique markdown, which materialisation cannot rewrite, so the routine's declared
  signature cannot enumerate its own reads — they are a function of the argument. The design already
  prices per-reference-site checking for exactly this family, and this is the measurement of what that
  costs. The guard is green today (`check-activity-variables` reports "OK — every activity declares
  the variables it reads and writes"), so this is a signature-declaration problem for the stage rather
  than a live failure.
- **The stage has no drift baseline, and never did.** `prism/activities` appears **zero** times in the
  census output. The three activities produce no shared window, because a loop signs as its iteration
  type, its collection and its body's signatures, and the bodies differ by the operation. So the one
  mechanical convergence test stages 6 and 8 are graded by does not exist for stage 7, and its
  criterion "The `prism` per-unit passes reference one routine" (`README.md:925`) is a restatement of
  the deliverable rather than a test of it.

**Recommendation: keep stage 7, with its site list intact and three criteria rewritten.** It is the
one of the two stages whose family the graph cannot take, its conversion is the tightest in the plan,
and it is the only stage that exercises the `kind: technique` input the construct needs in order not
to be re-litigated later.

**What its acceptance criteria should say instead:**

- [ ] The three `prism` per-unit passes reference one routine, named by path:
      `prism/activities/02-adversarial-pass.yaml`, `03-synthesis-pass.yaml` and
      `05-behavioral-synthesis-pass.yaml`. Its inputs are the operation (`kind: technique`), the
      prior-paths collection and the mode literal, which are the three values that differ between the
      three sites; the seven-line difference between the first two and the eleven-line difference
      between the first and third are each accounted for by one of the three inputs or by the step
      identifier materialisation supplies.
- [ ] The routine's declared signature covers what the body's own fields name, and each reference
      site's derived contract additionally carries the prose-sourced reads its argument's markdown
      interpolates. The three arguments contribute twelve distinct names between them and two in
      common, so the contract is derived per site by construction and the check says so rather than
      reporting a prose-sourced read as an undeclared input. `check-activity-variables` stays green at
      all three sites over the migrated corpus, which is the test that replaces the drift baseline
      stage 7 has none of.
- [ ] The accumulation stays where the run needs it: the routine's `forEach` body writes
      `all_artifact_paths` and, at the two `full-prism` sites, reads it as `prior_artifact_paths`
      within the same pass. `prism/activities/04-deliver-result.yaml` and `06-generate-report.yaml`
      read `all_artifact_paths` unchanged, so the migration is observable as no change at either. The
      criterion names the accumulation rather than the mechanism, because `set` is documented as
      slated for removal at the next workflow-schema major (`src/schema/activity.schema.ts:27`) and a
      criterion pinned to that field expires with it.
- [ ] The routine reads none of its parameter's outputs, so no bound is declared and none is needed,
      and a routine that does read them fails the load with a message saying why. *(Unchanged from
      `README.md:928-929`; it reproduces against all three arguments — each declares one output and
      the loop body consumes none of them.)*
- [ ] Walked before merge, per the plan's standing criterion. The three sites are reachable by a walk:
      each sits on `prism`'s graph as a plain destination, unlike stage 8's, which sit on no graph at
      all.

---

## Part six — what this re-derivation adds to the plan defect register

Four things, each found while re-deriving rather than carried in.

**A. Stage 8 is blocked by the loader, not by its constituency.** A routine referenced only from
`meta/activities/patterns/` has no reference site under a per-workflow load, because
`loadActivitiesFromDir` (`src/loaders/workflow-loader.ts:72-107`) reads one directory non-recursively
and no `workflow.yaml` carries the explicit borrow. Stage 4's criterion at `README.md:878` therefore
fails the load of every workflow if stage 8 lands. This is the same fact corpus commit `b5471e45`
cited as a reason to delete a file in this directory, so the repository has already reasoned from it
once.

**B. The canon's own instruction for the graph fan now points at an unbound operation.**
`schema-construct-inventory.md:38` tells an author to "Bind `orchestration-patterns::decompose-work-units`
at the source". `grep -rln decompose-work-units workflows` returns one file, and it is that inventory.
The operation's only binding site was `01-orchestrator-workers.yaml`, deleted by `67ac93f0`. The
technique file `meta/techniques/orchestration-patterns/decompose-work-units.md` stands with zero
reference sites. That is a stale-restatement instance in the canon, of the same class as cluster D,
and it is not caused by routines.

**C. Two registered guards state that `meta/activities/patterns/` holds five activity files, and it
holds three.** `scripts/check-loop-shape.ts:126-127` and `scripts/check-set-action-values.ts:160-161`
both carry the comment "Recursive, because activity definitions also sit a level down —
`meta/activities/patterns/` holds five, and a flat read leaves them unscanned". The recursion is
right and the count is two out of date. These two guards are also the reason any guard sees stage 8's
sites at all.

**D. `05-behavioral-synthesis-pass` is the one member of stage 7's family a fan could structurally
reach, and converting it would move a name two activities read.** It is the only one of the three not
in a two-fan chain and the only one that does not read the accumulator it writes. Under a fan its
`all_artifact_paths` write lands in `behavioral_synthesis_pass_outputs` slot by slot rather than at
the bare name (`scatter-gather.md` rule `isolation-then-combine`;
`src/tools/workflow-tools.ts:876`), so `06-generate-report.yaml:7` and `04-deliver-result.yaml:7`
would read a name nothing writes. The blockers on the other two are structural; the blocker on this
one is a contract change with two named readers. Worth recording because an implementer looking for
the cheapest fan conversion in `prism` will find this one first, and it is the one whose cost is
invisible in the activity file.

---

## Re-taking these figures

    cd /home/mike1/projects/dev/workflow-server

    # revisions
    git log -1 --format='%H %s'
    git -C workflows log -1 --format='%H %s'
    git -C workflows log --oneline 2b8b7215..HEAD | wc -l          # 28

    # the two deletions, with their reasons
    git -C workflows log --format='%H %s' --diff-filter=D -- meta/activities/patterns/01-orchestrator-workers.yaml
    git -C workflows log --format='%H %s' --diff-filter=D -- meta/activities/patterns/04-isolated-fan-out.yaml
    git -C workflows log -1 --format='%B' 67ac93f0
    git -C workflows log -1 --format='%B' b5471e45

    # the run's population
    grep -rn 'orchestration-patterns::compose-worker-briefs' --include=*.yaml workflows
    grep -rn 'orchestration-patterns::synthesise-results' --include=*.yaml workflows
    grep -rn 'orchestration-patterns::dispatch-workers' --include=*.yaml workflows | wc -l    # 11

    # the census, and the one fan-out window in it
    python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py --root workflows

    # the prism trio
    diff workflows/prism/activities/02-adversarial-pass.yaml workflows/prism/activities/03-synthesis-pass.yaml
    diff workflows/prism/activities/02-adversarial-pass.yaml workflows/prism/activities/05-behavioral-synthesis-pass.yaml
    grep -c '^  - kind:' workflows/prism/activities/0[235]-*.yaml
    grep -rc 'loopType: forEach' --include=*.yaml workflows | grep -v ':0'                    # 26 sites

    # gates, graph positions, validation coverage
    grep -c 'kind: checkpoint' workflows/meta/activities/patterns/0[25]-*.yaml workflows/prism/activities/0[235]-*.yaml
    grep -rn 'patterns/' --include=workflow.yaml workflows                                    # nothing
    npx tsx scripts/validate-activities.ts | tail -2                                          # 129 passed
    npx tsx scripts/check-activity-variables.ts 2>&1 | tail -1                                # OK

    # the criteria's absent subjects
    grep -rln 'dispatch_concurrency' workflows                                                # nothing
    grep -rln 'parallelism-is-optimisation' workflows src                                     # nothing
    grep -rln 'decompose-work-units' workflows                                                # the inventory only

Measured against the [routines proposal](../2026-09-03-routines/README.md) stages 7 and 8, the
[verified sweep outcome](../2026-09-10-routines-sweeps/README.md) plan defects 1 and 2, and the four
verifications that reached them independently:
[canon-rules](../2026-09-10-routines-sweeps/verification/canon-rules.md) P1 and P2,
[corpus-vocabulary](../2026-09-10-routines-sweeps/verification/corpus-vocabulary.md) PD1, CV18 and
CV19, [design-itself](../2026-09-10-routines-sweeps/verification/design-itself.md) PD2, and
[completeness](../2026-09-10-routines-sweeps/verification/completeness.md).
