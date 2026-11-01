# W17 Evidence

Delivery head `b0abf066b4529aaf6d4b64ebb02506ae9490bc30` on `i11/e09/w17-unplanned-rows-take-every`, cut from `i11/e09/workspace` at `f465766477159c13dcbc389d9eaa1b0ea6dc2609`.

## T1 Unplanned Rows Take Every Base

`sbx python3 -m pytest skills/work-planner/test/test_deliver.py -q`: 45 passed, 6 subtests passed.

- `test_an_unplanned_row_of_several_bases_takes_every_epic_base`, subtests `plain` and `task issue`: the unit line names `i07/e00/w01-queue-plan-main`, `-workflows` and `-workspace` on their bases, with `undeclared: 0` and exit 0.
- `test_an_unplanned_row_joined_to_a_declared_row_takes_every_epic_base`: `W01` (no work item) joined to `W02` (`workspace:skills/plan.py`) takes all three bases.
- `test_a_unit_of_several_bases_declaring_none_is_undeclared`: a bare-path component and a branch with no epic base each print `undeclared` and exit 1.
- `test_a_work_item_is_read_only_from_the_engineering_checkout`: a linked work item without `--engineering` stays `undeclared`.

Against the script at `f4657664` the two unplanned-row tests fail (3 failures: both subtests and the joined case).

## T2 Skill Suite

`sbx python3 -m pytest skills/work-planner/test -q`: 559 passed, 1067 subtests passed. `check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
