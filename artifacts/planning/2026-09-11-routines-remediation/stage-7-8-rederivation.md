# Stages 7 and 8, re-derived from the corpus

> Item 1 of the routines remediation · server `fe5f5f78`, corpus `e9d26007`
> Subject: the [routines proposal](../2026-09-03-routines/README.md) stages 7 and 8, against the
> [verified sweep outcome](../2026-09-10-routines-sweeps/README.md) and its plan defects 1 and 2

The last two stages of the routines plan each take a family of repeated steps and make it one
parameterised body. Stage 7 takes three analysis passes in the `prism` workflow and needs a new kind
of routine input, one whose argument is a technique reference. Stage 8 takes a four-step dispatch run
in the borrowable pattern library and needs nothing the construct does not already give it. Both were
costed against a corpus that has since changed, and the change is the arrival of a competing
construct: a graph destination that names one activity together with the collection to run it over,
and opens one worker per element of that collection.

**The two stages come out of this in opposite directions, and the discriminator that separates them
is one the corpus states in its own words rather than anything about routines.** The corpus draws a
line between work that is several units inside one worker's context and work that is one whole
activity per unit, and it draws that line three times: in the pattern library's README, in the
construct inventory, and — since the fan landed — in the rule the dispatch operation itself carries.
Stage 8's constituency was four occurrences of one run. The graph took two of them by deletion, and
the two it took are exactly the two whose work is an activity per unit. The three occurrences that
survive are the ones whose work is several units inside one worker, which is the grain the graph
declines to serve. Stage 7's three activities look like precisely what the graph just replaced, and
five independent measurements say they are not: their collection's elements carry no `id`, so the
fan-enter refuses them outright; their chain would need a second fan where a branch's exit is
forbidden to fan; two of the three read, on each iteration, the accumulator the previous iteration
wrote, which a fan lands in separate slots instead; their declared iteration bound is twenty-five
times the server's fan ceiling; and three of the four scopes that produce their collection produce a
single element.

So the answer to the question this re-derivation was set is: **the graph owns nothing that either
stage still names.** What is wrong with both stages is that each is graded by a criterion naming
things that are not there — two deleted files, a variable deleted from the corpus, a rule deleted
from the corpus, and a drift baseline that never covered stage 7 at all.

---

## The tree this is derived against

| | Revision | Note |
|---|---|---|
| Server tooling | `fe5f5f78` on `main` | 92 commits past `ee95e4cd`, the revision the task names. The guard scripts have moved from `scripts/` to `guards/`; no source relevant here changed |
| Corpus | `e9d26007` on the `workflows` branch | 38 commits past `a4a5d88b`, which the completeness pass measured. `ea57b72e` re-nested every product definition under `corpus/`, so live paths read `corpus/meta/...` where the sweeps read `meta/...` |

The re-nesting is a path change and nothing else, which matters because it would otherwise look like
movement under the subject. `git diff --stat a4a5d88b..HEAD` over the three surviving pattern
activities, the thirteen `prism` activities and the construct inventory reports **18 files changed, 0
insertions, 0 deletions** — every one a pure rename. So the completeness pass's readings on these
files carry forward to the digit.

The construct is still unbuilt, which is what makes both stages re-derivable rather than remediable.
`StepSchema` is a discriminated union of four members (`src/schema/activity.schema.ts:167-172`), and
`find … -type d -name routines` over the whole corpus returns nothing.

---

## Part one — the four readings, re-measured

Each of these came from an earlier pass. I re-took all four from the repository rather than carrying
them.

### Two of stage 8's four reference sites are gone

Stage 8's second acceptance criterion names "Four reference sites: `01-orchestrator-workers`,
`04-isolated-fan-out`, `05-lead-researcher` and the follow-up loop inside it"
([proposal README:936-938](../2026-09-03-routines/README.md)). `ls corpus/meta/activities/patterns/`
returns four entries: `02-supervisor.yaml`, `03-plan-and-execute.yaml`, `05-lead-researcher.yaml` and
`README.md`.

`git log --diff-filter=D` over the two old paths names the deleting commits:

| File | Lines when deleted | Commit | Subject |
|---|---|---|---|
| `meta/activities/patterns/01-orchestrator-workers.yaml` | 55 | `67ac93f0`, 2026-09-10 10:27 | Retire the pattern activity the graph fan replaces |
| `meta/activities/patterns/04-isolated-fan-out.yaml` | 65 | `b5471e45`, 2026-09-10 10:34 | Retire the isolation pattern nothing could reach |

This settles a disagreement inside the sweeps folder in the completeness pass's favour.
`verification/canon-rules.md:57` attributes the first deletion to `f6cb1dc2`; the completeness pass
corrects it to `67ac93f0`, and `--diff-filter=D` gives `67ac93f0`.

**The reason for the deletions is the load-bearing part, and both commit messages state it.**
`67ac93f0`: "The orchestrator-workers pattern was decompose, compose briefs, dispatch, gather,
synthesise — and nothing else. That is what a destination naming one activity and the collection to
run it over now does, with each unit in a worker of its own, holding its own frontier entry,
container slot and identity." `b5471e45`: "Isolated fan-out was the same … chain as the pattern the
graph fan replaced, distinguished by one input a caller had to seed. No workflow borrowed it, no
activity anywhere set that input." Both also say what the fan does *not* cover — a worker-owned
checkout, and re-dispatch after a synthesis — and those two exceptions are what the survivors are.

### A fifth occurrence at a file the design never names

`meta/activities/patterns/02-supervisor.yaml` holds the same four operations in the same order with
one step between the third and the fourth. `grep -rn "supervisor"` over the thirteen records of the
proposal folder returns nothing: the word appears nowhere in the proposal or its companions. The
file is not new — it is present at the sweeps' baseline `2b8b7215` and at every revision since.

### Five occurrences across four files at the baseline, three across two files now

I resolved every technique binding in every activity file and counted maximal windows over the
four-operation family `orchestration-patterns::compose-worker-briefs`, `::dispatch-workers`,
`::gather-results`, `::synthesise-results`, recursing into loop bodies as sequences of their own and
allowing one intervening step to be reported rather than to end a window.

Against the sweeps' baseline, extracted with `git archive 2b8b7215`:

| Occurrence | Shape | What it binds differently |
|---|---|---|
| `01-orchestrator-workers.yaml` | contiguous, after `decompose-work-units` | `gather` binds `expected_ids: work_units` |
| `02-supervisor.yaml` | **interrupted** — an `announce-escalation` action between `gather` and `synthesise` | `gather` binds `expected_ids: worker_briefs` |
| `04-isolated-fan-out.yaml` | **interrupted** — a `require-complete` validate action between `gather` and `synthesise` | `compose-briefs` carries `isolation_mode: isolation_mode` |
| `05-lead-researcher.yaml`, top level | contiguous, after `plan-research-questions` | `gather` binds `expected_ids: work_units` |
| `05-lead-researcher.yaml`, `gap-followup` loop body | contiguous, step ids suffixed `-followup` | `gather` binds `expected_ids: work_units` |

**Five occurrences across four files, two of them interrupted by an `action` step** — reproduced
exactly. So the proposal's "four occurrences of one run" (README:776) does not reproduce, and neither
does the sweep's correction to "three occurrences plus one variant".

Against the live tree the same instrument reports **three occurrences across two files**: the two
deleted files took two occurrences with them. Nothing else in the corpus holds the run. Two other
files hold windows that share one or two steps with it — `cicd-pipeline-security-audit/activities/
03-primary-scan.yaml` and `substrate-node-security-audit/activities/03-primary-audit.yaml` each run
`dispatch-workers` several times under a different compose — but their compose operations are
`dispatch-scanners::*` and `dispatch-sub-agents::*`, so they are a different run and not members of
this one.

The proposal's own census instrument agrees from the other direction.
`measure/repeated-runs.py --root corpus` reports **24 maximal shared windows, 19 top level and 5
nested**, against **26 (21 and 5)** at the baseline. At the baseline the fan-out family appears at two
cross-file window sizes: a four-step window over `01-orchestrator-workers` and `05-lead-researcher`,
and a three-step window over those two plus `02-supervisor`. Live, the four-step window is gone
entirely and the only cross-file fan-out window left is

```
  3 steps, 2 activities
    meta/activities/patterns/02-supervisor.yaml
    meta/activities/patterns/05-lead-researcher.yaml
      T:orchestration-patterns::compose-worker-briefs()
      T:orchestration-patterns::dispatch-workers()
      T:orchestration-patterns::gather-results(expected_ids)
```

The 24 figure is also stage 1's, and it reproduces the completeness pass's correction of the
proposal's stated 26.

### Stage 7's three passes are still one iteration over a collection reached as a single destination

All three are 41 lines. All three have exactly one top-level step: a `forEach` loop over
`analysis_units` with `maxIterations: 100`, whose body is exactly one technique step. The graph
reaches each of them by a plain string destination (`corpus/prism/workflow.yaml:51-60`):
`structural-pass` exits `full-prism` to `adversarial-pass` and `behavioral` to
`behavioral-synthesis-pass`; `adversarial-pass` exits `done` to `synthesis-pass`; `synthesis-pass`
and `behavioral-synthesis-pass` each exit `done` to `generate-report`. No instance fan anywhere in
the file.

Measured corpus-wide, exactly **five activities** have a single top-level step that is a loop. Four
iterate `analysis_units` and all four are in `prism`: the three stage 7 names, plus
`01-structural-pass.yaml`, whose body is seven steps rather than one and which is the activity that
feeds them. The fifth, `corpus/ponytail/activities/02-apply-ladder.yaml`, is a `doWhile` with no
collection at all.

---

## Part two — stage 8, every surviving occurrence

The run is compose briefs, dispatch, gather, synthesise. Three occurrences survive, in two files. A
run occurring twice in one file counts twice, and `05-lead-researcher.yaml` is that file.

### Site A — `corpus/meta/activities/patterns/02-supervisor.yaml:42-62`

```yaml
  - kind: technique                                            # :42-44
    id: compose-brief
    technique: orchestration-patterns::compose-worker-briefs
  - kind: technique                                            # :45-47
    id: dispatch
    technique: orchestration-patterns::dispatch-workers
  - kind: technique                                            # :48-53
    id: gather
    technique:
      name: orchestration-patterns::gather-results
      inputs:
        expected_ids: worker_briefs
  - kind: action                                               # :54-59  ← the interruption
    id: announce-escalation
    when: lane_id == 'escalate'
    actions:
      - action: message
        message: "Supervisor escalation — no lane matched. Rationale: {classification_rationale}"
  - kind: technique                                            # :60-62
    id: synthesise
    technique: orchestration-patterns::synthesise-results
```

**What interrupts it.** A gated `message` action between `gather` and `synthesise`, firing only when
classification found no lane. It is the site's own business and belongs to the referring activity,
not to the run.

**What it binds differently.** `gather` takes `expected_ids: worker_briefs` where both other sites
take `work_units`. `gather-results` declares `expected_ids` as "either a string id or an object with
an `id` field (e.g. `{work_units}` or `{worker_briefs}` bound by name)"
(`corpus/meta/techniques/orchestration-patterns/gather-results.md:16-20`), so the two spellings are
alternative arguments to one parameter rather than a structural difference. Its preceding step is
`classify` binding `orchestration-patterns::classify-request` (`:39-41`), which is outside the run.

**Its width is one, by the activity's own declarations.** `work_units` is described as "The selected
lane as a one-element ordered array" (`:20-22`) and `worker_briefs` as "The selected lane's brief as
a one-element ordered array" (`:23-25`). A supervisor classifies onto exactly one lane and dispatches
exactly that lane.

### Site B — `corpus/meta/activities/patterns/05-lead-researcher.yaml:41-55`

Contiguous: `compose-briefs` (`:41-43`), `dispatch` (`:44-46`), `gather` with
`expected_ids: work_units` (`:47-52`), `synthesise` (`:53-55`). Preceded by `plan-questions` binding
`orchestration-patterns::plan-research-questions` (`:38-40`) and followed by `assess-gaps` binding
`::assess-research-gaps` (`:56-58`). Nothing interrupts it. Nothing is bound differently from site C
except the step ids.

### Site C — `corpus/meta/activities/patterns/05-lead-researcher.yaml:70-84`

The same four steps inside the `gap-followup` loop (`:59-87`), a `while` on
`has_research_gaps == true` with `maxIterations: 3`. Step ids carry a `-followup` suffix:
`compose-followup-briefs` (`:70-72`), `dispatch-followup` (`:73-75`), `gather-followup` with
`expected_ids: work_units` (`:76-81`), `synthesise-followup` (`:82-84`). Followed inside the loop by
`reassess-gaps` (`:85-87`). Nothing interrupts it, and it binds nothing differently from site B.

### What the three occurrences cost, and what a routine would absorb

Counted as the step text itself, the run is 15 lines at each site and **45 lines across the three**.
Of the values those 45 lines carry, exactly one varies: `expected_ids`, at one site of three.

The signature would absorb more than the steps. Grouping every write declaration at the two host
files on its whole body with sorted keys, three names are byte-identical across them —
`dispatched_results`, `gathered_results` and `combined_synthesis` — giving **six declarations in
three identical pairs**. Two more names appear at both files and disagree: `work_units` and
`worker_briefs`, each carrying a domain-specific description. The remaining three declarations belong
to one host each (`lane_id` and `classification_rationale` at the supervisor,
`has_research_gaps` at the lead researcher).

Two facts bound what any of this is worth. Neither host file is in any workflow's graph, and no
`workflow.yaml` in the corpus borrows either: the loader walks an activities directory with one
non-recursive `readdir` (`src/loaders/workflow-loader.ts:73-76`), and the pattern directory's own
README states the consequence as design — "They are **not** part of meta's lifecycle graph
(`loadActivitiesFromDir` is non-recursive — this subdirectory is library-only)"
(`corpus/meta/activities/patterns/README.md:5`). Running `guards/validate-activities.ts` reports
**129 passed, 0 failed** against **132 activity files** on disk; the three it never sees are the
three surviving pattern activities. So the whole of stage 8's remaining constituency sits in files
that nothing validates and nothing runs.

---

## Part three — stage 7, the three per-unit passes

All three files are 41 lines, and each is the same seven-part skeleton: an `id`, `name` and
`description`; a `reads` list and two write declarations; a `techniques: [scatter-gather]` line; one
`forEach` loop over `analysis_units` carrying `variable: current_unit` and `maxIterations: 100`; one
technique step in its body, binding `target_content: "{current_unit.target}"` and a prior-paths
collection, carrying an accumulating `set` action on `all_artifact_paths` and a `when` gate on
`current_unit.pipeline_mode`; and a single default `done` exit.

| Activity | Operation bound | Prior-paths input | Body-step gate |
|---|---|---|---|
| `corpus/prism/activities/02-adversarial-pass.yaml:19-38` | `full-prism::adversarial` | `all_artifact_paths` (`:33`) | `current_unit.pipeline_mode == 'full-prism'` (`:38`) |
| `corpus/prism/activities/03-synthesis-pass.yaml:19-38` | `full-prism::synthesis` | `all_artifact_paths` (`:33`) | `current_unit.pipeline_mode == 'full-prism'` (`:38`) |
| `corpus/prism/activities/05-behavioral-synthesis-pass.yaml:19-38` | `behavioral-pipeline::synthesis` | `behavioral_output_paths` (`:33`) | `current_unit.pipeline_mode == 'behavioral'` (`:38`) |

**What differs, measured.** `diff 02 03` reports **5 hunks and 7 changed lines**: `id`, `name`,
`description`, the loop's `id`, the loop's `name`, the step `id` and the technique reference. This
settles a second disagreement inside the sweeps folder — `verification/corpus-vocabulary.md` CV16
says seven and `verification/design-itself.md:1167` says eight, and the count is seven.
`diff 02 05` reports **8 hunks and 11 changed lines**: the same seven, plus `version`, the `reads`
list (`behavioral_output_paths` for `all_artifact_paths`), the technique's prior-paths argument and
the gate's value.

So the three declared inputs the proposal names for the routine — the operation, the prior-paths
collection and the pipeline mode (README:925-927) — are exactly the three fields that vary and that
are not identifiers. Every structural field agrees across all three.

**What the graph does with each.** Nothing that resembles a fan. Each is a plain destination in
`corpus/prism/workflow.yaml`. And the three are chained: `adversarial-pass` leads to
`synthesis-pass`, which leads to `generate-report`, so the second pass consumes what the first wrote.

**What the stage-1 drift guard sees of them: nothing.** The census requires a window of two or more
consecutive steps (`measure/repeated-runs.py:40`, `MIN_WINDOW = 2`). Each pass has one top-level step
and one body step, so no window of two exists anywhere in any of them. Grepping the census output for
`full-prism`, `adversarial`, `synthesis-pass` or `analysis_units` returns zero lines. Stage 7 is
invisible to the only mechanism the plan has for grading a convergence.

---

## Part four — the discriminators, applied

The canon states four tests, and each is decidable from the repository rather than by judgement.

### One — a unit inside one worker, or an activity per unit

The corpus says this in three places, and all three are live.

`corpus/meta/activities/patterns/README.md:9`: "Running units together is the graph's layer: bind the
exit that reaches the per-unit activity to a destination naming that activity and the collection to
run it over … Reach for a pattern activity when the units are cheap enough to sit in one worker's
context, and for the graph fan when each unit is worth a whole delivery of its own."

`corpus/workflow-design/resources/schema-construct-inventory.md:38` routes "orchestrator-workers /
fan-out then consolidate" to **Graph, an instance fan**, and closes with the alternative: "Work units
inside ONE worker are the other grain: a `forEach` loop step over the same collection, which pays one
delivery rather than N." `:41` routes "subagent-isolation / each unit its own commit" to a fan whose
activity binds `create-worktree`.

And the dispatch operation itself now carries the rule. `dispatch-workers` is at version 2.0.0 and
declares `one-worker-at-a-time`
(`corpus/meta/techniques/orchestration-patterns/dispatch-workers.md:30-32`): "Briefs are dispatched
one after another, in the calling worker's own turn. Running work units together is the graph's
business … That route gives each unit its own frontier entry, its own slot in the branch container
and its own identity, none of which a worker dispatching from inside its own turn can offer."

**This is the finding that decides stage 8.** The run stage 8 converts is, by the bound operation's
own current rule, sequential dispatch inside one worker. It is not a degraded fan awaiting
replacement; it is the other grain, and the operation names the fan as the place the other grain
lives. The commit that put the rule there, `a904da93` "Work a pattern's units one at a time and leave
the batch to the graph", says it plainly: "The corpus has two scatter modes: a worker iterating its
units, and a graph destination that fans. dispatch-workers is the first."

For stage 7 the same test cuts the other way on its face — three `prism` activities whose whole
content is an iteration — which is exactly why the remaining three tests matter.

### Two — does anything accumulate across iterations

A fan lands each branch's outputs in a slot of its own under a key derived from the activity id
(`src/schema/workflow.schema.ts:144`, `branchKey`), and the loader contributes that container to the
workflow's variables as an array, "one slot per branch in collection order"
(`src/utils/activity-variables.ts:151-158`). A name several branches write is therefore not one
accumulated value; reading it whole and handing it to a gather is the prescribed form.

At **stage 8's three sites, nothing accumulates.** `dispatched_results`, `gathered_results` and
`combined_synthesis` are each written once per run of the four steps, and the loop at site C re-runs
the whole run rather than accumulating within it.

At **stage 7, two of three accumulate and one does not.** In `02-adversarial-pass.yaml` and
`03-synthesis-pass.yaml` the technique's `prior_artifact_paths` input and the step's `set` target are
the same name, `all_artifact_paths` (`:33` and `:36` in both files), so iteration N+1's input
contains what iteration N wrote. In `05-behavioral-synthesis-pass.yaml` the input is
`behavioral_output_paths` and the target is `all_artifact_paths`, so its iterations are independent
of one another.

The corpus has already worked an accumulator of exactly this kind through the substitution, and the
result is instructive. `midnight-system-review/activities/03-evidence-probes.yaml` set an accumulator
to `[]`, looped `investigation_areas` binding one per-area probe, and bound one consolidation
operation after it — the shape `higher-order-routines.md:134-139` identified as "the canonical
sequential scatter-gather in full" and "the shape a scatter-gather routine would have, waiting for a
second referrer". Commit `00918abe` "Fan the system review's evidence probes from the graph" converted
it: the loop is gone, the per-unit work is a one-step activity `04-probe-area.yaml`, the graph fans it
over `investigation_areas` (`corpus/midnight-system-review/workflow.yaml:59-63`), and
`05-consolidate-evidence.yaml:21-25` reads the container `probe_area_outputs` and hands it to
`gather-results` as `dispatched_results`. The commit message names the price exactly: "Consolidation
reads the container rather than an accumulator … The probe operation emits its area's record instead
of appending to a list its siblings are also writing."

That is the third time the corpus has performed this substitution. Two of the three took a pattern
activity; the third took the one non-pattern site the proposal itself had identified. So the
substitution is live policy, and the question for stage 7 is whether its three sites can take it.

**They cannot as written, because `all_artifact_paths` is read as a flat name outside them.**
`corpus/prism/activities/04-deliver-result.yaml:7` and `06-generate-report.yaml:7` both read it, as
do `prism-evaluate/activities/03-consolidate-report.yaml:7` and `04-deliver-results.yaml:7`. Under a
fan those readers would see only what the non-fanned activities wrote, and a gather at the
convergence would have to rebuild the name. That is a workflow-spanning change and not a routing one.

### Three — is a gate reachable

The load refuses a checkpoint inside a fanned activity: "A session holds one outstanding decision at
a time, and every tool call is gated while it is held, so a gate inside a fan stops its sibling
branches" (`src/loaders/workflow-loader.ts:795-806`, with the instance-fan remedy at `:802` reading
"Every instance of a fanned activity runs the same definition, so there is no instance to take out of
the fan").

`grep -c "kind: checkpoint"` gives **0** at `02-supervisor.yaml`, **0** at `05-lead-researcher.yaml`,
and **0** at each of the three `prism` passes. So the rule does not fire at any of the five subject
files, and the earlier reading that "stages 7 and 8 move no gate at all" holds on the survivors.

One adjacency is worth recording because it is the only checkpoint in the directory:
`03-plan-and-execute.yaml` declares **1**, its hard `plan-confirmed` gate, and it is the one pattern
activity no record in either folder names. It holds none of the fan-out run, so it is not stage 8's
business, but it is why the directory cannot be treated as uniformly fannable.

The step gates at stage 7 survive either home — each instance of a fanned activity would evaluate
`current_unit.pipeline_mode` against its own element, just as each iteration does — but they change
what they cost, which is the next test.

### Four — the arithmetic of delivery

The canon states the cost in the schema: "Each instance beyond the first costs a whole further
delivery of this activity" (`src/schema/workflow.schema.ts:70`), and the server repeats it in the
refusal message when a destination is too wide (`src/tools/workflow-tools.ts:864`). The ceiling is
`DEFAULT_FAN_MAX_BRANCHES = 4` (`src/config.ts:184`), env-overridable within `[2, 100]`
(`src/config.ts:629`); `maxInstances` on a destination only narrows it.

**For stage 8**, the arithmetic is not reached, because there is no graph to put a fan in: neither
host is in a workflow graph and neither is borrowed. A borrower who wanted a fan would build it in
its own graph over its own activity, which is what the pattern README already tells it to do
(`:9`) — and the supervisor's collection is one element by construction, which the schema calls out
as not a fan at all: `maxInstances` has a minimum of 2 carrying the message "a fan admits at least
two instances; an exit that leads to one run of one activity names that activity"
(`src/schema/workflow.schema.ts:66-68`).

**For stage 7**, the arithmetic refuses the fan three separate ways.

1. **The collection's elements carry no `id`.** The fan-enter resolves an id per element and throws
   otherwise: "each element is a slug string or an object carrying a string 'id'"
   (`src/tools/workflow-tools.ts:836-847`) — the id naming the container slot, the gather's manifest
   row and the artifact filename. `analysis_units` elements are
   `{ target, target_type, pipeline_mode, lens_name, lenses, role, risk, rationale, unit_output_subdir }`
   (`corpus/prism/techniques/plan-analysis.md:142-145`). There is no `id`. A fan over
   `analysis_units` fails at run time on its first element.
2. **The declared iteration bound is twenty-five times the ceiling.** All three loops declare
   `maxIterations: 100`; the server's default fan ceiling is 4, and the hard env ceiling is 100. A
   collection the loop admits refuses the fan-enter from its fifth element.
3. **The modal collection is one element.** Three of the five scope classes produce a single-element
   array — "For query and file scopes: produce a single-element array. For module scope: produce a
   single-element array with the module path as target" — and only codebase and document-set scopes
   produce one element per module (`corpus/prism/techniques/plan-analysis.md:146-148`). A fan of one
   pays a whole further delivery to save nothing.

And a fourth, structural: **the chain admits only one fan.** A branch's exit may not itself fan — "A
branch runs in one worker and returns to the join, so each of its exits names one destination"
(`src/loaders/workflow-loader.ts:778-784`). `adversarial-pass` leads to `synthesis-pass`. Fanning the
first makes the second its join, and the join is entered once; fanning the second as well needs an
activity between them to converge on, and `corpus/prism/workflow.yaml` has none. Stage 7's
constituency is a chain of two fans with no join between them.

---

## Part five — the verdicts

### Stage 8 — the fan-out routine

**Which sites remain: three occurrences in two files.**
`corpus/meta/activities/patterns/02-supervisor.yaml:42-62`,
`corpus/meta/activities/patterns/05-lead-researcher.yaml:41-55`, and
`corpus/meta/activities/patterns/05-lead-researcher.yaml:70-84`.

**Does the stage still have a constituency: yes, and the graph is not competing for it.** All four
discriminators point the same way. The dispatch operation's own rule says its briefs run one at a
time inside the calling worker and sends the other grain to the graph. Nothing accumulates across
occurrences. No gate is present at either host, so no fan rule is engaged. The supervisor's
collection is one element by declaration, and the lead researcher's re-dispatch after a synthesis is
the one thing the canon says a fan cannot do — stated twice, at
`schema-construct-inventory.md:42` and at `patterns/README.md:67`: "The loop is what the pattern is
for; a fan opens once and cannot re-dispatch after a synthesis."

**But it is the smallest constituency in the plan, and it cannot be graded by the mechanism the
stage names.** 45 lines of step text at three sites, of which one value varies, in two files that
nothing validates and no graph reaches. Two of the three occurrences are in one file, and the census
method keeps only windows appearing in two or more activity *files*, so the intra-file pair is
invisible to the stage-1 guard by construction — a fact the proposal already concedes
(README:941-942) and then grades itself against anyway.

**What the acceptance criteria should say.** Replace all four bullets.

- [ ] The routine declares ordinary inputs and no `kind: technique` parameter, and its contract
      derives in isolation. *(Unchanged. Confirmed: the only value that varies across the three
      occurrences is `expected_ids`, which `gather-results` declares as an ordinary input taking
      either an id list or an object list.)*
- [ ] **Three reference sites, all in the borrowable pattern library: the supervisor's run, the lead
      researcher's first round, and the same run inside its `gap-followup` loop. The supervisor's
      `announce-escalation` action stays with the referring activity, being a site condition on the
      site's own `lane_id`, and the record says so.** *(Replaces the four named sites, two of which do
      not exist, and replaces the `04-isolated-fan-out` completeness-`validate` disposition, which
      concerns a file with no content to dispose of.)*
- [ ] **The routine declares no concurrency and no dispatch mode, and the record states that this is
      already true of the corpus rather than a property the routine adds.** *(Replaces the criterion
      naming `dispatch_concurrency` and `parallelism-is-optimisation`. Both are at **zero sites**:
      `grep -rn` over the whole corpus returns nothing for either, and nothing for either in `src/`,
      `guards/` or `docs/`. The variable was deleted by `a904da93` — "The concurrency parameter goes
      with it, from the shared contract, from the four pattern activities that read or set it" — and
      the rule by `5731b063` "State the two scatter modes and where a branch lands".)*
- [ ] **The three occurrences become one body. The three-step cross-file window at
      `02-supervisor.yaml` and `05-lead-researcher.yaml` leaves the stage-1 guard's report, and the
      guard's total falls by that window and by no other. The two occurrences inside
      `05-lead-researcher.yaml` are checked by reading the file, because no guard in the suite
      compares two runs within one file.** *(Replaces "falls by the fan-out windows and by nothing
      else". At the tree there is exactly one such window, not several, and the intra-file pair
      cannot contribute to a falling baseline because it never entered one.)*
- [ ] Walked before merge, per the criterion that applies to every stage changing a live site.
      *(Unchanged in wording, weaker in force: neither host is reached by any workflow graph, so
      "walked" here means the corpus guard suite and a read, not a session.)*

**One obligation the stage now inherits.** Converting both hosts is the only safe scope. Converting
`05-lead-researcher` alone leaves the corpus with a routine holding the run and `02-supervisor`
holding an inline copy of four fifths of it, and nothing in the guard suite compares an inline run
against a routine declaration — the coverage gap the fragment guard's `inline-duplicate-of-fragment`
rule covers today and that the migration retires.

### Stage 7 — the technique parameter

**Which sites remain: all three, unchanged.**
`corpus/prism/activities/02-adversarial-pass.yaml:19-38`,
`03-synthesis-pass.yaml:19-38` and `05-behavioral-synthesis-pass.yaml:19-38`. None was deleted, none
moved, and `git diff a4a5d88b..HEAD` reports zero content change across all thirteen `prism`
activities.

**Does the stage still have a constituency: yes, and the graph does not own it.** The resemblance to
what the fan replaced is real at the level of shape and false at the level of every mechanism. The
collection's elements have no `id`, so the fan-enter throws. The loop's declared bound is 100 against
a fan ceiling of 4. Three of five scopes produce a one-element collection. Two of the three passes
read across iterations the accumulator a fan would split into slots, and that accumulator is read as
a flat name by four activities in two workflows. And the chain `adversarial-pass → synthesis-pass`
admits one fan, not two, because a branch's exit cannot fan and there is no join activity between
them.

**What it is worth is a separate question, and it is small.** The three files are 41 lines each and
differ in 7 and 11 lines. The routine needs a schema field the rest of the plan does not, and makes
three of the construct's guarantees conditional — contract-derivable-in-isolation,
walkable-from-declared-inputs, artifact-check-once-per-routine (README:410-414). Against that, the
stage-1 guard cannot see the family at all, so the plan has no mechanical evidence the stage
converged anything.

**What the acceptance criteria should say.** Five of the eight stand. The sixth needs its
constituency re-stated with the measurements behind it, and two need the grading fixed.

- [ ] An input declares `kind: technique`, its argument is a technique reference, and substitution
      into a body step's `technique:` field happens before the contract derivation. *(Unchanged, and
      it inherits plan defect 3: the derivation the ordering is stated against has two call sites and
      the loader is neither.)*
- [ ] A body step whose `technique:` is a parameter declares its own `id`. *(Unchanged. All three
      body steps already do — `run-adversarial`, `run-synthesis`, `run-behavioral-synthesis`.)*
- [ ] The three per-site checks run once per reference site, and a routine binding no technique by
      parameter keeps the once-per-routine path. *(Unchanged.)*
- [ ] The three guarantees are restated as holding except for routines binding a technique by
      parameter. *(Unchanged.)*
- [ ] The walker's routine-level entry walks such a routine per reference site. *(Unchanged, and it
      inherits the unswept finding that the routine-level entry has no entry point.)*
- [ ] **The three `prism` per-unit passes reference one routine. Its inputs are the operation, the
      prior-paths collection and the mode value — the three fields the 5-hunk `02`/`03` diff and the
      8-hunk `02`/`05` diff show varying, with every structural field agreeing. The accumulating
      `set` on `all_artifact_paths` stays inside the routine, and the record states that this keeps
      the name flat, which is what its four cross-activity readers in two workflows require.**
      *(Replaces the bare criterion with the measurement, and names the accumulator's readers, which
      are what make it a routine's job rather than a graph fan's.)*
- [ ] The routine reads none of its parameter's outputs, so no bound is declared and none is needed.
      *(Unchanged. Confirmed: the pass writes artifacts and appends paths through an action the
      routine owns; no step reads the bound operation's declared output.)*
- [ ] **The record states why a graph instance fan is not the home, naming the four refusals: the
      collection's elements carry no `id` and the fan-enter throws on the first; the loop's declared
      bound of 100 against a fan ceiling of 4; the accumulator two of the three read across
      iterations and four activities read flat; and `adversarial-pass → synthesis-pass` admitting one
      fan because a branch's exit cannot fan and no join sits between them. Convergence is graded by
      reading the three files, because the stage-1 guard's minimum window of two consecutive steps
      means it never reported this family and its baseline cannot fall by it.** *(New. It replaces
      nothing, because the stage had no such criterion, and it is what plan defect 2 asked for.)*

**Where this leaves the routines stage: neither deleted nor deferred.** Stage 7 stands, narrowed to
what it was always about — a run that differs only in the operation it binds — with the graph
explicitly excluded on measured grounds rather than by silence. The one thing to reconsider is
sequencing, not existence: stage 7 is the only stage that adds a schema field for three sites in one
workflow, and it is the only stage the drift guard cannot grade, so it is the cheapest stage to run
last and the most expensive to run early.

---

## Part six — what this adds to the plan defect register

| # | Defect | Stage |
|---|---|---|
| a | The acceptance criterion names two files that no longer exist, and a completeness-`validate` disposition for a file with no content | 8 |
| b | `dispatch_concurrency` and `parallelism-is-optimisation` are both at zero sites, in the corpus and in the server. The corpus deleted the variable at `a904da93` and the rule at `5731b063` | 8 |
| c | Two of the three surviving occurrences are in one file, and the census method the stage is graded by keeps only windows spanning two or more files | 8 |
| d | The whole surviving constituency is in files no graph reaches and no guard validates — 129 of 132 activity files validate, and the three that do not are these | 8 |
| e | The stage-1 guard never reported stage 7's family, because a window needs two consecutive steps and each pass has one. The stage has no mechanical convergence evidence at all | 7 |
| f | The `all_artifact_paths` accumulator is read as a flat name by four activities across two workflows, which is what keeps stage 7 a routine question rather than a routing one — and the proposal never names those readers | 7 |
| g | Two documents in the sweeps folder disagree on the `02`/`03` changed-line count (seven against eight) and on which commit deleted `01-orchestrator-workers.yaml`. The repository gives seven and `67ac93f0` | 7, 8 |

Two earlier claims are corrected here rather than carried. `verification/canon-rules.md:134` states
that "the run stage 8 exists to name now occurs at exactly two places, both inside one file"; it
occurs at **three** places in **two** files, the supervisor's being the third, and the same document
establishes that third occurrence two paragraphs later at its own P2. And
`verification/design-itself.md:1167` gives eight changed lines between `prism` `02` and `03`; `diff`
gives seven, which is also what `verification/corpus-vocabulary.md` CV16 reports.

---

## Re-taking these figures

From the corpus worktree root (`corpus/` is the definitions root since `ea57b72e`):

```
ls corpus/meta/activities/patterns/
git log --diff-filter=D --oneline -- meta/activities/patterns/01-orchestrator-workers.yaml meta/activities/patterns/04-isolated-fan-out.yaml
diff corpus/prism/activities/02-adversarial-pass.yaml corpus/prism/activities/03-synthesis-pass.yaml
diff corpus/prism/activities/02-adversarial-pass.yaml corpus/prism/activities/05-behavioral-synthesis-pass.yaml
grep -c "kind: checkpoint" corpus/meta/activities/patterns/02-supervisor.yaml corpus/meta/activities/patterns/05-lead-researcher.yaml corpus/prism/activities/02-adversarial-pass.yaml corpus/prism/activities/03-synthesis-pass.yaml corpus/prism/activities/05-behavioral-synthesis-pass.yaml
grep -rn "dispatch_concurrency" corpus/
grep -rn "parallelism-is-optimisation" corpus/
python3 <planning>/2026-09-03-routines/measure/repeated-runs.py --root corpus
```

The baseline comparison extracts the sweeps' pin into a scratch tree so a disagreement is about the
same bytes:

```
git archive 2b8b7215 | tar -x -C /tmp/base-full
python3 <planning>/2026-09-03-routines/measure/repeated-runs.py --root /tmp/base-full
```

The occurrence scan is a short script that flattens each activity's step list, recurses into loop
bodies as sequences of their own, and reports every maximal window over the four-operation family
together with what interrupts it and what each member binds. It is kept beside this record at
[measure/fan-out-occurrences.py](./measure/fan-out-occurrences.py). Counting the windows that carry
all four family positions gives **3** against `corpus/` and **5** against the extracted baseline:

```
python3 measure/fan-out-occurrences.py corpus | grep -c "positions=\[0, 1, 2, 3\]"
python3 measure/fan-out-occurrences.py /tmp/base-full | grep -c "positions=\[0, 1, 2, 3\]"
```

The two further windows it reports live are the `cicd` and `substrate` runs, which carry one and two
family positions respectively under a different compose operation and are a different run.

From the server checkout:

```
npx tsx guards/validate-activities.ts
git diff --stat a4a5d88b..HEAD -- corpus/meta/activities/patterns corpus/prism/activities
```

Server anchors: `src/schema/activity.schema.ts:167-172`, `src/schema/workflow.schema.ts:56-72`,
`:144`, `src/config.ts:184`, `:629`, `src/loaders/workflow-loader.ts:73-76`, `:778-784`, `:795-806`,
`src/tools/workflow-tools.ts:836-869`, `src/utils/activity-variables.ts:151-158`.
