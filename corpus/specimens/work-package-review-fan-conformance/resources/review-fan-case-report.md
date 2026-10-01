---
name: review-fan-case-report
---

# Review Fan Case Report

## Template

| Case | Pipeline mode | Code report | Test report | Structural findings |
|---|---|---|---|---|
| {n} | {pipeline_mode} | present / absent | present / absent | {count} |

## Rules

- One row per case walked, in walk order.
- `present` means the join held a non-empty report object under that bare name after hoisting the branch container.
- On the full-prism case, structural findings count is zero at this join.
