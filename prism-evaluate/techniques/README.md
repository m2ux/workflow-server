# Evaluation Workflow — Techniques

> Part of the [Evaluation Workflow](../README.md)

## Techniques

The operation library for the evaluation workflow. Each operation is one capability an activity step binds; its protocol, inputs, outputs and rules are defined in its own file. This file indexes them.

| Technique group | Capability |
|-----------------|------------|
| [`plan-evaluation`](plan-evaluation/TECHNIQUE.md) | Turning an evaluation request into a runnable plan: the target's kind and structure, the dimensions, and each dimension's prism configuration |
| [`execute-analysis`](execute-analysis/TECHNIQUE.md) | Composing each execution group's trigger context, and recording the run it produced |
| [`compose-evaluation-report`](compose-evaluation-report/TECHNIQUE.md) | Consolidating the per-dimension findings of sibling runs into one evaluation of the target |
| [`resolve-findings`](resolve-findings/TECHNIQUE.md) | Carrying each finding from a criticism to a decided, applied change |

[`TECHNIQUE.md`](TECHNIQUE.md) holds the evaluation's standing context — the target, the goals, and the output directory.

---

## Operations by Group

### plan-evaluation

| Operation | Capability |
|-----------|------------|
| [`collect-scope`](plan-evaluation/collect-scope.md) | Establish the scope from the user's request |
| [`classify-target`](plan-evaluation/classify-target.md) | Resolve the target's kind |
| [`derive-dimensions`](plan-evaluation/derive-dimensions.md) | Settle the evaluation dimensions |
| [`create-output-folder`](plan-evaluation/create-output-folder.md) | Materialise the output directory |
| [`summarize-scope`](plan-evaluation/summarize-scope.md) | Gather the settled scope into one summary |
| [`survey-target`](plan-evaluation/survey-target.md) | Survey the target's structure, claims and topics |
| [`map-dimensions-to-lenses`](plan-evaluation/map-dimensions-to-lenses.md) | Fix each dimension's lens configuration |
| [`group-for-execution`](plan-evaluation/group-for-execution.md) | Collect dimensions into execution groups |
| [`write-evaluation-plan`](plan-evaluation/write-evaluation-plan.md) | Render the plan as `evaluation-plan.md` |

### execute-analysis

| Operation | Capability |
|-----------|------------|
| [`compose-trigger-context`](execute-analysis/compose-trigger-context.md) | Compose one group's trigger context |
| [`read-run-manifest`](execute-analysis/read-run-manifest.md) | Record a completed run from its manifest |

### compose-evaluation-report

| Operation | Capability |
|-----------|------------|
| [`extract-findings`](compose-evaluation-report/extract-findings.md) | Draw each dimension's findings into the report |
| [`identify-patterns`](compose-evaluation-report/identify-patterns.md) | Name the core finding and the cross-cutting patterns |
| [`compose-report`](compose-evaluation-report/compose-report.md) | Render `EVALUATION-REPORT.md` |
| [`verify-report`](compose-evaluation-report/verify-report.md) | Check the report against its invariants |
| [`compile-delivery-metrics`](compose-evaluation-report/compile-delivery-metrics.md) | Compile the figures and the deliverable index |

### resolve-findings

| Operation | Capability |
|-----------|------------|
| [`load-and-classify`](resolve-findings/load-and-classify.md) | Turn the report's findings into an ordered, located worklist |
| [`propose-mitigation-by-tier`](resolve-findings/propose-mitigation-by-tier.md) | Propose a mitigation in the shape the finding's tier takes |
| [`record-finding-decision`](resolve-findings/record-finding-decision.md) | Record one finding's disposition with the text it applies to |
| [`compile-plan`](resolve-findings/compile-plan.md) | Compile the dispositions into `MITIGATION-PLAN.md` |
| [`apply-changes`](resolve-findings/apply-changes.md) | Make the planned changes to the target |

---

## Cross-Workflow Techniques

Bound or inherited from elsewhere, not authored here:

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](../../meta/techniques/variable-binding.md) | Binding each step's operation to the session's variable bag |
| [`scatter-gather`](../../meta/techniques/scatter-gather.md) | The per-group and per-finding fan-out loops |
| [`workflow-engine::handle-sub-workflow`](../../meta/techniques/workflow-engine/handle-sub-workflow.md) | Triggering prism as a child workflow, once per execution group |
| [`version-control::commit-regular-files`](../../meta/techniques/version-control/commit-regular-files.md) | Committing the applied mitigations |
| [`verify-artifact-conforms`](../../work-package/techniques/manage-artifacts/verify-artifact-conforms.md) | Checking each written artifact against its guide |
