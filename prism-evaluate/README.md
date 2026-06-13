# Evaluation Workflow

> v1.1.0 — Orchestrate multi-dimensional evaluations of any target by mapping evaluation dimensions to prism analytical lenses, then optionally resolve and apply mitigations for the findings.

---

## Overview

`prism-evaluate` codifies a repeatable pattern for evaluating documents, proposals, codebases, or mixed artifact sets through multiple analytical dimensions. A user provides a target and evaluation description; the workflow classifies the target, derives or accepts evaluation dimensions, maps each dimension to prism modes and lenses, triggers prism runs, and consolidates results into a standalone evaluation report.

**Relationship to other workflows:**

| Workflow | Purpose |
|----------|---------|
| `prism` | Core analytical engine (lenses, passes, modes) — unchanged |
| `prism-audit` | Security-specific audit orchestration over prism — unchanged |
| `prism-evaluate` | General evaluation orchestration over prism |

`prism-evaluate` does NOT replace `prism-audit`. Security audits have domain-specific logic (trust boundary scanning, GitNexus integration) that belongs in a specialised workflow. `prism-evaluate` is for evaluating any target through user-defined analytical dimensions.

---

## Workflow Flow

```
scope-definition → dimension-planning → execute-analysis → consolidate-report → deliver-results
                                                                                      │
                                                            (resolution requested)    ▼
                                                            resolution-dialogue → apply-mitigations
```

`deliver-results` ends the workflow unless the user opts into the resolution dialogue, which then iterates through findings and applies accepted mitigations.

User checkpoints gate the work:

1. **confirm-scope** (scope-definition) — confirm target, dimensions, and output path
2. **confirm-plan** (dimension-planning) — confirm the dimension-to-lens mapping and execution groups
3. **resolution-offer** (deliver-results) — choose whether to proceed with the resolution dialogue
4. **finding-decision** (resolution-dialogue) — accept, modify, skip, or discuss each finding's mitigation
5. **confirm-apply** (apply-mitigations) — confirm applying the accepted mitigations to the target

Transitions between confirm-plan and deliver-results are automatic.

---

## Activities

| # | Activity | Purpose | Checkpoint |
|---|----------|---------|------------|
| 00 | **Define Evaluation Scope** | Collect target, classify type, derive dimensions | confirm-scope |
| 01 | **Plan Dimension Analysis** | Survey target, map dimensions to lenses, group for execution | confirm-plan |
| 02 | **Execute Prism Analyses** | Trigger prism per execution group, collect results | — |
| 03 | **Consolidate Evaluation Report** | Extract findings, identify cross-dimensional patterns, compose report | — |
| 04 | **Deliver Evaluation Results** | Present metrics, core finding, and artifact index; offer resolution | resolution-offer |
| 05 | **Resolution Dialogue** | Tier-classify findings, propose mitigations one-by-one, compile mitigation plan | finding-decision |
| 06 | **Apply Accepted Mitigations** | Apply the accepted mitigations to the target and commit | confirm-apply |

**Detailed documentation:** See [activities/](activities/) for per-activity TOON definitions.

---

## Techniques

| # | Technique | Capability | Used By |
|---|-------|------------|---------|
| 00 | `plan-evaluation` | Target classification, dimension derivation, dimension-to-lens mapping | scope-definition, dimension-planning |
| 01 | `compose-evaluation-report` | Cross-artifact extraction, cross-dimensional synthesis, report composition, result presentation | consolidate-report, deliver-results |
| 02 | `resolve-findings` | Finding tier-classification, one-by-one mitigation proposal, mitigation plan composition, change application | resolution-dialogue, apply-mitigations |

**Detailed documentation:** See [techniques/](techniques/) for protocol details.

---

## Resources

| Resource | Description |
|----------|-------------|
| [Default Dimensions](./resources/default-dimensions.md) | Default dimension sets by target type (proposal, codebase, mixed) |
| [Dimension-Lens Mapping](./resources/dimension-lens-mapping.md) | Standard and custom dimension-to-prism-lens mapping matrix |
| [Evaluation Plan Template](./resources/evaluation-plan-template.md) | Structure for the evaluation-plan.md artifact |
| [Evaluation Report Template](./resources/evaluation-report-template.md) | Structure for the EVALUATION-REPORT.md artifact |
| [Mitigation Plan Template](./resources/mitigation-plan-template.md) | Structure for the MITIGATION-PLAN.md artifact |

**Detailed documentation:** See [resources/](resources/) for full content.

---

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `evaluation_description` | string | yes | What to evaluate and why |
| `target_path` | string | yes | Path to the target |
| `output_path` | string | yes | Directory for all evaluation artifacts |
| `target_type` | string | — | Classification: document, document-set, codebase, mixed |
| `dimensions` | array | — | Evaluation dimensions (derived if omitted) |
| `dimension_plan` | array | — | Per-dimension lens mapping |
| `lens_overrides` | object | — | User-specified lens overrides per dimension |
| `execution_groups` | array | — | Dimensions grouped by pipeline mode |
| `current_group` | object | — | Current group during iteration |
| `completed_analyses` | array | — | Completed prism runs with status |
| `all_artifact_paths` | array | — | All artifact paths across prism runs |
| `evaluation_report_path` | string | — | Path to EVALUATION-REPORT.md |
| `evaluation_plan_path` | string | — | Path to evaluation-plan.md |
| `scope_confirmed` | boolean | — | Checkpoint gate (default: false) |
| `dimensions_confirmed` | boolean | — | Checkpoint gate (default: false) |
| `pipeline_mode` | string | — | Per-group pipeline mode (default: full-prism) |
| `gitnexus_available` | boolean | — | GitNexus indexing status (default: false) |
| `resolution_requested` | boolean | — | Whether the user opted into the resolution dialogue (default: false) |
| `mitigation_plan_path` | string | — | Path to MITIGATION-PLAN.md |
| `current_finding` | object | — | Current finding during the resolution iteration |
| `accepted_mitigations` | array | — | Accepted mitigation decisions per finding |
| `evaluation_findings` | array | — | Findings extracted from the report for resolution |
| `accepted_count` | number | — | Count of accepted mitigations (default: 0) |

---

## Orchestration Model

This workflow uses an **orchestrator with disposable workers**. The orchestrator manages transitions and triggers prism workflows. Workers execute activities in fresh contexts.

Prism workflows are triggered via the `trigger-workflow` mechanism during the execute-analysis loop. Each execution group triggers a separate prism run with its own pipeline mode, lens selection, and output subdirectory.

---

## Output Artifact Structure

For a standard 4-dimension evaluation (Consistency, Veracity, Plausibility, Feasibility):

```
{output_path}/
├── evaluation-plan.md              (dimension-to-lens mapping)
├── EVALUATION-REPORT.md            (consolidated evaluation)
├── consistency/
│   ├── structural-analysis.md      (from full-prism)
│   ├── adversarial-analysis.md     (from full-prism)
│   └── synthesis.md                (from full-prism)
└── dimensions/
    ├── claim-inversion.md          (Veracity — lens 07)
    ├── knowledge-audit.md          (Veracity — lens 40)
    ├── rejected-paths.md           (Plausibility — lens 09)
    └── scarcity.md                 (Feasibility — lens 08)
```

---

## File Structure

```
workflows/prism-evaluate/
├── workflow.toon                     # Workflow definition (8 rules, 23 variables)
├── README.md                         # This file
├── activities/
│   ├── 00-scope-definition.toon      # Collect inputs, classify target, derive dimensions
│   ├── 01-dimension-planning.toon    # Survey target, map to lenses, group for execution
│   ├── 02-execute-analysis.toon      # Trigger prism per execution group
│   ├── 03-consolidate-report.toon    # Extract findings, compose EVALUATION-REPORT.md
│   ├── 04-deliver-results.toon       # Present results and artifact index; offer resolution
│   ├── 05-resolution-dialogue.toon   # Tier-classify findings, propose mitigations, compile plan
│   └── 06-apply-mitigations.toon     # Apply accepted mitigations to the target and commit
├── techniques/
│   ├── TECHNIQUE.md                  # Inherited base contract
│   ├── plan-evaluation.md            # Target classification, dimension-to-lens mapping
│   ├── compose-evaluation-report.md  # Cross-dimensional synthesis, report composition
│   └── resolve-findings.md           # Finding tier-classification, mitigation, change application
└── resources/
    ├── default-dimensions.md         # Default dimension sets by target type
    ├── dimension-lens-mapping.md     # Dimension-to-lens mapping matrix
    ├── evaluation-plan-template.md   # evaluation-plan.md structure
    ├── evaluation-report-template.md # EVALUATION-REPORT.md structure
    └── mitigation-plan-template.md   # MITIGATION-PLAN.md structure
```
