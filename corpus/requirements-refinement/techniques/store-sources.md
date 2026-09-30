---
metadata:
  version: 1.0.0
---

## Capability

Hold each source document in the repository under its own file name: a meeting transcript in the meetings folder, and a document from outside the repository in the documents folder.

## Inputs

### host_repo_path

Absolute path of the checkout the run was opened from.

### meetings_dir

Directory, relative to `{planning_folder_path}`, holding the stored meeting transcripts.

#### default

`../../meetings/`

### documents_dir

Directory, relative to `{planning_folder_path}`, holding the stored documents from outside the repository.

#### default

`../../documents/`

## Outputs

### classified_sources

The source documents paired with their classifications, each `{ path, type }`, ordered as given. `path` is the absolute path of the source's copy in the repository, or of a document inside the repository where it sits.

### copied_transcripts

Absolute paths of the meeting transcripts this application copied into `{meetings_dir}`. A reused copy is not among them.

## Protocol

### 1. Store Sources

- Copy each `meeting` entry of `{classified_sources}` into `{meetings_dir}`, and each `document` entry from outside `{host_repo_path}` into `{documents_dir}`, keeping its file name.
  > A file of that name already in the folder is that source's copy, and is reused as it stands.
- Emit `{classified_sources}` and `{copied_transcripts}` per their output contracts.
