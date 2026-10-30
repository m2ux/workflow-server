# Original Issue

> Criteria Readiness: Evidence Read While a Pull Request Is Open · issue #1446 · opened 2026-10-14 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E15:W01] Criteria Readiness: Evidence Read While a Pull Request Is Open` |
| Labels | `enhancement`, `type:task` |
| Opened | 2026-10-14 |
| State | open |
| Assignee | none |

## Body

## Overview

A task's acceptance criteria are verified from the evidence its pull request and planning record carry. That evidence exists while the pull request is open, so the criteria are reported ready to verify then, rather than only after the work has merged.

## Problem

- **The criteria are unreadable until the merge.**
  A task's criteria are reported ready to verify only once the delivering pull request has merged, so nothing can be confirmed while the merge is pending.
- **The evidence is already there.**
  The test results, the planning record and the changes themselves sit on the open pull request, so the wait buys no additional certainty.
- **A tick before the merge reads as an error.**
  A criterion ticked while the pull request is open is reported ticked early, though the pull request is exactly where its evidence lives.

## Proposal

- **A pull request naming the task makes its criteria readable.**
  The sync reports them ready to verify once a pull request names the task, open or merged.
- **Delivery and closure still wait on the merge.**
  The task is delivered, and so closable, only once that pull request has merged, which leaves the closure gate where it was.
- **A tick with no pull request is what reads as early.**
  The ticked-early line for a task names the absent pull request rather than an undelivered row.

## Acceptance Criteria

- [x] **AC1.** A task's criteria are reported ready to verify while its pull request is open, as the skill's fixture suite checks against an unmerged pull request.

## References

- **R1.** [Sync Task Issue](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/commands.md) — When a task's criteria become readable and when it becomes closable.

---
*AI assistance: this issue was substantively produced with AI tooling.*

