# F08 Test Results

Branch `skill/pull-request-body-check` at 4d25f1742, cut from `workspace` at 9d020bc9b. Commits: 8e5d0adb1 names the flag in the conventions and adds the command-block check, d07d6e55a adds Validate Pull Request Body and wires it into Publish Pull Request and Deliver, and review fixes b1c78b53b, c17efa133 and 4d25f1742 report a kind's issue field in any section through the Kind interface's issue_fields, hold an epic review to its References, widen the flag match and rejoin a docstring line.

## T1. Body Validation Tests

`test_pull_request_body.py`, fourteen tests over `pull_request_body.py`: a body laid out as the Template has no finding, and optional sections may be absent; a `Target:` line, in any form and in any section, gives `Overview: hot-fix issue field the template does not carry` (or the section holding it), and a fenced one is a specimen; a Problem section gives `extra section: Problem`; a missing Test Plan gives `required section missing: Test Plan`, and a checked-list plan gives `Test Plan: unreadable test plan`, read through `testplan.rows`; misplaced, repeated and preceding text are each reported. With `--review`, Overview, Changes and References are required and a Test Plan is an extra section. The command prints each finding with the file and exits 1, and exits 0 silently on a clean body. `test_kinds.py` shows the hot-fix module supplies `issue_fields` with the interface's signature. Covers AC1.

## T2. This Body Validated

`pull_request_body.py` run on this pull request's body, the draft before its results were recorded and the body carrying them: no finding, exit 0. Covers AC1.

## T3. Conventions Reading

`conventions.md` Bodies: "`gh api -F` reads an `@path` value as that file's content, and `-f` sends the value as text, so `-f body=@file` publishes the path itself. A value supplied as text takes `-f`." It follows the rule that bodies go through a file with `-F body=@file`, and the guidelines' Bodies rule links Conventions for the flag. Covers AC2.

## T4. File Value Checker Tests

`test_check_skill_files.py`, four tests: a fenced block sending `-f 'body=@body.md'` and an HTML invocation sending `--raw-field body=@body.md` each give `file value sent as text` on that line, as do `--raw-field=body=@` and `-fbody-text=@`; `-F 'body=@body.md'`, a text value holding `@`, and prose naming `-f body=@file` give none. The finding kind is mapped under `operations/bodies` in `skills/work-planner/rules.json`. Covers AC3.

## T5. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files checked, 0 findings, so no command block in the skill sends `body=@` under `-f`. `--compare 9d020bc9b HEAD skills/work-planner skills/scripts`: 889 sections at the base, 894 at the head, 9 added, removed or differing — Validate Pull Request Body, Check Pull Request Body, Body File, Body Findings and Workspace added, and Publish Pull Request, deliver-mode's Run Delivery Session and the test README's two tables changed. Conventions' and the guidelines' Bodies bullets sit outside any `###` section the comparison reads. Covers AC3.

## T6. Planner Suite, Shared Suite and Whitespace

At 4d25f1742, the work-planner suite: 1296 tests, OK, 1 skipped. The shared suite (`skills/test`): 340 tests, OK. The skill-file check: 65 files, 0 findings. `git diff --check 9d020bc9b HEAD`: clean.
