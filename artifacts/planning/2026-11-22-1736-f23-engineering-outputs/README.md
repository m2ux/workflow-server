# Engineering Output Availability — November 2026

> Hotfix delivery · Created 2026-11-22

## Executive Summary

F23 retains the branch identity of a directly pushed planning-records output. Its dependent task can read that evidence on engineering without requiring it in the product base.

The change preserves the existing product-branch ancestry gate. A synthetic local Git reproduction establishes the defect without external service calls or private project inputs.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Review Handoff](handoff.json) | Confirmed ready head, In Review status and required human approval |
| [Agent Review](agent-review.json) | Exact-head integration review, fixed guidance finding and source-bound validation |
| [Validation](validation.md) | Candidate revision, checks, observations and limits |
| [Focused Results](regressions.txt) | Synthetic local-Git and branch-reader regression output |
| [Review Checks](review-checks.txt) | Focused regressions and documentation checks for the dispatch guidance correction |
| [Suite Results](suite.txt) | Complete Work Planner test result |
| [Work Item](f23.md) | Declared files, exact behavior and focused verification |
| [Synthetic Reproduction](reproduce.py) | Current branch-less failure and known-engineering success on local Git repositories |
| [Reproduction Result](reproduction.json) | The measured unmet/met contrast before implementation |

## Links

| Resource | Link |
| --- | --- |
| Delivery | [PR #1737](https://github.com/m2ux/workflow-server/pull/1737) |
| Hotfix | [F23 #1736](https://github.com/m2ux/workflow-server/issues/1736) |
| Board | [Process #17](https://github.com/users/m2ux/projects/17) |
