# Test Evidence — W37

> Delivery evidence · Branch `i11/e10/w37-exclusions-and-classic-urls-decided` · Head `c1a7a6adb` on epic base `i11/e10/workspace` at `8bddff05a`; the failing-before run is the head's tests against the checker and workflow at `8bddff05a`

T1 and T3 run locally from the unit's worktree under `sbx`; T2 is the Verify Skills workflow on GitHub.

## T1

`ReviewedExclusionAndUrlCases` in `skills/test/test_check_skill_files.py` runs the `skill-files` job step over seeded trees and reads `CLASSIC` directly.

- **Before, at `8bddff05a`.**

  ```text
  FAILED test_a_nested_excluded_skill_is_held_aside        — family/x's finding reported, and 'x:0: excluded skill without a finding'
  FAILED test_a_sibling_sharing_the_excluded_name_is_reported — family/x not held aside beside family/xy
  FAILED test_a_tree_holding_no_skill_passes               — argparse: the following arguments are required: roots (exit 2)
  FAILED test_the_workflow_runs_the_checks_own_suite       — no step runs pytest over skills/test
  SUBFAILED test_a_classic_route_by_absolute_api_url_is_reported — all five: api.github.com repos, projects/1, user/projects, orgs, and /api/v3/projects/columns
  SUBFAILED test_every_classic_mutation_is_reported         — createProject, updateProject, deleteProject, cloneProject, convertProjectCardNoteToIssue, linkRepositoryToProject, unlinkRepositoryFromProject
  16 failed, 10 passed, 203 deselected, 15 subtests passed
  ```

  B1 is the first two, N8 the next two, B2 the last two. `test_a_projects_field_without_arguments_is_reported`, added with the pattern's argumentless-field alternative, fails there too.
- **After, at `c1a7a6adb`.** `218 passed, 36 subtests passed`.
- **Mutants (N1).** Each applied alone to the head's checker and run against the head's suite; every one fails the suite:

  | Mutant | Result |
  | --- | --- |
  | REST gap accepted anywhere on a line | killed |
  | Exclusion matched by name prefix | killed |
  | Lapse finding dropped | killed |
  | Mutation prefix cut to `add\|move` | killed |
  | Held-aside counts emptied | killed |
  | `github.com/` lookbehind removed | killed |
  | API base lookbehinds dropped | killed |
  | Excluded skill named by its last segment | killed |
  | Argumentless `projects` field dropped | killed |
  | Roots required | killed |

## T2

Verify Skills on pull request [#1582](https://github.com/m2ux/workflow-server/pull/1582) at `c1a7a6adb` ([run 41324155096](https://github.com/m2ux/workflow-server/actions/runs/41324155096)): `The shared skill-file check passes its own tests` runs `pytest skills/test` (218 passed, 36 subtests passed) and `Every skill in scope meets the shared skill guidelines` passes, both success.

## T3

- `sbx python3 -m pytest skills/test -q`: 218 passed, 36 subtests passed.
- `sbx python3 -m pytest skills/work-planner/test -q`: 727 passed, 1 skipped, 1843 subtests passed.
- `sbx python3 -m pytest skills/workflow-canon/test -q`: 39 passed, 38 skipped, 21 subtests passed.
- `sbx python3 skills/scripts/check_skill_files.py skills/*/`: 81 files checked, 0 findings.
- The same roots with `--exclude skills/gitnexus/gitnexus-cli` report `gitnexus/gitnexus-cli:0: excluded skill without a finding`, exit 1.
