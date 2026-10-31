# W01/W02 delivery evidence

Delivery head: `5b49bbc306c3dff32601c17291619f42f0dfd120`. Full-suite head: `746436136c17d5c49baf95c4ed7ff89a9ada919e`. Base: `b0294e20074f715286d7c13451d3df30764d3273` (`i11/e09/workspace`).

## Historical delivery

`python3 -m unittest discover -s skills/work-planner/test` passes 478 tests on the full-suite head. The final commit only clarifies that epic inspection allocates its scratch output locally; seven document-interface tests and the 50-file checker pass on that final head. Seven new command-line regressions run the real sync entry point against issue and pull-request records, then inspect its output body and delivery report. They cover reordered and missing historical columns, embedded Coverage extraction, preservation of explicit Coverage and dependencies, normalization idempotence, ambiguous-column refusal, missing-title repair and refetch, matching historical initiative/task prefixes, and wrong-owner/open/unlinked exclusions. The historical fixture retains AC2 without inventing cancelled AC1. Existing delivery tests exercise current rows and title stability. [Full output](tests.log).

AC6 is observed by normalization before delivery matching; the output has the current six columns and preserves links and completion evidence. The instruction publishes that output and reads the saved epic before returning evidence. AC7 is observed through repair output, simulated returned REST title, and a second sync run with no repair or prefix conflict. The pure script emits proposed titles; the existing Publish Pull Request operation performs the remote write and readback. No historical live issue or PR was mutated to manufacture a test specimen.

## Planning board

The REST `users/m2ux/projectsV2/17` response confirms owner m2ux, number 17 and title **Process: How Work Is Planned and Delivered**. The live epic carries `theme:planning`, and the repository label endpoint confirms that label exists with description **How Work Is Planned and Tracked**. The table names Planning, that label and the board URL with its actual title. [Board snapshot](board17.json). This direct file-and-live-identity inspection observes AC8.

## Documents

`python3 skills/scripts/check_skill_files.py skills/work-planner` checks 50 files with zero findings. The full test suite also checks instruction prerequisites, operation interfaces, heading links and layer direction. [Checker output](documents.log).

## Review

The complete diff is five declared files: sync.py, test_sync.py, delivery-evidence.md, epic.md and board.md under skills/work-planner. Review traces normalization through format.Review before task matching, then title findings through the evidence procedure's publication/refetch loop. A parent review found initiative-only and task-level prefixes initially excluded; the implementation repairs matching prefixes and retains foreign-owner conflicts, covered by two regressions. The parent reviewed the committed full diff and confirmed the title-shape finding resolved, with no remaining blocker; its additional caller-input observation is resolved by inspection allocating the scratch output locally. No unresolved blocking finding remains in this review. All changes are within the declared unit boundary; no other task or initiative is changed.

## Plan changes

Applied: none. Held: none. Component dispatch was attempted as the session procedure requires, but the agent thread limit was reached, so this session implemented both groups under the brief's no-slot path. Each group's files have a separate commit. No deferred debt or arising issue was identified by this unit's validation.

## Delivery

Task PR #1486 merged to `i11/e09/workspace` as `f03df4884afef499fa9d6fe8c0172f19bc05d152`. Its exact head matched the passing evidence. The target was unprotected with no active rules, no required checks and no emitted check runs/statuses; the aggregate empty status was pending and supplied no failing or outstanding named check. GitHub reported clean and mergeable. Sync consumed the merged record and published Test Plan, ticked AC6/AC7/AC8 and W01/W02 Done. Exact saved-body readback passed, with retained Coverage and the AC1 numbering gap. Later E09 tasks remain unfinished.

The pre-existing PR #1265 Test Plan claims AC10/AC11 while current W05 Coverage is AC9. This historical discrepancy is reported to the epic owner for reconciliation; it does not supply evidence to this unit or tick AC10/AC11.

Integration draft #1487 targets workspace. Its exact body and both Development-link directions were read back; every relation page is complete. References cite the current task #1486 and prior same-base task #1265, identifying that earlier delivery as already integrated through #1267. The draft remains for later task updates and final epic review.
