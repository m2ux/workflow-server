# Twenty-four sentences describe a loop field that fails the load, and fifty-eight describe a mechanism a migration deletes

A sweep of the routines proposal at [2026-09-03-routines/README.md](../../2026-09-03-routines/README.md).
Companions: [ground-truth/stage-0-state.md](../ground-truth/stage-0-state.md),
[ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md),
[ground-truth/guard-obligations.md](../ground-truth/guard-obligations.md).

Server tooling at `9ca71c19` on `main`; corpus at `2b8b7215` on the `workflows` branch; planning
artifacts on the `engineering` branch. Every count below was taken from the repository. Where a
figure disagrees with a ground-truth document or with the proposal, this document gives its own and
says so.

## What this sweep does, and why it is not driven by a file list

A change that alters a behaviour usually updates the statements it happens to touch. The statements
it does not touch keep asserting the old behaviour, and a reader has no way to tell a stale sentence
from a current one — a stale claim reads as current fact. The corpus names this defect itself:
`AP-129 stale-restatement-after-change`
(`workflows/workflow-design/resources/anti-patterns.md:1703-1713`), whose Detect says to "take the
pre-change phrasing as the search key and sweep the whole definition tree", and states the test
plainly: "occurrence count against the tree, not against the change's file list: a manifest naming
one file for a claim that appears in three is the same defect". Its Fix asks for the count to be
recorded in the change's file manifest so the sweep is auditable
(`anti-patterns.md:1713`).

So this sweep starts from phrasings, searches the whole tree for each one, counts every occurrence,
and only then asks which occurrences sit outside the files the change itself would touch. That last
figure is the one that matters, because each occurrence outside the list is a statement that
survives the change and goes on reading as current fact.

Two keys, measured separately.

- **Key one is stale now.** Stage 0 of the nine-stage delivery plan has landed: a loop's
  continuation test lives in `continueWhile`, `condition` is not a field of a loop step, and the
  early exit `breakCondition` belongs to item iteration alone. Twenty-one phrasings describe the
  arrangement that no longer holds.
- **Key two is falsified when stage 5 lands.** Nineteen phrasings describe how a shared gate body is
  expressed today and route an author to the mechanism stage 5 retires. None is a defect now. Their
  value is that the count exists before the work starts.

Nothing in the routines design is built. `src/schema/activity.schema.ts:167-171` declares
`StepSchema` over four members — `TechniqueStepSchema`, `ActionStepSchema`, `CheckpointStepSchema`,
`LoopStepSchema` — there is no `routines/` directory in any workflow, and no materialisation pass.
Stage 0 alone stands behind anything.

## Where each count came from

Searches ran over the whole repository with `.git`, `node_modules`, `dist`, `.worktrees`, `.idea`
and `.gitnexus` excluded, and `package-lock.json` skipped. `.gitnexus` is a generated code-
intelligence index, not a source of prose.

Most of these phrasings are code tokens that appear inside backticks in markdown, and a grep pattern
containing a backtick cannot be issued under this repository's shell rules. **Every count was taken
by a Python script that composes the backtick as `chr(96)` and counts literal substring occurrences
per line.** Two counting rules were used and each key says which:

- **Case-sensitive literal substring**, for eighteen of the twenty-one key-one literals and eighteen
  of the nineteen key-two literals.
- **Case-insensitive literal substring**, for the single phrasing `checkpoint fragment`, which
  appears as a heading (`Shared checkpoint fragments`), as a table cell (`**Checkpoint fragment**`)
  and in running prose. Marked in the table.

A count taken with the wrong pattern is worse than no count, so three pattern artefacts are recorded
rather than hidden:

- `unresolved-ref` matches inside the word "unresolved-reference" at
  `examples/cursor-workspace/.claude/skills/workflow-canon/SKILL.md:97`, which has nothing to do
  with the fragment mechanism. **That occurrence is excluded from every figure below**, taking the
  key from 17 occurrences to 16.
- `fragments:` matches a TypeScript variable declaration at `scripts/fragments-index.ts:17`
  (`let fragments: WorkflowFragments | undefined;`) and the guard's own stdout prefix at
  `scripts/check-fragments.ts:280,283`. Both are inside the change's file list, so they do not
  distort the out-of-list figure, but the key's raw count is not a count of YAML declarations.
- `fragment-resolver` matches seven GitHub blob permalinks pinned to a commit SHA in the
  comprehension artifacts. A permalink names a file at a revision where it existed, which is honest
  provenance rather than a stale claim, and those seven are called out where they land.

Three surfaces a sweeper would expect to hit are genuinely out of scope, and it is cheaper to say so
than to leave a later reader re-checking. `grammar/activity.ebnf:74-80` and
`constraints/activity.als:78-84` describe a `loops:` array with `type: forEach` and a `flow:`
reference — a different activity language, not a restatement of the current schema. The document
that owns them says so in its second paragraph: "The server implements a different shape, so nothing
on this page describes a file the loader accepts" (`docs/orchestra-specification.md:3`). And
`grammar/activity.ebnf`'s six occurrences of the word "fragment" are the grammar nonterminal
`FlowFragment` (`grammar/activity.ebnf:64-69,100`), unrelated to the shared-body mechanism.

### Two scope decisions the ground truth left to this sweep

`AP-129`'s Do-not-flag clause exempts "planning-folder artifacts that record the before state
deliberately" (`anti-patterns.md:1711`). **`.engineering/artifacts/planning/**` is therefore out of
scope**, and every count below separates the planning total from the live one. That exemption is
load-bearing for the arithmetic: of key one's 64 occurrences, 36 are in planning records and 30 of
those 36 are in this sweep's own ground-truth documents, which exist to enumerate the keys.

`.engineering/artifacts/comprehension/**` is a different case, and the ground truth listed it with
the caveat attached for this sweep to rule on. **The ruling is that it is in scope, and its remedy
is a restamp rather than an in-place edit.** Three findings decide it:

1. The corpus writes there. `workflows/work-package/activities/15-codebase-comprehension.yaml:60`
   binds `comprehension_dir` to `{host_repo_path}/.engineering/artifacts/comprehension`, and the
   activity's own message at `:78` says the artifact is "recorded for the next work package on this
   area". It is a designed read surface, not a private note.
2. Every affected file carries a date and every date precedes stage 0. Four say
   "Last updated: 2026-06-18" (`json-schemas.md:6`, `orchestration.md:3`,
   `work-package-workflow-content.md:3`, `zod-schemas.md:3`) and one is stamped 2026-08-01
   (`when-step-gates.md:3`). Stage 0's re-key landed 2026-09-04.
3. The sentences are nonetheless present-tense assertions about the schema. A reader who checks the
   date learns the tree has moved; a reader who reads the field list learns a field name that fails
   the load.

So the correct remedy is to re-derive the snapshot and re-date it, which is why these occurrences
are counted and named but not folded in with the edit-in-place sites.

## The file lists to subtract

### Stage 0's list, measured from the commits that landed it

Stage 0 is described at [README.md:768](../../2026-09-03-routines/README.md) as adding
`continueWhile`, removing `condition` from the loop step, scoping `breakCondition` to the `forEach`
early exit, re-keying 19 loops and adding a loop-shape guard. Three commits carry it, and their file
lists are the change's file list.

`git show --numstat 3a36b0db` ("Give a loop's continuation test its own field, and let silence
agree", 2026-09-04) touches **16 files**: `docs/state-management-model.md`, `package.json`,
`schemas/activity.schema.json`, `schemas/workflow.schema.json`, `scripts/check-loop-shape.ts`,
`scripts/guards.ts`, `site/api/schemas.html`, `src/schema/activity.schema.ts`,
`src/schema/variable.schema.ts`, `src/schema/workflow.schema.ts`, `src/tools/workflow-tools.ts`,
`src/utils/activity-variables.ts`, `src/utils/validation.ts`, `tests/batch-loop-walk.test.ts`,
`tests/e2e/walker.ts`, `tests/loop-shape-guard.test.ts`.

`git show --numstat 4c288fe9` ("Keep an early exit to the loop kind that has somewhere to put it")
touches three of the same files and adds none.

`git -C workflows show --numstat 95f13fd1` ("Keep a repeat-until loop's continuation test under its
own key") touches **18 corpus activity files**, one `condition:` becoming `continueWhile:` in each
except `work-package/activities/13-submit-for-review.yaml`, which carries two.

**Stage 0's file list is 34 files.** Every occurrence below is judged inside or outside it.

### Stage 5's list, read from the acceptance criteria and the mechanism's own surface

The proposal's stage-5 criteria (README:880-892) name exactly four artefacts: the four converged
copies reference one routine; "the `fragments` block is gone from `work-package/workflow.yaml`";
seven fragment rules are deleted; and `duplicate-checkpoint` keeps its rule with its remedy naming a
routine. **No documentation file appears in the criteria**, which is the whole reason for this half
of the sweep.

Read generously, so the out-of-list figure is conservative, the list is the criteria plus every file
the mechanism's code, schema, generated-schema, test and baseline surface occupies:

| Surface | Files |
|---|---|
| Corpus | `work-package/workflow.yaml`; `work-package/activities/04-research.yaml`, `05-implementation-analysis.yaml`, `07-assumptions-review.yaml`, `08-implement.yaml`; the new `work-package/routines/*.yaml` |
| Schema | `src/schema/workflow.schema.ts`, `src/schema/activity.schema.ts` |
| Loader and delivery | `src/loaders/fragment-resolver.ts`, `src/loaders/workflow-loader.ts`, `src/tools/workflow-tools.ts` |
| Guards | `scripts/check-fragments.ts`, `scripts/fragments-index.ts`, `scripts/check-binding-fidelity.ts`, `scripts/guards.ts`, `package.json` |
| Generated schemas | `schemas/workflow.schema.json`, `schemas/activity.schema.json` |
| Tests and baselines | `tests/fragment-resolver.test.ts`, `tests/fragments-guard.test.ts`, `tests/fixtures/fragments/**`, `tests/e2e/option-coverage.json`, `tests/e2e/__snapshots__/snapshot.test.ts.snap`, `tests/e2e/__snapshots__/corpus-sha.json`, `scripts/fixtures/token-benchmark-baseline.json` |

## Key one: the loop step as five surfaces still describe it

What holds, from the schema. `src/schema/activity.schema.ts:152-164` declares `LoopStepSchema` as a
closed object — the `.strict()` at `:164` makes a field outside the set a load error rather than a
warning — and the comment immediately above says the rule directly: "A loop carries no `condition`,
so its entry gate is `when` — uniformly with every other step kind"
(`src/schema/activity.schema.ts:151`). The continuation test is `continueWhile`, described at `:157`
as "the continuation test of a while/doWhile loop: the body runs again while this holds". The early
exit is `breakCondition`, described at `:160` as "early exit from item iteration … A repeat-until
loop states its stopping condition in `continueWhile` instead", and refused on a `while` or
`doWhile` by the guard rule `repeat-loop-with-break` (`scripts/check-loop-shape.ts:96-104`).

Twenty-one literals, each a phrasing that describes the arrangement the schema no longer admits.

| Key | Literal | Occ | Files | Live | Outside stage 0's list |
|---|---|---|---|---|---|
| A1 | `Continue condition (while/doWhile)` | 2 | 2 | 1 | **1** |
| A2 | `` `.condition`, `.breakCondition` `` | 3 | 2 | 1 | **1** |
| A3 | `loop continuations` | 3 | 2 | 1 | **1** |
| A4 | `condition/breakCondition?` | 3 | 2 | 1 | **1** |
| B1 | `Early exit condition (agent-evaluated each iteration)` | 2 | 2 | 1 | **1** |
| B2 | `the loop-kind step.breakCondition` | 2 | 2 | 1 | **1** |
| B3 | `loop_break` | 12 | 7 | 6 | **4** |
| C1 | `gained its only site` | 3 | 2 | 1 | 0 |
| C2 | `The field's one live site` | 3 | 2 | 1 | 0 |
| D1 | `A nested step list with an exit condition` | 2 | 2 | 1 | **1** |
| D2 | `until the condition is satisfied or the loop declares completion` | 2 | 2 | 1 | **1** |
| D3 | `repeats nested steps until a condition clears` | 2 | 2 | 1 | **1** |
| D4 | `until a condition is satisfied or the loop declares completion` | 2 | 2 | 1 | **1** |
| D5 | `iterates over collections or while conditions hold` | 2 | 2 | 1 | **1** |
| E1 | `` `loopType` semantics, `variable` / `over`, `breakCondition`, `maxIterations` `` | 1 | 1 | 1 | **1** |
| E2 | `loop: loopType/variable/over/breakCondition/maxIterations/steps` | 2 | 2 | 1 | **1** |
| E3 | `` `variable` / `over` / `breakCondition` / `maxIterations` `` | 4 | 4 | 2 | **2** |
| E4 | `` `loopType`, `over`, nested `steps[]` `` | 3 | 3 | 1 | **1** |
| E5 | `` gated by `when` or `condition` `` | 7 | 6 | 2 | **2** |
| E6 | `` a `when` or `condition` naming it `` | 3 | 2 | 1 | **1** |
| **E7** | `` rule strings or `{ ref }` fragment imports `` | 1 | 1 | 1 | **1** |

**E7 is a key this sweep added**, and it is stated as an addition because the ground-truth key list
does not carry it. It came out of key two's vocabulary work rather than key one's: the rule half of
the shared-body mechanism has already retired, and one restatement of it survives in the same
document that carries five of key one's other occurrences. Its evidence is below under
[the half that already retired](#the-half-that-already-retired-and-what-it-predicts).

**Key one union: 64 occurrences over 23 files.** Thirty-six are in the planning folder and exempt,
30 of those in this sweep's own ground truth and 6 in six earlier planning records. Twenty-eight
occurrences are live, over 17 files. **Four sit inside stage 0's 34-file list. Twenty-four sit
outside it, on 22 distinct lines in 14 files.**

Every key-one figure the ground truth states reproduces exactly, once its own restatements are
subtracted. That is worth recording because the ground truth was written by a different agent from a
different starting point: A1 through E6 each land at the file and line it names, and its
`loop_break` figure of 7 is my 12 minus the 5 occurrences inside the document itself.

### The four occurrences inside stage 0's own files

These are not part of the out-of-list manifest, but they are still false, so they are named.

`scripts/check-loop-shape.ts:17` — the guard's header says `breakCondition` "gained its only site
two days earlier on a branch that had not merged". `tests/loop-shape-guard.test.ts:86` — "The
field's one live site: the task cycle stops once a symbol's provenance is unaccounted for." Both
assert a site count of one. The corpus count is zero: no `.yaml` under `workflows/` carries the
field, and the site both sentences name was removed by corpus commit `efcc3a97` and replaced by a
nested `doWhile` at `workflows/work-package/activities/08-implement.yaml:119-127`. The guard's
*argument* survives the correction — a field with one job is worth keeping whether or not it is
exercised — but the sentence carrying the argument is false.

`site/api/schemas.html:142` and `:201` carry `loop_break` in the history-event enumeration. Both sit
inside the block opened at `site/api/schemas.html:74` (`<!-- BEGIN GENERATED — edit
scripts/generate-site-data.ts, then run npm run build:site -->`) and closed at `:302`, so they are
generated from the Zod source and `tests/site.test.ts` fails when the committed page drifts from a
fresh regeneration (`scripts/generate-site-data.ts:8`). Their remedy is the Zod description, not the
page.

### The twenty-four occurrences outside stage 0's file list

Grouped by the surface that owns them.

**`schemas/README.md` — six occurrences, and it is the authoritative schema guide.** No generator
writes this file; `scripts/generate-schemas.ts` writes the six JSON schemas beside it, and nothing
writes the README.

- `:383` — the loop-step field table's row reads `` | `condition` | Condition | Continue condition
  (while/doWhile) | ``. The field named is the one the closed object refuses; the field carrying the
  test is absent from the table entirely (`:375-386`).
- `:385` — `` | `breakCondition` | Condition | Early exit condition (agent-evaluated each iteration)
  | ``. The parenthesis is accurate about *when* the agent evaluates it and wrong about *what* it
  belongs to: the field is scoped to item iteration and refused on a repeat-until loop.
- `:34` — the construct table's Loop-step row gives the agent-interpreted set as "`loopType`
  semantics, `variable` / `over`, `breakCondition`, `maxIterations` — iteration is executed and
  bounded entirely by the agent". This is the reader's map of which loop fields the engine enforces
  and which the agent interprets, and the field the agent actually interprets to decide whether the
  body runs again is missing from it.
- `:499` — "Entries are rule strings or `{ ref }` fragment imports". The rules schema declares three
  buckets of plain strings (`src/schema/workflow.schema.ts:29-32`); no rule entry can be a
  reference. Key E7.
- `:979` — the history-event list carries `loop_break`. No code path emits it; see the note on the
  runtime vocabulary below.
- `:373` — "A `kind: loop` step is a compound step that iterates over collections or while
  conditions hold". **This one is accurate and I disagree with the ground truth's grouping of it.**
  The ground truth files it under "a loop described as deciding each pass anywhere other than
  `continueWhile`" (`stage-0-state.md:456`), where the four site strings do invert the polarity;
  "while conditions hold" is the correct polarity and the sentence names no field, so it asserts
  nothing false. Its defect is a different one and out of this sweep's remit: it narrates a change
  in a sentence meant to persist — "(replacing the old separate `loops[]` array)".

**Hand-authored site prose — four occurrences on three pages.** Only navigation, breadcrumbs and
pagination are generated on these pages; each occurrence sits outside every `BEGIN GENERATED`
marker, verified by marker position. `check-site-links` polices links and element ids, not prose, so
nothing catches these.

- `site/specs/workflows.html:339` — the step-kind table's loop row: "A nested step list with an exit
  condition" and "Repeat the nested steps until the condition is satisfied or the loop declares
  completion". Two keys on one line. The polarity is inverted, and "the loop declares completion"
  has no referent anywhere in the schema — no field, no action and no event lets a loop declare its
  own completion. The same page's diagram gets it right at `:324-325`: "repeat nested steps / while
  a condition holds".
- `site/guide/definitions.html:86` — "A step that repeats nested steps until a condition clears".
- `site/guide/definitions.html:138` — "repeats a nested list of steps until a condition is satisfied
  or the loop declares completion".

**Corpus canon — four occurrences on two files, both on the `workflows` branch.**

- `workflows/workflow-design/resources/schema-construct-inventory.md:47` gives the loop step's field
  list as "`.id`, `.loopType` (forEach/while/doWhile), `.variable`, `.over`, `.condition`,
  `.breakCondition`, `.maxIterations`, optional `.name`". This is the table an author consults to
  choose a construct, and it names one field that fails the load and omits the one that carries the
  test. Of the twenty-four, this is the occurrence most likely to produce a broken definition.
- `workflows/workflow-design/resources/anti-patterns.md:1697` carries two keys on one line.
  `AP-128 unproduced-value-read`'s Detect scans "each step gated by `when` or `condition`" and
  traces readers that are "an input binding, a `when` or `condition` naming it, a `{token}`
  interpolation". Before stage 0 a loop's continuation test *was* `condition`, so the detect reached
  it; it no longer does. A variable produced solely behind a gate and read by a loop's continuation
  test falls outside the detect as written, in both the producer and the reader half.
- `workflows/workflow-design/resources/anti-patterns.md:204` — `AP-10 loop-not-prose`'s Detect names
  "`kind: loop` (`loopType`, `over`, nested `steps[]`)". **I judge this one not stale, and say so
  against the ground truth's key list.** Those are three real fields, and they were the item-loop
  field set before stage 0 as well, so nothing stage 0 did falsified the sentence. The detect has a
  coverage gap — prose saying "do until done", the phrase its own sibling table uses for a
  repeat-until loop (`schema-construct-inventory.md:47`), is not reachable by the field names it
  lists — but that gap predates the change and belongs to a different sweep.

**`docs/` — one occurrence.** `docs/workflow-fidelity.md:143` states which manifest omissions are
accepted: "a step gated by `when` or `condition` may be omitted from the manifest — the agent
evaluated the gate and skipped the step". The validator it documents disagrees, and says so in its
own comment: "A loop's continuation test decides the same thing for its body, so a loop carrying one
is gated too" (`src/utils/validation.ts:119-120`), implemented at `:121-123` as
`s.kind === 'loop' ? s.continueWhile === undefined : s.condition === undefined`. A `while` or
`doWhile` loop carrying `continueWhile` and no `when` may be omitted from a manifest; the document
does not say so.

**The runtime vocabulary for a break — four occurrences.** `src/schema/state.schema.ts:13` declares
`loop_break` among four loop history-event types; `schemas/state.schema.json:163` and
`schemas/session-file.schema.json:196` are its generated reflections; `schemas/README.md:979` lists
it as an event the session history records. No code path emits any of the four, and none appends to
`activeLoops` (`src/schema/state.schema.ts:167`) beyond initialising it to `[]`. **I judge the three
schema declarations not stale** — a declared event type with no writer is a construct with no
subject, not a false claim, and iteration being the agent's job makes it consistent with the design.
The README line at `:979` is the one that reads as a claim about what the server records, and it is
the occurrence a manifest should carry.

**Comprehension snapshots — six occurrences on five files, on the `engineering` branch.**

- `.engineering/artifacts/comprehension/when-step-gates.md:32` — structured `condition` is "retained
  for OR/nested OR, exists-shaped ops, checkpoint `condition_not_met`, and loop continuations". The
  last of the four is gone.
- `.engineering/artifacts/comprehension/work-package-workflow-content.md:166` — the loop step's
  shape as "`loopType: forEach|while|doWhile, condition/breakCondition?, maxIterations?`".
- `.engineering/artifacts/comprehension/json-schemas.md:54` — "the loop-kind step.breakCondition",
  in an enumeration of where a `Condition` appears; correct that it appears, silent that a
  repeat-until loop is refused it.
- `.engineering/artifacts/comprehension/orchestration.md:132` — the `Step` row lists per-kind fields
  as "loop: loopType/variable/over/breakCondition/maxIterations/steps".
- `.engineering/artifacts/comprehension/orchestration.md:156` and `zod-schemas.md:71` — the same
  omission in the shorter form, "`variable` / `over` / `breakCondition` / `maxIterations`".

### What the twenty-four cost to fix, by branch

The out-of-list occurrences do not live in one repository, and this decides how many pull requests
the correction takes.

| Branch | Occurrences | Files | Distinct lines | Which |
|---|---|---|---|---|
| `main` | 14 | 7 | 13 | `schemas/README.md` ×6, `site/guide/definitions.html` ×2, `site/specs/workflows.html` ×2 on one line, `docs/workflow-fidelity.md`, `src/schema/state.schema.ts`, `schemas/state.schema.json`, `schemas/session-file.schema.json` |
| `workflows` | 4 | 2 | 3 | `schema-construct-inventory.md:47`, `anti-patterns.md:204`, `anti-patterns.md:1697` ×2 |
| `engineering` | 6 | 5 | 6 | the five comprehension snapshots |
| **Total** | **24** | **14** | **22** | |

## Key two: the manifest stage 5 has to carry

What holds today. A gate body used at several sites is declared once under `fragments.checkpoints`
in a workflow's `workflow.yaml` and imported by `ref` on a `kind: checkpoint` step. `ref` is a field
on `CheckpointStepSchema` and on nothing else (`src/schema/activity.schema.ts:134`), mutually
exclusive with the body fields. `WorkflowFragmentsSchema` is a `.strict()` object with one key,
`checkpoints` (`src/schema/workflow.schema.ts:40-42`). The corpus holds one declaration, at
`workflows/work-package/workflow.yaml:15-71`, holding two bodies, referenced from eight sites in
four `work-package` activity files. Nine guard rules police the mechanism
(`scripts/check-fragments.ts:56-65`), of which stage 5 deletes seven.

The nineteen literals below are the mechanism's own vocabulary, derived from
[fragment-mechanism.md](../ground-truth/fragment-mechanism.md), from the schema descriptions, and
from the guard's rule names. They fall into three groups: the declaration and reference vocabulary
that describes how a shared gate body is expressed; the rule names, which are the guard's own
identifiers; and the routing phrasings that send an author to the mechanism.

| Key | Literal | Occ | Files | Live | Outside stage 5's list |
|---|---|---|---|---|---|
| F1 | `fragments.checkpoints` | 45 | 34 | 16 | **6** |
| F2 | `Shared checkpoint bodies` | 7 | 5 | 6 | **3** |
| F3 | `checkpoint fragment` *(case-insensitive)* | 60 | 48 | 21 | **12** |
| F4 | `extract a fragment` | 4 | 3 | 2 | 0 |
| F5 | `check:fragments` | 23 | 21 | 9 | **4** |
| F6 | `inline-duplicate-of-fragment` | 10 | 7 | 3 | 0 |
| F7 | `unused-fragment` | 18 | 11 | 7 | 0 |
| F8 | `ref-body-conflict` | 10 | 6 | 5 | 0 |
| F9 | `ref-opens-step` | 11 | 7 | 4 | 0 |
| F10 | `malformed-ref` | 9 | 6 | 3 | 0 |
| F11 | `unresolved-ref` | 16 | 12 | 5 | 0 |
| F12 | `undeclared-effect-variable` | 16 | 11 | 4 | 0 |
| F13 | `duplicate-checkpoint` | 29 | 23 | 4 | 0 |
| F14 | `[workflow::]name` | 29 | 24 | 15 | **9** |
| F15 | `fragments.rules` | 19 | 17 | 6 | **6** |
| F16 | `` imported by `ref` `` | 7 | 7 | 6 | **2** |
| F17 | `fragments:` | 27 | 21 | 7 | **1** |
| F18 | `check-fragments.ts` | 43 | 29 | 7 | **4** |
| F19 | `fragment-resolver` | 69 | 40 | 17 | **11** |

**Key two union: 452 occurrences over 133 files.** Three hundred and five are in the planning
folder and exempt — 40 of those in this sweep's own ground-truth documents. One hundred and
forty-seven occurrences are live, over 32 files. **Eighty-nine sit inside stage 5's file list. Fifty-
eight sit outside it, on 40 distinct lines in 16 files.**

**The eight rule-name keys, F6 through F13, have zero out-of-list occurrences.** Every live mention
of `malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `unused-fragment`,
`inline-duplicate-of-fragment`, `undeclared-effect-variable` and `duplicate-checkpoint` is in
`scripts/check-fragments.ts`, `tests/fragments-guard.test.ts` or a fixture under
`tests/fixtures/fragments/`. That is the good half of the news, and it is structural rather than
lucky: a guard rule name lives with the guard, so deleting the rule deletes the name. The keys with
out-of-list weight are the ones describing the *construct* — the declaration path, the reference
syntax, the mechanism's own name — because those are what documentation restates.

### The fifty-eight occurrences outside stage 5's file list

**Corpus canon, on the `workflows` branch — four occurrences on two lines.**

- `workflows/workflow-design/resources/schema-construct-inventory.md:68` carries F1, F3 and F14 on
  one line. It is the routing site: the informal pattern "Several activities ask the user the same
  question" maps to **Checkpoint fragment**, and the row explains that
  "`fragments.checkpoints.<name>` holds the gate body … and a `kind: checkpoint` step reaches it by
  `ref: [workflow::]name`". When the mechanism retires, this row sends an author to a construct the
  schema refuses. The same table has no row for several activities running the same *sequence* of
  steps, which is the row a routine claims.
- `workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:29` — an
  audit technique's Protocol enumerates the guards it runs, including "`check-fragments.ts` — every
  fragment reference resolves, every fragment is used, and no inline body duplicates a fragment or
  another site". An auditor following this line after stage 5 runs a script with seven fewer rules,
  or none.

**`docs/checkpoint-model.md:116` — two occurrences on one line.** The how-to paragraph: "A
checkpoint used at several sites is declared once as a fragment under `fragments.checkpoints` in the
owning workflow's `workflow.yaml`, and each site imports it with `ref`. … The `check:fragments`
guard rejects an inline body that duplicates a fragment." Four sentences of instruction for a
mechanism that would no longer exist.

**`schemas/README.md` — ten occurrences on four lines.** `:279` and `:500` both describe the
`fragments` field as "Shared checkpoint bodies … imported by `ref` (`[workflow::]name`)" — the same
claim in two tables in one file, which is itself the shape `AP-129` measures. `:335` is the
authoring instruction for the by-reference form. `:341` is the `ref` field's row.

**Hand-authored site prose — sixteen occurrences on eleven lines across five pages.** All outside
every `BEGIN GENERATED` marker except the one noted.

- `site/specs/checkpoints.html:195` is the section heading "Shared checkpoint fragments"; `:196` is
  the section body, carrying F1, F3, F5 and F14 on one line. This is a whole documented section of
  the published specification whose subject stage 5 deletes.
- `site/specs/resource-resolution.html:209` describes `fragments.checkpoints` as a resolution scope;
  `:211` describes the resolution order and the guard; `:203` states that a borrowed activity's
  checkpoint-fragment refs resolve against the source workflow; `:208` describes `fragments.rules`,
  which is already gone.
- `site/specs/workflows.html:229` — "Rule texts and checkpoint bodies reused at several sites are
  declared once under `fragments` in `workflow.yaml` and imported by `{ ref: "[workflow::]name" }`.
  Rules slots and `kind:checkpoint` steps carry the ref". Half of that sentence is already false.
  `:226` states that fragment scoping follows the authoring workflow for a borrowed activity.
- `site/design/request-lifecycle.html:124` — "Rule and checkpoint fragment refs are materialized at
  load"; `:127` — `get_activity` "materializes checkpoint fragment refs in the activity YAML". Both
  describe a load-time stage in the request lifecycle.
- `site/api/schemas.html:264` carries F2 and F14, and is **inside** the generated block
  (`:74-302`). Its remedy is the Zod `describe()` at `src/schema/workflow.schema.ts:171`, and
  `tests/site.test.ts` will force the regeneration. It is listed for completeness rather than as
  work.

**Two guards outside the change's list carry the mechanism in their own reasoning — five
occurrences.**

- `scripts/check-set-action-values.ts:173` — the comment justifying why the guard opens
  `workflow.yaml` at all: "a workflow root carries checkpoint fragments, and a `setVariable` there
  …". Delete the fragments block and the guard's stated reason for reading that file goes with it.
  [guard-obligations.md](../ground-truth/guard-obligations.md) places this guard in class (a), the
  second-definition-directory class, and does not place it in the fragments retirement; on this
  measurement it belongs to both.
- `scripts/check-checkpoint-presentation.ts:23`, `:150` and `:157` describe and implement a scan of
  `fragments.rules`. That construct is already gone; see below.

**Tests outside the list — three occurrences.** `tests/branch-as-step-guard.test.ts:68` builds a
fixture whose text is the audit technique's guard enumeration, including the
`check-fragments.ts` line, so the corpus canon's stale line has a copy in a `main`-branch test
fixture. `tests/checkpoint-presentation-guard.test.ts:58` authors a fixture declaring
`fragments:\n  rules:` and `:61` asserts a finding site of `wf/workflow.yaml fragments.rules.shared`
— a test exercising a shape the schema refuses.

**Comprehension snapshots, on the `engineering` branch — nineteen occurrences on fifteen lines
across three files.** Seven of the nineteen are GitHub blob permalinks pinned to a commit SHA
(`technique-reference-resolution.md:57` twice, `:137`, `:155`; `activity-technique-binding.md:45`,
`:46` twice) and are honest provenance rather than stale claims. The remaining twelve are
assertions: `activity-technique-binding.md:66` — "A fragment is named content declared once at
workflow scope and spliced in by reference … There are exactly two kinds, rule text and checkpoint
bodies"; `when-merge-condition-not-met.md:225` — "activity files **do** support `ref:` on
`kind: checkpoint` with full materialize"; and ten more naming `materializeRuleEntries`,
`resolveRuleFragment` and the guard's scope.

### What the fifty-eight cost, by branch

| Branch | Occurrences | Files | Distinct lines |
|---|---|---|---|
| `main` | 35 | 11 | 23 |
| `workflows` | 4 | 2 | 2 |
| `engineering` | 19 | 3 | 15 |
| **Total** | **58** | **16** | **40** |

The branch split is the operational finding. [guard-obligations.md](../ground-truth/guard-obligations.md)
establishes that a corpus pull request into `workflows` runs `npm run check:all` against `main`'s
tooling and nothing else, and that a server pull request into `main` is graded against the gitlink's
un-migrated corpus. So stage 5's own three-pull-request ordering — server first, corpus second,
submodule bump third — has to carry 35 restatement edits in the first, 4 in the second, and 19 in a
fourth pull request against a third branch that no continuous-integration job grades at all.

## The half that already retired, and what it predicts

The shared-body mechanism had two halves. `fragments.rules` held shared rule text, and
`fragments.checkpoints` holds shared gate bodies. **The rule half is gone.** The schema declares the
three rules buckets as arrays of plain strings (`src/schema/workflow.schema.ts:29-32`);
`WorkflowFragmentsSchema` is `.strict()` over the single key `checkpoints` (`:40-42`), so a
`fragments.rules` key is a load error; `resolveRuleFragment`, `materializeRuleEntries` and
`RuleEntrySchema` appear nowhere in `src/` or `scripts/`; and no `workflow.yaml` in the corpus
carries a `ref:` at all — `grep -rIn "ref:" workflows/*/workflow.yaml | wc -l` returns 0. The
decision is recorded at
`.engineering/artifacts/planning/2026-08-27-rule-homes-and-shared-bodies/README.md:81`: "So
`fragments.rules` is removed from the schema rather than left unused."

**Nine statements outside the comprehension folder still describe it as live**, on the branches
shown:

| Occurrence | What it says | Branch |
|---|---|---|
| `schemas/README.md:499` | rules entries "are rule strings or `{ ref }` fragment imports" | `main` |
| `site/specs/resource-resolution.html:208` | "`fragments.rules` — shared rule texts; rules slots accept either a rule string or `{ ref: "[workflow::]name" }`" | `main` |
| `site/specs/workflows.html:229` | "Rules slots and `kind:checkpoint` steps carry the ref" | `main` |
| `site/design/request-lifecycle.html:124` | "Rule and checkpoint fragment refs are materialized at load" | `main` |
| `scripts/check-checkpoint-presentation.ts:23` | the guard's declared scope includes "`fragments.rules` in every workflow.yaml" | `main` |
| `scripts/check-checkpoint-presentation.ts:150` | "A rule fragment is imported by `ref` into a bucket, so its text binds the same agents" | `main` |
| `scripts/check-checkpoint-presentation.ts:157` | a finding site label `fragments.rules.<name>` | `main` |
| `tests/checkpoint-presentation-guard.test.ts:58` | a fixture declaring `fragments:` → `rules:` | `main` |
| `tests/checkpoint-presentation-guard.test.ts:61` | asserts that site label | `main` |

Six more sit in the comprehension snapshots (`when-merge-condition-not-met.md:13`, `:14`, `:18`,
`:58`, `:90`, `:150`, `:225`, `:232`; `technique-reference-resolution.md:57`;
`activity-technique-binding.md:46`, `:66`).

Three of the nine are not prose but a live code path.
`scripts/check-checkpoint-presentation.ts:148-163` reads `def?.['fragments']?.['rules']` and walks
its entries, sixteen lines of guard that can never fire: the schema refuses the key, so no corpus
file can carry it, and the guard parses raw YAML so it neither fails nor reports. The guard suite is
green — [guard-obligations.md](../ground-truth/guard-obligations.md) measures `check:all` at 40
guards passing — and that green includes this dead branch.

**This is the empirical prior for key two.** One half of the mechanism retired, and 15 statements
survived it, 9 of them outside the comprehension folder and 3 of those inside the code. Stage 5
retires the other half, with 58 occurrences standing over 40 lines. If the retirement of the rule
half is the base rate, the acceptance criteria at README:880-892 — which name a workflow file, a
guard rule count and a remedy string, and no documentation file — will leave a comparable residue.
Recording the 58 before the work starts is what makes that avoidable.

## Figures stated elsewhere that this sweep re-takes

| Figure | Where stated | Measured here |
|---|---|---|
| `loop_break` at 7 occurrences | `stage-0-state.md:429` | 12 across the tree; 7 once the ground truth's own 5 are subtracted — the same measurement, differently scoped |
| `schemas/README.md:373` is a polarity-inverted description of a loop's continuation | `stage-0-state.md:456` | The sentence "iterates over collections or while conditions hold" is accurate. Its defect is a change-narrating parenthesis, not a stale claim |
| `AP-10 loop-not-prose`'s detect is falsified by stage 0 | implied by `stage-0-state.md:472,487-490` | The three field names it lists were the item-loop set before stage 0 too. A real coverage gap, not a stale restatement |
| The three schema declarations of `loop_break` are sweep material | `stage-0-state.md:429-434` | A declared event type with no writer is a construct with no subject. Only `schemas/README.md:979`, which presents it as an event the server records, reads as a false claim |
| `.engineering/artifacts/comprehension/**` scope undecided | `stage-0-state.md:404-408`, `:502` | In scope, remedy is a restamp. The corpus writes to that directory by name (`15-codebase-comprehension.yaml:60`) and calls it the record "for the next work package on this area" |
| Stage 0 re-keyed 19 loops | `README.md:768` | Exact for commit `95f13fd1` — 19 lines across 18 files — and stale for the corpus, which now holds 27 repeat-until loops. Reproduces `stage-0-state.md`'s correction |
| A 35-script, 6,749-line guard suite | `README.md:611` | Not re-taken here; `guard-obligations.md` measures 40 registered scripts at 7,699 lines and 44 `check|validate` scripts at 8,896 |
| `check-set-action-values` is in class (a) only | `guard-obligations.md:109` | Also carries a key-two occurrence in its own justifying comment (`:173`), so stage 5 reaches it |

Two figures could not be taken at all, and both are absences rather than disagreements. Nothing in
the repository states how many restatements the `fragments.rules` retirement left behind — the 15
above are this sweep's own count, taken because the base rate is the most useful thing key two can
offer. And no committed artifact records an occurrence count for any past change, so `AP-129`'s Fix
("record the count in the change's file manifest so the sweep is auditable") has no precedent in
this repository to compare against.

## Re-taking every figure

Both counting scripts walk the repository with `.git`, `node_modules`, `dist`, `.worktrees`,
`.idea`, `.gitnexus` and `package-lock.json` excluded, count literal substring occurrences per line,
compose the backtick as `chr(96)`, and classify each occurrence against a hard-coded file list. The
key literals are in the two tables above; the file lists are in
[The file lists to subtract](#the-file-lists-to-subtract). Everything else is a direct command.

```
# stage 0's file list
git show --numstat --format="%H %s" 3a36b0db 4c288fe9
git -C workflows show --numstat --format="%H %s" 95f13fd1

# what holds: the closed loop object, and the comment stating the rule
sed -n '148,165p' src/schema/activity.schema.ts

# the loop-step field table five surfaces still restate
sed -n '371,386p' schemas/README.md
sed -n '28,34p' schemas/README.md

# the validator that reads continueWhile as a gate
sed -n '118,125p' src/utils/validation.ts

# the corpus site the guard and its test still assert
grep -rn "breakCondition" --include=*.yaml workflows/ | wc -l
sed -n '16,18p' scripts/check-loop-shape.ts
sed -n '86p' tests/loop-shape-guard.test.ts

# the fragment mechanism's live footprint
grep -rn "fragments" --include=*.yaml workflows/
grep -rIn "ref:" workflows/*/workflow.yaml | wc -l
npx tsx scripts/check-fragments.ts

# the rule half, retired
sed -n '29,42p' src/schema/workflow.schema.ts
grep -rn "resolveRuleFragment\|materializeRuleEntries\|RuleEntrySchema" src/ scripts/
sed -n '143,164p' scripts/check-checkpoint-presentation.ts

# which site occurrences are generated and which are hand-authored
grep -n "GENERATED" site/api/schemas.html site/specs/checkpoints.html site/specs/workflows.html site/guide/definitions.html site/specs/resource-resolution.html site/design/request-lifecycle.html

# the comprehension folder is a corpus-written read surface
sed -n '55,79p' workflows/work-package/activities/15-codebase-comprehension.yaml
grep -n "Last updated\|^> " .engineering/artifacts/comprehension/json-schemas.md .engineering/artifacts/comprehension/orchestration.md .engineering/artifacts/comprehension/zod-schemas.md .engineering/artifacts/comprehension/when-step-gates.md .engineering/artifacts/comprehension/work-package-workflow-content.md

# the surfaces a sweeper would wrongly hit
sed -n '1,12p' grammar/activity.ebnf
sed -n '3p' docs/orchestra-specification.md
```
