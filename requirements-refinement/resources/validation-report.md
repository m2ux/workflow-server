---
name: validation-report
description: Creation guide for the validation report each pass persists.
metadata:
  order: 6
---

# Validation Report

Creation guide for bare filename `validation-report-{correction_iteration}.md`. One report per correction pass. Answers: did the specification pass, does it cover the source in full, and which issues are blocking versus correctable.

## Template

```markdown
# Validation Report — pass {n}

**Verdict:** passed | correctable | critical · **Source coverage:** complete | incomplete

## Issues

| ID | Check | Category | Detail |
|----|-------|----------|--------|
| V1 | identifier uniqueness | critical \| correctable | one line naming the section and the defect |

## Coverage gaps

| Source statement | Why unmapped |
|------------------|--------------|
| `SRC-DOC012` | one line |
```

## Rules

- **Exceptions only.** A pass with no issues carries the verdict line and one line saying every check passed — not a table of passing checks.
- **Categories come from the rubric.** Each issue's check and its critical-or-correctable category are assigned per [Issue Categorization](./validation-rubric.md#issue-categorization); this template records the assignment.
- **Every issue carries an ID.** A later correction pass reports against these IDs, so they are stable within the run.
- **Coverage gaps are omitted when coverage is complete.**
- **Line budget:** ~40 lines.
