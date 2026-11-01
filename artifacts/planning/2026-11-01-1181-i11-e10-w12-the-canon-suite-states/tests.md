# W12 Test Evidence

> Test record · Created 2026-11-01

Each check run at `26f9c257` on `i11/e10/w12-the-canon-suite-states`, from the unit worktree, under the workspace sandbox (`scripts/sbx`). Changed paths: `skills/workflow-canon/test/audit_fixtures.py`, `skills/workflow-canon/test/test_audit_fixtures.py`, `skills/workflow-canon/SKILL.md`, `skills/workflow-canon/references/change-surface.md`.

## Baseline

At `ba441c2b8`, with `CANON_TEST_ENGINE` unset, `python3 -m unittest discover -s skills/workflow-canon/test` ran 76 tests: `FAILED (failures=38)`. Each failure was `CANON_TEST_ENGINE must name an engine with its installed yaml package`.

## T1

The fixture's skip test: an `AuditFixture` subclass run with `CANON_TEST_ENGINE` removed from the environment reports one skip carrying the prerequisite message, and no failure or error.

```text
python3 -m unittest discover -s skills/workflow-canon/test -p 'test_audit_fixtures.py' -v
test_unset_engine_skips (test_audit_fixtures.PrerequisiteTests.test_unset_engine_skips) ... ok
Ran 1 test in 0.001s
OK
```

## T2

The whole Workflow Canon suite in an environment that does not set the variable. No test fails; the 38 engine-bound tests skip.

```text
env -u CANON_TEST_ENGINE python3 -m unittest discover -s skills/workflow-canon/test
Ran 77 tests in 6.726s
OK (skipped=38)
```

## T3

The audit suite with the variable set to an engine checkout with installed dependencies (`.worktrees/engine-pin` at `e889276a`). The set-variable path is unchanged: every engine-bound test runs and passes.

```text
CANON_TEST_ENGINE=<engine-pin> python3 -m unittest discover -s skills/workflow-canon/test -p 'test_audit_*.py'
Ran 39 tests in 19.290s
OK
```

## T4

The shared skill-file check over the changed skill.

```text
python3 skills/scripts/check_skill_files.py skills/workflow-canon
29 files checked, 0 findings
```
