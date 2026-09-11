---
metadata:
  version: 1.4.0
---

## Capability

Parse the source documents — meeting transcripts and unstructured documents — against the current specification and produce a structured requirements analysis report identifying new, updated, and deprecated requirements, with a source-coverage matrix tracing every normative statement to a requirement.

## Inputs

### classified_sources

The source documents paired with their classifications, each `{ path, type }`.

### target_doc_exists

`true` when the target specification already exists and is being augmented; `false` when it is created from scratch.

## Outputs

### requirements_analysis

Structured analysis of the requirement changes derived from the source documents, including the source-coverage matrix.

#### artifact

`requirements-analysis.md`

#### audience

`human`

#### source_coverage_matrix

Mapping of each section of each source to the requirement identifier(s) it is covered by, naming the source the section belongs to, with out-of-scope sections marked.

### requirements_analysis_path

Absolute path to the written analysis report.

## Protocol

### 1. Read Sources

- Read every document named in `{classified_sources}`; when `{target_doc_exists}`, also read the current specification at `{target_doc_path}`.
- Where two sources bear on the same subject, carry both readings forward — a disagreement between them is a conflict for the quality-issues section, not a value to pick between here.

### 2. Identify Requirement Changes

- Extract explicit requirement statements, modifications, additions, and deprecations from each source document, and derive reasonably-implied requirements.
- Map each change to an existing requirement identifier (`REQ-F###` or `REQ-NF###`) where one applies; otherwise mark it as a new requirement.
- Note ambiguities and conflicts for the quality-issues section.

### 3. Create Source References

- Assign one source reference per entry in `{classified_sources}`, so every document the analysis draws on is citable in its own right.
- For an entry whose `type` is `meeting`, assign a meeting source reference (`SRC-MTG###`) with participant initials for attribution.
- For an entry whose `type` is `document`, assign a document source reference (`SRC-DOC###`) credited to that document's author.
- Follow [specification-protocol](../resources/specification-protocol.md#source-reference-format) for both forms.

### 4. Complete Source Coverage

- Re-walk each source document section by section as a completeness critic: for every normative statement per [Source Coverage](../resources/validation-rubric.md#source-coverage), confirm it maps to an identified requirement.
- Add any normative statement that has no mapped requirement as a new requirement.

### 5. Record the Coverage Matrix

- Record each section of each source against the requirement(s) it maps to in `{requirements_analysis.source_coverage_matrix}`, naming the source the section belongs to and marking any section with no obligation as out of scope.

### 6. Compile Analysis Report

- Write `{requirements_analysis}` to `{planning_folder_path}` using the [Template](../resources/requirements-analysis-report.md#template) and its [Rules](../resources/requirements-analysis-report.md#rules): a source reference per source, new / updated / deprecated requirements, the [source coverage matrix](../resources/requirements-analysis-report.md#source-coverage-matrix), document updates required, quality issues, and implementation notes; capture its written location as `{requirements_analysis_path}`.

## Rules

### analysis-records-intended-changes-only

The analysis records intended changes; it does not modify the specification.
