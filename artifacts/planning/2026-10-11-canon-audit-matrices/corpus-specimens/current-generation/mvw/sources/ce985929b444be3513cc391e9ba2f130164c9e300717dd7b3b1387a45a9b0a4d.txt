---
name: citation-conventions
description: How wiki claims cite raw source, the confidence vocabulary, and the [[wikilink]] cross-reference convention.
metadata:
  version: 1.0.0
  order: 3
---

# Citation Conventions

The wiki's two non-negotiable invariants — every claim cites a raw source, and every claim carries a confidence — are encoded by the conventions below.

## Raw-baseline citations

The raw baseline is the source tree at `raw_baseline_commit`, referenced in place — there is no physical copy under the wiki. A citation is therefore a repo-relative source path interpreted against the pinned commit:

```
(cite: pallets/midnight/src/lib.rs, confidence: high)
(cite: pallets/midnight/src/lib.rs:120-148, confidence: medium)
```

- The path is **repo-relative**, not absolute and not wiki-relative — it names a file in the source tree, read at `raw_baseline_commit`.
- A line range may be appended (`:120-148`) to pin a claim to a specific span.
- The frontmatter `sources[]` list collects the distinct paths a page's claims cite; the inline `(cite: …)` markers attribute each individual claim.
- Because the commit is pinned, a citation is reproducible and the stale-claim lint check can verify the path still exists and still matches.

## Confidence vocabulary

Every claim carries exactly one of three confidence values:

| Value | Use when |
|-------|----------|
| `high` | The claim is directly evidenced by the cited source — the code says so plainly. |
| `medium` | The claim is a reasonable reading of the source but rests on some inference. |
| `low` | The claim is inferred, incomplete, or rests on a source that only partly supports it — a candidate for a deeper ingest. |

- A page's frontmatter `confidence` is the floor of its claims' confidences — a page with any `low` claim is at best `low` overall until that claim is resolved.
- A claim derived from task knowledge cites both the raw source and the task; its confidence reflects the weaker of the two supports.

## `[[wikilink]]` conventions

Cross-references between pages use double-bracket wikilinks naming the target page's kebab-case slug:

```
[[epoch-validator-selection]]
[[babe-consensus]]
```

- A wikilink names the **slug** (the filename without `.md` or subfolder), not a path — the index and the page type locate it.
- Relationships are **bidirectional**: a `[[wikilink]]` from page A to page B is matched by one from B to A.
- The body links are the source of truth; each page's `related[]` frontmatter mirrors them.
- A wikilink is inserted only to an **existing** page — a dangling link is a missing-referenced-concept lint finding, so an intended link to a not-yet-created page waits for the ingest that creates it.
- In a synthesized `query` answer, each part of the answer carries the `[[wikilink]]` of the page it rests on, so the answer is traceable back to its evidence.
