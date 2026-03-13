# Work Package Plan

> **Date**: 2026-03-13
> **Work Package**: #53 — Import New Prism Families
> **Branch**: `enhancement/53-import-prism-families`
> **PR**: #54

## Implementation Strategy

Bottom-up dependency ordering: resources first (foundation), then skills (routing logic), then activities (orchestration), then documentation. Each change block is independently committable and testable.

---

## CB-1: Resource Import

**Effort**: Low | **Risk**: Low | **Dependencies**: None

Import 21 new resource files from `/home/mike/projects/vendor/agi-in-md/prisms/` into `workflows/prism/resources/` with standardized naming. Preserve YAML frontmatter from upstream.

| Index | Target File | Source File |
|-------|------------|-------------|
| 12 | `12-deep-scan.md` | `deep_scan.md` |
| 13 | `13-sdl-trust.md` | `sdl_trust.md` |
| 14 | `14-sdl-coupling.md` | `sdl_coupling.md` |
| 15 | `15-sdl-abstraction.md` | `sdl_abstraction.md` |
| 16 | `16-rec.md` | `rec.md` |
| 17 | `17-ident.md` | `ident.md` |
| 18 | `18-73w.md` | `73w.md` |
| 19 | `19-error-resilience.md` | `error_resilience.md` |
| 20 | `20-optim.md` | `optim.md` |
| 21 | `21-evolution.md` | `evolution.md` |
| 22 | `22-api-surface.md` | `api_surface.md` |
| 23 | `23-behavioral-synthesis.md` | `behavioral_synthesis.md` |
| 24 | `24-error-resilience-neutral.md` | `error_resilience_neutral.md` |
| 25 | `25-api-surface-neutral.md` | `api_surface_neutral.md` |
| 26 | `26-evolution-neutral.md` | `evolution_neutral.md` |
| 27 | `27-error-resilience-compact.md` | `error_resilience_compact.md` |
| 28 | `28-error-resilience-70w.md` | `error_resilience_70w.md` |
| 29 | `29-evidence-cost.md` | `evidence_cost.md` |
| 30 | `30-reachability.md` | `reachability.md` |
| 31 | `31-fidelity.md` | `fidelity.md` |
| 32 | `32-state-audit.md` | `state_audit.md` |

**Commit**: `feat: import 21 new prism resources (SDL, behavioral, hybrid) (#53)`

---

## CB-2: Workflow Definition Update

**Effort**: Low | **Risk**: Low | **Dependencies**: None

**File**: `workflow.toon`

| Change | Location | Detail |
|--------|----------|--------|
| Update pipeline_mode description | Line 36 | Add `'behavioral'` to the description: `"Analysis mode: 'single' (L12), 'full-prism' (3-pass), 'portfolio' (multiple lenses), or 'behavioral' (4-prism behavioral pipeline)"` |

**Commit**: `feat: add behavioral pipeline mode to workflow definition (#53)`

---

## CB-3: New Behavioral Pipeline Skill

**Effort**: Medium | **Risk**: Medium | **Dependencies**: CB-1

**File**: `skills/05-behavioral-pipeline.toon` (new)

Structure follows `01-full-prism.toon` pattern:

```
id: behavioral-pipeline
version: 1.0.0
capability: Execute a pass of the behavioral pipeline within the prism workflow's isolation model

inputs:
  - target-content (code to analyze)
  - lens-resource-index (which behavioral lens to load)
  - prior-artifact-paths (for synthesis: 4 labeled artifact paths)
  - output-path
  - pass-role (ERRORS | COSTS | CHANGES | PROMISES | SYNTHESIS)

protocol:
  load-lens: Load resource via get_resource
  read-prior-artifacts: For synthesis pass, read 4 artifacts and label them
  apply-lens: Execute lens operations against target
  write-artifact: Write to {output-path}/behavioral-{role}.md

rules:
  label-mapping:
    "The behavioral synthesis expects 4 labeled inputs:
     ERRORS → error-resilience (19) output
     COSTS → optim (20) output
     CHANGES → evolution (21) output
     PROMISES → api-surface (22) output"
  code-only: "Behavioral pipeline is code-only. Do not use on general targets."

resources: ["19","20","21","22","23"]
```

**Commit**: `feat: add behavioral-pipeline skill with label mapping (#53)`

---

## CB-4: Skill Routing Updates

**Effort**: High | **Risk**: Medium | **Dependencies**: CB-1, CB-3

### 4a. plan-analysis.toon

| Change | Location | Detail |
|--------|----------|--------|
| Expand goal-mapping-matrix rule | Line 101 | Add 12 new mappings: error handling→19, performance→20, evolution/coupling→21, API quality→22, comprehensive behavioral→behavioral pipeline, trust boundaries→13, coupling/ordering→14, abstraction quality→15, fix analysis→16, naming quality→17, dead code→30, state analysis→32, contract fidelity→31, evidence-cost→29 |
| Update code-vs-general rule | Line 102 | Code: 00-02 + 06-22 + 29-32. General: 03-05 + 06-10 + 15 + 18 + 24-26 |
| Add behavioral mode routing | Lines 57-64 (select-strategy) | Add behavioral pipeline mode for budget mappings |
| Update build-analysis-units | Lines 71-75 | Handle pipeline_mode "behavioral" in unit construction |
| Expand resources list | Lines 108-120 | From `["00"-"11"]` to `["00"-"32"]` |
| Add model sensitivity note | New rule | Note Sonnet preference for behavioral prisms, Sonnet-only for 73w (18), Opus preference for deep_scan (12) and rec (16) |

### 4b. portfolio-analysis.toon

| Change | Location | Detail |
|--------|----------|--------|
| Update selected-lenses description | Line 15 | Expand lens name list to include SDL (deep-scan, sdl-trust, sdl-coupling, sdl-abstraction, rec, ident), behavioral (error-resilience, optim, evolution, api-surface), hybrid (evidence-cost, reachability, fidelity, state-audit) |
| Update select-lenses protocol | Lines 22-26 | Add selection guide entries: architecture→deep-scan+sdl-trust, coupling→sdl-coupling+evolution, error analysis→error-resilience+evidence-cost, API review→api-surface+fidelity |
| Update load-lenses mapping | Line 28 | Add index mappings for all new portfolio-eligible lenses |
| Add sdl-abstraction universal rule | New rule | sdl-abstraction (15) works on both code and general targets |
| Add 73w Sonnet-only rule | New rule | 73w (18) only for Sonnet/Opus models |
| Expand resources list | Lines 68-74 | From `["06"-"11"]` to include 12-22, 29-32 |

### 4c. orchestrate-prism.toon

| Change | Location | Detail |
|--------|----------|--------|
| Expand determine-lens-indices | Lines 34-38 | Add SDL indices (12-18), behavioral indices (19-23), domain-neutral (24-26), compressed (27-28), hybrid (29-32) |
| Add dispatch-behavioral-passes protocol | New section | Dispatch 4 behavioral lenses in parallel (up to 4 concurrent). Each writes to `{output-path}/behavioral-{role}.md`. Collect 4 artifact paths. |
| Add dispatch-behavioral-synthesis protocol | New section | Construct labeled input from 4 artifacts (`## ERRORS\n\n{content}`, etc.). Dispatch synthesis worker with behavioral_synthesis resource (23). Write to `{output-path}/behavioral-synthesis.md`. |
| Update present-result | Lines 65-68 | Add behavioral case: read behavioral-synthesis.md as primary, note 4 per-lens artifacts as appendices |

**Commit**: `feat: expand skill routing for SDL, behavioral, and hybrid lenses (#53)`

---

## CB-5: Activity Updates

**Effort**: Medium | **Risk**: Medium | **Dependencies**: CB-2, CB-3, CB-4

### 5a. select-mode.toon

| Change | Location | Detail |
|--------|----------|--------|
| Add behavioral checkpoint option | Lines 36-56 | Add option: `id: switch-behavioral, label: "Behavioral", description: "4-prism behavioral analysis (error resilience, optimization, evolution, API surface + synthesis)", effect: { setVariable: { pipeline_mode: behavioral } }` |
| Add recognition keywords | Lines 7-8 | Add "behavioral", "error resilience", "behavioral analysis" |

### 5b. structural-pass.toon

| Change | Location | Detail |
|--------|----------|--------|
| Add behavioral conditional steps | After line 84 | New steps conditioned on `pipeline_mode == "behavioral"`: dispatch 4 behavioral lenses in parallel, collect artifact paths |
| Add behavioral transition | Lines 89-97 | Add transition: `to: behavioral-synthesis-pass, condition: pipeline_mode == "behavioral"` |

### 5c. behavioral-synthesis-pass.toon (new)

**File**: `activities/05-behavioral-synthesis-pass.toon`

Structure follows `03-synthesis-pass.toon`:

```
id: behavioral-synthesis-pass
version: 1.0.0
name: Behavioral Synthesis Pass
skills: primary: behavioral-pipeline
loops:
  - forEach over analysis_units
    condition: pipeline_mode == "behavioral"
    steps: read 4 behavioral artifacts, load behavioral_synthesis (23),
           execute synthesis, write behavioral-synthesis.md
transitions:
  - to: deliver-result (default)
```

### 5d. deliver-result.toon

| Change | Location | Detail |
|--------|----------|--------|
| Add behavioral mode case | Lines 9-11 | If `pipeline_mode == "behavioral"`, read `{output_path}/behavioral-synthesis.md` as primary result. Note 4 per-lens artifacts as appendices. |

**Commit**: `feat: add behavioral pipeline activities and mode support (#53)`

---

## CB-6: Documentation

**Effort**: Medium | **Risk**: Low | **Dependencies**: All above

### 6a. resources/README.md

Full rewrite with:
- 33-resource catalog organized by family (8 families)
- Per-resource: index, name, word count, target type, key question, purpose
- Model sensitivity table (AR1)
- Quality score metadata schema (AR5)
- Updated recommended combinations including SDL and behavioral lenses
- Behavioral pipeline documentation
- Cross-workflow access instructions

### 6b. README.md (workflow)

| Change | Detail |
|--------|--------|
| Modes section | Add Behavioral Pipeline description |
| File Structure | Update to show 6 activities, 6 skills, 33 resources |

**Commit**: `docs: update prism workflow documentation for expanded catalog (#53)`

---

## Execution Summary

| Block | Files Created | Files Modified | Effort | Estimated Lines |
|-------|--------------|----------------|--------|-----------------|
| CB-1 | 21 | 0 | Low | ~500 (resource content) |
| CB-2 | 0 | 1 | Low | ~5 |
| CB-3 | 1 | 0 | Medium | ~80 |
| CB-4 | 0 | 3 | High | ~100 |
| CB-5 | 1 | 3 | Medium | ~80 |
| CB-6 | 0 | 2 | Medium | ~200 |
| **Total** | **23** | **9** | | **~965** |

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Follow behavioral_synthesis.md composition (evolution + api_surface), not prism.py (rec + ident) | Synthesis prompt's internal language matches evolution + api_surface. prism.py appears to have incomplete migration. (A-025) |
| Behavioral pipeline is code-only | No optim_neutral variant exists. 3/4 neutral coverage is insufficient for a pipeline. Individual neutral lenses available in portfolio mode. |
| SDL lenses are portfolio-eligible, not a separate mode | SDL lenses are standalone 3-step single-pass lenses matching the portfolio pattern. No separate orchestration needed. |
| Compressed variants as separate resources | Resource system has no parameterization. Each variant is a complete standalone file. |
| Preserve YAML frontmatter in new resources only | Existing 00-11 are unchanged. New 12-32 include frontmatter. Inconsistency is documented. |
| Static index tables (not dynamic registry) | Manageable at 33 resources. Dynamic registry requires server-side changes (out of scope). |
