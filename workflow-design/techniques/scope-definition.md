---
metadata:
  version: 1.4.0
---

## Capability

Complete scope and structure definition as a lean scope manifest.

## Outputs

### scope_manifest

The complete file manifest: one entry per file to create/modify/remove with its full path, action, type, and one-line description.

#### artifact

`scope-manifest.md`

### file_count

Number of files in `{scope_manifest}`.

### scope_manifest_path

Absolute path to the written scope-manifest artifact (includes structural design and drafting order sections).

## Protocol

### 1. Verify Edit Root

- Verify `{target_path}` is present and checked out on `{workflow_branch}` (the dedicated session worktree from prepare-workflow-branch / ensure) before any path definitions proceed
- Do not treat the shared workflows library checkout as the edit root

### 2. Design Folder Structure

- Design the folder layout — `workflow-{id}/` with `activities/`, `techniques/`, `resources/` — and the file naming scheme: `NN-name.yaml` for activities and techniques, `NN-name.md` for resources

### 3. Enumerate Files

- Enumerate every file to create/modify/remove with full paths under `{target_path}/{workflow_id}/`: per-file path, action (create/modify/remove), type (workflow/activity/technique/resource/readme), and one-line description — no implicit files; capture as `{scope_manifest}` and set `{file_count}`

### 4. Assemble Structural Design

- Assemble `{$structural_design}` for the Structural design section of [scope-manifest](../resources/scope-manifest.md#template): directory tree (or "unchanged" for update), short transition note when topology changes, and a compact pattern-alignment table — not a pattern-comparison essay

### 5. Assemble Drafting Order

- Assemble `{$drafting_order}` for the Drafting order section of [scope-manifest](../resources/scope-manifest.md#template): drafting order (`workflow.yaml`, activities, techniques, resources, README) with a one-line rationale per tier

### 6. Persist Scope Manifest

- Persist `{scope_manifest}` together with `{$structural_design}` and `{$drafting_order}` via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and bare filename `scope-manifest.md`, following [scope-manifest](../resources/scope-manifest.md#template)
- Own facts only: link impact analysis and design specification rather than restating them
- Capture `{scope_manifest_path}`
