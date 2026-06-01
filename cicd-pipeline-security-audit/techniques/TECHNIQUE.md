---
name: cicd-pipeline-security-audit-techniques
description: Technique index and shared base contract for the cicd-pipeline-security-audit workflow.
metadata:
  version: 1.0.0
---

# Cicd Pipeline Security Audit Techniques

## Capability

Index of the techniques in the cicd-pipeline-security-audit workflow. This root index is isomorphic to a technique: any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in this workflow, and any Protocol here is prepended (and renumbered) before each technique's own. Keep it minimal — only genuinely cross-technique contract belongs here.

## Techniques

| Technique | Description |
|---|---|
| [dispatch-scanners](./dispatch-scanners.md) | Dispatch Scanners |
| [execute-cicd-audit](./execute-cicd-audit.md) | Execute Cicd Audit |
| [execute-sub-agent](./execute-sub-agent.md) | Execute Sub Agent |
| [inventory-workflows](./inventory-workflows.md) | Inventory Workflows |
| [merge-scan-findings](./merge-scan-findings.md) | Merge Scan Findings |
| [scan-injection-patterns](./scan-injection-patterns.md) | Scan Injection Patterns |
| [score-cicd-severity](./score-cicd-severity.md) | Score Cicd Severity |
| [verify-scan-output](./verify-scan-output.md) | Verify Scan Output |
| [write-cicd-report](./write-cicd-report.md) | Write Cicd Report |
