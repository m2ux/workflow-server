# Prism Analysis Workflow

> v2.0.0 — Structured analytical prompts that find what asking a model directly misses. Ten modes, 58 lenses, isolated multi-pass pipelines, automated report generation.

---

## Overview

[Prisms](https://github.com/m2ux/workflow-server/blob/workflows/prism/resources/README.md) are succinct structured prompts (70–330 words) that force an LLM through a specific sequence of analytical operations — each one targeting a class of problem that free-form analysis reliably misses. The results are qualitatively different: conservation laws instead of style suggestions, quantified bug tables instead of vague warnings.

**Why use this workflow instead of prompting directly?**

- **Depth.** Each prism encodes a multi-step reasoning chain validated across hundreds of experiments (representing \$\$\$\$ in compute). The L12 prism, for example, forces the model through:
```claim → dialectic → concealment → improvement → invariant → inversion → conservation law → meta-law``` — producing findings that a single prompt never reaches.
- **Independence.** The full-prism pipeline runs three passes in separate context windows. The adversarial pass has never seen the structural analysis being generated — it receives only the final text. This prevents the model from defending its own prior output, producing genuine self-correction.
- **Breadth.** Portfolio mode runs multiple lenses that each ask a fundamentally different question about the same target. Research across real codebases confirms zero overlap between lenses — each finds properties the others are structurally blind to.
- **Reproducibility.** The same prism on the same input produces consistent analytical depth regardless of how the conversation started or what else is in context.

**Use this workflow when you want to:**
- Find bugs, design flaws, or structural problems that surface-level review misses
- Get a second opinion that genuinely challenges a prior analysis (full-prism mode)
- Understand how code breaks, what it costs, how it changes, and where names lie (behavioral pipeline)
- Apply multiple complementary perspectives to the same target (portfolio mode)
- Analyze non-code artifacts — proposals, strategies, architectures — with the same rigour

## Concepts

Definitions of the analytical [concepts](./concept-lexicon.md) used within the Prism workflow (49 entries), including: [conservation law](./concept-lexicon.md#conservation-law), [meta-law](./concept-lexicon.md#meta-law), [structural invariant](./concept-lexicon.md#structural-invariant), [concealment mechanism](./concept-lexicon.md#concealment-mechanism), [code geology](./concept-lexicon.md#code-geology), [calcification](./concept-lexicon.md#calcification), [perturbation-response](./concept-lexicon.md#perturbation-response), [confabulation](./concept-lexicon.md#confabulation), [epistemic typing](./concept-lexicon.md#epistemic-typing), [exploit chain](./concept-lexicon.md#exploit-chain), and others.

---

## Prompt Guide

Each prism responds to a specific analytical question. The table below shows user prompts that reliably trigger each prism through the plan-analysis goal-mapping matrix.

| Prompt | Scope | Prism / Mode |
|--------|-------|-------------|
| `Analyze src/parser.ts` | file | L12 structural (00) — default for any code target |
| `Pre-commit review of src/handler.rs` | file | L12 full pipeline (00→01→02) |
| `Analyze this proposal using the full prism` | text | L12 full pipeline on general input |
| `What patterns from this design would transfer poorly to other problems?` | any | Pedagogy (06) |
| `What hidden assumptions does this architecture embed?` | any | Claim (07) |
| `What resource scarcity does this system gamble on?` | any | Scarcity (08) |
| `What rejected alternatives would swap these problems for different ones?` | any | Rejected-paths (09) |
| `How does this code decay over 12 months of neglect?` | file | Degradation (10) |
| `What does each function's interface contract promise vs actually deliver?` | file | Contract (11) |
| `Find conservation laws and information laundering in this code` | file | Deep-scan (12) |
| `Where do trust boundaries collapse? Find authority inversions` | module | Trust topology (13) |
| `Find hidden temporal coupling — ordering dependencies and TOCTOU gaps` | module | Coupling clock (14) |
| `Where do implementation details leak through abstraction boundaries?` | module | Abstraction leak (15) |
| `What structural defects persist through every attempted fix?` | file | Fix-cascade (16) |
| `Where does this code claim to be something different than it is?` | file | Identity (17) |
| `Quick structural scan of src/core.ts` | file | L12-universal (18) — Sonnet only |
| `How does error context get destroyed in this module?` | module | Error resilience (19) |
| `Find hidden performance costs — what optimization data is erased at boundaries?` | file | Optimize (20) |
| `Trace invisible coupling — what data flows between functions without signatures?` | module | Evolution (21) |
| `Where do function names lie about what the code actually does?` | file | API surface (22) |
| `Run a comprehensive behavioral analysis of src/pipeline/` | module | Behavioral pipeline (19→20→21→22→23) |
| `How does this business process destroy diagnostic information?` | text | Error resilience neutral (24) |
| `Where do the labels in this proposal lie about what it delivers?` | text | API surface neutral (25) |
| `What implicit dependencies bind the components of this strategy?` | text | Evolution neutral (26) |
| `Quick error resilience scan of src/handler.ts` | file | Error resilience compact (27) — 110w |
| `Ultra-brief error resilience check` | file | Error resilience 70w (28) — 70w |
| `Where does skipped validation waste both safety and performance?` | file | Evidence cost (29) |
| `Find dead code — functions defined but never called, stale config` | module | Reachability (30) |
| `Where has documentation drifted from actual behavior?` | module | Fidelity (31) |
| `Map every piece of mutable state as a state machine — find unhandled transitions` | file | State audit (32) |
| `Dig through the structural layers — what's foundation vs accumulated sediment?` | file | Archaeology (33) |
| `Find registration gaps — features wired but undocumented, or declared but unwired` | module | Audit-code (34) |
| `Plant a new requirement and trace what resists the change` | file | Cultivation (35) |
| `What breaks when a new developer joins? What becomes cargo cult?` | file | SDL-simulation (36) |
| `Map trust entry points and trace exploit chains` | file | Security V1 (37) |
| `Run this code forward through 5 maintenance cycles — what calcifies?` | file | Simulation (38) |
| `Which functions can't be unit tested? What's the isolation cost?` | file | Testability V1 (39) |
| `Attack this analysis for confabulated knowledge claims` | text | Knowledge-audit (40) |
| `Classify every claim by knowledge dependency — structural vs contextual vs temporal` | text | Knowledge-boundary (41) |
| `Type every finding with confidence, provenance, and falsifiability` | any | Knowledge-typed (42) |
| `Self-correcting structural analysis — L12 with built-in confabulation detection` | file | L12g (43) |
| `Maximum-trust analysis — 5-phase self-aware structural analysis, zero confabulation` | file | Oracle (44) |
| `Rewrite this README as a high-converting developer landing page` | text | Writer (45) |
| `Plan the optimal analysis strategy for this goal` | any | Strategist (48) |
| `Design 3 alternative architectures with migration paths` | file | Architect (51) |
| `What does my prism catalog systematically miss?` | any | Blindspot (52) |
| `Generate an interface-first implementation with failure prediction` | file | Codegen (53) |
| `What if the opposite design choice was made?` | file | Counterfactual (54) |
| `What emergent behaviors arise from component interactions?` | file | Emergence (55) |
| `Is this conservation law genuine or generic?` | any | Falsify (56) |
| `Design a system that would NOT obey this conservation law` | any | Genesis (57) |
| `Reconstruct decision history from structural fossils` | file | History (58) |
| `What knowledge prerequisites does this task require?` | any | Prereq (59) |
| `Which findings actually matter? Rank by surprise and action distance` | any | Significance (60) |
| `Extract testable claims and generate verification commands` | file | Verify Claims (61) |
| `Security review of this module` | module | Portfolio: trust (13) + security-v1 (37) |
| `Code review of src/api.ts` | file | Portfolio: L12 (00) + contract (11) |
| `Assess maintainability of this service` | module | Portfolio: degradation (10) + contract (11) |
| `Design review of this architecture` | any | Portfolio: claim (07) + rejected-paths (09) |
| `What are the trade-offs in this approach?` | text | Portfolio: scarcity (08) + rejected-paths (09) |
| `How does this code age? Archaeology + temporal simulation` | file | Portfolio: archaeology (33) + simulation (38) |
| `Verify this analysis has no confabulated claims` | text | Portfolio: knowledge-audit (40) + knowledge-boundary (41) |

Scope: **file** = single source file, **module** = directory or module (multiple files), **text** = inline text, question, or proposal (no file target), **any** = works at all scopes.

---

## Modes

| Mode | Passes | Description |
|------|--------|-------------|
| **Single** | 1 | L12 structural lens — conservation law, meta-law, bug table |
| **Full Prism** | 3 | Structural → adversarial → synthesis (self-correcting) |
| **Portfolio** | 2+ | Multiple independent lenses for breadth (52+ available) |
| **Behavioral** | 4+1 | Error resilience + optimization + evolution + API surface → synthesis. Code-only. |
| **Dispute** | 3 | 2 orthogonal prisms + disagreement synthesis. Lightweight self-correction at 1/3 full-prism cost. |
| **Subsystem** | 2+ | AST split + per-region prism assignment + cross-subsystem synthesis. Code-only. |
| **Verified** | 3 | L12 + gap detection (boundary + audit) + re-analysis with corrections. Highest accuracy. |
| **Reflect** | 3 | L12 + meta-analysis (claim prism on L12 output) + constraint synthesis. |
| **Smart** | up to 6 | Adaptive chain: prereq + knowledge fill + analysis + dispute + profile. System decides the pipeline. |
| **Adaptive** | 1–3 | Depth escalation: SDL → L12 → full-prism. Stops at first adequate signal. |

---

## Workflow Flow

```mermaid
graph TD
    Start([Start]) --> SM["select-mode"]
    SM --> MODE{"pipeline mode?"}

    MODE -->|"dispute"| DP["dispute-pass"]
    MODE -->|"subsystem"| SUB["subsystem-pass"]
    MODE -->|"verified"| VP["verified-pass"]
    MODE -->|"reflect"| RP["reflect-pass"]
    MODE -->|"smart"| SMP["smart-pass"]
    MODE -->|"adaptive"| ADP["adaptive-pass"]
    MODE -->|"default (single / full-prism / portfolio / behavioral)"| SP["structural-pass"]

    SP --> SMODE{"pipeline mode?"}
    SMODE -->|"single / portfolio"| GR["generate-report"]
    SMODE -->|"full-prism"| AP["adversarial-pass"]
    SMODE -->|"behavioral"| BSP["behavioral-synthesis-pass"]

    AP --> SYN["synthesis-pass"]
    SYN --> GR
    BSP --> GR

    DP --> GR
    SUB --> GR
    VP --> GR
    RP --> GR
    SMP --> GR
    ADP --> GR

    GR --> DR["deliver-result"]
    DR --> Done([End])
```

---

## Activities

| # | Activity | Description |
|---|----------|-------------|
| 00 | **Plan Analysis** (`select-mode`) | Select an analysis mode for the user's request |
| 01 | **Structural Analysis Pass** | Run the assigned structural analysis for each analysis unit (single / full-prism / portfolio / behavioral) |
| 02 | **Adversarial Analysis Pass** | Run the adversarial lens against each full-prism unit's structural artifact (full-prism only) |
| 03 | **Synthesis Pass** | Run the synthesis lens against each full-prism unit's structural + adversarial artifacts (full-prism only) |
| 04 | **Deliver Result** | Present the final report to the user with artifact paths |
| 05 | **Behavioral Synthesis Pass** | Run the behavioral synthesis lens against each behavioral unit's artifacts (behavioral only) |
| 06 | **Generate Final Report** | Produce clean REPORT.md from analysis artifacts — definitive findings only, no methodology language |
| 07 | **Dispute Analysis Pass** | Run two orthogonal prisms and synthesize their disagreements (dispute only) |
| 08 | **Subsystem Analysis Pass** | Per-region prism analysis with cross-subsystem synthesis (subsystem only) |
| 09 | **Verified Analysis Pass** | L12 structural analysis with gap detection and re-analysis (verified only) |
| 10 | **Reflect Analysis Pass** | L12 structural analysis with recursive meta-analysis and constraint synthesis (reflect only) |
| 11 | **Smart Analysis Pass** | Adaptively compose the analysis pipeline based on input characteristics (smart only) |
| 12 | **Adaptive Depth Pass** | Cost-minimizing depth escalation (adaptive only) |

**Detailed documentation:** See [activities/](activities/) for per-activity TOON definitions.

---

## Techniques

Steps bind to a technique via `step.technique`; each activity also lists strategy techniques in its `techniques[]` list (`variable-binding`, plus `scatter-gather` for the forEach passes). The structural-pass `check-gitnexus` step additionally binds the shared `gitnexus-operations::verify-index` operation. Operation-group techniques expose their steps as `<group>::<op>` references; standalone techniques bind a whole step.

| Technique | Capability | Bound by |
|-----------|------------|----------|
| `plan-analysis` | Detect scope, classify targets, plan analysis strategy | select-mode (`plan` step) |
| `structural-analysis` | Single-pass L12 structural analysis | structural-pass (`run-structural` step) |
| `portfolio-analysis` | Run 2+ complementary portfolio lenses | structural-pass (`run-portfolio` step) |
| `behavioral-pipeline` | Execute 4+1 behavioral pipeline with labeled synthesis | structural-pass (`dispatch-behavioral-lenses` step), behavioral-synthesis-pass (`run-behavioral-synthesis` step) |
| `full-prism` | Execute one isolated pass of the Full Prism pipeline | adversarial-pass (`run-adversarial`), synthesis-pass (`run-synthesis`) |
| `dispute-analysis` | Run two orthogonal prisms and synthesize disagreements | dispute-pass (`run-dispute` step) |
| `subsystem-analysis::*` | Per-region prism assignment + cross-subsystem synthesis | subsystem-pass (`decompose`, `calibrate`, `execute`, `synthesize`) |
| `verified-analysis::*` | L12 + gap detection + corrected re-analysis | verified-pass (`initial-analysis`, `gap-detection`, `gap-extraction`, `corrected-analysis`) |
| `reflect-analysis` | L12 + claim-prism meta-analysis + constraint synthesis | reflect-pass (`run-reflect` step) |
| `smart-analysis::*` | Adaptively compose the analysis pipeline | smart-pass (`prereq-scan`, `knowledge-fill`, `select-mode`, `run-analysis`, `dispute-correction`) |
| `adaptive-analysis::*` | Cost-minimizing depth escalation (SDL → L12 → full-prism) | adaptive-pass (`stage-1-sdl`, `stage-2-l12`, `stage-3-full`) |
| `generate-report` | Produce clean final report from analysis artifacts | generate-report (`generate-report` step) |
| `present-result` | Read, cross-reference-format, and present the final report | deliver-result (`present-result` step) |

The four `::*` techniques are **operation-groups** — a `techniques/<group>/` directory holding a `TECHNIQUE.md` shared contract plus one `<op>.md` file per operation. The rest are standalone `techniques/<slug>.md` files.

**Detailed documentation:** See [techniques/TECHNIQUE.md](techniques/TECHNIQUE.md) for the inherited base contract; each standalone technique's `techniques/<slug>.md` file and each operation-group's `techniques/<group>/<op>.md` file documents its protocol flow.

---

## Resources (58)

Resources are indexed markdown files containing lens prompts. Each lens encodes a specific analytical operation.

| Range | Family | Count | Description |
|-------|--------|-------|-------------|
| 00–02 | L12 Pipeline | 3 | Structural, adversarial, synthesis (code and general) |
| 06–11 | Portfolio | 6 | Pedagogy, claim, scarcity, rejected-paths, degradation, contract |
| 12–18 | Structural SDL | 7 | Deep-scan, trust topology, coupling clock, abstraction leak, fix-cascade, identity, l12-universal |
| 19–23 | Behavioral Pipeline | 5 | Error resilience, optimize, evolution, API surface, behavioral synthesis |
| 24–26 | Domain-Neutral | 3 | Error resilience neutral, API surface neutral, evolution neutral |
| 27–28 | Compressed | 2 | Error resilience compact, error resilience 70w |
| 29–32 | Hybrid/Specialized | 4 | Evidence cost, reachability, fidelity, state audit |
| 33–39 | Analysis | 7 | Archaeology, audit-code, cultivation, sdl-simulation, security-v1, simulation, testability-v1 |
| 40–44 | Knowledge/Epistemic | 5 | Knowledge-audit, knowledge-boundary, knowledge-typed, l12g, oracle |
| 45–47 | Writer Pipeline | 3 | Writer, writer-critique, writer-synthesis |
| 48 | Meta | 1 | Strategist |
| 50–53 | Generative | 4 | Arc-code, architect, codegen, genesis |
| 54, 58 | Counterfactual/Historical | 2 | Counterfactual, history |
| 55 | Emergent | 1 | Emergence |
| 52, 56, 60 | Meta/Epistemic | 3 | Blindspot, falsify, significance |
| 59, 61 | Task/Verification | 2 | Prereq, verify-claims |

Indices 03–05 are deprecated (upstream general L12 variants removed). Index 49 (severity-rubric) has been removed.

**Detailed documentation:** See [resources/README.md](./resources/README.md) for the full catalog with model sensitivity, quality scores, and recommended combinations.

---

## Model Sensitivity

Prisms fall into two model-sensitivity categories:

| Category | Prisms | Guidance |
|----------|--------|----------|
| **Model-Independent** | L12, SDL family (12–15), portfolio (06–11) | Equivalent quality across Haiku, Sonnet, Opus |
| **Haiku-Optimized** | sdl-simulation (36), security-v1 (37), testability-v1 (39), audit-code (34), arc-code (50) | Designed for Haiku; works on all models |
| **Sonnet-Recommended** | Behavioral (19–22), domain-neutral (24–26), knowledge (40–42), archaeology (33), cultivation (35), simulation (38), l12g (43), oracle (44), architect (51), blindspot (52), codegen (53), counterfactual (54), emergence (55), falsify (56), genesis (57), history (58), prereq (59), significance (60), verify-claims (61) | Sonnet scores +0.5–1.3 over Haiku |
| **Opus-Preferred** | Deep-scan (12), fix-cascade (16), writer-critique (46), writer-synthesis (47) | Best results on Opus |
| **Sonnet-Only** | l12-universal (18) | Haiku fails below compression floor |

Domain-neutral variants (24–26) have a ~0.5–0.7 quality gap vs code-specific versions on code targets. Plan-analysis prefers code-specific variants when `target_type` is `code`.

---

## Orchestration Model

This workflow uses an **orchestrator with disposable workers**. Each analytical pass is dispatched to a **fresh sub-agent** (never resumed) to guarantee context isolation.

```mermaid
sequenceDiagram
    participant User
    participant Orch as Orchestrator
    participant W1 as Worker 1 (Structural)
    participant W2 as Worker 2 (Adversarial)
    participant W3 as Worker 3 (Synthesis)
    participant W4 as Worker 4 (Report)

    User->>Orch: "Analyze /path/to/code using full prism"
    Note over Orch: select-mode → full-prism

    Orch->>W1: spawn-agent(structural lens, target)
    W1-->>Orch: structural-analysis.md

    Orch->>W2: spawn-agent(adversarial lens, structural artifact)
    W2-->>Orch: adversarial-analysis.md

    Orch->>W3: spawn-agent(synthesis lens, both artifacts)
    W3-->>Orch: synthesis.md

    Orch->>W4: spawn-agent(generate report, all artifacts)
    W4-->>Orch: REPORT.md

    Orch->>User: REPORT.md + all artifact paths
```

Unlike the work-package workflow (which resumes a persistent worker), the prism workflow creates a **new worker for each pass**. This is the isolation guarantee — the adversarial worker has never seen the structural analysis being generated.

---

## Variables

| Variable | Type | Description |
|----------|------|-------------|
| `target` | string | What to analyze — a file path, directory path, inline text, question, or concept |
| `target_type` | string | `code` or `general` (default: `code`) |
| `pipeline_mode` | string | `single`, `full-prism`, `portfolio`, `behavioral`, `dispute`, `subsystem`, `verified`, `reflect`, `smart`, or `adaptive` (default: `single`) |
| `output_path` | string | Directory to write analysis artifacts (default: `.`) |
| `selected_lenses` | array | For portfolio mode: array of lens names |
| `lens_name` | string | Name of the portfolio lens whose artifact is currently being written |
| `analysis_focus` | string | Optional focus area to guide the analysis |
| `analysis_units` | array | Ordered list of analysis units (for multi-unit scopes) |
| `current_unit` | object | Current analysis unit during iteration loop |
| `structural_output_path` | string | File path to structural pass artifact for current unit |
| `adversarial_output_path` | string | File path to adversarial pass artifact for current unit |
| `synthesis_output_path` | string | File path to synthesis pass artifact for current unit |
| `portfolio_output_paths` | object | Map of lens name to file path for portfolio mode artifacts |
| `behavioral_output_paths` | object | Map of role label (ERRORS, COSTS, CHANGES, PROMISES) to file path for behavioral mode artifacts |
| `behavioral_synthesis_output_path` | string | File path to behavioral synthesis artifact for current unit |
| `all_artifact_paths` | array | Accumulated list of all artifact paths across all units |
| `report_path` | string | File path to the generated REPORT.md artifact |
| `gitnexus_available` | boolean | Whether GitNexus has indexed the target codebase — set during structural-pass check-gitnexus step (default: `false`) |
| `unit_output_dir` | string | Resolved output directory for the current analysis unit — computed in structural-pass resolve-unit-output step |
| `dispute_outputs` | object | For dispute mode: map of `{prism_a, prism_b, synthesis}` outputs |
| `subsystem_assignments` | object | For subsystem mode: map of `{subsystem_name: prism_name}` from calibration |
| `subsystem_outputs` | array | For subsystem mode: per-subsystem analysis output objects |
| `verified_gap_data` | string | For verified mode: extracted gap JSON from boundary + audit analysis |
| `reflect_history_context` | string | For reflect mode: loaded constraint history for synthesis step |
| `smart_pipeline_steps` | array | For smart mode: steps the adaptive engine decided to execute |
| `adaptive_stage` | string | For adaptive mode: current escalation stage (`sdl`, `l12`, or `full`) |
| `adaptive_signal_quality` | string | For adaptive mode: signal-quality assessment at current stage (`adequate` or `insufficient`) |

---

## File Structure

```
workflows/prism/
├── workflow.toon                            # Workflow definition (10 modes, 27 variables, 10 rules, 13 activities)
├── README.md                                # This file
├── concept-lexicon.md                       # Analytical concept definitions (49 concepts)
├── activities/
│   ├── 00-select-mode.toon                  # Plan analysis configuration
│   ├── 01-structural-pass.toon              # L12, portfolio, or behavioral lens dispatch
│   ├── 02-adversarial-pass.toon             # Adversarial lens (full-prism only)
│   ├── 03-synthesis-pass.toon               # Synthesis lens (full-prism only)
│   ├── 04-deliver-result.toon               # Present final report
│   ├── 05-behavioral-synthesis-pass.toon    # Behavioral synthesis (behavioral only)
│   ├── 06-generate-report.toon              # Generate clean REPORT.md from analysis artifacts
│   ├── 07-dispute-pass.toon                 # Two orthogonal prisms + disagreement synthesis (dispute only)
│   ├── 08-subsystem-pass.toon               # Per-region prism analysis + cross-subsystem synthesis (subsystem only)
│   ├── 09-verified-pass.toon                # L12 + gap detection + corrected re-analysis (verified only)
│   ├── 10-reflect-pass.toon                 # L12 + meta-analysis + constraint synthesis (reflect only)
│   ├── 11-smart-pass.toon                   # Adaptive pipeline composition (smart only)
│   └── 12-adaptive-pass.toon                # Depth escalation SDL → L12 → full-prism (adaptive only)
├── techniques/
│   ├── TECHNIQUE.md                         # Inherited base contract (shared by all prism techniques)
│   ├── plan-analysis.md                     # Analysis planning (58 goal mappings)
│   ├── structural-analysis.md               # Single-pass L12
│   ├── portfolio-analysis.md                # Portfolio lenses
│   ├── behavioral-pipeline.md               # Behavioral pipeline worker pass
│   ├── full-prism.md                        # Full Prism worker pass
│   ├── dispute-analysis.md                  # Dispute pipeline
│   ├── reflect-analysis.md                  # Reflect pipeline
│   ├── generate-report.md                   # Report generation from analysis artifacts
│   ├── present-result.md                    # Read, format, and present the final report
│   ├── subsystem-analysis/                  # Subsystem operation-group
│   │   ├── TECHNIQUE.md                      # Group contract
│   │   ├── decompose.md                      # AST split into subsystems
│   │   ├── calibrate.md                      # Per-region prism assignment
│   │   ├── execute.md                        # Per-subsystem analysis
│   │   └── synthesize.md                     # Cross-subsystem synthesis
│   ├── verified-analysis/                   # Verified operation-group
│   │   ├── TECHNIQUE.md                      # Group contract
│   │   ├── initial-analysis.md               # Initial L12 pass
│   │   ├── gap-detection.md                  # Boundary + audit gap analysis
│   │   ├── gap-extraction.md                 # Extract structured gap data
│   │   └── corrected-analysis.md             # Corrected re-analysis
│   ├── smart-analysis/                      # Smart operation-group
│   │   ├── TECHNIQUE.md                      # Group contract
│   │   ├── prereq-scan.md                    # Prerequisite/knowledge-gap scan
│   │   ├── knowledge-fill.md                 # Optional knowledge fill
│   │   ├── select-mode.md                    # Compose the pipeline
│   │   ├── run-analysis.md                   # Run composed analysis
│   │   └── dispute-correction.md             # Optional dispute self-correction
│   └── adaptive-analysis/                   # Adaptive operation-group
│       ├── TECHNIQUE.md                      # Group contract
│       ├── stage-1-sdl.md                    # SDL deep_scan (Haiku)
│       ├── stage-2-l12.md                    # L12 escalation (Sonnet)
│       └── stage-3-full.md                   # Full-prism escalation
└── resources/
    ├── 00–02: L12 pipeline
    ├── 06–11: Portfolio lenses
    ├── 12–18: SDL structural family
    ├── 19–23: Behavioral pipeline
    ├── 24–26: Domain-neutral variants
    ├── 27–28: Compressed variants
    ├── 29–32: Hybrid/specialized
    ├── 33–39: Analysis (archaeology, audit, cultivation, simulation, security-v1, testability-v1)
    ├── 40–44: Knowledge/epistemic (knowledge-audit, boundary, typed, l12g, oracle)
    ├── 45–47: Writer pipeline
    ├── 48: Strategist
    ├── 50–53: Generative (arc-code, architect, codegen, genesis)
    ├── 54, 58: Counterfactual/historical
    ├── 55: Emergent (emergence)
    ├── 56, 60: Meta/epistemic (falsify, significance)
    ├── 52: Meta (blindspot)
    ├── 59, 61: Task/verification (prereq, verify-claims)
    └── README.md (58 resources)
```
