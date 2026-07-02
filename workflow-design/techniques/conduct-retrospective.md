---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
---

## Capability

Conduct a session retrospective: analyse the non-checkpoint user interactions to surface friction points and produce a prioritized list of workflow improvements, written into the session's close-out document.

## Outputs

### retrospective_document

Session [retrospective](../../work-package/resources/workflow-retrospective.md#output-section-template) with prioritized lessons learned, written as the `## Workflow Retrospective` section of the close-out document rather than a standalone artifact.

#### artifact

COMPLETE.md

## Protocol

### 1. Capture History

- If a metadata or session-history source exists, capture the session interaction history.

### 2. Conduct Retrospective

- Count total user messages; separate prompted checkpoint responses from substantive interactions (clarifications, corrections, process questions, frustration signals, feature requests, skip requests)
- Categorize the substantive messages by signal type and map each to the specific workflow section it implicates
- Identify root causes, determine pattern frequency, and formulate prioritized recommendations: high (repeated corrections, frustration), medium (single clarifications), low (edge cases)
- Write the `{retrospective_document}` as the `## Workflow Retrospective` section of `COMPLETE.md` (update in place — the close-out document is the single terminal artifact) using the [workflow-retrospective](../../work-package/resources/workflow-retrospective.md#output-section-template) section template — omit the PR reference and report activities as a count out of the design workflow's activities — via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md). Include only the signal categories that have content.

## Rules

### retrospective-honest

Be honest about what worked and what didn't — avoid generic positive statements.

### skip-if-trivial

Skip the retrospective when only prompted responses occurred (no clarifications, corrections, or process questions), or the session was trivial.

### history-private

Session history is private and is never committed to the repository.
