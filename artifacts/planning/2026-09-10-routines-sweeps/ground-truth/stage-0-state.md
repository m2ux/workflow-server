# A loop's continuation test has a field of its own, and four documents still name the field it is not

Ground truth for the sweep of the routines proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Companion to
[fragment-mechanism.md](fragment-mechanism.md). Every figure was taken from the repository rather
than from the proposal, and the `file:line` or the command that produced it is recorded beside it.

Server tooling at `9ca71c19` on `main`; corpus at `2b8b7215` on the `workflows` branch. The proposal
pins its own measurements to server `4740f4d6` / corpus `131e2942`;
[gap-review.md](../../2026-09-03-routines/gap-review.md) re-checked them at `f315b772` /
`b5e54574`. Where a figure here disagrees with the record, this document gives its own and says so.

Stage 0 of the proposal's nine-stage plan is the only stage with anything behind it. The stage is
recorded as having added `continueWhile` to the loop step, removed `condition` from it, scoped
`breakCondition` to the `forEach` early exit, re-keyed 19 loops and added a loop-shape guard. Four
of those five reproduce exactly. The fifth — the disposition of `breakCondition` — reproduces as a
guard rule rather than a deletion, which is what
[gap-review.md gap 4](../../2026-09-03-routines/gap-review.md) records; that gap was written on
2026-09-07 against an older tree, and everything below settles it by measurement instead.

Nothing else in the design is built. `ls workflows/*/routines` reports no such file or directory,
and `src/schema/activity.schema.ts:167` declares `StepSchema` over exactly four members —
`TechniqueStepSchema`, `ActionStepSchema`, `CheckpointStepSchema`, `LoopStepSchema`.

---

## One. The loop step as the schema declares it

`src/schema/activity.schema.ts:152-164` declares `LoopStepSchema` as a **closed object of twelve
fields**. Ten are declared on the member itself; `when` and `required` arrive from the shared
`stepCommonFields` spread at `src/schema/activity.schema.ts:73-78`. The `.strict()` at
`src/schema/activity.schema.ts:164` is what makes it closed: a field outside the set is a load
error, not a warning.

Four are required — `kind`, `id`, `loopType`, `steps`. The generated JSON schema agrees exactly:
the loop member of `steps[].anyOf` in `schemas/activity.schema.json` carries the same twelve
property names, the same four-name `required` array and `additionalProperties: false`.

| Field | Required | What the schema says it is |
|---|---|---|
| `kind` | yes | `'loop'`, the step-kind discriminator (`activity.schema.ts:153`) |
| `id` | yes | Identifier within the activity (`:154`) |
| `loopType` | yes | `forEach` \| `while` \| `doWhile` (`:156`) |
| `steps` | yes | The nested ordered body, recursive via `z.lazy` (`:162`) |
| `name` | no | "Structural label for the iteration (the one step kind that carries a name)" (`:155`) |
| `continueWhile` | no | The continuation test (`:157`) |
| `variable` | no | "Current-item variable bound each iteration" (`:158`) |
| `over` | no | "Collection expression iterated by a forEach loop" (`:159`) |
| `breakCondition` | no | Early exit from item iteration (`:160`) |
| `maxIterations` | no | "Safety bound on iteration count, enforced by the executing agent" (`:161`) |
| `when` | no | The inline gate every step kind carries (`:74-76`) |
| `required` | no | Declared only when false (`:77`) |

Two of those descriptions are load-bearing for everything below, so they are quoted whole.

`continueWhile` (`src/schema/activity.schema.ts:157`):

> The continuation test of a while/doWhile loop: the body runs again while this holds. Declared by
> every repeat-until loop and by no forEach, whose iteration is bounded by its collection. Evaluated
> by the executing agent; `loopType` says when it is taken.

`breakCondition` (`src/schema/activity.schema.ts:160`):

> Early exit from item iteration, evaluated by the executing agent before each item: iteration stops
> when it holds. A repeat-until loop states its stopping condition in `continueWhile` instead.

Both strings appear verbatim in the generated schemas — `continueWhile` at
`schemas/activity.schema.json:536` and `schemas/workflow.schema.json:740`, `breakCondition` at
`schemas/activity.schema.json:548` and `schemas/workflow.schema.json:752` — so the generated pair
is in sync with its Zod source for this member.

### Which fields are required in which loop shape is a guard's answer, not the schema's

The schema requires `loopType` and `steps` of every loop and nothing more. The per-shape
obligations live in `scripts/check-loop-shape.ts`, and they are the reason the twelve-field object
does not admit twelve-field loops:

| Shape | Required by the guard | Refused by the guard |
|---|---|---|
| `forEach` | `over` **and** `variable` (`check-loop-shape.ts:55-64`) | `continueWhile` (`:65-73`) |
| `while` / `doWhile` | `continueWhile` (`:79-86`) | `over`, `variable` (`:87-95`), `breakCondition` (`:96-104`) |

`breakCondition` is admitted on a `forEach` and refused on a repeat-until loop. `maxIterations` is
required nowhere: the guard's header reasons at `check-loop-shape.ts:23-26` that a repeat-until loop
with no continuation test is already the unbounded case, so `repeat-loop-without-continuation`
covers it and no ceiling rule is needed.

### The occurrence counts, reconciled

`grep -rn` over `src scripts tests workflows schemas docs site` gives **62** occurrences of
`continueWhile` and **13** of `breakCondition`. The 46 figure carried into this sweep's brief is the
same measurement with `tests/` excluded: the three test files hold 16 between them, and 62 − 16 = 46.

| Tree | `continueWhile` | `breakCondition` |
|---|---|---|
| `src/schema/activity.schema.ts` | 4 | 1 |
| `src/utils/validation.ts` | 1 | 0 |
| `src/utils/activity-variables.ts` | 1 | 1 |
| `src/tools/workflow-tools.ts` | 1 | 0 |
| `scripts/check-loop-shape.ts` | 8 | 5 |
| `schemas/activity.schema.json` | 2 | 1 |
| `schemas/workflow.schema.json` | 2 | 1 |
| `schemas/README.md` | 0 | 2 |
| `workflows/` (23 activity files) | 27 | 0 |
| `workflows/workflow-design/resources/schema-construct-inventory.md` | 0 | 1 |
| `tests/batch-loop-walk.test.ts` | 10 | 0 |
| `tests/e2e/walker.ts` | 4 | 0 |
| `tests/loop-shape-guard.test.ts` | 2 | 1 |
| `docs/`, `site/` | 0 | 0 |
| **Total** | **62** | **13** |

Two things fall out of the table. `continueWhile` appears 27 times in the corpus and there are 27
repeat-until loops, so every occurrence is a field on a loop and every repeat-until loop has one.
`breakCondition` appears 13 times and **none of the 13 is a binding site**: eleven are code or
schema declarations, and two are prose in documents that describe the loop step.

---

## Two. breakCondition is declared, described, guarded, read once, and bound nowhere

The field's declared scope is item iteration, stated in the schema description quoted above and
argued at length in the guard's header (`scripts/check-loop-shape.ts:10-14`): an item loop is
bounded by its collection and its one early exit is `breakCondition`, which stops the walk part way
through; a repeat-until loop is bounded by its own test and needs no separate exit.

**Its site count in the corpus is zero.** A recursive walk of all 122 activity files and 17
`workflow.yaml` files finds 54 loop steps and not one carrying the field. `grep -rn breakCondition
--include=*.yaml workflows/` returns nothing.

**The guard forbids it on a while or doWhile.** `check-loop-shape.ts:96-104` raises
`repeat-loop-with-break` when a `while` or `doWhile` declares one, with the detail that such a loop
"already decides each pass in `continueWhile`, so a `breakCondition` is a second stopping rule
beside it, evaluated at a different moment". `tests/loop-shape-guard.test.ts:90-96` exercises the
rule on both repeat-until shapes and passes.

**Exactly one reader in `src` consumes it.** `src/utils/activity-variables.ts:491` calls
`conditionReads(step.breakCondition).forEach(read)` inside the loop arm of the contract derivation,
so the names a break test reads would join the activity's read set. With zero sites the call reaches
nothing. The e2e walker never looks at the field: `tests/e2e/walker.ts:80-83` declares `loopType`,
`continueWhile` and `steps` on its `StepDef` and no `breakCondition`.

So the plain statement is that `breakCondition` is a construct with no subject. It is declared in
two Zod objects and two JSON schemas, described in four places, enforced by one guard rule, read by
one derivation, and bound by nothing.

### Two live comments assert a site that the corpus does not carry

The field held one site for one day. `d91fcf5b` ("Stop the task cycle when a symbol's provenance is
unaccounted for") put a `breakCondition` on `work-package/08-implement.yaml`'s `task-cycle`, and
`efcc3a97` (2026-09-05) removed it. What stands in its place is a nested `doWhile`:
`workflows/work-package/activities/08-implement.yaml:119-127` declares
`provenance-settle-cycle` with `continueWhile` on `has_uncertain_symbols == true` and
`maxIterations: 3`, inside the `forEach` task cycle at
`workflows/work-package/activities/08-implement.yaml:88-92`. The uncertainty is settled in place
rather than stopping the walk.

Two comments still name that site as live:

- `scripts/check-loop-shape.ts:16-18` — the field "gained its only site two days earlier on a
  branch that had not merged: `08-implement`'s task cycle stops iterating tasks once a symbol's
  provenance is unaccounted for. So the field carries live meaning on an item loop".
- `tests/loop-shape-guard.test.ts:86` — "The field's one live site: the task cycle stops once a
  symbol's provenance is unaccounted for."

Both are stated as facts about the corpus, and both are false against it. The guard's *argument*
survives the correction — a field with one job is worth keeping whether or not it is exercised — but
the sentence that carries the argument asserts a site count of one where the count is zero.

### The runtime vocabulary for a break has no writer either

`src/schema/state.schema.ts:13` declares four history event types for loops —
`loop_started`, `loop_iteration`, `loop_completed`, `loop_break` — and
`src/schema/state.schema.ts:167` declares `activeLoops` with a default of `[]`. A grep for all five
names across `src`, `scripts` and `tests` returns only the declarations, plus two sites that
initialise `activeLoops` to an empty array (`src/schema/state.schema.ts:217`,
`scripts/generate-session-token.ts:177`). No code path emits a loop event or appends to
`activeLoops`. Iteration is the agent's job, so this is consistent with the design; it is recorded
here because `loop_break` is the runtime half of a field with no sites, and the sweep will find it.

---

## Three. condition is not a field of a loop step, and four documents still say it is

`condition` is the structured entry gate, declared once at
`src/schema/activity.schema.ts:84-86` as the `stepEntryCondition` spread. Three step kinds take that
spread — `technique` (`:101`), `action` (`:110`), `checkpoint` (`:140`). `LoopStepSchema` does not:
`src/schema/activity.schema.ts:163` spreads `stepCommonFields` alone. The comment above the spread
states the rule directly — a loop is the exception, `when` decides whether it is entered and
`continueWhile` whether it goes round again.

Measured, the field is gone from five of the six places it could live:

| Where | State | Evidence |
|---|---|---|
| Zod schema | Gone | `activity.schema.ts:152-164` spreads no entry condition and closes with `.strict()` |
| Generated JSON schemas | Gone | the loop member of `steps[].anyOf` carries twelve properties, none of them `condition`, under `additionalProperties: false` |
| Loader | Gone | the only loop branch in `src/loaders/` is `fragment-resolver.ts:146-147`, which recurses into the body and reads no predicate; the file's `condition` handling (`:118-127`, `:200`) is entirely checkpoint-fragment merging |
| Guards | Gone | no guard reads a loop `condition`; `check-loop-shape.ts:25-26` records why none needs to — "a step kind is a closed object, so the field is already a schema error" |
| Corpus | Gone | zero of 54 loop steps carry it |
| Descriptions | **Present at four sites** | below |

The four surviving descriptions are the substance of the sweep that follows this document:

1. `schemas/README.md:383` lists `condition` as a loop-step field with the purpose "Continue
   condition (while/doWhile)" — the continuation test, named as the field the schema no longer
   admits. The same table omits `continueWhile` entirely.
2. `workflows/workflow-design/resources/schema-construct-inventory.md:47` gives the loop step's
   field list as `.loopType`, `.variable`, `.over`, `.condition`, `.breakCondition`,
   `.maxIterations` and `.name`. This is corpus canon: it is the table an author consults to choose
   a construct, and it names one field that fails the load and omits the one that carries the test.
3. `.engineering/artifacts/comprehension/when-step-gates.md:32` records structured `condition` as
   retained for, among other things, "loop continuations".
4. `.engineering/artifacts/comprehension/work-package-workflow-content.md:166` gives the loop step's
   shape as `loopType: forEach|while|doWhile, condition/breakCondition?, maxIterations?`.

One code path reads a loop's `condition` and is harmless. `tests/e2e/walker.ts:560` computes
`const preGate = step.loopType === 'while' ? step.continueWhile : step.condition;` as one expression
across every step kind. For a `technique`, `action` or `checkpoint` step the false branch is
correct. For a `doWhile` or `forEach` loop it reads a property the schema forbids, so it is
constantly `undefined` — a dead read rather than a wrong one, and the same is true of the generic
`step.condition` gate at `tests/e2e/walker.ts:564`.

**So gap 4 is settled as it was written.** `breakCondition` survives, at zero sites, with a rule; and
`condition` is gone from every mechanical reader while four documents still describe a loop as
carrying it.

---

## Four. The corpus loop population

Measured by a recursive walk over 17 `workflow.yaml` files and 122 activity files under
`workflows/*/activities/**`, counting every node carrying a string `kind` and every node with
`kind: loop` including nested bodies.

**1003 steps across the 122 activity files** — 672 `technique`, 162 `action`, 115 `checkpoint`, 54
`loop`. No `workflow.yaml` carries an inline step today, so the corpus step population and the
activity-file population are the same number. The gap review measured 996 steps and 54 loops at
`b5e54574`; the loop count is unchanged and the step count has moved by seven.

**54 loops, in three shapes:**

| Shape | Count | Carry `continueWhile` | Carry `breakCondition` | Carry `condition` |
|---|---|---|---|---|
| `forEach` | 27 | 0 | 0 | 0 |
| `while` | 13 | 13 | 0 | 0 |
| `doWhile` | 14 | 14 | 0 | 0 |
| **Total** | **54** | **27** | **0** | **0** |

The partition is exact in both directions: every `while` and `doWhile` declares a continuation test,
and no `forEach` does. Three of the 54 are nested inside another loop's body —
`prism-evaluate/05-resolution-dialogue.yaml`'s `doWhile` `proposal-refinement` inside the `forEach`
`finding-iteration`, `work-package/08-implement.yaml`'s `doWhile` `provenance-settle-cycle` inside
the `forEach` `task-cycle`, and `meta/activities/patterns/03-plan-and-execute.yaml`'s `forEach`
`execute-after-replan` inside the `while` `replan-until-stable`. So both nesting directions occur.
Nine loops declare no `maxIterations`, four of
them repeat-until: `work-package/03-requirements-elicitation.yaml`'s and
`workflow-design/03-requirements-refinement.yaml`'s `assumption-reconciliation`,
`work-package/13-submit-for-review.yaml`'s `await-review-loop`, and
`work-package/15-codebase-comprehension.yaml`'s `deep-dive-iteration`. Each is bounded by its test
alone, which the guard permits.

`check-loop-shape.ts` runs clean over this population: `npx tsx scripts/check-loop-shape.ts --json`
returns `{"guard":"loop-shape","root":".../workflows","findings":[]}`.

### The 19 re-keys, verified

Corpus commit `95f13fd1` ("Keep a repeat-until loop's continuation test under its own key",
2026-09-04) changes **19 lines across 18 files**, each a single `condition:` becoming
`continueWhile:` — `git show 95f13fd1 | grep -c "^+ *continueWhile:"` gives 19. No expression body
is touched. The 19 then were 10 `while` and 9 `doWhile`; there are 27 now, so eight repeat-until
loops have been authored since, all with the field.

### Finding B1: fixed, and three of the six bodies were subsequently re-shaped on purpose

[findings-register.md](../../2026-09-03-routines/findings-register.md) B1 records that six of eight
top-level repeat-until loops entered nothing, because both mechanical readers took a continuation
test as an entry gate. The register marks it **Fixed**, and the mechanism reproduces:

- The walker gives a `doWhile` body one pass whatever its test says. `tests/e2e/walker.ts:567-575`
  gates only `step.loopType === 'while'` on `continueWhile`; a `doWhile` falls through to
  `await walk(step.steps)`.
- Eager bundling no longer consults a loop's continuation test.
  `src/tools/workflow-tools.ts:1571` passes `condition: s.kind === 'loop' ? undefined : s.condition`
  into `gateAnswer`, so a loop's gate verdict is its `when` alone.
- Manifest validation treats the continuation test as the gate that makes a loop's steps optional
  rather than as an entry condition: `src/utils/validation.ts:121-125` filters on
  `s.kind === 'loop' ? s.continueWhile === undefined : s.condition === undefined`.

The six bodies named at
[continuation-condition.md:92-99](../../2026-09-03-routines/continuation-condition.md) are **not
six doWhile loops** — three of them were `while` at the time of writing, and the six is the
`doWhile` row of a table whose `while` row also counts six. Their state today:

| Named site | Shape today | Does the body run on arrival |
|---|---|---|
| `plain-language/04-evaluate.yaml` — `evaluate-revise-loop` | `doWhile`, no `when` | Yes, one pass unconditionally |
| `work-package/04-research.yaml` — `research-reconciliation` | `doWhile`, no `when` | Yes, one pass unconditionally |
| `work-package/13-submit-for-review.yaml` — `await-review-loop` | `doWhile`, no `when` | Yes, one pass unconditionally |
| `work-package/09-lean-coding-audit.yaml` — `simplification-apply-cycle` | `while` | No — the test is taken before the first pass |
| `work-package/10-post-impl-review.yaml` — `review-fix-cycle` | `while` | No — same |
| `work-package/11-validate.yaml` — `fix-revalidate-cycle` | `while` | No — same |

The three that no longer run their body first were converted deliberately, after the re-key, by
corpus commit `72492064` ("Ask before applying a remedy, at the three loops that apply one",
2026-09-04): a remedial loop that applies fixes was applying its remedy once whether or not there
was anything to apply, and the validate cycle had no entry gate at all while two operations in its
body write files. All three now take the test before the first pass and the validate cycle gained
the review-mode gate its siblings carry. So the first pass of those three is gated again — but by
`continueWhile` on a `while` loop, which is the field and the shape that say so, rather than by a
continuation test read at the wrong moment.

The committed walk baseline shows the surviving unconditional pass directly. The `doWhile`
`await-review-loop` (`workflows/work-package/activities/13-submit-for-review.yaml:420-435`) has a
two-step body, an action and a checkpoint, and the walk records both: `await-review` appears in
`stepsExecuted` at `tests/e2e/__snapshots__/snapshot.test.ts.snap:621`, and the `review-received`
checkpoint is answered `yes-review` with `awaiting_review: false` at
`snapshot.test.ts.snap:586-593` — the answer that ends the loop, taken from inside a body the walk
had to enter to reach. At
`snapshot.test.ts.snap:237-243` the `research` activity records the `research-convergence`
checkpoint, which sits inside the `doWhile` `research-reconciliation` body
(`workflows/work-package/activities/04-research.yaml:90-107`); the body's first step carries its own
`when: has_reconcilable_research == true` and is skipped by that gate, so the loop is entered and
the step is not, which is the reading the split was for. The baseline's corpus stamp is
`cc09d641` (`tests/e2e/__snapshots__/corpus-sha.json`), 25 commits behind the corpus HEAD but ahead
of both `95f13fd1` and `72492064`.

### Finding B3: open, unchanged

The register's B3 records that the variable schema and the contract derivation disagree about a
loop's item variable. Both halves stand today:

- `src/schema/variable.schema.ts:64` ends the `writes` description with "a loop variable is
  iteration state and is not declared here".
- `src/utils/activity-variables.ts:497` calls `write(step.variable)` in the loop arm, under the
  comment "The loop binds its item variable each iteration: a write, whose readers are the body's
  own steps."

The practical effect is narrower than the wording suggests. `write` at
`src/utils/activity-variables.ts:474-481` adds a name to the session-write set only when the
workflow's declared namespace already holds it, so an undeclared item variable lands in `produces`
and `producedSoFar` and nowhere else — which is what makes a body step's read of it an internal
read. `src/utils/binding-provenance.ts:187` gives the same value a third reading, tagging it
`'loop'` so `binding-provenance.ts:250` can report it as "bound by loop". The disagreement is
therefore in the prose of the rule rather than in behaviour, and it is still there to be decided.

---

## Five. The loop-shape guard as it stands

**Id `loop-shape`.** Declared at `scripts/guards.ts:275-282` with `script:
scripts/check-loop-shape.ts`, `npmScript: check:loop-shape`, `scope: 'corpus'`, `json: true`, and
the claim it proves: "an item loop declares its collection, item and early exit, a repeat-until loop
its continuation test, and neither declares the other's". The same id is passed to `runGuard` at
`scripts/check-loop-shape.ts:154`, so the reported guard name and the registry entry agree. It is
wired to `check:loop-shape` in `package.json:53`.

**Five rules**, all raised from one function (`scripts/check-loop-shape.ts:51-105`):

| Rule | Fires when |
|---|---|
| `item-loop-without-collection` | a `forEach` declares no `over` or no `variable` (`:59`) |
| `item-loop-with-continuation` | a `forEach` declares `continueWhile` (`:67`) |
| `repeat-loop-without-continuation` | a `while`/`doWhile` declares no `continueWhile` (`:81`) |
| `repeat-loop-with-collection` | a `while`/`doWhile` declares `over` or `variable` (`:91`) |
| `repeat-loop-with-break` | a `while`/`doWhile` declares `breakCondition` (`:98`) |

It walks recursively and reaches nested bodies (`:107-117`), scans `workflow.yaml` as well as the
activity tree (`:136-147`), recurses into `meta/activities/patterns/` (`:126-134`), and calls
`assertScanned` so an unprovisioned corpus fails loudly rather than passing empty (`:148`). Its
nine-case test file passes (`npx vitest run tests/loop-shape-guard.test.ts` — 9 passed), and the
nesting case asserts the inner loop is the only site reported (`tests/loop-shape-guard.test.ts:98-111`).

**It carries no baseline, and neither does any other guard.** There is no baselines directory in the
repository, no `baseline` field in the guard registry, and `scripts/guard-protocol.ts` has no
baseline mechanism — the one mention, at `guard-protocol.ts:53-57`, records that `findingKey` drops a
trailing line number, "the same normalisation the retired baselines used, kept so a delta compares
defects and not line arithmetic". Drift is caught by `check:delta` comparing a guard's JSON against
the merge-base tree (`guard-protocol.ts:11-12`), not by a stored allowance. `scripts/stamp-corpus-baseline.ts`
is a different thing: it stamps the corpus commit the committed walk snapshots were generated
against. So the guard's own header claim — "Hard zero, no baseline" (`check-loop-shape.ts:28-29`) —
is accurate, and the corpus satisfies it.

One inconsistency inside the guard is worth recording because a reader will trip on it. Its local
`LoopStep` interface (`scripts/check-loop-shape.ts:43-49`) declares five fields and does not include
`breakCondition`, while `has('breakCondition')` at `:96` is typed `keyof LoopStep`. That compiles
only because `tsconfig.json` sets `include: ["src/**/*"]`, so `scripts/` is outside the typecheck;
`npx tsc --noEmit` passes. At runtime the index reaches the parsed YAML and the rule bites, which
the test proves. The type is narrower than the code.

---

## Six. The key list for the stale-restatement sweep

Each key is a literal string a search can take. Counts are occurrences over the whole repository
excluding `.git`, `node_modules`, `dist`, `.worktrees` and `.gitnexus` (the last is a generated
90 MB code-intelligence index, not a source of prose). Every count below was taken by a script that
composes the backtick as `chr(96)`, because a grep pattern containing one cannot be issued directly
under this repository's shell rules.

The canon names this defect itself: `AP-129 stale-restatement-after-change`
(`workflows/workflow-design/resources/anti-patterns.md:1703-1713`) — "take the pre-change phrasing
as the search key and sweep the whole definition tree … The test is occurrence count against the
tree, not against the change's file list". Its **Do not flag** clause exempts "planning-folder
artifacts that record the before state deliberately", which puts
`.engineering/artifacts/planning/**` out of scope. The `.engineering/artifacts/comprehension/**`
files are a separate case: they are dated snapshots (`zod-schemas.md` carries "Last updated:
2026-06-18") rather than planning records, and they are the documents an agent reads to learn the
schema. They are listed, with that caveat attached, for the sweep to rule on.

### A loop continuation test named condition

| Key | Count | Files |
|---|---|---|
| `Continue condition (while/doWhile)` | 1 | `schemas/README.md:383` |
| ``` `.condition`, `.breakCondition` ``` | 1 | `workflows/workflow-design/resources/schema-construct-inventory.md:47` |
| `loop continuations` | 1 | `.engineering/artifacts/comprehension/when-step-gates.md:32` |
| `condition/breakCondition?` | 1 | `.engineering/artifacts/comprehension/work-package-workflow-content.md:166` |

What holds: the continuation test is `continueWhile`, and `condition` on a loop step fails the load
(`src/schema/activity.schema.ts:152-164`). The first two are the load-bearing pair — one is the
schema reference, the other is the construct-choice table in corpus canon.

### breakCondition described as a general early exit rather than the forEach one

| Key | Count | Files |
|---|---|---|
| `Early exit condition (agent-evaluated each iteration)` | 1 | `schemas/README.md:385` |
| `the loop-kind step.breakCondition` | 1 | `.engineering/artifacts/comprehension/json-schemas.md:54` |
| `loop_break` | 7 | `src/schema/state.schema.ts:13`, `schemas/state.schema.json:163`, `schemas/session-file.schema.json:196`, `schemas/README.md:979`, `site/api/schemas.html:142`, `site/api/schemas.html:201`, and one planning artifact |

What holds: the field is scoped to item iteration and refused on a repeat-until loop
(`src/schema/activity.schema.ts:160`, `scripts/check-loop-shape.ts:96-104`). `loop_break` is
schema surface rather than prose — a history event type with no writer — and is included because the
sweep will surface it while reading the same vocabulary.

Two further keys assert a corpus site that does not exist, which is the same defect pointing the
other way:

| Key | Count | Files |
|---|---|---|
| `gained its only site` | 1 | `scripts/check-loop-shape.ts:17` |
| `The field's one live site` | 1 | `tests/loop-shape-guard.test.ts:86` |

What holds: `breakCondition` is at zero sites in the corpus; the site both sentences name was
removed by corpus commit `efcc3a97` and replaced by the nested `doWhile` at
`workflows/work-package/activities/08-implement.yaml:119-127`.

### A repeat-until or while loop described as deciding each pass anywhere other than continueWhile

| Key | Count | Files |
|---|---|---|
| `A nested step list with an exit condition` | 1 | `site/specs/workflows.html:339` |
| `until the condition is satisfied or the loop declares completion` | 1 | `site/specs/workflows.html:339` |
| `repeats nested steps until a condition clears` | 1 | `site/guide/definitions.html:86` |
| `until a condition is satisfied or the loop declares completion` | 1 | `site/guide/definitions.html:138` |
| `iterates over collections or while conditions hold` | 1 | `schemas/README.md:373` |

What holds: `continueWhile` is a *continuation* test — "the body runs again while this holds"
(`src/schema/activity.schema.ts:157`). All four site strings invert the polarity to an exit or
satisfaction condition, and none names a field. The site's own diagram gets it right two hundred
lines earlier: "repeat nested steps / while a condition holds" (`site/specs/workflows.html:324-325`).
"the loop declares completion" has no referent in the schema at all — no field, no action and no
event lets a loop declare its own completion.

### A description of the loop step that omits the field carrying the test

| Key | Count | Files |
|---|---|---|
| ``` loopType` semantics, `variable` / `over`, `breakCondition`, `maxIterations` ``` | 1 | `schemas/README.md:34` |
| `loop: loopType/variable/over/breakCondition/maxIterations/steps` | 1 | `.engineering/artifacts/comprehension/orchestration.md:132` |
| ``` `variable` / `over` / `breakCondition` / `maxIterations` ``` | 3 | `.engineering/artifacts/comprehension/orchestration.md:156`, `.engineering/artifacts/comprehension/zod-schemas.md:71`, `.engineering/artifacts/planning/2026-07-06-166-b4-zod-schema-tightening/plan.md:49` |
| ``` `loopType`, `over`, nested `steps[]` ``` | 2 | `workflows/workflow-design/resources/anti-patterns.md:204`, `.engineering/artifacts/planning/2026-07-28-workflow-design-slim-down/01-corpus-map-anti-patterns.md:170` |
| ``` gated by `when` or `condition` ``` | 5 | `docs/workflow-fidelity.md:143`, `workflows/workflow-design/resources/anti-patterns.md:1697`, and three planning artifacts |
| ``` a `when` or `condition` naming it ``` | 1 | `workflows/workflow-design/resources/anti-patterns.md:1697` |

Four of these enumerate the loop step's optional fields and leave out the one that decides whether
the body runs again. `schemas/README.md:34` is the more serious of the two authoritative sites,
because that row is the reader's map of which loop fields the engine enforces and which the agent
interprets, and the field the agent actually interprets is missing from it.

The last two keys are a different shape of the same omission and need a judgement rather than an
edit-in-place. `docs/workflow-fidelity.md:143` explains which manifest omissions are accepted in
terms of "a step gated by `when` or `condition`", where the validator it describes reads a loop's
`continueWhile` as that gate (`src/utils/validation.ts:121-125`). `AP-129`'s neighbour
`AP-128 unproduced-value-read` (`anti-patterns.md:1691-1701`) tells an auditor to trace readers that
are "an input binding, a `when` or `condition` naming it" — so a sole-produced variable read by a
loop's continuation test falls outside the detect as written. `AP-10 loop-not-prose`
(`anti-patterns.md:198-208`) is the mildest: its detect names `loopType`, `over` and nested `steps[]`,
which are the fields of a collection walk, so prose saying "do until done" — the phrase its own
sibling table uses for a repeat-until loop — is not detectable by the field names it lists.

### Scope summary for the sweep

| Surface | Keys landing there | Verdict |
|---|---|---|
| `schemas/README.md` | 5 keys, 5 occurrences (lines 34, 373, 383, 385, 979) | Authoritative; the loop-step field table names `condition`, omits `continueWhile`, and describes `breakCondition` as a per-iteration early exit |
| `workflows/workflow-design/resources/*.md` | 4 keys, 4 occurrences (`schema-construct-inventory.md:47`, `anti-patterns.md:204`, `anti-patterns.md:1697` twice) | Corpus canon; one field list fails the load, two detects cannot see a continuation test |
| `site/` | 4 keys, 4 occurrences in the prose pages (`specs/workflows.html:339`, `guide/definitions.html:86`, `guide/definitions.html:138`), plus 2 `loop_break` occurrences on the generated API page | Published prose; polarity inverted, no field named |
| `docs/` | 1 key, 1 occurrence (`workflow-fidelity.md:143`) | Gate set omits `continueWhile` |
| `scripts/`, `tests/` | 2 keys, 2 occurrences | Comments asserting a corpus site that is at zero |
| `src/schema/state.schema.ts` and the generated state schemas | 1 key, 3 occurrences | Runtime vocabulary with no writer |
| `.engineering/artifacts/comprehension/` | 5 keys, 6 occurrences | Dated snapshots; the sweep decides whether a snapshot is swept or restamped |
| `.engineering/artifacts/planning/` | 5 occurrences across 3 keys | Out of scope by `AP-129`'s own exemption |

---

## Figures the record states that could not be reproduced

- **"Nineteen loops re-keyed" is exact for the commit and stale for the corpus.** `95f13fd1` changes
  19 lines, and there were 19 repeat-until loops then. There are **27** now — 13 `while` and 14
  `doWhile` — so any figure downstream of the 19 needs re-basing. The gap review already carries the
  27 (as 54 loops, `while` 10 to 13, `doWhile` 9 to 14); the README's stage-0 row at
  [README.md:768](../../2026-09-03-routines/README.md) still states 19.
- **"46 loops in the corpus"** (`continuation-condition.md:105`) is now **54**, and "the 16 in the
  delivery baseline" is measured against a baseline whose corpus stamp is `cc09d641`, twenty-five
  commits behind HEAD.
- **The "six doWhile bodies" is a mis-labelled six.** The six sites named at
  `continuation-condition.md:92-99` were three `doWhile` and three `while` when named. The claim
  appears as "Six `doWhile` bodies run" in the README's stage-0 row
  ([README.md:768](../../2026-09-03-routines/README.md)) and as "six `doWhile` bodies that had never
  run" at [gap-review.md:357](../../2026-09-03-routines/gap-review.md) and again at
  gap-review.md:411, where it is the precedent for walk-before-merge on stages 2, 5 and 6. The
  precedent holds
  on its merits — bodies that had never run were required to be reviewed rather than accepted on a
  green suite — but the count and the shape attached to it do not survive measurement, and three of
  the six no longer run their body first because a later commit decided they should not.
- **"Twelve of those 16 have no body step eagerly bundled"** could not be re-taken: the delivery
  baseline it cites is not the walk snapshot in the tree, and no committed artifact carries per-loop
  bundling exclusions at that grain.
- **The register's B2 wording, "read once, used nowhere", is still exact** —
  `src/utils/activity-variables.ts:491` is the one read and the corpus has no sites — but the guard
  and test comments that replaced the deletion argument assert a site count of one.

## Re-taking every figure

```bash
# the loop step's declared fields, and the closed-object rule
sed -n '144,165p' src/schema/activity.schema.ts

# occurrence counts over the seven trees (62 and 13)
grep -rn "continueWhile" src scripts tests workflows schemas docs site | wc -l
grep -rn "breakCondition" src scripts tests workflows schemas docs site | wc -l

# breakCondition binding sites in the corpus (zero)
grep -rn "breakCondition" --include=*.yaml workflows/ | wc -l

# the guard: registration, rules, and a clean run
sed -n '275,282p' scripts/guards.ts
grep -n "check: '" scripts/check-loop-shape.ts
npx tsx scripts/check-loop-shape.ts --json
npx vitest run tests/loop-shape-guard.test.ts

# the two corpus commits
git -C workflows show --numstat --format= 95f13fd1
git -C workflows log -1 --format=%B 72492064
```

The loop census (54 loops, three shapes, per-loop field sets) and the key counts were taken by two
scripts written for this pass. Both walk with `yaml.safe_load` and compose the backtick as
`chr(96)`, and both are reproducible from the tables above: the census walks every node with
`kind: loop` under `workflows/*/workflow.yaml` and `workflows/*/activities/**/*.yaml` and records
each loop's key set; the key counter counts literal substring occurrences per line over the
repository with `.git`, `node_modules`, `dist`, `.worktrees` and `.gitnexus` excluded.
