# F17 Test Results

Branch `skill/engineering-delivery-steps` at 148533531, cut from `workspace` at 9e4e9e274.

## T1. Planner Suite

`cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test` at 148533531: 1188 tests, OK, 1 skipped. test_sync and test_board run sync.py and board.py on fixture epics and pull requests:

- `test_a_pushed_commit_named_by_its_sha_is_linked_once`: `--link W01=<sha>` replaces the planning link with `[W01](…/commit/<sha>)`, and a second run leaves the body unchanged. Covers AC2.
- `test_a_row_links_its_pull_request_and_its_pushed_commit`: `--link W01=950,W01=<sha>` links both. Covers AC2.
- `test_a_row_linking_its_pushed_commit_gains_its_pull_request`: a row holding the commit keeps it when `--link W01=950` adds the pull request. Covers AC2.
- `test_a_pushed_commit_beside_an_open_pull_request_does_not_deliver` (test_sync) and `test_a_pushed_commit_beside_an_open_pull_request_leaves_the_row_undelivered` (test_board): a row linking a commit and an open pull request is not delivered. Covers AC2.
- `test_a_short_commit_sha_is_refused`: `--link W01=b41c0bf` exits naming the full commit SHA. Covers AC2.

test_readme confirms the recounted test_sync (191) and test_board (61).

## T2. Shared Suite and Skill-File Check

`cd skills && scripts/sbx python3 -m unittest discover -s test` at 148533531: 295 tests, OK. `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files checked, 0 findings. test_documents' EpicDeliveryCallers passes: the step-6 Sync Epic call names the fetched epic bases. Covers AC1 and AC3.

## T3. Read of the Steps

Run Delivery Session step 6 commits and pushes each declared `engineering` file from the engineering worktree; a unit changing only that branch runs Sync Epic with the pushed commit and continues to step 11, Arising Issues, past steps 7–10. Task Delivery shows `[W01](…/commit/b41c0bf…)` linking the rule, and the `--link` map description names `<task-id>=<commit-sha>`. Covers AC1 and AC3.

## T4. Whitespace

`git diff --check 9e4e9e274 148533531`: clean.
