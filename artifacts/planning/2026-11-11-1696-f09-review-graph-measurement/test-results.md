# F09 Test Results

> Tested revision: 82bbb074db766dbc05cd96460ae6e6221979e4f0 on f09-review-graph-measurement, against `workspace` at bfb6e7ca9371d96b66628823c2c0ef55733d3c2e

## T1 Index-Only Indexing Leaves The Review Worktree Clean

A fresh detached review worktree for #1692 at `6fce88bdc343d55093d762daecc6557f1a7d5401`, created with `git worktree add --detach .worktrees/pr/1692-6fce88bdc343d55093d762daecc6557f1a7d5401 6fce88bdc343…`, had `git status --porcelain` empty. Index Repository ran there as `gitnexus analyze --index-only` (GitNexus 1.6.12): `Repository indexed successfully (30.2s)`, 6,117 nodes, 334 flows. Afterwards:

- `git status --porcelain --untracked-files=all` printed nothing; AGENTS.md and CLAUDE.md were unchanged and no `skills/gitnexus-*`, `.claude/skills` or `.agents/skills` file appeared.
- The index sits in `.gitnexus/`, which carries its own `.gitignore`, so it reports only as ignored.
- `gitnexus status` reported `Indexed commit: 6fce88b`, `Current commit: 6fce88b`, `Status: up-to-date`.
- Result: AC1 holds. Passed.

## T2 Change Surface For A Merged Pull Request

#1692 is merged into `i17/e02/workspace`; its snapshot gives head `6fce88bdc343d55093d762daecc6557f1a7d5401` and `base.sha` `1ec2a4745a6e685d906dfd488775ffd939028b0b`. `i17/e02/workspace` has since moved to `bd5ccafc5`.

- Merge Base: `git fetch origin 1ec2a4745…` then `git merge-base 6fce88bdc… 1ec2a4745…` printed `1ec2a4745a6e685d906dfd488775ffd939028b0b`.
- Change Surface against it, `gitnexus detect-changes --scope compare --base-ref 1ec2a4745a6e…`: `Changes: 4 files, 77 symbols` — `skills/scripts/check_skill_files.py`, `skills/test/fixtures/prerequisites-756aaf9.json`, `skills/test/test_check_skill_files.py` and `skills/work-planner/rules.json`, the exact file list GitHub reports for #1692.
- The base-branch form, `--base-ref origin/i17/e02/workspace`, gave `Changes: 17 files, 50 symbols`, among them sections of `agent-review.md` and `delivery-branches.md` that #1692 never touched: the later commits on the moved base, read as the pull request's change.
- Result: AC2 holds. Passed.

## T3 Skill Suites And Skill-File Check

- `skills/work-planner`: `python3 -m unittest discover -s test` ran 1024 tests, OK (1 skipped), at both 33dc00c9c and 82bbb074d.
- `skills`: `python3 -m unittest discover -s test` ran 280 tests, OK, at both revisions.
- `python3 scripts/check_skill_files.py work-planner`: 59 files checked, 0 findings, at both revisions.
- Result: Passed.
