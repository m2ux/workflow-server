---
name: index-and-log
description: Creation guide for bare filenames `index.md` and `log.md` — the wiki's navigation catalog and its append-only mutation ledger. One guide, two templates, because the pair is written by the same mutation.
---

# Index and Log Guide

Creation guide for the two files every wiki mutation touches. `index.md` is how a reader finds a page; `log.md` is how anyone establishes when a claim was written and against which commit. They share a guide because they are written together and neither is meaningful without the other.

## Index Template

```markdown
# Wiki Index

## Concepts

| Page | Summary |
|------|---------|
| [[page-slug]] | one line |

## Entities

| Page | Summary |
|------|---------|
| [[page-slug]] | one line |

## Sources

| Page | Summary |
|------|---------|
| [[page-slug]] | one line |

## Comparisons

| Page | Summary |
|------|---------|
| [[page-slug]] | one line |
```

## Log Template

```markdown
# Mutation Log

| When | Operation | Pages | Baseline | Trigger |
|------|-----------|-------|----------|---------|
| {timestamp} | one line on what was ingested | [[slug]], [[slug]] | `{commit}` | code-driven \| task-driven |
```

## Rules

- **One index entry per page, grouped by page type.** The type sections are the navigation, so a page appears under exactly one of them. An empty type section is omitted until it has a page.
- **The index summary is one line.** It exists to let a reader choose between pages; the page itself holds the content.
- **Wikilinks, not paths.** Both files address pages by `[[slug]]`, so a page move does not break the catalog.
- **The log is append-only.** A new entry is added per operation, in operation order. A prior entry is never edited, so the ledger stays a faithful history.
- **Every log entry names its baseline commit.** That commit is what the entry's claims were read against, and it is what makes a stale claim detectable later.
- **Line budget:** the index grows with the wiki and carries no budget; a log entry is one row.
