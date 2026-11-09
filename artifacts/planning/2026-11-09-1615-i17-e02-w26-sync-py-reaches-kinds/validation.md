# W26 Validation

## Candidate

- Unit: I17:E02:W26, AC35.
- Task base: `01f84933a` (origin/i17/e02/workspace after W14 #1668).
- Task head: `d055c05d8e9a299f09b3e84074a3942886179cf0`, branch `i17/e02/w26-sync-py-reaches-kinds`, current with origin/i17/e02/workspace after W30 #1672 and W18 #1669; the change commit is `674578c23`.
- Component: `skills/work-planner/scripts/sync.py`.

## Kind Search

AC35. [test_sync](https://github.com/m2ux/workflow-server/blob/i17/e02/w26-sync-py-reaches-kinds/skills/work-planner/test/test_sync.py) `KindRegistry.test_sync_imports_no_kind_module_and_names_no_kind` passes ([focused.log](focused.log)):

- For every kind `KINDS` registers, `sync.py` imports no module the registry maps it to and its source names neither the kind nor its module, in any case. Code, docstring and messages are all searched.
- Against the base `sync.py` the same test fails on `hot-fix`, so it observes the change.

## Sync Tests

AC35. [test_sync](https://github.com/m2ux/workflow-server/blob/i17/e02/w26-sync-py-reaches-kinds/skills/work-planner/test/test_sync.py) passes in full, 187 tests ([focused.log](focused.log)):

- `KindRegistry.test_an_issue_of_a_stand_in_kind_is_recorded_through_its_interface` registers a stand-in kind only in the test. `sync.py` records its issue as `#4 stand-in (open)`, links and ticks it through the stand-in's `delivering_pulls`, and refuses a non-delivering `--pr` with the stand-in's `delivery_fault`. Against the base `sync.py` it errors: the stand-in title has no recognised prefix.
- Every existing sync test keeps its outcome, including the four `HotFixDelivery` fixtures (delivered and ticked, unlinked, unprefixed and misrouted refusals), so outputs are unchanged for identical inputs.
- No shared rule moved, so no duplicate-function search applies.

## Full Checks

- Planner: 1069 tests at the merged head, one opt-in live-link skip, [planner.log](planner.log) (includes installed document/model and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_sync.py -v          # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Delivery

[#1674](https://github.com/m2ux/workflow-server/pull/1674) merged at verified head `d055c05d8` with merge commit `a5bba6bb2e78cfff216f54809e0a5b2d21bd55bb`.
