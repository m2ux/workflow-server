---
metadata:
  version: 1.0.0
---

## Capability

Create the per-work-package planning folder under `.engineering/artifacts/planning/` in the TARGET component repository (your CWD is `target_path`). This is the canonical planning-folder creation operation for all workflows; its {planning_folder_path} output is the single location every artifact for this work package is written to.

## Inputs

### initiative_name

Kebab-case identifier for the work package, slugified from the issue title or work-package description (lowercase, alphanumerics and hyphens). The caller derives it; this operation does not.

## Output

### planning_folder_path

Path to the created (or reused) planning folder: `.engineering/artifacts/planning/YYYY-MM-DD-{initiative_name}/`, in the target component repo. Bind this to the workflow's {planning_folder_path} variable — all artifacts go here (with each activity's `artifactPrefix` applied to filenames).

## Protocol

1. Compose path: `.engineering/artifacts/planning/YYYY-MM-DD-{initiative_name}/` (relative to the target repo / CWD).
2. `mkdir -p` the path (idempotent — if it already exists, reuse it and continue; do not error).
   - If the directory cannot be created at the composed path, check the path and filesystem permissions and confirm the CWD is the intended `target_path`.
3. Verify with `ls` and return the path as {planning_folder_path}. This binding must exist before any later step writes an artifact; if a downstream step attempts a write without a planning folder, apply [initialize-folder](./initialize-folder.md) first, then bind {planning_folder_path}.
