---
name: lens-selection
description: Which lens answers which goal, which lenses a non-code target admits, and which model each lens is sensitive to — the reference data every technique that picks a lens reads.
metadata:
  order: 67
  type: reference
---

# Lens Selection

Three tables settle lens choice, each citable on its own.

## Goal to lens

A number in parentheses is the lens resource's `metadata.order`, which is how the resource files are addressed. A goal this table does not carry takes the single-lens default.

| Goal | Lens |
|------|------|
| Bug detection | L12 (00) or deep-scan (12) |
| Code review | L12 (00) + contract (11) |
| Design review | claim (07) + rejected-paths (09) |
| Comprehension | pedagogy (06) + rejected-paths (09) |
| Pre-commit validation | L12 pipeline (00-02) |
| Planning review | L12 (00) |
| Maintainability | degradation (10) + contract (11) |
| Assumption validation | claim (07) + scarcity (08) |
| Security review, security audit | sdl-trust (13) + security-v1 (37) |
| Strategy evaluation | claim (07) + scarcity (08) |
| Implication exploration | claim (07) + rejected-paths (09) |
| General exploration | L12 (00) |
| Error handling | error-resilience (19) |
| Performance | optimize (20) |
| API quality | api-surface (22) |
| Evolution, coupling | evolution (21) or sdl-coupling (14) |
| Trust boundaries | sdl-trust (13) |
| Abstraction quality | sdl-abstraction (15) |
| Structural defects | deep-scan (12) or fix-cascade (16) |
| Identity, naming | identity (17) |
| Dead code | reachability (30) |
| State machine | state-audit (32) |
| Contract fidelity | fidelity (31) |
| Error and cost hybrid | evidence-cost (29) |
| Comprehensive behavioral | behavioral pipeline (19-23) |
| Pattern transfer | pedagogy (06) |
| Hidden assumptions | claim (07) |
| Resource scarcity | scarcity (08) |
| Rejected alternatives | rejected-paths (09) |
| Decay, degradation | degradation (10) |
| Interface contracts | contract (11) |
| Quick structural scan | l12-universal (18) |
| Quick error resilience | error-resilience-compact (27) |
| Ultra-brief error resilience | error-resilience-70w (28) |
| Code archaeology | archaeology (33) |
| Registration gaps | audit-code (34) |
| Change resilience | cultivation (35) |
| Temporal fragility | sdl-simulation (36) or simulation (38) |
| Testability | testability-v1 (39) |
| Confabulation detection | knowledge-audit (40) |
| Knowledge gaps | knowledge-boundary (41) |
| Epistemic typing | knowledge-typed (42) |
| Self-correcting analysis | l12g (43) |
| Maximum-trust analysis | oracle (44) |
| README rewriting | writer (45) |
| Analysis strategy | strategist (48) |
| Grid, ARC puzzle solving | arc-code (50) |
| Architecture exploration | architect (51) |
| Catalog blindspots | blindspot (52) |
| Code generation | codegen (53) |
| Counterfactual analysis | counterfactual (54) |
| Interaction emergence | emergence (55) |
| Conservation law falsification | falsify (56) |
| Creative synthesis | genesis (57) |
| Decision history | history (58) |
| Knowledge prerequisites | prereq (59) |
| Significance evaluation | significance (60) |
| Claim verification | verify-claims (61) |

The critique and synthesis passes (46-47) form a cross-workflow three-pass pipeline with writer (45), and are not a prism mode of their own.

## Code and general targets

A number in parentheses is the lens resource's `metadata.order`. The L12 pipeline (00-02) works for every target type.

A **code** target admits 00-02, 06-48 and 50-61.

A **general** target — text, a query, a concept — admits 00-02, 06-10, sdl-abstraction (15), l12-universal (18), the neutral variants (24-26), archaeology (33), cultivation (35), simulation (38), the knowledge and epistemic lenses (40-44), architect (51), blindspot (52), counterfactual (54), falsify (56), genesis (57), prereq (59) and significance (60).

A **code-only** lens is never planned or assembled for a general target: contract (11), the SDL lenses other than sdl-abstraction (12-14, 16-17, 36), security-v1 (37), testability-v1 (39), the behavioral pipeline (19-23), the hybrid and specialised lenses (29-32), arc-code (50), codegen (53), emergence (55), history (58) and verify-claims (61). optimize (20) has no domain-neutral variant, so a general target wanting behavioural analysis takes the neutral variants (24-26) in portfolio mode.

## Model sensitivity

A number in parentheses is the lens resource's `metadata.order`. A recommendation naming a lens names the model it is sensitive to alongside it.

| Lens | Model |
|------|-------|
| Behavioral (19-22) | Sonnet — 0.5 to 1.3 higher than Haiku |
| Structural and SDL (00, 12-17) | Model-independent |
| l12-universal (18) | Sonnet only — Haiku fails below this compression floor |
| deep-scan (12), fix-cascade (16) | Opus |
| oracle (44), l12g (43), knowledge (40-42), archaeology (33) | Sonnet recommended |
| sdl-simulation (36), security-v1 (37), testability-v1 (39), audit-code (34), arc-code (50) | Haiku-optimised |
| architect (51), blindspot (52), counterfactual (54), emergence (55), genesis (57), history (58), significance (60), verify-claims (61), codegen (53), prereq (59) | Sonnet recommended |
| falsify (56) | Sonnet recommended, unscored |
