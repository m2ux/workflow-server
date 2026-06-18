---
name: cicd-audit-report-template
description: Document skeleton for the final CI/CD security audit report.
metadata:
  version: 1.0.0
  order: 6
  legacy_id: 6
---

# CI/CD Audit Report

Document skeleton for the final report. The section order is executive summary, finding details, severity distribution, remediation roadmap, methodology — and every finding block carries the fields number, pattern ID, severity, source, sink, evidence snippet, and remediation. Written to `01-cicd-audit-report.md`.

What good looks like: every finding has a confirmed source-to-sink flow and a specific remediation; compound chains are documented as priority items; observations without a confirmed flow are listed separately as informational; and the reconciliation table appears as an appendix.

## CI/CD Audit Report Template

```markdown
# CI/CD Pipeline Security Audit Report

**Targets:** {submodule paths or 'all'}
**Pattern catalog version:** {version}
**Date:** {ISO date}

## Executive Summary

{Total findings by severity level — Critical / High / Medium / Low counts.}

{Highlight Critical and High findings requiring immediate attention.}

{Note compound vulnerability chains as priority items.}

## Findings

> Grouped by submodule. Each finding has a confirmed source-to-sink flow.

### {submodule_path}

#### Finding {n} — {pattern ID P1-P7}: {title}

- **Severity:** {Critical | High | Medium | Low}
- **Affected file:** {path}
- **Source:** {attacker-controlled entry point}
- **Sink:** {privileged execution context}
- **Evidence:**

  ```yaml
  {vulnerable code snippet}
  ```

- **Remediation:** {specific recommendation, with before/after from the remediation playbook}

  ```yaml
  # Before
  {vulnerable config}
  # After
  {fixed config}
  ```

#### Compound Finding {n} — {constituent patterns, e.g. P2+P1+P4}: {title}

- **Severity:** {elevated severity}
- **Attack chain:** {full chain across the constituent patterns}
- **Constituent findings:** {finding numbers}
- **Evidence:** {preserved evidence per constituent pattern}
- **Remediation:** {chain-level remediation}

## Severity Distribution

| Severity | Count |
|----------|-------|
| Critical | {n} |
| High     | {n} |
| Medium   | {n} |
| Low      | {n} |

### Per-Pattern Breakdown

| Pattern | Findings |
|---------|----------|
| P1 | {n} |
| P2 | {n} |
| ... | ... |
| P7 | {n} |

## Remediation Roadmap

> Prioritized by severity and exploitability.

- **Immediate:** {Critical / actively exploitable findings}
- **Short-term:** {High findings}
- **Long-term:** {Medium / Low findings and hardening}

## Informational Observations

> Items without a confirmed source-to-sink flow or accepted risks.

- {observation}: {rationale}

## Methodology

- **Audit methodology:** {phases, scanner/verify/merge model}
- **Pattern catalog version:** {version}
- **Scan coverage:** {scanned vs total workflow files; per-pattern coverage}

### Appendix: Reconciliation Table

| Scanner Finding | Merged Finding | Disposition |
|-----------------|----------------|-------------|
| {S1-F001} | {M-001} | {merged / duplicate} |
```
