# Assumptions Log

> Parallel activities · [#671](https://github.com/m2ux/workflow-server/issues/671) · updated 2026-09-09

## Log

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | A graph destination is a single activity-id string (or `__terminal__`) — that is the constraint the feature has to lift | Code: [GraphSchema](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/workflow.schema.ts#L51); [validateExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L565) compares `destination` to the sentinel and to known activity ids as a string | Validated |
| DP-2 | Design Philosophy | Complexity Assessment | M | Changing how a destination is represented is not a local edit — [getExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L496) is the meeting point of exits and the graph | Code: four direct callers (`validateReportedExit`, `validateActivityManifest`, `registerWorkflowTools`, `exitDestinations`) and eight affected processes | Validated |
| DP-3 | Design Philosophy | Problem Interpretation | M | The documents indexed from [index.md](index.md) are the design to implement, not a greenfield redesign — the request named that index | User | Confirmed |
| DP-4 | Design Philosophy | Workflow Path | M | Elicitation can be skipped because those documents already state the requirements — the path gate selected research-only; moderate problems otherwise warrant the full path | User | Confirmed |
| RS-1 | Research | Synthesis Decisions | L | The specification's destination union, derived wait-for-all join, isolation-then-combine, and one-branch replacement are the conventional solutions — WCP-2/WCP-3/WCP-14, Step Functions Parallel/Map, Temporal Promise.all, Airflow expand(), EIP Scatter-Gather | [04-kb-research.md](04-kb-research.md) Recommended Approach; multiple independent sources | Validated |
| RS-2 | Research | Pattern Applicability | M | The derived join is WCP-3 implicit AND-join (BPEL / WebSphere family), not BPMN implicit incoming (XOR). Authoring names frontier-empty as the barrier. | WCP-3 Implementation; [Camunda parallel-gateway thread](https://forum.camunda.io/t/use-of-parallel-gateway/32049); specification derived-join | Validated |
| RS-3 | Research | Source Relevance | L | Industry engine docs apply at the routing-semantics grain (split, join, map, isolate, width cap) and not at enclosed-state or mechanical-runner grain | Step Functions self-contained branches; Temporal code-in-workflow parallel; this engine is agent-led graph walk | Validated |
| RS-4 | Research | Risk Assessment | M | Fail-fast (Step Functions Parallel; GitHub Actions `fail-fast`) must not leak into the fan: a failure costs one branch, then blocks | Specification "One branch of several failing to return"; Temporal retry-one-child | Validated |

## Wrap-Up

8 assumptions — all validated/confirmed.
