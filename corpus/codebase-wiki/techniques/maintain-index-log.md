---
metadata:
  version: 1.2.0
---

## Capability

Keep the wiki's catalog and ledger current with every mutation: update `index.md` to list and route to each page, and append `log.md` with an entry for each create/update operation. This is how the index-and-log-on-every-mutation invariant is enforced — every ingest and every publish refresh runs this technique so navigation and provenance never fall behind the pages. File IO is delegated to `work-package::manage-artifacts::write-artifact`.

## Inputs

### mutated_pages

The pages created or updated in the mutation being recorded — the `page_slugs` an ingest produced, or the set of pages a publish refresh touched. Drives which index entries and log lines to write.

### operation_summary

A one-line description of the mutation for the log entry — the area ingested, the trigger (build pass or task-driven update), and the page count.

## Outputs

### wiki_index

The refreshed catalog: one entry per page, organized by page type and routing to the page by wikilink.

#### artifact

`index.md`

#### audience

`human`

### mutation_log

The appended ledger: one entry per create/update operation, in operation order.

#### artifact

`log.md`

#### audience

`human`

## Protocol

### 1. Update The Index

- For each page in `{mutated_pages}`, ensure `{wiki_index}` has an entry under its type section per [Index Template](../resources/index-and-log.md#index-template); add a new entry for a new page, refresh the summary for an updated one.

### 2. Append The Log

- Append one entry to `{mutation_log}` per [Log Template](../resources/index-and-log.md#log-template), recording the `{operation_summary}` and the `{raw_baseline_commit}` the claims cite.

### 3. Write Both Files

- Write `{wiki_index}` and `{mutation_log}` by delegating to [`work-package::manage-artifacts::write-artifact`](../../work-package/techniques/manage-artifacts/write-artifact.md), binding *bare_filename* to each artifact's declared name, *artifact_content* to the composed content, and *target_dir* to `{wiki_path}`.

## Rules

### every-mutation

This technique runs on every mutation — paired with each ingest in the build loop and again at publish. The catalog and ledger are never updated lazily or in a batch after the fact.

### log-is-append-only

`log.md` is an append-only ledger — new entries are added; prior entries are never edited or removed, so the log is a faithful operation history.

### delegate-file-writes

Both files are written through `work-package::manage-artifacts::write-artifact`; this technique composes their content, it does not re-implement file writing.
