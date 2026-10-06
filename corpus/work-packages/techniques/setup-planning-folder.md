---
metadata:
  version: 1.5.0
---

## Capability

The initiative's planning folder resolved from its slug, holding the `START-HERE.md` and `README.md` skeletons as placeholder structures that subsequent work populates.

## Inputs

### planning_slug

*(optional)* The slug naming the initiative's planning folder: the date, then the initiative name, in kebab case.

### initiative_name

*(optional)* Kebab-case identifier for the work package: lowercase, alphanumerics and single hyphens.

## Outputs

### planning_slug

The slug naming the initiative's planning folder: the bound value, or `YYYY-MM-DD-{initiative_name}` when none was bound.

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

### 1. Derive Slug

- `{planning_slug}` is the date, then `{initiative_name}`, in kebab case.
  > When `{planning_slug}` is unset.

### 2. Resolve Planning Folder

- Compose `{planning_folder_path}` as `{planning_root}{planning_slug}/` at the [planning-folder location](../resources/planning-folder-template.md#folder-location)

### 3. Write Start Here

- Write `{start_here_skeleton}` to `{planning_folder_path}` with header and placeholders, from the [START-HERE.md skeleton](../resources/planning-folder-template.md#start-heremd-skeleton)

### 4. Create Readme Skeleton

- Write `{readme_skeleton}` to `{planning_folder_path}` for navigation, from the [README.md skeleton](../resources/planning-folder-template.md#readmemd-skeleton)
