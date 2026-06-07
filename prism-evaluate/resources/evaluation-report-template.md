---
name: evaluation-report-template
description: Template for the consolidated evaluation report.
metadata:
  order: 3
  legacy_id: 3
---

# Evaluation Report Template

Template for the consolidated evaluation report. The
report consolidates prism analysis artifacts across all evaluation dimensions into a unified, standalone
document. The report MUST NOT
contain methodology metadata — no lens names, pipeline modes, pass descriptions, or process narratives;
findings are presented as conclusions.

## Evaluation Report Template

```markdown
# Evaluation Report: {target name}

## Executive Summary

{What was evaluated, in 1-2 sentences.}

| Dimension | Critical | High | Medium | Low | Total |
|-----------|----------|------|--------|-----|-------|
| {dimension} | {n} | {n} | {n} | {n} | {n} |
| **Total** | {n} | {n} | {n} | {n} | {n} |

**Core finding:** {the single deepest cross-dimensional insight, in 2-3 sentences.}

**Overall assessment:** {the bottom-line judgement on the target.}

## The Core Finding

{Expanded description of the deepest cross-dimensional insight — the one finding that explains the
most findings across dimensions.}

**Testable prediction:** {a concrete, falsifiable consequence implied by the core finding.}

## Per-Dimension Findings

### {Dimension Name}

{Dimension description — what this analytical axis examines.}

| ID | Severity | Title |
|----|----------|-------|
| {PREFIX-01} | {CRITICAL | HIGH | MEDIUM | LOW} | {finding title} |

**{PREFIX-01} — {title}** ({severity})
{Finding description: the issue, evidence, and impact.}

**Most important insight:** {the dimension's single most significant takeaway.}

## Cross-Cutting Patterns

**{Pattern name}**
- **Affected dimensions:** {dimensions where this pattern surfaces}
- **Evidence:** {supporting evidence drawn from each affected dimension}

## Corrections and Recommendations

### Immediate
- {actionable correction}

### Short-term
- {actionable improvement}

### Structural
- {deeper structural recommendation}
```

**What good looks like:** finding IDs use a 3-letter dimension prefix and are unique (CON-01, VER-03,
PLB-01, FEA-07); severity counts in the executive summary table match the per-dimension detail; the
report stands alone and contains no references to lenses, passes, or pipeline modes.
