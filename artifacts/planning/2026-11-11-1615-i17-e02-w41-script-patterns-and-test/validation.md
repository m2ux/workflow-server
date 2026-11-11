# W41 Validation

## Candidate

- Unit: I17:E02:W41, AC69, AC70.
- Task base: `23ef4cf2b` (origin/i17/e02/workspace after W36 #1689).
- Task head: `f48a6142e`, branch `i17/e02/w41-script-patterns-and-test`.
- Component: the eight files [w41.md](w41.md) declares. sync.py holds both patterns, since board.py imports sync.py and the reverse import would cycle; `PULL_HOME` takes board.py's name, `PULL_REF`. board.py, progress.py and board-queue.py import them from sync.py. format.py's own `PREFIX` is a different, looser pattern its checker uses to report malformed tags, and stays.

## Observing Tests

- **AC69.** [test_shared](https://github.com/m2ux/workflow-server/blob/i17/e02/w41-script-patterns-and-test/skills/work-planner/test/test_shared.py) SharedPatterns: each pattern's source text appears in one script, sync.py; every compiled pattern any script holds with that text is sync.py's object; board, progress and board-queue hold sync.py's `PREFIX` and `PULL_REF`. test_board_queue SharedRules reads `PULL_REF` from sync.py. 20 tests pass ([shared-rules.log](shared-rules.log)). The duplicate-pattern search ([pattern-search.log](pattern-search.log)) finds four definitions in board.py and sync.py at the base and two, both in sync.py, at the head, with the three importers. Control: the head module over the base scripts fails to import ([shared-rules-base.log](shared-rules-base.log)).
- **AC70.** `python3 -m unittest discover -s test -p test_templates.py` runs 6 tests and passes at the head ([templates-alone.log](templates-alone.log)); at the base it fails with `ModuleNotFoundError: No module named 'format'` ([templates-alone-base.log](templates-alone-base.log)).
- Existing regressions keep their results, hot-fix fixtures unchanged: test_shared, test_board_queue, test_progress, test_board, test_sync, test_deliver, test_hotfix and test_templates, 558 tests ([focused.log](focused.log)).

## Full Checks

- Planner: 1177 tests, one opt-in live-link skip ([planner.log](planner.log)), including the installed document and model checks.
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 60 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_shared.py -v         # skills/work-planner
python3 -m unittest discover -s test -p test_templates.py -v      # skills/work-planner
python3 -m unittest -v test_shared test_board_queue test_progress test_board test_sync test_deliver test_hotfix test_templates   # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace                         # checkout root
```

The base runs use a `git archive 23ef4cf2b skills` export; shared-rules-base.log copies the head test_shared.py into it.

## Merge

[#1691](https://github.com/m2ux/workflow-server/pull/1691) merged into `i17/e02/workspace` at `ac804d44a1132ef2ebd45b95242da180e5d71bd2` from head `f48a6142ec66c9632e2c095e5d4667920535794b`; the epic base had not moved since the task base. Epic #1615 links W41 to #1691 and ticks AC69 and AC70 ([sync.log](sync.log)); review #1659 carries T28 and R26.

## Change List

- Applied: the W41 work item declares four further files the change reaches (progress.py, board-queue.py, test_board_queue.py, test/README.md). No row, criterion or dependency changed.
- Held: none. Arising issues: none.
