# W04 Fix — A Waiting Initiative Readies No Epic

> fix-evidence · 2026-11-01

## Finding

The agent review of the `i11/e09/workspace` integration diff at `d78de4468aadae5f8531241ca9da7428b41d07ca` found AC4 false. An initiative kept In Progress only while its open pull requests finish still readied its epics:

- **Next set.** `place_sets` called `activate` for a waiting initiative, so an unstarted epic moved Backlog → Ready.
- **Lower set and unplanned.** `park` kept every Ready epic of an In Progress initiative, so an epic already Ready stayed Ready.

## Fix

`board-queue.py` records each waiting initiative. `activate` places its active epics In Progress and readies none, and `park` returns its Ready epics to Backlog. The Epic Status field in `artifacts/board-queue.md` states the rule.

## Tests

Branch `i11/e09/w04-waiting-initiative-readies-none` at `eb8a0fb345d0ea7aed8b0a818591e259519712c2`.

### T1 Waiting Initiative Tests

`skills/work-planner/test/test_board_queue.py` ReadyFollowsTheInitiative:

- `test_an_initiative_waiting_in_the_next_set_readies_no_epic`
- `test_a_ready_epic_under_an_initiative_waiting_below_the_next_set_returns_to_backlog`
- `test_a_ready_epic_under_a_waiting_unplanned_initiative_returns_to_backlog`

All three pass with the fix and fail against the script at `d78de4468`.

### T2 Skill Suite

`sbx python3 -m pytest skills/work-planner/test -q`: 530 passed, 1030 subtests passed. `check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
