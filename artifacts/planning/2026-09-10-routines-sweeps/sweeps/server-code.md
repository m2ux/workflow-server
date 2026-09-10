# The server code a routine would supersede, measured

Sweep of `src/`, `scripts/` and `tests/` for the routines proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Server tooling at `9ca71c19`
on `main`; corpus at `2b8b7215` on the `workflows` branch. Companion to the three ground-truth
records in [../ground-truth/](../ground-truth/); where a figure here disagrees with one of them, or
with the proposal, this document gives its own and says so.

**Nothing in the design is built.** `grep -rin routine src scripts tests --include=*.ts`, with the
English adverb filtered out, returns nothing at all. `ls -d workflows/*/routines` reports no such
directory. `schemas/activity.schema.json` declares four members of `steps[].anyOf`, each requiring
`kind`. So every construct below is one that stands today.

## What binds this surface together

The construct adds eight things: a discovery pass for `routines/`, a `kind: routine` step, reference
resolution, simultaneous substitution over a fixed field list, identifier prefixing, a
signature-versus-body check, a computed placement rule, and one change to the contract derivation.
Read against the code, seven of the eight land on **one file and two functions**:
`src/schema/activity.schema.ts` holds the step union, the identifier pass and one of the two textual
injectors; `src/loaders/fragment-resolver.ts` holds the whole of the mechanism this replaces, in both
of its representations; and `src/utils/activity-variables.ts:417` holds the derivation the boundary
changes. The eighth — placement — has no code today in any form.

That concentration is the finding. The proposal reads as touching four participants and a guard
suite; measured, the server-side delivery is a new schema member, a new pass beside a 239-line
resolver, and three functions changed. What is *not* concentrated is the risk: it sits in a textual
injector with zero subjects, in a derivation that is not in the load path the design diagram puts it
in, and in a step-kind population where 27 of 61 test sites are outside the typechecker.

**Seventeen candidates.** One is removed outright and one is deprecated by the runner rather than by
this construct; ten narrow; five are KEEPs a reader would expect the construct to take and it does
not.

## Verdicts

| Id | Construct | Verdict | Stage |
|---|---|---|---|
| CV1 | `injectResolvedStepIds` — the textual step-id injector | REMOVE | 3 |
| CV2 | The two-injector delivery chain and the order among its stages | NARROWS | 3 |
| CV3 | `injectCheckpointFragmentBodies` — two consumers, one runner-conditional | KEEP | 3 / 5 |
| CV4 | `materializeActivityFragments` — the object-path fragment materialiser | NARROWS | 5 |
| CV5 | `deriveActivityContract` is not in the load path | NARROWS | 4 |
| CV6 | The "one change" to the derivation, measured by compiler | NARROWS | 3 / 4 |
| CV7 | No exhaustive switch over step kinds, and 27 sites outside the typechecker | NARROWS | 3 |
| CV8 | `flattenActivitySteps` and the eight independent walks | KEEP | none |
| CV9 | `populateStepIds` — the per-scope identifier pass | NARROWS | 3 |
| CV10 | `[workflow::]name` resolution with a `meta` fallback, three times over | NARROWS | 3 |
| CV11 | `TechniqueBindingSchema` — the argument grammar `with` duplicates | NARROWS | 3 |
| CV12 | The derivation cannot take a non-activity, and prose reads are free variables | NARROWS | 4 |
| CV13 | `unused-fragment` and `duplicate-checkpoint` — the reusable half of stages 1 and 4 | KEEP | 1 / 4 |
| CV14 | `fan-artifact-collision` — the filename-collision family, fans only | KEEP | 4 |
| CV15 | The raw-text delivery path | DEPRECATE | none — runner |
| CV16 | Activity discovery, and the schema generator with no verifying variant | NARROWS | 3 |
| CV17 | `INSTANCE_SEPARATOR` and the checkpoint response key | KEEP | 3 |

---

## CV1 — The textual step-id injector has zero subjects in the corpus

**Construct.** `injectResolvedStepIds` at `src/schema/activity.schema.ts:234-243`. It rewrites
delivered activity YAML with one regex, `/^(\s*)- technique:[ \t]*(.+)$/gm`, inserting an `id:` line
derived from the technique reference's last `::` segment ahead of any step whose list opener is
`- technique:` and which carries no id. Its object-path counterpart is `defaultStepId`
(`src/schema/activity.schema.ts:181-184`), called from `populateStepIds` at `:205`.

**Measured references.** One definition, **one** production call site
(`src/tools/workflow-tools.ts:1399`), and **no test anywhere**:
`grep -rn "injectResolvedStepIds" tests/` returns nothing. `defaultStepId` has exactly two
consumers, `:205` and `:239`, and both are unexercised by the corpus.

Its subject population is zero, three ways over:

| Measurement | Result |
|---|---|
| Activity files whose text `injectResolvedStepIds` changes | **0 of 117** |
| Source lines matching the `- technique:` opener regex, across all 122 activity files | **0** |
| Technique steps declaring no `id:` (the object path's subject) | **0 of 672** |

The first two come from the tsx probe recorded under *Re-taking every figure*; the third from a
`yaml.safe_load` walk of all 122 activity files, which also reproduces `stage-0-state.md`'s
population exactly — 1,003 steps, 672 of them `kind: technique`.

The regex cannot easily acquire a subject either. `kind` is **required** on every step member —
`schemas/activity.schema.json` gives the technique member `required: ["kind", "technique"]` — so a
step whose first YAML key is `technique` must still write `kind: technique` on a later line to
validate. The injector's target is therefore a schema-valid step authored in an unnatural key order,
which nothing in the corpus does.

**Verdict: REMOVE.** Stage 3 forces the decision either way, because the proposal's own criterion
(README:858) exists solely to keep this injector out of the way of the routine splicer: "the textual
splicer emits an explicit prefixed `id:` on every step it splices … so `injectResolvedStepIds` has
nothing to match inside a materialised routine." The injector has nothing to match anywhere. Deleting
it retires the criterion, retires the ordering question
[agent-interpretation.md §2](../../2026-09-03-routines/agent-interpretation.md) raises, and takes one
of the two textual rewrites off the delivery path.

**What breaks if it goes at the wrong time.** Nothing measurable today. The hazard it was written
against — object path holds an id the text path does not — is **already live for the other authoring
form** and this injector does not cover it: a step written `kind: technique` first with no `id:` gets
an id from `populateStepIds` and none from the regex. So removal does not create that divergence; it
removes a partial guard against a divergence the corpus does not exercise. If it is removed, the
honest replacement is to require `id` on the technique step member, which makes both `defaultStepId`
consumers dead and is a schema change the routine work does not need.

---

## CV2 — Two textual injectors, four textual stages, and nothing guarantees the order

**Construct.** The `get_activity` handler assembles the delivered activity text in four stages, all
sequential statements in one function body:

1. `injectResolvedStepIds(rawActivity)` — `src/tools/workflow-tools.ts:1399`
2. `injectCheckpointFragmentBodies(activityBody, …)`, gated on the
   `scanCheckpointRefLines` pre-scan — `src/tools/workflow-tools.ts:1405-1410`
3. the composed artifact contract appended to the same string —
   `src/tools/workflow-tools.ts:1823-1825`
4. the ops section, header, inherited rules and enforcement notes prepended —
   `src/tools/workflow-tools.ts:1867`

**Measured references.** The order the proposal names — the id injector, then the fragment injector
— reproduces at `:1399` then `:1408`. **Nothing guarantees it.** There is no comment stating the
ordering is load-bearing, no test naming `injectResolvedStepIds`, and no differential test between
the two representations. The one test of the textual path,
`tests/fragment-resolver.test.ts:184-195`, runs the fragment injector alone over a 16-line synthetic
fixture, parses the output and checks three fields plus an eight-line byte-identity assertion.

[agent-interpretation.md:85](../../2026-09-03-routines/agent-interpretation.md) cites
`injectCheckpointFragmentBodies` at `src/tools/workflow-tools.ts:1049-1058`; today it is at
`:1408-1409`. Line drift, not a substantive disagreement.

**Verdict: NARROWS.** A third stage is real work, but the ordering obligation the record raises is
vacuous under CV1: stage 1 is a no-op over the corpus, so whichever way you order the three, the
observable result is the same today. What the routine splicer genuinely adds is the first textual
rewrite whose output is *structural* rather than field-level — a whole step block at a computed
indentation — and that is the failure the absent differential test would catch.

**What breaks if it goes at the wrong time.** Reordering stages 3 and 4 relative to 1 and 2 changes
the delivered payload silently; nothing in `test:ci` compares delivered activity text field for
field. The stage-3 criterion at README:862 is entirely new code.

---

## CV3 — The textual fragment injector has two consumers, and only one of them the runner retires

**Construct.** `injectCheckpointFragmentBodies` at `src/loaders/fragment-resolver.ts:161-211`, with
its `scanCheckpointRefLines` pre-scan at `:218-224`. It is line-oriented: it matches a standalone
`ref:` line (`:192`), proves the enclosing block is a checkpoint step by walking backwards to the
nearest `- ` opener at the right indentation (`:168-188`), and replaces the line with the fragment
body serialised at the same indentation (`:197-208`).

**Measured references.** One definition and **two production call sites**:

| Consumer | Site | Why |
|---|---|---|
| `get_activity` delivery | `src/tools/workflow-tools.ts:1408` | the worker reads the original file text |
| `check-binding-fidelity` | `scripts/check-binding-fidelity.ts:529` | "Materialize checkpoint fragment refs … before analysis, so fragment-declared `setVariable` producers and message/condition reads attribute to the referencing activity — the same view the server delivers" (`:524-527`) |

Plus four test references in `tests/fragment-resolver.test.ts`.

**Verdict: KEEP** — and it refutes the proposal's costing of the textual half. README:465-468 says
"The runner never delivers activity text, so the textual implementation is written for an arrangement
that is ending." Measured, half of it is not. The guard consumes the textual materialiser because it
reads authored YAML and wants materialised content, and that need survives the runner intact:
`check-binding-fidelity` does not consume the loader (`scripts/check-binding-fidelity.ts:55, :61-62`
import `parseDefinition` and the fragment resolver, and it reads raw activity YAML at `:522-529`),
which is the same unscoped column move the guard ground truth measures at
[guard-obligations.md class (d) instance 3](../ground-truth/guard-obligations.md).

So a routines textual splicer has two prospective consumers, not one, and only the delivery consumer
is runner-conditional. Either the splicer outlives the runner in the guard, or the guard moves onto
the loader first — and that move is unscoped work the proposal already admits (README:1069).

**What breaks if it goes at the wrong time.** Deleting the textual injector when the runner lands,
without moving `check-binding-fidelity` onto the loader, blinds a 72-entry-ledger guard to every
fragment-declared `setVariable` producer and every fragment message read. At stage 5 the fragment
mechanism goes anyway; the shape of the problem transfers to the routine splicer unchanged.

---

## CV4 — The object-path fragment materialiser is the routine mechanism's near-twin, and cannot host it

**Construct.** `materializeActivityFragments` (`src/loaders/fragment-resolver.ts:137-152`) and
`materializeCheckpointStep` (`:96-130`). The first walks an activity's steps, recursing into loop
bodies only (`:146-147`), scoped to the activity's **source** workflow so a borrowed activity resolves
bare refs where it was authored (`:132-136`). The second resolves the ref, refuses a local body field
beside it (`:111-116`), refuses a condition declared on both sides (`:118-122`), copies five fields
onto the step and deletes the `ref` (`:123-128`).

**Measured references.** `materializeActivityFragments`: one definition, **one** call site,
`src/loaders/workflow-loader.ts:346`, inside the per-activity try/catch that excludes an activity
whose fragments do not resolve (`:342-355`). `materializeCheckpointStep`: one definition, one
production caller (`:145`), eight references in `tests/fragment-resolver.test.ts`.
`collectCheckpointRefs` (`:227-237`): one definition, one caller, `workflow-loader.ts:336`, feeding
the lookup pre-load at `:325-340`.

**Verdict: NARROWS.** Four properties of this module are exactly what a routine needs, and one is
what stops it being extended in place:

- **Reusable.** The source-workflow scoping (`:140`, and `activitySourceWorkflow` at
  `workflow-loader.ts:277, :288`) is the resolution scope a borrowed activity's routine reference
  needs, unchanged. The exclude-and-report failure contract (`workflow-loader.ts:348-354`) is the
  load-failure shape every terminal state of the reference lifecycle wants. The lookup pre-load
  (`:325-340`) is the pattern a routine file read wants.
- **Not reusable.** `materializeCheckpointStep` **fills fields on an existing step**; a routine
  **replaces one step with N**, at a computed identifier prefix, with a simultaneous rename over
  every variable-bearing field. And the module asserts its own non-recursion three times — "Fragment
  bodies are plain content — a fragment cannot itself contain a reference — so resolution never
  recurses" (`fragment-resolver.ts:17-18`), repeated at `src/schema/workflow.schema.ts:36-39`. A
  routine may reference another routine (README:318-328), so cycle detection and prefix composition
  are new.

`WorkflowFragmentsSchema` has one key, `checkpoints` (`src/schema/workflow.schema.ts:40-42`), which
reproduces the ground truth: the mechanism's rule half is already gone.

**What breaks if it goes at the wrong time.** Stage 5 deletes the whole module. Removing it before
the corpus stops carrying the eight reference sites drops two gate bodies out of every delivered
payload and out of `check-binding-fidelity`'s view at once. Both the object path and the text path
have to go in the same change, or the two representations disagree about whether a gate exists.

---

## CV5 — The contract derivation is not in the load path the design diagram puts it in

**Construct.** `deriveActivityContract` at `src/utils/activity-variables.ts:417-582`.

**Measured references.** One definition and **two call sites, both in one guard**:
`scripts/check-activity-variables.ts:147` (the finding walk) and `:463` (`--emit-contracts`). The
loader never calls it. `grep -rn "deriveActivityContract" src/` returns only the definition and its
own doc comment.

The load path, read off `loadWorkflowWithDiagnostics`
(`src/loaders/workflow-loader.ts:252-392`), is:

| Order | What | Site |
|---|---|---|
| 1 | parse and validate each activity file | `:87-93` (and `:167-173` for a borrowed one) |
| 2 | `populateStepIds` | `:94`, `:174` |
| 3 | validate the workflow object | `:312-316` |
| 4 | `materializeActivityFragments` | `:346` |
| 5 | `mergeActivityVariables` — the contribution rule and its contradiction check | `:367` |
| 6 | `validateExitBindings` | `:383` |

**Verdict: NARROWS.** README:333-354 draws the load path as
`Parse → Ids → Materialise → Derive → Bind → Ready` and rests the whole boundary on the ordering
"materialisation runs … **before** the contract is derived, so the derivation still meets the
reference and can treat it as a boundary." Measured, step 4 is in the loader and the derivation is
not — and its only caller reads `loadWorkflowWithDiagnostics` output
(`scripts/check-activity-variables.ts:97`, `:458`), which is **already materialised**. Under today's
arrangement a routine reference is gone before the derivation ever sees it.

So the boundary needs one of three things, and the proposal specifies none of them: materialisation
becomes optional and the guard asks for the unmaterialised form; the derivation moves into the
loader, where the reference is still standing between steps 4 and 5; or the loader records the
reference sites it spliced and hands them to the derivation as a side table. The third is what
README:1087-1089 implies for the variable injection ("the loader injects them into that activity's
`variables.writes` during materialisation") and it is a different mechanism from a derivation that
"meets the reference".

**What breaks if it goes at the wrong time.** This is the mechanism the guard ground truth's class
(d) instance 2 has no answer for: `check-activity-variables` is hard zero with no ledger
(`scripts/check-activity-variables.ts:25`), and a materialised internal is `undeclared-use` twice
over the moment stage 3 splices anything. Ordering the derivation before the splice is exactly what
would fix it — and that ordering does not exist to be preserved.

---

## CV6 — The "one change" to the derivation is three compile sites plus a new arm, measured

**Construct.** The derivation's step loop, `src/utils/activity-variables.ts:483-561`. It is a chain
of positive comparisons, not a switch: `:487` (`loop`), `:498` (the `else`, reading
`step.condition`), `:502` (`technique`), `:539` (`checkpoint`), `:552`
(`technique || action`). The write side is `write` at `:474-481`; the read side is `read` at
`:449-457`.

**Measured references.** Copied `src/` to `/tmp/routine-probe`, added a minimal
`RoutineStepSchema` — `kind`, `id`, `routine`, `with`, `outputs`, plus the `stepCommonFields` spread
and nothing else — as a fifth member of `StepSchema`, and ran `npx tsc --noEmit`. Baseline: clean.
With the new member: **exactly three errors, all TS2339 `Property 'condition' does not exist`**:

```
src/tools/workflow-tools.ts(1571,60)
src/utils/activity-variables.ts(499,27)
src/utils/validation.ts(123,65)
```

Every one is a site that treats "not a loop" as "carries a `condition`". Then add the
`stepEntryCondition` spread to the probe member — the spread three of the four existing kinds carry
(`activity.schema.ts:101, :110, :140`) — and the whole of `src/` compiles clean **with a step kind
nothing handles**: zero errors.

**Verdict: NARROWS.** The derivation's change is a new arm plus the `else` at `:499` narrowed, so
two edits rather than one, and the compiler names both. What the compiler does *not* name is the
third obligation: `readSignature`'s prose reads (CV12).

**What breaks if it goes at the wrong time.** If a routine reference step is given the `condition`
spread and no derivation arm, it contributes nothing to any contract and nothing complains — the
signature the whole design rests on is silently absent. The three-error result is the design's own
safety net and it is one field away from being disabled.

---

## CV7 — There is no exhaustive switch over step kinds, and 27 of 61 test sites are outside the typechecker

**Construct.** The step-kind test population.
`grep -rEn "kind (===|!==|==|!=) ['\"](technique|action|checkpoint|loop)['\"]" src scripts tests --include=*.ts`
gives **61 sites across 22 files**. There is no `switch` on a step kind anywhere
(`grep -rn "switch (step.kind)\|switch (s.kind)"` returns nothing) and no `assertNever` or
`: never =` exhaustiveness idiom in the repository.

**Measured references.** The split that decides what an exhaustiveness assertion can reach:

| Tree | Sites | Files | Typechecked by `npm run typecheck`? |
|---|---|---|---|
| `src/` | **34** | 8 | yes |
| `scripts/` + `tests/` | **27** | 14 | **no** |

`tsconfig.json` sets `include: ["src/**/*"]` and there is one tsconfig in the repository;
`vitest.config.ts` runs tests without typechecking them. Heaviest sites: `activity.schema.ts` 7,
`workflow-tools.ts` 6, `walker.ts` 5, `binding-provenance.ts` 5, `activity-variables.ts` 5,
`fragment-resolver.ts` 4.

The proposal states 57 sites across 19 files (README:433). I measure 61 across 22 under the rule
above; the gap is likely a different rule for object-literal `kind:` construction in test fixtures,
which I excluded.

**Verdict: NARROWS.** The stage-3 criterion "An exhaustiveness assertion over the step kinds fails to
compile when a kind is added" (README:856) is worth having and is structurally capped at 34 of the
61 sites. The 27 outside `src/` include the e2e walker's execution walk
(`tests/e2e/walker.ts:567-574`), the option-coverage enumerator (`tests/e2e/coverage.ts:39-52`) and
the guards that gate on `kind === 'loop'` — the places where an unhandled kind is a silently missing
step in a walk baseline rather than a compile error.

**What breaks if it goes at the wrong time.** Nothing breaks by adding it. What breaks by *believing*
it is that the criterion reads as covering the whole population and covers 56% of it. Extending
`tsconfig` to `scripts/` and `tests/` is a prerequisite the criterion does not name, and
`scripts/check-loop-shape.ts:43-49` is a live example of the consequence — its local `LoopStep`
interface omits `breakCondition` while `has('breakCondition')` at `:96` is typed `keyof LoopStep`,
which compiles only because `scripts/` is unchecked.

---

## CV8 — `flattenActivitySteps` is the shared traversal, and eight further walks recurse loop-only

**Construct.** `flattenActivitySteps` at `src/schema/activity.schema.ts:322-332`, documented as "The
single traversal all step/checkpoint consumers route through" (`:319-321`). It recurses into exactly
one thing: `if (s.kind === 'loop' && s.steps.length) rec(s.steps as Step[])` (`:327`).

**Measured references.** **13 call sites across 9 files** (the definer included):
`activity.schema.ts:354`, `validation.ts:129` and `:200`, `binding-provenance.ts:154`,
`activity-variables.ts:483`, `workflow-tools.ts:1548` and `:1834`, `resource-tools.ts:682`,
`workflow-loader.ts:783` and `:795`, `tests/e2e/coverage.ts:39` and `:147`,
`scripts/run-batch-benchmark.ts:191`. The proposal's "nine files use it" (README:435) reproduces.

The **eight** further walks with the same loop-only limit — a compound kind they do not know is
walked as a leaf — reproduce exactly:

| Walk | Site | Recursion guard |
|---|---|---|
| `populateStepIds` / `fillScope` | `activity.schema.ts:216-218` | `step.kind === 'loop'` |
| `topLevelStepIndex` / `contains` | `activity.schema.ts:342-343` | `s.kind === 'loop'` |
| `materializeActivityFragments` | `fragment-resolver.ts:146-147` | `step.kind === 'loop'` |
| `collectCheckpointRefs` | `fragment-resolver.ts:232` | `step.kind === 'loop'` |
| eager-bundling gate walk | `workflow-tools.ts:1575` | `s.kind === 'loop'` |
| option-key enumeration | `tests/e2e/coverage.ts:52` | `s.kind === 'loop'` |
| walker's decided-variable collect | `tests/e2e/walker.ts:458` | `step.kind === 'loop'` |
| walker's execution walk | `tests/e2e/walker.ts:567-574` | `step.kind === 'loop'` |

Three guards add the same limit — `check-loop-shape.ts:112`, `check-stealth-isolation.ts:176`,
`check-description-hygiene.ts:126-127` — so the true count of loop-only recursions outside the shared
traversal is eleven, not eight; the proposal's eight is the `src`-plus-`tests` set.

Three further walks recurse on the **`steps` key regardless of kind**, and would enter a compound
kind's body if it had one: `composeActivityArtifacts` (`workflow-tools.ts:158`,
`Array.isArray(s.steps)`), `check-review-mode-gating.ts:173` (`if (s.steps)`),
`activityCheckpointSteps` (`tests/e2e/walker.ts:596`, `if (s.steps)`). Four guards recurse over every
object value, so nesting depth is irrelevant to them: `check-self-composed-set.ts:88`,
`check-when-expression.ts:44`, `check-self-provisioned-input.ts:66`,
`check-activity-technique-overlap.ts:43`, plus `check-set-action-values.ts:149` and
`check-binding-fidelity.ts:405`.

**Verdict: KEEP.** Nothing about a routine widens any of these, and the proposal's own conclusion
(README:440) is right: after materialisation there is no compound kind left to walk. The construct's
whole reach is between parsing and materialisation. The count is recorded because it is the evidence
for that conclusion, and because it is the population an exhaustiveness assertion is measured against
(CV7).

**What breaks if it goes at the wrong time.** A `kind: routine` step that survived materialisation
would be walked as a leaf by all eleven loop-only walks with no error — no missing manifest entry, no
guard finding, no coverage gap, because none of them asserts on an unknown kind. That is precisely
what CV6's probe demonstrates: zero compile errors, zero runtime complaints.

---

## CV9 — The identifier pass gives a per-scope scope and no merged re-check

**Construct.** `populateStepIds` at `src/schema/activity.schema.ts:193-224`. Its inner `fillScope`
validates each scope independently — the activity's top-level `steps`, then each loop body as its own
scope (`:216-218`) — with a per-scope `seen` set (`:196`), a duplicate-id error (`:207-212`) and an
unresolvable-step error for a non-technique kind with no id (`:200-204`).

**Measured references.** One definition, **three** call sites: `src/loaders/workflow-loader.ts:94`
(local activities), `:174` (borrowed activities), `scripts/validate-activities.ts:44`. No test
exercises it: `grep -rn "populateStepIds\|defaultStepId" tests/` returns nothing.

Measured over the corpus, by a `yaml.safe_load` walk of all 122 activity files:

| Measurement | Result |
|---|---|
| Steps carrying an id | **1,003 of 1,003** |
| Step ids repeated across scopes within one activity | **0** |
| Maximum loop nesting depth | **2** |

**Verdict: NARROWS.** README:1158-1162 wants identifier population "**per definition** — a routine's
own body has its ids filled within the routine's scope before prefixing, and uniqueness is
re-checked in the merged scope afterwards." Half of that exists and half does not:

- **Exists.** `fillScope` already is a per-definition scope mechanism, and it already treats a nested
  body as an independent scope. That is the same shape a routine body wants.
- **Does not exist.** Nothing anywhere re-checks uniqueness in a merged scope. `flattenActivitySteps`
  returns a list; the one consumer that could notice a clash puts it in a `Set`
  (`src/utils/validation.ts:128-130`), so a collision collapses silently into a smaller `knownIds`
  and the manifest check reports nothing.
- **Blocked.** `populateStepIds(activity: Activity)` is typed to an activity and interpolates
  `activity.id` into all three of its messages (`:202`, `:209`). A routine is not an `Activity`, so
  either the parameter widens to `{ id: string; steps?: Step[] }` or the caller synthesises one.

**What breaks if it goes at the wrong time.** The zero cross-scope repeats mean the merged-scope
re-check has no corpus case to be proved against — the same "untested against the corpus" position
the proposal takes honestly for two references to one routine (README:549-552). Prefixing is what
makes the merged scope safe by construction; the re-check is the assertion that prefixing worked, and
it would land green on day one whether or not it is correct.

---

## CV10 — `[workflow::]name` resolution with a `meta` fallback exists three times; a routine resolver is the fourth

**Construct.** `parseFragmentRef` (`src/loaders/fragment-resolver.ts:38-45`) splits the reference;
`candidateWorkflows` (`:47-54`) gives the fallback order — a qualified name in that workflow only, a
bare name against the declaring workflow then `meta`.

**Measured references.** `parseFragmentRef` is exported and has three consumers:
`fragment-resolver.ts:48`, `workflow-loader.ts:229` and `:328`, `scripts/check-fragments.ts:127`.
`candidateWorkflows` is **not exported**, and the consequence is measurable:
`scripts/check-fragments.ts:128` re-implements the fallback order inline —
`workflowId ? [workflowId] : declaringWf === META_WORKFLOW_ID ? [META_WORKFLOW_ID] : [declaringWf, META_WORKFLOW_ID]`
— which is the same expression as `fragment-resolver.ts:50-52` written out again.

`META_WORKFLOW_ID = 'meta'` is declared twice: `src/loaders/fragment-resolver.ts:25` (exported, four
consumers) and `src/loaders/technique-loader.ts:84` (private, a second literal). The technique
loader implements the same fallback a third time, at three sites: `:156`, `:181-185`, `:308`.

**Verdict: NARROWS.** README:305-316 says routine resolution "is the resolution the existing shared
gate reference already implements", and the shared home is `meta` "because that is what a bare
technique path already falls back to: referencing a routine the way the corpus references a shared
technique gives the corpus one resolution rule rather than two." The corpus gets one rule; the
**server** has three implementations of it and would get a fourth. Exporting `candidateWorkflows` and
routing the guard and the technique loader through it is a two-line change that makes the routine
resolver free.

**What breaks if it goes at the wrong time.** Nothing at stage 3 — a fourth copy works. It matters
at stage 5, when the fragment mechanism is deleted: `candidateWorkflows` and `parseFragmentRef` live
in the module that goes, so a routine resolver written on top of them has to be relocated in the same
change, and `check-fragments.ts`'s inline copy disappears with the guard while the technique loader's
stays.

---

## CV11 — The routine reference's argument grammar duplicates `TechniqueBindingSchema` exactly, and no code decides braced-vs-bare

**Construct.** `TechniqueBindingSchema` at `src/schema/activity.schema.ts:63-67`:
`inputs: z.record(z.union([z.string(), z.number(), z.boolean()]))`,
`outputs: z.record(z.string())`.

**Measured references.** README:294-304 specifies `with` as "the same scalar union a technique step's
`inputs` admits" and `outputs` as mapping "an output id to the session variable its value lands
under, exactly as a technique step's `outputs` remap does". The two shapes are identical.

The binding-value reading, however, has no implementation to reuse. Two functions read a bare string
today and both call it a heuristic:

- `resolveInputSource` (`src/utils/binding-provenance.ts:288-319`): "A bare string is a rename when it
  names a resolvable bag entry, otherwise a literal — **statically indistinguishable**, so an
  unmatched bare value is reported as the literal it most likely is rather than flagged" (`:312-314`).
- `readWholeName` in the derivation (`src/utils/activity-variables.ts:467-470`): "The namespace
  settles which it is, so the match is on the whole string and not on a head."

The only place the distinction is *enforced* rather than guessed is one field of one step kind:
`check-set-action-values`'s `unbraced-reference` rule over a `set` action's `value`.

**Verdict: NARROWS.** The routine reference site is a new binding grammar whose *shape* is free and
whose *semantics* are new. README:296-298 is candid about this — "a routine reference is a new binding
site with no legacy, so it adopts that reading from the start rather than joining the 193-site
migration that is settling it elsewhere" — and the code confirms there is nothing to inherit: no
function in `src/` decides braced-versus-bare by declaration, and the substitution table at
README:376-380 (braces kept for a reference, dropped for a literal, binding omitted when absent) has
to be written from nothing.

**What breaks if it goes at the wrong time.** If `with` reuses the technique-binding reading rather
than the declared one, a literal argument materialises as `"{open_questions}"` — a reference to a
variable nothing writes — which is the failure README:381-383 names. The two readings are one
character apart in the source and produce a step whose gate reads a name with no producer.

---

## CV12 — The derivation cannot take a non-activity, and a bound technique's prose is a free variable

**Construct.** `deriveActivityContract`'s parameter object
(`src/utils/activity-variables.ts:417-431`) and `readSignature` (`:348-398`).

**Measured references.** Checking a routine "with no host workflow in sight" (README:445-447,
README:624-625) means running the derivation over a definition that is not an activity. Two things
block it:

**One — five activity-only fields.** The derivation reads `activity.id` (`:506`, passed to
`readSignature`), `activity.exits[].when` (`:570-572`), `activity.rules` (`:573`),
`activity.outcome` (`:574`) and `activity.triggers[].passContext` (`:576`). A routine declares none
of the four. And `namespace: ReadonlySet<string>` is required (`:423`) — for a routine it would be
seeded from the declared inputs, outputs and internals, which is a different construction from a
workflow's variable set and is what makes `write` at `:474-481` behave: a name outside the namespace
lands in `produces` and `producedSoFar` and nowhere else.

**Two — prose reads are free variables by construction.** `readSignature` collects every `{token}`
from a bound operation's protocol blocks, rules and artifact filename templates (`:362-372`), strips
those naming the operation's own signature (`:389`), and the derivation adds the remainder to the
activity's reads at `:520` — `signature.proseReads.forEach(read)`. That is the mechanism README:530
correctly names as the loose half of today's boundary ("a technique's delivered prose leaks its
`{token}`s into the referring activity's reads").

Materialisation cannot rewrite them. They come from technique markdown, not from any field of any
step, so they are outside the substitution field list by construction. So a routine whose body binds
**any** technique whose prose interpolates a bag name reads a name it does not declare — which
contradicts "A routine has no free variables: every name its body reads or writes is one of the
three" (README:210-212) and "a routine has no free variables and contributes only what it declares"
(README:529-530).

**Verdict: NARROWS.** README:384-387 claims "The field list is exactly the set the contract derivation
already walks. The implementation is that traversal inverted." Measured, the inversion is not total in
either direction. The derivation walks two things materialisation cannot rewrite — a bound technique's
prose (`:520`) and the activity-level routing, rules and outcome fields (`:570-576`) — and
materialisation must rewrite one thing the derivation never reads as a variable: a body step's
`technique:` name, which the derivation reads only as a reference to resolve (`:504`).

**What breaks if it goes at the wrong time.** The routine signature check (stage 4) reports every
prose-sourced read as an input nothing declares, or silently drops the category and loses the tight
boundary the design's second difference rests on. The proposal settles neither; it is the largest
unwritten specification I found on this surface, and it is decided by a single `forEach` at
`src/utils/activity-variables.ts:520`.

---

## CV13 — `unused-fragment` and `duplicate-checkpoint` are the reusable half of stages 1 and 4

**Construct.** `scripts/check-fragments.ts`. Two of its nine rules do work a routine mechanism needs:

- **`unused-fragment`** (`:239-243`). A corpus-wide reference index — `usedCheckpointFragments`
  (`:123`), keyed on the canonical target `${wf}::${name}` computed by `canonicalTarget`
  (`:125-135`) — checked against every declaration. That is the exact shape of "A routine with no
  reference sites fails" (README:629).
- **`duplicate-checkpoint`** (`:266-271`). `normalizeCheckpointBody` (`:74-94`) canonicalises a gate
  body to content fields only, key order fixed, strings whitespace- and case-normalised, and
  `inlineCheckpointSites` (`:139`, populated at `:224-229`) indexes sites by that canonical form.

**Measured references.** The guard passes clean: `npx tsx scripts/check-fragments.ts` prints
"fragments: OK — every ref resolves, every fragment is used, no inline duplicates". The registry
holds **40** guards (`scripts/guards.ts`, 40 `id:` entries) across **42** `scripts/check-*.ts` files.
`ls scripts/ | grep -iE "repeat|routine|sequence"` returns nothing — **no script in the suite
compares one step sequence against another**, which reproduces the ground truth and is what stage 1
adds.

**Verdict: KEEP.** Neither rule becomes stage 1 or stage 4 by extension. `duplicate-checkpoint`
compares **one** step body at a time and is therefore blind to a sequence: stage 1 needs a maximal
shared-window search over consecutive steps, matching on kind and binding, ignoring identifiers and
site gates. The normaliser at `:74-94` is the reusable piece — it is already the right answer to "what
counts as the same body" — and the indexing-by-canonical-form pattern at `:224-229` generalises to
windows. `unused-fragment`'s corpus-wide reference index is reusable almost verbatim; what it does
**not** carry is the transitive closure a routine's placement rule needs (CV14's neighbour: a routine
referred to only by other routines has no referring activity file, README:566-570).

**What breaks if it goes at the wrong time.** Stage 5 deletes seven of the nine rules, `unused-fragment`
among them (`decisions.md:447-450`, reproduced by
[fragment-mechanism.md](../ground-truth/fragment-mechanism.md)). Deleting the file rather than the
seven rules takes `duplicate-checkpoint`, `duplicate-rule` and the normaliser with it — and the stage-5
criterion (README:882-884) explicitly keeps `duplicate-checkpoint` with its remedy renamed, so the
module survives as a two-rule file or the two rules move.

---

## CV14 — The filename-collision family exists, and it only looks at fans

**Construct.** `fan-artifact-collision` in `scripts/check-activity-variables.ts:364-409`, two arms.
The distinct arm (`:377-393`) reports two branches of one fan whose composed signatures resolve one
literal filename. The instance arm (`:395-408`) reports a fanned activity whose artifact name does not
interpolate the fan's per-instance parameter. Both read
`DerivedContract.artifactNames` (`src/utils/activity-variables.ts:230`, populated at `:507` from
`readSignature`'s `:381-383`).

**Measured references.** `artifactNames` has two consumers, both in this guard (`:372`, `:399`). Both
arms are keyed on a `fan` from `fanGroups(workflow)` (`:374`, `:397`); neither reaches two steps
inside one non-fanned activity. And `artifactNames` is a `Set` (`activity-variables.ts:446`), so two
steps in one activity resolving one filename collapse to one entry with nothing reported.

**Verdict: KEEP.** README:1139-1147 requires "A routine whose body declares an artifact may be
referenced at most once per activity", with the declaration test closed transitively over nested
references. Nothing today checks the intra-activity case at any grain, and the check the proposal
needs is a different question from the one this family asks: this one asks "do two *contexts* resolve
one filename", the routine limit asks "does one *activity* reach one artifact-declaring definition
twice". The reasoning at `:364-369` — "The artifact writer is keyed on a bare filename with a
find-or-update and a re-scan mint guard, so two concurrent writers both re-scan, both create" — is the
data-loss argument the routine limit inherits, and it is the right precedent to cite.

**What breaks if it goes at the wrong time.** The routine limit lands at stage 4 with no corpus case
to prove it against and no existing check to extend. If it is skipped, a second reference to an
artifact-declaring routine in one activity writes one filename twice and the guard suite reports
nothing — the `artifactNames` `Set` guarantees silence.

---

## CV15 — The raw-text delivery path, deprecated by the runner and not by this construct

**Construct.** `readActivityRaw` (`src/loaders/workflow-loader.ts:951-1005`) — reads the original
activity file, validates it, and returns the **unmodified text** plus its source workflow — together
with the two textual transforms and the pre-scan that act on it.

**Measured references.** `readActivityRaw`: one definition, **one** caller,
`src/tools/workflow-tools.ts:1396`. `scanCheckpointRefLines`: one definition, one production caller,
`:1405`. Corpus-wide, four of 117 activity files carry a `ref:` line at all — the four assumption-run
hosts — so the pre-scan's fast path takes 113 of 117 files off the resolution path entirely.

Measured inflation over the four hosts, running the two injectors with a real fragments lookup:

| Stage | Characters |
|---|---|
| Source, four files | 30,316 |
| After `injectResolvedStepIds` | 30,316 (**unchanged** — see CV1) |
| After `injectCheckpointFragmentBodies` | 38,096 |
| Delta | **+7,780, 25.7%** |

README:470-472 states 28,154 → 34,717, +6,563, 23.3%, and describes it as "materialising the seven
shared gate bodies". I measure eight reference sites (two per host, four hosts) and the figures above.
The direction and the order of magnitude reproduce; the numbers are corpus movement since
`131e2942`.

**Verdict: DEPRECATE, conditional on the runner and not on this construct.** Stated plainly so it is
not mis-scheduled: the routines work neither retires nor needs to retire the raw-text path. What
retires it is the runner ceasing to deliver activity text, and CV3 records that even then half the
textual materialiser survives in a guard. The proposal's own accounting is right that the textual
splicer is the largest cost in the construct (README:463-464); the inference that it is therefore
temporary holds for `get_activity` and not for `check-binding-fidelity`.

**What breaks if it goes at the wrong time.** Removing the raw-text path before the runner lands
leaves a worker with no activity definition at all — `responseText`
(`src/tools/workflow-tools.ts:1867`) is the activity body plus four framing blocks, and the body *is*
the file text.

---

## CV16 — Activity discovery, and the schema generator with no verifying variant

**Construct.** `parseActivityFilename` (`src/loaders/filename-utils.ts:6-10`), matching
`/^(\d+)-(.+)\.ya?ml$/`, and the two discovery passes that use it.

**Measured references.** `parseActivityFilename` has **six** call sites:
`src/loaders/workflow-loader.ts:80` (`loadActivitiesFromDir`), `:178` (a borrowed activity), `:965`
and `:993` (both raw reads), and `scripts/validate-workflow-yaml.ts:32`. The loader's discovery is
prefix-gated (`:80-81`: no match, `continue`) and non-recursive (`:75`, a flat `readdir`), and the
numeric prefix becomes `activity.artifactPrefix` at `:95`.

The guard's discovery is a **different rule**: `scripts/validate-activities.ts:110` filters on
`f.endsWith('.yaml')` alone, with no prefix requirement, and is also non-recursive
(`findWorkflowDirs` at `:61-83` looks one level down for an `activities/` directory). So the two
discovery passes disagree today about what an activity file is; the disagreement is invisible because
every activity filename in the corpus carries a numeric prefix
(`ls workflows/*/activities/*.yaml | grep -vE "/[0-9]+-"` is empty).

The schema side: `scripts/generate-schemas.ts:25-29` generates **five** JSON schemas — workflow,
state, condition, session-file, activity. `schemas/` holds six `.schema.json` files; the sixth,
`schemas/technique.schema.json`, is hand-authored draft-07 with its own `$id` and is generated by
nothing (`grep -rn "technique.schema.json" scripts src tests package.json` returns nothing).
There is no `--check` mode, and `npm run build:schemas` (`package.json:10`) appears in neither
`test:ci` nor `verify.yml`.

[guard-obligations.md](../ground-truth/guard-obligations.md) says "`schemas/` holds **6** generated
JSON schemas, written by `scripts/generate-schemas.ts` (`:20`)". I measure **five** generated plus one
hand-authored.

**Verdict: NARROWS.** README:1124-1128 wants `routines/` to have "their own discovery pass, their own
generated JSON schema, and their own place in `get_workflow`", and the stage-3 criterion asks for the
verifying generator variant (README:846-848). All three reproduce as real gaps. Two refinements:

- The routine discovery pass is **two** passes, not one, because the loader's rule and
  `validate-activities`'s rule are already different — and `validate-activities.ts` reads
  `safeValidateActivity` directly (`:40`), so it needs a `safeValidateRoutine` sibling rather than a
  directory argument.
- The verifying variant is worth more than the criterion claims, because it would also catch that
  `technique.schema.json` is not in the generator's set at all.

**What breaks if it goes at the wrong time.** A `routines/` directory that only the loader discovers
gets no schema validation, which is the state the five `meta/activities/patterns/` files are in today
— 122 activity files exist, `npm run check:activities` reports 117
([guard-obligations.md class (a)](../ground-truth/guard-obligations.md)) — and those five files are
stage 8's site.

---

## CV17 — `#` is taken twice over, and the response key survives a full stop

**Construct.** `INSTANCE_SEPARATOR = '#'` (`src/loaders/workflow-loader.ts:470`) and `baseId`
(`:473-476`), which returns everything before the **first** `#`.

**Measured references.** `baseId` serves two roles, not one:

- activity ids — `src/tools/workflow-tools.ts:1396`, `readActivityRaw(…, baseId(activity_id))`, so a
  fan instance reads the base definition file;
- checkpoint ids — `src/utils/validation.ts:96`,
  `topLevelStepIndex(activity, baseId(key.slice(prefix.length)))`, recovering a per-iteration gate's
  base definition from a response key.

The checkpoint response key is `${activity_id}-${checkpoint_id}` — **hyphen**-joined, at
`src/tools/workflow-tools.ts:2069`, with the matching prefix parse at `src/utils/validation.ts:91-96`
and the record write at `:2430`.

**Verdict: KEEP.** README:544-547 argues the separator from the schema; the code carries it further.
`#` is unavailable because `baseId` would swallow anything after it in both roles, and `::` is the
technique-path separator (`parseFragmentRef`, `fragment-resolver.ts:39`; `techniqueName`,
`activity.schema.ts:176-178`). A full stop is available and is the right choice for a second reason
the proposal does not give: the response key splits on `-`, and both activity ids and step ids are
kebab-case, so a `-`-joined prefix would deepen an ambiguity the key parse already has, while a
`.`-joined one passes through `key.slice(prefix.length)` intact.

**What breaks if it goes at the wrong time.** A prefix using `#` breaks `readActivityRaw`'s file
resolution and `immediateExitCut`'s step lookup simultaneously, and both fail silently — the first
returns `ActivityNotFoundError`, the second returns `-1` and the immediate-exit cut is simply not
applied.

---

## What I looked for and did not find

An empty result on a surface is evidence, so these are recorded with the search that produced them.

- **Any name-rewriting substitution machinery.** Nothing in `src/` rewrites a variable name in a step
  field. The `{token}` machinery is entirely read-side: `TOKEN_RE` in
  `src/utils/activity-variables.ts:248` feeds `tokenReads` (`:265-271`), and `TOKEN_RE` /
  `EXACT_TOKEN_RE` in `src/utils/binding-provenance.ts:275-276` feed `resolveInputSource`
  (`:288-330`). `grep -rn "replace(" src/utils/*.ts src/loaders/*.ts src/tools/*.ts` returns only
  path, anchor and markdown normalisations. **Simultaneous substitution over a field list is new code
  with nothing to adapt** — including the simultaneity property, which is the one the proposal singles
  out as a requirement (README:389-391).
- **Any exhaustiveness idiom.** `grep -rn "switch (step.kind)\|switch (s.kind)"` and
  `grep -rn "assertNever\|: never ="` over `src scripts tests` both return nothing.
- **Any computed placement rule.** Nothing computes where a definition ought to live from who refers
  to it. `activitySourceWorkflow` (`src/loaders/workflow-loader.ts:277`, `:288`) records where a file
  *is*, not where it *should be*; `check-canonical-home-map` is about artifact homes, not definition
  homes; `unused-fragment` (CV13) asks only whether a reference exists anywhere. The transitive
  referrer closure of README:566-570 has no partial implementation.
- **Any cross-scope step-id uniqueness check.** `flattenActivitySteps` returns a list; the only
  consumer that could see a collision puts the ids in a `Set` (`src/utils/validation.ts:128-130`).
- **Any differential test between the two representations.** `tests/fragment-resolver.test.ts:184-195`
  is the closest thing: one synthetic fixture, one path, three fields and an eight-line byte-identity
  assertion. Nothing runs both paths over the corpus, and nothing compares as text the fields a worker
  acts on directly.
- **Any test of the identifier pass or the textual id injector.**
  `grep -rn "populateStepIds\|defaultStepId\|injectResolvedStepIds" tests/` returns nothing.
- **Any intra-activity artifact-filename collision check.** See CV14. `artifactNames` is a `Set` and
  both consumers are fan-keyed.
- **Any step-sequence comparison in the guard suite.**
  `ls scripts/ | grep -iE "repeat|routine|sequence"` returns nothing over 42 `check-*.ts` scripts.
- **`routines/` in the coverage scope classifier.** `classifyChange`
  (`scripts/coverage-scope.ts:55-65`) recognises exactly two path shapes, `<wf>/workflow.yaml` and
  `<wf>/activities/**.ya?ml`. A `<wf>/routines/*.yaml` change classifies as nothing. This reproduces
  [guard-obligations.md § One](../ground-truth/guard-obligations.md) and is recorded here because it
  is server code rather than a guard.
- **Any consumer of the loop runtime vocabulary.** `loop_started`, `loop_iteration`,
  `loop_completed`, `loop_break` (`src/schema/state.schema.ts:13`) and `activeLoops` (`:167`) have no
  writer, which reproduces [stage-0-state.md § Two](../ground-truth/stage-0-state.md). A routine that
  owns a loop adds no writer either.
- **`set` as a stable construct.** `src/schema/activity.schema.ts:27` records that `set` "is slated
  for removal at the next workflow-schema major (#166 B7/B12)". Stage 7's criterion keeps "the
  accumulating `set` action … inside the routine" (README:925-927), so that stage inherits a
  construct with a retirement note on it. Recorded rather than counted: it is a dependency the
  proposal's stage table does not name.

## Figures the proposal or the ground truth states that I could not reproduce

| Figure | Where | Measured here |
|---|---|---|
| Step kinds tested in "57 places across 19 files" | README:433 | **61 sites across 22 files**, by the comparison rule below; 34 in `src/`, 27 outside it |
| "Eight further walks recurse independently" | README:437-439 | **8** in `src/` and `tests/`, exactly as stated; **11** counting the three guards that also recurse loop-only |
| Materialising the shared gate bodies takes 28,154 characters to 34,717, +6,563, 23.3% | README:470-472 | 30,316 → 38,096, **+7,780, 25.7%**, over the same four hosts |
| "the seven shared gate bodies" on the four host activities | README:470 | **eight** reference sites, two per host |
| `injectCheckpointFragmentBodies` at `src/tools/workflow-tools.ts:1049-1058` | agent-interpretation.md:85 | `:1408-1409`; `injectResolvedStepIds` at `:1399` |
| The derivation runs in the load path, after materialisation and before binding | README:333-354 | The loader never calls it. Two call sites, both in `scripts/check-activity-variables.ts`, both over already-materialised activities |
| "The field list is exactly the set the contract derivation already walks" | README:384-385 | The derivation walks prose reads (`activity-variables.ts:520`) and four activity-level fields (`:570-576`) that no substitution can reach; materialisation must rewrite a body step's `technique:` name, which the derivation reads only as a reference (`:504`) |
| "`schemas/` holds 6 generated JSON schemas" | guard-obligations.md § Two | **5** generated by `scripts/generate-schemas.ts:25-29`; `schemas/technique.schema.json` is hand-authored draft-07 and generated by nothing |

## Re-taking every figure

```
# nothing is built
grep -rin routine src scripts tests --include=*.ts | grep -vi routinely
ls -d workflows/*/routines

# the step-kind population, and the split the typechecker decides
grep -rEn "kind (===|!==|==|!=) ['\"](technique|action|checkpoint|loop)['\"]" src scripts tests --include=*.ts | wc -l
grep -rEn "kind (===|!==|==|!=) ['\"](technique|action|checkpoint|loop)['\"]" src --include=*.ts | wc -l
grep -rEn "kind (===|!==|==|!=) ['\"](technique|action|checkpoint|loop)['\"]" scripts tests --include=*.ts | cut -d: -f1 | sort -u | wc -l
grep -n '"include"' tsconfig.json
grep -rn "switch (step.kind)" src scripts tests --include=*.ts
grep -rn "assertNever" src scripts tests --include=*.ts

# the shared traversal and its consumers
grep -rn "flattenActivitySteps" src scripts tests --include=*.ts
grep -rn "kind === 'loop'" src scripts tests --include=*.ts

# the injectors and the materialisers, with their call sites
grep -rn "injectResolvedStepIds\|injectCheckpointFragmentBodies\|scanCheckpointRefLines" src scripts tests --include=*.ts
grep -rn "materializeActivityFragments\|materializeCheckpointStep\|collectCheckpointRefs" src scripts tests --include=*.ts
grep -rn "populateStepIds\|defaultStepId" src scripts tests --include=*.ts
grep -rn "deriveActivityContract\|mergeActivityVariables" src scripts tests --include=*.ts
grep -rn "META_WORKFLOW_ID" src scripts tests --include=*.ts
grep -rn "artifactNames" src scripts tests --include=*.ts

# the guard suite: registry size, script count, and the absent sequence comparison
grep -c "    id: '" scripts/guards.ts
ls scripts/check-*.ts | wc -l
ls scripts/ | grep -iE "repeat|routine|sequence"
npx tsx scripts/check-fragments.ts

# every step member requires `kind`
python3 -c "import json;d=json.load(open('schemas/activity.schema.json'));print([(m['properties']['kind']['const'], m['required']) for m in d['definitions']['activity']['properties']['steps']['items']['anyOf']])"

# the coverage-scope classifier
sed -n '55,65p' scripts/coverage-scope.ts
```

Three measurements were taken with scripts written for this pass; each is reproducible from the rules
stated with it.

**The compile probe (CV6, CV7).** Copy `src/`, `tsconfig.json` and `package.json` to a scratch
directory, symlink the repository's `node_modules` beside them, and run `npx tsc --noEmit` — the
baseline is clean. Add a `RoutineStepSchema` as a fifth member of `StepSchema` carrying `kind: 'routine'`,
a required `id`, a `routine` string, a `with` record of the `TechniqueBindingSchema` scalar union, an
`outputs` record of strings, and the `stepCommonFields` spread; re-run. Three TS2339 errors. Add the
`stepEntryCondition` spread to the same member and re-run: zero errors.

**The delivery inflation (CV15) and the injector's subject count (CV1).** A tsx script importing
`injectResolvedStepIds` from `src/schema/activity.schema.ts` and
`injectCheckpointFragmentBodies` / `resolveCheckpointFragment` / `scanCheckpointRefLines` from
`src/loaders/fragment-resolver.ts`, with the fragments lookup built from each `workflow.yaml`'s
`fragments` key through `parseDefinition` so nothing pulls in `src/config.ts`. It reports source,
post-id-injection and post-fragment-injection character counts per host file, then walks every
`<wf>/activities/*.yaml` counting the files each injector changes.

**The step population (CV1, CV9).** A `yaml.safe_load` walk of every `.yaml` and `.yml` under
`workflows/*/activities/**`, counting each node carrying a string `kind`, recursing into a
`kind: loop` node's `steps`; per file it records every step id with its nesting depth and reports ids
repeated across scopes. It also counts source lines matching the `- technique:` opener regex.
Result: 122 files, 1,003 steps, 672 `kind: technique`, 1,003 ids, 0 technique steps without an
authored id, 0 cross-scope repeats, maximum nesting depth 2, 0 opener-form lines.
