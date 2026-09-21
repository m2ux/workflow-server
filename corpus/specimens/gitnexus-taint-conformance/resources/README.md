# GitNexus Taint Conformance Resources

> Part of the [GitNexus Taint Conformance Workflow](../README.md)

One guide, for the one document a run leaves behind.

| Resource ID | Title | Purpose |
|-------------|-------|---------|
| `conformance-report` | Conformance Report | Creation guide: `gitnexus-taint-conformance-report.md` — template and the rules governing what the row may claim about a run that materialised, whether the layer it read was there, and what it landed |

## Planning artifact to guide map

Which guide owns each persisted filename's shape.

| Bare filename | Guide |
|---------------|-------|
| `gitnexus-taint-conformance-report.md` | [conformance-report](conformance-report.md) |

---

## Why there is only one

The run's product is evidence about the reference and the layer, not about the flows. What the partition holds is a column of that evidence; persisting it separately would make the findings look like the point.
