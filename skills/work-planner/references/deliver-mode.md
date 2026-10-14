# Deliver mode

Starts the work a theme board makes available. It advances the board, merges each open pull request its test plan and its task issues let through, holds each available unit with a planning record and the issue its row carries, and dispatches one session per unit to plan, implement, open its pull request, merge it once its criteria are verified, hoist arising issues, and defer the technical debt its validation finds.

## Prerequisites

Command operations use the [Command Conventions](../SKILL.md#command-conventions), read before the first spec.

Before matching pull requests or syncing epics, read [Delivery State](commands.md#delivery-state).

## Procedure

1. **Select.** Select the board as [Select](board.md#select) states.
2. **Advance.**
   Run [Advance Mode](advance-mode.md) for the board, so the epics that are Ready and In Progress are the ones the queue decides.
3. **Fetch.**
   Read the board as [Read](board.md#read) states.
   - [Fetch Board Fields](commands.md#fetch-board-fields).
   - [Find User](commands.md#find-user) for the assignee.
4. **Survey.**
   The long-lived branches are as the [Work Breakdown Guide](work-breakdown.md#delivery) defines. List each epic's bases with [List Epic Bases](commands.md#list-epic-bases), then run [Find Available Work](#find-available-work) with those names and `--project` set to a checkout of the project. Give an issue it reports unresolved with `--others`, and run it again.
   - **Held work.**
     Put each `hold` line to the user as an [Interview](interview.md) before any unit is dispatched, with the record it links and whether a session is still running. The user releases it or leaves it. A released row goes through [Release Row](#release-row) and [Patch Body](commands.md#patch-body), and the command runs again.
   - **Blocked work.**
     A `blocked` line is reported, not asked. Its dependencies decide when it becomes available.
5. **Merge.**
   Follow [Task Merge](work-breakdown.md#task-merge) for each `merge` line. A `blocked merge` line names a criterion to verify: take it through that procedure's Verify step, then run the command again.
   - An epic those merges complete has its review pull request marked ready, as [Review pull request](work-breakdown.md#review-pull-request) states, and goes to In Review with [Set Dispatch Status](#set-dispatch-status).
6. **Confirm.**
   Show each `unit` line, with its tasks, coverage, record folder, branch, base and worktree, and confirm the set as an [Interview](interview.md). Dispatch only the units the user confirms.
7. **Hold.**
   For each confirmed unit, before its session starts:
   - Add its record with [Add Planning Record](commands.md#add-planning-record), named as the `unit` line gives it, and commit and push the engineering worktree.
   - Run [Reserve Row](#reserve-row) for the unit's tasks and [Patch Body](commands.md#patch-body) with the body it writes.
   - Raise the issue for each task of the unit with [Raise Task Issue](#raise-task-issue). A row that already carries one keeps it.
   - Set each task issue of the unit to In Progress with [Set Dispatch Status](#set-dispatch-status), and its epic with it.
8. **Dispatch.**
   For each held unit:
   - [Create Task Worktree](#create-task-worktree), and write the [brief](#brief) to a file in that worktree.
   - Start the unit's session with the sub-agent dispatch of the session this mode was called from.
   - The sub-agent works in the unit's worktree, reads the brief, and has the engineering worktree in reach for the planning record.
   - The session is left running.
9. **Report.**
   Each pull request merged, and each left open by a conflict or by an unverified criterion; each review pull request updated, and each marked ready with the epic it set In Review; each unit dispatched, with its record, issue, branch, worktree and the session started for it; each row left held; each blocked row and what blocks it.

## Reference

### Brief

What the prompt tells one session, written from the facts the `unit` line and the epic carry.

- **The work.**
  The epic's issue URL, the unit's task ids, their Descriptions, the acceptance criteria its Coverage names, the branch, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines, and the epic base its pull request targets.
- **The record.**
  The reserved folder, which is where its planning artifacts go.
- **The issue.**
  Each task issue the Hold step raised, whose criteria gate the unit's merge.
- **Plan.**
  Invoke the work-planner skill, and write one [work item](work-breakdown.md#work-item) per task into the record, from the row's [task plan](work-breakdown.md#task-plan), with any further file the work needs, as the [planning layout](planning-layout.md) describes. The criteria stay on the task issue, which is where they are ticked. Commit and push the engineering worktree.
- **Link the work items.**
  Link each work-item file from the record's README under [Planning README](planning-readme.md). The row retains its folder link while reserved.
- **Match the tests to the criteria.**
  The work item's test row names a test for each criterion the unit's Coverage carries, of the kind that criterion can be observed by, as [Test Coverage](work-breakdown.md#test-coverage) states.
- **Implement.**
  Deliver the work in the worktree, with every test the work item names, as the [Work Breakdown Guide](work-breakdown.md#tables) states.
- **Open the pull request.**
  Open it with [Open Task Pull Request](#open-task-pull-request), which titles it for the epic, targets the epic base, fills the Test Plan table as [Test Coverage](work-breakdown.md#test-coverage) states, and links each task issue the unit delivers. Then run [Sync Epic](commands.md#sync-epic) for the unit's tasks and [Patch Body](commands.md#patch-body).
  - The link is what the merge gate reads, so a unit whose pull request links none of its task issues does not merge.
- **Merge.**
  Record check results with [Patch Pull Request Body](understand-mode.md#patch-pull-request-body), following [Test Plan](work-breakdown.md#test-plan), then follow [Task Merge](work-breakdown.md#task-merge), which verifies and ticks the criteria of each task issue the unit delivers before the merge.
- **Defer the technical debt the validation found.**
  Classify each item as this mode's Technical debt rule states and confirm it with the user. A deferred item is created as a standalone issue with [Create Issue](commands.md#create-issue) and hoisted with [Hoist Mode](hoist-mode.md), its placement a new task in this initiative's [deferred-debt epic](work-breakdown.md#deferred-debt).
- **Hoist arising issues.**
  Create each issue that arose during delivery as a standalone issue with [Create Issue](commands.md#create-issue), with no agent-engineering prefix. Then run [Hoist Mode](hoist-mode.md) for each such issue, prompting the user for its placement across open initiatives and epics.

## Rules

- **The calling session dispatches.**
  The agent running this mode starts each unit through the sub-agent dispatch of the session it was called from, and that dispatch is the only way a unit's session starts.
  - When that session provides no sub-agent dispatch, this mode reports that and stops before any unit begins.
- **The hold precedes the session.**
  A unit's record exists, its row carries that record's link, its issue is raised, and the body is patched, before its session starts. A session is never dispatched for a row another one holds.
- **One issue per row, raised at dispatch.**
  A dispatched row carries an issue, and a row waiting in an epic's Work Breakdown carries none, so the board holds an issue for the work in flight. A row that already carries one — hoisted onto the epic, or raised by an earlier dispatch — takes that issue, and no second is raised.
- **The task's criteria gate its merge.**
  A unit's pull request merges when the criteria of the issues its rows carry are verified and ticked, as [Task Merge](work-breakdown.md#task-merge) states. They are verifiable while that pull request is open, since its evidence is what the pull request and the record carry.
- **The hold stands until the pull request.**
  A held row stays held while its session plans and implements. [Sync Epic](commands.md#sync-epic) replaces the record's link with the pull request's, which frees the row.
- **One unit, one session.**
  A unit is a task row, or the tasks that name each other in Joins, as the [Work Breakdown Guide](work-breakdown.md#tables) defines. One unit is one pull request's work.
- **Task branches.**
  A unit works on the branch [Find Available Work](#find-available-work) names, cut from the epic base, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- **Release is the user's call.**
  A held row is released only on the user's word. This mode reads no clock and reclaims nothing on its own.
- **Dispatch is confirmed.**
  No session starts until the user confirms the set of units.
- **Status.**
  This mode sets a dispatched unit's task issue and its epic to In Progress, and an epic whose review pull request it marks ready to In Review. The queue stays [Advance Mode](advance-mode.md)'s.
- **Arising issues.**
  Issues arising from the delivery of a single work item are raised as standalone issues and hoisted through [Hoist Mode](hoist-mode.md) once the pull request is open and the epic synced.
- **Technical debt the validation finds.**
  Technical debt a unit finds while validating its work — running its tests, auditing the definitions it changed, reviewing its pull request — is classified, and the classification decides where it is fixed:
  - **Blocking.**
    The unit's own criteria cannot be verified without it, so the unit fixes it, whatever its size.
  - **Trivial.**  It blocks nothing and needs no work item of its own, so the unit fixes it.
  - **Non-trivial.**
    It blocks nothing and would warrant a work item of its own. The unit defers it to this initiative's [deferred-debt epic](work-breakdown.md#deferred-debt), and the epic in hand keeps the scope it was planned with.
  - The session classifies each item and puts it to the user as an [Interview](interview.md), its classification the recommended answer, before the fix or the deferral.

## Commands

### Set Dispatch Status

Renders the Status calls a dispatch settles, and refuses one it does not own.

- `--progress` names each task issue a held unit carries and its epic. `--review` names each epic whose review pull request was marked ready.
- `--items` is [Fetch Board Items with Status](sync-mode.md#fetch-board-items-with-status), `--fields` [Fetch Board Fields](commands.md#fetch-board-fields), and `--assignee` the user [Find User](commands.md#find-user) prints.
- The calls go through the same component sync and advance write with, in the dispatch jurisdiction: any Status but In Progress and In Review, a task set In Review, and a removal are refused. A board lacking In Review takes In Progress.
- Run each call it prints, then confirm it with [Fetch Board Item](sync-mode.md#fetch-board-item), as [Sync Mode](sync-mode.md) does, since the item list lags a write.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deliver.py --items items.json --board users/{owner}/projectsV2/9 --fields fields.json --out board/ --assignee m2ux --progress 637,943 --review 944
```

### Raise Task Issue

Raises the issue one dispatched row carries, from the criteria its task plan states.

- Run it in the Hold step, from the row's [task plan](work-breakdown.md#task-plan) in its initiative's planning record, which planning wrote and which is why the criteria exist before the session starts. A row that already carries an issue takes that one, and none is raised.
- The title is the row's `[I07:E00:W01]` prefix, the name and the subtitle the [Formatting Scheme](../SKILL.md#formatting-scheme) gives it, drawn from the row's Description.
- The labels are `type:task` and any of `enhancement`, `bug` and `tech-debt` the row's work calls for.
- The body is drafted from the [task template](../templates/task.md): its Overview, Problem, Proposal and Acceptance Criteria are the task plan's, the criteria numbered `AC1` upward.
- A row with no task plan, or one stating no criteria, is undispatchable. [Align Mode](align-mode.md) writes them.

```bash
gh api --method POST repos/{owner}/{repo}/issues -f title='[I07:E00:W01] Queue Plan: The Order a Run Dispatches In' -F body=@w01-issue.md -f 'labels[]=type:task' --jq .number
```

### Open Task Pull Request

Opens the pull request that delivers a unit's work into its epic base.

- Run it in the unit's worktree once the work is pushed, as [Deliver Mode](deliver-mode.md#brief) states.
- The title is the epic's prefix and the unit's purpose: `[I07:E00] Purpose`.
- The head is the unit's task branch and the base is the epic base it was cut from, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
- The body is drafted from the [pull request template](../templates/pull-request.md), with its Test Plan filled as [Test Coverage](work-breakdown.md#test-coverage) specifies.
- [Link Pull Request to Issue](sync-mode.md#link-pull-request-to-issue) links each task issue the unit delivers once it is open, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Issue links. A unit whose tasks carry no issue of their own links nothing.

```bash
gh api --method POST repos/{owner}/{repo}/pulls -f title='[I07:E00] Purpose' -f head='i07/e00/w01-queue-plan' -f base='i07/e00/main' -F body=@body.md --jq .html_url
```

### Reserve Row

Holds each named task row for one session, by setting its record folder as the row's single link.

- It refuses a row already held, and one whose id links a pull request or a commit.
- `--records` is the URL of the planning records folder, needed when no row id in the epic links a record.
- The folder is the one [Find Available Work](#find-available-work) names, and `--date` is the day it is opened.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deliver.py --epic issue-943.json --reserve W01,W02 --records https://github.com/{owner}/{repo}/tree/engineering/artifacts/planning --fix fixed-943.md
```

### Release Row

Frees each named task row, by replacing the planning-folder link with its work-item file link.

- It refuses a row that no session holds.
- The file is the task id in lowercase within that folder, as [Task ids](work-breakdown.md#task-delivery) defines.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deliver.py --epic issue-943.json --release W01 --fix fixed-943.md
```

### Create Task Worktree

Cuts the worktree and branch one unit's session works in, from the epic's base branch.

- The worktree, the branch and the base are the ones [Find Available Work](#find-available-work) names, with the branch following the [Work Breakdown Guide](work-breakdown.md#delivery).
- When the unit line names several bases, cut from the one for the long-lived branch the unit changes.
- Run it in the checkout of the repository the work changes.

```bash
git fetch origin i07/e00/main && git worktree add .worktrees/i07-e00-w01 -b i07/e00/w01-queue-plan origin/i07/e00/main
```

### Find Available Work

Reports each unit of work a theme board makes available, each row a session holds, and each row its dependencies block.

- The rules are this mode's [Rules](#rules).
- `--items` is [Fetch Board Items with Status](sync-mode.md#fetch-board-items-with-status). `--prs` is [Fetch All Initiative Pull Requests](board.md#fetch-all-initiative-pull-requests), and carries `--links`, the file [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links) writes for them, which is where the task issues a pull request links are read.
- Give an issue it reports unresolved with `--others`.
- `--project` is a checkout of the project, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines. A base whose last segment is not one of those names is ignored.
- `--bases` is the list [List Epic Bases](commands.md#list-epic-bases) prints for the board's epics, comma-separated.
- A `unit` line names the tasks of one session's work, their coverage, and the record folder, branch, base and worktree their ids and Description give them. One base is `base i07/e00/main`. Several are `bases i07/e00/main i07/e00/workflows`.
- A `hold` line names a row a session holds, and the record it links.
- A `blocked` line names a free row whose dependencies are undelivered, or whose joined task is unavailable.
- A `merge` line names an open pull request whose test plan has passed and whose task issues carry every criterion ticked, and the epic base it targets. This mode merges it on the run.
- A `blocked merge` line names one whose test plan has passed while its task issues withhold it, naming each unticked criterion and the issue carrying it, or saying the pull request links no task issue.
- `--date` opens the records on another day than today.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/deliver.py --items items.json --prs prs.json --links links.json --project <checkout> --bases i07/e00/main,i07/e00/workflows
```
