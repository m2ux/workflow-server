# Validation — I11:E16 W03

Checks run on branch `i11/e16/w03-audit-closure-evidence-across` at commit `8687a68b2700978b4d7d5c0ed25e99639b0a95d0`, from the unit worktree, under the workspace sandbox (`sbx`) except the live capture, which reaches the tracker.

## T1

**Transferred and unproven closures.** `Sweep::test_a_completed_issue_with_unticked_criteria_is_listed_with_its_reason`, `Sweep::test_a_completed_issue_without_criteria_is_listed` and `Sweep::test_a_transferred_issue_is_listed_as_not_planned`. A completed issue with an unticked or absent criterion, and a not-planned issue with an unticked criterion, are each listed as `unsupported:` with `closed as completed` or `closed as not_planned`. A missing state reason is named `unknown`. Result: pass.

## T2

**Unmerged linked pull requests.** `Sweep::test_an_unmerged_linked_pull_request_is_listed`. An issue linked to one merged, one closed and one open pull request, the last in another repository, lists the closed and the open one with their states and not the merged one. Result: pass.

## T3

**Unread capture.** `Sweep::test_an_issue_without_captured_links_is_unevaluable` and `Sweep::test_unreadable_evidence_blocks_the_sweep`. A closed issue the snapshot holds no link list for is `unevaluable: ... Development links not captured`, never treated as linkless; an unparseable snapshot or one not keyed by issue number blocks the sweep with exit 1. Result: pass, 5 subtests.

## T4

**Sweep over the issue-end capture.** `Sweep::test_the_sweep_reads_the_issue_end_capture`. `links-by-issue.py` captures a repository holding a supported closure, a transferred closure with an unticked criterion, a completed closure linked to an open pull request and an open issue; the sweep over its output lists exactly the transferred and the unproven closure. Supported closures, open issues, pull requests and a two-repository collection are covered by the remaining `Sweep` tests. Result: pass.

## T5

**Live run over m2ux/workflow-server.** Issues fetched with Fetch All Issues and captured with `links-by-issue.py` (429 issues, 136 links, every relation read), then swept: 261 closed issues listed, 189 completed, 71 not planned and 1 duplicate, 4 with an unmerged linked pull request, none unevaluable. The listing holds each expected case:

- Transferred, closed not planned with criteria unticked: #1472, #1488, #1492, #1499, #1500.
- Completed with criteria unticked: #1470, #1491.

Of the 261, 199 carry no Acceptance Criteria section and are listed for its absence. Output: [sweep-workflow-server.txt](sweep-workflow-server.txt). No issue was changed. Result: pass.

## T6

**Skill test suite.** `python3 -m pytest skills/work-planner/test -q`: 507 passed, 1041 subtests passed. Result: pass.

## T7

**Skill file check.** `python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings. Result: pass.
