---
metadata:
  version: 1.8.0
---

## Capability

Assumption outcomes and stakeholder responses recorded in the assumptions log.

## Inputs

### assumption_outcome

The decision recorded against an assumption. Empty where no decision has been asked for.

## Outputs

### assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) updated with each assumption marked confirmed, corrected, or needs-discussion and the user's responses recorded inline; all assumptions and their resolution status are preserved. This file is the record of truth for assumption outcomes.

#### artifact

`assumptions-log.md`

#### audience

`human`

### has_deferred_assumptions

Boolean gate — true iff any assumption was marked deferred (needs-discussion).

## Protocol

1. Mark each assumption with `{assumption_outcome}`. Where it is empty no decision has been asked for yet, so the assumptions are recorded with the agent's position and no outcome
2. Write each outcome into the assumption's Log table row in place — `User` in the Resolution column; Confirmed / Corrected: <change> / Deferred: <follow-up> in the Outcome column — and remove its Open Assumptions entry. No separate response or outcome section is added (state-once-per-artifact).
3. Record each deferred follow-up as a row in the deferred-items register (shape per the [deferred-items template](../../resources/deferred-items.md#template)); the log row's Outcome cell links the register row.
4. Preserve all assumption rows and their resolution status
