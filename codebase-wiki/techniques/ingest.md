---
metadata:
  version: 1.3.0
---

## Capability

Ingest a scoped source area at the pinned baseline commit — and, optionally, task-derived knowledge — into typed wiki pages whose every claim cites a raw source path and carries a confidence score. Creates new pages or augments existing ones in place, then cascades the change to related pages so cross-references stay consistent. Augment and update are folded into ingest: task knowledge is an additional input source alongside the raw code, not a separate operation. This is the operation other workflows bind as `codebase-wiki/ingest` to build or grow the wiki.

## Inputs

### target_area

The single source area to ingest — a module, package, subsystem, or file set named in the ingest plan (the entry the build loop is iterating, bound to `target_area` each pass). Defines which raw sources this pass reads.

### task_knowledge

*(optional)* Task-derived knowledge to fold into the pages alongside the raw code — findings, decisions, or context produced by a calling workflow. When present, the resulting claims cite both the raw source and the task; when absent, ingest covers raw source only.

#### default

`""`

## Outputs

### wiki_pages

The typed wiki pages created or updated for `{target_area}` — each with cited, confidence-scored claims and maintained `[[wikilink]]` relationships.

#### artifact

`{$page_slug}.md`

#### audience

`human`

#### page_slugs

The kebab-case slugs of every page this ingest created or updated, used by `maintain-index-log` to update the catalog and append the ledger.

#### cascaded_pages

The related pages whose `[[wikilinks]]` or claims were updated as a consequence of this ingest.

### ingest_summary

A one-line description of this ingest for the log ledger — the area covered (`{target_area}`), whether the pass was code-driven or task-driven, and the page count. Consumed by `maintain-index-log` as its `operation_summary`.

## Protocol

### 1. Locate Existing Pages

- Read `index.md` and follow `[[wikilinks]]` to find any pages that already cover `{target_area}` or concepts it touches — ingest augments rather than rebuilds, so existing coverage is the starting point.
- Note the related pages that may need a cascade update once this area changes (callers, callees, sibling concepts, comparisons that reference this area).

### 2. Read Raw Source

- Read the raw source for `{target_area}` in place at `{raw_baseline_commit}` — the immutable baseline. Do not copy source into the wiki.
- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[resolve-graph](../../meta/techniques/gitnexus-operations/resolve-graph.md)(tree_path: the source tree the baseline was pinned from) and take its `{repo_name}` as the graph every operation below addresses. An empty `{repo_name}` means the tree carries no index, and the reads below are grep and file reads instead.
- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[verify-index](../../meta/techniques/gitnexus-operations/verify-index.md) against `{repo_name}` and read its `{stats}` for the commit the index was built at, per `index-freshness-first` — an index built before `{raw_baseline_commit}` describes a tree the citations do not point at.
- Take the area's structure from the graph so claims about it rest on evidence rather than inference: [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md)(query: `{target_area}` as keywords, repo_name: `{repo_name}`) whose `{query_report}` gives the execution flows the area participates in, and [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)(name: `{$symbol}`, repo_name: `{repo_name}`) for each symbol a page names, whose `{context_report}` gives the callers and callees that become the `related[]` the cascade in step 5 acts on.
  > - A caller reached through a macro body or named only in a type position is absent from either answer, per `edges-the-parser-cannot-see`. Where the area is built on generated code, a claim of completeness rests on a grep alongside the graph, and the page says which was done.
- If `{task_knowledge}` was supplied, read it as a second source of claims for the same pages.

### 3. Classify Into Typed Pages

- Map what the area contains onto the four page types per the [page-type taxonomy](../resources/wiki-format.md#page-type-taxonomy): `concept` (architectural concept, subsystem, or pattern), `entity` (a concrete code unit — module, package, class, service, endpoint), `source-summary` (a per-file or per-area digest of the raw source), `comparison` (a cross-cutting comparison of two or more units).
- Choose a kebab-case page slug (`{$page_slug}`) per page; place each page under the subfolder for its type per the [wiki tree layout](../resources/wiki-format.md#wiki-tree-layout).

### 4. Draft Cited, Confidence-Scored Claims

- Write each page from the matching template in [page-templates](../resources/page-templates.md), filling the frontmatter (`title`, `type`, `sources[]` at `{raw_baseline_commit}`, `related[]`, `created`, `updated`, `confidence`) per the [page frontmatter schema](../resources/wiki-format.md#page-frontmatter-schema).
- For every claim, attach a citation to the raw source path it rests on (and to the task when the claim derives from `{task_knowledge}`) per the [raw-baseline citations](../resources/citation-conventions.md#raw-baseline-citations) and [confidence vocabulary](../resources/citation-conventions.md#confidence-vocabulary), and a confidence of `high`, `medium`, or `low`.
- When a claim contradicts an existing page, record both and leave the conflict for the lint pass — do not silently reconcile.
- When augmenting an existing page, add or deepen sections and refresh `updated`; preserve prior content unless a cited source contradicts it.

### 5. Cascade Related Pages

- Apply [cross-link](./cross-link.md) to insert `[[wikilink]]` relationships between the new or changed pages and their related pages, and to update the `related[]` frontmatter on both ends.
- Update any related page whose claims are affected by this area's change (for example a caller's source-summary or a comparison that references the changed entity).

### 6. Write Pages

- Write each page by delegating to [`work-package::manage-artifacts::write-artifact`](../../work-package/techniques/manage-artifacts/write-artifact.md), binding `bare_filename` to the page's `{$page_slug}.md`, `artifact_content` to the page body, and `target_dir` to `{wiki_path}` (or the typed subfolder beneath it). The find-or-create behavior of `write-artifact` augments an existing page in place and creates a new one otherwise.

## Rules

### typed-pages-only

Every page is one of the four types — `concept`, `entity`, `source-summary`, `comparison` — and lives under the subfolder for its type. No untyped pages.

### augment-not-rebuild

When a page already covers the area, augment it with new sections and deeper detail and refresh `updated`; never discard prior content except where a cited source contradicts it.

### delegate-file-writes

Page file IO is delegated to `work-package::manage-artifacts::write-artifact` — ingest composes page content and citations, it does not re-implement file writing.

### cite-the-task-too

When a claim derives from `{task_knowledge}`, its citation names both the raw source it rests on and the task, so task-driven claims are as traceable as code-derived ones.
