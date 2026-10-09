# Malformed Task Ids Named — October 2026

> Work package · Created 2026-10-09

## Executive Summary

The dependency check takes a Work Breakdown row's identity from the head of its Task cell. A cell holding a well-formed id is read correctly, and a cell holding a typo is not: one carrying an extra digit resolves to the row its first three characters spell, and one carrying too few is skipped with the rest of the row. Neither outcome is reported, so the column that holds a row's identity is the one column where a typo is silent.

This task holds every id a Task cell carries to the form a task id takes, and reports one that departs from it with the epic and the id as written. It matters because the silent cases are the expensive ones: a cell read as the wrong row puts that row's dependencies on a neighbour, and a cell skipped takes its row out of the graph, which is the same fault the preceding row of this epic was raised to close.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [w04.md](w04.md) | The work item: the two silent cases, the form a task id takes, and the parts of the work |

## Links

| Resource | Link |
| --- | --- |
| Epic [I11:E11] Plan Reading | https://github.com/m2ux/workflow-server/issues/1249 |
| Initiative [I11] Work Planner | https://github.com/m2ux/workflow-server/issues/1166 |
| W03 record | https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-09-1249-i11-e11-w03-dependency-rows-read-by/ |
