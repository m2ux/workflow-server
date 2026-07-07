---
metadata:
  version: 1.0.0
---

## Capability

Synthesize cross-subsystem findings, cross-boundary bugs, and a file-level conservation law from the per-subsystem outputs

## Protocol

### 1. Synthesize

- Load [subsystem synthesis](../../resources/subsystem-synthesis.md) resource (64)
- Dispatch synthesis worker with all per-subsystem outputs
- Worker writes `{subsystem_result.synthesis_path}` into `{output_path}`
- Return `{subsystem_result}`: the per-subsystem paths, the synthesis path, and the prism assignments from calibration
