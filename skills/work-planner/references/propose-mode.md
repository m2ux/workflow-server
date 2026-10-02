# Propose mode

Takes the same intake as [plan mode](plan-mode.md) and raises one proposal: an initiative-shaped issue with no Work Breakdown, titled `[I]` with no number, on the board titled `Proposals`.

## Procedure

1. **Take the plan intake.**
   - Confirm the goal and gather the evidence as [plan mode](plan-mode.md) does under Understand the request and Gather evidence.
   - The proposal issue holds the goal, the evidence and the decisions.
2. **Draft the body.**
   Draft it from [proposal.md](../templates/proposal.md) into a local file. That file is the source for the issue.
   - A Problem and a Proposal follow the [Work Breakdown guide](work-breakdown.md#problem-and-proposal).
   - Each acceptance criterion comes from a confirmed clause. It meets the [goal pass](review-passes.md#goal-pass) rules One invariant, No counts, Local and Verifiable, and it ends by naming its instrument, as that pass's Verified rule defines.
   - The goal pass's trace and its Whole rule read epics. A proposal has none, so those checks are not made. A named test that does not exist yet stays named in the criterion.
3. **Check the draft.**
   Write the draft as an issue JSON, with its title and labels, and run [Check format](commands.md#check-format) with `--fix`.
   Fold every finding in and run it again. No issue is created while it reports one.
4. **Create the issue.**
   - The title is `[I] Name: Subtitle`, per the scheme.
   - The label is `type:proposal`. When [List labels](commands.md#list-labels) does not show it, create it with [Create label](commands.md#create-label).
   - Add `enhancement`, `bug`, `tech-debt`, `workflows` and a `priority: *` as they apply. There is no `theme:*` label and no assignee.
   - Create it with [Create issue](commands.md#create-issue).
5. **Place it.**
   - Find the board with [Find proposals board](commands.md#find-proposals-board). When it prints nothing, create the board with [Create proposals board](commands.md#create-proposals-board).
   - [Fetch issue](commands.md#fetch-issue) for the new issue's id, then [Add issue to board](commands.md#add-issue-to-board).
   - [Fetch board fields](commands.md#fetch-board-fields), then [Set item status](commands.md#set-item-status) to Suggested.
   - Leave the issue unassigned. Suggested has no assignee, per [Themes and boards](../SKILL.md#themes-and-boards).
6. **Report.**  Give the issue's URL and the board's.
