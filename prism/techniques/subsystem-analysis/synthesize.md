---
metadata:
  version: 1.0.0
---

## Capability

Synthesize cross-subsystem findings, cross-boundary bugs, and a file-level conservation law from the per-subsystem outputs

## Outputs

### subsystem_synthesis

Cross-subsystem findings, cross-boundary bugs, and the file-level conservation law.

#### artifact

`subsystem-synthesis.md`

## Protocol

### 1. Synthesize

- Load [subsystem synthesis](../../resources/subsystem-synthesis.md) resource (64)
- Dispatch synthesis worker with all per-subsystem outputs
- Worker writes `{subsystem_synthesis}` into `{output_path}`
- Return `{subsystem_synthesis}`
