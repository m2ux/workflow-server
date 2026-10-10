# Sync Mode

Records work on an initiative, its epics and their task issues: links each task that has a pull request to that pull request, open or merged, ticks the criteria that now hold, ticks Done on each complete row, closes what is complete, and brings the initiative's project board up to date.

## Prerequisites

Command operations use the [command conventions](commands.md#conventions), read before the first spec.

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
   - Give it the epic's reference, `[I07:E00] Purpose`, with [Retitle Pull Request](commands.md#retitle-pull-request).
   - Run [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) and [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links) again.
4. **Match pull requests to tasks.**
   - Run [Match Pull Requests](commands.md#match-pull-requests) for each epic.
   - **Unmatched.**  A merged pull request it reports names the epic, and no row links it yet.
   - **In flight.**  An open pull request it reports names the epic, and no row links it yet.
   - Read its changes and description against the tasks' Descriptions, and name the tasks it works on: one task, or tasks that name each other in Joins.
   - Put any match that is not clear to the user as an [Interview](interview.md).
5. **Sync each task issue.**
   - Run [Sync Task Issue](commands.md#sync-task-issue) when a merged pull request delivered it.
   - Verify and tick its criteria as in steps 7–8.
   - Record the pull request on it with [Comment on Issue](commands.md#comment-on-issue): `Delivered by #950.`
   - [Close as Completed](commands.md#close-as-completed) when it reports closable.
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
     A review pull request citing a set of pull requests that differs from the task pull requests merged into its base. Bring the body up to the merges with [Update Review Pull Request](commands.md#update-review-pull-request), as [Review pull request](work-breakdown.md#review-pull-request) states.
   - **Uncited.**
     A linked pull request whose task has its own issue and does not link it, or the review pull request where it does not link the epic's issue. Set the link with [Link Pull Request to Issue](commands.md#link-pull-request-to-issue), then [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links) again.
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
   Tick the confirmed criteria with [Tick Criteria](commands.md#tick-criteria). It ticks Done as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
9. **Patch.**
   Patch each changed body from its `--fix` file with [Patch Body](commands.md#patch-body).
10. **Close.**
    - When [Sync Epic](commands.md#sync-epic) reports an epic base unmerged and names no open pull request, open it as [Review pull request](work-breakdown.md#review-pull-request) states.
    - For each open epic pull request, follow [Epic merge](work-breakdown.md#epic-merge). Report a draft waiting for the user; merge a ready pull request once its conditions hold.
    - Fetch the pull requests again after merging and re-run [Sync Epic](commands.md#sync-epic).
    - [Close as Completed](commands.md#close-as-completed) each epic the re-run reports closable.
11. **Sync the initiative.**
    - Run [Sync Initiative](commands.md#sync-initiative), with the epic JSON fetched after closing. An epic row is delivered when its issue is closed as completed, and Done is ticked on it as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
    - It lists each criterion whose citing epics are all delivered as ready to verify. Verify each as step 7 does, and tick those that pass with [Tick Criteria](commands.md#tick-criteria).
    - [Patch Body](commands.md#patch-body) the initiative from its `--fix` file when a tick changed it, so the board sync reads every criterion ticked.
    - [Close as Completed](commands.md#close-as-completed) the initiative when it reports closable, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
12. **Sync the board.**
    Sync it after the issues are patched and any closable issue is closed, fetching the issues again first. An open initiative or epic is set In Review as this mode's In Review rule states.
    - **Find it.**
      - The board is the initiative's theme board, per SKILL.md's [Themes and Boards](../SKILL.md#themes-and-boards): run [Find Theme Board](commands.md#find-theme-board) with its theme.
      - When no open board carries that theme, create it with [Create Board](commands.md#create-board), titled as [Themes and Boards](../SKILL.md#themes-and-boards) states, then sync it.
    - **Plan.**
      - Run [Fetch Board Fields](commands.md#fetch-board-fields) and [Find Status Field](commands.md#find-status-field), then [Fetch Board Items with Status](commands.md#fetch-board-items-with-status).
      - Run [Plan Board Changes](commands.md#plan-board-changes) with the user from [Find User](commands.md#find-user) and the issue links from [Fetch Pull Request Issue Links](commands.md#fetch-pull-request-issue-links), which prints the call for each board and assignee change.
    - **Write.**
      - Run each call it prints.
      - Confirm each status write with [Fetch Board Item](commands.md#fetch-board-item). The item list lags a write, so a fresh list does not confirm it.
      - When the item still shows the previous status, run that write again and read the item again.
      - Fetch the issues and items again and re-run [Plan Board Changes](commands.md#plan-board-changes) to find anything not yet written. The board is current when that plan reports nothing to do and each confirmed item shows the status written.
      - An issue added in one pass gets its Status in the next.
13. **Explain each change entering review.**
    Run [Understand Mode](understand-mode.md) for each task and epic whose confirmed status in step 12 is In Review and whose previous status was not, against the pull request this mode's Overviews rule names. A reviewer meets the overview on the pull request it explains.
14. **Report.**
    Report per issue: tasks linked, criteria ticked, rows marked done, criteria left unticked and why, conflicts, test plan disagreements, what was closed, each board and assignee change, and each overview written. What the report names about criteria is [Coverage Reports](work-breakdown.md#coverage-reports). A test plan disagreement is reported as the [Work Breakdown Guide](work-breakdown.md#delivery) states under Test plan.

## Rules

- **Open questions.**
  An epic is not synced while its Open Questions section remains. Ready it in [Plan Mode](plan-mode.md) first.
- **In Review.**
  An open initiative or epic whose criteria are all ticked is In Review.
- **Overviews.**
  - Select pull requests under [Understand Mode](understand-mode.md#rules)'s Grain rule.
  - An epic merging in the Close step gets its overview through [Epic merge](work-breakdown.md#epic-merge), before the board sync.
  - An issue already In Review when the sync began keeps the overview it has: the pull request it explains is the one already reviewed.
