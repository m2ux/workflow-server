---
metadata:
  version: 1.0.0
---

## Capability

Operation-type classification and design-intent baseline for create, update or review.

## Outputs

### operation_type

The classified operation — sole mode state for the run:

- **Review** — existing-workflow reference(s) plus an audit intent (recognition signals include "review workflow", "audit workflow", "check workflow compliance", "workflow review", "assess workflow quality", "evaluate workflow")
- **Update** — existing-workflow reference plus a change request
- **Create** — no existing-workflow reference

### operation_type_ambiguous

Boolean — true when create vs update vs review cannot be classified with certainty from the request (signals conflict or are absent); false on a clear classification.

### change_request_clear

Boolean — in update mode, true when the change request is specific enough to draft against without clarification; false when the request is vague or contradictory. True outside update.

### intent_needs_confirmation

Composite boolean — true when any of: `{operation_type_ambiguous}`; update with `{change_request_clear}` false; review with an ambiguous target set. False on the clear path.

### review_scope_confirmed

Boolean — true when the review target set resolves to concrete, existing workflow ids; false when review is requested against a set that cannot be resolved with certainty. False outside review.

### headless_mode

Boolean — default **true** (soft mid-flow gates auto-resolve); false only when `{user_description}` explicitly requests interactive soft-gate behaviour (signals include "interactive", "not headless", "with checkpoints").

### workflow_id

The id of the workflow being created or updated.

### target_workflow_id

The workflow id currently in scope — the one being authored on a create run, the one being modified on an update run, or the audit target currently bound on a review run. On a multi-target review it starts as the first id in `{target_workflow_ids}` and is rebound per target.

### target_workflow_ids

Ordered list of workflow ids in scope for this run, always holding at least one. A create or update run holds the single target; a review run holds every named audit target in request order.

### structural_inventory

Per-target baseline of the existing definition — file counts by kind, entity counts, activity ids in prefix order, and a one-line statement of what the change touches. Absent on a create run, which has no existing definition.

### change_category

In update mode, the categorised change request from `{user_description}`: one or more of the categories in [Change Categories](../../resources/update-mode-guide.md#change-categories). Unset otherwise.

## Protocol

### 1. Classify Operation

- Determine `{operation_type}` per the Output criteria
- Set `{operation_type_ambiguous}` true when classification signals conflict or are insufficient; otherwise false
- In review mode resolve `{target_workflow_ids}` from the request and bind `{target_workflow_id}` to its first element; in update mode take both from the single named target; in create mode take both from the id being authored, so the list is never empty in any mode
- In review mode set `{review_scope_confirmed}` true when every named id resolves to an existing workflow directory, and false when no concrete id is named or the named set cannot be resolved with certainty

### 2. Derive Intent Gap Flag and Headless

- In update mode set `{change_request_clear}` from whether `{user_description}` states a concrete change; leave it true in create and review
- Compute `{intent_needs_confirmation}` as true when `{operation_type_ambiguous}` is true, or update with `{change_request_clear}` false, or review with an unresolved target set; otherwise false
- Leave `{headless_mode}` true by default; set it false only on an explicit interactive opt-out in `{user_description}`

### 3. Baseline the Target Definitions

- In update and review modes, enumerate each target's definition files under `{target_path}` — root definition, activity files, technique files (standalone, group index and nested), resource files and README — and derive `{structural_inventory}` from that enumeration at the shape its Output declares
- In create mode leave `{structural_inventory}` unset

### 4. Categorise the Change Request

- In update mode, categorise the change `{user_description}` asks for into `{change_category}` per [Change Categories](../../resources/update-mode-guide.md#change-categories); a request spanning more than one category records each

## Rules

### derive-before-ask

Classify mode, target and clarity from the request before asking anything. `{intent_needs_confirmation}` is the sole gap signal this operation emits; it never substitutes a guess for the flag.
