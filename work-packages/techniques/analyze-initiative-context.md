---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Perform completion or context analysis for a multi-package initiative

## Inputs

### analysis_type

Type of analysis to perform: 'completion' or 'context'.

## Protocol

### 1. Select Analysis Type

- Read `{analysis_type}` to determine whether this is `completion` (continuing) or `context` (new)  
  > If the user is unsure which applies, scan `{planning_root}` for existing planning artifacts — found suggests `completion`, none suggests `context`.

### 2. Perform Completion Analysis

- Apply the [completion analysis](../resources/completion-analysis-guide.md#analysis-steps) procedure
- Locate existing planning artifacts in `{planning_root}`  
  > If `{analysis_type}` is `completion` but no prior artifacts are found, switch to context analysis and note that no prior work was found.
- Assess completion state of each previously identified work package
- Identify changes since last session from git log and issue trackers

### 3. Perform Context Analysis

- Apply the [context analysis](../resources/context-analysis-guide.md#analysis-steps) procedure
- Understand the domain, codebase, and technology stack
- Identify cross-cutting concerns: shared dependencies, common infrastructure, ordering constraints
- Assess external context: related issues, documentation, deadlines

### 4. Document Analysis

- Write `{analysis_document}` to `{planning_folder_path}` using the [completion analysis findings](../resources/completion-analysis-guide.md#4-document-findings) or [context analysis findings](../resources/context-analysis-guide.md#5-document-findings) section matching `{analysis_type}`
- Distil the documented findings into `{key_findings}` and the suggested approach into `{planning_recommendation}`

### 5. Present Findings

- Summarize `{key_findings}` for user review

## Outputs

### analysis_document

Analysis document with findings and recommendations, persisted as [01-COMPLETION-ANALYSIS.md](../resources/completion-analysis-guide.md#4-document-findings) (completion) or [02-CONTEXT-ANALYSIS.md](../resources/context-analysis-guide.md#5-document-findings) (context)

#### artifact

`01-COMPLETION-ANALYSIS.md` (when `analysis_type` is completion) / `02-CONTEXT-ANALYSIS.md` (when `analysis_type` is context)

### key_findings

Summary of analysis findings

### planning_recommendation

Suggested approach for planning and prioritization

## Rules

### type-determines-method

`{analysis_type}` determines which analysis method applies — never mix them

### document-everything

All findings must be captured in the analysis document, not just presented verbally
