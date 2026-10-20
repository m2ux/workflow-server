# Tests

The checks this unit's criteria require, and what each run observed. Every run is against `i11/e11/w05-unresolvable-dependency-entries-reported` at `1b48a20fe`, from the repository root under the project sandbox.

## Board Resolution

`python3 -m pytest skills/work-planner/test/test_board.py`

`UnresolvableDependencies` reads one epic whose W01 links a merged pull request and whose W02 carries the cell under test.

- An entry spelled `E05 (W04)` names no row and links no issue, so the cell answers `UNRESOLVABLE` and the note reads `E01:W02: cannot resolve E05 (W04): it names no row and links no issue`.
- An entry naming `W07`, a row the epic does not carry, answers `UNRESOLVABLE` with `#3 has no such row`.
- An entry naming an issue the run was not given answers `UNRESOLVABLE` with `#2 is not given`, under `RowPrerequisites`.
- `W02`, a row of the table that has not been delivered, answers `UNMET` and appends no note, which is the distinction the criterion asks for.
- `W01`, delivered by a merged pull request, answers `MET`.
- A cell reading `W07, W08` names both entries, and `W02, W07` answers `UNRESOLVABLE`.

31 tests, all passed.

## Queue Placement

`python3 -m pytest skills/work-planner/test/test_board_queue.py`

`UnresolvableGates` runs the queue over one In Progress initiative whose E01 row carries the entry under test.

- With `E09 (W04)`, the run prints `unresolved: #1 [I01] Theme: Work E01: cannot resolve E09 (W04): it names no row and links no issue`, proposes no call naming Epic 4, and exits 1.
- With a link to E00, an ordinary prerequisite, the run prints no `cannot resolve` line, moves E00 from Backlog to Ready, and exits 0.

32 tests, all passed.

## Dependency Check Wording

`python3 -m pytest skills/work-planner/test/test_deps.py`

`UnresolvableEntries` runs the check over one epic whose W02 carries the entry under test.

- `E05 (W04)` is reported as `E06:W02: cannot resolve 'E05 (W04)': it names no row and links no issue`, exit 1.
- `W07` is reported as `E06:W02: cannot resolve E06:W07: no epic given carries that row`, exit 1.

Both messages carry the wording the board queue gives the same entry, which is what the criterion holds the two tools to.

## Joins Advisory

`python3 -m pytest skills/work-planner/test/test_deps.py`

`EligibleUnjoined` reads one epic of W01, W02 depending on W01, and W03.

- Each printed line reads `… can share a pull request: name each other in Joins, or account for the pair in the planning record`, naming both resolutions.
- The dependent pair W01 and W02 is absent, as before.

## Joins Record

`python3 -m pytest skills/work-planner/test/test_deps.py`

`RecordedPairs` runs the same epic with an `R=` record file.

- A record line naming `E06:W01 and E06:W03` removes that pair from the section.
- `E06:W02 and E06:W03`, named in neither Joins nor the record, is still reported.
- An `R=` path that does not exist is reported as `absent.md is unreadable` and the run exits 1.

46 tests, all passed.

## Live Run

`python3 skills/work-planner/scripts/deps.py E11=<epic body> R=<this record's joins.md>`

Against I11:E11's published body and the hoist record's joins artifact, the joins section prints `none`: every eligible pair of that epic is accounted for in Joins or in the record. Without the `R=` argument the same run prints the twelve pairs, which is the report the criterion asks to see narrowed.

## Suites

`python3 -m pytest skills/work-planner/test skills/test`

466 tests and 935 subtests passed, covering the work planner's scripts and the shared skill-file checks.

`python3 skills/scripts/check_skill_files.py skills/work-planner`

49 files checked, 0 findings.
