# Prism Resources

> Part of the [Structural Analysis Prism Workflow](../README.md)

The prism workflow includes 61 resources organized into sixteen families: 58 analytical lenses and 3 pipeline-orchestration prompts. All resources are accessible cross-workflow via `get_resource("prism", index)`.

Each lens is a short imperative prompt (60–400 words) that encodes a specific sequence of analytical operations. The model executes these operations as a program — the lens determines *what kind* of analysis is performed, not how intelligent the analysis is.

---

## L12 Pipeline (3-pass Full Prism)

The L12 pipeline runs three sequential passes with context isolation between each. Works for **all target types** (code and general).

| Index | Resource | Words | Key Question | Purpose |
|-------|----------|-------|-------------|---------|
| `00` | [L12](00-l12.md) | ~330 | "What code IS" | Conservation law + meta-law + classified bug table |
| `01` | [L12 Complement Adversarial](01-l12-complement-adversarial.md) | ~150 | — | Challenge structural findings: wrong predictions, overclaims, underclaims |
| `02` | [L12 Synthesis](02-l12-synthesis.md) | ~130 | — | Reconcile structural + adversarial into corrected conservation law |

**Pass dependency chain:** `00` (standalone) → `01` (requires output of `00`) → `02` (requires output of both `00` and `01`)

> **Note:** Resources 03-05 (general L12 variants) have been removed — the code L12 lenses work for all target types.

---

## Portfolio Lenses (single-pass, independent)

Six standalone lenses that each activate a distinct analytical operation. Zero overlap across 5 lenses on 3+ real codebases.

| Index | Resource | Words | Key Question | Best For |
|-------|----------|-------|-------------|----------|
| `06` | [Pedagogy](06-pedagogy.md) | ~75 | "What patterns transfer?" | Understanding why patterns were adopted and where they silently break |
| `07` | [Claim](07-claim.md) | ~80 | "What assumptions hide?" | Exposing hidden assumptions about timing, causality, resources |
| `08` | [Scarcity](08-scarcity.md) | ~60 | "What runs out?" | Discovering what the design assumes will never be exhausted |
| `09` | [Rejected Paths](09-rejected-paths.md) | ~65 | "What was given up?" | Revealing design trade-offs and the problems they swap |
| `10` | [Degradation](10-degradation.md) | ~65 | "What decays?" | Assessing maintainability and time-dependent risk |
| `11` | [Contract](11-contract.md) | ~80 | "What promises break?" | Finding interface violations and caller mistakes (code-only) |

---

## Structural SDL Family

Single-pass lenses targeting specific architectural concerns. 3 concrete steps each, always single-shot on all models. Model-independent quality (Haiku ≈ Sonnet ≈ Opus at ~9.0).

| Index | Resource | Words | Key Question | Target Type |
|-------|----------|-------|-------------|-------------|
| `12` | [Deep Scan (SDL-1)](12-deep-scan.md) | ~180 | "What structure HIDES" | code |
| `13` | [Trust Topology (SDL-2)](13-sdl-trust.md) | ~190 | "Where AUTHORITY inverts" | code |
| `14` | [Coupling Clock (SDL-3)](14-sdl-coupling.md) | ~200 | "When ORDER matters" | code |
| `15` | [Abstraction Leak (SDL-4)](15-sdl-abstraction.md) | ~195 | "What LEAKS across layers" | code + general |
| `16` | [Fix-Cascade (SDL-REC)](16-fix-cascade.md) | ~175 | "What FIXES hide" | code |
| `17` | [Identity (SDL-5)](17-identity.md) | ~180 | "What code CLAIMS vs reality" | code |
| `18` | [L12-Universal](18-l12-universal.md) | ~73 | "What code IS" (compressed) | code + general (**Sonnet-only**) |

> **Model note:** Deep Scan (12) and Fix-Cascade (16) produce best results on Opus. L12-Universal (18) requires Sonnet minimum — Haiku fails below this compression floor.

---

## Behavioral Pipeline

Four independent lenses + one synthesis lens forming the behavioral pipeline. Each asks a different question about code behavior. **Code-only** (no optimize_neutral variant exists).

| Index | Resource | Words | Role Label | Key Question |
|-------|----------|-------|-----------|-------------|
| `19` | [Error Resilience (V11)](19-error-resilience.md) | ~165 | ERRORS | "How code BREAKS" |
| `20` | [Optimize (V14)](20-optimize.md) | ~120 | COSTS | "What code COSTS" |
| `21` | [Evolution (V10)](21-evolution.md) | ~130 | CHANGES | "How code CHANGES" |
| `22` | [API Surface (V3)](22-api-surface.md) | ~130 | PROMISES | "What code PROMISES vs does" |
| `23` | [Behavioral Synthesis](23-behavioral-synthesis.md) | ~150 | SYNTHESIS | Convergence + blind spots + unified law |

**Pipeline structure:**
```
19 (ERRORS) ──┐
20 (COSTS)  ──┤  (parallel, independent)
21 (CHANGES)──┤
22 (PROMISES)─┘
               │
               ▼
         23 (SYNTHESIS) → reads all 4 labeled outputs
```

> **Model note:** Behavioral lenses favor Sonnet (+0.5-1.3 over Haiku). Haiku quality: 8.5-9.0. Sonnet quality: 9.0-9.5.

Individual behavioral lenses (19-22) are also portfolio-eligible for single-concern analysis.

---

## Domain-Neutral Variants

Domain-neutral rewrites of behavioral lenses for non-code targets. Quality is ~0.5-1.0 lower than code-specific versions on code targets — always prefer code-specific variants when `target_type == "code"`.

| Index | Resource | Words | Code-Specific Equivalent | Quality Gap |
|-------|----------|-------|-------------------------|-------------|
| `24` | [Error Resilience Neutral](24-error-resilience-neutral.md) | ~175 | 19 (error-resilience) | -0.5 to -1.0 |
| `25` | [API Surface Neutral](25-api-surface-neutral.md) | ~155 | 22 (api-surface) | -0.7 to -1.0 |
| `26` | [Evolution Neutral](26-evolution-neutral.md) | ~165 | 21 (evolution) | -0.5 to -0.7 (weakest) |

> **No optimize_neutral** exists — optimize (20) uses strongly code-oriented vocabulary. For general performance analysis, use scarcity (08) instead.

---

## Compressed Variants

Shorter versions of error-resilience for model optimization. Use when Haiku needs to stay single-shot on shorter prompts.

| Index | Resource | Words | Full-Length Equivalent |
|-------|----------|-------|-----------------------|
| `27` | [Error Resilience Compact](27-error-resilience-compact.md) | ~100 | 19 (error-resilience, ~165w) |
| `28` | [Error Resilience 70w](28-error-resilience-70w.md) | ~70 | 19 (error-resilience, ~165w) |

---

## Hybrid / Specialized

Standalone lenses for specific analytical concerns. All are code-only and portfolio-eligible.

| Index | Resource | Words | Key Question | Notes |
|-------|----------|-------|-------------|-------|
| `29` | [Evidence Cost](29-evidence-cost.md) | ~160 | "What validation costs?" | Hybrid of error-resilience × optimize |
| `30` | [Reachability](30-reachability.md) | ~160 | "What code is dead?" | Dead code, unreachable paths |
| `31` | [Fidelity (SDL-9)](31-fidelity.md) | ~215 | "What documentation lies?" | Doc-code drift, stale comments |
| `32` | [State Audit](32-state-audit.md) | ~205 | "What state breaks?" | State machine violations |

---

## Analysis

Lenses for structural deep-dives into specific concerns: temporal behavior, code archaeology, change resilience, security, and testability.

| Index | Resource | Words | Key Question | Model | Target Type |
|-------|----------|-------|-------------|-------|-------------|
| `33` | [Archaeology](33-archaeology.md) | ~175 | "What's foundational vs sediment?" | Sonnet (9.0+) | code |
| `34` | [Audit-Code](34-audit-code.md) | ~200 | "Where are registration gaps?" | Haiku (9.0) | code |
| `35` | [Cultivation](35-cultivation.md) | ~190 | "What resists change?" | Sonnet (9.0+) | code |
| `36` | [SDL-Simulation](36-sdl-simulation.md) | ~155 | "What breaks under maintenance?" | Haiku (8.5-9.0) | code |
| `37` | [Security V1](37-security-v1.md) | ~130 | "Where are exploit chains?" | Haiku (8.5) | code |
| `38` | [Simulation](38-simulation.md) | ~170 | "What calcifies over time?" | Sonnet (9.0+) | code |
| `39` | [Testability V1](39-testability-v1.md) | ~130 | "What can't be tested in isolation?" | Haiku (8.0) | code |

> **SDL-Simulation (36) vs Simulation (38):** SDL-Simulation is a 3-step Haiku-optimized compression of the full Simulation prism. Use SDL-Simulation for quick temporal fragility scans; use Simulation for deeper 5-cycle temporal analysis.

---

## Knowledge / Epistemic

Lenses for assessing the reliability and verifiability of analytical claims. Particularly valuable when AI-generated analysis may confabulate.

| Index | Resource | Words | Key Question | Model | Target Type |
|-------|----------|-------|-------------|-------|-------------|
| `40` | [Knowledge-Audit](40-knowledge-audit.md) | ~180 | "What claims are confabulated?" | Sonnet | any |
| `41` | [Knowledge-Boundary](41-knowledge-boundary.md) | ~200 | "Where does analysis depend on unverifiable facts?" | Sonnet | any |
| `42` | [Knowledge-Typed](42-knowledge-typed.md) | ~160 | "What is each claim's epistemic type?" | Sonnet | any |
| `43` | [L12-G](43-l12g.md) | ~350 | "L12 with zero confabulation" | Sonnet | code |
| `44` | [Oracle](44-oracle.md) | ~400 | "Maximum-trust 5-phase analysis" | Sonnet | any |

**Epistemic pipeline:** Use `40` + `41` together for post-hoc verification of any analysis. Use `43` (L12-G) for single-pass self-correcting analysis. Use `44` (Oracle) when epistemic integrity is the top priority.

> **L12-G (43) vs Oracle (44):** L12-G adds self-auditing to L12 at minimal cost. Oracle goes further with full epistemic typing, reflexive self-diagnosis (L13), and retraction tracking — highest integrity, highest cost.

---

## Writer Pipeline

3-pass pipeline for rewriting documentation. Follows the same isolation model as Full Prism: write in isolation, critique in isolation, synthesize with both inputs.

| Index | Resource | Words | Role | Model |
|-------|----------|-------|------|-------|
| `45` | [Writer](45-writer.md) | ~400 | Generate rewrite | Sonnet (8.9) |
| `46` | [Writer-Critique](46-writer-critique.md) | ~130 | Critique the rewrite | Opus (8.9) |
| `47` | [Writer-Synthesis](47-writer-synthesis.md) | ~200 | Synthesize final version | Opus (8.9) |

**Pipeline structure:** `45` (standalone) → `46` (requires output of `45` + original) → `47` (requires original + `45` output + `46` output)

---

## Meta

| Index | Resource | Words | Key Question | Model | Target Type |
|-------|----------|-------|-------------|-------|-------------|
| `48` | [Strategist](48-strategist.md) | ~300 | "What's the optimal analysis strategy?" | Sonnet | any |

The strategist is a meta-agent that knows all prism capabilities and plans the optimal strategy to achieve any analytical goal. It selects modes, prisms, pipelines, and ordering.

---

## Generative

Lenses that produce design alternatives and creative output rather than diagnostic findings.

| Index | Resource | Words | Key Question | Model | Target Type |
|-------|----------|-------|-------------|-------|-------------|
| `50` | [Arc Code](50-arc-code.md) | ~130 | "How to solve grid transformations?" | Haiku | spatial (ARC) |
| `51` | [Architect](51-architect.md) | ~230 | "What alternative architectures exist?" | Sonnet | code |
| `53` | [Codegen](53-codegen.md) | ~130 | "Interface-first implementation" | Sonnet | code |
| `57` | [Genesis](57-genesis.md) | ~190 | "What system would break the conservation law?" | Sonnet | code + general |

> **Arc-Code (50)** is domain-specific — for ARC grid puzzle solving with Python code output. **Codegen (53)** is a code-generation prism, not an analytical lens.

---

## Meta / Epistemic

Lenses that analyze the analytical framework itself or test the validity of structural findings.

| Index | Resource | Words | Key Question | Model | Target Type |
|-------|----------|-------|-------------|-------|-------------|
| `52` | [Blindspot](52-blindspot.md) | ~195 | "What does the catalog miss?" | Sonnet | any |
| `56` | [Falsify](56-falsify.md) | ~210 | "Is this conservation law genuine?" | Sonnet | any |
| `60` | [Significance](60-significance.md) | ~180 | "Do these findings matter?" | Sonnet | any |

> Run **Blindspot (52)** periodically on the catalog itself. Run **Falsify (56)** after any scan that produces a conservation law. Run **Significance (60)** to rank findings by actionability.

---

## Counterfactual / Historical

Lenses exploring design decisions and their alternatives through structural evidence.

| Index | Resource | Words | Key Question | Model | Target Type |
|-------|----------|-------|-------------|-------|-------------|
| `54` | [Counterfactual](54-counterfactual.md) | ~200 | "What if the opposite choice was made?" | Sonnet | code |
| `58` | [History](58-history.md) | ~200 | "Why does the code look this way?" | Sonnet | code |

---

## Emergent

| Index | Resource | Words | Key Question | Model | Target Type |
|-------|----------|-------|-------------|-------|-------------|
| `55` | [Emergence](55-emergence.md) | ~195 | "What arises from interactions, not components?" | Sonnet | code |

---

## Task / Verification

Lenses for pre-analysis preparation and post-analysis claim verification.

| Index | Resource | Words | Key Question | Model | Target Type |
|-------|----------|-------|-------------|-------|-------------|
| `59` | [Prereq](59-prereq.md) | ~150 | "What knowledge is needed before starting?" | Sonnet | any |
| `61` | [Verify Claims](61-verify-claims.md) | ~150 | "Which claims are testable?" | Sonnet | code |

> Run **Prereq (59)** before analysis to ground the model. Run **Verify Claims (61)** after analysis to extract testable behavioral claims.

---

## Pipeline Prompts

Internal prompts used by the new pipeline modes to orchestrate multi-prism compositions. Not analytical lenses — these coordinate how lenses are combined.

| Index | Resource | Purpose | Used By |
|-------|----------|---------|---------|
| `62` | [Dispute Synthesis](62-dispute-synthesis.md) | Synthesize disagreements between 2 orthogonal prisms | dispute mode |
| `63` | [Subsystem Calibration](63-subsystem-calibration.md) | Assign optimal prism per code subsystem | subsystem mode |
| `64` | [Subsystem Synthesis](64-subsystem-synthesis.md) | Cross-subsystem findings, inter-region bugs, file-level conservation law | subsystem mode |

---

## Recommended Combinations

| Analytical Goal | Lenses | Why |
|-----------------|--------|-----|
| Bug detection (single) | `00` (L12) | Highest-impact single lens |
| Maximum depth | `00` + `01` + `02` (Full Prism) | Self-correcting 3-pass analysis |
| Comprehensive behavioral | `19-23` (Behavioral pipeline) | 4-dimensional behavioral analysis + synthesis |
| Trade-off analysis | `08` (scarcity) + `09` (rejected-paths) | Scarcity finds what's assumed infinite; rejected-paths finds what was given up |
| Architecture review | `12` (deep-scan) + `15` (sdl-abstraction) | Conservation laws + abstraction leak detection |
| Trust/security | `13` (sdl-trust) + `37` (security-v1) | Authority inversions + exploit chains |
| API quality | `22` (api-surface) + `17` (identity) | Promise-reality gap + identity displacement |
| Coupling analysis | `14` (sdl-coupling) + `21` (evolution) | Temporal coupling + invisible handshakes |
| Maintainability | `10` (degradation) + `11` (contract) | Time-dependent decay + interface drift |
| Hidden assumptions | `07` (claim) + `06` (pedagogy) | Assumption inversion + transferred patterns |
| Code archaeology | `33` (archaeology) + `38` (simulation) | Structural layers + temporal calcification |
| Change resilience | `35` (cultivation) + `21` (evolution) | Perturbation-response + invisible handshakes |
| Testability audit | `39` (testability-v1) + `16` (fix-cascade) | Isolation cost + what fixes hide |
| Registration gaps | `34` (audit-code) | Self-consistency across declaration surfaces |
| Verified analysis | `40` (knowledge-audit) + `41` (knowledge-boundary) | Confabulation detection + knowledge gap classification |
| Maximum trust | `44` (oracle) | 5-phase self-aware analysis with epistemic typing |
| Architecture redesign | `51` (architect) + `57` (genesis) | Alternative architectures + conservation law breaking |
| Analytical blind spots | `52` (blindspot) + `60` (significance) | Catalog gaps + impact ranking |
| Counterfactual analysis | `54` (counterfactual) + `58` (history) | Alternative decisions + decision fossils |
| Emergent behavior | `55` (emergence) + `21` (evolution) | Interaction emergence + coupling analysis |
| Conservation law validation | `56` (falsify) + `60` (significance) | Falsification + impact assessment |
| Knowledge-grounded analysis | `59` (prereq) + `61` (verify-claims) | Prerequisites before, verification after |

---

## Cross-Workflow Access

Any workflow can load prism resources without depending on the prism workflow's activities or orchestration:

```
get_resource({ workflow_id: "prism", index: "00" })   # L12
get_resource({ workflow_id: "prism", index: "12" })   # Deep Scan
get_resource({ workflow_id: "prism", index: "19" })   # Error Resilience
get_resource({ workflow_id: "prism", index: "33" })   # Archaeology
get_resource({ workflow_id: "prism", index: "44" })   # Oracle
```

---

## Metadata

Resources include YAML front matter with calibration metadata. Common fields: `name`, `description`, `quality_baseline`, `optimal_model`, `calibration_date`, `model_versions`, `origin`, and `notes`. Original resources (00-02, 06-11) include enriched front matter with `calibration_date` and `model_versions`.

## Provenance

All lenses are derived from the [agi-in-md](https://github.com/Cranot/agi-in-md) research project. Content is identical to the upstream source — the resources are copies with standardized naming for the workflow server's `{NN}-{name}.md` convention.
