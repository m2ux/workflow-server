---
metadata:
  version: 2.0.0
---

## Capability

Create high-level architecture summary with Mermaid diagrams for management stakeholders

## Inputs

### changed_files

List of files changed in the implementation

### package_diagram_source

*(optional)* The functional areas the change reaches, each with its members — the structure a package diagram is drawn from.

### sequence_diagram_source

*(optional)* The ordered step trace of each execution flow the change runs through — the structure a sequence diagram is drawn from.

### design_philosophy_doc

*(optional)* Design [philosophy](../resources/design-framework.md#design-philosophy-artifact-template) with the problem statement and its classification

## Outputs

### architecture_summary

Stakeholder-facing architecture [summary](../resources/architecture-summary.md#architecture-summary-artifact-template) with diagrams

#### artifact

`architecture-summary.md`

#### audience

`human`

## Protocol

### 1. Identify Scope

- Determine which architectural components are affected by the changes
- Map each entry in `{changed_files}` to its modules and subsystems
- Identify external interactions and boundaries
- Select which diagram types the change warrants, and their notation, per [Diagram Selection](../resources/architecture-summary.md#diagram-selection).
- If the changes are too minor to warrant a full architectural summary, create a minimal summary noting the low architectural impact, with the context diagram alone.

### 2. Create Context Diagram

- Create Mermaid system context diagram
- Show the system and its external interactions
- Use C4 system context notation

### 3. Draw Second Diagram

- Where the change warrants a second diagram per [Diagram Selection](../resources/architecture-summary.md#diagram-selection), draw the one that shows it best, in Mermaid
  > - For a change to module structure, draw the package diagram from `{package_diagram_source}` — the functional areas the change reaches, with their members — so the boundaries are the ones the graph measured rather than the ones the directory layout suggests.
  > - For a change to a key flow, draw the sequence diagram from `{sequence_diagram_source}` — the ordered step trace of the execution flow the change runs through — rather than from a hand-traced call sequence.

### 4. Write Summary

- Create the `{architecture_summary}` under `{planning_folder_path}`
- Combine diagrams with narrative explanation
- Focus on impact, scope, and risk, drawing the problem and why it matters from `{design_philosophy_doc}` when it is provided
- Follow the [Architecture Summary Artifact Template](../resources/architecture-summary.md#architecture-summary-artifact-template)
- Write for management stakeholders — not implementation details

## Rules

### diagrams-required

Every summary includes a system context diagram, within the diagram limit the guide's [Rules](../resources/architecture-summary.md#rules) set

### mermaid-format

Use Mermaid diagram syntax for all diagrams — ensures they render in GitHub and Confluence
