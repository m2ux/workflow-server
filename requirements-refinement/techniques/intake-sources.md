---
metadata:
  version: 1.3.0
---

## Capability

Capture the source-document and target-specification paths, record whether the source document is readable, classify the source as a meeting transcript or an unstructured document, determine whether the specification is being augmented or created, and record the intake.

## Outputs

### source_readable

`true` when a file exists at `{source_path}` and carries content; `false` when it is missing or empty.

### source_type

Classification of the source document: `meeting` when it is a meeting transcript, `document` when it is an unstructured document.

### target_doc_exists

`true` when a file exists at `{target_doc_path}` (the specification is augmented); `false` when it is created from scratch.

### spec_basename

Basename of `{target_doc_path}` — the filename without its directory.

### intake_record

Record of the captured sources, classified source type, detected augment/create mode, and `{spec_basename}`.

#### artifact

`intake.md`

#### audience

`human`

### intake_record_path

Absolute path to the written intake record.

## Protocol

### 1. Capture Source Paths

- Capture `{source_path}` and `{target_doc_path}` from the user request.
- Set `{spec_basename}` to the basename of `{target_doc_path}` (filename without directory).

### 2. Record Source Readability

- Set `{source_readable}` to `true` when the source document at `{source_path}` exists and carries content, `false` otherwise.

### 3. Classify Source Type

- Infer from the document's content whether the source is a meeting transcript or an unstructured document, and set `{source_type}` to `meeting` or `document`.
- A `meeting` source is later referenced as `SRC-MTG###`; a `document` source as `SRC-DOC###` credited to the document's author, per [specification-protocol](../resources/specification-protocol.md#source-reference-format).
  > A source with no content to read carries no classification.

### 4. Detect Target Existence

- Set `{target_doc_exists}` to `true` when a file exists at `{target_doc_path}`, `false` otherwise.

### 5. Record Intake

- Write `{intake_record}` to `{planning_folder_path}` per [intake-record](../resources/intake-record.md#template) and its [Rules](../resources/intake-record.md#rules), capturing `{source_path}`, `{target_doc_path}`, `{source_type}`, `{target_doc_exists}`, and `{spec_basename}`; capture its written location as `{intake_record_path}`.

## Rules

### intake-captures-only

Capture and classify only; do not analyze or modify the specification during intake.
