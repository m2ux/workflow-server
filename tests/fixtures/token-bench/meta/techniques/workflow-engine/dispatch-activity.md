---
metadata:
  version: 1.0.0
---

## Capability

Hand one activity to a worker context and read back the envelope it owes.

## Protocol

### 1. Dispatch

- Compose the worker stub from the activity id and the session index, and spawn the context that will take it.
- Await the envelope. A context that returns anything else has not completed the activity.
