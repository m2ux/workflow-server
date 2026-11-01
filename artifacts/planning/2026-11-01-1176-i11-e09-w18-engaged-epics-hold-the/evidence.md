# W18 Evidence

Delivery head `1849ce45fa77757ecad9507096becc5e987934a5` on `i11/e09/w18-engaged-epics-hold-the`, cut from `i11/e09/workspace` at `f465766477159c13dcbc389d9eaa1b0ea6dc2609`.

## T1 Engaged Epics Hold the Initiative

`sbx python3 -m pytest skills/work-planner/test/test_board_queue.py -q`:

- `test_an_epic_in_review_or_held_by_a_session_keeps_its_initiative_waiting`, six subtests (In Review with only the integration pull request open, and a reserved row; each in the next set, below it and unplanned): `wait #1 [I01] Low: Current: E00 In Review` or `E00 held by a session`, no move of I01, E00 or E01, and no `reconcile` line.
- `test_an_unplanned_initiative_holding_a_reservation_waits`: an unplanned initiative whose epic holds a reserved row waits; its epic keeps In Progress.

Against the script at `f4657664` all six subtests and the reservation test fail (7 failures).

## T2 Skill Suite

`sbx python3 -m pytest skills/work-planner/test -q`: 558 passed, 1070 subtests passed. `check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
