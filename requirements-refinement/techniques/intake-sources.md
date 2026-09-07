---
metadata:
  version: 1.4.0
---

## Capability

Capture the source-document and target-specification paths, record whether every source document is readable, classify each source as a meeting transcript or an unstructured document, determine whether the specification is being augmented or created, and record the intake.

## Outputs

### source_readable

`true` when every document named in `{source_paths}` exists and carries content; `false` when any of them is missing or empty.

### classified_sources

The source documents paired with their classifications, each `{ path, type }` — `type` is `meeting` for a meeting transcript, `document` for an unstructured document. Ordered as `{source_paths}` names them.

### target_doc_exists

`true` when a file exists at `{target_doc_path}` (the specification is augmented); `false` when it is created from scratch.

### spec_basename

Basename of `{target_doc_path}` — the filename without its directory.

### intake_record

Record of the captured sources, the classification each carries, the detected augment/create mode, and `{spec_basename}`.

#### artifact

`intake.md`

#### audience

`human`

### intake_record_path

Absolute path to the written intake record.

## Protocol

### 1. Capture Source Paths

- Capture `{source_paths}` and `{target_doc_path}` from the user request.
- Set `{spec_basename}` to the basename of `{target_doc_path}` (filename without directory).

### 2. Record Source Readability

- Set `{source_readable}` to `true` when every document named in `{source_paths}` exists and carries content, `false` when any of them is missing or empty.

### 3. Classify Each Source

- For each path in `{source_paths}`, infer from that document's content whether it is a meeting transcript or an unstructured document, and record it in `{classified_sources}` as `{ path, type }` with `type` set to `meeting` or `document`.
- A `meeting` source is later referenced as `SRC-MTG###`; a `document` source as `SRC-DOC###` credited to the document's author, per [specification-protocol](../resources/specification-protocol.md#source-reference-format). Each source carries its own reference, so a mixed set is classified per document rather than as a whole.
  > A source with no content to read carries no classification.

### 4. Detect Target Existence

- Set `{target_doc_exists}` to `true` when a file exists at `{target_doc_path}`, `false` otherwise.

### 5. Record Intake

- Write `{intake_record}` to `{planning_folder_path}` per [intake-record](../resources/intake-record.md#template) and its [Rules](../resources/intake-record.md#rules), capturing `{classified_sources}`, `{target_doc_path}`, `{target_doc_exists}`, and `{spec_basename}`; capture its written location as `{intake_record_path}`.

## Rules

### intake-captures-only

Capture and classify only; do not analyze or modify the specification during intake.
