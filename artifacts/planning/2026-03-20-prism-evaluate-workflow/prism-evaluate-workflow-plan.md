# Plan: `prism-evaluate` Workflow

**Date:** 2026-03-20  
**Status:** Implemented  
**Objective:** Create a general-purpose evaluation workflow that orchestrates prism analyses across user-defined evaluation dimensions.

---

## Background

The VOX proposal evaluation (2026-03-18) demonstrated a repeatable pattern for document evaluation using prism workflows:

1. Define evaluation dimensions (Consistency, Veracity, Plausibility, Feasibility)
2. Map each dimension to prism lenses/modes (Full-Prism for Consistency, portfolio lenses for others)
3. Execute prism runs per dimension grouping
4. Consolidate dimension-specific artifacts into a unified evaluation report

This was done ad-hoc — the agent designed a prompt, manually drove prism runs, and assembled the report. The `prism-evaluate` workflow codifies this pattern into a reusable workflow.

### Relationship to Existing Workflows

| Workflow | Purpose | Stays? |
|----------|---------|--------|
| `prism` | Core analytical engine (lenses, passes, modes) | Yes — unchanged |
| `prism-audit` | Security-specific audit orchestration over prism | Yes — unchanged |
| `prism-evaluate` (new) | General evaluation orchestration over prism | New |

`prism-evaluate` does NOT replace `prism-audit`. Security audits have domain-specific logic (trust boundary scanning, codebase characteristic identification, GitNexus integration) that belongs in a specialised workflow. `prism-evaluate` is for evaluating any target through user-defined analytical dimensions.

---

## Design

### Core Concept

The user provides:
- **Target** — a document, proposal, codebase, or artifact set to evaluate
- **Evaluation description** — what they want to evaluate and why
- **Dimensions** (optional) — the analytical dimensions to evaluate across (e.g., Consistency, Veracity, Plausibility, Feasibility). If not provided, the workflow derives dimensions from the description and target.

The workflow:
1. Surveys the target structure
2. Plans which prism modes and lenses address each dimension
3. Triggers prism runs grouped by pipeline mode
4. Consolidates results into a structured evaluation report

### Workflow ID and Metadata

```
id: prism-evaluate
title: Evaluation Workflow
tags: evaluation, analysis, prism
```

### Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `evaluation_description` | string | yes | What to evaluate and why |
| `target_path` | string | yes | Path to the document, codebase, or artifact set |
| `output_path` | string | yes | Directory for all evaluation artifacts |
| `dimensions` | array | no | User-supplied evaluation dimensions. Derived if omitted. |
| `dimension_plan` | array | — | Maps each dimension to prism mode, lenses, and analysis focus |
| `execution_groups` | array | — | Dimensions grouped by pipeline mode for efficient triggering |
| `current_group` | object | — | Current execution group during iteration |
| `completed_analyses` | array | — | Completed prism runs with output paths and status |
| `all_artifact_paths` | array | — | Accumulated artifact paths across all prism runs |
| `evaluation_report_path` | string | — | Path to the final evaluation report |
| `scope_confirmed` | boolean | — | Checkpoint gate |

### Activity Flow

```
scope-definition → dimension-planning → execute-analysis → consolidate-report → deliver-results
```

#### Activity 0: `scope-definition`

**Purpose:** Collect inputs, validate target, present scope for confirmation.

Steps:
1. **collect-inputs** — Extract target_path, evaluation_description, output_path, and optional dimensions from the user's request.
2. **classify-target** — Examine target_path. Determine target type: `document` (single file), `document-set` (directory of documents), `codebase` (directory with build files), or `mixed`. Record structure summary.
3. **derive-dimensions** — If dimensions not provided: analyse evaluation_description and target to derive appropriate dimensions. For proposal evaluation, suggest Consistency/Veracity/Plausibility/Feasibility. For code evaluation, suggest Correctness/Maintainability/Architecture/Robustness. Present derived dimensions for confirmation.
4. **create-output-directory** — Create output_path if it doesn't exist.

Checkpoint: **confirm-scope** — Present target summary, dimensions, and output path. User confirms or adjusts.

Transition → `dimension-planning`

#### Activity 1: `dimension-planning`

**Purpose:** Map each dimension to prism lens configurations and group for execution.

This is where the core intelligence lives — the skill that understands which prism lenses serve which evaluation goals.

Steps:
1. **survey-target** — Read the target to understand its structure, topics, claims, and scope. For documents: section structure, key claims, cross-references. For code: modules, architecture, dependencies.
2. **map-dimensions-to-lenses** — For each dimension, select:
   - Pipeline mode (full-prism, portfolio, or single)
   - Lens set (which prism resources)
   - Analysis focus (dimension-specific guidance to pass to prism)
   - Expected artifact subdirectory
3. **group-by-mode** — Group dimensions sharing the same pipeline mode into execution groups. The VOX evaluation pattern: one full-prism group (Consistency), one portfolio group (Veracity+Plausibility+Feasibility). Each group becomes one prism trigger.
4. **write-evaluation-plan** — Write the plan artifact to `{output_path}/evaluation-plan.md`.

Key design: The dimension-to-lens mapping draws from prism's plan-analysis skill's goal-mapping matrix:

| Dimension Pattern | Recommended Mode | Lenses |
|-------------------|-----------------|--------|
| Consistency / coherence / contradictions | full-prism | L12 pipeline (00→01→02) |
| Veracity / truthfulness / claims | portfolio | claim-inversion (07) + knowledge-audit (40) |
| Plausibility / alternatives / viability | portfolio | rejected-paths (09) |
| Feasibility / resources / constraints | portfolio | scarcity (08) |
| Custom dimensions | single or portfolio | Derived from description using goal-mapping matrix |

Transition → `execute-analysis`

#### Activity 2: `execute-analysis`

**Purpose:** Trigger prism workflow for each execution group.

Steps (loop over execution_groups):
1. **set-trigger-context** — Map current group to prism variables: target, target_type, pipeline_mode, selected_lenses (for portfolio), analysis_focus, output_path.
2. **trigger-prism** — Trigger prism workflow. Each group gets a separate prism run.
3. **collect-results** — Collect prism output artifacts. Map back to dimensions.
4. **verify-completion** — Verify artifacts exist and contain findings.

Rules:
- Sequential execution (one prism trigger at a time)
- Each prism run writes to `{output_path}/{dimension_subdir}/`
- Analysis focus includes dimension-specific evaluation criteria, NOT a bare label

Transition → `consolidate-report`

#### Activity 3: `consolidate-report`

**Purpose:** Produce the unified evaluation report from prism outputs.

Steps:
1. **read-all-artifacts** — Read all prism output artifacts across dimensions.
2. **extract-findings** — From each dimension's artifacts, extract key findings with IDs, severity, and evidence.
3. **identify-cross-dimension-patterns** — Find patterns that span multiple dimensions (e.g., the VOX evaluation's "mathematical-social bifurcation" emerged from cross-dimensional analysis).
4. **compose-evaluation-report** — Write `{output_path}/EVALUATION-REPORT.md` with:
   - Executive summary
   - Core finding (the deepest cross-dimensional insight)
   - Per-dimension findings summaries with severity tables
   - Cross-cutting patterns
   - Corrections/recommendations

Rules:
- Report contains definitive findings with reference IDs
- No methodology metadata — findings are presented as conclusions, not products of a process
- Severity/importance rubric applied consistently across dimensions

Transition → `deliver-results`

#### Activity 4: `deliver-results`

**Purpose:** Present evaluation results to the user.

Steps:
1. **read-evaluation-report** — Read the report, extract executive summary.
2. **compile-metrics** — Finding counts by dimension and severity, artifacts produced.
3. **present-results** — Structured summary with document index.

### Skill: `plan-evaluation`

The primary skill for `scope-definition` and `dimension-planning`. Core capabilities:

1. **Target classification** — Identify target type (document, document-set, codebase, mixed)
2. **Dimension derivation** — From evaluation_description, derive appropriate analytical dimensions
3. **Dimension-to-lens mapping** — Map each dimension to prism modes/lenses using the goal-mapping matrix
4. **Execution grouping** — Group dimensions by pipeline mode for efficient prism triggering

This skill references prism's lens inventory and the plan-analysis skill's goal-mapping matrix, but is scoped to evaluation planning rather than general analysis planning.

### Skill: `compose-evaluation-report`

The primary skill for `consolidate-report`. Core capabilities:

1. **Cross-artifact extraction** — Read prism outputs and extract findings per dimension
2. **Cross-dimensional synthesis** — Identify patterns spanning multiple dimensions
3. **Report composition** — Produce the structured EVALUATION-REPORT.md

---

## Output Artifact Structure

For an evaluation with dimensions Consistency, Veracity, Plausibility, Feasibility:

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

This mirrors the VOX evaluation's output structure.

---

## Resolved Design Decisions

1. **Dimension configurability depth** — Derive by default, allow override via `lens_overrides` variable. Users can override the pipeline mode and lens set for any dimension by name. ✅ Implemented.

2. **Report methodology** — Always strip methodology metadata. The report presents findings as conclusions. Methodology details (lens names, pass types, pipeline modes) remain in the raw dimension-specific artifacts for interested readers. ✅ Implemented via `methodology-stripping` rule in compose-evaluation-report skill.

3. **Trigger isolation** — Enforced. The `TRIGGER ISOLATION` workflow rule and the `dimension-planning` activity's rules prohibit analysis_focus values containing 'security audit', 'security review', or bare 'audit'. ✅ Implemented.

4. **Two skills** — `plan-evaluation` (target classification, dimension derivation, lens mapping) and `compose-evaluation-report` (cross-artifact extraction, cross-dimensional synthesis, report composition). ✅ Implemented.

5. **Target generality** — The workflow supports any proposal document, strategy document, technical specification, codebase, or mixed artifact set. Dimension derivation adapts to the target type. ✅ Implemented via classify-target protocol and derive-dimensions logic.

---

## Implementation Order

1. Create `workflows/prism-evaluate/` directory structure
2. Write `workflow.toon` — workflow definition with variables, rules, activity references
3. Write `skills/00-plan-evaluation.toon` — target classification, dimension derivation, lens mapping
4. Write `activities/00-scope-definition.toon`
5. Write `activities/01-dimension-planning.toon`
6. Write `activities/02-execute-analysis.toon`
7. Write `activities/03-consolidate-report.toon`
8. Write `activities/04-deliver-results.toon`
9. Update `workflows/README.md` to register the new workflow
