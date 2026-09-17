---
metadata:
  version: 1.0.0
---

## Capability

Read which exit an activity took and where the graph sends it.

## Protocol

### 1. Evaluate

- Take the exit the activity reported and read its destination from the `exit_destinations` block the delivery carried.
- Where the destination names several branches, report that it fans rather than choosing one.
