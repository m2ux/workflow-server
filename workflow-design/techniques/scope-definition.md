---
metadata:
  version: 1.2.0
---

## Capability

Define the complete scope and structure: verify the workflows worktree, design the folder layout and naming scheme, enumerate every file to create/modify/remove, assemble the structural design and drafting order, and persist the scope manifest (including those sections) for activity-layer review.

## Outputs

### structural_design

The proposed directory tree with file manifest, transition diagram (for sequential workflows), and comparison against the adopted reference patterns.

### drafting_order

The drafting order (`workflow.yaml`, activities, techniques, resources, README) with rationale grounded in the reference-dependency chain.

### scope_manifest

The complete file manifest: one entry per file to create/modify/remove with its full path, action, type, and one-line description.

### file_count

Number of files in `{scope_manifest}`.

### scope_manifest_path

Absolute path to the written scope-manifest artifact (includes structural design and drafting order sections).

#### artifact

`scope-manifest.md`

## Protocol

### 1. Verify Worktree

- Verify the workflows branch is present and checked out at the expected path before any path definitions proceed

### 2. Design Folder Structure

- Design the folder layout — `workflow-{id}/` with `activities/`, `techniques/`, `resources/` — and the file naming scheme: `NN-name.yaml` for activities and techniques, `NN-name.md` for resources

### 3. Enumerate Files

- Enumerate every file to create/modify/remove with full paths: per-file path, action (create/modify/remove), type (workflow/activity/technique/resource/readme), and one-line description — no implicit files; capture as `{scope_manifest}` and set `{file_count}`

### 4. Assemble Structural Design

- Assemble `{structural_design}`: the directory tree of the proposed structure with its file manifest, a transition diagram (for sequential workflows), and a comparison against the adopted reference patterns

### 5. Assemble Drafting Order

- Assemble `{drafting_order}`: drafting order (`workflow.yaml`, activities, techniques, resources, README) with rationale grounded in the reference-dependency chain

### 6. Persist Scope Manifest

- Persist `{scope_manifest}` together with `{structural_design}` and `{drafting_order}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `scope-manifest.md`; capture the written location as `{scope_manifest_path}`
