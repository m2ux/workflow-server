# Test Evidence — W41

> Delivery evidence · Branch `i11/e10/w41-out-of-scope-skills-restored` · Head `ddfc612f2` on epic base `i11/e10/workspace` at `8ce70c284`, against `workspace` at `b1eb5351b`

## T1

- **Empty diff.** `git diff origin/workspace -- skills/gitnexus skills/workflow-canon skills/server-in-the-loop` at `ddfc612f2` prints nothing.
- **Findings per skill.** `check_skill_files.py skills/*/` with no exclusion: 75 files checked, 68 findings, every one under the three skills. Each of the eight excluded skill folders holds at least one, so none lapses.
- **Verify Skills** on [#1587](https://github.com/m2ux/workflow-server/pull/1587) at `ddfc612f2` ([run 41384695985](https://github.com/m2ux/workflow-server/actions/runs/41384695985)): both jobs succeed. The skill-files job prints:

  ```text
  gitnexus/gitnexus-cli excluded, 9 findings held aside
  gitnexus/gitnexus-debugging excluded, 6 findings held aside
  gitnexus/gitnexus-exploring excluded, 6 findings held aside
  gitnexus/gitnexus-guide excluded, 6 findings held aside
  gitnexus/gitnexus-impact-analysis excluded, 7 findings held aside
  gitnexus/gitnexus-refactoring excluded, 6 findings held aside
  server-in-the-loop excluded, 8 findings held aside
  workflow-canon excluded, 20 findings held aside
  75 files checked, 0 findings
  ```

## T2

- `sbx python3 -m pytest skills/test -q`: 215 passed, 32 subtests passed. Before the suite change, at `fb607966d`, 4 failed: the two `CanonConventionsReach` tests reading Canon's tree and `CanonRunProjectCheck::test_workflow_canon_holds_it_once_with_its_one_caller`.
- `sbx python3 -m pytest skills/work-planner/test -q`: 739 passed, 1 skipped, 1845 subtests passed.
- `skills/workflow-canon/test` is out of scope and runs as `workspace` holds it: 38 of its tests fail where `CANON_TEST_ENGINE` is unset, as on `workspace`.
