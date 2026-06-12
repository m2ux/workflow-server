---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Consolidate prism analysis artifacts from multiple evaluation dimensions into a unified evaluation report with cross-dimensional synthesis

## Inputs

### dimension_plan

The dimension-to-lens mapping, used to locate and interpret artifacts

### completed_analyses

Array of completed prism run references with output paths and status

### evaluation_description

Original evaluation description, used for report context

## Protocol

### 1. Locate Artifacts

- For each dimension in `{dimension_plan}`, locate the prism output artifacts in the corresponding output_subdir under `{output_path}`
- Use `{completed_analyses}` to confirm which prism runs finished and to resolve each run's artifact output path and status before reading
- Full-prism dimensions produce: `structural-analysis.md`, `adversarial-analysis.md`, `synthesis.md`
- Portfolio dimensions produce one artifact per lens: e.g., `claim-inversion.md` (lens 07), `knowledge-audit.md` (lens 40), `rejected-paths.md` (lens 09), `scarcity.md` (lens 08)
- Verify all expected artifacts exist. If expected prism output artifacts are missing for one or more dimensions, report which dimensions are missing artifacts, then compose the report from the available dimensions and note the incomplete coverage.

### 2. Extract Findings Per Dimension

- For each dimension, read the terminal artifact (`synthesis.md` for full-prism, individual lens artifacts for portfolio)
- Extract definitive findings: each finding has an ID, severity/importance, title, and summary description
- For full-prism dimensions: use the synthesis document's definitive classification as the source of truth. The synthesis reconciles structural and adversarial analyses — use its final severity assignments.
- For portfolio dimensions: extract the key findings and conservation laws from each lens artifact. Assign severity using the Impact x Feasibility rubric: CRITICAL — directly undermines the target's core purpose. HIGH — degrades significant guarantees. MEDIUM — limited scope or conditional. LOW — informational.
- Assign unified finding IDs by dimension prefix: e.g., CON-01 for Consistency, VER-01 for Veracity, PLB-01 for Plausibility, FEA-01 for Feasibility. For custom dimensions, derive a 3-letter prefix from the dimension name.
- Record per-dimension: dimension name, finding count, finding count by severity, list of findings with IDs
- All severity labels must be computed from Impact x Feasibility: CRITICAL — flaws directly undermine the target's core purpose or stated goals. HIGH — flaws degrade significant guarantees or create major gaps. MEDIUM — flaws have limited scope or require specific conditions. LOW — informational findings or improvement opportunities.
- If a dimension's artifacts contain no extractable findings, still include the dimension in the report with a note that no significant findings were identified in it.

### 3. Identify Cross Dimensional Patterns

- Compare findings across dimensions to identify patterns that span multiple evaluation axes
- Look for: the same underlying issue surfacing in different dimensions (e.g., a feasibility constraint that also creates consistency gaps), systemic asymmetries (e.g., deep specification in one area vs shallow in another), reinforcing risks (multiple dimensions pointing to the same failure mode)
- Identify the core finding — the single deepest insight that explains the most findings across dimensions. In the VOX evaluation, this was the 'Mathematical-Social Bifurcation': one half deeply specified, the other left to assumption.
- Record: core_finding (title + description), cross_dimensional_patterns (array of { pattern, affected_dimensions, evidence })
- If no meaningful pattern spans multiple dimensions, report the per-dimension findings without a cross-dimensional core finding and note that the evaluation dimensions appear to be independent.

### 4. Compose Report

- Structure the report with clear sections. No methodology metadata — findings are presented as conclusions.
- Section: Executive Summary — what was evaluated (framed from `{evaluation_description}`), total findings by dimension and severity, and any framing the target needs. Present enumerable framing (scope, rollout stages, target components) as a compact table or bullet list under a `###` sub-heading, not a dense paragraph.
- Section: Overall Assessment — the bottom-line judgement, with a `### Verdict` sub-heading (render conditions/caveats as a bullet list) and a further `###` sub-heading for the headline risk or emphasis where it aids readability.
- Section: The Core Finding — expanded description of the deepest cross-dimensional insight, broken into labelled `###` sub-sections (one per facet or regime) with short paragraphs or bullets, plus a `### Testable prediction` sub-section.
- Section: Per-Dimension Findings — one subsection per dimension with: dimension description, severity summary table, key findings (each with ID, severity, title, description), and the dimension's most important insight
- Section: Cross-Cutting Patterns — patterns spanning multiple dimensions, with evidence from each
- Section: Corrections and Recommendations — actionable items grouped by priority (immediate, short-term, structural)
- Readability: in every section before Per-Dimension Findings, prefer `###` sub-sections, short paragraphs, and bullet lists or compact tables over large dense paragraphs. Break any multi-part point into labelled sub-sections or bullets rather than a single block of prose.
- Do NOT include: lens names, pipeline modes, pass descriptions, 'structural analysis found X then adversarial challenged Y then synthesis concluded Z'. These methodological details remain in the raw analysis artifacts for interested readers.
- The report must stand alone — a reader unfamiliar with prism or evaluation methodology should find it clear, evidence-based, and actionable

### 5. Verify Report

- Verify all finding IDs are unique and follow the dimension-prefix convention
- Verify severity counts in the executive summary match the per-dimension detail sections
- Verify the report contains no methodology metadata — no references to lenses, passes, pipeline modes, or analytical process steps

### 6. Present Results

- Read the `{evaluation_report}`. Extract the executive summary: total findings by dimension and severity, the core finding, and top-priority recommendations.
- Compile evaluation metrics: finding count by dimension, finding count by severity (Critical, High, Medium, Low), dimensions evaluated, number of prism runs triggered, total analysis artifacts produced.
- Present the evaluation results to the user in a structured format: evaluation summary with finding counts by dimension and severity, core finding highlight, top-priority recommendations, and document index with paths to all deliverables (`EVALUATION-REPORT.md`, `evaluation-plan.md`, and all dimension-specific analysis artifacts).
- List every artifact produced during the evaluation with its path, organised by dimension.

## Outputs

### evaluation_report

The consolidated [evaluation report](../resources/evaluation-report-template.md#evaluation-report-template)

#### artifact_filename

`EVALUATION-REPORT.md`

#### executive_summary

Overall assessment with finding counts and core insight

#### core_finding

Deepest cross-dimensional insight

#### dimension_findings

Per-dimension findings with severity tables

#### cross_cutting

Cross-dimensional patterns

#### recommendation_list

Prioritised corrections and recommendations

## Rules

### methodology-stripping

The report MUST NOT contain references to analytical methodology: no lens names (L12, claim-inversion, knowledge-audit, etc.), no pipeline mode names (full-prism, portfolio), no pass descriptions (structural pass, adversarial pass, synthesis), no process narratives ('the analysis first examined X then challenged Y'). Methodology details are available in the raw analysis artifacts for readers who want them.

### finding-id-convention

Finding IDs use a 3-letter dimension prefix followed by a dash and two-digit number: CON-01, VER-03, PLB-01, FEA-07. For custom dimensions, derive the prefix from the first letters or a natural abbreviation.
