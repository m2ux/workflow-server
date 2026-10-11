---
metadata:
  version: 1.0.0
---

## Capability

A completed run's per-finding entries, loaded from the findings artifact into the triggering session's own context.

## Inputs

### definitive_findings_path

Filesystem path to the run's definitive findings.

## Outputs

### definitive_findings

The run's per-finding entries, each carrying the field set the artifact records against it.

## Protocol

### 1. Load the Findings

- Read the artifact at `{definitive_findings_path}` and take its per-finding entries, per [DEFINITIVE-FINDINGS.md Template](../resources/definitive-findings-template.md#definitive-findingsmd-template).
- Emit `{definitive_findings}` as those entries, each carrying the location and severity the artifact states for it.
