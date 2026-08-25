---
Subject: workflow-server activity and workflow definition language — the predicate grammars
Evaluation Date: 2026-08-25
Scope: consistency of the parallel predicate grammars across activity and workflow YAML, measured against `origin/main` (`b061faee`) and corpus revisions `5f17da01`, `7e5f5eae` and `fbd6f53b`
---

# Workflow Definition Language — Definitive Findings

## Core Finding

`actions[].target` is typed `z.string()` on a schema object that is not closed, and it is the only
field in `activity.schema.ts` carrying no description. Four of its values parse under neither declared
grammar: one presence test, `target_path exists`, and three emptiness tests of the form `x == []`.
Thirty-four of the thirty-eight `validate` targets already parse as valid `when` expressions, so the
field does not hold a third language. It holds the enforced language plus exactly two missing
productions.

Every construct absorbed into the enforced schema was absorbed at the expressiveness the enforcer
already had, never above it. `graph` edges admit no predicate at all across 192 edges. `exits[]`
admits the string dialect only, so the tree dialect's `exists` and `notExists` cannot be written on an
exit despite seventeen uses elsewhere. The authoring intent that did not fit was not deleted; it moved
to the nearest field the schema does not constrain.

That makes the undeclared field an instrument rather than a defect. Its contents are a measured list
of the productions the declared grammar lacks, written by the corpus itself. The target shorthand is
therefore specified by reading the residue rather than by choosing a syntax.

Testable prediction: add a postfix presence form and an emptiness form to the `when` dialect, and the
unparseable residue in `actions[].target` falls from four to zero, making all thirty-eight `validate`
targets parseable in the declared grammar. If any `validate` target still fails to parse after those
two productions land, the account of what the residue is made of is wrong.

## Findings

Findings are ordered by severity (Critical, High, Medium, Low). Finding IDs match REPORT.md exactly.

### CON-05 — the two dialects use different numeric coercion

- **Severity:** High
- **Classification:** Fixable
- **Reachability:** reachable — `gateAnswer` evaluates both dialects on every eager-bundling decision, and-combining them so they are never opposed at runtime. Reachable on every rewrite of a gate from one dialect to the other.
- **Description:** The string dialect coerces operands with `Number()`; the tree dialect coerces with `toNumber()`. Five of thirteen probe predicates return different answers. `Number()` accepts booleans, `null`, and any array whose coercion is finite, so `[]` reads as 0 and `[2]` reads as 2. `toNumber()` accepts numbers and finite strings only, and a comparison against its `undefined` result is false.
- **Impact:** Every gate rewritten between dialects silently changes its answer on non-scalar values. The variable bag holds arrays routinely, so a migration performed before the coercion is unified produces behaviour changes that no guard reports.
- **Location:** `src/schema/when-expression.ts:274-276` and `src/schema/condition.schema.ts:51-55`
- **Recommendation:** Choose one shared numeric coercion deliberately and land it before any gate is rewritten.
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module
- **Adversarial confirmation:** confirmed and widened — probe set extended from 2 of 7 to 4 of 11, then to 5 of 13, adding the case `{n:[0]}`. Severity split into low at runtime and high for migration.

### CON-20 — one predicate intent has five different availabilities by position

- **Severity:** High
- **Classification:** Structural until the grammar unifies
- **Reachability:** reachable — this is the standing state of the language at every authoring site.
- **Description:** Five positions give five different answers to which predicate may be written there. A step gate admits both dialects, and-combined. An `exits[].when` admits the string dialect only, with no presence form. A checkpoint admits both, but needs the tree dialect for dismissal. A `graph` edge admits no predicate. An `actions[].target` is undeclared.
- **Impact:** An author who knows one position's rules cannot transfer that knowledge to another. A gate cannot be moved between positions without being rewritten or losing capability. This is the consistency defect the evaluation set out to characterise, and it is positional rather than a count of dialects.
- **Location:** `src/schema/activity.schema.ts`, `src/schema/workflow.schema.ts`, and `workflows/**/*.yaml`
- **Recommendation:** Encode the positional table below as an assertion in `activity.als` and `workflow.als`. Assert that a `graph` edge admits no expression rather than merely permitting its absence.

| Position | Level | `when` | `condition` tree | Presence forms | Sites |
|---|---|---|---|---|---|
| step gate | activity | yes | yes | tree only | 281 / 108 |
| `exits[].when` | activity | yes | no | neither | 54 |
| checkpoint | activity | yes | required for dismissal | tree only | 113 / 67 |
| `actions[].target` | activity | undeclared | sibling `condition` | undeclared | 38 |
| `graph` edge | workflow | no | no | no | 192 |

### CON-06 — the string dialect has no presence form

- **Severity:** Medium
- **Classification:** Fixable
- **Reachability:** reachable by any unification attempt, and already reached by the corpus, which wrote the missing production once in the only field that accepts it.
- **Description:** `exists` and `notExists` have seventeen tree-dialect uses and no string-dialect form. `parseWhen("x exists")` fails with a trailing-input error. The string dialect's bare-identifier truthiness has no tree node, and the nearest tree form disagrees with it on `false` and on `0`. No lowering is total in either direction.
- **Impact:** An author needing a presence test where only the string dialect is admitted has no correct spelling. The two available workarounds both fail: `x != undefined` mis-parses as a string comparison, and `x != true` costs a delivery round trip.
- **Location:** `src/schema/when-expression.ts` grammar, lines 4-9
- **Recommendation:** Add a postfix `presence` production, `path ( "exists" | "notExists" )`. Postfix order is settled by the one authored instance, `target_path exists`.
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module
- **Adversarial confirmation:** confirmed and strengthened, then reclassified from structural to fixable. The claim that presence is inexpressible by construction was withdrawn: re-measurement showed the dialect accepts `x != undefined`, so the gap is an omitted production rather than an impossibility.

### CON-07 — a checkpoint's dismissibility is carried by field presence, not by syntax

- **Severity:** Medium
- **Classification:** Structural
- **Reachability:** reachable on any migration of `condition` to `when` on a checkpoint. 67 of 113 checkpoints depend on the field being present.
- **Description:** On a checkpoint step the presence of `condition` enables `condition_not_met` dismissal. The contents of the field do not affect the capability. The expression syntax never encoded it.
- **Impact:** Replacing `condition:` with `when:` on a checkpoint silently removes dismissibility for that checkpoint, and nothing in the repository reports the loss. No purely syntactic unification preserves the capability.
- **Location:** `src/schema/activity.schema.ts:77` and `src/utils/gate-liveness.ts:194-196`
- **Recommendation:** Carry an explicit dismissibility marker in the target grammar, so the capability survives a change of syntax. This is the one place the target grammar needs a construct the expression language cannot supply.
- **Adversarial confirmation:** confirmed; the schema text is byte-identical on `origin/main`.

### CON-09 — `actions[].target` has a type that depends on a sibling key

- **Severity:** Medium
- **Classification:** Fixable
- **Reachability:** reachable on every `validate` action step. The value is agent-interpreted, with no parser and no evaluator behind it.
- **Description:** The field holds 122 values across two readings selected by the sibling `action` verb. Under `set` it holds 84 lvalues, which are variable names. Under `validate` it holds 38 predicates, of which 22 carry comparison operators and 34 already parse as valid `when` expressions. The field is typed `z.string()` with no discrimination on the verb.
- **Impact:** Neither reading is declared and neither is checked, so 38 authored predicates carry no validation. Four of them parse under no declared grammar at all.
- **Location:** `src/schema/activity.schema.ts:26-33`
- **Recommendation:** Make `ActionSchema` a discriminated union on the `action` verb. Removing the `set` verb, already slated for the next workflow-schema major, leaves `target` with a single reading, at which point it types as an expression.
- **Adversarial confirmation:** upheld and sharpened — recharacterised from an undeclared third dialect to a field whose type depends on a sibling key, with 34 of 38 targets already parseable.

### CON-12 — the mixed-operator authoring rule has no evaluator counterpart

- **Severity:** Medium
- **Classification:** Fixable
- **Reachability:** reachable by any expression arriving at the runtime outside guard coverage — an adhoc checkpoint, a hand-written gate, or a corpus commit ahead of the pin. Zero corpus violations today.
- **Description:** `assertWhenAuthoring` rejects `a && b || c`, requiring parentheses for mixed `&&` and `||` at one nesting depth. `evaluateWhenExpression` evaluates the same string to `true`, because it routes through `parseWhen` and never calls the authoring check. `gateAnswer` behaves the same way. The tree dialect has no counterpart rule, so nested `and`/`or` is always accepted.
- **Impact:** An expression the author was explicitly told to disambiguate is evaluated silently under a fixed precedence wherever the guard does not reach.
- **Location:** `src/schema/when-expression.ts:307-336`
- **Recommendation:** Apply the authoring rule at evaluation, or state in the specification that precedence is fixed and the rule is advisory.
- **Adversarial confirmation:** severity raised from Low to Medium — the gap is wider than a missing tree counterpart, extending to the evaluator on the same dialect.

### CON-14 — one file gives two answers for whether absence answers a negative gate

- **Severity:** Medium
- **Classification:** Fixable
- **Reachability:** reachable — both functions are live. The reference executor imports one; the delivery path imports the other.
- **Description:** `unboundPositiveReads` documents and implements the rule that absence answers a negative form, excluding `!=` paths from the unbound set. `gateAnswer`, sixty lines later in the same file, folds every comparison path into the value bucket regardless of operator and reports the gate unanswered. On `x != true` against an empty bag, the first says answered and the second says unbound.
- **Impact:** The walker and the delivery path hold contradictory readings of the corpus's most common idiom. One of them is wrong on every gate that uses it, and the contradiction is documented on one side and implemented on the other.
- **Location:** `src/utils/gate-liveness.ts:10-27` and `:82-84`
- **Recommendation:** Adopt in `collectWhenPaths` the `!=` exclusion that `unboundPositiveReads` already documents and implements.
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module
- **Adversarial confirmation:** confirmed on `origin/main` by direct execution of both functions against an empty bag.

### CON-15 — 54 negative gates are never eagerly bundled

- **Severity:** Medium
- **Classification:** Fixable
- **Reachability:** reachable on every activity open carrying such a gate. This is the corpus's standard spelling of "not in that mode".
- **Description:** Fifty-four corpus gates are purely negative, every clause being `!=` or `!`. All 54 evaluate `true` against an empty variable bag, and all 54 are reported unanswered at delivery. The carve-out that would answer them applies to presence operators, and the string dialect has none. The identical intent written as a `notExists` tree is answered.
- **Impact:** Fifty-four step techniques are never inlined, each costing a `get_technique` round trip per activity open. The missing grammar production and the delivery penalty are the same fact measured twice.
- **Location:** `src/utils/gate-liveness.ts:10-27`, `collectWhenPaths`
- **Recommendation:** Route the new presence production to the presence bucket and exempt it from the unbound check, matching how tree presence operators are already routed. Specify for every production whether it is answerable on an absent variable.
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module
- **Adversarial confirmation:** confirmed on `origin/main` — 54 gates, 54 evaluating true, 54 unanswered.

### CON-16 — a loop variable lands as a projection that drops the key its own gate reads

- **Severity:** Medium
- **Classification:** Fixable
- **Reachability:** reachable — read live from the session that commissioned this evaluation.
- **Description:** The `current_unit` loop variable lands in the bag as a four-key object holding `lens_name`, `risk`, `role` and `target`. The collection it iterates also carries `pipeline_mode`. A step gate reading `current_unit.pipeline_mode == 'full-prism'` evaluates false against the bag its own preceding activity wrote.
- **Impact:** A producer landing a lossy projection and a consumer gate reading a dropped key is precisely the variable-contract break the `variables:` construct exists to prevent. The step ran regardless, because no mechanical evaluator gates worker execution.
- **Location:** `workflows/prism/activities/`, loop-variable landing against the step gate
- **Recommendation:** Land the whole loop item, or gate on `pipeline_mode` directly.
- **Adversarial confirmation:** confirmed live in the current session on both measurements.

### CON-18 — the action object is open and its target field is undocumented

- **Severity:** Medium
- **Classification:** Fixable
- **Reachability:** reachable on any unknown key inside an action object.
- **Description:** `ActionSchema` is not `.strict()`, so an unknown key inside an action object is stripped without a warning. `target` is the only field in the file carrying no `.describe()`, and it is the field holding the undeclared predicate forms.
- **Impact:** A misspelled sibling key is discarded silently. The undocumented field is the one the residue accumulated in, so nothing in the schema signalled that its contents were unconstrained.
- **Location:** `src/schema/activity.schema.ts:26-33`
- **Recommendation:** Apply `.strict()` to `ActionSchema` and add a `.describe()` to `target`, alongside the discriminated union in CON-09.

### CON-19 — `undefined` parses as a string literal

- **Severity:** Medium
- **Classification:** Fixable
- **Reachability:** reachable — the expression parses successfully today. No corpus site uses it yet.
- **Description:** `parseWhen('x == undefined')` succeeds and produces a comparison whose value is the string `"undefined"`. The expression therefore means `x == "undefined"`. No guard catches it.
- **Impact:** The expression silently means something other than what it reads as. It is what an author reaches for when the dialect offers no presence test, so the trap sits directly beside the gap that produces it. Adding a presence production without reserving the word leaves the trap armed next to its own fix.
- **Location:** `src/schema/when-expression.ts`, literal tokenisation
- **Recommendation:** Reserve `undefined` as a word that fails to parse rather than tokenising as a bare identifier. Land this with the presence production.

### CON-01 — `variables` and `exits` are declared on the activity schema

- **Severity:** Low
- **Classification:** Fixed
- **Reachability:** unreachable on `origin/main` — reached only on the local branch `refactor/lean-test-suite`, which is 42 commits behind and lacks the commit that added the keys.
- **Description:** `ActivitySchema` declares both keys. All 122 activity files accept at all three corpus revisions measured, with a census delta of zero across six commits of corpus movement.
- **Impact:** None on the mainline. On the superseded branch every workflow loads with an empty activity graph.
- **Location:** `src/schema/activity.schema.ts:274` and `:289`
- **Recommendation:** Draft the specification against `origin/main`. No schema action is required.
- **Adversarial confirmation:** severity lowered from Critical to Low and reclassified as fixed; the denominator was corrected from 117 of 117 to 117 of 122.

### CON-02 — transition-legality validation

- **Severity:** Low
- **Classification:** Fixed
- **Reachability:** unreachable — the symbol does not exist on `origin/main`.
- **Description:** `getValidTransitions` is absent from the mainline. The fail-open path that returned an empty transition list has no symbol behind it. Routing legality is enforced through graph-bound exits, and an unbound exit fails the workflow load.
- **Impact:** None.
- **Location:** `src/utils/validation.ts`
- **Recommendation:** No action.
- **Adversarial confirmation:** severity lowered from High to Low and reclassified as fixed.

### CON-03 — the routing vocabulary is read and enforced

- **Severity:** Low
- **Classification:** Fixed
- **Reachability:** unreachable — `exits` occurs 22 times across the source tree and the reads are load-bearing.
- **Description:** A graph edge binding an exit the activity does not declare fails the workflow load. The checkpoint option's `effect` object is `.strict()` and declares `exit`, so an unknown key there is an error rather than a silent strip.
- **Impact:** None.
- **Location:** `src/loaders/workflow-loader.ts:577` and `src/schema/activity.schema.ts:52`
- **Recommendation:** No action.
- **Adversarial confirmation:** severity lowered from High to Low and reclassified as fixed; refuted on the shipped system at 22 read sites.

### CON-04 — the tree-to-string lowering

- **Severity:** Low
- **Classification:** Non-issue
- **Reachability:** unreachable — the symbol is absent on `origin/main`, was module-private where it existed, and the corpus holds zero producers of the constructs that called it.
- **Description:** `conditionToString` emitted `AND`, `OR` and `NOT` as bare identifiers and rendered an absent operand as the literal text `undefined`, so five of six forms failed to re-parse.
- **Impact:** None. The result is retained as evidence that the two dialects were never mutually expressible, which is part of the case for extending the grammar rather than translating between dialects.
- **Location:** `src/loaders/workflow-loader.ts`, symbol absent on the mainline
- **Recommendation:** Retain as evidence; no code action.
- **Adversarial confirmation:** reclassified as a non-issue; reachability refuted independently of CON-01.

### CON-08 — an unparseable gate fails closed without a diagnostic

- **Severity:** Low
- **Classification:** Fixable, latent
- **Reachability:** latent — 0 of 281 corpus gates fail to parse, and the `check:when-expression` guard holds the corpus clean. No live producer.
- **Description:** `evaluateWhenExpression` returns `false` for a string it cannot parse, so a typo'd gate skips its step with no signal on the execution path.
- **Impact:** A malformed gate would silently suppress its step. The guard covers the corpus but not the runtime.
- **Location:** `src/schema/when-expression.ts:301-305`
- **Recommendation:** Surface an unparsed signal distinct from a false result.
- **Adversarial confirmation:** reachability narrowed from "any malformed gate" to latent with no producer.

### CON-10 — manifest warnings for unknown activities

- **Severity:** Low
- **Classification:** Fixed
- **Reachability:** unreachable — the warning path fires only when the activity id set is empty, and the set is populated on `origin/main`.
- **Description:** With the schema declaring `variables` and `exits`, activity ids resolve and the manifest warnings do not occur.
- **Impact:** None.
- **Location:** `src/utils/validation.ts:235-240`
- **Recommendation:** No action.
- **Adversarial confirmation:** severity lowered to Low and reclassified as fixed, following CON-01.

### CON-11 — CI validates the pinned corpus, not the submodule tip

- **Severity:** Low
- **Classification:** Fixable, benign
- **Reachability:** reachable now — the pointer gap stands at six commits, and the running container serves a corpus two commits ahead of what its own image pins.
- **Description:** The corpus action resolves the gitlink, so a corpus commit landing without a superproject bump is unvalidated until someone bumps the pointer. The gitlink guard compares gitlink to gitlink and cannot see the container's bind mount.
- **Impact:** None on the grammar. All three pointers validate 122 of 122 with a census delta of zero, because validity is decided by a module shipping with the server binary. The mechanism is real and its grammar consequence is nil.
- **Location:** `.github/actions/workflows-corpus/action.yml:38-52`
- **Recommendation:** Add a non-blocking job validating the corpus tip. Keep the pin, which is doing a job: it lets the corpus move at authoring cadence without a server release.
- **Adversarial confirmation:** severity lowered from High to Low across two narrowings; the gitlink drift guard was confirmed to fail a pull request on divergence.

### CON-13 — comparison-node fall-through in the evaluator

- **Severity:** Low
- **Classification:** Non-issue
- **Reachability:** unreachable — `evalAst` is not exported, and its only callers route through `parseWhen`, which emits six operators and no others.
- **Description:** A comparison node carrying an unexpected operator would fall through to the negation branch and throw.
- **Impact:** None. No caller inside or outside the module can construct the state.
- **Location:** `src/schema/when-expression.ts:270-287`
- **Recommendation:** No action.
- **Adversarial confirmation:** reclassified as a non-issue; the hand-constructed-AST route was refuted by the module's export list.

### CON-17 — the checkpoint option object is open

- **Severity:** Low
- **Classification:** Fixable
- **Reachability:** reachable on any authoring typo at option level.
- **Description:** `CheckpointOptionSchema` is not `.strict()` at the option level, though its inner `effect` object is.
- **Impact:** A misspelled label, or an `exit` written one level too high, is stripped without a warning.
- **Location:** `src/schema/activity.schema.ts:45-53`
- **Recommendation:** Apply `.strict()` to the enclosing option object.

## Conservation Laws & Design Trade-offs

### The Expressive Residue Law

- **Constraint:** Absorbing a construct into the enforced core fixes its grammar at the enforcer's current expressiveness. Authoring intent exceeding that expressiveness is not eliminated by the absorption — it migrates to the nearest field the schema does not constrain. The residue is conserved: it moves, it does not shrink, and it accumulates until the enforced grammar grows the forms the residue is made of.
- **Current operating point:** The residue stands at 4 sites in `actions[].target` — one presence test and three emptiness tests, in a field that is `z.string()` on a non-strict object with no description (CON-09, CON-18). `exits[]` was absorbed with the string dialect only and no presence form (CON-20). `graph` edges were absorbed with no predicate vocabulary at all, across 192 edges (CON-20). The excluded presence form is simultaneously visible as a delivery cost on 54 gates (CON-15).
- **Shift prediction:** Add the presence and emptiness productions and the residue falls from 4 to 0, with all 38 `validate` targets parseable. Absorb a further construct without granting it the full vocabulary and the residue refills in the same field. The residue is currently 4 sites; it was smaller before `exits[]` was absorbed and will be larger after the next absorption, so closing it costs two productions now and those two plus the next exclusion later.

### The Schema Sets the Grammar; the Pin Only Sets the Text

- **Constraint:** A grammar decision binds exactly when it lands in the server's schema module. A corpus pointer bump changes what gets validated, never what validity means. A decision recorded in `workflows/` — as prose, a README, a technique rule, an authoring convention — is a description of the grammar; the same decision recorded in `src/schema/` is the grammar.
- **Current operating point:** Three pointers are live and span six commits — image pin `5f17da01`, container bind mount `7e5f5eae`, superproject working tree `fbd6f53b`. All three validate 122 of 122 with a census delta of zero on every construct (CON-11). Six commits of unpinned corpus movement changed the grammar in force by nothing at all.
- **Shift prediction:** A grammar decision landing in `src/schema/` binds at that commit regardless of pointer state, so this specification is not blocked on unifying the pointers. The same decision landing only in `workflows/` will be accurate, will be cited, and will not be the grammar. If a future pointer bump changes which grammar is enforced without a corresponding change in `src/schema/`, the constraint is wrong.

## Traceability

| Report ID | Source Artifact | Original ID | Original Severity |
|-----------|-----------------|-------------|-------------------|
| CON-01 | consistency/01-structural-analysis.md | #1 | Critical |
| CON-02 | consistency/01-structural-analysis.md | #2 | High |
| CON-03 | consistency/01-structural-analysis.md | #3 | High |
| CON-04 | consistency/01-structural-analysis.md | #4 | Medium |
| CON-05 | consistency/01-structural-analysis.md | #5 | Medium |
| CON-06 | consistency/01-structural-analysis.md | #6 | Medium |
| CON-07 | consistency/01-structural-analysis.md | #7 | Medium |
| CON-08 | consistency/01-structural-analysis.md | #8 | Medium |
| CON-09 | consistency/01-structural-analysis.md | #9 | Medium |
| CON-10 | consistency/01-structural-analysis.md | #10 | Low-medium |
| CON-11 | consistency/01-structural-analysis.md | #11 | High |
| CON-12 | consistency/01-structural-analysis.md | #12 | Low |
| CON-13 | consistency/01-structural-analysis.md | #13 | Low |
| CON-14 | consistency/02-adversarial-analysis.md | #14 | Medium |
| CON-15 | consistency/02-adversarial-analysis.md | #15 | Medium |
| CON-16 | consistency/02-adversarial-analysis.md | #16 | Medium |
| CON-17 | consistency/02-adversarial-analysis.md | #17 | Low |
| CON-18 | consistency/03-synthesis.md | #18 | Unassigned |
| CON-19 | consistency/03-synthesis.md | #19 | Unassigned |
| CON-20 | consistency/03-synthesis.md | #20 | Unassigned |
