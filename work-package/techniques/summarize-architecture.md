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

### changed-files

List of files changed in the implementation

### planning-folder-path

Path to planning folder for context

### design-philosophy-doc

*(optional)* Design philosophy with scope and rationale

## Protocol

### 1. Identify Scope

- Determine which architectural components are affected by the changes
- Map changed files to modules and subsystems
- Identify external interactions and boundaries
- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[diagram-source-select](./gitnexus-operations/diagram-source-select.md) to bound diagram scope to the affected processes and source diagram structure from graph resources.

### 2. Create Context Diagram

- Create Mermaid system context diagram
- Show the system and its external interactions
- Use C4 system context notation

### 3. Create Package Diagram

- If module structure is affected, create package diagram
- Show internal organization and boundaries
- Use Mermaid syntax
- Source package-diagram structure via [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[diagram-source-select](./gitnexus-operations/diagram-source-select.md) `{diagram_type: 'package'}` (functional-area clusters and their members) when the codebase is indexed.

### 4. Create Sequence Diagrams

- For key flows affected by changes, create sequence diagrams
- Show interactions between components
- Use Mermaid sequence diagram syntax
- Source sequence-diagram structure via [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[diagram-source-select](./gitnexus-operations/diagram-source-select.md) `{diagram_type: 'sequence'}` (step-by-step execution traces) when the codebase is indexed.

### 5. Write Summary

- Create architecture-summary.md in planning folder
- Combine diagrams with narrative explanation
- Focus on impact, scope, and risk
- Follow the architecture-summary template in [architecture-summary](../resources/architecture-summary.md)

## Outputs

### architecture-summary

Stakeholder-facing architecture summary with diagrams

- **artifact**: `architecture-summary.md`
- **system_context_diagram**: Mermaid system context diagram
- **package_diagram**: Package or container diagram when applicable
- **sequence_diagrams**: Sequence diagrams for key flows
- **narrative**: Narrative explanation of impact and scope

## Rules

### stakeholder-audience

Write for management stakeholders — focus on impact, scope, and risk, not implementation details

### diagrams-required

Every summary must include at least a system context diagram — other diagrams as warranted by change scope

### mermaid-format

Use Mermaid diagram syntax for all diagrams — ensures they render in GitHub and Confluence

## Errors

### no_significant_changes

**Cause:** Changes are too minor for architectural summary

**Recovery:** Create minimal summary noting low architectural impact
