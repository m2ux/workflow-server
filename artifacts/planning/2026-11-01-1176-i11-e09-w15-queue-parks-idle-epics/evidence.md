# W15 Delivery Evidence

Delivery head: `300804da7c58797deac2b79f56a1c748c3425313` on `i11/e09/w15-queue-parks-idle-epics`. Base: `400703b086b86a2e5d9135d4e6d9f89cdb7d630d` (`i11/e09/workspace`), unchanged since the branch was cut.

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

`python3 -m pytest skills/work-planner/test -q`: `531 passed, 1033 subtests passed`. `python3 skills/scripts/check_skill_files.py skills/work-planner`: `50 files checked, 0 findings`.

Result: passed.

## Plan Changes

None applied and none held. The unit created no task, epic or issue, folded no work and moved no row; validation found no debt to defer and no arising issue.
