# F11 Test Results

Branch `skill/work-priority` at bf7c43fca, stacked on `skill/link-step-references` at 25866131e, merged in as bf7c43fca. T2 and T3 were first run at 803875069 against 7aa5040ab; T1, T2, T4 to T8 were run again at bf7c43fca.

## T1. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 62 files checked, 0 findings at bf7c43fca, none of them a link to the entry point. Every link to Work Priority's four anchors resolves, and no link reaches the retired `board-queue.md#priority-sets` or `dependency-graph.md#epic-priority`. Covers AC1.

## T2. Work Priority Home Document Test

`test_documents.py` `WorkPriorityHome`, three tests: Work Priority holds Priority Label, Priority Sets, Epic Priority and Execution Order as Fields; no other skill file heads or restates any of them; and every file naming one, outside the entry point's mode list, links Work Priority. Removing the Priority Label link from plan-change.md fails the third test. Covers AC1.

## T3. Section Comparison

`check_skill_files.py --compare 7aa5040ab HEAD skills/work-planner`: Priority Sets and Epic Priority report as moved into work-priority.md with their conditions kept; the other differing sections differ only by the retargeted links. Covers AC1.

## T4. Priority Unit Tests

`test_priority.py`, 12 tests: label form, larger-of-two, unranked; `label()` round-trips through `rank()` and refuses non-positive or non-integer values; `execution_key()` orders by initiative rank, initiative order, epic rank and epic order, with unranked or absent issues after ranked ones. Covers AC2 and AC3.

## T5. Ordering Equivalence

`test_deliver.py` (107), `test_dispatch.py` (34) and `test_progress.py` (79) pass with no ordering expectation changed; their single-home tests assert `deliver.execution_key` and `progress.execution_key` are `priority.execution_key`. A scratch check compared the pre-change `ordered_epics` and Next sort keys with `execution_key` over 20,000 random boards: identical orders in every case. Covers AC2. T7 records the standup's move to Execution Order, which changes its order where equally ranked initiatives meet.

## T6. Hot-Fix Label

`test_hotfix.py`, 26 tests: a hot-fix's labels equal `[priority.label(10)]`, and `hotfix._label` is `priority.label`. Covers AC3.

## T7. Standup Next in Execution Order

`test_progress.py` (80) `test_equally_ranked_initiatives_keep_their_epics_grouped_in_issue_order`: two initiatives at priority 3 list I01:E01, I01:E00, then I02:E00, although I02:E00 carries the highest epic label. It fails on the progress.py of 564346688. progress.py passes Execution Order's initiative tie-break, as deliver.py does, and an item with no epic groups with its initiative prefix; no existing expectation changed. standup-report.md links Execution Order for its Next order. Covers AC2.

## T8. Planner Suite, Shared Suite and Whitespace

At bf7c43fca, the work-planner suite: 1254 tests, OK, 1 skipped. The shared suite (`skills/test`): 336 tests, OK. `git diff --check` over 25866131e..bf7c43fca: clean.
