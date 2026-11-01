# W12 Evidence

Delivery head `a58730565` on `i11/e09/w12-branches-only-for-the`, with `i11/e09/workspace` at `bdc2524f6` merged in.

## Bases a Unit Changes

`python3 -m pytest test/test_deliver.py -v`, from `skills/work-planner`:

```text
test/test_deliver.py::Survey::test_a_unit_names_its_epic_base PASSED
test/test_deliver.py::Survey::test_a_unit_of_several_bases_declaring_none_is_undeclared PASSED
test/test_deliver.py::Survey::test_a_unit_takes_a_branch_and_worktree_per_epic_base PASSED
test/test_deliver.py::Survey::test_a_unit_takes_only_the_epic_bases_its_rows_change PASSED
test/test_deliver.py::Survey::test_a_work_item_is_read_only_from_the_engineering_checkout PASSED
```

- `test_a_unit_takes_only_the_epic_bases_its_rows_change` (AC18): an epic with bases `main`, `workflows` and `workspace`; the unit's work item declares `workspace:skills/plan.py`; the unit line names one unsuffixed branch on `i07/e00/workspace` and neither other base.
- `test_a_unit_takes_a_branch_and_worktree_per_epic_base` (AC16, kept): a joined unit declaring `main` and `workflows` gets a suffixed branch and worktree for each.
- The undeclared tests: no work-item link, a bare-path component, a branch with no epic base, and no `--engineering` each print an `undeclared` line and exit 1.

## Full Suite

`python3 -m pytest skills/work-planner/test -q`: 538 passed, 1059 subtests passed.

## Documents

`python3 skills/scripts/check_skill_files.py work-planner`: 51 files checked, 0 findings.
