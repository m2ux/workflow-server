---
id: review-mode
version: 1.1.0
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

The final review comment combines findings from all review stages:

```markdown
## PR Review Summary

**PR**: #XXX - [Title]
**Reviewer**: [Workflow-based review]
**Date**: YYYY-MM-DD

### Executive Summary

[1-2 sentence overall assessment]

**Overall Rating**: [Approve / Request Changes / Comment Only]

---

### Code Review Findings

| # | Severity | Category | Finding | Location |
|---|----------|----------|---------|----------|
| 1 | High | Error Handling | Missing null check | `file.rs:42` |
| 2 | Medium | Performance | N+1 query pattern | `handler.rs:78-92` |

<details>
<summary>Finding Details</summary>

#### 1. Missing null check (High)
**Location**: `src/file.rs:42`
**Issue**: [Description]
**Suggestion**: [Recommendation]

</details>

---

### Test Review Findings

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| Missing edge case coverage | Medium | Add tests for [scenarios] |
| No error path tests | High | Add tests for failure modes |

---

### Documentation Review

| Document | Status | Notes |
|----------|--------|-------|
| README.md | ✅ Current | No updates needed |
| Change file | ❌ Missing | Required for release notes |

---

### Validation Results

| Check | Status | Notes |
|-------|--------|-------|
| Tests | ✅ Pass | All 42 tests passed |
| Build | ✅ Pass | Clean build |
| Lint | ⚠️ Warning | 3 clippy warnings (non-blocking) |

---

### Action Items

**Must Address (Blocking)**:
- [ ] Add error handling for [specific case]
- [ ] Add missing test coverage for [scenario]

**Should Address (Recommended)**:
- [ ] Consider refactoring [component] for clarity
- [ ] Update change file with release notes

**Nice to Have (Optional)**:
- [ ] Add docstring to public function
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
