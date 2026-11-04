# Task-Table Lane Plan Review

> Plan revision · 2026-11-04

## Contract

The user places Lane after Joins and before Done. Its populated cell is a bare decimal index such as 2; an empty cell means unlaned. The lane is opaque and board-wide. The task table is the data source, and work items describe components and implementation.

## Delivery State

W01 is delivered by PR #1626 at epic-base merge `6f7370b864d848c2877ae695230e297b1225a36e`. Its number, link and Done tick remain. The old declaration criterion AC1 is historical delivery evidence; the current epic contains AC2–AC14, all unticked. Draft integration #1627 is open and draft. No later unit is reserved or dispatched.

## Findings and Dispositions

| Area | Problem | Resolution |
| --- | --- | --- |
| Data ownership | The earlier plan reads work-item Lane declarations. | Confirmed: Lane is a bare task-table cell. W02+W03 establish the schema and remove the declaration path together. |
| Cell shape | The current format check has no lane-value condition. | W04–W06 share the table-lane reader, joined-lane rule and cell validation, including malformed-cell and row-write preservation fixtures. |
| Routing | A free row with no work-item link was implicitly unlaned. | W07+W08 read the task cell independently of a work-item link. |
| Queue inputs | The earlier queue plan adds an engineering checkout solely to read lane declarations. | W11–W13 use task cells in the existing issue snapshots. |
| Delivery history | Editing the delivered row could erase its PR and evidence. | W01 retains its recorded delivery; only undelivered rows are renumbered. Its obsolete criterion leaves the current required set. |
| Later style work | E02 restyles artifacts and modes that E03 touches. | Existing confirmed priorities separate them: E03 8, E02 7, E01 6. No priority change is proposed. |
| External consumer | Prosiform I10 has lane values in work-item files. | Those values need task-table assignment when that initiative adopts the delivered feature. No declaration fallback or cross-repository edit is part of this plan revision. |

## Validation

- Every current E03 work item declares one component. The dependency check runs over all 13 rows and all 13 work items and reports no problem, cycle, candidate join or unchecked component. Its full output is e03-lane-column-dependencies.txt.
- Joined delivery units are W02+W03, W04+W05+W06, W07+W08 and W11+W12. Their covered criterion counts are 2, 4, 2 and 2; no joined unit contains a dependency between its members.
- The official renumberer checks the undelivered-row map against a copy of the live pre-revision body and preserves W01. The full initiative dependency context reports no E03 problem; its existing E01 whole-epic/backward-reference findings remain outside this revision. The refreshed full report is dependencies.txt.
- The stock issue-format checker reports exactly one finding on the revised body: `Work Breakdown column not in the template: Lane`. Its installed template still describes the six-column schema. This is the planned schema change, not a passing installed-schema check.
- A plan-model check uses the existing Review implementation with only the epic template's column list set to the user-confirmed seven-column order. It reports no format finding, correction or metadata change. It verifies 13 full-width rows, empty Lane cells, preserved W01 delivery and Done, and coverage of AC2–AC14.
- A search of the operative work items W02–W13 finds no work-item Lane declaration or lane-driven engineering-checkout requirement. W01 remains historical evidence of the completed declaration task.
- The plan introduces no lane assignments: the user's request defines the storage and shape, so its own Lane cells are empty.

The source template has to gain Lane in W02+W03 before the installed format check accepts the revised issue schema. This planning request changes no installed source files. Its validation distinguishes the proposed schema from the currently installed one.

## Existing Held Decision

The user deferred Ready-unit lane reporting until before that work starts. The affected rows are now W11–W13. The table storage removes the proposed engineering-worktree input, while the choice to report Ready-unit lanes remains pending. W02–W10 do not depend on that choice.

## Checklist

- [x] Stop the declaration implementation session and capture its completed delivery.
- [x] Apply the exact table column order and bare-index cell contract.
- [x] Update criteria, work items, row numbers, dependencies and joins.
- [x] Review the goal trace, source ownership and outside consumers.
- [x] Validate dependencies and the explicitly proposed table model.
- [x] Publish the revised planning artifacts and tracker body.

## Publication

The revised planning artifacts are published on engineering at `b10908084`. A fresh read of issue #1625 matches the committed body and title byte for byte, including Lane after Joins and before Done, 13 task rows and the preserved W01 delivery. No later implementation session is started.
