# Cross-Schema Consistency Enforcement — WP-04

**Created:** 2026-03-27
**Status:** In Progress
**Type:** Bug Fix

---

## 🎯 Executive Summary

Resolve three cross-cutting inconsistencies between JSON Schema definitions, Zod runtime schemas, and code that references schema identifiers. These findings were identified during the Quality & Consistency Audit (QC-014, QC-019, QC-027) and affect schema validation fidelity across three module boundaries.

---

## Problem Overview

The workflow-server maintains dual schema definitions — JSON Schema files for external tooling and documentation, and Zod schemas for runtime validation. Three points of divergence exist: the `artifactLocation` field accepts a string shorthand in Zod but not in JSON Schema, meaning TOON authors who use the shorthand pass runtime validation but fail linting; the validation script uses persisted JSON Schema files via Ajv instead of the Zod schemas the runtime actually enforces; and the schema identifier list is independently hardcoded in two loader files, creating a maintenance hazard when new schemas are added.

These inconsistencies erode trust in the validation pipeline. A TOON file that validates at runtime may fail the standalone validation script (or vice versa), and adding a new schema type requires updating two files that share no import relationship.

---

## Solution Overview

For QC-014, add `string` as an accepted alternative in the JSON Schema `artifactLocations.additionalProperties` definition, using `oneOf` to match the Zod union behavior. For QC-019, replace Ajv with the Zod `WorkflowSchema.safeParse()` import in `validate-workflow.ts` so the script uses the same schema the runtime enforces. For QC-027, import `listSchemaIds` from `schema-loader.ts` in `schema-preamble.ts` and iterate dynamically instead of hardcoding schema names.

---

## 📊 Progress

| # | Item | Description | Status |
|---|------|-------------|--------|
| 01 | [README](README.md) | Planning folder init | ✅ Complete |
| 02 | [Design philosophy](02-design-philosophy.md) | Approach and constraints | ✅ Complete |
| 04 | [Plan](04-plan.md) | Implementation plan | ✅ Complete |
| 05 | [Assumptions review](05-assumptions-review.md) | Risk and assumptions | ✅ Complete |
| 06 | Implementation | Code changes for QC-014, QC-019, QC-027 | ⬚ Pending |
| 09 | Post-impl review | Code review artifact | ⬚ Pending |
| 10 | Validation | Typecheck + tests | ⬚ Pending |
| 11 | Strategic review | Final quality check | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Tracking Issue | [#67](https://github.com/m2ux/workflow-server/issues/67) |
| Pull Request | [#71](https://github.com/m2ux/workflow-server/pull/71) |
| Branch | `fix/wp04-cross-schema-sync` |
| Audit Report | [REPORT.md](../2026-03-27-quality-consistency-audit/REPORT.md) |
| Initiative README | [README.md](../2026-03-27-audit-remediation/README.md) |

---

**Status:** Planning complete, implementation pending
