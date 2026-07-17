---
metadata:
  version: 2.3.0
---

## Capability

Capture the operation type — create, update, or review — and establish the corresponding target: load the existing workflow definition and structural inventory as a baseline (update/review), categorize the requested change (update), summarize design intent (create), and present the classification.

## Outputs

### operation_type

The classified operation — sole mode state for the session:

- **Review** — existing-workflow reference(s) plus an audit intent (recognition signals include "review workflow", "audit workflow", "check workflow compliance", "workflow review", "assess workflow quality", "evaluate workflow")
- **Update** — existing-workflow reference plus a change request
- **Create** — no existing-workflow reference

### workflow_id

The id of the workflow being created or updated.

### target_workflow_id

The id of the existing workflow to modify (update), or the primary/current audit target (review). In multi-target review this is the first id in `{target_workflow_ids}` at intake and is rebound per target; unset in create mode.

### target_workflow_ids

Ordered list of workflow ids to audit in review mode. One element for single-target review; two or more when the request names multiple workflows (e.g. `work-package` and `workflow-design`). Unset in create/update modes.

### structural_inventory

Per-target structural inventory: file counts and entity counts (activities, techniques, resources, checkpoints, transitions).

### change_category

When `{operation_type}` is `update`, the categorized change request derived from `{user_description}`: add/modify activity, technique, resource, metadata, or structural refactor (see [update-mode-guide](../resources/update-mode-guide.md)). Unset otherwise.

### design_intent

Summarized key design intent from `{user_description}` — purpose, domain, rough activity count, and constraints.

## Protocol

### 1. Classify Operation

- Determine `{operation_type}` per the Output criteria
- In review mode, resolve `{target_workflow_ids}` from the request and seed `{target_workflow_id}` to the first element; in update mode set `{target_workflow_id}` only; in create mode leave both unset

### 2. Load Target Definitions

- When `{operation_type}` is `update` or `review`, load the committed workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and source each target's definition from the workflow-server context the orchestrator supplies — workers do not load full workflow definitions directly

### 3. Build Structural Inventory

- Build `{structural_inventory}` for each target: file counts and entity counts (activities, techniques, resources, checkpoints, transitions)

### 4. Present Loaded Structure

- Present `{structural_inventory}` as the loaded baseline

### 5. Parse Change Request

- When `{operation_type}` is `update`, categorize the change request derived from the `{user_description}` into `{change_category}`: add/modify activity, technique, resource, metadata, or structural refactor (see [update-mode-guide](../resources/update-mode-guide.md))

### 6. Summarize Design Intent

- Accept the `{user_description}` and summarize key design intent into `{design_intent}` — purpose, domain, rough activity count, and constraints

### 7. Present Classification

- Present the classification, target set (`{target_workflow_ids}` when `{operation_type}` is `review`), `{structural_inventory}`, and `{design_intent}` / `{change_category}` as applicable
