# What the investigation found

Companion to [README.md](README.md), for [#531 W3](https://github.com/m2ux/workflow-server/issues/531)
and the originating [#520](https://github.com/m2ux/workflow-server/issues/520). This is the
current-state analysis behind the proposal: what the code and the corpus actually do today, how that
was measured, and which of the proposal's problems remain unsolved by it. The README states the
proposal; this file states the ground it stands on.

Measured on 2026-09-03 against the server at `4740f4d6` and the `workflows` branch at `131e2942`.
Every corpus figure was taken by parsing the definition files with the same YAML reader the guards
use and walking the parsed step tree, so a step nested in a loop body is counted once at its own
depth rather than missed or double-counted. The step-tree census, the repeated-run search, the
per-host contract tally and the delivery-size measurement were four throwaway scripts run against the
working tree; each is described where its numbers appear, so any of them can be rebuilt and re-run.

**Three sections below describe a technique that no longer exists.** `analyse-challenge::run-loop`
was deleted on 2026-09-06 and its loop written onto activity steps at all seven of its binding sites
under `pass-orchestration-in-technique`. That closes the two defects measured here by removing their
carrier: the caller-named write parameters and the prose token propagating a cross-domain read are
both gone. What it does not close is the reason those sections are in this file — the run is now
duplicated as structure, six of the seven copies byte-identical over 32 lines, so the shared body
still has no home and still has no signature. The sections are kept as the measurement of what the
prose form cost, since the same three mechanisms are available to any other technique that grows a
protocol full of invocations, and the corpus still carries such protocols.

**The step census below has been overtaken too, and is kept as taken.** At `b5e54574` the corpus
carries 996 steps across the same 122 activity files — 669 technique, 158 action, 115 checkpoint,
54 loop — against the 964 recorded here, and 54 loops against 46, the growth being 3 `while` and 5
`doWhile`. The distribution the proposal argues from is unchanged; what moved is that eight more
repeat-until loops now exist, which is the form stage 6 puts inside a shared definition.
[gap-review.md](gap-review.md) carries the re-measurement.

## The corpus, at the grain this proposal works on

| | Count |
|---|---|
| Workflows | 17 |
| Activity files | 122 |
| Steps, all kinds, loop bodies included | 964 |
| — bound to a technique | 644 |
| — control-only actions | 159 |
| — user decision points | 115 |
| — loops | 46 |
| Deepest step nesting | 3 |

An activity has a **median of five steps**. Twenty-six activities carry one or two, thirty-seven
carry three to five, and six carry more than twenty. The largest carries fifty-four.

That distribution settles a claim the originating issue makes and gets wrong. #520 says the shared
run "is smaller than any activity". **It is not** — at five steps it is exactly the median activity,
and half the corpus's activities are no larger. What is true is the thing the claim was reaching for:
the run sits *inside* four activities that each do considerably more, so promoting it to an activity
of its own would cost four hand-offs to save four copies. The size argument for a routine is about
where the run sits, not about how big it is.

## What a shared run of steps costs today

### One run, four copies, seven reference sites

A single run — present the residual open assumptions, gate them as a batch, record the batch answer,
then walk the items one at a time — appears in four work-package activities: research,
implementation-analysis, assumptions-review and implement. The two shared gate bodies it uses are
declared once under `fragments.checkpoints` in `work-package/workflow.yaml` and imported by `ref` at
seven checkpoint steps.

Searching the whole corpus for consecutive step sequences that repeat across activities — matching on
step kind and binding, ignoring identifiers and site gates — finds this run as the longest and widest
match anywhere: five steps shared by two activities, four steps shared by three, two steps shared by
four. The full site-by-site comparison, and every other repeated run the search turned up, is in
[drift-census.md](drift-census.md).

**The four copies have drifted, in six independent ways**, and no check in the suite reports any of
it. The gate bodies are identical because a mechanism holds them identical; everything around them is
free to vary and has.

### The declared contract carries the run four times over

Each of the four host activities declares the run's variables in its own `variables.writes` block.
Seven names — the batch outcome, the presentation object, the current item, the deferred flag, the
open-assumptions flag, the individual-interview flag and the open-assumptions collection — are
declared four times, once per host, for **28 declarations of 7 variables**.

For two of the four hosts that is nearly the whole contract: implementation-analysis declares eight
writes, seven of them the run's; assumptions-review declares eight writes, seven of them the run's.
An activity whose contract is 87% a run it shares with three siblings is not describing itself.

### The workflow file holds one activity's variable names

The two shared gate bodies sit at the root of `work-package/workflow.yaml` because that is the only
scope from which four activities can reach them. Their content is activity-level state: a condition
on `is_review_mode` and `has_open_assumptions`, a message interpolating
`assumption_review_presentation`, options writing `has_deferred_assumptions`,
`needs_individual_interview` and `assumption_outcome`, and per-item text reading
`current_assumption`.

The schema is explicit that the opposite layering is the intent — an activity names its outcomes, the
workflow names destinations, so a borrowed activity sits in a graph without its lending workflow
having a say. A gate body is content, and content at workflow scope means renaming an activity's
variable is an edit to the workflow file.

### Identifier hygiene is authored by hand and is correct by discipline

Two things the mechanism should do, authors currently do themselves.

**Per-site prefixing.** The four batch gates carry ids `research-assumption-interview`,
`analysis-assumption-interview`, `residual-assumption-batch` and
`implementation-assumption-interview`. **The prefix is not load-bearing at these sites.** A checkpoint
response is keyed on the activity and the checkpoint id together, step identifiers are populated per
activity, and `get_technique { step_id }` resolves within the active activity — so four gates in four
different activities could all be called `assumption-interview` and never collide. What the prefix
buys here is legibility in a trace, not disambiguation.

It becomes load-bearing only where one activity refers to one body twice, and **no activity in the
corpus does that** — the four sites are four activities, and no activity references either shared
gate body more than once. So the mechanism a routine needs by construction has no case in the corpus
to prove it against.

**Per-iteration discrimination.** A gate inside a loop is defined once and reached N times, so its id
carries a template the server splits on: `assumption-decision#{current_assumption.id}`.
`CHECKPOINT_INSTANCE_SEPARATOR` at `src/loaders/workflow-loader.ts:449` is `#`, and `checkpointBaseId`
takes everything before the first one, so an instance-qualified id resolves back to its single
definition while recording a distinct response per iteration. Eleven step ids in the corpus carry
such a template.

Both are correct today. Both are conventions a reviewer has to notice.

## What the code does today

### Fragments resolve twice, into two different representations

`src/loaders/fragment-resolver.ts` materialises a shared gate body twice over, because two delivery
paths need it:

- **`materializeActivityFragments`** walks the parsed activity and replaces each ref step's body
  in the object graph, so every downstream reader — tool payloads, checkpoint yield and respond, the
  guards — sees a full checkpoint step and never a reference.
- **`injectCheckpointFragmentBodies`** replaces each `ref:` line in the **raw YAML text**, at its own
  indentation, because `get_activity` hands the worker the original file text. A companion textual
  pre-scan (`scanCheckpointRefLines`) exists to avoid parsing ref-free activities, which is the
  common case.

The two implementations have to agree. The guard suite carries a rule, `ref-opens-step`, whose entire
purpose is to keep them agreeing: a checkpoint step whose `- ` line is the `ref:` itself parses fine
in the object path and breaks the textual one, so authors are required to write the `id:` first.

This is the shape any materialisation-at-load mechanism inherits, and it is the largest single cost
in the proposal.

### Materialisation already inflates what a worker receives

Measured over the four host activities, replacing the seven `ref:` lines with their bodies takes
**28,154 characters of source to 34,717 delivered — 6,563 characters, 23.3% more**. Three of the four
gain 1,792 characters each and the fourth gains 1,187.

The run occupies 138 lines across the four activity files — 28, 28, 53 and 29 — plus the 51 lines of
shared gate bodies at the workflow root, so 189 lines of source describe one run. A routine file and
four reference steps are roughly 85. Materialisation puts the delivered form back, so **the source
shrinks and the delivered payload does not** — which is the right way round for a mechanism whose
purpose is single-homing, and worth saying plainly so nobody expects a delivery saving that is not
there.

### One traversal is shared; eight walks are not

`flattenActivitySteps` in `src/schema/activity.schema.ts` is documented as "the single traversal all
step/checkpoint consumers route through", and nine files use it — the contract derivation, the
producer index, the manifest validation, the step-technique bundler, the resource composer and the
coverage walk among them.

It recurses into exactly one thing: `s.kind === 'loop'`. So the shared traversal does not make a new
compound kind safe — **it makes it invisible**. A `kind: routine` step carrying a body would be
walked as a leaf by all nine users, silently.

Eight further walks recurse independently and would each need the same widening:

| Walk | Where | What it does |
|---|---|---|
| `populateStepIds` | `activity.schema.ts:177` | Fills derived ids, one uniqueness scope per loop body |
| `topLevelStepIndex` | `activity.schema.ts:324` | Maps a nested step to the top-level step the sequence advances through |
| `materializeActivityFragments` | `fragment-resolver.ts:137` | Object-path fragment materialisation |
| `collectCheckpointRefs` | `fragment-resolver.ts:227` | Lookup pre-loading |
| Gate collection | `workflow-tools.ts:1206` | Decides which steps a delivery includes in full |
| Coverage walk | `tests/e2e/coverage.ts:47` | Option-coverage accounting |
| Manifest collection | `tests/e2e/walker.ts:387` | Gathers the step ids a walk expects |
| The walk itself | `tests/e2e/walker.ts:490` | The end-to-end harness's own execution |

Across `src/`, `scripts/` and `tests/` there are **57 places a step kind is tested by comparison,
across 19 files, and no exhaustive switch anywhere**. A new kind therefore compiles clean everywhere
and is handled nowhere.

Two of those eight are the same file's two representations of one job, and the last two are the test
harness — which the typed-execution record already identifies as a second interpreter sitting on the
wrong side of the test boundary.

### The contract derivation is one function, and a routine changes one thing in it

`deriveActivityContract` in `src/utils/activity-variables.ts` walks the flattened steps and
accumulates reads and writes per kind: a loop contributes its collection, its break condition and its
item variable; a technique contributes its resolved signature's inputs and outputs; a checkpoint
contributes its id template, its message tokens and its options' effects; actions contribute their
targets.

A technique step already contributes a **declared** signature: `readSignature` composes the bound
operation with its container contracts and reads what the technique file declares, never inspecting
a body, there being no mechanical body to inspect. So the boundary is not new. What a routine adds
to it is that a declared signature becomes checkable against the steps it describes, and that the
boundary becomes tight — a technique's delivered prose leaks its `{token}`s into the referring
activity's reads, and a routine has no free variables. That is the single change to the derivation,
and it is the whole of what a routine buys over any arrangement that shares a body without a
signature.

### A loop's item variable is declared where the schema says it should not be

`ActivityVariablesSchema` states that "a loop variable is iteration state and is not declared here",
and the derivation at `activity-variables.ts:375` writes `step.variable` into the produced set
regardless. All four host activities duly declare `current_assumption` under `variables.writes`.

The rule and the code disagree, and the corpus follows the code. A routine that owns the loop settles
it by removing the question from the host activities entirely, but the inconsistency is real today
and is worth fixing whether or not any of this lands.

### The guard suite has no notion of a repeated run

Thirty-five `check-*.ts` scripts, 6,749 lines. Twelve of them read activity steps — thirty-seven
scripts and nineteen readers at `f315b772`. The one that
polices duplication, `check-fragments.ts`, normalises and compares **single checkpoint bodies** and
**single rule texts**. Nothing anywhere compares a *sequence* of steps against another sequence.

That is why the drift in [drift-census.md](drift-census.md) accumulated silently: the mechanism holds
the two gate bodies byte-identical, and every step around them was free to diverge.

## What the corpus asks for beyond the assumption run

The repeated-run search found four further shared runs. None is as wide as the assumption run and
each is real:

- **Fan-out** — compose briefs, dispatch workers, gather results, synthesise: four steps shared by
  two of meta's pattern activities, with the middle pair shared by three. A near-identical pair sits
  in the substrate audit workflow behind a different composer.
- **Commit and publish** — commit, verify the commit, push the branch, open the pull request: four
  steps shared by two workflow-design activities.
- **Audit and write** — an audit technique followed by the artifact write that persists its findings:
  two activities, twice over with different audits. **Provisional**: finding B6 of
  [findings-register.md](findings-register.md) records that each of those audits already persists
  its own findings and reports the path, so the write step may be the redundant half and the window
  a defect rather than a shared run.

Separately, **`work-package::manage-artifacts::write-artifact` is bound at 42 step sites**, the
most-bound technique in the corpus by a factor of nearly three. A large part of what a routine would
carry is the pairing of a producing step with the write that persists what it produced.

### A parameterised technique writes variables nothing can see it write

`analyse-challenge::run-loop` takes three of its inputs — `convergence_flag`, `residue_flag`,
`residue_collection` — as the **names of session variables to write**, chosen by the caller. Six
sites bind them to the assumptions domain's names and the seventh to the comprehension domain's.

The producer index resolves a bound technique's declared outputs by reading its file. It cannot
resolve a name supplied as a string at the call site, so none of these writes exists as far as the
contract derivation is concerned. Across the five bag names and 20 parameter bindings, the
corresponding write is hand-declared at 13 sites and absent at 7:

| Bag name | Parameter bindings | Activities declaring the write |
|---|---|---|
| `has_open_assumptions` | 6 | 6 of 6 |
| `open_assumptions` | 6 | 6 of 6 |
| `needs_comprehension` | 1 | 1 of 1 |
| `has_resolvable_assumptions` | 6 | **0 of 6** |
| `has_open_questions` | 1 | **0 of 1** |

Where the write is declared it is declared by hand, and correctly. Where it is not, the fact is
invisible — and `has_open_questions` has no declared writer in any activity anywhere. Its
declaration sits at the **workflow root** instead, in both `work-package/workflow.yaml` and
`remediate-vuln/workflow.yaml`, with a default. The contract guard passes because a workflow-owned
name satisfies its read-needs-a-writer test unconditionally, at
`scripts/check-activity-variables.ts:210`.

### A prose token propagates a read into every activity that binds the technique

The derivation collects the `{tokens}` in a technique's delivered prose and treats each one that is
not a declared signature entry as a direct session read by the binding activity —
`src/utils/activity-variables.ts:296` computes that set and `:397` folds it into the activity's
reads.

`run-loop`'s Protocol carries thirteen tokens. Ten are declared by the technique or its group. Three
are not: `comprehension_log`, `needs_comprehension` and `has_open_questions`. Two of the three appear
in a single sentence about one of the two domains the technique serves — the clause saying to follow
the analysis with `revise-questions` when the concern kind is open questions.

The propagation is exact:

| Token | Activities declaring a read | Of those, activities binding `run-loop` |
|---|---|---|
| `has_open_questions` | **7** | **7** |
| `needs_comprehension` | 6 | 6 |

Seven activities bind the technique; seven activities read `has_open_questions`; they are the same
seven, and no other activity in the corpus reads it. Six of them are running assumptions, where the
clause carrying the token never applies.

So the name is **read because of prose, written through a parameter, and declared at the workflow
root** — three different mechanisms, none of which is the one the contract exists to use. It is the
same inversion #519 raises about gate bodies, arriving by a different route, and it is what a
declared routine signature closes: an output binding is a write the derivation can see.

### The convergence loop is a loop written as prose

`analyse-challenge::run-loop` is bound at **seven step sites across seven work-package activities**.
Its Capability says it runs parameterised iterations until concerns converge; its Protocol is a
`while` loop that invokes three techniques per pass, one of them supplied as a parameter. It carries
an `iteration_mode` input to say whether it iterates at all, and a rule telling the reader to honour
the binding activity's `maxIterations` when the activity wraps it in a loop of its own.

Every one of those is a construct the step schema already has — a loop step, a bound technique per
body step, an iteration bound, an input binding. They sit in prose because the destination is a run
of steps and there has been nowhere to put one.

At one of the seven sites the split fails from the inside. `15-codebase-comprehension.yaml` wraps the
technique in a `kind: loop` step of its own and passes `iteration_mode: once` to switch the
technique's internal loop off, because it needs a user gate inside each iteration and a protocol has
no way to hold one. Iteration is expressed twice, in two different mechanisms, reconciled by a
parameter whose only job is to disable one of them.

This technique and this activity are the subject of [conversion-trial.md](conversion-trial.md), where
they were converted for real. Six of the proposal's settled decisions come from that exercise, and
three of them overturn what the proposal said beforehand.

## Technique prose naming another technique

Counting markdown links into a `techniques/` tree that appear inside a technique's `## Protocol`
section gives **235 references across 66 of 582 technique files**.

That figure is not comparable with the 137 the runner record carries, and the difference is a
counting rule rather than a change in the corpus: this pass counts links in the Protocol section
only, and counts a repeated link to the same target once per occurrence. #397 recorded the same
population varying by 59% across definitions of "a call" that read identically in prose, and closed
having replaced the count with a boundary question. **Nothing in this proposal is keyed to the
total.** What matters is that a concentrated minority of it is compositional — one technique applying
another per item, or a producing step paired with a persisting one — and that population is a routine
destination rather than a delivery problem.

## What a routine does not fix

**The two-representation cost gets worse before it gets better.** Fragment materialisation replaces
one line with a body. Routine materialisation replaces one step with several, including nested ones,
in raw YAML text whose indentation has to be right. The textual implementation is built for a
delivery arrangement the runner ends, so it is written knowing it will be deleted — and while it
lives, the two implementations have to agree on every generated identifier.

**A drifted gate is not normalised by converging the run.** Two of the four per-item gates now ask
genuinely different questions with different option sets: three options against two, and one outcome
value (`corrected`) that exists at one site only. Converging the sites is a decision about what the
gate should ask, taken by a person, and the mechanism cannot take it. Recording which differences
were intentional is part of the migration, not a by-product of it.

**Placement cannot be computed from which workflows reference a routine.** Twenty-one activities
appear in more than one workflow's graph, and remediate-vuln borrows thirteen from work-package —
including all four hosts of the assumption run. A rule counting referencing workflows would therefore
push the most work-package-specific run in the corpus into the shared home. The reasoning and the
rule that survives it are in [placement.md](placement.md).

**Nothing here reaches what a technique's protocol does inside.** A routine names a run of steps. A
technique's prose stays prose, and the 235 inline references above are reduced by a routine only
where the thing being named is genuinely a run of steps.

**Unknown fields still disappear from a session without complaint.** The session schema is an
ordinary object schema, so a server build that does not know a field erases it and leaves a valid
signature behind. Routines add no session state of their own, so this is not made worse — but it is
the reason the load-time failures this proposal specifies have to be refusals rather than warnings.
