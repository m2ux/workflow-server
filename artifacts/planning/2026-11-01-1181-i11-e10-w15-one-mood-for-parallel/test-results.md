# W15 Test Results

> Test evidence · Created 2026-11-01

Evaluated at `6f79cf0dd3aa7f04fb16011c1dd562fbbbbbba12` on `i11/e10/w15-one-mood-for-parallel`: the unit cut from `i11/e10/workspace` at `ba441c2b8`, with that base merged in at `f0d01fd3f`.

Changed paths: `skills/scripts/check_skill_files.py`, `skills/test/test_check_skill_files.py`, `skills/guidelines.md`, `skills/workflow-canon/references/coverage.md`.

## T1

`ParallelSectionMood` in `skills/test/test_check_skill_files.py`, run under the full suite in T2.

- A set of Coverage siblings where Main states and Docker and Workflows direct reports Docker and Workflows, each naming the sibling that set the mood.
- A set opening in one mood, a run of command specifications, siblings of different kinds or parents, and openings the first words do not decide report nothing.

## T2

`python3 -m pytest skills/test skills/work-planner/test -q` under `sbx`: 716 passed, 1 skipped, 1140 subtests passed.

`skills/workflow-canon/test` fails 38 tests identically with and without this change: they need `CANON_TEST_ENGINE` to name an engine with its installed yaml package, which this host does not supply.

## T3

`python3 skills/scripts/check_skill_files.py skills/workflow-canon skills/work-planner skills/server-in-the-loop skills/gitnexus`: 76 files checked, 0 findings.

## T4

The same check over `skills/workflow-canon` as it stands at `ba441c2b8` reports the known defect and nothing else:

```text
workflow-canon/references/coverage.md:100: parallel section in another mood — Workflows Coverage directs, Main Coverage states
workflow-canon/references/coverage.md:115: parallel section in another mood — Docker Coverage directs, Main Coverage states
29 files checked, 2 findings
```

Across every workspace skill the first-word test decides 344 section openings (255 stating, 89 directing) and leaves 511 undecided; the two above are its only findings.
