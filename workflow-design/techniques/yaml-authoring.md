---
metadata:
  version: 2.0.0
---

## Capability

Schema-valid workflow YAML files.

## Inputs

### schema_type

Which schema applies to this file — one of: workflow (`schemas/workflow.schema.json`), activity (`schemas/activity.schema.json`), technique (`schemas/technique.schema.json`)

### reference_file

*(optional)* Path to an existing valid YAML file of the same type to use as a syntax reference

## Outputs

### yaml_file

A syntactically valid YAML file that passes schema validation

## Protocol

### 1. Read Reference File

- Read the `{reference_file}` if one was supplied, otherwise read at least one existing valid YAML file matching the `{schema_type}`

### 2. Read Schema Field Tables

- Read `schemas/README.md` for the field tables, required properties, and valid values for the `{schema_type}`

### 3. Plan Content

- Identify which schema fields will be used by consulting the JSON schema definition (`schemas/{schema_type}.schema.json`)
- Map content to fields using formal constructs from [schema-construct-inventory](../resources/schema-construct-inventory.md); cross-check required vs optional properties for the `{schema_type}`

### 4. Draft Content

- Write `{yaml_file}` per Rules below (block arrays/mappings, scalar quoting, multi-line scalars, field ordering, version format)
- Description hygiene for prose fields: [design-principles](../resources/design-principles.md) §17 and Description Hygiene anti-patterns — do not bury procedure in `description` / `outcome` / `message` / option text

### 5. Validate Against Schema

- Validate the file against its JSON schema (`workflow.schema.json`, `activity.schema.json`, or `technique.schema.json`)

### 6. Run Workflow Validator

- Run `npx tsx scripts/validate-workflow-yaml.ts` for full workflow directory validation

### 7. Resolve Validation Failures

- Fix any validation errors and re-check
- If the parser cannot handle the file because it uses invalid syntax, compare the failing line against the same construct in an existing valid YAML file and fix the syntax
- If the file parses but does not conform to the schema, read the schema definition for the failing field and fix the content

## Rules

### block-style-arrays

Declare arrays as a key followed by `-`-prefixed items on indented lines (a block sequence). Do not annotate arrays with an item count.

### block-style-mappings

Prefer block style — nested objects are indented `key: value` lines. Reserve flow style (`{...}` / `[...]`) for short inline values only.

### scalar-quoting

Quote any scalar that contains a `: ` (colon-space), starts with a character YAML treats specially (`@`, `` ` ``, `|`, `>`, `&`, `*`, `!`, `%`, `#`, `-` followed by a space), or would otherwise parse as a number or boolean. Prefer double quotes when the value needs escape sequences.

### multi-line-scalars

Use a YAML block scalar (`|` to preserve newlines, `>` to fold) for multi-line text such as long descriptions or messages.

### version-format

Semantic versioning X.Y.Z — see also [convention-conformance](../resources/convention-conformance.md) for cross-workflow norms.

### field-ordering

Follow field ordering from existing files of the same type ([convention-conformance](../resources/convention-conformance.md)).

### schema-reference

workflow.yaml files should include a `$schema` field pointing to the schema file path
