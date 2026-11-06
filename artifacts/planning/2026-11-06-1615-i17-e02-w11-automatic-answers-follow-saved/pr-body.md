## Overview

Advance sends an allowed automatic queue answer through saving, confirmed board readback and recomputation before the queue can continue. Held or unanswered decisions remain pending.

## Changes

### Answer Continuation

- **Saved queue evidence.**
  Answered decisions share the save/readback/recompute route; failed saves and unavailable or disagreeing readback return the pending queue.
- **Complete refreshed queue.**
  Advance reaches Status and assignee writes only after refreshed queue completeness is established by its owning definition.

### Observing Fixtures

- **Captured queue scenarios.**
  Source-selected route tests use concrete queue captures and negative controls, alongside separate fresh-context procedure evidence.

## Test Plan

| Test | Description | Coverage | Pass |
| --- | --- | --- | --- |
| T1 | Captured queue and bounded source-selected route checks | AC18 | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1615-i17-e02-w11-automatic-answers-follow-saved/validation.md#observed-route-fixtures) |
| T2 | Independent fresh-context procedure trace | AC18 | |
| T3 | Full planner/shared suites, installed document/model checks, skill checker and whitespace | | [✓](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1615-i17-e02-w11-automatic-answers-follow-saved/validation.md#full-checks) |

## References

- **R1.** [Automatic answer decision](https://github.com/m2ux/workflow-server/blob/40d65b7757717f6931dedec7a37243ffa9197db7/artifacts/planning/2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and/policy-decisions.md#p1--automatic-answers) — confirmed save, verify and recompute policy.
- **R2.** [Work item](https://github.com/m2ux/workflow-server/blob/65d8afc931cf8be72c39b4ae28bc46099deb99ca/artifacts/planning/2026-11-06-1615-i17-e02-w11-automatic-answers-follow-saved/w11.md) — component scope and observing validation.
