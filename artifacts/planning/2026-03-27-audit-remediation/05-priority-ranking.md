# Priority Ranking

## Dependency Graph

```
WP-01 (security) ─────────────────────────────────────────────┐
WP-02 (JSON schemas) ──┬──> WP-04 (cross-schema sync) ───────┤
WP-03 (Zod schemas) ───┘                                     ├──> WP-09 (tests)
WP-05 (loader errors) ──> WP-06 (loader determinism) ────────┤
WP-07 (tools protocol) ──────────────────────────────────────┤
WP-08 (utils) ───────────────────────────────────────────────┘
WP-10 (server core) ──────────────────────────────────────────
WP-11 (scripts) ──────────────────────────────────────────────
WP-12 (docs) ──────────────────────────────── last
```

## Evaluation

| WP | Value | Risk | Effort | Priority |
|----|-------|------|--------|----------|
| WP-01 | Security — highest business value | Low | Small | **1** |
| WP-02 | Critical finding, unblocks WP-04 | Medium | Medium | **2** |
| WP-03 | Critical finding, unblocks WP-04 | Medium | Medium | **3** |
| WP-05 | High findings cluster, unblocks WP-06 | Medium | Medium-large | **4** |
| WP-07 | Protocol declaration | Low | Medium-large | **5** |
| WP-08 | Foundational (ValidationResult) | Low | Medium-large | **6** |
| WP-10 | Memory leak | Low | Medium | **7** |
| WP-11 | Scripts resilience | Low | Medium | **8** |
| WP-04 | Cross-schema bridge | Low | Small | **9** |
| WP-06 | Loader determinism | Low | Medium | **10** |
| WP-09 | Test infrastructure | Low | Medium-large | **11** |
| WP-12 | Documentation | Low | Small | **12** |

## Rationale

1. **Security first**: WP-01 addresses path traversal (arbitrary filesystem access). Ships independently, small scope.
2. **Critical findings next**: WP-02 and WP-03 fix the two Critical-severity findings and unblock WP-04.
3. **Error transparency before determinism**: WP-05 must precede WP-06 — nondeterministic behavior is undiagnosable when errors are swallowed.
4. **Independent modules in parallel**: WP-07, WP-08, WP-10, WP-11 have no mutual dependencies.
5. **Dependent packages last**: WP-04 (needs WP-02+03), WP-06 (needs WP-05), WP-09 (needs WP-05–08), WP-12 (needs all).

## Parallelism

7 of 12 packages have no mutual dependencies. Maximum parallel lanes: 7.

Critical path: WP-05 → WP-06 → WP-09, or WP-02 + WP-03 → WP-04.
