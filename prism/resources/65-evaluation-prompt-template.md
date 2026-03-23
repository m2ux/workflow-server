---
name: evaluation_prompt_template
description: "Reusable analysis prompt template for multi-dimensional proposal/document evaluation. Instantiate by replacing {placeholders} with target-specific content. Pass the instantiated prompt as analysis_prompt to the prism workflow."
type: template
---
# Evaluation Prompt Template

Use this template to quickly compose an `analysis_prompt` for multi-dimensional evaluations. Replace all `{placeholders}` with target-specific content, then pass the result to prism as `analysis_prompt`.

---

## Template

```markdown
# Analysis Prompt

## Target
{target_path}

## Evaluation Scope
{one_sentence_describing_what_this_document_is_and_what_aspects_to_evaluate}

## Dimensions

- **Consistency**: Evaluate internal logical coherence across {name_the_major_sections_or_components}. Check whether {specific_cross_references_that_should_agree} are consistent. Verify that {claims_in_section_A} align with {specifications_in_section_B}. Cross-check {stated_mitigations} against {the_risks_they_claim_to_address}.

- **Veracity**: Assess the truthfulness of empirical claims regarding {name_the_technical_claims_to_verify}. Evaluate {framework_or_standard_references} against their source specifications. Verify {quantitative_claims_like_performance_figures_or_market_sizes} are defensible. Check {competitive_positioning_claims} against known capabilities.

- **Plausibility**: Evaluate whether {key_design_decisions} adequately consider alternatives. Assess {the_rejection_of_alternative_X} — what problems migrate between the chosen and rejected approaches. Examine {marketplace_or_adoption_assumptions} for cold-start dynamics and network effect realism. Evaluate {convergence_or_timeline_claims} for empirical basis.

- **Feasibility**: Identify resource scarcities in {the_implementation_pipeline_or_roadmap}. Assess {timeline_claims} given {known_constraints_or_blockers}. Evaluate {phase_gate_requirements} for achievability within the implied timeline. Examine {platform_or_dependency_maturity} progression and whether required capabilities are available when needed.

## Constraints
- Prioritise accuracy over speed
- {any_additional_constraints_like_focus_sections_or_budget}
```

---

## Example: VOX Proposal Evaluation

This prompt was used to produce the 45-finding EVALUATION-REPORT for the Midnight VOX proposal:

```markdown
# Analysis Prompt

## Target
midnight-vox-proposal.md

## Evaluation Scope
Technical architecture proposal for a five-layer Enterprise Assurance Stack combining formal organisational modelling, zero-knowledge process verification, quorum-attested semantic quality assessment, and marketplace-based reputation economics. Evaluate across architecture, business model, market positioning, and implementation roadmap.

## Dimensions

- **Consistency**: Evaluate internal logical coherence across the five-layer Enterprise Assurance Stack. Check whether the Ternary Trust Model (Structural/Semantic/Economic proofs in the Executive Summary) is consistently characterised in the Proposed Solution, Technical Specification, and Appendices. Verify roadmap phase deliverables (Phases 1-5) align with technical specification requirements — particularly Phase 2's ZK integration vs the compilation pipeline. Cross-check feasibility findings F-01 through F-10 against their claimed roadmap mitigations. Verify main body descriptions against Appendix examples (DSL in Appendix C, circuit pseudocode in Appendix D).

- **Veracity**: Assess truthfulness of empirical claims regarding Compact/PLONK capabilities (vector caps at 150 elements, on-chain arrays at 16), FROST threshold signatures (RFC 9591 alignment, O(1) verification), SPEM 2.0 extensions (novel vs standard), ASPICE reinterpretation (capability levels as tensor fill patterns), Midnight network parameters (80 TPS, 1 MB blocks, 6s block time), market sizing figures (TAM/SAM defensibility), and competitive landscape assertions (Aragon, RISC Zero, ZK L2 gaps).

- **Plausibility**: Evaluate whether the Constraint Tensor IR (3D lattice C[tool, activity, time]) adequately considers alternatives (process graphs, Petri nets, BPMN-native). Assess per-blueprint compilation vs parameterised universal circuits. Examine quorum attestation alternatives for semantic verification. Evaluate Blueprint Marketplace viability (cold-start, network effects, regulatory barriers). Assess custom DSL decision vs embedding in existing languages. Evaluate self-correcting reputation convergence claim (20-30 cycle window).

- **Feasibility**: Identify resource scarcities in the DSL-to-PLONK compilation pipeline (rare skill intersection). Assess proof generation budgets (<60s per step on commodity hardware). Evaluate five-phase roadmap realism given 4 Fundamental-severity findings (F-02 through F-05). Examine phase gate targets (50+ mainnet cycles, 500+ concurrent orgs). Assess market adoption timelines vs enterprise sales cycles. Evaluate Midnight platform maturity dependency (Kukolu to Hua progression).

## Constraints
- Prioritise accuracy over speed
- Focus on sections with cross-referencing claims (Executive Summary, Technical Specification, Roadmap, Feasibility Review, Appendices)
```

---

## Usage

```
# Direct invocation with the prism workflow
analysis_prompt: @path/to/my-evaluation-prompt.md
target: /path/to/document.md
output_path: /path/to/output/
```

The prism workflow will:
1. Parse the 4 dimensions from the prompt
2. Map each to a pipeline mode (Consistency → full-prism, Veracity → portfolio, etc.)
3. Execute per-dimension analysis via execute-plan
4. Produce EVALUATION-REPORT.md with per-dimension findings, cross-dimensional patterns, and a core finding
