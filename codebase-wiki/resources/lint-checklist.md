---
name: lint-checklist
description: The integrity checks the lint technique runs over the whole wiki, each with its pass/fail criterion.
metadata:
  version: 1.0.0
  order: 2
---

# Lint Checklist

Every check below is run in one pass over the whole wiki and the violations are counted as `lint_findings_count`. Each finding names the offending page(s) and the check it failed. The checklist reports; it never fixes — fixing is a re-ingest decision.

| # | Check | Passes when | Fails when |
|---|-------|-------------|------------|
| 1 | **Citation coverage** | Every claim on every page cites at least one raw source path. | A claim has no citation. |
| 2 | **Confidence presence** | Every claim carries a `high`/`medium`/`low` confidence, and every page has a frontmatter `confidence`. | A claim or page is missing a confidence score, or uses a value outside the vocabulary. |
| 3 | **Contradictions** | No two pages or claims assert conflicting facts without both being recorded as a conflict. | Two pages state incompatible facts and neither flags the conflict. |
| 4 | **Orphan pages** | Every page is reachable from `index.md` by following `[[wikilinks]]`. | A page exists in the tree but nothing links to it and the index omits it. |
| 5 | **Missing referenced concepts** | Every `[[wikilink]]` resolves to an existing page. | A `[[wikilink]]` points at a page that does not exist. |
| 6 | **Stale claims** | Every cited source path still exists at `raw_baseline_commit` and the claim still matches the source. | A cited path is gone at the baseline commit, or the claim no longer matches the cited source. |
| 7 | **Index/log integrity** | `index.md` lists every page and `log.md` has an entry for every mutation. | A page is missing from the index, or a mutation is missing from the log. |

## Notes

- **Contradictions are findings, not reconciliations.** Check 3 records the conflict for the user to resolve at the `lint-findings-confirmed` checkpoint; lint never picks a side.
- **The baseline is the reference for staleness.** Check 6 evaluates cited paths against `raw_baseline_commit` — the immutable, in-place baseline — so a path that moved after the baseline is not flagged, but one absent at the baseline is.
- **Index and log are not optional.** Check 7 enforces the index-and-log-on-every-mutation invariant — if `maintain-index-log` was skipped for a mutation, this check catches it.
