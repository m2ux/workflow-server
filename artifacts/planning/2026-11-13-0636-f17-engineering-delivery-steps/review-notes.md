# F17 Review Notes

## Review at 148533531

Agent review of [#1714](https://github.com/m2ux/workflow-server/pull/1714) at 148533531 against `workspace` at 9e4e9e274. An independent reviewer read the diff with its callers and probed sync.py on fixtures; the session re-read the fix delta, b8dd4f3f2, in full. The [review record](agent-review.json) holds the scope, criteria and validation.

- **Scripts.** Correct for every probe: a full SHA links `…/commit/<sha>` on the epic's repository, a rerun leaves the row unchanged, two commits on one row are refused, a held commit gains a pull request, and sync.py and board.py agree that a commit beside an open pull request delivers nothing.
- **Findings.** Three blocking and one nonblocking, fixed in [b8dd4f3f2](https://github.com/m2ux/workflow-server/commit/b8dd4f3f2f2076fea0db34df41cfdaeca3a509be). Three nonblocking observations need no change here: step 11's Hoist wording names an open pull request, which an engineering-only unit read past; a hand-written short-SHA commit link refuses a full-SHA `--link`, as two deliveries on one branch; `--link W01` with no `=` raises a traceback, as it did before this change.

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | The step-6 Sync Epic body for an engineering-only unit was never saved. | blocking | Step 6 applies Save Tracker Issue with the provided body. |
| 2 | Skipping steps 7–10 skipped Task Merge, so criteria, the task issue and the epic were never settled. | blocking | The unit follows Task Merge with the pushed commit as its delivery, then continues to Arising Issues. |
| 3 | The push bullet preceded the bullets that write and test the files. | blocking | The push closes step 6, once the unit's tests pass. |
| 4 | Sync Epic's `--link` text read as linking the commit for every unit that pushes `engineering`. | nonblocking | It links the commit only for a unit changing only the planning-records branch, as rules.md states. |
