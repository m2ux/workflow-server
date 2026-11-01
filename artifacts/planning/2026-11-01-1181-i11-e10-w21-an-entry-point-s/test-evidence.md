# Test Evidence — W21

> Delivery evidence · Branch `i11/e10/w21-an-entry-point-s` · Tested at `b3138edf7bb2b19dfe5afaac2df81ec39875aff1`, which carries `i11/e10/workspace` at `212bedd48`

Changed paths: `skills/scripts/check_skill_files.py`, `skills/test/test_check_skill_files.py`, `skills/guidelines.md`, `.github/workflows/verify-skills.yml`. T1 to T3 run locally, from the unit's worktree, under `sbx`; T4 is the gate job on GitHub.

## T1

The entry-point specimens in the shared check's own suite, `EntryPointSections`.

```bash
python3 -m pytest skills/test/test_check_skill_files.py -q -k EntryPointSections
```

- 7 passed.
- Run against the base checker (`212bedd48`) with the same test file, five fail: section outside the set, section out of order, both together, a Procedure section in an entry point, and a contract matching every file. The two that pass there are the conforming and the empty entry point, which the base reports nothing for either.

## T2

The shared suite and the work-planner suite, which imports the checker.

```bash
python3 -m pytest skills/test -q
python3 -m pytest skills/work-planner/test -q
```

- `skills/test`: 91 passed.
- `skills/work-planner/test`: 645 passed, 1 skipped.

## T3

The shared check over the two skills whose entry points conform.

```bash
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon
```

- 68 files checked, 0 findings.

## T4

The skill-check gate, `.github/workflows/verify-skills.yml`, on the pull request's head: every skill outside the exclusions meets the guidelines, and every excluded skill still reports a finding.

- [Run 41294357311](https://github.com/m2ux/workflow-server/actions/runs/41294357311) at `b3138edf7`: both jobs succeed. The run before the exclusions, at `057755d08`, failed the first job with the 38 entry-point findings.

## Findings Beyond This Unit

The shared check over `skills/gitnexus` and `skills/server-in-the-loop` reports 38 findings at this revision, every one `section outside the set` on an entry point: 30 across five gitnexus entry points (debugging, exploring, guide, impact-analysis, refactoring) and 8 on `server-in-the-loop/SKILL.md`. The gate holds both skills in its exclusions with those findings stated. Their restructuring is two further rows of this epic, [W30](../2026-11-01-1181-i11-e10-w30-the-gitnexus-entry-points/w30.md) and [W31](../2026-11-01-1181-i11-e10-w31-the-server-in-the/w31.md), each of which removes its skill from the exclusions.
