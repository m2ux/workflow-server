# W24 Validation

## Candidate

- Unit: I17:E02:W24, AC31 and AC32.
- Task base: `85e6250c5` (origin/i17/e02/workspace after W31 #1675).
- Task head: `6c5c168b3`, branch `i17/e02/w24-deliver-py-reaches-kinds`.
- Owner: `skills/work-planner/scripts/deliver.py` — `kind_units` and `ready_merges` select a kind with `kinds.kind_of` and reach its `tag`, `target`, `linking_pulls`, `delivering_pulls` and `unit_state` through `kinds.interface`; `target_fault` takes the target its kind reads. Title tags come from `board.tags`, issue identity from `sync.issue_key`.
- Import graph: deliver imports board, kinds and sync; none of them imports deliver, and kinds loads each kind module on demand.

## Observing Tests

[focused.log](focused.log): `test_deliver` 102 pass, including every hot-fix survey fixture in `HotFixUnits` with unchanged outputs.

| Criterion part | Test |
| --- | --- |
| AC31: no kind module import, kind name or tag literal in deliver.py | `KindRegistry.test_deliver_imports_no_kind_module_and_names_no_kind` |
| AC31: a newly registered kind reaches unit and merge lines through the registry | `KindRegistry.test_a_registered_kind_reaches_the_survey_through_the_registry` |
| AC31: each unit state a kind reads prints its line | `KindRegistry.test_each_state_a_kind_reads_prints_its_line` |
| AC31: a kind naming no target offers no unit | `KindRegistry.test_a_kind_naming_no_target_offers_no_unit` |
| AC31: hot-fix outcomes unchanged | `HotFixUnits` (all) |
| AC32: tags and identity are board's and sync's single implementations | `SharedRules.test_deliver_reaches_tag_parsing_and_identity_through_their_single_homes` |
| AC32: deliver.py defines no shared rule | `SharedRules.test_deliver_defines_no_shared_rule` |

## Kind and Duplicate-Function Search

[kind-search.log](kind-search.log): deliver.py names no hot-fix, `[Fnn]` tag or kind module, and reaches kinds only through `kind_of` and `interface`. It defines no `tags`, `key_of`, `issue_key` or title `PREFIX`. The remaining copies belong to other rows: `board-queue.py` (W25), `progress.py` (W27), `statuses.key_of` (W46).

## Full Checks

- Planner: 1095 tests, one opt-in live-link skip, [planner.log](planner.log).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_deliver.py -v        # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```
