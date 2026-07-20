---
name: implementation-analysis
description: Guidelines for analyzing the existing implementation during work package planning to establish baselines, evaluate effectiveness, and identify improvement opportunities.
metadata:
  version: 1.3.0
  order: 6
  legacy_id: 6
---


# Implementation Analysis Guide

Document template and section vocabulary for analyzing an existing implementation: baselines, effectiveness evidence, and quantitative success criteria.

**Full analysis** fills every template section when the work modifies existing functionality, expects performance improvements, defines quality metrics, or needs before/after comparison. **Lightweight analysis** may omit or shorten sections for greenfield work, simple bug fixes with obvious solutions, or documentation-only changes.

## Section Vocabulary

Consult when filling the template (not a session procedure):

| Section | Fill with |
|---------|-----------|
| **Implementation review** | Code location (files/modules), usage (callers, triggers, frequency), dependencies both ways, architecture patterns, integration points |
| **Effectiveness evaluation** | Evidence from logs, dashboards, tests, bugs, TODOs/workarounds — what works, what does not |
| **Baseline metrics** | Performance / quality / usage / reliability numbers plus reproducible measurement method |
| **Gap analysis** | Existing vs desired (functional, performance, quality, maintainability); priority HIGH / MEDIUM / LOW |
| **Opportunities** | Quick wins, structural, optimization, cleanup |
| **Success criteria** | Measurable targets from baselines — format: "Improve [metric] from [baseline] to [target] ([X]% improvement)" with the same validation method as the baseline |

## Document Template

```markdown
# Implementation Analysis - [Work Package Name]

> [work package] · [date] · [Draft/Complete]

## Implementation Review

### Existing Location
| Component | Path | Description |
|-----------|------|-------------|
| [Component] | `src/path/to/module` | [What it does] |

### Usage Patterns
**How is it used today:**
- [Usage pattern 1]

**Call frequency:** [How often is it invoked?]

### Dependencies

**Depends On:**
- `module/path` - [Why]

**Depended On By:**
- `other/module` - [How]

### Architecture
**Existing patterns:** [Describe architecture]
**Known technical debt:** [List any known issues; omit if none]

## Effectiveness Evaluation

### What's Working Well

| Capability | Evidence | Confidence |
|------------|----------|------------|
| [Feature/behavior] | [Log data, test results, metrics] | HIGH/MEDIUM/LOW |

### What's Not Working

| Issue | Evidence | Impact |
|-------|----------|--------|
| [Problem] | [Error logs, bug reports, metrics] | HIGH/MEDIUM/LOW |

### Workarounds in Place
[Omit this section if none]
- [Workaround 1] - [Why needed]

## Baseline Metrics

| Metric | Current Value | Measurement Method | Date Measured |
|--------|--------------|-------------------|---------------|
| [Latency P95] | [X ms] | [How measured] | [Date] |
| [Error Rate] | [X%] | [How measured] | [Date] |

### Key Findings
- [Quantitative observation 1]

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority |
|----|-----|---------------|---------------|--------|----------|
| G1 | [Missing capability] | [What exists] | [What's needed] | [Effect] | HIGH |

## Opportunities for Improvement

[Include only the subsections that apply]

### Quick Wins (Low Effort, High Impact)
1. **[Opportunity]:** [Description] — Expected impact: [Benefit]; Effort: [Estimate]

### Structural Improvements (Higher Effort)
1. **[Opportunity]:** [Description] — Expected impact: [Benefit]; Effort: [Estimate]

### Optimization Opportunities
1. **[Opportunity]:** [Description] — Expected impact: [Benefit]; Effort: [Estimate]

## Success Criteria

[One line: Success criteria: [requirements](requirements-elicitation.md#success-criteria). This document contributes baselines and gaps; add here ONLY analysis-derived targets absent from requirements, each mapped to a gap ID.]

### Measurement Strategy
**How will we validate improvements?**
- [Test/script/tool for measuring metric 1]
- [Comparison methodology for before/after]

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| [Log file/dashboard] | Metrics | [Findings] |

**Status:** Ready for plan-prepare activity
```

## Rules

- Every effectiveness claim cites evidence (log data, test results, metrics) — no vague claims like "slow" or "not great".
- Every baseline row records value, measurement method, and date (e.g. `487ms | Production logs, 7-day average | 2025-01-15`).
- Success criteria are quantitative, each mapped to a gap and to a validation method matching the baseline methodology. "Make it faster" is not a criterion.
- Gaps are prioritized with impact justification.
