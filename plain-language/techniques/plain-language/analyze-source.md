---
metadata:
  version: 1.0.0
---

## Capability

Audit an existing document against the plain-language principles and record where it fails its readers, with the strengths a rewrite must preserve.

## Inputs

### source_document_path

Path to the existing document to analyze.

### document_profile

The settled reader, purpose, and context the document is analyzed against.

## Outputs

### source_analysis

The per-finding record and the strengths inventory, shaped by [Template](../../resources/source-analysis.md#template).

#### artifact

`source-analysis.md`

### finding_count

Number of plain-language findings recorded against the document.

## Protocol

### 1. Read the Document as Its Reader

- Read `{source_document_path}` with the readers' understanding, purpose, and context from `{document_profile}` in mind — the profile governs the analysis, not the writer's sense of the prose

### 2. Record Findings Against the Guidelines

- Walk the document against the four principles in [Principles](../../resources/plain-language-standard.md#principles), recording each failure with its passage, its principle, the guideline it breaches, and the change that fixes it — per [Findings](../../resources/source-analysis.md#template)
- Cite the guideline every finding breaches; an unanchored complaint is not a finding

### 3. Record the Strengths

- Inventory what the document already does well — the don't-break list a rewrite preserves — per [Strengths](../../resources/source-analysis.md#template)

### 4. Count the Findings

- Set `{finding_count}` to the number of rows in the findings table; zero when the document already meets the principles
