# Current Criterion Audit

Reviewed head `73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0` against target `d0a62b8037bb1b8fdafac5bf0e0035ada8c64486`. The exact source tree passed 903 planner tests with one opt-in live skip, 208 shared tests, 53 skill-file checks with zero findings and whitespace checks. All 14 rows and AC2–AC15 remain complete in the refreshed issue snapshot.

## Criterion Matrix

| Criterion | Current observation | Instrument |
| --- | --- | --- |
| AC2 | Requested index admits its lane and unlaned; absent index admits unlaned; report names lane and preserves ordering | Lane Admission, Work Units and Report Lines read |
| AC3 | Joined rows share one index or are all empty; split units resolve by moving a lane or unjoining | Dependency Graph Joins read |
| AC4 | Raw task-table values validate and differing joined values identify every member | test_lane.LaneOperations and test_deps.TaskLanes |
| AC5 | Actual survey offers only admitted free units, including rows without work-item links | test_deliver.LaneAdmission real CLI cases |
| AC6 | Initial, resolved-issue and released-hold surveys carry the request's optional index; no session lane | Deliver mode read |
| AC7 | Initiative lane decision and confirmed per-row map feed epic-body population; joined rows assigned together | Plan mode read |
| AC8 | Ready-unit lanes come from raw cells in existing supplied issue snapshots | Board Queue Ready Unit Lanes read |
| AC9 | Eligible joined units report index/unlaned, and Status/assignee calls match across valid lane maps | test_board_queue.ReadyUnitLanes real CLI cases |
| AC10 | Advance retains returned Ready Unit Lanes and reports every unit's lane/unlaned state | Advance Plan/Report read and mode/document checks |
| AC11 | Exact seven-column template places Lane after Joins and before Done, with bare index/empty row population | Epic Issue Body read, ArtifactTemplates and formatter specimen checks |
| AC12 | Work Item inputs/template/fields/section rules use Component; no Lane declaration path | Work Item read and Lane search |
| AC13 | Marked-up, linked and prose populated cells fail without losing raw evidence | test_format.TaskRowLanes |
| AC14 | Indexed/empty cells remain attached by task through normalization, reservation/release, PR-linking and Done | TaskRowLanes, LaneCellPreservation and LaneCellRecording round trips |
| AC15 | Out-of-epic Joins identify owner/target, return nonzero before priorities and preserve same-epic diagnostics | test_deps.JoinedEpicScope real CLI regressions |

The criterion run includes every named class plus mode/template checks. Document-interface checks observe the operative procedure inputs, directed reads and complete calls; manual inspection establishes each prose criterion's actual meaning.


## Refactor Evidence

LaneOperations covers raw indices/markup, confirmed assignment and refusal without partial writes, reader/writer table forms, CRLF preservation, missing/mixed units, opaque request matching, labels and CLI isolation from unrelated malformed rows. Standalone dependency checking reports missing Lane data for joined units while retaining the original malformed-cell evidence. Existing delivery, queue, format, reservation and synchronization regressions pass in the full suite.

## Historical and Integration Boundaries

W01/#1626 retains its original delivery evidence and Done tick. AC1 was retired by the approved table redesign; its historical Sync coverage disagreement is preserved, not current missing evidence. Integration #1627 remains open and unmerged. Development links read back bidirectionally as #1627 ↔ #1625 with no additional pages. The target ruleset requires one approving human review; none is present. The epic is not Done.
