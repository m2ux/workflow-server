# W04 Test Results

Tested revision: `d99086522a7d5d4bf4786f7e63ec179a7a6579ba` on `i17/e00/w04-sync-reads-every-linked`, which holds `i17/e00/workspace` at `2d89d3b6b`.

## T1 Linked pull requests settle sync

- **Command.** `cd skills/work-planner && sbx python3 -m unittest discover -s test -p test_link_capture.py -k LinkedPullRequests -v`
- **Result.** 6 tests, OK.
- **Observed.** A stand-in tracker holds an epic whose W01 row links `o/r#961`, titled `Early work` with no initiative prefix, and a task issue whose Development field names `o/s#962`, titled `Older work`. `linked-pull-requests.py` appends both to a collection holding only the title-matched `o/r#950`. `sync.py` over the fetched collection drops W01 from `undelivered` and reports `retitle: #961 → [I01:E00] Early work`; over the title-matched collection alone it reports `note: W01 links #961, which is not among the pull requests given` and W01 undelivered.
- **Further cases.** A board items file names the plan; a pull request already held is not appended again; an unreadable pull request or Development relation appends nothing and exits 1.

## T2 Unit suite

- **Command.** `cd skills/work-planner && sbx python3 -m unittest discover -s test`
- **Result.** 807 tests, OK (1 skipped).

## T3 Skill file check

- **Command.** `sbx python3 skills/scripts/check_skill_files.py skills/work-planner`
- **Result.** 52 files checked, 0 findings.

## T4 No hand fetch remains

- **Command.** `cd skills/work-planner && grep -rn 'absent from the initiative list\|Fetch any linked pull request absent\|missing from the records' modes artifacts protocols`
- **Result.** No match. `grep -rln 'fetch-linked-pull-requests' modes artifacts protocols` names `artifacts/pull-request.md` alone, where both fetch operations run the command.
