# Test Record — I11 E12 W05 and W06

> Test record · Created 2026-10-12

Revision under test: `013b2a62` on `i11/e12/w05-the-specification-rule-reads`, cut from `i11/e12/workspace` at `9ed47b0d`.

Every run is from the worktree `.worktrees/i11-e12-w05`, under the sandbox the skill guidelines name:

```bash
/home/mike1/projects/dev/workflow-server/scripts/sbx python3 -m unittest discover -s skills/test
```

## T1 Caller Count

The check's own suite, over a specimen catalog seeded in a temporary tree per case.

- **Silent.**  A specification its own file cites alongside one other file; one cited by its own file alone; one cited by two other files; one cited by none.
- **Reported.**  A specification cited from exactly one file other than the one holding it, in a `## Commands` section and in a catalog alike.
- **Result.**  Six cases, all passing. The case AC8 names is `test_a_specification_its_own_file_and_one_other_cite_stands`.

## T2 Catalog Listing

The same suite, over a specimen catalog carrying a Conventions section and an Issues section.

- **Silent.**  `### Execution` under `## Conventions`, cited from one other file.
- **Reported.**  `### Fetch issue` under `## Issues` of the same catalog, cited from one other file.
- **Result.**  Two cases, both passing. Each heading is cited once, so the pair separates the listing from the conventions rather than the citation from its absence.

## T3 Cross-Root Caller

The command itself, over two specimen skills in temporary trees with different parents, the second citing a specification of the first.

- **Reported.**  The citation draws a command-specification finding, and the command exits 1.
- **Result.**  One case, passing. At the base the same input raises `ValueError` out of `relative_to`.

## T4 Mode Section Presence

The same suite, over a specimen `plan-mode.md` per case.

- **Reported.**  A mode file carrying Rules and no Procedure; one carrying Procedure and no Rules; one carrying neither, which draws a finding for each.
- **Silent.**  A mode file carrying Procedure then Rules, and a file that is not a mode file carrying any section.
- **Result.**  Three cases, all passing, beside the conforming cases the suite already held.

## T5 Shared Check Suite

The whole suite, 45 tests, which is the 38 the base carried and the 7 these corrections add.

```text
Ran 45 tests in 0.010s

OK
```

## T6 The Check Over Every Skill

The rules bind every skill in the repository, so the check runs over all four, at the base and at this revision.

```bash
/home/mike1/projects/dev/workflow-server/scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop
```

```text
base            64 files checked, 52 findings
this revision   64 files checked, 31 findings
```

- **The check runs to completion over every skill.**  No file raises an error, and the exit status is 1 because findings stand.
- **Twenty-one one-caller findings go.**  Each names a specification the file holding it also cites: 11 in `work-planner/references/commands.md`, 5 in `canon-context.md`, 4 in `change-surface.md` and 1 in `revise-mode.md`.
- **Thirty one-caller findings stand.**  25 in `work-planner/references/commands.md`, 3 in `canon-context.md` and 2 in `change-surface.md`. W02 moves them, and this revision is the count it is scoped against.
- **The catalog correction moves no live finding.**  `### Execution` is the one third-level heading under a catalog's Conventions section across the four skills, and nothing cites its anchor, so the fault was latent.
- **No mode file gains a presence finding.**  Every `<name>-mode.md` in the four skills carries both Procedure and Rules.
- **One finding is outside this epic.**  gitnexus carries a 119-character inline bold lead, which predates the epic base.
