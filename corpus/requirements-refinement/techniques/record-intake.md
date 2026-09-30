---
metadata:
  version: 1.1.0
---

## Capability

Settle the target specification — where it is, and whether it is augmented or created — and record the intake.

## Inputs

### host_repo_path

Absolute path of the checkout the run was opened from.

### transcript_redactions

The redacted passages in the stored meeting transcripts, each `{ transcript, heading, kind }`.

## Outputs

### target_doc_path

Absolute filesystem path of the target specification.

### target_doc_exists

`true` when a file exists at `{target_doc_path}` (the specification is augmented); `false` when it is created from scratch.

### spec_basename

Basename of `{target_doc_path}` — the filename without its directory.

### intake_record

Record of the captured sources, the classification each carries, each transcript's redactions, the target specification, the detected augment/create mode, and `{spec_basename}`.

#### artifact

`intake.md`

#### audience

`human`

### intake_record_path

Absolute path to the written intake record.

## Protocol

### 1. Settle the Target

- Emit `{target_doc_path}` as an absolute path.
  > A relative path resolves against `{host_repo_path}`.
- Emit `{target_doc_exists}` and `{spec_basename}` per their output contracts.

### 2. Record Intake

- Write `{intake_record}` to `{planning_folder_path}` per [intake-record](../resources/intake-record.md#template) and its [Rules](../resources/intake-record.md#rules), capturing `{classified_sources}`, `{transcript_redactions}`, `{target_doc_path}`, `{target_doc_exists}`, and `{spec_basename}`; capture its written location as `{intake_record_path}`.
  > Each path is recorded per `artifact-paths-relative`.

