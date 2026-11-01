# Review Fix Validation

Each fix answers one finding of the agent review of [#1505](https://github.com/m2ux/workflow-server/pull/1505) at `d4948668554c89e1c6120af03148342d3e051149`. Each branch is cut from `i11/e16/workspace` at that commit.

## W09

**Finding.** Run at Revision is specified under `sbx`, which leaves the repository's git directory read-only, so `git worktree add` fails and the instrument never runs (exit 2).

- The documented command, run outside `sbx` from the W09 worktree with `--project /home/mike1/projects/dev/workflow-server --revision origin/i11/e16/workspace` and an `sbx`-prefixed `pytest test_revision_check.py` instrument, printed the revision line, ran 6 tests to a pass, and left no `revision-check` worktree in `git worktree list`.
- Full suite: 541 passed, 1078 subtests passed. `check_skill_files.py skills/work-planner`: 0 findings.

## W10

**Finding.** Access Development Links' read ran Capture Pull Request Links with a record nothing supplied.

- The read step runs Read Pull Request State first, whose saved metadata carries the `html_url` the capture keys by.
- Full suite: 541 passed, 1078 subtests passed. `check_skill_files.py skills/work-planner`: 0 findings.

## W11

**Finding.** A `gh` call refused outright, such as a 401, was reported as every subject "not returned".

- `FailedCall` in `test_link_capture.py`: a rejected credential exits naming `Bad credentials`; non-JSON output exits naming `gh`'s stderr; GraphQL errors still return for per-subject naming.
- Full suite: 544 passed, 1078 subtests passed. `check_skill_files.py skills/work-planner`: 0 findings.

## W12

**Finding.** AC8's draft pull request on a non-default branch was not exercised.

- `Live` in `test_development_link.py`, run outside `sbx` with `WORK_PLANNER_LIVE_LINK='m2ux/workflow-server#1474 m2ux/workflow-server#1505'`: #1505 is a draft targeting `workspace` (default `main`); two adds each verified, the issue holding #1505 once and #1505 holding the issue. 1 passed.
- Full suite without the variable: 541 passed, 1 skipped, 1078 subtests passed. `check_skill_files.py skills/work-planner`: 0 findings.
