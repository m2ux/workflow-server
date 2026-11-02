# Test Results

Tested revision: `b5b67669a` on `f04-engineering-commit-sweep`.

## T1 Sweep Is Idempotent

A scratch bare remote and two clones under `/tmp/f04-ac1`, run under `sbx`. The `other` clone pushes `other.md` to `engineering`. The `eng` clone then holds this session's record (`artifacts/planning/rec/README.md`), another session's uncommitted file (`artifacts/planning/stranded.md`) and a `design.md` edit, and runs the Commit Planning Record command twice.

- Run 1 commits all three files, rebases onto the other clone's commit and pushes: `b89cb5b..1fa40b6`.
- `origin/engineering` then lists `README.md`, `artifacts/planning/rec/README.md`, `artifacts/planning/stranded.md`, `design.md`, `other.md`.
- Run 2 makes no commit, reports `Current branch engineering is up to date.` and `Everything up-to-date`. The remote ref and `HEAD` stay `1fa40b6`, and the worktree is clean.

Result: pass (AC1).

## T2 Shared Worktree Reads The Sweep

Shared Worktree in `skills/work-planner/artifacts/planning-record.md` states: "A commit on engineering may include other sessions' uncommitted or unpushed work, a `design.md` amendment among them. A session confirms only that its own files reached `origin/engineering` after the push."

Result: pass (AC2).

## T3 No Path-Scoped Engineering Commit

`grep -rnE` across `skills/work-planner` for `-- '<planning-folder-path>'`, `own commit`, `ride along`, `names (its|the) folder`, `Push Engineering Branch`, `commit -- `, `own paths` and `its own staging`. The four remaining hits are unrelated: Revise Mode's commits on `workspace`, a sync docstring and a test docstring about revisions, and Add Planning Record's `mkdir`.

Result: pass (AC3).

## T4 Regressions

- `python3 skills/scripts/check_skill_files.py skills/work-planner`: 52 files checked, 0 findings.
- `python3 -m unittest discover -s test` in `skills/work-planner`: 831 tests OK (1 skipped). `test_plan_mode` asserts the sweep command in Commit Planning Record.

Result: pass.
