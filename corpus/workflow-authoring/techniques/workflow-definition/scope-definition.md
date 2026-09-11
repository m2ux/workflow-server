---
metadata:
  version: 1.1.0
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

## Outputs

### scope_manifest

The complete file manifest — one entry per file to create, modify or remove, each with its full path under the target workflow directory, its action, its kind, and a one-line statement of the change. Carries the structural design and drafting order sections alongside the table. Shaped by [Template](../../resources/scope-manifest.md#template).

#### artifact

`scope-manifest.md`

#### audience

`human`

### file_count

Number of entries in `{scope_manifest}`.

## Protocol

### 1. Design the Folder Structure

- Design the target's folder layout — the workflow directory with `activities/`, `techniques/` and `resources/` — and the file naming scheme, taking both from [Reference Conventions](../../../workflow-design/resources/convention-conformance.md#reference-conventions) rather than inventing one

### 2. Enumerate the Files

- Enumerate every file to create, modify or remove with its full path under `{target_path}/{workflow_id}/`: path, action, kind and a one-line statement of the change — no implicit files
- When `{change_constraints}` is present, add every file its co-change set names, and check each new identifier against its collision set before the manifest fixes a name
- When `{removals_approved}` is false, record the flagged content as preserved and drop the corresponding remove entries
- Set `{file_count}` to the number of entries

### 3. Assemble the Structural Design

- Assemble the structural-design section the guide declares: the directory tree, or an explicit statement that the layout is unchanged; a short note wherever the transition topology changes; and a compact alignment table against the conventions — not a comparison essay

### 4. Assemble the Drafting Order

- Assemble the drafting-order section the guide declares: root definition, activities, techniques, resources, README, each tier with a one-line rationale

### 5. Compose the Manifest

- Fold the table and both sections into `{scope_manifest}` at the shape [Template](../../resources/scope-manifest.md#template) declares
- Link the change brief and the impact classification for purpose and removals rather than restating either

## Rules

### no-implicit-files

A file the change touches and the manifest does not name is out of scope for this run. Drafting authors what the manifest names and nothing else, so a file discovered mid-draft returns here rather than being written quietly.
