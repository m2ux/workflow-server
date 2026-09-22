---
name: case-report
description: The shape a two-case conformance report takes for one library run — a case the run measures and a case it falls back on — and what each row may claim.
---

# Case Report

## Template

```markdown
# {Specimen Title} — Case Report

Run: `{routine-name}`
Graph addressed: {repo_name, or "none — the run answered from the default graph"}

| Case | Inputs | Materialised | Landed | Holds |
|------|--------|--------------|--------|-------|
| positive | {the inputs the case bound, as values} | yes / no | `{output_name}`, … | {a one-line summary of the measurement} |
| negative | {the inputs the case bound, as values} | yes / no | `{output_name}`, … | {the fallback the run landed: empty / unmeasured / refused / absent, and what said so} |

## What the run evidenced

- positive — {what the measurement proves about the run's body: the operations it reached, the values it landed, the shape it exercised}
- negative — {which promised fallback the run took, and what in its outputs distinguishes that fallback from a measurement that found nothing}

## Gaps

{One line per case whose run did not materialise, or whose operation could not be called, naming what stopped it. Omit the section when both cases ran to their landing.}
```

## Rules

### a-fallback-is-named-by-its-own-mark

Each run promises a fallback for the case it cannot measure — an empty set on a symbol that resolves to nothing, an unmeasured flag on an absent layer, a refusal at a gate, an error naming what was missing — and the negative row names which mark arrived. A row that writes *empty* where the run landed *unmeasured*, or *nothing found* where the run landed an error, has read a fallback as a measurement.

### the-two-cases-bind-the-same-run

Both rows refer to one run under two bindings, and the report shows the bindings beside the outcomes, so a reader can see that what differed was the input and not the reference. A row whose inputs column is blank reports an outcome nothing explains.

### a-row-names-the-shape-it-exercised

The positive entry under *What the run evidenced* names the body shape the run carries — a chain, an iteration, a literal argument, a nested reference, a gate, a judgement — because the report is evidence about the construct and not about the code it measured.

### the-graph-is-the-header

The header names the graph every answer came from, since a report describing an unnamed tree leaves the reader to guess which checkout the answers describe.
