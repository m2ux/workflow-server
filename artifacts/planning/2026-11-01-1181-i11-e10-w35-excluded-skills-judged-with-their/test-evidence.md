# Test Evidence — W35

> Delivery evidence · Branch `i11/e10/w35-excluded-skills-judged-with-their` · Head `21de11811`, on epic base `i11/e10/workspace` at `ba685e7ed`

T1 and T2 run locally from the unit's worktree under `sbx`; T3 is the Verify Skills workflow on GitHub.

## T1

`SkillCheckWorkflow` in `skills/test/test_check_skill_files.py` loads `.github/workflows/verify-skills.yml` and runs every `run` step of every job under `bash --noprofile --norc -eo pipefail`, with the workflow's `env` and a chosen `EXCLUDED`, over a seeded `skills/` tree. Skill `alpha` holds a command specification that only skill `beta`'s prose cites, so `alpha` judged alone reports `command specification nothing cites`.

- **Before, with the test against the workflow and check at `ba685e7ed`.**

  ```text
  FAILED SkillCheckWorkflow::test_an_exclusion_only_isolation_supports_fails — True is not false
  FAILED SkillCheckWorkflow::test_every_skill_excluded_passes — False is not true
  2 failed, 4 passed, 186 deselected
  ```

  The first is the finding's isolation half: excluding `alpha` passes though its only finding comes from isolation. The second is its empty-roots half: with every skill excluded the in-scope step exits 2.
- **After, at `21de11811`.**
  `6 passed, 186 deselected`. Cases: the seeded tree reports nothing judged whole; an exclusion only isolation supports fails and names `alpha` (AC51); an excluded skill with a real finding passes; every skill excluded passes (AC51); an in-scope finding fails; an exclusion naming no skill fails.

## T2

- `sbx python3 -m pytest skills/test -q`: 192 passed, 7 subtests passed.
- `sbx python3 -m pytest skills/work-planner/test -q`: 720 passed, 1 skipped, 1835 subtests passed.
- `sbx python3 -m pytest skills/workflow-canon/test -q`: 39 passed, 38 skipped, 21 subtests passed.
- `sbx python3 skills/scripts/check_skill_files.py skills/gitnexus/ skills/server-in-the-loop/ skills/work-planner/ skills/workflow-canon/`: 81 files checked, 0 findings.
- The same roots with `--exclude skills/gitnexus --exclude skills/nonesuch` report `excluded skill without a finding` for each, exit 1.

## T3

The Verify Skills workflow on pull request [#1580](https://github.com/m2ux/workflow-server/pull/1580) at `21de11811`, with `EXCLUDED` empty: the single job runs the check over every skill folder and passes.
