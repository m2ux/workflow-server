# Delivery Evidence

## Scope and Revision

W04, W05 and W06 are one joined unit on i17/e03/w04-joined-rows-share-one. The tested and published task head is `9420b0369d721e71dbc8d13c056361cb6410dc44`, rooted in epic-base revision `74e19867e905523b85d2da84c7b1cb35b2b60b53`.

Lane is a task-table cell. The shared dependency-module reader returns each bare decimal index as a string, valid empty cells as None, and malformed cells as row-specific findings with no fabricated empty value. The formatter reuses that reader. Work-item files supply component data.

## Execution Checklist

- [x] Confirm all three live row reservations and the published work items.
- [x] Agree component ownership and the shared reader interface.
- [x] Implement the artifact, shared reader and format integration.
- [x] Verify criterion cases, table-operation preservation and complete suites.
- [x] Publish the task PR and merge verified work into the epic base.
- [x] Record delivery, update draft integration and confirm board state.

## T1: Joined-Lane Rule

**Pass — AC3.** Read the committed Dependency Graph artifact at the tested head. Joins requires the same Lane index in every row or empty cells throughout. The rule links the owning Epic Issue Body Lane field. A split assignment has two resolutions: change a row's lane or unjoin the rows. Check Dependencies reports the failing unit with each row and lane and exits nonzero.

## T2: Dependency Lane Reader

**Pass — AC4.** The focused dependency suite passed 72 tests. The TaskLanes cases run the actual reader and dependency main procedure over task tables with no work-item links. Equal indices and all-empty joined units pass; different indices, indexed/empty mixtures, transitive split units and malformed cells fail with row-specific evidence. Raw Markdown links and code spans are rejected before link stripping can turn them into an index. A malformed cell supplies no fake empty lane. Component declarations remain independent.

The criterion-specific rerun at the exact committed revision passed in a detached checkout, recorded in criterion-tests.log.

## T3: Format Cell Validation

**Pass — AC13.** The focused formatter suite passed 109 tests. TaskRowLanes accepts bare indices and empty cells and reports the task id for code spans, linked indices, bold markup, labels, prose, negative values and decimal fractions. Generic normalization preserves malformed content while reporting it, puts Lane after Joins and Done last, and is idempotent on a valid canonical table.

## T4: Table-Operation Preservation

**Pass — AC14.** Four added integration cases execute the real deliver and sync command paths. Reservation and release preserve index 2 beside W01 and an empty lane beside W02, including a joined same-lane unit. Open PR-link recording and merged delivery/criterion ticks preserve both rows' lane values by task id. Closed-epic normalization reorders Lane and Done while preserving index 2 and completion ticks. Done is the final column in each result.

The focused delivery suite passed 86 tests. The two sync preservation cases passed after their specimens explicitly populated the input Lane values. The 24 combined criterion cases passed in a detached checkout at `9420b0369d721e71dbc8d13c056361cb6410dc44` in 1.152 seconds.

## T5: Combined Validation

**Pass.** At the tested commit, the complete planner suite ran 872 tests: 871 passed and one opt-in live Development-link test was skipped because WORK_PLANNER_LIVE_LINK was not supplied. The shared checker suite passed 208 tests. Check Skill Files checked 52 work-planner files with zero findings. git diff --check passed.

Commands from the task checkout use its own scripts and templates, launched through the approved sbx tool:

```text
python3 -m unittest discover -s skills/work-planner/test -q
python3 -m unittest discover -s skills/test -q
python3 skills/scripts/check_skill_files.py skills/work-planner
python3 skills/work-planner/scripts/revision-check.py --project <project-checkout> --revision 9420b0369d721e71dbc8d13c056361cb6410dc44 -- <sbx> env PYTHONPATH=skills/work-planner/test python3 -m unittest test_deps.TaskLanes test_format.TaskRowLanes test_deliver.LaneCellPreservation test_sync.LaneCellRecording -q
```

Raw results are planner-tests.log, shared-tests.log and criterion-tests.log.

## Arising Input-Handling Defect

An extra probe of reciprocal joins covering every row of two epics reproduces a priority RecursionError at the initial base revision, before this unit. The dependency parser mechanically accepts the qualified joins and derives cyclic whole-epic prerequisites. The published delivery contracts describe units within an epic; they do not explicitly admit cross-epic joined delivery. This is an unsupported-input handling defect outside the lane changes. The pinned revision, exact fixture bodies, source hash and result are recorded in priority-recursion.json. Source issue #1630 is subsumed into future E03 W14 and closed as not planned. The existing delivery contract scopes units within one epic. W14 enforces that scope before priority evaluation; it is not started by this session.


## Merge and Tracker Readback

- Task PR #1629 merged into i17/e03/workspace at `dffa25a9b1cf35225e5b83a83e9b2e7a8f1204c2`, retaining the tested task head `9420b0369d721e71dbc8d13c056361cb6410dc44`.
- The merge tree is identical to the tested head. All 24 criterion cases pass again in a detached checkout at the exact merge revision in 1.224 seconds; merged-criterion-tests.log holds the result.
- The epic-base target has no branch protection or active rules. No check runs or status contexts are configured for the task head, and no approval is required there. Local tests and the exact-head evidence passed before merge.
- Fresh issue #1625 matches its published canonical body. AC3, AC4, AC13 and AC14 are ticked and W04, W05 and W06 each link #1629 with Done ticked. Earlier delivery is retained.
- Fresh integration #1627 is open and draft at the merge revision. Its body cites #1626, #1628 and #1629 and describes the current combined table contract and validation.
- An individual read of Project 17 item 291913055 confirms In Progress. The epic remains open with routing, planning/reporting and the arising diagnostic task undelivered.
- A final sync has no new delivery discrepancy; the documented retired W01/AC1 coverage disagreement remains.

## Arising Work and Next Units

Source issue #1630 is tracked by E03 W14, covering AC15. Its future work item and criteria are published and format/dependency checked. The appended row's numbering-level advisory preserves existing published row identities and is recorded in the plan; it introduces no dependency or joins problem and changes no priority label.

The final survey offers W07+W08, W10 and W14. W07+W08 is the next routing unit in row order. None is reserved or started. W11–W13's pre-existing reporting decision remains deferred until before W11 starts.
