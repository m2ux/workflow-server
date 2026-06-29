---
metadata:
  version: 1.0.0
---

## Capability

Hunt over-engineering across the whole tree at `{target_path}`, biggest-cut-first — removable dependencies, single-implementation interfaces, one-product factories, delegating wrappers, dead feature flags, hand-rolled standard-library reimplementations — ranking findings by the size of the cut and closing with a net lines-and-deps scoreboard.

## Outputs

### audit_findings

The repo-wide findings ranked biggest-cut-first — each carrying a [taxonomy](../../resources/review-taxonomy.md#tags) tag, the location, the simpler alternative, and the lines and dependencies it would remove — closing with a `net: -N lines, -M deps` scoreboard.

#### artifact

`audit-findings.md`

## Protocol

### 1. Hunt the whole tree

- Scan `{target_path}` for the repo-wide over-engineering patterns: removable dependencies, interfaces with a single implementation, factories that build one product, wrappers that only delegate, feature flags no path reads, and hand-rolled reimplementations of the standard library.
- Classify each against the [taxonomy](../../resources/review-taxonomy.md#tags).

### 2. Rank biggest-cut-first

- Record each finding into `{audit_findings}`, ordered by the size of the cut — lines removed plus dependencies dropped — so the largest wins surface first.

### 3. Score the net

- Close `{audit_findings}` with a `net: -N lines, -M deps` scoreboard summing the lines and dependencies the audit would remove across all findings.
