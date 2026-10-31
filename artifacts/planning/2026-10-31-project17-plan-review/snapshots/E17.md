## Overview

Require an agent review of an epic's complete integration diff before its In Review handoff to the user. The handoff should include a recorded review of the current head and the disposition of every finding.

## Problem

- **Delivery checks do not establish review completion.**
  Passing task tests and completing acceptance criteria can move an epic to In Review without a review of the combined changes.
- **The user receives avoidable defects.**
  The review of PR #1479 found automatic criterion verification accepting missing evidence links and fenced examples after its delivery checks had passed.

## Proposal

- **The epic handoff includes a review pass.**
  Review the full integration diff, acceptance criteria and validation evidence before completing the In Review transition and handing the epic to the user.
- **Findings have an explicit disposition.**
  Fix blocking findings in the epic branch, run appropriate regression checks and review the resulting head. Record any deferred findings and their linked tickets.
- **Review evidence identifies the revision.**
  Publish the reviewed head, review scope, findings, dispositions and validation in the planning record and link it from the epic review pull request. A changed head requires an updated review before handoff.
- **The handoff preserves human approval.**
  Agent review prepares the epic for the user's review; repository human-approval requirements continue to govern merge.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Done |
| --- | --- | --- | --- | --- | --- |
| [W01](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-31-1482-i11-e17-w01-agent-review-gates-epic/) | Agent review gates epic handoff | AC1, AC2, AC3 | | | |
| [W02](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-31-1482-epic-review-hoist/w02.md) | Audit the delivery review corpus | AC4 | W01 | | |

## Acceptance Criteria

- [ ] **AC1.** An epic's In Review handoff requires recorded agent review evidence for its current integration head, as delivery-procedure fixtures demonstrate for missing, stale and current review records.
- [ ] **AC2.** An unresolved blocking review finding prevents the handoff, as delivery-procedure fixtures demonstrate for open and resolved findings.
- [ ] **AC3.** The handoff links a review record containing scope, findings, dispositions and validation results, as a representative end-to-end delivery trial demonstrates.

- [ ] **AC4.** Every affected delivery instruction consistently requires current-head agent review before user handoff, as a corpus audit of the changed definitions and their callers demonstrates.

## References

- **R1.** [Review findings](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-31-1479-test-plan-evidence/review.md) — The review that identified the missing handoff gate.
