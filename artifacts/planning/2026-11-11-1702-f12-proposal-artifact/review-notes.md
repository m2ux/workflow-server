# F12 Review Notes

Agent review of [#1704](https://github.com/m2ux/workflow-server/pull/1704) at 9f9eac602 against `workspace`. The reviewed change runs from the merge base 55c1ae77b, F11's reviewed head, to the head. The [review record](agent-review.json) holds the scope, criteria and validation.

## Findings

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | Plan's Take the Proposal had no route for a named proposal at a status other than Approved. | nonblocking | A named proposal at any other [Proposal Status](https://github.com/m2ux/workflow-server/blob/skill/proposal-artifact/skills/work-planner/artifacts/proposal.md#proposal-status) blocks initiative drafting, and Plan reports its status; `ApprovedBeforeDrafting` asserts it. |
| 2 | `test_plan_mode.py` had three blank lines before `ApprovedBeforeDrafting`. | nonblocking | Two blank lines. |
| 3 | The pull request body named `i17/e02/workspace` beneath F10, which merged into `workspace`. | nonblocking | The body names F10 as targeting `workspace`. |

Fixes 1 and 2 are in [9f9eac602](https://github.com/m2ux/workflow-server/commit/9f9eac6028ef7c1b6a85f2d573035db13f03c810).

## Checked and Clear

- **One home.** The five statuses and their assignees are defined only in Proposal Status; board.md, SKILL.md, Propose and Plan link Proposal, and no file links the retired `board.md#proposals`.
- **Proposals board.** Proposal's Proposals Board links the configured title and copy source; Create Proposals Board still reads both from configuration, so Sync's dropped sentence restated it.
- **Assignment.** Propose assigns the user only where Proposal Status gives the placed status to the user, through Save Tracker Issue's Add Issue Assignee; Compare Saved Fields reads the assignees from the full issue JSON.
- **Plan's route.** A proposal Plan raises takes Requested Status Approved, skips the placement question and is placed at Approved with the user assigned before any initiative is drafted.
