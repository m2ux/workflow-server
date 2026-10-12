# Test Record

Checks run for W03 and W04, at branch `i11/e12/w03-work-planner-mode-files`, head `4badb9f3`, base `i11/e12/workspace` at `3f9d090b`. Each check runs under `scripts/sbx` from the unit's worktree.

The command move that W02 carries is not in this unit, so a one-caller specification finding is expected throughout. Each run below is read with those findings set aside, and the count of them is stated so the residual is visible.

## T1 Work Planner Files

The shared skill-file check over the Work Planner skill, read for link and section findings.

```text
scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner
28 files checked, 36 findings
```

All 36 are `command specification with one caller`. No link finding and no section finding stands, against five duplicate-anchor findings, two section findings and two layout findings at the base:

- `deliver-mode.md:44 section outside the mode set — Brief` cleared.
- `hoist-mode.md:14 section outside the mode set — Placements` cleared.
- `review-criteria.md:41, :118, :168 duplicate anchor is cited — proposal` cleared.
- `review-criteria.md:146, :172 duplicate anchor is cited — acceptance-criteria` cleared.
- `hoist-mode.md:81 inline bold lead too wide — 113 characters` cleared.
- `standup-mode.md:57 trailing blank line` cleared.

Covers AC4 and AC5. Result ✓.

## T2 Workflow Canon Files

The shared skill-file check over the Workflow Canon skill, read for section findings.

```text
scripts/sbx python3 skills/scripts/check_skill_files.py skills/workflow-canon
29 files checked, 15 findings
```

All 15 are `command specification with one caller`. No section finding stands, against six at the base:

- `audit-mode.md:9 section outside the mode set — Canon Question` cleared.
- `audit-mode.md:35 section outside the mode set — Attribution` cleared.
- `review-mode.md:42, :59, :70, :74 section outside the mode set — Coverage, Branch Coverage, Findings, Verdicts` cleared.

Covers AC7. Result ✓.

## T3 Shared Check Suite

The shared skill-file check's own test suite, which holds the rules T1 and T2 are read through.

```text
scripts/sbx python3 -m unittest discover -s skills/test
Ran 38 tests in 0.011s
OK
```

Result ✓.

## T4 Work Planner Suite

The Work Planner skill's own suite, which reads the skill's mode files and so observes the restructure directly.

```text
scripts/sbx python3 -m unittest discover -s skills/work-planner/test
Ran 294 tests in 12.627s
OK
```

Result ✓.

## Both Skills Together

The run the epic reads, over the two skills at once.

```text
scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon
57 files checked, 51 findings
```

All 51 are `command specification with one caller`. The base reported 66 findings over the same two skills, so the fifteen this unit owns are gone and the fifty-one W02 owns stand.

## Evidence Gap

The Workflow Canon skill's own suite cannot run here. Thirty-five of its 71 tests fail in `AuditFixture.setUp` with `CANON_TEST_ENGINE must name an engine with its installed yaml package`, an environment prerequisite this session does not supply. Those tests exercise the audit scripts, and no test in that suite reads a mode file, so the gap does not bear on this unit's criteria. It is raised as a standalone issue.
