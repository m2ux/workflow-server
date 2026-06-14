---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Design, draft, update, and audit workflow definitions that maximize schema expressiveness and follow established conventions. Operations inherit the shared inputs, outputs, and rules below.

## Inputs

### user_description

Free-form description of the workflow the user wants to create or modify

### target_workflow_id

*(optional)* Existing workflow id to modify (update mode) or to audit (review mode)

## Outputs

### workflow_files

Complete workflow definition: `workflow.toon`, activity files, technique files, resource files, README

#### workflow_definition

Root workflow definition with metadata, modes, variables, rules, artifactLocations

#### activity_files

One `.toon` file per activity with steps, checkpoints, transitions

#### technique_files

One `.toon` file per technique with protocol, inputs, output, rules

#### resource_files

Markdown resource files for agent guidance

#### readme_file

Workflow README with description, activity table, and usage

## Rules

### workflow-rules-authoritative

Cross-cutting design invariants live in `workflow.toon` `rules[]`. Apply those as the single source of truth; this technique does not duplicate them.

### resource-loading

Load each entry in a technique's referenced resources via `get_resource` after `get_technique` — refs are lightweight until loaded.

### tool-usage

`list_workflows` requires no params and no session token
