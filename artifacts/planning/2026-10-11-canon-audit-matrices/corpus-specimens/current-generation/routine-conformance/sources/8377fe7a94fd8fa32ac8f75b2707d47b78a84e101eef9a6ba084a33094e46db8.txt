---
name: reflect-synthesis
description: Creation guide for bare filename `reflect-synthesis.md` — the four-section synthesis over a reflect run's structural and meta analyses, read against the constraint history.
metadata:
  order: 69
  type: template
---

# Reflect Synthesis Guide

Creation guide for bare filename `reflect-synthesis.md`. A reflect run analyses a target and then analyses its own analysis; this document is where that second pass lands. Exactly four sections, in this order, because each answers a different question about the scan rather than about the target.

## Template

```markdown
# Reflect Synthesis — {target}

## Recurring Patterns

{Patterns this scan found that earlier scans of the same target also found.}

## Unexplored Dimensions

{What no lens in this run was positioned to see.}

## Known False Positives

{Findings this scan raised that the constraint history has already settled.}

## Next Best Scan

{The one lens or mode that would most improve on this run, and what it would look for.}
```

## Rules

- **Four sections, all present.** Recurring Patterns, Unexplored Dimensions, Known False Positives, Next Best Scan. An omitted section reads as "nothing to report" when what it usually means is the question went unasked.
- **The subject is the scan, not the target.** Findings about the code belong to the analysis artifacts; this document is about what the scan reached and missed.
- **Next Best Scan names one thing.** A list of everything that could be run next is not a recommendation.
- **A false positive cites what settled it.** Naming the constraint history entry is what stops the same finding returning next run.
- **Line budget:** ~40 lines, roughly ten per section.
