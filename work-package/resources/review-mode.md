---
name: review-mode
description: Guidelines for using the work-package workflow in review mode to conduct structured PR reviews. Covers detection, adapted workflow behavior, and output generation. Organized by review category for per-section delivery to the technique that renders that category.
metadata:
  version: 1.12.0
  order: 24
  legacy_id: 24
---


# Overview

Review mode adapts the work-package workflow for reviewing existing implementations. The workflow mechanism that drives it — the `is_review_mode` variable and the step, checkpoint, and transition conditions that branch on it — is documented in [REVIEW-MODE.md](../REVIEW-MODE.md), which also carries the per-activity behavior summary and the phase-difference table. This resource supplies the review-specific reference content the review techniques consume, organized by review category.

Each **Review Category** has its own section under [Review Categories](#review-categories) carrying that category's findings fragment and population rules, so the technique that renders the category can fetch only its section. The [Review Comment Template](#review-comment-template) holds the whole-document skeleton with per-category placeholders, the shared header/table rules, and the cross-category scales (severity, review-type, category reference) for the consolidating step.

## Review Comment Template

This section is the creation guide for the consolidated review comment posted to the PR. It carries the whole-document skeleton — header, per-category `{placeholder}` markers, Action Items, attribution footer — plus the rules for filling each part. The consolidating step fills each `{category}` placeholder from that category's own section; category techniques fetch only their own category section, not this template.

The sub-sections decompose the rules so a consumer fetches only the one it needs:

- [Header Fields](#header-fields) — the `PR` / `Plan` / `Reviewers` / `Reports` / `Date` header and the link conventions that govern it
- [Table Format](#table-format) — the shared findings-table shape across all categories
- [Reference, Don't Restate](#reference-dont-restate) — findings cited by ID, never reproduced
- [Action Items](#action-items) — the prioritized checklist consolidation
- [Skeleton](#skeleton) — the whole-document template itself
- [Attribution Footer](#attribution-footer) — the posted-verbatim footer and its variable resolution

### Header Fields

The summary header carries `PR`, `Plan`, `Reviewers`, `Reports`, and `Date` fields.

**Findings constraint:** every finding names a file within the authored surface (the PR's changed-files list). Findings on files in that set form the PR's findings; findings on other files form a separate "pre-existing" grouping.

**Reports list:** The header includes a `Reports` field naming each report the summary links to, as hyperlinks. Each entry links the report by name to its artifact, under the engineering-artifacts base URL:

```
https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/{ARTIFACT_PUBLISH_REF}/.engineering/artifacts/planning/{PLANNING_FOLDER}/
```

`{ARTIFACT_PUBLISH_REF}` is the git ref the linked artifacts are published on — the publish commit SHA (preferred, immutable permalink) or the current parent branch when the SHA is not yet available. Resolve `{ENG_REPO_OWNER}` and `{ENG_REPO_NAME}` from the parent repo remote (`reference_path`); never hardcode `main`. The set of reports and their artifact filenames are supplied by the rendering step — one entry per review category the run produced — not fixed by this template.

Section titles (a per-category findings heading) must NOT be hyperlinks — the report links live in the header instead.

**Plan link:** Immediately after the `PR` line, the header carries a `Plan` field linking the planning folder's `README.md` — the work package's canonical home — built from the same engineering-artifacts base URL as the `Reports` field, with `README.md` appended.

**Reviewers list:** The `Reviewers` field lists each review *activity* that contributed findings — an activity, not a technique — with each name hyperlinked to that activity's section in the activities README. When one activity runs several review techniques, it appears once; never split it into per-technique reviewer entries, never link a reviewer to a technique file, and link to the activity's README section rather than its raw `.yaml`. The activities README lives in the workflows repository (a submodule), so reviewer links use the workflow repo base URL:

```
https://github.com/{WORKFLOW_REPO_OWNER}/{WORKFLOW_REPO_NAME}/blob/{WORKFLOW_BRANCH}/work-package/activities/README.md
```

Resolve `{WORKFLOW_REPO_OWNER}`, `{WORKFLOW_REPO_NAME}`, and `{WORKFLOW_BRANCH}` from the `.gitmodules` entry for the workflows submodule (typically `.engineering/workflows`). Each reviewer links to its activity's heading anchor; the rendering step supplies the activity-to-anchor mapping for the activities it links.

### Table Format

Every findings table, across all categories, follows one shape: only non-passing findings — do not list passing or positive items. The `#` column value is the item designator (the category's prefix plus its number). When the finding has an associated report in the `Reports` header, the designator is hyperlinked to that finding's own section within its report, anchored to the finding's heading; when it has none, the designator is rendered as plain text. Every findings table must include `Source`, `Severity`, and `Disposition` columns (Disposition e.g. Fix now / Deferred → register ID / Noted). Every `Source` link MUST be validated against the actual source at the referenced commit before inclusion — do not carry over line numbers from earlier analysis without verification. (The Prior Feedback Triage table is the exception: its `#` links the prior comment thread, since each row is a prior comment rather than a finding with a report section.)

### Reference, Don't Restate

The summary references each finding by ID, one-line title, severity, and disposition ONLY. Finding descriptions, evidence, and suggestions live in the linked report artifacts (`Reports` header) — the summary never reproduces them.

### Action Items

A separate Action Items section at the end consolidates all actionable findings from every table into prioritized tiers with interactive checkboxes. Every non-passing finding from every table must appear as a checklist item. Cross-reference findings using the category prefixes to avoid GitHub auto-linking `#N` as issue references.

### Category Reference

Review mode produces review-specific variants of the standard planning artifacts. The rendering and persist steps name the concrete artifacts they write; this table summarizes the content difference per review category, not the authoritative filenames.

| Review Category | Standard Mode | Review Mode |
|-----------------|---------------|-------------|
| Design Philosophy | Problem classification | + Ticket completeness assessment |
| Implementation Analysis | Current state | **Pre-change** baseline state |
| Work-package plan | Implementation tasks | Retrospective plan (reference only) |
| Code Review | Review findings | Same format, external PR focus |
| Test Review | Test quality | Same format, document gaps |
| Strategic Review | Cleanup applied | Cleanup **recommendations** |

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


### Skeleton

```markdown
## PR Review Summary

**PR**: #XXX - Title  
**Plan**: [work package README](.../planning/{PLANNING_FOLDER}/README.md)  
**Reviewers**: [each contributing review activity linked to its section in the activities README under `{workflow_base}/activities/README.md`]  
**Reports**: `{reports}` — one hyperlinked entry per report the run produced, supplied by the rendering step  
**Date**: YYYY-MM-DD

### Executive Summary

[1-2 sentence overall assessment]

**Overall Rating**: [Approve / Request Changes / Comment Only]

---

{prior_feedback_triage}

---

{code_review_findings}

---

{test_review_findings}

---

{documentation_review}

---

{validation_findings}

---

{branch_hygiene}

---

### Action Items

**Must Address (Blocking)**:
- [ ] [blocking finding] (PF-1)

**Should Address (Recommended)**:
- [ ] [recommended finding] (DR-1)

**Could Address (Suggested)**:
- [ ] [suggested finding] (CR-2)

**Nice to Have (Optional)**:
- [ ] [optional finding] (VF-1)

---

*Posted by an automated review agent on behalf of @{user}. The recommendation reflects an independent re-verification at head `{sha}`; the maintainers retain full discretion over disposition.*
```

### Attribution Footer

The attribution footer is the last block of the rendered summary and is posted verbatim as part of the review comment. Resolve `{user}` from the `gh` authenticated account (`gh api user --jq .login`) and `{sha}` from the PR head commit at review time (`gh pr view {pr_number} --json headRefOid --jq .headRefOid`, short form). It is part of the format so it renders into `{review_summary}` and reaches the PR unaltered.

# Review Categories

## Design Philosophy

**Prefix:** — (narrative; no findings table)

Review-mode design philosophy adds a ticket-completeness assessment to the standard problem classification. This category is narrative, not a findings table — it feeds the Executive Summary rather than a per-category section of the consolidated comment.

**Population:** assess whether the ticket requirements are complete and unambiguous enough to judge the PR against; note gaps that force assumptions. Carries forward into the Implementation Analysis baseline.

## Implementation Analysis

**Prefix:** — (narrative; baseline reference, no findings table in the comment)

Review-mode implementation analysis documents the **pre-change** baseline state and the expected changes against requirements. It is the yardstick the other categories evaluate the PR against; it does not render a findings table in the comment.

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

## Prior Feedback Triage

**Prefix:** `PF`

Disposition of every prior comment and review on the PR (human and bot), determined before independent analysis. The `#` column links the prior comment thread (each row is a prior comment, not a finding with a report section). A Confirmed blocker-class entry caps the Overall Rating unless the review's own findings refute it (the rating-cap carve-in).

**Population:** one row per prior comment with its Confirmed / Refuted / Superseded disposition and reasoning; carry each Confirmed blocker-class entry into Action Items as blocking.

```markdown
### Prior Feedback Triage

Disposition of every prior comment and review on the PR (human and bot), determined before independent analysis.

| # | Prior Comment | Author | Disposition | Reasoning |
|---|---------------|--------|-------------|-----------|
| [1](pr-comment-url) | Storage record never cleared on close | reviewer | Confirmed — caps rating | Unaddressed — clear missing on the governance-close path |
| [2](pr-comment-url) | Naming nit on handler | bot | Refuted | Name follows the crate convention |
```

## Code Review

**Prefix:** `CR`

**Population:** `Source` = file path and line or line range (link text is the source filename). Designator links to the finding's section in the code-review report when one exists.

```markdown
### Code Review Findings

Details: [code review report]({report-url}).

| # | Finding | Source | Severity | Disposition |
|---|---------|--------|----------|-------------|
| [CR-1]({report-url}#cr-1) | Missing null check in handler | [file.rs:42](src/file.rs#L42) | High | Fix now |
| [CR-2]({report-url}#cr-2) | N+1 query pattern in loop | [handler.rs:78](src/handler.rs#L78) | Medium | Deferred → D-2 |
```

## Test Review

**Prefix:** `TR`

**Population:** `Source` = test method. Designator links to the finding's section in the test-suite review report when one exists.

```markdown
### Test Review Findings

Details: [test suite review report]({report-url}).

| # | Gap | Source | Severity | Disposition |
|---|-----|--------|----------|-------------|
| [TR-1]({report-url}#tr-1) | Missing edge case coverage | [module_test.rs:88](tests/module_test.rs#L88) | Medium | Fix now |
| [TR-2]({report-url}#tr-2) | No error path tests | [module_test.rs:210-240](tests/module_test.rs#L210-L240) | High | Fix now |
```

## Documentation Review

**Prefix:** `DR`

**Population:** `Source` = document URL. No associated report — the designator renders as plain text.

```markdown
### Documentation Review

| # | Gap | Source | Severity | Disposition |
|---|-----|--------|----------|-------------|
| `DR-1` | Change file missing | [CHANGELOG.md](CHANGELOG.md) | High | Fix now |
```

## Validation

**Prefix:** `VF`

**Population:** `Source` = CI run URL. No associated report — the designator renders as plain text.

```markdown
### Validation Findings

| # | Check | Source | Severity | Disposition |
|---|-------|--------|----------|-------------|
| `VF-1` | Lint — 3 clippy warnings | [CI run](ci-run-url) | Warning | Fix now |
```

## Branch Hygiene

**Prefix:** `BH`

**Population:** `Source` = branch/commit. No associated report — the designator renders as plain text.

```markdown
### Branch Hygiene

| # | Item | Source | Severity | Disposition |
|---|------|--------|----------|-------------|
| `BH-1` | Branch freshness — behind main | [main@abc1234](commit-url) | Warning | Rebase before merge |
```

## Strategic Review

**Prefix:** — (recommendations feed Action Items and the plan; no findings table in the comment)

Review-mode strategic review produces cleanup **recommendations** rather than applied cleanup. Its output feeds the Action Items tiers and the retrospective plan; it does not render a per-category findings table in the consolidated comment.

**Population:** capture cleanup and scope-fit recommendations with their rationale; route actionable items into Action Items by priority.
