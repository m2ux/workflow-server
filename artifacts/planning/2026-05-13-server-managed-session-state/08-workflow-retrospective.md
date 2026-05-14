# Workflow Retrospective: Server-Managed Session State

**Date:** 2026-05-14
**Work Package:** Server-managed session state with workspace-aware MCP server (issue [#115](https://github.com/m2ux/workflow-server/issues/115))
**PR:** [#116](https://github.com/m2ux/workflow-server/pull/116) (approved)
**Companion PR:** [#117](https://github.com/m2ux/workflow-server/pull/117) (workflows side)

---

## Session Analysis

This retrospective draws from observable artefacts of the session: the workflow-state history, the planning folder, commit history on `feat/115-server-managed-session-state`, the four review-feedback resolutions recorded in `12-submit-for-review.md`, and the three Informational findings in `11-strategic-review.md`. Direct counts of "user messages" or "checkpoint responses" are summarised from `workflow-state.json` where present.

**Checkpoint responses recorded in workflow-state.json:**

| Activity / step | Checkpoint | Resolution |
|-----------------|------------|------------|
| `start-work-package` | `pr-creation` | `proceed` |
| `design-philosophy` | `classification-confirmed` | `confirmed` |
| `design-philosophy` | `workflow-path-selected` | `full-workflow` |
| `requirements-elicitation` | `stakeholder-transcript` | `provide-transcript` |
| `requirements-elicitation` | `elicitation-complete` | `complete` |
| `research` | `research-findings` | `sufficient` |
| `plan-prepare` | `approach-confirmed` | `confirmed` |
| `submit-for-review` | `review-outcome` | `approved` |

**Plan revisions tracked:** one revision pass post-elicitation reclassified assumptions and added the sweep / migration / doc-freshness test cases (TC-51 .. TC-70). Recorded as `plan_drafted` at 2026-05-13 18:08 and `plan_revised` at 18:23.

**Implementation phases:** 10 (Phases 1–7 + 8.1–8.3 + 10.1–10.3), each landing as one commit on the feature branch (plus planning-bump commits between phases).

**Review feedback items:** 4 — all addressed inline before transition back to `complete`.

**Strategic-review findings:** 0 critical / 0 major / 0 minor / 3 informational (non-blocking).

---

## Observations

### Review-time corrections

These were issues the workflow did not surface during implementation; they were flagged by the human reviewer and addressed inline before transitioning out of `submit-for-review`.

| # | What the workflow allowed | Reviewer's correction | Root cause | Resolution |
|---|---------------------------|-----------------------|------------|------------|
| 1 | Source and tests carried `Phase N`, `PR116-TC-XX`, `PD-N`, `SC-N` annotation comments throughout implementation; the migration fixture hardcoded this work package's actual planning folder path. | "These belong in the PR description, not in code that has to survive after merge." | The `implement` skill does not enforce a discipline of keeping planning-side cross-references out of merged source; the test plan's `PR116-TC-NN` IDs were anchored as comments in test source for traceability, but the strip step before merge was not mechanised. | Commit `ad23820` stripped all such references; fixture replaced with synthetic placeholders. |
| 2 | Six session-related utility files (`session.ts`, `session-index.ts`, `session-store.ts`, `session-resolver.ts`, `migration.ts`, `crypto.ts`) sat as siblings at `src/` root. | "These are clearly one module — group them." | Module-boundary heuristics in the `implement` skill default to "place files where they will be most discoverable to a future reader of the import graph"; that heuristic does not push toward grouping when each file is independently reachable. | Commit `0af3f8c` regrouped under `src/utils/session/` with a barrel export (`index.ts`). No logic change. |
| 3 | The `workflows` submodule on the feature branch tracked the long-lived `workflows` branch, while the in-flight meta-workflow changes for #115 lived on `feat/115-server-managed-session-state-meta`. | Reviewers could not see the matched workflow changes from the parent-repo PR. | The `start-work-package` and `plan-prepare` skills do not include a "submodule branching plan" step that surfaces cross-repo refactors at branch-creation time. | Workflows PR #117 opened; parent `.gitmodules` retargeted (`4f35aea`). Marked to revert post-merge. |
| 4 | The parent repo's `.gitmodules` declared `branch = workflows` for the workflows submodule but did not update with the feature-branch tracking until the reviewer flagged it. | A fresh clone would have checked out workflows from the wrong ref. | Same root cause as #3 — no "submodule branching plan" step. | Captured in same commit as #3 (`4f35aea`). |

### Activity-flow signals

| # | Signal | Source | Workflow observation |
|---|--------|--------|----------------------|
| 1 | Plan-revision needed after elicitation to add sweep + migration + doc-freshness test cases (`PR116-TC-51 .. TC-70`). | `workflow-state.json` history events `plan_drafted` (18:08) followed by `plan_revised` (18:23). | The `create-plan` skill produced a first draft that did not yet include Phase 10's sweep tests or the back-compat error test (TC-60). The user surfaced this gap on first review, and the plan was revised. This is healthy iteration — but it suggests the `create-plan` skill could include a "doc-freshness sweep" reminder for refactors that change documented APIs. |
| 2 | All 25 commits in the PR range arrived unsigned at validation time; re-signed during `strategic-review`. | `10-validation-report.md` "Commit-Signature Scan" + `11-strategic-review.md` §6.1. | The `implement` skill / underlying git config did not produce signed commits by default. Re-signing was straightforward but unnecessary friction. `strategic-review`'s `unsigned-commits` checkpoint caught it before submit-for-review. |
| 3 | Strategic-review found 3 informational items, 0 minor / major / critical. | `11-strategic-review.md` §2. | Indicates the implementation and validate activities caught everything functional. The informational items are deferred-by-design (depth threshold heuristic, enumeration cost benchmark, commit-message cosmetic). |

### Process questions / friction points (inferred from artefact lifecycle)

| # | Observation | Workflow section | Potential improvement |
|---|-------------|------------------|----------------------|
| 1 | The migration-fixture choice (real folder vs synthetic) was apparently made during implementation and reversed at review. | `implement` / `analyze-implementation` skills. | Add a "test fixture data sourcing" rule to the `create-test-plan` skill: real-data fixtures are acceptable during implementation but must be replaced with synthetic equivalents before merge. |
| 2 | The submodule branch-tracking issue was discovered at review, not at branch creation. | `start-work-package` / `manage-git::create-branch`. | When a workflow touches a submodule (detected by submodule presence in the repo + planned edits inside the submodule path), surface a checkpoint at branch creation: "this work package will edit the workflows submodule — what branch should the parent track during review?" |
| 3 | The `PR116-TC-NN` markers in source were valuable during implementation for traceability against the test plan, but had to be stripped before merge. | `implement` / `finalize-documentation`. | Standardise a marker convention (e.g., a specific comment shape like `// pkg-ref: PR116-TC-NN`) that the `finalize-documentation` skill can grep for and strip in one commit, with the strip step enforced before submit-for-review. |

---

## Improvement Recommendations

### High Priority

| # | Issue | Recommendation | Affected Section |
|---|-------|----------------|------------------|
| 1 | Planning references leaked into merged source until review caught them. | Add an explicit "strip planning annotations before submit-for-review" step (or earlier, in `validate`). The marker convention could be enforced by a doc-freshness grep similar to TC-61..TC-65. | `implement` skill rules; `validate` activity exit-actions; `finalize-documentation` skill |
| 2 | Cross-repo (parent + submodule) refactors surface the submodule-branch-tracking issue at review, not at branch creation. | When `manage-git::create-branch` is invoked and the work package's plan references edits inside a submodule path, emit a checkpoint asking which submodule branch the parent should track during review. Default: feature branch on submodule side. | `manage-git::create-branch`; `start-work-package` |

### Medium Priority

| # | Issue | Recommendation | Affected Section |
|---|-------|----------------|------------------|
| 1 | Module-boundary heuristic placed 6 related files at `src/` root rather than grouping. | Add a "group by capability" rule to the `implement` skill: when a single phase produces ≥3 new files that share a capability prefix, group them under a directory with a barrel export. | `implement` skill rules |
| 2 | Commits arrived unsigned and needed re-signing during strategic-review. | The `manage-git::commit` operation could detect missing `commit.gpgsign` and prompt at first-commit time rather than at review. | `manage-git::commit`; `implement` |
| 3 | `create-plan` first draft did not include Phase 10 sweep tests; needed a revise pass. | For refactors that change documented APIs (signal: edits inside `docs/`, `schemas/README.md`, top-level markdown), the `create-plan` skill should include a "doc-freshness sweep test bucket" reminder. | `create-plan` skill rules |

### Low Priority / Observations

| # | Observation | Consideration |
|---|-------------|---------------|
| 1 | Migration fixture used real workspace data during implementation. | Useful for "this work package's own state migrates correctly" (R1) but had to be synthesised before merge. Codify the pattern: real-data fixtures live in a separate integration test that runs locally; merged tests use synthetic fixtures. |
| 2 | Three informational findings from strategic-review (depth threshold, enumeration cost, commit-message cosmetics). | All deferred-by-design or cosmetic. Worth filing as low-priority v2 issues if they accumulate across work packages. |
| 3 | Plan-revision happened after elicitation rather than during. | One revise pass is healthy iteration; multiple revise passes would indicate a gap in `elicit-requirements` coverage. Monitor frequency. |

---

## Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Activities completed | 8 / 8 (planning) + implement + validate + strategic-review + submit-for-review + complete | Full-workflow path; no activities skipped |
| Checkpoints triggered | 8 | Counts from `workflow-state.json` `checkpointResponses` map (does not include strategic-review's `unsigned-commits` checkpoint, which was answered after the state file was last persisted) |
| Plan revisions | 1 | Drafted at 18:08; revised at 18:23 after elicitation surfaced sweep/migration/doc-freshness test gaps |
| Phases implemented | 10 (1–7 + 8.1–8.3 + 10.1–10.3) | Each phase landed as one commit on the feature branch |
| Tests delivered | 315 passed / 2 skipped (`+59` over the pre-refactor 256 baseline) | All 18 success criteria verified |
| Strategic-review findings | 0 critical / 0 major / 0 minor / 3 informational | All informational items deferred-by-design or cosmetic |
| Review-feedback items | 4 — all resolved inline | Stripped planning refs, grouped session utils, retargeted submodule, retargeted `.gitmodules` |
| Workflow deviations | None — every transition matched the expected `transition_condition` | |

---

## Summary

**Overall Session Quality:** Smooth with minor friction at the source-cleanliness boundary.

**Key Takeaway:** The workflow handled a complex, cross-repo refactor (44 parent-repo files + workflows submodule + engineering submodule) end-to-end with zero functional findings at strategic-review. The four review-feedback items all clustered around a single theme: **the seam between "what is useful during implementation" and "what should survive into merged source"**. Planning-reference annotations, real-data fixtures, sibling files at `src/` root, and the submodule-branch-tracking gap all stem from the same root cause: there is no explicit "merge-readiness sweep" step that separates implementation-phase conveniences from merge-time discipline. Adding such a step (or moving the discipline into the `implement` and `validate` skills) would have caught all four review items before they reached the reviewer.

**Action Required:** Yes — recommend two follow-up issues:

1. Add a "merge-readiness sweep" step to the `validate` activity (or extend `finalize-documentation`) that strips planning annotations, replaces real-data fixtures with synthetic equivalents, and groups newly-added module files by capability. Priority: High.
2. Extend `manage-git::create-branch` to emit a submodule-branch-tracking checkpoint when the work package's plan touches submodule paths. Priority: High.
