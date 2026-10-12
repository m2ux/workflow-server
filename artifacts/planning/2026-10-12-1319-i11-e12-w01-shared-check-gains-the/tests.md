# Test Record — I11 E12 W01

> Test record · Created 2026-10-12

Revision under test: `691bb853` on `i11/e12/w01-shared-check-gains-the`, cut from `i11/e12/workspace` at `fae97e9e`.

Every run is from the worktree `.worktrees/i11-e12-w01`, under the sandbox the skill guidelines name:

```bash
/home/mike1/projects/dev/workflow-server/scripts/sbx python3 -m unittest discover -s skills/test -p test_check_skill_files.py
```

## T1 Specification Placement Rule

The check's own suite, over a specimen skill seeded in a temporary tree per case.

- **Reported.**  A `## Commands` sub-section cited from exactly one file other than the one holding it, and a catalog entry under `# Commands` cited the same way.
- **Silent.**  The same specification cited from two files, cited from none, cited only by the file holding it, and a third-level heading under a section that is not Commands.
- **Result.**  Six cases, all passing.

## T2 Mode Section Rule

The same suite, over a specimen `plan-mode.md` per case.

- **Reported.**  A second-level heading outside Prerequisites, Procedure, Reference, Rules, Commands; those sections carried out of that order.
- **Silent.**  A mode file carrying Procedure then Rules; a file that is not a mode file carrying any section.
- **Result.**  Four cases, all passing.

## T3 Shared Check Suite

The whole suite, 38 tests, which is the 28 the check already carried and the 10 these rules add.

```text
Ran 38 tests in 0.011s

OK
```

## T4 The Check Over Every Skill

The rules bind every skill in the repository, so the check runs over all four.

```bash
/home/mike1/projects/dev/workflow-server/scripts/sbx python3 .worktrees/i11-e12-w01/skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop
```

```text
64 files checked, 67 findings
```

- **The check runs to completion over every skill.**  No file raises an error, and the exit status is 1 because findings stand.
- **Eight findings are the ones the base already carried.**  Five duplicate anchors, two wide bold leads and one trailing blank line.
- **Fifty-one specifications have one caller.**  36 in `work-planner/references/commands.md`, 8 in `canon-context.md`, 6 in `change-surface.md` and 1 in `revise-mode.md`. W02 moves them.
- **Eight sections stand outside the mode set.**  Brief in `deliver-mode.md`, Placements in `hoist-mode.md`, four in `review-mode.md` and two in `audit-mode.md`. W03 and W04 move them.
- **No mode file carries its sections out of order.**  The rule reports none across the four skills.
- **gitnexus gains no finding from either rule.**  Its one wide bold lead predates this branch and is outside the epic's scope.
