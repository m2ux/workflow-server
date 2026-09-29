# Update mode

Records delivered work on an initiative, its epics and their task issues: links each delivered task to its pull request, ticks the criteria that now hold, closes what is complete, and brings the initiative's project board up to date.

## Procedure

1. **Select.**
   - Select an initiative with its open epics, or the epics the user names.
   - Run review mode first on any issue whose format `format.py` rejects, since the update reads the agent-engineering table.
2. **Fetch.**
   Fetch each issue whole, including the task issues that epic row ids link, and the pull requests that name the initiative:
   - `gh api repos/{owner}/{repo}/issues/943 > issue-943.json`;
   - `gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07:"))' > prs.json`.
3. **Unnamed deliveries.**
   - When the user says work has landed but no pull request names its epic, find the pull request and confirm it with the user.
   - Retitle it with the epic's reference: `gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f title='[I07:E00] Purpose'`.
   - Fetch `prs.json` again.
4. **Match pull requests to tasks.**
   - Run `scripts/update.py issue-943.json --prs prs.json` for each epic. Each merged pull request it reports as **unmatched** names the epic but no row links it yet.
   - Read its changes and description against the tasks' Descriptions, and name the tasks it delivered: one task, or tasks that Join each other.
   - Put any match that is not clear to the user.
   - A pull request that delivered a task with its own issue belongs to that issue, in step 5.
5. **Update each task issue.**
   - Run `scripts/update.py issue-637.json --prs prs.json --pr 950`, naming the pull request that delivered it.
   - Verify and tick its criteria as in steps 7–8.
   - Comment the pull request on it: `gh api --method POST repos/{owner}/{repo}/issues/637/comments -f body='Delivered by #950.'`.
   - Close it as completed when it reports closable.
6. **Update each epic.**
   Run `scripts/update.py issue-943.json --prs prs.json --tasks issue-637.json --link W01=950,W02=950 --fix fixed-943.md`, linking the matches from step 4, with the task issues fetched after closing. It reports:
   - **conflict.**
     A row linked to a pull request whose title names another epic, or tasks sharing a pull request that do not Join each other. Put it to the user.
   - **unmatched.**
     Merged pull requests still linked from no row. Match them as in step 4; one that delivered a task issue stays unmatched here, since its issue records it.
   - **open questions.**
     Work on the epic has started while its Open questions section remains. Stop and ready the epic in plan mode, since the answers may reshape it.
   - **in flight.**
     Open pull requests naming the epic.
   - **ready to verify.**
     Criteria whose delivering rows are all delivered.
   - **ticked early.**
     Criteria ticked while a delivering row is not delivered. Untick them, or link the missing delivery.
7. **Verify.**
   - Verify each criterion ready to verify on the branch the pull requests merged into, with the instrument the criterion names or implies: run the test, guard or command, or read the code at the file and line it concerns.
   - A criterion that cannot be confirmed stays unticked and is reported with what is missing.
8. **Tick.**
   Tick the confirmed criteria: re-run with `--tick AC1,AC3`. It refuses a criterion that is not ready to verify.
9. **Patch.**
   Patch each changed body from its `--fix` file.
10. **Close.**
    Close each epic the re-run reports closable, with `gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed`.
11. **Update the initiative.**
    - Run `scripts/update.py issue-936.json --epics issue-943.json issue-937.json …`, with the epic JSON fetched after closing. An epic row is delivered when its issue is closed as completed.
    - It lists each criterion whose citing epics are all delivered as ready to verify. Run the automated test each names, and tick those that pass with `--tick AC1,AC3`.
    - Put each criterion that names no automated test to the user, who confirms it and ticks it.
    - Close the initiative when it reports every criterion ticked.
12. **Update the board.**
    Update it once every issue is patched and closed, fetching the issues again first.
    - **Find it.**
      - List the owner's open boards, as the commands below show. Fetch each board's items and run `scripts/board.py --find issue-936.json 2=items-2.json 7=items-7.json`.
      - The one board holding the initiative is its board.
      - When none or several do, ask the user which board, or none; the first update puts the initiative on the board chosen, so the next search finds it.
    - **Plan.**
      - Fetch the board's fields, then its items with the Status field id, and run `scripts/board.py issue-936.json --epics … --tasks … --prs prs.json --board users/{owner}/projectsV2/2 --fields fields.json --items items.json --out board/`.
      - It derives each issue's Status and prints the call for each issue to add, item to remove and Status to set.
      - Give an issue it reports unresolved with `--others`.
    - **Write.**
      - Run each call it prints.
      - Fetch the items again and re-run: that re-read confirms every write, and the board is current when it reports nothing to do.
      - An issue added in one pass gets its Status in the next.
13. **Report.**
    Report per issue: tasks linked, criteria ticked, criteria left unticked and why, conflicts, what was closed, and each board change.

## Commands

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-943.json --prs prs.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-637.json --prs prs.json --pr 950 --tick AC1 --fix fixed-637.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-943.json --prs prs.json --tasks issue-637.json --link W01=950,W02=950 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-943.json --prs prs.json --tick AC1,AC3 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-936.json --epics issue-943.json issue-937.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/update.py issue-936.json --epics issue-943.json issue-937.json --tick AC2 --fix fixed-936.md
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | .number'
gh api --paginate "users/{owner}/projectsV2/2/items?per_page=100" > items-2.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/board.py --find issue-936.json 2=items-2.json 7=items-7.json
gh api --paginate "users/{owner}/projectsV2/2/fields?per_page=100" > fields.json
gh api --paginate "users/{owner}/projectsV2/2/fields?per_page=100" --jq '.[] | select(.name == "Status") | .id'
gh api --paginate "users/{owner}/projectsV2/2/items?per_page=100&fields=411749936" > items.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/work-planner/scripts/board.py issue-936.json --epics issue-943.json issue-937.json --tasks issue-637.json --prs prs.json --board users/{owner}/projectsV2/2 --fields fields.json --items items.json --out board/
```
