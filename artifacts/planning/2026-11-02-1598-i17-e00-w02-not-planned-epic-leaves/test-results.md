# W02 Test Results

Tested revision: [8c12e7a7b](https://github.com/m2ux/workflow-server/commit/8c12e7a7b80d9adae59ad7a484c2c05590bac5ae) on `i17/e00/w02-not-planned-epic-leaves`, run from the unit worktree under `sbx`.

## T1 Format Check Criterion Labels

- **Command.** `cd skills/work-planner && python3 -m unittest discover -s test -k CriterionLabels`
- **Result.** 5 tests, OK.
- **Observed.** An initiative whose criteria are labelled AC1, AC3, AC4, or AC2, AC3, raises no label finding. A repeated label (AC1, AC2, AC2) and a descending one (AC1, AC3, AC2) are left to decide as `AC labels partly missing or out of sequence`. A reference gap (R1, R3) is still left to decide.
- **Control.** With `scripts/format.py` at the base revision 12cf5b386, the two gap tests fail, so the fixtures observe the change.

## T2 Initiative Body Conditions

- **Command.** `cd skills/work-planner && python3 -m unittest discover -s test -k NotPlannedEpic`
- **Result.** 3 tests, OK.
- **Observed.** The Work Breakdown conditions of `artifacts/initiative-issue-body.md` remove the row of an epic closed as not planned, with each criterion only it covers, keep a criterion another row also covers, and link the label rule in `artifacts/issue-body.md#criterion-labels`. The References conditions require a reference linking the issue that takes the epic's work.

## T3 Search of the Skill's Files

- **Command.** `grep -n "closed as not planned\|not-planned epic's row" skills/work-planner/artifacts/initiative-issue-body.md; grep -n "Criterion Labels" skills/work-planner/artifacts/issue-body.md`
- **Result.** Line 150 (Work Breakdown) and line 182 (References) of the initiative body; line 154 of the issue body. Each rule is stated once, in its owning artifact.
- **Review.** `git diff 12cf5b386 -- skills/work-planner/artifacts/epic-issue-body.md` is empty: the epic body's rule for work another issue takes is unchanged.

## T4 Skill Fixture Suite

- **Command.** `cd skills/work-planner && python3 -m unittest discover -s test`
- **Result.** 798 tests, OK (1 skipped).

## T5 Skill-File Check

- **Command.** `python3 skills/scripts/check_skill_files.py skills/work-planner`
- **Result.** 52 files checked, 0 findings.

## Merged Revision

[#1602](https://github.com/m2ux/workflow-server/pull/1602) merged into `i17/e00/workspace` as [7f74d2d45](https://github.com/m2ux/workflow-server/commit/7f74d2d457aa0251c0a6bfd4bc0cc0b4319e8f2e). `git diff 8c12e7a7b 7f74d2d45` is empty, so each result above holds at the merged revision, and AC4, AC5 and AC6 are ticked on the epic from it.
