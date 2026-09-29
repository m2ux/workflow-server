---
metadata:
  version: 1.7.0
---

## Capability

Complete scope and structure definition as a lean scope manifest.

## Inputs

### target_path

Absolute filesystem path of the dedicated workflows edit-root worktree for this session — where create/update edits land.

### workflow_branch

Feature branch the edit-root worktree has checked out.

### workflow_id

The id of the workflow being created or updated.

## Outputs

### scope_manifest

The complete file manifest: one entry per file to create/modify/remove with its full path, action, type, and one-line description. Carries the structural design and drafting order sections alongside the table.

#### artifact

`scope-manifest.md`

#### audience

`human`

### file_count

Number of files in `{scope_manifest}`.

## Protocol

### 1. Verify Edit Root

- Verify `{target_path}` is present and checked out on `{workflow_branch}` before any path definitions proceed
- Do not treat the shared workflows library checkout as the edit root

### 2. Design Folder Structure

- Design the folder layout — `{workflow_id}/`, with `activities/`, `techniques/`, `resources/`, `routines/` as needed — and the file naming scheme: `NN-<id>.yaml` for activities, whose `id` matches the filename, and kebab-case `.md` for techniques and resources

### 3. Enumerate Files

- Enumerate every file to create/modify/remove with full paths under `{target_path}/{workflow_id}/`: per-file path, action (create/modify/remove), type (workflow/activity/technique/resource/readme), and one-line description — no implicit files; capture as `{scope_manifest}` and set `{file_count}`

### 4. Assemble Structural Design

- Assemble `{$structural_design}` for the Structural design section of [scope-manifest](../resources/scope-manifest.md#template): directory tree (or "unchanged" for update), short note on changed graph bindings when topology changes, and a compact pattern-alignment table — not a pattern-comparison essay

### 5. Assemble Drafting Order

- Assemble `{$drafting_order}` for the Drafting order section of [scope-manifest](../resources/scope-manifest.md#template): drafting order (`workflow.yaml`, activities, techniques, resources, README) with a one-line rationale per tier

### 6. Compose Scope Manifest

- Fold the file table, `{structural_design}` and `{drafting_order}` into `{scope_manifest}` at the shape [scope-manifest](../resources/scope-manifest.md#template) declares
- Own facts only: link impact analysis and design specification rather than restating them
