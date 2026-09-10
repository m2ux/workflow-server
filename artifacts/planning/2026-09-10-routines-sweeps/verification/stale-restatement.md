# All 67 counts reproduce, three of the eighteen loop statements are not stale, and the key list misses twenty-two more

A verification of [sweeps/stale-restatement.md](../sweeps/stale-restatement.md) — the revision of
2026-09-10 16:56, 51,791 bytes, whose two keys carry 23 and 44 literals. Measured against server
tooling at `ee95e4cd` on `main`, corpus at `a4a5d88b` on the `workflows` branch, and planning
artifacts at `d4a2cfd4`, which are the three commits the sweep names. Every figure below was
re-taken from the repository with a counting script written from the key literals alone.

**Reproduced 67 of 67 key figures, every group subtotal, and the whole out-of-list table exactly.**
Of the eighteen occurrences the sweep calls false statements about the loop step, **ten survive as
stale**, **five are narrowed rather than false**, and **three I withdraw** — they assert nothing the
system contradicts. Of the eighteen the sweep calls false today about the shared gate body, **all
eighteen survive**, though the reason six of them are dead is not the reason the sweep gives. On the
other side of the ledger I **add twenty-two occurrences** that no key on either list reaches, eleven
of them outside any file a delivery stage opens.

The arithmetic is not where the errors are. The arithmetic is exact to the last figure. The errors
are in which sentences are called false, and in what a key list of 67 phrasings cannot see.

---

## One. Re-taking every count

The script walks the repository with `.git`, `node_modules`, `dist`, `.worktrees`, `.idea`, `.venv`
and `.gitnexus` excluded and `package-lock.json` skipped, composes the backtick as `chr(96)`, counts
literal substring occurrences per line, and records for each hit its file, its line, whether the line
sits inside a fenced code block, and which of the sweep's four buckets the file falls in. It reads
**3,514 readable text files**, against the sweep's 3,513. The extra file is
`verification/docs-and-site.md`, written at 16:57 against the sweep's 16:56 — the tree gained a
sibling between the two runs, and no reported figure moves.

### Key one, every literal

| # | Key literal | Sweep | Measured here | Reproduced |
|---|---|---|---|---|
| 1 | `Continue condition (while/doWhile)` | 1 / 1 file / 1 out | 1 / 1 / 1 | yes |
| 2 | `` `.condition`, `.breakCondition` `` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 3 | `Early exit condition (agent-evaluated each iteration)` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 4 | `iterates over collections or while conditions hold` | 1 / 1 / 1 | 1 / 1 / 1 | yes — but see below |
| 5 | `` `loopType` semantics, `variable` / `over`, `breakCondition`, `maxIterations` `` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 6 | `` `when` / `condition` gates `` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 7 | `enum loopType` | 1 / 1 / 1 | 1 / 1 / 1 | yes — and it is fenced |
| 8 | `a shared base field on every step kind` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 9 | `` `loopType`, `over`, nested `steps[]` `` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 10 | `` gated by `when` or `condition` `` | 2 / 2 / 2 | 2 / 2 / 2 | yes |
| 11 | `` a `when` or `condition` naming it `` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 12 | `A nested step list with an exit condition` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 13 | `until the condition is satisfied or the loop declares completion` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 14 | `repeats nested steps until a condition clears` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 15 | `until a condition is satisfied or the loop declares completion` | 1 / 1 / 1 | 1 / 1 / 1 | yes |
| 16 | `gained its only site` | 1 / 1 / 0 | 1 / 1 / 0 | yes |
| 17 | `The field's one live site` | 1 / 1 / 0 | 1 / 1 / 0 | yes |
| | **False-statement subtotal** | **18 / 8 / 16** | **18 / 8 / 16** | yes |
| 18 | `loop_break` | 6 / 5 / 6 | 6 / 5 / 6 | yes |
| | **Everything the key set reaches** | **24 / 12 / 22** | **24 / 12 / 22** | yes |

Every landing site is the one the sweep names, line for line. The corpus census reproduces as well:
walking every node with a string `kind` under `workflows/*/workflow.yaml` and
`workflows/*/activities/**` over 150 files gives **1,004 steps and 53 loop steps — 26 `forEach`, 14
`doWhile`, 13 `while` — with 27 carrying `continueWhile`, zero carrying `condition` and zero carrying
`breakCondition`.** The partition is exact in both directions: no `forEach` declares a continuation
test and no repeat-until loop omits one. The sweep's figures, including its correction of
`stage-0-state.md` from 1,003 steps and 54 loops, all hold.

### Key two, every group

| Group | Sweep | Measured here | Reproduced |
|---|---|---|---|
| 1 — gate-body vocabulary in prose | 112 occ / 67 lines / 24 files | 112 / 67 / 24 | yes |
| 2 — the seven dying rule names | 30 / 28 / 2 | 30 / 28 / 2 | yes |
| 2b — the two surviving rule names | 10 / 10 / 2 | 10 / 10 / 2 | yes |
| 3 — the author-routing remedies | 4 / 4 / 1 | 4 / 4 / 1 | yes |
| 4 — the code identifiers | 79 / 66 / 9 | 79 / 66 / 9 | yes |
| 5 — the rule half, false today | 18 / 12 / 6 | 18 / 12 / 6 | yes |
| **Total** | **253 / 177 / 26** | **253 / 177 / 26** | yes |

The out-of-list table reproduces to the line, all eleven rows:

| File outside the change | Sweep occ / lines | Measured | Lines |
|---|---|---|---|
| `schemas/README.md` | 15 / 5 | 15 / 5 | 279, 335, 341, 499, 500 |
| `site/specs/resource-resolution.html` | 11 / 6 | 11 / 6 | 203, 205, 206, 208, 209, 211 |
| `site/specs/workflows.html` | 9 / 4 | 9 / 4 | 128, 226, 228, 229 |
| `site/specs/checkpoints.html` | 6 / 2 | 6 / 2 | 195, 196 |
| `scripts/check-checkpoint-presentation.ts` | 6 / 5 | 6 / 5 | 23, 89, 150, 157, 158 |
| `site/design/request-lifecycle.html` | 4 / 2 | 4 / 2 | 124, 127 |
| `workflows/workflow-design/resources/schema-construct-inventory.md` | 3 / 1 | 3 / 1 | 68 |
| `docs/checkpoint-model.md` | 3 / 1 | 3 / 1 | 116 |
| `site/api/schemas.html` | 3 / 1 | 3 / 1 | 264 |
| `tests/checkpoint-presentation-guard.test.ts` | 2 / 2 | 2 / 2 | 55, 61 |
| `.../workflow-definition/audit-schema-validation.md` | 1 / 1 | 1 / 1 | 29 |
| **Total** | **63 / 30 / 11 files** | **63 / 30 / 11** | |

The mechanism's own measurements reproduce too. `grep -rn fragments --include=*.yaml workflows/`
returns two lines, one being the declaration at `workflows/work-package/workflow.yaml:15` and the
other prose about a changelog fragment at
`workflows/work-package/activities/12-strategic-review.yaml:196`. The block runs to line 71, the next
top-level key `techniques:` sitting at `:72`, for 57 lines. There are exactly eight `ref:` sites, at
the eight line numbers the sweep gives. `WorkflowFragmentsSchema`
(`src/schema/workflow.schema.ts:40-42`) declares one key and closes with `.strict()`; all three rule
buckets are `z.array(z.string())` at `src/schema/workflow.schema.ts:30-32`; and
`materializeRuleEntries`, `resolveRuleFragment` and `RuleEntrySchema` appear nowhere in `src/`,
`scripts/` or `tests/`. `npx tsx scripts/check-fragments.ts` prints the OK line verbatim.

### Three things the counting method does not survive, stated as warnings

The figures are right. Two of the conventions behind them are fragile in ways that matter to anyone
who re-runs this work, and one printed key is ambiguous.

- **A key one word short of its target returns the same number and means something else.** Key 4 is
  `iterates over collections or while conditions hold`. Dropping the final word gives
  `iterates over collections or while conditions`, which returns **two** live occurrences —
  `schemas/README.md:373` and `schemas/README.md:633`. The second is a whole further description of
  the loop step that the key as written cannot see. The count of 1 is correct for the literal and
  wrong for the claim the literal stands in for.
- **A phrase a hard wrap splits is invisible to every key.** The method counts substrings per line,
  and this repository wraps prose near 100 characters. `tests/e2e/coverage.ts:10-11` carries the
  sentence "A checkpoint may arrive by fragment / `ref`, which raw YAML shows as a step with no
  options at all" across a line break, so no per-line substring count of any phrasing spanning that
  break can ever reach it. This is a property of the method rather than of this sweep, and it is the
  single most likely way a future re-run under-reports.
- **One printed key does not match the text it is credited with.** The comprehension row
  `` `the loop-kind step.breakCondition` `` returns zero occurrences when the backticks are read as
  part of the literal. `.engineering/artifacts/comprehension/json-schemas.md:54` reads
  "and the loop-kind step.breakCondition." with no code span at all, so the literal matches only
  without them. The figure of 1 is right; the key as printed is not reproducible. Five of the six
  comprehension occurrences reproduce as printed, the sixth only after the backticks are dropped.

Two further notes, neither an error. `unused-fragment` returns **7** occurrences over 3 files raw;
the sweep reports 6 over 2, which is the figure with
`tests/fixtures/fragments/alpha-fixture/workflow.yaml:9` removed. Its prose says that fixture "counts
as inside the change rather than outside it" (`stale-restatement.md:107-109`), which would make the
total 7 with 0 outside; its arithmetic excludes the occurrence instead. Both routes give 0 outside,
so nothing downstream moves. And the planning-bucket figures are not stable enough to quote: the
sweep's example of a repository-wide count, `Continue condition (while/doWhile)` at 7 over 6 files,
measures **9 over 6 files** now, because the planning folder has gained five verification siblings
since. The live-tree figures are the reproducible ones, which is the sweep's own conclusion arrived at
from the other side.

---

## Two. Testing every occurrence the sweep calls stale

Stage 0 landed as two commits on 2026-09-04: `3a36b0db` in the server over 16 files and `95f13fd1` in
the corpus over 12 activity files. **Neither touched `schemas/README.md`, any corpus canon resource,
any page under `site/specs/` or `site/guide/`, or `docs/workflow-fidelity.md`** — which is direct
evidence for the sweep's central thesis, and the fact that decides most of the rulings below. A
statement in a file the change never opened is a survivor. A statement that never named the
continuation field under any name is not.

Two verdicts do the work. **Stale** means a reader acting on the sentence would be wrong about the
system. **Narrowed** means the sentence is true of what it names, but what it names is now a proper
subset of the ground it used to cover, so the remedy is to add the missing member rather than to
correct a falsehood. Both are work; only the first is a false statement.

### The ten that are stale, and survive

- **`schemas/README.md:383`** — the loop field table's row
  `| condition | Condition | Continue condition (while/doWhile) |`. `LoopStepSchema`
  (`src/schema/activity.schema.ts:152-164`) is closed by `.strict()` at `:164` and spreads
  `stepCommonFields` alone at `:163`, so `condition` on a loop is a load error. The same ten-row
  table omits `continueWhile`. An author consulting the authoritative field list for a `while` loop
  is handed a field that fails the load and denied the one that works. **Confirmed.**
- **`schemas/README.md:32`** — the construct-enforcement table's row headed "Step (common)" lists
  "`when` / `condition` gates" among the fields every step kind carries. `condition` is spread from
  `stepEntryCondition` (`src/schema/activity.schema.ts:84-86`) into three kinds and no more —
  technique at `:101`, action at `:110`, checkpoint at `:140`. The row header asserts commonality and
  the assertion is false. **Confirmed.**
- **`workflows/workflow-design/resources/schema-construct-inventory.md:47`** — the construct-choice
  row for "Repeat for each item" / "do until done" gives the loop's fields as "`.id`, `.loopType`
  (forEach/while/doWhile), `.variable`, `.over`, `.condition`, `.breakCondition`, `.maxIterations`,
  optional `.name`". This is corpus canon, it is the table an author consults to pick a construct, and
  it names a field that fails the load while omitting the one that carries the test. The line was
  introduced by `4de59476`, long before stage 0. Of the whole set this has the most direct route into
  a new definition. **Confirmed.**
- **`workflows/workflow-design/resources/schema-construct-inventory.md:52`** — the Step-gate row
  reads "`steps[].when` / `steps[].condition` (references condition.schema.json) — a shared base
  field on every step kind". Also from `4de59476`. A loop step is a step kind and carries no
  `condition`, so the universal claim is flatly false. **Confirmed.**
- **`site/specs/workflows.html:339`** — two occurrences on one line. The step-kinds table's loop row
  reads "A nested step list with an exit condition" and "Repeat the nested steps until the condition
  is satisfied or the loop declares completion". `continueWhile`
  (`src/schema/activity.schema.ts:157`) is a continuation test, not an exit test, so the polarity is
  inverted; and "the loop declares completion" has no referent anywhere in the schema. The page's own
  diagram gets it right fourteen lines earlier — "repeat nested steps / while a condition holds"
  (`site/specs/workflows.html:324-325`) — so the table contradicts the figure above it. **Confirmed,
  both.**
- **`site/guide/definitions.html:86`** — the glossary index row, "A step that repeats nested steps
  until a condition clears". Same inversion. **Confirmed.**
- **`site/guide/definitions.html:138`** — the glossary entry, "a step kind that repeats a nested list
  of steps until a condition is satisfied or the loop declares completion". Same inversion and the
  same absent referent, in the page a newcomer reads first. **Confirmed.**
- **`scripts/check-loop-shape.ts:17`** — the guard header reasons that `breakCondition` "gained its
  only site two days earlier on a branch that had not merged: `08-implement`'s task cycle stops
  iterating tasks once a symbol's provenance is unaccounted for". My own census finds
  `breakCondition` at **zero of 53 loops**, and `grep -rn breakCondition --include=*.yaml workflows/`
  returns nothing. What stands in that position is
  `workflows/work-package/activities/08-implement.yaml:118-127`, `provenance-settle-cycle`, a
  `doWhile` whose `continueWhile` tests `has_uncertain_symbols` — it settles the uncertainty in place
  rather than stopping a walk. The sentence asserts a site count of one where the count is zero.
  **Confirmed.**
- **`tests/loop-shape-guard.test.ts:86`** — "The field's one live site: the task cycle stops once a
  symbol's provenance is unaccounted for." False against the corpus for the same reason. This is not
  the test-fixture exemption: the test at `:85-88` asserts that the **current** form is accepted, not
  that an older form is rejected, so only the comment is wrong. **Confirmed.**

The sweep's own closing observation about these last two holds. The guard's argument survives — a
field with one job is worth keeping whether or not it is exercised, and
`repeat-loop-with-break` at `scripts/check-loop-shape.ts:96-104` is green — but the sentences
carrying the argument state a corpus fact that is not true.

### The five that are narrowed rather than false

These are still work. Calling them false statements overstates them, and the distinction changes the
remedy from a correction to an addition.

- **`schemas/README.md:385`** — "`breakCondition` | Condition | Early exit condition
  (agent-evaluated each iteration)". The field exists and is agent-evaluated. Its scope is item
  iteration: `src/schema/activity.schema.ts:160` reads "Early exit from item iteration, evaluated by
  the executing agent before each item", and `scripts/check-loop-shape.ts:96-104` raises
  `repeat-loop-with-break` when a `while` or `doWhile` declares one. "Each iteration" is broader than
  the field rather than wrong about it. **Narrowed.** The sweep's own gloss says as much and then
  counts it among the false statements.
- **`schemas/README.md:34`** — the Loop-step row's agent-interpreted column, "`loopType` semantics,
  `variable` / `over`, `breakCondition`, `maxIterations` — iteration is executed and bounded entirely
  by the agent". Every field it names is agent-interpreted; the column is simply missing
  `continueWhile`, which is the field the agent reads to decide whether the body runs again. Nothing
  present is false. **Narrowed.**
- **`workflows/workflow-design/resources/anti-patterns.md:1697`** — two occurrences. `AP-128
  unproduced-value-read` tells an auditor to start "For each step gated by `when` or `condition`" and
  to trace readers including "a `when` or `condition` naming it". The entry was catalogued by
  `fd31147d` on 2026-07-27, so it is a genuine survivor whose gate enumeration lost the loop case, and
  a value read only by a loop's continuation test falls outside the detect as written. But `when` and
  `condition` are still the gates of the three kinds that carry them, so the words are true and the
  coverage is short. **Narrowed, both.**
- **`docs/workflow-fidelity.md:143`** — "a step gated by `when` or `condition` may be omitted from the
  manifest — the agent evaluated the gate and skipped the step". The validator reads three fields, not
  two: `src/utils/validation.ts:121-125` filters on
  `s.when === undefined && (s.kind === 'loop' ? s.continueWhile === undefined : s.condition === undefined)`.
  Such a step may indeed be omitted, so the sentence is true; a `continueWhile`-gated loop may be
  omitted too, and the sentence does not say so. **Narrowed.**

### The three I withdraw

- **`schemas/README.md:373`** — "A `kind: loop` step is a compound step that iterates over collections
  or while conditions hold, with a nested `steps[]` body". **Withdrawn.** The sentence is true of the
  system today and was true before stage 0, and it names no field at all — the sweep's own gloss
  concedes it "names no field at all and leaves the reader to guess which one carries the test".
  A statement that names no field cannot be a false statement about which field carries the test, and
  it restates no superseded arrangement. What it is instead is vague, and vagueness is not this
  sweep's subject. (The same line carries "(replacing the old separate `loops[]` array)", which
  narrates a change in a live document and is a positive-present matter for a different sweep.)
- **`schemas/README.md:224`** — the `enum loopType` line inside the `LoopStep` entity of the
  entity-relationship diagram at `:220-227`. **Withdrawn**, on two grounds. First, the entity omits
  four fields — `continueWhile`, `over`, `breakCondition` and `steps` — and three of those four
  existed before stage 0, so the entity was already abridged and stage 0 did not make it any less
  complete than it was; it asserts no pre-change arrangement. Second, the literal `enum loopType` is
  itself correct: `loopType` exists and is an enum (`src/schema/activity.schema.ts:156`). It serves as
  an anchor for an omission four lines below it rather than as a restatement, so a change manifest
  keyed on that literal would point an editor at a true line. The line is also the one key-one
  occurrence that sits inside a fenced block.
- **`workflows/workflow-design/resources/anti-patterns.md:204`** — `AP-10 loop-not-prose`'s Detect,
  "Description or protocol says to repeat/iterate/for-each over a collection the session carries
  between steps, without a `kind: loop` (`loopType`, `over`, nested `steps[]`)". **Withdrawn.** Every
  field it names exists and loads; none fails. The Detect's own clause scopes its subject to iteration
  "over a collection", and the parenthetical is the marker set for spotting an undeclared collection
  walk rather than an enumeration of the loop step's fields. The line was introduced by `4de59476`
  and never named the continuation field under either name, so nothing about it survives a change.
  The sweep read the parenthetical as a field list. The real finding here — that prose saying "do
  until done" is not detectable by that marker set — is a detect-coverage gap, and it belongs to a
  coverage sweep.

### The `loop_break` group, upheld as the sweep has it

All six occurrences reproduce and none is a false statement, which is what the sweep says. I confirm
the stranding directly: `src/schema/state.schema.ts:13` declares `loop_started`, `loop_iteration`,
`loop_completed` and `loop_break`; `:167` declares `activeLoops` with a default of `[]`; and a grep
for all five names across `src/` and `scripts/` finds exactly one non-declaration site,
`scripts/generate-session-token.ts:177`, which initialises the array to empty. No writer exists.
Iteration is the agent's work, so this is consistent with the design.

One addition to that section rather than a correction. The same enumerations carry
`decision_reached` and `decision_branch_taken` (`src/schema/state.schema.ts:12`,
`schemas/README.md:978`), and there is no decision step kind at all: `StepSchema`
(`src/schema/activity.schema.ts:167-172`) has four members. That vocabulary names a construct with no
schema member whatever, which is a stronger case of the same stranding than `loop_break`, whose field
at least exists.

### Group five of key two: all eighteen survive, six for a different reason

The rule half is dead and every one of the eighteen occurrences describes it. I confirm the schema
half (`src/schema/workflow.schema.ts:40-42` strict over one key; `:30-32` three string arrays), the
loader half (no `materializeRuleEntries`, `resolveRuleFragment` or `RuleEntrySchema` anywhere), and
the resolver's own statement of the standing rule at `src/loaders/fragment-resolver.ts:9-10`: "Rules
are not shared this way: a rule two workflows both need is neither one's to own, so its home is the
conduct technique whose audience it binds and the bundle delivers it". Nothing here is withdrawn.
`site/specs/resource-resolution.html:208`, `site/specs/workflows.html:128` and `:229`,
`schemas/README.md:499` and `src/loaders/workflow-loader.ts:318` are all confirmed as stale, the last
against a loader that collects checkpoint refs only (`collectCheckpointRefs` at
`src/loaders/workflow-loader.ts:334`, reading `workflow.fragments?.checkpoints` at `:331`).

**The six occurrences in the guard and its test are dead, but not by the mechanism the sweep names.**
The sweep says of `scripts/check-checkpoint-presentation.ts:23, 89, 150, 157, 158` that "a
`workflow.yaml` carrying that key would fail the load before the guard saw it, so the branch is
unreachable". The guard does not sit downstream of the load. It parses the file itself —
`parse(readFileSync(wfFile, 'utf-8'))` at `scripts/check-checkpoint-presentation.ts:145` — and reads
`def?.['fragments']?.['rules']` at `:148-151` from that raw object, so it would in fact see the key.
What makes the branch dead is upstream of the guard and independent of it: because
`WorkflowFragmentsSchema` is strict over `checkpoints`, no definition carrying `fragments.rules` can
load, so no shippable workflow can ever exercise the branch. The conclusion — five statements
describing a path that cannot be taken — is right, and it is right for a reason worth stating
correctly, because "the guard never sees it" would be repaired by changing the guard's position while
"no loadable file can carry it" is repaired only by deleting the branch.

The test at `tests/checkpoint-presentation-guard.test.ts:55, 61` is also confirmed, and it is not the
fixture exemption. Its title claims "a rule fragment, which binds the same agents once imported by
ref" and `:61` asserts a finding site of `fragments.rules.shared`; it asserts that the guard **flags**
a presentation claim inside such a bucket, not that the form is rejected. It keeps a dead branch alive
against a synthetic object that never passes the schema.

---

## Three. What the keys do not reach

A key list is only as good as the phrasings someone thought of. Reading the loop step schema, the
loop-shape guard and the loop documentation as a reader would, and then reading the fragment
mechanism the same way, turns up twenty-two live occurrences no key on either list contains. Eleven
sit outside any file a delivery stage opens.

### Key one: the schema guide describes the loop step five times, not three

The sweep says `schemas/README.md` "enumerates the loop step's fields in three separate places". It
does so in **five**, and the two the keys miss include the only flatly false claim in the file.

- **`schemas/README.md:161`** — inside the entity-relationship diagram, the relationship line
  `Step |o--o| Condition : "gated by (when/condition)"`. This asserts that a Step is gated by
  `when`/`condition`; a loop step is a Step and carries no `condition`. It is the same defect as
  `:32`, in the same file, and it is stated more baldly. No key reaches it: key 6 is
  `` `when` / `condition` gates `` and key 10 is `` gated by `when` or `condition` ``, and the text
  here is `gated by (when/condition)` — parenthesised, unspaced, unbackticked. **This is the
  highest-value addition on either key.** The sweep flagged `:224`, which is a correct line, and
  missed `:161`, which is a false one, 63 lines above it in the same fenced diagram.
- **`schemas/README.md:633`** — "A `kind: loop` step is a compound step that iterates over collections
  or while conditions. Its body is a nested `steps[]`". A second Loop Steps section, at `:631-658`,
  entirely separate from the field table at `:371-386`. Key 4 misses it by one word.
- **`schemas/README.md:658`** — "**Loop Types (`loopType`):** `forEach`, `while`, `doWhile`" closes
  that second section. The section names both repeat-until types, and neither its prose, its JSON
  example at `:636-656` — a `forEach` — nor this line names any field for their test. A reader who
  arrives at the second section learns that `while` and `doWhile` exist and leaves with no field to
  state their continuation in.

One further occurrence, inside the change's file list and so lower value, is
**`tests/e2e/walker.ts:481`** — the robot worker's doc comment, "Gates on step when/condition". The
walker handles a loop's `continueWhile` separately (`tests/e2e/walker.ts:560, 572-573`), so the
comment's gate enumeration is short in the same way `docs/workflow-fidelity.md:143` is. Stage 0 edited
this file and left the comment.

### Key two: the mechanism is an explanatory anchor for something else entirely

**Four live comments explain borrowed-activity technique scoping by pointing at fragment scoping.**
Retire the mechanism and four sites in shipping code refer to a rule with no home. No key on the
44-literal list contains the word "scoping".

- **`src/tools/resource-tools.ts:655`** — "A borrowed activity's technique refs resolve against the
  workflow the activity file was authored in (mirroring #166 B10 fragment scoping)". Outside the list.
- **`src/utils/binding-provenance.ts:117`** — "A borrowed cross-workflow activity resolves its bound
  ops against its source workflow (mirroring fragment scoping)". Outside the list.
- **`tests/borrowed-technique-resolution.test.ts:14`** — "the technique-side counterpart of #166 B10
  fragment scoping". Outside the list.
- **`src/tools/workflow-tools.ts:1595`** — "(mirroring #166 B10 fragment scoping)". Inside the list.

**Two sites state the fragment mechanism as a reason for how end-to-end coverage is computed.**

- **`tests/e2e/README.md:109`** — "a checkpoint may arrive by fragment `ref`, which raw YAML shows as
  a step with no options at all", one of the two stated reasons the coverage denominator comes from
  the loader rather than from reading YAML. Outside the list. The key `fragment ref` misses it because
  the text has a backtick where the literal has a space.
- **`tests/e2e/coverage.ts:10-11`** — the same claim in the code that implements the denominator, and
  the phrase is wrapped across the line break. Outside the list, and unreachable by any per-line
  substring count.

**Three more, each outside the list.**

- **`scripts/run-batch-benchmark.ts:16`** — the benchmark's elapsed figures are described as the
  server-side component of a walk, "composing each payload, resolving techniques and fragments off
  disk, and writing the session". After stage 5 there are no fragments to resolve.
- **`docs/development.md:315`** — lists `tests/fragments-guard.test.ts` among the guards that also run
  as Vitest tests and therefore fail `npm test`. Stage 5 deletes that file. No key contains
  `fragments-guard`; the sweep carries the npm-script form `check:fragments` and not the file form
  `check-fragments.ts`, which reaches five live sites of its own.
- **`tests/branch-as-step-guard.test.ts:68`** — a fixture string quoting "`check-fragments.ts` — every
  fragment is used" as sample protocol content for an unrelated guard. Recorded for completeness
  rather than as work: it will compile and pass unchanged after stage 5, and it teaches a reader
  nothing about fragments.

**Nine occurrences in the generated workflow schema hang structure off the fragments subtree.**
`schemas/workflow.schema.json:68` declares `"fragments"`, and eight `$ref` pointers at `:179`, `:200`,
`:219`, `:595`, `:615`, `:683`, `:739` and `:751` resolve the shared `Condition` and
`options[].items` definitions **through** that subtree, by paths like
`#/definitions/workflow/properties/fragments/properties/checkpoints/additionalProperties/properties/condition`.
Deleting `fragments` breaks eight internal pointers that have nothing to do with checkpoint fragments.
The file is inside the change's list and `scripts/generate-schemas.ts` rewrites it, so the work is
automatic — but the sweep's keys reach 3 of the 12 lines the mechanism occupies in this one generated
file, and anyone auditing the deletion by grep on the dotted form `fragments.checkpoints` would see
none of the eight.

---

## Corrected totals

### Key one

| Measure | Sweep | Corrected |
|---|---|---|
| Literals reported | 23 | 23, one of them ambiguous as printed |
| Occurrences the key set reaches, live tree | 24 / 12 files | **24 / 12** — reproduced |
| Of those, called false statements | 18 | **10 stale + 5 narrowed = 15 work; 3 withdrawn** |
| `loop_break`, stranded not false | 6 | **6** — upheld |
| Occurrences added here | — | **+4** (3 outside the list, 1 inside) |
| **Pieces of work** | 18 | **19** |
| **Outside the change's file list** | 16 occ / 14 lines / 6 files | **16 occ / 14 lines / 6 files** |

The out-of-list headline is unchanged and its composition is not. Three withdrawals and three
additions land on the same figure by coincidence, all six inside `schemas/README.md` and
`anti-patterns.md`:

| File outside the change | Sweep | Corrected | Corrected lines |
|---|---|---|---|
| `schemas/README.md` | 6 | **7** | 32, 34, 161, 383, 385, 633, 658 |
| `workflows/workflow-design/resources/anti-patterns.md` | 3 | **2** | 1697 (two occurrences) |
| `workflows/workflow-design/resources/schema-construct-inventory.md` | 2 | **2** | 47, 52 |
| `site/guide/definitions.html` | 2 | **2** | 86, 138 |
| `site/specs/workflows.html` | 2 | **2** | 339 (two occurrences) |
| `docs/workflow-fidelity.md` | 1 | **1** | 143 |
| **Total** | **16 / 14 lines** | **16 / 14 lines** | 6 files |

Inside the list: `scripts/check-loop-shape.ts:17`, `tests/loop-shape-guard.test.ts:86`, and
`tests/e2e/walker.ts:481` added — three, not two.

### Key two

| Measure | Sweep | Corrected |
|---|---|---|
| Literals reported | 44 | 44 |
| Occurrences at 177 lines over 26 files | 253 | **253** — every group reproduced exactly |
| Group 5, false today | 18 / 12 lines / 6 files | **18** — all confirmed, six with a corrected rationale |
| Outside the change's file list | 63 / 30 lines / 11 files | **63 / 30 / 11** — reproduced to the row |
| Occurrences added here | — | **+18** (8 outside at 8 files, 10 inside) |
| **Corrected manifest** | 253 | **271** |
| **Corrected outside** | 63 / 30 / 11 | **71 occ / 38 lines / 19 files** |

### The figures a change manifest should carry

- **The loop census, unqualified:** 1,004 steps and 53 loop steps in the corpus — 26 `forEach`, 14
  `doWhile`, 13 `while` — with 27 carrying `continueWhile`, **zero carrying `condition` and zero
  carrying `breakCondition`**. The partition is exact in both directions. These are the figures that
  falsify `scripts/check-loop-shape.ts:17` and `tests/loop-shape-guard.test.ts:86`, and they are
  measured, not inherited.
- **Key one: 19 pieces of work — 10 stale statements, 5 narrowings, 4 added. Sixteen sit at 14
  distinct lines in 6 files no delivery stage opens; three sit inside.** Do not carry "18 false
  statements": three of the eighteen assert nothing the system contradicts, and five state something
  true too narrowly.
- **Key two: 271 occurrences, of which 71 at 38 lines in 19 files sit outside any file a delivery
  stage opens.** Carry the sweep's 253 / 177 / 26 as the figure for the 44 literals — it is exact —
  and carry the 18 additions separately, because they are what the literals cannot see.
- **Key two group 5: 18 occurrences at 12 lines over 6 files are false today, 16 of them outside the
  list.** Exact as the sweep states it. This is the strongest single finding in the sweep and it needs
  no adjustment.
- **The three-file remedy claim needs restating.** The sweep says one editing pass over
  `schemas/README.md`, `schema-construct-inventory.md` and `site/specs/workflows.html` would clear 10
  of key one's 16 and 27 of key two's 63. On the corrected figures those three files hold **11** of
  key one's 16 out-of-list occurrences and 27 of key two's 63 — **38 of 79**, up from 37, because
  `schemas/README.md` gains three occurrences and loses two.
- **Do not carry any planning-bucket or repository-wide figure.** The folder gained five verification
  siblings during this exercise, and it will gain more. Every figure worth auditing is a live-tree
  figure.

---

## Investigation detail

Counts were taken by four scripts under the session scratchpad: a walker that buckets every readable
text file by path prefix and records fenced-block membership per line; a per-literal counter composing
the backtick as `chr(96)`; a corpus census parsing all 150 workflow and activity files and recording
each loop's key set; and a distinct-line tally that computes group subtotals and the in-list split
with the two named substring collisions excluded. Commit provenance for the canon lines was taken with
`git log -S` in the corpus submodule, which is what dates
`workflows/workflow-design/resources/anti-patterns.md:1697` to `fd31147d` (2026-07-27) and both
`schema-construct-inventory.md` rows and `anti-patterns.md:204` to `4de59476`, all three before stage
0 on 2026-09-04.

The sweep's three rulings on surfaces that are correctly out of key are upheld, each checked directly.
`docs/orchestra-specification.md:3` does carry the disclaimer quoted — "The server implements a
different shape, so nothing on this page describes a file the loader accepts" — and the page frames
itself as a proposal in its first line. `grammar/README.md:3` does assert that the grammars define
"the syntax of workflow definition files" with no such disclaimer, though `:12` names "the Orchestra
DSL", which points at the proposal obliquely; the drift there is a whole language and belongs
elsewhere. And the two `impact-analysis` techniques
(`workflows/workflow-design/techniques/impact-analysis.md:49`,
`workflows/workflow-authoring/techniques/workflow-definition/impact-analysis.md:62`) are accurate as
written: `SimpleConditionSchema` declares `variable` at `src/schema/condition.schema.ts:15-20`, both
`continueWhile` and `breakCondition` are `ConditionSchema`, and the sentence lists `kind: loop` steps
separately from the `(when/condition)` parenthetical rather than folding them into it.
