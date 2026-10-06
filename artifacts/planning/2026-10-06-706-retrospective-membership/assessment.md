# Assessment

Every pull request merged to `workflow-server` between 2 and 6 October 2026 whose title carried no initiative reference, read against I04's Problem statements. The test applied: does the change pay down cost the definitions or the server already carry, rather than add a capability or correct a delivery still in flight?

## Admitted

### #1118 — Declared values: a phase that cites the set records every member

Merged 2026-10-02 to `main`. Changes [`guards/check-declared-values.ts`](https://github.com/m2ux/workflow-server/blob/ab680d9d/guards/check-declared-values.ts) and its test.

A protocol phase that set an output to a member of its declared values had to repeat every member in backticks or the guard read the output as unrecorded. The contract-not-procedure entry wants that roster on the output alone, so a phase written to one rule failed the other. The guard now admits the members when a step names the output and its `#### values`, and still fails a phase that settles one sibling and never names the rest.

This is a check reporting a defect the corpus does not carry. I04 states no such class, so it opens E10 with #1158.

### #1144 — canon: inherited-input-never-spent

Merged 2026-10-05 to `workflows`. Adds AP-166 to the anti-pattern catalogue.

The entry names the class [E09](https://github.com/m2ux/workflow-server/issues/1138) pays down: a container contract delivering a required input to a descendant that never reads it, bound from a workflow holding nothing of that name. E09 cites it only under References, and its W01 depends on it, so the entry was built as I04 work and recorded as none.

### #1145 — canon: inherited-input-never-spent reads the delivered slot

Merged 2026-10-05 to `workflows`. Corrects four Contract and four Hygiene defects a canon audit found in AP-166.

The harm now states what the server's binding resolver actually produces — a required slot shown as ambient context — and the Fires-on line reaches `technique.protocol`, `technique.rules` and `routine.steps`, so an edit to a protocol loads the entry. Same task as #1144: one entry, two pull requests.

### #1155 — Triage every guard finding the corpus carries

Merged 2026-10-05 to `workflows`. Changes `12-strategic-review.yaml`, two ledgers and the walk snapshot.

`strategic-review` declared a read of `push_remote` and a write of `strategic_review_findings` that its own steps neither make nor produce. Both declarations are gone, the `binding-fidelity` ledger drops a triaged orphan input that no longer occurs, and two repeated runs are re-keyed to the shapes hoisting `is_signed` produced.

This is [E07](https://github.com/m2ux/workflow-server/issues/1116) W01, "Clear the activity-variables findings". Measured at `ccdaa64d`, the sweep failed three guards; at `38bc4aea` it passes all 58.

### #1158 — Read the activity loop as the routine declares it

Merged 2026-10-06 to `main`. Changes `tests/batch-loop-walk.test.ts` and `docs/api.md`.

The walk model applied an effects table per body step and tolerated a step with no row. The commit step logged and returned nothing where `persist-activity` returns `push_landed`, so every walk ended on its first activity with the push read as failed — all eleven of the failures `main` carried. A renamed step lost its row, and the entry pair was walked on one branch only. A body step with no row, and a row naming no step, now each fail and name the step.

Second class alongside #1118: a check that cannot tell the model's own drift from a defect in what it measures.

## Left outside

| Pull request | Why |
| --- | --- |
| [#1107](https://github.com/m2ux/workflow-server/pull/1107), [#1109](https://github.com/m2ux/workflow-server/pull/1109), [#1110](https://github.com/m2ux/workflow-server/pull/1110), [#1111](https://github.com/m2ux/workflow-server/pull/1111), [#1113](https://github.com/m2ux/workflow-server/pull/1113), [#1115](https://github.com/m2ux/workflow-server/pull/1115) | Work-planner skill rules. Outside the initiative's theme and its subject. |
| [#1121](https://github.com/m2ux/workflow-server/pull/1121), [#1122](https://github.com/m2ux/workflow-server/pull/1122), [#1127](https://github.com/m2ux/workflow-server/pull/1127), [#1128](https://github.com/m2ux/workflow-server/pull/1128), [#1129](https://github.com/m2ux/workflow-server/pull/1129), [#1130](https://github.com/m2ux/workflow-server/pull/1130), [#1134](https://github.com/m2ux/workflow-server/pull/1134), [#1136](https://github.com/m2ux/workflow-server/pull/1136), [#1137](https://github.com/m2ux/workflow-server/pull/1137) | Work-planner and workflow-canon skill rules, as above. |
| [#1105](https://github.com/m2ux/workflow-server/pull/1105) | Registers the workflow-canon edit guard as a post-edit hook. Write-time canon enforcement, which is I09. |
| [#1123](https://github.com/m2ux/workflow-server/pull/1123) | Branch commits stay unsigned and the user signs the merge. A behaviour change, not a cost already carried. |
| [#1149](https://github.com/m2ux/workflow-server/pull/1149) | Routines sequence the walk and techniques keep the reading. A restructure that adds capability. |
| [#1151](https://github.com/m2ux/workflow-server/pull/1151) | The engine side of #1149: three names pointing at files #1149 retires. It belongs to that delivery. |
| [#1154](https://github.com/m2ux/workflow-server/pull/1154) | The opening agent receives the walk it drives. Closes #1153, and adds a route that did not exist. |
| [#1135](https://github.com/m2ux/workflow-server/pull/1135) | Carries the `[I08:E03]` reference already. |
