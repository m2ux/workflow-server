# W30 Validation

## Candidate

- Unit: I17:E02:W30, AC40.
- Task base: `01f84933a` (origin/i17/e02/workspace after W14 #1668).
- Task head: `2c20d09c3`, branch `i17/e02/w30-dispatch-py-names-no`.
- Owner: `skills/work-planner/scripts/dispatch.py` — `IDENTITY` reads a repository-qualified tag, `ROWS` the agent-engineering row grammar, and `registered` accepts any other tag the script registry recognises through `kinds.kind_of`; `unit_members` rejects a row selector that names no task.
- Import graph: dispatch imports `kind_of` from kinds; kinds imports no general script and imports a kind module only on lookup, so the graph stays acyclic.

## Observing Tests

[focused.log](focused.log): `test_dispatch` 22 pass, each existing test, hot-fix fixtures included, with its outcome kept.

| Criterion part | Test |
| --- | --- |
| A kind's item dispatches only while the registry holds the kind | `Kinds.test_a_registered_kinds_item_dispatches_through_the_registry` |
| A tag no registered kind recognises is no dispatch identity | `Kinds.test_an_unregistered_tag_is_no_dispatch_identity` |
| dispatch.py names no kind and imports only `kind_of` from the registry | `Kinds.test_dispatch_names_no_kind_and_imports_only_the_registry_lookup` |
| Hot-fix identity keeps its outcome | `Refill.test_hotfix_export_uses_repository_qualified_identity`, `Refill.test_real_lane_filtered_export_drives_dispatch_and_keeps_hotfixes` |
| Parent selectors stay non-dispatchable | `Refill.test_parent_selectors_cannot_be_dispatched_as_units` |

The three `Kinds` tests fail against the base `dispatch.py` (two failures, one error).

## Kind and Import Search

[kind-search.log](kind-search.log): dispatch.py names no hot-fix, `F00` tag or kind module, and its only kinds import is `kind_of`. No shared rule moved, so `registered`, `members` and `unit_members` each have one definition.

## Full Checks

- Planner: 1062 tests, one opt-in live-link skip, [planner.log](planner.log).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log) (empty).

Commands use `/home/mike1/projects/dev/workflow-server/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_dispatch.py -v       # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```
