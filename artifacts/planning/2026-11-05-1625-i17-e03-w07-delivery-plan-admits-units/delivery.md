# Delivery Evidence

## Execution Checklist

- [x] Confirm live W07+W08 reservations and start the unit session.
- [x] Match AC2 and AC5 to artifact inspection and CLI fixtures.
- [x] Implement and commit component groups.
- [x] Verify focused cases, complete suites and skill files at the tested head.
- [x] Publish task PR, record its links and merge verified work.
- [x] Verify merged revision, criteria, Done cells and draft integration.
- [x] Publish final evidence and change list.

## T1: Delivery Plan

AC2 is observed by reading the committed Delivery Plan artifact: request-lane admission, absent-lane admission, task-table source, unit-line lane and unchanged priority ordering.

## T2: Available Work

AC5 is observed by test_deliver.py fixtures executing the real survey over lanes 1 and 2 and unlaned rows, joined units and laned rows with no work-item link. Malformed and split units receive diagnostics; holds, blockers and merge evidence remain visible.

## T3: Combined Validation

Run the complete planner suite, shared checker suite and skill-file check. Record exact tested revision and pass/skip counts separately.

## Tested Revision

The published task head is `2468d37694e795786305d7657afb71ffb29ddf2e`, rooted at epic-base `dffa25a9b1cf35225e5b83a83e9b2e7a8f1204c2`. W07 is committed separately at `5d0f50180`; the script, observing fixtures and invalid-report contract are the following commit.

## Observations

**T1 pass — AC2.** Read the committed Delivery Plan: Lane Admission reads the task-table cells, admits requested-index and unlaned units, admits only unlaned units when omitted, retains priority, and names the lane in each unit line. Inputs and command usage expose the optional request; hot-fixes are unlaned. Its direct links and prerequisites pass all 11 document-interface tests.

**T2 pass — AC5.** The real delivery CLI passes all 96 delivery tests, including 10 LaneAdmission cases. Lanes 1 and 2 admit only matching and unlaned rows in existing order; absence offers only unlaned. A table lane applies to linked work-item and unplanned rows, and the same opaque spelling works across epics while `02` differs from `2`. Equal-lane/all-empty joined units pass. Mixed or different joined lanes and malformed raw links, code spans and prose fail without becoming unlaned. Each malformed joined unit is counted once, with row-specific findings. Other lanes' holds, blockers, unresolved dependencies and passing merge candidates remain visible. Hot-fixes are unlaned; invalid CLI indices are refused.

**T3 pass.** The complete planner suite ran 882 tests: 881 passed and one opt-in live Development-link test was skipped because WORK_PLANNER_LIVE_LINK was not supplied. The shared checker suite passed 208 tests. Check Skill Files checked 52 files with zero findings. git diff --check passed. The 21 combined lane-admission and document-interface tests pass again in a detached checkout at the literal tested head; criterion-tests.log records its SHA and output.

Commands use this task checkout's scripts and templates through the absolute approved sbx launcher:

```text
python3 -m unittest discover -s skills/work-planner/test -q
python3 -m unittest discover -s skills/test -q
python3 skills/scripts/check_skill_files.py skills/work-planner
python3 skills/work-planner/scripts/revision-check.py --project <project> --revision 2468d37694e795786305d7657afb71ffb29ddf2e -- <sbx> env PYTHONPATH=skills/work-planner/test python3 -m unittest test_deliver.LaneAdmission test_documents -q
```

No new debt or arising issue was found. The unsupported cross-epic Joins recursion remains the separately planned W14 work; this unit does not claim its repair.

## Merge and Live Readback

- Task PR [#1632](https://github.com/m2ux/workflow-server/pull/1632) merged into i17/e03/workspace at `6cc09a5c65de546fc4f10ba6692478b66b157dfb`, preserving tested head `2468d37694e795786305d7657afb71ffb29ddf2e`. The merge tree is identical to the tested head.
- The 21 criterion and document-interface tests passed again in a detached checkout at the literal merge revision. merged-criterion-tests.log retains the exact result.
- Fresh target requirements show branch protection absent and active rules empty. The tested head has no configured check runs or status contexts and no required reviews. Its PR remained clean and mergeable at the same head, and the published local test plan passed before the SHA-pinned merge.
- The live epic and canonical body agree. AC2 and AC5 are ticked; W07 and W08 link the merged PR and carry Done ticks. W10's independently reserved folder is preserved. The retired historical W01/AC1 coverage disagreement remains documented.
- Draft integration #1627 is at the merge revision and describes/cites #1626, #1628, #1629 and #1632. It remains draft while E03 has further work. The exact item readback confirms In Progress.
- No plan change or arising issue is applied by this unit. The outer automatic coordinator owns subsequent refresh and dispatch.
