# Structural Analysis — Prism Workflow Changes

> **Date**: 2026-03-13
> **Work Package**: #53 — Import New Prism Families
> **Method**: Conceptual L12 structural analysis applied to workflow definition changes

## Falsifiable Claim

The deepest structural problem in this change set is that the **behavioral pipeline mode is architecturally coupled to a specific lens composition** (error_resilience + optim + evolution + api_surface → behavioral_synthesis) in a system whose other modes are composition-agnostic. The L12 pipeline uses whatever is at indices 00-02. Portfolio uses whatever lenses are selected. But behavioral hardcodes a specific 4+1 composition with fixed label mapping.

## Concealment Mechanism

The hardcoded label mapping (ERRORS→19, COSTS→20, CHANGES→21, PROMISES→22) is distributed across three files: the behavioral-pipeline skill (rules.label-mapping), the behavioral-synthesis-pass activity (rules), and the behavioral_synthesis resource itself (prompt text). This distribution conceals a single design decision behind three separate definitions, making it appear as three independent concerns when it is one.

## Conservation Law

**Flexibility × Coupling = constant across pipeline modes.**

- L12 pipeline: maximum flexibility (any 3 lenses at 00-02), maximum coupling to the 3-pass sequential structure
- Portfolio: maximum flexibility (any N lenses), zero coupling between lenses
- Behavioral: zero flexibility (fixed 4+1 composition), maximum coupling between lens identity and synthesis expectations

Adding flexibility to the behavioral pipeline (e.g., configurable lens composition) would require the synthesis lens to become generic — losing the specific analytical operations that reference "invisible handshakes" and "naming lies."

## Meta-Law

The conservation law itself conceals that **the behavioral pipeline's coupling is its value**. The synthesis lens produces convergence findings precisely because it knows the four analytical dimensions. A generic "synthesize N outputs" lens would produce weaker convergence. The coupling is a feature, not a limitation.

## Classified Findings

| Finding | Location | Severity | Fixable/Structural |
|---------|----------|----------|-------------------|
| Label mapping distributed across 3 files | behavioral-pipeline.toon, behavioral-synthesis-pass.toon, behavioral_synthesis.md | Low | Structural — distributed by design (skill defines contract, activity enforces, resource consumes) |
| Behavioral pipeline composition mismatch with prism.py | behavioral-pipeline.toon vs prism.py line 5173 | Medium | Fixable — documented in A-025, user confirmed behavioral_synthesis.md composition |
| No budget-driven path to behavioral mode | plan-analysis.toon lines 57-60 | Low | Structural — behavioral is goal-specific, not budget-driven |
| Front matter inconsistency between old and new resources | resources/ 00-11 vs 12-32 | Low | Fixable but out of scope (A-024) |
