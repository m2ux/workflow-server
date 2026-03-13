# Assumptions Log

## Convention

| Column | Description |
|--------|-------------|
| ID | Unique identifier (A-NNN) |
| Assumption | What is assumed |
| Category | Problem Interpretation, Complexity Assessment, Workflow Path, Technical |
| Resolvability | code-analyzable, stakeholder-dependent |
| Status | Open, Validated, Invalidated, Partially Validated |
| Evidence | File paths, analysis, or stakeholder input supporting the resolution |

---

## Assumptions

| ID | Assumption | Category | Resolvability | Status | Evidence |
|----|-----------|----------|---------------|--------|----------|
| A-001 | Existing resource indices 00–11 are stable and directly referenced by hardcoded index values in skills and activities | Technical | code-analyzable | Validated | `plan-analysis.toon` lines 42, 64, 101–104: hardcodes 00–11 in goal-mapping matrix. `portfolio-analysis.toon` line 28: maps pedagogy=06 through contract=11. `structural-analysis.toon` line 20: references resource 00. `full-prism.toon` lines 60–65: resources list 00–05. `orchestrate-prism.toon` lines 36–38: hardcodes 00–05 and 06–11. |
| A-002 | New resources should be numbered starting from index 12 to avoid collisions | Technical | code-analyzable | Validated | No resources exist at index 12+. The resources directory contains only 00–11 plus README.md. Extending from 12 is collision-free. |
| A-003 | codegen.md and arc_code.md should be excluded because they are not structural analysis prisms | Problem Interpretation | stakeholder-dependent | Open | codegen targets code generation quality; arc_code targets ARC puzzle solving. Neither fits the workflow's analytical purpose. User may want them included. |
| A-004 | The behavioral pipeline has a fixed 4+1 structure (4 independent lenses → 1 synthesis) | Technical | code-analyzable | Validated | `behavioral_synthesis.md` lines 11–14: hardcodes four labeled inputs (ERRORS, COSTS, CHANGES, PROMISES) mapped to error_resilience, optim, evolution, api_surface. Cannot reorder or omit lenses without breaking the synthesis prompt. |
| A-005 | The 4 behavioral lenses can run in parallel since they are independent | Technical | code-analyzable | Validated | Each behavioral lens (error_resilience, optim, evolution, api_surface) operates on the original target only — none references output from another behavioral lens. Only the synthesis lens requires all 4 outputs. |
| A-006 | SDL lenses are standalone single-pass lenses suitable for portfolio mode | Technical | code-analyzable | Validated | deep_scan, sdl_trust, sdl_coupling, sdl_abstraction, rec, ident all have 3-step structure and operate on target content directly with no dependency on prior pass output. They match the portfolio lens pattern (single-pass, independent). |
| A-007 | Domain-neutral behavioral variants should be selected based on target_type (code vs general) | Technical | code-analyzable | Partially Validated | Domain-neutral variants exist for 3 of 4 behavioral lenses (error_resilience_neutral, api_surface_neutral, evolution_neutral). No neutral variant exists for optim. This means a fully domain-neutral behavioral pipeline is not possible — optim would still use the code version on non-code targets. |
| A-008 | 73w.md is a compressed L12 suitable for Sonnet-universal single-shot analysis, not a pipeline component | Technical | code-analyzable | Validated | 73w.md is a self-contained compressed version of the L12 lens. It produces conservation laws in a single pass. It is not part of any pipeline sequence. Per CLAUDE.md: "73w = Sonnet-universal compression floor. Always single-shot." |
| A-009 | Compressed variants (error_resilience_compact, error_resilience_70w) serve model-specific optimization rather than analytical differentiation | Technical | code-analyzable | Validated | Both are shorter versions of error_resilience.md with the same 3-step structure but fewer words. The compact variant (~100w) and 70w variant (~70w) trade word count for model compatibility (Haiku needs fewer words to stay single-shot). |
| A-010 | The select-mode activity's pipeline mode checkpoint needs a new option for "behavioral" | Technical | code-analyzable | Validated | `select-mode.toon` lines 36–56: checkpoint options are accept, switch-single, switch-full-prism, switch-portfolio. No behavioral option exists. |
| A-011 | The orchestrate-prism skill can be extended to dispatch behavioral pipeline passes (4 parallel + 1 synthesis) | Complexity Assessment | code-analyzable | Partially Validated | `orchestrate-prism.toon` already dispatches portfolio lenses in parallel (line 62: "up to 4 concurrent"). The behavioral pipeline's 4 independent lenses could use the same parallel dispatch pattern. However, the synthesis pass is structurally different from the L12 synthesis — it expects 4 labeled inputs, not 2. The orchestrator would need a new dispatch protocol for behavioral synthesis. |
| A-012 | The plan-analysis skill's goal-mapping matrix needs expansion for SDL and behavioral goals | Technical | code-analyzable | Validated | `plan-analysis.toon` line 101: goal-mapping-matrix lists only L12 (00), contract (11), claim (07), rejected-paths (09), pedagogy (06), scarcity (08), degradation (10), L12-general (03). No entries for SDL lenses, behavioral pipeline, or hybrid lenses. |
| A-013 | The portfolio-analysis skill's lens catalog (pedagogy, claim, scarcity, rejected-paths, degradation, contract) needs expansion | Technical | code-analyzable | Validated | `portfolio-analysis.toon` line 15: selected-lenses description lists only the 6 portfolio names. Line 28: load-lenses maps pedagogy=06 through contract=11. Line 68: resources list is 06–11 only. |
| A-014 | evidence_cost, reachability, fidelity, and state_audit are hybrid/specialized lenses that may not fit neatly into existing categories (pipeline, portfolio, or SDL) | Problem Interpretation | code-analyzable | Validated | All four are standalone 3-step single-pass lenses, matching the portfolio lens pattern. All are code-specific. `evidence_cost.md` is a hybrid of error_resilience + optim (per its YAML front matter `parents: [error_resilience, optim]`). `fidelity.md` is labeled SDL-9 in its notes. `reachability.md` targets dead code and unreachable paths. `state_audit.md` maps stateful workflows as state machines. All are portfolio-eligible. |
| A-015 | The workflow.toon pipeline_mode variable needs "behavioral" added to its description but the variable type is string (no enum enforcement) | Technical | code-analyzable | Validated | `workflow.toon` line 36: pipeline_mode is type string with description listing 'single', 'full-prism', 'portfolio'. No TOON enum enforcement — the description is the contract. Adding "behavioral" requires updating the description and all skills/activities that switch on pipeline_mode. |

---

## Elicitation-Phase Assumptions

| ID | Assumption | Category | Resolvability | Status | Evidence |
|----|-----------|----------|---------------|--------|----------|
| A-016 | The 9 prisms already in the workflow are content-identical to upstream and do not need re-import | Scope Boundaries | code-analyzable | Validated | diff of pedagogy.md and claim.md shows content is identical — differences are only trailing newline and YAML front-matter stripping (existing resources strip front matter, upstream files include it). No re-import needed. |
| A-017 | 73w should be classified as SDL family despite being a compressed L12, because it functions as a standalone single-pass lens | Requirement Interpretation | stakeholder-dependent | Open | 73w is a 73-word compression of the full L12. It produces the same kind of findings (conservation law) but in a single pass. Functionally it is a standalone lens like SDL. Classification is a naming/grouping decision. |
| A-018 | sdl_abstraction works on both code and reasoning (portfolio-eligible for general targets) unlike other SDL lenses | Requirement Interpretation | code-analyzable | Validated | sdl_abstraction.md YAML notes: "Universal: code (type leaks, exception leaks, strategy flag anti-patterns) and reasoning (conceptual frameworks that reveal their own assumptions, meta-concepts bleeding into object-level claims)." Confirmed: sdl_abstraction is portfolio-eligible for general target_type. |
| A-019 | Behavioral pipeline artifact filenames should use descriptive names (behavioral-errors.md) rather than lens names (behavioral-error_resilience.md) | Requirement Interpretation | stakeholder-dependent | Open | Descriptive names match the synthesis lens's label expectations (ERRORS, COSTS, CHANGES, PROMISES) and are more readable. Lens names are more traceable. |
| A-020 | No general-domain behavioral pipeline is needed — domain-neutral variants are standalone portfolio lenses | Scope Boundaries | stakeholder-dependent | Open | Behavioral pipeline is code-only due to optim having no neutral variant. Individual neutral lenses are available for portfolio mode on non-code targets. |
| A-021 | Model sensitivity metadata is advisory guidance in skill documentation, not a runtime constraint — the workflow has no mechanism to detect or enforce model selection | Implicit Requirements | code-analyzable | Validated | The prism workflow has no model variable or model-detection mechanism. `workflow.toon` variables include target, target_type, pipeline_mode, output_path, selected_lenses, analysis_focus — no model field. Model sensitivity is documentation-only. |
| A-022 | YAML front matter in resource files does not interfere with lens execution — models skip front matter when executing imperative prompts | Implicit Requirements | code-analyzable | Validated | The agi-in-md project uses all prisms WITH front matter via prism.py in production. All quality scores (9.0-9.8) were generated with front matter present. No interference observed across Haiku, Sonnet, and Opus. |
| A-023 | sdl_abstraction (15) should be in the general target_type lens set alongside 73w (18) and neutral variants (24-26) | Requirement Interpretation | code-analyzable | Validated | sdl_abstraction.md notes confirm "Universal: code and reasoning." It is the only SDL lens that works on non-code targets. Added to general lens set in R5 code-vs-general rule. |
| A-024 | The existing resources (00-11) should NOT be retroactively updated to add YAML front matter — only new resources (12-32) include it | Scope Boundaries | stakeholder-dependent | Open | Changing existing resources is out of scope per constraint. But the inconsistency (00-11 without front matter, 12-32 with) may be confusing. |

## Summary

## Research-Phase Assumptions

| ID | Assumption | Category | Resolvability | Status | Evidence |
|----|-----------|----------|---------------|--------|----------|
| A-025 | The prism.py behavioral pipeline was modified after behavioral_synthesis.md was written, and behavioral_synthesis.md represents the intended design (evolution + api_surface, not rec + ident) | Source Relevance | stakeholder-dependent | Open | prism.py lines 5166-5178 show identical general/code mode prism lists (both use rec + ident), suggesting incomplete migration. behavioral_synthesis.md's Step 1 references "invisible handshakes" (evolution) and "naming lies" (api_surface) which don't match rec/ident. |
| A-026 | The upstream OPTIMAL_PRISM_MODEL preferences (deep_scan→opus, rec→opus) are still valid for current model versions | Source Relevance | stakeholder-dependent | Open | Model preferences may change with new model releases. The calibration_date in prism metadata is 2026-03-11. |
| A-027 | The synthesis input format (`## ROLE\n\n{output}`) from prism.py is compatible with how the workflow should construct synthesis context from artifact files | Pattern Applicability | code-analyzable | Validated | The behavioral_synthesis.md prompt expects labeled sections. prism.py constructs these as `## {ROLE}\n\n{output}` (lines 5210-5211). The workflow orchestrator can construct the same format by reading per-lens artifact files and prepending role labels. |

## Implementation-Analysis-Phase Assumptions

| ID | Assumption | Category | Resolvability | Status | Evidence |
|----|-----------|----------|---------------|--------|----------|
| A-028 | Adversarial-pass and synthesis-pass activities do not need modification — they filter on `pipeline_mode == "full-prism"` and naturally skip behavioral units | Current Behavior | code-analyzable | Validated | adversarial-pass.toon lines 24-26: condition `current_unit.pipeline_mode == "full-prism"`. synthesis-pass.toon lines 24-26: same condition. Behavioral units will be skipped. |
| A-029 | The existing portfolio dispatch pattern in structural-pass (parallel up to 4) can be adapted for behavioral lens dispatch | Current Behavior | code-analyzable | Validated | structural-pass.toon lines 58-84: portfolio conditional branch dispatches independent lenses in parallel. Behavioral pipeline has the same pattern (4 independent lenses). |
| A-030 | Resource naming convention (`{NN}-{name}.md`) accommodates hyphenated names | Current Behavior | code-analyzable | Validated | Existing resource `09-rejected-paths.md` uses hyphens. New names like `12-deep-scan.md` follow the same pattern. |

## Planning-Phase Assumptions

| ID | Assumption | Category | Resolvability | Status | Evidence |
|----|-----------|----------|---------------|--------|----------|
| A-031 | Six change blocks (CB-1 through CB-6) can each be committed independently without breaking the workflow | Task Breakdown | code-analyzable | Validated | CB-1 (resources) adds files only — no breakage. CB-2 (workflow.toon) only changes a description string. CB-3 (new skill) is additive. CB-4 (skill updates) expands existing tables. CB-5 (activities) adds conditional branches that only fire for behavioral mode. CB-6 (docs) is documentation. The MCP server loads TOON files lazily — unrecognized pipeline_mode values are ignored until the workflow is invoked with that mode. |
| A-032 | The 6-commit strategy (one per CB) provides a clean git history without creating intermediate broken states | Task Breakdown | code-analyzable | Validated | Each CB adds functionality without removing any. Resources can exist before skills reference them. Skills can reference resources before activities invoke them. Activities can define transitions to not-yet-created activities (TOON transitions are strings, not validated at load time). |

## Summary

| Status | Count |
|--------|-------|
| Validated | 26 |
| Partially Validated | 2 |
| Invalidated | 0 |
| Open (stakeholder-dependent) | 7 |
| **Total** | **36** |

## Stakeholder-Review-Phase Assumptions

| ID | Assumption | Category | Resolvability | Status | Evidence |
|----|-----------|----------|---------------|--------|----------|
| A-033 | Resources 03-05 (L12 general pipeline) are dead/orphaned — upstream l12_general* files were deleted | Current Behavior | code-analyzable | Validated | `ls /home/mike/projects/vendor/agi-in-md/prisms/l12_general*` returns "No such file or directory". Git log shows commit "Remove dead l12_general* prisms". |
| A-034 | Resources 00-02 and 06-11 are content-identical to upstream (only missing YAML front matter) | Current Behavior | code-analyzable | Validated | Direct diff of content (stripping front matter from upstream) shows identical text for all 9 resources. |
| A-035 | Resources 03-05 are deprecated — full prism pipeline uses 00-02 for ALL target types (code and general). The upstream removed general variants because code versions work for general targets too. | Scope Boundaries | stakeholder-dependent | Validated | Stakeholder confirmed: code L12 lenses (00-02) work for both code and general targets. Upstream deleted l12_general* as unnecessary. Resources 03-05 should be removed, and skills updated to route all targets to 00-02. |
| A-036 | Full prism pipeline uses resources 00-02 for ALL target types — the code/general distinction for L12 is unnecessary | Current Behavior | stakeholder-dependent | Validated | Stakeholder confirmed. Upstream removed general variants because they were redundant. |

### Remaining Open Assumptions

- **A-003** (stakeholder-dependent): Whether to exclude codegen.md and arc_code.md. Current recommendation: exclude.
- **A-017** (stakeholder-dependent): Whether 73w belongs in the SDL family grouping or gets its own category.
- **A-019** (stakeholder-dependent): Behavioral artifact filename convention — descriptive (behavioral-errors.md) vs. lens-named (behavioral-error_resilience.md).
- **A-020** (stakeholder-dependent): Confirmation that no general-domain behavioral pipeline is needed.
- **A-024** (stakeholder-dependent): Whether existing resources (00-11) should be updated to add YAML front matter for consistency.
- **A-025** (stakeholder-dependent): Whether behavioral pipeline follows behavioral_synthesis.md (evolution + api_surface) or prism.py (rec + ident). Recommend behavioral_synthesis.md.
- **A-026** (stakeholder-dependent): Whether upstream Opus preferences for deep_scan and rec are still current.
- ~~**A-035**~~: Resolved — resources 03-05 deprecated, skills use 00-02 for all target types.

### Partially Validated — Stable

- **A-007**: Domain-neutral behavioral pipeline is incomplete — no `optim_neutral.md` exists. Behavioral pipeline is code-only. Individual neutral lenses available for portfolio mode.
- **A-011**: Orchestrator can dispatch 4 parallel lenses but needs new synthesis dispatch protocol for behavioral synthesis (4 labeled inputs).
