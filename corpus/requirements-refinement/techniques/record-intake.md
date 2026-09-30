---
metadata:
  version: 1.2.0
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

### intake_record

Record of the captured sources, the classification each carries, each transcript's redactions, the target specification, and the detected augment/create mode.

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
- Emit `{target_doc_exists}` per its output contract.

### 2. Record Intake

- Write `{intake_record}` to `{planning_folder_path}` per [intake-record](../resources/intake-record.md#template) and its [Rules](../resources/intake-record.md#rules), capturing `{classified_sources}`, `{transcript_redactions}`, `{target_doc_path}`, and `{target_doc_exists}`; capture its written location as `{intake_record_path}`.
  > Each path is recorded per `artifact-paths-relative`.

