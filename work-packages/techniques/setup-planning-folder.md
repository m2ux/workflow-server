---
metadata:
  version: 1.1.0
---

## Capability

Resolve the initiative planning-folder path from its slug, create the initial `START-HERE.md` and `README.md` skeletons there from the planning-folder template as placeholder structures that subsequent work populates, and present the created folder structure for confirmation.

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

### readme_skeleton

Navigation and document-index skeleton, written to `{planning_folder_path}` from the [README.md skeleton](../resources/planning-folder-template.md#readmemd-skeleton).

#### artifact

`README.md`

## Protocol

### 1. Resolve Planning Folder

- Compose `{planning_folder_path}` as `{planning_root}{planning_slug}/` at the [planning-folder location](../resources/planning-folder-template.md#folder-location)

### 2. Create Start Here Skeleton

- Write `{start_here_skeleton}` to `{planning_folder_path}` with header and placeholders, from the [START-HERE.md skeleton](../resources/planning-folder-template.md#start-heremd-skeleton)

### 3. Create Readme Skeleton

- Write `{readme_skeleton}` to `{planning_folder_path}` for navigation, from the [README.md skeleton](../resources/planning-folder-template.md#readmemd-skeleton)

### 4. Present Structure

- Present the created `{planning_folder_path}` structure for confirmation, listing the `{start_here_skeleton}` and `{readme_skeleton}` artifacts written to it
