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
- Prepare context for transition.
  > When carried context depends on the session's own record (variables, completed activities, checkpoint decisions), read it through the `inspect_session` tool (`view: summary`, or a narrower view) rather than reading `session.json` directly.
