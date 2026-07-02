---
name: definitive-findings-template
description: Document skeleton for DEFINITIVE-FINDINGS.md — the detailed, stable findings contract prism emits alongside REPORT.md. Carries the full per-finding field set (Description, Impact, Location, Recommendation, Classification, Blast radius, Adversarial confirmation) plus the surviving conservation laws / design trade-offs and the core finding. Factual voice; consumers build audit and evaluation deliverables from this without re-reading raw pass artifacts.
metadata:
  order: 65
  legacy_id: 65
  quality_baseline: null
  optimal_model: sonnet
  type: template
---

This resource defines the structure of DEFINITIVE-FINDINGS.md, the detailed companion to the lean
REPORT.md. It carries a `definitive_findings_path`. Every finding present in REPORT.md appears here with
its complete field set, and finding IDs match REPORT.md exactly. Consumer workflows (prism-audit,
prism-evaluate) build their deliverables from this artifact and never re-read the raw pass artifacts.

## DEFINITIVE-FINDINGS.md Template

```markdown
---
Subject: {what was analysed — the target}
Evaluation Date: {YYYY-MM-DD}
Scope: {the analytical focus / boundary of what was evaluated}
---

# {Subject} — Definitive Findings

## Core Finding

{Present only when a core finding exists. State the deepest structural insight as a definitive
conclusion, followed by its testable prediction: "{prediction that would falsify or confirm it}".}

## Findings

Findings are ordered by severity (Critical, High, Medium, Low). Finding IDs match REPORT.md exactly.

### {REPORT-ID} — {finding title}

- **Severity:** {Critical | High | Medium | Low}
- **Classification:** {Fixable | Structural | ...}
- **Description:** {factual statement of what breaks and where.}
- **Impact:** {the consequence if unaddressed — what it causes, not the mechanism.}
- **Location:** {file:symbol or region}
- **Recommendation:** {concrete corrective action.}
- **Blast radius:** {e.g. "14 direct callers, 3 execution flows, 2 modules" — omit if no graph data}
- **Adversarial confirmation:** {full-prism only: how the adversarial pass confirmed or corrected the
  finding, stated factually — e.g. "confirmed", "severity raised from Medium", "underclaim promoted".
  Omit for single and portfolio findings.}

## Conservation Laws & Design Trade-offs

{Present for full-prism and behavioral analyses. The conservation law(s) and meta-law that survived the
adversarial challenge, each stated as a falsifiable constraint with its current operating point. Laws
rejected by the adversarial pass are excluded.}

### {Law name}

- **Constraint:** {the invariant, stated factually as a falsifiable statement.}
- **Current operating point:** {code-level evidence, citing the originating REPORT-IDs.}
- **Shift prediction:** {what changes if the constraint is relaxed or the operating point moves.}

## Traceability

| Report ID | Source Artifact | Original ID | Original Severity |
|-----------|-----------------|-------------|-------------------|
| {REPORT-ID} | {artifact path} | {original id} | {severity} |
```

What good looks like: every REPORT.md finding ID has a full-field entry here and a Traceability row;
Impact and Recommendation are present for every finding; conservation laws rejected by the adversarial
pass never appear; the voice is factual with no attribution to passes, lenses, or analytical process.
