# Pre-Cutover Fixes — November 2026

> Planning record · Created 2026-11-02

## Executive Summary

This record plans I17, which delivers every Work Planner skill fix found before the skill's cutover into workflow-server's `workspace` branch, ahead of I16's extraction of the skill to prosiform-skills. One epic, Pre-Cutover Fixes, holds each fix as a task row, and a fault found later joins it as a further row. Skill Style (E01) and Skill Separation (E02) prepare the skill for its new home, and Delivery Lanes (E03) adds the lanes a workspace needs before the extraction.

It matters because I16 moves the skill with its content unchanged, and workflow-server then drops its copy. A fix merged after the extraction is cut would reach only the copy that is dropped, so I16's extraction row waits on this epic.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Decisions](decisions.md) | The user's decisions, the planning decisions taken from them, and the departures from the skill |
| [Goal trace](goal-trace.md) | The goal clauses traced to the criteria and the epic, the ranked gaps and the outside threats |
| [Review](review.md) | Each review finding and its resolution |
| [Dependency report](dependencies.txt) | The dependency, joins, contention and priority report |
| [I17 body](bodies/i17.md) | The initiative body as saved |
| [E00 body](bodies/e00.md) | The epic body as saved |
| [E00 W01](e00/w01.md) | Planning commits directly to engineering |
| [E00 W02](e00/w02.md) | Not-planned epic leaves its initiative |
| [E00 W03](e00/w03.md) | Board sync removes uncited not-planned items |
| [E00 W04](e00/w04.md) | Sync reads every linked pull request |
| [E01 body](bodies/e01.md) | Skill Style scope, command presentation and checker/migration criteria |
| [E02 body](bodies/e02.md) | Skill Separation body with task-table lanes |
| [E02 SOLID guidelines](e02/solid-guidelines.md) | The SOLID guidelines draft E02 W01 lands |
| [E02 Field boundaries](e02/fields-and-transformations.md) | Confirmed Status Changes extraction, whole-skill candidate audit and regression matrix |
| [E02 W06](e02/w06.md) | Board Status owns the proposed status-change contract and its transformations. |
| [E02 W07](e02/w07.md) | Board Delivery obtains status decisions through Board Status and applies their results. |
| [E02 W08](e02/w08.md) | Hot-fix uses the extracted status contract through its owning procedure. |
| [E02 W09](e02/w09.md) | Work Planner checks report hidden-transform candidates under Fields with useful evidence. |
| [E02 plan review](e02/fields-plan-review.md) | Goal/coverage review, checks and explicit evidence limits |
| [E02 format result](e02/fields-format.log) | Final draft has no format or decision findings |
| [E02 dependency result](e02/fields-dependencies.log) | Join, ordering and dependency checks with retained baseline advisory |
| [E02 plan audit](e02/fields-plan-audit.json) | Exact new joined unit, components and preserved producer edge |
| [Saved E02 readback](e02/fields-epic-readback.json) | Exact published body, retained identity/state/priority and linked work items |
| [Saved E02 format result](e02/fields-saved-format.log) | Published body has no format or decision findings |
| [E03 body](bodies/e03.md) | The Delivery Lanes epic body as saved |
| [E03 W01](e03/w01.md) | Work item declares an optional lane |
| [E03 W02](e03/w02.md) | Task table carries the lane column |
| [E03 W03](e03/w03.md) | Work item holds its component declaration |
| [E03 W04](e03/w04.md) | Joined rows share one lane |
| [E03 W05](e03/w05.md) | Dependency check reads task table lanes |
| [E03 W06](e03/w06.md) | Lane cells validate and survive table writes |
| [E03 W07](e03/w07.md) | Delivery plan admits units by lane |
| [E03 W08](e03/w08.md) | Available-work survey filters units by lane |
| [E03 W09](e03/w09.md) | Deliver mode passes the requested lane |
| [E03 W10](e03/w10.md) | Plan mode writes task row lanes |
| [E03 W11](e03/w11.md) | Board queue reports Ready units' lanes |
| [E03 W12](e03/w12.md) | Board-queue script prints Ready unit lanes |
| [E03 W13](e03/w13.md) | Advance mode reports Ready unit lanes |
| [E03 W14](e03/w14.md) | Cross-epic joins receive bounded diagnostics |
| [Lane-column review](e03-lane-column-review.md) | Confirmed storage contract, goal trace, dependency review and publication checks |
| [Lane-column dependencies](e03-lane-column-dependencies.txt) | Dependency and join checks of the revised E03 rows |
| [Lane-column row map](e03-lane-column-renumbering.json) | Preserved delivery, undelivered-row numbering and criterion disposition |
| [Arising-task dependencies](e03-arising-dependencies.txt) | Current E03 graph including the bounded cross-epic-join diagnostic task |
| [E02 prerequisite cleanup](e02/prerequisite-cleanup.md) | Required context boundaries, task allocation and structural/live verification |
| [E02 prerequisite survey](e02/prerequisite-survey.json) | Pinned prerequisite graph, cyclic component, route closures and source hashes |
| [E02 survey instrument](e02/prerequisite-survey.py) | Reproducible static prerequisite survey |
| [E02 prior epic snapshot](e02/prerequisite-epic-before.json) | Live issue identity, body and labels before the planned revision |
| [E02 prerequisite plan audit](e02/prerequisite-plan-audit.json) | Preserved rows/ordering, criterion ownership and implementation boundary |
| [E02 prerequisite review](e02/prerequisite-plan-review.md) | Scope, goal trace, coverage, validation and publication limits |
| [E02 prerequisite format check](e02/prerequisite-format.log) | Zero-finding draft validation |
| [E02 prerequisite dependencies](e02/prerequisite-dependencies.log) | Current initiative dependency/join validation and retained advisory |
| [E02 dependency input snapshots](e02/prerequisite-dependency-inputs.json) | Current initiative and sibling epic records used by the check |
| [E02 prerequisite saved readback](e02/prerequisite-epic-readback.json) | Exact published body and retained issue metadata |
| [E02 retained preparation plan](e02/retained-preparation.md) | Approved reuse follow-up, upstream ownership and regression matrix |
| [E02 W10](e02/w10.md) | Protocol selection and verified capacity-wait resume |
| [E02 retained plan audit](e02/retained-plan-audit.json) | New row/criterion ownership, unchanged existing rows and upstream state |
| [E02 prior retained-plan snapshot](e02/retained-epic-before.json) | Current issue before publishing the approved follow-up |
| [E02 retained plan review](e02/retained-plan-review.md) | Goal/ownership review, coverage, graph findings and publication limits |
| [E02 retained format check](e02/retained-format.log) | Zero-finding draft validation |
| [E02 retained dependencies](e02/retained-dependencies.log) | Graph, component and numbering checks |
| [E02 retained dependency inputs](e02/retained-dependency-inputs.json) | Current initiative and sibling issue snapshots used for validation |
| [E02 retained saved readback](e02/retained-epic-readback.json) | Exact published body and preserved metadata |
| [E02 retained saved format check](e02/retained-saved-format.log) | Zero-finding saved-body validation |
| [E02 policy clarifications](e02/policy-clarifications.md) | Four inherited ambiguities, decision records, owners and scenario matrix |
| [E02 policy plan audit](e02/policy-plan-audit.json) | Preserved row/criterion contracts and changed coverage |
| [E02 prior policy snapshot](e02/policy-epic-before.json) | Live issue body and metadata before the approved planning update |
| [E02 policy draft snapshot](e02/policy-epic-draft.json) | Draft body with complete existing issue context |
| [E02 policy dependency inputs](e02/policy-dependency-inputs.json) | Current parent and all sibling epic snapshots |
| [E02 policy plan review](e02/policy-plan-review.md) | Goal, grain, ownership, checks and publication limits |
| [E02 policy format result](e02/policy-format.log) | Zero-finding final draft validation |
| [E02 policy dependency result](e02/policy-dependencies.log) | Current row graph and retained advisory |
| [E02 policy saved readback](e02/policy-epic-readback.json) | Exact saved issue body and preserved metadata |
| [E02 policy saved format](e02/policy-saved-format.log) | Zero-finding validation after issue publication |
| [Board Status scope review](e02/board-status-scope-review.md) | Artifact ownership, protocol assessment and unchanged task/criterion contracts |
| [Board Status prior snapshot](e02/board-status-scope-before.json) | Fresh E02 body and metadata before the scope clarification |
| [Board Status draft snapshot](e02/board-status-scope-draft.json) | Revised E02 body with current issue context |
| [Board Status scope format](e02/board-status-scope-format.log) | Zero-finding draft validation |
| [Board Status saved readback](e02/board-status-scope-readback.json) | Exact published E02 body and unchanged metadata |
| [Board Status saved format](e02/board-status-scope-saved-format.log) | Zero-finding published-body validation |

## Links

| Resource | Link |
| --- | --- |
| Initiative | [I17](https://github.com/m2ux/workflow-server/issues/1597) |
| Pre-Cutover Fixes | [I17:E00](https://github.com/m2ux/workflow-server/issues/1598) |
| Skill Separation | [I17:E02](https://github.com/m2ux/workflow-server/issues/1615) |
| Skill Style | [I17:E01](https://github.com/m2ux/workflow-server/issues/1616) |
| Delivery Lanes | [I17:E03](https://github.com/m2ux/workflow-server/issues/1625) |
| The initiative waiting on the lane filter | [m2ux/prosiform I10](https://github.com/m2ux/prosiform/issues/464) |
| The cutover this initiative precedes | [m2ux/prosiform-skills I16](https://github.com/m2ux/prosiform-skills/issues/1) |
| The extraction row that waits on it | [m2ux/prosiform-skills I16:E00](https://github.com/m2ux/prosiform-skills/issues/2) |
| Skill at the planned revision | [workspace@785a5ee8c](https://github.com/m2ux/workflow-server/tree/785a5ee8c715b802498aa41712e0489425a22cfa/skills/work-planner) |
| Board | [Process: How Work Is Planned and Delivered](https://github.com/users/m2ux/projects/17) |

## Delivery Failure Recovery

[E04](https://github.com/m2ux/workflow-server/issues/1654) owns the approved inherited draft-restoration and merge-refusal gaps at priority 6. Its [planning record](../2026-11-06-1597-delivery-failure-recovery/README.md) owns the design, task files and review evidence.

## E01 Completed Integration

[PR #1641](https://github.com/m2ux/workflow-server/pull/1641) merges the reviewed style model into workspace at 9a924cfdda903ca64257449d8b5bf2ff762725ce. [Closeout evidence](../2026-11-06-1616-integration-closeout/README.md) confirms E01 closed/completed, board Done and its initiative row Done after fresh delivery and Development-link gates. E02/E04/E05 and initiative AC1 remain incomplete.
