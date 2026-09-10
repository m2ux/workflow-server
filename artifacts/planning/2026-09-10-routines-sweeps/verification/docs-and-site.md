# Twenty of the twenty-one documentation candidates survive, and the plan's own site list has gone out from under it

Refutation pass over [sweeps/docs-and-site.md](../sweeps/docs-and-site.md). Every construct below was
located, read in full, and measured again from the repository. Where a figure the sweep states could
not be reproduced, mine stands beside it with the search that produced it.

**The revisions are not the ones the sweep names, and that matters.** The sweep is written against
server `9ca71c19` on `main` and corpus `2b8b7215` on the `workflows` branch. The working tree is at
server **`c1c9682d`** (thirteen commits ahead, `9ca71c19` an ancestor) and corpus **`26e79d8a`**
(fourteen commits ahead, `2b8b7215` an ancestor). Everything here is measured at those two, because
the rule is to measure from the repository. Nine of the sweep's twenty-one candidates sit in files
untouched since its pin and reproduce line for line; the rest carry line shifts of five to nine
lines, and one candidate has lost half its subject to a corpus retirement that landed after the
sweep was written.

**Twenty-one candidates reproduced, twenty survived, one withdrawn, and one survived with half its
evidence withdrawn. No verdict moved down the ladder.** Every candidate names a real statement in a
real file, and every one was found where the sweep said it was, allowing for the line drift above.
Ten carry corrections to their measured evidence, and one — CV15 — is larger than the sweep measured
rather than smaller. The two withdrawals share one shape: **both name a construct that is not there
to be narrowed.** CV9 reports four session-history event types nothing writes, where nothing writes
them because iteration is the executing agent's job and the server has no place to emit one; the
sweep itself concedes "nothing in the enumeration is wrong about the schema" and that no routines
stage touches it. CV20's second statement is a catalog note about `04-isolated-fan-out`, an activity
the corpus deleted in commit `b5471e45` after the sweep's pin — the note is gone, and so is the file
it described.

**Twelve findings are fixes the design owes rather than removals**, and three of them are new since
the sweep's pin. They are in [Plan defects](#plan-defects), ahead of the verdicts, because they
change the plan rather than the code. The largest is that **two of stage 8's four named reference
sites no longer exist**: the corpus retired `01-orchestrator-workers` and `04-isolated-fan-out` and
moved their batch semantics onto a graph fan, and the criterion that survives them names a variable
(`dispatch_concurrency`) and a rule (`parallelism-is-optimisation`) that occur at zero sites anywhere
in the repository.

## What the verdicts mean here

- **REMOVE** — the construct comes out of the repository at a named stage, and the design says so.
  Nothing has to be re-scoped, because there is nothing left to describe.
- **DEPRECATE** — the construct stands but stops being the way to do the thing, so its description
  has to say what supersedes it. **No candidate on this surface earns it.** Documentation is not a
  mechanism that can be left standing with a warning on it: either the sentence is wrong and comes
  out, or it is narrowed.
- **NARROWS** — the construct stands and the statement about it stops being true universally. The fix
  is a re-scoping: a fifth member in an enumeration, a clause naming the new case, a caveat.
- **KEEP** — no routines stage changes what this construct is or what is true of it. A KEEP verdict is
  not a claim that the construct is defect-free; CV21 is KEEP and carries the most consequential
  measurement in the sweep.
- **STALE** — the statement is already false, or already incomplete, for reasons that have nothing to
  do with routines. Off the ladder: naming a routines stage beside a stale statement records only who
  will trip over it next.
- **WITHDRAWN** — the candidate does not survive as a candidate of *this* sweep. The reason stays
  recorded, and the underlying observation may still be worth raising elsewhere.

## Plan defects

Twelve findings are fixes the routines design owes rather than documentation to delete. Seven sit
inside constructs whose verdict is KEEP or NARROWS; five are acceptance criteria whose stated
mechanism cannot satisfy them.

### PD1 · Stage 3's verifying schema generator cannot pass over `schemas/` as it stands

Stage 3's criterion reads "`routines/` has its own discovery pass and its own generated JSON schema,
and the schema generator has a verifying variant, so a forgotten regeneration fails continuous
integration instead of surfacing as a spurious authoring error"
([2026-09-03-routines/README.md:846-848](../../2026-09-03-routines/README.md)). A verifying variant
regenerates and compares.

`schemas/` holds **six** `.schema.json` files and `scripts/generate-schemas.ts:25-29` makes **five**
`generate(...)` calls — `WorkflowSchema`, `WorkflowStateSchema`, `ConditionSchema`,
`SessionFileSchema`, `ActivitySchema`. `TechniqueSchema` is neither imported nor generated, and its
output cannot be made to match: `schemas/technique.schema.json:2` carries
`"$id": "technique.schema.json"`, while the generator's fixed preamble at
`scripts/generate-schemas.ts:20` writes `{ $schema, title, description, ...json }` and never emits
`$id`. The other five open `$schema`, `title`, `description`, `$ref`, `definitions` with no `$id`
between them.

I ran the comparison rather than reasoning about it. Regenerating all five into a scratch directory
against the committed files reports **FRESH for all five** at `c1c9682d`, so the variant would pass
over everything it can reach and has one file it cannot. As written, a stage-3 author who builds the
variant over the directory gets a permanently red check on a file the change does not touch — the
failure mode the criterion exists to prevent, inverted. The criterion has to name which files the
variant verifies, or `technique.schema.json` has to gain a generator.

### PD2 · The schema set is a closed enumeration in four further places, and one file already falls through

Adding a seventh schema file means opening every list that enumerates them. The design names the
generator; these are the others, and none is in any stage's file list.

| Site | What it closes |
|---|---|
| `scripts/generate-schemas.ts:25-29` | five `generate(...)` calls, each with a hand-written description |
| `src/loaders/schema-loader.ts:8-14` | the `AllSchemas` interface, five fields |
| `src/loaders/schema-loader.ts:16` | `SCHEMA_IDS`, five ids; `readSchema` rejects anything outside it (`:43-45`) |
| `src/resources/schema-resources.ts:5-11` | `SCHEMA_DESCRIPTIONS`, five hand-written sentences |
| `src/resources/schema-resources.ts:49` | the combined resource's description, which spells the five ids out in prose |

**The arrangement already loses a file.** `SCHEMA_IDS` names `workflow`, `activity`, `condition`,
`technique`, `state` — and not `session-file`, which `generate-schemas.ts:28` generates and
`tests/generated-schemas.test.ts` walks. `registerSchemaResources` loops over `listSchemaIds()`
(`src/resources/schema-resources.ts:20`), so `workflow-server://schemas/session-file` is not
registered today, and `readSchema` refuses the id outright. A routine schema absent from `SCHEMA_IDS`
would be generated, rendered on the site, and unreachable in exactly the same way.
`src/resources/schema-resources.ts:49` is CV14's defect in a second file: a hard-coded English
enumeration no regeneration touches.

### PD3 · Stage 6 removes six `challenge_findings` write declarations and the corpus declares seven

The criterion reads "`challenge_findings` is an internal, and its six activity-level write
declarations are removed" ([README:905](../../2026-09-03-routines/README.md)), with the same figure at
[README:207](../../2026-09-03-routines/README.md) and
[gap-review.md:103](../../2026-09-03-routines/gap-review.md).

Parsing every corpus YAML and reading `variables.writes` directly, **seven** activity files declare
it and none declares it as a read: `02-design-philosophy.yaml:23`, `04-research.yaml:29`,
`05-implementation-analysis.yaml:31`, `06-plan-prepare.yaml:34`, `07-assumptions-review.yaml:34`,
`08-implement.yaml:32`, `15-codebase-comprehension.yaml:22`. That is exactly the set of seven files
the proposal names as the convergence loop's sites, so the seventh is not a stray.

**It was already seven when the design last claimed to have checked.** The seventh declaration landed
in corpus commit `d76c142b` ("Compose the analyse-challenge convergence at the activity"), which is
an ancestor of `b5e54574` — the corpus revision
[gap-review.md](../../2026-09-03-routines/gap-review.md) states it re-checked every load-bearing
claim against. The figure was carried, not re-taken. A criterion satisfied literally leaves one
declaration standing for a name that is no longer a workflow variable.

### PD4 · Stage 5's renames orphan twelve pinned option-coverage entries, and the check that would catch it is suppressed on the run that causes it

`tests/e2e/option-coverage.json` holds **113** option keys in three groups, and it is not a coverage
inventory — it records the options **no walk can reach**, each group carrying its reason
(`tests/e2e/README.md:106-112`). Twelve of the 113 name the four batch gates stage 5 moves into a
routine, three options at each of `research:research-assumption-interview`,
`implementation-analysis:analysis-assumption-interview`,
`implement:implementation-assumption-interview` and `assumptions-review:residual-assumption-batch`.
The key format is `checkpoint:${activityId}:${checkpointId}=${optionId}`
(`tests/e2e/coverage.ts:21-23`), and materialisation prefixes the checkpoint id from the reference
step ([README:539-542](../../2026-09-03-routines/README.md)), so all twelve change.

The file is policed, but not on the pull request that would break it.
`tests/e2e/option-coverage.test.ts:182` computes the listed options no definition declares and
`:187-191` fails with "lists these options and no definition declares them — the checkpoint or the
option was renamed or removed, so delete the entries." **That computation is guarded by
`SCOPE.length ? [] : …` on `:182` itself** — a scoped run leaves the question alone, by design and
with its reasoning stated at `:179-181`.
`.github/workflows/coverage.yml` scopes a pull request from the corpus diff and walks
everything only on a push to `main` or when the expectation file itself changes. Stage 5 is a corpus
change that does not touch the expectation file, so it runs scoped, the orphan check is inert, and
the twelve entries surface on the next push to `main`. The one assertion that does fire is the corpus
stamp (`:92-103`), and `npm run baseline:stamp` satisfies it without removing an entry.

Stage 5's criteria name the delivery baseline ([README:891](../../2026-09-03-routines/README.md)) and
not this one. Worth recording alongside: the per-iteration `assumption-decision` gates contribute
**zero** of the 113, so the walker reaches them today, and stage 5 renames four gates whose options
are pinned and four whose options are not.

### PD5 · Deleting the fragments schema relocates two canonical definitions and rewrites eight pointers

`scripts/generate-schemas.ts:19` generates the workflow schema with `$refStrategy: 'root'`, which
emits one definition per repeated subschema and points every later occurrence at the first. In
`schemas/workflow.schema.json` the first occurrence of both the condition and the checkpoint option
is inside the `fragments` subtree — which spans `:68-243` — so eight `$ref` pointers are rooted
there. I read all 24 `$ref` values in the file: `:179`, `:200`, `:219`, `:595`, `:615`, `:739` and
`:751` point at
`#/definitions/workflow/properties/fragments/properties/checkpoints/additionalProperties/properties/condition`,
and `:683` at the same path's `properties/options/items`.

Deleting `WorkflowFragmentsSchema` (`src/schema/workflow.schema.ts:40-42`) therefore does more to the
regenerated file than removing a subtree and two descriptions: it moves where the condition and the
checkpoint option are defined and rewrites eight internal pointers. Nothing gates that regeneration —
`grep -rn "build:schemas" .github/workflows/` returns nothing and `package.json:22` makes `test:ci` a
plain `vitest run` — so the JSON and the Zod can disagree silently in either direction. This is PD1's
absent gate reaching stage 5.

### PD6 · The ordering criterion pins materialisation against two passes and the design needs three

Stage 3's criterion is "Materialisation runs after identifier resolution and before contract
derivation, and a test fails if the order is swapped"
([README:854-855](../../2026-09-03-routines/README.md)). The design's own load-order section states a
third constraint: "Shared gate bodies resolve next, so a routine body containing a `ref` step is
whole before it is spliced. Routines resolve last"
([README:1158-1160](../../2026-09-03-routines/README.md)).

Stage 3 lands before stage 5, so there is an interval — the whole of stages 3 and 4 — in which both
mechanisms are live and a routine body may carry a fragment `ref`. Nothing in the criteria pins
fragment resolution ahead of materialisation, and the architecture diagram at
[README:337-346](../../2026-09-03-routines/README.md) draws the post-stage-5 pipeline with no
fragment pass in it at all. `site/design/request-lifecycle.html:124` is the only place in the
repository that narrates the real order, which is why CV17 is the document a stage-3 implementer
would read to find out where the new pass goes.

### PD7 · "Seven fragment rules are deleted" leaves two survivors and names one

`scripts/check-fragments.ts:56-66` declares **nine** rules: `malformed-ref`, `unresolved-ref`,
`ref-body-conflict`, `ref-opens-step`, `unused-fragment`, `inline-duplicate-of-fragment`,
`duplicate-rule`, `duplicate-checkpoint`, `undeclared-effect-variable`. Stage 5's criterion says
"seven fragment rules are deleted, and `duplicate-checkpoint` keeps its rule with its remedy naming a
routine" ([README:882-884](../../2026-09-03-routines/README.md)). Nine minus seven is two, and the
criterion names one.

The second survivor is `duplicate-rule`, and the guard's own header says why it is not a fragment
rule: "Rules are not shared this way; the inline rule texts this guard indexes are for
`duplicate-rule`, whose remedy is a shared home rather than a fragment"
(`scripts/check-fragments.ts:7-9`). The arithmetic in the criterion is right; the sentence reads as
though one rule survives, and the script is hard-zero (`:30`), so an implementer who deletes the
guard wholesale deletes a live check on rule duplication across workflows.

### PD8 · `fragments.rules` outlives stage 5 in a guard's declared scope, a live code path and a test fixture

The construct does not exist. `WorkflowFragmentsSchema` declares one key, `checkpoints`, and closes
with `.strict()` (`src/schema/workflow.schema.ts:40-42`); `WorkflowRulesSchema` declares its three
buckets as `z.array(z.string())` with no ref union (`:29-33`). So `fragments.rules` is a load error
and a `{ ref }` in a rules slot is a load error, today, before any routines stage. The generated JSON
agrees: `schemas/workflow.schema.json:68` opens the `fragments` property and its only child is
`checkpoints`.

Three places outside the sweep's surface still act on it, and stage 5 touches none of them:

- `scripts/check-checkpoint-presentation.ts:23` states it as the guard's **scope**: "Scope:
  `rules.workflow`, `rules.activity`, `rules.universal` and `fragments.rules` in every
  `workflow.yaml` …", and `:148-163` is a sixteen-line live code path that iterates
  `def.fragments.rules` and builds a finding site from it.
- `tests/checkpoint-presentation-guard.test.ts:55-63` pins that path with a fixture authoring
  `fragments:\n  rules:\n    shared:` and asserts the finding's site is
  `wf/workflow.yaml fragments.rules.shared`. The test title states the construct as fact: "flags a
  rule fragment, which binds the same agents once imported by ref".
- `schemas/README.md:499` is the workflow **`rules`** row, whose type reads
  `{ workflow?, activity?, universal?: (string \| { ref })[] }` and whose prose says "Entries are
  rule strings or `{ ref }` fragment imports". Stage 5 removes `fragments`, not `rules`, so this row
  is outside the blast radius of deleting the fragment sections and will survive them.

### PD9 · The textual-splicer criterion guards a key order the corpus never writes

The criterion is "The textual splicer emits an explicit prefixed `id:` on every step it splices,
nested bodies included, so `injectResolvedStepIds` has nothing to match inside a materialised
routine" ([README:857-858](../../2026-09-03-routines/README.md)).

`injectResolvedStepIds` matches `/^(\s*)- technique:[ \t]*(.+)$/gm`
(`src/schema/activity.schema.ts:235-236`), which needs a block-sequence item whose **first** key is
`technique:`. `grep -rn "^\s*- technique:" --include="*.yaml" workflows/` returns **0** across all
132 corpus activity files. Every technique step opens `- kind: technique` and declares its `id` before
its `technique:` — for instance `workflows/work-package/activities/04-research.yaml:81-83` — because
`kind` is a required discriminator (`src/schema/activity.schema.ts:96`).

The criterion is therefore prophylactic against a key order nobody writes, and it cannot be exercised
against the corpus as it stands. That is not a reason to drop it; it is a reason the test behind it
needs a synthetic fixture, and a reason the differential test's coverage claim ("runs both paths over
every activity in the corpus", [README:860-862](../../2026-09-03-routines/README.md)) does not reach
this path.

### PD10 · Two of stage 8's four reference sites were deleted from the corpus, and it did not notice

**This is new since the sweep's pin and it is the largest of the twelve.** Stage 8 is "The four-step
dispatch run — compose briefs, dispatch, gather, synthesise — becomes one routine, referred to at the
three `meta` pattern activities and inside `lead-researcher`'s follow-up loop"
([README:776](../../2026-09-03-routines/README.md)), with the criterion "Four reference sites:
`01-orchestrator-workers`, `04-isolated-fan-out`, `05-lead-researcher` and the follow-up loop inside
it. The completeness `validate` at `04-isolated-fan-out` stays with the referring activity or becomes
a declared input, and the record says which" ([README:936-938](../../2026-09-03-routines/README.md)).

`workflows/meta/activities/patterns/` now holds three files: `02-supervisor.yaml`,
`03-plan-and-execute.yaml`, `05-lead-researcher.yaml`. `01-orchestrator-workers.yaml` was deleted in
corpus commit `67ac93f0` ("Retire the pattern activity the graph fan replaces") and
`04-isolated-fan-out.yaml` in `b5471e45` ("Retire the isolation pattern nothing could reach"); both
land after `2b8b7215`. Their catalog rows are gone from `patterns/README.md`, and the
orchestrator-workers row now reads "*(graph)* a destination naming one activity and the collection to
run it over" (`workflows/meta/activities/patterns/README.md:19`).

What the stage actually has to work with, measured by reading the files:

| Occurrence | Where | Shape |
|---|---|---|
| 1 | `05-lead-researcher.yaml:41-55` | `compose-briefs` / `dispatch` / `gather` / `synthesise`, four consecutive steps |
| 2 | `05-lead-researcher.yaml:70-84` | the same four inside the `gap-followup` `while` loop (`:59-68`) |
| 3 (partial) | `02-supervisor.yaml:41-49` then `:60-62` | `compose-brief` / `dispatch` / `gather` consecutive, `synthesise` after a gated `announce-escalation` action step |

So the stage's stated benefit — "Four occurrences of one run, one of them a second copy in the same
file that no guard can see, become one body with a signature" — is now two occurrences in one file
plus a three-step window in a file the criterion never names. The `validate` gate the criterion asks
the record to rule on belonged to a deleted file. And the batch semantics the run was generic over
have moved to a server construct the design does not mention: `patterns/README.md:9` now sends a
caller who wants units run together to the graph, "see `dispatch-fan` and `scatter-gather`".

### PD11 · Stage 8's concurrency criterion names a variable and a rule that occur at zero sites

The criterion reads "The routine declares no concurrency and no dispatch mode.
`dispatch_concurrency` reaches `dispatch-workers` as an ordinary binding, and
`parallelism-is-optimisation` holds" ([README:939-940](../../2026-09-03-routines/README.md)).

`grep -rn "dispatch_concurrency"` over `workflows/`, `src/`, `scripts/`, `tests/` and `docs/` returns
**nothing**, and a case-insensitive search for `parallelism` returns four hits, none of them
`parallelism-is-optimisation`. Neither name exists in the repository.

The cause is readable in the history. At the proposal's own corpus pin `131e2942`,
`meta/techniques/orchestration-patterns/dispatch-workers.md` declared `dispatch_concurrency` as an
input at line 16 and its protocol branched on it at `:29-30` — one spawn per brief when the value was
`1` or absent, one `spawn-concurrent` call when it was greater. Commit `a904da93` ("Work a pattern's
units one at a time and leave the batch to the graph") removed the input and the branch. At
`26e79d8a` the technique declares exactly one input, `worker_briefs`
(`dispatch-workers.md:10-14`), and carries a rule named `one-worker-at-a-time` (`:28-34`) stating
that "Briefs are dispatched one after another, in the calling worker's own turn. Running work units
together is the graph's business".

So the criterion asks a routine to pass a value through a seam the technique no longer has, against a
rule that now forbids the behaviour the value selected. `a904da93` is an ancestor of `2b8b7215`, so
this was already true when the sweep was taken and neither the sweep nor the design caught it: it is
not repository drift since the pin, it is a criterion written against a technique nobody re-read.

### PD12 · Two documents promise two activity constructs the closed activity object rejects

`workflows/work-package/activities/README.md:5` — CV19's sentence — enumerates "its steps,
checkpoints, loops, **decisions, transitions**, and artifacts". `src/resources/schema-resources.ts:7`
describes the activity schema as "an ordered list of kind-tagged steps (technique | action |
checkpoint | loop) plus activity-level **decisions and transitions**".

The activity object is closed over fourteen properties — `artifactPrefix`, `bundleTechniques`,
`description`, `exits`, `id`, `name`, `outcome`, `required`, `rules`, `steps`, `techniques`,
`triggers`, `variables`, `version` — with `additionalProperties: false`
(`schemas/activity.schema.json`, the `activity` definition). Neither `decisions` nor `transitions` is
among them, and `grep -rln "^transitions:\|^decisions:" --include=*.yaml workflows/` returns nothing.
An activity says what happened in `exits` and the workflow's `graph` says where each leads.

Both sentences are inside constructs the sweep already opened — CV19 for the first, CV14 for the
second — and neither is in the sweep's evidence. The second is the sharper one: it is the description
of the `workflow-server://schemas/activity` MCP resource, so it reaches agents rather than readers,
and stage 3's criterion for regenerating the activity schema does not touch a hand-written resource
description.

---

## Survived refutation

| Id | Construct | Sweep | Verified | Confidence | Correction |
|---|---|---|---|---|---|
| CV15 | The checkpoint-fragment mechanism documented as the home for a shared gate body | REMOVE | **REMOVE** | CONFIRMED | 22 statements in 8 files at my grain, not 14 in 8; three `id="fragments"` anchors, not two; `workflow.schema.json:679`, not `:674` |
| CV10 | `schemas/README.md:22` — `get_activity` delivers the raw activity YAML verbatim | NARROWS | **NARROWS** | CONFIRMED | already false today, so population one by the sweep's own rule; one of the two named rewriters reaches the corpus |
| CV11 | `workflows/README.md:27-39` — the per-workflow directory tree | NARROWS | **NARROWS** | CONFIRMED | five entries, three of them directories, not "four children"; the fenced quote elides 7 of the 13 lines it cites; goes wrong at stage 5, not stage 3 |
| CV12 | `site/specs/workflows.html:84,90-102,116` — four file types in a workflow directory | NARROWS | **NARROWS** | CONFIRMED | goes wrong at stage 3, unlike CV11 — this diagram describes what the server accepts, not what is on disk |
| CV13 | The closed four-kind step set, 17 enumerations in 5 files | NARROWS | **NARROWS** | CONFIRMED | none — reproduces line for line, including `:308` |
| CV14 | `scripts/generate-schemas.ts:29` — the step-kind set in the generator's description literal | NARROWS | **NARROWS** | CONFIRMED | the `$schema` literal at `:20` is dead code; raises PD2 and PD12 |
| CV17 | `site/design/request-lifecycle.html:124`, `:127` — what the loader does between parse and derivation | NARROWS | **NARROWS** | CONFIRMED | none; raises PD6 |
| CV18 | `schemas/README.md:339`, `:623` — the replay key composed from the id as written | NARROWS | **NARROWS** | CONFIRMED | "replay key" occurs at four sites, not two; raises PD4 |
| CV19 | `workflows/work-package/activities/README.md:5` — the definition lives in its own `NN-<id>.yaml` | NARROWS | **NARROWS** | CONFIRMED | already false on three of six enumerated categories, so the sweep's "when" is refuted; raises PD12 |
| CV20 | `workflows/meta/activities/patterns/README.md:40`, `:72` — copy the step pipeline | NARROWS | **NARROWS** (`:39` only) | PLAUSIBLE | `:40` is now `:39`; `:72` withdrawn, its subject deleted; raises PD10 and PD11 |
| CV1 | The loop-step field table's `condition` row | STALE | **STALE** | CONFIRMED | 53 corpus loop steps, not 54; the zero reproduces |
| CV2 | `breakCondition` as a general per-iteration early exit | STALE | **STALE** | PLAUSIBLE | an omission of scope, not a false statement; 10 code/schema and 3 prose, not 11/2; the zero-site figure is a triaged non-finding |
| CV3 | The enforcement model's loop row omits `continueWhile` | STALE | **STALE** | CONFIRMED | none |
| CV4 | The loop step's opening sentence narrates its own history | STALE | **STALE** | CONFIRMED | none |
| CV5 | "Shared base fields on every kind" lists a field three of four kinds carry | STALE | **STALE** | CONFIRMED | one row of five is wrong; "two fields, not five" overreaches — `kind` and `id` are on every kind |
| CV6 | The site's step-kinds table inverts the loop's polarity | STALE | **STALE** | CONFIRMED | two errors sustained of three |
| CV7 | The guide defines a loop by an exit condition | STALE | **STALE** | CONFIRMED | same third-error caveat; the glossary entry is at `:137-138` |
| CV8 | The manifest gate set stated as two gates, the validator reads three | STALE | **STALE** | CONFIRMED | incompleteness, not falsity; a fourth spelling at `schemas/README.md:161` |
| CV16 | `fragments.rules` and `{ ref }` in rules slots | STALE | **STALE** | CONFIRMED | 4 of 5 statements come out with the mechanism and `schemas/README.md:499` does not; raises PD8 |
| CV21 | `schemas/technique.schema.json` described as generated, with no generator | KEEP | **KEEP** | CONFIRMED | 33 descriptions and 20 divergent reproduce exactly; raises PD1 |

Withdrawn: **CV9**, and **CV20's second statement**. Both are recorded below rather than dropped.

---

## Per-candidate findings

### CV1 · The loop-step field table names a field that fails the load and omits the one that carries the test — STALE, CONFIRMED

`schemas/README.md:371-386` is the reader's reference for the loop step, and `:383` reads
`| condition | Condition | Continue condition (while/doWhile) |`. I read the whole table: it has ten
data rows (`:377-386`) — `id`, `kind`, `name`, `loopType`, `variable`, `over`, `condition`,
`maxIterations`, `breakCondition`, `steps`.

`LoopStepSchema` (`src/schema/activity.schema.ts:152-164`) spreads `stepCommonFields` alone at `:163`
and closes `.strict()` at `:164`. The structured entry gate is a separate spread,
`stepEntryCondition` (`:84-86`), taken by the technique step (`:101`), the action step (`:110`) and
the checkpoint step (`:140`) and by no loop. The comment at `:80-83` states the rule outright, and
`:148-151` repeats it: "A loop carries no `condition`, so its entry gate is `when`". So `condition` on
a loop is a load error, not a deprecated field.

The generated pair agrees, and I read it out of the JSON rather than off a line number: the `loop`
member of `steps[].items.anyOf` in `schemas/activity.schema.json` carries exactly twelve properties
under `additionalProperties: false` — `breakCondition`, `continueWhile`, `id`, `kind`, `loopType`,
`maxIterations`, `name`, `over`, `required`, `steps`, `variable`, `when` — and `condition` is not
among them. Ten documented fields against twelve declared, with one documented field that does not
exist.

**Corrections.** The sweep states "Zero of the corpus's 54 loop steps carry `condition`", carried from
[stage-0-state.md](../ground-truth/stage-0-state.md). Parsing every corpus YAML I count **53** loop
steps in 36 files — 26 `forEach`, 14 `doWhile`, 13 `while` — of which 27 are repeat-until loops,
**all 27 carrying `continueWhile`, zero carrying `condition`, and zero carrying `breakCondition`**.
The zero the candidate rests on reproduces; the denominator does not. Neither of the two pattern
activities retired since the pin held a loop, so the 54 was already something other than this
measurement.

The sweep's headline — "`continueWhile` appears zero times in `schemas/README.md`, zero times in all
of `docs/`, and zero times in all of `site/`" — reproduces exactly. Worth adding that it appears
**four** times inside `schemas/` (`activity.schema.json:534` and `:548`,
`workflow.schema.json:743` and `:757`), so the generated half of the schema directory names the field
and only the hand-authored guide omits it.

**What breaks.** Nothing mechanical. `tests/docs-drift.test.ts` does not cover `schemas/` — its
`PRODUCT_GLOBS` (`:11-23`) names `setup.md`, `http.md`, `stdio.md`, `AGENTS.md`, `CLAUDE.md`, `docs`,
`site`, `examples/cursor-workspace`, `.claude/rules`, `.cursor/rules` and
`scripts/generate-site-data.ts`. The sweep says "three rule directories"; there are two.

### CV2 · breakCondition is described as a general per-iteration early exit and is scoped to item iteration — STALE, PLAUSIBLE

`schemas/README.md:385` reads `| breakCondition | Condition | Early exit condition (agent-evaluated
each iteration) |`. The field's declared scope is item iteration:
`src/schema/activity.schema.ts:160` says "Early exit from item iteration, evaluated by the executing
agent before each item: iteration stops when it holds. A repeat-until loop states its stopping
condition in `continueWhile` instead." `scripts/check-loop-shape.ts:96-104` raises
`repeat-loop-with-break` when a `while` or `doWhile` declares one.

**Why PLAUSIBLE rather than CONFIRMED.** The row is not false; it is under-scoped. "Agent-evaluated
each iteration" is literally true of the only loop shape that may carry the field, and the defect is
that a reader takes "each iteration" to mean any loop of any shape. That is a real reading hazard and
a one-line fix, and it is weaker than the sweep's framing.

**The zero-site figure is a triaged non-finding, and the sweep leans on it.** I reproduce it —
`grep -rn breakCondition --include=*.yaml workflows/` returns nothing at `26e79d8a` — but the
repository has already ruled on what that means. `scripts/check-loop-shape.ts:16-21`: "`breakCondition`
earns a rule of its own rather than a deletion. It was measured unused while this work was designed,
and gained its only site two days earlier on a branch that had not merged … So the field carries live
meaning on an item loop, and the thing worth refusing is not the field but its appearance on a loop
that already has a continuation test." So "it documents a construct with no subject" argues against a
recorded decision. The sweep's disposition — correct the row rather than delete it — is right; its
reason is not the zero.

**Correction to the reference split.** The sweep says thirteen repository occurrences, eleven code or
schema and two prose. Thirteen reproduces outside `.engineering/`, and the split is **ten code or
schema** (`tests/loop-shape-guard.test.ts:82`; `scripts/check-loop-shape.ts:11`, `:16`, `:71`, `:96`,
`:100`; `schemas/activity.schema.json:546`; `schemas/workflow.schema.json:755`;
`src/utils/activity-variables.ts:491`; `src/schema/activity.schema.ts:160`) and **three prose**
(`schemas/README.md:34` and `:385`,
`workflows/workflow-design/resources/schema-construct-inventory.md:47`).

### CV3 · The enforcement model's loop row omits the only loop field an agent evaluates — STALE, CONFIRMED

`schemas/README.md:34`, agent-interpreted column: "`loopType` semantics, `variable` / `over`,
`breakCondition`, `maxIterations` — iteration is executed and bounded entirely by the agent."
`continueWhile` is the field the agent evaluates on every pass
(`src/schema/activity.schema.ts:157`: "the body runs again while this holds … Evaluated by the
executing agent; `loopType` says when it is taken"), and it is absent from a row whose purpose is to
enumerate what the agent carries. `breakCondition`, which is present, is bound at zero corpus sites;
`continueWhile`, which is absent, is carried by all 27 repeat-until loops. Reproduces exactly. This
is the more serious of `schemas/README.md`'s two omissions, because the row is the reader's map of
what the engine enforces against what an agent interprets, and stage 3's delivery argument turns on
that division.

### CV4 · The loop step's opening sentence inverts the polarity and narrates its own history — STALE, CONFIRMED

`schemas/README.md:373`: "A `kind: loop` step is a compound step that iterates over collections or
while conditions hold, with a nested `steps[]` body (replacing the old separate `loops[]` array)."
"While conditions hold" is the right polarity and names no field, so a reader cannot act on it, and
the table below supplies `condition` as the field. The parenthesis is a change narration the
repository's own style mandate forbids.

`grep -n "replacing the old" schemas/README.md` returns two lines, `:373` and `:330`, the second being
the checkpoint step's "replacing the old separate `checkpoints[]` array and the `step.checkpoint`
reference". `grep -rn "loops\[\]\|checkpoints\[\]" src/` returns one line, and it is the same sentence
in the Zod source at `src/schema/activity.schema.ts:297-298`: "Checkpoints are inline kind:checkpoint
steps and loops are compound kind:loop steps: there are no separate checkpoints[]/loops[] arrays in
the unified model." So the retired construct survives in three places, all describing its retirement,
and none describing the system. Recorded because stage 3 adds a fifth step kind to a file that already
carries two dead before-states — and the line directly above that sentence,
`src/schema/activity.schema.ts:296`, is one more closed four-kind enumeration in a code comment. It is
outside CV13's swept surface, so it is not part of the 17, but it sits in the file stage 3 must edit.

### CV5 · A table titled "Shared base fields on every kind" lists a field three of the four kinds carry — STALE, CONFIRMED

`schemas/README.md:318` heads the table "Shared base fields on every kind:", and its rows at
`:322-326` are `kind`, `id`, `when`, `condition`, `required`. `:325` describes `condition` as a
"Structured gate (legacy compat)" and carries a careful caveat about checkpoint dismissal and no
caveat about the one kind that refuses the field.

**Correction.** The sweep says "the shared base is two fields, not five", because `stepCommonFields`
(`src/schema/activity.schema.ts:73-78`) holds exactly `when` and `required`. That overreaches. `kind`
is declared on all four members (`:96`, `:106`, `:132`, `:153`) and `id` on all four as well —
required on action, checkpoint and loop, optional on technique because the loader derives it (`:97`).
So four of the five rows are true of every kind and exactly one, `condition`, is not. The candidate
stands on that one row.

Worth keeping the sweep's own observation about method: this row is not on the recorded key list in
[stage-0-state.md](../ground-truth/stage-0-state.md), because that list keyed on the loop-field
table's phrasings and this row sits under a different heading. It is the claim a key-driven sweep of
the recorded keys would have missed, and stage 3's new step kind is a kind whose gate set has to be
stated in exactly this table.

### CV6 · The site's step-kinds table inverts the loop's polarity fourteen lines after its own diagram gets it right — STALE, CONFIRMED

`site/specs/workflows.html:339`: `| loop | A nested step list with an exit condition | Repeat the
nested steps until the condition is satisfied or the loop declares completion |`.

Two of the sweep's three errors are sustained. `continueWhile` is a *continuation* test
(`src/schema/activity.schema.ts:157`), so "an exit condition" and "until the condition is satisfied"
both invert it; and no field is named, so a reader cannot act on the row. The page contradicts itself
at close range: its own hand-authored SVG at `:324-325` reads "repeat nested steps" / "while a
condition holds" — the correct polarity, fourteen lines above the table that inverts it.

**The third error is not sustained as an error.** The sweep says "the loop declares completion" has no
referent anywhere in the schema. A loop has two mechanisms other than the continuation test by which
iteration ends — `breakCondition` (`:160`) and `maxIterations` (`:161`) — and both are agent-executed,
which is as close to "declares completion" as an agent-executed loop gets. The clause is vague and
unactionable rather than referentless. The `loop_completed` history event does exist
(`src/schema/state.schema.ts:13`) and has no writer, but that is CV9's observation, which does not
survive.

**What breaks.** Correcting the table text breaks nothing. This page's only generated regions are NAV
(`:16-55`), BREADCRUMB (`:60-67`) and PAGINATION (`:441-446`) — there is no `CONTENT` region — so a
text edit needs no regeneration. Correcting the SVG would need `npm run check:svg`, which is
hard-zero and repo-scoped (`scripts/guards.ts:315-322`).

### CV7 · The guide defines a loop by an exit condition, in the glossary row and in the body — STALE, CONFIRMED

`site/guide/definitions.html:86`, the glossary index row: "**Loop** | A step that repeats nested steps
until a condition clears". `:137` is the `<h3 id="loop">Loop</h3>` heading and `:138` the entry: "A
**loop** is a step kind that repeats a nested list of steps until a condition is satisfied or the loop
declares completion." Same inversion as CV6, in the document a newcomer reads first, with the same
third-error caveat.

**What breaks.** The `#loop` anchor at `:137` and the `../specs/workflows.html#step-kinds` link on
`:138` both have to survive an edit. `scripts/check-site-links.ts:2-9` verifies "that every fragment
points at an existing element id in its target page", and it is hard-zero and repo-scoped; I ran it
and it reports "[PASS] All site links and anchors resolve", so a break would be visible.

### CV8 · The manifest gate set is stated as two gates and the validator reads three — STALE, CONFIRMED

`docs/workflow-fidelity.md:143`: "a step gated by `when` or `condition` may be omitted from the
manifest". `site/specs/state-management.html:129`: "Steps gated by `when` or `condition` may be
omitted; loop-body step ids are accepted but never required."

`src/utils/validation.ts:121-125` reads a loop's continuation test as the gate that makes its steps
optional, and the comment at `:118-120` says so: "A loop's continuation test decides the same thing
for its body, so a loop carrying one is gated too." The filter is
`s.when === undefined && (s.kind === 'loop' ? s.continueWhile === undefined : s.condition ===
undefined)`, so the inventory across kinds is three fields, and a repeat-until loop is omissible for a
reason neither sentence gives.

**Refinement, not refutation.** For any single step the gate set is two fields, because a loop cannot
carry `condition` and no other kind can carry `continueWhile`. So the sentences are incomplete rather
than false: they name two of the three fields and omit the one that applies to the kind they go on to
discuss in the same breath. That is still a defect in a specification the fidelity layer is graded
against.

**A fourth spelling the sweep does not name.** `schemas/README.md:161`, inside a mermaid ER diagram:
`Step |o--o| Condition : "gated by (when/condition)"`. Same claim, same omission, a third file. The
sweep reproduces three non-planning occurrences against the recorded key list's two, and its reason —
the site writes the claim as `<code>when</code> or <code>condition</code>`, invisible to a markdown
grep — reproduces. Mine is four.

### CV9 · Four loop history event types are published as API surface and nothing writes them — WITHDRAWN

The measurement reproduces in full. `loop_started`, `loop_iteration`, `loop_completed` and
`loop_break` are declared at `src/schema/state.schema.ts:13` and reach this surface at six
non-planning sites: `schemas/state.schema.json:160-163`,
`schemas/session-file.schema.json:193-196`, `schemas/README.md:979`, `site/api/schemas.html:142` and
`:201`. Nothing emits one. Searching all four names plus `activeLoops` across `src/`, `scripts/` and
`tests/` returns the declarations, the `.default([])` at `src/schema/state.schema.ts:167`, and two
initialisations to `[]` (`:217`, `scripts/generate-session-token.ts:177`). No test pins the four
names.

**Why it is withdrawn.** Nothing in the enumeration is false — the sweep concedes as much — and no
routines stage touches it; the sweep enters it with "Stage: none". What is left is an *implication*
that a session history contains these events, and the reason it does not is the design: iteration is
the executing agent's job (`schemas/README.md:34`), so the server has no place from which to emit one.
Having no writer is the expected state of this surface, not a broken seam, and the repository states
that policy for the analogous case in its own triage rationale:
`scripts/binding-fidelity-triage.json:5` records that "having no consumer inside the corpus is the
expected state of a library, not a broken seam". A candidate whose whole content is that a correct
declaration is unexercised does not survive as a candidate of a routines sweep.

**What the observation is still worth, recorded so it is not lost.** The unwritten loop surface is
larger than four names. `LoopStateSchema` backs `activeLoops` with six sub-fields, and all six reach
the published site at `site/api/schemas.html:191-197`, alongside the row at `schemas/README.md:854`
and the sample at `:880`. If anyone raises the four event types, they should raise the whole of it, and
outside this sweep. Removing any of it has a one-way ordering: `npm run build:schemas` then
`npm run build:site` in the same change, or `tests/site.test.ts:10-14` fails, because
`renderSchemasRegion()` reads the committed JSON rather than the Zod source.

### CV10 · The schema guide says get_activity delivers the raw activity YAML verbatim — NARROWS, CONFIRMED

`schemas/README.md:22`: "`get_activity` delivers the raw activity YAML verbatim, so every authored
field reaches the agent — the classification below states what the **server** does with each field".
One occurrence: `grep -rn "delivers the raw activity YAML verbatim" docs schemas site` returns that
line alone.

Stage 3 makes it false wholesale. Materialisation splices a routine's steps into the host activity
under prefixed identifiers before delivery, so the delivered text is no file on disk and the
identifiers in it were written by the loader. The proposal says so — "The textual splicer emits an
explicit prefixed `id:` on every step it splices" (README:857-858) — and scopes byte-identity
precisely: "Delivery is byte-identical for every activity that carries no routine" (README:863).

**Two corrections, and one is a reclassification.** First, the sentence is **already false today**, so
by the sweep's own partition this belongs in population one rather than population two. Second, the
sweep names two rewriters and only one has live sites. `src/tools/workflow-tools.ts:1406` runs
`injectResolvedStepIds(rawActivity)` and `:1415` runs `injectCheckpointFragmentBodies` when the
textual pre-scan finds any — the sweep cites `:1399` and `:1408`, correct at its pin and shifted nine
lines at `c1c9682d`. Of those two, `injectResolvedStepIds` matches **zero** corpus sites, per PD9. So
the eight sites the sentence is false at are all fragment reference sites, and I read every one:
`04-research.yaml:224` and `:243`, `05-implementation-analysis.yaml:126` and `:145`,
`07-assumptions-review.yaml:112` and `:130`, `08-implement.yaml:202` and `:221` — four sites for each
of two fragments, all in `work-package`.

Correcting it early is strictly better than late. The sentence is the premise a reader uses to decide
that everything below it is an agent's job, and stage 3 changes what the server does to the text
without changing that table's contents at all.

### CV11 · The corpus's own directory map has a fixed set of children and routines is one more — NARROWS, CONFIRMED

`workflows/README.md:27-39` is the `{workflow-id}/` branch of the "Directory Structure" fenced tree,
and `find workflows -maxdepth 2 -type d -name routines` prints nothing, so the tree is accurate as it
stands. Stage 3 puts a routine at `<workflow>/routines/<name>.yaml` with its own discovery pass
(README:846-848), and the tree becomes wrong in the file a first-time corpus author reads to learn
where things go. `grep -c "resources/" workflows/README.md` returns 7, so the layout is restated
across the file rather than declared once — the `meta/` branch at `:14-26` names the same three
subdirectories again.

**Three corrections.** The sweep says "four children". Reading the thirteen lines, `{workflow-id}/`
has **five** entries — `README.md`, `workflow.yaml`, `activities/`, `techniques/`, `resources/` — of
which **three** are directories. Neither reading gives four; `routines/` would be a sixth entry and a
fourth directory. Second, the sweep's fenced block is presented as a quote of `:27-39` and is six
lines; the cited range is thirteen, the missing seven being the `{NN}-{id}.yaml`, `TECHNIQUE.md`,
`{slug}.md` and `{group}/` sub-entries. Third, on stage attribution: this document describes what is
on disk in the corpus, and no corpus `routines/` directory exists until a migration lands, so the tree
goes wrong at **stage 5**, not stage 3. Stage 3 is a `main`-side change.

**What breaks.** Nothing mechanical. `check:resource-anchors` walks every `.md` and `.yaml` under the
corpus root and grades relative `.md#anchor` links and fence closure, so an added tree row is
invisible to it as long as the fence closes. No stage names `workflows/README.md`.

### CV12 · The site says a workflow directory holds four file types, in prose, in a diagram, and in a caption — NARROWS, CONFIRMED

Three coupled statements on `site/specs/workflows.html`, all reproduced at the cited lines: `:84`, the
SVG's accessible description ("A workflow directory contains a manifest, activity files, technique
markdown files, and resource markdown files"); `:91-101`, four `<rect>` elements with eight `<text>`
children labelled `workflow.yaml`, `activities/*.yaml`, `techniques/*.md`, `resources/*.md`; and
`:116`, the figcaption ("The four file types in a workflow directory and how they reference each
other"). `grep -n "four file types" site/` returns one line.

Unlike CV11, this diagram describes the content model the server accepts rather than what is on disk,
so it narrows at **stage 3**, the moment a routine file becomes a legal fifth type. The diagram's
three arrows at `:104-108` encode "lists / bind / refs", a chain a routine inserts itself into between
the activity and the technique.

**What breaks.** This is the one candidate with a real mechanical cost, and the sweep's measurement of
it reproduces. The SVG is hand-authored and graded by `scripts/check-svg-layout.ts`, a hard-zero
repo-scoped guard (`scripts/guards.ts:315-322`) that reports text crossing a rect border, intersecting
an arrow, overlapping sibling text, or escaping the `viewBox` (`check-svg-layout.ts:2-11`). The
`viewBox` at `:82` is `0 0 960 200` and the four rects run x=10 (width 185), x=240 (210), x=495 (200),
x=740 (210) — spanning x=10 to x=950 of a 960-unit box. A fifth box needs the whole row re-laid out
and `npm run check:svg` re-run.

### CV13 · The four-kind step set is stated 17 times across five files in this surface — NARROWS, CONFIRMED

Stage 3 adds a `routine` member to `StepSchema`, today a four-member discriminated union
(`src/schema/activity.schema.ts:167-172`). I rebuilt the sweep's count from scratch rather than
trusting it: a regular expression over tag-stripped, entity-unescaped, backtick-stripped lines across
`docs/`, `schemas/`, `site/` and every `README.md` in the tree outside planning artifacts, matching
`technique` / `action` / `checkpoint` / `loop` across `/`, `,`, `|`, `and` and `or` separators, plus
the literals "Four kinds", "four step kinds" and the prose gloss "a technique step (binds an
operation)".

**It reproduces at 17, line for line.**

| File | Occurrences | Lines | Hand or generated |
|---|---|---|---|
| `schemas/README.md` | 8 | 46, 83, 100, 299, 322, 560, 1122, 1153 | hand |
| `site/specs/workflows.html` | 4 | 303, 307, 308, 329 | hand |
| `site/api/schemas.html` | 3 | 77, 91, 283 | **generated** |
| `schemas/activity.schema.json` | 1 | 4 | **generated** |
| `site/guide/definitions.html` | 1 | 167 | hand |
| **Total** | **17** | | 13 hand, 4 generated |

My first pass returned 16 and missed `site/specs/workflows.html:308` — "Four boxes for technique,
action, checkpoint, and loop steps" — because my separator class lacked ", and ". The sweep's 17 is
right and its methodology note is sufficient to rebuild.

Three deserve naming. `schemas/README.md:46` states it as prose with a gloss per kind, and the
checkpoint gloss — "an inline user decision point at its concrete position" — is the one stage 3
strains hardest, because a checkpoint declared in a routine body has no concrete position in any
activity file, only in the materialised result. `site/specs/workflows.html:303` says "Four kinds are
in use today", which is the most honest of the seventeen and still a count that goes to five.
`schemas/README.md:100` is a mermaid node, `S["steps[] (kind: technique|action|checkpoint|loop)"]`,
with siblings for the checkpoint and loop steps at `:101-102`; a routine node belongs beside them.

**Two of the three site occurrences self-heal, and I confirmed the mechanism.**
`site/api/schemas.html:91` and `:283` render the type label `(technique | action | checkpoint |
loop)[]`, and `variantLabel` (`scripts/generate-site-data.ts:493-496`) derives each variant's name
from `properties.kind.const`. Add a fifth union member, regenerate, and the label extends without
anyone editing prose. The remaining generated pair does not self-heal, which is CV14.

**The surface figure has moved.** The sweep counts 117 files: `docs/` (15), `schemas/` (7), `site/`
(23) and 72 further `README.md` files. At `26e79d8a` there are **76** READMEs outside planning
artifacts, 65 of them in the corpus, so the surface is **119 files**. The two additions are
`workflows/fan-conformance/README.md` and `workflows/fan-conformance/resources/README.md`, from a
workflow that did not exist at the pin. Neither carries a candidate.

### CV14 · The step-kind set is hard-coded in the schema generator's own description string — NARROWS, CONFIRMED

`scripts/generate-schemas.ts:29` passes the literal `'Activity definition schema — unified ordered,
kind-tagged steps[] (technique | action | checkpoint | loop).'`. It is written into
`schemas/activity.schema.json:4` as the top-level `description`, and `renderSchemasRegion()`
(`scripts/generate-site-data.ts:690`) reads it back out and renders it at `site/api/schemas.html:77`
as the section's `schema-summary` (`generate-site-data.ts:700`). A second, independent chain runs from
`src/schema/activity.schema.ts` — the `steps` field's `.describe('Ordered, kind-tagged execution steps
for this activity')` — into `schemas/activity.schema.json` and `schemas/workflow.schema.json`, and
onto `site/api/schemas.html:91` and `:283`.

The failure mode is specific and reproduces: regenerating after adding the union member fixes the
*type labels* and leaves the *sentence* intact, because a hard-coded English string is derived from
nothing. So a stage-3 author who runs `npm run build:schemas && npm run build:site` and reads the diff
sees the labels update and may take that for the whole of the propagation.

**Corrections and additions.** The generator makes five `generate(...)` calls (`:25-29`), each with a
hand-written description; that reproduces. Two further hard-coded copies of the same sentence live in
`src/`: `src/resources/schema-descriptions` at `src/resources/schema-resources.ts:7`, which is the
description of the `workflow-server://schemas/activity` MCP resource and therefore reaches agents
rather than readers, and `src/resources/schema-resources.ts:49`, whose combined-resource description
spells five schema ids out in prose. PD2 collects those. PD12 records that `:7` also promises two
activity constructs the closed object rejects.

One incidental finding while reading the generator: **its `$schema` literal is dead code.** Line 20
writes `{ $schema: 'https://json-schema.org/draft/2020-12/schema', title, description, ...json }`, and
because `...json` comes last, `zod-to-json-schema`'s own `$schema` overwrites it. All five committed
files open `"$schema": "http://json-schema.org/draft-07/schema#"`, and my regeneration reproduces that
byte for byte. The literal has never taken effect.

### CV15 · The checkpoint-fragment mechanism is documented as the home for a shared gate body — REMOVE, CONFIRMED, and larger than measured

Stage 5 retires the mechanism: "The `fragments` block is gone from `work-package/workflow.yaml`, seven
fragment rules are deleted, and `duplicate-checkpoint` keeps its rule with its remedy naming a
routine" (README:882-884). Every description of it in this surface goes with it.

I enumerated the surface myself rather than checking the sweep's fourteen. Fixing a grain — a
statement is a heading, a table row, a list item, or a sentence in a paragraph — gives **22
statements across 8 files, 18 hand-authored and 4 generated**:

| File | Statements | Where | Hand or generated |
|---|---|---|---|
| `docs/checkpoint-model.md` | 2 | `:113` the `ref` row; `:116` the fragment paragraph | hand |
| `schemas/README.md` | 5 | `:279` and `:500` the two `fragments` rows; `:332` "authored in exactly one of two forms"; `:335` the by-reference bullet; `:341` the `ref` row | hand |
| `site/specs/checkpoints.html` | 2 | `:195` the `<h2 id="fragments">` heading; `:196` its one paragraph | hand |
| `site/specs/resource-resolution.html` | 5 | `:203` the scoping sentence; `:205` the `<h2 id="fragments">` heading; `:206` the intro paragraph; `:209` the `fragments.checkpoints` item; `:211` the resolution paragraph | hand |
| `site/specs/workflows.html` | 4 | `:128` the manifest key bullet; `:226` the scoping analogy; `:228` the `<h3 id="fragments">` heading; `:229` the paragraph and its two outbound links | hand |
| `schemas/activity.schema.json` | 1 | `:439` the `ref` description | **generated** |
| `schemas/workflow.schema.json` | 2 | the whole `fragments` subtree `:68-243`, including the shared-condition description at `:229`; `:679` the inline `ref` description | **generated** |
| `site/api/schemas.html` | 1 | `:264` the workflow `fragments` row | **generated** |

Five hand-authored statements the sweep's fourteen omits: `schemas/README.md:332`,
`site/specs/resource-resolution.html:203` and `:206`, and `site/specs/workflows.html:226` and `:228`.
The last two matter most. **`:228` is a third `<h2>`-class anchor** — an `<h3 id="fragments">`, which a
search for `<h2 id="fragments">` misses — and `:128` on the same page links to it with a bare
`#fragments`. So the mechanism's anchors are three, not two, and the inbound links are two cross-page
(both from `:229`) plus one same-page. `:226` is the sentence "This mirrors fragment scoping", an
analogy that loses its referent when the mechanism goes.

`grep -rn "fragments.checkpoints" docs schemas site` returns 7 lines, as the sweep says, and one of
them has moved: `schemas/workflow.schema.json:679`, not `:674`, because that file gained five lines
since the pin. Corpus-side the mechanism is one declaration at
`workflows/work-package/workflow.yaml:15-71` — `fragments:` at `:15`, `checkpoints:` at `:16`,
`assumption-interview` at `:17`, `assumption-decision` at `:50` — and eight reference sites, all
verified above under CV10.

**One correction to the mechanical argument, and it inverts the conclusion's reasoning without
touching the conclusion.** The sweep says: because `check-site-links` is repo-scoped and stage 5 is a
corpus pull request, `workflows/.github/workflows/verify-corpus.yml:70` runs `npm run check:all`
against `main`'s files rather than the corpus, "so the breakage surfaces on the next server pull
request, not on the one that caused it". That does not follow. `check-site-links` grades hrefs and
anchor ids and reads no corpus file, so a corpus pull request that removes the `fragments` block
cannot break it — and correctly so, because no anchor is broken. Deleting an `<h2 id="fragments">`
section is a `main`-side edit, and `verify.yml:59` runs `check:all` on `main` pull requests, so it is
caught on the very change that causes it. What a corpus pull request does is make the site's prose
false while every guard stays green, because no guard reads prose. The sweep's disposition — the three
site sections and the sentence linking them move in a single `main`-side change — is right; its
sequencing hazard is the silent one, not the loud one.

### CV16 · The site documents a rules half of the fragment mechanism that the schema does not admit — STALE, CONFIRMED

Five statements at three sites, all reproduced: `site/specs/resource-resolution.html:208`
("**`fragments.rules`** — shared rule texts; rules slots accept either a rule string or `{ ref:
"[workflow::]name" }`"), `site/specs/workflows.html:128` and `:229`, `schemas/README.md:499`, and
`site/specs/resource-resolution.html:211` generalising ("The loader materializes refs at load and
delivery time").

The schema refuses both halves, and I read it. `WorkflowFragmentsSchema`
(`src/schema/workflow.schema.ts:40-42`) declares one key, `checkpoints`, and closes `.strict()`, so
`fragments.rules` fails the load. `WorkflowRulesSchema` (`:29-33`) declares `workflow`, `activity` and
`universal` as `z.array(z.string())` with no union, so a `{ ref }` in a rules slot fails too. This is
false today, before any routines stage. The cleanest proof is the generated pair:
`schemas/workflow.schema.json:68` opens the `fragments` property and its only child is `checkpoints`,
and the generated site row at `site/api/schemas.html:264` describes `fragments` as "Shared checkpoint
bodies" with no mention of rules — so the generated half of the site is correct and the hand-authored
half is not, on the same site, three clicks apart.

`grep -rn "fragments.rules" docs schemas site` returns one line, `resource-resolution.html:208`; the
other four use the bare word.

**Correction to the disposition.** The sweep reasons that a stage-5 author deleting the fragment
sections deletes these by accident, "which is why deleting is the right disposition rather than
fixing". Four of the five come out with the mechanism. `schemas/README.md:499` does not: it is the
workflow **`rules`** row, and stage 5 removes `fragments`, not `rules`, so it survives the deletion
with a type union that has never been valid. That row is on the keep list, and the guard and test that
still act on `fragments.rules` are PD8.

### CV17 · The load pipeline is documented step by step, and stage 3 inserts a pass into the middle of it — NARROWS, CONFIRMED

`site/design/request-lifecycle.html:124` is the only place in the repository that narrates what
happens between parsing an activity file and handing it downstream: "the manifest is parsed and
validated, each activity file is validated and gets its step ids populated, and the `artifactPrefix`
is derived from the activity filename's numeric prefix. Rule and checkpoint fragment refs are
materialized at load; borrowed cross-workflow activities retain their source-workflow id for technique
and fragment scoping." `:127` narrates the delivery half.

Three ways it narrows, all reproduced. "Rule and checkpoint fragment refs" is already wrong for CV16's
reason. Stage 3 inserts routine materialisation into exactly the window `:124` describes, with an
ordering the proposal asserts as a testable criterion (README:854-855) — and the sentence already
names both anchors of that criterion, identifier resolution ("gets its step ids populated") and
fragment materialisation, so it is the sentence that would have to say where the new pass sits. Stage
5 then deletes the fragment clause from both lines.

Both statements sit in hand-authored prose: this page's generated regions are NAV (`:16-55`),
BREADCRUMB (`:60-67`) and PAGINATION (`:162-167`), with no `CONTENT` region. The claims are
reproducible against `src/tools/workflow-tools.ts:1406-1415` for the delivery half. Recorded because
it is the one document a stage-3 implementer would read to find out where the new pass goes, and it
currently describes an ordering the design's own load-order section states in three constraints rather
than two — PD6.

### CV18 · The checkpoint replay key is documented as composed from the id as written — NARROWS, CONFIRMED

`schemas/README.md:339`, the checkpoint `id` row: "Bare ids (`confirm-proceed`) are the response-replay
key as written. Loop-body checkpoints that need a distinct answer per iteration use a template form
`<baseId>#{...}` … workers yield the expanded `<baseId>#<instance>` and the server matches the
definition on the base id while recording under the full string." `:623`: "`yield_checkpoint` stores
responses under `<activityId>-<checkpoint_id>`."

Stage 3 narrows both. A checkpoint declared inside a routine body is spliced under a **prefixed**
identifier (README:857-858), so `<checkpoint_id>` at `:623` is a name the loader generated, and "the
response-replay key as written" at `:339` is false for any routine-hosted gate.

The interaction with the per-iteration template form is the sharp end, and I verified it in the corpus
rather than taking it: all four `assumption-decision` reference sites are authored as
`id: assumption-decision#{current_assumption.id}` inside a `forEach`
(`07-assumptions-review.yaml:130`, `04-research.yaml:243`, `05-implementation-analysis.yaml:145`,
`08-implement.yaml:221`), and stage 5 moves exactly those into a routine. So the first construct to
meet a prefixed id is the one that already composes its id from a template, and the resulting key is
`<prefix>_<baseId>#<instance>`. Nothing in these two sentences prepares a reader for that.

**Correction.** The sweep says `grep -rn "replay key" docs schemas site` returns `schemas/README.md:323`
and `:339`. Mine returns **four** lines: those two plus `schemas/activity.schema.json:435` and
`schemas/workflow.schema.json:675`, both carrying "Identifier for this step within the activity; the
stable checkpoint-response replay key" from `src/schema/activity.schema.ts:133`. Two of the four are
generated, so correcting the claim touches a regeneration the sweep does not account for.

The consequence in a committed artifact reproduces exactly, and I re-derived it: `tests/e2e/option-coverage.json`
holds 113 unique option keys, of which **12** name the four batch gates stage 5 renames. My first scan
matched 13 by pattern; one — `checkpoint:assumptions-review:post-summary-review=skip-posting` — matched
only because its activity id contains "assumptions", and it is a different gate. The 12 are three
options each at the four gates named in PD4. That plan defect is where the timing hazard actually
bites.

### CV19 · A corpus README promises that an activity's definition is in its own file — NARROWS, CONFIRMED, and already false

`workflows/work-package/activities/README.md:5`: "The structured definition of each activity — its
steps, checkpoints, loops, decisions, transitions, and artifacts — lives in the corresponding
`NN-<id>.yaml` file; it is not duplicated here."

The stage arithmetic reproduces. `work-package` holds 15 activity files. Stage 5 moves the assumption
run out of four of them — `04-research`, `05-implementation-analysis`, `07-assumptions-review`,
`08-implement`, the four fragment reference sites. Stage 6 moves the convergence loop out of those
four plus three more, and I derived that set independently rather than taking it: the seven files
declaring `challenge_findings` as an activity-level write are exactly `02-design-philosophy`,
`04-research`, `05-implementation-analysis`, `06-plan-prepare`, `07-assumptions-review`,
`08-implement`, `15-codebase-comprehension`. Union: **7 of 15**.

**The sweep's "when" is refuted. The sentence is already false on three of its six enumerated
categories.**

- **checkpoints** — eight checkpoint bodies do not live in any `NN-<id>.yaml` today. They live in
  `workflows/work-package/workflow.yaml:15-71` under `fragments.checkpoints`, and four of the fifteen
  activities import them by `ref`. That is a fragment mechanism the same corpus documents at
  `docs/checkpoint-model.md:116`.
- **decisions** and **transitions** — neither is an activity construct at all. The activity object is
  closed over fourteen properties and declares neither, and zero corpus activity files declare either
  (PD12).

So this belongs in population one, with stages 5 and 6 widening a falsity from four activities to
seven and from one category to three. The three categories stage 5 and 6 move are precisely three the
sentence enumerates: the run is steps, the two fragments are checkpoints, and the convergence block is
a loop.

**What breaks.** Nothing mechanical: `check:resource-anchors` grades the file's relative anchors and
its mermaid fences and nothing else. Out of every list — stage 5's corpus file list is four activity
YAML files and one `workflow.yaml`, and `activities/README.md` is none of them.

### CV20 · The pattern-activity README tells the reader to copy a step pipeline — NARROWS on one statement, PLAUSIBLE; the other WITHDRAWN

**The surviving half.** `workflows/meta/activities/patterns/README.md:39` — the sweep cites `:40`, and
the file lost a line since the pin — reads "Wire your own `transitions` in a thin local wrapper
activity when the borrowed file has none, or copy the step pipeline into a local activity and bind the
same ops with input overrides." It sits inside step 1 of the "How to consume" procedure and offers
copying as one of two sanctioned consumption routes.

**Why PLAUSIBLE, not CONFIRMED.** The sweep says "the routine construct exists to make that route
unnecessary". It does not, quite. The sentence's two branches both answer a *transitions* problem —
the borrowed file has none — and a routine cannot answer it: it "is not a transition destination,
never a workflow's first or last node, and it declares no outcome"
([README:746-748](../../2026-09-03-routines/README.md)). A consumer needing local transitions still
needs a local activity. What a routine removes is the *copying* inside that local activity, which is a
genuine narrowing of the sentence and a smaller one than the sweep claims.

**The withdrawn half, recorded.** The sweep's second statement is `:72`, the pattern note for
`04-isolated-fan-out`: "Same shape as 01 with `isolation_mode` and a validate gate on
`gathered_results.completeness` before synthesise." **That line no longer exists, and neither does the
activity it describes.** `04-isolated-fan-out.yaml` was deleted in corpus commit `b5471e45` and
`01-orchestrator-workers.yaml` in `67ac93f0`, both after `2b8b7215`; the pattern notes for both are
gone from the README, and the catalog's orchestrator-workers row at `:19` now reads "*(graph)* a
destination naming one activity and the collection to run it over". A candidate whose subject the
corpus deleted is not narrowed by anything. It is withdrawn, and the reason it was worth stating —
that the catalog documented duplication as a feature — is now a fact about a retirement rather than a
finding about the corpus.

**The sweep's blast-radius argument needs a correction of its own, and it is failure-mode three.** The
sweep writes: "These five files are the ones nothing validates … So stage 8 lands its routine in the
part of the corpus the loader never loads, the activity schema never validates, and every
loader-consuming guard never sees." The first half reproduces and is now smaller: I ran the validator,
and `npm run check:activities` prints **"Total: 129 passed"** against **132** activity YAML files, the
three unreached being the surviving `meta/activities/patterns/*.yaml`. `validate-activities.ts:110`
reads `readdirSync(activitiesDir)` and never recurses, exactly as the sweep says.

The second half mistakes a declared arrangement for a gap. `patterns/README.md:5` states it —
"`loadActivitiesFromDir` is non-recursive — this subdirectory is library-only" — and the repository
records the policy in its own triage rationale. `scripts/binding-fidelity-triage.json:5`: "Library ops
are bound ad hoc by any workflow, so **having no consumer inside the corpus is the expected state of a
library, not a broken seam**; the caller that binds the op consumes the value in its own context."
And `:7`, the `pattern-library-seed` rationale: "A borrowable pattern activity binds an op whose input
the BORROWING workflow seeds — the contract documented in meta/activities/patterns/README.md.
Producers resolve per-workflow, so the library home can never show one." Two triage entries cite that
rationale at `:320` and `:327`.

So the real risk stage 8 carries is narrow and worth stating narrowly: a routine landing in
`patterns/` is never **schema-validated**, because the validator does not recurse. It is not that the
library has no consumers — that is what a library is here, and the repository has said so twice.

### CV21 · One of the six JSON schemas is described as generated and has no generator — KEEP, CONFIRMED

`docs/documentation-system.md:34`: "| `schemas/*.schema.json` | JSON Schemas generated from the Zod
sources (`npm run build:schemas`) | Authoring-time validation and tooling |".
`docs/technique-protocol-specification.md:9`: "The schema those rules are checked against is
`technique.schema.json`, generated from [its Zod source](../src/schema/technique.schema.ts)".

`scripts/generate-schemas.ts:25-29` makes five `generate(...)` calls and `TechniqueSchema` is not
among them; `schemas/` holds six `.schema.json` files. The file itself proves it:
`schemas/technique.schema.json:2` carries `"$id": "technique.schema.json"` and no output of that
generator can carry `$id` (PD1). I confirmed the negative by regenerating all five into a scratch
directory: every one matches its committed file byte for byte, so the five are fresh and the sixth is
not generator output at all.

**The drift measurement reproduces exactly.** Walking every `description` value in the JSON and
looking for a whitespace- and backtick-normalised match among the `.describe('…')` payloads in
`src/schema/technique.schema.ts`: **33** descriptions in the JSON, **24** `describe()` payloads in the
Zod, and **20** JSON descriptions with no counterpart. Two of the twenty still call a technique a
*skill*:

- `schemas/technique.schema.json:11` — "Used to bind to an output or supply from context when chaining
  **skills**." `src/schema/technique.schema.ts:5` says "chaining **techniques**".
- `schemas/technique.schema.json:24` — "Inputs the **skill** expects from context". `:20` in the Zod
  says "Inputs the **technique** expects from context".

**And it is published.** `renderSchemasRegion()` reads the committed JSON, so
`site/api/schemas.html:226` renders "Technique definition schema for workflow-server" and `:233-244`
renders the field table from the hand-maintained definitions — including `:236`'s "Never authored in
technique markdown", where the Zod at `src/schema/technique.schema.ts:103` says "Never authored in
technique files". `tests/site.test.ts:10-14` grades that page against a fresh regeneration and passes,
because the regeneration reads the same stale input. `tests/docs-drift.test.ts:74` polices "Skill" in
exactly one phrasing — the `Goal → … → Skill` agent-model line — and `schemas/` is outside its
`PRODUCT_GLOBS`, so neither guard catches either occurrence.

**Why KEEP is right and why it is still the most consequential row.** No routines stage changes what
`technique.schema.json` is or what is true of it. It is in the sweep because stage 3 adds a seventh
file to a set of six that already contains one nobody regenerates, and because the same asymmetry is
what makes CV14 durable. The finding is a fix the design owes, which is PD1, and it now also owes PD2:
the same directory already loses `session-file` to a five-id allowlist.

---

## The freshness picture, re-measured

| Artifact | Generated by | Freshness gate | Fresh at `c1c9682d`? |
|---|---|---|---|
| `schemas/workflow.schema.json` | `scripts/generate-schemas.ts:25` | **none** | yes (verified by regeneration) |
| `schemas/state.schema.json` | `:26` | **none** | yes |
| `schemas/condition.schema.json` | `:27` | **none** | yes |
| `schemas/session-file.schema.json` | `:28` | **none** | yes, and unreachable as an MCP resource (PD2) |
| `schemas/activity.schema.json` | `:29` | **none** | yes |
| `schemas/technique.schema.json` | **nothing** | none | not applicable — no generator (CV21) |
| `site/api/schemas.html`, CONTENT `:74-302` | `renderSchemasRegion()`, `generate-site-data.ts:690` | `tests/site.test.ts:10-14` | yes, against the committed JSON |

The sweep's structural point reproduces and is worth restating as an invariant rather than a
prediction: **the chain Zod → JSON → site page has a freshness gate on its last link only.**
`tests/generated-schemas.test.ts:36-59` asserts that no recursion point degraded to the empty schema
and that the three condition combinators carry a `$ref`; it never compares the committed JSON to a
regeneration. `grep -rn "build:schemas" .github/workflows/` returns nothing and `package.json:22`
makes `test:ci` a plain `vitest run`. So a forgotten `npm run build:schemas` passes continuous
integration, and `tests/site.test.ts` then certifies the site as fresh against that stale JSON — the
site is graded against its input, not against the source of truth. That the five files happen to be
fresh today is luck, not a gate.

The generated tool reference carries nothing this sweep falsifies:
`grep -c "loop\|fragment" site/api/tools.html` returns **0**, which reproduces. Stage 3 changes what
`get_activity` delivers and stage 5 removes a construct, and neither shows up in the MCP tool
reference — so an agent reading the tool catalogue is never told that the activity text it receives was
assembled.

---

## The keep list

What a confident implementer working from this sweep would delete by mistake, each with the
discriminators that separate it from the thing it resembles. Several discriminators per entry, because
one is a coin flip.

### `breakCondition`, and the guard rule that polices it

It sits at zero corpus sites and its documentation row is a candidate, which reads as a construct with
nothing behind it.

- `scripts/check-loop-shape.ts:16-21` records the decision explicitly: the field "earns a rule of its
  own rather than a deletion", it "carries live meaning on an item loop", and what is worth refusing is
  its appearance on a loop that already has a continuation test.
- Stage 3's own criterion names it: substitution must cover "a `forEach`'s `breakCondition`"
  ([README:851-853](../../2026-09-03-routines/README.md)). A routine body's `forEach` may carry one.
- It is a declared member of a closed object (`src/schema/activity.schema.ts:160`, `.strict()` at
  `:164`), so removing it is a schema major, not a documentation edit.
- The sweep's own disposition is to correct the row, not delete it. Only its *reason* — zero sites — is
  the trap.

### `check-fragments`'s `duplicate-rule` and `duplicate-checkpoint` rules

Stage 5 says "seven fragment rules are deleted", the guard declares nine, and the obvious reading is
that the script goes.

- The header states `duplicate-rule` is not a fragment rule at all: "Rules are not shared this way;
  the inline rule texts this guard indexes are for `duplicate-rule`, whose remedy is a shared home
  rather than a fragment" (`scripts/check-fragments.ts:7-9`).
- Stage 5's criterion names `duplicate-checkpoint` as an explicit survivor, with its remedy rewritten
  to name a routine (README:882-884).
- Nine minus seven is two, so the arithmetic itself says a second rule survives even though the
  sentence names one (PD7).
- The script is hard-zero (`:30`), so deleting it silently drops a live check on rule duplication
  across workflows.

### `schemas/README.md:499`, the workflow `rules` row

It names `{ ref }` and reads like part of the fragment mechanism, so it looks like CV15 collateral.

- It is the **`rules`** row, not a `fragments` row. Stage 5 removes `fragments` and leaves `rules`, so
  this row survives the deletion and stays wrong.
- It is already false independently: `WorkflowRulesSchema` declares plain `z.array(z.string())`
  (`src/schema/workflow.schema.ts:29-33`), with no ref union, so a `{ ref }` there is a load error
  today.
- Its fix is an edit, not a deletion — the row documents a real field with a wrong type.

### `site/specs/resource-resolution.html:149`, "not a fragment of the parent file"

A nominal collision, and it will appear in every grep for "fragment" on this surface.

- It is a `<figcaption>` about a nested `{sub}.md` technique file — "A nested `{sub}.md` is a full
  technique in its own right — not a fragment of the parent file" — using "fragment" in the ordinary
  English sense.
- It names no `fragments` key, no `ref`, and no workflow manifest.
- It sits 56 lines above the `<h2 id="fragments">` section at `:205` and links to nothing in it.
- `docs/orchestra-specification.md` is the same trap at scale: 12 of the surface's "fragment" mentions
  live there, and `:3` states that "The server implements a different shape, so nothing on this page
  describes a file the loader accepts", with `:5` sending an author to the schema guide instead.

### `site/specs/workflows.html:228`, the third `id="fragments"` anchor

CV15's mechanical analysis names two anchor sections and there are three.

- It is an `<h3 id="fragments">`, so a search for `<h2 id="fragments">` — the shape of the other two —
  misses it entirely.
- `:128` on the same page links to it with a bare `#fragments`, so the inbound link is same-page and
  invisible to a cross-page audit.
- `check-site-links` is hard-zero and repo-scoped (`scripts/guards.ts:307-313`), so a missed repoint is
  a red build rather than a soft warning.

### `schemas/technique.schema.json` — neither delete it nor auto-generate it

Stage 3 asks for a verifying variant of the generator, and the tidy move is to bring the sixth file
under it.

- It carries `$id` at `:2`, which no output of `scripts/generate-schemas.ts` can produce
  (`:20` never emits one), so it is provably not generator output.
- `TechniqueSchema` is not imported by the generator. Bringing it under one is a decision about which
  file is authoritative, not a build fix.
- 20 of its 33 descriptions have no counterpart in the Zod source, so regenerating it silently rewrites
  the technique field table published at `site/api/schemas.html:233-244` — and `tests/site.test.ts`
  will pass either way, because it grades the page against whatever the JSON says.

### `session-file` in `schemas/`

Six files and five ids look like an off-by-one to normalise, and normalising it the wrong way removes a
generated schema.

- `scripts/generate-schemas.ts:28` generates it, and my regeneration confirms the committed file is
  fresh.
- `SCHEMA_IDS` (`src/loaders/schema-loader.ts:16`) omits it, `readSchema` rejects any id outside that
  list (`:43-45`), and `registerSchemaResources` loops over `listSchemaIds()`
  (`src/resources/schema-resources.ts:20`) — so the gap is in the allowlist, not in the file.
- `schemas/README.md:16` documents it as a first-class schema; the fix is to add the id, not to drop
  the file (PD2).

### `meta/activities/patterns/` — the three surviving pattern activities

Nothing validates them, no workflow graph reaches them, and no producer index shows their inputs. All
three of those are their declared standing.

- `patterns/README.md:5` states the arrangement: "`loadActivitiesFromDir` is non-recursive — this
  subdirectory is library-only."
- `scripts/binding-fidelity-triage.json:5` states the policy: "having no consumer inside the corpus is
  the expected state of a library, not a broken seam."
- `:7` states the input half: a borrowable pattern activity's inputs are seeded by the *borrowing*
  workflow, so "the library home can never show one" — cited by two triage entries at `:320` and
  `:327`.
- `validate-activities.ts:110` is non-recursive by construction, so their absence from the 129 is the
  arrangement rather than a gap. The narrow real risk is that a stage-8 routine landing here is never
  schema-validated.

### The loop history event types and `activeLoops`

CV9 makes them look like dead surface to sweep out.

- Nothing writes them because iteration is the executing agent's job (`schemas/README.md:34`), so
  emptiness is the design and not a defect.
- Removing them has a one-way ordering: `npm run build:schemas` then `npm run build:site` in the same
  change, or `tests/site.test.ts:10-14` fails, because `renderSchemasRegion()` reads the committed JSON
  rather than the Zod source.
- No routines stage names them; the sweep enters CV9 with "Stage: none".
- If they go, `activeLoops` and its six site-rendered sub-fields
  (`site/api/schemas.html:191-197`) go with them, and that is a separate decision from four strings in
  an enum.

---

## What I looked for and did not find

**No exclusivity claim to falsify.** I repeated the sweep's search for a statement that a technique is
the *only* unit of reuse, or that a step sequence cannot be shared — the claim a routine would most
directly contradict. Nothing on point. The documentation describes what exists and never claims the set
is closed, which is why every candidate here is an enumeration going stale rather than a prohibition
being lifted.

**No loop-step field table on the generated site**, so the site cannot be stale about the loop's
twelve fields and also cannot correct `schemas/README.md`. I confirmed the mechanism: `paramRows`
(`scripts/generate-site-data.ts:498-516`) recurses only into `array` properties whose `items` carry
`properties`, and `steps[]` is an `array` whose `items` carry `anyOf`, so it renders as a type label
and no rows. `grep -n "continueWhile\|breakCondition" site/api/schemas.html` returns nothing.

**The unsettled reading, ruled on.** The sweep flags `tests/e2e/README.md:216-218` — "Step-unbound
(situational) checkpoints … none. Every checkpoint is an inline `kind: checkpoint` step at a concrete
position, so the robot reaches them all" — and asks a refuter to rule. **KEEP.** The claim is about
step-unboundness, and it survives materialisation on three independent grounds. The category is a
checkpoint not bound to a step, and a materialised routine step *is* at a concrete position in the
activity the loader hands downstream. The denominator is loader-derived and the same file says why
(`:106-112`: "The denominator comes from the **loader**, not from reading the YAML … a checkpoint may
arrive by fragment `ref`, which raw YAML shows as a step with no options at all"), so the sentence
already accommodates a form whose authored shape is not an inline body. And the word "inline" there
contrasts with the fragment `ref`, which is the contrast the same README draws twelve lines earlier. A
routine reference is a third authored form, so the word gains a case; the load-bearing claim does not
change. Not a twenty-second candidate.

**Two incidental defects, re-measured, and both have moved.** `docs/development.md:340` says the
binding-fidelity triage carries "69 verdicts"; `scripts/binding-fidelity-triage.json` holds **70**
entries at `c1c9682d`, not the 72 the sweep reports — the file lost 14 lines since the pin. Still
wrong, by one instead of three. `docs/development.md:316` names
`tests/identifier-qualification.test.ts` among the guards that also run as Vitest tests, and no such
file exists; the other five it names do. Neither is routines-related.

---

## Re-taking every figure

```bash
# revisions actually measured
git rev-parse HEAD && git -C workflows rev-parse HEAD

# CV1-CV5: the loop step, the field that fails the load, the field named nowhere in prose
sed -n '318,326p;371,386p;28,36p;161p' schemas/README.md
sed -n '73,78p;80,86p;148,172p' src/schema/activity.schema.ts
grep -rn "continueWhile" schemas/README.md docs/ site/ | wc -l    # 0
grep -rn "continueWhile" schemas/ | wc -l                          # 4, all generated
grep -rn "breakCondition" --include=*.yaml workflows/ | wc -l       # 0
sed -n '1,32p;96,104p' scripts/check-loop-shape.ts

# CV6-CV8
grep -n "A nested step list with an exit condition\|repeat nested steps\|while a condition holds" site/specs/workflows.html
sed -n '86p;137,138p' site/guide/definitions.html
sed -n '143p' docs/workflow-fidelity.md
grep -n "gated by <code>when</code> or <code>condition</code>" site/specs/state-management.html
sed -n '115,126p' src/utils/validation.ts

# CV9
grep -rn "loop_break" src/ schemas/ site/
grep -rn "activeLoops" src/ scripts/ tests/

# CV10, CV18
grep -rn "delivers the raw activity YAML verbatim" docs schemas site
grep -n "injectResolvedStepIds\|injectCheckpointFragmentBodies" src/tools/workflow-tools.ts
grep -rn "^\s*- technique:" --include=*.yaml workflows/ | wc -l     # 0
grep -rn "ref:" --include=*.yaml workflows/work-package/activities/  # the eight
grep -rn "replay key" docs schemas site                              # four, two generated

# CV11-CV14
sed -n '12,40p' workflows/README.md
grep -n "four file types\|Four kinds are in use today\|The four step kinds" site/specs/workflows.html
grep -n "^generate(" scripts/generate-schemas.ts && ls schemas/*.schema.json | wc -l

# CV15, CV16
grep -rn "fragments.checkpoints" docs schemas site      # 7
grep -n 'id="fragments"' site/specs/*.html              # three anchors
grep -rn "#fragments" site/ | grep -v 'id="fragments"'  # three inbound links
sed -n '29,42p' src/schema/workflow.schema.ts
sed -n '148,163p' scripts/check-checkpoint-presentation.ts
npx tsx scripts/check-site-links.ts

# CV19, CV20, PD10, PD11
ls workflows/work-package/activities/*.yaml | wc -l                       # 15
find workflows -path "*/activities/*.yaml" -print | wc -l                 # 132
npx tsx scripts/validate-activities.ts | tail -2                          # Total: 129 passed
ls workflows/meta/activities/patterns/
grep -rn "compose-worker-briefs" --include=*.yaml workflows/              # three sites, two files
grep -rn "dispatch_concurrency\|parallelism-is-optimisation" workflows/ src/ scripts/ tests/ docs/   # empty
git -C workflows show 131e2942:meta/techniques/orchestration-patterns/dispatch-workers.md | grep -n concurrency
sed -n '10,14p;28,34p' workflows/meta/techniques/orchestration-patterns/dispatch-workers.md

# CV21, PD1, PD2, PD5
head -6 schemas/technique.schema.json
grep -n "chaining skills\|Inputs the skill" schemas/technique.schema.json
sed -n '5,20p;42,48p' src/loaders/schema-loader.ts
sed -n '5,11p;18,22p;45,52p' src/resources/schema-resources.ts

# PD3, PD4
grep -rn "challenge_findings" --include=*.yaml workflows/ | wc -l    # 7
sed -n '170,192p' tests/e2e/option-coverage.test.ts

# no gate on the Zod-to-JSON link
grep -rn "build:schemas" .github/workflows/     # empty
sed -n '36,59p' tests/generated-schemas.test.ts
sed -n '1,15p' tests/site.test.ts
```

Four counts were taken with throwaway scripts whose rules are stated where they are used, so each is
re-derivable. The **17 closed-set step-kind enumerations** come from a regular expression over every
file under `docs/`, `schemas/`, `site/` and every `README.md` in the tree outside planning artifacts —
119 files — with HTML tags stripped, entities unescaped and backticks removed before matching, over
separators `/`, `,`, `|`, `and` and `or`, plus the literals "Four kinds", "four step kinds" and the
gloss "a technique step (binds an operation)". The **53 loop steps** and the **seven
`challenge_findings` writes** come from parsing every corpus YAML with a real YAML loader and reading
`variables.writes` and each step's `kind`, recursing into every nested `steps` list and into any inline
`activities[]`. The **20-of-33 technique-schema divergence** walks every `description` value in
`schemas/technique.schema.json` and looks for a whitespace- and backtick-normalised match among the
`.describe('…')` payloads in `src/schema/technique.schema.ts`. The **five FRESH schemas** come from
re-running the generator's five calls into a scratch directory and comparing each output byte for byte
against the committed file.
