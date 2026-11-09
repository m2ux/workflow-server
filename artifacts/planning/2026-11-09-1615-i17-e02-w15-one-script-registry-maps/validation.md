# W15+W16 Validation

## Candidate

- Unit: I17:E02:W15+W16, AC22 and AC23.
- Task base: `d463fc463` (origin/i17/e02/workspace after W17 #1667).
- Task head: `cdc3c06c79e62c56715415c0bb827165e30b1437`, branch `i17/e02/w15-one-script-registry-maps`.
- Components: `skills/work-planner/scripts/kinds.py` (W15), `skills/work-planner/scripts/hotfix.py` (W16).

## Registry Tests

AC22. [test_kinds](https://github.com/m2ux/workflow-server/blob/i17/e02/w15-one-script-registry-maps/skills/work-planner/test/test_kinds.py) `Registry` and `Lookup` pass ([focused.log](focused.log)):

- `KINDS` maps `hot-fix` to the `hotfix` module in the scripts folder, and `interface` returns that module; a name the registry does not hold raises KeyError.
- `kind_of` selects `hot-fix` for an issue or pull request titled `[F04] ...`.
- Initiative, epic, task and standalone titles, an untitled item and a `type:hot-fix` label without the prefix select no kind.
- Unknown prefixes select no kind: `[X01]`, `[F4]`, `[f04]`, `[F004]`, a mid-title tag and a leading space.

## Substitution Tests

AC23. [test_kinds](https://github.com/m2ux/workflow-server/blob/i17/e02/w15-one-script-registry-maps/skills/work-planner/test/test_kinds.py) `Substitution` and [test_hotfix](https://github.com/m2ux/workflow-server/blob/i17/e02/w15-one-script-registry-maps/skills/work-planner/test/test_hotfix.py) `ThroughTheRegistry` pass ([focused.log](focused.log)):

- Every registered module supplies each operation the `Kind` interface declares (`tag`, `faults`, `target`, `board_status`, `linking_pulls`, `delivery_fault`, `delivering_pulls`, `unit_state`) with the interface's exact signature: parameter names, order, annotations and result type.
- A stand-in module registered beside the hot-fix module is selected by its own tag and reached through `interface`; the hot-fix item still selects `hot-fix`, and the stand-in leaves with its registration.
- The hot-fix module answers items of every kind (hot-fix, initiative, standalone, untitled with no body) with the contract's result types and values; it narrows no input.
- `hotfix.OFF_BOARD` and `hotfix.Key` are the registry's own objects.
- Through `interface('hot-fix')`, each operation returns what the direct hot-fix tests expect: tag, target, faults, In Review and off-board status, linking and delivering pull requests, delivery fault, unrecorded and unit state.

## Full Checks

- Planner: 1058 tests, one opt-in live-link skip, [planner.log](planner.log) (includes installed document/model and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_kinds.py -v          # skills/work-planner
python3 -m unittest discover -s test -p test_hotfix.py -v         # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Limits

General scripts still import hot-fix names directly; rows W24–W31 and W46 move each to the registry, and W50 removes the names left without a caller.
