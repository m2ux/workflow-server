# Change List

## Files

| File | Change |
| --- | --- |
| `skills/work-planner/scripts/board-queue.py` | Readies only labelled epics. Prints a `rank` line for each initiative's open, unlabelled epics that are not handed off. Docstring restated. |
| `skills/work-planner/artifacts/board-queue.md` | Epic Status: an unlabelled epic is never Ready. `rank` added to Report Lines, Completeness and Compute Board Queue. |
| `skills/work-planner/modes/advance-mode.md` | Report step and the Epics Follow the Initiative outcome name the `rank` line. |
| `skills/work-planner/modes/deliver-mode.md` | Step 2 states the live-read and same-run-queue invariant. Step 7 passes board items to Reserve Task Rows. |
| `skills/work-planner/scripts/deliver.py` | `--reserve` needs `--items` and refuses a unit whose epic is not Ready or In Progress there. |
| `skills/work-planner/artifacts/epic-issue-body.md` | Reserve Task Rows and Reserve Row take board items and state the refusal. |
| `skills/work-planner/artifacts/delivery-plan.md` | Work Units: a unit comes only from a Ready or In Progress epic. |
| `skills/work-planner/test/test_board_queue.py` | Epic fixture defaults to `priority: 1`. The fallback test is replaced by tests for AC1 and AC2, the board 17 open-questions shape among them. |
| `skills/work-planner/test/test_deliver.py` | Reservation tests pass board items. AC4 tests. |

## Debt Fixed

- The `board-queue.py` docstring named a `tie` line the script never prints, and described the `order` line as needing nothing In Progress. Both now match the script.
- `test_deliver.py` called `unittest.main()` partway down, so a direct run never reached `DispatchStatus` or `ProducerOutputs`. The guard now ends the file.

## Plan Changes

None. #1591 is standalone, and nothing was deferred.
