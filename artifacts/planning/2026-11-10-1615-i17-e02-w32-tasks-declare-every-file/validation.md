# W32 Validation

## Candidate

- Unit: I17:E02:W32, AC62.
- Task base: `abe6550e0` (origin/i17/e02/workspace after W21 #1682).
- Task head: `d30faa3274437628aca14f9bd4377ac709c69c1a`, branch `i17/e02/w32-tasks-declare-every-file`.
- Owner: `skills/work-planner/artifacts/work-item.md` (Component lists every file the task changes, separated by commas; the split-per-file rule is removed).
- Readers: `scripts/deps.py` (candidate units and contention by any shared file), `scripts/deliver.py` (a unit changes every epic base its files name), and the prose readers Dependency Graph, Epic Issue Body, Delivery Plan, Delivery Branches, Delivery Brief, Dispatch Batch, Hot-fix, Sync Mode, Plan Mode, Deliver Mode and Unit Dispatch.

## Multi-File Fixtures

Sixty-nine focused tests pass ([focused.log](focused.log)): the deps.py `CandidateUnits`, `UnitAccounting`, `DirectoryComponents` and `ComponentContention` classes and the deliver.py `Survey` class. The fixtures added for AC62:

| Fixture | Test | Observed |
| --- | --- | --- |
| Several files on one base | `test_deliver.Survey.test_a_row_declaring_several_files_on_one_base_takes_that_base` | One branch on `i07/e00/workspace`; no other base; undeclared 0 |
| Files on two bases | `test_deliver.Survey.test_a_row_declaring_files_on_two_bases_routes_its_unit_to_both` | One branch each on `main` and `workspace`; `workflows` untouched |
| One file off the epic bases | `test_deliver.Survey.test_a_row_with_one_file_off_the_epic_bases_is_undeclared` | `undeclared ... file docker:Dockerfile names docker, which has no epic base`; no unit offered |
| Rows sharing one of several files | `test_deps.CandidateUnits.test_rows_sharing_one_of_several_declared_files_are_a_candidate` | `W01, W02 extend workspace:b.py` and `W01, W03 extend workspace:a.py` |
| Rows sharing several files | `test_deps.CandidateUnits.test_rows_sharing_several_files_are_one_candidate_naming_each` | One candidate line naming both shared files |
| Cross-epic contention on a shared file | `test_deps.ComponentContention.test_a_pair_sharing_one_of_several_files_is_printed_and_separated`, `test_rows_of_different_epics_sharing_one_of_several_files_are_paired` | Pair printed with the shared file; epics take priorities 2 and 1 |
| Each listed spelling | `test_deps.ComponentContention.test_each_listed_file_is_read_in_its_own_spelling` | Link, code span, `./` and trailing full stop read per entry; duplicate dropped |
| Directory among files | `test_deps.DirectoryComponents.test_a_directory_among_several_files_is_a_problem` | Problem names the directory; row unchecked |
| Undeclared row | `test_deps.ComponentContention.test_a_work_item_declaring_no_component_is_a_problem`, `test_deliver.Survey.test_a_unit_of_several_bases_declaring_none_is_undeclared` | `declares no file`; undeclared lines name the file and why |

The W32 work item itself declares seventeen files on one line; deps.py reads it with no problem against the live E02 body.

## Full Checks

- Planner: 1108 tests, one opt-in live-link skip, [planner.log](planner.log) (first line is the head it ran at; includes document/model and test-catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings against origin/i17/e02/workspace, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_deps.CandidateUnits test_deps.UnitAccounting test_deps.DirectoryComponents test_deps.ComponentContention test_deliver.Survey   # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Design Note

A row is undeclared when any declared file names no long-lived branch or one with no epic base, not only when none does: a file on a branch the epic has no base for would otherwise go undelivered without a finding.
