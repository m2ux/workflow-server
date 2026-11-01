# Test Evidence — W09

Tested at `715e2b47c` on `i11/e10/w09-coverage-names-what-a`, which merges `i11/e10/workspace` at `41537ea98`.

## T1

**Coverage check against fault specimens.** `python3 -m pytest skills/work-planner/test/test_format.py -k CoverageNamesDelivery` runs six cases against a specimen epic: a ticked row with an empty Coverage cell and no dependent is reported; an open row with an empty cell is reported; a ticked row citing a criterion the epic lacks is reported; a ticked row naming its criteria, and a ticked row with an empty cell that a further row depends on by id or by range, are left. All six pass. Against the base's `format.py` the first case fails, so the specimen observes the fault.

## T2

**Work-planner suite.** `python3 -m pytest skills/work-planner/test -q` under `sbx`: 625 passed, 1 skipped.

## T3

**Skill-file check.** `python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.

## T4

**Live epic.** `format.py` run on #1181's body reports no Coverage finding, so no current E10 row departs from the rule.
