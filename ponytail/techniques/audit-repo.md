---
metadata:
  version: 1.2.0
---

## Capability

Ranks what the whole tree over-builds, biggest cut first.

## Outputs

### audit_findings

The repo-wide findings ranked biggest-cut-first — each carrying a [taxonomy](../resources/review-taxonomy.md#tags) tag, the path locator, the simpler alternative, and the lines and dependencies it would remove — closing with the repo-wide [scoreboard](../resources/review-taxonomy.md#scoreboard).

#### artifact

`audit-findings.md`

#### audience

`human`

## Protocol

### 1. Hunt the whole tree

- Scan `{target_path}` for the repo-wide over-engineering patterns: removable dependencies, interfaces with a single implementation, factories that build one product, wrappers that only delegate, files exporting one thing, feature flags no path reads, and hand-rolled reimplementations of the standard library.
- Classify each against the [taxonomy](../resources/review-taxonomy.md#tags).

### 2. Rank biggest-cut-first

- Record each finding into `{audit_findings}` in `{artifact_dir}` per [audit-findings](../resources/audit-findings.md#template) and its [Rules](../resources/audit-findings.md#rules), ordered by the size of the cut — lines removed plus dependencies dropped — so the largest wins surface first.

### 3. Score the net

- Close `{audit_findings}` with the repo-wide [scoreboard](../resources/review-taxonomy.md#scoreboard), summing the lines and dependencies the audit would remove across all findings.
