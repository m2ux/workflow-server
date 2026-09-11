---
name: wiki-format
description: The Karpathy LLM-wiki format adapted for code — page schema, the four page types, the wiki tree layout, and the in-place commit-pinned raw baseline.
metadata:
  version: 1.0.0
  order: 0
---

# Wiki Format

The codebase-wiki adapts the [Karpathy LLM-wiki knowledge-base format](https://blog.starmorph.com/blog/karpathy-llm-wiki-knowledge-base-guide) for code. A wiki is a tree of typed Markdown pages with YAML frontmatter, navigated hierarchically from an index, every claim cited to raw source and scored for confidence. This resource defines the page schema, the page-type taxonomy, the tree layout, and the raw-baseline model. The per-type body skeletons are in [page-templates](./page-templates.md); the citation and confidence vocabulary is in [citation-conventions](./citation-conventions.md).

## Page frontmatter schema

Every page begins with a YAML frontmatter block:

| Field | Type | Meaning |
|-------|------|---------|
| `title` | string | Human-readable page title. |
| `type` | enum | One of `concept`, `entity`, `source-summary`, `comparison`. |
| `sources` | list | Repo-relative source paths the page's claims rest on, interpreted at `raw_baseline_commit`. |
| `related` | list | `[[wikilinks]]` to related pages — kept in sync with the body links by `cross-link`. |
| `created` | date | When the page was first written. |
| `updated` | date | When the page was last augmented. |
| `confidence` | enum | The page's overall confidence — `high`, `medium`, or `low` — the floor of its claims' confidences. |

A page body records claims; each claim cites at least one source path and carries its own confidence, per [citation-conventions](./citation-conventions.md).

## Page-type taxonomy

The four types map the Karpathy schema onto code:

- **`concept`** — an architectural concept, subsystem, or pattern (e.g. a consensus mechanism, an error-handling strategy). Explains an idea the code realizes.
- **`entity`** — a concrete code unit: a module, package, class, service, or endpoint. Documents what the unit is, what it does, and how it relates to others.
- **`source-summary`** — a per-file or per-area digest of the raw source: what the file contains, its key symbols, and its responsibilities.
- **`comparison`** — a cross-cutting comparison of two or more units or approaches (e.g. two implementations of the same interface), surfacing differences and trade-offs.

## Wiki tree layout

```
{wiki_path}/
├── index.md          # catalog — every page, organized by type, linked by [[wikilink]]
├── log.md            # append-only ledger — one entry per mutation
├── overview.md       # wiki overview / completion summary
├── concepts/         # type: concept
├── entities/         # type: entity
├── sources/          # type: source-summary
└── comparisons/      # type: comparison
```

- `index.md` is the navigation entry point — read it and follow `[[wikilinks]]` rather than loading the whole tree.
- `log.md` is append-only; `maintain-index-log` adds an entry on every mutation and never rewrites prior ones.
- `overview.md` is written at publish as the completion summary.
- Page filenames are kebab-case (`epoch-validator-selection.md`), under the subfolder for their type.

## Raw baseline — in place, commit-pinned

There is no physical `raw/` copy of the source under the wiki. The raw baseline is the source tree as it stands at `raw_baseline_commit`, referenced in place. Citations are repo-relative source paths interpreted against that commit; immutability and change-tracking come from git, not from a snapshot. Pinning the baseline to a single commit makes every citation reproducible and lets the stale-claim lint check verify that a cited path still exists and still matches.
