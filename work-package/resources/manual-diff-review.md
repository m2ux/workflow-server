---
name: manual-diff-review
description: Index-table, header, and report forms for the manual diff review; the review procedure and rules live on the review-diff technique.
metadata:
  version: 1.2.0
  order: 22
  legacy_id: 22
---

# Manual Diff Review Forms

Forms consumed by [review-diff](../techniques/review-diff.md), which owns the procedure (branch sync, diff parsing, index generation, the row-number reporting protocol, the interview loop) and the rationale-quality and review-conduct rules. Outputs: **File Index Table** (`change-block-index.md`) and **Manual Diff Review Report** (`manual-diff-review.md`).

## File Index Generation

### Table Format

One row per changed file, sorted alphabetically by path. Each row number is a markdown hyperlink to its rationale section further down the document:

```markdown
| Row | Path | File |
|-----|------|------|
| [1](#block-1) | src/api/ | handlers.rs |
| [2](#block-2) | src/api/ | routes.rs |
| [3](#block-3) | src/core/ | processor.rs |
```

### Header Information

Summary statistics at the top of the index file (lean-header):

```markdown
# Change Block Index

> feature/my-feature vs main · 24 files · 47 hunks · est. review ~24 minutes (30 sec/change)

## Instructions

Review changes in your side-by-side diff tool using this index for reference.
Click any row number to jump to its rationale paragraph for context on why the change was made.
Report row numbers for files with issues (e.g., "3, 7, 12") or "none" if all looks good.
```

### Block Rationale Form

```markdown
## Block Rationale

### Block 1

[Descriptive paragraph explaining what the change does and why.]
```

## Report Generation

### Manual Diff Review Report Template

```markdown
# Manual Diff Review Report

> [Work Package] · [feature-branch] vs [base-branch] · YYYY-MM-DD · reviewer: [Name]

## Review Summary

| Metric | Value |
|--------|-------|
| Files Reviewed | [X] |
| Files Flagged | [Y] |
| Critical Issues | [Z] |
| Total Findings | [N] |

## Findings

[Omit this section if the user reported "none".]

### Finding 1: [Brief Title]

**File:** `path/to/file.ext` · **Row:** [N] · **Severity:** Critical / High / Medium / Low

**Issue:**
[User's description of the issue]

**Recommendation:**
[Suggested fix or action, if provided]

## Actions Required

[Omit this section if none.]

| # | Action | File | Priority |
|---|--------|------|----------|
| 1 | [Action description] | `file.ext` | High |

## Review Outcome

**Result:** [Issues Found / No Issues]

**Next Steps:**
- [ ] Address critical findings before proceeding
- [ ] Proceed to automated code review
- [ ] Proceed to test suite review
```
