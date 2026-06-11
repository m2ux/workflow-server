---
metadata:
  version: 1.0.0
---

## Capability

Create the analysis-document artifact capturing the current state, baseline metrics, identified gaps, and improvement opportunities.

## Inputs

### located_implementation

Where the implementation lives and its structure; recorded in the artifact.

### effectiveness_assessment

Effectiveness and pain-point findings; recorded in the artifact.

### baseline_metrics

Quantitative baselines with measurement methods; recorded in the artifact.

### gaps_identified

Gaps linked to success criteria; recorded in the artifact.

### planning_folder_path

Path to the planning artifacts folder where `{analysis_document}` is written.

## Outputs

### analysis_document

Current implementation analysis artifact with baselines and improvement opportunities (inherited from the [implementation-analysis](./TECHNIQUE.md) group root; declared here as the binding contract). Written to `{planning_folder_path}` as `implementation-analysis.md`, capturing the located implementation, evaluated effectiveness, established baselines, and identified gaps.

## Protocol

### 1. Create Analysis Artifact

- Create the analysis-document artifact in `{planning_folder_path}`, capturing the located implementation, evaluated effectiveness, established baselines, and identified gaps
