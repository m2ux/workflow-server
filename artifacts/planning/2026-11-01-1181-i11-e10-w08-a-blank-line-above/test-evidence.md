# Test Evidence — W08

> Delivery evidence · Branch `i11/e10/w08-a-blank-line-above` · Tested revision `e47136976`, which merges `i11/e10/workspace` at `212bedd48`

Every command ran from the unit worktree under the workspace sandbox.

## T1

**Check.** A heading flush beneath a list item, and one flush beneath another heading, are reported.

```bash
python3 -m pytest skills/test/test_check_skill_files.py -q -k HeadingSpacing
```

- At `e47136976`: 4 passed.
- With the rule removed from `check_skill_files.py` and the new tests kept: 2 failed, the two that expect a report, so the suite observes the rule.

## T2

**Check.** A heading on a file's first line, directly after its frontmatter, or inside a fence is not reported.

The same run as T1 covers it: `test_a_heading_opening_the_file_or_its_body_is_left_alone` and `test_a_heading_inside_a_fence_is_left_alone` pass.

## T3

**Check.** The shared skill-file check over every skill reports no heading-spacing finding.

```bash
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop
```

- At the base `ba441c2b8` with the rule applied: one skill-file finding, `work-planner/artifacts/planning-record.md:38`, `## Fields` flush beneath a list item. The check then also read fixture trees, and reported line 5 of each Workflow Canon audit-qualification `produce.md`; the base now leaves fixture trees unread, so the fixture stays as its expected outcomes name it.
- At `e47136976`: 76 files checked, 0 findings.

## T4

**Check.** The shared, Work Planner and Workflow Canon suites pass.

```bash
python3 -m pytest skills/test -q
python3 -m pytest skills/work-planner/test -q
CANON_TEST_ENGINE=<engine-root> python3 -m pytest skills/workflow-canon/test -q
```

- Shared: 88 passed.
- Work Planner: 645 passed, 1 skipped.
- Workflow Canon, with the engine at `.worktrees/engine-pin` (`e889276ae`): 77 passed.
