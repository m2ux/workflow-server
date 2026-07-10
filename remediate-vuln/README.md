# Security Vulnerability Remediation Workflow (remediate-vuln)

## Overview
A highly isolated workflow for remediating security vulnerabilities without public disclosure. It owns only the security-specific setup; every other activity is borrowed from the `work-package` workflow and runs with `stealth_mode: true`, which structurally gates out all public-disclosure side-effects (PR rendering and creation, issue-tracker posting, PR review lifecycle) and enables the private-remote isolation checks at submission.

## Privacy model

- `stealth_mode` (always `true` here) is the structural no-disclosure gate consumed by the shared work-package activities.
- `push_remote` is always the private `security` remote; the shared submit activity verifies it resolves to a private repository and confirms with the user before any push.
- Workflow rules additionally forbid public GitHub tools, pushes to `origin`, and advisory-identifying strings in outbound research queries.

## Activities

| # | Activity | Source | Purpose |
|---|----------|--------|---------|
| 01 | start | own ([01-start.yaml](activities/01-start.yaml)) | Advisory inputs, private `security` remote, isolation checks, security branch, project-type + reference resolution, signing preflight |
| 02 | design-philosophy | work-package | Problem classification and workflow path |
| 03 | requirements-elicitation | work-package | Optional requirements discovery |
| 04 | research | work-package | Optional research (constrained by the private-research rule) |
| 05 | implementation-analysis | work-package | Current-state analysis |
| 06 | plan-prepare | work-package | Plan and test strategy (PR rendering stealth-gated out) |
| 07 | assumptions-review | work-package | Assumption interview (issue-tracker posting stealth-gated out) |
| 08 | implement | work-package | Task-cycle implementation with provenance log |
| 09 | lean-coding-audit | work-package | Over-engineering audit |
| 10 | post-impl-review | work-package | Code/diff/test review |
| 11 | validate | work-package | Build/test/lint suite |
| 12 | strategic-review | work-package | Scope/minimality review + commit-signature scan and re-sign |
| 13 | submit-for-review | work-package | DCO attestation, private-remote isolation checks, push to `security` (PR lifecycle stealth-gated out) |
| 14 | complete | work-package | Close-out |
| 15 | codebase-comprehension | work-package | Comprehension deep-dive |

```mermaid
flowchart LR
  start --> design-philosophy --> codebase-comprehension
  codebase-comprehension --> requirements-elicitation --> research
  codebase-comprehension --> implementation-analysis --> plan-prepare --> assumptions-review --> implement
  implement --> lean-coding-audit --> post-impl-review --> validate --> strategic-review --> submit-for-review --> complete
  strategic-review -. findings .-> plan-prepare
```

## Techniques
The workflow keeps one local technique group, [security-setup](techniques/security-setup/TECHNIQUE.md); all other techniques come from work-package (via borrowed activities) and meta.
