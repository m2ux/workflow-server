# Evaluation Workflow — Techniques

> Part of the [Evaluation Workflow](../README.md)

## Techniques (4 groups, 20 operations)

The technique library for the prism-evaluate workflow. Each operation is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in each operation's `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

The workflow-root [`TECHNIQUE.md`](TECHNIQUE.md) is the base contract inherited by every group below. Each group is a `techniques/<group>/` directory holding a `TECHNIQUE.md` shared contract plus one `.md` file per operation.

| Technique group | Capability |
|-----------------|------------|
| [`plan-evaluation`](plan-evaluation/TECHNIQUE.md) | Collect the scope, classify the target, derive dimensions, survey the target, map each dimension to prism lenses and pipeline modes, group for execution, and author the evaluation plan |
| [`execute-analysis`](execute-analysis/TECHNIQUE.md) | Record a triggered prism run from its `RUN-MANIFEST.md` into the evaluation accumulators |
| [`compose-evaluation-report`](compose-evaluation-report/TECHNIQUE.md) | Consolidate the per-dimension prism artifacts into a unified, methodology-stripped evaluation report, then compile and present its metrics and deliverable index |
| [`resolve-findings`](resolve-findings/TECHNIQUE.md) | Tier-classify findings, propose a mitigation per finding through one-by-one dialogue, compile the mitigation plan, and apply the accepted changes |

---

## Operations by Group

### plan-evaluation (Define Evaluation Scope + Plan Dimension Analysis)

| Operation | Capability |
|-----------|------------|
| [`collect-scope`](plan-evaluation/collect-scope.md) | Collect the target, evaluation description, output path, and any user-supplied dimensions / lens overrides |
| [`classify-target`](plan-evaluation/classify-target.md) | Classify the target type — document, document-set, codebase, or mixed |
| [`derive-dimensions`](plan-evaluation/derive-dimensions.md) | Derive or validate the evaluation dimensions from the description and target type |
| [`create-output-folder`](plan-evaluation/create-output-folder.md) | Create the directory where evaluation artifacts will land |
| [`summarize-scope`](plan-evaluation/summarize-scope.md) | Summarise the assembled scope for user confirmation |
| [`survey-target`](plan-evaluation/survey-target.md) | Survey the target's structure and content to ground evidence-based focus areas |
| [`map-dimensions-to-lenses`](plan-evaluation/map-dimensions-to-lenses.md) | Map each dimension to prism pipeline modes and lenses (respecting any lens overrides) |
| [`group-for-execution`](plan-evaluation/group-for-execution.md) | Group dimensions sharing a pipeline mode into execution groups |
| [`write-evaluation-plan`](plan-evaluation/write-evaluation-plan.md) | Author the human-readable `evaluation-plan.md` |

### execute-analysis (Execute Prism Analyses)

| Operation | Capability |
|-----------|------------|
| [`read-run-manifest`](execute-analysis/read-run-manifest.md) | Record a prism run from its `RUN-MANIFEST.md` (report + definitive-findings paths + status) into the evaluation accumulators |

### compose-evaluation-report (Consolidate Evaluation Report + Deliver Evaluation Results)

| Operation | Capability |
|-----------|------------|
| [`extract-findings`](compose-evaluation-report/extract-findings.md) | Read each dimension's findings from prism's `DEFINITIVE-FINDINGS.md`, inheriting IDs and severities |
| [`identify-patterns`](compose-evaluation-report/identify-patterns.md) | Identify cross-dimensional patterns across the findings |
| [`compose-report`](compose-evaluation-report/compose-report.md) | Compose the unified, methodology-stripped `EVALUATION-REPORT.md` |
| [`verify-report`](compose-evaluation-report/verify-report.md) | Verify the report is standalone, severity-calibrated, and free of methodology language |
| [`compile-and-present`](compose-evaluation-report/compile-and-present.md) | Compile the delivery metrics and present the results with a deliverable index |

### resolve-findings (Resolution Dialogue + Apply Accepted Mitigations)

| Operation | Capability |
|-----------|------------|
| [`load-and-classify`](resolve-findings/load-and-classify.md) | Load findings from the report and tier-classify them by mitigation difficulty |
| [`propose-mitigation-by-tier`](resolve-findings/propose-mitigation-by-tier.md) | Propose a finding-specific mitigation according to its tier |
| [`present-and-collect-per-finding`](resolve-findings/present-and-collect-per-finding.md) | Present each finding individually and collect the user's decision |
| [`compile-plan`](resolve-findings/compile-plan.md) | Compile the per-finding dispositions into `MITIGATION-PLAN.md` |
| [`apply-changes`](resolve-findings/apply-changes.md) | Apply the accepted mitigations to the target in tier and severity order |

---

## Reference Convention

The `execute-analysis` group is named after the `execute-analysis` activity, so that activity's steps bind its operations **bare** (the meta `activity-group-shorthand` rule) — `read-run-manifest` resolves to `execute-analysis::read-run-manifest`. The other three groups are not named after their consuming activities, so their operations are always bound **qualified** — `plan-evaluation::collect-scope`, `compose-evaluation-report::extract-findings`, `resolve-findings::load-and-classify`.

---

## Cross-Workflow Techniques

These techniques are inherited or bound cross-workflow, not authored here:

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](../../meta/techniques/variable-binding.md) | Declared once at the workflow level (`techniques.activity`) and inherited by every activity — binds each step's operation to the workflow-scoped variable bag |
| [`scatter-gather`](../../meta/techniques/scatter-gather.md) | Declared on the `execute-analysis` and `resolution-dialogue` activities as their activity-wide strategy technique for the per-group / per-finding fan-out loops |
| [`workflow-engine::handle-sub-workflow`](../../meta/techniques/workflow-engine/handle-sub-workflow.md) | Bound in `execute-analysis` to trigger the prism workflow as a child, once per execution group |
| [`version-control::commit-regular-files`](../../meta/techniques/version-control/commit-regular-files.md) | Bound in `apply-mitigations` to commit the applied mitigations to the target |

For the full technique-to-activity picture with capability summaries, see the [workflow README](../README.md#techniques).
