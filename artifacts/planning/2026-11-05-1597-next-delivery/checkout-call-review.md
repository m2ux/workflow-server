# Checkout Call Review

## Owning Change

Open integration PR #1641 contains the mode and protocol code under review. Its branch carries commit 612da8d650f524eb05c3e2436bac3cdfd7f82e4c, tree 86105c1299f4f309700f2e06f2a6283c2fedc352, parent 652ef07ea5b8553d3bdb73542c3a393ac20e6ea9. The commit changes three caller lines in align-mode.md and change-overview.md. W06 carries its test_checkouts.py reader adaptation separately; the caller corrections are absent from W06's unit patch.

## Findings and Resolution

The checkout reader's Commands/fence discovery cannot see the completed heading/HTML conversion. Restoring its execution and caller visibility exposes three missing explicit checkout names: Align's unit checkout article, Change Overview's project checkout on a changed-head retry, and its review checkout on a stale-index retry. The callers pass their existing inputs explicitly. Link targets, command payloads, retry conditions and outcomes are intact.

## Evidence

The exact patch SHA256 is 51c8589c4ec34d1a5b326b8aa5f9eb4668b1edfb07a512ab7131fa62d36eaa53. An isolated combined copy containing the prospective W06 conversion/reader and that exact patch passes all ten focused checkout tests: all seven original tests/assertions plus three real-invocation, literal-exclusion and nonvacuity controls. The source caller hashes after application equal that passing copy. The parent reviewed the complete reader diff; no assertion is weakened. Patch, actual log and identity record are registered beside this account.

The focused combined proof is not a full-suite claim for the committed integration branch. W06 consumes the actual integration commit before full actual-source verification and its final disclosure freeze. Final integration verification and review cover the resulting head. No new row, criterion, model activation or outside-initiative task is introduced.
