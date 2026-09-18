# GitNexus Diff Conformance Resources

> Part of the [GitNexus Diff Conformance Workflow](../README.md)

One guide, for the one document a run leaves behind.

| Resource ID | Title | Purpose |
|-------------|-------|---------|
| `conformance-report` | Conformance Report | Creation guide: `gitnexus-diff-conformance-report.md` — template and the rules governing what each row may claim about a run that materialised, what it landed, and the body shape reaching that row evidences |

## Planning artifact to guide map

Which guide owns each persisted filename's shape.

| Bare filename | Guide |
|---------------|-------|
| `gitnexus-diff-conformance-report.md` | [conformance-report](conformance-report.md) |

---

## Why there is only one

The run's product is evidence about the reference, not about the diff. What each operation measured is a column of that evidence; persisting it separately would make the measuring look like the point.
