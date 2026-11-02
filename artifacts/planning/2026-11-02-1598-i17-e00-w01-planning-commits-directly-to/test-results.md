# W01 Test Results

> Tested revision: 5998729491bcf1226af5e2025791173bd515ae28 on i17/e00/w01-planning-commits-directly-to

## T1 Drafts in the Record

Run from skills/work-planner: `python3 -m unittest discover -s test -p test_plan_mode.py -v`, class `DraftsInTheRecord`.

- Each Plan Mode call to Draft Initiative Issue Body, Populate Epic Issue Body and Populate Work Item names an output in the record's folder.
- Populate the epics registers each draft body and work-item file in the planning record.
- The planning record's Layout states that a plan's draft issue bodies and work items are files of its record.
- Result: 3 tests, OK.
- Against plan-mode.md and planning-record.md at the base revision 12cf5b38, all three fail, so the suite observes the change.

## T2 Published on Engineering

Same run, class `PublishedOnEngineering`.

- Steps Prepare the planning record, Publish and Keep the goal current each call Publish Planning Record.
- No step before Prepare epic delivery calls Publish Pull Request, and none carries a bare Commit or Push line.
- Publish Planning Record runs Commit Planning Record and Push Engineering Branch, which commit the record's folder on the engineering worktree and push that branch.
- Result: 3 tests, OK.
- At the base revision 12cf5b38, the first two fail.

## T3 No Planning Branch or Discussion Pull Request

Run in the worktree: `grep -rniE "planning branch|planning-branch|discussion pull request|planning-discussion|Open Discussion" skills/work-planner`

- Result: no match (exit 1).

## T4 Skill Test Suite

Run from skills/work-planner: `python3 -m unittest discover -s test`

- Result: 796 tests, OK (1 skipped).
- The suite's operation-reach test first failed on Populate Pull Request Body, whose only caller was the discussion pull request. Run Delivery Session now names it as the source of the body it opens; the change list records that folded work.

## T5 Skill-File Check

Run in the worktree: `python3 skills/scripts/check_skill_files.py skills/work-planner`

- Result: 52 files checked, 0 findings.
