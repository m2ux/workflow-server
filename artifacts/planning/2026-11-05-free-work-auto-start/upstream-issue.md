## Overview

An authorized Work Planner delivery run should automatically start every eligible free unit when execution capacity is available, including work that becomes free as another unit finishes. Repeated requests to deliver the next item should not be needed to keep the authorized scope moving.

## Problem

- **The dispatch round ends while delivery continues.**
  [Deliver mode’s dispatch step](https://github.com/m2ux/workflow-server/blob/d0a62b8037bb1b8fdafac5bf0e0035ada8c64486/skills/work-planner/modes/deliver-mode.md#procedure) starts the surveyed units and returns to its report without a refill loop.
- **Completion frees work without starting it.**
  The unit session returns its result after recording delivery, but no continuing coordinator is assigned to re-read the queue and dispatch newly free units.
- **Available work needs another user request.**
  During Project 17 delivery, completed units were followed by reports naming the next free work without starting it; the user repeatedly requested the next delivery and then explicitly requested automatic starts.

## Proposal

- **Keep the authorized scope moving.**
  The delivery coordinator remains active while its scope has running or eligible work, and dispatches free units up to available execution capacity.
- **Refill on work completion.**
  After a unit completes or a worker slot becomes available, refresh delivery evidence, apply the live queue and survey, then dispatch every newly eligible unit that fits the available capacity.
- **Use the existing eligibility rules.**
  Priority, dependencies, joins, requested lane and current holds decide what is free. Existing reservations and running sessions are resumed or reported rather than duplicated.
- **Hold before execution.**
  Publish the planning record and verify the row reservation before starting each session; the session retains the normal implementation, validation, PR and merge obligations.
- **Retain real decision boundaries.**
  Scope decisions and required human review remain explicit. A blocked unit does not leave independent eligible work idle, and the coordinator reports when no further automatic progress is possible.

## Acceptance Criteria

- [ ] **AC1.** Within one authorized delivery scope, every eligible free unit starts when capacity is available, including units made free by completed dependencies, as an orchestration fixture with one initial authorization and successive completions shows.
- [ ] **AC2.** Automatic dispatch admits only units meeting the current scope, lane, dependency, priority and reservation rules, as orchestration fixtures with held, blocked, out-of-scope and other-lane units show.
- [ ] **AC3.** Each automatically started session has its planning record published and its reservation verified before execution, as an ordered dispatch-event fixture shows.
- [ ] **AC4.** Independent eligible units keep starting while another unit is blocked or waiting for required review, as an orchestration fixture with mixed unit states shows.

## References

- **R1.** [Deliver mode](https://github.com/m2ux/workflow-server/blob/d0a62b8037bb1b8fdafac5bf0e0035ada8c64486/skills/work-planner/modes/deliver-mode.md) — the dispatch round and the unit session lifecycle.
- **R2.** [Delivery Plan](https://github.com/m2ux/workflow-server/blob/d0a62b8037bb1b8fdafac5bf0e0035ada8c64486/skills/work-planner/artifacts/delivery-plan.md) — free units, holds and availability findings.
