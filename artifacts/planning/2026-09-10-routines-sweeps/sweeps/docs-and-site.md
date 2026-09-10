# The documentation says a loop's continuation test is called something else, and no stage of the routines plan opens a documentation file

Sweep of `docs/`, `schemas/`, `site/` and every `README.md` in the tree against the routines proposal
at [2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Companion to the three
ground-truth records in [../ground-truth/](../ground-truth/). Server tooling at `9ca71c19` on `main`;
corpus at `2b8b7215` on the `workflows` branch. Every figure below was taken from the repository, and
the command or the `file:line` that produced it sits beside it.

**What binds this surface together is that the design never looks at it.** The proposal's README and
its twelve companion records name no documentation file, no README, no site page and no schema
guide. `grep -rin "documentation\|the docs\|site page\|readme\|schema guide"` over
`.engineering/artifacts/planning/2026-09-03-routines/` returns **28** lines, and every one of them
refers to the proposal's own README or to a sibling record in the same folder. Read the nine stages'
acceptance criteria (README:820-960) and the same thing shows up positively: they name discovery
passes, generated schemas, substitution rules, guard columns, declaration counts, delivery baselines
and walks. One criterion in the whole plan mentions prose — stage 7's "every place claiming them
universally is updated with the change" (README:947-948), scoped to three named guarantees. So this
surface is out-of-list at every stage by construction, which is why the sweep had to be key-driven
rather than change-driven.

**The surface is 117 files:** `docs/` (15 markdown), `schemas/` (1 README plus 6 JSON schemas),
`site/` (23 files — 20 HTML, a README, `nav.js` and `style.css`), and the 72 remaining `README.md`
files in the tree. Counting the two that sit inside `schemas/` and `site/`, **74 READMEs are in
scope, 63 of them in the corpus.** Planning artifacts are excluded by `AP-129`'s own **Do not flag**
clause (`workflows/workflow-design/resources/anti-patterns.md:1703-1713`).

**Twenty-one candidates, across 19 files.** Nine are stale today: statements the loop-shape change of
stage 0 falsified, or that were already false when it landed. Twelve are falsified on landing. Each
candidate's own occurrence count is measured in its section below; the counts are stated per
candidate rather than summed, because three site lines carry two distinct defects each and a single
total would double-count them.

**Nineteen of the twenty-one sit wholly outside every file list the proposal's stages name.** Two are
partly inside, and both for the same reason: stage 3 has to open `scripts/generate-schemas.ts` and
regenerate `schemas/activity.schema.json` in order to add a member to the step union, so CV13 and
CV14 have a foot in its list — and the sentence CV14 is about is a hard-coded English string the
regeneration reproduces unchanged. At the file grain, **exactly two of the 19 files are ones some
stage must open**: `schemas/activity.schema.json` and, transitively, `site/api/schemas.html`. The
other **17 files** are opened by no stage of the plan.

One measurement frames the whole of population one. **`continueWhile` appears zero times in
`schemas/README.md`, zero times in all of `docs/`, and zero times in all of `site/`** —
`grep -rn "continueWhile" schemas/README.md docs/ site/ | wc -l` returns `0`. The field that decides
whether each of the corpus's 27 repeat-until loops goes round again
(`src/schema/activity.schema.ts:157`) is not named once in the schema guide, the architecture models,
or the published site. Four documents in this surface name `condition` in its place.

---

## Verdicts

| Id | Construct | Verdict | Stage | In the stage's file list? |
|---|---|---|---|---|
| CV1 | `schemas/README.md:383` — the loop-step field table's `condition` row, captioned "Continue condition (while/doWhile)" | STALE | 0 (landed) | No |
| CV2 | `schemas/README.md:385` — `breakCondition` as "Early exit condition (agent-evaluated each iteration)" | STALE | 0 (landed) | No |
| CV3 | `schemas/README.md:34` — the loop row of the enforcement-model table, agent-interpreted column | STALE | 0 (landed) | No |
| CV4 | `schemas/README.md:373` — "iterates over collections or while conditions hold ... (replacing the old separate `loops[]` array)" | STALE | 0 (landed) | No |
| CV5 | `schemas/README.md:318-326` — "Shared base fields on every kind", listing `condition` | STALE | 0 (landed) | No |
| CV6 | `site/specs/workflows.html:339` — loop as "a nested step list with an exit condition" | STALE | 0 (landed) | No |
| CV7 | `site/guide/definitions.html:86` and `:138` — loop "repeats nested steps until a condition clears" | STALE | 0 (landed) | No |
| CV8 | `docs/workflow-fidelity.md:143` and `site/specs/state-management.html:129` — the manifest gate set as `when` or `condition` | STALE | 0 (landed) | No |
| CV9 | `loop_break` published as session-history API surface at 6 sites | STALE | none | No |
| CV10 | `schemas/README.md:22` — "`get_activity` delivers the raw activity YAML verbatim" | NARROWS | 3 | No |
| CV11 | `workflows/README.md:27-39` — the per-workflow directory tree, four children | NARROWS | 3 / 4 | No |
| CV12 | `site/specs/workflows.html:84,90-102,116` — "the four file types in a workflow directory" | NARROWS | 3 / 4 | No |
| CV13 | The closed four-kind step set, 17 enumerations in 5 files | NARROWS | 3 | Only `schemas/activity.schema.json:4` |
| CV14 | `scripts/generate-schemas.ts:29` — the step-kind set hard-coded in the generator's description literal | NARROWS | 3 | Yes (the script), No (its wording) |
| CV15 | The checkpoint-fragment mechanism documented as the home for a shared gate body — 14 sites in 8 files | REMOVE | 5 | No |
| CV16 | `fragments.rules` and `{ ref }` in rules slots — 5 statements at 3 sites | STALE | 5 | No |
| CV17 | `site/design/request-lifecycle.html:124` and `:127` — what the loader does between parse and derivation | NARROWS | 3 | No |
| CV18 | `schemas/README.md:339` and `:623` — the checkpoint replay key composed from the id as written | NARROWS | 3 | No |
| CV19 | `workflows/work-package/activities/README.md:5` — the activity's definition lives in its own `NN-<id>.yaml` | NARROWS | 5 / 6 | No |
| CV20 | `workflows/meta/activities/patterns/README.md:40` and `:72` — "copy the step pipeline into a local activity" | NARROWS | 8 | No |
| CV21 | `schemas/technique.schema.json` described as generated, with no generator | KEEP | none | No |

The nineteen files, with the candidates each carries, so a refuter can go file by file:

| File | Candidates | Hand or generated |
|---|---|---|
| `schemas/README.md` | CV1, CV2, CV3, CV4, CV5, CV9, CV10, CV13, CV15, CV16, CV18 — **11 of the 21** | hand |
| `site/specs/workflows.html` | CV6, CV12, CV13, CV15, CV16 | hand |
| `site/api/schemas.html` | CV9, CV13, CV15, CV21 | generated |
| `schemas/activity.schema.json` | CV13, CV14, CV15 | generated |
| `site/specs/resource-resolution.html` | CV15, CV16 | hand |
| `site/guide/definitions.html` | CV7, CV13 | hand |
| `docs/checkpoint-model.md` | CV15 | hand |
| `docs/workflow-fidelity.md` | CV8 | hand |
| `site/specs/state-management.html` | CV8 | hand |
| `site/specs/checkpoints.html` | CV15 | hand |
| `site/design/request-lifecycle.html` | CV17 | hand |
| `schemas/workflow.schema.json` | CV15 | generated |
| `schemas/state.schema.json` | CV9 | generated |
| `schemas/session-file.schema.json` | CV9 | generated |
| `schemas/technique.schema.json` | CV21 | **neither — no generator found** |
| `scripts/generate-schemas.ts` | CV14 | hand (a generator) |
| `docs/documentation-system.md` | CV21 | hand |
| `docs/technique-protocol-specification.md` | CV21 | hand |
| `workflows/README.md` | CV11 | hand |
| `workflows/work-package/activities/README.md` | CV19 | hand |
| `workflows/meta/activities/patterns/README.md` | CV20 | hand |

That is 21 rows for 19 files plus two entries outside the swept surface —
`scripts/generate-schemas.ts`, which is a generator rather than documentation, and
`schemas/technique.schema.json`, which is the artifact CV21 is about. `schemas/README.md` alone
carries eleven of the twenty-one candidates, and it is the document the schema guide table at
`docs/documentation-system.md:33` names as the authoritative "Schema guide for authoring workflow
definitions".

---

## Population one — stale today

### CV1 · The loop-step field table names the field that fails the load and omits the one that carries the test

`schemas/README.md:371-386` is the reader's reference for the loop step. Its table has ten rows.
Row seven, at `schemas/README.md:383`:

> | `condition` | Condition | Continue condition (while/doWhile) |

**What makes it false.** `LoopStepSchema` (`src/schema/activity.schema.ts:152-164`) spreads
`stepCommonFields` alone at `:163` and closes with `.strict()` at `:164`. The structured entry gate
lives in a separate spread, `stepEntryCondition` (`src/schema/activity.schema.ts:84-86`), taken by
the technique step (`:101`), the action step (`:110`) and the checkpoint step (`:140`) and by no
loop. The comment above the spread states the rule outright (`:80-83`): a loop is the exception,
`when` decides whether it is entered and `continueWhile` whether it goes round again. So `condition`
on a loop step is a load error, not a deprecated field. The generated pair agrees: the loop member
of `steps[].anyOf` in `schemas/activity.schema.json` carries twelve property names under
`additionalProperties: false`, and `condition` is not among them.

The same table omits `continueWhile`, `when` and `required`, so ten documented fields stand against
twelve declared ones with one documented field that does not exist.

**Measured references.** The label string occurs once in this surface —
`schemas/README.md:383` — and once more in the corpus's construct-choice table at
`workflows/workflow-design/resources/schema-construct-inventory.md:47`, which is another sweep's
ground. `continueWhile` occurs **zero** times in `schemas/README.md`. Zero of the corpus's 54 loop
steps carry `condition` (measured in
[stage-0-state.md](../ground-truth/stage-0-state.md), section four).

**What breaks if it is removed at the wrong time.** Nothing mechanical. No guard reads
`schemas/README.md`, and `tests/docs-drift.test.ts` does not cover `schemas/` at all — its
`PRODUCT_GLOBS` list (`tests/docs-drift.test.ts:12-24`) names `docs`, `site`,
`examples/cursor-workspace`, three rule directories and `scripts/generate-site-data.ts`, and not
`schemas/`. The cost of leaving it is that an author consulting the authoritative schema guide
writes a field that fails the load, and the error message will name a closed object rather than the
guide.

```bash
sed -n '371,386p' schemas/README.md
sed -n '80,86p;152,164p' src/schema/activity.schema.ts
grep -c "continueWhile" schemas/README.md   # 0
```

### CV2 · breakCondition is described as a general per-iteration early exit and is scoped to item iteration

`schemas/README.md:385`:

> | `breakCondition` | Condition | Early exit condition (agent-evaluated each iteration) |

**What makes it false.** The field's declared scope is item iteration.
`src/schema/activity.schema.ts:160` reads "Early exit from item iteration, evaluated by the executing
agent before each item: iteration stops when it holds. A repeat-until loop states its stopping
condition in `continueWhile` instead." `scripts/check-loop-shape.ts:96-104` raises
`repeat-loop-with-break` when a `while` or `doWhile` declares one. "each iteration" reads as any
loop of any shape; on two of the three shapes the field is a guard finding.

**Measured references.** One occurrence of the label in this surface. Corpus-wide the field has
**zero** binding sites: `grep -rn breakCondition --include=*.yaml workflows/` returns nothing.
Eleven of its thirteen repository occurrences are code or schema declarations and two are prose
(counted in [stage-0-state.md](../ground-truth/stage-0-state.md), section one).

**What breaks if it is removed at the wrong time.** Nothing. It documents a construct with no
subject. Correcting the row costs one line; deleting the row would put the guide out of step with a
field the schema still declares.

### CV3 · The enforcement model's loop row omits the only loop field an agent evaluates

`schemas/README.md:28-36` is the table that tells a reader which fields the server enforces, which
are advisory, and which the executing agent carries. Its loop row, `schemas/README.md:34`,
agent-interpreted column:

> `loopType` semantics, `variable` / `over`, `breakCondition`, `maxIterations` — iteration is
> executed and bounded entirely by the agent

**What makes it false.** The sentence is right about the division of labour and wrong about the
inventory. `continueWhile` is the field the agent evaluates on every pass
(`src/schema/activity.schema.ts:157`: "Evaluated by the executing agent; `loopType` says when it is
taken"), and it is absent from a row whose whole purpose is to enumerate what the agent carries.
`breakCondition`, which is present, is bound nowhere in the corpus. The row therefore lists a field
with zero sites and omits the one carried by all 27 repeat-until loops.

**Measured references.** One occurrence. Two sibling spellings of the same omission live outside
this surface at `.engineering/artifacts/comprehension/orchestration.md:132` and `:156` and
`.engineering/artifacts/comprehension/zod-schemas.md:71`.

**What breaks if it is removed at the wrong time.** Nothing mechanical. This is the more serious of
the two `schemas/README.md` omissions, because the row is the reader's map of what the engine
enforces versus what an agent interprets, and stage 3's whole delivery argument turns on that
division.

### CV4 · The loop step's opening sentence inverts the polarity and narrates its own history

`schemas/README.md:373`:

> A `kind: loop` step is a compound step that iterates over collections or while conditions hold,
> with a nested `steps[]` body (replacing the old separate `loops[]` array).

**What makes it false.** Two things. "while conditions hold" is the right polarity in the abstract
but names no field, so it points at nothing an author can write, and the table below it then supplies
`condition` as the field (CV1). And the parenthesis is a change narration of the kind the
repository's own style mandate forbids — "Describe the design, not the change to it" — whose
referent, `loops[]`, exists nowhere in `src/` except in another change narration. The same paragraph
shape recurs at `schemas/README.md:330` for the checkpoint step: "replacing the old separate
`checkpoints[]` array and the `step.checkpoint` reference".

**Measured references.** `grep -n "replacing the old" schemas/README.md` returns two lines, 373 and
330. `grep -rn "loops\[\]\|checkpoints\[\]" src/` returns exactly one line, and it is the same
sentence in the Zod source — `src/schema/activity.schema.ts:297-298`, "Checkpoints are inline
kind:checkpoint steps and loops are compound kind:loop steps: there are no separate
checkpoints[]/loops[] arrays in the unified model." So the retired construct survives in three
places, all of them describing its retirement, and in no place describing the system.

**What breaks if it is removed at the wrong time.** Nothing. Recorded here because stage 3 adds a
fifth step kind, and a file that already carries two dead before-states will accrete a third if the
habit is not corrected in the same pass.

### CV5 · A table titled "Shared base fields on every kind" lists a field three of the four kinds carry

`schemas/README.md:318-326`. The heading is "Shared base fields on every kind"; the table's fourth
row, `schemas/README.md:325`:

> | `condition` | Condition | Structured gate (legacy compat); if false, step is skipped.
> Agent-evaluated. On a checkpoint step, `condition` (not `when`) is what enables
> `condition_not_met` dismissal |

**What makes it false.** `stepCommonFields` (`src/schema/activity.schema.ts:73-78`) holds exactly two
fields, `when` and `required`. `condition` is a separate spread (`:84-86`) that the loop step does not
take. So the shared base is two fields, not five, and the table's `condition` row is true of three
kinds out of four. The row carries a careful caveat about checkpoint dismissal and no caveat about
the one kind that refuses the field.

**Measured references.** One occurrence. This claim is **not on the key list** in
[stage-0-state.md](../ground-truth/stage-0-state.md) section six — that list keyed on the loop-field
table's phrasings, and this row sits eleven lines above the loop section under a different heading.
It is the fifth stale loop claim in `schemas/README.md` and the one a key-driven sweep of the
recorded keys would have missed.

**What breaks if it is removed at the wrong time.** Nothing mechanical. Worth carrying because
stage 3's routine reference step is a new kind whose gate set has to be stated, and this is the table
where a reader will look for it.

### CV6 · The site's step-kinds table inverts the loop's polarity, fourteen lines after its own diagram gets it right

`site/specs/workflows.html:339`, the loop row of the step-kinds table:

> | `loop` | A nested step list with an exit condition | Repeat the nested steps until the condition
> is satisfied or the loop declares completion |

**What makes it false.** Three separate errors in one row. `continueWhile` is a *continuation* test —
"the body runs again while this holds" (`src/schema/activity.schema.ts:157`) — so "an exit condition"
and "until the condition is satisfied" both invert it. No field is named, so a reader cannot act on
the row. And "the loop declares completion" has no referent anywhere in the schema: there is no
field, no action verb and no history event by which a loop declares its own completion. The four
loop history event types (`src/schema/state.schema.ts:13`) have no writer at all (CV9).

The page contradicts itself at close range. Its own hand-authored SVG, at
`site/specs/workflows.html:324-325`, reads "repeat nested steps / while a condition holds" — the
correct polarity, fourteen lines above the table that inverts it.

**Measured references.** Two key strings, both on line 339, and one each. The sibling claim is at
`site/guide/definitions.html:138` (CV7).

**What breaks if it is removed at the wrong time.** Correcting the table text breaks nothing:
`scripts/check-site-links.ts` grades hrefs and fragment ids, and `scripts/check-svg-layout.ts` grades
text geometry inside SVG elements. The table is plain HTML in the hand-authored region — this page
has no `BEGIN GENERATED ... CONTENT` markers, only NAV, BREADCRUMB and PAGINATION — so a text edit
needs no regeneration. Correcting the *SVG* would need `npm run check:svg` to pass afterwards.

```bash
sed -n '302,342p' site/specs/workflows.html
grep -n "BEGIN GENERATED\|END GENERATED" site/specs/workflows.html
```

### CV7 · The guide defines a loop by an exit condition, in the glossary row and in the body

Two statements on one page.

`site/guide/definitions.html:86`, the glossary index row:

> | **Loop** | A step that repeats nested steps until a condition clears |

`site/guide/definitions.html:138`, the entry itself:

> A **loop** is a step kind that repeats a nested list of steps until a condition is satisfied or the
> loop declares completion.

**What makes it false.** Same inversion as CV6, in the document a newcomer reads first. "Until a
condition clears" is the negation of "while this holds", and "the loop declares completion" again has
no referent.

**Measured references.** Two occurrences, both on this page, one key each.

**What breaks if it is removed at the wrong time.** Nothing. The glossary row's `#loop` anchor and
the `../specs/workflows.html#step-kinds` link on line 138 both have to survive an edit, or
`npm run check:site` reports a dead fragment — `scripts/check-site-links.ts:4-8` states that it
verifies "every fragment points at an existing element id in its target page", and it is a hard-zero
repo-scoped guard.

### CV8 · The manifest gate set is stated as two gates and the validator reads three

Two statements, one in `docs/`, one on the site.

`docs/workflow-fidelity.md:143`:

> **Gated and loop-body steps:** a step gated by `when` or `condition` may be omitted from the
> manifest — the agent evaluated the gate and skipped the step.

`site/specs/state-management.html:129`:

> Steps gated by `when` or `condition` may be omitted; loop-body step ids are accepted but never
> required.

**What makes it false.** The validator these two sentences describe reads a loop's continuation test
as the gate that makes its steps optional. `src/utils/validation.ts:121-125`:

```ts
const requiredIds = inSequence
  .filter(s => s.when === undefined
    && (s.kind === 'loop' ? s.continueWhile === undefined : s.condition === undefined))
```

with the comment directly above it (`:118-120`) saying so: "A loop's continuation test decides the
same thing for its body, so a loop carrying one is gated too." So the gate set is three fields, and
a repeat-until loop is omissible from a manifest for a reason neither sentence gives.

**Measured references.** **Three non-planning occurrences of this key, not two.** The key list at
[stage-0-state.md:473](../ground-truth/stage-0-state.md) records two — `docs/workflow-fidelity.md:143`
and `workflows/workflow-design/resources/anti-patterns.md:1697` — plus three planning artifacts, for
five. My count is eight total, three of them non-planning: the two the record names plus
`site/specs/state-management.html:129`. The record's key was the markdown-backticked form; the site
writes the identical claim as `<code>when</code> or <code>condition</code>`, which a markdown grep
cannot see. Reproduce by normalising the HTML before matching:

```bash
# the recorded key, markdown spelling only
grep -rn "gated by .when. or .condition." docs/ workflows/ | wc -l
# the site's spelling
grep -n "gated by <code>when</code> or <code>condition</code>" site/specs/state-management.html
```

**What breaks if it is removed at the wrong time.** Nothing mechanical, and the omission matters more
than it looks: `docs/workflow-fidelity.md` is the specification the fidelity layer is graded against,
and a reader deciding whether a missing loop-body step is a warning has been given the wrong field
set to reason from.

### CV9 · Four loop history event types are published as API surface and nothing writes them

`loop_break` — with `loop_started`, `loop_iteration` and `loop_completed` — is declared at
`src/schema/state.schema.ts:13` and reaches this surface at six places:

| Site | Kind | What regenerates it |
|---|---|---|
| `schemas/state.schema.json:163` | generated | `npm run build:schemas` → `scripts/generate-schemas.ts:26` |
| `schemas/session-file.schema.json:196` | generated | `npm run build:schemas` → `scripts/generate-schemas.ts:28` |
| `schemas/README.md:979` | hand-authored | nothing |
| `site/api/schemas.html:142` | generated | `npm run build:site` → `scripts/generate-site-data.ts:690-733`, reading `schemas/state.schema.json` |
| `site/api/schemas.html:201` | generated | same, reading `schemas/session-file.schema.json` |
| `src/schema/state.schema.ts:13` | source | — |

**What makes it false.** Nothing in the enumeration is wrong about the schema; what is false is the
implication that a session history contains these events. No code path emits one. A grep for all four
names plus `activeLoops` across `src`, `scripts` and `tests` returns only the declarations and two
sites initialising `activeLoops` to `[]` (`src/schema/state.schema.ts:217`,
`scripts/generate-session-token.ts:177`) — measured in
[stage-0-state.md](../ground-truth/stage-0-state.md), section two. Iteration is the agent's job, so
this is consistent with the design; the defect is that the published state schema and the site's
schema reference offer four event types a client can filter on and never receive, and `loop_break` in
particular is the runtime half of a field bound at zero corpus sites.

**Measured references.** Six non-planning occurrences. The key list at
[stage-0-state.md:429](../ground-truth/stage-0-state.md) records seven, of which one was a planning
artifact; the non-planning six reproduce exactly.

**What breaks if it is removed at the wrong time.** Removing the event types from
`src/schema/state.schema.ts:13` needs `npm run build:schemas` and then `npm run build:site` in the
same change, or `tests/site.test.ts:10-13` fails — it compares each committed page against a fresh
`renderSitePages()`. The ordering is one-way: regenerating the JSON without regenerating the site
fails the site test, and regenerating neither fails nothing at all, because
`renderSchemasRegion()` reads the committed JSON rather than the Zod source. No test pins the four
names — neither the session tests nor the walker reference them. Verdict STALE rather than REMOVE:
this comes out at no routines stage, and the sweep surfaces it because it is the same vocabulary.

---

## Population two — falsified on landing

### CV10 · The schema guide says get_activity delivers the raw activity YAML verbatim

`schemas/README.md:22`, the sentence that frames the whole enforcement-model table:

> `get_activity` delivers the raw activity YAML verbatim, so every authored field reaches the agent
> — the classification below states what the **server** does with each field

**What makes it false, and when.** Stage 3 makes it false wholesale: materialisation splices a
routine's steps into the host activity under prefixed identifiers before delivery, so the delivered
text is not any file on disk and the identifiers in it were written by the loader. The proposal's own
criterion says so — "The textual splicer emits an explicit prefixed `id:` on every step it splices"
(README:857-859) — and its byte-identity criterion is scoped precisely to activities that carry no
routine: "Delivery is byte-identical for every activity that carries no routine" (README:863).

It is **already false today** at eight sites. `src/tools/workflow-tools.ts:1398-1410` runs
`injectResolvedStepIds(rawActivity)` and then, when the textual pre-scan finds any,
`injectCheckpointFragmentBodies`. `src/schema/activity.schema.ts:234-243` inserts a derived `id:`
line ahead of every `- technique:` opener, and `src/loaders/fragment-resolver.ts:190-209` replaces
each standalone `ref:` line with the serialised fragment body. The eight fragment reference sites
(four in each of two fragments, all inside `work-package`, tabulated in
[fragment-mechanism.md](../ground-truth/fragment-mechanism.md) section one) therefore receive text
that differs from the authored file by an entire checkpoint body.

**Measured references.** One occurrence of the sentence:
`grep -rn "delivers the raw activity YAML verbatim" docs schemas site` returns exactly
`schemas/README.md:22`. The rewriting call sites are two:
`grep -n "injectResolvedStepIds\|injectCheckpointFragmentBodies" src/tools/workflow-tools.ts`
returns `:1399` and `:1408`.

**What breaks if it is removed at the wrong time.** Nothing mechanical. Correcting it early is
strictly better than late: the sentence is the premise a reader uses to decide that everything below
it is an agent's job, and stage 3 changes what the server does to the text without changing that
table's contents at all.

### CV11 · The corpus's own directory map has four children under a workflow and routines is a fifth

`workflows/README.md:27-39`, the per-workflow branch of the "Directory Structure" fenced tree:

```
├── {workflow-id}/                # Each workflow folder
│   ├── README.md                 # Workflow documentation with Mermaid diagrams
│   ├── workflow.yaml             # Workflow definition
│   ├── activities/               # Activity subdirectory (indexed)
│   ├── techniques/               # Workflow-local markdown techniques
│   └── resources/                # Workflow-local markdown resources
```

**What makes it false, and when.** Stage 3 puts a routine at `<workflow>/routines/<name>.yaml` with
its own discovery pass (README:840-842). The tree becomes wrong at that moment, in the file a
first-time corpus author reads to learn where things go. `find workflows -maxdepth 2 -type d -name
routines` prints nothing today, so the tree is accurate as it stands.

**Measured references.** One tree, two branches — `meta/` at lines 14-26 and `{workflow-id}/` at
27-39 — naming the same three subdirectories in each. `grep -c "resources/" workflows/README.md`
returns 7, so the layout is restated across the file rather than declared once.

**What breaks if it is removed at the wrong time.** Nothing mechanical — `check:resource-anchors`
walks every `.md` and `.yaml` under the corpus root and grades relative `.md#anchor` links and fence
closure (`scripts/check-resource-anchors.ts:4-7`, `:72-79`), so an added tree row is invisible to it
as long as the fence closes. Out of every stage's list: the corpus changes stage 5 names are four
activity files and one `workflow.yaml`
([guard-obligations.md](../ground-truth/guard-obligations.md), class (b)), and no stage names
`workflows/README.md`.

### CV12 · The site says a workflow directory holds four file types, in prose, in a diagram, and in a caption

`site/specs/workflows.html`, three coupled statements:

- `:84`, the SVG's accessible description: "A workflow directory contains a manifest, activity files,
  technique markdown files, and resource markdown files."
- `:90-102`, four `<rect>` and eight `<text>` elements: `workflow.yaml` / `activities/*.yaml` /
  `techniques/*.md` / `resources/*.md`.
- `:116`, the figcaption: "The four file types in a workflow directory and how they reference each
  other."

**What makes it false, and when.** Stage 3. A routine file is a fifth type, and it sits between the
activity and the technique in the reference chain the diagram draws — an activity references a
routine, a routine references techniques and other routines (README:1-40). The diagram's three
arrows (`:104-108`) encode "lists → bind → refs", a chain a routine inserts itself into.

**Measured references.** Three statements on one page, plus `workflows/README.md`'s tree (CV11)
stating the same closed set on the corpus side. `grep -n "four file types" site/` returns one line.

**What breaks if it is removed at the wrong time.** This is the one candidate with a real mechanical
cost. The SVG is hand-authored and graded by `scripts/check-svg-layout.ts`, a hard-zero repo-scoped
guard that reports a text element crossing a rect border, intersecting an arrow, overlapping sibling
text, or escaping the `viewBox` (`scripts/check-svg-layout.ts:2-10`). The figure's `viewBox` is
`0 0 960 200` and the four rects already span x=10 to x=950 (`site/specs/workflows.html:82`, `:91`,
`:100`). A fifth box needs the whole row re-laid out and `npm run check:svg` re-run. Adding it late,
after the construct has landed, means the site is wrong for the whole interval; adding it early means
documenting a directory that does not exist yet.

### CV13 · The four-kind step set is stated 17 times across five files in this surface

Stage 3 adds a `routine` member to `StepSchema`, which today is a four-member discriminated union
(`src/schema/activity.schema.ts:167-172`). Every closed enumeration of those four becomes wrong.
Measured across the sweep surface by a regular expression over tag-stripped, backtick-stripped lines:

| File | Occurrences | Lines | Hand or generated |
|---|---|---|---|
| `schemas/README.md` | 8 | 46, 83, 100, 299, 322, 560, 1122, 1153 | hand |
| `site/specs/workflows.html` | 4 | 303, 307, 308, 329 | hand |
| `site/api/schemas.html` | 3 | 77, 91, 283 | **generated** |
| `schemas/activity.schema.json` | 1 | 4 | **generated** |
| `site/guide/definitions.html` | 1 | 167 | hand |
| **Total** | **17** | | 13 hand, 4 generated |

`site/specs/workflows.html:116` ("four file types") is counted under CV12 instead, so the script's
18 hits split 17 step-kind plus 1 directory.

Three of these deserve naming individually because they are the load-bearing ones.

`schemas/README.md:46` states it as prose with a gloss per kind:

> Each activity contains a single ordered `steps[]` where every step carries a `kind`: a technique
> step (binds an operation), an action step (control-only), a checkpoint step (an inline user
> decision point at its concrete position), or a loop step (a compound step whose body is a nested
> `steps[]`).

The checkpoint gloss — "at its concrete position" — is the one stage 3 strains hardest: a checkpoint
declared in a routine body has no concrete position in any activity file, only in the materialised
result. `schemas/README.md:311-316` restates the same four with the same glosses as a bullet list,
opening "Every step carries a required `kind` discriminator that selects its shape."

`site/specs/workflows.html:303`: "Four kinds are in use today." That is the most honest of the
seventeen — "today" is doing real work — and it is still a count that goes to five.

`schemas/README.md:100` is inside a mermaid diagram:
`S["steps[] (kind: technique|action|checkpoint|loop)"]`, with sibling nodes for the checkpoint and
loop steps at `:101-102`. A routine node belongs beside them.

**What breaks if any is removed at the wrong time.** For the 13 hand-authored ones, nothing. For the
four generated ones, see CV14 — and note that two of the three site occurrences self-heal.
`site/api/schemas.html:91` and `:283` render the type label `(technique | action | checkpoint |
loop)[]`, which `variantLabel` in `scripts/generate-site-data.ts:493-496` derives by reading each
`anyOf` variant's `kind.const`. Add a fifth member and regenerate, and the label becomes
`(technique | action | checkpoint | loop | routine)[]` without anyone editing prose. The remaining
generated pair does not self-heal, which is CV14.

```bash
# reproduce the 17 (the script strips HTML tags and backticks before matching)
grep -rn "technique / action / checkpoint / loop" schemas/ site/ docs/
grep -rn "technique | action | checkpoint | loop" schemas/ site/ docs/
grep -n "Four kinds are in use today\|four step kinds" site/specs/workflows.html
grep -n "z.discriminatedUnion" -A 6 src/schema/activity.schema.ts
```

### CV14 · The step-kind set is hard-coded in the schema generator's own description string

`scripts/generate-schemas.ts:29`:

```ts
generate(ActivitySchema, 'activity', 'Activity definition schema — unified ordered, kind-tagged steps[] (technique | action | checkpoint | loop).', 'root');
```

That literal is written into `schemas/activity.schema.json:4` as the schema's top-level
`description`, and `renderSchemasRegion()` reads it back out and renders it at
`site/api/schemas.html:77` as the section's `schema-summary`
(`scripts/generate-site-data.ts:694`, `:700`). A second, independent chain runs from
`src/schema/activity.schema.ts:299` — `.describe('Ordered, kind-tagged execution steps for this
activity')` — into `schemas/activity.schema.json:579` and `schemas/workflow.schema.json:783`, and
onto `site/api/schemas.html:91` and `:283`. The same four-kind sentence also lives at
`src/resources/schema-resources.ts:7`, which is the description of the
`workflow-server://schemas/activity` MCP resource and therefore reaches agents rather than readers.

**What makes it false, and when.** Stage 3. And the failure mode is specific: regenerating after
adding the union member fixes the *type labels* and leaves the *sentence* intact, because a
hard-coded English string is not derived from anything. So a stage-3 author who runs
`npm run build:schemas && npm run build:site` and checks the diff will see the labels update and may
read that as the whole of the propagation.

**Measured references.** One literal in the generator; one occurrence in each of two generated files
downstream of it; one further hard-coded sentence in `src/resources/schema-resources.ts:7`. There are
**five** `generate(...)` calls (`scripts/generate-schemas.ts:25-29`), one per generated schema, and
each carries a hand-written description of the same kind.

**What breaks if it is removed at the wrong time.** The generator is in stage 3's list — its own
criterion is "`routines/` has its own generated JSON schema, and the schema generator has a verifying
variant" (README:840-842) — but the *wording* is not, and nothing checks it. See CV21 and the
generated-artifact section below for why an unverified generator makes this durable.

### CV15 · The checkpoint-fragment mechanism is documented as the home for a shared gate body, at 14 sites in 8 files

Stage 5 retires the mechanism: "The `fragments` block is gone from `work-package/workflow.yaml`,
seven fragment rules are deleted, and `duplicate-checkpoint` keeps its rule with its remedy naming a
routine" (README:884-886). Every description of it in this surface goes with it. Measured:

| Site | What it is | Hand or generated |
|---|---|---|
| `docs/checkpoint-model.md:113` | the `ref` row of the checkpoint field table | hand |
| `docs/checkpoint-model.md:116` | the paragraph: "A checkpoint used at several sites is declared once as a fragment under `fragments.checkpoints` …" | hand |
| `site/specs/checkpoints.html:195-196` | a whole `<h2 id="fragments">Shared checkpoint fragments</h2>` section | hand |
| `site/specs/resource-resolution.html:205-211` | a whole `<h2 id="fragments">Workflow fragments</h2>` section, 3 paragraphs and a 2-item list | hand |
| `site/specs/workflows.html:128` | the `workflow.yaml` key bullet: "**Fragments** — shared rule texts and checkpoint bodies" | hand |
| `site/specs/workflows.html:229` | the fragments paragraph, plus links into the two sections above | hand |
| `schemas/README.md:279` | the `fragments` row of the workflow field table | hand |
| `schemas/README.md:332-335` | "A checkpoint step is authored in exactly one of two forms" — inline, or by reference | hand |
| `schemas/README.md:341` | the `ref` row of the checkpoint field table | hand |
| `schemas/README.md:500` | the `fragments` row of the second workflow field table | hand |
| `schemas/activity.schema.json:439` | the `ref` field description | **generated** |
| `schemas/workflow.schema.json:68-229` | the whole `fragments` property subtree, including the shared-condition description at `:229` | **generated** |
| `schemas/workflow.schema.json:674` | the `ref` field description, inline copy | **generated** |
| `site/api/schemas.html:264` | the workflow `fragments` row, rendered from `schemas/workflow.schema.json` | **generated** |

Ten hand-authored, four generated. Two of the hand-authored ones are entire document sections rather
than sentences.

**What makes it false, and when.** Stage 5, all fourteen at once. Two of the four generated ones
disappear by construction, since deleting `WorkflowFragmentsSchema` (`src/schema/workflow.schema.ts:40-42`)
and the `ref` field (`src/schema/activity.schema.ts:134`) removes them from the regenerated JSON and
therefore from the site row.

**Measured references.** `grep -rn "fragments.checkpoints" docs schemas site` returns 7 lines; adding
the bare-`fragments` descriptions and the two section headings gives the 14 above. Corpus-side the
mechanism is one declaration spanning `workflows/work-package/workflow.yaml:15-71` and eight
reference sites, measured in
[fragment-mechanism.md](../ground-truth/fragment-mechanism.md) section one.

**What breaks if it is removed at the wrong time.** This one has a hard mechanical coupling, and it
is the reason to sequence rather than sweep. `site/specs/workflows.html:229` links to
`./resource-resolution.html#fragments` and `./checkpoints.html#fragments`. Delete either `<h2
id="fragments">` section without repointing that sentence and `scripts/check-site-links.ts` reports a
fragment naming no element id — a hard-zero, repo-scoped guard (`scripts/check-site-links.ts:2-8`;
`scope: 'repo'` per [guard-obligations.md](../ground-truth/guard-obligations.md)). Because it is
repo-scoped and stage 5 is a **corpus** pull request,
`workflows/.github/workflows/verify-corpus.yml:70` runs `npm run check:all` against `main`'s files
rather than the corpus — so the breakage surfaces on the next server pull request, not on the one
that caused it. The three site sections and the one sentence linking them have to move in a single
`main`-side change.

```bash
grep -rn "resource-resolution.html#fragments\|checkpoints.html#fragments" site/ docs/
grep -n 'id="fragments"' site/specs/resource-resolution.html site/specs/checkpoints.html
npx tsx scripts/check-site-links.ts
```

### CV16 · The site documents a rules half of the fragment mechanism that the schema does not admit

Five statements at three sites, all describing shared rule texts imported by reference.

`site/specs/resource-resolution.html:208`:

> **`fragments.rules`** — shared rule texts; rules slots accept either a rule string or
> `{ ref: "[workflow::]name" }`

`site/specs/workflows.html:128`:

> **Fragments** — shared rule texts and checkpoint bodies, imported by `{ ref }` from rules slots and
> checkpoint steps

`site/specs/workflows.html:229`:

> Rule texts and checkpoint bodies reused at several sites are declared once under `fragments` in
> `workflow.yaml` … Rules slots and `kind:checkpoint` steps carry the ref

`schemas/README.md:499`, the workflow `rules` row:

> `{ workflow?, activity?, universal?: (string \| { ref })[] }` … Entries are rule strings or
> `{ ref }` fragment imports

`site/specs/resource-resolution.html:211` then generalises: "The loader materializes refs at load and
delivery time" — covering both halves.

**What makes it false.** `WorkflowFragmentsSchema` (`src/schema/workflow.schema.ts:40-42`) declares
**one** key, `checkpoints`, and closes with `.strict()`. So `fragments.rules` is a load error.
`WorkflowRulesSchema` (`src/schema/workflow.schema.ts:29-33`) declares its three buckets as
`z.array(z.string())` — plain strings, no union with a ref object — so a `{ ref }` in a rules slot is
a load error too. This is **false today**, before any routines stage.

The generated JSON agrees and is the cleanest proof: `schemas/workflow.schema.json:68` opens the
`fragments` property and its only child is `checkpoints`. The generated site row at
`site/api/schemas.html:264` describes `fragments` as "Shared checkpoint bodies" with no mention of
rules — so the generated half of the site is correct and the hand-authored half is not, on the same
site, three clicks apart.

**Measured references.** 5 statements at 3 sites in this surface.
`grep -rn "fragments.rules" docs schemas site` returns one line
(`site/specs/resource-resolution.html:208`); the other four use the bare word. Outside this surface
the token appears at `scripts/check-checkpoint-presentation.ts:23` and `:157` and
`tests/checkpoint-presentation-guard.test.ts:61`, where it is a scan target the guard reads
defensively, not a claim.

**What breaks if it is removed at the wrong time.** Nothing, and it should be corrected now rather
than at stage 5, because a reader who tries the documented form gets a `.strict()` failure naming a
closed object. Verdict STALE with stage 5 attached: the sentences come out with the mechanism anyway,
so a stage-5 author who deletes the fragment sections deletes this by accident — which is why it is
worth recording that it is already wrong, and why deleting is the right disposition rather than
fixing.

### CV17 · The load pipeline is documented step by step, and stage 3 inserts a pass into the middle of it

`site/design/request-lifecycle.html:124` is the only place in the repository that narrates what
happens between parsing an activity file and handing it downstream:

> the manifest is parsed and validated, each activity file is validated and gets its step ids
> populated, and the `artifactPrefix` is derived from the activity filename's numeric prefix. Rule
> and checkpoint fragment refs are materialized at load; borrowed cross-workflow activities retain
> their source-workflow id for technique and fragment scoping.

and `:127` narrates the delivery half:

> after the session gate and definition load, the handler composes the inherited technique bundle,
> materializes checkpoint fragment refs in the activity YAML, derives an eager step-technique budget
> from the caller's `context_tokens`, and inlines ungated step-bound techniques that fit

**What makes it false, and when.** Three ways.

"Rule and checkpoint fragment refs" is already wrong for the same reason as CV16 — there is no rule
half.

Stage 3 inserts routine materialisation into exactly the window line 124 describes, with an ordering
constraint the proposal asserts as a testable criterion: "Materialisation runs after identifier
resolution and before contract derivation, and a test fails if the order is swapped"
(README:849-850). The sentence names identifier resolution ("gets its step ids populated") and names
fragment materialisation, so it is the sentence that would have to say where the new pass sits.

Stage 5 then deletes the fragment clause from both lines.

**Measured references.** Two statements, one page. Both sit in hand-authored prose: this page's only
generated regions are NAV (16-55), BREADCRUMB (60-67) and PAGINATION (162-167), and it has no
`CONTENT` region at all — `grep -n "BEGIN GENERATED" site/design/request-lifecycle.html` confirms it.
The claims they describe are reproducible against `src/tools/workflow-tools.ts:1398-1410` for the
delivery half and `src/loaders/workflow-loader.ts` for the load half.

**What breaks if it is removed at the wrong time.** Nothing mechanical. Recorded because it is the
one document a stage-3 implementer would want to read to find out where the new pass goes, and it
currently describes a pass ordering that includes a mechanism stage 5 removes.

### CV18 · The checkpoint replay key is documented as composed from the id as written

Two statements in `schemas/README.md`.

`:339`, the checkpoint `id` row:

> Checkpoint identity. Bare ids (`confirm-proceed`) are the response-replay key as written. Loop-body
> checkpoints that need a distinct answer per iteration use a template form `<baseId>#{...}` (e.g.
> `assumption-decision#{current_assumption.id}`); workers yield the expanded `<baseId>#<instance>`
> and the server matches the definition on the base id while recording under the full string.

`:623`:

> `yield_checkpoint` stores responses under `<activityId>-<checkpoint_id>`.

**What makes it false, and when.** Stage 3. A checkpoint declared inside a routine body is spliced
into the host activity under a **prefixed** identifier — the proposal's criterion is that the splicer
"emits an explicit prefixed `id:` on every step it splices, nested bodies included, so
`injectResolvedStepIds` has nothing to match inside a materialised routine" (README:857-859). So
`<checkpoint_id>` in the composition at `:623` is a name the loader generated, and "the
response-replay key as written" at `:339` is false for any routine-hosted gate: what is written in
the routine file is not what the worker yields.

The interaction with the per-iteration template form is the sharp end. Both of the assumption run's
gate sites use it — all four `assumption-decision` reference sites are authored as
`…-assumption-decision#{current_assumption.id}` inside a `forEach`
([fragment-mechanism.md](../ground-truth/fragment-mechanism.md) section one, the eight-site table) —
and stage 5 moves exactly those into a routine. So the first construct to meet a prefixed id is the
one that already composes its id from a template, and the resulting key is
`<prefix>_<baseId>#<instance>`. Nothing in these two sentences prepares a reader for that, and the
proposal's stage-5 criteria do not mention the replay key at all.

The consequence is measurable in a committed artifact: **12 of the 113 options** in
`tests/e2e/option-coverage.json` name a gate stage 5 renames, and the option key format is
`checkpoint:${activityId}:${checkpointId}=${optionId}` (`tests/e2e/coverage.ts:22`) — measured in
[guard-obligations.md](../ground-truth/guard-obligations.md), section one.

**Measured references.** Two statements, both in `schemas/README.md`. `grep -rn "replay key" docs
schemas site` returns `schemas/README.md:323` and `:339`; the composition at `:623` uses "stores
responses under".

**What breaks if it is removed at the wrong time.** Nothing mechanical, and the timing matters more
here than anywhere else in this sweep. Both sentences are the reference an author uses to predict
what a worker yields. Stage 3 lands the prefixing on `main` against an unmigrated corpus, so there is
an interval in which no corpus site exercises it and the documentation is silently wrong for a
construct nothing uses; stage 5 then makes it wrong for four live gates and twelve option-coverage
entries in one commit.

### CV19 · A corpus README promises that an activity's definition is in its own file

`workflows/work-package/activities/README.md:5`:

> This is the per-activity orientation map: each entry gives the activity's purpose, the value it
> delivers, how it connects to the rest of the workflow, and a link to its authoritative definition.
> The structured definition of each activity — its steps, checkpoints, loops, decisions, transitions,
> and artifacts — lives in the corresponding `NN-<id>.yaml` file; it is not duplicated here.

**What makes it false, and when.** Stages 5 and 6. `work-package` holds 15 activity files
(`ls workflows/work-package/activities/*.yaml | wc -l` → 15). Stage 5 moves the assumption run's
steps, its two gate bodies and its `forEach` out of four of them —
`04-research.yaml`, `05-implementation-analysis.yaml`, `07-assumptions-review.yaml`,
`08-implement.yaml`. Stage 6 moves a `doWhile` and its three-step body out of those four plus
`02-design-philosophy.yaml`, `06-plan-prepare.yaml` and `15-codebase-comprehension.yaml`. So after
both stages, **7 of 15 activities** have steps, checkpoints and a loop that do not live in their own
`NN-<id>.yaml`, in the file that promises they do.

The three categories the sentence enumerates are precisely the three that move: the run is steps, the
two fragments are checkpoints, and the convergence block is a loop.

**Measured references.** One sentence. It is the orientation map's framing claim, so every one of the
15 activity sections below it inherits the promise. The stage-5 and stage-6 site lists are taken from
[guard-obligations.md](../ground-truth/guard-obligations.md), class (b).

**What breaks if it is removed at the wrong time.** Nothing mechanical — `check:resource-anchors`
grades the file's relative anchors and its mermaid fences, nothing else. Out of every list: stage 5's
corpus file list is four activity YAML files and one `workflow.yaml`, and `activities/README.md` is
none of them. The cost of leaving it is that the map an author consults to find an activity's
definition points at the wrong file for seven activities.

### CV20 · The pattern-activity README tells the reader to copy a step pipeline

`workflows/meta/activities/patterns/README.md:40`, in the "How to consume" procedure:

> Wire your own `transitions` in a thin local wrapper activity when the borrowed file has none, or
> copy the step pipeline into a local activity and bind the same ops with input overrides.

and `:72`, the pattern note for `04-isolated-fan-out`:

> Same shape as 01 with `isolation_mode` and a validate gate on `gathered_results.completeness`
> before synthesise.

**What makes it false, and when.** Stage 8, whose site is exactly these files: the fan-out routine
lands in `01-orchestrator-workers`, `04-isolated-fan-out` and `05-lead-researcher` (README:936-938).
Line 40 offers copying a step pipeline as one of two sanctioned consumption routes, and the routine
construct exists to make that route unnecessary. Line 72 states the duplication as a feature of the
catalog — "same shape as 01" — which is the drift stage 1's guard is meant to report and stage 8 is
meant to remove.

**What breaks if it is removed at the wrong time.** Nothing mechanical, and the reason is itself the
finding. These five files are the ones nothing validates. The corpus holds 122 activity YAML files;
`npm run check:activities` prints "Total: 117 passed", because `validate-activities.ts:110` is
non-recursive and never reaches `meta/activities/patterns/`
([guard-obligations.md](../ground-truth/guard-obligations.md), class (a)). The README says so itself
at `:5`: "`loadActivitiesFromDir` is non-recursive — this subdirectory is library-only". So stage 8
lands its routine in the part of the corpus the loader never loads, the activity schema never
validates, and every loader-consuming guard never sees — and the only document describing how to
consume these activities recommends copying instead.

### CV21 · One of the six JSON schemas is described as generated and has no generator

`docs/documentation-system.md:34`, the authoritative table of documentation surfaces:

> | `schemas/*.schema.json` | JSON Schemas generated from the Zod sources (`npm run build:schemas`) |
> Authoring-time validation and tooling |

`docs/technique-protocol-specification.md:9`:

> The schema those rules are checked against is `technique.schema.json`, generated from
> [its Zod source](../src/schema/technique.schema.ts)

**What makes it false.** `scripts/generate-schemas.ts:25-29` makes exactly **five** `generate(...)`
calls — `WorkflowSchema`, `WorkflowStateSchema`, `ConditionSchema`, `SessionFileSchema`,
`ActivitySchema`. `TechniqueSchema` is not imported and not generated. `schemas/` holds **six**
`.schema.json` files, so one is hand-maintained and two documents call the whole set generated.

The file itself proves it. The generator writes a fixed preamble —
`{ $schema, title, description, ...json }` at `scripts/generate-schemas.ts:20` — and never emits
`$id`. All five generated files open `$schema`, `title`, `description`, `$ref`, `definitions`.
`schemas/technique.schema.json:1-6` opens `$schema`, **`$id`**, `title`, `description`, `$ref`,
`definitions`. No output of that generator can carry `$id`.

The drift is measurable, and it is large. The JSON carries **33** `description` strings; **20** of
them have no counterpart in `src/schema/technique.schema.ts` after normalising whitespace and
backticks. Two of the twenty still call a technique a *skill*:

- `schemas/technique.schema.json:11` — "Used to bind to an output or supply from context when
  chaining **skills**." The Zod at `src/schema/technique.schema.ts:5` says "chaining **techniques**".
- `schemas/technique.schema.json:21` — "Inputs the **skill** expects from context". The Zod at
  `src/schema/technique.schema.ts:20` says "Inputs the **technique** expects from context".

And the drift is published. `renderSchemasRegion()` reads the committed JSON, so
`site/api/schemas.html:226` renders "Technique definition schema for workflow-server" and
`:233-244` renders the field table from the hand-maintained definitions —
including `:236`'s "Never authored in technique markdown", where the Zod says "Never authored in
technique files". `tests/site.test.ts:10-13` grades that page against a fresh regeneration and
passes, because the regeneration reads the same stale input.

**Measured references.** Two documentation claims; one un-generated file among six; 20 of 33
descriptions divergent; 2 of them using the retired word. `tests/docs-drift.test.ts:74-83` polices
"Skill" in exactly one phrasing — the `Goal → … → Skill` agent-model line — and `schemas/` is not in
its `PRODUCT_GLOBS`, so neither guard catches either occurrence.

**What breaks if it is removed at the wrong time.** Verdict KEEP: no routines stage touches this. It
is in the sweep because stage 3 adds a **seventh** file to a set of six that already contains one
nobody regenerates, and because the same asymmetry is what makes CV14 durable. See below.

```bash
grep -n "^generate(" scripts/generate-schemas.ts          # five calls
ls schemas/*.schema.json | wc -l                          # six files
head -6 schemas/technique.schema.json                     # the $id no generator writes
grep -n "chaining skills\|Inputs the skill" schemas/technique.schema.json
grep -n "chaining techniques\|Inputs the technique" src/schema/technique.schema.ts
```

---

## The generated artifacts, and what regenerates each

| Artifact | Generated by | Freshness gate | Carries a candidate |
|---|---|---|---|
| `schemas/workflow.schema.json` | `npm run build:schemas` → `scripts/generate-schemas.ts:25` | **none** | CV15 (`:68-229`, `:674`), CV9 |
| `schemas/state.schema.json` | `scripts/generate-schemas.ts:26` | **none** | CV9 (`:163`) |
| `schemas/condition.schema.json` | `scripts/generate-schemas.ts:27` | **none** | — |
| `schemas/session-file.schema.json` | `scripts/generate-schemas.ts:28` | **none** | CV9 (`:196`) |
| `schemas/activity.schema.json` | `scripts/generate-schemas.ts:29` | **none** | CV13 (`:4`), CV14, CV15 (`:439`) |
| `schemas/technique.schema.json` | **nothing — no generator found** | none | CV21 |
| `site/api/schemas.html`, CONTENT region lines 74-302 | `npm run build:site` → `renderSchemasRegion()`, `scripts/generate-site-data.ts:690-733`, reading `schemas/*.schema.json` | `tests/site.test.ts:10-13` | CV9 (`:142`, `:201`), CV13 (`:77`, `:91`, `:283`), CV15 (`:264`), CV21 (`:226`) |
| `site/api/tools.html`, CONTENT region | `renderToolsRegion()`, `scripts/generate-site-data.ts:632-664`, reading `registerWorkflowTools` / `registerResourceTools` | `tests/site.test.ts:10-13` | **none** |
| NAV / BREADCRUMB / PAGINATION on all 19 pages | `scripts/generate-site-data.ts:793-795` | `tests/site.test.ts:10-13` plus `checkSiteNavigation()` | none |

Two things follow, and they decide how much of this sweep will stay fixed.

**The chain Zod → JSON → site page has a freshness gate on its last link only.**
`tests/generated-schemas.test.ts` does not compare the committed JSON to a regeneration: it asserts
that no recursion point degraded to the empty schema `{}` (`:44-49`) and that the three condition
combinators carry a `$ref` (`:51-59`). `grep -rn "build:schemas" .github/workflows/` returns
nothing, and `package.json:22` makes `test:ci` a plain `vitest run`. So a forgotten
`npm run build:schemas` passes continuous integration — and then `tests/site.test.ts` certifies
`site/api/schemas.html` as fresh against that stale JSON. The site is graded against its input, not
against the source of truth. This is exactly what stage 3's own criterion asks to fix ("the schema
generator has a verifying variant, so a forgotten regeneration fails continuous integration instead
of surfacing as a spurious authoring error", README:840-842), and until it lands, CV14's hard-coded
sentence and CV21's hand-maintained file are both invisible to the suite.

**The generated tool reference carries nothing this sweep falsifies.**
`grep -cn "loop\|fragment" site/api/tools.html` returns **0**. No tool description in
`src/tools/workflow-tools.ts` or `src/tools/resource-tools.ts` that reaches the site enumerates the
step kinds or names the fragment mechanism. That is an empty result on a generated surface, and it is
worth recording: stage 3 changes what `get_activity` delivers and stage 5 removes a construct, and
neither shows up in the MCP tool reference. Whether that is right is a separate question — it means
an agent reading the tool catalogue is never told that the activity text it receives was assembled.

---

## What I looked for and did not find

**No loop-step field table on the generated site.** `site/api/schemas.html` renders the activity
schema's top-level fields and stops: `paramRows` (`scripts/generate-site-data.ts:498-517`) recurses
only into `array` properties whose `items` carry `properties`, and `steps[]` is an `anyOf` of four
variants, so it renders as a type label and no rows. `grep -n "continueWhile\|breakCondition"
site/api/schemas.html` returns nothing. The consequence is that the loop step's twelve fields — and
the two carefully-worded descriptions at `src/schema/activity.schema.ts:157` and `:160` — never reach
the published site at all. So the site cannot be stale about them, and it also cannot correct
`schemas/README.md`.

**No generated page carries the checkpoint `ref` description.** For the same reason:
`schemas/activity.schema.json:439` and `schemas/workflow.schema.json:674` describe `ref`, and neither
reaches `site/api/schemas.html`. The only fragment description that does is the workflow-level
`fragments` row at `:264` (CV15).

**No `condition`-on-a-loop claim in `docs/`.** `grep -rn "Continue condition\|condition/breakCondition"
docs/` returns nothing. The four stale loop-field descriptions that
[stage-0-state.md](../ground-truth/stage-0-state.md) section three names are distributed one each to
`schemas/README.md`, corpus canon, and two comprehension snapshots, and none is in `docs/`. `docs/`
carries exactly one stage-0 key, `workflow-fidelity.md:143` (CV8).

**No guard, test or freshness check over any of the twenty-one candidates except CV12's SVG geometry
and CV15's site anchors.** `tests/docs-drift.test.ts` covers `docs` and `site` and asserts four things
(`:63-112`): no `session_token` as the session identity, no `Skill` in the `Goal → … → Tools` line, no
MCP tool inventory tally, and no `site/internals` or `design/rationale.html` path. None of them
touches step kinds, loop fields, fragments, or the load pipeline. `schemas/` and every corpus README
are outside its `PRODUCT_GLOBS` (`:12-24`) entirely.

**No exclusivity claim to falsify.** I looked for a statement that a technique is the *only* unit of
reuse, or that a step sequence cannot be shared — the claim a routine would most directly contradict.
`grep -rn "unit of reuse\|only mechanism\|the only way\|no mechanism\|cannot be shared" docs schemas
site` returns nothing on point. The documentation describes what exists and never claims the set is
closed, which is why every candidate here is an enumeration going stale rather than a prohibition
being lifted.

**The Orchestra surface is self-declaring and out of scope.** `docs/orchestra-specification.md`,
`grammar/README.md` and `constraints/README.md` describe a proposed activity language with steps,
decisions, loops and flows, and use `skill` for the technique primitive throughout
(`grammar/README.md:17`, `constraints/README.md:18`). They are not candidates:
`docs/orchestra-specification.md:3` states "The server implements a different shape, so nothing on
this page describes a file the loader accepts", and `:5` sends an author to the schema guide instead.
`grammar/README.md:13` and `constraints/README.md:13` both mark three of four files "TBD". A design
document that says it is a design document cannot be falsified by a change to the system.

**One reading I could not settle, recorded so a refuter can rule on it.**
`tests/e2e/README.md:217-219` reads "Step-unbound (situational) checkpoints … none. Every checkpoint
is an inline `kind: checkpoint` step at a concrete position, so the robot reaches them all." Under
stage 5 the authored form of eight checkpoints is no longer at a concrete position in any activity.
But "inline" there plausibly contrasts with a retired `step.checkpoint` reference rather than with a
fragment `ref` — and the same README says at `:108-110` that "a checkpoint may arrive by fragment
`ref`, which raw YAML shows as a step with no options at all", which is why the coverage denominator
comes from the loader. On that reading the sentence is about step-unboundness and survives
materialisation intact, since a materialised routine step *is* at a concrete position. I judge it
KEEP and flag the ambiguity rather than claim a twenty-second candidate.

**Two incidental defects on this surface, in neither population.** Recorded because a refuter
checking my commands will trip over them. `docs/development.md:340` says the binding-fidelity triage
carries "69 verdicts"; the file holds **72** entries
(`python3 -c "import json;print(len(json.load(open('scripts/binding-fidelity-triage.json'))['entries']))"`),
which is what [guard-obligations.md](../ground-truth/guard-obligations.md) also measures.
`docs/development.md:314-316` names `tests/identifier-qualification.test.ts` among the guards that
also run as Vitest tests, and no such file exists — `ls tests/ | grep -i "identif\|qualif"` returns
nothing, and no test file references `check-identifier-qualification`. The other five files it names
do exist. Neither is routines-related; both are `AP-129` of the same species as the twenty-one above.

---

## Re-taking every figure

```bash
# the surface, and the proposal's silence about it
grep -rin "documentation\|the docs\|site page\|readme\|schema guide" \
  .engineering/artifacts/planning/2026-09-03-routines/
sed -n '820,960p' .engineering/artifacts/planning/2026-09-03-routines/README.md

# population one: the field named nowhere in prose
grep -rn "continueWhile" schemas/README.md docs/ site/ | wc -l    # 0
sed -n '371,386p;28,36p;318,326p' schemas/README.md
sed -n '302,342p' site/specs/workflows.html
sed -n '86p;137,139p' site/guide/definitions.html
sed -n '143p' docs/workflow-fidelity.md
grep -n "gated by <code>when</code> or <code>condition</code>" site/specs/state-management.html
sed -n '115,126p' src/utils/validation.ts
sed -n '73,86p;152,172p' src/schema/activity.schema.ts

# loop_break, six non-planning sites
grep -rn "loop_break" src/ schemas/ site/

# population two
grep -rn "delivers the raw activity YAML verbatim" docs schemas site
sed -n '1396,1412p' src/tools/workflow-tools.ts
sed -n '188,211p' src/loaders/fragment-resolver.ts
sed -n '226,243p' src/schema/activity.schema.ts
sed -n '12,40p' workflows/README.md
sed -n '74,117p' site/specs/workflows.html
sed -n '124p;127p' site/design/request-lifecycle.html
sed -n '339p;623p' schemas/README.md
sed -n '5p' workflows/work-package/activities/README.md
sed -n '40p;72p' workflows/meta/activities/patterns/README.md

# the fragment mechanism and its site coupling
grep -rn "fragments.checkpoints" docs schemas site
grep -rn "resource-resolution.html#fragments\|checkpoints.html#fragments" site/ docs/
sed -n '29,42p;171p' src/schema/workflow.schema.ts
npx tsx scripts/check-site-links.ts

# generated artifacts and their gates
grep -n "^generate(" scripts/generate-schemas.ts
ls schemas/*.schema.json
grep -rn "build:schemas\|build:site" .github/workflows/ package.json
sed -n '36,59p' tests/generated-schemas.test.ts
sed -n '1,15p' tests/site.test.ts
grep -cn "loop\|fragment" site/api/tools.html               # 0
grep -n "BEGIN GENERATED" site/api/schemas.html site/design/request-lifecycle.html
head -6 schemas/technique.schema.json
grep -n "chaining skills\|Inputs the skill" schemas/technique.schema.json

# what no guard covers
sed -n '12,24p;60,113p' tests/docs-drift.test.ts
```

Three counts were taken with throwaway scripts whose rules are stated in full above, so each is
re-derivable. The **17 closed-set step-kind enumerations** come from a regular expression over every
`.md`, `.html`, `.json`, `.js` and `.css` file under `docs/`, `schemas/`, `site/` and every
`README.md` in the tree, excluding `.git`, `node_modules`, `dist`, `.worktrees`, `.gitnexus` and
`.engineering/artifacts/planning/`, with HTML tags, entities and backticks stripped before matching —
117 files, and the pattern is `technique (/|,|\|) action … loop` plus the literal phrases "Four
kinds", "the four step kinds" and the prose gloss "a technique step (binds an operation)". The
**stage-0 key counts** apply the same normalisation to the twenty literal keys in
[stage-0-state.md](../ground-truth/stage-0-state.md) section six, which is how the site's HTML
spelling of CV8's key surfaced. The **20-of-33 technique-schema divergence** walks every
`description` value in `schemas/technique.schema.json` and looks for a whitespace- and
backtick-normalised match among the `describe('…')` payloads in `src/schema/technique.schema.ts`.
