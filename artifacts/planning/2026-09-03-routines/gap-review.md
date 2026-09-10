# What this folder owes before planning starts

Companion to [README.md](README.md), for [#531 W3/W4](https://github.com/m2ux/workflow-server/issues/531).
A review of the whole folder against the system it describes, taken before planning and
implementation are scheduled. Every claim below was checked against the code and the corpus rather
than against another document in this folder.

Re-measured on 2026-09-07 against the server at `f315b772` and the `workflows` branch at
`b5e54574`. The folder's own measurements were taken against the server at `4740f4d6` and
`workflows` at `131e2942`, four days and roughly forty commits earlier.

**The design holds. The evidence under it has moved.** Materialisation, the signature boundary,
identifier prefixing and nesting are settled with execution behind them, and nothing below reopens
any of that. What has changed is the corpus: six of the eleven defects this work found are fixed,
one was decided the other way, two content decisions were answered against the record, and the
technique the conversion converts no longer exists. Twelve gaps follow, in the order they block
work.

## The state of the folder's evidence

| # | Gap | Blocks |
|---|---|---|
| 1 | Six findings are fixed and four documents still argue from them | Everything that cites the register |
| 2 | B6 is assigned to an issue that closed before it was written | The census window count, the persist pairing |
| 3 | The conversion artifacts descend from a deleted technique | Stage 6, the capability-bound decision |
| 4 | `breakCondition` survives; stage 0 is recorded as having deleted it | Reading stage 0 as complete |
| 5 | The corpus answered the per-item gate with three options, not two | Stage 2 |
| 6 | Census rows 5 and 6 change behaviour and carry no direction | Stage 2 |
| 7 | The guard classification is measured against a smaller suite | Stages 3 and 4 |
| 8 | `check-variable-model` rejects a routine's authored gate | Stage 3 — **settled below** |
| 9 | The loader-consumer set is wrong in both directions | Stage 4 |
| 10 | `internals` has no declaration shape on the record | Stage 3 — **settled below** |
| 11 | Placement says nothing about a routine referred to only by routines | Stage 4 — **settled below** |
| 12 | Five stages carry no acceptance criteria | Scheduling any of them — **settled below** |

## 1. Six of the eleven findings are fixed, one is reversed, and one is still open

[findings-register.md](findings-register.md) is the input to four other documents. Checked
finding by finding against the corpus and the server:

| Finding | State | Evidence |
|---|---|---|
| A1 — a prohibition naming four variables | **Fixed** | `analyse-challenge/challenge.md` carries the `isolation-then-combine` rule and no bullet naming a flag |
| A2 / A3 — parameterised writes nothing declares | **Fixed** | The sites bind `combine` with real output remaps; `06-plan-prepare.yaml` declares `has_resolvable_assumptions` as a write |
| A4 — a group output the corpus declares nowhere | **Fixed** | `assumptions_log` is a declared write at the producing activities |
| B1 — repeat-until loops that never run | **Fixed** | `continueWhile` is on the loop step, `condition` is not, and no loop step in the corpus carries one |
| B2 — the unused early-exit field | **Reversed** — see gap 4 | `breakCondition` is still on `LoopStepSchema` |
| B3 — schema and code disagree on loop variables | **Open** | `variable.schema.ts` says a loop variable is not declared; `activity-variables.ts` writes it into the produced set |
| B4 — a fold declaring ten outputs | **Fixed** | `combine.md` declares four: `concern_document`, `concerns_agent_resolvable`, `residual_opens_remain`, `residual_opens` |
| B5 — a group contract holding flag names | **Fixed** | `analyse-challenge/TECHNIQUE.md` declares `challenge_perspectives` and `concern_document` |
| B6 — five audits persisting twice | **Open** — see gap 2 | `workflow-design/activities/08-quality-review.yaml` still binds `write-artifact` for all five filenames |
| C1 — an unseeded review-mode flag | **Fixed** | `is_review_mode` carries `defaultValue: false` on the workflow file |
| C2 — an absent default read as a disagreement | **Landed** | `disagreement` compares two present defaults only, and `fillSilences` fills from whichever site names one |

So the register's recommended order — "**C2 first**, then B1" — describes work that is done, and its
cost table prices eight rows that no longer cost anything.

**What this changes elsewhere.** Four documents argue from a superseded premise:

- The capability-parameter decision resolves on "the fix B4 already prescribes for one technique,
  applied to a family". B4's fix has landed. The decision's reasoning has to be re-run against
  neutral names that exist rather than neutral names that were predicted — and the prediction was
  exact, which strengthens rather than weakens it.
- [conversion-rerun.md](conversion-rerun.md) lists B4 and B5 as the two remaining W4 prerequisites.
  Neither remains.
- The README's *Future features* section qualifies the 42-site `write-artifact` count by B6, which
  is correct and still stands.
- The README's header asserts that apart from two re-based figures "every other figure still
  stands". It does not.

**Investigate:** close the register out — one line per finding recording where it was fixed, B3
carried forward, B6 rehomed. Then re-cost what is left.

## 2. B6 is assigned to a closed issue

B6 was measured on 2026-09-07 and assigned to
[#593](https://github.com/m2ux/workflow-server/issues/593), which closed on 2026-09-04 at 14:12:40Z.
[#594](https://github.com/m2ux/workflow-server/issues/594) closed a minute earlier. The finding is
live: every one of the five audits still declares an artifact its calling activity writes a second
time under the same filename.

B6 is load-bearing for three things in this folder — whether the census has fourteen maximal windows
or twelve, whether the producer-plus-persist routine has a constituency, and whether the 42-site
`write-artifact` count can be read as one. All three are parked on a finding with nowhere to be
fixed.

**Investigate:** raise B6 on its own, or on the epic. It is five write steps or five technique
files, and it decides two of the census's windows.

## 3. The conversion artifacts descend from a technique that was deleted

The folder records that `analyse-challenge::run-loop` was deleted on 2026-09-06 and treats the
consequence as a change of *motivation* — control flow in prose became control flow in structure.
The consequence for the *conversion* is unrecorded, and it is larger.

The routine definitions in [conversion/routines/](conversion/routines/) are shaped by the deleted
prose:

| What the artifact carries | What the landed sites carry |
|---|---|
| Seven inputs, including `concern_kind`, `assumptions_log`, `comprehension_artifact`, `comprehension_log`, `target_path` | Three parameterised values: the analysis operation, `challenge_perspectives`, `concern_document` |
| Outputs `concern_log`, `convergence_flag`, `residue_flag`, `residue_collection` | `concern_document`, `concerns_agent_resolvable`, `residual_opens_remain`, `residual_opens` |
| No `internals` block in `converge-concerns.yaml` | `challenge_findings` is a declared activity-level write at six sites |
| An internals comment stating the prefix comes from the reference site | The settled rule joins the host activity to the reference site |

Two of the artifact's four output ids are shapes the live catalogue names as defects:
`boolean-id-shape` (AP-64) rejects a `…_flag` burial and `collection-id-shape` (AP-65) rejects a
`*_collection` suffix. The corpus has already replaced all four with conforming names, so
re-deriving the conversion from the artifact would reintroduce two anti-patterns that the fix for B4
removed.

**What still stands.** The stage-6 measurement is intact, re-measured at `b5e54574`: six activities
carry a byte-identical 32-line loop block under one SHA, and `15-codebase-comprehension.yaml`
carries an 80-line variant. The duplication the stage exists to remove is exactly where the README
says it is.

**What has to be re-derived.** The signature, and everything measured on it: the seven-input union
the capability decision discusses, the 105-character step id and 124-character response key in open
the identifier-length item, and the substitution examples. The re-derived signature is smaller —
three inputs and four
outputs against seven and four — which moves several of those numbers down rather than up.

**Investigate:** re-derive both routines against the landed loop block before stage 6 is planned,
and re-take the identifier-length item's measurements from the result. The conversion artifacts are
marked "read
before implementing materialisation"; a planner reading them today reads a pre-deletion shape.

## 4. `breakCondition` survives, and stage 0 was recorded as having deleted it

Stage 0 is landed, and three quarters of its deliverable list landed as specified: `continueWhile`
is on the loop step, `condition` is not a loop field, no loop in the corpus carries one, all
repeat-until loops carry their test under the new key, and `scripts/check-loop-shape.ts` enforces
the shape. The fourth item was the deletion of `breakCondition`.

`breakCondition` was kept, deliberately, and given a rule instead — re-described as a forEach early
exit that stops a walk part way through a collection, and forbidden on a `while` or `doWhile`, which
"already decides each pass in `continueWhile`". The guard's own header records the reasoning: the
field "earns a rule of its own rather than a deletion".

That is a better answer than the one this folder recorded, and the record was wrong in four places:
the stage-0 row, the continuation-test decision, finding B2, and
[continuation-condition.md](continuation-condition.md)'s recommendation and acceptance criteria. The
field is still unused at zero sites, so the finding that nothing exercises it is intact; what changed
is the disposition.

**Nothing to decide, and the four statements are corrected.** One consequence carries into the
construct and is recorded with it: a routine body's `forEach` may carry an early exit, so
`breakCondition` is one of the fields materialisation substitutes over, which the field list did not
name.

## 5. The corpus answered the per-item gate the other way

The record settles the per-item gate at **two** answers, reasoning that the third outcome value,
`corrected`, "is read by no gate, condition or protocol" and that therefore "the resource is
corrected to match the gates rather than the other way round".

The corpus did the opposite. The shared `assumption-decision` body now carries three options —
`resolve-inline`, `correct-assumption` writing `assumption_outcome: corrected`, and
`defer-to-stakeholder` — and `review-assumptions/record.md` documents the three-term vocabulary as
the outcome set. The one site that carried three options by hand no longer carries them by hand:
`07-assumptions-review.yaml`'s per-item gate is now `ref: assumption-decision`, like the other
three.

So two of the census's ten differences are converged already, in the corpus, without a routine:
row 8, the inline-versus-reference split, and row 9, the option count. Row 9 was one of the two
differences the census reserved for a person, and the person answered it the other way.

**Investigate:** restate the decision as the corpus made it, and re-check what is left of stage 2.
Of the four content decisions recorded, one is now moot (the gate's option set), one is applied
(row 9's converged body), and two remain — where the log pass sits and how often the run happens.

## 6. Two census rows change behaviour and carry no direction

Rows 5 and 6 record the `is_review_mode != true` conjunct as present at two sites and absent at
two, on the batch-record gate and the loop gate respectively. Both are classed "Mechanical — one
gate, once".

One gate once is the mechanism, not the content. Adding the conjunct changes behaviour at the two
sites that omit it; dropping it changes behaviour at the two that carry it. The census's closing
paragraph counts only rows 1 and 9 as behaviour-affecting, which undercounts by two.

The once-per-run decision drops the run from research and implementation-analysis, so the question
narrows to the two surviving sites: `implement`, which omits the conjunct, and
`assumptions-review`, which carries it. They still disagree, and a routine has one body.

**Investigate:** decide which conjunct the converged gate carries, and record it beside the other
content decisions. With rows 1, 8 and 9 settled or converged, this is the residue of stage 2.

## 7. The guard classification is measured against a smaller suite

The classification names sixteen guards reading activity steps out of a suite of thirty-five. There
are now **thirty-seven** `check-*` scripts, and **nineteen** of them read activity files.

Five are unclassified, and three of the five have subject matter the routine construct changes
directly:

| Guard | Why it matters here |
|---|---|
| `check-variable-model` | Its `setvariable-undeclared` rule rejects a routine's authored gate — gap 8 |
| `check-loop-shape` | Stage 0's own guard; a routine body owning a loop is the form it audits |
| `check-checkpoint-presentation` | A routine body's gates are checkpoint bodies |
| `check-inherited-inputs` | Container-contract inheritance, which a routine deliberately does not have |
| `check-identifier-qualification` | Symbol-id shape, which generated names and routine output ids have to satisfy |

The corpus has also grown under the census: 996 steps across 122 activity files against 964, and 54
loops against 46 — 27 `forEach` unchanged, `while` 10 to 13, `doWhile` 9 to 14. Eight of the new
loops are repeat-until, which is the form stage 6 puts inside a shared definition.

**Investigate:** extend the authored/materialised classification to all nineteen, and re-take the
step census. The classification is the specification for stage 4's work, so a guard missing from it
is work missing from the stage.

## 8. A hard-zero guard rejects a routine's authored gate

`check-variable-model` carries `setvariable-undeclared`: a checkpoint option's `setVariable` must
name a variable declared in the workflow's `variables[]`. It is hard-zero, with no baseline.

A routine body's gate sets a variable named by one of the routine's **output ids**, and an output id
is not a workflow variable — it becomes one only when a reference site binds it. So every gate in
every routine violates the rule as authored, and the violation is by construction rather than by
mistake.

**Settled: the guard reads `routines/` as written, and a routine file is its own name scope.** The
classification's own principle decides the direction. `setVariable` is a field an author writes, and
routing the guard through the loader would have it audit generated names — which is the failure the
`check-set-action-values` case is used to rule out, a step's `value: initialActivity` and
`value: "{initialActivity}"` being a character apart and that field being one substitution is
guaranteed to rewrite. So the guard stays in the authored column and gains a scope: inside a
`routines/` file, a declared output or internal satisfies `setvariable-undeclared`, and a workflow
variable does not, a routine having no free variables.

Its other four rules take the same scope, and each has an answer rather than an assumption:

| Rule | Inside a routine file |
|---|---|
| `setvariable-type-mismatch` | Applies where the target is an output; silent on an internal, which declares no type |
| `setvariable-outside-value-set` | The same |
| `default-type-mismatch` | Applies to a routine input's default against its declared type; an output declares no default |
| `exists-on-defaulted` | Extends to an `exists` gate on a defaulted input, constant for the reason it is constant on a defaulted variable |

Recorded in [decisions.md](decisions.md) under the system boundary, and in the README's guard
section.

## 9. The loader-consumer set is wrong in both directions

The README states that four guards take activities from the loader — `check-audience`,
`check-stealth-isolation`, `check-activity-variables` and `check-session-contract` — and then, two
paragraphs later, the classification table's materialised column names four *different* guards:
`check-checkpoint-entry`, `check-decision-order`, `check-review-mode-gating` and
`check-binding-fidelity`.

Checked against the scripts, **six** guards consume the loader: the four the prose names, plus
`check-all-refs` and `check-artifact-guides`. None of the four in the table does.

So the table's second column is not a classification of where guards sit — it is a specification for
moving four guards onto the loader, which is unscoped implementation work presented as a description.
And the two loader consumers the folder never mentions have no assigned side, though `check-all-refs`
is one of the four guards the converted-corpus sweep reported failing.

**Investigate:** separate the two claims. State where each of the nineteen sits today, and list
separately which have to move and what moving each costs.

## 10. `internals` has no declaration shape on the record

The internals category is settled across three documents and demonstrated in one artifact, and its
schema is written down nowhere. The README's canonical routine example shows `inputs`, `outputs` and
`steps` only. `assumption-reconciliation.yaml` carries the block with `id` and `description` and no
type. `converge-concerns.yaml`, whose `challenge_findings` is the value that forced the category
into existence, has no block at all.

**Settled: an internal declares an id and a description, and nothing else.** No type, no default, no
value set — because an internal never enters the workflow's variable set, so nothing merges it,
nothing seeds it and nothing holds one declaration against another, and a type would be a field with
no reader. The standing that gives it is the one the variable schema already gives intra-activity
dataflow: a name written by an earlier step of the same activity is resolved internally and is not
declared. An internal is that, scoped to a run rather than an activity.

Two consequences, both accepted. A value passed between a routine's steps is not type-checked, in
exactly the way a value passed between an activity's steps is not. And a gate inside a routine may
set an internal, which no declared type validates — which is why the guard in gap 8 reports a type
mismatch on an output and stays silent on an internal.

An internal may be a loop's item variable, `current_assumption` being one at four sites, and may
hold a collection under the ordinary id-shape rules. It may not go undeclared: the no-free-variables
rule admits three categories, and a body naming anything outside them fails the load, like every
terminal state of the reference lifecycle but `Checked`. A declared internal nothing writes, and one
nothing reads, each fail the load too — the treatment the signature check already gives an unwritten
output and an unread input.

**One consequence is a subtraction the migration record did not list.** `challenge_findings` is a
declared write at six activities, added by the same remediation that fixed A3, so applying this rule
removes six declarations rather than adding any. It is now a stage-6 criterion.

Recorded in [decisions.md](decisions.md), and the README's example carries the block — along with a
correction the example needed anyway: its outputs no longer carry the `defaultValue` the
no-default rule had already forbidden them.

## 11. Placement says nothing about a routine referred to only by routines

[placement.md](placement.md) closes by deferring the least-common-ancestor rule: "Nesting is out of
the first version, so placement has one level to reason about. If nesting is later allowed, a
routine referenced only by routines has no referring activity file and the rule above says nothing
about it."

Nesting is not out of the first version. It is settled as required, the first conversion needs it,
and the executed re-run exercised it. The premise the deferral rests on is gone, so the open
question is live rather than anticipated.

It is not yet *binding*: `analyse-challenge-pass` is referred to by an activity as well as by
`converge-concerns`, so it has a home under the rule as written. The first routine referred to only
by other routines has no home at all, and the placement guard has no verdict to give.

**Settled: a referrer is an activity file or another routine, and the set is closed transitively.** A
routine's referrers are the activity files that reference it plus the referrers of every routine that
references it, and its home is the workflow owning that set, or the shared home when the set spans
two. It is adopted with the construct rather than when the case arrives, because the closure is the
same walk cycle detection already performs and the alternative is a guard that returns nothing.

**And the same closure settles the other rule nesting outran.** A routine declares an artifact when
its own body binds a technique declaring one **or when any routine it references does**. Read at one
level, the one-reference-per-activity limit is evaded by wrapping: a routine declaring nothing
itself, referencing one that declares an artifact, could be referenced twice and write one filename
twice. Depth needs no bound of its own — cycle detection terminates the walk, and how long the
composed prefix may grow is the identifier-length item, a question about identifiers rather
than placement.

Recorded in [decisions.md](decisions.md), [placement.md](placement.md) and the README. Placement's
open-questions section now holds one question rather than three.

## 12. Five of the seven stages carry no acceptance criteria

Stage 0 has seven, in [continuation-condition.md](continuation-condition.md). Stage 3 has two, added
by [agent-interpretation.md](agent-interpretation.md). Stages 1, 2, 4, 5 and 6 have none — and
stages 2, 5 and 6 are the ones that change what happens at live sites.

Two related plan mechanics are missing with them.

**The stage dependency table omits the prerequisites the simulations proved.** Stage 5 depends on
"2, 4" and stage 6 on "5". Neither names the absent-default merge change that the executed sweep
proved is a precondition for editing the corpus at all, nor the review-mode seed, nor B4 and B5.
Those four have since landed, so the table needs rebuilding against what remains rather than
extending — but the omission is the reason it read as complete when it was not.

**The delivery-budget measurement has no stage.** "Measured before it is ruled on" is the right
disposition and there was nowhere in the plan for the measuring to happen, no baseline named, and no
criterion saying what the measurement would have to show for a rule to be needed.

**Settled: criteria are written for stages 1 to 6**, in the README beside the stage table, on the
model of stage 0's. They give the delivery-budget measurement its home — stages 5 and 6 each
re-record the baseline and require the change in bundled characters at each site to be reviewed
against the measured prediction rather than accepted by regeneration, which is the measurement the
rule was waiting on.

**One criterion is stated once for every stage that changes live behaviour, and it is a judgement
rather than a measurement: such a migration is walked before merge**, with each changed site's
observed outcome compared against what its recorded disposition predicted. The precedent is stage
0's — six `doWhile` bodies that had never run in a recorded walk were required to be reviewed rather
than accepted on a green suite. It binds stages 2, 5 and 6. Stage 2 changes no definition, so if the
requirement is heavier than wanted anywhere, that is the place to relax it.

The dependency column stays as it is: the prerequisites it omitted have all landed, so it is now
complete rather than short. What remains is that a reader cannot tell from the table which
prerequisites were paid, which the stage-0 paragraph beneath it now says.

## Two things worth recording that are not gaps

**The two consumers of a generated identifier fail differently, and only the fail-silent one is left
to the worker.** `get_technique` resolves a step id by exact match and throws with the full list of
available ids when it misses, so a mis-typed prefixed step id is a loud failure with a remedy in the
message. A mis-composed checkpoint instance id is the opposite: `checkpointBaseId` splits on the
first `#`, so the server records a new checkpoint and re-asks a question whose answer already
exists. Both identifiers are generated by the same mechanism and consumed by the same agent. That
asymmetry is the sharpest form of the argument for the server composing the instance id, and it is
recorded in [agent-interpretation.md](agent-interpretation.md).

**The prediction the folder made about neutral naming was exact.** B4's prescribed fix was "one
neutral document name the caller binds, and four outputs instead of ten". The corpus landed
`concern_document`, `concerns_agent_resolvable`, `residual_opens_remain` and `residual_opens`, bound
at each site by an output remap. The capability-bound decision rests on that fix, and the fix
arriving independently and identically is the strongest available evidence for the decision — which
is worth saying, because gap 1 otherwise reads as the decision having lost its ground.

## What this pass corrected, and what is left

Some of these gaps are the record disagreeing with the system, and correcting the record closes
them. The rest are work. The corrections were applied when this review was written, so the folder
now describes the system as it stands and the list below is what remains.

| Gap | Settled or corrected in place | Left as work |
|---|---|---|
| 1 | Each finding's state recorded in [findings-register.md](findings-register.md); the four documents arguing from a superseded premise re-based | B3 to fix |
| 2 | **Settled** — B6 raised as [#637](https://github.com/m2ux/workflow-server/issues/637), and B7, found in the second pass, as [#638](https://github.com/m2ux/workflow-server/issues/638) | Fix both |
| 3 | **Settled** — [re-derivation.md](re-derivation.md) takes the signature from the landed block: two routines, no capability parameter, no inputs on the outer one | Name the two routines; re-take the identifier-length measurements |
| 4 | All four statements, and `breakCondition` added to the substitution field list | — |
| 5 | The decision restated as the corpus took it; census rows 8 and 9 marked converged | — |
| 6 | **Settled by dataflow** — row 5's conjunct required, row 6's redundant, and two sites recording an unasked answer raised as B7 | Fix B7 |
| 7 | **Settled** — all eight missing guards classified, and the window search re-run and kept runnable in [measure/](measure/) | `check-activity-technique-overlap` needs routine awareness |
| 8 | **Settled** — the guard reads `routines/` as written, with a routine file as its own name scope, and each of its five rules dispositioned | Implement |
| 9 | The description and the specification separated, with the true loader set named | Cost the four moves |
| 10 | **Settled** — an internal declares an id and a description and nothing else; it may be a loop item or a collection; undeclared, unwritten and unread each fail the load. The README's example carries the block, and its outputs lose the defaults the rule already forbade | Implement; the six declaration removals are in stage 6's criteria |
| 11 | **Settled** — a referrer is an activity file or another routine, closed transitively, and the same closure decides whether a routine declares an artifact | Implement |
| 12 | **Settled** — criteria written for stages 1 to 6, with walk-before-merge stated once for every stage that changes live behaviour | — |

**Four gaps are now settled specification** (8, 10, 11, 12), four closed with the record (4, 5, and
the record halves of 1 and 6), and the rest carry work. Two of the settled four were decided from
evidence already in this folder rather than from new measurement: the guard's column follows the
classification principle that the `set`-value case established, and an internal's shape follows from
its never entering the variable set.

**One judgement is stated as an assumption rather than a measurement.** Walk-before-merge for a
migration that changes live behaviour is taken from stage 0's precedent — six `doWhile` bodies that
had never run were required to be reviewed rather than accepted on a green suite — and applied to
stages 2, 5 and 6. If that is heavier than wanted for stage 2, which changes no definition, the
criterion is the one to relax.

## The order to take these in

## The second pass

Gaps 3, 6, 7 and part of 2 were taken in a second pass on the same day, and two of them turned out
to carry more than a re-measurement.

**The window search, corrected, changes stage 6.** The script in [measure/](measure/) reproduces the
census's method and adds the recursion it lacked, finding **26 maximal shared windows against
fourteen — five of them inside a loop body**, and the widest sharing in the corpus by activity count
is one of the five. Both migration targets are now directly measurable at the grain a
routine would carry them, and the convergence run's two-level split is confirmed by measurement
rather than argued from one divergent site.

**The re-derivation removes the capability parameter from the first version.**
[re-derivation.md](re-derivation.md) takes the signature again from the landed loop block. The
shared body is the challenge pass, not the analysis pass, because `revise-questions` sits between
the analysis and the challenge at the seventh site; the analysis is therefore outside the routine;
and the six sites that do share it share the same operation. So nothing binds a technique by
parameter, the outer routine has **no inputs at all**, and three guarantees carry no exception
through the two migrations. The proposal's claim that "the corpus needs this" was true of the deleted
technique.

**A later pass found the parameter's sites in another family** — three `prism` per-unit passes,
measured on 2026-09-08 and taken as stage 7, where the qualifier returns for those routines only.
The re-derivation's finding is unaffected: it is about the convergence family, and the two signatures
it derives take no parameter. [higher-order-routines.md](higher-order-routines.md) carries that
measurement, along with the fan-out run that needs no parameter at all and the two things a
set-valued parameter waits on.

**The review-mode conjunct is settled by dataflow, and it was a live defect.** Tracing the flag
those gates test — one writer, review-mode-guarded, seeded false — makes row 6's conjunct redundant
and row 5's required, and shows two activities recording a batch answer in review mode having asked
nobody. That is finding B7, and it is the only one of the twelve that produces a wrong record in a
real run rather than a wrong declaration.

**The guard classification is complete, and one guard needed more than a column.** Eight guards were
missing from the table and each now has one. `check-activity-technique-overlap` is the exception:
read as written it cannot see an overlap a routine introduces, and read through the loader it would
audit generated bindings, so it needs routine awareness in the authored column. Two guards this
review first listed as unclassified read technique markdown rather than activity files.

## The four questions put to the owner

Settled on 2026-09-07, and one of them by dissolving rather than choosing.

**Where a routine shared by two workflows lives — `meta`, because the resolution is the corpus's
own.** The question was posed as a choice between reusing the `meta` fallback, inventing a shared
root, and a workflow declaring its exports. The answer given was to reference a routine the way the
corpus references a shared technique, which *is* `meta`: a bare technique path already falls back
there, and a routine resolves as `[workflow::]name` by the same rule. One resolution rule for the
corpus rather than two is a better argument than the cheapness the record first offered, and the
exports idea returns to the typed language, which is where the polymorphism survey put it.

**Which side stops writing the findings files — the five write steps go.** The audits keep
persisting and their reported paths are the contract. Recorded on
[#637](https://github.com/m2ux/workflow-server/issues/637).

**The overlap guard gains routine awareness in the authored column.** Its overlap test resolves a
reference step to the routine's own step bindings, keeping the rule hard-zero over what an author
wrote. It stays the only guard where the authored/materialised split is not by itself enough.

**Both routines, nested.** The challenge pass is named on its own, so the comprehension site shares
it rather than keeping a copy — carried by the measurement, since that pass is shared by seven
activities and no other shape lets the seventh site participate. Nesting is therefore load-bearing
in the first version rather than merely available in it.

## What is left

1. **Fix B7 and B6**, raised as [#638](https://github.com/m2ux/workflow-server/issues/638) and
   [#637](https://github.com/m2ux/workflow-server/issues/637). B7 is four gate edits and the only
   live wrong behaviour in the register; B6's disposition is decided.
2. **Re-take the identifier-length measurements** against the re-derived signature, whose composed
   prefix runs to four segments. This is the prerequisite for the two remaining open items, which
   are one question at two depths and should be put to the owner together, after the numbers.
3. **Cost the four guard moves** the loader column implies (gap 9).
4. **Name the two routines.** `challenge-concerns` and `converge-assumptions` are proposed in
   [re-derivation.md](re-derivation.md), not settled — the only open item here that a multiple
   choice does not fit.
5. **Sequence stages 5 and 6 against each other** at the two activities where their runs are
   contiguous.
6. **Fix B3** wherever the loop work next lands.

Nothing here reopens the construct. Gaps 1 to 6 were the evidence base catching up with a corpus
that moved; 7 to 9 were scope the guard suite grew; 10 to 12 were specification the design had
settled in prose and never written down, and are now written down.
