# F07 Test Results

> Tested revision: bf1baac9ed0259455c7b762ebcadec49cb1e01b1 on f07-hot-fix-review-status, against `workspace` at 9a0f06d7c043a1514d918c8c8547d754beec62e7

## T1 Board Status From The Delivering Pull Request

`test_hotfix.py` BoardStatus: for every held status, an open hot-fix with an open ready delivering pull request is In Review, with only an open draft one In Progress, and with a ready and a draft one In Review; with none open, or only a merged one, it is Ready, or In Progress when it holds In Progress or In Review. A closed hot-fix is Done or off the board whatever its pull requests.

- Result: AC1 holds. Passed.

## T2 Advance Places And Keeps In Review

`test_board_queue.py` HotFixes:

- `test_a_ready_delivering_pull_request_stands_it_in_review_and_a_draft_in_progress`: `[F04] ... In Progress → In Review` for a ready delivering pull request, `[F05] ... Ready → In Progress` for a draft one (AC1).
- `test_a_hot_fix_in_review_with_a_ready_delivering_pull_request_keeps_it`: no move, `current: 1, to do: 0` (AC2).
- `test_a_board_without_in_review_holds_it_in_progress`: no Status move on a board lacking the In Review option.
- `test_a_hot_fix_with_no_open_delivery_keeps_in_progress_and_leaves_in_review_for_it`: a hot-fix In Review with no open delivering pull request moves to In Progress.
- Result: AC1 and AC2 hold. Passed.

## T3 Queue Jurisdiction

`test_statuses.py` QueueJurisdiction: In Review is allowed for an open hot-fix and refused for a closed one; Done stays allowed only for a hot-fix closed as completed. Passed.

## T4 One Statement Of The Rule

Grep of `skills/` non-test files for "never stands In Review", "only an initiative" and every hot-fix statement naming In Review: Board Status in `artifacts/hotfix.md` states the rule; `board-delivery.md`, `board.py` and `statuses.py` name the hot-fix with the initiative and the epic; no file says a hot-fix never stands In Review.

- Result: AC3 holds.

## T5 Regression

- `python3 -m pytest -q skills/work-planner/test`: 847 passed, 1 skipped.
- `python3 -m pytest -q test` in `skills`: 208 passed.
- `python3 skills/scripts/check_skill_files.py skills/work-planner`: 52 files checked, 0 findings.
