---
metadata:
  version: 1.0.0
---

## Capability

Write assumption outcomes (resolved/deferred) and the user's responses back into the assumptions log, producing the `{updated_assumptions_log}`.

## Inputs

### updated_assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) to write outcomes into; its existing assumptions and resolution status are preserved.

### assumption_decisions

The per-assumption decisions (accept/reject/defer) together with any user-supplied correction, written back as each assumption's outcome.

## Outputs

### updated_assumptions_log

The assumptions [log](../../resources/assumptions-review.md#assumptions-log-template) updated with each assumption marked confirmed, corrected, or needs-discussion and the user's responses recorded inline; all assumptions and their resolution status are preserved. This file is the record of truth for assumption outcomes.

### has_deferred_assumptions

Boolean gate — true iff any assumption was marked deferred (needs-discussion); consumed downstream to decide whether a resolution summary is posted to the issue tracker.

## Protocol

1. Mark each assumption as confirmed, corrected, or needs-discussion
2. Write outcomes and user responses back into the log, producing the `{updated_assumptions_log}`
3. Preserve all assumptions and their resolution status
