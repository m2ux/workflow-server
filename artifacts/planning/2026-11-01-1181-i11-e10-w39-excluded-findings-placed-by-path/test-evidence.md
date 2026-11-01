# Test Evidence — W39

> Delivery evidence · Branch `i11/e10/w39-excluded-findings-placed-by-path` · Head `7a838f88e`, which merges epic base `i11/e10/workspace` after W38 (`c05c679d3`) into `92ed689d2`; the failing-before run is the head's test against the checker at `4f72ac1b9`

## T1

`ExclusionsPlacedByPath.test_a_like_named_file_under_another_parent_is_reported` checks roots `one/x` and `two/x`, each with a heading jump, excluding `one/x`.

- **Before, at `4f72ac1b9`.**

  ```text
  - (0, 'x excluded, 2 findings held aside\n2 files checked, 0 findings\n')
  + (1, 'x/SKILL.md:5: heading jump — h1 to h4\nx excluded, 1 findings held aside\n2 files checked, 1 findings\n')
  1 failed
  ```

  `two/x`'s finding was held aside under `one/x`, and the run passed.
- **After, at `92ed689d2` and at `7a838f88e`.** The test passes; `two/x`'s finding is reported and the run fails.

## T2

- `sbx python3 -m pytest skills/test -q`: 219 passed, 36 subtests passed.
- `sbx python3 -m pytest skills/work-planner/test -q`: 735 passed, 1 skipped, 1845 subtests passed (at `7a838f88e`).
- `sbx python3 -m pytest skills/workflow-canon/test -q`: 39 passed, 38 skipped, 21 subtests passed.
- `sbx python3 skills/scripts/check_skill_files.py skills/*/`: 81 files checked, 0 findings; with `--exclude skills/gitnexus/gitnexus-cli/` it reports `gitnexus/gitnexus-cli:0: excluded skill without a finding`.
- Verify Skills on [#1584](https://github.com/m2ux/workflow-server/pull/1584): at `92ed689d2` ([run 41324597565](https://github.com/m2ux/workflow-server/actions/runs/41324597565)) and at `7a838f88e` ([run 41324735748](https://github.com/m2ux/workflow-server/actions/runs/41324735748)), both jobs succeed.
