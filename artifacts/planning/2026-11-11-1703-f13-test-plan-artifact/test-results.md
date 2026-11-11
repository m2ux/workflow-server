# F13 Test Results

Branch `skill/test-plan-artifact` at cbe3b36a5, stacked on `skill/proposal-artifact` at 96f49ea10. Two commits: 1947cc09c adds the reader module, cbe3b36a5 adds the Test Plan artifact and retires the converter.

## T1. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 64 files checked, 0 findings. Every link to Test Plan's fields and its Check Test Plan command resolves, and no link reaches the removed `pull-request-body.md` anchors `#test-plan`, `#repair-test-plan`, `#convert-test-plan` or `#unresolved-evidence`. Covers AC1.

## T2. Test Plan Home Document Test

`test_documents.py` `TestPlanHome`, three tests: Test Plan's Fields define Plan Table, Plan Columns, Result Evidence and Passed Plan, each with a statement only it makes; no other skill file heads Test Plan or one of those fields, or restates a statement; and every file naming a test plan outside fenced code links Test Plan, among them pull-request-body, pull-request, delivery-plan, epic, deliver-mode, align-mode and sync-mode. In a scratch copy, unlinking the passed plan in delivery-plan.md's `merge` line fails the third test, and a Plan Columns statement added to pull-request-body.md fails the second. Covers AC1.

## T3. Reader Unit Test

`test_testplan.py`, eleven tests over `testplan.py`: `rows` reads a current plan into Test, Description, Coverage and Pass cells, and gives None for an absent, repeated, renamed, fenced, mis-divided or ragged section and for a checked-list plan; `passed` holds when every check carries a tick, plain or linked, and not for an empty, Partial, Fail or Not run result, a plan with no check or an unreadable plan; `claims` gives the named, observed and passed criteria, passing a criterion only when every observing check carries a tick linked to web evidence. Covers AC2.

## T4. Reader Equivalence over Current Fixtures

Every body the deliver, sync, align, dispatch and testplan suites pass to the reader was logged from an instrumented scratch copy: 87 distinct bodies, 65 readable and 22 unreadable. For each, the base revision's `sync.plan_rows`, `sync.plan_claims` and `deliver.plan_passed` were compared with `testplan.rows` (Test, Coverage and Pass cells), `testplan.claims` and `testplan.passed`: 0 differ, 26 bodies passed under both. The deliver suite (107), sync suite (187) and align suite (13) pass against the shared reader. Covers AC2.

## T5. Align Reports a Checked-List Plan

`test_align.py` `UnreadablePlan`: Check Test Plan (`testplan.py`) on a pull request whose Test Plan is a checked list and Test/Criteria table exits 1 and prints `https://github.com/o/r/pull/950: unreadable test plan`, and Sync's coverage agreement reports `#950: unreadable test plan`; a current plan exits 0 with no output, and a fenced current table is unreadable. `align.py` takes only `repositories` and `references`, and no skill file names Repair Test Plan, Convert Test Plan or `align.py plan`. Covers AC3.

## T6. Section Comparison

`check_skill_files.py --compare 96f49ea10 HEAD skills/work-planner`: 887 sections at the base, 890 at the head, 24 added, removed or differing. pull-request-body.md's Test Plan is removed, and its table, columns, evidence and completion rule stand as Test Plan's Plan Table, Plan Columns, Result Evidence and Passed Plan; Test Coverage's row-order sentence moves to Plan Table. Repair Test Plan and Convert Test Plan are removed; Pull Request Record and Workspace move unchanged to Test Plan, and Unresolved Evidence moves restated against Result Evidence. Template, Review Body, Test Coverage, delivery-plan's Report Lines, epic's Delivery Findings, pull-request's Merge Task Pull Requests and Readiness Evidence, deliver-mode's session, sync-mode's Report and the README tables differ by the link to Test Plan or the test counts; align-mode's Coverage runs Check Test Plan. Covers AC1 and AC3.

## T7. Planner Suite, Shared Suite and Whitespace

The work-planner suite: 1274 tests, OK, 1 skipped. The shared suite (`skills/test`): 331 tests, OK. `git diff --check`: clean. Covers AC1, AC2 and AC3.
