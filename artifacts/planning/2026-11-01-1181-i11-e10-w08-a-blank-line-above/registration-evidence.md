# Registration Evidence — W08

> Delivery evidence · Branch `i11/e10/w08-a-blank-line-above` · Tested revision `ea5d9f076`, on `i11/e10/workspace` at `8b35508fd`

The epic base registers every finding kind in `KINDS` and maps each guide rule to the kinds that decide it in `rules.json`. At `8b35508fd` two kinds were unregistered, so a finding of either raised `KeyError`: `heading without a blank line above` (W08) and `command specification nothing cites` (W20). The shared suite failed 18 tests there. Every command ran from the unit worktree under the workspace sandbox.

## T1

**Check.** Every kind the check reports is registered, and the heading-spacing rule reports through it.

```bash
python3 -m pytest skills/test/test_check_skill_files.py -q -k "HeadingSpacing or registered"
```

- At `8b35508fd`: the two flush-heading tests and `test_every_kind_the_source_reports_is_registered` failed.
- At `ea5d9f076`: 6 passed.

## T2

**Check.** The shared suite passes, the interface specimens included.

```bash
python3 -m pytest skills/test -q
```

- At `8b35508fd`: 18 failed, 142 passed. Fifteen raised `KeyError` on the W20 kind; once it was registered, four interface tests still failed because their specimen specification had no procedure citing it.
- At `ea5d9f076`: 160 passed.

## T3

**Check.** The skill-file check over every skill, and the Work Planner and Workflow Canon suites, pass.

```bash
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop
python3 -m pytest skills/work-planner/test -q
CANON_TEST_ENGINE=<engine-root> python3 -m pytest skills/workflow-canon/test -q
```

- Skill-file check: 82 files checked, 0 findings, so the new Heading spacing rule in `skills/guidelines.md` reaches its operation.
- Work Planner: 690 passed, 1 skipped.
- Workflow Canon, with the engine at `.worktrees/engine-pin` (`e889276ae`): 77 passed.
