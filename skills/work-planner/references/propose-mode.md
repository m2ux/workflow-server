# Propose Mode

Scopes the problem: the friction, the evidence, and the boundary, and states the goal as clauses someone could observe. It raises one proposal on the board titled `Proposals`.

## Procedure

1. **Understand the problem.**
   - Interview the user, as an [Interview](interview.md), until the friction and the boundary are clear.
   - State the goal back as clauses, each an outcome someone could observe, and have the user confirm them. A clause does not describe the change.
   - The proposal holds the goal, the evidence, and the decisions about that scope.
2. **Gather evidence.**
   - Measure the current state: counts, paths, file:line.
   - Delegate broad sweeps to parallel sub-agents, and spot-check what they return before recording it.
3. **Draft the body.**
   Draft it from the [proposal template](../templates/proposal.md) into a local file. That file is the source for the issue.
   - A Problem follows the [Work Breakdown Guide](work-breakdown.md#problem-and-proposal).
   - The goal clauses are the confirmed clauses. The Non-Goals are the boundary.
   - The design, the acceptance criteria, and the Work Breakdown are [Plan Mode](plan-mode.md), per this mode's Problem scope rule.
4. **Check the draft.**
   Write the draft as an issue JSON, with its title and labels, and run [Check Format](commands.md#check-format) with `--fix`.
   Fold every finding in and run it again. No issue is created while it reports one.
5. **Create the issue.**
   - The title is `Name: Subtitle`, per the scheme.
   - The label is `type:proposal`. When [List Labels](commands.md#list-labels) does not show it, create it with [Create Label](commands.md#create-label).
   - Add the further labels per the scheme. There is no `theme:*` label and no assignee.
   - Create it with [Create Issue](commands.md#create-issue).
6. **Place it.**
   - Find the board with [Find Proposals Board](commands.md#find-proposals-board). When it prints nothing, create the board with [Create Proposals Board](commands.md#create-proposals-board).
   - [Fetch Issue](commands.md#fetch-issue) for the new issue's id, then [Add Issue to Board](commands.md#add-issue-to-board).
   - [Fetch Board Fields](commands.md#fetch-board-fields), then [Set Item Status](commands.md#set-item-status) to Suggested.
   - Leave the issue unassigned. Suggested has no assignee, per [Themes and Boards](../SKILL.md#themes-and-boards).
7. **Report.**  Give the issue's URL and the board's.

## Rules

- **Problem scope.**
  A proposal meets the [Proposal](review-criteria.md#proposal) criteria.
