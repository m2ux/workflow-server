# E10 joins, coverage and dependency review

> Review · 2026-11-01 · [I11:E10](https://github.com/m2ux/workflow-server/issues/1181)

## Decisions

- **Joins.**
  - W03 + W10 join: the release link W10 writes is the work-item name W03 fixes, in the same `deliver.py` path.
  - W04 + W05 + W06 form one static-policy unit in `check_skill_files.py`; the W06 → W04 edge is dropped and the pull request orders it.
  - W11 + W13 remain joined.
  - W26 is separate from every other row; [E10 pairs](joins/E10-pairs.md) gives each independent pair one line.
- **Dependencies.**
  - W04 and W05 take no edge to W01: neither consumes its output, and a shared file within one epic is a rebase.
  - The zero-caller row and the Canon row depend on the caller-definition row, whose procedure-caller rule (AC33) both apply.
  - W27 names every row no other W27 prerequisite implies.
  - E14 W11 keeps its edge to E10 W27, the one point where every read-set input is settled.
- **Coverage.**
  - AC6 states the hard-wrap rule only, leaving the blank-line-above-heading rule to AC14.
  - AC38 carries the `27ea98734` regression run from [#1458](https://github.com/m2ux/workflow-server/issues/1458) AC4 as its evidence clause.
  - AC8 holds in `renumber.py` by a specimen run, but no repository test shows it; it stays on W02 with that test.
  - AC9 fails: `sync.py` skips an initiative pull request whose title names no epic.
  - AC20 fails: `closure.py` requires `auto_close_issues`, a setting no GitHub interface exposes.
- **Work items.**
  - [W26](work-items/e10/w26.md) is written from #1458; W02 names `sync.py` as its one component.

## Identity map

None of these rows is named by a pull request.

| Former task | Current task | Scope |
| --- | --- | --- |
| W23 | W19 | Caller placement and retrieval reach |
| W19 | W20 | A specification no procedure runs |
| W20 | W21 | Entry point sections |
| W21 | W22 | Canon conventions |
| W22 | W23 | Review Changes prose |

## Verification

- Dependency check over the revised body, all 27 work items and the pair record: no problem and no unaccounted pair. Longest chains: W19 → W20 → W27 and W19 → W22 → W27.
- Format check over the revised body: no finding.

## Follow-up

- [#1530](https://github.com/m2ux/workflow-server/issues/1530) restates the join rule around its one bar and has the dependency check propose units from shared components.
