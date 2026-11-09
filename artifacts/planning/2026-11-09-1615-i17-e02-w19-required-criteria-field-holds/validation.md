# W19 Validation

## Candidate

- Unit: I17:E02:W19, AC26.
- Task base: `d463fc463` (origin/i17/e02/workspace after W17 #1667).
- Task head: `93aadd2eb4c64f638b62d09d08e35d7ffda05e5e`, branch `i17/e02/w19-required-criteria-field-holds`.
- Component: `skills/work-planner/artifacts/epic-issue-body.md`, with its own test in `skills/work-planner/test/test_format.py` and the catalogue count in `skills/work-planner/test/README.md`.

## Clause Placement

Each action clause the [semantic review](../2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and/semantic-review.md) lists for Required Criteria now sits in Validate Epic Body step 4; every outcome is kept.

| Clause | Home |
| --- | --- |
| Declaration file, entry fields, `paths` predicate, declared row | Fields (unchanged) |
| A committed file holds the declaration; working files declare nothing | Fields |
| Missing or empty file, or empty array, declares nothing | Fields |
| Malformed statement: unreadable JSON, non-array, entry lacking a field, bad `paths` | Fields |
| Read at the evaluated commit in the checkout's repository; name path, commit, repository as source | Validate Epic Body step 4 |
| Read changed files as the tracker lists them | Validate Epic Body step 4 |
| Nothing declared brings no finding | Validate Epic Body step 4 |
| No-commit revision or malformed statement is unevaluable, fault named, no epic lacking | Validate Epic Body step 4 |
| Unsupplied changed files leave the criterion unevaluable unless another pull request is known to change a declared path | Validate Epic Body step 4 |

Readers: Validate Epic Body steps 1 and 4 and [Unit Dispatch](https://github.com/m2ux/workflow-server/blob/i17/e02/workspace/skills/work-planner/protocols/unit-dispatch.md) link the field for the declaration only; neither needed a change.

## Observing Tests

- Field-boundary reader `test_the_field_states_the_declaration_and_validation_owns_its_outcomes`: the field (example excluded) carries none of `the check`, `report`, `unevaluable`, `source`, `evaluated`, `resolving to no commit`; step 4 carries each outcome. Against the pre-change guide it fails 13 subtests.
- `test_the_guide_requires_nothing_of_a_project_declaring_nothing` reads the declaring-nothing and malformed-statement bullets.
- Required-criteria fixtures (`DeclarationAtRevision`, `CheckFormat`, `RequiredReach`, `RequiredPaths`): missing, empty, unreadable and malformed declarations keep their outcomes. 37 focused tests pass ([focused.log](focused.log)).

## Full Checks

- Planner: 1046 tests, one opt-in live-link skip, [planner.log](planner.log) (includes document/model and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_format.py -k DeclarationAtRevision -k CheckFormat -k Required -v   # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Limits

The boundary reader pins phrases, not an agent's reading of the prose. `scripts/format.py` is unchanged; its required-criteria behaviour is what the fixtures observe.

## Delivery

- Pull request [#1670](https://github.com/m2ux/workflow-server/pull/1670), merged at `71329c3441369679c6a2a8d89b189f7410c06ee6`.
- Change list: no plan change applied or held. No arising issue.
