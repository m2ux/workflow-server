# F03 Test Results

> Tested revision: 569ae84422a0031d9b73997ca1541a3b679a3c48 on f03-harness-merge-permission

## T1 Merge Permission Stated

Read in the worktree: Merge Permission in skills/work-planner/artifacts/pull-request.md, and Dependencies in skills/work-planner/SKILL.md.

- Merge Permission states that the harness lets a delivery session merge a task pull request into an epic base without a prompt, and that a merge into the default branch stays with a person.
- It gives the Claude Code form: an `autoMode.allow` rule and an `autoMode.environment` entry in `~/.claude/settings.json`, each array keeping `"$defaults"`, with `claude auto-mode config` to read the rules in effect. The syntax follows the Claude Code auto-mode configuration page, which also states that auto mode ignores project settings.
- Dependencies names the permission and links Merge Permission; no other file restates it.
- Result: AC1 holds.

## T2 Checked Before Dispatch

Read in the worktree: step 8 Dispatch of skills/work-planner/modes/deliver-mode.md.

- Before the first unit's worktree or brief, the step confirms the harness grants the merge permission, and when it does not, reports the absent setting and stops before any unit begins.
- Result: AC2 holds.

## T3 Permission Refusal Apart

Read in the worktree: Merge Delivery Pull Request and Merge Task Pull Requests in skills/work-planner/artifacts/pull-request.md.

- A GitHub refusal returns for fresh verification, and Merge Task Pull Requests updates the branch and retries it once.
- A permission-layer refusal is recognized by the harness declining to run the merge command. On a target with no review requirement it returns the pull request ready and verified, naming the refusal and the permission, stops merge attempts, and leaves the merge to a later Deliver run; nothing asks the user to approve it.
- Merge Task Pull Requests stops on that refusal, as on a review handoff, and does not retry it.
- Result: AC3 holds.

## T4 Skill Test Suite

Run in the worktree: `python3 -m unittest discover -s skills/work-planner/test`

- Result: 831 tests, OK (1 skipped).

## T5 Skill-File Check

Run in the worktree: `python3 skills/scripts/check_skill_files.py skills/work-planner`

- Result: 52 files checked, 0 findings.
