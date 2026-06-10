# Batch Technique-Authoring Manifest

Status: pending (deferred batch phase, per user "mechanical now, author techniques in batch")
Date: 2026-06-10
Scope: work-package workflow. All 14 activities have had the MECHANICAL migration applied (strategy `supporting[]`, per-step `step.technique` bindings for existing techniques, control-step A2 exemptions, description removals, compound-step splits). The whole work-package passes `scripts/validate-workflow-toon.ts`.

This manifest lists the remaining work the mechanical sweep deliberately deferred: new techniques to author, technique signature backfills, cross-cutting decisions, and the steps still carrying procedural `description` (un-bound, pending their technique).

---

## A. New techniques to author

Each is sourced from one or more steps that currently RETAIN a procedural `description` (un-bound) because no existing technique covered them.

| Technique | Location | Capability | Source step(s) |
|---|---|---|---|
| `review-mode-detection` | work-package | Detect review vs normal mode; capture the PR reference when present | 01 `detect-review-mode`, `capture-pr-reference` |
| `reference-resolution` | work-package | Resolve the reference repo/monorepo path and shape | 01 `resolve-reference` |
| `project-type-detection` | work-package | Detect project type (e.g. rust-substrate) from the target | 01 `detect-project-type` |
| `naming-conventions` | work-package | Derive branch name + canonical target/worktree path from conventions | 01 `derive-branch-name`, `compute-canonical-target-path` |
| `stakeholder-overview` | work-package | Author a 2-paragraph plain-language overview into a named README section (SHARED, 2 call-sites) | 01 `present-problem-overview` (`## Problem Overview`), 06 `present-solution-overview` (`## Solution Overview`) |
| `assess-ticket-completeness` | work-package | Assess a tracker ticket vs an issue-quality checklist, document gaps, offer refactor | 02 `assess-ticket-completeness` |
| `review-baseline-state` | work-package | Review mode: checkout base, capture base SHA, document expected changes, return to PR branch, record base↔PR diff (3 phases) | 05 `checkout-baseline`, `document-expected-changes`, `return-to-pr-branch` |
| `task-completion-review` | work-package | Per-task self-review: symbol-provenance verification + quality checks (migrate the `task-completion-review` resource into the protocol) | 08 `self-review` |
| `findings-classification` | work-package | Severity-classify review/test findings + set routing flags (`needs_code_fixes`, `needs_test_improvements`) | 09 `classify-and-route-findings`, **10 `document-failures`** |
| `apply-review-fixes` | work-package | Implement selected review findings/test improvements, then commit (composes commit-regular-files/artifact-commits) | 09 `review-fix-cycle/apply-fixes` |
| `instruct-merge-strategy` | work-package (manage-git group) | Advisory: present DCO-compliant merge guidance branching on `squash_merge_supported` | 12 `instruct-merge-strategy` |
| `github-cli-protocol::comment-issue` | meta (github-cli-protocol group) | Post a markdown comment to a GitHub issue (`gh issue comment`) | 07 `post-summary-github` |
| issue-platform ops / `create-issue` merge | work-package + meta (atlassian/github) | Verify/search/activate issues; link PR to ticket; create PR — bind to atlassian-operations + github-cli-protocol ops | 01 `verify-jira-issue`, `verify-github-issue`, `search-github-issue`, `activate-issue`, `link-pr-to-ticket`, `create-pr` |

## B. Technique signature backfills (declare inputs/outputs so implicit bind-by-name is trustworthy)

- `reconcile-assumptions` (and/or `review-assumptions`): add input `assumption_categories` (per-activity category list, passed via technique_args). **Decide canonical home for the "collect assumptions" phase** — workers bound `collect-assumptions` inconsistently to `reconcile-assumptions` (05/06) vs `review-assumptions` (02/03/04/08). Normalize.
- `update-pr`: declare `## Inputs` (currently none) — `branch_name`, `pr_number`, `planning_folder_path`, `reference_path`, `target_path`, `is_review_mode`, and a `template` input (enum initial|final, default final); declare outputs `body_conforms`, `body_findings`.
- `conduct-retrospective`: declare inputs `pr_number`, `planning_folder_path`.
- `finalize-documentation`: declare inputs `planning_folder_path`, `pr_number` (has `adr`, `test_plan`).
- `prism/portfolio-analysis`: declare inputs `target_content`, `output_path`.
- `manage-artifacts::write-artifact`: handle `planning_folder_path` vs `comprehension_dir` target (14 writes to comprehension dir).
- `manage-git::artifact-commits`: confirm `activity_name`/`issue_key`/`files`/`branch`/`reference_path` resolve in the implement bag, else defaults/args.
- `dco-provenance::append-task-row` / `record-attestation`: inputs come from checkpoint selection — confirm landing or add technique_args.
- `cargo-operations::test`: `scope`/`features` inherited from group root — document (no per-op backfill).
- Review techniques (`review-diff`, `review-code`, `review-test-suite`, `summarize-architecture`, `review-strategy`): confirm `changed_files`, `branch_name`, `planning_folder_path`, `target_path`, `pr_number`, `requirements` are declared / resolvable (esp. `changed_files`, set by no explicit upstream step in 09/11).

## C. Cross-cutting decisions

1. **`update-pr` shape:** split into a group with `render`/`verify-body`/`push-commits`/`mark-ready` operations (design doc §B.2), OR keep whole-technique binding (what the sweep used). If split, re-point 12's `post-pr-review`, `update-description`, `mark-ready`, `rerender-body`, `verify-body`.
2. **Assumption collect/reconcile/review canonical homes** (see B) — normalize which technique owns Collect / Reconcile / Interview / Record phases.
3. **Commit re-homing:** 09 dropped `version-control::commit-regular-files`, 11 dropped `manage-git::artifact-commits` from supporting (no step binds them). Re-home into `apply-review-fixes` (09) / `review-strategy` protocol (11), or add explicit commit steps.
4. **08 sequential gather:** confirm `task_implementation` (per task) accumulates into `completed_tasks`, and commits into `commits`; decide whether an explicit `iteration_key` (e.g. `current_task` id) is needed on the gather.

## D. Steps still carrying procedural `description` (un-bound, pending Section A)

01: `detect-review-mode`, `capture-pr-reference`, `resolve-reference`, `detect-project-type`, `derive-branch-name`, `compute-canonical-target-path`, `present-problem-overview`, + issue-platform steps · 02: `assess-ticket-completeness` · 05: `checkout-baseline`, `document-expected-changes`, `return-to-pr-branch` · 06: `present-solution-overview` · 07: `post-summary-github` · 08: `self-review` · 09: `classify-and-route-findings`, `apply-fixes` · 10: `document-failures` · 12: `instruct-merge-strategy`

These are the only remaining A1 violations (procedural prose in `description`); each clears when its Section-A technique is authored and the step is bound.

## E. Doc drift (deferred to a README-update pass)

`workflows/work-package/README.md` and `activities/README.md` still reference removed items (`evaluate-results`, `has_failures`); `validate-build/aggregate-results.md` still defines `test_results`/`build_status` (the envelope-collapse follow-up).
