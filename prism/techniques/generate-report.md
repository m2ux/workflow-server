---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 6
  legacy_id: 6
---

## Capability

Generate the final artifacts from prism analysis passes: a clean, methodology-free REPORT.md for the reader, and a detailed DEFINITIVE-FINDINGS.md carrying the full per-finding field set plus the surviving conservation laws — the stable contract consumer workflows build on without re-reading raw pass artifacts. Both are produced from a single extraction so findings and IDs stay identical across them.

## Inputs

### pipeline_mode

The pipeline mode that produced the artifacts: 'single', 'full-prism', 'portfolio', or 'behavioral'. Determines which artifacts are authoritative.

### analysis_focus

*(optional)* The analytical goal that guided the analysis. When it names dimensions or categories (e.g. an evaluation's "consistency, veracity" or an audit's domain names), the report and definitive findings use dimension-based finding ID prefixes derived from them — CON-xx, VER-xx, and so on (see step 6). A triggering workflow that wants domain-prefixed IDs supplies the names here rather than re-assigning IDs downstream. Also used to determine whether findings warrant a Corrections Required section.

### all_artifact_paths

Array of filesystem paths to the analysis artifacts available for this report.

### target_description

Description of what was analysed — used in the report's Executive Summary scope statement

## Protocol

### 1. Identify Authoritative Source

- Determine which artifacts contain definitive findings based on `{pipeline_mode}`
- full-prism: the synthesis artifact in `{all_artifact_paths}` is authoritative (reconciles structural + adversarial). Read the structural and adversarial artifacts from `{all_artifact_paths}` only for location details and evidence the synthesis references.
- portfolio: all portfolio artifacts in `{all_artifact_paths}` are authoritative. If a portfolio-synthesis artifact exists, it takes priority for cross-lens findings.
- behavioral: the behavioral-synthesis artifact is authoritative. Individual behavioral artifacts in `{all_artifact_paths}` provide supporting detail.
- single: the structural artifact in `{all_artifact_paths}` is authoritative.

### 2. Read Artifacts

- Read each authoritative artifact from the filesystem using the paths in `{all_artifact_paths}`
- If one or more paths in `{all_artifact_paths}` do not exist on the filesystem, report which artifacts are missing.
- For full-prism, also read the structural and adversarial artifacts to extract location details and evidence for findings that the synthesis references by ID but does not fully reproduce
- For multi-unit analyses, read per-unit artifacts from their respective subdirectories

### 3. Extract Findings

- From each authoritative artifact, extract every finding with its full field set: original ID, title, description, severity, classification (fixable/structural/etc), location reference, **impact** (the consequence if unaddressed), and **recommendation** (the concrete corrective action). REPORT.md later carries only a subset of these fields; DEFINITIVE-FINDINGS.md carries them all — so extract the full set once, here.
- For full-prism: use the Definitive Findings Table in the synthesis artifact. Severities in this table are post-reconciliation and final. For each finding, also capture its **adversarial confirmation** — how the adversarial pass confirmed or corrected it (e.g. "confirmed", "severity raised from Medium", "underclaim promoted") — stated as a factual outcome, not a narrative.
- For portfolio: findings are per-lens. Extract from each lens artifact's findings or problem list.
- For behavioral: extract from the behavioral-synthesis convergence analysis.
- For single: extract from the L12 findings table in the structural artifact.
- Also extract: core insights (deepest finding, convergence points) — these become the Core Finding section — and the conservation law(s) and meta-law that **survived** the adversarial challenge. Record each surviving law as a falsifiable constraint with its current operating point and shift prediction. Laws the adversarial pass rejected are discarded, not recorded.
- If the authoritative artifact contains no extractable findings, write a report noting that the analysis produced no findings — this is a valid outcome for clean code/text.

### 4. Enrich Blast Radius

- Check GitNexus availability via [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md). If the target codebase is not indexed, skip blast radius enrichment.
- For each finding that references a specific symbol (function, class, module), take the symbol the finding references as `{$finding_symbol}` and use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)`(target: {finding_symbol}, direction: 'upstream')` to compute the measured blast radius: direct callers (d=1), likely affected (d=2), affected execution flows, and affected modules.
- Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) on the finding's primary symbol to determine which execution flows it participates in — this adds process context to the finding location.
- Record enrichment data per finding: `{ direct_callers, affected_processes, affected_modules, process_names }`. Findings without identifiable symbols are not enriched.  
  > Graph-backed blast radius is reported alongside the finding as additional evidence for the reader but does not override the severity from the authoritative source. Blast radius data is omitted when GitNexus is unavailable or when a finding does not reference an identifiable symbol.

### 5. Strip Methodology

- Remove all analytical process language from extracted content
- Replace 'the structural analysis found X' with 'X'
- Replace 'ANALYSIS 1 claimed X but ANALYSIS 2 corrected to Y' with 'Y'
- Replace 'the conservation law predicts X is fixable' with 'Fixable' in the classification column
- Remove analysis scorecards, wrong-prediction tables, overclaim/underclaim categories, and dispute resolution narratives
- Retain the substance of findings — what breaks, where, how severe — but not the process by which they were identified

### 6. Assign Ids

- Create a mapping from source IDs to unified report IDs
- If `{analysis_focus}` provides dimension names or categories, use dimension-based prefixes (e.g., CON-xx for consistency, VER-xx for veracity)
- If no dimensions, use severity-ordered sequential numbering (e.g., F-01, F-02)
- For multi-unit analyses, prefix with a short unit identifier where needed to avoid collisions
- If two findings from different units or lenses map to the same report ID, add a unit or lens prefix to disambiguate and report the collision.
- Record the full mapping: `report_id → { source_artifact_path, original_id, original_severity }`

### 7. Compose Report

- Write the report in clean markdown with no methodology metadata in the front-matter
- Front-matter: Subject, Evaluation Date, Scope — no lens names, no pass counts, no model versions
- Executive Summary: 2-3 sentences on scope (using `{target_description}`) + findings count table by severity + statement of core finding
- Core Finding (if applicable): the deepest structural insight, stated as a definitive conclusion with its testable prediction
- Findings sections: organised by severity (Critical, High, Medium, Low). Each finding has: ID, severity, description (as a factual statement), classification, and blast radius annotation where graph data is available (e.g., '14 direct callers, 3 execution flows, 2 modules')
- Corrections Required (if applicable): actionable items derived from findings
- Traceability: appendix table mapping each report ID to source artifact and original ID
- The Executive Summary finding count must exactly match the number of findings in the body. Counting errors are a format violation.

### 8. Write Artifact

- Write the complete report as `{analysis_report}` into `{output_path}`, capturing its full filesystem path as `{report_path}`

### 9. Write Definitive Findings

- Write the detailed [definitive findings](../resources/definitive-findings-template.md#definitive-findingsmd-template) document as `{definitive_findings}` into `{output_path}`, capturing its full filesystem path as `{definitive_findings_path}`
- Include every finding from step 3 with its complete field set — Severity, Classification, Description, Impact, Location, Recommendation, Blast radius (where graph data exists), and Adversarial confirmation (full-prism only). Finding IDs are the same unified report IDs assigned in step 6, so DEFINITIVE-FINDINGS.md and REPORT.md agree exactly.
- Add the Conservation Laws & Design Trade-offs section from the surviving laws captured in step 3 (present for full-prism and behavioral). Omit the section when no law survived.
- The voice remains factual: adversarial confirmation and conservation laws are recorded as evidence and constraints, never as process narration (no "ANALYSIS 1", "the adversarial pass", scorecards, or overclaim/underclaim tables).

## Outputs

### analysis_report

Clean final [report](../resources/final-output-template.md#reportmd-template) artifact

#### artifact

`REPORT.md`

#### finding_count

Total findings by severity

#### core_finding

Summary of the core finding (if any)

### report_path

Full filesystem path to `REPORT.md`

### definitive_findings

Detailed [definitive findings](../resources/definitive-findings-template.md#definitive-findingsmd-template) artifact carrying the full per-finding field set (Impact, Recommendation, Adversarial confirmation, and more) and the surviving conservation laws. The stable contract consumer workflows read instead of the raw pass artifacts.

#### artifact

`DEFINITIVE-FINDINGS.md`

### definitive_findings_path

Full filesystem path to `DEFINITIVE-FINDINGS.md`

## Rules

### complete-extraction

Every finding in the authoritative artifact must appear in both REPORT.md and DEFINITIVE-FINDINGS.md with the same unified report ID. Omitting a finding from either, or letting the two disagree on IDs or severities, is a report integrity violation.

### methodology-stripped

REPORT.md contains no reference to the analytical process. Forbidden phrasing includes 'the structural analysis found', 'the adversarial pass identified', 'ANALYSIS 1', 'ANALYSIS 2', 'conservation law' (unless the finding itself describes a conserved property), 'meta-law', 'analysis scorecard', 'dispute resolution', 'overclaim', 'underclaim', 'wrong prediction', and 'the synthesis determined'. The reader sees only definitive conclusions. (DEFINITIVE-FINDINGS.md is governed instead by `definitive-findings-factual`, which permits conservation laws and adversarial-confirmation evidence.)

### definitive-findings-complete

DEFINITIVE-FINDINGS.md carries every finding with its full field set — Severity, Classification, Description, Impact, Location, Recommendation, Blast radius (where graph data exists), and Adversarial confirmation (full-prism only) — plus the surviving conservation laws for full-prism and behavioral runs. A finding missing Impact or Recommendation, or a surviving law absent from the trade-offs section, is a contract violation: consumers rely on these fields and must never fall back to reading the raw pass artifacts.

### definitive-findings-factual

DEFINITIVE-FINDINGS.md may record conservation laws and per-finding adversarial confirmation as evidence, but still in factual voice. It states outcomes ('severity raised from Medium', 'confirmed') and constraints, never process narration — no 'ANALYSIS 1', 'the adversarial pass', scorecards, or overclaim/underclaim tables. Conservation laws the adversarial pass rejected never appear.

### core-finding-promoted

When the authoritative artifact identifies a deepest finding (full-prism synthesis) or convergence point (behavioral synthesis), it is promoted to the Core Finding section with its testable prediction, stated as the central structural insight with the discovery narrative stripped.

### multi-unit-consolidated

For a multi-unit analysis, the report consolidates findings across all units; finding IDs are prefixed by unit where ambiguity would otherwise arise, and a pattern appearing in multiple units is surfaced as a systemic finding.

### severities-inherited

Severities are inherited from the authoritative source. The report worker does not second-guess the analytical pipeline's severity assignments.

### factual-voice

All findings are written in factual declarative voice. No attribution to analytical process, passes, or lenses.

### traceability-completeness

The traceability appendix in each artifact (REPORT.md and DEFINITIVE-FINDINGS.md) must have an entry for every finding ID it presents. Missing entries are a report integrity violation.
