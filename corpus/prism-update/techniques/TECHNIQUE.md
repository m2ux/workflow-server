---
metadata:
  version: 1.1.0
---

## Capability

Shared Inputs, Outputs, Rules, and Errors for every technique in this set.

## Inputs

### upstream_path

Absolute path to the upstream prisms directory.

### resource_path

Relative path to the prism workflow resources directory.

#### default

`prism/resources/`

### prism_readme

Relative path to the prism workflow's top-level README.

#### default

`prism/README.md`

### prism_resources_readme

Relative path to the prism workflow's resources catalog README.

#### default

`prism/resources/README.md`

### plan_analysis_technique

Relative path to the prism workflow's plan-analysis routing technique, which carries the goal-mapping matrix.

#### default

`prism/techniques/plan-analysis.md`

### change_set

Categorized change set — new, modified, renamed, and deleted entries — ready to apply to the resources directory.

### next_index

Next available resource index, derived from the highest existing resource index plus one.
