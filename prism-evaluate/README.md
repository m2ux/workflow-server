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

User checkpoints gate the scope, the plan, the resolution offer, each finding's mitigation, and the final apply; the authoritative options and effects live in each activity's YAML.

---

## Activities

| # | Activity | Purpose |
|---|----------|---------|
| 00 | **Define Evaluation Scope** | Collect the target, classify its type, and derive evaluation dimensions; user confirms scope before planning |
| 01 | **Plan Dimension Analysis** | Survey the target, map each dimension to prism lenses, and group dimensions for execution; user confirms the plan |
| 02 | **Execute Prism Analyses** | Trigger a prism run per execution group and collect the results |
| 03 | **Consolidate Evaluation Report** | Extract findings, identify cross-dimensional patterns, and compose the evaluation report |
| 04 | **Deliver Evaluation Results** | Present the results and artifact index, then offer the optional resolution dialogue |
| 05 | **Resolution Dialogue** | Tier-classify findings and propose mitigations one finding at a time, compiling a mitigation plan |
| 06 | **Apply Accepted Mitigations** | Apply the accepted mitigations to the target after a final user confirmation |

**Detailed documentation:** See [activities/](activities/) for per-activity YAML definitions.

---

## Techniques

Each technique is an operation-group: a `TECHNIQUE.md` shared contract plus one operation file per phase, referenced as `<group>::<op>`. Steps bind a single operation; `execute-analysis`'s trigger step binds the shared `workflow-engine::handle-sub-workflow`.

| Technique group | Capability | Used By |
|-------|------------|---------|
| `plan-evaluation` | Target classification, dimension derivation, target survey, dimension-to-lens mapping, execution grouping, plan authoring | scope-definition, dimension-planning |
| `execute-analysis` | Prism run result collection and completion verification | execute-analysis |
| `compose-evaluation-report` | Cross-artifact extraction, cross-dimensional synthesis, report composition and verification, result presentation | consolidate-report, deliver-results |
| `resolve-findings` | Finding tier-classification, one-by-one mitigation proposal, mitigation plan composition, change application | resolution-dialogue, apply-mitigations |

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
├── workflow.yaml                     # Workflow definition (8 rules, 23 variables)
├── README.md                         # This file
├── activities/
│   ├── 00-scope-definition.yaml      # Collect inputs, classify target, derive dimensions
│   ├── 01-dimension-planning.yaml    # Survey target, map to lenses, group for execution
│   ├── 02-execute-analysis.yaml      # Trigger prism per execution group
│   ├── 03-consolidate-report.yaml    # Extract findings, compose EVALUATION-REPORT.md
│   ├── 04-deliver-results.yaml       # Present results and artifact index; offer resolution
│   ├── 05-resolution-dialogue.yaml   # Tier-classify findings, propose mitigations, compile plan
│   └── 06-apply-mitigations.yaml     # Apply accepted mitigations to the target and commit
├── techniques/
│   ├── TECHNIQUE.md                  # Inherited base contract
│   ├── plan-evaluation/              # Target classification, dimension-to-lens mapping (one op per phase)
│   ├── execute-analysis/             # Prism run result collection and completion verification (one op per phase)
│   ├── compose-evaluation-report/    # Cross-dimensional synthesis, report composition (one op per phase)
│   └── resolve-findings/             # Finding tier-classification, mitigation, change application (one op per phase)
└── resources/
    ├── default-dimensions.md         # Default dimension sets by target type
    ├── dimension-lens-mapping.md     # Dimension-to-lens mapping matrix
    ├── evaluation-plan-template.md   # evaluation-plan.md structure
    ├── evaluation-report-template.md # EVALUATION-REPORT.md structure
    └── mitigation-plan-template.md   # MITIGATION-PLAN.md structure
```
