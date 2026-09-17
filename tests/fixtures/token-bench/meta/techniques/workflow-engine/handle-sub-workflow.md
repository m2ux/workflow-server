---
metadata:
  version: 1.0.0
---

## Capability

Open a child workflow as a session of its own and walk it to its terminal.

## Protocol

### 1. Handle

- Open the child with `dispatch_child`, keeping the index it returns.
- Walk the child solo: it has no other owner.
