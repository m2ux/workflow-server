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

### root_cause

One-line statement of the root cause the fix strategy addresses, so the edit targets the cause rather than the symptom.

## Protocol

1. Execute the fix per `{fix_strategy}` for the `{root_cause}` behind the check identified by `{check_id}`: source edits go through harness Edit/Write; formatting fixes go through [cargo-operations](../../../meta/techniques/cargo-operations/TECHNIQUE.md)::[fmt-fix](../../../meta/techniques/cargo-operations/fmt-fix.md); dependency or environment fixes are surfaced to the user.
   - A fix that requires user input or external action is left unapplied; the suite re-run that follows is what reports whether the check now passes.
   > If a check keeps failing across successive analyze/fix iterations, surface the latest analysis to the user rather than looping indefinitely.
