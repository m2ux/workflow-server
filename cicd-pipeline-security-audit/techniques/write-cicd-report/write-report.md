---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Produce the final audit report: write the executive summary, per-finding details, severity distribution, remediation roadmap, and methodology, then assemble them into the complete report.

## Protocol

### 1. Write Executive Summary

- Summarize the `{scored_findings}` by severity level
- Highlight critical and high findings requiring immediate attention
- Note compound vulnerability chains as priority items

### 2. Write Finding Details

- For each finding, write a structured block with finding number, pattern ID (P1-P7), severity, source, sink, evidence snippet, and remediation, grouped by submodule.
- For compound findings, document the full attack chain.
- Include before/after code examples from the [remediation playbook](../../resources/remediation-playbook.md).

### 3. Write Severity Distribution

- Produce severity distribution table and per-pattern breakdown

### 4. Write Remediation Roadmap

- Prioritize remediation by severity and exploitability
- Provide a phased remediation plan (immediate, short-term, long-term)

### 5. Write Methodology

- Document the audit methodology, pattern catalog version, and scan coverage drawn from `{verification_report}`
- Include the reconciliation table as an appendix
- Assemble the preceding sections into the complete `{audit_report}`
