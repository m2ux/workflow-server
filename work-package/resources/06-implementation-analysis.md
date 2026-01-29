---
id: implementation-analysis
version: 1.0.0
---

# Implementation Analysis Guide

**Purpose:** Guidelines for analyzing the existing implementation during work package planning to establish baselines, evaluate effectiveness, and identify improvement opportunities.

---

## Overview

Before designing a solution, analyze the existing implementation to understand:
- **Existing Usage** - How is the feature/component used today?
- **Effectiveness** - Is it working well? What evidence exists?
- **Baseline Metrics** - What are current performance/quality measurements?
- **Gaps** - What's missing, broken, or underperforming?
- **Opportunities** - Where can improvements have the most impact?
- **Success Criteria** - What quantitative targets should the work package achieve?

> **Key Insight:** You can't improve what you don't measure. Establishing baselines before implementation enables objective validation of improvements.

---

## When to Apply This Guide

**Always analyze when:**
- Work package modifies existing functionality
- Performance improvements are expected
- Quality metrics are defined
- Comparison before/after is needed

**Lightweight analysis acceptable when:**
- Greenfield implementation (no existing code)
- Simple bug fix with obvious solution
- Documentation-only changes

---

## Analysis Framework

### 1. Implementation Review

Understand where and how the feature/component is used:

| Area | Questions to Answer |
|------|---------------------|
| **Location** | Where is the code? What files/modules? |
| **Usage** | How is it called? What triggers it? |
| **Dependencies** | What does it depend on? What depends on it? |
| **Architecture** | What patterns are used? How is it structured? |
| **Integration** | How does it connect to other components? |

**Methods:**
- Code search for function/class usage
- Trace call paths
- Review imports and exports
- Examine configuration

### 2. Effectiveness Evaluation

Gather evidence of existing performance:

| Evidence Type | What to Look For |
|---------------|------------------|
| **Logs** | Error rates, latency, throughput |
| **Metrics** | Dashboard data, monitoring alerts |
| **Tests** | Pass rates, coverage gaps, flaky tests |
| **Issues** | Bug reports, user complaints |
| **Comments** | TODO notes, workarounds, technical debt |

**Key Questions:**
- What's working well? (with evidence)
- What's not working? (with evidence)
- Are there workarounds in place?
- What do error logs show?

### 3. Baseline Metrics

Establish quantitative measurements:

| Metric Category | Examples |
|-----------------|----------|
| **Performance** | Latency (P50, P95, P99), throughput, memory usage |
| **Quality** | Error rates, success rates, test coverage |
| **Usage** | Call frequency, user adoption, feature utilization |
| **Reliability** | Uptime, failure rate, recovery time |

**Important:** Document how each metric was measured for reproducibility.

### 4. Gap Analysis

Compare existing state to desired state:

| Gap Type | Questions |
|----------|-----------|
| **Functional** | What capabilities are missing? |
| **Performance** | Where does it fall short of targets? |
| **Quality** | What defects or issues exist? |
| **Maintainability** | What makes the code hard to change? |

**Prioritization:**
- HIGH: Blocking or critical impact
- MEDIUM: Significant but not blocking
- LOW: Nice to have

### 5. Opportunity Identification

Identify where improvements can have impact:

| Opportunity Type | Considerations |
|------------------|----------------|
| **Quick Wins** | Low effort, immediate benefit |
| **Structural** | Larger effort, foundational improvement |
| **Optimization** | Performance-focused refinements |
| **Cleanup** | Technical debt reduction |

### 6. Success Criteria Definition

Define measurable targets based on baselines:

**Format:** "Improve [metric] from [baseline] to [target] ([X]% improvement)"

**Examples:**
- "Reduce P95 latency from 500ms to 200ms (60% reduction)"
- "Increase test coverage from 65% to 90% (25 percentage points)"
- "Reduce error rate from 5% to 1% (80% reduction)"

---

## Analysis Checklist

- [ ] Existing usage patterns documented
- [ ] Code locations and dependencies mapped
- [ ] Effectiveness evaluated with evidence
- [ ] Baseline metrics established (with measurement method)
- [ ] Gaps identified and prioritized
- [ ] Opportunities listed with expected impact
- [ ] Success criteria defined (quantitative)
- [ ] Measurement strategy for validation defined

---

## Document Template

```markdown
# Implementation Analysis - [Work Package Name]

**Date:** [Date]
**Work Package:** [Name]
**Status:** [Draft/Complete]

---

## Implementation Review

### Existing Location
| Component | Path | Description |
|-----------|------|-------------|
| [Component] | `src/path/to/module` | [What it does] |

### Usage Patterns
**How is it used today:**
- [Usage pattern 1]
- [Usage pattern 2]

**Call frequency:** [How often is it invoked?]

### Dependencies

**Depends On:**
- `module/path` - [Why]

**Depended On By:**
- `other/module` - [How]

### Architecture
**Existing patterns:** [Describe architecture]
**Known technical debt:** [List any known issues]

---

## Effectiveness Evaluation

### What's Working Well ✅

| Capability | Evidence | Confidence |
|------------|----------|------------|
| [Feature/behavior] | [Log data, test results, metrics] | HIGH/MEDIUM/LOW |

### What's Not Working ❌

| Issue | Evidence | Impact |
|-------|----------|--------|
| [Problem] | [Error logs, bug reports, metrics] | HIGH/MEDIUM/LOW |

### Workarounds in Place
- [Workaround 1] - [Why needed]

---

## Baseline Metrics

| Metric | Current Value | Measurement Method | Date Measured |
|--------|--------------|-------------------|---------------|
| [Latency P50] | [X ms] | [How measured] | [Date] |
| [Latency P95] | [X ms] | [How measured] | [Date] |
| [Error Rate] | [X%] | [How measured] | [Date] |
| [Test Coverage] | [X%] | [How measured] | [Date] |

### Key Findings
- [Quantitative observation 1]
- [Quantitative observation 2]

---

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority |
|----|-----|---------------|---------------|--------|----------|
| G1 | [Missing capability] | [What exists] | [What's needed] | [Effect] | HIGH |
| G2 | [Performance issue] | [Current metric] | [Target metric] | [Effect] | MEDIUM |

---

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)
1. **[Opportunity]:** [Description]
   - Expected impact: [Benefit]
   - Effort: [Estimate]

### Structural Improvements (Higher Effort)
1. **[Opportunity]:** [Description]
   - Expected impact: [Benefit]
   - Effort: [Estimate]

### Optimization Opportunities
1. **[Opportunity]:** [Description]
   - Expected impact: [Benefit]
   - Effort: [Estimate]

---

## Success Criteria

### Performance Targets
- [ ] **[Metric 1]:** Improve from [baseline] to [target] ([X]% improvement)
- [ ] **[Metric 2]:** Reduce from [baseline] to [target] ([X]% reduction)

### Quality Targets
- [ ] **[Metric]:** Achieve [target] (baseline: [current])

### Functional Requirements
- [ ] [Requirement addressing Gap G1]
- [ ] [Requirement addressing Gap G2]

### Measurement Strategy
**How will we validate improvements?**
- [Test/script/tool for measuring metric 1]
- [Comparison methodology for before/after]

---

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| [Log file/dashboard] | Metrics | [Findings] |
| [Test suite] | Coverage | [Findings] |
| [Issue tracker] | Bug reports | [Findings] |

---

**Status:** Ready for plan-prepare activity
```

---

## Quality Indicators

### Good Analysis

- ✅ Quantitative baselines with measurement methodology
- ✅ Evidence-based effectiveness claims
- ✅ Gaps linked to measurable success criteria
- ✅ Clear before/after comparison strategy
- ✅ Priorities justified with impact assessment

### Insufficient Analysis

- ❌ No baseline metrics
- ❌ Vague claims without evidence
- ❌ Success criteria not measurable
- ❌ Missing measurement strategy
- ❌ Gaps not prioritized

---

## Examples

### Good Baseline Metric

```markdown
| Metric | Current Value | Measurement Method | Date |
|--------|--------------|-------------------|------|
| Search P95 Latency | 487ms | Production logs, 7-day average | 2025-01-15 |
| Non-zero Result Rate | 64% | Query analysis script on 1000 sample queries | 2025-01-15 |
| Test Coverage | 72% | `cargo tarpaulin --out json` | 2025-01-15 |
```

### Poor Baseline Metric

```markdown
| Metric | Value |
|--------|-------|
| Latency | slow |
| Coverage | not great |
```

### Good Success Criterion

```markdown
- [ ] **Search P95 Latency:** Reduce from 487ms to 200ms (59% reduction)
  - Measurement: Production logs, same methodology as baseline
  - Validation: Run load test with 1000 queries, measure P95
```

### Poor Success Criterion

```markdown
- [ ] Make search faster
```

---

## Integration with Workflow

This guide supports implementation analysis:

1. **After KB research confirmed** → Begin implementation analysis
2. **Complete analysis** → Store in planning folder artifact
3. **Present checkpoint** → Get user confirmation
4. **Proceed to design** → Use baselines to inform success criteria

---

## Related Guides

- [Work Package Implementation Workflow](../workflow.toon)
- [Knowledge Base Research Guide](07-knowledge-base-research.md)
- [Architecture Review Guide](15-architecture-review.md)
- [Test Plan Creation Guide](11-test-plan.md)
