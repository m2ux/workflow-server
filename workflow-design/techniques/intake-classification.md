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

The id of the existing workflow to modify (update), or the primary/current audit target (review). In multi-target review this is the first id in `{target_workflow_ids}` at intake and is rebound per quality-review iteration; unset in create mode.

### target_workflow_ids

Ordered list of workflow ids to audit in review mode. One element for single-target review; two or more when the request names multiple workflows (e.g. `work-package` and `workflow-design`). Unset in create/update modes.

## Protocol

### 1. Load Target Definitions

- For update or review mode, load the committed workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and source each target's definition from the workflow-server context the orchestrator supplies — workers do not load full workflow definitions directly

### 2. Resolve Target Ids

- In review mode, resolve `{target_workflow_ids}` from the request (one or more ids) and set `{target_workflow_id}` to the first element for singular bind sites; in update mode set `{target_workflow_id}` only

### 3. Build Structural Inventory

- Build a structural inventory of each target: file counts and entity counts (activities, techniques, resources, checkpoints, transitions)

### 4. Present Loaded Structure

- Present the loaded structure(s) to the user as the scope-confirmation surface

### 5. Parse Change Request

- In update mode, categorize the change request derived from the `{user_description}`: add/modify activity, technique, resource, metadata, or structural refactor (see [update-mode-guide](../resources/update-mode-guide.md))

### 6. Summarize Design Intent

- Accept the `{user_description}` and summarize key design intent — purpose, domain, rough activity count, and constraints

### 7. Set Operation Flags

- Set `{operation_type}` and the corresponding `{is_update_mode}` / `{is_review_mode}` flags:
  - **Review** — existing-workflow reference(s) plus an audit intent (recognition signals include "review workflow", "audit workflow", "check workflow compliance", "workflow review", "assess workflow quality", "evaluate workflow"). Resolve `{target_workflow_ids}` from the request (one or more ids); seed `{target_workflow_id}` to the first element
  - **Update** — existing-workflow reference plus a change request → `{target_workflow_id}` only
  - **Create** — no existing-workflow reference

### 8. Present Classification

- Present the classification, target set (`{target_workflow_ids}` in review), and distilled intent for confirmation
