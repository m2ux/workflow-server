---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 7
  legacy_id: 7
---

## Capability

Format merged, severity-scored findings into a structured markdown CI/CD security audit report. Each finding includes pattern identification, source-to-sink mapping, severity assessment, affected file, vulnerable code snippet, and a specific remediation recommendation. The report includes an executive summary, finding details, a severity distribution, a remediation roadmap, and methodology notes. The operations in this set decompose that into remediation loading and report assembly.

## Inputs

### scored_findings

Merged findings annotated with severity levels and scoring rationale

### verification_report

Scan completeness [verification](../../resources/intermediate-artifact-schemas.md#verification-report) with file and per-pattern coverage.

## Outputs

### audit_report

Complete CI/CD security [audit report](../../resources/cicd-audit-report-template.md#cicd-audit-report-template)

#### artifact

`01-cicd-audit-report.md`

## Rules

### confirmed-flow-only

Observations without confirmed source-to-sink flow are listed separately as informational items.

### every-merged-finding-reported

The merged findings are the canonical finding inventory; every merged finding appears in the report.
