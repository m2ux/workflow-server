# Sync Mode

Records work on an initiative, its epics and their task issues: links each task that has a pull request to that pull request, open or merged, ticks the criteria that now hold, ticks Done on each complete row, closes what is complete, and brings the initiative's project board up to date.

## Procedure

1. **Select.**
   - Select an initiative with its open epics, or the epics the user names.
   - Run [Align Mode](align-mode.md) first on any issue whose format [Check Format](commands.md#check-format) rejects, since sync mode reads the agent-engineering table.
2. **Fetch.**
   - [Fetch Issue](commands.md#fetch-issue) for each issue, including each task issue titled `[I07:E00:Wzz]` under an epic being synced.
   - [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) for the pull requests that name the initiative.
3. **Unnamed deliveries.**
   - When the user says work has landed but no pull request names its epic, find the pull request and confirm it with the user.
   - Give it the epic's reference, `[I07:E00] Purpose`, with [Retitle Pull Request](commands.md#retitle-pull-request).
   - Run [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) again.
4. **Match pull requests to tasks.**
   - Run [Match Pull Requests](commands.md#match-pull-requests) for each epic.
   - **Unmatched.**  A merged pull request it reports names the epic, and no row links it yet.
   - **In flight.**  An open pull request it reports names the epic, and no row links it yet.
   - Read its changes and description against the tasks' Descriptions, and name the tasks it works on: one task, or tasks that name each other in Joins.
   - Put any match that is not clear to the user.
5. **Sync each task issue.**
   - Run [Sync Task Issue](commands.md#sync-task-issue) when a merged pull request delivered it.
   - Verify and tick its criteria as in steps 7–8.
   - Record the pull request on it with [Comment on Issue](commands.md#comment-on-issue): `Delivered by #950.`
   - [Close as Completed](commands.md#close-as-completed) when it reports closable.
6. **Sync each epic.**
   Run [Sync Epic](commands.md#sync-epic), linking every match from step 4, open or merged, with the task issues. Linking a pull request replaces the planning-record link on that task, as [Task ids](work-breakdown.md#delivery) defines. It reports:
   - **Conflict.**
     Tasks that share a pull request and do not name each other in Joins. Put that to the user. A row linked to a pull request whose title names another epic is reported, and the row is delivered once that pull request has merged.
   - **Unmatched.**  Merged pull requests still linked from no row. Match them as in step 4.
   - **In flight.**  Open pull requests still linked from no row. Match them as in step 4.
   - **Uncited.**
     A linked pull request whose task has its own issue, and whose body does not cite that issue. Cite the issue with [Patch Pull Request Body](commands.md#patch-pull-request-body), then [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests) again.
   - **Note.**  A row links its task issue. Link the pull request as in step 4.
   - **Open questions.**
     The epic's Open Questions section remains. This mode's Open questions rule says what follows.
   - **Ready to verify.**  Criteria whose delivering rows are all delivered.
   - **Ticked early.**
     Criteria ticked while a delivering row is not delivered. Untick them, or link the missing delivery.
   Link what those lines name, then run it again. Sync of the epic is finished when unmatched, in flight, uncited and note are clear, apart from a pull request the user leaves unmatched.
7. **Verify.**
   - Verify each criterion ready to verify on the branch the pull requests merged into, with the instrument the criterion names. What counts as coverage is [Coverage Reports](work-breakdown.md#coverage-reports).
   - A criterion that cannot be confirmed stays unticked, with what is missing. The further task that adopts it is [Align Mode](align-mode.md)'s Gap rule.
8. **Tick.**
   Tick the confirmed criteria with [Tick Criteria](commands.md#tick-criteria). It ticks Done as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
9. **Patch.**
   Patch each changed body from its `--fix` file with [Patch Body](commands.md#patch-body).
10. **Close.**
    [Close as Completed](commands.md#close-as-completed) each epic the re-run reports closable.
11. **Sync the initiative.**
    - Run [Sync Initiative](commands.md#sync-initiative), with the epic JSON fetched after closing and the pull requests from [Fetch Initiative Pull Requests](commands.md#fetch-initiative-pull-requests). An epic row is delivered when its issue is closed as completed, and Done is ticked on it as the [Work Breakdown Guide](work-breakdown.md#tables) defines.
    - It lists each criterion whose citing epics are all delivered as ready to verify. Verify each as step 7 does, and tick those that pass with [Tick Criteria](commands.md#tick-criteria).
    - [Patch Body](commands.md#patch-body) the initiative from its `--fix` file when a tick changed it, so the board sync reads every criterion ticked.
    - When it reports an integration branch unmerged, open that pull request with [Open Integration Pull Request](commands.md#open-integration-pull-request) and leave the initiative open.
    - [Close as Completed](commands.md#close-as-completed) the initiative when it reports closable, as the [Work Breakdown Guide](work-breakdown.md#delivery) defines.
12. **Sync the board.**
    Sync it after the issues are patched and any closable issue is closed, fetching the issues again first. An open initiative or epic is set In Review as this mode's In Review rule states.
    - **Find it.**
      - The board is the initiative's theme board, per SKILL.md's [Themes and Boards](../SKILL.md#themes-and-boards): run [Find Theme Board](commands.md#find-theme-board) with its theme.
      - When no open board carries that theme, create it with [Create Board](commands.md#create-board), titled as [Themes and Boards](../SKILL.md#themes-and-boards) states, then sync it.
    - **Plan.**
      - Run [Fetch Board Fields](commands.md#fetch-board-fields) and [Find Status Field](commands.md#find-status-field), then [Fetch Board Items with Status](commands.md#fetch-board-items-with-status).
      - Run [Plan Board Changes](commands.md#plan-board-changes) with the user from [Find User](commands.md#find-user), which prints the call for each board and assignee change.
    - **Write.**
      - Run each call it prints.
      - Fetch the issues and items again and re-run: that re-read confirms every write, and the board is current when it reports nothing to do.
      - An issue added in one pass gets its Status in the next.
13. **Report.**
    Report per issue: tasks linked, criteria ticked, rows marked done, criteria left unticked and why, conflicts, what was closed, and each board and assignee change. What the report names about criteria is [Coverage Reports](work-breakdown.md#coverage-reports).

## Rules

- **Open questions.**
  An epic is not synced while its Open Questions section remains. Ready it in [Plan Mode](plan-mode.md) first.
- **In Review.**
  An open initiative or epic whose criteria are all ticked is In Review.

