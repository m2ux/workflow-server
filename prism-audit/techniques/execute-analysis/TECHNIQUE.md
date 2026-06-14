---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Harvest the outputs of a triggered prism analysis: collect the report and analysis artifacts a prism run produced into the audit's accumulators, and verify that the run completed with all expected artifacts present. The operations in this set decompose that into the result-collection and completion-verification phases.

## Inputs

### current_scope

The audit scope whose prism run is being harvested: `{ target, output_subdir, pipeline_mode, analysis_focus }`

### pipeline_mode

The prism pipeline mode the scope was run under, which determines the expected artifact set
