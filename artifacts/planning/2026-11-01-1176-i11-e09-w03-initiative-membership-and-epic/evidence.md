# W03 Delivery Evidence

Branch `i11/e09/w03-initiative-membership-and-epic`, cut from `i11/e09/workspace` at `f03df4884`. Evaluated at `a7d467adc`.

Changed paths: `skills/work-planner/scripts/board.py`, `scripts/board-queue.py`, `scripts/agent_review.py`, `test/test_board.py`, `test/test_board_queue.py`, `artifacts/board-delivery.md`, `artifacts/board-queue.md`, `modes/advance-mode.md`. Each is in the work item's file-change declaration.

## Membership

Board fixtures in `test_board.py` `InitiativeMembership`, and the queue fixture `test_a_pull_request_naming_an_epic_the_table_does_not_list_does_not_hold_the_swap` (AC2).

- An epic absent from the initiative's table, active and given with `--epics`, leaves a Backlog or Ready initiative unchanged and receives no call; the same epic listed raises the initiative to In Progress.
- A completed epic alone adds an initiative not yet on the board at Backlog; an initiative with no active epic keeps Backlog, Ready or In Progress.
- In Advance mode, an open pull request naming an epic the table does not list holds no initiative.
- At the base revision, the completed-work, held-status and unlisted-pull-request fixtures fail; the unlisted-epic board fixture passes there too, since `board.py` read only listed epics already.

## Activity

Board fixtures in `test_board.py` `EpicActivity` and `test_a_delivered_row_alone_leaves_the_epic_out_of_progress`; queue fixtures for reserved, open-pull-request, delivered-row-only and integration-draft epics (AC3).

- Reservation-only: Backlog → In Progress, and its initiative with it.
- Pull-request-only: Ready → In Progress.
- Inactive: a delivered row alone, or a delivered row with only the integration draft open, moves In Progress or In Review to Backlog; Ready and Backlog stay; an epic not on the board is added at Backlog. The integration draft holds no initiative in Advance mode.
- Completion: a closed epic is Done.
- Review: an active epic with ticked criteria and current review of the integration head and base is In Review; with a changed head it is In Progress and the run reports `stale agent review` and exits 1.
- At the base revision, ten of the new and revised fixtures fail.

## Suite

- `python3 -m unittest discover -s test` from `skills/work-planner`: 492 tests, OK.
- `python3 -m pytest skills/work-planner/test -q`: 493 passed, and one collection error, `test_align.py::test_plan_agreement`, which pytest raises on the base revision too: it collects a `sync.py` function whose name starts with `test_`. The unittest runner is unaffected.

## Documents

`skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings. `test_documents.py` passes, including Prerequisites against used links. A grep for partly completed epics and delivery-started status finds no surviving description.

## Review

- `Board.active` is the one activity definition; `board.py` and `board-queue.py` both call it, and `delivers` filters task-issue In Review, epic activity and the queue's wait.
- `agent_review.integration` is the one identity of an epic integration pull request, used by the handoff gate and by `delivers`.
- `board.py` reads a row's delivery only where a dependency gate reads it, so a row linking a pull request missing from `--prs` is reported there.
