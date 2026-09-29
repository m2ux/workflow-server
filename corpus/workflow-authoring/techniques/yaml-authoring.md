---
metadata:
  version: 1.1.0
---

## Capability

Schema-valid definition file authored from a manifest entry.

## Inputs

### current_file

The file to author — full path, action and kind, with a one-line statement of its change. Its kind selects which schema applies: root definition, activity, or technique.

### selected_findings

*(optional)* Findings whose fixes are the change to author, each naming a file, a construct and the corrective action its criteria entry prescribes. When present, these name the files to author and bound how much of each may change.

### reference_file

*(optional)* Path to an existing valid file of the same kind, used as the syntax reference. Absent means any valid sibling of that kind serves.

## Outputs

### yaml_file

The authored file at the manifest entry's path.

### schema_conforms

True when `{yaml_file}` parses and conforms to the schema its kind selects. False when this pass left a validation failure.

## Protocol

### 1. Read a Reference of the Same Kind

- Read `{reference_file}` when supplied; otherwise read at least one existing valid file of the kind `{current_file}` names

### 2. Read the Schema Field Tables

- Read the JSON schema for that kind from `workflow-server://schemas` for its fields, required properties and allowed values

### 3. Plan the Content

- Identify which fields the content needs from the JSON schema for that kind
- When `{selected_findings}` is present, the files to author are the ones those findings cite, and the planned change is exactly what each finding's fix prescribes
- Map the content onto formal constructs, taking the table for its own level from [Schema Construct Inventory](/canon/resources/schema-construct-inventory.md), plus its condition table wherever a gate is authored
- Cross-check required against optional properties before drafting rather than after validation fails

### 4. Draft the Content

- Write `{yaml_file}` at the path `{current_file}` names, in the style [YAML style](../resources/yaml-style.md) states

### 5. Validate Against the Schema

- Validate the drafted file against the JSON schema its kind selects

### 6. Resolve Validation Failures

- Where the parser rejects the file, compare the failing line against the same construct in the reference file and correct the syntax
- Where the file parses but does not conform, read the schema definition for the failing field and correct the content
- Validate once more. Set `{schema_conforms}` true when the file passes, and false when a failure remains.

## Rules

### smallest-edit-that-resolves

An edit authored to resolve a finding is the smallest change that resolves it. Content no finding names is preserved, and rewriting a region because it was already open is not part of the fix.

### a-step-binds-only-its-deviations

A step binding a technique with no deviation uses the bare-string form (`technique: group::technique`). Its `inputs` list only the inputs whose value differs from same-name binding or a declared `default`, and its `outputs` only the outputs whose landed bag name differs from the output's own id.

### a-name-mismatch-is-closed-at-the-caller

Where the bag and a technique name one value differently, the caller's bag variable takes the technique's input id, or the step carries one `inputs` rename. The technique keeps its own names.

### a-foreign-technique-is-qualified

A technique from any other group or namespace, a `meta` group included, is written qualified (`gitnexus::analyze`, `review-assumptions::reconcile`). A standalone `meta` technique is written bare (`verify-artifact-conforms`): a bare name resolves in the referring workflow, then in `meta`.
