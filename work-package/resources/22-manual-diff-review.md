---
id: manual-diff-review
version: 1.0.0
---

# Manual Diff Review Guide

**Purpose:** Structured process for human review of code changes using an external side-by-side diff tool. This guide covers file index generation, user reporting protocol, and interview-based finding collection.

---

## Overview

Manual diff review enables focused human review of implementation changes before automated analysis. The process generates an indexed reference table, allowing users to review changes in their preferred diff tool and report findings by reference number.

The review process produces:
1. **File Index Table** (`change-block-index.md`) - Reference table for cross-checking during review
2. **Manual Diff Review Report** (`manual-diff-review.md`) - Structured findings from user interview

---

## File Index Generation

### Pre-Generation Steps

1. **Ensure branch is current:**
   ```bash
   git pull
   ```

2. **Identify base branch:**
   - Typically `main` or `master`
   - Use the branch the PR will merge into

3. **Generate diff:**
   ```bash
   git diff <base-branch>...HEAD
   ```

### Table Format

Generate a table with one row per changed file, sorted alphabetically by path. Each row number is a markdown hyperlink to its rationale section further down the document:

```markdown
| Row | Path | File |
|-----|------|------|
| [1](#block-1) | src/api/ | handlers.rs |
| [2](#block-2) | src/api/ | routes.rs |
| [3](#block-3) | src/core/ | processor.rs |
| [4](#block-4) | tests/ | integration_test.rs |
```

**Column definitions:**
- **Row**: Sequential number hyperlinked to its Block Rationale section (e.g., `[1](#block-1)`)
- **Path**: Directory path (without filename)
- **File**: Filename only

### Header Information

Include summary statistics at the top of the index file:

```markdown
# Change Block Index

**Branch:** feature/my-feature vs main
**Files Changed:** 24
**Total Changes:** 47 hunks
**Estimated Review Time:** ~24 minutes (30 sec/change)

## Instructions

Review changes in your side-by-side diff tool using this index for reference.
Click any row number to jump to its rationale paragraph for context on why the change was made.
Report row numbers for files with issues (e.g., "3, 7, 12") or "none" if all looks good.
```

### Review Time Estimation

Calculate estimated review time:
- **Rate:** 30 seconds per change (hunk)
- **Formula:** `total_hunks × 0.5 minutes`
- **Format:** Round to nearest minute, display as "~X minutes" or "~Xh Ym" for longer reviews

To count hunks:
```bash
git diff <base-branch>...HEAD | grep -c "^@@"
```

### Block Rationale Sections

Below the index table, generate a **Block Rationale** section. Each block gets a subsection with a descriptive paragraph explaining what the change does and why. The primary purpose is to give reviewers meaningful context before they inspect the raw diff.

```markdown
## Block Rationale

### Block 1

This change adds input validation to the API handler to prevent malformed
payloads from reaching the processing layer. Previously, invalid data would
propagate silently and cause cryptic errors downstream. The validation uses
the same Zod schema already defined for the public API contract, ensuring
consistency between the endpoint documentation and runtime enforcement.

### Block 2

The route registration was refactored to use a declarative table-driven
approach instead of individual `app.get()`/`app.post()` calls. This reduces
boilerplate and makes it easier to audit which endpoints exist, what methods
they accept, and which middleware they use — all visible in a single array.

### Block 3
...
```

**Rationale guidance:**
- Each paragraph should be 3–5 sentences covering intent, context, and any non-obvious design choices
- Focus on *why* the change exists, not just *what* it does — reviewers can see the *what* in the diff
- Mention relevant prior state, trade-offs, or constraints that informed the approach
- Use plain technical language; avoid vague descriptions like "various improvements"

---

## User Reporting Protocol

### Reporting Format

Users report findings using **row numbers only**:

| Format | Meaning |
|--------|---------|
| `3, 7, 12` | Files at rows 3, 7, and 12 have issues |
| `none` | No issues found, proceed with automated reviews |

### Interview Loop

For each reported row number:

1. **Display context:**
   - Show the full diff content for that file
   - Include filename and path

2. **Prompt for issue:**
   > "What's the issue with this change?"

3. **Record response:**
   - Capture user's description verbatim
   - Note severity if mentioned (critical, minor, etc.)

4. **Continue to next:**
   - Move to next reported row
   - Repeat until all flagged items are addressed

### Handling Special Cases

**Single row number:** Review all changes in that file

**Row with line reference (e.g., "3-L42"):** Focus on specific line within the file's changes

**"none" response:** Skip interview loop, proceed to automated reviews

---

## Report Generation

### Manual Diff Review Report Template

```markdown
# Manual Diff Review Report

**Work Package:** [Name]  
**Branch:** [feature-branch] vs [base-branch]  
**Date:** YYYY-MM-DD  
**Reviewer:** [Name]

---

## Review Summary

| Metric | Value |
|--------|-------|
| Files Reviewed | [X] |
| Files Flagged | [Y] |
| Critical Issues | [Z] |
| Total Findings | [N] |

---

## Findings

### Finding 1: [Brief Title]

**File:** `path/to/file.ext`
**Row:** [N]
**Severity:** Critical / High / Medium / Low

**Issue:**
[User's description of the issue]

**Recommendation:**
[Suggested fix or action, if provided]

---

### Finding 2: [Brief Title]

...

---

## Actions Required

| # | Action | File | Priority |
|---|--------|------|----------|
| 1 | [Action description] | `file.ext` | High |
| 2 | [Action description] | `file.ext` | Medium |

---

## Review Outcome

**Result:** [Issues Found / No Issues]

**Next Steps:**
- [ ] Address critical findings before proceeding
- [ ] Proceed to automated code review
- [ ] Proceed to test suite review
```

---

## Best Practices

- **Use a dedicated diff tool:** VS Code, Beyond Compare, Meld, or similar
- **Review systematically:** Top to bottom, or by logical grouping
- **Note context:** Reference surrounding code when describing issues
- **Be specific:** Include line numbers or code snippets in descriptions
