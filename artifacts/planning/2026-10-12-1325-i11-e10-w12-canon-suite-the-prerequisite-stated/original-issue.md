# Original Issue

> Canon Suite: The Prerequisite Stated and Skipped · issue #1325 · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W12] Canon Suite: The Prerequisite Stated and Skipped` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The Workflow Canon skill's own test suite needs an engine checkout its fixtures never name a way to reach, so a session that does not already hold one cannot run 35 of its 71 tests. The suite should state where that engine comes from, or stand up its own, so a contributor can run the skill's tests from a fresh checkout.

## Problem

- **Half the suite fails on a missing environment variable.**
  [`AuditFixture.setUp`](https://github.com/m2ux/workflow-server/blob/9ed47b0d/skills/workflow-canon/test/audit_fixtures.py#L22-L25) fails the test outright when `CANON_TEST_ENGINE` is unset: `CANON_TEST_ENGINE must name an engine with its installed yaml package`. 35 of the suite's 71 tests fail that way in a session that has not set it.
- **Nothing states what the variable should name.**
  The message asks for "an engine with its installed yaml package". Neither the [skill's guidelines](https://github.com/m2ux/workflow-server/blob/9ed47b0d/skills/workflow-canon/references/guidelines.md) nor its [SKILL.md](https://github.com/m2ux/workflow-server/blob/9ed47b0d/skills/workflow-canon/SKILL.md) Dependencies say which checkout satisfies it or how to prepare one.
- **A failure reads as a regression.**
  The failures surface as 35 red tests rather than as skips, so a contributor running the suite after an unrelated change cannot tell an environment gap from a break they caused.

## Proposal

- **The suite states its prerequisite.**
  The skill's Dependencies name `CANON_TEST_ENGINE`, what it must point at, and how to prepare that checkout, so the prerequisite is readable before the suite is run.
- **An unmet prerequisite skips rather than fails.**
  `AuditFixture.setUp` raises `unittest.SkipTest` when the variable is unset, so an unprepared environment reports an unrun check rather than a defect.

## Acceptance Criteria

- [ ] **AC1.** The Workflow Canon suite reports no failure attributable to an unset `CANON_TEST_ENGINE`, as a run of that suite in an environment that does not set it shows.
- [ ] **AC2.** The prerequisite `CANON_TEST_ENGINE` names, and how to prepare it, is stated in the skill's Dependencies, as the shared skill-file check and a reading of that section show.

## References

- **R1.** [Test record for the mode-file restructure](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-12-1319-i11-e12-w03-work-planner-mode-files/tests.md) — the run that observed the gap, under Evidence Gap.


