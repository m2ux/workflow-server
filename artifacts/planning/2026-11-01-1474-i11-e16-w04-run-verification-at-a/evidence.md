# W04 Delivery Evidence

> Test evidence · Created 2026-11-01

Tested revision: `b7e3faa6f` on `i11/e16/w04-run-verification-at-a`, cut from `i11/e16/workspace` at `b0294e200`.

Changed paths:

- `skills/work-planner/scripts/revision-check.py`
- `skills/work-planner/test/test_revision_check.py`
- `skills/work-planner/artifacts/acceptance-criteria.md`

The file-change declaration names `acceptance-criteria.md` because Verify Selected Criteria is the operation that runs an instrument at a revision, so the command specification sits there. No other row declares that file.

## Revision Helper Tests

`python3 -m pytest skills/work-planner/test/test_revision_check.py -q`: 6 passed.

Each case builds a repository whose tag, side branch and checked-out branch sit on three different commits, then compares `git worktree list --porcelain` before and after the run.

| Case | Observed |
| --- | --- |
| Passing instrument at branch `feature` | Exit 0; the instrument printed the branch commit and its file; the worktree list is unchanged and the temporary directory is gone |
| Failing instrument (exit 3) at tag `v1` | Exit 3; the instrument printed the tag commit and its file; the worktree list is unchanged |
| Branch checked out in the main checkout | Exit 0 at that branch's commit, through a detached checkout |
| Unknown revision | Exit 2, `revision not found`, no checkout created |
| Command that cannot start | Exit 2, `command not started`, checkout removed |
| A kept worktree and a stale one the run did not create | Both remain listed; the helper never prunes |

## Live Run

From the project checkout, under the workspace sandbox:

- At branch `i11/e16/w04-run-verification-at-a`, the instrument `python3 -m pytest skills/work-planner/test/test_revision_check.py -q` reported `{"revision": "b7e3faa6f…"}` and 6 passed; exit 0.
- At tag `main/v0.29.0`, the same instrument found no such test file; the helper exited 4, the instrument's status.
- `git worktree list` captured before and after both runs is identical.

## Suite

- `python3 -m pytest skills/work-planner/test -q`: 478 passed, 1 error. The error is `test_align.py::test_plan_agreement`, a `sync.py` helper pytest collects as a test. It is present on the epic base and tracked by [#1491](https://github.com/m2ux/workflow-server/issues/1491), fixed on `i11/e09/workspace` by #1490.
- `python3 -m unittest discover -s test -q` from `skills/work-planner`: 477 tests, OK.

## Skill File Check

`python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.

## Merged Revision

[#1503](https://github.com/m2ux/workflow-server/pull/1503) merged into `i11/e16/workspace` at `8377281d0`. The helper ran its own tests there through Run at Revision: the header reported `8377281d0…`, 6 passed, exit 0, and `git worktree list` before and after is identical. AC6 is verified at this revision.
