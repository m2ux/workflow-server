---
metadata:
  version: 1.3.0
---

## Capability

Create the analysis-document artifact capturing the current state, baseline metrics, and identified gaps.

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

Current implementation analysis carrying the located implementation, its evaluated effectiveness, the established baselines, and the identified gaps.

#### artifact

`implementation-analysis.md`

#### audience

`human`

## Protocol

### 1. Create Analysis Artifact

- Create the `{analysis_document}` in `{planning_folder_path}` from the [Document Template](../../resources/implementation-analysis.md#document-template), capturing `{located_implementation}` and `{effectiveness_assessment}` as the current state, `{baseline_metrics}`, and `{gaps_identified}`
- This artifact is the [canonical home](../../resources/canonical-home-map.md#map) for baselines, gaps, and measurement strategy; success criteria home in `requirements-elicitation.md` — fill the template's link-only slot rather than restating them
