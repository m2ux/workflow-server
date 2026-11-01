# W19 Evidence

Delivery head `9b2ac832e6e3bc248a75633788182de7fbd10c29` on `i11/e09/w19-delivered-epics-await-review`, cut from `i11/e09/workspace` at `d46bc872c4e687667fa23652014c9139c6ef384c`.

## T1 Handed-Off Epic

`sbx python3 -m pytest skills/work-planner/test/test_board_queue.py -q`: 55 passed, 14 subtests passed. EpicHandoff, over an epic with W01 linking merged #8, AC1 ticked and its integration pull request open:

- `test_the_queue_leaves_it_in_progress_under_its_running_initiative`: no move of E00 and no `next` line.
- `test_it_holds_its_initiative_waiting_in_every_set` (next set, below it, unplanned): `wait #1 [I01] Low: Current: E00 awaiting review`, no move of I01 or E00.
- `test_a_returning_initiative_names_it_for_reconciliation`: `reconcile #1 [I01] Bare: Parked: E00 (awaiting review)` and no move.

Against the script at `d46bc872` all five checks fail.

## T2 Skill Suite

`sbx python3 -m pytest skills/work-planner/test -q`: 563 passed, 1076 subtests passed. `check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
