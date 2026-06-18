---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Capture the operation type — create, update, or review — and establish the corresponding mode and target: load the existing workflow definition and structural inventory as a baseline (update/review), categorize the requested change (update), summarize design intent (create), and present the classification for confirmation.

## Protocol

### 1. Load Baseline

- For update or review mode, load the full workflow definition for `{target_workflow_id}` (`workflow.toon` + per-activity detail) via `list_workflows` and `get_workflow`
- Build a structural inventory of the target: file counts and entity counts (activities, techniques, resources, checkpoints, transitions)
- Present the loaded structure to the user as the scope-confirmation surface

### 2. Parse Change Request

- In update mode, categorize the change request derived from the `{user_description}`: add/modify activity, technique, resource, metadata, or structural refactor (see [update-mode-guide](../resources/update-mode-guide.md))

### 3. Classify Operation

- Accept the `{user_description}` and summarize key design intent — purpose, domain, rough activity count, and constraints
- Classify as create or update based on whether a `{target_workflow_id}` is supplied: an existing-workflow reference signals update, otherwise create
- Present the classification and distilled intent for confirmation
