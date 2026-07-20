---
name: manual-diff-review
description: Index-table, header, and report-section forms for the manual diff review.
metadata:
  version: 2.0.1
  order: 22
  legacy_id: 22
---

# Manual Diff Review Forms

Outputs: **File Index Table** (`change-block-index.md`) and the **Manual Diff Review section** written into `code-review.md`.

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

### Manual Diff Review Section Template

Written as a `## Manual Diff Review` section of `code-review.md`, the review findings' canonical home:

```markdown
## Manual Diff Review

> [feature-branch] vs [base-branch] · [X] files reviewed · reviewer: [Name] · [Issues Found / No Issues]

[Omit the findings list if the user reported "none" — the header line is the whole record.]

### MD-1: [Brief Title]

**File:** `path/to/file.ext` · **Row:** [N] · **Severity:** Critical / High / Medium / Low  
**Issue:** [User's description of the issue]  
**Recommendation:** [Suggested fix or action, if provided]
```
