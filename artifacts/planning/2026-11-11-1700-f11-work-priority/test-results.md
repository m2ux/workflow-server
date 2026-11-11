# F11 Test Results

Branch `skill/work-priority` at 564346688, stacked on `skill/link-step-references` at 7aa5040ab.

## T1. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 62 files checked, 0 findings. Every link to Work Priority's four anchors resolves, and no link reaches the retired `board-queue.md#priority-sets` or `dependency-graph.md#epic-priority`. Covers AC1.

## T2. Work Priority Home Document Test

`test_documents.py` `WorkPriorityHome`, three tests: Work Priority holds Priority Label, Priority Sets, Epic Priority and Execution Order as Fields; no other skill file heads or restates any of them; and every file naming one, outside the entry point's mode list, links Work Priority. Removing the Priority Label link from plan-change.md fails the third test. Covers AC1.

## T3. Section Comparison

`check_skill_files.py --compare 7aa5040ab HEAD skills/work-planner`: Priority Sets and Epic Priority report as moved into work-priority.md with their conditions kept; the other differing sections differ only by the retargeted links. Covers AC1.

## T4. Priority Unit Tests

`test_priority.py`, 12 tests: label form, larger-of-two, unranked; `label()` round-trips through `rank()` and refuses non-positive or non-integer values; `execution_key()` orders by initiative rank, initiative order, epic rank and epic order, with unranked or absent issues after ranked ones. Covers AC2 and AC3.

## T5. Ordering Equivalence

`test_deliver.py` (107), `test_dispatch.py` (34) and `test_progress.py` (79) pass with no ordering expectation changed; their single-home tests assert `deliver.execution_key` and `progress.execution_key` are `priority.execution_key`. A scratch check compared the pre-change `ordered_epics` and Next sort keys with `execution_key` over 20,000 random boards: identical orders in every case. Covers AC2.

## T6. Hot-Fix Label

`test_hotfix.py`, 26 tests: a hot-fix's labels equal `[priority.label(10)]`, and `hotfix._label` is `priority.label`. Covers AC3.

## T7. Planner Suite, Shared Suite and Whitespace

The work-planner suite: 1253 tests, OK, 1 skipped. The shared suite (`skills/test`): 331 tests, OK. `git diff --check`: clean.
