---
metadata:
  version: 1.0.0
---

## Capability

Base contract for the requirements-refinement techniques: the inputs every technique reads, and the specification-fidelity invariants they all uphold.

## Inputs

### planning_folder_path

Absolute path to this run's planning folder; each technique reads prior artifacts from, and writes its own artifact into, this folder.

### source_path

Filesystem path to the source document being processed — a meeting transcript or an unstructured document.

### target_doc_path

Filesystem path to the canonical requirements specification being augmented or created.

## Rules

### specification-protocol-preserved

The section structure, requirement-entry format, identifier schemes, and status conventions defined in [specification-protocol](../resources/specification-protocol.md) are preserved verbatim.

### artifacts-confined-to-planning-folder

Each technique writes its artifact under `{planning_folder_path}`, performs no version-control operations, and never edits the canonical document in place.
