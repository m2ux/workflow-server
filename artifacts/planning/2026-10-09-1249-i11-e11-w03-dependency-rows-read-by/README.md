# Dependency Rows Read by Task Id — October 2026

> Work package · Created 2026-10-09

## Executive Summary

The dependency check reads an epic's Work Breakdown as a graph. It identifies a row by its Task cell, and it requires that cell to hold exactly one task id. A unit that spans two trees links a pull request per tree, so its Task cell carries the same id twice, and the check drops the row. The row then contributes no node and no edge, so every dependency and every Joins entry naming it is reported unknown, and the levels, the longest chains and the whole-epic report are all computed over a table with holes in it.

This task reads the row by the id at the head of its Task cell, so the repeated-id form, the single-link form and the bare id all name one row, and a cell whose links disagree on the id is reported as a defect in the table rather than silently skipped. It matters because the false reports are the common case on a mature initiative: a run over I04's fourteen epics reported eight problems, every one of them this, while a run over I00, whose rows carry one link apiece, reported none. A check that cries wolf on delivered work is a check nobody reads.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [w03.md](w03.md) | The work item: the friction, the parser rule, and the parts of the work |

## Links

| Resource | Link |
| --- | --- |
| Epic [I11:E11] Plan Reading | https://github.com/m2ux/workflow-server/issues/1249 |
| Initiative [I11] Work Planner | https://github.com/m2ux/workflow-server/issues/1166 |
| Dependency Rows | https://github.com/m2ux/workflow-server/issues/1264 |
| Align and sync findings, F6 | https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-08-board-11-align-sync/findings.md |
