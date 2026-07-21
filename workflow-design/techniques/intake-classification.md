---
metadata:
  version: 2.7.0
---

## Capability

Capture the operation type — create, update, or review — establish the corresponding target, derive intent-gap flags, derive start-time `{headless_mode}` (default true; false on interactive opt-out), load the existing workflow definition and structural inventory as a baseline (update/review), categorize the requested change (update), summarize design intent (create), and persist the structural inventory for activity-layer review.

## Outputs

### operation_type

The classified operation — sole mode state for the session:

- **Review** — existing-workflow reference(s) plus an audit intent (recognition signals include "review workflow", "audit workflow", "check workflow compliance", "workflow review", "assess workflow quality", "evaluate workflow")
- **Update** — existing-workflow reference plus a change request
- **Create** — no existing-workflow reference

### operation_type_ambiguous

Boolean — true when create vs update vs review cannot be classified with certainty from the request (signals conflict or are absent). False on a clear classification. Contributes to `{intent_needs_confirmation}`.

### change_request_clear

Boolean — in update mode, true when the change request is specific enough to draft against without clarification; false when the request is vague or contradictory. Default true outside update. Contributes to `{intent_needs_confirmation}` when false in update.

### intent_needs_confirmation

Composite boolean — true when any of: `{operation_type_ambiguous}`; update with `{change_request_clear}` false; review with an ambiguous target set. False on the clear path.

### headless_mode

Boolean — default **true** so soft mid-flow gates auto-resolve. Set **false** only when `{user_description}` (or early intent) explicitly requests interactive soft-gate behavior (signals include "interactive", "not headless", "with checkpoints"). Blocking commit attestation and safety gaps stay interactive regardless.

### workflow_id

The id of the workflow being created or updated.

### target_workflow_id

The id of the existing workflow to modify (update), or the primary/current audit target (review). In multi-target review this is the first id in `{target_workflow_ids}` at intake and is rebound per target; unset in create mode.

### target_workflow_ids

Ordered list of workflow ids to audit in review mode. One element for single-target review; two or more when the request names multiple workflows (e.g. `work-package` and `workflow-design`). Unset in create/update modes.

### structural_inventory

Per-target structural inventory following the [Structural Inventory Guide](../resources/structural-inventory.md#template): file counts, entity counts, activity ids, and one-line update scope.

#### artifact

`structural-inventory.md`

### structural_inventory_path

Absolute path to the persisted structural-inventory artifact when `{operation_type}` is `update` or `review`; empty otherwise.

### change_category

When `{operation_type}` is `update`, the categorized change request derived from `{user_description}`: add/modify activity, technique, resource, metadata, or structural refactor (see [update-mode-guide](../resources/update-mode-guide.md)). Unset otherwise.

## Protocol

### 1. Classify Operation

- Determine `{operation_type}` per the Output criteria
- Set `{operation_type_ambiguous}` true when classification signals conflict or are insufficient; otherwise false
- In review mode, resolve `{target_workflow_ids}` from the request and seed `{target_workflow_id}` to the first element; in update mode set `{target_workflow_id}` only; in create mode leave both unset
- In review mode, treat the target set as ambiguous when no concrete workflow id is named or the named set cannot be resolved confidently — that ambiguity feeds `{intent_needs_confirmation}`

### 2. Derive Intent Gap Flag and Headless

- In update mode, set `{change_request_clear}` from whether `{user_description}` states a concrete change; leave true in create/review
- Compute `{intent_needs_confirmation}` as true when `{operation_type_ambiguous}` is true, or update with `{change_request_clear}` false, or review with an ambiguous target set; otherwise false
- Leave `{headless_mode}` true by default; set false only on an explicit interactive opt-out in `{user_description}` (signals include "interactive", "not headless", "with checkpoints")

### 3. Load Target Definitions

- When `{operation_type}` is `update` or `review`, load the committed workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and source each target's definition from the workflow-server context the orchestrator supplies — workers do not load full workflow definitions directly

### 4. Build Structural Inventory

- Build `{structural_inventory}` for each target following the [Structural Inventory Guide](../resources/structural-inventory.md#template)

### 5. Persist Structural Inventory

- When `{operation_type}` is `update` or `review`: persist `{structural_inventory}` via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `structural-inventory.md` per [structural-inventory](../resources/structural-inventory.md#template); capture `{structural_inventory_path}`
- When create mode: leave `{structural_inventory_path}` empty

### 6. Parse Change Request

- When `{operation_type}` is `update`, categorize the change request derived from the `{user_description}` into `{change_category}`: add/modify activity, technique, resource, metadata, or structural refactor (see [update-mode-guide](../resources/update-mode-guide.md))

### 7. Summarize Design Intent

- Accept the `{user_description}` and summarize key design intent into `{$design_intent}` — purpose, domain, rough activity count, and constraints

## Rules

### derive-before-ask

Classify mode, clarity, and `{headless_mode}` from the request. Emit `{intent_needs_confirmation}` as the sole gap signal for downstream gating.
