# W23 Test Results

Evaluated at commit `09e8b25fa` on `i11/e10/w23-a-review-body-s`, which merges `i11/e10/workspace` at `96295fffa`.

Changed paths:

- `skills/work-planner/scripts/sync.py`
- `skills/work-planner/test/test_sync.py`
- `skills/work-planner/artifacts/pull-request-body.md`
- `skills/work-planner/artifacts/epic.md`
- `skills/work-planner/artifacts/epic-issue-body.md`
- `skills/work-planner/protocols/review-pull-request.md`

## T1

**Changes paths measured against the review's head commit** (AC30).

`cd <worktree> && sbx python3 -m pytest skills/work-planner/test/test_sync.py -q -k ReviewChanges` — 6 passed.

`ReviewChanges` runs `sync.py` on an epic whose open review pull request carries a specimen body, with `--project` a scratch repository whose head commit holds `config/branches`, `skills/work-planner/scripts/sync.py` and `docs/guide.md`, and the review's `head.sha` set to that commit.

- A Changes bullet naming `skills/work-planner/references/command-conventions.md` reports `changes: i01/e00/main (#980) names skills/work-planner/references/command-conventions.md, absent at <head>`.
- Paths standing at the head, including `./docs/guide.md#usage`, report nothing.
- A bare `sync.py` stands anywhere in the tree; a bare `command-conventions.md` is reported absent.
- Spans naming no file (`i01/e00/main`, `sync.py --names`, `*.md`, `config/branches`, `1.2.3`) and a path outside Changes are not measured.
- A head commit the repository does not hold is reported `unevaluable` with its sha, and no `changes` line.

With `sync.py` reverted to its base and the tests kept, three fail, so they observe the change.

## T2

**Review Body states that a Changes bullet carries no count** (AC31).

A read of `skills/work-planner/artifacts/pull-request-body.md`, Review Body: "A Changes bullet states what the base does and carries no count of the corpus, such as how many specifications or files it holds. A count belongs in the unit's planning record, with the revision that produced it."

## T3

**The merging session restates the bullets its change makes false** (AC32).

A read of `skills/work-planner/artifacts/pull-request-body.md`, Populate Review Body, step 2 (a later task merge), the operation Review Pull Request calls to update an existing review body: "Restate each standing Changes bullet the merged change makes false, so the bullet states the base as it now is." It precedes adding the merge's own change.

## T4

**Work-planner suite.**

`cd <worktree> && sbx python3 -m pytest skills/work-planner/test -q` — 626 passed, 1 skipped, 1136 subtests passed.

## T5

**Skill-file check.**

`cd <worktree> && sbx python3 skills/scripts/check_skill_files.py skills/work-planner` — 50 files checked, 0 findings.

Over all of `skills`, six findings stand in `skills/gitnexus/gitnexus-cli/SKILL.md`, identical at the base `ba441c2b8`; W29's whole-repository verification owns them.
