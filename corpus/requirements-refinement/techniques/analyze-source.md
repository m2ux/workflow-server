---
metadata:
  version: 1.6.3
---

## Capability

Produce a structured analysis of the requirement changes the source documents imply, with a source-coverage matrix and the heading of each contributing passage.

## Inputs

### target_doc_exists

`true` when the target specification already exists and is being augmented; `false` when it is created from scratch.

### analysis_feedback

*(optional)* Text the user typed naming what an earlier analysis of these sources misread, missed, or left unread. Unset on a first analysis.

## Outputs

### requirements_analysis

Structured analysis of the requirement changes derived from the source documents, including the source-coverage matrix and, on each new or updated requirement, the source identifier and verbatim heading of each contributing passage.

#### artifact

`requirements-analysis.md`

#### audience

`human`

#### source_coverage_matrix

Mapping of each section of each source to the requirement identifier(s) it is covered by, naming the source and the verbatim heading of that section, with out-of-scope sections marked.

### requirements_analysis_path

Absolute path to the written analysis report.

## Protocol

### 1. Read Sources

- Read every document named in `{classified_sources}`.
  > When `{target_doc_exists}`, also read the current specification at `{target_doc_path}`.
- Where two sources bear on the same subject, carry both readings forward — a disagreement between them is a conflict recorded in `{requirements_analysis}`, not a value to pick between here.

### 2. Identify Requirement Changes

- Extract explicit requirement statements, modifications, additions, and deprecations from each source document, and derive reasonably-implied requirements.
- Map each change to a requirement identifier per the [Rules](../resources/requirements-analysis-report.md#rules), in the category [Identifier Schemes](../resources/specification-protocol.md#identifier-schemes) gives it.
- For each new or updated requirement, record each contributing passage the [Rules](../resources/requirements-analysis-report.md#rules) require in `{requirements_analysis}`.
- Note ambiguities and conflicts in `{requirements_analysis}`.
  > When `{analysis_feedback}` is bound, the analysis addresses each point it names: a misreading is corrected, and a missed or unread passage is read and mapped.

### 3. Create Source References

- Assign each entry in `{classified_sources}` its source reference per the [Rules](../resources/requirements-analysis-report.md#rules).
- Follow [Source Reference Format](../resources/specification-protocol.md#source-reference-format) for the form each source type takes.

### 4. Complete Source Coverage

- Re-walk each source document section by section per [Source Coverage](../resources/validation-rubric.md#source-coverage).
- Add any normative statement that has no mapped requirement as a new requirement.

### 5. Record the Coverage Matrix

- Record each section of each source against the requirement(s) it maps to in `{requirements_analysis.source_coverage_matrix}`, per [Source Coverage Matrix](../resources/requirements-analysis-report.md#source-coverage-matrix).

### 6. Compile Analysis Report

- Write `{requirements_analysis}` to `{planning_folder_path}` using the [Template](../resources/requirements-analysis-report.md#template) and its [Rules](../resources/requirements-analysis-report.md#rules); capture its written location as `{requirements_analysis_path}`.

## Rules

### analysis-records-intended-changes-only

The analysis records intended changes; it does not modify the specification.
