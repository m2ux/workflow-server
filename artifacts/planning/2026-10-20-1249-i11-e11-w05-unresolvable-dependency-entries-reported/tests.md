# Tests

The checks this unit's criteria require, and what each run observed. Every run is against `i11/e11/w05-unresolvable-dependency-entries-reported` at `e40310835`, from the repository root under the project sandbox.

## Board Resolution

`python3 -m pytest skills/work-planner/test/test_board.py`

`UnresolvableDependencies` reads one epic whose W01 links a merged pull request and whose W02 carries the cell under test.

- An entry spelled `E05 (W04)` names no row and links no issue, so the cell answers `UNRESOLVABLE` and the note reads `E01:W02: cannot resolve E05 (W04): it names no row and links no issue`.
- An entry naming `W07`, a row the epic does not carry, answers `UNRESOLVABLE` with `#3 has no such row`.
- An entry naming an issue the run was not given answers `UNRESOLVABLE` with `#2 is not given`, under `RowPrerequisites`.
- `W02`, a row of the table that has not been delivered, answers `UNMET` and appends no note, which is the distinction the criterion asks for.
- `W01`, delivered by a merged pull request, answers `MET`.
- A cell reading `W07, W08` names both entries, and `W02, W07` answers `UNRESOLVABLE`.
- An entry pointing into an epic whose Task cell carries two differently named links answers `UNRESOLVABLE` carrying that table's own reason, so reading every entry of a cell does not end the run on a table it cannot parse.

32 tests, all passed.

## Queue Placement

`python3 -m pytest skills/work-planner/test/test_board_queue.py`

`UnresolvableGates` runs the queue over one In Progress initiative whose E01 row carries the entry under test.

- With `E09 (W04)`, the run prints `unresolved: #1 [I01] Theme: Work E01: cannot resolve E09 (W04): it names no row and links no issue`, proposes no call naming Epic 4, and exits 1.
- With a link to E00, an ordinary prerequisite, the run prints no `cannot resolve` line, moves E00 from Backlog to Ready, and exits 0.
- With a row linking a task issue the run was not given, the note is printed while delivery is read, the placement is still made, and the run exits 0. The exit status follows the placements the run could not make, not the notes it printed.

33 tests, all passed.

## Dependency Check Wording

`python3 -m pytest skills/work-planner/test/test_deps.py`

`UnresolvableEntries` runs the check over one epic whose W02 carries the entry under test.

- `E05 (W04)` is reported as `E06:W02: cannot resolve E05 (W04): it names no row and links no issue`, exit 1, which is the board queue's line for the same entry.
- `W07` is reported as `E06:W02: cannot resolve E06:W07: no epic given carries that row`, exit 1. The second clause names what this run could not find, the epics it was given, where the queue's names the epic's own table.

Both tools name the entry as written and give it the same verdict, which is what the criterion holds them to.

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
- A line naming three ids accounts for no pair, so an enumeration sentence cannot empty the section.
- An `R=` path that does not exist is reported as `absent.md is unreadable` and the run exits 1, as is a file that is not UTF-8.

48 tests, all passed.

## Live Run

`python3 skills/work-planner/scripts/deps.py E11=<epic body> R=<hoist record's joins.md>`

Against I11:E11's published body and the hoist record's joins artifact, the joins section prints `none`: every eligible pair of that epic is accounted for in Joins or in the record. Without the `R=` argument the same run prints the twelve pairs, which is the report the criterion asks to see narrowed.

## Suites

`python3 -m pytest skills/work-planner/test skills/test`

470 tests and 933 subtests passed, covering the work planner's scripts and the shared skill-file checks.

`python3 skills/scripts/check_skill_files.py skills/work-planner`

49 files checked, 0 findings.

## Every Reader

The follow-on branch `skill/unresolvable-every-reader` at `2e0526ef3`, carrying the verdict into the delivery survey and the board sync.

`python3 -m pytest skills/work-planner/test/test_deliver.py`

- A row whose `Depends on` reads `E05 (W04)` prints `unresolvable I07:E00:W02: E05 (W04) cannot resolve`, while its free sibling is still offered as a unit. The summary reads `available: 1, held: 0, blocked: 0, unresolvable: 1` and the run exits 1.
- An epic whose initiative row carries an unresolvable prerequisite prints `unresolvable I07:E00:W01: its epic's prerequisite cannot resolve`, so the line names the gate the verdict came from rather than the row's own empty cell.
- A unit of one reserved row joined to one unresolvable row prints the unresolvable line and no hold line, and exits 1.

31 tests, all passed.

`python3 -m pytest skills/work-planner/test/test_board.py`

- A task gated on `E05 (W04)` draws no Status call of its own: the run prints `cannot resolve E05 (W04)`, names no change for that task issue, and exits 1.

33 tests, all passed.

`python3 -m pytest skills/work-planner/test skills/test` — 474 tests and 934 subtests passed.

`python3 skills/scripts/check_skill_files.py skills/work-planner` — 50 files checked, 0 findings.

## Review

`/code-review 1467` over the branch returned seven findings: four defects the branch introduced and three claims its artifacts overstated. Each is corrected in `e40310835`, whose commit body names them, and each correction carries a check in the sections above or a narrowed statement in the artifact.
