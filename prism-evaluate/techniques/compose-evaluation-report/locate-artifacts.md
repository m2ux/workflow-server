---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Locate the prism output artifacts for each evaluation dimension and verify the expected terminal artifacts exist before consolidation begins.

## Protocol

- For each dimension in `{dimension_plan}`, locate the prism output artifacts in the dimension's `output_subdir` under `{output_path}`, resolving each run's path and status from `{completed_analyses}` and `{all_artifact_paths}` before reading.
- Determine the expected artifacts for each dimension's `pipeline_mode` from the [terminal artifact convention](../../resources/dimension-lens-mapping.md#terminal-artifact-convention).
- Verify the expected artifacts exist.  
  > When expected artifacts are missing for one or more dimensions, report which dimensions lack artifacts, then compose `{evaluation_report}` from the available dimensions and note the incomplete coverage.
