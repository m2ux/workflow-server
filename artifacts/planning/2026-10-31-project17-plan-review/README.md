# Project 17 plan review — October 2026

> Review · Created 2026-10-31

## Executive Summary

Review all 18 epics and 117 task rows on Project 17 for dependencies, gaps, Joins, consistency, contradictions and supersession. The graph is acyclic but the plan is not consistent enough for unrestricted parallel delivery.

Six P1 findings and eleven P2 findings identify required reconciliation. No plan corrections or extra delivery sessions are applied. The prioritized E17 delivery continues with the relevant findings communicated to its agent.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Applied corrections](applied-corrections.md) | Approved AC36 placement and AC1 cancellation corrections |
| [Findings](findings.md) | Seventeen evidenced findings and proposed corrections |
| [Epic assessment](epic-assessment.md) | All board epics and their review outcome |
| [Dependency report](dependencies.txt) | Full graph, Joins advisories, components and historical chains |
| [Components](components.json) | Twenty-three linked work items and declared components |
| [Unlinked work items](missing-work-items.json) | Twenty-seven unfinished rows without a resolvable linked work item |
| [Snapshots](snapshots/) | Issue bodies, format outputs, requirements and relevant decisions |

## Verification

- All 18 epic bodies and I11 inspected; format checks run read-only.
- Dependency checker supplied all epics and six relevant planning records: no cycles or unknown row references; ten whole-epic task edges reported.
- 428 pairs remain unaccounted by the machine-readable Joins check, including 343 across open E09, E10 and E14. Existing prose accounts for some pairs but is stale or not in the parser's form; these counts do not mean every pair should be joined.
- E09 cancellation reproduced as a closure blocker with every other criterion ticked in a temporary specimen.
- I11 format confirms AC36 is outside Acceptance Criteria.
- Current source/tests inspected to distinguish actual remaining work from historical or overlapping criteria. Historical PR test suites and all meeting transcripts were not rerun or re-audited; this is a plan review, not a fresh certification of every closed epic.

## Suggested order

1. Correct AC36 placement and cancelled AC1 representation without changing surviving IDs.
2. Settle active status, integration, interface and review-readiness contracts; record supersession.
3. Reconcile duplicate ownership and final-evidence dependencies.
4. Complete work items and every open-epic pair decision, then recompute contention and parallel delivery.
5. Run initiative verification instruments and record their evidence.

## Links

| Resource | Link |
| --- | --- |
| Board | https://github.com/users/m2ux/projects/17/views/4 |
| Initiative | https://github.com/m2ux/workflow-server/issues/1166 |
| Priority delivery | https://github.com/m2ux/workflow-server/issues/1482 |
