# Test Results

Measured at base `d1dea57e` and at head `89ba8e2a` of `i11/e12/w13-workflow-canon-specifications-move`, from the worktree holding the branch.

## T1 Command Specification Check

The shared skill-file check over the Workflow Canon skill, which reports every command specification exactly one other file's procedure runs.

```text
$ scripts/sbx python3 skills/scripts/check_skill_files.py skills/workflow-canon
```

| Revision | Output |
| --- | --- |
| Base | 29 files checked, 6 findings |
| Head | 29 files checked, 0 findings |

The six at the base, each with the file whose procedure runs it:

| Specification | Stood in | Run from |
| --- | --- | --- |
| List Units for a Construct | `references/canon-context.md` | `references/audit-mode.md` |
| Fetch Unit | `references/canon-context.md` | `references/audit-mode.md` |
| Run the Edit Guard Tests | `references/canon-context.md` | `references/revise-mode.md` |
| Plan Audit Assignments | `references/change-surface.md` | `references/audit-dispatch.md` |
| Bind Audit Agent | `references/change-surface.md` | `references/audit-dispatch.md` |
| Write Audit Packet | `references/change-surface.md` | `references/audit-dispatch.md` |

**Result.** Pass. Zero findings over the skill's 29 files, which is the observation AC13 names.

## T2 Work Planner Check Unregressed

The same check over the sibling skill the epic has already moved, so the shared rule still reads it clean.

```text
$ scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner
```

| Revision | Output |
| --- | --- |
| Base | 29 files checked, 0 findings |
| Head | 29 files checked, 0 findings |

**Result.** Pass.

## T3 Specification Body Comparison

Every third-level section in the skill is extracted at the base and at the head, keyed by its heading, with each markdown link target reduced to its fragment so a retarget reads as a retarget and anything else reads as a difference. The comparison covers the whole skill, not only the six, so a specification damaged anywhere in the move is reported.

```text
91 sections at base, 91 at head, 1 with a difference

MOVED    Bind Audit Agent            change-surface.md -> audit-dispatch.md
MOVED    Fetch Unit                  canon-context.md  -> audit-mode.md
MOVED    List Units for a Construct  canon-context.md  -> audit-mode.md
MOVED    Run the Edit Guard Tests    canon-context.md  -> revise-mode.md
MOVED    Write Audit Packet          change-surface.md -> audit-dispatch.md
DIFFERS  Plan Audit Assignments      change-surface.md -> audit-dispatch.md
    -- Read [Sizing](#sizing) first. Select `inventory`, `map`, `verify`, `evaluate` or `obligations`. Unknown limits, unmet gates or indivisible oversized context refuse dispatch.
    +- Select `inventory`, `map`, `verify`, `evaluate` or `obligations`. Unknown limits, unmet gates or indivisible oversized context refuse dispatch.
```

- **The one difference is accounted for.**
  Sizing stands above the Commands section in the destination file. The shared guidelines drop a prerequisite citation within one file, because position carries the requirement, and the shared check reports one that survives. The rest of the bullet stands unchanged.
- **The section count holds at 91.**
  No section was lost, gained or emptied, so no heading stands without its specification.
- **The link targets each body carries.**
  `Fetch Unit` names `canon-context.md#list-units`, `Write Audit Packet` names `#returns`, and the three dispatch steps name their specifications in their own file. Each is a retarget of an anchor whose holding file changed.

**Result.** Pass. Five bodies identical, one difference accounted for.

## T4 Check Suite

The shared check's own unit tests, which the rule under test belongs to.

```text
$ scripts/sbx python3 -m unittest discover -s skills/test -p test_check_skill_files.py
Ran 57 tests in 0.019s
OK
```

**Result.** Pass. 57 of 57, no regression.

## T5 Workflow Canon Suite Unregressed

The skill's own suite, measured at the base and at the head.

```text
$ scripts/sbx python3 -m unittest discover -s skills/workflow-canon/test -p 'test_*.py'
```

| Revision | Output |
| --- | --- |
| Base | Ran 76 tests, FAILED (failures=38) |
| Head | Ran 76 tests, FAILED (failures=38) |

**Result.** Pass on the measure this row makes, which is that the counts are identical.

- **Evidence gap.**
  38 of the 76 fail on an unset `CANON_TEST_ENGINE`, at the base as at the head. The failures are pre-existing and tracked as [E10 W12](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-12-1325-i11-e10-w12-canon-suite-the-prerequisite-stated/w12.md). Those 38 tests observe nothing about this change, so the suite's evidence over the move is the 38 that pass and the equality of the two counts.
