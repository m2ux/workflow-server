---
metadata:
  version: 1.8.0
---

## Capability

Schema-system and YAML-convention literacy for the design intent.

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

- Load the JSON schema definitions the [schema-construct-inventory](/canon/resources/schema-construct-inventory.md#universal-obligation) names as served at `workflow-server://schemas` — the conformance reference for drafted content. That URI is an MCP resource, read as a resource rather than by resource id.

### 2. Load Design-Time Canon

- Load [anti-patterns](/canon/resources/anti-patterns.md) and [schema-construct-inventory](/canon/resources/schema-construct-inventory.md) once for literacy and later authoring (write-time application is the inherited `apply-anti-patterns-when-authoring` rule — do not restate Detect here)
- Load [convention-conformance](/canon/resources/convention-conformance.md) as the sibling-workflow naming/structure baseline

### 3. Survey Reference Workflows

- Survey 2+ similar-type workflows from the catalog and the definitions the orchestrator supplies; a worker does not load full workflow definitions itself

### 4. Ground YAML Syntax

- Survey live workflow / activity / technique YAML for syntax grounding; operative YAML invariants live in [yaml-authoring](./yaml-authoring.md) Rules and [format-conventions](../resources/format-conventions.md#rules)

### 5. Identify Constructs

- Cross-reference the schema field tables to identify applicable constructs with correct field names, types, required-property cross-checks, and reference-workflow examples

### 6. Assemble Format Conventions

- When `{operation_type}` is `create` or `update`: assemble `{format_conventions}` at the shape [Template](../resources/format-conventions.md#template) declares, under its [Rules](../resources/format-conventions.md#rules)

### 7. Assemble Applicable Constructs

- When `{operation_type}` is `create` or `update`: assemble `{applicable_constructs}` at the shape [Template](../resources/applicable-constructs.md#template) declares, under its [Rules](../resources/applicable-constructs.md#rules)
