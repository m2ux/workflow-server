---
name: conformance-report
description: The shape a gitnexus-run conformance report takes, and what each row may claim.
---

# Conformance Report

## Template

```markdown
# {Specimen Title} — Conformance Report

Graph addressed: {repo_name, or "none — the runs answered from the default graph"}

| Run | Materialised | Landed | Holds |
|-----|--------------|--------|-------|
| `{routine-name}` | yes / no | `{output_name}` | {empty / absent / a one-line summary} |

## What each run evidenced

- `{routine-name}` — {the body shape it exercised, and what reaching this row proves about it}

## Gaps

{One line per run that did not materialise, naming what stopped it. Omit the section when every run materialised.}
```

## Rules

### a-run-that-measured-nothing-is-not-a-run-that-did-not-run

An empty output and an absent output reach the report looking alike, and they mean opposite things: the first is a run that materialised and found nothing, the second is a run whose steps never spliced. The `Materialised` and `Holds` columns carry the two separately, and a row may not collapse them into one blank.

### name-the-body-shape-each-run-exercised

Each row's entry under *What each run evidenced* names the shape the run's body carries — a chain, an iteration, a branch, a nested reference, a gate — because the report is evidence about the construct and not about the measuring. A row that only restates what the operation measures says nothing the operation's own contract does not.

### the-graph-is-part-of-the-answer

The header names the graph every answer came from. A report that omits it describes a tree the reader has to guess at, which is the condition the namespace's own addressing rule exists to prevent.
