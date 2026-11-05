# W07 Delivery Readback

## Confirmed Merge

[PR1647](https://github.com/m2ux/workflow-server/pull/1647) merges into i17/e01/workspace as `652ef07ea5b8553d3bdb73542c3a393ac20e6ea9`, with cleared head `aed3e1715de513ad7efb620e0d95cd18c79dd8ba` and tree `9a517bcc9640caa2fa69b6bce0ffbed94fc16bd0`. The API merge carries the exact head SHA guard. The epic-base target refresh is a no-op before that merge; source head and target requirements are freshly confirmed. No long-lived integration or successor starts.

## Merged-Revision Checks

The registered criterion instrument runs through revision-check.py in a fresh detached checkout at the merged revision, loading that checkout’s own checker and registered hash manifest. It passes the strict six-file check. All 231 walked source-file hashes match. The complete Work Planner suite has 925 tests: 924 pass and one opt-in skip (115.142 seconds). The shared suite has 258 passes. Literal installed checking retains only the expected Revise Fields finding. The temporary revision checkout is clean and removed afterward; merged-checks.json and merged-revision-evidence.tar.gz preserve identity, commands and results.

## Task Merge Readback

- Issue #1616 records W07→PR #1647 with W07 Done and AC7 ticked. The inspected body diff changes only W07 Done and AC7; W06’s held row and AC6 remain, and W08/AC8 remain pending.
- Draft integration #1641 retains its workspace target and draft state, head at the merged revision, and references every actual task merge: 1640,1642,1643,1644,1646,1647. Its Changes describe the delivered family and preserve explicit Partial evidence limits.
- The final complete delivery collection contains 22 pull requests. Fresh PR-side and issue-side Development snapshots agree; the row-only task PR #1647 links no issue, while draft #1641 remains the epic’s Development relation.
- Final sync reports no reference/path/target discrepancy and correctly leaves the epic incomplete for W06/W08 and AC6/AC8. Exact board item 291152098 under users/m2ux/projectsV2/17, Status field 422017304, reads In Progress; its embedded issue body matches the saved issue.
- No task issue exists to close. The epic remains open, and its read-only closure gate fails as expected for unticked criteria and open draft #1641. The initiative and sibling work are untouched.

## Recorded Limits and Attempts

Disclosure remains Partial; six bounded correct outcomes and helper emission receipts are not complete workflow or raw-session verification. Three interrupted v3 instrument observations remain separate.

Record Epic Delivery derives AC7 and W07 Done from verified merged PR TestEvidence. An unnecessary later --tick call on the already-ticked returned body is refused and writes no body; its log is retained. A closure-gate invocation using the wrong snapshot flag exits2 before checking; the documented --development invocation then returns the expected closure blockers with exit 1. Neither refused attempt supplies passing evidence or causes a tracker write.

Applied and held plan-change lists remain empty. Separate dispatch-review work retains its own issue/PR; no duplicate behavior fix or new issue is created.
