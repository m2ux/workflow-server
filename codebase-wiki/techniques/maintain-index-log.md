---
metadata:
  version: 1.0.0
---

## Capability

Keep the wiki's catalog and ledger current with every mutation: update `index.md` to list and route to each page, and append `log.md` with an entry for each create/update operation. This is how the index-and-log-on-every-mutation invariant is enforced — every ingest and every publish refresh runs this technique so navigation and provenance never fall behind the pages. File IO is delegated to `work-package::manage-artifacts::write-artifact`.

## Inputs

### mutated_pages

The pages created or updated in the mutation being recorded — the `page_slugs` an ingest produced, or the set of pages a publish refresh touched. Drives which index entries and log lines to write.

### operation_summary

A one-line description of the mutation for the log entry — the area ingested, the trigger (build pass or task-driven update), and the page count.

## Outputs

### index_log

The refreshed catalog and the appended ledger for the wiki.

#### artifact

`index.md` and `log.md`

## Protocol

### 1. Update The Index

- For each page in `{mutated_pages}`, ensure `index.md` has an entry under its type section linking to the page by `[[wikilink]]`, with its title and one-line summary; add a new entry for a new page, refresh the summary for an updated one.
- Keep the index organized by page type (`concepts`, `entities`, `sources`, `comparisons`) so it stays navigable as it grows.

### 2. Append The Log

- Append one entry to `log.md` recording the operation: a timestamp, the `{operation_summary}`, the pages touched, the `{raw_baseline_commit}` the claims cite, and whether the mutation was code-driven or task-driven. The log is append-only — never rewrite prior entries.

### 3. Write Both Files

- Write `index.md` and `log.md` by delegating to [`work-package::manage-artifacts::write-artifact`](../../work-package/techniques/manage-artifacts/write-artifact.md), binding `bare_filename` to `index.md` / `log.md`, `artifact_content` to the composed content, and `target_dir` to `{wiki_path}`.

## Rules

### every-mutation

This technique runs on every mutation — paired with each ingest in the build loop and again at publish. The catalog and ledger are never updated lazily or in a batch after the fact.

### log-is-append-only

`log.md` is an append-only ledger — new entries are added; prior entries are never edited or removed, so the log is a faithful operation history.

### delegate-file-writes

Both files are written through `work-package::manage-artifacts::write-artifact`; this technique composes their content, it does not re-implement file writing.
