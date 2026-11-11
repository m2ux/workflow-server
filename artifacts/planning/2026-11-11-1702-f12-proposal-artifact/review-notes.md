# F12 Review Notes

Agent reviews of [#1704](https://github.com/m2ux/workflow-server/pull/1704) against `workspace`. The [review record](agent-review.json) holds each review's scope, criteria and validation; the last is authoritative.

## Review at 39bb3ee0a

The reviewed change runs from the merge base bf7c43fca to the head. [39bb3ee0a](https://github.com/m2ux/workflow-server/commit/39bb3ee0aa215fd64b03ab5e543489fe665b5f1c) gives the proposals board its own artifact, as the user directed. The review found no defect.

### Checked and Clear

- **Proposals Board.** [Proposals Board](https://github.com/m2ux/workflow-server/blob/skill/proposal-artifact/skills/work-planner/artifacts/proposals-board.md) holds the board's Purpose, Select Proposals Board, Create Proposals Board and the Find Proposals Board command. It applies Board's Find Board Template, Copy Board Template and Link Board to Repository.
- **Board.** board.md keeps what every board shares. Select Project Board selects a theme board. It links neither Proposal nor Proposals Board, and Board Selection and Selected Kind are gone with their only callers.
- **Proposal.** Proposal holds Proposal Status, which links Proposals Board for where a proposal stands.
- **Callers.** Propose's Confirm Placement and Place, Plan's board read, Sync's board step and Create Absent Proposals Board, and SKILL.md's opening link Proposals Board for the board and Proposal for statuses. No stale link to the moved anchors remains.
- **Registration.** Proposals Board is a board, not a kind's lifecycle or body artifact, so Work Kind's Registration does not list it.

## Review at 0ce4a62dd

The reviewed change runs from the merge base bf7c43fca, F11's head carrying F10's entry-point rule, to the head. Merge [0ce4a62dd](https://github.com/m2ux/workflow-server/commit/0ce4a62dd55a0423262bdea4154db13a4b96a546) brings F11 in and fixes both findings.

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | SKILL.md registered the Proposal artifact, where F10 keeps only kind names. | nonblocking | [Registration](https://github.com/m2ux/workflow-server/blob/skill/proposal-artifact/skills/work-planner/artifacts/work-kind.md#registration) lists Proposal ahead of Proposal Body under the Proposal kind; SKILL.md lists the kind name. |
| 2 | The Registration test's docstrings and README row named the entry point as the list. | nonblocking | They name Work Kind's Registration; the test reads that field. |

### Checked and Clear

- **Entry point.** No file in F12's change links SKILL.md. SKILL.md's proposals-board link points out to [Proposals Board](https://github.com/m2ux/workflow-server/blob/skill/proposal-artifact/skills/work-planner/artifacts/proposal.md#proposals-board).
- **General files.** No declared general caller links Proposal. board.md links it from Select Project Board and Create Proposals Board, the board mechanics the issue's design names.

## Review at 19be51e10

The reviewed change ran from the merge base 55c1ae77b, F11's reviewed head, to 19be51e10.

### Findings

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | Plan's Take the Proposal had no route for a named proposal at a status other than Approved. | nonblocking | A named proposal at any other [Proposal Status](https://github.com/m2ux/workflow-server/blob/skill/proposal-artifact/skills/work-planner/artifacts/proposal.md#proposal-status) blocks initiative drafting, and Plan reports its status; `ApprovedBeforeDrafting` asserts it. |
| 2 | `test_plan_mode.py` had three blank lines before `ApprovedBeforeDrafting`. | nonblocking | Two blank lines. |
| 3 | Take the Proposal gated drafting on a named proposal's status with no step reading it. | nonblocking | Plan applies [Select Project Board](https://github.com/m2ux/workflow-server/blob/skill/proposal-artifact/skills/work-planner/artifacts/board.md#select-project-board) with the proposals selection and [Read Board State](https://github.com/m2ux/workflow-server/blob/skill/proposal-artifact/skills/work-planner/artifacts/board.md#read-board-state), then drafts at Approved and otherwise blocks, reporting the Status read or the missing item; `ApprovedBeforeDrafting` asserts the read precedes the gate. |
| 4 | The pull request body named `i17/e02/workspace` beneath F10, which merged into `workspace`. | nonblocking | The body names F10 as targeting `workspace`. |

Fixes 1 and 2 are in [9f9eac602](https://github.com/m2ux/workflow-server/commit/9f9eac6028ef7c1b6a85f2d573035db13f03c810), and fix 3 in [19be51e10](https://github.com/m2ux/workflow-server/commit/19be51e10255106de6d74588a57e17ac64b4401f).

### Checked and Clear

- **One home.** The five statuses and their assignees are defined only in Proposal Status; board.md, SKILL.md, Propose and Plan link Proposal, and no file links the retired `board.md#proposals`.
- **Proposals board.** Proposal's Proposals Board links the configured title and copy source; Create Proposals Board still reads both from configuration, so Sync's dropped sentence restated it.
- **Assignment.** Propose assigns the user only where Proposal Status gives the placed status to the user, through Save Tracker Issue's Add Issue Assignee; Compare Saved Fields reads the assignees from the full issue JSON.
- **Plan's route.** A named proposal's Status comes from its proposals-board item. A proposal Plan raises takes Requested Status Approved, skips the placement question and is placed at Approved with the user assigned before any initiative is drafted.
