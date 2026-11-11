# F12 Test Results

Branch `skill/proposal-artifact` at 19be51e10, stacked on `skill/work-priority` at 55c1ae77b, merged in as 0c10f6b4a. The scratch-copy mutations in T2, T3 and T5 were run at 96f49ea10; the checks, suites and comparison were run again at 19be51e10.

## T1. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 63 files checked, 0 findings. Every link to Proposal's two anchors, Propose mode's Requested Status and Issue's Add Issue Assignee and Assignee resolves, and no link reaches the retired `board.md#proposals`. Covers AC1.

## T2. Proposal Home Document Test

`test_documents.py` `ProposalHome`, four tests: Proposal Status defines Suggested, Considering, Approved, Held and Declined, each with its assignee; no other skill file heads Proposals or Proposal Status or defines a status; every file naming the proposals board, or a status beside a proposal, links Proposal; and the search tells a proposal status from Held Change and Merge Approved Delivery. In a scratch copy, unlinking Approved in plan-mode.md fails the third test, and a Held definition added to board.md fails the second. Covers AC1.

## T3. Plan's Propose Route Ends at Approved

`test_plan_mode.py` `ApprovedBeforeDrafting`, six tests: Plan's Take the Proposal, ahead of Draft Each Initiative Body, reads a named proposal's Status through Select Project Board and Read Board State before its gate, drafts at Approved, blocks drafting at any other status or with no board item, and follows Propose mode with Requested Status Approved; Propose's Confirm Placement places a requested status without asking; Place sets the Requested Status and, where Proposal Status assigns it to the user, assigns the user through Save Tracker Issue; Requested Status is a Proposal Status; and only Proposal Status says Approved's assignee is the user. In a scratch copy, dropping the Requested Status from Plan, or the no-ask branch from Propose, fails the matching test. Covers AC1.

## T4. Section Comparison

`check_skill_files.py --compare 55c1ae77b HEAD skills/work-planner`: 883 sections at the base, 887 at the head. board.md's Proposals is removed, and its board purpose and five statuses stand unchanged as Proposal's Proposals Board and Proposal Status. Select Project Board, Create Proposals Board and Plan's Take the Proposal differ by the link to Proposal, and Take the Proposal by the Requested Status route and the board read gating a named proposal at Approved; Propose's Confirm Placement and Place gain the requested-status branch and assignment; Sync's Create Absent Proposals Board drops the sentence restating Create Proposals Board's configured copy source and title. Issue gains Add Issue Assignee and Assignee, run from Save Tracker Issue. Covers AC1.

## T5. Kind Registration Tests

`test_kind_operations.py` (29) `Registration`: SKILL.md lists Proposal then Proposal Body under the Proposal kind, and each of Proposal, Initiative and Epic lists its lifecycle artifact ahead of its body. `GeneralCallers` counts Proposal among the kind artifacts the general callers do not link. Deleting the Proposal registration line in a scratch copy fails all three. Covers AC2.

## T6. Planner Suite, Shared Suite and Whitespace

The work-planner suite: 1266 tests, OK, 1 skipped. The shared suite (`skills/test`): 331 tests, OK. `git diff --check 55c1ae77b HEAD`: clean.
