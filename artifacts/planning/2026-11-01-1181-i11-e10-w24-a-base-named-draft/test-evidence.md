# Test Evidence: A Base Named Draft Only Where It Leads

> Delivery evidence · Created 2026-11-01

Evaluated commit `27dd83c20844115ea4b7f22b6dea924d8f03cd9d` on `i11/e10/w24-a-base-named-draft`, which holds `origin/i11/e10/workspace` at `f0d01fd3f`. Tests run from the unit worktree under `sbx`.

Changed paths:

- `skills/work-planner/scripts/sync.py`
- `skills/work-planner/test/test_sync.py`
- `skills/work-planner/artifacts/epic.md`
- `skills/work-planner/artifacts/epic-issue-body.md`

## T1

A base level with or behind its long-lived branch draws no draft line.

```bash
python3 -m pytest skills/work-planner/test/test_sync.py -k DraftBase -rA
```

Each test builds a repository whose remote-tracking refs `origin/main` and `origin/i01/e00/main` stand where a fetch leaves them, names the base as `origin/i01/e00/main`, and leaves the epic incomplete.

- `test_a_base_level_with_its_branch_is_not_draft` passed: no `draft` line and no `unevaluable` line.
- `test_a_base_behind_its_branch_is_not_draft` passed: three commits on `main` only, no `draft` line.
- `test_a_merged_review_leaves_a_level_base_without_a_draft` passed: the review pull request merged and the base is level, no `draft` line.

## T2

A base holding a commit its long-lived branch lacks draws a draft line.

- `test_a_base_ahead_of_its_branch_is_draft` passed: `draft: i01/e00/main`, with no `unevaluable` line.
- `test_a_base_ahead_of_and_behind_its_branch_is_draft` passed.
- `test_a_base_that_gains_a_commit_after_its_review_merged_is_draft_again` passed: a merged review pull request does not withhold the line.
- `test_an_open_review_withholds_the_draft` passed: an open draft review pull request withholds it.
- `PinnedEpicBase::test_the_epic_base_states_its_own_long_lived_branch` passed: a base one commit ahead of `workflows` is draft.

## T3

A base the run cannot compare is reported unevaluable rather than draft.

- `EpicClose::test_a_base_no_revision_names_is_unevaluable_rather_than_draft` passed: `unevaluable: draft i01/e00/main: no --revision names it, so what it carries against main is unread`.
- `test_a_long_lived_branch_absent_beside_the_base_is_unevaluable` passed: `fork/main resolves to no commit`.
- `test_a_base_in_another_repository_is_unevaluable` passed.

## T4

The comparison against the live repository, after `git fetch origin`, through `sync.base_lead`:

```text
i11/e09/workspace (0, '')
i11/e10/workspace (25, '')
```

`i11/e09/workspace`, whose content landed through its review pull request, is level with `workspace` and would draw no draft line; `i11/e10/workspace` leads by 25 commits and would.

## T5

The full work-planner suite.

```bash
python3 -m pytest skills/work-planner/test -q
```

636 passed, 1 skipped, 1137 subtests passed.

## T6

The shared skill-file check over the work-planner skill.

```bash
python3 skills/scripts/check_skill_files.py skills/work-planner
```

50 files checked, 0 findings. Over all of `skills/`, 77 files checked, 0 findings.
