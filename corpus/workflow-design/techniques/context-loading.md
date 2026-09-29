---
metadata:
  version: 1.8.0
---

## Capability

Schema-system and YAML-convention literacy for the design intent.

## Inputs

### operation_type

The classified operation — `create`, `update` or `review`. Selects whether the literacy artifacts are assembled.

## Outputs

### format_conventions

The format-conventions summary for this change, at the shape [Template](../resources/format-conventions.md#template) declares. Assembled on a create or update run; absent on a review run.

#### artifact

`format-conventions.md`

#### audience

`human`

### applicable_constructs

The applicable-constructs list for this change, at the shape [Template](../resources/applicable-constructs.md#template) declares. Assembled on a create or update run; absent on a review run.

#### artifact

`applicable-constructs.md`

#### audience

`human`

## Protocol

### 1. Load Schemas

- Load all five JSON schema definitions from `workflow-server://schemas` (workflow, activity, technique, condition, state) — conformance reference for drafted content. Delivery: [resource-loading-via-tool](/meta/techniques/workflow-engine/TECHNIQUE.md#resource-loading-via-tool).
### 2. Load Design-Time Canon

- Load [anti-patterns](/canon/resources/anti-patterns.md) and [schema-construct-inventory](/canon/resources/schema-construct-inventory.md) once for literacy and later authoring (write-time application is the inherited `apply-anti-patterns-when-authoring` rule — do not restate Detect here)
- Load [convention-conformance](/canon/resources/convention-conformance.md) as the sibling-workflow naming/structure baseline

### 3. Survey Reference Workflows

- Refresh the catalog via [list-workflows](/meta/techniques/workflow-engine/list-workflows.md) and survey 2+ similar-type workflows from orchestrator-supplied definitions ([no-domain-work](/meta/techniques/orchestrator-conduct.md#no-domain-work) — workers do not load full workflow definitions)

### 4. Ground YAML Syntax

- Survey live workflow / activity / technique YAML for syntax grounding; operative YAML invariants live in [yaml-authoring](./yaml-authoring.md) Rules and [format-conventions](../resources/format-conventions.md#rules)

### 5. Identify Constructs

- Cross-reference the schema field tables to identify applicable constructs with correct field names, types, required-property cross-checks, and reference-workflow examples

### 6. Assemble Format Conventions

- When `{operation_type}` is `create` or `update`: assemble `{format_conventions}` at the shape [Template](../resources/format-conventions.md#template) declares, under its [Rules](../resources/format-conventions.md#rules)

### 7. Assemble Applicable Constructs

- When `{operation_type}` is `create` or `update`: assemble `{applicable_constructs}` at the shape [Template](../resources/applicable-constructs.md#template) declares, under its [Rules](../resources/applicable-constructs.md#rules)
