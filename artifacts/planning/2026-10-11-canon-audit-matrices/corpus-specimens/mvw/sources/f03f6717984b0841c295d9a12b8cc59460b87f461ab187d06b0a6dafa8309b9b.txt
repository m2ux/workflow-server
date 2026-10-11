# Codebase Wiki Resources

> Part of the [Codebase Wiki Workflow](../README.md)

Markdown resources that concretize the wiki standard the techniques work to: the Karpathy-adapted page format, the per-type page templates, the lint checklist, the citation conventions, and the creation guide for the catalog and ledger every mutation touches. Each is cited by the technique that references it — this file orients, it does not restate the resource content.

---

## Resource index

| Order | Resource | Purpose |
|-------|----------|---------|
| `00` | [Wiki Format](./wiki-format.md) | The Karpathy LLM-wiki format adapted for code — page frontmatter schema, the four page types, the wiki tree layout, and the in-place commit-pinned raw baseline. |
| `01` | [Page Templates](./page-templates.md) | One body skeleton per page type (concept, entity, source-summary, comparison) — the frontmatter block and the cited-claim, confidence-scored layout each page follows. |
| `02` | [Lint Checklist](./lint-checklist.md) | The integrity checks the wiki is verified against, each with its pass/fail criterion. |
| `03` | [Citation Conventions](./citation-conventions.md) | The raw-baseline citation form, the confidence vocabulary, and the `[[wikilink]]` cross-reference convention. |
| `04` | [Index and Log](./index-and-log.md) | Creation guide: `index.md` and `log.md` — the navigation catalog and the append-only mutation ledger. |

---

## Planning artifact to guide map

| Bare filename | Guide |
|---------------|-------|
| `{$page_slug}.md` | [page-templates](./page-templates.md) |
| `index.md` | [index-and-log](./index-and-log.md) |
| `log.md` | [index-and-log](./index-and-log.md) |

---

## How the resources relate

[Wiki Format](./wiki-format.md) is the schema; [Page Templates](./page-templates.md) is that schema rendered as fill-in skeletons; [Citation Conventions](./citation-conventions.md) defines the claim-level citation and confidence rules the schema requires; [Lint Checklist](./lint-checklist.md) is the verification that pages actually conform to all three. Together they are the wiki standard — the techniques compose content, these resources define what well-formed content is.
