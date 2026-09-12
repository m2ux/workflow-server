# The permutation matrix for the routines construct

Every legal form a routine and its reference may take, every refusal the design defines, and — for
each one — where a test can provoke it.

> Item 10a · 2026-09-11 · server tooling at `792f2cc5` on `main`, corpus submodule at `a4a5d88b` on
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

**The construct is not built.** `ls workflows/*/routines` reports no such file or directory,
`StepSchema` (`src/schema/activity.schema.ts:167`) declares exactly four members —
`TechniqueStepSchema`, `ActionStepSchema`, `CheckpointStepSchema`, `LoopStepSchema` — and
`grep -rn "kind: routine\|RoutineStep" src scripts` matches nothing. Stage 0 alone has landed. So
every row below is a specification held against a tree that does not yet contain it, and a row
marked unprovokable is unprovokable because the design gives it no mechanism, not because the code
is unwritten.

---

## Measured counts

Every figure here was taken at `792f2cc5` / `a4a5d88b`; the command or `file:line` is in
[How each figure was taken](#how-each-figure-was-taken). Figures carried from the sweeps folder are
marked with where they were re-taken.

**LEGAL FORMS: 49 (LF1–LF49), in five groups** — 13 at the reference site, 17 in the definition, 7 in
resolution and placement, 9 in materialisation and identifiers, 3 in the stage-7 technique parameter.
Boundary cases carried explicitly: a reference with no arguments at all (the six convergence sites
bind nothing), an input left unbound that takes its default, an input whose absent value **omits the
binding** rather than emitting an empty literal, an output left unbound under a per-output marker,
four output ids binding to seven destination names across seven sites, two references to one routine
in one activity (zero corpus instances), a reference inside a loop body (the hardest position the
corpus has), a nested reference, a one-step routine holding only a gate, a routine with no inputs at
all, a routine referred to only by other routines (zero corpus instances), a `forEach` carrying
`breakCondition` (zero corpus sites), a composed prefix of four segments, a prefixed checkpoint id
carrying the per-iteration discriminator, an internal that is a loop item variable, an internal
holding a collection, a routine whose body declares an artifact directly and one that declares one
transitively through a wrapper, an output bound to a name the host already declares and one bound to
a name nothing declares, and delivery byte-identical for an activity carrying no routine.

**AMBIGUOUS FORMS: 10 (AF1–AF10).** Shapes whose legality the design leaves undecided, listed
separately rather than guessed. AF1 (one id declared as both an input and an output) is the design's
own worked signature, so this is not a hypothetical class.

**REFUSALS: 53 spec identifiers across three layers** — schema 11 (S1–S11), load 22 (L1–L22), guard
20 (G1–G20). At **test grain, 75 cases**, because several rows carry two or more distinct
provocations or two distinct messages.

- **schema: 11 ids → 19 cases.** S7 covers two id positions, S8 two arms, S9 five field names, S11
  three field names.
- **load: 22 ids → 28 cases.** L1, L2, L5, L9, L12, L13 and L14 carry two arms each.
- **guard: 20 ids → 28 cases.** G13 is `check-loop-shape`'s five rules, G14 is three of stage 1's
  five criteria, G11 needs both directions on one fixture.

**PROVOCATION SITE DISTRIBUTION (75 test-grain cases):**

| Site | Cases | What it is |
|---|---|---|
| schema-parse | 8 | `RoutineSchema.safeParse` / `StepSchema.safeParse` on an in-memory object, the style of `tests/schema-validation.test.ts`. No filesystem, no server. |
| load-fixture | 21 | `loadWorkflow(root, id)` against a `mkdtempSync` corpus, asserting on the `Result` — `tests/activity-variables.test.ts:87-99` is the template; `tests/workflow-loader.test.ts:101-128` builds three broken workflows in one root. |
| guard-run | 24 | Each guard's exported `collectFindings(root)` against a fixture corpus, the root supplied through `--root` or `WORKFLOWS_DIR` (`scripts/workflows-root.ts`); `tests/loop-shape-guard.test.ts:36` is the template. |
| walk | 0 | `walk()` at `tests/e2e/walker.ts:680` — and **no refusal is reachable here**, for two independent reasons given below. |
| live-session | 0 | `client.callTool` through `createHarness` (`tests/e2e/harness.ts`) — **no refusal is reachable here either**, and that is a property of the construct rather than a gap. |
| **undecided** | **11** | The design states the shape and never states the refusal level, so the site follows from a choice nobody has made: S8 (2), S9 (5), S10 (1), S11 (3). |
| **unprovokable** | **11** | No site, because the design gives the refusal no mechanism. Enumerated in full below — these are the most valuable rows in the matrix. |

**Zero refusals at live-session, and that is the construct working as designed.** A `kind: routine`
step "exists between parsing and materialisation and nowhere else" (README:430-431); the worker
"receives ordinary steps and cannot tell one came from a routine" (README:74). So unlike the graph
fan — which places seven refusal families on the tool surface — the routine construct has **no
run-time refusal surface at all**. What a live session can assert is the *delivered form*: six
observation obligations, listed under [What a live session asserts](#what-a-live-session-asserts).

**Zero refusals at walk, for two reasons that have to be fixed separately.** The walker cannot
express a refusal: `tests/e2e/walker.ts:372-375` turns any tool error into
`throw new Error('next_activity(<id>) failed: …')`, and `getActivity` and `resolveCheckpoint` do the
same. And a routine is not a walk subject: `walk()` at `tests/e2e/walker.ts:680` takes
`(harness, workflowId, policy, opts)`, opens with `start_session` and `get_workflow`, and everything
downstream reads `ActivityDef`, which requires `id` and carries `exits`, `techniques` and
`artifactPrefix`. A routine "is not a transition destination, never a workflow's first or last node"
(README:745-748) and declares no exits, so there is no session it can be the subject of. **The
routine-level entry stage 4 promises (README:877) is a second walker, and no stage budgets it.**

**UNREPRESENTABLE RATHER THAN REFUSED: 8 (U1–U8).** No test can provoke these by attempting a
violation, because the design leaves no channel for one. Each row states what an assertion can reach
instead.

**OBSERVATION OBLIGATIONS: 6 (O1–O6).** Neither refused nor unrepresentable. Listed so nothing here
is mistaken for enforcement.

**REFUSALS STATED AT A STRENGTH THE MECHANISM CANNOT DELIVER: 8 (X1–X8).** A matrix that listed
these as covered would be worse than no matrix, which is why they have a section of their own.

**Corpus and tree figures underneath the rows**, all re-taken here: **132** activity YAML files
across **18** workflows; **115** checkpoint steps at any loop depth; **24** maximal shared step
windows, **19** top level and **5** inside a loop body; **7** declared writes of
`challenge_findings`; **8** shared-gate reference steps in **4** activity files; **40** registered
guards; **44** `check-*`/`validate-*` scripts on disk; **6** files in `schemas/`, **5** of them
generator output; **23** synthetic fixture workflow trees and **59** fixture activity files under
`tests/` and `scripts/`.

---

## The five provocation sites, measured

The vocabulary is the fan matrix's, re-derived against the harness for this construct. A row's site
is the cheapest place a test can reach it, not the only one.

**schema-parse.** Zod on an in-memory object. `tests/schema-validation.test.ts` asserts
`StepSchema.safeParse(step).success` directly. Every step member is `.strict()` —
`src/schema/activity.schema.ts:100-102` for the technique kind, and nine `.strict()` calls in the
file — so an unrecognised key is a schema error rather than a silently ignored field. A routine step
member inherits that, which is what turns one of the fragment mechanism's own load failures into a
parse error (see S3 against L-note on `ref-body-conflict`).

**load-fixture.** `loadWorkflow(workflowDir, workflowId)` (`src/loaders/workflow-loader.ts:242`)
against a throwaway corpus, asserting on the returned `Result`. Two shapes of failure exist and the
asymmetry matters: a malformed **activity** degrades — the activity is excluded and the error
surfaced in `activityLoadErrors` (`tests/workflow-loader.test.ts:130-148`) — while a malformed
**graph binding** fails the whole load, because `loadWorkflowWithDiagnostics` returns `err(...)` on
any non-empty `validateExitBindings` result. **Which of the two a routine load failure takes is
unstated**, and it decides whether a routine reference failure is a per-activity diagnostic or a
whole-workflow refusal. The fragment mechanism takes the first: `src/loaders/fragment-resolver.ts`
throws and the loader's per-activity try/catch excludes and reports.

**guard-run.** Each guard exports `collectFindings(root)`; the root resolves through
`scripts/workflows-root.ts` with `--root` beating `WORKFLOWS_DIR` beating the default, and
`requireWorkflowsRoot` refuses a missing or empty root — so a fixture corpus has to hold at least
one real workflow directory. Positive arms need a fixture for every hard-zero guard, and the five
`check-variable-model` rules are hard zero (`scripts/check-variable-model.ts:29`), as are
`check-activity-variables` (`:25`), `check-activity-technique-overlap` (`:10`) and
`check-identifier-qualification`.

**walk.** `walk(harness, workflowId, policy, opts)` at `tests/e2e/walker.ts:680`. Cannot express a
refusal, and cannot take a routine as its subject. `StepDef.kind` at `tests/e2e/walker.ts:68` is
`'technique' | 'action' | 'checkpoint' | 'loop'` — a closed union the compiler enforces, the only
compiler-enforced four-kind enumeration in the repository, and it sits outside `tsconfig.json`'s
`"include": ["src/**/*"]`, so a fifth kind produces no error there.

**live-session.** `client.callTool` against the real server through
`createHarness({ workflowDir? })`. Every handler refusal is a plain `throw`, which the MCP SDK turns
into `{ isError: true, content: [{ text }] }`, so the assertion is always "isError, and the text says
the right thing". No routine refusal reaches here.

---

## Legal permutations

### A. The reference site (LF1–LF13)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF1** | A reference with arguments — `kind: routine`, `id`, `routine`, `with`, `outputs`, `when` | The flagship shape. One step replaces a run; the site supplies what differs and names where the outputs land. | README:284-292 |
| **LF2** | A reference with **no arguments at all** | A routine with no parameters is the plainest case of the construct and the strongest drift argument: 192 lines of source with nothing varying between the copies. The six convergence sites each become one step carrying only `id`, `routine` and `outputs`. | re-derivation.md:100-101, `:212-221` |
| **LF3** | A `with` value of each scalar type — string, number, boolean | `with` admits the same scalar union a technique step's `inputs` admits: `z.record(z.union([z.string(), z.number(), z.boolean()]))` at `src/schema/activity.schema.ts:63-67`. Three arms, and a test on one leaves the other two unproven. | README:294-296 |
| **LF4** | A collection argument as a **JSON string** | A collection reaches a parameter as a JSON string, as it already does at every step binding in the corpus. The worked signature binds `challenge_perspectives: '["stakeholder-gap", "rejected-paths", "evidence-strength"]'`. | README:294-296; re-derivation.md:199 |
| **LF5** | A **braced** argument — a reference | `"{comprehension_artifact}"` materialises as `"{comprehension_artifact}"`, braces kept, so a body's `"{input_id}"` becomes a reference to the host's variable. | README:374-379 row 1 |
| **LF6** | A **bare** argument — a literal | `open_questions` materialises as `open_questions`, braces dropped. Rewriting the token root instead would emit `"{open_questions}"` — a reference to a variable nothing writes. **Legality contested**: see AF6. | README:374-379 row 2; re-derivation.md:200 |
| **LF7** | An input left unbound that takes its **default** | `decision_space` declares `default: resolve-or-defer`; a site that says nothing gets it. Boundary against L3, which fires only where there is neither argument nor default. | README:227-229 |
| **LF8** | An input whose value is absent, so **the binding is omitted** | The third row of the substitution table, and the one an implementation is most likely to get wrong: an absent argument omits the body's binding entirely rather than emitting an empty literal, which would override name-match resolution with nothing. | README:374-379 row 3; decisions.md:139-142 |
| **LF9** | An **output remap** — an output id bound to a differently named session variable | This is what lets one routine serve two domains that name the same fact differently. Measured across the seven sites of the fold the convergence routine wraps: **four output ids bind to seven distinct destination names**, six sites binding all four identically and the seventh binding three to three different names. | README:300-304; re-measured at design-itself.md CV20 |
| **LF10** | An output left **unbound**, marked `unbound: permitted` | The one marked output in the whole folder, and the one unbound site of seven: the comprehension site binds `concern_document`, `concerns_agent_resolvable` and `residual_opens_remain` and drops `residual_opens`. Boundary against L11, which refuses an *unmarked* output left unbound. | re-derivation.md:136, `:226-238` |
| **LF11** | **Two references to one routine in one activity** | Collision-free by construction, because the prefix comes from the reference step's id. A checkpoint response is keyed on the activity and the checkpoint together (`src/tools/workflow-tools.ts:2069`), so two un-prefixed copies of one gate in one activity would replay the first answer at the second. **Zero corpus instances**: no activity refers to either shared gate body more than once. | README:549-556, `:688-703` |
| **LF12** | A reference carrying each **site gate** — `when`, `required: false`, `condition` | A routine step "carries the site gates every step kind carries". Measured, that is two fields from `stepCommonFields` (`src/schema/activity.schema.ts:73-79`) plus `condition` from `stepEntryCondition` (`:84-86`). The `condition` arm is the field that disables the design's own exhaustiveness net — see X8. | README:285-291 |
| **LF13** | A reference **inside a loop body** | Legal the moment the kind is legal anywhere: `LoopStepSchema`'s body is `z.array(z.lazy((): z.ZodTypeAny => StepSchema))` at `src/schema/activity.schema.ts:162`. The design calls this "the hardest position in the corpus" and its prototype splicer round-trips it. The comprehension site takes exactly this shape. | README:1172-1174; re-derivation.md:226-238 |

### B. The definition (LF14–LF30)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF14** | A routine declaring `id`, `version`, `name`, `description`, `inputs`, `outputs`, `internals`, `steps` | The full shape, and the only complete example the folder carries. | README:216-275 |
| **LF15** | A routine with **no inputs at all** | Six byte-identical blocks means every value in them is a constant, so the outer convergence routine declares no inputs. The signature check's input arm (L8) has no subject here, which is the boundary. | re-derivation.md:100-101 |
| **LF16** | A body carrying a **technique** step | The commonest body step; contributes its resolved signature to the routine's own contract. | README:185-186 |
| **LF17** | A body carrying an **action** step | Substitution must rewrite an action's `target`, `message` and `value`. Stage 7's `prism` routine keeps "the accumulating `set` action inside the routine" (README:925-927), so this arm has a named site. | README:185-186, `:364-368` |
| **LF18** | A body carrying a **checkpoint** step | The gate moves inside the routine, which is what makes "two uses of one run agree on their gates" unrepresentable. It is also what forces `check-checkpoint-entry` into the materialised column — see G11. | README:185-186, `:1073-1076` |
| **LF19** | A body carrying a **loop** step | A routine can own a loop, which is what stage 0 delivered `continueWhile` for. The outer convergence routine's body is one `doWhile` with `maxIterations: 10`. | README:768; re-derivation.md:186-205 |
| **LF20** | A body carrying a **routine** step (nesting) | Nesting is what lets the same run be reused both wrapped in a loop and on its own: six sites want the loop, the seventh wants a single pass inside a loop its activity owns. The refutation pass **upgraded this from NARROWS to KEEP** — refusing it at stage 3 and admitting it at stage 6 ships a load failure whose deletion is scheduled, and the schema already recurses. | README:318-328; design-itself.md CV5 |
| **LF21** | A **one-step routine holding only a gate** | Nothing forbids it, and it is the minimum body. Three adjacent refusals bound it: if it declares an input, L8 fires (nothing reads it); its gate's `setVariable` must name a declared output or internal (G1, G2); and referenced in an activity's first position it trips G11. | README:185-186; `scripts/check-checkpoint-entry.ts:18` |
| **LF22** | An **internal that is a loop's item variable** | `current_assumption` is one at four sites today. An internal declares an id and a description and nothing else — no type, no default, no value set — which is the standing the variable schema already gives a name written by an earlier step of the same activity (`src/schema/variable.schema.ts:63`). | README:200-205; decisions.md:196-206 |
| **LF23** | An **internal holding a collection** | Stated in the same sentence as LF22 and worth its own row, because a collection internal is the one an id-shape rule (AP-65) has an opinion about while nothing type-checks it. | README:204-205 |
| **LF24** | A routine whose body **declares an artifact**, referenced once in the activity | Legal; the limit is per activity, not per corpus. An artifact filename is the host activity's numeric prefix plus the technique's bare filename (`src/tools/workflow-tools.ts` records the `{artifactPrefix}-{bare_filename}` composition; the prefix comes from `parseActivityFilename` at `src/loaders/workflow-loader.ts:95`), and a routine has no prefix of its own. | README:1139-1147 |
| **LF25** | A routine declaring an artifact **transitively** — it references one that does — and referenced once | A routine declares an artifact when its own body binds a technique declaring one **or when any routine it references does**, closed transitively. Read at one level the limit is evaded by wrapping. Boundary against L14's second arm. | placement.md:92-100 |
| **LF26** | A body's `forEach` carrying **`breakCondition`** | Stage 0 kept the field and gave it a rule rather than deleting it, so a routine body's `forEach` may carry an early exit and `breakCondition` is one of the fields materialisation substitutes over. It sits at **zero corpus sites**, and it is on the keep list twice over: `check-loop-shape`'s `repeat-loop-with-break` rule reads it (`scripts/check-loop-shape.ts:98`) while the guard's own local `LoopStep` interface omits it, and `scripts/` is outside `typecheck`. | README:790-793; gap-review.md:128-149 |
| **LF27** | A body's `while`/`doWhile` carrying **`continueWhile`** | The field stage 0 landed, and the only field that carries a continuation test. An unbounded `while` in a shared definition propagates to every reference site, which is why `check-loop-shape` walks `routines/`. | README:768, `:1027-1028` |
| **LF28** | A gate option whose `setVariable` names a **declared output** | Inside a routine file a declared output satisfies `setvariable-undeclared`. All three `setVariable` targets in both shared gate bodies (`work-package/workflow.yaml:17-71`) are declared outputs in the proposal's own example signature, so this is the shape the migration actually produces. | README:1052-1061 |
| **LF29** | A gate option whose `setVariable` names an **internal** | Legal, and deliberately unvalidated: `setvariable-type-mismatch` and `setvariable-outside-value-set` "check a target that is an output and stay silent on an internal, which declares no type". A value passed between a routine's steps is not type-checked, exactly as a value passed between an activity's steps is not. | README:1061-1065; decisions.md:203-206 |
| **LF30** | A routine carrying its **own version**, unrelated to its referrers' | Changing a shared run leaves every referring activity's version standing still — the property the shared gate mechanism already has, with more content behind it. | README:1190-1194 |

### C. Resolution and placement (LF31–LF37)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF31** | A **bare name** resolving against the referring workflow | The first arm of `[workflow::]name`. | README:311-314 |
| **LF32** | A bare name resolving through the **shared home `meta`** | The second arm, and the design's whole argument for `meta`: a bare technique path already falls back there. **The argument does not survive measurement** — see X-note under PD3: over 672 corpus technique bindings the fragment rule and the technique rule agree on 264 and disagree on 408. The *form* is legal; the justification for it is not. | README:314-316; placement.md:120-133; server-code.md PD3 |
| **LF33** | A **qualified name** `workflow::name` resolving in that workflow only, with no fallback | `candidateWorkflows` (`src/loaders/fragment-resolver.ts:47-54`) returns the single named workflow for a qualified ref. Boundary against L1's second arm and L5. | README:311-313 |
| **LF34** | A **borrowed activity's** bare reference resolving against its **source** workflow | Twenty-one activities appear in more than one workflow's graph and one workflow borrows thirteen from another, including all four hosts of the assumption run — so resolving against the borrower would compute the wrong routine. `materializeActivityFragments` already takes a `sourceWorkflowId` (`src/loaders/fragment-resolver.ts:132-152`) and that is the value to read. | README:313-314; placement.md:64-67 |
| **LF35** | A routine referred to **only by other routines** | A referrer is an activity file or another routine, closed transitively. Without the clause such a routine has no referring activity file and the placement rule returns nothing — a guard with no verdict rather than a wrong one. **Zero corpus instances**: the pass the convergence routine wraps is referred to by an activity directly as well as through the loop. | placement.md:76-92; gap-review.md:298-317 |
| **LF36** | A routine whose referrer set spans **two or more** workflows, living in `meta` | Placement is computed from referring **files**, which have one unambiguous owner, rather than from graph membership, which does not. | placement.md:60-72 |
| **LF37** | A routine whose referrer set sits in **one** workflow, living there | Against the corpus this puts the assumption routine in `work-package`, the fan-out routine in `meta`, the commit-and-publish routine in `workflow-design` and the roster fan-out in `substrate-node-security-audit`. | placement.md:60-74 |

### D. Materialisation and identifiers (LF38–LF46)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF38** | A composed prefix of **one segment** — `reconcile-assumptions.batch-gate` | Every identifier inside a materialised routine is prefixed with the reference step's id, full stop as separator. The separator choice is forced: `#` is the per-iteration discriminator and `baseId` (`src/loaders/workflow-loader.ts:473-476`) returns everything before the **first** one across **13 call sites in 4 files**; `::` is the technique-path separator; and the checkpoint response key is `-`-joined over kebab-case ids (`src/tools/workflow-tools.ts:2069`), parsed back by prefix length at `src/utils/validation.ts:91-96`. | README:538-547; server-code.md CV17 |
| **LF39** | A composed prefix of **four segments** through nesting — `converge-assumptions.pass.iteration.challenge` | Prefixes compose, and depth is bounded by cycle detection rather than by a limit. How long a generated identifier may be is one of the two questions the design leaves open, and it wants re-measuring against the re-derived signature. | README:326-328; decisions.md, gap-review.md item 2 of *What is left* |
| **LF40** | A prefixed checkpoint id carrying the **per-iteration discriminator** — `reconcile-assumptions.interview.decision#{current_assumption.id}` | The load-bearing half: a gate inside a loop is reached many times within one activity and would otherwise replay the first answer. The mechanism generates both this and LF11's prefix, and **only this one has a corpus case to prove it against**. | README:542, `:553-556` |
| **LF41** | A **simultaneous** substitution — a binding mapping `a → b` and `b → c` renaming each occurrence exactly once | A requirement rather than a convenience: an iterative rewrite renames some occurrences twice. | README:388-391, `:851-853` |
| **LF42** | An internal's materialised name carrying **both the host activity and the reference site**, underscore-joined — `implement_reconcile_assumptions_assumption_presentation` | A step id is unique within its activity; a variable name shares one flat namespace across the whole workflow. Prefixing from the reference site alone put one internal name in four activities and produced four crossing findings when the guard suite was run over a converted corpus. | README:193-198; decisions.md:185-195 |
| **LF43** | A routine output bound to a name the host **already declares** → injection is a **no-op** | Replacing an existing declaration puts two defaults for one variable into the merge. | README:1100-1101 |
| **LF44** | A routine output bound to a name **nothing declares** → injection supplies the declaration | This is what makes an invisible write visible. Measured: the copy supplies **12 declarations across the seven convergence sites** — two at each of the six assumptions sites and nothing at the comprehension site, whose author already declares every name the routine binds — and the merge carries **zero contradictions**, every variable keeping the default its owner declares. | README:1096-1112 |
| **LF45** | Delivery **byte-identical** for an activity carrying no routine | The regression floor, and the precedent exists: `scanCheckpointRefLines` (`src/loaders/fragment-resolver.ts:218-224`) is a pre-scan that keeps files with no `ref:` off the resolution path entirely. **Four of 132 activity files carry a `ref:` line today.** | README:863 |
| **LF46** | A materialised step in the **raw-text** path carrying an explicit prefixed `id:`, nested bodies included | `injectResolvedStepIds` derives an id textually from a `- technique:` opener and knows nothing of a routine prefix, so a spliced step without an authored id would arrive unprefixed in the text and prefixed in the object graph. **Its subject population is zero** — 0 of 132 activity files carry that opener and 0 of 676 technique steps omit an id — so the obligation is right and the criterion's stated reason is empty (PD9). | README:857-858, `:1181-1184`; server-code.md CV1, PD9 |

### E. The technique parameter, stage 7 (LF47–LF49)

| Id | Form | What it proves | Stated at |
|---|---|---|---|
| **LF47** | An input declared **`kind: technique`**, its argument a technique reference substituted into a body step's `technique:` field | Substitution happens before the derivation, so each reference site yields a concrete path and every signature resolves. The price is stated rather than hidden: such a routine has no signature of its own. | README:396-402, `:913-915` |
| **LF48** | A body step whose `technique:` is a parameter and which **declares its own `id`** | The derived id would otherwise be the placeholder. This is the one place the design requires an authored id for a reason unrelated to prefixing. | README:916-917 |
| **LF49** | A routine binding **no** technique by parameter keeping the **once-per-routine** path | Three guarantees carry no exception while no routine binds a technique by parameter, and become conditional only for those that do. | README:410-414, `:918-921` |

### F. Ambiguous forms — legality the design leaves undecided (AF1–AF10)

Listed rather than guessed. Each is a form a test plan cannot write a case for until someone decides
which side of the line it falls on.

| Id | Form | What is undecided | Evidence |
|---|---|---|---|
| **AF1** | **One id declared as both an input and an output** | Whether it is legal at all, and if so which side of the reference-site map wins in which field. At a reference site one id carries two intended values: the argument under `with` and the destination under `outputs`. The lifecycle has terminals for unresolved, cyclic, unbound and overbound and none for a colliding declaration, and the substitution table is keyed on `"{input_id}"` and says nothing about an id that is also an output. **This is the design's own worked signature**: `challenge-concerns` declares `concern_document` as an input at `re-derivation.md:118-121` and as an output at `:122-125`. At all seven live sites the two resolve to the same name, so the collision is invisible and the worked conversion runs clean; it stops being invisible the moment a site reads one document and writes another, which is ordinary for a fold. | design-itself.md PD5; sweeps README defect 10 |
| **AF2** | A gate option carrying **`effect.exit`** inside a routine body | `effect.exit` names an exit id of the *owning activity* — "a name from the activity's `exits[]`" (`src/schema/activity.schema.ts:51`) — which is a name outside all three declaration categories. The substitution field list covers "an option's effect names and values" without saying what happens to an `exit` with no binding at the reference site. **49 checkpoint options across 28 activity files carry one** corpus-wide, though none inside the runs stages 5 and 6 convert, so nothing breaks immediately. The sharper version: four `meta/activities/patterns/` activities declare zero exits, and a routine cannot select an exit from an activity that has none. | design-itself.md CV16 |
| **AF3** | A routine name with **two `::` separators**, or a trailing one | Whether it is a parse error, a load failure, or resolvable. The design adopts the `[workflow::]name` grammar and never states a bound on it. This is the fifth lifecycle state and it has its own refusal row (L5). | canon-rules.md P6 |
| **AF4** | A body binding a technique whose **prose interpolates a bag name** | Whether such a name is a declared input, an exempt category, or a load failure. `readSignature` collects every `{token}` from a bound operation's protocol blocks, rules and artifact filename templates (`src/utils/activity-variables.ts:362-372`), strips those naming the operation's own signature (`:389`), and the derivation adds the remainder to the referring activity's reads at one line (`:520`). Those tokens live in technique markdown, not in a step field, so they lie outside the substitution field list by construction and materialisation cannot rewrite them. **The design's own signatures do this three times**: `analyse-challenge::challenge` declares `target_path`, `review-assumptions::reconcile` declares `comprehension_artifact`, and `challenge_findings` passes from `challenge.md` to `combine.md` undeclared. | server-code.md PD2; design-itself.md CV8 |
| **AF5** | A routine referenced from an activity a **graph fan** runs | The derivation runs on the *materialised* activity, so a routine's artifact names enter the host's `artifactNames`, and `fan-artifact-collision`'s instance arm requires every artifact name on a fanned activity to interpolate that fan's per-instance parameter (`scripts/check-activity-variables.ts:405-425`). A routine authored without knowledge of a fanning host fails there. Stage 8's fan-out routine is where this first becomes live. | server-code.md PD8 |
| **AF6** | A **bare `with` argument that resolves in the host's declared namespace** | The design admits the bare form as a literal at a binding site with no legacy; the tree's own precedent refuses it. `check-set-action-values`'s header states the repository's decided position: "A `value` that names another variable has to be braced … because an unbraced one is the literal string", and "**A rename written bare is refused too, though none exists; one spelling for reading a variable is the point**". The design's own worked example binds `concern_document: assumptions_log` bare and relies on the technique step's dynamic name-match resolution to read it as a rename — two readings in one value path. | design-itself.md CV7 |
| **AF7** | A routine declaring an activity-level **`techniques[]`** list, or `exits`, `outcome`, `rules` or `triggers` | Whether the routine schema is `.strict()`, and therefore whether a field a routine does not have is a parse error or a silently ignored key. Every step member is `.strict()`; the routine file's own schema is unspecified. This decides the site for five of the refusal rows (S9). | README:216-222; `src/schema/activity.schema.ts:100-102` |
| **AF8** | A routine referenced from a `meta/activities/patterns/` **library** activity | Materialisation is a load-time pass and never runs at these files: `loadActivitiesFromDir` (`src/loaders/workflow-loader.ts:72-107`) is non-recursive and no `workflow.yaml` references them, so `npx tsx scripts/validate-activities.ts` validates **129 of 132** activity files. Having no consumer is the *designed* state of a library and the repository says so in its own triage rationale — so the files are not dead, but no loader-consuming guard and no host-activity walk ever exercises a reference site in them. Stage 8 puts reference sites there. | design-itself.md CV17; server-code.md CV16 |
| **AF9** | An input declaring **"a default of nothing"** | The substitution table's third row reads "Absent, or a default of nothing", and no schema shape is given for the second half. An input with no `default` key at all is L3 (Unbound); an input with `default:` and an empty value is this case, and nothing says whether it parses. | README:374-379 row 3 |
| **AF10** | Whether the **positional step keys** survive materialisation | `currentStep` and `completedSteps` are keyed on `StepIndex = z.number().int().min(1)` (`src/schema/state.schema.ts:4`), a position rather than a name, and materialisation splices N steps in place of one, shifting every index after a reference site. The design addresses the composed checkpoint key and accepts the re-ask; it says nothing about the indices, and neither does any sweep. The mitigating fact is that both fields are vestigial — a grep across `src/` finds only the two declarations and one initialiser — which is what makes this a KEEP with a discriminator rather than a defect. | completeness.md:113-121 |

---

## Refusals, and where each is provoked

### Layer 1 — schema (S1–S11), 19 test-grain cases

| Id | Site | The refusal | What the message must name | Stage | Cases |
|---|---|---|---|---|---|
| **S1** | schema-parse | A `kind: routine` step declares no `routine` | The required field. The step names the routine it refers to and there is no other channel for it. | 3 | 1 |
| **S2** | schema-parse | A `kind: routine` step declares no **`id`** | That a routine step's id is required and not derivable. `populateStepIds` derives an id only for a technique step and throws for any other kind (`src/schema/activity.schema.ts:198-203`), and the reference step's id **is the prefix**, so it must exist before the body is spliced. Making it required at the schema keeps the failure at parse rather than at load. | 3 | 1 |
| **S3** | schema-parse | An **unrecognised key** on the routine step | The offending key, as `Unrecognized key(s) in object: '<k>'`. This is the row that subsumes one of the fragment mechanism's own load failures: `materializeCheckpointStep` throws `ref-body-conflict` when a checkpoint declares body fields alongside `ref` (`src/loaders/fragment-resolver.ts:111-116`), and `.strict()` on the routine member makes the analogue a parse error instead. Also assert `additionalProperties: false` in the regenerated `schemas/activity.schema.json`. | 3 | 1 |
| **S4** | schema-parse | A `with` value outside the scalar union | That an argument is a string, a number or a boolean, and that a collection travels as a JSON string. | 3 | 1 |
| **S5** | schema-parse | An `outputs` value that is not a string | That the map goes from output id to session variable name. | 3 | 1 |
| **S6** | schema-parse | A routine **output id** that is not a legal variable name | The qualified-noun rule, via `VariableNameSchema` (`src/schema/variable.schema.ts:6-9`): `QUALIFIED_DATA_ID_PATTERN` at `src/schema/identifiers.ts:16` plus the `EXEMPT_DATA_IDS` enum at `:30`. Stage 6's criterion requires every output id to conform, and the conversion artifacts' four earlier output ids violated two catalogue rules (a `…_flag` burial and a `*_collection` suffix). | 3, graded at 6 | 1 |
| **S7** | schema-parse | A routine **input id** or **internal id** that is not a legal variable name | The same rule at the two other id positions. A routine's input, output and internal ids are symbol ids and the schema enforces the qualified-noun rule on the YAML side. | 3 | 2 |
| **S8** | **undecided** | A routine declaring **no `steps`**, or an **empty** `steps` list | Whether either parses. The design never says a routine's body is non-empty, and a routine with no steps is a signature with nothing behind it — the whole subject of the L7–L9 checks. | 3 | 2 |
| **S9** | **undecided** | A routine declaring a field a routine does not have — `exits`, `outcome`, `rules`, `triggers`, `techniques` | Whether each is a parse error or an ignored key, which follows from AF7. Two of the five have live consequences: `check-checkpoint-presentation` sits out of a routine's way precisely because "a routine declares no rules", and "it declares no outcome" is one of the four things a routine is not allowed to do. | 3 | 5 |
| **S10** | **undecided** | A routine **output** declaring a `default` | Why: a default is a seed applied at session creation, a property of the variable rather than of a run that writes it mid-flight, so a routine declaring one claims to seed a variable it does not own. The design states the rule and not its strength. | 3 | 1 |
| **S11** | **undecided** | An **internal** declaring a `type`, a `default` or a value set | Why: an internal never enters the workflow's variable set, so nothing merges, seeds or type-checks it, and a type would be a field with no reader. Three field names, three cases. | 3 | 3 |

### Layer 2 — load (L1–L22), 28 test-grain cases

The first six are the reference lifecycle. The design states that **every terminal state but
`Checked` is a load failure and none is a warning**, with a message naming the routine, the reference
site and the reason — because a routine that half-resolves would deliver a worker a step nobody
declared.

| Id | Site | The refusal | What the message must name | Stage | Cases |
|---|---|---|---|---|---|
| **L1** | load-fixture | **Unresolved** — no routine of that name | The routine, the reference site, and the homes searched. Two arms: a bare name found in neither the referring workflow nor `meta`, and a qualified name naming a workflow that holds no such routine (which has **no fallback** — `candidateWorkflows` returns the single named workflow). A test on one arm leaves the other's path unproven. | 3 | 2 |
| **L2** | load-fixture | **Cyclic** — the routine reaches itself | The cycle, as the chain of reference ids. Two arms: a routine referencing itself directly, and a two-routine cycle. Depth is bounded by cycle detection rather than by a limit, so this walk is also what terminates the placement closure and the artifact closure. | 3 | 2 |
| **L3** | load-fixture | **Unbound** — an input with no argument and no default | The input id, the routine and the reference site. Boundary against LF7, where the default supplies it. | 3 | 1 |
| **L4** | load-fixture | **Overbound** — a `with` argument naming no declared input | The argument name and the routine's declared input list, because the list is the author's fix site. | 3 | 1 |
| **L5** | **unprovokable** | **Malformed** — a routine name that does not parse | The malformed value and the two forms accepted. **The lifecycle has no terminal for this and the design owes the state.** The mechanism being replaced has it: `parseFragmentRef` throws `Malformed fragment ref '<ref>' — expected 'name' or 'workflow::name'` for a value with more than one `::` (`src/loaders/fragment-resolver.ts:37-45`), and `check-fragments.ts:207` reads the word `Malformed` off the message to choose between its `malformed-ref` and `unresolved-ref` rules. Two arms a routine reference reaches: `a::b::c` and `work-package::`. Add the state at stage 3 with the other load failures, not at stage 5 with the rule deletions. | **owed at 3** | 2 |
| **L6** | **unprovokable** | **Colliding declaration** — one id declared as both an input and an output | Which side wins in which field, or that the collision is refused. **No terminal, no rule, and the substitution table has no answer.** See AF1: this sits inside a construct whose verdict is KEEP, and the design's own worked signature produces it. | **owed at 3** | 1 |
| **L7** | load-fixture *or* guard-run | **An output nothing writes** | The output id and the routine, and that the body was derived rather than assumed. The design states this at two different strengths in two places — "Refused at load" in the guarantee table, and a guard finding in the *Checking a routine on its own* sequence. See X3. | 4 | 1 |
| **L8** | load-fixture *or* guard-run | **An input nothing reads** | The input id and the routine. Same double strength. **AF4 is what makes this hard**: a signature check that trusts the derivation reports a prose-sourced read as an undeclared input, or drops the category and loses the tight boundary that is one of the construct's two claimed advantages. | 4 | 1 |
| **L9** | load-fixture *or* guard-run | **A declared internal that nothing writes, or that nothing reads** | The internal id and which half failed. Two arms, separately provokable. | 4 | 2 |
| **L10** | load-fixture | **A body naming anything outside the three declaration categories** | The name and the three categories, with the one carve-out stated: an artifact filename template, which the worker interpolates at run time from the technique's own outputs and which the definition never reads. **Fires on legal bodies as specified** — see AF4 and X-note. | 3 | 1 |
| **L11** | load-fixture | **An unmarked output left unbound** at a reference site | The output id, the reference site, and that an output which may be left unbound says so in its declaration. Boundary against LF10. The design's stated reason for the marker is false and verified so: a technique step's unremapped output lands under its own id (`src/utils/activity-variables.ts:535`) and `write` is namespace-filtered at `:475`, so a name no workflow declares never enters the variable set — it lands in `produces` and stops. The corpus already carries **975 unremapped technique-step outputs of 1,026 declared** on exactly that footing. | 3 | 1 |
| **L12** | **guard-run** | **Placement** — a routine whose home disagrees with its transitive referrer set | The computed home, the home on disk, and the referrer files that decide it. Two arms: a single-owner routine sitting in `meta`, and a two-owner routine sitting in one of them. **Stated at load and enforced by a guard in one sentence**: "**Refused at load** … Placement is computed from referring files and a guard enforces it." See X2. | 4 | 2 |
| **L13** | **guard-run**, and **unprovokable at load** | **A routine with no reference site anywhere** | The routine and the search's reach. The mirror is a guard, not a load: `unused-fragment` is emitted at `scripts/check-fragments.ts:242` inside a corpus-wide sweep that first collects every reference across every workflow's activities and then walks every workflow's declared fragments. A load is per-workflow — `loadWorkflow(workflowDir, workflowId)` at `src/loaders/workflow-loader.ts:242` — and the resolution rule admits a cross-workflow reference, so a per-workflow load of `work-package` sees no reference site for a `meta` routine and fails while one exists a directory away. **The "anywhere" arm cannot fire as specified.** See X1. | 4 | 2 |
| **L14** | **unprovokable** | **An artifact-declaring routine referenced twice in one activity** | The filename, the two reference sites, and the data-loss reasoning. **No mechanism exists at any grain.** `DerivedContract.artifactNames` is a `Set` (`src/utils/activity-variables.ts:446`), so two steps of one activity resolving one filename collapse to one entry; both consumers are keyed on a `fan` (`scripts/check-activity-variables.ts:385`, `:410`); and `composeActivityArtifacts` keeps its own `seen` set and emits one contract entry. The corpus meanwhile carries **24 (filename, activity) pairs across 11 files** that write one filename from two or more step bindings, the largest at four steps — produce-then-revise, legible in the step ids (`analyze-source` then `revise-source-analysis`). The refutation verdict on this rule is REMOVE: neither shared gate body is referenced twice by any one activity, so the case it guards has no instance. Two arms if it is kept: a direct declaration and a transitive one through a wrapper (LF25). | 4 | 2 |
| **L15** | **unprovokable** | **A step-id collision in the merged scope after prefixing** | The colliding id and the two scopes. The design wants identifier population per definition, with uniqueness "re-checked in the merged scope afterwards". Half exists: `populateStepIds` is already a per-scope mechanism and already treats a loop body as an independent scope (`src/schema/activity.schema.ts:213-218`), but its signature is `populateStepIds(activity: Activity)` and it interpolates `activity.id` into all three of its messages. **No merged-scope re-check exists anywhere, and the two containers that could notice a clash both collapse it**: `knownIds` is a `Set` (`src/utils/validation.ts:128`) and `declarationIndex` is a `Map` keyed by id (`:147`) — the second decides the step-order check, so a collision loses an order constraint as well as a manifest entry. Both fail silently. Prefixing is what makes the merged scope safe by construction, and with **zero cross-scope repeated step ids** in the corpus the re-check lands green on day one whether or not it is correct. | 3 | 1 |
| **L16** | load-fixture | **A routine named as a transition destination** | Reachable through the standing rule with its existing message: `validateExitBindings` reports a destination "which this workflow does not contain" (`tests/workflow-loader.test.ts:101-105`), and a routine is not in `activities`. Assert it fails with *that* message and not with a rule of its own, or a spurious routine-specific rule goes undetected. | 3 | 1 |
| **L17** | — | *(folded into S2 — a reference step with no id)* | — | — | 0 |
| **L18** | load-fixture | **Stage 7: a routine that reads its technique parameter's outputs** | Why it is refused — the members' signatures would have to agree and their outputs would need somewhere to land — and that no bound is declared because none is needed. The `prism` family is the benign case: the pass writes its artifacts and appends, and the routine never reads the parameter's outputs. | 7 | 1 |
| **L19** | load-fixture *or* guard-run | **Stage 7 per-site check 1: the contract** | That the contract is derivable per reference site and not in isolation for a routine binding a technique by parameter. | 7 | 1 |
| **L20** | guard-run | **Stage 7 per-site check 2: whether the body declares an artifact** | Which site's argument made it an artifact-declaring routine. | 7 | 1 |
| **L21** | **unprovokable at its own family** | **Stage 7 per-site check 3: whether every gate option is exercised** | **There are no gates.** All three `prism` per-unit pass files are 41 lines, each one 20-line `forEach`, and `grep -c "kind: checkpoint"` returns **0** at every one of them. So a third of the price the feature is "already priced at" buys nothing at the family it exists for. | 7 | 1 |
| **L22** | **unprovokable** | **Stage 3: materialisation runs after identifier resolution and before contract derivation, and a test fails if the order is swapped** | **There is no order to swap.** `deriveActivityContract` (`src/utils/activity-variables.ts:417`) has exactly two call sites in the repository, both in one guard script — `scripts/check-activity-variables.ts:158` and `:482` — and the loader never calls it. The loader performs five of the six drawn steps: read and parse, `safeValidateActivity` (`src/loaders/workflow-loader.ts:87`), `populateStepIds` (`:94`), `artifactPrefix` from the filename (`:95`), fragment materialisation, then the variable merge and exit binding. Both guard call sites read loader output that is **already materialised**, so a routine reference is gone before the derivation ever meets it — the exact opposite of the boundary stage 4 exists to guarantee. Three mechanisms could supply it and the proposal names none: the loader exposes both forms; the derivation moves into the loader; or the loader records the sites it spliced and hands them over as a side table. | **owed at 3** | 1 |

### Layer 3 — guard (G1–G20), 28 test-grain cases

Five rows are `check-variable-model`'s five rules rescoped to a routine file. The rescoping is
settled: `setVariable` is a field an author writes, and routing the guard through the loader would
have it audit generated names — the failure the `check-set-action-values` case rules out. So the
guard stays in the authored column and gains a name scope. It is hard zero with no baseline
(`scripts/check-variable-model.ts:29`), so every positive arm needs a fixture corpus.

| Id | Site | The refusal | What the message must name | Stage | Cases |
|---|---|---|---|---|---|
| **G1** | guard-run | `setvariable-undeclared` inside a routine file: a `setVariable` naming neither a declared output nor an internal | The target and the routine's own declarations. Today the rule requires a workflow-variable declaration (`scripts/check-variable-model.ts:118`), so **every gate in every routine violates it as authored, by construction** — a routine body's gate names a routine output id or an internal, which become bag names only through materialisation. | 4 | 1 |
| **G2** | guard-run | `setvariable-undeclared` inside a routine file: a `setVariable` naming a **workflow variable** | That a routine has no free variables, so a workflow variable does **not** satisfy the rule here. **This is a new refusal rather than a rescoping** — inside a routine file the rule inverts, and the inverted arm is the one a test is most likely to omit. | 4 | 1 |
| **G3** | guard-run | `setvariable-type-mismatch` where the target is an **output** | The declared type and the literal. Silent on an internal, which declares no type — assert both directions on one fixture. | 4 | 1 |
| **G4** | guard-run | `setvariable-outside-value-set` where the target is an output | The declared value set. **Ambiguous subject**: a routine output declares "an id, a type and a description, and no default" and no value set is named anywhere, so this rule may have no subject inside a routine file at all. Decide whether an output declares `values` before writing the case. | 4 | 1 |
| **G5** | guard-run | `default-type-mismatch` on a routine **input's** default against its declared type | The declared type and the default. **Ambiguous subject**: the design describes inputs as "named parameters with optional defaults, the shape a technique's inputs already take" and never says an input declares a type. If it does not, this rule has no subject either. This and G4 are the two rescoped rules whose subject does not exist on the record. | 4 | 1 |
| **G6** | guard-run | `exists-on-defaulted` on an `exists`/`notExists` gate over a **defaulted input** | That the gate is constant, for the reason it is constant on a defaulted variable. | 4 | 1 |
| **G7** | guard-run | The routine's own contract check: an output declared, nothing writes it | Same subject as L7 at the other strength. The check derives reads and writes from the routine's body with no host activity in sight; `scopeWorkflowId` (`src/utils/activity-variables.ts:421`) is what gives it a workflow to resolve bound ops against. | 4 | 1 |
| **G8** | guard-run | The routine's own contract check: an input declared, nothing reads it | Same subject as L8. | 4 | 1 |
| **G9** | guard-run | No reference site anywhere → a finding | Same subject as L13, at the strength the mirror actually has. The correct home is a guard alongside `unused-fragment`. | 4 | 1 |
| **G10** | guard-run | The home disagrees with the referring files → a finding | Same subject as L12. | 4 | 1 |
| **G11** | guard-run, **both directions** | `check-checkpoint-entry` on a materialised activity whose first step came from a routine that opens with a checkpoint | The activity, the step, and the dispatch cost — "a dispatch that only asks a question is the most expensive way to ask one", `scripts/check-checkpoint-entry.ts:1-19`, with the check stated mechanically as `steps[0].kind == "checkpoint"` (`:18`). **This is the case that forces the materialised column**: the assumption routine's first step is a checkpoint, so a reference in first position evades the rule entirely against unexpanded text. The guard reads raw activity YAML non-recursively today (`:39`) and consumes no loader, so the positive arm needs the column move to have happened. Negative arm: a routine whose first step is not a gate produces no finding. | 4 | 2 |
| **G12** | guard-run | `check-activity-technique-overlap` resolving a reference step to the routine's own step bindings | The activity-level entry and the routine step that binds it. Hard zero (`scripts/check-activity-technique-overlap.ts:10`). **The verdict on this change is REMOVE**: the population is 32 files, 33 entries and 4 distinct names corpus-wide, the guard's own non-recursive scan reads 28 files and 29 entries, and **no activity both lists and binds one technique**. None of the four listed names appears among the techniques stages 5 to 8's routines bind. A hard-zero guard gaining an admitted exception for a finding class with no member is the wrong use of stage 4's budget. | 4 | 1 |
| **G13** | guard-run | `check-loop-shape`'s five rules over a **routine body's** loop | Five rules, five cases: `item-loop-without-collection` (`scripts/check-loop-shape.ts:59`), `item-loop-with-continuation` (`:67`), `repeat-loop-without-continuation` (`:81`), `repeat-loop-with-collection` (`:90`), `repeat-loop-with-break` (`:98`). The guard walks `routines/` because a routine body holds loops and an unbounded `while` in a shared definition propagates to every reference site. `repeat-loop-with-break` is the one whose field sits at zero corpus sites (LF26) and whose subject the guard's own local interface omits. | 4 | 5 |
| **G14** | guard-run | Stage 1's drift guard: a run of two or more consecutive steps appearing in two or more files with any difference between the copies | Three of stage 1's five criteria are provocations: a shared run with a difference **is** reported, a window contained in a longer shared window over the same file set is **not** reported separately, and the guard reproduces the search's count. **The count is the defect.** The criterion requires "26 maximal windows, five of them nested"; run at this tree the proposal's own search reports **24 — 19 top level and 5 nested — over 132 activity files**. The nested figure is the half that held, which is why the drift went unnoticed. Stages 6 and 8 both grade convergence by that baseline falling *and by nothing else*, so both inherit the defect. State the criterion as the search's output at the revision the guard lands. Widen the file set to `routines/` in the same edit, with a routine declaration counting as a site — otherwise the re-inlining comparison loses its policeman at stage 5, `duplicate-checkpoint` requiring two inline sites while a migration leaves one inline copy against one routine declaration. | 1, graded at 6 and 8 | 3 |
| **G15** | guard-run | `check-review-mode-gating` going **blind** inside a routine | Assert the finding that *should* fire and does not. The guard exempts a mode-aware checkpoint by matching the literal `is_review_mode` in a step's `when` or condition (`scripts/check-review-mode-gating.ts:113`), and inside a routine that name would be an input id — so the exemption misfires in both directions. The guard is gated three more times before it reaches a gate at all, and a `ref:` checkpoint parsed as raw YAML carries no `options`, so the consequential-default gate already excludes all four of the assumption run's batch gates today. **This is a coverage loss the migration inherits rather than one it creates** — which makes it a finding with a mechanism, and it belongs in a risk class it currently sits in nowhere. | 4 | 1 |
| **G16** | guard-run | `check-binding-fidelity` seeing every routine-input read as **unresolvable by construction** | A ledger-backed guard — `scripts/binding-fidelity-triage.json` holds **70** entries — whose reading depends on the *textual* fragment injector, because the guard never touches the loader: it imports `parseDefinition`, the fragment resolver and the sync fragments index, reads raw activity YAML, and injects. Blinding it makes 70 recorded judgements silently vacuous rather than failing loudly. A routine reference it cannot materialise is an unresolvable read at every input. | 4 | 1 |
| **G17** | guard-run | `unused-declaration` on the host that keeps a declaration the routine takes over | Hard zero, no ledger (`scripts/check-activity-variables.ts:257-266` fires when a declared write "no step produces"). `challenge_findings` is a declared activity-level write at **seven** activities — `02-design-philosophy.yaml`, `04-research.yaml`, `05-implementation-analysis.yaml`, `06-plan-prepare.yaml`, `07-assumptions-review.yaml`, `08-implement.yaml`, `15-codebase-comprehension.yaml` — against the six stage 6's criterion names. The two assumption internals are declared writes at four activities each, eight together. Fifteen declarations move, not fourteen. | 6 | 1 |
| **G18** | guard-run, **asserting its disappearance** | `check-fragments` · `undeclared-effect-variable`'s routine twin | A borrowing workflow whose `variables[]` does not declare a name a shared body's effects write, because the effect fires in the borrower's bag (`scripts/check-fragments.ts:218`). Under a routine the contribution is mechanical — the outputs are full variable declarations travelling with the activity — so the hand-written declaration goes and **the finding goes with it**. Assert the rule reports nothing on a migrated corpus, and that the by-hand declaration it forced is gone. | 5 | 1 |
| **G19** | guard-run, **free** | `check-resource-anchors` reaching `routines/` with no change at all | Not a refusal — a coverage row worth carrying because it is the one guard that needs nothing. `walkFiles` (`scripts/check-resource-anchors.ts:72-80`) recurses into every directory except `.git` and `node_modules` and yields every `.md` and `.yaml`, so a `routines/*.yaml` file arrives in its scan the day the directory exists. Its scan is directory-shaped rather than path-shaped. | 3 | 1 |
| **G20** | **unprovokable** | Every option of every gate in a shared run is exercised once | **The walker has no routine entry point.** See the walk-site note above: `walk()` takes a workflow id, opens a session, and reads `ActivityDef`; a routine is never a transition destination and declares no exits. So the promised routine-level entry is a second walker, seeded from declared inputs whose seed **cannot supply the values** — both re-derived signatures bind operations declaring inputs the signature does not carry, and two of those three names are marked *(optional)* and therefore `suppliable` in `readSignature` (`src/utils/activity-variables.ts:377`), so `deriveActivityContract` calls `consume` rather than `read` and they never enter the derived reads. That is why the claim survives a derivation-based check while failing as stated. | 4 | 1 |

---

## The eleven rows no site can provoke

These are the most valuable rows in the matrix, because a test plan that lists them as covered is
asserting something the design does not contain. Each is stated with why no site reaches it and what
would have to change.

| Id | Refusal | Why no site reaches it | The fix |
|---|---|---|---|
| **L5** (2 cases) | Malformed routine name | The lifecycle has four non-`Checked` terminals and none matches `a::b::c` or `work-package::`. The mechanism being replaced does have the state, at `src/loaders/fragment-resolver.ts:37-45`. | Add the terminal at stage 3, with the load failures rather than with the stage-5 rule deletions. |
| **L6** | Colliding input/output declaration | No terminal, no rule, and the substitution table is keyed on `"{input_id}"` with nothing to say about an id that is also an output. The design's own worked signature produces the collision, invisibly, because at all seven live sites both sides resolve to one name. | Either a load failure refusing the collision, or a rule saying which side of the map wins in which field. |
| **L13** (1 of 2) | A routine with no reference site **anywhere**, at load | The load is per-workflow (`src/loaders/workflow-loader.ts:242`) and the resolution rule admits a cross-workflow reference. The rule it replaces has corpus-wide reach by construction, enumerating every workflow id before collecting anything. A corpus-wide scan at load is *possible* — `listWorkflows` sits in the same module and a filename-and-step-kind scan is not the full-load recursion `readWorkflowFragments` forbids — so the objection is cost and shape rather than possibility. | Restate as a guard alongside `unused-fragment`, and accept that the finding then lands on the corpus pull request where no ratchet runs. |
| **L14** (2 cases) | An artifact-declaring routine referenced twice in one activity | Nothing checks the intra-activity case at any grain: `artifactNames` is a `Set`, both consumers are fan-keyed, and `composeActivityArtifacts` dedupes on filename. The corpus writes one filename from N steps of one activity at 24 (filename, activity) pairs and calls it produce-then-revise. | Delete the rule. The verdict is REMOVE, the case has no corpus instance, and removing it also takes the transitive-closure obligation off the artifact check — placement still needs the closure and the artifact check no longer does. |
| **L15** | A merged-scope step-id collision after prefixing | The re-check does not exist, and the two containers that would notice a clash both collapse it silently — a `Set` at `src/utils/validation.ts:128` and a `Map` at `:147`. | Write the re-check, and assert on the *error* rather than on a green run, because with zero cross-scope repeats in the corpus a broken re-check passes. |
| **L21** | Stage 7's gate-option-per-site check | The three `prism` files it exists for carry zero checkpoint steps. | Drop the third check from stage 7's criterion, or name the family that has gates. |
| **L22** | Stage 3's ordering criterion | `deriveActivityContract` is not in the load path. There is nothing to swap. | Pick one of the three mechanisms and restate the criterion against it. Stage 4's entire contribution rests on which. |
| **G20** | Every gate option in a routine exercised once | The walker takes a workflow id and a routine is not a workflow node; and the seed drawn from declared inputs cannot supply the three names the bound operations need. | Budget a second walker, and settle AF4 first — the seed question and the free-variable question are one question. |

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
| **X1** | "A shared run has a use — **Refused at load**", mirroring the finding an unreferenced shared gate body already produces | The mirror is a **guard**: `unused-fragment` at `scripts/check-fragments.ts:242`, one of nine rules in the guard's union type, inside a corpus-wide sweep. The loader's only fragment diagnostic is a warning on an unparsable block. | The case belongs at guard-run, and a load-level test cannot be written. |
| **X2** | "A shared body lives somewhere sensible — **Refused at load** … Placement is computed from referring files **and a guard enforces it**" | The row contradicts itself in one sentence. | Decide the level before writing the case; the two sites have different fixtures and different assertions. |
| **X3** | "A shared run's declared signature matches what its steps do — **Refused at load**" | The *Checking a routine on its own* sequence draws the same three checks as guard findings. | One subject, two strengths, two sites. Pick one per row (L7–L9 versus G7–G8). |
| **X4** | "Every option of every gate in a shared run is exercised — **Detected**", via a walker that "gains a routine-level entry" | The entry has no entry point. | Unprovokable; see G20. |
| **X5** | Stage 3: "Materialisation runs after identifier resolution and before contract derivation, and a test fails if the order is swapped" | No order to swap. | Unprovokable; see L22. |
| **X6** | Stage 1: the guard "reproduces that count" — 26 maximal windows, five of them nested | **24 windows, 19 top level, 5 nested**, reproduced here at 132 activity files. A guard reporting 26 over this corpus is wrong; a guard reporting 24 fails the criterion as written. | The criterion has to name the search and the revision, not a literal. Stages 6 and 8 inherit it. |
| **X7** | Stage 3: "`routines/` has … its own generated JSON schema, and the schema generator has a verifying variant, so a forgotten regeneration fails continuous integration" | `scripts/generate-schemas.ts` generates **five** schemas; `schemas/` holds **six**. `technique.schema.json` is hand-authored with its own `$id`, carries no `generate()` call, is referenced by no code, and is documented as generated from its Zod source. A `--check` written to the criterion's wording regenerates the five and diffs them, and stays blind to the sixth — or goes permanently red on a file the change does not touch. Also: `npm run build:schemas` appears in neither `test:ci` nor `verify.yml`, so there is no regeneration step in CI to forget yet. | Catching the sixth needs a directory-completeness assertion, which is a different check from the one the criterion asks for. |
| **X8** | Stage 3: "An exhaustiveness assertion over the step kinds fails to compile when a kind is added" | `tsconfig.json` sets `"include": ["src/**/*"]` and `typecheck` is `tsc --noEmit`, so `scripts/` and `tests/` are never typechecked. Of the step-kind comparison sites the refutation passes measured — 64 across 22 files by one rule, 61 across 22 by another, against the proposal's "57 places across 19 files" — only the `src/` share is protected. Extending the compiler costs **712 errors across 65 files**. And the single field that disables the net is `...stepEntryCondition`: with it, a fifth `StepSchema` member compiles clean against a kind nothing handles; without it, three TS2339 errors name the three sites that must change, and those three errors are the only exhaustiveness signal the repository has. | Assert the exhaustive discrimination in `src/` at the one place that consumes the kind, and add a runtime assertion or a test for the guard scripts, which no compiler protects. Do not claim the population. |

One further mismatch belongs here and is not an enforcement claim: **the shared home's
justification**. "Referencing a routine the way the corpus references a shared technique gives the
corpus one resolution rule rather than two" is false as measured. `parseFragmentRef` reads any `::`
head as a workflow and throws on a second separator; the technique loader decides
workflow-versus-group by filesystem probe (`src/loaders/technique-loader.ts:136`) and admits
unbounded depth. Over 672 corpus technique bindings the two rules agree on **264** and disagree on
**408** — 360 one-separator group heads the fragment rule would read as non-existent workflows with
no fallback, and 48 two-separator paths it would throw on. The design owes either an explicit
no-group-grammar statement for routine names, which is also what closes AF3 and L5, or a
reconciliation of the two resolvers.

---

## Properties unrepresentable rather than refused

No test provokes these by attempting a violation. Each row states what an assertion reaches instead.

| Id | Property | What a test can assert |
|---|---|---|
| **U1** | A routine declares no outcome, so it cannot receive one | Structural: the routine schema carries no `outcome` field, and the generated JSON schema has no such property. Behavioural: L16 refuses a routine named as a destination through the standing rule. The design's own supporting evidence is wrong and the rule may still be right — "every activity that would refer to one declares a single ending" does not hold: of the seven convergence sites, four declare more than one exit (5, 4, 2, 2) and four `meta/activities/patterns/` activities declare none. |
| **U2** | A routine costs no hand-off; it runs inside the referring activity's dispatch | Assert the materialised activity's step list contains the routine's steps and the session history carries **no dispatch event naming the routine**. The alternative the design rejects — promoting the shared run to an activity four activities route through — costs four extra hand-offs, against a measured 23,000–42,000 tokens to establish a fresh worker context and re-dispatch at about 31% of a 4.1-million-token run. |
| **U3** | Two uses of one run agree on their steps | Assert one file. Ten measured differences across four copies have nowhere to live. Nothing in the guard suite compares step sequences today — verified by reading rather than by filename: `check-activity-technique-overlap` compares sets, `check-fragments`' two duplicate rules index single bodies and single rule strings, and nothing in `scripts/` builds a key from more than one step. |
| **U4** | A use site cannot restate a gate | Structural: the routine step member is `.strict()` and declares no `message` or `options`. Boundary against LF28/LF29, where the gate's effects name the routine's own declarations. |
| **U5** | Two references to one gate in one activity record separately | Assert distinct composed keys. A checkpoint response is keyed on activity and checkpoint together (`src/tools/workflow-tools.ts:2069`), so two un-prefixed copies would replay the first answer; the prefix is what makes the second reference safe. **Untested against the corpus, which contains no such case.** |
| **U6** | A workflow file holds routing, not one activity's state | Assert the `fragments` block's absence after stage 5. It is one block of 57 lines at `workflows/work-package/workflow.yaml:15-72` naming five of one activity's variables, referenced at eight steps in four activity files. |
| **U7** | A routine varies its steps by nothing but a declared input | Structural: there is no second parameter channel, and a run of steps that needs to differ structurally between two sites is two runs. Assert the reference step's field set. |
| **U8** | Nothing downstream knows a routine existed | Assert the loaded workflow's flattened step list carries no `kind: routine` at any depth, and that `flattenActivitySteps` — documented as the single traversal every step consumer routes through, used by 9 files, recursing into exactly one thing — never meets one. This is the property that makes the mechanism deletable rather than adaptable when the definition language emits steps directly. It is also the hazard: a compound kind `flattenActivitySteps` does not know is walked as a leaf, **silently**, and eight further walks recurse independently with the same limit. |

---

## What a live session asserts

Six observation obligations. None is a refusal, and a test that asserts "no error appeared" passes on
a broken implementation for most of them.

| Id | Obligation | The assertion |
|---|---|---|
| **O1** | Delivery is byte-identical for every activity that carries no routine | Compare delivered text before and after against the 128 of 132 activity files that carry no reference. The precedent is the pre-scan that already keeps 128 files off the fragment resolution path. |
| **O2** | The two representations agree | The differential test runs both paths over every activity in the corpus on every run, comparing parsed objects field for field **and comparing as text** the fields a worker acts on directly: a checkpoint's `message` and `id`, an option's `label` and `effect`, a step's `when`, a loop's `over` and `continueWhile`. Nothing in the tree does this today: the one test of the textual path runs the fragment injector alone over a 16-line synthetic fixture, and no test names `injectResolvedStepIds`. The failure this catches is a worker reading a step the server does not believe exists. |
| **O3** | A worker cannot tell a step came from a routine | Assert the delivered step list, not the absence of an error. |
| **O4** | A session crossing the migration re-asks its renamed gates | Prefixed identifiers change every key the migration touches, so a crossing run finds no recorded answer and asks again; orphaned responses stay as dead data. Accepted and stated rather than mechanised. One correction worth carrying: the design declines a key-mapping table as "permanent server cruft", and `src/utils/session/migration.ts` already normalises legacy checkpoint-response keys. |
| **O5** | The checkpoint instance id the agent composes by hand | The per-iteration discriminator inside a materialised routine is assembled by the worker while there is no runner, and the two consumers of a generated identifier fail differently: `get_technique` resolves a step id by exact match and throws with the full list of available ids, while a mis-composed checkpoint instance id splits on the first `#` and silently re-asks a question whose answer already exists. Assert the loud one; observe the silent one. |
| **O6** | Delivery budget | Materialised routine steps are eager-bundling candidates and count against the per-activity budget; a routine referenced twice contributes its techniques twice. Measured before ruled on. **The per-site review cannot reach two of the four stage-5 hosts**: the one delivery baseline in the tree is nine per-tool character totals over a single twelve-activity `work-package` walk under the e2e `skip-optional` policy, and `04-research` and `05-implementation-analysis` both declare `required: false` and appear nowhere in it. No invocation of `bench:token` reaches either, and adding them moves the baseline total, so it has to happen before the migration rather than inside it. |

---

## Defects this matrix found while being built

Each affects what a test can assert, and none is in either folder in this form.

1. **The construct has no run-time refusal surface, and no document says so.** Zero of the 53
   refusals sit at live-session and zero sit at walk. The graph fan's equivalent matrix places 15 of
   its 39 refusals on the tool surface; a routine places none, because a `kind: routine` step exists
   between parsing and materialisation and nowhere else. This is worth stating positively, because it
   is the property that makes the whole surface cheap to test — schema-parse and load-fixture between
   them reach 29 of 75 cases with no server and no session — and because it means **a smoke test
   proves nothing about this construct**. The fan's smoke test was the right instrument for a fan and
   is the wrong one here.

2. **Eleven of the 53 refusals have no provocation site, and eight of the eleven are the design's own
   load failures rather than missing tests.** A plan that budgets "one test per load failure" against
   the lifecycle diagram writes four tests and believes it has covered six states.

3. **Two of the five rescoped `check-variable-model` rules have no subject on the record.**
   `default-type-mismatch` checks a routine input's default against its declared type, and nothing in
   the folder says an input declares a type. `setvariable-outside-value-set` checks a target against
   its declared value set, and a routine output is specified as "an id, a type and a description, and
   no default" with no value set anywhere. So two of the five dispositions the gap review records as
   settled are settled against fields that may not exist. Decide the input and output declaration
   shapes before writing G4 and G5.

4. **The same three checks appear at two enforcement strengths in one document**, and the matrix has
   to carry both (L7–L9 and G7–G8) because the design does. The guarantee table says "Refused at
   load" and the *Checking a routine on its own* sequence draws them as guard findings. A test plan
   has to pick, and picking changes the fixture.

5. **`ref-body-conflict` has no routine analogue, because strictness absorbs it.** The fragment
   mechanism's load failure for a local body field alongside `ref`
   (`src/loaders/fragment-resolver.ts:111-116`) becomes a parse error on a `.strict()` routine step
   member (S3). That is the right answer and it means one of the retiring mechanism's nine rules maps
   to a *cheaper* layer rather than to a like-for-like replacement — worth recording so nobody writes
   a load-level case for it.

6. **The design names five things a routine is not allowed to do and only one of them is a refusal.**
   Taking a place in the graph is refused through a standing rule with an existing message (L16);
   costing a hand-off, replacing a child workflow, owning an artifact prefix and varying its steps by
   anything but a declared input are all unrepresentable (U2, U7) or definitional. Reaching itself is
   the one genuinely new refusal in the list (L2). A prohibition list that reads as five refusals is
   four rows of over-count.

7. **`check-loop-shape` is the largest single guard obligation and is priced nowhere.** Five rules
   over a routine body's loops is five of the 28 guard cases — more than the five rescoped
   variable-model rules produce between them — and stage 4's criterion names the guard in one clause
   of a table row.

---

## How each figure was taken

Every command runs from the repository root at `792f2cc5` / `a4a5d88b`.

- **Activity and workflow populations** — `find workflows -path '*/activities/*' -name '*.yaml'`
  gives 132; `find workflows -maxdepth 2 -name workflow.yaml` gives 18.
- **Checkpoint steps at any loop depth** — a `yaml.safe_load` walk of every
  `workflows/*/activities/*.yaml` and `workflows/*/activities/*/*.yaml`, counting each node whose
  `kind` is `checkpoint` and recursing into a `kind: loop` node's `steps`: **115**. This is the
  figure the completeness pass could not reconcile with a stated 113, and it reproduces here.
- **Maximal shared step windows** —
  `python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py` reports
  `activity files parsed: 132` and `maximal shared windows: 24 (top level 19, inside a loop body 5)`.
- **`challenge_findings` declarations** —
  `grep -rn "name: challenge_findings" --include=*.yaml workflows/` gives **7**.
- **Shared-gate reference steps** — `grep -rn "ref: assumption" --include=*.yaml workflows/` gives
  **8**, across four activity files.
- **Fixture corpora** — `find tests scripts -name 'workflow.yaml'` gives **23**;
  `find tests scripts -path '*/activities/*' -name '*.yaml'` gives **59**.
- **Guards and schemas** — `grep -c "^    id: '" scripts/guards.ts` gives **40**; `ls schemas/`
  shows six `.schema.json` files; the generator's own set is five.
- **The construct's absence** — `ls workflows/*/routines` reports no such file or directory;
  `grep -rn "kind: routine\|RoutineStep\|routines/" src scripts --include=*.ts` matches nothing;
  `src/schema/activity.schema.ts:167` declares `StepSchema` over four members.
- **Step-kind site gates** — `src/schema/activity.schema.ts:73-79` (`when`, `required`) and `:84-86`
  (`condition`), spread into three of the four members and deliberately not into the loop kind.
- **`fan-artifact-collision` is fan-keyed** — `scripts/check-activity-variables.ts:385` opens
  `for (const fan of fans)` and both arms sit inside it, at `:389-403` and `:405-425`.
- **`check-variable-model`'s five rules** — the union type at `scripts/check-variable-model.ts:48-52`
  and the emit sites at `:108`, `:118`, `:124`, `:131`, `:151`; hard zero declared at `:29`.
- **`check-loop-shape`'s five rules** — `scripts/check-loop-shape.ts:59`, `:67`, `:81`, `:90`, `:98`.
- **`check-fragments`' nine rules** — the union type at `scripts/check-fragments.ts:57-65`;
  `unused-fragment` emitted at `:242`; the `Malformed`-prefix read at `:207`.
- **`deriveActivityContract` call sites** —
  `grep -rn "deriveActivityContract" src scripts tests --include=*.ts` returns the definition at
  `src/utils/activity-variables.ts:417`, its own doc comment at `:19`, an import at
  `scripts/check-activity-variables.ts:41`, and two calls at `:158` and `:482`.
- **`baseId` and the instance separator** — `src/loaders/workflow-loader.ts:470`, `:473-476`.
- **The collapsing containers** — `src/utils/validation.ts:128` (`Set`), `:147` (`Map`).
- **`artifactNames` as a `Set`** — `src/utils/activity-variables.ts:446`.
- **The worked signature's input/output collision** — `re-derivation.md:118-121` declares
  `concern_document` under `inputs`, `:122-125` declares it under `outputs`.

Figures carried from the refutation passes rather than re-taken here are attributed in place, and
each names the verification that took them: the resolution-rule disagreement (264 of 672 agreeing,
408 disagreeing), the 975 unremapped technique-step outputs of 1,026 declared, the 24
(filename, activity) duplicate-artifact pairs across 11 files, the four-ids-to-seven-names output
remap, the 712 errors from extending `tsconfig`, the 70-entry binding-fidelity ledger, and the
zero-checkpoint measurement over the three `prism` files.
