---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Record a triggered prism run from its RUN-MANIFEST.md — the report, definitive findings, artifact paths, and prism-reported completion status — into the evaluation's accumulators. prism generates, enriches, and verifies its own results, so this set only reads the manifest; it does not re-extract findings, re-scan the output directory, or re-verify completion.

## Inputs

### current_group

The execution group whose prism run is being recorded: `{ pipeline_mode, lenses, dimensions, analysis_focus, output_subdir }`. `read-run-manifest` reads that group's run manifest from its `output_subdir`.
