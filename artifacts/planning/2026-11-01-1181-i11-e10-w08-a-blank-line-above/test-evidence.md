# Test Evidence — W08

> Delivery evidence · Branch `i11/e10/w08-a-blank-line-above` · Tested revision `a52d1cabe`, which merges `i11/e10/workspace` at `41537ea98`

Every command ran from the unit worktree under the workspace sandbox.

## T1

**Check.** A heading flush beneath a list item, and one flush beneath another heading, are reported.

```bash
python3 -m pytest skills/test/test_check_skill_files.py -q -k HeadingSpacing
```

- At `a52d1cabe`: 4 passed.
- With the rule removed from `check_skill_files.py` and the new tests kept: 2 failed, the two that expect a report, so the suite observes the rule.

## T2

**Check.** A heading on a file's first line, directly after its frontmatter, or inside a fence is not reported.

The same run as T1 covers it: `test_a_heading_opening_the_file_or_its_body_is_left_alone` and `test_a_heading_inside_a_fence_is_left_alone` pass.

## T3

**Check.** The shared skill-file check over every skill reports no heading-spacing finding.

```bash
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop
```

- At the base `ba441c2b8` with the rule applied: three findings, at `work-planner/artifacts/planning-record.md:38` and at line 5 of each audit-qualification `produce.md`.
- At `a52d1cabe`: 86 files checked, 6 findings, none of them heading spacing. All six stand in `gitnexus/gitnexus-cli/SKILL.md` and belong to W11 and W13.

## T4

**Check.** The shared, Work Planner and Workflow Canon suites pass, and the audit-qualification guard accepts both cases.

```bash
python3 -m pytest skills/test -q
python3 -m pytest skills/work-planner/test -q
CANON_TEST_ENGINE=<engine-root> python3 -m pytest skills/workflow-canon/test -q
python3 skills/workflow-canon/test/fixtures/audit-qualification/check.py skills/workflow-canon/test/fixtures/audit-qualification/<case> <engine-root>
```

- Shared: 80 passed.
- Work Planner: 620 passed, 1 skipped.
- Workflow Canon, with the engine at `.worktrees/engine-pin` (`e889276ae`): 77 passed.
- Guard: `errors: []` and 4 criteria for `clean` and for `seeded`.
- The expected outcomes Q01, Q02 and Q06 resolve through the inventory's `markdown_nodes` to the lines they name: `/protocol/line-9`, `/rules/line-12/clause-2` and `/rules/line-13`.
