---
Subject: workflow-server activity and workflow definition language — the predicate grammars
Evaluation Date: 2026-08-25
Scope: consistency of the parallel predicate grammars across activity and workflow YAML, measured against `origin/main` (`b061faee`) and corpus revisions `5f17da01`, `7e5f5eae` and `fbd6f53b`
---

# Workflow Definition Language — Evaluation Report

## Executive Summary

The definition language carries two predicate grammars: an inline `when:` string dialect and a
structured `condition:` tree. Every predicate-bearing construct was measured at three corpus revisions
and every behavioural claim re-executed against the schema and evaluator modules on `origin/main`. The
corpus validates cleanly at all three — 122 of 122 activity files accept, with a census delta of zero
across six commits — so the inconsistency is not a validation failure but a question of which
predicate an author may write in which position.

| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 2     |
| Medium   | 9     |
| Low      | 9     |
| Total    | 20    |

Core finding: the four strings in `actions[].target` that no declared grammar parses are a measured
statement of exactly which productions the declared grammar is missing.

## Core Finding

`actions[].target` is typed `z.string()` on an object that is not closed. Four of its values parse
under neither declared grammar: one presence test, `target_path exists`, and three emptiness tests of
the form `x == []`. Thirty-four of the thirty-eight `validate` targets already parse as valid `when`
expressions, so the field holds the enforced language plus exactly two missing productions.

Those four strings are an instrument rather than a leak. Every construct absorbed into the enforced
schema was absorbed at the expressiveness the enforcer already had: `graph` edges admit no predicate
across 192 edges, and `exits[]` admits the string dialect only. Intent that did not fit was not
deleted — it moved to the one field the schema does not constrain. Its contents are therefore a
measured list of the productions the grammar lacks, written by the corpus itself, and the target
shorthand should be read off that list rather than chosen as a syntax.

Testable prediction: add a postfix presence form and an emptiness form to the `when` dialect, and the
residue falls from four to zero, making all thirty-eight `validate` targets parseable. If any still
fails to parse after those two productions land, the account of the residue is wrong. The same missing
presence form is already priced at delivery, in CON-15 below.

## Critical Findings

None.

## High Findings

### CON-05 — the two dialects use different numeric coercion

- **Severity:** High
- **Description:** The string dialect coerces with `Number()` and the tree dialect with `toNumber()`, so five of thirteen probe predicates disagree; booleans, `null` and arrays are accepted by the first and rejected by the second.
- **Classification:** Fixable
- **Location:** `src/schema/when-expression.ts:274-276` and `src/schema/condition.schema.ts:51-55`
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### CON-20 — one predicate intent has five different availabilities by position

- **Severity:** High
- **Description:** A step gate admits both dialects, an `exits[].when` admits the string dialect only, a checkpoint needs the tree dialect for dismissal, a `graph` edge admits no predicate, and an `actions[].target` is undeclared.
- **Classification:** Structural until the grammar unifies
- **Location:** `src/schema/activity.schema.ts`, `src/schema/workflow.schema.ts`, `workflows/**/*.yaml`

## Medium Findings

### CON-06 — the string dialect has no presence form

- **Severity:** Medium
- **Description:** `exists` and `notExists` have seventeen tree uses and no string-dialect form, and no lowering between the dialects is total in either direction.
- **Classification:** Fixable
- **Location:** `src/schema/when-expression.ts` grammar, lines 4-9
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### CON-07 — a checkpoint's dismissibility is carried by field presence, not by syntax

- **Severity:** Medium
- **Description:** The presence of `condition` on a checkpoint enables `condition_not_met` dismissal for 67 of 113 checkpoints, and replacing it with `when:` removes that silently.
- **Classification:** Structural
- **Location:** `src/schema/activity.schema.ts:77` and `src/utils/gate-liveness.ts:194-196`

### CON-09 — `actions[].target` has a type that depends on a sibling key

- **Severity:** Medium
- **Description:** The field holds 84 lvalues under the `set` verb and 38 predicates under `validate`, typed `z.string()` with no discrimination, so neither reading is declared or checked.
- **Classification:** Fixable
- **Location:** `src/schema/activity.schema.ts:26-33`

### CON-12 — the mixed-operator authoring rule has no evaluator counterpart

- **Severity:** Medium
- **Description:** `assertWhenAuthoring` rejects `a && b || c` while `evaluateWhenExpression` evaluates it to true, because the rule lives only in the corpus guard.
- **Classification:** Fixable
- **Location:** `src/schema/when-expression.ts:307-336`

### CON-14 — one file gives two answers for whether absence answers a negative gate

- **Severity:** Medium
- **Description:** `unboundPositiveReads` treats absence as answering `x != true` while `gateAnswer` reports the same gate unbound, and both functions are live on different paths.
- **Classification:** Fixable
- **Location:** `src/utils/gate-liveness.ts:10-27` and `:82-84`
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### CON-15 — 54 negative gates are never eagerly bundled

- **Severity:** Medium
- **Description:** Fifty-four purely negative gates evaluate true on an empty bag yet deliver as unanswered, so their techniques are never inlined; the same intent as a `notExists` tree is answered.
- **Classification:** Fixable
- **Location:** `src/utils/gate-liveness.ts:10-27`, `collectWhenPaths`
- **Blast radius:** 1 direct caller, 1 execution flow, 1 module

### CON-16 — a loop variable lands as a projection that drops the key its own gate reads

- **Severity:** Medium
- **Description:** `current_unit` lands as a four-key object without `pipeline_mode`, so a step gate reading `current_unit.pipeline_mode` evaluates false against the bag its own preceding activity wrote.
- **Classification:** Fixable
- **Location:** `workflows/prism/activities/`, loop-variable landing against the step gate

### CON-18 — the action object is open and its target field is undocumented

- **Severity:** Medium
- **Description:** `ActionSchema` is not `.strict()`, so an unknown key inside an action strips silently, and `target` is the only field in the file carrying no description.
- **Classification:** Fixable
- **Location:** `src/schema/activity.schema.ts:26-33`

### CON-19 — `undefined` parses as a string literal

- **Severity:** Medium
- **Description:** `parseWhen('x == undefined')` succeeds and compares against the string `"undefined"`, which is what an author writes when reaching for a presence test.
- **Classification:** Fixable
- **Location:** `src/schema/when-expression.ts`, literal tokenisation

## Low Findings

### CON-01 — `variables` and `exits` are declared on the activity schema

- **Severity:** Low
- **Description:** Both keys are declared and all 122 activity files accept at every corpus revision measured; the rejection behaviour exists only on a local branch 42 commits behind.
- **Classification:** Fixed
- **Location:** `src/schema/activity.schema.ts:274` and `:289`

### CON-02 — transition-legality validation

- **Severity:** Low
- **Description:** `getValidTransitions` is absent from the mainline, and routing legality is enforced instead by failing the load on an unbound exit.
- **Classification:** Fixed
- **Location:** `src/utils/validation.ts`

### CON-03 — the routing vocabulary is read and enforced

- **Severity:** Low
- **Description:** `exits` occurs 22 times across the source tree with load-bearing reads, and the checkpoint option's `effect` object is `.strict()` and declares `exit`.
- **Classification:** Fixed
- **Location:** `src/loaders/workflow-loader.ts:577` and `src/schema/activity.schema.ts:52`

### CON-04 — the tree-to-string lowering

- **Severity:** Low
- **Description:** `conditionToString` is absent from the mainline; where it existed, five of six forms failed to re-parse, which stands as evidence the dialects were never mutually expressible.
- **Classification:** Non-issue
- **Location:** `src/loaders/workflow-loader.ts`, symbol absent on the mainline

### CON-08 — an unparseable gate fails closed without a diagnostic

- **Severity:** Low
- **Description:** `evaluateWhenExpression` returns false for a string it cannot parse, and zero of the 281 corpus gates fail, so the failure mode has no live producer.
- **Classification:** Fixable, latent
- **Location:** `src/schema/when-expression.ts:301-305`

### CON-10 — manifest warnings for unknown activities

- **Severity:** Low
- **Description:** The warning path fires only on an empty activity id set, which does not occur on the mainline.
- **Classification:** Fixed
- **Location:** `src/utils/validation.ts:235-240`

### CON-11 — CI validates the pinned corpus, not the submodule tip

- **Severity:** Low
- **Description:** The gitlink gap stands at six commits and the container serves a corpus two ahead of its image pin, yet all three pointers validate 122 of 122 with a census delta of zero.
- **Classification:** Fixable, benign
- **Location:** `.github/actions/workflows-corpus/action.yml:38-52`

### CON-13 — comparison-node fall-through in the evaluator

- **Severity:** Low
- **Description:** An unexpected comparison operator would fall through and throw, but `evalAst` is not exported and every caller routes through `parseWhen`, which emits six operators.
- **Classification:** Non-issue
- **Location:** `src/schema/when-expression.ts:270-287`

### CON-17 — the checkpoint option object is open

- **Severity:** Low
- **Description:** `CheckpointOptionSchema` is not `.strict()` at the option level, so a misspelled key there strips without a warning.
- **Classification:** Fixable
- **Location:** `src/schema/activity.schema.ts:45-53`

## Corrections Required

1. CON-06, CON-09: add a postfix presence production and an emptiness production to the `when` dialect. Postfix order is settled by the one authored instance, `target_path exists`.
2. CON-19: reserve `undefined` as a word that fails to parse, landed with the presence production rather than after it.
3. CON-14, CON-15: route the presence production to the presence bucket and exempt it from the unbound check, and adopt in `collectWhenPaths` the `!=` exclusion `unboundPositiveReads` already implements. This converts 54 gates from unanswered to answered.
4. CON-05: choose one shared numeric coercion and land it before any gate is rewritten.
5. CON-07: carry an explicit dismissibility marker, so the capability survives a change of syntax.
6. CON-09, CON-18: make `ActionSchema` a discriminated union on the verb, apply `.strict()`, and describe `target`.
7. CON-20: assert the positional rules in both Alloy models, including that a `graph` edge admits no expression.
8. CON-01 to CON-04, CON-10: draft against `origin/main`, since the findings classed Fixed describe a superseded branch.
9. Land the specification in `src/schema/`. Recorded only in `workflows/`, it is a description of the grammar rather than the grammar.

## Traceability

| Report ID | Source Artifact | Original ID | Original Severity |
|-----------|-----------------|-------------|-------------------|
| [CON-01](DEFINITIVE-FINDINGS.md#con-01--variables-and-exits-are-declared-on-the-activity-schema) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #1 | Critical |
| [CON-02](DEFINITIVE-FINDINGS.md#con-02--transition-legality-validation) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #2 | High |
| [CON-03](DEFINITIVE-FINDINGS.md#con-03--the-routing-vocabulary-is-read-and-enforced) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #3 | High |
| [CON-04](DEFINITIVE-FINDINGS.md#con-04--the-tree-to-string-lowering) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #4 | Medium |
| [CON-05](DEFINITIVE-FINDINGS.md#con-05--the-two-dialects-use-different-numeric-coercion) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #5 | Medium |
| [CON-06](DEFINITIVE-FINDINGS.md#con-06--the-string-dialect-has-no-presence-form) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #6 | Medium |
| [CON-07](DEFINITIVE-FINDINGS.md#con-07--a-checkpoints-dismissibility-is-carried-by-field-presence-not-by-syntax) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #7 | Medium |
| [CON-08](DEFINITIVE-FINDINGS.md#con-08--an-unparseable-gate-fails-closed-without-a-diagnostic) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #8 | Medium |
| [CON-09](DEFINITIVE-FINDINGS.md#con-09--actionstarget-has-a-type-that-depends-on-a-sibling-key) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #9 | Medium |
| [CON-10](DEFINITIVE-FINDINGS.md#con-10--manifest-warnings-for-unknown-activities) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #10 | Low-medium |
| [CON-11](DEFINITIVE-FINDINGS.md#con-11--ci-validates-the-pinned-corpus-not-the-submodule-tip) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #11 | High |
| [CON-12](DEFINITIVE-FINDINGS.md#con-12--the-mixed-operator-authoring-rule-has-no-evaluator-counterpart) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #12 | Low |
| [CON-13](DEFINITIVE-FINDINGS.md#con-13--comparison-node-fall-through-in-the-evaluator) | [consistency/01-structural-analysis.md](01-structural-analysis.md) | #13 | Low |
| [CON-14](DEFINITIVE-FINDINGS.md#con-14--one-file-gives-two-answers-for-whether-absence-answers-a-negative-gate) | [consistency/02-adversarial-analysis.md](02-adversarial-analysis.md) | #14 | Medium |
| [CON-15](DEFINITIVE-FINDINGS.md#con-15--54-negative-gates-are-never-eagerly-bundled) | [consistency/02-adversarial-analysis.md](02-adversarial-analysis.md) | #15 | Medium |
| [CON-16](DEFINITIVE-FINDINGS.md#con-16--a-loop-variable-lands-as-a-projection-that-drops-the-key-its-own-gate-reads) | [consistency/02-adversarial-analysis.md](02-adversarial-analysis.md) | #16 | Medium |
| [CON-17](DEFINITIVE-FINDINGS.md#con-17--the-checkpoint-option-object-is-open) | [consistency/02-adversarial-analysis.md](02-adversarial-analysis.md) | #17 | Low |
| [CON-18](DEFINITIVE-FINDINGS.md#con-18--the-action-object-is-open-and-its-target-field-is-undocumented) | [consistency/03-synthesis.md](03-synthesis.md) | #18 | Unassigned |
| [CON-19](DEFINITIVE-FINDINGS.md#con-19--undefined-parses-as-a-string-literal) | [consistency/03-synthesis.md](03-synthesis.md) | #19 | Unassigned |
| [CON-20](DEFINITIVE-FINDINGS.md#con-20--one-predicate-intent-has-five-different-availabilities-by-position) | [consistency/03-synthesis.md](03-synthesis.md) | #20 | Unassigned |
