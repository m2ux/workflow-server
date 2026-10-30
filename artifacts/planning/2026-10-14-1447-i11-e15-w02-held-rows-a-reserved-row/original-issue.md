# Original Issue

> Held Rows: A Reserved Row Reading as In Progress · issue #1447 · opened 2026-10-14 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E15:W02] Held Rows: A Reserved Row Reading as In Progress` |
| Labels | `enhancement`, `type:task` |
| Opened | 2026-10-14 |
| State | open |
| Assignee | none |

## Body

## Overview

A row a session holds is work under way, and its board item says so. The reservation its id links is what establishes that, so a sync reading the board agrees with the dispatch that set it.

## Problem

- **A held row derives no status from its reservation.**
  A row whose id links its planning folder is being worked on, but nothing reads that link when the board's statuses are planned.
- **A sync undoes the dispatch.**
  The dispatch sets a held row's issue In Progress; the next sync computes Ready for it and moves it back, so the board contradicts itself between runs.

## Proposal

- **A reservation is a status.**
  A row whose id links its planning record reads as In Progress when the board's statuses are planned, ahead of the dependency rules that would otherwise make it Ready.
- **A released row reads as it did.**
  A row linking its work-item file carries no reservation, so it takes the status its dependencies and its epic earn.

## Acceptance Criteria

- [x] **AC1.** A row a session holds stands at In Progress on its board, as the skill's fixture suite checks a row linking its planning record against one linking its work item.

## References

- **R1.** [Task ids](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/work-breakdown.md) — What a row's id links while a session holds it and once it is released.

---
*AI assistance: this issue was substantively produced with AI tooling.*

