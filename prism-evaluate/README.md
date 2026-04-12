# Evaluation Workflow

> v1.0.0 — Orchestrate multi-dimensional evaluations of any target by mapping evaluation dimensions to prism analytical lenses.

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
```

Two user checkpoints gate the analytical work:

1. **confirm-scope** (scope-definition) — confirm target, dimensions, and output path
2. **confirm-plan** (dimension-planning) — confirm the dimension-to-lens mapping and execution groups

All transitions after confirm-plan are automatic.

---

## Activities

| # | Activity | Purpose | Checkpoint |
|---|----------|---------|------------|
| 00 | **Define Evaluation Scope** | Collect target, classify type, derive dimensions | confirm-scope |
| 01 | **Plan Dimension Analysis** | Survey target, map dimensions to lenses, group for execution | confirm-plan |
| 02 | **Execute Prism Analyses** | Trigger prism per execution group, collect results | — |
| 03 | **Consolidate Evaluation Report** | Extract findings, identify cross-dimensional patterns, compose report | — |
| 04 | **Deliver Evaluation Results** | Present metrics, core finding, and artifact index | — |

**Detailed documentation:** See [activities/](activities/) for per-activity TOON definitions.

---

## Skills

| # | Skill | Capability | Used By |
|---|-------|------------|---------|
| 00 | `plan-evaluation` | Target classification, dimension derivation, dimension-to-lens mapping | scope-definition, dimension-planning, execute-analysis |
| 01 | `compose-evaluation-report` | Cross-artifact extraction, cross-dimensional synthesis, report composition, result presentation | consolidate-report, deliver-results |

**Detailed documentation:** See [skills/](skills/) for protocol details.

---

## Resources

| Index | Resource | Description |
|-------|----------|-------------|
| 00 | [Default Dimensions](resources/00-default-dimensions.md) | Default dimension sets by target type (proposal, codebase, mixed) |
| 01 | [Dimension-Lens Mapping](resources/01-dimension-lens-mapping.md) | Standard and custom dimension-to-prism-lens mapping matrix |

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
├── workflow.toon                    # Workflow definition (9 rules, 17 variables)
├── README.md                        # This file
├── activities/
│   ├── 00-scope-definition.toon     # Collect inputs, classify target, derive dimensions
│   ├── 01-dimension-planning.toon   # Survey target, map to lenses, group for execution
│   ├── 02-execute-analysis.toon     # Trigger prism per execution group
│   ├── 03-consolidate-report.toon   # Extract findings, compose EVALUATION-REPORT.md
│   └── 04-deliver-results.toon      # Present results and artifact index
├── skills/
│   ├── 00-plan-evaluation.toon      # Target classification, dimension-to-lens mapping
│   └── 01-compose-evaluation-report.toon  # Cross-dimensional synthesis, report composition
└── resources/
    ├── 00-default-dimensions.md     # Default dimension sets by target type
    └── 01-dimension-lens-mapping.md # Dimension-to-lens mapping matrix
```
