# W36 Test Evidence

Head `cf74236c9` of `i11/e10/w36-delivery-scripts-decide-every-reviewed`, with `origin/i11/e10/workspace` at `d72380f8a` merged in.

## T1

Each review case, as a test added at `ba685e7ed` with the fixes absent. Every one failed there ([failing-before-ba685e7ed.txt](failing-before-ba685e7ed.txt)) and passes at the head.

| Finding | Case | Test |
| --- | --- | --- |
| 7 | Names that are not paths | `test_sync.py::ReviewChanges::test_a_dotted_name_no_file_at_the_head_carries_is_not_measured`, `::test_a_component_names_its_path_on_the_branch_the_review_fronts` |
| 8 | A lone row over the bound | `test_deps.py::UnitAccounting::test_a_lone_row_over_the_bound_joins_nothing` |
| 9 | A stacked-branch merge | `test_deliver.py::ProducerOutputs::test_a_merge_into_a_task_branch_names_no_long_lived_branch` (both subtests; the consumer's own task branch read as available before) |
| 11 | An epic-naming task title, a near-miss prefix | `test_sync.py::EpiclessTitles::test_the_epic_sync_reports_them`, `::test_the_initiative_sync_reports_them` |
| 12 | A links file from another repository | `test_closure.py::Closure::test_a_snapshot_of_another_repository_blocks`, `test_closure_sweep.py::Sweep::test_a_snapshot_of_another_repository_blocks_the_sweep` |

Finding 9's linked-commit reading gains `test_deliver.py::ProducerOutputs::test_a_linked_commit_is_read_against_each_consumer_base`, which passes at `ba685e7ed` too: it is coverage the review found missing, and it fails when that reading is replaced with no bases.

## T2

Sync mode's step 6 names a handler for every line the epic sync prints apart from its results (linked, ticked, done, cleared): Normalized, Retitle, Conflict, Unmatched, In flight, Draft, Unmerged, Target, References, Changes, No epic, Uncited, Note, Unplaced, Open questions, Ready to verify, Unmet, Ticked early, Disagreement, Unevaluable, Source, Not checked. Unevaluable fetches each unread draft base or review head and repeats.

## T3

```text
sbx python3 -m pytest skills/work-planner/test -q     727 passed, 1 skipped, 1843 subtests passed
sbx python3 -m pytest skills/test -q                  209 passed, 9 subtests passed
sbx python3 -m pytest skills/workflow-canon/test -q   39 passed, 38 skipped, 21 subtests passed
sbx python3 skills/scripts/check_skill_files.py skills  82 files checked, 0 findings
```
