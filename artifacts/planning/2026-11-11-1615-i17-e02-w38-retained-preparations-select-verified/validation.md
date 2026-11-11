# W38 Validation

## Candidate

- Unit: I17:E02:W38, AC14, AC15, AC16.
- Task base: `96241be5b` (origin/i17/e02/workspace after W37 #1692), brought current with `e17c39f8b` (after W42 #1693).
- Task head: `1e4753d08`, branch `i17/e02/w38-retained-preparations-select-verified`.
- Component: the six files [w38.md](w38.md) declares.

## Reconciliation

- Unit Dispatch already carries the #1645 selection on the epic base: New Unit Checkouts calls Fetch Remote Branch, Add Task Worktree and Read Checkout Revision and records the full preparation head; Retained Unit Checkouts calls only Check Task Worktree for each recorded checkout and blocks on any mismatch. The route checks pass against it unchanged, so the protocol keeps one selection and gains no redundant path.
- Defect found at the owning implementation: Unit Dispatch retains the worktree path Add Task Worktree placed relative to the project checkout, but Check Task Worktree runs from the workspace, so `delivery-branches.py` resolved a relative path against the wrong directory and reported every valid retained checkout as unregistered. The helper now resolves a relative `--worktree` against `--project`; Check Task Worktree states it.

## Observing Tests

[test_unit_dispatch](https://github.com/m2ux/workflow-server/blob/i17/e02/w38-retained-preparations-select-verified/skills/work-planner/test/test_unit_dispatch.py) (12 tests) runs a bounded executor: it reads the route Unit Dispatch selects for an entry and runs each capability's documented Delivery Branches command against real local Git repositories (an origin with two epic bases, a cloned project, worktree paths with spaces); start validation runs through `dispatch.py`. [test_task_worktree](https://github.com/m2ux/workflow-server/blob/i17/e02/w38-retained-preparations-select-verified/skills/work-planner/test/test_task_worktree.py) gains the relative-path regression ([focused.log](focused.log), 21 tests).

- **AC14.** Route: a new unit selects exactly creation and records its full head; a retained preparation selects only Check Task Worktree with no creation, fetch, reset or cleanup; Check Task Worktree has one home and `delivery-branches.py` is the only worktree-list reader. Creation: two bases are created once (registration count +2), each head is the 40-hex base commit, and two retained reuses run validation only with identical before/after snapshots (registration, refs, branch, head, status, file contents).
- **AC15.** Mismatch: absent registration, foreign repository, wrong branch, detached HEAD, later head, missing head, abbreviated head, tracked, staged and untracked changes each block at Check Task Worktree with its reason, run no further event and leave the snapshot identical. One mismatched base of two blocks the whole unit after both are checked independently.
- **AC16.** CapacityWait: the ordered event fixture is `publish, hold, creation x2, check start, wait, publish, hold, Check Task Worktree x2, check start, start`, with the same record, preparation and hold, exactly one start and an unchanged checkout; the batch keeps waiting at zero capacity and does not reselect the preparation. A competing session or changed hold rejects the resume with no start. Prerequisites: Unit Dispatch's before-use graph reaches rules.md and conventions.md with no cycle; the protocol's step order is record, hold, checkouts, start, and start evidence, hold, preparation head and verified checkouts are produced before Check Dispatch Start uses them.

## Base Control

Both modules with the base `delivery-branches.py`: 9 failures and 2 errors ([base-control.log](base-control.log)). Every case that reuses a relative retained path fails as unregistered; the cases rejected before path resolution still pass.

## Full Checks

- Planner: 1192 tests, one opt-in live-link skip ([planner.log](planner.log)), including the document, checkout, command-contract and README checks.
- Shared: 319 pass ([shared.log](shared.log)), including the installed Work Planner model.
- Skill checker: 60 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_unit_dispatch test_task_worktree      # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace                         # checkout root
```

## Merge

[#1694](https://github.com/m2ux/workflow-server/pull/1694) is open into `i17/e02/workspace` at head `1e4753d08faa6d2d9436fdfdcc5498b9d9fbce87`, current with the epic base after W42 #1693, with every check above passing at that head. The merge call at that head was refused by the session's permission classifier (Merge Without Review), so the pull request stays open for a permitted merge. Epic #1615 links W38 to #1694 ([sync.log](sync.log)); AC14–AC16 are ticked, and review #1659 updated, when the merge is recorded.

## Change List

- Applied: the W38 work item declares five further files the change reaches (delivery-branches.md, delivery-branches.py, test_task_worktree.py, test_unit_dispatch.py, test/README.md). No row, criterion or dependency changed. Unit Dispatch needed no change: its integrated route passes the observing checks.
- Held: none. Arising issues: none; the relative-path defect sits in the unit's own component and is fixed on its branch.
