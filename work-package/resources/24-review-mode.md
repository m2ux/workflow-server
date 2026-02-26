---
id: review-mode
version: 1.2.0
---

# Review Mode Guide

**Purpose:** Guidelines for using the work-package workflow in review mode to conduct structured PR reviews. This guide covers detection, adapted workflow behavior, and output generation.

---

## Overview

Review mode adapts the standard work-package workflow for reviewing existing implementations rather than creating new ones. When activated, the workflow:

- Skips requirements elicitation (requirements come from the ticket)
- Analyzes the pre-change baseline state
- Skips the implement phase (code already exists)
- Documents findings rather than applying fixes
- Generates structured PR review comments

---

## Schema Integration

Review mode is formally defined in the workflow schema:

### Workflow-Level Definition

The mode is defined in `workflow.toon` under the `modes` section:

```
modes[1]:
  - id: review
    name: Review Mode
    description: "Review existing PRs rather than implementing new code"
    activationVariable: is_review_mode
    recognition[3]:
      - start review work package
      - review pr
      - review existing implementation
    skipActivities[2]:
      - requirements-elicitation
      - implement
    defaults:
      needs_elicitation: false
    resource: resources/24-review-mode.md
```

### Activity-Level Overrides

Each activity can define mode-specific behavior using `modeOverrides`:

```
modeOverrides:
  review:
    description: "Mode-specific activity description"
    notes[N]:
      - Mode-specific notes
    steps[N]:
      - Mode-specific steps
    skipSteps[N]:
      - Steps to skip in this mode
    checkpoints[N]:
      - Mode-specific checkpoints
    transitionOverride: target-activity
    context_to_preserve[N]:
      - Mode-specific context
```

---

## Activating Review Mode

### Detection Patterns

Review mode is detected from user request patterns in the initial message:

| Pattern | Example |
|---------|---------|
| "start review work package" | `Start a review work package for PR #123` |
| "review pr" | `Review PR #456` |
| "review existing implementation" | `Review the existing implementation in branch feature/xyz` |

### Confirmation

When review mode is detected, you'll be asked to confirm:

```
This appears to be a review of an existing PR. Is that correct?

- [Yes, review existing PR] - Review mode activated
- [No, new implementation] - Standard workflow
```

### Required Information

After confirmation, provide the PR reference:

```
Please provide the PR to review (number or URL):

Examples:
- 123
- #123
- https://github.com/org/repo/pull/123
```

---

## Workflow Adaptations

### Phase Differences

| Phase | Standard Mode | Review Mode |
|-------|---------------|-------------|
| **Issue Management** | Create/verify issue, create branch + PR | Extract ticket from existing PR |
| **Design Philosophy** | Full problem classification | Assess ticket completeness, always skip elicitation |
| **Elicitation** | Gather requirements interactively | **SKIPPED** - requirements from ticket only |
| **Research** | As needed per complexity | As needed per complexity (unchanged) |
| **Implementation Analysis** | Analyze current state | Analyze **pre-change** state (base branch) |
| **Plan & Prepare** | Plan implementation tasks | Plan as reference (retrospective analysis) |
| **Implement** | Execute implementation | **SKIPPED** - code already exists |
| **Post-Impl Review** | Review own implementation | Compare PR to expected changes |
| **Validate** | Fix failures | **Document** failures as findings |
| **Strategic Review** | Apply cleanup | **Document** cleanup recommendations |
| **Update PR** | Push and mark ready | **Generate and post review comments** |

### Key Behavioral Changes

1. **No Code Changes**: Review mode documents findings but does NOT modify the codebase
2. **Findings as Feedback**: All issues become review comments, not fixes to apply
3. **Baseline Comparison**: Implementation analysis captures what existed BEFORE the PR
4. **Retrospective Planning**: Plan serves as reference for what SHOULD have been done

---

## Implementation Analysis in Review Mode

### Baseline Capture

When in review mode, implementation analysis must:

1. **Checkout base branch** (PR target, typically `main` or `develop`)
2. **Analyze pre-change state**: Architecture, interfaces, existing behavior
3. **Document expected changes**: Based on ticket requirements, what changes should be made?
4. **Return to PR branch** for subsequent review phases

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

---

## Generating Review Comments

### Consolidated Review Format

The final review comment combines findings from all review stages.

**Reports list:** The header includes a `Reports` field listing the engineering artifact reports with hyperlinks. Construct links using the engineering artifacts base URL:

```
https://github.com/{ENG_REPO_OWNER}/{ENG_REPO_NAME}/blob/main/.engineering/artifacts/planning/{PLANNING_FOLDER}/
```

| Report Name | Artifact |
|-------------|----------|
| Code Review | `code-review.md` |
| Test Suite Review | `test-suite-review.md` |

Section titles (e.g., `### Code Review Findings`) must NOT be hyperlinks — the report links live in the header instead.

**Reviewers list:** The `Reviewers` field must list each agent role that contributed findings, with each name hyperlinked to the workflow `.toon` file that defines that role. The workflow definitions live in a separate repository (submodule), so construct links using the workflow repo base URL — not the engineering repo's submodule path, which does not resolve on GitHub:

```
https://github.com/{WORKFLOW_REPO_OWNER}/{WORKFLOW_REPO_NAME}/blob/{WORKFLOW_BRANCH}/work-package/
```

Resolve `{WORKFLOW_REPO_OWNER}`, `{WORKFLOW_REPO_NAME}`, and `{WORKFLOW_BRANCH}` from the `.gitmodules` entry for the workflows submodule (typically `.engineering/workflows`).

| Agent Role | Toon File |
|------------|-----------|
| Code Review Agent | `skills/00-review-code.toon` |
| Test Suite Review Agent | `skills/01-review-test-suite.toon` |
| Validation Agent | `activities/10-validate.toon` |
| Strategic Review Agent | `activities/11-strategic-review.toon` |

**Table format:** All review tables only include non-passing findings — do not list passing or positive items. The `#` column value is a hyperlink to the pertinent artifact or symbol (file path and line for code review, test method for test review, document URL for documentation, CI run URL for validation, branch/commit for hygiene). Every table must include a `Severity` column. Every `#` link MUST be validated against the actual source at the referenced commit before inclusion — do not carry over line numbers from earlier analysis without verification.

**Action Items:** A separate Action Items section at the end consolidates all actionable findings from every table into prioritized tiers with interactive checkboxes. Every non-passing finding from every table must appear as a checklist item. Cross-reference findings using section prefixes to avoid GitHub auto-linking `#N` as issue references:

| Section | Prefix |
|---------|--------|
| Code Review Findings | CR |
| Test Review Findings | TR |
| Documentation Review | DR |
| Validation Findings | VF |
| Branch Hygiene | BH |

Example: `(CR-1)` refers to Code Review finding 1, `(TR-3)` refers to Test Review finding 3.

```markdown
## PR Review Summary

**PR**: #XXX - Title
**Reviewers**: [Code Review Agent]({workflow_base}/skills/00-review-code.toon) · [Test Suite Review Agent]({workflow_base}/skills/01-review-test-suite.toon) · [Validation Agent]({workflow_base}/activities/10-validate.toon) · [Strategic Review Agent]({workflow_base}/activities/11-strategic-review.toon)
**Reports**: [Code Review]({artifacts_base}/code-review.md) · [Test Suite Review]({artifacts_base}/test-suite-review.md)
**Date**: YYYY-MM-DD

### Executive Summary

[1-2 sentence overall assessment]

**Overall Rating**: [Approve / Request Changes / Comment Only]

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
| [1](CHANGES.md) | Change file missing | High |

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
```

### Severity Definitions

| Severity | Merge Blocker? | Expectation |
|----------|----------------|-------------|
| Critical | Yes | Must fix before merge |
| High | Recommended | Should fix before merge |
| Medium | No | Can be follow-up PR |
| Low | No | Nice to have |

---

## Posting Reviews

### GitHub CLI Commands

```bash
# Post as a review comment
gh pr review {pr_number} --comment --body-file review.md

# Request changes (for blocking issues)
gh pr review {pr_number} --request-changes --body-file review.md

# Approve (when satisfied)
gh pr review {pr_number} --approve --body-file review.md
```

### Review Type Selection

| Findings | Review Type |
|----------|-------------|
| Critical/High severity blockers | `--request-changes` |
| Medium/Low findings only | `--comment` |
| No significant issues | `--approve` with summary |

---

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

---

## Quick Reference

### Review Mode Checklist

- [ ] Review mode detected and confirmed
- [ ] PR reference captured
- [ ] Jira ticket extracted from PR
- [ ] Ticket completeness assessed
- [ ] Baseline analyzed (base branch)
- [ ] Expected changes documented
- [ ] Code review completed
- [ ] Test review completed
- [ ] Validation run (tests, build, lint)
- [ ] Strategic review completed
- [ ] Review summary generated
- [ ] Review posted to PR

### Variable Reference

| Variable | Type | Description |
|----------|------|-------------|
| `is_review_mode` | boolean | Whether review mode is active |
| `review_pr_url` | string | URL of PR being reviewed |
| `review_base_branch` | string | Base branch for baseline comparison |
| `base_commit_sha` | string | SHA of base branch at analysis time |
| `expected_changes` | string | Expected implementation per requirements |
| `review_summary` | string | Consolidated review comment text |
| `review_posted` | boolean | Whether review was posted to PR |

---

## Related Resources

- [Jira Issue Creation Guide](04-jira-issue-creation.md) - Ticket completeness criteria
- [Rust/Substrate Code Review](16-rust-substrate-code-review.md) - Code review methodology
- [Test Suite Review](17-test-suite-review.md) - Test quality assessment
- [Strategic Review](18-strategic-review.md) - Scope and artifact review
- [Manual Diff Review](22-manual-diff-review.md) - Structured diff review process
