# Design Philosophy

## Problem Statement

The prism workflow currently supports 12 analytical lenses organized into three groups: a code L12 pipeline (resources 00–02), a general-domain L12 pipeline (resources 03–05), and six portfolio lenses (resources 06–11). The upstream agi-in-md project has added approximately 21 new lenses spanning three distinct families — structural SDL, behavioral pipeline, and domain-neutral variants — that are not accessible through the workflow. Users wanting SDL-family analysis, behavioral pipeline analysis, or domain-neutral behavioral analysis must work outside the workflow, forfeiting the benefits of automated routing via `plan-analysis`, orchestrated execution, and artifact management.

## Problem Classification

**Type:** Inventive goal (improvement) — extending existing capabilities with new prism families from upstream.

**Complexity:** Complex. While the source material is well-defined (prism files already exist), the integration touches four layers of the workflow:

1. **Resources** (~21 new files) — straightforward file import with numbering decisions
2. **Skills** (3 affected) — `plan-analysis` goal-mapping matrix expansion, `portfolio-analysis` lens catalog expansion, and a new `behavioral-pipeline` skill
3. **Activities** (2–3 affected) — `select-mode` pipeline mode expansion, potentially new activities for the behavioral pipeline's 4+1 pass structure
4. **Workflow definition** — `pipeline_mode` variable enum expansion, possible new variables for behavioral pipeline state

The behavioral pipeline introduces a structurally distinct orchestration pattern: 4 independent lenses running in parallel (error_resilience, optim, evolution, api_surface) followed by 1 synthesis lens that reads all 4 outputs. This differs from the existing L12 pipeline's sequential 3-pass pattern (structural → adversarial → synthesis). The integration must decide whether to generalize the existing orchestration or add a dedicated behavioral path.

## Workflow Path

**Selected:** Full workflow (elicitation + research + comprehension + planning + implementation)

**Rationale:** While the requirements appear well-defined from the source files, the user judges the integration complexity warrants full discovery. Key open questions include:

- How to organize the expanded 33-resource catalog (numbering scheme, family grouping)
- Whether the behavioral pipeline needs dedicated activities and skills or can reuse generalized versions of existing ones
- How domain-neutral behavioral variants interact with the existing `target_type` (code/general) distinction — the current workflow has separate code (00–02) and general (03–05) pipelines, but domain-neutral behavioral variants are separate files rather than a parallel pipeline
- How compressed variants (error_resilience_compact, error_resilience_70w) fit into the routing — they serve model-specific optimization, not analytical differentiation
- Whether SDL lenses should be portfolio-eligible, pipeline-eligible, or both
- How `plan-analysis` should route to behavioral pipeline vs. L12 pipeline based on analytical goals

## Constraints

1. **Backward compatibility:** Existing resource indices 00–11 must remain unchanged. All existing skills and activities that reference these indices must continue to work.
2. **Workflow-only changes:** This enhancement modifies workflow definition files (TOON, markdown resources) in the `workflows` worktree. No changes to the MCP server source code (`src/`, `schemas/`).
3. **Provenance:** All new resources are copies of upstream agi-in-md prism files with standardized naming for the `{NN}-{name}.md` convention.

## Design Principles

1. **Preserve existing numbering** — resources 00–11 are stable references used by skills and activities. New resources extend from index 12 onward.
2. **Group by family** — new resources should cluster by family (SDL, behavioral, domain-neutral, compressed, hybrid) for discoverability in the resource index.
3. **Pipeline as a first-class mode** — the behavioral pipeline (4 independent + 1 synthesis) is a distinct pipeline mode, not a special case of portfolio or full-prism. It has its own synthesis lens that expects specifically labeled inputs (ERRORS, COSTS, CHANGES, PROMISES).
4. **SDL lenses are portfolio-eligible** — SDL lenses are single-pass standalone lenses (like the existing portfolio set) and should be selectable in portfolio mode and mappable to analytical goals.
5. **Domain-neutral as routing, not separate pipeline** — the 3 domain-neutral behavioral variants should be selected automatically based on `target_type`, mirroring how code vs. general L12 pipelines are already selected.
6. **Compressed variants as model optimization** — compressed variants serve model-specific optimization (e.g., 70w for Haiku). These should be accessible but not part of the primary routing logic.
