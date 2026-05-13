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
