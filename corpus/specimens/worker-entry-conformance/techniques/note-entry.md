---
metadata:
  version: 1.0.0
---

## Capability

Record the entry path this activity arrived on and the identity it is carrying under.

## Inputs

### entry_kind

The entry path this activity arrived on, as the graph position names it: `cold-dispatch`,
`batch-continuation` or `fan-branch`.

## Outputs

### entry_record

`{ entry_kind, agent_id, activity_id, recorded_at }`. `agent_id` is the delivery identity
this activity is carrying under, and `recorded_at` is an ISO 8601 instant.

## Protocol

### 1. Entry Record

- Set `{entry_record}` to `{ entry_kind, agent_id, activity_id, recorded_at }`, reading
  `agent_id` and `activity_id` from the stub this context was opened with and
  `recorded_at` from the clock. That is the whole of the work.
  > The identity comes from the stub rather than from a server call: what the record is
  > evidence of is which identity this context was handed, and a lookup would report the
  > identity the server holds instead.

## Rules

### record-only-what-the-entry-handed-you

This technique reads the stub and the clock, and reaches no further. The run exists to
exercise the entry, so a record assembled from anything the entry did not hand over is
evidence about the lookup rather than about the entry.
