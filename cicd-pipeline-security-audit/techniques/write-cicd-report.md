---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 7
  legacy_id: 7
---

## Capability

Format merged, severity-scored findings into a structured markdown CI/CD security audit report. Each finding includes pattern identification, source-to-sink mapping, severity assessment, affected file, vulnerable code snippet, and a specific remediation recommendation. The report includes an executive summary, finding details, a severity distribution, a remediation roadmap, and methodology notes.

## Inputs

### scored_findings

Merged findings annotated with severity levels and scoring rationale

### verification_report

Scan completeness [verification](../resources/intermediate-artifact-schemas.md#verification-report) with file and per-pattern coverage.

## Protocol

### 1. Load Remediation

- Load the [remediation-playbook](../resources/remediation-playbook.md) for per-pattern remediation guidance

### 2. Write Executive Summary

- Summarize the `{scored_findings}` by severity level
- Highlight critical and high findings requiring immediate attention
- Note compound vulnerability chains as priority items

### 3. Write Finding Details

- For each finding, write a structured block with finding number, pattern ID (P1-P7), severity, source, sink, evidence snippet, and remediation, grouped by submodule.
- For compound findings, document the full attack chain.
- Include before/after code examples from the [remediation playbook](../resources/remediation-playbook.md).

### 4. Write Severity Distribution

- Produce severity distribution table and per-pattern breakdown

### 5. Write Remediation Roadmap

- Prioritize remediation by severity and exploitability
- Provide a phased remediation plan (immediate, short-term, long-term)

### 6. Write Methodology

- Document the audit methodology, pattern catalog version, and scan coverage drawn from `{verification_report}`
- Include the reconciliation table as an appendix
- Assemble the preceding sections into the complete `{audit_report}`

## Outputs

### audit_report

Complete CI/CD security [audit report](../resources/cicd-audit-report-template.md#cicd-audit-report-template)

#### artifact

`01-cicd-audit-report.md`

## Rules

### confirmed-flow-only

Observations without confirmed source-to-sink flow are listed separately as informational items.

### every-merged-finding-reported

The merged findings are the canonical finding inventory; every merged finding appears in the report.
