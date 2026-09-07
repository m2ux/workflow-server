# The conversion, re-run and executed

Companion to [README.md](README.md) and [conversion-trial.md](conversion-trial.md), for
[#531 W3/W4](https://github.com/m2ux/workflow-server/issues/531).

The first trial converted by hand and reasoned about the result. This re-runs it with the
continuation-condition resolution in place and with the materialisation actually **executed**: a
prototype materialiser implementing the settled spec, its output validated against the real activity
schema, and the real `deriveActivityContract` run over the result.

The exercise found three spec errors that hand-reasoning had missed, and two corpus prerequisites.
After those, **both cases derive clean and no unexplained residue remains.**

Run on 2026-09-04 against the server at `4740f4d6` and the `workflows` branch at `131e2942`.

## What was run

A throwaway prototype implementing the settled spec end to end: resolve a `kind: routine` step,
check its bindings, substitute every name in the body simultaneously, prefix identifiers, splice, and
recurse for a nested reference. Then, on the result:

- `ActivitySchema.safeParse` — does a materialised routine leave behind an ordinary activity?
- `populateStepIds` — do the generated identifiers survive the uniqueness scoping?
- `deriveActivityContract` — the real derivation, against the real workflow directory and the real
  technique files, with the workflow's real variable namespace.

Two cases, chosen so one of them is not marking its own homework:

| | Activity | Routine | Declared contract compared against |
|---|---|---|---|
| **1** | The hand-converted `codebase-comprehension` | `analyse-challenge-pass` | The contract **I wrote before building the materialiser** — a prediction the run then tested |
| **2** | The **live, unmodified** `06-plan-prepare.yaml`, with its `run-loop` step replaced programmatically | `converge-concerns` → `analyse-challenge-pass` (nested) | The contract the activity declares in the corpus today |

Case 2 is the stronger result: nothing about the activity or its declared contract was authored for
this exercise.

## What worked first time

**Nesting.** `converge-concerns` holds a `while` loop whose body is a reference to
`analyse-challenge-pass`. Materialised into plan-prepare it produced a loop `converge-assumptions.pass`
with body steps `converge-assumptions.pass.iteration.analyse`, `.challenge` and `.combine`. Cycle
detection over the reference stack needed six lines.

**Identifier prefixing.** No collision in either case, and `populateStepIds` accepted both — including
the nested three-segment identifiers, which are the longest the corpus would produce.

**Schema validity.** Both materialised activities validate as ordinary activities. Nothing downstream
can tell a routine was involved, which is the property the whole design rests on.

**Higher-order substitution.** `technique: "{analyse_technique}"` resolved to
`codebase-comprehension::deep-dive` at one site and `review-assumptions::reconcile` at the other, and
the derivation read both signatures without complaint. Monomorphisation works.

**The continuation field.** `continueWhile` on the routine's loop rewrote to
`has_resolvable_assumptions` at the plan-prepare site and stayed out of the entry gate. With the field
mapped back to `condition` purely so today's schema would accept it, the shapes are identical — the
change really is a key rename.

## Three spec errors the execution found

Hand-reasoning produced a substitution rule that is wrong in a way only running it reveals.

### 1. Substitution is kind-aware, and the first attempt was not

A routine body writes `"{concern_kind}"` to mean *the value of this parameter*. Rewriting the token
root — which is what "rewrite every field that names a variable" naturally implies — produced this:

```yaml
concern_kind: "{open_questions}"                       # WRONG: a literal became a reference
challenge_perspectives: '{["pedagogy", "rejected-paths"]}'   # WRONG
assumptions_log: "{}"                                  # WRONG
```

The body's brace syntax conflates *this parameter* with *this session variable*, and the two diverge
at the moment of substitution. **The substituter replaces the whole binding value, not the token
inside it**, and what it writes depends on what the reference site supplied:

| Argument at the reference site | `"{input_id}"` materialises as |
|---|---|
| A reference — `"{comprehension_artifact}"` | `"{comprehension_artifact}"` — braces kept |
| A literal — `open_questions` | `open_questions` — braces dropped |
| Absent, or a default of nothing | the binding is **omitted** |

For an embedded token in longer text, a reference keeps its braces and a literal contributes its
text. This is the rule the proposal now carries, and it is not a refinement of the earlier one — the
earlier one silently turns literals into variable references, which the derivation would then look
for and not find.

### 2. An absent argument omits the binding rather than emitting an empty one

Four of the routine's inputs are optional forwards declared with an empty default, because "a routine
has no free variables" requires them to be declared. Emitting them produced
`assumptions_log: ""` — an explicit empty literal binding on a technique input, which is worse than
no binding at all: it overrides name-match resolution with nothing.

**An input whose resolved value is absent produces no binding.** In case 2 that correctly dropped
`comprehension_artifact` and `comprehension_log` from the assumptions-domain analysis step.

### 3. An unbound optional output is dropped, not defaulted to its own id

A technique step's unremapped output lands under its own id. Applying that to a routine would make
`residue_collection` — declared by the routine, not wanted by the comprehension site — land in the
session under the routine's internal name.

**An output the reference site does not bind is dropped from the materialised bindings.** A routine
output that may be left unbound says so; one that may not is a load failure when it is.

## Two corpus prerequisites the execution found

These are not spec questions. They are defects in the techniques the routine binds, and the
conversion makes them visible for the first time because it binds those techniques **as steps** where
previously they were invoked from another technique's prose.

### The fold technique over-declares its outputs

`analyse-challenge::combine` declares **ten** outputs. Five are domain aliases marked
"(when `concern_kind` is X)" — `open_assumptions`, `has_resolvable_assumptions`,
`has_open_assumptions`, `needs_comprehension`, `has_open_questions` — and two more,
`assumptions_log` and `comprehension_artifact`, are the same thing for the two domains' documents.

A conditional annotation in prose is not a condition. Bound as a step, all ten count, so the
comprehension activity was credited with writing three assumptions variables and the assumptions
activity with writing two comprehension ones.

The fix is the same move the routine makes one level up: **one neutral name, bound by the caller.**
Outputs become `concern_log`, `convergence_flag`, `residue_flag`, `residue_collection` — four — and
the reference site binds `concern_log` to `comprehension_artifact` or `assumptions_log` as the domain
requires.

### A prohibition written with variable names becomes four declared reads

`analyse-challenge::challenge` carries this protocol bullet:

> Do not write `{has_resolvable_assumptions}`, `{has_open_assumptions}`, `{needs_comprehension}`, or
> `{has_open_questions}` from a unit — isolation-then-combine

The derivation collects prose tokens that name no declared signature entry and treats them as session
reads. So a sentence whose entire content is *do not touch these* declares a read of all four, in
every activity that binds the technique.

The technique already states the same thing correctly, as a rule, without naming any variable:
*"Only combine writes convergence and residue flags after a challenge pass."* **The bullet is
redundant with a rule that says it properly, so it goes** — and with it, four spurious reads.

This is the finding from the first trial reproduced one level down, and it is worth stating as a
general rule for the corpus: **naming a session variable in prose is a declaration, whatever the
sentence around it says.**

## The result after both prerequisites

Both technique corrections were applied to the corpus temporarily, the conversion re-run, and the
corpus reverted (the `workflows` submodule is clean at `131e2942`).

### Case 1 — codebase-comprehension

```
Schema validation:  OK — validates as an ordinary activity
Step ids:           OK
reads:              matches the declared contract
writes:             matches the declared contract
```

The declared contract here was written before the materialiser existed, as a prediction. It was
wrong three times before the corrections and exact after them.

### Case 2 — plan-prepare, against its live declared contract

```
Schema validation:  OK — validates as an ordinary activity
Step ids:           OK
reads:              DECLARED BUT NOT DERIVED: has_open_questions, needs_comprehension
writes:             DERIVED BUT NOT DECLARED: has_resolvable_assumptions
```

**Both differences are the fix working, and neither is residue.**

`has_open_questions` and `needs_comprehension` are the two comprehension variables that
`run-loop`'s prose propagated into all seven of its binding activities. The conversion removes
`run-loop`, so plan-prepare stops reading variables from a domain it never runs. The migration
deletes the two declarations.

`has_resolvable_assumptions` is the convergence flag — written through a parameter today at six
sites and declared at none of them. The conversion makes the write visible to the producer index for
the first time. The migration adds the declaration.

**So after the conversion there is no unexplained difference in either direction.** Every remaining
line is a declaration edit the migration performs, and each one moves the corpus toward a contract
that is true rather than away from it.

## Blockers remaining

**None for W3.** The construct materialises, validates, prefixes, nests, monomorphises, and derives
the contract it claims to.

**None for W4 beyond work already specified.** Its prerequisites were named and all three have since
landed in the corpus:

| Prerequisite | Size | State |
|---|---|---|
| `continueWhile` on the loop step; `condition` removed from it; 19 loops re-keyed | 19 key renames plus a schema change and a guard | **Landed** 2026-09-06. `breakCondition` stays, with a rule scoping it to `forEach` — see [continuation-condition.md](continuation-condition.md) |
| `combine` declares four outputs over one neutral document name, not ten over two domains' names | One technique file, plus the routine's binding | **Landed.** The four are `concern_document`, `concerns_agent_resolvable`, `residual_opens_remain`, `residual_opens` |
| `challenge` drops the prohibition bullet that names four variables | One line | **Landed.** Only the `isolation-then-combine` rule remains |

**What replaces them is a re-derivation rather than a prerequisite.** The technique this conversion
converts was deleted on 2026-09-06 and its loop written onto activity steps, so the routines in
[conversion/](conversion/) carry a signature shaped by prose that no longer exists — seven inputs
against the three the landed sites parameterise, and four output ids of which two are shapes the
anti-pattern catalogue rejects. The duplication stage 6 removes is unchanged and re-measured. The
signature has to be taken again from the loop block as it stands. [gap-review.md](gap-review.md)
carries the comparison.

## The whole corpus, converted, through the whole guard suite

The strongest test available: copy the corpus, apply the convergence conversion in materialised form
at all seven sites, and run the registered guard suite over the result with `check-all --root`.

Baseline on the pristine corpus: **30 guards, 30 pass.** After conversion, iterating to green
surfaced five findings, in the order the suite reported them.

### 1. A nested reference's arguments are substitution fields

The first expansion injected `concern_log`, `convergence_flag`, `residue_flag` and
`residue_collection` — routine-internal output ids — into all six assumptions activities as session
variable declarations.

The cause is that `converge-concerns` holds a reference to `analyse-challenge-pass`, and a nested
reference's `with` and `outputs` maps are themselves fields that name things. Left unsubstituted, the
inner routine's declarations are collected under names local to the outer routine and leak into the
host. **The field list for substitution has to name a nested routine step's `with` and `outputs`
explicitly**; "a technique binding's input and output maps" does not cover them.

### 2. The merge change is a prerequisite, not an optimisation

With the corpus converted and the server unchanged, **four guards fail** —
`activity-variables`, `stealth-isolation`, `refs` and `workflow-yaml` — all with the same message:

> variable 'has_resolvable_assumptions': design-philosophy and requirements-elicitation defaults null
> and false

A declaration disagreement is a load failure, so it takes down every loader-based guard at once. The
two-line change treating an absent default as no opinion is not a tidy-up alongside the migration; it
**lands before any corpus conversion**, or the workflow does not load.

### 3. A routine output binding promotes a name into the declared namespace

Binding the routine's `concern_log` output to `assumptions_log` put that name into the workflow's
variable set. `assumptions_log` is declared **nowhere in the corpus today** — not on a workflow file,
not as any activity's read or write — so the contract system has never seen it, and every technique
that produces it does so invisibly.

The moment it is declared, every activity that writes it through any technique owes a declaration.
`requirements-elicitation` binds `review-assumptions::reconcile`, whose group contract declares
`assumptions_log` as an output, and it is **not a routine site at all**. Seven activities bind a
`review-assumptions::*` operation; six are routine sites and get the declaration injected, so the
blast radius here is one activity.

The principle is the finding: **binding a routine output to a name promotes it into the namespace for
the whole workflow, and the resulting declaration obligation lands wherever that name is produced —
including activities with no routine in them.**

### 4. Retiring a shell leaves its group contract behind

Three names still crossed undeclared after the per-technique corrections: `convergence_flag` and
`residue_flag`, produced by the **challenge** step under their generic ids.

`analyse-challenge/TECHNIQUE.md` declares the shell's three parameterised flag names as **group**
outputs, and a group contract is inherited by every operation in it. So the challenge step declares
them as outputs too, even though only combine sets them, and only combine's step remaps them. The
migration owes a group-contract correction on top of the two per-file ones: with the shell deleted,
those three belong to combine alone.

### 5. A routine needs internals, as a third declaration category

`challenge_findings` passes from the challenge step to the combine step and never leaves the routine.
Before conversion it lived inside two techniques' prose and the contract system never saw it. After
conversion it is an activity-level production in six activities, and the crossing rule reports it —
its test is whether any *other* activity mentions the name, and all six do, because all six carry the
same routine.

**This contradicts the settled rule that a routine's body reads and writes only declared inputs and
outputs.** `challenge_findings` is neither: it is internal to the run. The rule needs a third
category —

> A routine declares **inputs**, **outputs** and **internals**. An internal is a name the body's steps
> pass between themselves. Materialisation gives it a name prefixed from the reference site, so two
> references cannot collide and it can never be mistaken for a value crossing an activity boundary,
> and it never enters the workflow's variable set.

Simulating that — prefixing `challenge_findings` per reference site — clears the finding.

### The result

With the merge change applied to the server, the three technique corrections applied to the corpus,
the twelve declarations injected, the nine stale reads dropped, one declaration added to a non-routine
activity, and `challenge_findings` treated as internal:

**30 guards, 30 pass, 0 fail, 0 unmeasured** — the same as the baseline.

One correction the sweep made to a blanket edit is worth keeping: dropping the propagated reads is
not uniform. `assumptions-review` genuinely reads `needs_comprehension` because it routes on it, and
`codebase-comprehension` must lose its read of `has_open_questions` because the routine now writes it
there, making the read internal. The guard finds each case; a blanket removal is wrong in both
directions.

## The assumption run, converted and walked

The second migration — stage 5, the run that retires the shared gate bodies — converted at all four
sites, materialised into a scratch corpus, and put through the guard suite, the end-to-end walker and
the delivery snapshot. It is a different shape from the convergence run: a routine that opens with a
gate, a `forEach` loop with a per-iteration discriminator, and two names that never leave the run.

### An internal is a variable name, so its prefix carries the activity

Prefixing an internal from the reference site alone is not enough. All four sites use the same
reference id, so both internals materialised to the same name in four activities and the crossing
check reported all of them:

> produces 'reconcile_assumptions_assumption_presentation', which research, assumptions-review,
> implement consults, and no contract in this workflow declares it

**A step identifier only has to be unique within its activity; a variable name shares one flat
namespace across the whole workflow.** An internal's materialised name therefore carries the host
activity as well as the reference id, underscore-joined so it stays snake_case:
`implement_reconcile_assumptions_assumption_presentation`. With that, the sweep is clean.

**The same defect is latent in the convergence conversion and passed unnoticed.** There the internal
materialised as `converge-assumptions_challenge_findings`, whose hyphen the identifier tokeniser does
not recognise — so the derivation never saw the interpolation at all, and the run went green for the
wrong reason. An interpolation the contract system cannot see is worse than one it reports.

### The gate-body guard demands extraction of what is already extracted

Run over the materialised corpus, `duplicate-checkpoint` reports both of the routine's gates as
inline bodies repeated at four sites, remedy *extract a fragment*. That is the guard manufacturing
the pattern the routine replaced.

It is silenced in the final run only because the interpolated internal names differ per activity,
which is an accident rather than a resolution. **The real answer is the authored/materialised split**:
the fragment guard reads files as written, where it sees `kind: routine` steps and no inline bodies
at all. This run is a demonstration of the failure mode if that guard were placed on the wrong side.

### Two references in one activity

The case the identifier prefixing exists for, and which the corpus does not contain anywhere. Planted
by hand — a second reference to the same routine in one activity — the sweep is **30 of 30 clean**,
with distinct step identifiers (`reconcile-assumptions.*` against `reconcile-again.*`) and distinct
internals. This is the first actual test of the mechanism's central justification.

### The walker

`all-workflows-walk` and `step-execution-walk` over the converted corpus: **20 tests, all passing**.
The walker crosses the routine's batch gate and its per-item gate, with the iteration discriminator
resolving through `checkpointBaseId` unchanged.

### What convergence costs at delivery — a decision with a number

The drift census records the announcement's gating as one of the differences a person decides: three
sites announce unconditionally, one gates on review mode and residual opens. Converging on the gated
reading is measurable.

| Activity | Response characters | Eagerly bundled steps | Unanswerable gates |
|---|---|---|---|
| implement | 53,793 → 49,704 (**−4,089**) | 9 → 8 | 3 → 4 |
| implementation-analysis | 41,016 → 39,656 (**−1,360**) | unchanged | 3 → 4 |
| assumptions-review | 29,195 → 29,381 (+186) | unchanged | unchanged |

**This is not a saving.** The gated announcement reads `has_open_assumptions`, which its own activity
produces, so the gate has no answer at delivery time and the step's technique drops out of the eager
bundle — 5,263 characters that the worker fetches lazily instead, plus a round trip. Choosing the
ungated reading keeps it bundled and costs nothing.

So a convergence decision the census could only describe now has a price attached, and it is the
opposite of what the routine mechanism itself does. The measurement covers three of the four sites;
the walk path does not reach research.

### The corpus effect

Four activities lose `assumption_review_presentation` and `current_assumption` from their write
declarations — **eight declarations for two names, both of which are internals and neither of which
ever left the run**. Nothing is injected, because all four already declare the three names the
routine's outputs bind to. The `fragments` block is deleted from the workflow file.

## The settled run, measured

With the four content decisions taken — the log pass after the interview, two answers at the per-item
gate, the run referenced from two sites rather than four, and the announcement guarded on review mode
alone — the conversion was applied again and measured. **30 guards pass; the walker's 20 tests pass.**
Three things came out of getting there.

### Dropping a run does not drop the names

Removing the run from research and implementation-analysis left both activities still writing
`has_deferred_assumptions` and reading `assumption_outcome`, because the log-writing step that stays
behind declares the first as an output and the second as an input. Removing the run's declarations
wholesale was wrong twice over, and the guard walked it back one finding at a time:

| Name | At a dropped site |
|---|---|
| `needs_individual_interview` | Goes — only the batch gate wrote it |
| `assumption_outcome` | Moves from a **write** to a **read** — the gates wrote it, the remaining record step consumes it |
| `has_deferred_assumptions` | Stays a write — the remaining record step produces it |
| `is_review_mode` | Goes at research, stays at implementation-analysis, which still gates on it elsewhere |

**Dropping a shared run changes an activity's relationship to a name, and sometimes reverses its
direction.** A migration cannot assume the run's signature is what the activity loses.

### The announcement decision has a prerequisite nobody had named

Guarding the announcement on review mode alone was chosen because that guard is answerable when the
activity is handed over, so the announcement stays in the delivered bundle. Measured, it was not:

```
implement   response_chars 53,793 -> 49,672   lazy_gate_unbound 0 -> 1
```

The reason changed from *pending* to *unbound* and the outcome did not, because **`is_review_mode`
carries no default**. A gate reading an unseeded variable is as unanswerable as one reading a value
the activity has yet to produce.

Seeding it — one line on the workflow file — makes the guard answerable and the prediction holds:

| Activity | Without the seed | With it |
|---|---|---|
| assumptions-review | 29,349 (3 bundled steps) | **33,731 (4 bundled steps)** |
| implement | 49,672 (8 bundled steps) | **54,011 (9 bundled steps)** |

So the announcement decision is sound and **carries a one-line prerequisite**: a boolean flag that
gates steps across the corpus has to be seeded, or every gate reading it is unanswerable at delivery.

### The seed needs the merge change too

Adding `defaultValue: false` to `is_review_mode` immediately failed the load:

> variable 'is_review_mode': workflow.yaml and start-work-package defaults false and null

The activity that owns the flag declares it without a default, so seeding the workflow file
contradicts it. This is the same rule the routine's own declarations run into, met from a completely
different direction — an ordinary corpus edit, no routine involved. With the two-line merge change
applied, the sweep is **30 of 30**.

**That settles the sequencing argument.** The absent-default change is not a routine prerequisite; it
is a prerequisite for editing this corpus at all, and routines are simply the first thing to hit it.

### The net delivery effect

Across the three activities the walk reaches, with the seed and the merge change in place:

| Activity | Response characters | Cause |
|---|---|---|
| implementation-analysis | **−8,351** | The run is gone, and with it three gates the server could not answer |
| assumptions-review | +4,536 | The announcement returns to the bundle |
| implement | +218 | Roughly neutral |
| **Net** | **−3,597** | |

The saving is the once-per-run decision, not the routine. The routine's own effect on delivery
remains what it was: nothing.

## What the re-run did not test

Stated plainly, because a clean result over a partial surface is easy to overread. This list covers
the whole exercise, the corpus-wide sweeps above included — the two sections before it record the
guard suite and the walker run over a converted corpus, so neither appears here.

- **The raw-YAML delivery path.** The prototype substitutes over parsed objects. The second
  representation — the same substitution over YAML text, at the right indentation — is untested and
  remains the largest single cost in the proposal.
- **The agent that reads the delivered text.** Nothing here exercises the worker protocol, and while
  there is no runner that protocol is where a generated identifier is finally consumed — a worker
  assembles a per-iteration checkpoint key by hand from the template the text shows it. What that
  requires of the text path is in [agent-interpretation.md](agent-interpretation.md).
- **The real loader.** The prototype is not the loader, so ordering against fragment materialisation,
  borrowed-activity scoping and the technique bundler is unverified. The sweeps ran the guards and
  the walker over a materialised corpus; nothing ran materialisation *inside* the load path.
- **The other five sites.** Two of the seven convergence sites were converted. The remaining five are
  the same shape as case 2 and were not run.
- **The guards the suite has gained since.** The sweeps were run against a 30-guard registered
  suite; there are now 37 `check-*` scripts and 19 of them read activity files, five of which the
  proposal's classification does not reach.
