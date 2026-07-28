---
metadata:
  version: 1.0.0
---

## Capability

Schema-valid definition file authored from a manifest entry.

## Inputs

### current_file

The manifest entry to author — full path, action, kind and the one-line statement of its change. Its kind selects which schema applies: root definition, activity, or technique.

### reference_file

*(optional)* Path to an existing valid file of the same kind, used as the syntax reference. Absent means any valid sibling of that kind serves.

## Outputs

### yaml_file

The authored file at the manifest entry's path, parsing cleanly and conforming to the schema its kind selects.

## Protocol

### 1. Read a Reference of the Same Kind

- Read `{reference_file}` when supplied; otherwise read at least one existing valid file of the kind `{current_file}` names

### 2. Read the Schema Field Tables

- Read `schemas/README.md` for the field table, required properties and allowed values of that kind

### 3. Plan the Content

- Identify which fields the content needs from the JSON schema for that kind
- Map the content onto formal constructs, taking the table for its own level from [Activity-Level Constructs](../../../workflow-design/resources/schema-construct-inventory.md#activity-level-constructs-activityschemajson), [Workflow-Level Constructs](../../../workflow-design/resources/schema-construct-inventory.md#workflow-level-constructs-workflowschemajson) or [Technique-Level Constructs](../../../workflow-design/resources/schema-construct-inventory.md#technique-level-constructs-techniqueschemajson), plus [Condition Constructs](../../../workflow-design/resources/schema-construct-inventory.md#condition-constructs-conditionschemajson) wherever a gate is authored
- Cross-check required against optional properties before drafting rather than after validation fails

### 4. Draft the Content

- Write `{yaml_file}` at the path `{current_file}` names, under the Rules below

### 5. Validate Against the Schema

- Validate the drafted file against the JSON schema its kind selects

### 6. Resolve Validation Failures

- Where the parser rejects the file, compare the failing line against the same construct in the reference file and correct the syntax
- Where the file parses but does not conform, read the schema definition for the failing field and correct the content
- Re-validate until the file passes

## Rules

### block-style-arrays

Declare arrays as a key followed by `-`-prefixed items on indented lines. Do not annotate an array with an item count.

### block-style-mappings

Prefer block style — nested objects are indented `key: value` lines. Reserve flow style for short inline values.

### scalar-quoting

Quote any scalar containing a colon-space, starting with a character YAML treats specially, or that would otherwise parse as a number or boolean. Prefer double quotes where the value needs escape sequences.

### multi-line-scalars

Use a block scalar for multi-line text — `|` to preserve newlines, `>` to fold.

### version-format

Versions are semantic X.Y.Z, per [Reference Conventions](../../../workflow-design/resources/convention-conformance.md#reference-conventions).

### field-ordering

Field order follows existing files of the same kind, per [Reference Conventions](../../../workflow-design/resources/convention-conformance.md#reference-conventions).

### schema-reference

A root definition file declares a `$schema` field naming its schema at the same relative depth every sibling uses.
