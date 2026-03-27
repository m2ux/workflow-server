# WP-06: Loader Determinism and Deduplication

**Created:** 2026-03-27
**Status:** Complete
**Type:** Bug Fix
**Issue:** [#67](https://github.com/m2ux/workflow-server/issues/67)
**PR:** [#73](https://github.com/m2ux/workflow-server/pull/73)
**Branch:** `fix/wp06-loader-determinism`
**Dependency:** WP-05 (loader error handling) — merged

---

## Executive Summary

Address 12 findings related to nondeterministic ordering, code duplication, dead code, and minor inconsistencies across the five loader modules. These findings were identified during the structural prism analysis and are verifiable now that WP-05 has landed proper error handling.

---

## Problem Overview

The loader modules resolve workflows, activities, skills, and resources by scanning filesystem directories. Several cross-workflow search functions iterate directory entries without sorting, producing results whose order depends on the operating system's `readdir` implementation. This means the same query can return different activities or skills depending on the host, making behavior unreproducible across environments.

Beyond nondeterminism, the codebase contains duplicated parsing logic, unused constants, redundant I/O operations, and minor regex inconsistencies that increase maintenance cost and obscure intent. Fixing these alongside the ordering issues produces a cleaner, more predictable loader layer.

---

## Solution Overview

Sort all directory-derived identifier lists before iteration to guarantee deterministic resolution order. Extract the duplicated `parseActivityFilename` function into a shared utility module. Define TOON-over-Markdown priority for dual-format resources. Align meta-workflow filtering between the activity and skill loaders. Remove dead code, unused constants, and redundant `readdir` calls. Standardize filename regex patterns and widen `padStart` to handle 3+ digit indices.

---

## Progress

| # | Artifact | Description | Status |
|---|----------|-------------|--------|
| 01 | [README](README.md) | Planning folder overview | ✅ Complete |
| 02 | [Design philosophy](02-design-philosophy.md) | Design approach and complexity | ✅ Complete |
| 03 | [Implementation plan](03-implementation-plan.md) | Task breakdown | ✅ Complete |
| 04 | [Assumptions](04-assumptions.md) | Assumptions and decisions | ✅ Complete |
| — | Implementation | Code changes across 6 files (5 modified + 1 new) | ✅ Complete |
| 05 | [Post-impl review](05-post-impl-review.md) | Structural review of changes | ✅ Complete |
| — | Validation | Typecheck and test pass (197/197) | ✅ Complete |

---

## Links

| Resource | Link |
|----------|------|
| Parent Initiative | [Audit Remediation](../2026-03-27-audit-remediation/README.md) |
| Tracking Issue | [#67](https://github.com/m2ux/workflow-server/issues/67) |
| Pull Request | [#73](https://github.com/m2ux/workflow-server/pull/73) |
| WP-06 Plan | [04-06-loader-determinism-plan.md](../2026-03-27-audit-remediation/04-06-loader-determinism-plan.md) |

---

**Status:** Complete — all 12 findings remediated, tests pass, PR merged
