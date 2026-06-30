---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Maintain the `[[wikilink]]` relationships that make the wiki navigable: insert links between related pages, keep each page's `related[]` frontmatter in sync with the links in its body, and ensure relationships are bidirectional so navigation works in both directions. Invoked by `ingest` to cascade a change across the pages it relates to.

## Inputs

### subject_pages

The pages whose relationships are being maintained — the pages an ingest created or updated, for which links to and from related pages must be established or refreshed.

### related_pages

The pages the subject pages relate to — callers, callees, sibling concepts, source-summaries of the same area, and comparisons that reference them. The other end of each relationship.

## Protocol

### 1. Identify Relationships

- For each subject page, determine which `{related_pages}` it should link to: the concept a code entity realizes, the entities a comparison spans, the source-summary a concept rests on, and the callers/callees of an entity.

### 2. Insert Links

- Add a `[[wikilink]]` in the subject page body wherever it references a related page, using the slug form defined in the [citation conventions](../resources/citation-conventions.md).
- Add the reciprocal `[[wikilink]]` in the related page so the relationship is bidirectional — a link from A to B implies a link from B to A.

### 3. Sync Frontmatter

- Update the `related[]` frontmatter on both ends to list the linked pages, so the frontmatter is a faithful summary of the body links and `query`/`lint` can rely on it.
- Remove a `related[]` entry only when the corresponding body link is gone — frontmatter follows the body, never the reverse.

## Outputs

### linked_pages

The pages whose `[[wikilink]]` body links and `related[]` frontmatter were inserted or refreshed, in sync on both ends of each relationship.

## Rules

### bidirectional-links

Every relationship is recorded on both ends — a `[[wikilink]]` from A to B is matched by one from B to A — so navigation and the orphan-page lint check both hold.

### frontmatter-follows-body

`related[]` frontmatter mirrors the `[[wikilinks]]` in the page body; the body is the source of truth and the frontmatter is kept consistent with it, never the other way around.

### resolve-or-omit

A `[[wikilink]]` is inserted only to an existing page; an intended link to a page that does not yet exist is left for the ingest that creates it, so no dangling links are introduced (the missing-referenced-concept lint check stays clean).
