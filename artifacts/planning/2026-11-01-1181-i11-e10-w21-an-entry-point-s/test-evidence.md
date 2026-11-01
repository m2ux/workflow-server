# Test Evidence — W21

> Delivery evidence · Branch `i11/e10/w21-an-entry-point-s` · Tested at `057755d08e0569c5565fc877e05b00b1757ce55b`, which carries `i11/e10/workspace` at `8e747419a`

Changed paths: `skills/scripts/check_skill_files.py`, `skills/test/test_check_skill_files.py`, `skills/guidelines.md`. Every run is local, from the unit's worktree, under `sbx`.

## T1

The entry-point specimens in the shared check's own suite, `EntryPointSections`.

```bash
python3 -m pytest skills/test/test_check_skill_files.py -q -k EntryPointSections
```

- 7 passed.
- Run against the base checker (`8e747419a`) with the same test file, five fail: section outside the set, section out of order, both together, a Procedure section in an entry point, and a contract matching every file. The two that pass there are the conforming and the empty entry point, which the base reports nothing for either.

## T2

The shared suite and the work-planner suite, which imports the checker.

```bash
python3 -m pytest skills/test -q
python3 -m pytest skills/work-planner/test -q
```

- `skills/test`: 91 passed.
- `skills/work-planner/test`: 625 passed, 1 skipped.

## T3

The shared check over the two skills whose entry points conform.

```bash
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon
```

- 68 files checked, 0 findings.

## Findings Beyond This Unit

The shared check over `skills/gitnexus` and `skills/server-in-the-loop` reports 38 findings at this revision, every one `section outside the set` on an entry point: 30 across five gitnexus entry points (debugging, exploring, guide, impact-analysis, refactoring) and 8 on `server-in-the-loop/SKILL.md`. Their restructuring is two further rows of this epic, [W30](w30.md) and [W31](w31.md).
