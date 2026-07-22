---
metadata:
  version: 1.0.0
---

## Capability

Identify the next work package and prepare context for the transition.

## Inputs

### planning_folder_path

Path to the current work package's planning folder, read for follow-up items and carried context that inform what the next work package should be.

## Outputs

### next_work_package_context

The identified next work package (when applicable) together with the context prepared for the transition to it — the hand-off the caller carries forward. Empty when no next work package applies.

## Protocol

### 1. Select Next

- Identify next work package if applicable.
- Prepare context for transition. When carried context depends on session record, use `inspect_session` per [generate-summary](../../../meta/techniques/workflow-engine/generate-summary.md) / [verify-outcomes](../../../meta/techniques/workflow-engine/verify-outcomes.md).
