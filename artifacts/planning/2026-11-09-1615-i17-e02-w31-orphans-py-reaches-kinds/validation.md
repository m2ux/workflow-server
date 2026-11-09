# W31 Validation

## Candidate

- Unit: I17:E02:W31, AC41.
- Task base: `01f84933a` (origin/i17/e02/workspace after W14 #1668).
- Task head: `ed501e39c`, branch `i17/e02/w31-orphans-py-reaches-kinds`.
- Component: `skills/work-planner/scripts/orphans.py` — the standalone filter selects an issue's kind with `kinds.kind_of` and drops any issue of a registered kind; the docstring names registered kinds by their tag rather than the hot-fix prefix.
- Import graph: orphans imports kinds; kinds imports a kind module only through `interface`, and nothing imports orphans, so no cycle.

## Observing Tests

[focused.log](focused.log): `test_orphans` 5 pass. [before.log](before.log): the two new tests fail against the base `orphans.py`, the three existing ones pass.

| Criterion part | Test |
| --- | --- |
| A kind registered only in the registry is reached and excluded | `Registry.test_an_issue_of_any_registered_kind_is_neither_a_candidate_nor_a_destination` |
| orphans imports the registry and no kind module | `Registry.test_orphans_imports_no_kind_module` |
| Hot-fix fixture keeps its outcome | `HotFixes.test_an_open_hot_fix_is_neither_a_candidate_nor_a_destination` |
| Proposal and throwaway outcomes unchanged | `Proposals`, `Throwaways` |

## Kind Search

[kind-search.log](kind-search.log): a case-insensitive search for `hotfix`, `hot-fix`, `F00`, `import` and `kind` over `orphans.py`. The only kind reference is `from kinds import kind_of` and its call; the docstring names the registry, not a kind. No shared rule moved, so no duplicate-function search applies.

## Full Checks

- Planner: 1061 tests, one opt-in live-link skip, [planner.log](planner.log) (includes installed document/model and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_orphans.py -v        # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Current Base

The epic base moved to `1bb44b2bf` (W30 #1672, W18 #1669), merged into the branch at `968c0dd0a8cc298d3b7a94f0034ab04921511ffb`; the catalogue conflict on the `kinds` and `lane` rows kept both units' counts. The same checks at that head:

- Planner: 1069 tests, one opt-in live-link skip ([planner-merged.log](planner-merged.log)).
- Shared: 280 pass ([shared-merged.log](shared-merged.log)).
- Skill checker: 59 files, zero findings ([skill-check-merged.log](skill-check-merged.log)).
- Whitespace: zero findings.
