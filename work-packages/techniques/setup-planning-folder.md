---
metadata:
  version: 1.2.0
---

## Capability

The initiative's planning folder resolved from its slug, holding the `START-HERE.md` and `README.md` skeletons as placeholder structures that subsequent work populates.

## Inputs

### planning_slug

The slug naming the initiative's planning folder (`YYYY-MM-DD-{initiative_name}`).

## Outputs

### planning_folder_path

The initiative [planning folder](../resources/planning-folder-template.md#folder-location) at `{planning_root}{planning_slug}/`.

### start_here_skeleton

Executive-summary and status-tracking skeleton, written to `{planning_folder_path}` from the [START-HERE.md skeleton](../resources/planning-folder-template.md#start-heremd-skeleton).

#### artifact

`START-HERE.md`

#### audience

`human`

### readme_skeleton

Navigation and document-index skeleton, written to `{planning_folder_path}` from the [README.md skeleton](../resources/planning-folder-template.md#readmemd-skeleton).

#### artifact

`README.md`

#### audience

`human`

## Protocol

### 1. Resolve Planning Folder

- Compose `{planning_folder_path}` as `{planning_root}{planning_slug}/` at the [planning-folder location](../resources/planning-folder-template.md#folder-location)

### 2. Create Start Here Skeleton

- Write `{start_here_skeleton}` to `{planning_folder_path}` with header and placeholders, from the [START-HERE.md skeleton](../resources/planning-folder-template.md#start-heremd-skeleton)

### 3. Create Readme Skeleton

- Write `{readme_skeleton}` to `{planning_folder_path}` for navigation, from the [README.md skeleton](../resources/planning-folder-template.md#readmemd-skeleton)
