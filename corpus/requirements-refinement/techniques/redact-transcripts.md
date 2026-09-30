---
metadata:
  version: 1.0.0
---

## Capability

Redact the personal and off-topic conversation in each stored meeting transcript, keeping every heading.

## Inputs

### classified_sources

The source documents paired with their classifications, each `{ path, type }`, a meeting transcript at its copy in the repository.

### intake_correction

*(optional)* Text the user typed to correct the sources, a source's classification, a transcript's redactions, or the target specification. Unset until a correction is given.

## Outputs

### transcript_redactions

The redacted passages in the stored meeting transcripts, each `{ transcript, heading, kind }`: the transcript's file name, the heading above the passage, and the kind [transcript-redaction](../resources/transcript-redaction.md) gives it. Every marker a stored transcript carries is listed, one an earlier run placed included.

## Protocol

### 1. Redact Transcripts

- In each `meeting` entry of `{classified_sources}`, replace each passage of redacted conversation with its marker, per [transcript-redaction](../resources/transcript-redaction.md).
  > - When `{intake_correction}` names a passage to redact, that passage is redacted.
  > - When `{intake_correction}` names a redacted passage to keep, that passage is restored from the entry of `{source_paths}` with the same file name.
- Emit `{transcript_redactions}` per its output contract.
