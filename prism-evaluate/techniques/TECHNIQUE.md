---
metadata:
  version: 1.0.0
---

## Capability

Shared Inputs, Outputs, Rules, and Errors for every technique in this set.

## Inputs

### target_path

Path to the document, proposal, codebase, or artifact set being evaluated.

### evaluation_description

The user's description of what to evaluate, the evaluation goals, focus areas, and concerns.

### evaluation_output_path

Directory where this evaluation's own artifacts are read from and written to. Each triggered prism run writes into a subdirectory of it, addressed through `output_path`.
