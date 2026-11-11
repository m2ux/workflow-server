# F12 Test Results

Branch `skill/proposal-artifact` at 38f8ed8f7, stacked on `skill/work-priority` at 564346688.

## T1. Skill-File Check over Work-Planner

`scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 63 files checked, 0 findings. Every link to Proposal's two anchors resolves, and no link reaches the retired `board.md#proposals`. Covers AC1.

## T2. Proposal Home Document Test

`test_documents.py` `ProposalHome`, four tests: Proposal Status defines Suggested, Considering, Approved, Held and Declined, each with its assignee; no other skill file heads Proposals or Proposal Status or defines a status; every file naming the proposals board, or a status beside a proposal, links Proposal; and the search tells a proposal status from Held Change and Merge Approved Delivery. In a scratch copy, unlinking Approved in plan-mode.md fails the third test, and a Held definition added to board.md fails the second. Covers AC1.

## T3. Section Comparison

`check_skill_files.py --compare 564346688 HEAD skills/work-planner`: 883 sections at the base, 884 at the head. board.md's Proposals is removed, and its board purpose and five statuses stand unchanged as Proposal's Proposals Board and Proposal Status. Select Project Board, Create Proposals Board, Plan mode's Take the Proposal and Propose mode's Place differ only by the link to Proposal; Sync mode's Create Absent Proposals Board drops the sentence restating Create Proposals Board's configured copy source and title. The test README's Prose Tests and Documents differ by the new descriptions and counts. Covers AC1.

## T4. Kind Registration Tests

`test_kind_operations.py` (29) `Registration`: SKILL.md lists Proposal then Proposal Body under the Proposal kind, and each of Proposal, Initiative and Epic lists its lifecycle artifact ahead of its body. `GeneralCallers` counts Proposal among the kind artifacts the general callers do not link. Deleting the Proposal registration line in a scratch copy fails all three. Covers AC2.

## T5. Planner Suite, Shared Suite and Whitespace

The work-planner suite: 1259 tests, OK, 1 skipped. The shared suite (`skills/test`): 331 tests, OK. `git diff --check 564346688 HEAD`: clean.
