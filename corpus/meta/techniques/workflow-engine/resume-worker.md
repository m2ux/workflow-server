---
metadata:
  version: 1.12.0
---

## Capability

The reading of a continuation that did not return an accepted envelope.

## Inputs

### worker_result

The envelope the continuation returned.

## Rules

### reject-partial-worker-result

An accepted result is one of the two tagged envelopes — `checkpoint_pending` or `activity_complete` — carrying the fields that envelope requires. An interim status report, a progress table, a narrative of work still in flight, or prose describing an envelope without being one is not an accepted result. Neither is an envelope reporting fewer steps than the activity defines, or leaving a required checkpoint without a response.

## Protocol

### 1. Read Missing Envelope

- An envelope that is not `checkpoint_pending` or `activity_complete` means the context is gone.
