# Number conversion disagreement

#528 W4. Every later predicate rewrite reads this list. A rewrite that
changes how a non-number becomes a number flips a gate on these sites
and produces no signal.

The string dialect (`when`) converts an ordering operand with
`Number()` when the value is not already a number. The tree dialect
(`condition`) accepts only a number or a finite numeric string. Equality
(`==`, `!=`), presence (`exists`, `notExists`), and bare-name truthiness
do not use either conversion.

## What later rewrites read

**25 live ordering leaves, all of them.** Each leaf’s answer changes
under one conversion for at least one JSON bag value. All 25 compare a
`number`-typed variable to an integer. None of them change answer on a
type-legal JSON number, and none change answer on the declared default
(every default is `0`).

The 76 array-typed and 47 object-typed declarations in the live corpus
do not appear on an ordering leaf. Specimen workflows contribute 0
ordering leaves.

A rewrite is answer-preserving on a type-honoring bag — a finite JSON
number in the compared variable. Type validation is warn-only: a
boolean, `null`, or array can still be stored, and those are the values
that flip the 25.

Two operator families cover the set:

| Family | Leaves | JSON values that flip the answer |
|---|---|---|
| `> 0` | 23 | `true`, `[5]` |
| `< 3` | 2 | `true`, `false`, `null`, `[]` |

`Number(true)` is 1, `Number(null)` and `Number([])` are 0,
`Number([5])` is 5, `Number(false)` is 0. The tree conversion yields no
number for any of those, so the comparison is false.

No live site carries both dialects on the same step, so the
and-combination that masks a disagreement has no live subject.

## The list

| Workflow | Site | Position | Dialect | Leaf | JSON probes that flip |
|---|---|---|---|---|---|
| codebase-wiki | lint-findings-confirmed | checkpoint.condition | condition | `lint_findings_count > 0` | true, [5] |
| plain-language | evaluation-gate | checkpoint.condition | condition | `open_issue_count > 0` | true, [5] |
| requirements-refinement | correctable | exits[].when | when | `correction_iteration < 3` | true, false, null, [] |
| workflow-authoring | judgements-disposition | checkpoint.condition | condition | `open_judgements_count > 0` | true, [5] |
| workflow-authoring | record-judgement-outcomes | step.when | when | `open_judgements_count > 0` | true, [5] |
| workflow-authoring | impact-approved | checkpoint.condition | condition | `removal_count > 0` | true, [5] |
| workflow-authoring | author-fixes | step.when | when | `remediation_round > 0` | true, [5] |
| workflow-authoring | record-fixes | step.when | when | `remediation_round > 0` | true, [5] |
| workflow-authoring | inventory-remediation-removals | step.when | when | `remediation_round > 0` | true, [5] |
| workflow-authoring | audit-disposition#{remediation_round} | checkpoint.condition | condition | `open_finding_count > 0` | true, [5] |
| workflow-authoring | remediation-selected | exits[].when | when | `remediation_round < 3` | true, false, null, [] |
| workflow-design | impact-and-preservation-confirmed | checkpoint.condition | condition | `removal_count > 0` | true, [5] |
| workflow-design | persist-expressiveness-findings | step.when | when | `expressiveness_finding_count > 0` | true, [5] |
| workflow-design | expressiveness-findings-flagged | step.when | when | `expressiveness_finding_count > 0` | true, [5] |
| workflow-design | persist-conformance-findings | step.when | when | `conformance_finding_count > 0` | true, [5] |
| workflow-design | conformance-findings-flagged | step.when | when | `conformance_finding_count > 0` | true, [5] |
| workflow-design | persist-rule-hygiene-findings | step.when | when | `rule_hygiene_finding_count > 0` | true, [5] |
| workflow-design | rule-hygiene-findings-flagged | step.when | when | `rule_hygiene_finding_count > 0` | true, [5] |
| workflow-design | persist-enforcement-findings | step.when | when | `enforcement_finding_count > 0` | true, [5] |
| workflow-design | enforcement-findings-flagged | step.when | when | `enforcement_finding_count > 0` | true, [5] |
| workflow-design | validation-passed | checkpoint.condition | condition | `fail_count > 0` | true, [5] |
| workflow-design | scope-verified | checkpoint.condition | condition | `unaddressed_count > 0` | true, [5] |
| workflow-design | persist-post-expressiveness | step.when | when | `expressiveness_finding_count > 0` | true, [5] |
| workflow-design | persist-post-conformance | step.when | when | `conformance_finding_count > 0` | true, [5] |
| workflow-design | classify-post-update-fixes | step.when | when | `review_findings_count > 0` | true, [5] |

Fourteen variables, each declared `number` with default `0`. Positions:
17 `when` (15 step gates, 2 exits), 8 `condition` (all checkpoints).

Machine-readable rows, including the home of each type declaration:
[inventory.json](inventory.json).

## Method

From the repo root, against `.worktrees/workflows` (or `--root` /
`WORKFLOWS_DIR`):

```
npx tsx .engineering/artifacts/planning/2026-09-12-number-conversion-disagreement/measure.ts
```

The walk visits every activity YAML under every workflow the server
loads. It collects every `when` string and every `condition` tree at
step gates, exits, checkpoints, and actions. Ordering leaves are `>`,
`<`, `>=`, and `<=`. Each leaf is evaluated under both conversions
against a fixed JSON probe set (`true`, `false`, `null`, `[]`, `[5]`,
`{}`, `""`, `"0"`, `"1"`, `"abc"`, `0`, `1`). A leaf is on the list
when the two answers differ.

The earlier probe run (5 of 13 predicates, written both ways) used
synthetic bags. This list is that measurement on the live corpus.

## Census the walk refreshed

| Quantity | Earlier figure | This walk |
|---|---|---|
| Variable declarations | 657 (95 list, 50 object) | **597** (76 array, 47 object, 34 number, 145 boolean, 272 string, 23 undeclared) |
| `when` sites | 281 | **307** |
| `condition` sites | 109 | **94** |
| Ordering leaves | — | **25** |
| Dual-dialect steps | — | **0** |

## What this list does not close

The runner specification’s REQ-NF035 names a different disagreement:
two collectors that treat an absent value differently, which blocks the
missing-value rule. This folder is the Number() / toNumber() rewrite
gate. It does not reconcile those collectors.

## Out of scope

Unifying the two conversions. Rewriting any predicate. A CI gate or
threshold. Equality, presence, and truthiness leaves.
