---
metadata:
  version: 1.0.0
---

## Capability

Record one finding's disposition alongside the mitigation text it applies to, so the compiled plan carries what was decided and the wording it was decided on.

## Inputs

### proposed_mitigation

The mitigation proposed for the finding: its tier, target location, text, and reasoning.

### finding_disposition

The disposition taken on the finding: `accept`, `modify`, `skip`, or `discuss` where the dialogue reached its refinement limit without settling.

## Outputs

### finding_decision

One finding's recorded disposition: `{ finding_id, finding_severity, mitigation_type, mitigation_summary, user_decision }`, carrying the mitigation text the disposition applies to.

## Protocol

### 1. Record the Disposition

- Record `{finding_decision}` from `{current_finding}`, `{finding_disposition}`, and the text of `{proposed_mitigation}`.  
  > - Under a `modify` disposition, the recorded text is the adjusted wording rather than the proposal's.
  > - Under `skip` or `discuss`, the record carries the finding and its severity with no mitigation text, and `discuss` records the dialogue as unsettled.
