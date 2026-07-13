---
name: implementation-analysis
description: Guidelines for analyzing the existing implementation during work package planning to establish baselines, evaluate effectiveness, and identify improvement opportunities.
metadata:
  version: 1.2.0
  order: 6
  legacy_id: 6
---


# Implementation Analysis Guide

Analyze the existing implementation before designing a solution: establish baselines, evaluate effectiveness with evidence, and derive quantitative success criteria. You cannot validate an improvement without a measured baseline.

**Full analysis** when the work package modifies existing functionality, expects performance improvements, defines quality metrics, or needs before/after comparison. **Lightweight analysis** acceptable for greenfield work, simple bug fixes with obvious solutions, or documentation-only changes.

## Analysis Framework

1. **Implementation review** — locate the code (files/modules), map usage (how it is called, what triggers it, call frequency), dependencies in both directions, architecture patterns, and integration points. Methods: code search for function/class usage, call-path tracing, imports/exports review, configuration examination.
2. **Effectiveness evaluation** — gather evidence: logs (error rates, latency, throughput), dashboards/monitoring alerts, test pass rates and coverage gaps, bug reports and user complaints, TODO/workaround comments. Answer with evidence: what works well, what doesn't, what workarounds exist, what error logs show.
3. **Baseline metrics** — quantify: performance (latency P50/P95/P99, throughput, memory), quality (error/success rates, test coverage), usage (call frequency, adoption, feature utilization), reliability (uptime, failure rate, recovery time). Record the measurement method for each metric so it is reproducible.
4. **Gap analysis** — compare existing vs desired state: functional (missing capabilities), performance (short of targets), quality (defects), maintainability (hard to change). Prioritize: HIGH (blocking/critical), MEDIUM (significant, not blocking), LOW (nice to have).
5. **Opportunity identification** — classify: quick wins (low effort, immediate benefit), structural (larger effort, foundational), optimization (performance refinement), cleanup (technical debt).
6. **Success criteria definition** — measurable targets derived from baselines. Format: "Improve [metric] from [baseline] to [target] ([X]% improvement)". Each criterion states its validation method using the same methodology as the baseline.

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
