# Test Suite Review — Address Docs-Refresh Retrospective Issues

**Date:** 2026-05-18
**Activity:** `post-impl-review`
**Diff base:** `97be373`
**Diff HEAD:** `9be34eb`
**Test plan:** [05-test-plan.md](05-test-plan.md)

Severity legend: **Critical** / **Major** / **Minor** / **Nit** / **Informational**.

This work package is workflow-content only. There is no compiled application code being changed, so there are no unit tests in the conventional sense. The "test suite" is three schema-validator scripts plus targeted greps. This review covers (a) validator status, (b) test-plan / implementation consistency, (c) gaps surfaced by the un-retracted touch site 9.

---

## 1. Validator status

| Command | Result | Date |
|---|---|---|
| `npx tsx scripts/validate-workflow-toon.ts workflows/work-package` | PASS — 14 activities, 25 skills | 2026-05-18 (HEAD `9be34eb`) |
| `npx tsx scripts/validate-workflow-toon.ts workflows/meta` | PASS — 5 activities, 8 skills | 2026-05-18 (HEAD `9be34eb`) |
| `npx tsx scripts/validate-activities.ts workflows/work-package` | PASS — 14/14 | 2026-05-18 (HEAD `9be34eb`) |

Plan §9.16 (acceptance criterion 16): MET.

The repo also exposes `npx tsx scripts/validate-toon.ts` and `npx tsx scripts/validate-workflow-state.ts` (mentioned in `scripts/`). They were not part of the test plan and were not re-run here; the three above are the authoritative gate.

---

## 2. Test-plan / implementation consistency

The test plan was written at `plan-prepare` with the §9 acceptance-criteria set numbered 1–13 (test plan §4 coverage map). The plan was subsequently expanded at `assumptions-review` / pre-implement to 17 criteria (the un-retraction of bootstrap obs §4.2 added criteria 12–15 for touch site 9, and §9.16/§9.17 split out validators/smoke). The test plan §4 coverage map was **not** updated to match.

### 2.1 Coverage gaps for the un-retracted touch site 9

| Criterion | Subject | Test plan coverage | Gap |
|---|---|---|---|
| §9.12 | `harness-compat::spawn-agent.rules.depth-1-only` named rule present | None | No `grep` test; the rule's presence is verified only by the structural-validation tier passing (TC-S2). A targeted grep would explicitly assert it. |
| §9.13 | Three operations deleted from `meta/skills/00-workflow-engine.toon`; no remaining callers | None | The criterion itself prescribes a grep. The test plan does not include it as a TC entry. |
| §9.14 | `handle-sub-workflow.procedure` is a single `dispatch_child` bullet; `output` unchanged | None | No targeted test; only structural validation. |
| §9.15 | `dispatch-client-workflow.operations[]` lists the five workflow-engine ops; no deprecated refs at activity level | None | The criterion prescribes a grep for absence of `spawn-agent`/`continue-agent`/etc. at activity level. Not enumerated in test plan. |

**Severity:** **Major** (Gap-1). Four acceptance criteria have no test-plan coverage. They are not untested in practice — the schema validators caught structural errors during implement, and the criteria are met per the code review. But the test plan is now inconsistent with the implemented scope.

**Recommendation:** Extend test plan §3 with a "Tier 2 — Targeted assertions: `meta/skills/00-workflow-engine.toon` (touch site 9 deletion checks)" subsection. Add:

- `TC-MD1` — three greps for the deleted operation names; expect zero matches in any TOON file under `workflows/meta/`.
- `TC-MD2` — grep for `handle-sub-workflow:` and confirm the operation's `procedure` block contains exactly one bullet.
- `TC-MD3` — grep `dispatch-client-workflow.toon` for the five required operation names; expect five matches.
- `TC-MD4` — grep `dispatch-client-workflow.toon` for `spawn-agent`/`continue-agent`/`compose-prompt`/`extract-checkpoint-handle`/`handle-workflow-complete` at the activity level; expect zero matches.
- `TC-MD5` — grep `harness-compat.toon::spawn-agent.rules` for `depth-1-only`; expect one match.

These are reproducible structural checks; each is a one-liner.

### 2.2 Smoke test (TC-Z1/Z2/Z3/Z4) and PR #120 status

The test plan §3 Tier 3 entries depend on PR #120 being a live PR. PR #120 is currently CLOSED on GitHub. The smoke test cannot run as written.

**Severity:** **Minor** (Gap-2).

**Recommendation:** Either (a) re-open PR #120 for the smoke, (b) re-target the smoke at a different live PR (e.g., the work package's own PR if/when created), or (c) document in `validate` that smoke runs are deferred until a live PR is available. Note that this gap blocks acceptance criterion §9.17 (manual smoke).

### 2.3 Test plan §4 coverage map still numbered 1-13

The test plan §4 ("Coverage map") maps tests to criteria 1-13. Criteria 14 (smoke), now §9.17, is partially covered by TC-Z1; criteria 12-15 of the current §9 numbering (touch site 9) are uncovered as called out above.

**Severity:** **Minor** (Gap-3). Same fix as Gap-1 — the §4 table needs to grow to 17 rows.

### 2.4 Description-hygiene anti-patterns (AP-36 / AP-37) were not in the test plan

`5d9ce9c` landed AP-36 and AP-37 as durable anti-patterns. The cleanup commits (`cf18f6c`, `ffc03cd`) then applied them across the workflow. None of this is covered in the test plan because the test plan predates both the anti-patterns and the cleanup.

**Severity:** **Minor** (Gap-4) — the cleanup is verified by inspection in the code review, not by automated test.

**Recommendation:** A future iteration of the test suite could add a structural lint that walks workflow TOON descriptions and flags AP-36 patterns (e.g., regex for "interpolated into", "consumed by", "drives", "without X"). This is a longer-term tooling change, not a blocker for this work package.

---

## 3. Test-plan compliance check for the criteria that ARE covered

Validating that the named TC entries actually pass against the current implementation:

| TC | Subject | Result |
|---|---|---|
| TC-S1 | `validate-workflow-toon.ts work-package` | PASS |
| TC-S2 | `validate-workflow-toon.ts meta` | PASS |
| TC-S3 | TOON parsing across all workflows | PASS (subsumed by S1+S2) |
| TC-S4 | `npm test` parent repo | NOT RE-RUN — no parent-source changes. Acceptable per plan §5 regression analysis. |
| TC-S5 | `npm run typecheck` parent repo | NOT RE-RUN — same as TC-S4. |
| TC-V1-V5 | Five new variable declarations in `workflow.toon` | PASS — all five present with correct types and defaults. |
| TC-U1 | `pr-body-conformance` grouped-array present | PASS |
| TC-U2 | All five rule ids present | PASS |
| TC-U3 | Rule wording matches plan §4.1 | PASS |
| TC-U4 | `verify-body` protocol phase present | PASS |
| TC-U5 | `verify-body` references `body_conforms`/`body_findings` | PASS |
| TC-R1 | `verify-pr-body-conformance` phase exists | PASS |
| TC-R2 | Five audit bullets reference each rule id | **FAIL** — see Major-1 in `06-code-review.md`. The phase no longer hosts five bullets per rule; it delegates to `update-pr::protocol.verify-body`. |
| TC-R3 | Audit bullets NOT byte-for-byte copies of rule strings (AP-24) | PASS in principle (there are no bullets to compare) but the test's premise has changed. |
| TC-R4 | Audit bullets match plan §4.2 verbatim | **FAIL** — the bullets are not present. |
| TC-R5 | Phase invokes `gh pr view --json body` | PASS |
| TC-L1 | `loops[]` with `id: verify-pr-body-rerender` | PASS |
| TC-L2 | Loop condition canonical simple-condition form | PASS |
| TC-L3 | `maxIterations: 2` | PASS |
| TC-L4 | `body-non-conformant` checkpoint with three options | PASS |
| TC-L5 | Checkpoint is `blocking: true` | PASS |
| TC-L6 | Each option has explicit `effect` per §5 | PASS |
| TC-P1 | Issue-skipped placeholder documented | PASS |
| TC-P2 | No other content removed from resource 12 | PASS (additive diff only) |
| TC-G1 | `verify-signing-precondition` step exists | PASS |
| TC-G2 | Six `validate` actions in the step | **FAIL** — see Major-2 in `06-code-review.md`. The step has 1 `validate`, not 6. |
| TC-G3 | Step sequenced between `analyze-reference-with-gitnexus` and `derive-branch-name` | PASS (placement is correct; only the action count changed) |
| TC-E1 | `env-prerequisites` is `steps[0]` | PASS |
| TC-E2 | Six `validate` actions inside the step | PASS |
| TC-E3 | All six prerequisites covered | PASS |
| TC-M1 | `list-workflows` operation no longer references `workflow-server.list_workflows` | **FAIL** — see Critical-1 in `06-code-review.md`. The body was reverted in `cf18f6c`. |
| TC-M2 | Operation procedure uses `Read`/`Glob` | **FAIL** — reverted to `Call list_workflows`. |
| TC-M3 | Activity-side `operations[]` ref unchanged | PASS |
| TC-D1 | `set` action writes `problem_type` before checkpoint | PASS |
| TC-D2 | `set` action writes `complexity` before checkpoint | PASS |
| TC-D3 | `skip-optional.effect.setVariable` writes `path_gating_complexity` | PASS |
| TC-D4 | Downstream path-gating refs repointed | PARTIAL — `skip-optional` retargeted; other options keep `complexity` writes (see Minor-1 in code review). |

**Summary:** 33 of 40 test cases pass; 4 fail (TC-R2, TC-R4, TC-G2, TC-M1, TC-M2 — 5 fails); 1 partial (TC-D4); 2 not re-run (TC-S4, TC-S5).

Each failure maps to a code-review finding. The fails are not test-suite defects — they correctly identify implementation deviations from the plan. They are working as intended.

---

## 4. Test quality assessment

The test plan is straightforward — a mix of schema validators and grep assertions. No code, so no anti-patterns from typical test-quality reviews (over-mocking, snapshot abuse, etc.). Three observations:

### 4.1 No negative cases for §9.6 / §9.7 validate actions

The `validate` actions on `verify-signing-precondition` and `env-prerequisites` are pre-conditions that the workflow asserts at runtime. There is no test that exercises the failure path (e.g., simulate `gh.auth.status != 0` and confirm the workflow halts with the expected message). This is by design — the workflow-server harness doesn't run real validates during plan-prepare's tests; the validation happens at activity entry.

**Severity:** Nit. Acceptable for workflow-content tests.

### 4.2 No coverage for the §9.15 activity-loop semantics

The rewritten `dispatch-client-workflow.toon` uses an inline `while` loop driven by `current_activity != null`. There is no test that exercises the loop's behaviour with a real client workflow. The schema validators confirm structural correctness; behavioural correctness depends on a meta orchestrator picking up the new activity and driving a child to completion.

**Severity:** Major (Gap-5). This is the most behaviourally complex change in the work package and the one with the highest blast radius (every future meta-dispatched workflow goes through this activity). No automated coverage.

**Recommendation:** Add a smoke test at `validate`: dispatch a trivial test workflow via the new `dispatch-client-workflow` shape and confirm it reaches `workflow_complete`. Even a one-activity child workflow would suffice. This is the highest-value test gap in the package.

### 4.3 No regression suite for prose-cleanup changes

`cf18f6c` rewrote descriptions across 8 files. There is no automated check that the rewritten descriptions still convey enough information — only the schema validators ran. The code review's "did anything load-bearing get lost?" question is inspection-only.

**Severity:** Minor (Gap-6). Acceptable trade-off — the alternative would be a snapshot test of every description, which is brittle. Inspection in the change-block index + code review is the canonical safeguard.

---

## 5. Recommendations

1. **Major (Gap-1):** Add five test cases (TC-MD1 through TC-MD5) covering criteria §9.12–§9.15. One-liner greps each; extend test plan §3 Tier 2 with a `meta/skills/00-workflow-engine.toon` subsection and a `meta/activities/03-dispatch-client-workflow.toon` subsection.
2. **Major (Gap-5):** Add a smoke procedure for the rewritten `dispatch-client-workflow` activity at `validate`. Reach `workflow_complete` on at least one trivial client workflow under the new shape before declaring §9.15 fully validated.
3. **Minor (Gap-2):** Resolve PR #120 status — either re-open, re-target the smoke at the work package's own PR, or document deferral. Acceptance criterion §9.17 hinges on this.
4. **Minor (Gap-3):** Extend test plan §4 coverage map to 17 rows matching the plan §9.
5. **Minor (Gap-4):** Consider a lint pass for AP-36/AP-37 in a future tooling iteration. Not a blocker.
6. **Nit (4.1):** Accept that runtime `validate` actions are not unit-tested. The pre-condition gating is enforced by the harness, not the test suite.

---

## 6. Severity summary

| Severity | Count | Findings |
|---|---|---|
| Critical | 0 | — |
| Major | 2 | Gap-1 (test-plan coverage missing for §9.12–§9.15), Gap-5 (no smoke for new activity-loop shape) |
| Minor | 4 | Gap-2 (PR #120 closed), Gap-3 (test plan §4 still numbered 1-13), Gap-4 (no AP-36/37 lint), 4.3 (no regression suite for prose cleanup) |
| Nit | 1 | 4.1 (validates have no negative cases) |
| Informational | 0 | — |

**Per activity step "classify-and-route-findings":**
- `needs_test_improvements = true` (Major-1 and Major-5 are quality-gate failures for the test plan itself).
- The review-fix-cycle loop should run if the orchestrator routes test-suite fixes back to implement. The fixes are mostly test-plan edits, not test-code edits, so they may be folded into a single follow-up commit instead of a full re-implement cycle.
