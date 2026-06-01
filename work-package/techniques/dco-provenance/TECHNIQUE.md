---
name: dco-provenance
description: Manages Developer Certificate of Origin (DCO) compliance artifacts and AI provenance records for a work package.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 25
  legacy_id: 25
---

# Dco Provenance

## Capability

DCO compliance and AI provenance tracking — provenance log row appends and attestation recording.

## Operations

| Operation | Purpose |
|---|---|
| [append-task-row](./append-task-row.md) | Append a per-task row to provenance-log.md (creates the file with header on first call) |
| [record-attestation](./record-attestation.md) | Append the attestation section to provenance-log.md at the dco-sign-off checkpoint |
