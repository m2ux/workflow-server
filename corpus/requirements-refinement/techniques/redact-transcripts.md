---
metadata:
  version: 1.0.0
---

## Capability

Redact the personal and off-topic conversation in each stored meeting transcript, keeping every heading.

## Inputs

### copied_transcripts

Absolute paths of the meeting transcripts newly copied into the repository.

### source_paths

Filesystem paths of the source documents the user named, each a meeting transcript or an unstructured document.

### intake_correction

*(optional)* The user's typed correction to the intake. Unset until a correction is given.

## Outputs

### transcript_redactions

The redacted passages in the stored meeting transcripts, each `{ transcript, heading, kind }`: the transcript's file name, the heading above the passage, and its kind of redacted conversation. Every marker a stored transcript carries is listed, one an earlier run placed included.

## Protocol

### 1. Redact Transcripts

- In each transcript of `{copied_transcripts}`, replace each passage of redacted conversation with its marker, per [transcript-redaction](../resources/transcript-redaction.md).
- Apply `{intake_correction}` to the `meeting` entries of `{classified_sources}`: a passage it names to redact is redacted, and a redacted passage it names to keep is restored from the entry of `{source_paths}` with the same file name.
  > Unset, `{intake_correction}` changes no transcript.
- Emit `{transcript_redactions}` per its output contract.
