---
name: conformance-report
description: The shape a taint-run conformance report takes, and what its row may claim about a layer the graph may not hold.
---

# Conformance Report

## Template

```markdown
# {Specimen Title} — Conformance Report

Graph addressed: {repo_name, or "none — the run answered from the default graph"}

| Run | Materialised | Layer | Landed | Holds |
|-----|--------------|-------|--------|-------|
| `{routine-name}` | yes / no | present / absent | `{output_name}` | {unmeasured / empty / absent / a one-line summary} |

## What the run evidenced

- `{routine-name}` — {the body shape it exercised, and what reaching this row proves about it}

## Gaps

{One line where the run did not materialise, naming what stopped it. Omit the section when it did.}
```

## Rules

### an-absent-layer-is-not-an-empty-partition

Two empty lists arrive the same way whether the graph held a taint layer and found nothing or held no layer at all, and the run's flag is what tells them apart. The `Layer` column carries the flag and the `Holds` column reads *unmeasured* where it is set; a row may not write *empty* over an absent layer, because that reads as a clean diff the run never measured.

### a-row-names-the-shape-it-exercised

The entry under *What the run evidenced* names the body shape the run carries — here an iteration over the changed symbols, each pass reading one optional layer, closing on a judgement — because the report is evidence about the construct and not about the code. A row that restates what the findings say says nothing the operation's own contract does not.

### the-graph-is-the-header

The header names the graph the answer came from, since a report describing an unnamed tree leaves the reader to guess which checkout the flows sit in.
