# W04 Delivery Evidence

Branch `i11/e09/w04-ready-and-backlog-follow`, cut from `i11/e09/workspace` at `3f7915377`. Evaluated at `eede7395e`, and again at `9abfb5912` after merging the epic base at `cd8e9cd9f` (W07, #1501).

Changed paths: `skills/work-planner/scripts/board.py`, `scripts/board-queue.py`, `test/test_board.py`, `test/test_board_queue.py`, `artifacts/board-queue.md`, `modes/advance-mode.md`. Each is in the work item's file-change declaration.

## Ready

Queue fixtures in `test_board_queue.py` `ReadyFollowsTheInitiative`, and `Startable` in `test_board.py` (AC4).

- Three ranked initiatives the queue places In Progress, Ready and Backlog, each with one unstarted epic held Backlog: the epics of the In Progress and Ready initiatives move to Ready, with a `next` line for the Ready initiative; the Backlog initiative's epic does not move.
- The same epics held Ready: those under In Progress and Ready stay; the one under Backlog moves to Backlog.
- An unmet delivery prerequisite (the initiative row depends on an open issue) moves every Ready epic to Backlog, whatever its parent's status.
- An unmet planning prerequisite (an Open Questions entry) leaves every epic in Backlog under every parent status.
- A Ready epic of an initiative In Review moves to Backlog.
- `Board.startable` answers UNMET while the prerequisite epic is open and MET once it is completed, UNMET for an open question whatever the delivery state, and UNRESOLVABLE for an entry naming no row and linking no issue.
- `test_a_higher_priority_takes_in_progress_once_pull_requests_finish` now asserts that the epic of an initiative moving to Ready, whose prerequisites are met, becomes Ready, and the epic waiting on it does not.
- At the base revision, the two placement fixtures, the revised fixture and the three `Startable` cases fail.

## Backlog

Queue fixtures in `test_board_queue.py` `BacklogTakesTheTree`, and `test_a_backlog_epic_takes_its_unstarted_task_issues_and_keeps_done` in `test_board.py` (AC5).

- An unlabelled Ready initiative, assigned, with a Done epic and an assigned Ready epic: the initiative and the Ready epic move to Backlog and each loses its assignee; the Done epic receives no call.
- An In Review epic, a reserved epic, or an epic with an open delivery pull request: the queue prints `reconcile` naming the epic as `(In Review)` or `(work under way)`, and proposes no move for the initiative or any of its epics.
- An unplanned In Progress initiative whose epic is reserved and has no open pull request is reported on a `reconcile` line and stays In Progress, while the next initiative starts.
- Board Delivery on a Backlog epic: its assigned Ready task issue moves to Backlog with its assignee removed, and its Done task issue receives no call.
- At the base revision, the four reconcile fixtures fail; the In Review case ends with a QUEUE jurisdiction refusal.

## Suite

- `python3 -m unittest discover -s test` from `skills/work-planner`: 513 tests, OK at `eede7395e`; 523 tests, OK at `9abfb5912`.
- `python3 -m pytest skills/work-planner/test -q`: 513 passed at `eede7395e`; 523 passed, 1029 subtests passed at `9abfb5912`.

## Documents

`skills/scripts/check_skill_files.py skills/work-planner`: 51 files checked, 0 findings. `test_documents.py` passes, including Prerequisites against used links (`board-queue.md` now reads `board.md` for Assignees).

## Review

- `Board.startable` is the one reading of an unstarted epic's prerequisites; the queue calls it, and `READY_UNDER` is the one set of parent statuses under which a child can be Ready, read by `board.py` for task issues and by the queue for epics.
- Board Delivery still never moves an epic between Ready and Backlog (the DELIVERY jurisdiction refuses it); the epic half of both rules is the queue's, and the task half is Board Delivery's.
- An initiative returning to Backlog while an epic is active or In Review stays where it stands, so the queue proposes nothing the QUEUE jurisdiction refuses.
