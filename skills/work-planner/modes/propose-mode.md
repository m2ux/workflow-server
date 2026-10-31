# Propose Mode

Scopes one problem: the friction, the evidence, and the boundary, and states the goal as clauses the user confirms. It raises one proposal on the board titled `Proposals`.

## Prerequisites

Read these files first.

- [Proposal Body](../artifacts/proposal-body.md)
- [Repository Labels](../artifacts/repository-labels.md)
- [Issue](../artifacts/issue.md)
- [Board](../artifacts/board.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Understand the problem.**
   Ask the user until the friction and the boundary are clear.
   - State the goal back as clauses meeting [Goal](../artifacts/proposal-body.md#goal).
   - Have the user confirm those clauses.
2. **Gather evidence.**
   - Measure the current state: counts, paths, and file:line.
   - Delegate broad sweeps to parallel sub-agents.
   - Spot-check what they return before recording it.
3. **Draft the body.**
   Run [Populate Proposal Body](../artifacts/proposal-body.md#populate-proposal-body) with the confirmed problem, evidence, goal clauses, boundary and output body path. The local file is the source for the issue.
   - Obtain the proposal's number through [Select Tracker Number](../artifacts/issue.md#select-tracker-number) with the proposal prefix letter, and carry it in the title.
   - The goal clauses are the clauses the user confirmed. The Non-Goals are the boundary.
   - The design, the acceptance criteria, and the breakdown belong to a later goal.
4. **Validate.**
   Call [Validate Proposal Body](../artifacts/proposal-body.md#validate-proposal-body) with the draft issue JSON and output file.
   - Resolve each finding.
   - Update the draft.
   - Repeat Validate Proposal Body with the revised JSON and the same output path. Proceed to publication only when validation passes.
5. **Publish.**
   Call [Ensure Repository Labels](../artifacts/repository-labels.md#ensure-repository-labels) with the proposal's required label definitions.
   - Pass the validated body, title and labels to [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue), leaving it unassigned.
6. **Confirm placement.**
   Ask whether to add the issue to the proposals board.
   - On acceptance, continue to the place step.
   - On a decline, skip placement and continue to the report step with the issue URL.
   - Wait for an unanswered decision.
7. **Place.**
   Call [Locate Project Board](../artifacts/board.md#locate-project-board) for proposals.
   - Create an absent board through [Create Proposals Board](../artifacts/board.md#create-proposals-board).
   - Read the saved issue id through [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue).
   - Run [Place Issue on Board](../artifacts/board.md#place-issue-on-board) with that id and initial status Suggested.
   - Leave the issue unassigned.
8. **Report.**
   Give the issue's URL, and the board's when the issue was placed.

## Outcomes

- **A scoped problem.**
  The user has one problem scoped, and has confirmed its goal.
- **One proposal.**
  The user has that problem raised as one proposal.
- **On the proposals board.**
  When the user wants the proposal on the proposals board, it is there, raised, and unassigned.
