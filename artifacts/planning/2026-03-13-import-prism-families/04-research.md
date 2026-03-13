# Research

> **Date**: 2026-03-13
> **Work Package**: #53 — Import New Prism Families
> **Sources**: upstream agi-in-md/prism.py (primary), concept-rag knowledge base (no relevant findings), codebase analysis

## Critical Finding: Behavioral Pipeline Composition Mismatch

### The Problem

The upstream `prism.py` implementation of `_run_behavioral_pipeline` (line 5155) uses a **different set of prisms** than what `behavioral_synthesis.md` expects.

**prism.py behavioral pipeline (actual code):**
```
error_resilience → ERRORS
optim           → COSTS
rec             → ENTAILMENT
ident           → DISPLACEMENT
```

**behavioral_synthesis.md prompt (synthesis lens expectations):**
```
ERRORS:   "How does this break?" → maps to error_resilience
COSTS:    "What does this cost?" → maps to optim
CHANGES:  "How does this change?" → maps to evolution
PROMISES: "What does this promise vs do?" → maps to api_surface
```

The synthesis prompt's Step 1 explicitly references "invisible handshakes" (evolution's cognitive operation) and "naming lies" (api_surface's cognitive operation) — these don't match `rec` (recursive entailment) or `ident` (identity displacement).

### Impact on R3

Requirement R3 defined the behavioral pipeline as `error_resilience + optim + evolution + api_surface → behavioral_synthesis`. The upstream code uses `error_resilience + optim + rec + ident` with different labels. **One of these compositions must be chosen for the workflow.**

### Possible Resolutions

1. **Follow behavioral_synthesis.md** — implement `error_resilience + optim + evolution + api_surface` with labels ERRORS, COSTS, CHANGES, PROMISES. This matches the synthesis prompt's internal references and was the user's original specification.

2. **Follow prism.py** — implement `error_resilience + optim + rec + ident` with labels ERRORS, COSTS, ENTAILMENT, DISPLACEMENT. This would require updating behavioral_synthesis.md to match, or creating a new synthesis variant.

3. **Support both** — make the behavioral pipeline composition configurable. The synthesis lens becomes a parameter rather than a fixed resource.

**Recommendation**: Follow behavioral_synthesis.md (option 1). The synthesis prompt's internal language matches the evolution + api_surface cognitive operations. The prism.py code appears to have been modified after behavioral_synthesis.md was written (both general and code modes use identical prism lists, suggesting incomplete migration).

---

## Finding: Full Pipeline Architecture (9-Step)

### Discovery

The upstream `STATIC_CODE_PIPELINE` (prism.py line 141) defines a **9-step champion pipeline** for code analysis:

```
Phase 1 — Independent structural analysis (7 prisms):
  l12              → L12 STRUCTURAL
  deep_scan        → DEEP SCAN
  rec              → RECURSIVE ENTAILMENT
  ident            → IDENTITY DISPLACEMENT
  optim            → OPTIMIZATION COSTS
  error_resilience → ERROR RESILIENCE
  fidelity         → CONTRACT FIDELITY

Phase 2 — Adversarial (1 prism, receives L12 output):
  l12_complement_adversarial → ADVERSARIAL

Phase 3 — Synthesis (1 prism, receives all prior outputs):
  l12_synthesis → SYNTHESIS
```

### Impact

This is a much larger pipeline than our workflow's 3-pass L12 or the proposed 4+1 behavioral pipeline. The full pipeline combines structural AND behavioral prisms as independent Phase 1 passes, then applies L12 adversarial and synthesis to the combined output.

**Out of scope for this work package** — but relevant context for future evolution. The full pipeline pattern suggests that the ultimate design may not need separate behavioral/structural pipeline modes; instead, a configurable N-pass pipeline with pluggable prism sets and a final synthesis could serve all modes.

---

## Finding: Per-Prism Model Preferences

### Discovery

`OPTIMAL_PRISM_MODEL` (prism.py line 124) encodes per-prism model preferences:

| Prism | Optimal Model |
|-------|--------------|
| l12 | sonnet |
| deep_scan | **opus** |
| rec | **opus** |
| ident | sonnet |
| optim | sonnet |
| error_resilience | sonnet |
| fidelity | sonnet |
| l12_complement_adversarial | **opus** |
| l12_synthesis | **opus** |

### Impact on AR1

AR1 classified structural prisms as "model-independent" (Haiku ≈ Sonnet ≈ Opus). The upstream data shows a more nuanced picture:
- **deep_scan** and **rec** prefer Opus (not model-independent)
- **adversarial** and **synthesis** passes prefer Opus
- All other prisms prefer Sonnet

This is higher-fidelity model metadata than what AR1 currently captures. The workflow's plan-analysis skill should note Opus preference for deep_scan and rec alongside the behavioral model sensitivity.

---

## Finding: Upstream Dispatch Pattern

### Architecture

The upstream prism.py runs all prisms **sequentially** (not in parallel) with per-prism model switching:

1. For each step in the pipeline, the code:
   - Resolves the optimal model from `OPTIMAL_PRISM_MODEL`
   - Switches the session model to the optimal model
   - Loads the prism prompt from the `prisms/` directory
   - Runs the prism against the content (streaming API call)
   - Captures the output and restores the previous model
   - For `chain: True` steps, prepends prior outputs as context

2. Synthesis receives all prior outputs concatenated with `## ROLE` headings:
   ```
   ## L12 STRUCTURAL
   (output)
   
   ## DEEP SCAN
   (output)
   
   ## ERRORS
   (output)
   ...
   ```

### Pattern Adaptation for Workflow

The workflow's isolation model (fresh sub-agents per pass) differs from prism.py's sequential-in-process model. Key adaptations:

- **Parallel dispatch**: The workflow can dispatch independent prisms in parallel (up to 4 concurrent), which prism.py cannot. This is a workflow advantage.
- **Artifact-mediated communication**: The workflow passes outputs via filesystem artifacts, not in-memory concatenation. The orchestrator needs to construct the synthesis input by reading all prior artifacts and labeling them.
- **Model switching**: The workflow cannot switch models per-prism dynamically. Model metadata is advisory only (noted in AR1).

---

## Finding: General Mode is Incomplete

The `_run_behavioral_pipeline` method (lines 5166-5178) has **identical** prism lists for both `general=True` and `general=False`. The general mode handling appears unfinished — no domain-neutral prism variants are actually selected.

This confirms our requirement decision to make the behavioral pipeline code-only (R3) and offer individual neutral variants only in portfolio mode.

---

## Knowledge Base Research

The concept-rag knowledge base contains software engineering books (Object-Oriented Reengineering Patterns, Pattern-Oriented Software Architecture, etc.) but no content directly relevant to AI workflow orchestration, LLM lens dispatch, or cognitive prism pipeline design. These are novel domain concepts specific to the agi-in-md project.

---

## Synthesis: Connection to Requirements

| Finding | Affects | Action |
|---------|---------|--------|
| Behavioral pipeline composition mismatch | R3 | Flag for user decision: follow behavioral_synthesis.md (evolution + api_surface) or prism.py (rec + ident). Recommend behavioral_synthesis.md. |
| 9-step full pipeline | Future scope | Document as future evolution direction. No change to current requirements. |
| Per-prism model preferences | AR1 | Enrich model metadata: deep_scan and rec prefer Opus, not model-independent. |
| Sequential dispatch with model switching | R6 (orchestration) | Workflow can parallelize independent passes (advantage). Cannot switch models per-prism (limitation — advisory only). |
| General mode incomplete upstream | R3 | Confirms behavioral pipeline is code-only. No general behavioral pipeline needed. |
| Synthesis input format | R3, DD-7 | Synthesis receives labeled sections (`## ROLE\n\n{output}`). The orchestrator constructs this from artifact files. |

## Research Assumptions

| ID | Assumption | Category | Resolvability | Status |
|----|-----------|----------|---------------|--------|
| A-025 | The prism.py behavioral pipeline was modified after behavioral_synthesis.md was written (evidenced by identical general/code mode prism lists), and behavioral_synthesis.md represents the intended design | Source Relevance | stakeholder-dependent | Open |
| A-026 | The upstream OPTIMAL_PRISM_MODEL preferences (deep_scan→opus, rec→opus) are still valid for current model versions | Source Relevance | stakeholder-dependent | Open |
| A-027 | The synthesis input format (`## ROLE\n\n{output}`) from prism.py is compatible with how the workflow should construct synthesis context from artifact files | Pattern Applicability | code-analyzable | Validated |
