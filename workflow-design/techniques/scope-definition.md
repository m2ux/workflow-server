---
metadata:
  version: 1.2.1
---

## Capability

Define the complete scope and structure: verify the workflows worktree, enumerate every file to create/modify/remove, note structural shape and drafting order briefly, and persist a lean scope manifest for activity-layer review.

## Outputs

### structural_design

Directory tree (or "unchanged" for update), short transition note when topology changes, and a compact pattern-alignment table — not a pattern-comparison essay.

### drafting_order

Drafting order (`workflow.yaml`, activities, techniques, resources, README) with a one-line rationale per tier.

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

- Assemble `{structural_design}`: directory tree (unchanged is enough on update), transition note only when activities/transitions change, and a short alignment table against adopted patterns

### 5. Assemble Drafting Order

- Assemble `{drafting_order}`: order by reference-dependency (`workflow.yaml` → activities → techniques → resources → README) with a one-line rationale per tier

### 6. Persist Scope Manifest

- Persist the **file table** plus minimal structural/drafting sections via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and bare filename `scope-manifest.md`; capture `{scope_manifest_path}`
- Keep the artifact decision-facing: dense rows, no pattern essay
