---
name: failure-report
description: Creation guide for the failure report an uncorrectable run persists.
metadata:
  order: 7
---

# Failure Report

Creation guide for bare filename `failure-report.md`. Written when refinement cannot complete on its own. Answers: what remains unresolved after the correction passes, and what a requirements engineer has to do by hand. This is the run's terminal artifact when it fails, so it stands alone for a reader who never saw the validation reports.

## Template

```markdown
# Failure Report — {spec basename}

**Verdict:** critical · **Correction passes attempted:** {n}

## Unresolved issues

| ID | Check | Detail | Manual resolution |
|----|-------|--------|-------------------|
| V3 | source coverage | one line naming the section and the defect | one line naming what to do |

{One line stating that no specification was promoted.}
```

## Rules

- **Every unresolved issue carries a resolution.** An issue listed without the manual step it needs leaves the reader where the run stopped.
- **Issue IDs carry over.** The IDs are the ones the validation reports assigned, so a reader can trace an issue back through the passes; the report links the final validation report rather than restating its findings.
- **No correction narrative.** Which pass tried what belongs to the validation reports. This report states what is still broken.
- **Line budget:** ~30 lines.
