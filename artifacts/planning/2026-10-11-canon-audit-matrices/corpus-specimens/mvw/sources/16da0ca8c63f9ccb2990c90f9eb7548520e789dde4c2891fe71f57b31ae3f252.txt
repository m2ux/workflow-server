---
metadata:
  version: 1.2.0
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

## Outputs

### analysis_document

Current implementation analysis carrying the located implementation, its evaluated effectiveness, the established baselines, the identified gaps, and the improvement opportunities they open.

#### artifact

`implementation-analysis.md`

#### audience

`human`

## Protocol

### 1. Create Analysis Artifact

- Create the analysis-document artifact in `{planning_folder_path}`, capturing the located implementation, evaluated effectiveness, established baselines, and identified gaps
- This artifact is the [canonical home](../../resources/canonical-home-map.md#map) for baselines, gaps, and measurement strategy; success criteria home in `requirements-elicitation.md` — fill the template's link-only slot rather than restating them
