---
metadata:
  version: 1.11.0
---

## Capability

Assumption outcomes and stakeholder responses recorded in the assumptions log.

## Inputs

### assumption_outcome

The decision recorded against an assumption. Empty where no decision has been asked for.

### assumption_correction

*(optional)* Text the user typed correcting the assumption under discussion. Unset until a correction is given.

### current_assumption

*(optional)* The one assumption a per-item decision settles. Unset where the outcome covers every open assumption.

## Outputs

### assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) updated with each assumption marked confirmed, corrected, or deferred and the user's responses recorded inline; all assumptions and their resolution status are preserved. This file is the record of truth for assumption outcomes.

#### artifact

`assumptions-log.md`

#### audience

`human`

### assumptions_log_path

Path to the written assumptions log.

### has_deferred_assumptions

Whether any row in `{assumptions_log}` carries Outcome Deferred.

## Protocol

### 1. Mark Each Outcome

- Mark each open assumption with `{assumption_outcome}`
  > - Where `{assumption_outcome}` is empty, no decision has been asked for yet, so the assumptions are recorded with the agent's position and no outcome.
  > - Where `{current_assumption}` is bound, mark that assumption alone.

### 2. Write the Outcomes Into the Log

- Write each outcome into the assumption's Log table row in place — `User` in the Resolution column; Confirmed / Corrected: <change> / Deferred in the Outcome column, where <change> is `{assumption_correction}` as the user typed it — and remove its Open Assumptions entry. No separate response or outcome section is added (`manage-artifacts.state-once-per-artifact`). Emit the log's path as `{assumptions_log_path}`.

### 3. Preserve Every Row

- Preserve all assumption rows and their resolution status
