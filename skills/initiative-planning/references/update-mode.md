# Update mode

Records delivered work on an initiative and its epics: links each delivered task to its pull
request, ticks the criteria that now hold, and closes what is complete.

## Procedure

1. **Select** an initiative with its open epics, or the epics the user names. Run review mode first
   on any issue whose format `format.py` rejects, since the update reads the house table.
2. **Fetch** each issue whole, and the pull requests that name the initiative:
   `gh api repos/{owner}/{repo}/issues/943 > issue-943.json` and
   `gh api --paginate "repos/{owner}/{repo}/pulls?state=all&per_page=100" --jq '.[] | select(.title | startswith("[I07:"))' > prs.json`.
3. **Update each epic** with `scripts/update.py issue-943.json --prs prs.json --fix fixed-943.md`.
   It links each task that a merged pull request names, and reports:
   - **conflict:** a task already linked to a pull request other than the one that names it. Find
     which one delivered the task, from both pull requests' changes, and put it to the user;
   - **in flight:** open pull requests, which are left unlinked;
   - **ready to verify:** criteria whose delivering rows are all delivered;
   - **ticked early:** criteria ticked while a delivering row is not delivered. Untick them, or
     link the missing delivery.
4. **Verify** each criterion ready to verify on the branch the pull requests merged into, with the
   instrument the criterion names or implies: run the test, guard or command, or read the code at
   the file and line it concerns. A criterion that cannot be confirmed stays unticked and is
   reported with what is missing.
5. **Tick** the confirmed criteria: re-run with `--tick AC1,AC3`. It refuses a criterion that is not
   ready to verify.
6. **Where it stands.** Record what landed and any figure that came out differently from the plan.
7. **Patch** each changed body from its `--fix` file.
8. **Close** each epic the re-run reports closable, with
   `gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed`.
9. **Update the initiative** the same way, once its epics are done:
   `scripts/update.py issue-936.json --epics issue-943.json issue-937.json … --fix fixed-936.md`,
   with the epic JSON fetched after closing. An epic row is delivered when its issue is closed.
   Verify and tick as in steps 4–5, patch, and close the initiative when it reports closable.
10. **Report** per issue: tasks linked, criteria ticked, criteria left unticked and why, conflicts,
    and what was closed.

## Commands

```bash
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/update.py issue-943.json --prs prs.json --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/update.py issue-943.json --prs prs.json --tick AC1,AC3 --fix fixed-943.md
cd <workspace> && <workspace>/scripts/sbx python3 skills/initiative-planning/scripts/update.py issue-936.json --epics issue-943.json issue-937.json --fix fixed-936.md
```
