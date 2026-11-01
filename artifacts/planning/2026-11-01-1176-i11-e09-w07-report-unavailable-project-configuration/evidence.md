# W07 Delivery Evidence

Delivery head: `603cfb9604de84291521dd1e37c4321eff382c24` on `i11/e09/w07-report-unavailable-project-configuration`. Base: `3f7915377194f0685841ca272253cb0aed458383` (`i11/e09/workspace`), unchanged since the branch was cut. Pull request: [#1501](https://github.com/m2ux/workflow-server/pull/1501).

Changed paths: `skills/work-planner/scripts/sync.py`, `skills/work-planner/test/test_sync.py`, `skills/work-planner/artifacts/delivery-branches.md`, `skills/work-planner/artifacts/epic-issue-body.md`, `skills/work-planner/artifacts/epic.md`, `skills/work-planner/modes/sync-mode.md`, `skills/work-planner/modes/align-mode.md`, `skills/work-planner/protocols/issue-delivery.md`, `skills/work-planner/protocols/task-merge.md`.

Every command ran from the unit worktree under the workspace sandbox: `python3 -m pytest skills/work-planner/test ...`.

## Unevaluable Statements

T1, AC11. `LongLivedNames` in `test_sync.py`. Each case asserts exit 1 and the full `unevaluable:` line: path, commit (or the revision, where none resolves) and the shared git directory.

- `test_a_statement_only_at_another_revision_is_unevaluable` — present at HEAD, absent at the evaluated commit: `is absent`.
- `test_an_empty_statement_is_unevaluable` — `names no branch`.
- `test_a_directory_in_place_of_the_statement_is_unreadable` — `is unreadable: a tree, not a file`.
- `test_a_statement_that_is_not_text_is_unreadable` — `is unreadable: not UTF-8 text`, nothing on standard output.
- `test_a_revision_resolving_to_no_commit_is_unevaluable` — `config/branches at origin/i07/e00/main in <repo> is unreadable: the revision resolves to no commit`.
- `test_names_read_one_revision` — `--names` refuses a second `--revision`.

Result: all passed.

## Epic Base Without The Statement

T2, AC11. `UnavailableDeclaration.test_a_base_without_the_statement_is_unevaluable_with_its_source`: the epic base is cut from a commit before `main` states the branches, so the statement is present only at another revision. The epic sync exits 0, prints `unevaluable: config/branches at <base commit> in <repo> is absent`, prints no `source` line and no `unmerged` line, and reports `closable: no (long-lived branches unevaluable)`.

Result: passed.

## Checks Not Made

T3, AC13. `UnavailableDeclaration`:

- `test_the_checks_left_unmade_are_named` — an unevaluable base prints a `not checked` line for each of the five checks that read the long-lived branches, and no `draft` line.
- `test_a_run_given_no_branches_names_the_checks_it_did_not_make` — no `--project`: `unevaluable: long-lived branches not given` and the five `not checked` lines.
- `test_a_readable_statement_leaves_no_check_unmade` — control: a readable base prints a `source` line and no `unevaluable` or `not checked` line.

Result: all passed.

## Disagreeing Epic Bases

T4, AC14. `SeveralEpicBases`, one repository with `i01/e00/main` stating `docker, main` and `i01/e00/workflows` stating `docker, main, workflows` on its own commit:

- `test_disagreeing_declarations_are_each_reported_with_their_source` — two `unevaluable` lines, each with its commit, repository and names; no `source` line; every check `not checked`; not closable.
- `test_agreeing_declarations_are_read_from_each_source` — three revisions at two commits stating the same names: two `source` lines, the names apply (`closable: no (unmerged i01/e00/main)`).
- `test_one_absent_declaration_leaves_the_names_unevaluable` — the absent base is reported `is absent` with its source, the readable one keeps its `source` line, and the names stay unevaluable.

Result: all passed.

Live run against #1176, the delivery head's `sync.py` with `--revision` for `origin/i11/e09/workspace`, `origin/i11/e09/main`, `origin/i11/e09/workflows` and `origin/i11/e09/docker`: three `source` lines and `unevaluable: config/branches at 824e364391089f44a14065202947b4c8a62204d0 in /home/mike1/projects/dev/workflow-server/.git is absent` for `origin/i11/e09/main`, which carries no statement until W08 lands, followed by the five `not checked` lines. With the names unevaluable, the epic-base pull requests #1487, #1497 and #1498 read as in flight, which is the first unmade check; Sync Mode leaves them unmatched.

## Full Suite

T5. `python3 -m pytest skills/work-planner/test -q` on the delivery head: `509 passed, 1027 subtests passed`.

## Documents

T6. `python3 skills/scripts/check_skill_files.py skills/work-planner`: `50 files checked, 0 findings`.

## Plan Changes

None applied and none held. The unit created no task, epic or issue, folded no work and moved no row; validation found no debt to defer and no arising issue.
