---
metadata:
  version: 1.0.0
---

## Capability

Create a high-level architecture summary with UML-style diagrams for management stakeholders, visualizing how the fix changes the system.

## Outputs

### architecture_summary_doc

Stakeholder-facing architecture summary with a system context diagram, a package diagram when module structure is affected, and sequence diagrams for the key flows the fix changes.

#### artifact

`architecture-summary.md`

## Protocol

### 1. Summarize Architecture

- Write `{architecture_summary_doc}` under `{planning_folder_path}`.
- Include a system context diagram.
- Include a package diagram when the fix affects module structure, sourcing its structure via [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[diagram-source-select](../../../meta/techniques/gitnexus-operations/diagram-source-select.md)(diagram_type: `package`) when the codebase is indexed.
- Include sequence diagrams for the key flows the fix changes, sourcing their structure via [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[diagram-source-select](../../../meta/techniques/gitnexus-operations/diagram-source-select.md)(diagram_type: `sequence`) when the codebase is indexed.
- Write for management stakeholders, not implementation details.
