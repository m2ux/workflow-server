---
metadata:
  version: 1.0.0
---

## Capability

Apply the chosen fix strategy and prepare for re-validation.

## Inputs

### check_id

Identifier of the originally failed check

### fix_strategy

Concrete fix approach to execute (file edit, fmt-fix invocation, dependency install, etc.)

## Output

### fix_applied

Boolean — true if the fix was applied; false if the fix requires user input or external action

## Protocol

1. Execute the fix per `fix_strategy`: source edits go through harness Edit/Write; formatting fixes go through [cargo-operations](../cargo-operations/TECHNIQUE.md)::[fmt-fix](../cargo-operations/fmt-fix.md); dependency or environment fixes are surfaced to the user.
2. Set `fix_applied = true` on success. Set `fix_applied = false` when the fix requires user input — the activity loop will surface this via its checkpoint.

## Errors

### persistent_failure

**Cause:** A check fails repeatedly across successive analyze/fix iterations

**Recovery:** Surface the latest analysis to the user via the activity's checkpoint mechanism
