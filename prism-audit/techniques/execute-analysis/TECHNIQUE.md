---
metadata:
  version: 1.0.0
---

## Capability

Composes each audit scope's analysis trigger context and records the resulting run into the audit's accumulators, so finalization holds the run's contract artifacts and the status it reported.

## Inputs

### current_scope

The audit scope under analysis: `{ target, output_subdir, pipeline_mode, analysis_focus }`.
