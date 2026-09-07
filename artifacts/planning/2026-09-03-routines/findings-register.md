# Defects found on the way to routines

Companion to [README.md](README.md). Twelve defects that surfaced while designing and simulating the
routine construct, **none of which needs a routine to fix**. They are gathered here because they were
found by one exercise and belong to another: each is a defect in the corpus or the server as it
stands today, and each is separable from the construct that exposed it.

Measured between 2026-09-03 and 2026-09-04 against the server at `4740f4d6` and the `workflows`
branch at `131e2942`, except B6, measured on 2026-09-07 while testing whether a capability parameter
needs a declared bound. Every count below was taken by parsing the definitions with the reader the
guards use, or by running the guard suite and the end-to-end walker against a scratch copy of the
corpus.

They were raised as two issues, split by what each one touches:

- **[#593](https://github.com/m2ux/workflow-server/issues/593)** — definitions only. Group A, plus
  B4 and B5.
- **[#594](https://github.com/m2ux/workflow-server/issues/594)** — the engine. B1, B2 and group C.

B3 sits between the two and is carried by neither; it is a paragraph of prose against one line of
code and belongs wherever the loop work lands.

## Where each one stands

Both issues closed on 2026-09-04. Re-checked on 2026-09-07 against the server at `f315b772` and
`workflows` at `b5e54574`, finding by finding, against the code and the corpus rather than against
the issue:

| | Finding | State |
|---|---|---|
| A1 | Prohibition naming four variables | **Fixed** — `challenge.md` carries the rule and no bullet |
| A2 + A3 | Parameterised writes nothing declares | **Fixed** — the sites bind `combine` with output remaps and declare the writes |
| A4 | Group output the corpus never declares | **Fixed** — `assumptions_log` is declared where it is produced |
| B1 | Repeat-until loops that never run | **Fixed** — `continueWhile` carries the test and no loop step carries a `condition` |
| B2 | The unused early-exit field | **Decided the other way** — see below |
| B3 | Schema and code disagree on loop variables | **Open** |
| B4 | Fold operation declaring ten outputs | **Fixed** — `combine.md` declares four over neutral names |
| B5 | Group contract holding a shell's flag names | **Fixed** — the group declares `challenge_perspectives` and `concern_document` |
| B6 | Five audits and their callers both persisting | **Open**, raised as [#637](https://github.com/m2ux/workflow-server/issues/637) |
| B7 | A batch answer recorded in review mode | **Open**, raised as [#638](https://github.com/m2ux/workflow-server/issues/638) |
| C1 | Unseeded review-mode flag | **Fixed** — `is_review_mode` carries `defaultValue: false` |
| C2 | Absent default read as a disagreement | **Fixed** — `disagreement` compares two present defaults only |

**B2 was answered better than this register proposed.** `breakCondition` stays on the loop step,
re-described as a `forEach` early exit that stops a walk part way through a collection, and
`check-loop-shape` forbids it on a `while` or `doWhile`, which already decide each pass in
`continueWhile`. The measurement holds — the field is still at zero sites — and the disposition is a
rule rather than a deletion. Four statements in this folder describe the deletion and are corrected
in place.

**B6 and B7 arrived after both issues closed and are raised on their own.** B6 was measured three
days after #593 closed and assigned to it in retrospect; it is live in the corpus, and it decides two
of the drift census's windows. B7 was found on 2026-09-07 while settling two census rows. They are
[#637](https://github.com/m2ux/workflow-server/issues/637) and
[#638](https://github.com/m2ux/workflow-server/issues/638).

The gap review that took this pass is [gap-review.md](gap-review.md).

## How they were found

Three exercises, in order. A census of the corpus for repeated runs of steps and for control flow
written as prose. A hand conversion of one activity and the technique it binds, followed by the same
conversion executed through a prototype and the real contract derivation. Then the whole corpus
converted in a scratch copy and put through all thirty guards, the walker, and the delivery snapshot.

Each exercise was looking for something else. These are what it walked into.

## A — the contract system is being told the wrong thing

The activity contract exists so that a value crossing between two units of work is declared, checked,
and provably written before it is read. Four findings say it is not seeing what actually happens.

### A1. A prohibition written with variable names becomes four declared reads

The contract derivation collects the `{tokens}` in a technique's delivered prose and treats each one
that names no declared signature entry as a session read by the binding activity. The convergence
technique's challenge pass carries a protocol bullet whose entire content is *do not write these four
flags from a unit* — and naming them declares a read of all four.

The propagation is exact. Seven activities bind that technique. Seven activities declare a read of
`has_open_questions`, and they are the same seven; no other activity in the corpus reads it. Six of
them are reconciling assumptions, where the clause carrying the token never applies.

The technique already states the same rule properly, without naming any variable, under its own
`combine-owns-flags` heading. The bullet is redundant with a rule that says it correctly.

**Fix:** delete the bullet; drop the six spurious reads. One line and six declarations.

### A2. A variable seven activities read has no declared writer anywhere

`has_open_questions` is written only through a parameter — the convergence technique takes the *name*
of the flag to write as one of its inputs — so the producer index cannot see the write. No activity
declares it. The name is therefore declared at the **workflow root** instead, in two workflow files,
which satisfies the read-needs-a-writer check unconditionally.

Read because of prose, written through a parameter, declared at the root: three mechanisms, none of
them the one the contract is for.

### A3. Six activities write a flag and none of them declares it

`has_resolvable_assumptions` is bound as the convergence flag at six sites. Two activities in the
corpus declare writing it, and **neither is one of the six**. The same parameterised write is
invisible to the derivation.

Across the five names that technique writes through parameters, over twenty bindings, the
corresponding declaration is hand-written at thirteen and absent at seven.

**Fix for A2 and A3 together:** declare the writes at the sites that make them, or give the technique
concrete outputs the caller remaps. Roughly seven declarations.

### A4. A technique group produces a name the corpus declares nowhere

`assumptions_log` is a declared output of the assumption-review technique group, so every operation in
that group produces it — and it appears in no workflow file and no activity's reads or writes. The
contract system has never seen it. Seven activities bind an operation from that group.

**Fix:** declare it where it is produced. One declaration per producing activity, or one at the
workflow file.

## B — mechanisms that do not do what they say

### B1. Six of eight repeat-until loops never run their body

A `doWhile` loop names one property: the body runs, and *then* the test decides whether to run it
again. Both mechanical readers evaluate the loop's condition on arrival, and both read an unbound
variable as false.

Evaluating each top-level `while` and `doWhile` loop's condition against the bag as seeded from
declared defaults — which is its state on arrival, since eight of the nine `doWhile` loops have no
earlier step in their own activity that writes the variable — **six of the eight enter nothing**. The
two that do enter, enter by an accident of polarity: both test against `false` and are seeded `false`.

Separately, twelve of the sixteen loops whose activity appears in the committed delivery baseline
have no body step eagerly bundled in any recorded delivery. Six of those exclusions are ordinary lazy
delivery; the other six carry seventeen body steps excluded because a *continuation* test was
consulted at *entry*.

The corpus has already partitioned the two meanings without saying so: no `forEach` loop carries a
`condition`, all nineteen `while`/`doWhile` loops do and every one is a continuation test, and the
three loops carrying both fields use `when` for entry and `condition` for continuation.

**Fix:** a `continueWhile` field on the loop step, `condition` removed from it, `breakCondition`
deleted, nineteen loops re-keyed with no expression rewritten and no polarity flipped, and a loop
shape guard. Set out in full in [continuation-condition.md](continuation-condition.md).

### B2. A field exists, is read once, and is used nowhere

`breakCondition` is declared on the loop step and described as an early exit evaluated each
iteration. It appears at **zero sites** in the corpus. One place in the server collects its variable
references; the end-to-end walker never looks at it.

**Fix, as taken:** the field stays and earns a rule. It is an early exit belonging to item
iteration — a `forEach` may stop part way through its collection — and a repeat-until loop states
its stopping condition in `continueWhile` instead, so `check-loop-shape` rejects a
`while`/`doWhile` carrying one. Zero sites is then a shape nothing has needed yet rather than a
field nothing can use.

### B3. The schema and the code disagree about loop variables

The variable schema states that a loop's item variable is iteration state and is not declared in an
activity's contract. The derivation writes it into the produced set regardless, and every activity
that runs an item loop duly declares it. The rule and the code disagree, and the corpus follows the
code.

**Fix:** decide which is right and make the other match. Prose or one line.

### B4. A technique's own outputs describe two domains at once

The fold operation of the convergence technique declares **ten outputs, seven of them
domain-conditional by prose annotation** — five marked *(when the concern kind is X)* and two marked
*(when applicable)*. A conditional annotation in prose is not a condition: anything binding that
operation as a step is credited with producing all ten.

It does not bite today because the operation is reached from another technique's prose rather than
bound as a step. It bites the moment anything binds it.

**Fix:** one neutral document name the caller binds, and four outputs instead of ten.

### B5. A retired shell would leave its group contract behind

The convergence group's contract declares the three parameterised flag names as **group** outputs,
and a group contract is inherited by every operation in it. So the challenge operation declares them
as outputs too, though only the fold sets them.

Same status as B4: latent while the operations are reached from prose, live the moment they are
bound.

### B6. Five audits persist their findings, and their callers persist them again

Every audit operation in `workflow-design` that declares an artifact writes it twice: once in its own
Protocol, once through a `write-artifact` step the calling activity binds. Five for five, with the
filename matching exactly on both sides.

| Audit operation | Its `#### artifact` | The caller's `bare_filename` |
|---|---|---|
| `audit-expressiveness` | `expressiveness-findings.md` | `expressiveness-findings.md` |
| `audit-conformance` | `conformance-findings.md` | `conformance-findings.md` |
| `audit-principles` | `principle-findings.md` | `principle-findings.md` |
| `audit-anti-patterns` | `anti-pattern-findings.md` | `anti-pattern-findings.md` |
| `audit-rule-hygiene` | `rule-hygiene-findings.md` | `rule-hygiene-findings.md` |

Each of the five carries a `### Persist Findings` protocol block that persists its findings following
the findings-satellite guide and captures the resulting path into its own `*_findings_path` output.
Three gate that on a declared count and leave the path empty below it; `audit-principles` and
`audit-anti-patterns` persist unconditionally, and their callers' write steps are correspondingly
ungated. So the caller's step is not a fallback for a case the audit declines — it is a second writer
of a file the audit has already written and whose path it already reports.

The activity promises the file twice as well: `get_activity` synthesises the artifact contract from
the `## Outputs` of the techniques its steps bind, so the audit's declaration is already in the
delivered contract before the write step adds its own.

**Fix, decided 2026-09-07: the five write steps go**, and the audits' `*_findings_path` outputs are
the contract. Five steps out of two activity files, no technique changed. It is the smaller edit and
the one the artifact declaration already implies, since `#### artifact` is where a technique says its
output is persisted. The alternative — audits stop persisting and become pure produce paths whose
callers persist — was weighed and would have edited five technique files to reach the same file on
disk.

**This finding removes a constituency rather than adding one.** Two of the drift census's fourteen
shared windows are "audit and persist" pairs, and they were also the leading candidate for the
producer-plus-persist routine named under the proposal's future features. If the write steps are the
redundant half, both windows dissolve and there is no run there to name — which is the strongest form
of the suspicion the README already records, that the right shape for the pairing "may be a technique
declaring where its output belongs rather than a routine pairing two steps". Here the technique
already declares it.

### B7. Two activities record a batch answer nobody was asked for

Four activities run the residual-assumption interview: a shared batch gate, a step recording the
batch answer, then a loop that interviews individually when the gate asked for it.

The gate's shared body carries `is_review_mode != true` in its own condition, so in review mode it
is never presented. Its `interview-individually` option is the **only writer** of
`needs_individual_interview` anywhere in the workflow, and all four hosts declare that flag with a
starting value of false. So in review mode the flag is false, which is what the record step's own
gate tests — `needs_individual_interview != true`, together with `has_open_assumptions == true`.

Two of the four sites add `is_review_mode != true` to that gate and two do not. At the two that do
not, a review-mode run with open assumptions **reaches the record step having asked nobody
anything**, and records a batch outcome as though a user had accepted the agent's positions. The
sites are `04-research.yaml` and `08-implement.yaml`.

The mirror image is on the loop gate, and it is harmless rather than wrong: the loop tests
`needs_individual_interview == true`, which review mode already makes false, so the two sites that
add the conjunct there add nothing.

**Fix:** add the conjunct to the record gate at the two sites missing it, and drop it from the loop
gate at the two sites carrying it. Four gate edits, no new mechanism. Found while settling rows 5
and 6 of [drift-census.md](drift-census.md), which had classed both as mechanical.

## C — edits the current rules block

### C1. A flag that gates steps across the corpus is never seeded

`is_review_mode` carries no default. A gate reading it therefore has no answer when the server hands
an activity over, so any step guarded on it drops out of the delivered bundle and is fetched in a
later round trip.

Measured on two activities: seeding it moves one step back into each bundle, worth 4,536 and 4,339
characters respectively.

**Fix:** one line — except that it does not currently load. See C2.

### C2. A declaration that says nothing about a starting value counts as a disagreement

When two places declare one variable, the loader refuses to start if they disagree — including when
one names a starting value and the other says nothing. So seeding `is_review_mode` on the workflow
file fails against the activity that declares it without a default.

Measured across the corpus: **113 variables are declared in more than one place, and every single one
already agrees about whether a starting value is present.** Relaxing the rule so that silence is no
opinion, with the declaration naming a value winning, silences no existing finding.

**Fix:** two lines, in the comparison and in the merge's precedence. It is a prerequisite for C1, and
for any corpus edit that adds a default to a name someone else declares.

## What each costs

| | Finding | Size |
|---|---|---|
| A1 | Prohibition naming four variables | 1 line, 6 declarations |
| A2 + A3 | Parameterised writes nothing declares | ~7 declarations |
| A4 | Group output the corpus never declares | 1–7 declarations |
| B1 | Repeat-until loops that never run | Schema field, 19 re-keys, 1 guard |
| B2 | The unused early-exit field | 1 guard rule |
| B3 | Schema and code disagree on loop variables | 1 line or 1 paragraph |
| B4 | Fold operation declaring ten outputs | 1 technique file |
| B5 | Group contract holding a shell's flag names | 1 technique file |
| B6 | Five audits and their callers both persisting | 5 write steps, or 5 technique files |
| B7 | A batch answer recorded in review mode | 4 gate edits |
| C1 | Unseeded review-mode flag | 1 line, after C2 |
| C2 | Absent default read as a disagreement | 2 lines |

Nine of the original eleven are spent, and the three that are live are the three the table prices
smallest.

**B7 first.** It is four gate edits, it is the only one of the twelve that produces a wrong record
in a real run rather than a wrong declaration, and it is independent of everything else here.
**Then B6**, which has nowhere to be fixed and two of the census's windows waiting on it. **Then
B3**, a paragraph against one line, wherever the loop work next lands.

## One correction, not a defect

The four batch gates in the assumption run carry hand-written site prefixes — `research-`,
`analysis-`, `implementation-`. **These disambiguate nothing.** Step identifiers are scoped per
activity, a checkpoint response is keyed on the activity and the checkpoint together, and a
step-bound technique fetch resolves within the active activity, so four gates in four activities
could all share one identifier. The prefixes buy legibility in a trace.

Recorded because the routine design initially claimed to automate a disambiguation that was never
happening, and the claim has been corrected in this folder rather than carried forward.
