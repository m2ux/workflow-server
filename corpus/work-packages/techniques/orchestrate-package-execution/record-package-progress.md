---
metadata:
  version: 1.3.0
---

## Capability

Record a package the child walk has finished: its planning-folder path, its place in the roadmap, and what remains.

## Inputs

### current_package

The package the walk finished.

### child_planning_folder_path

The child session's planning folder, as the launch returned it.

### remaining_packages

Packages not yet started, including the one just finished.

### completed_packages

Packages already finished.

## Outputs

### overall_progress

Progress indicator (e.g., '3/7 complete'), written into the updated START-HERE.md status table

#### artifact

`START-HERE.md`

#### audience

`human`

### remaining_packages

Packages still not started.

### completed_packages

Packages finished, including this one.

## Protocol

### 1. Update Status

- Record `{child_planning_folder_path}` as `{$package_planning_paths}`, keyed by package name.
- Update the `START-HERE.md` status table: mark `{current_package}` as done, add its PR link, and add that package's planning-folder link from `{package_planning_paths}`.
- Recompute `{overall_progress}` to reflect the completed count.

### 2. Check Remaining

- Remove `{current_package}` from `{remaining_packages}` and add it to `{completed_packages}`.
