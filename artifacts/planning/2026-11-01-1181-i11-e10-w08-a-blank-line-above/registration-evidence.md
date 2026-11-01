# Registration Evidence — W08

> Delivery evidence · Branch `i11/e10/w08-a-blank-line-above` · Tested revision `d19ad74dc`, which merges `i11/e10/workspace` at `1be5f67a5`

The epic base registers every finding kind in `KINDS` and maps each guide rule to the kinds that decide it in `rules.json`. The base now registers the heading-spacing kind, so this change states the rule that kind decides in the shared guidelines' Layout and maps it. Every command ran from the unit worktree under the workspace sandbox.

## T1

**Check.** Every kind the check reports is registered, and the heading-spacing rule reports through it.

```bash
python3 -m pytest skills/test/test_check_skill_files.py -q -k "HeadingSpacing or registered"
```

- At `8b35508fd`, before either kind was registered: the two flush-heading tests and `test_every_kind_the_source_reports_is_registered` failed with `KeyError`.
- At `d19ad74dc`: 6 passed.

## T2

**Check.** The shared suite passes.

```bash
python3 -m pytest skills/test -q
```

- At `d19ad74dc`: 172 passed.

## T3

**Check.** The skill-file check over every skill, and the Work Planner and Workflow Canon suites, pass.

```bash
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop
python3 -m pytest skills/work-planner/test -q
CANON_TEST_ENGINE=<engine-root> python3 -m pytest skills/workflow-canon/test -q
```

- Skill-file check: 81 files checked, 0 findings, so the Heading spacing rule reaches its operation.
- Work Planner: 690 passed, 1 skipped.
- Workflow Canon, with the engine at `.worktrees/engine-pin` (`e889276ae`): 77 passed.
