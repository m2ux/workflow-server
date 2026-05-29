---
name: portfolio-analysis
description: Run two or more portfolio lenses against the same artifact.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 2
  legacy_id: 2
---

# Portfolio Analysis

## Capability

Apply multiple complementary portfolio lenses to produce diverse structural findings with zero overlap

## Inputs

### artifact-content

The code or text to analyze. Can be a file path or inline content.

### output-path

*(optional)* Directory to write per-lens analysis artifacts

- **default**: .

### selected-lenses

*(optional)* Which portfolio lenses to apply. Array of lens names from the full catalog: pedagogy (06), claim (07), scarcity (08), rejected-paths (09), degradation (10), contract (11), deep-scan (12), sdl-trust (13), sdl-coupling (14), sdl-abstraction (15), fix-cascade (16), identity (17), l12-universal (18), error-resilience (19), optimize (20), evolution (21), api-surface (22), error-resilience-neutral (24), api-surface-neutral (25), evolution-neutral (26), error-resilience-compact (27), error-resilience-70w (28), evidence-cost (29), reachability (30), fidelity (31), state-audit (32), archaeology (33), audit-code (34), cultivation (35), sdl-simulation (36), security-v1 (37), simulation (38), testability-v1 (39), knowledge-audit (40), knowledge-boundary (41), knowledge-typed (42), l12g (43), oracle (44), arc-code (50), architect (51), blindspot (52), codegen (53), counterfactual (54), emergence (55), falsify (56), genesis (57), history (58), prereq (59), significance (60), verify-claims (61). If omitted, select-lenses protocol chooses based on the analytical goal.

### analytical-goal

*(optional)* What the caller wants to understand (e.g., 'trade-off analysis', 'maintainability risks', 'hidden assumptions'). Used for lens selection when selected-lenses is not provided.

## Protocol

### 1. Select Lenses

- If selected-lenses is provided, use those lenses
- If analytical-goal is provided but no lenses selected, choose 2-3 lenses using the lens selection guide below
- If neither is provided, default to claim + degradation (broadest complementary pair for code) or pedagogy + rejected-paths (broadest for non-code)
- Lens selection guide: trade-offs → scarcity (08) + rejected-paths (09). assumptions → claim (07) + pedagogy (06). maintainability → degradation (10) + contract (11). design rationale → pedagogy (06) + rejected-paths (09). interface quality → contract (11) + claim (07). architecture → deep-scan (12) + sdl-abstraction (15). trust/security → sdl-trust (13) + security-v1 (37). coupling/ordering → sdl-coupling (14) + evolution (21). API naming → api-surface (22) + identity (17). error+cost → error-resilience (19) + evidence-cost (29). dead code → reachability (30) + fidelity (31). state management → state-audit (32) + degradation (10). code archaeology → archaeology (33) + simulation (38). registration gaps → audit-code (34). change resilience → cultivation (35) + evolution (21). temporal fragility → sdl-simulation (36) + degradation (10). testability → testability-v1 (39) + fix-cascade (16). confabulation check → knowledge-audit (40) + knowledge-boundary (41). maximum trust → oracle (44). architecture redesign → architect (51) + genesis (57). analytical blindspots → blindspot (52) + significance (60). counterfactual exploration → counterfactual (54) + history (58). emergent behavior → emergence (55) + evolution (21). conservation law validation → falsify (56) + significance (60). knowledge prerequisites → prereq (59) + verify-claims (61).
- Always apply at least two lenses. A single portfolio lens should use the structural-analysis skill instead.
- l12-universal (18) is Sonnet-only — Haiku fails below this compression floor. Only recommend when using Sonnet or Opus.
- When target_type is 'general', prefer neutral variants: error-resilience-neutral (24), api-surface-neutral (25), evolution-neutral (26). Do not use code-specific behavioral lenses on general targets.

### 2. Load Lenses

- Load each selected lens resource from the prism workflow by index. Original: pedagogy=06, claim=07, scarcity=08, rejected-paths=09, degradation=10, contract=11. SDL: deep-scan=12, sdl-trust=13, sdl-coupling=14, sdl-abstraction=15, fix-cascade=16, identity=17, l12-universal=18, sdl-simulation=36. Behavioral: error-resilience=19, optimize=20, evolution=21, api-surface=22. Neutral: error-resilience-neutral=24, api-surface-neutral=25, evolution-neutral=26. Compressed: error-resilience-compact=27, error-resilience-70w=28. Hybrid: evidence-cost=29, reachability=30, fidelity=31, state-audit=32. Analysis: archaeology=33, audit-code=34, cultivation=35, security=37, simulation=38, testability=39. Knowledge: knowledge-audit=40, knowledge-boundary=41, knowledge-typed=42, l12g=43, oracle=44. Generative: arc-code=50, architect=51, codegen=53, genesis=57. Meta: blindspot=52, falsify=56, significance=60. Counterfactual: counterfactual=54, history=58. Emergent: emergence=55. Task: prereq=59, verify-claims=61.

### 3. Read Target

- If artifact-content is a file path, read the file to obtain the content

### 4. Execute Lenses

- Apply each lens independently to the same artifact content
- Execute each lens completely — do not abbreviate the operations
- Keep outputs separate and clearly labelled by lens name

### 5. Write Artifacts

- Write each lens output to {output-path}/portfolio-{lens-name}.md (e.g., portfolio-claim.md, portfolio-degradation.md)
- Record all artifact paths in portfolio_output_paths
- Every lens output and the synthesis MUST be written as separate artifacts. In-memory-only output is not acceptable.

### 6. Cross Lens Synthesis

- After all lenses complete, identify where findings converge (same structural property found via different operations)
- Identify where findings diverge (each lens found a different property — this is expected and is the value of portfolio analysis)
- Produce a summary table: finding, which lens(es) found it, convergent or unique
- Write the synthesis to {output-path}/portfolio-synthesis.md

## Outputs

### per-lens-artifacts

Individual analysis artifact per lens

- **artifact**: `portfolio-{lens-name}.md`
- **per_lens_findings**: Complete findings from each lens, labelled by lens name
- **artifact_paths**: File paths to each per-lens artifact

### portfolio-synthesis

Cross-lens convergence/divergence synthesis

- **artifact**: `portfolio-synthesis.md`
- **convergent_findings**: Structural properties found by multiple lenses (high confidence)
- **unique_findings**: Properties found by only one lens (the value-add of portfolio analysis)
- **summary_table**: All findings with lens attribution and convergent/unique classification

## Rules

### independence

Each lens must be applied independently. Do not let findings from one lens influence the execution of another — independence is what produces non-overlapping findings.

### code-only-lenses

The following lenses are code-specific — do not apply to non-code input: contract (11), SDL lenses except sdl-abstraction (12-14, 16-17), behavioral lenses (19-22), hybrid/specialized (29-32), arc-code (50), codegen (53), emergence (55), history (58), verify-claims (61). sdl-abstraction (15) works on both code and reasoning.

### model-sensitivity

Behavioral lenses (19-22) produce higher quality on Sonnet (+0.5-1.3 over Haiku). SDL and structural lenses are model-independent.

### complete-execution

Each lens prompt must be executed fully. Abbreviating a lens defeats its purpose — the analytical depth comes from following the full operation chain.

## Errors

### single_lens_selected

**Cause:** Only one portfolio lens was requested

**Recovery:** Use the structural-analysis skill for single-lens analysis, or add a complementary lens per the selection guide

### lens_not_found

**Cause:** A requested lens name does not map to a known resource

**Recovery:** Valid lens names include: pedagogy (06), claim (07), scarcity (08), rejected-paths (09), degradation (10), contract (11), deep-scan (12), sdl-trust (13), sdl-coupling (14), sdl-abstraction (15), fix-cascade (16), identity (17), l12-universal (18), error-resilience (19), optimize (20), evolution (21), api-surface (22), error-resilience-neutral (24), api-surface-neutral (25), evolution-neutral (26), error-resilience-compact (27), error-resilience-70w (28), evidence-cost (29), reachability (30), fidelity (31), state-audit (32), archaeology (33), audit-code (34), cultivation (35), sdl-simulation (36), security-v1 (37), simulation (38), testability-v1 (39), knowledge-audit (40), knowledge-boundary (41), knowledge-typed (42), l12g (43), oracle (44), arc-code (50), architect (51), blindspot (52), codegen (53), counterfactual (54), emergence (55), falsify (56), genesis (57), history (58), prereq (59), significance (60), verify-claims (61).

### write_failed

**Cause:** Could not write artifact to the output path

**Recovery:** Verify the output-path directory exists and is writable

## Resources

- [writer](../../resources/writer/SKILL.md)
- [strategist](../../resources/strategist/SKILL.md)
