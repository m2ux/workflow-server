---
name: implementation-analysis
description: Guidelines for analyzing the existing implementation during work package planning to establish baselines, evaluate effectiveness, and identify the gaps the change closes.
metadata:
  version: 2.0.0
  order: 6
  legacy_id: 6
---


# Implementation Analysis Guide

Document template and section vocabulary for analyzing an existing implementation: its current state, baselines, and the gaps the change closes.

**Full analysis** fills every template section when the work modifies existing functionality, expects performance improvements, defines quality metrics, or needs before/after comparison. **Lightweight analysis** may omit or shorten sections for greenfield work, simple bug fixes with obvious solutions, or documentation-only changes.

## Section Vocabulary

Consult when filling the template (not a session procedure):

| Section | Fill with |
|---------|-----------|
| **Current state** | Where the implementation lives, how it is reached, what it depends on, and what works and what does not, each claim carrying its evidence — logs, dashboards, tests, bugs, workarounds |
| **Baseline metrics** | Performance / quality / usage / reliability numbers plus reproducible measurement method |
| **Gap analysis** | Existing vs desired (functional, performance, quality, maintainability); priority HIGH / MEDIUM / LOW |
| **Measurement** | How the change is measured against each baseline — the same method the baseline used — and any analysis-derived target the requirements lack, in the form "Improve [metric] from [baseline] to [target]" |

## Document Template

```markdown
# Implementation Analysis — [Work Package Name]

> [work package] · [date] · [Draft/Complete]

## Current State

[Two to five sentences: what the implementation does today, where it lives and what reaches it, with each module named in words and linked; then what works and what does not, each claim carrying its evidence.]

## Baseline Metrics

| Metric | Value | Measured by | Date |
|--------|-------|-------------|------|
| [Latency P95] | [X ms] | [how measured] | [date] |

## Gap Analysis

| ID | Gap | Current → desired | Priority |
|----|-----|-------------------|----------|
| G1 | [missing capability] | [what exists → what is needed] | HIGH |

## Measurement

[One sentence per metric: how the change is measured against its baseline. Success criteria: [requirements](requirements-elicitation.md#success-criteria); add here only analysis-derived targets absent from requirements, each mapped to a gap ID.]
```

## Rules

- Every effectiveness claim cites evidence (log data, test results, metrics) — no vague claims like "slow" or "not great".
- Every baseline row records value, measurement method, and date (e.g. 487 ms, production logs over a 7-day average, 2025-01-15).
- A target is quantitative, mapped to a gap, and measured by the method its baseline used. "Make it faster" is not a target.
- Gaps are prioritized with impact justification.
- **Line budget:** ~60 lines. Baseline measurements are the payload; the approach they argue for belongs in the plan, and the module structure belongs in the comprehension corpus.
