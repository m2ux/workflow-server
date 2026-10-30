# Original Issue

> Work Item Name: One Name for a Record Work Item · issue #1269 · opened 2026-10-09 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W03] Work Item Name: One Name for a Record Work Item` |
| Labels | `bug`, `type:task` |
| Opened | 2026-10-09 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

A unit's planning record names its work item twice: once in the README a dispatching session writes, and once in the row link Record Work Item composes. The two names are composed by different parties and can disagree, which leaves the epic row pointing at a file that is not there. This task gives the file one composition and refuses a row link the record cannot satisfy.

## Problem

- **The row's link is composed, not read.**
  `deliver.py --item` writes `<record>/<task id in lower case>.md` from the task id alone. It never looks for the file, so a record whose work item carries another name is linked to a path that does not resolve.
- **The README names the file independently.**
  The record's Artifacts table is written when the record is added, before the work item exists. One delivery found a README whose row expected `work-item.md` while the row link addressed `w05.md`.
- **Nothing measures the disagreement.**
  The link lands in the epic body and the README lands in the engineering branch, and no check reads one against the other.

## Proposal

- **One party names the file.**
  The Work Breakdown Guide names a work item for its task id in lower case. The record's README row carries that name, composed the way the row link is, so the two cannot drift.
- **The link is refused where the file is absent.**
  Record Work Item resolves the path it is about to write against the record folder and refuses a name the folder does not hold, so a mismatch is caught at the row rather than at the reader.

## Acceptance Criteria

- [ ] **AC1.** A record's README names its work item by the task id in lower case, the name the row link carries, as the skill's fixture suite shows against a record it writes.
- [ ] **AC2.** Record Work Item refuses a row whose work item file the record does not hold, as the skill's fixture suite shows against a record missing that file.

## References

- **R1.** [Work Planner Scripts](https://github.com/m2ux/workflow-server/tree/workspace/skills/work-planner/scripts) — The row link, the record layout it addresses, and the fixture suite that keeps them.

---
*AI assistance: this issue was substantively produced with AI tooling.*


## Comment 1

> m2ux · 2026-10-09

The body before this issue took the [I11:E10:W03] layout:

## Overview

A unit's planning record names its work item twice: once in the README a dispatching session writes, and once in the row link Record Work Item composes. The two names are composed by different parties and can disagree, which leaves the epic row pointing at a file that is not there.

## Problem

- **The row's link is composed, not read.**
  `deliver.py --item` writes `<record>/<task id in lower case>.md` from the task id alone. It never looks for the file, so a record whose work item carries another name is linked to a path that does not resolve.
- **The README names the file independently.**
  The record's Artifacts table is written when the record is added, before the work item exists. Delivering I11:E09:W05 found a README whose row expected `work-item.md` while Record Work Item linked `w05.md`.
- **Nothing measures the disagreement.**
  The link lands in the epic body and the README lands in the engineering branch, and no check reads one against the other.

## Proposal

- **One party names the file.**
  The Work Breakdown Guide already names a work item for its task id in lower case. The record's README row carries that name, composed the same way the row link is, so the two cannot drift.
- **The link is refused where the file is absent.**
  Record Work Item resolves the path it is about to write against the record folder and refuses a name that is not there, so a mismatch is caught at the row rather than at the reader.

## Acceptance Criteria

- [ ] **AC1.** A record's README names its work item by the task id in lower case, the name the row link carries.
- [ ] **AC2.** Record Work Item refuses a row whose work item file the record does not hold.

## References

- **R1.** [#1265](https://github.com/m2ux/workflow-server/pull/1265) — the delivery whose record carried both names.


