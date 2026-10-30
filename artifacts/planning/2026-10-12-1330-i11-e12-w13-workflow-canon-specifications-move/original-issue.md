# Original Issue

> Canon Specifications: Each Read Where Its Procedure Runs · issue #1330 · opened 2026-10-12 · closed

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E12:W13] Canon Specifications: Each Read Where Its Procedure Runs` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-12 |
| State | closed |
| Assignee | m2ux |

## Body

## Overview

The shared skill-file check reports 14 command specifications in the Workflow Canon skill that one procedure elsewhere runs while a reference file holds them. The check measures the placement rule over every skill in the repository, so the findings stand against Workflow Canon as they stand against Work Planner, and nothing yet moves them.

## Problem

- **Two reference files hold specifications one procedure runs.**
  [`canon-context.md`](https://github.com/m2ux/workflow-server/blob/b2fb799b/skills/workflow-canon/references/canon-context.md) draws 8 findings and [`change-surface.md`](https://github.com/m2ux/workflow-server/blob/b2fb799b/skills/workflow-canon/references/change-surface.md) draws 6, each naming the single file whose procedure runs the specification. Neither file carries a Procedure of its own, so each specification is named by reference prose or by a sibling specification and run from a mode file elsewhere.
- **The reader opens a context file to reach one operation.**
  A mode reaching Fetch Unit, Resolve Ref or Write Audit Packet opens a file stating terms, criteria, scope, homes, checks and conventions for the one specification its step runs.
- **No criterion carries the move.**
  The acceptance criteria that bind Workflow Canon cover its mode files' top-level sections. The placement of its command specifications is measured and unaddressed.

## Proposal

- **Each specification stands in the file whose procedure runs it.**
  A specification the check names with one caller moves to that caller's Commands section, as the [shared skill guidelines](https://github.com/m2ux/workflow-server/blob/b2fb799b/skills/guidelines.md#L97-L107) state placement.
- **The reference files keep what several procedures share.**
  A specification more than one file runs stays where it is, so an operation two modes run is stated once and changed once.
- **The check reports the result.**
  Over `skills/workflow-canon` the command-specification findings reach zero, which is how the move is observed.

## Acceptance Criteria

- [x] **AC1.** The shared skill-file check reports no command specification with one caller over the Workflow Canon skill's files.

## References

- **R1.** [The suppression table](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-12-1319-i11-e12-w07-the-exclusion-names-a/suppressions.md) — the nine of these findings the narrowed caller rule uncovered, with the section of its own file that cites each and the procedure that runs it.
- **R2.** [Command placement](https://github.com/m2ux/workflow-server/blob/b2fb799b/skills/guidelines.md#L97-L107) — a specification sits in the file whose procedure runs it, and a caller is a procedure that runs the command.

Assisted-by: AI <noreply@ai-assistant>

