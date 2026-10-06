---
metadata:
  version: 1.3.0
---

## Capability

Record that this dispatch executed.

## Outputs

### dispatch_recorded

True once this dispatch has executed.

### unserved_applications

The technique ids this dispatch's activity binds as steps and was not served. Empty on a sound
instance.

## Protocol

### 1. Dispatch Record

- Set `{dispatch_recorded}` to true. That is the whole of the work.

### 2. Delivery Reading

- Set `{unserved_applications}` to the technique ids this activity binds as steps, less the ids
  this dispatch was served. Both rosters are in the response this context was opened with.
  > An id bound as a step and never delivered is improvised past rather than refused, so a
  > dispatch that executed is not on its own evidence that its contract arrived.
