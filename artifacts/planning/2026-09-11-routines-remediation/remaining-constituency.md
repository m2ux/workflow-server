# What the routines construct still has to serve, measured

> Item 2 of the routines remediation · server `fe5f5f78`, corpus `e9d26007`
> Subject: the [routines proposal](../2026-09-03-routines/README.md) as a whole, against the
> [verified sweep outcome](../2026-09-10-routines-sweeps/README.md) and
> [item 1's re-derivation of stages 7 and 8](./stage-7-8-rederivation.md)

The question this was set is whether the construct has enough left to justify building. The way the
question was framed assumed an answer to a prior one: that the graph destination which runs one
activity once per element of a collection had taken over the two adoption families the last two
stages name, leaving the construct with the assumption run and the convergence loop and nothing else.

**That assumption is measured false, and item 1 is where it was measured.** Both stages keep a
constituency. So the construct's remaining constituency is four families, not two, and at this tree
it is **17 reference sites across 12 activity files in three workflows** — 15 sites once the plan's
own once-per-run disposition removes the assumption run from two of its four hosts. Beside them the
corpus carries **14 further repeated-run windows across 20 activity files in 8 workflows** that no
stage of the plan names at all, more than half the census by window count.

**And the arithmetic underneath that constituency is much thinner than the plan's headline figures
suggest.** The family the plan leads with shrinks from four copies to two by a routing decision that
needs no construct whatever, and at the two that survive a routine costs more source lines than it
saves. The family that is largest is the one where nothing varies between the copies at all — so it
buys enforcement against a divergence that has not happened rather than converging one that has.

The recommendation below is nonetheless to build it, on a changed order: the drift guard first and
alone, then the construct, then the family with no inputs and no gates as the first migration. The
weighing is in part six, the three readings in part seven, the recommendation and what would overturn
it in parts eight and nine.

---

## Part zero — the tree, and what is still unbuilt

| | Revision | Note |
|---|---|---|
| Server tooling | `fe5f5f78` on `main` | Guard scripts live under `guards/`, not `scripts/`; a sweep citation of `scripts/check-fragments.ts` reads `guards/check-fragments.ts` here |
| Corpus | `e9d26007` on the `workflows` branch | Product definitions sit under `corpus/`, so a sweep citation of `meta/...` reads `corpus/meta/...` |

Nothing in the design is built. `find corpus -type d -name routines` returns nothing;
`grep -rn "kind: routine" corpus src guards` returns nothing; `StepSchema` is a discriminated union
of exactly four members — technique, action, checkpoint, loop
(`src/schema/activity.schema.ts:167-172`). Stage 0 has landed and nothing else has.

The guard suite is green apart from one stale ledger entry: `npx tsx guards/check-all.ts` reports
**41 guards in 4.3s — 38 pass, 1 fail, 2 unmeasured**, the failure being a triage row in
`binding-fidelity` naming a technique file, and the two unmeasured guards looking for a `workflows/`
directory the primary checkout does not have. That reproduces
[stage-2-dispositions.md](./stage-2-dispositions.md) exactly and corrects the sweeps' "40 guards, 40
pass, 0 fail". None of the three touches any subject below.

---

## Part one — the convergence loop

This is the largest single family and the plainest case the construct has.

Six activity files in `work-package` each carry a repeat-until loop whose body reconciles the
assumption set, challenges it from three perspectives, and merges the challenge results back. Hashing
each block over its source text — located by the enclosing `- kind: loop` opener and closed at the
first line indented no deeper — puts all six under one digest:

| Site | Block | Lines |
|---|---|---|
| `corpus/work-package/activities/02-design-philosophy.yaml` | 177-207 | 32 |
| `corpus/work-package/activities/04-research.yaml` | 137-167 | 32 |
| `corpus/work-package/activities/05-implementation-analysis.yaml` | 83-113 | 32 |
| `corpus/work-package/activities/06-plan-prepare.yaml` | 115-145 | 32 |
| `corpus/work-package/activities/07-assumptions-review.yaml` | 74-104 | 32 |
| `corpus/work-package/activities/08-implement.yaml` | 159-189 | 32 |

**Six sites, 32 lines each, 192 lines, one SHA-256 prefix `1d1e8bc06add9904`.** Not one character
differs between them, the perspective list `["stakeholder-gap", "rejected-paths",
"evidence-strength"]` and the four output remaps included. The seventh site is a variant:
`15-codebase-comprehension.yaml:79-156`, a 79-line `while` loop that runs a deep dive and a question
revision before the same challenge-and-merge pair, which occupies **17 lines** at `:95-111` and binds
three of the four outputs rather than four.

The 192 and the 79 both reproduce the sweeps' ground truth to the digit, 38 corpus commits later.

**What a routine removes here, priced against the folder's own drafted signatures.**
[re-derivation.md:110-206](../2026-09-03-routines/re-derivation.md) drafts the two routine files this
family needs, at 47 lines each. Six reference sites become an 8-line step with no arguments; the
comprehension site becomes an 11-line step inside its own loop. So 209 lines of source describing one
run become **153**: a saving of 56 lines, 27%. The line saving is not the product. The product is
that a divergence between the seven copies stops being expressible, and **nothing in the repository
detects one today** — 41 registered guards, and none of them compares one step sequence against
another.

The declarations move with it. `challenge_findings` is a declared activity-level write at **seven**
sites — exactly the seven convergence activities — and it becomes one routine internal;
`has_resolvable_assumptions` is a declared read at **six** activities and an output binding takes its
place. The proposal says six `challenge_findings` declarations at three places; the corpus says seven,
and has said seven since `b5e54574`.

The decisive property for what follows: **the outer routine has no inputs at all.** Six
byte-identical blocks means every value inside them is a constant. It declares no gate either — each
block holds exactly four `kind:` lines, one `loop` and three `technique`, so there is no checkpoint
anywhere in the family. A routine with no parameters and no gates is the smallest exercise of the
construct that works end to end.

---

## Part two — the assumption run

Four activity files in `work-package` announce the assumptions still open, put one question to the
user about the whole set, record the answer, and walk the residual items one at a time. This is the
family the proposal leads with, and it is the one whose size has to be stated most carefully, because
two different figures are both true and they mean opposite things.

**As it stands: four copies, 141 lines, six of eight positions differing.** The run's source spans,
taken as each top-level step's `- ` opener through the line before the next:

| Host | Announcement | Batch gate | Batch record | Interview loop | Closing record | Total |
|---|---|---|---|---|---|---|
| `04-research.yaml` | 169-177 | 222-224 | 225-228 | 229-246 | — | **34** |
| `05-implementation-analysis.yaml` | 115-123 | 124-126 | 127-130 | 131-148 | — | **34** |
| `07-assumptions-review.yaml` | 106-109 | 110-112 | 113-116 | 117-138 | 139-141 | **36** |
| `08-implement.yaml` | 191-199 | 200-202 | 203-206 | 207-224 | 225-227 | **37** |

**141 lines across the four hosts**, plus the 57-line `fragments` block at
`corpus/work-package/workflow.yaml:15-71`, for **198 lines of source describing one run**. All three
figures reproduce the sweeps' ground truth and none reproduces the proposal's 138 / 51 / 189.

Matching the run's positions by place rather than by identifier
([measure/run-positions.py](./measure/run-positions.py)) gives the drift:

| | Positions | Spellings | Instances | Identical in every field at all four hosts |
|---|---|---|---|---|
| The whole run | 8 | 18 | 32 | **2** — the record pass and the per-item present |
| The six the routine body would hold | 6 | 15 | 24 | **1** — the per-item present |

So **six of the eight positions differ in some field**, and under the six-position framing the sweep
folder uses, one position of six is identical everywhere. Position by position, the fields that vary
are: `actions`, `id` and `when` at the announcement; `id` at the batch gate; `id` and `when` at the
batch record; `id`, `maxIterations`, `steps` and `when` at the interview loop; `condition` and `id`
at the per-item gate; `id` at the per-item record. The record pass and the per-item present vary in
nothing.

**What the signature subsumes.** Seven names are declared as activity-level writes at each of the four
hosts — `assumption_outcome`, `assumption_review_presentation`, `current_assumption`,
`has_deferred_assumptions`, `has_open_assumptions`, `needs_individual_interview`, `open_assumptions` —
for **28 declarations**, against declared write totals of 15, 11, 12 and 17. Corpus-wide those seven
names carry **38** write declarations; the other ten belong to activities that are not reference
sites. Two of the seven are internals that never cross an activity boundary:
`assumption_review_presentation` and `current_assumption` each carry **four write declarations and
zero declared reads anywhere in the corpus**, for **eight declarations of values nobody outside the
run has an interest in**.

**And now the figure that changes what this family is worth.** The plan's own second stage decides
that the run happens once per run rather than once per activity. Research reaches
implementation-analysis on its only exit, which reaches plan-prepare, which reaches
assumptions-review; the two paths that skip research land at implementation-analysis and plan-prepare
respectively. So both of those hosts are followed by a definitive reconciliation on every path and
**both drop their copies outright** — measured at 8,351 delivered characters removed from one of them
([decisions.md:620-623](../2026-09-03-routines/decisions.md), re-derived at
[stage-2-dispositions.md:387-395](./stage-2-dispositions.md)).

That decision converges two of the census's differences **without a routine**, and the decisions
record says so in those words. It is a routing observation about the workflow graph, available today,
and a plain deletion performs it.

What is left after it is a routine with **two reference sites**, `07-assumptions-review` and
`08-implement`, carrying 73 lines of run plus the 57-line fragments block — **130 lines**. The
folder's own drafted routine file for this family,
`conversion/routines/assumption-reconciliation.yaml`, is 143 lines of which 20 are comments: **123
lines of definition**, plus two 8-line reference steps. So at the sites that survive its own stage-2
disposition, **this family's conversion adds source rather than removing it**, because the two gate
bodies that live once at the workflow root today move inside the body the routine holds.

The proposal states the comparison as "189 lines of source describing one run, against roughly 85 for
a routine file and four reference steps" (README:473-475). Each half of that is wrong at this tree:
198 rather than 189, and the folder's own draft is 123 lines of definition rather than 85.

Two further obligations narrow the family again, both from the same re-derivation. The announcement
sits outside the routine body, so `assumption_review_presentation`'s four write declarations survive
the migration and only `current_assumption`'s four become one internal — halving the eight-declaration
figure. And one of the twelve census differences is still open to a person: whether the per-item gate
stays dismissible. Settled one way the corpus loses its only dismissible per-item assumption gate;
settled the other, three hosts gain one they do not have.

---

## Part three — the two families item 1 recovered

Item 1 re-derived stages 7 and 8 against the corpus and found the graph owns neither. I re-took its
three load-bearing measurements rather than carrying them.

**Stage 8 — the fan-out run.** Three occurrences survive, in two files, after the fan work deleted
`01-orchestrator-workers.yaml` and `04-isolated-fan-out.yaml`. Reading the step text at each:
`corpus/meta/activities/patterns/02-supervisor.yaml:42-62` carries 15 lines of run with a 6-line
gated `message` action between the gather and the synthesise;
`05-lead-researcher.yaml:41-55` and `:70-84` carry 15 lines each. **45 lines across three occurrences,
of which exactly one value varies** — `expected_ids`, reading `worker_briefs` at the supervisor and
`work_units` at the other two, which the bound operation declares as alternative arguments to one
parameter. Item 1's occurrence scan
([measure/fan-out-occurrences.py](./measure/fan-out-occurrences.py)) reports exactly three windows
carrying all four family positions, across 132 activity files scanned.

**Stage 7 — the three per-unit passes.** All three are 41 lines.
`diff 02-adversarial-pass.yaml 03-synthesis-pass.yaml` reports 5 hunks and 7 changed lines;
`diff 02 05-behavioral-synthesis-pass.yaml` reports 8 hunks and 11 changed lines. Item 1's
correction of the sweep folder's internal disagreement holds: seven, not eight.

Both families are small, and both are real. Stage 8's whole constituency sits in files no workflow
graph reaches and no guard validates. Stage 7's whole constituency is invisible to the only
mechanical grading the plan has, because the census needs a window of two consecutive steps and each
pass has one top-level step and one body step.

---

## Part four — the fragment mechanism, whole

This is the one population the construct does not merely improve on. It replaces it, and the
replacement is the strongest canon-side argument the plan has.

**One declaration, two bodies, 57 lines.** `grep -rn "fragments" --include=*.yaml corpus/` returns
two lines, one of them prose about a changelog fragment in a checkpoint message. The mechanism is
`corpus/work-package/workflow.yaml:15-71`, holding `assumption-interview` (`:17-49`, 33 lines) and
`assumption-decision` (`:50-71`, 22 lines). Between them they write three names and read four — one
activity's state living in a routing file.

**Eight reference sites, four per body, all inside one workflow.** Of the 23 `ref:` lines in the
corpus, 8 are the mechanism (`04-research.yaml:224,243`,
`05-implementation-analysis.yaml:126,145`, `07-assumptions-review.yaml:112,130`,
`08-implement.yaml:202,221`); 13 are `actions/checkout` `ref:` quoted inside audit resources and
techniques; one documents the mechanism in the construct inventory; one is a findings-register field
named "Base ref". All eight sites are the assumption run's, so **the fragment mechanism and the
assumption run have exactly the same constituency** — which is why only stage 5 retires it.

**A 238-line resolver with two paths.** `src/loaders/fragment-resolver.ts` resolves twice because two
delivery paths need it: once into the parsed object graph (`resolveCheckpointFragment`,
`materializeCheckpointStep`, `materializeActivityFragments`) and once into the **raw YAML text**,
because `get_activity` hands the worker the original file. The textual half is lines 161-238 — **78
lines**, a third of the file.

**Seven of nine guard rules lose their subject.** `guards/check-fragments.ts:57-66` declares nine
rule names. Seven reach the corpus only through a `ref` value or a `fragments.checkpoints` entry —
`malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `unused-fragment`,
`inline-duplicate-of-fragment`, `undeclared-effect-variable`. Two survive because they reach the
corpus through inline content with no reference in the path: `duplicate-rule`, which was never a
fragment rule, and `duplicate-checkpoint`, whose remedy changes to name a routine. The guard passes
clean today: `npx tsx guards/check-fragments.ts` prints "fragments: OK — every ref resolves, every
fragment is used, no inline duplicates".

**One of the seven does not die, it changes owner.** `ref-opens-step` exists because the textual
injector is line-oriented and replaces a standalone `ref:` line. Stage 3's criterion — "the textual
splicer emits an explicit prefixed `id:` on every step it splices" (README:858) — is the same
requirement restated for a splicer that has to place a whole nested step block at the right
indentation. The rule count falls by one; the hazard is inherited.

---

## Part five — the drift beyond the named families

Running the proposal's own census at this corpus
([measure/repeated-runs.py](../2026-09-03-routines/measure/repeated-runs.py), `--root corpus`) gives
**24 maximal shared windows over 122 activity files, 19 at the top level and 5 inside a loop body**.
That reproduces the completeness pass's correction of the proposal's stated 26 and of stage 1's
acceptance baseline.

**The census reaches 122 of the 132 activity files on disk, and the ten it misses are one tree.** Its
glob is `*/activities/**/*.yaml`, which admits one directory level between the corpus root and an
`activities/` directory. `corpus/specimens/fan-conformance/activities/` sits two levels down and
holds **10 activity files**, none of which the census parses — every one of them a definition the
graph fan work wrote to exercise its own construct. No file is skipped for want of a `steps` list: a
parse of all 122 the glob finds skips zero. The activity-schema validator does reach them —
`npx tsx guards/validate-activities.ts` reports **129 passed, 0 failed** against the 132 on disk, the
three it never sees being the surviving `meta` pattern activities — so the census's reach is
narrower than the validator's, and narrower than the loader's.

**The blind spot costs nothing today and is still a reach defect.** Widening the glob to
`**/activities/**/*.yaml` parses all 132 files and reports the same **24 maximal windows, 19 top
level and 5 nested** — the specimen tree shares no run with anything, so no window is being missed.
But stage 1's guard is written to this search as the criterion states it, and a definition tree the
guard cannot see is a tree whose drift never enters a baseline. The fix is one character in a glob,
and it belongs on the plan defect register before the guard lands rather than after.

Attributing each window to the run it belongs to:

| Whose drift | Windows | Activity files | Workflows |
|---|---|---|---|
| The assumption run and the convergence loop | **9** | 7 | 1 — `work-package` |
| The fan-out run (stage 8) | **1** | 2 | 1 — `meta` |
| **Named by no stage of the plan** | **14** | **20** | **8** |

The fourteen sit in `cicd-pipeline-security-audit`, `codebase-wiki`, `plain-language`, `prism-audit`,
`prism-evaluate`, `substrate-node-security-audit`, `work-package` and `workflow-design`. **Nine of
the fourteen have all their owners inside one workflow; five span two.** The largest by source lines
is a five-step publish run — commit, verify, push, open a pull request, create it — shared by
`workflow-design/activities/09-validate-and-commit.yaml` and `10-post-update-review.yaml` at 65 lines
of top-level step text. Five more belong to one family: the audit-and-persist pattern across
`workflow-design` `06-scope-and-draft`, `08-quality-review` and `10-post-update-review`, which the
proposal's own census marks provisional pending finding B6, still **Open** and raised as
[#637](https://github.com/m2ux/workflow-server/issues/637).

Two of the fourteen are noise the method admits and a reader should discount: a pair of consecutive
`message` actions at three activities, and a write-artifact-then-announce pair at six activities
across four workflows. The remaining twelve are runs.

**This is the measurement that most changes the size of the question.** More than half the census by
window count, and two-thirds of it by file count, lies outside every family the plan names. The
proposal's own census reached the same conclusion from a smaller corpus — "the others establish that
a routine has a constituency beyond it, in three further workflows"
([drift-census.md:73-76](../2026-09-03-routines/drift-census.md)) — and then wrote no stage for any of
them. A window a routine could hold is constituency whether or not a stage names it, and a guard that
reports the window is what makes an author reach for the construct.

---

## Part six — what it costs, and the canon applied in both directions

### The five costs, priced at this tree

**One — a fifth member on the step union.** `StepSchema` is four members today
(`src/schema/activity.schema.ts:167-172`). The union reaches every activity file in the repository,
and there are two corpora: **132 activity YAML files** on the corpus tree and **68 more across 28
synthetic workflow trees** under `tests/fixtures`, which the proposal's thirteen records never
mention — the word *fixture* appears zero times in them. On the engine's own continuous integration
the fixtures are the whole definition surface, because the verify job checks out with
`submodules: false`. And the unswept fixtures record measured something that undercuts stage 3's
central criterion: **a step kind the schema refuses does not fail the load, it drops the activity** —
`loadWorkflow` returns success with an activity count of zero and logs a warning.

**Two — a loader materialisation pass**, with resolution, identifier prefixing and the load failures,
plus a `routines/` discovery pass that runs wherever the loader discovers an `activities/` directory.
It reaches all 28 fixture trees on the day it lands.

**Three — a change to the contract derivation, which has no home in the loader.**
`deriveActivityContract` is defined at `src/utils/activity-variables.ts:418` and has exactly **two
call sites, both in `guards/check-activity-variables.ts` (:158 and :483)**. The loader never calls it.
The whole boundary the construct is sold on — a reference contributes a declared signature and the
body is never consulted — is stated against an ordering between a loader pass and a derivation the
loader does not perform. Stage 3's criterion that "a test fails if the order is swapped" has no order
to swap. This is the sweeps' third plan defect, and it reproduces.

**Four — a second textual representation.** The existing one is 78 lines of a 238-line resolver and
replaces a single `ref:` line. A routine's has to place a whole nested step block at the right
indentation with every identifier prefixed, and the two implementations have to agree on every
generated identifier, because a disagreement shows up as a worker reading a step the server does not
believe exists. The differential test that holds them in agreement runs over both corpora on every
run. The proposal calls this the largest cost in the plan and says it is paid knowingly for an
arrangement that is ending.

**Five — the guard work.** The registry holds **41 guards** (`guards/guards.ts`) against 44
`check-*.ts` scripts and 53 TypeScript files on disk. The sweeps measured 21 of 40 opening an activity
file — 18 as written, 3 through the loader — against the proposal's "nineteen out of thirty-seven",
and found 13 of the 18 not recursing into subdirectories. At this tree at least eleven guard files
still read an activities directory with a non-recursive `readdirSync`, so the figure has not improved.
On top of the directory work, `check-variable-model` gains a name scope because every gate in every
routine violates `setvariable-undeclared` as authored, and `check-activity-technique-overlap` gains
routine awareness because the classification alone does not fix it.

**And a sixth the plan budgets but cannot spend.** The walker's promised routine-level entry is
asserted at five places in the README. Across stages 5, 6, 7 and 8 — every migration the plan names —
its whole subject is **two gates and six options**, both in one routine, because the convergence loop,
the three `prism` passes and the fan-out run declare no checkpoint at all. The walker is 1,051 lines
and its existing entry takes a workflow id.

### The canon, applied honestly

The repository's design principles give two tests for this shape of question, and they point in
opposite directions.

**"Prefer removing the thing that needs a prohibition" favours the construct, and strongly.** The
fragment mechanism is precisely a thing that needs prohibitions: seven of its nine guard rules exist
to police the mechanism itself, and its whole subject is 57 lines holding one activity's state in a
routing file. Retiring it retires them. The corpus's own construct inventory documents it as a
distinct schema construct that a routine subsumes.

But the same test cuts back. A routine arrives with **seven prohibitions of its own** (README:744-760)
— not a graph destination, not a hand-off, not a child workflow, no self-reference, no artifact
prefix, no free variables, no structural variation but by declared input. One of the seven is
already false: the sweeps' fourth plan defect established that a routine body binding a technique
whose prose interpolates a bag name reads a name its signature does not declare, because those tokens
live in technique markdown and materialisation cannot rewrite them. And `ref-opens-step`'s hazard is
inherited rather than removed. So the prohibition count does not fall as cleanly as the plan implies.

**"The simplest implementation that fully meets current requirements" is where the answer turns.** The
requirement, stated from the repository rather than from the proposal, is that two copies of a run
cannot silently disagree. At the assumption family the disagreement is live today and concrete: one
step runs in review mode at two hosts and not at the other two. At the convergence family there is no
disagreement at all — six blocks under one hash — so the construct buys the capacity to prevent one.
At stage 7 and stage 8 the disagreement is one value and a handful of identifiers.

A guard reporting the drift meets the *detection* requirement at all 24 windows, including the 14 no
stage names, for the cost of one script. A routine meets it at 12 activity files by making the
divergence unrepresentable. The gap between those two is the whole of what a routine buys over the
cheapest thing that works — and the honest reading is that it is a real gap, because the repository
has 41 guards and none of them compares two step sequences, but it is a narrower gap than a 1,282-line
README and 5,460 lines across thirteen records imply.

**One comparison settles the scale question.** The graph instance fan is the construct that landed
during this work, and it is the repository's own measured precedent for what a new construct costs.
Its live constituency is **three destinations in three production workflows** — `cicd-pipeline-security-audit`,
`midnight-system-review`, `substrate-node-security-audit` — plus three more in the
`specimens/fan-conformance` tree. It deleted two pattern activities of 55 and 65 lines. A routine at
15 reference sites across 12 activity files is a larger constituency than the fan had on the day it
was judged worth building. The difference is that a fan changes what the server does at run time, and
a routine changes nothing: materialisation puts the delivered form back, so the mechanism itself moves
the delivered payload by zero. A routine's entire product is enforcement strength.

---

## Part seven — three readings

### A — build it for the families that remain

Land stages 3 and 4, then migrate 5, 6, 7 and 8.

**What it delivers.** 17 reference sites across 12 activity files in three workflows, 15 after the
once-per-run deletion; five routine definitions; the fragment mechanism gone whole, taking its
57-line declaration, its 8 reference sites, the 78-line textual half of a 238-line resolver and seven
of nine guard rules; 28 write declarations of seven names collapsing to a signature; 192 byte-identical
lines becoming one body; and a construct available to the 14 windows no stage names.

**What it costs.** All five costs above, in full, plus the second walker for two gates.

**What it implies for the plan.** Every one of the ten plan defects has to be discharged first, and
three of them are structural rather than editorial: the load path (defect 3), the free-variable
carve-out (4), and the resolution rule (5). Stage 2's one open row has to be decided by a person, and
stage 5 cannot be graded until it is.

### B — narrow it to the family that is largest

Land stages 3 and 4 in a reduced form and migrate the convergence loop alone.

**What it delivers.** The strongest case at the lowest construct cost. A routine with no inputs needs
no argument substitution at all, only identifier prefixing; with no gates it needs no walker entry, no
`check-variable-model` name scope and no `check-checkpoint-entry` column decision; and with nothing
varying between the copies, materialisation is byte-identical at every site, so the differential test
has the easiest possible subject. 192 lines under one hash become one body, seven reference sites,
seven `challenge_findings` declarations and six `has_resolvable_assumptions` reads.

**Why it should be refused anyway.** It leaves the corpus with **two mechanisms for sharing a body** —
a routine holding the convergence run and the fragment block holding the assumption gates — because
only stage 5 retires the fragments. The repository's own rule is that prose warning "do not also use
X" means two paths now do one job, and that one of them should be retired. B creates exactly that
condition and then has to write the warning. It also forfeits the one place where drift is live rather
than latent.

### C — stop, and take the drift guard alone

Land stage 1 and nothing else. No schema member, no loader pass, no derivation change, no second
representation, no guard column work.

**What it delivers.** The broadest coverage of the three, at the lowest cost: a report over all 24
windows, the 14 no stage names included, with a baseline that can only fall. It surfaces the live
review-mode divergence the assumption run carries today, which is the one concrete harm anybody has
measured. The falling-only mechanism it needs already exists as design in a registered guard,
`check-artifact-guides`.

**What it does not deliver.** Detection, not unrepresentability. It cannot see stage 7's family at
all, because a window needs two consecutive steps and each `prism` pass has one top-level step and one
body step. It cannot see the second fan-out occurrence inside `05-lead-researcher.yaml`, because the
method keeps only windows spanning two or more activity files. And the fragment mechanism stands
untouched, with its 57 lines, its 238-line resolver and its nine rules.

---

## Part eight — the recommendation

**Take A, on a changed order: stage 1 first and alone, then the construct, then the convergence
family as its first migration and the assumption family second.**

Three things decide the destination, and a fourth decides the order.

**The constituency is larger than the question assumed and larger than the precedent that was
accepted.** Four families, not two; 17 reference sites across 12 activity files; and 14 further
windows across 20 files in 8 workflows with no stage to their name. The fan was built for three
production destinations.

**The one mechanism the repository lacks is exactly this one.** Forty-one registered guards and not
one compares a step sequence against another. Every other guarantee in the proposal's table is an
improvement on something that exists; this is the only one that has no weaker form at all.

**The fragment mechanism has to go, and only stage 5 removes it.** Its subject is 57 lines, 8
reference sites, a 238-line resolver of which a third is a textual path written for a delivery
arrangement that is ending, and seven guard rules whose whole job is policing the mechanism. Leaving
it standing beside a routine is the condition the canon names as a defect. That is the argument that
rules out B.

**But the order the plan states is backwards, and the measurements say so.** Stage 1 comes first
because it costs one script, covers all 24 windows including the fourteen nobody planned for, and is
the only mechanism that can grade any later convergence. Stage 6 comes before stage 5 because it is
the smallest version of the construct that works end to end — no inputs, no gates, no behaviour change
at any live site, no open decisions — which is the repository's own instruction about growing in
layers. Stage 5 follows, carrying the twelve dispositions, the one open row and the fragment
retirement, once the construct it needs is a thing that already works. Stages 7 and 8 run last:
stage 8 because its whole constituency is 45 lines in files nothing validates, and stage 7 because it
is the only stage that adds a schema field and the only one the drift guard cannot grade.

**What this recommendation does not say.** It does not say the plan is ready. Ten plan defects change
what a stage delivers, three of them structural, and stage 3's central load-failure criterion names a
behaviour the loader does not have for anything the activity schema rejects. A is the right
destination and the plan is not yet a route to it.

---

## Part nine — the evidence that would change this

Each of these is decidable from the repository, and each moves the recommendation to a named
alternative.

1. **If the once-per-run deletion lands on its own first**, the assumption family is two reference
   sites and 130 lines against a 123-line routine definition, and stage 5 stops paying for itself in
   every currency except the fragment retirement. The recommendation then has to name a second way to
   retire the fragments — the likeliest being to inline both bodies at the two surviving sites and
   delete the mechanism outright — and if that way exists, **C becomes correct**, because the only
   argument against it was the mechanism.

2. **If the drift guard runs for one release and the 24-window baseline falls through ordinary corpus
   work**, then authors converge runs once they can see them, detection is sufficient, and **C is
   correct**. The test is mechanical: the guard's own falling baseline.

3. **If the differential test cannot be made to pass over 132 corpus and 68 fixture activity files
   without a key-mapping table**, the second representation costs more than the plan prices and the
   construct should wait for the runner that ends the textual delivery path. The proposal declines
   such a table as "permanent server cruft" while the tree already carries one for legacy checkpoint
   responses.

4. **If a fifth step-union member drops activities rather than failing the load** — which the fixtures
   record measured for the schema as it stands, at `tests/fixtures/fragments/beta-fixture`, where
   `loadWorkflow` returns success with zero activities — then stage 3's central criterion is
   unbuildable as written and needs a loader change nobody has budgeted. That is a cost item, not a
   verdict, but it belongs in the estimate before the estimate is accepted.

5. **If finding B6 closes in favour of the audits** — that an audit persisting its own findings makes
   its caller's write step redundant — then the **three** of the fourteen unnamed windows that pair an
   audit with a write are a defect rather than a shared run: the five-step
   principles-write-anti-patterns-write-schema window and the two two-step expressiveness-and-write
   and conformance-and-write windows. The census's maximal count falls by three and the part-five
   argument weakens accordingly. The other two windows in that family carry no write and survive
   either way. B6 is Open at [#637](https://github.com/m2ux/workflow-server/issues/637).

6. **If any of the fourteen unnamed windows gains a third occurrence**, the construct's reach grows
   without any stage being written, and A gets easier to justify rather than harder.

---

## Re-taking every figure

From the server checkout root, with the corpus worktree at `.worktrees/workflows`:

```
python3 <planning>/2026-09-03-routines/measure/repeated-runs.py --root .worktrees/workflows/corpus
python3 <planning>/2026-09-11-routines-remediation/measure/run-positions.py
python3 <planning>/2026-09-11-routines-remediation/measure/fan-out-occurrences.py .worktrees/workflows/corpus
npx tsx guards/check-all.ts
npx tsx guards/check-fragments.ts
npx tsx guards/validate-activities.ts
find .worktrees/workflows/corpus -path "*/activities/*" -name "*.yaml" | wc -l
grep -n "FragmentViolation" -A 20 guards/check-fragments.ts
grep -rn "deriveActivityContract" src guards
find .worktrees/workflows/corpus -type d -name routines
grep -rn "kind: routine" .worktrees/workflows/corpus src guards
find tests/fixtures -name workflow.yaml | wc -l
find tests/fixtures -path "*/activities/*" -name "*.yaml" | wc -l
```

From the corpus worktree root:

```
grep -rn "fragments" --include=*.yaml --include=*.yml corpus/
grep -rn "ref:" corpus/ | sort
wc -l corpus/prism/activities/02-adversarial-pass.yaml corpus/prism/activities/03-synthesis-pass.yaml corpus/prism/activities/05-behavioral-synthesis-pass.yaml
diff corpus/prism/activities/02-adversarial-pass.yaml corpus/prism/activities/03-synthesis-pass.yaml
diff corpus/prism/activities/02-adversarial-pass.yaml corpus/prism/activities/05-behavioral-synthesis-pass.yaml
sed -n '42,62p' corpus/meta/activities/patterns/02-supervisor.yaml
sed -n '41,55p;70,84p' corpus/meta/activities/patterns/05-lead-researcher.yaml
```

Four short scripts took the rest, each stating its rule in its own docstring so a disagreement is
about the rule rather than about the reading:

- **The convergence blocks** are located by their `analyse-challenge::challenge` line, opened at the
  enclosing `- kind: loop` and closed at the first line indented no deeper, then hashed over the
  extracted source text. Seven blocks, six under one prefix.
- **The declarations** are read from each activity's `variables.writes[].name` and `variables.reads`,
  tallied per name at the four stage-5 hosts, the seven stage-6 sites and corpus-wide.
- **The run's source spans** are each top-level step's `- ` opener through the line before the next
  opener at the same indent, summed over the positions the run occupies at each host.
- **The window attribution** re-runs `repeated-runs.py`'s own signature and maximality rules, carries
  each step's line span from the YAML node tree, and assigns each maximal window to a family by which
  operation references its signature contains.

Server anchors: `src/schema/activity.schema.ts:167-172`, `src/utils/activity-variables.ts:418`,
`src/loaders/fragment-resolver.ts:161-238`, `guards/check-fragments.ts:57-66`, `guards/guards.ts`,
`guards/check-activity-variables.ts:158`, `:483`, `tests/e2e/walker.ts:958`.

Corpus anchors: `corpus/work-package/workflow.yaml:15-71`, and the seven convergence sites, four
assumption hosts, three `prism` passes and two `meta` pattern activities cited in place above.
