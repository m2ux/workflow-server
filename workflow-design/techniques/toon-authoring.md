---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 1
  legacy_id: 1
---

## Capability

Author syntactically valid TOON files that pass schema validation

## Inputs

### schema_type

Which schema applies to this file — one of: workflow (`schemas/workflow.schema.json`), activity (`schemas/activity.schema.json`), technique (`schemas/technique.schema.json`)

### reference_file

*(optional)* Path to an existing valid TOON file of the same type to use as a syntax reference

## Protocol

### 1. Read Reference

- Read the `{reference_file}` if one was supplied, otherwise read at least one existing valid TOON file matching the `{schema_type}`
- Note syntax patterns: key-value pairs, array declarations, nested objects, quoted strings
- Read `schemas/README.md` for the field tables, required properties, and valid values for the `{schema_type}`

### 2. Plan Content

- Identify which schema fields will be used by consulting the JSON schema definition (`schemas/{schema_type}.schema.json`)
- Map each piece of content to the appropriate field and determine the correct TOON syntax
- Cross-check required vs optional properties — id, version, name are required for activities; id, version, capability are required for techniques

### 3. Draft Content

- Write the `{toon_file}` following TOON syntax rules exactly
- Use the `key[N]` suffix for arrays with explicit count
- Quote any string value that contains a colon

### 4. Validate

- Validate the file against its JSON schema (`workflow.schema.json`, `activity.schema.json`, or `technique.schema.json`)
- Run `npx tsx scripts/validate-workflow-toon.ts` for full workflow directory validation
- Fix any validation errors and re-check
- If the parser cannot handle the file because it uses invalid syntax, compare the failing line against the same construct in an existing valid TOON file and fix the syntax
- If the file parses but does not conform to the schema, read the schema definition for the failing field and fix the content

## Outputs

### toon_file

A syntactically valid TOON file that passes schema validation

## Rules

### no-json-syntax

Never use JSON syntax in TOON files — no curly braces for objects, no square brackets for arrays, no commas between items

### no-yaml-nesting

TOON uses indentation for nesting but is not YAML — do not use YAML-specific features like anchors or flow sequences

### array-declaration

Declare arrays with key[N] where N is the item count, then list items with indentation using - prefix

### inline-objects

For simple tabular data, use the inline shorthand: key[N]{field1,field2} followed by indented rows of comma-separated values

### version-format

Always use semantic versioning X.Y.Z (e.g., 1.0.0)

### field-ordering

Follow the field ordering from existing files of the same type — typically id, version, name, description first

### schema-reference

workflow.toon files should include a \$schema field pointing to the schema file path
