# Prism Resources

> Part of the [Structural Analysis Prism Workflow](../README.md)

The prism workflow includes 30 lens resources organized into seven families. All resources are accessible cross-workflow via `get_resource("prism", index)`.

Each lens is a short imperative prompt (60–330 words) that encodes a specific sequence of analytical operations. The model executes these operations as a program — the lens determines *what kind* of analysis is performed, not how intelligent the analysis is.

---

## L12 Pipeline (3-pass Full Prism)

The L12 pipeline runs three sequential passes with context isolation between each. Works for **all target types** (code and general).

| Index | Resource | Words | Key Question | Purpose |
|-------|----------|-------|-------------|---------|
| `00` | [L12 Structural](00-l12-structural.md) | ~330 | "What code IS" | Conservation law + meta-law + classified bug table |
| `01` | [L12 Adversarial](01-l12-adversarial.md) | ~150 | — | Challenge structural findings: wrong predictions, overclaims, underclaims |
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
| `16` | [Recursive Entailment (REC)](16-rec.md) | ~175 | "What FIXES hide" | code |
| `17` | [Identity Displacement (SDL-5)](17-ident.md) | ~180 | "What code CLAIMS vs reality" | code |
| `18` | [73w](18-73w.md) | ~73 | "What code IS" (compressed) | code + general (**Sonnet-only**) |

> **Model note:** Deep Scan (12) and Rec (16) produce best results on Opus. 73w (18) requires Sonnet minimum — Haiku fails below this compression floor.

---

## Behavioral Pipeline

Four independent lenses + one synthesis lens forming the behavioral pipeline. Each asks a different question about code behavior. **Code-only** (no optim_neutral variant exists).

| Index | Resource | Words | Role Label | Key Question |
|-------|----------|-------|-----------|-------------|
| `19` | [Error Resilience (V11)](19-error-resilience.md) | ~165 | ERRORS | "How code BREAKS" |
| `20` | [Optimization (V14)](20-optim.md) | ~120 | COSTS | "What code COSTS" |
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

> **No optim_neutral** exists — optim (20) uses strongly code-oriented vocabulary. For general performance analysis, use scarcity (08) instead.

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
| `29` | [Evidence Cost](29-evidence-cost.md) | ~160 | "What validation costs?" | Hybrid of error_resilience × optim |
| `30` | [Reachability](30-reachability.md) | ~160 | "What code is dead?" | Dead code, unreachable paths |
| `31` | [Fidelity (SDL-9)](31-fidelity.md) | ~215 | "What documentation lies?" | Doc-code drift, stale comments |
| `32` | [State Audit](32-state-audit.md) | ~205 | "What state breaks?" | State machine violations |

---

## Recommended Combinations

| Analytical Goal | Lenses | Why |
|-----------------|--------|-----|
| Bug detection (single) | `00` (L12) | Highest-impact single lens |
| Maximum depth | `00` + `01` + `02` (Full Prism) | Self-correcting 3-pass analysis |
| Comprehensive behavioral | `19-23` (Behavioral pipeline) | 4-dimensional behavioral analysis + synthesis |
| Trade-off analysis | `08` (scarcity) + `09` (rejected-paths) | Scarcity finds what's assumed infinite; rejected-paths finds what was given up |
| Architecture review | `12` (deep-scan) + `15` (sdl-abstraction) | Conservation laws + abstraction leak detection |
| Trust/security | `13` (sdl-trust) + `19` (error-resilience) | Authority inversions + error information destruction |
| API quality | `22` (api-surface) + `17` (ident) | Promise-reality gap + identity displacement |
| Coupling analysis | `14` (sdl-coupling) + `21` (evolution) | Temporal coupling + invisible handshakes |
| Maintainability | `10` (degradation) + `11` (contract) | Time-dependent decay + interface drift |
| Hidden assumptions | `07` (claim) + `06` (pedagogy) | Assumption inversion + transferred patterns |

---

## Cross-Workflow Access

Any workflow can load prism resources without depending on the prism workflow's activities or orchestration:

```
get_resource({ workflow_id: "prism", index: "00" })   # L12 structural
get_resource({ workflow_id: "prism", index: "12" })   # Deep Scan
get_resource({ workflow_id: "prism", index: "19" })   # Error Resilience
```

---

## Metadata

New resources (12-32) include YAML front matter with calibration metadata: `calibration_date`, `model_versions`, `quality_baseline`, `origin`, and `notes`. Original resources (00-02, 06-11) do not include front matter.

## Provenance

All lenses are derived from the [agi-in-md](https://github.com/Cranot/agi-in-md) research project. Content is identical to the upstream source — the resources are copies with standardized naming for the workflow server's `{NN}-{name}.md` convention.
