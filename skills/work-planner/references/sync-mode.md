# Sync mode

Records work on an initiative, its epics and their task issues: links each task that has a pull request to that pull request, open or merged, ticks the criteria that now hold, ticks Done on each complete row, closes what is complete, and brings the initiative's project board up to date.

## Procedure

1. **Select.**
   - Select an initiative with its open epics, or the epics the user names.
   - Run [review mode](review-mode.md) first on any issue whose format [Check format](commands.md#check-format) rejects, since sync mode reads the agent-engineering table.
2. **Fetch.**
   - [Fetch issue](commands.md#fetch-issue) for each issue, including each task issue titled `[I07:E00:Wzz]` under an epic being synced.
   - [Fetch initiative pull requests](commands.md#fetch-initiative-pull-requests) for the pull requests that name the initiative.
3. **Unnamed deliveries.**
   - When the user says work has landed but no pull request names its epic, find the pull request and confirm it with the user.
   - Give it the epic's reference, `[I07:E00] Purpose`, with [Retitle pull request](commands.md#retitle-pull-request).
   - Run [Fetch initiative pull requests](commands.md#fetch-initiative-pull-requests) again.
4. **Match pull requests to tasks.**
   - Run [Match pull requests](commands.md#match-pull-requests) for each epic.
   - **Unmatched.**  A merged pull request it reports names the epic, and no row links it yet.
   - **In flight.**  An open pull request it reports names the epic, and no row links it yet.
   - Read its changes and description against the tasks' Descriptions, and name the tasks it works on: one task, or tasks that name each other in Joins.
   - Put any match that is not clear to the user.
5. **Sync each task issue.**
   - Run [Sync task issue](commands.md#sync-task-issue) when a merged pull request delivered it.
   - Verify and tick its criteria as in steps 7–8.
   - Record the pull request on it with [Comment on issue](commands.md#comment-on-issue): `Delivered by #950.`
   - [Close as completed](commands.md#close-as-completed) when it reports closable.
6. **Sync each epic.**
   Run [Sync epic](commands.md#sync-epic), linking every match from step 4, open or merged, with the task issues. It reports:
   - **conflict.**
     A row linked to a pull request whose title names another epic, or tasks sharing a pull request that do not name each other in Joins. Put it to the user.
   - **unmatched.**  Merged pull requests still linked from no row. Match them as in step 4.
   - **in flight.**  Open pull requests still linked from no row. Match them as in step 4.
   - **uncited.**
     A linked pull request whose task has its own issue, and whose body does not cite that issue. Cite the issue by its URL with [Patch pull request body](commands.md#patch-pull-request-body), then [Fetch initiative pull requests](commands.md#fetch-initiative-pull-requests) again.
   - **note.**  A row links its task issue. Link the pull request as in step 4.
   - **open questions.**
     Work on the epic has started while its Open questions section remains. Stop and ready the epic in [plan mode](plan-mode.md), since the answers may reshape it.
   - **ready to verify.**  Criteria whose delivering rows are all delivered.
   - **ticked early.**
     Criteria ticked while a delivering row is not delivered. Untick them, or link the missing delivery.
   Link what those lines name, then run it again. Sync of the epic is finished when unmatched, in flight, uncited and note are clear, apart from a pull request the user leaves unmatched.
7. **Verify.**
   - Verify each criterion ready to verify on the branch the pull requests merged into, with the instrument the criterion names or implies: run the test, guard or command, or read the code at the file and line it concerns.
   - A criterion that cannot be confirmed stays unticked and is reported with what is missing.
8. **Tick.**
   Tick the confirmed criteria with [Tick criteria](commands.md#tick-criteria). It ticks Done as the [Work Breakdown guide](work-breakdown.md#tables) defines.
   Link each further pull request on a task that stays unticked, as in step 6.
9. **Patch.**
   Patch each changed body from its `--fix` file with [Patch body](commands.md#patch-body).
10. **Close.**
    [Close as completed](commands.md#close-as-completed) each epic the re-run reports closable.
11. **Sync the initiative.**
    - Run [Sync initiative](commands.md#sync-initiative), with the epic JSON fetched after closing and the pull requests from [Fetch initiative pull requests](commands.md#fetch-initiative-pull-requests). An epic row is delivered when its issue is closed as completed, and Done is ticked on it as the [Work Breakdown guide](work-breakdown.md#tables) defines.
    - It lists each criterion whose citing epics are all delivered as ready to verify. Run the automated test each names, and tick those that pass with [Tick criteria](commands.md#tick-criteria).
    - Put each criterion that names no automated test to the user, who confirms it and ticks it.
    - [Patch body](commands.md#patch-body) the initiative from its `--fix` file when a tick changed it, so the board sync reads every criterion ticked.
    - When it reports an integration branch unmerged, open that pull request with [Open integration pull request](commands.md#open-integration-pull-request) and leave the initiative open.
    - [Close as completed](commands.md#close-as-completed) the initiative when it reports closable, as the [Work Breakdown guide](work-breakdown.md#delivery) defines.
12. **Sync the board.**
    Sync it after the issues are patched and any closable issue is closed, fetching the issues again first. An open initiative whose criteria are all ticked is In Review.
    - **Find it.**
      - The board is the initiative's theme board, per SKILL.md's [Themes and boards](../SKILL.md#themes-and-boards): run [Find theme board](commands.md#find-theme-board) with its theme.
      - When no open board carries that theme, ask the user to create it, and sync the board once it exists.
    - **Plan.**
      - Run [Fetch board fields](commands.md#fetch-board-fields) and [Find Status field](commands.md#find-status-field), then [Fetch board items with Status](commands.md#fetch-board-items-with-status).
      - Run [Plan board changes](commands.md#plan-board-changes) with the user from [Find user](commands.md#find-user), which prints the call for each board and assignee change.
    - **Write.**
      - Run each call it prints.
      - Fetch the issues and items again and re-run: that re-read confirms every write, and the board is current when it reports nothing to do.
      - An issue added in one pass gets its Status in the next.
13. **Report.**
    Report per issue: tasks linked, criteria ticked, rows marked done, criteria left unticked and why, conflicts, what was closed, and each board and assignee change.

