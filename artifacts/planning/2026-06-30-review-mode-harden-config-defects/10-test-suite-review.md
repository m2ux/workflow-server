# Test Suite Review — Post-Implementation Review (#145)

**Scope:** The "tests" for definition-layer changes are the 3-layer E2E harness (`tests/e2e/`) in the server repo: definition-lint (layer 2), deterministic walk + snapshot (layer 1), robot-execution manifest (layer 3). Coverage is assessed relative to the change (diff-aware), not absolute.

## Test execution results (feature content, submodule detached at `2c2b9e94`)

| Layer | Test | Result |
|-------|------|--------|
| 2 | `definition-lint.test.ts` | **PASS** — `BASELINE_UNRESOLVED = []`; 15/15 activities reached across the policy matrix. Every new technique ref (`review-existing-feedback`, `review-test-suite` re-bind, cross-workflow `prism/structural-analysis`) resolves. |
| 1 | `workflow-e2e.test.ts` | **PASS** — all 6 policies reach `complete`, including `[review-mode]`. |
| 1 | `snapshot.test.ts` | **6 failed (expected drift)** — see finding TR-1. |
| 3 | `robot-execution.test.ts` | not re-run in isolation; snapshot drift is the governing signal for the manifest (Task 8 regenerates both with `-u`). |

## Findings

### TR-1. Snapshot baselines not yet regenerated (Major → renders High) — EXPECTED, deferred to Task 8
The committed baseline in `tests/e2e/__snapshots__/snapshot.test.ts.snap` predates the augmentations, so all 6 policy snapshots mismatch. **The diff is exactly and only the intended review-mode additions:**
- `[review-mode]` `stepsExecuted`: gains `ingest-prior-feedback` (start-work-package) and `triage-reported-failures` (validate). No other step id added or removed (verified: the set of added quoted step ids is exactly these two).
- All 6 policies' `start-work-package` `artifacts`/`artifactsWritten`: gain `prior-feedback-triage.md` / `01-prior-feedback-triage.md`.

**Why the artifact appears in standard-mode policies too (not a leak):** `get_activity` composes `artifacts[]` from the `## Outputs` of ALL step-bound techniques via `composeActivityArtifacts` (`src/tools/workflow-tools.ts`), which does **not** consult step `condition` (AP-43 — the artifact contract is the mode-independent union of step outputs). The walker's `artifactNames`/`writeArtifactStubs` mirror this. This is pre-existing behavior: the committed baseline already lists `structural-analysis.md` and `architecture-summary.md` in the `[default]` policy's `post-impl-review` artifacts even though those steps are conditionally gated. So the new artifact appearing in all policies' *declared contract* is consistent; runtime gating shows up correctly and only in `stepsExecuted`.

**Suggestion:** Regenerate with `npx vitest run tests/e2e -u` (Task 8), then diff-review to confirm only the entries above changed and no standard-mode `stepsExecuted` moved. This is planned, not a defect in the definition change set. Because it is a build/baseline failure (not a code defect), it maps to Major on the classification scale but is **dispositioned as expected regeneration**, not a routing driver for `needs_test_improvements`.

### TR-2. New techniques carry no dedicated smoke assertions beyond the manifest (Minor)
The robot-execution layer will write a stub for `prior-feedback-triage.md`, but there is no assertion that `review-existing-feedback`'s two outputs (`prior_feedback_triage`, `rating_cap`) and the reported-failure triage produce distinguishable content — the harness validates structure/wiring, not semantics (by design). **Suggestion:** none required for merge; semantic behavior of definition techniques is validated by the agent at execution time, not the E2E harness. Recorded for triage.

## Coverage assessment (diff-aware)

Every new/changed step and technique ref is exercised by the definition-lint walk and the workflow-e2e walk (both green). The wiring is fully covered. Semantic coverage (does the triage table actually cap the rating) is out of scope for the deterministic harness and is the responsibility of live agent execution — consistent with how all other techniques in this workflow are covered.

## Routing

`needs_test_improvements = false` — TR-1 is expected regeneration (planned in Task 8), TR-2 is a Minor observation with no required action for this definition-layer PR. Neither drives an automatic fix cycle in this activity; baseline regeneration is a follow-up implementation task, not a review-fix.
