# W18 Validation

## Candidate

- Unit: I17:E02:W18, AC25.
- Task base: `a5435a843` (origin/i17/e02/workspace after W13 #1666).
- Task head: `072d45f64a2837863e06534535f4878a5a18bb72`, branch `i17/e02/w18-dependency-graph-fields-hold`.
- Owner: `skills/work-planner/artifacts/dependency-graph.md`.

## Clause Placement

| Clause (before) | Field keeps | Outcome now owned by |
| --- | --- | --- |
| Edges: every tool names the entry, leaves the row where it stands, exits nonzero | The three unresolvable forms; no delivery makes one resolvable | Unresolvable Entries guidance (shared reader outcome, linking Check Dependencies, Compute Board Queue's Unresolvable Dependencies and Compute Available Work's `unresolvable` report line); Check Dependencies states its own problem and nonzero exit |
| Joins: both resolutions stated where reported | What each resolution asserts | Check Dependencies prints both, so neither is the cheaper answer |
| Joins: the report names a dropped direct edge | The joined pull request orders that edge's commits | Check Dependencies prints each direct edge a join drops |
| Joins: split by rule, report names the reason, no record line asked | Such a candidate cannot join and needs no record line | Check Dependencies prints the reason and asks no record line |
| Epic Priority: ordered largest first in the report | The map | Check Dependencies prints it largest first (unchanged) |
| Numbering Map: a missing source or duplicate destination is refused | Every source present, destinations distinct | Renumber Tasks and Renumber Epics refuse (unchanged) |

No reader linked a moved clause by anchor; `board-delivery.md` and `epic-issue-body.md` still read true against the new homes.

## Observing Tests

New `FieldBoundary` and `InvalidReferences` classes in `test/test_deps.py`, five tests ([focused.log](focused.log)):

- Field-boundary reader: no Fields subsection states a reporting, refusal or exit outcome or a placement; Check Dependencies states each outcome; Unresolvable Entries states the shared outcome and every link it carries resolves to a heading. Run against the pre-change file, it fails on Edges, Joins, Epic Priority and Numbering Map and on the missing outcomes ([before.log](before.log)).
- Invalid references through `deps.main`: an entry naming no row, an entry linking an issue of an epic the run was not given, and a row the given epic does not carry each print `cannot resolve <entry as written>` and exit 1; a resolvable entry exits 0. The board-queue and board fixtures for the same cases (`UnresolvableGates`, `test_board`) pass unchanged in the full suite.

## Full Checks

- Planner: 1044 tests, one opt-in live-link skip, [planner.log](planner.log) (includes document, model, checkout and catalogue checks).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s work-planner/test -p test_deps.py -k FieldBoundary -k InvalidReferences -v   # skills
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```

## Limits

The field-boundary reader is lexical over one file: it proves the outcome vocabulary is absent from Fields and present in the owners, not that every reader's prose reads the same way.
