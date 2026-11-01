# W20 Evidence

Delivery head `ac551bd3a3c3f603c185d37052d280fa8f9d5007` on `i11/e09/w20-integration-pull-requests-hold-no-task`, cut from `i11/e09/workspace` at `2c67834f4a64a47ada95fd198a5cc28d2ab457d0`.

## T1 Integration Pull Request

`sbx python3 -m pytest skills/work-planner/test/test_board.py -q -k integration_pull_request_linking`: passes for a draft and a ready integration pull request linking the task issue; no move of the task, and `set #2 [I01:E00] First: Epic: In Progress → Backlog`.

With `pr_open` matching the pull request title alone, as on `workspace` before the merge, both subtests fail.

## T2 Skill Suite

`sbx python3 -m pytest skills/work-planner/test -q`: 579 passed, 1092 subtests passed. `check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
