---
metadata:
  version: 1.2.0
---

## Capability

Write assumption outcomes (resolved/deferred) and the user's responses back into the assumptions log, producing the `{assumptions_log}`.

## Inputs

### assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) to write outcomes into; its existing assumptions and resolution status are preserved.

### assumption_decisions

The per-assumption decisions (accept/reject/defer) together with any user-supplied correction, written back as each assumption's outcome.

## Outputs

### assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) updated with each assumption marked confirmed, corrected, or needs-discussion and the user's responses recorded inline; all assumptions and their resolution status are preserved. This file is the record of truth for assumption outcomes.

#### artifact

`assumptions-log.md`

### has_deferred_assumptions

Boolean gate — true iff any assumption was marked deferred (needs-discussion); consumed downstream to decide whether a resolution summary is posted to the issue tracker.

## Protocol

1. Mark each assumption as confirmed, corrected, or needs-discussion
2. Write each outcome into the assumption's Log table row in place — `User` in the Resolution column; Confirmed / Corrected: <change> / Deferred: <follow-up> in the Outcome column — and remove its Open Assumptions entry. No separate response or outcome section is added (state-once-per-artifact).
3. Record each deferred follow-up as a row in the deferred-items register ([deferred-items](../../resources/deferred-items.md)); the log row's Outcome cell links the register row.
4. Preserve all assumption rows and their resolution status
