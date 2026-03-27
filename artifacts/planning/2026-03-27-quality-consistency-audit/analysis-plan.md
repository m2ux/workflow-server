# Prism Analysis Plan — workflow-server

**Generated:** 2026-03-27
**Target:** `/home/mike/dev/workflow-server`
**Analytical Goal:** Quality and consistency audit
**Scope:** codebase (TypeScript/Node.js MCP server, ~3,222 LOC source + ~2,638 LOC tests)
**Target Type:** code
**Pipeline Mode:** full-prism (per-unit depth varies by risk/budget)
**Budget:** standard

---

## Strategy

A quality and consistency audit of the workflow-server codebase using risk-stratified depth.
High-risk modules (core logic, public API) receive full-prism treatment (structural → adversarial → synthesis)
to catch both quality defects and consistency violations. Medium-risk modules receive single-pass L12
structural analysis. Low-risk modules receive a lightweight 2-lens portfolio. Trivially small modules
and non-code artifacts are skipped.

The full-prism pipeline is recommended because:
1. **Structural pass** systematically catalogs quality patterns, error handling, and interface contracts
2. **Adversarial pass** challenges consistency assumptions — critical for finding where patterns diverge
3. **Synthesis pass** integrates findings into prioritized, actionable quality improvements

---

## Unit Summary

| # | Module | Path | Role | Risk | Mode | Lenses | LOC | Rationale |
|---|--------|------|------|------|------|--------|-----|-----------|
| 1 | Loaders | `src/loaders/` | business-logic | HIGH | full-prism | 00-02 | ~1,034 | Core loading/parsing logic; highest complexity; all tools depend on loaders |
| 2 | Tools | `src/tools/` | api-surface | HIGH | full-prism | 00-02 | ~541 | Public MCP tool handlers; entry points for all agent interaction |
| 3 | Schema (Zod) | `src/schema/` | types-definitions | MEDIUM | single | 00 | ~666 | Zod validation schemas; must be consistent with JSON schemas |
| 4 | Utils | `src/utils/` | utilities | MEDIUM | single | 00 | ~343 | Session, crypto, validation; foundational utilities |
| 5 | Server Core | `src/` (root files) | configuration | MEDIUM | single | 00 | ~342 | Server entry, errors, config, logging, trace — pattern consistency |
| 6 | JSON Schemas | `schemas/` | types-definitions | MEDIUM | single | 00 | ~1,803 | JSON Schema definitions; cross-check with Zod schemas |
| 7 | Tests | `tests/` | business-logic | MEDIUM | single | 00 | ~2,638 | Test quality, coverage consistency, pattern uniformity |
| 8 | Scripts | `scripts/` | utilities | LOW | portfolio | 10, 07 | ~1,092 | Deployment/validation scripts; operational quality |

### Skipped Units

| Module | Path | LOC | Reason |
|--------|------|-----|--------|
| Types | `src/types/` | ~45 | Trivially small (3 files, 45 lines); pure type re-exports |
| Resources | `src/resources/` | ~32 | Trivially small (2 files, 32 lines); minimal logic |
| Docs | `docs/` | ~1,566 | Non-code; not primary target for code quality audit |
| Constraints/Grammar | `constraints/`, `grammar/` | ~4 files | Formal specifications; outside code quality scope |

---

## Execution Order

### Phase 1 — High Risk (parallel, 2 units)
Units 1–2 run concurrently. These are the highest-value targets: core loading logic and public API surface.

- **Unit 1:** `src/loaders/` (full-prism, 3 dispatches)
- **Unit 2:** `src/tools/` (full-prism, 3 dispatches)

### Phase 2 — Medium Risk, Foundational (parallel, 2 units)
Units 3–4 run concurrently. Schema and utility modules provide the foundation; their consistency informs downstream analysis.

- **Unit 3:** `src/schema/` (single L12, 1 dispatch)
- **Unit 4:** `src/utils/` (single L12, 1 dispatch)

### Phase 3 — Medium Risk, Integration (parallel, 3 units)
Units 5–7 run concurrently. Server core, JSON schemas, and tests can be analyzed independently.

- **Unit 5:** `src/` root files (single L12, 1 dispatch)
- **Unit 6:** `schemas/` (single L12, 1 dispatch)
- **Unit 7:** `tests/` (single L12, 1 dispatch)

### Phase 4 — Low Risk (1 unit)
- **Unit 8:** `scripts/` (portfolio: degradation + claim, 2 dispatches)

---

## Cost Estimate

| Tier | Units | Dispatches/Unit | Subtotal |
|------|-------|-----------------|----------|
| HIGH (full-prism) | 2 | 3 | 6 |
| MEDIUM (single) | 5 | 1 | 5 |
| LOW (portfolio) | 1 | 2 | 2 |
| **Total** | **8** | — | **13 dispatches** |

---

## Parallelism Summary

- **Max concurrency:** 3 (Phase 3)
- **Phases:** 4
- **Critical path:** Phase 1 (full-prism on loaders/tools) dominates wall-clock time
