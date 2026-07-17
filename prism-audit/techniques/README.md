# Prism Audit Techniques

> Part of the [Prism Audit Workflow](../README.md)

The technique library for the prism-audit workflow. Each operation is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in each operation's `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

[`TECHNIQUE.md`](TECHNIQUE.md) holds shared Inputs, Outputs, Rules, and Errors for every technique here.

---

## Techniques

Four operation-groups (one per authoring activity) plus one standalone technique. A group is a `techniques/<group>/` directory holding a `TECHNIQUE.md` shared contract plus one `.md` file per operation.

| Technique | Kind | Capability |
|-----------|------|------------|
| [`scope-definition`](scope-definition/TECHNIQUE.md) | group | Establish the audit's scope: collect and validate the target, summarise the scope, and create the output directory |
| [`compose-audit-prompt`](compose-audit-prompt/TECHNIQUE.md) | group | Analyse the codebase and compose a detailed, self-contained audit prompt tailored to its architecture and risk profile, plus the scope list prism will run |
| [`execute-analysis`](execute-analysis/TECHNIQUE.md) | group | Compose the prism trigger context for a scope and record the triggered run from its manifest |
| [`audit-finalize`](audit-finalize/TECHNIQUE.md) | group | Assemble prism's contract artifacts into the three security-audit deliverables and cross-validate them |
| [`deliver-audit`](deliver-audit.md) | standalone | Present the final deliverables with metrics, the core finding, top remediations, and a full artifact index |

---

## Operations by Group

### scope-definition (Define Audit Scope)

| Operation | Capability |
|-----------|------------|
| [`collect-inputs`](scope-definition/collect-inputs.md) | Collect the target, description, and output location from the user's request |
| [`validate-target`](scope-definition/validate-target.md) | Verify the target is an analysable codebase and gather its structural metadata |
| [`summarize-scope`](scope-definition/summarize-scope.md) | Summarise the assembled scope for user confirmation |
| [`create-output-folder`](scope-definition/create-output-folder.md) | Create the directory where audit artifacts will land |

### compose-audit-prompt (Generate Audit Prompt)

| Operation | Capability |
|-----------|------------|
| [`survey-structure`](compose-audit-prompt/survey-structure.md) | Survey the module layout and total lines of code |
| [`identify-security-characteristics`](compose-audit-prompt/identify-security-characteristics.md) | Scan for security-relevant patterns (gates the no-security-characteristics checkpoint) |
| [`map-trust-boundaries`](compose-audit-prompt/map-trust-boundaries.md) | Map cross-community call edges and security-critical symbol blast radii (GitNexus only) |
| [`map-audit-domains`](compose-audit-prompt/map-audit-domains.md) | Derive the evidence-based audit domains with risk levels and focus areas |
| [`identify-cross-cutting-concerns`](compose-audit-prompt/identify-cross-cutting-concerns.md) | Identify cross-cutting concerns — error handling, feature flags, dependencies |
| [`compose-prompt`](compose-audit-prompt/compose-prompt.md) | Assemble the self-contained audit prompt from the [template](../resources/audit-prompt-template.md) |
| [`build-audit-scopes`](compose-audit-prompt/build-audit-scopes.md) | Partition the audit into the discrete scopes each prism run will cover |

### execute-analysis (Execute Prism Analysis)

| Operation | Capability |
|-----------|------------|
| [`compose-trigger-context`](execute-analysis/compose-trigger-context.md) | Unpack a scope into the prism trigger variables (target, description, output, pipeline mode, focus) |
| [`read-run-manifest`](execute-analysis/read-run-manifest.md) | Record a prism run from its `RUN-MANIFEST.md` (report + definitive-findings paths + status) into the audit accumulators |

### audit-finalize (Audit Report Finalization)

| Operation | Capability |
|-----------|------------|
| [`split-report`](audit-finalize/split-report.md) | Split prism's `REPORT.md` into the summary `AUDIT-REPORT.md` |
| [`create-detailed-findings`](audit-finalize/create-detailed-findings.md) | Build `DETAILED-FINDINGS.md` from prism's `DEFINITIVE-FINDINGS.md` — one expanded write-up per finding |
| [`create-trade-off-analysis`](audit-finalize/create-trade-off-analysis.md) | Build `DESIGN-TRADE-OFFS.md` from the conservation laws in `DEFINITIVE-FINDINGS.md` |
| [`apply-formatting-rules`](audit-finalize/apply-formatting-rules.md) | Apply the Impact × Feasibility severity rubric and formatting rules |
| [`verify-audit-consistency`](audit-finalize/verify-audit-consistency.md) | Cross-validate that the three deliverables exist and agree |

---

## Reference Convention

Because each group is named after the activity whose steps bind it, those steps reference operations two ways (see the meta `activity-group-shorthand` rule):

- **Bare op** where the activity name matches the group — `collect-inputs` inside `scope-definition` resolves to `scope-definition::collect-inputs`; `deliver-audit` is a bare standalone reference.
- **Qualified `group::op`** where a step reaches an operation whose group is not the activity's own group — e.g. `compose-audit-prompt::survey-structure`.

---

## Cross-Workflow Techniques

These techniques are inherited or bound cross-workflow, not authored here:

| Reference | Used for |
|-----------|----------|
| [`variable-binding`](../../meta/techniques/variable-binding.md) | Declared once at the workflow level (`techniques.activity`) and inherited by every activity — binds each step's operation to the workflow-scoped variable bag |
| [`workflow-engine::handle-sub-workflow`](../../meta/techniques/workflow-engine/handle-sub-workflow.md) | Bound in `execute-analysis` to trigger the prism workflow as a child, once per audit scope |
| [`gitnexus-operations::analyze`](../../meta/techniques/gitnexus-operations/analyze.md) | Bound in `scope-definition` to index the target codebase (sets `gitnexus_available`) |
| [`scatter-gather`](../../meta/techniques/scatter-gather.md) | Declared on the `execute-analysis` activity as its activity-wide strategy technique for the per-scope trigger loop |

For the full technique-to-activity picture with capability summaries, see the [workflow README](../README.md#techniques).
