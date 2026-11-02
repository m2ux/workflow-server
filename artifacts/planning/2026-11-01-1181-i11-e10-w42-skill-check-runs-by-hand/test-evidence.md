# Test Evidence — W42

> Delivery evidence · Branch `i11/e10/w42-skill-check-runs-by-hand` · Head `50db272e5` on epic base `i11/e10/workspace` at `a41d89f80`

## T1

- **No `.github` directory.** `git ls-tree 50db272e5 .github` prints nothing, and `git diff b1eb5351b 50db272e5 -- .github` against `workspace` before E10 merged prints nothing.
- **`workspace` since.** [#1555](https://github.com/m2ux/workflow-server/pull/1555) merged `i11/e10/workspace` into `workspace` at `d7feec2dc`, carrying the workflow, so `git diff origin/workspace -- .github` is empty only once this change reaches `workspace`.
- **No exclusion option.** `check_skill_files.py --help` at `50db272e5` prints:

  ```text
  usage: check_skill_files.py [-h] [--quiet] [--compare BASE HEAD] [roots ...]

  Check a skill's markdown against the shared skill guidelines.

  positional arguments:
    roots                skill folders to check

  options:
    -h, --help           show this help message and exit
    --quiet              print the counts alone
    --compare BASE HEAD  compare section bodies between two revisions
  ```

- `SkillsCheckedTogether::test_the_check_takes_no_exclusion` holds both: `--help` names no `--exclude`, and passing one exits 2.

## T2

- `sbx python3 -m pytest skills/test -q`: 207 passed, 32 subtests passed. The 11 tests running the workflow's steps or exercising exclusion are gone; 3 run the check directly over the seeded tree.
- `sbx python3 -m pytest skills/work-planner/test -q`: 739 passed, 1 skipped, 1845 subtests passed.
- `sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
