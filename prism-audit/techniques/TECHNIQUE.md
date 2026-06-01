---
name: prism-audit-techniques
description: Technique index and shared base contract for the prism-audit workflow.
metadata:
  version: 1.0.0
---

# Prism Audit Techniques

## Capability

Index of the techniques in the prism-audit workflow. This root index is isomorphic to a technique: any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in this workflow, and any Protocol here is prepended (and renumbered) before each technique's own. Keep it minimal — only genuinely cross-technique contract belongs here.

## Techniques

| Technique | Description |
|---|---|
| [compose-audit-prompt](./compose-audit-prompt.md) | Compose Audit Prompt |
