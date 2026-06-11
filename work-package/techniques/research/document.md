---
metadata:
  version: 1.0.0
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

Knowledge base and web research synthesis artifact for the work package (inherited from the [research](./TECHNIQUE.md) group root; declared here as the binding contract). Written to `{planning_folder_path}` as `kb-research.md`, capturing `{kb_findings}`, `{web_findings}`, `{findings_synthesis}`, `{applicable_patterns}`, and risks.

## Protocol

### 1. Create Research Artifact

- Create the `{research_document}` artifact in `{planning_folder_path}`
- Include `{kb_findings}`, `{web_findings}`, `{findings_synthesis}`, `{applicable_patterns}`, and risks
