# Quiet Columns Hoist — October 2026

> Hoist record · Created 2026-10-20

## Executive Summary

Issue #1466 was raised against the work planner's dependency reporting: a `Depends on` entry the parsers cannot read is treated by the board queue as a prerequisite that has not landed, so its row is held with nothing a reader would act on, and the joins advisory names every independent pair while the Joins cell is the cheapest way to silence it. It stood outside every initiative, so it reached no board view and no dependency check. This record holds where that work was placed and the Joins reasoning the placement relies on.

The placement matters because the two concerns are one field read by two tools. Separating an unresolvable entry from an unmet one is worth nothing unless both tools reach the same verdict, and the advisory is worth nothing unless the resolution it recommends is the one a check can see. Both land in the epic that already made the dependency parser report a row it cannot read rather than skip it.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Placement](placement.md) | The destination chosen for #1466, the rows and criteria it became, and the options weighed against it |
| [Joins](joins.md) | Every eligible pair the two new rows create, and why each does not share a pull request |

## Links

| Resource | Link |
| --- | --- |
| Quiet Columns | [#1466](https://github.com/m2ux/workflow-server/issues/1466) |
| Plan Reading | [I11:E11](https://github.com/m2ux/workflow-server/issues/1249) |
| Work Planner | [I11](https://github.com/m2ux/workflow-server/issues/1166) |
| Process board | [Board 17](https://github.com/users/m2ux/projects/17) |
