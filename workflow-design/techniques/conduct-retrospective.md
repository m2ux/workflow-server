---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Conduct a session retrospective: analyse the non-checkpoint user interactions to surface friction points and produce a prioritized list of workflow improvements, recorded in the planning folder.

## Outputs

### retrospective_document

Session [retrospective](../../work-package/resources/workflow-retrospective.md#output-document-template) with prioritized lessons learned.

#### artifact

workflow-retrospective.md

## Protocol

### 1. Capture History

- If a metadata or session-history source exists, capture the session interaction history.

### 2. Conduct Retrospective

- Count total user messages; separate prompted checkpoint responses from substantive interactions (clarifications, corrections, process questions, frustration signals, feature requests, skip requests)
- Categorize the substantive messages by signal type and map each to the specific workflow section it implicates
- Identify root causes, determine pattern frequency, and formulate prioritized recommendations: high (repeated corrections, frustration), medium (single clarifications), low (edge cases)
- Create the `{retrospective_document}` from the [workflow-retrospective](../../work-package/resources/workflow-retrospective.md) template — omit the PR row and report activities as a count out of the design workflow's activities — and record it in `{planning_folder_path}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md)

## Rules

### retrospective-honest

Be honest about what worked and what didn't — avoid generic positive statements.

### skip-if-trivial

Skip the retrospective when only prompted responses occurred (no clarifications, corrections, or process questions), or the session was trivial.

### history-private

Session history is private and is never committed to the repository.
