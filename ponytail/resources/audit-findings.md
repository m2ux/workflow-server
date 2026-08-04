---
name: audit-findings
description: Creation guide for bare filename `audit-findings.md` — the repo-wide over-engineering findings in one line each, ranked biggest-cut-first, closing with a net lines-and-dependencies scoreboard.
---

# Audit Findings Guide

Creation guide for bare filename `audit-findings.md`. One line per finding, largest cut first, so a reader takes the top few and stops. It lists what could go and applies nothing.

## Template

```markdown
# Audit Findings — {target}

{tag} {what to cut}. {the simpler replacement}. [{path}]
{tag} {what to cut}. {the simpler replacement}. [{path}]

net: -{N} lines, -{M} deps possible.
```

## Rules

- **One line per finding, in the grammar above.** Tag, what to cut, the replacement, the path locator. A finding needing a paragraph is a finding that has not been reduced to a cut.
- **The tag comes from the taxonomy.** Classification is a lookup, not a description — see [review-taxonomy](./review-taxonomy.md#tags).
- **Ranked biggest-cut-first.** Order by lines removed plus dependencies dropped, so the largest wins surface first rather than the ones found first.
- **A replacement is named, not implied.** "Remove this wrapper" without what replaces it is not actionable.
- **The scoreboard closes the file.** `net: -N lines, -M deps possible.` sums every finding. When nothing is cuttable, the whole file is `Lean already. Ship.` instead.
- **Nothing is applied.** This is a report; the cuts are the reader's decision.
- **Line budget:** one line per finding, and no section headings between them.
