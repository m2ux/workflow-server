# W02 Test Results

- **Evaluated commit.** `d4dd35c63` (task head, merged as `c299822c4` into `i11/e10/workspace` through #1569), including `origin/i11/e10/workspace` at `50a6535db`.
- **Changed paths.** `skills/work-planner/scripts/{sync,deliver,board}.py`, `skills/work-planner/test/{test_renumber,test_sync,test_deliver,test_board}.py`, `skills/work-planner/artifacts/{delivery-branches,dependency-graph,board-queue,delivery-plan,epic,pull-request-body}.md`.

| Check | Coverage | Result |
| --- | --- | --- |
| `test_renumber.py` (8 tests) | AC8 | Pass |
| `test_sync.py` EpiclessTitles | AC9 | Pass |
| `test_sync.py` BranchContract | AC10 | Pass |
| `test_deliver.py` ProducerOutputs and producer-closure test | AC10 | Pass |
| `test_board.py` RowPrerequisites | AC10 | Pass |
| `pytest skills/work-planner/test skills/test`: 796 passed, 1 skipped | AC8, AC9, AC10 | Pass |
| `check_skill_files.py skills/work-planner`: 0 findings | | Pass |
| Live epic sync on #1181 reported `no epic` for #1273 and #1278 | AC9 | Observed, then fixed as debt |
