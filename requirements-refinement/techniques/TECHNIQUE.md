---
metadata:
  version: 1.0.0
---

## Capability

Shared inputs and specification-fidelity invariants for every requirements-refinement technique.

## Inputs

### planning_folder_path

Absolute path to this run's planning folder; each technique reads prior artifacts from, and writes its own artifact into, this folder.

### source_path

Filesystem path to the source document being processed — a meeting transcript or an unstructured document.

### target_doc_path

Filesystem path to the canonical requirements specification being augmented or created.

### correction_iteration

Count of correction passes performed so far; `0` on the initial update.

#### default

`0`

### max_correction_iterations

Maximum number of correction passes before refinement cannot complete automatically.

#### default

`3`

## Rules

### specification-protocol-preserved

The section structure, requirement-entry format, identifier schemes, and status conventions defined in [specification-protocol](../resources/specification-protocol.md) are preserved verbatim.

### artifacts-confined-to-planning-folder

Each technique writes its artifact under `{planning_folder_path}`, performs no version-control operations, and never edits the canonical document in place.
