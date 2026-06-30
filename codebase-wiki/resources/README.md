# Codebase Wiki Resources

> Part of the [Codebase Wiki Workflow](../README.md)

Four Markdown resources that concretize the wiki standard the techniques work to: the Karpathy-adapted page format, the per-type page templates, the lint checklist, and the citation conventions. Each is loaded via `get_resource` by the technique that references it — this file orients, it does not restate the resource content.

---

## Resource index

| Order | Resource | Purpose |
|-------|----------|---------|
| `00` | [Wiki Format](./wiki-format.md) | The Karpathy LLM-wiki format adapted for code — page frontmatter schema, the four page types, the wiki tree layout, and the in-place commit-pinned raw baseline. |
| `01` | [Page Templates](./page-templates.md) | One body skeleton per page type (concept, entity, source-summary, comparison) — the frontmatter block and the cited-claim, confidence-scored layout each page follows. |
| `02` | [Lint Checklist](./lint-checklist.md) | The integrity checks the wiki is verified against, each with its pass/fail criterion. |
| `03` | [Citation Conventions](./citation-conventions.md) | The raw-baseline citation form, the confidence vocabulary, and the `[[wikilink]]` cross-reference convention. |

---

## How the resources relate

[Wiki Format](./wiki-format.md) is the schema; [Page Templates](./page-templates.md) is that schema rendered as fill-in skeletons; [Citation Conventions](./citation-conventions.md) defines the claim-level citation and confidence rules the schema requires; [Lint Checklist](./lint-checklist.md) is the verification that pages actually conform to all three. Together they are the wiki standard — the techniques compose content, these resources define what well-formed content is.
