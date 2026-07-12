---
metadata:
  version: 1.0.0
---

## Capability

Internalize the schema system and YAML-format conventions before drafting: load the authoritative JSON schemas and their documentation, survey reference workflows and sample YAML files, identify the schema constructs applicable to the design intent, and present the observed conventions as the literacy-confirmation surface.

## Protocol

### 1. Load Schemas

- Fetch the `workflow-server://schemas` MCP resource to load all five JSON schema definitions (workflow, activity, technique, condition, state) — the conformance reference for all drafted content
- Read `schemas/README.md` for the full schema ontology, entity relationships, field tables, examples, and validation guidance

### 2. Survey References

- Refresh the workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and survey 2+ reference workflows of similar type — sourcing their definitions from the workflow-server context the orchestrator supplies — as the pattern baseline (the executing worker does not call `get_workflow` directly)
- Read existing YAML files (workflow / activity / technique) to ground YAML syntax understanding: block mappings (`key: value`), block sequences (`-`-prefixed items), nested indentation, and scalar quoting

### 3. Identify Constructs

- Cross-reference the schema field tables to identify applicable constructs with correct field names, types, required-property cross-checks, and reference-workflow examples

### 4. Present Conventions

- Present a user-facing summary of the observed conventions — naming, folder structure, field ordering, versions, transition and checkpoint shapes — as the literacy-confirmation surface
