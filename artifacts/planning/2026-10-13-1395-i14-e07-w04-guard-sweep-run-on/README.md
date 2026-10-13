# Guard Sweep Run on the Branch It Grades — October 2026

> Delivery · Created 2026-10-13

## Executive Summary

I14:E07 W04 gives the guard sweep a run on the commit a merge produces. `verify-corpus.yml` declares `pull_request` and `workflow_dispatch` and no push trigger, so the corpus tip is swept on a proposed merge and never on the tip the merge made. A question asked of the corpus branch's latest run is answered by whatever was dispatched by hand last.

Two pull requests that each sweep clean can merge into a tip that does not, and no run states that. Engine CI already pushes to the branches that take merges directly, because such a branch reaches no pull request of its own; the corpus branch takes merges the same way. This work closes the epic's remaining criterion on the corpus half of what it grades.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W04](w04.md) | Guard sweep run on the branch it grades |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I14:E07 Red Trunk](https://github.com/m2ux/workflow-server/issues/1395) |
| W04 issue | [I14:E07:W04 Guard Sweep](https://github.com/m2ux/workflow-server/issues/1415) |
| Plan reconciliation | [The reach each criterion is held to](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-13-1395-i14-e07-plan-reconciliation/README.md) |
