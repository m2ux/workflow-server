# Test Plan: Session Token Size Optimization

**Engineering:** [README.md](README.md)
**Design philosophy:** [01-design-philosophy.md](01-design-philosophy.md)
**Work package plan:** [05-work-package-plan.md](05-work-package-plan.md)
**Branch:** `enhancement/session-token-size-optimization`
**PR:** *Pending — will be created during submit-for-review*

---

## Overview

This test plan validates the wire-format migration from JSON+hex to CBOR+base64url, the move of authoritative session state into `SessionStore`, the addition of the `sh` drift-detection field, the new error-class catalogue, and the `bind_session_path` MCP tool.

Key changes to validate:

1. `adoptStaleToken` — re-sign a stale token under the current key when the `sh` matches the server record (key-rotation recovery).
2. `decodeLegacyJsonToken` / `migrateLegacyToken` — detect a legacy JSON token and one-shot migrate it to the CBOR+`SessionStore` model.
3. `start_session` resume sub-flow — try `loadSession`, then `adoptStaleToken`, then `migrateLegacyToken`, then fall through to a fresh session.
4. `bind_session_path` MCP tool — relocate `SessionRecord` from global fallback to `<planning_folder>/.workflow/session.json`.
5. `SessionStore` — file-backed record with cross-FS-safe relocate, atomic writes, schema versioning, sid→path index.
6. `computeStateHash` — 128-bit truncated SHA-256 over canonical record concatenated with `seq`; binds the wire to the server record.
7. CBOR wire codec — 5-field fixed-schema encoder/decoder with integer keys.
8. Failure-class catalogue — distinct messages for the four classes (key rotation, state drift, missing state, concurrent advance) plus legacy-token migration.

---

## Test Strategy

- **Unit tests** cover the new modules and helpers in isolation. Phase 1 already landed 53 of these (`tests/wire-token.test.ts`, `tests/state-hash.test.ts`, `tests/session-store.test.ts`). This plan adds the unit tests required by Tasks 1–4.
- **Integration tests** cover the `start_session` resume path with all three sub-flows wired together, the `bind_session_path` tool against a real in-memory MCP server, and planning-folder deletion mid-session.
- **E2E tests** (Task 5) cover the full workflow lifecycle on a dedicated fixture, asserting wire-token shape, `SessionStore` location, `sh` verification, and both recovery paths through the public MCP surface.

Test infrastructure already in place from phase 2:

- `setDefaultSessionStore` / `getDefaultSessionStore` for per-test isolation against ephemeral `SessionStore` instances.
- `SessionView` type for asserting on the combined wire + record view.
- `scripts/generate-session-token.ts` for synthesizing tokens with known parent-stack depth.

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| TC-01 | Verify `adoptStaleToken` re-signs a stale token under the current key when `sh` matches the server record | Unit |
| TC-02 | Verify `adoptStaleToken` rejects when `sh` does not match (state drift) | Unit |
| TC-03 | Verify `adoptStaleToken` rejects when the `SessionRecord` is missing for the wire `sid` | Unit |
| TC-04 | Verify `adoptStaleToken` preserves `seq`, `ts`, `bcp`, and `sh` on the re-signed token | Unit |
| TC-05 | Verify `decodeLegacyJsonToken` returns the parsed payload for a well-formed legacy JSON token | Unit |
| TC-06 | Verify `decodeLegacyJsonToken` returns `null` for a CBOR-format token | Unit |
| TC-07 | Verify `migrateLegacyToken` round-trips a legacy token to a CBOR wire token with a populated `SessionRecord` | Integration |
| TC-08 | Verify `migrateLegacyToken` preserves parent context (`pwf`, `pact`, `psid`, `pv`) on migration | Integration |
| TC-09 | Verify `migrateLegacyToken` preserves `bcp` on migration | Integration |
| TC-10 | Verify `migrateLegacyToken` is idempotent — re-running on an already-migrated `sid` is a no-op | Integration |
| TC-11 | Verify `start_session` resume tries `loadSession` first and succeeds when HMAC and `sh` are valid | Integration |
| TC-12 | Verify `start_session` resume falls through to `adoptStaleToken` on HMAC failure when state exists | Integration |
| TC-13 | Verify `start_session` resume falls through to `migrateLegacyToken` on CBOR-decode failure with a legacy JSON token | Integration |
| TC-14 | Verify `start_session` resume falls through to a fresh session for terminally bad input | Integration |
| TC-15 | Verify `bind_session_path` happy path — relocates `SessionRecord` to `<path>/.workflow/session.json` | Unit |
| TC-16 | Verify `bind_session_path` rejects relative paths | Unit |
| TC-17 | Verify `bind_session_path` rejects paths containing `..` segments | Unit |
| TC-18 | Verify `bind_session_path` is idempotent — re-binding to the same path is a no-op | Unit |
| TC-19 | Verify `bind_session_path` advances the wire token by one `seq` and returns it via `_meta.session_token` | Integration |
| TC-20 | Verify `bind_session_path` performs a cross-filesystem relocate correctly | Integration |
| TC-21 | Verify deletion of the bound state file mid-session surfaces a clear "state file missing, restart required" error, not an opaque HMAC failure | Integration |
| TC-22 | Verify `SessionAdvance` no longer carries `skill` or `cond` after dead-code cleanup | Unit |
| TC-23 | Verify removed symbols (`decodeSessionToken`, `decodePayloadOnly`) are no longer importable | Unit |
| TC-24 | Verify tool-description strings for `start_session` and `next_activity` mention the four failure classes | Unit |
| TC-25 | Verify E2E fixture workflow exercises full lifecycle: fresh `start_session` → `bind_session_path` → activity steps → checkpoint yield/present/respond/resume → completion | E2E |
| TC-26 | Verify CBOR-decoded wire token contains exactly five integer keys (`1=sid`, `2=seq`, `3=ts`, `4=bcp`, `5=sh`) | E2E |
| TC-27 | Verify the on-wire `sh` length is 16 bytes and the HMAC tag base64url-decodes to 32 bytes | E2E |
| TC-28 | Verify `SessionStore` is at the global fallback location pre-`bind_session_path` and at the planning folder post-bind | E2E |
| TC-29 | Verify adoption recovery path triggers when the server key is rotated between two calls in the same fixture run | E2E |
| TC-30 | Verify legacy migration recovery path triggers when the server is fed a hand-crafted legacy JSON token | E2E |
| TC-31 | Verify wire-token size on a representative 10-deep parent-stack session is ≤ 140 bytes (target ≥ 70 % reduction) | E2E |
| TC-32 | Verify 308 pre-existing tests continue to pass after Tasks 1–4 land | Integration |

*Detailed steps, expected results, and source-line hyperlinks will be added by the finalize-documentation activity after implementation.*

---

## Acceptance Matrix

| Success criterion | Validated by |
|-------------------|--------------|
| Four failure classes distinguished | TC-01, TC-02, TC-03, TC-12, TC-13, TC-21, TC-29, TC-30 |
| Legacy tokens migrate cleanly on first contact | TC-05, TC-06, TC-07, TC-08, TC-09, TC-10, TC-13, TC-30 |
| `bind_session_path` relocates `SessionRecord` | TC-15, TC-19, TC-20, TC-28 |
| Meta workflow calls `bind_session_path` (manual verification via E2E run) | TC-25, TC-28 |
| No regression in pre-existing tests | TC-32 |
| Wire-token size ≥ 70 % reduction | TC-31 |
| Failure-class distinction (1 → 4) | TC-01 through TC-04, TC-12, TC-13, TC-21, TC-24, TC-29, TC-30 |
| ≥ 25 new tests added | TC-01 through TC-31 (31 new cases) |
| `npm run typecheck` clean | Verified after each task commit by the implement activity's task-cycle |
| `npm test` green | TC-32 plus all new cases |

---

## Running Tests

Test commands will be added by the finalize-documentation activity once the cases are wired up. The expected shape is:

```bash
# Run the full suite
npm test

# Run a single test file
npm test -- tests/staleness.test.ts
npm test -- tests/bind-path.test.ts
npm test -- tests/planning-folder-deleted.test.ts
npm test -- tests/e2e-session-token.test.ts

# Typecheck
npm run typecheck
```
