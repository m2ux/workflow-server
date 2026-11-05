# Dispatch Review Fixes

## Scope

Base: `03d353300` on `workspace`. Branch: `skill/1636-dispatch-review-fixes`. The user explicitly requests a separate fixes PR because #1636 is merged. The three findings bound this change; inherited disclosure cleanup is separate work.

## Ownership

- Delivery Branches owns validation of a retained task worktree. A new operation verifies its repository registration, branch, recorded preparation revision and clean state through a subject script. Creation returns the recorded revision. Unit Dispatch selects creation for a new unit and validation for its retained preparation.
- Dispatch Batch owns recorded run and unit blockers. Its existing batch and start operations apply those blockers. Unit Dispatch returns the blocker scope; Deliver retains the result and reports a run blocker immediately. Unit blockers exclude the failed unit while independent work continues. New evidence can resolve a blocker; elapsed time supplies no resolution.
- Board Queue's Priority Sets owns ordering. A shared priority reader supplies the existing queue, delivery survey and standup reader. The survey orders admitted units by initiative priority and by epic priority within that initiative before export. Dispatch Batch consumes that order and owns only scope, occupancy and capacity.

## Verification

| Finding | Regression evidence |
| --- | --- |
| Prepared units fail on a second worktree creation | Real temporary Git worktrees exercise retained validation, preservation, foreign repositories, branch/revision mismatches and dirty state. |
| Missing capability can select the same free unit indefinitely | Batch/start fixtures retain run and unit blockers, show a stable stop across refreshes and permit independent units; protocol traces route capability blockers before holds. |
| Capacity truncation selects lower-priority work | Real queue and survey fixtures with a single free slot select higher-priority eligible work, preserving joins, lanes, parent identity and deterministic ties. |

Full Work Planner and shared checker suites, skill-file validation, final diff review and representative disclosure traces follow the focused regressions. Local behavior and live GitHub execution remain distinct evidence.

## Checklist

- [x] Verify #1636 is merged and create an isolated branch from current workspace.
- [x] Implement and verify retained-worktree validation.
- [x] Implement and verify stable dispatch blockers.
- [x] Implement and verify priority ordering.
- [ ] Complete regression checks, commit and push, and open the separate fixes PR.
