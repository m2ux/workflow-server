# Test Results

Delivery evidence for I11:E10 W04, W05 and W06, recorded at branch head `8118bf10b` of `i11/e10/w04-command-specification-and-vocabulary`, which holds `origin/i11/e10/workspace` at `04bfa7a8c`.

## Commands Check

`SkillWideChecks` commands tests in `skills/test/test_check_skill_files.py`: a shell block and an unlabelled block in a mode's procedure are reported; a block inside the mode's Operations specification, a markdown template and a shell block outside a mode file are not. Five tests, all pass.

## Vocabulary Check

`SkillWideChecks` vocabulary tests: a retired term in prose and in a script is reported; one in a code span or fence, a lower-case flag and a longer word are not; a skill with no `vocabulary.json` reports nothing; an unreadable declaration exits 1. Six tests, all pass.

## Guides Check

`SkillWideChecks` guides tests: a shared rule restated under its label and section title in a skill guide is reported; the same label under another section and a skill-specific label stand. Three tests, all pass.

## Interface Check

`SkillWideChecks` interface tests: a REST operation, a GraphQL read with its REST gap, a GraphQL write through a script with its gap, a script sending no GraphQL, and Projects V2 with its board link are accepted; GraphQL without a gap is reported directly and through a script; a classic Projects mutation with a gap stated, a classic REST endpoint, a classic field in prose and a classic connection in a script are each reported. Eleven tests, all pass.

## Rules Check

`SkillWideChecks` rules tests: a rule reaching a registered kind or review stands; a rule with no entry, an entry naming an unknown operation, an entry for no rule and two rules under one key are each reported; the shared guide is read from a run over its skill; an unreadable `rules.json` exits 1; every kind the source reports is registered; an unregistered kind is refused. Nine tests, all pass.

## Full Suites

- `python3 -m pytest skills/test -q`: 142 passed.
- `python3 -m pytest skills/work-planner/test -q`: 645 passed, 1 skipped.
- `skills/workflow-canon/test` fails at collection on an unset `CANON_TEST_ENGINE`, at the base and at this head alike; that prerequisite is AC18's.

## Corpus Run

- `python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon`: 68 files checked, 0 findings.
- `python3 skills/scripts/check_skill_files.py skills`: 38 findings, every one `section outside the set` in gitnexus and server-in-the-loop entry points, which the base reports identically and the skill gate holds out.
- Before the corpus changes, the new checks reported: four GraphQL specifications without a REST gap in Work Planner's `pull-request.md` and `issue.md`; two Work Planner Prose rules restating shared labels; a retired `PRs` in `align-mode.md` and `PR` in `agent_review.py`; and, after each base merge, each newly added shared rule until `rules.json` named its operation.
