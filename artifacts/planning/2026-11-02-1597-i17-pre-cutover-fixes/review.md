# I17 Review

## Format

- **Problem.** The initiative Proposal named I16's row as `I16 E00 W00`, which the format check read as a plan id of this initiative.
  **Resolution.** Restated as I16's row that extracts the skill. The check then reported nothing on either body, drafted or saved.

## Dependencies and Numbering

- **Problem.** None. No edge, no candidate unit, no contention, numbering follows start order.
  **Resolution.** The report is [dependencies.txt](dependencies.txt).

## Goal

- **Problem.** The extraction's pinned revision in I16 predates these fixes.
  **Resolution.** Recorded in the [goal trace](goal-trace.md) as the flagged gap; I16's edge holds the order and its re-pin is I16's.
- **Problem.** Each row's implementation reaches files beyond its declared component.
  **Resolution.** Kept as the user shaped the rows, recorded in [Decisions](decisions.md).

## Cross-Repository Edge

- **Problem.** I16 E00 W00 named no prerequisite.
  **Resolution.** Its Depends on cell names `[I17:E00](https://github.com/m2ux/workflow-server/issues/1598)`. The saved body passed the format check against I16's initiative and the dependency check.

## E03 Delivery Lanes

- **Problem.** E03:W07 named W01, already implied through W03.
  **Resolution.** Dropped; the check reports no E03 problem. The report is [dependencies.txt](dependencies.txt).
- **Problem.** The source issue's criteria were each delivered by several rows.
  **Resolution.** Split into one criterion per row, AC1 to AC10.
- **Problem.** E01:W01 names epic E02 and depends on a later epic's rows.
  **Resolution.** Left as E01's recorded decision 7; outside E03's scope.
- **Problem.** Contention between E02 and E03 is unchecked, since E02 has no work items.
  **Resolution.** Put to the user with E03's priority.
- **Format.** The epic and the initiative, checked with every epic, report nothing to fix, apply or decide.


## E03 Task-Table Lane Review, 4 November 2026

The confirmed storage and column order are implemented in the plan. [Lane-column review](e03-lane-column-review.md) holds the current findings, dispositions, validation and held reporting decision. [Lane-column dependencies](e03-lane-column-dependencies.txt) checks every current E03 row and work-item component.


## E03 Arising Input Review, 4 November 2026

The priority recursion is reproduced before W04–W06 and affects unsupported cross-epic Joins. Its fix is a future W14 row consuming W05's early unit stage. Existing row numbers remain, with the appended row's level advisory recorded. This adds no new component contention across epics and retains the approved priorities.
