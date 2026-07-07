---
metadata:
  version: 1.0.0
---

## Capability

Apply P5 fork code execution detection: identify checkout of fork/PR code, check for subsequent execution commands, and trace whether secrets are accessible in the execution context.

## Protocol

### 1. P5 Fork Execution

- Identify checkout of fork/PR code in any trigger context
- Check for subsequent execution commands (`run:`, build, test, `go run`, `npm`, `cargo`, `python`)
- Trace whether secrets are accessible in the execution context
