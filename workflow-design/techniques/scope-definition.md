---
metadata:
  version: 1.0.0
---

## Capability

Define the complete scope and structure before drafting: verify the workflows worktree, design the folder layout and naming scheme, enumerate every file to create/modify/remove, and present the structural design and drafting order for confirmation.

## Outputs

### scope_manifest

The complete file manifest: one entry per file to create/modify/remove with its full path, action, type, and one-line description. Iterated by the file-drafting loop.

### file_count

Number of files in `{scope_manifest}`. Interpolated into the batch-review checkpoint message.

### scope_manifest_path

Absolute path to the written scope-manifest artifact. Interpolated into the scope-and-structure-confirmed checkpoint message as a markdown link.

#### artifact

`scope-manifest.md`

## Protocol

### 1. Verify Worktree

- Verify the workflows branch is present and checked out at the expected path before any path definitions proceed

### 2. Design Folder Structure

- Design the folder layout — `workflow-{id}/` with `activities/`, `techniques/`, `resources/` — and the file naming scheme: `NN-name.yaml` for activities and techniques, `NN-name.md` for resources

### 3. Enumerate Files

- Enumerate every file to create/modify/remove with full paths: per-file path, action (create/modify/remove), type (workflow/activity/technique/resource/readme), and one-line description — no implicit files

### 4. Present Design

- Present the directory tree of the proposed structure with its file manifest, a transition diagram (for sequential workflows), and a comparison against the adopted reference patterns
- Present the drafting order (`workflow.yaml`, activities, techniques, resources, README) with rationale grounded in the reference-dependency chain
- Persist `{scope_manifest}` via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` `{planning_folder_path}` and bare filename `scope-manifest.md`; capture the written location as `{scope_manifest_path}`
