---
metadata:
  version: 1.3.0
---

## Capability

Internalize the schema system and YAML-format conventions: load the authoritative JSON schemas and their documentation, survey reference workflows and sample YAML files, identify the schema constructs applicable to the design intent, and persist the literacy surfaces for review when the mode requires them.

## Outputs

### format_conventions_path

Absolute path to the written format-conventions artifact (create mode only).

#### artifact

`format-conventions.md`

### applicable_constructs_path

Absolute path to the written applicable-constructs artifact (create mode only).

#### artifact

`applicable-constructs.md`

## Protocol

### 1. Load Schemas

- Load all five JSON schema definitions (workflow, activity, technique, condition, state) from `workflow-server://schemas` — the conformance reference for all drafted content. Prefer `get_resource { session_index, resource_id }` (or the client's MCP resource-fetch) for `workflow-server://schemas` and sectioned schema ids; when `get_resource` is unavailable in this harness, fall back to reading the same schema JSON from the server workspace `schemas/` tree and note the fallback in the step output.
- Read `schemas/README.md` for the full schema ontology, entity relationships, field tables, examples, and validation guidance

### 2. Load Design-Time Canon

- Load [anti-patterns](../resources/anti-patterns.md) and [schema-construct-inventory](../resources/schema-construct-inventory.md) once for literacy and later authoring (write-time application is the inherited `apply-anti-patterns-when-authoring` rule — do not restate Detect here)
- Load [convention-conformance](../resources/convention-conformance.md) as the sibling-workflow naming/structure baseline

### 3. Survey Reference Workflows

- Refresh the workflow catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and survey 2+ reference workflows of similar type — sourcing their definitions from the workflow-server context the orchestrator supplies — as the pattern baseline (workers do not load full workflow definitions directly)

### 4. Ground YAML Syntax

- Read existing YAML files (workflow / activity / technique) to ground YAML syntax understanding: block mappings (`key: value`), block sequences (`-`-prefixed items), nested indentation, and scalar quoting

### 5. Identify Constructs

- Cross-reference the schema field tables to identify applicable constructs with correct field names, types, required-property cross-checks, and reference-workflow examples

### 6. Persist Format Conventions

- When `{operation_type}` is `create` and `{planning_folder_path}` is bound: persist a concise format-conventions summary (YAML syntax rules and observed project conventions — naming, folder structure, field ordering, versions, transition and checkpoint shapes) via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `format-conventions.md`; capture `{format_conventions_path}`
- Skip when `{operation_type}` is `update` or `review`

### 7. Persist Applicable Constructs

- When `{operation_type}` is `create` and `{planning_folder_path}` is bound: persist the applicable-constructs list (construct name, why it applies, reference example) via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `applicable-constructs.md`; capture `{applicable_constructs_path}`
- Skip when `{operation_type}` is `update` or `review`
