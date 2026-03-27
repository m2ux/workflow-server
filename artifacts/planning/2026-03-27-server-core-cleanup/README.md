# WP-10: Server Core Cleanup

**Created:** 2026-03-27
**Status:** In Progress
**Type:** Bug Fix / Hardening
**Severity:** Medium (5 medium) + Low (9 low)

---

## Executive Summary

Address 14 findings in the server core layer spanning `server.ts`, `trace.ts`, `logging.ts`, `config.ts`, `index.ts`, `errors.ts`, and `result.ts`. Five medium-severity issues cover config mutation, unbounded session growth, incomplete token validation, double-append on error, and a concurrency race. Nine low-severity findings address optional-field typing, redundant error handlers, truncated UUIDs, empty-env handling, untyped error codes, unbounded log output, lost error properties, hardcoded tool lists, and timestamp redundancy.

---

## Problem Overview

The server core layer has several correctness and robustness issues that could surface under sustained use. The `createServer` function mutates its input config object, making it unsafe for callers who retain a reference. The `TraceStore` accumulates session data indefinitely, creating a memory leak proportional to server uptime. Trace token decoding validates only two of eight fields, so a token with a valid signature but corrupted payload data passes undetected. A try-block placement in `appendTraceEvent` can double-append events on partial failure, and concurrent calls to `getOrCreateServerKey` can race on key generation.

Beyond these medium-severity items, nine low-severity patterns reduce type safety and operational predictability. Empty environment variables are accepted as valid config values, error code strings are plain strings instead of a typed union, the `unwrap` helper strips custom properties from errors, `logWarn` can serialize arbitrarily large objects, and the tool list logged at startup is a hardcoded string array that drifts from actual registrations.

---

## Solution Overview

Each finding is addressed with a minimal, targeted fix in the affected file. Config mutation is prevented by shallow-cloning before assignment. Session growth is bounded by an LRU eviction policy with a configurable maximum. Token validation is extended to cover all payload fields. The double-append is eliminated by moving the trace call outside the try block. The key-generation race is resolved with a module-level promise lock. Type safety improvements use `as const` unions for error codes and stricter config typing.

---

## Progress

| # | Item | Description | Status |
|---|------|-------------|--------|
| 01 | Planning README | This document | ✅ Complete |
| 02 | Design philosophy | Guiding principles for changes | ⬚ Pending |
| 03 | Change plan | Detailed per-finding implementation plan | ⬚ Pending |
| 04 | Risk assessment | Risk analysis and mitigations | ⬚ Pending |
| 05 | Assumptions review | Assumptions and validation | ⬚ Pending |
| 06 | Implementation | Apply all 14 fixes | ⬚ Pending |
| 07 | Post-impl review | Change block index | ⬚ Pending |

---

## Links

| Resource | Link |
|----------|------|
| Tracking Issue | [#67](https://github.com/m2ux/workflow-server/issues/67) |
| WP-10 PR | [#77](https://github.com/m2ux/workflow-server/pull/77) |
| WP-10 Plan | [04-10-server-core-cleanup-plan.md](../2026-03-27-audit-remediation/04-10-server-core-cleanup-plan.md) |
| Engineering | [.engineering/](https://github.com/m2ux/workflow-server/tree/fix/wp10-server-core-cleanup/.engineering) |
