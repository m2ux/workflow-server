# Placement

Where #1466's work went, and what was weighed against it.

## Destination

**I11:E11 Plan Reading, two new task rows, the source subsumed.**

| Row | Description | Coverage |
| --- | --- | --- |
| W05 | Unresolvable dependency entries reported | AC9, AC10 |
| W06 | Joins advisory names both resolutions | AC11, AC12 |

The four criteria the source carried became four epic criteria. AC9 holds the board queue and the dependency check to one verdict on an entry that cannot resolve; AC10 holds the queue to naming the row and the entry and leaving the row unplaced; AC11 holds the advisory to naming both resolutions; AC12 holds an independent pair recorded in neither Joins nor a planning record to being reported.

The source carries a planning-record reference, so it is subsumed rather than kept: its detail fits in the two rows, the four criteria and one References entry. It is closed as not planned with its body retained, and a comment naming the rows that took it.

## Why E11

- **The epic already owns this parser.**
  W03 and W04 made the dependency check read a row by the id at the head of its Task cell and report a malformed id rather than skip it. An entry the cell's `Depends on` column cannot resolve is the same defect one column over.
- **E09 owns board status, not cell resolution.**
  Its criteria derive In Progress, Ready and Backlog from initiative state. `met` is the gate the queue applies to a row, not a status rule.
- **E10 owns checks over the skill's own files.**
  AC12 is a house-rule check and would sit there, but the other three criteria would not, and splitting the pair across two epics buys two bases and two pull requests for one field.

## Grain

Four criteria exceed one task's grain, so the work is two rows. Neither depends on the other and both change the dependency check's reporting, so they name each other in Joins and land as one pull request: one dispatched unit, one review, one base.

## Numbering

W05 and W06 can start now, and W02 and W04 cannot, so the appended numbers do not follow start order. W03 and W04 link merged pull requests and are fixed, so the rows ahead of them cannot move. The advisory stands and the numbers stay.
