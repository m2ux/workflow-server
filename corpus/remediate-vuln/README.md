# Security Vulnerability Remediation Workflow (remediate-vuln)

## Overview
A workflow for remediating security vulnerabilities on the private `security` remote. It owns the security-specific setup. Every other activity is borrowed from `legacy`. Submission verifies that remote and confirms with the user before any push.

## Activities

| # | Activity | Source | Purpose |
|---|----------|--------|---------|
| 01 | start | own ([01-start.yaml](activities/01-start.yaml)) | Advisory inputs, private `security` remote, isolation checks, security branch, project-type + repo-root resolution, signing preflight |
| 02 | design-philosophy | legacy | Problem classification and workflow path |
| 03 | requirements-elicitation | legacy | Optional requirements discovery |
| 04 | research | legacy | Optional research (constrained by the private-research rule) |
| 05 | implementation-analysis | legacy | Current-state analysis |
| 06 | plan-prepare | legacy | Plan and test strategy |
| 07 | assumptions-review | legacy | Assumption interview |
| 08 | implement | legacy | Task-cycle implementation with provenance log |
| 09 | lean-coding-audit | legacy | Over-engineering audit |
| 16 | prism-decision | legacy | Full prism pipeline or inline structural pass |
| 17 | code-review | legacy | Review fan branch — code findings |
| 18 | structural-analysis | legacy | Review fan branch — inline structural pass |
| 19 | test-suite-review | legacy | Review fan branch — coverage map and test findings |
| 10 | post-impl-review | legacy | Review fan join — manual diff gates, full prism when chosen, classify, fix cycle |
| 11 | validate | legacy | Build/test/lint suite |
| 12 | strategic-review | legacy | Scope/minimality review + commit-signature scan and re-sign |
| 13 | submit-for-review | legacy | DCO attestation, private-remote isolation checks, push to `security` |
| 14 | complete | legacy | Close-out |
| 15 | codebase-comprehension | legacy | Comprehension deep-dive |

```mermaid
flowchart LR
  start --> design-philosophy --> codebase-comprehension
  codebase-comprehension --> requirements-elicitation --> research
  codebase-comprehension --> implementation-analysis --> plan-prepare --> assumptions-review --> implement
  implement --> lean-coding-audit --> prism-decision
  prism-decision --> code-review --> post-impl-review
  prism-decision --> structural-analysis --> post-impl-review
  prism-decision --> test-suite-review --> post-impl-review
  post-impl-review --> validate --> strategic-review --> submit-for-review --> complete
  strategic-review -. findings .-> plan-prepare
```

## Techniques
The workflow keeps one local technique group, [security-setup](techniques/security-setup/TECHNIQUE.md); all other techniques come from legacy (via borrowed activities) and meta.
