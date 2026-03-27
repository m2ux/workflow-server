# WP-08: Utils Hardening

**Issue:** [#67](https://github.com/m2ux/workflow-server/issues/67)
**PR:** [#75](https://github.com/m2ux/workflow-server/pull/75)
**Branch:** fix/wp08-utils-hardening
**Created:** 2026-03-27
**Status:** In Progress

---

## Problem Overview

The workflow server's utility modules — crypto, session, validation, and toon — contain type safety gaps, race conditions, and missing runtime guards that undermine the reliability of the foundational layer every other module depends on. For example, session tokens are decoded through an unsafe double cast that erases TypeScript's type checking, the server key file can be corrupted by concurrent processes, and the validation subsystem has no way to express an error state distinct from a warning.

These issues matter because utilities are consumed transitively by every tool handler, loader, and schema validator in the server. A corrupted key file silently produces invalid session tokens for all agents. An undefined value reaching `trim()` crashes the validation pipeline mid-request. A timing side-channel in HMAC verification could allow token forgery. Because these are foundational modules, each defect has a blast radius proportional to the number of consumers — currently every endpoint in the server.

---

## Solution Overview

Apply 20 targeted fixes across 5 utility files: add an `'error'` state to `ValidationResult` so callers can distinguish fatal validation failures from warnings; eliminate the TOCTOU race in key generation with atomic file operations; replace the unsafe double cast in session decode with Zod schema validation; use Node.js `timingSafeEqual` for HMAC verification; add null guards, complete the barrel export, and tighten type assertions throughout. Each fix is scoped to preserve the existing public API surface — callers that check `status === 'valid'` continue to work unchanged.

---

## Findings

| ID | Finding | Severity | File |
|----|---------|----------|------|
| QC-015 | `ValidationResult` has no error/invalid state | High | validation.ts |
| QC-045 | TOCTOU race in `getOrCreateServerKey` | Medium | crypto.ts |
| QC-046 | No validation that key is exactly 32 bytes | Medium | crypto.ts |
| QC-047 | Manual field type checking independent of SessionPayload | Medium | session.ts |
| QC-048 | Double cast `as unknown as SessionPayload` erases type safety | Medium | session.ts |
| QC-049 | Session timestamp never updated; no expiration check | Medium | session.ts |
| QC-050 | Unsafe type assertions in `validateSkillAssociation` | Medium | validation.ts |
| QC-051 | Cast to `Record<string, unknown>` to access `steps` | Medium | validation.ts |
| QC-052 | `entry.output.trim()` throws on undefined | Medium | validation.ts |
| QC-053 | `validateActivityManifest` ignores `transition_condition` | Medium | validation.ts |
| QC-054 | `decodeToon<T>` unsafe `as T` cast | Medium | toon.ts |
| QC-055 | Key generation writes without atomic rename | Medium | crypto.ts |
| QC-105 | Implicit Buffer encoding conversion | Low | crypto.ts |
| QC-106 | `hmacVerify` length check is timing side-channel | Low | crypto.ts |
| QC-107 | Zod imported but used for single descriptor | Low | session.ts |
| QC-108 | `advanceToken` mutates decoded payload before re-encoding | Low | session.ts |
| QC-109 | `validateTransitionCondition` conflates empty/undefined/default | Low | validation.ts |
| QC-110 | `encodeToon` silently narrows library capability | Low | toon.ts |
| QC-111 | Barrel export re-exports only toon.ts | Low | index.ts |
| QC-112 | Step order validation stops at first mismatch | Low | validation.ts |

---

## Progress

| Step | Description | Status |
|------|-------------|--------|
| start-work-package | Branch, issue, PR, planning folder | In Progress |
| design-philosophy | Design approach | Pending |
| scope-and-context | Scope analysis | Pending |
| assumptions-review | Stakeholder questions | Pending |
| implement | Apply 20 fixes across 5 files | Pending |
| post-impl-review | Change block index | Pending |

---

## Links

| Resource | Link |
|----------|------|
| Tracking Issue | [#67](https://github.com/m2ux/workflow-server/issues/67) |
| Pull Request | [#75](https://github.com/m2ux/workflow-server/pull/75) |
| WP-08 Plan | [04-08-utils-hardening-plan.md](../2026-03-27-audit-remediation/04-08-utils-hardening-plan.md) |
| Repository | [m2ux/workflow-server](https://github.com/m2ux/workflow-server) |
