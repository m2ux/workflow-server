## Overview

A board's columns follow the tree. One initiative per repository is In Progress, and its epics move with it: Ready opens on the initiative and reaches only the epics at the bottom of its dependency tree, and Backlog takes the epics and their assignees with it. An epic is In Progress only while a pull request is open on it, and sync reads every epic on the board, whatever table it carries.

## Problem

- **Several initiatives In Progress at once.**
  Status is derived from delivery alone, so every initiative holding a completed epic or an open pull request is In Progress together, and the board does not say what is being worked on.
- **An epic outside the table counts.**
  An initiative is a candidate for In Progress on the strength of a completed epic its table does not list.
- **In Progress with no work under way.**
  One delivered row, or a pull request merged long ago, is enough to hold an epic In Progress, with nothing open on it.
- **Ready reached without the initiative.**
  An epic whose dependencies are delivered becomes Ready while its initiative sits in Backlog, so Ready fills with work nobody has started the initiative for.
- **Backlog leaves the epics behind.**
  Moving an initiative to Backlog leaves its epics where they were, still assigned.
- **Sync stops on an older table.**
  A closed epic carrying an earlier Work Breakdown has its tasks skipped, so its delivery is never read.
- **A linked pull request naming no epic.**
  A row links a merged pull request whose title carries no epic prefix, so the row is not seen as delivered and Done stays empty.
- **The branch set is read from a branch nobody delivers on.**
  The long-lived branches are read from the main working tree, which sits on the long-lived branch, so a statement an initiative changes is unreadable for that initiative's whole life and the epic checks gated on the set are passed over in silence.

## Proposal

- **One In Progress initiative.**
  A board holds at most one In Progress initiative per repository. The user moves it; another initiative stays in Backlog even when it holds a completed epic.
- **Membership decides candidacy.**
  Only an epic still in the initiative's table counts towards that initiative being In Progress.
- **Open work for In Progress.**
  An epic is In Progress only while a pull request is open on it.
- **Ready opens on the initiative.**
  An epic is Ready only while its initiative is Ready and every dependency in its row is delivered; otherwise it is Backlog.
- **Backlog takes the tree.**
  An initiative in Backlog holds its epics and their task issues in Backlog, with no assignee.
- **Every epic read.**
  A closed epic is brought to the current Work Breakdown columns before sync reads its tasks.
- **The link names its epic.**
  Sync retitles a merged pull request a row links so its title starts with that row's epic prefix.
- **The theme is named.**
  The skill's themes table names the planning theme and its board, as it does the others.
- **The project states its own branches.**
  A project names its long-lived branches in `config/branches`, a run from a linked worktree reads the statement its main working tree holds, and a project that states none and carries no integration branch naming one is reported unevaluable.
- **The reading reaches the branch under delivery.**
  A sync run takes the statement the epic base carries, and where it can read no statement it names the epic checks it did not make rather than passing over them.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Done |
| --- | --- | --- | --- | --- | --- |
| W01 | Sync reads every epic and names its prefix | AC6, AC7 | | W02 | |
| W02 | Name the planning theme and its board | AC8 | | W01 | |
| W03 | Initiative membership and epic activity determine status | AC2, AC3 | [E08](https://github.com/m2ux/workflow-server/issues/1175) | | |
| W04 | Ready and Backlog follow the initiative | AC4, AC5 | W03 | | |
| [W05](https://github.com/m2ux/workflow-server/pull/1265) | A project names its own long-lived branches | AC9, AC10, AC11 | | | ✓ |
| [W06](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-09-1268-i11-e09-w06-delivery-reading-the-set-a/w06.md) | The set a sync run reads | AC12, AC13 | W05 | | |

## Acceptance Criteria

- [ ] **AC2.** An epic that has left an initiative's table does not make that initiative In Progress.
- [ ] **AC3.** An epic with no open pull request on it is not In Progress.
- [ ] **AC4.** An epic is Ready only while its initiative is Ready and every dependency in its row is delivered.
- [ ] **AC5.** An initiative in Backlog has its epics and their task issues in Backlog, with no assignee.
- [ ] **AC6.** A closed epic carries the current Work Breakdown columns before its tasks are read.
- [ ] **AC7.** A merged pull request a row links carries a title starting with that row's epic prefix.
- [ ] **AC8.** The skill's themes table names the planning theme, its label and its board.
- [x] **AC9.** The long-lived branches of a project are the names its `config/branches` states, and no directory entry beside them.
- [x] **AC10.** A run from a linked worktree returns the long-lived branches its main working tree returns.
- [x] **AC11.** A project stating no long-lived branches and carrying no integration branch naming one is reported unevaluable, naming the statement that is missing.
- [ ] **AC12.** A sync run against an epic whose base states long-lived branches its long-lived branch does not returns that base's names.
- [ ] **AC13.** A sync run that cannot read the long-lived branches names the epic checks it did not make.

## References

- **R1.** **Source.** [Work Planner Retrospective](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-06-work-planner-retrospective) — The sessions in which the board rules were stated.
- **R2.** [Board Status](https://github.com/m2ux/workflow-server/issues/1120) — The board readings behind each fault, and the sync cases a closed epic's table leaves unread.
- **R3.** [Board Ready](https://github.com/m2ux/workflow-server/issues/1119) — The Ready half of the rule, with the epics observed in Ready without their initiative.


