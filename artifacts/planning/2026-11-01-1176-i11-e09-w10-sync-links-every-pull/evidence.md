# W10 Delivery Evidence

Delivery head: `4dbf94844c188ddd00b9ec4fd9aadffa6835bd55` on `i11/e09/w10-sync-links-every-pull`. Base: `21ea6ead8c064ca7ec95a08f84b086a319b05c07` (`i11/e09/workspace`), unchanged since the branch was cut. Pull request: [#1511](https://github.com/m2ux/workflow-server/pull/1511).

Changed paths: `skills/work-planner/scripts/sync.py`, `skills/work-planner/test/test_sync.py`, `skills/work-planner/artifacts/epic-issue-body.md`.

Merged into `i11/e09/workspace` as `cb2add68480df0bcf8b2e24f47befdf0d45eaab1` on 2026-11-01; #1176 records W10 done with AC17 ticked, and #1487 cites #1511.

Every command ran from the unit worktree under the workspace sandbox: `python3 -m pytest skills/work-planner/test ...`.

## Every Named Pull Request

T1, AC17. `Done` in `test_sync.py`, with pull requests #950, #951 and #952 on the epic bases for `main`, `workflows` and `docker`:

- `test_an_id_named_for_each_pull_request_links_them_all` — `--link W01=950,W01=951,W01=952` on a row linking its planning file writes all three links in the order given and drops the planning link.
- `test_a_run_naming_a_linked_pull_request_keeps_the_row_order` — a row linking #950 and #951, given `--link W01=951,W01=952,W01=951`, keeps both in place, gains #952 after them and links #951 once.
- `test_two_named_pull_requests_on_one_branch_are_refused` — two named pull requests on `i01/e00/main` exit with `W01: names two deliveries on main; further work needs another task`.
- `test_a_further_pull_request_on_the_same_branch_requires_another_task` and `test_a_row_links_one_delivery_per_long_lived_branch` (existing) still hold for a single named pull request against a held link.

Result: all passed.

## Repeated Run

T2, AC17. `Done.test_a_repeated_run_leaves_the_row_unchanged`: the body `--link W01=950,W01=951` writes is synced again with the same arguments, and the second output equals the first, with the row linking #950 then #951.

Result: passed.

Live run against #1176 with the delivery head's `sync.py` and the fetched `[I11:E09]` pull requests:

- The W08 row cut back to `[W08](…/pull/1494)`, given `--link W08=1494,W08=1495,W08=1496`, reports `linked: W08 → #1494, #1495, #1496` and writes the three links the row holds on the issue.
- The issue's own body, given the same `--link`, reports no `linked` line and writes output identical to the first run.

## Full Suite

T3. `python3 -m pytest skills/work-planner/test -q` on the delivery head: `527 passed, 1029 subtests passed`.

## Documents

T4. `python3 skills/scripts/check_skill_files.py skills/work-planner`: `50 files checked, 0 findings`.

## Plan Changes

None applied and none held. The unit created no task, epic or issue, folded no work and moved no row; validation found no debt to defer and no arising issue.
