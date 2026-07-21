---
name: manual-diff-review
description: Lean-header and report-section forms for the manual diff review.
metadata:
  version: 2.1.0
  order: 22
  legacy_id: 22
---

# Manual Diff Review Forms

Outputs: **Change Block Index** (`change-block-index.md`) and the **Manual Diff Review section** written into `code-review.md`.

## File Index Generation

### Index Format

Open with a lean-header summary line, then one rationale section per changed block. Each **Block** title hyperlinks to the primary `file:line` in the diff (path and starting line of the hunk). No separate Instructions section and no file-index table — the Block titles are the navigation.

```markdown
# Change Block Index

> feature/my-feature vs main · 24 files · 47 hunks · est. review ~24 minutes (30 sec/change)

## Block Rationale

### [Block 1 — handlers.rs:42](../../src/api/handlers.rs:42)

[Descriptive paragraph explaining what the change does and why.]

### [Block 2 — routes.rs:18](../../src/api/routes.rs:18)

[Descriptive paragraph explaining what the change does and why.]
```

Reviewers use their side-by-side diff tool with this index for context. Reply with block numbers that have issues (e.g. `3, 7, 12`) or `none`.

### Block Rationale Form

```markdown
## Block Rationale

### [Block N — file:line](relative-path:line)

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

**File:** `path/to/file.ext` · **Block:** [N] · **Severity:** Critical / High / Medium / Low  
**Issue:** [User's description of the issue]  
**Recommendation:** [Suggested fix or action, if provided]
```
