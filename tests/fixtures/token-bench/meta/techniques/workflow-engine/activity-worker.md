---
metadata:
  version: 1.0.0
---

## Capability

Worker for a dispatched activity — executes bound steps, yields gates, and walks on while its batch has room.

## Protocol

### 1. Execute

- Confirm the activity the delivery returned is the one this context was dispatched for.
- Execute each step in document order, applying the operation each technique step binds.
- When the last step completes, compile the envelope the activity owes.
