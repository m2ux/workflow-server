# Original Issue

> Review Readiness: A Complete Epic Standing for Review · issue #1448 · opened 2026-10-14 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E15:W03] Review Readiness: A Complete Epic Standing for Review` |
| Labels | `enhancement`, `type:task` |
| Opened | 2026-10-14 |
| State | open |
| Assignee | none |

## Body

## Overview

A completed epic's review pull request stands for review on the signal that completes it, and the board writes a delivery run makes to move it there are held to the statuses that run owns.

## Problem

- **A complete epic waits on a click.**
  Its review pull request stays a draft until the user marks it ready, though every condition for that mark is one the delivery scripts already establish.
- **The click gates nothing the merge does not.**
  Where the target branch requires an approving review the merge is the reviewer's regardless, so the draft only delays the pull request reaching them.
- **A delivery run writes the board unchecked.**
  Board writes go through one component that refuses a status the calling mode does not own, and a delivery run's writes are the only ones that bypass it.

## Proposal

- **The signal that completes an epic names the draft to ready.**
  The sync reports a base unmerged once every task is delivered and every criterion ticked, naming the pull request that merges it and marking a draft as draft. A draft named there is taken out of draft, and the epic moves to In Review.
- **The mark states completion, not permission to merge.**
  The epic merge conditions decide the merge, and approval gives it to the reviewer wherever the target branch requires a review.
- **A delivery run's board writes are held to a jurisdiction.**
  It owns the In Progress a held row and its epic take and the In Review a completed epic takes. Any other status, a task set In Review, and a removal are refused, and the calls are rendered by the component that renders a sync's and a queue's.

## Acceptance Criteria

- [x] **AC1.** An epic whose tasks are all delivered and criteria all ticked has the pull request merging its base named for readying, as the skill's fixture suite checks the signal a delivery run reads.
- [x] **AC2.** A delivery run's board write is refused unless it sets a row or its epic In Progress, or an epic In Review, as the skill's fixture suite checks against each refused status.

## References

- **R1.** [Review pull request](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/work-breakdown.md) — The review pull request's lifecycle and the mark that readies it.
- **R2.** [Set Dispatch Status](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/deliver-mode.md) — The command rendering a delivery run's board writes.

---
*AI assistance: this issue was substantively produced with AI tooling.*

