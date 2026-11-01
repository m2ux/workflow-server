# W14 Test Evidence

Run from the unit worktree at `275b7e44a`, on base `i11/e09/workspace` at `400703b08`.

## T1 Same-run link test

`python3 -m pytest skills/work-planner/test/test_sync.py -q -k "linked_in_the_run or title_repairs or linked_merged_title"`

- 3 passed, 5 subtests passed.
- `test_pull_request_linked_in_the_run_is_checked_for_its_prefix_in_that_run`: `--link W01=950` to a merged `[I01:E00]` pull request writes the link and reports `linked: W01 → #950` with no retitle; a `--link` to a pull request titled `Work`, `[I01] Work` or `[I01:E00:W01] Work` is refused in that run with `--link W01=950: no pull request naming this epic`, and no body is written.

## T2 Skill suite

- `python3 -m pytest skills/work-planner/test -q`: 531 passed, 1033 subtests passed.
- `python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
