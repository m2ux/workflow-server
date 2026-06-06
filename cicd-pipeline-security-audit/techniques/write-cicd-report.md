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

### scored-findings

Merged findings annotated with severity levels and scoring rationale

### coverage-data

Scan completeness verification data (file and per-pattern coverage)

## Protocol

### 1. Load Remediation

- Use attached [remediation-playbook](../resources/remediation-playbook.md) (remediation-playbook) for per-pattern remediation guidance

### 2. Write Executive Summary

- Summarize the `scored-findings` by severity level
- Highlight critical and high findings requiring immediate attention
- Note compound vulnerability chains as priority items

### 3. Write Finding Details

- For each finding, write a structured block with finding number, pattern ID, severity, source, sink, evidence, and remediation
- For compound findings, document the full attack chain
- Include before/after code examples from the [remediation playbook](../resources/remediation-playbook.md)
- Group findings by submodule for readability
- Every finding must have a specific remediation recommendation

### 4. Write Severity Distribution

- Produce severity distribution table and per-pattern breakdown

### 5. Write Remediation Roadmap

- Prioritize remediation by severity and exploitability
- Provide a phased remediation plan (immediate, short-term, long-term)

### 6. Write Methodology

- Document the audit methodology, pattern catalog version, and scan coverage drawn from `coverage-data`
- Include the reconciliation table as an appendix
- Assemble the preceding sections into the complete `audit-report`

## Outputs

### audit-report

Complete CI/CD security [audit report](../resources/cicd-audit-report-template.md#cicd-audit-report-template)

#### artifact

`01-cicd-audit-report.md`

## Rules

### finding-format

Each finding must include: number, pattern ID (P1-P7), severity, source, sink, evidence snippet, and remediation

### no-false-positives

Observations without confirmed source-to-sink flow are listed separately as informational items
