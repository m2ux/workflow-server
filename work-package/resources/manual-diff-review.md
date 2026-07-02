---
name: manual-diff-review
description: Human review of code changes via an external side-by-side diff tool — file index generation, user reporting protocol, interview-based finding collection.
metadata:
  version: 1.1.0
  order: 22
  legacy_id: 22
---

# Manual Diff Review Guide

Human review of implementation changes before automated analysis: the user reviews the diff in their own side-by-side tool (VS Code, Meld, etc.) and reports findings by reference number. Outputs: **File Index Table** (`change-block-index.md`) and **Manual Diff Review Report** (`manual-diff-review.md`).

## File Index Generation

Pre-generation steps:

1. Ensure the branch is current: `git pull`
2. Identify the base branch: typically `main`/`master` — the branch the PR will merge into
3. Generate the diff: `git diff <base-branch>...HEAD`

### Table Format

One row per changed file, sorted alphabetically by path. Each row number is a markdown hyperlink to its rationale section further down the document:

```markdown
| Row | Path | File |
|-----|------|------|
| [1](#block-1) | src/api/ | handlers.rs |
| [2](#block-2) | src/api/ | routes.rs |
| [3](#block-3) | src/core/ | processor.rs |
```

- **Row**: sequential number hyperlinked to its Block Rationale section (e.g., `[1](#block-1)`)
- **Path**: directory path (without filename)
- **File**: filename only

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

### Review Time Estimation

- Rate: 30 seconds per change (hunk); formula: `total_hunks × 0.5 minutes`
- Round to nearest minute; display as "~X minutes" or "~Xh Ym" for longer reviews
- Count hunks: `git diff <base-branch>...HEAD | grep -c "^@@"`

### Block Rationale Sections

Below the index table, generate a **Block Rationale** section — one subsection per block, giving reviewers meaningful context before they inspect the raw diff:

```markdown
## Block Rationale

### Block 1

[Descriptive paragraph explaining what the change does and why.]
```

Rationale rules:

- Each paragraph is 3–5 sentences covering intent, context, and any non-obvious design choices
- Focus on *why* the change exists, not just *what* it does — reviewers see the *what* in the diff
- Mention relevant prior state, trade-offs, or constraints that informed the approach
- Plain technical language; no vague descriptions like "various improvements"

## User Reporting Protocol

Users report findings using **row numbers only**:

| Format | Meaning |
|--------|---------|
| `3, 7, 12` | Files at rows 3, 7, and 12 have issues |
| `none` | No issues found, proceed with automated reviews |

### Interview Loop

For each reported row number:

1. **Display context:** show the full diff content for that file, including filename and path
2. **Prompt for issue:** "What's the issue with this change?"
3. **Record response:** capture the user's description verbatim; note severity if mentioned (critical, minor, etc.)
4. **Continue:** move to the next reported row until all flagged items are addressed

Special cases:

- **Single row number:** review all changes in that file
- **Row with line reference (e.g., "3-L42"):** focus on the specific line within the file's changes
- **"none" response:** skip the interview loop, proceed to automated reviews

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
