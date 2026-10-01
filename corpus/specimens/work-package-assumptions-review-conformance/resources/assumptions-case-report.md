---
name: assumptions-case-report
description: Template and rules for the assumptions review case report, the one document a run leaves behind.
metadata:
  version: 1.0.0
  order: 1
---

# Assumptions Case Report Guide

## Template

```markdown
# Work Package Assumptions Review Conformance — Case Report

Activity walked: `work-package/assumptions-review`, borrowed, once per case.

| Case | Steps after collecting | Gate raised | Outcomes in the log | Deferred |
|------|------------------------|-------------|---------------------|----------|
| implementation | {the steps, in order} | yes / no — {what the message carried} | {each row's Outcome cell} | yes / no |
| review | {the steps, in order} | yes / no | {each row's Outcome cell} | yes / no |

## What the run evidenced

- implementation — {how the assumptions converged, how the residual set reached the gate, and what the answer wrote into the log}
- review — {how the assumptions converged into the log with no gate}
```

## Rules

### the-review-mark-is-an-absent-gate

A review run is headless, so its row names the absent gate as the review's own mark for a run no user attends. A row that reads the absent gate as one the walk failed to reach has read the review path as a fault.

### a-row-names-the-log-it-read

Each Outcomes cell is read from the log the case left, row by row. A cell that restates what the gate's answer should have written reports the intent as the result.
