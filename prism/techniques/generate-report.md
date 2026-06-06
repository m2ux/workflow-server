---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
  legacy_id: 6
---

## Capability

Generate a clean final report from prism analysis artifacts, stripping methodology semantics and presenting only definitive findings with unified identifiers

## Inputs

### pipeline-mode

The pipeline mode that produced the artifacts: 'single', 'full-prism', 'portfolio', or 'behavioral'. Determines which artifacts are authoritative.

### analysis-focus

*(optional)* The analytical goal that guided the analysis. Used for dimension-based finding ID prefixes and to determine whether findings warrant a Corrections Required section.

### all-artifact-paths

Array of all artifact file paths produced by prior passes. The worker reads these to extract findings.

### output-path

Directory to write REPORT.md

### target

Description of what was analysed — used in the report's Executive Summary scope statement

## Protocol

### 1. Identify Authoritative Source

- Determine which artifacts contain definitive findings based on {pipeline-mode}
- full-prism: the synthesis artifact in {all-artifact-paths} is authoritative (reconciles structural + adversarial). Read the structural and adversarial artifacts from {all-artifact-paths} only for location details and evidence the synthesis references.
- portfolio: all portfolio artifacts in {all-artifact-paths} are authoritative. If a portfolio-synthesis artifact exists, it takes priority for cross-lens findings.
- behavioral: the behavioral-synthesis artifact is authoritative. Individual behavioral artifacts in {all-artifact-paths} provide supporting detail.
- single: the structural artifact in {all-artifact-paths} is authoritative.

### 2. Read Artifacts

- Read each authoritative artifact from the filesystem using the paths in {all-artifact-paths}
- If one or more paths in {all-artifact-paths} do not exist on the filesystem, report which artifacts are missing; the orchestrator may need to re-run the corresponding pass.
- For full-prism, also read the structural and adversarial artifacts to extract location details and evidence for findings that the synthesis references by ID but does not fully reproduce
- For multi-unit analyses, read per-unit artifacts from their respective subdirectories

### 3. Extract Findings

- From each authoritative artifact, extract every finding with: original ID, title/description, severity, classification (fixable/structural/etc), and location reference
- For full-prism: use the Definitive Findings Table in the synthesis artifact. Severities in this table are post-reconciliation and final.
- For portfolio: findings are per-lens. Extract from each lens artifact's findings or problem list.
- For behavioral: extract from the behavioral-synthesis convergence analysis.
- For single: extract from the L12 findings table in the structural artifact.
- Also extract: core insights (deepest finding, conservation laws that survived challenge, convergence points) — these become the Core Finding section
- If the authoritative artifact contains no extractable findings, write a report noting that the analysis produced no findings — this is a valid outcome for clean code/text.

### 4. Enrich Blast Radius

- Check GitNexus availability via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md). If the target codebase is not indexed, skip blast radius enrichment.
- For each finding that references a specific symbol (function, class, module), use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)(target: symbol_name, direction: upstream) to compute the measured blast radius: direct callers (d=1), likely affected (d=2), affected execution flows, and affected modules.
- Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) on the finding's primary symbol to determine which execution flows it participates in — this adds process context to the finding location.
- Record enrichment data per finding: { direct_callers, affected_processes, affected_modules, process_names }. Findings without identifiable symbols are not enriched.

### 5. Strip Methodology

- Remove all analytical process language from extracted content
- Replace 'the structural analysis found X' with 'X'
- Replace 'ANALYSIS 1 claimed X but ANALYSIS 2 corrected to Y' with 'Y'
- Replace 'the conservation law predicts X is fixable' with 'Fixable' in the classification column
- Remove analysis scorecards, wrong-prediction tables, overclaim/underclaim categories, and dispute resolution narratives
- Retain the substance of findings — what breaks, where, how severe — but not the process by which they were identified

### 6. Assign Ids

- Create a mapping from source IDs to unified report IDs
- If {analysis-focus} provides dimension names or categories, use dimension-based prefixes (e.g., CON-xx for consistency, VER-xx for veracity)
- If no dimensions, use severity-ordered sequential numbering (e.g., F-01, F-02)
- For multi-unit analyses, prefix with a short unit identifier where needed to avoid collisions
- If two findings from different units or lenses map to the same report ID, add a unit or lens prefix to disambiguate and report the collision.
- Record the full mapping: report_id → { source_artifact_path, original_id, original_severity }

### 7. Compose Report

- Write the report in clean markdown with no methodology metadata in the front-matter
- Front-matter: Subject, Evaluation Date, Scope — no lens names, no pass counts, no model versions
- Executive Summary: 2-3 sentences on scope + findings count table by severity + statement of core finding
- Core Finding (if applicable): the deepest structural insight, stated as a definitive conclusion with its testable prediction
- Findings sections: organised by severity (Critical, High, Medium, Low). Each finding has: ID, severity, description (as a factual statement), classification, and blast radius annotation where graph data is available (e.g., '14 direct callers, 3 execution flows, 2 modules')
- Corrections Required (if applicable): actionable items derived from findings
- Traceability: appendix table mapping each report ID to source artifact and original ID
- The Executive Summary finding count must exactly match the number of findings in the body. Counting errors are a format violation.

### 8. Write Artifact

- Write the complete report as {report} into {output-path}

## Outputs

### report

Clean final [report](../resources/final-output-template.md#reportmd-template) artifact

#### artifact

`REPORT.md`

#### report_path

Full filesystem path to REPORT.md

#### finding_count

Total findings by severity

#### core_finding

Summary of the core finding (if any)

## Rules

### complete-extraction

Every finding in the authoritative artifact must appear in the report. Omitting findings is a report integrity violation.

### no-reassignment

Severities are inherited from the authoritative source. The report worker does not second-guess the analytical pipeline's severity assignments.

### factual-voice

All findings are written in factual declarative voice. No attribution to analytical process, passes, or lenses.

### traceability-completeness

The traceability appendix must have an entry for every finding ID in the report. Missing entries are a report integrity violation.

### blast-radius-is-evidence

Graph-backed blast radius is reported alongside the finding as additional evidence for the reader but does not override the severity from the authoritative source. Blast radius data is omitted when GitNexus is unavailable or when a finding does not reference an identifiable symbol.
