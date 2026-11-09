# W28 Validation

## Candidate

- Unit: I17:E02:W28, AC38.
- Task base: `36c18a359` (origin/i17/e02/workspace after W30 #1672).
- Task head: `d3ad182bd`, branch `i17/e02/w28-format-py-reaches-kinds`.
- Owner: `skills/work-planner/scripts/format.py` selects a registered kind with `kinds.kind_of` and reads its tag, labels and body faults through `kinds.interface`. A registered kind takes the standalone template and a theme label; its interface names any further labels, and each excludes other labels of its scope.
- Folded design: the Kind interface gains `labels(issue)` (`kinds.py`) and the hot-fix module supplies it as `[priority: 10]` (`hotfix.py`). The `hotfix_faults` alias, which lost its only caller, is removed.
- Import graph: format imports kinds; kinds imports no general script and a kind module only on lookup, and hotfix imports format only inside functions, so the graph stays acyclic.

## Observing Tests

[focused.log](focused.log): `test_format`, `test_kinds` and `test_hotfix`, 146 pass. Every existing hot-fix fixture in `test_format.HotFixes` keeps its outcome; the type-label finding reads "without the hot-fix tag" where it read "without an [F00] prefix", since the tag form is the kind's own.

| Criterion part | Test |
| --- | --- |
| A kind the registry holds is checked through its interface, with format.py naming none | `RegisteredKinds.test_a_registered_kind_is_checked_through_its_interface` |
| Its labels and their scopes come from the interface | `RegisteredKinds.test_its_interface_names_its_labels_and_their_scopes` |
| It takes the standalone template and a theme | `RegisteredKinds.test_it_takes_the_standalone_template_with_a_theme` |
| Its type label on an untagged title is a finding | `RegisteredKinds.test_its_type_label_on_an_untagged_title_is_a_finding` |
| format.py names no kind and imports no kind module | `RegisteredKinds.test_the_script_names_no_kind_and_imports_no_kind_module` |
| The title name follows a registered tag | `HotFixes.test_a_hot_fix_title_name_follows_its_tag` |
| The hot-fix module supplies `labels` with the interface's contract | `test_kinds.Substitution`, `test_hotfix.Labels` |

## Kind and Import Search

[kind-search.log](kind-search.log): format.py names no hot-fix, `F00` tag, priority label or kind module; its only registry import is `KINDS, interface, kind_of`. No shared rule moved between files, so no duplicate-function search applies.

## Full Checks

- Planner: 1069 tests, one opt-in live-link skip, [planner.log](planner.log) (includes installed document/model and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_format test_kinds test_hotfix          # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Limits

Agent-engineering levels (proposal, initiative, epic, task, standalone issue) stay format.py's own grammar; they are not registered kinds of work.
