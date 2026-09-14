# The permutation matrix for the routines construct

Every legal form a routine and its reference may take, every refusal the design defines, and — for
each one — where a test can provoke it.

> Item 10a · re-measured 2026-09-14 · engine tree at `fe5f5f78` on `main`, corpus at `e9d26007` on
> `workflows`. Subject: the [routines proposal](../2026-09-03-routines/README.md) and its twelve
> companion records, held against the [six sweeps and six
> refutations](../2026-09-10-routines-sweeps/README.md). Where a sweep and its verification disagree
> the verification is carried; where the [completeness
> pass](../2026-09-10-routines-sweeps/verification/completeness.md) disagrees with either, it is
> carried. Model: the [graph-fan permutation
> matrix](../2026-09-09-fan-smoke-test/ground-truth/permutation-matrix.md).

## Why this document exists

The construct refuses a great many things, and it says so where each refusal arises — one in the
lifecycle diagram, three in a stage's acceptance criteria, five in a guard's column assignment, one
in a paragraph about artifact names, one in a footnote about a technique-valued parameter. No
document in either folder says what the whole of that surface is. So there is no way to read a claim
that the construct is tested and know what the claim is measured against.

This fixes that. It is also the input the test plan is written from, so it carries three things a
plan needs and a prose specification does not: the shape of each legal form, the layer each refusal
sits at, and the site a test can reach it from.

**The construct is not built.** There is no `routines` directory anywhere in the corpus,
`StepSchema` (`src/schema/activity.schema.ts:167-172`) declares exactly four members —
`TechniqueStepSchema`, `ActionStepSchema`, `CheckpointStepSchema`, `LoopStepSchema` — and a grep for
`kind: routine`, `RoutineStep` and `RoutineSchema` across `src/`, `guards/` and `tests/` matches
nothing. Stage 0 alone has landed. So every row below is a specification held against a tree that
does not yet contain it, and a row marked unprovokable is unprovokable because the design gives it
no mechanism, not because the code is unwritten.

---

## The tree moved under the sweeps, and it moved the test plan with it

Read this before any citation below, because every path in the proposal folder and in the sweeps
folder now names somewhere else. The engine tree the sweeps measured was `9ca71c19`; the
verifications ran at `c1c9682d`; the completeness pass ran at `ee95e4cd`. `main` is now `fe5f5f78`,
**thirty-one commits past the completeness pass**, and three structural changes have landed in
between. None of them is about routines, and all three change where a routines test runs.

| What the folder says | Where it is now | Evidence |
|---|---|---|
| Guard scripts at `scripts/check-*.ts` | **`guards/check-*.ts`** | `ls guards` lists 46 `check-*`/`validate-*` files; `ls scripts` lists 24 files and none of them is a guard |
| The guard registry at `scripts/guards.ts` | **`guards/guards.ts`**, **41** registered ids | `grep -c "id: '" guards/guards.ts` → 41 |
| Corpus as a submodule at `<checkout>/workflows` | **Out of the engine tree.** `.gitmodules` pins `.engineering` alone; the corpus is a worktree at `.worktrees/workflows`, whose root is `corpus/` | commit `bb28377f`, "The engine tree does not pin the workflows branch"; `guards/workflows-root.ts` documents the default as `.worktrees/workflows` of the primary checkout |
| Ledgers at `scripts/*-triage.json` and `workflows/section-framing-triage.json` | **`ledgers/` on the corpus branch**, all four together | `ledgerPath(root, file)` in `guards/workflows-root.ts` joins `root/ledgers/`; `ls ledgers` on the corpus worktree shows four |
| A workflow is a directory one level under the root | **A directory holding a `workflow.yaml` at any depth**, outside the reserved names `activities`, `resources` and `techniques` | `corpusWorkflows` and `indexCorpus` in `guards/workflows-root.ts` and `src/loaders/corpus-index.ts` |

Three consequences the test plan inherits, each of which changes a row below.

**The corpus now nests, and one workflow already does.** `fan-conformance` sits at
`corpus/specimens/fan-conformance/`, two levels down. Counting depth-agnostically the corpus holds
**18** workflows and **132** activity files; counting one level down it holds **17** and **122**.
Both numbers are correct about different questions, which is exactly the condition under which a
criterion stated as a literal goes wrong quietly.

**The stage-1 baseline search is path-shaped, and is now blind to ten activity files.** The measure
script the stage-1 criterion names — `measure/repeated-runs.py:95` — globs
`*/activities/**/*.yaml`. Run against the corpus today it reports `activity files parsed: 122`. The
ten it never opens are the whole of `specimens/fan-conformance/activities/`. Changed to
`**/activities/**/*.yaml` it parses 132 and reports **the same 24 windows, 19 top level and 5
nested**, so the count is unharmed and the *file set* silently is not. This is new, it is not in
either folder, and it is the sharpest available illustration of why the criterion has to name the
search and the discovery rule rather than a number. See G14 and X6.

**A guard fixture is built through a helper that did not exist when the sweeps ran.**
`tests/corpus-fixture.ts` exports `writeWorkflowFixture(root, id)` and `declareFixtureWorkflows(root)`,
whose doc comment states the rule directly: "A workflow is a directory holding a `workflow.yaml`, so
a fixture corpus that serves techniques, resources or activities for an id declares that id the same
way the real corpus does." `tests/loop-shape-guard.test.ts` builds its tree, calls
`declareFixtureWorkflows`, and hands the root to `collectFindings`. **That is the template for every
guard-run and load-fixture row in this matrix**, and it replaces the bare `mkdtempSync` pattern the
older records describe.

Where a figure below is carried from the sweeps folder rather than re-taken here, it says so and
names the document. Everything else was measured at `fe5f5f78` / `e9d26007`.

---

## Measured counts

**LEGAL FORMS: 49 (LF1–LF49), in five groups** — 13 at the reference site, 17 in the definition, 7 in
resolution and placement, 9 in materialisation and identifiers, 3 in the stage-7 technique parameter.
Boundary cases carried explicitly: a reference with no arguments at all, an input left unbound that
takes its default, an input whose absent value **omits the binding** rather than emitting an empty
literal, an output left unbound under a per-output marker, four output ids binding to seven
destination names across seven sites, two references to one routine in one activity (zero corpus
instances), a reference inside a loop body (the hardest position the corpus has), a nested reference,
a one-step routine holding only a gate, a routine with no inputs at all, a routine referred to only
by other routines (zero corpus instances), a `forEach` carrying `breakCondition` (**re-measured here
at zero corpus sites**), a composed prefix of four segments, a prefixed checkpoint id carrying the
per-iteration discriminator, an internal that is a loop item variable, an internal holding a
collection, a routine whose body declares an artifact directly and one that declares one transitively
through a wrapper, an output bound to a name the host already declares and one bound to a name
nothing declares, and delivery byte-identical for an activity carrying no routine.

**AMBIGUOUS FORMS: 10 (AF1–AF10).** Shapes whose legality the design leaves undecided, listed
separately rather than guessed. AF1 — one id declared as both an input and an output — is the
design's own worked signature, so this is not a hypothetical class.

**REFUSALS: 53 numbered ids across three layers** — schema 11 (S1–S11), load 22 (L1–L22, of which
L17 folds into S2 and carries no case of its own), guard 20 (G1–G20). At **test grain, 74 cases**,
because several ids carry two or more distinct provocations or two distinct messages.

| Layer | Ids | Cases | Where the extra cases come from |
|---|---|---|---|
| schema | 11 | 19 | S7 covers two id positions, S8 two arms, S9 five field names, S11 three field names |
| load | 22 (21 live) | 28 | L1, L2, L5, L9, L12, L13 and L14 carry two arms each |
| guard | 20 | 27 | G13 is `check-loop-shape`'s five rules, G14 is three of stage 1's five criteria, G11 needs both directions on one fixture |
| **total** | **53** | **74** | |

**PROVOCATION SITE DISTRIBUTION (74 test-grain cases).** Derived row by row from the tables below,
and the arithmetic is shown so a disagreement is locatable.

| Site | Cases | Where they come from | What it is |
|---|---|---|---|
| schema-parse | 8 | S1–S7 | `RoutineSchema.safeParse` / `StepSchema.safeParse` on an in-memory object, the style of `tests/schema-validation.test.ts`. No filesystem, no server. |
| load-fixture | 15 | L1–L4, L7–L11, L16, L18, L19 | `loadWorkflow(root, id)` against a throwaway corpus built with `declareFixtureWorkflows`, asserting on the returned `Result`. `tests/workflow-loader.test.ts` is the template. |
| guard-run | 30 | L12, L13a, L20; G1–G19 | The guard's exported `collectFindings(root)` against a fixture corpus, the root supplied through `--root` or `WORKFLOWS_DIR` (`guards/workflows-root.ts`). `tests/loop-shape-guard.test.ts` is the template. |
| walk | 0 | — | `walk()` at `tests/e2e/walker.ts:681` — and **no refusal is reachable here**, for two independent reasons given below. |
| live-session | 0 | — | `client.callTool` through `createHarness` (`tests/e2e/harness.ts`) — **no refusal is reachable here either**, and that is a property of the construct rather than a gap. |
| **undecided** | **11** | S8 (2), S9 (5), S10 (1), S11 (3) | The design states the shape and never states the refusal level, so the site follows from a choice nobody has made. |
| **unprovokable** | **10** | L5 (2), L6, L13b, L14 (2), L15, L21, L22, G20 | No site, because the design gives the refusal no mechanism. Ten cases across eight ids, enumerated in full below — these are the most valuable rows in the matrix. |

8 + 15 + 30 + 0 + 0 + 11 + 10 = 74.

**Zero refusals at live-session, and that is the construct working as designed.** A `kind: routine`
step "exists between parsing and materialisation and nowhere else" (README:430) and the worker
"cannot tell one came from a routine". So unlike the graph fan — which places 15 of its 39 refusals
on the tool surface — the routine construct has **no run-time refusal surface at all**. What a live
session can assert is the *delivered form*: six observation obligations, listed under
[What a live session asserts](#what-a-live-session-asserts).

**Zero refusals at walk, for two reasons that have to be fixed separately.** The walker cannot
express a refusal: it turns any tool error into a thrown `Error`, so a refusal and a crash are one
outcome. And a routine is not a walk subject: `walk()` at `tests/e2e/walker.ts:681` takes
`(harness, workflowId, policy, opts)`, opens with `start_session` and `get_workflow`, and everything
downstream reads `ActivityDef`, which requires `id` and carries `exits`, `techniques` and
`artifactPrefix`. A routine "is not a transition destination, never a workflow's first or last node"
(README:746-747) and declares no exits, so there is no session it can be the subject of. **The
routine-level entry stage 4 promises (README:877, README:1198-1200) is a second walker, and no stage
budgets it.**

**UNREPRESENTABLE RATHER THAN REFUSED: 8 (U1–U8).** No test can provoke these by attempting a
violation, because the design leaves no channel for one. Each row states what an assertion can reach
instead.

**OBSERVATION OBLIGATIONS: 6 (O1–O6).** Neither refused nor unrepresentable. Listed so nothing here
is mistaken for enforcement.

**REFUSALS STATED AT A STRENGTH THE MECHANISM CANNOT DELIVER: 8 (X1–X8).** A matrix that listed
these as covered would be worse than no matrix, which is why they have a section of their own.

**Corpus and tree figures underneath the rows**, all re-taken here at `fe5f5f78` / `e9d26007`:
**132** activity YAML files across **18** workflows (17 of them one level under the corpus root);
**1,005** steps at any loop depth — **676** technique, **161** action, **115** checkpoint, **53**
loop; **22** of the 115 checkpoints inside a loop body; **24** maximal shared step windows, **19**
top level and **5** inside a loop body; **7** declared writes of `challenge_findings`; **8**
shared-gate reference steps in **4** activity files; **49** checkpoint options carrying an
`effect.exit` across **28** files; **0** loop steps carrying `breakCondition` and **27** carrying
`continueWhile`; **41** registered guards against **46** `check-*`/`validate-*` scripts on disk;
**6** files in `schemas/`, **5** of them generator output; **129** of the 132 activity files
validated by `guards/validate-activities.ts`; **28** synthetic fixture workflow trees and **68**
fixture activity files under `tests/`, `scripts/` and `guards/`.

**Figures that moved since the completeness pass**, each re-taken here: registered guards 40 → **41**;
guard scripts on disk 44 → **46**; the binding-fidelity ledger 70 → **71** entries; fixture workflow
trees 23 → **28**; fixture activity files 59 → **68**; steps at any depth 1,004 → **1,005** and action
steps 160 → **161**; `meta/activities/patterns/` activity files 3, each declaring **zero** exits (the
earlier reading of four predates two deletions).

**Figures that reproduce to the digit:** 132 activity files; 115 checkpoint steps and 22 of them
inside a loop body; 676 technique steps and 53 loop steps; 24 windows at 19 top level and 5 nested;
7 `challenge_findings` declarations; 8 `ref:` reference steps across 4 files; 49 `effect.exit`
options across 28 files; 5 generated schemas of 6 files in `schemas/`; 129 of 132 activity files
validated; four of the seven convergence sites declaring more than one exit (5, 4, 2, 2); and the
three `prism` per-unit passes at 41 lines each carrying zero checkpoint steps.

---

## The five provocation sites, measured

The vocabulary is the fan matrix's, re-derived against the harness for this construct. A row's site
is the cheapest place a test can reach it, not the only one.

**schema-parse.** Zod on an in-memory object. `tests/schema-validation.test.ts` asserts
`StepSchema.safeParse(step).success` directly. Every step member is `.strict()` —
`src/schema/activity.schema.ts:102` for the technique kind, and nine `.strict()` calls in the file —
so an unrecognised key is a schema error rather than a silently ignored field. A routine step member
inherits that, which is what turns one of the fragment mechanism's own load failures into a parse
error (S3).

**load-fixture.** `loadWorkflow(workflowDir, workflowId)` (`src/loaders/workflow-loader.ts:239`)
against a throwaway corpus, asserting on the returned `Result`. Two shapes of failure exist and the
asymmetry matters: a malformed **activity** degrades — the activity is excluded and the error
surfaced in `activityLoadErrors` (`tests/workflow-loader.test.ts:149`) — while a malformed **graph
binding** fails the whole load, because the loader returns an error on any non-empty
`validateExitBindings` result. **Which of the two a routine load failure takes is unstated**, and it
decides whether a routine reference failure is a per-activity diagnostic or a whole-workflow refusal.
The fragment mechanism takes the first: `src/loaders/fragment-resolver.ts` throws a
`FragmentResolutionError` and the loader's per-activity handling excludes and reports.

**guard-run.** Each guard exports `collectFindings(root)`; the root resolves through
`guards/workflows-root.ts` with `--root` beating `WORKFLOWS_DIR` beating the built-in default, and
`requireWorkflowsRoot` refuses three states outright — a root that does not exist, a root that is not
a directory, and a root holding no workflow — each with its own message naming the knob that selected
it. `assertScanned` then refuses a guard that inspected nothing. **So a fixture corpus must hold at
least one directory with a `workflow.yaml`**, which is what `declareFixtureWorkflows` exists to
guarantee. Positive arms need a fixture for every hard-zero guard, and `check-variable-model`'s five
rules, `check-activity-variables`, `check-activity-technique-overlap` and
`check-identifier-qualification` are all hard zero.

**walk.** `walk(harness, workflowId, policy, opts)` at `tests/e2e/walker.ts:681`. Cannot express a
refusal, and cannot take a routine as its subject. `StepDef.kind` at `tests/e2e/walker.ts:68` is
`'technique' | 'action' | 'checkpoint' | 'loop'` — a closed union the compiler enforces, the only
compiler-enforced four-kind enumeration in the repository, and it sits outside `tsconfig.json`'s
`"include": ["src/**/*"]` (`tsconfig.json:22`), so a fifth kind produces no error there.

**live-session.** `client.callTool` against the real server through
`createHarness({ workflowDir? })`. Every handler refusal is a plain `throw`, which the MCP SDK turns
into `{ isError: true, content: [{ text }] }`, so the assertion is always "isError, and the text says
the right thing". No routine refusal reaches here.

---

## Legal permutations

### A. The reference site (LF1–LF13)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF1** | A reference with arguments — `kind: routine`, `id`, `routine`, `with`, `outputs`, `when` | The flagship shape. One step replaces a run; the site supplies what differs and names where the outputs land. | README:283-292 |
| **LF2** | A reference with **no arguments at all** | A routine with no parameters is the plainest case of the construct and the strongest drift argument: 192 lines of source with nothing varying between the copies. The six convergence sites each become one step carrying only `id`, `routine` and `outputs`. | README:898-899; re-derivation.md |
| **LF3** | A `with` value of each scalar type — string, number, boolean | `with` admits the same scalar union a technique step's `inputs` admits: `z.record(z.union([z.string(), z.number(), z.boolean()]))` at `src/schema/activity.schema.ts:65`. Three arms, and a test on one leaves the other two unproven. | README:294-295 |
| **LF4** | A collection argument as a **JSON string** | A collection reaches a parameter as a JSON string, as it already does at every step binding in the corpus. | README:294-295 |
| **LF5** | A **braced** argument — a reference | `"{comprehension_artifact}"` materialises as `"{comprehension_artifact}"`, braces kept, so a body's `"{input_id}"` becomes a reference to the host's variable. | README:374-376 |
| **LF6** | A **bare** argument — a literal | `open_questions` materialises as `open_questions`, braces dropped. Rewriting the token root instead would emit `"{open_questions}"` — a reference to a variable nothing writes. **Legality contested**: see AF6. | README:374-377, `:380-382` |
| **LF7** | An input left unbound that takes its **default** | `decision_space` declares `default: resolve-or-defer` (README:226-228); a site that says nothing gets it. Boundary against L3, which fires only where there is neither argument nor default. | README:226-228 |
| **LF8** | An input whose value is absent, so **the binding is omitted** | The third row of the substitution table, and the one an implementation is most likely to get wrong: an absent argument omits the body's binding entirely rather than emitting an empty literal, which would override name-match resolution with nothing. | README:374-378 |
| **LF9** | An **output remap** — an output id bound to a differently named session variable | This is what lets one routine serve two domains that name the same fact differently. Measured across the seven sites of the fold the convergence routine wraps: **four output ids bind to seven distinct destination names**, six sites binding all four identically and the seventh binding three to three different names. Carried from design-itself.md CV20; the corpus-wide grain re-taken here is **57 explicit technique-step output remaps** across the 676 technique steps. | README:300-303 |
| **LF10** | An output left **unbound**, marked as permitted | The one marked output in the whole folder, and the one unbound site of seven. Boundary against L11, which refuses an *unmarked* output left unbound. | README:305-309 |
| **LF11** | **Two references to one routine in one activity** | Collision-free by construction, because the prefix comes from the reference step's id. A checkpoint response is keyed on the activity and the checkpoint together, so two un-prefixed copies of one gate in one activity would replay the first answer at the second. **Zero corpus instances**: no activity refers to either shared gate body more than once, and the design says so itself. | README:548-552, `:688-703` |
| **LF12** | A reference carrying each **site gate** — `when`, `required: false`, `condition` | A routine step "carries the site gates every step kind carries". Measured, that is two fields from `stepCommonFields` (`src/schema/activity.schema.ts:73-79`) plus `condition` from `stepEntryCondition` (`:84-86`). The `condition` arm is the field that disables the design's own exhaustiveness net — see X8. | README:280-281 |
| **LF13** | A reference **inside a loop body** | Legal the moment the kind is legal anywhere: `LoopStepSchema`'s body is `z.array(z.lazy((): z.ZodTypeAny => StepSchema))` at `src/schema/activity.schema.ts:162`. The design calls this "the hardest position in the corpus" and its prototype splicer round-trips it. The comprehension site takes exactly this shape. | README:1172-1174 |

### B. The definition (LF14–LF30)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF14** | A routine declaring `id`, `version`, `name`, `description`, `inputs`, `outputs`, `internals`, `steps` | The full shape, and the only complete example the folder carries. | README:216-275 |
| **LF15** | A routine with **no inputs at all** | Six byte-identical blocks means every value in them is a constant, so the outer convergence routine declares no inputs. The signature check's input arm (L8) has no subject here, which is the boundary. | README:898-899 |
| **LF16** | A body carrying a **technique** step | The commonest body step; contributes its resolved signature to the routine's own contract. 676 technique steps stand in the corpus today. | README:185-186 |
| **LF17** | A body carrying an **action** step | Substitution must rewrite an action's `target`, `message` and `value`. Stage 7's `prism` routine keeps "the accumulating `set` action inside the routine" (README:925-927), so this arm has a named site. 161 action steps stand today. | README:185-186, `:364-366` |
| **LF18** | A body carrying a **checkpoint** step | The gate moves inside the routine, which is what makes "two uses of one run agree on their gates" unrepresentable. It is also what forces `check-checkpoint-entry` into the materialised column — see G11. | README:185-186, `:1073-1075` |
| **LF19** | A body carrying a **loop** step | A routine can own a loop, which is what stage 0 delivered `continueWhile` for. The outer convergence routine's body is one `doWhile`. 53 loop steps stand today, 27 of them carrying `continueWhile`. | README:785-788 |
| **LF20** | A body carrying a **routine** step (nesting) | Nesting is what lets the same run be reused both wrapped in a loop and on its own: six sites want the loop, the seventh wants a single pass inside a loop its activity owns. The refutation pass **upgraded this from NARROWS to KEEP** — refusing it at stage 3 and admitting it at stage 6 ships a load failure whose deletion is scheduled, and the schema already recurses. | README:318-327; design-itself.md CV5 |
| **LF21** | A **one-step routine holding only a gate** | Nothing forbids it, and it is the minimum body. Three adjacent refusals bound it: if it declares an input, L8 fires (nothing reads it); its gate's `setVariable` must name a declared output or internal (G1, G2); and referenced in an activity's first position it trips G11. | README:185-186; `guards/check-checkpoint-entry.ts:18` |
| **LF22** | An **internal that is a loop's item variable** | `current_assumption` is one at four sites today. An internal declares an id and a description and nothing else — no type, no default, no value set — which is the standing the variable schema already gives a name written by an earlier step of the same activity. | README:200-205 |
| **LF23** | An **internal holding a collection** | Stated in the same sentence as LF22 and worth its own row, because a collection internal is the one an id-shape rule has an opinion about while nothing type-checks it. | README:203-204 |
| **LF24** | A routine whose body **declares an artifact**, referenced once in the activity | Legal; the limit is per activity, not per corpus. An artifact filename is the host activity's numeric prefix plus the technique's bare filename, and a routine has no prefix of its own. | README:1139-1147 |
| **LF25** | A routine declaring an artifact **transitively** — it references one that does — and referenced once | A routine declares an artifact when its own body binds a technique declaring one **or when any routine it references does**, closed transitively. Read at one level the limit is evaded by wrapping. Boundary against L14's second arm. | README:1144-1147; placement.md |
| **LF26** | A body's `forEach` carrying **`breakCondition`** | Stage 0 kept the field and gave it a rule rather than deleting it, so a routine body's `forEach` may carry an early exit and `breakCondition` is one of the fields materialisation substitutes over. **Re-measured here at zero corpus sites**, and it is on the keep list twice over: `check-loop-shape`'s `repeat-loop-with-break` rule reads it (`guards/check-loop-shape.ts:98`) while the guard's own local loop interface omits it, and `guards/` sits outside `tsconfig.json`'s `include`. | README:790-793 |
| **LF27** | A body's `while`/`doWhile` carrying **`continueWhile`** | The field stage 0 landed, and the only field that carries a continuation test. An unbounded `while` in a shared definition propagates to every reference site, which is why `check-loop-shape` walks the routine directory. 27 corpus loops carry it. | README:785-788, `:1027` |
| **LF28** | A gate option whose `setVariable` names a **declared output** | Inside a routine file a declared output satisfies `setvariable-undeclared`. 189 checkpoint options carry a `setVariable` corpus-wide, and all three in the two shared gate bodies are declared outputs in the proposal's own example signature, so this is the shape the migration actually produces. | README:1052-1061 |
| **LF29** | A gate option whose `setVariable` names an **internal** | Legal, and deliberately unvalidated: `setvariable-type-mismatch` and `setvariable-outside-value-set` "check a target that is an output and stay silent on an internal, which declares no type". A value passed between a routine's steps is not type-checked, exactly as a value passed between an activity's steps is not. | README:1061-1064 |
| **LF30** | A routine carrying its **own version**, unrelated to its referrers' | Changing a shared run leaves every referring activity's version standing still — the property the shared gate mechanism already has, with more content behind it. | README:1190-1194 |

### C. Resolution and placement (LF31–LF37)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF31** | A **bare name** resolving against the referring workflow | The first arm of `[workflow::]name`. | README:311-312 |
| **LF32** | A bare name resolving through the **shared home `meta`** | The second arm, and the design's whole argument for `meta`: a bare technique path already falls back there. **The argument does not survive measurement** — over 672 corpus technique bindings the fragment rule and the technique rule agree on 264 and disagree on 408 (carried from server-code.md PD3; the binding population is 676 at this tree). The *form* is legal; the justification for it is not. | README:314-316 |
| **LF33** | A **qualified name** `workflow::name` resolving in that workflow only, with no fallback | `candidateWorkflows` (`src/loaders/fragment-resolver.ts:47`) returns the single named workflow for a qualified ref. Boundary against L1's second arm and L5. | README:311-312 |
| **LF34** | A **borrowed activity's** bare reference resolving against its **source** workflow | Twenty-one activities appear in more than one workflow's graph and one workflow borrows thirteen from another, including all four hosts of the assumption run — so resolving against the borrower would compute the wrong routine. `materializeActivityFragments` (`src/loaders/fragment-resolver.ts:137`) already takes a source workflow id and that is the value to read. | README:313-314, `:571-575` |
| **LF35** | A routine referred to **only by other routines** | A referrer is an activity file or another routine, closed transitively. Without the clause such a routine has no referring activity file and the placement rule returns nothing — a guard with no verdict rather than a wrong one. **Zero corpus instances**: the pass the convergence routine wraps is referred to by an activity directly as well as through the loop. | README:564-569 |
| **LF36** | A routine whose referrer set spans **two or more** workflows, living in `meta` | Placement is computed from referring **files**, which have one unambiguous owner, rather than from graph membership, which does not. **Now complicated by nesting**: with `fan-conformance` at `corpus/specimens/fan-conformance`, "which workflow owns this file" is a `citePath`/`workflowOwning` question and no longer a path-prefix question. | README:560-562, `:571-575` |
| **LF37** | A routine whose referrer set sits in **one** workflow, living there | Against the corpus this puts the assumption routine in `work-package`, the fan-out routine in `meta`, the commit-and-publish routine in `workflow-design` and the roster fan-out in `substrate-node-security-audit`. | README:560-561; placement.md |

### D. Materialisation and identifiers (LF38–LF46)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF38** | A composed prefix of **one segment** — `reconcile-assumptions.batch-gate` | Every identifier inside a materialised routine is prefixed with the reference step's id, full stop as separator. The separator choice is forced: `#` is the per-iteration discriminator and the server splits a checkpoint id on the **first** one to find its base definition; `::` is the technique-path separator; and the checkpoint response key is `-`-joined over kebab-case ids, parsed back by prefix length at `src/utils/validation.ts:91`. | README:537-546 |
| **LF39** | A composed prefix of **four segments** through nesting — `converge-assumptions.pass.iteration.challenge` | Prefixes compose, and depth is bounded by cycle detection rather than by a limit. How long a generated identifier may be is one of the two questions the design leaves open. | README:326-327 |
| **LF40** | A prefixed checkpoint id carrying the **per-iteration discriminator** — `reconcile-assumptions.interview.decision#{current_assumption.id}` | The load-bearing half: a gate inside a loop is reached many times within one activity and would otherwise replay the first answer. The mechanism generates both this and LF11's prefix, and **only this one has a corpus case to prove it against** — 22 of the 115 checkpoint steps sit inside a loop body. | README:542, `:554-556` |
| **LF41** | A **simultaneous** substitution — a binding mapping `a → b` and `b → c` renaming each occurrence exactly once | A requirement rather than a convenience: an iterative rewrite renames some occurrences twice. | README:389-390, `:851-853` |
| **LF42** | An internal's materialised name carrying **both the host activity and the reference site**, underscore-joined — `implement_reconcile_assumptions_assumption_presentation` | A step id is unique within its activity; a variable name shares one flat namespace across the whole workflow. Prefixing from the reference site alone put one internal name in four activities. | README:194-198 |
| **LF43** | A routine output bound to a name the host **already declares** → injection is a **no-op** | Replacing an existing declaration puts two defaults for one variable into the merge. | README:1100-1101 |
| **LF44** | A routine output bound to a name **nothing declares** → injection supplies the declaration | This is what makes an invisible write visible. The copy supplies **12 declarations across the seven convergence sites** — two at each of the six assumptions sites and nothing at the comprehension site, whose author already declares every name the routine binds — and the merge carries **zero contradictions**. Carried from README:1106-1112; the simulation behind it ran against merge behaviour that landed with stage 0 (sweeps defect 6). | README:1095-1112 |
| **LF45** | Delivery **byte-identical** for an activity carrying no routine | The regression floor, and the precedent exists: `scanCheckpointRefLines` (`src/loaders/fragment-resolver.ts:218`) is a pre-scan that keeps files with no `ref:` off the resolution path entirely. **Eight `ref:` reference steps across 4 of 132 activity files today**, so 128 files are the byte-identical population. | README:863, `:1174` |
| **LF46** | A materialised step in the **raw-text** path carrying an explicit prefixed `id:`, nested bodies included | `injectResolvedStepIds` (`src/schema/activity.schema.ts:234`) derives an id textually from a `- technique:` opener and knows nothing of a routine prefix, so a spliced step without an authored id would arrive unprefixed in the text and prefixed in the object graph. **Its subject population is zero** — no activity file carries that opener and no technique step omits an id — so the obligation is right and the criterion's stated reason is empty. | README:857-858, `:1181-1184`; server-code.md CV1, PD9 |

### E. The technique parameter, stage 7 (LF47–LF49)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF47** | An input declared **`kind: technique`**, its argument a technique reference substituted into a body step's `technique:` field | Substitution happens before the derivation, so each reference site yields a concrete path and every signature resolves. The price is stated rather than hidden: such a routine has no signature of its own. | README:396-400, `:913-915` |
| **LF48** | A body step whose `technique:` is a parameter and which **declares its own `id`** | The derived id would otherwise be the placeholder. This is the one place the design requires an authored id for a reason unrelated to prefixing. | README:916-917 |
| **LF49** | A routine binding **no** technique by parameter keeping the **once-per-routine** path | Three guarantees carry no exception while no routine binds a technique by parameter, and become conditional only for those that do. | README:410-414, `:918-920` |

### F. Ambiguous forms — legality the design leaves undecided (AF1–AF10)

Listed rather than guessed. Each is a form a test plan cannot write a case for until someone decides
which side of the line it falls on.

| Id | Form | What is undecided | Evidence |
|---|---|---|---|
| **AF1** | **One id declared as both an input and an output** | Whether it is legal at all, and if so which side of the reference-site map wins in which field. At a reference site one id carries two intended values: the argument under `with` and the destination under `outputs`. The lifecycle has terminals for unresolved, cyclic, unbound and overbound and none for a colliding declaration, and the substitution table is keyed on `"{input_id}"` and says nothing about an id that is also an output. **This is the design's own worked signature**: the re-derived `challenge-concerns` declares `concern_document` under both. At all seven live sites the two resolve to the same name, so the collision is invisible and the worked conversion runs clean; it stops being invisible the moment a site reads one document and writes another, which is ordinary for a fold. | design-itself.md PD5; sweeps README defect 10 |
| **AF2** | A gate option carrying **`effect.exit`** inside a routine body | `effect.exit` names an exit id of the *owning activity*, which is a name outside all three declaration categories. The substitution field list covers "an option's effect names and values" without saying what happens to an `exit` with no binding at the reference site. **Re-measured here: 49 checkpoint options across 28 activity files carry one**, though none inside the runs stages 5 and 6 convert, so nothing breaks immediately. The sharper version: all three `meta/activities/patterns/` activities declare zero exits, and a routine cannot select an exit from an activity that has none. | design-itself.md CV16; re-measured here |
| **AF3** | A routine name with **two `::` separators**, or a trailing one | Whether it is a parse error, a load failure, or resolvable. The design adopts the `[workflow::]name` grammar and never states a bound on it. This is the fifth lifecycle state and it has its own refusal row (L5). | canon-rules.md P6 |
| **AF4** | A body binding a technique whose **prose interpolates a bag name** | Whether such a name is a declared input, an exempt category, or a load failure. `readSignature` (`src/utils/activity-variables.ts:349`) collects every `{token}` from a bound operation's protocol blocks, rules and artifact filename templates, strips those naming the operation's own signature, and the derivation adds the remainder to the referring activity's reads. Those tokens live in technique markdown, not in a step field, so they lie outside the substitution field list by construction and materialisation cannot rewrite them. **The design's own signatures do this three times.** The design states the tight boundary as fact at README:526-529 — "a routine has no free variables and contributes only what it declares" — and it is that sentence the measurement contradicts. | server-code.md PD2; design-itself.md CV8 |
| **AF5** | A routine referenced from an activity a **graph fan** runs | The derivation runs on the *materialised* activity, so a routine's artifact names enter the host's `artifactNames`, and `fan-artifact-collision`'s instance arm requires every artifact name on a fanned activity to interpolate that fan's per-instance parameter (`guards/check-activity-variables.ts:385-423`). A routine authored without knowledge of a fanning host fails there. Stage 8's fan-out routine is where this first becomes live — and the corpus now carries a dedicated fan specimen workflow at `corpus/specimens/fan-conformance`, which is where such a case would sit. | server-code.md PD8 |
| **AF6** | A **bare `with` argument that resolves in the host's declared namespace** | The design admits the bare form as a literal at a binding site with no legacy; the tree's own precedent refuses it. `check-set-action-values` states the repository's decided position: a `value` that names another variable has to be braced, because an unbraced one is the literal string, and a rename written bare is refused too. The design's own worked example binds a name bare and relies on the technique step's dynamic name-match resolution to read it as a rename — two readings in one value path. | design-itself.md CV7 |
| **AF7** | A routine declaring an activity-level **`techniques[]`** list, or `exits`, `outcome`, `rules` or `triggers` | Whether the routine schema is `.strict()`, and therefore whether a field a routine does not have is a parse error or a silently ignored key. Every step member is `.strict()` (`src/schema/activity.schema.ts:102` and eight more); the routine file's own schema is unspecified. This decides the site for five of the refusal rows (S9). | README:216-222 |
| **AF8** | A routine referenced from a `meta/activities/patterns/` **library** activity | Materialisation is a load-time pass and never runs at these files: the activity discovery pass is non-recursive and no `workflow.yaml` references them, so `guards/validate-activities.ts` validates **129 of 132** activity files — re-taken here and reproducing exactly. Having no consumer is the *designed* state of a library and the repository says so in its own triage rationale — so the files are not dead, but no loader-consuming guard and no host-activity walk ever exercises a reference site in them. Stage 8 puts reference sites there. | design-itself.md CV17; server-code.md CV16; re-taken here |
| **AF9** | An input declaring **"a default of nothing"** | The substitution table's third row reads "Absent, or a default of nothing", and no schema shape is given for the second half. An input with no `default` key at all is L3 (Unbound); an input with `default:` and an empty value is this case, and nothing says whether it parses. | README:378 |
| **AF10** | Whether the **positional step keys** survive materialisation | `currentStep` and `completedSteps` are keyed on `StepIndex = z.number().int().min(1)` (`src/schema/state.schema.ts:4`), a position rather than a name, and materialisation splices N steps in place of one, shifting every index after a reference site. The design addresses the composed checkpoint key and accepts the re-ask; it says nothing about the indices, and neither does any sweep. The mitigating fact is that both fields are vestigial, which is what makes this a KEEP with a discriminator rather than a defect. | completeness.md:113-121 |

---

## Refusals, and where each is provoked

### Layer 1 — schema (S1–S11), 19 test-grain cases

| Id | Site | The refusal | What the message must name | Stage | Cases |
|---|---|---|---|---|---|
| **S1** | schema-parse | A `kind: routine` step declares no `routine` | The required field. The step names the routine it refers to and there is no other channel for it. | 3 | 1 |
| **S2** | schema-parse | A `kind: routine` step declares no **`id`** | That a routine step's id is required and not derivable. `populateStepIds` (`src/schema/activity.schema.ts:193`) derives an id only for a technique step and throws at `:198` for any other kind, and the reference step's id **is the prefix**, so it must exist before the body is spliced. Making it required at the schema keeps the failure at parse rather than at load. | 3 | 1 |
| **S3** | schema-parse | An **unrecognised key** on the routine step | The offending key, as `Unrecognized key(s) in object: '<k>'`. This is the row that subsumes one of the fragment mechanism's own load failures: the resolver throws a `FragmentResolutionError` when a checkpoint declares body fields alongside `ref` (`src/loaders/fragment-resolver.ts:111-116`), which `guards/check-fragments.ts:60` reports as `ref-body-conflict`; `.strict()` on the routine member makes the analogue a parse error instead. Also assert `additionalProperties: false` in the regenerated `schemas/activity.schema.json`. | 3 | 1 |
| **S4** | schema-parse | A `with` value outside the scalar union | That an argument is a string, a number or a boolean, and that a collection travels as a JSON string. | 3 | 1 |
| **S5** | schema-parse | An `outputs` value that is not a string | That the map goes from output id to session variable name. | 3 | 1 |
| **S6** | schema-parse | A routine **output id** that is not a legal variable name | The qualified-noun rule, via `VariableNameSchema` (`src/schema/variable.schema.ts:6`): `QUALIFIED_DATA_ID_PATTERN` at `src/schema/identifiers.ts:16` plus the `EXEMPT_DATA_IDS` enum at `:30`. Stage 6's criterion requires every output id to conform, and the conversion artifacts' four earlier output ids violated two catalogue rules. | 3, graded at 6 | 1 |
| **S7** | schema-parse | A routine **input id** or **internal id** that is not a legal variable name | The same rule at the two other id positions. A routine's input, output and internal ids are symbol ids and the schema enforces the qualified-noun rule on the YAML side. | 3 | 2 |
| **S8** | **undecided** | A routine declaring **no `steps`**, or an **empty** `steps` list | Whether either parses. The design never says a routine's body is non-empty, and a routine with no steps is a signature with nothing behind it — the whole subject of the L7–L9 checks. | 3 | 2 |
| **S9** | **undecided** | A routine declaring a field a routine does not have — `exits`, `outcome`, `rules`, `triggers`, `techniques` | Whether each is a parse error or an ignored key, which follows from AF7. Two of the five have live consequences: `check-checkpoint-presentation` sits out of a routine's way precisely because "a routine declares no rules" (README:1029), and "it declares no outcome" is one of the things a routine is not allowed to do. | 3 | 5 |
| **S10** | **undecided** | A routine **output** declaring a `default` | Why: a default is a seed applied at session creation, a property of the variable rather than of a run that writes it mid-flight, so a routine declaring one claims to seed a variable it does not own. The design states the rule (README:1091-1094) and not its strength. | 3 | 1 |
| **S11** | **undecided** | An **internal** declaring a `type`, a `default` or a value set | Why: an internal never enters the workflow's variable set, so nothing merges, seeds or type-checks it, and a type would be a field with no reader. Three field names, three cases. | 3 | 3 |

### Layer 2 — load (L1–L22), 28 test-grain cases

The first six are the reference lifecycle. The design states that **every terminal state but
`Checked` is a load failure and none is a warning** (README:741-742), with a message naming the
routine, the reference site and the reason — because a routine that half-resolves would deliver a
worker a step nobody declared.

| Id | Site | The refusal | What the message must name | Stage | Cases |
|---|---|---|---|---|---|
| **L1** | load-fixture | **Unresolved** — no routine of that name | The routine, the reference site, and the homes searched. Two arms: a bare name found in neither the referring workflow nor `meta`, and a qualified name naming a workflow that holds no such routine (which has **no fallback** — `candidateWorkflows` returns the single named workflow). A test on one arm leaves the other's path unproven. | 3 | 2 |
| **L2** | load-fixture | **Cyclic** — the routine reaches itself | The cycle, as the chain of reference ids. Two arms: a routine referencing itself directly, and a two-routine cycle. Depth is bounded by cycle detection rather than by a limit, so this walk is also what terminates the placement closure and the artifact closure. | 3 | 2 |
| **L3** | load-fixture | **Unbound** — an input with no argument and no default | The input id, the routine and the reference site. Boundary against LF7, where the default supplies it. | 3 | 1 |
| **L4** | load-fixture | **Overbound** — a `with` argument naming no declared input | The argument name and the routine's declared input list, because the list is the author's fix site. | 3 | 1 |
| **L5** | **unprovokable** | **Malformed** — a routine name that does not parse | The malformed value and the two forms accepted. **The lifecycle has no terminal for this and the design owes the state.** The mechanism being replaced has it: `parseFragmentRef` (`src/loaders/fragment-resolver.ts:38`) is documented at `:37` as "a ref with more than one `::` is malformed" and throws accordingly, and `guards/check-fragments.ts:207` reads the word `Malformed` off the message to choose between its `malformed-ref` and `unresolved-ref` rules. Two arms a routine reference reaches: `a::b::c` and `work-package::`. Add the state at stage 3 with the other load failures, not at stage 5 with the rule deletions. | **owed at 3** | 2 |
| **L6** | **unprovokable** | **Colliding declaration** — one id declared as both an input and an output | Which side wins in which field, or that the collision is refused. **No terminal, no rule, and the substitution table has no answer.** See AF1: this sits inside a construct whose verdict is KEEP, and the design's own worked signature produces it. | **owed at 3** | 1 |
| **L7** | load-fixture *or* guard-run | **An output nothing writes** | The output id and the routine, and that the body was derived rather than assumed. The design states this at two different strengths in two places — "Refused at load" in the guarantee table and at README:869-871, and a guard finding in the *Checking a routine on its own* sequence at README:715. See X3. | 4 | 1 |
| **L8** | load-fixture *or* guard-run | **An input nothing reads** | The input id and the routine. Same double strength (README:869-871 against README:716). **AF4 is what makes this hard**: a signature check that trusts the derivation reports a prose-sourced read as an undeclared input, or drops the category and loses the tight boundary that is one of the construct's two claimed advantages. | 4 | 1 |
| **L9** | load-fixture *or* guard-run | **A declared internal that nothing writes, or that nothing reads** | The internal id and which half failed. Two arms, separately provokable, and the design names both (README:870-871). | 4 | 2 |
| **L10** | load-fixture | **A body naming anything outside the three declaration categories** | The name and the three categories, with the one carve-out stated: an artifact filename template, which the worker interpolates at run time from the technique's own outputs and which the definition never reads. **Fires on legal bodies as specified** — see AF4 and the note after the unprovokable table. | 3 | 1 |
| **L11** | load-fixture | **An unmarked output left unbound** at a reference site | The output id, the reference site, and that an output which may be left unbound says so in its declaration. Boundary against LF10. The design's stated reason for the marker is that falling back to the output's own id "would put a routine's internal name into the session bag" (README:307-309); measured, a technique step's unremapped output lands under its own id, and the write collector is namespace-filtered — `write` at `src/utils/activity-variables.ts:475` adds to `writes` only inside the declared namespace, while `read` at `:450` puts anything else in `mentions` — so a name no workflow declares never enters the variable set. The rule may still be right; its stated reason is not. | 3 | 1 |
| **L12** | **guard-run** | **Placement** — a routine whose home disagrees with its transitive referrer set | The computed home, the home on disk, and the referrer files that decide it. Two arms: a single-owner routine sitting in `meta`, and a two-owner routine sitting in one of them. **Stated at load and enforced by a guard in one sentence** (README:560-562). See X2. **Nesting sharpens this**: the home has to be computed through `workflowOwning`/`citePath`, because a path prefix no longer identifies the owning workflow. | 4 | 2 |
| **L13** | **guard-run**, and **unprovokable at load** | **A routine with no reference site anywhere** | The routine and the search's reach. The mirror is a guard, not a load: `unused-fragment` is emitted at `guards/check-fragments.ts:242` inside a corpus-wide sweep that first collects every reference across every workflow's activities and then walks every workflow's declared fragments. A load is per-workflow — `loadWorkflow(workflowDir, workflowId)` at `src/loaders/workflow-loader.ts:239` — and the resolution rule admits a cross-workflow reference, so a per-workflow load of `work-package` sees no reference site for a `meta` routine and fails while one exists a directory away. **The "anywhere" arm of README:878 cannot fire as specified.** See X1. | 4 | 2 |
| **L14** | **unprovokable** | **An artifact-declaring routine referenced twice in one activity** | The filename, the two reference sites, and the data-loss reasoning. **No mechanism exists at any grain.** `DerivedContract.artifactNames` is a `Set` (`src/utils/activity-variables.ts:231`, populated at `:447` and `:508`), so two steps of one activity resolving one filename collapse to one entry; both `fan-artifact-collision` consumers are keyed on a `fan` (`guards/check-activity-variables.ts:385`, `:401`, `:423`); and the artifact composition keeps its own seen set. The corpus meanwhile carries 24 (filename, activity) pairs across 11 files that write one filename from two or more step bindings, the largest at four steps — produce-then-revise (carried from design-itself.md CV1). The refutation verdict on this rule is REMOVE: neither shared gate body is referenced twice by any one activity, so the case it guards has no instance. Two arms if it is kept: a direct declaration and a transitive one through a wrapper (LF25). | 4 | 2 |
| **L15** | **unprovokable** | **A step-id collision in the merged scope after prefixing** | The colliding id and the two scopes. The design wants identifier population per definition, with uniqueness "re-checked in the merged scope afterwards" (README:1161-1162). Half exists: `populateStepIds` is already a per-scope mechanism and already treats a loop body as an independent scope (`src/schema/activity.schema.ts:216`), but it takes an activity and interpolates the activity id into its messages. **No merged-scope re-check exists anywhere, and the two containers that could notice a clash both collapse it**: `knownIds` is a `Set` (`src/utils/validation.ts:128`) and `declarationIndex` is a `Map` keyed by id (`:147`) — the second decides the step-order check, so a collision loses an order constraint as well as a manifest entry. Both fail silently. Prefixing is what makes the merged scope safe by construction, so with no cross-scope repeated step ids in the corpus the re-check lands green on day one whether or not it is correct. | 3 | 1 |
| **L16** | load-fixture | **A routine named as a transition destination** | Reachable through the standing rule with its existing message: `validateExitBindings` reports a destination "which this workflow does not contain" (asserted verbatim at `tests/workflow-loader.test.ts:403`), and a routine is not in `activities`. Assert it fails with *that* message and not with a rule of its own, or a spurious routine-specific rule goes undetected. | 3 | 1 |
| **L17** | — | *(folded into S2 — a reference step with no id)* | — | — | 0 |
| **L18** | load-fixture | **Stage 7: a routine that reads its technique parameter's outputs** | Why it is refused — the members' signatures would have to agree and their outputs would need somewhere to land — and that no bound is declared because none is needed (README:928-929). The `prism` family is the benign case: the pass writes its artifacts and appends, and the routine never reads the parameter's outputs. | 7 | 1 |
| **L19** | load-fixture *or* guard-run | **Stage 7 per-site check 1: the contract** | That the contract is derivable per reference site and not in isolation for a routine binding a technique by parameter (README:918-920). | 7 | 1 |
| **L20** | guard-run | **Stage 7 per-site check 2: whether the body declares an artifact** | Which site's argument made it an artifact-declaring routine. | 7 | 1 |
| **L21** | **unprovokable at its own family** | **Stage 7 per-site check 3: whether every gate option is exercised** | **There are no gates.** Re-measured here: `prism/activities/02-adversarial-pass.yaml`, `03-synthesis-pass.yaml` and `05-behavioral-synthesis-pass.yaml` are 41 lines each and carry **zero** `kind: checkpoint` steps. So a third of the price the feature is "already priced at" buys nothing at the family it exists for. | 7 | 1 |
| **L22** | **unprovokable** | **Stage 3: materialisation runs after identifier resolution and before contract derivation, and a test fails if the order is swapped** | **There is no order to swap.** `deriveActivityContract` (`src/utils/activity-variables.ts:418`) has exactly two call sites in the repository, both in one guard script — `guards/check-activity-variables.ts:158` and `:483` — and the loader never calls it. The loader performs five of the six drawn steps: read and parse, `safeValidateActivity` (`src/loaders/workflow-loader.ts:88`), `populateStepIds` (`:95`), `artifactPrefix` from the filename (`:96`), fragment materialisation, then the variable merge and exit binding. Both guard call sites read loader output that is **already materialised**, so a routine reference is gone before the derivation ever meets it — the exact opposite of the boundary stage 4 exists to guarantee. Three mechanisms could supply it and the proposal names none: the loader exposes both forms; the derivation moves into the loader; or the loader records the sites it spliced and hands them over as a side table. | **owed at 3** | 1 |

### Layer 3 — guard (G1–G20), 27 test-grain cases

Six rows are `check-variable-model`'s five rules rescoped to a routine file, `setvariable-undeclared`
splitting into two arms that point opposite ways. The rescoping is settled: `setVariable` is a field
an author writes, and routing the guard through the loader would have it audit generated names — the
failure the `check-set-action-values` case rules out. So the guard stays in the authored column and
gains a name scope. It is hard zero with no baseline, so every positive arm needs a fixture corpus
built through `declareFixtureWorkflows`.

| Id | Site | The refusal | What the message must name | Stage | Cases |
|---|---|---|---|---|---|
| **G1** | guard-run | `setvariable-undeclared` inside a routine file: a `setVariable` naming neither a declared output nor an internal | The target and the routine's own declarations. Today the rule requires a workflow-variable declaration, so **every gate in every routine violates it as authored, by construction** — the design says so itself at README:1053-1056. A routine body's gate names a routine output id or an internal, which become bag names only through materialisation. | 4 | 1 |
| **G2** | guard-run | `setvariable-undeclared` inside a routine file: a `setVariable` naming a **workflow variable** | That a routine has no free variables, so a workflow variable does **not** satisfy the rule here (README:1059-1061). **This is a new refusal rather than a rescoping** — inside a routine file the rule inverts, and the inverted arm is the one a test is most likely to omit. | 4 | 1 |
| **G3** | guard-run | `setvariable-type-mismatch` where the target is an **output** | The declared type and the literal. Silent on an internal, which declares no type — assert both directions on one fixture. | 4 | 1 |
| **G4** | guard-run | `setvariable-outside-value-set` where the target is an output | The declared value set. **Ambiguous subject**: a routine output declares "an id, a type and a description, and no default" (README:1091) and no value set is named anywhere, so this rule may have no subject inside a routine file at all. Decide whether an output declares `values` before writing the case. | 4 | 1 |
| **G5** | guard-run | `default-type-mismatch` on a routine **input's** default against its declared type | The declared type and the default. **Ambiguous subject**: the design describes inputs as "named parameters with optional defaults, the shape a technique's inputs already take" (README:183-184) and never says an input declares a type. If it does not, this rule has no subject either. This and G4 are the two rescoped rules whose subject does not exist on the record. | 4 | 1 |
| **G6** | guard-run | `exists-on-defaulted` on an `exists`/`notExists` gate over a **defaulted input** | That the gate is constant, for the reason it is constant on a defaulted variable (README:1064-1065). | 4 | 1 |
| **G7** | guard-run | The routine's own contract check: an output declared, nothing writes it | Same subject as L7 at the other strength. The check derives reads and writes from the routine's body with no host activity in sight; the scope workflow id (`src/utils/activity-variables.ts:422`) is what gives it a workflow to resolve bound ops against. | 4 | 1 |
| **G8** | guard-run | The routine's own contract check: an input declared, nothing reads it | Same subject as L8. | 4 | 1 |
| **G9** | guard-run | No reference site anywhere → a finding | Same subject as L13, at the strength the mirror actually has. The correct home is a guard alongside `unused-fragment`. | 4 | 1 |
| **G10** | guard-run | The home disagrees with the referring files → a finding | Same subject as L12. | 4 | 1 |
| **G11** | guard-run, **both directions** | `check-checkpoint-entry` on a materialised activity whose first step came from a routine that opens with a checkpoint | The activity, the step, and the dispatch cost — "a dispatch that only asks a question is the most expensive way to ask one", with the check stated mechanically as `steps[0].kind == "checkpoint"` (`guards/check-checkpoint-entry.ts:18`). **This is the case that forces the materialised column** and the design says so at README:1073-1075: the assumption routine's first step is a checkpoint, so a reference in first position evades the rule entirely against unexpanded text. The guard enumerates workflows through `corpusWorkflows(root)` and then reads raw activity YAML from each `activities/` directory non-recursively (`:38-42`), consuming no loader, so the positive arm needs the column move to have happened. Negative arm: a routine whose first step is not a gate produces no finding. | 4 | 2 |
| **G12** | guard-run | `check-activity-technique-overlap` resolving a reference step to the routine's own step bindings | The activity-level entry and the routine step that binds it. Hard zero (`guards/check-activity-technique-overlap.ts:10`). **The verdict on this change is REMOVE**: the population is 32 files, 33 entries and 4 distinct names corpus-wide, the guard's own non-recursive scan reads 28 files and 29 entries, and **no activity both lists and binds one technique**. None of the four listed names appears among the techniques stages 5 to 8's routines bind. A hard-zero guard gaining an admitted exception for a finding class with no member is the wrong use of stage 4's budget. | 4 | 1 |
| **G13** | guard-run | `check-loop-shape`'s five rules over a **routine body's** loop | Five rules, five cases: `item-loop-without-collection` (`guards/check-loop-shape.ts:59`), `item-loop-with-continuation` (`:67`), `repeat-loop-without-continuation` (`:81`), `repeat-loop-with-collection` (`:90`), `repeat-loop-with-break` (`:98`). The guard walks the routine directory because a routine body holds loops and an unbounded `while` in a shared definition propagates to every reference site (README:1027). `repeat-loop-with-break` is the one whose field sits at zero corpus sites (LF26) and whose subject the guard's own local interface omits. `tests/loop-shape-guard.test.ts` is the working template for all five. | 4 | 5 |
| **G14** | guard-run | Stage 1's drift guard: a run of two or more consecutive steps appearing in two or more files with any difference between the copies | Three of stage 1's five criteria are provocations: a shared run with a difference **is** reported, a window contained in a longer shared window over the same file set is **not** reported separately, and the guard reproduces the search's count. **The count is the defect, and it now has a second half.** README:825-826 requires "26 maximal windows, five of them nested"; run at this tree the proposal's own search reports **24 — 19 top level and 5 nested**. And the search is *path-shaped*: `measure/repeated-runs.py:95` globs `*/activities/**/*.yaml` and therefore parses **122 of the 132** activity files, missing the whole of `specimens/fan-conformance/activities/`. Made depth-agnostic it parses 132 and still reports 24 (19/5), so the count survives and the file set does not. Stages 6 and 8 both grade convergence by that baseline falling *and by nothing else* (README:906-907, `:941-942`), so both inherit both halves. State the criterion as the search's output over the corpus's own discovery rule at the revision the guard lands. Widen the file set to the routine directory in the same edit, with a routine declaration counting as a site — otherwise the re-inlining comparison loses its policeman at stage 5, `duplicate-checkpoint` requiring two inline sites while a migration leaves one inline copy against one routine declaration. | 1, graded at 6 and 8 | 3 |
| **G15** | guard-run | `check-review-mode-gating` going **blind** inside a routine | Assert the finding that *should* fire and does not. The guard exempts a mode-aware checkpoint by matching the literal `is_review_mode` in a step's `when` or condition (`guards/check-review-mode-gating.ts:113`), and inside a routine that name would be an input id — so the exemption misfires in both directions. The guard is gated three more times before it reaches a gate at all, and a `ref:` checkpoint parsed as raw YAML carries no `options`, so the consequential-default gate already excludes all four of the assumption run's batch gates today. **This is a coverage loss the migration inherits rather than one it creates** — which makes it a finding with a mechanism, and it belongs in a risk class it currently sits in nowhere. | 4 | 1 |
| **G16** | guard-run | `check-binding-fidelity` seeing every routine-input read as **unresolvable by construction** | A ledger-backed guard whose reading depends on the *textual* fragment injector, because the guard never touches the loader: it reads raw activity YAML and injects. Blinding it makes every recorded judgement silently vacuous rather than failing loudly. **The ledger now holds 71 entries** (`ledgers/binding-fidelity-triage.json` on the corpus branch), against 70 at the completeness pass and 72 in the ground truth. A routine reference it cannot materialise is an unresolvable read at every input. | 4 | 1 |
| **G17** | guard-run | `unused-declaration` on the host that keeps a declaration the routine takes over | Hard zero, no ledger (`guards/check-activity-variables.ts:252`, `:263` — fires when a declared write no step produces). `challenge_findings` is a declared activity-level write at **seven** activities — re-taken here — against the six README:905's criterion names. The two assumption internals are declared writes at four activities each, eight together. Fifteen declarations move, not fourteen. | 6 | 1 |
| **G18** | guard-run, **asserting its disappearance** | `check-fragments` · `undeclared-effect-variable`'s routine twin | A borrowing workflow whose `variables[]` does not declare a name a shared body's effects write, because the effect fires in the borrower's bag. Under a routine the contribution is mechanical — the outputs are full variable declarations travelling with the activity — so the hand-written declaration goes and **the finding goes with it**. Assert the rule reports nothing on a migrated corpus, and that the by-hand declaration it forced is gone. | 5 | 1 |
| **G19** | guard-run, **free** | `check-resource-anchors` reaching the routine directory with no change at all | Not a refusal — a coverage row worth carrying because it is the one guard that needs nothing. Its file walk recurses into every directory except `.git` and `node_modules` and yields every `.md` and `.yaml` (`walkFiles`, `guards/check-resource-anchors.ts:75-83`, driven from `:94`), so a `routines/*.yaml` file arrives in its scan the day the directory exists. Its scan is directory-shaped rather than path-shaped. | 3 | 1 |
| **G20** | **unprovokable** | Every option of every gate in a shared run is exercised once | **The walker has no routine entry point.** See the walk-site note above: `walk()` takes a workflow id, opens a session, and reads `ActivityDef`; a routine is never a transition destination and declares no exits. So the promised routine-level entry is a second walker, seeded from declared inputs whose seed **cannot supply the values** — both re-derived signatures bind operations declaring inputs the signature does not carry, and two of those three names are marked optional and therefore `suppliable` in `readSignature` (`src/utils/activity-variables.ts:378`), so the derivation consumes rather than reads them and they never enter the derived reads. That is why the claim survives a derivation-based check while failing as stated. | 4 | 1 |

---

## The ten cases no site can provoke

Eight refusal ids, ten test-grain cases. These are the most valuable rows in the matrix, because a
test plan that lists them as covered is asserting something the design does not contain. Each is
stated with why no site reaches it and what would have to change.

| Id | Cases | Refusal | Why no site reaches it | The fix |
|---|---|---|---|---|
| **L5** | 2 | Malformed routine name | The lifecycle has four non-`Checked` terminals and none matches `a::b::c` or `work-package::`. The mechanism being replaced does have the state, at `src/loaders/fragment-resolver.ts:37-45`. | Add the terminal at stage 3, with the load failures rather than with the stage-5 rule deletions. |
| **L6** | 1 | Colliding input/output declaration | No terminal, no rule, and the substitution table is keyed on `"{input_id}"` with nothing to say about an id that is also an output. The design's own worked signature produces the collision, invisibly, because at all seven live sites both sides resolve to one name. | Either a load failure refusing the collision, or a rule saying which side of the map wins in which field. |
| **L13b** | 1 | A routine with no reference site **anywhere**, at load | The load is per-workflow (`src/loaders/workflow-loader.ts:239`) and the resolution rule admits a cross-workflow reference. The rule it replaces has corpus-wide reach by construction, enumerating every workflow before collecting anything. A corpus-wide scan at load is *possible* — `indexCorpus` sits one import away and a filename-and-step-kind scan is not a full-load recursion — so the objection is cost and shape rather than possibility. | Restate as a guard alongside `unused-fragment`, and accept that the finding then lands on the corpus pull request. |
| **L14** | 2 | An artifact-declaring routine referenced twice in one activity | Nothing checks the intra-activity case at any grain: `artifactNames` is a `Set`, both `fan-artifact-collision` consumers are fan-keyed, and the artifact composition dedupes on filename. The corpus writes one filename from N steps of one activity at 24 (filename, activity) pairs and calls it produce-then-revise. | Delete the rule. The verdict is REMOVE, the case has no corpus instance, and removing it also takes the transitive-closure obligation off the artifact check — placement still needs the closure and the artifact check no longer does. |
| **L15** | 1 | A merged-scope step-id collision after prefixing | The re-check does not exist, and the two containers that would notice a clash both collapse it silently — a `Set` at `src/utils/validation.ts:128` and a `Map` at `:147`. | Write the re-check, and assert on the *error* rather than on a green run, because with no cross-scope repeats in the corpus a broken re-check passes. |
| **L21** | 1 | Stage 7's gate-option-per-site check | The three `prism` files it exists for carry zero checkpoint steps — re-measured here at 41 lines each and zero gates. | Drop the third check from stage 7's criterion, or name the family that has gates. |
| **L22** | 1 | Stage 3's ordering criterion | `deriveActivityContract` is not in the load path; its only two call sites are in one guard. There is nothing to swap. | Pick one of the three mechanisms and restate the criterion against it. Stage 4's entire contribution rests on which. |
| **G20** | 1 | Every gate option in a routine exercised once | The walker takes a workflow id and a routine is not a workflow node; and the seed drawn from declared inputs cannot supply the names the bound operations need. | Budget a second walker, and settle AF4 first — the seed question and the free-variable question are one question. |

Two further rows are adjacent to this list and are recorded rather than counted in it, because their
provocation exists and is wrong rather than absent:

- **L10 fires on legal bodies.** "A body naming anything outside the three categories fails the load"
  meets a technique's prose `{token}`, which materialisation cannot rewrite because it is not a step
  field. So the rule as specified reports every prose-sourced read as undeclared — three times over
  in the design's own signatures. The category either gains carve-outs or the tight boundary goes,
  and the tight boundary is one of the construct's two claimed advantages over any arrangement that
  shares a body without a signature.
- **G1 fires on every routine as authored.** That is by design and is the reason the name scope
  exists; it is listed so a test asserting "zero findings on a correct routine" is written against
  the rescoped rule and not the current one.

---

## Refusals stated at a strength the mechanism cannot deliver

Eight rows where the design names an enforcement level its own mechanism does not reach. The
enforcement ladder the proposal draws runs convention → detected → refused → refused at load →
unrepresentable, and a routine's contribution is claimed at the two right-hand levels.

| Id | Claim | Measured | Consequence for a test |
|---|---|---|---|
| **X1** | "A shared run has a use — **Refused at load**", mirroring the finding an unreferenced shared gate body already produces | The mirror is a **guard**: `unused-fragment` at `guards/check-fragments.ts:242`, one of nine rules in the guard's union type at `:57-65`, inside a corpus-wide sweep. The loader's only fragment diagnostic is a warning on an unparsable block. | The case belongs at guard-run, and a load-level test cannot be written. |
| **X2** | "A shared body lives somewhere sensible — **Refused at load** … Placement is computed from referring files **and a guard enforces it**" | The row contradicts itself in one sentence (README:560-562). | Decide the level before writing the case; the two sites have different fixtures and different assertions. |
| **X3** | "A shared run's declared signature matches what its steps do — **Refused at load**" (README:869-871) | The *Checking a routine on its own* sequence draws the same three checks as guard findings (README:713-718). | One subject, two strengths, two sites. Pick one per row (L7–L9 versus G7–G8). |
| **X4** | "Every option of every gate in a shared run is exercised — **Detected**", via a walker that "gains a routine-level entry" (README:877, `:1198-1200`) | The entry has no entry point. | Unprovokable; see G20. |
| **X5** | Stage 3: "Materialisation runs after identifier resolution and before contract derivation, and a test fails if the order is swapped" (README:854-855) | No order to swap. | Unprovokable; see L22. |
| **X6** | Stage 1: the guard "reproduces that count" — 26 maximal windows, five of them nested (README:825-826) | **24 windows, 19 top level, 5 nested.** And the search is path-shaped: it parses 122 of 132 activity files, missing `specimens/fan-conformance/` entirely. Depth-agnostic it parses 132 and still reports 24 (19/5). A guard reporting 26 over this corpus is wrong; a guard reporting 24 fails the criterion as written; and a guard inheriting the glob measures a corpus the server does not have. | The criterion has to name the search, the discovery rule and the revision, not a literal. Stages 6 and 8 inherit it. |
| **X7** | Stage 3: "`routines/` has … its own generated JSON schema, and the schema generator has a verifying variant, so a forgotten regeneration fails continuous integration" (README:846-848) | `scripts/generate-schemas.ts` emits **five** schemas (`grep -c "^generate(" ` → 5); `schemas/` holds **six** `.schema.json` files. `technique.schema.json` is hand-authored with its own `$id`, carries no `generate()` call, and is documented as generated from its Zod source. A `--check` written to the criterion's wording regenerates the five and diffs them, and stays blind to the sixth — or goes permanently red on a file the change does not touch. | Catching the sixth needs a directory-completeness assertion, which is a different check from the one the criterion asks for. |
| **X8** | Stage 3: "An exhaustiveness assertion over the step kinds fails to compile when a kind is added" (README:856) | `tsconfig.json:22` sets `"include": ["src/**/*"]` and `typecheck` is `tsc --noEmit`, so `guards/` and `tests/` are never typechecked — and the guard scripts moved *into* `guards/`, which leaves the position unchanged and the path stale in every earlier record. Of the step-kind comparison sites the refutation passes measured — 64 across 22 files by one rule, 61 across 22 by another, against the proposal's "57 places across 19 files" — only the `src/` share is protected. And the single field that disables the net is `...stepEntryCondition`: with it, a fifth `StepSchema` member compiles clean against a kind nothing handles; without it, three type errors name the three sites that must change, and those three errors are the only exhaustiveness signal the repository has. | Assert the exhaustive discrimination in `src/` at the one place that consumes the kind, and add a runtime assertion or a test for the guard scripts, which no compiler protects. Do not claim the population. |

One further mismatch belongs here and is not an enforcement claim: **the shared home's
justification**. "Referencing a routine the way the corpus references a shared technique gives the
corpus one resolution rule rather than two" (README:315-316) is false as measured. `parseFragmentRef`
reads any `::` head as a workflow and throws on a second separator; the technique loader decides
workflow-versus-group by filesystem probe and admits unbounded depth. Over 672 corpus technique
bindings the two rules agree on **264** and disagree on **408** — 360 one-separator group heads the
fragment rule would read as non-existent workflows with no fallback, and 48 two-separator paths it
would throw on (carried from server-code.md PD3; the binding population at this tree is 676). The
design owes either an explicit no-group-grammar statement for routine names, which is also what
closes AF3 and L5, or a reconciliation of the two resolvers.

---

## Properties unrepresentable rather than refused

No test provokes these by attempting a violation. Each row states what an assertion reaches instead.

| Id | Property | What a test can assert |
|---|---|---|
| **U1** | A routine declares no outcome, so it cannot receive one | Structural: the routine schema carries no `outcome` field, and the generated JSON schema has no such property. Behavioural: L16 refuses a routine named as a destination through the standing rule. The design's own supporting evidence is wrong and the rule may still be right — "every activity that would refer to one declares a single ending" (README:747-748) does not hold: re-measured here, four of the seven convergence sites declare more than one exit (5, 4, 2, 2) and all three `meta/activities/patterns/` activities declare none. |
| **U2** | A routine costs no hand-off; it runs inside the referring activity's dispatch | Assert the materialised activity's step list contains the routine's steps and the session history carries **no dispatch event naming the routine**. The alternative the design rejects — promoting the shared run to an activity four activities route through — costs four extra hand-offs. |
| **U3** | Two uses of one run agree on their steps | Assert one file. Ten measured differences across four copies have nowhere to live. Nothing in the guard suite compares step sequences today — verified by reading rather than by filename: `check-activity-technique-overlap` compares sets, `check-fragments`' two duplicate rules index single bodies and single rule strings, and nothing in `guards/` builds a key from more than one step. |
| **U4** | A use site cannot restate a gate | Structural: the routine step member is `.strict()` and declares no `message` or `options`. Boundary against LF28/LF29, where the gate's effects name the routine's own declarations. |
| **U5** | Two references to one gate in one activity record separately | Assert distinct composed keys. A checkpoint response is keyed on activity and checkpoint together, so two un-prefixed copies would replay the first answer; the prefix is what makes the second reference safe. **Untested against the corpus, which contains no such case** — the design says so itself at README:548-549. |
| **U6** | A workflow file holds routing, not one activity's state | Assert the `fragments` block's absence after stage 5. Re-taken here: it is one block at `corpus/work-package/workflow.yaml:15-71` — **57 lines** — referenced at eight steps in four activity files. |
| **U7** | A routine varies its steps by nothing but a declared input | Structural: there is no second parameter channel, and a run of steps that needs to differ structurally between two sites is two runs. Assert the reference step's field set. |
| **U8** | Nothing downstream knows a routine existed | Assert the loaded workflow's flattened step list carries no `kind: routine` at any depth, and that `flattenActivitySteps` — documented as the single traversal every step consumer routes through, used by **8** files at this tree, recursing into exactly one thing — never meets one. This is the property that makes the mechanism deletable rather than adaptable when the definition language emits steps directly. It is also the hazard: a compound kind `flattenActivitySteps` does not know is walked as a leaf, **silently**, and eight further walks recurse independently with the same limit. |

---

## What a live session asserts

Six observation obligations. None is a refusal, and a test that asserts "no error appeared" passes on
a broken implementation for most of them.

| Id | Obligation | The assertion |
|---|---|---|
| **O1** | Delivery is byte-identical for every activity that carries no routine | Compare delivered text before and after against the **128 of 132** activity files that carry no reference. The precedent is the pre-scan that already keeps those files off the fragment resolution path. |
| **O2** | The two representations agree | The differential test runs both paths over every activity in the corpus on every run, comparing parsed objects field for field **and comparing as text** the fields a worker acts on directly: a checkpoint's `message` and `id`, an option's `label` and `effect`, a step's `when`, a loop's `over` and `continueWhile` (README:859-862). Nothing in the tree does this today: the one test of the textual path runs the fragment injector alone over a small synthetic fixture, and no test names `injectResolvedStepIds`. The failure this catches is a worker reading a step the server does not believe exists. |
| **O3** | A worker cannot tell a step came from a routine | Assert the delivered step list, not the absence of an error. |
| **O4** | A session crossing the migration re-asks its renamed gates | Prefixed identifiers change every key the migration touches, so a crossing run finds no recorded answer and asks again; orphaned responses stay as dead data. Accepted and stated rather than mechanised (README:1130-1137). One correction worth carrying: the design declines a key-mapping table as "permanent server cruft", and `src/utils/session/migration.ts:219` already normalises legacy checkpoint-response keys. |
| **O5** | The checkpoint instance id the agent composes by hand | The per-iteration discriminator inside a materialised routine is assembled by the worker while there is no runner, and the two consumers of a generated identifier fail differently: `get_technique` resolves a step id by exact match and throws with the full list of available ids, while a mis-composed checkpoint instance id splits on the first `#` and silently re-asks a question whose answer already exists. Assert the loud one; observe the silent one. |
| **O6** | Delivery budget | Materialised routine steps are eager-bundling candidates and count against the per-activity budget; a routine referenced twice contributes its techniques twice (README:1149-1154). Measured before ruled on. **The per-site review cannot reach two of the four stage-5 hosts**: the one delivery baseline in the tree is a set of per-tool character totals over a single twelve-activity `work-package` walk under the e2e `skip-optional` policy, and `04-research` and `05-implementation-analysis` both declare `required: false` and appear nowhere in it. Adding them moves the baseline total, so it has to happen before the migration rather than inside it. |

---

## Defects this matrix found while being built

Each affects what a test can assert, and none is in either folder in this form.

1. **The construct has no run-time refusal surface, and no document says so.** Zero of the 53
   refusals sit at live-session and zero sit at walk. The graph fan's equivalent matrix places 15 of
   its 39 refusals on the tool surface; a routine places none, because a `kind: routine` step exists
   between parsing and materialisation and nowhere else. This is worth stating positively, because it
   is the property that makes the whole surface cheap to test — schema-parse and load-fixture between
   them reach 23 of 74 cases with no server and no session — and because it means **a smoke test
   proves nothing about this construct**. The fan's smoke test was the right instrument for a fan and
   is the wrong one here.

2. **Ten of the 74 cases have no provocation site, across eight refusal ids.** Five of the eight —
   L5, L6, L13b, L14, L15 — are load failures the design states in its own words; the other three are
   acceptance criteria written against mechanisms that do not exist (L21's gates, L22's ordering,
   G20's walker entry). None is a missing test. A plan that budgets "one test per load failure"
   against the lifecycle diagram writes four tests and believes it has covered six states, because
   the diagram draws four terminals and the design owes two more.

3. **The stage-1 baseline search is path-shaped and the corpus has since nested.** This is new here.
   `measure/repeated-runs.py:95` globs `*/activities/**/*.yaml` and parses 122 of the corpus's 132
   activity files; the ten it never opens are the whole of `specimens/fan-conformance/activities/`,
   added when the corpus adopted depth-agnostic discovery. The window count survives the correction —
   24 at 19 top level and 5 nested either way — which is precisely what makes the blind spot easy to
   ship: a guard promoted from this script would pass its own acceptance criterion while measuring a
   corpus the server does not have. Any guard that walks definition files has to enumerate through
   `corpusWorkflows`, not through a glob.

4. **Two of the five rescoped `check-variable-model` rules have no subject on the record.**
   `default-type-mismatch` checks a routine input's default against its declared type, and nothing in
   the folder says an input declares a type. `setvariable-outside-value-set` checks a target against
   its declared value set, and a routine output is specified as "an id, a type and a description, and
   no default" with no value set anywhere. So two of the five dispositions the gap review records as
   settled are settled against fields that may not exist. Decide the input and output declaration
   shapes before writing G4 and G5.

5. **The same three checks appear at two enforcement strengths in one document**, and the matrix has
   to carry both (L7–L9 and G7–G8) because the design does. README:869-871 says "fail the load" and
   README:713-718 draws them as guard findings. A test plan has to pick, and picking changes the
   fixture.

6. **`ref-body-conflict` has no routine analogue, because strictness absorbs it.** The fragment
   mechanism's load failure for a local body field alongside `ref`
   (`src/loaders/fragment-resolver.ts:111-116`, reported as `ref-body-conflict` by
   `guards/check-fragments.ts:60`) becomes a parse error on a `.strict()` routine step member (S3).
   That is the right answer and it means one of the retiring mechanism's nine rules maps to a
   *cheaper* layer rather than to a like-for-like replacement — worth recording so nobody writes a
   load-level case for it.

7. **The design names seven things a routine is not allowed to do and only two of them are refusals.**
   Taking a place in the graph is refused through a standing rule with an existing message (L16) and
   reaching itself is refused by a rule of its own (L2). Costing a hand-off, replacing a child
   workflow, owning an artifact prefix, reading an undeclared name and varying its steps by anything
   but a declared input are unrepresentable (U2, U7), definitional, or — in the case of the undeclared
   name — a refusal that fires on legal bodies (L10, AF4). A prohibition list that reads as seven
   refusals is five rows of over-count.

8. **`check-loop-shape` is the largest single guard obligation and is priced nowhere.** Five rules
   over a routine body's loops is five of the 27 guard cases — more than the six rescoped
   variable-model rows produce between them — and stage 4's criterion names the guard in one clause
   of a table row.

9. **Every path citation in both folders is stale.** The guards moved to `guards/`, the corpus left
   the engine tree, and the ledgers moved onto the corpus branch. A test plan written from the sweeps
   without this correction names files that do not exist, and — more quietly — reasons about a
   two-branch hazard that has changed shape, because a corpus pull request can now edit the ledger it
   trips.

---

## How each figure was taken

Every command runs from `/home/mike1/projects/dev/workflow-server` at `fe5f5f78`, with the corpus at
`.worktrees/workflows/corpus` at `e9d26007`, unless stated.

- **Tree identity** — `git rev-parse HEAD` in each checkout; `git submodule status` shows `.engineering`
  alone; `git log --oneline -5 -- .gitmodules` names `bb28377f`, "The engine tree does not pin the
  workflows branch".
- **Workflow and activity populations** — a `pathlib` walk under the corpus root collecting every
  `workflow.yaml` whose directory is not under a reserved `activities`/`resources`/`techniques` name
  gives **18**; `find corpus -maxdepth 2 -name workflow.yaml` gives **17**; every `*.yaml` under a path
  containing `activities` gives **132**.
- **Steps by kind** — a `yaml.safe_load` walk of all 132 activity files, recursing into a `kind: loop`
  node's `steps`: **1,005** steps — 676 technique, 161 action, 115 checkpoint, 53 loop — with **22** of
  the 115 checkpoints at loop depth one or greater.
- **Maximal shared step windows** —
  `python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py --root <corpus>`
  reports `activity files parsed: 122` and `maximal shared windows: 24 (top level 19, inside a loop
  body 5)`. The same script with its glob changed from `*/activities/**/*.yaml` to
  `**/activities/**/*.yaml` reports `activity files parsed: 132` and the same 24 (19/5).
- **`challenge_findings` declarations** — `grep -rn "name: challenge_findings" --include=*.yaml corpus/`
  gives **7**.
- **Shared-gate reference steps** — `grep -rn "ref: assumption" --include=*.yaml corpus/` gives **8**,
  across `04-research.yaml`, `05-implementation-analysis.yaml`, `07-assumptions-review.yaml` and
  `08-implement.yaml`.
- **The `fragments` block** — `corpus/work-package/workflow.yaml:15` opens it and `techniques:` opens
  at `:72`, so the block is lines 15–71, **57 lines**.
- **`effect.exit`, `effect.setVariable`, `breakCondition`, `continueWhile`** — the same YAML walk:
  **49** options carrying `effect.exit` across **28** files, **189** carrying `effect.setVariable`,
  **0** loops carrying `breakCondition`, **27** carrying `continueWhile`.
- **Exits at the convergence sites and the pattern library** — the same walk: `02-design-philosophy` 2,
  `04-research` 1, `05-implementation-analysis` 1, `06-plan-prepare` 2, `07-assumptions-review` 5,
  `08-implement` 1, `15-codebase-comprehension` 4; and `meta/activities/patterns/` holds three files —
  `02-supervisor.yaml`, `03-plan-and-execute.yaml`, `05-lead-researcher.yaml` — each declaring zero
  exits, carrying 0, 1 and 0 checkpoint steps respectively.
- **The `prism` per-unit passes** — `02-adversarial-pass.yaml`, `03-synthesis-pass.yaml` and
  `05-behavioral-synthesis-pass.yaml` are 41 lines each and contain **0** occurrences of
  `kind: checkpoint`.
- **Guards and schemas** — `grep -c "id: '" guards/guards.ts` gives **41**; `ls guards` matches **46**
  files against `check-*`/`validate-*`; `ls schemas/` shows six `.schema.json` files;
  `grep -c "^generate(" scripts/generate-schemas.ts` gives **5**.
- **Activity validation coverage** — `npx tsx guards/validate-activities.ts` reports
  `Total: 129 passed, 0 failed` against 132 files on disk.
- **Loader-consuming guards** — `grep -ln "loadWorkflowWithDiagnostics\|loadWorkflow("` over
  `guards/check-*.ts guards/validate-*.ts` returns exactly five: `check-activity-variables.ts`,
  `check-all-refs.ts`, `check-stealth-isolation.ts`, `check-session-contract.ts`,
  `validate-workflow-yaml.ts`. README:1066-1068 names six and includes `check-audience` and
  `check-artifact-guides`, which import the markdown technique loader rather than the workflow loader.
- **Fixture corpora** — `find tests scripts guards -name 'workflow.yaml'` gives **28**;
  `find tests scripts guards -path '*/activities/*' -name '*.yaml'` gives **68**. The helper is
  `tests/corpus-fixture.ts`; the working example is `tests/loop-shape-guard.test.ts`.
- **Ledgers** — `ls ledgers` on the corpus worktree lists four; `binding-fidelity-triage.json` holds
  **71** entries under its `entries` key.
- **The construct's absence** — no `routines` directory exists under the corpus root; a grep for
  `kind: routine`, `RoutineStep` and `RoutineSchema` over `src/`, `guards/` and `tests/` matches
  nothing; `src/schema/activity.schema.ts:167-172` declares `StepSchema` over four members.
- **Step-kind site gates** — `src/schema/activity.schema.ts:73-79` (`stepCommonFields`) and `:84-86`
  (`stepEntryCondition`), spread into three of the four members and deliberately not into the loop kind.
- **`fan-artifact-collision` is fan-keyed** — `guards/check-activity-variables.ts:385` opens
  `for (const fan of fans)` and both arms sit inside it, at `:401` and `:423`.
- **`check-variable-model`'s five rules** — the union type at `guards/check-variable-model.ts:48-53`.
- **`check-loop-shape`'s five rules** — `guards/check-loop-shape.ts:59`, `:67`, `:81`, `:90`, `:98`.
- **`check-fragments`' nine rules** — the union type at `guards/check-fragments.ts:57-65`;
  `unused-fragment` emitted at `:242`; the `Malformed`-prefix read at `:207`.
- **`deriveActivityContract` call sites** — the definition at `src/utils/activity-variables.ts:418`,
  its doc comment at `:19`, and two calls at `guards/check-activity-variables.ts:158` and `:483`.
  The loader never calls it.
- **The collapsing containers** — `src/utils/validation.ts:128` (`Set`), `:147` (`Map`).
- **`artifactNames` as a `Set`** — declared at `src/utils/activity-variables.ts:231`, constructed at
  `:447`, filled at `:508`.
- **The compiler's reach** — `tsconfig.json:22` is `"include": ["src/**/*"]`; `tests/e2e/walker.ts:68`
  is the four-member `StepDef.kind` union and `:681` is `walk`'s signature.
- **`flattenActivitySteps` consumers** — `grep -rln` over `src`, `guards` and `tests` returns **8**
  files.

Figures carried from the refutation passes rather than re-taken here are attributed in place, and
each names the verification that took them: the resolution-rule disagreement (264 of 672 agreeing,
408 disagreeing), the 24 (filename, activity) duplicate-artifact pairs across 11 files, the
four-ids-to-seven-names output remap, the 712 errors from extending `tsconfig`, the twelve injected
declarations across seven convergence sites, and the step-kind comparison-site populations.
