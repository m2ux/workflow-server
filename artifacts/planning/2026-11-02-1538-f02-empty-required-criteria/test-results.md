# F02 Test Results

> Tested revision: 3a5c485659664d23d3536bb8efe1d69d9b72c4dd on f02-empty-required-criteria

## T1 Nothing Declared Requires Nothing

Run from skills/work-planner/test: `python3 -m unittest test_format`

- DeclarationAtRevision: test_a_project_declaring_none_requires_nothing (no file at the commit), test_an_empty_declaration_requires_nothing (`''`, whitespace, `[]`) and test_a_declaration_at_another_revision_supplies_nothing each read no criterion and no unevaluable fault, with the source naming the evaluated commit.
- CheckFormat: test_a_project_declaring_nothing_is_held_to_nothing runs format.py for a missing file, an empty file and `[]`, with the working file holding the guide example; the run prints its source and no `required criteria` or lacking-criterion line.
- Result: AC1 holds.

## T2 An Unreadable Declaration Is Unevaluable

Same run.

- test_a_declaration_other_than_an_array_is_unevaluable: `{}`, `null`, a string and a bare object each read `<source> is not an array`, with no criterion.
- test_an_unreadable_declaration_is_unevaluable: non-JSON reads `<source> is not JSON`.
- test_an_unreadable_declaration_is_reported_with_its_fault: format.py prints `required criteria unevaluable:` with the source and the fault for `{}` and non-JSON, and no lacking criterion.
- Result: AC2 holds.

## T3 Required Criteria Guide

test_the_guide_requires_nothing_of_a_project_declaring_nothing reads the Required Criteria section of artifacts/epic-issue-body.md: the bullet "A project declaring nothing requires nothing." names a missing file, an empty file and an empty array; the bullet "An unreadable statement is unevaluable." names a revision resolving to no commit, unreadable JSON, a value other than an array and an entry lacking a field, and none of the three empty forms. A grep of skills/ for the old wording ("declares no criterion", "missing, empty or malformed", "absent statement is") finds nothing.

- Result: AC3 holds.

## T4 Skill Test Suite

Run from skills/work-planner: `python3 -m unittest discover -s test`

- Result: 834 tests, OK (1 skipped).

## T5 Skill-File Check

Run in the worktree: `python3 skills/scripts/check_skill_files.py skills/work-planner`

- Result: 52 files checked, 0 findings.
