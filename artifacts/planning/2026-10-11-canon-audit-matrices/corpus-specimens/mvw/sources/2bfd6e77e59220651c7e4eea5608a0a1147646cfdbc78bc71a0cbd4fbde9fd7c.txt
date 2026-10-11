---
metadata:
  version: 1.0.0
---

## Capability

Choose the directory both passes open with.

## Outputs

### initial_target

The directory the run opens with, relative to `{component_path}`.

## Protocol

### 1. Choose The Opening Target

- Record `{component_path}` itself as `{initial_target}`. The component root is the one target every checkout has, so a run against an unfamiliar tree opens somewhere that exists rather than somewhere a previous run happened to find.
