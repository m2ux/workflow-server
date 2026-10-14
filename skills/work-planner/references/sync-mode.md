# Sync Mode

Records work on an initiative, its epics and their task issues: links each task that has a pull request to that pull request, open or merged, ticks the criteria that now hold, ticks Done on each complete row, closes what is complete, and brings the initiative's project board up to date.

## Prerequisites

Command operations use the [Command Conventions](../SKILL.md#command-conventions), read before the first spec.

Before matching pull requests or syncing epics, read [Delivery State](commands.md#delivery-state).

## Procedure

1. **Select.**
   - Select an initiative with its open epics, or the epics the user names.
   - Resolve an epic's Open Questions through [Plan Mode](plan-mode.md) before syncing it.
   - Run [Align Mode](align-mode.md) first on any issue whose format [Check Format](commands.md#check-format) rejects, since sync mode reads the agent-engineering table.
2. **Fetch.**
   - [Fetch Issue](commands.md#fetch-issue) for each issue, including each task issue titled `[I07:E00:Wzz]` under an epic being synced.
   - [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) for the pull requests that name the initiative, then [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links) for the issue each one links.
   - Confirm the repository prerequisite in [Issue closure](work-breakdown.md#issue-closure). Capture each issue's Development links and fetch linked pull requests absent from the initiative list before evaluating closure.
3. **Unnamed deliveries.**
   - When the user says work has landed but no pull request names its epic, find the pull request and confirm it with the user.
   - Give it the epic's reference, `[I07:E00] Purpose`, with [Retitle Pull Request](#retitle-pull-request).
   - Run [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) and [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links) again.
4. **Match pull requests to tasks.**
   - Run [Match Pull Requests](#match-pull-requests) for each epic.
   - **Unmatched.**  A merged pull request it reports names the epic, and no row links it yet.
   - **In flight.**  An open pull request it reports names the epic, and no row links it yet.
   - Read its changes and description against the tasks' Descriptions, and name the tasks it works on: one task, or tasks that name each other in Joins.
   - Put any match that is not clear to the user as an [Interview](interview.md).
5. **Sync each task issue.**
   - Run [Sync Task Issue](commands.md#sync-task-issue) with the pull request that delivers it, open or merged.
   - Verify and tick its criteria as in steps 7–8. An open pull request's evidence is what it and its planning record carry, and ticking those criteria is what lets it merge, as [Task Merge](work-breakdown.md#task-merge) states.
   - Record the pull request on it once it has merged, with [Comment on Issue](commands.md#comment-on-issue): `Delivered by #950.`
   - [Close as Completed](commands.md#close-as-completed) when it reports closable, which waits on the merge.
6. **Sync each epic.**
   Run [Sync Epic](commands.md#sync-epic), linking every match from step 4, open or merged, with the task issues. Linking a pull request replaces the planning-record link on that task, as [Task ids](work-breakdown.md#task-delivery) defines. It reports:
   - **Conflict.**
     Tasks that share a pull request and do not name each other in Joins. Put that to the user as an [Interview](interview.md). A row linked to a pull request whose title names another epic is reported, and the row is delivered once that pull request has merged.
   - **Unmatched.**  Merged pull requests still linked from no row. Match them as in step 4.
   - **In flight.**  Open pull requests still linked from no row. Match them as in step 4.
     - A pull request whose head is an epic base is not matched to a task, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
   - **Draft.**
     An epic base a merged task targets that has no pull request merging it, while a task is undelivered or a criterion is unticked. Open it as a draft, as [Review pull request](work-breakdown.md#review-pull-request) states.
   - **Unmerged.**
     An epic base its pull requests target that has not merged into its long-lived branch, once every task is delivered and every criterion is ticked. The Close step follows [Review pull request](work-breakdown.md#review-pull-request) and [Epic merge](work-breakdown.md#epic-merge).
   - **References.**
     A review pull request citing a set of pull requests that differs from the task pull requests merged into its base. Bring the body up to the merges with [Update Review Pull Request](#update-review-pull-request), as [Review pull request](work-breakdown.md#review-pull-request) states.
   - **Uncited.**
     A linked pull request that does not link its task's issue, or the review pull request where it does not link the epic's issue. Set the link with [Link Pull Request to Issue](#link-pull-request-to-issue), then [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links) again.
   - **Note.**  A row links its task issue. Link the pull request as in step 4.
   - **Unplaced.**
     A task issue of this epic whose id is not a row. [Plan Mode](plan-mode.md) adds the row, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines, then this sync is run again.
   - **Open questions.**
     The epic's Open Questions section remains. This mode's Open questions rule says what follows.
   - **Ready to verify.**  Criteria whose delivering rows are all delivered.
   - **Ticked early.**
     Criteria ticked while a delivering row is not delivered. Untick them, or link the missing delivery.
   - **Disagreement.**
     A linked pull request's test plan against the Coverage of the rows it delivers, as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Test plan.
   Link what those lines name, then run it again. Sync of the epic is finished when unmatched, in flight, uncited, note and unplaced are clear, apart from a pull request the user leaves unmatched.
7. **Verify.**
   - Verify each criterion ready to verify on the branch the pull requests merged into, with the instrument the criterion names. What counts as coverage is [Coverage Reports](work-breakdown.md#coverage-reports).
   - A criterion that cannot be confirmed stays unticked, with what is missing. The further task that adopts it is [Align Mode](align-mode.md)'s Gap rule.
8. **Tick.**
   Tick the confirmed criteria with [Tick Criteria](#tick-criteria). It ticks Done as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
9. **Patch.**
   Patch each changed body from its `--fix` file with [Patch Body](commands.md#patch-body).
10. **Close.**
    - When [Sync Epic](commands.md#sync-epic) reports an epic base unmerged, open it as [Review pull request](work-breakdown.md#review-pull-request) states where it names no open pull request, and mark a draft it names ready.
    - For each open epic pull request, follow [Epic merge](work-breakdown.md#epic-merge). Merge a ready pull request once its conditions hold, or report it ready for approval where [Approval](work-breakdown.md#approval) gives the merge to the reviewer.
    - Fetch the pull requests again after merging and re-run [Sync Epic](commands.md#sync-epic).
    - [Close as Completed](commands.md#close-as-completed) each epic the re-run reports closable.
11. **Sync the initiative.**
    - Run [Sync Initiative](commands.md#sync-initiative), with the epic JSON fetched after closing. An epic row is delivered when its issue is closed as completed, and Done is ticked on it as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
    - It lists each criterion whose citing epics are all delivered as ready to verify. Verify each as step 7 does, and tick those that pass with [Tick Criteria](#tick-criteria).
    - [Patch Body](commands.md#patch-body) the initiative from its `--fix` file when a tick changed it, so the board sync reads every criterion ticked.
    - [Close as Completed](commands.md#close-as-completed) the initiative when it reports closable, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
12. **Sync the board.**
    Sync it after the issues are patched and any closable issue is closed, fetching the issues again first. An open initiative or epic is set In Review as this mode's In Review rule states.
    - **Find it.**
      - The board is the initiative's theme board, per SKILL.md's [Themes and Boards](../SKILL.md#themes-and-boards): run [Find Theme Board](#find-theme-board) with its theme.
      - When no open board carries that theme, create it with [Create Board](#create-board), titled as [Themes and Boards](../SKILL.md#themes-and-boards) states, then sync it.
    - **Plan.**
      - Run [Fetch Board Fields](commands.md#fetch-board-fields) and [Find Status Field](#find-status-field), then [Fetch Board Items with Status](#fetch-board-items-with-status).
      - Run [Plan Board Changes](#plan-board-changes) with the user from [Find User](commands.md#find-user) and the issue links from [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links), which prints the call for each board and assignee change.
    - **Write.**
      - Run each call it prints.
      - Confirm each status write with [Fetch Board Item](#fetch-board-item). The item list lags a write, so a fresh list does not confirm it.
      - When the item still shows the previous status, run that write again and read the item again.
      - Fetch the issues and items again and re-run [Plan Board Changes](#plan-board-changes) to find anything not yet written. The board is current when that plan reports nothing to do and each confirmed item shows the status written.
      - An issue added in one pass gets its Status in the next.
13. **Explain each change entering review.**
    Run [Understand Mode](understand-mode.md) for each task and epic whose confirmed status in step 12 is In Review and whose previous status was not, against the pull request this mode's Overviews rule names. A reviewer meets the overview on the pull request it explains.
14. **Report.**
    When this mode was not reached from [Advance Mode](advance-mode.md), close the report with the queue as this mode's Queue rule states.
    Report per issue: tasks linked, criteria ticked, rows marked done, criteria left unticked and why, conflicts, test plan disagreements, what was closed, each board and assignee change, and each overview written. What the report names about criteria is [Coverage Reports](work-breakdown.md#coverage-reports). A test plan disagreement is reported as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Test plan.

## Rules

- **Queue.**
  This mode decides no queue, and leaves Ready and Backlog as [Advance Mode](advance-mode.md#rules)'s The queue rule states. A run this mode closes on its own reports the queue unevaluated and names [Advance Mode](advance-mode.md) as what decides it, and does not run it.
- **Open questions.**
  An epic is not synced while its Open Questions section remains. Ready it in [Plan Mode](plan-mode.md) first.
- **In Review.**
  An open initiative or epic whose criteria are all ticked is In Review.
- **Overviews.**
  - Select pull requests under [Understand Mode](understand-mode.md#rules)'s Grain rule.
  - An epic merging in the Close step gets its overview through [Epic merge](work-breakdown.md#epic-merge), before the board sync.
  - An issue already In Review when the sync began keeps the overview it has: the pull request it explains is the one already reviewed.

## Commands

### Retitle Pull Request

Replaces a pull request's title.

```bash
gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f title='[I07:E00] Purpose' --jq .title
```

### Fetch Board Item

Reads one board item, including its Status. The item list can lag a write. This read is what confirms a status just set.

```bash
gh api "users/{owner}/projectsV2/9/items/1001?fields=419167630"
```

### Match Pull Requests

Reports an epic's delivery state against the pull requests that name it.

- Interpret results using [Delivery State](commands.md#delivery-state).

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --links links.json
```

### Tick Criteria

Ticks confirmed criteria on an epic or an initiative, refusing any not ready to verify, and ticks Done on a row once it is complete.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-943.json --prs prs.json --links links.json --tick AC1,AC3 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/sync.py issue-936.json --epics issue-943.json issue-937.json --tick AC2 --fix fixed-936.md
```

### Find Theme Board

Prints the number of the open board for one theme, by the theme's name that opens its title.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title | startswith("Canon: ")) | .number'
```

### Create Board

Copies the Initiative Template into a new open board, links the copy to the repository, and prints the new board's number.

- The template is the open board titled `Initiative Template`. The copy carries its Status options: Backlog, Ready, In Progress, In Review and Done.
- The title is the new board's title: a theme board's title from [Themes and Boards](../SKILL.md#themes-and-boards).
- The copy's JSON is one project, and `.number` is the new board.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title == "Initiative Template") | .number'
gh project copy 1 --source-owner {owner} --target-owner {owner} --title 'Canon: Definitions Checked Against the Design Canon' --format json --jq .number
gh project link 13 --owner {owner} --repo {repo}
```

### Find Status Field

Prints the id of a board's Status field.

```bash
gh api --paginate "users/{owner}/projectsV2/9/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
```

### Fetch Board Items with Status

Saves a board's items with their Status, each carrying its issue whole.

```bash
gh api --paginate "users/{owner}/projectsV2/9/items?per_page=100&fields=419167630" > items.json
```

### Update Review Pull Request

Adds a merged task pull request's change to the review pull request that merges the epic base it landed in.

- Run it after [Sync Epic](commands.md#sync-epic), on the session that merged, as the [Work Breakdown Guide](work-breakdown.md#review-pull-request) states.
- The first call prints the review pull request's number, by the epic base as head. It prints nothing while no pull request merges that base, and the base opens as a draft first.
- The second writes the current body to a file. The unit's change goes under Changes, beneath the heading for its area or a new one, and its pull request is appended to References as the next R number.
- The third replaces the body with that file.

```bash
gh api "repos/{owner}/{repo}/pulls?state=open&head={owner}:i07/e00/main" --jq '.[0].number'
gh api repos/{owner}/{repo}/pulls/980 --jq .body > review-980.md
gh api --method PATCH repos/{owner}/{repo}/pulls/980 -F body=@review-980.md --jq .html_url
```

### Link Pull Request to Issue

Sets the [Issue links](work-breakdown.md#delivery) relation through [Development Access](commands.md#development-access).

- Open the issue's Development selector, select the pull request's repository and pull request, and verify the saved link.
- Refresh [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links) after the edit.

### Plan Board Changes

Derives each issue's Status and assignees, and prints the call for each issue to add, item to remove, Status to set and assignee to add or remove.

- Give an issue it reports unresolved with `--others`.
- `--assignee` is the user [Find User](commands.md#find-user) prints.
- `--links` is the file [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links) writes for those pull requests, and is where the issue a pull request delivers is read. A call without it is refused.
- An open initiative or epic whose criteria are all ticked is In Review. An epic with an open pull request and a criterion unticked is In Progress.
- An initiative or an epic with no open pull request and unticked criteria keeps Ready or Backlog, and keeps In Progress when delivery has started. In Review then becomes In Progress. One not yet on the board is added at Backlog, or at In Progress when delivery has started. [Advance Mode](advance-mode.md#rules) sets the queue.

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/board.py issue-936.json --epics issue-943.json issue-937.json --tasks issue-637.json --prs prs.json --links links.json --board users/{owner}/projectsV2/9 --fields fields.json --items items.json --out board/ --assignee m2ux
```
