# Parallel delivery assessment

## Completed reconciliation

User selected A to complete missing work-item records and reassess parallel delivery. All 53 unfinished rows in the six open epics have a linked work item: 25 new records and 28 existing records with explicit file-change declarations. Every record names implementation ownership, supporting instructions and tests, validation and a conservative complete change boundary. These are planning declarations, not delivered implementation or guaranteed final diffs.

The live issue and board snapshots retain task identifiers, criteria, dependencies, Joins, completion states and reservations. No delivery session, status change or priority-label change is part of this reconciliation. E17's existing reservation and user-selected first position remain in force.

## Contention and joins

The [inventory](work-items/inventory.json) and [pair-level report](work-items/contention.json) account for 536 overlapping write envelopes, including 368 pairs in different epics. Broad instruction audits and all-skill final verification deliberately reserve entire affected trees; the counts measure potential overlap, not predicted merge conflicts. Refine the declared envelope and rerun pair analysis before claiming narrower parallel safety.

- E17 overlaps E09 board/status behavior and E10 delivery behavior. Its final instruction audit intersects the other Work Planner instruction edits.
- E09 and E10 share sync implementation, fixtures and delivery evidence definitions.
- E13 and E10 share format implementation/fixtures and epic-body rules. E13's project declaration name/schema is an output of its first task; its configuration namespace stays reserved until then.
- E16 and the other Planner epics share issue, pull-request and delivery evidence definitions, structure declarations and audit scope.
- E14 intersects the shared checker, guidelines and both skills' instruction trees. E10 final verification covers every skill; E14 final efficacy explicitly consumes that result.
- All six epic pairs are conservatively separated by the proposed priority map. A file collision is scheduling contention, not an invented consumption dependency.

Existing joined units remain E09 W01/W02, E10 W04/W05, E10 W11/W13 and E14 W03/W04. Existing separate-pair records remain authoritative for separate PR decisions. Their separation does not authorize concurrent edits: overlapping units land serially on their epic base, and the next unit refreshes from that base. No new joins or semantic task edges were introduced.

## Proposed epic order — pending user decision

| Priority | Epic | Reason |
| --- | --- | --- |
| 6 | E17 #1482 | User-selected next delivery; supplies reviewed-handoff behavior. |
| 5 | E09 #1176 | Board and evaluated-revision behavior integrates after the review gate. |
| 4 | E13 #1373 | Project-required criteria contract settles before final conformance checks. |
| 3 | E16 #1474 | Capture and revision evidence commands settle before final all-skill verification. |
| 2 | E10 #1181 | Conformance behavior and all-skill verification use the preceding settled inputs. |
| 1 | E14 #1427 | Final citation corpus, manifests and retrieval verdict consume the conformance result. |

Larger numbers run first. This is a conservative total order over remaining epics, preserving the explicit E17 priority. It uses complete write envelopes; the raw dependency tool's priority output uses only equal primary-component strings and historical epic depth, and places E17 last. That output is retained as evidence but is not the proposed schedule. The active-epic priority labels are absent in the captured live state; publishing a map requires the user's next decision under Plan mode.

## Narrow parallel candidate

E10 W12 (Canon fixture setup) has no task prerequisite and no declared source-path overlap with either E17 unit. It is a candidate for a separately scoped task session while E17 runs, subject to fresh reservation/PR checks and branch preparation. This does not establish that the whole E10 epic can run alongside E17. E10 W25 is not similarly safe for the whole E17 delivery: its Hoist instruction edit intersects E17's final instruction audit envelope.

No additional work was dispatched. Starting a second session or changing epic priorities is a separate delivery/priority decision.

## Validation and limits

- Every unfinished row resolves to one work-item file; all 53 records contain one primary component, one file-change declaration and a concrete validation row.
- All six epic drafts were format-checked. Five pass; E09 retains only the intentional cancelled-AC1 numbering gap.
- The full dependency report has no active graph error, cycle or unaccounted active Joins pair. Historical closed-epic edges and pairs still cause a nonzero full-graph result and are preserved as agreed.
- The machine-readable pair report compares both declared planned outputs and existing paths at workspace commit 04de875a8517dcf229462e3b939099e16ffe3e63. Runtime tests were not run: this change updates planning records and issue links.
- E09's status design must integrate the reviewed-handoff contract. The proposed order places that producer first; the cross-epic consumption should be checked explicitly in the remaining dependency/source consistency pass rather than treating file overlap as its proof.
- The remaining original review work includes normative-source reconciliation and evidence for unchecked initiative criteria. F09's missing records and file declarations are resolved; unrestricted parallel delivery is not approved.

## Captured board state

- E09: In Progress.
- E10: Ready.
- E13: Backlog.
- E14: Backlog.
- E16: Backlog.
- E17: In Progress.
