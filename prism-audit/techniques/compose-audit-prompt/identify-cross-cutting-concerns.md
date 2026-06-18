---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Identify concerns that span multiple audit domains — error-handling patterns, feature-flag discipline, trust-boundary consistency, and dependency risk — so they are examined across the codebase rather than within a single domain.

## Protocol

### 1. Identify Cross Cutting

- Error handling patterns: how the codebase handles errors across modules (panic vs Result, unwrap usage, silent error swallowing)
- Feature flag discipline: which features gate security-critical behaviour, risk of test/mock code in production
- Trust boundary consistency: where trust transitions occur and whether they are consistently enforced
- Dependency risk: third-party dependencies with known vulnerabilities or unmaintained status
