---
metadata:
  version: 1.1.0
---

## Capability

Parse a source document — a meeting transcript or an unstructured document — against the current specification and produce a structured requirements analysis report identifying new, updated, and deprecated requirements, with a source-coverage matrix tracing every normative statement to a requirement.

## Protocol

### 1. Read Sources

- Read the source document at `{source_path}`; when `{target_doc_exists}`, also read the current specification at `{target_doc_path}`.

### 2. Identify Requirement Changes

- Extract explicit requirement statements, modifications, additions, and deprecations from the source document, and derive reasonably-implied requirements.
- Map each change to an existing requirement identifier (`REQ-F###` or `REQ-NF###`) where one applies; otherwise mark it as a new requirement.
- Note ambiguities and conflicts for the quality-issues section.

### 3. Create Source Reference

- When `{source_type}` is `meeting`, assign a meeting source reference (`SRC-MTG###`) with participant initials for attribution.
- When `{source_type}` is `document`, assign a document source reference (`SRC-DOC###`) credited to the document's author.
- Follow [specification-protocol](../resources/specification-protocol.md#source-reference-format) for both forms.

### 4. Completeness Sweep

- Re-walk the source document section by section as a completeness critic: for every normative statement (a `SHALL`/`MUST`/`SHOULD`/`MAY` obligation, constraint, or rule), confirm it maps to an identified requirement.
- Add any normative statement that has no mapped requirement as a new requirement.
- Record each source section against the requirement(s) it maps to as the source-coverage matrix, marking any section with no obligation as out of scope.

### 5. Compile Analysis Report

- Write `{requirements_analysis}` to `{planning_folder_path}` using the [requirements-analysis-report](../resources/requirements-analysis-report.md) structure: source reference, new / updated / deprecated requirements, the [source coverage matrix](../resources/requirements-analysis-report.md#source-coverage-matrix), document updates required, quality issues, and implementation notes.

## Output

### requirements_analysis

Structured analysis of the requirement changes derived from the source document, including the source-coverage matrix.

#### artifact

`requirements-analysis.md`

#### source_coverage_matrix

Mapping of each source section to the requirement identifier(s) it is covered by, with out-of-scope sections marked.

## Rules

### analysis-records-intended-changes-only

The analysis records intended changes; it does not modify the specification.

### every-normative-statement-is-mapped

Every normative statement in the source document maps to at least one requirement in the source-coverage matrix.
