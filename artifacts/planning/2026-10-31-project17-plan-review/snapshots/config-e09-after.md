## Overview

A board reflects current delivery activity within initiative membership. Reservations and open pull requests keep work In Progress. Unstarted epics become Ready under a Ready or In Progress initiative when their prerequisites are met. Completed work retains Done, and epic In Review handoff requires agent review of the current integration diff. Sync reads every epic on the board, whatever table it carries.

## Problem

- **Historical delivery obscures current activity.**
  Completed work alone can keep an initiative In Progress even when it has no current delivery activity.
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

- **Initiatives reflect their current members.**
  Current delivery activity in listed epics supports In Progress; completed work alone does not start another initiative. The board imposes no single-active-initiative limit.
- **Membership decides candidacy.**
  Only an epic still in the initiative's table counts towards that initiative being In Progress.
- **Reservations are active work.**
  An active task reservation or open delivery pull request makes its epic In Progress until completion and reviewed-handoff conditions are met. A persistent epic integration draft alone is not task activity.
- **Review gates the handoff.**
  An epic becomes In Review only after completion checks and recorded agent review of the current integration head and base pass, with no unresolved blocking finding. Missing or stale review keeps a completed, unmerged epic In Progress; human approval still governs merge.
- **Ready opens on the initiative.**
  An unstarted epic is eligible for Ready while its initiative is Ready or In Progress, its dependencies are delivered and its planning prerequisites are met. An unresolved prerequisite keeps unstarted work in Backlog.
- **Backlog takes the tree.**
  An initiative in Backlog holds its unstarted epics and task issues in Backlog, with no assignee. Completed descendants retain Done; active reservations, open delivery pull requests and review handoffs require explicit reconciliation before a parent can be parked, rather than automatic release or reassignment.
- **Every epic read.**
  A closed epic is brought to the current Work Breakdown columns before sync reads its tasks.
- **The link names its epic.**
  Sync retitles a merged pull request a row links so its title starts with that row's epic prefix.
- **The theme is named.**
  The skill's themes table names the planning theme and its board, as it does the others.
- **The project states its own branches.**
  A project names its long-lived branches in `config/branches` at the evaluated commit. The run records the repository, resolved commit and configuration path; invocation worktree and uncommitted edits do not choose the source.
- **The reading reaches the branch under delivery.**
  An epic sync evaluates its pinned epic-base commit; verification of merged delivery evaluates that merged commit. An absent, empty or unreadable declaration is unevaluable and names the affected checks; no other revision, working tree or branch-name inference supplies a fallback.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Done |
| --- | --- | --- | --- | --- | --- |
| W01 | Sync reads every epic and names its prefix | AC6, AC7 | | W02 | |
| W02 | Name the planning theme and its board | AC8 | | W01 | |
| W03 | Initiative membership and epic activity determine status | AC2, AC3 | [E08](https://github.com/m2ux/workflow-server/issues/1175) | | |
| W04 | Ready and Backlog follow the initiative | AC4, AC5 | W03 | | |
| [W05](https://github.com/m2ux/workflow-server/pull/1265) | A project names its own long-lived branches | AC9 | | | ✓ |
| [W06](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-09-1268-i11-e09-w06-delivery-reading-the-set-a/w06.md) | Configuration from the evaluated revision | AC10, AC12 | W05 | | |
| [W07](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-09-1268-i11-e09-w06-delivery-reading-the-set-a/w07.md) | Report unavailable project configuration | AC11, AC13 | W06 | | |

## Acceptance Criteria

- [ ] **AC2.** An epic that has left an initiative's table does not make that initiative In Progress.
- [ ] **AC3.** An open epic with an active task reservation or open delivery pull request is In Progress until it satisfies the reviewed-handoff gate, as board fixtures demonstrate with reservation-only, PR-only and inactive cases.
- [ ] **AC4.** An unstarted epic is eligible for Ready exactly when its initiative is Ready or In Progress and its delivery and planning prerequisites are met, as board fixtures demonstrate across parent statuses and unmet prerequisites.
- [ ] **AC5.** A Backlog cascade applies only to unstarted descendant epics and task issues, placing them in Backlog without an assignee, as board fixtures demonstrate while preserving Done and reporting active or review work for reconciliation.
- [ ] **AC6.** A closed epic carries the current Work Breakdown columns before its tasks are read.
- [ ] **AC7.** A merged pull request a row links carries a title starting with that row's epic prefix.
- [ ] **AC8.** The skill's themes table names the planning theme, its label and its board.
- [x] **AC9.** The long-lived branches of a project are the names its `config/branches` states, and no directory entry beside them.
- [ ] **AC10.** Runs evaluating the same repository commit return the same declared branch names regardless of invocation worktree, as fixtures with divergent and dirty worktrees demonstrate.
- [ ] **AC11.** An absent, empty or unreadable branch declaration at the evaluated commit is reported as unevaluable with its source identity, as fixtures with configuration present only at another revision demonstrate.
- [ ] **AC12.** An epic sync reads branch names from its pinned epic-base commit, as fixtures where base and long-lived revisions disagree demonstrate.
- [ ] **AC13.** A sync run that cannot read the long-lived branches names the epic checks it did not make.

## References

- **R1.** **Source.** [Work Planner Retrospective](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-06-work-planner-retrospective) — The sessions in which the board rules were stated.
- **R2.** [Board Status](https://github.com/m2ux/workflow-server/issues/1120) — The board readings behind each fault, and the sync cases a closed epic's table leaves unread.
- **R3.** [Board Ready](https://github.com/m2ux/workflow-server/issues/1119) — The Ready half of the rule, with the epics observed in Ready without their initiative.


