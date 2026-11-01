# W25 Test Results

Evaluated at commit `1af8df7d8` on `i11/e10/w25-a-declared-throwaway-is`, based on `i11/e10/workspace` at `ba441c2b8`.

Changed paths:

- `skills/work-planner/scripts/orphans.py`
- `skills/work-planner/test/test_orphans.py`
- `skills/work-planner/modes/hoist-mode.md`
- `skills/work-planner/artifacts/placement.md`

## T1

**Throwaway left out of both candidate groups** (AC36).

`cd <worktree> && sbx python3 -m pytest skills/work-planner/test/test_orphans.py -q` — 2 passed.

`Throwaways.test_a_throwaway_is_neither_an_orphan_nor_a_cited_standalone_issue` lists five issues: an initiative citing #3 and #4, an ordinary orphan #2, a `throwaway:two` issue #3 the initiative cites, an ordinary cited issue #4, and a `throwaway:one` orphan #5. The orphans group holds only #2, the cited standalone group holds only #4, and neither throwaway appears anywhere in the output.

With `orphans.py` reverted to its base and the test kept, the test fails (1 failed, 1 passed), so it observes the change.

## T2

**Hoist mode states the exemption** (AC37).

A read of `skills/work-planner/modes/hoist-mode.md`, Procedure step 2 (List candidates): "A declared throwaway target, an issue carrying a `throwaway:*` label, is not a candidate: it is a fixture a write check changes, so it stays open and belongs in no initiative." Placement's Candidate Issues definition and the `orphans.py` docstring state the same rule.

## T3

**Work-planner suite.**

`cd <worktree> && sbx python3 -m pytest skills/work-planner/test -q` — 620 passed, 1 skipped, 1136 subtests passed.

## T4

**Skill-file check.**

`cd <worktree> && sbx python3 skills/scripts/check_skill_files.py skills/work-planner` — 50 files checked, 0 findings.
