---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Internalize the schema system and YAML-format conventions before drafting: load the authoritative JSON schemas and their documentation, survey reference workflows and sample YAML files, identify the schema constructs applicable to the design intent, and present the observed conventions as the literacy-confirmation surface.

## Protocol

### 1. Load Schemas

- Fetch the `workflow-server://schemas` MCP resource to load all five JSON schema definitions (workflow, activity, technique, condition, state) — the conformance reference for all drafted content
- Read `schemas/README.md` for the full schema ontology, entity relationships, field tables, examples, and validation guidance

### 2. Survey References

- Call `list_workflows` and `get_workflow` for 2+ reference workflows of similar type as the pattern baseline
- Read existing YAML files (workflow / activity / technique) to ground YAML syntax understanding: key-value pairs, `[N]` array suffixes, nested objects, inline `{}` shorthand

### 3. Identify Constructs

- Cross-reference the schema field tables to identify applicable constructs with correct field names, types, required-property cross-checks, and reference-workflow examples

### 4. Present Conventions

- Present a user-facing summary of the observed conventions — naming, folder structure, field ordering, versions, transition and checkpoint shapes — as the literacy-confirmation surface
