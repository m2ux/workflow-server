---
id: cicd-severity-rubric
version: 1.0.0
---

# CI/CD Severity Scoring Rubric

Two-dimensional severity scoring: **Impact** x **Exploitability**, calibrated against the hackerbot-claw campaign (Feb 2026).

## Impact Tiers

| Tier | Label | Description | Examples |
|------|-------|-------------|----------|
| I1 | Repository Takeover | Full control of repository: delete releases, push commits, modify code, exfiltrate all secrets | Trivy attack: PAT stolen, 178 releases deleted, repo taken private |
| I2 | Code Execution with Secrets | Arbitrary command execution on CI runner with access to repository secrets or tokens | awesome-go: GITHUB_TOKEN exfiltrated; akri: fork script ran with secrets |
| I3 | Code Execution without Secrets | Command execution on CI runner but without access to elevated secrets | Expression injection in a workflow with `permissions: {}` |
| I4 | Information Disclosure | Read access to workflow configuration, environment variables, or runner metadata | Leaking non-secret environment variables or build artifacts |

## Exploitability Tiers

| Tier | Label | Description | Examples |
|------|-------|-------------|----------|
| E1 | Unauthenticated Fork PR | Any GitHub user can trigger by opening a PR from a fork — no repository relationship required | pull_request_target workflows that checkout fork code |
| E2 | Comment Trigger (No Auth) | Any GitHub user can trigger by posting a comment — no author_association check | `/version minor` on akri, `/sync-metadata` on DataDog |
| E3 | Authenticated Contributor | Requires repository write access (MEMBER, COLLABORATOR, or OWNER) | Workflows that check author_association before executing |
| E4 | Maintainer Action Required | Requires a maintainer to merge, approve, or manually trigger | workflow_dispatch, manual approval gates |

## Severity Matrix

| | E1 (Fork PR) | E2 (Comment) | E3 (Contributor) | E4 (Maintainer) |
|---|---|---|---|---|
| **I1 (Repo Takeover)** | Critical | Critical | High | Medium |
| **I2 (RCE + Secrets)** | Critical | High | High | Medium |
| **I3 (RCE no Secrets)** | High | High | Medium | Low |
| **I4 (Info Disclosure)** | Medium | Medium | Low | Low |

## Compound Vulnerability Elevation

When multiple patterns converge on the same workflow, apply compound elevation:

| Compound Pattern | Base Severity | Elevated Severity | Rationale |
|-----------------|---------------|-------------------|-----------|
| P2 + P1 (Pwn Request + Expression Injection) | High | Critical | Full attack chain: fork code + shell injection |
| P2 + P4 (Pwn Request + Excessive Permissions) | High | Critical | Fork code execution with write tokens |
| P3 + P5 (Comment Trigger + Fork Execution) | High | Critical | Unauthenticated trigger of fork code execution |
| P1 + P4 (Expression Injection + Write Permissions) | Medium | High | Injection with ability to modify repository |
| P2 + P6 (Pwn Request + AI Config) | High | Critical | Fork code loads poisoned AI config with secrets |
| P1 + P7 (Expression Injection + curl pipe bash) | High | Critical | Attacker-controlled URL in curl pipe bash |

**Rule**: Compound severity is the higher of (a) the maximum individual severity and (b) one level above the maximum individual severity, capped at Critical.

## Calibration Anchors

Known campaign outcomes used to validate severity assignments:

| Campaign Target | Pattern | Outcome | Calibrated Severity |
|----------------|---------|---------|-------------------|
| Trivy (aquasecurity) | P2 + P4 | PAT stolen, repo takeover, 178 releases deleted, malicious VSCode extension | **Critical** (I1 x E1) |
| awesome-go | P2 | GITHUB_TOKEN exfiltrated with contents:write + pull-requests:write | **Critical** (I2 x E1) |
| akri (CNCF) | P3 + P5 | Fork script executed via unauthenticated comment trigger | **Critical** (I2 x E2) |
| Microsoft/ai-discovery-agent | P1 | Branch name injection via `${{ }}` in echo command | **High** (I2 x E2) |
| DataDog/datadog-iac-scanner | P1 + P3 | Filename injection via `${{ }}` + unauthenticated comment trigger | **High** (I3 x E2) |
| ambient-code | P2 + P6 | AI config poisoning via pull_request_target + fork checkout | **High** (I2 x E1, mitigated by Claude's detection) |
| RustPython | P1 + P2 | Branch name injection + pull_request_target with PAT access | **Critical** (I1 x E1) |

## Common Scoring Errors

- **Under-rating fork PR exploitability**: Any GitHub user can open a fork PR. This is E1 (unauthenticated), not E3.
- **Over-rating comment triggers**: Comment triggers require the workflow to exist and accept the trigger word. Still E2 if no auth check.
- **Ignoring permission scope**: A `pull_request_target` workflow with `permissions: {}` (no permissions) is significantly less dangerous than one with `contents: write`.
- **Missing compound elevation**: A workflow with P2 + P1 + P4 is a complete attack chain — rate it as Critical even if P1 alone would be Medium.
