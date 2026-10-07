---
metadata:
  version: 2.0.0
---

## Capability

The session's planning folder holding the `START-HERE.md` and `README.md` skeletons, as placeholder structures that subsequent work populates.

## Outputs

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

### 1. Write Start Here

- Write `{start_here_skeleton}` to `{planning_folder_path}` with header and placeholders, from the [START-HERE.md skeleton](../resources/planning-folder-template.md#start-heremd-skeleton)

### 2. Create Readme Skeleton

- Write `{readme_skeleton}` to `{planning_folder_path}` for navigation, from the [README.md skeleton](../resources/planning-folder-template.md#readmemd-skeleton)

## Rules

### the-folder-is-the-one-the-session-opened

`{planning_folder_path}` is the folder the server resolved for this session. This technique writes into it and composes no path of its own: a folder composed here is a second home for one session's artifacts, and the session records only the server's.
