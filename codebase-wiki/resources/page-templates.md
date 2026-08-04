---
name: page-templates
description: One body skeleton per wiki page type — the frontmatter block and the cited-claim, confidence-scored layout each ingest page follows.
metadata:
  version: 1.0.0
  order: 1
---

# Page Templates

One template per page type. Each `ingest` page is drafted from the matching template: the frontmatter follows the [wiki-format](./wiki-format.md) schema, and every claim cites a source and carries a confidence per [citation-conventions](./citation-conventions.md). Replace bracketed placeholders; keep the section headings.

## Concept

```markdown
---
title: [Concept name]
type: concept
sources:
  - [repo-relative/path.rs]
related:
  - "[[related-entity]]"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
confidence: [high|medium|low]
---

# [Concept name]

## Summary
[One-paragraph statement of the concept — what it is and why it exists.] (cite: [path], confidence: [high|medium|low])

## How it works
- [Claim about the mechanism.] (cite: [path], confidence: [...])

## Realized by
- [[entity]] — [how this entity implements the concept.]

## Open questions
- [Anything the source did not settle.]
```

## Entity

```markdown
---
title: [Entity name]
type: entity
sources:
  - [repo-relative/path.rs]
related:
  - "[[concept]]"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
confidence: [high|medium|low]
---

# [Entity name]

## Responsibility
[What this code unit is responsible for.] (cite: [path], confidence: [...])

## Interface
- [Key symbol / method / endpoint and its contract.] (cite: [path], confidence: [...])

## Relationships
- Callers: [[entity]]
- Callees: [[entity]]
- Realizes: [[concept]]
```

## Source summary

```markdown
---
title: [path or area name]
type: source-summary
sources:
  - [repo-relative/path.rs]
related:
  - "[[entity]]"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
confidence: [high|medium|low]
---

# [path or area name]

## Contents
[What this file or area contains.] (cite: [path], confidence: [...])

## Key symbols
- `[symbol]` — [role.] (cite: [path], confidence: [...])

## Summarized by
- [[concept]] / [[entity]] this source backs.
```

## Comparison

```markdown
---
title: [A vs B]
type: comparison
sources:
  - [repo-relative/path-a.rs]
  - [repo-relative/path-b.rs]
related:
  - "[[entity-a]]"
  - "[[entity-b]]"
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
confidence: [high|medium|low]
---

# [A vs B]

## Subjects
- [[entity-a]]
- [[entity-b]]

## Comparison
| Dimension | [A] | [B] |
|-----------|-----|-----|
| [aspect]  | [...] (cite: [path-a], confidence: [...]) | [...] (cite: [path-b], confidence: [...]) |

## Trade-offs
- [Where A wins / where B wins, and why.] (cite: [...], confidence: [...])
```

## Rules

- **Line budget:** ~60 lines per page. A page past that is two pages, and the wiki is navigated by the index rather than by scrolling one long entry.
- **Every claim carries its citation and confidence.** A sentence without both is an assertion the wiki cannot stand behind, whatever section it sits in.
