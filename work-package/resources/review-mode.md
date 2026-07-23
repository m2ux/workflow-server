---
name: review-mode
description: Guidelines for using the work-package workflow in review mode to conduct structured PR reviews. Covers detection, adapted workflow behavior, and output generation.
metadata:
  version: 1.7.1
  order: 24
  legacy_id: 24
---


# Review Mode Guide

Review mode adapts the work-package workflow for reviewing existing implementations. The workflow mechanism that drives it — the `is_review_mode` variable and the step, checkpoint, and transition conditions that branch on it — is documented in [REVIEW-MODE.md](../REVIEW-MODE.md), which also carries the per-activity behavior summary and the phase-difference table. This resource supplies the review-specific reference content the review techniques consume: the expected-changes template, the consolidated review-comment format, severity definitions, and the review-type mapping.

## Implementation Analysis in Review Mode

### Expected Changes Document

Create a mental model of what the ideal implementation would look like:

```markdown
## Expected Changes (Review Mode)

Based on ticket [PM-XXXXX] requirements:

### Files Expected to Change
- `src/module/component.rs` - Add new handler for XYZ
- `tests/module_test.rs` - Add coverage for new behavior

### Expected Behavior Changes
1. System should now support [capability] when [condition]
2. Error handling for [edge case] should return [specific error]

### Expected Test Coverage
- Unit tests for new handler
- Integration test for end-to-end flow
- Edge case coverage for [scenarios]
```

## Generating Review Comments

### Consolidated Review Format

The final review comment combines findings from all review stages.

**Findings constraint:** every finding names a file within the authored surface (the PR's changed-files list). Findings on files in that set form the PR's findings; findings on other files form a separate "pre-existing" grouping.

**Reports list:** The header includes a `Reports` field listing the engineering artifact reports with hyperlinks. Construct links using the engineering artifacts base URL:

```
https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/{ARTIFACT_PUBLISH_REF}/.engineering/artifacts/planning/{PLANNING_FOLDER}/
```

`{ARTIFACT_PUBLISH_REF}` is the git ref the linked artifacts are published on — the commit SHA from `publish-review-artifacts` (preferred, immutable permalink) or the current parent branch when the SHA is not yet available. Resolve `{ENG_REPO_OWNER}` and `{ENG_REPO_NAME}` from the parent repo remote (`reference_path`); never hardcode `main`.

| Report Name | Artifact |
|-------------|----------|
| Prior Feedback Triage | `prior-feedback-triage.md` |
| Code Review | `code-review.md` |
| Test Suite Review | `test-suite-review.md` |

Section titles (e.g., `### Code Review Findings`) must NOT be hyperlinks — the report links live in the header instead.

**Plan link:** Immediately after the `PR` line, the header carries a `Plan` field linking the planning folder's `README.md` — the work package's canonical home — built from the same engineering-artifacts base URL as the `Reports` field, with `README.md` appended.

**Reviewers list:** The `Reviewers` field lists each review *activity* that contributed findings — an activity, not a technique — with each name hyperlinked to that activity's section in the activities README. When one activity runs several review techniques (Post-Implementation Review runs both code review and test-suite review), it appears once; never split it into per-technique reviewer entries, never link a reviewer to a technique file, and link to the activity's README section rather than its raw `.yaml`. The activities README lives in the workflows repository (a submodule), so reviewer links use the workflow repo base URL:

```
https://github.com/{WORKFLOW_REPO_OWNER}/{WORKFLOW_REPO_NAME}/blob/{WORKFLOW_BRANCH}/work-package/activities/README.md
```

Resolve `{WORKFLOW_REPO_OWNER}`, `{WORKFLOW_REPO_NAME}`, and `{WORKFLOW_BRANCH}` from the `.gitmodules` entry for the workflows submodule (typically `.engineering/workflows`). Each reviewer links to its activity's heading anchor: Post-Implementation Review → `#10-post-implementation-review` (covers both code review and test-suite review), Validate → `#11-validate`, Strategic Review → `#12-strategic-review`. The rendering step supplies the activity-to-anchor mapping for the activities it links.

**Table format:** All review tables only include non-passing findings — do not list passing or positive items. The `#` column value is the item designator (e.g. `CR-1`). When the finding has an associated report in the `Reports` header, the designator is hyperlinked to that finding's own section within its report, anchored to the finding's heading (e.g. `code-review.md#cr-1`); when it has none, the designator is rendered as plain text (e.g. `BH-1`). A separate `Source` column carries the pertinent artifact or symbol as a hyperlink whose link text is the source filename: file path and line, or line range, for code review; test method for test review; document URL for documentation; CI run URL for validation; branch/commit for hygiene. Every findings table must include `Source`, `Severity`, and `Disposition` columns (Disposition e.g. Fix now / Deferred → register ID / Noted). Every `Source` link MUST be validated against the actual source at the referenced commit before inclusion — do not carry over line numbers from earlier analysis without verification. (The Prior Feedback Triage table is the exception: its `#` links the prior comment thread, since each row is a prior comment rather than a finding with a report section.)

**Reference, don't restate:** the summary references each finding by ID, one-line title, severity, and disposition ONLY. Finding descriptions, evidence, and suggestions live in the linked report artifacts (`Reports` header) — the summary never reproduces them.

**Action Items:** A separate Action Items section at the end consolidates all actionable findings from every table into prioritized tiers with interactive checkboxes. Every non-passing finding from every table must appear as a checklist item. Cross-reference findings using section prefixes to avoid GitHub auto-linking `#N` as issue references:

| Section | Prefix |
|---------|--------|
| Prior Feedback Triage | PF |
| Code Review Findings | CR |
| Test Review Findings | TR |
| Documentation Review | DR |
| Validation Findings | VF |
| Branch Hygiene | BH |

Example: `(CR-1)` refers to Code Review finding 1, `(TR-3)` refers to Test Review finding 3.

```markdown
## PR Review Summary

**PR**: #XXX - Title  
**Plan**: [work package README](.../planning/{PLANNING_FOLDER}/README.md)  
**Reviewers**: [each contributing review activity linked to its section in the activities README under `{workflow_base}/activities/README.md`]  
**Reports**: `Code Review` · `Test Suite Review`  
**Date**: YYYY-MM-DD

### Executive Summary

[1-2 sentence overall assessment]

**Overall Rating**: [Approve / Request Changes / Comment Only]

---

### Prior Feedback Triage

Disposition of every prior comment and review on the PR (human and bot), determined before independent analysis.

| # | Prior Comment | Author | Disposition | Reasoning |
|---|---------------|--------|-------------|-----------|
| [1](pr-comment-url) | Storage record never cleared on close | reviewer | Confirmed — caps rating | Unaddressed — clear missing on the governance-close path |
| [2](pr-comment-url) | Naming nit on handler | bot | Refuted | Name follows the crate convention |

---

### Code Review Findings

Details: [code review report](code-review.md).

| # | Finding | Source | Severity | Disposition |
|---|---------|--------|----------|-------------|
| [CR-1](code-review.md#cr-1) | Missing null check in handler | [file.rs:42](src/file.rs#L42) | High | Fix now |
| [CR-2](code-review.md#cr-2) | N+1 query pattern in loop | [handler.rs:78](src/handler.rs#L78) | Medium | Deferred → D-2 |

---

### Test Review Findings

Details: [test suite review report](test-suite-review.md).

| # | Gap | Source | Severity | Disposition |
|---|-----|--------|----------|-------------|
| [TR-1](test-suite-review.md#tr-1) | Missing edge case coverage | [module_test.rs:88](tests/module_test.rs#L88) | Medium | Fix now |
| [TR-2](test-suite-review.md#tr-2) | No error path tests | [module_test.rs:210-240](tests/module_test.rs#L210-L240) | High | Fix now |

---

### Documentation Review

| # | Gap | Source | Severity | Disposition |
|---|-----|--------|----------|-------------|
| `DR-1` | Change file missing | [CHANGELOG.md](CHANGELOG.md) | High | Fix now |

---

### Validation Findings

| # | Check | Source | Severity | Disposition |
|---|-------|--------|----------|-------------|
| `VF-1` | Lint — 3 clippy warnings | [CI run](ci-run-url) | Warning | Fix now |

---

### Branch Hygiene

| # | Item | Source | Severity | Disposition |
|---|------|--------|----------|-------------|
| `BH-1` | Branch freshness — behind main | [main@abc1234](commit-url) | Warning | Rebase before merge |

---

### Action Items

**Must Address (Blocking)**:
- [ ] Add error handling for [specific case] (CR-1)
- [ ] Add missing test coverage for [scenario] (TR-2)

**Should Address (Recommended)**:
- [ ] Add release notes entry (DR-1)
- [ ] Rebase before merge (BH-1)

**Could Address (Suggested)**:
- [ ] Batch query outside loop (CR-2)
- [ ] Add tests for [scenarios] (TR-1)

**Nice to Have (Optional)**:
- [ ] Run `cargo clippy --fix` to clear warnings (VF-1)

---

*Posted by an automated review agent on behalf of @{user}. The recommendation reflects an independent re-verification at head `{sha}`; the maintainers retain full discretion over disposition.*
```

The attribution footer is the last block of the rendered summary and is posted verbatim as part of the review comment. Resolve `{user}` from the `gh` authenticated account (`gh api user --jq .login`) and `{sha}` from the PR head commit at review time (`gh pr view {pr_number} --json headRefOid --jq .headRefOid`, short form). It is part of the format so it renders into `{review_summary}` and reaches the PR unaltered.

### Severity Definitions

| Severity | Merge Blocker? | Expectation |
|----------|----------------|-------------|
| Critical | Yes | Must fix before merge |
| High | Recommended | Should fix before merge |
| Medium | No | Can be follow-up PR |
| Low | No | Nice to have |

Findings are classified on the classification scale (Critical / Major / Minor / Nit / Informational) and rendered on the summary scale above. The render map preserves the classified severity end to end — a finding classified above "safe" renders above "safe":

| Classified severity | Renders as |
|---------------------|------------|
| Critical | Critical |
| Major | High |
| Minor | Medium |
| Nit | Low |
| Informational | (omitted from the tables — recorded in the report only) |

A correct-but-harmful finding (one classified Major or Critical on an impact axis such as unbounded state growth, economic/spam, liveness/halt, or migration/upgrade) therefore renders at High or Critical and reaches the Action Items as a blocking item — it is not downgraded to "safe" at the render boundary.

### Review Type Selection

The Overall Rating rendered in the summary maps to the posted review type:

| Overall Rating | Review Type |
|----------------|-------------|
| Request Changes | `request-changes` |
| Comment Only | `comment` |
| Approve | `approve` |

## Artifacts in Review Mode

Review mode creates the same planning artifacts as standard mode, but with review-specific content:

| Artifact | Standard Mode | Review Mode |
|----------|---------------|-------------|
| `design-philosophy.md` | Problem classification | + Ticket completeness assessment |
| `implementation-analysis.md` | Current state | **Pre-change** baseline state |
| `wp-plan.md` | Implementation tasks | Retrospective plan (reference only) |
| `code-review.md` | Review findings | Same format, external PR focus |
| `test-suite-review.md` | Test quality | Same format, document gaps |
| `strategic-review.md` | Cleanup applied | Cleanup **recommendations** |

## Variable Reference

| Variable | Type | Description |
|----------|------|-------------|
| `is_review_mode` | boolean | Whether review mode is active |
| `review_pr_url` | string | URL of PR being reviewed |
| `review_base_branch` | string | Base branch for baseline comparison |
| `base_commit_sha` | string | SHA of base branch at analysis time |
| `expected_changes` | string | Expected implementation per requirements |
| `review_summary` | string | Consolidated review comment text |
| `review_posted` | boolean | Whether review was posted to PR |
| `review_type` | string | `gh pr review` flag (`approve` \| `request-changes` \| `comment`) chosen at `review-summary-approval` |
| `artifact_publish_ref` | string | Git ref for engineering-artifact hyperlinks — publish commit SHA (preferred) or current parent branch |
