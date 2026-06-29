---
metadata:
  version: 1.0.0
---

## Capability

Hunt over-engineering across the whole tree at `{target_path}`, biggest-cut-first — removable dependencies, single-implementation interfaces, one-product factories, delegating wrappers, files exporting one thing, dead feature flags, hand-rolled standard-library reimplementations — ranking findings by the size of the cut and closing with a net lines-and-deps scoreboard. This is a one-shot report: it lists findings and applies nothing.

## Outputs

### audit_findings

The repo-wide findings ranked biggest-cut-first — each written as `<tag> <what to cut>. <replacement>. [path]` carrying a [taxonomy](../resources/review-taxonomy.md#tags) tag, the path locator, the simpler alternative, and the lines and dependencies it would remove — closing with a `net: -N lines, -M deps possible.` scoreboard, or `Lean already. Ship.` when nothing is cuttable.

#### artifact

`audit-findings.md`

## Protocol

### 1. Hunt the whole tree

- Scan `{target_path}` for the repo-wide over-engineering patterns: removable dependencies, interfaces with a single implementation, factories that build one product, wrappers that only delegate, files exporting one thing, feature flags no path reads, and hand-rolled reimplementations of the standard library.
- Classify each against the [taxonomy](../resources/review-taxonomy.md#tags).

### 2. Rank biggest-cut-first

- Record each finding into `{audit_findings}` as `<tag> <what to cut>. <replacement>. [path]`, ordered by the size of the cut — lines removed plus dependencies dropped — so the largest wins surface first.

### 3. Score the net

- Close `{audit_findings}` with a `net: -N lines, -M deps possible.` scoreboard summing the lines and dependencies the audit would remove across all findings. When nothing is cuttable, close with `Lean already. Ship.` instead.
