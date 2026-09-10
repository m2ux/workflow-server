# Sixteen statements outside the change name a loop field that fails the load, and sixty-three describe a shared-gate mechanism stage 5 retires — a quarter of those already false too

A sweep of the routines proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Companions:
[ground-truth/stage-0-state.md](../ground-truth/stage-0-state.md),
[ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md),
[ground-truth/guard-obligations.md](../ground-truth/guard-obligations.md).

Server tooling at `ee95e4cd` on `main`; corpus at `a4a5d88b` on the `workflows` branch; planning
artifacts at `d4a2cfd4` on the `engineering` branch. The three ground-truth documents were measured
at server `9ca71c19` / corpus `2b8b7215`, both of which are ancestors of these; the tree moved
during this sweep, so every count below was re-taken back to back at the two commits named, and the
commits were re-read after the run to confirm they had not moved again. Where a figure here
disagrees with a ground-truth document or with the proposal, this document gives its own and says
so.

## What this sweep does, and why it is keyed on phrasing rather than on a file list

A change that alters a behaviour tends to update the statements it happens to open. The statements
it does not open keep asserting the arrangement that no longer holds, and a reader has no way to
tell one from the other: a stale sentence reads as current fact. The corpus names this defect
itself. `AP-129 stale-restatement-after-change`
(`workflows/workflow-design/resources/anti-patterns.md:1703-1713`) tells an auditor to "take the
pre-change phrasing as the search key and sweep the whole definition tree", and states the test in
one clause — "occurrence count against the tree, not against the change's file list: a manifest
naming one file for a claim that appears in three is the same defect". Its Fix asks for the count to
be carried in the change's own manifest, so the sweep is auditable afterwards.

So this sweep starts from phrasings, searches the whole tree for each, counts every occurrence, and
only then asks which occurrences sit outside the files the change would open. That last figure is
the one that matters, because each occurrence outside the list is a statement that survives the
change and goes on reading as current fact.

Two keys, measured separately.

- **Key one is false now.** Stage 0 of the nine-stage delivery plan has landed: a loop's
  continuation test lives in `continueWhile`, a loop step carries no `condition`, and the early exit
  `breakCondition` belongs to item iteration alone. Twenty-three phrasings describe the arrangement
  that no longer holds; eighteen of their occurrences are false statements, and sixteen of those
  eighteen sit outside the change's file list.
- **Key two is falsified when stage 5 lands.** Forty-four phrasings describe how a shared gate body
  is expressed and route an author to the mechanism stage 5 retires, for 253 occurrences over 26
  files. Most are accurate today. Their value is that the count exists before the work starts rather
  than after. Six of the forty-four turn out to describe the mechanism's **rule** half, which the
  schema already refuses, so those eighteen occurrences are false now rather than later.

Key one's literals are the twenty the ground truth lists, plus three added here. Key two has no
literal list to inherit — neither ground-truth document carries one — so all forty-four were derived
here from the mechanism's own vocabulary in the schema, the resolver and the guard.

Nothing in the routines design is built, so every construct counted here is one that stands today.
`src/schema/activity.schema.ts:167-172` declares `StepSchema` over four members —
`TechniqueStepSchema`, `ActionStepSchema`, `CheckpointStepSchema`, `LoopStepSchema`. There is no
`routines/` directory in any workflow and no materialisation pass. Stage 0 alone has anything behind
it.

## Where each count came from

Searches ran over the whole repository with `.git`, `node_modules`, `dist`, `.worktrees`, `.idea`,
`.venv` and `.gitnexus` excluded, and `package-lock.json` skipped — 3,513 readable text files.
`.gitnexus` is a generated code-intelligence index rather than a source of prose.

Most of these phrasings are code tokens that appear inside backticks in markdown, and a grep pattern
containing a backtick cannot be issued under this repository's shell rules. **Every count was taken
by a Python script that composes the backtick as `chr(96)` and counts literal substring occurrences
per line.** Two counting rules were used, and each key below says which:

- **Case-sensitive literal substring** — 60 of the 67 literals reported (23 for key one, 44 for key
  two).
- **Case-insensitive literal substring** — 7 literals whose subject appears in more than one casing:
  `checkpoint fragment` (a heading reads "Shared checkpoint fragments", a table cell reads
  "**Checkpoint fragment**"), `fragment ref`, `rule fragment`, `rules slots`, `shared rule texts`,
  `declared once under` and `declared once as a`.

Occurrences are reported in four buckets, because two of them are out of scope for different
reasons:

| Bucket | Treatment |
|---|---|
| Live tree — `src`, `scripts`, `tests`, `schemas`, `docs`, `site`, `grammar`, `constraints`, `examples`, every README, and the corpus at `workflows/` | In scope. Every figure in this document's headline is from this bucket |
| `.engineering/artifacts/comprehension/**` | Reported separately and ruled on below |
| `.engineering/artifacts/planning/**` | Out of scope by `AP-129`'s own **Do not flag** clause, which exempts "planning-folder artifacts that record the before state deliberately" (`anti-patterns.md:1711`). Counted and set aside; this folder alone holds 52 occurrences of `fragments.checkpoints` |
| `.engineering/` outside those two folders | Zero occurrences of any reported literal. The one hit anywhere in this bucket came from a key retired below, and it was a proposal for a different definition language rather than a statement about this one |

**One count was taken with the wrong pattern and is recorded here as a warning rather than used.**
The literal `declared once`, case-insensitive, returns 19 live occurrences over 17 files, 12 of them
outside the change's file list. Only 5 of the 12 are about the shared-gate mechanism; the other 7
are technique-inheritance prose that happens to share the phrase —
`workflows/prism/README.md:188`, `workflows/ponytail/README.md:65`,
`workflows/ponytail/techniques/README.md:36`, `workflows/prism-audit/README.md:84`,
`workflows/prism-audit/techniques/README.md:82`,
`workflows/substrate-node-security-audit/techniques/README.md:64` and
`docs/resource-resolution-model.md:114`. The key is retired and replaced by two narrower ones,
`declared once under` and `declared once as a`, which between them reach the same five mechanism
sites and nothing else.

**A second key is retired for the same reason.** `imported by`, case-insensitive, returns 11 live
occurrences over 9 files with 6 outside the change's file list, but three of those describe schema
imports in TypeScript rather than a fragment import. Its precise forms `` imported by `ref` `` and
`imported by <code>ref</code>` reach only the mechanism, and those are the two counted below. Both
retirements are reported rather than quietly dropped, because a count taken with the wrong pattern
is worse than no count.

Two further keys collide with unrelated text and the collisions are excluded from every total.
`unresolved-ref` matches the phrase "unresolved-reference" at
`examples/cursor-workspace/.claude/skills/workflow-canon/SKILL.md:97`, which is a finding class and
not the guard rule. `unused-fragment` matches the fixture identifier `unused-fragment-gate` at
`tests/fixtures/fragments/alpha-fixture/workflow.yaml:9`, which is the guard's own test fixture; the
fixture tree travels with the guard, so it counts as inside the change rather than outside it.

## The file list a delivery stage would open

Established from the delivery-stage table (`README.md:762-807`) and the acceptance criteria
(`README.md:809-943`), plus the four sections that name files by hand — the guard suite
(`README.md:1002-1084`), discovery and generation (`README.md:1122-1128`), the raw-text
representation (`README.md:1164-1189`) and the walker (`README.md:1196-1200`). The rule applied is:
a file is in the list when a stage's own text or acceptance criteria say it gets **edited**. A guard
the proposal classifies as needing no change is therefore out of the list even though the proposal
names it. The list comes to **45 paths, 14 in the corpus and 31 in the server repository.**

**Corpus definition files — 14.** `workflows/work-package/workflow.yaml` (stage 5 removes its
`fragments` block, `README.md:882-883`); the four assumption-run hosts `04-research.yaml`,
`05-implementation-analysis.yaml`, `07-assumptions-review.yaml` and `08-implement.yaml` under
`workflows/work-package/activities/` (stages 5 and 6); the three further convergence sites
`02-design-philosophy.yaml`, `06-plan-prepare.yaml` and `15-codebase-comprehension.yaml` (stage 6);
the three `prism` per-unit passes (stage 7, `README.md:925-927`); and the three `meta` fan-out
pattern activities named at `README.md:936-938` (stage 8).

**Server files — 31.** `src/schema/activity.schema.ts` and `src/schema/workflow.schema.ts`;
`src/loaders/fragment-resolver.ts` and `src/loaders/workflow-loader.ts`;
`src/utils/activity-variables.ts`; `src/tools/workflow-tools.ts`, which owns the raw-YAML delivery
path and `injectResolvedStepIds`; `scripts/generate-schemas.ts` and the two generated schemas it
rewrites; `scripts/guards.ts` and `package.json`; `scripts/check-fragments.ts`,
`scripts/fragments-index.ts` and their two test files; the nine guards the proposal assigns to walk
`routines/` and the four it moves onto the loader; `tests/e2e/walker.ts`; and the three committed
baselines stage 5 re-records.

**What the list does not contain, and this is the sweep's whole subject.** No record in the
2026-09-03-routines folder — the README or any of its twelve companions — names `schemas/README.md`,
`docs/checkpoint-model.md`, `docs/workflow-fidelity.md`, any page under `site/`,
`workflows/workflow-design/resources/schema-construct-inventory.md`,
`workflows/workflow-design/resources/anti-patterns.md`, or any file under
`.engineering/artifacts/comprehension/`. A grep for each of those paths across all thirteen records
returns nothing. Every occurrence in those files is outside the change.

---

# Key one — the loop's continuation test has one field, and sixteen statements outside the change name a different one

## What holds

`src/schema/activity.schema.ts:152-164` declares `LoopStepSchema` as a closed object of twelve
fields, closed by the `.strict()` at `:164`. Ten are declared on the member and two arrive from the
`stepCommonFields` spread at `:163`. The continuation test is `continueWhile` (`:157`): "the body
runs again while this holds. Declared by every repeat-until loop and by no forEach". The early exit
is `breakCondition` (`:160`), scoped to item iteration: "evaluated by the executing agent before
each item … A repeat-until loop states its stopping condition in `continueWhile` instead."

`condition` is not a field of a loop step. It is the structured entry gate, spread from
`stepEntryCondition` at `src/schema/activity.schema.ts:84-86` into three step kinds and no more —
`technique` at `:101`, `action` at `:110`, `checkpoint` at `:140`. `LoopStepSchema` spreads
`stepCommonFields` alone at `:163`, and the comment above the declaration states the rule directly:
"A loop carries no `condition`, so its entry gate is `when` — uniformly with every other step kind"
(`:150-151`). Because the object is closed, a `condition` on a loop is a load error rather than a
warning.

A walk of the corpus agrees. At `a4a5d88b`, parsing every `workflow.yaml` and every activity file
under `workflows/*/activities/**` and counting every node with a string `kind` gives **1,004 steps
and 53 loop steps** — 26 `forEach`, 14 `doWhile`, 13 `while`. **Twenty-seven carry `continueWhile`,
zero carry `condition`, and zero carry `breakCondition`.** `stage-0-state.md` measured 1,003 steps
and 54 loops at `2b8b7215`; the corpus has since lost one `forEach` and gained one step. The
`continueWhile` figure of 27 is unchanged, and the partition is still exact in both directions.

## The eighteen false statements, one at a time

Sixteen distinct lines carry them; two lines carry two keys each. Sixteen occurrences at fourteen
lines over six files sit outside the change's file list.

### The schema guide names the field the loader refuses, and omits the one that carries the test

`schemas/README.md` enumerates the loop step's fields in three separate places — an
entity-relationship diagram, a construct-enforcement table and a field table — and every one of the
three omits the field that carries the continuation test. Six false occurrences in one file, and the
file is in no delivery stage's list.

1. **`schemas/README.md:383`** — the loop-step field table's seventh row reads
   `| condition | Condition | Continue condition (while/doWhile) |`. The field named is the one the
   closed object refuses, and the caption describes exactly the job `continueWhile` does. The same
   ten-row table omits `continueWhile` entirely, so a reader consulting the authoritative field list
   for a `while` loop is handed a field that fails the load and denied the field that works.
2. **`schemas/README.md:385`** — the row below it reads
   `| breakCondition | Condition | Early exit condition (agent-evaluated each iteration) |`. "Each
   iteration" is broader than the field: the schema scopes it to item iteration and the loop-shape
   guard raises `repeat-loop-with-break` when a `while` or `doWhile` declares one
   (`scripts/check-loop-shape.ts:96-104`).
3. **`schemas/README.md:373`** — the paragraph introducing the table says a loop step "iterates over
   collections or while conditions hold", which names no field at all and leaves the reader to guess
   which one carries the test.
4. **`schemas/README.md:34`** — the construct-enforcement table's Loop-step row puts
   "`loopType` semantics, `variable` / `over`, `breakCondition`, `maxIterations` — iteration is
   executed and bounded entirely by the agent" in the agent-interpreted column. That row is the
   reader's map of which loop fields the engine enforces and which the agent interprets, and the
   field the agent actually interprets to decide whether the body runs again is missing from it.
5. **`schemas/README.md:32`** — the row above it, headed "Step (common)", lists
   "`when` / `condition` gates" among the fields every step kind carries. `condition` is on three of
   the four kinds. Calling it common is precisely the claim stage 0 falsified when it took the field
   off the loop.
6. **`schemas/README.md:224`** — inside the entity-relationship diagram at `:150-242`, the
   `LoopStep` entity at `:220-227` declares six fields: `id`, `kind`, `name`, `loopType`,
   `variable`, `maxIterations`. It omits `continueWhile`, `over`, `breakCondition` and `steps`. This
   is the file's third loop-field enumeration and its second omission of the continuation test.
   **Neither ground-truth document carries this occurrence; it is added here.**

### Corpus canon routes an author to a field that fails the load

7. **`workflows/workflow-design/resources/schema-construct-inventory.md:47`** — the construct-choice
   table's loop row gives the field list as "`.id`, `.loopType` (forEach/while/doWhile),
   `.variable`, `.over`, `.condition`, `.breakCondition`, `.maxIterations`, optional `.name`". This
   is the table an author consults to pick a construct for "do until done", and it names one field
   that fails the load while omitting the one that carries the test. Of the eighteen, this is the
   occurrence with the most direct route into a new definition.
8. **`workflows/workflow-design/resources/schema-construct-inventory.md:52`** — four rows down, the
   Step-gate row reads "`steps[].when` / `steps[].condition` (references condition.schema.json) — a
   shared base field on every step kind". A loop step is a step kind and carries no `condition`.
   **Added here; neither ground-truth document carries it.**
9. **`workflows/workflow-design/resources/anti-patterns.md:204`** — `AP-10 loop-not-prose` detects
   prose that should be a loop, and its Detect names the fields to look for as "`loopType`, `over`,
   nested `steps[]`". Those are the fields of a collection walk. Prose saying "do until done" — the
   phrase the construct inventory's own sibling column uses for a repeat-until loop — is not
   detectable by that field set, so the detect is blind to exactly the loops `continueWhile` exists
   for.
10. **`workflows/workflow-design/resources/anti-patterns.md:1697`** — `AP-128 unproduced-value-read`
    tells an auditor to start "For each step gated by `when` or `condition`" and to trace readers
    that are "an input binding, a `when` or `condition` naming it, a `{token}`". Two occurrences on
    one line. A variable read only by a loop's continuation test is read by neither field named, so
    a sole-produced value consumed by a `while` loop falls outside the detect as written.

### The published prose inverts the polarity of the test and names no field

11. **`site/specs/workflows.html:339`** — the step-kinds table's loop row reads
    `A nested step list with an exit condition` and `Repeat the nested steps until the condition is
    satisfied or the loop declares completion`. Two occurrences on one line. `continueWhile` is a
    *continuation* test, not an exit test, and "the loop declares completion" has no referent in the
    schema at all: no field, no action and no history event lets a loop declare its own completion.
    The page's own diagram gets it right fourteen lines earlier — "repeat nested steps / while a
    condition holds" (`site/specs/workflows.html:324-325`) — so the table contradicts the figure
    above it.
12. **`site/guide/definitions.html:86`** — the glossary index row: "A step that repeats nested steps
    until a condition clears".
13. **`site/guide/definitions.html:138`** — the glossary entry itself: "a step kind that repeats a
    nested list of steps until a condition is satisfied or the loop declares completion". Same
    inversion, same absent referent, in the document a newcomer reads first.

### The manifest-fidelity contract omits the field the validator reads

14. **`docs/workflow-fidelity.md:143`** — "a step gated by `when` or `condition` may be omitted from
    the manifest — the agent evaluated the gate and skipped the step". The validator this sentence
    describes reads a loop's `continueWhile` as that gate:
    `src/utils/validation.ts:121-125` filters on
    `s.kind === 'loop' ? s.continueWhile === undefined : s.condition === undefined`. So the
    accepted-omission rule is stated over a two-field set where the code uses three.

### Two comments assert a corpus site that is at zero

These two are the only key-one occurrences inside the change's file list, and they are in it by
adjacency rather than by intent: stage 4 changes `check-loop-shape` to walk `routines/`
(`README.md:1027`), and a guard change customarily opens its test.

15. **`scripts/check-loop-shape.ts:17`** — the guard's header reasons that `breakCondition` "was
    measured unused while this work was designed, and gained its only site two days earlier on a
    branch that had not merged: `08-implement`'s task cycle stops iterating tasks once a symbol's
    provenance is unaccounted for. So the field carries live meaning on an item loop." The site is
    gone. `grep -rn breakCondition --include=*.yaml workflows/` returns zero lines, and the walk
    above finds zero of 53 loops carrying the field. What stands in that position is a nested
    `doWhile`, `provenance-settle-cycle`, which settles the uncertainty in place rather than
    stopping the walk.
16. **`tests/loop-shape-guard.test.ts:86`** — "The field's one live site: the task cycle stops once
    a symbol's provenance is unaccounted for." Stated as a fact about the corpus, and false against
    it.

The guard's *argument* survives both corrections — a field with one job is worth keeping whether or
not it is exercised, and the rule the argument justifies is green — but the sentences carrying the
argument assert a site count of one where the count is zero.

## The runtime break vocabulary, which is stranded rather than false

`loop_break` returns **6 live occurrences over 5 files**, all outside the change's file list:
`src/schema/state.schema.ts:13`, `schemas/state.schema.json:163`,
`schemas/session-file.schema.json:196`, `schemas/README.md:979`, and twice on the generated API page
at `site/api/schemas.html:142` and `:201`. `stage-0-state.md` gives 7 over 6; the seventh is a
planning artifact, which this sweep sets aside, so the two figures agree.

**None of the six is a false statement, and the sweep records them as such.** Four are schema
surface, one is the generated rendering of that surface twice over, and `schemas/README.md:979`
enumerates the declared event types accurately. What is true of all six is that the vocabulary has
no subject: `src/schema/state.schema.ts:13` declares `loop_started`, `loop_iteration`,
`loop_completed` and `loop_break`, `:167` declares `activeLoops` with a default of `[]`, and a grep
for all five names across `src` and `scripts` finds no writer — the only non-declaration site is
`scripts/generate-session-token.ts:177`, which initialises the array to empty. Iteration is the
agent's job, so this is consistent with the design. It is recorded because `loop_break` is the
runtime half of a field at zero sites, and a reader who follows the vocabulary will arrive at it.

## The comprehension snapshots: dated, and therefore out of scope

Five key-one literals land only in `.engineering/artifacts/comprehension/`, for **6 occurrences over
5 files**:

| Occurrence | What it says |
|---|---|
| `when-step-gates.md:32` | structured `condition` is retained for, among other things, "loop continuations" |
| `work-package-workflow-content.md:166` | the loop step's shape is "`loopType: forEach\|while\|doWhile`, `condition/breakCondition?`, `maxIterations?`" |
| `json-schemas.md:54` | names "the loop-kind `step.breakCondition`" among the condition-carrying fields |
| `orchestration.md:132` | gives the step shape as "loop: loopType/variable/over/breakCondition/maxIterations/steps" |
| `orchestration.md:156` | "plus `variable` / `over` / `breakCondition` / `maxIterations`" |
| `zod-schemas.md:71` | the same four-field list, cited to `activity.schema.ts:82-87` |

**The ruling is that these are out of scope, and the reason is measurable rather than a matter of
taste.** Every one of the five files carries a date in its opening block, and every date is before
the re-key: `when-step-gates.md:3` reads "> 2026-08-01", and `work-package-workflow-content.md:3`,
`orchestration.md:3`, `zod-schemas.md:3` and `json-schemas.md:6` each read "Last updated:
2026-06-18". A document that states the revision it describes is not asserting current fact, which
is the same reasoning `AP-129` applies to the planning folder. `orchestration.md:156` and
`zod-schemas.md:71` even cite a line range, `activity.schema.ts:82-87`, that no longer holds the
loop step — the citation dates itself.

The judgement is worth stating plainly rather than assumed, because these are the documents an agent
reads to learn the schema, and a date stamp is a weaker guard than a correction. The recommendation
is that a comprehension snapshot touched by a schema change is **restamped** — its date advanced and
its content re-taken — rather than swept sentence by sentence. Six occurrences is what a restamp
would cost.

## Key one, totalled

Method for every row: case-sensitive literal substring over the live tree.

| # | Key literal | Occ | Files | Outside the list |
|---|---|---|---|---|
| 1 | `Continue condition (while/doWhile)` | 1 | 1 | **1** |
| 2 | `` `.condition`, `.breakCondition` `` | 1 | 1 | **1** |
| 3 | `Early exit condition (agent-evaluated each iteration)` | 1 | 1 | **1** |
| 4 | `iterates over collections or while conditions hold` | 1 | 1 | **1** |
| 5 | the backticked field list `` `loopType` semantics, `variable` / `over`, `breakCondition`, `maxIterations` `` | 1 | 1 | **1** |
| 6 | `` `when` / `condition` gates `` — *added* | 1 | 1 | **1** |
| 7 | `enum loopType` — *added* | 1 | 1 | **1** |
| 8 | `a shared base field on every step kind` — *added* | 1 | 1 | **1** |
| 9 | `` `loopType`, `over`, nested `steps[]` `` | 1 | 1 | **1** |
| 10 | `` gated by `when` or `condition` `` | 2 | 2 | **2** |
| 11 | `` a `when` or `condition` naming it `` | 1 | 1 | **1** |
| 12 | `A nested step list with an exit condition` | 1 | 1 | **1** |
| 13 | `until the condition is satisfied or the loop declares completion` | 1 | 1 | **1** |
| 14 | `repeats nested steps until a condition clears` | 1 | 1 | **1** |
| 15 | `until a condition is satisfied or the loop declares completion` | 1 | 1 | **1** |
| 16 | `gained its only site` | 1 | 1 | 0 |
| 17 | `The field's one live site` | 1 | 1 | 0 |
| | **False statements** | **18** | **8** | **16** |
| 18 | `loop_break` — stranded vocabulary, not a false statement | 6 | 5 | **6** |
| | **Everything the key set reaches in the live tree** | **24** | **12** | **22** |

Comprehension-only keys, reported separately and ruled out of scope: `loop continuations` (1),
`condition/breakCondition?` (1), `the loop-kind step.breakCondition` (1),
`loop: loopType/variable/over/breakCondition/maxIterations/steps` (1),
`` `variable` / `over` / `breakCondition` / `maxIterations` `` (2) — **6 occurrences over 5 files**.

**The figure that matters: of the 18 false statements, 16 sit at 14 distinct lines in 6 files that
no delivery stage opens.**

| File outside the change | Occurrences | Lines |
|---|---|---|
| `schemas/README.md` | 6 | 6 |
| `workflows/workflow-design/resources/anti-patterns.md` | 3 | 2 |
| `workflows/workflow-design/resources/schema-construct-inventory.md` | 2 | 2 |
| `site/guide/definitions.html` | 2 | 2 |
| `site/specs/workflows.html` | 2 | 1 |
| `docs/workflow-fidelity.md` | 1 | 1 |
| **Total** | **16** | **14** |

The two inside the list are `scripts/check-loop-shape.ts:17` and
`tests/loop-shape-guard.test.ts:86`. Adding the `loop_break` group, 22 of the 24 occurrences the key
set reaches in the live tree are outside the list, at 20 lines over 10 files.

## Three surfaces that describe the loop step and are correctly out of key

Each looked like a key-one occurrence on first reading and is not. They are recorded because ruling
them out is part of the measurement.

- **`docs/orchestra-specification.md`** describes a loop as iterating a named flow over a
  collection, says "Only `forEach` is supported", and puts while-like behaviour in decision
  self-reference (`docs/orchestra-specification.md:235`). Every one of those claims is false of the
  shipping schema, and none is a defect, because the page frames itself in its third line: "The
  server implements a different shape, so nothing on this page describes a file the loader accepts"
  (`:3`). It is a proposal for a different language, and it says so before it says anything else.
- **`grammar/activity.ebnf` and `constraints/activity.als`** specify the same different language —
  `loops:` as a top-level array with `variable`, `over`, `maxIterations` and `flow`, and a `Break`
  flow item (`constraints/activity.als:78-84`, `grammar/activity.ebnf:75-84`). Neither names
  `condition` on a loop, so neither is a stage-0 restatement. Their READMEs are less careful than
  the specification's — `grammar/README.md:3` calls them "Formal EBNF grammars defining the syntax
  of workflow definition files" and `grammar/README.md:15` marks the activity grammar "Defined",
  with no equivalent of the disclaimer — but the drift there is a whole language rather than a
  field, and it belongs to a different sweep.
- **`workflows/workflow-design/techniques/impact-analysis.md:49`** asks an auditor to "Verify all
  `condition.variable` references in transitions, decisions, step gates (`when`/`condition`), and
  `kind: loop` steps resolve to defined workflow variables", and its sibling at
  `workflows/workflow-authoring/techniques/workflow-definition/impact-analysis.md:62` says the same
  more briefly. `condition.variable` here is the shape of a `Condition` object, which
  `src/schema/condition.schema.ts:15-22` declares with a `variable` field, and a loop's
  `continueWhile` and `breakCondition` are both `ConditionSchema` — so a loop step does carry
  condition objects with a `variable` to check. The parenthetical `(when/condition)` qualifies "step
  gates", and `kind: loop` steps are listed separately from it, so the sentence distinguishes the
  two rather than conflating them. Accurate as written.

---

# Key two — the manifest for the migration that retires the shared gate body

Stage 5 converges four copies of one run onto a routine and deletes the mechanism that holds their
shared gate bodies today: "the two shared gate bodies and the fragment mechanism retire, taking
seven guard rules with them" (`README.md:773`). These phrasings describe that mechanism and route an
author to it. Most are accurate now, which is the point: they are the manifest the migration commit
has to carry, and the count exists before the work starts rather than after.

The phrasings were derived from the mechanism's own vocabulary rather than taken from a document —
from the schema (`src/schema/workflow.schema.ts:36-43` and `:171`,
`src/schema/activity.schema.ts:114-141`), from the resolver
(`src/loaders/fragment-resolver.ts:1-64`), and from the guard's nine rule names
(`scripts/check-fragments.ts:11-28`, union at `:56-65`).

## The mechanism as it stands

Reproduced independently of `fragment-mechanism.md`, at corpus `a4a5d88b`:

- **One declaration.** `grep -rn fragments --include=*.yaml --include=*.yml workflows/` returns two
  lines: `workflows/work-package/workflow.yaml:15`, and one unrelated piece of prose about a
  changelog fragment. The block spans lines 15 to 71, the next top-level key `techniques:` being at
  `:72` — **57 lines**, holding two named checkpoint bodies under `fragments.checkpoints`.
- **Eight reference sites at four activity files.**
  `grep -rn "ref:" --include=*.yaml workflows/*/activities/` returns exactly eight lines, at
  `04-research.yaml:224` and `:243`, `05-implementation-analysis.yaml:126` and `:145`,
  `07-assumptions-review.yaml:112` and `:130`, `08-implement.yaml:202` and `:221`. Same sites, same
  line numbers as the ground truth.
- **The rule half is gone.** `WorkflowFragmentsSchema` (`src/schema/workflow.schema.ts:40-42`)
  declares exactly one key, `checkpoints`, and closes with `.strict()` at `:42`. The generated
  `schemas/workflow.schema.json` agrees: the `fragments` object has one property and
  `additionalProperties: false`. Every rules array in the system is a string array —
  `src/schema/workflow.schema.ts:30-32` for the three workflow partitions,
  `src/schema/activity.schema.ts:309` for an activity's own.
- **The guard is green.** `npx tsx scripts/check-fragments.ts` prints "fragments: OK — every ref
  resolves, every fragment is used, no inline duplicates".

**There is no phrasing to sweep for a shared *run*, and the absence is itself the finding.** The
construct inventory carries a row for the shared gate body
(`workflows/workflow-design/resources/schema-construct-inventory.md:68`) and a row for reusing a
whole activity (`:37`, "Compose / reuse activities" → **Activity→activity composition**), and no row
between them for a shared step sequence, because no construct holds one. The nearest remedies the
catalogue offers are `AP-38 no-duplicate-technique-steps`
(`workflows/workflow-design/resources/anti-patterns.md:542`), which is about one technique bound
twice inside one activity, and `AP-74 no-duplicated-guidance` (`anti-patterns.md:985`), which is
about prose. So key two's run half is empty: the migration's manifest for the run is the four host
files themselves, and the only phrasing an author is routed to for shared orchestration is "borrow
an activity", which a routine narrows rather than replaces.

## Group 1 — the gate-body vocabulary in prose

Seventeen literals, **112 occurrences at 67 distinct lines over 24 files. 47 occurrences at 22 lines
over 10 files sit outside the change's file list.**

| Key literal | Occ | Files | Outside |
|---|---|---|---|
| `fragments.checkpoints` | 16 | 11 | **6** |
| `checkpoint fragment` *(case-insensitive)* | 17 | 12 | **7** |
| `fragment ref` *(case-insensitive)* | 24 | 15 | **6** |
| `[workflow::]name` | 15 | 11 | **9** |
| `check:fragments` | 9 | 8 | **4** |
| `Shared checkpoint bodies` | 6 | 4 | **3** |
| `` imported by `ref` `` | 6 | 6 | **2** |
| `declared once under` *(case-insensitive)* | 3 | 3 | **1** |
| `imports one via` | 3 | 3 | **1** |
| `Named checkpoint bodies` | 2 | 2 | 0 |
| `declared once as a` *(case-insensitive)* | 2 | 2 | **2** |
| `Shared fragments` | 2 | 2 | **1** |
| `single home for the checkpoint` | 2 | 2 | **1** |
| `stays the single home` | 2 | 2 | **1** |
| `imported by <code>ref</code>` | 1 | 1 | **1** |
| `Workflow fragments` | 1 | 1 | **1** |
| `reusable content once under` | 1 | 1 | **1** |

The twenty-two out-of-list lines, each a statement that would survive the change:

- **`site/specs/resource-resolution.html:203, 205, 206, 208, 209, 211`** — a whole
  `<h2 id="fragments">Workflow fragments</h2>` section. Line 206 says a workflow "can declare
  reusable content once under `fragments` in `workflow.yaml` and import it by reference", and 209
  gives `fragments.checkpoints` as "shared checkpoint bodies (message, options, effects); a
  `kind:checkpoint` step imports one via `ref`, contributing its own site-local `id`". Six lines.
- **`site/specs/workflows.html:226, 228, 229`** — an `<h3 id="fragments">Shared fragments</h3>`
  section, plus a borrowed-activity paragraph that explains scoping by reference to "checkpoint
  fragment refs".
- **`site/specs/checkpoints.html:195, 196`** — an `<h2 id="fragments">Shared checkpoint
  fragments</h2>` heading and the paragraph under it, which is the single most complete description
  of the mechanism anywhere in the published prose: declaration site, reference form, the
  site-condition rule, the materialisation point, and the guard that polices it.
- **`site/api/schemas.html:264`** — the generated workflow field table's `fragments` row.
- **`site/design/request-lifecycle.html:124, 127`** — the load path and the `get_activity` path,
  both of which name checkpoint-fragment materialisation as a stage they perform.
- **`schemas/README.md:279, 335, 341, 500`** — the workflow field table's `fragments` row twice
  (`:279` in the full table, `:500` in the summary), and the checkpoint step's two-forms explanation
  at `:335` with the `ref` field row at `:341`. `:335` is the load-bearing one: it is where an
  author reads that a checkpoint is "authored in exactly one of two forms", and after the migration
  there is one form.
- **`docs/checkpoint-model.md:116`** — the checkpoint model's own paragraph on the mechanism,
  covering declaration, reference and materialisation in four sentences. This is the document
  `check-decision-order` names as the home of what its rule keys on
  (`scripts/check-decision-order.ts:8`), so it is read by anyone tracing a checkpoint guard.
- **`workflows/workflow-design/resources/schema-construct-inventory.md:68`** — the construct-choice
  row "Several activities ask the user the same question → **Checkpoint fragment**". This is the one
  occurrence in the set that actively directs an author to author the construct, and it is corpus
  canon.
- **`workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:29`** —
  an audit technique's list of guards, describing `check-fragments.ts` as checking "every fragment
  reference resolves, every fragment is used, and no inline body duplicates a fragment". Seven of
  those nine rules go.
- **`scripts/check-checkpoint-presentation.ts:150`** — see group 5.

## Group 2 — the guard rules, by name

Seven rules die with the mechanism and two survive, which is the partition
[decisions.md:447-450](../../2026-09-03-routines/decisions.md) names and `fragment-mechanism.md`
reproduces. Measured here for the third time and identically. Method: case-sensitive literal
substring; the two substring collisions described earlier are excluded.

| Key literal | Occ | Files | Outside | Disposition |
|---|---|---|---|---|
| `malformed-ref` | 3 | 1 | 0 | dies |
| `unresolved-ref` | 5 | 2 | 0 | dies |
| `ref-body-conflict` | 5 | 2 | 0 | dies |
| `ref-opens-step` | 4 | 2 | 0 | dies |
| `unused-fragment` | 6 | 2 | 0 | dies |
| `inline-duplicate-of-fragment` | 3 | 1 | 0 | dies |
| `undeclared-effect-variable` | 4 | 2 | 0 | dies |
| | **30** | **2** | **0** | |
| `duplicate-checkpoint` | 4 | 2 | 0 | survives, remedy changes |
| `duplicate-rule` | 6 | 2 | 0 | survives unchanged |

**Every one of the 40 occurrences is inside the change's file list**, all of them in
`scripts/check-fragments.ts` and `tests/fragments-guard.test.ts`. This is the cleanest result in the
sweep and it is worth naming: a guard rule's name lives only where the rule lives, so deleting the
rule deletes every statement of it. Nothing about a rule name leaks into prose the change does not
open.

## Group 3 — the remedies that route an author to the mechanism

| Key literal | Occ | Files | Outside |
|---|---|---|---|
| `extract a fragment` | 2 | 1 | 0 |
| `must become a reference` | 1 | 1 | 0 |
| `reference it instead` | 1 | 1 | 0 |

Four occurrences, all in `scripts/check-fragments.ts`, all inside the list. Two of them are
`duplicate-checkpoint`'s remedy, which survives the migration with its advice changed: the header at
`:24-25` reads "identical (normalized) checkpoint body authored inline at two or more sites: extract
a fragment", and the finding detail at `:269` ends "— extract a fragment". Those are the two strings
the proposal's stage-5 criterion has in mind when it asks that `duplicate-checkpoint` keep "its rule
with its remedy naming a routine" (`README.md:883-884`). Naming them here is what makes that
criterion checkable.

## Group 4 — the mechanism's code identifiers

Nine literals, **79 occurrences at 66 distinct lines over 9 files, and every one is inside the
change's file list.**

| Key literal | Occ | Files | Outside |
|---|---|---|---|
| `FragmentsLookup` | 20 | 6 | 0 |
| `resolveCheckpointFragment` | 15 | 5 | 0 |
| `parseFragmentRef` | 12 | 4 | 0 |
| `injectCheckpointFragmentBodies` | 8 | 4 | 0 |
| `WorkflowFragmentsSchema` | 7 | 3 | 0 |
| `fragment-resolver` | 6 | 6 | 0 |
| `fragmentsLookupSync` | 5 | 3 | 0 |
| `CheckpointFragmentBodySchema` | 4 | 2 | 0 |
| `fragments-index` | 2 | 2 | 0 |

The nine files are `src/loaders/fragment-resolver.ts`, `src/loaders/workflow-loader.ts`,
`src/schema/workflow.schema.ts`, `src/schema/activity.schema.ts`, `src/tools/workflow-tools.ts`,
`scripts/fragments-index.ts`, `scripts/check-fragments.ts`, `scripts/check-binding-fidelity.ts` and
`tests/fragment-resolver.test.ts`.

**The shape of the whole key is in the contrast between this group and group 1.** The mechanism's
code is 79 occurrences and 0% of it is outside the change. Its prose is 112 occurrences and 42% of
it is outside the change. A migration graded by a compiler and a green guard suite would finish with
the code half complete and the prose half untouched, and nothing in the plan would notice.

## Group 5 — the rule half, which is false already

Six literals, **18 occurrences at 12 distinct lines over 6 files. 16 occurrences at 11 lines over 5
files sit outside the change's file list.**

`fragments.rules` and a `{ ref }` entry in a rules slot both fail the load today. The schema half is
shown above: `WorkflowFragmentsSchema` is strict over one key, and every rules array is a string
array in both the Zod source and the generated JSON schema. The loader half is equally plain —
`materializeRuleEntries`, `resolveRuleFragment` and `RuleEntrySchema` do not exist anywhere in
`src/`, `scripts/` or `tests/`. The resolver's own header states the rule as it now stands: "Rules
are not shared this way: a rule two workflows both need is neither one's to own, so its home is the
conduct technique whose audience it binds and the bundle delivers it"
(`src/loaders/fragment-resolver.ts:9-10`).

| Key literal | Occ | Files | Outside |
|---|---|---|---|
| `{ ref }` | 5 | 4 | **4** |
| `fragments.rules` | 4 | 3 | **4** |
| `rule fragment` *(case-insensitive)* | 3 | 2 | **3** |
| `rules slots` *(case-insensitive)* | 3 | 2 | **3** |
| `shared rule texts` *(case-insensitive)* | 2 | 2 | **2** |
| `` rule `{ ref }` entries splice `` | 1 | 1 | 0 |

The eleven out-of-list lines:

- **`site/specs/resource-resolution.html:208`** — "**`fragments.rules`** — shared rule texts; rules
  slots accept either a rule string or `{ ref: "[workflow::]name" }`". A bullet describing a
  schema key that fails validation, beside a bullet describing one that does not, with nothing to
  tell them apart.
- **`site/specs/workflows.html:128`** — the workflow-file field list: "**Fragments** — shared rule
  texts and checkpoint bodies, imported by `{ ref }` from rules slots and checkpoint steps".
- **`site/specs/workflows.html:229`** — "Rule texts and checkpoint bodies reused at several sites
  are declared once under `fragments` … Rules slots and `kind:checkpoint` steps carry the ref".
- **`schemas/README.md:499`** — the workflow field table's `rules` row gives the type as
  `{ workflow?, activity?, universal?: (string | { ref })[] }` and adds "Entries are rule strings or
  `{ ref }` fragment imports". Two occurrences on one line, in the authoritative schema guide,
  contradicting `src/schema/workflow.schema.ts:30-32` directly.
- **`scripts/check-checkpoint-presentation.ts:23, 89, 150, 157, 158`** — a live guard. Its scope
  comment at `:23` names "`fragments.rules` in every `workflow.yaml`"; `:89` says a rules bucket is
  "a list whose entries are strings or `{ ref }` imports, which carry no text of their own"; `:150`
  says "A rule fragment is imported by `ref` into a bucket"; `:157` builds a finding site string
  `fragments.rules.${name}`; and `:158` labels the finding "rule fragment". The guard reads
  `def['fragments']['rules']` at `:148-151`. Because the fragments object is strict over
  `checkpoints`, a `workflow.yaml` carrying that key would fail the load before the guard saw it, so
  the branch is unreachable and the five statements describe a path that cannot be taken.
- **`tests/checkpoint-presentation-guard.test.ts:55, 61`** — the test that keeps the unreachable
  branch alive, asserting on a synthetic workflow object that never passes the schema: "flags a rule
  fragment, which binds the same agents once imported by ref".

Two in-list occurrences sit on one line and show the same drift inside the change's own files.
**`src/loaders/workflow-loader.ts:318`** opens the materialisation block with "Materialize fragment
references (#166 B10): rule `{ ref }` entries splice to their texts and checkpoint ref steps take
their fragment's body". The code beneath it collects checkpoint refs only
(`collectCheckpointRefs` at `:334`) and reads `workflow.fragments?.checkpoints` alone (`:331`).
Stage 5 opens this file, so this line would be caught. The five statements in the guard, the two in
its test and the four in the published prose would not.

**Neither ground-truth document carries this group.** It is added here, and it is the sweep's own
finding: a key-driven search of the mechanism's vocabulary surfaced a half of that mechanism that
was removed from the schema and the loader without the sweep that should have followed. It is the
defect `AP-129` describes, already realised once, on the same construct the migration is about to
retire again.

## Key two, totalled

| Group | Occ | Lines | Files | Outside the list |
|---|---|---|---|---|
| 1 — the gate-body vocabulary in prose | 112 | 67 | 24 | **47 occ / 22 lines / 10 files** |
| 2 — the seven dying rule names | 30 | 28 | 2 | 0 |
| 2b — the two surviving rule names | 10 | 10 | 2 | 0 |
| 3 — the author-routing remedies | 4 | 4 | 1 | 0 |
| 4 — the code identifiers | 79 | 66 | 9 | 0 |
| 5 — the rule half, false today | 18 | 12 | 6 | **16 occ / 11 lines / 5 files** |
| **Total** | **253** | **177** | **26** | **63 occ / 30 lines / 11 files** |

**The figure that matters: 63 occurrences at 30 distinct lines in 11 files sit outside any file a
delivery stage opens.** Sixteen of those 63 are false now; the other 47 become false the day stage 5
merges.

| File outside the change | Occurrences | Lines |
|---|---|---|
| `schemas/README.md` | 15 | 5 |
| `site/specs/resource-resolution.html` | 11 | 6 |
| `site/specs/workflows.html` | 9 | 4 |
| `site/specs/checkpoints.html` | 6 | 2 |
| `scripts/check-checkpoint-presentation.ts` | 6 | 5 |
| `site/design/request-lifecycle.html` | 4 | 2 |
| `workflows/workflow-design/resources/schema-construct-inventory.md` | 3 | 1 |
| `docs/checkpoint-model.md` | 3 | 1 |
| `site/api/schemas.html` | 3 | 1 |
| `tests/checkpoint-presentation-guard.test.ts` | 2 | 2 |
| `workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md` | 1 | 1 |
| **Total** | **63** | **30** |

Set aside by scope: `.engineering/artifacts/comprehension/` holds 4 occurrences of
`checkpoint fragment`, 2 of `fragments.rules`, 9 of `rule fragment`, 10 of `{ ref }`, 11 of
`fragment-resolver` and 5 of `fragment ref`, concentrated in
`when-merge-condition-not-met.md`, which carries "> 2026-08-02" at line 3 and whose own tables
already record the rule half as "the missing twin" for activity files (`:225`). The planning folder
holds 52 occurrences of `fragments.checkpoints` alone, exempt by `AP-129`'s own clause.

## Both keys, side by side

| | Key one, false now | Key two, false at stage 5 |
|---|---|---|
| Literals reported | 23 — the ground truth's 20 plus 3 added here | 44, all derived here |
| Occurrences in the live tree | 24 | 253 |
| Of those, false statements | 18 | 18 (group 5 only) |
| Distinct lines | 22 | 177 |
| Files | 12 | 26 |
| **Outside the change's file list** | **22 occ / 20 lines / 10 files** | **63 occ / 30 lines / 11 files** |

Three files carry out-of-list occurrences of both keys, and they are the three most authoritative
surfaces in the set: `schemas/README.md`, the schema guide; the corpus's construct-choice table at
`workflows/workflow-design/resources/schema-construct-inventory.md`; and the published workflow
specification at `site/specs/workflows.html`. **A single editing pass over those three files would
clear 10 of key one's 16 false statements and 27 of key two's 63 pending ones — 37 of the 79
out-of-list occurrences in three files.** That is the practical shape of the remedy, and it is
knowable now rather than after stage 5.

## Figures a record states that could not be reproduced

- **`stage-0-state.md` gives `loop_break` at 7 occurrences over 6 files.** I measure **6 over 5** in
  the live tree; the seventh is the planning artifact the ground truth itself flags, which this
  sweep sets aside by scope. The two agree once the bucket is stated.
- **`stage-0-state.md` gives the corpus at 1,003 steps and 54 loops.** At `a4a5d88b` I measure
  **1,004 steps and 53 loops** — 26 `forEach`, 14 `doWhile`, 13 `while`. One `forEach` has gone and
  one step has been added since `2b8b7215`. The `continueWhile` count of 27 and the zero counts for
  `condition` and `breakCondition` are unchanged, so nothing keyed on the partition moves.
- **`stage-0-state.md` states its counts as being over the whole repository** — excluding only
  `.git`, `node_modules`, `dist`, `.worktrees` and `.gitnexus` — **but its figures are live-tree
  figures.** Every one reproduces exactly against the live tree and every one is lower than the
  whole-repository count, because the planning folder holds the sweep's own siblings:
  `Continue condition (while/doWhile)` returns 1 in the live tree and 7 over 6 files
  repository-wide. The disagreement is which bucket is being reported rather than the count, so this
  document states the bucket on every row and treats the planning folder as exempt by name.
- **The proposal's stage-0 row states "19 loops re-keyed" and "Six `doWhile` bodies run"**
  (`README.md:768`). Neither is a phrasing this sweep searches for, and both are already settled by
  `stage-0-state.md`: 19 is exact for corpus commit `95f13fd1` and there are 27 repeat-until loops
  now, and the six named sites were three `doWhile` and three `while` when named.
- **The proposal states that `check-binding-fidelity`, `check-decision-order`,
  `check-review-mode-gating` and `check-checkpoint-entry` read "the materialised activity"**
  (`README.md:1008-1013`). None does, which `guard-obligations.md` measures and the proposal itself
  concedes at `README.md:1069`. This sweep counts all four as inside the change's file list anyway,
  since stage 4's criterion says they move; the effect is to make the out-of-list figures
  conservative rather than generous.
- **Nothing in the proposal states a figure for either key.** There is no count to reproduce or
  contradict, which is the gap this sweep fills: `AP-129`'s Fix asks for the occurrence count in the
  change's own manifest, and until now the manifest had none.

## Re-taking every figure

```bash
# what holds: the closed loop object, and the three step kinds that take an entry gate
sed -n '80,86p;144,172p' src/schema/activity.schema.ts

# the corpus loop population, and breakCondition at zero sites
grep -rn "breakCondition" --include=*.yaml workflows/ | wc -l
npx tsx scripts/check-loop-shape.ts --json

# the mechanism as it stands
grep -rn "fragments" --include=*.yaml --include=*.yml workflows/
grep -rn "ref:" --include=*.yaml workflows/*/activities/
sed -n '15,20p;70,73p' workflows/work-package/workflow.yaml
npx tsx scripts/check-fragments.ts

# the rule half: strict over one key, string arrays, and no resolver
sed -n '28,43p' src/schema/workflow.schema.ts
grep -rn "materializeRuleEntries\|resolveRuleFragment\|RuleEntrySchema" src/ scripts/ tests/
sed -n '318,334p' src/loaders/workflow-loader.ts

# which files the proposal's stages name
grep -rn "schemas/README\|checkpoint-model\|schema-construct-inventory\|anti-patterns" \
  .engineering/artifacts/planning/2026-09-03-routines/*.md
```

The loop census, the per-key occurrence counts and the in-list/out-of-list split were taken by three
throwaway scripts whose rules are stated in full above, which is what makes each figure
re-derivable. The census walks every node carrying a string `kind` under `workflows/*/workflow.yaml`
and `workflows/*/activities/**/*.yaml` and records each loop's key set. The key counter composes the
backtick as `chr(96)`, counts literal substring occurrences per line over the 3,513 readable text
files, and buckets each hit by path prefix. The split tests each hit's file against the 45-path list
derived above, with the two named substring collisions excluded and the guard's fixture tree counted
with the guard it feeds.
