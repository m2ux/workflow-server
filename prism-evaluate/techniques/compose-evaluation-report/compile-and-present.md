---
metadata:
  version: 1.1.0
---

## Capability

Read the consolidated report to extract the flat findings list, compile the finding and run metrics, and present the metrics, core finding, recommendations, and a deliverable index listing every produced artifact with its path, organised by dimension.

## Outputs

### evaluation_findings

The flat list of findings extracted from the report, each carrying ID, severity, claim, critique, and mitigation tier.

### evaluation_metrics

Finding count by dimension, finding count by severity, dimensions evaluated, number of prism runs triggered, and total analysis artifacts produced.

## Protocol

- Read `{evaluation_report}` and extract `{evaluation_findings}` — each finding's ID, severity, claim, critique, and mitigation tier.
- Compile `{evaluation_metrics}`: finding count by dimension, finding count by severity (Critical, High, Medium, Low), dimensions evaluated, number of prism runs triggered, and total analysis artifacts produced.
- Present the results to the user: `{evaluation_metrics}`, the `{evaluation_report.core_finding}` highlight, the top-priority entries of `{evaluation_report.recommendations}`, and a deliverable index listing every produced artifact with its path — `{evaluation_report}`, `{evaluation_plan_path}`, and each dimension-specific analysis artifact in `{all_artifact_paths}` — organised by dimension.
