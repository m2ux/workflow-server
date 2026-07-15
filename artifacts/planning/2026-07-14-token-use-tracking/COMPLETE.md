# Token Use Tracking and Cost Estimation — Complete

> Feature · branch `feat/232-token-use-tracking-and-cost-estimation` · PR [#233](https://github.com/m2ux/workflow-server/pull/233) · 2026-07-15

## Summary

Adds per-activity and per-workflow token-use tracking and cost estimation to the workflow-server: an optional Zod-validated `usage` param on `next_activity` captures harness-relayed native usage at the activity transition seam, persists it in `session.json` (`usage_recorded` events + rolled-up `usage` field), and estimates USD cost from a versioned config price table with graceful degradation for missing figures and unknown models. Child workflow usage folds into the parent total at completion via in-tree traversal. See the [implementation plan](06-work-package-plan.md).

## Results

- Validation: unit and schema tests green (83 related tests per [lean change](09-lean-change.md)); PR233 integration tests in `mcp-server.test.ts` require a `workflows` worktree — see [test suite review](10-test-suite-review.md). Typecheck and build clean on commit `92536815`.
- Success criteria: 4 of 6 met on the server PR; 2 depend on corpus follow-up (SC-1 completion renderer, SC-5 child roll-up E2E) — see divergences below.
  | Criterion | Target | Actual |
  |---|---|---|
  | SC-1 | `NN-token-usage.md` + README summary from automated completion path | Server persistence ready; corpus Tasks 7–8 (orchestrator populate + completion renderer) not yet landed — [14-token-usage.md](14-token-usage.md) written manually for this run |
  | SC-5 | Parent roll-up includes dispatched child usage in E2E | Covered by unit test [sumUsageTree](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L92); dedicated integration test not yet added |
- Files changed: 13 files, +757 / −6 — see [change-block index](10-change-block-index.md).
- Design decisions: recorded in [ADR-0006](../../adr/0006-agent-relayed-token-usage-at-activity-transition.md), the [plan](06-work-package-plan.md), and [assumptions log](02-assumptions-log.md).

## Deferred Items

Deferred items: [register](deferred-items.md) — 1 open (DI-2 finer attribution), plus corpus Tasks 7–8 tracked in plan §Requires.

## Known Limitations

- **Two-surface delivery** — Server source (PR #233) and workflow corpus changes (Tasks 7–8: orchestrator populate instruction + completion renderer) are separate deliverables. Merging #233 alone makes the `usage` param available but inert until the corpus instructs the orchestrator to relay usage.
- **No usage relayed during this work-package run** — The orchestrator did not pass `usage` on `next_activity` calls (no `usage` field in session state). Graceful omission per SC-6; see [14-token-usage.md](14-token-usage.md).
- **Anthropic-seeded price table** — Cost estimates use published Claude rates and derived cache multipliers; other model families degrade to `cost_usd: null`. Non-blocking for v1 ([09-code-review](09-code-review.md) CR-1/CR-2, [12-strategic-review](12-strategic-review.md) SR-4).
- **PR not merged** — #233 is approved and mergeable; ADR status remains Proposed until merge. Update this document and README status after merge.

## Lessons Learned

- Sequencing server-first with explicit corpus Tasks 7–8 as load-bearing follow-ups prevents the false impression that SC-1 is done when only persistence exists.
- Integration tests that depend on the `workflows` git worktree fail opaquely when the worktree is absent — CI and local validation should treat the worktree as a hard prerequisite ([10-test-suite-review](10-test-suite-review.md) TR-1).

## Workflow Retrospective

[messages: ~18 checkpoint gates, multiple substantive steering turns · session quality: Minor friction]

### Observations

- [process] `plan-prepare` re-entered three times after the approach-confirmed checkpoint — the workflow correctly preserved checkpoint state, but the re-entry added ceremony without a visible plan revision trigger in session history. Root cause: orchestrator re-dispatch after session interruption, not a workflow defect.
- [process] Research convergence answered `request-more` twice before context-scope and assumption-interview checkpoints — appropriate for a complex architectural unknown (DI-1 channel), but extended the research phase.
- [checkpoint] All 18 checkpoints resolved with explicit user selections; no default-only resolutions. Submit-for-review ended `approved` with no change requests.
- [anomaly] Close-out runs against a server build that ships `usage` capture, but this session's orchestrator never populated the param — the feature cannot dogfood its own completion renderer until corpus Task 7 lands (same pattern as inspect_session close-out before merge).

### Recommendations

1. **Medium:** When a work package spans server + corpus repos, record both PRs as first-class deliverables at plan-prepare so close-out does not treat corpus gaps as surprises ([plan-prepare] / deferred-items).
2. **Low:** Document `workflows` worktree as a validation prerequisite in the test plan Running Tests section ([finalize-test-plan] / [10-test-suite-review](10-test-suite-review.md) TR-1).

**Key takeaway:** The run delivered a focused server implementation with clean review outcomes; the main gap is the expected corpus follow-up, not code quality.
**Action required:** no — corpus Tasks 7–8 are tracked in the plan; open a workflows PR when ready.
