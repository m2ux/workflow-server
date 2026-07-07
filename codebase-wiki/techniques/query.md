---
metadata:
  version: 1.1.0
---

## Capability

Answer a question against the wiki by navigating hierarchically — search `index.md`, follow `[[wikilinks]]` to the relevant pages, and synthesize an answer whose claims carry `[[wikilink]]` citations back to the pages they rest on and the confidence of those pages. Optionally persist the synthesized answer as a page so the knowledge compounds. This is the operation other workflows bind as `codebase-wiki/query` to read the wiki without loading it whole.

## Inputs

### wiki_question

The question to answer against the wiki — a natural-language query about the codebase the wiki covers.

### persist_answer

*(optional)* Whether to persist the synthesized answer as a wiki page (a `comparison` or `concept` page, as appropriate) so future queries can reuse it. When false, the answer is returned without writing a page.

#### default

`false`

## Outputs

### wiki_answer

The synthesized answer to `{wiki_question}`, with `[[wikilink]]` citations to the pages it rests on and the confidence carried from those pages.

#### coverage_gaps

Parts of the question the wiki does not cover, surfaced so the caller can decide whether to ingest the missing area.

#### answer_page

*(present only when `persist_answer` is true)* The slug of the page the answer was persisted to.

## Protocol

### 1. Search The Index

- Read `index.md` to locate the pages whose titles, types, or covered areas match `{wiki_question}` — the catalog is the entry point, not a full-wiki scan.
- Pick the smallest set of pages that could answer the question; prefer following `[[wikilinks]]` from a matched page over re-scanning the catalog.

### 2. Read Relevant Pages

- Read the selected pages and follow their `[[wikilinks]]` and `related[]` frontmatter to any adjacent pages the answer depends on.
- Note each page's claims, their citations, and their confidence — these become the evidence the answer is built from.

### 3. Synthesize The Answer

- Compose an answer to `{wiki_question}` from the pages' claims, attributing each part of the answer to the page it came from with a `[[wikilink]]` citation per the [citation conventions](../resources/citation-conventions.md).
- Carry the confidence of the underlying claims into the answer — flag where the answer rests on `low`-confidence pages or where the wiki has no coverage.
- Where pages disagree, surface the disagreement rather than picking a side silently — a contradiction is a lint finding, not a query decision.

### 4. Persist If Requested

- When `{persist_answer}` is true, write the answer as a typed page (`comparison` for a cross-cutting synthesis, `concept` for a single subject) via [`work-package::manage-artifacts::write-artifact`](../../work-package/techniques/manage-artifacts/write-artifact.md) into `{wiki_path}`, then apply [maintain-index-log](./maintain-index-log.md) so the new page enters the catalog and ledger.

## Rules

### navigate-do-not-scan

Locate pages through `index.md` and `[[wikilinks]]`, never by loading the whole wiki — hierarchical navigation is the contract.

### cite-every-claim

Every part of the answer cites the page it rests on with a `[[wikilink]]`; an uncited assertion is not part of the answer.

### surface-do-not-reconcile

When pages disagree, report the disagreement and its citations rather than choosing one — reconciliation is the user's call at lint, not the query's.
