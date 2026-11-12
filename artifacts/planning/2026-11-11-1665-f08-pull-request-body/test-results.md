# F08 Test Results

Branch `skill/pull-request-body-check` at 7a83a8ae9, which merges `workspace` at e6eb1af6d, F14's merge of #1708, into the branch cut from 9d020bc9b. Commits: 8e5d0adb1 names the flag in the conventions and adds the command-block check, d07d6e55a adds Validate Pull Request Body and wires it into Publish Pull Request and Deliver, review fixes b1c78b53b, c17efa133 and 4d25f1742 report a kind's issue field in any section through the Kind interface's issue_fields, hold an epic review to its References, widen the flag match and rejoin a docstring line, and c42cacb1c names the hot-fix `Target:` line in Body Findings, linking Hot-fix Body's Target. The merge's one conflict, the test README's Scripts table, resolves to F14's counts with the pull_request_body row. The tests in T1, T2 and T4 were run again at 7a83a8ae9.

## T1. Body Validation Tests

`test_pull_request_body.py`, fourteen tests over `pull_request_body.py`: a body laid out as the Template has no finding, and optional sections may be absent; a `Target:` line, in any form and in any section, gives `Overview: hot-fix issue field the template does not carry` (or the section holding it), and a fenced one is a specimen; a Problem section gives `extra section: Problem`; a missing Test Plan gives `required section missing: Test Plan`, and a checked-list plan gives `Test Plan: unreadable test plan`, read through `testplan.rows`; misplaced, repeated and preceding text are each reported. With `--review`, Overview, Changes and References are required and a Test Plan is an extra section. The command prints each finding with the file and exits 1, and exits 0 silently on a clean body. `test_kinds.py` shows the hot-fix module supplies `issue_fields` with the interface's signature. Covers AC1.

## T2. This Body Validated

`pull_request_body.py` run on this pull request's body, the draft before its results were recorded and the body carrying them: no finding, exit 0. Covers AC1.

## T3. Conventions Reading

`conventions.md` Bodies: "`gh api -F` reads an `@path` value as that file's content, and `-f` sends the value as text, so `-f body=@file` publishes the path itself. A value supplied as text takes `-f`." It follows the rule that bodies go through a file with `-F body=@file`, and the guidelines' Bodies rule links Conventions for the flag. Covers AC2.

## T4. File Value Checker Tests

`test_check_skill_files.py`, four tests: a fenced block sending `-f 'body=@body.md'` and an HTML invocation sending `--raw-field body=@body.md` each give `file value sent as text` on that line, as do `--raw-field=body=@` and `-fbody-text=@`; `-F 'body=@body.md'`, a text value holding `@`, and prose naming `-f body=@file` give none. The finding kind is mapped under `operations/bodies` in `skills/work-planner/rules.json`. Covers AC3.

## T5. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner` at 7a83a8ae9: 65 files checked, 0 findings, so no command block in the skill sends `body=@` under `-f`. Against `workspace` at e6eb1af6d, F08's diff adds no Work Kind Registration link to a step or field, and nothing in its tests or `rules.json` names the check F14 retires. Covers AC3.

## T6. Planner Suite, Shared Suite and Whitespace

At 7a83a8ae9, the work-planner suite: 1267 tests, OK, 1 skipped. The shared suite (`skills/test`): 333 tests, OK. The skill-file check: 65 files, 0 findings. `git diff --check origin/workspace HEAD`: clean.
