# W20 Test Results

Evaluated at `6963384d` on `i11/e10/w20-a-specification-no-procedure`, which merges `i11/e10/workspace` at `3b0df7b6`. Changed paths: `skills/scripts/check_skill_files.py`, `skills/test/test_check_skill_files.py`, `skills/guidelines.md`, `skills/workflow-canon/references/change-surface.md`, `skills/workflow-canon/references/revise-mode.md`.

## T1 Uncited Specification Fixtures

`python3 -m pytest skills/test/test_check_skill_files.py -k Uncited -rA`: 8 passed.

- Reported: a specification no procedure runs and nothing cites; a subject-owned (artifacts) command nothing cites.
- Kept: a step caller; a subject-owned command its own prose names; a sibling specification's citation; a prerequisite citation; descriptive prose in another file.
- The entry point's specification is reported once, as misplaced, and not as uncited.

## T2 Shared Skill-File Check Suite

`python3 -m pytest skills/test -q`: 122 passed. Four existing specimens held a specification nothing cited; three gained the citation their intent assumed, and `test_a_specification_nobody_cites_stands` became `test_a_specification_nobody_cites_is_reported`.

## T3 Shared Check Over Every Skill

`python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop`: 82 files checked, 0 findings. Before the Workflow Canon fix the check reported `Render Audit Surface` and `Run Audit Script Tests` in `change-surface.md`. `--compare` over the canon commit reports one section moved (`Run Audit Script Tests`, Change Surface to Revise Mode) and one differing (`Freshness and Resume`, the render sentence).

## T4 Skill Suites

- `python3 -m pytest skills/work-planner/test -q`: 690 passed, 1 skipped.
- `python3 -m unittest discover -s skills/workflow-canon/test -p 'test_*.py'`: 77 ran, OK, 38 skipped (engine-bound).
