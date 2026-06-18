---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Compose the prism trigger context for an audit scope, then harvest the outputs of the triggered prism run: collect the report and analysis artifacts a prism run produced into the audit's accumulators, and verify that the run completed with all expected artifacts present. The operations in this set decompose that into the context-composition, result-collection, and completion-verification phases.

## Inputs

### current_scope

The audit scope being processed: `{ target, output_subdir, pipeline_mode, analysis_focus }`. `compose-trigger-context` unpacks it into the trigger variables (including `{pipeline_mode}`) that the collection and verification phases then read.
