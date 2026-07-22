---
metadata:
  version: 1.3.0
---

## Capability

Schema-system and YAML-convention literacy for the design intent.

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

- Load all five JSON schema definitions from `workflow-server://schemas` (workflow, activity, technique, condition, state) — conformance reference for drafted content. Delivery: [resource-loading-via-tool](../../meta/techniques/workflow-engine/TECHNIQUE.md#resource-loading-via-tool).
- Read `schemas/README.md` for ontology, field tables, examples, and validation guidance

### 2. Load Design-Time Canon

- Load [anti-patterns](../resources/anti-patterns.md) and [schema-construct-inventory](../resources/schema-construct-inventory.md) once for literacy and later authoring (write-time application is the inherited `apply-anti-patterns-when-authoring` rule — do not restate Detect here)
- Load [convention-conformance](../resources/convention-conformance.md) as the sibling-workflow naming/structure baseline

### 3. Survey Reference Workflows

- Refresh the catalog via [list-workflows](../../meta/techniques/workflow-engine/list-workflows.md) and survey 2+ similar-type workflows from orchestrator-supplied definitions ([orchestrator-no-domain-work](../../meta/techniques/agent-conduct.md#orchestrator-no-domain-work) — workers do not load full workflow definitions)

### 4. Ground YAML Syntax

- Survey live workflow / activity / technique YAML for syntax grounding; operative YAML invariants live in [yaml-authoring](./yaml-authoring.md) Rules and [format-conventions](../resources/format-conventions.md)

### 5. Identify Constructs

- Cross-reference the schema field tables to identify applicable constructs with correct field names, types, required-property cross-checks, and reference-workflow examples

### 6. Persist Format Conventions

- When `{operation_type}` is `create` and `{planning_folder_path}` is bound: persist a concise format-conventions summary (YAML syntax rules and observed project conventions — naming, folder structure, field ordering, versions, transition and checkpoint shapes) via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `format-conventions.md`; capture `{format_conventions_path}`
- Skip when `{operation_type}` is `update` or `review`

### 7. Persist Applicable Constructs

- When `{operation_type}` is `create` and `{planning_folder_path}` is bound: persist the applicable-constructs list (construct name, why it applies, reference example) via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `applicable-constructs.md`; capture `{applicable_constructs_path}`
- Skip when `{operation_type}` is `update` or `review`
