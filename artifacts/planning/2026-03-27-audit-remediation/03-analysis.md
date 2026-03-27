# Context Analysis — Audit Remediation Initiative

## Source Material

This initiative remediates findings from the [Quality & Consistency Audit](../2026-03-27-quality-consistency-audit/REPORT.md), which performed a full structural prism analysis of the workflow-server codebase across 8 analysis units.

## Findings Summary

| Severity | Count | Fixable | Structural |
|----------|-------|---------|------------|
| Critical | 2 | 2 | 0 |
| Security | 2 | 2 | 0 |
| High | 16 | 12 | 4 |
| Medium | 63 | 49 | 14 |
| Low | 57 | 48 | 8 |
| **Total** | **140** | **113** | **26** |

## Core Findings

1. **Loaders**: Accidental implementation bugs are indistinguishable from intentional design decisions. Fixing accidental bugs is a prerequisite for understanding the real architecture.

2. **Tools**: The session protocol exists only as contradictory prose. Every handler independently interprets protocol requirements, producing systematic conformance violations.

## Systemic Patterns

Six systemic patterns cut across multiple modules:

1. **Silent error swallowing** (12 findings) — no unified error-handling strategy
2. **Schema dual-definition divergence** (14 findings) — Zod and JSON schemas evolve independently
3. **Nondeterministic cross-entity operations** (4 findings) — readdir ordering controls results
4. **Type safety erosion at data boundaries** (11 findings) — unsafe casts at external-data entry points
5. **Test data coupling** (6 findings) — tests assert on mutable workflow data, not parsing logic
6. **Documentation-implementation drift** (6 findings) — README contradicts schema behavior

## Proposed Decomposition

The [PR distribution plan](../2026-03-27-quality-consistency-audit/pr-distribution.md) decomposes remediation into 12 work packages aligned with module boundaries. Key dependency constraints:

- PR-4 (cross-schema) depends on PR-2 (JSON) + PR-3 (Zod)
- PR-6 (loader determinism) depends on PR-5 (loader errors)
- PR-9 (tests) depends on PR-5–8 (the modules tests validate)
- PR-12 (docs) depends on all others

7 of 12 packages have no mutual dependencies and can proceed in parallel.

## Key Risks

- **Schema changes** (PR-2, PR-3) may break workflow TOON files that rely on current permissive validation
- **Loader error handling** (PR-5) changes error semantics — callers that depend on silent failures will need updates
- **Test infrastructure** (PR-9) is last in dependency chain but high value for preventing regression
