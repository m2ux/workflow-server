---
name: prism-update-techniques
description: Technique index and shared base contract for the prism-update workflow.
metadata:
  version: 1.0.0
---

# Prism Update Techniques

## Capability

Index of the techniques in the prism-update workflow. This root index is isomorphic to a technique: any Inputs, Outputs, Rules, or Errors defined here are inherited by every technique in this workflow, and any Protocol here is prepended (and renumbered) before each technique's own. Keep it minimal — only genuinely cross-technique contract belongs here.

## Techniques

| Technique | Description |
|---|---|
| [diff-upstream](./diff-upstream.md) | Diff Upstream |
| [sync-resources](./sync-resources.md) | Sync Resources |
| [update-prism-docs](./update-prism-docs.md) | Update Prism Docs |
| [update-skill-routing](./update-skill-routing.md) | Update Skill Routing |
| [verify-prism-consistency](./verify-prism-consistency.md) | Verify Prism Consistency |
