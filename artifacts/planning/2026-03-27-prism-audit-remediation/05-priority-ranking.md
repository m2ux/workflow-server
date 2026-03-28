# Priority Ranking

**Initiative:** Prism Audit Remediation — March 2026
**Date:** 2026-03-27

---

## Dependency Graph

```
WP-01 (Schema Alignment)
  │
  └──► WP-02 (Validation Enforcement)

WP-03 (Behavioral & Infrastructure Fixes)  [independent]
```

WP-01 must complete before WP-02 begins. WP-03 has no dependencies and can execute at any point.

## Prioritization Criteria

| Package | Severity | Value | Risk | Effort | Dependencies |
|---------|----------|-------|------|--------|-------------|
| WP-01 | 1 HIGH, 2 MED, 3 LOW | High — fixes data rejection, schema truth | Low — additive changes | 2–3h | None |
| WP-02 | 5 MEDIUM | High — eliminates validation equilibrium | Medium — cascading test changes | 3–4h | WP-01 |
| WP-03 | 1 MED, 3 LOW | Medium — correctness improvements | Low — isolated modules | 2–3h | None |

## Proposed Execution Order

| Order | Package | Rationale |
|-------|---------|-----------|
| 1 | **WP-01: Schema Alignment** | Contains the only HIGH-severity finding (F-01). Unblocks WP-02. Low risk, additive changes. |
| 2 | **WP-02: Validation Enforcement** | Addresses the self-concealing equilibrium (core audit finding). Depends on WP-01. |
| 3 | **WP-03: Behavioral & Infrastructure Fixes** | Independent, lower severity. Can run after WP-02 or in parallel if needed. |

## Timeline Estimate

| Phase | Duration | Running Total |
|-------|----------|---------------|
| WP-01 | 2–3h agentic + review | 2–3h |
| WP-02 | 3–4h agentic + review | 5–7h |
| WP-03 | 2–3h agentic + review | 7–10h |

**Total:** 7–10 hours agentic development + ~2 hours human review across 3 PRs.
