---
metadata:
  version: 1.2.0
---

## Capability

Record that this dispatch executed.

## Outputs

### dispatch_recorded

True once this dispatch has executed.

### unserved_applications

The technique ids this dispatch was told to apply and was not served. Empty on a sound instance.

## Protocol

### 1. Record

- Set `{dispatch_recorded}` to true. That is the whole of the work.

### 2. Read Delivery

- Set `{unserved_applications}` to the technique ids this dispatch applies — its activity's step
  bindings, and the ids those techniques name for work inside their own Protocol — less the ids
  it was served.
  > An id named for work and never delivered is improvised past rather than refused, so a
  > dispatch that executed is not on its own evidence that its contract arrived.
