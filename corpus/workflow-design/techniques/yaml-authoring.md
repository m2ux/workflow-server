---
metadata:
  version: 2.2.0
---

## Capability

Schema-valid workflow YAML files.

## Inputs

### schema_type

Which schema applies to this file — one of `workflow`, `activity` or `technique`

### reference_file

*(optional)* Path to an existing valid YAML file of the same type to use as a syntax reference

### draft_correction

*(optional)* Text the reader typed naming the changes an already drafted file takes, or the fresh approach a redraft of it takes. Unset on a first draft.

## Outputs

### drafted_files

The set of files drafted for this workflow so far, extended with the one just written — each syntactically valid and passing schema validation for its type.

## Protocol

### 1. Read Reference File

- Read the `{reference_file}` if one was supplied, otherwise read at least one existing valid YAML file matching the `{schema_type}`

### 2. Read Schema Field Tables

- Read the JSON schema for `{schema_type}` from `workflow-server://schemas` for its fields, required properties, and valid values

### 3. Plan Content

- Identify which schema fields will be used from the JSON schema for `{schema_type}`
- Map content to fields using formal constructs from [schema-construct-inventory](/canon/resources/schema-construct-inventory.md); cross-check required vs optional properties for the `{schema_type}`
- When `{draft_correction}` is bound, the planned content applies it: the changes it names over the existing draft, or the fresh approach it gives for a redraft

### 4. Draft Content

- Write the file per Rules below (block arrays/mappings, scalar quoting, multi-line scalars, field ordering, version format), adding it to `{drafted_files}`
- Description hygiene for prose fields: [Document in Positive Present](/canon/resources/design-principles.md#17-document-in-positive-present) and Description Hygiene anti-patterns — do not bury procedure in `description` / `outcome` / `message` / option text

### 5. Validate Against Schema

- Validate the file against the JSON schema for `{schema_type}`

### 6. Run Workflow Validator

- Run `npx tsx guards/validate-workflow-yaml.ts` for full workflow directory validation

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

Semantic versioning X.Y.Z — see also [convention-conformance](/canon/resources/convention-conformance.md) for cross-workflow norms.

### field-ordering

Follow field ordering from existing files of the same type ([convention-conformance](/canon/resources/convention-conformance.md)).

### schema-reference

workflow.yaml files should include a `$schema` field pointing to the schema file path

### a-step-binds-only-its-deviations

A step binding a technique with no deviation uses the bare-string form (`technique: group::technique`). Its `inputs` list only the inputs whose value differs from same-name binding or a declared `default`, and its `outputs` only the outputs whose landed bag name differs from the output's own id.

### a-name-mismatch-is-closed-at-the-caller

Where the bag and a technique name one value differently, the caller's bag variable takes the technique's input id, or the step carries one `inputs` rename. The technique keeps its own names.

### a-foreign-technique-is-qualified

A technique from any other group or namespace, a `meta` group included, is written qualified (`gitnexus::analyze`, `review-assumptions::reconcile`). A standalone `meta` technique is written bare (`verify-artifact-conforms`): a bare name resolves in the referring workflow, then in `meta`.
