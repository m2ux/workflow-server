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

## Summary

| Status | Count |
|--------|-------|
| Validated | 11 |
| Partially Validated | 2 |
| Invalidated | 0 |
| Open (stakeholder-dependent) | 1 |
| **Total** | **15** |

### Remaining Open Assumptions

- **A-003** (stakeholder-dependent): Whether to exclude codegen.md and arc_code.md. Current recommendation: exclude — they target code generation and ARC puzzles, not structural analysis.

### Partially Validated — Stable

- **A-007**: Domain-neutral behavioral pipeline is incomplete — no `optim_neutral.md` exists in the agi-in-md/prisms/ directory. Only 3 of 4 behavioral lenses have neutral variants (error_resilience_neutral, api_surface_neutral, evolution_neutral). The behavioral pipeline on non-code targets would need to either skip optim, use the code version, or defer behavioral pipeline mode for non-code targets entirely. This is a design decision, not resolvable by further code analysis.
- **A-011**: Orchestrator can dispatch 4 parallel lenses using the existing portfolio parallel dispatch pattern (up to 4 concurrent, per orchestrate-prism.toon line 62). However, the behavioral synthesis pass needs a new dispatch protocol: it expects 4 labeled inputs (ERRORS, COSTS, CHANGES, PROMISES) mapped to specific artifact files, unlike L12 synthesis which expects 2 unlabeled prior artifacts. This is a design decision about orchestration extension, not further code-analyzable.
