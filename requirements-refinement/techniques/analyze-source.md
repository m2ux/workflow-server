---
metadata:
  version: 1.0.0
---

## Capability

Parse a source document — a meeting transcript or an unstructured document — against the current specification and produce a structured requirements analysis report identifying new, updated, and deprecated requirements.

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

### 4. Compile Analysis Report

- Write `{requirements_analysis}` to `{planning_folder_path}` using the [requirements-analysis-report](../resources/requirements-analysis-report.md) structure: source reference, new / updated / deprecated requirements, document updates required, quality issues, and implementation notes.

## Output

### requirements_analysis

Structured analysis of the requirement changes derived from the source document.

#### artifact

`requirements-analysis.md`

## Rules

### analysis-records-intended-changes-only

The analysis records intended changes; it does not modify the specification.
