---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 20
  legacy_id: 20
---

## Capability

Create high-level architecture summary with Mermaid diagrams for management stakeholders

## Inputs

### changed_files

List of files changed in the implementation

### design_philosophy_doc

*(optional)* Design [philosophy](../resources/design-framework.md#design-philosophy-artifact-template) with scope and rationale

### planning_folder_path

Folder where the architecture summary is written

## Protocol

### 1. Identify Scope

- Determine which architectural components are affected by the changes
- Map each entry in `{changed_files}` to its modules and subsystems
- Identify external interactions and boundaries
- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[diagram-source-select](./gitnexus-operations/diagram-source-select.md) to bound diagram scope to the affected processes and source diagram structure from graph resources.
- If the changes are too minor to warrant a full architectural summary, create a minimal summary noting the low architectural impact rather than the full set of diagrams.

### 2. Create Context Diagram

- Create Mermaid system context diagram
- Show the system and its external interactions
- Use C4 system context notation

### 3. Create Package Diagram

- If module structure is affected, create package diagram
- Show internal organization and boundaries
- Use Mermaid syntax
- Source package-diagram structure via [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[diagram-source-select](./gitnexus-operations/diagram-source-select.md)(diagram-type: `package`) (functional-area clusters and their members) when the codebase is indexed.

### 4. Create Sequence Diagrams

- For key flows affected by changes, create sequence diagrams
- Show interactions between components
- Use Mermaid sequence diagram syntax
- Source sequence-diagram structure via [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[diagram-source-select](./gitnexus-operations/diagram-source-select.md)(diagram-type: `sequence`) (step-by-step execution traces) when the codebase is indexed.

### 5. Write Summary

- Create the `{architecture_summary}` under `{planning_folder_path}`
- Combine diagrams with narrative explanation
- Focus on impact, scope, and risk, drawing scope and rationale from `{design_philosophy_doc}` when it is provided
- Follow the architecture-summary template in [architecture-summary](../resources/architecture-summary.md)

## Outputs

### architecture_summary

Stakeholder-facing architecture [summary](../resources/architecture-summary.md#architecture-summary-artifact-template) with diagrams

#### architecture_summary_artifact

`architecture-summary.md`

## Rules

### stakeholder-audience

Write for management stakeholders — focus on impact, scope, and risk, not implementation details

### diagrams-required

Every summary must include at least a system context diagram — other diagrams as warranted by change scope

### mermaid-format

Use Mermaid diagram syntax for all diagrams — ensures they render in GitHub and Confluence
