# W09 Evidence

Every check runs on task branch `i11/e09/w09-one-task-branch-per` at `8a89ea4ac`, which merges `origin/i11/e09/workspace` at `cb2add684` (W10, #1511).

## Branch per Base

`test_deliver.py`, two tests:

| Test | Result |
| --- | --- |
| `test_a_unit_takes_a_branch_and_worktree_per_epic_base` | PASSED. Bases `i07/e00/workflows,i07/e00/main` give one line naming `branch i07/e00/w01-queue-plan-main, base i07/e00/main, worktree .worktrees/i07/e00/w01-queue-plan-main; branch i07/e00/w01-queue-plan-workflows, base i07/e00/workflows, worktree .worktrees/i07/e00/w01-queue-plan-workflows` after one record folder. |
| `test_a_unit_names_its_epic_base` | PASSED. One base keeps `branch i07/e00/w01-queue-plan, base i07/e00/main, worktree .worktrees/i07/e00/w01-queue-plan`. |

## W08 Precedent

`deliver.names` and `deliver.task_branches` for I11:E09:W08, "Every long-lived branch carries the declaration", with bases `i11/e09/docker`, `i11/e09/main` and `i11/e09/workflows`, give the three branches W08's brief named by hand:

| Branch | Base | Worktree |
| --- | --- | --- |
| `i11/e09/w08-every-long-lived-branch-docker` | `i11/e09/docker` | `.worktrees/i11/e09/w08-every-long-lived-branch-docker` |
| `i11/e09/w08-every-long-lived-branch-main` | `i11/e09/main` | `.worktrees/i11/e09/w08-every-long-lived-branch-main` |
| `i11/e09/w08-every-long-lived-branch-workflows` | `i11/e09/workflows` | `.worktrees/i11/e09/w08-every-long-lived-branch-workflows` |

## Full Suite

`python3 -m pytest skills/work-planner/test -q`: 527 passed, 1030 subtests passed.

## Documents

`skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.

## Review

A grep of the skill for a unit's single branch beside several bases (`bases i07`, `selected branch`, `branch, base and worktree`, `one pull request's work`) finds none on the delivery head.

## Merge

[#1515](https://github.com/m2ux/workflow-server/pull/1515) merged into `i11/e09/workspace` at head `8a89ea4ac`, merge commit `d78de4468`. The base carries no active rule and the head no check run. `origin/workspace` held nothing the base lacked, so the base update merged nothing.

## Epic Sync

`sync.py --tick AC16` on #1176 reports W09 done and AC16 ticked; every row and criterion of the epic is complete. The epic stays open: `i11/e09/main` (#1506) and `i11/e09/workspace` (#1487) are unmerged drafts, and `i11/e09/workflows` (#1497) and `i11/e09/docker` (#1498) are in flight.
