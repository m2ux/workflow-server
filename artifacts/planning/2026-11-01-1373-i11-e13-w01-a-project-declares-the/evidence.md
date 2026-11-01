# Delivery Evidence

Task branch `i11/e13/w01-a-project-declares-the` at `cce6a65e7`, based on `i11/e13/workspace` at `b0294e200`.

## Changed Paths

- `skills/work-planner/artifacts/epic-issue-body.md`
- `skills/work-planner/test/test_format.py`

Both lie inside the work item's file-change declaration.

## Required Criteria Fixtures

`test_format.py`'s `RequiredCriteria` cases, run with `python3 -m unittest discover -s test` from `skills/work-planner`:

| Case | Observes | Result |
| --- | --- | --- |
| `test_the_guide_names_the_declaration_and_its_fields` | The guide names `config/required-criteria.json` and the fields `branch`, `criterion`, `phrase`, `row`, in that order | Pass |
| `test_a_project_declaring_one_criterion_carries_it` | A fixture project holding the guide's Example declares one criterion with those four fields | Pass |
| `test_a_project_declaring_none_is_unevaluable` | A fixture project with no declaration is unevaluable, not a project requiring nothing | Pass |
| `test_an_empty_declaration_is_unevaluable` | An empty file, an empty array and a non-array are unevaluable | Pass |
| `test_an_unreadable_declaration_is_unevaluable` | A declaration that is not JSON is unevaluable | Pass |
| `test_an_entry_lacking_a_field_is_unevaluable` | An entry missing or emptying a field is unevaluable, naming the fields | Pass |

## Suite

- `python3 -m unittest discover -s test`: 477 tests, OK.
- `python3 -m pytest skills/work-planner/test -q`: 478 passed, 1 collection error in `test_align.py::test_plan_agreement`. The error is present at the epic base before this change; [#1491](https://github.com/m2ux/workflow-server/issues/1491) carries it.
- `python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.

## Limitations

The fixtures check the declaration contract the guide states, through a reading of it local to the test module. The format check's own reader is outside this task.
