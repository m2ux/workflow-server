# I11 initiative criterion verification

## Revision and scope

Verified on 2026-10-31 at clean workspace commit `04de875a8517dcf229462e3b939099e16ffe3e63`, also the current remote workspace head. PR #1479 merged into workspace at that commit. The named E11 producer is closed as completed with its delivered rows recorded. Planning evidence is read at engineering commit `ffe2147362ae4a886efeb70a2ff14b796183a502`; tracker inputs are fresh captures from this run.

Selected criteria: AC17, AC25, AC26, AC27 and AC28. This is criterion verification, not implementation, closure, board advancement or fresh certification of all already-ticked criteria.

## Results

| Criterion | Result | Evidence |
| --- | --- | --- |
| AC17 | Unverified; left unticked | Reviewed the planning-record inventory for all 13 open initiatives. I08 #946 has a record, found locally despite no initiative link, but its README indexes pair decisions and a scratch advisory only. The reviewed record does not establish the decision basis for the Git/GitHub/GitNexus outcome criteria AC1–AC10. Existing per-task records may supply that basis; their trace must be reconstructed and reviewed before a repository-wide pass is justified. This is an evidence gap, not proof that the decisions were never recorded. |
| AC25 | Pass; tick | `test_sync.PassedEvidence` within the 106-test sync suite covers observed/unobserved criteria, passed/unpassed checks, merge state, missing evidence links, fenced examples and combined covering rows. |
| AC26 | Pass; tick | The 18-test alignment suite converts legacy plans and distinguishes unreadable plans from missing observation; command-level cases exercise the reporting. |
| AC27 | Pass; tick | Alignment visibility fixtures diagnose private references in public issues, with public/private controls and unavailable-metadata cases. |
| AC28 | Pass for the stated row-identity invariant; tick | All 48 dependency fixtures pass. The merged dependency instrument ran over all 54 open epics with their closed siblings available; all 367 task rows are parsed by ID, and no active row-identity or unknown dependency/Joins resolution finding occurs. |

## Commands and outputs

Run from the clean workspace checkout through `scripts/sbx`:

```text
python3 -m unittest discover -s skills/work-planner/test -p test_sync.py -v
python3 -m unittest discover -s skills/work-planner/test -p test_align.py -v
python3 -m unittest discover -s skills/work-planner/test -p test_deps.py -v
```

Results: 106 + 18 + 48 = **172 passing tests**, all three commands exit 0. Full output: [sync](sync.log), [alignment](align.log), [dependency fixtures](deps-fixtures.log).

Each [live graph](graphs/) was passed to the merged `deps.py` as `E00=<body> E01=<body> ...`, grouped by initiative to avoid identifier collisions. Closed sibling bodies resolve referenced producers. [Dependency summary](dependency-summary.json) retains exact active findings and exit codes; [row identity comparison](row-identity-check.json) confirms no open row was silently skipped. Cross-initiative references are treated as external by the instrument; their delivery availability is not claimed here.

Full graph exit codes are nonzero for I00, I10 and I11 because of whole-epic edges/redundant edges retained elsewhere. Those are real plan findings, but do not fail AC28's narrower ID-reading requirement. No claim is made that every graph is clean or parallel-safe. Unrecorded Joins pair advisories are also retained in full outputs.

## AC17 disposition

[Inventory](planning-record-inventory.json) identifies the current 13 open initiatives and their resolvable planning references. I08's additional record is `artifacts/planning/2026-10-05-946-shared-libraries/README.md`, with `joins.md` and `advisory-scratch-check.md`; the corresponding body is captured in [#946](946-initiative.md). Its record existence alone cannot prove criterion decision coverage. The next reconciliation belongs to I08's planning evidence, followed by completion of the repository-wide decision trace. No retrospective decisions are invented, and no existing criterion is ticked merely because its epic closed.

## Publication boundary

The merged sync instrument accepts AC25–AC28 as ready against all 18 linked epic records; [tick output](tick-command.txt). Publication applies only those four ticks plus an evidence reference. AC17 remains unticked. Existing criteria, work-breakdown rows, priority labels, reservations, issue states and board placement are preserved. AC2/AC3's historical ticks are not a fresh claim that today's whole repository conforms; their earlier evidence is not re-certified by this targeted run.
