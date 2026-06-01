---
name: substrate-node-security-audit-techniques
description: Technique index and shared base contract for the substrate-node-security-audit workflow.
metadata:
  version: 1.0.0
---

# Substrate Node Security Audit Techniques

## Capability

Index of the techniques in the substrate-node-security-audit workflow. This root index is isomorphic to a technique: any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in this workflow, and any Protocol here is prepended (and renumbered) before each technique's own. Keep it minimal — only genuinely cross-technique contract belongs here.

## Techniques

| Technique | Description |
|---|---|
| [apply-checklist](./apply-checklist.md) | Apply Checklist |
| [build-function-registry](./build-function-registry.md) | Build Function Registry |
| [compare-finding-sets](./compare-finding-sets.md) | Compare Finding Sets |
| [decompose-safety-claims](./decompose-safety-claims.md) | Decompose Safety Claims |
| [dispatch-sub-agents](./dispatch-sub-agents.md) | Dispatch Sub Agents |
| [execute-audit](./execute-audit.md) | Execute Audit |
| [execute-sub-agent](./execute-sub-agent.md) | Execute Sub Agent |
| [extract-invariants](./extract-invariants.md) | Extract Invariants |
| [map-codebase](./map-codebase.md) | Map Codebase |
| [map-vulnerability-domains](./map-vulnerability-domains.md) | Map Vulnerability Domains |
| [merge-findings](./merge-findings.md) | Merge Findings |
| [scan-storage-lifecycle](./scan-storage-lifecycle.md) | Scan Storage Lifecycle |
| [score-severity](./score-severity.md) | Score Severity |
| [search-pattern-catalog](./search-pattern-catalog.md) | Search Pattern Catalog |
| [setup-audit-target](./setup-audit-target.md) | Setup Audit Target |
| [verify-sub-agent-output](./verify-sub-agent-output.md) | Verify Sub Agent Output |
| [write-gap-analysis](./write-gap-analysis.md) | Write Gap Analysis |
| [write-report](./write-report.md) | Write Report |
