---
metadata:
  version: 1.6.1
---

## Capability

Record whether every source document is readable and what type each one is.

## Inputs

### source_paths

Filesystem paths of the source documents being processed, each a meeting transcript or an unstructured document.

### intake_correction

*(optional)* The user's typed correction to the intake. Unset until a correction is given.

## Outputs

### source_readable

`true` when `{source_paths}` names at least one document and every document it names exists and carries content; `false` when it names none, or when any of them is missing or empty.

### classified_sources

The source documents paired with their classifications, each `{ path, type }` — `type` is `meeting` for a meeting transcript, `document` for an unstructured document. Ordered as `{source_paths}` names them.

## Protocol

### 1. Record Source Readability

- Determine `{source_readable}` per its output contract.

### 2. Classify Each Source

- For each path in `{source_paths}`, infer from that document's content whether it is a meeting transcript or an unstructured document, and record it in `{classified_sources}` as `{ path, type }` with `type` set to `meeting` or `document`. Each source carries its own type, so a mixed set is classified per document rather than as a whole.
  > - A source with no content to read carries no classification.
  > - When `{intake_correction}` names a source's type, that type is recorded over the inference.

## Rules

### intake-captures-only

Capture and classify only; do not analyze or modify the specification.
