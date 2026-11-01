# W15 Delivery Evidence

Delivery head: `b8afe8174adf2cde98473e829ac6a1f4296cefa7` on `i11/e09/w15-queue-parks-idle-epics`. Base: `d33e9983a1a5125eb54f4befe3dc86112db30806` (`i11/e09/workspace`, carrying W14's #1522), merged into the branch at that head. The work was first tested at `300804da7` on base `400703b08`; T1 and T2 touch no path the merge changed, and T3 ran again on the delivery head.

Pull request: [#1523](https://github.com/m2ux/workflow-server/pull/1523).

Changed paths: `skills/work-planner/scripts/board-queue.py`, `skills/work-planner/test/test_board_queue.py`, `skills/work-planner/artifacts/board-queue.md`.

Every command ran from the unit worktree under the workspace sandbox: `python3 -m pytest skills/work-planner/test ...`.

## T1 Cascade Test Asserts the Method

AC21. `BacklogTakesTheTree.test_unstarted_epics_return_without_an_assignee_and_done_stays` asserts `gh api --method DELETE repos/o/r/issues/3/assignees -f 'assignees[]=me'`, the same for issue 1, and no `--method POST repos/o/r/issues/`.

- With `statuses.py` line 84 edited to emit `--method POST` for a Backlog issue's assignees: `1 failed`, `AssertionError: "gh api --method DELETE repos/o/r/issues/3/assignees -f 'assignees[]=me'" not found`, the output carrying `gh api --method POST repos/o/r/issues/3/assignees -f 'assignees[]=me'`.
- With `statuses.py` restored: `1 passed`.

Result: passed.

## T2 Waiting Initiative Parks an Idle Epic

AC22. `ReadyFollowsTheInitiative.test_an_inactive_epic_in_progress_under_a_waiting_initiative_returns_to_backlog`: an initiative held In Progress by an open pull request on its E00, with E01 inactive and In Progress, below a higher initiative. Subtests for the next set, a lower set and an unplanned initiative each assert `wait #1`, `[I01:E01] Epic 5: Work: In Progress → Backlog`, and no move for the active E00.

- On the base's `board-queue.py`: all three subtests fail; E01 gets no move.
- On the delivery head: all three pass.

`board-queue.md` Epic Status states: "its active epics stay In Progress, and its Ready epics and its inactive epics In Progress move to Backlog."

Result: passed.

## T3 Full Suite

`python3 -m pytest skills/work-planner/test -q`: `532 passed, 1036 subtests passed` on the delivery head (`531 passed, 1033 subtests passed` at `300804da7`). `python3 skills/scripts/check_skill_files.py skills/work-planner`: `50 files checked, 0 findings`.

Result: passed.

## T4 Waiting Initiative Raises an Active Epic

Trivial debt found while validating T2: an initiative waiting in a set below the next, or unplanned, never reaches `Queue.activate`, so an active epic of it outside In Progress kept its Status while `board.py` raised it and `board-queue.md` named it In Progress. `Queue.park` places every open epic of a waiting initiative short of In Review by its activity. Delivered on the same branch through [#1527](https://github.com/m2ux/workflow-server/pull/1527), head `d5ff44210f6e4beee10866fa5ac8a556fba8726d`, base `bdc2524f64b45ee2fdf1b0e95638ee67c7953671`.

`ReadyFollowsTheInitiative.test_an_active_epic_under_a_waiting_initiative_is_in_progress`: E00, active through an open delivery pull request and held Backlog, under an initiative waiting in the next set and unplanned. Each subtest asserts `[I01:E00] Epic 3: Work: Backlog → In Progress` and no move for the inactive E01 held Backlog.

- On #1523's `board-queue.py`: the unplanned subtest fails; the next-set subtest passes, since that set reaches `activate`.
- On the head: both pass. Suite `536 passed, 1054 subtests passed`; `check_skill_files.py` `50 files checked, 0 findings`.

`board-queue.md` Epic Status states: "its active epics are In Progress, and its inactive epics in Ready or In Progress move to Backlog."

Result: passed.

## Plan Changes

None applied and none held. The unit created no task, epic or issue, folded no work and moved no row; validation found one trivial debt, fixed in this unit through #1527 (T4), none to defer and no arising issue.
