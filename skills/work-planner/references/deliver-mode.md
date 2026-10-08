# Deliver mode

Starts the work a theme board makes available. It advances the board, holds each available unit with a planning record, and dispatches one session per unit to plan, implement, open its pull request and hoist arising issues.

## Procedure

1. **Select.**
   - The board is a theme's board, per SKILL.md's [Themes and Boards](../SKILL.md#themes-and-boards): run [Find Theme Board](commands.md#find-theme-board) for the theme the user names.
   - When the request names none, ask which theme. Run this mode on one board at a time.
2. **Advance.**
   Run [Advance Mode](advance-mode.md) for the board, so the epics that are Ready and In Progress are the ones the queue decides.
3. **Fetch.**
   - [Fetch Board Items with Status](commands.md#fetch-board-items-with-status), [Fetch Board Fields](commands.md#fetch-board-fields) and [Find Status Field](commands.md#find-status-field).
   - [Fetch All Initiative Pull Requests](commands.md#fetch-all-initiative-pull-requests) for the board's repository, appending each further repository the board's issues live in.
   - [Find User](commands.md#find-user) for the assignee.
4. **Survey.**
   Run [Find Available Work](commands.md#find-available-work). Give an issue it reports unresolved with `--others`, and run it again.
   - **Held work.**
     Put each `hold` line to the user before any unit is dispatched, with the record it links and whether a session is still running. The user releases it or leaves it. A released row goes through [Release Row](commands.md#release-row) and [Patch Body](commands.md#patch-body), and the command runs again.
   - **Blocked work.**
     A `blocked` line is reported, not asked. Its dependencies decide when it becomes available.
5. **Confirm.**
   Show each `unit` line, with its tasks, coverage, record folder, branch and worktree, and dispatch only the units the user confirms.
6. **Hold.**
   For each confirmed unit, before its session starts:
   - Add its record with [Add Planning Record](commands.md#add-planning-record), named as the `unit` line gives it, and commit and push the engineering worktree.
   - Run [Reserve Row](commands.md#reserve-row) for the unit's tasks and [Patch Body](commands.md#patch-body) with the body it writes.
   - Set each task issue of the unit, where one exists, to In Progress with [Set Item Status](commands.md#set-item-status), and its epic with it.
7. **Dispatch.**
   For each held unit:
   - [Create Task Worktree](commands.md#create-task-worktree), and write the [brief](#brief) to a file in that worktree.
   - Start the unit's session with the sub-agent dispatch of the session this mode was called from.
   - The sub-agent works in the unit's worktree, reads the brief, and has the engineering worktree in reach for the planning record.
   - The session is left running.
8. **Report.**
   Each unit dispatched, with its record, branch, worktree and the session started for it; each row left held; each blocked row and what blocks it.

## Brief

What the prompt tells one session, written from the facts the `unit` line and the epic carry.

- **The work.**
  The epic's issue URL, the unit's task ids, their Descriptions, the acceptance criteria its Coverage names, the branch, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines, and the epic base its pull request targets.
- **The record.**
  The reserved folder, which is where its planning artifacts go.
- **Plan.**
  Invoke the work-planner skill, and write one [work item](work-breakdown.md#work-item) per task into the record, with any further file the work needs, as the [planning layout](planning-layout.md) describes. Commit and push the engineering worktree.
- **Point the row at the artifacts.**
  Run [Record Work Item](commands.md#record-work-item) for each task and [Patch Body](commands.md#patch-body) with the body it writes.
- **Match the tests to the criteria.**
  The work item's test row names a test for each criterion the unit's Coverage carries, of the kind that criterion can be observed by, as this mode's Tests rule states.
- **Implement.**
  Deliver the work in the worktree, with every test the work item names, as the [Work Breakdown Guide](work-breakdown.md#tables) states.
- **Open the pull request.**
  Title it for the epic and body it from the [pull request template](../templates/pull-request.md), filling the Test Plan table as this mode's Tests rule states, targeting the epic base, as the [Work Breakdown Guide](work-breakdown.md#delivery) states. Then run [Sync Epic](commands.md#sync-epic) for the unit's tasks and [Patch Body](commands.md#patch-body).
- **Move task issue to review.**
  When every item in the pull request's test plan is closed out, set the unit's task issue, where one exists, to In Review on the board with [Set Item Status](commands.md#set-item-status).
- **Hoist arising issues.**
  Create each issue that arose during delivery as a standalone issue with [Create Issue](commands.md#create-issue), with no agent-engineering prefix. Then run [Hoist Mode](hoist-mode.md) for each such issue, prompting the user for its placement across open initiatives and epics.
- **Stop there.**
  Merging the pull request is the user's call.

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
- **Tests.**
  - Every criterion the unit's Coverage names has a test in the work item that observes it, and the pull request carries that test.
  - What the criterion observes picks the kind: a unit test for one component's behaviour, an integration test for the seam between components, an end-to-end or system test for behaviour only a running system shows. A criterion about a run is not met by a check on a file.
  - A criterion whose instrument does not exist yet is work the task carries, as the [Verified](review-criteria.md#verified) rule defines.
  - A criterion no test can observe is named in the coverage report, as [Coverage Reports](work-breakdown.md#coverage-reports) defines.
  - The project's own system test is the instrument where the criterion is something that test can exercise.
  - The pull request's Test Plan table has one row for each test plan item, in that item's order. Criteria names the parent epic's acceptance criteria that item observes, by id, several as `AC1, AC3`, and is empty when the item observes none. Every criterion the unit's Coverage names appears in at least one row. A criterion that Coverage names and no item observes is a following row whose Test cell is empty.
- **Release is the user's call.**
  A held row is released only on the user's word. This mode reads no clock and reclaims nothing on its own.
- **Dispatch is confirmed.**
  No session starts until the user confirms the set of units.
- **Status.**
  This mode sets a dispatched unit's task issue and its epic to In Progress. When a unit completes and every item in its pull request's test plan is closed out, its task issue, where one exists, is set to In Review. The queue stays [Advance Mode](advance-mode.md)'s.
- **Arising issues.**
  Issues arising from the delivery of a single work item are raised as standalone issues and hoisted through [Hoist Mode](hoist-mode.md) once the pull request is open and the epic synced.
