---
metadata:
  version: 2.0.0
---

## Capability

Author syntactically valid YAML files that pass schema validation

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
- Note syntax patterns: block mappings (`key: value`), block sequences (`-` list items), nested indentation, scalar quoting, and block scalars for multi-line text

### 2. Read Schema Field Tables

- Read `schemas/README.md` for the field tables, required properties, and valid values for the `{schema_type}`

### 3. Plan Content

- Identify which schema fields will be used by consulting the JSON schema definition (`schemas/{schema_type}.schema.json`)
- Map each piece of content to the appropriate field and determine the correct YAML representation — prefer formal constructs from [schema-construct-inventory](../resources/schema-construct-inventory.md) over prose
- Cross-check required vs optional properties — id, version, name are required for activities; id, version, capability are required for techniques

### 4. Draft Content

- Write the `{yaml_file}` following YAML syntax rules exactly, using two-space indentation for each nesting level
- Represent arrays as a key followed by `-`-prefixed items on indented lines (a block sequence) — there is no count suffix
- Quote any scalar that contains a `: ` (colon-space), begins with a special character, or could be misread as a number or boolean
- Use a block scalar (`|` literal or `>` folded) for any multi-line string
- Write `description` / `outcome` / `message` / option prose in positive declarative present tense; do not bury procedure, rationale, or sequence in those fields

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

Always use semantic versioning X.Y.Z (e.g., 1.0.0)

### field-ordering

Follow the field ordering from existing files of the same type — typically id, version, name (or capability) and description first

### schema-reference

workflow.yaml files should include a `$schema` field pointing to the schema file path
