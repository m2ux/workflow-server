---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Create the completion summary for the design session — what workflow was created or updated, the key design decisions and the alternatives rejected, the scope outcome, and known limitations — recorded in the planning folder.

## Outputs

### completion_document

[Completion summary](../resources/completion-artifact.md) of the workflow delivered, the design decisions made, and known limitations.

#### artifact

COMPLETE.md

## Protocol

### 1. Create Completion Summary

- Summarize what the session delivered: the workflow created, or the activities, techniques, and resources changed on an existing workflow
- Record the key design decisions and the alternatives considered and rejected, drawing on the planning README's Design Decisions section
- Compare the delivered files against the confirmed `{scope_manifest}` and note any drift; list known limitations and deferred follow-ups
- Follow the [completion-artifact](../resources/completion-artifact.md) template and record `{completion_document}` in `{planning_folder_path}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md)
