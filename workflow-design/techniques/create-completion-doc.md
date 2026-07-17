---
metadata:
  version: 1.0.1
---

## Capability

Create the completion summary for the design session — delivery, links to design decisions elsewhere, scope outcome, and known limitations — recorded in the planning folder.

## Inputs

### operation_type

The classified operation. When `update`, the summary frames the delivery as changes to an existing workflow; when `create`, as a newly created workflow.

## Outputs

### completion_document

[Completion summary](../resources/completion-artifact.md): what was delivered, links to decisions/assumptions, scope outcome, and known limitations.

#### artifact

COMPLETE.md

## Protocol

### 1. Summarize Delivery

- Summarize what the session delivered: the workflow created, or the activities, techniques, and resources changed on an existing workflow

### 2. Link Design Decisions

- Link the planning README Design Decisions section and the assumptions log — do not restate design-decision / alternatives essays in COMPLETE.md
- Record here only decisions made during drafting that have no other home

### 3. Note Drift And Limitations

- Compare delivered files against the confirmed `{scope_manifest}` and note any drift; list known limitations and deferred follow-ups

### 4. Persist Completion Document

- Follow the [Completion Artifact Guide](../resources/completion-artifact.md#template) and record `{completion_document}` in `{planning_folder_path}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md)
