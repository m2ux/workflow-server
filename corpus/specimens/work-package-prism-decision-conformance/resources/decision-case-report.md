---
name: decision-case-report
description: Template and rules for the prism decision case report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# Decision Case Report Guide

## Template

```markdown
# Work Package Prism Decision Conformance — Case Report

Activity walked: `legacy/prism-decision`, borrowed, once per case.

| Case | Bindings | Gate raised | Recommendation shown | Mode settled |
|------|----------|-------------|----------------------|--------------|
| implementation | complex, review false; the change measured against {base} at {head_sha} — {changed file count} files | yes / no | {the recommendation, verbatim} | `single` / `full-prism` |
| review | complex, review true | yes / no | {the recommendation, or absent} | `single` / `full-prism` |

## What the run evidenced

- implementation — {how the change was measured, how the recommendation reached the gate, and what the answer set}
- review — {how the gate was left, and what the review step preset}
```

## Rules

### the-review-mark-is-an-absent-gate

A review run is headless, so its row names the absent gate and the absent recommendation as the decision's own mark for a run no user attends. A row that reads the absent gate as one the walk failed to reach has read the review path as a fault.

### a-case-reports-only-what-it-measured

A review run measures nothing, so its row carries no change and no recommendation. A row showing values the implementation case left in the session reports another case's outcome as its own.
