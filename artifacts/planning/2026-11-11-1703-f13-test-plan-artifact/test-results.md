# F13 Test Results

Branch `skill/test-plan-artifact` at 5a9ccd2c1, stacked on `skill/proposal-artifact` at 39bb3ee0a, merged in as 5a9ccd2c1. Three commits: 1947cc09c adds the reader module, cbe3b36a5 adds the Test Plan artifact and retires the converter, and ee986a13d makes a tick linked to evidence the one passing rule. Review fixes ba85ac622 reads a section with a second table as unreadable, and 173a069da has Align check each task pull request from its own record. The scratch-copy mutations in T2 and the equivalence run in T4 were made at ee986a13d; the checks, suites and comparison were run again at 5a9ccd2c1.

## T1. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files checked, 0 findings. Every link to Test Plan's fields and its Check Test Plan command resolves, and no link reaches the removed `pull-request-body.md` anchors `#test-plan`, `#repair-test-plan`, `#convert-test-plan` or `#unresolved-evidence`. No file F13 changes links `SKILL.md`, a kind artifact outside the plan hierarchy, or an anchor F12 removes (`board.md#board-selection`, `#selected-kind`, `#find-proposals-board`, `#create-proposals-board`, `proposal.md#proposals-board`). Covers AC1.

## T2. Test Plan Home Document Test

`test_documents.py` `TestPlanHome`, three tests: Test Plan's Fields define Plan Table, Plan Columns, Result Evidence and Passed Plan, each with a statement only it makes; no other skill file heads Test Plan or one of those fields, or restates a statement; and every file naming a test plan outside fenced code links Test Plan, among them pull-request-body, pull-request, delivery-plan, epic, deliver-mode, align-mode and sync-mode. In a scratch copy, unlinking the passed plan in delivery-plan.md's `merge` line fails the third test, and a Plan Columns statement added to pull-request-body.md fails the second. Covers AC1.

## T3. Reader Unit Test

`test_testplan.py`, twelve tests over `testplan.py`: `rows` reads a current plan into Test, Description, Coverage and Pass cells, and gives None for an absent, repeated, renamed, fenced, mis-divided or ragged section, for a section holding a second table and for a checked-list plan; `passed` holds when every check carries a tick linked to web evidence, and not for a bare tick, an empty, Partial, Fail or Not run result, a plan with no check or an unreadable plan; `claims` gives the named, observed and passed criteria, passing a criterion only when every observing check carries a tick linked to web evidence. Covers AC2.

## T4. Reader Equivalence over Current Fixtures

Every body the deliver, sync, align, dispatch and testplan suites pass to the reader was logged from an instrumented scratch copy: 87 distinct bodies, 65 readable and 22 unreadable. For each, the base revision's `sync.plan_rows`, `sync.plan_claims` and `deliver.plan_passed` were compared with `testplan.rows` (Test, Coverage and Pass cells), `testplan.claims` and `testplan.passed`. `rows` and `claims` agree on all 87. `passed` differs on 17, each a plan the base passed on a tick with no evidence link (a bare `✓`, `[x]` or `[X]`), which [One Passing Rule](#t8-one-passing-rule) leaves incomplete by design; it agrees on every other body. The deliver suite (108), sync suite (187) and align suite (13) pass against the shared reader. Covers AC2.

## T5. Align Reports a Checked-List Plan

`test_align.py` `UnreadablePlan`: Check Test Plan (`testplan.py`) on a pull request whose Test Plan is a checked list and Test/Criteria table exits 1 and prints `https://github.com/o/r/pull/950: unreadable test plan`, and Sync's coverage agreement reports `#950: unreadable test plan`; a current plan exits 0 with no output, and a fenced current table is unreadable. `align.py` takes only `repositories` and `references`, and no skill file names Repair Test Plan, Convert Test Plan or `align.py plan`. Covers AC3.

## T6. Section Comparison

`check_skill_files.py --compare 39bb3ee0a HEAD skills/work-planner`: 886 sections at the base, 889 at the head, 25 added, removed or differing. pull-request-body.md's Test Plan is removed, and its table, columns, evidence and completion rule stand as Test Plan's Plan Table, Plan Columns, Result Evidence and Passed Plan; Test Coverage's row-order sentence moves to Plan Table. Repair Test Plan and Convert Test Plan are removed; Workspace moves unchanged to Test Plan, Pull Request Record moves stating it holds one pull request alone in its file, and Unresolved Evidence moves restated against Result Evidence. Template, Review Body, Test Coverage, delivery-plan's Report Lines, epic's Delivery Findings, pull-request's Merge Task Pull Requests and Readiness Evidence, deliver-mode's session, sync-mode's Report and the README tables differ by the link to Test Plan or the test counts; align-mode's Coverage runs Check Test Plan on each task pull request's own record. Covers AC1 and AC3.

## T7. Planner Suite, Shared Suite and Whitespace

At 5a9ccd2c1, the work-planner suite: 1282 tests, OK, 1 skipped. The shared suite (`skills/test`): 336 tests, OK. `git diff --check 39bb3ee0a HEAD`: clean. Covers AC1, AC2 and AC3.

## T8. One Passing Rule

`testplan.ticked` is the one rule, a tick linked to web evidence, and `passed` and `claims` both call it; Passed Plan in test-plan.md states it and links Result Evidence. `test_testplan.py` shows `passed` refuses a bare tick and empty, fragment or file evidence, and that a plan has passed exactly when every criterion its checks observe is claimed as passed. `test_deliver.py`'s plan fixture carries a linked tick, and `test_a_bare_tick_has_not_passed_and_yields_no_merge` shows a bare-tick plan gives `merge: 0` and no merge line. Covers AC2.
