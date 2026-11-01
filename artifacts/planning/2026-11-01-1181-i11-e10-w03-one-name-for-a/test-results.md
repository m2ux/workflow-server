# W03 and W10 Test Results

Evaluated at commit `fa728f799` on `i11/e10/w03-one-name-for-a`, which merges `i11/e10/workspace` at `96295fffa`.

Changed paths:

- `skills/work-planner/scripts/deliver.py`
- `skills/work-planner/test/test_deliver.py`
- `skills/work-planner/artifacts/epic-issue-body.md`
- `skills/work-planner/artifacts/work-item.md`
- `skills/work-planner/artifacts/delivery-plan.md`
- `skills/work-planner/modes/deliver-mode.md`

## T1

**Release links the lower-case file the record holds and its README names** (AC11).

`cd <worktree> && sbx python3 -m pytest skills/work-planner/test/test_deliver.py -q -k Reserve` — 10 passed.

`Reserve.test_release_points_to_the_work_item` releases W01 against an engineering checkout whose record holds `w01.md` and a README linking `w01.md`; the row links `<folder>/w01.md`. `Reserve.test_release_refuses_a_record_whose_readme_names_another_file` gives a record holding `w01.md` whose README links `work-item.md`; the release exits 1 with `the README of artifacts/planning/<folder> does not link w01.md`. Work Item's Identity states the name: the task id in lower case, the name the row's link carries, linked by that name from the README.

## T2

**The row-link operation refuses a work item the record does not hold** (AC12).

`Reserve.test_release_refuses_a_work_item_the_record_does_not_hold` gives a record holding only `work-item.md`; the release exits 1 with `the record artifacts/planning/<folder> holds no w01.md` and writes no body. `Reserve.test_release_needs_the_records_checkout` releases without `--engineering`; it exits 1 with `--release needs --engineering`.

With `deliver.py` reverted to `ba441c2b8` and the tests kept, these three tests fail.

## T3

**A joined unit is reserved with the folder the survey names** (AC16).

`cd <worktree> && sbx python3 -m pytest skills/work-planner/test/test_deliver.py -q -k JoinedReservation` — 6 passed.

`JoinedReservation.test_joined_rows_are_held_with_the_folder_the_survey_names` runs the survey over an epic joining W01 and W02; its `unit I07:E00:W01+W02` line names record `2026-10-06-943-i07-e00-w01-queue-plan`. Reserving W01,W02 sets that folder as both rows' link, and no `w02-dispatch` folder appears. `test_each_unit_of_one_call_takes_its_own_folder` reserves W02,W01,W03: the pair takes the W01 folder, W03 its own. `test_reserving_one_row_of_a_joined_pair_is_refused` reserves W02 alone; it exits 1 with `W02: joined with W01, which the call leaves out` and writes no body. `test_a_joined_row_whose_partner_is_held_is_refused` refuses a pair whose W01 is already held elsewhere.

With `deliver.py` reverted to `ba441c2b8` and the tests kept, four of the six fail; the two that pass on the base observe behaviour the base already had for a single row.

## T4

**Release of a joined unit links each file inside the shared record** (AC41).

`JoinedReservation.test_release_links_each_work_item_inside_the_shared_record` releases W01,W02, both holding one folder whose record holds `w01.md` and `w02.md`; W01 links `<folder>/w01.md` and W02 links `<folder>/w02.md`. `test_releasing_one_row_of_a_joined_pair_is_refused` releases W02 alone and exits 1.

## T5

**Work-planner suite.**

`cd <worktree> && sbx python3 -m pytest skills/work-planner/test -q` — 629 passed, 1 skipped, 1136 subtests passed.

## T6

**Skill-file check.**

`cd <worktree> && sbx python3 skills/scripts/check_skill_files.py skills/work-planner` — 50 files checked, 0 findings.
