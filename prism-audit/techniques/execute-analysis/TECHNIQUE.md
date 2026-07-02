---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Compose the prism trigger context for an audit scope, then record the triggered prism run from its RUN-MANIFEST.md — the report, definitive findings, artifact paths, and prism-reported completion status — into the audit's accumulators. Prism generates, enriches, and verifies its own results, so this set only composes the trigger context and reads the manifest; it does not re-extract findings, re-scan the output directory, or re-verify completion.

## Inputs

### current_scope

The audit scope being processed: `{ target, output_subdir, pipeline_mode, analysis_focus }`. `compose-trigger-context` unpacks it into the trigger variables (including `{pipeline_mode}`); `read-run-manifest` then reads that scope's run manifest from its `output_subdir`.
