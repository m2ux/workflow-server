---
metadata:
  version: 2.0.0
---

## Capability

Capture the operation type — create, update, or review — and establish the corresponding mode and target: load the existing workflow definition and structural inventory as a baseline (update/review), categorize the requested change (update), summarize design intent (create), and present the classification for confirmation.

## Outputs

### operation_type

The classified operation: `create`, `update`, or `review`. Derived from whether a `{target_workflow_id}` is supplied (an existing-workflow reference signals update or review; its absence signals create) and from whether the request is an audit (review) or a change (update). Interpolated into the mode-confirmation checkpoint message.

### is_update_mode

Whether update mode is active — true when `{operation_type}` is `update`.

### is_review_mode

Whether review mode is active — true when `{operation_type}` is `review`.

### workflow_id

The id of the workflow being created or updated.

### target_workflow_id

The id of the existing workflow to modify (update) or audit (review); unset in create mode.

## Protocol

### 1. Load Baseline

- For update or review mode, load the committed workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and source the target's definition for `{target_workflow_id}` from the workflow-server context the orchestrator supplies — the executing worker does not call `get_workflow` directly
- Build a structural inventory of the target: file counts and entity counts (activities, techniques, resources, checkpoints, transitions)
- Present the loaded structure to the user as the scope-confirmation surface

### 2. Parse Change Request

- In update mode, categorize the change request derived from the `{user_description}`: add/modify activity, technique, resource, metadata, or structural refactor (see [update-mode-guide](../resources/update-mode-guide.md))

### 3. Classify Operation

- Accept the `{user_description}` and summarize key design intent — purpose, domain, rough activity count, and constraints
- Set `{operation_type}` and the corresponding `{is_update_mode}` / `{is_review_mode}` flags: an existing-workflow reference for a change signals update, for an audit signals review, otherwise create
- Present the classification and distilled intent for confirmation
