# Propose Mode

Scopes one problem: the friction, the evidence, and the boundary, and states the goal as clauses the user confirms. It raises one proposal on the [proposals board](../artifacts/proposals-board.md).

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Procedure

### 1. Understand the Problem

- Ask the user until the friction and the boundary are clear.

- State the goal back as clauses meeting [Goal](../artifacts/proposal-body.md#goal).
- Have the user confirm those clauses.

### 2. Gather Evidence

- Measure the current state: counts, paths, and file:line.
- Delegate broad sweeps to parallel sub-agents.
- Spot-check what they provide before recording it.

### 3. Draft the Body

- Use the confirmed proposal context and selected output path.

- Populate the [Template](../artifacts/proposal-body.md#template) from [Proposal Context](../artifacts/proposal-body.md#proposal-context) at the destination in [Output Body](../artifacts/proposal-body.md#output-body).
- The complete body must meet the shared [Body](../artifacts/issue-body.md#body) conditions, and its labels must meet [Labels](../artifacts/issue-body.md#labels).
- The title must meet the shared [Titles](../artifacts/issue-body.md#titles) conditions and the proposal [Titles](../artifacts/proposal-body.md#titles).
- The Problem must meet the shared [Problem and Proposal](../artifacts/issue-body.md#problem-and-proposal) conditions.
- All populated fields must meet [Fields](../artifacts/proposal-body.md#fields).

- Retain the populated [Output Body](../artifacts/proposal-body.md#output-body) for publication.

- The local file is the source for the issue.

- Apply [Select Tracker Number](../artifacts/issue.md#select-tracker-number "ƒ") with the proposal prefix letter, and carry the provided proposal number in the title.
- The goal clauses are the clauses the user confirmed. The Non-Goals are the boundary.
- The design, the acceptance criteria, and the breakdown belong to a later goal.

### 4. Validate

- Apply [Validate Proposal Body](../artifacts/proposal-body.md#validate-proposal-body "ƒ") with the draft issue JSON and output file.

- Resolve each finding.
- Update the draft.
- Apply [Validate Proposal Body](../artifacts/proposal-body.md#validate-proposal-body "ƒ") again with the revised JSON and the same output path. Proceed to publication only when validation passes.

### 5. Publish

- Apply [Ensure Repository Labels](../artifacts/repository-labels.md#ensure-repository-labels "ƒ") with the proposal's required label definitions.

- Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the validated body, title and labels, leaving it unassigned.

### 6. Confirm Placement

- When the caller supplies a [Requested Status](#requested-status), continue to [Place](#7-place) without asking.
- Otherwise ask whether to add the issue to the [proposals board](../artifacts/proposals-board.md).

- On acceptance, continue to [Place](#7-place).
- On a decline, skip placement and continue to [Report](#8-report) with the issue URL.
- Wait for an unanswered decision.

### 7. Place

- Apply [Select Proposals Board](../artifacts/proposals-board.md#select-proposals-board "ƒ") under [Board Owner](../artifacts/board.md#board-owner).

- Retain the [Selected Board](../artifacts/board.md#selected-board) or an absent-board finding for the requester’s selection or creation path.

- For an absent board, Apply [Create Proposals Board](../artifacts/proposals-board.md#create-proposals-board "ƒ").
- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for the saved issue id.
- Apply [Place Issue on Board](../artifacts/board.md#place-issue-on-board "ƒ") with that id and the [Requested Status](#requested-status), or, when none is supplied, the initial status a new proposal takes under [Proposal Status](../artifacts/proposal.md#proposal-status).
- When [Proposal Status](../artifacts/proposal.md#proposal-status) assigns the placed status to the user, Run [Find User](../artifacts/board.md#find-user "ƒ") for the [Assignee Login](../artifacts/board.md#assignee-login), then Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with that login as the issue's [Assignee](../artifacts/issue.md#assignee).
- Otherwise leave the issue unassigned.

### 8. Report

Give the issue's URL, and the board's when the issue was placed.

## Outcomes

- **A scoped problem.**
  The user has one problem scoped, and has confirmed its goal.
- **One proposal.**
  The user has that problem raised as one proposal.
- **On the proposals board.**
  When the user or the calling mode wants the proposal on the [proposals board](../artifacts/proposals-board.md), it is there, at the status the caller requested or the one a new proposal takes, with the assignee that status takes.

## Fields

### Requested Status

The [Proposal Status](../artifacts/proposal.md#proposal-status) a calling mode supplies for the proposal's placement. It is absent when the user runs Propose directly. eg `Approved`
