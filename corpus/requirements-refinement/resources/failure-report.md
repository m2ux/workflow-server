---
name: failure-report
description: Creation guide for the failure report an uncorrectable run persists.
metadata:
  order: 7
---

# Failure Report

Creation guide for bare filename `failure-report.md`. Written when the run stops with unresolved critical issues. Answers: what remains unresolved after the correction passes, and the manual resolution each issue needs. It stands alone for a reader who never saw the validation reports.

## Template

```markdown
# Failure Report — {spec basename}

**Verdict:** critical · **Correction passes attempted:** {n}

**Validation report:** [final pass]({path})

## Unresolved issues

| ID | Manual resolution |
|----|-------------------|
| V3 | one line naming what to do |

{One line stating that this run staged no specification.}
```

## Rules

- **Every unresolved issue carries a resolution.** An issue listed without the manual step it needs leaves the reader where the run stopped.
- **Issue IDs carry over.** The IDs are the ones the validation reports assigned. The report links the final validation report rather than restating its findings.
- **This report states what is still broken.** Which pass tried what belongs to the validation reports.
- **Line budget:** ~30 lines.
