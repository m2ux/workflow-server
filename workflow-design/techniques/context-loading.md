---
metadata:
  version: 1.1.0
---

## Capability

Internalize the schema system and YAML-format conventions before drafting: load the authoritative JSON schemas and their documentation, survey reference workflows and sample YAML files, identify the schema constructs applicable to the design intent, and persist the literacy surfaces that `format-literacy` and `constructs-confirmed` link for review.

## Outputs

### format_conventions_path

Absolute path to the written format-conventions artifact. Interpolated into the `format-literacy` checkpoint message as a markdown link.

#### artifact

`format-conventions.md`

### applicable_constructs_path

Absolute path to the written applicable-constructs artifact. Interpolated into the `constructs-confirmed` checkpoint message as a markdown link.

#### artifact

`applicable-constructs.md`

## Protocol

### 1. Load Schemas

- Fetch the `workflow-server://schemas` MCP resource to load all five JSON schema definitions (workflow, activity, technique, condition, state) — the conformance reference for all drafted content
- Read `schemas/README.md` for the full schema ontology, entity relationships, field tables, examples, and validation guidance

### 2. Survey References

- Refresh the workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and survey 2+ reference workflows of similar type — sourcing their definitions from the workflow-server context the orchestrator supplies — as the pattern baseline (the executing worker does not call `get_workflow` directly)
- Read existing YAML files (workflow / activity / technique) to ground YAML syntax understanding: block mappings (`key: value`), block sequences (`-`-prefixed items), nested indentation, and scalar quoting

### 3. Identify Constructs

- Cross-reference the schema field tables to identify applicable constructs with correct field names, types, required-property cross-checks, and reference-workflow examples

### 4. Persist Literacy Surfaces

- When `{planning_folder_path}` is bound and review mode is not active: persist a concise format-conventions summary (YAML syntax rules and observed project conventions — naming, folder structure, field ordering, versions, transition and checkpoint shapes) via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` `{planning_folder_path}` and bare filename `format-conventions.md`; capture `{format_conventions_path}`
- Persist the applicable-constructs list (construct name, why it applies, reference example) the same way with bare filename `applicable-constructs.md`; capture `{applicable_constructs_path}`
- Skip both persists in review mode (literacy gates are skipped)
