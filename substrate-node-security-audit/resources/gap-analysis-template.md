---
name: gap-analysis-template
description: Document skeleton for the gap-analysis report (02-gap-analysis.md) produced by the write-gap-analysis technique, comparing AI audit findings against a professional reference report.
metadata:
  order: 10
  legacy_id: 10
---

# Gap Analysis Report Template

## Overview

The gap-analysis report is produced by the [write-gap-analysis](../techniques/write-gap-analysis.md)
technique during the gap-analysis phase. It compares the AI audit findings (`01-audit-report.md`)
against a professional reference report, which is loaded for the first and only time during this
phase (contamination prevention). The skeleton below mirrors the technique's declared output
components: extract the reference finding list, then map/classify/analyze every finding before
writing the artifact.

## gap-analysis Template

Persist as `02-gap-analysis.md`.

```markdown
# Gap Analysis: AI Audit vs Reference Report

| Field | Value |
|-------|-------|
| Target | {target} |
| Reference report | {reference-report-path} |
| AI report | 01-audit-report.md |
| Date | {YYYY-MM-DD HH:MM UTC} |
| Workflow version | {version} |

---

## Summary

| Metric | Count |
|--------|-------|
| Reference findings (total) | {n} |
| AI findings (total) | {n} |
| Matched | {n} |
| Partial | {n} |
| Gaps (reference-only, missed) | {n} |
| AI-only | {n} |
| Overlap rate | {matched + partial} / {reference total} = {pct}% |

## Finding Mapping

Every reference finding mapped to its closest AI finding, classified as matched, partial, or gap.

| Ref ID | Reference finding | Closest AI finding | Classification | Notes |
|--------|-------------------|--------------------|----------------|-------|
| {R-1} | {title} | {AI issue # / —} | matched\|partial\|gap | {basis for the match} |

## Gaps

Each reference finding with no adequate AI match, with root-cause analysis.

### {Ref ID}: {reference finding title}

- **Severity (reference):** {level}
- **Affected files:** {file#lines}
- **Root cause:** {missing check | reasoning error | scope limitation}
- **Analysis:** {why the AI audit missed it — which §-check should have caught it, and why it did not}

## Severity Calibration

Severity deltas for matched findings; identify over-rating and under-rating patterns.

| Finding | Reference severity | AI severity | Delta | Direction |
|---------|--------------------|-------------|-------|-----------|
| {title} | {level} | {level} | {+/-n} | over-rated \| under-rated \| aligned |

**Patterns:** {summary of systematic over-/under-rating, e.g. categories where the AI inflates or deflates severity}

## AI-Only Findings

Findings present in the AI report but absent from the reference. Assess each as novel or out-of-scope.

| AI issue # | Title | Assessment | Notes |
|-----------|-------|------------|-------|
| {#} | {title} | novel \| out-of-scope-for-reference \| false-positive | {rationale} |

## Recommendations

Workflow improvement suggestions derived from the gap root causes above.

- {actionable change — e.g. add a §-check, broaden grep scope, tighten an invariant — traced to a specific gap}
```

**What good looks like:** every reference finding appears exactly once in the finding-mapping table;
every `gap` row has a corresponding root-cause entry; the summary metrics are internally consistent
with the mapping table; and each recommendation cites the gap that motivates it.
