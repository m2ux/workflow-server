# W38 Test Evidence

Run at `96f2c0784` on `i11/e10/w38-sync-reports-every-malformed-title`, after merging `origin/i11/e10/workspace` at `4f72ac1b9`.

## T1

A test per defect case, each failing at `8bddff05a` ([failing-before-8bddff05a.txt](failing-before-8bddff05a.txt)), passing at the head.

| Finding | Test |
| --- | --- |
| N3 | `ReviewChanges.test_an_extensionless_path_absent_from_the_head_is_named`, `test_an_extensionless_file_or_directory_at_the_head_is_silent`, `test_a_line_reference_is_not_part_of_the_path`, `test_a_span_that_names_no_file_is_not_measured` |
| N4 | `EpiclessTitles.test_the_epic_sync_reports_them`, `test_the_initiative_sync_reports_them` (`[I01:E1]`, `[I01: E00]`, `[I01 E00]`) |
| N6 | `BranchContract.test_a_task_pull_request_targeting_a_long_lived_branch_is_reported`, `test_a_task_branch_for_one_of_several_bases_names_its_own`, `test_a_target_naming_no_long_lived_branch_names_each_base` |

## T2

Each untested branch the review named (N7) has a test that kills the review's mutant, at `8bddff05a` and at the head.

| Mutant | Test |
| --- | --- |
| board.py `integrated()` off-route check removed | `RowPrerequisites.test_a_cross_repository_output_merged_into_a_task_branch_is_unverified` |
| sync.py retitle de-duplication removed | `HistoricalDelivery.test_a_linked_task_titled_pull_request_is_retitled_once` |
| closure.py repository comparison made case-sensitive | `Closure.test_a_snapshot_naming_the_repository_in_another_case_passes` |

## T3

Read of each docstring and definition against the scripts (N5, N6):

- sync.py module docstring: task-titled retitles for linked and unlinked pull requests; the Changes span rules (anchor and line suffix, extension or top-level directory, component, bare name); the Target base rule; the No epic rule.
- sync.py `head_path`, `review_changes`, `epicless`, `belongs` docstrings state the same rules.
- board.py `Outputs` docstring names a merge into a task branch as unverified, as `read()` does.
- Delivery Findings (epic.md) Changes, Target and No epic rows; epic-issue-body.md Changes reading; Sync mode's Target handler retargets to the base named, or the one its work item's Component names where several are.
- A probe of #1555's own Changes at the head reports no false absence.

## T4

- `sbx python3 -m pytest skills/work-planner/test skills/test -q`: 953 passed, 1 skipped, 1881 subtests passed.
- `sbx python3 -m pytest skills/workflow-canon/test -q`: 39 passed, 38 skipped.
- `sbx python3 skills/scripts/check_skill_files.py skills/gitnexus/ skills/server-in-the-loop/ skills/work-planner/ skills/workflow-canon/`: 81 files checked, 0 findings.
