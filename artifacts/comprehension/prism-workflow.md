# Prism Workflow — Comprehension Artifact

> **Last updated**: 2026-03-13
> **Work packages**: [#53 Import Prism Families](../planning/2026-03-13-import-prism-families/README.md)
> **Coverage**: Prism workflow architecture, pipeline modes, resource system, skill routing, activity chain, integration surface for new prism families
> **Related artifacts**: [orchestration.md](orchestration.md) (server architecture), [assumptions-log.md](../planning/2026-03-13-import-prism-families/01-assumptions-log.md)

## Architecture Overview

### Workflow Structure

The prism workflow (`workflows/prism/`, v1.3.0) orchestrates structural analysis through isolated sub-agent passes. It follows the orchestrator/worker execution model with disposable workers — each analytical pass runs in a fresh sub-agent that is never resumed, guaranteeing context isolation.

```
workflows/prism/
├── workflow.toon                    # 13 variables, 12 rules, initialActivity: select-mode
├── activities/
│   ├── 00-select-mode.toon         # Plans analysis, selects pipeline mode
│   ├── 01-structural-pass.toon     # Iterates analysis_units, runs L12 or portfolio
│   ├── 02-adversarial-pass.toon    # Challenges structural findings (full-prism only)
│   ├── 03-synthesis-pass.toon      # Reconciles structural + adversarial (full-prism only)
│   └── 04-deliver-result.toon      # Presents final artifact(s) to user
├── skills/
│   ├── 00-structural-analysis.toon # Single-pass L12 execution
│   ├── 01-full-prism.toon          # Worker-side pass execution (any pass)
│   ├── 02-portfolio-analysis.toon  # Multi-lens independent execution
│   ├── 03-plan-analysis.toon       # Scope detection, lens selection, strategy
│   └── 04-orchestrate-prism.toon   # Orchestrator coordination
└── resources/
    ├── 00-l12-structural.md through 11-contract.md  (12 resources)
    └── README.md
```

### Activity Chain and Transitions

The activity chain is linear with conditional branching at `structural-pass`:

```
select-mode ──→ structural-pass ──┬──→ adversarial-pass ──→ synthesis-pass ──→ deliver-result
                                  │      (only if pipeline_mode == "full-prism")
                                  └──→ deliver-result
                                       (default: single or portfolio modes)
```

- **select-mode** delegates to `plan-analysis` skill to detect scope, classify targets, select lenses, and recommend a pipeline mode. Yields a `confirm-mode` checkpoint (unless mode was explicitly provided).
- **structural-pass** iterates over `analysis_units` (a forEach loop). For each unit, checks `pipeline_mode`: if `single` or `full-prism`, loads and executes the L12 structural lens; if `portfolio`, selects and executes multiple independent portfolio lenses. Writes per-unit artifacts.
- **adversarial-pass** iterates the same `analysis_units`, skipping units not in `full-prism` mode. Loads the adversarial lens, reads the structural artifact, and challenges it.
- **synthesis-pass** iterates `analysis_units`, skipping non-`full-prism` units. Loads the synthesis lens, reads both structural and adversarial artifacts, and produces the reconciled result.
- **deliver-result** reads the final artifact(s) and presents them.

### Pipeline Modes

| Mode | Passes | Activities Used | Artifact(s) |
|------|--------|----------------|-------------|
| `single` | 1 | structural-pass → deliver-result | `structural-analysis.md` |
| `full-prism` | 3 (sequential) | structural-pass → adversarial-pass → synthesis-pass → deliver-result | `structural-analysis.md`, `adversarial-analysis.md`, `synthesis.md` |
| `portfolio` | N (parallel within structural-pass) | structural-pass → deliver-result | `portfolio-{lens}.md` × N, `portfolio-synthesis.md` |

### Resource System

Resources are indexed `{NN}-{name}.md` files. Skills reference them by string index. The MCP tool `get_resource(workflow_id: "prism", index: "00")` loads the resource content.

| Index | Name | Family | Target Type | Role |
|-------|------|--------|-------------|------|
| `00` | l12-structural | L12 Pipeline | code | Primary structural analysis (330w, 12-step chain) |
| `01` | l12-adversarial | L12 Pipeline | code | Adversarial challenge (150w, receives output of 00) |
| `02` | l12-synthesis | L12 Pipeline | code | Reconciliation (130w, receives outputs of 00+01) |
| `03` | l12-general-structural | L12 Pipeline | general | Same operations as 00 with domain-neutral language |
| `04` | l12-general-adversarial | L12 Pipeline | general | Same operations as 01 with domain-neutral language |
| `05` | l12-general-synthesis | L12 Pipeline | general | Same operations as 02 with domain-neutral language |
| `06` | pedagogy | Portfolio | both | Transfer corruption (75w) |
| `07` | claim | Portfolio | both | Assumption inversion (80w) |
| `08` | scarcity | Portfolio | both | Resource conservation (60w) |
| `09` | rejected-paths | Portfolio | both | Design trade-offs (65w) |
| `10` | degradation | Portfolio | both | Decay timeline (65w) |
| `11` | contract | Portfolio | code only | Interface violations (80w) |

### Skill Routing

**plan-analysis** (skill 03) is the brain of the workflow. It has two key lookup tables:

1. **Goal-mapping matrix** — maps analytical goals to lens resource indices:
   - Bug detection → 00 (L12)
   - Code review → 00 + 11 (L12 + contract)
   - Design review → 07 + 09 (claim + rejected-paths)
   - Comprehension → 06 + 09 (pedagogy + rejected-paths)
   - Pre-commit → 00-02 (L12 pipeline)
   - Planning review → 03 (L12-general)
   - Maintainability → 10 + 11 (degradation + contract)
   - Assumption validation → 07 + 08 (claim + scarcity)
   - Security review → 00-02 (L12 pipeline)

2. **Code-vs-general rule** — selects lens variant by target_type:
   - Code → resources 00-02 + 06-11
   - General → resources 03-05 + 06-10 (no contract)

**portfolio-analysis** (skill 02) operates on a fixed lens catalog: pedagogy=06, claim=07, scarcity=08, rejected-paths=09, degradation=10, contract=11. Its selection guide recommends pairs for specific goals.

**orchestrate-prism** (skill 04) handles dispatch. It has a `determine-lens-indices` protocol step that hardcodes the index mapping: code structural=00, adversarial=01, synthesis=02; general structural=03, adversarial=04, synthesis=05; portfolio: pedagogy=06 through contract=11.

### Isolation Model

The isolation model is the workflow's core invariant. Each pass runs in a fresh sub-agent (never resumed) to prevent context contamination. The adversarial pass must genuinely challenge the structural analysis without being biased by having generated it. Outputs pass between workers via filesystem artifacts (artifact-mediated communication). The orchestrator provides artifact paths; workers read from and write to the filesystem.

## Key Abstractions

| Abstraction | Definition | Implementation |
|-------------|-----------|----------------|
| **Lens** | An imperative prompt encoding a sequence of analytical operations. The model executes these operations as a program. | Markdown file in `resources/`, loaded by index via `get_resource` |
| **Pipeline Mode** | The execution pattern for a lens or set of lenses. | String variable: `single`, `full-prism`, `portfolio` |
| **Pass** | A single lens execution by an isolated sub-agent. | Fresh Task sub-agent dispatched by orchestrator |
| **Analysis Unit** | A unit of work to analyze — a file, module, or query with assigned pipeline mode and lenses. | Object in `analysis_units` array, iterated by activity forEach loops |
| **Target Type** | Whether the input is `code` or `general`, determining which lens variants to use. | String variable defaulting to `code` |
| **Conservation Law** | The structural finding that the L12 lens chain converges on — a named trade-off that cannot be eliminated, only relocated. | Section in the structural analysis artifact |
| **Portfolio** | A set of independent lenses applied to the same artifact for breadth. Each finds genuinely different structural properties. | Dispatched in parallel within structural-pass (up to 4 concurrent) |
| **Resource Index** | String identifier (e.g., "00", "11") for loading a specific lens. Skills hardcode these indices. | Used in `get_resource(workflow_id, index)` calls |

## Design Rationale

### R1: Fixed resource indices in skills

**Observation**: Skills hardcode resource indices (e.g., plan-analysis maps "bug detection → 00", portfolio-analysis maps "pedagogy=06"). No dynamic discovery.

**Rationale**: Lens selection is a design decision, not a runtime discovery problem. The goal-mapping matrix encodes research-validated pairings (from the agi-in-md experiment rounds). Dynamic discovery would add complexity without improving selection quality.

**Integration implication**: Adding new lenses requires updating every skill that references resource indices. This is the primary maintenance cost of expansion — each new lens needs entries in plan-analysis (goal-mapping matrix, code-vs-general rule), portfolio-analysis (if portfolio-eligible), and orchestrate-prism (if applicable to new pipeline modes).

### R2: Activity chain hardcoded for 3-pass L12

**Observation**: The activity chain (structural → adversarial → synthesis) is specifically designed for the L12 pipeline. Adversarial-pass and synthesis-pass activities filter on `pipeline_mode == "full-prism"` and are structurally coupled to the L12 lens sequence (resource 00/03 → 01/04 → 02/05).

**Rationale**: The 3-pass L12 pipeline is the workflow's primary analytical mode. The sequential dependency is inherent to the method — the adversarial pass must receive the structural output, and synthesis must receive both. Encoding this as separate activities preserves the isolation boundary (each activity dispatches to a fresh worker).

**Integration implication**: The behavioral pipeline (4 independent + 1 synthesis) cannot reuse the adversarial-pass and synthesis-pass activities. The behavioral pipeline is structurally different: 4 independent lenses (parallelizable, no sequential dependencies) followed by 1 synthesis that receives all 4 labeled outputs. This either requires new activities or a generalization of the existing activity chain.

### R3: Portfolio mode is inline within structural-pass

**Observation**: Portfolio mode is handled inside structural-pass via conditional steps, not as a separate activity chain. When `pipeline_mode == "portfolio"`, structural-pass selects and executes multiple independent lenses and writes per-lens artifacts plus a cross-lens synthesis.

**Rationale**: Portfolio lenses are independent single-pass operations — no sequential dependencies. Handling them within structural-pass avoids creating unnecessary activities for what is essentially "run N independent analyses."

**Integration implication**: The behavioral pipeline's 4 independent lenses share this "run N independent analyses" pattern. The key difference is that behavioral pipeline has a mandatory synthesis pass using a specialized synthesis lens that expects labeled inputs. Portfolio's cross-lens synthesis is inline (generated by the worker itself), while behavioral synthesis is a separate lens with specific expectations.

### R4: Target type determines lens variant

**Observation**: The `target_type` variable (`code`/`general`) selects between code-specific (00-02) and general-domain (03-05) lens variants. Portfolio lenses 06-10 work on both; contract (11) is code-only.

**Rationale**: The underlying analytical operations are identical — only the framing language differs. Code lenses use "code review" and "function"; general lenses use "expert review" and "input." This dual-track approach emerged from the agi-in-md experiments which showed domain vocabulary is a mode trigger.

**Integration implication**: The behavioral pipeline has domain-neutral variants for 3 of 4 lenses (no optim_neutral). SDL lenses are code-specific. This creates three categories of new lenses by target_type: code-only (SDL, optim, evidence_cost, reachability, fidelity, state_audit), both (73w), and lenses-with-neutral-variants (error_resilience, api_surface, evolution). The incomplete neutral coverage of the behavioral pipeline is a design consideration — a fully domain-neutral behavioral pipeline is not currently possible.

## Domain Concept Mapping

### Glossary — New Concepts (from agi-in-md)

| Domain Term | Definition | Integration Role |
|-------------|-----------|-----------------|
| **SDL (Structural Deep-Scan Lens)** | Family of 3-step single-pass lenses (~180w) that each target a specific architectural concern. Always single-shot on all models. | Portfolio-eligible standalone lenses. SDL-1 through SDL-5: deep_scan, sdl_trust, sdl_coupling, sdl_abstraction + rec, ident |
| **Behavioral Pipeline** | 4 independent lenses (error_resilience, optim, evolution, api_surface) + 1 synthesis lens (behavioral_synthesis). Each lens asks a different question about code behavior. | New pipeline mode — structurally distinct from L12 3-pass and portfolio |
| **ERRORS (error_resilience)** | "How does this break? What failure information is destroyed?" 3-step lens (~165w). | Behavioral pipeline input labeled ERRORS in synthesis |
| **COSTS (optim)** | "What does this cost? What performance data is hidden?" 3-step lens (~120w). | Behavioral pipeline input labeled COSTS in synthesis |
| **CHANGES (evolution)** | "How does this change? What invisible handshakes bind components?" 3-step lens (~130w). | Behavioral pipeline input labeled CHANGES in synthesis |
| **PROMISES (api_surface)** | "What does this promise vs do? Where do labels lie?" 3-step lens (~130w). | Behavioral pipeline input labeled PROMISES in synthesis |
| **Behavioral Synthesis** | Synthesis lens that reads 4 labeled behavioral analyses and finds convergence points, blind spots, and a unified conservation law (~150w). | Terminal pass in behavioral pipeline |
| **Domain-Neutral Variant** | A rewriting of a code-specific lens with domain-neutral language for non-code targets. | Follows the existing code/general pattern (resources 00-02 vs 03-05) |
| **Compressed Variant** | A shorter version of a lens optimized for smaller models (Haiku) to stay single-shot. | Model-specific optimization, secondary routing concern |
| **Hybrid Lens** | A lens that combines operations from two parent lenses (e.g., evidence_cost = error_resilience × optim). | Portfolio-eligible standalone lens with cross-dimensional insights |
| **Fidelity (SDL-9)** | Contract fidelity — finds documentation-code drift, help text inaccuracy, stale comments. | Portfolio-eligible standalone lens, related to but distinct from contract (11) |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | Should the behavioral pipeline be a new pipeline_mode ("behavioral") or be modeled as a special portfolio mode with mandatory synthesis? | Resolved | New pipeline mode. Structurally distinct from both portfolio (no dedicated synthesis lens) and full-prism (3 sequential vs 4 parallel + 1 synthesis). The orchestrator needs a `dispatch-behavioral-passes` protocol. | DD-1 |
| Q2 | How should new resources be numbered? Should there be a logical grouping scheme (e.g., 12-18 SDL, 19-23 behavioral) or flat sequential? | Resolved | Sequential from 12, grouped by family: 12-18 SDL, 19-23 behavioral, 24-26 domain-neutral, 27-28 compressed, 29-32 hybrid/specialized. Keeps related lenses adjacent. | DD-2 |
| Q3 | Should compressed variants (error_resilience_compact, error_resilience_70w) be separate resources or handled via a model-routing parameter? | Resolved | Separate resources. The resource system has no parameterization mechanism — `get_resource` loads by index, no variant selection. Each compressed variant is a complete standalone lens file. | DD-3 |
| Q4 | Can the behavioral pipeline reuse the existing structural-pass activity (as portfolio mode does), or does it need its own activity chain? | Resolved | Hybrid approach. The 4 independent behavioral lenses can be dispatched within structural-pass (adding `pipeline_mode == "behavioral"` conditions alongside portfolio conditions). The behavioral synthesis needs a new activity (behavioral-synthesis-pass) for consistency with the existing pattern where synthesis is a separate activity. | DD-4 |
| Q5 | How should plan-analysis route to the behavioral pipeline? What analytical goals map to behavioral analysis vs. structural L12? | Resolved | Add goal mappings: error handling → error_resilience or behavioral pipeline; performance → optim or behavioral; API quality → api_surface or behavioral; comprehensive behavioral → behavioral pipeline mode. Individual behavioral lenses are also portfolio-eligible for targeted single-concern analysis. | DD-5 |
| Q6 | Should SDL lenses be added to the portfolio lens catalog, or should they have their own "sdl-portfolio" mode? | Resolved | Add to portfolio catalog. SDL lenses are 3-step standalone lenses matching the portfolio pattern (independent, no sequential dependencies). An "SDL portfolio" is just portfolio mode with SDL-family lenses selected — no new mode needed. | DD-6 |
| Q7 | How should the behavioral synthesis pass be orchestrated — it expects 4 labeled inputs (ERRORS, COSTS, CHANGES, PROMISES), unlike L12 synthesis which expects 2 unlabeled inputs? | Resolved | New dispatch protocol in orchestrate-prism. The worker loads the behavioral_synthesis resource and reads 4 artifact files from the filesystem, labeled per the synthesis lens expectations. The label mapping (error_resilience→ERRORS, optim→COSTS, evolution→CHANGES, api_surface→PROMISES) must be encoded in the orchestrator or behavioral-pipeline skill. | DD-7 |
| Q8 | How should the incomplete domain-neutral coverage of the behavioral pipeline be handled (no optim_neutral)? Skip behavioral mode for general targets, use code optim on general, or leave optim out? | Resolved | Behavioral pipeline is code-only. optim uses strongly code-oriented vocabulary (allocations, cache misses, nanoseconds). Individual domain-neutral behavioral lenses can be used in portfolio mode for non-code targets. | DD-8 |
| Q9 | How should the label mapping between behavioral lens names and synthesis input labels be maintained to prevent silent breakage? | Open | Identified by pedagogy lens. The mapping (error_resilience→ERRORS, optim→COSTS, evolution→CHANGES, api_surface→PROMISES) is an implicit contract between the behavioral lenses and behavioral_synthesis. If lenses are reordered or a 5th is added, synthesis labels break silently. Should this be encoded in a skill, a resource metadata file, or the activity definition? | — |
| Q10 | As the resource catalog grows from 12 to 33, should the hardcoded index lookup tables in skills be replaced with a more maintainable pattern? | Open | Identified by rejected-paths lens. Currently 3+ skills hardcode index mappings. Each new lens requires updating all skills. Alternative: per-lens metadata in resource front matter declaring family, target compatibility, and pipeline eligibility — allowing skills to query capabilities rather than maintain static tables. Trade-off: research-validated routing quality vs. maintenance cost. | — |

### Remaining follow-up items (out of scope)

- Whether per-lens metadata in resource front matter could enable dynamic routing (requires server-side changes to parse front matter — out of scope for this workflow-only work package)
- Whether the existing L12 pipeline activities (adversarial-pass, synthesis-pass) should be generalized to support variable-length pipelines in the future

## Initial Deep-Dive — 2026-03-13

### DD-1: Behavioral Pipeline Mode Decision

The orchestrate-prism skill (`04-orchestrate-prism.toon` lines 34-68) has distinct dispatch protocols per mode:
- `dispatch-structural-pass` (lines 39-45): single fresh sub-agent, single lens
- `dispatch-adversarial-pass` (lines 46-52): sequential after structural, reads structural artifact
- `dispatch-synthesis-pass` (lines 53-58): sequential after adversarial, reads both prior artifacts
- `dispatch-portfolio-passes` (lines 59-64): parallel independent lenses, up to 4 concurrent, inline cross-lens synthesis

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
