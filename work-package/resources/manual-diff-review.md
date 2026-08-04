---
name: manual-diff-review
description: Lean-header and report-section forms for the manual diff review.
metadata:
  version: 2.3.0
  order: 22
  legacy_id: 22
---

# Manual Diff Review Forms

## File Index Generation

### Index Format

Open with a lean-header summary line, then one rationale section per changed block. Each **Block** title hyperlinks to the primary `file:line` in the diff as a permanent blob URL at the reviewed commit. No separate Instructions section and no file-index table — the Block titles are the navigation.

```markdown
# Change Block Index

> feature/my-feature vs main · 24 files · 47 hunks · est. review ~24 minutes (30 sec/change)

## Block Rationale

### [Block 1 — handlers.rs:42]({CODE_BASE_URL}/src/api/handlers.rs#L42)

[Descriptive paragraph explaining what the change does and why.]

### [Block 2 — routes.rs:18]({CODE_BASE_URL}/src/api/routes.rs#L18)

[Descriptive paragraph explaining what the change does and why.]
```

Reviewers use their side-by-side diff tool with this index for context. Reply with block numbers that have issues (e.g. `3, 7, 12`) or `none`.

### Block Rationale Form

`{CODE_BASE_URL}` is the permanent blob-URL prefix at the commit under review, supplied by the rendering step; a citation appends the repo-relative path and a line anchor.

```markdown
## Block Rationale

### [Block N — file:line]({CODE_BASE_URL}/repo-relative/path.ext#L{line})

[Descriptive paragraph explaining what the change does and why.]
```

## Report Generation

### Manual Diff Review Section Template

An `##`-level section, so it nests inside a host document rather than standing alone:

```markdown
## Manual Diff Review

> [feature-branch] vs [base-branch] · [X] files reviewed · reviewer: [Name] · [Issues Found / No Issues]

[Omit the findings list if the user reported "none" — the header line is the whole record.]

### MD-1: [Brief Title]

**File:** [`path/to/file.ext`]({CODE_BASE_URL}/path/to/file.ext#L{line}) · **Block:** [N] · **Severity:** Critical / High / Medium / Low  
**Issue:** [User's description of the issue]  
**Recommendation:** [Suggested fix or action, if provided]
```

## Rules

### permanent-blob-citations

Every change-block and finding citation is a permanent blob URL at the commit under review — the repository host, the full commit sha, the repo-relative path, and a line anchor. A path relative to the working checkout resolves only for as long as that checkout exists, and a review worktree is removed at close-out, so a checkout-relative citation stops resolving inside the run that wrote it. Blob URLs also survive the branch moving on, which a branch-anchored citation does not.
- **Line budget:** ~5 lines per block rationale, and one section per block. The index grows with the diff, so the ceiling is per block.
