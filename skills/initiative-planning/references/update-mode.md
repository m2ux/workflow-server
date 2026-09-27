# Update mode

Records delivered work on an initiative, its epics and their task issues: links each delivered
task to its pull request, ticks the criteria that now hold, and closes what is complete. The Work
Breakdown guide (`work-breakdown.md`) states how pull requests name tasks and how delivery is
recorded.

## Procedure

1. **Select** an initiative with its open epics, or the epics the user names. Run review mode first
   on any issue whose format `format.py` rejects, since the update reads the house table.
2. **Fetch** each issue whole, including the task issues that epic row ids link, and the pull
   requests that name the initiative:
   `gh api repos/{owner}/{repo}/issues/943 > issue-943.json` and
   `gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07:"))' > prs.json`.
3. **Unnamed deliveries.** When the user says work has landed but no pull request names its epic,
   find the pull request, confirm it with the user, and retitle it with the epic's reference:
   `gh api --method PATCH repos/{owner}/{repo}/pulls/950 -f title='[I07:E00] Purpose'`. Fetch
   `prs.json` again.
4. **Match pull requests to tasks.** Run `scripts/update.py issue-943.json --prs prs.json` for each
   epic. Each merged pull request it reports as **unmatched** names the epic but no row links it
   yet. Read its changes and description against the tasks' Descriptions, and name the tasks it
   delivered: one task, or tasks that Join each other. Put any match that is not clear to the user.
   A pull request that delivered a task with its own issue belongs to that issue, in step 5.
5. **Update each task issue** with `scripts/update.py issue-637.json --prs prs.json --pr 950`,
   naming the pull request that delivered it. Verify and tick its criteria as in steps 7–8, comment
   the pull request on it (`gh api --method POST repos/{owner}/{repo}/issues/637/comments -f
   body='Delivered by #950.'`), and close it as completed when it reports closable.
6. **Update each epic** with `scripts/update.py issue-943.json --prs prs.json --tasks issue-637.json
   --link W01=950,W02=950 --fix fixed-943.md`, linking the matches from step 4, with the task issues
   fetched after closing. It reports:
   - **conflict:** a row linked to a pull request whose title names another epic, or tasks sharing
     a pull request that do not Join each other. Put it to the user;
   - **unmatched:** merged pull requests still linked from no row. Match them as in step 4; one
     that delivered a task issue stays unmatched here, since its issue records it;
   - **open questions:** work on the epic has started while its Open questions section remains.
     Stop and ready the epic in plan mode, since the answers may reshape it;
   - **in flight:** open pull requests naming the epic;
   - **ready to verify:** criteria whose delivering rows are all delivered;
   - **ticked early:** criteria ticked while a delivering row is not delivered. Untick them, or
     link the missing delivery.
7. **Verify** each criterion ready to verify on the branch the pull requests merged into, with the
   instrument the criterion names or implies: run the test, guard or command, or read the code at
   the file and line it concerns. A criterion that cannot be confirmed stays unticked and is
   reported with what is missing.
8. **Tick** the confirmed criteria: re-run with `--tick AC1,AC3`. It refuses a criterion that is not
   ready to verify.
9. **Patch** each changed body from its `--fix` file.
10. **Close** each epic the re-run reports closable, with
   `gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed`.
11. **Update the initiative**: `scripts/update.py issue-936.json --epics issue-943.json
   issue-937.json …`, with the epic JSON fetched after closing. An epic row is delivered when its
   issue is closed as completed. The user qualifies and ticks each of the initiative's criteria;
   the update lists those whose epics are all delivered as awaiting the user. Close the initiative
   when it reports every criterion ticked.
12. **Report** per issue: tasks linked, criteria ticked, criteria left unticked and why, conflicts,
    and what was closed.

## Commands

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/update.py issue-943.json --prs prs.json
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/update.py issue-637.json --prs prs.json --pr 950 --tick AC1 --fix fixed-637.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/update.py issue-943.json --prs prs.json --tasks issue-637.json --link W01=950,W02=950 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/update.py issue-943.json --prs prs.json --tick AC1,AC3 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/update.py issue-936.json --epics issue-943.json issue-937.json
```
