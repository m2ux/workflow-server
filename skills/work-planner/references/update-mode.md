# Update mode

Records delivered work on an initiative, its epics and their task issues: links each delivered task to its pull request, ticks the criteria that now hold, closes what is complete, and brings the initiative's project board up to date.

## Procedure

1. **Select.**
   - Select an initiative with its open epics, or the epics the user names.
   - Run review mode first on any issue whose format [Check format](commands.md#check-format) rejects, since the update reads the agent-engineering table.
2. **Fetch.**
   - [Fetch issue](commands.md#fetch-issue) for each issue, including the task issues that epic row ids link.
   - [Fetch initiative pull requests](commands.md#fetch-initiative-pull-requests) for the pull requests that name the initiative.
3. **Unnamed deliveries.**
   - When the user says work has landed but no pull request names its epic, find the pull request and confirm it with the user.
   - Give it the epic's reference, `[I07:E00] Purpose`, with [Retitle pull request](commands.md#retitle-pull-request).
   - Run [Fetch initiative pull requests](commands.md#fetch-initiative-pull-requests) again.
4. **Match pull requests to tasks.**
   - Run [Match pull requests](commands.md#match-pull-requests) for each epic. Each merged pull request it reports as **unmatched** names the epic but no row links it yet.
   - Read its changes and description against the tasks' Descriptions, and name the tasks it delivered: one task, or tasks that Join each other.
   - Put any match that is not clear to the user.
   - A pull request that delivered a task with its own issue belongs to that issue, in step 5.
5. **Update each task issue.**
   - Run [Update task issue](commands.md#update-task-issue), naming the pull request that delivered it.
   - Verify and tick its criteria as in steps 7–8.
   - Record the pull request on it with [Comment on issue](commands.md#comment-on-issue): `Delivered by #950.`
   - [Close as completed](commands.md#close-as-completed) when it reports closable.
6. **Update each epic.**
   Run [Update epic](commands.md#update-epic), linking the matches from step 4, with the task issues fetched after closing. It reports:
   - **conflict.**
     A row linked to a pull request whose title names another epic, or tasks sharing a pull request that do not Join each other. Put it to the user.
   - **unmatched.**
     Merged pull requests still linked from no row. Match them as in step 4; one that delivered a task issue stays unmatched here, since its issue records it.
   - **open questions.**
     Work on the epic has started while its Open questions section remains. Stop and ready the epic in plan mode, since the answers may reshape it.
   - **in flight.**  Open pull requests naming the epic.
   - **ready to verify.**  Criteria whose delivering rows are all delivered.
   - **ticked early.**
     Criteria ticked while a delivering row is not delivered. Untick them, or link the missing delivery.
7. **Verify.**
   - Verify each criterion ready to verify on the branch the pull requests merged into, with the instrument the criterion names or implies: run the test, guard or command, or read the code at the file and line it concerns.
   - A criterion that cannot be confirmed stays unticked and is reported with what is missing.
8. **Tick.**  Tick the confirmed criteria with [Tick criteria](commands.md#tick-criteria).
9. **Patch.**
   Patch each changed body from its `--fix` file with [Patch body](commands.md#patch-body).
10. **Close.**
    [Close as completed](commands.md#close-as-completed) each epic the re-run reports closable.
11. **Update the initiative.**
    - Run [Update initiative](commands.md#update-initiative), with the epic JSON fetched after closing. An epic row is delivered when its issue is closed as completed.
    - It lists each criterion whose citing epics are all delivered as ready to verify. Run the automated test each names, and tick those that pass with [Tick criteria](commands.md#tick-criteria).
    - Put each criterion that names no automated test to the user, who confirms it and ticks it.
    - [Close as completed](commands.md#close-as-completed) the initiative when it reports every criterion ticked.
    - Then run [Open integration pull request](commands.md#open-integration-pull-request) for each of its integration branches, which the user merges.
12. **Update the board.**
    Update it once every issue is patched and closed, fetching the issues again first.
    - **Find it.**
      - The board is the initiative's theme board, per SKILL.md's [Themes and boards](../SKILL.md#themes-and-boards): run [Find theme board](commands.md#find-theme-board) with its theme.
      - When no open board carries that theme, ask the user to create it, and update the board once it exists.
    - **Plan.**
      - Run [Fetch board fields](commands.md#fetch-board-fields) and [Find Status field](commands.md#find-status-field), then [Fetch board items with Status](commands.md#fetch-board-items-with-status).
      - Run [Plan board changes](commands.md#plan-board-changes) with the user from [Find user](commands.md#find-user), which prints the call for each board and assignee change.
    - **Write.**
      - Run each call it prints.
      - Fetch the issues and items again and re-run: that re-read confirms every write, and the board is current when it reports nothing to do.
      - An issue added in one pass gets its Status in the next.
13. **Report.**
    Report per issue: tasks linked, criteria ticked, criteria left unticked and why, conflicts, what was closed, and each board and assignee change.

