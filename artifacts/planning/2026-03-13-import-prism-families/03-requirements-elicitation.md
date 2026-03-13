# Requirements Elicitation

> **Date**: 2026-03-13
> **Work Package**: #53 — Import New Prism Families
> **Stakeholder Input**: Skipped (agent-led elicitation from codebase comprehension and source analysis)
> **Elicitation Method**: Derived from codebase comprehension artifact, source prism file examination, and design philosophy constraints

## Elicitation Summary

Requirements were derived from 8 design questions identified during codebase comprehension of the prism workflow and examination of all 32 source prism files in `/home/mike/projects/vendor/agi-in-md/prisms/`. No stakeholder discussion was conducted — requirements are based on technical analysis and the user's original request.

---

## R1: Resource Import Scope

### Requirement
Import 21 new prism lens files from the agi-in-md project as indexed workflow resources. Exclude `arc_code.md` (ARC puzzle solving) and `codegen.md` (code generation) — neither serves the workflow's structural analysis purpose.

### Scope

**In scope (21 resources):**

| Family | Files | Count |
|--------|-------|-------|
| Structural SDL | deep_scan, sdl_trust, sdl_coupling, sdl_abstraction, rec, ident, 73w | 7 |
| Behavioral pipeline | error_resilience, optim, evolution, api_surface, behavioral_synthesis | 5 |
| Domain-neutral variants | error_resilience_neutral, api_surface_neutral, evolution_neutral | 3 |
| Compressed variants | error_resilience_compact, error_resilience_70w | 2 |
| Hybrid/specialized | evidence_cost, reachability, fidelity, state_audit | 4 |

**Out of scope (2 files):**
- `arc_code.md` — targets ARC puzzle solving, not structural analysis
- `codegen.md` — targets code generation quality, not structural analysis

**Already present (9 files — do not re-import):**
- l12.md (resource 00), l12_complement_adversarial.md (01), l12_synthesis.md (02)
- pedagogy.md (06), claim.md (07), scarcity.md (08), rejected_paths.md (09), degradation.md (10), contract.md (11)

### Success Criteria
- All 21 new resources are loadable via `get_resource(workflow_id: "prism", index: "NN")`
- Content matches upstream source files exactly (provenance preserved)
- Existing resources 00-11 remain unchanged

---

## R2: Resource Numbering and Organization

### Requirement
Number new resources sequentially from index 12, grouped by family for discoverability.

### Proposed Index Assignment

| Index | Name | Family |
|-------|------|--------|
| 12 | deep-scan | SDL |
| 13 | sdl-trust | SDL |
| 14 | sdl-coupling | SDL |
| 15 | sdl-abstraction | SDL |
| 16 | rec | SDL |
| 17 | ident | SDL |
| 18 | 73w | SDL (compressed L12) |
| 19 | error-resilience | Behavioral |
| 20 | optim | Behavioral |
| 21 | evolution | Behavioral |
| 22 | api-surface | Behavioral |
| 23 | behavioral-synthesis | Behavioral |
| 24 | error-resilience-neutral | Domain-neutral |
| 25 | api-surface-neutral | Domain-neutral |
| 26 | evolution-neutral | Domain-neutral |
| 27 | error-resilience-compact | Compressed |
| 28 | error-resilience-70w | Compressed |
| 29 | evidence-cost | Hybrid/specialized |
| 30 | reachability | Hybrid/specialized |
| 31 | fidelity | Hybrid/specialized |
| 32 | state-audit | Hybrid/specialized |

### Success Criteria
- Index assignment follows the `{NN}-{name}.md` naming convention used by existing resources
- Family grouping is documented in resources README
- No gaps in index numbering

---

## R3: Behavioral Pipeline Mode

### Requirement
Add `behavioral` as a 4th pipeline mode alongside `single`, `full-prism`, and `portfolio`. The behavioral pipeline runs 4 independent lenses in parallel followed by 1 synthesis lens that receives all 4 outputs with specific labels.

### Pipeline Structure

```
error_resilience ──┐
optim           ──┤  (parallel, independent)
evolution       ──┤
api_surface     ──┘
                   │
                   ▼
         behavioral_synthesis  (reads all 4, labeled ERRORS/COSTS/CHANGES/PROMISES)
```

### Label Mapping
The behavioral synthesis lens expects inputs labeled as:
- ERRORS → error_resilience output
- COSTS → optim output
- CHANGES → evolution output
- PROMISES → api_surface output

This mapping must be explicitly encoded in a skill or activity definition, not left implicit.

### Target Type Restriction
The behavioral pipeline is **code-only**. `optim.md` uses strongly code-oriented vocabulary (allocations, cache misses, nanoseconds) with no domain-neutral variant. Individual domain-neutral behavioral lenses (24-26) can be used in portfolio mode for non-code targets.

### Artifacts Produced
- `behavioral-errors.md` (error_resilience output)
- `behavioral-costs.md` (optim output)
- `behavioral-changes.md` (evolution output)
- `behavioral-promises.md` (api_surface output)
- `behavioral-synthesis.md` (synthesis output — primary result)

### Success Criteria
- `pipeline_mode: "behavioral"` is recognized by select-mode activity
- 4 behavioral lenses dispatch in parallel within structural-pass activity
- Behavioral synthesis dispatches as a separate activity with 4 labeled inputs
- Plan-analysis skill routes to behavioral pipeline for appropriate goals
- Behavioral mode is not offered when `target_type == "general"`

---

## R4: SDL Portfolio Integration

### Requirement
Add all 7 SDL lenses (indices 12-18) to the portfolio lens catalog. SDL lenses are 3-step standalone lenses that match the portfolio pattern: independent, no sequential dependencies, always single-shot.

### Portfolio Additions

| Lens | Index | Best For |
|------|-------|----------|
| deep-scan | 12 | Conservation law discovery, information laundering, structural bug patterns |
| sdl-trust | 13 | Trust gradient, authority inversions, boundary collapse |
| sdl-coupling | 14 | Temporal coupling, invariant windows, ordering bugs |
| sdl-abstraction | 15 | Abstraction violations, implementation leakage across layers |
| rec | 16 | Fix failures, true invariants, prognosis |
| ident | 17 | Identity displacement, claims vs reality, necessary costs |
| 73w | 18 | Quick L12-equivalent (Sonnet-universal, always single-shot) |

### Also Portfolio-Eligible
Individual behavioral lenses (19-22) and hybrid/specialized lenses (29-32) are also portfolio-eligible as standalone single-pass lenses. The full expanded portfolio catalog covers indices 06-22 and 29-32 (excluding synthesis lenses 23, domain-neutral variants 24-26, and compressed variants 27-28).

### Success Criteria
- Portfolio-analysis skill enumerates the expanded lens catalog
- Plan-analysis goal-mapping matrix includes SDL and behavioral lenses
- SDL lenses are selectable via portfolio mode

---

## R5: Plan-Analysis Routing Expansion

### Requirement
Extend the plan-analysis skill's goal-mapping matrix to route to new lenses based on analytical goals.

### New Goal Mappings

| Analytical Goal | Lens(es) | Pipeline Mode |
|----------------|----------|---------------|
| Error handling analysis | error-resilience (19) | single |
| Performance review | optim (20) | single |
| API quality review | api-surface (22) | single |
| Evolution/coupling | evolution (21) | single |
| Comprehensive behavioral | 19-23 | behavioral |
| Trust boundary review | sdl-trust (13) | single or portfolio |
| Coupling/ordering analysis | sdl-coupling (14) | single or portfolio |
| Abstraction quality | sdl-abstraction (15) | single or portfolio |
| Dead code / reachability | reachability (30) | single |
| State machine analysis | state-audit (32) | single |
| Contract fidelity | fidelity (31) | single or portfolio |
| Evidence-cost hybrid | evidence-cost (29) | single |

### Code-vs-General Rule Update
- Code → resources 00-02 + 06-22 + 29-32
- General → resources 03-05 + 06-10 + 15 (sdl-abstraction, universal) + 18 (73w, Sonnet-only) + 24-26 (neutral variants)
- Note: contract (11) remains code-only; behavioral pipeline (19-23) is code-only; SDL lenses (12-14, 16-17) are code-only; sdl-abstraction (15) and 73w (18) work on both

### Success Criteria
- All new lenses appear in the goal-mapping matrix
- Code-vs-general rule updated for all new resources
- Plan-analysis recommends behavioral pipeline mode for comprehensive behavioral goals

---

## R6: Workflow Definition Updates

### Requirement
Update `workflow.toon` and activity definitions to support the behavioral pipeline mode.

### Changes Required

**workflow.toon:**
- Update `pipeline_mode` variable description to include "behavioral"
- Add behavioral-specific state variables if needed (e.g., behavioral output paths)

**Activities:**
- `00-select-mode.toon`: Add "Behavioral" option to confirm-mode checkpoint
- `01-structural-pass.toon`: Add conditional branch for `pipeline_mode == "behavioral"` to dispatch 4 behavioral lenses in parallel; add transition to behavioral-synthesis-pass
- New activity `05-behavioral-synthesis-pass.toon`: Dispatch behavioral synthesis lens with 4 labeled inputs; transition to deliver-result
- `04-deliver-result.toon`: Handle behavioral mode (read behavioral-synthesis.md as primary result)

**Skills:**
- `04-orchestrate-prism.toon`: Add `dispatch-behavioral-passes` and `dispatch-behavioral-synthesis` protocol steps
- New skill `05-behavioral-pipeline.toon`: Define the 4+1 behavioral pipeline worker-side execution, including label mapping

### Success Criteria
- Behavioral pipeline executes end-to-end: select-mode → structural-pass (4 parallel) → behavioral-synthesis-pass → deliver-result
- Existing single, full-prism, and portfolio paths are unchanged
- Label mapping is explicit in skill or activity definition

---

## R7: Resources README Update

### Requirement
Update `resources/README.md` with the complete expanded catalog, organized by family with usage guidance.

### Success Criteria
- All 33 resources documented with index, name, family, word count, target type, and purpose
- Family groupings clearly labeled (L12 Pipeline, General Pipeline, Portfolio, SDL, Behavioral, Domain-Neutral, Compressed, Hybrid/Specialized)
- Recommended combinations updated to include new lenses
- Cross-workflow access instructions remain accurate

---

## R8: Compressed and Domain-Neutral Variants

### Requirement
Compressed variants (27-28) and domain-neutral variants (24-26) are separate indexed resources. They are not parameterized alternatives — the resource system has no variant selection mechanism.

### Routing Guidance
- Compressed variants are secondary routing options for model optimization (e.g., Haiku). Plan-analysis may reference them in a "model-aware routing" note but should default to full-length versions.
- Domain-neutral variants are selected when `target_type == "general"` for the corresponding behavioral lens used in portfolio mode.

### Success Criteria
- Compressed and domain-neutral variants are independently loadable resources
- Plan-analysis documents when to use each variant
- Domain-neutral variants are included in the general target_type lens set

---

## AR1: Model Sensitivity Classification

### Requirement
Plan-analysis and portfolio-analysis skills must encode model sensitivity metadata when recommending lenses. Prisms fall into two categories:

**Structural prisms (model-independent — Haiku ≈ Sonnet ≈ Opus):**

| Lens | Index | Quality (all models) |
|------|-------|---------------------|
| L12 | 00 | 9.8 |
| Deep Scan (SDL-1) | 12 | 9.0 |
| Trust Topology (SDL-2) | 13 | 9.0 |
| Coupling Clock (SDL-3) | 14 | 9.0 |
| Rec (SDL-4) | 16 | 9.0 |
| Ident (SDL-5) | 17 | 9.5 |
| 73w | 18 | 9.0 (Sonnet only — see AR3) |

**Behavioral prisms (model-sensitive — Sonnet +0.5-1.3 over Haiku):**

| Lens | Index | Haiku | Sonnet |
|------|-------|-------|--------|
| ErrRes (V11) | 19 | 8.7-9.0 | 9.0-9.5 |
| Optim (V14) | 20 | 8.5-9.0 | ~9.5 |
| Evo (V10) | 21 | 8.5-8.7 | ~9.5 |
| API Surface (V3) | 22 | 8.7-9.0 | ~9.5 |

### Success Criteria
- Plan-analysis notes model sensitivity when recommending behavioral prisms
- Skill documentation clearly identifies which lenses benefit from Sonnet over Haiku
- No model constraint enforced at runtime — this is advisory guidance for the orchestrator

---

## AR2: Domain-Neutral Variant Quality Gaps

### Requirement
Plan-analysis MUST prefer code-specific variants when `target_type == "code"`. Domain-neutral variants should only be recommended when `target_type == "general"`. Neutral variants have measurable quality gaps vs. code-specific versions:

| Neutral Variant | Index | On Code | On Reasoning | Gap vs Code-Specific |
|----------------|-------|---------|--------------|---------------------|
| ErrRes Neutral | 24 | ~8.0-8.5 | ~8.0 | -0.5 to -1.0 |
| API Neutral | 25 | ~8.0-8.5 | ~8.0 | -0.7 to -1.0 |
| Evo Neutral | 26 | ~8.0 | ~7.0 | -0.5 to -0.7 (weakest — software framing leaks) |

### Routing Rule
- `target_type == "code"` → always use code-specific behavioral lenses (19-22)
- `target_type == "general"` → use neutral variants (24-26) in portfolio mode; skip optim (no neutral variant, too code-specific)
- Never use neutral variants on code targets — the quality gap is measurable and unnecessary

### Success Criteria
- Code-vs-general rule in plan-analysis enforces code-specific preference
- Evo Neutral (26) flagged as weakest neutral variant in documentation
- Portfolio-analysis selection guide notes quality gaps when recommending neutral variants for general targets

---

## AR3: 73w Model Constraint

### Requirement
73w (resource 18) is Sonnet-only. Haiku fails below this 73-word compression floor (enters "conversation mode" instead of executing the analysis). Plan-analysis must encode this constraint.

### Routing Rule
- Only recommend 73w when the executing model is Sonnet or Opus
- When Haiku is known/assumed, recommend L12 (00) or SDL lenses (12-17) instead
- If model is unknown, default to L12 (00) which works on all models

### Success Criteria
- Plan-analysis includes a model-constraint note for 73w
- 73w is not the default single-lens recommendation (L12 remains the default)
- Documentation notes the Sonnet-only constraint

---

## AR4: Cognitive Operation → Goal Mapping

### Requirement
Each prism answers a specific "key question" that maps to analytical goals. The plan-analysis goal-mapping matrix should use these cognitive operations for precise routing.

### Structural Prisms — Key Questions

| Lens | Index | Key Question | Cognitive Operation |
|------|-------|-------------|-------------------|
| L12 | 00 | "What code IS" | Conservation law + meta-law + classified bugs |
| Deep Scan (SDL-1) | 12 | "What structure HIDES" | 3 structural bug patterns + information laundering |
| Trust Topology (SDL-2) | 13 | "Where AUTHORITY inverts" | Trust gradient + boundary collapse |
| Coupling Clock (SDL-3) | 14 | "When ORDER matters" | Temporal coupling + invariant windows |
| Rec (SDL-4) | 16 | "What FIXES hide" | Fix failures + unfixable invariants |
| Ident (SDL-5) | 17 | "What code CLAIMS vs reality" | Identity displacement + necessary costs |

### Behavioral Prisms — Key Questions

| Lens | Index | Key Question | Cognitive Operation |
|------|-------|-------------|-------------------|
| ErrRes (V11) | 19 | "How code BREAKS" | Error boundary + info destruction + impossible fix |
| Optim (V14) | 20 | "What code COSTS" | Opacity + blind workarounds + conservation law |
| Evo (V10) | 21 | "How code CHANGES" | Invisible handshakes + poison propagation + fragility atlas |
| API Surface (V3) | 22 | "What code PROMISES vs does" | Promise tracing + lie hunting + naming debt |

### Updated Goal-Mapping Matrix
These key questions should replace or augment the generic goal mappings in R5:

| Analytical Goal (User Says) | Maps To Key Question | Lens(es) |
|----------------------------|---------------------|----------|
| "find hidden bugs" | "What structure HIDES" | deep-scan (12) |
| "security/trust review" | "Where AUTHORITY inverts" | sdl-trust (13) |
| "ordering/timing bugs" | "When ORDER matters" | sdl-coupling (14) |
| "will this fix work?" | "What FIXES hide" | rec (16) |
| "naming quality" | "What code CLAIMS vs reality" | ident (17) |
| "error handling" | "How code BREAKS" | error-resilience (19) |
| "performance" | "What code COSTS" | optim (20) |
| "maintainability/evolution" | "How code CHANGES" | evolution (21) |
| "API quality" | "What code PROMISES vs does" | api-surface (22) |
| "comprehensive behavioral" | All 4 behavioral questions | behavioral pipeline (19-23) |

### Success Criteria
- Goal-mapping matrix uses key questions as the routing vocabulary
- Each lens's key question documented in resources README
- Plan-analysis can match user intent to the most specific key question

---

## AR5: Quality Score Metadata in Resources

### Requirement
Resource files should preserve calibration metadata from the agi-in-md source front matter. This includes quality scores, model versions tested, word counts, and calibration dates. This metadata enables quality-aware lens selection and tracks provenance.

### Metadata Fields to Preserve
- `calibration_date` — when the lens was last validated
- `model_versions` — which models were tested
- `quality_baseline` — quality score baseline
- `words` — word count (from description or counted)
- `origin` — design origin (e.g., "Sonnet S3 self-generated")
- `notes` — any relevant usage notes

### Implementation
The existing resources (00-11) strip YAML front matter from upstream files. New resources should **preserve** the YAML front matter — it serves as in-file documentation that is invisible to the model when the lens prompt is applied (models execute from the first imperative line, ignoring front matter).

### Success Criteria
- All new resource files include YAML front matter from upstream
- Resources README documents the metadata schema
- Front matter does not interfere with lens execution (verified by checking that existing agi-in-md usage with front matter works)

---

## Scope Boundaries

### In Scope
- Resource file import (copy from agi-in-md with standardized naming)
- Workflow TOON file updates (workflow.toon, activities, skills)
- Resource README update
- All changes confined to the `workflows/prism/` directory in the workflows worktree

### Out of Scope
- MCP server source code changes (`src/`, `schemas/`)
- Dynamic resource registry or per-lens metadata system (deferred — static tables remain manageable at 33 resources)
- Changes to other workflows (work-package, meta, etc.)
- New general-domain L12 pipeline variants (03-05 equivalents) for behavioral lenses
- Automated testing of workflow definitions (no test framework exists for TOON files)

---

## Assumptions from Elicitation

| ID | Assumption | Category | Resolvability | Status |
|----|-----------|----------|---------------|--------|
| A-016 | The 9 prisms that already exist in the workflow are content-identical to upstream and do not need re-import | Scope Boundaries | code-analyzable | Validated |
| A-017 | 73w should be classified as SDL family despite being a compressed L12 variant, because it functions as a standalone single-pass lens like SDL lenses | Requirement Interpretation | stakeholder-dependent | Open |
| A-018 | sdl_abstraction works on both code and reasoning — portfolio-eligible for general targets despite other SDL lenses being code-only | Requirement Interpretation | code-analyzable | Validated |
| A-019 | The behavioral pipeline artifact filenames (behavioral-errors.md, etc.) should use descriptive names rather than lens names to match the synthesis lens's label expectations | Requirement Interpretation | stakeholder-dependent | Open |
| A-020 | No new general-domain L12 pipeline (03-05 equivalents) is needed for the behavioral lenses — domain-neutral variants are standalone portfolio lenses, not a parallel pipeline | Scope Boundaries | stakeholder-dependent | Open |
| A-021 | Model sensitivity metadata is advisory guidance in skill documentation, not a runtime constraint — the workflow has no mechanism to detect or enforce model selection | Implicit Requirements | code-analyzable | Validated |
| A-022 | YAML front matter in resource files does not interfere with lens execution — models skip front matter when executing imperative prompts | Implicit Requirements | code-analyzable | Open |
| A-023 | sdl_abstraction (15) should be in the general target_type lens set alongside 73w (18) and neutral variants (24-26), since it is confirmed universal | Requirement Interpretation | code-analyzable | Validated |
| A-024 | The existing resources (00-11) should NOT be retroactively updated to add YAML front matter — only new resources (12-32) include it | Scope Boundaries | stakeholder-dependent | Open |
