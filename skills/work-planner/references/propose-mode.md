# Propose Mode

Scopes the problem: the friction, the evidence, and the boundary, and states the goal as clauses someone could observe. It raises one proposal on the board titled `Proposals`.

## Prerequisites

Command operations use the [Command Conventions](../SKILL.md#command-conventions), read before the first spec.

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
   - The label is `type:proposal`. When [List Labels](#list-labels) does not show it, create it with [Create Label](#create-label).
   - Add the further labels per the scheme. There is no `theme:*` label and no assignee.
   - Create it with [Create Issue](commands.md#create-issue).
6. **Place it.**
   - Find the board with [Find Proposals Board](#find-proposals-board). When it prints nothing, create the board with [Create Proposals Board](#create-proposals-board).
   - [Fetch Issue](commands.md#fetch-issue) for the new issue's id, then [Add Issue to Board](#add-issue-to-board).
   - [Fetch Board Fields](commands.md#fetch-board-fields), then [Set Item Status](#set-item-status) to Suggested.
   - Leave the issue unassigned. Suggested has no assignee, per [Themes and Boards](../SKILL.md#themes-and-boards).
7. **Report.**  Give the issue's URL and the board's.

## Rules

- **Problem scope.**
  A proposal meets the [Proposal](review-criteria.md#proposal) criteria.

## Commands

### Create Label

Creates a label. A proposal needs `type:proposal` when [List Labels](#list-labels) does not show it.

```bash
gh api --method POST repos/{owner}/{repo}/labels -f name='type:proposal' -f color='1D76DB' -f description='A goal proposed as an initiative' --jq .name
```

### Find Proposals Board

Prints the number of the open board titled `Proposals`.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title == "Proposals") | .number'
```

### Add Issue to Board

Adds an issue to a board and prints the new item's id. The issue's `id` comes from [Fetch Issue](commands.md#fetch-issue), not its number.

```bash
gh api --method POST users/{owner}/projectsV2/13/items -f type=Issue -F id=3040123456 --jq .id
```

### Set Item Status

Sets one board item's Status. The body names the Status field id and the option id, both taken from [Fetch Board Fields](commands.md#fetch-board-fields): `{"fields":[{"id":419167630,"value":"OPTION"}]}`.

- This mode writes the Proposals board, whose statuses are its own. The theme boards are written through the jurisdictions [statuses.py](../scripts/statuses.py) holds, as [Plan Board Changes](sync-mode.md#plan-board-changes), [Advance Mode](advance-mode.md) and [Set Dispatch Status](deliver-mode.md#set-dispatch-status) render them.

```bash
gh api --method PATCH users/{owner}/projectsV2/13/items/1001 --input status-backlog.json --jq .id
```

### List Labels

Lists the labels that exist in the repository.

```bash
gh api "repos/{owner}/{repo}/labels?per_page=100" --jq '.[].name'
```

### Create Proposals Board

Copies the Proposals Template into a new open board, links the copy to the repository, and prints the new board's number.

- The template is the open board titled `Proposals Template`. The copy carries its Status options, listed under Proposals in [Themes and Boards](../SKILL.md#themes-and-boards).
- The title is `Proposals`.

```bash
gh api --paginate "users/{owner}/projectsV2?per_page=100" --jq '.[] | select(.closed | not) | select(.title == "Proposals Template") | .number'
gh project copy 14 --source-owner {owner} --target-owner {owner} --title 'Proposals' --format json --jq .number
gh project link 15 --owner {owner} --repo {repo}
```
