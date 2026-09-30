---
metadata:
  version: 1.5.1
---

## Capability

Shared inputs, and the specification-fidelity and artifact invariants, for every requirements-refinement technique.

## Inputs

### planning_folder_path

Absolute path to this run's planning folder.

### classified_sources

The source documents paired with their classifications, each `{ path, type }`.

### target_doc_path

Filesystem path to the canonical requirements specification being augmented or created.

### correction_iteration

Count of correction passes performed so far.

#### default

`0`

## Rules

### specification-protocol-preserved

The [template](../resources/specification-protocol.md#template), [requirement-entry format](../resources/specification-protocol.md#requirement-entry-format), [identifier schemes](../resources/specification-protocol.md#identifier-schemes), and [status conventions](../resources/specification-protocol.md#status-conventions) are preserved verbatim.

### artifacts-write-under-planning-folder

Each technique writes its declared artifact under `{planning_folder_path}`.

### artifact-paths-relative

Every path an artifact records is relative to the folder the artifact is read from: a specification's to the folder of `{target_doc_path}`, any other artifact's to its own folder. No artifact carries an absolute filesystem path.
