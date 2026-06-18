---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Harvest the outputs of a triggered prism analysis: collect the report and analysis artifacts a prism run produced into the evaluation's accumulators, and verify that the run completed with all expected artifacts present. The operations in this set decompose that into the result-collection and completion-verification phases.

## Inputs

### current_group

The execution group whose prism run is being harvested: `{ pipeline_mode, lenses, dimensions, analysis_focus, output_subdir }`

### pipeline_mode

The prism pipeline mode the group was run under, which determines the expected artifact set
