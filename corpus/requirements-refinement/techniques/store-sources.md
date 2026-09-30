---
metadata:
  version: 1.0.0
---

## Capability

Hold each source document in the repository under its own file name: a meeting transcript in the meetings folder, and a document from outside the repository in the documents folder.

## Inputs

### classified_sources

The source documents paired with their classifications, each `{ path, type }`.

### host_repo_path

Absolute path of the checkout the run was opened from.

### meetings_dir

Directory, relative to `{host_repo_path}`, holding the meeting transcripts specifications cite.

#### default

`.engineering/artifacts/meetings/`

### documents_dir

Directory, relative to `{host_repo_path}`, holding the documents from outside the repository that specifications cite.

#### default

`.engineering/artifacts/documents/`

## Outputs

### classified_sources

The source documents paired with their classifications, each `{ path, type }`, ordered as given. `path` is the absolute path of the source's copy in the repository, or of a document inside the repository where it sits.

## Protocol

### 1. Store Sources

- Copy each `meeting` entry of `{classified_sources}` into `{meetings_dir}`, and each `document` entry from outside `{host_repo_path}` into `{documents_dir}`, keeping its file name.
  > A file of that name already in the folder is that source's copy, and is reused as it stands.
- Emit `{classified_sources}` per its output contract.
