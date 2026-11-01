# W14 Test Evidence

> Test record · Created 2026-11-01

Each check run at `b98d4ee7` on `i11/e10/w14-closure-rests-on-observable` (its own commits `7e1a4c64`, `fb2fc226`, merged with `origin/i11/e10/workspace` at `41537ea9`), from the unit worktree, under the workspace sandbox (`scripts/sbx`) except where a step reaches GitHub. Changed paths: `skills/work-planner/scripts/closure.py`, `skills/work-planner/scripts/closure-sweep.py`, `skills/work-planner/scripts/sync.py`, `skills/work-planner/test/test_closure.py`, `skills/work-planner/test/test_closure_sweep.py`, `skills/work-planner/artifacts/issue.md`, `skills/work-planner/artifacts/pull-request.md`, `skills/work-planner/protocols/issue-closure.md`.

## Baseline

At `ba441c2b8`, `closure.py` required `--prs` and a hand-written snapshot carrying `complete: true` and `auto_close_issues: false`. GitHub exposes no field for the auto-close setting, so no run over a delivered issue could pass on exposed evidence alone.

## T1

The delivered-task specimen: a task issue with ticked criteria and one Development link, carried through a stand-in tracker, `links-by-issue.py` and `closure.py`. A merged link passes; an open one blocks; an unread relation writes no snapshot, which blocks.

```text
python3 -m pytest skills/work-planner/test/test_closure.py -v
test_closure.py::DeliveredTask::test_a_delivered_task_passes_on_its_captured_links PASSED
test_closure.py::DeliveredTask::test_an_open_delivery_keeps_the_task_open PASSED
test_closure.py::DeliveredTask::test_an_unread_relation_leaves_no_evidence_to_pass_on PASSED
```

## T2

The gate's evidence cases: an empty field adds no requirement; an issue the snapshot never read blocks as `Development links not captured`; a missing, non-JSON, non-mapping or malformed snapshot blocks as unreadable evidence; unmerged, closed and cross-repository links block by identity; unticked or absent criteria block; `--issue` and `--development` are the only inputs.

```text
test_closure.py::Closure::test_a_closed_unmerged_pr_blocks PASSED
test_closure.py::Closure::test_an_empty_development_field_adds_no_requirement PASSED
test_closure.py::Closure::test_every_linked_pr_must_merge PASSED
test_closure.py::Closure::test_links_never_read_are_missing_evidence PASSED
test_closure.py::Closure::test_no_input_beyond_the_issue_and_its_links PASSED
test_closure.py::Closure::test_same_number_in_different_repositories_is_distinct PASSED
test_closure.py::Closure::test_unreadable_evidence_blocks PASSED
test_closure.py::Closure::test_unticked_or_absent_criteria_block PASSED
11 passed, 9 subtests passed in 1.04s
```

## T3

The closure sweep, which shares the gate's rule, including a malformed link entry.

```text
python3 -m pytest skills/work-planner/test/test_closure_sweep.py -q
11 passed, 6 subtests passed in 0.76s
```

## T4

Read-only live run over a delivered task issue, m2ux/workflow-server#1520 (`[I11:E13:W04]`, closed as completed, delivered by #1525). Fetching the issue and capturing its links reach GitHub and run outside the sandbox; the gate runs inside it. Nothing is written to the tracker.

```text
gh api repos/m2ux/workflow-server/issues/1520 > issue-1520.json
python3 skills/work-planner/scripts/links-by-issue.py --issues issue-1520.json --out links-1520.json
1 issue(s), 1 link(s)
python3 skills/work-planner/scripts/closure.py --issue issue-1520.json --development links-1520.json
closure gate: passed; normal delivery checks must also pass
```

The snapshot holds `{"1520": [{"repo": "m2ux/workflow-server", "number": 1525, "state": "MERGED"}]}`.

## T5

The work-planner suite and the skill-file check.

```text
python3 -m pytest skills/work-planner/test -q
616 passed, 1 skipped, 1137 subtests passed in 27.99s
python3 skills/scripts/check_skill_files.py skills/work-planner
50 files checked, 0 findings
```
