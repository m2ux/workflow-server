---
name: audit-findings
description: Creation guide for bare filenames `audit-findings.md` and `review-findings.md` — over-engineering findings in one line each under their designators, ranked biggest-cut-first, closing with a net lines-and-dependencies scoreboard.
---

# Over-Engineering Findings Guide

Creation guide for bare filenames `audit-findings.md` (a repo-wide pass) and `review-findings.md` (a diff-scoped one). Both hold the same shape: one line per finding, largest cut first, so a reader takes the top few and stops. Each lists what could go and applies nothing.

## Template

```markdown
# Audit Findings — {target}

{designator} {tag} {what to cut}. {the simpler replacement}. [{path}]
{designator} {tag} {what to cut}. {the simpler replacement}. [{path}]

net: -{N} lines, -{M} deps possible.
```

## Rules

- **One line per finding, in the grammar the [Template](#template) gives.** Designator, tag, what to cut, the replacement, the path locator. A finding needing a paragraph is a finding that has not been reduced to a cut.
- **Each finding carries its own designator**, per [Finding Format](./review-taxonomy.md#finding-format) — the handle a later pass or a caller's summary refers to it by. One finding, one designator: a line standing for several hides each of them from anything that counts findings.
- **The tag comes from the taxonomy.** Classification is a lookup, not a description — see [review-taxonomy](./review-taxonomy.md#tags).
- **Ranked biggest-cut-first.** Order by lines removed plus dependencies dropped, so the largest wins surface first rather than the ones found first.
- **A replacement is named, not implied.** "Remove this wrapper" without what replaces it is not actionable.
- **The scoreboard closes the file**, in the form [Scoreboard](./review-taxonomy.md#scoreboard) gives for the pass that wrote it — a repo-wide pass counts dependencies as well as lines, a diff-scoped one counts lines alone.
- **Nothing is applied.** This is a report; the cuts are the reader's decision.
- **Line budget:** one line per finding, and no section headings between them.
