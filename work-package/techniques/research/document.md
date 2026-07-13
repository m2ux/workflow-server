---
metadata:
  version: 1.2.0
---

## Capability

Create the research artifact capturing the synthesized findings, applicable patterns, and risks.

## Inputs

### kb_findings

Knowledge base findings; recorded in the artifact.

### web_findings

Web research findings; recorded in the artifact.

### findings_synthesis

Findings-to-requirements synthesis; recorded in the artifact.

### applicable_patterns

Patterns mapped to needs; recorded in the artifact.

### planning_folder_path

Path to the planning artifacts folder where `{research_document}` is written.

## Outputs

### research_document

Knowledge base and web research synthesis artifact for the work package. Written to `{planning_folder_path}` as `kb-research.md`, capturing `{kb_findings}`, `{web_findings}`, `{findings_synthesis}`, `{applicable_patterns}`, and risks.

#### artifact

`kb-research.md`

## Protocol

### 1. Create Research Artifact

- Create the `{research_document}` artifact in `{planning_folder_path}`
- Include `{kb_findings}`, `{web_findings}`, `{findings_synthesis}`, `{applicable_patterns}`, and risks
- Record `{web_findings}` per the [web research findings template](../../resources/web-research.md#planning-artifact), appended after the knowledge base findings
- This artifact is the [canonical home](../manage-artifacts/TECHNIQUE.md#canonical-home-map) for research findings — the plan consumes them through its link-only Inputs list.
