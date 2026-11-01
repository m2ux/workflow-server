# W18 Test Evidence

The checks behind [#1550](https://github.com/m2ux/workflow-server/pull/1550)'s Test Plan. Tested revisions: first head `ee74b9bf3` on base `ba441c2b8`; final head `e933538df` on base `f0d01fd3f`, under Base Updates.

## T1 Local Job Steps

Each `run` step of `.github/workflows/verify-skills.yml` executed under `bash -e -o pipefail`, the shell GitHub uses, with the workflow's `env`, by a harness that reads the steps from the YAML file. Three trees:

- **Clean tree.**
  The task worktree. `skill-files` prints `Excluded: gitnexus` and `80 files checked, 0 findings`, exit 0. `exclusions` prints `6 files checked, 6 findings`, exit 0.
- **Layout fault.**
  A copy of `skills/` with a trailing blank line appended to `server-in-the-loop/SKILL.md`. `skill-files` reports `server-in-the-loop/SKILL.md:114: trailing blank line`, `80 files checked, 1 findings`, exit 1.
- **Stale exclusion.**
  The clean tree with `EXCLUDED="gitnexus server-in-the-loop"`. `exclusions` reports `skills/server-in-the-loop reports no finding; remove it from EXCLUDED in .github/workflows/verify-skills.yml`, exit 1.

Result: ✓.

## T2 Checker Suite

`python3 -m pytest skills/test -q` in the task worktree: 76 passed, 3 subtests passed. The workflow changes no checker code; the suite confirms the check it runs is sound at the tested revision.

Result: ✓.

## T3 Job on the Task Pull Request

[Run 41293763108](https://github.com/m2ux/workflow-server/actions/runs/41293763108), event `pull_request`, head `ee74b9bf3`:

- [Every skill in scope meets the shared skill guidelines](https://github.com/m2ux/workflow-server/actions/runs/41293763108/job/124810216641): success, `Excluded: gitnexus`, `80 files checked, 0 findings`.
- [Every excluded skill still carries the findings that exclude it](https://github.com/m2ux/workflow-server/actions/runs/41293763108/job/124810216781): success.

Result: ✓.

## T4 Job on a Layout Fault

Scratch pull request [#1549](https://github.com/m2ux/workflow-server/pull/1549), head `8ee0f48f2`: the task head plus one commit appending a trailing blank line to `skills/server-in-the-loop/SKILL.md`, opened into `i11/e10/workspace`. [Run 41293739567](https://github.com/m2ux/workflow-server/actions/runs/41293739567), event `pull_request`:

- [Every skill in scope meets the shared skill guidelines](https://github.com/m2ux/workflow-server/actions/runs/41293739567/job/124810149454): failure, `server-in-the-loop/SKILL.md:114: trailing blank line`, `80 files checked, 1 findings`, exit code 1.
- [Every excluded skill still carries the findings that exclude it](https://github.com/m2ux/workflow-server/actions/runs/41293739567/job/124810149374): success.

The scratch pull request was closed unmerged and its branch deleted.

Result: ✓.

## Base Updates

The epic base moved three times while the pull request was open; each time `origin/i11/e10/workspace` was merged into the task branch and T1 and T2 re-run.

- **`5b6d28b93`, base `41537ea98`.**
  T1 as above, all three trees. T2: 76 passed. Job run [41293938250](https://github.com/m2ux/workflow-server/actions/runs/41293938250): both jobs success.
- **`0a10df845`, base `d7a0bc9ec`.**
  The base now carries the GitNexus CLI change, and `skills/gitnexus` reports no finding. The `exclusions` job step fails locally with `skills/gitnexus reports no finding; remove it from EXCLUDED`, the lapse it exists to report. Commit `e752d21ff` empties `EXCLUDED`.
- **`e933538df`, base `f0d01fd3f`, final.**
  T1 with `EXCLUDED` empty: clean tree `76 files checked, 0 findings`, both jobs exit 0; layout fault `server-in-the-loop/SKILL.md:114: trailing blank line`, `skill-files` exit 1; `EXCLUDED=gitnexus` reports the lapse, `exclusions` exit 1. T2: 84 passed, 3 subtests passed. The work-planner suite: 627 passed, 1 skipped. Job run [41294093383](https://github.com/m2ux/workflow-server/actions/runs/41294093383): both jobs success, the scope job over 76 files with 0 findings.

## Limitations

- The repository's one ruleset (`Default`, id 11937302) requires no status check on any branch it covers, `workspace` included. The job reports its verdict on every pull request into `workspace` and the bases promoted into it; making that verdict block a merge is a repository setting outside this change.
