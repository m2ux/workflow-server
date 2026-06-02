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

### analysis-type

Type of analysis to perform: 'completion' or 'context'.

### planning-folder

The [planning folder](../resources/planning-folder-template.md#folder-location) for storing the analysis document

## Protocol

### 1. Select Analysis Type

- Present the analysis-type-selection checkpoint to determine if this is continuing or new
- Set analysis_type variable based on user selection

### 2. Perform Completion Analysis

- Use attached [completion-analysis-guide](../resources/completion-analysis-guide.md) (completion-analysis-guide) for the analysis procedure
- Locate existing planning artifacts in .engineering/artifacts/planning/
- Assess completion state of each previously identified work package
- Identify changes since last session from git log and issue trackers
- For completion analysis, always check for existing planning artifacts before assuming fresh start

### 3. Perform Context Analysis

- Use attached [context-analysis-guide](../resources/context-analysis-guide.md) (context-analysis-guide) for the analysis procedure
- Understand the domain, codebase, and technology stack
- Identify cross-cutting concerns: shared dependencies, common infrastructure, ordering constraints
- Assess external context: related issues, documentation, deadlines

### 4. Document Analysis

- Create the analysis-document in the planning-folder using the appropriate template
- Set analysis_document variable to the document path

### 5. Present Findings

- Summarize key findings for user review
- Present the analysis-confirmed checkpoint

## Outputs

### analysis-document

Analysis document with findings and recommendations, persisted as 01-COMPLETION-ANALYSIS.md (completion) or 02-CONTEXT-ANALYSIS.md (context)

- **analysis_type**: completion or context
- **key_findings**: Summary of analysis findings
- **recommendation**: Suggested approach for planning and prioritization

## Rules

### type-determines-method

The analysis_type variable determines which analysis method to use — never mix them

### document-everything

All findings must be captured in the analysis document, not just presented verbally

## Errors

### ambiguous_type

**Cause:** User is unsure whether this is continuing or new

**Recovery:** Check for existing planning artifacts — if found, suggest completion analysis; if not, suggest context analysis

### no_existing_artifacts

**Cause:** Completion analysis selected but no prior artifacts found

**Recovery:** Switch to context analysis and note that no prior work was found
