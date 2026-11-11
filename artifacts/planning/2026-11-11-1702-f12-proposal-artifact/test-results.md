# F12 Test Results

Branch `skill/proposal-artifact` at 39bb3ee0a, stacked on `skill/work-priority` at bf7c43fca, merged in as 0ce4a62dd. The scratch-copy mutations in T2 and T3 were run at 96f49ea10, T5's at 0ce4a62dd and T7's at 39bb3ee0a; the checks, suites and comparison were run at 39bb3ee0a.

## T1. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 64 files checked, 0 findings. Every link to Proposal Status, Proposals Board's sections, Propose mode's Requested Status and Issue's Add Issue Assignee and Assignee resolves, and no link reaches the retired `board.md#proposals`, `board.md#find-proposals-board`, `board.md#create-proposals-board`, `board.md#board-selection`, `board.md#selected-kind` or `proposal.md#proposals-board`. Covers AC1.

## T2. Proposal Home Document Test

`test_documents.py` `ProposalHome`, four tests: Proposal Status defines Suggested, Considering, Approved, Held and Declined, each with its assignee; no other skill file heads Proposals or Proposal Status or defines a status; every file naming a status beside a proposal links Proposal; and the search tells a proposal status from Held Change, Merge Approved Delivery and a bare mention of the proposals board. In a scratch copy, unlinking Approved in plan-mode.md fails the third test, and a Held definition added to board.md fails the second. Covers AC1.

## T3. Plan's Propose Route Ends at Approved

`test_plan_mode.py` `ApprovedBeforeDrafting`, six tests: Plan's Take the Proposal, ahead of Draft Each Initiative Body, reads a named proposal's Status through Select Proposals Board and Read Board State before its gate, drafts at Approved, blocks drafting at any other status or with no board item, and follows Propose mode with Requested Status Approved; Propose's Confirm Placement places a requested status without asking; Place sets the Requested Status and, where Proposal Status assigns it to the user, assigns the user through Save Tracker Issue; Requested Status is a Proposal Status; and only Proposal Status says Approved's assignee is the user. In a scratch copy, dropping the Requested Status from Plan, or the no-ask branch from Propose, fails the matching test. Covers AC1.

## T4. Section Comparison

`check_skill_files.py --compare bf7c43fca HEAD skills/work-planner`: 883 sections at the base, 886 at the head.

- board.md loses Proposals, Board Selection and Selected Kind. Select Project Board selects a theme board only.
- Create Proposals Board and the Find Proposals Board command move to Proposals Board, which adds Select Proposals Board and Purpose.
- Proposal holds Proposal Status, the five statuses unchanged.
- Plan's Take the Proposal reads the board through Select Proposals Board and gates a named proposal at Approved.
- Propose's Confirm Placement and Place select and create the board through Proposals Board and gain the requested-status branch and assignment.
- Sync's board step chooses Select Project Board or Select Proposals Board, and its Create Absent Proposals Board applies Proposals Board's operation.
- Issue gains Add Issue Assignee and Assignee, run from Save Tracker Issue.

Covers AC1.

## T5. Kind Registration Tests

`test_kind_operations.py` (29) `Registration`: Work Kind's [Registration](https://github.com/m2ux/workflow-server/blob/skill/proposal-artifact/skills/work-planner/artifacts/work-kind.md#registration) lists Proposal then Proposal Body under the Proposal kind, and each of Proposal, Initiative and Epic lists its lifecycle artifact ahead of its body. `GeneralCallers` counts Proposal among the kind artifacts the general callers do not link. Deleting the Proposal registration line in a scratch copy fails all three. Proposals Board is a board, not a kind's lifecycle or body artifact, so the Registration does not list it. Covers AC2.

## T6. Planner Suite, Shared Suite and Whitespace

The work-planner suite: 1271 tests, OK, 1 skipped. The shared suite (`skills/test`): 336 tests, OK. `git diff --check bf7c43fca HEAD`: clean.

## T7. Proposals Board Home Document Test

`test_documents.py` `ProposalsBoardHome`, five tests: Proposals Board holds Select Proposals Board, Create Proposals Board and Find Proposals Board, and no other skill file heads them; Board links neither Proposal nor Proposals Board and names no proposals board; every file naming the proposals board links Proposals Board; and Plan, Propose and Sync apply its operations. In a scratch copy, a proposals-board link in board.md and a Sync link to Create Proposals Board outside Proposals Board each fail. Covers AC1.
