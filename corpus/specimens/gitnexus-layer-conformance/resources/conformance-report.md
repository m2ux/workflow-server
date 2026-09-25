---
name: conformance-report
description: The shape a bound-operation conformance report takes across the graphs a walk addresses, and what each row may claim about an answer that landed from a layer the graph may not hold.
---

# Conformance Report

## Template

```markdown
# {Specimen Title} — Conformance Report

Graphs addressed:

- `{graph-name}` — {what its index holds, and which rows answer from it}

| Case | Graph | Technique | Landed | Layer | Holds |
|------|-------|-----------|--------|-------|-------|
| {case-name} | `{graph-name}` | `{operation-name}` | yes / no | present / absent / not read | {unmeasured / a status / a one-line summary} |

## What each technique evidenced

- `{operation-name}` — {what binding it directly from an activity proves, and what its answer's shape carried}

## Gaps

{One line per technique whose answer did not land, naming what stopped it. Omit the section when every answer landed.}
```

## Rules

### a-note-is-an-answer-about-the-graph

An answer whose note states the graph holds no layer to read has landed, and says the graph was built without that layer; it says nothing about the code. The `Layer` column carries that, and the `Holds` column reads *unmeasured* rather than *none found*, because a graph with no taint layer records no finding whatever the code does.

### a-missing-path-names-where-it-broke

A path answer with no path is not a blank row. Its `Holds` column names the status and, where the search exhausted what it could reach, the furthest node it reached, because the break's location is the answer a reader acts on.

### the-graph-is-the-header

The header names every graph the walk read, one line each, with what that graph's index holds; and each row names in its `Graph` column the one its answer came from. A report describing an unnamed tree leaves the reader to guess which checkout the symbols sit in, and one naming a single tree for answers taken from several leaves the reader to attribute them by guess. The same technique over a graph carrying the program-dependence layers and over one built without them lands two answers of the same shape, so the graph is what separates a measurement from a note.
