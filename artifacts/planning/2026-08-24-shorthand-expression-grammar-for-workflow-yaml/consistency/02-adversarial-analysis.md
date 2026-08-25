---
target: /home/mike1/projects/dev/workflow-server
analysed_region: "workflows/**/*.yaml (140 files, 122 activity files), src/schema/, src/loaders/, src/utils/, src/tools/, scripts/, tests/e2e/, .github/actions/, plus origin/main (b061faee) and the deployed container image"
analysis_date: 2026-08-25
lens: "L12 complement — adversarial"
analysis_unit: "api-surface (risk: high)"
analysis_focus: consistency of the parallel predicate grammars in the activity/workflow definition language
pipeline_mode: full-prism
attacks: consistency/01-structural-analysis.md
---

# L12 Adversarial Pass — Breaking the Structural Analysis

## What this pass did

Every behavioural claim in `01-structural-analysis.md` was re-run rather than re-read. Three
baselines were measured, not one:

| Baseline | Commit | What it is |
|---|---|---|
| **Analysed tree** | `80e4d876` on branch `refactor/lean-test-suite` | the working directory the structural pass read |
| **`origin/main`** | `b061faee` | the project's mainline |
| **Deployed server** | image `sha256:5811612d`, label `org.opencontainers.image.revision=b061faee` | the container answering `localhost:3000`, which served this very session |

The structural pass measured one of the three and attributed its findings to "the system". That
single methodological choice is where most of its analysis fails.

---

## The baseline error

The structural analysis' headline is that `ActivitySchema` rejects the whole corpus, every workflow
loads with `activityCount: 0`, and *"the system runs only because `get_activity` ships raw YAML
text."* It then builds a concealment mechanism, a structural invariant, a conservation law and a
meta-law on top of that fact.

The fact is a property of a stale local feature branch.

```
$ git branch --show-current
refactor/lean-test-suite

$ git rev-list --left-right --count origin/main...HEAD
42      3            # 42 commits on origin/main that HEAD does not have

$ git merge-base --is-ancestor 1a47556a HEAD
NO-not-in-HEAD       # 1a47556a "An activity names its outcomes; the workflow names their destinations"

$ git merge-base --is-ancestor 1a47556a b061faee
YES                  # …is in the deployed revision
```

The commit that adds `ExitSchema`, `ActivityVariablesSchema`, the `variables` key and the `exits` key
to `ActivitySchema` is on `origin/main` and in the running image. It is not on the analysed branch.

Running the deployed schema against the corpus the deployed server actually serves:

```
=== corpus 7e5f5eae validated against origin/main + deployed schema (b061faee) ===
  activity files: 122   ACCEPTED: 122   REJECTED: 0
```

**122 of 122.** The load path is not broken, the activity graph is not empty, and the system does not
run "only because delivery ships text". The live server confirms it directly — asked for this
session's state it answers from a populated graph:

```json
{ "current_activity": "adversarial-pass",
  "completed_activities": ["select-mode", "structural-pass"] }
```

The structural pass wrote, of itself: *"This very analysis session received its `structural-pass`
definition — `variables:`, `exits:` and all — through that path, from an activity the validated graph
does not contain."* The graph contains it. The claim is false about the session that made it.

**Where the running server reads from.** `docker inspect` on the live container shows
`WORKFLOW_DIR=/app/workflows`, bind-mounted read-only from
`/home/mike1/.local/share/workflow-server/workflows`, which is checked out at `7e5f5eae` — the same
corpus commit as the working tree's submodule, 122 activity files, 93 with `exits:`. So the running
system pairs *the new corpus* with *the new schema*. The analysed tree pairs the new corpus with a
schema 42 commits old. That mismatch is the entire "concealment mechanism".

---

## WRONG PREDICTIONS

### W1 — "rejects **117 of 117** activity files"

It rejects 117 of **122**. Five validate:

```
activity files 122; ACCEPTED by the stale-branch ActivitySchema: 5
  meta/activities/patterns/01-orchestrator-workers.yaml
  meta/activities/patterns/02-supervisor.yaml
  meta/activities/patterns/03-plan-and-execute.yaml
  meta/activities/patterns/04-isolated-fan-out.yaml
  meta/activities/patterns/05-lead-researcher.yaml
```

The frontmatter's "117 activity files" is also wrong; the count is 122, which is the figure the
session's own `analysis_units` brief carries (*"122 activity files, 17 workflow.yaml"*). The pass
took its denominator from its numerator.

### W2 — "every workflow loads with `activityCount: 0`"

True on the analysed branch only. False of `origin/main` and of the deployed server, where the same
corpus validates 122/122 (measured above) and the live session resolves activities by id.

### W3 — "`effect.exit` is silently stripped because `CheckpointOptionSchema.effect` omits `.strict()`"

The deployed schema declares the key and closes the object:

```js
// container /app/dist/schema/activity.schema.js
42:  exit: z.string().optional().describe('Exit of the owning activity this option selects — a name
        from the activity\'s `exits[]` … `present_checkpoint` reads it from the workflow graph …'),
43:  }).strict().optional(),
```

Two things are wrong at once. The key is declared, and the object *is* strict — so on the running
system an unknown effect key is an error, not a silent strip.

The claim is also **internally inconsistent with W2 on its own baseline**. If `ActivitySchema`
rejects every activity file, `CheckpointOptionSchema` is never reached: the option object is
discarded with the activity that contains it. Bug #1 and bug #3 cannot both be "reached now" on the
same tree. The pass asserts both.

### W4 — "`exits:` … read by **nothing** in `src/`"

True of the analysed branch — one occurrence, and it is a comment (`src/utils/dispatch.ts:11`). False
of the deployed server: 22 occurrences across 7 files, and the reads are load-bearing.

```
src/loaders/workflow-loader.ts:560   const exit = option.effect?.exit;
src/loaders/workflow-loader.ts:577   errors.push(`Workflow graph binds '${activityId}.${exitId}',
                                       which that activity does not declare as an exit.`)
src/loaders/workflow-loader.ts:580   errors.push(`Workflow graph sends '…' to '…', which this
                                       workflow does not contain.`)
src/utils/validation.ts:88           if (!response.effects?.exit || !immediate.has(...)) continue;
src/utils/validation.ts:246          `Activity '…' has no exit '…'. Its exits are: […]`
src/tools/workflow-tools.ts:1870     const exitId = 'effect' in option ? option.effect?.exit : …
```

An unbound exit **fails the workflow load**. `exits[].immediate` is read at `validation.ts:88`.
`effect.exit` is read at two sites. The routing vocabulary the pass calls invisible is the deployed
server's primary routing vocabulary, bound to a `graph:` construct on `WorkflowSchema` that the
analysis never mentions because its branch does not have it.

### W5 — "`transitions:`/`decisions:` — 0 corpus files, but **5 server consumers**"

On the deployed server there are **zero**. `transitions`, `decisions`, `TransitionSchema`,
`DecisionSchema`, `getValidTransitions`, `getTransitionList` and `conditionToString` are all absent
from `origin/main`; the same grep that returns them on the analysed branch returns nothing there.

This matters more than a count. The "INVERSE — clearers with no producers" row is one of the two
halves of the ledger that the pass uses to *falsify* its own conservation law. That half does not
exist in the shipped system: the dead clearers were deleted in the same work that added `exits`.

### W6 — "pinned at `7f37a2bd` … **17 commits ahead**"

That is the stale branch's gitlink. The mainline and the deployed image pin the same, much newer,
commit:

```
origin/main   workflows -> 5f17da01
b061faee      workflows -> 5f17da01     (identical)
corpus tip    7e5f5eae
5f17da01...7e5f5eae -> 0 behind, 2 ahead
```

The real pin lag on the shipped system is **2 commits**, not 17, and both validate cleanly. The
17-commit gap is a property of a branch nobody deploys.

### W7 — "Neither evaluator sits on an execution path … the evaluators serve only a bundling optimisation"

This is the pass's pivotal move — the "prober" turn that produces the transformed claim, the
structural invariant and the conservation law. It is false. A graph query for callers of the
evaluators returns production consumers in four scripts and a reference executor:

| Caller | File | What it is |
|---|---|---|
| `reviewExcluded`, `reviewProvablyTrue` | `scripts/check-review-mode-gating.ts` | guard `review-mode-gating`, evaluates `condition` trees |
| `evalWhen` | `scripts/check-stealth-isolation.ts` | guard `stealth-isolation`, evaluates `when` |
| `requirements`, `valueReads` | `scripts/check-decision-order.ts` | guard `decision-order`, parses `when` |
| `walk`, `pickNext`, `advanceToUnvisited`, `evaluateWhen` | `tests/e2e/walker.ts` | **executes the corpus** |

`tests/e2e/walker.ts` is not a unit test. It is a second executor of the definition language, and it
gates steps on both grammars:

```ts
// tests/e2e/walker.ts:459-460
if (step.condition && !evaluateCondition(step.condition, variables)) continue;
if (step.when && !evaluateWhen(step.when, variables)) continue;
```

`pickNext` (lines 242-270) routes with `evaluateCondition`; checkpoints are gated at line 658; the
walk's trace is committed as snapshots (`tests/e2e/snapshot.test.ts:125`, `toMatchSnapshot()`) and
CI ratchets them. So a `when` expression that changes meaning changes a committed baseline and turns
CI red. The evaluators are on an execution path, that path is mechanical, and its result is enforced.

### W8 — meta-law prediction 3, second clause

The prediction: *"adding just `variables` and `exits` to `ActivitySchema` — roughly ten lines,
touching no predicate code — takes the count to 0 and turns CI green, while leaving all four dialects
exactly as inconsistent as they are today, and leaving all nine unmatched producer classes
unmatched."*

The project already did this, in `b061faee`, and none of the second clause holds:

- Not ten lines: `activity.schema.ts` +69/-, a new `src/schema/variable.schema.ts`,
  `workflow-loader.ts` 156 changed lines, `validation.ts` 97, `workflow.schema.ts` 36.
- It did not leave the producer classes unmatched. Of the ledger's nine: `exits[]` entries (163)
  became load-validated, `effect.exit` (34) became read at two sites, `exits[].immediate` (5) became
  read at `validation.ts:88`, `variables.reads/.writes` (1,143) became consumed by
  `src/utils/activity-variables.ts` (`deriveActivityContract`, contribution to the workflow variable
  set, load failure on conflicting declarations), and the `transitions`/`decisions` inverse row was
  deleted outright. **Five of nine matched, one row eliminated.**

The pass states its own falsifier for the meta-law's edge — that the work fixing the visible failure
and the work fixing the actual inconsistency have *"empty intersection"*. The intersection is not
empty. The commit that took the rejection count to zero is the same commit that matched five producer
classes and deleted five dead clearers.

### W9 — bug #4 reachability: "Reached via `getTransitionList`; currently dead because #1 empties the activity list"

`conditionToString` is module-private (`workflow-loader.ts:521`, no `export`) — confirmed by an import
failure and by the graph, which shows incoming calls only from `getTransitionList` and itself, and
`"processes": []`. Its two call sites (lines 494, 503) run only for activities that declare
`transitions:` or `decisions:`, of which the corpus has **0 and 0** (measured). It is unreachable for
a reason that has nothing to do with bug #1: fixing #1 completely leaves it just as dead.

### W10 — bug #13 reachability: "Reachable only from a hand-constructed AST"

There is no such door. The module exports exactly three names:

```
exported names: assertWhenAuthoring, evaluateWhenExpression, parseWhen
evalAst exported? NO
```

`evalAst` is private and its only callers are `evaluateWhenExpression` and itself, both of which
route through `parseWhen`, which emits only the six `CmpOp` values. There is no reachable path from
any caller inside or outside the module. This is not a latent bug; it is an unreachable branch.

### W11 — bug #8 reachability: "Reached on any malformed gate"

Zero corpus instances:

```
=== unparseable when gates in the corpus ===
  0 of 281 fail parseWhen
```

The `check:when-expression` guard holds the corpus clean. The failure mode is real in the code but
has no live producer.

### W12 — "the brief's '38 uses' for `actions[].target` under-counts the field"

The census is right (122 targets, 22 predicate-shaped, reproduced exactly on both trees), but the
correction is aimed at the brief rather than at the code, and the brief's 38 refers to a different
population. Cosmetic; noted for completeness.

---

## What the structural pass got right

Attacking an analysis means saying where it holds. These survived re-execution unchanged:

| Claim | Verdict |
|---|---|
| Census: 281 `when`, 97 step-level `condition` + 11 `actions[].condition` + 1 fragment = 109, 122 `actions[].target` of which 22 predicate-shaped, 163 `exits[]` across 93 files, 266 checkpoint options with 34 `effect.exit`, 54 `exits[].when`, 113 checkpoints of which 67 carry a `condition` | **Reproduced exactly, on both baselines** |
| `conditionToString` output fails `parseWhen` in 5 of 6 forms, including `x exists undefined` from `JSON.stringify(undefined)` | **Reproduced exactly** |
| `Number()` vs `toNumber()` makes `n > 0` with `n=true` and `n > -1` with `n=null` disagree | **Reproduced exactly** (and is wider — see U3) |
| `exists`/`notExists` have no `when` form; `when` truthiness has no tree form; no total lowering in either direction | **Confirmed and strengthened** (see U7) |
| `gateAnswer` has exactly one production caller | **Confirmed by graph**: `impactedCount: 1`, risk LOW, sole d=1 caller `collect` in `workflow-tools.ts` |
| `condition` on a checkpoint is a capability selector, not a predicate — its *presence* enables `condition_not_met` dismissal, 67 of 113 checkpoints | **Confirmed**; the schema text is byte-identical on `origin/main` |
| Meta-law prediction 2: rewriting the `condition` trees changes the failure count by zero | **Confirmed by execution**: stripping every `condition` key corpus-wide leaves the count at exactly **117** |
| The analysed tree fails: `check:activities` red, 14 test files / 142 tests failed | **Reproduced exactly**: `Test Files 14 failed \| 54 passed`, `Tests 142 failed \| 871 passed` |

The last two are worth dwelling on. The pass's *measurements* are careful and reproducible. Its error
is not sloppiness; it is that it never asked whether the tree it measured was the tree that runs.

---

## OVERCLAIMS

### O1 — the Conservation Law is falsified by branch state, not by design

The Enforcement–Expression law is declared falsified because nine producer classes have no clearer
and five clearers have no producer. Both sides of that ledger are artifacts of the analysed branch.
On the deployed system five of the nine producer classes are matched and all five orphan clearers are
gone.

**The alternative design that violates the "law" is the one already shipping.** The law says moving a
construct toward enforcement moves its meaning toward the unvalidated channel, with the governed
surface conserved. `b061faee` moved `exits`, `effect.exit`, `immediate` and the variable contract
*onto* the enforcement side — schema-declared, load-validated, an unbound exit failing the load — and
moved nothing off it. Governed surface increased. Nothing was traded away. A conservation law with a
counter-example in the deployed artifact is an implementation choice described as physics.

### O2 — the Structural Invariant is a design choice, and the repo already contains the counter-example

> *"A definition language authored in one artifact and executed by a reader that is not its validator
> cannot have its grammar enforced; it can only have its grammar described."*

The invariant is argued from "the executor is an LLM agent reading raw YAML text", and the pass
asserts *"Validation is therefore advisory by construction, in every variant considered."*

There are **two** executors. `tests/e2e/walker.ts` executes the corpus mechanically, evaluates both
grammars to decide which steps run (lines 459-460) and which exit is taken (242-270), and its trace is
a committed snapshot CI ratchets. For the walker, validation is not advisory: a step whose `when`
misparses does not run, and a walk that changes fails the baseline.

The inversion the pass proposes — *"let the server be the executor"* — is declared to create a new
impossibility, because a state machine cannot execute prose. But the choice is not binary. The repo
already splits it: the **skeleton** (which steps run, which exit is taken, which variables cross) is
mechanically executed and enforced; the **payload** (technique protocols, rules, registers) stays
prose for the agent. That is not an impossibility, it is the architecture, and it is where the four
dialects should be unified — because the walker is the thing that would break if they diverged.

### O3 — the meta-law "The Pin Sets the Grammar" is narrowed to a guarded, two-commit gap

The pin is not an accident hiding a divergence. `.github/actions/workflows-corpus/action.yml:38-52` is
a step named *"Confirm the branch walked the corpus this merge adopts"* which **fails the pull
request** when the branch's gitlink differs from the merge's, with a 30-line rationale citing the
concrete regression it prevents (issue #479, a corpus bump on the base making a step unreachable and
a pinned total fail on the runner while passing locally).

What survives is narrower and worth keeping: the guard compares *gitlink to gitlink*, never *gitlink
to submodule tip*, so a corpus commit landing without a superproject bump is unvalidated until
someone bumps. On the shipped system that gap is currently **2 commits, both of which validate**. The
meta-law's framing — that the operative specification is the gitlink and consistency work in the
corpus is invisible until the pointer moves — is a fair description of a real mechanism. Its stated
consequence, that a grammar decision recorded in `workflows/` will not bind, is sound advice. But it
is a release-hygiene observation, not a law that inverts the conservation law above it.

### O4 — reachability narrowings that re-tier bugs

| Bug | Claimed reachability | Line that refuses it | Actual |
|---|---|---|---|
| #1 | "**Reached now**… critical" | `activity.schema.ts:274,289` on `b061faee` declares both keys; 122/122 validate | Reached on a superseded local branch only |
| #2 | "Reached now, on every `next_activity`" | consequence of #1 | Same narrowing; not reached by the running server |
| #3 | "Reached on every checkpoint carrying an exit effect" | deployed `effect` is `.strict()` and declares `exit`; also unreachable on its own baseline behind #1 | Already fixed |
| #4 | "Reached via `getTransitionList`" | `workflow-loader.ts:521` has no `export`; 0 corpus `transitions`/`decisions` | Unreachable regardless of #1 |
| #5 | "Reached through `gateAnswer`" | `gate-liveness.ts:196` returns `whenSays && conditionSays` | Never compares them — see below |
| #8 | "Reached on any malformed gate" | 0 of 281 corpus gates fail `parseWhen` | Latent; no producer |
| #10 | "Reached now on any `next_activity` carrying a manifest" | consequence of #1 | Same narrowing |
| #11 | "17 commits… CI stays green" | `action.yml:38-52` fails the PR on gitlink drift; shipped gap is 2 commits | Real but guarded and benign |
| #13 | "Reachable only from a hand-constructed AST" | `evalAst` is not exported; only callers route through `parseWhen` | No door exists |

### O5 — bug #5 is a migration hazard, not a runtime one

The pass presents `Number()`/`toNumber()` divergence as *"Identical predicates, opposite answers"*
reached through `gateAnswer`. Measured, `gateAnswer` never puts them in opposition:

```
step carrying both grammars, when=true cond=false
  gateAnswer -> {"answer":false}
```

`gate-liveness.ts:194-196` **and-combines** them. Two grammars disagreeing on the same step resolve
deterministically to the conservative answer. There is no wrong branch and no non-determinism at
runtime. What the divergence actually costs is that *choosing a dialect changes delivery*: the same
intent written one way is bundled and the other way is not. That is a cost, and it is the right
argument for unification — but it is not "opposite answers" and it does not merit medium severity on
correctness grounds.

---

## UNDERCLAIMS

### U1 — `gate-liveness.ts` contradicts itself, in the file the analysis cites as the authority

Two functions in one file give opposite readings of the corpus's most common idiom.

`unboundPositiveReads`, lines 82-84, states the rule in its own doc comment:

> *"Negative and presence forms are left out, because absence answers them: `x != true` and
> `notExists x` hold on a missing variable, which is how this corpus spells 'not in that mode'."*

and implements it at line 100 (`if (ast.op !== '!=') paths.add(ast.path)`) and line 115.

`gateAnswer`, 60 lines later, does the opposite. `collectWhenPaths` (lines 10-27) adds **every** `cmp`
path to `valuePaths` regardless of operator, and lines 190-192 then declare the gate unanswered:

```
evaluateWhenExpression("is_review_mode != true", {}) = true
gateAnswer(when="is_review_mode != true", {})        = {"reason":"unbound"}
gateAnswer(cond notExists is_review_mode, {})        = {"answer":true}
```

Both functions are live. `unboundPositiveReads` is imported by the reference executor
(`tests/e2e/walker.ts:20`, used at line 456); `gateAnswer` is imported by `workflow-tools.ts:19` and
drives eager bundling at line 1202. So the walker and the delivery path hold contradictory positions
on whether absence answers a negative gate, and the contradiction is documented on one side and
implemented on the other.

The structural pass named `gate-liveness.ts:194-196` as the sole documentation of the AND-combination
and did not read the 130 lines above it.

### U2 — the two grammars have different *delivery* semantics, and the tree wins

Quantified over the corpus:

```
purely-negative when gates (every clause != or !): 54
  evaluateWhenExpression on an empty bag says TRUE:  54
  gateAnswer says unanswered for:                    54
```

Samples: `is_review_mode != true`, `plan_needs_replan != true`, `has_pr_surface != true`,
`!worker_agent_id`, `is_review_mode != true && needs_issue_creation != true && issue_skipped != true`.

Fifty-four gates whose intended and evaluated reading is `true` are classified unanswerable at
delivery, so their step techniques are never eagerly bundled and each costs a `get_technique` round
trip. Written as a tree — `{operator: notExists}` — the identical intent **is** answered and **is**
bundled.

This inverts the structural pass's central framing. It puts `when` on "the enforceable side:
parseable, evaluable, guarded" and `condition` on "the annotation side: consumed as documentation".
Measured at the one place the server actually acts on a predicate, the tree dialect is the one that
gets an answer and the string dialect is the one that gets deferred. Any unification that moves 54
tree-expressible gates into `when` makes delivery worse, and nothing in the repo would report it.

### U3 — the coercion gap is a class, not two data points

The pass measured 2 disagreements in 7 probes. Extending the probe set:

| Predicate | Bag | `when` | `condition` | |
|---|---|---|---|---|
| `n > 0` | `{n: true}` | true | false | *disagree* |
| `n > -1` | `{n: null}` | true | false | *disagree* |
| `n >= 0` | `{n: []}` | **true** | **false** | *disagree — missed* |
| `n > 1` | `{n: [2]}` | **true** | **false** | *disagree — missed* |
| `n > 0` | `{n: "  2  "}` | true | true | agree |
| `n == 1` | `{n: "1"}` | false | false | agree |

4 of 11. The correct characterisation is not "two identical predicates answer differently" but: the
`when` dialect's numeric comparison accepts **booleans, `null`, and any array whose `Number()`
coercion is finite** (`[]` → 0, `[2]` → 2); the tree dialect accepts **numbers and finite strings
only** (`condition.schema.ts:51-55`). Every non-scalar bag value is a divergence site, and the corpus
bag holds arrays routinely — `all_artifact_paths` and `analysis_units` in this session alone.

### U4 — the authoring rule has no runtime counterpart either

The pass observes (bug #12) that `assertWhenAuthoring`'s mixed-`&&`/`||` rule has no tree counterpart.
It misses that it has no *evaluator* counterpart:

```
evaluateWhenExpression("a && b || c") = true
assertWhenAuthoring("a && b || c")    = {"ok":false,"error":"mixed && and || at the same nesting
                                          depth require parentheses"}
```

`evaluateWhenExpression` (line 301) calls `parseWhen`, never `assertWhenAuthoring`; so does
`gateAnswer` (line 179). The rule exists only in `check:when-expression`. An expression reaching the
runtime by any path the guard does not cover — an adhoc checkpoint, a hand-written gate, a corpus
commit ahead of the pin — is evaluated under a precedence the author was explicitly told to
disambiguate, silently.

### U5 — a live gate in this session is false against its own bag

The activity now executing declares one step, gated:

```yaml
when: current_unit.pipeline_mode == 'full-prism'
```

The value that landed in the bag under `current_unit`, read back from the server:

```json
{ "lens_name": "l12", "risk": "high", "role": "api-surface",
  "target": "/home/mike1/projects/dev/workflow-server" }
```

No `pipeline_mode` key. `analysis_units[0]` — the collection the loop iterates — **does** carry
`pipeline_mode: "full-prism"`; the recorded loop variable is a four-key projection that drops it.
Under the reference evaluator:

```
evaluateWhenExpression("current_unit.pipeline_mode == 'full-prism'", liveBag) -> false
same gate if current_unit carried pipeline_mode                              -> true
```

The `activity-worker` technique's own rule is *"Honor `when:` gates against the variable bag …
invalid expressions do not run the step"*. Applied literally, this activity's only step must not run.
It ran, because no mechanical evaluator gates worker execution — which is precisely the hazard the
structural pass theorised in the abstract and did not notice in the bag its own preceding activity
wrote. A producer landing a lossy projection of a loop item, and a consumer gate reading a key the
projection dropped, is a concrete instance of the variable-contract break the whole `variables:`
construct exists to prevent.

### U6 — `CheckpointOptionSchema` itself is not strict on the analysed branch

The pass calls out `effect` (lines 48-52). The enclosing object (lines 44-53) is also a plain
`z.object` with no `.strict()`, so an unknown key at option level — a misspelled `lable`, a stray
`exit` written one level too high — is stripped just as silently. The deployed schema closes the
inner object; the outer one is worth checking in the same pass.

### U7 — there are three candidate lowerings of `exists`, and each fails on a different input class

The pass says the nearest tree form to `when` truthiness is `exists`, disagreeing on `false` and `0`.
The full picture:

| bag `x` | `when: x` | `when: x != null` | `{operator: exists}` |
|---|---|---|---|
| `false` | false | true | **true** |
| `0` | false | true | **true** |
| `""` | false | true | **true** |
| `null` | false | false | false |
| `undefined` | false | **true** | **false** |
| `[]` | true | true | true |

`x` diverges from `exists` on falsy scalars; `x != null` diverges on `undefined` — which is the case
that matters, since `undefined` is what an absent bag key reads as, and the `when` grammar has no
`undefined` literal to compare against. So the claim *"no total lowering exists in either direction"*
is not merely true, it is true for a reason the pass did not give: the `when` dialect cannot name the
value that distinguishes "absent" from "null", so `exists` is inexpressible in it by construction,
not by omission. **This strengthens the pass's strongest surviving finding.**

### U8 — the rejection is two error classes, not one

The meta-law asserts *"Every one of the 117 failures is `unrecognized_keys: ['variables','exits']`"*.
Measured:

```
93  unrecognized_keys:variables,exits
24  unrecognized_keys:variables
```

Twenty-four files reject on `variables` alone. The conclusion drawn from it (that the failures are
key-set errors, not predicate errors) survives — and prediction 2 was confirmed by execution — but the
uniformity claimed is not there.

---

## REVISED BUG TABLE

Severity re-tiered against the deployed system, since that is what "reached" has to mean.
**Class:** *fixed* = resolved in the shipped revision; *fixable*; *structural* = recurs by design;
*non-issue* = no reachable path.

| # | Location | What breaks | Severity | Reachability | Orig. class | New class | Why |
|---|---|---|---|---|---|---|---|
| 1 | `activity.schema.ts:274-304` (analysed branch) | `safeValidateActivity` rejects 117 of **122**; activities skipped at load | ~~critical~~ **low** | Only on `refactor/lean-test-suite`, 42 commits behind `origin/main`. Deployed schema validates **122/122** | fixable | **fixed** | `b061faee` declares `variables` (`:274`) and `exits` (`:289`) |
| 2 | `validation.ts:44` via `workflow-loader.ts:467` | empty activity list ⇒ `getValidTransitions` returns `[]` ⇒ transition legality fails open | ~~high~~ **low** | Consequence of #1; and `getValidTransitions` does not exist on `origin/main` | fixable | **fixed** | superseded by graph-bound exits |
| 3 | `activity.schema.ts:48-52`; `exits:` unread in `src/` | routing vocabulary invisible; `effect.exit` stripped | ~~high~~ **low** | Deployed `effect` is `.strict()` and declares `exit`; `exits` read at 22 sites; unbound exit fails the load | structural | **fixed** | W3, W4 |
| 4 | `workflow-loader.ts:521-536` `conditionToString` | tree→string lowering emits `AND`/`OR`/`NOT` and `JSON.stringify(undefined)`; 5 of 6 forms fail `parseWhen` | **informational** | Module-private, 0 corpus producers of `transitions`/`decisions`, `"processes": []` in the graph, deleted on `origin/main` | fixable | **non-issue** | W9 — keep as *evidence* that the dialects are not mutually expressible; it is not a defect |
| 5 | `when-expression.ts:274-276` vs `condition.schema.ts:51-55` | `Number()` accepts booleans, `null`, arrays; `toNumber()` accepts numbers and finite strings | ~~medium~~ **low (runtime) / high (migration)** | `gateAnswer:196` and-combines, so never opposed at runtime. Bites any `condition`↔`when` rewrite | fixable | **fixable** | O5, U3 — share one coercion before any unification |
| 6 | `when-expression.ts:4-9` grammar | `exists`/`notExists` (17 uses) have no `when` form; the dialect cannot name `undefined`, so `exists` is inexpressible in it | **medium** | Reached by any unification attempt | structural | **structural — upheld and strengthened** | U7 |
| 7 | `activity.schema.ts:77` + `gate-liveness.ts:194-196` | `condition` marked LEGACY, yet its *presence* enables `condition_not_met` dismissal (67 of 113 checkpoints) | **medium** | Any `condition`→`when` migration; text identical on `origin/main` | structural | **structural — upheld** | the syntax does not encode the capability; unification silently removes dismissibility |
| 8 | `when-expression.ts:301-305` | unparseable `when` fails closed and silently | **low** | **0 of 281** corpus gates fail `parseWhen`; guard holds | fixable | **fixable (latent)** | W11 |
| 9 | `activity.schema.ts:27` `target: z.string()` | 22 of 122 targets carry comparisons (`gh.auth.status == 0`, `summary_budget_overruns == []`) in an undeclared dialect; `== []` is inexpressible in either declared grammar | **medium** | Every `validate` action step; agent-interpreted only. Unchanged on `origin/main` | fixable | **fixable — upheld** | the one genuinely undeclared dialect; the natural target of this run |
| 10 | `validation.ts:235-240` | empty `activityIds` ⇒ every manifest entry warns "references unknown activity" | ~~low-medium~~ **low** | Consequence of #1 | fixable | **fixed** | |
| 11 | `.github/actions/workflows-corpus/action.yml` | CI validates the gitlink, never the submodule tip | **medium** | Real, but the same action fails a PR on gitlink drift (`:38-52`); shipped gap is **2 commits**, both valid | structural | **fixable** | O3 — add a non-blocking job validating the corpus tip; the pin stays |
| 12 | `when-expression.ts:312-336` `assertWhenAuthoring` | mixed `&&`/`\|\|` rule applies to `when` only, and only in the guard — not in `evaluateWhenExpression` or `gateAnswer` | ~~low~~ **medium** | Any gate reaching the runtime outside guard coverage | fixable | **fixable — raised** | U4; broader than the pass stated |
| 13 | `when-expression.ts:277-286` | `cmp` with an unexpected operator falls through to `case 'not'`, `TypeError` | **informational** | `evalAst` is not exported; only callers route through `parseWhen`, which emits six ops | fixable | **non-issue** | W10 |
| **14** | `gate-liveness.ts:10-27,190-192` vs `:82-84,100,115` | one file gives two answers for `x != true` on an absent variable: `unboundPositiveReads` says absence answers it, `gateAnswer` says unanswered | **medium** | Both live — walker at `:456`, delivery at `workflow-tools.ts:1202` | — | **fixable** | U1 |
| **15** | `gate-liveness.ts:10-27` `collectWhenPaths` | 54 purely-negative corpus gates read `true` but deliver as unanswered, so their techniques are never eagerly bundled; the `notExists` tree spelling *is* bundled | **medium** | Every activity open carrying such a gate — the corpus's standard "not in that mode" idiom | — | **fixable** | U2; exclude `!=`/`!` clauses from `valuePaths`, matching the documented rule |
| **16** | `prism/activities/*` loop-variable landing vs `adversarial-pass` step gate | `current_unit` lands as a four-key projection; the step gate reads `current_unit.pipeline_mode`, which the projection drops. Gate evaluates **false** against the live bag | **medium** | Live in session `YM6QZV` right now | — | **fixable** | U5 — either land the whole unit or gate on `pipeline_mode` directly |
| **17** | `activity.schema.ts:44-53` `CheckpointOptionSchema` | the option object itself is not `.strict()`; unknown option-level keys strip silently | **low** | Any authoring typo at option level | — | **fixable** | U6 |

---

## Graph Verification

GitNexus index for `workflow-server` (refreshed at the structural pass: 15,467 nodes / 21,142 edges /
213 clusters / 300 flows). Note the index is built from the **analysed branch**, so it confirms
claims about that tree and cannot speak to `origin/main`; the `origin/main` results above come from
direct execution against a worktree at `b061faee`.

| Claim under test | Query | Result | Verdict |
|---|---|---|---|
| "`gateAnswer` has one production caller" | `impact(gateAnswer, upstream)` | `impactedCount: 1`, `risk: LOW`, d=1 = `collect` @ `src/tools/workflow-tools.ts`, 1 process, 1 module | **CONFIRMED** |
| "`conditionToString` is the one lowering, reached via `getTransitionList`" | `context(conditionToString)` | incoming calls: `getTransitionList`, itself. Outgoing: itself. **`processes: []`** | **CONFIRMED as isolated; REFUTED as reached** — participates in zero execution flows |
| "the evaluators serve only bundling" | `MATCH (a)-[:CALLS]->(b) WHERE b.name IN ['evaluateCondition','evaluateWhenExpression','parseWhen',…]` | 34 rows. Production callers beyond `gateAnswer`: `reviewExcluded`/`reviewProvablyTrue` (`scripts/check-review-mode-gating.ts`), `evalWhen` (`scripts/check-stealth-isolation.ts`), `requirements`/`valueReads` (`scripts/check-decision-order.ts`); executor callers `walk`/`pickNext`/`advanceToUnvisited`/`evaluateWhen` (`tests/e2e/walker.ts`) | **REFUTED** |
| "`transitions`/`decisions` retain 5 server clearers" | same query + `grep` on `origin/main` | On the analysed branch: `getValidTransitions` ← `validateActivityTransition`; `getTransitionList` ← `validateActivityManifest`, `validateTransitionCondition`; both reach `registerWorkflowTools`. On `origin/main`: **all absent** | **CONFIRMED on branch, REFUTED as a system property** |
| "`exits` is dead code — nothing calls it" | `grep -rn exits src/` on both trees | analysed branch: **1** occurrence, a comment (`dispatch.ts:11`). `origin/main`: **22** across 7 files, incl. load-failure paths | **REFUTED on the shipped system** |

---

## Where this leaves the run

The commissioning question is whether the definition grammar can be given a shorthand, and the
structural pass concluded that any such work is futile because the operative specification is a
gitlink and the enforcement point is absent. That conclusion does not survive.

What survives, and what the specification work should be aimed at:

1. **There is a real second executor to unify against.** `tests/e2e/walker.ts` evaluates both grammars
   and its trace is CI-ratcheted. A shorthand that the walker can evaluate is enforced; one it cannot
   is decoration. This is the enforcement point the pass said was missing.
2. **`actions[].target` (bug #9) is the genuinely undeclared dialect** — 22 predicate-shaped strings
   typed `z.string()`, including `== []`, which neither declared grammar can express. It is the
   clearest candidate for the shorthand this run is settling.
3. **`exists` cannot be lowered into `when` as the dialect stands** (U7), because `when` has no way to
   name `undefined`. Any unified grammar must add a presence form, not reuse a comparison.
4. **Unification must not be purely syntactic** (bug #7 upheld): `condition`'s *presence* is a
   capability switch for 67 checkpoints, and `when` has no way to carry that.
5. **Fix the coercion split before, not during, migration** (bug #5): one shared `toNumber`, chosen
   deliberately, or every rewritten gate is a behaviour change on non-scalar bag values.
6. **The delivery reading of a gate is a third semantics** (bugs #14, #15) and it currently penalises
   the `when` dialect on the corpus's most common idiom. Whatever grammar this run settles, its
   delivery reading has to be specified alongside its evaluation reading, or the shorthand will be
   correct and slow.
7. **Do the specification against `origin/main`.** The analysed branch is 42 commits behind and does
   not contain `ExitSchema`, `ActivityVariablesSchema`, `variable.schema.ts` or the workflow `graph`
   construct. A grammar decision drafted against it would re-litigate work already merged.
