# Deliver mode

Starts the work a theme board makes available. It advances the board, merges each open pull request whose test plan has passed, holds each available unit with a planning record, and dispatches one session per unit to plan, implement, open its pull request, merge it when its test plan has passed, and hoist arising issues.

## Procedure

1. **Select.** Select the board as [Select](board.md#select) states.
2. **Advance.**
   Run [Advance Mode](advance-mode.md) for the board, so the epics that are Ready and In Progress are the ones the queue decides.
3. **Fetch.**
   Read the board as [Read](board.md#read) states.
   - [Fetch Board Fields](commands.md#fetch-board-fields).
   - [Find User](commands.md#find-user) for the assignee.
4. **Survey.**
   The long-lived branches are as the [Work Breakdown Guide](work-breakdown.md#delivery) defines. List each epic's bases with [List Epic Bases](commands.md#list-epic-bases), then run [Find Available Work](commands.md#find-available-work) with those names and `--project` set to a checkout of the project. Give an issue it reports unresolved with `--others`, and run it again.
   - **Held work.**
     Put each `hold` line to the user as an [Interview](interview.md) before any unit is dispatched, with the record it links and whether a session is still running. The user releases it or leaves it. A released row goes through [Release Row](commands.md#release-row) and [Patch Body](commands.md#patch-body), and the command runs again.
   - **Blocked work.**
     A `blocked` line is reported, not asked. Its dependencies decide when it becomes available.
5. **Merge.**
   Follow [Task Merge](work-breakdown.md#task-merge) for each `merge` line.
6. **Confirm.**
   Show each `unit` line, with its tasks, coverage, record folder, branch, base and worktree, and confirm the set as an [Interview](interview.md). Dispatch only the units the user confirms.
7. **Hold.**
   For each confirmed unit, before its session starts:
   - Add its record with [Add Planning Record](commands.md#add-planning-record), named as the `unit` line gives it, and commit and push the engineering worktree.
   - Run [Reserve Row](commands.md#reserve-row) for the unit's tasks and [Patch Body](commands.md#patch-body) with the body it writes.
   - Set each task issue of the unit, where one exists, to In Progress with [Set Item Status](commands.md#set-item-status), and its epic with it.
8. **Dispatch.**
   For each held unit:
   - [Create Task Worktree](commands.md#create-task-worktree), and write the [brief](#brief) to a file in that worktree.
   - Start the unit's session with the sub-agent dispatch of the session this mode was called from.
   - The sub-agent works in the unit's worktree, reads the brief, and has the engineering worktree in reach for the planning record.
   - The session is left running.
9. **Report.**
   Each pull request merged, and each left open by a conflict; each review pull request updated; each unit dispatched, with its record, branch, worktree and the session started for it; each row left held; each blocked row and what blocks it.

## Brief

What the prompt tells one session, written from the facts the `unit` line and the epic carry.

- **The work.**
  The epic's issue URL, the unit's task ids, their Descriptions, the acceptance criteria its Coverage names, the branch, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines, and the epic base its pull request targets.
- **The record.**
  The reserved folder, which is where its planning artifacts go.
- **Plan.**
  Invoke the work-planner skill, and write one [work item](work-breakdown.md#work-item) per task into the record, with any further file the work needs, as the [planning layout](planning-layout.md) describes. Commit and push the engineering worktree.
- **Link the work items.**
  Link each work-item file from the record's README under [Planning README](planning-readme.md). The row retains its folder link while reserved.
- **Match the tests to the criteria.**
  The work item's test row names a test for each criterion the unit's Coverage carries, of the kind that criterion can be observed by, as [Test Coverage](work-breakdown.md#test-coverage) states.
- **Implement.**
  Deliver the work in the worktree, with every test the work item names, as the [Work Breakdown Guide](work-breakdown.md#tables) states.
- **Open the pull request.**
  Open it with [Open Task Pull Request](commands.md#open-task-pull-request), which titles it for the epic, targets the epic base, fills the Test Plan table as [Test Coverage](work-breakdown.md#test-coverage) states, and links each task issue the unit delivers. Then run [Sync Epic](commands.md#sync-epic) for the unit's tasks and [Patch Body](commands.md#patch-body).
- **Merge.**
  Record passed checks with [Patch Pull Request Body](commands.md#patch-pull-request-body), following [Test plan](work-breakdown.md#task-delivery), then follow [Task Merge](work-breakdown.md#task-merge).
- **Hoist arising issues.**
  Create each issue that arose during delivery as a standalone issue with [Create Issue](commands.md#create-issue), with no agent-engineering prefix. Then run [Hoist Mode](hoist-mode.md) for each such issue, prompting the user for its placement across open initiatives and epics.

## Rules

- **The calling session dispatches.**
  The agent running this mode starts each unit through the sub-agent dispatch of the session it was called from, and that dispatch is the only way a unit's session starts.
  - When that session provides no sub-agent dispatch, this mode reports that and stops before any unit begins.
- **The hold precedes the session.**
  A unit's record exists, its row carries that record's link, and the body is patched, before its session starts. A session is never dispatched for a row another one holds.
- **The hold stands until the pull request.**
  A held row stays held while its session plans and implements. [Sync Epic](commands.md#sync-epic) replaces the record's link with the pull request's, which frees the row.
- **One unit, one session.**
  A unit is a task row, or the tasks that name each other in Joins, as the [Work Breakdown Guide](work-breakdown.md#tables) defines. One unit is one pull request's work.
- **Task branches.**
  A unit works on the branch [Find Available Work](commands.md#find-available-work) names, cut from the epic base, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- **Release is the user's call.**
  A held row is released only on the user's word. This mode reads no clock and reclaims nothing on its own.
- **Dispatch is confirmed.**
  No session starts until the user confirms the set of units.
- **Status.**
  This mode sets a dispatched unit's task issue and its epic to In Progress. The queue stays [Advance Mode](advance-mode.md)'s.
- **Arising issues.**
  Issues arising from the delivery of a single work item are raised as standalone issues and hoisted through [Hoist Mode](hoist-mode.md) once the pull request is open and the epic synced.
