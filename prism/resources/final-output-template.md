---
name: final-output-template
description: Document skeleton for the clean final REPORT.md produced by the generate-report technique. Defines front-matter, Executive Summary, Core Finding, severity-ordered Findings sections, Corrections Required, and the Traceability appendix. Methodology-free, factual voice.
metadata:
  order: 49
  legacy_id: 49
  quality_baseline: null
  optimal_model: sonnet
  type: template
---

This resource defines the faithful structure of the final report artifact. The structure mirrors the
`generate-report` technique's `## Outputs > report` components (report_path, finding_count, core_finding)
and its Compose Report protocol step. Findings are written in factual declarative voice with no attribution
to passes, lenses, or analytical process.

## REPORT.md Template

```markdown
---
Subject: {what was analysed — the target}
Evaluation Date: {YYYY-MM-DD}
Scope: {the analytical focus / boundary of what was evaluated}
---

# {Subject} — Evaluation Report

## Executive Summary

{2-3 sentences stating the scope and the headline outcome.}

| Severity | Count |
|----------|-------|
| Critical | {n}   |
| High     | {n}   |
| Medium   | {n}   |
| Low      | {n}   |
| Total    | {n}   |

Core finding: {one-sentence statement of the deepest finding, or "No core finding." }

## Core Finding

{Present only when a core finding exists. State the deepest structural insight as a definitive
conclusion, followed by its testable prediction: "{prediction that would falsify or confirm it}".}

## Critical Findings

### {REPORT-ID} — {finding title}

- **Severity:** Critical
- **Description:** {factual statement of what breaks and where.}
- **Classification:** {Fixable | Structural | ...}
- **Location:** {file:symbol or region}
- **Blast radius:** {e.g. "14 direct callers, 3 execution flows, 2 modules" — omit if no graph data}

## High Findings

### {REPORT-ID} — {finding title}

- **Severity:** High
- **Description:** {...}
- **Classification:** {...}
- **Location:** {...}
- **Blast radius:** {... | omitted}

## Medium Findings

### {REPORT-ID} — {finding title}

- **Severity:** Medium
- **Description:** {...}
- **Classification:** {...}
- **Location:** {...}
- **Blast radius:** {... | omitted}

## Low Findings

### {REPORT-ID} — {finding title}

- **Severity:** Low
- **Description:** {...}
- **Classification:** {...}
- **Location:** {...}
- **Blast radius:** {... | omitted}

## Corrections Required

{Present only when findings warrant action. An ordered list of actionable items derived from the
findings above, each referencing the originating REPORT-ID.}

1. {REPORT-ID}: {concrete corrective action.}

## Traceability

| Report ID | Source Artifact | Original ID | Original Severity |
|-----------|-----------------|-------------|-------------------|
| {REPORT-ID} | {artifact path} | {original id} | {severity} |
```

What good looks like: the Executive Summary count table totals exactly match the number of findings in
the body; every finding ID has a Traceability row; no sentence attributes a finding to a pass, lens, or
analytical step.
