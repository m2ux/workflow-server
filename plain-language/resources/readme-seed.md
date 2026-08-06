---
name: readme-seed
description: Plain-language planning-folder README seed profile — Progress inventory, classifier vocabulary, and mode-exclusion map for create-readme.
metadata:
  order: 6
---

# Plain Language README Seed

Fill data for [create-readme](../../meta/techniques/workflow-engine/create-readme.md). Layout and policy live in [Planning Folder README Guide](../../meta/resources/planning-readme.md) ([Template](../../meta/resources/planning-readme.md#template)).

## Classifier

Header-line kind labels: `Author`, `Rewrite`, `Audit`.

Lifecycle **Status** values: `Profiling`, `Drafting`, `Evaluating`, `Complete`.

## Links defaults

| Resource | Link shape |
|----------|------------|
| Source document | `{source_document_path}` |
| Delivered document | `{output_path}` |

## Progress inventory

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Intake and profile | Operation, reader profile, content selection | 10-20m | ⬚ |
| 2 | [Document profile](document-profile.md) | Readers, purpose, context, content | 10-20m | ⬚ |
| 3 | Source analysis | Findings against the existing document | 15-30m | ⊘ |
| 4 | Draft | The plain-language document | 20-60m | ⬚ |
| 5 | [Evaluation report](evaluation-report.md) | Verdict by principle, open issues | 15-30m | ⬚ |
| 6 | [ISO checklist](iso-checklist.md) | Completed Annex B checklist | 10-15m | ⬚ |
| 7 | Delivery | The document written to its output path | 5-10m | ⬚ |

Initial Status icons are from [Status vocabulary](../../meta/resources/planning-readme.md#status-vocabulary). The source-analysis row starts cancelled/N/A because only rewrite and audit runs produce it.

## Row ownership

Which activity owns which rows, per [row-ownership map](../../meta/resources/planning-readme.md#row-ownership-map). Values are Item labels.

| @ | Rows |
|---|------|
| 01 | Intake and profile · Document profile |
| 02 | Source analysis |
| 03 | Draft |
| 04 | Evaluation report · ISO checklist |
| 05 | Delivery |

## Mode exclusion map

Mode key: `{operation_type}` (`author` | `rewrite` | `audit`).

### Author

Leave Progress Status as authored; the source-analysis row stays cancelled/N/A.

### Rewrite

Flip the source-analysis row from cancelled/N/A to pending. Leave the other rows as authored.

### Audit

Flip the source-analysis row from cancelled/N/A to pending. The audit run produces the source analysis as its terminal record; set cancelled/N/A on the draft, ISO checklist, and delivery rows — an audit authors no document and delivers nothing but the analysis.
