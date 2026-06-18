# Prism Workflow — Comprehension Artifact

> **Last updated**: 2026-06-18
> **Work packages**: [#53 Import Prism Families](../planning/2026-03-13-import-prism-families/06-work-package-plan.md)
> **Coverage**: Prism workflow architecture, pipeline modes, resource system, technique routing, activity chain, integration surface for new prism families
> **Related artifacts**: [orchestration.md](orchestration.md) (server architecture), [assumptions-log.md](../planning/2026-03-13-import-prism-families/01-assumptions-log.md)

## Architecture Overview

### Workflow Structure

The prism workflow (`workflows/prism/`, `workflow.toon` v2.0.0) orchestrates structural analysis through isolated sub-agent passes. It follows the orchestrator/worker execution model with disposable workers — each analytical pass runs in a fresh sub-agent that is never resumed, guaranteeing context isolation. The isolation invariant is codified in `rules.workflow[0]` ("Each analytical pass MUST be dispatched to a FRESH sub-agent using `harness-compat::spawn-agent`").

```
workflows/prism/
├── workflow.toon                       # 27 variables, rules.{workflow[6],activity[5]},
│                                       #   techniques.activity:[variable-binding], initialActivity: select-mode
├── activities/                         # 13 activities — one per pipeline mode's pass chain
│   ├── 00-select-mode.toon            # Plans analysis, selects pipeline mode (confirm-mode checkpoint)
│   ├── 01-structural-pass.toon        # forEach analysis_units: single/full-prism/portfolio/behavioral dispatch
│   ├── 02-adversarial-pass.toon       # Challenges structural findings (full-prism only)
│   ├── 03-synthesis-pass.toon         # Reconciles structural + adversarial (full-prism only)
│   ├── 04-deliver-result.toon         # Presents the final report to the user
│   ├── 05-behavioral-synthesis-pass.toon  # Behavioral synthesis lens over the 4 labeled outputs
│   ├── 06-generate-report.toon        # Builds REPORT.md from prior-pass artifacts (runs before deliver)
│   ├── 07-dispute-pass.toon           # 2 orthogonal prisms + disagreement synthesis
│   ├── 08-subsystem-pass.toon         # AST split + per-region prism assignment + cross-subsystem synthesis
│   ├── 09-verified-pass.toon          # L12 + gap detection (boundary+audit) + re-analysis with corrections
│   ├── 10-reflect-pass.toon           # L12 + meta-analysis + constraint synthesis
│   ├── 11-smart-pass.toon             # Adaptive chain: prereq + knowledge fill + analysis + dispute + profile
│   └── 12-adaptive-pass.toon          # Depth escalation: SDL → L12 → full-prism (stops at first adequate signal)
├── techniques/                         # worker-side techniques
│   ├── TECHNIQUE.md                    # base contract: inputs + isolation/evidence/write-discipline invariants
│   ├── plan-analysis.md                # scope detection, classification, lens selection, strategy (the "brain")
│   ├── structural-analysis.md          # single-pass L12 execution
│   ├── full-prism.md                   # worker-side adversarial/synthesis pass execution
│   ├── portfolio-analysis.md           # multi-lens independent execution
│   ├── behavioral-pipeline.md          # 4 behavioral lenses + synthesis
│   ├── generate-report.md / present-result.md / dispute-analysis.md / reflect-analysis.md
│   ├── adaptive-analysis/ smart-analysis/ subsystem-analysis/ verified-analysis/  # compound techniques (TECHNIQUE.md + stages)
│   └── (each technique is a markdown file with YAML frontmatter; compound techniques are directories)
└── resources/
    ├── <slug>.md × 58  (l12.md, pedagogy.md, deep-scan.md, error-resilience.md, oracle.md, …)
    └── README.md
```

### Activity Chain and Transitions

`select-mode` is the hub: it runs `plan-analysis`, applies the chosen `pipeline_mode`, and routes via a 7-branch transition table to the activity chain for that mode. Most chains converge on `generate-report` → `deliver-result`:

```
select-mode ──┬──→ structural-pass ──┬──→ adversarial-pass ──→ synthesis-pass ──┐
              │   (single/full-prism/   │   (full-prism only)                   │
              │    portfolio/behavioral) ├──→ behavioral-synthesis-pass ─────────┤
              │                          └──→ (default) ───────────────────────┤
              ├──→ dispute-pass ─────────────────────────────────────────────────┤
              ├──→ subsystem-pass ───────────────────────────────────────────────┤
              ├──→ verified-pass ────────────────────────────────────────────────┼─→ generate-report ──→ deliver-result
              ├──→ reflect-pass ─────────────────────────────────────────────────┤
              ├──→ smart-pass ───────────────────────────────────────────────────┤
              └──→ adaptive-pass ────────────────────────────────────────────────┘
```

- **select-mode** (`00`, v2.1.0) runs the `plan-analysis` technique (`kind: technique` step) to detect scope, classify targets, select lenses, and recommend a pipeline mode. It then sets `pipeline_mode` and `analysis_units` (`kind: action` steps) and yields a `confirm-mode` checkpoint (a `kind: checkpoint` step) with 11 options — one per mode — gated by `condition: pipeline_mode notExists`, i.e. skipped when the caller supplied a mode. The transition table routes by `pipeline_mode` to dispute / subsystem / verified / reflect / smart / adaptive passes, defaulting to `structural-pass`.
- **structural-pass** (`01`, v2.3.0) is a single `kind: loop` step (`loopType: forEach` over `analysis_units`, `maxIterations: 100`). Its nested body branches per `current_unit.pipeline_mode`: `single`/`full-prism` → `structural-analysis` technique; `portfolio` → `portfolio-analysis`; `behavioral` → `behavioral-pipeline`. A `check-gitnexus` step runs `gitnexus-operations::verify-index` and sets `gitnexus_available`. Transitions: → `adversarial-pass` (full-prism), → `behavioral-synthesis-pass` (behavioral), default → `generate-report`.
- **adversarial-pass** (`02`) iterates the same `analysis_units`, running the `full-prism` technique with `lens_name: adversarial` only for units whose `pipeline_mode == "full-prism"`; transitions to `synthesis-pass`.
- **synthesis-pass** (`03`) runs `full-prism` with `lens_name: synthesis` on full-prism units; transitions to `generate-report`.
- **behavioral-synthesis-pass** (`05`) runs `behavioral-pipeline` with `lens_name: synthesis` on behavioral units; transitions to `generate-report`.
- **generate-report** (`06`) runs the `generate-report` technique to build `REPORT.md` from the accumulated artifacts, then transitions to `deliver-result`.
- **deliver-result** (`04`, v3.1.0) runs the `present-result` technique to present the final report.

All pass activities declare `techniques[1]: ["scatter-gather"]` at the activity level (an inherited orchestration technique) and use inline `kind: loop` steps.

### Pipeline Modes

`pipeline_mode` (default `single`) selects one of eleven analysis strategies. The first four are dispatched inside `structural-pass`; the remaining seven each have a dedicated pass activity reached directly from `select-mode`.

| Mode | Passes | Activity chain | Notes |
|------|--------|----------------|-------|
| `single` | 1 | structural-pass → generate-report → deliver-result | Single L12 (or single best lens) |
| `full-prism` | 3 (sequential) | structural-pass → adversarial-pass → synthesis-pass → generate-report → deliver-result | L12 structural → adversarial → synthesis |
| `portfolio` | N (parallel within structural-pass) | structural-pass → generate-report → deliver-result | N independent lenses + inline cross-lens synthesis |
| `behavioral` | 4 + 1 | structural-pass → behavioral-synthesis-pass → generate-report → deliver-result | 4 parallel lenses (ERRORS/COSTS/CHANGES/PROMISES) + dedicated synthesis. Code-only |
| `dispute` | 3 | dispute-pass → generate-report → deliver-result | 2 orthogonal prisms + disagreement synthesis |
| `subsystem` | per-region + synthesis | subsystem-pass → generate-report → deliver-result | AST split + per-region prism assignment + cross-subsystem synthesis. Code-only |
| `verified` | L12 + gap + re-analysis | verified-pass → generate-report → deliver-result | Boundary+audit gap detection then corrected re-analysis. Highest accuracy |
| `reflect` | 3 | reflect-pass → generate-report → deliver-result | L12 + meta-analysis (claim on L12 output) + constraint synthesis |
| `smart` | adaptive chain | smart-pass → generate-report → deliver-result | prereq + knowledge fill + analysis + dispute + profile; system decides the pipeline |
| `adaptive` | escalating | adaptive-pass → generate-report → deliver-result | Depth escalation SDL → L12 → full-prism; stops at first adequate signal |

### Resource System

Resources are slug-named `<name>.md` files under `resources/` (e.g. `l12.md`, `pedagogy.md`, `error-resilience.md`). The server's resource loader (`src/loaders/resource-loader.ts:12-16`) identifies resources **by id** — the frontmatter `name:` slug, which equals the file/folder name on disk. The MCP tool is `get_resource(session_index, resource_id)` (`src/tools/resource-tools.ts:582-588`), where `resource_id` is a text slug: bare (`"l12"`) resolves within the session's workflow, cross-workflow prefixed (`"prism/l12"` from another workflow's session), each optionally suffixed with a `#section` anchor.

The lens catalog holds **58 resources across fifteen families** (see `resources/README.md` for the full table). Core families include L12 pipeline — `l12` (structural), `l12-complement-adversarial`, `l12-synthesis`; portfolio — `pedagogy`, `claim`, `scarcity`, `rejected-paths`, `degradation`, `contract`. The code L12 lenses work for all target types. Other families include Structural SDL (`deep-scan`, `sdl-trust`, `sdl-coupling`, `sdl-abstraction`, `fix-cascade`, `identity`, `l12-universal`), Behavioral (`error-resilience`, `optimize`, `evolution`, `api-surface`, `behavioral-synthesis`), domain-neutral and compressed behavioral variants, hybrid/specialized (`evidence-cost`, `reachability`, `fidelity`, `state-audit`), analysis, knowledge/epistemic (`knowledge-audit`, `oracle`, `l12g`, …), a writer pipeline, and meta lenses (`strategist`, `blindspot`, `falsify`, `significance`).

> **Numeric labels in technique prose are mnemonic, not addresses.** The `plan-analysis`, `portfolio-analysis`, and `resources/README.md` text annotate lenses with parenthetical numbers (`pedagogy (06)`, `oracle (44)`) as stable human-facing labels from the upstream agi-in-md catalog. These are *not* the resolution key — the server loads each lens by its slug id. The numbers serve as a routing-table mnemonic; the slug is the contract.

### Technique Routing

Lens selection lives in **techniques**, the worker-side construct. Each technique is a markdown file with YAML frontmatter under `techniques/`; compound techniques (`adaptive-analysis`, `smart-analysis`, `subsystem-analysis`, `verified-analysis`) are directories with a `TECHNIQUE.md` and per-stage files. `techniques/TECHNIQUE.md` is the base contract every analysis technique inherits (inputs `target_content`/`target_type`/`output_path`; rules `complete-execution`, `evidence-required`, `isolated-context`, `artifact-mediated`, `write-immediately`, `model-selection`).

**plan-analysis** (`techniques/plan-analysis.md`) is the brain of the workflow. Its protocol detects scope (query / file / module / codebase / document-set), classifies and risk-rates units, maps the analytical goal to lenses, and builds the `analysis_units` array. It carries two key lookup tables as `Rules`:

1. **goal-mapping-matrix** — maps analytical goals to lenses (slug + mnemonic number), e.g.:
   - Bug detection → l12 or deep-scan
   - Code review → l12 + contract
   - Design review → claim + rejected-paths
   - Comprehension → pedagogy + rejected-paths
   - Pre-commit → L12 pipeline (l12 + l12-complement-adversarial + l12-synthesis)
   - Maintainability → degradation + contract
   - Security review → sdl-trust + security-v1
   - Error handling → error-resilience; Performance → optimize; API quality → api-surface
   - Comprehensive behavioral → behavioral pipeline
   - …plus ~40 more goals spanning the full 58-lens catalog

2. **code-vs-general** — selects lens variants by `target_type`: the L12 pipeline works for **all** target types; code targets get the full catalog; general targets get a curated subset (portfolio lenses + sdl-abstraction + l12-universal + the neutral behavioral variants + knowledge/epistemic + a few generative/meta lenses). Contract, most SDL lenses, the behavioral pipeline, security-v1, testability-v1, codegen, emergence, history, and verify-claims are code-only.

**portfolio-analysis** (`techniques/portfolio-analysis.md`) operates on the full standalone-lens catalog (its `selected_lenses` input enumerates ~50 portfolio-eligible lenses) and carries a lens-selection guide recommending complementary pairs per goal. It enforces a minimum of two lenses — a single-lens request routes to `structural-analysis` instead.

**full-prism** (`techniques/full-prism.md`) is the worker-side adversarial/synthesis pass: it loads the lens for `lens_name` (`adversarial` → `l12-complement-adversarial`, `synthesis` → `l12-synthesis`), reads `prior_artifact_paths`, applies the lens, and (adversarial only) augments findings with GitNexus graph verification via `gitnexus-operations::{impact,context,cypher}`.

Orchestration concerns are split across the activity transition tables, the `scatter-gather` activity technique, and the per-pass techniques above.

### Isolation Model

The isolation model is the workflow's core invariant, codified in `rules.workflow` and in `techniques/TECHNIQUE.md`'s `isolated-context`/`artifact-mediated` rules. Each pass runs in a fresh sub-agent dispatched via `harness-compat::spawn-agent` (never `continue-agent` on a prior worker) to prevent context contamination. A worker receives only the textual content provided in its prompt — never the generation history of a prior pass. The adversarial pass must genuinely challenge the structural analysis without being biased by having generated it. Outputs pass between workers via filesystem artifacts addressed by path (artifact-mediated communication); the orchestrator captures each pass's text output and forwards artifact paths to subsequent passes.

## Key Abstractions

| Abstraction | Definition | Implementation |
|-------------|-----------|----------------|
| **Lens** | An imperative prompt encoding a sequence of analytical operations. The model executes these operations as a program. | Slug-named markdown file in `resources/`, loaded by id via `get_resource` |
| **Pipeline Mode** | The execution pattern for a lens or set of lenses. | `pipeline_mode` variable: one of eleven values (`single`, `full-prism`, `portfolio`, `behavioral`, `dispute`, `subsystem`, `verified`, `reflect`, `smart`, `adaptive`) |
| **Pass** | A single lens execution by an isolated sub-agent. | Fresh Task sub-agent dispatched via `harness-compat::spawn-agent` |
| **Analysis Unit** | A unit of work to analyze — a file, module, or query with assigned pipeline mode and lenses. | Object in `analysis_units` array, iterated by inline `kind: loop` (`loopType: forEach`) steps |
| **Target Type** | Whether the input is `code` or `general`, determining which lens variants to use. | `target_type` variable defaulting to `code` |
| **Conservation Law** | The structural finding that the L12 lens chain converges on — a named trade-off that cannot be eliminated, only relocated. | Section in the structural analysis artifact |
| **Portfolio** | A set of independent lenses applied to the same artifact for breadth. Each finds genuinely different structural properties. | Dispatched in parallel within structural-pass (up to 4 concurrent) |
| **Technique** | A worker-side capability (analysis pass, planning, reporting) with declared inputs and a protocol. | Markdown file (or directory for compound techniques) under `techniques/`; bound to activity steps as `kind: technique` |
| **Resource Id (slug)** | The canonical identifier of a lens — the frontmatter `name:` slug, equal to the on-disk filename. | Used in `get_resource(session_index, resource_id)` calls; the numeric `(06)`-style labels in technique prose are mnemonics, not the resolution key |

## Design Rationale

### R1: Fixed lens routing tables in techniques

**Observation**: Techniques carry static lens routing tables (e.g., `plan-analysis` maps "bug detection → l12", `portfolio-analysis` maps "pedagogy"). No dynamic discovery.

**Rationale**: Lens selection is a design decision, not a runtime discovery problem. The goal-mapping matrix encodes research-validated pairings (from the agi-in-md experiment rounds). Dynamic discovery would add complexity without improving selection quality.

**Integration implication**: Adding new lenses requires updating every technique that references the lens — entries in `plan-analysis` (goal-mapping-matrix, code-vs-general rule), `portfolio-analysis` (if portfolio-eligible), and any per-mode technique. With the catalog at 58 lenses, these tables are large; Q10 (below) tracks the maintenance-vs-routing-quality trade-off, still unresolved.

### R2: Activity chain hardcoded for 3-pass L12

**Observation**: The L12 activity chain (structural → adversarial → synthesis) is specifically designed for the L12 pipeline. `adversarial-pass` and `synthesis-pass` filter on `current_unit.pipeline_mode == "full-prism"` and are structurally coupled to the L12 lens sequence (`l12` → `l12-complement-adversarial` → `l12-synthesis`).

**Rationale**: The 3-pass L12 pipeline is the workflow's primary deep-analysis mode. The sequential dependency is inherent to the method — the adversarial pass must receive the structural output, and synthesis must receive both. Encoding this as separate activities preserves the isolation boundary (each activity dispatches to a fresh worker).

**Integration implication**: The behavioral pipeline has its own `behavioral-synthesis-pass` activity (`05`), reached from `structural-pass` when `pipeline_mode == "behavioral"`. The four independent behavioral lenses are dispatched inside `structural-pass` (alongside the portfolio branch); the dedicated synthesis is its own pass — exactly the "new activity" path R2 anticipated. The dispute, subsystem, verified, reflect, smart, and adaptive modes each likewise have a dedicated pass activity rather than a generalized variable-length chain.

### R3: Portfolio mode is inline within structural-pass

**Observation**: Portfolio mode is handled inside `structural-pass` via a conditional `kind: technique` step (`run-portfolio`, gated on `current_unit.pipeline_mode == "portfolio"`), not a separate activity chain. The portfolio worker executes multiple independent lenses and writes per-lens artifacts plus an inline cross-lens synthesis.

**Rationale**: Portfolio lenses are independent single-pass operations — no sequential dependencies. Handling them within `structural-pass` avoids creating unnecessary activities for what is essentially "run N independent analyses."

**Integration implication**: The behavioral pipeline's four independent lenses use this same "run N independent analyses" pattern — they are dispatched inside `structural-pass` (the `dispatch-behavioral-lenses` step, gated on `pipeline_mode == "behavioral"`). The key difference is that behavioral has a *mandatory* synthesis using a specialized lens (`behavioral-synthesis`) that expects four labeled inputs, so it gets a dedicated pass (`05`) rather than the inline worker-generated synthesis portfolio uses.

### R4: Target type determines lens variant

**Observation**: The `target_type` variable (`code`/`general`) selects which lenses are eligible. The L12 pipeline works for all target types; portfolio lenses largely work on both; contract and most SDL/behavioral lenses are code-only.

**Rationale**: The underlying analytical operations are identical — only the framing language differs. This dual-track approach emerged from the agi-in-md experiments which showed domain vocabulary is a mode trigger.

**Integration implication**: The behavioral pipeline has domain-neutral variants for three of four lenses (`error-resilience-neutral`, `api-surface-neutral`, `evolution-neutral`), and the behavioral pipeline as a whole is code-only (`plan-analysis` rejects `behavioral` for general targets). For non-code behavioral-style analysis, `plan-analysis`'s `neutral-variant-routing` rule recommends the individual neutral variants in portfolio mode, and points general performance analysis at `scarcity`. SDL lenses are code-specific. The partial neutral coverage R4 flagged is an explicit, documented constraint.

## Domain Concept Mapping

### Glossary — Lens Families (from agi-in-md)

> The slug column is the resource id the server resolves on (the `(NN)` mnemonic numbers used in technique prose appear in parentheses).

| Domain Term | Slug(s) | Definition | Role |
|-------------|---------|-----------|------|
| **SDL (Structural Deep-scan Lens)** | `deep-scan`, `sdl-trust`, `sdl-coupling`, `sdl-abstraction`, `fix-cascade`, `identity`, `l12-universal`, `sdl-simulation` | Single-pass lenses (~73–200w) each targeting a specific architectural concern. Always single-shot; model-independent quality (Haiku ≈ Sonnet ≈ Opus). | Portfolio-eligible standalone lenses |
| **Behavioral Pipeline** | `error-resilience`, `optimize`, `evolution`, `api-surface` + `behavioral-synthesis` | 4 independent lenses + 1 synthesis lens. Each asks a different question about code behavior. | Pipeline mode `behavioral` — structurally distinct from L12 3-pass and portfolio. Code-only |
| **ERRORS (error-resilience)** | `error-resilience` | "How does code break? What failure information is destroyed?" (~165w). | Behavioral input labeled ERRORS in synthesis |
| **COSTS (optimize)** | `optimize` | "What does code cost? What performance data is hidden?" (~120w). | Behavioral input labeled COSTS in synthesis |
| **CHANGES (evolution)** | `evolution` | "How does code change? What invisible handshakes bind components?" (~130w). | Behavioral input labeled CHANGES in synthesis |
| **PROMISES (api-surface)** | `api-surface` | "What does code promise vs do? Where do labels lie?" (~130w). | Behavioral input labeled PROMISES in synthesis |
| **Behavioral Synthesis** | `behavioral-synthesis` | Synthesis lens that reads the 4 labeled behavioral analyses and finds convergence points, blind spots, and a unified conservation law (~150w). | Terminal pass of the behavioral pipeline (activity `05`) |
| **Domain-Neutral Variant** | `error-resilience-neutral`, `api-surface-neutral`, `evolution-neutral` | A rewrite of a code-specific lens with domain-neutral language for non-code targets. Quality ~0.5–1.0 lower than the code version on code. | Standalone portfolio lenses for general targets; the neutral set covers three of the four behavioral lenses |
| **Compressed Variant** | `error-resilience-compact`, `error-resilience-70w`, `l12-universal` | A shorter version of a lens to keep smaller models single-shot. | Model-specific optimization; selected by recommending the slug directly (no parameterization — see Q3) |
| **Hybrid Lens** | `evidence-cost` | A lens combining operations from two parents (`evidence-cost` = error-resilience × optimize). | Portfolio-eligible standalone lens |
| **Fidelity** | `fidelity` | Contract fidelity — finds documentation-code drift, help-text inaccuracy, stale comments. | Portfolio-eligible standalone lens, related to but distinct from `contract` |

> The catalog also includes Analysis (`archaeology`, `audit-code`, `cultivation`, `simulation`, `security-v1`, `testability-v1`), Knowledge/Epistemic (`knowledge-audit`, `knowledge-boundary`, `knowledge-typed`, `l12g`, `oracle`), a Writer pipeline (`writer`, `writer-critique`, `writer-synthesis`), Meta (`strategist`, `blindspot`, `falsify`, `significance`), Generative (`arc-code`, `architect`, `codegen`, `genesis`), and Counterfactual/Emergent (`counterfactual`, `history`, `emergence`) families.

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | Should the behavioral pipeline be a distinct pipeline_mode ("behavioral") or be modeled as a special portfolio mode with mandatory synthesis? | Resolved | A distinct pipeline mode `behavioral`, structurally separate from both portfolio (no dedicated synthesis lens) and full-prism (3 sequential vs 4 parallel + 1 synthesis). Structure: 4 lenses dispatched in `structural-pass` (`dispatch-behavioral-lenses` step) + a dedicated `behavioral-synthesis-pass` activity. | DD-1 |
| Q2 | How are resources addressed and grouped? | Resolved | Resources are slug-named files resolved by id (`src/loaders/resource-loader.ts`). The mnemonic numbers in `resources/README.md`'s family tables label the families (12-18 SDL, 19-23 behavioral, and so on). | DD-2 |
| Q3 | Should compressed variants (`error-resilience-compact`, `error-resilience-70w`) be separate resources or handled via a model-routing parameter? | Resolved | Separate resources. The resource system has no parameterization mechanism — `get_resource(session_index, resource_id)` loads by slug id, with no variant selection. `error-resilience-compact`, `error-resilience-70w`, and `l12-universal` are complete standalone lens files. | DD-3 |
| Q4 | Does the behavioral pipeline reuse the structural-pass activity (as portfolio mode does), or have its own activity chain? | Resolved | Hybrid approach. The 4 independent behavioral lenses are dispatched within structural-pass (`pipeline_mode == "behavioral"` conditions alongside portfolio conditions). The behavioral synthesis is a dedicated activity (behavioral-synthesis-pass), matching the pattern where synthesis is a separate activity. | DD-4 |
| Q5 | How does plan-analysis route to the behavioral pipeline? What analytical goals map to behavioral analysis vs. structural L12? | Resolved | Goal mappings: error handling → error-resilience or behavioral pipeline; performance → optimize or behavioral; API quality → api-surface or behavioral; comprehensive behavioral → behavioral pipeline mode. Individual behavioral lenses are also portfolio-eligible for targeted single-concern analysis. | DD-5 |
| Q6 | Are SDL lenses part of the portfolio lens catalog, or do they have their own "sdl-portfolio" mode? | Resolved | Part of the portfolio catalog. SDL lenses are 3-step standalone lenses matching the portfolio pattern (independent, no sequential dependencies). An "SDL portfolio" is portfolio mode with SDL-family lenses selected. | DD-6 |
| Q7 | How is the behavioral synthesis pass orchestrated — it expects 4 labeled inputs (ERRORS, COSTS, CHANGES, PROMISES), unlike L12 synthesis which expects 2 unlabeled inputs? | Resolved | A dedicated `behavioral-synthesis-pass` activity runs `behavioral-pipeline` with `lens_name: synthesis`. The worker loads the `behavioral-synthesis` resource and reads the 4 artifacts from `prior_artifact_paths` (keyed by role label), concatenating them under labeled headings (protocol step 5). The label mapping is encoded in the `behavioral-pipeline` technique. | DD-7 |
| Q8 | How is the partial domain-neutral coverage of the behavioral pipeline handled? | Resolved | Behavioral pipeline is code-only. `optimize` uses strongly code-oriented vocabulary (allocations, cache misses, nanoseconds). Individual domain-neutral behavioral lenses serve in portfolio mode for non-code targets. | DD-8 |
| Q9 | How is the label mapping between behavioral lens names and synthesis input labels maintained to prevent silent breakage? | Resolved | The mapping is an **explicit input contract**: `behavioral-pipeline`'s `prior_artifact_paths` input is a map keyed by role label (ERRORS, COSTS, CHANGES, PROMISES), and protocol step 5 ("Construct Synthesis Input") assembles the labeled sections. The `behavioral_output_paths` workflow variable is described as "map of role label … to file path". The contract lives in the technique definition. | — |
| Q10 | As the resource catalog grows, should the static lens lookup tables in techniques be replaced with a more maintainable pattern? | Open | Identified by rejected-paths lens. The catalog holds **58** lenses and the routing tables live in `plan-analysis`, `portfolio-analysis`, and `resources/README.md`. Each new lens requires updating all of them. Alternative: per-lens metadata in resource front matter declaring family, target compatibility, and pipeline eligibility — letting techniques query capabilities rather than maintain static tables. Trade-off: research-validated routing quality vs. maintenance cost. | — |
| Q11 | Resources include YAML front matter with calibration metadata (`optimal_model`, `quality_baseline`, target compatibility) and `plan-analysis` encodes a `model-sensitivity` rule. Could the server expose this front matter so routing/model selection reads it directly instead of duplicating it in technique prose? | Open | The front-matter metadata exists per `resources/README.md` and the calibration fields are real, but no server tool surfaces it for programmatic routing. This is the concrete form Q10's "per-lens metadata" alternative would take. | — |
| Q12 | The 13 pass activities (one chain per pipeline mode) share a near-identical `scatter-gather` forEach-over-`analysis_units` shell. Should there be a generalized variable-length pass chain rather than a distinct activity per mode? | Open | R2 chooses "distinct activity per mode" to preserve isolation boundaries, holding across all modes. Whether the duplication becomes a maintenance liability at the next expansion is unevaluated. | — |

### Remaining follow-up items (out of scope)

- Whether per-lens metadata in resource front matter could enable dynamic routing (requires server-side changes to parse front matter — out of scope for this workflow-only work package)
- Whether the existing L12 pipeline activities (adversarial-pass, synthesis-pass) should be generalized to support variable-length pipelines in the future

## Initial Deep-Dive — 2026-03-13

### DD-1: Behavioral Pipeline Mode Decision

Dispatch concerns are distributed across the workflow: the per-mode routing is the `select-mode` transition table, the parallel/sequential discipline is the activity-level `scatter-gather` technique, and the actual lens execution is the per-pass techniques (`structural-analysis`, `full-prism`, `portfolio-analysis`, `behavioral-pipeline`). The runtime behavior per mode:
- structural: single fresh sub-agent, single lens (`structural-analysis`)
- adversarial: sequential after structural, reads structural artifact (`full-prism` `lens_name: adversarial`)
- synthesis: sequential after adversarial, reads both prior artifacts (`full-prism` `lens_name: synthesis`)
- portfolio: parallel independent lenses, up to 4 concurrent, inline cross-lens synthesis (`portfolio-analysis`)

The behavioral pipeline requires a pattern not currently supported: **4 parallel independent lenses followed by 1 dedicated synthesis lens that reads all 4 outputs with specific labels**. This is distinct from:
- Portfolio: parallel independent + **inline** synthesis (worker generates, no dedicated lens)
- Full-prism: **sequential** 3-pass with **unlabeled** artifact inputs

A new pipeline mode is the correct abstraction. It allows clean dispatch logic without overloading the portfolio or full-prism protocols.

### DD-2: Resource Numbering Scheme

All resource indices are hardcoded strings referenced in 3 skills:
- `plan-analysis.toon` line 101: goal-mapping matrix references 00, 03, 06-11
- `portfolio-analysis.toon` line 28: maps lens names to 06-11
- `orchestrate-prism.toon` lines 36-38: maps mode+target_type to 00-05, lens names to 06-11

Proposed numbering with family grouping:

| Range | Family | Resources |
|-------|--------|-----------|
| 12-18 | SDL | 12-deep_scan, 13-sdl_trust, 14-sdl_coupling, 15-sdl_abstraction, 16-rec, 17-ident, 18-73w |
| 19-23 | Behavioral | 19-error_resilience, 20-optim, 21-evolution, 22-api_surface, 23-behavioral_synthesis |
| 24-26 | Domain-neutral | 24-error_resilience_neutral, 25-api_surface_neutral, 26-evolution_neutral |
| 27-28 | Compressed | 27-error_resilience_compact, 28-error_resilience_70w |
| 29-32 | Hybrid/specialized | 29-evidence_cost, 30-reachability, 31-fidelity, 32-state_audit |

### DD-3: Compressed Variants as Separate Resources

The `get_resource` MCP tool signature is `get_resource(workflow_id, index)` — it loads a file by index. There is no variant parameter, model parameter, or selection mechanism beyond the index. Each compressed variant is a complete, self-contained lens prompt. Making them separate resources follows the existing pattern where code L12 (00) and general L12 (03) are separate resources despite encoding the same operations.

### DD-4: Structural-Pass Reuse for Behavioral Lenses

The structural-pass activity (`01-structural-pass.toon`) uses a forEach loop over `analysis_units` with conditional branches:
- Lines 28-57: L12 lens steps conditioned on `pipeline_mode != "portfolio"`
- Lines 58-84: Portfolio lens steps conditioned on `pipeline_mode == "portfolio"`

Adding behavioral mode means adding a third conditional branch:
- Behavioral lens steps conditioned on `pipeline_mode == "behavioral"` — dispatch 4 independent lenses in parallel

The transition table (lines 89-97) currently branches:
- To `adversarial-pass` if `pipeline_mode == "full-prism"`
- To `deliver-result` (default)

Adding: to `behavioral-synthesis-pass` if `pipeline_mode == "behavioral"`. This keeps the existing L12 and portfolio paths unchanged.

### DD-5: Plan-Analysis Routing Expansion

The goal-mapping matrix in `plan-analysis.toon` (line 101) needs new entries. Proposed additions:

| Analytical Goal | Lens(es) | Mode |
|----------------|----------|------|
| Error handling analysis | error_resilience (19) | single |
| Performance review | optim (20) | single |
| API quality review | api_surface (22) | single |
| Evolution/coupling analysis | evolution (21) | single |
| Comprehensive behavioral | behavioral pipeline (19-23) | behavioral |
| Trust boundary review | sdl_trust (13) | single or portfolio |
| Coupling analysis | sdl_coupling (14) | single or portfolio |
| Dead code / reachability | reachability (30) | single |
| State machine analysis | state_audit (32) | single |
| Contract fidelity | fidelity (31) | single or portfolio |

SDL lenses also join the portfolio selection guide in portfolio-analysis:
- Architecture review → deep_scan (12) + sdl_trust (13)
- Coupling/evolution → sdl_coupling (14) + evolution (21)
- Identity/naming → ident (17) + api_surface (22)

### DD-6: SDL Lenses in Portfolio Catalog

Confirmed by examining SDL lens structure. All SDL lenses follow the same pattern as existing portfolio lenses:
- 3 concrete steps
- Execute on target content directly (no dependency on prior pass output)
- Self-contained analysis producing independent findings
- ~130-280 words

The portfolio-analysis skill's lens catalog should expand from 6 lenses (06-11) to include SDL lenses (12-17) and individual behavioral lenses (19-22) plus hybrid/specialized lenses (29-32). The selection guide needs updating with SDL-appropriate goal mappings.

### DD-7: Behavioral Synthesis Orchestration

The behavioral_synthesis lens expects its 4 inputs labeled as:
```
- ERRORS: How does this break? What failure information is destroyed?
- COSTS: What does this cost? What performance data is hidden?
- CHANGES: How does this change? What invisible handshakes bind components?
- PROMISES: What does this promise vs do? Where do labels lie?
```

The orchestrator dispatch protocol for behavioral synthesis:
1. Receive 4 artifact paths from the behavioral lens passes: `{output}/behavioral-errors.md`, `{output}/behavioral-costs.md`, `{output}/behavioral-changes.md`, `{output}/behavioral-promises.md`
2. Dispatch a fresh sub-agent with: target content, all 4 artifact paths with labels, behavioral_synthesis resource index (23), output path
3. Worker reads 4 files, labels them per the synthesis expectations, applies the lens, writes `{output}/behavioral-synthesis.md`

The label mapping (error_resilience→ERRORS, optim→COSTS, evolution→CHANGES, api_surface→PROMISES) should be encoded in the behavioral-pipeline skill definition rather than left implicit.

### DD-8: Domain-Neutral Coverage

Examining `optim.md`: uses "allocation patterns," "cache behavior," "branch predictability," "memory locality," "lock contention," "nanoseconds, allocations, cache misses." Strongly code-oriented — a domain-neutral rewrite would lose the specificity that makes it effective.

The behavioral pipeline is code-only. For non-code targets:
- error_resilience_neutral (24), api_surface_neutral (25), evolution_neutral (26) are available as standalone portfolio lenses
- plan-analysis should not recommend `pipeline_mode: "behavioral"` when `target_type == "general"`

### Portfolio Lens Analysis

#### Pedagogy Lens — Applied to Prism Workflow Integration Surface

The prism workflow makes five explicit choices relevant to integration:

1. **3-pass L12 as primary mode** — rejects 2-pass, N-pass, and single-pass-with-appendix alternatives
2. **Fresh sub-agents per pass** — rejects resuming workers, rejects inline output forwarding
3. **Hardcoded resource indices in skills** — rejects dynamic registry, rejects semantic naming
4. **Portfolio with inline synthesis** — rejects dedicated synthesis lens, rejects sequential portfolio
5. **Binary target_type (code/general)** — rejects per-lens compatibility metadata, rejects auto-detection

When internalizing these patterns for the behavioral pipeline integration:
- The "run N independent lenses" pattern from portfolio is unconsciously resurrected
- A new pipeline mode is created rather than extending portfolio (following precedent)
- Behavioral synthesis becomes a separate activity following L12 synthesis precedent
- Binary target_type creates a silent problem: behavioral lenses have partial neutral coverage (3/4), forcing all-or-nothing domain neutrality

**Pedagogy law**: The constraint of hardcoded resource indices transfers as the assumption that all lens selection can be expressed as a static lookup table. As the catalog grows from 12 to 33, the lookup table becomes the maintenance bottleneck — every routing decision in every skill must be manually updated.

**Invisible transferred decision that fails first**: Treating the behavioral synthesis label mapping as an implicit contract. The mapping (error_resilience→ERRORS, optim→COSTS, evolution→CHANGES, api_surface→PROMISES) is encoded only in the synthesis lens prompt. If someone reorders behavioral lenses or adds a 5th, the labels break silently — no skill or activity definition validates the contract.

#### Rejected-Paths Lens — Applied to Prism Workflow Integration Surface

Three decisions and their rejected alternatives:

1. **Static index mapping rejects dynamic registry**. A dynamic registry would allow adding lenses without updating 3+ skills, but the routing quality depends on metadata quality, and there's no research-validated metadata schema for new lenses yet.

2. **Portfolio inline synthesis rejects dedicated synthesis lens**. A dedicated synthesis lens for portfolio would have made behavioral pipeline a natural extension (portfolio + synthesis lens = behavioral). Instead, behavioral pipeline must be a separate mode because portfolio's synthesis is structurally different (generated by worker vs. loaded from resource).

3. **Binary target_type rejects per-lens compatibility metadata**. If each lens declared its own target compatibility (code, general, both), the routing logic could be local rather than centralized in plan-analysis. Instead, every new lens family creates a new category in the centralized routing rules.

**The law**: The class of problem that migrates between visible and hidden is **routing decision quality**. Static matrices make routing visible but maintenance expensive. Dynamic registries make maintenance invisible but routing quality opaque. The current work package adds 21 lenses to a static system — the maintenance cost is visible and bounded. A future migration to dynamic routing would hide maintenance cost but risk degrading the research-validated routing quality.

**Cross-lens synthesis**: Both lenses converge on the same structural finding: **the hardcoded index system is the primary integration cost**. Pedagogy identifies it as a transferred assumption (static lookup works at any scale). Rejected-paths identifies it as a conscious trade-off (routing quality over maintenance cost). The synthesis: the current approach is correct for this work package (21 lenses is manageable), but a future work package should evaluate per-lens metadata as a scalability measure.

---
*This artifact is part of a persistent knowledge base. It is augmented across successive work packages to build cumulative codebase understanding.*
