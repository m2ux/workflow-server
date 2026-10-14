# Placements

The candidate set the orphan listing produced on 2026-10-14, the placement the user chose for each, and what that placement changed.

## Candidates

Eight orphans and one cited standalone issue, from `orphans.py` over every issue in the repository.

| Issue | Subject | Placement | Kept or subsumed |
| --- | --- | --- | --- |
| [#1436](https://github.com/m2ux/workflow-server/issues/1436) | Meta close-out verifies outcomes against an unwritten variable | Existing task, I13:E03 W02 | Subsumed |
| [#1435](https://github.com/m2ux/workflow-server/issues/1435) | An absent session variable fails the result schema | New epic, I15:E04 | Kept |
| [#1430](https://github.com/m2ux/workflow-server/issues/1430) | A task issue raised at dispatch, gating its merge | New epic, I11:E15 | Kept |
| [#1429](https://github.com/m2ux/workflow-server/issues/1429) | Parallel sessions share one scratchpad | New task, I14:E02 W03 | Subsumed |
| [#1428](https://github.com/m2ux/workflow-server/issues/1428) | A `when` gate comparing an unresolved path | New task, I00:E01 W07 | Kept |
| [#1423](https://github.com/m2ux/workflow-server/issues/1423) | The coverage walk never runs on the branch it grades | New task, I14:E09 W04 | Subsumed |
| [#1416](https://github.com/m2ux/workflow-server/issues/1416) | Triage ledgers naming no commit | New task, I14:E04 W11 | Subsumed |
| [#1257](https://github.com/m2ux/workflow-server/issues/1257) | The host runs a `gh` predating the classic-projects fix | Leave | Standalone |
| [#924](https://github.com/m2ux/workflow-server/issues/924) | The scratch target the library write check writes to | Leave | Standalone |

## What each placement changed

- **#1436 into I13:E03 W02.**
  `target_workflow_outcomes` is the read [W02](https://github.com/m2ux/workflow-server/issues/982) already names, so the Already stated rule applies and no row was added. The outcome reaching past W02 — a close-out over a client workflow declaring no outcomes reporting that none were declared — became AC2 on the task and AC13 on the epic, cited by W02's Coverage. The task's References cite the orphan for the session bag, the gate and what inspecting the absent name returns.

- **#1435 as I15:E04.**
  No open epic of I15 covers the session tool's results. The orphan keeps its issue as the epic, with its three criteria unchanged in substance and two rows delivering them. The initiative took AC10, which its E04 row covers, and a Problem and a Proposal bullet for the projection that fails its own schema.

- **#1430 as I11:E15.**
  The subject is the planning scheme's own lifecycle, which no open I11 epic holds. The orphan keeps its issue as the epic. The initiative took AC34 for the task-merge gate and AC35 for the epic review mark, both covered by the E15 row. A concurrent session widened this epic while the hoist ran, adding the epic review readiness and the board-write jurisdiction; its version stands and the initiative row names it.

- **#1429 into I14:E02 W03.**
  The epic already holds one dispatched unit taking a shared resource from another. The scratchpad is the second such resource, so the epic's Overview, Problem and Proposal now read for the resources a unit holds rather than for the sidecar alone, and W03 covers AC4 and AC5.

- **#1428 as I00:E01 W07.**
  The epic settles one gate form, and a comparison against a path the value does not carry is the same family as what a declaration admits. The canon audit row moved from W07 to W08, which links no pull request. The epic took AC15 and AC16, and the orphan keeps its issue as the task. Its open question — whether an unresolved path refuses the gate or reports and takes the false arm — stands on the task.

- **#1423 into I14:E09 W04.**
  The epic holds each branch to a verdict of its own, and the coverage walk is the one check whose verdict never reaches a corpus branch tip. The row ordering put the walk trigger at W04 and the integration-branch gate at W05, which links no pull request. The epic took AC5, and the orphan's cost question stands as the epic's Open Question.

- **#1416 into I14:E04 W11.**
  The epic turns a defect class a reader finds into something that finds the next instance, and a verdict whose subject has moved is such a class. The canon audit row moved from W11 to W12. The epic took AC18, AC19 and AC20, and its Overview now names four classes.

- **#1257 left.**
  No initiative's goal covers which `gh` version the host runs, and the upgrade needs a package source the user authorises. An earlier hoist had already rewritten it into the standalone layout, and `format.py` reports nothing against it.

- **#924 left.**
  It records no work: it exists so a library write check has a target that is not a record of work. It sits on no board, and `format.py` reports nothing against it.

## Findings the checks reported

- **I00:E01 dependency problems predate this hoist.**
  `deps.py` reports the canon audit row naming W01, W02 and W03 where later rows already imply them. The rows are another epic's, and the finding is recorded here rather than corrected under a hoist.
- **Unjoined pairs are the standing state of the large epics.**
  I14:E04 reports every pair of its ten independent rows. [Joins](joins.md) names the pairs this hoist created.
