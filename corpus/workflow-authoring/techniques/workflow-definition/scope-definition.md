---
metadata:
  version: 1.2.0
---

## Capability

Complete file-level scope and structural shape for a change, as a lean manifest.

## Inputs

### change_brief

The change brief for this run — purpose and the dimensions the change alters.

### change_constraints

*(optional)* The co-change set and identifier-collision set derived from an impact pass: files that must move together, and names already taken. Absent on a run with no existing definition to assess.

### removals_approved

Whether the inventoried content removals are approved. False means the manifest preserves the flagged content instead of removing it.

### workflow_id

The id of the workflow being created or updated.

## Outputs

### manifest_entries

The complete file manifest — one entry per file to create, modify or remove, each with its full path under the target workflow directory, its action, its kind, and a one-line statement of the change.

### scope_manifest_report

The rendered scope manifest: the file table from `{manifest_entries}` with the structural design and drafting order sections. Shaped by [Template](../../resources/scope-manifest.md#template).

#### artifact

`scope-manifest.md`

#### audience

`human`

### file_count

Number of entries in `{manifest_entries}`.

## Protocol

### 1. Design the Folder Structure

- Design the target's folder layout — the workflow directory with `activities/`, `techniques/` and `resources/` — and the file naming scheme, taking both from [Reference Conventions](/canon/resources/convention-conformance.md#reference-conventions) rather than inventing one

### 2. Enumerate the Files

- Enumerate every file to create, modify or remove with its full path under `{target_path}/{workflow_id}/`: path, action, kind and a one-line statement of the change — no implicit files; capture the entries as `{manifest_entries}`
- When `{change_constraints}` is present, add every file its co-change set names, and check each new identifier against its collision set before the manifest fixes a name
- When `{removals_approved}` is false, record the flagged content as preserved and drop the corresponding remove entries
- Set `{file_count}` to the number of entries in `{manifest_entries}`

### 3. Assemble the Structural Design

- Assemble the Structural design section of [Template](../../resources/scope-manifest.md#template): the directory tree, or an explicit statement that the layout is unchanged; a short note on changed graph bindings wherever the topology changes; and a compact alignment table against the conventions — not a comparison essay

### 4. Assemble the Drafting Order

- Assemble the Drafting order section of [Template](../../resources/scope-manifest.md#template): root definition, activities, techniques, resources, README, each tier with a one-line rationale

### 5. Render the Manifest Report

- Render the file table from `{manifest_entries}` with both sections into `{scope_manifest_report}` at the shape [Template](../../resources/scope-manifest.md#template) declares
- Link `{change_brief}` and the impact classification on the Basis line

## Rules

### no-implicit-files

A file the change touches and the manifest does not name is out of scope for this run. Drafting authors what the manifest names and nothing else.
