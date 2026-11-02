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
