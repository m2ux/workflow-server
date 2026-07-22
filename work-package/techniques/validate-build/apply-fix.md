---
metadata:
  version: 1.0.0
---

## Capability

Concrete fix for a failed validation check, ready for re-validation.

## Inputs

### check_id

Identifier of the originally failed check

### fix_strategy

Concrete fix approach to execute (file edit, `fmt-fix` invocation, dependency install, etc.)

## Outputs

### fix_applied

Boolean — true if the fix was applied; false if the fix requires user input or external action


## Protocol

1. Execute the fix per `{fix_strategy}` for the check identified by `{check_id}`: source edits go through harness Edit/Write; formatting fixes go through [cargo-operations](../../../meta/techniques/cargo-operations/TECHNIQUE.md)::[fmt-fix](../../../meta/techniques/cargo-operations/fmt-fix.md); dependency or environment fixes are surfaced to the user.
2. Set `{fix_applied}` = true on success. Set `{fix_applied}` = false when the fix requires user input.
   - If a check keeps failing across successive analyze/fix iterations, surface the latest analysis to the user rather than looping indefinitely.
