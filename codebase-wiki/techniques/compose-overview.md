---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Compose the `overview.md` completion summary from the finalized wiki state — the log ledger and the index — so the published wiki has a durable entry point. The summary records what the build covered, the page counts by type, the citation baseline commit, and any accepted lint findings.

## Outputs

### wiki_overview

The composed `overview.md` completion summary — areas covered, page counts by type, the citation baseline commit, and any accepted lint findings. Written to `{wiki_path}` as `overview.md`.

## Protocol

### 1. Read The Wiki State

- Read `index.md` for the catalog of pages and their types, and `log.md` for the ledger of what the build covered across its operations.

### 2. Compose The Summary

- Compose `{wiki_overview}` covering: the areas the build covered, the page counts by type (`concept`, `entity`, `source-summary`, `comparison`), the `{raw_baseline_commit}` every citation is relative to, and any lint findings the user accepted at the lint pass.
- Follow the overview section of the [wiki-format](../resources/wiki-format.md) resource for structure.

## Rules

### summary-from-recorded-state

The overview is composed from the recorded wiki state — the index and the append-only log — not from memory of the run, so it reflects exactly what was written.
