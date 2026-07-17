---
metadata:
  version: 1.3.1
---

## Capability

Define the complete scope and structure: verify the workflows worktree, enumerate every file to create/modify/remove, note structural shape and drafting order briefly, and persist a lean scope manifest for activity-layer review.

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

### 1. Verify Worktree

- Verify the workflows branch is present and checked out at the expected path before any path definitions proceed

### 2. Design Folder Structure

- Design the folder layout — `workflow-{id}/` with `activities/`, `techniques/`, `resources/` — and the file naming scheme: `NN-name.yaml` for activities and techniques, `NN-name.md` for resources

### 3. Enumerate Files

- Enumerate every file to create/modify/remove with full paths: per-file path, action (create/modify/remove), type (workflow/activity/technique/resource/readme), and one-line description — no implicit files; capture as `{scope_manifest}` and set `{file_count}`

### 4. Assemble Structural Design

- Assemble `{$structural_design}` for the Structural design section of the [Scope Manifest Guide](../resources/scope-manifest.md#template): directory tree (or "unchanged" for update), short transition note when topology changes, and a compact pattern-alignment table — not a pattern-comparison essay

### 5. Assemble Drafting Order

- Assemble `{$drafting_order}` for the Drafting order section of the [Scope Manifest Guide](../resources/scope-manifest.md#template): drafting order (`workflow.yaml`, activities, techniques, resources, README) with a one-line rationale per tier

### 6. Persist Scope Manifest

- Persist `{scope_manifest}` together with `{structural_design}` and `{drafting_order}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `scope-manifest.md`, following the [Scope Manifest Guide](../resources/scope-manifest.md#template); capture `{scope_manifest_path}`
