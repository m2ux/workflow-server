---
metadata:
  version: 2.0.0
---

## Capability

Names the concerns that run across a codebase's domains rather than sitting inside any one of them.

## Protocol

### 1. Identify the Cross-Cutting Concerns

- Record `{audit_prompt.cross_cutting}`: how errors are handled across modules (panic against result, unwrap usage, silently swallowed errors), which feature flags gate security-critical behaviour and what risk test or mock code reaching production carries, where trust transitions occur and whether they are enforced consistently, and which third-party dependencies carry known vulnerabilities or are unmaintained.
