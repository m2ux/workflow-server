# Original Issue

> [Coverage Cell: One Rule for What a Row Delivers](https://github.com/m2ux/workflow-server/issues/1323) · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W09] Coverage Cell: One Rule for What a Row Delivers` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The Work Breakdown Guide says a complete task's Coverage cell is empty, and nothing empties it. A row's Coverage states which of the epic's criteria that row delivers, which is a fact about the plan rather than a status, so a complete row names the same criteria an open one does. This task retires the sentence and gives the rule a check.

## Problem

- **The guide states a rule nothing holds.**
  The [Work Breakdown Guide](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/work-breakdown.md) says of an epic's Coverage column that a complete task's cell is empty. `skills/work-planner/scripts/sync.py` ticks Done and leaves the cell naming what the row delivered.
- **A run shows it.**
  A sync of an epic on this board, after its first task merged, ticked the two criteria that task covered, marked the row done, and left the row's Coverage cell naming both.
- **The sentence reads as a garbled neighbour.**
  Task grain says a delivered task's Coverage omits each criterion a further task adopts, so a row whose criteria a follow-up task delivers carries an empty cell. That is a rule about where a criterion is delivered, not about a row being finished.
- **Nothing reports a departure.**
  The format check does not read an epic row's Coverage cell against the criteria the row delivers, so a table can carry a wrong cell indefinitely.

## Proposal

- **Coverage names what the row delivers, whatever its Done cell says.**
  The guide drops the completion sentence, so one statement of the column stands and the table stays readable as a record of which row delivered which criterion after the epic closes.
- **The criteria a further task adopts still leave the cell.**
  Task grain is untouched: a row whose criteria have all been adopted elsewhere carries an empty cell, because it delivers none, not because it is finished.
- **The format check holds the rule.**
  It reports an epic row whose Coverage cell does not name the criteria that row delivers, so the column is measured rather than remembered.

## Acceptance Criteria

- [ ] **AC1.** The Work Breakdown Guide states one rule for an epic row's Coverage cell, under which a complete row names the criteria it delivers.
- [ ] **AC2.** The format check reports an epic row whose Coverage cell does not name the criteria that row delivers, as the check's own suite shows against a specimen epic carrying that fault.


## Comment 1

> m2ux · 2026-10-12

The body before this issue took the [I11:E10:W09] layout:

## Overview

The Work Breakdown Guide says a complete task's Coverage cell is empty, and the sync script leaves the criteria in it when it marks the row done. A reader of an epic table cannot tell a complete row's cell from an open one's, and the two statements of the rule disagree.

## Problem

- **The guide and the script state different things.**
  The [Work Breakdown Guide](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/work-breakdown.md) says of an epic's Coverage column that a complete task's cell is empty. `skills/work-planner/scripts/sync.py` ticks Done and leaves the cell as it was.
- **A run shows it.**
  Syncing epic [#1319](https://github.com/m2ux/workflow-server/issues/1319) after its first task merged ticked AC1 and AC2, marked W01 done, and left W01's Coverage cell reading `AC1, AC2`.
- **Nothing reports the disagreement.**
  The format check does not compare a done row against its Coverage cell, so an epic table can carry the departure indefinitely.

## Proposal

- **One of the two statements goes.**
  Either the script clears a row's Coverage cell as it ticks Done, or the guide drops the sentence and the cell keeps naming what the row delivered. The choice is between a table that reads as a work queue and one that reads as a coverage record.
- **The check holds whichever stands.**
  Once settled, the format check reports an epic row whose Coverage cell disagrees with its Done cell, so the rule is measured rather than remembered.

## Acceptance Criteria

- [ ] **AC1.** The Work Breakdown Guide and `sync.py` state one rule for a complete task's Coverage cell, as a sync of an epic with a done row and a read of the guide show the same thing.

## Open Questions

- Which way the rule settles: an emptied cell, or a cell that keeps naming the criteria the row delivered.

## References

- **R1.** [Epic I11 E12](https://github.com/m2ux/workflow-server/issues/1319) — the epic whose sync showed it.

Assisted-by: AI <noreply@ai-assistant>


