# Original Issue

> Duplicate Anchors: Every Repeated Heading Reported · issue #1326 · opened 2026-10-12 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W07] Duplicate Anchors: Every Repeated Heading Reported` |
| Labels | `enhancement`, `type:task` |
| Opened | 2026-10-12 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The shared skill-file check reports a repeated heading only where something already cites it, so a file can carry several headings of one title unnoticed until the first citation lands on the wrong one. The review criteria carry eleven such headings today. The check should report a repeated heading whether or not anything cites it yet.

## Problem

- **The rule waits for a victim.**
  [`check`](https://github.com/m2ux/workflow-server/blob/9ed47b0d/skills/scripts/check_skill_files.py#L136-L140) reports a duplicate anchor only when that anchor is in the file's callers, so an ambiguity is measured by whether anyone has fallen into it rather than by whether it is there.
- **Eleven ambiguous headings stand in one file.**
  [`review-criteria.md`](https://github.com/m2ux/workflow-server/blob/9ed47b0d/skills/work-planner/references/review-criteria.md) titles a heading `Problem` four times and `Work Breakdown`, `Title`, `References`, `Open Questions` and `Non-Goals` twice each, one per issue kind. None is cited, so the check is silent on all of them, and the next author who cites one by title reaches the first of that title.
- **The fault is known to recur.**
  Five citations into that same file resolved by file order until [#1324](https://github.com/m2ux/workflow-server/pull/1324) corrected the headings behind them. Those headings were indistinguishable from the eleven that remain.

## Proposal

- **A repeated heading is reported wherever it stands.**
  The check reports a second heading resolving to an anchor another heading in the same file already holds, naming both lines, whether or not a citation reaches it. A link's destination is then unambiguous by construction rather than by nobody having tried it.
- **The remaining repeats are given their kind.**
  Each repeated heading in the review criteria takes the issue kind into its title, as the Proposal and Acceptance Criteria headings already do, so every anchor in the file names one section.

## Acceptance Criteria

- [ ] **AC1.** The shared skill-file check reports a heading whose anchor another heading in the same file already holds, with no citation to either, as the check's own suite shows against a specimen carrying that fault.
- [ ] **AC2.** No file in the repository's skills carries two headings resolving to one anchor, as the shared skill-file check reports over every skill.

