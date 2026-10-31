## Overview

A board hands out the work it makes available. Advance brings a theme board to the positions its issues imply and names what is ready, taking priority into account. Deliver runs Advance, then starts a session for each available unit of work, holding the row it has taken so no second run starts it elsewhere.

## Problem

- **Readiness decided by reading.**
  Finding what could start next meant reading every epic and its dependencies, so the answer varied with who read it.
- **Priority ignored.**
  Work was offered in issue order rather than by priority, so a board's most important available work was not the work offered first.
- **Nothing started the work.**
  A board could say what was ready without anything acting on it, so the step from a plan to a session was manual every time.
- **No hold on a row.**
  Nothing recorded that a session had taken a row, so two runs could start the same unit of work.
- **A hold with no release.**
  A session that died before opening a pull request would leave its row held, with nothing to notice or clear it.

## Proposal

- **Advance.**
  It brings the board's open initiatives in step, then names the available work by priority set.
- **Deliver.**
  It runs Advance, then dispatches a session for each available unit, which is one pull request's worth of work. The user confirms the set before anything starts.
- **The hold is a link.**
  A dispatched row links the planning folder its session will write. That link is the hold: a later run passes over a row that has one. The folder is named for the task's own issue, or for its epic's where the task has none.
- **Dispatched work moves.**
  A row a session has taken goes to In Progress.
- **A reported release.**
  Each run reports the rows held with no pull request open on them, and the user releases the ones whose session is gone.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Done |
| --- | --- | --- | --- | --- | --- |
| [W01](https://github.com/m2ux/workflow-server/pull/1122) | Advance a theme board by priority set | AC1, AC2 | [E05](https://github.com/m2ux/workflow-server/issues/1172) | | ✓ |
| [W02](https://github.com/m2ux/workflow-server/pull/1164) | Start the work a board makes available | AC3, AC4, AC5 | W01 | | ✓ |

## Acceptance Criteria

- [x] **AC1.** A theme board's open initiatives are brought in step before any work is offered from it.
- [x] **AC2.** The work a board makes available is offered by priority set.
- [x] **AC3.** One dispatched session's unit of work is one pull request's worth, and the user confirms the set before any session starts.
- [x] **AC4.** A dispatched row links the planning folder of the session holding it, and a row carrying that link is passed over by a later run.
- [x] **AC5.** Each run reports the rows held with no pull request open on them.

## References

- **R1.** **Source.** [Work Planner Retrospective](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-06-work-planner-retrospective) — The sessions in which advance and deliver were specified.
- **R2.** [Work Planner: The Scheme That Plans Every Other Piece of Work](https://github.com/m2ux/workflow-server/issues/1166) — I11, the initiative this epic belongs to.
