---
metadata:
  version: 1.15.0
---

## Capability

The reading of a continuation that did not return an accepted envelope.

## Inputs

### worker_result

The envelope the continuation returned.

## Protocol

### 1. Read Missing Envelope

- `{worker_result}` is neither `checkpoint_pending` nor `steps_complete`, per `reject-partial-worker-result`, so the context that carried it is gone and a replacement is owed.

## Rules

### reject-partial-worker-result

An accepted result is one of the two tagged envelopes a worker returns — `checkpoint_pending` or `steps_complete` — carrying the fields that envelope requires. An interim status report, a progress table, a narrative of work still in flight, or prose describing an envelope without being one is not an accepted result. Neither is an envelope reporting fewer steps than the activity defines, or leaving a required checkpoint without a response.
