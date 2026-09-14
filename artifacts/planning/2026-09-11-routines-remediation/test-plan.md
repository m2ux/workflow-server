# The routines test plan: every case in a named file

Every row of the permutation matrix, assigned a file that exists or will exist, a fixture tree, and a
case count — so a stage can be scheduled against work rather than against a description of work.

> Item 10b · measured 2026-09-14 · engine tree at `fe5f5f78` on `main`, corpus worktree at
> `.worktrees/workflows` at `e9d26007` on `workflows`. Input: the [permutation
> matrix](permutation-matrix.md) (item 10a), the graph-fan [harness ground
> truth](../2026-09-09-fan-smoke-test/ground-truth/test-harness.md) and its [corpus-conventions
> sibling](../2026-09-09-fan-smoke-test/ground-truth/corpus-conventions.md), and the [fixture
> sweep](unswept/fixtures.md) (item 11a). Where the harness ground truth names a path under
> `scripts/`, the guards have since moved to `guards/` and every citation below is re-taken at this
> tree.

## What this document is for

Four of the proposal's acceptance criteria name a test and stop there. Stage 3 asks for a
simultaneity test over a renaming binding, an order-swap test, a compile-time exhaustiveness
assertion and a differential test over every activity in the corpus. None of the four names a file,
and three of them name no fixture either. A criterion naming a test that has no file and no fixture
cannot be costed, so a stage carrying it cannot be scheduled — a reviewer reading "a test fails if
the order is swapped" has no way to tell whether that is an afternoon or a fortnight.

This assigns all of it. **148 test-grain cases across 16 files** — nine files that do not exist yet
and seven that do and gain cases — plus one committed fixture root of seven workflow trees and one
line on a shared helper. Every case names its provocation. Every file names the fixture tree it
builds and the template in the suite it copies. Six cases have no home under any decision available,
and they are stated as holes with a named substitute rather than folded into a total.

The counts here are at the matrix's own grain: one `it(...)`, or one arm of an `it.each`, per case.

---

## The harness, read rather than assumed

Six facts decide where every case can live. Each was re-read at this tree.

**A test builds a workflow directory in a temporary directory and hands it to the real server or the
real loader.** Forty test files call `mkdtempSync`. The shape is `mkdtempSync(join(tmpdir(),
'<prefix>-'))`, `mkdirSync(..., { recursive: true })`, `writeFileSync` of a joined YAML string, and
teardown in `afterAll`. `tests/fan-load-rules.test.ts:47-72` is the developed form: one root in
`beforeAll`, a `loadErrors(spec)` helper that serialises a whole workflow per case through
`stringifyForResponse`, writes `workflow.yaml` plus numbered activity files, calls `loadWorkflow(root,
id)` and returns the error strings. Thirty-one illegal fan shapes live there and not one of them is a
committed file.

**A load failure is asserted against its message, not against the failure.** `loadWorkflow` returns a
`Result` (`src/loaders/workflow-loader.ts:239`), and `tests/fan-load-rules.test.ts:70-71` reads
`(result.error as { issues?: string[] }).issues ?? [result.error.message]`. The convention the fan
file states in its own header is that every message names the author's fix site and each test asserts
that rather than merely that the load failed.

**A malformed activity is dropped, and its workflow still loads.** `src/loaders/workflow-loader.ts:88-93`
logs "Skipping invalid activity", pushes a `DefinitionLoadError` and continues. This is the single
most consequential harness fact for this construct: a routine reference the schema rejects produces a
green load and a silently smaller workflow, so a test asserting on a *message* cannot be written for
any shape-level refusal until stage 3 decides what to do about drop-and-continue. Only failures
raised after the activity validates — the resolution terminals — reach a load error today.

**A guard is run in-process through its exported collector, against a fixture root.** The template is
`tests/loop-shape-guard.test.ts:23-37`: build `<root>/demo/activities/01-demo.yaml`, call
`declareFixtureWorkflows(root)` from `tests/corpus-fixture.ts`, hand the root to `collectFindings` and
map to `.check` or `.site`. `declareFixtureWorkflows` (`tests/corpus-fixture.ts:22-28`) writes a
three-line `workflow.yaml` into every directory that lacks one, because discovery is "a directory
holding a `workflow.yaml`" and `requireWorkflowsRoot` (`guards/workflows-root.ts:96-117`) refuses a
root that holds no workflow. `assertScanned` (`:124-129`) then refuses a guard that inspected nothing.
Ten test files use the helper; `tests/checkpoint-entry-guard.test.ts` additionally pins the empty-root
refusal so green-because-nothing-scanned is impossible.

**Not every guard can be pointed at a fixture.** Three of the collectors the matrix names take no root
argument and resolve a module-level `ROOT` at import time:
`collectActivityTechniqueOverlapViolations()` (`guards/check-activity-technique-overlap.ts:55`, ROOT at
`:24`), `collectViolations()` (`guards/check-binding-fidelity.ts:738`, ROOT at `:77`) and
`collectBrokenAnchors()` (`guards/check-resource-anchors.ts:91`, ROOT at `:29`). G12, G16 and G19
therefore have no writable case until each grows the `root: string = ROOT` parameter that
`collectVariableModelViolations` (`guards/check-variable-model.ts:160`) and `collectFragmentViolations`
(`guards/check-fragments.ts:115`) already carry. That is three one-line changes, and no stage names
them.

**Two guards expose pure functions, so their rescoped rules need no tree at all.**
`lintDocument(doc, decls, file)` and `lintDeclarations(decls, file)`
(`guards/check-variable-model.ts:94` and `:143`) take a parsed document and a declarations map.
`tests/variable-model.test.ts` drives all five rules that way, with no filesystem. Rescoping those
rules to a routine's own declarations is therefore the cheapest six cases in the plan.
`check-review-mode-gating` exports `reachableInReview` and its acceptance table the same way.

**The variable bag can be seeded, and it does not matter here.** Four routes exist — writing the
session file through `writeSessionFile` + `createInitialSessionFile({ variables })`, relaying
`variables_changed` on `next_activity` or `yield_checkpoint` (which stores a type-mismatched value as
written), declaring `defaultValue` in a fixture workflow, and `start_session { user_request }`. For
the graph fan this was decisive, because a fan refuses at run time over bag contents. **A routine has
no run-time refusal surface at all**: a `kind: routine` step exists between parsing and
materialisation and nowhere else, so zero of the 74 refusal cases sit at live-session and none needs a
seeded bag. The seeding routes matter to this plan only for the delivery observations, where a
declared default is what lets a fixture activity's gate resolve without a live decision.

**Where the fixture roots live.** `tests/fixtures/<set>/<workflow-id>/workflow.yaml` plus
`activities/NN-<id>.yaml`. Six sets today: `fan-corpus` (17 trees, 79 files, 1,290 lines),
`fragments` (3 trees), `variable-model` (4), `markdown-techniques` (2), `message-binding` (1),
`token-bench` (1). Across all of them, `find tests scripts guards -name 'workflow.yaml'` returns
**28** trees and `find tests scripts guards -path '*/activities/*' -name '*.yaml'` returns **68**
activity files. No registered guard is ever pointed at `tests/fixtures` by `check:all` — the guards
resolve through `requireWorkflowsRoot`, whose default is `.worktrees/workflows` of the primary
checkout — so a fixture tree is invisible to all 41 registered guards unless a test hands a collector
the path itself.

**And the engine's own continuous integration has no corpus.** `.github/workflows/verify.yml:28`
checks out with `submodules: false`; `liveCorpusRoot()` (`tests/corpus-root.ts:41-46`) returns null
and 42 `skipIf` sites stand down. Every workflow definition the engine's CI loads is a fixture. This
is why the assignment below never grades a criterion against "the corpus" without also naming a root
that CI has.

---

## The assignment, file by file

Nine new files, seven existing files extended, one new fixture root, one helper edit.

| File | New? | Cases | Fixture | What it holds |
|---|---|---|---|---|
| `tests/routine-schema.test.ts` | new | **45** | none — in-memory objects | S1–S11 (19), the parse arm of 23 legal forms, 3 structural obligations |
| `tests/routine-load-rules.test.ts` | new | **34** | one `mkdtemp` root, a workflow per case | L1–L11, L16, L18, L19 (15); L5, L6 (3) once owed; the drop-vs-refuse boundary (2); 14 legal-load arms |
| `tests/routine-materialisation.test.ts` | new | **20** | in-memory; one `mkdtemp` root for the raw-text arms | substitution, prefixing, injection, the merged-scope re-check, three unrepresentable properties |
| `tests/routine-corpus.test.ts` | new | **12** | **`tests/fixtures/routines/`**, 7 trees | every tree loads clean, the root serves a harness and a raw-reading guard, G19, the reserved-name fix |
| `tests/variable-model.test.ts` | existing (85 ln) | **+6** | none — `lintDocument` / `lintDeclarations` | G1–G6, the five rescoped rules with `setvariable-undeclared` split |
| `tests/loop-shape-guard.test.ts` | existing (113 ln) | **+5** | `mkdtemp` + `declareFixtureWorkflows`, extended to write `routines/` | G13, the five loop-shape rules over a routine body |
| `tests/checkpoint-entry-guard.test.ts` | existing (75 ln) | **+2** | `mkdtemp`, and the tree must also load | G11, both directions |
| `tests/routine-contract-guard.test.ts` | new | **5** | `mkdtemp` + a `writeRoutineFixture` helper | G7, G8, G12, G17, L20 |
| `tests/routine-placement-guard.test.ts` | new | **5** | `mkdtemp`, two workflows plus `meta` | G9, G10, L12 (2 arms), L13a |
| `tests/repeated-runs-guard.test.ts` | new | **3** | `mkdtemp`, two activities sharing a window | G14, stage 1's three provocable criteria |
| `tests/review-mode-gating.test.ts` | existing (66 ln) | **+1** | none — the exported helpers | G15, the blindness asserted as a finding that should fire |
| `tests/binding-fidelity.test.ts` | existing (98 ln) | **+1** | the ledger + a synthetic reference | G16, an unresolvable read at every routine input |
| `tests/fragments-guard.test.ts` | existing (58 ln) | **+1** | `tests/fixtures/fragments`, edited | G18, and the violation total re-derived 8 → 3 |
| `tests/e2e/routine-delivery.test.ts` | new | **5** | `createHarness({ workflowDir: fixtures/routines })` | O1, O3, O5, O6, LF45 |
| `tests/routine-differential.test.ts` | new | **2** | `fixtures/routines` + `fixtures/token-bench`, corpus under `skipIf` | O2, both paths compared as objects and as text |
| `tests/generated-schemas.test.ts` | existing (60 ln) | **+1** | `schemas/` | `routine.schema.json` exists, is strict, and has no lost recursion point |
| **total** | **9 new / 7 extended** | **148** | | |

The three files the plan leans on hardest have measured precedents at comparable size:
`tests/fan-load-rules.test.ts` is 740 lines for 31 cases, `tests/fragment-resolver.test.ts` is 246
lines for the in-memory resolver, and `tests/fan-container-guard.test.ts` is 188 lines against a
committed root.

**Reconciling the 148 against the matrix's 74.** The matrix counts refusals only; this plan also homes
the legal forms, the structural properties and the delivery observations, which is why the total is
twice as large.

| Matrix population | Cases | Where they went |
|---|---|---|
| Refusals, decided site | 53 | 8 in `routine-schema`, 15 in `routine-load-rules`, 30 across the guard files |
| Refusals, undecided site (S8–S11) | 11 | `routine-schema`, written as `it.todo` naming the blocking question |
| Refusals, unprovokable | 10 | **4** gain a case conditional on a stage-3 mechanism (L5 ×2, L6 in `routine-load-rules`; L15 in `routine-materialisation`); **6** stay homeless (L13b, L14 ×2, L21, L22, G20) and are in the holes |
| Legal forms LF1–LF49 | 49 forms | 23 parse arms, 14 load arms, the rest inside the materialisation and corpus files, several forms carrying more than one arm |
| Ambiguous forms AF1–AF10 | 10 | Not cases. Each blocks one or more of the above; AF7 blocks S9, AF9 blocks part of S8/S10, AF4 blocks G8 and G20, AF6 shapes LF6 |
| Unrepresentable U1–U8 | 8 | U1, U4, U7 structural in `routine-schema`; U2, U5, U8 in `routine-materialisation`; U6 inside the stage-5 edit to `fragments-guard` — the `fragments:` block is one 57-line block at `corpus/work-package/workflow.yaml:15-71`, referenced at eight steps in four activity files; **U3 alone is a hole** |
| Observations O1–O6 | 6 | 5 in `tests/e2e/routine-delivery.test.ts`, O2 in `routine-differential` |
| Strength mismatches X1–X8 | 8 | Not cases. X1–X5 resolve onto L7–L9/G7–G9 and the holes; X6 shapes G14; X7 lands in `generated-schemas`; X8 is in the holes |

---

## Layer 1 — schema-parse

### `tests/routine-schema.test.ts` · 45 cases · no fixture

Template `tests/schema-validation.test.ts` (455 lines), which asserts
`expect(StepSchema.safeParse(step).success).toBe(false)` on objects built inline. No filesystem, no
server, no corpus. Every case here runs on engine CI unconditionally, which matters because the
corpus does not.

**Refusals with a decided site — 8 cases.**

| Case | Provocation | Assertion |
|---|---|---|
| S1 | `{ kind: 'routine', id: 'x' }` — no `routine` | `safeParse` fails; the issue path names `routine` |
| S2 | `{ kind: 'routine', routine: 'r' }` — no `id` | fails on `id`. `populateStepIds` derives an id only for a technique step and throws at `src/schema/activity.schema.ts:198` for any other kind, and the reference step's id **is** the prefix, so this has to be a parse error |
| S3 | a routine step carrying `message:` beside `routine:` | fails with `Unrecognized key(s) in object: 'message'`. This is `ref-body-conflict`'s analogue (`src/loaders/fragment-resolver.ts:111-116`) arriving one layer cheaper |
| S4 | `with: { topic: ['a','b'] }` | fails — the scalar union at `src/schema/activity.schema.ts:65` admits string, number, boolean only |
| S5 | `outputs: { finding: 3 }` | fails — the map goes from output id to session variable name |
| S6 | a routine output id `findings` | fails `VariableNameSchema` (`src/schema/variable.schema.ts:6`) via `QUALIFIED_DATA_ID_PATTERN` (`src/schema/identifiers.ts:16`) |
| S7 (2) | the same illegal id at the input position, and at the internal position | two separate `safeParse` calls — a test on one leaves the other position unproven |

**Refusals whose site follows from a decision nobody has made — 11 cases.** These have a file and a
written shape; they do not have a writable assertion, because the design states the shape and never
states the level.

- **S8 (2)** — a routine with no `steps` key, and one with `steps: []`. Blocked on: is a routine's
  body non-empty?
- **S9 (5)** — a routine declaring `exits`, `outcome`, `rules`, `triggers`, `techniques`. Blocked on
  AF7: is the routine file's schema `.strict()`? Every step member is (`src/schema/activity.schema.ts:102`
  and eight more `.strict()` calls), and the routine file's own schema is unspecified. Two of the five
  have live consequences — `check-checkpoint-presentation` sits out of a routine's way precisely
  because a routine declares no rules.
- **S10 (1)** — a routine output declaring `default`.
- **S11 (3)** — an internal declaring `type`, `default`, a value set.

Write all eleven as `it.todo` with the blocking question in the title, so the decision is visible in
the suite rather than in a planning folder.

**Legal-form parse arms — 23 cases.** Each asserts `.success` is true and, where the form has a
boundary, that the parsed object carries the field.

LF1 the flagship reference; LF2 a reference with no arguments at all; LF3 ×3 a `with` value of each
scalar type (three arms — a test on one leaves two unproven); LF4 a collection as a JSON string;
LF12 ×3 the site gates `when`, `required: false` and `condition`, the two from `stepCommonFields`
(`src/schema/activity.schema.ts:73-79`) and one from `stepEntryCondition` (`:84-86`); LF13 a routine
step inside a `LoopStepSchema` body, which recurses through `z.lazy` at `:162`; LF14 the full routine
shape; LF15 a routine with no inputs; LF19 a body carrying a loop; LF20 a body carrying a routine
step; LF22 an internal that is a loop item variable; LF23 an internal holding a collection; LF26 a
body `forEach` carrying `breakCondition`; LF27 a `doWhile` carrying `continueWhile`; LF28 a gate
option whose `setVariable` names a declared output; LF29 one naming an internal; LF30 a routine
carrying its own version; LF47 an input declared `kind: technique`; LF48 a parameterised body step
declaring its own `id`.

**Structural obligations — 3 cases.** U1: the routine schema carries no `outcome` field, asserted
against the schema rather than against a load. U4: the routine step member declares no `message` and
no `options`, so a use site cannot restate a gate. U7: the reference step's field set is closed, so
there is no second parameter channel.

### `tests/generated-schemas.test.ts` · +1 case

`schemas/` holds six `.schema.json` files and `scripts/generate-schemas.ts` emits **five** —
`technique.schema.json` is hand-authored with its own `$id`. A routine schema makes seven and six. The
case: `routine.schema.json` is present, declares `additionalProperties: false` (S3's other half), and
has no empty subschema at `steps.items`, which the existing `findEmptySubschemas` walk already tests
for — a routine body recurses exactly the way a loop body does, and `$refStrategy: 'none'` degrades a
cycle to `{}`.

This is also where X7 is settled honestly. A `--check` variant written to the criterion's wording
regenerates the five and diffs them, and stays blind to the sixth. Catching the sixth needs a
directory-completeness assertion — every `.schema.json` on disk is either generated or named as
hand-authored — which is a different check, and it belongs here rather than in the generator.

---

## Layer 2 — load-fixture

### `tests/routine-load-rules.test.ts` · 34 cases · one `mkdtemp` root, a workflow directory per case

Template `tests/fan-load-rules.test.ts` exactly: one root in `beforeAll`, `rmSync` in `afterAll`, a
local `loadErrors(spec)` that names each workflow `fixture-<n>`, writes it, loads it and returns the
messages. No `declareFixtureWorkflows` is needed here, because `loadWorkflow(root, id)` is called on a
named id rather than on a root, and the helper writes the manifest itself. The helper gains one
argument the fan's does not have — `routines: RoutineSpec[]`, written to `<dir>/routines/<name>.yaml`.

**The reference lifecycle — 15 provocable cases.**

| Case | Provocation | Message must name |
|---|---|---|
| L1a | a bare `routine: nonesuch` in a workflow whose `routines/` and whose `meta` hold no such file | the routine, the reference site, and both homes searched |
| L1b | `routine: other::thing` where `other` exists and holds no `thing` | the same, with **no fallback** — `candidateWorkflows` (`src/loaders/fragment-resolver.ts:47`) returns the single named workflow |
| L2a | a routine whose body refers to itself | the cycle as the chain of reference ids |
| L2b | two routines referring to each other | the same chain, two long |
| L3 | a routine declaring input `decision_space` with no `default`, referenced with no `with` | the input id, the routine, the reference site |
| L4 | `with: { nothing_declared: 'x' }` | the argument name **and the routine's declared input list**, because the list is the author's fix site |
| L7 | a routine declaring output `concern_document` whose body writes nothing | the output id, the routine, and that the body was derived |
| L8 | a routine declaring input `topic` no body step reads | the input id and the routine |
| L9a | a declared internal nothing writes | the internal id and which half failed |
| L9b | a declared internal nothing reads | the same, the other half |
| L10 | a body step reading `{some_workflow_variable}` | the name and the three declaration categories |
| L11 | an output left unbound at a reference site, its declaration carrying no permission marker | the output id, the reference site, and that an output which may be unbound says so |
| L16 | a graph exit binding `to:` a routine name | **the standing message** — `validateExitBindings` reports "which this workflow does not contain", asserted verbatim at `tests/workflow-loader.test.ts:403`. Assert that string and not a routine-specific rule, or a spurious new rule goes undetected |
| L18 | a stage-7 routine reading its technique parameter's outputs | why it is refused, and that no bound is declared because none is needed |
| L19 | a stage-7 routine whose contract is not derivable in isolation | that the contract is derivable per reference site |

**Terminals the design owes — 3 cases, written now and failing until stage 3 adds them.**

- **L5a** `routine: a::b::c`, **L5b** `routine: work-package::`. The replaced mechanism has this
  state: `parseFragmentRef` (`src/loaders/fragment-resolver.ts:37-45`) is documented as "a ref with
  more than one `::` is malformed" and throws, and `guards/check-fragments.ts:207` reads the word
  `Malformed` off the message to choose its rule. The routine lifecycle has four non-`Checked`
  terminals and none of them matches.
- **L6** one id declared as both an input and an output — the design's own worked signature produces
  it, invisibly, because at all seven live sites both sides resolve to one name.

**The drop-versus-refuse boundary — 2 cases.** This is the pair the whole layer turns on.

- A routine step whose *shape* the schema rejects, in an otherwise valid activity: assert today's
  measured behaviour — `loadWorkflow` returns `success`, the activity is absent from
  `result.value.workflow.activities`, and `result.value.activityLoadErrors` carries one entry keyed
  by `file`, `activity_id`, `error`. The template is `tests/workflow-loader.test.ts:130-148`.
- The same shape once stage 3 decides. Either the criterion is scoped to resolution terminals and
  this case stands as written, or the stage buys a change to drop-and-continue — which touches all
  132 corpus activity files and all 68 fixture ones and is not a routines feature.

**Legal-load arms — 14 cases.** LF5 a braced argument stays braced; LF6 a bare argument loses its
braces; LF7 an unbound input takes its declared default; LF8 an absent value **omits the binding**
rather than emitting an empty literal — the row an implementation is most likely to get wrong, because
an empty literal would override name-match resolution with nothing; LF10 an output left unbound under
a permission marker; LF24 a routine whose body declares an artifact, referenced once; LF25 a routine
declaring one transitively through a wrapper; LF31 a bare name resolving in the referring workflow;
LF32 a bare name falling back to `meta`; LF33 a qualified name resolving in that workflow only; LF34
a **borrowed** activity's bare reference resolving against its source workflow —
`materializeActivityFragments` (`src/loaders/fragment-resolver.ts:137`) already takes a source
workflow id, and the corpus borrows heavily, so resolving against the borrower would compute the wrong
routine. **My own count differs from the one the folder carries**: walking all 18 workflow manifests
and counting every activity id named by more than one graph — as a destination, as a graph source, or
as an `initialActivity` — gives **23**, against the 21 the matrix carries, and the heaviest borrower is
`remediate-vuln` at **14** ids it holds no file for, against the 13 carried. The rule matters more than
the number and it is the same either way. LF35 a routine referred to only by other routines; LF45
an activity carrying no routine loads byte-identical; LF49 a routine binding no technique by
parameter keeps the once-per-routine path.

---

## Layer 3 — materialisation

### `tests/routine-materialisation.test.ts` · 20 cases · in-memory, plus one `mkdtemp` root for two arms

Template `tests/fragment-resolver.test.ts` (246 lines), which builds its cases as inline objects and
reaches the corpus only under `skipIf(!liveCorpusRoot())`. This file is where the four homeless stage-3
criteria that *can* be homed end up.

**The substitution table — 3 cases.** LF5 `"{comprehension_artifact}"` materialises braces-kept, so a
body's `"{input_id}"` becomes a reference to the host's variable; LF6 `open_questions` materialises
braces-dropped as a literal (legality contested — see AF6, where `check-set-action-values` states the
repository's decided position that a value naming another variable has to be braced); LF8 an absent
value omits the binding.

**Identifiers — 7 cases.**

- **LF38** a one-segment prefix `reconcile-assumptions.batch-gate`. Assert the separator is `.` and
  not `#` or `::`: `#` is the per-iteration discriminator and the server splits a checkpoint id on the
  **first** one, `::` is the technique-path separator, and the checkpoint response key is `-`-joined
  over kebab-case ids and parsed back by prefix length at `src/utils/validation.ts:91`.
- **LF39** a four-segment prefix through nesting, `converge-assumptions.pass.iteration.challenge`.
- **LF40** a prefixed checkpoint id carrying the discriminator,
  `reconcile-assumptions.interview.decision#{current_assumption.id}`. This is the load-bearing half —
  22 of the corpus's 115 checkpoints sit inside a loop body, so this is the one prefix shape with a
  corpus case behind it.
- **LF41 — the simultaneity test, and it needs no fixture at all.** Substitute a binding
  `{ a: 'b', b: 'c' }` over a body naming both `{a}` and `{b}`, and assert the result names `b` and
  `c` — each occurrence renamed exactly once. An iterative rewrite yields `c` twice and passes every
  other assertion in this file. One `it`, ten lines, no tree, no server. The criterion has been
  uncostable for want of this paragraph.
- **LF42** an internal's materialised name carries **both** the host activity and the reference site,
  underscore-joined. A step id is unique within its activity; a variable name shares one flat
  namespace across the whole workflow, and prefixing from the reference site alone put one internal
  name in four activities.
- **LF43** an output bound to a name the host already declares → the injection is a no-op, because
  replacing the declaration puts two defaults for one variable into the merge.
- **LF44** an output bound to a name nothing declares → the injection supplies the declaration. The
  simulation behind the 12-declarations-across-seven-sites figure ran against merge behaviour that
  landed with stage 0, so assert against `mergeActivityVariables`
  (`src/utils/activity-variables.ts:113`) rather than against the recorded number.

**Bodies — 5 cases.** LF11 two references to one routine in one activity produce collision-free
prefixes; LF13 a reference inside a loop body materialises into that body; LF17 an action step's
`target`, `message` and `value` are all rewritten; LF18 a checkpoint step's message and option effects
are rewritten; LF20 a nested reference composes.

**The obligations nothing else reaches — 5 cases.**

- **LF46** the raw-text path. `injectResolvedStepIds` (`src/schema/activity.schema.ts:234`) derives an
  id textually from a `- technique:` opener and knows nothing of a routine prefix, so a spliced step
  without an authored id would arrive unprefixed in the text and prefixed in the object graph. Assert
  a materialised step in the delivered text carries an explicit prefixed `id:`, nested bodies
  included. **This case is synthetic by necessity** — see the zero-instance section.
- **L15** the merged-scope step-id collision. Write the re-check and **assert on the error**, not on a
  green run: prefixing makes the merged scope safe by construction, so with no cross-scope repeated
  step ids in the corpus a broken re-check passes. The two containers that would otherwise notice a
  clash both collapse it silently — `knownIds` is a `Set` (`src/utils/validation.ts:128`) and
  `declarationIndex` is a `Map` keyed by id (`:147`), and the second decides the step-order check, so
  a collision loses an order constraint as well as a manifest entry.
- **U8** the flattened step list carries no `kind: routine` at any depth. `flattenActivitySteps` is the
  single traversal every step consumer routes through — **8** files import it at this tree
  (`src/loaders/workflow-loader.ts`, `src/schema/activity.schema.ts`, `src/tools/resource-tools.ts`,
  `src/tools/workflow-tools.ts`, `src/utils/activity-variables.ts`, `src/utils/binding-provenance.ts`,
  `src/utils/validation.ts`, `tests/e2e/coverage.ts`) — and it recurses into exactly one thing.
- **U5** two references to one gate in one activity record under distinct composed keys.
- **U2** the session history carries no dispatch event naming the routine.

---

## Layer 4 — guard-run

Thirty of the 74 refusal cases are guard findings. They split across three existing guard tests, three
new ones, and two existing tests that gain one case each. Every one of them builds its tree with
`mkdtemp` plus `declareFixtureWorkflows`, because `requireWorkflowsRoot` refuses a root with no
workflow in it and `assertScanned` refuses a guard that inspected nothing.

**One helper edit serves all of them.** `writeWorkflowFixture` (`tests/corpus-fixture.ts:10-15`) writes
a three-line `workflow.yaml` and nothing else. Add `writeRoutineFixture(root, workflowId, name, body)`
beside it, writing `<root>/<workflowId>/routines/<name>.yaml`. Ten test files already import from this
module; without the addition, each guard test that gains a routines obligation writes its own.

**And one reserved name.** `workflowIdFromCorpusPath` (`src/loaders/corpus-index.ts:64-69`) finds a
file's owning workflow by looking for one of three reserved directory names declared at `:39` —
`activities`, `resources`, `techniques`. A `routines/` path resolves to `null`, and `citePath`
(`guards/workflows-root.ts:81-87`) then falls back to the raw relative path, so a finding sited on a
routine is keyed by path rather than by workflow id — the exact thing that function's doc comment says
the id-keyed site key exists to prevent. Adding `routines` to the set is one line. Not adding it
silently breaks every ledger site key that lands on a routine.

### `tests/variable-model.test.ts` · +6 cases · no fixture

The five `check-variable-model` rules rescoped to a routine file, with `setvariable-undeclared`
splitting into two arms that point opposite ways. All six drive `lintDocument` / `lintDeclarations`
directly with a routine-scoped declarations map, as the file's existing four cases do with a
workflow-scoped one.

- **G1** a `setVariable` naming neither a declared output nor an internal → `setvariable-undeclared`.
  Note what the positive arm has to be written against: today the rule requires a *workflow-variable*
  declaration, so **every gate in every routine violates it as authored**. A case asserting "zero
  findings on a correct routine" written against the current rule asserts the opposite of the truth.
- **G2** a `setVariable` naming a **workflow variable** → also `setvariable-undeclared`. Inside a
  routine file the rule inverts, and this is the arm a test is most likely to omit.
- **G3** `setvariable-type-mismatch` where the target is an output, **and silence where it is an
  internal** — both directions on one document, because an internal declares no type.
- **G4** `setvariable-outside-value-set` on an output. **Blocked**: a routine output is specified as
  "an id, a type and a description, and no default" and no value set is named anywhere, so this rule
  may have no subject inside a routine file. Write it as `it.todo` naming the decision.
- **G5** `default-type-mismatch` on an input's default against its declared type. **Blocked** the same
  way: nothing on the record says a routine input declares a type.
- **G6** `exists-on-defaulted` on an `exists`/`notExists` gate over a defaulted input.

### `tests/loop-shape-guard.test.ts` · +5 cases · `mkdtemp` + `declareFixtureWorkflows`

G13 is the largest single guard obligation in the plan and the proposal prices it in one clause of a
table row. Five rules, five cases: `item-loop-without-collection` (`guards/check-loop-shape.ts:59`),
`item-loop-with-continuation` (`:67`), `repeat-loop-without-continuation` (`:81`),
`repeat-loop-with-collection` (`:90`), `repeat-loop-with-break` (`:98`).

The existing `rootWithLoop(loop)` helper writes `<root>/demo/activities/01-demo.yaml`. Add
`routineWithLoop(loop)` writing `<root>/demo/routines/01-demo.yaml` and re-run all five assertions
against it. The guard has to walk the routine directory because a routine body holds loops and an
unbounded `while` in a shared definition propagates to every reference site.

### `tests/checkpoint-entry-guard.test.ts` · +2 cases · `mkdtemp`, and the tree must load

G11 is the case that forces `check-checkpoint-entry` out of the authored column and into the
materialised one, and the design says so: the assumption routine's first step is a checkpoint, so a
reference in first position evades the rule entirely against unexpanded text. The check is mechanical
— `steps[0].kind == "checkpoint"` (`guards/check-checkpoint-entry.ts:18`) — and the guard today
enumerates through `corpusWorkflows(root)` and reads raw activity YAML from each `activities/`
directory non-recursively (`:38-42`), consuming no loader.

- **Positive**: an activity whose first step is a `kind: routine` reference to a routine that opens
  with a checkpoint → one `checkpoint-at-entry` finding, its `site` the host activity and its `detail`
  naming the composed step id. **This tree must load**, unlike every other fixture in this file,
  because the positive arm only fires once the guard consumes the loader.
- **Negative**: the same reference to a routine whose first step is a technique → no finding.

The file's existing empty-root case stands unchanged and keeps protecting both.

### `tests/routine-contract-guard.test.ts` · 5 cases · `mkdtemp` + `writeRoutineFixture`

The routine's own contract, checked with no host activity in sight. `deriveActivityContract`
(`src/utils/activity-variables.ts:418`) takes a `scopeWorkflowId`, which is what gives a routine a
workflow to resolve its bound operations against.

- **G7** an output declared, nothing writes it. Same subject as L7 at the other strength — see the
  holes section, because the design states these at two levels and a plan has to pick.
- **G8** an input declared, nothing reads it. **AF4 is what makes this hard**: `readSignature`
  (`src/utils/activity-variables.ts:349`) collects every `{token}` from a bound operation's protocol
  blocks, rules and artifact filename templates, and those tokens live in technique markdown rather
  than in a step field, so materialisation cannot rewrite them. A signature check that trusts the
  derivation reports a prose-sourced read as an undeclared input. The design's own signatures do this
  three times.
- **G12** `check-activity-technique-overlap` resolving a reference step to the routine's own step
  bindings. **Blocked on the collector's signature** (no root parameter), and the matrix's verdict on
  the change itself is REMOVE — no activity in the corpus both lists and binds one technique, so a
  hard-zero guard would gain an admitted exception for a finding class with no member. Write the case
  only if the verdict is overturned.
- **G17** `unused-declaration` on a host that keeps a declaration the routine takes over. Hard zero,
  no ledger (`guards/check-activity-variables.ts:252`, `:263`).
- **L20** stage 7's per-site check: which site's argument made this an artifact-declaring routine.

### `tests/routine-placement-guard.test.ts` · 5 cases · `mkdtemp`, two workflows plus `meta`

The corpus-wide sweep. A load is per-workflow — `loadWorkflow(workflowDir, workflowId)` — while the
mirror these rules copy is corpus-wide by construction: `unused-fragment` is emitted at
`guards/check-fragments.ts:242` inside a sweep that first collects every reference across every
workflow's activities and then walks every workflow's declared fragments. The fixture therefore needs
at least two workflows and a `meta`, so the closure has somewhere to close over.

- **G9 / L13a** a routine with no reference site anywhere → a finding naming the routine and the
  search's reach.
- **G10 / L12a** a single-owner routine sitting in `meta` → a finding naming the computed home, the
  home on disk, and the referrer files that decide it.
- **L12b** a two-owner routine sitting in one of them → the same finding, the other arm.
- Plus the clean arm: LF36 and LF37, a routine whose referrer set spans two workflows living in
  `meta`, and one whose referrer set sits in one workflow living there. **Nesting sharpens this**: with
  `fan-conformance` at `corpus/specimens/fan-conformance`, "which workflow owns this file" is a
  `workflowOwning` / `citePath` question and no longer a path-prefix question.

### `tests/repeated-runs-guard.test.ts` · 3 cases · `mkdtemp`, two activities sharing a window

Stage 1's drift guard: a run of two or more consecutive steps appearing in two or more files with any
difference between the copies. Three of stage 1's five criteria are provocations, and the other two
are properties of the search rather than findings.

- A shared run with a difference **is** reported.
- A window contained in a longer shared window over the same file set is **not** reported separately.
- The guard reproduces the search's output over the corpus's own discovery rule — under
  `skipIf(!liveCorpusRoot())`, because engine CI has no corpus.

**The criterion cannot be a literal, and this is the sharpest correction in the whole plan.**
README:825-826 requires "26 maximal windows, five of them nested". Run at this tree the proposal's own
search reports **24 — 19 top level and 5 nested**. And the search is path-shaped:
`measure/repeated-runs.py:95` globs `*/activities/**/*.yaml` and therefore parses **122 of the 132**
activity files, missing the whole of `specimens/fan-conformance/activities/`. Made depth-agnostic it
parses 132 and reports the same 24 (19/5) — so the count survives the correction and the file set
silently does not, which is precisely what makes the blind spot easy to ship. A guard promoted from
this script would pass its own acceptance criterion while measuring a corpus the server does not have.
State the criterion as the search's output over `corpusWorkflows`, never as a number; stages 6 and 8
both grade convergence by that baseline falling and by nothing else, so both inherit it.

Widen the file set to the routine directory in the same edit, with a routine declaration counting as a
site — otherwise the re-inlining comparison loses its policeman at stage 5, `duplicate-checkpoint`
requiring two inline sites while a migration leaves one inline copy against one routine declaration.

### `tests/review-mode-gating.test.ts` · +1 case

G15 asserts a finding that *should* fire and does not. The guard exempts a mode-aware checkpoint by
matching the literal `is_review_mode` in a step's `when` or condition
(`guards/check-review-mode-gating.ts:113`), and inside a routine that name would be an input id — so
the exemption misfires in both directions. The case: a routine body gate whose `when` names an input
called `is_review_mode` is exempted although nothing seeds it. This is a coverage loss the migration
*inherits* rather than one it creates, which makes it a finding with a mechanism, and it belongs in a
risk class it currently sits in nowhere.

### `tests/binding-fidelity.test.ts` · +1 case

G16: `check-binding-fidelity` reads raw activity YAML and injects textually, never touching the loader,
so a routine reference it cannot materialise is an unresolvable read at every input. Blinding it makes
every recorded judgement silently vacuous rather than failing loudly. The ledger holds **71** entries
at `ledgers/binding-fidelity-triage.json` on the corpus branch. **Blocked on the collector's
signature** — `collectViolations()` (`guards/check-binding-fidelity.ts:738`) takes no root. Until it
does, the writable case is the narrower one: assert the guard *reports* rather than silently resolving,
by driving `expressionReads` over a routine-input token.

### `tests/fragments-guard.test.ts` · +1 case, and a re-derivation

G18 asserts a rule's **disappearance**. `undeclared-effect-variable` fires today on a borrowing
workflow whose `variables[]` does not declare a name a shared body's effects write, because the effect
fires in the borrower's bag. Under a routine the contribution is mechanical — the outputs are full
variable declarations travelling with the activity — so the hand-written declaration goes and the
finding goes with it. Assert the rule reports nothing on a migrated fixture and that the by-hand
declaration it forced is gone.

Stage 5's edit to this root is smaller than "delete the fixture": **48 of 100 lines, two of six files,
zero of three directories.** `alpha-fixture/workflow.yaml` lines 7–31 (the `fragments:` block) go and
its `rules:` block stays, because it is one half of a `duplicate-rule` pair;
`alpha-fixture/activities/00-alpha-activity.yaml` and `beta-fixture/activities/00-beta-activity.yaml`
go whole; `gamma-fixture` is untouched. The test's closing assertion that the root reports nothing
beyond the engineered defects re-derives from **8 violations to 3** — two `duplicate-rule` and one
`duplicate-checkpoint`. Both surviving trees keep loading with zero activities each, which the
drop-and-continue behaviour guarantees.

---

## The committed fixture root

### `tests/fixtures/routines/` — 7 trees · `tests/routine-corpus.test.ts` · 12 cases

The fan's precedent is 17 trees, 79 files and 1,290 lines — 57% of everything under `tests/fixtures`.
A routine needs fewer, for a measured reason: a loaded fan is still a fan, so six fan test files assert
on one through the server or the loader, while a loaded routine is a host activity with substituted
steps and prefixed identifiers. The harness-facing half of a committed root buys less here. Seven
trees:

| Tree | Proves | Read by |
|---|---|---|
| `host-fixture` | a routine plus one host activity referring to it, with an output remap (LF1, LF9) | harness, loader, guards |
| `twice-fixture` | one host carrying two references to one routine (LF11, U5) | loader, materialisation |
| `nested-fixture` | a routine referring to a routine, four prefix segments deep (LF20, LF25, LF39) | loader |
| `borrower-fixture` | an activity borrowed from `host-fixture`, its bare reference resolving against its **source** (LF34) | loader |
| `loop-fixture` | a routine owning a `doWhile` with `continueWhile`, and a reference inside a `forEach` body (LF13, LF19, LF27) | loader, `check-loop-shape` |
| `meta` | the shared home a bare name falls back to (LF32), and the bootstrap every harness needs | harness |
| `defect-fixture` | one engineered guard defect — a routine gate whose `setVariable` names a workflow variable (G2) | guards only |

The twelve cases: seven `it.each` load-clean assertions; the root serves a `createHarness` and
delivers a materialised activity; a raw-reading collector over the root reports exactly the one
engineered defect and nothing else; **G19** — `check-resource-anchors` reaches `routines/*.yaml` with
no change at all, because its `walkFiles` recurses into every directory except `.git` and
`node_modules` and yields every `.md` and `.yaml` (`guards/check-resource-anchors.ts:75-83`, driven
from `:94`), which makes it the one guard that needs nothing and the one worth asserting is free;
`workflowIdFromCorpusPath` names a routine file's owning workflow; and `citePath` keys a routine
finding by workflow id rather than by path.

That the fan root serves both a real server and a raw-reading guard is the single most useful
precedent here — `check-activity-variables` is exactly the guard stage 4 requires to resolve a
routine's effects against its declared outputs and internals, and one root has already been shown to
serve it and a harness at once.

---

## Layer 5 — delivery observation

No refusal reaches a live session, so nothing in this layer asserts an error. Six obligations, and a
test that asserts "no error appeared" passes on a broken implementation for most of them.

### `tests/e2e/routine-delivery.test.ts` · 5 cases

`createHarness({ workflowDir: resolve(import.meta.dirname, '../fixtures/routines') })`. **This points
the walker at a fixture corpus for the first time** — every existing `walk()` call site uses a bare
`createHarness()` against the live corpus, so the combination needs no code change and is worth a
smoke assertion of its own.

- **O1 / LF45** delivery is byte-identical for an activity carrying no routine. The precedent exists:
  `scanCheckpointRefLines` (`src/loaders/fragment-resolver.ts:218`) is a pre-scan that keeps files
  with no `ref:` off the resolution path entirely. **128 of 132** corpus activity files are the
  byte-identical population today — 8 `ref:` reference steps stand across 4 files.
- **O3** a worker cannot tell a step came from a routine. Assert the delivered step list, not the
  absence of an error.
- **O5** the checkpoint instance id the agent composes by hand. The two consumers of a generated
  identifier fail differently: `get_technique` resolves a step id by exact match and throws with the
  full list of available ids, while a mis-composed checkpoint instance id splits on the first `#` and
  **silently** re-asks a question whose answer already exists. Assert the loud one; observe the silent
  one.
- **O6** delivery budget. Materialised routine steps are eager-bundling candidates and count against
  the per-activity budget. The one delivery baseline in the tree is a set of per-tool character totals
  over a single twelve-activity `work-package` walk under the e2e `skip-optional` policy, and two of
  the four stage-5 hosts — `04-research` and `05-implementation-analysis` — both declare
  `required: false` and appear nowhere in it. Adding them moves the baseline total, so it happens
  before the migration rather than inside it.

Note which baseline is meant. The one that gates CI is `tests/fixtures/token-benchmark-baseline.json`,
recorded against `token-bench/delivery-fixture` (`.github/workflows/verify.yml:51-54`, gating at 1%) —
a two-activity tree that carries no routine and never will. It proves O1 and nothing else. The
criterion about re-recording a baseline "at each site" refers to walk artifacts on the corpus tree
that engine CI does not have.

### `tests/routine-differential.test.ts` · 2 cases

**O2 — the differential test, and the criterion has to name a root CI has.** Both paths run side by
side in one handler today: `src/tools/workflow-tools.ts:1423` calls `injectResolvedStepIds` on the raw
text while `:1436` calls `loadWorkflowWithDiagnostics` for the object graph. The test drives both over
every activity in a named population and compares.

- Compare parsed objects field for field.
- Compare **as text** the fields a worker acts on directly: a checkpoint's `message` and `id`, an
  option's `label` and `effect`, a step's `when`, a loop's `over` and `continueWhile`. The failure this
  catches is a worker reading a step the server does not believe exists.

Nothing in the tree does this today: the one test of the textual path runs the fragment injector alone
over a small synthetic fixture, and **no test names `injectResolvedStepIds`** — grepped across `src`,
`guards` and `tests`, its only non-definition mention is the call site.

Population: `tests/fixtures/routines` and `tests/fixtures/token-bench` unconditionally, plus the live
corpus under `skipIf(!liveCorpusRoot())`. Stating the criterion as "every activity in the corpus"
grades it against **zero** activities on the engine tree, because `verify.yml:28` checks out with
`submodules: false`.

---

## What cannot live in a corpus workflow

**Every refusal case — all 53 provocable ones, and all 11 undecided ones.** The rule is mechanical
rather than stylistic. A corpus workflow has to pass `loadWorkflow` and all 41 registered guards under
`npm run check:all`, and anything added to the corpus is additionally walked by
`all-workflows-walk`, has to be listed in `WALKED` or `NOT_WALKED` or `coverage-roster` fails it, and
enters the `option-coverage.json` denominator. A deliberately broken routine in the corpus is a red
sweep on the corpus branch, on every pull request, for as long as it sits there.

The inverse is what makes fixtures a viable home: **the corpus must pass every guard and the loader;
a fixture tree must pass only whatever its own test asks of it.** `tests/fixtures/message-binding/binding-fixture`
is the standing proof — it fails `loadWorkflow` today on an option selecting an undeclared exit, and
nothing notices, because nothing loads it. Both `markdown-techniques` trees fail with
`initialActivity: Required` for the same reason.

So the division is:

- **Illegal shapes → a temporary tree**, invisible to everything except the assertion beside it.
  Nothing in `check:all` walks `/tmp`, no schema is regenerated against it, no coverage walk reaches
  it, and no reviewer reading a diff of `tests/fixtures/` sees it. That is the right property for a
  case whose whole content is one error message. All 34 cases in `routine-load-rules`, all 30
  guard-run cases, and the two raw-text arms of `routine-materialisation` belong here.
- **Legal shapes that need a server or a loader → the committed root.** Seven trees, all loading
  clean, one carrying a single engineered guard defect — which is safe only because the defect is a
  *guard finding* rather than a load failure, exactly as all seven of the fan root's defect trees are.
- **Nothing at all in the corpus until stage 5.** The corpus gains routines when the migration lands,
  and every case above is written against a tree the corpus never sees.

**One warning specific to this construct.** A guard fixture and a load fixture cannot be the same
tree. The committed guard roots are read raw, so an illegal form in them is the subject; the harness
roots are loaded, so an illegal form in them is either invisible — dropped, per the loader's
drop-and-continue — or fatal to every test in the file. The fan resolved this by keeping the two
apart. A routines landing has the same constraint and less room, because its guard fixtures and its
load fixtures want the *same* construct at the *same* site.

---

## What needs a synthetic fixture because the corpus has no instance

Nine shapes. For each, the measurement, and what a corpus-sourced test would prove instead.

**1. A step whose first key is `technique:` — zero instances in 200 activity files.** This is the
sharpest case, because a whole acceptance criterion rests on a key order nothing writes.
`injectResolvedStepIds` (`src/schema/activity.schema.ts:234`) matches
`/^(\s*)- technique:[ \t]*(.+)$/gm` — a step whose *first* key is `technique:`, with the id line
absent. Measured across all **132** corpus activity files: **0 matches, in 0 files**. Measured across
all **68** fixture activity files: **0**. Stage 3's raw-text criterion (LF46) is therefore correct as
an obligation and empty as a justification: no file in the repository can exercise the regex, so the
case has to author the key order by hand. Without a synthetic fixture the test passes vacuously
forever.

**2. Two references to one routine in one activity (LF11, U5, L14).** Zero corpus instances — no
activity refers to either shared gate body more than once, and the design says so itself. The prefix
is what makes the second reference safe, so the property with no corpus case is precisely the one that
justifies the prefix mechanism. `twice-fixture` exists for this.

**3. A routine referred to only by other routines (LF35).** Zero corpus instances — the pass the
convergence routine wraps is referred to by an activity directly as well as through the loop. Without
the transitive clause such a routine has no referring activity file and the placement rule returns
nothing, which is a guard with no verdict rather than a wrong one.

**4. A `forEach` carrying `breakCondition` (LF26, G13's fifth rule).** Re-measured here: **0** of the
corpus's 53 loop steps carry it, against 27 carrying `continueWhile`. It is on the keep list twice
over — `check-loop-shape`'s `repeat-loop-with-break` rule reads it at `guards/check-loop-shape.ts:98`
while the guard's own local loop interface omits the field, and `guards/` sits outside
`tsconfig.json`'s `"include": ["src/**/*"]` (`tsconfig.json:22`), so the compiler never notices.

**5. Any loop at all, in a fixture tree.** Across all 68 fixture activity files there are **58** steps
— 44 `action`, 8 `checkpoint`, 5 `technique`, and 1 with no `kind` at all (the `ref-opens-step`
defect). **Zero `loop` steps, and zero nesting of any kind.** So the fixture corpora contain no
instance of the construct stage 0 landed `continueWhile` for, and a routine that owns a loop — the
whole justification for stage 0 standing alone — has no fixture precedent to copy. `loop-fixture`
writes the first one.

**6. A merged-scope step-id collision (L15).** No cross-scope repeated step ids in the corpus, so a
re-check lands green on day one whether or not it is correct.

**7. An activity that both lists and binds one technique (G12).** The population is 32 files, 33
entries and 4 distinct names corpus-wide; the guard's own non-recursive scan reads 28 files and 29
entries; and no activity does both. None of the four listed names appears among the techniques stages
5 to 8's routines bind.

**8. A gate option carrying `effect.exit` inside a routine body (AF2).** Re-measured: **49** options
across **28** activity files carry one, but none inside the runs stages 5 and 6 convert. The sharper
version has no instance either — all three `meta/activities/patterns/` activities declare zero exits,
and a routine cannot select an exit from an activity that has none.

**9. A gate inside the stage-7 `prism` family (L21).** Re-measured: `02-adversarial-pass.yaml`,
`03-synthesis-pass.yaml` and `05-behavioral-synthesis-pass.yaml` are 41 lines each and carry **zero**
`kind: checkpoint` steps. A third of the price stage 7 is "already priced at" buys nothing at the
family it exists for, and no synthetic fixture fixes that — the check has to be dropped or aimed at a
family that has gates.

---

## Prerequisites, each one small and none of them scheduled

Five edits stand between this plan and a writable case. Together they are under thirty lines and no
stage names any of them.

1. **`routines` joins `RESERVED_DIR_NAMES`** at `src/loaders/corpus-index.ts:39`, so
   `workflowIdFromCorpusPath` names a routine file's owning workflow and `citePath` keys a finding by
   workflow id. One line; without it, every ledger site key that lands on a routine breaks silently.
2. **`writeRoutineFixture` joins `tests/corpus-fixture.ts`.** Ten test files already import from this
   module; without it, each guard test that gains a routines obligation writes its own routine writer.
3. **Three collectors gain a root parameter** — `collectActivityTechniqueOverlapViolations`
   (`guards/check-activity-technique-overlap.ts:55`), `collectViolations`
   (`guards/check-binding-fidelity.ts:738`), `collectBrokenAnchors`
   (`guards/check-resource-anchors.ts:91`) — matching the `root: string = ROOT` shape
   `collectVariableModelViolations` and `collectFragmentViolations` already have. Until then G12, G16
   and G19 have no writable case against a fixture.
4. **Every new guard is registered in `guards/guards.ts`**, or `tests/guard-registry.test.ts` fails it
   as an unaccounted script on disk. 41 guards are registered against 46 `check-*`/`validate-*` files.
5. **The delivery baseline moves before the migration, not inside it** — `04-research` and
   `05-implementation-analysis` enter the recorded walk while they still carry no routine, so the
   baseline shift is attributable.

And one decision, which is not small. **L7–L9 and G7–G8 are the same three checks at two enforcement
strengths**, because the design states them both ways: README:869-871 says "fail the load" and
README:713-718 draws them as guard findings. The plan carries both, which is why those five cases
appear twice in the counts above under different files. Picking one strength deletes three cases and
changes the fixture for the other three. Pick before writing either.

---

## The holes

What this plan will not catch, stated plainly, with what is asserted instead. A property no test
reaches is not a gap when the substitute is named and honest; it is a gap when the plan reports it as
covered.

**Six cases have no home under any decision available.**

| Case | Why nothing reaches it | What is asserted instead |
|---|---|---|
| **L13b** — a routine with no reference site *anywhere*, at load | A load is per-workflow (`src/loaders/workflow-loader.ts:239`) and the resolution rule admits a cross-workflow reference, so a per-workflow load of one workflow sees no reference site for another's routine and would fail while one exists a directory away. A corpus-wide scan at load is possible — `indexCorpus` sits one import away — so the objection is cost and shape rather than possibility | **G9**, at guard-run, in `routine-placement-guard.test.ts`, alongside `unused-fragment`. Accept that the finding then lands on the corpus pull request rather than on the engine one |
| **L14** (2 arms) — an artifact-declaring routine referenced twice in one activity | No mechanism exists at any grain: `artifactNames` is a `Set` (`src/utils/activity-variables.ts:231`), both `fan-artifact-collision` consumers are keyed on a fan (`guards/check-activity-variables.ts:385`, `:401`, `:423`), and the artifact composition keeps its own seen set. The corpus meanwhile writes one filename from two or more step bindings at 24 (filename, activity) pairs across 11 files, the largest at four steps, and calls it produce-then-revise | **Nothing, and the rule is deleted.** The verdict is REMOVE: the case has no corpus instance, and removing the rule also takes the transitive-closure obligation off the artifact check — placement still needs the closure and the artifact check no longer does |
| **L21** — stage 7's gate-option-per-site check | The three `prism` files it exists for carry zero gates | Drop the third check from stage 7's criterion, or name a family that has gates. No fixture repairs a check whose subject family is empty |
| **L22 / X5** — "materialisation runs after identifier resolution and before contract derivation, and a test fails if the order is swapped" | **There is no order to swap.** `deriveActivityContract` (`src/utils/activity-variables.ts:418`) has exactly two call sites in the repository, both in one guard — `guards/check-activity-variables.ts:158` and `:483` — and the loader never calls it. Both guard call sites read loader output that is already materialised, so a routine reference is gone before the derivation ever meets it | The **structural property the order was meant to guarantee**, asserted directly in `routine-materialisation.test.ts`: the derivation over a materialised activity yields the routine's declared outputs as writes and its declared inputs as reads, and yields nothing named only inside the routine. Three mechanisms could supply the real ordering and the proposal names none — the loader exposes both forms, or the derivation moves into the loader, or the loader records the sites it spliced and hands them over as a side table. **Stage 4's entire contribution rests on which** |
| **G20 / X4** — every option of every gate in a shared run exercised once | **The walker has no routine entry point.** `walk()` (`tests/e2e/walker.ts:681`) takes `(harness, workflowId, policy, opts)`, opens with `start_session` and `get_workflow`, and everything downstream reads an activity that requires `id` and carries `exits`; a routine is never a transition destination and declares no exits. The promised routine-level entry is a **second walker**, and no stage budgets it. Its seed cannot supply the values either: both re-derived signatures bind operations declaring inputs the signature does not carry, and two of those three names are marked optional and therefore `suppliable` in `readSignature` (`src/utils/activity-variables.ts:378`), so the derivation consumes rather than reads them | **Option coverage stays where it is**, over host activities, on the corpus, in the opt-in coverage walk. Settle AF4 first — the seed question and the free-variable question are one question |

**Two more properties nothing reaches, recorded rather than counted.**

- **U3 — two uses of one run agree on their steps.** Ten measured differences across four copies have
  nowhere to live. Nothing in the guard suite compares step *sequences*, verified by reading rather
  than by filename: `check-activity-technique-overlap` compares sets, `check-fragments`' two duplicate
  rules index single bodies and single rule strings, and nothing in `guards/` builds a key from more
  than one step. **What is asserted instead: one file.** The property is a consequence of the
  construct rather than a check on it, and G14 is the nearest thing to a policeman — a drift guard
  that reports a shared run with a difference. That is a detection, not a guarantee.
- **AF10 — the positional step keys.** `currentStep` and `completedSteps` are keyed on
  `StepIndex = z.number().int().min(1)` (`src/schema/state.schema.ts:4`), a position rather than a
  name, and materialisation splices N steps in place of one, shifting every index after a reference
  site. The design addresses the composed checkpoint key and accepts the re-ask; it says nothing about
  the indices, and neither does any sweep. **What is asserted instead: nothing, and the mitigating
  fact is that both fields are vestigial** — which is what makes this a keep-with-a-discriminator
  rather than a defect.

**The compile-time exhaustiveness assertion (X8) is half-deliverable, and the half that works is the
one worth having.** `tsconfig.json:22` sets `"include": ["src/**/*"]` and `typecheck` is
`tsc --noEmit`, so `guards/` and `tests/` are never typechecked — and the guard scripts moved *into*
`guards/`, which leaves the position unchanged and the path stale in every earlier record. The closed
four-kind union at `tests/e2e/walker.ts:68` is the only compiler-enforced step-kind enumeration in the
repository and it sits outside the include, so a fifth kind produces no error there. The single field
that disables the net inside `src/` is `...stepEntryCondition`: with it, a fifth `StepSchema` member
compiles clean against a kind nothing handles; without it, three type errors name the three sites that
must change, and **those three errors are the only exhaustiveness signal the repository has**. So:
assert the exhaustive discrimination in `src/` at the one place that consumes the kind, add a runtime
assertion or a test for the guard scripts, which no compiler protects, and do not claim the
population. The refutation passes measured that population three ways — 64 comparison sites across 22
files by one rule, 61 across 22 by another, against the proposal's "57 places across 19 files" — and
only the `src/` share is protected under any of the three readings.

**A smoke test proves nothing about this construct, and that is the construct working as designed.**
Zero of the 53 refusals sit at live-session and zero sit at walk. The graph fan's equivalent matrix
places 15 of its 39 refusals on the tool surface; a routine places none, because a `kind: routine`
step exists between parsing and materialisation and nowhere else, and the worker cannot tell one came
from a routine. This is the property that makes the whole surface cheap — schema-parse and load-fixture
between them reach 23 of the 74 refusal cases with no server and no session — and it is also why the
fan's instrument is the wrong one here. The five delivery observations in `tests/e2e/` are the whole
of what a running server contributes.

**Two rules fire on legal input, and a test written the obvious way asserts the opposite of the
truth.**

- **L10 fires on legal bodies.** "A body naming anything outside the three categories fails the load"
  meets a technique's prose `{token}`, which materialisation cannot rewrite because it is not a step
  field. The rule as specified reports every prose-sourced read as undeclared — three times over in
  the design's own signatures. The category either gains carve-outs or the tight boundary goes, and
  the tight boundary is one of the construct's two claimed advantages over any arrangement that shares
  a body without a signature.
- **G1 fires on every routine as authored.** That is by design and is the reason the name scope
  exists. A case asserting "zero findings on a correct routine" has to be written against the rescoped
  rule and not the current one, or it asserts that correct routines are broken.

---

## How each figure was taken

Every command runs from `/home/mike1/projects/dev/workflow-server` at `fe5f5f78`, with the corpus
worktree at `.worktrees/workflows` at `e9d26007`.

- **Tree identity** — `git rev-parse HEAD` in each checkout.
- **Fixture surface** — `find tests scripts guards -name 'workflow.yaml' | wc -l` → **28**;
  `find tests scripts guards -path '*/activities/*' -name '*.yaml' | wc -l` → **68**.
- **Corpus surface** — the same two searches under `.worktrees/workflows` → **18** and **132**.
- **Steps by kind** — a `yaml.safe_load` walk of all 132 corpus activity files, recursing into a
  `kind: loop` node's `steps`: **1,005** steps — 676 technique, 161 action, 115 checkpoint, 53 loop —
  with **22** of the 115 checkpoints at loop depth one or greater, **0** loops carrying
  `breakCondition` and **27** carrying `continueWhile`, **49** checkpoint options carrying
  `effect.exit` across **28** files, and **189** carrying `effect.setVariable`. Every one of these
  reproduces the permutation matrix to the digit.
- **Fixture steps by kind** — the same walk over the 68 fixture activity files: **58** steps — 44
  action, 8 checkpoint, 5 technique, 1 with no `kind`. **Zero loop steps.**
- **The `- technique:` opener** — `injectResolvedStepIds`' own regex,
  `/^(\s*)- technique:[ \t]*(.+)$/gm`, applied to the raw text of all 132 corpus activity files
  (**0** matches in **0** files) and all 68 fixture activity files (**0**).
- **Guards and schemas** — `grep -c "id: '" guards/guards.ts` → **41**; `ls guards` matches **46**
  `check-*`/`validate-*` files; `ls schemas/` shows six `.schema.json`;
  `grep -c "^generate(" scripts/generate-schemas.ts` → **5**.
- **Test-file populations** — `ls tests/*.test.ts tests/e2e/*.test.ts | wc -l` → **100**;
  `ls tests/*guard*.test.ts | wc -l` → **14**; `grep -rln "declareFixtureWorkflows" tests/` → **10**
  files including the helper; `grep -rln "liveCorpusRoot" tests/ | wc -l` → **28**;
  `grep -rn "skipIf" tests/*.ts tests/e2e/*.ts | wc -l` → **42**.
- **File sizes cited as templates** — `wc -l`: `tests/fan-load-rules.test.ts` **740**,
  `tests/workflow-loader.test.ts` **443**, `tests/schema-validation.test.ts` **455**,
  `tests/fragment-resolver.test.ts` **246**, `tests/fan-container-guard.test.ts` **188**,
  `tests/set-action-values.test.ts` **192**, `tests/loop-shape-guard.test.ts` **113**,
  `tests/binding-fidelity.test.ts` **98**, `tests/variable-model.test.ts` **85**,
  `tests/checkpoint-entry-guard.test.ts` **75**, `tests/review-mode-gating.test.ts` **66**,
  `tests/generated-schemas.test.ts` **60**, `tests/fragments-guard.test.ts` **58**,
  `guards/workflows-root.ts` **139**, `tests/e2e/harness.ts` **136**, `tests/corpus-root.ts` **46**,
  `tests/corpus-fixture.ts` **29**.
- **Collectors taking no root** — read directly:
  `guards/check-activity-technique-overlap.ts:55`, `guards/check-binding-fidelity.ts:738`,
  `guards/check-resource-anchors.ts:91`, against module-level `ROOT` at `:24`, `:77` and `:29`. The
  two that do take one: `guards/check-variable-model.ts:160`, `guards/check-fragments.ts:115`.
- **`flattenActivitySteps` consumers** — `grep -rln` over `src`, `guards` and `tests` returns **8**
  files.
- **`injectResolvedStepIds` mentions** — `grep -rn` over `src`, `guards` and `tests` returns three
  lines: the definition at `src/schema/activity.schema.ts:234`, the import at
  `src/tools/workflow-tools.ts:28`, and the one call at `:1423`. **No test names it.**
- **Engine CI has no corpus** — `.github/workflows/verify.yml:28` is `submodules: false`; the
  delivery gate at `:51-54` sets `WORKFLOWS_DIR: tests/fixtures/token-bench` and compares against
  `tests/fixtures/token-benchmark-baseline.json`, failing at 1%.
- **The loader's drop-and-continue** — `src/loaders/workflow-loader.ts:88-93`: `safeValidateActivity`
  fails, `logWarn('Skipping invalid activity')`, push a `DefinitionLoadError`, `continue`.
- **The step union** — `src/schema/activity.schema.ts:167-172` declares `StepSchema` over four
  members; the loop body recurses through `z.lazy` at `:162`; `populateStepIds` throws for a non-technique
  kind at `:198`.
- **Borrowing** — a walk of all 18 workflow manifests collecting, per activity id, every workflow whose
  graph names it as a destination, as a graph source or as its `initialActivity`: **23** ids are named
  by more than one, and `remediate-vuln` names **14** it holds no activity file for. The matrix carries
  21 and 13; the difference is the counting rule, not the tree, and I state mine rather than round to
  the carried figure.
- **The `fragments` block and its reference sites** — `grep -n "^fragments:\|^techniques:"` on
  `corpus/work-package/workflow.yaml` gives `15` and `72`, so the block is lines 15–71, **57** lines;
  `grep -rn "ref: assumption" --include=*.yaml corpus/` gives **8** across **4** files, leaving
  **128** of 132 activity files in the byte-identical population; `grep -rn "name: challenge_findings"`
  gives **7**.

Figures carried from the matrix and the fixture sweep rather than re-taken here are attributed in
place: the 24 maximal windows at 19 top level and 5 nested, the 122-of-132 glob, the 71-entry
binding-fidelity ledger, the 8-violations-to-3 fragments re-derivation and its 48-of-100-lines edit,
the 264-of-672 resolution-rule agreement, the 24 duplicate-artifact pairs across 11 files, the 12
injected declarations across seven convergence sites, and the step-kind comparison-site populations.
