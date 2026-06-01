---
name: prism-evaluate-techniques
description: Technique index and shared base contract for the prism-evaluate workflow.
metadata:
  version: 1.0.0
---

# Prism Evaluate Techniques

## Capability

Index of the techniques in the prism-evaluate workflow. This root index is isomorphic to a technique: any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in this workflow, and any Protocol here is prepended (and renumbered) before each technique's own. Keep it minimal — only genuinely cross-technique contract belongs here.

## Techniques

| Technique | Description |
|---|---|
| [compose-evaluation-report](./compose-evaluation-report.md) | Compose Evaluation Report |
| [plan-evaluation](./plan-evaluation.md) | Plan Evaluation |
| [resolve-findings](./resolve-findings.md) | Resolve Findings |
