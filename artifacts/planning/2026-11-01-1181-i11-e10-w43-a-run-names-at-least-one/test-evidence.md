# Test Evidence — W43

> Delivery evidence · Branch `i11/e10/w43-a-run-names-at-least-one` · Head `363cd3653` on epic base `i11/e10/workspace` at `6b7afb230`

## T1

- **Before, at `6b7afb230`.** `sbx python3 skills/scripts/check_skill_files.py` prints `0 files checked, 0 findings` and exits 0. `SkillsCheckedTogether::test_a_run_names_at_least_one_skill`, added over that tree's check, fails all three subtests: `[]`, `['--quiet']` and `['--compare', 'HEAD', 'HEAD']` each return rather than exit 2.
- **After, at `363cd3653`.** The same run prints the usage and `error: the following arguments are required: roots`, and exits 2. The test passes.

## T2

- `sbx python3 -m pytest skills/test -q`: 208 passed, 35 subtests passed.
- `sbx python3 -m pytest skills/work-planner/test -q`: 739 passed, 1 skipped, 1845 subtests passed.
- `sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
