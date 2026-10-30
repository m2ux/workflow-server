# Original Issue

> Unit Record: One Folder Holds a Unit's Rows · issue #1332 · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W10] Unit Record: One Folder Holds a Unit's Rows` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

A unit of work is one task row, or the rows that name each other in Joins, and one unit is one pull request. The available-work report names one record folder for the unit, and Deliver Mode holds that a unit's record exists and its rows carry that record's link. The reserve operation derives a folder from each row separately, so a joined pair is held with two folders and its planning is split across them. This task makes the reserve operation hold a unit with the folder the report named for it.

## Problem

- **The folder is derived per row, not per unit.**
  [The reserve loop](https://github.com/m2ux/workflow-server/blob/fae97e9e/skills/work-planner/scripts/deliver.py#L325-L329) calls `names()` once for each task it is given, with that task's own id and Description, and writes the result as that row's link.
- **The function it calls is written for a unit.**
  [`names()`](https://github.com/m2ux/workflow-server/blob/fae97e9e/skills/work-planner/scripts/deliver.py#L95-L100) documents its result as what one unit's **first** task id and Description give it, which is the folder the available-work report prints. Only the first row's call agrees with that report.
- **Two joined pairs were held wrongly.**
  Reserving a joined pair on an epic of this initiative produced one folder named for each row rather than one for the pair, and a second joined pair on the same epic was held the same way. Each pair is one pull request, so each needed one record.
- **Nothing reports the split.**
  No check reads a joined pair's two links against each other, so a unit whose work items sit in different records looks correct in the table.

## Proposal

- **One reserve call holds one unit.**
  The operation reads the Joins of the rows it is given and derives a single folder from the unit's first row, as the available-work report does, then writes that folder as the link of every row in the unit.
- **A row that joins nothing is unchanged.**
  Its unit is itself, so its folder is the one its own id and Description give it.
- **Release follows the same reading.**
  Each row of a released unit points to its own work-item file inside the one record, which is where the record's README already links them.

## Acceptance Criteria

- [ ] **AC1.** The reserve operation writes one record folder as the link of every row of a unit whose rows name each other in Joins, as the operation's own suite shows against a specimen epic carrying such a pair.
- [ ] **AC2.** The folder the reserve operation writes for a unit is the folder the available-work report names for that unit, as a run of both over one specimen epic shows.

