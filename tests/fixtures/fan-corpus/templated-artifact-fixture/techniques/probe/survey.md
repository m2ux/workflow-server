---
metadata:
  version: 1.0.0
---

## Capability

Survey the unit this instance was handed, into a file of its own.

## Inputs

### probe_target

The unit this instance probes.

## Outputs

### probe_findings

What the probe found for its unit.

#### artifact

`{probe_target}-probe-findings.md`

#### audience

`human`

## Protocol

### 1. Survey

1. Survey `{probe_target}`.
2. Record what the survey found.
