# Test Plan: Server-Managed Session State

**Engineering:** [README.md](README.md)
**Issue:** [#115](https://github.com/m2ux/workflow-server/issues/115)
**PR:** [#116](https://github.com/m2ux/workflow-server/pull/116)

---

## Overview

This test plan validates the workspace-aware MCP server refactor that gives the
server end-to-end authority over session state. The agent surface changes from
threading an opaque HMAC-signed `session_token` on every authenticated call to
passing a six-character `session_index`; the server owns `session.json` and a
sibling `.session-token` seal in the planning folder. Nested workflow parents
become recursive rather than single-level flattened.

Key changes to validate:

1. `WorkspaceConfig` — server boot accepts and validates a workspace argument
   (CLI flag + env var; CLI wins; startup error when neither is present).
2. `SessionIndex` — six-character base32 identifier derived as
   `base32(HMAC-SHA256(realpath(folder), secret)[0..4])`; deterministic;
   secret-bound; transcription-safe.
3. `SessionFile` — canonical `session.json` shape with recursive
   `parentSession`, `activeCheckpoint`, `schemaVersion: 1` root field.
4. `Seal` — `.session-token` holds raw HMAC hex over `session.json` bytes;
   tamper-detecting; whitespace-sensitive.
5. `SessionStore` — atomic write (`tmp` + fsync + rename) for state then seal;
   EXDEV fallback; folder enumeration for index → folder resolution.
6. `Authenticated tool API` — all 13 authenticated tools accept `session_index`
   instead of `session_token`; checkpoints route through `state.activeCheckpoint`.
7. `Audit / trace` — `withAuditLog` re-resolves the index and projects
   `sid`/`wf`/`act`/`aid` from the resolved `session.json`.
8. `Migration converter` — legacy `workflow-state.json` + `.session-token` pair
   converted to `session.json` + new seal pair; idempotent; detect-on-read.
9. `Dead-code removal` — `encryptToken`, `decryptToken`, `StateSaveFileSchema`
   absent post-refactor.
10. `Recursive parent chain` — `parentSession.parentSession.parentSession`
    preserved across three-level dispatch (A → B → C → D).
11. `Migration converter — full coverage` — the legacy `workflow-state.json`
    (3-field envelope), legacy sibling `.session-token`, and the older
    pre-split envelope form (with embedded `sessionToken` field) all
    convert correctly; idempotent on second invocation; clean cutover
    (legacy files removed, no coexistence period). Added in the plan
    revision to cover the back-compat surface explicitly.
12. `Transitional back-compat` — agents mid-migration that still pass
    `session_token` receive a clear error pointing at `session_index`.
    No silent failures during the cutover window.
13. `Doc-freshness CI gate` — automated grep for obsolete prose
    (`session_token`, `workflow-state.json`, `.session-token`,
    `parent_session_token`, `interceptor`) across `docs/`, `workflows/meta/`,
    `schemas/README.md`, and top-level markdown. Added as a manual gate
    for the #115 PR with follow-up plan for CI automation (S9).
14. `Operation-removal gate` — verify `workflow-engine::adopt-session`,
    `workflow-engine::restore`, `workflow-engine::persist` are not
    referenced anywhere after Phase 8.

*Detailed steps, expected results, and source links will be added after
implementation (per the test-plan lifecycle convention: initial placeholder at
PR creation; finalised after implementation with hyperlinks to actual test
locations).*

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR116-TC-01 | Verify server starts with `--workspace=PATH` CLI flag and exposes `workspaceDir` via config | Unit |
| PR116-TC-02 | Verify server starts with `WORKFLOW_WORKSPACE=PATH` env var when CLI flag absent | Unit |
| PR116-TC-03 | Verify CLI flag wins over env var when both are present (PD-1) | Unit |
| PR116-TC-04 | Verify server exits with a clear error at startup when neither workspace arg is provided | Unit |
| PR116-TC-05 | Verify `computeSessionIndex` returns 6-character uppercase RFC 4648 base32 for a given folder | Unit |
| PR116-TC-06 | Verify `computeSessionIndex` is deterministic — same folder + same secret → same index (SC-7) | Unit |
| PR116-TC-07 | Verify `computeSessionIndex` canonicalises symlinks via `fs.realpathSync` before hashing | Unit |
| PR116-TC-08 | Verify `computeSessionIndex` is secret-bound — index changes when secret changes | Unit |
| PR116-TC-09 | Verify base32 alphabet rejects ambiguous characters (`0189OIL`); only `A-Z2-7` accepted | Unit |
| PR116-TC-10 | Verify `resolveSessionIndex` returns the unique folder when exactly one match | Unit |
| PR116-TC-11 | Verify `resolveSessionIndex` errors with both candidate paths when two folders collide (SC-10, PD-4) | Unit |
| PR116-TC-12 | Verify `resolveSessionIndex` errors when no folder matches the requested index | Unit |
| PR116-TC-13 | Verify `writeSessionFile` writes `session.json` atomically via tmp + fsync + rename | Unit |
| PR116-TC-14 | Verify `writeSeal` writes `.session-token` atomically and only after `session.json` is in place | Unit |
| PR116-TC-15 | Verify EXDEV fallback (copy + fsync + unlink) when atomic rename fails across devices | Unit |
| PR116-TC-16 | Verify `verifySeal` succeeds for an untouched (`session.json`, `.session-token`) pair | Unit |
| PR116-TC-17 | Verify `verifySeal` returns a seal-mismatch error when `session.json` is hand-edited (SC-4) | Unit |
| PR116-TC-18 | Verify `verifySeal` returns a seal-mismatch error when whitespace in `session.json` changes | Unit |
| PR116-TC-19 | Verify file modes are `0600` on `session.json` and `.session-token` after write | Unit |
| PR116-TC-20 | Verify planning folder mode is `0700` when created by `start_session` | Unit |
| PR116-TC-21 | Verify `SessionFile` Zod schema accepts a minimal valid `session.json` with all required fields | Unit |
| PR116-TC-22 | Verify `SessionFile` rejects a payload missing `schemaVersion` | Unit |
| PR116-TC-23 | Verify `SessionFile` accepts recursive `parentSession` and round-trips through serialise/parse | Unit |
| PR116-TC-24 | Verify `SessionFile` round-trips a 3-level nested `parentSession.parentSession.parentSession` (SC-5) | Unit |
| PR116-TC-25 | Verify `safeValidateSessionFile` returns structured errors with field paths for invalid payloads | Unit |
| PR116-TC-26 | Verify `start_session(planning_slug, agent_id)` on a fresh slug creates the folder, writes `session.json`, returns a 6-char index (SC-6) | Integration |
| PR116-TC-27 | Verify `start_session` on an existing folder returns the existing `session_index` without rewriting state (SC-6) | Integration |
| PR116-TC-28 | Verify `start_session` is idempotent — two calls against the same slug return byte-identical indices (SC-7) | Integration |
| PR116-TC-29 | Verify `start_session(planning_slug, agent_id, parent_planning_slug)` captures parent snapshot under `parentSession` (R6) | Integration |
| PR116-TC-30 | Verify three-level dispatch (A → B → C → D) records full chain in D's `session.json` (SC-5) | Integration |
| PR116-TC-31 | Verify dispatch depth > 5 emits a soft warning in `_meta.validation` (PD-6) | Integration |
| PR116-TC-32 | Verify each authenticated tool (`get_workflow`, `next_activity`, `get_activity`, `yield_checkpoint`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint`, `get_trace`, `get_workflow_status`, `get_skills`, `get_skill`, `get_resource`) accepts `session_index` and rejects `session_token` | Integration |
| PR116-TC-33 | Verify every mutating authenticated tool writes new `session.json` + new `.session-token` atomically before returning success (SC-3) | Integration |
| PR116-TC-34 | Verify unauthenticated tools (`discover`, `list_workflows`, `health_check`, `resolve_operations`) still accept no session parameter | Integration |
| PR116-TC-35 | Verify `present_checkpoint` and `respond_checkpoint` accept only `session_index` and read active checkpoint from `state.activeCheckpoint` (PD-11) | Integration |
| PR116-TC-36 | Verify `MetaResponseSchema` no longer includes `session_token`; authenticated tool responses do not carry a token (R3) | Integration |
| PR116-TC-37 | Verify `withAuditLog` re-resolves `session_index` and populates trace event with `sid`/`wf`/`act`/`aid` from `session.json` (SC-12) | Integration |
| PR116-TC-38 | Verify trace events for unauthenticated tools omit session-derived fields without warning | Integration |
| PR116-TC-39 | Verify the legacy `workflow-state.json` + `.session-token` pair (3-field envelope) is converted to `session.json` + new seal on first authenticated call (SC-9) | Integration |
| PR116-TC-40 | Verify migration converter is idempotent — running on a folder containing `session.json` short-circuits (SC-9) | Integration |
| PR116-TC-41 | Verify migration converter handles this very work package's own `workflow-state.json` as a fixture (R1) | Integration |
| PR116-TC-42 | Verify server restart between two tool calls leaves session state intact — second call succeeds without recovery or re-signing (SC-8) | Integration |
| PR116-TC-43 | Verify hand-editing `session.json` between two tool calls causes the second call to fail with a seal-mismatch error (SC-4) | Integration |
| PR116-TC-44 | Verify killing the server between `session.json` rename and `.session-token` rename leaves a torn pair; next reader detects seal mismatch and fails fast | Integration |
| PR116-TC-45 | Verify full work-package flow (`start_session` → `get_workflow` → `next_activity` → `yield_checkpoint` → `respond_checkpoint` → `resume_checkpoint`) survives a server restart mid-flow | E2E |
| PR116-TC-46 | Verify `grep -rn 'session_token' src/` returns zero matches after refactor (SC-1) | Manual |
| PR116-TC-47 | Verify `grep -rn 'Write' workflows/meta/skills/00-workflow-engine.toon` returns no state-file write rules (SC-2) | Manual |
| PR116-TC-48 | Verify `grep -rn 'encryptToken\|decryptToken\|StateSaveFileSchema' src/` returns zero matches (SC-13) | Manual |
| PR116-TC-49 | Verify zero references to `session_token` in `docs/`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `schemas/README.md` (SC-11) | Manual |
| PR116-TC-50 | Verify `npm run typecheck && npm test` passes; test count at or above pre-refactor baseline (SC-14) | Manual |

### Phase-revision additions (sweep + migration + CI freshness gate)

Added after the `approach-confirmed` revise to cover the expanded sweep
phases (Phase 8.1–8.3, Phase 10.1–10.3) and migration / back-compat /
doc-freshness gates.

| Test ID | Objective | Type |
|---------|-----------|------|
| PR116-TC-51 | Verify migration converter successfully reads this work package's actual `workflow-state.json` fixture (~2 KB, 3-field envelope `{ stateVersion, savedAt, startedAt, state }`) and produces a `session.json` containing the full state plus `schemaVersion: 1`, `sessionIndex` matching the folder, and (when applicable) a `parentSession` snapshot reconstructed from the legacy `psid/pwf/pact/pv` fields decoded from the legacy `.session-token` (SC-9, R1) | Integration |
| PR116-TC-52 | Verify migration converter handles a legacy folder with **only `workflow-state.json` present** (no sibling `.session-token`) — the legacy `sessionToken` field embedded in the envelope (older format pre-split) is decoded as a fallback per `restore`'s "legacy planning folders pre-split" branch | Integration |
| PR116-TC-53 | Verify migration converter handles a legacy folder with **only `.session-token` present** (no `workflow-state.json`) — the converter detects the orphan token, treats the folder as a fresh session, and produces a minimal `session.json` re-seeded from the token payload | Integration |
| PR116-TC-54 | Verify migration converter is invoked automatically on `start_session` against a folder containing legacy artifacts; the agent does not need to call a separate migration tool | Integration |
| PR116-TC-55 | Verify migration converter leaves the legacy `workflow-state.json` removed and the new `session.json` + new `.session-token` seal in place after a successful conversion (clean cutover, no coexistence period — PD-7, S8) | Integration |
| PR116-TC-56 | Verify migration converter is **detect-on-read idempotent** — second call on the same folder short-circuits without re-reading the (now-removed) legacy artifacts (SC-9) | Integration |
| PR116-TC-57 | Verify migration converter rejects a folder where the legacy envelope decode fails (corrupt JSON, missing `state` field) — error surfaces with the legacy path and recovery guidance ("rerun against the most recent valid commit") | Integration |
| PR116-TC-58 | Verify migration converter rejects a legacy `.session-token` whose payload-only decode fails — error surfaces with the legacy path and recovery guidance | Integration |
| PR116-TC-59 | Verify transitional back-compat: a second authenticated call against a folder that was migrated by a previous `start_session` call (i.e., now contains `session.json`) succeeds without invoking the migration path again | Integration |
| PR116-TC-60 | Verify transitional back-compat: an authenticated call with a `session_token` parameter (legacy parameter name) returns a clear error pointing at the new `session_index` parameter — not a silent failure (helps users mid-migration spot the API change) | Integration |
| PR116-TC-61 | Verify CI doc-freshness gate (Phase 10.1): `grep -rn 'session_token' docs/ schemas/README.md README.md SETUP.md CLAUDE.md AGENTS.md` returns zero matches after the refactor (SC-11) | Manual (CI gate) |
| PR116-TC-62 | Verify CI doc-freshness gate: `grep -rn 'session_token\|workflow-state\.json\|\.session-token' workflows/meta/` returns zero matches after Phase 8 (SC-2 extension) | Manual (CI gate) |
| PR116-TC-63 | Verify CI doc-freshness gate: `grep -rn 'parent_session_token' .` excluding `workflows/workflow-design/` and historical planning folders returns zero matches | Manual (CI gate) |
| PR116-TC-64 | Verify CI doc-freshness gate: `grep -rn 'interceptor' docs/ README.md SETUP.md CLAUDE.md AGENTS.md` returns zero matches (Phase 10.3, S1) | Manual (CI gate) |
| PR116-TC-65 | Verify CI doc-freshness gate: the tool descriptions returned by `discover` and `get_resource` do not contain the string "session_token" or "interceptor" (regression-check on `src/tools/*.ts` description prose) | Integration |
| PR116-TC-66 | Verify the meta-workflow TOON files load without parse error after Phase 8 (the workflow-server loader will reject malformed TOON; this is a smoke test that the deletions and rewrites do not break the workflow definition) | Integration |
| PR116-TC-67 | Verify deleted operations `adopt-session`, `restore`, `persist` are not referenced anywhere — `grep -rn 'workflow-engine::adopt-session\|workflow-engine::restore\|workflow-engine::persist' workflows/` returns zero matches | Manual (CI gate) |
| PR116-TC-68 | Verify the `meta` workflow's variables (`workflows/meta/workflow.toon`) do not reference `saved_session_token`, `client_session_token`, `pending_checkpoint_handle`, `session_recovered`, `session_adopted` after Phase 8.2 | Manual (CI gate) |
| PR116-TC-69 | Verify the `workflows/meta/resources/` prompt files (`01-activity-worker-prompt.md`, `02-workflow-orchestrator-prompt.md`, `00-bootstrap-protocol.md`) do not contain `{session_token}` placeholders after Phase 8.3 | Manual (CI gate) |
| PR116-TC-70 | Verify the `workflows/meta/skills/00-workflow-engine.toon` file size shrinks by approximately 35-40% after Phase 8.1 (sanity check that the deletions actually happen — not a hard threshold) | Manual |

### CI doc-freshness gate (consolidated)

The `Manual (CI gate)` tests above (PR116-TC-61, -62, -63, -64, -67, -68,
-69) are candidates for a single CI workflow step that runs:

```bash
# Fail the build if any obsolete prose remains
! grep -rqn 'session_token\|workflow-state\.json\|\.session-token\|parent_session_token' \
    docs/ schemas/README.md README.md SETUP.md CLAUDE.md AGENTS.md workflows/meta/
! grep -rqn 'workflow-engine::adopt-session\|workflow-engine::restore\|workflow-engine::persist' workflows/
! grep -rqn 'interceptor' docs/ README.md SETUP.md CLAUDE.md AGENTS.md
```

Implementation of this CI gate as an automated step is **a follow-up
enhancement** (S9). For the #115 PR, the gates are verified manually in the
PR description's "What was verified" section. If a follow-up issue is filed,
reference `feat/115-server-managed-session-state` as the baseline that
established green status on each gate.

*Detailed steps, expected results, and source links will be added after implementation.*

---

## Running Tests

*Commands will be added after implementation. Expected form:*

```bash
# Run all tests
npm test

# Run unit tests for the new session-store module
npm test -- session-store

# Run integration tests
npm test -- mcp-server

# Run migration converter tests
npm test -- migration

# Typecheck
npm run typecheck
```

---

## Source links (post-implementation)

Test IDs in this plan were anchored as `PR116-TC-NN` markers in test source during development, then stripped in commit `ad23820` per review feedback (planning references kept out of merged source). The mapping below replaces the per-test grep with a file-level index, paired with the workflow phase the file covers.

> Links target the head of `feat/115-server-managed-session-state`; resolve against [`origin/main`](https://github.com/m2ux/workflow-server/tree/main) after merge.

| Test bucket | Test IDs | Source file | Phase |
|-------------|----------|-------------|-------|
| Workspace argument plumbing | TC-01 — TC-04 | [`tests/config.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/config.test.ts) | Phase 1 |
| `computeSessionIndex` derivation + base32 alphabet | TC-05 — TC-09 | [`tests/session-index.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/session-index.test.ts) | Phase 2 |
| `resolveSessionIndex` enumeration + collisions | TC-10 — TC-12 | [`tests/session-store.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/session-store.test.ts) | Phase 2 |
| Atomic write semantics + seal verification + file modes | TC-13 — TC-20 | [`tests/session-store.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/session-store.test.ts) | Phase 2 |
| `SessionFile` Zod schema | TC-21 — TC-25 | [`tests/session-schema.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/session-schema.test.ts) | Phase 3 |
| `start_session` (fresh + resume + nested + depth warning) | TC-26 — TC-31 | [`tests/mcp-server.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/mcp-server.test.ts) | Phase 5–6 |
| Authenticated tool API + checkpoint routing + audit | TC-32 — TC-38 | [`tests/mcp-server.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/mcp-server.test.ts) + [`tests/trace.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/trace.test.ts) | Phase 4 + 7 |
| Legacy migration converter | TC-39 — TC-41, TC-51 — TC-59 | [`tests/migration.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/migration.test.ts) + [`tests/mcp-server.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/mcp-server.test.ts) | Phase 9 |
| Restart transparency + torn-pair detection + E2E | TC-42 — TC-45 | [`tests/mcp-server.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/mcp-server.test.ts) | Phase 5–9 |
| Back-compat error for `session_token` parameter | TC-60 | [`tests/mcp-server.test.ts`](https://github.com/m2ux/workflow-server/blob/feat/115-server-managed-session-state/tests/mcp-server.test.ts) | Phase 4 |
| Doc-freshness / operation-removal CI gates (manual) | TC-46 — TC-50, TC-61 — TC-70 | Verified in [`10-validation-report.md`](10-validation-report.md) §"Success-Criteria Verification" | Phase 10.1 + Phase 8 |

Legacy migration fixture: [`tests/fixtures/legacy-session/`](https://github.com/m2ux/workflow-server/tree/feat/115-server-managed-session-state/tests/fixtures/legacy-session) — generic placeholder for the 3-field envelope + sibling token format (the original concrete fixture referenced this very work package's planning folder; replaced with a synthetic fixture per review feedback in commit `ad23820`).

### Final test result

`npx vitest run` → **315 passed / 2 skipped** across 13 test files (16.88s wall clock). The 2 skipped tests pre-date the refactor. Test count rose from the pre-refactor baseline of 256 by **+59 tests** for the new modules and integration cases. Every success criterion SC-1 through SC-18 is satisfied — see [10-validation-report.md](10-validation-report.md) for the SC-by-SC verification table.
