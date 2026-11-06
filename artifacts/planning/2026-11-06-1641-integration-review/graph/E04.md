## Overview

Work Planner leaves failed readiness and merge attempts in an explicit, verified state. Hot-fix review failure withdraws ready state, and epic integration follows the owning merge result without unintended retries or success assertions.

## Problem

- Hot-fix readiness can fail after marking a pull request ready, while the repair route promises draft state without an explicit restoring write and readback.
- Epic integration treats refusal generically although the owning merge operation distinguishes harness denial and GitHub refusal, and its final readback assumes a merge.
- The task merge command omits the verified head SHA, so a head moving between verification and the mutation can merge unverified content.
- The merge-permission field describes task-to-epic-base authorization while the shared operation handles further delivery targets.

## Proposal

Deliver Mode selects the existing draft command and confirms its result before hot-fix repair. Pull Request owns explicit merge outcomes and the permission boundary; Epic Integration consumes them with bounded retry and terminal handoff/refusal branches. One atomic unit changes the shared merge contract and its epic caller. The task merge mutation includes its verified head SHA; a mismatch supplies refusal evidence for fresh verification within the existing retry bound. Behavior is verified with ordered calls and terminal-result fixtures, including restoration failure and each refusal source.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Lane | Done |
| --- | --- | --- | --- | --- | --- | --- |
| [W01](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-delivery-failure-recovery/w01.md) | Confirm draft state after failed hot-fix readiness | AC1, AC2, AC3 | [E01:W08](https://github.com/m2ux/workflow-server/issues/1616) | | | |
| [W02](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-delivery-failure-recovery/w02.md) | Explicit merge outcomes and permission boundaries | AC4, AC5, AC8 | [E01:W08](https://github.com/m2ux/workflow-server/issues/1616) | W03 | | |
| [W03](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-delivery-failure-recovery/w03.md) | Epic continuation follows the merge outcome | AC6, AC7 | [E01:W08](https://github.com/m2ux/workflow-server/issues/1616) | W02 | | |

## Acceptance Criteria

- [ ] **AC1.** A hot-fix validation failure after a ready write selects draft restoration and confirms current draft state before repair, as ordered failure-route fixtures show.
- [ ] **AC2.** A failed restoration or disagreeing readback produces an explicit unresolved discrepancy without claiming draft state or reaching merge/In Review, as negative fixtures show.
- [ ] **AC3.** Passing hot-fix review and ready readback reaches normal merge exactly once, as a positive route fixture shows.
- [ ] **AC4.** Merge Delivery Pull Request provides distinct confirmed-merge, human-handoff, harness-denial and GitHub-refusal outcomes with current head/target evidence, as contract and outcome fixtures show.
- [ ] **AC5.** Merge Permission describes the existing authorization/capability boundary for each supported delivery target without authorizing protection bypass or widening harness permission, as source review against configured target requirements and permission-denial fixtures shows.
- [ ] **AC6.** Epic integration terminates human handoff and harness denial without same-run retry or merged-success readback, as ordered negative fixtures show.
- [ ] **AC7.** Epic integration retries GitHub refusal only within the existing bound after fresh verification, terminates repeated refusal, and confirms merged head/target/commit only after a confirmed merge, as route fixtures show.

- [ ] **AC8.** The task merge mutation includes the verified head SHA and refuses a moved head without a success claim or unchecked retry, as captured-request and moving-head refusal fixtures show.

## References

- **R1.** [Recovery design](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1597-delivery-failure-recovery/design.md) — source evidence, ownership, units and regression matrix.
