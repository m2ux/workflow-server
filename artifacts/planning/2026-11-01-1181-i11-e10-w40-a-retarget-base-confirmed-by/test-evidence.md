# Test Evidence — W40

> Delivery evidence · Branch `i11/e10/w40-a-retarget-base-confirmed-by` · Head `c35676c1d` on epic base `i11/e10/workspace` at `39a2841e5`; the failing-before run is the head's tests against `sync.py` at `39a2841e5`

## T1

`BranchContract` in `skills/work-planner/test/test_sync.py`, with long-lived branches `main` and `workspace`.

- **Reproduced at `39a2841e5`.** `belongs('i01/e00/w04-tidy-workspace', 'i01/e00/w03-x')` returned `('workspace',)` and `belongs('i01/e00/w04-document-main', 'main')` returned `('main',)`.
- **Before, at `39a2841e5`.**

  ```text
  FAILED BranchContract::test_a_sibling_ending_in_no_long_lived_branch_confirms_no_slug_word
  FAILED BranchContract::test_a_single_branch_slug_ending_in_a_branch_name_names_no_base
  FAILED BranchContract::test_a_single_branch_slug_ending_in_a_branch_name_yields_to_its_target
  3 failed, 12 passed
  ```

- **After, at `c35676c1d`.** All 15 pass. `i01/e00/w04-tidy-workspace` into a stacked branch is reported as targeting one of `i01/e00/main` or `i01/e00/workspace`, and into `main` as targeting `i01/e00/main`; `w01-work-workspace` with its sibling `w01-work-main` still names `i01/e00/workspace`.
- **Mutants.** Accepting a sibling ending in no long-lived branch, counting the branch itself as its sibling, dropping the hyphen guard, and reading the slug word unconditionally are each killed.
- **Handler read.** `sync-mode.md` Target confirms the base the finding names against the work item's Component and retargets to the epic base of the long-lived branch it names, taking a multi-branch unit's base from its last slug word, as `delivery-branches.md` Task Branches states.

## T2

- `sbx python3 -m pytest skills/work-planner/test -q`: 739 passed, 1 skipped, 1845 subtests passed.
- `sbx python3 -m pytest skills/test -q`: 219 passed, 36 subtests passed.
- `sbx python3 -m pytest skills/workflow-canon/test -q`: 39 passed, 38 skipped, 21 subtests passed.
- `sbx python3 skills/scripts/check_skill_files.py skills/*/`: 81 files checked, 0 findings.
- Verify Skills on [#1585](https://github.com/m2ux/workflow-server/pull/1585): pending.
