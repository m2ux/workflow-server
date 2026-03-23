---
name: evaluation_prompt_template
description: "Reusable analysis prompt template for multi-dimensional proposal/document evaluation. Instantiate by replacing {placeholders} with target-specific content. Pass the instantiated prompt as analysis_prompt to the prism workflow."
type: template
---
# Evaluation Prompt Template

Use this template to compose an `analysis_prompt` for multi-dimensional evaluations. Replace all `{placeholders}` with target-specific content, then pass the result to prism as `analysis_prompt`.

---

## Template

```markdown
# Analysis Prompt

## Target
{path/to/document_or_codebase}

## Evaluation Scope
{One sentence: what this target is and what aspects to evaluate.}

## Dimensions

- **Consistency**: Evaluate internal logical coherence across {the major sections or components of the target}. Check whether {cross-referenced claims or definitions} are consistent between sections. Verify that {deliverables or specifications in one section} align with {requirements or constraints stated in another}. Cross-check {any stated mitigations or resolutions} against {the problems they claim to address}.

- **Veracity**: Assess truthfulness of empirical claims regarding {the technical, quantitative, or factual assertions in the target}. Evaluate {any references to external standards, frameworks, or specifications} against their source material. Verify {quantitative claims such as performance figures, market sizes, or resource estimates} are defensible. Check {competitive or comparative assertions} against known capabilities.

- **Plausibility**: Evaluate whether {the key design or strategic decisions} adequately consider alternatives. Assess {specific rejected approaches} — what problems migrate between the chosen and rejected options. Examine {adoption, marketplace, or growth assumptions} for cold-start dynamics and realism. Evaluate {any convergence, timeline, or self-correcting mechanism claims} for empirical basis.

- **Feasibility**: Identify resource scarcities in {the implementation plan, pipeline, or roadmap}. Assess {timeline or milestone claims} given {known constraints, dependencies, or blockers}. Evaluate {phase gate or success criteria} for achievability within the implied timeline and budget. Examine {external platform, supply chain, or ecosystem dependencies} and whether required capabilities are available when needed.

## Constraints
- Prioritise accuracy over speed
- {Any additional constraints: focus sections, budget preference, specific concerns}
```

---

## Usage

1. Copy the template above
2. Replace every `{placeholder}` with content specific to your target
3. Save as a markdown file (e.g., `my-evaluation-prompt.md`)
4. Invoke prism:

```
analysis_prompt: @my-evaluation-prompt.md
target: /path/to/document.md
output_path: /path/to/output/
```

The prism workflow will:
1. Parse the dimensions from the prompt
2. Map each to a pipeline mode (Consistency → full-prism, Veracity → portfolio, etc.)
3. Execute per-dimension analysis via execute-plan
4. Produce EVALUATION-REPORT.md with per-dimension findings, cross-dimensional patterns, and a core finding

## Customisation

- **Fewer dimensions**: Remove dimensions that aren't relevant. A 2-dimension evaluation is valid.
- **Custom dimensions**: Replace any standard dimension with a domain-specific one (e.g., "Security", "Accessibility", "Regulatory Compliance"). Describe what to examine and prism will map it to appropriate lenses.
- **Code targets**: For codebases, replace the proposal-oriented focus areas with code-relevant ones (e.g., Consistency → "API contracts vs implementations", Feasibility → "dependency freshness and upgrade paths").
- **Re-use**: The saved prompt can be re-run against updated versions of the same target to track how findings evolve over time.
