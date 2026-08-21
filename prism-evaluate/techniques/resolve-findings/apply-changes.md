---
metadata:
  version: 2.0.0
---

## Capability

Makes the planned changes to the target, each one checked against the text it expects to find and the text it leaves behind.

## Outputs

### applied_changes

What reached the target: per change, its finding ID, the location it landed at, and whether verification found the new text there. A change the target could not accept appears with its conflict.

### changed_paths

The target this application modified, together with the mitigation plan the changes came from.

## Protocol

### 1. Apply Each Change

- Work through `{mitigation_plan.implementation_priority}`, and for each change verify the target text at `{target_path}` matches what the plan expects before making it.  
  > Where an earlier change moved the text, search for the expected text elsewhere in the target and apply the change at that location.  
  > Where the expected text is nowhere in the target, record the conflict and leave that change unapplied.

### 2. Verify Each Change Landed

- After each change, verify the new text is present where it was applied.  
  > Where verification fails, record the failure against that change and continue with the remaining ones.

### 3. Record What Changed

- Record `{applied_changes}`: per change, its finding ID, the location it reached, and whether verification found it.
- Record `{changed_paths}` as `{target_path}` and `{mitigation_plan_path}`.
