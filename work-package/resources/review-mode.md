---
name: review-mode
description: Guidelines for using the work-package workflow in review mode to conduct structured PR reviews. Covers detection, adapted workflow behavior, and output generation.
metadata:
  version: 1.5.0
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
https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/main/.engineering/artifacts/planning/{PLANNING_FOLDER}/
```

| Report Name | Artifact |
|-------------|----------|
| Prior Feedback Triage | `prior-feedback-triage.md` |
| Code Review | `code-review.md` |
| Test Suite Review | `test-suite-review.md` |

Section titles (e.g., `### Code Review Findings`) must NOT be hyperlinks — the report links live in the header instead.

**Reviewers list:** The `Reviewers` field lists each agent role that contributed findings, with each name hyperlinked to the workflow file that defines that role. The workflow definitions live in the workflows repository (a submodule), so reviewer links use the workflow repo base URL:

```
https://github.com/{WORKFLOW_REPO_OWNER}/{WORKFLOW_REPO_NAME}/blob/{WORKFLOW_BRANCH}/work-package/
```

Resolve `{WORKFLOW_REPO_OWNER}`, `{WORKFLOW_REPO_NAME}`, and `{WORKFLOW_BRANCH}` from the `.gitmodules` entry for the workflows submodule (typically `.engineering/workflows`). The rendering step supplies the role-to-file mapping for the roles it links.

**Table format:** All review tables only include non-passing findings — do not list passing or positive items. The `#` column value is a hyperlink to the pertinent artifact or symbol (file path and line for code review, test method for test review, document URL for documentation, CI run URL for validation, branch/commit for hygiene). Every table must include a `Severity` column. Every `#` link MUST be validated against the actual source at the referenced commit before inclusion — do not carry over line numbers from earlier analysis without verification.

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
**Reviewers**: [each contributing agent role linked to its defining workflow file under `{workflow_base}`]  
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
| [1](pr-comment-url) | Storage record never cleared on close | reviewer | Confirmed | Unaddressed — clear missing on the governance-close path |
| [2](pr-comment-url) | Naming nit on handler | bot | Refuted | Name follows the crate convention |

<details>
<summary>Finding Details</summary>

#### PF-1. Storage record never cleared on close (Confirmed — blocker)
[Why the concern holds and remains unaddressed]
**Disposition**: Confirmed — caps the Overall Rating

</details>

---

### Code Review Findings

| # | Finding | Severity |
|---|---------|----------|
| [1](src/file.rs#L42) | Missing null check in handler | High |
| [2](src/handler.rs#L78) | N+1 query pattern in loop | Medium |

<details>
<summary>Finding Details</summary>

#### CR-1. Missing null check (High)
[Description]
**Suggestion**: [Recommendation]

#### CR-2. N+1 query pattern (Medium)
[Description]
**Suggestion**: [Recommendation]

</details>

---

### Test Review Findings

| # | Gap | Severity |
|---|-----|----------|
| [1](tests/module_test.rs) | Missing edge case coverage | Medium |
| [2](tests/module_test.rs) | No error path tests | High |

<details>
<summary>Finding Details</summary>

#### TR-1. Missing edge case coverage (Medium)
[Description of what is not covered]
**Suggestion**: [Specific test to add]

#### TR-2. No error path tests (High)
[Description of missing error handling tests]
**Suggestion**: [Specific test to add]

</details>

---

### Documentation Review

| # | Gap | Severity |
|---|-----|----------|
| `1` | Change file missing | High |

<details>
<summary>Finding Details</summary>

#### DR-1. Change file missing (High)
[Why it is needed]
**Suggestion**: [What to include]

</details>

---

### Validation Findings

| # | Check | Severity |
|---|-------|----------|
| [1](ci-run-url) | Lint — 3 clippy warnings | Warning |

<details>
<summary>Finding Details</summary>

#### VF-1. Lint warnings (Warning)
**Tool**: clippy  
**Findings**: [List specific warnings]  
**Suggestion**: [Fix command or manual resolution]

</details>

---

### Branch Hygiene

| # | Item | Severity |
|---|------|----------|
| 1 | Branch freshness — behind main | Warning |

<details>
<summary>Finding Details</summary>

#### BH-1. Branch freshness (Warning)
[Description of how far behind, conflicting deps, etc.]
**Suggestion**: [Rebase or merge instructions]

</details>

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
