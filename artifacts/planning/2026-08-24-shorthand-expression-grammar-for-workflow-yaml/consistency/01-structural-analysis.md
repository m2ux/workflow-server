---
target: /home/mike1/projects/dev/workflow-server
analysed_region: "workflows/**/*.yaml (140 files parsed, 117 activity files), schemas/{activity,workflow,condition}.schema.json, src/schema/, src/loaders/, src/utils/, scripts/"
analysis_date: 2026-08-25
lens: "L12 structural (Structure First — Meta-Conservation Law)"
analysis_unit: "api-surface (risk: high)"
analysis_focus: consistency of the parallel predicate grammars in the activity/workflow definition language
pipeline_mode: full-prism
---

# L12 Structural Analysis — Workflow Definition Grammar Consistency

## Structural Context (GitNexus preamble)

Index refreshed at analysis time (`npx gitnexus analyze`, 4.8s): **15,467 nodes, 21,142 edges, 213 clusters, 300 flows**. The prior index was 64 commits stale; all graph claims below are against the refreshed index and were confirmed by direct file reads.

Call-graph facts that carry weight later:

- `gateAnswer` (`src/utils/gate-liveness.ts:166-196`) is the **only** function that calls both predicate evaluators. Outgoing: `parseWhen`, `evaluateWhenExpression` (`src/schema/when-expression.ts`) and `evaluateCondition` (`src/schema/condition.schema.ts`). Incoming production callers: exactly one — `collect` in `src/tools/workflow-tools.ts`. The other two incoming edges are `tests/gate-liveness.test.ts`.
- That single production caller is the **eager step-technique bundling decision** in `get_activity`. Neither evaluator sits on an execution path. The server does not gate steps; the schema field description says so outright: *"Evaluated by the executing agent against current variable state; the server never evaluates gates."*
- `getActivity` → `workflow.activities?.find(...)` (`src/loaders/workflow-loader.ts:426-428`) is the chokepoint for `getValidTransitions`, `getTransitionList`, `validateActivityTransition` and `validateActivityManifest`.
- The corpus guards live outside `src/`: `scripts/validate-activities.ts`, `scripts/validate-workflow-yaml.ts`, `scripts/check-all-refs.ts`, driven by the registry in `scripts/guards.ts`.

### Census (YAML-parsed, not grepped; 140 files, 0 parse failures)

| Construct | Count | Distribution |
|---|---|---|
| `when:` strings | **281** | 208 top-level steps, 54 `exits[]`, 19 nested loop-body steps |
| `condition:` trees | **109** | 84 steps, 13 nested steps, 11 `actions[]`, 1 checkpoint fragment |
| `actions[].target` | **122** | of which **22** carry comparison operators |
| `actions[].condition` trees | **11** | same verb as the 22 operator-bearing targets |
| `variables.reads` bare strings | **618** | every activity file |
| `variables.writes` four-key objects | **525** | 302 `{defaultValue,description,name,type}`, 217 `{description,name,type}`, 6 `{description,name,required,type}` |
| `exits[]` entries | **163** across 93 files | `id+isDefault` 83, `id+when` 45, `id` 21, `id+isDefault+when` 9, `id+immediate` 5 |
| checkpoint steps | 113 | 67 carry a `condition:` tree |
| checkpoint option `effect` keys | 266 options | `setVariable` 149, **`exit` 34** |
| `transitions:` in the corpus | **0** | — |
| `decisions:` in the corpus | **0** | — |

Every figure in the analysis brief reproduces exactly (281 / 109 / 22 / 11 / 618 / 525). The brief's "38 uses" for `actions[].target` under-counts the field: there are 122 targets, 22 of them predicate-shaped.

---

## Claim

**Initial falsifiable claim.** The deepest structural problem is that the definition language carries two predicate grammars — the inline `when:` string dialect and the structured `condition:` tree — with no lowering between them, so a gate is either written twice or its syntax is chosen arbitrarily. The falsifier would be a lowering function connecting them, or a rule assigning each grammar a domain.

The claim survives first contact. `workflows/workflow-authoring/activities/09-validate-and-commit.yaml` contains the same four-term predicate in both grammars, in the same term order, within ninety lines of each other:

```yaml
# line 167 — one line
when: operation_type != 'review' && remediation_selected != true && review_closed != true && update_seeded_from_review != true

# lines 177-195 — nineteen lines, same predicate
condition:
  type: and
  conditions:
    - {type: simple, variable: operation_type,            operator: "!=", value: review}
    - {type: simple, variable: remediation_selected,      operator: "!=", value: true}
    - {type: simple, variable: review_closed,             operator: "!=", value: true}
    - {type: simple, variable: update_seeded_from_review, operator: "!=", value: true}
```

Three steps go further and split **one logical gate across both grammars at once**, combined by an AND that is documented nowhere in the schema — only in `gateAnswer`'s implementation (`gate-liveness.ts:194-196`):

| File | Step | `when:` | `condition:` |
|---|---|---|---|
| `work-package/13-submit-for-review.yaml` | `verify-pr-body-rerender` | `is_review_mode != true && stealth_mode != true` | `body_conforms == false` |
| `work-package/10-post-impl-review.yaml` | `review-fix-cycle` | `is_review_mode != true` | `or[code_findings_actionable, …]` |
| `work-package/09-lean-coding-audit.yaml` | `simplification-apply-cycle` | `is_review_mode != true` | `needs_simplification == true` |

## Dialectic

**The defender.** The claim holds and the cost is measurable. 281 against 109 sites, a verbatim duplicate, and three gates split mid-predicate. `condition` is marked `LEGACY` in its own schema description while remaining the second-most-used gate construct in the corpus. A language that labels a construct legacy and then keeps 109 uses of it has not deprecated anything; it has forked.

**The attacker.** Duplication is the wrong diagnosis. The two grammars are not two spellings of one thing — they have **different expressive power and different semantics**, so "no lowering" is not an omission that could be filled in.

Measured directly (both evaluators, same variable bag):

| Predicate | Bag | `when` | `condition` | |
|---|---|---|---|---|
| `n > 0` | `{n: true}` | **true** | **false** | *disagree* |
| `n > -1` | `{n: null}` | **true** | **false** | *disagree* |
| `n >= 2` | `{n: "3"}` | true | true | agree |
| `n == 3` | `{n: "3"}` | false | false | agree |
| `missing != true` | `{}` | true | true | agree |
| `missing == null` | `{}` | false | false | agree |
| `n < 5` | `{n: ""}` | true | true | agree |

**Two of seven identical predicates evaluate differently.** The cause is one line each: `when` coerces with `Number()` (`when-expression.ts:274-276`), so `Number(true) === 1` and `Number(null) === 0` both compare as numbers; `condition` uses `toNumber()` (`condition.schema.ts:51-55`), which returns `undefined` for booleans and null, and a comparison against `undefined` is false. Rewriting a `when` gate as a tree — or the reverse — is therefore a behaviour change, not a reformat.

Expressiveness diverges too. `exists` / `notExists` (17 uses) have **no `when` form** — `parseWhen("x exists")` fails with *trailing input at token 1*. Conversely `when`'s bare-identifier truthiness has no tree node; the nearest tree form, `exists`, disagrees with it exactly where it matters:

| Bag | `when: x` (truthy) | `{operator: exists}` |
|---|---|---|
| `{x: false}` | **false** | **true** |
| `{x: 0}` | **false** | **true** |

The failure modes are opposite as well. A malformed `when` **fails closed and silently** — `evaluateWhenExpression("status = ready", {status:"ready"})` returns `false`, so a typo'd gate skips its step with no diagnostic (`when-expression.ts:301-305`). A malformed tree throws at parse. And the authoring rule that mixed `&&`/`||` need parentheses (`assertWhenAuthoring`) has no tree counterpart at all; nested `and`/`or` is always accepted.

**The prober.** Both preceding positions assume these grammars are *evaluated* — that a gate written in either one governs whether a step runs. They do not.

`gateAnswer` has one production caller, and it is the eager-bundling decision inside `get_activity`. Its verdict selects whether a step's technique body is inlined into the response or left for a lazy `get_technique`. Whether the step actually *runs* is decided by an LLM agent reading the delivered YAML text, which implements neither grammar formally. The schema says as much.

So the disagreements the attacker measured have a narrower blast radius than they appear to — and a stranger one. They do not produce wrong branching; they produce **wrong delivery**: a step whose gate the server reads as false is not inlined, and the agent, reading the same gate by eye, may run it anyway.

**Transformed claim.** The language has no single authority to be consistent *at*. The schema defines a shape nothing delivers; the delivery ships text nothing validates; the evaluators serve a bundling optimisation. Grammar inconsistency is a symptom of an absent enforcement point, not of two competing designs.

**The gap between the claims is the diagnostic.** I opened by assuming a compiler pipeline — author, validate, lower, evaluate — and asked which stage was missing. There is no pipeline. The assumption was invited by the artifacts themselves, and that invitation is the concealment mechanism.

## Concealment Mechanism

**The repository presents every artifact of a compiled language and connects none of them.**

There is a JSON Schema directory. A Zod validator with `.strict()` closed objects. A hand-written recursive-descent parser with a documented grammar and C-style precedence table (`when-expression.ts:1-19`). An authoring-rule checker. A guard registry of 25 corpus checks wired into CI. A tree→string lowering function. Everything a language with a compiler would have.

What is absent is the wiring. Applied to the load path, the mechanism yields a fact I did not expect to find:

```
ActivitySchema is .strict() and declares no `variables` or `exits` key.
Every one of the 117 activity files declares `variables:`; 93 also declare `exits:`.
```

Run against the corpus, `safeValidateActivity` rejects **117 of 117** files. The loader's response (`workflow-loader.ts:75-80`) is `logWarn('Skipping invalid activity')` and `continue`. Verified end to end:

```
{"type":"warn","message":"Skipping invalid activity","activityId":"structural-pass",
 "errors":[{"code":"unrecognized_keys","keys":["variables","exits"]}]}
{"type":"info","message":"Workflow loaded","workflowId":"prism","activityCount":0}

prism: activities loaded = 0
prism-evaluate: activities loaded = 0
work-package: activities loaded = 0
```

**Every workflow in the corpus loads with an empty activity graph.** The system nonetheless runs — because `get_activity` never consults that graph for the activity body. It calls `readActivityRaw`, applies two regex passes (`injectResolvedStepIds`, checkpoint-fragment materialisation), and ships the file as text (`workflow-tools.ts:1045-1057`). This very analysis session received its `structural-pass` definition — `variables:`, `exits:` and all — through that path, from an activity the validated graph does not contain.

The apparatus is load-bearing for credibility, not for execution.

**Applying the mechanism predicts its own instances**, and they are there:

- `conditionToString` (`workflow-loader.ts:521-536`) is the one lowering in the codebase, and its output is **not parseable by the parser in the same repository**:

  | Tree | Rendered | `parseWhen` |
  |---|---|---|
  | `simple mode == "full"` | `mode == "full"` | OK |
  | `and[a == true, b != false]` | `a == true AND b != false` | **ERROR** — trailing input at token 3 |
  | `or[a == 1, b == 2]` | `a == 1 OR b == 2` | **ERROR** — trailing input at token 3 |
  | `not(a == true)` | `NOT (a == true)` | **ERROR** — trailing input at token 1 |
  | `simple x exists` | `x exists undefined` | **ERROR** — trailing input at token 1 |

  Five of six forms fail. `AND`/`OR`/`NOT` are bare identifiers to the tokenizer, and `JSON.stringify(undefined)` renders the `exists` operand as the literal text `undefined`.

- The declared routing constructs have **zero producers**: `transitions:` 0 files, `decisions:` 0 files. The corpus routes entirely through `exits:` (163 entries) and checkpoint `effect.exit` (34 uses). Neither string appears anywhere in `src/` — the only `exit` in the source tree is `process.exit`. Meanwhile `getValidTransitions`, `getTransitionList`, `validateActivityTransition`, `validateActivityManifest` and `conditionToString` all exist to serve `transitions`/`decisions`, which nothing writes.

- `effect.exit` is doubly invisible: `CheckpointOptionSchema.effect` is a plain `z.object` with no `.strict()` (`activity.schema.ts:48-52`), so Zod **silently strips** the key rather than reporting it. The corpus's principal routing verb is discarded without a warning on the one path that parses it.

## Improvements

### Improvement 1 — unify on one grammar (engineered to pass review, and to deepen the concealment)

Add `variables` and `exits` to `ActivitySchema`; write `lowerConditionToWhen()`; rewrite all 109 trees as `when` strings; delete `condition.schema.ts`'s evaluator and the `condition` field.

It passes review on sight: strictly less code, one evaluator instead of two, 390 predicate sites reduced to one syntax, and — decisively — **`npm run check:activities` goes from 117 failures to zero**.

That last effect is why it deepens the concealment. The guard's red is currently the only place in the system where the schema and the corpus are actually compared. Turning it green by widening the schema removes the signal while leaving every semantic divergence intact. And the lowering itself silently changes behaviour at the two places measured above (`Number()` vs `toNumber()`), while the 67 checkpoints that use `condition` lose something the syntax does not express — see property 2.

### Three properties visible only because I tried to strengthen the problem

1. **The grammars are not co-extensive, so unification is a language extension rather than a translation.** `exists`/`notExists` must be *added* to the `when` dialect (17 sites depend on them); `when`'s truthiness must be *added* to the tree, and cannot be spelled `exists` without changing the answer on `false` and `0`. There is no direction in which the lowering is total.

2. **`condition` on a checkpoint is not a predicate — it is a capability selector.** Its own schema text: *"On a checkpoint step, only `condition` (not `when`) enables condition_not_met dismissal."* The **presence of the field**, not its contents, is what makes a checkpoint dismissible via `respond_checkpoint`. 67 of 113 checkpoints rely on this. A purely syntactic unification destroys a semantic distinction the syntax never encoded — and nothing would catch it, because `gateAnswer` only affects bundling.

3. **The 117 guard failures are the only true statement the system currently makes about itself.** CI green, server running, workers executing — all of it is true only because the corpus is delivered as unvalidated text. Widening the schema to match the corpus does not make the two agree; it makes the disagreement unobservable.

### Diagnostic applied to Improvement 1

What it conceals: **the corpus and the schema live in different repositories with a version pin between them.**

`workflows/` is a git submodule. The superproject pins it at `7f37a2bd`; the working tree has `7e5f5eae`, **17 commits ahead**. At the pinned commit the count of activity files carrying these keys is **zero for both**:

```
git ls-tree HEAD workflows        → 160000 commit 7f37a2bd…  (pinned)
git -C workflows log --oneline -1 → 7e5f5eae  (checked out)
git -C workflows rev-list --count 7f37a2bd..HEAD → 17

at 7f37a2bd:  files with `^variables:` = 0    files with `^exits:` = 0
at 7e5f5eae:  files with `^variables:` = 117  files with `^exits:` = 93
```

The unpinned commits are exactly the ones that introduced the constructs — *"Declare each activity's variable contract where the activity lives"* (#493) and *"Declare the values that cross an activity boundary"* (#496). CI checks out the **gitlink** (`.github/actions/workflows-corpus/action.yml` uses `git rev-parse HEAD:workflows`), so CI validates the old corpus and passes. The working tree validates the new corpus and fails: `check:activities` exits 1 with *0 passed, 117 failed*, and `vitest run` reports **14 test files failed, 142 tests failed**. I confirmed one directly — `tests/workflow-loader.test.ts`: 12 failed, 18 passed, including `expect(valid).toContain('initialize-session')` receiving `[]`.

The guards and tests to catch this **already exist and are catching it.** Nothing is missing. The failure is invisible to CI only because the pointer has not moved.

So the property the original problem shows only because Improvement 1 recreates it: **the divergence is not between two grammars, it is between two release cadences.** Making the schema accept today's corpus fixes today's pin. The next corpus commit can invent a sixth construct, and the pin will hide it again until someone bumps the pointer.

### Improvement 2 — make the schema and the corpus agree at every commit

Change the CI corpus action to check out the submodule's own HEAD rather than the gitlink, or add a job that validates the tip. Then a corpus commit introducing an unrecognised construct fails immediately, at the commit that introduced it, in the repository that introduced it.

### Diagnostic applied to Improvement 2

It conceals that **the pin is doing a job.** The corpus is a prose-and-definition artifact authored by workflow designers at high cadence; the server is a typed runtime released slowly. The pin is what lets the first move without waiting for the second. Removing it does not unify the cadences — it couples them, so every corpus edit needs a server release.

The pressure that produced two grammars then re-emerges as pressure to make the schema permissive. The cheapest way to unblock a corpus author under Improvement 2 is `.passthrough()` or `z.record(z.unknown())` on `ActivitySchema` — at which point the strictness that generated the 117 honest failures is gone, and undeclared constructs become undetectable rather than merely unpinned. The recreated property: **whatever forces schema and corpus to agree also forces the corpus to stop growing, so the agreement gets bought back with permissiveness.**

## Structural Invariant

> **A definition language authored in one artifact and executed by a reader that is not its validator cannot have its grammar enforced; it can only have its grammar described.**

This persists through every improvement because it is a property of the problem space, not the implementation. The executor is an LLM agent reading raw YAML text. Text that fails validation is still readable, and `get_activity` must ship the file even when the schema rejects it — otherwise the system fails closed on its own corpus and no workflow runs at all. Validation is therefore advisory *by construction*, in every variant considered.

Both improvements preserve it. Improvement 1 changes which grammar is described. Improvement 2 changes when the description is checked. Neither puts the validator on the execution path, because the execution path terminates in a reader that accepts text unconditionally.

## Inversion

Make the impossible property trivially satisfiable: **let the server be the executor.** Compile activity YAML to a state machine the server runs — it evaluates gates, applies transitions, binds variables, sequences steps. A definition that fails validation then cannot run, because there is nothing to run it. Grammar enforcement becomes free and total; the four dialects collapse to one by necessity, since only one is executable.

**The new impossibility this creates.** The payload of this language is *prose*. A step's meaning lives in technique protocols, rules, and artifact-writing registers — the `structural-analysis` technique this very activity binds instructs its executor to *"Apply every operation in the lens prompt sequentially against the code"* and *"re-execute from the structural invariant step"* if the analysis stays at the surface. A server-run state machine can evaluate `remediation_round < 3`. It cannot execute that.

So the inversion makes the grammar enforceable and makes **the language unable to express its own payload**. Recovering the payload requires a second channel carrying prose to an agent — unvalidated, because prose has no grammar to validate against. That channel is precisely the raw-text delivery path the enforcement was introduced to close.

## Conservation Law

> ### The Enforcement–Expression Conservation Law
>
> **Across the server/agent boundary, enforceability and expressiveness are conserved. Every construct the server can enforce is one the agent need not interpret; every construct carrying agent-interpretable meaning is one the server cannot enforce. Moving a construct toward enforcement moves its meaning toward the unvalidated channel, and the total governed surface is unchanged.**

The two predicate grammars are the visible seam. `when` sits on the enforceable side: parseable, evaluable, guarded by `check:when-expression`, with a documented precedence table and an authoring rule. `condition` sits on the annotation side: structured for machines, consumed as documentation, and load-bearing for a *capability* (`condition_not_met` dismissibility) rather than for a computation. The corpus keeps both because it needs both sides of the boundary — and the law says it always will.

### Producer / Clearer Ledger

The conserved resource is the **authored predicate site**. A *producer* is a corpus construct that creates one; a *clearer* is code that consumes it — evaluates it, enforces it, or acts on it. Termination paths traced: **(D)** server delivery/bundling, **(X)** agent execution, **(G)** guard validation, **(C)** CI.

| Resource (producer) | Producers | Clearers | D | X | G | C | Verdict |
|---|---|---|---|---|---|---|---|
| `when` on steps | 227 | `gateAnswer` (bundling only); agent prose-reading; `check:when-expression` | matched | **unmatched** — no formal evaluator on the execution path | matched | matched at pin | **partial** |
| `when` on `exits[]` | 54 | none — `exits` is absent from `src/` | **unmatched** | **unmatched** | **unmatched** | **unmatched** | **UNMATCHED** |
| `condition` trees on steps | 97 | `gateAnswer` (bundling only); agent | matched | **unmatched** | **unmatched** | matched at pin | **partial** |
| `condition` on `actions[]` | 11 | none — *"The server has no action interpreter"* | **unmatched** | **unmatched** | **unmatched** | **unmatched** | **UNMATCHED** |
| `actions[].target` as predicate | 22 of 122 | none — undeclared third dialect, typed `z.string()` | **unmatched** | **unmatched** | **unmatched** | **unmatched** | **UNMATCHED** |
| `exits[]` entries | 163 / 93 files | none | **unmatched** | **unmatched** | **unmatched** | **unmatched** | **UNMATCHED** |
| checkpoint `effect.exit` | 34 | none — silently stripped by non-strict Zod | **unmatched** | **unmatched** | **unmatched** | **unmatched** | **UNMATCHED** |
| `exits[].immediate` | 5 | none | **unmatched** | **unmatched** | **unmatched** | **unmatched** | **UNMATCHED** |
| `variables.reads` / `.writes` | 618 + 525 | `check:variable-model` only; rejected by `ActivitySchema` | **unmatched** | **unmatched** | matched | **unmatched** | **partial** |
| `transitions[]` / `decisions[]` | **0** | `getValidTransitions`, `getTransitionList`, `validateActivityTransition`, `validateActivityManifest`, `conditionToString` | — | — | — | — | **INVERSE — clearers with no producers** |

**The conservation law does not hold.** It requires a matching clear on every reachable termination path, and eight producer classes have none. The ledger shows the imbalance running in both directions at once: the corpus accumulates predicate constructs no code consumes (`exits`, `effect.exit`, `actions[].target`, `actions[].condition`, `immediate` — 285 sites), while the server retains five consumers for constructs the corpus never produces. Unenforced surface accumulates without bound on the authoring path; dead enforcement accumulates without bound on the runtime path. A single unmatched path falsifies the law, and there are nine.

## Meta-Law

Applying the diagnostic to the conservation law itself.

**What the law conceals.** It presents the enforcement/expression trade as a *choice made per construct* — as though one could rebalance the system by moving `condition` toward enforcement or `exits` toward annotation. In this system that choice is not available at construct granularity. The trade is made **per repository**, and its exchange rate is set by a single 40-hex value.

A construct's enforceability is determined by whether the schema that validates it ships in the same commit as the corpus that uses it. `exits` is unenforced not because anyone decided it belonged on the annotation side, but because `#496` landed in the corpus submodule and `activity.schema.ts` sits in the superproject. `when` is enforced because `when-expression.ts` and its guard happened to land together. The law's own structural invariant — that the trade is a design decision — inverts under examination: **the trade is a merge-order artifact.**

> ### The Meta-Law: *The Pin Sets the Grammar*
>
> **The definition language's operative specification is not `activity.schema.json` — it is the gitlink. The grammar in force is whichever one the pinned corpus commit happens to use, and consistency work performed inside the corpus is invisible to the validator until the pointer moves. Grammar unification is therefore not a language change; it is a release-coordination change wearing a language change's clothes.**

**Concrete, testable consequence for this specific code** (not a generalisation — a prediction with numbers, cheap to falsify):

1. Bumping the `workflows` gitlink from `7f37a2bd` to `7e5f5eae` **without touching `src/schema/activity.schema.ts`** turns `test:ci`, `check:all` and `bench:token` red simultaneously: **117** guard failures and **~142** test failures across **14** test files. *(Already observable locally — the working tree is in exactly that state.)*
2. **No amount of predicate-grammar unification inside the corpus changes that number.** Every one of the 117 failures is `unrecognized_keys: ['variables','exits']` — a key-set error, not a predicate error. Rewriting all 109 `condition` trees as `when` strings leaves the count at 117.
3. Conversely, adding just `variables` and `exits` to `ActivitySchema` — roughly ten lines, touching no predicate code — takes the count to **0** and turns CI green, while leaving all four dialects exactly as inconsistent as they are today, and leaving all nine unmatched producer classes unmatched.

Predictions 2 and 3 are the meta-law's edge: they assert that the work which fixes the *visible* failure and the work which fixes the *actual* inconsistency have **empty intersection**. If a corpus-side grammar unification moved the 117, the meta-law is false.

**Consequence for the run that commissioned this analysis.** The brief settles a target grammar and specifies it. The meta-law predicts that a specification landing in the corpus repository will not bind, and that whichever grammar the next gitlink bump happens to carry becomes the operative one regardless of what the specification says. A grammar decision recorded only in `workflows/` is a description; the same decision recorded in `ActivitySchema` in the same commit as its corpus uses is a rule.

---

## Bug Table

Severity: **critical** (system-wide incorrect behaviour) · **high** (silent loss of a declared guarantee) · **medium** (wrong result on a reachable input) · **low** (latent).
Classification per the conservation law: *fixable* = the law permits resolution within the current design; *structural* = the law predicts it recurs.

| # | Location | What breaks | Severity | Reachability | Class |
|---|---|---|---|---|---|
| 1 | `src/schema/activity.schema.ts:274-304` (`.strict()`, no `variables`/`exits`) | `safeValidateActivity` rejects **117/117** activity files; `loadActivitiesFromDir` skips each with a warn; **every workflow loads with `activityCount: 0`** | **critical** | **Reached now** on the checked-out tree (verified: prism, prism-evaluate, work-package all report 0). Not reached in CI, which checks out gitlink `7f37a2bd` where the keys are absent | fixable — add the two keys |
| 2 | `src/utils/validation.ts:45-46` via `workflow-loader.ts:467-475` | With 0 activities `getValidTransitions` returns `[]`, so `if (valid.length === 0) return null` — **transition-legality validation fails open**; every transition target is accepted | **high** | Reached now, on every `next_activity` call. Consequence of #1 | fixable |
| 3 | `exits:` (163 entries, 93 files) and checkpoint `effect.exit` (34) | The corpus's sole routing vocabulary is read by **nothing**: neither string occurs in `src/` (only `process.exit`). `effect.exit` is additionally stripped without warning because `CheckpointOptionSchema.effect` (`activity.schema.ts:48-52`) omits `.strict()` | **high** | Reached on every checkpoint carrying an `exit` effect | structural — needs server-side routing support |
| 4 | `src/loaders/workflow-loader.ts:521-536` (`conditionToString`) | The only tree→string lowering emits `AND`/`OR`/`NOT` and `JSON.stringify(undefined)`; **5 of 6 forms fail `parseWhen`**. Proves the two dialects are not mutually expressible | **medium** | Reached via `getTransitionList`; currently dead because #1 empties the activity list | fixable |
| 5 | `when-expression.ts:274-276` vs `condition.schema.ts:51-55` | `Number()` vs `toNumber()`: `n > 0` with `n=true` → `when` **true**, tree **false**; `n > -1` with `n=null` → **true**/**false**. Identical predicates, opposite answers | **medium** | Reached through `gateAnswer`, affecting eager-bundling decisions | fixable — share one coercion |
| 6 | `when-expression.ts` grammar (lines 4-9) | `exists`/`notExists` (17 uses) have no `when` form; `when` truthiness has no tree form and differs from `exists` on `false`/`0`. No total lowering exists in either direction | **medium** | Reached by any unification attempt | structural |
| 7 | `activity.schema.ts:77` + `gate-liveness.ts:194-196` | `condition` is labelled `LEGACY` yet its **presence** is what enables `condition_not_met` dismissal (67 of 113 checkpoints). Migrating it to `when` silently removes dismissibility; the AND-combination of `when` and `condition` is documented only in the implementation | **medium** | Reached by the 3 steps that carry both grammars, and by any `condition`→`when` migration | structural |
| 8 | `when-expression.ts:301-305` (`evaluateWhenExpression`) | Unparseable `when` fails closed and silently: `"status = ready"` → `false`, so a typo'd gate skips its step with no diagnostic on the execution path | **medium** | Reached on any malformed gate; `check:when-expression` covers the corpus but not runtime | fixable — surface `unparsed` |
| 9 | `actions[].target` (`activity.schema.ts:27`, `z.string()`) | 22 of 122 targets hold comparison expressions (`gh.auth.status == 0`, `missing_prerequisites.length == 0`, `summary_budget_overruns == []`) in an **undeclared third dialect** with no parser and no evaluator — including `== []`, which no dialect can express | **medium** | Reached wherever a `validate` action runs; agent-interpreted only | fixable |
| 10 | `src/utils/validation.ts:235-240` | With `activityIds` empty, **every** `activity_manifest` entry emits *"references unknown activity"* into `_meta.validation` | **low-medium** | Reached now on any `next_activity` carrying a manifest. Consequence of #1 | fixable |
| 11 | `.github/actions/workflows-corpus/action.yml` (`git rev-parse HEAD:workflows`) | CI validates the **pinned** corpus, not the checked-out one. 17 commits of new grammar are unvalidated; `check:activities` (registered in `scripts/guards.ts:220`, `proves: 'every activity file validates against the activity schema'`) exits 1 locally while CI stays green | **high** | Reached now — the divergence is live | structural — the pin is load-bearing |
| 12 | `when-expression.ts:307-336` (`assertWhenAuthoring`) | The mixed-`&&`/`||`-needs-parentheses rule applies to `when` only; nested `and`/`or` trees are always accepted, so the same ambiguity the rule prevents is reachable through the other grammar | **low** | Reached by any nested tree | fixable |
| 13 | `when-expression.ts:270-287` (`evalAst`, `case 'cmp'`) | The inner `switch (ast.op)` has no `default`; a `cmp` node with an unexpected operator falls through to `case 'not'` and evaluates `!evalAst(ast.expr)` where `expr` is undefined, throwing a `TypeError` that `evaluateWhenExpression` does not catch — escaping the fail-closed contract | **low** | **Not reachable** through `parseWhen`, which only emits the six `CmpOp` values. Reachable only from a hand-constructed AST | fixable |

### Unmatched producers promoted from the ledger

Entries #3 and #9 above carry the ledger's unmatched producers. Restated as the conservation-law verdict requires, with the reachability of the state that triggers each:

| Producer | Sites | Termination path with no clearer | Reachability |
|---|---|---|---|
| `exits[]` entries | 163 | all four (D/X/G/C) | Every activity completion — the worker resolves an exit the server cannot read |
| `exits[].when` | 54 | all four | Same; the predicate is evaluated by the agent alone |
| checkpoint `effect.exit` | 34 | all four; stripped pre-warning by non-strict Zod | Every checkpoint response carrying one |
| `actions[].target` predicates | 22 | all four | Every `validate` action step |
| `actions[].condition` trees | 11 | all four — no action interpreter exists | Every conditional action |
| `exits[].immediate` | 5 | all four | The 5 declaring exits |
| `variables.reads`/`.writes` | 1,143 | D/X/C (G partial via `check:variable-model`) | Every activity — the contract is declared where the schema cannot see it |

**Total unenforced predicate-bearing surface: 289 sites** (163+54 overlap accounted once as 163 exits of which 54 carry `when`; plus 34+22+11+5). Against these, five server-side clearers serve **zero** producers.
