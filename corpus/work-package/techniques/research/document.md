---
metadata:
  version: 1.3.0
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

## Outputs

### research_document

Knowledge base and web research synthesis for the work package, carrying the findings from both sources, their synthesis against the requirements, the patterns that apply, and the risks the research surfaced.

#### artifact

`kb-research.md`

#### audience

`human`

## Protocol

### 1. Create Research Artifact

- Create the `{research_document}` artifact in `{planning_folder_path}`
- Include `{kb_findings}`, `{web_findings}`, `{findings_synthesis}`, `{applicable_patterns}`, and risks
- Record `{web_findings}` per the [web research findings template](../../resources/web-research.md#section-template), appended after the knowledge base findings
- This artifact is the [canonical home](../../resources/canonical-home-map.md#map) for research findings — the plan consumes them through its link-only Inputs list.
