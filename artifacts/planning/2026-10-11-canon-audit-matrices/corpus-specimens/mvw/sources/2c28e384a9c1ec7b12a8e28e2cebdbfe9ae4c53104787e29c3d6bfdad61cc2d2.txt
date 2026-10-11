---
metadata:
  version: 2.0.0
---

## Capability

Composes each execution group's prism trigger context and records the resulting run into the evaluation's accumulators, so the analysis stage holds the run's contract artifacts and its reported status.

## Inputs

### current_group

The execution group being run: `{ pipeline_mode, lenses, dimensions, analysis_focus, output_subdir }`.
