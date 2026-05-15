# Test Plan — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-15
**Activity:** `plan-prepare`
**Plan reference:** [05-work-package-plan.md](05-work-package-plan.md)

---

## 1. Test scope

The work package is workflow-content only — TOON skills, activities, resources, workflow variables, and one meta operation. There are no MCP-server (`src/`) or schema (`schemas/`) edits, so the existing Vitest suite is not directly exercised. The test strategy has three tiers:

1. **Structural validation** — every edited TOON file passes the repo's validator scripts. This is the primary defence: principle #13 (Format Literacy Before Content) and principle #6 (Never Modify Upward) demand that all edits validate against the schemas, including the new variable declarations.
2. **Targeted assertion tests** — for each acceptance criterion in §9 of the work-package plan, a deterministic check confirms the edit landed in the right shape AND used the canonical schema construct (per `workflows/workflow-design/resources/01-schema-construct-inventory.md`).
3. **End-to-end smoke** — `update-pr` is invoked against PR #120's body and the new `verify-body` phase reports `body_conforms=true` with no `body_findings`.

Coverage measurement is not meaningful here (TOON content, not code). Instead, every acceptance criterion (§9 of the plan) maps to at least one test below.

---

## 2. Pre-flight baseline

Before any implementation edit lands, capture the green baseline from the same commands the implementer will rerun:

```
# from parent repo root
npm test                    # Vitest suite — expect 256 passed / 2 skipped / 0 failed
npm run typecheck           # tsc --noEmit — expect no errors

# from the workflows worktree (./workflows)
tsx scripts/validate-workflow.ts work-package
tsx scripts/validate-workflow.ts meta
tsx scripts/validate-workflow-toon.ts
```

Expected: all four commands exit 0 with no diagnostics.

---

## 3. Test cases

### Tier 1 — Structural validation (run after every TOON edit)

| TC | Command | Expected | Maps to acceptance criterion |
|---|---|---|---|
| TC-S1 | `tsx scripts/validate-workflow.ts work-package` | Exit 0; no schema errors on edited files. | All work-package edits (#1, #2, #3, #4 from the plan). |
| TC-S2 | `tsx scripts/validate-workflow.ts meta` | Exit 0; no schema errors. | #7, #9 from the plan. |
| TC-S3 | `tsx scripts/validate-workflow-toon.ts` | Exit 0; TOON parses cleanly across all workflows. | All edits. |
| TC-S4 | `npm test` (parent repo) | 256 passed / 2 skipped / 0 failed. | Confirms no spillover into server behaviour. |
| TC-S5 | `npm run typecheck` (parent repo) | No errors. | Same as TC-S4. |

### Tier 2 — Targeted assertions (per edited file)

Each assertion is a `grep` or short shell pipeline against the edited file. They are written as test cases, not as automated tests — the implementer runs them post-edit to confirm the change shape; they are also re-run at `validate` and `strategic-review`.

#### `workflows/work-package/workflow.toon` (plan #4 variable declarations + #11)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-V1 | `body_conforms` declared in `variables[]`. | `grep -nE "body_conforms" workflows/work-package/workflow.toon` | Match in `variables:` block with `type: boolean` and `defaultValue: false`. |
| TC-V2 | `body_findings` declared in `variables[]`. | `grep -nE "body_findings" workflows/work-package/workflow.toon` | Match in `variables:` block with `type: array` and `defaultValue: []`. |
| TC-V3 | `body_override_recorded` declared. | `grep -nE "body_override_recorded" workflows/work-package/workflow.toon` | Match with `type: boolean`, `defaultValue: false`. |
| TC-V4 | `submission_aborted` declared. | `grep -nE "submission_aborted" workflows/work-package/workflow.toon` | Match with `type: boolean`, `defaultValue: false`. |
| TC-V5 | `path_gating_complexity` declared. | `grep -nE "path_gating_complexity" workflows/work-package/workflow.toon` | Match with `type: string`, `defaultValue: ""`. |

#### `workflows/work-package/skills/18-update-pr.toon` (plan #1 — rules 1a + verify-body phase 1b)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-U1 | `pr-body-conformance` rule group is present as a grouped array. | `grep -nE "pr-body-conformance" workflows/work-package/skills/18-update-pr.toon` | At least one match in `rules:` block, declared as `pr-body-conformance[5]:` (grouped-array form per existing `template-selection[2]` convention). |
| TC-U2 | All five rule ids present. | Five greps for `summary-max-two-sentences`, `engineering-link-mandatory`, `issue-link-or-explicit-placeholder`, `no-commit-headings-in-changes`, `no-files-changed-list`. | One match each. |
| TC-U3 | Rule wording matches the canonical strings in plan §4.1. | Diff the rule values against the strings in `05-work-package-plan.md` §4.1. | Identical. |
| TC-U4 | `verify-body` protocol phase present. | `grep -n "verify-body" workflows/work-package/skills/18-update-pr.toon` | At least one match in `protocol:`. |
| TC-U5 | `verify-body` writes the four loop-related variables. | `grep -nE "body_conforms\|body_findings" workflows/work-package/skills/18-update-pr.toon` | Matches inside the verify-body phase body referencing the declared workflow variables. |

#### `workflows/work-package/skills/12-review-strategy.toon` (plan #2)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-R1 | New protocol phase `verify-pr-body-conformance` exists. | `grep -n "verify-pr-body-conformance" workflows/work-package/skills/12-review-strategy.toon` | At least one match. |
| TC-R2 | Five audit bullets reference each rule id from `update-pr`. | Five greps for the rule ids inside the new phase. | One match each, each in the form of an audit-framed bullet referencing `update-pr::rules.pr-body-conformance.<rule-id>`. |
| TC-R3 | Audit bullets are NOT byte-for-byte copies of the rule strings (anti-pattern 24 guard). | Diff the bullet wording in `12-review-strategy.toon` against the rule strings in `18-update-pr.toon`. | Diff is NON-empty for every rule pair — bullets are audit-framed imperatives, rule strings are declarative constraints. |
| TC-R4 | Audit bullet wording matches the canonical strings in plan §4.2. | Diff the bullet values against §4.2 of `05-work-package-plan.md`. | Identical. |
| TC-R5 | The new phase invokes `gh pr view --json body`. | `grep -n "gh pr view" workflows/work-package/skills/12-review-strategy.toon` | At least one match in the new phase. |

#### `workflows/work-package/activities/12-submit-for-review.toon` (plan #3)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-L1 | `loops[]` block with `id: verify-pr-body-rerender`. | `grep -nE "verify-pr-body-rerender" workflows/work-package/activities/12-submit-for-review.toon` | At least one match. |
| TC-L2 | Loop condition uses the canonical simple-condition form. | Read the loop's `condition` block. | `type: simple`, `variable: body_conforms`, `operator: ==`, `value: false`. |
| TC-L3 | `maxIterations: 2`. | `grep -n "maxIterations" workflows/work-package/activities/12-submit-for-review.toon` | Value `2`. |
| TC-L4 | `body-non-conformant` checkpoint defined with three options. | `grep -nE "body-non-conformant" workflows/work-package/activities/12-submit-for-review.toon` | One match for the checkpoint id; three options visible in the file (`proceed-with-override`, `provide-input`, `abort`). |
| TC-L5 | Checkpoint is blocking. | `grep -nE "blocking: true" workflows/work-package/activities/12-submit-for-review.toon` near the checkpoint definition. | Present for `body-non-conformant`. |
| TC-L6 | Each option carries an explicit `effect` per §5 of the plan. | Read each option's `effect:` block. | `proceed-with-override` has `setVariable: { body_conforms: true, body_override_recorded: true }`; `provide-input` has `setVariable: { body_conforms: false }` plus `transitionTo`; `abort` has `transitionTo: complete` plus `setVariable: { submission_aborted: true }`. |

#### `workflows/work-package/resources/12-pr-description.md` (plan #4)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-P1 | Issue-skipped placeholder string is documented. | `grep -nE "Issue: skipped\|issue_skipped" workflows/work-package/resources/12-pr-description.md` | At least one match describing the `🐛 _Issue: skipped_` rendering. |
| TC-P2 | No other content removed. | `diff` the rest of the file against the pre-edit baseline (saved to `/tmp/pr-description.before.md` before editing). | Only the new placeholder section added. |

#### `workflows/work-package/activities/01-start-work-package.toon` (plan #5)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-G1 | `verify-signing-precondition` step exists. | `grep -nE "verify-signing-precondition" workflows/work-package/activities/01-start-work-package.toon` | At least one match. |
| TC-G2 | Six `validate` actions present in the step. | Count `action: validate` entries within the step body. | Six. |
| TC-G3 | Step sequenced after `analyze-reference-with-gitnexus` and before `derive-branch-name`. | Read the steps[] array and confirm ordering. | New step appears between the two referenced steps. |

#### `workflows/work-package/activities/06-plan-prepare.toon` (plan #6)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-E1 | `env-prerequisites` step exists at position 1 (first step in `steps[]`). | Read the file and confirm. | Step id `env-prerequisites` is `steps[0]`. |
| TC-E2 | Six `validate` actions inside the step. | Count. | Six. |
| TC-E3 | Prerequisites covered: workflows worktree, target_path, reference_path, planning_folder_path writable, gh auth, GPG agent. | Read the action descriptions. | Each is present. |

#### `workflows/meta/skills/00-workflow-engine.toon` (plan #7)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-M1 | `list-workflows` operation body no longer references `workflow-server.list_workflows`. | `grep -nE "workflow-server.list_workflows\|list_workflows" workflows/meta/skills/00-workflow-engine.toon` | Zero matches in the operation body (only the operation NAME `list-workflows` may match). |
| TC-M2 | Operation procedure uses `Read` or `Glob`. | `grep -nE "Read\|Glob" workflows/meta/skills/00-workflow-engine.toon` | At least one match inside the operation body. |
| TC-M3 | Activity-side `operations[]` ref still names `workflow-engine::list-workflows`. | `grep -n "workflow-engine::list-workflows" workflows/meta/activities/00-discover-session.toon` | Unchanged from baseline. |

#### `workflows/work-package/activities/02-design-philosophy.toon` (plan #9, #10)

| TC | Check | Command | Expected |
|---|---|---|---|
| TC-D1 | A `set` action before `classification-confirmed` writes `problem_type`. | Read the steps[] array; confirm a `set` action targeting `problem_type` precedes the checkpoint. | Present, with canonical `action: set` form. |
| TC-D2 | A `set` action before `classification-confirmed` writes `complexity` (substantive). | Same as TC-D1 for `complexity`. | Present. |
| TC-D3 | `workflow-path-selected` checkpoint's `skip-optional` option's `effect.setVariable` writes to `path_gating_complexity`, NOT `complexity`. | Read the checkpoint options; confirm effects do not overwrite the substantive `complexity`. | Effect writes to `path_gating_complexity`; substantive `complexity` is preserved. |
| TC-D4 | Any downstream transition/decision currently keyed on `complexity` for path-gating purposes is repointed at `path_gating_complexity`. | Grep `02-design-philosophy.toon` and all activities downstream of it for `complexity` references; classify each as substantive (kept) or path-gating (repointed). | Every path-gating reference reads `path_gating_complexity`; substantive references continue to read `complexity`. |

### Tier 3 — End-to-end smoke (post-implementation)

| TC | Procedure | Expected |
|---|---|---|
| TC-Z1 | After all Tier 1 edits land, manually re-invoke the `update-pr` skill against PR #120's body. | The new `verify-body` phase reports `body_conforms=true`, `body_findings=[]`. |
| TC-Z2 | Manually mutate PR #120's body to deliberately fail one rule (e.g., paste a commit-message-styled heading into Changes). Re-run `verify-body`. | `body_conforms=false`; `body_findings` includes the `no-commit-headings-in-changes` rule id. |
| TC-Z3 | Simulate `submit-for-review` loop: trigger `body_conforms=false`. | Loop iterates once (matches `maxIterations: 2` — one initial + one rerender), then yields `body-non-conformant` checkpoint with three options. |
| TC-Z4 | Run `strategic-review` against PR #120's (corrected) body. | New `verify-pr-body-conformance` phase passes all five checklist items. |

TC-Z3 and TC-Z4 are integration tests; they require the new TOON to be active in the running MCP server. The implementer runs them at `validate` and `strategic-review`.

---

## 4. Coverage map (acceptance criterion → tests)

From plan §9 (renumbered after the principles audit):

| Criterion | Covered by |
|---|---|
| 1. Five rules in §4.1 exist verbatim in `18-update-pr.toon` (grouped-array form). | TC-U1, TC-U2, TC-U3. |
| 2. Audit bullets (§4.2) in `12-review-strategy.toon`, audit-framed, NOT verbatim rule copies. | TC-R1, TC-R2, TC-R3, TC-R4. |
| 3. `submit-for-review` has loops + checkpoint with explicit effects. | TC-L1, TC-L2, TC-L3, TC-L4, TC-L5, TC-L6. |
| 4. Four new workflow variables declared (`body_conforms`, `body_findings`, `body_override_recorded`, `submission_aborted`). | TC-V1, TC-V2, TC-V3, TC-V4. |
| 5. Resource 12 issue-skipped placeholder (additive). | TC-P1, TC-P2. |
| 6. `start-work-package` signing pre-check (6 validate actions). | TC-G1, TC-G2, TC-G3. |
| 7. `plan-prepare` env-prerequisites (6 validate actions). | TC-E1, TC-E2, TC-E3. |
| 8. `meta/list-workflows` rewrite preserves external contract. | TC-M1, TC-M2, TC-M3. |
| 9. `design-philosophy` §4.1 `set` actions before `classification-confirmed`. | TC-D1, TC-D2. |
| 10. `design-philosophy` §4.3 effect retargeted to `path_gating_complexity`; substantive `complexity` preserved. | TC-D3, TC-D4. |
| 11. `path_gating_complexity` variable declared. | TC-V5. |
| 12. Schema validators all exit 0. | TC-S1, TC-S2, TC-S3. |
| 13. Smoke run of `update-pr` against PR #120 succeeds. | TC-Z1 (and TC-Z2, TC-Z3, TC-Z4 for negative cases). |

---

## 5. Regression risk

The edits are additive — new rules, new phases, new steps, new loops, new variables — with three exceptions:

1. **`meta/list-workflows` operation body rewrite.** Existing callers (only `meta/discover-session::list-available-workflows`) continue to invoke the same operation name. The external contract (returns `{id, title, description, tags}` per workflow) is preserved. Regression risk is whether the harness `Read`+`Glob` primitives produce equivalent output to the server-side `list_workflows` tool. Mitigated by TC-M3 (activity-side ref unchanged) and the manual run during `implement`.
2. **`design-philosophy` substantive `complexity` preservation.** Existing transitions that branch on `complexity` (e.g., to skip optional activities) need the path-gating concern carved off cleanly to the new `path_gating_complexity` variable. Mitigated by TC-D3 and TC-D4 plus a deliberate audit during `implement` of every site that reads `complexity` — substantive references stay, path-gating references are repointed.
3. **Variable additions in `work-package/workflow.toon`.** Adding five new variables to the workflow's `variables[]` block is additive at the schema level, but each new variable is referenced from at least one downstream condition or effect (loop condition, checkpoint effect, set action). Mitigated by TC-V1 through TC-V5 plus the schema validators (TC-S1/TC-S2) — a referenced-but-undeclared variable is a validator failure.

No other regression vector. Resource 12, the rules, the verify phase, and the new loops are all consumed only by the workflows they edit.

---

## 6. Out of test-plan scope

- No new Vitest tests for server source (no server source edits).
- No performance tests (workflow-content edits do not change server behaviour).
- No new schema tests (no schema edits).
- No CI lint test (Q9 — out of scope).
- The Tier 3 smoke runs (TC-Z2, TC-Z3) are described but executed manually at `validate` / `strategic-review`; they are not automated.

---

## 7. Sign-off

When the test plan passes:
- All Tier 1 commands exit 0.
- All Tier 2 assertions match expected.
- TC-Z1 reports `body_conforms=true`.
- TC-Z2, TC-Z3, TC-Z4 confirm the failure-path behaviour.

`validate` activity will rerun Tier 1 and TC-Z1; `strategic-review` will rerun TC-Z4.
